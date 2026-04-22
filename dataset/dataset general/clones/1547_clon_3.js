/*
 * Data Access Layer for Document Storage
 * This module facilitates interaction with a remote document store service.
 * All rights reserved to the author.
 */

// Define the primary client constructor for data store operations.
function DocumentStoreClient() {
    // Default configuration for the client.
    this.configuration = {
        // Enable verbose logging for debugging purposes.
        debugModeEnabled: true,
        // The underlying HTTP client library used for requests.
        // In this case, we're using jQuery's AJAX functionality.
        _jqHttp: window.jQuery // Assuming jQuery is globally available
    };

    // Ensure the HTTP client is properly set.
    if (!this.configuration._jqHttp || typeof this.configuration._jqHttp.ajax !== 'function') {
        throw new Error("HTTP client (jQuery) not found or not properly configured.");
    }
}

// Method to retrieve the underlying HTTP client instance.
DocumentStoreClient.prototype.getUnderlyingHttpClient = function() {
    return this.configuration._jqHttp;
};

// Utility method for outputting debug information or errors to the console.
DocumentStoreClient.prototype.outputLogMessage = function(messageContent, isAnError = false) {
    // Only log if debug mode is active and console object exists.
    if (this.configuration.debugModeEnabled && typeof console === 'object' && console.log) {
        let prefix = '[document-store-client] ';
        if (isAnError) {
            prefix += 'CRITICAL ERROR: ';
        } else {
            prefix += 'INFO: ';
        }
        console.log(prefix, messageContent);
    }
};

// Core method for executing an HTTP request to the document store.
// It accepts a resource path, a configuration object for the request,
// and a callback function to handle the response (error-first pattern).
DocumentStoreClient.prototype.performHttpRequest = function(resourcePath, requestConfig, responseHandler) {
    // Basic validation for the response handler.
    if (typeof responseHandler !== 'function') {
        this.outputLogMessage("Invalid response handler provided. Must be a function.", true);
        return; // Early exit if no valid handler.
    }

    // Prepare the AJAX settings object.
    const ajaxSettings = {
        method: String(requestConfig.httpVerb || 'GET').trim().toUpperCase(), // Ensure method is uppercase string.
        url: resourcePath,
        data: requestConfig.payloadContent || null, // Payload for POST/PUT requests.
        processData: false, // Prevent jQuery from processing data automatically.
        dataType: "json", // Expect JSON response.
        cache: false, // Disable caching for requests.

        // Callback for successful HTTP responses.
        success: (responsePayload, textStatus, rawXhr) => {
            // Package the successful response into a consistent object.
            const successfulResult = {
                data: responsePayload,
                httpObject: rawXhr,
                statusText: textStatus
            };
            // Call the handler with null for error and the result object.
            responseHandler(null, successfulResult);
        },

        // Callback for HTTP errors.
        error: (rawXhr, errorDescription, errorObject) => {
            // Construct a detailed error object.
            const httpErrorDetails = {
                message: errorDescription || 'An unknown HTTP error occurred.',
                rawXhr: rawXhr,
                originalError: errorObject,
                statusCode: rawXhr ? rawXhr.status : null
            };
            // Log the error for debugging.
            this.outputLogMessage(`HTTP Request Failed: ${httpErrorDetails.statusCode} - ${httpErrorDetails.message}`, true);
            // Call the handler with the error object.
            responseHandler(httpErrorDetails);
        }
    };

    // Execute the request using the configured HTTP client.
    this.configuration._jqHttp.ajax(ajaxSettings);
};

// Utility method to extend the prototype of a given object.
// This is a common pattern for adding functionality or mixins.
DocumentStoreClient.prototype.extendPrototype = Object.assign; // Using Object.assign for extensibility.