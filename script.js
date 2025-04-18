// Assumes data.js (with dropdownData, comfyWorkflows, and storedApiKeys) is loaded first

// --- System Prompt Templates ---
const systemPromptTemplates = {
     'Stable Diffusion 1.x': `ou are an expert prompt engineer for Stable Diffusion 1.x models. Your task is to create concise, keyword-driven prompts optimized for the 75-token limit and the bag-of-words nature of SD1.x. Construct prompts as a single, flowing line of comma-separated keywords and impactful short phrases, always placing the most important subject and action at the start, followed by environment, style, and any additional details. Use parentheses for emphasis, such as (masterpiece:1.2), and include artist or style references where relevant. Avoid repetition, contradictions, and verbose language; keep the prompt under 75 tokens, and only include negative prompts for elements you want to exclude. Omit any section if information is missing. Output only the prompt string, with no explanations, reasoning, or extra text.

<start> portrait of a young woman, freckles, red hair, green eyes, soft lighting, studio background, (masterpiece:1.2), (detailed skin:1.3), by Greg Rutkowski, trending on ArtStation <stop><start> cyberpunk city at night, neon lights, rain, reflections, flying cars, crowded streets, (cinematic:1.2), (high detail:1.3), by Syd Mead <stop><start> fantasy forest, ancient trees, glowing mushrooms, mist, magical atmosphere, (ethereal:1.2), (vivid colors:1.3), illustration, by Ivan Shishkin <stop>
Output only the prompt string, with no explanations, reasoning, or extra text.`,
    'SDXL/SD3': `You are an expert prompt engineer for SDXL and SD3 models. Your task is to create highly effective, detailed prompts that maximize the 75-token chunk limit, always frontloading the most important information. Write prompts as a single, coherent line of text using clear, natural language or comma-separated keywords and phrases. Begin with the subject and their action or pose, followed by the environment or setting, then lighting and mood, and finally style, artistic details, and any unique features. Add specific details such as textures, colors, camera angle, artistic style, or artist references as appropriate. Use parentheses for keyword weighting, such as (keyword:1.2), with weights between 1.1 and 1.4 recommended. Avoid repetition, contradictions, and overly long prompts; keep each chunk under 75 tokens, and only include negative prompts for elements you want to exclude. Omit any section if information is missing. Output only the prompt string, with no explanations, reasoning, or extra text.

<start> elegant woman in a flowing red dress, dancing on a rooftop at sunset, city skyline in the background, (cinematic lighting:1.3), (vivid colors:1.2), sharp focus, by Annie Leibovitz, dramatic mood <stop> <start> futuristic samurai, neon-lit alley, rain-soaked pavement, glowing katana, (cyberpunk style:1.3), (high detail:1.2), low-angle shot, intense atmosphere <stop> <start> majestic white wolf, snowy forest, moonlight filtering through trees, (ethereal glow:1.2), (hyper-detailed fur:1.3), digital painting, mystical mood <stop>
Output only the prompt string, with no explanations, reasoning, or extra text.`,
    'FLUX': `You are an expert prompt engineer for Flux and Flux-style models. Your task is to transform user input into a highly effective, concise, and detailed prompt using best practices from top SDXL and Flux prompting guides. Construct prompts as a single, flowing line of text, using clear, natural language or comma-separated keywords and phrases. Always prioritize the most important visual elements at the start of the prompt, beginning with the subject and their action or pose, followed by the environment or setting, then lighting and mood, and finally style, artistic details, and any unique features. Add specific details such as textures, colors, camera angle, artistic style, or artist references as appropriate. Use parentheses for keyword weighting, such as (keyword:1.2), with weights between 1.1 and 1.4 recommended for Flux models. Avoid repetition, contradictions, and overly long prompts; aim for 75 tokens or less, and ensure the prompt is vivid, coherent, and free of logical loops. Only include negative prompts for elements you want to exclude, and omit any section if information is missing. Output only the prompt string, with no explanations, reasoning, or extra text.

<start> photo of a rhino dressed in a suit and tie, sitting at a table in a bar with bar stools, award-winning photography, (Elke Vogelsang:1.2), cinematic lighting, sharp focus, (detailed textures:1.3), vibrant colors <stop> <start> a giant monster hybrid of dragon and spider, in a dark dense foggy forest, (atmospheric mist:1.2), dramatic lighting, (hyper-detailed scales:1.3), ominous mood <stop> <start> retro robot, vintage workshop, sunbeams through dusty windows, (steampunk gears:1.2), (rust textures:1.2), isometric vector art, Pantone color palette, warm atmosphere <stop>`
};


