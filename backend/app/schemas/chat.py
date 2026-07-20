from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class ChatMessage(BaseModel):
    id: str
    role: str
    content: str
    timestamp: datetime


class ChatHistoryResponse(BaseModel):
    id: str
    user_id: str
    course_id: str
    messages: List[ChatMessage]
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChatCreate(BaseModel):
    course_id: str
    message: str
