import os

BASE_DOCS_PATH = "./docs"   # Documents directory (relative to project root)
VECTOR_STORE_PATH = "./vector_store"

# File upload configuration
UPLOAD_DIR = "./uploads"
ALLOWED_EXTENSIONS = {'.txt', '.pdf'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

EMBEDDING_MODEL = "all-MiniLM-L6-v2"
LLM_MODEL = "gpt-4o-mini"   # or Azure equivalent

# API Keys
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

CHUNK_SIZE = 800
CHUNK_OVERLAP = 150
TOP_K = 4
