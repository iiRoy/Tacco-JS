// Base URL for the matchmaking service API endpoints.
const MATCH_API_BASE_URL = "https://api.gotinder.com";

// External dependency for making HTTP requests.
const httpRequestModule = require('request');

// Default headers to be sent with every API request.
const BASE_REQUEST_HEADERS = Object.freeze({
    'User-Agent': 'Tinder/10.23.0 (Android 11; Google Pixel 4)',
    'os_version': '30',
    'app-version': '10.23.0',
    'Accept-Language': 'en-US' // Added accept language
});

/**
 * Utility function to safely parse JSON responses, handling common cases.
 * @private
 * @param {string|object} incomingBody - The raw response body from the HTTP request.
 * @returns {object|null} Parsed JSON object or null if parsing fails or input is invalid.
 */
function safelyParseJson(incomingBody) {
    if (typeof incomingBody === "object" && incomingBody !== null) {
        return incomingBody; // Already an object, no parsing needed.
    }
    if (typeof incomingBody === "string" && incomingBody.trim().length > 0) {
        try {
            return JSON.parse(incomingBody);
        } catch (parsingError) {
            // Log a warning for failed parsing but don't throw, return null instead.
            console.warn("JSON parsing failed:", parsingError.message, "Snippet:", incomingBody.substring(0, 150));
            return null;
        }
    }
    return null; // Invalid or empty input.
}

/**
 * Creates a new instance of the MatchmakingService for interacting with the API.
 * This service facilitates actions like fetching profiles, sending messages, and user authentication.
 *
 * @constructor
 * @class
 * @augments EventEmitter (conceptual, not implemented)
 */
