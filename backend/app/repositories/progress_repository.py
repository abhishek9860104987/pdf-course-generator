from sqlalchemy.orm import Session
from app.models.progress import Progress
from app.schemas.course import CourseResponse
from typing import Optional, List


class ProgressRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_or_update_progress(
        self,
        user_id: str,
        course_id: str,
        lesson_id: Optional[str],
        chapter_id: Optional[str],
        completed: bool,
        time_spent: int,
    ) -> Progress:
        # Check if progress already exists
        progress = (
            self.db.query(Progress)
            .filter(
                Progress.user_id == user_id,
                Progress.course_id == course_id,
                Progress.lesson_id == lesson_id,
                Progress.chapter_id == chapter_id,
            )
            .first()
        )

        if progress:
            progress.completed = completed
            progress.time_spent += time_spent
            if completed and not progress.completed_at:
                from datetime import datetime
                progress.completed_at = datetime.utcnow()
        else:
            progress = Progress(
                user_id=user_id,
                course_id=course_id,
                lesson_id=lesson_id,
                chapter_id=chapter_id,
                completed=completed,
                time_spent=time_spent,
            )
            if completed:
                from datetime import datetime
                progress.completed_at = datetime.utcnow()
            self.db.add(progress)

        self.db.commit()
        self.db.refresh(progress)
        return progress

    def get_progress_by_course(self, user_id: str, course_id: str) -> List[Progress]:
        return (
            self.db.query(Progress)
            .filter(Progress.user_id == user_id, Progress.course_id == course_id)
            .all()
        )

    def get_user_progress(self, user_id: str) -> List[Progress]:
        return self.db.query(Progress).filter(Progress.user_id == user_id).all()
