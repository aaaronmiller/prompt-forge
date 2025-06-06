// --- Main Orchestrator Script V1 ---

// Enhanced main script with modern UI features and animations

// Main script loading
console.log('🚀 Main script loading...');

// --- Global Constants (from original script.js) ---
const systemPromptTemplates = {
    auto: `You are an expert prompt engineer specializing in image generation for t-shirt designs. Your role is to transform user-selected keywords into compelling, creative prompts that will produce stunning visual results.

INSTRUCTIONS:
1. Use the user's selected keywords as strong inspiration to create a concise, vivid, and highly creative prompt suitable for a diffusion model like Flux or Stable Diffusion.
2. Focus on generating unique, artistic, and visually striking concepts that would work well as t-shirt graphics.
3. Combine elements in unexpected and creative ways to produce something truly original.
4. Ensure the prompt implies a style suitable for a t-shirt graphic (e.g., vector art, graphic illustration, stylized realism, abstract art, pop art, etc.).
5. Add 2-3 related but unique elements not explicitly selected by the user to enhance creativity and visual interest.
6. Consider composition, color theory, and visual impact when crafting the prompt.
7. The final output should be ONLY the generated image prompt itself, without any conversational text, preamble, or explanation.
8. Keep the final prompt under 350 words but make it as descriptive and evocative as possible within that limit.

Remember: Your goal is to create prompts that will result in eye-catching, memorable t-shirt designs that people would want to wear.`,

    keywords: `You are an expert prompt engineer generating prompts optimized for models like Stable Diffusion 1.5/2.x which prefer concise, keyword-driven input.

TASK: Analyze the user's selected keywords/concepts and transform them into an optimized prompt.

REQUIREMENTS:
1. Generate a prompt consisting primarily of comma-separated keywords and short, impactful phrases
2. Use parentheses for emphasis when needed, e.g., (masterpiece:1.2), (highly detailed:1.1)
3. Prioritize the most important visual elements in this order: subject, action, key style, environment
4. Include relevant artistic style keywords appropriate for a t-shirt design:
   - Art styles: vector art, illustration, graphic design, pop art, minimalist, retro, vintage
   - Technical: clean lines, bold colors, high contrast, sharp details
   - Lighting: dramatic lighting, neon glow, sunset lighting, studio lighting
5. Add 1-2 related creative elements beyond the user's selection to enhance visual appeal
6. Ensure the prompt will produce a design suitable for printing on fabric
7. Output ONLY the comma-separated prompt string, without description or preamble
8. Ensure the output is a single line for easy copying

FORMAT: keyword1, keyword2, (emphasized keyword:1.2), style descriptor, lighting, composition, additional elements

Keywords to transform: [USER_KEYWORDS_HERE]`,

    structured: `You are an expert prompt engineer generating highly detailed and structured prompts suitable for advanced models like SDXL or Flux.

OBJECTIVE: Create a comprehensive, well-structured prompt that will produce a stunning t-shirt design.

METHODOLOGY:
1. Analyze the user's selected keywords and concepts thoroughly
2. Create a vivid and imaginative prompt using a combination of descriptive phrases and specific keywords
3. Structure the prompt logically with clear sections: subject, action, environment, style, technical details
4. Focus on visual storytelling that would translate well to apparel

REQUIRED ELEMENTS:
- Subject Description: Clear, detailed description of the main subject(s)
- Action/Pose: What the subject is doing, dynamic elements
- Environment/Setting: Background, atmosphere, context
- Artistic Style: Specific art movement, technique, or aesthetic approach
- Visual Details: Textures, patterns, intricate elements that add depth
- Composition: Framing, perspective, rule of thirds, focal points
- Lighting: Type, direction, mood, special effects
- Color Palette: Dominant colors, contrasts, harmony
- Technical Quality: Resolution, detail level, rendering style

STYLE CONSIDERATIONS for T-Shirt Design:
- Ensure the design will be visually striking when printed on fabric
- Consider how the design will look at different sizes
- Emphasize bold, clear elements that won't get lost in printing
- Think about color contrast against typical shirt colors

ENHANCEMENT REQUIREMENTS:
- Incorporate 2-3 related creative elements to enhance uniqueness and visual interest
- Add unexpected details that make the design memorable
- Consider current design trends while maintaining timeless appeal

OUTPUT FORMAT: The final output should be ONLY the generated image prompt itself, without any conversational text, preamble, or explanation. Structure it as a flowing, descriptive prompt that reads naturally while hitting all the key elements. Keep it under 400 words but pack in as much vivid detail as possible.

User's Selected Keywords: [USER_KEYWORDS_HERE]`,

    sentences: `You are an expert prompt engineer crafting descriptive, sentence-based prompts suitable for models like DALL-E 3 that excel with natural language descriptions.

MISSION: Transform the user's keywords into a compelling narrative prompt that will generate an outstanding t-shirt design.

APPROACH:
1. Based on the user's selected keywords, write a short but rich paragraph (2-4 descriptive sentences)
2. Create a unique and artistic scene that would make an excellent t-shirt design
3. Focus on clear subject matter, engaging action, atmospheric setting, and emotional mood
4. Integrate artistic style descriptions naturally within the sentences
5. Paint a vivid picture with words that the AI can translate into stunning visuals

NARRATIVE ELEMENTS TO INCLUDE:
- Main Subject: Who or what is the focus of the design
- Setting/Environment: Where the scene takes place, atmospheric details
- Action/Movement: What's happening, dynamic elements
- Mood/Emotion: The feeling the design should evoke
- Artistic Style: Seamlessly woven into the description (e.g., "rendered in the style of detailed vector art with clean lines", "a painterly scene reminiscent of impressionism", "bold graphic novel aesthetic")
- Sensory Details: Colors, textures, lighting that bring the scene to life
- Unique Elements: 2-3 creative, related details not explicitly mentioned by the user

STYLE INTEGRATION EXAMPLES:
- "...illustrated in a vibrant pop art style with bold outlines and saturated colors..."
- "...rendered as a minimalist line drawing with elegant simplicity..."
- "...depicted in a retro synthwave aesthetic with neon gradients and geometric patterns..."
- "...created in the style of vintage travel posters with art deco influences..."

T-SHIRT DESIGN CONSIDERATIONS:
- Ensure the described scene will translate well to apparel
- Focus on designs that will be eye-catching and conversation-starting
- Consider visual impact and memorability
- Think about how the design will appeal to potential wearers

OUTPUT REQUIREMENTS: The final output must be ONLY the descriptive paragraph prompt, without any extra text, title, or introduction. Write in a flowing, engaging style that tells a visual story while providing clear direction for image generation.

User's Keywords to Transform: [USER_KEYWORDS_HERE]`
};

