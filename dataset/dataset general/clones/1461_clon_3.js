(function ($) {

    // Internal reference to the resource management API
    var ResourceAPI = $.resource = {
        apiRevision: "1.0.3", // Current API version for reference

        // Enables support for older HTTP clients by mapping PUT/DELETE to POST
        enableLegacyHttpMethods: function() {
            ResourceAPI.creationDefaults.httpMethod =
            ResourceAPI.deletionDefaults.httpMethod =
            ResourceAPI.modificationDefaults.httpMethod = "POST";
            ResourceAPI.retrievalDefaults.httpMethod = "GET";
        },

        // Default configuration settings for all resource operations
        defaultSettings: {
            responseFormat: "resource", // Custom data type for jQuery.ajax
            deepExtract: true,          // Flag for jQuery.values plugin behavior
            applyResultToElement: true, // Whether to update target element with response
            extractDataFromElement: true, // Whether to get data from target element
            requestTimeout: 30000,      // Default AJAX request timeout in ms
            defaultHeaders: {           // Default headers for all requests
                "X-Requested-With": "XMLHttpRequest"
            }
        },

        // Default configurations for specific CRUD-like operations
        creationDefaults: {
            httpMethod: "POST",
            needsBodySerialization: true
        },
        retrievalDefaults: {
            httpMethod: "GET",
            needsBodySerialization: false
        },
        modificationDefaults: {
            httpMethod: "PUT",
            needsBodySerialization: true
        },
        deletionDefaults: {
            httpMethod: "DELETE",
            needsBodySerialization: false,
            // Custom action after successful deletion on an element
            elementPostProcess: function() {
                $(this).remove();
            }
        },

        // Global data payload to be merged into all requests
        globalPayload: null,
        // Optional prefix for all URLs managed by this API
        urlPrefix: "",
        // Debug mode flag for console logging
        _debugMode: false,
        // Global error handler for unhandled HTTP status codes
        globalErrorHandler: null,

        /**
         * Helper function to determine if an object is a jQuery instance.
         * @param {object} obj - The object to check.
         * @returns {boolean} True if it's a jQuery object, false otherwise.
         */
        _isJQueryInstance: function(obj) {
            return obj && (obj instanceof jQuery || (typeof obj.jquery === 'string'));
        },

        /**
         * Normalizes the various argument permutations into a single options object.
         * @param {string|object} urlOrOpts - The URL string or an options object.
         * @param {object|function} dataOrSuccess - Data object or success callback.
         * @param {function|object} successOrOpts - Success callback or options object.
         * @param {object} [finalOpts] - Final options object.
         * @returns {object} A comprehensive options object.
         */
        normalizeArguments: function(urlOrOpts, dataOrSuccess, successOrOpts, finalOpts) {
            let invocationOptions = {};
            let requestUrl = null;
            let requestPayload = null;
            let successCallback = null;

            // Handle the case where only an options object is passed
            if (arguments.length === 1 && typeof urlOrOpts === "object") {
                invocationOptions = urlOrOpts;
                requestUrl = invocationOptions.url || null; // Extract URL if present
            } else {
                // Determine argument types and assign accordingly
                if (typeof finalOpts === "object") {
                    invocationOptions = finalOpts;
                }
                if (typeof successOrOpts === "function") {
                    successCallback = successOrOpts;
                } else if (typeof successOrOpts === "object") {
                    invocationOptions = Object.assign(invocationOptions, successOrOpts);
                }

                if (typeof dataOrSuccess === "function") {
                    successCallback = dataOrSuccess;
                } else if (typeof dataOrSuccess === "object") {
                    requestPayload = dataOrSuccess;
                }

                if (typeof urlOrOpts === "string") {
                    requestUrl = urlOrOpts;
                }
            }

            // Merge default settings and operation-specific settings
            let mergedOptions = Object.assign({}, ResourceAPI.defaultSettings, invocationOptions);
            if (ResourceAPI._isJQueryInstance(this)) {
                mergedOptions.targetElement = this; // Store reference to the jQuery element
            } else {
                // Merge action-specific defaults (e.g., creationDefaults for 'createResource')
                let contextKey = this.toString(); // e.g., 'createResource', 'fetchResource'
                Object.assign(mergedOptions, ResourceAPI[contextKey]);
            }

            // Apply extracted arguments
            if (requestUrl) {
                mergedOptions.url = requestUrl;
            }
            if (successCallback) {
                mergedOptions.success = successCallback;
            }
            if (requestPayload) {
                mergedOptions.data = requestPayload;
            }

            // Validate URL presence
            if (!mergedOptions.url) {
                ResourceAPI._logDebug("Error: A URL is required for resource operations.", mergedOptions);
                throw new Error("ResourceAPI: URL is missing in the request options.");
            }

            return mergedOptions;
        },

        /**
         * Interpolates URL path segments using data properties and removes them from the data object.
         * e.g., "/items/{id}" with {id: 123, name: "test"} becomes "/items/123" with {name: "test"}.
         * @param {string} rawUrl - The URL string with potential placeholders.
         * @param {object} [payloadData] - The data object to use for interpolation.
         * @param {boolean} [shouldCloneData] - If true, clones the data object before modification.
         * @returns {string} The interpolated URL.
         */
        interpolateUrlPath: function(rawUrl, payloadData, shouldCloneData) {
            let currentUrl = rawUrl;
            let dataForInterpolation = payloadData || Object.assign({}, ResourceAPI.globalPayload);

            if (shouldCloneData) {
                dataForInterpolation = Object.assign({}, dataForInterpolation);
            }

            if (!dataForInterpolation || typeof dataForInterpolation !== 'object') {
                return currentUrl; // No data to interpolate
            }

            for (let key in dataForInterpolation) {
                if (Object.prototype.hasOwnProperty.call(dataForInterpolation, key)) {
                    let placeholder = `{${key}}`;
                    if (currentUrl.includes(placeholder)) {
                        let value = dataForInterpolation[key];
                        currentUrl = currentUrl.replace(new RegExp(placeholder, 'g'), encodeURIComponent(value));
                        delete dataForInterpolation[key]; // Remove consumed property
                    }
                }
            }
            return currentUrl;
        },

        /**
         * Prepares the final AJAX request options object, applying global settings,
         * URL prefix, and callback wrappers.
         * @returns {object} The prepared AJAX options object.
         */
        prepareRequestOptions: function() {
            let initialOptions = ResourceAPI.normalizeArguments.apply(this, arguments);

            // Merge global payload, ensuring local data overrides global
            if (ResourceAPI.globalPayload || initialOptions.data) {
                initialOptions.data = Object.assign({}, ResourceAPI.globalPayload, initialOptions.data);
            }

            // Interpolate URL path parameters
            initialOptions.url = ResourceAPI.interpolateUrlPath(initialOptions.url, initialOptions.data);

            // Apply URL prefix if configured
            if (ResourceAPI.urlPrefix) {
                initialOptions.url = ResourceAPI.urlPrefix + initialOptions.url;
            }

            // Merge default headers with any custom headers provided
            initialOptions.headers = Object.assign({}, ResourceAPI.defaultSettings.defaultHeaders, initialOptions.headers);

            // Set request timeout
            if (!initialOptions.timeout) {
                initialOptions.timeout = initialOptions.requestTimeout;
            }

            // Wrap success and error callbacks with before/after hooks and data processing
            initialOptions.success = ResourceAPI.createCallbackWrapper(
                initialOptions.success,
                initialOptions.preExecutionHook,
                initialOptions.postExecutionHook,
                initialOptions.responseFormat,
                initialOptions
            );
            initialOptions.error = ResourceAPI.processErrorResponse(initialOptions.error, initialOptions);

            // Handle request body serialization for POST/PUT operations if needed
            if (initialOptions.needsBodySerialization && typeof JSON !== 'undefined') {
                ResourceAPI.serializeRequestBody(initialOptions);
            }

            ResourceAPI._logDebug("Prepared Request Options:", initialOptions);
            return initialOptions;
        },

        /**
         * Creates a standardized error handler for AJAX requests, supporting status-code specific callbacks.
         * @param {function} defaultErrorHandler - The default error callback.
         * @param {object} requestOptions - The options object for the current request.
         * @returns {function} The wrapped error handling function.
         */
        processErrorResponse: function(defaultErrorHandler, requestOptions) {
            return function(xmlHttpRequest, requestStatus, errorThrown) {
                ResourceAPI._logDebug("Error Response Received:", { xhr: xmlHttpRequest, status: requestStatus, error: errorThrown, options: requestOptions });

                let specificErrorHandler = requestOptions[xmlHttpRequest.status];
                let handlerToExecute = defaultErrorHandler; // Fallback to default error handler

                if (specificErrorHandler) {
                    requestOptions.errorHandledExplicitly = true; // Mark as handled
                    if (specificErrorHandler === 'success') {
                        // Treat this HTTP status code as a success
                        ResourceAPI._logDebug(`Treating status ${xmlHttpRequest.status} as success.`);
                        return requestOptions.success(null, requestStatus, xmlHttpRequest); // Pass null data, status, and xhr
                    }
                    handlerToExecute = specificErrorHandler;
                } else if (ResourceAPI.globalErrorHandler) {
                    ResourceAPI._logDebug("Invoking global error handler for status:", xmlHttpRequest.status);
                    handlerToExecute = ResourceAPI.globalErrorHandler;
                }

                // Execute the chosen error handler, wrapped with before/after logic
                ResourceAPI.createCallbackWrapper(
                    handlerToExecute,
                    requestOptions.preExecutionHook,
                    requestOptions.postExecutionHook,
                    null, // No special data processing for error callbacks
                    requestOptions
                ).apply(this, arguments); // Pass original arguments to the wrapper
            };
        },

        /**
         * Wraps a primary callback with optional pre- and post-execution hooks and data processing.
         * @param {function} mainCallback - The primary callback (e.g., success, error).
         * @param {function} preExecutionHook - Callback to execute before the main callback.
         * @param {function} postExecutionHook - Callback to execute after the main callback.
         * @param {string} responseDataType - The expected data type for response processing.
         * @param {object} invocationOptions - The options object for the current request.
         * @returns {function} The wrapped callback function.
         */
        createCallbackWrapper: function(mainCallback, preExecutionHook, postExecutionHook, responseDataType, invocationOptions) {
            return function() {
                let contextObject = this;
                let callbackArgs = Array.from(arguments);
                callbackArgs.push(invocationOptions); // Always add options as the last argument

                // Custom response data processing if 'resource' type
                if (responseDataType === 'resource' && callbackArgs[0] && typeof callbackArgs[0] === 'string') {
                    callbackArgs[0] = ResourceAPI.deserializeResponseBody(callbackArgs[0], invocationOptions);
                }

                if (preExecutionHook && typeof preExecutionHook === 'function') {
                    preExecutionHook.apply(contextObject, callbackArgs);
                }

                if (mainCallback && typeof mainCallback === 'function') {
                    mainCallback.apply(contextObject, callbackArgs);
                }

                if (postExecutionHook && typeof postExecutionHook === 'function') {
                    postExecutionHook.apply(contextObject, callbackArgs);
                }
            };
        },

        /**
         * Serializes the request body to JSON if required and sets content type.
         * @param {object} requestOptions - The AJAX request options object.
         */
        serializeRequestBody: function(requestOptions) {
            requestOptions.processData = false; // Prevent jQuery from processing data
            if (!requestOptions.contentType) {
                requestOptions.contentType = "application/json";
            }
            if (typeof requestOptions.data !== "string") {
                if (typeof JSON === 'object' && JSON.stringify) {
                    requestOptions.data = JSON.stringify(requestOptions.data || {});
                } else {
                    ResourceAPI._logDebug("Warning: JSON.stringify not available for serializing request body.", requestOptions);
                    // Fallback to query string or throw error depending on strictness
                    requestOptions.data = $.param(requestOptions.data || {});
                    requestOptions.contentType = "application/x-www-form-urlencoded";
                }
            }
            // Add a hook for transforming the serialized request data
            if (requestOptions.transformRequestData && typeof requestOptions.transformRequestData === 'function') {
                requestOptions.data = requestOptions.transformRequestData(requestOptions.data);
            }
        },

        /**
         * Deserializes the raw response string into an appropriate JavaScript object or jQuery element.
         * @param {string} rawResponseString - The raw response text from the server.
         * @param {object} invocationOptions - The options object for the current request.
         * @returns {object|jQuery|null} The deserialized response.
         */
        deserializeResponseBody: function(rawResponseString, invocationOptions) {
            if (!rawResponseString || typeof rawResponseString !== 'string' || rawResponseString.trim().length === 0) {
                return null;
            }

            let processedData = null;

            // Check if response is HTML (starts with '<')
            if (rawResponseString.trim().charAt(0) === '<') {
                processedData = $(rawResponseString);
            } else if (typeof JSON === 'object' && JSON.parse) {
                try {
                    processedData = JSON.parse(rawResponseString);
                } catch (e) {
                    ResourceAPI._logDebug("Error parsing JSON response:", e, rawResponseString);
                    processedData = rawResponseString; // Return raw string if parsing fails
                }
            } else {
                ResourceAPI._logDebug("Warning: JSON.parse not available. Returning raw response string.", rawResponseString);
                processedData = rawResponseString;
            }

            // Add a hook for transforming the deserialized response data
            if (invocationOptions.transformResponseData && typeof invocationOptions.transformResponseData === 'function') {
                processedData = invocationOptions.transformResponseData(processedData);
            }
            return processedData;
        },

        /**
         * Handles resource operations initiated on a jQuery element.
         * It extracts data from the element, performs the AJAX call, and updates the element with the response.
         * @param {string} operationType - The type of operation (e.g., 'creationDefaults', 'retrievalDefaults').
         * @param {object} requestOptions - The prepared request options.
         */
        handleElementAction: function(operationType, requestOptions) {
            let currentElement = this; // The jQuery element context

            // Extract data from the element if no data is provided and `extractDataFromElement` is true
            if (!requestOptions.data && requestOptions.extractDataFromElement && $.fn.values) {
                requestOptions.data = currentElement.values(requestOptions);
                ResourceAPI._logDebug("Extracted data from element:", requestOptions.data);
            }

            // Store the original success callback to chain it after element updates
            let originalSuccessCallback = requestOptions.success;

            // Override the success callback to handle element updates
            requestOptions.success = function(responseData, requestStatus, xmlHttpRequest) {
                // Apply response data back to the element if `applyResultToElement` is true and data exists
                if (responseData && requestOptions.applyResultToElement && $.fn.values) {
                    currentElement.values(responseData, requestOptions);
                    ResourceAPI._logDebug("Applied response data to element:", responseData);
                }

                // Execute the original success callback
                if (originalSuccessCallback) {
                    originalSuccessCallback.apply(this, arguments);
                }

                // Execute element-specific post-process hook if defined
                if (requestOptions.elementPostProcess && typeof requestOptions.elementPostProcess === 'function') {
                    requestOptions.elementPostProcess.apply(currentElement, arguments);
                }
            };

            // Execute the AJAX request using the prepared options
            ResourceAPI.executeHttpRequest(requestOptions);
        },

        /**
         * Executes the actual jQuery.ajax request and stores the XHR object.
         * @param {object} requestOptions - The prepared AJAX options.
         * @returns {jQuery.jqXHR} The jQuery XMLHttpRequest object.
         */
        executeHttpRequest: function(requestOptions) {
            // Store the XHR object in the options for access in callbacks
            requestOptions.xmlHttpRequest = $.ajax(requestOptions);
            return requestOptions.xmlHttpRequest;
        },

        /**
         * Helper for debug logging.
         * @param {string} message - The log message.
         * @param {...any} args - Additional arguments to log.
         */
        _logDebug: function(message, ...args) {
            if (ResourceAPI._debugMode && typeof console !== 'undefined' && console.log) {
                console.log(`[ResourceAPI Debug] ${message}`, ...args);
            }
        }
    };

    // Define the global and element-level functions for each resource action
    const resourceActions = ['creationDefaults', 'retrievalDefaults', 'modificationDefaults', 'deletionDefaults'];
    const functionNames = ['createResource', 'fetchResource', 'updateResource', 'removeResource'];

    resourceActions.forEach(function(operationType, index) {
        const functionName = functionNames[index];

        // Global function (e.g., $.createResource(url, data, ...))
        $[functionName] = function() {
            // 'this' context here will be 'creationDefaults', 'retrievalDefaults', etc.
            return ResourceAPI.executeHttpRequest(ResourceAPI.prepareRequestOptions.apply(operationType, arguments));
        };

        // jQuery element plugin function (e.g., $('#myElement').createResource(url, data, ...))
        $.fn[functionName] = function() {
            const invocationArgs = arguments;
            return this.each(function() {
                const targetElement = $(this);
                // 'this' context for normalizeArguments will be the jQuery element,
                // which is then correctly handled by ResourceAPI.normalizeArguments
                let elementOptions = ResourceAPI.normalizeArguments.apply(targetElement, invocationArgs);
                elementOptions.operationType = operationType; // Pass the operation type for handling
                ResourceAPI.handleElementAction.call(targetElement, operationType, elementOptions);
            });
        };
    });

})(jQuery);