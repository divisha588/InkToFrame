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

from llm.document_conversation import DocumentConversationConverter


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
        print("📊 DOCUMENT PROCESSING RESULTS")
        print("=" * 60)

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

        print("\n" + "=" * 60)
        print("✅ Document conversation conversion completed successfully!")

    except Exception as e:
        print(f"❌ Error during processing: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    test_document_conversation()