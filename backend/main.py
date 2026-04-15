import os
import uuid
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_user
from backend.auth.security import create_access_token, hash_password, verify_password
from backend.config import (
    BASE_DOCS_PATH,
    CHUNK_OVERLAP,
    CHUNK_SIZE,
    EMBEDDING_MODEL,
    TOP_K,
    VECTOR_STORE_PATH,
)
from backend.db.deps import get_db
from backend.db.init_db import init_db
from backend.db.models.qa import QuestionAnswer
from backend.db.models.user import User
from backend.db.session import SessionLocal
from backend.ingest.ingestion import DocumentIngestionPipeline
from backend.llm.qa_chain import run_qa_groq
from backend.retriever.retriever import get_retriever

app = FastAPI(title="Enterprise Knowledge Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
SECRET_KEY = os.getenv("JWT_SECRET", "dev-secret")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

# --------- Global RAG objects ---------
retriever = None
anonymous_upload_counts: dict[str, int] = {}


class RegisterRequest(BaseModel):
    email: str
    password: str


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


@app.post("/login")
def login(payload: LoginRequest):
    db = SessionLocal()
    user = db.query(User).filter(User.email == payload.email).first()
    db.close()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@app.on_event("startup")
def startup_event():
    global retriever

    init_db()
    print("🚀 Initializing RAG pipeline...")

    try:
        pipeline = DocumentIngestionPipeline(
            docs_path=BASE_DOCS_PATH,
            vector_store_path=VECTOR_STORE_PATH,
            embedding_model=EMBEDDING_MODEL,
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
        )

        vector_store = pipeline.ingest()

        if vector_store:
            retriever = get_retriever(vector_store, TOP_K)
            print("✅ RAG pipeline ready")
        else:
            print("⚠️  Warning: No documents found for ingestion")
    except Exception as e:
        print(f"❌ Error initializing RAG pipeline: {str(e)}")
        print("   The /ask endpoint will not be available")


class AskRequest(BaseModel):
    question: str


class AskResponse(BaseModel):
    answer: str
    sources: list[str]


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

    sources = list({d.metadata.get("source_file", "Unknown") for d in retrieved_docs})

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


def get_user_from_token(authorization: Optional[str]) -> Optional[User]:
    if not authorization:
        return None

    if not authorization.lower().startswith("bearer "):
        return None

    token = authorization.split(" ", 1)[1].strip()

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
        return None

    db = SessionLocal()
    user = db.query(User).filter(User.id == int(user_id)).first()
    db.close()
    return user


def convert_document_content(content: str, filename: str) -> str:
    normalized = " ".join(content.split())
    if not normalized:
        return f"Converted output for {filename}: no readable content found."

    preview = normalized[:1800]
    sentences = [s.strip() for s in preview.replace("?", ".").replace("!", ".").split(".") if s.strip()]

    bullets = "\n".join(f"- {s}" for s in sentences[:6])
    return (
        f"# Converted: {filename}\n\n"
        "This is the model-generated conversion output:\n\n"
        f"{bullets}\n"
    )


@app.post("/convert-doc")
async def convert_doc(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(default=None),
    x_session_id: Optional[str] = Header(default=None),
):
    global retriever

    user = get_user_from_token(authorization)
    session_id = x_session_id or str(uuid.uuid4())

    if user is None and anonymous_upload_counts.get(session_id, 0) >= 1:
        raise HTTPException(
            status_code=401,
            detail="Login required: anonymous users can convert only one document."
        )

    raw = await file.read()
    suffix = Path(file.filename or "uploaded.txt").suffix.lower()

    text = ""
    if suffix in {".txt", ".md", ".markdown"}:
        text = raw.decode("utf-8", errors="ignore")
    else:
        text = raw.decode("utf-8", errors="ignore")

    converted_output = convert_document_content(text, file.filename or "document")

    docs_dir = Path(BASE_DOCS_PATH)
    docs_dir.mkdir(parents=True, exist_ok=True)
    save_path = docs_dir / f"{uuid.uuid4()}_{file.filename}"
    save_path.write_bytes(raw)

    try:
        pipeline = DocumentIngestionPipeline(
            docs_path=BASE_DOCS_PATH,
            vector_store_path=VECTOR_STORE_PATH,
            embedding_model=EMBEDDING_MODEL,
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
        )
        vector_store = pipeline.add_documents([str(save_path)])
        if vector_store:
            retriever = get_retriever(vector_store, TOP_K)
    except Exception as exc:
        converted_output += f"\n\n(Embedding update skipped: {exc})"

    if user is None:
        anonymous_upload_counts[session_id] = anonymous_upload_counts.get(session_id, 0) + 1

    return {
        "session_id": session_id,
        "filename": file.filename,
        "converted_output": converted_output,
        "used_guest_uploads": anonymous_upload_counts.get(session_id, 0),
        "is_authenticated": user is not None,
    }


FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")


@app.get("/")
def serve_homepage():
    return FileResponse(FRONTEND_DIR / "index.html")


@app.get("/login-page")
def serve_login_page():
    return FileResponse(FRONTEND_DIR / "login.html")
