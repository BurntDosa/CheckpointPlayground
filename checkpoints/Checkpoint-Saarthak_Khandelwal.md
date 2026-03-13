## Commit `ec0893e` — 2026-03-13

## Context
This commit introduces a new **PDF Reader with LLM** project, a FastAPI service for uploading PDFs, chunking their text, indexing embeddings in Qdrant, and enabling semantic search. The commit message and diff suggest this is a ground-up implementation (no prior files existed). The system appears designed to:
- Extract text from PDFs using `PyPDF`.
- Split text into chunks (500 tokens, 50-token overlap).
- Generate embeddings via `all-MiniLM-L6-v2` (sentence-transformers).
- Store chunks in MongoDB and embeddings in Qdrant.
- Provide FastAPI endpoints for PDF uploads and semantic queries.

Likely built for a document Q&A system where users query PDF content via embeddings.

## Changes

### Docker & Infrastructure
- **`Dockerfile`**: New file. Uses `python:3.11-slim`, installs CPU-only PyTorch 2.2.2, then dependencies from `requirements.txt`. Runs FastAPI via `uvicorn` on port 8000.
- **`docker-compose.yml`**: New file. Defines 3 services:
  - `api`: FastAPI app (depends on `mongodb` and `qdrant`).
  - `mongodb`: MongoDB 6 instance (port 27017).
  - `qdrant`: Qdrant vector DB (port 6333).

### Database
- **`app/database/mongodb.py`**: New file. Initializes MongoDB client pointing to `mongodb:27017`, creates `pdf_db` database and `chunks` collection.
- **`app/database/qdrant.py`**: New file. Initializes Qdrant client, defines `COLLECTION="pdf_chunks"`, and `init_collection()` to create a 384-dim Cosine-distance collection if missing.

### Core Logic
- **`app/services/embeddings.py`**: New file. Loads `all-MiniLM-L6-v2` model, exposes `get_embedding(text)` to convert text to 384-dim vectors.
- **`app/services/chunker.py`**: New file. `chunk_text(text, size=500, overlap=50)` splits text into overlapping chunks.
- **`app/services/pdf_loader.py`**: New file. `extract_pdf_text(file_path)` uses `PyPDF` to extract text per page, returns list of `(page_num, text)` tuples.
- **`app/services/search.py`**: New file. Two functions:
  - `index_chunks(pdf_id, page, chunks)`: Stores chunks in MongoDB and embeddings in Qdrant.
  - `search_query(query, top_k=5)`: Queries Qdrant for top-k semantic matches, retrieves full chunks from MongoDB.

### API
- **`app/main.py`**: New FastAPI app with:
  - `startup()`: Calls `init_collection()` on app start.
  - `upload_pdf`: Accepts PDF uploads, extracts text, chunks it, and indexes via `index_chunks`.
  - `query_pdf`: Accepts `QueryRequest` (defined in `app/models/schemas.py`), returns semantic search results via `search_query`.
- **`app/models/schemas.py`**: New file. Defines `QueryRequest` Pydantic model with a `query: str` field.

### Miscellaneous
- **`requirements.txt`**: New file. Lists dependencies: `fastapi`, `uvicorn`, `pymongo`, `qdrant-client`, `pypdf`, `sentence-transformers`, etc.
- **`Grandma's Bag of Stories.pdf`**: Sample PDF added (binary, likely for testing).
- **`desktop.ini`**: Windows folder metadata (unrelated to functionality).

## Impact
**Confirmed:**
- New FastAPI service on port 8000 with `/upload-pdf` and `/query` endpoints.
- MongoDB and Qdrant instances launched via `docker-compose`.
- PDF text extraction, chunking, and embedding generation fully implemented.
- Semantic search returns chunk text, page numbers, and similarity scores.

**Likely:**
- Requires Docker and `docker-compose` to run locally.
- Embedding model (`all-MiniLM-L6-v2`) runs in CPU mode (no GPU config in Dockerfile).
- Qdrant collection uses Cosine similarity, optimized for semantic search.
- MongoDB stores raw chunks; Qdrant stores only vectors + metadata (avoids duplication).

## Priority Rating
**HIGH**: This is a new feature implementation with multiple moving parts (Docker, databases, embeddings, API). Critical to review for:
- Security (file uploads, DB connections).
- Performance (chunking/embedding at scale).
- Error handling (missing pages, DB failures).

