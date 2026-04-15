#!/usr/bin/env python3
"""
Database initialization script
Creates all database tables and sets up the database for production use.
"""

import sys
import os
from pathlib import Path

# Add the backend directory to the Python path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

from backend.db.base import Base
from backend.db.session import engine
from backend.db.models import User, QuestionAnswer, Document, Conversation, ConversationMessage

def init_database():
    """Initialize the database by creating all tables."""
    print("🚀 Initializing database...")

    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ All database tables created successfully!")

        # Print table information
        print("\n📊 Database Tables Created:")
        tables = [
            "users - User accounts and authentication",
            "qa_logs - Question-answer history",
            "documents - Uploaded document metadata",
            "conversations - Generated conversation metadata",
            "conversation_messages - Individual conversation messages"
        ]

        for table in tables:
            print(f"  • {table}")

        print("\n🔧 Database Configuration:")
        print(f"  • Database URL: {os.getenv('DATABASE_URL', 'sqlite:///./dev.db')}")
        print("  • Upload directory: ./uploads")
        print("  • Documents directory: ./docs")
        print("  • Vector store: ./vector_store")

        print("\n✅ Database is ready for production use!")

    except Exception as e:
        print(f"❌ Error initializing database: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    init_database()