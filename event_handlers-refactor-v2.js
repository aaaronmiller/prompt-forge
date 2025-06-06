// --- Event Handler Functions V1 ---

/**
 * Handles the "Feeling Lucky" button click - now generates keyword list directly.
 */
function handleFeelingLucky() {
    console.log("Handling 'Feeling Lucky' click...");
    const mainMessageBox = document.getElementById('mainMessageBox');
    const generatedKeywordsTextarea = document.getElementById('generatedKeywords');
    const keywordsSummaryContainer = document.getElementById('keywords-summary-container');
    const feelLuckyButton = document.getElementById('feelLuckyButton');

    try {
        // Set button loading state
        setButtonLoading(feelLuckyButton, true);

        // Get all available keywords from the slider categories with balanced selection
        const allCategories = [];
        if (window.keywordSlider && window.keywordSlider.categories) {
            window.keywordSlider.categories.forEach(category => {
                allCategories.push({
                    name: category.name,
                    keywords: [...category.keywords] // Create a copy
                });
            });
        }

        if (!allCategories.length) {
            showMessage('mainMessageBox', 'No keywords available to pick from.', 'error');
            setButtonLoading(feelLuckyButton, false);
            return;
        }

        // Get quantity selection
        const quantityOption = document.querySelector('input[name="luckyQuantity"]:checked');
        let minQty = 10, maxQty = 20;
        if (quantityOption) {
            const [parsedMin, parsedMax] = quantityOption.value.split('-').map(Number);
            minQty = parsedMin || minQty;
            maxQty = parsedMax || maxQty;
        }

        const targetQty = Math.floor(Math.random() * (maxQty - minQty + 1)) + minQty;

        // Ensure balanced selection across categories using Fisher-Yates shuffle
        const selectedKeywords = [];
        const keywordsPerCategory = Math.ceil(targetQty / allCategories.length);

        // Shuffle each category's keywords independently
        allCategories.forEach(category => {
            // Fisher-Yates shuffle for true randomness
            const shuffled = [...category.keywords];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }

            // Take random number of keywords from this category (1 to keywordsPerCategory)
            const takeCount = Math.min(
                Math.floor(Math.random() * keywordsPerCategory) + 1,
                shuffled.length,
                targetQty - selectedKeywords.length
            );

            selectedKeywords.push(...shuffled.slice(0, takeCount));
        });

        // If we need more keywords, randomly select from remaining
        if (selectedKeywords.length < targetQty) {
            const allRemaining = [];
            allCategories.forEach(category => {
                category.keywords.forEach(keyword => {
                    if (!selectedKeywords.includes(keyword)) {
                        allRemaining.push(keyword);
                    }
                });
            });

            // Fisher-Yates shuffle remaining keywords
            for (let i = allRemaining.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allRemaining[i], allRemaining[j]] = [allRemaining[j], allRemaining[i]];
            }

            const needed = targetQty - selectedKeywords.length;
            selectedKeywords.push(...allRemaining.slice(0, needed));
        }

        // Final shuffle of selected keywords to randomize order for AI processing
        for (let i = selectedKeywords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [selectedKeywords[i], selectedKeywords[j]] = [selectedKeywords[j], selectedKeywords[i]];
        }

        // Animate the generation process
        setTimeout(() => {
            // Create the keyword list
            const keywordsList = selectedKeywords.join(', ');

            // Update the textarea
            if (generatedKeywordsTextarea) {
                generatedKeywordsTextarea.value = keywordsList;
                generatedKeywordsTextarea.dispatchEvent(new Event('input', { bubbles: true }));
            }

            // Show the generate prompt button
            showGeneratePromptButton();

            // Show success message
            showMessage('mainMessageBox', `Feeling lucky! Generated ${actualQty} random keywords.`, 'success');

            // Scroll to results
            if (keywordsSummaryContainer) {
                keywordsSummaryContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            // Reset button state
            setButtonLoading(feelLuckyButton, false);
        }, 800);

    } catch (error) {
        console.error("Error 'Feeling Lucky':", error);
        showMessage('mainMessageBox', "Error generating random keywords.", 'error');
        setButtonLoading(feelLuckyButton, false);
    }
}

/**
 * Handles the "Generate Prompt" button click (moved from LLM config).
 */
