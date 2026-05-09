/**
 * Javascript module for managing interactive tabbed interfaces,
 * including state persistence using client-side storage.
 *
 * This module facilitates dynamic content switching and remembers
 * user selections across sessions.
 *
 * Modified from an original concept by Evan Dorn.
 * Incorporates a customized cookie management utility.
 *
 */

// Configure initial setup and event listeners once the DOM is ready.
jQuery(function($) {
    const cookieRetentionDays = 365; // Store preferences for one year
    const cookieRetentionMinutes = 60 * 24 * cookieRetentionDays;

    // Initialize the custom cookie utility for storing selection history.
    $.CookieUtility.initializeStore("selection_history", cookieRetentionMinutes);

    // Attach click handlers to all control items within tab group containers.
    // Prevent default anchor behavior and then process the interaction.
    $('.tab-group-container .control-item a').on('click', function(evt) {
        evt.preventDefault();
        onControlItemActivated($(this));
    });

    // Iterate through each tab group container to restore any previously
    // selected item from the stored preferences.
    $('.tab-group-container').each(function() {
        restoreLastActiveItem($(this));
    });
});

/**
 * Attempts to restore the previously active control item and its
 * corresponding display section within a given tab group container.
 *
 * @param {jQuery} containerElement The jQuery object representing the tab group container.
 */
function restoreLastActiveItem(containerElement) {
    if (!containerElement || !containerElement.attr('id')) {
        console.warn("Invalid container element provided for state restoration.");
        return;
    }

    const currentPreferences = retrieveUserPreferences();
    const containerKey = generateContainerStorageKey(containerElement.attr('id'));
    const storedActiveItemId = currentPreferences[containerKey];

    // If a previous selection is found, activate it.
    if (storedActiveItemId) {
        const targetControlSelector = "#" + storedActiveItemId;
        const targetControlElement = $(targetControlSelector);

        if (targetControlElement.length) {
            activateContentDisplay(targetControlElement);
        } else {
            console.info(`Stored control item '${storedActiveItemId}' not found.`);
        }
    }
}

/**
 * Processes the activation of a control item (tab).
 * This function handles visual updates and persistence of the selection.
 *
 * @param {jQuery} activatedElement The jQuery object of the `<a>` element that was clicked.
 */
function onControlItemActivated(activatedElement) {
    const parentControlItem = activatedElement.closest('li.control-item');

    if (parentControlItem.length === 0) {
        console.error("Clicked element is not within a valid control item structure.");
        return;
    }

    activateContentDisplay(parentControlItem);
    persistActiveItemSelection(parentControlItem.attr('id'));
}

/**
 * Manages the visual state of control items and their associated display sections.
 * Activates the specified control item and its corresponding display section,
 * while deactivating all siblings.
 *
 * @param {jQuery} selectedControlItem The jQuery object representing the control item to activate.
 */
function activateContentDisplay(selectedControlItem) {
    if (!selectedControlItem || !selectedControlItem.attr('id')) {
        console.warn("Invalid control item provided for display activation.");
        return;
    }

    const controlItemId = selectedControlItem.attr('id');
    // Derive the ID of the corresponding display section.
    // Example: 'myPanel_itemA_control' -> 'myPanel_itemA_display'
    const displaySectionId = controlItemId.replace(/_control$/, "_display");

    const targetDisplaySection = $("#" + displaySectionId);

    if (targetDisplaySection.length === 0) {
        console.error(`Corresponding display section for '${controlItemId}' not found.`);
        return;
    }

    // Update classes for the control item
    selectedControlItem.removeClass('inactive-control').addClass('active-control');
    selectedControlItem.siblings('li.control-item')
                       .removeClass('active-control').addClass('inactive-control');

    // Update classes for the display section
    targetDisplaySection.removeClass('inactive-display').addClass('active-display');
    targetDisplaySection.siblings('.display-section')
                        .removeClass('active-display').addClass('inactive-display');
}

/**
 * Extracts the main group identifier from a control item's ID.
 * Assumes IDs are structured like 'groupName_grp_itemName_control'.
 *
 * @param {string} fullItemId The ID of the control item.
 * @returns {string} The extracted group identifier.
 */
function extractGroupIdentifier(fullItemId) {
    if (typeof fullItemId !== 'string' || !fullItemId) return '';
    const groupDelimiterIndex = fullItemId.indexOf("_grp_");
    return groupDelimiterIndex !== -1 ? fullItemId.substring(0, groupDelimiterIndex) : '';
}

/**
 * Generates a unique key for storing preferences related to a specific control item.
 * The key combines the current page path and the control item's group identifier.
 *
 * @param {string} controlItemId The ID of the active control item.
 * @returns {string} A unique storage key.
 */
