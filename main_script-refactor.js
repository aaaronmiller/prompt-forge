// --- Main Orchestrator Script ---

// Assumes data.js is loaded first, then utility_functions-refactor.js,
// then api_calls-refactor.js, ui_updates-refactor.js, event_handlers-refactor.js,
// state_management-refactor.js, and finally this script.

// --- Global Constants (from original script.js) ---
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
Keywords: [USER_KEYWORDS_HERE]`,
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
        type: "mflux",
        promptNodeId: "2", promptInputName: "prompt",
        seedNodeId: "2", seedInputName: "seed",
        sizeNodeId: "2", widthInputName: "width", heightInputName: "height",
        stepsNodeId: "2", stepsInputName: "steps",
        defaultWidth: 512, defaultHeight: 768, defaultSteps: 4, defaultNegativePrompt: ""
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

// --- Global State Variables ---
// These are intended to be global for access by other refactored scripts.
// Consider encapsulating these in a state object if further refactoring is done.
let currentSelectedImageEndpoints = [];
const comfyPollingStates = {}; // Object to store polling interval IDs for ComfyUI
let isContinuousModeActive = false;
let continuousRunsRemaining = 0;
let currentContinuousMode = 'keep_keywords_new_api'; // Default continuous generation mode
let stopBatchFlag = false; // Flag to signal stopping a batch operation

document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Element References (Scoped to DOMContentLoaded) ---
    // These are defined here so they are available to any initialization functions
    // or event handlers that might need them and are called after this point.
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
    const comfySpecificParamsContainer = document.getElementById('comfySpecificParamsContainer');
    const comfyImageWidth = document.getElementById('comfyImageWidth');
    const comfyImageHeight = document.getElementById('comfyImageHeight');
    const comfySteps = document.getElementById('comfySteps');
    const comfyNegativePrompt = document.getElementById('comfyNegativePrompt');

    // --- Initialization Sequence ---

    // 1. Check for critical data from data.js
    //    Uses showMessage (utility) if there's an issue.
    if (typeof dropdownData === 'undefined') {
        console.error("ERR: dropdownData missing from data.js.");
        if (typeof showMessage === 'function' && mainMessageBox) {
            showMessage(mainMessageBox, 'error', 'Failed to load keyword data. Refresh might be needed.');
        }
    } else {
        // 2. Populate UI elements that depend on data.js but not other JS logic
        if (typeof populateDropdowns === 'function') populateDropdowns(); // from ui_setup
        else console.error('CRITICAL: populateDropdowns function not found.');
    }

    if (typeof comfyWorkflows === 'undefined') {
        console.error("ERR: comfyWorkflows missing from data.js.");
        if (typeof showMessage === 'function' && configMessageBox) {
            showMessage(configMessageBox, 'error', 'Failed to load ComfyUI workflows. Refresh might be needed.');
        }
    } else {
        if (typeof populateWorkflowSelect === 'function') populateWorkflowSelect(); // from ui_setup
        else console.error('CRITICAL: populateWorkflowSelect function not found.');
    }

    // Check for model files (non-critical for initial load, but good to note)
    if (typeof ggufModelFiles === 'undefined') { // from data.js
        console.warn("WARN: ggufModelFiles is not defined. GGUF model selector may not populate correctly.");
    }
    if (typeof checkpointModelFiles === 'undefined') { // from data.js
        console.warn("WARN: checkpointModelFiles is not defined. Checkpoint model selector may not populate correctly.");
    }

    // 3. Initialize UI sections
    if (typeof initializeCollapsibleSections === 'function') initializeCollapsibleSections(); // from ui_setup
    else console.error('initializeCollapsibleSections function not found.');

    // 4. Set initial system prompt
    // systemPromptTemplates is a global const in this file. updateSystemPrompt from ui_setup.
    if (typeof systemPromptTemplates !== 'undefined' && typeof updateSystemPrompt === 'function') {
        updateSystemPrompt();
    } else {
        console.error('updateSystemPrompt or systemPromptTemplates not available. System prompt may not initialize.');
        if (systemPromptTextarea) systemPromptTextarea.value = "Error loading system prompt templates.";
    }

    // 5. Trigger initial UI update for ComfyUI parameters based on default workflow selection
    // handleWorkflowSelectionChange from ui_updates
    if (typeof handleWorkflowSelectionChange === 'function') {
         console.log("MAIN_SCRIPT: Calling initial handleWorkflowSelectionChange() for UI consistency.");
         handleWorkflowSelectionChange();
    } else {
        console.error('handleWorkflowSelectionChange function not found. Initial ComfyUI parameter UI may not be set.');
    }

    // 6. Add all event listeners last, after UI is set up and functions are defined.
    // addEventListeners from ui_setup
    if (typeof addEventListeners === 'function') {
        addEventListeners();
    } else {
        console.error('CRITICAL: addEventListeners function not found. Application will not be interactive.');
    }

    console.log("Main script DOMContentLoaded initialization sequence complete.");
});
