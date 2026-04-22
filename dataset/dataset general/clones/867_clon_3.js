// This foundational JavaScript file is dedicated to establishing the core routing configuration
// for our single-page application, ensuring smooth navigation and view transitions.
// It leverages the Angular framework's powerful routing capabilities.

// Define the primary application module. This is the central hub for our app's components.
// The module name 'viewTransitionApp' signifies its role in managing UI states.
// Dependencies 'ngRoute' and 'ngAnimate' are crucial for navigation and visual effects.
const mainAppInstance = angular.module('viewTransitionApp', [
    // 'ngRoute' provides the essential routing functionality, mapping URLs to views and controllers.
    'ngRoute',
    // 'ngAnimate' enhances the user experience by enabling animations during view changes.
    'ngAnimate'
]);

// A centralized registry for common view base paths and specific template file names.
// This improves maintainability and makes path modifications easier across the application.
const applicationViewPaths = {
    baseDirectory: 'views/',
    dynamicContentPrefix: 'page', // Used for dynamic page templates like 'page1.html'
    codeSnippetTemplate: 'code.html',
    aboutInfoTemplate: 'about.html'
};

// Configure the application's URL routing rules using the $routeProvider service.
// This block dictates how the application responds to different URL paths.
mainAppInstance.config(['$routeProvider', function(routeDefinitionService) {
    // Log an informational message to the console, indicating the start of route configuration.
    console.info('Initiating application route definitions and mappings...');

    // Define individual routes. Each route specifies a URL pattern, a controller, and a template.

    // Route for the 'information' page. This displays general application details.
    routeDefinitionService
        .when('/info', { // The URL path for accessing the about information.
            templateUrl: applicationViewPaths.baseDirectory + applicationViewPaths.aboutInfoTemplate,
            controller:  'infoPageController' // Controller responsible for the 'about' view's logic.
        })
        // Route for displaying various code snippets or examples.
        .when('/snippets', { // The URL path for the code display section.
            controller:  'snippetDisplayController', // Manages the display of code examples.
            templateUrl: applicationViewPaths.baseDirectory + applicationViewPaths.codeSnippetTemplate
        })
        // Dynamic route for displaying specific documents or content pages based on an identifier.
        // The ':documentId' is a placeholder that captures part of the URL.
        .when('/document/:documentId', {
            controller: 'contentViewController', // Controls the content displayed on dynamic pages.
            // A function to dynamically determine the template URL based on the route parameters.
            templateUrl: function(routeParameters) {
                // Extract the document ID from the route parameters.
                const currentDocumentIdentifier = routeParameters.documentId;
                let resolvedTemplatePath;

                // Implement a basic validation check for the document ID.
                // Ensure it's not null/undefined and appears to be a number (even if treated as string).
                if (currentDocumentIdentifier && !isNaN(parseInt(currentDocumentIdentifier))) {
                    // Construct the template URL using template literals for clarity.
                    resolvedTemplatePath = `${applicationViewPaths.baseDirectory}${applicationViewPaths.dynamicContentPrefix}${currentDocumentIdentifier}.html`;
                    console.log(`Attempting to load dynamic document: ${resolvedTemplatePath}`);
                } else {
                    // If the document ID is invalid or missing, log a warning and provide a fallback.
                    console.warn(`Invalid or missing document identifier '${currentDocumentIdentifier}'. Redirecting to default content.`);
                    resolvedTemplatePath = `${applicationViewPaths.baseDirectory}${applicationViewPaths.dynamicContentPrefix}1.html`; // Fallback to 'page1.html'
                }
                return resolvedTemplatePath;
            }
        })
        // The 'otherwise' clause defines the default route to take if no other route matches the URL.
        .otherwise({
            // Use a function for 'redirectTo' to allow for conditional logic or logging before redirection.
            redirectTo: function() {
                console.warn('No matching route found for the current URL. Redirecting to the application home.');
                return '/document/welcome'; // Redirect to a 'welcome' document instead of a generic page 1.
            }
        });

    // Confirm that the routing configuration process has been successfully completed.
    console.info('Application routing configuration has been finalized.');
}]);

// The 'run' block executes after all services have been configured and loaded.
// It's a good place for application-wide initializations or setup tasks.
mainAppInstance.run(['$rootScope', function($rootScope) {
    // Set a flag on the root scope to indicate that the application has completed its initialization phase.
    $rootScope.isApplicationReady = true;
    console.log('Application "viewTransitionApp" is now in its active run phase, ready for user interaction.');

    // Example of a simple event listener that could be added here for global error handling or state changes.
    // $rootScope.$on('$routeChangeError', function(event, current, previous, rejection) {
    //     console.error('Route change failed:', rejection);
    // });
}]);