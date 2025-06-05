// --- State Management and Core Logic Functions ---

function generateKeywordString() {
    const mainMessageBox = document.getElementById('mainMessageBox'); // Assumed global or passed
    const generatedKeywordsTextarea = document.getElementById('generatedKeywords'); // Assumed global or passed

    if (typeof hideMessage === 'function' && mainMessageBox) hideMessage(mainMessageBox); // from utility
    if (!generatedKeywordsTextarea) {
        console.error("generatedKeywordsTextarea not found for generateKeywordString.");
        return null;
    }
    // dropdownData from data.js, getCheckedValues from utility
    if (typeof dropdownData === 'undefined' || typeof getCheckedValues !== 'function') {
        console.error("dropdownData or getCheckedValues function not available for generateKeywordString.");
        generatedKeywordsTextarea.value = "";
        generatedKeywordsTextarea.placeholder = "Error: Keyword data or functions missing.";
        return null;
    }

    let contextModifierParts = [];
    for (const categoryId in dropdownData) {
        const checkedValues = getCheckedValues(categoryId);
        if (checkedValues.length > 0) {
            contextModifierParts.push(...checkedValues);
        }
    }

    if (contextModifierParts.length === 0) {
        const placeholderText = "No keywords selected. Please choose some options in the details section below or try 'I'm Feeling Lucky'!";
        generatedKeywordsTextarea.value = "";
        generatedKeywordsTextarea.placeholder = placeholderText;
        return null;
    }

    const finalString = contextModifierParts.join(", ");
    generatedKeywordsTextarea.value = finalString;
    generatedKeywordsTextarea.placeholder = "Keywords selected...";
    return finalString;
}

async function handleGenerateApiPrompt() { // Core logic for actual generation
    const generatedKeywordsTextarea = document.getElementById('generatedKeywords');
    const apiGeneratedPromptTextarea = document.getElementById('apiGeneratedPrompt');
    const keywordsSummaryContainer = document.getElementById('keywords-summary-container');
    const mainMessageBox = document.getElementById('mainMessageBox');
    const configMessageBox = document.getElementById('configMessageBox');

    if (!generatedKeywordsTextarea || !apiGeneratedPromptTextarea || !keywordsSummaryContainer || !mainMessageBox || !configMessageBox) {
        console.error("DOM element(s) missing for handleGenerateApiPrompt core logic.");
        return false;
    }
    // callLLMForPrompt from api_calls, showMessage from utility
    if (typeof callLLMForPrompt !== 'function' || typeof showMessage !== 'function') {
        console.error("Required function(s) (callLLMForPrompt or showMessage) not available for handleGenerateApiPrompt.");
        if (apiGeneratedPromptTextarea) apiGeneratedPromptTextarea.value = "Critical error: LLM call function missing.";
        return false;
    }

    const keywordString = generatedKeywordsTextarea.value.trim();
    if (!keywordString || keywordString.startsWith("No keywords selected")) {
        showMessage(mainMessageBox, 'error', "Keyword Summary is empty. Generate keywords first.");
        keywordsSummaryContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
    }

    apiGeneratedPromptTextarea.value = "";
    // Loading message is typically shown by the event handler that calls this.

    try {
        const finalPrompt = await callLLMForPrompt(keywordString, configMessageBox);
        if (finalPrompt !== null) {
            apiGeneratedPromptTextarea.value = finalPrompt;
            return true;
        } else {
            apiGeneratedPromptTextarea.value = "LLM generation failed. See message in Config/LLM section.";
            return false;
        }
    } catch (error) {
        console.error("Error during LLM prompt generation (handleGenerateApiPrompt core):", error);
        apiGeneratedPromptTextarea.value = `LLM Generation Error: ${error.message}`;
        showMessage(configMessageBox, 'error', `LLM Error: ${error.message}`);
        return false;
    }
}

