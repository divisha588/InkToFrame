from langchain_community.vectorstores import Chroma
from typing import List
from langchain_core.documents import Document
import os
from backend.config import VECTOR_STORE_PATH

def build_vector_store(docs: List[Document], embeddings):
    """Build or load a Chroma vector store from persisted location."""
    persist_dir = VECTOR_STORE_PATH
    
    if os.path.exists(persist_dir):
        print("📦 Loading vector store from disk...")
        return Chroma(
            persist_directory=persist_dir,
            embedding_function=embeddings
        )

    print("🧠 Creating new vector store...")
    vectordb = Chroma.from_documents(
        documents=docs,
        embedding=embeddings,
        persist_directory=persist_dir
    )
    vectordb.persist()
    return vectordb