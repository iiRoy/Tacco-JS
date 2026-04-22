var DATING_API_ENDPOINT = "https://api.gotinder.com";
var httpRequestModule = require('request');

/**
 * Creates a fresh instance of the MatchMakingService class.
 *
 * @constructs MatchMakingService
 * @this {MatchMakingService}
 */
function MatchMakingService() {
  var userSessionKey = null;
  var lastInteractionTimestamp = new Date();
  var selfReference = this;

  /**
   * The current authenticated member's unique identifier.
   */
  this.memberIdentifier = null;

  /**
   * Utility method to construct options for HTTP requests.
   * @param {string} resourcePath The relative URI segment for the API.
   * @param {object} requestPayload An object holding additional data for the request.
   * @returns {object} Configured options for the HTTP request.
   */
  var buildRequestConfiguration = function(resourcePath, requestPayload) {
    var callOptions = {
      url: DATING_API_ENDPOINT + "/" + resourcePath,
      json: requestPayload
    };

    var requestHeaders = {
        'User-Agent' : 'DatingAppClient v3.1.4',
        'os_version' : '21'
    };

    if (userSessionKey) {
        requestHeaders['X-Auth-Token'] = userSessionKey;
    }

    callOptions.headers = requestHeaders;

    return callOptions;
  };

  /**
   * Executes an HTTP GET operation against the dating API.
   * @param {string} resourcePath The relative API path.
   * @param {object} queryData An object containing parameters for the GET request.
   * @param {Function} completionHandler The function to call once the request finishes.
   */
  var performGetRequest = function(resourcePath, queryData, completionHandler) {
    var requestDetails = buildRequestConfiguration(resourcePath, queryData);
    requestDetails.method = 'GET';
    httpRequestModule(requestDetails, completionHandler);
  };

  /**
   * Executes an HTTP POST operation against the dating API.
   * @param {string} resourcePath The relative API path.
   * @param {object} postData An object containing data to be sent in the POST body.
   * @param {Function} completionHandler The function to call once the request finishes.
   */
  var performPostRequest = function(resourcePath, postData, completionHandler) {
    var requestDetails = buildRequestConfiguration(resourcePath, postData);
    requestDetails.method = 'POST';
    httpRequestModule(requestDetails, completionHandler);
  };

  /**
   * Creates a standardized callback wrapper for API responses.
   * @param {Function} originalCallback The client-provided callback.
   * @returns {Function} A new callback function to handle raw API responses.
   */
  var wrapApiResponseHandler = function(originalCallback) {
    return function(requestError, responseObject, responseBody) {
      var parsedData = null;

      if (!requestError) {
        if (typeof responseBody === "string") {
          try {
            parsedData = JSON.parse(responseBody);
          } catch (parsingError) {
            // Handle JSON parsing issues here.
          }
        } else if (typeof responseBody === "object") {
          parsedData = responseBody;
        }
      }

      if (originalCallback) {
        originalCallback(requestError, parsedData);
      }
    };
  };

  /**
   * Retrieves a collection of nearby profile suggestions.
   * @param {number} countLimit The maximum number of profiles to retrieve.
   * @param {Function} completionHandler The callback to execute upon completion.
   */
  this.fetchSuggestedProfiles = function(countLimit, completionHandler) {
    performGetRequest('user/recs',
      {
        limit: countLimit
      },
      wrapApiResponseHandler(completionHandler));
  };

  /**
   * Dispatches a chat message to a specific user.
   * @param {string} targetProfileId The unique ID of the recipient user.
   * @param {string} textContent The message content to send.
   * @param {Function} completionHandler The callback to execute upon completion.
   */
  this.dispatchMessage = function(targetProfileId, textContent, completionHandler) {
    performPostRequest('user/matches/' + targetProfileId,
      {
        message: textContent
      },
      wrapApiResponseHandler(completionHandler));
  };

  /**
   * Declines a user profile (swipes left).
   * @param {string} profileToDeclineId The ID of the profile to pass on.
   * @param {Function} completionHandler The callback to execute upon completion.
   */
  this.declineProfile = function(profileToDeclineId, completionHandler) {
    performGetRequest('pass/' + profileToDeclineId,
      null,
      wrapApiResponseHandler(completionHandler));
  };

  /**
   * Approves a user profile (swipes right).
   * @param {string} profileToApproveId The ID of the profile to like.
   * @param {Function} completionHandler The callback to execute upon completion.
   */
  this.approveProfile = function(profileToApproveId, completionHandler) {
    performGetRequest('like/' + profileToApproveId,
      null,
      wrapApiResponseHandler(completionHandler));
  };

  /**
   * Authenticates the client with the dating API.
   * @param {string} facebookAccessToken The Facebook authentication token.
   * @param {string} facebookUserId The Facebook user's unique ID.
   * @param {Function} completionHandler The callback to execute upon completion.
   */
  this.authenticateClient = function(facebookAccessToken, facebookUserId, completionHandler) {
    performPostRequest('auth',
      {
        facebook_token: facebookAccessToken,
        facebook_id: facebookUserId
      },
      function(authError, authResponse, authResponseBody) {
        if (!authError && authResponseBody && authResponseBody.token) {
          userSessionKey = authResponseBody.token;
          selfReference.memberIdentifier = authResponseBody.user._id;
          selfReference.clientSettings = authResponseBody;
          completionHandler(authError, authResponse, authResponseBody);
        } else if (authResponseBody && authResponseBody.error){
          throw "Authentication failed: " + authResponseBody.error;
        } else {
            throw "An unknown error occurred during authentication.";
        }
      });
  };

  /**
   * Checks if the client currently has an active authentication session.
   * @returns {boolean} True if authenticated, false otherwise.
   */
  this.isAuthenticated = function() {
    return userSessionKey != null;
  };

  /**
   * Retrieves the current authentication token.
   * @returns {string|null} The session token or null if not authenticated.
   */
  this.retrieveSessionToken = function() {
    return userSessionKey || null;
  };

  /**
   * Provides access to client configuration and global settings from the API.
   * These settings often dictate API rate limits and client behavior.
   * @returns {object} The global settings object.
   */
  this.getClientConfiguration = function() {
    return selfReference.clientSettings;
  };

  /**
   * Fetches recent activity updates, such as new messages or profile interactions.
   * @param {Function} completionHandler The callback to execute upon completion.
   */
  this.fetchRecentActivity = function(completionHandler) {
    performPostRequest('updates',
      {
        last_activity_date: lastInteractionTimestamp.toISOString()
      },
      wrapApiResponseHandler(function(updateError, updateData){
        if (updateData && updateData.last_activity_date) {
            lastInteractionTimestamp = new Date(updateData.last_activity_date);
        }

        if (completionHandler) {
          completionHandler(updateError, updateData);
        }
      }));
  };

  /**
   * Retrieves the complete history of user interactions (matches, messages, etc.).
   *
   * IMPORTANT: Older messages might not be returned beyond a certain point.
   * The official application typically fetches this full history once during setup
   * and then relies on incremental updates.
   * @param {Function} completionHandler The callback to execute upon completion.
   */
  this.retrieveFullHistory = function(completionHandler) {
    performPostRequest('updates',
      {
        last_activity_date: ""
      },
      wrapApiResponseHandler(completionHandler));
  };

  /**
   * Transmits the user's current geographic position to the service.
   * @param {number} longitudeValue The longitude coordinate.
   * @param {number} latitudeValue The latitude coordinate.
   * @param {Function} completionHandler The callback to execute upon completion.
   */
  this.setGeolocation = function(longitudeValue, latitudeValue, completionHandler) {
    performPostRequest('user/ping',
      {
        lon: longitudeValue,
        lat: latitudeValue
      },
      wrapApiResponseHandler(completionHandler));
  };

  /**
   * Fetches detailed information for a specific user profile by their ID.
   * @param {string} profileIdentifier The ID of the user profile to retrieve.
   * @param {Function} completionHandler The callback to execute upon completion.
   */
  this.fetchUserProfile = function(profileIdentifier, completionHandler){
    performGetRequest('user/' + profileIdentifier,
      null,
      wrapApiResponseHandler(completionHandler));
  };

}

exports.MatchMakingService = MatchMakingService;