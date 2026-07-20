from sqlalchemy.orm import Session
from app.models.pdf import PDF, PDFStatus
from app.schemas.pdf import PDFResponse
from typing import Optional, List


class PDFRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_pdf(
        self,
        user_id: str,
        filename: str,
        original_name: str,
        file_size: int,
        file_path: str,
    ) -> PDF:
        db_pdf = PDF(
            user_id=user_id,
            filename=filename,
            original_name=original_name,
            file_size=file_size,
            file_path=file_path,
            status=PDFStatus.PROCESSING.value,
        )
        self.db.add(db_pdf)
        self.db.commit()
        self.db.refresh(db_pdf)
        return db_pdf

    def get_pdf_by_id(self, pdf_id: str) -> Optional[PDF]:
        return self.db.query(PDF).filter(PDF.id == pdf_id).first()

    def get_pdfs_by_user(self, user_id: str) -> List[PDF]:
        return self.db.query(PDF).filter(PDF.user_id == user_id).all()

    def update_pdf_status(self, pdf_id: str, status: PDFStatus) -> Optional[PDF]:
        pdf = self.get_pdf_by_id(pdf_id)
        if pdf:
            pdf.status = status.value if isinstance(status, PDFStatus) else status
            self.db.commit()
            self.db.refresh(pdf)
        return pdf

    def delete_pdf(self, pdf_id: str) -> bool:
        pdf = self.get_pdf_by_id(pdf_id)
        if pdf:
            self.db.delete(pdf)
            self.db.commit()
            return True
        return False
