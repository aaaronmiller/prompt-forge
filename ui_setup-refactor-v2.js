function initializeUI() {
    // populateDropdowns(); // Removed as obsolete
    populateWorkflowSelect();
    setupCopyButtons();
    setupContinuousGenToggle();
    setupCustomEndpoints();

    // Initialize system prompt
    updateSystemPrompt();

    console.log('UI setup complete with enhanced v1 features.');
}