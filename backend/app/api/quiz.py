from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.quiz_service import QuizService
from app.utils.deps import get_current_user
from app.models.user import User
from app.schemas.quiz import QuizAttemptCreate

router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.get("/{course_id}")
async def get_quiz(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get or generate a quiz for a course."""
    service = QuizService(db)
    try:
        quiz = service.generate_quiz(course_id)
        return quiz
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get quiz: {str(e)}")


@router.post("/{course_id}/submit")
async def submit_quiz(
    course_id: str,
    attempt_data: QuizAttemptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit quiz answers."""
    service = QuizService(db)
    try:
        result = service.submit_quiz(
            course_id,
            current_user.id,
            attempt_data.answers,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit quiz: {str(e)}")


@router.get("/{course_id}/attempts")
async def get_quiz_attempts(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all quiz attempts for a course."""
    service = QuizService(db)
    return service.get_quiz_attempts(course_id, current_user.id)
