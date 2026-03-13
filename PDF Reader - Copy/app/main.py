from fastapi import FastAPI, UploadFile, File
import shutil
import uuid

from app.database.qdrant import init_collection
from app.services.pdf_loader import extract_pdf_text
from app.services.chunker import chunk_text
from app.services.search import index_chunks, search_query
from app.models.schemas import QueryRequest
from app.services.llm import generate_answer
from app.services.highlighter import extract_highlight_sentences
from app.services.pdf_registry import list_pdfs
from app.database.mongodb import chunks_collection



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

    return {
        "message": "PDF indexed successfully",
        "pdf_id": pdf_id
    }

@app.post("/query")
async def query_pdf(request: QueryRequest):
    results = search_query(
        request.query,
        request.pdf_id,
        top_k=5
    )

    if not results:
        return {
            "answer": "No relevant information found.",
            "sources": [],
            "highlights": []
        }

    contexts = []
    for r in results:
        contexts.append(
            r["text"] + "\n" +
            r.get("prev_text", "") + "\n" +
            r.get("next_text", "")
        )


    answer = generate_answer(
        question=request.query,
        contexts=contexts
    )

    highlights = extract_highlight_sentences(
        query=request.query,
        chunks=results
    )

    return {
        "answer": answer,
        "sources": [
            {
                "page": r["page"],
                "score": r["final_score"]
            }
            for r in results
        ],
        "highlights": highlights
    }


@app.get("/pdfs")
async def get_uploaded_pdfs():
    """
    List all uploaded PDFs and their IDs
    """
    pdfs = list_pdfs()

    if not pdfs:
        return {
            "pdfs": [],
            "message": "No PDFs uploaded yet"
        }

    return {
        "pdfs": pdfs
    }


@app.get("/chunks")
async def view_chunks(
    pdf_id: str,
    limit: int = 5
):
    """
    View raw text chunks for a given PDF (debug endpoint)
    """
    chunks = list(
        chunks_collection.find(
            { "pdf_id": pdf_id },
            { "_id": 0, "page": 1, "text": 1 }
        ).limit(limit)
    )

    return {
        "pdf_id": pdf_id,
        "count": len(chunks),
        "chunks": chunks
    }   