// --- UI Update Functions V1 ---

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
         if (selectElement.options.length > 0 && !Array.from(selectElement.options).find(opt => opt.value === defaultModelName)) {
            console.warn(`populateModelSelect: Default model "${defaultModelName}" not in list. Browser default or current selection retained.`);
        } else if (!defaultModelName) {
            // No default specified, browser will pick first or retain current if items are same
        }
    }
}

/**
 * Handles changes in the ComfyUI workflow selection with enhanced animations.
 */
function handleComfyWorkflowChange() {
    const workflowSelect = document.getElementById('comfyWorkflowSelect');
    const specificParamsContainer = document.getElementById('comfySpecificParamsContainer');
    const ggufContainer = document.getElementById('ggufModelSelectorContainer');
    const checkpointContainer = document.getElementById('checkpointModelSelectorContainer');

    if (!workflowSelect || !specificParamsContainer) {
        console.error("handleComfyWorkflowChange: Required elements not found.");
        return;
    }

    const selectedWorkflow = workflowSelect.value;
    
    // Animate container visibility
    if (selectedWorkflow) {
        specificParamsContainer.style.display = 'block';
        animateSlideDown(specificParamsContainer);
        
        // Show/hide model selectors based on workflow type with staggered animation
        setTimeout(() => {
            if (selectedWorkflow.toLowerCase().includes('gguf') || selectedWorkflow.toLowerCase().includes('flux')) {
                showElement(ggufContainer);
                hideElement(checkpointContainer);
            } else {
                showElement(checkpointContainer);
                hideElement(ggufContainer);
            }
        }, 150);
    } else {
        animateSlideUp(specificParamsContainer, () => {
            specificParamsContainer.style.display = 'none';
        });
    }
}

/**
 * Updates the system prompt based on the selected format with smooth transitions.
 */
function updateSystemPrompt() {
    const formatRadios = document.querySelectorAll('input[name="promptFormat"]');
    const systemPromptTextarea = document.getElementById('systemPrompt');
    
    if (!systemPromptTextarea) {
        console.error("updateSystemPrompt: systemPrompt textarea not found.");
        return;
    }

    let selectedFormat = 'structured'; // default
    formatRadios.forEach(radio => {
        if (radio.checked) {
            selectedFormat = radio.value;
        }
    });

    const prompts = {
        auto: "You are an AI assistant that helps create artistic prompts for t-shirt designs. Generate creative and detailed prompts based on the provided keywords.",
        keywords: "Create a concise, keyword-based prompt for t-shirt design. Use comma-separated keywords and phrases. Focus on visual elements, style, and artistic techniques. Keep it under 75 tokens.",
        structured: "Create a detailed, structured prompt for t-shirt design. Include specific details about style, composition, colors, lighting, and artistic techniques. Organize the prompt logically with clear descriptions.",
        sentences: "Create a natural language description for a t-shirt design. Write in complete sentences and paragraphs. Describe the scene, style, mood, and visual elements in a flowing, descriptive manner."
    };

    // Animate the text change
    animateFadeOut(systemPromptTextarea, () => {
        systemPromptTextarea.value = prompts[selectedFormat] || prompts.structured;
        animateFadeIn(systemPromptTextarea);
    });
}

/**
 * Shows a message in the specified message box with enhanced styling.
 */