const comfyWorkflowSpecifics = {
    "GGUF_COMFY_WORKFLOW": {
        type: "gguf_unet",
        promptNodeId: "6", promptInputName: "text",
        negativePromptNodeId: "46", negativePromptInputName: "text",
        seedNodeId: "31", seedInputName: "seed",
        modelNodeId: "40", modelInputName: "unet_name",
        sizeNodeId: "27", widthInputName: "width", heightInputName: "height",
        stepsNodeId: "31", stepsInputName: "steps",
        defaultWidth: 832, defaultHeight: 1216, defaultSteps: 4, defaultNegativePrompt: "low quality, text, watermark, blurry"
    },
    "CHECKPOINT_COMFY_WORKFLOW": {
        type: "checkpoint",
        promptNodeId: "6", promptInputName: "text",
        negativePromptNodeId: "7", negativePromptInputName: "text",
        seedNodeId: "3", seedInputName: "seed",
        modelNodeId: "4", modelInputName: "ckpt_name",
        sizeNodeId: "5", widthInputName: "width", heightInputName: "height",
        stepsNodeId: "3", stepsInputName: "steps",
        defaultWidth: 512, defaultHeight: 768, defaultSteps: 20, defaultNegativePrompt: "low quality, text, watermark, blurry, bad anatomy"
    }
};

// --- Enhanced Application State ---
let appState = {
    isGenerating: false,
    isBatchRunning: false,
    currentBatchCount: 0,
    totalBatchCount: 0,
    lastGeneratedKeywords: '',
    lastApiPrompt: '',
    selectedTheme: 'default',
    animations: {
        enabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
};

// --- Enhanced Initialization ---
function initializeApplication() {
    console.log('Initializing Prompt Forge V1...');

    try {
        // Initialize UI components
        if (typeof initializeUI === 'function') {
            initializeUI();
        }

        // Set up enhanced event listeners
        if (typeof setupEventListeners === 'function') {
            setupEventListeners();
        }

        // Initialize theme system
        initializeThemeSystem();

        // Initialize accessibility features
        initializeAccessibility();

        // Initialize section navigation
        initializeSectionNavigation();

        // Initialize keyword slider
        initializeKeywordSlider();

        // Initialize Feeling Lucky button
        initializeFeelLucky();

        // Initialize performance monitoring
        initializePerformanceMonitoring();

        // Load saved preferences
        loadUserPreferences();

        // Initialize tooltips and help system
        initializeHelpSystem();

        // Set up auto-save functionality
        initializeAutoSave();

        console.log('Prompt Forge V1 initialized successfully!');

        // Show welcome message
        setTimeout(() => {
            showMessage('mainMessageBox', 'Welcome to Prompt Forge V1! 🎨 Select a theme and start creating amazing prompts.', 'info', 5000);
        }, 1000);

    } catch (error) {
        console.error('Error initializing application:', error);
        showMessage('mainMessageBox', 'Error initializing application. Please refresh the page.', 'error');
    }
}

/**
 * Initializes the theme system with enhanced features.
 */

function initializeThemeSystem() {
    // Initialize theme randomizer state
    window.themeRandomizer = {
        isLocked: localStorage.getItem('prompt-forge-theme-locked') === 'true',
        themes: ['default', 'purple', 'green', 'orange', 'red'], // Color themes
        styles: ['curved'] // Only 'curved' style
    };

    // Force 'curved' style
    document.body.setAttribute('data-style', 'curved');
    localStorage.setItem('prompt-forge-style', 'curved');
    // console.log("Default style set to 'curved'.");

    const savedThemeColor = localStorage.getItem('prompt-forge-theme') || 'default';

    if (!window.themeRandomizer.isLocked) {
        // If not locked, randomize theme color but keep style 'curved'
        const randomThemeColor = window.themeRandomizer.themes[
            Math.floor(Math.random() * window.themeRandomizer.themes.length)
        ];
        setTheme(randomThemeColor); // setTheme only handles color theme attribute
        updateThemeUI(randomThemeColor, 'curved');
    } else {
        setTheme(savedThemeColor);
        updateThemeUI(savedThemeColor, 'curved');
    }

    // Theme randomizer button (randomizeThemeButton) - now only randomizes color
    const randomizeBtn = document.getElementById('randomizeThemeButton');
    if (randomizeBtn) {
        randomizeBtn.addEventListener('click', randomizeTheme);
    }

    // Lock button for theme color
    const lockBtn = document.getElementById('lockThemeButton');
    if (lockBtn) {
        lockBtn.addEventListener('click', toggleThemeLock);
        if (window.themeRandomizer.isLocked) {
            lockBtn.classList.add('locked');
            if (lockBtn.querySelector('i')) lockBtn.querySelector('i').className = 'fas fa-lock';
            lockBtn.title = 'Unlock Theme (Currently Locked)';
        }
    }

    // Theme (color) switching buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const themeColor = btn.dataset.theme;
            setTheme(themeColor);
            updateThemeUI(themeColor, 'curved'); // Style is fixed
        });
    });
    // Style selection buttons are removed from HTML, so no listeners needed.

    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    console.log("Theme system initialized: 'curved' style default, color theme features active.");
}

/**
 * Randomizes theme and style.
 */

function randomizeTheme() { // This function is called by the "Random Look" button
    if (window.themeRandomizer && window.themeRandomizer.isLocked) return;

    // Only randomize theme color
    const randomThemeColor = window.themeRandomizer.themes[
        Math.floor(Math.random() * window.themeRandomizer.themes.length)
    ];
    const fixedStyleName = 'Curved'; // For display message

    setTheme(randomThemeColor);
    // setStyle('curved') is implicitly handled or not needed if always curved
    updateThemeUI(randomThemeColor, 'curved'); // Update UI for theme and fixed style

    const themeColorNames = { default: 'Ocean Blue', purple: 'Cosmic Purple', green: 'Forest Green', orange: 'Sunset Orange', red: 'Crimson Red' };

    if (typeof showMessage === 'function') {
        setTimeout(() => {
            showMessage('mainMessageBox',
                `Theme: ${themeColorNames[randomThemeColor]} + ${fixedStyleName} Style`,
                'info', 2000);
        }, 500);
    }
    console.log(`Randomized theme to ${randomThemeColor}, style remains curved.`);
}

/**
 * Toggles theme lock.
 */
