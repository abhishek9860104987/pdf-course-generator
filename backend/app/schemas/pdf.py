from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.pdf import PDFStatus


class PDFResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    original_name: str
    file_size: int
    status: PDFStatus
    upload_date: datetime

    class Config:
        from_attributes = True
