// --- API Call Functions ---

async function callLLMForPrompt(keywordPromptForLLM, targetMessageBox) {
    const llmEndpointSelect = document.getElementById('llmEndpoint');
    const llmModelNameInput = document.getElementById('llmModelName');
    const systemPromptTextarea = document.getElementById('systemPrompt');
    const llmApiKeyInput = document.getElementById('llmApiKey');
    const customLlmEndpointInput = document.getElementById('customLlmEndpoint');
    const mainMessageBox = document.getElementById('mainMessageBox'); // Fallback

    if (!llmEndpointSelect || !llmModelNameInput || !systemPromptTextarea || !llmApiKeyInput || !customLlmEndpointInput) {
        console.error("LLM config elements missing for callLLMForPrompt.");
        if (typeof showMessage === 'function') showMessage(targetMessageBox || mainMessageBox, 'error', 'LLM Error: Missing config elements.');
        return null;
    }

    const selectedLlmEndpointValue = llmEndpointSelect.value;
    const modelName = llmModelNameInput.value.trim();
    let systemPrompt = systemPromptTextarea.value;
    let apiKey = llmApiKeyInput.value.trim();
    let requestBody;
    let requestHeaders = { 'Content-Type': 'application/json' };
    let endpointUrl = selectedLlmEndpointValue;
    let apiUrl;

    console.log(`Calling LLM. Endpoint Type: ${selectedLlmEndpointValue}, Model: ${modelName || 'Default'}`);

    try {
        if (endpointUrl.includes('generativelanguage.googleapis.com')) { // Gemini
            if (typeof storedApiKeys !== 'undefined' && storedApiKeys.gemini) { // storedApiKeys from data.js
                apiKey = storedApiKeys.gemini;
            }
            if (!apiKey) { throw new Error("Gemini API Key is missing."); }
            const geminiModel = modelName || "gemini-1.5-flash-latest";
            apiUrl = `${endpointUrl}/models/${geminiModel}:generateContent?key=${apiKey}`;
            requestBody = {
                contents: [{ role: "user", parts: [{ text: keywordPromptForLLM }] }],
                ...(systemPrompt && { systemInstruction: { role: "system", parts: [{ text: systemPrompt }] } }),
                generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
            };
        } else if (endpointUrl.includes('localhost:1234')) { // LM Studio
            apiUrl = `${endpointUrl}/chat/completions`;
            requestBody = {
                model: modelName || "loaded-model", // LM Studio might not always need model if one is pre-loaded
                messages: [
                    ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
                    { role: "user", content: keywordPromptForLLM }
                ],
                temperature: 0.7, max_tokens: 400
            };
            if (apiKey) requestHeaders['Authorization'] = `Bearer ${apiKey}`;
        } else if (endpointUrl.includes('localhost:11434')) { // Ollama
            apiUrl = `${endpointUrl}/chat/completions`;
            if (!modelName) { throw new Error("Missing Ollama Model Name."); }
            requestBody = {
                model: modelName,
                messages: [
                    ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
                    { role: "user", content: keywordPromptForLLM }
                ],
                stream: false,
                options: { temperature: 0.7 }
            };
            if (apiKey) requestHeaders['Authorization'] = `Bearer ${apiKey}`;
        } else { // Custom LLM
            if (selectedLlmEndpointValue === 'custom_llm') {
                endpointUrl = customLlmEndpointInput.value.trim();
                if (!endpointUrl) throw new Error("Custom LLM Endpoint URL is missing.");
            }
            apiUrl = endpointUrl;
            if (!apiUrl) throw new Error("LLM Endpoint URL is invalid.");
            if (!apiUrl.endsWith('/chat/completions') && !apiUrl.endsWith('/v1/chat/completions')) {
                apiUrl = apiUrl.replace(/\/$/, '') + '/v1/chat/completions';
            }
            requestBody = {
                model: modelName || "custom-llm-model",
                messages: [
                    ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
                    { role: "user", content: keywordPromptForLLM }
                ],
                temperature: 0.7, max_tokens: 400, stream: false
            };
            if (apiKey) requestHeaders['Authorization'] = `Bearer ${apiKey}`;
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: requestHeaders,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            let errorBodyText = await response.text();
            let errMsg = `HTTP ${response.status} ${response.statusText}`;
            try {
                const errorJson = JSON.parse(errorBodyText);
                errMsg = errorJson.error?.message || errorJson.message || errorJson.error || JSON.stringify(errorJson);
            } catch (_) { errMsg = errorBodyText || errMsg; }
            throw new Error(`LLM API Error: ${errMsg.substring(0,300)}`);
        }
        const responseData = await response.json();
        let generatedText = "";
        if (apiUrl.includes('generativelanguage.googleapis.com')) {
            generatedText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
        } else {
            generatedText = responseData.choices?.[0]?.message?.content;
        }
        if (generatedText === undefined || generatedText === null) {
            throw new Error("LLM response format unexpected or empty text.");
        }
        return (generatedText || "").trim();
    } catch (error) {
        console.error("LLM Call Error:", error);
        if (typeof showMessage === 'function') showMessage(targetMessageBox || mainMessageBox, 'error', `LLM Error: ${error.message}`);
        return null;
    }
}

