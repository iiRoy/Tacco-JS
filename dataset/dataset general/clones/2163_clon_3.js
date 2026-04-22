/*
 * Fitbit-js: A bespoke client for interacting with the Fitbit API.
 * This version incorporates advanced security and session management features.
 */

// Core dependency imports for web operations and authentication.
const webAddressParser = require('url'); // Utility for parsing URLs.
const secureAuth = require('oauth').OAuth; // OAuth 1.0a authentication library.
const queryParamBuilder = require('querystring'); // Module for URL query string parsing and formatting.
const sessionEncoder = require('serializer'); // Custom serializer for secure session data.

// The base uniform resource identifier for the Fitbit API.
const serviceBaseURL = 'https://api.fitbit.com/1';

/**
 * Initializes a new Fitbit API client instance.
 *
 * @param {string} consumerKey - The API key (consumer key) provided by Fitbit.
 * @param {string} consumerSecret - The API secret (consumer secret) provided by Fitbit.
 * @param {string} redirectionURL - The callback URL registered with Fitbit for OAuth redirects.
 * @param {string} [preferredUnits] - Optional: The desired unit system (e.g., 'en_US', 'en_GB').
 * @returns {object} An object representing the Fitbit API client.
 */
module.exports = function initializeFitbitClient(consumerKey, consumerSecret, redirectionURL, preferredUnits) {
    const apiInterface = {}; // Main object to hold public API methods.
    apiInterface.toolVersion = '0.3.1-alpha'; // Internal client version.

    // Create a secure serializer for managing session tokens.
    const sessionDataEncoder = sessionEncoder.createSecureSerializer(consumerKey, consumerSecret);

    // Default HTTP request headers.
    const httpHeaders = {
        'Accept': 'application/json', // Prefer JSON responses.
        'Connection': 'keep-alive', // Keep the connection open for subsequent requests.
        'User-Agent': `custom-fitbit-client/${apiInterface.toolVersion}`, // Custom user agent string.
        'X-Client-Flavor': 'nodejs-type3' // Adding a custom header for identification.
    };

    // Apply unit system preference if provided.
    if (preferredUnits && typeof preferredUnits === 'string') {
        httpHeaders['Accept-Language'] = preferredUnits;
    } else {
        // Default to a common unit system if none specified.
        httpHeaders['Accept-Language'] = 'en_US';
    }

    // Initialize the OAuth 1.0a client.
    const oauthClientInstance = new secureAuth(
        'https://api.fitbit.com/oauth/request_token', // Request token URL.
        'https://api.fitbit.com/oauth/access_token',  // Access token URL.
        consumerKey,                                  // Consumer key.
        consumerSecret,                               // Consumer secret.
        '1.0',                                        // OAuth version.
        redirectionURL,                               // Callback URL.
        'HMAC-SHA1',                                  // Signature method.
        null,                                         // Nounce size (default).
        httpHeaders                                   // Custom headers.
    );

    /**
     * Internal helper function to wrap and process API responses.
     * @param {Function} resultHandler - The original callback function provided by the user.
     * @returns {Function} A new function that handles the raw OAuth response.
     */
    function handleApiResponse(resultHandler) {
        return function (errorObject, rawPayload, httpResponse) {
            if (errorObject) {
                // If an OAuth error occurred, pass it directly.
                console.error(`API response error: ${errorObject.statusCode || 'N/A'} - ${errorObject.data || errorObject.message}`);
                return resultHandler(errorObject, null, null);
            }

            let parsedData = null;
            let parsingError = null;

            // Attempt to parse the raw payload as JSON.
            if (rawPayload && typeof rawPayload === 'string') {
                try {
                    parsedData = JSON.parse(rawPayload);
                } catch (jsonParseErr) {
                    parsingError = new Error(`Failed to parse API response as JSON: ${jsonParseErr.message}`);
                    console.warn(`JSON parsing failed for payload: ${rawPayload.substring(0, 200)}...`); // Log snippet of problematic payload.
                }
            } else {
                // If payload is not a string, it might be already parsed or empty.
                parsedData = rawPayload;
            }

            // Call the original handler with potential parsing error, full response, and parsed data.
            resultHandler(parsingError, httpResponse, parsedData);
        };
    }

    /**
     * Constructs a full API URL including query parameters.
     * @param {string} endpointPath - The specific API endpoint path.
     * @param {object} queryParams - Object containing query parameters.
     * @returns {string} The complete URL.
     */
    const buildFullUrl = (endpointPath, queryParams) => {
        const queryString = queryParamBuilder.stringify(queryParams);
        return `${serviceBaseURL}${endpointPath}${queryString ? `?${queryString}` : ''}`;
    };

    /**
     * Executes an authenticated GET request to the Fitbit API.
     * @param {string} endpointPath - The API endpoint path.
     * @param {object} requestParams - Query parameters for the request.
     * @param {object} authCredentials - Object containing `oauth_token` and `oauth_token_secret`.
     * @param {Function} completionCallback - Callback function to handle the response.
     */
    function performGetRequest(endpointPath, requestParams, authCredentials, completionCallback) {
        const targetUrl = buildFullUrl(endpointPath, requestParams);
        oauthClientInstance.get(
            targetUrl,
            authCredentials.oauth_token,
            authCredentials.oauth_token_secret,
            handleApiResponse(completionCallback)
        );
    }

    /**
     * Executes an authenticated POST request to the Fitbit API.
     * @param {string} endpointPath - The API endpoint path.
     * @param {object} postBodyParams - Parameters for the POST body.
     * @param {object} authCredentials - Object containing `oauth_token` and `oauth_token_secret`.
     * @param {Function} completionCallback - Callback function to handle the response.
     */
    function submitPostRequest(endpointPath, postBodyParams, authCredentials, completionCallback) {
        // Fitbit POST requests often use query string for params or form-urlencoded body.
        // Assuming `postBodyParams` can be directly passed as the body content.
        oauthClientInstance.post(
            `${serviceBaseURL}${endpointPath}`,
            authCredentials.oauth_token,
            authCredentials.oauth_token_secret,
            postBodyParams, // The body content for the POST request.
            'application/x-www-form-urlencoded', // Explicit content type for POST.
            handleApiResponse(completionCallback)
        );
    }

    /**
     * Executes an authenticated DELETE request to the Fitbit API.
     * @param {string} endpointPath - The API endpoint path.
     * @param {object} authCredentials - Object containing `oauth_token` and `oauth_token_secret`.
     * @param {Function} completionCallback - Callback function to handle the response.
     */
    function executeDeleteRequest(endpointPath, authCredentials, completionCallback) {
        oauthClientInstance.delete(
            `${serviceBaseURL}${endpointPath}`,
            authCredentials.oauth_token,
            authCredentials.oauth_token_secret,
            handleApiResponse(completionCallback)
        );
    }

    // PUBLIC API METHODS

    /**
     * General purpose method for making authenticated API calls.
     * @param {string} httpMethod - The HTTP method ('GET', 'POST', 'DELETE').
     * @param {string} endpointPath - The API endpoint path (e.g., '/user/-/activities/date/2023-01-01.json').
     * @param {object} requestParameters - An object containing parameters for the request, including `token`.
     * @param {Function} resultHandler - Callback function (error, httpResponse, data).
     */
    apiInterface.makeAuthenticatedCall = function (httpMethod, endpointPath, requestParameters, resultHandler) {
        if (!requestParameters || typeof requestParameters.token === 'undefined') {
            return resultHandler(new Error('Authentication token is missing from request parameters.'), null, null);
        }

        // Extract and clone the token to avoid modifying the original requestParameters object.
        const accessCredentials = { ...requestParameters.token };
        const cleanParameters = { ...requestParameters }; // Create a shallow copy.
        delete cleanParameters.token; // Remove the token from parameters passed to get/post/delete.

        switch (httpMethod.toUpperCase()) {
            case 'GET':
                performGetRequest(endpointPath, cleanParameters, accessCredentials, resultHandler);
                break;
            case 'POST':
                submitPostRequest(endpointPath, cleanParameters, accessCredentials, resultHandler);
                break;
            case 'DELETE':
                executeDeleteRequest(endpointPath, accessCredentials, resultHandler);
                break;
            default:
                resultHandler(new Error(`Unsupported HTTP method: ${httpMethod}`), null, null);
                break;
        }
    };

    /**
     * Handles the OAuth 1.0a flow to obtain an access token.
     * This function manages both requesting a temporary token and exchanging it for a permanent access token.
     *
     * @param {object} httpRequest - The incoming HTTP request object (e.g., from Express).
     * @param {object} httpResponse - The outgoing HTTP response object (e.g., from Express).
     * @param {Function} authCompletion - Callback function (error, accessTokenObject).
     */
    apiInterface.obtainAuthToken = function (httpRequest, httpResponse, authCompletion) {
        if (!httpRequest || !httpResponse) {
            return authCompletion(new Error('Invalid HTTP request or response objects provided.'), null);
        }

        let storedSession = null;
        if (httpRequest.cookies && httpRequest.cookies.fitbit_client_session) {
            try {
                storedSession = sessionDataEncoder.parse(httpRequest.cookies.fitbit_client_session);
            } catch (parsingError) {
                console.error(`Error parsing session cookie: ${parsingError.message}`);
                // Clear the corrupted cookie to prevent future errors.
                httpResponse.clearCookie('fitbit_client_session', { path: '/' });
            }
        }

        const requestQuery = webAddressParser.parse(httpRequest.url, true).query;

        // Check if we have the necessary components for an access token exchange.
        const hasOAuthToken = !!requestQuery?.oauth_token;
        const hasSessionSecret = !!storedSession?.token_secret;
        const hasVerifier = !!requestQuery?.oauth_verifier;

        if (hasOAuthToken && hasSessionSecret && hasVerifier) { // Phase 2: Exchange request token for access token
            oauthClientInstance.getOAuthAccessToken(
                requestQuery.oauth_token,
                storedSession.token_secret,
                requestQuery.oauth_verifier,
                function (exchangeError, finalOAuthToken, finalOAuthTokenSecret, results) {
                    if (exchangeError) {
                        console.error(`OAuth Access Token Exchange Error: ${exchangeError.data || exchangeError.message}`);
                        return authCompletion(exchangeError, null);
                    }

                    // Clear the temporary session cookie after successful exchange.
                    httpResponse.clearCookie('fitbit_client_session', { path: '/' });

                    authCompletion(null, {
                        oauth_token: finalOAuthToken,
                        oauth_token_secret: finalOAuthTokenSecret,
                        raw_results: results // Include raw results for debugging or extended info.
                    });
                }
            );
        } else { // Phase 1: Request a new temporary OAuth token
            // Ensure redirectionURL is correctly formatted for the callback parameter.
            const oauthCallbackOptions = { oauth_callback: redirectionURL };

            oauthClientInstance.getOAuthRequestToken(
                oauthCallbackOptions,
                function (requestTokenError, tempOAuthToken, tempOAuthTokenSecret) {
                    if (requestTokenError) {
                        console.error(`OAuth Request Token Error: ${requestTokenError.data || requestTokenError.message}`);
                        return authCompletion(requestTokenError, null);
                    }

                    // Securely store the temporary token secret in a cookie.
                    httpResponse.cookie(
                        'fitbit_client_session',
                        sessionDataEncoder.stringify({
                            token_secret: tempOAuthTokenSecret,
                            timestamp: Date.now() // Add a timestamp for potential session expiration.
                        }),
                        {
                            path: '/',          // Cookie valid for the entire domain.
                            httpOnly: false,    // Accessible via client-side JavaScript (if needed for debugging, generally true for security).
                            secure: httpRequest.protocol === 'https', // Only send over HTTPS if current request is secure.
                            maxAge: 5 * 60 * 1000 // Cookie expires in 5 minutes.
                        }
                    );

                    // Redirect the user to Fitbit's authorization page.
                    const authorizationUrl = `https://www.fitbit.com/oauth/authorize?oauth_token=${tempOAuthToken}`;
                    httpResponse.redirect(authorizationUrl);
                    // Explicitly call the completion handler to signify redirection, even without an access token yet.
                    authCompletion(null, { redirect_pending: true, authorization_url: authorizationUrl });
                }
            );
        }
    };

    return apiInterface; // Return the fully configured API client.
};