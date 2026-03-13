# While You Were Gone — Since 2026-03-13 20:08:26+05:30

You were gone for less than a day, but three major new components were introduced: a **React 18.3.1 frontend layer**, the **SplitFM framework** for privacy-preserving, resource-efficient fine-tuning and inference, and a **PDF Reader with LLM** service for semantic search over PDFs. The codebase now includes a Dockerized Nginx deployment for the frontend, a new `.gitignore` setup for PyTorch model files, and a FastAPI service with MongoDB/Qdrant integration. Expect backend API adjustments for CORS, new CI/CD requirements for frontend builds, potential dependency conflicts between SplitLoRA (PyTorch 1.7.1) and SplitInfer (PyTorch 2.4.1), and a new semantic search pipeline for PDFs.

## Critical Changes (Must-Read)

1. **React 18.3.1 frontend added**
   A full React app is now part of the stack, with minified production files (`react.production.min.js`, `scheduler.production.min.js`, `react-jsx-runtime.production.min.js`). You’ll need Node.js 20+ locally to match the Docker build environment.

2. **New multi-stage Dockerfile**
   The build process now splits into:
   - `builder` stage (Node 20 + `npm run build`)
   - Nginx stage (serves static files on port 80)
   Expect deployment pipelines to require updates for frontend builds.

3. **Nginx routing rules (implied)**
   The Dockerfile references a custom `nginx.conf` (not in diff). Likely includes SPA fallback to `index.html`. Verify this doesn’t conflict with existing backend routes.

4. **SplitFM framework introduced**
   A new framework combining **SplitLoRA** (parameter-efficient fine-tuning) and **SplitInfer** (split inference) for foundation models (e.g., GPT-2, Llama3). This includes:
   - **Breaking changes**: Replace `nn.Linear`/`nn.Embedding` with `loralib.Linear` and use `lora_state_dict` for checkpoints.
   - **Dependency conflicts**: SplitLoRA requires PyTorch 1.7.1, while SplitInfer requires PyTorch 2.4.1.
   - **New training flags**: `--lora_dim`, `--train_batch_size`, and split data paths (`--train_data0`, `--train_data1`).

5. **PDF Reader with LLM service added**
   A FastAPI service for uploading PDFs, chunking text, indexing embeddings in Qdrant, and semantic search. Key components:
   - **Dockerized stack**: FastAPI (port 8000), MongoDB (port 27017), Qdrant (port 6333).
   - **Endpoints**: `/upload-pdf` (ingests PDFs) and `/query` (semantic search).
   - **Embeddings**: Uses `all-MiniLM-L6-v2` (384-dim vectors) for semantic search.
   - **Chunking**: Splits text into 500-token chunks with 50-token overlap.

6. **Submodule removed**
   The submodule at commit `5da7a2ecce4e20501f53adf5797ac70a2be3a0f4` was detached. Builds depending on it may break.

## New Features & Additions

- **Frontend UI layer**
  React hooks (`useState`, `useEffect`) and JSX transforms are now available. The app is production-optimized (minified builds).

- **SplitFM documentation**
  The `README.md` now includes:
  - Environment specs (Ubuntu 18.04, Python 3.7.16/3.8.20, PyTorch 1.7.1/2.4.1).
  - Quick-start guides for SplitLoRA (fine-tuning) and SplitInfer (inference).
  - Hyperparameter tables and code snippets for immediate use.
  - **Update:** Supported models now include DeepSeek-R1, Qwen2-VL, Llama3, and GPT-2.

- **PDF semantic search**
  - Upload PDFs via `/upload-pdf` to extract, chunk, and index text.
  - Query indexed content via `/query` for top-5 semantic matches.
  - Sample PDF (`Grandma's Bag of Stories.pdf`) included for testing.

## Refactors & Structural Changes

- **New directory structure (implied)**
  The Dockerfile copies files from `/app/build` (standard React output). Expect a `src/` directory and `package.json` in the repo.
  **Update:** The `README.md` documents additional directories for SplitFM: `src/`, `eval/`, `data/`, and `vocab/`.
  **Update:** New directories for PDF Reader: `app/`, `app/database/`, `app/services/`, `app/models/`.

- **PyTorch model file handling**
  `.gitignore` now excludes `*.pth` and `*.pt` files, along with Python cache (`__pycache__`).
  **Update:** `.DS_Store` (macOS metadata) is also now ignored.

- **SplitFM source files (documented but not yet committed)**
  The `README.md` references three new files:
  - `infer_modelsplit.py`: Demo script for split inference.
  - `modelsplit.py`: Split model definitions (modified from Hugging Face `transformers`).
  - `utils.py`: Helper functions for parameter loading/counting.

- **PDF Reader service files**
  - `Dockerfile`: Multi-stage build for FastAPI + dependencies.
  - `docker-compose.yml`: Orchestrates FastAPI, MongoDB, and Qdrant.
  - Core logic in `app/services/` (chunking, embeddings, search).

## New Dependencies & Config Changes

- **Node.js 20**
  Required locally to match the Docker build environment.

- **Nginx 1.25**
  Used in production to serve static files. Port 80 is now reserved for the frontend.

- **Environment implications**
  Backend APIs must enable CORS for the frontend’s origin. Check for new `ALLOWED_ORIGINS` or similar config keys.
  **Update:** SplitFM introduces new dependencies:
  - PyTorch 1.7.1+cu110 (SplitLoRA) or 2.4.1 (SplitInfer).
  - `loralib` for LoRA layers (`pip install loralib`).
  - Ubuntu 18.04 as the verified OS.

- **PDF Reader dependencies**
  - `fastapi`, `uvicorn`, `pymongo`, `qdrant-client==1.8.2`, `sentence-transformers`, `pypdf`.
  - CPU-only `torch==2.2.2` (for embeddings).