async function callImageGenerationAPI(promptToSend, endpointConfig, runIdentifier) {
    console.log(`Run ${runIdentifier}: Sending to ${endpointConfig.name} (${endpointConfig.id})`);
    const comfyWorkflowSelect = document.getElementById('comfyWorkflowSelect');
    const comfyImageWidth = document.getElementById('comfyImageWidth');
    const comfyImageHeight = document.getElementById('comfyImageHeight');
    const comfySteps = document.getElementById('comfySteps');
    const comfyNegativePrompt = document.getElementById('comfyNegativePrompt');
    const ggufModelSelect = document.getElementById('ggufModelSelect');
    const checkpointModelSelect = document.getElementById('checkpointModelSelect');
    const llmApiKeyInput = document.getElementById('llmApiKey'); // For custom endpoint API key

    let requestBody;
    let requestHeaders = { 'Content-Type': 'application/json' };
    let apiUrl = endpointConfig.url;
    const method = 'POST';

    let result = {
        endpointId: endpointConfig.id,
        endpointName: endpointConfig.name,
        message: `Sending request...`,
        imageUrl: null, imageData: null, error: null,
        status: 'pending', promptId: null
    };

    if (typeof updateImageResultItem === 'function') { // from ui_updates
        updateImageResultItem(endpointConfig.id, endpointConfig.name, result, runIdentifier, 'loading', 'Sending request...');
    }

    try {
        switch (endpointConfig.value) {
            case 'local_comfyui': {
                if (!comfyWorkflowSelect || !comfyImageWidth || !comfyImageHeight || !comfySteps || !comfyNegativePrompt || !ggufModelSelect || !checkpointModelSelect) {
                    throw new Error("ComfyUI DOM elements missing for API call.");
                }
                 // comfyWorkflows, comfyWorkflowSpecifics from data.js or main_script
                 // generateUUID, generateRandomSeed from utility_functions
                if (typeof comfyWorkflows === 'undefined' || typeof comfyWorkflowSpecifics === 'undefined' ||
                    typeof generateUUID !== 'function' || typeof generateRandomSeed !== 'function') {
                     throw new Error("ComfyUI workflow data or helper functions missing.");
                }

                const serverAddress = endpointConfig.url || 'http://127.0.0.1:8188';
                apiUrl = `${serverAddress}/prompt`;
                const clientId = generateUUID();
                const currentSelectedWorkflowKey = comfyWorkflowSelect.value;

                console.log('[ComfyUI Debug] Selected Workflow Key:', currentSelectedWorkflowKey);

                if (!currentSelectedWorkflowKey) throw new Error("Please select a ComfyUI workflow.");
                if (!comfyWorkflows[currentSelectedWorkflowKey]) throw new Error(`Workflow '${currentSelectedWorkflowKey}' not found.`);

                console.log('[ComfyUI Debug] Workflow String (raw from comfyWorkflows):', comfyWorkflows[currentSelectedWorkflowKey]);

                let workflowToUse;
                try {
                    workflowToUse = JSON.parse(comfyWorkflows[currentSelectedWorkflowKey]); // Parse once
                    console.log('[ComfyUI Debug] Workflow JSON (parsed initial):', JSON.parse(JSON.stringify(workflowToUse))); // Deep copy for logging
                } catch (e) {
                    console.error('[ComfyUI Debug] Failed to parse workflow string:', e);
                    throw new Error('Failed to parse ComfyUI workflow JSON.');
                }

                const specificConfig = comfyWorkflowSpecifics[currentSelectedWorkflowKey];
                if (!specificConfig) throw new Error (`Specific config for workflow '${currentSelectedWorkflowKey}' not found.`);

                const width = parseInt(comfyImageWidth.value, 10);
                const height = parseInt(comfyImageHeight.value, 10);
                const steps = parseInt(comfySteps.value, 10);
                const negativePromptText = comfyNegativePrompt.value;
                let modelToInject = null;

                if (specifics.type === "gguf_unet") modelToInject = ggufModelSelect.value;
                else if (specifics.type === "checkpoint") modelToInject = checkpointModelSelect.value;

                if (modelToInject && specificConfig.modelNodeId && specificConfig.modelInputName && workflowToUse[specificConfig.modelNodeId]?.inputs) {
                    workflowToUse[specificConfig.modelNodeId].inputs[specificConfig.modelInputName] = modelToInject;
                }
                if (specificConfig.sizeNodeId && workflowToUse[specificConfig.sizeNodeId]?.inputs) {
                    workflowToUse[specificConfig.sizeNodeId].inputs[specificConfig.widthInputName] = width;
                    workflowToUse[specificConfig.sizeNodeId].inputs[specificConfig.heightInputName] = height;
                }
                if (specificConfig.stepsNodeId && workflowToUse[specificConfig.stepsNodeId]?.inputs) {
                    workflowToUse[specificConfig.stepsNodeId].inputs[specificConfig.stepsInputName] = steps;
                }
                if (negativePromptText && specificConfig.negativePromptNodeId && workflowToUse[specificConfig.negativePromptNodeId]?.inputs) {
                    workflowToUse[specificConfig.negativePromptNodeId].inputs[specificConfig.negativePromptInputName] = negativePromptText;
                }

                let promptNodeFound = false;
                console.log('[ComfyUI Debug] Positive Prompt to Inject:', promptToSend);
                if (specificConfig.promptNodeId && specificConfig.promptInputName && workflowToUse[specificConfig.promptNodeId]?.inputs) {
                     workflowToUse[specificConfig.promptNodeId].inputs[specificConfig.promptInputName] = promptToSend;
                     promptNodeFound = true;
                } else {
                    const fallbackNodeId = "6"; const fallbackInputName = "text"; // Common fallback
                    if(workflowToUse[fallbackNodeId]?.inputs) {
                        workflowToUse[fallbackNodeId].inputs[fallbackInputName] = promptToSend;
                        promptNodeFound = true;
                    } else {
                        for (const nodeId in workflowToUse) {
                            if (workflowToUse[nodeId]?.class_type === "CLIPTextEncode" && workflowToUse[nodeId]?.inputs?.text !== undefined) {
                                workflowToUse[nodeId].inputs.text = promptToSend;
                                promptNodeFound = true; break;
                            }
                        }
                    }
                }
                if (!promptNodeFound) throw new Error("Could not find suitable node to inject positive prompt.");

                const seedToUse = generateRandomSeed();
                let seedNodeFound = false;
                let seedNodeModifiedId = 'N/A';

                // Log original seed value if possible (simplified: assuming specificConfig points to the primary seed node)
                if (specificConfig.seedNodeId && workflowToUse[specificConfig.seedNodeId]?.inputs[specificConfig.seedInputName] !== undefined) {
                    console.log('[ComfyUI Debug] Original seed in node', specificConfig.seedNodeId, ':', workflowToUse[specificConfig.seedNodeId].inputs[specificConfig.seedInputName]);
                }

                if (specificConfig.seedNodeId && specificConfig.seedInputName && workflowToUse[specificConfig.seedNodeId]?.inputs) {
                    workflowToUse[specificConfig.seedNodeId].inputs[specificConfig.seedInputName] = seedToUse;
                    seedNodeFound = true;
                    seedNodeModifiedId = specificConfig.seedNodeId;
                } else {
                    const fallbackNodeIds = ["31", "3", "2"];
                    for (const fbNodeId of fallbackNodeIds) {
                        if(workflowToUse[fbNodeId]?.inputs?.seed !== undefined) {
                            console.log('[ComfyUI Debug] Original seed in fallback node', fbNodeId, ':', workflowToUse[fbNodeId].inputs.seed);
                            workflowToUse[fbNodeId].inputs.seed = seedToUse;
                            seedNodeFound = true; seedNodeModifiedId = fbNodeId; break;
                        }
                    }
                    if (!seedNodeFound) {
                        for (const nodeId in workflowToUse) {
                            if (workflowToUse[nodeId]?.class_type?.includes("Sampler") && workflowToUse[nodeId]?.inputs?.seed !== undefined) {
                                console.log('[ComfyUI Debug] Original seed in discovered sampler node', nodeId, ':', workflowToUse[nodeId].inputs.seed);
                                workflowToUse[nodeId].inputs.seed = seedToUse;
                                seedNodeFound = true; seedNodeModifiedId = nodeId; break;
                            }
                        }
                    }
                }
                if (seedNodeFound) {
                    console.log('[ComfyUI Debug] Seed set to:', seedToUse, 'for node:', seedNodeModifiedId);
                } else {
                    console.warn(`[ComfyUI Run ${runIdentifier}] Could not find suitable node to set seed. Seed ${seedToUse} not injected.`);
                }

                requestBody = { "prompt": workflowToUse, "client_id": clientId };
                console.log('[ComfyUI Debug] Final Request Body for /prompt:', JSON.parse(JSON.stringify(requestBody))); // Deep copy for logging
                console.log('[ComfyUI Debug] Sending /prompt request to URL:', apiUrl);
                console.log('[ComfyUI Debug] >>> Sending request to /prompt...');

                let queueResponse;
                try {
                    console.log('[ComfyUI Debug] Attempting to fetch /prompt:', apiUrl);
                    queueResponse = await fetch(apiUrl, { method: 'POST', headers: requestHeaders, body: JSON.stringify(requestBody) });
                    console.log('[ComfyUI Debug] /prompt response status:', queueResponse.status, queueResponse.statusText);
                } catch (fetchError) {
                    console.error('[ComfyUI Debug] !!! /prompt fetch failed:', fetchError);
                    if (typeof showMessage === 'function') showMessage(document.getElementById('resultsMessageBox') || 'mainMessageBox', 'ComfyUI /prompt fetch error: ' + fetchError.message, 'error');
                    throw fetchError;
                }

                if (!queueResponse.ok) {
                    let errTxt = await queueResponse.text();
                    console.error('[ComfyUI Debug] /prompt error response text:', errTxt);
                    throw new Error(`ComfyUI Queue Error (${queueResponse.status}): ${errTxt.substring(0,200)}`);
                }
                const queueData = await queueResponse.json();
                console.log('[ComfyUI Debug] /prompt response JSON data:', queueData);
                if (!queueData.prompt_id) throw new Error("ComfyUI did not return a prompt_id.");

                result.promptId = queueData.prompt_id;
                console.log('[ComfyUI Debug] Extracted prompt_id:', result.promptId);
                result.status = 'polling';
                result.message = `ComfyUI Queued (ID: ${result.promptId.substring(0,8)}...). Polling...`;
                if (typeof updateImageResultItem === 'function') updateImageResultItem(endpointConfig.id, endpointConfig.name, result, runIdentifier);
                if (typeof pollComfyHistory === 'function') pollComfyHistory(result.promptId, serverAddress, endpointConfig.id, endpointConfig.name, runIdentifier);
                return result;
            }
            case 'custom_image': {
                if (!apiUrl) throw new Error("Custom Image Endpoint URL is missing.");
                const customSeedToUse = (typeof generateRandomSeed === 'function') ? generateRandomSeed() : Date.now();
                requestBody = { prompt: promptToSend, seed: customSeedToUse };
                const apiKeyCustom = llmApiKeyInput ? llmApiKeyInput.value.trim() : null;
                if (apiKeyCustom) requestHeaders['Authorization'] = `Bearer ${apiKeyCustom}`;

                const response = await fetch(apiUrl, { method, headers, body: JSON.stringify(requestBody) });
                if (!response.ok) {
                    let e = response.statusText;
                    try { const j = await response.json(); e = j.detail || j.error?.message || j.message || JSON.stringify(j); } catch (_) {}
                    throw new Error(`Custom API Error (${response.status}): ${e.substring(0,200)}`);
                }
                let contentType = response.headers.get("content-type");
                if (contentType && contentType.startsWith("image/")) {
                    const blob = await response.blob();
                    result.imageData = (typeof blobToBase64 === 'function') ? await blobToBase64(blob) : null; // from utility
                    result.message = `Custom OK. Image received.`;
                } else if (contentType && contentType.includes("application/json")) {
                    const responseDataCustom = await response.json();
                    if (responseDataCustom.images?.[0]) result.imageData = `data:image/png;base64,${responseDataCustom.images[0]}`;
                    else if (responseDataCustom.image) result.imageData = `data:image/png;base64,${responseDataCustom.image}`;
                    else if (responseDataCustom.data?.[0]?.url) result.imageUrl = responseDataCustom.data[0].url;
                    else if (responseDataCustom.url) result.imageUrl = responseDataCustom.url;
                    else result.message = `Custom OK. JSON received, but no standard image data/URL.`;
                } else {
                    result.message = `Custom OK. Non-standard success response (${contentType || 'No Content-Type'}).`;
                }
                result.status = 'success';
                if (typeof updateImageResultItem === 'function') updateImageResultItem(endpointConfig.id, endpointConfig.name, result, runIdentifier);
                return result;
            }
            default:
                result.error = `Skipped unknown endpoint type: ${endpointConfig.value}`;
                result.status = 'error';
                if (typeof updateImageResultItem === 'function') updateImageResultItem(endpointConfig.id, endpointConfig.name, result, runIdentifier);
                return result;
        }
    } catch (error) {
        console.error(`Run ${runIdentifier}: Error in callImageGenerationAPI for ${endpointConfig.name}:`, error);
        result.error = error.message || 'Unknown API error.';
        result.status = 'error';
        if (typeof updateImageResultItem === 'function') updateImageResultItem(endpointConfig.id, endpointConfig.name, result, runIdentifier);
        error.endpointId = endpointConfig.id;
        error.endpointName = endpointConfig.name;
        throw error;
    }
}

