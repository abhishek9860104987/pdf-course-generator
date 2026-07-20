from sqlalchemy.orm import Session
from app.repositories.course_repository import CourseRepository
from app.repositories.pdf_repository import PDFRepository
from app.ai.groq_client import GroqClient
from app.prompts.course_generation import COURSE_GENERATION_PROMPT
from app.models.course import Difficulty
from app.models.pdf import PDFStatus
from typing import Dict, Any
import uuid


class CourseGenerationService:
    def __init__(self, db: Session):
        self.db = db
        self.course_repo = CourseRepository(db)
        self.pdf_repo = PDFRepository(db)
        self.groq_client = GroqClient()

    def generate_course_from_pdf(self, pdf_id: str, user_id: str) -> Dict[str, Any]:
        """Generate a complete course from a PDF."""
        # Get PDF
        pdf = self.pdf_repo.get_pdf_by_id(pdf_id)
        if not pdf:
            raise ValueError("PDF not found")

        if pdf.user_id != user_id:
            raise ValueError("Not authorized to access this PDF")

        try:
            # Extract PDF content
            from app.utils.pdf_processor import PDFProcessor
            processor = PDFProcessor(pdf.file_path)
            content = processor.extract_text()

            if len(content) < 100:
                raise ValueError("PDF content is too short to generate a course")

            # Truncate content if too long for API
            max_content_length = 15000
            if len(content) > max_content_length:
                content = content[:max_content_length] + "\n\n[Content truncated for processing...]"

            # Generate course structure using AI
            try:
                course_data = self.groq_client.generate_json(
                    prompt=COURSE_GENERATION_PROMPT.format(content=content),
                    system_prompt="You are an expert instructional designer. Always respond with valid JSON.",
                    temperature=0.7,
                    max_tokens=4000,
                )
            except Exception as e:
                raise ValueError(f"Failed to generate course: {str(e)}")

            # Create course in database
            course = self.course_repo.create_course(
                user_id=user_id,
                pdf_id=pdf_id,
                title=course_data.get("title", "Generated Course"),
                description=course_data.get("description", ""),
                objectives=course_data.get("objectives", []),
                difficulty=Difficulty(course_data.get("difficulty", "beginner")),
                estimated_time=course_data.get("estimated_time", 60),
                prerequisites=course_data.get("prerequisites", []),
            )

            # Create chapters and lessons
            chapters_data = course_data.get("chapters", [])
            for chapter_data in chapters_data:
                chapter = self.course_repo.create_chapter(
                    course_id=course.id,
                    title=chapter_data.get("title", "Chapter"),
                    description=chapter_data.get("description"),
                    order=chapter_data.get("order", 0),
                )

                lessons_data = chapter_data.get("lessons", [])
                for lesson_data in lessons_data:
                    lesson = self.course_repo.create_lesson(
                        chapter_id=chapter.id,
                        title=lesson_data.get("title", "Lesson"),
                        content=lesson_data.get("content", ""),
                        explanation=lesson_data.get("explanation"),
                        example=lesson_data.get("example"),
                        key_takeaways=lesson_data.get("key_takeaways"),
                        important_notes=lesson_data.get("important_notes"),
                        summary=lesson_data.get("summary"),
                        order=lesson_data.get("order", 0),
                        estimated_time=lesson_data.get("estimated_time", 10),
                    )
                    
                    # Create Topics and Subtopics if present
                    topics_data = lesson_data.get("topics", [])
                    for topic_data in topics_data:
                        topic = self.course_repo.create_topic(
                            lesson_id=lesson.id,
                            title=topic_data.get("title", "Topic"),
                            description=topic_data.get("description"),
                            order=topic_data.get("order", 0),
                        )
                        
                        subtopics_data = topic_data.get("subtopics", [])
                        for subtopic_data in subtopics_data:
                            self.course_repo.create_subtopic(
                                topic_id=topic.id,
                                title=subtopic_data.get("title", "Subtopic"),
                                content=subtopic_data.get("content"),
                                order=subtopic_data.get("order", 0),
                            )

            # Update PDF status
            self.pdf_repo.update_pdf_status(pdf_id, PDFStatus.COMPLETED)

            # Return course with all chapters and lessons
            return self._get_course_with_details(course.id)

        except Exception as e:
            self.pdf_repo.update_pdf_status(pdf_id, PDFStatus.FAILED)
            raise e

    def _get_course_with_details(self, course_id: str) -> Dict[str, Any]:
        """Get course with all chapters and lessons."""
        course = self.course_repo.get_course_by_id(course_id)
        if not course:
            raise ValueError("Course not found")

        return {
            "id": course.id,
            "pdf_id": course.pdf_id,
            "user_id": course.user_id,
            "title": course.title,
            "description": course.description,
            "objectives": course.objectives,
            "difficulty": course.difficulty if isinstance(course.difficulty, str) else course.difficulty.value,
            "estimated_time": course.estimated_time,
            "prerequisites": course.prerequisites,
            "created_at": course.created_at.isoformat(),
            "updated_at": course.updated_at.isoformat() if course.updated_at else None,
            "chapters": [
                {
                    "id": chapter.id,
                    "course_id": chapter.course_id,
                    "title": chapter.title,
                    "description": chapter.description,
                    "order": chapter.order,
                    "lessons": [
                        {
                            "id": lesson.id,
                            "chapter_id": lesson.chapter_id,
                            "title": lesson.title,
                            "content": lesson.content,
                            "explanation": lesson.explanation,
                            "example": lesson.example,
                            "key_takeaways": lesson.key_takeaways,
                            "important_notes": lesson.important_notes,
                            "summary": lesson.summary,
                            "order": lesson.order,
                            "estimated_time": lesson.estimated_time,
                            "topics": [
                                {
                                    "id": topic.id,
                                    "lesson_id": topic.lesson_id,
                                    "title": topic.title,
                                    "description": topic.description,
                                    "order": topic.order,
                                    "subtopics": [
                                        {
                                            "id": subtopic.id,
                                            "topic_id": subtopic.topic_id,
                                            "title": subtopic.title,
                                            "content": subtopic.content,
                                            "order": subtopic.order,
                                        }
                                        for subtopic in topic.subtopics
                                    ]
                                }
                                for topic in lesson.topics
                            ]
                        }
                        for lesson in chapter.lessons
                    ],
                }
                for chapter in course.chapters
            ],
        }
