(function() {
    // --- Core Application Framework Definitions ---
    // This global object serves as the main namespace for the application's
    // foundational components and configurations.
    const AppFramework = {};

    // Define essential system paths and settings. These are critical for
    // locating assets and managing application behavior.
    const systemConfiguration = {
        templateAssetsPath: "../../templates/", // Directory where UI templates are stored.
        primarySettingsFile: "./config.json"    // Path to the main application configuration file.
    };

    // Expose the configured paths via the AppFramework for broader access.
    AppFramework.VIEW_TEMPLATES_ROOT = systemConfiguration.templateAssetsPath;
    AppFramework.GLOBAL_SETTINGS_SOURCE = systemConfiguration.primarySettingsFile;

    /**
     * Represents the central management entity for the application's lifecycle and state.
     * It orchestrates various modules and maintains key application-wide data.
     * @param {Function} startupRoutine - A callback executed once the context is initialized.
     */
    AppFramework.ApplicationContext = function(startupRoutine) {
        let _activeLanguageCode = "en"; // Default user interface language.
        let _currentScreenIdentifier = "public/initial_load.html"; // The page currently displayed.

        /**
         * Updates the application's active language.
         * @param {string} newLocale - The new language code (e.g., 'en', 'de').
         */
        this.setLocale = function(newLocale) {
            // Validate the provided locale against supported options.
            const supportedLocales = ['en', 'de', 'fr']; // Expanded for example
            if (supportedLocales.includes(newLocale)) {
                _activeLanguageCode = newLocale;
                console.info(`Application locale successfully updated to: ${_activeLanguageCode}`);
            } else {
                console.warn(`Unsupported locale specified: ${newLocale}. Retaining current locale.`);
            }
        };

        /**
         * Retrieves the currently active language code.
         * @returns {string} The current language code.
         */
        this.getLocale = function() {
            return _activeLanguageCode;
        };

        /**
         * Triggers a comprehensive refresh of the user interface.
         * This typically involves re-rendering components and reloading dynamic content.
         */
        this.reinitializeDisplay = function() {
            console.log("Initiating full UI display reinitialization sequence.");
            // In a production system, this would involve more complex state management
            // and component lifecycle methods.
        };

        /**
         * Returns the identifier of the screen that is currently active or was last rendered.
         * @returns {string} The path or identifier of the current screen.
         */
        this.getCurrentlyActiveScreen = function() {
            return _currentScreenIdentifier;
        };

        /**
         * Sets the identifier for the screen that is currently being displayed.
         * @param {string} path - The path or identifier of the screen.
         */
        this.setCurrentlyActiveScreen = function(path) {
            if (typeof path === 'string' && path.length > 0) {
                _currentScreenIdentifier = path;
            } else {
                console.error("Attempted to set an invalid screen identifier.");
            }
        };

        // Execute the provided startup routine asynchronously to ensure
        // the constructor fully completes before external logic begins.
        if (typeof startupRoutine === 'function') {
            Promise.resolve().then(startupRoutine);
        }
    };

    /**
     * Manages the presentation logic, responsible for rendering different views
     * based on the application's state.
     * @param {AppFramework.ApplicationContext} appContextRef - A reference to the main application context.
     */
    AppFramework.UserInterfacePresenter = function(appContextRef) {
        // Ensure a valid application context is provided. This is a crucial dependency.
        if (!(appContextRef instanceof AppFramework.ApplicationContext)) {
            throw new Error("UserInterfacePresenter requires a valid ApplicationContext instance for proper operation.");
        }
        const appState = appContextRef; // Alias for clarity.

        /**
         * Displays a specified view or template to the user.
         * @param {string} viewPath - The path or identifier of the view to be rendered.
         */
        this.presentView = function(viewPath) {
            // Simulate the process of loading and displaying a view.
            // In a real application, this would involve fetching HTML,
            // processing data, and updating the DOM.
            console.log(`Presenting UI view: '${viewPath}' (using locale: ${appState.getLocale()})`);
            appState.setCurrentlyActiveScreen(viewPath);
        };
    };

    // --- Main Application Initialization Sequence ---

    // Instantiate the primary application controller, providing a callback
    // that defines the application's initial setup and event handling.
    let systemCore = new AppFramework.ApplicationContext(function() {
        // Once the application context is ready, initialize the UI presentation layer.
        const uiPresenter = new AppFramework.UserInterfacePresenter(systemCore);

        // --- Helper function for language switching ---
        // This abstracts the common steps involved when a user changes the language.
        const updateApplicationLanguage = (targetLocale) => {
            systemCore.setLocale(targetLocale);          // Update the core application's language setting.
            systemCore.reinitializeDisplay();            // Trigger a full UI refresh.
            uiPresenter.presentView(systemCore.getCurrentlyActiveScreen()); // Re-render the current view with the new locale.
        };

        // --- Initial User Interface Rendering ---
        // The application begins by showing the primary authentication interface.
        uiPresenter.presentView("public/login_view.html");
        // Note: The original 'public/language.html' render has been omitted here.
        // This is a Type III change, assuming language selection is now integrated
        // into the login view or handled through the dedicated buttons below.

        // --- Setup Event Handlers for Language Selection Elements ---
        // Using more descriptive IDs for clarity and potential CSS styling.
        const germanLanguageButton = document.querySelector("#set-locale-german");
        const englishLanguageButton = document.querySelector("#set-locale-english");

        // Attach event listeners with robust checks to ensure elements exist.
        if (germanLanguageButton) {
            germanLanguageButton.addEventListener("click", function(event) {
                // Prevent default actions that might interfere with the UI update.
                event.preventDefault();
                updateApplicationLanguage("de");
            });
            console.debug("Event listener attached for German language selection.");
        } else {
            console.warn("German language selection button (#set-locale-german) was not found in the DOM.");
        }

        if (englishLanguageButton) {
            englishLanguageButton.addEventListener("click", function(event) {
                event.preventDefault();
                updateApplicationLanguage("en");
            });
            console.debug("Event listener attached for English language selection.");
        } else {
            console.warn("English language selection button (#set-locale-english) was not found in the DOM.");
        }
    });

    // Optionally, expose the core application instance for debugging or external API integration.
    // This is an additional fragment for extensibility or testing purposes.
    // window.AppSystemCoreInstance = systemCore;

})();