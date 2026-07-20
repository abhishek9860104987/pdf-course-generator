from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError
from app.config.settings import settings
from app.api import auth_router, upload_router, course_router, rag_router, chat_router, quiz_router, progress_router, dashboard_router, leaderboard_router
from app.middleware import (
    integrity_error_handler,
    validation_exception_handler,
    general_exception_handler,
)

from app.database.database import Base, engine

# Create tables on startup if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI PDF to E-Course Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(IntegrityError, integrity_error_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(upload_router, prefix="/api")
app.include_router(course_router, prefix="/api")
app.include_router(rag_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(quiz_router, prefix="/api")
app.include_router(progress_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(leaderboard_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "AI PDF to E-Course Learning Platform API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
