const secureCrypto = require('crypto'); // Using Node's built-in crypto module for hashing

// Custom error type for API failures
class HttpApiError extends Error {
    constructor(message, statusCode = 500, details = {}) {
        super(message);
        this.name = 'HttpApiError';
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace(this, HttpApiError);
    }
}

/**
 * Utility for generating MD5 hashes.
 * @param {string} inputString - The string to hash.
 * @returns {string} The MD5 hash in hexadecimal format.
 */
function generateMD5Hash(inputString) {
    return secureCrypto.createHash('md5').update(inputString, 'utf8').digest('hex');
}

/**
 * Manages communication with an E-commerce platform's API (e.g., Shopify).
 * Provides methods for authentication flow and API requests.
 */
function ECommerceConnector(connectionSettings) {
    // Enforce 'new' keyword for constructor invocation
    if (!(this instanceof ECommerceConnector)) {
        return new ECommerceConnector(connectionSettings);
    }

    // Validate essential configuration object
    if (!connectionSettings || typeof connectionSettings !== 'object') {
        const errorMsg = "ECommerceConnector requires a valid settings object." +
                         "\nConsult documentation at: https://example.com/docs/connector";
        throw new HttpApiError(errorMsg, 400);
    }

    // Initialize internal settings with defaults
    this.connectionSettings = {
        verbose: true, // Default to verbose logging
        rateLimitDelayMs: 10000, // Delay for 429 status code
        backoffThreshold: 35, // API call limit threshold for backoff
        backoffDelayMs: 1000, // Delay when backoff threshold is met
        retryOnError: true, // Whether to retry requests on error
        errorRetryDelayMs: 10000, // Delay for error retries
        ...connectionSettings // Merge provided settings
    };

    // Ensure verbose is a boolean
    this.connectionSettings.verbose = !!this.connectionSettings.verbose;
}

/**
 * Generates the authorization URL for the E-commerce platform.
 * @returns {string} The complete authorization URL.
 */
ECommerceConnector.prototype.composeAuthorizationUrl = function() {
    const shopDomainPrefix = this.connectionSettings.shop.split(".")[0];
    const baseUrl = `https://${shopDomainPrefix}.myshopify.com/admin/oauth/authorize`;

    // Construct query parameters
    const queryParams = new URLSearchParams({
        client_id: this.connectionSettings.shopifyApiKey,
        scope: this.connectionSettings.shopifyScope,
        redirect_uri: this.connectionSettings.redirectUri
    });

    return `${baseUrl}?${queryParams.toString()}`;
};

/**
 * Stores the obtained access token in the connection settings.
 * @param {string} tokenValue - The access token to store.
 */
ECommerceConnector.prototype.commitAccessToken = function(tokenValue) {
    this.connectionSettings.accessToken = tokenValue;
};

/**
 * Logs messages to the console only if verbose mode is enabled.
 * @param {...any} messages - Messages to log.
 */
ECommerceConnector.prototype.debugLog = function(...messages) {
    if (this.connectionSettings.verbose) {
        console.log('[ECommerceConnector DEBUG]', ...messages);
    }
};

/**
 * Verifies the authenticity of a request signature, typically for webhooks.
 * @param {object} requestParams - The parameters from the incoming request.
 * @returns {boolean} True if the signature is valid, false otherwise.
 */
ECommerceConnector.prototype.validateWebhookSignature = function(requestParams) {
    const incomingSignature = requestParams['signature'];
    if (!incomingSignature) {
        this.debugLog('No signature found in request parameters.');
        return false;
    }

    const signatureComponents = [];
    // Iterate over all parameters, excluding the signature itself
    for (const keyId in requestParams) {
        if (Object.prototype.hasOwnProperty.call(requestParams, keyId) && keyId !== "signature") {
            signatureComponents.push(`${keyId}=${requestParams[keyId]}`);
        }
    }

    // Sort components alphabetically and join them
    const sortedString = signatureComponents.sort().join("");
    const secretKey = this.connectionSettings.shopifySharedSecret;

    // Generate hash using the shared secret and sorted string
    const computedSignature = generateMD5Hash(secretKey + sortedString);

    // Compare generated hash with the incoming signature
    const isValid = (computedSignature === incomingSignature);
    if (!isValid) {
        this.debugLog('Signature validation failed:', { incomingSignature, computedSignature, sortedString });
    }
    return isValid;
};

