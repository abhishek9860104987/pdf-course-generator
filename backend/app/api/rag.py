from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.rag.retriever import RAGRetriever
from app.utils.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/rag", tags=["rag"])


@router.post("/search")
async def search_content(
    course_id: str,
    query: str,
    k: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Search for relevant content in a course using RAG."""
    retriever = RAGRetriever(db)
    results = retriever.get_relevant_content(course_id, query, k)
    
    return [
        {
            "content": content,
            "relevance_score": 1 - score,
        }
        for content, score in results
    ]


@router.post("/context")
async def get_context(
    course_id: str,
    query: str,
    max_chunks: int = 3,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get context for AI from retrieved content."""
    retriever = RAGRetriever(db)
    context = retriever.build_context(query, course_id, max_chunks)
    
    return {"context": context}


@router.post("/rebuild/{course_id}")
async def rebuild_vector_store(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Rebuild the vector store for a course."""
    retriever = RAGRetriever(db)
    retriever.rebuild_vector_store(course_id)
    
    return {"message": "Vector store rebuilt successfully"}
