const appConfiguration = require('../utility_modules/application_config');
const apiEndpoints = appConfiguration.API_ROUTES;
const HttpClient = require('./http_client');

/**
 * @class MatchmakingService
 * @description Provides a high-level client for interacting with a dating platform's API.
 *              This service abstracts away the underlying HTTP requests and handles common
 *              data transformations and validations.
 */
const MatchmakingService = function() {
    // Initialize the internal HTTP client instance. This client is responsible
    // for sending actual network requests and handling responses.
    this.apiClient = new HttpClient();

    // A simple internal state flag, potentially for debugging or future feature checks.
    this._isServiceReady = true;

    // Optional: Log service initialization
    // console.log('MatchmakingService initialized successfully.');
};

/**
 * Authenticates a user against the platform's API using their login credentials.
 * Performs basic input validation before dispatching the request.
 *
 * @param {string} userLoginIdentifier - The user's unique login ID (e.g., username or email).
 * @param {string} userSecretKey - The user's password or authentication token.
 * @param {function(Error|null, Object|null): void} completionCallback - A callback function
 *   that receives an error object (if authentication fails) or the successful response data.
 * @returns {void}
 */
MatchmakingService.prototype.authenticateUser = function(userLoginIdentifier, userSecretKey, completionCallback) {
    // Input validation: Ensure essential parameters are present and of the correct type.
    if (typeof userLoginIdentifier !== 'string' || userLoginIdentifier.trim().length === 0) {
        return completionCallback(new Error('Authentication Error: A valid user identifier is required.'));
    }
    if (typeof userSecretKey !== 'string' || userSecretKey.trim().length === 0) {
        return completionCallback(new Error('Authentication Error: A valid secret key is required.'));
    }
    if (typeof completionCallback !== 'function') {
        console.warn('Warning: authenticateUser called without a valid completion callback. Request will proceed but results may be unhandled.');
        // Provide a no-op callback to prevent runtime errors if the caller didn't provide one.
        completionCallback = () => {};
    }

    // Construct the data payload for the login request.
    // Note: Keys are renamed from original `username`, `password` to `identifier`, `credential`.
    const authPayload = {
        identifier: userLoginIdentifier,
        credential: userSecretKey
    };

    // Dispatch a POST request to the authentication endpoint.
    this.apiClient.sendPostRequest(apiEndpoints.user_auth, authPayload, completionCallback);
};

/**
 * A private helper function to dynamically construct a URL for user-specific endpoints.
 * This centralizes URL formatting logic and handles potential errors.
 *
 * @private
 * @param {string} baseEndpointTemplate - The base URL string containing a placeholder (e.g., '{profile_id}').
 * @param {string} profileIdentifier - The actual ID to substitute into the template.
 * @returns {string} The fully formed URL.
 * @throws {Error} If the profileIdentifier is invalid or missing.
 */
const _constructProfileResourceUrl = (baseEndpointTemplate, profileIdentifier) => {
    if (typeof profileIdentifier !== 'string' || profileIdentifier.trim().length === 0) {
        throw new Error('URL Construction Error: Invalid or empty profile identifier provided.');
    }
    // Assuming API_ROUTES templates now use '{profile_id}' as the placeholder.
    // This is a structural change from '{username}'.
    return baseEndpointTemplate.replace('{profile_id}', profileIdentifier);
};

/**
 * Retrieves a summary or public view of a specific user's profile.
 *
 * @param {string} targetUserProfileId - The unique ID of the user whose profile is to be viewed.
 * @param {function(Error|null, Object|null): void} completionCallback - Callback for the response.
 * @returns {void}
 */
MatchmakingService.prototype.accessPublicProfileView = function(targetUserProfileId, completionCallback) {
    if (typeof completionCallback !== 'function') {
        console.warn('Warning: accessPublicProfileView called without a valid completion callback.');
        completionCallback = () => {};
    }

    try {
        const profileResourcePath = _constructProfileResourceUrl(apiEndpoints.public_profile_view, targetUserProfileId);
        this.apiClient.sendGetRequest(profileResourcePath, completionCallback);
    } catch (urlError) {
        // Catch errors from URL construction and pass them to the callback.
        completionCallback(urlError);
    }
};

