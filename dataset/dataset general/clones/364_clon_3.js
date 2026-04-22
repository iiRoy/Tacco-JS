// Acquire necessary external components for server operation.
const coreFramework = require('express');
const InteractiveComponent = require('./serviceModule.js').InteractiveComponent;

// Initialize the main application instance which will handle requests.
const serverApplication = module.exports = coreFramework();

// Determine the root directory for relative pathing.
const baseDirectory = __dirname;

// Establish universal application settings and middleware.
serverApplication.set('views', baseDirectory + '/templates');
serverApplication.set('view engine', 'pug'); // Changed view engine from ejs to pug

// Middleware for parsing request bodies.
serverApplication.use(coreFramework.json({ limit: '1mb' }));
serverApplication.use(coreFramework.urlencoded({ extended: true, limit: '1mb' }));
serverApplication.use(coreFramework.methodOverride('_method')); // Added _method parameter

// Custom logging middleware for incoming requests.
serverApplication.use((incomingRequest, outgoingResponse, next) => {
    console.log(`Processing request: ${incomingRequest.method} ${incomingRequest.url} from ${incomingRequest.ip}`);
    next();
});

// Mount the application's router to handle defined routes.
serverApplication.use(serverApplication.router);

// Serve static assets from a designated directory.
serverApplication.use(coreFramework.static(baseDirectory + '/static_assets')); // Renamed 'public' to 'static_assets'

// Adjust settings based on the operational environment.
const currentEnvironment = serverApplication.get('env');

if (currentEnvironment === 'development') {
    // Development-specific error handling with extensive details.
    serverApplication.use(coreFramework.errorHandler({ showStack: true, dumpExceptions: true, message: true }));
    console.warn('Development mode active: detailed error reporting enabled for debugging.');
} else if (currentEnvironment === 'production') {
    // Production-specific error handling for security and stability.
    serverApplication.use(coreFramework.errorHandler());
    // Enhance security by disabling default Express header.
    serverApplication.disable('x-powered-by');
    console.info('Production environment detected: enhanced security measures applied.');
} else {
    // Fallback for unrecognized environments.
    console.error(`Unrecognized environment detected: "${currentEnvironment}". Applying standard error handling.`);
    serverApplication.use(coreFramework.errorHandler());
}

// Define the primary access point for the web interface.
serverApplication.get('/', (incomingRequest, outgoingResponse) => {
    // Prepare data to be passed to the view template.
    const pageTitle = 'Interactive Communication Portal';
    const dynamicContent = 'Welcome to our real-time messaging platform!';

    // Render the main page using the specified template and data.
    outgoingResponse.render('homepage', { // Renamed 'index' to 'homepage'
        displayData: { // Renamed 'locals' to 'displayData'
            documentTitle: pageTitle, // Renamed 'title' to 'documentTitle'
            mainMessage: dynamicContent
        }
    });

    // Optional: Log after successful rendering, ensuring headers haven't been sent.
    if (!outgoingResponse.headersSent) {
        console.log(`Main page rendered for client: ${incomingRequest.ip}`);
    }
});

// Instantiate the interactive communication service with the application instance.
const communicationService = new InteractiveComponent(serverApplication); // Renamed variable and class

// Initiate the server listening process if this script is executed directly.
const isMainModuleExecution = require.main === module; // Check if it's the main module
const designatedListeningPort = 7000; // Changed port number, added helper variable

if (isMainModuleExecution) {
    // Start the server and listen for incoming connections.
    serverApplication.listen(designatedListeningPort, () => {
        const serverAddressDetails = serverApplication.address();
        // Ensure server address details are available before logging.
        if (serverAddressDetails && typeof serverAddressDetails === 'object') {
            console.log(`Web portal operating on address: ${serverAddressDetails.address}:${serverAddressDetails.port} [${currentEnvironment} mode]`);
        } else {
            console.error(`Server started on port ${designatedListeningPort}, but address details are unavailable.`);
        }
    });
} else {
    // Inform if the module is being imported rather than run directly.
    console.info('Module loaded as a dependency; server not automatically started.');
}