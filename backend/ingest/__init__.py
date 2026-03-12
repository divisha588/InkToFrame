"""
Document Ingestion Module
Provides utilities for loading documents and converting them into embeddings for vector storage.
"""

from .ingestion import (
    DocumentIngestionPipeline,
    DocumentLoader,
    EmbeddingsManager,
)
from .utils import (
    get_document_stats,
    print_document_stats,
    setup_logging,
    ensure_directory_exists,
)

__all__ = [
    'DocumentIngestionPipeline',
    'DocumentLoader',
    'EmbeddingsManager',
    'get_document_stats',
    'print_document_stats',
    'setup_logging',
    'ensure_directory_exists',
]
