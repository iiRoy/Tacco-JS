'use strict';

/*
 * This module orchestrates the primary components of the application.
 * It's responsible for setting up the foundational routing logic
 * and integrating various feature modules.
 */
angular.module('mainApplicationCore', [
    'mainApplicationCore.dataProcessors',    // Provides data filtering and transformation utilities.
    'mainApplicationCore.utilityProviders',  // Offers common application services.
    'mainApplicationCore.interfaceElements'  // Contains reusable UI components and custom directives.
])
.config(['$routeProvider', function configureApplicationRoutes(routeManager) {
    // Log initialization of routing configuration for debugging purposes.
    console.info('Initializing application routing setup...');

    // Define a base path for template files to enhance maintainability.
    const viewTemplateBase = 'app_resources/html_templates/';

    // Specify the default path for redirection if no other route matches.
    const mainDefaultPath = '/dashboard';

    // Configuration object for the primary dashboard view.
    const dashboardRouteOptions = {
        templateUrl: viewTemplateBase + 'dashboard.html',
        controller: 'DashboardViewController' // Renamed controller reference to string for consistency
    };

    // Configuration object for the application settings view.
    const settingsRouteOptions = {
        templateUrl: viewTemplateBase + 'settings.html',
        controller: 'SettingsPanelController' // Renamed controller reference to string
    };

    // --- Route Definitions ---

    // Establish the route for the main dashboard.
    // A quick check to ensure the route manager is available before proceeding.
    if (routeManager && typeof routeManager.when === 'function') {
        routeManager.when('/dashboard', dashboardRouteOptions);
    } else {
        console.error('Route manager not available or invalid for dashboard route.');
    }


    // Establish the route for the user settings interface.
    // We could add more complex validation here if needed, e.g., checking controller existence.
    routeManager.when('/settings', settingsRouteOptions);


    // Define the fallback route for any unhandled URLs.
    // This ensures users are always directed to a known part of the application.
    routeManager.otherwise({
        redirectTo: mainDefaultPath
    });

    console.info('Application routing configuration complete.');
}]);