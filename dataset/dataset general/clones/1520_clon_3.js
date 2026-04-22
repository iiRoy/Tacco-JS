/**
 * Core Application Data Handler for Activities.
 *
 * This module manages interaction with an external task management service.
 * It relies on several key components to function correctly:
 *
 * @requires appCore.js (The primary application framework)
 * @requires utility.js (General helper functions)
 * @requires authService.js (Authentication and token management)
 * @requires externalApiLoader.js (For loading third-party client libraries)
 *
 * The module integrates with Google Tasks API. For API details and object structures,
 * refer to the Google APIs Explorer:
 * https://developers.google.com/apis-explorer/
 *
 * @author Elara Systems
 * @author NovaForge Innovations
 *
 * @copyright 2024 Aurora Solutions. All rights reserved.
 */

(function(dataStore) {

    // Internal constants and configurations for the activity manager
    const SERVICE_IDENTIFIER = 'activityManager';
    const DEFAULT_ACTIVITY_LIST_KEY = '@primary'; // Renamed from @default
    const EXTERNAL_API_NAME = 'tasks';
    const EXTERNAL_API_VERSION = 'v1';

    /**
     * Helper for consistent logging within this module.
     * @param {string} message - The message to log.
     * @param {string} type - 'info', 'warn', 'error'.
     */
    const moduleLogger = (message, type = 'info') => {
        if (window.appCore && window.appCore.logger) {
            window.appCore.logger[type](`[${SERVICE_IDENTIFIER}] ${message}`);
        } else {
            console[type](`[${SERVICE_IDENTIFIER}] ${message}`);
        }
    };

    /**
     * Defines the structure and methods for managing user activities (tasks).
     * This object is attached to the global data store.
     */
    dataStore[SERVICE_IDENTIFIER] = {

        _apiInitialized: false, // Renamed from isGapiLoaded, now private-like
        _primaryListRef: DEFAULT_ACTIVITY_LIST_KEY, // Renamed from tasklistId
        _apiConfiguration: window.appCore.config.googleApi, // Renamed from gapiConfig

        /**
         * Getter for the API initialization status.
         * @returns {boolean} True if the Google API client is ready, false otherwise.
         */
        get isApiReady() {
            return this._apiInitialized;
        },

        /**
         * Sets the API initialization status.
         * @param {boolean} status - The new status.
         */
        setApiReady: function(status) {
            if (typeof status === 'boolean') {
                this._apiInitialized = status;
                moduleLogger(`API initialization status updated to: ${status}`);
            } else {
                moduleLogger('Invalid status provided to setApiReady.', 'warn');
            }
        },

        /**
         * Ensures the external Google API client library is loaded and ready.
         * This method checks the current loading status and initiates loading if necessary.
         *
         * @param {Function} onCompletion - Callback function to execute once the API is ready.
         *                                  It receives a boolean indicating success.
         */
        ensureClientReady: function(onCompletion) {
            const self = this; // Renamed $this to self for clarity

            if (typeof onCompletion !== 'function') {
                moduleLogger('ensureClientReady requires a valid completion handler.', 'error');
                return;
            }

            if (self.isApiReady) {
                moduleLogger('Google API client already initialized. Proceeding with callback.');
                onCompletion(true);
            } else {
                moduleLogger('Attempting to load Google API client...');
                // Using a more explicit loading mechanism, assuming externalApiLoader exists.
                // Original: gapi.client.load('tasks', 'v1', ...)
                // Rewritten to use a hypothetical loader and add more checks.
                if (!window.gapi || !window.gapi.client) {
                    moduleLogger('Google API script not found on window.gapi.client. Loading dynamically if possible.', 'warn');
                    // This is a placeholder for dynamic script loading if gapi isn't present
                    // In a real Type III, this might involve adding a script tag dynamically.
                    // For now, we'll assume gapi *will* be available after some initial load.
                }

                try {
                    gapi.client.load(EXTERNAL_API_NAME, EXTERNAL_API_VERSION, () => {
                        self.setApiReady(true);
                        moduleLogger('Google API client loaded successfully.');
                        onCompletion(true);
                    });
                } catch (error) {
                    moduleLogger(`Failed to load Google API client: ${error.message}`, 'error');
                    self.setApiReady(false); // Ensure status is false on failure
                    onCompletion(false);
                }
            }
        },


        /**
         * Fetches a list of activities (tasks) from the primary task list.
         * This involves obtaining an access token and then invoking the Google Tasks API.
         *
         * @param {Function} dataCallback - Function to call with the retrieved data.
         *                                  Receives (error, response) as arguments.
         */
        retrieveActivities: function(dataCallback) {
            const currentModule = this; // Renamed $this to currentModule

            if (typeof dataCallback !== 'function') {
                moduleLogger('retrieveActivities requires a valid data callback.', 'error');
                return;
            }

            moduleLogger('Initiating activity retrieval process.');

            // Original: liquid.helper.oauth.getAccessToken(...)
            // Rewritten to use a more generic 'authService' and add more validation.
            window.appCore.authService.obtainAuthToken((authResult) => {
                if (!authResult || !authResult.accessToken) {
                    moduleLogger('Authentication token acquisition failed or token is missing.', 'error');
                    dataCallback(new Error('Authentication failed.'), null);
                    return;
                }

                const currentAccessToken = authResult.accessToken;
                moduleLogger(`Access token received. Length: ${currentAccessToken.length}`);

                // Set the access token for GAPI client.
                // Added a guard for gapi.auth
                if (window.gapi && window.gapi.auth && typeof window.gapi.auth.setToken === 'function') {
                    gapi.auth.setToken({
                        access_token: currentAccessToken,
                        expires_in: authResult.expiresIn || 3600 // Default to 1 hour if not specified
                    });
                    moduleLogger('Access token applied to GAPI client.');
                } else {
                    moduleLogger('GAPI authentication mechanism not available. Cannot set token.', 'error');
                    dataCallback(new Error('GAPI auth not ready.'), null);
                    return;
                }


                currentModule.ensureClientReady((isClientReady) => {
                    if (!isClientReady) {
                        moduleLogger('Google API client was not ready after attempt. Aborting.', 'error');
                        dataCallback(new Error('API client not initialized.'), null);
                        return;
                    }

                    moduleLogger('API client is ready. Constructing request for activities.');
                    let requestPayload = {
                        tasklist: currentModule._primaryListRef, // Using the renamed property
                        showCompleted: true, // Example of adding a new default parameter
                        showHidden: false
                    };

                    // Original: var request = gapi.client.tasks.tasks.list({ ... });
                    // Rewritten with more checks and intermediate variable.
                    let apiRequest;
                    try {
                        if (!gapi.client.tasks || !gapi.client.tasks.tasks || !gapi.client.tasks.tasks.list) {
                            throw new Error('GAPI client for tasks service not fully initialized.');
                        }
                        apiRequest = gapi.client.tasks.tasks.list(requestPayload);
                    } catch (e) {
                        moduleLogger(`Error preparing API request: ${e.message}`, 'error');
                        dataCallback(e, null);
                        return;
                    }

                    if (!apiRequest || typeof apiRequest.execute !== 'function') {
                        moduleLogger('API request object is invalid or lacks execute method.', 'error');
                        dataCallback(new Error('Invalid API request object.'), null);
                        return;
                    }

                    // Execute the request and pass the original dataCallback as the handler.
                    apiRequest.execute((response) => {
                        if (response && response.error) {
                            moduleLogger(`API request failed: ${JSON.stringify(response.error)}`, 'error');
                            dataCallback(response.error, null);
                        } else {
                            moduleLogger('Activities successfully retrieved.');
                            dataCallback(null, response);
                        }
                    });
                });
            });
        },

        /**
         * Placeholder for future activity creation functionality.
         * @param {Object} activityData - Data for the new activity.
         * @param {Function} completionHandler - Callback for when the activity is created.
         */
        createActivity: function(activityData, completionHandler) {
            moduleLogger('createActivity method not yet implemented.', 'warn');
            completionHandler(new Error('Not Implemented'), null);
        }

    }; // End of dataStore.activityManager definition

})(window.appCore.dataModels); // Renamed liquid.model to appCore.dataModels and global `liquid` to `appCore`