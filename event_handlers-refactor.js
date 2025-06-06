// --- Event Handler Functions ---

function handleFeelLucky() {
    console.log("Handling 'Feel Lucky' click...");
    const mainMessageBox = document.getElementById('mainMessageBox');
    const generatedKeywordsTextarea = document.getElementById('generatedKeywords');
    const keywordsSummaryContainer = document.getElementById('keywords-summary-container');
    const apiGeneratedPromptTextarea = document.getElementById('apiGeneratedPrompt');

    try {
        const allCheckboxes = document.querySelectorAll('#keyword-details-content input[type="checkbox"]');
        if (!allCheckboxes.length) {
            if (typeof showMessage === 'function') showMessage(mainMessageBox, 'error', 'No keywords available to pick from.');
            return;
        }
        const quantityOption = document.querySelector('input[name="luckyQuantity"]:checked');
        let minQty = 10, maxQty = 20;
        if (quantityOption) {
            const [parsedMin, parsedMax] = quantityOption.value.split('-').map(Number);
            minQty = parsedMin || minQty;
            maxQty = parsedMax || maxQty;
        }
        const targetQty = Math.floor(Math.random() * (maxQty - minQty + 1)) + minQty;
        const actualQty = Math.min(targetQty, allCheckboxes.length);
        allCheckboxes.forEach(cb => cb.checked = false);
        const shuffledCheckboxes = Array.from(allCheckboxes).sort(() => Math.random() - 0.5);
        for (let i = 0; i < actualQty; i++) {
            if (shuffledCheckboxes[i]) shuffledCheckboxes[i].checked = true;
        }
        if (typeof generateKeywordString === 'function') generateKeywordString(); // from state_management
        if (apiGeneratedPromptTextarea) apiGeneratedPromptTextarea.value = "";
        if (typeof showMessage === 'function') showMessage(mainMessageBox, 'success', `Feeling lucky! Selected ${actualQty} random keywords.`);
        if (keywordsSummaryContainer) keywordsSummaryContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (error) {
        console.error("Error 'Feeling Lucky':", error);
        if (typeof showMessage === 'function' && mainMessageBox) showMessage(mainMessageBox, 'error', "Error randomizing keywords.");
    }
}

function handleGenerateKeywords() {
    console.log("Handling 'Generate Keywords' click...");
    const mainMessageBox = document.getElementById('mainMessageBox');
    const generatedKeywordsTextarea = document.getElementById('generatedKeywords');
    const keywordsSummaryContainer = document.getElementById('keywords-summary-container');
    const apiGeneratedPromptTextarea = document.getElementById('apiGeneratedPrompt');
    const keywordDetailsArea = document.getElementById('keyword-details-area');

    try {
        const keywords = (typeof generateKeywordString === 'function') ? generateKeywordString() : null; // from state_management
        if (apiGeneratedPromptTextarea) apiGeneratedPromptTextarea.value = "";
        if (keywords) {
            if (typeof showMessage === 'function') showMessage(mainMessageBox, 'success', "Keyword summary generated/updated.");
            if (keywordsSummaryContainer) keywordsSummaryContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            if (typeof showMessage === 'function') showMessage(mainMessageBox, 'error', "No keywords selected. Please choose some options below or try 'I'm Feeling Lucky'.");
            const detailsButton = document.querySelector('#keyword-details-area .collapse-toggle-button');
            const detailsContent = document.getElementById('keyword-details-content');
            if (detailsButton && detailsContent && detailsContent.hidden && typeof toggleCollapse === 'function') { // toggleCollapse from ui_updates
                toggleCollapse(detailsButton);
            }
            if (keywordDetailsArea) keywordDetailsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } catch (error) {
        console.error("Error 'Gen Keywords':", error);
        if (typeof showMessage === 'function' && mainMessageBox) showMessage(mainMessageBox, 'error', "Error generating keyword summary.");
    }
}

async function handleGenerateApiPromptClick() {
    console.log("Handling 'Generate API Prompt' click...");
    const generateApiPromptButton = document.getElementById('generateApiPromptButton');
    const configMessageBox = document.getElementById('configMessageBox');
    const mainMessageBox = document.getElementById('mainMessageBox');
    const apiGeneratedPromptContainer = document.getElementById('api-prompt-output-container');
    const configActionArea = document.querySelector('.config-action-area');

    if (!generateApiPromptButton || !configMessageBox || !mainMessageBox || !apiGeneratedPromptContainer || !configActionArea) {
        console.error("DOM element(s) missing for handleGenerateApiPromptClick."); return;
    }
    generateApiPromptButton.disabled = true;
    const originalButtonText = generateApiPromptButton.innerHTML;
    generateApiPromptButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    if (typeof showMessage === 'function') showMessage(configMessageBox, 'loading', 'Requesting prompt from LLM...', true); // showMessage from utility

    try {
        // handleGenerateApiPrompt (core logic) is expected to be in state_management.js
        const success = (typeof handleGenerateApiPrompt === 'function') ? await handleGenerateApiPrompt() : false;
        if (success) {
            apiGeneratedPromptContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (typeof hideMessage === 'function') hideMessage(configMessageBox); // hideMessage from utility
            if (typeof showMessage === 'function') showMessage(mainMessageBox, 'success', 'API prompt generated successfully!');
        } else {
            configActionArea.querySelector('.api-config')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } catch (error) {
        console.error("Unexpected error during API prompt generation click:", error);
        if (typeof showMessage === 'function') showMessage(configMessageBox, 'error', `Unexpected Error: ${error.message}`);
    } finally {
        generateApiPromptButton.disabled = false;
        generateApiPromptButton.innerHTML = originalButtonText;
    }
}

async function handleSendPromptClick() {
    console.log("Handling 'Send Prompt / Start Batch' click...");
    const sendPromptButton = document.getElementById('sendPromptButton');
    const stopBatchButton = document.getElementById('stopBatchButton');
    const enableContinuousGenCheckbox = document.getElementById('enableContinuousGen');
    const continuousGenCountInput = document.getElementById('continuousGenCount');
    const imageResultsGrid = document.getElementById('image-results-grid');
    const configMessageBox = document.getElementById('configMessageBox');
    const resultsMessageBox = document.getElementById('resultsMessageBox');

    if (!sendPromptButton || !stopBatchButton || !enableContinuousGenCheckbox || !continuousGenCountInput || !imageResultsGrid || !configMessageBox || !resultsMessageBox) {
        console.error("DOM element(s) missing for handleSendPromptClick."); return;
    }

    sendPromptButton.disabled = true;
    const originalButtonText = sendPromptButton.innerHTML;
    const isBatch = enableContinuousGenCheckbox.checked;
    let initialMessageUiBox = resultsMessageBox;

    if (isBatch) {
        sendPromptButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting Batch...';
        stopBatchButton.style.display = 'inline-flex';
        stopBatchButton.disabled = false;
        stopBatchButton.innerHTML = '<i class="fas fa-stop-circle"></i> Stop Batch';
        initialMessageUiBox = configMessageBox;
        if (typeof showMessage === 'function') showMessage(initialMessageUiBox, 'loading', 'Starting image generation batch...', true);
    } else {
        sendPromptButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        if (typeof showMessage === 'function') showMessage(resultsMessageBox, 'loading', 'Sending prompt to image service(s)...', true);
    }

    try {
        if (isBatch) {
            window.isContinuousModeActive = true; // Global state from main_script
            window.stopBatchFlag = false; // Global state
            window.continuousRunsRemaining = parseInt(continuousGenCountInput.value, 10) || 1; // Global state
            if (window.continuousRunsRemaining <= 0) window.continuousRunsRemaining = 1;
            imageResultsGrid.innerHTML = '';
            if (typeof startContinuousGenerationLoop === 'function') await startContinuousGenerationLoop(); // from state_management
            else throw new Error("startContinuousGenerationLoop function not defined.");
        } else {
            window.isContinuousModeActive = false; // Global state
            const runId = Date.now();
            // handleSendPromptToImageServices (core logic) is expected to be in state_management.js
            if (typeof handleSendPromptToImageServices === 'function') await handleSendPromptToImageServices(runId.toString(), null);
            else throw new Error("handleSendPromptToImageServices function not defined.");
        }
    } catch (error) {
        console.error("Error starting prompt sending process:", error);
        const errorMsgBox = isBatch ? configMessageBox : resultsMessageBox;
        if (typeof showMessage === 'function') showMessage(errorMsgBox, 'error', `Error: ${error.message}`);
        if (isBatch) window.isContinuousModeActive = false;
    } finally {
        if (!window.isContinuousModeActive) { // Check global state
            sendPromptButton.disabled = false;
            sendPromptButton.innerHTML = enableContinuousGenCheckbox.checked
                ? '<i class="fas fa-play-circle"></i> Start Batch'
                : '<i class="fas fa-paper-plane"></i> Send Prompt';
            stopBatchButton.style.display = 'none';
        }
    }
}

function resetForm() {
    console.log("Resetting form...");
    // Assumes many DOM elements are globally available or obtained here
    document.querySelectorAll('#keyword-details-area input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('custom-endpoints-list').innerHTML = '';
    const comfyCheckbox = document.getElementById('img-comfyui');
    if(comfyCheckbox) comfyCheckbox.checked = false;
    const comfyWorkflowSelect = document.getElementById('comfyWorkflowSelect');
    if (comfyWorkflowSelect) comfyWorkflowSelect.selectedIndex = 0;

    document.getElementById('generatedKeywords').value = "";
    document.getElementById('generatedKeywords').placeholder = "Click 'Generate Keywords' or 'I'm Feeling Lucky'...";
    document.getElementById('apiGeneratedPrompt').value = "";
    document.getElementById('apiGeneratedPrompt').placeholder = "Click 'Generate API Prompt' below...";

    if (typeof window.comfyPollingStates === 'object') { // Global state
        Object.values(window.comfyPollingStates).forEach(intervalId => clearInterval(intervalId));
        Object.keys(window.comfyPollingStates).forEach(key => delete window.comfyPollingStates[key]);
    }
    document.getElementById('image-results-grid').innerHTML = '<div class="placeholder-text" style="color: var(--text-placeholder); text-align: center; grid-column: 1 / -1; padding: 1rem 0;">Configure endpoints, then click \'Send Prompt\'...</div>';

    if(typeof hideMessage === 'function') { // from utility
        hideMessage(document.getElementById('mainMessageBox'));
        hideMessage(document.getElementById('configMessageBox'));
        hideMessage(document.getElementById('resultsMessageBox'));
    }
    document.getElementById('send-keywords').checked = true;
    const enableSuccessivePromptCheckbox = document.getElementById('enableSuccessivePrompt');
    enableSuccessivePromptCheckbox.checked = false;
    enableSuccessivePromptCheckbox.disabled = false;
    document.getElementById('llmEndpoint').selectedIndex = 0;
    document.getElementById('customLlmEndpointContainer').style.display = 'none';
    document.getElementById('customLlmEndpoint').value = '';
    document.getElementById('llmApiKey').value = '';
    document.getElementById('llmModelName').value = '';
    const defaultFormatRadio = document.getElementById('format-structured');
    if (defaultFormatRadio) defaultFormatRadio.checked = true;
    if (typeof updateSystemPrompt === 'function') updateSystemPrompt(); // from ui_setup

    const defaultLuckyQty = document.getElementById('lucky-qty-small');
    if (defaultLuckyQty) defaultLuckyQty.checked = true;
    document.getElementById('enableContinuousGen').checked = false;
    document.getElementById('continuous-options').style.display = 'none';
    document.getElementById('continuousGenCount').value = '5';
    const defaultContinuousMode = document.getElementById('mode-keep-keywords');
    if(defaultContinuousMode) defaultContinuousMode.checked = true;

    window.isContinuousModeActive = false; // Global state
    window.continuousRunsRemaining = 0; // Global state
    window.stopBatchFlag = false; // Global state

    const sendPromptButton = document.getElementById('sendPromptButton');
    sendPromptButton.disabled = false;
    sendPromptButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send Prompt';
    const stopBatchButton = document.getElementById('stopBatchButton');
    stopBatchButton.style.display = 'none';
    stopBatchButton.disabled = false;
    stopBatchButton.innerHTML = '<i class="fas fa-stop-circle"></i> Stop Batch';
    const generateApiPromptButton = document.getElementById('generateApiPromptButton');
    generateApiPromptButton.disabled = false;
    generateApiPromptButton.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Generate API Prompt';

    if (typeof handleWorkflowSelectionChange === 'function') handleWorkflowSelectionChange(); // from ui_updates

    window.scrollTo({ top: 0, behavior: 'smooth' });
    console.log("Form reset complete.");
}

function addCustomImageEndpointInput() {
    console.log("--- Add Custom Image Endpoint Input Triggered ---");
    const customEndpointsList = document.getElementById('custom-endpoints-list');
    if (!customEndpointsList) return;
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
    const localComfyUICheckbox = document.getElementById('img-comfyui');
    if (localComfyUICheckbox && localComfyUICheckbox.checked) {
        localComfyUICheckbox.checked = false;
        console.log("Local ComfyUI checkbox automatically deselected.");
    }
}

function handleRemoveCustomEndpoint(event) {
    const removeButton = event.target.closest('.remove-endpoint-btn');
    if (removeButton) {
        removeButton.closest('.custom-endpoint-item').remove();
    }
}

function handleStopBatch() {
    console.log("--- Stop Batch Button Clicked ---");
    const configMessageBox = document.getElementById('configMessageBox');
    const stopBatchButton = document.getElementById('stopBatchButton');

    window.stopBatchFlag = true; // Global state
    if(typeof showMessage === 'function' && configMessageBox && stopBatchButton) { // from utility
        showMessage(configMessageBox, 'warning', 'Stop requested. Finishing current image generation if in progress...');
        stopBatchButton.disabled = true;
        stopBatchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Stopping...';
    }
}

async function handleCopyClick(event) {
    const copyButton = event.target.closest('.copy-button');
    if (!copyButton) return;
    const targetId = copyButton.dataset.target;
    if (!targetId) return;
    const targetTextarea = document.getElementById(targetId);
    if (!targetTextarea || !targetTextarea.value) {
        console.warn("Textarea empty or not found, nothing to copy for targetId:", targetId);
        return;
    }
    const textToCopy = targetTextarea.value;
    const mainMessageBox = document.getElementById('mainMessageBox');
    const configMessageBox = document.getElementById('configMessageBox');

    try {
        await navigator.clipboard.writeText(textToCopy);
        const originalIcon = copyButton.innerHTML;
        copyButton.innerHTML = '<i class="fas fa-check"></i>';
        copyButton.classList.add('copied');
        let feedbackBox = mainMessageBox;
        let feedbackMessage = `Copied: ${targetTextarea.placeholder || 'Content'}`;
        if (targetId === 'apiGeneratedPrompt') feedbackMessage = 'API Prompt copied!';
        else if (targetId === 'generatedKeywords') feedbackMessage = 'Keywords copied!';
        else if (targetId === 'systemPrompt') { feedbackBox = configMessageBox; feedbackMessage = 'System Prompt copied!';}

        if (typeof showMessage === 'function') showMessage(feedbackBox, 'success', feedbackMessage); // from utility
        setTimeout(() => {
            copyButton.innerHTML = originalIcon;
            copyButton.classList.remove('copied');
        }, 1500);
    } catch (err) {
        console.error('Failed to copy text: ', err);
        let feedbackBox = mainMessageBox;
        if (targetId === 'systemPrompt') feedbackBox = configMessageBox;
        if (typeof showMessage === 'function') showMessage(feedbackBox, 'error', 'Failed to copy text.');
    }
}
