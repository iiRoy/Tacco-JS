var applicationModuleId = 'project-base-frontend';

// An array to hold initial module dependencies. Currently empty.
var initialDependencies = [];

// This block ensures that the Angular framework is available before attempting
// to create a new module, preventing potential runtime errors.
if (typeof angular === 'undefined' || typeof angular.module !== 'function') {
    console.error("Critical Error: AngularJS framework is not loaded. Cannot proceed with application module initialization.");
    // In a real application, you might want to throw an error or disable functionality.
    // throw new Error("AngularJS framework is a prerequisite for this application.");
} else {
    // Create the primary application module using the defined identifier and dependencies.
    // This module serves as the root for the entire frontend application.
    var coreApplicationModule = angular.module(applicationModuleId, initialDependencies);

    // Expose the newly created application module globally on the window object.
    // This allows other scripts or debugging tools to easily access the main application instance.
    window.mainApplicationInstance = coreApplicationModule;

    // Optional: Log the successful initialization for debugging purposes.
    if (window.mainApplicationInstance === coreApplicationModule) {
        console.info("Application module '" + applicationModuleId + "' successfully initialized and made available globally.");
    } else {
        console.warn("Warning: Reference to the application module on the 'window' object might be inconsistent.");
    }
}