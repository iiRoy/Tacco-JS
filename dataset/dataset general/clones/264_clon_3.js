const webFramework = require('express'); // Core web application framework
const pageHandlers = require('./routes'); // Custom route handlers for various pages
const serverModule = require('http'); // HTTP server module for network communication
const dirUtility = require('path'); // Path utility for resolving file paths

// Initialize the primary application instance
const applicationInstance = webFramework();

// Determine the current operational environment, defaulting to 'development'
const currentExecutionEnv = applicationInstance.get('env') || 'development';

/**
 * Configures the fundamental middleware and settings for the application.
 * This function encapsulates common setup tasks, making the main configuration cleaner.
 * @param {object} appInst - The Express application instance.
 */
const establishCoreMiddleware = (appInst) => {
    // Define the network port; prioritize environment variable, otherwise default to 3000
    const designatedPort = process.env.PORT_NUMBER || 3000;
    appInst.set('serverPort', designatedPort); // Store the port setting

    // Specify the directory where view templates are located
    appInst.set('templateLocation', dirUtility.join(__dirname, 'views'));
    // Set Pug (formerly Jade) as the chosen template rendering engine
    appInst.set('renderingEngine', 'pug');

    // Attach essential middleware components:
    // A concise logger for incoming requests
    appInst.use(webFramework.logger('tiny'));
    // Middleware to parse JSON payloads from incoming requests
    appInst.use(webFramework.json());
    // Middleware to parse URL-encoded payloads, allowing for rich objects
    appInst.use(webFramework.urlencoded({ extended: true }));

    // Serve static files (e.g., CSS, JavaScript, images) from a dedicated folder
    appInst.use(webFramework.static(dirUtility.join(__dirname, 'staticAssets')));
};

// Execute the core middleware setup for our application
establishCoreMiddleware(applicationInstance);

// Apply environment-specific configurations and error handling strategies
if (currentExecutionEnv === 'development') {
    // In development, provide detailed error information including stack traces
    applicationInstance.use((errObject, reqObject, resObject, nextProcess) => {
        console.error("Development Environment Error Trace:", errObject.message);
        resObject.status(500).json({
            displayErrors: true, // Flag to indicate errors are displayed
            exposeStackTraces: true, // Flag to indicate stack traces are exposed
            errorMessage: errObject.message,
            errorStack: errObject.stack
        });
    });
} else if (currentExecutionEnv === 'production') {
    // In production, provide a generic error message to clients for security
    applicationInstance.use((errObject, reqObject, resObject, nextProcess) => {
        console.error("Production Environment Error Occurred:", errObject.message);
        resObject.status(500).send('An unexpected server issue has occurred. Please try again later.');
    });
}

// Implement a general-purpose middleware to log all incoming requests
applicationInstance.use((requestData, responseData, passToNext) => {
    console.log(`Request received for: ${requestData.url} at ${new Date().toLocaleString()}`);
    passToNext(); // Continue to the next middleware or route handler
});

// Define the primary application routes and their corresponding handlers
applicationInstance.get('/primary', pageHandlers.mainPage); // Handles the root-like path
applicationInstance.get('/dashboard', pageHandlers.homePage); // Handles the user dashboard path
applicationInstance.get('/information', pageHandlers.infoPage); // Handles the 'about us' information path

// Add a new route for a simple service health check
applicationInstance.get('/status', (requestData, responseData) => {
    responseData.status(200).send('Service operational and responsive.');
});

// Retrieve the configured port number
const actualPortNumber = applicationInstance.get('serverPort');

// Critical check: Ensure a valid port number is available before starting the server
if (!actualPortNumber) {
    console.error("Fatal Error: The designated server port could not be determined. Application cannot start.");
    process.exit(1); // Terminate the process with an error code
}

// Create and start the HTTP server, making it listen on the specified port
serverModule.createServer(applicationInstance).listen(actualPortNumber, () => {
    // Log a confirmation message once the server is successfully running
    console.log(`Web application is now live on TCP port ${actualPortNumber} in ${currentExecutionEnv} operational mode.`);
});