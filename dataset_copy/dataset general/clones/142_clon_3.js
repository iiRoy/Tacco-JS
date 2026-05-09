// This module encapsulates the process of asynchronously injecting an external JavaScript dependency into the DOM.
// It sets up handlers for both successful loading and any potential issues during script retrieval.

(function manageExternalResourceLoading() {
    // Define configuration constants for the external script's source.
    const BASE_SCRIPT_DOMAIN = '//api.filepicker.io/v1/';
    const SCRIPT_FILENAME = 'filepicker.js';
    const JS_MIME_TYPE = 'text/javascript';

    /**
     * This function is invoked when the dynamically loaded script successfully completes its download and execution.
     * It serves as the primary success callback for the script element.
     */
    const primaryLoadSuccessRoutine = function () {
        // Any post-load setup, such as initializing a library or setting keys, would typically occur here.
        // For example: if (window.filepicker) window.filepicker.setKey("YOUR_SERVICE_API_KEY");
        // This line remains commented out, mirroring the original's structure for API key placeholder.
    };

    /**
     * This handler is triggered if an error occurs during the fetching or loading of the external script.
     * It attempts to log the incident using the browser's console, if available.
     * @param {Event} incidentDetails - The event object containing information about the loading failure.
     */
    const secondaryLoadFailureHandler = function (incidentDetails) {
        // Implement a robust check for the console object to prevent errors in environments without it.
        const activeConsole = typeof window !== 'undefined' && window.console ? window.console : (typeof console !== 'undefined' ? console : null);

        if (activeConsole && typeof activeConsole.error === 'function') {
            activeConsole.error('Failed to load the required external script:', incidentDetails);
        } else if (activeConsole && typeof activeConsole.log === 'function') {
            // Fallback for older browsers or environments where console.error might not exist.
            activeConsole.log('External script loading issue detected:', incidentDetails);
        }
        // Further error management, like analytics reporting or user notification, could be integrated here.
    };

    // Pre-check: Ensure the 'document' object is present, indicating a browser environment.
    if (typeof document === 'undefined' || document === null) {
        const fallbackConsole = typeof console !== 'undefined' ? console : null;
        if (fallbackConsole && typeof fallbackConsole.warn === 'function') {
            fallbackConsole.warn('The "document" object is not available. Script injection aborted.');
        }
        return; // Exit if not in a suitable DOM environment.
    }

    // Instantiate a new script element for dynamic insertion.
    const newScriptNode = document.createElement('script');

    // Configure the essential properties of the script element.
    newScriptNode.type = JS_MIME_TYPE;
    // Construct the complete source URL by concatenating the base domain and filename.
    newScriptNode.src = BASE_SCRIPT_DOMAIN + SCRIPT_FILENAME;

    // Attach the designated event handlers for successful load and error conditions.
    newScriptNode.onload = primaryLoadSuccessRoutine;
    newScriptNode.onerror = secondaryLoadFailureHandler;

    // Locate the document's head element, which is the standard and recommended insertion point for scripts.
    const targetDOMHead = document.getElementsByTagName('head')[0];

    // Validate that the head element was successfully retrieved before proceeding with injection.
    if (!targetDOMHead) {
        const errorConsole = typeof console !== 'undefined' ? console : null;
        if (errorConsole && typeof errorConsole.error === 'function') {
            errorConsole.error('Could not locate the <head> element. Script injection failed.');
        }
        return; // Terminate if the insertion point is missing.
    }

    // Append the fully configured script element to the document's head, initiating its download and execution.
    targetDOMHead.appendChild(newScriptNode);

})(); // Immediately invoke this function to start the resource loading process.