function handleGeneratePrompt() {
    console.log("Handling 'Generate Prompt' click...");
    const mainMessageBox = document.getElementById('mainMessageBox');
    const generatedKeywordsTextarea = document.getElementById('generatedKeywords');
    const apiGeneratedPromptTextarea = document.getElementById('apiGeneratedPrompt');
    const apiPromptContainer = document.getElementById('api-prompt-output-container');
    const generateButton = document.getElementById('generatePromptButton');

    try {
        // Set button loading state
        setButtonLoading(generateButton, true);

        // Get keywords from textarea
        const keywords = generatedKeywordsTextarea ? generatedKeywordsTextarea.value.trim() : '';

        if (!keywords) {
            showMessage('mainMessageBox', 'Please add some keywords first using "Feeling Lucky" or "Select Keywords".', 'warning');
            setButtonLoading(generateButton, false);
            return;
        }

        // Show the API prompt container
        if (apiPromptContainer) {
            apiPromptContainer.style.display = 'block';
        }

        // Call the existing API prompt generation function
        setTimeout(() => {
            if (typeof handleGenerateApiPrompt === 'function') {
                handleGenerateApiPrompt();
            }
            setButtonLoading(generateButton, false);
        }, 300);

    } catch (error) {
        console.error("Error generating prompt:", error);
        showMessage('mainMessageBox', "Error generating AI prompt.", 'error');
        setButtonLoading(generateButton, false);
    }
}

/**
 * Handles changes to the keywords textarea.
 */
function handleKeywordsChange() {
    const keywordsTextarea = document.getElementById('generatedKeywords');
    const generatePromptButton = document.getElementById('generatePromptButton');

    if (keywordsTextarea && generatePromptButton) {
        const hasKeywords = keywordsTextarea.value.trim().length > 0;

        if (hasKeywords) {
            showGeneratePromptButton();
        } else {
            generatePromptButton.classList.add('hidden');
        }
    }
}

/**
 * Shows the generate prompt button with animation.
 */
function showGeneratePromptButton() {
    const generateBtn = document.getElementById('generatePromptButton');
    if (generateBtn && generateBtn.classList.contains('hidden')) {
        generateBtn.classList.remove('hidden');
        generateBtn.style.opacity = '0';
        generateBtn.style.transform = 'scale(0.8)';

        requestAnimationFrame(() => {
            generateBtn.style.transition = 'all 0.3s ease-out';
            generateBtn.style.opacity = '1';
            generateBtn.style.transform = 'scale(1)';
        });
    }
}

/**
 * Handles the "Generate API Prompt" button click.
 */
function handleGenerateApiPrompt() {
    console.log("Handling 'Generate API Prompt' click...");
    const configMessageBox = document.getElementById('configMessageBox');
    const generateButton = document.getElementById('generateApiPromptButton');

    try {
        // Set button loading state
        setButtonLoading(generateButton, true);

        // Call the existing API function
        if (typeof generateApiPrompt === 'function') {
            generateApiPrompt().finally(() => {
                setButtonLoading(generateButton, false);
            });
        } else {
            console.error("generateApiPrompt function not found");
            showMessage('configMessageBox', "API prompt generation function not available.", 'error');
            setButtonLoading(generateButton, false);
        }
    } catch (error) {
        console.error("Error generating API prompt:", error);
        showMessage('configMessageBox', "Error generating API prompt.", 'error');
        setButtonLoading(generateButton, false);
    }
}

/**
 * Handles the "Send Prompt" button click.
 */
function handleSendPrompt() {
    console.log("Handling 'Send Prompt' click...");
    const sendButton = document.getElementById('sendPromptButton');
    const stopButton = document.getElementById('stopBatchButton');

    try {
        // Update button states
        setButtonLoading(sendButton, true);
        stopButton.classList.remove('hidden');

        // Call the existing send function
        if (typeof sendPromptToImageGen === 'function') {
            sendPromptToImageGen().finally(() => {
                setButtonLoading(sendButton, false);
                stopButton.classList.add('hidden');
            });
        } else {
            console.error("sendPromptToImageGen function not found");
            showMessage('configMessageBox', "Send prompt function not available.", 'error');
            setButtonLoading(sendButton, false);
            stopButton.classList.add('hidden');
        }
    } catch (error) {
        console.error("Error sending prompt:", error);
        showMessage('configMessageBox', "Error sending prompt.", 'error');
        setButtonLoading(sendButton, false);
        stopButton.classList.add('hidden');
    }
}

/**
 * Handles the "Stop Batch" button click.
 */
