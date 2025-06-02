Project Brief: Prompt Forge V2 (Revised Apr 21)
Goal: Develop Prompt Forge V2, a web-based UI for crafting, refining (via LLM), and sending prompts to image generation APIs (initially ComfyUI, potentially others), including features for managing workflows, models, and results.

Current Phase: Phase 4 - Image Results & Metadata Handling (Ongoing)
Task 4.2: Refine Image Generation Metadata Display (Requires Placeholder Implementation)
Goal: Display detailed parameters (seed, steps, CFG, sampler, models, prompt text, etc.) for generated images.

Status: Basic UI structure added (.image-metadata div, CSS). Basic metadata extraction logic added to processComfyHistory in script.js [[file-tag: script_js_final_v1]], but it relies on hardcoded node IDs from one example workflow and needs refinement for robustness (e.g., find nodes by type/title). Depends heavily on the actual implementation of pollComfyHistory and processComfyHistory placeholders.

Next Steps:

Implement the pollComfyHistory placeholder function correctly.

Implement the processComfyHistory placeholder function correctly, refining the metadata extraction logic to be more robust across different workflows (find nodes by type/title instead of ID).

Decide if metadata should be displayed only in the modal or also in the grid item (currently styled for grid item hover).

Task 4.3: Option to Download Generated Images
Goal: Allow users to download the generated images directly from the UI.

Status: Not Started.

Implementation:

Add download buttons/icons to each result item (.image-result-item) or to the image modal.

Add JS event listener.

On click, get the image src.

Create a temporary <a> element, set its href to the image src, set the download attribute (try to derive filename), click the link, then remove it.

Consider CORS issues if images are hosted on a different domain than the UI. May need crossorigin="anonymous" on <img> tags if applicable, or server-side proxy/headers.

Task 4.4: Link to Previously Generated Images (History)
Goal: Store and display a history of generated images and their associated prompts/metadata.

Status: Not Started.

Implementation:

Storage: Use localStorage (simpler, smaller capacity) or IndexedDB (more complex, larger capacity) to store an array/list of result objects (containing image URL, prompt text, metadata, timestamp). Limit history size if using localStorage.

Saving: Update the logic (likely after processComfyHistory or image generation success) to save the result object to storage.

UI: Add a new section/button to view history. Create UI elements (e.g., a list or grid) to display historical items (thumbnail, key metadata, prompt).

Loading: On page load or when history view is opened, retrieve data from storage and populate the history UI.

Next Phase: Phase 5 - Advanced Features & Refinements
Task 5.1: Implement Core API/Placeholder Functions
Goal: Implement the actual logic for the placeholder functions in script.js [[file-tag: script_js_final_v1]].

Status: Placeholders exist. Option 3 prompt injection logic added to sendToComfyUI concept.

Implementation:

handleGenerateApiPrompt: Implement fetch call to selected LLM endpoint (Gemini, OpenAI-compatible, Custom) using system prompt, keywords, API key, model name. Parse response and update #apiGeneratedPrompt. Add robust error handling.

handleSendPromptToImageServices: Implement logic to get prompt, get endpoints, handle batch/single mode switching, call callImageGenerationAPI for each selected endpoint. Manage UI state (disable buttons, show progress).

callImageGenerationAPI: Implement the dispatcher logic. For local_comfyui, ensure it calls sendToComfyUI. For custom_api, implement sendToCustomAPI.

sendToComfyUI: Verify the Option 3 prompt injection works correctly. Ensure seed injection works. Handle API call errors robustly. Call pollComfyHistory.

pollComfyHistory: Implement actual polling loop using setInterval or setTimeout, fetch /history/<prompt_id>, check status, call processComfyHistory on success/error/timeout, manage comfyPollingStates correctly, handle network errors gracefully.

sendToCustomAPI: Implement logic based on expected custom API format.

handleStopBatch: Ensure it correctly clears intervals stored in comfyPollingStates and updates UI.

handleDownloadLog: Implement data gathering and file download.

Task 5.2: Add Comprehensive Code Comments
Goal: Add detailed comments throughout script.js [[file-tag: script_js_final_v1]] to explain functions, logic, and sections.

Status: Requested, Acknowledged. Not yet implemented in the artifact.

Implementation: Review the entire script.js file and add JSDoc-style comments for functions and inline comments for complex logic blocks.

