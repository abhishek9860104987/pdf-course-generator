from sqlalchemy.orm import Session
from app.repositories.quiz_repository import QuizRepository
from app.repositories.course_repository import CourseRepository
from app.ai.groq_client import GroqClient
from app.prompts.course_generation import QUIZ_GENERATION_PROMPT
from typing import Dict, Any, List
import uuid


class QuizService:
    def __init__(self, db: Session):
        self.db = db
        self.quiz_repo = QuizRepository(db)
        self.course_repo = CourseRepository(db)
        self.groq_client = GroqClient()

    def generate_quiz(self, course_id: str) -> Dict[str, Any]:
        """Generate a quiz for a course."""
        # Get course
        course = self.course_repo.get_course_by_id(course_id)
        if not course:
            raise ValueError("Course not found")

        # Check if quiz already exists
        existing_quiz = self.quiz_repo.get_quiz_by_course_id(course_id)
        if existing_quiz:
            return self._quiz_to_dict(existing_quiz)

        # Extract course content
        content_chunks = []
        for chapter in course.chapters:
            for lesson in chapter.lessons:
                if lesson.content:
                    content_chunks.append(lesson.content)
                if lesson.key_takeaways:
                    content_chunks.append("Key Takeaways: " + " ".join(lesson.key_takeaways))

        if not content_chunks:
            raise ValueError("No content available to generate quiz")

        # Combine chunks (limit to avoid token limits)
        combined_content = "\n\n".join(content_chunks[:10])

        # Generate quiz using AI
        try:
            quiz_data = self.groq_client.generate_json(
                prompt=QUIZ_GENERATION_PROMPT.format(content=combined_content),
                system_prompt="You are an expert educator. Always respond with valid JSON.",
                temperature=0.7,
                max_tokens=2000,
            )
        except Exception as e:
            raise ValueError(f"Failed to generate quiz: {str(e)}")

        # Create quiz in database
        questions_with_ids = []
        for i, question in enumerate(quiz_data.get("questions", [])):
            questions_with_ids.append({
                **question,
                "id": str(uuid.uuid4()),
            })

        quiz = self.quiz_repo.create_quiz(
            course_id=course_id,
            title=quiz_data.get("title", f"Quiz: {course.title}"),
            questions=questions_with_ids,
        )

        return self._quiz_to_dict(quiz)

    def submit_quiz(
        self,
        course_id: str,
        user_id: str,
        answers: Dict[str, str],
    ) -> Dict[str, Any]:
        """Submit quiz answers and calculate score."""
        # Get quiz
        quiz = self.quiz_repo.get_quiz_by_course_id(course_id)
        if not quiz:
            raise ValueError("Quiz not found")

        # Calculate score
        correct_count = 0
        total_questions = len(quiz.questions)

        for question in quiz.questions:
            question_id = question.get("id")
            user_answer = answers.get(question_id, "").strip().lower()
            correct_answer = question.get("correct_answer", "").strip().lower()

            if user_answer == correct_answer:
                correct_count += 1

        score = int((correct_count / total_questions) * 100) if total_questions > 0 else 0

        # Create quiz attempt
        attempt = self.quiz_repo.create_quiz_attempt(
            user_id=user_id,
            quiz_id=quiz.id,
            score=score,
            answers=answers,
        )

        return {
            "id": attempt.id,
            "user_id": attempt.user_id,
            "quiz_id": attempt.quiz_id,
            "score": attempt.score,
            "answers": attempt.answers,
            "completed_at": attempt.completed_at.isoformat(),
            "total_questions": total_questions,
            "correct_answers": correct_count,
        }

    def get_quiz_attempts(self, course_id: str, user_id: str) -> List[Dict[str, Any]]:
        """Get all quiz attempts for a user and course."""
        quiz = self.quiz_repo.get_quiz_by_course_id(course_id)
        if not quiz:
            return []
            
        attempts = self.quiz_repo.get_quiz_attempts(user_id, quiz.id)
        
        return [
            {
                "id": attempt.id,
                "user_id": attempt.user_id,
                "quiz_id": attempt.quiz_id,
                "score": attempt.score,
                "answers": attempt.answers,
                "completed_at": attempt.completed_at.isoformat(),
            }
            for attempt in attempts
        ]

    def _quiz_to_dict(self, quiz) -> Dict[str, Any]:
        """Convert quiz model to dictionary."""
        return {
            "id": quiz.id,
            "course_id": quiz.course_id,
            "title": quiz.title,
            "questions": quiz.questions,
            "created_at": quiz.created_at.isoformat(),
        }
