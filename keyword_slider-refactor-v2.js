// Swiper.js Keyword Slider Implementation for v2

let keywordSwiperInstance = null;
window.selectedSwiperKeywords = new Set(); // Initialize globally

// Define setupHoverNavigation here or ensure it's defined before initKeywordSwiper
function setupHoverNavigation(swiperInstance) {
    // Ensure navigation elements are correctly selected based on Swiper parameters
    const nextButtonSelector = swiperInstance.params.navigation?.nextEl;
    const prevButtonSelector = swiperInstance.params.navigation?.prevEl;

    const nextButtonElement = typeof nextButtonSelector === 'string' ? document.querySelector(nextButtonSelector) : nextButtonSelector;
    const prevButtonElement = typeof prevButtonSelector === 'string' ? document.querySelector(prevButtonSelector) : prevButtonSelector;

    if (nextButtonElement) {
        nextButtonElement.addEventListener('mouseenter', () => {
            if (!nextButtonElement.classList.contains('swiper-button-disabled')) {
                swiperInstance.slideNext();
            }
        });
    } else {
        console.warn('Swiper next button not found for hover navigation:', nextButtonSelector);
    }

    if (prevButtonElement) {
        prevButtonElement.addEventListener('mouseenter', () => {
            if (!prevButtonElement.classList.contains('swiper-button-disabled')) {
                swiperInstance.slidePrev();
            }
        });
    } else {
        console.warn('Swiper prev button not found for hover navigation:', prevButtonSelector);
    }
}


