var webAddress = require('url');
var AuthHandler = require('oauth').OAuth;
var queryParameters = require('querystring');
var DataEncoder = require('serializer');

const endpointRoot = 'https://api.fitbit.com/1'; // Base URL for the external API.

/**
 * Initializes the health tracking service proxy.
 *
 * @param {string} consumerKey         The API key for consumer identification.
 * @param {string} consumerSecret      The API secret for consumer authentication.
 * @param {string} returnAddress       The URL to redirect to after OAuth authentication.
 * @param {string} measurementPreference Optional unit system preference (e.g., 'en_US', 'en_GB').
 * @returns {object} An object containing methods to interact with the API.
 */
module.exports = function (consumerKey, consumerSecret, returnAddress, measurementPreference) {
    let serviceProxy = {
        protocolVer: '1.0.0' // Internal version of this integration library.
    };

    // Creates a secure serializer instance using provided keys.
    var dataProcessor = DataEncoder.createSecureSerializer(consumerKey, consumerSecret);

    // Default HTTP headers for API requests.
    var requestHeaders = {
        'Accept': '*/*',
        'Connection': 'close',
        'User-Agent': 'health-tracker-proxy/' + serviceProxy.protocolVer
    };

    // If a measurement preference is specified, add it to the request headers.
    if (typeof measurementPreference !== 'undefined' && measurementPreference !== null) {
        requestHeaders['Accept-Language'] = measurementPreference;
    }

    // Initialize the OAuth 1.0a client.
    var authProvider = new AuthHandler(
        'https://api.fitbit.com/oauth/request_token', // OAuth Request Token URL
        'https://api.fitbit.com/oauth/access_token',  // OAuth Access Token URL
        consumerKey,                                  // API Consumer Key
        consumerSecret,                               // API Consumer Secret
        '1.0',                                        // OAuth Protocol Version
        returnAddress,                                // Callback URL for redirection
        'HMAC-SHA1',                                  // Signature Method
        undefined,                                    // Nonce value, not used in this context
        requestHeaders                                // Custom HTTP headers
    );

    /**
     * Creates a standardized callback function for OAuth responses.
     *
     * @param {function} completionHandler The original callback to invoke after processing.
     * @returns {function} A wrapped callback that handles errors and JSON parsing.
     */
    function handleResponse(completionHandler) {
        return function (issue, payload, httpResponse) {
            if (issue) {
                return completionHandler(issue, payload); // Propagate error immediately.
            }

            let parsingError = null;
            try {
                payload = JSON.parse(payload); // Attempt to parse response body as JSON.
            } catch (parseIssue) {
                parsingError = parseIssue; // Capture JSON parsing errors.
            }
            completionHandler(parsingError, httpResponse, payload); // Invoke final handler.
        };
    }

    /**
     * Executes an HTTP GET request against the API.
     *
     * @param {string} resourcePath      The relative path of the resource.
     * @param {object} requestParameters Query parameters for the request.
     * @param {object} authIdentifier    Object containing oauth_token and oauth_token_secret.
     * @param {function} completionHandler Callback function for the response.
     */
    function fetchResource(resourcePath, requestParameters, authIdentifier, completionHandler) {
        authProvider.get(
            endpointRoot + resourcePath + '?' + queryParameters.stringify(requestParameters),
            authIdentifier.oauth_token,
            authIdentifier.oauth_token_secret,
            handleResponse(completionHandler)
        );
    }

    /**
     * Executes an HTTP POST request to the API.
     *
     * @param {string} resourcePath      The relative path of the resource.
     * @param {object} requestParameters Body parameters for the POST request.
     * @param {object} authIdentifier    Object containing oauth_token and oauth_token_secret.
     * @param {function} completionHandler Callback function for the response.
     */
    function submitData(resourcePath, requestParameters, authIdentifier, completionHandler) {
        authProvider.post(
            endpointRoot + resourcePath,
            authIdentifier.oauth_token,
            authIdentifier.oauth_token_secret,
            requestParameters, // Post data payload
            null,              // Content type (let OAuth library determine)
            handleResponse(completionHandler)
        );
    }

    /**
     * Executes an HTTP DELETE request to the API.
     *
     * @param {string} resourcePath      The relative path of the resource to delete.
     * @param {object} requestParameters (Unused in DELETE for this specific API, but kept for signature consistency).
     * @param {object} authIdentifier    Object containing oauth_token and oauth_token_secret.
     * @param {function} completionHandler Callback function for the response.
     */
    function removeResource(resourcePath, requestParameters, authIdentifier, completionHandler) {
        authProvider.delete(
            endpointRoot + resourcePath,
            authIdentifier.oauth_token,
            authIdentifier.oauth_token_secret,
            handleResponse(completionHandler)
        );
    }

    // --- Public API Methods Exposed by the Service Proxy ---

    /**
     * Generic method to make an API call based on the specified HTTP method.
     *
     * @param {string} httpMethod        The HTTP verb (e.g., 'GET', 'POST', 'DELETE').
     * @param {string} resourcePath      The API endpoint path.
     * @param {object} requestParameters Parameters for the API call, must include a 'token' property.
     * @param {function} completionHandler Callback for the API response.
     */
    serviceProxy.makeServiceCall = function (httpMethod, resourcePath, requestParameters, completionHandler) {
        let authIdentifier = requestParameters.token; // Extract authentication token.
        delete requestParameters.token;                // Remove token from general parameters.

        if (httpMethod === 'GET') {
            fetchResource(resourcePath, requestParameters, authIdentifier, completionHandler);
        } else if (httpMethod === 'POST') {
            submitData(resourcePath, requestParameters, authIdentifier, completionHandler);
        } else if (httpMethod === 'DELETE') {
            removeResource(resourcePath, requestParameters, authIdentifier, completionHandler);
        }
    };

    /**
     * Handles the OAuth 1.0a flow to obtain an access token.
     * This method manages both the request token and access token acquisition stages.
     *
     * @param {object} httpRequest       The incoming HTTP request object.
     * @param {object} serverResponse    The outgoing HTTP response object.
     * @param {function} completionHandler Callback to be invoked with the access token or error.
     */
    serviceProxy.retrieveAccessCredential = function (httpRequest, serverResponse, completionHandler) {
        let sessionData; // Stores temporary session information.
        // Attempt to retrieve session data from cookies.
        if (httpRequest.cookies && httpRequest.cookies.health_api_session) {
            try {
                sessionData = dataProcessor.parse(httpRequest.cookies.health_api_session);
            } catch (serializationError) {
                // If deserialization fails, sessionData remains undefined, indicating no valid session.
            }
        }

        // Parse query string parameters from the request URL.
        const queryObject = webAddress.parse(httpRequest.url, true).query;

        // Check for presence of OAuth tokens in query parameters and session.
        const tokenPresent = queryObject && queryObject.oauth_token;
        const secretPresent = sessionData && sessionData.credentialSecret;

        // If both an OAuth token (from redirect) and a secret (from session) are available,
        // it signifies the access token acquisition phase.
        if (tokenPresent && secretPresent) {
            authProvider.getOAuthAccessToken(
                queryObject.oauth_token,
                sessionData.credentialSecret,
                queryObject.oauth_verifier,
                function (issue, accessKey, accessSecret) {
                    if (issue) {
                        return completionHandler(issue, null); // Report error if access token cannot be obtained.
                    }

                    // Successfully obtained access tokens.
                    completionHandler(null, {
                        oauth_token: accessKey,
                        oauth_token_secret: accessSecret
                    });
                }
            );
        } else {
            // Otherwise, we are in the initial request token acquisition phase.
            authProvider.getOAuthRequestToken(
                { oauth_callback: returnAddress },
                function (issue, accessKey, accessSecret) {
                    if (issue) {
                        return completionHandler(issue, null); // Report error if request token cannot be obtained.
                    }

                    // Store the temporary token secret in a cookie for later use.
                    serverResponse.cookie(
                        'health_api_session',
                        dataProcessor.stringify({
                            credentialSecret: accessSecret
                        }),
                        {
                            path: '/',
                            httpOnly: false // Allow client-side access if needed (though generally not recommended for secrets).
                        }
                    );

                    // Redirect the user to the Fitbit authorization page to grant access.
                    serverResponse.redirect('https://www.fitbit.com/oauth/authorize?oauth_token=' + accessKey);
                }
            );
        }
    };

    return serviceProxy; // Return the initialized service proxy object.
};