function initializeUI() {
    // populateDropdowns(); // Removed as obsolete
    populateWorkflowSelect();
    setupCopyButtons();
    setupContinuousGenToggle();
    // setupCustomEndpoints(); // Removed as its functionality is now integrated or deprecated

    // Initialize system prompt
    updateSystemPrompt();

    // Get the container for LLM configuration
    const llmConfigContainer = document.getElementById('llm-config-content');
    if (llmConfigContainer) {
        populateLLMConfig(llmConfigContainer);
    } else {
        console.error('LLM config container (llm-config-content) not found!');
    }

    // Get the container for Prompt Guidelines
    const promptGuidelinesContainer = document.getElementById('prompt-guidelines-content');
    if (promptGuidelinesContainer) {
        populatePromptGuidelines(promptGuidelinesContainer);
    } else {
        console.warn('Prompt Guidelines container (prompt-guidelines-content) not found! Skipping population.');
    }

    createAndPlaceGenerateApiPromptButton();

    console.log('UI setup complete with enhanced v1 features.');
}

function createAndPlaceGenerateApiPromptButton() {
    const section2 = document.getElementById('section-2-v2');
    const apiOutputContainer = document.getElementById('api-prompt-output-container');

    if (!section2 || !apiOutputContainer) {
        console.error('Cannot create Generate API Prompt button: section-2-v2 or api-prompt-output-container not found.');
        return;
    }

    const button = document.createElement('button');
    button.id = 'generateApiPromptButton';
    button.className = 'primary-button'; // Or any other appropriate classes
    button.innerHTML = '<span>Generate AI Prompt</span> <i class="fas fa-magic"></i>';
    button.title = 'Uses your selected keywords and LLM settings to generate an enhanced prompt for image generation.';

    // Insert the button after the api-prompt-output-container
    if (apiOutputContainer.nextSibling) {
        section2.insertBefore(button, apiOutputContainer.nextSibling);
    } else {
        section2.appendChild(button);
    }
    console.log('generateApiPromptButton created and added to section-2-v2.');
}

function populatePromptGuidelines(container) {
    if (!container) return;
    container.innerHTML = ''; // Clear existing placeholder

    const title = document.createElement('h4');
    title.textContent = 'Understanding System Prompt Templates';
    container.appendChild(title);

    const intro = document.createElement('p');
    intro.textContent = 'The "System Prompt" instructs the AI on how to interpret your keywords and generate the final image prompt. Different templates are optimized for various levels of detail and AI models. The content of the System Prompt textarea (in the LLM Configuration) will change based on the "Output Format" you select.';
    container.appendChild(intro);

    // Check if systemPromptTemplates is available (it's in main_script-refactor-v2.js)
    if (typeof systemPromptTemplates === 'object' && systemPromptTemplates !== null) {
        const list = document.createElement('dl');
        for (const key in systemPromptTemplates) {
            if (systemPromptTemplates.hasOwnProperty(key)) {
                const templateContent = systemPromptTemplates[key];

                const dt = document.createElement('dt');
                dt.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize key
                list.appendChild(dt);

                const dd = document.createElement('dd');
                // Create a brief summary.
                let summary = 'No summary available.';
                if (templateContent) {
                    if (key === 'auto') {
                         summary = "AI tries to be creative using user keywords for t-shirt designs, adding unique elements. Good for general use.";
                    } else if (key === 'keywords') {
                        summary = "Optimized for models preferring concise, keyword-driven input (like Stable Diffusion 1.5/2.x). Focuses on comma-separated terms and emphasis.";
                    } else if (key === 'structured') {
                        summary = "For advanced models (SDXL, Flux), creating detailed, structured prompts with sections for subject, action, style, etc.";
                    } else if (key === 'sentences') {
                        summary = "For models that excel with natural language (DALL-E 3). Transforms keywords into a descriptive paragraph/narrative.";
                    } else {
                        // Fallback for any other templates not explicitly summarized
                        const firstFewLines = templateContent.split('\n').slice(0, 3).join(' ');
                        summary = firstFewLines.substring(0, 150) + (templateContent.length > 150 ? '...' : '');
                    }
                }
                dd.textContent = summary;
                list.appendChild(dd);
            }
        }
        container.appendChild(list);
    } else {
        const errorMsg = document.createElement('p');
        errorMsg.textContent = 'System prompt template data is not available. This content cannot be displayed.';
        errorMsg.style.color = 'red';
        container.appendChild(errorMsg);
    }
}

