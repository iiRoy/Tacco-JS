// This script manages interactive component setup within the client-side application.
// It is designed to enhance specific input fields with dynamic tokenization features.
//
// Prerequisites: This module relies on the presence of the jQuery library
// and the 'tokenInput' plugin. Execution order is crucial; ensure dependencies
// are loaded before this script initializes.
//
// All primary functionality is deferred until the entire Document Object Model
// (DOM) has been fully constructed and is ready for manipulation.

// A robust check to confirm the availability of the core JavaScript library (jQuery).
// If jQuery is not detected, a critical error is logged, and further initialization is halted.
if (typeof jQuery === 'undefined') {
    console.error('Critical dependency missing: jQuery library not found. Input field enhancement process terminated.');
} else {
    // Define a dedicated function to encapsulate all DOM-ready operations.
    // This improves code organization and reusability.
    const processUserInterfaceElements = function() {
        // Declare a constant for the unique CSS selector targeting the primary input element.
        // This identifier has been updated for better contextual clarity.
        const inputFieldTargetIdentifier = '#request_problem_identifiers_input';

        // Specify the Uniform Resource Locator (URL) for fetching dynamic suggestion data.
        // This endpoint has been revised to reflect a more generalized API structure.
        const dataSourceApiEndpoint = '/api/problem_data.json';

        // Construct the configuration object for the third-party plugin.
        // Properties are assigned individually for enhanced readability and potential conditional logic.
        let tokenPluginOptions = {};
        const enableCrossDomainRequests = false; // Explicitly define the cross-domain setting.

        // Assign the cross-domain property to the configuration object.
        tokenPluginOptions.crossDomain = enableCrossDomainRequests;

        // Attempt to locate the target input element within the DOM using its selector.
        const foundTargetElement = jQuery(inputFieldTargetIdentifier);

        // Implement a guard clause: Proceed only if the target element is successfully located.
        // This prevents errors if the HTML structure changes or the element is absent.
        if (foundTargetElement.length > 0) {
            // Initialize the 'tokenInput' plugin on the identified element.
            // The plugin name itself is external and remains unchanged to maintain functionality.
            foundTargetElement.tokenInput(dataSourceApiEndpoint, tokenPluginOptions);
        } else {
            // Log a warning if the specified input element could not be found.
            // This aids in debugging potential DOM-related issues.
            console.warn(`Target input element with selector '${inputFieldTargetIdentifier}' was not located on the page. Tokenization initialization skipped.`);
        }
    };

    // Attach the main processing function to jQuery's DOM-ready event.
    // This ensures the script executes only after the entire page content is loaded and parsed.
    jQuery(document).ready(processUserInterfaceElements);
}