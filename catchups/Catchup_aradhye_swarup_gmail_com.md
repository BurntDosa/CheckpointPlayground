# While You Were Gone — Since 2026-03-13 22:57:44+05:30

You missed a flurry of foundational commits introducing **four** major new systems: **SplitFM** (a privacy-preserving fine-tuning/inference framework for LLMs), a **React frontend** (Dockerized with Nginx), a **PDF Reader with LLM** (FastAPI + MongoDB + Qdrant for semantic search), and a **VS Code extension for Gemini AI integration**. No existing code was modified—these are all greenfield additions. Your immediate focus should be on the breaking changes in SplitFM’s LoRA integration, the new Docker-based infrastructure for the frontend/PDF services, and the new VS Code extension commands.

---

## Critical Changes (Must-Read)

1. **SplitFM replaces `nn.Linear`/`nn.Embedding` with LoRA counterparts**
   The new framework requires replacing all `torch.nn.Linear` and `torch.nn.Embedding` layers with `loralib.Linear` in your models. Existing LoRA checkpoints must now use `lora.lora_state_dict(model)` for saving/loading. Example:
   ```python
   import loralib as lora
   model = YourModel()
   lora.mark_only_lora_as_trainable(model)  # New required step
   ```

2. **SplitFM training scripts expect new hyperparameter flags**
   The `gpt2_ft_sfl.py` script (and likely others) now requires 20+ new flags, including:
   - `--lora_dim=4` (LoRA dimension)
   - `--train_batch_size=8`
   - Split data paths: `--train_data0`, `--train_data1`
   Missing flags will break training runs. Check the README’s hyperparameter table for defaults.

3. **React frontend introduces Node.js 20 + Nginx dependency**
   The new Dockerfile builds a React 18.3.1 app in a multi-stage pipeline (Node → Nginx). Key implications:
   - Local development now requires Node.js 20+ (matching the `node:20-alpine` builder image).
   - Production deploys need Nginx (port 80) to serve static files. Expect SPA routing rules (e.g., fallback to `index.html`).

4. **PDF Reader service adds MongoDB + Qdrant to the stack**
   The FastAPI app (`app/main.py`) depends on:
   - MongoDB (port 27017, database `pdf_db`, collection `chunks`)
   - Qdrant (port 6333, collection `pdf_chunks` with 384-dim vectors)
   Both are launched via `docker-compose.yml`. The service hardcodes:
   - Chunk size: 500 tokens
   - Overlap: 50 tokens
   - Embedding model: `all-MiniLM-L6-v2` (CPU-only in Dockerfile)

5. **PyTorch version conflicts between SplitFM components**
   - **SplitLoRA** was tested on PyTorch 1.7.1+cu110.
   - **SplitInfer** requires PyTorch 2.4.1.
   Mixing these (e.g., in a shared environment) will cause CUDA/cpu compatibility errors. Use separate virtualenvs or Docker containers.

6. **VS Code extension adds two new commands**
   The new `extension.js` registers two commands in the command palette:
   - `gemini.chat`: Opens a prompt box, sends the input to the Gemini API, and displays the response in an output channel.
   - `gemini.code`: Inserts generated code directly into the active editor at the cursor position.
   **Update:** Both commands require a `geminiPair.apiKey` setting in VS Code. The extension uses Node.js `https` for API calls and strips markdown formatting before code insertion.

---

## New Features & Additions

### SplitFM Framework
- **SplitLoRA**: Parameter-efficient fine-tuning for models like GPT-2, Llama3, and Qwen2-VL.
  - New CLI flags for split training (e.g., `--train_data0`, `--train_data1` to specify sharded datasets).
  - Checkpoint utilities: `lora.lora_state_dict()` and `lora.load_lora_state_dict()`.
  - Verified environments: Ubuntu 18.04 + Python 3.7.16.

- **SplitInfer**: Privacy-preserving inference via model splitting.
  - Demo script: `infer_modelsplit.py` (runs split models on edge/cloud).
  - Modified Hugging Face `transformers` in `modelsplit.py` to support split layers.
  - Utility functions in `utils.py` for parameter counting/loading.

- **Supported Models**: DeepSeek-R1, Qwen2-VL, Llama3, GPT-2 (see README for upstream links).

