from sqlalchemy.orm import Session
from app.repositories.chat_repository import ChatRepository
from app.rag.retriever import RAGRetriever
from app.ai.groq_client import GroqClient
from app.prompts.chatbot import CHATBOT_SYSTEM_PROMPT, CHATBOT_USER_PROMPT, SUGGESTED_QUESTIONS_PROMPT
from app.schemas.chat import ChatMessage, ChatCreate
from datetime import datetime
from typing import List, Optional
import uuid
import json


class ChatbotService:
    def __init__(self, db: Session):
        self.db = db
        self.chat_repo = ChatRepository(db)
        self.rag_retriever = RAGRetriever(db)
        self.groq_client = GroqClient()

    def send_message(self, user_id: str, course_id: str, message: str) -> ChatMessage:
        """Send a message and get AI response."""
        # Get conversation history
        chat_history = self.chat_repo.get_chat_history(user_id, course_id)
        conversation_history = []
        if chat_history:
            conversation_history = chat_history.messages[-10:]  # Last 10 messages

        # Build context using RAG
        context = self.rag_retriever.build_context(message, course_id, max_chunks=3)

        # Format conversation history
        history_text = "\n".join([
            f"{msg['role']}: {msg['content']}" 
            for msg in conversation_history
        ])

        # Generate response
        system_prompt = CHATBOT_SYSTEM_PROMPT.format(
            context=context if context else "No specific context available.",
            conversation_history=history_text
        )
        
        user_prompt = CHATBOT_USER_PROMPT.format(question=message)

        try:
            response = self.groq_client.generate(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=1000,
            )
        except Exception as e:
            response = f"I apologize, but I encountered an error: {str(e)}"

        # Create user message
        user_message = ChatMessage(
            id=str(uuid.uuid4()),
            role="user",
            content=message,
            timestamp=datetime.utcnow().isoformat(),
        )

        # Create assistant message
        assistant_message = ChatMessage(
            id=str(uuid.uuid4()),
            role="assistant",
            content=response,
            timestamp=datetime.utcnow().isoformat(),
        )

        # Save messages
        self.chat_repo.add_message(user_id, course_id, user_message)
        self.chat_repo.add_message(user_id, course_id, assistant_message)

        return assistant_message

    def send_message_stream(self, user_id: str, course_id: str, message: str):
        """Send a message and get streaming AI response."""
        # Get conversation history
        chat_history = self.chat_repo.get_chat_history(user_id, course_id)
        conversation_history = []
        if chat_history:
            conversation_history = chat_history.messages[-10:]

        # Build context using RAG
        context = self.rag_retriever.build_context(message, course_id, max_chunks=3)

        # Format conversation history
        history_text = "\n".join([
            f"{msg['role']}: {msg['content']}" 
            for msg in conversation_history
        ])

        # Stream response
        system_prompt = CHATBOT_SYSTEM_PROMPT.format(
            context=context if context else "No specific context available.",
            conversation_history=history_text
        )
        
        user_prompt = CHATBOT_USER_PROMPT.format(question=message)

        # Create user message
        user_message = ChatMessage(
            id=str(uuid.uuid4()),
            role="user",
            content=message,
            timestamp=datetime.utcnow().isoformat(),
        )

        # Save user message
        self.chat_repo.add_message(user_id, course_id, user_message)

        # Stream response
        full_response = ""
        try:
            for chunk in self.groq_client.generate_stream(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=1000,
            ):
                full_response += chunk
                yield chunk
        except Exception as e:
            full_response = f"I apologize, but I encountered an error: {str(e)}"
            yield full_response

        # Save assistant message
        assistant_message = ChatMessage(
            id=str(uuid.uuid4()),
            role="assistant",
            content=full_response,
            timestamp=datetime.utcnow().isoformat(),
        )
        self.chat_repo.add_message(user_id, course_id, assistant_message)

    def get_chat_history(self, user_id: str, course_id: str) -> dict:
        """Get chat history for a course."""
        chat_history = self.chat_repo.get_chat_history(user_id, course_id)
        
        if not chat_history:
            return {
                "id": "",
                "user_id": user_id,
                "course_id": course_id,
                "messages": [],
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            }

        return {
            "id": chat_history.id,
            "user_id": chat_history.user_id,
            "course_id": chat_history.course_id,
            "messages": chat_history.messages,
            "created_at": chat_history.created_at.isoformat(),
            "updated_at": chat_history.updated_at.isoformat() if chat_history.updated_at else None,
        }

    def get_suggested_questions(self, user_id: str, course_id: str) -> List[str]:
        """Get suggested questions based on course content."""
        # Get course content
        from app.repositories.course_repository import CourseRepository
        course_repo = CourseRepository(self.db)
        course = course_repo.get_course_by_id(course_id)
        
        if not course:
            return []

        # Extract content
        content_chunks = []
        for chapter in course.chapters:
            for lesson in chapter.lessons:
                if lesson.content:
                    content_chunks.append(lesson.content)

        if not content_chunks:
            return []

        # Combine chunks (limit to avoid token limits)
        combined_content = "\n\n".join(content_chunks[:5])

        # Generate suggested questions
        try:
            result = self.groq_client.generate_json(
                prompt=SUGGESTED_QUESTIONS_PROMPT.format(content=combined_content),
                system_prompt="You are an expert educator. Always respond with valid JSON.",
                temperature=0.7,
                max_tokens=500,
            )
            return result.get("questions", [])
        except Exception as e:
            print(f"Error generating suggested questions: {e}")
            return [
                "What are the key concepts covered in this course?",
                "Can you explain the main topics?",
                "What should I focus on learning?",
                "How do I apply these concepts?",
                "What are the prerequisites for this course?",
            ]

    def clear_chat_history(self, user_id: str, course_id: str) -> bool:
        """Clear chat history for a course."""
        chat_history = self.chat_repo.get_chat_history(user_id, course_id)
        if chat_history:
            chat_history.messages = []
            self.db.commit()
            return True
        return False