---

## Commit `ec0893e` — 2026-03-13

## Context
This commit introduces a new **PDF Reader with LLM** project—a FastAPI service that ingests PDFs, chunks their text, generates embeddings, and enables semantic search. The system uses **MongoDB** for metadata storage and **Qdrant** for vector search. The commit message suggests this is a foundational setup, likely for a larger LLM-powered document Q&A system (e.g., RAG). The included PDF (`Grandma's Bag of Stories`) appears to be a test file.

## Changes

### Infrastructure (`Dockerfile`, `docker-compose.yml`, `requirements.txt`)
- **Dockerfile**:
  - Base image: `python:3.11-slim`.
  - Installs CPU-only `torch==2.2.2` (for `sentence-transformers`) before copying requirements.
  - Runs FastAPI/Uvicorn on port `8000` with `app.main:app`.

- **docker-compose.yml**:
  - Services:
    - `api`: Builds the FastAPI app, depends on `mongodb` and `qdrant`.
    - `mongodb`: Exposes port `27017`.
    - `qdrant`: Exposes port `6333`.

- **requirements.txt**:
  - Key deps: `fastapi`, `pymongo`, `qdrant-client==1.8.2`, `sentence-transformers`, `pypdf`.

### Database (`app/database/mongodb.py`, `app/database/qdrant.py`)
- **mongodb.py**:
  - Initializes `MongoClient` pointing to `mongodb://mongodb:27017`.
  - Creates database `pdf_db` with collection `chunks`.

- **qdrant.py**:
  - Initializes `QdrantClient` (host: `qdrant`, port: `6333`).
  - Defines collection `pdf_chunks` with vector size `384` (matches `all-MiniLM-L6-v2` embedding dim) and `Cosine` distance.
  - `init_collection()`: Creates collection if it doesn’t exist.

### Core Logic (`app/services/`, `app/main.py`)
- **main.py**:
  - FastAPI app with two endpoints:
    - `POST /upload-pdf`: Accepts a PDF, extracts text via `extract_pdf_text()`, chunks it (`chunk_text()`), and indexes chunks (`index_chunks()`).
    - `POST /query`: Accepts a `QueryRequest` (defined in `app/models/schemas.py`), calls `search_query()`, and returns results.
  - Startup event calls `init_collection()`.

- **services/pdf_loader.py**:
  - `extract_pdf_text(file_path)`: Uses `PyPDF2` to extract text per page, returns list of `(page_num, text)` tuples.

- **services/chunker.py**:
  - `chunk_text(text, size=500, overlap=50)`: Splits text into chunks of ~500 words with 50-word overlap.

- **services/embeddings.py**:
  - Loads `all-MiniLM-L6-v2` model via `sentence-transformers`.
  - `get_embedding(text)`: Returns 384-dim embedding for input text.

- **services/search.py**:
  - `index_chunks(pdf_id, page, chunks)`:
    - Generates UUID for each chunk.
    - Stores chunk text/metadata in MongoDB.
    - Upserts embedding + payload (PDF ID, page) to Qdrant.
  - `search_query(query, top_k=5)`:
    - Embeds query, searches Qdrant, and hydrates results with chunk text from MongoDB.

### Miscellaneous
- **Desktop.ini**: Windows folder metadata (labels folder as "PDF Reader").
- **Test PDF**: `Grandma's Bag of Stories - Sudha Murthy.pdf` (likely for testing ingestion).

## Impact
**Confirmed**:
- New FastAPI service at `0.0.0.0:8000` with two endpoints.
- MongoDB collection `chunks` and Qdrant collection `pdf_chunks` are auto-initialized on startup.
- PDF uploads trigger text extraction, chunking, and dual-write to MongoDB/Qdrant.
- Queries return top-5 semantic matches with text, page number, and score.

**Likely**:
- Designed for extension: Missing LLM integration (e.g., to generate answers from retrieved chunks).
- `torch` CPU-only install suggests no GPU support (may limit embedding performance).
- No auth/rate-limiting on endpoints (not production-ready).
- Chunk size (`500`) and overlap (`50`) are hardcoded; may need tuning for different PDFs.

## Priority Rating
**HIGH**: This is a foundational commit for a new service, but lacks critical features (auth, error handling, LLM integration) and has hardcoded values. Review the chunking strategy and embedding model choice before building on top.