function handleStopBatch() {
    console.log("Handling 'Stop Batch' click...");
    const stopButton = document.getElementById('stopBatchButton');
    const sendButton = document.getElementById('sendPromptButton');

    try {
        // Call the existing stop function
        if (typeof stopBatchGeneration === 'function') {
            stopBatchGeneration();
        }

        // Update UI
        stopButton.classList.add('hidden');
        setButtonLoading(sendButton, false);
        showMessage('configMessageBox', 'Batch generation stopped.', 'info');

    } catch (error) {
        console.error("Error stopping batch:", error);
        showMessage('configMessageBox', "Error stopping batch generation.", 'error');
    }
}

/**
 * Handles LLM endpoint selection changes.
 */
function handleLlmEndpointChange() {
    const llmEndpoint = document.getElementById('llmEndpoint');
    const customContainer = document.getElementById('customLlmEndpointContainer');

    if (!llmEndpoint || !customContainer) return;

    if (llmEndpoint.value === 'custom_llm') {
        showElement(customContainer);
    } else {
        hideElement(customContainer);
    }

    // Update system prompt based on endpoint
    updateSystemPrompt();
}

/**
 * Handles prompt format changes.
 */
function handlePromptFormatChange() {
    updateSystemPrompt();

    // Add visual feedback
    const formatRadios = document.querySelectorAll('input[name="promptFormat"]');
    formatRadios.forEach(radio => {
        const label = radio.nextElementSibling;
        if (radio.checked && label) {
            label.style.transform = 'scale(1.05)';
            setTimeout(() => {
                label.style.transform = '';
            }, 200);
        }
    });
}

/**
 * Handles ComfyUI workflow selection changes.
 */
function handleComfyWorkflowChangeEvent() {
    handleComfyWorkflowChange();

    // Add visual feedback
    const workflowSelect = document.getElementById('comfyWorkflowSelect');
    if (workflowSelect && workflowSelect.value) {
        workflowSelect.style.borderColor = 'var(--success)';
        setTimeout(() => {
            workflowSelect.style.borderColor = '';
        }, 1000);
    }
}

/**
 * Handles continuous generation toggle.
 */
function handleContinuousGenToggle() {
    const toggleCheckbox = document.getElementById('enableContinuousGen');
    if (!toggleCheckbox) return;

    updateContinuousGenUI(toggleCheckbox.checked);

    // Add visual feedback
    const toggleLabel = toggleCheckbox.nextElementSibling;
    if (toggleLabel) {
        toggleLabel.style.transform = 'scale(1.1)';
        setTimeout(() => {
            toggleLabel.style.transform = '';
        }, 200);
    }
}

/**
 * Sets up all event listeners for the enhanced UI.
 */
