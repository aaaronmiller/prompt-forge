# Prompt Forge V2

An interactive web application designed for dynamically generating creative and detailed prompts for various AI image generation models.

![Screenshot Placeholder](https://placehold.co/600x300/1e1e1e/e0e0e0?text=Prompt+Forge+Interface)
*(Suggestion: Replace the placeholder URL above with an actual screenshot of the app)*

## Overview

Prompt Forge provides a user-friendly interface to combine diverse keywords across multiple categories (Subject Matter, Artistic Style, Location, Lighting, Effects, etc.) into unique prompts. It aims to spark creativity and streamline the process of crafting effective inputs for AI image generators like Flux, Stable Diffusion (SDXL, 1.5), DALL-E 3, and others via compatible APIs.

## Features

* **Interactive Keyword Selection:** Build prompts by selecting options from over 20 categories using intuitive toggle switches.
* **"Feeling Lucky" Mode:** Generate randomized keyword combinations with adjustable quantity settings for quick inspiration.
* **Keyword Summary:** View and copy a comma-separated summary of all selected keywords.
* **LLM Prompt Refinement (Optional):**
    * Send keyword summaries to a configured Large Language Model (Gemini, LM Studio, Ollama, or Custom OpenAI-compatible endpoints).
    * Generate refined prompts tailored to different model preferences (Keywords, Structured/Detailed, Sentences) using customizable system instructions.
    * API Key is saved locally in the browser (`localStorage`) for convenience across sessions.
* **Image Generation API Integration:**
    * Send either the raw keyword summary or the LLM-refined prompt to image generation endpoints.
    * **ComfyUI Support:** Connect to a local or LAN ComfyUI instance, select a workflow (defined in `data.js`), and specify the server address.
    * **Custom Endpoints:** Add and manage URLs for other image generation APIs.
* **Batch & Continuous Mode:** Generate sequences of images with randomized seeds, using different prompt generation strategies per image.
* **Result Display:** View generated images directly in a grid within the application.
* **Configuration Persistence:** Saves the entered LLM API key and last used ComfyUI LAN address locally in the browser.
* **Downloadable Log:** Save a text file containing session configuration, prompts used, and image generation status.
* **Deployable:** Runs as a static website, easily deployable via services like GitHub Pages.

## Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
* **Styling:** Custom CSS (no external frameworks)
* **Icons:** Font Awesome

## Development

This project was conceived, designed, and developed solely by **Aaron Miller**. The work encompassed all aspects including:

* Conceptualization and feature planning.
* Frontend architecture and implementation (HTML structure, CSS styling, DOM manipulation).
* Client-side JavaScript logic for all core features (keyword selection, prompt generation, randomization, state management).
* Integration with various external APIs (LLMs via REST, ComfyUI via REST).
* Development of the user interface and user experience flow.
* Implementation of batch processing and result handling features.

## Setup & Usage

This application is designed to run entirely client-side.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/aaaronmiller/prompt-forge.git](https://github.com/aaaronmiller/prompt-forge.git)
    cd prompt-forge
    ```
2.  **Run Locally (Recommended Method):**
    Due to browser security restrictions (CORS) when making requests from `file:///` URLs to local servers (`http://localhost` or `http://192...`), it's highly recommended to serve the files using a simple local web server.
    * If you have Python 3:
        ```bash
        python -m http.server 8000
        # Or another port if 8000 is busy
        ```
    * If you have Node.js and `serve` installed (`npm install -g serve`):
        ```bash
        serve .
        ```
    * Then, open your browser to `http://localhost:8000` (or the specified port).

3.  **Configuration:**
    * **LLM:** Expand the "LLM Configuration" section.
        * Select the desired LLM Endpoint type.
        * Enter your API Key (required for cloud services like Gemini). It will be saved in your browser's `localStorage` for future visits. Use the "Clear" button to remove it.
        * Enter the Model Name if using a local service like Ollama or LM Studio.
        * Choose the desired output prompt format.
    * **Image Generation:** Expand the "Image Generation Configuration" section.
        * **ComfyUI:** Check the box, enter the correct Server Address (e.g., `http://192.168.1.XX:8188` if accessing from another device on your LAN, leave blank for default `http://127.0.0.1:8188`), and select a Workflow from the dropdown (ensure the ComfyUI server is running with `--listen` and `--enable-cors-header` flags if needed).
        * **Custom:** Click "Add Custom Endpoint", enter the full URL, and ensure the checkbox next to it is checked.
4.  **Generate:**
    * Select keywords in the "Keyword Selection (Details)" section or use "Feeling Lucky".
    * Click "Generate Keywords" to populate the summary field.
    * (Optional) Click "Generate API Prompt" to use the configured LLM for refinement.
    * Choose which prompt source ("Keywords Summary" or "API Generated Prompt") to send for image generation.
    * Enable "Continuous Mode" and set options if desired.
    * Click "Send Prompt / Start Batch". Results will appear in the grid below.

## Important Note on API Keys

* **NEVER commit your real API keys to Git.** Use the `.gitignore` file provided to prevent accidental commits of `data.js` or other potential config files.
* The application saves the entered LLM API key in your browser's `localStorage`. This is convenient but means the key is stored unencrypted on your local machine within the browser's profile for this site's origin. Be aware of this if using shared computers. Use the "Clear" button to remove it.

## License

This project is licensed under the [Your Chosen License Name - e.g., MIT License]. See the `LICENSE` file for full details.

*(Remember to create a LICENSE file and replace the placeholder above)*

## Live Demo

*(Optional: Add link here once deployed to GitHub Pages)*
`https://aaaronmiller.github.io/prompt-forge/`
