import fitz  # PyMuPDF
import pdfplumber
from typing import List, Dict, Optional
import os


class PDFProcessor:
    def __init__(self, file_path: str):
        self.file_path = file_path

    def extract_text(self) -> str:
        """Extract text from PDF using PyMuPDF, with OCR fallback for scanned images."""
        doc = fitz.open(self.file_path)
        text = ""
        for page in doc:
            page_text = page.get_text()
            if not page_text.strip():
                # Fallback to OCR if page has no selectable text
                try:
                    # Attempt to extract using pytesseract if installed
                    import pytesseract
                    from PIL import Image
                    import io
                    pix = page.get_pixmap()
                    img_data = pix.tobytes("png")
                    img = Image.open(io.BytesIO(img_data))
                    page_text = pytesseract.image_to_string(img)
                except ImportError:
                    try:
                        # Attempt using easyocr if installed
                        import easyocr
                        import numpy as np
                        reader = easyocr.Reader(['en'])
                        pix = page.get_pixmap()
                        img_data = pix.tobytes("png")
                        # Convert to numpy array for easyocr
                        from PIL import Image
                        import io
                        img = Image.open(io.BytesIO(img_data))
                        page_text = " ".join(reader.readtext(np.array(img), detail=0))
                    except Exception:
                        page_text = "[Scanned Image Page - OCR libraries pytesseract or easyocr not installed]"
                except Exception as ocr_err:
                    page_text = f"[OCR Failed: {str(ocr_err)}]"
            text += page_text + "\n"
        doc.close()
        return text

    def extract_text_with_structure(self) -> List[Dict]:
        """Extract text with page and structure information."""
        doc = fitz.open(self.file_path)
        structured_content = []
        
        for page_num, page in enumerate(doc):
            blocks = page.get_text("dict")["blocks"]
            page_content = {
                "page_number": page_num + 1,
                "text": page.get_text(),
                "blocks": []
            }
            
            for block in blocks:
                if "lines" in block:
                    block_text = ""
                    for line in block["lines"]:
                        for span in line["spans"]:
                            block_text += span["text"]
                    
                    if block_text.strip():
                        page_content["blocks"].append({
                            "text": block_text.strip(),
                            "type": "text" if block.get("type") == 0 else "image"
                        })
            
            structured_content.append(page_content)
        
        doc.close()
        return structured_content

    def extract_tables(self) -> List[Dict]:
        """Extract tables from PDF using pdfplumber."""
        tables = []
        with pdfplumber.open(self.file_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                page_tables = page.extract_tables()
                if page_tables:
                    for table in page_tables:
                        tables.append({
                            "page_number": page_num + 1,
                            "table": table
                        })
        return tables

    def extract_metadata(self) -> Dict:
        """Extract PDF metadata."""
        doc = fitz.open(self.file_path)
        metadata = doc.metadata
        metadata["page_count"] = len(doc)
        doc.close()
        return metadata

    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Split text into chunks with overlap for RAG."""
        chunks = []
        start = 0
        text_length = len(text)
        
        while start < text_length:
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start = end - overlap
        
        return chunks

    def get_file_size(self) -> int:
        """Get file size in bytes."""
        return os.path.getsize(self.file_path)

    def validate_pdf(self) -> bool:
        """Validate if file is a valid PDF."""
        try:
            doc = fitz.open(self.file_path)
            doc.close()
            return True
        except Exception:
            return False
