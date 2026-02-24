"""
Embeddings Manager Module
Handles creation and management of embeddings using various models.
"""

import logging
from typing import Optional
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_openai import OpenAIEmbeddings
import os

logger = logging.getLogger(__name__)


class EmbeddingsManager:
    """Manage embeddings creation using various embedding models."""
    
    # Available embedding models
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
        """
        Initialize embeddings manager.
        
        Args:
            model_name: Name of the embedding model
            model_type: Type of model ('huggingface' or 'openai')
        """
        self.model_name = model_name
        self.model_type = model_type
        self._embeddings = None
        
        logger.info(f"🤖 Embeddings Manager initialized")
        logger.info(f"   Model: {model_name}")
        logger.info(f"   Type: {model_type}")
    
    def get_embeddings(self):
        """
        Get or create embeddings instance.
        
        Returns:
            Embeddings instance (HuggingFaceEmbeddings or OpenAIEmbeddings)
        """
        if self._embeddings is not None:
            return self._embeddings
        
        if self.model_type == 'openai':
            self._embeddings = self._get_openai_embeddings()
        else:
            self._embeddings = self._get_huggingface_embeddings()
        
        return self._embeddings
    
    def _get_huggingface_embeddings(self):
        """
        Create HuggingFace embeddings.
        
        Returns:
            HuggingFaceEmbeddings instance
        """
        logger.info(f"📦 Loading HuggingFace embeddings model: {self.model_name}")
        
        try:
            embeddings = HuggingFaceEmbeddings(
                model_name=self.model_name,
                model_kwargs={'device': 'cpu'},  # Use 'cuda' for GPU
            )
            logger.info(f"✅ Successfully loaded HuggingFace embeddings")
            return embeddings
        
        except Exception as e:
            logger.error(f"❌ Error loading HuggingFace embeddings: {str(e)}")
            # Fallback to default model
            logger.info(f"⚠️  Falling back to default model: all-MiniLM-L6-v2")
            return HuggingFaceEmbeddings(
                model_name='all-MiniLM-L6-v2',
                model_kwargs={'device': 'cpu'},
            )
    
    def _get_openai_embeddings(self):
        """
        Create OpenAI embeddings.
        
        Returns:
            OpenAIEmbeddings instance
        """
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
        """
        Get list of available embedding models.
        
        Args:
            model_type: Type of models to list ('huggingface' or 'openai')
            
        Returns:
            Dictionary of available models
        """
        return EmbeddingsManager.AVAILABLE_MODELS.get(
            model_type, 
            EmbeddingsManager.AVAILABLE_MODELS['huggingface']
        )
    
    @staticmethod
    def validate_model(model_name: str, model_type: str = 'huggingface') -> bool:
        """
        Validate if a model is available.
        
        Args:
            model_name: Name of the model
            model_type: Type of model
            
        Returns:
            True if model is available, False otherwise
        """
        available = EmbeddingsManager.get_available_models(model_type)
        return model_name in available.values() or model_name in available.keys()
