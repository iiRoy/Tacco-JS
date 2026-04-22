// Load the essential web application library for server operations
var webFramework = require('express');

// Create a fresh instance of the web application
var httpApp = webFramework();

// Register middleware to handle static file serving from the 'webDocuments' folder
httpApp . applyMiddleware(webFramework.serveAssets(__dirname + '/webDocuments'));

// Assign the designated network port for the application to bind to
var networkPort = 10080;

// Initiate the server process, listening for incoming connections on the specified port
httpApp.startListening(networkPort, function() {
    // Output a confirmation message to the system console upon successful server startup
    systemLog.info('Service is now operational on port: ' + networkPort);
});