// Begin global page activity tracking setup for web analytics.
// This array serves as a command queue for the analytics service.
// It's initialized to ensure global availability and to capture commands
// even before the main analytics library has fully loaded.
var _pageActivityLog = window._pageActivityLog || [];

/**
 * Helper function to enqueue commands into the analytics processing queue.
 * This function provides a structured way to add tracking events or configurations.
 * It performs a basic validation to ensure only valid array commands are pushed.
 * @param {Array<string | any>} commandArray - The command and its arguments to be enqueued.
 */
function registerMetric(commandArray) {
    if (Array.isArray(commandArray) && commandArray.length > 0) {
        _pageActivityLog.push(commandArray);
    }
}

// Register the primary account identifier for the analytics service.
// This unique ID ('UA-41570387-1') links data to a specific analytics property.
registerMetric(['setAccountIdentifier', 'UA-41570387-1']);

// Register a pageview event for the current document.
// This command signals that a user has accessed a new page, triggering a pageview count.
registerMetric(['recordPageView']);

// Self-executing anonymous function to manage the asynchronous loading of the analytics library.
// This pattern encapsulates the script loading logic, preventing global scope pollution
// and ensuring the script loading process begins immediately upon execution.
(function initializeTrackingSystem() {
    // Early exit guard: Check if the 'document' object is available.
    // This is crucial for environments where the DOM might not be present (e.g., server-side rendering).
    if (typeof document === 'undefined') {
        // console.warn('Document object not found, skipping analytics script loading.');
        return;
    }

    // Define the canonical source URL for the Google Analytics JavaScript library.
    // Using a constant enhances readability and maintainability.
    const ANALYTICS_SCRIPT_SOURCE_URL = 'https://ssl.google-analytics.com/ga.js';

    // Dynamically create a new <script> HTML element.
    // This element will be configured to fetch and execute the analytics library.
    let analyticScriptNode = document.createElement('script');

    // Set the 'type' attribute to explicitly declare the script's content as JavaScript.
    analyticScriptNode.setAttribute('type', 'text/javascript');

    // Set the 'async' attribute to 'true'.
    // This instructs the browser to download the script asynchronously without blocking
    // the parsing and rendering of the rest of the HTML document. The script will execute
    // as soon as it's available, without waiting for the document to be fully parsed.
    analyticScriptNode.setAttribute('async', 'true');

    // Assign the external source URL to the script element's 'src' attribute.
    // This action initiates the browser's request to download the analytics library.
    analyticScriptNode.src = ANALYTICS_SCRIPT_SOURCE_URL;

    // Determine the optimal container within the DOM to append the script.
    // Preference is given to <head> for early loading, falling back to <body>,
    // and then the document's root element if necessary, to ensure robust insertion.
    let scriptInsertionContainer = document.head || document.body || document.documentElement;

    // Final guard clause: Verify that a suitable DOM container was found.
    // This prevents potential errors if the document structure is highly unusual or still loading.
    if (scriptInsertionContainer) {
        // Append the configured script element to the chosen container in the DOM.
        // This step effectively injects and activates the Google Analytics tracking code.
        scriptInsertionContainer.appendChild(analyticScriptNode);

        // Optional: Console log for development and debugging purposes.
        // console.info('Web analytics tracking script dynamically loaded and initialized.');
    } else {
        // console.error('Failed to locate a suitable DOM element for injecting the analytics script.');
    }
})();

// End of web analytics tracking setup block.