from sqlalchemy.orm import Session
from app.repositories.course_repository import CourseRepository
from app.repositories.progress_repository import ProgressRepository
from app.repositories.quiz_repository import QuizRepository
from typing import Dict, Any, List
from datetime import datetime, timedelta


class DashboardService:
    def __init__(self, db: Session):
        self.db = db
        self.course_repo = CourseRepository(db)
        self.progress_repo = ProgressRepository(db)
        self.quiz_repo = QuizRepository(db)

    def get_dashboard_stats(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive dashboard statistics for a user."""
        # Get all courses
        courses = self.course_repo.get_courses_by_user(user_id)
        
        # Get all progress
        all_progress = self.progress_repo.get_user_progress(user_id)
        
        # Calculate total lessons
        total_lessons = 0
        for course in courses:
            for chapter in course.chapters:
                total_lessons += len(chapter.lessons)
        
        # Calculate completed lessons
        completed_lessons = len([p for p in all_progress if p.completed and p.lesson_id])
        
        # Calculate average quiz score
        quiz_scores = []
        for course in courses:
            quiz = self.quiz_repo.get_quiz_by_course_id(course.id)
            if quiz:
                attempts = self.quiz_repo.get_quiz_attempts(user_id, quiz.id)
                if attempts:
                    quiz_scores.extend([a.score for a in attempts])
        
        average_quiz_score = sum(quiz_scores) / len(quiz_scores) if quiz_scores else 0
        
        # Calculate total learning time
        total_learning_time = sum([p.time_spent for p in all_progress])
        
        # Calculate learning streak (consecutive days with activity)
        learning_streak = self._calculate_learning_streak(user_id)
        
        # Get recent courses
        recent_courses = sorted(courses, key=lambda c: c.created_at, reverse=True)[:5]
        
        # Get recent activity
        recent_activity = self._get_recent_activity(user_id, all_progress)
        
        return {
            "total_courses": len(courses),
            "total_lessons": total_lessons,
            "completed_lessons": completed_lessons,
            "average_quiz_score": round(average_quiz_score, 1),
            "learning_time": total_learning_time,
            "learning_streak": learning_streak,
            "recent_courses": [
                {
                    "id": course.id,
                    "pdf_id": course.pdf_id,
                    "title": course.title,
                    "description": course.description,
                    "difficulty": course.difficulty if isinstance(course.difficulty, str) else getattr(course.difficulty, 'value', course.difficulty),
                    "estimated_time": course.estimated_time,
                    "created_at": course.created_at.isoformat(),
                    "chapters": len(course.chapters),
                }
                for course in recent_courses
            ],
            "recent_activity": recent_activity,
        }

    def _calculate_learning_streak(self, user_id: str) -> int:
        """Calculate the user's learning streak in days."""
        all_progress = self.progress_repo.get_user_progress(user_id)
        
        if not all_progress:
            return 0
        
        # Get unique dates of completed lessons
        completed_dates = set()
        for progress in all_progress:
            if progress.completed_at:
                completed_dates.add(progress.completed_at.date())
        
        if not completed_dates:
            return 0
        
        # Sort dates
        sorted_dates = sorted(completed_dates, reverse=True)
        
        # Calculate streak
        streak = 0
        current_date = datetime.now().date()
        
        for date in sorted_dates:
            if date == current_date:
                streak += 1
                current_date -= timedelta(days=1)
            elif date == current_date - timedelta(days=1):
                streak += 1
                current_date -= timedelta(days=1)
            else:
                break
        
        return streak

    def _get_recent_activity(self, user_id: str, all_progress: List) -> List[Dict[str, Any]]:
        """Get recent learning activity."""
        activities = []
        
        # Get recent completed lessons
        completed_lessons = [p for p in all_progress if p.completed and p.completed_at]
        completed_lessons.sort(key=lambda p: p.completed_at, reverse=True)
        
        for progress in completed_lessons[:10]:
            activities.append({
                "id": progress.id,
                "type": "lesson_completed",
                "description": f"Completed lesson",
                "timestamp": progress.completed_at.isoformat(),
            })
        
        # Get recent quiz attempts
        courses = self.course_repo.get_courses_by_user(user_id)
        for course in courses:
            quiz = self.quiz_repo.get_quiz_by_course_id(course.id)
            if quiz:
                attempts = self.quiz_repo.get_quiz_attempts(user_id, quiz.id)
                for attempt in attempts[-3:]:  # Last 3 attempts
                    activities.append({
                        "id": attempt.id,
                        "type": "quiz_completed",
                        "description": f"Completed quiz with score {attempt.score}%",
                        "timestamp": attempt.completed_at.isoformat(),
                    })
        
        # Sort by timestamp
        activities.sort(key=lambda a: a["timestamp"], reverse=True)
        
        return activities[:10]

    def get_course_progress(self, user_id: str, course_id: str) -> Dict[str, Any]:
        """Get detailed progress for a specific course."""
        course = self.course_repo.get_course_by_id(course_id)
        if not course:
            raise ValueError("Course not found")
        
        progress_list = self.progress_repo.get_progress_by_course(user_id, course_id)
        
        # Calculate total lessons
        total_lessons = sum([len(chapter.lessons) for chapter in course.chapters])
        
        # Calculate completed lessons
        completed_lessons = len([p for p in progress_list if p.completed and p.lesson_id])
        
        # Calculate progress percentage
        progress_percentage = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
        
        # Calculate total time spent
        total_time_spent = sum([p.time_spent for p in progress_list])
        
        # Get chapter-wise progress
        chapter_progress = []
        for chapter in course.chapters:
            chapter_lessons = len(chapter.lessons)
            chapter_completed = len([
                p for p in progress_list 
                if p.completed and p.chapter_id == chapter.id
            ])
            chapter_progress.append({
                "chapter_id": chapter.id,
                "chapter_title": chapter.title,
                "total_lessons": chapter_lessons,
                "completed_lessons": chapter_completed,
                "progress_percentage": (chapter_completed / chapter_lessons * 100) if chapter_lessons > 0 else 0,
            })
        
        return {
            "course_id": course.id,
            "course_title": course.title,
            "total_lessons": total_lessons,
            "completed_lessons": completed_lessons,
            "progress_percentage": round(progress_percentage, 1),
            "total_time_spent": total_time_spent,
            "chapter_progress": chapter_progress,
        }
