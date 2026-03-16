# Document Conversation Converter

This feature converts documents (TXT/PDF) into conversational format through a three-step process:

1. **Document Analysis**: Breaks down the document into a summary and detailed analysis
2. **Content Understanding**: Analyzes every detail and key information
3. **Conversation Generation**: Converts the content into a natural, engaging conversation

## Features

- Supports both `.txt` and `.pdf` file formats
- Generates comprehensive summaries and analysis
- Converts document content into natural conversations
- Preserves all important information and understanding
- Handles API availability gracefully with fallback mock data

## Setup

1. Install dependencies:
```bash
pip install -r backend/requirements.txt
```

2. Set up environment variables:
```bash
export GROQ_API_KEY="your-groq-api-key-here"
```

## Usage

### Test with Dummy Document

Run the test script to see the feature in action:

```bash
python test_document_conversation.py
```

This will process the included `dummy_document.txt` (a comprehensive guide on AI, ML, and Python) and display:
- Document summary
- Detailed analysis
- Conversational format of the content

### Using in Code

```python
from backend.llm.document_conversation import DocumentConversationConverter

# Initialize converter
converter = DocumentConversationConverter()

# Process a document
result = converter.process_document("path/to/your/document.txt")

# Access results
print("Summary:", result["summary"])
print("Analysis:", result["analysis"])
print("Conversation:", result["conversation"])
```

## Output Format

The conversation output follows this structure:

```
💬 CONVERSATION:
--------------------

1. Speaker A: Opening message about the document topic
2. Speaker B: Question or follow-up
3. Speaker A: Detailed explanation covering key points
...
```

## API Requirements

- **Groq API**: For AI-powered summary, analysis, and conversation generation
- **Fallback Mode**: If API is unavailable, provides mock responses for testing

## File Structure

```
backend/llm/document_conversation.py    # Main converter class
backend/ingest/ingestion.py           # Document loading utilities
test_document_conversation.py         # Test script
dummy_document.txt                    # Sample document for testing
```

## Error Handling

The system gracefully handles:
- Missing API keys (falls back to demo mode)
- Unsupported file formats
- Document loading errors
- API communication failures

## Maturity Status

The code is production-ready with:
- Comprehensive error handling
- Fallback mechanisms
- Proper configuration management
- Clean separation of concerns
- Extensive documentation