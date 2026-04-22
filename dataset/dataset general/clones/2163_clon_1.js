/*
*
* Fitbit-js Library - Core Module
*
* This module provides an interface for interacting with the Fitbit API.
* It handles OAuth authentication and API requests.
*
*/


    var url            = require('url')           ; // Node.js URL parsing utility
    var OAuth          = require('oauth').OAuth   ; // OAuth 1.0a client library
    var querystring    = require('querystring')   ; // Node.js querystring utility
    var Serializer     = require('serializer')    ; // Data serialization for cookies



    // Base URI for the Fitbit API endpoints.
    var baseURI        = 'https://api.fitbit.com/1' ;



    // Exported function to initialize the Fitbit client.
    // It takes API credentials and a callback URI as arguments.
    module.exports     = function (api_key, api_secret, callbackURI, unit_system) {

        // Initialize the client object with its version.
        var client     = {
            version    : '0.3.1'                   // Current version of the client library.
        }                                          ;


        // Create a secure serializer instance using the provided API key and secret.
        var serializer = Serializer.createSecureSerializer(api_key, api_secret) ;


        // Define default HTTP headers for API requests.
        var headers    = {
            Accept     : '*/*'                     , // Accept all content types.
            Connection : 'close'                   , // Close the connection after the request.
            'User-Agent': 'fitbit-js ' + client.version // Custom User-Agent string.
        }                                          ;


        // If a unit system is specified, add it to the headers for localized responses.
        if (typeof unit_system !== 'undefined' && unit_system !== null) {
            headers['Accept-Language'] = unit_system ; // e.g., "en_US", "fr_FR", "es_ES"
        }



        // Initialize the OAuth object with Fitbit's request/access token URLs and client credentials.
        var oAuth      = new OAuth(
            'https://api.fitbit.com/oauth/request_token'  , // Request token URL
            'https://api.fitbit.com/oauth/access_token'   , // Access token URL
            api_key                                       , // Consumer key
            api_secret                                    , // Consumer secret
            '1.0'                                         , // OAuth version
            callbackURI                                   , // Callback URL for authorization flow
            'HMAC-SHA1'                                   , // Signature method
            null                                          , // Nonce size (default)
            headers                                         // Custom headers
        )                                                 ;


        /**
         * Wraps a user-provided callback function to handle API response parsing and error propagation.
         * @param {Function} callback - The original callback function provided by the user.
         * @returns {Function} A new callback function that processes the API response.
         */
        function requestCallback(callback) {
            return function (err, data, response) {
                if (err) {
                    return callback(err, data) ; // Propagate OAuth errors directly.
                }

                var exception = null ; // Initialize exception handler.

                try {
                    data = JSON.parse(data) ; // Attempt to parse the response data as JSON.
                } catch (e) {
                    exception = e ; // Catch any JSON parsing errors.
                }

                // Call the original callback with the processed data or any exceptions.
                callback(exception, response, data) ;
            }                                   ;
        }


        /**
         * Performs an OAuth GET request to the Fitbit API.
         * @param {string} path - The API endpoint path (e.g., '/user/-/profile.json').
         * @param {object} params - Query parameters for the request.
         * @param {object} token - Object containing oauth_token and oauth_token_secret.
         * @param {Function} callback - Callback function to handle the response.
         */
        function get(path, params, token, callback) {
            oAuth.get(
                baseURI + path + '?' + querystring.stringify(params) , // Full URL with query string
                token.oauth_token                                    , // User's OAuth token
                token.oauth_token_secret                             , // User's OAuth token secret
                requestCallback(callback)                              // Wrapped callback
            )                                                        ;
        }


        /**
         * Performs an OAuth POST request to the Fitbit API.
         * @param {string} path - The API endpoint path.
         * @param {object} params - Body parameters for the POST request.
         * @param {object} token - Object containing oauth_token and oauth_token_secret.
         * @param {Function} callback - Callback function to handle the response.
         */
        function post(path, params, token, callback) {
            oAuth.post(
                baseURI + path                         , // Full URL
                token.oauth_token                      , // User's OAuth token
                token.oauth_token_secret               , // User's OAuth token secret
                params                                 , // POST data
                null                                   , // Content-Type (null for default form-urlencoded)
                requestCallback(callback)                // Wrapped callback
            )                                          ;
        }


        /**
         * Performs an OAuth DELETE request to the Fitbit API.
         * @param {string} path - The API endpoint path.
         * @param {object} params - (Not used in delete but kept for consistency, can be null).
         * @param {object} token - Object containing oauth_token and oauth_token_secret.
         * @param {Function} callback - Callback function to handle the response.
         */
        function oAuthDelete(path, params, token, callback){
            oAuth.delete(
                baseURI + path                         , // Full URL
                token.oauth_token                      , // User's OAuth token
                token.oauth_token_secret               , // User's OAuth token secret
                requestCallback(callback)                // Wrapped callback
            )                                          ;
        }


        // --- PUBLIC API METHODS ---

        /**
         * Generic API call method for GET, POST, and DELETE requests.
         * @param {string} method - HTTP method ('GET', 'POST', 'DELETE').
         * @param {string} path - API endpoint path.
         * @param {object} params - Request parameters, must contain 'token' property.
         * @param {Function} callback - Callback function.
         */
        client.apiCall = function (method, path, params, callback) {
            var token  = params.token ; // Extract the OAuth token from parameters.
            delete params.token       ; // Remove token from params before sending to API.

            if (method === 'GET') {
                get(path, params, token, callback) ; // Execute GET request.
            }
            else if (method === 'POST') {
                post(path, params, token, callback) ; // Execute POST request.
            }
            else if (method === 'DELETE') {
                oAuthDelete(path, params, token, callback) ; // Execute DELETE request.
            }
        }                                                  ;


        /**
         * Handles the OAuth 1.0a authorization flow to obtain an access token.
         * This method manages both request token and access token steps.
         * @param {object} req - Express request object.
         * @param {object} res - Express response object.
         * @param {Function} callback - Callback function to return the access token or an error.
         */
        client.getAccessToken = function (req, res, callback) {
            var sess                                    ; // Variable to hold session data.

            // Attempt to retrieve and parse session data from cookies.
            if (req.cookies && req.cookies.fitbit_client) {
                try {
                    sess = serializer.parse(req.cookies.fitbit_client) ;
                } catch(E) { /* Silently ignore parsing errors; session will remain undefined. */ }
            }

            // Parse URL query parameters.
            var qs         = url.parse(req.url, true).query ;

            // Check if OAuth tokens are present in the query string and session.
            var has_token  = qs && qs.oauth_token           ,
                has_secret = sess && sess.token_secret      ;

            if (has_token && has_secret) { // This block handles the Access Token acquisition step.
                oAuth.getOAuthAccessToken(
                    qs.oauth_token                               , // OAuth token from query string
                    sess.token_secret                            , // Token secret from session
                    qs.oauth_verifier                            , // OAuth verifier from query string
                    function (error, oauth_token, oauth_token_secret) {
                        if (error) {
                            return callback(error, null) ; // Handle error during access token retrieval.
                        }

                        // Return the successfully obtained access token and secret.
                        callback(null, {
                            oauth_token        : oauth_token        ,
                            oauth_token_secret : oauth_token_secret
                        })                                          ;
                    }
                )                                                   ;
            } else { // This block handles the Request Token acquisition and redirection step.
                oAuth.getOAuthRequestToken(
                    { oauth_callback : callbackURI }                , // Callback URI for Fitbit authorization page
                    function (error, oauth_token, oauth_token_secret) {
                        if (error) {
                            return callback(error, null) ; // Handle error during request token retrieval.
                        }

                        // Stash the oauth_token_secret in a cookie for later use.
                        res.cookie(
                            'fitbit_client'                       ,
                            serializer.stringify({
                                token_secret : oauth_token_secret
                            })                                    ,
                            {
                                path     : '/'                    , // Cookie path
                                httpOnly : false                    // Allow client-side access (if needed)
                            }
                        )                                         ;

                        // Redirect the user to Fitbit's authorization page.
                        res.redirect(
                            'https://www.fitbit.com/oauth/authorize?oauth_token=' +
                            oauth_token
                        )                                         ;
                    }
                )                                                   ;
            }
        }                                                           ;

        return client ; // Return the initialized client object.
    }                 ;