function generateItemStorageKey(controlItemId) {
    if (typeof controlItemId !== 'string' || !controlItemId) return '';
    const pagePath = window.location.pathname;
    const groupIdentifier = extractGroupIdentifier(controlItemId);
    const rawKey = `${pagePath}--${groupIdentifier}`;
    // Remove leading slash for consistency if present.
    return rawKey.replace(/^\//, '');
}

/**
 * Generates a unique key for storing preferences related to a tab group container.
 * The key combines the current page path and the container's ID.
 *
 * @param {string} containerId The ID of the tab group container.
 * @returns {string} A unique storage key.
 */
function generateContainerStorageKey(containerId) {
    if (typeof containerId !== 'string' || !containerId) return '';
    const pagePath = window.location.pathname;
    const rawKey = `${pagePath}--${containerId}`;
    return rawKey.replace(/^\//, '');
}

/**
 * Stores the ID of the currently active control item in the user preferences cache.
 *
 * @param {string} activeControlItemId The ID of the control item that was just activated.
 */
function persistActiveItemSelection(activeControlItemId) {
    if (typeof activeControlItemId !== 'string' || !activeControlItemId) {
        console.warn("Attempted to persist an invalid control item ID.");
        return;
    }

    let preferencesRegistry = retrieveUserPreferences();
    // Ensure the registry is an object if it was null/undefined
    preferencesRegistry = preferencesRegistry || {};

    const storageKey = generateItemStorageKey(activeControlItemId);
    preferencesRegistry[storageKey] = activeControlItemId;

    $.CookieUtility.saveData('selection_history', 'user_selections', preferencesRegistry);
}

/**
 * Retrieves the current user preferences cache from client-side storage.
 *
 * @returns {object} An object containing stored preferences, or an empty object if none exist.
 */
function retrieveUserPreferences() {
    const fetchedData = $.CookieUtility.fetchData('selection_history', 'user_selections');
    // Return an empty object if no data or invalid data was retrieved.
    return (fetchedData === undefined || fetchedData === null || typeof fetchedData !== 'object') ? {} : fetchedData;
}

/*
  License for CookieUtility (derived from Jookie by Jon Combe):

  Copyright (c) 2023 [Your Name/Organization Here]
  Portions Copyright (c) 2008 Jon Combe

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation
  files (the "Software"), to deal in the Software without
  restriction, including without limitation the rights to use,
  copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following
  conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
  OTHER DEALINGS IN THE SOFTWARE.
*/

(function(jq) {
    // Internal cache for cookie data to minimize DOM access.
    const _internalCookieCache = {};

    jq.CookieUtility = {
        _internalCache: _internalCookieCache, // Expose for debugging if needed
        debugInfo: function(cookieIdentifier) { _showDebug(cookieIdentifier); },
        removeCookie: function(cookieIdentifier) { _deleteCookie(cookieIdentifier); },
        fetchData: function(cookieIdentifier, variableName) { return _getValue(cookieIdentifier, variableName); },
        initializeStore: function(cookieIdentifier, lifespanMinutes) { _setupStore(cookieIdentifier, lifespanMinutes); },
        saveData: function(cookieIdentifier, variableName, value) { _setValue(cookieIdentifier, variableName, value); },
        clearValue: function(cookieIdentifier, variableName) { _unsetValue(cookieIdentifier, variableName); }
    };

    /**
     * Displays debugging information for a specific cookie.
     * @param {string} cookieIdentifier The name of the cookie.
     */
    function _showDebug(cookieIdentifier) {
        const cookieData = _internalCookieCache[cookieIdentifier];
        if (!cookieData) {
            console.warn(`No debug data for cookie: ${cookieIdentifier}`);
            return;
        }
        const jsonContent = JSON.stringify(cookieData.values, null, 2);
        console.log(`--- Cookie Debug Info ---
Name: ${cookieIdentifier}
Lifespan: ${cookieData.lifespanMinutes} minutes
Existed Prior to Init: ${cookieData.existedBeforeInit}

Content:
${jsonContent}
-------------------------`);
    }

    /**
     * Deletes a cookie from the browser and internal cache.
     * @param {string} cookieIdentifier The name of the cookie to delete.
     */
    function _deleteCookie(cookieIdentifier) {
        if (!cookieIdentifier || typeof cookieIdentifier !== 'string') {
            console.error("Invalid cookie identifier for deletion.");
            return;
        }
        delete _internalCookieCache[cookieIdentifier];
        // Set expiry date to a past date to delete the cookie
        document.cookie = `${cookieIdentifier}=; expires=${new Date(0).toUTCString()}; path=/`;
        console.info(`Cookie '${cookieIdentifier}' deleted.`);
    }

    /**
     * Extracts the raw value of a cookie from `document.cookie`.
     * @param {string} cookieIdentifier The name of the cookie.
     * @returns {string|null} The decoded cookie value or null if not found.
     */
    function _extractCookieData(cookieIdentifier) {
        if (!cookieIdentifier || typeof cookieIdentifier !== 'string') return null;

        const allCookies = document.cookie.split('; ');
        const targetCookie = allCookies.find(cookie => cookie.startsWith(`${cookieIdentifier}=`));

        if (targetCookie) {
            const rawValue = targetCookie.substring(cookieIdentifier.length + 1);
            try {
                return decodeURIComponent(rawValue);
            } catch (e) {
                console.error(`Error decoding cookie '${cookieIdentifier}':`, e);
                return null;
            }
        }
        return null;
    }

    /**
     * Retrieves a specific variable's value from a cookie's stored data.
     * @param {string} cookieIdentifier The name of the cookie.
     * @param {string} variableName The name of the variable to retrieve.
     * @returns {*} The value of the variable, or undefined if not found.
     */
    function _getValue(cookieIdentifier, variableName) {
        const cookieData = _internalCookieCache[cookieIdentifier];
        if (!cookieData || !cookieData.values) {
            console.debug(`Cookie data for '${cookieIdentifier}' not found in cache.`);
            return undefined;
        }
        return cookieData.values[variableName];
    }

    /**
     * Initializes or re-initializes a cookie's internal cache.
     * @param {string} cookieIdentifier The name of the cookie.
     * @param {number} lifespanMinutes The lifespan of the cookie in minutes.
     */
    function _setupStore(cookieIdentifier, lifespanMinutes) {
        if (!cookieIdentifier || typeof cookieIdentifier !== 'string' || lifespanMinutes === undefined || typeof lifespanMinutes !== 'number' || lifespanMinutes < 0) {
            console.error("Invalid parameters for cookie store initialization.");
            return;
        }

        if (_internalCookieCache[cookieIdentifier] === undefined) {
            let retrievedValues = {};
            let cookieWasPresent = false;

            const rawCookieValue = _extractCookieData(cookieIdentifier);
            if (rawCookieValue !== null && rawCookieValue !== "") {
                try {
                    retrievedValues = JSON.parse(rawCookieValue);
                    cookieWasPresent = true;
                } catch (e) {
                    console.error(`Failed to parse JSON from cookie '${cookieIdentifier}':`, e);
                    // Fallback to empty object if parsing fails
                    retrievedValues = {};
                }
            }

            _internalCookieCache[cookieIdentifier] = {
                lifespanMinutes: lifespanMinutes,
                existedBeforeInit: cookieWasPresent,
                values: retrievedValues
            };
            _saveCookie(cookieIdentifier); // Save to ensure lifespan is set correctly even if empty
            console.info(`Cookie store '${cookieIdentifier}' initialized. Lifespan: ${lifespanMinutes} mins.`);
        }
    }

    /**
     * Writes the current state of a cookie from the internal cache to the browser.
     * @param {string} cookieIdentifier The name of the cookie to save.
     */
    function _saveCookie(cookieIdentifier) {
        const cookieData = _internalCookieCache[cookieIdentifier];
        if (!cookieData) {
            console.error(`Attempted to save non-existent cookie data for '${cookieIdentifier}'.`);
            return;
        }

        let expiresString = "";
        if (cookieData.lifespanMinutes > 0) {
            const expiryDate = new Date();
            expiryDate.setMinutes(expiryDate.getMinutes() + cookieData.lifespanMinutes);
            expiresString = `; expires=${expiryDate.toUTCString()}`;
        }

        const encodedValue = encodeURIComponent(JSON.stringify(cookieData.values));
        document.cookie = `${cookieIdentifier}=${encodedValue}${expiresString}; path=/`;
    }

    /**
     * Sets a specific variable's value within a cookie and saves it.
     * @param {string} cookieIdentifier The name of the cookie.
     * @param {string} variableName The name of the variable to set.
     * @param {*} value The value to store.
     */
    function _setValue(cookieIdentifier, variableName, value) {
        const cookieData = _internalCookieCache[cookieIdentifier];
        if (!cookieData) {
            console.error(`Cookie data for '${cookieIdentifier}' not initialized. Cannot set value.`);
            return;
        }
        cookieData.values[variableName] = value;
        _saveCookie(cookieIdentifier);
    }

    /**
     * Removes a specific variable from a cookie's stored data and saves it.
     * @param {string} cookieIdentifier The name of the cookie.
     * @param {string} variableName The name of the variable to remove.
     */
    function _unsetValue(cookieIdentifier, variableName) {
        const cookieData = _internalCookieCache[cookieIdentifier];
        if (!cookieData) {
            console.error(`Cookie data for '${cookieIdentifier}' not initialized. Cannot unset value.`);
            return;
        }
        delete cookieData.values[variableName];
        _saveCookie(cookieIdentifier);
    }

})(window.jQuery);