function setupEventListeners() {
    // Main action buttons
    const feelLuckyButton = document.getElementById('feelLuckyButton');
    const generatePromptButton = document.getElementById('generatePromptButton');
    const generateApiPromptButton = document.getElementById('generateApiPromptButton');
    const sendPromptButton = document.getElementById('sendPromptButton');
    const stopBatchButton = document.getElementById('stopBatchButton');

    if (feelLuckyButton) {
        feelLuckyButton.addEventListener('click', handleFeelingLucky);
    }

    if (generatePromptButton) {
        generatePromptButton.addEventListener('click', handleGeneratePrompt);
    }

    if (generateApiPromptButton) {
        generateApiPromptButton.addEventListener('click', handleGenerateApiPrompt);
    }

    // Keywords textarea change handler
    const keywordsTextarea = document.getElementById('generatedKeywords');
    if (keywordsTextarea) {
        keywordsTextarea.addEventListener('input', handleKeywordsChange);
    }

    if (sendPromptButton) {
        sendPromptButton.addEventListener('click', handleSendPrompt);
    }

    if (stopBatchButton) {
        stopBatchButton.addEventListener('click', handleStopBatch);
    }

    // Configuration changes
    const llmEndpoint = document.getElementById('llmEndpoint');
    if (llmEndpoint) {
        llmEndpoint.addEventListener('change', handleLlmEndpointChange);
    }

    const formatRadios = document.querySelectorAll('input[name="promptFormat"]');
    formatRadios.forEach(radio => {
        radio.addEventListener('change', handlePromptFormatChange);
    });

    const comfyWorkflowSelect = document.getElementById('comfyWorkflowSelect');
    if (comfyWorkflowSelect) {
        comfyWorkflowSelect.addEventListener('change', handleComfyWorkflowChangeEvent);
    }

    const enableContinuousGen = document.getElementById('enableContinuousGen');
    if (enableContinuousGen) {
        enableContinuousGen.addEventListener('change', handleContinuousGenToggle);
    }

    // Quick action card click handlers
    const feelLuckyCard = document.getElementById('feelLuckyCard');
    const generateCard = document.getElementById('generateCard');

    if (feelLuckyCard) {
        feelLuckyCard.addEventListener('click', (e) => {
            if (e.target.closest('button') || e.target.closest('input')) return;
            handleFeelLucky();
        });
    }

    if (generateCard) {
        generateCard.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            handleGenerateKeywords();
        });
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to generate keywords
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleGenerateKeywords();
        }

        // Ctrl/Cmd + Shift + Enter to generate API prompt
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
            e.preventDefault();
            handleGenerateApiPrompt();
        }

        // Ctrl/Cmd + L for feeling lucky
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            handleFeelLucky();
        }
    });

    console.log('Enhanced event listeners set up successfully.');
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', setupEventListeners);
// --- "Use Selected Keywords" Button Functionality (v2) ---
document.addEventListener('DOMContentLoaded', () => {
    const submitKeywordsButton = document.getElementById('submitKeywordsButton');
    // This will be the target textarea in the new Section 3 (yet to be created in HTML)
    const targetKeywordsDisplayId = 'selectedKeywordsDisplayArea';
    // This button will be in the new Section 3 (yet to be created in HTML)
    const scrollToKeywordsBtnId = 'scrollToKeywordsButton';

    if (submitKeywordsButton) {
        submitKeywordsButton.addEventListener('click', () => {
            console.log('"Use Selected Keywords" button clicked.');
            if (window.selectedSwiperKeywords && window.selectedSwiperKeywords.size > 0) {
                const keywordsArray = Array.from(window.selectedSwiperKeywords);
                // Optionally shuffle or sort:
                // const shuffledKeywords = keywordsArray.sort(() => Math.random() - 0.5);
                const formattedKeywords = keywordsArray.join(', ');

                console.log('Selected keywords to use:', formattedKeywords);

                // Placeholder for populating the display area in the new Section 3
                // This part will fully work once Section 3 and the textarea are created.
                const displayArea = document.getElementById(targetKeywordsDisplayId);
                if (displayArea) {
                    displayArea.value = formattedKeywords;
                    console.log(`Populated ${targetKeywordsDisplayId} with keywords.`);
                } else {
                    console.warn(`${targetKeywordsDisplayId} not found. Will populate when section is created.`);
                    // Store temporarily if needed, or rely on next step to create the element
                    // For now, we'll just log. The actual population will happen when section 3 is made.
                }

                // Store for when section 3 is ready
                sessionStorage.setItem('keywordsForSection1v2', formattedKeywords);


                // Navigate to the new "Section 3" (assuming it will be index 2)
                if (typeof navigateToSection === 'function') {
                    console.log('Navigating to new Section 3 (index 2)...');
                    navigateToSection(1); // 0-indexed: Section 1 (Keywords Swiper) is 0, Old Section 2 (Prompt Gen) is 1, New Section 3 (LLM+Selected) is 2
                } else {
                    console.warn('navigateToSection function not found. Cannot navigate.');
                }
            } else {
                console.log('No keywords selected.');
                // Optionally, show a message to the user
                if (typeof showMessage === 'function') {
                    showMessage('mainMessageBox', 'Please select some keywords first using the slider.', 'warning');
                }
            }
        });
    } else {
        console.warn('submitKeywordsButton not found.');
    }

    // Event listener for "Scroll to Keywords" button (will be in new Section 3)
    // We are adding the listener now, the button itself will be created in a later step.
    // Using event delegation on a parent that will exist (e.g., document or a main container)
    // is more robust for dynamically added elements. For now, direct if it's simpler.
    // Let's assume a static button for now for direct binding, will adjust if dynamic.

    // The button itself doesn't exist yet. So, this listener might not attach to anything.
    // This will be properly attached when the HTML for section 3 is created.
    // For now, this code shows the intent.
    // A better approach is to add this listener when section 3 is actually created.
    // Or use event delegation on `document` for `scrollToKeywordsBtnId`.

    document.addEventListener('click', function(event) {
        if (event.target && event.target.id === scrollToKeywordsBtnId) {
            console.log('Scroll to Keywords button clicked.');
            if (typeof navigateToSection === 'function') {
                console.log('Navigating back to Keyword Selection (index 0)...');
                navigateToSection(0); // Navigate to Section 1 (Keywords Swiper)
            } else {
                console.warn('navigateToSection function not found. Cannot navigate.');
            }
        }
    });
});
