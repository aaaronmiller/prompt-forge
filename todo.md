# TODO List for Prompt Forge V2 Refactor

## Phase 1: Critical Bug Fixes & Core Functionality Verification

1.  **Critical Bug Fix: `handleError` TypeError (High Priority)**
    *   **Issue:** `main_script-refactor-v2.js`'s `handleError` function throws a TypeError if called with a `null` error object (identified from user's debug log).
    *   **Task:** Modify `handleError` to add a null check for the `error` parameter at the beginning of the function to prevent this.

2.  **Verify `systemPrompt` Textarea Presence & Functionality (High Priority)**
    *   **Issue:** Debug log showed `updateSystemPrompt: systemPrompt textarea not found`. Content recovery for `llm-config-content` needs verification for this specific element.
    *   **Task:**
        *   Confirm `textarea#systemPrompt` is correctly present in `index-refactor-v2.html` inside `div#llm-config-content` within `section-1-v2`.
        *   If missing, investigate and re-attempt its restoration from `index-refactor-v1.html`.
        *   Ensure `updateSystemPrompt()` populates the textarea correctly, especially considering page load timing vs. section activation.

3.  **Comprehensive Browser Testing (Functionality First - High Priority)**
    *   **Task:** After addressing points 1 and 2, conduct thorough testing of all interactive elements and user flows in `index-refactor-v2.html`.
    *   **Focus Areas:**
        *   Hero Buttons: "Feeling Lucky" & "Select Keywords" (navigation, Swiper updates, keyword population in Section 1).
        *   Keyword Slider (Section 0): All 24 categories loading, keyword selection/deselection, `window.selectedSwiperKeywords` accuracy, Swiper navigation.
        *   "Use Selected Keywords" Button (Section 0): Keyword transfer to Section 1, navigation to Section 1.
        *   Section Navigation: Dots, "Edit Keywords" button (Section 1 to 0), keyboard navigation.
        *   LLM Configuration (Section 1): API key, LLM endpoint (custom URL), Output Format radios functionality.
        *   AI Prompt Generation Trigger (UI interaction part).
        *   Error Console: Monitor for any new JavaScript errors during interaction.

## Phase 2: Feature Completeness & User Feedback Alignment

4.  **Address Keyword Category Count (Medium Priority)**
    *   **Issue:** User expects "~20" keyword categories, but `data.js` provides 24.
    *   **Task:** Discuss with user for clarification. Modify `data.js` if categories need to be trimmed.

5.  **Implement "Generation Output" Section (`section-3-v2`) (Medium Priority)**
    *   **Task:** Define HTML structure and implement JS logic to display generated images and prompts. (Depends on `api_calls-refactor.js`).

6.  **Review Collapsible Sections (Medium Priority)**
    *   **Task:** Ensure LLM Config, Image Gen Config, and Guidelines cards expand/collapse correctly.

## Phase 3: Visual Enhancements & Finalization

7.  **Styling - Phase 2 (Color Scheme Implementation - Low Priority for now)**
    *   **Task:** Implement the two/three-tone color scheme as per prior investigation (new CSS variables, update themes, update general CSS rules).

8.  **General Styling Refinements (Low Priority)**
    *   **Task:** Review overall layout, spacing, visual consistency. Adjust `styles-refactor-v2.css`.

9.  **Final Code Cleanup (Low Priority)**
    *   **Task:** Review all v2 JS files for console logs, commented code, optimizations.
