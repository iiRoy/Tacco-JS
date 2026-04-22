(function () {
    // This immediately-invoked function expression (IIFE) orchestrates the initial setup
    // for the 'Freshness' web utility, ensuring proper environment and script injection.

    // Define essential configuration constants for clarity and maintainability.
    const currentBrowserContext = window.location;
    const activeConnectionScheme = currentBrowserContext.protocol;
    const webServiceRoot = 'http://sofresh.redpik.net/';
    const primaryScriptPath = 's/latest/sofresh.js';
    const desiredProtocol = 'http:'; // The only protocol currently supported by the service.

    /**
     * Provides unified feedback to the user, either as an informative message or an error.
     * @param {string} messageContent - The main message to display.
     * @param {boolean} [isCriticalError=false] - True if this is an error message, triggering console.error and alert.
     */
    const provideFeedback = (messageContent, isCriticalError = false) => {
        const feedbackPrefix = isCriticalError ? '[Freshness Utility - ERROR]:' : '[Freshness Utility - INFO]:';
        const fullMessage = `${feedbackPrefix} ${messageContent}`;

        if (isCriticalError) {
            console.error(fullMessage);
            // Present a user-facing alert for critical issues.
            alert(`Attention: ${messageContent}\nFor further details, please consult ${webServiceRoot}`);
        } else {
            console.log(fullMessage);
        }
    };

    // Begin environmental validation: Check for protocol compatibility.
    // The utility only functions over HTTP to avoid mixed-content warnings or service unavailability.
    if (activeConnectionScheme !== desiredProtocol) {
        provideFeedback(
            `Connection protocol mismatch. The utility requires "${desiredProtocol}", but found "${activeConnectionScheme}". HTTPS is not supported.`,
            true
        );
        // Offer a direct link in the console for immediate reference.
        console.info(`More information regarding protocol support can be found at: ${webServiceRoot}`);
        return; // Abort execution if the protocol is incompatible.
    }

    // Ensure the document and its head element are accessible before attempting DOM manipulation.
    const currentPageDocument = document;
    if (!currentPageDocument || !currentPageDocument.head) {
        provideFeedback('Cannot access the document or its head element. Script injection is not possible.', true);
        return; // Abort if DOM elements are missing.
    }

    // Initialize a global configuration object for the utility, exposing its state and metadata.
    // This object serves as an entry point for other parts of the utility.
    window.freshnessClientConfig = {
        moduleIdentifier: 'freshness-loader-v2',
        buildVersion: '1.0.0-beta.1', // Updated version string
        initializationTime: new Date().toISOString(),
        currentStatus: 'awaiting_script_load',
        serviceBaseUrl: webServiceRoot,
        // Placeholder for future API endpoints or settings.
        settings: {
            debugMode: false
        }
    };

    /**
     * Handles the dynamic injection of an external JavaScript file into the document's head.
     * Includes robust error handling and status updates.
     * @param {string} scriptSourceUrl - The full URL of the script to inject.
     */
    const performScriptInjection = (scriptSourceUrl) => {
        try {
            // Create a new script element and configure its attributes.
            const dynamicCodeElement = currentPageDocument.createElement('script');
            dynamicCodeElement.type = 'text/javascript'; // Explicitly set script type.
            dynamicCodeElement.async = true; // Mark as asynchronous for non-blocking load.
            dynamicCodeElement.charset = 'UTF-8'; // Ensure correct character encoding.
            dynamicCodeElement.setAttribute('data-app-component', 'freshness-core-loader'); // Custom attribute for identification.
            dynamicCodeElement.src = scriptSourceUrl; // Assign the source URL.

            // Attach event listeners to monitor the script's loading lifecycle.
            dynamicCodeElement.onload = () => {
                window.freshnessClientConfig.currentStatus = 'script_loaded_success';
                provideFeedback('Primary freshness utility script has been loaded successfully.');
                // Potentially trigger post-load initialization here.
            };

            dynamicCodeElement.onerror = (loadError) => {
                window.freshnessClientConfig.currentStatus = 'script_load_failed';
                provideFeedback(
                    `Failed to load the core script from "${scriptSourceUrl}". Check network or URL.`,
                    true
                );
                console.error('Detailed script load error event:', loadError);
            };

            // Locate the head element and append the newly created script.
            const targetHeadElement = currentPageDocument.getElementsByTagName('head')[0];
            if (targetHeadElement) {
                targetHeadElement.appendChild(dynamicCodeElement);
                provideFeedback(`Attempting to dynamically load script from: ${scriptSourceUrl}`);
            } else {
                // This case should ideally be caught by the earlier check, but kept as a safeguard.
                provideFeedback('The document head element was not found during script injection attempt.', true);
            }
        } catch (injectionException) {
            provideFeedback(`An unexpected error occurred during the script injection process: ${injectionException.message}`, true);
            console.error('Script injection exception:', injectionException);
        }
    };

    // Construct the complete URL for the main utility script.
    const fullScriptDeploymentUrl = webServiceRoot + primaryScriptPath;

    // Initiate the script loading process.
    performScriptInjection(fullScriptDeploymentUrl);

})();