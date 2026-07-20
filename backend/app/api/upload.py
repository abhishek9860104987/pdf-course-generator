from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.pdf_service import PDFService
from app.utils.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("/")
async def upload_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a PDF file."""
    pdf_service = PDFService(db)
    result = await pdf_service.upload_pdf(file, current_user.id)
    return result


@router.get("/pdfs")
async def get_user_pdfs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all PDFs for the current user."""
    pdf_service = PDFService(db)
    return pdf_service.get_user_pdfs(current_user.id)


@router.get("/pdf/{pdf_id}/content")
async def get_pdf_content(
    pdf_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Extract and return PDF content."""
    pdf_service = PDFService(db)
    return pdf_service.get_pdf_content(pdf_id)


@router.delete("/pdf/{pdf_id}")
async def delete_pdf(
    pdf_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a PDF."""
    pdf_service = PDFService(db)
    pdf_service.delete_pdf(pdf_id, current_user.id)
    return {"message": "PDF deleted successfully"}
