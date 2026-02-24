"""
Document Ingestion Pipeline
Reads documents from various formats and converts them into embeddings for storage in vector database.
"""

import os
import logging
from pathlib import Path
from typing import List, Optional
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

from document_loader import DocumentLoader
from embeddings import EmbeddingsManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DocumentIngestionPipeline:
    """Pipeline for ingesting documents and creating embeddings."""
    
    def __init__(
        self,
        docs_path: str,
        vector_store_path: str,
        embedding_model: str,
        chunk_size: int = 800,
        chunk_overlap: int = 150,
    ):
        """
        Initialize the ingestion pipeline.
        
        Args:
            docs_path: Path to documents directory
            vector_store_path: Path where vector store will be persisted
            embedding_model: Name of embedding model to use
            chunk_size: Size of text chunks for splitting
            chunk_overlap: Overlap between chunks
        """
        self.docs_path = docs_path
        self.vector_store_path = vector_store_path
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        
        self.document_loader = DocumentLoader()
        self.embeddings_manager = EmbeddingsManager(embedding_model)
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", " ", ""]
        )
        
        logger.info(f"📂 Ingestion pipeline initialized")
        logger.info(f"   Documents path: {docs_path}")
        logger.info(f"   Vector store path: {vector_store_path}")
        logger.info(f"   Embedding model: {embedding_model}")
    
    def load_documents(self) -> List[Document]:
        """Load all documents from the configured directory."""
        if not os.path.exists(self.docs_path):
            logger.warning(f"📂 Documents directory not found: {self.docs_path}")
            logger.info(f"   Creating empty documents directory...")
            os.makedirs(self.docs_path, exist_ok=True)
            return []
        
        logger.info(f"📚 Loading documents from {self.docs_path}...")
        documents = self.document_loader.load_documents(self.docs_path)
        logger.info(f"✅ Loaded {len(documents)} documents")
        
        return documents
    
    def chunk_documents(self, documents: List[Document]) -> List[Document]:
        """Split documents into chunks."""
        if not documents:
            logger.warning("⚠️  No documents to chunk")
            return []
        
        logger.info(f"✂️  Chunking {len(documents)} documents...")
        chunks = self.text_splitter.split_documents(documents)
        logger.info(f"✅ Created {len(chunks)} chunks (original: {len(documents)} docs)")
        
        return chunks
    
    def create_vector_store(self, documents: List[Document]) -> Optional[Chroma]:
        """
        Create or load vector store with document embeddings.
        
        Args:
            documents: List of document chunks to embed
            
        Returns:
            Chroma vector store instance
        """
        if not documents:
            logger.error("❌ No documents provided for vector store creation")
            return None
        
        # Create vector store directory if it doesn't exist
        os.makedirs(self.vector_store_path, exist_ok=True)
        
        logger.info(f"🧠 Creating embeddings for {len(documents)} document chunks...")
        embeddings = self.embeddings_manager.get_embeddings()
        
        logger.info(f"💾 Building and persisting vector store...")
        vector_store = Chroma.from_documents(
            documents=documents,
            embedding=embeddings,
            persist_directory=self.vector_store_path
        )
        
        logger.info(f"✅ Vector store created and persisted at {self.vector_store_path}")
        return vector_store
    
    def ingest(self) -> Optional[Chroma]:
        """
        Run the complete ingestion pipeline.
        
        Returns:
            Chroma vector store instance, or None if ingestion fails
        """
        logger.info("🚀 Starting document ingestion pipeline...")
        
        # Step 1: Load documents
        documents = self.load_documents()
        if not documents:
            logger.warning("⚠️  No documents to ingest")
            return None
        
        # Step 2: Chunk documents
        chunks = self.chunk_documents(documents)
        if not chunks:
            logger.error("❌ Failed to chunk documents")
            return None
        
        # Step 3: Create vector store
        vector_store = self.create_vector_store(chunks)
        
        if vector_store:
            logger.info("✅ Document ingestion pipeline completed successfully!")
        else:
            logger.error("❌ Failed to create vector store")
        
        return vector_store
    
    def add_documents(self, doc_paths: List[str]) -> Optional[Chroma]:
        """
        Add new documents to existing vector store.
        
        Args:
            doc_paths: List of paths to new documents
            
        Returns:
            Updated Chroma vector store instance
        """
        logger.info(f"➕ Adding {len(doc_paths)} new documents...")
        
        # Load the specific documents
        new_documents = []
        for doc_path in doc_paths:
            docs = self.document_loader.load_document(doc_path)
            new_documents.extend(docs)
        
        if not new_documents:
            logger.warning("⚠️  No documents loaded from provided paths")
            return None
        
        # Chunk the new documents
        chunks = self.chunk_documents(new_documents)
        
        # Load existing vector store
        embeddings = self.embeddings_manager.get_embeddings()
        vector_store = Chroma(
            persist_directory=self.vector_store_path,
            embedding_function=embeddings
        )
        
        # Add new documents
        logger.info(f"📝 Adding {len(chunks)} chunks to vector store...")
        vector_store.add_documents(chunks)
        vector_store.persist()
        
        logger.info(f"✅ Successfully added documents to vector store")
        return vector_store


def main():
    """Main entry point for ingestion pipeline."""
    from backend.config import (
        BASE_DOCS_PATH,
        VECTOR_STORE_PATH,
        EMBEDDING_MODEL,
        CHUNK_SIZE,
        CHUNK_OVERLAP,
    )
    
    # Initialize pipeline
    pipeline = DocumentIngestionPipeline(
        docs_path=BASE_DOCS_PATH,
        vector_store_path=VECTOR_STORE_PATH,
        embedding_model=EMBEDDING_MODEL,
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )
    
    # Run ingestion
    vector_store = pipeline.ingest()
    
    if vector_store:
        logger.info("🎉 Ingestion completed successfully!")
        logger.info(f"Vector store contains embeddings for all documents")
    else:
        logger.error("🔴 Ingestion failed")


if __name__ == "__main__":
    main()
