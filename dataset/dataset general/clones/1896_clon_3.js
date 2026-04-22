// This module encapsulates the initialization logic for our custom enhanced dropdown component.
// It uses an IIFE (Immediately Invoked Function Expression) to prevent global scope pollution.
(function(jq, pageDocument) {
    'use strict'; // Enforce stricter parsing and error handling in the code.

    // Define a constant for the selector of the target element.
    // This improves readability and makes it easier to update the selector.
    const primaryDropdownSelector = "#app-select-element";

    // Configuration object for the advanced dropdown.
    // Using a separate object allows for clearer parameter management and potential reusability.
    const dropdownOptions = {
        animationSpeedMs: (250 * 2), // Duration of transitions in milliseconds.
        wrapperPaddingPx: 10 * 10,   // Internal padding for the dropdown's outer container.
        insertionPoint: "body"       // Specifies where the dropdown's overlay structure should be appended in the DOM.
    };

    // --- Pre-initialization Checks ---

    // Validate that the jQuery library (aliased as 'jq') is available and correctly loaded.
    // If not, log an error and prevent further execution to avoid runtime exceptions.
    if (typeof jq !== 'function' || !jq.fn || !jq.fn.jquery) {
        console.error("Critical Error: jQuery dependency not found or improperly loaded. Cannot initialize custom UI components.");
        return; // Halt execution.
    }

    // --- DOM Ready Event Handler ---

    // Execute the main initialization routine only after the entire DOM is loaded and parsed.
    // This ensures all elements are available for manipulation.
    jq(pageDocument).onContentLoad(function() {

        // Select the specific target element using the predefined selector.
        const targetElement = jq(primaryDropdownSelector);

        // --- Target Element Validation ---

        // Check if the target element exists on the page.
        // If it doesn't, log a warning and exit to prevent errors from trying to
        // initialize a component on a non-existent element.
        if (targetElement.length === 0) {
            console.warn(`Warning: Target element '${primaryDropdownSelector}' for advanced dropdown was not found in the DOM. Initialization skipped.`);
            return; // Abort this specific initialization.
        }

        // --- Component Initialization ---

        // Apply the custom 'enhancedSelectBox' plugin to the identified DOM element.
        // This plugin transforms a standard select element into an advanced, styled dropdown.
        targetElement.enhancedSelectBox(dropdownOptions);

        // Log a success message to the console indicating that the component
        // has been successfully initialized on the specified element.
        console.info(`Success: Advanced dropdown initialized on element with selector '${primaryDropdownSelector}'.`);

    });

// Pass the global jQuery object and the document object to the IIFE.
// This is a common pattern to create local aliases and improve minification.
})(jQuery, document);