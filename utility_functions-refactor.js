// --- Utility Functions ---

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

function downloadResultsText() {
     console.log("--- Download Log Button Triggered ---"); // DEBUG LOG
     try {
         let textContent = "Artistic T-Shirt Prompt Generator Results\n";
         textContent += "========================================\n\n";

         // 1. Keywords Summary
         textContent += "Selected Keywords Summary:\n";
         textContent += (document.getElementById('generatedKeywords').value || "N/A") + "\n\n"; // Assume generatedKeywordsTextarea is global or accessible

         // 2. API Generated Prompt
         textContent += "API Generated Prompt:\n";
         textContent += (document.getElementById('apiGeneratedPrompt').value || "N/A") + "\n\n"; // Assume apiGeneratedPromptTextarea

         // 3. System Prompt Used
         textContent += "System Prompt Used (for LLM):\n";
         textContent += (document.getElementById('systemPrompt').value || "N/A") + "\n\n"; // Assume systemPromptTextarea

         // 4. LLM Configuration
         textContent += "LLM Configuration:\n";
         const llmEndpointSelect = document.getElementById('llmEndpoint'); // Assume llmEndpointSelect
         const customLlmEndpointInput = document.getElementById('customLlmEndpoint'); // Assume customLlmEndpointInput
         const llmModelNameInput = document.getElementById('llmModelName'); // Assume llmModelNameInput
         const llmApiKeyInput = document.getElementById('llmApiKey'); // Assume llmApiKeyInput

         const llmOption = llmEndpointSelect.selectedOptions[0];
         textContent += `  Endpoint Type: ${llmOption ? llmOption.text : 'N/A'}\n`;
         if (llmEndpointSelect.value === 'custom_llm') {
             textContent += `  Custom URL: ${customLlmEndpointInput.value || 'Not Set'}\n`;
         }
         textContent += `  Model Name: ${llmModelNameInput.value || 'Default / Not Set'}\n`;
         textContent += `  API Key Provided: ${llmApiKeyInput.value ? 'Yes' : 'No'}\n\n`;

         // 5. Image Generation Configuration
         textContent += "Image Generation Configuration:\n";
         const selectedEndpoints = getSelectedImageEndpoints(); // Assumes this function is globally available
         const comfyWorkflowSelect = document.getElementById('comfyWorkflowSelect'); // Assume comfyWorkflowSelect

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
         const imageResultsGrid = document.getElementById('image-results-grid'); // Assume imageResultsGrid
         const resultItems = imageResultsGrid.querySelectorAll('.image-result-item');
         if (resultItems.length === 0 || (resultItems.length === 1 && resultItems[0].classList.contains('placeholder-text'))) {
             textContent += "(No generation attempted or results available)\n";
         } else {
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

         const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
         const url = URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
         a.download = `tshirt_prompt_results_${timestamp}.txt`;
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         URL.revokeObjectURL(url);
         console.log("Log file download initiated.");
         const resultsMessageBox = document.getElementById('resultsMessageBox'); // Assume resultsMessageBox
         showMessage(resultsMessageBox, 'success', "Log file download started.");

     } catch (error) {
         console.error("Error generating or downloading log file:", error);
         const resultsMessageBox = document.getElementById('resultsMessageBox'); // Assume resultsMessageBox
          showMessage(resultsMessageBox, 'error', "Failed to generate or download log file.");
     }
 }
