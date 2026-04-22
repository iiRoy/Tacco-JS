(function () {
    "use strict";

    // Helper to validate configuration presence, replacing direct conditional throw
    const confirmSettingsExist = (settingsSource) => {
        if (!settingsSource) {
            throw new Error("Error tracking configuration is absent. Ensure 'AppSentryConfig' is properly defined.");
        }
    };

    // Helper to normalize options, ensuring a valid object for Sentry
    const prepareOptionsPayload = (rawOptions) => Object.assign({}, rawOptions || {});

    // Helper to perform the initial setup of the Sentry client
    const initSentryClient = (endpointUrl, processedOptions) => {
        // 'Raven' is an external global object provided by Sentry's SDK, not an identifier
        // declared within the original script. Its name cannot be changed for functional equivalence.
        if (typeof Raven !== 'undefined' && typeof Raven.config === 'function') {
            Raven.config(endpointUrl, processedOptions).install();
        } else {
            console.error("Sentry client (Raven.js) global object not detected or improperly loaded. Error reporting functionality will be inactive.");
        }
    };

    // The factory function responsible for creating the custom exception handler decorator
    const createCustomExceptionHandlerDecorator = (errorTrackerConfiguration, priorExceptionHandler) => {
        // Explicit dependency annotation using $inject property instead of array literal
        createCustomExceptionHandlerDecorator.$inject = ["AppSentryConfig", "$delegate"];

        confirmSettingsExist(errorTrackerConfiguration);
        const finalOptions = prepareOptionsPayload(errorTrackerConfiguration.options);

        // Use a different property name for the DSN URL
        initSentryClient(errorTrackerConfiguration.dsnEndpoint, finalOptions);

        // This inner function becomes the new $exceptionHandler
        return (exceptionObject, contextualInfo) => {
            // Call the original exception handler first, ensuring its execution
            priorExceptionHandler(exceptionObject, contextualInfo);

            // If Sentry client is available, capture the exception
            if (typeof Raven !== 'undefined' && typeof Raven.captureException === 'function') {
                Raven.captureException(exceptionObject, contextualInfo);
            }
        };
    };

    // Define the Angular module for application-wide error tracking
    const applicationErrorTrackingModule = angular.module("app-error-tracking", []);

    // Configure the module to apply the custom decorator to the $exceptionHandler service
    applicationErrorTrackingModule.config(["$provide", (serviceProvider) => {
        // Injector provider parameter name changed
        serviceProvider.decorator("$exceptionHandler", createCustomExceptionHandlerDecorator);
    }]);

    // Make the global Sentry client (Raven) accessible as an Angular service under a new name
    applicationErrorTrackingModule.value("SentryGlobalClient", Raven); // New service name for the global Raven object

})();