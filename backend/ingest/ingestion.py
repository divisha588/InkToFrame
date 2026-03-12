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
from langchain_openai import OpenAIEmbeddings
from langchain_community.document_loaders import (
    TextLoader,
    UnstructuredMarkdownLoader,
    PyPDFLoader,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ============================================================================
# DOCUMENT LOADER - Load documents from various formats
# ============================================================================

class DocumentLoader:
    """Load documents from various file formats."""
    
    SUPPORTED_FORMATS = {
        '.md': 'markdown',
        '.markdown': 'markdown',
        '.txt': 'text',
        '.pdf': 'pdf',
    }
    
    def load_documents(self, directory_path: str) -> List[Document]:
        """Load all supported documents from a directory recursively."""
        all_documents = []
        directory = Path(directory_path)
        
        if not directory.exists():
            logger.warning(f"⚠️  Directory does not exist: {directory_path}")
            return []
        
        logger.info(f"🔍 Scanning directory: {directory_path}")
        
        for file_path in directory.rglob('*'):
            if file_path.is_file():
                suffix = file_path.suffix.lower()
                if suffix in self.SUPPORTED_FORMATS:
                    try:
                        docs = self.load_document(str(file_path))
                        if docs:
                            all_documents.extend(docs)
                            logger.info(f"✅ Loaded {len(docs)} chunks from {file_path.name}")
                    except Exception as e:
                        logger.error(f"❌ Error loading {file_path}: {str(e)}")
        
        return all_documents
    
    def load_document(self, file_path: str) -> List[Document]:
        """Load a single document based on its file extension."""
        file_path = Path(file_path)
        
        if not file_path.exists():
            logger.error(f"❌ File not found: {file_path}")
            return []
        
        suffix = file_path.suffix.lower()
        
        try:
            if suffix in ['.md', '.markdown']:
                return self._load_markdown(str(file_path))
            elif suffix == '.pdf':
                return self._load_pdf(str(file_path))
            elif suffix == '.txt':
                return self._load_text(str(file_path))
            else:
                logger.warning(f"⚠️  Unsupported file format: {suffix}")
                return []
        except Exception as e:
            logger.error(f"❌ Error loading document {file_path}: {str(e)}")
            return []
    
    def _load_markdown(self, file_path: str) -> List[Document]:
        """Load markdown files."""
        try:
            loader = UnstructuredMarkdownLoader(file_path)
            docs = loader.load()
            
            for doc in docs:
                doc.metadata['source_file'] = Path(file_path).name
                doc.metadata['file_type'] = 'markdown'
            
            return docs
        except Exception as e:
            logger.error(f"❌ Error loading markdown file {file_path}: {str(e)}")
            return []
    
    def _load_pdf(self, file_path: str) -> List[Document]:
        """Load PDF files."""
        try:
            loader = PyPDFLoader(file_path)
            docs = loader.load()
            
            for doc in docs:
                doc.metadata['source_file'] = Path(file_path).name
                doc.metadata['file_type'] = 'pdf'
            
            return docs
        except Exception as e:
            logger.error(f"❌ Error loading PDF file {file_path}: {str(e)}")
            return []
    
    def _load_text(self, file_path: str) -> List[Document]:
        """Load plain text files."""
        try:
            loader = TextLoader(file_path, encoding='utf-8')
            docs = loader.load()
            
            for doc in docs:
                doc.metadata['source_file'] = Path(file_path).name
                doc.metadata['file_type'] = 'text'
            
            return docs
        except Exception as e:
            logger.error(f"❌ Error loading text file {file_path}: {str(e)}")
            return []
    
    @staticmethod
    def get_supported_formats() -> dict:
        """Get dictionary of supported file formats."""
        return DocumentLoader.SUPPORTED_FORMATS.copy()


# ============================================================================
# EMBEDDINGS MANAGER - Create and manage embeddings
# ============================================================================

class EmbeddingsManager:
    """Manage embeddings creation using various embedding models."""
    
    AVAILABLE_MODELS = {
        'huggingface': {
            'all-MiniLM-L6-v2': 'all-MiniLM-L6-v2',
            'all-mpnet-base-v2': 'sentence-transformers/all-mpnet-base-v2',
            'multilingual-e5-small': 'intfloat/multilingual-e5-small',
            'multilingual-e5-large': 'intfloat/multilingual-e5-large',
        },
        'openai': {
            'text-embedding-3-small': 'text-embedding-3-small',
            'text-embedding-3-large': 'text-embedding-3-large',
            'text-embedding-ada-002': 'text-embedding-ada-002',
        }
    }
    
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2', model_type: str = 'huggingface'):
        """Initialize embeddings manager."""
        self.model_name = model_name
        self.model_type = model_type
        self._embeddings = None
        
        logger.info(f"🤖 Embeddings Manager initialized")
        logger.info(f"   Model: {model_name}")
        logger.info(f"   Type: {model_type}")
    
    def get_embeddings(self):
        """Get or create embeddings instance."""
        if self._embeddings is not None:
            return self._embeddings
        
        if self.model_type == 'openai':
            self._embeddings = self._get_openai_embeddings()
        else:
            self._embeddings = self._get_huggingface_embeddings()
        
        return self._embeddings
    
    def _get_huggingface_embeddings(self):
        """Create HuggingFace embeddings."""
        logger.info(f"📦 Loading HuggingFace embeddings model: {self.model_name}")
        
        try:
            embeddings = HuggingFaceEmbeddings(
                model_name=self.model_name,
                model_kwargs={'device': 'cpu'},
            )
            logger.info(f"✅ Successfully loaded HuggingFace embeddings")
            return embeddings
        except Exception as e:
            logger.error(f"❌ Error loading HuggingFace embeddings: {str(e)}")
            logger.info(f"⚠️  Falling back to default model: all-MiniLM-L6-v2")
            return HuggingFaceEmbeddings(
                model_name='all-MiniLM-L6-v2',
                model_kwargs={'device': 'cpu'},
            )
    
    def _get_openai_embeddings(self):
        """Create OpenAI embeddings."""
        logger.info(f"🔑 Loading OpenAI embeddings model: {self.model_name}")
        
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            logger.error("❌ OPENAI_API_KEY environment variable not set")
            raise ValueError("OPENAI_API_KEY environment variable is required for OpenAI embeddings")
        
        try:
            embeddings = OpenAIEmbeddings(
                model=self.model_name,
                api_key=api_key,
            )
            logger.info(f"✅ Successfully loaded OpenAI embeddings")
            return embeddings
        except Exception as e:
            logger.error(f"❌ Error loading OpenAI embeddings: {str(e)}")
            raise
    
    @staticmethod
    def get_available_models(model_type: str = 'huggingface') -> dict:
        """Get list of available embedding models."""
        return EmbeddingsManager.AVAILABLE_MODELS.get(
            model_type, 
            EmbeddingsManager.AVAILABLE_MODELS['huggingface']
        )
    
    @staticmethod
    def validate_model(model_name: str, model_type: str = 'huggingface') -> bool:
        """Validate if a model is available."""
        available = EmbeddingsManager.get_available_models(model_type)
        return model_name in available.values() or model_name in available.keys()


# ============================================================================
# DOCUMENT INGESTION PIPELINE - Main orchestrator
# ============================================================================


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
