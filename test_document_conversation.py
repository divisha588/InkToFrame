#!/usr/bin/env python3
"""
Test script for Document Conversation Converter
Tests the feature to convert documents into conversational format.
"""

import sys
import os
from pathlib import Path

# Add the backend directory to the Python path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

try:
    from llm.document_conversation import DocumentConversationConverter
    IMPORTS_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Could not import required modules: {e}")
    print("Running in demo mode with mock data...")
    IMPORTS_AVAILABLE = False


def test_document_conversation():
    """Test the document conversation conversion feature."""

    # Path to the dummy document
    dummy_doc_path = Path(__file__).parent / "dummy_document.txt"

    if not dummy_doc_path.exists():
        print(f"❌ Dummy document not found at: {dummy_doc_path}")
        return

    print("🚀 Starting Document Conversation Test")
    print(f"📄 Processing document: {dummy_doc_path}")
    print("=" * 60)

    if not IMPORTS_AVAILABLE:
        # Run demo mode
        print("📊 DOCUMENT PROCESSING RESULTS (DEMO MODE)")
        print("=" * 60)

        # Mock results
        mock_result = {
            "summary": "This document provides a comprehensive overview of Artificial Intelligence, Machine Learning, and Python programming. It covers the historical development of AI, different types of artificial intelligence, machine learning algorithms, and Python's role in modern AI applications.",
            "analysis": "The document is well-structured with clear sections covering AI history, ML fundamentals, Python libraries, and practical applications. It discusses Narrow AI, General AI, and Superintelligent AI, along with supervised, unsupervised, and reinforcement learning approaches. The analysis includes essential Python libraries like NumPy, Pandas, TensorFlow, and PyTorch, making it a valuable resource for understanding the AI/ML ecosystem.",
            "conversation": [
                {"speaker": "Alex", "message": "Hey Sarah, I've been reading this fascinating document about AI, Machine Learning, and Python. It really covers a lot of ground!"},
                {"speaker": "Sarah", "message": "Oh really? That sounds interesting. What are the main points it covers?"},
                {"speaker": "Alex", "message": "Well, it starts with the history of AI, going back to the Dartmouth Conference in 1956. It talks about how AI has evolved through different phases, including the 'AI winters' in the 70s and 90s."},
                {"speaker": "Sarah", "message": "AI winters? What's that about?"},
                {"speaker": "Alex", "message": "Basically periods where AI research lost funding because expectations were too high and results didn't match. But now we're in a renaissance thanks to better computing power and data availability."},
                {"speaker": "Sarah", "message": "Makes sense. What about the different types of AI?"},
                {"speaker": "Alex", "message": "It categorizes AI into Narrow AI (like Siri or recommendation systems), General AI (which doesn't exist yet), and Superintelligent AI (which could surpass human intelligence)."},
                {"speaker": "Sarah", "message": "That superintelligent AI sounds both exciting and scary. What about machine learning?"},
                {"speaker": "Alex", "message": "ML is described as the engine of modern AI. It covers supervised learning (with labeled data), unsupervised learning (finding patterns), and reinforcement learning (learning through trial and error)."},
                {"speaker": "Sarah", "message": "And Python's role in all this?"},
                {"speaker": "Alex", "message": "Python is positioned as the de facto language for AI/ML. It mentions libraries like NumPy, Pandas, TensorFlow, PyTorch, and Scikit-learn. The document explains why Python is so popular - its readable syntax, rich ecosystem, and community support."},
                {"speaker": "Sarah", "message": "That sounds comprehensive. What about applications and challenges?"},
                {"speaker": "Alex", "message": "It covers applications in healthcare, finance, transportation, and more. But it also discusses challenges like data privacy, algorithmic bias, job displacement, and the need for ethical AI development."},
                {"speaker": "Sarah", "message": "This document seems really thorough. It even talks about future directions like explainable AI and quantum computing."},
                {"speaker": "Alex", "message": "Exactly! It concludes by emphasizing the need to balance innovation with ethical considerations. Pretty thought-provoking stuff."}
            ],
            "document_info": {
                "file_path": str(dummy_doc_path),
                "file_name": "dummy_document.txt",
                "file_type": "text",
                "total_chunks": 1
            }
        }

        _display_results(mock_result)
        print("\n" + "=" * 60)
        print("✅ Demo completed successfully!")
        print("Note: Install required dependencies and set GROQ_API_KEY for full functionality.")
        return

    # Initialize the converter
    converter = DocumentConversationConverter()

    try:
        # Process the document
        result = converter.process_document(str(dummy_doc_path))

        # Check for errors
        if "error" in result:
            print(f"❌ Error processing document: {result['error']}")
            return

        # Display the results
        _display_results(result)

        print("\n" + "=" * 60)
        print("✅ Document conversation conversion completed successfully!")

    except Exception as e:
        print(f"❌ Error during processing: {str(e)}")
        import traceback
        traceback.print_exc()


def _display_results(result):
    """Display the processing results in a formatted way."""
    # Summary
    print("\n📝 SUMMARY:")
    print("-" * 20)
    print(result.get("summary", "No summary available"))

    # Analysis
    print("\n🔍 ANALYSIS:")
    print("-" * 20)
    print(result.get("analysis", "No analysis available"))

    # Document Info
    print("\n📋 DOCUMENT INFO:")
    print("-" * 20)
    doc_info = result.get("document_info", {})
    print(f"File: {doc_info.get('file_name', 'Unknown')}")
    print(f"Type: {doc_info.get('file_type', 'Unknown')}")
    print(f"Total Chunks: {doc_info.get('total_chunks', 0)}")

    # Conversation
    print("\n💬 CONVERSATION:")
    print("-" * 20)
    conversation = result.get("conversation", [])

    if not conversation:
        print("No conversation generated.")
    else:
        for i, exchange in enumerate(conversation, 1):
            speaker = exchange.get("speaker", "Unknown")
            message = exchange.get("message", "")
            print(f"\n{i}. {speaker}: {message}")


if __name__ == "__main__":
    test_document_conversation()