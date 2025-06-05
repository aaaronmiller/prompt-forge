// --- UI Setup Functions ---

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

function populateWorkflowSelect() {
    const comfyWorkflowSelect = document.getElementById('comfyWorkflowSelect'); // Added
    if (!comfyWorkflowSelect || typeof comfyWorkflows === 'undefined') return;
    comfyWorkflowSelect.innerHTML = '<option value="">-- Select --</option>'; // Clear existing options

    let defaultWorkflowKey = null; // Variable to hold your desired default

    for (const key in comfyWorkflows) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key.replace(/_/g, ' ').replace('WORKFLOW', '').trim() || key;
        comfyWorkflowSelect.appendChild(option);

        if (key === "GGUF_COMFY_WORKFLOW") {
            defaultWorkflowKey = key;
        }
    }

    if (defaultWorkflowKey) {
        comfyWorkflowSelect.value = defaultWorkflowKey;
        console.log(`Default workflow set to: ${defaultWorkflowKey}`);
    } else if (Object.keys(comfyWorkflows).length > 0) {
        console.warn(`Default workflow "GGUF_COMFY_WORKFLOW" not found in comfyWorkflows data. Ensure the key matches.`);
    }
}

function initializeCollapsibleSections() {
    const collapseToggleButtons = document.querySelectorAll('.collapse-toggle-button'); // Added
    collapseToggleButtons.forEach(button => {
        const contentId = button.getAttribute('aria-controls');
        const content = document.getElementById(contentId);
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        if (content) {
            content.hidden = !isExpanded;
        }
        const icon = button.querySelector('.collapse-icon');
        if(icon) {
            icon.classList.remove('fa-chevron-up', 'fa-chevron-down');
            icon.classList.add(isExpanded ? 'fa-chevron-up' : 'fa-chevron-down');
        }
    });
}

function updateSystemPrompt() {
    const systemPromptTextarea = document.getElementById('systemPrompt'); // Added
    const selectedFormat = document.querySelector('input[name="promptFormat"]:checked')?.value || 'structured';
    // systemPromptTemplates needs to be globally available (from main_script)
    if (typeof systemPromptTemplates !== 'undefined' && systemPromptTemplates[selectedFormat]) {
        systemPromptTextarea.value = systemPromptTemplates[selectedFormat];
        console.log(`System prompt updated for format: ${selectedFormat}`);
    } else {
        console.error(`System prompt template for format "${selectedFormat}" not found.`);
        systemPromptTextarea.value = (typeof systemPromptTemplates !== 'undefined' && systemPromptTemplates['auto']) || "Error loading system prompt template.";
    }
}

function addEventListeners() {
    // Ensure all these DOM elements are queryable at the time this function is called.
    // If called from DOMContentLoaded in main_script, they should be.
    const llmEndpointSelect = document.getElementById('llmEndpoint');
    const customLlmEndpointContainer = document.getElementById('customLlmEndpointContainer');
    const feelLuckyButton = document.getElementById('feelLuckyButton');
    const generateKeywordsButton = document.getElementById('generateKeywordsButton');
    const generateApiPromptButton = document.getElementById('generateApiPromptButton');
    const sendPromptButton = document.getElementById('sendPromptButton');
    const startNewPromptButton = document.getElementById('startNewPromptButton');
    const downloadResultsButton = document.getElementById('downloadResultsButton');
    const addCustomEndpointBtn = document.getElementById('add-custom-endpoint-btn');
    const customEndpointsList = document.getElementById('custom-endpoints-list');
    const collapseToggleButtons = document.querySelectorAll('.collapse-toggle-button');
    const enableContinuousGenCheckbox = document.getElementById('enableContinuousGen');
    const stopBatchButton = document.getElementById('stopBatchButton');
    const promptFormatRadios = document.querySelectorAll('input[name="promptFormat"]');
    const pageContainer = document.getElementById('container');
    const comfyWorkflowSelect = document.getElementById('comfyWorkflowSelect');


    if (llmEndpointSelect && customLlmEndpointContainer) {
        llmEndpointSelect.addEventListener('change', function() { // 'this' refers to llmEndpointSelect
            // toggleCustomLlmEndpointUI(this.value); // Ideal if toggleCustomLlmEndpointUI is in ui_updates
             customLlmEndpointContainer.style.display = (this.value === 'custom_llm') ? 'block' : 'none';
        });
    }
    if (feelLuckyButton) feelLuckyButton.addEventListener('click', handleFeelLucky);
    if (generateKeywordsButton) generateKeywordsButton.addEventListener('click', handleGenerateKeywords);
    if (generateApiPromptButton) generateApiPromptButton.addEventListener('click', handleGenerateApiPromptClick);
    if (sendPromptButton) sendPromptButton.addEventListener('click', handleSendPromptClick);
    if (startNewPromptButton) startNewPromptButton.addEventListener('click', resetForm);
    if (downloadResultsButton) downloadResultsButton.addEventListener('click', downloadResultsText);
    if (addCustomEndpointBtn) addCustomEndpointBtn.addEventListener('click', addCustomImageEndpointInput);
    if (customEndpointsList) customEndpointsList.addEventListener('click', handleRemoveCustomEndpoint); // Delegated

    collapseToggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (typeof toggleCollapse === 'function') toggleCollapse(button); // toggleCollapse is in ui_updates
            else console.error("toggleCollapse function not found");
        });
    });
    if (enableContinuousGenCheckbox) {
        enableContinuousGenCheckbox.addEventListener('change', () => {
            if (typeof toggleContinuousOptions === 'function') toggleContinuousOptions(); // in ui_updates
            else console.error("toggleContinuousOptions function not found");
        });
    }
    if (stopBatchButton) stopBatchButton.addEventListener('click', handleStopBatch);

    promptFormatRadios.forEach(radio => {
        radio.addEventListener('change', updateSystemPrompt); // updateSystemPrompt is in this file
    });
    if (pageContainer) pageContainer.addEventListener('click', handleCopyClick); // Delegated copy listener

    if (comfyWorkflowSelect) { // comfyWorkflowSelect is defined above
        comfyWorkflowSelect.addEventListener('change', () => {
            if (typeof handleWorkflowSelectionChange === 'function') handleWorkflowSelectionChange(); // in ui_updates
            else console.error("handleWorkflowSelectionChange function not found");
        });
    }
}
