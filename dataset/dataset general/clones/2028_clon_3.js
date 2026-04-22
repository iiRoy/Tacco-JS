const webServer = require('express');
const dataServiceModule = require('./modules/data_service'); // Renamed module import and path
const apiApplication = webServer(); // Renamed 'app' to 'apiApplication'

// --- Configuration Constants ---
const LISTEN_PORT = 4100; // Changed port from 3000 to 4100, now a constant
const API_BASE_ROUTE = '/api/v1/items'; // Changed '/cruds' to a more generic and versioned path

// --- Core Middleware Setup (Updated and Expanded) ---

// Replace deprecated bodyParser with modern Express body parsers
apiApplication.use(webServer.json()); // Middleware for parsing JSON request bodies
apiApplication.use(webServer.urlencoded({ extended: true })); // Middleware for parsing URL-encoded request bodies

// --- Custom Middleware Additions (New Fragments) ---

// 1. Request Logging Middleware
apiApplication.use((reqContext, resContext, nextCallback) => {
    // Log details of every incoming HTTP request for debugging and monitoring
    console.log(`[${new Date().toISOString()}] Incoming Request: ${reqContext.method} ${reqContext.originalUrl}`);
    nextCallback(); // Pass control to the next middleware function in the stack
});

// 2. Basic Payload Validation Middleware for creation/update operations
const validateRequestBody = (reqContext, resContext, nextCallback) => {
    // Ensure that POST and PUT requests include a non-empty JSON body
    if ((reqContext.method === 'POST' || reqContext.method === 'PUT') && Object.keys(reqContext.body).length === 0) {
        console.warn(`[Validation Error] Empty body for ${reqContext.method} request to ${reqContext.originalUrl}`);
        return resContext.status(400).json({ status: 'error', message: 'Request body must not be empty.' });
    }
    nextCallback(); // Proceed if validation passes or if method is not POST/PUT
};

// --- API Route Definitions (Renamed and Enhanced) ---

// Root endpoint for service status check (New fragment)
apiApplication.get('/', (reqContext, resContext) => {
    resContext.status(200).send('Welcome to the Item Management API Service!');
});

// Route to retrieve all items
// Original: app.get('/cruds', module.findAll);
apiApplication.get(API_BASE_ROUTE, dataServiceModule.fetchAllRecords); // Renamed path and handler method

// Route to retrieve a single item by its unique identifier
// Original: app.get('/cruds/:id', module.findById);
apiApplication.get(`${API_BASE_ROUTE}/:recordIdentifier`, dataServiceModule.fetchRecordById); // Renamed path parameter and handler method

// Route to create a new item
// Original: app.post('/cruds', module.create);
apiApplication.post(API_BASE_ROUTE, validateRequestBody, dataServiceModule.addNewRecord); // Renamed handler, added validation middleware

// Route to modify an existing item
// Original: app.put('/cruds/:id', module.update);
apiApplication.put(`${API_BASE_ROUTE}/:recordIdentifier`, validateRequestBody, dataServiceModule.modifyExistingRecord); // Renamed handler, added validation middleware

// Route to remove an item
// Original: app.delete('/cruds/:id', module.delete);
apiApplication.delete(`${API_BASE_ROUTE}/:recordIdentifier`, dataServiceModule.removeExistingRecord); // Renamed handler

// --- Global Error Handling Middleware (New Fragment) ---
apiApplication.use((err, reqContext, resContext, nextCallback) => {
    // This catches unhandled errors from previous middleware/route handlers
    console.error(`[GLOBAL ERROR] An unhandled error occurred: ${err.stack}`);
    resContext.status(500).json({ status: 'error', message: 'Internal Server Error. Please try again later.' });
});

// --- Server Initialization ---
apiApplication.listen(LISTEN_PORT, () => {
    // Enhanced console output for server startup, using a constant for the port
    console.info(`\n🚀 Item Management API is now operational and listening on port ${LISTEN_PORT}...`);
    console.info(`Access endpoints at: http://localhost:${LISTEN_PORT}${API_BASE_ROUTE}`);
});