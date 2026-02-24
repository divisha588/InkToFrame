from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from backend.db.base import Base

class QuestionAnswer(Base):
    __tablename__ = "qa_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)

    sources = Column(Text)  # comma-separated titles for now
    created_at = Column(DateTime(timezone=True), server_default=func.now())
