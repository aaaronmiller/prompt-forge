// --- UI Setup Functions V1 ---

/**
 * Populates keyword category dropdowns with enhanced styling and animations.
 */
function populateDropdowns() {
    if (typeof dropdownData === 'undefined') { 
        console.error("Cannot populate dropdowns, dropdownData is not defined."); 
        return; 
    }
    
    const keywordCategoriesContainer = document.getElementById('keywordCategories');
    if (!keywordCategoriesContainer) {
        console.error("Keyword categories container not found.");
        return;
    }
    
    // Clear existing content
    keywordCategoriesContainer.innerHTML = '';
    
    for (const categoryId in dropdownData) {
        const categoryData = dropdownData[categoryId];
        if (!categoryData || categoryData.length === 0) continue;
        
        // Create category card
        const categoryCard = document.createElement('div');
        categoryCard.className = 'keyword-category-card';
        categoryCard.id = categoryId;
        
        // Create category header
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        
        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = formatCategoryTitle(categoryId);
        
        const categoryToggle = document.createElement('button');
        categoryToggle.className = 'category-toggle';
        categoryToggle.innerHTML = '<i class="fas fa-chevron-down"></i>';
        categoryToggle.setAttribute('aria-expanded', 'false');
        
        const selectedCount = document.createElement('span');
        selectedCount.className = 'selected-count';
        selectedCount.textContent = '0 selected';
        
        categoryHeader.appendChild(categoryTitle);
        categoryHeader.appendChild(selectedCount);
        categoryHeader.appendChild(categoryToggle);
        
        // Create category content
        const categoryContent = document.createElement('div');
        categoryContent.className = 'category-content';
        categoryContent.style.display = 'none';
        
        const contentGrid = document.createElement('div');
        contentGrid.className = 'keyword-grid';
        
        // Add select all/none buttons
        const actionButtons = document.createElement('div');
        actionButtons.className = 'category-actions';
        
        const selectAllBtn = document.createElement('button');
        selectAllBtn.className = 'action-btn select-all';
        selectAllBtn.innerHTML = '<i class="fas fa-check-double"></i> Select All';
        selectAllBtn.onclick = () => selectAllInCategory(categoryId);
        
        const selectNoneBtn = document.createElement('button');
        selectNoneBtn.className = 'action-btn select-none';
        selectNoneBtn.innerHTML = '<i class="fas fa-times"></i> Select None';
        selectNoneBtn.onclick = () => selectNoneInCategory(categoryId);
        
        actionButtons.appendChild(selectAllBtn);
        actionButtons.appendChild(selectNoneBtn);
        
        // Populate keyword items
        categoryData.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'keyword-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = item.id;
            checkbox.value = item.value;
            checkbox.addEventListener('change', () => updateCategoryCount(categoryId));
            
            const label = document.createElement('label');
            label.htmlFor = item.id;
            label.textContent = item.label;
            
            itemDiv.appendChild(checkbox);
            itemDiv.appendChild(label);
            contentGrid.appendChild(itemDiv);
        });
        
        categoryContent.appendChild(actionButtons);
        categoryContent.appendChild(contentGrid);
        
        // Assemble category card
        categoryCard.appendChild(categoryHeader);
        categoryCard.appendChild(categoryContent);
        
        // Add toggle functionality
        categoryToggle.addEventListener('click', () => toggleCategory(categoryId));
        categoryHeader.addEventListener('click', (e) => {
            if (e.target !== categoryToggle && !categoryToggle.contains(e.target)) {
                toggleCategory(categoryId);
            }
        });
        
        keywordCategoriesContainer.appendChild(categoryCard);
    }
    
    // Add CSS for keyword categories if not already present
    addKeywordCategoryStyles();
}

/**
 * Formats category ID into a readable title.
 */
function formatCategoryTitle(categoryId) {
    return categoryId
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

/**
 * Toggles a keyword category's visibility.
 */
function toggleCategory(categoryId) {
    const categoryCard = document.getElementById(categoryId);
    if (!categoryCard) return;
    
    const toggle = categoryCard.querySelector('.category-toggle');
    const content = categoryCard.querySelector('.category-content');
    const icon = toggle.querySelector('i');
    
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    
    toggle.setAttribute('aria-expanded', !isExpanded);
    
    if (isExpanded) {
        // Collapse
        icon.style.transform = 'rotate(0deg)';
        animateSlideUp(content, () => {
            content.style.display = 'none';
        });
    } else {
        // Expand
        icon.style.transform = 'rotate(180deg)';
        content.style.display = 'block';
        animateSlideDown(content);
    }
}

/**
 * Updates the selected count for a category.
 */
function updateCategoryCount(categoryId) {
    const categoryCard = document.getElementById(categoryId);
    if (!categoryCard) return;
    
    const checkboxes = categoryCard.querySelectorAll('input[type="checkbox"]');
    const selectedCount = categoryCard.querySelector('.selected-count');
    
    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    selectedCount.textContent = `${checkedCount} selected`;
    
    // Update visual state
    if (checkedCount > 0) {
        categoryCard.classList.add('has-selections');
    } else {
        categoryCard.classList.remove('has-selections');
    }
}

/**
 * Selects all items in a category.
 */
function selectAllInCategory(categoryId) {
    const categoryCard = document.getElementById(categoryId);
    if (!categoryCard) return;
    
    const checkboxes = categoryCard.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        // Trigger change event for any listeners
        checkbox.dispatchEvent(new Event('change'));
    });
    
    updateCategoryCount(categoryId);
}