### PDF Reader with LLM
- **Endpoints**:
  - `POST /upload-pdf`: Accepts a PDF, extracts text, chunks it, and indexes in MongoDB/Qdrant.
  - `POST /query`: Returns top-5 semantic matches for a query (with page numbers and similarity scores).

- **Embedding Pipeline**:
  - Uses `all-MiniLM-L6-v2` (384-dim vectors) via `sentence-transformers`.
  - Chunking logic: 500-token chunks with 50-token overlap (hardcoded in `chunker.py`).

- **Sample Data**: Includes `Grandma's Bag of Stories.pdf` for testing ingestion.

### React Frontend
- **Dockerized Build**: Multi-stage Dockerfile (Node → Nginx) for production-ready static files.
- **Dependencies**: React 18.3.1 (minified production builds included: `react.production.min.js`, `scheduler.production.min.js`).
- **Nginx Config**: Assumed to include SPA routing (fallback to `index.html` for 404s).

### Automated Clinical Dashboard
- **Scaffolding**: New `dashboard_auto/` folder with:
  - `clinical_dashboard.html` (basic HTML skeleton).
  - `dashboard_data.json` (placeholder: `{"data": [1, 2, 3, 4, 5]}`).
  - `prepare_dashboard.bat` (calls a missing `prepare_dashboard.py`).
- **Purpose**: Likely replaces manual dashboard generation (see `purpose.txt`).

### VS Code Extension for Gemini AI
- **Commands**:
  - `gemini.chat`: Prompts for input, sends it to the Gemini API, and shows the response in an output channel.
  - `gemini.code`: Inserts generated code at the cursor position in the active editor.
- **Configuration**: Requires `geminiPair.apiKey` and `geminiPair.model` settings in VS Code.
- **Debugging**: Includes a `launch.json` configuration for extension development.

---

## Refactors & Structural Changes

- **SplitFM Directory Structure**:
  ```
  /src          # Core framework code (not yet committed)
  /eval         # Evaluation scripts
  /data         # Datasets
  /vocab        # Tokenizers/vocabularies
  /figures      # Logo and diagrams (e.g., logo.jpg)
  ```

- **PDF Reader Code Organization**:
  ```
  /app
    /database   # mongodb.py, qdrant.py
    /services   # chunker.py, embeddings.py, pdf_loader.py, search.py
    /models     # schemas.py (Pydantic models)
    main.py     # FastAPI app
  ```

- **React Frontend Build Artifacts**:
  - Minified JS files (`react.production.min.js`, etc.) are committed directly (likely auto-generated by a build step).

- **VS Code Extension Structure**:
  ```
  .vscode/
    launch.json # Debug configuration
  extension.js  # Core logic
  package.json  # Extension manifest
  ```

---
## New Dependencies & Config Changes

### Python (`requirements.txt` for PDF Reader)
- **Core**:
  - `fastapi`, `uvicorn`, `pymongo`, `qdrant-client==1.8.2`
  - `sentence-transformers` (for `all-MiniLM-L6-v2` embeddings)
  - `pypdf` (PDF text extraction)

- **Infrastructure**:
  - `torch==2.2.2+cpu` (CPU-only PyTorch in Dockerfile)

### SplitFM Environment
- **SplitLoRA**:
  - Ubuntu 18.04, Python 3.7.16, PyTorch 1.7.1+cu110
  - `pip install loralib` (or from source)

- **SplitInfer**:
  - Python 3.8.20, PyTorch 2.4.1
  - Models downloaded via `modelscope` (e.g., Qwen2-VL)

### Docker
- **PDF Reader (`docker-compose.yml`)**:
  - Services: `api` (FastAPI), `mongodb` (port 27017), `qdrant` (port 6333)

- **React Frontend (`Dockerfile`)**:
  - Build: `node:20-alpine` (for `npm run build`)
  - Runtime: `nginx:1.25-alpine` (serves static files on port 80)

### VS Code Extension
- **Dependencies**: None explicitly added (relies on VS Code's built-in Node.js runtime).
- **Settings**: Requires user configuration for `geminiPair.apiKey` and `geminiPair.model`.

### Environment Variables
None explicitly added yet, but expect these will be needed soon:
- `MONGO_URI`, `QDRANT_URI` (for PDF Reader)
- `REACT_APP_API_URL` (for frontend-backend communication)