function populateLLMConfig(container) {
    console.log('Populating LLM Config UI...');
    container.innerHTML = ''; // Clear existing content

    // --- Prompt Format Selection ---
    const promptFormatLabel = document.createElement('label');
    promptFormatLabel.textContent = 'Select Prompt Format:';
    container.appendChild(promptFormatLabel);

    const formats = [
        { value: 'auto', text: 'Auto-detect (Recommended)' },
        { value: 'keywords', text: 'Keywords (Stable Diffusion style)' },
        { value: 'structured', text: 'Structured (SDXL/Flux style)' },
        { value: 'sentences', text: 'Sentences (DALL-E style)' }
    ];

    formats.forEach(format => {
        const radioDiv = document.createElement('div');
        radioDiv.className = 'radio-option';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.id = `format-${format.value}`;
        radio.name = 'promptFormat';
        radio.value = format.value;
        if (format.value === 'auto') radio.checked = true;

        const label = document.createElement('label');
        label.setAttribute('for', `format-${format.value}`);
        label.textContent = format.text;

        radioDiv.appendChild(radio);
        radioDiv.appendChild(label);
        container.appendChild(radioDiv);
    });

    // --- System Prompt Textarea ---
    const systemPromptLabel = document.createElement('label');
    systemPromptLabel.setAttribute('for', 'systemPrompt');
    systemPromptLabel.textContent = 'System Prompt (Instructions for AI):';
    container.appendChild(systemPromptLabel);

    const systemPromptTextarea = document.createElement('textarea');
    systemPromptTextarea.id = 'systemPrompt';
    systemPromptTextarea.name = 'systemPrompt';
    systemPromptTextarea.rows = 8;
    systemPromptTextarea.placeholder = 'The AI will use this system prompt to guide its generation. It updates based on your selections or you can customize it.';
    // systemPromptTextarea.readOnly = true; // Set to true if it should not be user-editable initially
    container.appendChild(systemPromptTextarea);

    // --- LLM Endpoint Selection (Example) ---
    const llmEndpointLabel = document.createElement('label');
    llmEndpointLabel.setAttribute('for', 'llmEndpoint');
    llmEndpointLabel.textContent = 'LLM Endpoint:';
    container.appendChild(llmEndpointLabel);

    const llmEndpointSelect = document.createElement('select');
    llmEndpointSelect.id = 'llmEndpoint';
    llmEndpointSelect.name = 'llmEndpoint';
    ['default_llm', 'custom_llm'].forEach(val => {
        const option = document.createElement('option');
        option.value = val;
        option.textContent = val.replace('_', ' ').toUpperCase();
        llmEndpointSelect.appendChild(option);
    });
    container.appendChild(llmEndpointSelect);

    // --- Custom LLM Endpoint Input ---
    const customEndpointContainer = document.createElement('div');
    customEndpointContainer.id = 'customLlmEndpointContainer';
    customEndpointContainer.style.display = 'none'; // Hidden by default
    customEndpointContainer.classList.add('custom-endpoint-container'); // For styling

    const customEndpointLabel = document.createElement('label');
    customEndpointLabel.setAttribute('for', 'customLlmEndpointUrlInput');
    customEndpointLabel.textContent = 'Custom LLM URL:';

    const customEndpointInput = document.createElement('input');
    customEndpointInput.type = 'text';
    customEndpointInput.id = 'customLlmEndpointUrlInput';
    customEndpointInput.name = 'customLlmEndpointUrl';
    customEndpointInput.placeholder = 'Enter full API URL for custom LLM';

    customEndpointContainer.appendChild(customEndpointLabel);
    customEndpointContainer.appendChild(customEndpointInput);
    container.appendChild(customEndpointContainer);

    console.log('LLM Config UI populated.');
}