/**
 * Deselects all items in a category.
 */
function selectNoneInCategory(categoryId) {
    const categoryCard = document.getElementById(categoryId);
    if (!categoryCard) return;
    
    const checkboxes = categoryCard.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        // Trigger change event for any listeners
        checkbox.dispatchEvent(new Event('change'));
    });
    
    updateCategoryCount(categoryId);
}

/**
 * Populates the ComfyUI workflow selection dropdown.
 */
function populateWorkflowSelect() {
    const comfyWorkflowSelect = document.getElementById('comfyWorkflowSelect');
    if (!comfyWorkflowSelect || typeof comfyWorkflows === 'undefined') return;
    
    comfyWorkflowSelect.innerHTML = '<option value="">-- Select Workflow --</option>';

    let defaultWorkflowKey = null;

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
        // Trigger change event to update UI
        comfyWorkflowSelect.dispatchEvent(new Event('change'));
    }
}

/**
 * Sets up enhanced copy functionality for output areas.
 */
function setupCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-button');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const targetId = button.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            
            if (!targetElement) {
                console.error(`Copy target element with ID "${targetId}" not found.`);
                return;
            }
            
            try {
                await navigator.clipboard.writeText(targetElement.value);
                updateCopyButtonState(button, true);
                
                // Show success message
                showMessage('mainMessageBox', 'Content copied to clipboard!', 'success', 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
                updateCopyButtonState(button, false);
                showMessage('mainMessageBox', 'Failed to copy content.', 'error', 3000);
            }
        });
    });
}

/**
 * Sets up the continuous generation toggle functionality.
 */
function setupContinuousGenToggle() {
    const toggleCheckbox = document.getElementById('enableContinuousGen');
    const continuousOptions = document.getElementById('continuous-options');
    
    if (!toggleCheckbox || !continuousOptions) return;
    
    toggleCheckbox.addEventListener('change', () => {
        updateContinuousGenUI(toggleCheckbox.checked);
    });
}

/**
 * Sets up custom endpoint management.
 */
function setupCustomEndpoints() {
    const addButton = document.getElementById('add-custom-endpoint-btn');
    const endpointsList = document.getElementById('custom-endpoints-list');
    
    if (!addButton || !endpointsList) return;
    
    addButton.addEventListener('click', () => {
        addCustomEndpoint();
    });
}

/**
 * Adds a new custom endpoint configuration.
 */
function addCustomEndpoint() {
    const endpointsList = document.getElementById('custom-endpoints-list');
    if (!endpointsList) return;
    
    const endpointId = 'custom-endpoint-' + Date.now();
    
    const endpointDiv = document.createElement('div');
    endpointDiv.className = 'endpoint-option custom-endpoint';
    endpointDiv.id = endpointId;
    
    endpointDiv.innerHTML = `
        <div class="endpoint-header">
            <input type="checkbox" id="${endpointId}-checkbox" value="custom">
            <label for="${endpointId}-checkbox">Custom Endpoint</label>
            <button type="button" class="remove-endpoint-btn" onclick="removeCustomEndpoint('${endpointId}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="endpoint-config">
            <div class="form-group">
                <label for="${endpointId}-url">Endpoint URL</label>
                <input type="text" id="${endpointId}-url" class="form-input" placeholder="https://api.example.com/generate">
            </div>
            <div class="form-group">
                <label for="${endpointId}-key">API Key (optional)</label>
                <input type="password" id="${endpointId}-key" class="form-input" placeholder="Enter API key">
            </div>
        </div>
    `;
    
    endpointsList.appendChild(endpointDiv);
    
    // Animate the new endpoint in
    animateSlideDown(endpointDiv);
}

/**
 * Removes a custom endpoint.
 */
function removeCustomEndpoint(endpointId) {
    const endpointDiv = document.getElementById(endpointId);
    if (!endpointDiv) return;
    
    animateSlideUp(endpointDiv, () => {
        endpointDiv.remove();
    });
}

