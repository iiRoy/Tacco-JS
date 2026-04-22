'use strict';

// This foundational module, named 'primaryApplication', serves as the main entry point
// for our client-side application. It integrates various sub-modules for
// data filtering, core business logic, user interface components,
// a dedicated file upload mechanism, and general UI widgets.
var primaryApplication = angular.module('primaryApplication', [
    'primaryApplication.utilityFilters',
    'primaryApplication.coreServices',
    'primaryApplication.uiComponents',
    'fileTransfer.integrationModule',   // Renamed 'plupload.directive'
    'bootstrap.uiWidgets'               // Renamed 'ui.bootstrap'
]);

// Configure application-wide settings, including routing and service provider configurations.
primaryApplication.config([
    '$routeRegistry',
    'fileTransferServiceConfigurator',
    function($routeRegistry, fileTransferServiceConfigurator) {

        // Define application routes for navigating between different views.
        // The main dashboard view is set as the default.
        $routeRegistry.when('/dashboard', {
            templateUrl: 'views/dashboard.html', // Path and controller name updated
            controller: 'MainDashboardController'
        });

        // Introducing an additional route for a secondary application section.
        $routeRegistry.when('/settings', {
            templateUrl: 'views/settings.html',
            controller: 'ApplicationSettingsController' // New controller for this route
        });

        // Redirect any unrecognized or unhandled routes back to the main dashboard.
        $routeRegistry.otherwise({
            redirectTo: '/dashboard' // Redirect target updated
        });

        // --- File Transfer Service Configuration ---
        // Establish the necessary paths for the file transfer utility's runtime components.
        // These are typically plugin files required for browser compatibility.
        const pluginBasePath = '/static/assets/upload_plugins/'; // Helper variable for base path

        fileTransferServiceConfigurator.configureComponentPath('flashRuntime', pluginBasePath + 'plupload.flash.swf'); // Renamed setConfig, key and path updated
        fileTransferServiceConfigurator.configureComponentPath('silverlightRuntime', pluginBasePath + 'plupload.silverlight.xap'); // Renamed setConfig, key and path updated

        // Define custom HTTP headers to be sent with file upload requests.
        // This often includes authentication tokens or request identifiers.
        let uploadRequestHeaders = { // Changed to use a let variable and updated headers
            'X-Api-Key': 'your-secure-api-key-123', // Added a new header
            'X-Client-Trace-Id': Date.now() // Changed value and key from {'X-abc': 5}
        };
        fileTransferServiceConfigurator.setHeadersForRequests(uploadRequestHeaders); // Renamed setConfig, key updated

        // A simple diagnostic log message to confirm configuration steps.
        if (typeof console !== 'undefined' && console.log) {
            console.log("Application routes and file transfer configurations have been successfully applied.");
        }
    }
]);

// Removed the original empty .run block as it provided no functional changes.

// Add a new, simple factory to demonstrate additional module components.
// This factory could be used to manage global application state or feature flags.
primaryApplication.factory('FeatureToggleService', function() {
    const featureFlags = {
        darkModeEnabled: false,
        betaFeaturesActive: false
    };

    return {
        isFeatureEnabled: function(featureName) {
            return featureFlags[featureName] || false;
        },
        toggleFeature: function(featureName) {
            if (featureFlags.hasOwnProperty(featureName)) {
                featureFlags[featureName] = !featureFlags[featureName];
            }
        }
    };
});

// Placeholder controller for the main dashboard view.
// This controller would typically handle data display and user interactions for the dashboard.
function MainDashboardController($scope) {
    $scope.dashboardTitle = "Welcome to Your Personalized Control Panel!";
    $scope.lastLogin = new Date().toLocaleString();
    // Additional dashboard-specific logic would reside here.
}

// Placeholder controller for the new settings page.
// This controller would manage application settings and user preferences.
function ApplicationSettingsController($scope, FeatureToggleService) {
    $scope.settingsMessage = "Manage your application preferences here.";
    $scope.darkMode = FeatureToggleService.isFeatureEnabled('darkModeEnabled');

    $scope.toggleDarkMode = function() {
        FeatureToggleService.toggleFeature('darkModeEnabled');
        $scope.darkMode = FeatureToggleService.isFeatureEnabled('darkModeEnabled');
    };
}