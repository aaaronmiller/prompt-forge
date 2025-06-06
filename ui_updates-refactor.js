// --- UI Update Functions ---

/**
 * Populates a model selection dropdown with a list of model names.
 * @param {HTMLSelectElement} selectElement - The select DOM element to populate.
 * @param {string[]} modelList - An array of model name strings.
 * @param {string|null} defaultModelName - The model name to select by default, if present in the list.
 */
function populateModelSelect(selectElement, modelList, defaultModelName) {
    if (!selectElement) {
        console.error("populateModelSelect: selectElement is null or undefined.");
        return;
    }
    selectElement.innerHTML = ''; // Clear existing options

    if (!modelList || modelList.length === 0) {
        console.warn("populateModelSelect: modelList is empty or undefined. Adding a default 'No models found' option.");
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "No models found";
        selectElement.appendChild(option);
        selectElement.disabled = true;
        return;
    }

    selectElement.disabled = false;
    modelList.forEach(modelName => {
        const option = document.createElement('option');
        option.value = modelName;
        option.textContent = modelName.replace(/\.safetensors|\.gguf/gi, ''); // Clean up name
        selectElement.appendChild(option);
    });

    if (defaultModelName && modelList.includes(defaultModelName)) {
        selectElement.value = defaultModelName;
    } else if (modelList.length > 0) {
        // selectElement.selectedIndex = 0; // Select the first model if default is not found or not provided
        // console.warn(`populateModelSelect: Default model "${defaultModelName}" not found in list, or no default provided. Selected first model instead.`);
        // Keep existing selection or let browser default if defaultModelName is not in list
         if (selectElement.options.length > 0 && !Array.from(selectElement.options).find(opt => opt.value === defaultModelName)) {
            console.warn(`populateModelSelect: Default model "${defaultModelName}" not in list. Browser default or current selection retained.`);
        } else if (!defaultModelName) {
            // No default specified, browser will pick first or retain current if items are same
        }
    }
}

/**
 * Handles changes in the ComfyUI workflow selection.
 */
