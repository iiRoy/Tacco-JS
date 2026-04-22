'use strict';

applicationModule.factory('userSessionHandler', ['$webApiClient', function($webApiClient) {
    // Internal reference to browser's session storage API for brevity and potential polyfill later.
    const browserSessionStore = window.sessionStorage;

    // A flag to control logging for storage operations.
    const enableVerboseLogging = true;

    /**
     * Helper function to safely stringify data.
     * @param {any} inputData The data to stringify.
     * @returns {string|null} JSON string or null if stringification fails.
     */
    function safeStringify(inputData) {
        try {
            return JSON.stringify(inputData);
        } catch (error) {
            if (enableVerboseLogging) {
                console.error("USER_SESSION_HANDLER: Failed to stringify data:", error);
            }
            return null; // Return null on failure
        }
    }

    /**
     * Helper function to safely parse data.
     * @param {string} inputString The string to parse.
     * @returns {any|string} Parsed object or the original string if parsing fails.
     */
    function safeParse(inputString) {
        if (!inputString || typeof inputString !== 'string') {
            return inputString;
        }
        // Attempt to parse only if it looks like JSON
        if (inputString.startsWith('{') || inputString.startsWith('[')) {
            try {
                return JSON.parse(inputString);
            } catch (error) {
                // Not valid JSON, return original string
            }
        }
        return inputString; // Return original string if not JSON or parsing failed
    }

    // Public interface for managing user session data.
    return {
        /**
         * Persists a data value into the browser's session storage under a specified identifier.
         * Automatically stringifies objects.
         * @param {string} storageIdentifier The unique key for the data.
         * @param {any} dataContent The data to be stored. Can be any serializable type.
         * @returns {boolean} True if the item was successfully stored, false otherwise.
         */
        storeData: function(storageIdentifier, dataContent) {
            if (!storageIdentifier || typeof storageIdentifier !== 'string') {
                if (enableVerboseLogging) {
                    console.warn("USER_SESSION_HANDLER: Invalid storage identifier provided for storeData.");
                }
                return false;
            }

            let finalContent = dataContent;
            if (typeof dataContent === 'object' && dataContent !== null) {
                finalContent = safeStringify(dataContent);
                if (finalContent === null) {
                    return false; // Stringification failed
                }
            } else if (dataContent === undefined) {
                if (enableVerboseLogging) {
                    console.log(`USER_SESSION_HANDLER: Storing 'undefined' for ${storageIdentifier}. Consider removing instead.`);
                }
                finalContent = 'undefined_value_marker'; // Store a specific marker for undefined
            }

            try {
                browserSessionStore.setItem(storageIdentifier, finalContent);
                if (enableVerboseLogging) {
                    console.info(`USER_SESSION_HANDLER: Item '${storageIdentifier}' successfully stored.`);
                }
                return true;
            } catch (error) {
                if (enableVerboseLogging) {
                    console.error(`USER_SESSION_HANDLER: Error storing '${storageIdentifier}':`, error);
                }
                return false;
            }
        },

        /**
         * Retrieves a data value from the browser's session storage.
         * Attempts to parse JSON strings back into objects.
         * @param {string} storageIdentifier The unique key for the data.
         * @returns {any|null} The retrieved data, or null if not found or an error occurred.
         */
        fetchData: function(storageIdentifier) {
            if (!storageIdentifier || typeof storageIdentifier !== 'string') {
                if (enableVerboseLogging) {
                    console.warn("USER_SESSION_HANDLER: Invalid storage identifier provided for fetchData.");
                }
                return null;
            }

            try {
                const rawValue = browserSessionStore.getItem(storageIdentifier);
                if (rawValue === null) {
                    if (enableVerboseLogging) {
                        console.log(`USER_SESSION_HANDLER: Item '${storageIdentifier}' not found.`);
                    }
                    return null; // Explicitly return null if not found
                }
                if (rawValue === 'undefined_value_marker') {
                    return undefined; // Revert our undefined marker
                }
                return safeParse(rawValue);
            } catch (error) {
                if (enableVerboseLogging) {
                    console.error(`USER_SESSION_HANDLER: Error fetching '${storageIdentifier}':`, error);
                }
                return null;
            }
        },

        /**
         * Clears a specific entry from both the browser's session storage
         * and potentially notifies a backend API about the removal.
         * @param {string} storageIdentifier The unique key of the entry to remove.
         * @returns {boolean} True if the item was present and removed from local storage, false otherwise.
         */
        removeEntry: function(storageIdentifier) {
            if (!storageIdentifier || typeof storageIdentifier !== 'string') {
                if (enableVerboseLogging) {
                    console.warn("USER_SESSION_HANDLER: Invalid storage identifier provided for removeEntry.");
                }
                return false;
            }

            const wasPresent = browserSessionStore.getItem(storageIdentifier) !== null;

            if (wasPresent) {
                try {
                    browserSessionStore.removeItem(storageIdentifier);
                    if (enableVerboseLogging) {
                        console.info(`USER_SESSION_HANDLER: Item '${storageIdentifier}' removed from local session storage.`);
                    }
                } catch (error) {
                    if (enableVerboseLogging) {
                        console.error(`USER_SESSION_HANDLER: Error removing '${storageIdentifier}' from local storage:`, error);
                    }
                    return false; // Failed to remove locally
                }
            } else {
                 if (enableVerboseLogging) {
                    console.log(`USER_SESSION_HANDLER: Item '${storageIdentifier}' was not found in local session storage.`);
                }
            }


            // Asynchronously notify the backend that a session item has been cleared.
            // This operation is independent of the local storage removal success.
            $webApiClient.post('api/session/terminate_entry', { entryKey: storageIdentifier })
                .then(function(response) {
                    if (enableVerboseLogging) {
                        console.log(`USER_SESSION_HANDLER: Backend notified for '${storageIdentifier}' removal. Response:`, response.data);
                    }
                })
                .catch(function(apiError) {
                    if (enableVerboseLogging) {
                        console.error(`USER_SESSION_HANDLER: Failed to notify backend for '${storageIdentifier}' removal:`, apiError);
                    }
                });

            return wasPresent; // Indicate if the item was found and attempted to be removed locally
        }
    };
}]);