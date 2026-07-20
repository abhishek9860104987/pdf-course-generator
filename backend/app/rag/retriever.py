from app.rag.vector_store import CourseVectorStore
from typing import List, Tuple
from app.repositories.course_repository import CourseRepository
from sqlalchemy.orm import Session


class RAGRetriever:
    def __init__(self, db: Session):
        self.db = db
        self.course_repo = CourseRepository(db)

    def get_relevant_content(
        self,
        course_id: str,
        query: str,
        k: int = 5
    ) -> List[Tuple[str, float]]:
        """Retrieve relevant content for a query using RAG."""
        # Get course
        course = self.course_repo.get_course_by_id(course_id)
        if not course:
            return []

        # Initialize or load vector store
        vector_store = CourseVectorStore(course_id)
        
        if not vector_store.exists():
            # Build vector store from course content
            content_chunks = self._extract_course_content(course)
            if content_chunks:
                vector_store.initialize_from_content(content_chunks)
        
        # Search for relevant content
        results = vector_store.search(query, k)
        return results

    def _extract_course_content(self, course) -> List[str]:
        """Extract content chunks from a course."""
        chunks = []
        
        for chapter in course.chapters:
            for lesson in chapter.lessons:
                # Add lesson content
                if lesson.content:
                    chunks.append(lesson.content)
                
                # Add explanation
                if lesson.explanation:
                    chunks.append(lesson.explanation)
                
                # Add example
                if lesson.example:
                    chunks.append(lesson.example)
                
                # Add key takeaways
                if lesson.key_takeaways:
                    chunks.append("Key Takeaways: " + " ".join(lesson.key_takeaways))
                
                # Add important notes
                if lesson.important_notes:
                    chunks.append("Important Notes: " + " ".join(lesson.important_notes))
        
        return chunks

    def build_context(self, query: str, course_id: str, max_chunks: int = 3) -> str:
        """Build context for AI from retrieved content."""
        results = self.get_relevant_content(course_id, query, k=max_chunks)
        
        if not results:
            return ""
        
        context_parts = []
        for content, score in results:
            context_parts.append(f"[Relevance: {1 - score:.2f}]\n{content}")
        
        return "\n\n---\n\n".join(context_parts)

    def rebuild_vector_store(self, course_id: str):
        """Rebuild the vector store for a course."""
        course = self.course_repo.get_course_by_id(course_id)
        if not course:
            return

        vector_store = CourseVectorStore(course_id)
        content_chunks = self._extract_course_content(course)
        
        if content_chunks:
            vector_store.initialize_from_content(content_chunks)
