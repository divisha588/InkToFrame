from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
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
from backend.config import TOP_K, BASE_DOCS_PATH, VECTOR_STORE_PATH, EMBEDDING_MODEL, CHUNK_SIZE, CHUNK_OVERLAP, GROQ_API_KEY, UPLOAD_DIR, ALLOWED_EXTENSIONS, MAX_FILE_SIZE
from backend.llm.document_conversation import convert_document_to_conversation
from backend.db.crud.conversation import ConversationCRUD
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
from pathlib import Path
from typing import Optional

app = FastAPI(
    title="Enterprise Knowledge Assistant",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

# --------- Global RAG objects ---------
retriever = None

# --------- Root endpoint ---------
@app.get("/")
def root():
    return {
        "message": "Knowledge Assistant API",
        "docs": "http://localhost:8000/docs",
        "status": "running"
    }

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

    print("🚀 Initializing application...")

    # Initialize database tables
    try:
        from backend.db.base import Base
        from backend.db.session import engine
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables initialized")
    except Exception as e:
        print(f"❌ Error initializing database: {str(e)}")

    # Initialize RAG pipeline
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

    # Create upload directory
    try:
        Path(UPLOAD_DIR).mkdir(exist_ok=True)
        print("✅ Upload directory ready")
    except Exception as e:
        print(f"❌ Error creating upload directory: {str(e)}")

    print("🎉 Application startup complete!")


# --------- API models ---------
class AskRequest(BaseModel):
    question: str


class AskResponse(BaseModel):
    answer: str
    sources: list[str]


# --------- Document Conversation API models ---------
class DocumentConversationRequest(BaseModel):
    file_path: str


class ConversationMessage(BaseModel):
    speaker: str
    message: str


class DocumentConversationResponse(BaseModel):
    summary: str
    analysis: str
    conversation: list[ConversationMessage]
    document_info: dict


class DocumentUploadResponse(BaseModel):
    document_id: int
    filename: str
    file_type: str
    file_size: int
    status: str


class ConversationListResponse(BaseModel):
    id: int
    title: str
    status: str
    created_at: str
    document_filename: str


class ConversationDetailResponse(BaseModel):
    id: int
    title: str
    summary: str
    analysis: str
    status: str
    created_at: str
    document_filename: str
    messages: list[ConversationMessage]


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


# --------- Document Conversation Endpoint ---------
@app.post("/convert-document", response_model=DocumentConversationResponse)
def convert_document_to_conversation_endpoint(
    payload: DocumentConversationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Convert a document (txt/pdf) into a conversational format.
    Steps:
    1. Load and analyze the document
    2. Generate summary and detailed analysis
    3. Convert content into natural conversation
    """
    try:
        result = convert_document_to_conversation(payload.file_path)

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        # Convert conversation list to proper format
        conversation_messages = [
            ConversationMessage(speaker=msg["speaker"], message=msg["message"])
            for msg in result["conversation"]
        ]

        return DocumentConversationResponse(
            summary=result["summary"],
            analysis=result["analysis"],
            conversation=conversation_messages,
            document_info=result["document_info"]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")


# --------- File Upload Endpoint ---------
@app.post("/upload-document", response_model=DocumentUploadResponse)
def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a document file (txt/pdf) for conversation conversion.
    """
    # Validate file type
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Supported types: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Validate file size
    file_content = file.file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
        )

    # Create upload directory if it doesn't exist
    upload_path = Path(UPLOAD_DIR)
    upload_path.mkdir(exist_ok=True)

    # Generate unique filename
    import uuid
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = upload_path / unique_filename

    # Save file
    with open(file_path, "wb") as f:
        f.write(file_content)

    # Get content preview for database
    content_preview = ""
    try:
        if file_ext == '.txt':
            content_preview = file_content.decode('utf-8')[:1000]
        # For PDF, we could extract text here, but for now we'll leave it empty
    except:
        pass

    # Create document record in database
    document = ConversationCRUD.create_document(
        db=db,
        user_id=current_user.id,
        filename=unique_filename,
        original_filename=file.filename,
        file_path=str(file_path),
        file_type=file_ext[1:],  # Remove the dot
        file_size=len(file_content),
        content_preview=content_preview
    )

    return DocumentUploadResponse(
        document_id=document.id,
        filename=file.filename,
        file_type=document.file_type,
        file_size=document.file_size,
        status=document.status
    )


# --------- Process Document to Conversation ---------
@app.post("/process-document/{document_id}")
def process_document_to_conversation(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Process an uploaded document into a conversation.
    This is an async operation that creates a conversation record.
    """
    # Get document
    document = ConversationCRUD.get_document_by_id(db, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if document.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Update document status to processing
    ConversationCRUD.update_document_status(db, document_id, "processing")

    try:
        # Process the document
        result = convert_document_to_conversation(document.file_path)

        if "error" in result:
            ConversationCRUD.update_document_status(db, document_id, "error", result["error"])
            raise HTTPException(status_code=400, detail=result["error"])

        # Create conversation record
        title = f"Conversation: {document.original_filename}"
        conversation = ConversationCRUD.create_conversation(
            db=db,
            user_id=current_user.id,
            document_id=document_id,
            title=title,
            summary=result["summary"],
            analysis=result["analysis"]
        )

        # Add conversation messages
        ConversationCRUD.add_conversation_messages(
            db=db,
            conversation_id=conversation.id,
            messages=result["conversation"]
        )

        # Update statuses
        ConversationCRUD.update_conversation_status(db, conversation.id, "completed")
        ConversationCRUD.update_document_status(db, document_id, "processed")

        return {
            "message": "Document processed successfully",
            "conversation_id": conversation.id,
            "document_id": document_id
        }

    except Exception as e:
        ConversationCRUD.update_document_status(db, document_id, "error", str(e))
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")


# --------- Get User Conversations ---------
@app.get("/conversations", response_model=list[ConversationListResponse])
def get_user_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all conversations for the current user."""
    conversations = ConversationCRUD.get_user_conversations(db, current_user.id)

    result = []
    for conv in conversations:
        document = ConversationCRUD.get_document_by_id(db, conv.document_id)
        result.append(ConversationListResponse(
            id=conv.id,
            title=conv.title,
            status=conv.status,
            created_at=conv.created_at.isoformat(),
            document_filename=document.original_filename if document else "Unknown"
        ))

    return result


# --------- Get Conversation Details ---------
@app.get("/conversation/{conversation_id}", response_model=ConversationDetailResponse)
def get_conversation_details(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific conversation."""
    conversation_data = ConversationCRUD.get_conversation_with_messages(db, conversation_id)

    if not conversation_data:
        raise HTTPException(status_code=404, detail="Conversation not found")

    conversation = conversation_data["conversation"]
    messages = conversation_data["messages"]

    # Check ownership
    if conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    document = ConversationCRUD.get_document_by_id(db, conversation.document_id)

    return ConversationDetailResponse(
        id=conversation.id,
        title=conversation.title,
        summary=conversation.summary,
        analysis=conversation.analysis,
        status=conversation.status,
        created_at=conversation.created_at.isoformat(),
        document_filename=document.original_filename if document else "Unknown",
        messages=[
            ConversationMessage(speaker=msg.speaker, message=msg.message)
            for msg in messages
        ]
    )
