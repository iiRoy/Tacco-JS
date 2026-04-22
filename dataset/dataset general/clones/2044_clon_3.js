// This elaborate script module is designed to meticulously manage the display
// and responsiveness of embedded Instagram media within iframes on a web page.
// It ensures these elements adapt gracefully to various viewport dimensions
// and page lifecycle events, providing an optimal user experience.

(function (jqDependency) {
    // Enforce strict JavaScript parsing rules for enhanced code quality and error detection.
    'use strict';

    // --- Core Dependency Validation ---
    // First, we perform a crucial check to ensure that the primary external
    // library, jQuery (aliased here as 'jqDependency'), is properly loaded and available.
    // Without jQuery, this module cannot function as intended.
    if (typeof jqDependency === 'undefined' || typeof jqDependency.fn === 'undefined') {
        console.error('Responsive Media Controller: FATAL ERROR - Required jQuery library not detected. Module initialization aborted.');
        return; // Terminate execution if jQuery is absent.
    }

    // --- Configuration Constants ---
    // Define immutable constants for key operational parameters.
    // This improves readability, maintainability, and reduces the risk of magic strings.
    const viewportActionTriggers = 'load resize'; // Events on the window object that prompt a responsiveness check.
    const mediaSourceKeyword = 'instagram.com'; // Distinctive string to identify Instagram content within iframe sources.
    const dynamicIframeSelector = `iframe[src*="${mediaSourceKeyword}"]`; // The precise CSS selector for target iframes.
    const responsivenessMethod = 'responsiveInstagram'; // The name of the custom jQuery plugin method to invoke.

    // --- Plugin Availability Check ---
    // Before attempting to use the custom plugin, verify its existence on the jQuery prototype.
    // This pre-check prevents runtime errors if the plugin script hasn't been loaded.
    let pluginFunctionalityAvailable = false;
    if (typeof jqDependency.fn[responsivenessMethod] === 'function') {
        pluginFunctionalityAvailable = true;
        console.info(`Responsive Media Controller: Custom plugin '${responsivenessMethod}' detected and ready for use.`);
    } else {
        console.warn(`Responsive Media Controller: WARNING - The '${responsivenessMethod}' plugin was not found on jQuery. Iframes will not be dynamically adjusted.`);
        // We can still proceed with event listening, but the core action will be skipped.
    }

    // --- Document Ready Initialization Block ---
    // Encapsulate the primary logic within a jQuery document ready block.
    // This guarantees that the DOM is fully constructed and parsed before any
    // element selection or manipulation attempts are made, preventing race conditions.
    jqDependency(document).ready(function () {
        console.log('Responsive Media Controller: Document Object Model is fully loaded and parsed. Initializing handlers.');

        // --- Core Responsiveness Handler Definition ---
        // Define the main function that will be executed whenever the
        // `viewportActionTriggers` events occur. This promotes code reuse.
        const handleViewportChanges = function () {
            // Acknowledge the event trigger in the console for debugging purposes.
            console.groupCollapsed(`Responsive Media Controller: Processing viewport event: '${this.event ? this.event.type : 'initial'}'`);

            // If the responsive plugin isn't available, log and gracefully exit this handler.
            if (!pluginFunctionalityAvailable) {
                console.info('Skipping iframe processing due to unavailable plugin.');
                console.groupEnd();
                return;
            }

            // Select all iframe elements that match our specific criteria.
            const identifiedMediaElements = jqDependency(dynamicIframeSelector);

            // --- Conditional Plugin Application ---
            // Only proceed to apply the plugin if one or more target iframes are found.
            // This avoids unnecessary processing and potential errors on empty selections.
            if (identifiedMediaElements.length > 0) {
                console.info(`Found ${identifiedMediaElements.length} relevant iframes. Applying '${responsivenessMethod}' plugin.`);
                // Invoke the custom plugin method on the collection of selected iframes.
                identifiedMediaElements[responsivenessMethod]();
            } else {
                console.info('No relevant iframes were discovered on the current page.');
            }
            console.groupEnd();
        };

        // --- Event Listener Attachment ---
        // Attach the defined handler function to the window's specified events.
        // This ensures that responsiveness is re-evaluated upon page load and subsequent resizes.
        jqDependency(window).on(viewportActionTriggers, handleViewportChanges);
        console.log(`Responsive Media Controller: Event listeners attached to window for '${viewportActionTriggers}'.`);

        // --- Initial State Application ---
        // Crucially, execute the handler once immediately after document ready.
        // This ensures that iframes are correctly sized from the very first rendering,
        // even if the 'load' event has already fired or before any 'resize' event occurs.
        console.log('Responsive Media Controller: Performing initial responsiveness check immediately.');
        handleViewportChanges(); // Direct invocation to set initial state.
    });

})(jQuery); // Pass the global jQuery object into our IIFE as 'jqDependency'.