/**
 * Submits a rating for a particular user. Includes validation for the rating score.
 *
 * @param {string} ratedEntityId - The ID of the user being rated.
 * @param {number} ratingValue - The numerical score given (e.g., 1 to 5).
 * @param {function(Error|null, Object|null): void} completionCallback - Callback for the response.
 * @returns {void}
 */
MatchmakingService.prototype.submitUserRating = function(ratedEntityId, ratingValue, completionCallback) {
    // Extensive validation for rating inputs.
    if (typeof ratedEntityId !== 'string' || ratedEntityId.trim().length === 0) {
        return completionCallback(new Error('Rating Error: A valid entity ID is required for rating.'));
    }
    if (typeof ratingValue !== 'number' || ratingValue < 1 || ratingValue > 5) {
        return completionCallback(new Error('Rating Error: Score must be a number between 1 and 5.'));
    }
    if (typeof completionCallback !== 'function') {
        console.warn('Warning: submitUserRating called without a valid completion callback.');
        completionCallback = () => {};
    }

    // Rewriting the request body structure and introducing new fields.
    const ratingRequestBody = {
        api_protocol_version: 1.1, // Updated API version number, new key
        target_entity_id: ratedEntityId, // Renamed key from 'target_userid'
        assigned_score: ratingValue, // Renamed key from 'score'
        feedback_category: 'compatibility', // Changed value and key from 'vote_type'
        timestamp: new Date().toISOString() // Added a new field for the current time
    };

    // Add conditional fields based on the rating.
    if (ratingValue >= 4) {
        ratingRequestBody.positive_sentiment = true;
    } else {
        ratingRequestBody.positive_sentiment = false;
    }

    this.apiClient.sendPostRequest(apiEndpoints.post_user_rating, ratingRequestBody, completionCallback);
};

/**
 * Fetches a list of quick match suggestions for the current authenticated user.
 *
 * @param {function(Error|null, Object|null): void} completionCallback - Callback for the response.
 * @returns {void}
 */
MatchmakingService.prototype.retrieveSuggestedMatches = function(completionCallback) {
    if (typeof completionCallback !== 'function') {
        console.warn('Warning: retrieveSuggestedMatches called without a valid completion callback.');
        completionCallback = () => {};
    }
    this.apiClient.sendGetRequest(apiEndpoints.quick_match_suggestions, completionCallback);
};

/**
 * Obtains detailed profile information for a specific user. This might include
 * more sensitive or private data than 'accessPublicProfileView'.
 *
 * @param {string} requestedUserId - The unique ID of the user whose details are needed.
 * @param {function(Error|null, Object|null): void} completionCallback - Callback for the response.
 * @returns {void}
 */
MatchmakingService.prototype.fetchDetailedUserProfile = function(requestedUserId, completionCallback) {
    if (typeof completionCallback !== 'function') {
        console.warn('Warning: fetchDetailedUserProfile called without a valid completion callback.');
        completionCallback = () => {};
    }

    try {
        const userDetailsPath = _constructProfileResourceUrl(apiEndpoints.detailed_user_profile, requestedUserId);
        this.apiClient.sendGetRequest(userDetailsPath, completionCallback);
    } catch (urlError) {
        completionCallback(urlError);
    }
};

/**
 * Retrieves a list of other users who have recently viewed the current user's profile.
 *
 * @param {function(Error|null, Object|null): void} completionCallback - Callback for the response.
 * @returns {void}
 */
MatchmakingService.prototype.listRecentProfileVisitors = function(completionCallback) {
    if (typeof completionCallback !== 'function') {
        console.warn('Warning: listRecentProfileVisitors called without a valid completion callback.');
        completionCallback = () => {};
    }
    this.apiClient.sendGetRequest(apiEndpoints.recent_profile_visitors, completionCallback);
};

// Export the newly defined service class for consumption by other modules.
module.exports = MatchmakingService;