document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");

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
    // ** NEW ** Reference for Clear API Key button
    const clearApiKeyButton = document.getElementById('clearApiKeyButton');
    const llmModelNameInput = document.getElementById('llmModelName');
    const imageEndpointsContainer = document.getElementById('image-endpoints');
    const addCustomEndpointBtn = document.getElementById('add-custom-endpoint-btn');
    const customEndpointsList = document.getElementById('custom-endpoints-list');
    const comfyWorkflowSelect = document.getElementById('comfyWorkflowSelect');
    const comfyuiLanAddressInput = document.getElementById('comfyuiLanAddress');
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

    // --- Global State ---
    let currentSelectedImageEndpoints = [];
    const comfyPollingStates = {};
    let isContinuousModeActive = false;
    let continuousRunsRemaining = 0;
    let currentContinuousMode = 'keep_keywords_new_api';
    let stopBatchFlag = false;
    const apiKeyStorageKey = 'promptForgeLlmApiKey'; // Key for localStorage

    // --- Initialization ---
    console.log("Starting initialization...");
    try {
        if (typeof dropdownData === 'undefined') { console.error("ERR: dropdownData missing."); showMessage(mainMessageBox, 'error', 'Failed to load keyword data.'); }
        else { populateDropdowns(); console.log("Dropdowns populated."); }
        if (typeof comfyWorkflows === 'undefined') { console.error("ERR: comfyWorkflows missing."); showMessage(configMessageBox, 'error', 'Failed to load ComfyUI workflows.'); }
        else { populateWorkflowSelect(); console.log("Workflow select populated."); }
        if (typeof systemPromptTemplates !== 'undefined') { updateSystemPrompt(); }
        else { console.error("ERR: systemPromptTemplates missing."); systemPromptTextarea.value = "Error loading system prompt templates."; }

        // ** NEW ** Load API key from storage on startup
        loadApiKeyFromStorage();

        addEventListeners(); // Add listeners AFTER functions are defined below
        initializeCollapsibleSections();
        console.log("Initialization complete.");
    } catch (initError) {
        console.error("Initialization Error:", initError);
        showMessage(mainMessageBox, 'error', `Initialization failed: ${initError.message}`);
    }

    // --- Function Definitions ---

    // ** NEW ** Functions for API Key Storage
    function saveApiKeyToStorage() {
        if (!llmApiKeyInput) return;
        const key = llmApiKeyInput.value.trim();
        if (key) {
            try {
                localStorage.setItem(apiKeyStorageKey, key);
                console.log("API Key saved to localStorage.");
                // Optional: Show temporary confirmation? Might be annoying on every change.
                // showMessage(configMessageBox, 'success', 'API Key saved locally.');
            } catch (e) {
                console.error("Error saving API Key to localStorage:", e);
                showMessage(configMessageBox, 'error', 'Could not save API Key locally (storage might be full or disabled).');
            }
        } else {
            // If the user clears the input, also remove it from storage
            clearApiKeyFromStorage();
        }
    }

    function loadApiKeyFromStorage() {
        if (!llmApiKeyInput) return;
        try {
            const savedKey = localStorage.getItem(apiKeyStorageKey);
            if (savedKey) {
                llmApiKeyInput.value = savedKey;
                console.log("API Key loaded from localStorage.");
            } else {
                console.log("No API Key found in localStorage.");
            }
        } catch (e) {
            console.error("Error loading API Key from localStorage:", e);
            // Don't necessarily show an error to the user, maybe storage is just unavailable
        }
    }

    function clearApiKeyFromStorage() {
        if (!llmApiKeyInput) return;
        try {
            localStorage.removeItem(apiKeyStorageKey);
            llmApiKeyInput.value = ''; // Clear the input field
            console.log("API Key cleared from localStorage and input field.");
            showMessage(configMessageBox, 'success', 'Saved API Key cleared.');
        } catch (e) {
            console.error("Error clearing API Key from localStorage:", e);
            showMessage(configMessageBox, 'error', 'Could not clear saved API Key.');
        }
    }


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
         comfyWorkflowSelect.innerHTML = '<option value="">-- Select --</option>'; // Clear existing options first
         for (const key in comfyWorkflows) {
             const option = document.createElement('option');
             option.value = key;
             option.textContent = key.replace(/_/g, ' ').replace('WORKFLOW', '').trim() || key;
             comfyWorkflowSelect.appendChild(option);
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

 // --- Event Listeners Setup (MODIFIED) ---
 function addEventListeners() {
    console.log("Adding event listeners...");
    if (llmEndpointSelect) llmEndpointSelect.addEventListener('change', function() { customLlmEndpointContainer.style.display = (this.value === 'custom_llm') ? 'block' : 'none'; }); else console.error("Element not found: llmEndpointSelect");
    if (feelLuckyButton) feelLuckyButton.addEventListener('click', handleFeelLucky); else console.error("Element not found: feelLuckyButton");
    if (generateKeywordsButton) generateKeywordsButton.addEventListener('click', handleGenerateKeywords); else console.error("Element not found: generateKeywordsButton");
    if (generateApiPromptButton) generateApiPromptButton.addEventListener('click', handleGenerateApiPromptClick); else console.error("Element not found: generateApiPromptButton");
    if (sendPromptButton) sendPromptButton.addEventListener('click', handleSendPromptClick); else console.error("Element not found: sendPromptButton");
    if (startNewPromptButton) startNewPromptButton.addEventListener('click', resetForm); else console.error("Element not found: startNewPromptButton");
    if (downloadResultsButton) downloadResultsButton.addEventListener('click', downloadResultsText); else console.error("Element not found: downloadResultsButton");
    if (addCustomEndpointBtn) addCustomEndpointBtn.addEventListener('click', addCustomImageEndpointInput); else console.error("Element not found: addCustomEndpointBtn");
    if (customEndpointsList) customEndpointsList.addEventListener('click', handleRemoveCustomEndpoint); else console.error("Element not found: customEndpointsList");
    if (collapseToggleButtons.length > 0) collapseToggleButtons.forEach(button => { button.addEventListener('click', () => toggleCollapse(button)); }); else console.warn("No collapse toggle buttons found");
    if (enableContinuousGenCheckbox) enableContinuousGenCheckbox.addEventListener('change', toggleContinuousOptions); else console.error("Element not found: enableContinuousGenCheckbox");
    if (stopBatchButton) stopBatchButton.addEventListener('click', handleStopBatch); else console.error("Element not found: stopBatchButton");
    if (promptFormatRadios.length > 0) promptFormatRadios.forEach(radio => { radio.addEventListener('change', updateSystemPrompt); }); else console.warn("No prompt format radios found");
    if (pageContainer) pageContainer.addEventListener('click', handleCopyClick); else console.error("Element not found: pageContainer");

    // ** NEW Listeners for API Key Input **
    if (llmApiKeyInput) {
        // Save when the user finishes editing (leaves the field)
        llmApiKeyInput.addEventListener('blur', saveApiKeyToStorage);
    } else { console.error("Element not found: llmApiKeyInput"); }

    if (clearApiKeyButton) {
        clearApiKeyButton.addEventListener('click', clearApiKeyFromStorage);
    } else { console.error("Element not found: clearApiKeyButton"); }
    // ** END NEW Listeners **

    console.log("Event listeners added.");
}

    // --- Main Handler for Send Prompt / Start Batch Button ---
    async function handleSendPromptClick() {
        console.log("Handling 'Send Prompt / Start Batch' click...");
        // --- Click Feedback ---
        sendPromptButton.disabled = true;
        const originalButtonText = sendPromptButton.innerHTML;
        const isBatch = enableContinuousGenCheckbox.checked;

        if (isBatch) {
            sendPromptButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting Batch...';
            stopBatchButton.style.display = 'inline-flex';
            stopBatchButton.disabled = false; // Ensure stop button is enabled initially
            stopBatchButton.innerHTML = '<i class="fas fa-stop-circle"></i> Stop Batch'; // Reset stop button text
            showMessage(configMessageBox, 'loading', 'Starting image generation batch...', true); // Show in config box for batch
        } else {
             sendPromptButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
             showMessage(resultsMessageBox, 'loading', 'Sending prompt to image service(s)...', true); // Show in results box for single
             stopBatchButton.style.display = 'none'; // Hide stop button if not batching
        }
        // ---------------------

        try {
           if (isBatch) {
               // --- Start Batch ---
               isContinuousModeActive = true;
               stopBatchFlag = false;
               continuousRunsRemaining = parseInt(continuousGenCountInput.value, 10) || 1;
               if (continuousRunsRemaining <= 0) continuousRunsRemaining = 1; // Ensure at least 1 run
               imageResultsGrid.innerHTML = ''; // Clear previous results for new batch
               await startContinuousGenerationLoop(); // Start the loop
               // Final status message handled within the loop completion/stop logic

           } else {
               // --- Single Run ---
               const runId = Date.now(); // Simple unique identifier for single run
               await handleSendPromptToImageServices(runId.toString(), null); // Let it determine prompt and seed internally
               // Final status message handled within handleSendPromptToImageServices

                // Restore button only after single run completes (or fails)
                sendPromptButton.disabled = false;
                sendPromptButton.innerHTML = originalButtonText;

           }
        } catch (error) {
            // Catch errors that might occur *before* individual API calls (e.g., getting prompt, starting batch)
            console.error("Error starting prompt sending process:", error);
             const msgBox = isBatch ? configMessageBox : resultsMessageBox;
            showMessage(msgBox, 'error', `Error: ${error.message}`);

             // Restore button state immediately on setup error
             sendPromptButton.disabled = false;
             sendPromptButton.innerHTML = originalButtonText;
             if (isBatch) {
                 isContinuousModeActive = false; // Ensure batch mode is reset
                 stopBatchButton.style.display = 'none';
             }
        }
       // NOTE: Button state for batches is restored within startContinuousGenerationLoop's exit conditions
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

    async function handleSendPromptClick() {
         console.log("Handling 'Send Prompt / Start Batch' click...");
         // --- Click Feedback ---
         sendPromptButton.disabled = true;
         const originalButtonText = sendPromptButton.innerHTML;
         sendPromptButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
         const isBatch = enableContinuousGenCheckbox.checked;
         if (isBatch) {
             stopBatchButton.style.display = 'inline-flex';
             stopBatchButton.disabled = false; // Ensure stop button is enabled initially
             stopBatchButton.innerHTML = '<i class="fas fa-stop-circle"></i> Stop Batch'; // Reset stop button text
         }
         showMessage(resultsMessageBox, 'loading', isBatch ? 'Starting image generation batch...' : 'Sending prompt to image service(s)...');
         // ---------------------

         try {
            if (isBatch) {
                isContinuousModeActive = true;
                stopBatchFlag = false;
                continuousRunsRemaining = parseInt(continuousGenCountInput.value, 10) || 1;
                imageResultsGrid.innerHTML = ''; // Clear previous results for batch
                await startContinuousGenerationLoop(); // Start the loop
                // Final status message handled within the loop completion/stop logic
            } else {
                const runId = Date.now(); // Simple unique identifier for single run
                await handleSendPromptToImageServices(runId.toString(), null); // Let it determine prompt and seed
                // Final status message handled within handleSendPromptToImageServices
            }
         } catch (error) {
             // Catch errors that might occur before individual API calls (e.g., getting prompt)
             console.error("Error starting prompt sending process:", error);
             showMessage(resultsMessageBox, 'error', `Error: ${error.message}`);
         } finally {
             // --- Restore Button (only if NOT in active batch mode) ---
             if (!isContinuousModeActive) {
                 sendPromptButton.disabled = false;
                 sendPromptButton.innerHTML = originalButtonText;
                 stopBatchButton.style.display = 'none'; // Hide stop button if not batching
             }
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
        div.querySelector(`#${itemId}`).focus();
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


     // --- LLM API Call Function (MODIFIED for Gemini Key Handling) ---
     async function callLLMForPrompt(keywordPromptForLLM, targetMessageBox) {
        const selectedLlmEndpointValue = llmEndpointSelect.value;
        const modelName = llmModelNameInput.value.trim();
        let systemPrompt = systemPromptTextarea.value;
        // ALWAYS read the key from the input field
        let apiKey = llmApiKeyInput.value.trim(); // This value might have come from localStorage
        let requestBody;
        let requestHeaders = { 'Content-Type': 'application/json' };
        let endpointUrl = selectedLlmEndpointValue;
        let apiUrl;

        console.log(`Calling LLM. Endpoint Type: ${selectedLlmEndpointValue}, Model: ${modelName || 'Default'}`);

         try {
             if (endpointUrl.includes('generativelanguage.googleapis.com')) {
                 // --- Gemini ---
                 // ** MODIFIED: Always use the key from the input field **
                 if (!apiKey) {
                     // Prompt the user or throw error if key is missing for Gemini
                     throw new Error("Gemini API Key is missing. Please enter it in the LLM Configuration section.");
                 }
                 const geminiModel = modelName || "gemini-1.5-flash-latest";
                 apiUrl = `${endpointUrl}/models/${geminiModel}:generateContent?key=${apiKey}`; // Key in URL
                 requestBody = {
                     contents: [ { role: "user", parts: [{ text: keywordPromptForLLM }] } ],
                     ...(systemPrompt && { systemInstruction: { role: "system", parts: [{ text: systemPrompt }] } }),
                     generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
                 };
                 // No Authorization header needed when key is in URL
             } else if (endpointUrl.includes('localhost:1234')) {
                 // --- LM Studio ---
                 apiUrl = `${endpointUrl}/chat/completions`;
                 if (!modelName) console.warn("LM Studio might require a model name...");
                 requestBody = {
                     model: modelName || "loaded-model",
                     messages: [ ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []), { role: "user", content: keywordPromptForLLM } ],
                     temperature: 0.7, max_tokens: 400
                 };
                 // Use apiKey from input if provided for LM Studio
                 if (apiKey) { requestHeaders['Authorization'] = `Bearer ${apiKey}`; console.log("Sending API Key to LM Studio");}
             } else if (endpointUrl.includes('localhost:11434')) {
                 // --- Ollama ---
                 apiUrl = `${endpointUrl}/chat/completions`;
                  if (!modelName) { throw new Error("Missing Ollama Model Name..."); }
                  requestBody = {
                      model: modelName,
                      messages: [ ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []), { role: "user", content: keywordPromptForLLM } ],
                      stream: false, options: { temperature: 0.7 }
                  };
                  // Use apiKey from input if provided for Ollama
                  if (apiKey) { requestHeaders['Authorization'] = `Bearer ${apiKey}`; console.log("Sending API Key to Ollama"); }
             } else {
                 // --- Custom ---
                 if (selectedLlmEndpointValue === 'custom_llm') {
                     endpointUrl = customLlmEndpointInput.value.trim();
                     if (!endpointUrl) throw new Error("Custom LLM Endpoint URL is missing.");
                     apiUrl = endpointUrl;
                 } else { apiUrl = endpointUrl; }
                  if (!apiUrl) throw new Error("LLM Endpoint URL is invalid.");
                  if (!apiUrl.endsWith('/chat/completions') && !apiUrl.endsWith('/v1/chat/completions')) { apiUrl = apiUrl.replace(/\/$/, '') + '/v1/chat/completions'; console.warn(`Assuming OpenAI path: ${apiUrl}`); }
                  if (!modelName) console.warn("Custom LLM might require model name.");
                  requestBody = {
                      model: modelName || "custom-llm-model",
                      messages: [ ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []), { role: "user", content: keywordPromptForLLM } ],
                      temperature: 0.7, max_tokens: 400, stream: false
                  };
                  // Use apiKey from input if provided for Custom
                  if (apiKey) { requestHeaders['Authorization'] = `Bearer ${apiKey}`; console.log("Sending API Key to Custom LLM"); }
             }

             // ... (rest of fetch call, response handling - same as before) ...
              console.log(">>> Sending LLM Request to:", apiUrl); console.log(">>> Request Headers:", requestHeaders); console.log(">>> Request Body (preview):", JSON.stringify(requestBody).substring(0, 300) + "...");
              const response = await fetch(apiUrl, { method: 'POST', headers: requestHeaders, body: JSON.stringify(requestBody) }); console.log("<<< LLM Response Status:", response.status, response.statusText);
              if (!response.ok) { let errorBodyText = await response.text(); console.error("<<< LLM Response Error Body:", errorBodyText); let errorMessage = `HTTP ${response.status} ${response.statusText}`; try { const errorJson = JSON.parse(errorBodyText); errorMessage = errorJson.error?.message || errorJson.message || errorJson.error || JSON.stringify(errorJson); } catch (_) { errorMessage = errorBodyText || errorMessage; } if (errorMessage.length > 300) errorMessage = errorMessage.substring(0, 300) + "..."; throw new Error(`LLM API Error: ${errorMessage}`); }
              const responseData = await response.json(); console.log("<<< LLM Response Data:", responseData); let generatedText = ""; if (apiUrl.includes('generativelanguage.googleapis.com')) { generatedText = responseData.candidates?.[0]?.content?.parts?.[0]?.text; } else { generatedText = responseData.choices?.[0]?.message?.content; } if (generatedText === undefined || generatedText === null) { console.warn("LLM response received, but no text found:", responseData); throw new Error("LLM response format unexpected or empty text content."); } return (generatedText || "").trim();

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

    // --- Get Selected Image Endpoints (MODIFIED) ---
    function getSelectedImageEndpoints() {
        const endpoints = [];
        const defaultComfyUIAddress = 'http://127.0.0.1:8188';

        // Check ComfyUI checkbox
        const comfyCheckbox = imageEndpointsContainer.querySelector('#img-comfyui:checked');
        if (comfyCheckbox) {
            let comfyAddress = comfyuiLanAddressInput.value.trim(); // Read from the new input field

            // Validate and use default if empty or invalid
            if (!comfyAddress || !comfyAddress.match(/^https?:\/\//)) {
                if (comfyAddress) { // Log if it was invalid, but not if it was just empty
                    console.warn(`Invalid ComfyUI address entered: "${comfyAddress}". Using default: ${defaultComfyUIAddress}`);
                    showMessage(configMessageBox, 'warning', `Invalid ComfyUI address format. Using default.`);
                }
                comfyAddress = defaultComfyUIAddress;
            }
            // Remove trailing slash if present
            comfyAddress = comfyAddress.replace(/\/$/, '');

            console.log(`Using ComfyUI Address: ${comfyAddress}`); // Log the address being used

            endpoints.push({
                id: comfyCheckbox.id,
                value: comfyCheckbox.value, // 'local_comfyui'
                name: comfyCheckbox.parentElement.querySelector('label[for="img-comfyui"]').textContent.split('<small>')[0].trim(),
                url: comfyAddress, // Use the potentially custom address
                requiresKey: false
            });
        }

        // Check Custom endpoint checkboxes and get their input values
        const customCheckboxes = customEndpointsList.querySelectorAll('input[type="checkbox"]:checked');
        customCheckboxes.forEach(checkbox => {
            const inputId = checkbox.dataset.inputId;
            const inputElement = document.getElementById(inputId);
            const url = inputElement ? inputElement.value.trim() : null;

            if (url) {
               if (!url.match(/^https?:\/\//)) {
                    console.warn(`Invalid URL format for custom endpoint: ${url}. Skipping.`);
                    showMessage(resultsMessageBox, 'warning', `Skipping invalid custom URL: ${url}`);
                    return;
                }
                let name = 'Custom Endpoint';
                try { const urlObj = new URL(url); name = `Custom: ${urlObj.hostname}`; }
                catch (e) { console.warn(`Could not parse custom URL for name: ${url}`); name = `Custom: ${url.substring(0, 20)}...`; }

                endpoints.push({
                    id: inputId,
                    value: 'custom_image',
                    name: name,
                    url: url.replace(/\/$/, ''), // Remove trailing slash
                    requiresKey: false
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

    // --- Image Generation API Call Function ---
    async function callImageGenerationAPI(promptToSend, endpointConfig, runIdentifier /* seed removed */) {
        console.log(`Run ${runIdentifier}: Sending to ${endpointConfig.name} (${endpointConfig.id})`);
        let requestBody;
        let requestHeaders = { 'Content-Type': 'application/json' };
        let apiUrl = endpointConfig.url;
        const method = 'POST';

        // Initial result state
        let result = {
            endpointId: endpointConfig.id,
            endpointName: endpointConfig.name,
            message: `Sending request...`,
            imageUrl: null,
            imageData: null,
            error: null,
            status: 'pending', // pending, polling, success, error
            promptId: null     // For ComfyUI
        };

        // --- Update placeholder immediately ---
        updateImageResultItem(endpointConfig.id, endpointConfig.name, result, runIdentifier, 'loading', 'Sending request...');

        try {
            switch (endpointConfig.value) {
                case 'local_comfyui': {
                    // --- ComfyUI Logic ---
                    const serverAddress = endpointConfig.url || 'http://127.0.0.1:8188'; // Default if not set
                    apiUrl = `${serverAddress}/prompt`;
                    const clientId = generateUUID(); // Unique ID for this request
                    let workflowJsonString;
                    let workflowToUse;

                    const selectedWorkflowKey = comfyWorkflowSelect.value;
                    console.log(`[ComfyUI Run ${runIdentifier}] Selected Workflow Key: ${selectedWorkflowKey}`); // DEBUG
                    if (!selectedWorkflowKey) {
                        throw new Error("Please select a ComfyUI workflow from the dropdown.");
                    }

                    if (typeof comfyWorkflows !== 'undefined' && comfyWorkflows[selectedWorkflowKey]) {
                        workflowJsonString = comfyWorkflows[selectedWorkflowKey];
                         console.log(`[ComfyUI Run ${runIdentifier}] Raw Workflow String:`, workflowJsonString.substring(0, 200) + "..."); // DEBUG
                    } else {
                        throw new Error(`Selected ComfyUI workflow '${selectedWorkflowKey}' not found in data.js.`);
                    }

                    // Parse and Deep Copy Workflow JSON
                    try {
                        const parsedWorkflow = JSON.parse(workflowJsonString);
                         console.log(`[ComfyUI Run ${runIdentifier}] Parsed Workflow Object:`, parsedWorkflow); // DEBUG
                        workflowToUse = JSON.parse(JSON.stringify(parsedWorkflow)); // Deep copy
                        console.log(`[ComfyUI Run ${runIdentifier}] Deep Copied Workflow Object:`, workflowToUse); // DEBUG
                    } catch (e) {
                        console.error(`[ComfyUI Run ${runIdentifier}] Error parsing/copying workflow JSON:`, e);
                        throw new Error("Failed to parse or copy the selected ComfyUI workflow JSON.");
                    }

                    // Inject Positive Prompt (assuming node ID '6' based on provided data.js)
                    const positivePromptNodeId = "6";
                    let promptNodeFound = false;
                    if (workflowToUse[positivePromptNodeId] && workflowToUse[positivePromptNodeId].inputs && workflowToUse[positivePromptNodeId].inputs.text !== undefined) {
                        workflowToUse[positivePromptNodeId].inputs.text = promptToSend;
                        promptNodeFound = true;
                        console.log(`[ComfyUI Run ${runIdentifier}] Injected prompt into node ${positivePromptNodeId}: "${promptToSend.substring(0, 50)}..."`); // DEBUG
                    } else {
                         // Fallback: Look for the first CLIPTextEncode node
                         console.warn(`[ComfyUI Run ${runIdentifier}] Node ${positivePromptNodeId} not found or missing 'inputs.text'. Searching for fallback CLIPTextEncode.`);
                        for (const nodeId in workflowToUse) {
                            if (workflowToUse[nodeId]?.class_type === "CLIPTextEncode" &&
                                workflowToUse[nodeId]?.inputs?.text !== undefined) {
                                // Simple heuristic: assume the first one is positive, might need refinement
                                // A better approach might be to look for connections or specific titles if available
                                workflowToUse[nodeId].inputs.text = promptToSend;
                                promptNodeFound = true;
                                console.log(`[ComfyUI Run ${runIdentifier}] Injected prompt into FALLBACK node ${nodeId}: "${promptToSend.substring(0, 50)}..."`); // DEBUG
                                break; // Inject into the first one found
                            }
                        }
                    }
                    if (!promptNodeFound) {
                        console.error("[ComfyUI Run ${runIdentifier}] Could not find any suitable node (target or fallback) to inject the positive prompt.");
                        throw new Error(`Could not find a positive prompt node (tried target '${positivePromptNodeId}' and fallback CLIPTextEncode). Check workflow structure.`);
                    }


                    // Inject Seed (assuming node ID '31' based on provided data.js)
                    const kSamplerNodeId = "31"; // Standard KSampler node ID
                    const seedToUse = generateRandomSeed(); // ALWAYS generate a new seed
                    let ksamplerNodeFound = false;
                    if (workflowToUse[kSamplerNodeId] && workflowToUse[kSamplerNodeId].inputs && workflowToUse[kSamplerNodeId].inputs.seed !== undefined) {
                        console.log(`[ComfyUI Run ${runIdentifier}] KSampler node ${kSamplerNodeId} seed BEFORE setting:`, workflowToUse[kSamplerNodeId].inputs.seed); // DEBUG
                        workflowToUse[kSamplerNodeId].inputs.seed = seedToUse;
                        ksamplerNodeFound = true;
                        console.log(`[ComfyUI Run ${runIdentifier}] Set RANDOM seed ${seedToUse} for KSampler node ${kSamplerNodeId}`); // DEBUG
                    } else {
                         // Fallback: Search for nodes commonly used as samplers
                         console.warn(`[ComfyUI Run ${runIdentifier}] Target KSampler node '${kSamplerNodeId}' not found or missing 'inputs.seed'. Searching for fallback sampler nodes.`);
                         const samplerTypes = ["KSampler", "KSamplerAdvanced", "SamplerCustom"]; // Add other relevant types if needed
                         for (const nodeId in workflowToUse) {
                            if (samplerTypes.includes(workflowToUse[nodeId]?.class_type) &&
                                workflowToUse[nodeId]?.inputs?.seed !== undefined) {
                                console.log(`[ComfyUI Run ${runIdentifier}] Fallback Sampler node ${nodeId} seed BEFORE setting:`, workflowToUse[nodeId].inputs.seed); // DEBUG
                                workflowToUse[nodeId].inputs.seed = seedToUse;
                                ksamplerNodeFound = true;
                                console.log(`[ComfyUI Run ${runIdentifier}] Set RANDOM seed ${seedToUse} for FALLBACK Sampler node ${nodeId}`); // DEBUG
                                break; // Set seed on the first appropriate sampler found
                             }
                         }
                    }
                    if (!ksamplerNodeFound) {
                         console.warn(`[ComfyUI Run ${runIdentifier}] Could not find any suitable KSampler node (target '${kSamplerNodeId}' or fallback) to set the seed. Generation might use a fixed seed from the workflow.`);
                         // Decide if this should be an error or just a warning
                         // throw new Error(`Could not find KSampler node ('${kSamplerNodeId}' or fallback) to set seed.`);
                    }


                    // Prepare Request Body
                    requestBody = {
                        "prompt": workflowToUse,
                        "client_id": clientId
                    };

                    console.log(`[ComfyUI Run ${runIdentifier}] >>> Sending Request to /prompt at ${apiUrl}`); // DEBUG
                    console.log(`[ComfyUI Run ${runIdentifier}] >>> Request Body (stringified):`, JSON.stringify(requestBody).substring(0, 500) + "..."); // DEBUG (Log truncated body)


                    // --- Make the API Call ---
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

                    console.log(`[ComfyUI Run ${runIdentifier}] <<< /prompt Response Status:`, queueResponse.status, queueResponse.statusText); // DEBUG

                    // --- Handle Response ---
                    if (!queueResponse.ok) {
                        let errorBodyText = await queueResponse.text(); // Get error body regardless of JSON parsing
                        console.error(`[ComfyUI Run ${runIdentifier}] !!! /prompt fetch failed. Response Body:`, errorBodyText); // DEBUG
                        let errorMessage = `HTTP ${queueResponse.status} ${queueResponse.statusText}`;
                        try {
                            const errorJson = JSON.parse(errorBodyText);
                             errorMessage = errorJson.error || errorJson.message || errorJson.node_errors || JSON.stringify(errorJson);
                             if (typeof errorMessage !== 'string') errorMessage = JSON.stringify(errorMessage); // Ensure it's a string
                         } catch (_) {
                              errorMessage = errorBodyText || errorMessage; // Use text if not JSON
                         }
                         if (errorMessage.length > 300) errorMessage = errorMessage.substring(0, 300) + "...";
                         throw new Error(`ComfyUI Queue Error: ${errorMessage}`);
                    }

                    // --- Process Success Response ---
                    const queueData = await queueResponse.json();
                    console.log(`[ComfyUI Run ${runIdentifier}] <<< /prompt Success Response Data:`, queueData); // DEBUG

                    const promptId = queueData.prompt_id;
                    if (!promptId) {
                         console.error(`[ComfyUI Run ${runIdentifier}] !!! ComfyUI response OK, but missing 'prompt_id'. Response:`, queueData);
                        throw new Error("ComfyUI did not return a prompt_id in the response.");
                    }

                    console.log(`[ComfyUI Run ${runIdentifier}] Prompt queued successfully. Prompt ID: ${promptId}. Starting history polling.`);

                    // Update status to polling and start polling
                    result.promptId = promptId;
                    result.status = 'polling';
                    result.message = `ComfyUI Queued (ID: ${promptId}). Polling...`;
                    updateImageResultItem(endpointConfig.id, endpointConfig.name, result, runIdentifier, 'polling', result.message);

                    // Start polling asynchronously (don't await here, let the main loop continue)
                    pollComfyHistory(promptId, serverAddress, endpointConfig.id, endpointConfig.name, runIdentifier);

                    return result; // Return the result object indicating polling has started
                } // End ComfyUI Case

                case 'custom_image': {
                    // --- Custom Image Endpoint Logic ---
                    if (!apiUrl) throw new Error("Custom Image Endpoint URL is missing.");

                    // Basic request body - adapt as needed for specific custom APIs
                    const seedToUse = generateRandomSeed();
                    requestBody = {
                        prompt: promptToSend,
                        seed: seedToUse // Include seed if API supports it
                        // Add other parameters like negative_prompt, steps, cfg, width, height if needed
                    };
                    console.log(`Run ${runIdentifier}: Sending to Custom Endpoint ${apiUrl} with seed ${seedToUse}`);
                    console.log(`Run ${runIdentifier}: Custom Request Body:`, JSON.stringify(requestBody));

                    // Add API key if provided (assuming Bearer token)
                    const apiKey = llmApiKeyInput.value.trim(); // Use the general API key field for custom image endpoints too? Or add a dedicated one?
                    if (apiKey) {
                         requestHeaders['Authorization'] = `Bearer ${apiKey}`;
                         console.log(`Run ${runIdentifier}: Sending API Key to Custom endpoint.`);
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

                    // Handle different response types (image/* or JSON with image data/URL)
                    let contentType = response.headers.get("content-type");
                    if (contentType && contentType.startsWith("image/")) {
                        const blob = await response.blob();
                        result.imageData = await blobToBase64(blob); // Get data URL
                        result.message = `Custom OK. Image received directly.`;
                        result.status = 'success';
                    } else if (contentType && contentType.includes("application/json")) {
                        responseData = await response.json();
                         console.log(`Run ${runIdentifier}: Custom Endpoint JSON Response:`, responseData);
                        // Look for common image data patterns in JSON response
                        if (responseData.images && Array.isArray(responseData.images) && responseData.images[0]) {
                            // Assuming base64 string without prefix
                            result.imageData = `data:image/png;base64,${responseData.images[0]}`;
                            result.message = `Custom OK. Base64 image found in 'images' array.`;
                        } else if (responseData.image) { // Single base64 string
                             result.imageData = `data:image/png;base64,${responseData.image}`;
                             result.message = `Custom OK. Base64 image found in 'image' field.`;
                        } else if (responseData.data && Array.isArray(responseData.data) && responseData.data[0]?.url) { // OpenAI style URL
                             result.imageUrl = responseData.data[0].url;
                             result.message = `Custom OK. Image URL found in 'data' array.`;
                        } else if (responseData.url) { // Simple URL
                             result.imageUrl = responseData.url;
                              result.message = `Custom OK. Image URL found in 'url' field.`;
                        } else {
                             result.message = `Custom OK (${response.status}). JSON received, but no standard image data/URL found.`;
                             console.warn(`No standard image field found in custom JSON response from ${endpointConfig.name}`);
                        }
                        result.status = 'success';
                    } else {
                        result.message = `Custom OK (${response.status}). Non-standard success response received (${contentType || 'No Content-Type'}).`;
                        console.warn(`Non-standard success response from ${endpointConfig.name}: ${contentType}`);
                        result.status = 'success'; // Mark as success but maybe visually indicate the odd response?
                    }
                    // Update the placeholder with the final result
                    updateImageResultItem(endpointConfig.id, endpointConfig.name, result, runIdentifier);
                    return result;
                } // End Custom Image Case

                default: {
                    console.warn(`Run ${runIdentifier}: Skipped unknown endpoint type: ${endpointConfig.value}`);
                    result.message = `Skipped (Invalid Endpoint Type): ${endpointConfig.name}`;
                    result.status = 'skipped'; // Or 'error'?
                    result.error = 'Invalid endpoint type configured.';
                    updateImageResultItem(endpointConfig.id, endpointConfig.name, result, runIdentifier, 'error', result.message);
                    return result;
                }
            } // End Switch
        } catch (error) {
             console.error(`Run ${runIdentifier}: Error calling ${endpointConfig.name}:`, error);
             result.error = error.message || 'Unknown error during API call.';
             result.status = 'error';
             updateImageResultItem(endpointConfig.id, endpointConfig.name, result, runIdentifier, 'error', result.error);
             // Rethrow or handle error as needed by the caller (handleSendPromptToImageServices)
             // We'll let the Promise.allSettled catch this in the caller
             error.endpointId = endpointConfig.id; // Ensure error object has IDs for reporting
             error.endpointName = endpointConfig.name;
             throw error; // Rethrow the error to be caught by Promise.allSettled
        }
    }


    // --- ComfyUI History Polling Function ---
    function pollComfyHistory(promptId, serverAddress, endpointId, endpointName, runIdentifier, maxAttempts = 9999, delay = 2500) { // Increased attempts/delay
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