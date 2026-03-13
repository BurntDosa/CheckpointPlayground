# While You Were Gone — Since 2026-03-13 23:07:28+05:30

The last 24 hours introduced four major new projects: a VS Code Gemini AI extension, the SplitFM framework for edge-optimized foundation models, a React frontend setup, and a PDF semantic search service with FastAPI/Qdrant. Critical breaking changes include a submodule removal and new dependency requirements across all projects. You’ll need to reconfigure local environments and review integration points.

---

## Critical Changes (Must-Read)

1. **Submodule removed (commit `05d4e7b`)**
   The submodule at commit `5da7a2ecce4e20501f53adf5797ac70a2be3a0f4` was detached. Any build or script referencing this submodule will fail until updated. Check dependency graphs and CI pipelines for references to this hash.

2. **SplitFM framework introduced (commit `33bcf89`)**
   New framework combining SplitLoRA (fine-tuning) and SplitInfer (inference) for models like Llama3 and GPT-2. Breaking changes:
   - Replaces `nn.Linear`/`nn.Embedding` with `loralib.Linear` in training loops.
   - Requires `lora.mark_only_lora_as_trainable(model)` and `lora.lora_state_dict(model)` for checkpoints.
   - PyTorch version conflicts: SplitLoRA uses 1.7.1, SplitInfer requires 2.4.1.

3. **React frontend added (commit `1127ea3`)**
   New Dockerized React 18.3.1 app served via Nginx. Backend APIs must now:
   - Support CORS for frontend requests (port 80 by default).
   - Handle SPA routing (likely needs `index.html` fallback in Nginx).
   - Local dev requires Node.js 20+ to match the Docker build environment.

4. **PDF semantic search service (commit `ec0893e`)**
   FastAPI service with MongoDB and Qdrant dependencies. Critical notes:
   - Runs on port 8000, conflicts with other services if not coordinated.
   - Uses CPU-only PyTorch (`torch==2.2.2`) for embeddings—expect slow performance without GPU config.
   - No authentication on `/upload-pdf` or `/query` endpoints (security risk).

5. **.DS_Store files committed (commits `05d4e7b`, `211ac13`)**
   macOS metadata files were accidentally added to `SplitFM-main/`, `frontend/`, and `src/`. These bloat the repo and should be purged via:
   ```bash
   find . -name '.DS_Store' -delete
   echo '.DS_Store' >> .gitignore
   git add .gitignore
   git commit -m "Ignore .DS_Store"
   ```

---

## New Features & Additions

**VS Code Gemini AI Extension (commit `fb76214`)**
- Two new commands in the command palette:
  - `gemini.chat`: Prompts for input, sends to Gemini API, displays response in an output channel.
  - `gemini.code`: Inserts generated code directly into the active editor (strips markdown formatting).
- Debugging support via `.vscode/launch.json`.
- Requires `geminiPair.apiKey` and `geminiPair.model` in VS Code settings.

**SplitFM Framework (commit `33bcf89`)**
- **SplitLoRA**: Parameter-efficient fine-tuning for models like GPT-2, Llama3, and Qwen2-VL.
  - Quick-start commands:
    ```bash
    pip install loralib
    lora.mark_only_lora_as_trainable(model)  # Before training
    lora.lora_state_dict(model)              # For checkpoints
    ```
  - Hyperparameters: `--lora_dim`, `--train_batch_size`, etc. (see README).
- **SplitInfer**: Edge-optimized inference with split model definitions.
  - Demo script: `infer_modelsplit.py`.
  - Modified Hugging Face `transformers` in `modelsplit.py`.

**PDF Semantic Search Service (commit `ec0893e`)**
- Endpoints:
  - `POST /upload-pdf`: Accepts a PDF, extracts text, chunks it (500 tokens, 50-token overlap), and indexes in MongoDB/Qdrant.
  - `POST /query`: Returns top-5 semantic matches using `all-MiniLM-L6-v2` embeddings.
- Sample PDF included (`Grandma's Bag of Stories.pdf`) for testing.
- Dockerized with `mongodb:6` and `qdrant:latest` as dependencies.

**React Frontend (commit `1127ea3`)**
- Multi-stage Dockerfile:
  - Build stage: `node:20-alpine` for `npm install && npm run build`.
  - Runtime stage: `nginx:1.25-alpine` to serve static files on port 80.
- React 18.3.1 with production-optimized builds (minified `react.production.min.js`, `scheduler.production.min.js`).

---

## Refactors & Structural Changes

**SplitFM Directory Structure (commit `33bcf89`)**
- New root directory `SplitFM-main/` with:
  - `SplitInfer/`: Edge inference logic (`infer_modelsplit.py`, `modelsplit.py`).
  - `SplitLoRA/`: Fine-tuning scripts and LoRA layer definitions.
  - `src/`, `eval/`, `data/`, `vocab/`: Placeholders for model assets (not yet populated).

**PDF Service Code Organization (commit `ec0893e`)**
- Modular design under `app/`:
  - `database/`: MongoDB (`mongodb.py`) and Qdrant (`qdrant.py`) clients.
  - `services/`: Core logic for PDF loading (`pdf_loader.py`), chunking (`chunker.py`), embeddings (`embeddings.py`), and search (`search.py`).
  - `models/schemas.py`: Pydantic models (e.g., `QueryRequest`).

**Frontend Build Pipeline (commit `1127ea3`)**
- React app now follows a standardized Docker build:
  1. Install dependencies (`npm ci`).
  2. Build (`npm run build`).
  3. Copy static files to Nginx.
- Expect future additions to `frontend/src/` for components and routes.