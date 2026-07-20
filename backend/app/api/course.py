from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.course_generation_service import CourseGenerationService
from app.repositories.course_repository import CourseRepository
from app.utils.deps import get_current_user
from app.models.user import User
from app.schemas.course import CourseCreate, CourseResponse

router = APIRouter(prefix="/course", tags=["courses"])


@router.post("/generate")
async def generate_course(
    course_data: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a course from a PDF."""
    service = CourseGenerationService(db)
    try:
        course = service.generate_course_from_pdf(course_data.pdf_id, current_user.id)
        return course
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate course: {str(e)}")


@router.get("/{course_id}")
async def get_course(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a course by ID."""
    repo = CourseRepository(db)
    course = repo.get_course_by_id(course_id)
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if course.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this course")
    
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


@router.get("/")
async def get_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all courses for the current user."""
    repo = CourseRepository(db)
    courses = repo.get_courses_by_user(current_user.id)
    
    return [
        {
            "id": course.id,
            "pdf_id": course.pdf_id,
            "title": course.title,
            "description": course.description,
            "difficulty": course.difficulty if isinstance(course.difficulty, str) else course.difficulty.value,
            "estimated_time": course.estimated_time,
            "created_at": course.created_at.isoformat(),
        }
        for course in courses
    ]


@router.get("/search")
async def search_courses(
    q: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Search courses by query."""
    repo = CourseRepository(db)
    courses = repo.search_courses(current_user.id, q)
    
    return [
        {
            "id": course.id,
            "pdf_id": course.pdf_id,
            "title": course.title,
            "description": course.description,
            "difficulty": course.difficulty if isinstance(course.difficulty, str) else course.difficulty.value,
            "estimated_time": course.estimated_time,
            "created_at": course.created_at.isoformat(),
        }
        for course in courses
    ]


@router.get("/search/global")
async def global_search(
    q: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Global search across courses, chapters, and lessons."""
    from app.models.course import Course, Chapter, Lesson
    
    # 1. Search Courses
    courses = db.query(Course).filter(
        Course.user_id == current_user.id,
        (Course.title.ilike(f"%{q}%")) | (Course.description.ilike(f"%{q}%"))
    ).all()
    
    # 2. Search Chapters
    chapters = db.query(Chapter).join(Course).filter(
        Course.user_id == current_user.id,
        (Chapter.title.ilike(f"%{q}%")) | (Chapter.description.ilike(f"%{q}%"))
    ).all()
    
    # 3. Search Lessons
    lessons = db.query(Lesson).join(Chapter).join(Course).filter(
        Course.user_id == current_user.id,
        (Lesson.title.ilike(f"%{q}%")) | (Lesson.content.ilike(f"%{q}%"))
    ).all()
    
    results = []
    
    for c in courses:
        results.append({
            "type": "course",
            "course_id": c.id,
            "title": c.title,
            "subtitle": "Course Overview",
            "snippet": c.description[:150] + "...",
            "path": f"/courses/{c.id}"
        })
        
    for ch in chapters:
        results.append({
            "type": "chapter",
            "course_id": ch.course_id,
            "title": ch.title,
            "subtitle": f"Chapter in {ch.course.title}",
            "snippet": ch.description[:150] + "..." if ch.description else "",
            "path": f"/courses/{ch.course_id}"
        })
        
    for l in lessons:
        results.append({
            "type": "lesson",
            "course_id": l.chapter.course_id,
            "title": l.title,
            "subtitle": f"Lesson in {l.chapter.course.title} > {l.chapter.title}",
            "snippet": l.content[:150] + "...",
            "path": f"/courses/{l.chapter.course_id}/lessons/{l.id}"
        })
        
    return results
