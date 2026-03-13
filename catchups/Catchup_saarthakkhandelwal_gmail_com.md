# While You Were Gone — Since 2026-03-13 22:21:58+05:30 to 2026-03-13 23:30:00+05:30

You missed the initial commit for **SplitFM**, a new framework combining SplitLoRA (parameter-efficient fine-tuning) and SplitInfer (split inference) for foundation models. This introduces a full privacy-preserving, edge-optimized workflow for models like GPT-2, Llama3, and Qwen2-VL. You also missed the initial setup for a React 18.3.1 frontend served via Nginx, which adds a UI layer to the stack. Expect backend API adjustments (CORS, routing) and CI/CD updates to follow. Additionally, a new automated dashboard system for clinical data visualization was introduced, though it remains in early-stage scaffolding. A **VS Code extension for Gemini AI pair-programming** was also added, introducing two new commands for chat and code generation.

## Critical Changes (Must-Read)

1. **SplitFM framework introduced**
   The new framework combines SplitLoRA (fine-tuning) and SplitInfer (inference) for large models. Key changes:
   - **Breaking changes**: Replace `nn.Linear`/`nn.Embedding` with `loralib.Linear` and use `lora_state_dict` for checkpoints.
   - **Environment requirements**: SplitLoRA uses PyTorch 1.7.1+cu110 (Ubuntu 18.04, Python 3.7.16), while SplitInfer requires PyTorch 2.4.1 (Python 3.8.20). Mixed usage may cause conflicts.
   - **Training scripts**: New flags like `--lora_dim=4` and split data paths (`--train_data0`, `--train_data1`) are expected.
   - **Edge workflow**: Split inference implies network calls between edge and cloud (latency/privacy tradeoffs need validation).

2. **Git submodule removed**
   The submodule at commit `5da7a2ecce4e20501f53adf5797ac70a2be3a0f4` was detached. Builds depending on it will break until updated.

3. **React 18.3.1 frontend added**
   A multi-stage Dockerfile now builds and serves a React app via Nginx on port 80. This is a new architectural layer—no existing frontend code was refactored. You’ll need Node.js 20+ locally to match the build environment.

4. **Nginx replaces direct backend UI serving**
   Static files (React bundles) are served by Nginx, not the backend. The config (referenced but not committed) likely includes SPA routing (fallback to `index.html`). Backend APIs must now handle CORS for frontend requests.

5. **New build step required**
   The Dockerfile assumes a `build` stage (e.g., `npm run build`). CI/CD pipelines need updates to include this before deploying the Nginx image.

6. **Automated dashboard scaffolding added**
   A new `dashboard_auto/` folder was introduced with placeholder files for a clinical data visualization system. This includes:
   - `clinical_dashboard.html` (basic HTML skeleton)
   - `dashboard_data.json` (sample JSON data)
   - `prepare_dashboard.bat` (batch script calling a non-existent `prepare_dashboard.py`).
   No existing code is modified, but future commits will likely expand this feature.

7. **VS Code Gemini AI extension added**
   A new extension for Gemini AI pair-programming introduces two commands:
   - `gemini.chat`: Opens an input box, sends prompts to the Gemini API, and displays responses in an output channel.
   - `gemini.code`: Inserts generated code directly into the active editor.
   - **Requires configuration**: Users must set `geminiPair.apiKey` in VS Code settings.
   - **Debugging**: Uses a new `launch.json` configuration for development.

## New Features & Additions

- **SplitFM framework**
  - **SplitLoRA**: Enables parameter-efficient fine-tuning for models like GPT-2 and Llama3. Includes hyperparameter tables and training scripts (e.g., `gpt2_ft_sfl.py`).
  - **SplitInfer**: Supports split inference for edge devices. Demo script (`infer_modelsplit.py`) and modified Hugging Face model definitions (`modelsplit.py`) are documented.
  - **Documentation**: README covers environment setup, install commands, and usage examples for both components.

- **React core + JSX runtime**
  Minified production files for React 18.3.1 (`react.production.min.js`), the scheduler (`scheduler.production.min.js`), and JSX transforms (`react-jsx-runtime.production.min.js`) are now part of the repo. These enable hooks, concurrent rendering, and modern JSX syntax.

- **Dockerized frontend workflow**
  The new `Dockerfile` defines two stages:
  - `builder`: Uses `node:20-alpine` to install dependencies and run the React build.
  - Final stage: Copies static files to `nginx:1.25-alpine` for serving.
  This replaces any prior manual frontend deployment steps.

- **Automated dashboard system**
  Early-stage scaffolding for a clinical data dashboard:
  - **`dashboard_auto/`**: Contains placeholder files for HTML, JSON data, and a batch script.
  - **Purpose**: Likely to replace manual dashboard generation, but no functional code exists yet.

- **VS Code Gemini AI extension**
  - **Commands**: `gemini.chat` and `gemini.code` for AI-assisted development.
  - **API integration**: Uses Node.js `https` to call the Gemini API with user-provided keys.
  - **Code insertion**: Automatically strips markdown formatting before inserting code into the editor.

## Refactors & Structural Changes

- **Submodule removal**
  The submodule at commit `5da7a2ecce4e20501f53adf5797ac70a2be3a0f4` was detached. **Update:** This may be related to the SplitFM introduction, but no explicit migration path was provided.

- **Directory structure updates**
  New directories added for SplitFM (`SplitFM-main/`, `SplitFM-main/SplitLoRA/`, `SplitFM-main/SplitInfer/`), frontend (`frontend/`, `frontend/src/`), the automated dashboard (`dashboard_auto/`), and VS Code extension (`.vscode/`).

## New Dependencies & Config Changes

- **Node.js 20+ required**
  The Docker build uses `node:20-alpine`, so local development now requires Node.js 20 or higher to match the environment.

- **Nginx 1.25**
  The production image is based on `nginx:1.25-alpine`. The referenced (but uncommitted) `nginx.conf` will need review for SPA routing rules and proxy settings for API calls.

- **React 18.3.1**
  The commit adds React as a production dependency. Key features enabled:
  - Concurrent rendering (e.g., `startTransition`).
  - Automatic batching of state updates.
  - Suspense for data fetching (if used).
  No `package.json` was committed, so dependency management details (e.g., exact versions, scripts) are still pending.

- **PyTorch version conflicts**
  SplitLoRA requires PyTorch 1.7.1+cu110, while SplitInfer uses PyTorch 2.4.1. Mixed usage may cause version clashes.

- **New `.gitignore` rules**
  Added exclusions for PyTorch model files (`*.pth`, `*.pt`) and Python cache (`__pycache__`).

- **Unintended `.DS_Store` files**
  macOS metadata files were accidentally added to multiple directories (`SplitFM-main/`, `frontend/`, `src/`). These should be purged and added to `.gitignore`.

- **VS Code extension dependencies**
  - Requires `geminiPair.apiKey` and `geminiPair.model` settings in VS Code.
  - Uses Node.js `https` module for API calls.