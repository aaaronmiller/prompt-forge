/**
 * Horizontal Keyword Slider Component
 * Provides an efficient interface for selecting keywords with minimal clicks
 */

class KeywordSlider {
    constructor() {
        this.currentCategoryIndex = 0;
        this.categories = [];
        this.selectedKeywords = new Set();
        this.isOpen = false;
        this.autoSlideTimeout = null;
        this.hoverSlideDelay = 800; // ms to wait before auto-sliding on hover
        
        this.initializeSlider();
        this.bindEvents();
    }
    
    initializeSlider() {
        this.sliderSection = document.getElementById('keywordSliderSection');
        this.sliderTrack = document.getElementById('sliderTrack');
        this.currentCategoryName = document.getElementById('currentCategoryName');
        this.categoryProgress = document.getElementById('categoryProgress');
        this.selectionCount = document.getElementById('selectionCount');
        this.prevBtn = document.getElementById('prevCategoryBtn');
        this.nextBtn = document.getElementById('nextCategoryBtn');
        this.closeBtn = document.getElementById('closeSliderBtn');
        this.clearBtn = document.getElementById('clearSelectionsBtn');
        this.applyBtn = document.getElementById('applySelectionsBtn');
        
        // Load keyword categories from the existing data
        this.loadCategories();
    }
    
    loadCategories() {
        // Use the same keyword data from the main application
        this.categories = [
            {
                name: "Subject Matter",
                description: "Main subjects and characters for your design",
                keywords: [
                    "majestic lion", "soaring eagle", "mystical dragon", "wise owl", "fierce wolf",
                    "graceful deer", "powerful bear", "cunning fox", "noble horse", "playful dolphin",
                    "ancient tree", "blooming rose", "mountain peak", "ocean wave", "lightning bolt",
                    "vintage car", "steam locomotive", "sailing ship", "fighter jet", "motorcycle",
                    "guitar", "piano", "drums", "microphone", "vinyl record",
                    "warrior", "wizard", "knight", "archer", "samurai",
                    "astronaut", "robot", "alien", "cyborg", "superhero",
                    "skull", "crown", "sword", "shield", "compass"
                ]
            },
            {
                name: "Art Styles",
                description: "Visual styles and artistic approaches",
                keywords: [
                    "vector art", "line art", "watercolor", "oil painting", "digital art",
                    "pixel art", "graffiti", "street art", "pop art", "abstract",
                    "minimalist", "geometric", "tribal", "celtic", "mandala",
                    "vintage", "retro", "steampunk", "cyberpunk", "gothic",
                    "art nouveau", "art deco", "bauhaus", "surreal", "psychedelic",
                    "realistic", "cartoon", "anime", "manga", "comic book",
                    "sketch", "blueprint", "technical drawing", "hand drawn", "painted",
                    "3D render", "photorealistic", "stylized", "impressionist", "expressionist"
                ]
            },
            {
                name: "Colors & Moods",
                description: "Color palettes and emotional atmospheres",
                keywords: [
                    "vibrant", "neon", "pastel", "monochrome", "black and white",
                    "rainbow", "sunset", "sunrise", "midnight", "golden hour",
                    "electric blue", "crimson red", "emerald green", "royal purple", "amber yellow",
                    "dark", "bright", "glowing", "shadowy", "luminous",
                    "warm tones", "cool tones", "earth tones", "metallic", "matte",
                    "energetic", "calm", "mysterious", "playful", "serious",
                    "dramatic", "peaceful", "intense", "dreamy", "bold",
                    "subtle", "striking", "harmonious", "contrasting", "balanced",
                    "fiery", "icy", "stormy", "serene", "electric"
                ]
            },
            {
                name: "Environments",
                description: "Settings and backgrounds for your design",
                keywords: [
                    "forest", "mountain", "desert", "ocean", "city",
                    "space", "underwater", "clouds", "cave", "volcano",
                    "jungle", "arctic", "meadow", "canyon", "valley",
                    "beach", "island", "lake", "river", "waterfall",
                    "skyline", "rooftop", "alley", "park", "garden",
                    "laboratory", "workshop", "studio", "garage", "library",
                    "castle", "temple", "ruins", "bridge", "lighthouse",
                    "cosmic", "nebula", "galaxy", "planet", "stars",
                    "abstract background", "geometric pattern", "texture", "gradient", "solid color"
                ]
            },
            {
                name: "Effects & Details",
                description: "Special effects and finishing touches",
                keywords: [
                    "glowing", "sparkling", "shimmering", "flowing", "swirling",
                    "explosive", "radiating", "pulsing", "vibrating", "floating",
                    "transparent", "translucent", "reflective", "metallic", "glossy",
                    "textured", "smooth", "rough", "weathered", "pristine",
                    "motion blur", "depth of field", "lens flare", "light rays", "shadows",
                    "particles", "smoke", "fire", "electricity", "magic",
                    "geometric shapes", "patterns", "fractals", "spirals", "waves",
                    "borders", "frames", "banners", "ribbons", "badges",
                    "distressed", "vintage effect", "grunge", "clean", "polished",
                    "layered", "dimensional", "flat", "embossed", "outlined"
                ]
            }
        ];
        
        this.buildSliderHTML();
    }
    
