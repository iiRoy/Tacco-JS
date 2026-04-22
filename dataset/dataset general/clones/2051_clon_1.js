'use strict'; // Enforce strict mode for better error handling and cleaner code.


// This is the main application module definition.
// It depends on several other modules, including filters, services, directives,
// a plupload-specific directive, and ui.bootstrap for UI components.
angular.module(
    'myApp',
    [
        'myApp.filters',             // Custom filters for the application.
        'myApp.services',            // Custom services for business logic.
        'myApp.directives',          // Custom directives for reusable UI components.
        'plupload.directive',        // Directive for Plupload functionality.
        'ui.bootstrap'               // Bootstrap UI components.
    ]
)
.config(
    [
        '$routeProvider',              // Angular service for configuring routes.
        'plUploadServiceProvider',     // Provider for Plupload service configuration.
        function(
            $routeProvider,            // Injected route provider.
            plUploadServiceProvider    // Injected Plupload service provider.
        ) {
            // Define application routes.
            $routeProvider.when(
                '/home',
                {
                    templateUrl: 'partials/home.html', // Template for the home view.
                    controller: MyCtrl1                 // Controller for the home view.
                }
            );

            // Configure the default route to redirect to '/home' if no other route matches.
            $routeProvider.otherwise(
                {
                    redirectTo: '/home'
                }
            );

            // Configure Plupload service settings.
            // Set the path to the Flash fallback component for Plupload.
            plUploadServiceProvider.setConfig(
                'flashPath',
                '/dist/plupload.flash.swf'
            );

            // Set the path to the Silverlight fallback component for Plupload.
            plUploadServiceProvider.setConfig(
                'silverLightPath',
                '/dist/plupload.silverlight.xap'
            );

            // Set custom HTTP headers to be sent with Plupload requests.
            plUploadServiceProvider.setConfig(
                'headers',
                {
                    'X-abc': 5 // Example custom header.
                }
            );
        }
    ]
)
.run(
    [
        'plUploadService',             // Injected Plupload service instance.
        function(
            plUploadService            // Reference to the Plupload service.
        ) {
            // This run block can be used for application-wide initialization tasks.
            // For example, setting up global event listeners or pre-loading data.
            // Currently, it is empty but available for future extensions.
        }
    ]
);