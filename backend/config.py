import os

BASE_DOCS_PATH = "./docs"   # Documents directory (relative to project root)
VECTOR_STORE_PATH = "./vector_store"

EMBEDDING_MODEL = "all-MiniLM-L6-v2"
LLM_MODEL = "gpt-4o-mini"   # or Azure equivalent

CHUNK_SIZE = 800
CHUNK_OVERLAP = 150
TOP_K = 4
