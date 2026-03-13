## Overview
This PR introduces a new **PDF Reader with LLM** service for semantic search over PDF documents. The system extracts text from PDFs, chunks it into overlapping segments, generates embeddings using `all-MiniLM-L6-v2`, and indexes both chunks (MongoDB) and embeddings (Qdrant). A FastAPI interface provides endpoints for uploading PDFs and querying their content semantically. Likely built to enable document Q&A or knowledge retrieval from unstructured PDFs.

---

## Changes by Area

### Infrastructure & Deployment
- **`Dockerfile`**: Defines a `python:3.11-slim` image with CPU-only PyTorch 2.2.2 and project dependencies. Runs FastAPI via `uvicorn` on port 8000.
- **`docker-compose.yml`**: Orchestrates 3 services:
  - `api`: FastAPI app (depends on `mongodb` and `qdrant`).
  - `mongodb`: MongoDB 6 instance (port 27017).
  - `qdrant`: Qdrant vector DB (port 6333).

### Database Layer
- **`app/database/mongodb.py`**:
  - Initializes `MongoClient` pointing to `mongodb:27017`.
  - Creates `pdf_db` database and `chunks` collection.
- **`app/database/qdrant.py`**:
  - Initializes `QdrantClient` for `qdrant:6333`.
  - Defines `COLLECTION="pdf_chunks"` and `init_collection()` to create a 384-dim Cosine-distance collection if missing.

### Core Processing Logic
- **`app/services/embeddings.py`**:
  - Loads `SentenceTransformer("all-MiniLM-L6-v2")` on import.
  - `get_embedding(text)`: Converts text to 384-dim vector using the model.
- **`app/services/chunker.py`**:
  - `chunk_text(text, size=500, overlap=50)`: Splits text into overlapping word-based chunks.
- **`app/services/pdf_loader.py`**:
  - `extract_pdf_text(file_path)`: Uses `PyPDF` to extract text per page, returns `(page_num, text)` tuples.
- **`app/services/search.py`**:
  - `index_chunks(pdf_id, page, chunks)`: Stores chunks in MongoDB and embeddings in Qdrant with metadata.
  - `search_query(query, top_k=5)`: Queries Qdrant for top-k semantic matches, enriches results with chunk text from MongoDB.

### API Layer
- **`app/main.py`**:
  - FastAPI app with two endpoints:
    - `POST /upload-pdf`: Accepts PDF uploads, processes text, and indexes chunks.
    - `POST /query`: Accepts `QueryRequest` (from `app/models/schemas.py`) and returns semantic search results.
  - `startup()` event handler initializes Qdrant collection.
- **`app/models/schemas.py`**:
  - Defines `QueryRequest` Pydantic model with a single `query: str` field.

### Miscellaneous
- **`requirements.txt`**: Lists dependencies including `fastapi`, `pymongo`, `qdrant-client`, `pypdf`, and `sentence-transformers`.
- **`Grandma's Bag of Stories.pdf`**: Sample PDF (binary) likely for testing.
- **`desktop.ini`**: Windows folder metadata (no functional impact).

---

## Commit Walkthrough
**Commit ec0893ef: "Add PDF Reader with LLM project"**
- Single commit adding all files. No incremental changes; this is a ground-up implementation of the PDF reader service with:
  - Docker infrastructure.
  - Database integrations (MongoDB + Qdrant).
  - Text processing pipeline (PDF → chunks → embeddings).
  - FastAPI endpoints for uploads and queries.

---

## Architectural Impact

### Confirmed Changes
1. **New Service**: Standalone FastAPI app with dedicated Docker setup.
2. **Dual Database**:
   - **MongoDB**: Stores raw text chunks with metadata (`pdf_id`, `page`).
   - **Qdrant**: Stores embeddings with payloads linking to MongoDB (`pdf_id`, `page`).
3. **Data Flow**:
   - PDF → `extract_pdf_text` → `chunk_text` → `get_embedding` → `index_chunks` (MongoDB + Qdrant).
   - Query → `get_embedding` → Qdrant search → MongoDB lookup → response.
4. **Embedding Model**: `all-MiniLM-L6-v2` (384-dim) runs in CPU mode (no GPU support in Dockerfile).
5. **API Contract**:
   - `/upload-pdf`: Returns `{"message": "PDF indexed successfully"}`.
   - `/query`: Returns `{"results": [{"text": str, "page": int, "score": float}]}`.

### Likely Impacts
- **Resource Usage**: Embedding generation and Qdrant searches may become bottlenecks for large PDFs or high query volumes.
- **Error Handling**: Missing validation for:
  - PDF corruption/empty text.
  - Database connection failures.
  - Qdrant collection initialization races (if multiple instances start simultaneously).
- **Scalability**: Current chunking (500 words) and overlap (50 words) are hardcoded; may need tuning for different document types.
- **Security**: No authentication on API endpoints or database connections.

---

## Review Notes

### Critical Areas to Review
1. **File Upload Security** (`app/main.py`):
   - No file type/size validation in `upload_pdf`.
   - Temporary files stored in `/tmp/` with UUID names (risk of directory traversal if not sanitized).
2. **Database Connections** (`app/database/*`):
   - Hardcoded credentials (none) and hostnames (`mongodb`, `qdrant`). Fails if service names change.
   - No connection retries or error handling.
3. **Embedding Performance** (`app/services/embeddings.py`):
   - Model loaded on import (cold start latency).
   - CPU-only PyTorch may be slow for large batches.
4. **Chunking Logic** (`app/services/chunker.py`):
   - Splits on whitespace only; may break mid-sentence or mid-word for non-space delimiters.
   - Fixed `size=500` and `overlap=50` may not suit all PDFs (e.g., tables, code blocks).
5. **Search Reliability** (`app/services/search.py`):
   - No handling for missing MongoDB documents (silently skips if `chunks_collection.find_one` returns `None`).
   - Qdrant `upsert` may overwrite existing chunks with the same ID (unlikely due to UUIDs, but no conflict checks).

### Edge Cases to Test
- **PDF Variants**:
  - Scanned PDFs (OCR not implemented; `PyPDF` will return empty text).
  - Password-protected PDFs (will fail silently in `extract_pdf_text`).
  - Multi-language PDFs (embedding model is English-focused).
- **Concurrency**:
  - Simultaneous uploads (race conditions in Qdrant collection init or MongoDB writes).
  - High query load (Qdrant/MongoDB connection pooling not configured).
- **Data Integrity**:
  - Partial failures (e.g., MongoDB insert succeeds but Qdrant `upsert` fails).
  - Duplicate PDF uploads (same content, different `pdf_id`).

### Suggested Improvements
- Add `try-catch` blocks for DB operations and file handling.
- Validate PDFs before processing (e.g., check for extractable text).
- Parameterize chunk size/overlap via config or API parameters.
- Add health checks for dependencies (MongoDB, Qdrant).
- Consider async processing for large PDFs (e.g., Celery tasks).

---

## Priority Rating
**HIGH**
Justification:
- **New Feature**: Introduces a complex system with multiple integrations (Docker, databases, embeddings).
- **Security Risks**: Unvalidated file uploads and unauthenticated API endpoints.
- **Performance Unknowns**: Untested with large PDFs or concurrent users.
- **Error Handling Gaps**: Missing validation and recovery for critical paths (DB, file ops, embeddings).
- **Production Readiness**: Hardcoded configs and lack of monitoring/health checks.

Reviewers should prioritize:
1. Security (file uploads, DB access).
2. Error resilience (DB failures, malformed PDFs).
3. Performance (embedding generation, Qdrant queries).