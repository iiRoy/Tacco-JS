;((jq, runtimeScope, pageDoc) => {
    'use strict';

    // --- Core Dependency Checks ---
    // Ensure jQuery and jQuery.cookie plugin are accessible for full functionality.
    // If not, a warning is issued, and the script exits to prevent runtime errors.
    if (!jq || !jq.fn || typeof jq.cookie !== 'function') {
        console.warn("ClientStorage: JQuery or JQuery.cookie plugin not found. Persistence features relying on cookies will be unavailable.");
        return;
    }

    // --- Utility Functions ---

    // Safely parses a JSON string. Returns null if parsing fails, logging an error.
    const parseContentSafely = (jsonString) => {
        if (typeof jsonString !== 'string' || jsonString.trim() === '') {
            return null; // Handle empty or non-string inputs gracefully
        }
        try {
            return JSON.parse(jsonString);
        } catch (err) {
            console.error("ClientStorage: Failed to parse JSON content from storage:", err, "Original string:", jsonString);
            return null;
        }
    };

    // Safely stringifies a value into JSON. Handles undefined explicitly.
    const stringifyContentSafely = (valueToStore) => {
        // JSON.stringify(undefined) returns undefined, which we want to avoid storing.
        if (valueToStore === undefined) {
            return undefined;
        }
        try {
            return JSON.stringify(valueToStore);
        } catch (err) {
            console.error("ClientStorage: Failed to stringify value for storage:", err, "Original value:", valueToStore);
            // In case of stringify failure, returning null might be safer than original value
            return null;
        }
    };

    // --- Storage Mechanism Iteration ---
    const supportedPersistenceMechanisms = ['localStorage', 'sessionStorage'];

    supportedPersistenceMechanisms.forEach( (persistenceMechanismName) => {

        // --- Base Configuration for Current Mechanism ---
        const mechanismBaseSettings = {
            fallbackKeyPrefix: `_client_storage_fb:${persistenceMechanismName}:`, // Unique prefix for fallback cookies
            fallbackCookieConfiguration: {
                path: '/',
                // For security and compatibility, 'domain' is often omitted or set carefully.
                // Keeping it for clone similarity, but noting its implications.
                // domain: pageDoc.domain,
                // Cookie expiry logic: localStorage maps to a year, sessionStorage is session-based (no explicit expiry)
                cookieLifespan: (persistenceMechanismName === 'localStorage') ? { expiryDays: 365 } : undefined
            }
        };

        // --- Native Storage Support Detection ---
        let isNativeMechanismAvailable = false;
        try {
            // A robust check involves setting and removing an item.
            const featureDetectionKey = '__storage_test_key__';
            runtimeScope[persistenceMechanismName].setItem(featureDetectionKey, featureDetectionKey);
            runtimeScope[persistenceMechanismName].removeItem(featureDetectionKey);
            isNativeMechanismAvailable = (persistenceMechanismName in runtimeScope && runtimeScope[persistenceMechanismName] !== null);
        } catch (error) {
            console.info(`ClientStorage: Native '${persistenceMechanismName}' is not accessible. Falling back to cookies.`, error);
            isNativeMechanismAvailable = false;
        }
        jq.support[persistenceMechanismName] = isNativeMechanismAvailable; // Update jQuery's support flag

        // --- Main Storage Function Definition ---
        jq[persistenceMechanismName] = function(dataItemKey, dataItemValue) {
            // Merge base settings with any custom options provided by the user (deep merge)
            const activeOperationalSettings = jq.extend(true, {}, mechanismBaseSettings, jq[persistenceMechanismName].options);

            // Retrieves a single data item from storage.
            const retrieveSingleItem = (keyToFetch) => {
                let rawStoredData;
                if (isNativeMechanismAvailable) {
                    rawStoredData = runtimeScope[persistenceMechanismName].getItem(keyToFetch);
                } else {
                    rawStoredData = jq.cookie(activeOperationalSettings.fallbackKeyPrefix + keyToFetch);
                }
                return parseContentSafely(rawStoredData);
            };

            // Stores a single data item into storage.
            const storeSingleItem = (keyToStore, valueToStore) => {
                const serializedData = stringifyContentSafely(valueToStore);

                // Do not store explicitly undefined values.
                if (serializedData === undefined) {
                    console.warn(`ClientStorage: Attempted to store 'undefined' for key "${keyToStore}". Operation skipped.`);
                    return false;
                }
                // Also, if stringify failed and returned null, don't store.
                if (serializedData === null && valueToStore !== null) {
                    console.error(`ClientStorage: Failed to serialize value for key "${keyToStore}". Operation aborted.`);
                    return false;
                }

                if (isNativeMechanismAvailable) {
                    runtimeScope[persistenceMechanismName].setItem(keyToStore, serializedData);
                } else {
                    // Prepare cookie options, explicitly setting expires based on cookieLifespan
                    const finalCookieOpts = jq.extend({}, activeOperationalSettings.fallbackCookieConfiguration);
                    if (activeOperationalSettings.fallbackCookieConfiguration.cookieLifespan && activeOperationalSettings.fallbackCookieConfiguration.cookieLifespan.expiryDays) {
                        finalCookieOpts.expires = activeOperationalSettings.fallbackCookieConfiguration.cookieLifespan.expiryDays;
                    }
                    jq.cookie(activeOperationalSettings.fallbackKeyPrefix + keyToStore, serializedData, finalCookieOpts);
                }
                return true;
            };

            // Removes a single data item from storage.
            const removeSingleItem = (keyToRemove) => {
                if (isNativeMechanismAvailable) {
                    runtimeScope[persistenceMechanismName].removeItem(keyToRemove);
                } else {
                    // For cookies, setting expires to -1 immediately deletes it.
                    const cookieRemovalOpts = jq.extend({}, activeOperationalSettings.fallbackCookieConfiguration, {
                        expires: -1
                    });
                    jq.cookie(activeOperationalSettings.fallbackKeyPrefix + keyToRemove, null, cookieRemovalOpts);
                }
                return true;
            };

            // Clears all data items associated with this storage mechanism.
            const purgeAllItems = () => {
                if (isNativeMechanismAvailable) {
                    runtimeScope[persistenceMechanismName].clear();
                    console.info(`ClientStorage: All items cleared from native '${persistenceMechanismName}'.`);
                } else {
                    // Fallback for cookies: iterate through document.cookie and delete matching prefixes.
                    // Escape special regex characters in the prefix.
                    const regexSafePrefix = activeOperationalSettings.fallbackKeyPrefix.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    const cookieMatchPattern = new RegExp(`^${regexSafePrefix}`);
                    const deletionOptions = jq.extend({}, activeOperationalSettings.fallbackCookieConfiguration, {
                        expires: -1
                    });

                    // Check if document.cookie is available and not empty.
                    if (pageDoc.cookie && pageDoc.cookie.length > 0) {
                        const allCookieStrings = pageDoc.cookie.split(';');
                        for (let cookieIterator = 0; cookieIterator < allCookieStrings.length; cookieIterator++) {
                            let currentRawCookie = allCookieStrings[cookieIterator].trim();
                            const equalsPosition = currentRawCookie.indexOf('=');

                            if (equalsPosition > -1) {
                                const actualCookieName = currentRawCookie.substring(0, equalsPosition);
                                if (cookieMatchPattern.test(actualCookieName)) {
                                     // Delete the matched cookie.
                                     jq.cookie(actualCookieName, null, deletionOptions);
                                }
                            }
                        }
                        console.info(`ClientStorage: Fallback cookies cleared for '${persistenceMechanismName}'.`);
                    } else {
                        console.info("ClientStorage: No cookies found to clear for fallback mechanism.");
                    }
                }
                return true;
            };

            // --- Main Execution Flow for the Storage Function ---
            if (typeof dataItemKey !== "undefined") {
                // If 'dataItemValue' is provided, it's a 'set' or 'remove' operation.
                if (typeof dataItemValue !== "undefined") {
                    if (dataItemValue === null) {
                        // If value is explicitly null, remove the item.
                        return removeSingleItem(dataItemKey);
                    } else {
                        // Otherwise, store the item.
                        return storeSingleItem(dataItemKey, dataItemValue);
                    }
                } else {
                    // If 'dataItemValue' is not provided, it's a 'get' operation.
                    // Handle single key (string) or multiple keys (array).
                    if (typeof dataItemKey === 'string') {
                        return retrieveSingleItem(dataItemKey);
                    } else if (Array.isArray(dataItemKey)) {
                        const retrievedResults = [];
                        for (const individualKey of dataItemKey) {
                            retrievedResults.push(retrieveSingleItem(individualKey));
                        }
                        return retrievedResults;
                    } else {
                        console.warn("ClientStorage: Invalid key type provided for retrieval. Expected a string or an array of strings.");
                        return null; // Indicate failure or invalid input
                    }
                }
            } else {
                // If no key is provided, expose the API methods on the current instance.
                // This allows for calls like $.localStorage().clear(), $.localStorage().get('key'), etc.
                this.get = retrieveSingleItem;
                this.set = storeSingleItem;
                this.remove = removeSingleItem;
                this.clear = purgeAllItems;

                return this; // Return the instance for chaining.
            }
        };

        // Attach the initial configuration to the jQuery method itself, allowing user overrides.
        jq[persistenceMechanismName].options = mechanismBaseSettings;
    });

})(jQuery, window, document);