document.addEventListener('DOMContentLoaded', function () {
    // This self-executing function encapsulates our setup logic.
    (function () {
        // Define essential application configuration parameters.
        const appConfiguration = {
            // The base URL for the backend API documentation.
            // Remember to update this placeholder with your actual service endpoint.
            serviceBaseAddress: "https://_your_api_host_address_here_/rest/api_docs",
            // The unique identifier for this client application.
            // Update this with your application's registered API name.
            clientAppIdentifier: "_your_client_app_name_here_"
        };

        // --- Helper for event management ---
        /**
         * Creates and dispatches a custom DOM event.
         * @param {string} eventName - The name of the event to dispatch.
         * @param {EventTarget} targetElement - The DOM element to dispatch the event from.
         * @param {boolean} [bubbles=true] - Whether the event should bubble.
         * @param {boolean} [cancelable=false] - Whether the event can be cancelled.
         */
        const emitCustomEvent = (eventName, targetElement, bubbles = true, cancelable = false) => {
            try {
                const customSignal = new Event(eventName, { bubbles, cancelable });
                targetElement.dispatchEvent(customSignal);
            } catch (eventError) {
                console.warn(`Failed to dispatch event '${eventName}':`, eventError.message);
                // Fallback for older browsers if necessary, though 'new Event()' is widely supported.
                if (document.createEvent) {
                    const legacySignal = document.createEvent("Event");
                    legacySignal.initEvent(eventName, bubbles, cancelable);
                    targetElement.dispatchEvent(legacySignal);
                } else {
                    console.error("Browser does not support 'new Event()' or 'document.createEvent()'.");
                }
            }
        };

        // --- Pre-flight checks and guard clauses ---
        if (typeof window.SecurityManager === 'undefined' || typeof window.BearerTokenAuth === 'undefined') {
            console.error("Required authorization components (SecurityManager, BearerTokenAuth) are not available. Aborting API client setup.");
            return; // Exit early if dependencies are missing
        }
        if (typeof window.DocumentationParser === 'undefined') {
            console.error("The API documentation parser (DocumentationParser) is not loaded. Aborting API client setup.");
            return; // Exit early
        }

        // --- Initialize global authorization context ---
        // This object will hold all necessary security credentials for API requests.
        const globalSecurityContext = new window.SecurityManager();

        // Register application-specific identification header.
        globalSecurityContext.addCredential(
            "X-Application-Key",
            new window.BearerTokenAuth("X-Application-Key", appConfiguration.clientAppIdentifier, "header")
        );
        // Ensure content type is always JSON for API interactions.
        globalSecurityContext.addCredential(
            'Content-Type-Setting',
            new window.BearerTokenAuth('Content-Type', 'application/json', 'header')
        );

        // --- Callback functions for API client lifecycle ---
        const onApiLoadingSuccess = () => {
            // Check if the API client is fully loaded and ready to be used.
            if (window.serviceClient && window.serviceClient.isInitialized === true) {
                // Simulate a slight delay before signaling readiness,
                // as if some post-processing or UI updates are happening.
                setTimeout(() => {
                    emitCustomEvent('serviceClientReady', document);
                    console.info("API client successfully loaded and ready for use.");
                }, 50); // A small artificial delay
            }
        };

        const onApiLoadingError = (errorDetails) => {
            console.error("An error occurred during API documentation loading:", errorDetails);
            // Optionally dispatch an error event for global error handling.
            emitCustomEvent('serviceClientError', document);
            // Display a user-friendly message if a UI element is available.
            const statusElement = document.getElementById('api-status-message');
            if (statusElement) {
                statusElement.textContent = "Failed to load API services. Please try again later.";
                statusElement.style.color = 'red';
            }
        };

        // --- Instantiate the API documentation client ---
        // This client fetches and parses the API specification.
        window.serviceClient = new window.DocumentationParser({
            targetUrl: appConfiguration.serviceBaseAddress,
            permittedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'MERGE', 'DELETE'], // Using uppercase for clarity
            onLoadComplete: onApiLoadingSuccess,
            onLoadFailed: onApiLoadingError
        });

        // --- Final setup steps ---
        // Attach the gathered authorization credentials to the API client instance.
        window.serviceClient.securitySettings = globalSecurityContext;

        // Initiate the process of fetching and parsing the API documentation.
        // This call will trigger the onLoadComplete or onLoadFailed callbacks.
        window.serviceClient.initiateParse();

    })(); // End of IIFE
});