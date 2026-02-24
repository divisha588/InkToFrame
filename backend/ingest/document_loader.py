"""
Document Loader Module
Handles loading documents from various formats (markdown, PDF, text, etc.)
"""

import os
import logging
from pathlib import Path
from typing import List, Optional
from langchain_core.documents import Document
from langchain_community.document_loaders import (
    TextLoader,
    UnstructuredMarkdownLoader,
    PyPDFLoader,
)

logger = logging.getLogger(__name__)


class DocumentLoader:
    """Load documents from various file formats."""
    
    # Supported file extensions
    SUPPORTED_FORMATS = {
        '.md': 'markdown',
        '.markdown': 'markdown',
        '.txt': 'text',
        '.pdf': 'pdf',
    }
    
    def load_documents(self, directory_path: str) -> List[Document]:
        """
        Load all supported documents from a directory recursively.
        
        Args:
            directory_path: Path to directory containing documents
            
        Returns:
            List of loaded documents
        """
        all_documents = []
        directory = Path(directory_path)
        
        if not directory.exists():
            logger.warning(f"⚠️  Directory does not exist: {directory_path}")
            return []
        
        logger.info(f"🔍 Scanning directory: {directory_path}")
        
        # Recursively find all supported files
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
        """
        Load a single document based on its file extension.
        
        Args:
            file_path: Path to the document file
            
        Returns:
            List of documents loaded from file
        """
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
            
            # Add source metadata
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
            
            # Add source metadata
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
            
            # Add source metadata
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
