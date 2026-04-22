/**
 * HTTP Communications Handler Module
 *
 * This module offers a standardized interface for performing both
 * asynchronous and synchronous HTTP requests using the XMLHttpRequest API.
 * It is designed for modern web environments, focusing on clarity and
 * enhanced error handling compared to its predecessor.
 *
 * License: DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE, Version 2.
 * This software is provided "as is", without any express or implied warranty.
 * Use at your own discretion.
 */

// Establish a reliable reference to the global object,
// supporting both browser (window) and other JS environments (globalThis).
const globalScope = typeof window !== 'undefined' ? window : globalThis;

// Private helper function: Provides a default mechanism for logging unexpected errors.
// This is used when specific error callbacks are not supplied by the caller.
const _logOperationFailure = (issueDetails) => {
    console.error("HTTP Utility: An unhandled exception or operational error occurred:", issueDetails);
    // In a more robust application, this might trigger an analytics event or a UI notification.
};

// Private helper function: Responsible for creating a new XMLHttpRequest instance.
// It encapsulates the browser-specific instantiation logic and handles potential failures.
const _initializeXhrObject = () => {
    let xhrObject = null;
    try {
        // Attempt to create the standard XMLHttpRequest object.
        if (typeof globalScope.XMLHttpRequest !== 'undefined') {
            xhrObject = new globalScope.XMLHttpRequest();
        } else {
            // If XMLHttpRequest is not found, log a warning.
            // No legacy ActiveXObject fallback is included, adhering to modern web practices.
            console.warn("HTTP Utility: XMLHttpRequest is not available in the current environment. Network operations may fail.");
        }
    } catch (creationError) {
        // Catch any exceptions during the XMLHttpRequest object creation process.
        console.error("HTTP Utility: Exception during XMLHttpRequest instantiation:", creationError);
        xhrObject = null; // Ensure a null return on error.
    }
    return xhrObject;
};

// Private helper function: Configures the onreadystatechange event handler for asynchronous requests.
// It centralizes the logic for determining request completion and processing the response status.
const _configureResponseProcessor = (xhrInstance, completionHandler, exceptionHandler) => {
    // Define a constant for the 'DONE' state of an XHR request for improved readability.
    const REQUEST_STATE_DONE = 4;

    xhrInstance.onreadystatechange = () => {
        // Only process the response when the request has fully completed its lifecycle.
        if (xhrInstance.readyState === REQUEST_STATE_DONE) {
            // Check if the HTTP status code indicates a successful response (200-299 range).
            if (xhrInstance.status >= 200 && xhrInstance.status < 300) {
                // If a success handler is provided, invoke it with the XHR instance.
                if (typeof completionHandler === 'function') {
                    completionHandler(xhrInstance);
                } else {
                    console.info("HTTP Utility: Asynchronous request completed successfully, but no specific completion handler was registered.");
                }
            } else {
                // For non-2xx status codes, construct an error object and invoke the error handler.
                const httpResponseError = new Error(`HTTP Utility: Request ended with status ${xhrInstance.status} - ${xhrInstance.statusText || 'Unknown Status'}`);
                httpResponseError.xhr = xhrInstance; // Attach the XHR object for debugging context.
                if (typeof exceptionHandler === 'function') {
                    exceptionHandler(httpResponseError);
                } else {
                    // Fallback to the default error logger if no specific handler is provided.
                    _logOperationFailure(httpResponseError);
                }
            }
        }
    };
};

