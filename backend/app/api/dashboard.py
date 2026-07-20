from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.dashboard_service import DashboardService
from app.utils.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get comprehensive dashboard statistics."""
    service = DashboardService(db)
    return service.get_dashboard_stats(current_user.id)


@router.get("/course/{course_id}/progress")
async def get_course_progress(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get detailed progress for a specific course."""
    service = DashboardService(db)
    try:
        return service.get_course_progress(current_user.id, course_id)
    except ValueError as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=str(e))