function toggleThemeLock() {
    if (!window.themeRandomizer) return;

    window.themeRandomizer.isLocked = !window.themeRandomizer.isLocked;
    localStorage.setItem('prompt-forge-theme-locked', window.themeRandomizer.isLocked.toString());

    const lockBtn = document.getElementById('lockThemeButton');
    const lockIcon = lockBtn.querySelector('i');

    if (window.themeRandomizer.isLocked) {
        lockBtn.classList.add('locked');
        lockIcon.className = 'fas fa-lock';
        lockBtn.title = 'Unlock Theme (Currently Locked)';
        showMessage('mainMessageBox', 'Theme locked! Manual selection still works.', 'info', 2000);
    } else {
        lockBtn.classList.remove('locked');
        lockIcon.className = 'fas fa-lock-open';
        lockBtn.title = 'Lock Current Theme';
        showMessage('mainMessageBox', 'Theme unlocked! Will randomize on refresh.', 'info', 2000);
    }
}

/**
 * Updates theme UI elements.
 */
function updateThemeUI(theme, style) {
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });

    if (style) {
    }
}

/**
 * Updates style UI elements.
 */

/**
 * Sets the theme and saves it to localStorage.
 */
function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('prompt-forge-theme', theme);
    if (window.appState) {
        window.appState.selectedTheme = theme;
    }
}

/**
 * Sets the style and saves it to localStorage.
 */
}

function setStyle(style) { // Parameter 'style' is now ignored, always 'curved'
    const forcedStyle = 'curved';
    document.body.setAttribute('data-style', forcedStyle);
    localStorage.setItem('prompt-forge-style', forcedStyle);
    if (window.appState) {
        window.appState.selectedStyle = forcedStyle; // Update appState if used
    }
    // console.log(`Style enforced: ${forcedStyle}`);
}

/**
 * Initializes accessibility features.
 */
function initializeAccessibility() {
    // Add ARIA labels and descriptions
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        if (!button.getAttribute('aria-label') && button.title) {
            button.setAttribute('aria-label', button.title);
        }
    });

    // Add keyboard navigation hints
    const keyboardHints = document.createElement('div');
    keyboardHints.className = 'keyboard-hints sr-only';
    keyboardHints.innerHTML = `
        <p>Keyboard shortcuts:</p>
        <ul>
            <li>Ctrl/Cmd + Enter: Generate Keywords</li>
            <li>Ctrl/Cmd + Shift + Enter: Generate AI Prompt</li>
            <li>Ctrl/Cmd + L: Feeling Lucky</li>
        </ul>
    `;
    document.body.appendChild(keyboardHints);

    // Add focus management
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
}

/**
 * Initializes performance monitoring.
 */
function initializePerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);

        // Report slow loads
        if (loadTime > 3000) {
            console.warn('Slow page load detected');
        }
    });

    // Monitor memory usage (if available)
    if ('memory' in performance) {
        setInterval(() => {
            const memory = performance.memory;
            if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
                console.warn('High memory usage detected');
            }
        }, 30000); // Check every 30 seconds
    }
}

/**
 * Loads user preferences from localStorage.
 */
function loadUserPreferences() {
    try {
        const preferences = JSON.parse(localStorage.getItem('prompt-forge-preferences') || '{}');

        // Apply saved preferences
        if (preferences.animationsEnabled !== undefined) {
            appState.animations.enabled = preferences.animationsEnabled;
        }

        if (preferences.autoSave !== undefined) {
            appState.autoSave = preferences.autoSave;
        }

        // Apply LLM settings
        if (preferences.llmEndpoint) {
            const llmEndpoint = document.getElementById('llmEndpoint');
            if (llmEndpoint) llmEndpoint.value = preferences.llmEndpoint;
        }

        if (preferences.promptFormat) {
            const formatRadio = document.querySelector(`input[name="promptFormat"][value="${preferences.promptFormat}"]`);
            if (formatRadio) formatRadio.checked = true;
        }

    } catch (error) {
        console.warn('Error loading user preferences:', error);
    }
}

/**
 * Saves user preferences to localStorage.
 */
function saveUserPreferences() {
    try {
        const preferences = {
            animationsEnabled: appState.animations.enabled,
            autoSave: appState.autoSave,
            llmEndpoint: document.getElementById('llmEndpoint')?.value,
            promptFormat: document.querySelector('input[name="promptFormat"]:checked')?.value,
            theme: appState.selectedTheme
        };

        localStorage.setItem('prompt-forge-preferences', JSON.stringify(preferences));
    } catch (error) {
        console.warn('Error saving user preferences:', error);
    }
}

/**
 * Initializes the help system with tooltips and guides.
 */
function initializeHelpSystem() {
    // Add tooltips to complex elements
    const tooltipElements = document.querySelectorAll('[title]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });

    // Add contextual help
    const helpButton = document.createElement('button');
    helpButton.className = 'help-button';
    helpButton.innerHTML = '<i class="fas fa-question-circle"></i>';
    helpButton.title = 'Show help';
    helpButton.onclick = showHelpModal;

    document.body.appendChild(helpButton);
}

/**
 * Shows a tooltip for an element.
 */
function showTooltip(event) {
    const element = event.target;
    const title = element.title;
    if (!title) return;

    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = title;
    document.body.appendChild(tooltip);

    // Position tooltip
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';

    // Store reference for cleanup
    element._tooltip = tooltip;

    // Temporarily remove title to prevent browser tooltip
    element._originalTitle = title;
    element.removeAttribute('title');
}

/**
 * Hides a tooltip for an element.
 */
function hideTooltip(event) {
    const element = event.target;
    if (element._tooltip) {
        element._tooltip.remove();
        delete element._tooltip;
    }

    if (element._originalTitle) {
        element.title = element._originalTitle;
        delete element._originalTitle;
    }
}

/**
 * Shows the help modal.
 */
function showHelpModal() {
    // Implementation would show a modal with help content
    console.log('Help modal would be shown here');
}

/**
 * Initializes auto-save functionality.
 */
function initializeAutoSave() {
    let autoSaveTimer;

    const autoSave = () => {
        saveUserPreferences();
        saveWorkInProgress();
    };

    // Auto-save on form changes
    document.addEventListener('change', () => {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(autoSave, 2000); // Save 2 seconds after last change
    });

    // Save on page unload
    window.addEventListener('beforeunload', autoSave);
}

/**
 * Saves work in progress to localStorage.
 */
function saveWorkInProgress() {
    try {
        const workInProgress = {
            generatedKeywords: document.getElementById('generatedKeywords')?.value || '',
            apiGeneratedPrompt: document.getElementById('apiGeneratedPrompt')?.value || '',
            systemPrompt: document.getElementById('systemPrompt')?.value || '',
            selectedKeywords: getSelectedKeywords(),
            timestamp: Date.now()
        };

        localStorage.setItem('prompt-forge-work', JSON.stringify(workInProgress));
    } catch (error) {
        console.warn('Error saving work in progress:', error);
    }
}

/**
 * Gets currently selected keywords from the textarea.
 */
function getSelectedKeywords() {
    const keywordsTextarea = document.getElementById('generatedKeywords');
    if (!keywordsTextarea || !keywordsTextarea.value.trim()) {
        return [];
    }

    // Split by comma and clean up
    return keywordsTextarea.value
        .split(',')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0)
        .map(keyword => ({
            value: keyword,
            label: keyword
        }));
}