// The primary module for handling HTTP requests, encapsulated within an IIFE
// to prevent global namespace pollution and manage internal state.
const httpCommunications = (() => {
    // Define a constant for the standard form URL-encoded content type.
    const DEFAULT_FORM_DATA_MIME = "application/x-www-form-urlencoded";

    return {
        /**
         * Initiates an asynchronous GET request to a specified network resource.
         * The response is handled by provided callback functions.
         *
         * @param {string} resourcePath The URL path of the target resource.
         * @param {Function} successCallback Function to call upon successful data retrieval (HTTP 2xx).
         * @param {Function} failureCallback Function to call if an error occurs (network issues, non-2xx HTTP status).
         * @param {string} [usernameForAuth=null] Optional username for HTTP Basic Authentication.
         * @param {string} [passwordForAuth=null] Optional password for HTTP Basic Authentication.
         * @returns {XMLHttpRequest|null} The XMLHttpRequest object used, or null if setup failed.
         */
        retrieveAsynchronousData: (resourcePath, successCallback, failureCallback, usernameForAuth = null, passwordForAuth = null) => {
            // Input validation: Ensure the resource path is a valid string.
            if (!resourcePath || typeof resourcePath !== 'string') {
                const validationIssue = new TypeError("HTTP Utility: 'resourcePath' must be a valid string for asynchronous GET operations.");
                (typeof failureCallback === 'function' ? failureCallback : _logOperationFailure)(validationIssue);
                return null;
            }

            const httpRequestObject = _initializeXhrObject();
            if (!httpRequestObject) {
                const initializationIssue = new Error("HTTP Utility: Failed to create XMLHttpRequest instance for asynchronous GET.");
                (typeof failureCallback === 'function' ? failureCallback : _logOperationFailure)(initializationIssue);
                return null;
            }

            // Apply the centralized response processing logic.
            _configureResponseProcessor(httpRequestObject, successCallback, failureCallback);

            try {
                // Configure and send the GET request. It's asynchronous (true) and can include authentication.
                httpRequestObject.open("GET", resourcePath, true, usernameForAuth, passwordForAuth);
                httpRequestObject.send(null); // GET requests typically do not carry a body.
            } catch (executionError) {
                // Catch and delegate any immediate errors that occur during the request dispatch.
                (typeof failureCallback === 'function' ? failureCallback : _logOperationFailure)(executionError);
                return null;
            }
            return httpRequestObject;
        },

        /**
         * Dispatches an asynchronous POST request, sending a data payload to a resource.
         * Callbacks are used to handle the response.
         *
         * @param {string} resourcePath The target URL for the POST request.
         * @param {*} dataPayload The data to be sent in the request body. Can be string, FormData, etc.
         * @param {Function} successCallback Function to call on successful POST (HTTP 2xx).
         * @param {Function} failureCallback Function to call on error.
         * @param {string} [bodyContentType="application/x-www-form-urlencoded"] The MIME type of the dataPayload.
         * @param {string} [usernameForAuth=null] Optional username for HTTP Basic Authentication.
         * @param {string} [passwordForAuth=null] Optional password for HTTP Basic Authentication.
         * @returns {XMLHttpRequest|null} The XMLHttpRequest object, or null if setup failed.
         */
        transmitAsynchronousData: (resourcePath, dataPayload, successCallback, failureCallback, bodyContentType = DEFAULT_FORM_DATA_MIME, usernameForAuth = null, passwordForAuth = null) => {
            // Input validation.
            if (!resourcePath || typeof resourcePath !== 'string') {
                const validationIssue = new TypeError("HTTP Utility: 'resourcePath' must be a valid string for asynchronous POST operations.");
                (typeof failureCallback === 'function' ? failureCallback : _logOperationFailure)(validationIssue);
                return null;
            }

            const httpRequestObject = _initializeXhrObject();
            if (!httpRequestObject) {
                const initializationIssue = new Error("HTTP Utility: Failed to create XMLHttpRequest instance for asynchronous POST.");
                (typeof failureCallback === 'function' ? failureCallback : _logOperationFailure)(initializationIssue);
                return null;
            }

            _configureResponseProcessor(httpRequestObject, successCallback, failureCallback);

            try {
                // Configure the POST request (asynchronous).
                httpRequestObject.open("POST", resourcePath, true, usernameForAuth, passwordForAuth);
                // Set the Content-Type header before sending the request body.
                httpRequestObject.setRequestHeader("Content-Type", bodyContentType);
                httpRequestObject.send(dataPayload); // Send the provided data payload.
            } catch (executionError) {
                (typeof failureCallback === 'function' ? failureCallback : _logOperationFailure)(executionError);
                return null;
            }
            return httpRequestObject;
        },

        /**
         * Executes a synchronous GET request. This method blocks the browser's main thread
         * until the request completes, which can lead to a frozen UI. Use with caution.
         *
         * As per the original's design philosophy for synchronous calls, this method
         * directly throws exceptions on failure instead of using callbacks.
         *
         * @param {string} resourcePath The URL path of the resource to fetch.
         * @param {string} [usernameForAuth=null] Optional username for authentication.
         * @param {string} [passwordForAuth=null] Optional password for authentication.
         * @returns {XMLHttpRequest} The XMLHttpRequest object upon request completion.
         * @throws {TypeError} If `resourcePath` is invalid.
         * @throws {Error} If XMLHttpRequest cannot be created or a network/HTTP error occurs.
         */
        retrieveSynchronousData: (resourcePath, usernameForAuth = null, passwordForAuth = null) => {
            // Strict validation for synchronous operations.
            if (!resourcePath || typeof resourcePath !== 'string') {
                throw new TypeError("HTTP Utility: 'resourcePath' is an essential string parameter for synchronous GET.");
            }

            const httpRequestObject = _initializeXhrObject();
            if (!httpRequestObject) {
                throw new Error("HTTP Utility: Could not create XMLHttpRequest instance for synchronous GET.");
            }

            // Open the synchronous GET request. The 'false' parameter makes it synchronous.
            httpRequestObject.open("GET", resourcePath, false, usernameForAuth, passwordForAuth);
            // Send the request. Execution will pause here until the response is fully received.
            httpRequestObject.send(null);
            return httpRequestObject;
        },

        /**
         * Executes a synchronous POST request with a specified data payload.
         * This method also blocks the UI thread.
         *
         * Errors are thrown directly, consistent with other synchronous operations.
         *
         * @param {string} resourcePath The target URL for the POST.
         * @param {*} dataPayload The data to include in the request body.
         * @param {string} [bodyContentType="application/x-www-form-urlencoded"] The MIME type of the payload.
         * @param {string} [usernameForAuth=null] Optional username for authentication.
         * @param {string} [passwordForAuth=null] Optional password for authentication.
         * @returns {XMLHttpRequest} The XMLHttpRequest object upon request completion.
         * @throws {TypeError} If `resourcePath` is invalid.
         * @throws {Error} If XMLHttpRequest cannot be created or a network/HTTP error occurs.
         */
        transmitSynchronousData: (resourcePath, dataPayload, bodyContentType = DEFAULT_FORM_DATA_MIME, usernameForAuth = null, passwordForAuth = null) => {
            // Strict validation for synchronous operations.
            if (!resourcePath || typeof resourcePath !== 'string') {
                throw new TypeError("HTTP Utility: 'resourcePath' is an essential string parameter for synchronous POST.");
            }

            const httpRequestObject = _initializeXhrObject();
            if (!httpRequestObject) {
                throw new Error("HTTP Utility: Could not create XMLHttpRequest instance for synchronous POST.");
            }

            // Open the synchronous POST request.
            httpRequestObject.open("POST", resourcePath, false, usernameForAuth, passwordForAuth);
            // Set the Content-Type header prior to sending the body.
            httpRequestObject.setRequestHeader("Content-Type", bodyContentType);
            // Send the data payload. Execution blocks until the server responds.
            httpRequestObject.send(dataPayload);
            return httpRequestObject;
        }
    };
})(); // End of the IIFE defining the httpCommunications module.