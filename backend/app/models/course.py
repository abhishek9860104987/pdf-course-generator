from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.database import Base
import uuid
import enum


class Difficulty(enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class Course(Base):
    __tablename__ = "courses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    pdf_id = Column(String, ForeignKey("pdfs.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    objectives = Column(JSON, nullable=False)
    difficulty = Column(String(20), default=Difficulty.BEGINNER.value)
    estimated_time = Column(Integer, nullable=False)
    prerequisites = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    pdf = relationship("PDF", back_populates="courses")
    user = relationship("User", back_populates="courses")
    chapters = relationship("Chapter", back_populates="course", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="course", cascade="all, delete-orphan")
    chat_histories = relationship("ChatHistory", back_populates="course", cascade="all, delete-orphan")
    progress = relationship("Progress", back_populates="course", cascade="all, delete-orphan")


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, nullable=False)

    course = relationship("Course", back_populates="chapters")
    lessons = relationship("Lesson", back_populates="chapter", cascade="all, delete-orphan")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    chapter_id = Column(String, ForeignKey("chapters.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    example = Column(Text, nullable=True)
    key_takeaways = Column(JSON, nullable=True)
    important_notes = Column(JSON, nullable=True)
    summary = Column(Text, nullable=True)
    order = Column(Integer, nullable=False)
    estimated_time = Column(Integer, nullable=False)

    chapter = relationship("Chapter", back_populates="lessons")
    topics = relationship("Topic", back_populates="lesson", cascade="all, delete-orphan")


class Topic(Base):
    __tablename__ = "topics"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    lesson_id = Column(String, ForeignKey("lessons.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, nullable=False)

    lesson = relationship("Lesson", back_populates="topics")
    subtopics = relationship("Subtopic", back_populates="topic", cascade="all, delete-orphan")


class Subtopic(Base):
    __tablename__ = "subtopics"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    topic_id = Column(String, ForeignKey("topics.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    order = Column(Integer, nullable=False)

    topic = relationship("Topic", back_populates="subtopics")
