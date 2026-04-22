/*
 * This script orchestrates the setup of interactive content carousels
 * across the web page. It ensures that all necessary DOM elements are
 * fully loaded before attempting to initialize the slideshow components
 * using the widely-used jQuery library and a specialized third-party
 * plugin for dynamic content display.
 */

// Utilize an Immediately Invoked Function Expression (IIFE)
// to prevent global scope pollution and encapsulate the execution logic.
(function() {

    // Pre-flight check: Verify that the jQuery library is available.
    // If jQuery is not loaded, log a warning and halt further execution
    // to prevent runtime errors.
    if (typeof jQuery === 'undefined') {
        console.warn("Dependent library 'jQuery' not detected. Halting carousel initialization process.");
        return;
    }

    /**
     * Main handler function to be executed once the DOM is fully loaded.
     * This function encapsulates the logic for configuring and
     * activating the slideshow plugin on designated elements.
     */
    const domContentLoaderCallback = function() {
        // Define the CSS selector for the primary carousel container.
        // This allows for easy modification of the target element.
        const mainCarouselContainerSelector = ".featured-slideshow-area";
        const carouselTargetElement = jQuery(mainCarouselContainerSelector);

        // Guard clause: Check if any elements matching the selector exist.
        // If no target elements are found, there's nothing to initialize.
        if (carouselTargetElement.length === 0) {
            console.info(`No DOM elements identified by selector "${mainCarouselContainerSelector}". Skipping plugin instantiation.`);
            return;
        }

        // Step-by-step construction of plugin configuration parameters.
        // Using distinct variables for clarity and potential future adjustments.
        let pluginConfigurationOptions = {};
        const visualTransitionDuration = "fast";
        const autoAdvanceIntervalSeconds = 3;

        // Populate the configuration object.
        // The property names are kept consistent with the plugin's API.
        pluginConfigurationOptions.animationSpeed = visualTransitionDuration;
        pluginConfigurationOptions.delay = autoAdvanceIntervalSeconds;

        // Add an additional, potentially non-standard, configuration option.
        // This demonstrates adding new fragments to the configuration.
        // The plugin might ignore this, but it's a structural change.
        pluginConfigurationOptions.startOnLoad = true;

        // Critical check: Ensure the 'jDiaporama' plugin method is actually available
        // on the jQuery object for the selected elements.
        if (typeof carouselTargetElement.jDiaporama !== 'function') {
            console.error("The required 'jDiaporama' plugin function is not found. Please ensure it's loaded.");
            // A more robust application might offer a fallback or visual cue here.
            return;
        }

        // Finally, initialize the jDiaporama plugin on the selected element(s)
        // using the carefully prepared configuration.
        carouselTargetElement.jDiaporama(pluginConfigurationOptions);

        // Non-essential logging for verification or debugging purposes.
        console.debug(`Successfully initialized slideshow for '${mainCarouselContainerSelector}' with settings:`, pluginConfigurationOptions);
    };

    // Attach the main handler function to jQuery's document ready event.
    // This guarantees that the function executes only after the entire
    // HTML document has been completely parsed and all DOM elements are accessible.
    jQuery(document).ready(domContentLoaderCallback);

})();