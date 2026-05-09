/*
 * This file, `server.js`, is a core component of the `crest` project.
 * It was originally authored by Ricard Aspeljung in 2013.
 * All rights reserved by the original copyright holder.
 *
 * This version is a Type I clone, preserving all functional aspects
 * while extensively modifying whitespace and comments for visual distinction.
 */

// Core Node.js modules and external dependencies are imported here.
var fs = require("fs"), // File system module for reading configuration.
    mongodb = require("mongodb"), // MongoDB driver for database interactions.
    restify = module.exports.restify = require("restify"); // REST API framework.

// Define a prefix for debug messages to easily identify them in console output.
var DEBUGPREFIX = "DEBUG: ";

// Default configuration settings for the application.
// These can be overridden by a `config.json` file.
var config = {
      "db": { // Database connection settings.
              "port": 27017,   // Default MongoDB port.
              "host": "localhost" // Default MongoDB host.
            },
      "server": { // HTTP server settings.
                  "port": 3500,     // Default port for the REST server.
                  "address": "0.0.0.0" // Default listening address.
                },
      "flavor": "mongodb", // Specifies the database flavor (e.g., "mongodb").
      "debug": false       // Flag to enable or disable debug logging.
    };

// The `debug` function provides conditional logging based on the `config.debug` flag.
var debug = module.exports.debug = function (str) {
    // Only log messages if debugging is enabled in the configuration.
    if (config.debug) {
        console.log(DEBUGPREFIX + str); // Prepend the debug prefix to the message.
    }
};

// Attempt to load configuration from an external `config.json` file.
try {
    // Read and parse the JSON configuration file from the current working directory.
    config = JSON.parse(fs.readFileSync(process.cwd() + "/config.json"));
} catch (e) {
    // If the file is not found or parsing fails, log a debug message.
    debug("No config.json file found. Fall back to default config.");
}

// Export the final configuration object for use by other modules.
module.exports.config = config;

// Initialize the Restify server instance.
var server = restify.createServer({
                 name: "crest" // Assign a name to the server.
             });

// Configure acceptable content types for incoming requests.
server.acceptable = ['application/json'];

// Apply various Restify plugins for request processing.
server.use(restify.acceptParser(server.acceptable)); // Handles Accept headers.
server.use(restify.bodyParser());                   // Parses request bodies (e.g., JSON).
server.use(restify.fullResponse());                 // Adds standard response headers.
server.use(restify.queryParser());                  // Parses URL query strings.
server.use(restify.jsonp());                        // Enables JSONP support.

// Export the server instance so it can be accessed and configured by other modules.
module.exports.server = server;

// Load the REST API routes and logic from the `./lib/rest.js` file.
require('./lib/rest');

// Start the server, listening on the configured port and address.
server.listen(config.server.port, function () {
    // Log a message to the console once the server is successfully listening.
    console.log("%s listening at %s", server.name, server.url);
});
// End of server.js file.