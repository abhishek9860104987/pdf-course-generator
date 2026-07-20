from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app.models.course import Difficulty


class LessonBase(BaseModel):
    title: str
    content: str
    explanation: Optional[str] = None
    example: Optional[str] = None
    key_takeaways: Optional[List[str]] = None
    important_notes: Optional[List[str]] = None
    summary: Optional[str] = None
    order: int
    estimated_time: int


class LessonResponse(LessonBase):
    id: str
    chapter_id: str

    class Config:
        from_attributes = True


class ChapterBase(BaseModel):
    title: str
    description: Optional[str] = None
    order: int


class ChapterResponse(ChapterBase):
    id: str
    course_id: str
    lessons: List[LessonResponse] = []

    class Config:
        from_attributes = True


class CourseBase(BaseModel):
    title: str
    description: str
    objectives: List[str]
    difficulty: Difficulty
    estimated_time: int
    prerequisites: List[str]


class CourseCreate(BaseModel):
    pdf_id: str


class CourseResponse(CourseBase):
    id: str
    pdf_id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    chapters: List[ChapterResponse] = []

    class Config:
        from_attributes = True
