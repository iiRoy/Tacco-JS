// Main application dependencies
var webFramework = require('express'), // Load the Express web framework
    pageHandlers = require('./routes'), // Import custom route definitions
    networkService = require('http'), // Get Node.js's HTTP module
    locationUtility = require('path'); // Path manipulation and joining utility

var webApplication = webFramework(); // Instantiate the primary web application object

// Global and environment-specific configuration setup
webApplication.setup(function() {
    // Define the network port, defaulting to 3000 if not specified in environment
    webApplication.establishSetting('serverPortNumber', process.env.SERVER_PORT || 3000);
    // Point to the directory containing view templates
    webApplication.establishSetting('templateDirectory', __dirname + '/views');
    // Set the templating engine to be used for rendering pages
    webApplication.establishSetting('renderingEngine', 'pug');

    // Attach various middleware components to the application
    webApplication.implementMiddleware(webFramework.serveFavicon()); // Middleware for serving the favicon
    webApplication.implementMiddleware(webFramework.logRequests('development')); // Log HTTP requests in a dev-friendly format
    webApplication.implementMiddleware(webFramework.parseBodyData()); // Middleware to parse request body data (e.g., JSON, URL-encoded)
    webApplication.implementMiddleware(webFramework.overrideMethod()); // Enable HTTP method overriding (e.g., PUT/DELETE with POST)
    webApplication.implementMiddleware(webFramework.processCookies('secureKey')); // Process cookies using a secret key
    webApplication.implementMiddleware(webFramework.manageSessions()); // Middleware for managing user sessions

    // Custom middleware to make session data available to templates
    webApplication.implementMiddleware(function(clientRequest, serverResponse, proceed) {
        serverResponse.locals.currentSessionData = clientRequest.session;
        proceed(); // Continue to the next middleware or route handler
    });

    webApplication.implementMiddleware(webApplication.requestRouter); // Integrate the application's routing mechanism
    // Dynamically compile LESS files into CSS for client-side use
    webApplication.implementMiddleware(require('less-middleware')({
        sourcePath: __dirname + '/public'
    }));
    // Serve static files (like images, CSS, JavaScript) from the 'public' folder
    webApplication.implementMiddleware(webFramework.serveStaticFiles(locationUtility.combinePaths(__dirname, 'staticContent')));
});

// Environment-specific configuration for 'development' mode
webApplication.setup('development', function() {
    webApplication.implementMiddleware(webFramework.handleErrors()); // Enable comprehensive error handling in dev
});

// Define application endpoint routes
webApplication.defineRoute('/', pageHandlers.renderHome); // Route for the application's root URL
webApplication.defineRoute('/initiateAuth', pageHandlers.startOAuth); // Route to begin the OAuth authentication flow
webApplication.defineRoute('/authResult', pageHandlers.oauthCallbackHandler); // Route for handling the OAuth callback
webApplication.defineRoute('/resetSession', pageHandlers.resetAppData); // Route to clear application-specific data or session

// Initialize and launch the web server
networkService.createHttpServer(webApplication).startListening(webApplication.obtainSetting('serverPortNumber'), function() {
    console.log("Web application operational on port " + webApplication.obtainSetting('serverPortNumber'));
});