function MatchmakingService() {
    let sessionAuthKey = null; // Holds the authentication token received upon successful login.
    let lastSyncTimestamp = new Date(0); // Tracks the timestamp of the last activity update for incremental fetches.
    let currentProfileId = null; // The unique identifier for the currently authenticated user.
    let serviceConfiguration = {}; // Stores global settings and user data returned during authorization.

    // A self-reference for use in closures and nested functions, to ensure 'this' context is preserved.
    const selfInstance = this;

    /**
     * Constructs the common HTTP request options object for API calls.
     * @private
     * @param {string} endpointPath - The relative URI path for the API endpoint (e.g., 'user/recs').
     * @param {object|null} requestPayload - Optional data payload for the request body.
     * @returns {object} A comprehensive object containing URL, headers, and body for the `request` module.
     */
    const buildRequestConfig = (endpointPath, requestPayload) => {
        const fullApiUrl = `${MATCH_API_BASE_URL}/${endpointPath}`;
        const requestHeaders = { ...BASE_REQUEST_HEADERS }; // Start with base headers

        if (sessionAuthKey) {
            requestHeaders['X-Auth-Token'] = sessionAuthKey;
        }

        const requestOptions = {
            url: fullApiUrl,
            headers: requestHeaders,
            json: true // `request` module will attempt to parse response as JSON automatically.
        };

        // Attach payload for methods that require a body (POST, PUT).
        if (requestPayload && Object.keys(requestPayload).length > 0) {
            requestOptions.body = requestPayload;
        }

        return requestOptions;
    };

    /**
     * Executes a GET request to a specified API endpoint.
     * @private
     * @param {string} endpointPath - The relative API path.
     * @param {object|null} queryParameters - Optional query string parameters or data for the GET request.
     * @param {Function} responseCallback - The callback function to be invoked upon request completion: `(error, httpResponse, body)`.
     */
    const performGetRequest = (endpointPath, queryParameters, responseCallback) => {
        const requestConfig = buildRequestConfig(endpointPath, queryParameters);
        requestConfig.method = 'GET';
        httpRequestModule(requestConfig, responseCallback);
    };

    /**
     * Executes a POST request to a specified API endpoint.
     * @private
     * @param {string} endpointPath - The relative API path.
     * @param {object} payloadBody - The data payload for the POST request body.
     * @param {Function} responseCallback - The callback function to be invoked upon request completion: `(error, httpResponse, body)`.
     */
    const performPostRequest = (endpointPath, payloadBody, responseCallback) => {
        const requestConfig = buildRequestConfig(endpointPath, payloadBody);
        requestConfig.method = 'POST';
        httpRequestModule(requestConfig, responseCallback);
    };

    /**
     * Standardizes the raw HTTP response from the `request` module into a simpler API callback format.
     * It handles JSON parsing and error propagation.
     * @private
     * @param {Function} userProvidedCallback - The original callback function supplied by the user: `(apiError, apiData)`.
     * @returns {Function} A new callback function that processes HTTP responses before calling `userProvidedCallback`.
     */
    const normalizeApiResponse = (userProvidedCallback) => {
        return (requestError, apiResponse, rawResponseBody) => {
            let processedApiData = null;
            let finalError = requestError;

            if (!finalError) {
                // `request` with `json: true` usually parses it, but we add a safety net.
                processedApiData = safelyParseJson(rawResponseBody);

                // If parsing failed but a body was present, consider it an error.
                if (!processedApiData && rawResponseBody) {
                    finalError = new Error("API response was unparseable or empty.");
                    console.error("Response processing issue:", finalError.message, rawResponseBody);
                } else if (apiResponse && apiResponse.statusCode >= 400) {
                    // Check for HTTP errors not caught by `request` module's `error` param
                    finalError = new Error(`API Error ${apiResponse.statusCode}: ${processedApiData && processedApiData.error ? processedApiData.error : 'Unknown API issue.'}`);
                }
            }

            // Always call the user's callback if it's a function.
            if (typeof userProvidedCallback === 'function') {
                userProvidedCallback(finalError, processedApiData);
            } else if (finalError) {
                // If no callback is provided, at least log any unhandled errors.
                console.error("Unhandled API operation error:", finalError);
            }
        };
    };

    /**
     * Retrieves a list of suggested user profiles for the current user.
     * @public
     * @param {number} [profileCount=10] - The maximum number of profiles to fetch. Must be between 1 and 20.
     * @param {Function} completionCallback - The callback function: `(err, profilesList)`.
     */
    this.fetchSuggestedProfiles = (profileCount = 10, completionCallback) => {
        if (typeof completionCallback !== 'function') {
            console.error("A valid callback function is essential for 'fetchSuggestedProfiles'.");
            return; // Guard clause: exit if no callback.
        }
        if (!selfInstance.isSessionActive()) {
            return completionCallback(new Error("Authentication required to fetch profiles."));
        }

        // Enforce a reasonable range for the profile count.
        const actualLimit = Math.max(1, Math.min(20, profileCount));

        performGetRequest('user/recs',
            {
                limit: actualLimit,
                locale: 'en-US' // Added locale to specific request
            },
            normalizeApiResponse(completionCallback));
    };

    /**
     * Sends a direct message to a specified user.
     * @public
     * @param {string} targetProfileId - The unique ID of the recipient user's profile.
     * @param {string} messageContent - The text content of the message.
     * @param {Function} completionCallback - The callback function: `(err, messageSendStatus)`.
     */
    this.sendDirectMessage = (targetProfileId, messageContent, completionCallback) => {
        if (typeof completionCallback !== 'function') {
            console.error("A valid callback function is essential for 'sendDirectMessage'.");
            return;
        }
        if (!targetProfileId || !messageContent || messageContent.trim().length === 0) {
            return completionCallback(new Error("Recipient ID and non-empty message content are mandatory."));
        }
        if (!selfInstance.isSessionActive()) {
            return completionCallback(new Error("Authentication required to send messages."));
        }

        performPostRequest(`user/matches/${targetProfileId}`,
            {
                message: messageContent
            },
            normalizeApiResponse(completionCallback));
    };

    /**
     * Initiates a 'decline' action (left swipe) for a given user profile.
     * @public
     * @param {string} profileToDeclineId - The ID of the user profile to decline.
     * @param {Function} completionCallback - The callback function: `(err, declineConfirmation)`.
     */
    this.declineProfile = (profileToDeclineId, completionCallback) => {
        if (typeof completionCallback !== 'function') {
            console.error("A valid callback function is essential for 'declineProfile'.");
            return;
        }
        if (!profileToDeclineId) {
            return completionCallback(new Error("A profile ID is required to decline."));
        }
        if (!selfInstance.isSessionActive()) {
            return completionCallback(new Error("Authentication required to decline profiles."));
        }

        performGetRequest(`pass/${profileToDeclineId}`,
            null, // No specific payload for a simple GET action
            normalizeApiResponse(completionCallback));
    };

    /**
     * Initiates an 'express interest' action (right swipe) for a given user profile.
     * @public
     * @param {string} profileToLikeId - The ID of the user profile to like.
     * @param {Function} completionCallback - The callback function: `(err, likeConfirmation)`.
     */
    this.expressInterest = (profileToLikeId, completionCallback) => {
        if (typeof completionCallback !== 'function') {
            console.error("A valid callback function is essential for 'expressInterest'.");
            return;
        }
        if (!profileToLikeId) {
            return completionCallback(new Error("A profile ID is required to express interest."));
        }
        if (!selfInstance.isSessionActive()) {
            return completionCallback(new Error("Authentication required to express interest."));
        }

        performGetRequest(`like/${profileToLikeId}`,
            null, // No specific payload for a simple GET action
            normalizeApiResponse(completionCallback));
    };

    /**
     * Authenticates the user with the matchmaking service using their Facebook credentials.
     * Upon successful authentication, an `X-Auth-Token` is stored for subsequent API calls.
     * @public
     * @param {string} facebookAccessToken - The Facebook access token obtained from the user.
     * @param {string} facebookIdentifier - The user's Facebook ID.
     * @param {Function} completionCallback - The callback function: `(err, authResultData)`.
     */
    this.authenticateUser = (facebookAccessToken, facebookIdentifier, completionCallback) => {
        if (typeof completionCallback !== 'function') {
            console.error("A valid callback function is essential for 'authenticateUser'.");
            return;
        }
        if (!facebookAccessToken || !facebookIdentifier) {
            return completionCallback(new Error("Both Facebook access token and user ID are required for authentication."));
        }

        performPostRequest('auth',
            {
                facebook_token: facebookAccessToken,
                facebook_id: facebookIdentifier,
                locale: 'en-US', // Explicitly setting locale for authentication
                platform: 'android' // Added platform identifier
            },
            (requestError, apiResponse, rawResponseBody) => {
                const authResponse = safelyParseJson(rawResponseBody);

                if (requestError || !authResponse || !authResponse.token) {
                    const errorMessage = authResponse && authResponse.error ?
                        `Authentication failed: ${authResponse.error}` :
                        `Authentication request failed: ${requestError ? requestError.message : 'Unknown error'}`;
                    return completionCallback(new Error(errorMessage), null);
                }

                sessionAuthKey = authResponse.token;
                currentProfileId = authResponse.user._id;
                serviceConfiguration = authResponse; // Store the full auth response as configuration
                completionCallback(null, authResponse); // Indicate success.
            });
    };

    /**
     * Determines if the client currently holds an active authentication session token.
     * @public
     * @returns {boolean} `true` if an auth token is present, `false` otherwise.
     */
    this.isSessionActive = () => {
        return !!sessionAuthKey;
    };

    /**
     * Retrieves the stored authentication key for the current session.
     * @public
     * @returns {string|null} The X-Auth-Token string or `null` if not authenticated.
     */
    this.retrieveAuthKey = () => {
        return sessionAuthKey;
    };

    /**
     * Provides access to the client's global service configuration and defaults,
     * typically obtained during the authentication process.
     * @public
     * @returns {object} A shallow copy of the stored service configuration.
     */
    this.getServiceDefaults = () => {
        return { ...serviceConfiguration }; // Return a copy to prevent external modification.
    };

    /**
     * Fetches recent updates and activities for the authenticated user, such as new messages or matches.
     * The `lastSyncTimestamp` is updated upon successful retrieval.
     * @public
     * @param {Function} completionCallback - The callback function: `(err, updatesData)`.
     */
    this.retrieveRecentActivity = (completionCallback) => {
        if (typeof completionCallback !== 'function') {
            console.error("A valid callback function is essential for 'retrieveRecentActivity'.");
            return;
        }
        if (!selfInstance.isSessionActive()) {
            return completionCallback(new Error("Authentication required to retrieve recent activity."));
        }

        performPostRequest('updates',
            {
                last_activity_date: lastSyncTimestamp.toISOString()
            },
            normalizeApiResponse((err, data) => {
                if (!err && data && data.last_activity_date) {
                    // Update the timestamp for subsequent incremental updates.
                    lastSyncTimestamp = new Date(data.last_activity_date);
                }
                completionCallback(err, data);
            }));
    };

    /**
     * Retrieves the entire interaction history for the user, including all matches and messages.
     * Note: The API might have limitations on how far back in history it provides data.
     * @public
     * @param {Function} completionCallback - The callback function: `(err, historyData)`.
     */
    this.getAllInteractionHistory = (completionCallback) => {
        if (typeof completionCallback !== 'function') {
            console.error("A valid callback function is essential for 'getAllInteractionHistory'.");
            return;
        }
        if (!selfInstance.isSessionActive()) {
            return completionCallback(new Error("Authentication required to retrieve full history."));
        }

        // Sending an epoch date to request the earliest possible activity history.
        const earliestPossibleDate = new Date(0).toISOString();
        performPostRequest('updates',
            {
                last_activity_date: earliestPossibleDate
            },
            normalizeApiResponse(completionCallback));
    };

    /**
     * Updates the authenticated user's geographical coordinates.
     * This affects location-based recommendations.
     * @public
     * @param {number} longitudeCoordinate - The new longitude (e.g., -74.006).
     * @param {number} latitudeCoordinate - The new latitude (e.g., 40.7128).
     * @param {Function} completionCallback - The callback function: `(err, locationUpdateStatus)`.
     */
    this.updateUserLocation = (longitudeCoordinate, latitudeCoordinate, completionCallback) => {
        if (typeof completionCallback !== 'function') {
            console.error("A valid callback function is essential for 'updateUserLocation'.");
            return;
        }
        if (typeof longitudeCoordinate !== 'number' || typeof latitudeCoordinate !== 'number' || !Number.isFinite(longitudeCoordinate) || !Number.isFinite(latitudeCoordinate)) {
            return completionCallback(new Error("Valid numeric longitude and latitude are required."));
        }
        // Basic validation for coordinate ranges.
        if (longitudeCoordinate < -180 || longitudeCoordinate > 180 || latitudeCoordinate < -90 || latitudeCoordinate > 90) {
            return completionCallback(new Error("Invalid longitude or latitude range provided."));
        }
        if (!selfInstance.isSessionActive()) {
            return completionCallback(new Error("Authentication required to update location."));
        }

        performPostRequest('user/ping',
            {
                lon: longitudeCoordinate,
                lat: latitudeCoordinate
            },
            normalizeApiResponse(completionCallback));
    };

    /**
     * Retrieves detailed profile information for a specific user by their ID.
     * @public
     * @param {string} profileIdentifier - The unique ID of the user profile to retrieve.
     * @param {Function} completionCallback - The callback function: `(err, userProfileData)`.
     */
    this.fetchUserProfile = (profileIdentifier, completionCallback) => {
        if (typeof completionCallback !== 'function') {
            console.error("A valid callback function is essential for 'fetchUserProfile'.");
            return;
        }
        if (!profileIdentifier || profileIdentifier.trim().length === 0) {
            return completionCallback(new Error("A non-empty profile identifier is required."));
        }
        if (!selfInstance.isSessionActive()) {
            return completionCallback(new Error("Authentication required to fetch user profiles."));
        }

        performGetRequest(`user/${profileIdentifier}`,
            null, // No additional payload for this GET request
            normalizeApiResponse(completionCallback));
    };
}

// Export the MatchmakingService class for use in other modules.
module.exports.MatchmakingService = MatchmakingService;