/*
 * DribbleFetch.js - A utility module designed for interacting with the Dribbble API.
 * This script provides a set of functions to retrieve various data points
 * such as shots, player profiles, comments, and follower information
 * from the Dribbble platform using jQuery's AJAX capabilities.
 *
 * This software is provided under a permissive open-source license.
 * For specific licensing terms, please refer to the project's repository.
 *
 * Generated on: 2023-10-27
 */

;(function($, globalScope, currentDocument) {
    "use strict";

    // Establish a global namespace for our Dribbble API wrapper.
    // This object will hold all the API interaction methods.
    if (typeof globalScope.dribbbleConnector === 'undefined') {
        globalScope.dribbbleConnector = {};
    }
    const DribbbleConnector = globalScope.dribbbleConnector;

    // Configuration constants for the API wrapper.
    const DRIB_API_BASE_ENDPOINT = 'https://api.dribbble.com';
    const MODULE_VERSION_NUMBER = '1.0.0-alpha';
    const RESOURCE_ID_MARKER = '{{RESOURCE_ID}}'; // Placeholder for dynamic IDs in endpoint paths.
    const DEFAULT_HTTP_METHOD = 'GET';
    const RESPONSE_DATA_FORMAT = 'jsonp'; // Dribbble API typically uses JSONP for cross-domain requests.

    // Internal utility for logging messages, helpful for debugging and monitoring.
    const outputLogMessage = (messageText, logLevel = 'info') => {
        if (console && console[logLevel]) {
            console[logLevel](`[DribbbleConnector v${MODULE_VERSION_NUMBER}] ${messageText}`);
        }
    };

    /**
     * Core function to execute a JSONP API request to the Dribbble service.
     * Handles the AJAX call, response validation, and callback invocation.
     * @param {string} specificApiPath The API endpoint path (e.g., '/shots/123').
     * @param {Array} requestPayload An array containing [userCallbackFunction, optionalQueryParameters].
     */
    const initiateApiRequest = function (specificApiPath, requestPayload) {
        // Extract the user-provided callback function.
        const userCompletionCallback = requestPayload[0];
        if (typeof userCompletionCallback !== 'function') {
            outputLogMessage('API call initiated without a valid callback function. Request aborted.', 'error');
            return;
        }

        // Extract any additional query parameters for the request.
        const queryParameters = requestPayload[1] || {}; // Default to an empty object if no data is passed.

        outputLogMessage(`Preparing API request to: ${DRIB_API_BASE_ENDPOINT}${specificApiPath}`, 'debug');

        // Configure and execute the jQuery AJAX call.
        $.ajax({
            type: DEFAULT_HTTP_METHOD,
            url: `${DRIB_API_BASE_ENDPOINT}${specificApiPath}`,
            data: queryParameters,
            dataType: RESPONSE_DATA_FORMAT,
            cache: true, // Enable browser caching for GET requests.
            timeout: 12000, // Set a timeout for the API request (12 seconds).

            success: function (incomingData) {
                // Validate the received data for emptiness or potential issues.
                if (!incomingData || (typeof incomingData === 'object' && Object.keys(incomingData).length === 0)) {
                    outputLogMessage('Received empty or potentially invalid data from Dribbble API.', 'warn');
                    userCompletionCallback({ success: false, info: 'No data or empty data received.' });
                } else {
                    outputLogMessage('Dribbble API request completed successfully.', 'debug');
                    // Attempt to invoke the user's callback, handling potential errors.
                    try {
                        userCompletionCallback(incomingData);
                    } catch (callbackError) {
                        outputLogMessage(`Error encountered during user callback execution: ${callbackError.message}`, 'error');
                        userCompletionCallback({ success: false, info: `Callback error: ${callbackError.message}` });
                    }
                }
            },
            error: function (xhrObject, requestStatus, errorText) {
                // Handle any errors that occur during the AJAX request.
                outputLogMessage(`Dribbble API request failed: Status - ${requestStatus}, Error - ${errorText}`, 'error');
                userCompletionCallback({ success: false, info: `API request failure: ${errorText}`, status: requestStatus, xhr: xhrObject });
            }
        });
    };

    /**
     * Map of Dribbble API endpoints with their respective URL patterns.
     * The `RESOURCE_ID_MARKER` is used as a placeholder for dynamic identifiers.
     */
    const DribbbleApiEndpointMap = {
        'getIndividualShot': `/shots/${RESOURCE_ID_MARKER}/`,
        'getShotRebounds': `/shots/${RESOURCE_ID_MARKER}/rebounds/`,
        'getShotsFromList': `/shots/${RESOURCE_ID_MARKER}/`, // This endpoint can also fetch shots by list slug.
        'getPlayerSpecificShots': `/players/${RESOURCE_ID_MARKER}/shots/`,
        'getPlayerFollowedShots': `/players/${RESOURCE_ID_MARKER}/shots/following/`,
        'retrievePlayerProfile': `/players/${RESOURCE_ID_MARKER}/`,
        'getFollowersOfPlayer': `/players/${RESOURCE_ID_MARKER}/followers/`,
        'getPlayersFollowedBy': `/players/${RESOURCE_ID_MARKER}/following/`,
        'getPlayersDraftedBy': `/players/${RESOURCE_ID_MARKER}/draftees/`,
        'getCommentsForShot': `/shots/${RESOURCE_ID_MARKER}/comments/`,
        'getPlayerLikedShots': `/players/${RESOURCE_ID_MARKER}/shots/likes/`
    };

    /**
     * A factory function to generate specific API calling methods for each endpoint.
     * Each generated method expects the resource identifier as its first argument,
     * followed by the callback function, and then an optional data object for query parameters.
     * @param {string} endpointUrlTemplate The URL pattern for the API endpoint.
     * @returns {Function} A function configured to invoke the specific Dribbble API endpoint.
     */
    const createApiMethodProxy = function (endpointUrlTemplate) {
        return function () {
            // Convert the `arguments` object into a real array for easier manipulation.
            const incomingInvocationArgs = Array.from(arguments);

            // Enforce minimum arguments: a resource ID and a callback function are required.
            if (incomingInvocationArgs.length < 2) {
                outputLogMessage(`Invalid number of arguments for API call. Expected at least an ID and a callback. Received: ${incomingInvocationArgs.length}`, 'error');
                // If a callback is provided as the last argument, invoke it with an error.
                const lastArg = incomingInvocationArgs[incomingInvocationArgs.length - 1];
                if (typeof lastArg === 'function') {
                    lastArg({ success: false, info: 'Insufficient arguments provided for API call.' });
                }
                return;
            }

            // The first argument is always the resource identifier (e.g., shot ID, player ID, list slug).
            const resourceIdentifier = incomingInvocationArgs.shift();

            // Validate the presence of the resource identifier.
            if (resourceIdentifier === null || typeof resourceIdentifier === 'undefined' || resourceIdentifier === '') {
                 outputLogMessage('Resource identifier is missing, null, or empty. Cannot proceed with API call.', 'error');
                 // The first element of `incomingInvocationArgs` is now the user's callback.
                 if (typeof incomingInvocationArgs[0] === 'function') {
                     incomingInvocationArgs[0]({ success: false, info: 'Missing or invalid resource identifier.' });
                 }
                 return;
            }

            // Construct the final API path by replacing the placeholder with the actual identifier.
            const finalizedApiPath = endpointUrlTemplate.replace(RESOURCE_ID_MARKER, resourceIdentifier);

            // Pass the remaining arguments (callback and optional query data) to the core request function.
            initiateApiRequest(finalizedApiPath, incomingInvocationArgs);
        };
    };

    // Dynamically attach each defined API endpoint method to our `dribbbleConnector` object.
    // This makes them accessible via `$.dribbbleConnector.methodName(...)`.
    Object.keys(DribbbleApiEndpointMap).forEach(function (endpointKeyName) {
        DribbbleConnector[endpointKeyName] = createApiMethodProxy(DribbbleApiEndpointMap[endpointKeyName]);
        outputLogMessage(`Successfully registered Dribbble API method: "${endpointKeyName}"`, 'info');
    });

    // Expose the module version number for external reference.
    DribbbleConnector.version = MODULE_VERSION_NUMBER;

})(jQuery, window, document);