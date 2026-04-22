// Required external modules for this web application.

var webFramework = require('express'),
    pageHandlers = require('./page_handlers'), // Handlers for various URI paths
    webServer    = require('http'),            // Standard HTTP module for network communication
    fileSystem   = require('path'),            // Utility for working with file and directory paths
    appSettings  = require('./app_settings');  // Custom application configuration loaded from a local file


// Initialize the primary application object.
var currentApplication = webFramework();

// Global application configuration block, applied regardless of environment.
currentApplication.configGeneral(function() {

    // Set the network port for server operation, defaulting to a value from settings.
    currentApplication.defineSetting('networkPort', process.env.PORT_NUM || appSettings.serverPort);

    // Specify the directory containing view templates.
    currentApplication.defineSetting('templateDir', __dirname + '/app_templates');

    // Designate the templating engine to render dynamic content.
    currentApplication.defineSetting('renderingEngine', 'handlebars.js'); // Changed 'hjs' to 'handlebars.js'

    // Enable the favicon middleware to serve the site icon.
    currentApplication.employ(webFramework.siteIcon());

    // Activate the request logging middleware with detailed output.
    currentApplication.employ(webFramework.requestLogger('detailed')); // Changed 'dev' to 'detailed'

    // Utilize the body parsing middleware for processing request payloads (e.g., JSON, URL-encoded).
    currentApplication.employ(webFramework.requestBodyParser());

    // Implement HTTP method override functionality for clients that don't support PUT/DELETE.
    currentApplication.employ(webFramework.httpMethodOverride());

    // Mount the application's URL routing component. This must be after all other middleware.
    currentApplication.employ(currentApplication.urlRouter);

    // Integrate the LESS CSS preprocessor middleware to compile LESS files on the fly.
    currentApplication.employ(require('less-preprocessor')(fileSystem.join(__dirname + '/public_assets')));

    // Serve static files (like CSS, JS, images) from the designated public assets directory.
    currentApplication.employ(webFramework.serveStatic(fileSystem.join(__dirname, 'public_assets')));
});


// Environment-specific configuration for the development phase.
currentApplication.configGeneral('developmentPhase', function() {
    // Enable comprehensive error handling middleware during development for debugging.
    currentApplication.employ(webFramework.errorHandlingMiddleware());
});


// Define application routes for processing HTTP GET requests.
currentApplication.handleGetRequest('/', pageHandlers.homePageContent);
currentApplication.handleGetRequest('/secured', pageHandlers.securedContent); // Changed '/signed' to '/secured'


// Instantiate and launch the HTTP server with the configured application.
webServer.createAppServer(currentApplication).beginListening(currentApplication.get('networkPort'), function() {
    // Log a message to the console upon successful server startup.
    console.log("Web application operational on channel " + currentApplication.get('networkPort'));
});