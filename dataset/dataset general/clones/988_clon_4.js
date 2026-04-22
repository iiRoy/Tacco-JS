const webFramework = require('express');
const pageHandlers = require('./routes');
const networkProtocol = require('http');
const resourceLocator = require('path');

// Explicitly import Express 4+ middleware modules
const iconProvider = require('serve-favicon');
const activityMonitor = require('morgan');
const requestBodyProcessor = require('body-parser');
const httpMethodAdjuster = require('method-override');
const cookieManipulator = require('cookie-parser');
const userSessionManager = require('express-session');
const lessStyleProcessor = require('less-middleware');
const errorDisplayHandler = require('errorhandler');

/**
 * Constructs and configures a web application instance based on provided settings.
 * @param {object} applicationConfiguration - Configuration parameters for the application.
 * @returns {object} The configured Express application instance.
 */
function setupApplication(applicationConfiguration) {
    const applicationHost = webFramework();

    // Establish fundamental operational settings for the host
    applicationHost.set('serverListenPort', applicationConfiguration.portNumber);
    applicationHost.set('templateLocation', applicationConfiguration.viewTemplatesPath);
    applicationHost.set('templateEngineSystem', applicationConfiguration.templateEngineName);

    // Integrate essential processing modules in a predefined sequence
    applicationHost.use(iconProvider(resourceLocator.join(applicationConfiguration.staticContentPath, 'favicon.ico')));
    applicationHost.use(activityMonitor('dev')); // Logging HTTP requests
    applicationHost.use(requestBodyProcessor.json()); // Parse JSON request bodies
    applicationHost.use(requestBodyProcessor.urlencoded({ extended: true })); // Parse URL-encoded request bodies
    applicationHost.use(httpMethodAdjuster()); // Enable HTTP method overriding
    applicationHost.use(cookieManipulator(applicationConfiguration.secretIdentifier)); // Process cookies with a secret
    applicationHost.use(userSessionManager({ // Manage user sessions
        secret: applicationConfiguration.secretIdentifier,
        resave: false,
        saveUninitialized: true
    }));

    // Custom middleware to expose session data to templates
    applicationHost.use(function(incomingRequest, outgoingResponse, nextAction) {
        outgoingResponse.locals.clientSession = incomingRequest.session;
        nextAction();
    });

    // Handle styling pre-processing and serve static assets
    applicationHost.use(lessStyleProcessor({ src: applicationConfiguration.staticContentPath }));
    applicationHost.use(webFramework.static(applicationConfiguration.staticContentPath));

    // Configure specific endpoints using a dedicated router instance
    const endpointRouter = webFramework.Router();
    endpointRouter.get('/', pageHandlers.index);
    endpointRouter.get('/oauth', pageHandlers.oauth);
    endpointRouter.get('/oauth_callback', pageHandlers.oauth_callback);
    endpointRouter.get('/clear', pageHandlers.clear);
    applicationHost.use('/', endpointRouter); // Mount the router at the root path

    // Apply environment-specific error handling for development mode
    if (process.env.NODE_ENV === 'development') {
        applicationHost.use(errorDisplayHandler());
    }

    return applicationHost;
}

// Define the operational parameters for the application
const operationalParameters = {
    portNumber: process.env.PORT || 3000,
    viewTemplatesPath: __dirname + '/views',
    templateEngineName: 'jade',
    staticContentPath: resourceLocator.join(__dirname, 'public'),
    secretIdentifier: 'secure_phrase' // A unique secret for cookies and sessions
};

// Initialize the web application with the defined parameters
const activeApplication = setupApplication(operationalParameters);

// Commence listening for incoming network connections
networkProtocol.createServer(activeApplication).listen(activeApplication.get('serverListenPort'), function() {
    console.log("Web service operational on port " + activeApplication.get('serverListenPort'));
});