/**
 * Restores work in progress from localStorage.
 */

function restoreWorkInProgress() {
    try {
        const saved = JSON.parse(localStorage.getItem('prompt-forge-work') || '{}');

        if (saved.timestamp && (Date.now() - saved.timestamp) < 24 * 60 * 60 * 1000) { // 24 hours
            // If old 'generatedKeywords' exists in saved work, move it to sessionStorage
            // so that section-1-v2's display area can be populated by navigation logic.
            if (saved.generatedKeywords) {
                 sessionStorage.setItem('keywordsForSection1v2', saved.generatedKeywords);
                 console.log("Restored 'generatedKeywords' from localStorage work-in-progress to sessionStorage ('keywordsForSection1v2').");
            }

            // Restore other text areas directly
            const apiTextarea = document.getElementById('apiGeneratedPrompt');
            if (apiTextarea && saved.apiGeneratedPrompt) {
                apiTextarea.value = saved.apiGeneratedPrompt;
            }

            const systemTextarea = document.getElementById('systemPrompt');
            if (systemTextarea && saved.systemPrompt) {
                systemTextarea.value = saved.systemPrompt;
            }

            // Restoring individual keyword selections into Swiper UI from here is complex
            // and might conflict with current state or user actions.
            // Users can re-select or use "Feeling Lucky".
            // If `saved.selectedKeywords` (the old array of objects) needs to be processed
            // to re-populate `window.selectedSwiperKeywords` and update Swiper UI,
            // that would be a more involved addition here. For now, keeping it simple.

            console.log('Work in progress restored (apiGeneratedPrompt, systemPrompt, and keywords to sessionStorage).');
        }
    } catch (error) {
        console.warn('Error restoring work in progress:', error);
    }
}

            if (saved.apiGeneratedPrompt) {
                const apiTextarea = document.getElementById('apiGeneratedPrompt');
                if (apiTextarea) apiTextarea.value = saved.apiGeneratedPrompt;
            }

            if (saved.systemPrompt) {
                const systemTextarea = document.getElementById('systemPrompt');
                if (systemTextarea) systemTextarea.value = saved.systemPrompt;
            }

            // Restore selected keywords
            if (saved.selectedKeywords && saved.selectedKeywords.length > 0) {
                setTimeout(() => {
                    saved.selectedKeywords.forEach(keyword => {
                        const checkbox = document.getElementById(keyword.id);
                        if (checkbox) {
                            checkbox.checked = true;
                            checkbox.dispatchEvent(new Event('change'));
                        }
                    });
                }, 1000); // Wait for UI to be ready
            }

            console.log('Work in progress restored');
        }
    } catch (error) {
        console.warn('Error restoring work in progress:', error);
    }
}

/**
 * Enhanced error handling with user-friendly messages.
 */
function handleError(error, context = 'Application') {
    if (!error) {
        console.warn(`${context} Error: handleError was called with a null or undefined error object.`);
        // Optionally, display a generic message to the user or simply return
        showMessage('mainMessageBox', 'An unexpected error occurred. (No error details available)', 'error');
        return;
    }

    console.error(`${context} Error:`, error);

    let userMessage = 'An unexpected error occurred. ';

    // It's safer to check if error.message exists before trying to access it.
    const errorMessage = error.message || '';

    if (error.name === 'NetworkError' || errorMessage.includes('fetch')) {
        userMessage += 'Please check your internet connection and try again.';
    } else if (errorMessage.includes('API')) {
        userMessage += 'There was an issue with the API. Please check your configuration.';
    } else {
        userMessage += 'Please try refreshing the page.';
    }

    showMessage('mainMessageBox', userMessage, 'error');
}

/**
 * Enhanced batch generation with progress tracking.
 */
function runBatchGeneration(count, mode) {
    appState.isBatchRunning = true;
    appState.currentBatchCount = 0;
    appState.totalBatchCount = count;

    const runNextGeneration = async () => {
        if (!appState.isBatchRunning || appState.currentBatchCount >= appState.totalBatchCount) {
            appState.isBatchRunning = false;
            showMessage('configMessageBox', `Batch generation completed! Generated ${appState.currentBatchCount} images.`, 'success');
            return;
        }

        appState.currentBatchCount++;

        // Show progress
        showProgressIndicator('configMessageBox', appState.currentBatchCount, appState.totalBatchCount,
            `Generating image ${appState.currentBatchCount} of ${appState.totalBatchCount}...`);

        try {
            // Generate based on mode
            if (mode === 'new_lucky_api') {
                handleFeelLucky();
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for keywords
                await generateApiPrompt();
            } else if (mode === 'keep_keywords_new_api') {
                await generateApiPrompt();
            }

            // Send to image generation
            await sendPromptToImageGen();

            // Continue with next generation
            setTimeout(runNextGeneration, 2000); // 2 second delay between generations

        } catch (error) {
            handleError(error, 'Batch Generation');
            appState.isBatchRunning = false;
        }
    };

    runNextGeneration();
}

/**
 * Stops batch generation.
 */
function stopBatchGeneration() {
    appState.isBatchRunning = false;
    console.log('Batch generation stopped by user');
}

// --- Application Lifecycle ---

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
    initializeApplication();
}

// Restore work in progress after UI is set up
window.addEventListener('load', () => {
    setTimeout(restoreWorkInProgress, 2000);
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        saveUserPreferences();
        saveWorkInProgress();
    }
});

// Global error handler
window.addEventListener('error', (event) => {
    handleError(event.error, 'Global');
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    handleError(event.reason, 'Promise');
});

/**
 * Initializes the vertical section navigation system.
 */