window.initKeywordSwiper = function() {
    if (keywordSwiperInstance) {
        console.log('Keyword Swiper already initialized. Re-focusing or refreshing if needed.');
        // Optionally, re-focus or update existing swiper if necessary
        // keywordSwiperInstance.update(); // Example: if slides changed dynamically outside Swiper's knowledge
        return;
    }
    console.log('Attempting to initialize Keyword Swiper (Manual Trigger)...');

    let effectiveKeywordCategories = {};

    if (typeof window.keywordCategories !== 'undefined' && Object.keys(window.keywordCategories).length > 0) {
        effectiveKeywordCategories = window.keywordCategories;
        console.log('Using global keywordCategories for Swiper.');
    } else if (typeof window.dropdownData !== 'undefined' && Object.keys(window.dropdownData).length > 0) {
        console.warn('Global keywordCategories not found or empty. Converting dropdownData for Swiper.');
        Object.entries(window.dropdownData).forEach(([categoryKey, items]) => {
            const categoryName = categoryKey
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim();
            effectiveKeywordCategories[categoryName] = items.map(item => item.value);
        });
        window.keywordCategories = effectiveKeywordCategories; // Make it global if generated here
    } else {
        console.error('Critical: Neither keywordCategories nor dropdownData is available. Swiper slider cannot be built.');
        const sliderWrapper = document.querySelector('#section-0-v2 .swiper-wrapper');
        if (sliderWrapper) {
            sliderWrapper.innerHTML = '<p style="text-align:center; color: red; padding: 20px;">Error: Keyword data not found. Cannot build slider.</p>';
        }
        return; // Stop initialization
    }

    console.log('Effective Keyword Categories for Swiper:', Object.keys(effectiveKeywordCategories).length, 'categories found.');

    const swiperWrapper = document.querySelector('#section-0-v2 .swiper-wrapper');
    if (!swiperWrapper) {
        console.error('Swiper wrapper (.swiper-wrapper in #section-0-v2) not found! Cannot initialize Swiper.');
        return; // Stop initialization
    }

    swiperWrapper.innerHTML = ''; // Clear any existing slides (e.g., error message or old content)

    for (const categoryName in effectiveKeywordCategories) {
        if (effectiveKeywordCategories.hasOwnProperty(categoryName)) {
            const keywords = effectiveKeywordCategories[categoryName];
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';

            let slideHTML = `<div class="keyword-category-slide-content"><h3>${categoryName}</h3><div class="keywords-grid">`;
            keywords.forEach(keyword => {
                const keywordId = `swiper-keyword-${categoryName.replace(/[^a-zA-Z0-9]/g, '-')}-${keyword.replace(/[^a-zA-Z0-9]/g, '-')}`;
                slideHTML += `
                    <div class="keyword-item" data-keyword="${keyword}">
                        <input type="checkbox" id="${keywordId}" value="${keyword}">
                        <label for="${keywordId}">${keyword}</label>
                    </div>`;
            });
            slideHTML += `</div></div>`;
            slide.innerHTML = slideHTML;
            swiperWrapper.appendChild(slide);
        }
    }

    const numCategories = Object.keys(effectiveKeywordCategories).length;
    console.log(`Initializing Swiper for section-0-v2 with ${numCategories} categories. Loop will be enabled if > 2.`);

    keywordSwiperInstance = new Swiper('#section-0-v2 .swiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: (numCategories > 2), // Loop only if more than 2 slides (or 3+ categories)
        navigation: {
            nextEl: '#section-0-v2 .swiper-button-next',
            prevEl: '#section-0-v2 .swiper-button-prev',
        },
        speed: 600,
        effect: 'slide', // 'coverflow', 'cube', 'flip' are other options
        allowTouchMove: true, // Enable/disable touch control
        observer: true, // Re-init Swiper on DOM mutations
        observeParents: true, // Re-init Swiper on parent DOM mutations
        on: {
            init: function () {
                setupHoverNavigation(this);
                // Update button state on init
                const submitButton = document.getElementById('submitKeywordsButton');
                if (submitButton && submitButton.querySelector('span')) {
                    submitButton.querySelector('span').textContent = `Use Selected Keywords (${window.selectedSwiperKeywords.size})`;
                } else {
                     console.warn("Submit keywords button or its span not found during Swiper init.");
                }
            },
            slideChange: function() {
                // Could add logic here if needed on slide change
            }
        }
    });

    // Event listener for keyword item clicks (delegated to swiperWrapper)
    swiperWrapper.addEventListener('click', function(event) {
        const keywordItem = event.target.closest('.keyword-item');
        if (keywordItem) {
            const checkbox = keywordItem.querySelector('input[type="checkbox"]');
            const keywordValue = keywordItem.dataset.keyword;

            if (!checkbox) {
                console.warn('Checkbox not found in keyword item:', keywordItem);
                return;
            }

            // Toggle checkbox if the click was not directly on it (e.g., on label or div)
            if (event.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
            }

            // Update selected keywords set and UI
            if (checkbox.checked) {
                window.selectedSwiperKeywords.add(keywordValue);
                keywordItem.classList.add('selected');
            } else {
                window.selectedSwiperKeywords.delete(keywordValue);
                keywordItem.classList.remove('selected');
            }

            // Update the "Use Selected Keywords" button text
            const submitButton = document.getElementById('submitKeywordsButton');
            if (submitButton && submitButton.querySelector('span')) {
                 submitButton.querySelector('span').textContent = `Use Selected Keywords (${window.selectedSwiperKeywords.size})`;
            }
        }
    });

    const submitButton = document.getElementById('submitKeywordsButton');
    if (submitButton) {
        submitButton.addEventListener('click', () => {
            if (!window.selectedSwiperKeywords || window.selectedSwiperKeywords.size === 0) {
                if (typeof showMessage === 'function') {
                    showMessage('mainMessageBox', 'Please select at least one keyword from the slider.', 'warning');
                } else {
                    alert('Please select at least one keyword from the slider.');
                }
                return;
            }

            const formattedKeywords = Array.from(window.selectedSwiperKeywords).join(', ');
            sessionStorage.setItem('keywordsForSection1v2', formattedKeywords);
            console.log('Stored selected keywords to sessionStorage for section-1-v2:', formattedKeywords);

            // Navigate to section-1-v2 (Prompt Setup section)
            if (typeof window.navigateToSection === 'function') {
                window.navigateToSection(1); // Assuming section-1-v2 is at index 1
            } else {
                console.error('navigateToSection function not found. Cannot navigate.');
            }
        });
    } else {
        console.warn('submitKeywordsButton not found during Swiper initialization.');
    }

    console.log('Swiper.js Keyword Slider initialized via initKeywordSwiper for section-0-v2.');
};