function pollComfyHistory(promptId, serverAddress, endpointId, endpointName, runIdentifier, maxAttempts = 120, delay = 2500) {
    const resultsMessageBox = document.getElementById('resultsMessageBox');
    let attempts = 0;
    const historyUrl = `${serverAddress}/history/${promptId}`;
    // console.log(`[Comfy Poll ${runIdentifier}-${promptId}] Starting: ${historyUrl}`); // Original log
    console.log(`[Comfy Poll ${runIdentifier}-${promptId}] Starting polling for history: ${historyUrl}`);


    // comfyPollingStates, stopBatchFlag, isContinuousModeActive are global (from main_script)
    // blobToBase64, showMessage from utility_functions
    // updateImageResultItem from ui_updates

    if (typeof window.comfyPollingStates === 'undefined') window.comfyPollingStates = {};
    let stopBatchFlag = window.stopBatchFlag || false;
    let isContinuousModeActive = window.isContinuousModeActive || false;

    if (window.comfyPollingStates[promptId]) {
        clearInterval(window.comfyPollingStates[promptId]);
    }

    const intervalId = setInterval(async () => {
        stopBatchFlag = window.stopBatchFlag;

        if (stopBatchFlag) {
            clearInterval(intervalId);
            delete window.comfyPollingStates[promptId];
            if (typeof updateImageResultItem === 'function') updateImageResultItem(endpointId, endpointName, { error: "Batch stopped." }, runIdentifier, 'error', 'Batch stopped.');
            return;
        }
        if (attempts >= maxAttempts) {
            clearInterval(intervalId);
            delete window.comfyPollingStates[promptId];
            if (typeof updateImageResultItem === 'function') updateImageResultItem(endpointId, endpointName, { error: "Polling timed out." }, runIdentifier, 'error', 'Polling timed out.');
            if (Object.keys(window.comfyPollingStates).length === 0 && !isContinuousModeActive && typeof showMessage === 'function' && resultsMessageBox) {
                 showMessage(resultsMessageBox, 'error', `ComfyUI polling timed out for ${endpointName}.`);
            }
            return;
        }
        attempts++;
        console.log(`[Comfy Poll ${runIdentifier}-${promptId}] Attempt ${attempts}/${maxAttempts}...`);
        if (attempts % 4 === 1 && typeof updateImageResultItem === 'function') {
            updateImageResultItem(endpointId, endpointName, null, runIdentifier, 'polling', `Polling... (${attempts}/${maxAttempts})`);
        }
        try {
            const response = await fetch(historyUrl);
            if (!response.ok && response.status !== 404) {
                console.warn(`[Comfy Poll ${runIdentifier}-${promptId}] History fetch issue: ${response.status} ${response.statusText}. Body:`, await response.text());
                return;
            }
            if (response.ok) {
                const historyData = await response.json();
                console.log(`[Comfy Poll ${runIdentifier}-${promptId}] History data received:`, JSON.parse(JSON.stringify(historyData))); // Deep copy for logging
                if (historyData && historyData[promptId]?.outputs) {
                    clearInterval(intervalId);
                    delete window.comfyPollingStates[promptId];
                    const outputs = historyData[promptId].outputs;
                    let foundImage = false;
                    for (const nodeId in outputs) {
                        const nodeOutput = outputs[nodeId];
                        if (nodeOutput.images?.[0]) {
                            const imageInfo = nodeOutput.images[0];
                            if (imageInfo.filename && imageInfo.type && imageInfo.subfolder !== undefined) {
                                const imageUrl = `${serverAddress}/view?filename=${encodeURIComponent(imageInfo.filename)}&subfolder=${encodeURIComponent(imageInfo.subfolder)}&type=${encodeURIComponent(imageInfo.type)}`;
                                console.log(`[Comfy Poll ${runIdentifier}-${promptId}] Attempting to fetch image from /view URL: ${imageUrl}`);
                                let imageResponse;
                                try {
                                    imageResponse = await fetch(imageUrl);
                                    if (!imageResponse.ok) {
                                        console.error(`[Comfy Poll ${runIdentifier}-${promptId}] /view image fetch failed: ${imageResponse.status} ${imageResponse.statusText}. Body:`, await imageResponse.text());
                                        throw new Error(`Image fetch failed (${imageResponse.status})`);
                                    }
                                    const imageBlob = await imageResponse.blob();
                                    const base64ImageData = (typeof blobToBase64 === 'function') ? await blobToBase64(imageBlob) : null;
                                    if (typeof updateImageResultItem === 'function') updateImageResultItem(endpointId, endpointName, { imageData: base64ImageData, message: `Image Received.` }, runIdentifier);
                                    foundImage = true; break;
                                } catch (viewError) {
                                    console.error(`[Comfy Poll ${runIdentifier}-${promptId}] !!! /view fetch error:`, viewError);
                                    if (typeof updateImageResultItem === 'function') updateImageResultItem(endpointId, endpointName, { error: `Image load failed: ${String(viewError).substring(0,100)}` }, runIdentifier, 'error');
                                    foundImage = true; break; // Still break as we attempted for this image path
                                }
                            }
                        }
                    }
                    if (!foundImage && typeof updateImageResultItem === 'function') {
                        updateImageResultItem(endpointId, endpointName, { error: "Finished, no image output." }, runIdentifier, 'error');
                    }
                    if (Object.keys(window.comfyPollingStates).length === 0 && !isContinuousModeActive && typeof showMessage === 'function' && resultsMessageBox) {
                         showMessage(resultsMessageBox, foundImage ? 'success' : 'warning', `ComfyUI processing complete for ${endpointName}.`);
                    }
                    return;
                }
            }
        } catch (error) {
            console.error(`[Comfy Poll ${runIdentifier}-${promptId}] Error during polling fetch:`, error);
        }
    }, delay);
    window.comfyPollingStates[promptId] = intervalId;
}
