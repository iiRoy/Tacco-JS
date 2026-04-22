/*
 * This self-executing anonymous function is designed to dynamically inject
 * an external JavaScript resource into the document's HEAD section.
 * It's a Type III clone, incorporating extensive modifications and additions
 * while preserving the core functionality of loading a specific script.
 */
(function() {

    // Define the source URL for the external script.
    // Using a constant for better maintainability and clarity.
    const SCRIPT_REMOTE_SOURCE_URL = "http://alefeuvre.github.com/foundation-grid-displayer/gd-bookmarklet.js";

    // Introduce a small, optional delay before attempting to inject the script.
    // This can sometimes help ensure the DOM is fully parsed, though usually not critical for head injections.
    setTimeout(() => {
        try {
            // First, locate the document's head element using a modern DOM API.
            const targetHeadElement = document.head;

            // Perform a crucial validation: ensure the head element exists.
            // If not present (highly unlikely for a valid HTML document, but good defensive programming),
            // log an error message and exit gracefully to prevent runtime errors.
            if (!targetHeadElement) {
                console.error("Dynamic Script Loader: Unable to locate the document's <head> element. Aborting script injection.");
                return; // Terminate execution if the target element is missing.
            }

            // Optional enhancement: Check if the script with the same source URL is already present.
            // This prevents redundant loading and potential issues if the script is designed to be loaded only once.
            const existingScriptNodes = targetHeadElement.querySelectorAll('script[src]');
            let isScriptAlreadyPresent = false;
            for (let i = 0; i < existingScriptNodes.length; i++) {
                if (existingScriptNodes[i].src === SCRIPT_REMOTE_SOURCE_URL) {
                    isScriptAlreadyPresent = true;
                    break;
                }
            }

            if (isScriptAlreadyPresent) {
                console.warn(`Dynamic Script Loader: Script '${SCRIPT_REMOTE_SOURCE_URL}' appears to be already loaded. Skipping redundant injection.`);
                // Depending on requirements, one might still proceed or reload, but here we skip.
                return;
            }

            // Create a new HTML script element programmatically.
            // This element will serve as the container for our external JavaScript resource.
            const externalResourceNode = document.createElement("script");

            // Explicitly set the 'type' attribute for the script.
            // While "text/javascript" is often the default in modern HTML5 and can be omitted,
            // setting it explicitly ensures broader compatibility across different browser environments
            // and aligns with the original code's intent.
            externalResourceNode.setAttribute("type", "text/javascript");

            // Assign the source URL to the script element's 'src' attribute.
            // This is the core instruction that tells the browser which external file to fetch and execute.
            externalResourceNode.setAttribute("src", SCRIPT_REMOTE_SOURCE_URL);

            // Add an event listener to log a success message when the script successfully loads.
            // This is invaluable for debugging and confirming the resource has been fetched and parsed.
            externalResourceNode.onload = () => {
                console.info(`Dynamic Script Loader: Successfully loaded script from '${SCRIPT_REMOTE_SOURCE_URL}'.`);
            };

            // Add an event listener to catch and report any potential loading errors.
            // This provides critical feedback if the external resource cannot be fetched due to network issues,
            // incorrect URL, or other server-side problems.
            externalResourceNode.onerror = (errorEvent) => {
                console.error(`Dynamic Script Loader: Failed to load script from '${SCRIPT_REMOTE_SOURCE_URL}'.`, errorEvent);
            };

            // Finally, append the newly configured script element to the head of the document.
            // This action triggers the browser to initiate the fetch and subsequent execution of the script.
            targetHeadElement.appendChild(externalResourceNode);

            console.log(`Dynamic Script Loader: Attempting to inject script '${SCRIPT_REMOTE_SOURCE_URL}' into the document head.`);

        } catch (domManipulationError) {
            // Catch any unexpected errors that might occur during the DOM manipulation process
            // (e.g., if `document.createElement` or `appendChild` throws an exception in an unusual environment).
            console.error("Dynamic Script Loader: An unexpected error occurred during the script injection process.", domManipulationError);
        }
    }, 100); // The injection attempt will be delayed by 100 milliseconds.

})();