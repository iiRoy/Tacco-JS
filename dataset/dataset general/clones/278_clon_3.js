/*
 * This module is responsible for initializing core application configurations and
 * managing external library dependencies to prevent global namespace collisions.
 * It establishes a central registry for crucial components, ensuring robust
 * integration within a potentially complex web environment.
 */
(function() {
    // Define the primary container for application-wide settings and references.
    // This object will serve as a namespace for various utilities and frameworks.
    let systemRootConfiguration;

    /**
     * A utility function to safely retrieve and validate a global dependency.
     * This helps in gracefully handling cases where an expected library might not be loaded.
     * @param {string} dependencyName - The human-readable name of the dependency.
     * @param {object | undefined} globalReference - The actual global reference to the dependency (e.g., window.jQuery).
     * @returns {object | null} The validated dependency object, or null if it's missing.
     */
    const validateExternalResource = (dependencyName, globalReference) => {
        if (typeof globalReference === 'undefined' || globalReference === null) {
            console.warn(`[Dependency Manager]: Warning! The essential resource "${dependencyName}" was not found. Functionality may be limited.`);
            // In a production environment, one might throw an error or return a lightweight mock.
            return null;
        }
        return globalReference;
    };

    // Initialize the main configuration object with foundational properties.
    systemRootConfiguration = {
        // A unique version identifier for this specific configuration schema.
        // Useful for internal tracking and debugging across deployments.
        "configurationSchemaVersion": "2024.1.0-beta",

        // This section handles the integration of the DOM manipulation framework.
        // It's crucial to manage its global presence to avoid conflicts with other libraries
        // that might use similar global identifiers (like '$').
        "domFrameworkAdapter": (function() {
            // First, obtain a reference to the global jQuery object, if it exists.
            const globalJQueryReference = validateExternalResource('jQuery Library', window.jQuery);

            if (globalJQueryReference) {
                // Execute jQuery's noConflict mode.
                // Passing 'true' ensures that both 'jQuery' and '$' global variables
                // are relinquished, returning control to any previously defined versions.
                const isolatedJQueryInstance = globalJQueryReference.noConflict(true);
                console.info("[Dependency Manager]: Successfully isolated jQuery instance for internal use.");
                return isolatedJQueryInstance;
            } else {
                console.error("[Dependency Manager]: Critical error: jQuery library could not be loaded or isolated. DOM manipulation features will be unavailable.");
                // Return a fallback object with minimal interface to prevent runtime errors.
                return {
                    version: 'unavailable',
                    fn: {}, // Mock .fn object to prevent errors if methods are called
                    ready: (cb) => { console.warn("jQuery not available, cannot execute 'ready' callback."); if (typeof cb === 'function') setTimeout(cb, 0); } // Basic mock ready
                };
            }
        })(), // This self-executing function immediately configures and returns the framework adapter.

        // A flag indicating the operational mode of the application.
        // This can influence logging, error reporting, and feature availability.
        "operationalMode": "development" // Could be 'production', 'staging', etc.
    };

    // Expose the entire application configuration object to the global scope.
    // Using a distinct, less common global name ('appCoreRegistry') minimizes the chance
    // of clashing with other scripts that might define global variables.
    window.appCoreRegistry = systemRootConfiguration;

    // End of the Immediately Invoked Function Expression (IIFE)
    // This encapsulates all variables and functions defined within, preventing them
    // from polluting the global namespace directly, except for the explicitly exposed 'appCoreRegistry'.
})();