function handleWorkflowSelectionChange() {
    console.log("--- handleWorkflowSelectionChange called ---");

    const comfyWorkflowSelect = document.getElementById('comfyWorkflowSelect');
    const ggufModelSelectorContainer = document.getElementById('ggufModelSelectorContainer');
    const checkpointModelSelectorContainer = document.getElementById('checkpointModelSelectorContainer');
    const comfySpecificParamsContainer = document.getElementById('comfySpecificParamsContainer');
    const comfyImageWidth = document.getElementById('comfyImageWidth');
    const comfyImageHeight = document.getElementById('comfyImageHeight');
    const comfySteps = document.getElementById('comfySteps');
    const comfyNegativePrompt = document.getElementById('comfyNegativePrompt');
    const ggufModelSelect = document.getElementById('ggufModelSelect');
    const checkpointModelSelect = document.getElementById('checkpointModelSelect');

    // comfyImageParamsContainer might be an old reference, ensure it's correctly handled or removed if not used.
    // const comfyImageParamsContainer = document.getElementById('comfyImageParamsContainer');


    if (!comfyWorkflowSelect) {
        console.error("[WorkflowChange] ABORT: comfyWorkflowSelect element not found!");
        return;
    }
    const selectedKey = comfyWorkflowSelect.value;
    console.log("[WorkflowChange] Selected workflow key:", `"${selectedKey}"`);

    // Assumes comfyWorkflowSpecifics, ggufModelFiles, checkpointModelFiles, comfyWorkflows are global (from data.js or main_script)
    if (typeof comfyWorkflowSpecifics === 'undefined') {
        console.error("[WorkflowChange] ABORT: comfyWorkflowSpecifics object not found!");
        return;
    }
    const specifics = comfyWorkflowSpecifics[selectedKey];
    console.log("[WorkflowChange] Specifics for this key:", specifics);

    if (!ggufModelSelectorContainer || !checkpointModelSelectorContainer || !comfySpecificParamsContainer ||
        !comfyImageWidth || !comfyImageHeight || !comfySteps || !comfyNegativePrompt || !ggufModelSelect || !checkpointModelSelect ) {
        console.error("[WorkflowChange] ABORT: One or more required parameter/selector DOM elements are missing!");
        return;
    }

    const showElement = (element, displayType = 'flex') => {
        if (element) element.style.display = displayType;
    };
    const hideElement = (element) => {
        if (element) element.style.display = 'none';
    };

    hideElement(ggufModelSelectorContainer);
    hideElement(checkpointModelSelectorContainer);
    hideElement(comfySpecificParamsContainer);
    const negPromptInputContainer = comfyNegativePrompt.parentElement;
    if (negPromptInputContainer) hideElement(negPromptInputContainer);

    if (specifics) {
        console.log("[WorkflowChange] Valid 'specifics' found.");
        showElement(comfySpecificParamsContainer, 'flex');

        if (specifics.type === "gguf_unet") {
            showElement(ggufModelSelectorContainer, 'flex');
            if (typeof ggufModelFiles !== 'undefined' && typeof populateModelSelect === 'function') {
                let defaultGgufModel = (ggufModelFiles.length > 0 ? ggufModelFiles[0] : null);
                if (specifics.defaultModel) defaultGgufModel = specifics.defaultModel;
                else if (specifics.modelInputName && typeof comfyWorkflows !== 'undefined' && comfyWorkflows[selectedKey]) {
                    try {
                        const wfJson = JSON.parse(comfyWorkflows[selectedKey]); // comfyWorkflows from data.js
                        const modelFromWf = wfJson[specifics.modelNodeId]?.inputs?.[specifics.modelInputName];
                        if (modelFromWf && modelFromWf !== "[MODEL_NAME_PLACEHOLDER]") defaultGgufModel = modelFromWf;
                    } catch (e) { console.warn("Error parsing workflow for default GGUF model", e); }
                }
                populateModelSelect(ggufModelSelect, ggufModelFiles, defaultGgufModel);
            } else console.warn("[WorkflowChange] ggufModelFiles or populateModelSelect missing for GGUF.");
        }
        else if (specifics.type === "checkpoint") {
            showElement(checkpointModelSelectorContainer, 'flex');
            if (typeof checkpointModelFiles !== 'undefined' && typeof populateModelSelect === 'function') {
                let defaultCheckpointModel = (checkpointModelFiles.length > 0 ? checkpointModelFiles[0] : null);
                if (specifics.defaultModel) defaultCheckpointModel = specifics.defaultModel;
                 else if (specifics.modelInputName && typeof comfyWorkflows !== 'undefined' && comfyWorkflows[selectedKey]) {
                    try {
                        const wfJson = JSON.parse(comfyWorkflows[selectedKey]); // comfyWorkflows from data.js
                        const modelFromWf = wfJson[specifics.modelNodeId]?.inputs?.[specifics.modelInputName];
                        if (modelFromWf && modelFromWf !== "[MODEL_NAME_PLACEHOLDER]") defaultCheckpointModel = modelFromWf;
                    } catch (e) { console.warn("Error parsing workflow for default Checkpoint model", e); }
                }
                populateModelSelect(checkpointModelSelect, checkpointModelFiles, defaultCheckpointModel);
            } else console.warn("[WorkflowChange] checkpointModelFiles or populateModelSelect missing for Checkpoint.");
        }

        comfyImageWidth.value = specifics.defaultWidth || 512;
        comfyImageHeight.value = specifics.defaultHeight || 512;
        comfySteps.value = specifics.defaultSteps || 20;

        if (specifics.negativePromptNodeId && specifics.negativePromptInputName) {
            comfyNegativePrompt.value = specifics.defaultNegativePrompt || "";
            if (negPromptInputContainer) showElement(negPromptInputContainer, 'flex');
        } else {
            if (negPromptInputContainer) hideElement(negPromptInputContainer);
        }
        console.log(`[WorkflowChange] UI Values - W: ${comfyImageWidth.value}, H: ${comfyImageHeight.value}, Steps: ${comfySteps.value}`);
    } else {
        console.log("[WorkflowChange] No 'specifics' for selected workflow. Optional ComfyUI params hidden.");
    }
    console.log("--- handleWorkflowSelectionChange finished ---");
}