function initializeSectionNavigation() {
    console.log('Initializing section navigation (v2.2)...');
    const navDots = document.querySelectorAll('.nav-dots .nav-dot');
    const appContainer = document.querySelector('.app-container');
    let sections = [];
    if (appContainer) {
        sections = Array.from(appContainer.children).filter(
            s => s.tagName === 'SECTION' && s.id && s.id.match(/^section-\d+-v2$/)
        );
    } else {
        console.error("App container not found for section navigation!");
        return;
    }

    console.log(`Found ${navDots.length} nav dots and ${sections.length} v2 sections for navigation.`);
    let currentSectionIndex = 0;

    function updateActiveSection(newIndex, scroll = true) {
        if (newIndex < 0 || newIndex >= sections.length) {
            console.warn(`Attempted to navigate to invalid section index: ${newIndex}`);
            return;
        }

        if (newIndex === currentSectionIndex && sections[newIndex]?.classList.contains('active')) {
            if (scroll && sections[newIndex]) {
                sections[newIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            return;
        }

        if (currentSectionIndex >=0 && sections[currentSectionIndex]) {
            sections[currentSectionIndex].classList.remove('active');
        }
        if (currentSectionIndex >=0 && navDots.length > currentSectionIndex && navDots[currentSectionIndex]) {
             navDots[currentSectionIndex].classList.remove('active');
        }


        currentSectionIndex = newIndex;

        if (sections[currentSectionIndex]) {
            sections[currentSectionIndex].classList.add('active');
            if (scroll) {
                 sections[currentSectionIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            // NEW CODE: Initialize Swiper for section-0-v2 when it becomes active
            if (sections[currentSectionIndex].id === 'section-0-v2') {
                if (typeof window.initKeywordSwiper === 'function') {
                    console.log('Section section-0-v2 is active, attempting to initialize keyword Swiper.');
                    window.initKeywordSwiper();
                } else {
                    console.warn('initKeywordSwiper function not found, cannot initialize Swiper for section-0-v2.');
                }
            }
            // END OF NEW CODE

            if (sections[currentSectionIndex].id === 'section-1-v2') {
                const keywordsDisplay = document.getElementById('selectedKeywordsDisplayArea');
                if (keywordsDisplay) {
                    const storedKeywords = sessionStorage.getItem('keywordsForSection1v2');
                    if (storedKeywords) {
                        keywordsDisplay.value = storedKeywords;
                        console.log('Populated selectedKeywordsDisplayArea from sessionStorage for section-1-v2.');
                    }
                }
            }
        }
        if (navDots.length > currentSectionIndex && navDots[currentSectionIndex]) {
            navDots[currentSectionIndex].classList.add('active');
        }

        try {
            window.location.hash = sections[currentSectionIndex] ? sections[currentSectionIndex].id : `section-${currentSectionIndex}`;
        } catch (e) {
            console.warn("Could not set window.location.hash.");
        }
        console.log(`Navigated to section: ${currentSectionIndex} (${sections[currentSectionIndex]?.id})`);
    }

    window.navigateToSection = function(sectionIndex, doScroll = true) {
        if (sectionIndex >= 0 && sectionIndex < sections.length) {
            updateActiveSection(sectionIndex, doScroll);
        } else {
            console.warn(`Invalid section index for navigateToSection: ${sectionIndex}, total sections: ${sections.length}`);
        }
    };

    navDots.forEach((dot) => {
        const sectionV2Index = parseInt(dot.getAttribute('data-section-v2'), 10);
        if (!isNaN(sectionV2Index) && sectionV2Index < sections.length) {
            dot.addEventListener('click', () => window.navigateToSection(sectionV2Index));
        } else {
            const fallbackIndex = parseInt(dot.getAttribute('data-section'), 10);
            if (!isNaN(fallbackIndex) && fallbackIndex < sections.length){
                 dot.addEventListener('click', () => window.navigateToSection(fallbackIndex));
                 console.warn(`Nav dot using fallback 'data-section':`, dot);
            } else {
                console.warn("Nav dot found without valid 'data-section-v2' or 'data-section' or index out of bounds:", dot);
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (currentSectionIndex > 0) window.navigateToSection(currentSectionIndex - 1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (currentSectionIndex < sections.length - 1) window.navigateToSection(currentSectionIndex + 1);
            }
        }
    });

    const hash = window.location.hash ? window.location.hash.substring(1) : '';
    const initialSectionIdx = sections.findIndex(s => s.id === hash);

    if (initialSectionIdx !== -1) {
        updateActiveSection(initialSectionIdx, false);
    } else if (sections.length > 0) {
        updateActiveSection(0, false);
    }

    const openKeywordSliderButton = document.getElementById('openKeywordSliderButton');
    if (openKeywordSliderButton) {
        openKeywordSliderButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.navigateToSection(0);
        });
    }
    console.log('Section navigation (v2.2) initialized.');
}
 else {
        console.error("App container not found for section navigation!");
        return;
    }

    console.log(`Found ${navDots.length} nav dots and ${sections.length} v2 sections for navigation.`);
    let currentSectionIndex = 0;

    function updateActiveSection(newIndex, scroll = true) {
        // Check if newIndex is valid
        if (newIndex < 0 || newIndex >= sections.length) {
            console.warn(`Attempted to navigate to invalid section index: ${newIndex}`);
            return;
        }

        if (newIndex === currentSectionIndex && sections[newIndex]?.classList.contains('active')) {
            if (scroll && sections[newIndex]) { // Scroll to top if already active
                sections[newIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            return;
        }

        if (sections[currentSectionIndex]) { // Deactivate current if valid
            sections[currentSectionIndex].classList.remove('active');
        }
        if (navDots[currentSectionIndex]) { // Deactivate current dot if valid
             navDots[currentSectionIndex].classList.remove('active');
        }

        currentSectionIndex = newIndex;

        if (sections[currentSectionIndex]) {
            sections[currentSectionIndex].classList.add('active');
            if (scroll) {
                 sections[currentSectionIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            // Populate selected keywords if navigating to section-1-v2
            if (sections[currentSectionIndex].id === 'section-1-v2') {
                const keywordsDisplay = document.getElementById('selectedKeywordsDisplayArea');
                if (keywordsDisplay) {
                    const storedKeywords = sessionStorage.getItem('keywordsForSection1v2'); // Updated key
                    if (storedKeywords) {
                        keywordsDisplay.value = storedKeywords;
                        console.log('Populated selectedKeywordsDisplayArea from sessionStorage for section-1-v2.');
                    }
                }
            }
        }
        if (navDots[currentSectionIndex]) {
            navDots[currentSectionIndex].classList.add('active');
        }

        try {
            window.location.hash = sections[currentSectionIndex] ? sections[currentSectionIndex].id : `section-${currentSectionIndex}`;
        } catch (e) {
            console.warn("Could not set window.location.hash (possibly in test environment).");
        }
        console.log(`Navigated to section: ${currentSectionIndex} (${sections[currentSectionIndex]?.id})`);
    }

    window.navigateToSection = function(sectionIndex, doScroll = true) {
        if (sectionIndex >= 0 && sectionIndex < sections.length) {
            updateActiveSection(sectionIndex, doScroll);
        } else {
            console.warn(`Invalid section index for navigateToSection: ${sectionIndex}, total sections: ${sections.length}`);
        }
    };

    navDots.forEach((dot, index) => {
        // Use data-section-v2 attribute for mapping dots to sections
        const sectionV2Index = parseInt(dot.getAttribute('data-section-v2'), 10);
        if (!isNaN(sectionV2Index)) {
            dot.addEventListener('click', () => window.navigateToSection(sectionV2Index));
        } else {
            console.warn("Nav dot found without valid 'data-section-v2' attribute:", dot);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) { // Ensure this is not interfering with text input
            if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
                return; // Don't interfere with text editing
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (currentSectionIndex > 0) window.navigateToSection(currentSectionIndex - 1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (currentSectionIndex < sections.length - 1) window.navigateToSection(currentSectionIndex + 1);
            }
        }
    });

    const hash = window.location.hash ? window.location.hash.substring(1) : '';
    const initialSectionIdx = sections.findIndex(s => s.id === hash);

    if (initialSectionIdx !== -1) {
        // Found section by hash, activate it without initial scroll
        updateActiveSection(initialSectionIdx, false);
    } else if (sections.length > 0) {
        // Default to first v2 section if no valid hash, no initial scroll
        updateActiveSection(0, false);
    }


    // Ensure "Select Keywords" card button navigates to section-0-v2 (Keyword Selection)
    const openKeywordSliderButton = document.getElementById('openKeywordSliderButton');
    if (openKeywordSliderButton) {
        openKeywordSliderButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.navigateToSection(0); // New Section 0 (Keywords)
        });
    }
    console.log('Section navigation (v2.1) initialized.');
}
);
    });

    // Navigate to section function

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    if (currentSection > 0) navigateToSection(currentSection - 1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (currentSection < sections.length - 1) navigateToSection(currentSection + 1);
                    break;
            }
        }
    });

    // Handle initial hash
    const hash = window.location.hash;
    if (hash.startsWith('#section-')) {
        const sectionIndex = parseInt(hash.replace('#section-', ''));
        if (sectionIndex >= 0 && sectionIndex < sections.length) {
            navigateToSection(sectionIndex);
        }
    }

    // Update "Select Keywords" button to navigate to section 1
    const openKeywordSliderButton = document.getElementById('openKeywordSliderButton');
    if (openKeywordSliderButton) {
        openKeywordSliderButton.addEventListener('click', () => {
            navigateToSection(1);
        });
    }

    console.log('✅ Section navigation initialized');
}

