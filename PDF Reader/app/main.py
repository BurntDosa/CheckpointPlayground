from fastapi import FastAPI, UploadFile, File
import shutil
import uuid

from app.database.qdrant import init_collection
from app.services.pdf_loader import extract_pdf_text
from app.services.chunker import chunk_text
from app.services.search import index_chunks, search_query
from app.models.schemas import QueryRequest

app = FastAPI()

@app.on_event("startup")
def startup():
    init_collection()

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    pdf_id = str(uuid.uuid4())
    path = f"/tmp/{pdf_id}.pdf"

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    pages = extract_pdf_text(path)

    for page_num, text in pages:
        chunks = chunk_text(text)
        index_chunks(pdf_id, page_num, chunks)

    return {"message": "PDF indexed successfully"}

@app.post("/query")
async def query_pdf(request: QueryRequest):
    results = search_query(request.query)
    return {"results": results}
