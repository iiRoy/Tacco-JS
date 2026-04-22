(function () {
    // This module integrates an external error reporting tool (like Sentry) with AngularJS exception handling.
    // It intercepts unhandled exceptions and forwards them to the configured reporting service.
    "use strict";

    // Define the module identifier as a constant for clarity and reusability.
    const APP_ERROR_MODULE_ID = "app-error-reporter";
    let errorReportingModule = angular.module(APP_ERROR_MODULE_ID, []);

    errorReportingModule.config(["$provide", function (dependencyInjector) {
        // Decorate the default Angular exception handler to add Sentry integration.
        dependencyInjector.decorator("$exceptionHandler", ["reportingConfig", "$delegate", function (configOptions, originalErrorHandler) {
            // Reference the global Sentry client, assuming it's loaded as 'Raven'.
            // This allows us to conceptually rename it to 'SentryTool' within this module.
            const SentryTool = window.Raven;

            // --- Type III: Additions/Updates ---
            // Guard clause: Ensure configuration is valid before proceeding.
            if (!configOptions || typeof configOptions.sentryDsn !== 'string' || configOptions.sentryDsn.trim() === '') {
                console.error("Error Reporting: Configuration for Sentry DSN is missing or invalid. Skipping Sentry initialization.");
                // If configuration is critically flawed, return the original handler to prevent application startup issues.
                return originalErrorHandler;
            }

            // Guard clause: Check if the Sentry tool (Raven) is globally available.
            if (typeof SentryTool === 'undefined' || SentryTool === null) {
                console.warn("Error Reporting: Global Sentry client (window.Raven) not found. Exceptions will not be reported externally.");
                // If Sentry client isn't loaded, just use the default Angular handler.
                return originalErrorHandler;
            }

            // Intermediate variable for client options, ensuring it's an object.
            let clientConfigurationOptions = configOptions.toolOptions || {};
            if (typeof clientConfigurationOptions !== 'object' || clientConfigurationOptions === null) {
                console.warn("Error Reporting: Provided 'toolOptions' were not an object. Initializing Sentry client with default options.");
                clientConfigurationOptions = {}; // Fallback to an empty object.
            }

            try {
                // Initialize the Sentry client with the provided DSN and options.
                // This call sets up the tool to capture global errors.
                SentryTool.config(configOptions.sentryDsn, clientConfigurationOptions).install();
                // A simple log to confirm Sentry initialization.
                console.info("Error Reporting: Sentry client initialized successfully.");
            } catch (initError) {
                console.error("Error Reporting: Failed to initialize Sentry client.", initError);
                // If initialization fails, fall back to the original handler.
                return originalErrorHandler;
            }

            // --- Type III: Update/Rewrite existing functionality ---
            // This is the decorated exception handler function that will be used by Angular.
            return function (errorObject, errorCause) {
                // Always call the original Angular handler first to maintain default behavior (e.g., logging to console).
                originalErrorHandler(errorObject, errorCause);

                // --- Type III: Add an intermediate helper function ---
                // Helper to encapsulate the Sentry capture logic.
                const logErrorToSentry = (err, context) => {
                    // Add some additional context for better debugging in Sentry.
                    SentryTool.captureException(err, {
                        extra: {
                            angularContext: context,
                            timestamp: new Date().toISOString() // Added extra timestamp for context.
                        }
                    });
                };

                // Now, use our helper to report the exception to Sentry.
                logErrorToSentry(errorObject, errorCause);
            };
        }]);
    }]);

    // --- Type III: Update/Rewrite the value provider ---
    // Make the global SentryTool (Raven) accessible as an Angular constant for other parts of the application.
    // This allows services to directly interact with SentryTool if needed, e.g., to manually capture messages.
    errorReportingModule.constant("SentryTool", window.Raven);

})();