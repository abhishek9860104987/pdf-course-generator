from sqlalchemy.orm import Session
from app.models.course import Course, Chapter, Lesson, Difficulty, Topic, Subtopic
from app.schemas.course import CourseCreate, CourseResponse, ChapterResponse, LessonResponse
from typing import Optional, List


class CourseRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_course(
        self,
        user_id: str,
        pdf_id: str,
        title: str,
        description: str,
        objectives: List[str],
        difficulty: Difficulty,
        estimated_time: int,
        prerequisites: List[str],
    ) -> Course:
        db_course = Course(
            user_id=user_id,
            pdf_id=pdf_id,
            title=title,
            description=description,
            objectives=objectives,
            difficulty=difficulty.value if isinstance(difficulty, Difficulty) else difficulty,
            estimated_time=estimated_time,
            prerequisites=prerequisites,
        )
        self.db.add(db_course)
        self.db.commit()
        self.db.refresh(db_course)
        return db_course

    def get_course_by_id(self, course_id: str) -> Optional[Course]:
        return self.db.query(Course).filter(Course.id == course_id).first()

    def get_courses_by_user(self, user_id: str) -> List[Course]:
        return self.db.query(Course).filter(Course.user_id == user_id).all()

    def update_course(self, course_id: str, **kwargs) -> Optional[Course]:
        course = self.get_course_by_id(course_id)
        if course:
            for key, value in kwargs.items():
                setattr(course, key, value)
            self.db.commit()
            self.db.refresh(course)
        return course

    def create_chapter(
        self,
        course_id: str,
        title: str,
        description: Optional[str],
        order: int,
    ) -> Chapter:
        db_chapter = Chapter(
            course_id=course_id,
            title=title,
            description=description,
            order=order,
        )
        self.db.add(db_chapter)
        self.db.commit()
        self.db.refresh(db_chapter)
        return db_chapter

    def create_lesson(
        self,
        chapter_id: str,
        title: str,
        content: str,
        explanation: Optional[str],
        example: Optional[str],
        key_takeaways: Optional[List[str]],
        important_notes: Optional[List[str]],
        summary: Optional[str],
        order: int,
        estimated_time: int,
    ) -> Lesson:
        db_lesson = Lesson(
            chapter_id=chapter_id,
            title=title,
            content=content,
            explanation=explanation,
            example=example,
            key_takeaways=key_takeaways,
            important_notes=important_notes,
            summary=summary,
            order=order,
            estimated_time=estimated_time,
        )
        self.db.add(db_lesson)
        self.db.commit()
        self.db.refresh(db_lesson)
        return db_lesson

    def create_topic(
        self,
        lesson_id: str,
        title: str,
        description: Optional[str],
        order: int,
    ) -> Topic:
        db_topic = Topic(
            lesson_id=lesson_id,
            title=title,
            description=description,
            order=order,
        )
        self.db.add(db_topic)
        self.db.commit()
        self.db.refresh(db_topic)
        return db_topic

    def create_subtopic(
        self,
        topic_id: str,
        title: str,
        content: Optional[str],
        order: int,
    ) -> Subtopic:
        db_subtopic = Subtopic(
            topic_id=topic_id,
            title=title,
            content=content,
            order=order,
        )
        self.db.add(db_subtopic)
        self.db.commit()
        self.db.refresh(db_subtopic)
        return db_subtopic

    def search_courses(self, user_id: str, query: str) -> List[Course]:
        return (
            self.db.query(Course)
            .filter(Course.user_id == user_id)
            .filter(
                (Course.title.ilike(f"%{query}%"))
                | (Course.description.ilike(f"%{query}%"))
            )
            .all()
        )
