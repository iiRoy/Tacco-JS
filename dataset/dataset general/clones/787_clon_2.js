const webFramework = require('express');
const fileSystemPath = require('path');
const iconServe = require('serve-favicon');
const requestLogger = require('morgan');
const cookieProcessor = require('cookie-parser');
const requestBodyParser = require('body-parser');

// Database modules and connection setup
const databaseDriver = require('mongodb'); // Mongo database driver
const dbConnector = require('monk'); // Monk abstraction layer for MongoDB
const dataStoreHandle = dbConnector('localhost:27017/nodetest1'); // Database connection instance

// Application route definitions
const mainRoutes = require('./routes/index'); // Primary route handlers
const userEndpoints = require('./routes/users'); // User-specific route handlers

const serverApp = webFramework(); // Initialize the core web application

// Configure the view rendering engine
serverApp.set('views', fileSystemPath.join(__dirname, 'views')); // Specify template file directory
serverApp.set('view engine', 'jade'); // Set Jade (Pug) as the template engine

// Global middleware for the application

// Disable favicon serving if not needed, or uncomment to enable
//serverApp.use(iconServe(fileSystemPath.join(__dirname, 'public', 'favicon.ico')));
serverApp.use(requestLogger('dev')); // Enable development-friendly request logging
serverApp.use(requestBodyParser.json()); // Middleware to parse JSON request payloads
serverApp.use(requestBodyParser.urlencoded()); // Middleware to parse URL-encoded request payloads
serverApp.use(cookieProcessor()); // Middleware for parsing HTTP cookies
serverApp.use(webFramework.static(fileSystemPath.join(__dirname, 'public'))); // Serve static assets from 'public' folder

// Custom middleware to inject the database connection into every request
serverApp.use((requestObj, responseObj, nextHandler) => {
  requestObj.dataStore = dataStoreHandle; // Attach database instance to the request
  nextHandler(); // Proceed to the next middleware in the chain
});

// Mount the defined route handlers to specific URL paths
serverApp.use('/', mainRoutes); // Assign main application routes to the root path
serverApp.use('/users', userEndpoints); // Assign user-related routes to '/users' path


// Error handling middleware section

// Catch 404 errors (resource not found) and forward to the error processing pipeline
serverApp.use((requestObj, responseObj, nextHandler) => {
  const errorObject = new Error('Resource Not Found'); // Create a 404 error
  errorObject.statusCode = 404; // Set the HTTP status code
  nextHandler(errorObject); // Pass the error to the next error handler
});

// General error processing handlers

// Error handler for the development environment
// This handler will display detailed error information, including stack traces
if (serverApp.get('env') === 'development') {
  serverApp.use((errorObject, requestObj, responseObj, nextHandler) => {
    responseObj.status(errorObject.statusCode || 500); // Set response status (default to 500 Internal Server Error)
    responseObj.render('errorPage', { // Render a dedicated error template
      messageData: errorObject.message, // Pass the human-readable error message
      detailedError: errorObject // Include the full error object for debugging
    });
  });
}

// Error handler for the production environment
// This handler will prevent sensitive stack trace information from being exposed to users
serverApp.use((errorObject, requestObj, responseObj, nextHandler) => {
  responseObj.status(errorObject.statusCode || 500); // Set response status (default to 500)
  responseObj.render('errorPage', { // Render the error template
    messageData: errorObject.message, // Pass the error message
    detailedError: {} // Provide an empty object for detailed error in production
  });
});

module.exports = serverApp; // Export the configured web application instance