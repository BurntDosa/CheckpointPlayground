# While You Were Gone — Since 2026-03-13 20:08:26+05:30

You were gone for less than a day, but two major new components were introduced: a React 18.3.1 frontend layer and the **SplitFM** framework for privacy-preserving, resource-efficient fine-tuning and inference. The codebase now includes a Dockerized Nginx deployment for the frontend and a new `.gitignore` setup for PyTorch model files. Expect backend API adjustments for CORS, new CI/CD requirements for frontend builds, and potential dependency conflicts between SplitLoRA (PyTorch 1.7.1) and SplitInfer (PyTorch 2.4.1).

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

## New Features & Additions

- **Frontend UI layer**
  React hooks (`useState`, `useEffect`) and JSX transforms are now available. The app is production-optimized (minified builds).

- **SplitFM documentation**
  The `README.md` now includes:
  - Environment specs (Ubuntu 18.04, Python 3.7.16/3.8.20, PyTorch 1.7.1/2.4.1).
  - Quick-start guides for SplitLoRA (fine-tuning) and SplitInfer (inference).
  - Hyperparameter tables and code snippets for immediate use.

## Refactors & Structural Changes

- **New directory structure (implied)**
  The Dockerfile copies files from `/app/build` (standard React output). Expect a `src/` directory and `package.json` in the repo.
  **Update:** The `README.md` documents additional directories for SplitFM: `src/`, `eval/`, `data/`, and `vocab/`.

- **PyTorch model file handling**
  `.gitignore` now excludes `*.pth` and `*.pt` files, along with Python cache (`__pycache__`).

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