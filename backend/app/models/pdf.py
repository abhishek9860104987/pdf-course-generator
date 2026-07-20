from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.database import Base
import uuid
import enum


class PDFStatus(enum.Enum):
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class PDF(Base):
    __tablename__ = "pdfs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    original_name = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    file_path = Column(String, nullable=False)
    status = Column(String(20), default=PDFStatus.PROCESSING.value)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="pdfs")
    courses = relationship("Course", back_populates="pdf", cascade="all, delete-orphan")
