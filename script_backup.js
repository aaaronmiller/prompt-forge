// Assumes data.js (with dropdownData, comfyWorkflows, and storedApiKeys) is loaded first

// --- System Prompt Templates ---
const systemPromptTemplates = {
    auto: `You are an expert prompt engineer specializing in image generation for t-shirt designs.
Use the user's selected keywords as strong inspiration to create a concise, vivid, and highly creative prompt suitable for a diffusion model like Flux or Stable Diffusion.
Focus on generating unique, artistic, and visually striking concepts. Combine elements in unexpected ways.
The final output should be ONLY the generated image prompt itself, without any conversational text, preamble, or explanation.
Ensure the prompt implies a style suitable for a t-shirt graphic (e.g., vector art, graphic illustration, stylized realism, abstract).
Add 2-3 related but unique elements not explicitly selected by the user to enhance creativity.
Keep the final prompt under 350 words.`,
    keywords: `You are an expert prompt engineer generating prompts optimized for models like Stable Diffusion 1.5/2.x which prefer concise, keyword-driven input.
Analyze the user's selected keywords/concepts below.
Generate a prompt consisting primarily of comma-separated keywords and short, impactful phrases. Use parentheses for emphasis if needed, e.g., (masterpiece:1.2).
Prioritize the most important visual elements (subject, action, key style).
Include relevant artistic style keywords (e.g., vector art, illustration, graphic design, synthwave, cinematic lighting, detailed background) appropriate for a t-shirt.
Add 1-2 related creative elements beyond the user's selection.
Output ONLY the comma-separated prompt string, without description or preamble. Ensure the output is a single line.
Keywords: [USER_KEYWORDS_HERE]`, // Placeholder for keywords if needed, but often better to let LLM read from context
    structured: `You are an expert prompt engineer generating highly detailed and structured prompts suitable for models like SDXL or Flux.
Analyze the user's selected keywords and concepts below.
Create a vivid and imaginative prompt using a combination of descriptive phrases and specific keywords, focusing on clear subject, action, environment, and artistic style.
Structure the prompt logically (e.g., subject, action, setting, style, modifiers).
Emphasize visual details (e.g., "intricate linework", "glowing neon signs reflect on wet surfaces"), composition ("dynamic angle", "rule of thirds"), lighting ("volumetric lighting", "chiaroscuro"), and artistic style ("Art Nouveau illustration", "cyberpunk concept art") suitable for a striking t-shirt graphic.
Incorporate 2-3 related creative elements to enhance uniqueness.
The final output should be ONLY the generated image prompt itself, without any conversational text, preamble, or explanation. Keep it under 400 words.
Keywords: [USER_KEYWORDS_HERE]`,
    sentences: `You are an expert prompt engineer crafting descriptive, sentence-based prompts suitable for models like DALL-E 3.
Based on the user's selected keywords below, write a short paragraph (2-4 rich, descriptive sentences) outlining a unique and artistic scene for a t-shirt design.
Focus on clear subject matter, action, setting, and mood. Integrate artistic style descriptions naturally within the sentences (e.g., "rendered in the style of detailed vector art with clean lines", "a painterly scene reminiscent of impressionism").
Add 2-3 creative, related details not explicitly mentioned by the user.
The final output must be ONLY the descriptive paragraph prompt, without any extra text, title, or introduction.
Keywords: [USER_KEYWORDS_HERE]`
};

