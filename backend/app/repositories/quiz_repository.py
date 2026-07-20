from sqlalchemy.orm import Session
from app.models.quiz import Quiz, QuizAttempt
from app.schemas.quiz import QuizResponse, QuizAttemptCreate, QuizAttemptResponse
from typing import Optional, List


class QuizRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_quiz(
        self,
        course_id: str,
        title: str,
        questions: List[dict],
    ) -> Quiz:
        db_quiz = Quiz(
            course_id=course_id,
            title=title,
            questions=questions,
        )
        self.db.add(db_quiz)
        self.db.commit()
        self.db.refresh(db_quiz)
        return db_quiz

    def get_quiz_by_course_id(self, course_id: str) -> Optional[Quiz]:
        return self.db.query(Quiz).filter(Quiz.course_id == course_id).first()

    def create_quiz_attempt(
        self,
        user_id: str,
        quiz_id: str,
        score: int,
        answers: dict,
    ) -> QuizAttempt:
        db_attempt = QuizAttempt(
            user_id=user_id,
            quiz_id=quiz_id,
            score=score,
            answers=answers,
        )
        self.db.add(db_attempt)
        self.db.commit()
        self.db.refresh(db_attempt)
        return db_attempt

    def get_quiz_attempts(self, user_id: str, quiz_id: str) -> List[QuizAttempt]:
        return (
            self.db.query(QuizAttempt)
            .filter(QuizAttempt.user_id == user_id, QuizAttempt.quiz_id == quiz_id)
            .all()
        )
