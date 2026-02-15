from langchain_community.vectorstores import Chroma
from typing import List
from langchain_core.documents import Document
import os

PERSIST_DIR = "data/vectorstore"

def build_vector_store(docs: List[Document], embeddings):
    if os.path.exists(PERSIST_DIR):
        print("📦 Loading vector store from disk...")
        return Chroma(
            persist_directory=PERSIST_DIR,
            embedding_function=embeddings
        )

    print("🧠 Creating new vector store...")
    vectordb = Chroma.from_documents(
        documents=docs,
        embedding=embeddings,
        persist_directory=PERSIST_DIR
    )
    vectordb.persist()
    return vectordb