// In script.js
const comfyWorkflowSpecifics = {
    "GGUF_COMFY_WORKFLOW": {
        type: "gguf_unet",
        promptNodeId: "6", promptInputName: "text",
        negativePromptNodeId: "46", negativePromptInputName: "text",
        seedNodeId: "31", seedInputName: "seed",
        modelNodeId: "40", modelInputName: "unet_name",
        sizeNodeId: "27", widthInputName: "width", heightInputName: "height",
        stepsNodeId: "31", stepsInputName: "steps",
        defaultWidth: 832, defaultHeight: 1216, defaultSteps: 4, defaultNegativePrompt: "low quality, text, watermark, blurry"
    },
    "MFLUX_WORKFLOW": {
        type: "mflux", // Model changing for MFlux via simple dropdown is not covered here
        promptNodeId: "2", promptInputName: "prompt",
        // Negative prompt for MFLUX might be an empty string in the main prompt or a dedicated input if the node supports it
        seedNodeId: "2", seedInputName: "seed",
        sizeNodeId: "2", widthInputName: "width", heightInputName: "height",
        stepsNodeId: "2", stepsInputName: "steps",
        defaultWidth: 512, defaultHeight: 768, defaultSteps: 4, defaultNegativePrompt: "" // MFlux might not use a separate negative prompt node
    },
    "CHECKPOINT_WORKFLOW": {
        type: "checkpoint",
        promptNodeId: "6", promptInputName: "text",
        negativePromptNodeId: "7", negativePromptInputName: "text",
        seedNodeId: "3", seedInputName: "seed",
        modelNodeId: "4", modelInputName: "ckpt_name",
        sizeNodeId: "5", widthInputName: "width", heightInputName: "height",
        stepsNodeId: "3", stepsInputName: "steps",
        defaultWidth: 512, defaultHeight: 512, defaultSteps: 20, defaultNegativePrompt: "text, watermark, ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, extra limbs, disfigured, deformed, body out of frame, bad anatomy, watermark, signature, cut off, low contrast, underexposed, overexposed, bad art, beginner, amateur, distorted face"
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Element References ---
    const pageContainer = document.getElementById('container');
    const feelLuckyButton = document.getElementById('feelLuckyButton');
    const generateKeywordsButton = document.getElementById('generateKeywordsButton');
    const luckyQuantityOptions = document.getElementById('lucky-quantity-options');
    const generateApiPromptButton = document.getElementById('generateApiPromptButton');
    const sendPromptButton = document.getElementById('sendPromptButton');
    const startNewPromptButton = document.getElementById('startNewPromptButton');
    const downloadResultsButton = document.getElementById('downloadResultsButton');
    const stopBatchButton = document.getElementById('stopBatchButton');
    const generatedKeywordsTextarea = document.getElementById('generatedKeywords');
    const keywordsSummaryContainer = document.getElementById('keywords-summary-container');
    const apiGeneratedPromptTextarea = document.getElementById('apiGeneratedPrompt');
    const apiGeneratedPromptContainer = document.getElementById('api-prompt-output-container');
    const mainMessageBox = document.getElementById('mainMessageBox');
    const configMessageBox = document.getElementById('configMessageBox');
    const resultsMessageBox = document.getElementById('resultsMessageBox');
    const llmEndpointSelect = document.getElementById('llmEndpoint');
    const customLlmEndpointContainer = document.getElementById('customLlmEndpointContainer');
    const customLlmEndpointInput = document.getElementById('customLlmEndpoint');
    const llmApiKeyInput = document.getElementById('llmApiKey');
    const llmModelNameInput = document.getElementById('llmModelName');
    const imageEndpointsContainer = document.getElementById('image-endpoints');
    const addCustomEndpointBtn = document.getElementById('add-custom-endpoint-btn');
    const customEndpointsList = document.getElementById('custom-endpoints-list');
    const comfyWorkflowSelect = document.getElementById('comfyWorkflowSelect');
    const configActionArea = document.querySelector('.config-action-area');
    const resultsContainer = document.getElementById('results-container');
    const keywordDetailsArea = document.getElementById('keyword-details-area');
    const keywordDetailsContent = document.getElementById('keyword-details-content');
    const imageResultsGrid = document.getElementById('image-results-grid');
    const enableSuccessivePromptCheckbox = document.getElementById('enableSuccessivePrompt');
    const promptSendSelectorRadios = document.querySelectorAll('input[name="promptToSend"]');
    const enableContinuousGenCheckbox = document.getElementById('enableContinuousGen');
    const continuousOptionsDiv = document.getElementById('continuous-options');
    const continuousGenCountInput = document.getElementById('continuousGenCount');
    const continuousModeRadios = document.querySelectorAll('input[name="continuousGenMode"]');
    const systemPromptTextarea = document.getElementById('systemPrompt');
    const promptFormatRadios = document.querySelectorAll('input[name="promptFormat"]');
    const collapseToggleButtons = document.querySelectorAll('.collapse-toggle-button');
    const ggufModelSelectorContainer = document.getElementById('ggufModelSelectorContainer');
    const ggufModelSelect = document.getElementById('ggufModelSelect');
    const checkpointModelSelectorContainer = document.getElementById('checkpointModelSelectorContainer');
    const checkpointModelSelect = document.getElementById('checkpointModelSelect');
    const comfySpecificParamsContainer = document.getElementById('comfySpecificParamsContainer'); // Parent container
    const comfyImageWidth = document.getElementById('comfyImageWidth');
    const comfyImageHeight = document.getElementById('comfyImageHeight');
    const comfySteps = document.getElementById('comfySteps');
    const comfyNegativePrompt = document.getElementById('comfyNegativePrompt');


    // --- Global State ---
    let currentSelectedImageEndpoints = [];
    const comfyPollingStates = {};
    let isContinuousModeActive = false;
    let continuousRunsRemaining = 0;
    let currentContinuousMode = 'keep_keywords_new_api'; // Default simplified mode
    let stopBatchFlag = false;


    // --- Initialization ---
if (typeof dropdownData === 'undefined') {
        console.error("ERR: dropdownData missing.");
        showMessage(mainMessageBox, 'error', 'Failed to load keyword data.');
    } else {
        populateDropdowns();
    }

    if (typeof comfyWorkflows === 'undefined') { // This check is for comfyWorkflows from data.js
        console.error("ERR: comfyWorkflows missing.");
        showMessage(configMessageBox, 'error', 'Failed to load ComfyUI workflows.');
    } else {
        console.log("INIT: About to call populateWorkflowSelect().");
        populateWorkflowSelect(); // Populates workflow dropdown & sets a default
        console.log("INIT: populateWorkflowSelect() finished. Current comfyWorkflowSelect.value:", comfyWorkflowSelect ? comfyWorkflowSelect.value : 'comfyWorkflowSelect is null');

        // >>> ADD THIS CRITICAL INITIAL CALL for UI visibility <<<
        console.log("INIT: Attempting THE CRUCIAL initial call to handleWorkflowSelectionChange().");
        if (typeof handleWorkflowSelectionChange === "function") {
            handleWorkflowSelectionChange();
        } else {
            console.error("INIT: handleWorkflowSelectionChange function is not defined yet!");
        }
        console.log("INIT: Initial call to handleWorkflowSelectionChange() process has been initiated/completed.");
    }

    // Ensure model file lists are loaded (typically from data.js, making them global)
    if (typeof ggufModelFiles === 'undefined') {
        console.warn("WARN: ggufModelFiles is not defined. GGUF model selector may not populate.");
    }
    if (typeof checkpointModelFiles === 'undefined') {
        console.warn("WARN: checkpointModelFiles is not defined. Checkpoint model selector may not populate.");
    }

    if (typeof systemPromptTemplates !== 'undefined') {
        updateSystemPrompt(); // Set initial system prompt
    } else {
        console.error("ERR: systemPromptTemplates missing.");
        systemPromptTextarea.value = "Error loading system prompt templates.";
    }
    addEventListeners();
    initializeCollapsibleSections();

function populateModelSelect(selectElement, modelList, defaultModelName) {
    selectElement.innerHTML = ''; // Clear existing options
    modelList.forEach(modelName => {
        const option = document.createElement('option');
        option.value = modelName;
        option.textContent = modelName.replace(/\.safetensors|\.gguf/gi, ''); // Clean up name for display
        selectElement.appendChild(option);
    });
    if (defaultModelName) {
        selectElement.value = defaultModelName;
    }
}
function handleWorkflowSelectionChange() {
    console.log("--- handleWorkflowSelectionChange called (V_DEBUG_BORDER) ---");

    if (!comfyWorkflowSelect) {
        console.error("[WorkflowChange] ABORT: comfyWorkflowSelect element not found!");
        return;
    }
    const selectedKey = comfyWorkflowSelect.value;
    console.log("[WorkflowChange] Selected workflow key from dropdown:", `"${selectedKey}"`);

    if (!comfyWorkflowSpecifics) {
        console.error("[WorkflowChange] ABORT: comfyWorkflowSpecifics object not found!");
        return;
    }
    const specifics = comfyWorkflowSpecifics[selectedKey];
    console.log("[WorkflowChange] Specifics found for this key:", specifics);

    if (!ggufModelSelectorContainer || !checkpointModelSelectorContainer || !comfySpecificParamsContainer || !comfyImageParamsContainer || !comfyNegativePrompt || !comfyImageWidth || !comfyImageHeight || !comfySteps) {
        console.error("[WorkflowChange] ABORT: One or more required parameter container/input DOM elements are missing!");
        return;
    }

    // Helper to apply debug styles
    const applyDebugStyles = (element, displayType = 'flex') => {
        if (element) {
            element.style.display = displayType;
            element.style.border = "2px solid red"; // TEMPORARY DEBUG BORDER
            element.style.minHeight = "30px";      // TEMPORARY DEBUG MIN-HEIGHT
            console.log(`[WorkflowChange_DEBUG] Applied display: ${displayType}, border, minHeight to ${element.id}`);
        }
    };
    const hideElement = (element) => {
        if (element) {
            element.style.display = 'none';
            element.style.border = ""; // Clear debug border
            element.style.minHeight = ""; // Clear debug min-height
        }
    };

    // Hide all specific param containers by default before evaluating specifics
    hideElement(ggufModelSelectorContainer);
    hideElement(checkpointModelSelectorContainer);
    hideElement(comfySpecificParamsContainer);
    const negPromptInputContainer = comfyNegativePrompt.parentElement;
    if (negPromptInputContainer) hideElement(negPromptInputContainer);


    if (specifics) {
        console.log("[WorkflowChange] Valid 'specifics' object found. Attempting to make comfySpecificParamsContainer visible.");
        applyDebugStyles(comfySpecificParamsContainer, 'flex');

        if (specifics.type === "gguf_unet") {
            console.log("[WorkflowChange] Workflow type is 'gguf_unet'. Attempting to show GGUF model selector.");
            applyDebugStyles(ggufModelSelectorContainer, 'flex');
            if (typeof ggufModelFiles !== 'undefined' && typeof populateModelSelect === 'function') {
                let defaultGgufModel = (ggufModelFiles.length > 0 ? ggufModelFiles[0] : null);
                if (specifics.defaultModel) {
                    defaultGgufModel = specifics.defaultModel;
                } else if (specifics.modelInputName && comfyWorkflows && comfyWorkflows[selectedKey]) {
                    const regex = new RegExp(`"${specifics.modelInputName}":\\s*"([^"]+)"`);
                    const match = comfyWorkflows[selectedKey].match(regex);
                    if (match && match[1] && match[1] !== "[MODEL_NAME_PLACEHOLDER]") {
                        defaultGgufModel = match[1];
                    }
                }
                populateModelSelect(ggufModelSelect, ggufModelFiles, defaultGgufModel);
                console.log("[WorkflowChange] GGUF Model selector populated. Attempted default:", defaultGgufModel);
            } else {
                console.warn("[WorkflowChange] ggufModelFiles array or populateModelSelect function is missing/undefined for GGUF type.");
            }
        } else if (specifics.type === "checkpoint") {
            console.log("[WorkflowChange] Workflow type is 'checkpoint'. Attempting to show Checkpoint model selector.");
            applyDebugStyles(checkpointModelSelectorContainer, 'flex');
            if (typeof checkpointModelFiles !== 'undefined' && typeof populateModelSelect === 'function') {
                let defaultCheckpointModel = (checkpointModelFiles.length > 0 ? checkpointModelFiles[0] : null);
                if (specifics.defaultModel) {
                    defaultCheckpointModel = specifics.defaultModel;
                } else if (specifics.modelInputName && comfyWorkflows && comfyWorkflows[selectedKey]) {
                    const regex = new RegExp(`"${specifics.modelInputName}":\\s*"([^"]+)"`);
                    const match = comfyWorkflows[selectedKey].match(regex);
                    if (match && match[1] && match[1] !== "[MODEL_NAME_PLACEHOLDER]") {
                        defaultCheckpointModel = match[1];
                    }
                }
                populateModelSelect(checkpointModelSelect, checkpointModelFiles, defaultCheckpointModel);
                console.log("[WorkflowChange] Checkpoint Model selector populated. Attempted default:", defaultCheckpointModel);
            } else {
                console.warn("[WorkflowChange] checkpointModelFiles array or populateModelSelect function is missing/undefined for Checkpoint type.");
            }
        }

        console.log("[WorkflowChange] Setting default values for Width, Height, Steps, Negative Prompt.");
        comfyImageWidth.value = specifics.defaultWidth || 512;
        comfyImageHeight.value = specifics.defaultHeight || 512;
        comfySteps.value = specifics.defaultSteps || 20;

        if (specifics.negativePromptNodeId && specifics.negativePromptInputName) {
            comfyNegativePrompt.value = specifics.defaultNegativePrompt || "";
            if (negPromptInputContainer) applyDebugStyles(negPromptInputContainer, 'flex');
            console.log("[WorkflowChange] Negative prompt field made visible. Default value set to:", `"${comfyNegativePrompt.value}"`);
        } else {
            if (negPromptInputContainer) hideElement(negPromptInputContainer);
            console.log("[WorkflowChange] Negative prompt field hidden for this workflow type.");
        }
        console.log(`[WorkflowChange] Final UI values - Width: ${comfyImageWidth.value}, Height: ${comfyImageHeight.value}, Steps: ${comfySteps.value}`);

    } else {
        console.log("[WorkflowChange] No 'specifics' data found for the selected workflow key OR selected key is empty. All optional ComfyUI parameter fields will remain hidden.");
        // Ensure everything is hidden if no specifics (already done by hideElement calls above)
    }
    console.log("--- handleWorkflowSelectionChange finished (V_DEBUG_BORDER) ---");
}

// In your main initialization logic within DOMContentLoaded:
// After populateWorkflowSelect() is called and potentially sets a default workflow:
// comfyWorkflowSelect.addEventListener('change', handleWorkflowSelectionChange);
// handleWorkflowSelectionChange(); // Call once to set initial UI state

    // --- Function to Populate Keyword Dropdowns ---
    function populateDropdowns() {
        if (typeof dropdownData === 'undefined') { console.error("Cannot populate dropdowns, dropdownData is not defined."); return; }
        for (const categoryId in dropdownData) {
            const containerDiv = document.getElementById(categoryId);
            if (containerDiv) {
                const contentHolder = document.createElement('div');
                contentHolder.className = 'dropdown-content-holder';
                dropdownData[categoryId].forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'dropdown-item';
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = item.id;
                    checkbox.value = item.value;
                    const label = document.createElement('label');
                    label.htmlFor = item.id;
                    label.textContent = item.label;
                    itemDiv.appendChild(checkbox);
                    itemDiv.appendChild(label);
                    contentHolder.appendChild(itemDiv);
                });
                containerDiv.appendChild(contentHolder);
            } else {
                console.warn(`Dropdown container div id "${categoryId}" not found.`);
            }
        }
    }

    // --- Function to Populate ComfyUI Workflow Select ---
  function populateWorkflowSelect() {
    if (!comfyWorkflowSelect || typeof comfyWorkflows === 'undefined') return;
    comfyWorkflowSelect.innerHTML = '<option value="">-- Select --</option>'; // Clear existing options

    let defaultWorkflowKey = null; // Variable to hold your desired default

    for (const key in comfyWorkflows) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key.replace(/_/g, ' ').replace('WORKFLOW', '').trim() || key;
        comfyWorkflowSelect.appendChild(option);

        // Check if this key is your desired default
        // Assuming your key in comfyWorkflows is exactly "GGUF_COMFY_WORKFLOW"
        if (key === "GGUF_COMFY_WORKFLOW") {
            defaultWorkflowKey = key;
        }
    }

    // After the loop, if a default was found, set it
    if (defaultWorkflowKey) {
        comfyWorkflowSelect.value = defaultWorkflowKey;
        console.log(`Default workflow set to: ${defaultWorkflowKey}`);
    } else if (Object.keys(comfyWorkflows).length > 0) {
        // Optional: Select the first available workflow if the specific default isn't found
        // const firstKey = Object.keys(comfyWorkflows)[0];
        // comfyWorkflowSelect.value = firstKey;
        // console.warn(`Default workflow "GGUF_COMFY_WORKFLOW" not found. Selected first available: ${firstKey}`);
        console.warn(`Default workflow "GGUF_COMFY_WORKFLOW" not found in comfyWorkflows data. Ensure the key matches.`);
    }
}

     // --- Collapsible Section Logic ---
    function initializeCollapsibleSections() {
        collapseToggleButtons.forEach(button => {
            const contentId = button.getAttribute('aria-controls');
            const content = document.getElementById(contentId);
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            if (content) {
                content.hidden = !isExpanded;
            }
            const icon = button.querySelector('.collapse-icon');
            if(icon) {
                // Ensure correct initial state
                icon.classList.remove('fa-chevron-up', 'fa-chevron-down');
                icon.classList.add(isExpanded ? 'fa-chevron-up' : 'fa-chevron-down');
            }
        });
    }

    function toggleCollapse(button) {
        const contentId = button.getAttribute('aria-controls');
        const content = document.getElementById(contentId);
        const icon = button.querySelector('.collapse-icon');
        if (content) {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', !isExpanded);
            content.hidden = isExpanded;
            if (icon) {
                icon.classList.toggle('fa-chevron-up', !isExpanded);
                icon.classList.toggle('fa-chevron-down', isExpanded);
            }
        }
    }

    // --- Update System Prompt based on Radio Selection ---
    function updateSystemPrompt() {
        const selectedFormat = document.querySelector('input[name="promptFormat"]:checked')?.value || 'structured';
        if (systemPromptTemplates && systemPromptTemplates[selectedFormat]) {
            systemPromptTextarea.value = systemPromptTemplates[selectedFormat];
            console.log(`System prompt updated for format: ${selectedFormat}`);
        } else {
            console.error(`System prompt template for format "${selectedFormat}" not found.`);
            systemPromptTextarea.value = systemPromptTemplates['auto'] || "Error loading system prompt template.";
        }
    }

    // --- Event Listeners Setup ---
    function addEventListeners() {
        llmEndpointSelect.addEventListener('change', function() {
            customLlmEndpointContainer.style.display = (this.value === 'custom_llm') ? 'block' : 'none';
        });
        feelLuckyButton.addEventListener('click', handleFeelLucky);
        generateKeywordsButton.addEventListener('click', handleGenerateKeywords);
        generateApiPromptButton.addEventListener('click', handleGenerateApiPromptClick); // Added click feedback internally
        sendPromptButton.addEventListener('click', handleSendPromptClick); // Added click feedback internally
        startNewPromptButton.addEventListener('click', resetForm);
        downloadResultsButton.addEventListener('click', downloadResultsText); // Added console log internally
        addCustomEndpointBtn.addEventListener('click', addCustomImageEndpointInput); // Added console log internally
        customEndpointsList.addEventListener('click', handleRemoveCustomEndpoint); // Delegated
        collapseToggleButtons.forEach(button => {
            button.addEventListener('click', () => toggleCollapse(button));
        });
        enableContinuousGenCheckbox.addEventListener('change', toggleContinuousOptions);
        stopBatchButton.addEventListener('click', handleStopBatch);
        promptFormatRadios.forEach(radio => {
            radio.addEventListener('change', updateSystemPrompt);
        });
        pageContainer.addEventListener('click', handleCopyClick); // Delegated copy listener
    }

   async function handleSendPromptClick() {
    console.log("Handling 'Send Prompt / Start Batch' click...");
    sendPromptButton.disabled = true;
    const originalButtonText = sendPromptButton.innerHTML;
    const isBatch = enableContinuousGenCheckbox.checked;
    let initialMessageUiBox = resultsMessageBox; // Default

    if (isBatch) {
        sendPromptButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting Batch...';
        stopBatchButton.style.display = 'inline-flex';
        stopBatchButton.disabled = false;
        stopBatchButton.innerHTML = '<i class="fas fa-stop-circle"></i> Stop Batch';
        initialMessageUiBox = configMessageBox; // Use config box for batch start message
        showMessage(initialMessageUiBox, 'loading', 'Starting image generation batch...', true);
    } else {
        sendPromptButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        showMessage(resultsMessageBox, 'loading', 'Sending prompt to image service(s)...', true);
        // No need to hide stopBatchButton here, finally block will handle it if not a batch
    }

    try {
        if (isBatch) {
            isContinuousModeActive = true; // Set active flag BEFORE await
            stopBatchFlag = false;
            continuousRunsRemaining = parseInt(continuousGenCountInput.value, 10) || 1;
            if (continuousRunsRemaining <= 0) continuousRunsRemaining = 1;
            imageResultsGrid.innerHTML = '';
            await startContinuousGenerationLoop();
            // Button/state for batch completion is handled within startContinuousGenerationLoop's exit conditions
        } else {
            isContinuousModeActive = false; // Ensure it's false for single runs
            const runId = Date.now();
            await handleSendPromptToImageServices(runId.toString(), null);
            // Messages for single run are handled by handleSendPromptToImageServices
            // Button restoration for successful single run will be handled by finally
        }
    } catch (error) {
        // This catch handles errors primarily from the setup phase (e.g., parsing continuousGenCountInput)
        // or if handleSendPromptToImageServices throws an error that isn't caught internally AND it's a single run.
        console.error("Error starting prompt sending process:", error);
        const errorMsgBox = isBatch ? configMessageBox : resultsMessageBox; // Use the same box as initial message for consistency
        showMessage(errorMsgBox, 'error', `Error: ${error.message}`);

        if (isBatch) {
            // If starting the batch itself failed, reset batch state
            isContinuousModeActive = false; // Critical to ensure finally block restores button
        }
        // The finally block will handle button restoration based on isContinuousModeActive
    } finally {
        // This block ensures button states are correctly restored if not in an ongoing batch.
        if (!isContinuousModeActive) {
            sendPromptButton.disabled = false;
            // Restore to appropriate text based on whether continuous mode is still enabled in checkbox
            if (enableContinuousGenCheckbox.checked) {
                 sendPromptButton.innerHTML = '<i class="fas fa-play-circle"></i> Start Batch';
            } else {
                 sendPromptButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send Prompt';
            }
            // If it wasn't a batch run, or if batch setup failed and isContinuousModeActive is now false,
            // ensure stop button is hidden.
            stopBatchButton.style.display = 'none';
        }
        // If isContinuousModeActive is true, it means a batch is running, and its own loop
        // is responsible for the button states until it finishes or is stopped.
    }
}
    // --- Specific Event Handler Functions ---
    function handleFeelLucky() {
        console.log("Handling 'Feel Lucky' click...");
        try {
            const allCheckboxes = document.querySelectorAll('#keyword-details-content input[type="checkbox"]');
            if (!allCheckboxes.length) {
                showMessage(mainMessageBox, 'error', 'No keywords available.');
                return;
            }

            const quantityOption = document.querySelector('input[name="luckyQuantity"]:checked');
            let minQty = 10, maxQty = 20;
            if (quantityOption) {
                [minQty, maxQty] = quantityOption.value.split('-').map(Number);
            }

            const targetQty = Math.floor(Math.random() * (maxQty - minQty + 1)) + minQty;
            const actualQty = Math.min(targetQty, allCheckboxes.length);

            // Uncheck all first
            allCheckboxes.forEach(cb => cb.checked = false);

            // Shuffle and select
            const shuffledCheckboxes = Array.from(allCheckboxes).sort(() => Math.random() - 0.5);
            for (let i = 0; i < actualQty; i++) {
                if (shuffledCheckboxes[i]) shuffledCheckboxes[i].checked = true;
            }

            generateKeywordString(); // Update the summary textarea
            apiGeneratedPromptTextarea.value = ""; // Clear API prompt
            showMessage(mainMessageBox, 'success', `Feeling lucky! Selected ${actualQty} random keywords.`);
            keywordsSummaryContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (error) {
            console.error("Error 'Feeling Lucky':", error);
            showMessage(mainMessageBox, 'error', "Error randomizing keywords.");
        }
    }

    function handleGenerateKeywords() {
        console.log("Handling 'Generate Keywords' click...");
        try {
            const keywords = generateKeywordString(); // Update the summary textarea
            apiGeneratedPromptTextarea.value = ""; // Clear API prompt
            if (keywords) {
                showMessage(mainMessageBox, 'success', "Keyword summary generated/updated.");
                keywordsSummaryContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                showMessage(mainMessageBox, 'error', "No keywords selected in the details section below.");
                // Optionally open the details section if closed
                const detailsButton = document.querySelector('#keyword-details-area .collapse-toggle-button');
                const detailsContent = document.getElementById('keyword-details-content');
                if (detailsButton && detailsContent && detailsContent.hidden) {
                    toggleCollapse(detailsButton);
                }
                keywordDetailsArea.scrollIntoView({ behavior: 'smooth', block: 'start'});
            }
        } catch (error) {
            console.error("Error 'Gen Keywords':", error);
            showMessage(mainMessageBox, 'error', "Error generating keywords.");
        }
    }

    async function handleGenerateApiPromptClick() {
        console.log("Handling 'Generate API Prompt' click...");
        // --- Click Feedback ---
        generateApiPromptButton.disabled = true;
        const originalButtonText = generateApiPromptButton.innerHTML;
        generateApiPromptButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        showMessage(configMessageBox, 'loading', 'Requesting prompt from LLM...');
        // ---------------------

        try {
            const success = await handleGenerateApiPrompt(); // Actual logic
            if (success) {
                apiGeneratedPromptContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                hideMessage(configMessageBox); // Hide loading message
                showMessage(mainMessageBox, 'success', 'API prompt generated successfully!'); // Show success in main box
            } else {
                // Error message already shown by handleGenerateApiPrompt
                configActionArea.querySelector('.api-config')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } catch (error) {
             // Catch any unexpected error during the process
             console.error("Unexpected error during API prompt generation:", error);
             showMessage(configMessageBox, 'error', `Unexpected Error: ${error.message}`);
        } finally {
            // --- Restore Button ---
            generateApiPromptButton.disabled = false;
            generateApiPromptButton.innerHTML = originalButtonText;
            // ---------------------
        }
    }

    function handleRemoveCustomEndpoint(event) {
        console.log("Handling remove custom endpoint click...");
        const removeButton = event.target.closest('.remove-endpoint-btn');
        if (removeButton) {
             console.log("Remove button clicked, removing item.");
            removeButton.closest('.custom-endpoint-item').remove();
        }
    }

// In script.js

    function addCustomImageEndpointInput() {
    console.log("--- Add Custom Image Endpoint Input Triggered ---"); // DEBUG LOG
    const itemId = `custom-endpoint-${Date.now()}`;
    const div = document.createElement('div');
    div.className = 'custom-endpoint-item';
    div.innerHTML = `
        <input type="checkbox" id="chk-${itemId}" value="custom_image" data-input-id="${itemId}" checked style="margin-right: 0.5rem; transform: scale(1.1); accent-color: var(--accent-primary);">
        <input type="text" id="${itemId}" class="custom-endpoint-input" placeholder="Enter Custom Image Endpoint URL (e.g., http://...)">
        <button type="button" class="remove-endpoint-btn" title="Remove Endpoint"><i class="fas fa-times-circle"></i></button>
    `;
    customEndpointsList.appendChild(div);
    div.querySelector(`#${itemId}`).focus(); // Focus the new input field

    // --- NEW LOGIC TO DESELECT LOCAL COMFYUI ---
    const localComfyUICheckbox = document.getElementById('img-comfyui');
    if (localComfyUICheckbox && localComfyUICheckbox.checked) {
        localComfyUICheckbox.checked = false;
        console.log("Local ComfyUI checkbox automatically deselected because a new custom endpoint was added.");

        // OPTIONAL: If deselecting ComfyUI needs to trigger other dependent UI changes
        // (like hiding/showing the workflow dropdown if it was tied to ComfyUI's checked state via a JS event listener),
        // you might need to manually dispatch a 'change' event.
        // However, based on your current script, simply unchecking it should be sufficient
        // as the selection is read when "Send Prompt" is clicked.
        // Example of dispatching event if needed:
        // localComfyUICheckbox.dispatchEvent(new Event('change', { bubbles: true }));
    }
    // --- END NEW LOGIC ---
    }
    function toggleContinuousOptions() {
        continuousOptionsDiv.style.display = enableContinuousGenCheckbox.checked ? 'block' : 'none';
        sendPromptButton.innerHTML = enableContinuousGenCheckbox.checked
            ? '<i class="fas fa-play-circle"></i> Start Batch'
            : '<i class="fas fa-paper-plane"></i> Send Prompt';
        // Disable successive prompt if continuous is enabled
        enableSuccessivePromptCheckbox.disabled = enableContinuousGenCheckbox.checked;
        if (enableContinuousGenCheckbox.checked) {
            enableSuccessivePromptCheckbox.checked = false;
        }
    }

    function handleStopBatch() {
        console.log("--- Stop Batch Button Clicked ---");
        stopBatchFlag = true;
        showMessage(configMessageBox, 'warning', 'Stop requested. Finishing current image generation if in progress...');
        stopBatchButton.disabled = true;
        stopBatchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Stopping...';
        // The actual stop happens within the polling loops and the main generation loop check
    }

    async function handleCopyClick(event) {
        const copyButton = event.target.closest('.copy-button');
        if (!copyButton) return;

        const targetId = copyButton.dataset.target;
        if (!targetId) return;

        const targetTextarea = document.getElementById(targetId);
        if (!targetTextarea) return;

        const textToCopy = targetTextarea.value;
        if (!textToCopy) {
            console.warn("Textarea empty, nothing to copy.");
            return; // Don't show feedback if empty
        }

        try {
            await navigator.clipboard.writeText(textToCopy);
            console.log('Text copied to clipboard:', textToCopy.substring(0, 50) + '...');

            const originalIcon = copyButton.innerHTML;
            copyButton.innerHTML = '<i class="fas fa-check"></i>';
            copyButton.classList.add('copied');

            // Determine appropriate feedback box
            let feedbackBox = mainMessageBox; // Default
            if (targetId === 'apiGeneratedPrompt') {
                feedbackBox = mainMessageBox;
            } else if (targetId === 'systemPrompt') {
                feedbackBox = configMessageBox;
            }

            showMessage(feedbackBox, 'success', `Copied ${targetId === 'generatedKeywords' ? 'Keywords' : targetId === 'apiGeneratedPrompt' ? 'API Prompt' : 'System Prompt'}!`);

            setTimeout(() => {
                copyButton.innerHTML = originalIcon;
                copyButton.classList.remove('copied');
            }, 1500);

        } catch (err) {
            console.error('Failed to copy text: ', err);
            let feedbackBox = mainMessageBox; // Default
             if (targetId === 'apiGeneratedPrompt') feedbackBox = mainMessageBox;
             else if (targetId === 'systemPrompt') feedbackBox = configMessageBox;
            showMessage(feedbackBox, 'error', 'Failed to copy text to clipboard.');
        }
    }

    // --- View Management (Reset Function) ---
    function resetForm() {
        console.log("Resetting form...");
        // Uncheck all keyword checkboxes
        const keywordCheckboxes = document.querySelectorAll('#keyword-details-area input[type="checkbox"]');
        keywordCheckboxes.forEach(cb => cb.checked = false);

        // Clear custom image endpoints
        customEndpointsList.innerHTML = '';

        // Uncheck ComfyUI and reset workflow
        const comfyCheckbox = document.getElementById('img-comfyui');
        if(comfyCheckbox) comfyCheckbox.checked = false;
        if (comfyWorkflowSelect) comfyWorkflowSelect.selectedIndex = 0;

        // Clear textareas
        generatedKeywordsTextarea.value = "";
        generatedKeywordsTextarea.placeholder = "Click 'Generate Keywords' or 'I'm Feeling Lucky'...";
        apiGeneratedPromptTextarea.value = "";
        apiGeneratedPromptTextarea.placeholder = "Click 'Generate API Prompt' below...";

        // Clear polling intervals
        Object.values(comfyPollingStates).forEach(intervalId => clearInterval(intervalId));
        Object.keys(comfyPollingStates).forEach(key => delete comfyPollingStates[key]);

        // Reset image results area
        imageResultsGrid.innerHTML = '<div class="placeholder-text" style="color: var(--text-placeholder); text-align: center; grid-column: 1 / -1; padding: 1rem 0;">Configure endpoints, then click \'Send Prompt\'...</div>';

        // Hide all message boxes
        hideMessage(mainMessageBox);
        hideMessage(configMessageBox);
        hideMessage(resultsMessageBox);

        // Reset config options
        document.getElementById('send-keywords').checked = true;
        enableSuccessivePromptCheckbox.checked = false;
        enableSuccessivePromptCheckbox.disabled = false; // Re-enable

        llmEndpointSelect.selectedIndex = 0;
        customLlmEndpointContainer.style.display = 'none';
        customLlmEndpointInput.value = '';
        llmApiKeyInput.value = '';
        llmModelNameInput.value = '';

        // Reset prompt format and system prompt
        const defaultFormatRadio = document.getElementById('format-structured');
        if (defaultFormatRadio) defaultFormatRadio.checked = true;
        updateSystemPrompt();

        // Reset lucky quantity
        const defaultLuckyQty = document.getElementById('lucky-qty-small');
        if (defaultLuckyQty) defaultLuckyQty.checked = true;

        // Reset continuous generation
        enableContinuousGenCheckbox.checked = false;
        continuousOptionsDiv.style.display = 'none';
        continuousGenCountInput.value = '5';
        const defaultContinuousMode = document.getElementById('mode-keep-keywords');
        if(defaultContinuousMode) defaultContinuousMode.checked = true;

        // Reset state flags
        isContinuousModeActive = false;
        continuousRunsRemaining = 0;
        stopBatchFlag = false;

        // Reset button states
        sendPromptButton.disabled = false;
        sendPromptButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send Prompt';
        stopBatchButton.style.display = 'none';
        stopBatchButton.disabled = false;
        stopBatchButton.innerHTML = '<i class="fas fa-stop-circle"></i> Stop Batch';
        generateApiPromptButton.disabled = false;
        generateApiPromptButton.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Generate API Prompt';

        // Re-initialize collapsible sections (optional, usually not needed)
        // initializeCollapsibleSections();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        console.log("Form reset complete.");
    }


    // --- Helper Functions ---
    function showMessage(targetBox, type, text, isPersistent = false) {
        if (!targetBox) { console.error("Target message box not found!", text); return; }
        targetBox.textContent = text;
        targetBox.className = `message-box ${type}`;
        targetBox.style.display = 'block';
        targetBox.classList.remove('hidden'); // Ensure it's visible

        // Clear previous timeout if exists
        const existingTimeoutId = targetBox.getAttribute('data-timeout-id');
        if (existingTimeoutId) {
            clearTimeout(parseInt(existingTimeoutId, 10));
        }

        // Set new timeout unless persistent or just 'loading'
        if (!isPersistent && type !== 'loading') {
             const timeoutId = setTimeout(() => {
                 // Only hide if the text hasn't changed (prevents race conditions)
                 if (targetBox.textContent === text) {
                     hideMessage(targetBox);
                 }
             }, 6000);
             targetBox.setAttribute('data-timeout-id', timeoutId.toString());
        } else {
             targetBox.removeAttribute('data-timeout-id'); // Remove attribute if persistent or loading
        }
    }

    function hideMessage(targetBox) {
        if (!targetBox) return;
        targetBox.classList.add('hidden'); // Add class for fade-out effect
        // Use transitionend event to set display: none after fade
        targetBox.addEventListener('transitionend', function handler() {
            targetBox.style.display = 'none';
            targetBox.removeEventListener('transitionend', handler); // Clean up listener
        }, { once: true }); // Ensure listener runs only once

        // Clear any associated timeout
        const existingTimeoutId = targetBox.getAttribute('data-timeout-id');
        if (existingTimeoutId) {
            clearTimeout(parseInt(existingTimeoutId, 10));
            targetBox.removeAttribute('data-timeout-id');
        }
    }

    function getCheckedValues(divId) {
        const container = document.getElementById(divId);
        if (!container) return [];
        const contentHolder = container.querySelector('.dropdown-content-holder');
        if (!contentHolder) return [];
        const checkboxes = contentHolder.querySelectorAll('input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    function generateUUID() {
        // Basic UUID v4 generation
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function generateRandomSeed() {
        // Generate large integer seed compatible with many backends
        return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    }

    function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result); // Returns data URL (data:...)
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }


    // --- Keyword Generation ---
    function generateKeywordString() {
        hideMessage(mainMessageBox); // Hide previous messages
        let contentParts = [], contextModifierParts = [], cinematicOptionsParts = [];

        if (typeof dropdownData === 'undefined') {
            console.error("dropdownData not loaded for generateKeywordString");
            return null;
        }

        for (const categoryId in dropdownData) {
            const checkedValues = getCheckedValues(categoryId);
            if (checkedValues.length > 0) {
                // Simplified logic: Just join all values with commas for now
                // We can add more sophisticated phrasing later if needed
                contextModifierParts.push(...checkedValues);
            }
        }

        if (contextModifierParts.length === 0) {
            const placeholderText = "No keywords selected. Please choose some options in the details section below or try 'I'm Feeling Lucky'!";
            generatedKeywordsTextarea.value = ""; // Clear value
            generatedKeywordsTextarea.placeholder = placeholderText;
            return null; // Indicate no keywords were generated
        }

        // Join all collected keywords/phrases with commas
        const finalString = contextModifierParts.join(", ");
        generatedKeywordsTextarea.value = finalString;
        generatedKeywordsTextarea.placeholder = "Keywords selected..."; // Update placeholder

        return finalString;
    }


    // --- Handle Generate API Prompt (Actual Logic) ---
    async function handleGenerateApiPrompt() {
        const keywordString = generatedKeywordsTextarea.value.trim();
        if (!keywordString || keywordString.startsWith("No keywords selected")) {
            showMessage(mainMessageBox, 'error', "Keyword Summary is empty or invalid. Generate keywords first.");
            keywordsSummaryContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return false; // Indicate failure
        }

        apiGeneratedPromptTextarea.value = ""; // Clear previous API prompt
        // Loading message is shown by the click handler

        try {
            const finalPrompt = await callLLMForPrompt(keywordString, configMessageBox);
            if (finalPrompt !== null) { // Check for null specifically (means error handled)
                apiGeneratedPromptTextarea.value = finalPrompt;
                // Success message shown by click handler
                return true; // Indicate success
            } else {
                apiGeneratedPromptTextarea.value = "LLM generation failed. See message above.";
                return false; // Indicate failure
            }
        } catch (error) {
             // Error should have been shown by callLLMForPrompt, but catch just in case
            console.error("Error during LLM prompt generation process:", error);
            apiGeneratedPromptTextarea.value = `LLM Generation Error: ${error.message}`;
            showMessage(configMessageBox, 'error', `LLM Error: ${error.message}`); // Ensure message is shown
            return false; // Indicate failure
        }
    }


    // --- LLM API Call Function ---
    async function callLLMForPrompt(keywordPromptForLLM, targetMessageBox) {
        const selectedLlmEndpointValue = llmEndpointSelect.value;
        const modelName = llmModelNameInput.value.trim();
        let systemPrompt = systemPromptTextarea.value;
        let apiKey = llmApiKeyInput.value.trim(); // Ensure trimmed
        let requestBody;
        let requestHeaders = { 'Content-Type': 'application/json' };
        let endpointUrl = selectedLlmEndpointValue; // Base URL from selection
        let apiUrl; // Final URL for fetch

        console.log(`Calling LLM. Endpoint Type: ${selectedLlmEndpointValue}, Model: ${modelName || 'Default'}`);

         try {
             // Determine API URL and Request Body based on selected endpoint
             if (endpointUrl.includes('generativelanguage.googleapis.com')) {
                 // --- Gemini ---
                 if (typeof storedApiKeys !== 'undefined' && storedApiKeys.gemini) {
                     apiKey = storedApiKeys.gemini; // Use stored key if available
                     console.log("Using stored Gemini API key.");
                 } else {
                     console.warn("Stored Gemini API Key not found in data.js. Using input field value.");
                 }
                 if (!apiKey) { throw new Error("Gemini API Key is missing (check input field or data.js)."); }

                 const geminiModel = modelName || "gemini-1.5-flash-latest"; // Default Gemini model
                 apiUrl = `${endpointUrl}/models/${geminiModel}:generateContent?key=${apiKey}`; // Key in URL for Gemini

                 requestBody = {
                     contents: [
                         { role: "user", parts: [{ text: keywordPromptForLLM }] }
                     ],
                     ...(systemPrompt && { systemInstruction: { role: "system", parts: [{ text: systemPrompt }] } }),
                     generationConfig: {
                         temperature: 0.7,
                         maxOutputTokens: 800
                         // topP, topK can be added here if needed
                     }
                 };
                 // Gemini doesn't typically use Authorization header when key is in URL
             } else if (endpointUrl.includes('localhost:1234')) {
                 // --- LM Studio (OpenAI Format) ---
                 apiUrl = `${endpointUrl}/chat/completions`; // Assuming v1 path is included in dropdown value
                 if (!modelName) console.warn("LM Studio might require a model name in the input field.");
                 requestBody = {
                     model: modelName || "loaded-model", // Provide a default or ensure user sets it
                     messages: [
                         ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
                         { role: "user", content: keywordPromptForLLM }
                     ],
                     temperature: 0.7,
                     max_tokens: 400 // Adjust as needed
                     // stream: false // Ensure streaming is off
                 };
                 if (apiKey) {
                     requestHeaders['Authorization'] = `Bearer ${apiKey}`;
                     console.log("Sending API Key from input field to LM Studio endpoint.");
                 }
             } else if (endpointUrl.includes('localhost:11434')) {
                 // --- Ollama (OpenAI Format) ---
                 // NOTE: Assumes Ollama is serving OpenAI compatible endpoint at /v1/chat/completions
                 apiUrl = `${endpointUrl}/chat/completions`; // Assuming v1 path from dropdown
                 if (!modelName) { throw new Error("Missing Ollama Model Name (set in input field)."); }
                 requestBody = {
                     model: modelName,
                     messages: [
                         ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
                         { role: "user", content: keywordPromptForLLM }
                     ],
                     stream: false, // Important for single response
                     options: { // Ollama specific options can go here if needed
                         temperature: 0.7
                     }
                 };
                  if (apiKey) { // Often not needed for local Ollama, but include if user provides one
                     requestHeaders['Authorization'] = `Bearer ${apiKey}`;
                     console.log("Sending API Key (if provided) to Ollama endpoint.");
                 }

             } else {
                 // --- Custom LLM Endpoint ---
                 if (selectedLlmEndpointValue === 'custom_llm') {
                     endpointUrl = customLlmEndpointInput.value.trim();
                     if (!endpointUrl) throw new Error("Custom LLM Endpoint URL is missing.");
                     apiUrl = endpointUrl;
                 } else {
                     // Should not happen if dropdown values are correct, but handle defensively
                     apiUrl = endpointUrl;
                 }

                 if (!apiUrl) throw new Error("LLM Endpoint URL is invalid.");

                 // Assume OpenAI compatible format for Custom unless specified otherwise
                 if (!apiUrl.endsWith('/chat/completions') && !apiUrl.endsWith('/v1/chat/completions')) {
                     apiUrl = apiUrl.replace(/\/$/, '') + '/v1/chat/completions'; // Append standard path
                     console.warn(`Assuming OpenAI compatible path for custom LLM: ${apiUrl}`);
                 }

                 if (!modelName) console.warn("Custom LLM endpoint might require a model name.");

                 requestBody = {
                     model: modelName || "custom-llm-model", // Provide a default
                     messages: [
                         ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
                         { role: "user", content: keywordPromptForLLM }
                     ],
                     temperature: 0.7,
                     max_tokens: 400,
                     stream: false
                 };
                 if (apiKey) {
                     requestHeaders['Authorization'] = `Bearer ${apiKey}`;
                 }
             }

             console.log(">>> Sending LLM Request to:", apiUrl);
             console.log(">>> Request Headers:", requestHeaders);
             console.log(">>> Request Body:", JSON.stringify(requestBody));

             const response = await fetch(apiUrl, {
                 method: 'POST',
                 headers: requestHeaders,
                 body: JSON.stringify(requestBody)
             });

             console.log("<<< LLM Response Status:", response.status, response.statusText);

             if (!response.ok) {
                 let errorBodyText = await response.text(); // Try to get error details
                 console.error("<<< LLM Response Error Body:", errorBodyText);
                 let errorMessage = `HTTP ${response.status} ${response.statusText}`;
                 try {
                     // Attempt to parse as JSON for more specific error messages
                     const errorJson = JSON.parse(errorBodyText);
                     errorMessage = errorJson.error?.message || errorJson.message || errorJson.error || JSON.stringify(errorJson);
                 } catch (_) {
                     // If not JSON, use the raw text or the HTTP status
                     errorMessage = errorBodyText || errorMessage;
                 }
                  // Limit length of displayed error
                 if (errorMessage.length > 300) errorMessage = errorMessage.substring(0, 300) + "...";
                 throw new Error(`LLM API Error: ${errorMessage}`);
             }

             const responseData = await response.json();
             console.log("<<< LLM Response Data:", responseData);

             let generatedText = "";

             // Extract text based on expected structure for each API type
             if (apiUrl.includes('generativelanguage.googleapis.com')) { // Gemini
                 generatedText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
             } else { // OpenAI compatible (LM Studio, Ollama, Custom)
                 generatedText = responseData.choices?.[0]?.message?.content;
             }

             if (generatedText === undefined || generatedText === null) {
                 console.warn("LLM response received, but no text found:", responseData);
                 throw new Error("LLM response format unexpected or empty text content.");
             }

             return (generatedText || "").trim(); // Return the trimmed text

         } catch (error) {
             console.error("LLM Call Error:", error);
             showMessage(targetMessageBox || mainMessageBox, 'error', `LLM Error: ${error.message}`);
             return null; // Explicitly return null on error
         }
    }


    // --- Handle Send Prompt to Image Services (Main Logic) ---
    async function handleSendPromptToImageServices(runIdentifier, promptForRun /* seed param removed */) {
        const isBatchRun = typeof runIdentifier === 'string' && runIdentifier.includes('/'); // Basic check
        hideMessage(resultsMessageBox); // Clear previous results messages

        const endpointsToRun = getSelectedImageEndpoints();
        if (endpointsToRun.length === 0) {
            const msgBox = isBatchRun ? configMessageBox : resultsMessageBox;
            showMessage(msgBox, 'error', 'No image generation services selected.');
            if (!isBatchRun) { // Scroll to config only on single runs
                configActionArea.querySelector('.image-gen-config')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            throw new Error("No image generation endpoints selected."); // Stop execution
        }

        // Determine the prompt to use if not explicitly provided
        if (!promptForRun) {
            const promptTypeRadio = document.querySelector('input[name="promptToSend"]:checked');
            const promptType = promptTypeRadio ? promptTypeRadio.value : 'keywords'; // Default to keywords if somehow null
            promptForRun = (promptType === 'api')
                ? apiGeneratedPromptTextarea.value.trim()
                : generatedKeywordsTextarea.value.trim();

            if (!promptForRun || promptForRun.startsWith("No keywords") || promptForRun.startsWith("LLM error") || promptForRun === "LLM generation failed.") {
                const errorMsg = `Selected prompt source ('${promptType === 'api' ? 'API Generated' : 'Keywords'}') is empty or invalid.`;
                const msgBox = isBatchRun ? configMessageBox : resultsMessageBox;
                showMessage(msgBox, 'error', errorMsg);
                if (!isBatchRun) {
                    // Scroll to the relevant prompt area
                     if (promptType === 'api') apiGeneratedPromptContainer.scrollIntoView({behavior: 'smooth', block: 'center'});
                     else keywordsSummaryContainer.scrollIntoView({behavior: 'smooth', block: 'center'});
                }
                throw new Error(errorMsg); // Stop execution
            }
        }

        // Clear results grid only for the first run of a batch or a single run
        if (!isBatchRun || (isBatchRun && runIdentifier.startsWith('1/'))) {
            imageResultsGrid.innerHTML = '';
        }

        const runLabel = isBatchRun ? `Batch ${runIdentifier}` : `Run ${runIdentifier}`;
        showMessage(resultsMessageBox, 'loading', `${runLabel}: Sending to ${endpointsToRun.length} service(s)...`, true); // Persistent loading message

        // Create placeholders for this run
        endpointsToRun.forEach(endpoint => {
            createImageResultPlaceholder(endpoint.id, endpoint.name, runIdentifier);
        });

        // --- Call APIs ---
        const promises = endpointsToRun.map(endpoint =>
            callImageGenerationAPI(promptForRun, endpoint, runIdentifier /* seed removed */)
                .then(result => ({ ...result, status: 'fulfilled' })) // Add status for easier handling later
                .catch(error => ({ endpointId: endpoint.id, endpointName: endpoint.name, status: 'rejected', reason: error })) // Add IDs here too
        );

        const results = await Promise.allSettled(promises.map(p => p.catch(e => e))); // Ensure all promises resolve/reject

        // --- Process Results ---
        let allRequestsFinishedOrPolling = true;
        let hasErrors = false;
        let pollingPromptIds = [];

        results.forEach(resultInfo => {
             const resultValue = resultInfo.value; // The resolved value or the caught error object

             if (resultInfo.status === 'fulfilled' && resultValue.status !== 'rejected') {
                 // Handle fulfilled promises (API call initiated or completed without throwing)
                 if (resultValue.status === 'polling') {
                     pollingPromptIds.push(resultValue.promptId); // Track IDs that need polling
                     // Placeholder already updated by callImageGenerationAPI/pollComfyHistory
                 } else {
                     // Update placeholder for completed (non-polling) endpoints
                      updateImageResultItem(resultValue.endpointId, resultValue.endpointName, resultValue, runIdentifier);
                 }
                  if (resultValue.error) { hasErrors = true; }

             } else {
                 // Handle rejected promises (errors during API call setup or network fetch)
                 allRequestsFinishedOrPolling = false; // Mark that something failed immediately
                 hasErrors = true;
                 const endpointId = resultValue?.endpointId || `error-${Date.now()}`;
                 const endpointName = resultValue?.endpointName || 'Unknown Endpoint';
                 const reason = resultValue?.reason?.message || resultValue?.reason || 'Unknown error during request';
                 console.error(`Immediate failure for ${endpointName}:`, reason);
                 updateImageResultItem(endpointId, endpointName, { error: reason }, runIdentifier);
             }
        });

         // --- Update Overall Status Message ---
         const pollingActive = pollingPromptIds.length > 0;
         let completionMessage = `${runLabel} processing...`;
         let messageType = 'loading';

         if (!pollingActive && !isBatchRun) { // Only show final status for single runs or last batch run
             if (hasErrors) {
                 completionMessage = `${runLabel} finished with errors.`;
                 messageType = 'error';
             } else {
                 completionMessage = `${runLabel} complete.`;
                 messageType = 'success';
             }
             showMessage(resultsMessageBox, messageType, completionMessage, false); // Non-persistent final message
         } else if (pollingActive) {
             completionMessage = `${runLabel}: Waiting for ${pollingPromptIds.length} ComfyUI job(s)...`;
             if (hasErrors) completionMessage += " (Some other endpoints failed)";
             messageType = 'loading';
             showMessage(resultsMessageBox, messageType, completionMessage, true); // Persistent while polling
         }
         // Batch completion message handled in the loop


        // --- Optional Second Round (only if NOT batching) ---
        if (!isBatchRun && enableSuccessivePromptCheckbox.checked) {
            console.log("Run 1 complete. Attempting R2.");
            showMessage(resultsMessageBox, 'loading', "Run 1 Done. Generating prompt for Round 2...", true);
            const promptSourceForRound2 = generatedKeywordsTextarea.value.trim();
            if (promptSourceForRound2 && !promptSourceForRound2.startsWith("No keywords selected")) {
                try {
                    const promptForLLMRound2 = promptSourceForRound2 + "\n\n---\nGenerate a distinct but related variation based on the keywords above.";
                    const secondApiPrompt = await callLLMForPrompt(promptForLLMRound2, configMessageBox); // Use config box for LLM messages
                    if (secondApiPrompt !== null) {
                        console.log("Generated prompt for R2:", secondApiPrompt);
                        await handleSendPromptToImageServices(`${runIdentifier}-R2`, secondApiPrompt); // Send R2 prompt
                    } else {
                        throw new Error("LLM failed to generate prompt for Round 2.");
                    }
                } catch (error) {
                    console.error("Failed Round 2:", error);
                    showMessage(resultsMessageBox, 'error', `Failed Round 2: ${error.message || 'Unknown error'}`); // Show R2 error in results box
                }
            } else {
                console.warn("Could not trigger R2: Original keywords missing/invalid.");
                showMessage(resultsMessageBox, 'error', "Could not start Round 2: Keywords summary missing or invalid.");
            }
        }

        // --- Wait for Polling (if any) ---
        if (pollingActive) {
            await waitForPollingToComplete(pollingPromptIds);
            // After polling completes, update the status message if it's not a batch run
            if (!isBatchRun) {
                 // Check results again after polling finishes (some might have errored during poll)
                 let pollingErrors = false;
                 pollingPromptIds.forEach(pid => {
                     // This requires a way to check the final status associated with pid,
                     // maybe check the corresponding result div's status message?
                     const resultDiv = document.querySelector(`.image-result-item[data-prompt-id="${pid}"]`);
                     const statusMsg = resultDiv?.querySelector('.status-message.error');
                     if (statusMsg) pollingErrors = true;
                 });

                 let finalPollingMsg = `${runLabel} ComfyUI job(s) finished.`;
                 let finalPollingType = 'success';
                 if (pollingErrors || hasErrors) { // Include initial errors too
                     finalPollingMsg = `${runLabel} finished, but some errors occurred.`;
                     finalPollingType = 'error';
                 }
                 showMessage(resultsMessageBox, finalPollingType, finalPollingMsg, false); // Final, non-persistent
            }
        }

        console.log(`${runLabel} processing finished.`);
        return !hasErrors; // Return true if no errors occurred during this specific run initiation
    }



    // --- Continuous Generation Loop ---
    async function startContinuousGenerationLoop() {
        console.log(`--- Continuous Loop Check: Remaining=${continuousRunsRemaining}, StopFlag=${stopBatchFlag} ---`);

         if (stopBatchFlag || continuousRunsRemaining <= 0) {
             console.log("Batch finished or stopped.");
             showMessage(configMessageBox, 'success', `Batch ${stopBatchFlag ? 'stopped by user' : 'complete'}.`);
             isContinuousModeActive = false;
             stopBatchFlag = false; // Reset flag
             sendPromptButton.disabled = false;
             sendPromptButton.innerHTML = '<i class="fas fa-play-circle"></i> Start Batch'; // Reset to batch start text
             stopBatchButton.style.display = 'none';
             stopBatchButton.disabled = false; // Re-enable for next time
             stopBatchButton.innerHTML = '<i class="fas fa-stop-circle"></i> Stop Batch';
             toggleContinuousOptions(); // Reflects the stopped state
             return;
         }

        const totalRuns = parseInt(continuousGenCountInput.value, 10) || 1;
        const currentRun = totalRuns - continuousRunsRemaining + 1;
        const runIdentifier = `${currentRun}/${totalRuns}`;
        currentContinuousMode = document.querySelector('input[name="continuousGenMode"]:checked')?.value || 'keep_keywords_new_api';

        console.log(`Starting batch run ${runIdentifier}. Mode: ${currentContinuousMode}`);
        showMessage(configMessageBox, 'loading', `Running Batch ${runIdentifier} (Mode: ${currentContinuousMode})...`, true); // Persistent

        let promptForThisRun = '';
        let success = false;

        try {
            switch (currentContinuousMode) {
                case 'new_lucky_api':
                    handleFeelLucky(); // Selects random keywords
                    const luckyKeywords = generatedKeywordsTextarea.value;
                    if (!luckyKeywords || luckyKeywords.startsWith("No keywords")) {
                        throw new Error("'Feeling Lucky' failed to select keywords.");
                    }
                    // Generate API prompt based on the lucky keywords
                    const apiSuccessLucky = await handleGenerateApiPrompt();
                    if (!apiSuccessLucky) {
                         throw new Error("LLM failed to generate prompt from lucky keywords.");
                    }
                    promptForThisRun = apiGeneratedPromptTextarea.value;
                    break;

                case 'keep_keywords_new_api':
                    // Ensure keywords exist first
                    const currentKeywords = generatedKeywordsTextarea.value.trim();
                     if (!currentKeywords || currentKeywords.startsWith("No keywords selected")) {
                         // Maybe try generating them first? Or error out? Let's try generating.
                         handleGenerateKeywords();
                         const keywordsAfterGen = generatedKeywordsTextarea.value.trim();
                         if (!keywordsAfterGen || keywordsAfterGen.startsWith("No keywords selected")) {
                            throw new Error("Keyword Summary empty or failed to generate. Cannot proceed with batch.");
                         }
                         console.log("Generated keywords as they were missing for 'keep_keywords' mode.");
                     }
                    // Generate a NEW API prompt based on EXISTING keywords
                    const apiSuccessKeep = await handleGenerateApiPrompt();
                    if (!apiSuccessKeep) {
                        throw new Error("LLM failed to generate new prompt from existing keywords.");
                    }
                    promptForThisRun = apiGeneratedPromptTextarea.value;
                    break;

                default:
                    throw new Error(`Unknown continuous mode: ${currentContinuousMode}`);
            }

            if (!promptForThisRun || promptForThisRun.startsWith("No keywords") || promptForThisRun.startsWith("LLM error")) {
                throw new Error(`Invalid prompt generated for batch run ${runIdentifier}.`);
            }

            // Send the determined prompt for this run
            success = await handleSendPromptToImageServices(runIdentifier, promptForThisRun); // Pass null for seed

            if (!success) {
                 console.warn(`Batch run ${runIdentifier} initiated but encountered errors.`);
                 // Optionally decide whether to stop the whole batch on error
                 // if (stopBatchOnError) { stopBatchFlag = true; }
            }

            // --- Recurse for next run ---
            if (!stopBatchFlag) {
                continuousRunsRemaining--;
                 console.log(`Run ${runIdentifier} finished. Delaying before next run...`);
                 // Add a small delay to prevent hammering APIs and allow UI updates
                setTimeout(startContinuousGenerationLoop, 1500); // 1.5 second delay
            } else {
                // If stop flag was set during this run, call loop again to trigger exit condition
                startContinuousGenerationLoop();
            }
            // --------------------------

        } catch (error) {
            // Catch errors during the setup for *this specific run* (e.g., LLM fails)
            console.error(`Error during batch run ${runIdentifier} setup:`, error);
            showMessage(configMessageBox, 'error', `Batch Error (${runIdentifier}): ${error.message}. Stopping batch.`);
            updateImageResultItem(`batch-error-${runIdentifier}`, `Batch ${runIdentifier}`, {error: `Setup failed: ${error.message}`}, runIdentifier)
            // Stop the whole batch on setup error
            isContinuousModeActive = false;
            stopBatchFlag = true; // Ensure loop exits
            sendPromptButton.disabled = false; // Re-enable start button
            sendPromptButton.innerHTML = '<i class="fas fa-play-circle"></i> Start Batch';
            stopBatchButton.style.display = 'none'; // Hide stop button
            toggleContinuousOptions();
        }
    }


    // --- Wait for Polling Helper ---
    async function waitForPollingToComplete(promptIdsToWaitFor) {
        if (!promptIdsToWaitFor || promptIdsToWaitFor.length === 0) {
            return Promise.resolve(); // Nothing to wait for
        }
        console.log("Waiting for ComfyUI polling to complete for IDs:", promptIdsToWaitFor);

        const pollingPromises = promptIdsToWaitFor.map(promptId => {
            return new Promise((resolve) => {
                // Check immediately if polling already finished (might happen quickly)
                if (!comfyPollingStates[promptId]) {
                    console.log(`Polling already finished for ${promptId} (checked before interval).`);
                    resolve();
                    return;
                }
                // Set up interval to check the state
                const checkInterval = setInterval(() => {
                    if (!comfyPollingStates[promptId]) { // Check if the interval ID was deleted
                        clearInterval(checkInterval);
                        console.log(`Polling finished for ${promptId}.`);
                        resolve();
                    }
                     // Add a safeguard timeout? Maybe not necessary if pollComfyHistory handles it.
                }, 500); // Check every 500ms
            });
        });

        return Promise.all(pollingPromises);
    }


    // --- Get Selected Image Endpoints ---
     function getSelectedImageEndpoints() {
         const endpoints = [];

         // Check ComfyUI checkbox
         const comfyCheckbox = imageEndpointsContainer.querySelector('#img-comfyui:checked');
         if (comfyCheckbox) {
             endpoints.push({
                 id: comfyCheckbox.id,
                 value: comfyCheckbox.value, // 'local_comfyui'
                 name: comfyCheckbox.parentElement.querySelector('label[for="img-comfyui"]').textContent.split('<small>')[0].trim(),
                 url: comfyCheckbox.dataset.endpoint || 'http://127.0.0.1:8188', // Default ComfyUI URL
                 requiresKey: false // Typically no key for local Comfy
             });
         }

         // Check Custom endpoint checkboxes and get their input values
         const customCheckboxes = customEndpointsList.querySelectorAll('input[type="checkbox"]:checked');
         customCheckboxes.forEach(checkbox => {
             const inputId = checkbox.dataset.inputId;
             const inputElement = document.getElementById(inputId);
             const url = inputElement ? inputElement.value.trim() : null;

             if (url) {
                // Basic URL validation (starts with http/https)
                 if (!url.match(/^https?:\/\//)) {
                     console.warn(`Invalid URL format for custom endpoint: ${url}. Skipping.`);
                     showMessage(resultsMessageBox, 'warning', `Skipping invalid custom URL: ${url}`);
                     return; // Skip this endpoint
                 }

                 let name = 'Custom Endpoint';
                 try {
                     const urlObj = new URL(url);
                     name = `Custom: ${urlObj.hostname}`; // Use hostname for name
                 } catch (e) {
                     console.warn(`Could not parse custom URL for name: ${url}`);
                     name = `Custom: ${url.substring(0, 20)}...`; // Fallback name
                 }

                 endpoints.push({
                     id: inputId, // Use the text input's ID for uniqueness
                     value: 'custom_image',
                     name: name,
                     url: url,
                     requiresKey: false // Assume no key unless API requires it later
                 });
             } else {
                  console.warn(`Custom endpoint checkbox ${checkbox.id} checked, but corresponding input ${inputId} is empty or not found. Skipping.`);
             }
         });

         console.log("Selected Image Endpoints:", endpoints);
         return endpoints;
     }


    // --- Create/Update Image Result Items ---
    function createImageResultPlaceholder(endpointId, endpointName, runIdentifier) {
        const resultItemId = `result-${endpointId}-r${runIdentifier.toString().replace('/','-')}`;

        // Avoid creating duplicates if placeholder already exists
        if (document.getElementById(resultItemId)) {
            console.log(`Placeholder already exists for ${resultItemId}`);
            // Optionally update the status message if needed here
            const itemDiv = document.getElementById(resultItemId);
            const statusMsg = itemDiv.querySelector('.status-message');
             if (statusMsg && statusMsg.classList.contains('loading')) {
                 statusMsg.textContent = 'Sending request...'; // Reset status text
             }
            return;
        }

        console.log(`Creating placeholder for ${resultItemId}`);
        const itemDiv = document.createElement('div');
        itemDiv.id = resultItemId;
        itemDiv.className = 'image-result-item';
        itemDiv.dataset.endpointId = endpointId; // Store endpoint ID for later reference

        const title = document.createElement('h4');
        title.textContent = endpointName;
        itemDiv.appendChild(title);

        const roundLabel = document.createElement('p');
        roundLabel.className = 'round-label';
        roundLabel.textContent = `Run ${runIdentifier}`;
        itemDiv.appendChild(roundLabel);

        const img = document.createElement('img');
        img.alt = `${endpointName} Result (Run ${runIdentifier})`;
        img.src = `https://placehold.co/200x200/333/666?text=Waiting+R${runIdentifier}...`; // Initial placeholder
        itemDiv.appendChild(img);

        const statusMsg = document.createElement('p');
        statusMsg.className = 'status-message loading'; // Start as loading
        statusMsg.textContent = 'Preparing request...';
        itemDiv.appendChild(statusMsg);

        const placeholderText = imageResultsGrid.querySelector('.placeholder-text');
        if (placeholderText) {
            imageResultsGrid.innerHTML = ''; // Clear the initial "Configure endpoints..." text
        }

        // Prepend new results to the top
        if (imageResultsGrid.firstChild) {
            imageResultsGrid.insertBefore(itemDiv, imageResultsGrid.firstChild);
        } else {
            imageResultsGrid.appendChild(itemDiv);
        }
    }

    function updateImageResultItem(endpointId, endpointName, result, runIdentifier, statusClass = '', statusText = '') {
        const resultItemId = `result-${endpointId}-r${runIdentifier.toString().replace('/','-')}`;
        let itemDiv = document.getElementById(resultItemId);

        if (!itemDiv) {
            console.warn(`Result item div ${resultItemId} not found. Creating placeholder first.`);
            createImageResultPlaceholder(endpointId, endpointName, runIdentifier);
            itemDiv = document.getElementById(resultItemId);
            if(!itemDiv) {
                console.error(`FATAL: Could not create or find result item div for ${resultItemId}`);
                return; // Critical failure
            }
        }

         // Add promptId as a data attribute if available (useful for debugging/linking)
         if (result?.promptId) {
            itemDiv.dataset.promptId = result.promptId;
        }

        const img = itemDiv.querySelector('img');
        const statusMsg = itemDiv.querySelector('.status-message');
        const runLabel = itemDiv.querySelector('.round-label');

        if (runLabel) runLabel.textContent = `Run ${runIdentifier}`;

        // Determine the final status and text based on the result object or passed parameters
        let finalStatusClass = statusClass;
        let finalStatusText = statusText || result?.message || '';

        if (result?.error) {
            finalStatusClass = 'error';
            finalStatusText = `Error: ${result.error}`;
             if(img) img.src = `https://placehold.co/200x200/dc3545/ffffff?text=Error+R${runIdentifier}`;
        } else if (result?.imageUrl) {
            finalStatusClass = 'success';
            finalStatusText = result.message || `Image received (R${runIdentifier}).`;
            if(img) {
                img.src = result.imageUrl;
                img.onerror = () => { // Add error handling for image loading
                    console.warn(`Failed to load image URL: ${result.imageUrl}`);
                    img.src = `https://placehold.co/200x200/ffc107/000000?text=Load+Failed+R${runIdentifier}`;
                    statusMsg.textContent = 'Image URL load failed.';
                    statusMsg.className = 'status-message error';
                };
            }
        } else if (result?.imageData) { // Typically data:image/...
            finalStatusClass = 'success';
             finalStatusText = result.message || `Image data received (R${runIdentifier}).`;
             if(img) img.src = result.imageData;
        } else if (result?.status === 'polling') {
             finalStatusClass = 'polling';
             finalStatusText = result.message || `Polling ComfyUI...`;
              if (img && !img.src.includes('placehold.co/200x200/333')) {
                 // Don't reset image if polling starts after an initial success/error update (less common)
             } else if(img){
                  img.src = `https://placehold.co/200x200/333/666?text=Polling+R${runIdentifier}...`;
             }
        } else if (result?.status === 'pending' || statusClass === 'loading') {
             finalStatusClass = 'loading';
             finalStatusText = statusText || result?.message || `Processing (R${runIdentifier})...`;
              if(img && !img.src.includes('placehold.co/200x200/333')) {
                 // Don't overwrite potentially loaded image with placeholder if just updating status
             } else if (img) {
                  img.src = `https://placehold.co/200x200/333/666?text=Loading+R${runIdentifier}...`;
             }
        } else { // Generic success or status update
             finalStatusClass = finalStatusClass || 'success'; // Default to success if no error/specific status
             finalStatusText = finalStatusText || result?.message || `Request processed (R${runIdentifier}).`;
             // Update placeholder image only if it's still the default waiting/loading image
             if (img && (img.src.includes('placehold.co/200x200/333') || img.src.includes('Waiting'))) {
                 img.src = `https://placehold.co/200x200/198754/ffffff?text=Status+OK+R${runIdentifier}`;
             }
        }

        // Update status message content and class
        if (statusMsg) {
            statusMsg.textContent = finalStatusText;
            // Reset classes and apply the determined one
            statusMsg.className = `status-message ${finalStatusClass}`;
        }
    }

   async function callImageGenerationAPI(promptToSend, endpointConfig, runIdentifier /* seed removed */) {
    console.log(`Run ${runIdentifier}: Sending to ${endpointConfig.name} (${endpointConfig.id})`);
    let requestBody;
    let requestHeaders = { 'Content-Type': 'application/json' };
    let apiUrl = endpointConfig.url;
    const method = 'POST';

    let result = {
        endpointId: endpointConfig.id,
        endpointName: endpointConfig.name,
        message: `Sending request...`,
        imageUrl: null,
        imageData: null,
        error: null,
        status: 'pending',
        promptId: null
    };

    updateImageResultItem(endpointConfig.id, endpointConfig.name, result, runIdentifier, 'loading', 'Sending request...');

    try {
        switch (endpointConfig.value) {
            case 'local_comfyui': {
                const serverAddress = endpointConfig.url || 'http://127.0.0.1:8188';
                apiUrl = `${serverAddress}/prompt`;
                const clientId = generateUUID();
                let workflowJsonString;
                let workflowToUse;

                const currentSelectedWorkflowKey = comfyWorkflowSelect.value; // Get selected workflow key
                console.log(`[ComfyUI Run ${runIdentifier}] Selected Workflow Key: ${currentSelectedWorkflowKey}`);

                if (!currentSelectedWorkflowKey) {
                    throw new Error("Please select a ComfyUI workflow from the dropdown.");
                }

                if (typeof comfyWorkflows !== 'undefined' && comfyWorkflows[currentSelectedWorkflowKey]) {
                    workflowJsonString = comfyWorkflows[currentSelectedWorkflowKey];
                    console.log(`[ComfyUI Run ${runIdentifier}] Raw Workflow String (first 200 chars):`, workflowJsonString.substring(0, 200) + "...");
                } else {
                    throw new Error(`Selected ComfyUI workflow '${currentSelectedWorkflowKey}' not found in data.js.`);
                }

                try {
                    const parsedWorkflow = JSON.parse(workflowJsonString);
                    workflowToUse = JSON.parse(JSON.stringify(parsedWorkflow)); // Deep copy
                    console.log(`[ComfyUI Run ${runIdentifier}] Successfully parsed and deep copied workflow.`);
                } catch (e) {
                    console.error(`[ComfyUI Run ${runIdentifier}] Error parsing/copying workflow JSON:`, e);
                    throw new Error("Failed to parse or copy the selected ComfyUI workflow JSON.");
                }

                // Get specific configuration for the selected workflow
                // Ensure comfyWorkflowSpecifics is defined globally or in an accessible scope
                const specificConfig = comfyWorkflowSpecifics[currentSelectedWorkflowKey];

                // Inside callImageGenerationAPI, case 'local_comfyui':
                // ... (after workflowToUse is parsed and specificConfig is defined) ...

                // Get values from new UI elements
                const width = parseInt(comfyImageWidth.value, 10);
                const height = parseInt(comfyImageHeight.value, 10);
                const steps = parseInt(comfySteps.value, 10);
                const negativePromptText = comfyNegativePrompt.value; // Get negative prompt text

                let modelToInject;
                if (specificConfig.type === "gguf_unet") {
                    modelToInject = ggufModelSelect.value;
                } else if (specificConfig.type === "checkpoint") {
                    modelToInject = checkpointModelSelect.value;
                }
                // MFlux model is not dynamically selected via these dropdowns in this plan

                // Inject Model Name (if applicable for the workflow type)
                if (modelToInject && specificConfig.modelNodeId && specificConfig.modelInputName) {
                    if (workflowToUse[specificConfig.modelNodeId] && workflowToUse[specificConfig.modelNodeId].inputs) {
                        workflowToUse[specificConfig.modelNodeId].inputs[specificConfig.modelInputName] = modelToInject;
                        console.log(`[ComfyUI Run <span class="math-inline">\{runIdentifier\}\] Injected model "</span>{modelToInject}" into node "<span class="math-inline">\{specificConfig\.modelNodeId\}", input "</span>{specificConfig.modelInputName}"`);
                    } else { console.warn(`[ComfyUI Run <span class="math-inline">\{runIdentifier\}\] Model node "</span>{specificConfig.modelNodeId}" or its inputs not found for model injection.`); }
                }

                // Inject Size
                if (specificConfig.sizeNodeId && specificConfig.widthInputName && specificConfig.heightInputName) {
                    if (workflowToUse[specificConfig.sizeNodeId] && workflowToUse[specificConfig.sizeNodeId].inputs) {
                        workflowToUse[specificConfig.sizeNodeId].inputs[specificConfig.widthInputName] = width;
                        workflowToUse[specificConfig.sizeNodeId].inputs[specificConfig.heightInputName] = height;
                        console.log(`[ComfyUI Run ${runIdentifier}] Injected size <span class="math-inline">\{width\}x</span>{height} into node "${specificConfig.sizeNodeId}"`);
                    } else { console.warn(`[ComfyUI Run <span class="math-inline">\{runIdentifier\}\] Size node "</span>{specificConfig.sizeNodeId}" or its inputs not found for size injection.`); }
                }

                // Inject Steps
                if (specificConfig.stepsNodeId && specificConfig.stepsInputName) {
                    if (workflowToUse[specificConfig.stepsNodeId] && workflowToUse[specificConfig.stepsNodeId].inputs) {
                        workflowToUse[specificConfig.stepsNodeId].inputs[specificConfig.stepsInputName] = steps;
                        console.log(`[ComfyUI Run <span class="math-inline">\{runIdentifier\}\] Injected steps "</span>{steps}" into node "<span class="math-inline">\{specificConfig\.stepsNodeId\}", input "</span>{specificConfig.stepsInputName}"`);
                    } else { console.warn(`[ComfyUI Run <span class="math-inline">\{runIdentifier\}\] Steps node "</span>{specificConfig.stepsNodeId}" or its inputs not found for steps injection.`); }
                }

                // Inject Negative Prompt (if applicable)
                if (negativePromptText && specificConfig.negativePromptNodeId && specificConfig.negativePromptInputName) {
                    if (workflowToUse[specificConfig.negativePromptNodeId] && workflowToUse[specificConfig.negativePromptNodeId].inputs) {
                        workflowToUse[specificConfig.negativePromptNodeId].inputs[specificConfig.negativePromptInputName] = negativePromptText;
                        console.log(`[ComfyUI Run <span class="math-inline">\{runIdentifier\}\] Injected negative prompt into node "</span>{specificConfig.negativePromptNodeId}", input "${specificConfig.negativePromptInputName}"`);
                    } else {
                        console.warn(`[ComfyUI Run <span class="math-inline">\{runIdentifier\}\] Negative prompt node "</span>{specificConfig.negativePromptNodeId}" or its inputs not found.`);
                    }
                }


                // --- Your existing Prompt Injection logic (using specificConfig) ---
                // (Starts with: let promptNodeFound = false;)
                // ... make sure it uses specificConfig.promptNodeId and specificConfig.promptInputName ...

                // --- Your existing Seed Injection logic (using specificConfig) ---
                // (Starts with: let seedNodeFound = false;)
                // ... make sure it uses specificConfig.seedNodeId and specificConfig.seedInputName ...

                // ... rest of the ComfyUI sending logic ...

                // --- Inject Positive Prompt (dynamic based on workflow) ---
                // This section starts with your original comment for easy identification
                // Inject Positive Prompt (assuming node ID '6' based on provided data.js)
                let promptNodeFound = false;
                let attemptedPromptNodeDescription = "default configuration";

                if (specificConfig && specificConfig.promptNodeId && specificConfig.promptInputName) {
                    const targetNodeId = specificConfig.promptNodeId;
                    const targetInputName = specificConfig.promptInputName;
                    attemptedPromptNodeDescription = `node "${targetNodeId}" (input: "${targetInputName}") for workflow "${currentSelectedWorkflowKey}"`;

                    if (workflowToUse[targetNodeId] &&
                        workflowToUse[targetNodeId].inputs &&
                        workflowToUse[targetNodeId].inputs[targetInputName] !== undefined) {
                        workflowToUse[targetNodeId].inputs[targetInputName] = promptToSend;
                        promptNodeFound = true;
                        console.log(`[ComfyUI Run ${runIdentifier}] Injected prompt via specificConfig into ${attemptedPromptNodeDescription}: "${promptToSend.substring(0, 50)}..."`);
                    } else {
                        console.warn(`[ComfyUI Run ${runIdentifier}] Specific config target ${attemptedPromptNodeDescription} was not found or input was invalid in the workflow structure.`);
                    }
                } else if (currentSelectedWorkflowKey && !specificConfig) {
                    console.warn(`[ComfyUI Run ${runIdentifier}] No specific prompt configuration found in 'comfyWorkflowSpecifics' for workflow "${currentSelectedWorkflowKey}". Proceeding to fallbacks.`);
                    attemptedPromptNodeDescription = `node "6" (the default fallback target)`;
                } else {
                    console.warn(`[ComfyUI Run ${runIdentifier}] No workflow key selected or specificConfig was incomplete for prompt. Proceeding to fallbacks.`);
                    attemptedPromptNodeDescription = `node "6" (the default fallback target)`;
                }

                if (!promptNodeFound) {
                    const primaryFallbackNodeId = "6";
                    const primaryFallbackInputName = "text";
                    attemptedPromptNodeDescription = `node "${primaryFallbackNodeId}" (input: "${primaryFallbackInputName}") as primary fallback`;
                    console.log(`[ComfyUI Run ${runIdentifier}] Prompt not set via specific config. Attempting primary fallback: ${attemptedPromptNodeDescription}.`);

                    if (workflowToUse[primaryFallbackNodeId] &&
                        workflowToUse[primaryFallbackNodeId].inputs &&
                        workflowToUse[primaryFallbackNodeId].inputs[primaryFallbackInputName] !== undefined) {
                        workflowToUse[primaryFallbackNodeId].inputs[primaryFallbackInputName] = promptToSend;
                        promptNodeFound = true;
                        console.log(`[ComfyUI Run ${runIdentifier}] Injected prompt via PRIMARY FALLBACK into ${attemptedPromptNodeDescription}: "${promptToSend.substring(0, 50)}..."`);
                    } else {
                        console.warn(`[ComfyUI Run ${runIdentifier}] Primary fallback (node "${primaryFallbackNodeId}", input "${primaryFallbackInputName}") not found or input field missing.`);
                        // Secondary Fallback
                        if (!promptNodeFound) {
                             attemptedPromptNodeDescription = "any CLIPTextEncode node with 'text' input as secondary fallback";
                            console.log(`[ComfyUI Run ${runIdentifier}] Prompt not set via primary fallback. Attempting secondary fallback: ${attemptedPromptNodeDescription}.`);
                            for (const nodeId in workflowToUse) {
                                if (workflowToUse[nodeId]?.class_type === "CLIPTextEncode" &&
                                    workflowToUse[nodeId]?.inputs?.text !== undefined) {
                                    workflowToUse[nodeId].inputs.text = promptToSend;
                                    promptNodeFound = true;
                                    attemptedPromptNodeDescription = `CLIPTextEncode node "${nodeId}" (input: "text") found via secondary fallback`;
                                    console.log(`[ComfyUI Run ${runIdentifier}] Injected prompt via SECONDARY FALLBACK into ${attemptedPromptNodeDescription}: "${promptToSend.substring(0, 50)}..."`);
                                    break;
                                }
                            }
                        }
                    }
                }

                if (!promptNodeFound) {
                    console.error(`[ComfyUI Run ${runIdentifier}] FATAL: Could not find any suitable node to inject the positive prompt for workflow "${currentSelectedWorkflowKey}" after all attempts.`);
                    throw new Error(`Could not find/configure a positive prompt input node for workflow "${currentSelectedWorkflowKey}" (last attempt involved ${attemptedPromptNodeDescription}). Check workflow structure, 'comfyWorkflowSpecifics', or ensure a standard fallback node exists.`);
                }
                // --- END OF Positive Prompt Injection ---

                // --- Inject Seed (dynamic based on workflow) ---
                let seedNodeFound = false; // Renamed from ksamplerNodeFound for clarity
                const seedToUse = generateRandomSeed();
                let attemptedSeedNodeDescription = "default configuration";

                if (specificConfig && specificConfig.seedNodeId && specificConfig.seedInputName) {
                    const targetNodeId = specificConfig.seedNodeId;
                    const targetInputName = specificConfig.seedInputName;
                    attemptedSeedNodeDescription = `node "${targetNodeId}" (input: "${targetInputName}") for workflow "${currentSelectedWorkflowKey}"`;

                    if (workflowToUse[targetNodeId] &&
                        workflowToUse[targetNodeId].inputs &&
                        workflowToUse[targetNodeId].inputs[targetInputName] !== undefined) {
                        console.log(`[ComfyUI Run ${runIdentifier}] Seed node ${targetNodeId} (input: ${targetInputName}) current seed:`, workflowToUse[targetNodeId].inputs[targetInputName]);
                        workflowToUse[targetNodeId].inputs[targetInputName] = seedToUse;
                        seedNodeFound = true;
                        console.log(`[ComfyUI Run ${runIdentifier}] Set RANDOM seed ${seedToUse} via specificConfig for ${attemptedSeedNodeDescription}`);
                    } else {
                        console.warn(`[ComfyUI Run ${runIdentifier}] Specific config target ${attemptedSeedNodeDescription} for seed was not found or input was invalid in the workflow structure.`);
                    }
                } else if (currentSelectedWorkflowKey && !specificConfig) {
                    console.warn(`[ComfyUI Run ${runIdentifier}] No specific seed configuration found in 'comfyWorkflowSpecifics' for workflow "${currentSelectedWorkflowKey}". Proceeding to seed fallbacks.`);
                    attemptedSeedNodeDescription = `node "31" (the default KSampler fallback target)`;
                } else {
                     console.warn(`[ComfyUI Run ${runIdentifier}] No workflow key selected or specificConfig was incomplete for seed. Proceeding to seed fallbacks.`);
                     attemptedSeedNodeDescription = `node "31" (the default KSampler fallback target)`;
                }

                if (!seedNodeFound) {
                    const primaryFallbackNodeId = "31"; // Default KSampler node ID
                    const primaryFallbackInputName = "seed";
                    attemptedSeedNodeDescription = `node "${primaryFallbackNodeId}" (input: "${primaryFallbackInputName}") as primary seed fallback`;
                    console.log(`[ComfyUI Run ${runIdentifier}] Seed not set via specific config. Attempting primary fallback: ${attemptedSeedNodeDescription}.`);

                    if (workflowToUse[primaryFallbackNodeId] &&
                        workflowToUse[primaryFallbackNodeId].inputs &&
                        workflowToUse[primaryFallbackNodeId].inputs[primaryFallbackInputName] !== undefined) {
                        console.log(`[ComfyUI Run ${runIdentifier}] Primary fallback seed node ${primaryFallbackNodeId} (input: ${primaryFallbackInputName}) current seed:`, workflowToUse[primaryFallbackNodeId].inputs[primaryFallbackInputName]);
                        workflowToUse[primaryFallbackNodeId].inputs[primaryFallbackInputName] = seedToUse;
                        seedNodeFound = true;
                        console.log(`[ComfyUI Run ${runIdentifier}] Set RANDOM seed ${seedToUse} via PRIMARY FALLBACK for ${attemptedSeedNodeDescription}`);
                    } else {
                        console.warn(`[ComfyUI Run ${runIdentifier}] Primary seed fallback (node "${primaryFallbackNodeId}") failed. Searching for secondary seed fallback.`);
                         if (!seedNodeFound) {
                            attemptedSeedNodeDescription = "any KSampler/Advanced/Custom node with 'seed' input as secondary fallback";
                            console.log(`[ComfyUI Run ${runIdentifier}] Seed not set via primary fallback. Attempting secondary fallback: ${attemptedSeedNodeDescription}.`);
                            const samplerTypes = ["KSampler", "KSamplerAdvanced", "SamplerCustom"];
                            for (const nodeId_seed_fallback in workflowToUse) {
                                if (samplerTypes.includes(workflowToUse[nodeId_seed_fallback]?.class_type) &&
                                    workflowToUse[nodeId_seed_fallback]?.inputs?.seed !== undefined) {
                                    console.log(`[ComfyUI Run ${runIdentifier}] Secondary fallback seed node ${nodeId_seed_fallback} current seed:`, workflowToUse[nodeId_seed_fallback].inputs.seed);
                                    workflowToUse[nodeId_seed_fallback].inputs.seed = seedToUse;
                                    seedNodeFound = true;
                                    attemptedSeedNodeDescription = `Sampler node "${nodeId_seed_fallback}" (input: "seed") found via secondary fallback`;
                                    console.log(`[ComfyUI Run ${runIdentifier}] Set RANDOM seed ${seedToUse} via SECONDARY FALLBACK for ${attemptedSeedNodeDescription}`);
                                    break;
                                }
                            }
                        }
                    }
                }

                if (!seedNodeFound) {
                    console.warn(`[ComfyUI Run ${runIdentifier}] Could not find any suitable node to set the seed for workflow "${currentSelectedWorkflowKey}" (last attempt involved ${attemptedSeedNodeDescription}). Generation will likely use the seed defined in the workflow template, if any.`);
                }
                // --- END OF Seed Injection ---

                requestBody = {
                    "prompt": workflowToUse,
                    "client_id": clientId
                };

                console.log(`[ComfyUI Run ${runIdentifier}] >>> Sending Request to /prompt at ${apiUrl}`);
                console.log(`[ComfyUI Run ${runIdentifier}] >>> Final Request Body (Structure):`, workflowToUse); // Log structure, stringifying can be too long


                let queueResponse;
                try {
                    queueResponse = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(requestBody)
                    });
                } catch (networkError) {
                    console.error(`[ComfyUI Run ${runIdentifier}] !!! Network Error during /prompt fetch:`, networkError);
                    throw new Error(`Network Error connecting to ComfyUI at ${serverAddress}. Is it running? (${networkError.message})`);
                }

                console.log(`[ComfyUI Run ${runIdentifier}] <<< /prompt Response Status:`, queueResponse.status, queueResponse.statusText);

                if (!queueResponse.ok) {
                    let errorBodyText = await queueResponse.text();
                    console.error(`[ComfyUI Run ${runIdentifier}] !!! /prompt fetch failed. Response Body:`, errorBodyText);
                    let errorMessage = `HTTP ${queueResponse.status} ${queueResponse.statusText}`;
                    try {
                        const errorJson = JSON.parse(errorBodyText);
                        errorMessage = errorJson.error || errorJson.message || errorJson.node_errors || JSON.stringify(errorJson);
                        if (typeof errorMessage !== 'string') errorMessage = JSON.stringify(errorMessage);
                    } catch (_) {
                        errorMessage = errorBodyText || errorMessage;
                    }
                    if (errorMessage.length > 300) errorMessage = errorMessage.substring(0, 300) + "...";
                    throw new Error(`ComfyUI Queue Error: ${errorMessage}`);
                }

                const queueData = await queueResponse.json();
                console.log(`[ComfyUI Run ${runIdentifier}] <<< /prompt Success Response Data:`, queueData);

                const newPromptId = queueData.prompt_id; // Renamed to avoid conflict if promptId was in outer scope
                if (!newPromptId) {
                    console.error(`[ComfyUI Run ${runIdentifier}] !!! ComfyUI response OK, but missing 'prompt_id'. Response:`, queueData);
                    throw new Error("ComfyUI did not return a prompt_id in the response.");
                }

                console.log(`[ComfyUI Run ${runIdentifier}] Prompt queued successfully. Prompt ID: ${newPromptId}. Starting history polling.`);
                result.promptId = newPromptId;
                result.status = 'polling';
                result.message = `ComfyUI Queued (ID: ${newPromptId.substring(0,8)}...). Polling...`;
                updateImageResultItem(endpointConfig.id, endpointConfig.name, result, runIdentifier, 'polling', result.message);

                pollComfyHistory(newPromptId, serverAddress, endpointConfig.id, endpointConfig.name, runIdentifier);
                return result; // Return result indicating polling has started
            } // End ComfyUI Case

            case 'custom_image': {
                if (!apiUrl) throw new Error("Custom Image Endpoint URL is missing.");
                const customSeedToUse = generateRandomSeed();
                requestBody = {
                    prompt: promptToSend,
                    seed: customSeedToUse
                };
                console.log(`Run ${runIdentifier}: Sending to Custom Endpoint ${apiUrl} with seed ${customSeedToUse}`);
                console.log(`Run ${runIdentifier}: Custom Request Body:`, JSON.stringify(requestBody));

                const apiKeyCustom = llmApiKeyInput.value.trim(); // Using the general LLM API key field
                if (apiKeyCustom) {
                    requestHeaders['Authorization'] = `Bearer ${apiKeyCustom}`;
                    console.log(`Run ${runIdentifier}: Sending API Key to Custom image endpoint.`);
                }

                const response = await fetch(apiUrl, {
                    method: method,
                    headers: requestHeaders,
                    body: JSON.stringify(requestBody)
                });

                console.log(`Run ${runIdentifier}: Custom Endpoint Response Status:`, response.status, response.statusText);

                if (!response.ok) {
                    let e = response.statusText;
                    try { const j = await response.json(); e = j.detail || j.error?.message || j.message || JSON.stringify(j); } catch (_) {}
                    throw new Error(`Custom API Error (${response.status}): ${e}`);
                }

                let contentType = response.headers.get("content-type");
                let responseDataCustom; // Declare for potential JSON
                if (contentType && contentType.startsWith("image/")) {
                    const blob = await response.blob();
                    result.imageData = await blobToBase64(blob);
                    result.message = `Custom OK. Image received directly.`;
                    result.status = 'success';
                } else if (contentType && contentType.includes("application/json")) {
                    responseDataCustom = await response.json();
                    console.log(`Run ${runIdentifier}: Custom Endpoint JSON Response:`, responseDataCustom);
                    if (responseDataCustom.images && Array.isArray(responseDataCustom.images) && responseDataCustom.images[0]) {
                        result.imageData = `data:image/png;base64,${responseDataCustom.images[0]}`;
                        result.message = `Custom OK. Base64 image found in 'images' array.`;
                    } else if (responseDataCustom.image) {
                        result.imageData = `data:image/png;base64,${responseDataCustom.image}`;
                        result.message = `Custom OK. Base64 image found in 'image' field.`;
                    } else if (responseDataCustom.data && Array.isArray(responseDataCustom.data) && responseDataCustom.data[0]?.url) {
                        result.imageUrl = responseDataCustom.data[0].url;
                        result.message = `Custom OK. Image URL found in 'data' array.`;
                    } else if (responseDataCustom.url) {
                        result.imageUrl = responseDataCustom.url;
                        result.message = `Custom OK. Image URL found in 'url' field.`;
                    } else {
                        result.message = `Custom OK (${response.status}). JSON received, but no standard image data/URL found.`;
                        console.warn(`No standard image field found in custom JSON response from ${endpointConfig.name}`);
                    }
                    result.status = 'success';
                } else {
                    result.message = `Custom OK (${response.status}). Non-standard success response received (${contentType || 'No Content-Type'}).`;
                    console.warn(`Non-standard success response from ${endpointConfig.name}: ${contentType}`);
                    result.status = 'success';
                }
                updateImageResultItem(endpointConfig.id, endpointConfig.name, result, runIdentifier);
                return result;
            } // End Custom Image Case

            default: {
                console.warn(`Run ${runIdentifier}: Skipped unknown endpoint type: ${endpointConfig.value}`);
                result.message = `Skipped (Invalid Endpoint Type): ${endpointConfig.name}`;
                result.status = 'error'; // Treat as an error for consistent handling
                result.error = 'Invalid endpoint type configured.';
                updateImageResultItem(endpointConfig.id, endpointConfig.name, result, runIdentifier, 'error', result.message);
                return result; // Return the result object with error status
            }
        } // End Switch
    } catch (error) {
        console.error(`Run ${runIdentifier}: Error calling ${endpointConfig.name}:`, error);
        result.error = error.message || 'Unknown error during API call.';
        result.status = 'error';
        updateImageResultItem(endpointConfig.id, endpointConfig.name, result, runIdentifier, 'error', result.error);
        // Rethrow error so Promise.allSettled in the caller can correctly identify it as a rejected promise
        error.endpointId = endpointConfig.id; // Augment error with IDs for reporting
        error.endpointName = endpointConfig.name;
        throw error;
    }
}

    // --- ComfyUI History Polling Function ---
    function pollComfyHistory(promptId, serverAddress, endpointId, endpointName, runIdentifier, maxAttempts = 120, delay = 2500) { // Increased attempts/delay
        // No return promise needed here, it updates the UI directly when done/failed

        let attempts = 0;
        const historyUrl = `${serverAddress}/history/${promptId}`;
        console.log(`[Comfy Poll ${runIdentifier}-${promptId}] Starting polling: ${historyUrl}`);

        // Clear any existing interval for this promptId (shouldn't happen ideally)
        if (comfyPollingStates[promptId]) {
            console.warn(`[Comfy Poll ${runIdentifier}-${promptId}] Cleared existing polling interval.`);
            clearInterval(comfyPollingStates[promptId]);
        }

        const intervalId = setInterval(async () => {
            // --- Check Stop Conditions ---
            if (stopBatchFlag) {
                clearInterval(intervalId);
                delete comfyPollingStates[promptId];
                console.log(`[Comfy Poll ${runIdentifier}-${promptId}] Polling stopped (Batch Stop Flag).`);
                updateImageResultItem(endpointId, endpointName, { error: "Batch stopped by user." }, runIdentifier, 'error', 'Batch stopped.');
                return;
            }

            if (attempts >= maxAttempts) {
                clearInterval(intervalId);
                delete comfyPollingStates[promptId];
                console.error(`[Comfy Poll ${runIdentifier}-${promptId}] Polling timed out after ${attempts} attempts.`);
                updateImageResultItem(endpointId, endpointName, { error: `Polling timed out (${maxAttempts} attempts).` }, runIdentifier, 'error', 'Polling timed out.');
                if (Object.keys(comfyPollingStates).length === 0 && !isContinuousModeActive) {
                     showMessage(resultsMessageBox, 'error', `ComfyUI polling timed out for ${endpointName}.`);
                 }
                return;
            }
            attempts++;

            // Update status periodically
             if (attempts % 4 === 1) { // Update status every ~10 seconds
                 updateImageResultItem(endpointId, endpointName, null, runIdentifier, 'polling', `Polling... (${attempts}/${maxAttempts})`);
             }

            // --- Fetch History ---
            try {
                const response = await fetch(historyUrl);

                // Handle non-OK responses (excluding 404 which means not ready yet)
                if (!response.ok && response.status !== 404) {
                    console.warn(`[Comfy Poll ${runIdentifier}-${promptId}] History fetch error (${response.status} ${response.statusText}). Retrying... Attempt ${attempts}`);
                    // Don't return yet, let it retry
                    return; // Skip processing this attempt
                }

                // --- Process OK or 404 ---
                if (response.ok) {
                    const historyData = await response.json();
                    // console.log(`[Comfy Poll ${runIdentifier}-${promptId}] History Data Attempt ${attempts}:`, historyData); // DEBUG detailed log

                    // Check if our specific prompt ID is in the history AND has outputs
                    if (historyData && historyData[promptId]?.outputs) {
                        clearInterval(intervalId); // Stop polling!
                        delete comfyPollingStates[promptId];
                        console.log(`[Comfy Poll ${runIdentifier}-${promptId}] Outputs found after ${attempts} attempts.`);

                        const outputs = historyData[promptId].outputs;
                        let imageDataResult = null;
                        let foundImage = false;

                        // --- Find Image Output ---
                        // Iterate through nodes to find image data (often in SaveImage or PreviewImage nodes)
                        for (const nodeId in outputs) {
                            const nodeOutput = outputs[nodeId];
                            if (nodeOutput.images && Array.isArray(nodeOutput.images) && nodeOutput.images.length > 0) {
                                console.log(`[Comfy Poll ${runIdentifier}-${promptId}] Image data found in node ${nodeId}`);
                                const imageInfo = nodeOutput.images[0]; // Process the first image

                                if (imageInfo.filename && imageInfo.type && imageInfo.subfolder !== undefined) {
                                    // Construct the /view URL
                                    const imageUrl = `${serverAddress}/view?filename=${encodeURIComponent(imageInfo.filename)}&subfolder=${encodeURIComponent(imageInfo.subfolder)}&type=${encodeURIComponent(imageInfo.type)}`;
                                    console.log(`[Comfy Poll ${runIdentifier}-${promptId}] Fetching image from /view: ${imageUrl}`);

                                    try {
                                        // Fetch the image using the /view endpoint
                                        const imageResponse = await fetch(imageUrl);
                                        if (!imageResponse.ok) {
                                            throw new Error(`Image fetch failed (${imageResponse.status} ${imageResponse.statusText})`);
                                        }
                                        const imageBlob = await imageResponse.blob();
                                        const base64ImageData = await blobToBase64(imageBlob); // Get data URL

                                        // Update the result item with the image data
                                        imageDataResult = { imageData: base64ImageData, message: `Image Received.` };
                                        updateImageResultItem(endpointId, endpointName, imageDataResult, runIdentifier);
                                        foundImage = true;
                                        break; // Stop after finding the first image output

                                    } catch (imgError) {
                                        console.error(`[Comfy Poll ${runIdentifier}-${promptId}] Error fetching/processing image '${imageInfo.filename}' from /view:`, imgError);
                                        updateImageResultItem(endpointId, endpointName, { error: `Image load failed: ${imgError.message}` }, runIdentifier, 'error', `Image load failed.`);
                                        foundImage = true; // Mark as found even if load failed, to stop searching
                                        break;
                                    }
                                } else {
                                    console.warn(`[Comfy Poll ${runIdentifier}-${promptId}] Image info incomplete in node ${nodeId}:`, imageInfo);
                                }
                            }
                        } // End node output loop

                        // Handle case where workflow finished but no image was found
                        if (!foundImage) {
                            console.warn(`[Comfy Poll ${runIdentifier}-${promptId}] Workflow finished, but no suitable image output detected in history.`);
                            updateImageResultItem(endpointId, endpointName, { error: "Finished, no image output found." }, runIdentifier, 'error', 'Finished, no image found.');
                        }

                        // Update overall message box if polling is complete for all jobs
                         if (Object.keys(comfyPollingStates).length === 0 && !isContinuousModeActive) {
                             showMessage(resultsMessageBox, foundImage ? 'success' : 'warning', `ComfyUI processing complete for ${endpointName}.`);
                         }
                        return; // Exit interval function

                    } else {
                         // History found for promptId, but outputs not ready yet
                         if (attempts % 10 === 0) console.log(`[Comfy Poll ${runIdentifier}-${promptId}] History found, awaiting outputs... Attempt ${attempts}`);
                    }
                } else { // Response status was 404
                     if (attempts % 10 === 0) console.log(`[Comfy Poll ${runIdentifier}-${promptId}] History not ready yet (404). Attempt ${attempts}`);
                }
            } catch (error) {
                 // Catch network errors during the fetch itself
                 console.error(`[Comfy Poll ${runIdentifier}-${promptId}] Error during polling fetch (Attempt ${attempts}):`, error);
                 // Don't stop polling on transient network errors, let it retry
            }
        }, delay);

        // Store the interval ID so we know polling is active for this promptId
        comfyPollingStates[promptId] = intervalId;
    }

     // --- Download Results ---
     function downloadResultsText() {
         console.log("--- Download Log Button Triggered ---"); // DEBUG LOG
         try {
             let textContent = "Artistic T-Shirt Prompt Generator Results\n";
             textContent += "========================================\n\n";

             // 1. Keywords Summary
             textContent += "Selected Keywords Summary:\n";
             textContent += (generatedKeywordsTextarea.value || "N/A") + "\n\n";

             // 2. API Generated Prompt
             textContent += "API Generated Prompt:\n";
             textContent += (apiGeneratedPromptTextarea.value || "N/A") + "\n\n";

             // 3. System Prompt Used
             textContent += "System Prompt Used (for LLM):\n";
             textContent += (systemPromptTextarea.value || "N/A") + "\n\n";

             // 4. LLM Configuration
             textContent += "LLM Configuration:\n";
             const llmOption = llmEndpointSelect.selectedOptions[0];
             textContent += `  Endpoint Type: ${llmOption ? llmOption.text : 'N/A'}\n`;
             if (llmEndpointSelect.value === 'custom_llm') {
                 textContent += `  Custom URL: ${customLlmEndpointInput.value || 'Not Set'}\n`;
             }
             textContent += `  Model Name: ${llmModelNameInput.value || 'Default / Not Set'}\n`;
             textContent += `  API Key Provided: ${llmApiKeyInput.value ? 'Yes' : 'No'}\n\n`; // Don't log the key itself

             // 5. Image Generation Configuration
             textContent += "Image Generation Configuration:\n";
             const selectedEndpoints = getSelectedImageEndpoints(); // Use the helper function
             if (selectedEndpoints.length > 0) {
                 selectedEndpoints.forEach(ep => {
                     textContent += `  - Endpoint: ${ep.name}\n`;
                     textContent += `    Type: ${ep.value}\n`;
                     textContent += `    URL: ${ep.url || 'N/A'}\n`;
                     if (ep.value === 'local_comfyui') {
                         const selectedWorkflowText = comfyWorkflowSelect.selectedOptions[0]?.textContent;
                         textContent += `    Workflow: ${selectedWorkflowText || 'None Selected'}\n`;
                     }
                 });
             } else {
                 textContent += "  (No image services selected)\n";
             }
             textContent += "\n";

             // 6. Image Generation Results
             textContent += "Image Generation Status & Results:\n";
             const resultItems = imageResultsGrid.querySelectorAll('.image-result-item');
             if (resultItems.length === 0 || (resultItems.length === 1 && resultItems[0].classList.contains('placeholder-text'))) {
                 textContent += "(No generation attempted or results available)\n";
             } else {
                 // Iterate in reverse order to get latest first in log
                 Array.from(resultItems).reverse().forEach(item => {
                     const title = item.querySelector('h4')?.textContent || 'Unknown Endpoint';
                     const round = item.querySelector('.round-label')?.textContent || '';
                     const status = item.querySelector('.status-message')?.textContent || 'Unknown status';
                     const imgSrc = item.querySelector('img')?.src || 'No image';

                     textContent += `- ${title} (${round}): ${status}\n`;
                     if (imgSrc && !imgSrc.startsWith('https://placehold.co')) {
                         if (imgSrc.startsWith('data:image')) {
                             textContent += `  Image Source: (Base64 Data Included In Page)\n`;
                         } else {
                             textContent += `  Image Source: ${imgSrc}\n`;
                         }
                     }
                     textContent += "\n";
                 });
             }

             // Create and trigger download
             const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
             const url = URL.createObjectURL(blob);
             const a = document.createElement('a');
             a.href = url;
             // Create a filename with timestamp
             const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
             a.download = `tshirt_prompt_results_${timestamp}.txt`;
             document.body.appendChild(a);
             a.click();
             document.body.removeChild(a);
             URL.revokeObjectURL(url);
             console.log("Log file download initiated.");
             showMessage(resultsMessageBox, 'success', "Log file download started.");

         } catch (error) {
             console.error("Error generating or downloading log file:", error);
              showMessage(resultsMessageBox, 'error', "Failed to generate or download log file.");
         }
     }

}); // End DOMContentLoaded