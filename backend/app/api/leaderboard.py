from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.database import get_db
from app.utils.deps import get_current_user
from app.models.user import User
from app.models.quiz import QuizAttempt, Quiz
from app.models.course import Course

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("/")
async def get_leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 20,
):
    """
    Return top quiz scorers globally.
    Aggregates per user: total quizzes taken, average score, best score.
    """
    # Aggregate quiz attempt stats per user
    results = (
        db.query(
            QuizAttempt.user_id,
            User.name.label("user_name"),
            User.avatar.label("user_avatar"),
            func.count(QuizAttempt.id).label("quizzes_taken"),
            func.avg(QuizAttempt.score).label("avg_score"),
            func.max(QuizAttempt.score).label("best_score"),
        )
        .join(User, User.id == QuizAttempt.user_id)
        .group_by(QuizAttempt.user_id, User.name, User.avatar)
        .order_by(func.avg(QuizAttempt.score).desc())
        .limit(limit)
        .all()
    )

    leaderboard = []
    for rank, row in enumerate(results, start=1):
        leaderboard.append({
            "rank": rank,
            "user_id": row.user_id,
            "user_name": row.user_name or "Anonymous",
            "user_avatar": row.user_avatar,
            "quizzes_taken": row.quizzes_taken,
            "avg_score": round(float(row.avg_score or 0), 1),
            "best_score": int(row.best_score or 0),
            "is_current_user": row.user_id == current_user.id,
        })

    return leaderboard
