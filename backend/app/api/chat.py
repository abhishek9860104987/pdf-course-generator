from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.chatbot_service import ChatbotService
from app.utils.deps import get_current_user
from app.models.user import User
from app.schemas.chat import ChatCreate

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/")
async def send_message(
    chat_data: ChatCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send a message and get AI response."""
    service = ChatbotService(db)
    response = service.send_message(
        current_user.id,
        chat_data.course_id,
        chat_data.message,
    )
    return response


@router.post("/stream")
async def send_message_stream(
    chat_data: ChatCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send a message and get streaming AI response."""
    service = ChatbotService(db)
    
    return StreamingResponse(
        service.send_message_stream(
            current_user.id,
            chat_data.course_id,
            chat_data.message,
        ),
        media_type="text/plain",
    )


@router.get("/{course_id}")
async def get_chat_history(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get chat history for a course."""
    service = ChatbotService(db)
    return service.get_chat_history(current_user.id, course_id)


@router.get("/{course_id}/suggestions")
async def get_suggested_questions(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get suggested questions for a course."""
    service = ChatbotService(db)
    questions = service.get_suggested_questions(current_user.id, course_id)
    return {"questions": questions}


@router.delete("/{course_id}")
async def clear_chat_history(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Clear chat history for a course."""
    service = ChatbotService(db)
    service.clear_chat_history(current_user.id, course_id)
    return {"message": "Chat history cleared"}
