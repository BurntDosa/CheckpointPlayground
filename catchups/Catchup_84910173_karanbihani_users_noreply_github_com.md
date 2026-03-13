# While You Were Gone — Since 2026-03-13 20:38:27+05:30

The project has pivoted to **SplitFM**, a new framework merging SplitLoRA (parameter-efficient fine-tuning) and SplitInfer (split inference) for large foundation models. This is the initial commit: no source code yet, but the README outlines breaking changes to model definitions, training loops, and inference workflows. You’ll need to adapt to new dependencies, hyperparameters, and split model architectures.

## Critical Changes (Must-Read)

1. **LoRA Layer Replacement**
   All `nn.Linear`/`nn.Embedding` layers must now use `loralib.Linear` for SplitLoRA compatibility. Existing training scripts will break without this change. Use `lora.mark_only_lora_as_trainable(model)` to freeze non-LoRA weights.

2. **Checkpoint Format Overhaul**
   Model saving/loading now requires `lora.lora_state_dict(model)` instead of standard PyTorch methods. Legacy checkpoints won’t work without conversion.

3. **SplitInfer Environment Conflict**
   SplitInfer demands PyTorch 2.4.1, while SplitLoRA was tested on 1.7.1. Mixed usage will cause version clashes—plan for isolated environments or dependency resolution.

4. **Training Script Flags**
   New required flags for fine-tuning:
   - `--lora_dim` (default: 4)
   - Split data paths (`--train_data0`, `--train_data1`)
   - Model split config (`--split_layer`).
   Update all `gpt2_ft_sfl.py`-style scripts accordingly.

5. **Git Ignore Rules**
   PyTorch model files (`*.pth`, `*.pt`) and `__pycache__` are now ignored. Verify this doesn’t disrupt your workflow for sharing model artifacts.

## New Features & Additions

**SplitInfer Module**
- **Demo Script**: `infer_modelsplit.py` for running split inference (e.g., Qwen2-VL) across edge/cloud. Requires manual model splitting via `modelsplit.py`.
- **Supported Models**: DeepSeek-R1, Qwen2-VL, Llama3, GPT-2. Models must be downloaded via `modelscope` and configured for split layers.
- **GPU Device Binding**: Explicit multi-GPU support via `CUDA_VISIBLE_DEVICES` (documented in README examples).

**SplitLoRA Training Utilities**
- **Hyperparameter Presets**: 20+ flags documented for fine-tuning (e.g., `--lora_alpha=32`, `--dropout=0.1`). See README tables for defaults.
- **Beam Search Decoding**: New decoding logic integrated into training loops (example in `gpt2_ft_sfl.py` snippet).
- **Vocab Handling**: Dedicated `vocab/` directory for model-specific tokenizers (structure defined but no files committed yet).

## Refactors & Structural Changes

**Directory Overhaul**
- New top-level folders:
  - `src/`: Core framework code (empty in this commit).
  - `eval/`: Benchmarking scripts (referenced but not added).
  - `data/`: Expected to hold split training data (e.g., `train_data0.json`, `train_data1.json`).
  - `vocab/`: Model tokenizers (e.g., `gpt2_vocab/`).
- **Implication**: Update all relative paths in scripts/configs to match this structure.

**Model Definition Splits**
- `modelsplit.py` (described in README) will modify Hugging Face `transformers` models to support layer-wise splitting. Expect:
  - Custom `from_pretrained` logic.
  - New methods for loading split parameters (e.g., `load_split_weights`).
  - **Action**: Review this file first when it lands—it’s the bridge between SplitLoRA and SplitInfer.

## New Dependencies & Config Changes

**SplitLoRA Environment**
- **OS**: Ubuntu 18.04 (only verified environment).
- **Python**: 3.7.16 (strict).
- **PyTorch**: 1.7.1+cu110.
- **New Package**: `loralib` (install via `pip install loralib` or from source).
- **Build Command**: `python setup.py install` (setup.py not yet committed).

**SplitInfer Environment**
- **Python**: 3.8.20 (incompatible with SplitLoRA’s 3.7.16).
- **PyTorch**: 2.4.1 (conflicts with SplitLoRA’s 1.7.1).
- **New Dependency**: `modelscope` (for downloading Qwen2-VL, etc.).

**Config Keys**
- Environment variables:
  - `CUDA_VISIBLE_DEVICES`: Mandatory for SplitInfer (e.g., `export CUDA_VISIBLE_DEVICES=0,1`).
  - `SPLIT_LAYER`: Defines where models split (e.g., `export SPLIT_LAYER=10`).
- **Implication**: Wrap all inference scripts in config checks for these vars.