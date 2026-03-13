# While You Were Gone — Since 2026-03-13 22:07:08+05:30

You missed a major shift: the repo now has **two new foundational systems**—a React 18.3.1 frontend and a FastAPI-based PDF Reader with LLM embeddings. The frontend introduces a Dockerized Nginx pipeline, while the backend adds MongoDB, Qdrant, and semantic search. A noise commit (`hehe`) and `.DS_Store` additions can be ignored.

## Critical Changes (Must-Read)

1. **React 18.3.1 frontend introduced**
   A full React setup (core, scheduler, JSX runtime) was added as minified production files. This is a *new dependency* with no prior frontend framework in the codebase. Expect:
   - Backend APIs must now handle CORS for frontend requests.
   - Deployment pipelines need a new stage to build Docker images with Node 20 + Nginx.
   - Local development requires `node:20-alpine` (matching the Dockerfile) and a React build step.

2. **Dockerfile overhaul for multi-stage builds**
   The new `Dockerfile` replaces any prior frontend container setup. It uses:
   - **Stage 1 (`builder`)**: `node:20-alpine` to install dependencies and run `npm run build`.
   - **Stage 2**: `nginx:1.25-alpine` to serve static files on port 80.
   - *Action*: Update your local Docker setup and CI/CD to account for this. The Nginx config (referenced but not committed) likely includes SPA routing (e.g., fallback to `index.html`).

3. **Port 80 now reserved for Nginx**
   The frontend serves static assets on port 80 via Nginx. If the backend previously used this port:
   - Conflict risk in local/dev environments.
   - *Action*: Verify port assignments in `docker-compose.yml` (if used) and update accordingly.

4. **PDF Reader with LLM backend service added**
   A new FastAPI service (`app/main.py`) for PDF ingestion and semantic search:
   - Uploads PDFs, extracts text via `PyPDF`, chunks it (500 tokens, 50-token overlap), and indexes embeddings in **Qdrant**.
   - Uses **MongoDB** to store raw text chunks and metadata.
   - Exposes two endpoints:
     - `POST /upload-pdf`: Accepts PDFs, processes them, and stores chunks/vectors.
     - `POST /query`: Returns top-5 semantic matches for a query (hydrated from MongoDB).
   - **Dependencies**: Runs on port 8000, requires `mongodb:27017` and `qdrant:6333` (defined in `docker-compose.yml`).
   - **Action**: Review security (file uploads, DB connections) and performance (CPU-only PyTorch).

5. **New Docker Compose stack**
   The `docker-compose.yml` now defines 3 services:
   - `api`: FastAPI app (depends on `mongodb` and `qdrant`).
   - `mongodb`: MongoDB 6 instance.
   - `qdrant`: Vector DB for embeddings.
   **Update**: This supersedes any prior backend-only Docker setup. You’ll need to rebuild containers and verify network connectivity between services.

6. **Submodule removed**
   The submodule at commit `5da7a2ecce4e20501f53adf5797ac70a2be3a0f4` was detached. **Action**: Check if your local build or CI/CD references this submodule—updates are needed to avoid breaks.

## New Features & Additions

- **React 18.3.1 with concurrent rendering support**
  The minified files include:
  - Core React (`react.production.min.js`): `useState`, `useEffect`, and concurrent features like `startTransition`.
  - Scheduler (`scheduler.production.min.js`): Prioritizes rendering work.
  - JSX Runtime (`react-jsx-runtime.production.min.js`): Enables the new JSX transform (no `React.createElement` imports needed).
  *Note*: No source files (e.g., `.jsx`, `.tsx`) were committed—this appears to be a pre-built setup. You’ll need to locate or recreate the original React project structure.

- **PDF semantic search pipeline**
  - **Text extraction**: `PyPDF` pulls text from PDFs (e.g., the included `Grandma's Bag of Stories.pdf` test file).
  - **Chunking**: Splits text into 500-token chunks with 50-token overlap (`app/services/chunker.py`).
  - **Embeddings**: Uses `all-MiniLM-L6-v2` (384-dim vectors) via `sentence-transformers` (`app/services/embeddings.py`).
  - **Storage**: Chunks in MongoDB; vectors in Qdrant with metadata (PDF ID, page number).
  - **Search**: Queries return chunk text, page numbers, and similarity scores (`app/services/search.py`).

- **Nginx as static file server**
  The Dockerfile’s second stage uses Nginx to serve the React app. Expect this to replace or proxy existing backend-served UI templates. The exact routing rules aren’t visible yet, but assume `/` and SPA-style paths (e.g., `/dashboard`) will hit the frontend.

## Refactors & Structural Changes

- **Docker Compose expansion**
  The new `docker-compose.yml` adds `mongodb` and `qdrant` services alongside the FastAPI `api`. **Update**: This replaces any prior single-container setup. Key details:
  - `api` depends on both databases and exposes port `8000`.
  - `mongodb` uses default port `27017`; `qdrant` uses `6333`.
  - No volumes are defined—data is ephemeral unless you add them locally.

- **Database initialization logic**
  The FastAPI app (`app/main.py`) now calls `init_collection()` on startup to ensure the Qdrant collection (`pdf_chunks`) exists with the correct vector size (384) and distance metric (`Cosine`).

## New Dependencies & Config Changes

- **Node.js 20+ required**
  The Dockerfile uses `node:20-alpine` for builds. Ensure your local environment matches this to avoid version mismatches during `npm install`/`build`.

- **Nginx 1.25 added**
  The production image uses `nginx:1.25-alpine`. While no config was committed, assume it’s optimized for SPAs (e.g., `try_files $uri /index.html`). *Action*: Request the missing `nginx.conf` or recreate it based on standard React deployment patterns.

- **React 18.3.1**
  Added as a production dependency (minified files). No `package.json` was committed, so dependency management details (e.g., `npm` vs `yarn`) are unclear. **Action**: Check for a `package.json` in a later commit or ask the team how to install dev dependencies.

- **Python 3.11 + FastAPI**
  The PDF Reader service (`Dockerfile`) uses `python:3.11-slim` and installs:
  - `fastapi`, `uvicorn`: For the API server.
  - `pymongo`, `qdrant-client==1.8.2`: Database clients.
  - `sentence-transformers`, `pypdf`: For embeddings and PDF parsing.
  - `torch==2.2.2` (CPU-only): Required by `sentence-transformers`.

- **Implicit: Backend CORS updates needed**
  The frontend will call backend APIs from a different origin (even in Docker). Verify that:
  - CORS headers (e.g., `Access-Control-Allow-Origin`) are configured.
  - Preflight requests (`OPTIONS`) are handled if using auth (e.g., cookies/JWT).