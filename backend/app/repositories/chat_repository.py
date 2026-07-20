from sqlalchemy.orm import Session
from app.models.chat import ChatHistory
from app.schemas.chat import ChatHistoryResponse, ChatMessage
from typing import Optional, List


class ChatRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create_chat_history(
        self, user_id: str, course_id: str
    ) -> ChatHistory:
        chat_history = (
            self.db.query(ChatHistory)
            .filter(ChatHistory.user_id == user_id, ChatHistory.course_id == course_id)
            .first()
        )

        if not chat_history:
            chat_history = ChatHistory(
                user_id=user_id, course_id=course_id, messages=[]
            )
            self.db.add(chat_history)
            self.db.commit()
            self.db.refresh(chat_history)

        return chat_history

    def add_message(
        self, user_id: str, course_id: str, message: ChatMessage
    ) -> ChatHistory:
        chat_history = self.get_or_create_chat_history(user_id, course_id)
        chat_history.messages.append(message.model_dump())
        self.db.commit()
        self.db.refresh(chat_history)
        return chat_history

    def get_chat_history(
        self, user_id: str, course_id: str
    ) -> Optional[ChatHistory]:
        return (
            self.db.query(ChatHistory)
            .filter(ChatHistory.user_id == user_id, ChatHistory.course_id == course_id)
            .first()
        )
