"""
Utility functions for document ingestion.
"""

import logging
from pathlib import Path
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


def get_document_stats(documents: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate statistics about documents.
    
    Args:
        documents: List of documents
        
    Returns:
        Dictionary with document statistics
    """
    if not documents:
        return {
            'total_documents': 0,
            'total_tokens': 0,
            'avg_tokens_per_doc': 0,
            'file_types': {}
        }
    
    total_tokens = sum(
        len(doc.get('page_content', '').split()) 
        for doc in documents
    )
    
    file_types = {}
    for doc in documents:
        file_type = doc.get('metadata', {}).get('file_type', 'unknown')
        file_types[file_type] = file_types.get(file_type, 0) + 1
    
    return {
        'total_documents': len(documents),
        'total_tokens': total_tokens,
        'avg_tokens_per_doc': total_tokens / len(documents) if documents else 0,
        'file_types': file_types
    }


def print_document_stats(documents: List[Dict[str, Any]]) -> None:
    """
    Print formatted document statistics.
    
    Args:
        documents: List of documents
    """
    stats = get_document_stats(documents)
    
    logger.info("📊 Document Statistics:")
    logger.info(f"   Total documents: {stats['total_documents']}")
    logger.info(f"   Total tokens: {stats['total_tokens']}")
    logger.info(f"   Avg tokens per document: {stats['avg_tokens_per_doc']:.2f}")
    logger.info(f"   File types: {stats['file_types']}")


def setup_logging(level=logging.INFO) -> None:
    """
    Setup logging configuration.
    
    Args:
        level: Logging level
    """
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )


def ensure_directory_exists(directory_path: str) -> bool:
    """
    Ensure a directory exists, creating it if necessary.
    
    Args:
        directory_path: Path to directory
        
    Returns:
        True if directory exists or was created, False otherwise
    """
    try:
        Path(directory_path).mkdir(parents=True, exist_ok=True)
        logger.info(f"✅ Directory ready: {directory_path}")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to create directory {directory_path}: {str(e)}")
        return False
