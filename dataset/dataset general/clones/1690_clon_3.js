/*
 * Module for handling secondary browser window operations.
 *
 * This utility facilitates the creation and management of popup windows,
 * offering enhanced control over their positioning and features.
 *
 * Dependencies: A jQuery-compatible object (e.g., jQuery v1.3.2 or later).
 */
(function(_jqRef) {
    // Defines the default configuration settings for any new auxiliary window.
    // These can be overridden by specific options provided during a call.
    var standardAuxiliaryWindowConfiguration = {
        positioningStrategy: "screen", // 'true', 'screen', 'parent', or null/undefined for default browser placement
        forceNewInstance:    true,     // Determines if a new window is always opened, or if an existing one is reused based on name.
        verticalDimension:   500,      // Default height in pixels.
        leftEdgeOffset:      0,        // Horizontal offset from the left of the screen/parent.
        showAddressBar:      false,    // Controls visibility of the URL address bar.
        displayMenuBar:      false,    // Controls visibility of the browser's menu bar.
        windowIdentifier:    null,     // A unique name for the window. If null and forceNewInstance is true, a unique name is generated.
        onCloseCallback:     null,     // Function to execute when the auxiliary window is detected as closed.
        allowResize:         false,    // Permits or prevents the user from resizing the window.
        enableScrollbars:    false,    // Controls visibility of scrollbars. Note: OS X often forces scrollbars.
        showStatusBar:       false,    // Controls visibility of the status bar.
        displayToolBar:      false,    // Controls visibility of the browser's toolbar.
        topEdgeOffset:       0,        // Vertical offset from the top of the screen/parent.
        horizontalDimension: 500,      // Default width in pixels.
        chromeHeightEstimate: 50,     // Estimated height of browser chrome (toolbars, tabs) for screen centering.
        enableLogging:       false     // Flag to enable console debug messages.
    };

    /**
     * Opens a new auxiliary browser window or navigates an existing one.
     *
     * @param {string} resourceLocator - The URL to load in the new window.
     * @param {object} customSettings - An object containing settings to override the defaults.
     * @returns {Window | null} A reference to the newly opened window, or null if blocked.
     */
    _jqRef.openAuxiliaryWindowPanel = function(resourceLocator, customSettings) {
        // Ensure the resource locator is valid before proceeding.
        if (!resourceLocator || typeof resourceLocator !== 'string') {
            if (standardAuxiliaryWindowConfiguration.enableLogging) {
                console.error("openAuxiliaryWindowPanel: Invalid or missing resource URL.");
            }
            return null;
        }

        // Merge default settings with any provided custom configurations.
        var effectiveWindowConfiguration = _jqRef.extend({}, standardAuxiliaryWindowConfiguration, customSettings);

        // Calculate window position based on the chosen strategy.
        if (effectiveWindowConfiguration.positioningStrategy === "parent") {
            const parentWindowHeight = _jqRef(window).height();
            const parentWindowWidth = _jqRef(window).width();
            effectiveWindowConfiguration.topEdgeOffset = window.screenY + Math.floor((parentWindowHeight - effectiveWindowConfiguration.verticalDimension) / 2);
            effectiveWindowConfiguration.leftEdgeOffset = window.screenX + Math.floor((parentWindowWidth - effectiveWindowConfiguration.horizontalDimension) / 2);
            if (effectiveWindowConfiguration.enableLogging) {
                console.debug("openAuxiliaryWindowPanel: Centering relative to parent window.");
            }
        } else if (effectiveWindowConfiguration.positioningStrategy === true || effectiveWindowConfiguration.positioningStrategy === "screen") {
            // Determine the screen's left edge, accounting for multi-monitor setups.
            // Note: Some browsers (like IE) might report primary monitor resolution regardless of current monitor.
            const currentScreenXOffset = (typeof window.screenLeft !== 'undefined') ? window.screenLeft : screen.left;
            const availableScreenHeight = screen.height;
            const availableScreenWidth = screen.width;

            // Adjust vertical position by an estimated browser chrome height.
            effectiveWindowConfiguration.topEdgeOffset = Math.floor((availableScreenHeight - effectiveWindowConfiguration.verticalDimension) / 2) - effectiveWindowConfiguration.chromeHeightEstimate;
            effectiveWindowConfiguration.leftEdgeOffset = currentScreenXOffset + Math.floor((availableScreenWidth - effectiveWindowConfiguration.horizontalDimension) / 2);

            if (effectiveWindowConfiguration.enableLogging) {
                console.debug("openAuxiliaryWindowPanel: Centering relative to screen. Screen X offset:", currentScreenXOffset);
            }
        } else {
            if (effectiveWindowConfiguration.enableLogging) {
                console.debug("openAuxiliaryWindowPanel: No specific centering strategy applied. Using default offsets or browser's choice.");
            }
        }

        // Helper function to convert boolean flags to 'yes'/'no' strings for window features.
        const formatFeatureFlag = function(flagValue) {
            return flagValue ? 'yes' : 'no';
        };

        // Prepare the list of window features for window.open().
        // Using an object to map feature names to their boolean options, then map to string.
        const windowFeatureSet = {
            'location':   effectiveWindowConfiguration.showAddressBar,
            'menubar':    effectiveWindowConfiguration.displayMenuBar,
            'toolbar':    effectiveWindowConfiguration.displayToolBar,
            'scrollbars': effectiveWindowConfiguration.enableScrollbars,
            'status':     effectiveWindowConfiguration.showStatusBar,
            'resizable':  effectiveWindowConfiguration.allowResize,
            'height':     effectiveWindowConfiguration.verticalDimension,
            'width':      effectiveWindowConfiguration.horizontalDimension,
            'left':       effectiveWindowConfiguration.leftEdgeOffset,
            'top':        effectiveWindowConfiguration.topEdgeOffset,
            'directories':false // Added a new, explicitly false feature.
        };

        let featureStringComponents = [];
        for (let featureKey in windowFeatureSet) {
            if (Object.prototype.hasOwnProperty.call(windowFeatureSet, featureKey)) {
                let featureValue = windowFeatureSet[featureKey];
                if (typeof featureValue === 'boolean') {
                    featureStringComponents.push(`${featureKey}=${formatFeatureFlag(featureValue)}`);
                } else {
                    featureStringComponents.push(`${featureKey}=${featureValue}`);
                }
            }
        }
        const windowFeaturesString = featureStringComponents.join(',');

        // Determine the window's name.
        const uniqueIdComponent = new Date().getTime();
        const actualWindowName = effectiveWindowConfiguration.windowIdentifier ||
                                 (effectiveWindowConfiguration.forceNewInstance ? `aux_pane_${uniqueIdComponent}` : 'reusable_aux_pane');

        let childWinHandle = null;
        try {
            // Attempt to open the new browser window.
            childWinHandle = window.open(resourceLocator, actualWindowName, windowFeaturesString);
        } catch (error) {
            if (effectiveWindowConfiguration.enableLogging) {
                console.error("openAuxiliaryWindowPanel: Error opening window:", error);
            }
            return null; // Return null on error.
        }


        // Set up a mechanism to detect when the child window is closed,
        // then execute the specified callback if it exists.
        if (childWinHandle && effectiveWindowConfiguration.onCloseCallback && typeof effectiveWindowConfiguration.onCloseCallback === 'function') {
            const closeCheckPollingInterval = 100; // Check every 100 milliseconds.
            let closureMonitorId = setInterval(function() {
                // Check if the window is no longer accessible or explicitly closed.
                if (!childWinHandle || childWinHandle.closed) {
                    clearInterval(closureMonitorId); // Stop polling.
                    effectiveWindowConfiguration.onCloseCallback(); // Execute the callback.
                    if (effectiveWindowConfiguration.enableLogging) {
                        console.debug("openAuxiliaryWindowPanel: Child window closed, callback executed.");
                    }
                }
            }, closeCheckPollingInterval);
        }

        // Attempt to bring the new window to the foreground if possible.
        if (childWinHandle && typeof childWinHandle.focus === 'function') {
            childWinHandle.focus();
        } else if (effectiveWindowConfiguration.enableLogging) {
            console.warn("openAuxiliaryWindowPanel: Could not focus child window or handle is invalid.");
        }

        // Provide the handle to the newly created (or focused) window.
        return childWinHandle;
    };
})(jQuery);