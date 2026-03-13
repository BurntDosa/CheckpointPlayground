from pypdf import PdfReader

def extract_pdf_text(file_path):
    reader = PdfReader(file_path)
    pages = []

    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text:
            pages.append((i + 1, text))

    return pages
