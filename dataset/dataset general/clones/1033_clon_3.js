/**
 * fluidDataAccess.js - A concise JavaScript client for interacting with the Fluidinfo platform.
 *
 * @authors Assorted contributors, including early pioneers and subsequent maintainers.
 * @version 1.0.0 (Enhanced Edition)
 * @constructor
 * @param config {Object} Configuration settings for establishing a connection with the Fluidinfo service.
 * <dl>
 *   <dt>loginId</dt>
 *   <dd>The user identifier for authentication with Fluidinfo.</dd>
 *   <dt>secretKey</dt>
 *   <dd>The password or API key required for user authentication.</dd>
 *   <dt>serviceEndpoint</dt>
 *   <dd>Specifies the Fluidinfo environment to connect to. Options include "primary", "dev_sandbox", or a custom URL. Defaults to "primary".</dd>
 *   <dt>accessToken</dt>
 *   <dd>An OAuth2 access token for authenticated requests, superseding loginId/secretKey if provided.</dd>
 * </dl>
 * returns {Object} An interface object for performing operations against the Fluidinfo API.
 */
var fluidClientFactory = function(config) {

    // Simple logging utility for internal use.
    var log = function(level, message) {
        if (typeof console !== 'undefined' && console.log) {
            console.log('[' + level.toUpperCase() + '] FluidClient: ' + message);
        }
    };

    /**
     * Creates a deep duplicate of a given object.
     * This implementation handles basic objects, arrays, and primitive types.
     * It does not handle circular references, Functions, Dates, or RegExps comprehensively.
     *
     * @param sourceEntity {Object} The object to be duplicated.
     * @returns {Object} A new object with the same structure and values as the source.
     */
    var replicateStructure = function(sourceEntity) {
        if (sourceEntity === null || typeof sourceEntity !== 'object') {
            return sourceEntity; // Primitives are returned directly.
        }

        if (sourceEntity instanceof Date) {
            return new Date(sourceEntity.getTime()); // Handle Date objects.
        }

        var newEntity = Array.isArray(sourceEntity) ? [] : {}; // Initialize as array or object.

        for (var prop in sourceEntity) {
            if (Object.prototype.hasOwnProperty.call(sourceEntity, prop)) {
                newEntity[prop] = replicateStructure(sourceEntity[prop]); // Recursively copy.
            }
        }
        return newEntity;
    };

    /**
     * Prepares an 'about' value for use in Fluidinfo queries by escaping special characters.
     *
     * @param inputString {string} The raw 'about' value.
     * @returns {string} The escaped string, suitable for query parameters.
     */
    var escapeFluidQueryTerm = function(inputString) {
        if (typeof inputString !== 'string') {
            log('warn', 'Non-string value provided to escapeFluidQueryTerm. Attempting conversion.');
            inputString = String(inputString);
        }
        return inputString.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    };

    /**
     * A utility for Base64 encoding strings.
     * Adapted from public domain sources and simplified.
     */
    var b64Codec = {
        // Base64 character set.
        encodingAlphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

        /**
         * Encodes a string into Base64 format.
         * @param sourceInput {string} The string to encode.
         * @returns {string} The Base64 encoded string.
         */
        encodeText: function(sourceInput) {
            var encodedOutput = "";
            var charA, charB, charC, idx1, idx2, idx3, idx4;
            var currentIdx = 0;

            // Ensure UTF-8 encoding first.
            sourceInput = b64Codec.toUtf8Bytes(sourceInput);

            while (currentIdx < sourceInput.length) {
                charA = sourceInput.charCodeAt(currentIdx++);
                charB = sourceInput.charCodeAt(currentIdx++);
                charC = sourceInput.charCodeAt(currentIdx++);

                idx1 = charA >> 2;
                idx2 = ((charA & 3) << 4) | (charB >> 4);
                idx3 = ((charB & 15) << 2) | (charC >> 6);
                idx4 = charC & 63;

                // Handle padding for incomplete blocks.
                if (isNaN(charB)) {
                    idx3 = idx4 = 64;
                } else if (isNaN(charC)) {
                    idx4 = 64;
                }

                encodedOutput += this.encodingAlphabet.charAt(idx1) +
                                 this.encodingAlphabet.charAt(idx2) +
                                 this.encodingAlphabet.charAt(idx3) +
                                 this.encodingAlphabet.charAt(idx4);
            }
            return encodedOutput;
        },

        /**
         * Converts a string to its UTF-8 byte representation.
         * @param rawString {string} The string to convert.
         * @returns {string} The UTF-8 encoded string.
         */
        toUtf8Bytes: function(rawString) {
            var utf8String = "";
            rawString = rawString.replace(/\r\n/g, "\n"); // Normalize line endings.

            for (var n = 0; n < rawString.length; n++) {
                var charCode = rawString.charCodeAt(n);
                if (charCode < 128) {
                    utf8String += String.fromCharCode(charCode);
                } else if ((charCode > 127) && (charCode < 2048)) {
                    utf8String += String.fromCharCode((charCode >> 6) | 192);
                    utf8String += String.fromCharCode((charCode & 63) | 128);
                } else {
                    utf8String += String.fromCharCode((charCode >> 12) | 224);
                    utf8String += String.fromCharCode(((charCode >> 6) & 63) | 128);
                    utf8String += String.fromCharCode((charCode & 63) | 128);
                }
            }
            return utf8String;
        }
    };

    // Internal state management for the client.
    var connectionState = {};
    var basicAuthCredentialsB64 = '';
    var oauthTokenValue = '';

    // Define standard Fluidinfo endpoints.
    var standardEndpoints = {
        "primary": "https://fluiddb.fluidinfo.com/",
        "dev_sandbox": "https://sandbox.fluidinfo.com/"
    };

    // Process initial configuration.
    if (config) {
        if (config.serviceEndpoint) {
            var endpointKey = String(config.serviceEndpoint).toLowerCase();
            if (standardEndpoints[endpointKey]) {
                connectionState.baseURL = standardEndpoints[endpointKey];
            } else {
                // Validate custom URL format.
                var urlPattern = /^(http|https):\/\/.+\/$/;
                if (urlPattern.test(config.serviceEndpoint)) {
                    connectionState.baseURL = config.serviceEndpoint;
                } else {
                    throw {
                        name: "ConfigurationError",
                        message: "Custom serviceEndpoint URL must start with http[s]:// and end with a trailing slash. E.g., 'https://your-custom-instance/'"
                    };
                }
            }
        }

        // OAuth2 token takes precedence.
        if (config.accessToken !== undefined && config.accessToken !== null) {
            oauthTokenValue = String(config.accessToken);
        }

        // Basic authentication credentials.
        if (oauthTokenValue === '' && config.loginId && config.secretKey) {
            basicAuthCredentialsB64 = b64Codec.encodeText(
                String(config.loginId) + ":" + String(config.secretKey));
            connectionState.authenticatedUser = String(config.loginId); // Store for potential display.
        }
    }

    // Default to primary endpoint if none specified or invalid.
    if (!connectionState.baseURL) {
        connectionState.baseURL = standardEndpoints["primary"];
    }

    /**
     * Determines if a given value is an array.
     *
     * @param testedItem The value to check.
     * @returns {boolean} True if the value is an array, false otherwise.
     */
    function isAnArrayType(testedItem) {
        return Array.isArray(testedItem);
    }

    /**
     * Converts an array of path components into a correctly URL-encoded path string.
     * E.g., ["users", "john doe", "tags"] -> "/users/john%20doe/tags"
     *
     * @param pathSegments {Array<string>} An array of URL path segments.
     * @returns {string} The fully encoded URL path.
     */
    function constructEncodedPath(pathSegments) {
        if (!isAnArrayType(pathSegments)) {
            log('error', 'constructEncodedPath expects an array of segments.');
            return ''; // Or throw an error.
        }
        // Map each segment to its URI encoded form and join with slashes.
        return pathSegments.map(encodeURIComponent).join('/');
    }

    /**
     * Checks if a value conforms to Fluidinfo's definition of a primitive type.
     * Fluidinfo primitives include numbers, strings, booleans, null, and arrays of strings (sets).
     *
     * @param candidateValue The value to evaluate.
     * @returns {boolean} True if the value is a Fluidinfo primitive, false otherwise.
     */
    function isFluidinfoPrimitiveValue(candidateValue) {
        var candidateJsType = typeof candidateValue;

        // Check standard JS primitives directly.
        if (['number', 'string', 'boolean'].indexOf(candidateJsType) !== -1) {
            return true;
        }

        // Null is also considered a primitive.
        if (candidateValue === null) {
            return true;
        }

        // Check for arrays of strings (Fluidinfo sets).
        if (isAnArrayType(candidateValue)) {
            // All members must be strings.
            for (var i = 0; i < candidateValue.length; i++) {
                if (typeof candidateValue[i] !== "string") {
                    log('warn', 'Array contains non-string elements, not considered a Fluidinfo primitive.');
                    return false;
                }
            }
            return true;
        }

        // If no match, it's not a Fluidinfo primitive.
        return false;
    }

    /**
     * Infers the appropriate Content-Type header value based on request details.
     *
     * @param requestDetails {Object} Contains information about the HTTP request.
     * @returns {string|null} The determined MIME type, or null if not applicable.
     */
    function determineRequestContentType(requestDetails) {
        var inferredContentType = null;
        var requestPath = requestDetails.path || '';

        // Special handling for PUT operations to object/about endpoints (tag values).
        if (requestDetails.type === "PUT" && (requestPath.match(/^objects\//) || requestPath.match(/^about\//))) {
            if (requestDetails.contentType) {
                inferredContentType = requestDetails.contentType;
            } else if (isFluidinfoPrimitiveValue(requestDetails.data)) {
                inferredContentType = "application/vnd.fluiddb.value+json";
            } else {
                throw {
                    name: "ContentTypeError",
                    message: "Content-Type header is required for PUT operations on tag values, or data must be a Fluidinfo primitive."
                };
            }
        } else if (requestDetails.data !== undefined && requestDetails.data !== null) {
            // For other requests with a payload, assume JSON.
            inferredContentType = "application/json";
        }
        return inferredContentType;
    }

    /**
     * Checks if a given Content-Type header indicates JSON-compatible data.
     *
     * @param headerContentType {string} The Content-Type header value.
     * @returns {boolean} True if the content type is JSON-compatible, false otherwise.
     */
    function isContentTypeJsonCompatible(headerContentType) {
        if (!headerContentType) return false;
        var lowerCaseType = headerContentType.toLowerCase();
        return lowerCaseType.indexOf("application/json") !== -1 ||
               lowerCaseType.indexOf("application/vnd.fluiddb.value+json") !== -1;
    }

    /**
     * Transforms an object into a URL-encoded query string.
     *
     * @param queryObject {Object} An object where keys are parameter names and values are their corresponding values.
     * @returns {string} The formatted query string, prefixed with '?'.
     */
    function formatQueryParameters(queryObject) {
        var queryParts = [];
        if (queryObject) {
            for (var paramName in queryObject) {
                if (Object.prototype.hasOwnProperty.call(queryObject, paramName) && typeof queryObject[paramName] !== "function") {
                    var paramValue = queryObject[paramName];
                    if (isAnArrayType(paramValue)) {
                        // Handle array values by repeating the parameter name.
                        paramValue.forEach(function(item) {
                            queryParts.push(encodeURIComponent(paramName) + "=" + encodeURIComponent(item));
                        });
                    } else {
                        queryParts.push(encodeURIComponent(paramName) + "=" + encodeURIComponent(paramValue));
                    }
                }
            }
        }
        return queryParts.length > 0 ? "?" + queryParts.join("&") : "";
    }

    /**
     * Parses all response headers from an XMLHttpRequest object into a structured object.
     * Header names are converted to lowercase.
     *
     * @param xmlHttpRequestObject {XMLHttpRequest} The XHR instance.
     * @returns {Object} An object mapping header names to their values.
     */
    function extractResponseHeaders(xmlHttpRequestObject) {
        var parsedHeaders = {};
        var allRawHeaders = xmlHttpRequestObject.getAllResponseHeaders();

        if (allRawHeaders) {
            // Split by newline (handles both \r\n and \n).
            var headerLines = allRawHeaders.split(/\r?\n/);
            headerLines.forEach(function(line) {
                var trimmedLine = line.trim();
                if (trimmedLine.length > 0) {
                    var separatorIndex = trimmedLine.indexOf(':');
                    if (separatorIndex !== -1) {
                        var headerName = trimmedLine.substring(0, separatorIndex).toLowerCase();
                        var headerValue = trimmedLine.substring(separatorIndex + 1).trim();
                        parsedHeaders[headerName] = headerValue;
                    }
                }
            });
        } else {
            // Fallback for browsers that restrict getAllResponseHeaders.
            var singleContentType = xmlHttpRequestObject.getResponseHeader("content-type");
            if (singleContentType) {
                parsedHeaders["content-type"] = singleContentType;
            }
            log('warn', 'getAllResponseHeaders() was restricted; only content-type might be available.');
        }
        return parsedHeaders;
    }

    /**
     * Attempts to create an appropriate XMLHttpRequest object for the current browser environment.
     *
     * @returns {XMLHttpRequest|ActiveXObject|null} A new XHR instance or null if none can be created.
     */
    function obtainHttpRequestInstance() {
        var xhrConstructors = [
            function() { return new XMLHttpRequest(); },
            function() { return new ActiveXObject("Msxml2.XMLHTTP"); },
            function() { return new ActiveXObject("Microsoft.XMLHTTP"); } // Older IE versions.
        ];

        var availableXhr = null;
        for (var i = 0; i < xhrConstructors.length; i++) {
            try {
                availableXhr = xhrConstructors[i]();
                break; // Success, stop trying.
            } catch (e) {
                // Try next factory.
            }
        }
        if (!availableXhr) {
            log('error', 'Failed to create an XMLHttpRequest object. Your browser might not support it.');
        }
        return availableXhr;
    }

    /**
     * Constructs a user-friendly response object from a raw XMLHttpRequest.
     *
     * @param requestInstance {XMLHttpRequest} The completed XHR object.
     * @returns {Object} A simplified object containing status, headers, raw data, and parsed data.
     */
    function buildSimplifiedResponse(requestInstance) {
        var responseEnvelope = {};
        responseEnvelope.status = requestInstance.status;
        responseEnvelope.statusText = requestInstance.statusText;
        responseEnvelope.headers = extractResponseHeaders(requestInstance);
        responseEnvelope.rawData = requestInstance.responseText;

        // Attempt to parse response data if Content-Type is JSON-compatible.
        if (responseEnvelope.headers['content-type'] && isContentTypeJsonCompatible(responseEnvelope.headers['content-type'])) {
            try {
                responseEnvelope.data = JSON.parse(requestInstance.responseText);
            } catch (e) {
                log('error', 'Failed to parse JSON response: ' + e.message);
                responseEnvelope.data = requestInstance.responseText; // Fallback to raw text.
            }
        } else {
            responseEnvelope.data = requestInstance.responseText;
        }
        responseEnvelope.originalRequest = requestInstance; // Include the raw XHR for debugging.
        return responseEnvelope;
    }

    /**
     * Dispatches an HTTP request to the Fluidinfo API endpoint.
     *
     * @param requestConfiguration {Object} An object detailing the request:
     * <dl>
     *  <dt>type</dt><dd>HTTP method (e.g., "GET", "POST", "PUT", "DELETE", "HEAD").</dd>
     *  <dt>path</dt><dd>The API path, either a string or an array of segments.</dd>
     *  <dt>args</dt><dd>Object of query parameters.</dd>
     *  <dt>data</dt><dd>Request body payload.</dd>
     *  <dt>async</dt><dd>Boolean, whether the request is asynchronous (default: true).</dd>
     *  <dt>contentType</dt><dd>Explicit Content-Type header. If not set, it's inferred.</dd>
     *  <dt>onSuccess</dt><dd>Callback function (responseEnvelope) for successful requests (2xx status).</dd>
     *  <dt>onError</dt><dd>Callback function (responseEnvelope) for failed requests (non-2xx status).</dd>
     * </dl>
     * @returns {Object|undefined} The simplified response object for synchronous requests, or undefined for async.
     */
    function dispatchHttpRequest(requestConfiguration) {
        // Validate and normalize path.
        var processedPath = requestConfiguration.path;
        if (isAnArrayType(processedPath)) {
            processedPath = constructEncodedPath(processedPath);
        } else if (typeof processedPath !== 'string') {
            log('error', 'Invalid path provided: ' + processedPath);
            throw { name: "ArgumentError", message: "Request path must be a string or array of strings." };
        }

        var httpMethod = (requestConfiguration.type || "GET").toUpperCase();
        var queryString = formatQueryParameters(requestConfiguration.args);
        var targetUrl = connectionState.baseURL + processedPath + queryString;
        var isAsynchronous = requestConfiguration.async === false ? false : true; // Explicitly check for false.

        var activeXhr = obtainHttpRequestInstance();
        if (!activeXhr) {
            log('error', 'HTTP request cannot be sent: No XMLHttpRequest object available.');
            return undefined;
        }

        activeXhr.open(httpMethod, targetUrl, isAsynchronous);

        // Set authentication headers.
        if (oauthTokenValue) {
            activeXhr.setRequestHeader('X-FluidDB-Access-Token', oauthTokenValue);
            // Optionally, specify consumer authentication for OAuth2.
            activeXhr.setRequestHeader('Authorization', basicAuthCredentialsB64 ? 'oauth2 ' + basicAuthCredentialsB64 : 'oauth2');
        } else if (basicAuthCredentialsB64) {
            activeXhr.setRequestHeader('Authorization', 'basic ' + basicAuthCredentialsB64);
        }

        // Determine and set Content-Type header, and stringify data if needed.
        var dataPayload = requestConfiguration.data;
        var requestContentType = determineRequestContentType(requestConfiguration);
        if (requestContentType) {
            activeXhr.setRequestHeader("Content-Type", requestContentType);
            if (isContentTypeJsonCompatible(requestContentType) && (typeof dataPayload === 'object' || isAnArrayType(dataPayload))) {
                dataPayload = JSON.stringify(dataPayload);
            }
        }

        // Define a unified handler for response processing.
        var processResponse = function() {
            var responseResult = buildSimplifiedResponse(activeXhr);
            if (activeXhr.status >= 200 && activeXhr.status < 300) {
                if (typeof requestConfiguration.onSuccess === 'function') {
                    requestConfiguration.onSuccess(responseResult);
                } else {
                    log('info', 'Request successful but no onSuccess callback provided.');
                }
            } else {
                if (typeof requestConfiguration.onError === 'function') {
                    requestConfiguration.onError(responseResult);
                } else {
                    log('error', 'Request failed (status ' + activeXhr.status + ') but no onError callback provided.');
                }
            }
        };

        // Assign event handlers based on modern vs. older XHR support.
        try {
            // Prioritize modern event listeners if available.
            if ('onload' in activeXhr && 'onerror' in activeXhr) {
                activeXhr.onload = processResponse;
                activeXhr.onerror = function() {
                    // For network errors or unhandled exceptions.
                    log('error', 'XHR network error or unhandled exception occurred.');
                    var errorResult = buildSimplifiedResponse(activeXhr);
                    if (typeof requestConfiguration.onError === 'function') {
                        requestConfiguration.onError(errorResult);
                    }
                };
            } else {
                // Fallback to onreadystatechange for older browsers.
                activeXhr.onreadystatechange = function() {
                    if (activeXhr.readyState === 4) { // DONE state.
                        processResponse();
                    }
                };
            }
        } catch (e) {
            log('error', 'Error assigning XHR event handlers: ' + e.message);
            // This catch block might indicate issues with cross-origin requests in older IE.
            return undefined;
        }

        // Send the request.
        activeXhr.send(dataPayload || null);

        // For synchronous requests, return the result immediately.
        if (!isAsynchronous) {
            return buildSimplifiedResponse(activeXhr);
        }
        return undefined; // Asynchronous requests return nothing immediately.
    }

    /**
     * Provides an interface for interacting with the Fluidinfo API.
     */
    var dataAccessLayer = {};

    /**
     * Performs an HTTP GET request to retrieve data from Fluidinfo.
     *
     * @param requestOptions {Object} Configuration for the GET request.
     * @returns {Object|undefined} Response for sync requests, undefined for async.
     */
    dataAccessLayer.retrieveResource = function(requestOptions) {
        var currentOptions = replicateStructure(requestOptions || {});
        currentOptions.type = "GET";
        currentOptions.data = null; // GET requests typically don't have a body.
        return dispatchHttpRequest(currentOptions);
    };

    /**
     * Performs an HTTP POST request to create new data in Fluidinfo.
     *
     * @param requestOptions {Object} Configuration for the POST request.
     * @returns {Object|undefined} Response for sync requests, undefined for async.
     */
    dataAccessLayer.createResource = function(requestOptions) {
        var currentOptions = replicateStructure(requestOptions || {});
        currentOptions.type = "POST";
        return dispatchHttpRequest(currentOptions);
    };

    /**
     * Performs an HTTP PUT request to update or create data in Fluidinfo.
     *
     * @param requestOptions {Object} Configuration for the PUT request.
     * @returns {Object|undefined} Response for sync requests, undefined for async.
     */
    dataAccessLayer.updateResource = function(requestOptions) {
        var currentOptions = replicateStructure(requestOptions || {});
        currentOptions.type = "PUT";
        return dispatchHttpRequest(currentOptions);
    };

    /**
     * Performs an HTTP DELETE request to remove data from Fluidinfo.
     *
     * @param requestOptions {Object} Configuration for the DELETE request.
     * @returns {Object|undefined} Response for sync requests, undefined for async.
     */
    dataAccessLayer.removeResource = function(requestOptions) {
        var currentOptions = replicateStructure(requestOptions || {});
        currentOptions.type = "DELETE";
        currentOptions.data = null; // DELETE requests typically don't have a body.
        return dispatchHttpRequest(currentOptions);
    };

    return dataAccessLayer;
};