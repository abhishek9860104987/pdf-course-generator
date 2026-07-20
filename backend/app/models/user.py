from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.database import Base
import uuid


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=True)
    avatar = Column(String, nullable=True)
    google_id = Column(String, nullable=True, unique=True)
    github_id = Column(String, nullable=True, unique=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    pdfs = relationship("PDF", back_populates="user")
    courses = relationship("Course", back_populates="user")
    quiz_attempts = relationship("QuizAttempt", back_populates="user")
    progress = relationship("Progress", back_populates="user")
    chat_histories = relationship("ChatHistory", back_populates="user")
