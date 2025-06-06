// Swiper.js Keyword Slider Implementation for v2

document.addEventListener('DOMContentLoaded', () => {
    let effectiveKeywordCategories = {};

    if (typeof keywordCategories !== 'undefined' && Object.keys(keywordCategories).length > 0) {
        effectiveKeywordCategories = keywordCategories;
        console.log('Using global keywordCategories for Swiper.');
    } else if (typeof dropdownData !== 'undefined' && Object.keys(dropdownData).length > 0) {
        console.warn('Global keywordCategories not found or empty. Converting dropdownData for Swiper.');
        Object.entries(dropdownData).forEach(([categoryKey, items]) => {
            const categoryName = categoryKey
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim();
            effectiveKeywordCategories[categoryName] = items.map(item => item.value);
        });
        window.keywordCategories = effectiveKeywordCategories; // Make it global if generated here
    } else {
        console.error('Critical: Neither keywordCategories nor dropdownData is available. Swiper slider cannot be built.');
        const sliderWrapper = document.querySelector('#section-1 .swiper-wrapper');
        if (sliderWrapper) {
            sliderWrapper.innerHTML = '<p style="text-align:center; color: red; padding: 20px;">Error: Keyword data not found. Cannot build slider.</p>';
        }
        return;
    }

    console.log('Effective Keyword Categories for Swiper:', Object.keys(effectiveKeywordCategories).length, 'categories found.');

    const swiperWrapper = document.querySelector('#section-1 .swiper-wrapper');
    if (!swiperWrapper) {
        console.error('Swiper wrapper (.swiper-wrapper in #section-1) not found!');
        return;
    }

    window.selectedSwiperKeywords = new Set(); // Ensure it's globally available

    for (const categoryName in effectiveKeywordCategories) {
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

    const swiper = new Swiper('#section-1 .swiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: (Object.keys(effectiveKeywordCategories).length > 1), // Loop only if multiple slides
        navigation: {
            nextEl: '#section-1 .swiper-button-next',
            prevEl: '#section-1 .swiper-button-prev',
        },
        speed: 600,
        effect: 'slide',
        allowTouchMove: true,
        observer: true,
        observeParents: true,
        on: {
            init: function () {
                setupHoverNavigation(this);
                 // Update button state on init
                const submitButton = document.getElementById('submitKeywordsButton');
                if (submitButton && submitButton.querySelector('span')) {
                    submitButton.querySelector('span').textContent = `Use Selected Keywords (0)`;
                }
            },
        }
    });

    function setupHoverNavigation(swiperInstance) {
        const nextButton = document.querySelector('#section-1 .swiper-button-next');
        const prevButton = document.querySelector('#section-1 .swiper-button-prev');

        if (nextButton && prevButton) {
            nextButton.addEventListener('mouseenter', () => {
                if (!nextButton.classList.contains('swiper-button-disabled')) {
                    swiperInstance.slideNext();
                }
            });
            prevButton.addEventListener('mouseenter', () => {
                if (!prevButton.classList.contains('swiper-button-disabled')) {
                    swiperInstance.slidePrev();
                }
            });
        }
    }

    swiperWrapper.addEventListener('click', function(event) {
        const keywordItem = event.target.closest('.keyword-item');
        if (keywordItem) {
            const checkbox = keywordItem.querySelector('input[type="checkbox"]');
            const keywordValue = keywordItem.dataset.keyword;

            if (event.target !== checkbox) { // If label or div is clicked
                checkbox.checked = !checkbox.checked;
            }

            if (checkbox.checked) {
                window.selectedSwiperKeywords.add(keywordValue);
                keywordItem.classList.add('selected');
            } else {
                window.selectedSwiperKeywords.delete(keywordValue);
                keywordItem.classList.remove('selected');
            }

            const submitButton = document.getElementById('submitKeywordsButton');
            if (submitButton && submitButton.querySelector('span')) { // Check if span exists
                 submitButton.querySelector('span').textContent = `Use Selected Keywords (${window.selectedSwiperKeywords.size})`;
            }
        }
    });
    console.log('Swiper.js Keyword Slider initialized for section-1.');
});