function showMessage(messageBoxId, message, type = 'info', duration = 5000) {
    const messageBox = document.getElementById(messageBoxId);
    if (!messageBox) {
        console.error(`showMessage: Message box with ID "${messageBoxId}" not found.`);
        return;
    }

    // Clear existing classes and content
    messageBox.className = 'message-box';
    messageBox.innerHTML = '';
    
    // Add type-specific class
    messageBox.classList.add(type);
    
    // Create message content with icon
    const messageContent = document.createElement('div');
    messageContent.style.display = 'flex';
    messageContent.style.alignItems = 'center';
    messageContent.style.gap = '0.5rem';
    
    const icon = document.createElement('i');
    switch (type) {
        case 'success':
            icon.className = 'fas fa-check-circle';
            break;
        case 'error':
            icon.className = 'fas fa-exclamation-circle';
            break;
        case 'warning':
            icon.className = 'fas fa-exclamation-triangle';
            break;
        default:
            icon.className = 'fas fa-info-circle';
    }
    
    const messageText = document.createElement('span');
    messageText.textContent = message;
    
    messageContent.appendChild(icon);
    messageContent.appendChild(messageText);
    messageBox.appendChild(messageContent);
    
    // Show with animation
    messageBox.style.display = 'block';
    animateSlideDown(messageBox);
    
    // Auto-hide after duration
    if (duration > 0) {
        setTimeout(() => {
            hideMessage(messageBoxId);
        }, duration);
    }
}

/**
 * Hides a message box with animation.
 */
function hideMessage(messageBoxId) {
    const messageBox = document.getElementById(messageBoxId);
    if (!messageBox) return;
    
    animateSlideUp(messageBox, () => {
        messageBox.style.display = 'none';
        messageBox.innerHTML = '';
        messageBox.className = 'message-box';
    });
}

/**
 * Updates the copy button state with visual feedback.
 */
function updateCopyButtonState(button, success = true) {
    const icon = button.querySelector('i');
    const originalClass = icon.className;
    
    if (success) {
        icon.className = 'fas fa-check';
        button.style.color = 'var(--success)';
        
        // Add pulse animation
        button.style.transform = 'scale(1.1)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
        
        setTimeout(() => {
            icon.className = originalClass;
            button.style.color = '';
        }, 2000);
    } else {
        icon.className = 'fas fa-times';
        button.style.color = 'var(--error)';
        
        setTimeout(() => {
            icon.className = originalClass;
            button.style.color = '';
        }, 2000);
    }
}

/**
 * Updates button loading state with spinner animation.
 */
function setButtonLoading(button, loading = true, originalText = '') {
    if (!button) return;
    
    if (loading) {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Processing...</span>';
        button.style.opacity = '0.7';
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText || originalText;
        button.style.opacity = '1';
        delete button.dataset.originalText;
    }
}

/**
 * Updates the continuous generation UI state.
 */
function updateContinuousGenUI(enabled) {
    const continuousOptions = document.getElementById('continuous-options');
    const sendButton = document.getElementById('sendPromptButton');
    const stopButton = document.getElementById('stopBatchButton');
    
    if (enabled) {
        showElement(continuousOptions);
        if (sendButton) {
            sendButton.innerHTML = '<i class="fas fa-play"></i> <span>Start Batch Generation</span>';
        }
    } else {
        hideElement(continuousOptions);
        if (sendButton) {
            sendButton.innerHTML = '<i class="fas fa-paper-plane"></i> <span>Send Prompt</span>';
        }
    }
    
    // Update stop button visibility
    if (stopButton) {
        if (enabled) {
            stopButton.classList.remove('hidden');
        } else {
            stopButton.classList.add('hidden');
        }
    }
}

/**
 * Creates and shows a progress indicator.
 */