/**
 * Exchanges a temporary authorization code for a permanent access token.
 * @param {object} queryParameters - Query parameters containing the authorization code.
 * @param {function(Error|null, object|null)} completionCallback - Callback function.
 */
ECommerceConnector.prototype.exchangeAuthorizationCode = function(queryParameters, completionCallback) {
    // Guard clause for signature validation
    if (!this.validateWebhookSignature(queryParameters)) {
        return completionCallback(new HttpApiError("Request signature is not authentic!", 401));
    }

    const tokenExchangePayload = {
        client_id: this.connectionSettings.shopifyApiKey,
        client_secret: this.connectionSettings.shopifySharedSecret,
        code: queryParameters['code']
    };

    const currentInstance = this; // Maintain 'this' context for callbacks

    this.sendHttpRequest('/admin/oauth/access_token', 'POST', tokenExchangePayload, (reqError, responseJson) => {
        if (reqError) {
            return completionCallback(reqError);
        }
        if (!responseJson || !responseJson.access_token) {
            return completionCallback(new HttpApiError("Failed to obtain access token from response.", 500, responseJson));
        }

        currentInstance.commitAccessToken(responseJson.access_token);
        completionCallback(null, responseJson);
    });
};

/**
 * Retrieves the base domain for the connected shop.
 * @returns {string} The shop's domain.
 */
ECommerceConnector.prototype.getShopDomain = function() {
    const shopIdentifier = this.connectionSettings.shop.split(".")[0];
    return `${shopIdentifier}.myshopify.com`;
};

/**
 * Returns the standard HTTPS port.
 * @returns {number} The HTTPS port number.
 */
ECommerceConnector.prototype.getHttpsPort = function() {
  return 443;
};

/**
 * Executes an HTTP request to the E-commerce API endpoint.
 * This is the core request handling method.
 * @param {string} apiEndpoint - The API path (e.g., '/admin/products.json').
 * @param {string} httpMethod - The HTTP method (GET, POST, PUT, DELETE).
 * @param {object|null} requestData - Data payload for POST/PUT requests.
 * @param {function(Error|null, object|null, object|null)} completionCallback - Callback function (error, jsonResponse, responseHeaders).
 * @param {boolean} [isRetryAttempt=false] - Internal flag to track retries.
 */
