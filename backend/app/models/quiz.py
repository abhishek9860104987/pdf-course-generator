from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Integer
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.database import Base
import uuid


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    title = Column(String, nullable=False)
    questions = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    course = relationship("Course", back_populates="quizzes")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    quiz_id = Column(String, ForeignKey("quizzes.id"), nullable=False)
    score = Column(Integer, nullable=False)
    answers = Column(JSON, nullable=False)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())

    quiz = relationship("Quiz", back_populates="attempts")
    user = relationship("User", back_populates="quiz_attempts")