function showProgressIndicator(containerId, current, total, message = '') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let progressBar = container.querySelector('.progress-indicator');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.className = 'progress-indicator';
        progressBar.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div class="progress-text"></div>
        `;
        container.appendChild(progressBar);
    }
    
    const progressFill = progressBar.querySelector('.progress-fill');
    const progressText = progressBar.querySelector('.progress-text');
    
    const percentage = Math.round((current / total) * 100);
    
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = message || `${current} of ${total} (${percentage}%)`;
    
    progressBar.style.display = 'block';
    
    if (current >= total) {
        setTimeout(() => {
            hideElement(progressBar);
        }, 2000);
    }
}

// Animation helper functions
function animateSlideDown(element, callback) {
    element.style.overflow = 'hidden';
    element.style.height = '0';
    element.style.opacity = '0';
    element.style.transform = 'translateY(-10px)';
    element.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    requestAnimationFrame(() => {
        element.style.height = 'auto';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        
        setTimeout(() => {
            element.style.overflow = '';
            element.style.height = '';
            element.style.transition = '';
            if (callback) callback();
        }, 300);
    });
}

function animateSlideUp(element, callback) {
    element.style.overflow = 'hidden';
    element.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    element.style.height = element.offsetHeight + 'px';
    
    requestAnimationFrame(() => {
        element.style.height = '0';
        element.style.opacity = '0';
        element.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            element.style.overflow = '';
            element.style.height = '';
            element.style.opacity = '';
            element.style.transform = '';
            element.style.transition = '';
            if (callback) callback();
        }, 300);
    });
}

function animateFadeOut(element, callback) {
    element.style.transition = 'opacity 0.2s ease-out';
    element.style.opacity = '0';
    
    setTimeout(() => {
        if (callback) callback();
    }, 200);
}

function animateFadeIn(element) {
    element.style.opacity = '0';
    requestAnimationFrame(() => {
        element.style.transition = 'opacity 0.2s ease-in';
        element.style.opacity = '1';
        
        setTimeout(() => {
            element.style.transition = '';
        }, 200);
    });
}

function showElement(element) {
    if (!element) return;
    element.style.display = 'block';
    animateSlideDown(element);
}

function hideElement(element) {
    if (!element) return;
    animateSlideUp(element, () => {
        element.style.display = 'none';
    });
}

/**
 * Initializes theme switching functionality.
 */
function initializeThemeSwitcher() {
    const themeButtons = document.querySelectorAll('.theme-btn');
    const styleButtons = document.querySelectorAll('.style-btn');
    const body = document.body;
    
    // Load saved theme and style
    const savedTheme = localStorage.getItem('prompt-forge-theme') || 'default';
    const savedStyle = localStorage.getItem('prompt-forge-style') || 'curved';
    
    body.setAttribute('data-theme', savedTheme);
    body.setAttribute('data-style', savedStyle);
    
    // Update active buttons
    themeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === savedTheme);
    });
    
    styleButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.style === savedStyle);
    });
    
    // Add theme click handlers
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.dataset.theme;
            
            // Update active state
            themeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Apply theme
            body.setAttribute('data-theme', theme);
            
            // Save theme
            localStorage.setItem('prompt-forge-theme', theme);
            
            // Add visual feedback
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
        });
    });
    
    // Add style click handlers
    styleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const style = button.dataset.style;
            
            // Update active state
            styleButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Apply style
            body.setAttribute('data-style', style);
            
            // Save style
            localStorage.setItem('prompt-forge-style', style);
            
            // Add visual feedback
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
        });
    });
}

/**
 * Initializes collapsible sections with enhanced animations.
 */
function initializeCollapsibleSections() {
    const collapsibleButtons = document.querySelectorAll('.config-header');
    
    collapsibleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            const targetId = button.getAttribute('aria-controls');
            const targetContent = document.getElementById(targetId);
            
            if (!targetContent) return;
            
            // Toggle expanded state
            button.setAttribute('aria-expanded', !isExpanded);
            
            if (isExpanded) {
                // Collapse
                targetContent.setAttribute('hidden', '');
                animateSlideUp(targetContent);
            } else {
                // Expand
                targetContent.removeAttribute('hidden');
                animateSlideDown(targetContent);
            }
        });
    });
}

/**
 * Adds enhanced visual feedback to interactive elements.
 */
function enhanceInteractiveElements() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.quick-action-card, .output-card, .config-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
    
    // Add click feedback to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            button.style.transform = 'scale(0.98)';
            setTimeout(() => {
                button.style.transform = '';
            }, 100);
        });
    });
}

// Initialize enhanced UI features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeThemeSwitcher();
    initializeCollapsibleSections();
    enhanceInteractiveElements();
});