/**
 * Adds CSS styles for keyword categories.
 */
function addKeywordCategoryStyles() {
    if (document.getElementById('keyword-category-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'keyword-category-styles';
    style.textContent = `
        .keyword-category-card {
            background: var(--surface);
            border: 2px solid var(--border);
            border-radius: var(--card-radius);
            margin-bottom: var(--spacing-md);
            overflow: hidden;
            transition: all var(--transition-medium);
            box-shadow: var(--element-shadow), var(--element-glow);
        }
        
        .keyword-category-card:hover {
            border-color: var(--border-strong);
            box-shadow: var(--shadow-medium), var(--element-glow);
            transform: translateY(-2px);
        }
        
        .keyword-category-card.has-selections {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px var(--primary-light), var(--element-glow);
        }
        
        .category-header {
            display: flex;
            align-items: center;
            padding: var(--spacing-md);
            background: var(--surface-elevated);
            cursor: pointer;
            transition: background var(--transition-fast);
        }
        
        .category-header:hover {
            background: var(--surface-hover);
        }
        
        .category-header h3 {
            flex: 1;
            margin: 0;
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-primary);
        }
        
        .selected-count {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin-right: var(--spacing-sm);
        }
        
        .category-toggle {
            background: var(--surface-elevated);
            border: 2px solid var(--border);
            color: var(--text-secondary);
            cursor: pointer;
            padding: var(--spacing-xs);
            border-radius: var(--button-radius);
            transition: all var(--transition-fast);
            box-shadow: var(--element-shadow);
        }
        
        .category-toggle:hover {
            color: var(--primary-color);
            background: var(--primary-light);
            border-color: var(--primary-color);
        }
        
        .category-toggle i {
            transition: transform var(--transition-fast);
        }
        
        .category-content {
            padding: var(--spacing-md);
        }
        
        .category-actions {
            display: flex;
            gap: var(--spacing-sm);
            margin-bottom: var(--spacing-md);
        }
        
        .action-btn {
            padding: var(--spacing-xs) var(--spacing-sm);
            border: 2px solid var(--border);
            background: var(--surface-elevated);
            color: var(--text-secondary);
            border-radius: var(--button-radius);
            cursor: pointer;
            font-size: 0.85rem;
            transition: all var(--transition-fast);
            box-shadow: var(--element-shadow);
        }
        
        .action-btn:hover {
            background: var(--surface-hover);
            color: var(--text-primary);
            border-color: var(--border-strong);
            box-shadow: var(--shadow-medium), var(--element-glow);
        }
        
        .keyword-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: var(--spacing-sm);
        }
        
        .keyword-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            padding: var(--spacing-xs);
            border-radius: var(--button-radius);
            transition: all var(--transition-fast);
            border: 1px solid transparent;
        }
        
        .keyword-item:hover {
            background: var(--surface-elevated);
            border-color: var(--border);
            box-shadow: var(--element-shadow);
        }
        
        .keyword-item input[type="checkbox"] {
            accent-color: var(--primary-color);
        }
        
        .keyword-item label {
            cursor: pointer;
            font-size: 0.9rem;
            color: var(--text-secondary);
            transition: color var(--transition-fast);
        }
        
        .keyword-item input[type="checkbox"]:checked + label {
            color: var(--text-primary);
            font-weight: 500;
        }
        
        .custom-endpoint {
            border: 1px dashed var(--border);
        }
        
        .remove-endpoint-btn {
            background: none;
            border: none;
            color: var(--error);
            cursor: pointer;
            padding: var(--spacing-xs);
            border-radius: var(--radius-sm);
            transition: all var(--transition-fast);
        }
        
        .remove-endpoint-btn:hover {
            background: rgba(255, 69, 58, 0.1);
        }
        
        .progress-indicator {
            margin: var(--spacing-md) 0;
            padding: var(--spacing-sm);
            background: var(--surface-elevated);
            border-radius: var(--radius-md);
            border: 1px solid var(--border);
        }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: var(--surface);
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: var(--spacing-xs);
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
            border-radius: 4px;
            transition: width 0.3s ease;
        }
        
        .progress-text {
            font-size: 0.9rem;
            color: var(--text-secondary);
            text-align: center;
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * Initializes all UI setup functions.
 */
function initializeUI() {
    populateDropdowns();
    populateWorkflowSelect();
    setupCopyButtons();
    setupContinuousGenToggle();
    setupCustomEndpoints();
    
    // Initialize system prompt
    updateSystemPrompt();
    
    console.log('UI setup complete with enhanced v1 features.');
}

// Export functions for global access
window.populateDropdowns = populateDropdowns;
window.populateWorkflowSelect = populateWorkflowSelect;
window.removeCustomEndpoint = removeCustomEndpoint;
window.initializeUI = initializeUI;