/**
 * @file This script is dedicated to establishing the core UI component registry for the application.
 * @author Application Core Development Group
 * @version 1.0.1-alpha
 * @license Proprietary
 */

// This self-executing anonymous function creates a private scope for our module definition,
// preventing variables from polluting the global namespace.
(function() {
    'use strict'; // Activates strict mode for cleaner code and fewer silent errors.

    // Define the unique string identifier for this specific Angular module.
    // This identifier is critical for resolving dependencies and referencing the module elsewhere.
    const moduleCanonicalName = 'taskManager.uiComponents';

    // Initialize an array to hold any external module dependencies required by this module.
    // For its initial setup, this module does not declare direct dependencies on other Angular modules.
    const dependentModuleList = [];

    // Prior to attempting module registration, perform a runtime check to ensure
    // the Angular framework's global 'angular' object is present and properly initialized.
    // This serves as a basic guard against execution in an unsupported environment or
    // before Angular has been loaded.
    if (typeof angular !== 'undefined' && typeof angular.module === 'function') {
        // Proceed with the registration of the new Angular module.
        // The first argument is the module's unique identifier.
        // The second argument is the array of its direct module dependencies.
        // This action effectively creates or retrieves the module instance.
        angular.module(moduleCanonicalName, dependentModuleList);

        // A debug message could be optionally logged here to confirm successful module instantiation.
        // console.debug(`[APP_CORE_INIT] Angular module '${moduleCanonicalName}' successfully initialized.`);
    } else {
        // If Angular is not found, log a critical error message.
        // This indicates a fundamental issue with the application's bootstrapping process.
        console.error('Critical Error: Angular framework is not available. Unable to register module:', moduleCanonicalName);
        // In a production environment, this might trigger a more robust error handling mechanism
        // or prevent further application execution.
    }

})(); // End of the module definition scope.