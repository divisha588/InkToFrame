from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from backend.db.session import SessionLocal
from backend.db.models.user import User
from backend.auth.security import hash_password, verify_password, create_access_token
from backend.db.deps import get_db
from backend.auth.dependencies import get_current_user
from backend.db.models.qa import QuestionAnswer
from backend.ingest.ingestion import DocumentIngestionPipeline
from backend.retriever.retriever import get_retriever
from backend.llm.qa_chain import run_qa_groq
from backend.config import TOP_K, BASE_DOCS_PATH, VECTOR_STORE_PATH, EMBEDDING_MODEL, CHUNK_SIZE, CHUNK_OVERLAP
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Enterprise Knowledge Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

# --------- Global RAG objects ---------
retriever = None

class RegisterRequest(BaseModel):
    email: str
    password: str

# --------- Signup ---------
@app.post("/auth/register")
def register(payload: RegisterRequest):
    db = SessionLocal()

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="User exists")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()

    return {"message": "User created"}

class LoginRequest(BaseModel):
    email: str
    password: str

# --------- Login ---------
@app.post("/login")
def login(payload: LoginRequest):
    db = SessionLocal()
    user = db.query(User).filter(User.email == payload.email).first()
    db.close()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

# --------- Startup ---------
@app.on_event("startup")
def startup_event():
    global retriever

    print("🚀 Initializing RAG pipeline...")

    try:
        # Initialize pipeline with config paths
        pipeline = DocumentIngestionPipeline(
            docs_path=BASE_DOCS_PATH,
            vector_store_path=VECTOR_STORE_PATH,
            embedding_model=EMBEDDING_MODEL,
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
        )

        # Run complete ingestion: load → chunk → embed → vector store
        vector_store = pipeline.ingest()

        if vector_store:
            retriever = get_retriever(vector_store, TOP_K)
            print("✅ RAG pipeline ready")
        else:
            print("⚠️  Warning: No documents found for ingestion")
    except Exception as e:
        print(f"❌ Error initializing RAG pipeline: {str(e)}")
        print("   The /ask endpoint will not be available")


# --------- API models ---------
class AskRequest(BaseModel):
    question: str


class AskResponse(BaseModel):
    answer: str
    sources: list[str]


# --------- API ---------
@app.post("/ask", response_model=AskResponse)
def ask_question(
    payload: AskRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if retriever is None:
        return {"answer": "RAG not initialized", "sources": []}

    retrieved_docs = retriever.invoke(payload.question)
    answer = run_qa_groq(retrieved_docs, payload.question)

    # Extract source files from document metadata
    sources = list({d.metadata.get("source_file", "Unknown") for d in retrieved_docs})

    # ---- Persist to DB ----
    qa_log = QuestionAnswer(
        user_id=current_user.id,
        question=payload.question,
        answer=answer,
        sources=",".join(sources)
    )
    db.add(qa_log)
    db.commit()
    db.refresh(qa_log)


    return {
        "answer": answer,
        "sources": sources
    }
