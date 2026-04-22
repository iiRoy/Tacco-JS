/*
 * This module provides a mechanism for managing and applying different visual themes
 * or styles dynamically within a web application.
 * It allows defining multiple styles, setting a default for mobile,
 * and persisting user selections using cookies.
 */
function AppearanceEngine(elementIdentifier) {

    // Reference to the current instance for use within nested functions.
    var currentInstance = this,
        // An object to store definitions of various visual settings, mapping a name to its resource path.
        visualSettings = {},
        // An array holding the names of all registered visual options.
        settingNames = [],
        // Stores the name of the style to be automatically applied on mobile devices.
        handheldStyle;

    /**
     * Applies a specified visual option by updating the 'href' attribute
     * of a target HTML <link> element.
     * @param {string} visualOption - The name of the style to be applied.
     */
    this.configureDisplay = function(visualOption) {
        document.getElementById(elementIdentifier).href = visualSettings[visualOption];
    };

    /**
     * Selects a visual option, stores this choice in a cookie for persistence,
     * and then applies the chosen style to the document.
     * @param {string} visualOption - The name of the style to select and apply.
     */
    this.selectTheme = function(visualOption) {
        // Persist the user's theme preference using a cookie.
        $.cookie("appearance-engine-" + elementIdentifier, visualOption, {
            path: '/', // Cookie is valid across the entire domain.
            expires: 30 // Cookie expires after 30 days.
        });
        // Now, apply the selected theme to the webpage.
        currentInstance.configureDisplay(visualOption);
    };

    /**
     * Registers a new visual option with its corresponding resource path (e.g., CSS file URL).
     * Optionally designates a style as the default for mobile devices.
     * @param {string} visualOption - The unique name for this style option.
     * @param {string} resourcePath - The URL or path to the style's resource (e.g., CSS file).
     * @param {string} [initializationCondition] - An optional flag, typically "auto-mobile",
     *                                             to set this style as the mobile default.
     * @returns {AppearanceEngine} - Returns the current instance for method chaining.
     */
    this.registerOption = function(visualOption, resourcePath, initializationCondition) {
        settingNames = settingNames.concat(visualOption); // Add the option name to our list.
        visualSettings[visualOption] = resourcePath; // Store the resource path for this option.
        if (initializationCondition == "auto-mobile") { // Check if this is the designated mobile style.
            handheldStyle = visualOption;
        }
        return currentInstance; // Enable fluent interface.
    };

    /**
     * Sets up click event listeners for elements associated with each registered visual option.
     * When an element is clicked, its corresponding style is selected and applied.
     */
    this.setupInteractions = function() {
        settingNames.forEach(
            function(optionTrigger) {
                // Attach a click event handler to the DOM element whose ID matches the optionTrigger.
                $("#" + optionTrigger).click(function(domEvent) {
                    domEvent.preventDefault(); // Prevent the default action (e.g., navigating if it's a link).
                    currentInstance.selectTheme(optionTrigger); // Choose and apply the associated theme.
                });
            }
        );
    };

    /**
     * Initializes the theme manager. It attempts to load a previously selected theme from a cookie.
     * If no cookie is found, it checks if a mobile default is defined and applies it
     * if the user agent indicates a mobile device.
     * @returns {Function} - Returns the `setupInteractions` function, which should be called to
     *                         bind UI elements to theme switching.
     */
    this.initializeEngine = function() {
        var persistedChoice = $.cookie("appearance-engine-" + elementIdentifier); // Retrieve saved choice.
        if (persistedChoice) {
            currentInstance.configureDisplay(persistedChoice); // Apply the user's previous selection.
        } else if (handheldStyle) { // If no saved choice, but a mobile default is set.
            // Check if the user agent string indicates a mobile or Android device.
            if (navigator.userAgent.toLowerCase().match(/mobile|android/)) {
                currentInstance.configureDisplay(handheldStyle); // Apply the mobile-specific style.
            }
        }
        return currentInstance.setupInteractions; // Provide the function to bind UI events.
    };
}

/**
 * Factory function to create a new instance of the AppearanceEngine.
 * This simplifies instantiation by allowing `createAppearanceEngine(id)` instead of `new AppearanceEngine(id)`.
 * @param {string} elementIdentifier - The ID of the <link> element whose 'href' attribute will be manipulated.
 * @returns {AppearanceEngine} - A new instance of the AppearanceEngine.
 */
function createAppearanceEngine(elementIdentifier) {
    return new AppearanceEngine(elementIdentifier);
}