// Essential external modules and internal components for the application's operation.
const webFramework = require('express');
const applicationRouteHandlers = require('./routes'); // Renamed 'routes' to 'applicationRouteHandlers'
const coreHttpModule = require('http'); // Renamed 'http' to 'coreHttpModule'
const fileSystemPathUtils = require('path'); // Renamed 'path' to 'fileSystemPathUtils'
const appConfiguration = require('./config'); // Renamed 'config' to 'appConfiguration'

// Establish the root directory for relative path computations.
const currentSystemDirectory = __dirname;

// Initialize the primary web application instance.
const mainApplicationInstance = webFramework(); // Renamed 'app' to 'mainApplicationInstance'

// Configure core application settings and middleware stack.
// The original `app.configure` is an older Express pattern. We adapt this to direct calls
// and a self-executing function for better scope management.
(function setupApplicationEnvironment() {
    // Determine the port for the server to listen on.
    // Prioritizes environment variable, then application config, then a default.
    const serverListenPort = process.env.PORT || appConfiguration.port || 3000;
    if (typeof serverListenPort !== 'number' || serverListenPort <= 0) {
        console.error("FATAL: Invalid or missing server port definition. Application cannot start.");
        process.exit(1); // Guard clause: Terminate if port is invalid.
    }
    mainApplicationInstance.set('serverListenPort', serverListenPort); // Renamed 'port' to 'serverListenPort'
    mainApplicationInstance.set('templateRenderDirectory', fileSystemPathUtils.join(currentSystemDirectory, 'views')); // Renamed 'views' and used path.join
    mainApplicationInstance.set('view engine', 'hjs'); // The templating engine remains 'hjs'.

    // Enable additional Express features for routing robustness.
    mainApplicationInstance.enable('case sensitive routing'); // Added new setting
    mainApplicationInstance.enable('strict routing'); // Added new setting

    // Define the sequence of middleware functions.
    // The original `express.favicon()` is removed as it's often handled by static files or not needed.
    mainApplicationInstance.use(webFramework.logger('dev')); // Kept logger, renamed `express` prefix
    mainApplicationInstance.use(webFramework.json()); // Replaced `express.bodyParser()` with modern `express.json()`
    mainApplicationInstance.use(webFramework.urlencoded({ extended: true })); // Added `express.urlencoded()` for form data
    mainApplicationInstance.use(webFramework.methodOverride());

    // Introduce a custom middleware for setting a response header.
    mainApplicationInstance.use((req, res, next) => {
        res.setHeader('X-Application-Service', 'Node.js/Express-CustomApp'); // Added custom header
        next();
    });

    // Explicitly mount the router middleware.
    mainApplicationInstance.use(mainApplicationInstance.router);

    // Define the path for static assets.
    const staticContentDirectory = fileSystemPathUtils.join(currentSystemDirectory, 'public'); // Helper variable

    // Conditional LESS compilation for development environments.
    const currentOperatingEnvironment = mainApplicationInstance.get('env');
    if (currentOperatingEnvironment === 'development') {
        mainApplicationInstance.use(require('less-middleware')({
            src: staticContentDirectory,
            dest: staticContentDirectory,
            force: true, // Force recompile in dev
            debug: true // Enable debug output for less
        }));
        console.log("LESS middleware configured for development mode.");
    }

    // Serve static files from the public directory.
    mainApplicationInstance.use(webFramework.static(staticContentDirectory));

})(); // End of self-executing configuration function.

// Environment-specific error handling.
const currentAppEnv = mainApplicationInstance.get('env');
if (currentAppEnv === 'development') {
    // Detailed error handling for development.
    mainApplicationInstance.use(webFramework.errorHandler({ dumpExceptions: true, showStack: true })); // Added options
    console.warn("Application is operating in 'development' mode with verbose error reports.");
} else if (currentAppEnv === 'production') {
    // Simplified error handling for production, and disabling sensitive headers.
    mainApplicationInstance.disable('x-powered-by'); // New fragment: disable X-Powered-By in production
    console.info("Application is running in 'production' mode. Error handling is minimized.");
    // Could add more production specific middleware here, e.g., a custom error page renderer.
}

// Define the application's routing endpoints.
mainApplicationInstance.get('/', applicationRouteHandlers.homePage); // Renamed 'routes.index' to 'applicationRouteHandlers.homePage'
mainApplicationInstance.get('/user/dashboard', applicationRouteHandlers.userDashboard); // Renamed '/signed' to '/user/dashboard' and 'routes.signed'
mainApplicationInstance.get('/info', (requestObject, responseObject) => { // Added a new route with an inline handler
    responseObject.render('about', { pageTitle: 'Information Hub' }); // Render a new template
});

// Start the HTTP server and begin listening for incoming requests.
const activeListeningPort = mainApplicationInstance.get('serverListenPort'); // Helper variable for clarity
coreHttpModule.createServer(mainApplicationInstance).listen(activeListeningPort, function serverReadyCallback() { // Renamed 'http.createServer', added named callback function
    const startupConfirmationMessage = `Server has successfully commenced operations on port: ${activeListeningPort}.`; // Intermediate variable for the log message
    console.log(startupConfirmationMessage);
    // console.log(`Access the application via http://localhost:${activeListeningPort}`); // Added an additional helpful log
});