/**
 * Primary client-side script managing interactive behaviors and layout adaptations.
 * This module focuses on ensuring that embedded rich media content within designated
 * article sections dynamically adjusts its dimensions to fit various display environments
 * once the full page structure is available. It relies on an external DOM manipulation
 * framework for efficient element selection and manipulation.
 */

/* eslint-disable no-undef */ // Suppresses warnings for global variables like 'window.jQuery'

((domUtility) => { // Renaming the jQuery alias '$' to 'domUtility' and using an arrow function for the IIFE

    // Declare a constant for the specific CSS selector identifying content areas that need media responsiveness.
    const DYNAMIC_MEDIA_SECTION_SELECTOR = ".main-content-display .article-body-area";

    // --- Type III: Introduce preliminary validation for the external library. ---
    // Verify that the required DOM manipulation library (e.g., jQuery) is properly loaded and accessible.
    if (!domUtility || typeof domUtility.fn !== 'object') {
        console.error("Initialization Error: The essential DOM handling library (jQuery equivalent) was not detected or is malformed. Core page functionalities might be impaired.");
        return; // Halt execution if the prerequisite library is missing.
    }

    // --- Type II: Renaming the 'ready' method and wrapping its callback. ---
    // Attach an event listener that triggers once the entire Document Object Model is fully constructed and parsed.
    domUtility(document).onDocumentStructureReady(() => { // 'ready' is renamed to 'onDocumentStructureReady'

        // --- Type III: Introduce an intermediate variable for selected elements. ---
        const relevantContentBlocks = domUtility(DYNAMIC_MEDIA_SECTION_SELECTOR);

        // --- Type III: Implement a guard clause to prevent unnecessary operations. ---
        // Check if any elements matching the specified selector were found on the page.
        if (relevantContentBlocks.length === 0) {
            console.warn(`System Notice: No elements matching the selector '${DYNAMIC_MEDIA_SECTION_SELECTOR}' were identified. Skipping responsive media processing.`);
            return; // Exit the callback if there's nothing to process.
        }

        // --- Type III: Validate the existence of the plugin method before calling it. ---
        // Ensure the custom plugin method for media adaptation is available on the jQuery object.
        if (typeof relevantContentBlocks.adaptViewportMedia === 'function') {
            // --- Type II: Rename the plugin function call. ---
            // Execute the custom plugin method to make all embedded media (like videos) within
            // the selected content blocks automatically adjust their size to the viewport.
            relevantContentBlocks.adaptViewportMedia();

            // --- Type III: Add informational logging after successful execution. ---
            console.info(`Operation Success: Applied responsive media adaptation to ${relevantContentBlocks.length} content block(s).`);
        } else {
            console.error("Critical Missing Functionality: The 'adaptViewportMedia' plugin method is not defined. Responsive media adaptation cannot proceed.");
        }

    }); // End of the 'onDocumentStructureReady' callback function.

})(window.jQuery); // Explicitly pass the global 'window.jQuery' object to the IIFE.