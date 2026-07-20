from app.api.auth import router as auth_router
from app.api.upload import router as upload_router
from app.api.course import router as course_router
from app.api.rag import router as rag_router
from app.api.chat import router as chat_router
from app.api.quiz import router as quiz_router
from app.api.progress import router as progress_router
from app.api.dashboard import router as dashboard_router
from app.api.leaderboard import router as leaderboard_router

__all__ = ["auth_router", "upload_router", "course_router", "rag_router", "chat_router", "quiz_router", "progress_router", "dashboard_router", "leaderboard_router"]

