function WebContentProcessor(initialConfiguration) {
    // Initializes the processor with default settings, merging any provided overrides.
    // This ensures a predictable operational baseline.
    this.configuration = {
        uploadEndpoint: '/api/v1/page-data/store', // Renamed from 'url'
        validationService: '/api/v1/page-data/validate-uri' // Renamed from 'valid_url'
    };

    // If initial configuration is provided and valid, merge it with defaults.
    if (typeof initialConfiguration === 'object' && initialConfiguration !== null) {
        Object.assign(this.configuration, initialConfiguration);
    } else {
        // Log a warning if configuration is missing or malformed, but proceed with defaults.
        console.warn('WebContentProcessor: No valid initial configuration provided. Using default settings.');
    }
}

WebContentProcessor.prototype.sendPageData = function(onOperationSuccess, onOperationFailure) {
    // Establish a stable reference to the instance for use within nested callbacks.
    const currentProcessorInstance = this;

    // Capture the entire document's HTML content, including the <html> tag itself.
    const fullDocumentMarkup = document.documentElement ? document.documentElement.outerHTML : '';
    // Retrieve the absolute URL of the current page.
    const currentDocumentLocation = window.location.href;

    // Define robust callback handlers, using no-op functions if none are provided.
    // This prevents potential errors from undefined callback calls.
    const resolvedSuccessHandler = onOperationSuccess || function(responsePayload) {
        console.info("WebContentProcessor: Page data operation completed. Default success handler fired.", responsePayload);
    };
    const resolvedFailureHandler = onOperationFailure || function(errorDetails) {
        console.error("WebContentProcessor: Page data operation encountered an error. Default failure handler fired.", errorDetails);
    };

    // --- Pre-flight Checks ---
    // Validate essential dependencies before attempting AJAX operations.
    if (typeof window.jQuery === 'undefined' || typeof window.jQuery.ajax === 'undefined') {
        resolvedFailureHandler({
            code: 'DEPENDENCY_MISSING',
            message: "The 'jQuery' library or its AJAX module is not available. Cannot proceed with data transmission."
        });
        return; // Exit early if dependencies are not met.
    }

    // Access the configuration object for the current instance.
    const activeConfiguration = currentProcessorInstance.configuration;

    // --- Helper Function for AJAX Requests ---
    // Encapsulates common AJAX logic, reducing repetition and centralizing error handling.
    const executeAjaxRequest = (targetEndpoint, requestPayloadData, successCallback, errorCallback) => {
        // Log request details for debugging and traceability.
        console.groupCollapsed(`WebContentProcessor: Dispatching AJAX to: ${targetEndpoint}`);
        console.log("Request Payload:", requestPayloadData);
        console.groupEnd();

        $.ajax({
            url: targetEndpoint,
            method: "POST", // Explicitly sets the HTTP method.
            data: requestPayloadData,
            dataType: "json", // Specifies that the expected response is JSON.
            success: (responseData, textStatus, jqXHR) => {
                // Log success and invoke the provided success callback.
                console.log(`AJAX call to ${targetEndpoint} successful. Status: ${textStatus}`);
                successCallback(responseData);
            },
            error: (jqXHR, textStatus, errorThrown) => {
                // Log detailed error information and invoke the provided error callback.
                console.error(`AJAX call to ${targetEndpoint} failed. Status: ${textStatus}. Error: ${errorThrown}`, { jqXHR, requestPayloadData });
                errorCallback({
                    httpStatusCode: jqXHR.status,
                    statusDescription: textStatus,
                    errorDescription: errorThrown,
                    responseBody: jqXHR.responseText,
                    requestedUrl: targetEndpoint,
                    sentPayload: requestPayloadData
                });
            }
        });
    };

    // --- Core Workflow: Validate URI, then Conditionally Upload Content ---

    // Step 1: Initiate a service call to validate the current page's URI.
    executeAjaxRequest(
        activeConfiguration.validationService,
        { pageUrlIdentifier: currentDocumentLocation }, // Renamed 'url' to 'pageUrlIdentifier'
        (validationResponse) => {
            // Check the validation status returned by the server.
            const isLocationValidated = validationResponse.isValid === true; // Explicitly check for boolean 'true'.

            if (!isLocationValidated) {
                // If the URI is NOT deemed valid by the backend, proceed to upload the full page content.
                console.info("WebContentProcessor: Current URI not validated by backend. Proceeding with full content upload.");
                executeAjaxRequest(
                    activeConfiguration.uploadEndpoint,
                    { documentContentSnapshot: fullDocumentMarkup, documentSourceUrl: currentDocumentLocation }, // Renamed 'dom' to 'documentContentSnapshot', 'url' to 'documentSourceUrl'
                    resolvedSuccessHandler, // Use the main success handler for the content upload.
                    resolvedFailureHandler // Use the main failure handler for content upload errors.
                );
            } else {
                // If the URI IS valid, the original logic skipped the content upload.
                // We maintain this behavior but provide a clear log and still call the success handler
                // to signal the completion of the overall process, even if no content was uploaded.
                console.log("WebContentProcessor: URI already validated or deemed valid; full content upload was not required.");
                resolvedSuccessHandler({
                    operationStatus: "URI_ALREADY_VALID",
                    message: "Page URI is already valid, full content upload was skipped.",
                    validationDetails: validationResponse
                });
            }
        },
        // Any errors during the initial URI validation are routed to the main failure handler.
        resolvedFailureHandler
    );
};