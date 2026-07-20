from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException
from app.repositories.pdf_repository import PDFRepository
from app.utils.pdf_processor import PDFProcessor
from app.config.settings import settings
import os
import uuid
from typing import Optional


class PDFService:
    def __init__(self, db: Session):
        self.db = db
        self.pdf_repo = PDFRepository(db)

    async def upload_pdf(
        self, file: UploadFile, user_id: str
    ) -> dict:
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")

        # Validate file size
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Seek back to beginning

        if file_size > settings.max_file_size:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum limit of {settings.max_file_size / 1024 / 1024}MB"
            )

        # Create upload directory if it doesn't exist
        os.makedirs(settings.upload_dir, exist_ok=True)

        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(settings.upload_dir, unique_filename)

        # Save file
        try:
            contents = await file.read()
            with open(file_path, "wb") as f:
                f.write(contents)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

        # Validate PDF
        processor = PDFProcessor(file_path)
        if not processor.validate_pdf():
            os.remove(file_path)
            raise HTTPException(status_code=400, detail="Invalid PDF file")

        # Create PDF record in database
        pdf = self.pdf_repo.create_pdf(
            user_id=user_id,
            filename=unique_filename,
            original_name=file.filename,
            file_size=file_size,
            file_path=file_path,
        )

        return {
            "id": pdf.id,
            "filename": pdf.original_name,
            "file_size": pdf.file_size,
            "status": pdf.status if isinstance(pdf.status, str) else pdf.status.value,
            "upload_date": pdf.upload_date.isoformat(),
        }

    def get_pdf_content(self, pdf_id: str) -> dict:
        """Extract and return PDF content."""
        pdf = self.pdf_repo.get_pdf_by_id(pdf_id)
        if not pdf:
            raise HTTPException(status_code=404, detail="PDF not found")

        processor = PDFProcessor(pdf.file_path)
        
        return {
            "text": processor.extract_text(),
            "structured_content": processor.extract_text_with_structure(),
            "tables": processor.extract_tables(),
            "metadata": processor.extract_metadata(),
            "chunks": processor.chunk_text(processor.extract_text()),
        }

    def delete_pdf(self, pdf_id: str, user_id: str) -> bool:
        """Delete PDF and associated file."""
        pdf = self.pdf_repo.get_pdf_by_id(pdf_id)
        if not pdf:
            raise HTTPException(status_code=404, detail="PDF not found")

        if pdf.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this PDF")

        # Delete file from disk
        try:
            if os.path.exists(pdf.file_path):
                os.remove(pdf.file_path)
        except Exception as e:
            print(f"Failed to delete file: {e}")

        # Delete from database
        return self.pdf_repo.delete_pdf(pdf_id)

    def get_user_pdfs(self, user_id: str) -> list:
        """Get all PDFs for a user."""
        pdfs = self.pdf_repo.get_pdfs_by_user(user_id)
        return [
            {
                "id": pdf.id,
                "filename": pdf.original_name,
                "file_size": pdf.file_size,
                "status": pdf.status if isinstance(pdf.status, str) else pdf.status.value,
                "upload_date": pdf.upload_date.isoformat(),
            }
            for pdf in pdfs
        ]
