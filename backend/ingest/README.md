# Document Ingestion Pipeline

This module provides a complete pipeline for reading documents and converting them into embeddings for vector storage.

## Features

- **Multi-format Support**: Loads documents in Markdown, PDF, and plain text formats
- **Intelligent Chunking**: Automatically splits documents into optimized chunks for embedding
- **Flexible Embeddings**: Supports both HuggingFace and OpenAI embedding models
- **Persistent Storage**: Stores embeddings in Chroma vector database for efficient retrieval
- **Incremental Updates**: Add new documents to existing vector stores
- **Comprehensive Logging**: Detailed logging throughout the ingestion process

## Components

### 1. **DocumentIngestionPipeline** (`ingestion.py`)
Main orchestrator that coordinates the entire ingestion workflow:
- Loads documents from disk
- Chunks documents into optimal sizes
- Creates embeddings
- Persists to vector store

### 2. **DocumentLoader** (`document_loader.py`)
Handles loading documents from various file formats:
- **Markdown** (.md, .markdown) - via UnstructuredMarkdownLoader
- **PDF** (.pdf) - via PyPDFLoader
- **Plain Text** (.txt) - via TextLoader

### 3. **EmbeddingsManager** (`embeddings.py`)
Manages embedding model creation and caching:
- **HuggingFace Models**: 
  - `all-MiniLM-L6-v2` (default, fast, good quality)
  - `all-mpnet-base-v2` (slower, better quality)
  - Multilingual models available
- **OpenAI Models**:
  - `text-embedding-3-small` / `text-embedding-3-large`
  - Requires OPENAI_API_KEY environment variable

### 4. **Utils** (`utils.py`)
Helper functions for statistics and directory management

## Configuration

The pipeline reads settings from `backend/config.py`:

```python
BASE_DOCS_PATH = "../docs"          # Document source directory
VECTOR_STORE_PATH = "./vector_store" # Where embeddings are stored
EMBEDDING_MODEL = "all-MiniLM-L6-v2" # Embedding model to use
CHUNK_SIZE = 800                     # Characters per chunk
CHUNK_OVERLAP = 150                  # Overlap between chunks
```

## Usage

### Basic Usage - Run Full Pipeline

```python
from backend.ingest import DocumentIngestionPipeline
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
```

### Command Line Usage

```bash
# From the ingest directory
python ingestion.py
```

### Add New Documents

```python
# Add new documents to existing vector store
pipeline = DocumentIngestionPipeline(...)
vector_store = pipeline.add_documents([
    '/path/to/new_doc1.md',
    '/path/to/new_doc2.pdf'
])
```

### Get Document Statistics

```python
from backend.ingest import get_document_stats

documents = loader.load_documents(docs_path)
stats = get_document_stats(documents)
print(f"Total documents: {stats['total_documents']}")
print(f"Total tokens: {stats['total_tokens']}")
```

## Directory Structure

```
backend/ingest/
├── __init__.py              # Module exports
├── ingestion.py             # Main pipeline orchestrator
├── document_loader.py       # Document format handlers
├── embeddings.py            # Embedding model management
├── utils.py                 # Utility functions
└── README.md                # This file
```

## Document Format Support

| Format | Extension | Handler | Notes |
|--------|-----------|---------|-------|
| Markdown | .md, .markdown | UnstructuredMarkdownLoader | Confluence exports |
| PDF | .pdf | PyPDFLoader | Scanned PDFs also supported |
| Plain Text | .txt | TextLoader | UTF-8 encoded |

## Embedding Models

### HuggingFace (Default, No API Key Required)

```python
# Fast & lightweight (recommended for most use cases)
'all-MiniLM-L6-v2'

# Slower but higher accuracy
'all-mpnet-base-v2'

# Multilingual support
'multilingual-e5-small'
'multilingual-e5-large'
```

### OpenAI (Requires API Key)

```python
# Requires: export OPENAI_API_KEY="your-key-here"
'text-embedding-3-small'  # Fast, cheap
'text-embedding-3-large'  # High quality
```

## Performance Tuning

### Chunking Parameters
- **CHUNK_SIZE**: 
  - Smaller (400-600): More detailed chunks, higher accuracy
  - Larger (1000+): Fewer chunks, faster processing
  - Default 800: Good balance
  
- **CHUNK_OVERLAP**: 
  - Prevents context loss at chunk boundaries
  - Default 150: Works well for most cases

### Embedding Model Selection
- **HuggingFace `all-MiniLM-L6-v2`**: Best for speed/quality balance
- **HuggingFace `all-mpnet-base-v2`**: Best for accuracy
- **OpenAI Models**: Best quality but requires API calls

## Troubleshooting

### Documents Not Loading
```python
# Check if directory exists
import os
print(os.path.exists("../docs"))

# Verify supported formats
from backend.ingest import DocumentLoader
print(DocumentLoader.get_supported_formats())
```

### Embedding Model Issues
```python
# Check available models
from backend.ingest import EmbeddingsManager
print(EmbeddingsManager.get_available_models())

# Validate model
is_valid = EmbeddingsManager.validate_model('all-MiniLM-L6-v2')
```

### Vector Store Corruption
```python
# Delete and rebuild vector store
import shutil
shutil.rmtree('./vector_store')
pipeline.ingest()  # Will rebuild from scratch
```

## Dependencies

All required packages are in `requirements.txt`:
- `langchain` - Core framework
- `langchain-community` - Document loaders
- `langchain-openai` - OpenAI embeddings
- `chromadb` - Vector database
- `sentence-transformers` - HuggingFace embeddings
- `markdown` - Markdown parsing

## Next Steps

1. Place your documents in the `docs/` directory
2. Configure settings in `backend/config.py` if needed
3. Run the ingestion pipeline
4. Use the vector store in your retriever/QA chain