ECommerceConnector.prototype.sendHttpRequest = function(apiEndpoint, httpMethod, requestData, completionCallback, isRetryAttempt = false) {
    const secureHttpModule = require('https'); // Always use HTTPS for secure API communication
    const currentInstance = this; // Capture 'this' context

    const jsonPayloadString = requestData ? JSON.stringify(requestData) : '';
    const normalizedMethod = httpMethod.toLowerCase();

    const requestOptions = {
        hostname: this.getShopDomain(),
        path: apiEndpoint,
        method: normalizedMethod,
        port: this.getHttpsPort(),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json' // Explicitly request JSON response
        }
    };

    // Add access token if available
    if (this.connectionSettings.accessToken) {
        requestOptions.headers['X-Shopify-Access-Token'] = this.connectionSettings.accessToken;
    }

    // Set Content-Length for methods that send a body
    const methodsWithBody = ['post', 'put', 'delete'];
    if (methodsWithBody.includes(normalizedMethod) && jsonPayloadString) {
        requestOptions.headers['Content-Length'] = Buffer.byteLength(jsonPayloadString, 'utf8');
    }

    this.debugLog(`Initiating API request: ${normalizedMethod.toUpperCase()} ${apiEndpoint}`, requestOptions);

    const httpRequest = secureHttpModule.request(requestOptions, (httpResponse) => {
        currentInstance.debugLog('Response STATUS:', httpResponse.statusCode);
        currentInstance.debugLog('Response HEADERS:', JSON.stringify(httpResponse.headers));

        const apiCallLimitHeader = httpResponse.headers['http_x_shopify_shop_api_call_limit'];
        if (apiCallLimitHeader) {
            currentInstance.debugLog('API Call Limit:', apiCallLimitHeader);
        }

        httpResponse.setEncoding('utf8');
        let responseBuffer = '';

        httpResponse.on('data', (dataChunk) => {
            // currentInstance.debugLog('Received DATA chunk:', dataChunk); // Potentially very noisy
            responseBuffer += dataChunk;
        });

        httpResponse.on('end', () => {
            let delayBeforeCallback = 0;
            const responseStatusCode = httpResponse.statusCode;

            // Handle rate limiting (HTTP 429 Too Many Requests)
            if (responseStatusCode === 429) {
                currentInstance.debugLog(`Rate limit hit (429). Retrying in ${currentInstance.connectionSettings.rateLimitDelayMs} ms.`);
                return setTimeout(() => {
                    currentInstance.sendHttpRequest(apiEndpoint, httpMethod, requestData, completionCallback, true);
                }, currentInstance.connectionSettings.rateLimitDelayMs);
            }

            // Implement backoff logic based on API call limit header
            if (responseStatusCode >= 200 && responseStatusCode < 300 && apiCallLimitHeader) {
                const [currentLimit, maxLimit] = apiCallLimitHeader.split('/').map(Number);
                if (currentLimit >= currentInstance.connectionSettings.backoffThreshold) {
                    delayBeforeCallback = currentInstance.connectionSettings.backoffDelayMs;
                    currentInstance.debugLog(`API backoff threshold reached (${currentLimit}/${maxLimit}). Delaying callback by ${delayBeforeCallback} ms.`);
                }
            }

            setTimeout(() => {
                let parsedJson = {};
                let processingError = null;

                try {
                    // Check if response body is not just whitespace
                    if (responseBuffer.trim().length > 0) {
                        parsedJson = JSON.parse(responseBuffer);
                        // Check for API-specific error messages within the JSON body
                        if (parsedJson.hasOwnProperty('error') || parsedJson.hasOwnProperty('errors')) {
                            processingError = new HttpApiError(
                                `API Error: ${parsedJson.error || JSON.stringify(parsedJson.errors)}`,
                                responseStatusCode,
                                parsedJson
                            );
                        }
                    } else if (responseStatusCode >= 400) {
                         // If no body but error status, create a generic error
                        processingError = new HttpApiError(`API request failed with status ${responseStatusCode}`, responseStatusCode);
                    }
                } catch (exceptionObject) {
                    processingError = new HttpApiError(`Failed to parse API response JSON: ${exceptionObject.message}`, 500, { rawBody: responseBuffer });
                }

                if (processingError && !(processingError instanceof HttpApiError)) {
                    // Wrap generic errors in our custom error type for consistency
                    processingError = new HttpApiError(processingError.message, responseStatusCode, { originalError: processingError });
                }

                // If HTTP status indicates an error but no specific API error was found in body
                if (!processingError && responseStatusCode >= 400) {
                    processingError = new HttpApiError(`API request returned HTTP status ${responseStatusCode}`, responseStatusCode, parsedJson);
                }

                completionCallback(processingError, parsedJson, httpResponse.headers);
            }, delayBeforeCallback);
        });
    });

    httpRequest.on('error', (exceptionObject) => {
        currentInstance.debugLog("Network or Request Error:", exceptionObject.message);

        // Retry on network errors if enabled and not already a retry attempt
        if (currentInstance.connectionSettings.retryOnError && !isRetryAttempt) {
            const retryDelay = currentInstance.connectionSettings.errorRetryDelayMs;
            currentInstance.debugLog(`Retrying API request in ${retryDelay} milliseconds due to error.`);
            setTimeout(() => {
                currentInstance.sendHttpRequest(apiEndpoint, httpMethod, requestData, completionCallback, true);
            }, retryDelay);
        } else {
            completionCallback(new HttpApiError(`Network or connection error: ${exceptionObject.message}`, 503, { originalError: exceptionObject }));
        }
    });

    // Write request data for methods that require a body
    if (methodsWithBody.includes(normalizedMethod) && jsonPayloadString) {
        httpRequest.write(jsonPayloadString);
    }

    httpRequest.end(); // Finalize and send the request
};

