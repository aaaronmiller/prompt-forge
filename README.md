# Prompt Forge

> Automated diffusion-model prompt generation — a fast, client-side tool for building and refining image-generation prompts.

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![ComfyUI](https://img.shields.io/badge/ComfyUI-Export-1a73e8?style=for-the-badge)
![License](https://img.shields.io/badge/License-see%20LICENSE-green?style=for-the-badge)

Prompt Forge turns a structured keyword system into rich, ready-to-use diffusion prompts. It runs entirely in the browser — no build step, no server — with a modern glassmorphism UI and one-click workflow export.

## Features

- **Enhanced keyword system** — categorized keyword banks with weighted sliders to dial in emphasis (see [`ENHANCED_KEYWORD_SYSTEM.md`](ENHANCED_KEYWORD_SYSTEM.md)).
- **"Feeling Lucky" + guided generation** — card-based quick actions for instant or curated prompts.
- **5 color themes** — Default Blue, Purple, Green, Orange, Red, switchable from the toolbar.
- **Apple-inspired design** — glassmorphism, backdrop blur, smooth micro-interactions, fully responsive.
- **ComfyUI export** — emits GGUF/ComfyUI-compatible workflow JSON ([`GGUF-COMFY.JSON`](GGUF-COMFY.JSON)).
- **Refactored architecture** — modular `data.js`, `api_calls`, `event_handlers`, and keyword-slider modules.

## Usage

```bash
git clone https://github.com/aaaronmiller/prompt-forge.git
cd prompt-forge
# open index.html in your browser, or serve it:
python3 -m http.server 8000   # http://localhost:8000
```

Pick keywords, adjust the sliders, generate, and copy the prompt — or export a ComfyUI workflow.

## Docs

- [`V1_FEATURES.md`](V1_FEATURES.md) — interface & design-system overview
- [`ENHANCED_V1_FEATURES.md`](ENHANCED_V1_FEATURES.md) / [`ENHANCED_KEYWORD_SYSTEM.md`](ENHANCED_KEYWORD_SYSTEM.md) — keyword engine
- `roo/` — project briefs and design notes

## License

See [LICENSE](LICENSE).
