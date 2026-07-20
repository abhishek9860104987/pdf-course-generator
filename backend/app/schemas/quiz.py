from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Optional


class QuizQuestion(BaseModel):
    id: str
    question: str
    type: str
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: str


class QuizBase(BaseModel):
    title: str
    questions: List[QuizQuestion]


class QuizResponse(QuizBase):
    id: str
    course_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class QuizAttemptCreate(BaseModel):
    answers: Dict[str, str]


class QuizAttemptResponse(BaseModel):
    id: str
    user_id: str
    quiz_id: str
    score: int
    answers: Dict[str, str]
    completed_at: datetime

    class Config:
        from_attributes = True