/**
 * Performs a GET request to the API.
 * @param {string} endpointPath - The API endpoint.
 * @param {object|function} [queryParamsOrCallback] - Query parameters or the callback function.
 * @param {function} [callback] - The callback function.
 */
ECommerceConnector.prototype.performGet = function(endpointPath, queryParamsOrCallback, callback) {
    let finalCallback = callback;
    let finalQueryParams = null;

    if (typeof queryParamsOrCallback === 'function') {
        finalCallback = queryParamsOrCallback;
    } else if (queryParamsOrCallback !== null && typeof queryParamsOrCallback === 'object') {
        finalQueryParams = queryParamsOrCallback;
    }

    // Append query parameters to the endpoint if present
    let fullEndpoint = endpointPath;
    if (finalQueryParams) {
        const urlParams = new URLSearchParams(finalQueryParams);
        fullEndpoint += `?${urlParams.toString()}`;
    }

    this.sendHttpRequest(fullEndpoint, 'GET', null, finalCallback);
};

/**
 * Performs a POST request to the API.
 * @param {string} endpointPath - The API endpoint.
 * @param {object} payloadData - The data to send in the request body.
 * @param {function} callback - The callback function.
 */
ECommerceConnector.prototype.performPost = function(endpointPath, payloadData, callback) {
    this.sendHttpRequest(endpointPath, 'POST', payloadData, callback);
};

/**
 * Performs a PUT request to the API.
 * @param {string} endpointPath - The API endpoint.
 * @param {object} payloadData - The data to send in the request body.
 * @param {function} callback - The callback function.
 */
ECommerceConnector.prototype.performPut = function(endpointPath, payloadData, callback) {
    this.sendHttpRequest(endpointPath, 'PUT', payloadData, callback);
};

/**
 * Performs a DELETE request to the API.
 * @param {string} endpointPath - The API endpoint.
 * @param {object|function} [payloadOrCallback] - Optional data payload or the callback function.
 * @param {function} [callback] - The callback function.
 */
ECommerceConnector.prototype.performDelete = function(endpointPath, payloadOrCallback, callback) {
    let actualCallback = callback;
    let actualPayload = null;

    if (typeof payloadOrCallback === 'function') {
        actualCallback = payloadOrCallback;
    } else if (payloadOrCallback !== null && typeof payloadOrCallback === 'object') {
        actualPayload = payloadOrCallback;
    }

    // Ensure a callback is always provided, even if it's a no-op
    if (typeof actualCallback !== 'function') {
        this.debugLog('Warning: No callback provided for DELETE request. Using a no-op callback.');
        actualCallback = () => {};
    }

    this.sendHttpRequest(endpointPath, 'DELETE', actualPayload, actualCallback);
};

/**
 * Checks if a specific header exists in the HTTP response headers.
 * @param {object} httpResponse - The HTTP response object.
 * @param {string} headerName - The name of the header to check.
 * @returns {boolean} True if the header exists, false otherwise.
 */
ECommerceConnector.prototype.hasResponseHeader = function(httpResponse, headerName) {
    // Use Object.prototype.hasOwnProperty.call for safer property checks
    return Object.prototype.hasOwnProperty.call(httpResponse.headers, headerName.toLowerCase());
};

module.exports = ECommerceConnector;