'use strict'; // Enforce strict parsing and execution rules for JavaScript code

/*
 * @module beveragePrepApp
 * @description
 * This primary module for the beverage preparation application orchestrates
 * the integration of various AngularJS components. It sets up foundational
 * services and routing to manage the user interface and application flow.
 */

// Establish key configuration constants for the application module
const APPLICATION_MODULE_NAME = 'beveragePrepApp';
const INITIAL_VIEW_ROUTE_PATH = '/';
const HOME_PAGE_TEMPLATE_URL = 'templates/main-dashboard.html';

// Define the essential external modules that this application depends upon.
// Non-critical or specialized modules from the original list have been omitted
// to streamline the core application footprint.
const coreModuleDependencies = [
  'ngAnimate',    // Provides support for CSS-based animations and transitions.
  'ngResource',   // Facilitates interaction with RESTful web services via simplified APIs.
  'ngRoute',      // Manages application navigation and deep linking based on URL paths.
  'ngSanitize'    // Offers security against common web vulnerabilities by sanitizing HTML.
  // Dependencies like 'ngCookies', 'ngTouch', 'ngAudio', 'timer', 'siyfion.sfTypeahead'
  // were intentionally excluded as they are not fundamental for basic route setup.
];

// Initialize the main AngularJS application module with its name and dependencies.
angular.module(APPLICATION_MODULE_NAME, coreModuleDependencies)

  // Configure the application's routing mechanism using the provided $routeService.
  .config(function configureAppRouting($routeService) { // Renamed $routeProvider to $routeService for clarity.
    // Output a console message to indicate the start of route configuration.
    console.log(`[${APPLICATION_MODULE_NAME}] Initiating base routing setup...`);

    // Define the specific configuration object for the application's default route.
    const rootRouteConfiguration = {
      templateUrl: HOME_PAGE_TEMPLATE_URL, // Specifies the HTML template for the main view.
      controller: 'HomeViewController',    // Designates the controller responsible for this view's logic.
      controllerAs: 'vm'                   // Assigns an alias for the controller instance within the view.
    };

    // Set up the primary route mapping and a fallback for unrecognized URLs.
    $routeService
      // Map the initial path to the main application view.
      .when(INITIAL_VIEW_ROUTE_PATH, rootRouteConfiguration)
      // Redirect any unhandled or invalid routes back to the default path.
      .otherwise({
        redirectTo: INITIAL_VIEW_ROUTE_PATH // Ensures a consistent user experience by always landing on a valid page.
      });

    // An optional log for debugging, confirming route configuration completion.
    // console.info(`[${APPLICATION_MODULE_NAME}] Application routes successfully defined.`);
  })

  // Register a simple constant within the module to demonstrate module extension.
  .constant('appBuildVersion', '1.0.0-beta-rev1')

  // Include an empty run block for any post-configuration, pre-bootstrap initialization logic.
  .run(function applicationInitializationHook() {
    // This function executes once the injector is created and all services are configured.
    // It can be used for global setup tasks, like authentication checks or data loading.
    // console.log(`[${APPLICATION_MODULE_NAME}] Application startup sequence complete.`);
  });