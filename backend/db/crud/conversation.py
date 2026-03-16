from sqlalchemy.orm import Session
from backend.db.models.conversation import Document, Conversation, ConversationMessage
from typing import List, Optional
import hashlib
import os

class ConversationCRUD:
    """CRUD operations for document conversations."""

    @staticmethod
    def create_document(
        db: Session,
        user_id: Optional[int],
        filename: str,
        original_filename: str,
        file_path: str,
        file_type: str,
        file_size: int,
        content_preview: str = ""
    ) -> Document:
        """Create a new document record."""
        # Generate content hash for duplicate detection
        content_hash = hashlib.md5(f"{filename}{file_size}".encode()).hexdigest()

        document = Document(
            user_id=user_id,
            filename=filename,
            original_filename=original_filename,
            file_path=file_path,
            file_type=file_type,
            file_size=file_size,
            content_hash=content_hash,
            content_preview=content_preview[:1000] if content_preview else "",
            status="uploaded"
        )

        db.add(document)
        db.commit()
        db.refresh(document)
        return document

    @staticmethod
    def update_document_status(
        db: Session,
        document_id: int,
        status: str,
        error_message: str = None
    ) -> Document:
        """Update document processing status."""
        document = db.query(Document).filter(Document.id == document_id).first()
        if document:
            document.status = status
            if error_message:
                document.error_message = error_message
            db.commit()
            db.refresh(document)
        return document

    @staticmethod
    def create_conversation(
        db: Session,
        user_id: Optional[int],
        document_id: int,
        title: str,
        summary: str,
        analysis: str
    ) -> Conversation:
        """Create a new conversation record."""
        conversation = Conversation(
            user_id=user_id,
            document_id=document_id,
            title=title,
            summary=summary,
            analysis=analysis,
            status="generating"
        )

        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return conversation

    @staticmethod
    def update_conversation_status(
        db: Session,
        conversation_id: int,
        status: str,
        error_message: str = None
    ) -> Conversation:
        """Update conversation generation status."""
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if conversation:
            conversation.status = status
            if error_message:
                conversation.error_message = error_message
            db.commit()
            db.refresh(conversation)
        return conversation

    @staticmethod
    def add_conversation_messages(
        db: Session,
        conversation_id: int,
        messages: List[dict]
    ) -> List[ConversationMessage]:
        """Add messages to a conversation."""
        conversation_messages = []

        for i, message_data in enumerate(messages):
            message = ConversationMessage(
                conversation_id=conversation_id,
                speaker=message_data["speaker"],
                message=message_data["message"],
                message_order=i
            )
            db.add(message)
            conversation_messages.append(message)

        db.commit()

        # Refresh all messages
        for msg in conversation_messages:
            db.refresh(msg)

        return conversation_messages

    @staticmethod
    def get_user_documents(db: Session, user_id: Optional[int]) -> List[Document]:
        """Get all documents for a user."""
        query = db.query(Document)
        if user_id:
            query = query.filter(Document.user_id == user_id)
        return query.order_by(Document.created_at.desc()).all()

    @staticmethod
    def get_user_conversations(db: Session, user_id: Optional[int]) -> List[Conversation]:
        """Get all conversations for a user."""
        query = db.query(Conversation)
        if user_id:
            query = query.filter(Conversation.user_id == user_id)
        return query.order_by(Conversation.created_at.desc()).all()

    @staticmethod
    def get_conversation_with_messages(db: Session, conversation_id: int) -> Optional[dict]:
        """Get a conversation with all its messages."""
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conversation:
            return None

        messages = db.query(ConversationMessage).filter(
            ConversationMessage.conversation_id == conversation_id
        ).order_by(ConversationMessage.message_order).all()

        return {
            "conversation": conversation,
            "messages": messages
        }

    @staticmethod
    def get_document_by_id(db: Session, document_id: int) -> Optional[Document]:
        """Get a document by ID."""
        return db.query(Document).filter(Document.id == document_id).first()

    @staticmethod
    def get_conversation_by_id(db: Session, conversation_id: int) -> Optional[Conversation]:
        """Get a conversation by ID."""
        return db.query(Conversation).filter(Conversation.id == conversation_id).first()