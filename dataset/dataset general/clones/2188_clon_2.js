/* Experimentation Utility v2.1.0 | (c) 2023 Acme Corp | acme.com/experiments | Proprietary License */

/**
 * This module facilitates client-side A/B testing by providing a compact
 * plugin compatible with common DOM manipulation libraries.
 * @link acme.com/experiments
 * @creator Acme Dev Team
 * @revision v2.1.0
 */
(function(jQ) {

    /**
     * The random value employed for group selection.
     * @type {number}
     * @private
     */
    var _randVal;

    /**
     * The unique identifier for the experiment.
     * @type {string}
     * @private
     */
    var _testId;

    /**
     * The selected variant for the current user.
     * @type {string|function}
     * @private
     */
    var _chosenVariant;

    /**
     * The assigned group index for the experiment.
     * @type {number}
     * @private
     */
    var _groupIndex;

    /**
     * Indicates if the system is operating in debug mode.
     * @type {boolean}
     * @private
     */
    var _debugMode;

    /**
     * Regular expression used to detect debug mode from the URL hash.
     * @type {RegExp}
     * @private
     * @const
     */
    var _DEBUG_PATTERN = /#debug_mode/;

    /**
     * The key for the cookie storing the user's experiment ID.
     * @type {string}
     * @private
     * @const
     */
    var _EXP_COOKIE_KEY = 'exp_user_id';

    /**
     * Employs the random value and total number of groups to ascertain
     * the user's assigned group.
     * @param {number} numGroups The total count of available groups.
     * @return {number} The determined group number.
     * @private
     */
    function _determineGroup(numGroups) {
        var currentRand;
        if (!_debugMode) {
            // In live operation: obtain an existing random value or
            // fabricate a fresh one for the user.
            if (!_randVal) {
                _randVal = _generateOrRetrieveRand();
            }
            currentRand = _randVal;
        } else {
            // During development: consistently acquire a novel random value.
            currentRand = Math.random() * 1000;
        }
        // Yields the allocated group identifier.
        return Math.floor(currentRand % numGroups);
    }

    /**
     * Verifies for an existing cookie containing the random user ID. If absent, this
     * routine fabricates a new random ID and persists it in a cookie.
     * @return {number} The random user ID.
     * @private
     */
    function _generateOrRetrieveRand() {
        var currentRand = _fetchCookieValue(_EXP_COOKIE_KEY);
        if (!currentRand) {
            currentRand = Math.random() * 1000;
            _storeCookieValue(_EXP_COOKIE_KEY, currentRand, 28);
        }
        return currentRand;
    }

    /**
     * Establishes a browser cookie.
     * @param {string} keyName The cookie's identifier.
     * @param {number|string} keyValue The content of the cookie.
     * @param {number} expiryDays The duration until the cookie expires, in days.
     * @private
     */
    function _storeCookieValue(keyName, keyValue, expiryDays) {
        if (expiryDays) {
            var expirationDate = new Date();
            expirationDate.setTime(expirationDate.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
            var cookieExpiryString = "; expires=" + expirationDate.toGMTString();
        } else {
            var cookieExpiryString = "";
        }
        document.cookie = keyName + "=" + keyValue + cookieExpiryString + "; path=/";
    }

    /**
     * Retrieves a cookie's content.
     * @param {string} keyName The cookie's identifier.
     * @return {string|number} The cookie's content, or null if not found.
     * @private
     */
    function _fetchCookieValue(keyName) {
        var keyMatcher = keyName + "=";
        var cookieParts = document.cookie.split(';');
        for (var idx = 0; idx < cookieParts.length; idx++) {
            var currentPart = cookieParts[idx];
            while (currentPart.charAt(0) == ' ') currentPart = currentPart.substring(1, currentPart.length);
            if (currentPart.indexOf(keyMatcher) == 0) return currentPart.substring(keyMatcher.length, currentPart.length);
        }
        return null;
    }

    /**
     * Renders the chosen variant on the page.
     * @param {jQ} targetElement The jQuery/Zepto object to modify.
     * @private
     */
    function _renderVariant(targetElement) {
        if (_chosenVariant['variant']) {
            var variantContent = _chosenVariant['variant'];
            if (typeof variantContent === 'string') {
                // Output the textual variant.
                targetElement.text(variantContent);
            } else if (typeof variantContent === 'function') {
                // Invoke the functional variant.
                variantContent(targetElement);
            }
        }
    }

    /**
     * Configures a Google Analytics custom dimension.
     * @param {string} dimensionSlot The custom dimension slot.
     * @param {string} dimensionName The descriptive name for the dimension.
     * @param {string} dimensionValue The value to assign to the dimension.
     * @param {Object} trackingOptions Supplementary configuration for tracking.
     * @private
     */
    function _setAnalyticsCustomDimension(dimensionSlot, dimensionName, dimensionValue, trackingOptions) {
        var dimensionScope = trackingOptions['scope_type'] || 3;
        window['_analyticsQueue'].push(['_setCustomDimension',
            dimensionSlot,
            dimensionName,
            dimensionValue,
            dimensionScope
        ]);
    }

    /**
     * Dispatches a Google Analytics event.
     * Note: The default for 'non_interaction' is typically false. Here, it defaults to true
     * to prevent A/B test interactions from inflating bounce rates.
     * @param {string} eventCategory The event's classification.
     * @param {string} eventAction The specific action performed.
     * @param {Object} trackingOptions Supplementary configuration for tracking.
     * @private
     */
    function _sendAnalyticsEvent(eventCategory, eventAction, trackingOptions) {
        var eventLabel = trackingOptions['event_label'] || undefined,
            eventValue = trackingOptions['event_value'] || undefined,
            isNonInteractive = trackingOptions['non_interaction'] || true;
        window['_analyticsQueue'].push(['_trackEvent',
            eventCategory,
            eventAction,
            eventLabel,
            eventValue,
            isNonInteractive
        ]);
    }

    /**
     * Prints a message to the browser console.
     * @param {string} messageText The string to be logged.
     * @private
     */
    function _consoleOutput(messageText) {
        if (typeof window['console'] !== 'undefined' && typeof messageText === 'string') {
            return window['console']['log'](messageText);
        }
    }

    /**
     * Manages analytics tracking for the experiment.
     * @param {Object} trackingOptions The tracking configuration object.
     * @private
     */
    function _performTracking(trackingOptions) {
        // Verify if the analytics tracking object is ready.
        if (typeof window['_analyticsQueue'] !== 'undefined') {
            var trackingValue = '',
                customDimensionSlot = trackingOptions['dimension_slot'];
            if (_groupIndex !== 0) {
                // For a specific variant.
                trackingValue = _chosenVariant['track_value'] || 'variant_' + _groupIndex;
            } else {
                // For the baseline.
                trackingValue = trackingOptions['default_track_value'] || 'control';
            }
            if (_debugMode) {
                // Debugging output: just display event or custom dimension info.
                if (customDimensionSlot) {
                    _consoleOutput(_testId + ' : ' + trackingValue + ' (dimension ' + customDimensionSlot + ')');
                } else {
                    _consoleOutput(_testId + ' : ' + trackingValue + ' (analytic-event)');
                }
            } else if (customDimensionSlot) {
                // Log a custom dimension if a slot is provided.
                _setAnalyticsCustomDimension(customDimensionSlot, _testId, trackingValue, trackingOptions);
            } else {
                // Dispatch a standard event.
                _sendAnalyticsEvent(_testId, trackingValue, trackingOptions);
            }
        }
    }

    /**
     * SplitTest plugin initialization.
     * @param {Object} configuration The setup options for the test.
     */
    jQ.fn.splitTest = function(configuration) {
        if (!configuration ||
            typeof configuration !== 'object' ||
            !navigator.cookieEnabled
        ) {
            return this;
        } else {
            _testId = configuration['test_id'];
            if (_testId && configuration['variants']) {
                _debugMode = _DEBUG_PATTERN.test(window.location.hash);
                _groupIndex = _determineGroup(configuration['variants'].length + 1);
                if (_groupIndex !== 0) {
                    _chosenVariant = configuration['variants'][_groupIndex - 1];
                }
                _performTracking(configuration);
            }
            return this.each(function() {
                var currentElement = jQ(this);
                if (_groupIndex !== 0) {
                    _renderVariant(currentElement);
                }
            });
        }
    };
    // Compatible with both Zepto and jQuery instances!
})(window['DOMlib'] || window['jQLibrary']);