/**
 * Handles the "Feeling Lucky" functionality - randomly selects keywords
 */

function handleFeelLucky() {
    console.log('Feeling Lucky v2 activated!');
    const feelLuckyButton = document.getElementById('feelLuckyButton');

    if (typeof setButtonLoading === 'function' && feelLuckyButton) {
        setButtonLoading(feelLuckyButton, true);
    }

    try {
        const quantityRadios = document.querySelectorAll('input[name="luckyQuantity"]');
        let selectedQuantityRange = '10-20';
        quantityRadios.forEach(radio => {
            if (radio.checked) {
                selectedQuantityRange = radio.value;
            }
        });

        const [minStr, maxStr] = selectedQuantityRange.split('-');
        const minQty = parseInt(minStr, 10) || 10;
        const maxQty = parseInt(maxStr, 10) || 20;
        const targetCount = Math.floor(Math.random() * (maxQty - minQty + 1)) + minQty;
        console.log(`Target keyword count: ${targetCount}`);

        let allKeywordsFlat = [];
        if (window.keywordCategories && Object.keys(window.keywordCategories).length > 0) {
            Object.values(window.keywordCategories).forEach(categoryKeywords => {
                allKeywordsFlat.push(...categoryKeywords);
            });
        } else {
            console.error('No keywordCategories available for Feeling Lucky!');
            if (typeof showMessage === 'function') {
                showMessage('mainMessageBox', 'Keyword data not available.', 'error');
            }
            if (typeof setButtonLoading === 'function' && feelLuckyButton) {
                setButtonLoading(feelLuckyButton, false);
            }
            return;
        }

        if (allKeywordsFlat.length === 0) {
            console.error('No keywords available in keywordCategories!');
            if (typeof showMessage === 'function') {
                showMessage('mainMessageBox', 'No keywords to pick from.', 'error');
            }
            if (typeof setButtonLoading === 'function' && feelLuckyButton) {
                setButtonLoading(feelLuckyButton, false);
            }
            return;
        }

        if (window.selectedSwiperKeywords) {
            window.selectedSwiperKeywords.clear();
        } else {
            window.selectedSwiperKeywords = new Set();
        }

        const allSwiperKeywordItems = document.querySelectorAll('#section-0-v2 .swiper .keyword-item');
        allSwiperKeywordItems.forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = false;
            }
            item.classList.remove('selected');
        });
        console.log('Cleared previous Swiper selections from section-0-v2.');

        const uniqueKeywords = Array.from(new Set(allKeywordsFlat));
        const shuffledKeywords = uniqueKeywords.sort(() => 0.5 - Math.random());
        const newRandomlySelectedKeywords = shuffledKeywords.slice(0, Math.min(targetCount, shuffledKeywords.length));

        newRandomlySelectedKeywords.forEach(keywordValue => {
            window.selectedSwiperKeywords.add(keywordValue);
            const swiperKeywordItem = document.querySelector(`#section-0-v2 .swiper .keyword-item[data-keyword="${CSS.escape(keywordValue)}"]`);
            if (swiperKeywordItem) {
                const checkbox = swiperKeywordItem.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.checked = true;
                }
                swiperKeywordItem.classList.add('selected');
            }
        });
        console.log('Populated Swiper in section-0-v2 with new random keywords:', newRandomlySelectedKeywords);

        const submitButton = document.getElementById('submitKeywordsButton');
        if (submitButton && submitButton.querySelector('span')) {
            submitButton.querySelector('span').textContent = `Use Selected Keywords (${window.selectedSwiperKeywords.size})`;
        }

        const formattedKeywords = newRandomlySelectedKeywords.join(', ');
        sessionStorage.setItem('keywordsForSection1v2', formattedKeywords);
        console.log('Stored keywords for Section1v2:', formattedKeywords);

        const displayArea = document.getElementById('selectedKeywordsDisplayArea');
        if (displayArea) {
            displayArea.value = formattedKeywords;
        }

        if (typeof navigateToSection === 'function') {
            console.log('Navigating to new Section 1 (index 1) after Feeling Lucky...');
            navigateToSection(1);
        } else {
            console.warn('navigateToSection function not found.');
        }

        if (typeof showMessage === 'function') {
            showMessage('mainMessageBox', `Feeling Lucky! ${newRandomlySelectedKeywords.length} keywords selected.`, 'success', 3000);
        }

    } catch (error) {
        console.error("Error in handleFeelLucky (v2):", error);
        if (typeof showMessage === 'function') {
            showMessage('mainMessageBox', 'Error during Feeling Lucky.', 'error');
        }
    } finally {
        if (typeof setButtonLoading === 'function' && feelLuckyButton) {
            setButtonLoading(feelLuckyButton, false);
        }
    }
}


    try {
        const quantityRadios = document.querySelectorAll('input[name="luckyQuantity"]');
        let selectedQuantityRange = '10-20';
        quantityRadios.forEach(radio => {
            if (radio.checked) {
                selectedQuantityRange = radio.value;
            }
        });

        const [minStr, maxStr] = selectedQuantityRange.split('-');
        const minQty = parseInt(minStr, 10) || 10;
        const maxQty = parseInt(maxStr, 10) || 20;
        const targetCount = Math.floor(Math.random() * (maxQty - minQty + 1)) + minQty;
        console.log(`Target keyword count: ${targetCount}`);

        let allKeywordsFlat = [];
        if (window.keywordCategories && Object.keys(window.keywordCategories).length > 0) {
            Object.values(window.keywordCategories).forEach(categoryKeywords => {
                allKeywordsFlat.push(...categoryKeywords);
            });
        } else {
            console.error('No keywordCategories available for Feeling Lucky!');
            if (typeof showMessage === 'function') {
                showMessage('mainMessageBox', 'Keyword data not available.', 'error');
            }
            return;
        }

        if (allKeywordsFlat.length === 0) {
            console.error('No keywords available in keywordCategories!');
            if (typeof showMessage === 'function') {
                showMessage('mainMessageBox', 'No keywords to pick from.', 'error');
            }
            return;
        }

        if (window.selectedSwiperKeywords) {
            window.selectedSwiperKeywords.clear();
        } else {
            window.selectedSwiperKeywords = new Set();
        }

        const allSwiperKeywordItems = document.querySelectorAll('#section-1 .swiper .keyword-item');
        allSwiperKeywordItems.forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = false;
            }
            item.classList.remove('selected');
        });
        console.log('Cleared previous Swiper selections.');

        const uniqueKeywords = Array.from(new Set(allKeywordsFlat));
        const shuffledKeywords = uniqueKeywords.sort(() => 0.5 - Math.random());
        const newRandomlySelectedKeywords = shuffledKeywords.slice(0, Math.min(targetCount, shuffledKeywords.length));

        newRandomlySelectedKeywords.forEach(keywordValue => {
            window.selectedSwiperKeywords.add(keywordValue);
            const swiperKeywordItem = document.querySelector(`#section-1 .swiper .keyword-item[data-keyword="${CSS.escape(keywordValue)}"]`);
            if (swiperKeywordItem) {
                const checkbox = swiperKeywordItem.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.checked = true;
                }
                swiperKeywordItem.classList.add('selected');
            }
        });
        console.log('Populated Swiper with new random keywords:', newRandomlySelectedKeywords);

        const submitButton = document.getElementById('submitKeywordsButton');
        if (submitButton && submitButton.querySelector('span')) {
            submitButton.querySelector('span').textContent = `Use Selected Keywords (${window.selectedSwiperKeywords.size})`;
        }

        const formattedKeywords = newRandomlySelectedKeywords.join(', ');
        sessionStorage.setItem('keywordsForSection3', formattedKeywords);
        console.log('Stored keywords for Section 3:', formattedKeywords);

        const displayArea = document.getElementById('selectedKeywordsDisplayAreaInSection3');
        if (displayArea) {
            displayArea.value = formattedKeywords;
        }

        if (typeof navigateToSection === 'function') {
            console.log('Navigating to new Section 3 (index 2) after Feeling Lucky...');
            navigateToSection(1);
        } else {
            console.warn('navigateToSection function not found.');
        }

        if (typeof showMessage === 'function') {
            showMessage('mainMessageBox', `Feeling Lucky! ${newRandomlySelectedKeywords.length} keywords selected.`, 'success', 3000);
        }

    } catch (error) {
        console.error("Error in handleFeelLucky (v2):", error);
        if (typeof showMessage === 'function') {
            showMessage('mainMessageBox', 'Error during Feeling Lucky.', 'error');
        }
    } finally {
        if (typeof setButtonLoading === 'function' && feelLuckyButton) {
            setButtonLoading(feelLuckyButton, false);
        }
    }
}

    });

    console.log('🎯 Selected quantity:', selectedQuantity);

    // Parse quantity range
    const [min, max] = selectedQuantity.split('-').map(Number);
    const targetCount = Math.floor(Math.random() * (max - min + 1)) + min;

    console.log('🎲 Target keyword count:', targetCount);

    // Get all available keywords from all categories
    const allKeywords = [];
    if (window.keywordCategories) {
        Object.values(window.keywordCategories).forEach(category => {
            if (category.keywords) {
                allKeywords.push(...category.keywords);
            }
        });
    }

    console.log('📝 Total available keywords:', allKeywords.length);

    if (allKeywords.length === 0) {
        console.error('❌ No keywords available!');
        return;
    }

    // Randomly select keywords
    const selectedKeywords = [];
    const shuffledKeywords = [...allKeywords].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(targetCount, shuffledKeywords.length); i++) {
        selectedKeywords.push(shuffledKeywords[i]);
    }

    console.log('✅ Selected keywords:', selectedKeywords);

    // Update the keywords textarea in the prompts section
    const keywordsTextarea = document.getElementById('generatedKeywords');
    if (keywordsTextarea) {
        keywordsTextarea.value = selectedKeywords.join(', ');
        console.log('📝 Updated keywords textarea');
    }

    // Navigate to prompts section (section 2)
    const navDots = document.querySelectorAll('.nav-dot');
    const sections = document.querySelectorAll('.app-section');

    if (navDots.length > 2 && sections.length > 2) {
        // Remove active from current section
        navDots.forEach(dot => dot.classList.remove('active'));
        sections.forEach(section => section.classList.remove('active'));

        // Add active to prompts section
        navDots[2].classList.add('active');
        sections[2].classList.add('active');

        window.location.hash = 'section-2';
        console.log('🚀 Navigated to prompts section');
    }
}

