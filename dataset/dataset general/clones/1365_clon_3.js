/*
 *  AvianNet.js - A Titanium module for secure avian social network interactions.
 *
 *  This module facilitates authentication and API requests to
 *  social platforms, specifically designed for avian-themed applications.
 *
 *  Copyright 2023 (c) SkyView Innovations
 *
 *  Licensed under the SkyView Public License, Version 1.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.skyview.org/licenses/SPL-1.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 *  Developer: A. Birdwatcher
 *  Release: 1.1 beta
 *  Last Update: October 2023
 */

// Module dependencies management
(function() {
    const platformName = Ti.Platform.osname;
    const commonPath = 'lib/'; // Default library path prefix

    // Dynamically include necessary cryptographic and OAuth libraries based on platform
    if (platformName === 'iphone' || platformName === 'ipad') {
        // iOS requires explicit full paths for included modules.
        Ti.include(commonPath + 'oauth_lib.js'); // OAuth core functionalities
        Ti.include(commonPath + 'hash_util.js'); // SHA-1 hashing utility
    } else {
        // Android and other platforms might search relative to the current directory.
        Ti.include('oauth_lib.js');
        Ti.include('hash_util.js');
    }
})();

// Core AvianNet Class Definition
function AvianNetConnector(applicationParameters) {
    // --- Internal Configuration & State Management ---

    // Persistent storage for application-specific and OAuth tokens
    let internalState = {
        // Client-defined settings
        appKey: "",
        appSecret: "",
        displayLoginPrompt: false, // Flag to control UI toolbar visibility

        // Protocol-specific configurations
        oauthProtocolVersion: "1.0",
        currentOAuthToken: "",
        signatureAlgorithm: "HMAC-SHA1",
        requestTokenValue: "",
        requestTokenSecretValue: "",
        requestVerificationCode: "",
        accessTokenValue: "",
        accessTokenSecretValue: "",
        redirectionCallbackUrl: ""
    };

    // OAuth accessor for signing requests
    let authSecrets = {
        consumerSecret: internalState.appSecret,
        tokenSecret: internalState.accessTokenSecretValue
    };

    let sessionActive = false; // Tracks if a user session is currently authorized

    // Utility for managing persisted session data
    const SessionDataManager = (function() {
        const SESSION_FILE_NAME = 'avian_session.json';

        function getSessionFile() {
            return Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, SESSION_FILE_NAME);
        }

        return {
            // Retrieves authentication tokens from persistent storage
            loadAuthTokens: function() {
                const sessionFile = getSessionFile();
                if (!sessionFile.exists()) {
                    return false; // No session file found
                }

                const fileContents = sessionFile.read();
                if (fileContents === null || fileContents.text === '') {
                    Ti.API.warn("AvianNet: Session file exists but is empty.");
                    return false; // Empty file
                }

                try {
                    const parsedData = JSON.parse(fileContents.text);
                    if (parsedData && parsedData.accessToken && parsedData.accessTokenSecret) {
                        internalState.accessTokenValue = parsedData.accessToken;
                        internalState.accessTokenSecretValue = parsedData.accessTokenSecret;
                        authSecrets.tokenSecret = internalState.accessTokenSecretValue; // Update accessor
                        return true;
                    }
                } catch (e) {
                    Ti.API.error(`AvianNet: Failed to parse session data: ${e.message}`);
                }
                return false;
            },

            // Stores current authentication tokens to persistent storage
            saveAuthTokens: function() {
                if (!internalState.accessTokenValue || !internalState.accessTokenSecretValue) {
                    Ti.API.warn("AvianNet: Attempted to save empty access tokens.");
                    return;
                }

                let sessionFile = getSessionFile();
                if (!sessionFile.exists()) {
                    // Create file if it doesn't exist
                    sessionFile = Ti.Filesystem.createFile(Ti.Filesystem.applicationDataDirectory, SESSION_FILE_NAME);
                }

                const dataToPersist = {
                    accessToken: internalState.accessTokenValue,
                    accessTokenSecret: internalState.accessTokenSecretValue
                };
                sessionFile.write(JSON.stringify(dataToPersist));
                Ti.API.info("AvianNet: Authentication tokens saved successfully.");
            },

            // Clears all persisted authentication data
            clearAuthTokens: function() {
                const sessionFile = getSessionFile();
                if (sessionFile.exists()) {
                    sessionFile.deleteFile();
                    Ti.API.info("AvianNet: Persisted authentication data cleared.");
                }
            }
        };
    })();

    // Initialize configuration with provided parameters
    (function initializeModule() {
        if (applicationParameters) {
            Object.keys(applicationParameters).forEach(key => {
                const mappedKey = {
                    oauth_consumer_key: 'appKey',
                    consumer_secret: 'appSecret',
                    show_login_toolbar: 'displayLoginPrompt',
                    callback_url: 'redirectionCallbackUrl'
                }[key] || key; // Map old keys to new ones

                if (internalState.hasOwnProperty(mappedKey)) {
                    internalState[mappedKey] = applicationParameters[key];
                }
            });
        }
        // Ensure accessor is updated with initial app secret
        authSecrets.consumerSecret = internalState.appSecret;

        // Attempt to load existing session data on startup
        sessionActive = SessionDataManager.loadAuthTokens();
        if (sessionActive) {
            Ti.API.info("AvianNet: Existing session found and loaded.");
        } else {
            Ti.API.info("AvianNet: No existing session found.");
        }
    })();

    /**
     * Constructs an OAuth message object for signing.
     * @param {string} endpointUrl - The target URL for the API call.
     * @param {string} httpMethod - 'GET' or 'POST'.
     * @param {string} requestPayload - Parameters in URL-encoded form (e.g., "key1=val1&key2=val2").
     * @returns {object} An OAuth message object ready for signing.
     */
    function buildOAuthRequest(endpointUrl, httpMethod, requestPayload) {
        const messageBlueprint = {
            action: endpointUrl,
            method: httpMethod.toUpperCase() === 'GET' ? httpMethod.toUpperCase() : 'POST', // Default to POST
            parameters: (requestPayload && requestPayload.length > 0) ? OAuth.decodeForm(requestPayload) : []
        };

        // Append required OAuth parameters
        messageBlueprint.parameters.push(['oauth_consumer_key', internalState.appKey]);
        messageBlueprint.parameters.push(['oauth_signature_method', internalState.signatureAlgorithm]);
        messageBlueprint.parameters.push(['oauth_timestamp', OAuth.timestamp().toFixed(0)]);
        messageBlueprint.parameters.push(['oauth_nonce', OAuth.nonce(42)]); // Arbitrary nonce length
        messageBlueprint.parameters.push(['oauth_version', internalState.oauthProtocolVersion]);

        return messageBlueprint;
    }

    /**
     * Initiates the OAuth 1.0a authorization flow by obtaining a request token.
     * @param {Function} completionCallback - Function to call after token acquisition, receives a boolean indicating success.
     */
    function initiateAuthorizationPhase1(completionCallback) {
        const tokenRequestUrl = 'https://api.twitter.com/oauth/request_token';
        let requestParameters = '';

        if (internalState.redirectionCallbackUrl) {
            requestParameters = `oauth_callback=${encodeURIComponent(internalState.redirectionCallbackUrl)}`;
        }

        // Make the API call to get the request token
        sendSecureRequest(
            tokenRequestUrl,
            'POST',
            requestParameters,
            function(responseContent) {
                if (!responseContent) {
                    Ti.API.error("AvianNet: Failed to get request token. Empty response.");
                    completionCallback(false);
                    return;
                }
                try {
                    const responseMap = OAuth.getParameterMap(responseContent);
                    internalState.requestTokenValue = responseMap.oauth_token;
                    internalState.requestTokenSecretValue = responseMap.oauth_token_secret;

                    if (internalState.requestTokenValue && internalState.requestTokenSecretValue) {
                        Ti.API.info("AvianNet: Request token obtained. Proceeding to verifier step.");
                        displayAuthorizationUI(completionCallback); // Next step: user authorization
                    } else {
                        Ti.API.error("AvianNet: Request token or secret missing from response.");
                        completionCallback(false);
                    }
                } catch (e) {
                    Ti.API.error(`AvianNet: Error parsing request token response: ${e.message}`);
                    completionCallback(false);
                }
            },
            false, // Force re-auth (not applicable here, this is the start)
            true,  // Append ALL parameters to URL
            false  // Do NOT include Authorization header for request_token
        );
    }

    /**
     * Presents a WebView to the user for authorization and captures the verifier code.
     * This function should only be called after a request token has been obtained.
     * @param {Function} completionCallback - Function to call after verifier capture, receives a boolean indicating success.
     */
    function displayAuthorizationUI(completionCallback) {
        if (!internalState.requestTokenValue) {
            Ti.API.error("AvianNet: Cannot display authorization UI without a request token.");
            completionCallback(false);
            return;
        }

        const authPageUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${internalState.requestTokenValue}`;
        const authWindow = Ti.UI.createWindow({
            top: 0,
            modal: true,
            fullscreen: true,
            backgroundColor: '#F0F0F0'
        });

        let webViewTopOffset = 0;
        if (Ti.Platform.osname === 'iphone' && internalState.displayLoginPrompt) {
            webViewTopOffset = 44; // Space for toolbar

            const navBar = Ti.UI.createToolbar({ top: 0, height: 44, barColor: '#333' });
            const navTitle = Ti.UI.createLabel({
                text: 'Authorize Avian App',
                font: { fontSize: 17, fontWeight: 'bold' },
                color: '#FFF',
                textAlign: 'center'
            });
            const flexibleSpace = Titanium.UI.createButton({ systemButton: Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE });
            const cancelButton = Titanium.UI.createButton({
                title: 'Cancel',
                style: Titanium.UI.iPhone.SystemButtonStyle.BORDERED
            });

            navBar.items = [flexibleSpace, navTitle, flexibleSpace, cancelButton];
            authWindow.add(navBar);

            cancelButton.addEventListener('click', function() {
                oauthWebView.stopLoading();
                authWindow.close();
                completionCallback(false); // User cancelled
            });
        }

        const oauthWebView = Ti.UI.createWebView({
            url: authPageUrl,
            scalesPageToFit: true,
            touchEnabled: true,
            top: webViewTopOffset,
            backgroundColor: '#FFF'
        });

        authWindow.add(oauthWebView);
        authWindow.open();

        let isWebViewLoading = false;
        let loadCount = 0; // Tracks number of page loads in the webview
        let processingRedirect = false; // Flag to prevent multiple verifier captures

        // Event listener for webview page loads
        oauthWebView.addEventListener('load', function(loadEvent) {
            loadCount++;
            isWebViewLoading = false; // Page finished loading

            // Check if the URL contains the callback parameters
            const currentUrl = loadEvent.url;
            if (currentUrl.includes(internalState.redirectionCallbackUrl) && currentUrl.includes('oauth_verifier=')) {
                if (processingRedirect) {
                    return; // Already handling this redirect
                }
                processingRedirect = true;

                Ti.API.info(`AvianNet: Redirect detected: ${currentUrl}`);

                // Extract verifier code from the URL
                const urlParts = currentUrl.split('?')[1];
                const params = urlParts ? urlParts.split('&') : [];
                let verifierFound = false;

                for (let i = 0; i < params.length; i++) {
                    const pair = params[i].split('=');
                    if (pair[0] === 'oauth_verifier') {
                        internalState.requestVerificationCode = pair[1];
                        verifierFound = true;
                        break;
                    }
                }

                if (verifierFound && internalState.requestVerificationCode) {
                    Ti.API.info("AvianNet: OAuth verifier captured.");
                    oauthWebView.stopLoading();
                    authWindow.close();
                    exchangeRequestForAccessToken(completionCallback); // Proceed to next phase
                } else {
                    Ti.API.error("AvianNet: OAuth verifier not found in callback URL.");
                    authWindow.close();
                    completionCallback(false);
                }
            } else if (loadCount > 1 && currentUrl === authPageUrl) {
                // If it's not the first load (the initial auth page) and it's still the auth page,
                // it means the user might have denied access or an error occurred.
                // We give it a short delay to see if a redirect happens.
                setTimeout(() => {
                    if (!isWebViewLoading && !processingRedirect && currentUrl === oauthWebView.url) {
                        Ti.API.warn("AvianNet: Authorization page reloaded without verifier. Assuming denial or error.");
                        oauthWebView.stopLoading();
                        authWindow.close();
                        completionCallback(false);
                    }
                }, 1500); // Wait a bit before concluding
            }
        });

        oauthWebView.addEventListener('beforeload', function() {
            isWebViewLoading = true;
        });

        // Handle window closure for unexpected cases
        authWindow.addEventListener('close', () => {
            if (!processingRedirect && !sessionActive) { // If not already processed and session not active
                Ti.API.warn("AvianNet: Authorization window closed unexpectedly or before completion.");
                completionCallback(false);
            }
        });
    }

    /**
     * Exchanges the request token and verifier for a user's access token.
     * This is the final step in the OAuth 1.0a authorization flow.
     * @param {Function} completionCallback - Function to call after access token acquisition, receives a boolean indicating success.
     */
    function exchangeRequestForAccessToken(completionCallback) {
        const accessTokenEndpoint = 'https://api.twitter.com/oauth/access_token';
        const tokenExchangePayload = `oauth_token=${internalState.requestTokenValue}&oauth_verifier=${internalState.requestVerificationCode}`;

        sendSecureRequest(
            accessTokenEndpoint,
            'POST',
            tokenExchangePayload,
            function(responseContent) {
                if (!responseContent) {
                    Ti.API.error("AvianNet: Failed to get access token. Empty response.");
                    completionCallback(false);
                    return;
                }
                try {
                    const responseMap = OAuth.getParameterMap(responseContent);
                    internalState.accessTokenValue = responseMap.oauth_token;
                    internalState.accessTokenSecretValue = responseMap.oauth_token_secret;
                    // Update accessor for subsequent API calls
                    authSecrets.tokenSecret = internalState.accessTokenSecretValue;

                    if (internalState.accessTokenValue && internalState.accessTokenSecretValue) {
                        Ti.API.info("AvianNet: Access token obtained. User is now authorized.");
                        SessionDataManager.saveAuthTokens();
                        sessionActive = true; // Mark session as active
                        completionCallback(true);
                    } else {
                        Ti.API.error("AvianNet: Access token or secret missing from response.");
                        completionCallback(false);
                    }
                } catch (e) {
                    Ti.API.error(`AvianNet: Error parsing access token response: ${e.message}`);
                    completionCallback(false);
                }
            },
            false, // Not forcing re-auth here, this is part of the auth flow
            true,  // Append ALL parameters to URL
            false  // Do NOT include Authorization header for access_token
        );
    }

    /**
     * Executes a signed API request to the target service.
     * Handles authorization redirection if necessary.
     *
     * @param {string} endpointUrl - The full URL for the API endpoint.
     * @param {string} httpVerb - 'GET' or 'POST'.
     * @param {string} payloadParams - URL-encoded parameters (e.g., "param1=value1&param2=value2").
     * @param {Function} responseHandler - Callback function (receives responseText or false on error).
     * @param {boolean} [requiresAuthorization=true] - Whether this request needs active user authorization.
     * @param {boolean} [appendAllParamsToUrl=false] - If true, all OAuth parameters are appended to the URL.
     * @param {boolean} [includeAuthHeader=true] - If true, sends OAuth parameters in the 'Authorization' HTTP header.
     */
    function sendSecureRequest(
        endpointUrl,
        httpVerb,
        payloadParams,
        responseHandler,
        requiresAuthorization = true,
        appendAllParamsToUrl = false,
        includeAuthHeader = true
    ) {
        if (requiresAuthorization && !sessionActive) {
            Ti.API.info("AvianNet: Authorization required but session not active. Initiating authorization flow.");
            // Re-attempt the original request after successful authorization
            startAuthorization(function(authSuccess) {
                if (authSuccess) {
                    sendSecureRequest(endpointUrl, httpVerb, payloadParams, responseHandler, requiresAuthorization, appendAllParamsToUrl, includeAuthHeader);
                } else {
                    responseHandler(false); // Authorization failed
                }
            });
            return; // Exit, request will be re-attempted
        }

        // Basic input validation
        if (!['GET', 'POST'].includes(httpVerb.toUpperCase())) {
            Ti.API.error(`AvianNet: Invalid HTTP verb: ${httpVerb}. Must be 'GET' or 'POST'.`);
            responseHandler(false);
            return;
        }

        const originalPayload = payloadParams || "";
        let currentPayload = originalPayload;

        // If access token is available, add it to the payload for signing
        if (internalState.accessTokenValue) {
            currentPayload += (currentPayload.length > 0 ? '&' : '') + `oauth_token=${internalState.accessTokenValue}`;
        }

        // Prepare the OAuth message for signing
        const signedMessage = buildOAuthRequest(endpointUrl, httpVerb, currentPayload);
        OAuth.SignatureMethod.sign(signedMessage, authSecrets); // Sign the message

        let finalRequestUrl = endpointUrl;

        if (appendAllParamsToUrl) {
            // Used primarily for request_token and access_token endpoints where all params go in URL
            finalRequestUrl = OAuth.addToURL(signedMessage.action, signedMessage.parameters);
        } else {
            // For standard API calls, original payload goes to URL (GET) or body (POST)
            // OAuth parameters go into the Authorization header
            if (httpVerb.toUpperCase() === 'GET' && originalPayload.length > 0) {
                 finalRequestUrl = OAuth.addToURL(signedMessage.action, originalPayload);
            }
        }

        const networkClient = Ti.Network.createHTTPClient();

        networkClient.onload = function() {
            responseHandler(this.responseText);
        };

        networkClient.onerror = function(e) {
            Ti.API.error(`AvianNet: API Request failed to ${endpointUrl}. Error: ${e.error}, Code: ${e.code}`);
            responseHandler(false);
        };

        networkClient.open(httpVerb.toUpperCase(), finalRequestUrl, false); // Synchronous for simplicity, can be async

        // Set Authorization header if required
        if (includeAuthHeader) {
            const authHeaderParts = [];
            for (let i = 0; i < signedMessage.parameters.length; i++) {
                const param = signedMessage.parameters[i];
                // Only include OAuth parameters in the header
                if (param[0].startsWith('oauth_') || param[0] === 'realm') {
                    authHeaderParts.push(`${OAuth.percentEncode(param[0])}="${OAuth.percentEncode(param[1])}"`);
                }
            }
            networkClient.setRequestHeader('Authorization', `OAuth ${authHeaderParts.join(', ')}`);
        }

        // Send the request
        if (httpVerb.toUpperCase() === 'POST' && originalPayload.length > 0 && !appendAllParamsToUrl) {
            // For POST, send original payload in the body unless all params were appended to URL
            networkClient.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            networkClient.send(originalPayload);
        } else {
            networkClient.send();
        }
    }

    // --- Public Interface ---

    /**
     * Begins the full OAuth authorization flow. If already authorized, it will call the callback immediately.
     * @param {Function} resultCallback - Function to call upon completion, receives true for success, false for failure.
     */
    this.startAuthorization = function(resultCallback) {
        if (sessionActive) {
            Ti.API.info("AvianNet: User is already authorized.");
            resultCallback(true);
            return;
        }
        Ti.API.info("AvianNet: Starting new authorization process.");
        initiateAuthorizationPhase1(resultCallback);
    };

    /**
     * Checks the current authorization status.
     * @returns {boolean} True if an access token is available and session is active, false otherwise.
     */
    this.checkAuthorizationStatus = function() {
        return sessionActive;
    };

    /**
     * Clears all authorization tokens, effectively logging the user out.
     */
    this.clearSession = function() {
        internalState.accessTokenValue = "";
        internalState.accessTokenSecretValue = "";
        authSecrets.tokenSecret = "";
        sessionActive = false;
        SessionDataManager.clearAuthTokens();
        Ti.API.info("AvianNet: User session cleared.");
    };

    /**
     * Posts a new status update (tweet).
     * @param {string} statusText - The text of the status update.
     * @param {Function} [completionHandler] - Optional callback (response or false).
     */
    this.postTweet = function(statusText, completionHandler) {
        if (!statusText || statusText.trim().length === 0) {
            Ti.API.warn("AvianNet: Cannot post empty status.");
            completionHandler && completionHandler(false);
            return;
        }
        const encodedStatus = `status=${encodeURIComponent(statusText)}`;
        sendSecureRequest(
            'https://api.twitter.com/1.1/statuses/update.json',
            'POST',
            encodedStatus,
            completionHandler
        );
    };

    /**
     * Retrieves mentions for the authenticated user.
     * @param {Function} completionHandler - Callback (response or false).
     * @param {string} [additionalParams] - Optional URL-encoded parameters (e.g., "count=10&since_id=123").
     */
    this.fetchMentions = function(completionHandler, additionalParams) {
        const params = additionalParams || '';
        sendSecureRequest(
            'https://api.twitter.com/1.1/statuses/mentions_timeline.json',
            'GET',
            params,
            completionHandler
        );
    };

    /**
     * Retrieves the timeline for a specific user.
     * @param {string} screenName - The screen name of the user.
     * @param {Function} completionHandler - Callback (response or false).
     * @param {string} [additionalParams] - Optional URL-encoded parameters.
     */
    this.retrieveUserTimeline = function(screenName, completionHandler, additionalParams) {
        if (!screenName) {
            Ti.API.error("AvianNet: User screen name required for timeline retrieval.");
            completionHandler && completionHandler(false);
            return;
        }
        const params = `screen_name=${encodeURIComponent(screenName)}` + (additionalParams ? `&${additionalParams}` : '');
        sendSecureRequest(
            'https://api.twitter.com/1.1/statuses/user_timeline.json',
            'GET',
            params,
            completionHandler
        );
    };

    /**
     * Retrieves the home timeline for the authenticated user.
     * @param {Function} completionHandler - Callback (response or false).
     * @param {string} [additionalParams] - Optional URL-encoded parameters.
     */
    this.retrieveHomeTimeline = function(completionHandler, additionalParams) {
        const params = additionalParams || '';
        sendSecureRequest(
            'https://api.twitter.com/1.1/statuses/home_timeline.json',
            'GET',
            params,
            completionHandler
        );
    };

    /**
     * Performs a search on the social platform.
     * @param {string} queryText - The search query.
     * @param {Function} completionHandler - Callback (response or false).
     * @param {string} [additionalParams] - Optional URL-encoded parameters.
     */
    this.performSearch = function(queryText, completionHandler, additionalParams) {
        if (!queryText || queryText.trim().length === 0) {
            Ti.API.warn("AvianNet: Search query cannot be empty.");
            completionHandler && completionHandler(false);
            return;
        }
        const params = `q=${encodeURIComponent(queryText)}` + (additionalParams ? `&${additionalParams}` : '');
        sendSecureRequest(
            'https://api.twitter.com/1.1/search/tweets.json',
            'GET',
            params,
            completionHandler
        );
    };

    /**
     * Sets the OAuth consumer key for the application.
     * @param {string} key - The consumer key.
     */
    this.setAppKey = function(key) {
        internalState.appKey = key;
    };

    /**
     * Sets the OAuth consumer secret for the application.
     * @param {string} secret - The consumer secret.
     */
    this.setAppSecret = function(secret) {
        internalState.appSecret = secret;
        authSecrets.consumerSecret = secret; // Update accessor immediately
    };

    /**
     * Sets the callback URL used for OAuth redirection.
     * @param {string} url - The callback URL.
     */
    this.setRedirectUrl = function(url) {
        internalState.redirectionCallbackUrl = url;
    };
}