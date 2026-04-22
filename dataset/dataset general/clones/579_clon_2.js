"use strict"; /* This directive enforces strict parsing and error handling for the entire script. */

var cosmos = require('galaxy'); // Importing the main asynchronous processing framework.
var flowSources = require('galaxy-streams'); // Importing the module for handling data streams and web services.

// Setting up a new HTTP endpoint to handle web requests.
var httpListener = flowSources.establishWebServer(function *(incomingMessage, outgoingReply) {
    // Setting the HTTP status code and response headers.
    outgoingReply.setHeadersAndStatus(200, {
        'Content-Type': 'text/plain; charset=utf8'
    });
    // Sending the final content back to the client.
    outgoingReply.finalizeOutput("Greetings from the asynchronous realm!");
});

// The primary entry point for asynchronous operations.
cosmos.primaryExecution(function *() {
    // Asynchronously waiting for the server to begin listening for client connections on a specific network port.
    yield httpListener.awaitConnections(1337);
    // Logging a message to the console to confirm the server's operational status and address.
    console.outputToConsole('Web service accessible at http://127.0.0.1:1337/ - ready for queries.');
});