/**
 * Initializes the Feeling Lucky button functionality.
 */
function initializeFeelLucky() {
    console.log('🎲 Initializing Feeling Lucky functionality...');

    const feelLuckyButton = document.getElementById('feelLuckyButton');
    if (feelLuckyButton) {
        feelLuckyButton.addEventListener('click', handleFeelLucky); // handleFeelLucky from main_script
        console.log('✅ Feeling Lucky button initialized in main_script');
    } else {
        console.error('❌ Feeling Lucky button not found!');
    }

    const feelLuckyCard = document.getElementById('feelLuckyCard');
    if (feelLuckyCard) {
        feelLuckyCard.addEventListener('click', (e) => {
            // Prevent triggering if clicking on interactive elements within the card
            if (e.target.closest('button') || e.target.closest('input[type="radio"]')) {
                return;
            }
            handleFeelLucky(); // handleFeelLucky from main_script
        });
        console.log('✅ Feeling Lucky card initialized in main_script');
    } else {
        console.error('❌ Feeling Lucky card not found!');
    }
}

/**
 * Initializes the keyword slider system.
 */

        console.log('✅ keywordCategories found:', Object.keys(window.keywordCategories).length, 'categories');
        console.log('🎯 sliderContainer:', sliderContainer);

        slides = [];
        sliderContainer.innerHTML = '';
        console.log('🧹 Cleared slider container');

        Object.entries(window.keywordCategories).forEach(([categoryName, keywords], index) => {
            const slide = document.createElement('div');
            slide.className = 'keyword-category-slide';

            const title = document.createElement('h3');
            title.className = 'category-title';
            title.textContent = categoryName.replace(/([A-Z])/g, ' $1').trim();

            const grid = document.createElement('div');
            grid.className = 'keywords-grid';

            // Randomize keyword order
            const shuffledKeywords = [...keywords].sort(() => Math.random() - 0.5);

            shuffledKeywords.forEach(keyword => {
                const item = document.createElement('div');
                item.className = 'keyword-item';
                item.textContent = keyword;
                item.dataset.keyword = keyword;
                item.dataset.category = categoryName;

                item.addEventListener('click', () => {
                    toggleKeyword(item, keyword);
                });

                grid.appendChild(item);
            });

            slide.appendChild(title);
            slide.appendChild(grid);
            sliderContainer.appendChild(slide);
            slides.push(slide);
        });

        updateSliderPosition();
        updateNavigationButtons();
    }

    // Toggle keyword selection
    function toggleKeyword(element, keyword) {
        if (selectedKeywords.has(keyword)) {
            selectedKeywords.delete(keyword);
            element.classList.remove('selected');
        } else {
            selectedKeywords.add(keyword);
            element.classList.add('selected');
        }
        updateSubmitButton();
    }

    // Update slider position
    function updateSliderPosition() {
        const translateX = -currentSlide * 100;
        sliderContainer.style.transform = `translateX(${translateX}%)`;
    }

    // Update navigation buttons
    function updateNavigationButtons() {
        if (prevButton) prevButton.disabled = currentSlide === 0;
        if (nextButton) nextButton.disabled = currentSlide === slides.length - 1;
    }

    // Update submit button
    function updateSubmitButton() {
        if (submitButton) {
            submitButton.textContent = `Use Selected Keywords (${selectedKeywords.size})`;
            submitButton.disabled = selectedKeywords.size === 0;
        }
    }

    // Navigation functions
    function goToPrevSlide() {
        if (currentSlide > 0) {
            currentSlide--;
            updateSliderPosition();
            updateNavigationButtons();
        }
    }

    function goToNextSlide() {
        if (currentSlide < slides.length - 1) {
            currentSlide++;
            updateSliderPosition();
            updateNavigationButtons();
        }
    }

    // Event listeners
    if (prevButton) prevButton.addEventListener('click', goToPrevSlide);
    if (nextButton) nextButton.addEventListener('click', goToNextSlide);

    // Hover-based auto-scroll
    const container = document.querySelector('.keyword-slider-container');
    if (container) {
        let hoverTimeout;

        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;

            clearTimeout(hoverTimeout);

            if (x < 100 && currentSlide > 0) {
                hoverTimeout = setTimeout(goToPrevSlide, 1000);
            } else if (x > width - 100 && currentSlide < slides.length - 1) {
                hoverTimeout = setTimeout(goToNextSlide, 1000);
            }
        });

        container.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout);
        });
    }

    // Submit selected keywords
    if (submitButton) {
        submitButton.addEventListener('click', () => {
            if (selectedKeywords.size > 0) {
                const keywordsArray = Array.from(selectedKeywords);
                const shuffledKeywords = keywordsArray.sort(() => Math.random() - 0.5);

                // Update the keywords textarea
                const keywordsTextarea = document.getElementById('generatedKeywords');
                if (keywordsTextarea) {
                    keywordsTextarea.value = shuffledKeywords.join(', ');

                    // Show generate prompt button
                    const generateButton = document.getElementById('generatePromptButton');
                    if (generateButton) {
                        generateButton.classList.remove('hidden');
                    }
                }

                // Navigate to prompts section
                const navDots = document.querySelectorAll('.nav-dot');
                const sections = document.querySelectorAll('.app-section');

                navDots[1].classList.remove('active');
                sections[1].classList.remove('active');
                navDots[2].classList.add('active');
                sections[2].classList.add('active');

                window.location.hash = 'section-2';
            }
        });
    }

    // Initialize when data is loaded
    function initializeSlides() {
        console.log('Checking for keywordCategories...', window.keywordCategories);
        if (window.keywordCategories && Object.keys(window.keywordCategories).length > 0) {
            console.log('Creating slides with categories:', Object.keys(window.keywordCategories));
            createSlides();
        } else if (window.dropdownData) {
            console.log('Converting dropdownData to keywordCategories...');
            // Convert dropdownData to keywordCategories if not already done
            const categories = {};
            Object.entries(window.dropdownData).forEach(([categoryKey, items]) => {
                const categoryName = categoryKey
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())
                    .trim();
                categories[categoryName] = items.map(item => item.value);
            });
            window.keywordCategories = categories;
            console.log('Created keywordCategories:', Object.keys(categories));
            createSlides();
        } else {
            console.log('No data available yet, waiting...');
            // Wait for data to load
            setTimeout(initializeSlides, 100);
        }
    }

    initializeSlides();

    console.log('✅ Keyword slider initialized');
}

// Export key functions for global access
window.appState = appState;
window.runBatchGeneration = runBatchGeneration;
window.stopBatchGeneration = stopBatchGeneration;
window.handleError = handleError;
window.navigateToSection = function(index) {
    const event = new CustomEvent('navigate', { detail: { section: index } });
    document.dispatchEvent(event);
};

console.log('Prompt Forge V1 main script loaded successfully!');