## Commit `33bcf89` — 2026-03-13

## Context
This commit introduces **SplitFM**, a new framework combining SplitLoRA (parameter-efficient fine-tuning) and SplitInfer (split inference) for foundation models. The commit appears to be the initial project setup, adding documentation, `.gitignore` rules, and framework overview. The focus is on enabling privacy-preserving, resource-efficient fine-tuning and inference for large models (e.g., GPT-2, Llama3) on edge devices.

The commit message ("enjoy pa") is cryptic, but the diff reveals a comprehensive README with:
- Supported models (DeepSeek-R1, Qwen2-VL, Llama3, GPT-2)
- SplitLoRA/SplitInfer architecture details
- Environment requirements, build steps, and usage examples
- Directory structure for `src/`, `eval/`, `data/`, and `vocab/`

Likely this is the first commit for a new repository or major refactor, given the addition of `.gitignore` rules for PyTorch files (`*.pth`, `*.pt`) and Python cache.

---

## Changes

### `.gitignore`
Added exclusions for:
- PyTorch model files: `*.pth`, `*.pt`
- Python cache: `__pycache__`

### `README.md` (new file)
1. **Project Overview**
   - Introduces SplitFM’s dual focus: SplitLoRA (fine-tuning) and SplitInfer (inference).
   - Lists supported models with links to their upstream repos.

2. **SplitLoRA Section**
   - **Dependencies**: Specifies verified environments (Ubuntu 18.04, Python 3.7.16, PyTorch 1.7.1+cu110).
   - **Quick Start**:
     - Installation: `pip install loralib` or from source.
     - Code snippets for replacing `nn.Linear`/`nn.Embedding` with LoRA counterparts (`loralib.Linear`).
     - Training loop setup: `lora.mark_only_lora_as_trainable(model)`.
     - Checkpoint handling: `lora.lora_state_dict(model)` for saving/loading.
   - **Hyperparameters**: Lists 20+ flags (e.g., `--lora_dim=4`, `--train_batch_size=8`) for `gpt2_ft_sfl.py`.
   - **Training Commands**: Examples for GPT-2 Medium fine-tuning and beam search decoding.

3. **SplitInfer Section**
   - **Environment**: Updated requirements (Python 3.8.20, PyTorch 2.4.1).
   - **Quick Start**: Steps to download models (e.g., Qwen2-VL via `modelscope`), set GPU devices, and run `infer_splitmodel.py`.
   - **Repository Structure**: Documents 3 new files:
     - `infer_modelsplit.py`: Demo script.
     - `modelsplit.py`: Split model definitions (modified from Hugging Face `transformers`).
     - `utils.py`: Helper functions for parameter loading/counting.

4. **Figures and Links**
   - Embeds a logo (`figures/logo.jpg`) and links to the [homepage](https://fdu-inc.github.io/splitlora/) and [arXiv paper](https://arxiv.org/pdf/2407.00952).

---

## Impact
### Confirmed:
1. **Build System**:
   - PyTorch model files and Python cache are now ignored by Git.
2. **Documentation**:
   - Developers can onboard using the README’s environment specs, install commands, and training/inference examples.
   - Hyperparameter tables and code snippets provide immediate reference for SplitLoRA/SplitInfer.
3. **File Structure**:
   - New files (`infer_modelsplit.py`, `modelsplit.py`, `utils.py`) are documented but not yet committed (their usage is described in the README).

### Likely:
1. **Breaking Changes**:
   - Existing LoRA users must adapt to `loralib.Linear` instead of `nn.Linear` and use `lora_state_dict` for checkpoints.
   - Training scripts (e.g., `gpt2_ft_sfl.py`) expect new flags like `--lora_dim` and split data paths (`--train_data0`, `--train_data1`).
2. **Dependency Conflicts**:
   - SplitInfer requires PyTorch 2.4.1, while SplitLoRA was tested on 1.7.1. Mixed usage may cause version clashes.
3. **Edge Device Workflow**:
   - The split inference design implies network calls between edge and cloud (not detailed in the diff). Latency/privacy tradeoffs will need validation.

---

## Priority Rating
**HIGH**: This is a foundational commit introducing a new framework with breaking changes to model definitions, training loops, and inference workflows. Teams using LoRA or planning edge deployment must review the README’s environment specs and code snippets to avoid integration issues. The lack of actual source code in this commit suggests follow-up PRs will be critical.