function toggleCollapse(button) {
    if (!button) return;
    const contentId = button.getAttribute('aria-controls');
    const content = document.getElementById(contentId);
    const icon = button.querySelector('.collapse-icon');

    if (content) {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!isExpanded));
        content.hidden = isExpanded;
        if (icon) {
            icon.classList.toggle('fa-chevron-up', !isExpanded);
            icon.classList.toggle('fa-chevron-down', isExpanded);
        }
    } else {
        console.warn(`Content element with ID "${contentId}" not found for toggleCollapse.`);
    }
}

function toggleContinuousOptions() {
    const enableContinuousGenCheckbox = document.getElementById('enableContinuousGen');
    const continuousOptionsDiv = document.getElementById('continuous-options');
    const sendPromptButton = document.getElementById('sendPromptButton');
    const enableSuccessivePromptCheckbox = document.getElementById('enableSuccessivePrompt');

    if (!enableContinuousGenCheckbox || !continuousOptionsDiv || !sendPromptButton || !enableSuccessivePromptCheckbox) {
        console.error("One or more DOM elements missing for toggleContinuousOptions.");
        return;
    }

    const isChecked = enableContinuousGenCheckbox.checked;
    continuousOptionsDiv.style.display = isChecked ? 'block' : 'none';
    sendPromptButton.innerHTML = isChecked
        ? '<i class="fas fa-play-circle"></i> Start Batch'
        : '<i class="fas fa-paper-plane"></i> Send Prompt';

    enableSuccessivePromptCheckbox.disabled = isChecked;
    if (isChecked) {
        enableSuccessivePromptCheckbox.checked = false;
    }
}

function createImageResultPlaceholder(endpointId, endpointName, runIdentifier) {
    const imageResultsGrid = document.getElementById('image-results-grid');
    if (!imageResultsGrid) {
        console.error("imageResultsGrid element not found for createImageResultPlaceholder.");
        return;
    }
    const resultItemId = `result-${endpointId}-r${String(runIdentifier).replace('/', '-')}`;

    if (document.getElementById(resultItemId)) {
        const itemDiv = document.getElementById(resultItemId);
        const statusMsg = itemDiv.querySelector('.status-message');
        if (statusMsg) {
            statusMsg.textContent = 'Sending request...';
            statusMsg.className = 'status-message loading';
        }
        return;
    }

    const itemDiv = document.createElement('div');
    itemDiv.id = resultItemId;
    itemDiv.className = 'image-result-item';
    itemDiv.dataset.endpointId = endpointId;

    itemDiv.innerHTML = `
        <h4>${endpointName}</h4>
        <p class="round-label">Run ${runIdentifier}</p>
        <img alt="${endpointName} Result (Run ${runIdentifier})" src="https://placehold.co/200x200/333333/666666?text=Waiting+R${runIdentifier}...">
        <p class="status-message loading">Preparing request...</p>
    `;

    const placeholderText = imageResultsGrid.querySelector('.placeholder-text');
    if (placeholderText) imageResultsGrid.innerHTML = '';

    if (imageResultsGrid.firstChild) {
        imageResultsGrid.insertBefore(itemDiv, imageResultsGrid.firstChild);
    } else {
        imageResultsGrid.appendChild(itemDiv);
    }
}

