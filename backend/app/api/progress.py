from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.repositories.progress_repository import ProgressRepository
from app.utils.deps import get_current_user
from app.models.user import User
from pydantic import BaseModel

router = APIRouter(prefix="/progress", tags=["progress"])


class ProgressCreate(BaseModel):
    course_id: str
    lesson_id: str = None
    chapter_id: str = None
    completed: bool
    time_spent: int = 0


@router.post("/")
async def update_progress(
    progress_data: ProgressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update learning progress."""
    repo = ProgressRepository(db)
    progress = repo.create_or_update_progress(
        user_id=current_user.id,
        course_id=progress_data.course_id,
        lesson_id=progress_data.lesson_id,
        chapter_id=progress_data.chapter_id,
        completed=progress_data.completed,
        time_spent=progress_data.time_spent,
    )
    
    return {
        "id": progress.id,
        "user_id": progress.user_id,
        "course_id": progress.course_id,
        "lesson_id": progress.lesson_id,
        "chapter_id": progress.chapter_id,
        "completed": progress.completed,
        "completed_at": progress.completed_at.isoformat() if progress.completed_at else None,
        "time_spent": progress.time_spent,
    }


@router.get("/{course_id}")
async def get_progress(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get progress for a course."""
    repo = ProgressRepository(db)
    progress_list = repo.get_progress_by_course(current_user.id, course_id)
    
    return [
        {
            "id": progress.id,
            "user_id": progress.user_id,
            "course_id": progress.course_id,
            "lesson_id": progress.lesson_id,
            "chapter_id": progress.chapter_id,
            "completed": progress.completed,
            "completed_at": progress.completed_at.isoformat() if progress.completed_at else None,
            "time_spent": progress.time_spent,
        }
        for progress in progress_list
    ]


@router.get("/")
async def get_all_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all progress for the current user."""
    repo = ProgressRepository(db)
    progress_list = repo.get_user_progress(current_user.id)
    
    return [
        {
            "id": progress.id,
            "user_id": progress.user_id,
            "course_id": progress.course_id,
            "lesson_id": progress.lesson_id,
            "chapter_id": progress.chapter_id,
            "completed": progress.completed,
            "completed_at": progress.completed_at.isoformat() if progress.completed_at else None,
            "time_spent": progress.time_spent,
        }
        for progress in progress_list
    ]