    buildSliderHTML() {
        this.sliderTrack.innerHTML = '';
        
        this.categories.forEach((category, index) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'slider-category';
            categoryDiv.innerHTML = `
                <div class="slider-category-header">
                    <h3>${category.name}</h3>
                    <p>${category.description}</p>
                </div>
                <div class="slider-keyword-grid">
                    ${category.keywords.map(keyword => `
                        <div class="slider-keyword-item" data-keyword="${keyword}">
                            <input type="checkbox" id="slider-${keyword.replace(/\s+/g, '-')}" value="${keyword}">
                            <label for="slider-${keyword.replace(/\s+/g, '-')}">${keyword}</label>
                        </div>
                    `).join('')}
                </div>
            `;
            
            this.sliderTrack.appendChild(categoryDiv);
        });
        
        this.updateSliderPosition();
        this.bindKeywordEvents();
    }
    
    bindEvents() {
        // Navigation buttons
        this.prevBtn.addEventListener('click', () => this.previousCategory());
        this.nextBtn.addEventListener('click', () => this.nextCategory());
        this.closeBtn.addEventListener('click', () => this.closeSlider());
        this.clearBtn.addEventListener('click', () => this.clearAllSelections());
        this.applyBtn.addEventListener('click', () => this.applySelections());
        
        // Open slider button
        const openSliderBtn = document.getElementById('openKeywordSliderButton');
        if (openSliderBtn) {
            openSliderBtn.addEventListener('click', () => this.openSlider());
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;
            
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.previousCategory();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.nextCategory();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.closeSlider();
            }
        });
        
        // Auto-slide on hover (for efficiency)
        this.sliderSection.addEventListener('mousemove', (e) => {
            if (!this.isOpen) return;
            
            const rect = this.sliderSection.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            const leftThreshold = width * 0.15;
            const rightThreshold = width * 0.85;
            
            clearTimeout(this.autoSlideTimeout);
            
            if (x < leftThreshold && this.currentCategoryIndex > 0) {
                this.autoSlideTimeout = setTimeout(() => {
                    this.previousCategory();
                }, this.hoverSlideDelay);
            } else if (x > rightThreshold && this.currentCategoryIndex < this.categories.length - 1) {
                this.autoSlideTimeout = setTimeout(() => {
                    this.nextCategory();
                }, this.hoverSlideDelay);
            }
        });
        
        this.sliderSection.addEventListener('mouseleave', () => {
            clearTimeout(this.autoSlideTimeout);
        });
    }
    
    bindKeywordEvents() {
        const keywordItems = this.sliderTrack.querySelectorAll('.slider-keyword-item');
        
        keywordItems.forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            const keyword = item.dataset.keyword;
            
            // Update visual state if already selected
            if (this.selectedKeywords.has(keyword)) {
                checkbox.checked = true;
                item.classList.add('selected');
            }
            
            // Handle selection changes
            item.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') {
                    checkbox.checked = !checkbox.checked;
                }
                
                if (checkbox.checked) {
                    this.selectedKeywords.add(keyword);
                    item.classList.add('selected');
                } else {
                    this.selectedKeywords.delete(keyword);
                    item.classList.remove('selected');
                }
                
                this.updateSelectionCount();
                this.animateSelection(item);
            });
        });
    }
    
    animateSelection(item) {
        item.style.transform = 'scale(0.95)';
        setTimeout(() => {
            item.style.transform = '';
        }, 150);
    }
    
    openSlider() {
        this.isOpen = true;
        this.sliderSection.style.display = 'block';
        
        // Smooth reveal animation
        requestAnimationFrame(() => {
            this.sliderSection.style.opacity = '0';
            this.sliderSection.style.transform = 'translateY(-20px)';
            
            requestAnimationFrame(() => {
                this.sliderSection.style.transition = 'all 0.3s ease-out';
                this.sliderSection.style.opacity = '1';
                this.sliderSection.style.transform = 'translateY(0)';
            });
        });
        
        this.updateDisplay();
        this.scrollToSlider();
    }
    
    closeSlider() {
        this.isOpen = false;
        
        this.sliderSection.style.transition = 'all 0.3s ease-in';
        this.sliderSection.style.opacity = '0';
        this.sliderSection.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            this.sliderSection.style.display = 'none';
            this.sliderSection.style.transition = '';
        }, 300);
    }
    
    scrollToSlider() {
        setTimeout(() => {
            this.sliderSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
    }
    
    previousCategory() {
        if (this.currentCategoryIndex > 0) {
            this.currentCategoryIndex--;
            this.updateSliderPosition();
            this.updateDisplay();
        }
    }
    
    nextCategory() {
        if (this.currentCategoryIndex < this.categories.length - 1) {
            this.currentCategoryIndex++;
            this.updateSliderPosition();
            this.updateDisplay();
        }
    }
    
    updateSliderPosition() {
        const translateX = -this.currentCategoryIndex * 100;
        this.sliderTrack.style.transform = `translateX(${translateX}%)`;
    }
    
    updateDisplay() {
        const category = this.categories[this.currentCategoryIndex];
        this.currentCategoryName.textContent = category.name;
        this.categoryProgress.textContent = `${this.currentCategoryIndex + 1} / ${this.categories.length}`;
        
        // Update navigation button states
        this.prevBtn.disabled = this.currentCategoryIndex === 0;
        this.nextBtn.disabled = this.currentCategoryIndex === this.categories.length - 1;
        
        this.updateSelectionCount();
    }
    
    updateSelectionCount() {
        const count = this.selectedKeywords.size;
        this.selectionCount.textContent = `${count} keyword${count !== 1 ? 's' : ''} selected`;
        
        // Update apply button state
        this.applyBtn.disabled = count === 0;
    }
    
    clearAllSelections() {
        this.selectedKeywords.clear();
        
        // Update all checkboxes and visual states
        const allCheckboxes = this.sliderTrack.querySelectorAll('input[type="checkbox"]');
        const allItems = this.sliderTrack.querySelectorAll('.slider-keyword-item');
        
        allCheckboxes.forEach(checkbox => checkbox.checked = false);
        allItems.forEach(item => item.classList.remove('selected'));
        
        this.updateSelectionCount();
        
        // Visual feedback
        this.clearBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.clearBtn.style.transform = '';
        }, 150);
    }
    
    applySelections() {
        if (this.selectedKeywords.size === 0) return;
        
        // Convert selected keywords to comma-separated list
        const keywordsList = Array.from(this.selectedKeywords).join(', ');
        
        // Update the keywords textarea
        const keywordsTextarea = document.getElementById('generatedKeywords');
        if (keywordsTextarea) {
            keywordsTextarea.value = keywordsList;
            
            // Trigger input event to update other components
            keywordsTextarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        // Show the generate prompt button
        this.showGeneratePromptButton();
        
        // Close the slider
        this.closeSlider();
        
        // Show success message
        this.showSuccessMessage(`Applied ${this.selectedKeywords.size} keywords to your selection`);
        
        // Scroll to keywords section
        setTimeout(() => {
            const keywordsContainer = document.getElementById('keywords-summary-container');
            if (keywordsContainer) {
                keywordsContainer.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }, 400);
    }
    
    showGeneratePromptButton() {
        const generateBtn = document.getElementById('generatePromptButton');
        if (generateBtn) {
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
    
    showSuccessMessage(message) {
        const messageBox = document.getElementById('mainMessageBox');
        if (messageBox) {
            messageBox.className = 'message-box success';
            messageBox.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            `;
            messageBox.style.display = 'block';
            
            setTimeout(() => {
                messageBox.style.display = 'none';
            }, 3000);
        }
    }
    
    // Method to get current selections (for external use)
    getSelectedKeywords() {
        return Array.from(this.selectedKeywords);
    }
    
    // Method to set selections programmatically
    setSelectedKeywords(keywords) {
        this.selectedKeywords = new Set(keywords);
        this.updateAllVisualStates();
        this.updateSelectionCount();
    }
    
    updateAllVisualStates() {
        const allCheckboxes = this.sliderTrack.querySelectorAll('input[type="checkbox"]');
        const allItems = this.sliderTrack.querySelectorAll('.slider-keyword-item');
        
        allCheckboxes.forEach(checkbox => {
            const keyword = checkbox.value;
            checkbox.checked = this.selectedKeywords.has(keyword);
        });
        
        allItems.forEach(item => {
            const keyword = item.dataset.keyword;
            item.classList.toggle('selected', this.selectedKeywords.has(keyword));
        });
    }
}

// Initialize the keyword slider when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.keywordSlider = new KeywordSlider();
});