async function handleSendPromptToImageServices(runIdentifier, promptForRun) {
    const resultsMessageBox = document.getElementById('resultsMessageBox');
    const configMessageBox = document.getElementById('configMessageBox');
    const apiGeneratedPromptTextarea = document.getElementById('apiGeneratedPrompt');
    const generatedKeywordsTextarea = document.getElementById('generatedKeywords');
    const imageResultsGrid = document.getElementById('image-results-grid');
    const enableSuccessivePromptCheckbox = document.getElementById('enableSuccessivePrompt');
    const keywordsSummaryContainer = document.getElementById('keywords-summary-container');
    const apiGeneratedPromptContainer = document.getElementById('api-prompt-output-container');
    const configActionArea = document.querySelector('.config-action-area');

    // hideMessage from utility, getSelectedImageEndpoints from this file
    // createImageResultPlaceholder, updateImageResultItem from ui_updates
    // callImageGenerationAPI, callLLMForPrompt from api_calls
    // waitForPollingToComplete from this file
    // showMessage from utility
    // Global states: window.isContinuousModeActive, window.comfyPollingStates (read/write)

    if (typeof hideMessage === 'function' && resultsMessageBox) hideMessage(resultsMessageBox);

    const endpointsToRun = (typeof getSelectedImageEndpoints === 'function') ? getSelectedImageEndpoints() : [];
    if (endpointsToRun.length === 0) {
        const msgBox = window.isContinuousModeActive ? configMessageBox : resultsMessageBox;
        if (typeof showMessage === 'function') showMessage(msgBox, 'error', 'No image generation services selected.');
        if (!window.isContinuousModeActive && configActionArea) {
            configActionArea.querySelector('.image-gen-config')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        throw new Error("No image generation endpoints selected.");
    }

    if (!promptForRun) {
        const promptTypeRadio = document.querySelector('input[name="promptToSend"]:checked');
        const promptType = promptTypeRadio ? promptTypeRadio.value : 'keywords';
        promptForRun = (promptType === 'api')
            ? apiGeneratedPromptTextarea.value.trim()
            : generatedKeywordsTextarea.value.trim();

        if (!promptForRun || promptForRun.startsWith("No keywords") || promptForRun.startsWith("LLM error") || promptForRun === "LLM generation failed.") {
            const errorMsg = `Selected prompt ('${promptType === 'api' ? 'API Gen' : 'Keywords'}') empty/invalid.`;
            const msgBox = window.isContinuousModeActive ? configMessageBox : resultsMessageBox;
            if (typeof showMessage === 'function') showMessage(msgBox, 'error', errorMsg);
            if (!window.isContinuousModeActive) {
                 if (promptType === 'api' && apiGeneratedPromptContainer) apiGeneratedPromptContainer.scrollIntoView({behavior: 'smooth', block: 'center'});
                 else if (keywordsSummaryContainer) keywordsSummaryContainer.scrollIntoView({behavior: 'smooth', block: 'center'});
            }
            throw new Error(errorMsg);
        }
    }

    const isBatchRun = String(runIdentifier).includes('/');
    if (!isBatchRun || (isBatchRun && String(runIdentifier).startsWith('1/'))) {
        if(imageResultsGrid) imageResultsGrid.innerHTML = '';
    }

    const runLabel = isBatchRun ? `Batch ${runIdentifier}` : `Run ${runIdentifier}`;
    if (typeof showMessage === 'function' && resultsMessageBox) showMessage(resultsMessageBox, 'loading', `${runLabel}: Sending to ${endpointsToRun.length} service(s)...`, true);

    endpointsToRun.forEach(endpoint => {
        if (typeof createImageResultPlaceholder === 'function') {
            createImageResultPlaceholder(endpoint.id, endpoint.name, runIdentifier);
        }
    });

    const promises = endpointsToRun.map(endpoint =>
        (typeof callImageGenerationAPI === 'function' ? callImageGenerationAPI(promptForRun, endpoint, runIdentifier) : Promise.reject(new Error("callImageGenerationAPI not found")))
            .then(result => ({ ...result, statusFulfilled: true}))
            .catch(error => ({ endpointId: endpoint.id, endpointName: endpoint.name, statusFulfilled: false, reason: error }))
    );
    const settledResults = await Promise.allSettled(promises);
    let hasImmediateErrors = false;
    let activePollingPromptIds = [];

    settledResults.forEach(settledResult => {
        if (settledResult.status === 'fulfilled') {
            const R = settledResult.value;
            if (!R.statusFulfilled) {
                hasImmediateErrors = true;
                if (typeof updateImageResultItem === 'function') updateImageResultItem(R.endpointId, R.endpointName, { error: R.reason?.message || R.reason || "Unknown error" }, runIdentifier);
            } else if (R.status === 'polling') {
                activePollingPromptIds.push(R.promptId);
            } else if (R.error) {
                hasImmediateErrors = true;
                 if (typeof updateImageResultItem === 'function') updateImageResultItem(R.endpointId, R.endpointName, R, runIdentifier);
            } else {
                 if (typeof updateImageResultItem === 'function') updateImageResultItem(R.endpointId, R.endpointName, R, runIdentifier);
            }
        } else {
            hasImmediateErrors = true;
             if (typeof updateImageResultItem === 'function') updateImageResultItem(settledResult.reason?.endpointId || `unknown-ep-err-${Date.now()}`, settledResult.reason?.endpointName || 'Unknown Endpoint', { error: settledResult.reason?.message || "Unhandled rejection" }, runIdentifier);
        }
    });

    let completionMessage = `${runLabel} processing...`;
    let messageType = 'loading';
    if (activePollingPromptIds.length > 0) {
        completionMessage = `${runLabel}: Waiting for ${activePollingPromptIds.length} ComfyUI job(s)...`;
        if (hasImmediateErrors) completionMessage += " (Some other endpoints failed)";
        if (typeof showMessage === 'function' && resultsMessageBox) showMessage(resultsMessageBox, 'loading', completionMessage, true);
    } else if (!isBatchRun) {
        if (hasImmediateErrors) {
            completionMessage = `${runLabel} finished with errors.`; messageType = 'error';
        } else {
            completionMessage = `${runLabel} complete.`; messageType = 'success';
        }
        if (typeof showMessage === 'function' && resultsMessageBox) showMessage(resultsMessageBox, messageType, completionMessage, false);
    }

    if (!isBatchRun && enableSuccessivePromptCheckbox && enableSuccessivePromptCheckbox.checked) {
        const promptSourceForRound2 = generatedKeywordsTextarea.value.trim();
        if (promptSourceForRound2 && !promptSourceForRound2.startsWith("No keywords selected")) {
            try {
                const promptForLLMRound2 = promptSourceForRound2 + "\n\n---\nGenerate a distinct but related variation based on the keywords above.";
                const secondApiPrompt = (typeof callLLMForPrompt === 'function') ? await callLLMForPrompt(promptForLLMRound2, configMessageBox) : null;
                if (secondApiPrompt !== null) {
                    await handleSendPromptToImageServices(`${runIdentifier}-R2`, secondApiPrompt);
                } else throw new Error("LLM failed for Round 2 prompt.");
            } catch (error) {
                if (typeof showMessage === 'function' && resultsMessageBox) showMessage(resultsMessageBox, 'error', `Failed Round 2: ${error.message || 'Unknown error'}`);
            }
        } else {
            if (typeof showMessage === 'function' && resultsMessageBox) showMessage(resultsMessageBox, 'error', "Could not start Round 2: Keywords missing.");
        }
    }

    if (activePollingPromptIds.length > 0) {
        if (typeof waitForPollingToComplete === 'function') {
            await waitForPollingToComplete(activePollingPromptIds);
            if (!isBatchRun && resultsMessageBox && typeof showMessage === 'function') {
                let finalPollingErrors = false;
                activePollingPromptIds.forEach(pid => {
                    const resultDiv = document.querySelector(`.image-result-item[data-prompt-id="${pid}"]`);
                    if (resultDiv?.querySelector('.status-message.error')) finalPollingErrors = true;
                });
                let finalMsg = `${runLabel} ComfyUI job(s) finished.`;
                let finalType = 'success';
                if (finalPollingErrors || hasImmediateErrors) {
                    finalMsg = `${runLabel} finished, but some errors occurred.`; finalType = 'error';
                }
                showMessage(resultsMessageBox, finalType, finalMsg, false);
            }
        } else console.warn("waitForPollingToComplete function not defined.");
    }
    console.log(`${runLabel} processing and R2 (if any) finished.`);
    return !hasImmediateErrors && activePollingPromptIds.length === 0;
}

async function startContinuousGenerationLoop() {
    const continuousGenCountInput = document.getElementById('continuousGenCount');
    const configMessageBox = document.getElementById('configMessageBox');
    const sendPromptButton = document.getElementById('sendPromptButton');
    const stopBatchButton = document.getElementById('stopBatchButton');
    const generatedKeywordsTextarea = document.getElementById('generatedKeywords'); // Used by sub-functions
    const apiGeneratedPromptTextarea = document.getElementById('apiGeneratedPrompt'); // Used by sub-functions

    // Global states: window.stopBatchFlag, window.continuousRunsRemaining, window.isContinuousModeActive, window.currentContinuousMode
    // Functions: showMessage (utility), handleFeelLucky (event_handlers), handleGenerateKeywords (event_handlers),
    // handleGenerateApiPrompt (this file), handleSendPromptToImageServices (this file),
    // updateImageResultItem (ui_updates), toggleContinuousOptions (ui_updates)

    console.log(`--- Continuous Loop: Remaining=${window.continuousRunsRemaining}, StopFlag=${window.stopBatchFlag} ---`);

    if (window.stopBatchFlag || window.continuousRunsRemaining <= 0) {
        if(typeof showMessage === 'function' && configMessageBox) showMessage(configMessageBox, 'success', `Batch ${window.stopBatchFlag ? 'stopped' : 'complete'}.`);
        window.isContinuousModeActive = false;
        window.stopBatchFlag = false;
        if(sendPromptButton) { sendPromptButton.disabled = false; sendPromptButton.innerHTML = '<i class="fas fa-play-circle"></i> Start Batch'; }
        if(stopBatchButton) stopBatchButton.style.display = 'none';
        if(typeof toggleContinuousOptions === 'function') toggleContinuousOptions();
        return;
    }

    const totalRuns = parseInt(continuousGenCountInput.value, 10) || 1;
    const currentRunNumber = totalRuns - window.continuousRunsRemaining + 1;
    const runIdentifier = `${currentRunNumber}/${totalRuns}`;
    window.currentContinuousMode = document.querySelector('input[name="continuousGenMode"]:checked')?.value || 'keep_keywords_new_api';

    if(typeof showMessage === 'function' && configMessageBox) showMessage(configMessageBox, 'loading', `Running Batch ${runIdentifier} (Mode: ${window.currentContinuousMode})...`, true);

    let promptForThisRun = '';
    try {
        switch (window.currentContinuousMode) {
            case 'new_lucky_api':
                if(typeof handleFeelLucky === 'function') handleFeelLucky(); else throw new Error("handleFeelLucky missing");
                const luckyKeywords = generatedKeywordsTextarea.value;
                if (!luckyKeywords || luckyKeywords.startsWith("No keywords")) throw new Error("'Feeling Lucky' failed.");
                if(typeof handleGenerateApiPrompt !== 'function') throw new Error("handleGenerateApiPrompt missing");
                if (!await handleGenerateApiPrompt()) throw new Error("LLM failed for lucky keywords.");
                promptForThisRun = apiGeneratedPromptTextarea.value;
                break;
            case 'keep_keywords_new_api':
                let currentKeywords = generatedKeywordsTextarea.value.trim();
                if (!currentKeywords || currentKeywords.startsWith("No keywords selected")) {
                    if(typeof handleGenerateKeywords === 'function') handleGenerateKeywords(); else throw new Error("handleGenerateKeywords missing");
                    currentKeywords = generatedKeywordsTextarea.value.trim();
                    if (!currentKeywords || currentKeywords.startsWith("No keywords selected")) throw new Error("Keywords empty/failed to generate.");
                }
                if(typeof handleGenerateApiPrompt !== 'function') throw new Error("handleGenerateApiPrompt missing");
                if (!await handleGenerateApiPrompt()) throw new Error("LLM failed for existing keywords.");
                promptForThisRun = apiGeneratedPromptTextarea.value;
                break;
            default: throw new Error(`Unknown continuous mode: ${window.currentContinuousMode}`);
        }
        if (!promptForThisRun || promptForThisRun.startsWith("LLM error")) throw new Error(`Invalid prompt for batch: ${promptForThisRun.substring(0,100)}`);

        if(typeof handleSendPromptToImageServices !== 'function') throw new Error("handleSendPromptToImageServices missing");
        await handleSendPromptToImageServices(runIdentifier, promptForThisRun);

        if (!window.stopBatchFlag) {
            window.continuousRunsRemaining--;
            setTimeout(startContinuousGenerationLoop, 1500);
        } else {
            startContinuousGenerationLoop();
        }
    } catch (error) {
        if(typeof showMessage === 'function' && configMessageBox) showMessage(configMessageBox, 'error', `Batch Error (${runIdentifier}): ${error.message.substring(0,100)}. Stopping.`);
        if(typeof updateImageResultItem === 'function') updateImageResultItem(`batch-error-${runIdentifier}`, `Batch ${runIdentifier}`, {error: `Setup failed: ${error.message.substring(0,100)}`}, runIdentifier);
        window.isContinuousModeActive = false; window.stopBatchFlag = true;
        if(sendPromptButton) { sendPromptButton.disabled = false; sendPromptButton.innerHTML = '<i class="fas fa-play-circle"></i> Start Batch'; }
        if(stopBatchButton) stopBatchButton.style.display = 'none';
        if(typeof toggleContinuousOptions === 'function') toggleContinuousOptions();
    }
}

async function waitForPollingToComplete(promptIdsToWaitFor) {
    if (!promptIdsToWaitFor || promptIdsToWaitFor.length === 0) return Promise.resolve();
    // Assumes comfyPollingStates is global (window.comfyPollingStates)
    if (typeof window.comfyPollingStates === 'undefined') window.comfyPollingStates = {};

    const pollingPromises = promptIdsToWaitFor.map(promptId => {
        return new Promise((resolve) => {
            if (!window.comfyPollingStates[promptId]) { resolve(); return; }
            const checkInterval = setInterval(() => {
                if (!window.comfyPollingStates[promptId]) {
                    clearInterval(checkInterval); resolve();
                }
            }, 500);
        });
    });
    return Promise.all(pollingPromises).then(() => {
        console.log("All specified ComfyUI polling has concluded for this run.");
    });
}

function getSelectedImageEndpoints() {
    const imageEndpointsContainer = document.getElementById('image-endpoints');
    const customEndpointsList = document.getElementById('custom-endpoints-list');
    const resultsMessageBox = document.getElementById('resultsMessageBox');

    if (!imageEndpointsContainer || !customEndpointsList) { return []; }
    const endpoints = [];
    const comfyCheckbox = imageEndpointsContainer.querySelector('#img-comfyui:checked');
    if (comfyCheckbox) {
        endpoints.push({
            id: comfyCheckbox.id, value: comfyCheckbox.value,
            name: comfyCheckbox.parentElement?.querySelector('label[for="img-comfyui"]')?.textContent?.split('<small>')[0].trim() || 'Local ComfyUI',
            url: comfyCheckbox.dataset.endpoint || 'http://127.0.0.1:8188',
            requiresKey: false
        });
    }
    const customCheckboxes = customEndpointsList.querySelectorAll('input[type="checkbox"]:checked');
    customCheckboxes.forEach(checkbox => {
        const inputId = checkbox.dataset.inputId;
        const inputElement = document.getElementById(inputId);
        const url = inputElement ? inputElement.value.trim() : null;
        if (url) {
            if (!url.match(/^https?:\/\//)) {
                if(typeof showMessage === 'function' && resultsMessageBox) showMessage(resultsMessageBox, 'warning', `Skipping invalid custom URL: ${url.substring(0,30)}...`); // from utility
                return;
            }
            let name = 'Custom Endpoint';
            try { name = `Custom: ${new URL(url).hostname}`; } catch (e) { name = `Custom: ${url.substring(0, 20)}...`; }
            endpoints.push({ id: inputId, value: 'custom_image', name: name, url: url, requiresKey: false });
        }
    });
    return endpoints;
}
