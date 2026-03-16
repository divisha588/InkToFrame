from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from backend.db.base import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # 'txt', 'pdf'
    file_size = Column(Integer, nullable=False)

    content_hash = Column(String, nullable=False)  # For duplicate detection
    content_preview = Column(Text)  # First 1000 characters

    status = Column(String, default="uploaded")  # uploaded, processing, processed, error
    error_message = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)

    title = Column(String, nullable=False)  # Auto-generated from document
    summary = Column(Text, nullable=False)
    analysis = Column(Text, nullable=False)

    status = Column(String, default="generating")  # generating, completed, error
    error_message = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)

    speaker = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    message_order = Column(Integer, nullable=False)  # For ordering messages

    created_at = Column(DateTime(timezone=True), server_default=func.now())