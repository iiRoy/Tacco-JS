function StyleController(targetElementId) {
    const _instanceRef = this;
    const styleDefinitions = {};
    let registeredKeys = [];
    let mobileDefaultKey = null;

    // Cache the target DOM element to avoid repeated lookups
    const styleLinkElement = document.getElementById(targetElementId);

    // Initial check for the target element's existence
    if (!styleLinkElement) {
        console.warn(`StyleController: Target element with ID '${targetElementId}' not found. Theme application functionality may be limited.`);
    }

    // Private helper for cookie interactions, ensuring jQuery availability
    const _cookieManager = {
        get: (cookieName) => {
            if (typeof $ === 'undefined' || !$.cookie) {
                console.error("jQuery or its cookie plugin is not available. Cannot retrieve cookie data.");
                return null;
            }
            return $.cookie(cookieName);
        },
        set: (cookieName, valueToStore) => {
            if (typeof $ === 'undefined' || !$.cookie) {
                console.error("jQuery or its cookie plugin is not available. Cannot set cookie data.");
                return;
            }
            // Cookie will expire in 30 days, accessible site-wide
            $.cookie(cookieName, valueToStore, { path: '/', expires: 30 });
        }
    };

    // Private helper to determine if the user is on a mobile device
    const _isMobileDevice = () => {
        const userAgentString = navigator.userAgent.toLowerCase();
        // A more comprehensive regex for mobile detection
        return /android|iphone|ipad|ipod|blackberry|windows phone|iemobile|opera mini/g.test(userAgentString);
    };

    // Applies a specified style to the target link element
    this.applyStyleOption = function(designKey) {
        if (!styleLinkElement) {
            console.error(`Cannot apply style '${designKey}': Target link element is missing for ID '${targetElementId}'.`);
            return;
        }
        const resourcePath = styleDefinitions[designKey];
        if (resourcePath) {
            styleLinkElement.href = resourcePath;
            console.log(`ThemeManager: Applied style '${designKey}' to element '${targetElementId}'.`);
        } else {
            console.warn(`ThemeManager: Style definition for '${designKey}' not found.`);
        }
    };

    // Selects a style, persists the choice in a cookie, and applies it
    this.selectAndPersistStyle = function(designKey) {
        if (typeof designKey !== 'string' || designKey.trim() === '') {
            console.error("ThemeManager: Invalid designKey provided for selection. Must be a non-empty string.");
            return;
        }
        const preferenceCookieName = `theme_preference_${targetElementId}`;
        _cookieManager.set(preferenceCookieName, designKey);
        _instanceRef.applyStyleOption(designKey);
    };

    // Registers a new style definition
    this.registerStyleDefinition = function(designKey, resourcePath, activationCondition = null) {
        // Input validation for required parameters
        if (typeof designKey !== 'string' || designKey.trim() === '' ||
            typeof resourcePath !== 'string' || resourcePath.trim() === '') {
            console.error("ThemeManager: Invalid parameters for registerStyleDefinition. Both designKey and resourcePath must be non-empty strings.");
            return _instanceRef; // Allow chaining even on validation failure
        }

        if (registeredKeys.includes(designKey)) {
            console.warn(`ThemeManager: Style '${designKey}' is already registered. Overwriting existing definition.`);
        } else {
            registeredKeys.push(designKey); // Use push for efficiency
        }
        styleDefinitions[designKey] = resourcePath;

        // Special handling for a mobile fallback style
        if (activationCondition === "auto-mobile-fallback") {
            mobileDefaultKey = designKey;
            console.log(`ThemeManager: Registered '${designKey}' as the automatic mobile fallback style.`);
        }

        return _instanceRef; // Enable method chaining
    };

    // Binds click event handlers to elements corresponding to registered styles
    this.bindOptionSelectors = function() {
        if (typeof $ === 'undefined' || !$.fn.on) {
            console.error("jQuery is not available or its event binding method (.on) is missing. Cannot bind theme selectors.");
            return _instanceRef;
        }

        for (const themeIdentifier of registeredKeys) { // Modern for...of loop
            const selector = `#${themeIdentifier}`;
            $(selector).on('click', function(eventObject) { // Use .on() for better event management
                eventObject.preventDefault(); // Prevent default link/button action
                _instanceRef.selectAndPersistStyle(themeIdentifier);

                // Trigger a custom event on the target element for external listeners
                $(styleLinkElement).trigger('themeChanged', [themeIdentifier]);
                console.debug(`ThemeManager: Click handler activated for '${themeIdentifier}'. Custom event 'themeChanged' triggered.`);
            });
            console.debug(`ThemeManager: Bound click handler for selector '${selector}'.`);
        }
        return _instanceRef; // Enable method chaining
    };

    // Initializes the theme controller, applying a default style based on preferences or device type
    this.initializeController = function() {
        const preferenceCookieName = `theme_preference_${targetElementId}`;
        let storedPreference = _cookieManager.get(preferenceCookieName);
        let styleApplied = false;

        // Prioritize user's stored preference if it's valid
        if (storedPreference && styleDefinitions[storedPreference]) {
            _instanceRef.applyStyleOption(storedPreference);
            console.info(`ThemeManager: Initialized with user's preferred style: '${storedPreference}'.`);
            styleApplied = true;
        }
        // Fallback to mobile-specific default if no preference and device is mobile
        else if (mobileDefaultKey && _isMobileDevice()) {
            _instanceRef.applyStyleOption(mobileDefaultKey);
            console.info(`ThemeManager: Initialized with mobile default style: '${mobileDefaultKey}'.`);
            styleApplied = true;
        }

        // If no specific style was applied, consider applying the first registered style as a general fallback
        if (!styleApplied && registeredKeys.length > 0) {
            const firstRegisteredStyle = registeredKeys[0];
            _instanceRef.applyStyleOption(firstRegisteredStyle);
            console.info(`ThemeManager: No specific preference or mobile default found. Applied first registered style as fallback: '${firstRegisteredStyle}'.`);
        } else if (!styleApplied) {
            console.info("ThemeManager: No styles registered, no specific preference, or mobile default applied during initialization.");
        }

        // Return the method to bind event handlers, allowing further setup
        return _instanceRef.bindOptionSelectors;
    };
}

// Factory function to create a new StyleController instance
function createStyleController(elementIdentifier) {
    return new StyleController(elementIdentifier);
}