Task 5.3: Dynamic UI for Model/LoRA Selection (Complex Feature)
Goal: Based on selected workflow type (e.g., 'gguf_flux', 'sdxl_checkpoint', 'mlx_flux'), dynamically show/hide relevant UI elements for selecting specific models (Checkpoints, UNets, CLIP, VAE) and LoRAs. Populate selectors based on available models (hardcoded in data.js for now). Allow multi-select for LoRAs and implement basic compatibility filtering.

Status: Not Started. Requires significant HTML, CSS, JS, and data.js changes.

Implementation:

data.js: Add model/LoRA lists (hardcoded based on user-provided paths). Add workflow_type metadata to comfyWorkflows entries. Define LoRA compatibility (e.g., tags like sdxl, flux).

index.html: Add new hidden sections/divs within Image Gen config containing <select> (single/multi) elements for Checkpoints, UNets, CLIP, VAE, LoRAs.

script.js:

Add logic to populateComfyWorkflows change listener: Read workflow_type from selected workflow in data.js. Show/hide relevant model/LoRA selector divs.

Add functions to populate the new selectors based on the hardcoded lists in data.js. Implement LoRA filtering based on workflow type/compatibility tags.

Modify sendToComfyUI (and potentially callImageGenerationAPI): Read selected model/LoRA filenames from the UI. Find the corresponding loader nodes in the workflow JSON (e.g., CheckpointLoaderSimple, UnetLoaderGGUF, LoraLoader) by type or title. Inject the selected filenames into the appropriate inputs (e.g., ckpt_name, unet_name, lora_name). Handle multi-select LoRAs (potentially requires adding multiple LoRA loader nodes dynamically or using a multi-load node if available).

Task 5.4: Metadata/Time Recording & Estimation (Complex Feature)
Goal: Record generation parameters (models, settings, prompt) and timing for each successful image. Store this history. Calculate and display an estimated generation time based on current settings and historical data.

Status: Not Started.

Implementation:

Timing: In handleSendPromptToImageServices, record startTime = Date.now() before calling callImageGenerationAPI. In processComfyHistory (or equivalent success callback), calculate duration = Date.now() - startTime. Add duration to the metadata object.

Storage: Define a structure for history entries (e.g., { timestamp, imageUrl, prompt, settings: { model, steps, cfg, resolution... }, duration, metadata }). Use localStorage (with size limit/rotation) or IndexedDB to store an array of these entries. Save entry after successful generation/metadata processing.

Estimation: Create a function estimateTime(currentSettings): Retrieve history from storage. Filter history for entries with matching key settings (e.g., model, resolution, maybe steps). Calculate the average duration of matching entries. Display the estimate in the UI (e.g., near the "Send Prompt" button). Update estimate when relevant settings change. Handle cases with no matching history.

Appendix: Completed Tasks
Phase 1: Project Setup, Documentation & Basic Polish
Task 1.1: Finalize README.md File (Draft generated).

Task 1.2: Confirm requirements.txt (Not Applicable - Note added to README).

Task 1.3: Verify .gitignore and LICENSE (.gitignore generated, LICENSE instructions given).

Phase 2: UI Layout Adjustments
Task 2.1: Reposition "Generate API Prompt" button (Done in index.html).

Task 2.2 & 2.3: Reposition Image Generation Configuration section below API prompt output (Done via section reordering in index.html - User should verify final order).

Task 2.4: Set default Prompt Source radio button to "API Generated Prompt" (Done in index.html).

Phase 3: Core Functionality Enhancements
Task 3.1: Improve "Feeling Lucky" Randomization (Implemented in script.js baseline).

Task 3.2: Refine ComfyUI Endpoint Selection UI/Logic (Radio button UI added to index.html, JS logic updated in script.js baseline).

Task 3.3: Save/Load Custom Image Endpoints (Implemented using localStorage in script.js baseline).

Task 3.4: Save/Recall Last Used LAN Address (Implemented using localStorage in script.js baseline).

Phase 4: Image Results & Metadata Handling (Partial)
Task 4.1: Clickable Full-Screen Image Previews (CSS added, JS modal logic implemented in script.js baseline).

Task 4.2: Display Image Generation Metadata (Basic structure and extraction logic added, but requires refinement and implementation of placeholder functions).