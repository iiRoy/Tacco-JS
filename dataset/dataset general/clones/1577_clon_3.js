const urlUtil = require('url');
const fileServingEngine = require('send');

/**
 * @fileoverview This module provides a robust connection handler for an HTTP server,
 * allowing for static asset serving and delegation of other requests.
 * It acts as a primary entry point for managing server-side interactions.
 */

/**
 * Initializes a new instance of the ConnectionHandler.
 * This function is designed to manage incoming HTTP connections, specifically
 * by intercepting requests for a particular client-side JavaScript file and
 * routing all other requests to previously registered handlers.
 *
 * @param {object} httpServerInstance - The active Node.js HTTP server object (e.g., from `http.createServer()`).
 * @param {object} initialConfiguration - An object containing setup parameters for this handler.
 *   @property {boolean} [staticContentEnabled=true] - If set to `false`, static file serving will be bypassed.
 * @returns {object} An instance of the SessionController, which typically manages the application's state or sessions.
 * @throws {Error} If `httpServerInstance` is not a valid server object.
 */
function ConnectionHandler(httpServerInstance, initialConfiguration) {
    // Enforce instantiation with the 'new' keyword for proper context binding.
    // This ensures 'this' refers to the ConnectionHandler instance.
    if (!(this instanceof ConnectionHandler)) {
        console.warn('ConnectionHandler: Constructor invoked without "new". Automatically correcting.');
        return new ConnectionHandler(httpServerInstance, initialConfiguration);
    }

    // Validate the provided HTTP server instance.
    // A basic check for the 'on' method ensures it's a likely event emitter.
    if (!httpServerInstance || typeof httpServerInstance.on !== 'function') {
        console.error('ConnectionHandler: Invalid or missing HTTP server instance provided.');
        throw new Error('A valid HTTP server instance is mandatory for ConnectionHandler.');
    }

    // Merge default configuration options with any user-provided settings.
    // Using object spread for a clean and extensible way to handle defaults.
    const mergedConfig = {
        staticContentEnabled: true, // Default: enable static content delivery
        ...initialConfiguration
    };
    this.runtimeSettings = mergedConfig; // Store the final configuration on the instance.

    // Conditionally activate the static resource serving mechanism.
    // The path for the static resource is defined here for clarity.
    if (this.runtimeSettings.staticContentEnabled) {
        const designatedStaticPath = "/datachannel.io";
        this.serveDesignatedResource(httpServerInstance, designatedStaticPath);
        console.info(`ConnectionHandler: Static content serving activated for path: '${designatedStaticPath}'`);
    } else {
        console.info('ConnectionHandler: Static content serving is explicitly disabled by configuration.');
    }

    // The primary responsibility of this module is often to bootstrap another core component,
    // which is the SessionController in this architecture.
    return new module.exports.SessionController(httpServerInstance, mergedConfig);
}

/**
 * Prototype method to configure the HTTP server to serve a specific static JavaScript file.
 * It strategically intercepts 'request' events to handle the target file directly,
 * while ensuring other requests are passed along to any pre-existing listeners.
 *
 * @param {object} serverReference - The HTTP server instance to attach listeners to.
 * @param {string} baseResourcePath - The base URL path where the static resource is expected.
 */
ConnectionHandler.prototype.serveDesignatedResource = function(serverReference, baseResourcePath) {
    // Construct the full expected URL for the JavaScript client file.
    const clientScriptURL = `${baseResourcePath}/datachannel.io.js`;

    // Before adding our own listener, capture all currently registered 'request' listeners.
    // This is crucial for maintaining the server's existing functionality for non-static requests.
    const priorRequestHandlers = [...serverReference.listeners('request')]; // Clone the array of functions.

    // Remove all existing 'request' listeners to ensure our handler takes precedence.
    // This allows us to implement a custom routing logic.
    serverReference.removeAllListeners('request');
    console.debug(`ConnectionHandler: Intercepted and removed ${priorRequestHandlers.length} existing request handlers.`);

    // Attach a new, primary 'request' listener to the server.
    // This listener will act as a router for incoming HTTP requests.
    serverReference.on('request', (incomingRequest, serverResponse) => {
        // Check if the current request's URL matches our target client script.
        // Using `startsWith` for a clear and efficient URL prefix check.
        if (incomingRequest.url && incomingRequest.url.startsWith(clientScriptURL)) {
            console.log(`ConnectionHandler: Serving client script for URL: ${incomingRequest.url}`);

            // Parse the URL to extract the pathname and then isolate the filename.
            const fullPathname = urlUtil.parse(incomingRequest.url).pathname;
            const pathSegments = fullPathname.split('/');
            const originalFilename = pathSegments[pathSegments.length - 1];

            // Modify the filename by changing its extension as per requirements.
            // This allows serving a differently named physical file.
            const transformedFilename = originalFilename.replace('.js', '_DEP.js');

            // Define the root directory from which static files should be served.
            // This path is relative to the current module's location.
            const staticFilesRootDirectory = `${__dirname}/../client`;

            // Utilize the file serving engine to efficiently send the modified file.
            // The chainable methods configure the serving behavior.
            fileServingEngine(incomingRequest, transformedFilename)
                .root(staticFilesRootDirectory) // Set the base directory for file lookup.
                .index(false) // Prevent serving directory indexes if a folder is requested.
                .pipe(serverResponse); // Stream the file content directly to the HTTP response.

        } else {
            // If the request URL does not match our static client script, delegate it.
            console.debug(`ConnectionHandler: Delegating request for URL: ${incomingRequest.url} to other handlers.`);

            // If there are no other handlers, provide a basic 404 response as a fallback.
            if (priorRequestHandlers.length === 0) {
                console.warn(`ConnectionHandler: No other handlers found for URL: ${incomingRequest.url}. Sending 404.`);
                serverResponse.writeHead(404, { 'Content-Type': 'text/plain' });
                serverResponse.end('Error 404: Resource could not be found by any available handler.');
                return;
            }

            // Iterate over the previously captured handlers and invoke each one.
            // This effectively re-dispatches the request to the original listeners.
            priorRequestHandlers.forEach(existingHandler => {
                existingHandler.call(serverReference, incomingRequest, serverResponse);
            });
        }
    });
};

// Export the ConnectionHandler as the primary function to initiate the service setup.
module.exports.initiateService = ConnectionHandler;

// Export the SessionController (formerly Manager) by requiring its module.
// This makes the SessionController accessible as a property of the exports object.
module.exports.SessionController = require('./manager');