function updateImageResultItem(endpointId, endpointName, result, runIdentifier, statusClass = '', statusText = '') {
    const resultItemId = `result-${endpointId}-r${String(runIdentifier).replace('/', '-')}`;
    let itemDiv = document.getElementById(resultItemId);

    if (!itemDiv) {
        if (typeof createImageResultPlaceholder === 'function') { // Check if function exists
            createImageResultPlaceholder(endpointId, endpointName, runIdentifier);
            itemDiv = document.getElementById(resultItemId);
        }
        if (!itemDiv) {
            console.error(`FATAL: Could not create/find result item div for ${resultItemId}.`);
            return;
        }
    }

    if (result?.promptId) itemDiv.dataset.promptId = result.promptId;

    const img = itemDiv.querySelector('img');
    const statusMsg = itemDiv.querySelector('.status-message');
    const runLabel = itemDiv.querySelector('.round-label');

    if (runLabel) runLabel.textContent = `Run ${runIdentifier}`;

    let finalStatusClass = statusClass;
    let finalStatusText = statusText || result?.message || '';
    const placeholderBase = `https://placehold.co/200x200`;
    const runLabelPh = `R${runIdentifier}`;

    if (result?.error) {
        finalStatusClass = 'error';
        finalStatusText = `Error: ${String(result.error).substring(0, 150)}`;
        if (img) img.src = `${placeholderBase}/dc3545/ffffff?text=Error+${runLabelPh}`;
    } else if (result?.imageUrl) {
        finalStatusClass = 'success';
        finalStatusText = result.message || `Image received (${runLabelPh}).`;
        if (img) {
            img.src = result.imageUrl;
            img.onerror = () => {
                img.src = `${placeholderBase}/ffc107/000000?text=Load+Failed+${runLabelPh}`;
                if(statusMsg) {
                    statusMsg.textContent = 'Image URL load failed.';
                    statusMsg.className = 'status-message error';
                }
            };
        }
    } else if (result?.imageData) {
        finalStatusClass = 'success';
        finalStatusText = result.message || `Image data received (${runLabelPh}).`;
        if (img) img.src = result.imageData;
    } else if (result?.status === 'polling') {
        finalStatusClass = 'polling';
        finalStatusText = result.message || `Polling ComfyUI... (${runLabelPh})`;
        if (img && (!img.src || img.src.includes('placehold.co'))) {
            img.src = `${placeholderBase}/333333/666666?text=Polling+${runLabelPh}...`;
        }
    } else if (result?.status === 'pending' || statusClass === 'loading') {
        finalStatusClass = 'loading';
        finalStatusText = statusText || result?.message || `Processing (${runLabelPh})...`;
        if (img && (!img.src || img.src.includes('placehold.co'))) {
             img.src = `${placeholderBase}/333333/666666?text=Loading+${runLabelPh}...`;
        }
    } else {
        finalStatusClass = finalStatusClass || (result?.message ? 'success' : 'info');
        finalStatusText = finalStatusText || result?.message || `Request processed (${runLabelPh}).`;
        if (img && (!img.src || img.src.includes('placehold.co'))) {
            img.src = `${placeholderBase}/198754/ffffff?text=Status+OK+${runLabelPh}`;
        }
    }

    if (statusMsg) {
        statusMsg.textContent = finalStatusText;
        statusMsg.className = `status-message ${finalStatusClass}`;
    }
}

// It was decided to keep the llmEndpointSelect listener directly in addEventListeners (ui_setup)
// for simplicity as it directly manipulates a DOM element's style based on the select's value.
// If it were more complex, it would be here.
// function toggleCustomLlmEndpointUI(selectValue) {
//     const customLlmEndpointContainer = document.getElementById('customLlmEndpointContainer');
//     if (customLlmEndpointContainer) {
//         customLlmEndpointContainer.style.display = (selectValue === 'custom_llm') ? 'block' : 'none';
//     } else {
//         console.warn("customLlmEndpointContainer not found for UI toggle.");
//     }
// }
