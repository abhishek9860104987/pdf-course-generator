from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.database import Base
import uuid


class Progress(Base):
    __tablename__ = "progress"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    lesson_id = Column(String, ForeignKey("lessons.id"), nullable=True)
    chapter_id = Column(String, ForeignKey("chapters.id"), nullable=True)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    time_spent = Column(Integer, default=0)

    course = relationship("Course", back_populates="progress")
    user = relationship("User", back_populates="progress")
