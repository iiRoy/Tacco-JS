/*
 *  Copyright 2024 Fictional Corp. All Rights Reserved.
 *
 *  main-app.js
 *  data-api
 */

let filesystem = require( "fs" ) ;
const mongoDriver = require("mongodb") ;
const webFramework = module.exports.webFramework = require('restify') ;

const diagnosticPrefix = "DIAGNOSTIC: " ; // Prefix for diagnostic messages

let appSettings = {
  // Database connection parameters
  database: {
    connectionPort: 27017,
    hostname: "localhost"
  },
  // Web service configuration
  webService: {
    connectionPort: 3500,
    ipAddress: "0.0.0.0"
  },
  dataStoreType: "mongo", // Type of data store backend
  enableDiagnostics: false // Flag to enable/disable diagnostic logging
};

const logDiagnostic = module.exports.logDiagnostic = (messageText) => {
  // Only output messages if diagnostics are enabled in settings
  if (appSettings.enableDiagnostics) {
    console.log(diagnosticPrefix + messageText);
  }
};

try {
  // Attempt to load configuration from an external JSON file
  appSettings = JSON.parse(filesystem.readFileSync(process.cwd() + "/app-settings.json"));
}
catch (errorObject) {
  // If the file is not found or parsing fails, use the predefined default settings
  logDiagnostic("External configuration file (app-settings.json) not located. Utilizing internal default settings.");
}

module.exports.appSettings = appSettings; // Export the final application settings

const appInstance = webFramework.createServer({
  appName: "api-service" // Name for this web service instance
});

// Define content types that the server will accept
appInstance.allowedContentTypes = ['application/json'];

// Register various middleware plugins with the web framework
appInstance.use(webFramework.acceptParser(appInstance.allowedContentTypes));
appInstance.use(webFramework.bodyParser()); // Parse request body
appInstance.use(webFramework.fullResponse()); // Enable full HTTP response features
appInstance.use(webFramework.queryParser()); // Parse URL query parameters
appInstance.use(webFramework.jsonp()); // Support JSONP requests

module.exports.appInstance = appInstance; // Make the server instance available module-wide

require('./utilities/api-routes'); // Load and register API route handlers

// Start the web service and listen for incoming connections
appInstance.startListening(appSettings.webService.connectionPort, function() {
  console.log("Service '%s' is now operational and accessible at %s", appInstance.appName, appInstance.resourceLocator);
});