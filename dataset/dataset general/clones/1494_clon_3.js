// A modular routing system for Node.js servers.
// Crafted by a diligent programmer.
//
// For usage with Node's built-in 'http' module.
//
// github.com/some_user/super_router
//

const urlParsingUtility = require('url').parse; // Renamed 'parse' to 'urlParsingUtility'

// Array.prototype.push reference for efficient argument manipulation.
const arrayPushReference = Array.prototype.push;

// Standard HTTP methods supported by the router.
const supportedHttpMethods = [
  'GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'TRACE', 'OPTIONS', 'CONNECT'
];

// Default error handler for unmatched requests.
function standardNotFoundResponse(clientRequest, serverResponse) {
  serverResponse.writeHead(404, { 'Content-Type': 'text/html' });
  serverResponse.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>HTTP 404: Resource Not Found</title>
      <style>body { font-family: sans-serif; margin: 2em; background-color: #f8f8f8; color: #333; }</style>
    </head>
    <body>
      <h1>404 Not Found</h1>
      <p>The requested resource <code>${clientRequest.url}</code> via method <code>${clientRequest.method}</code> could not be located on this server.</p>
      <hr>
      <address>Super Router powered server</address>
    </body>
    </html>
  `);
}

// Special characters in RegExp patterns that require escaping.
const regexEscapeCharacters = /[|.+?{}()\[\]^$]/g;

// Creates and returns a new routing instance.
exports.createRouter = function(options = {}) {
  // Internal storage for all registered routes, categorized by HTTP method.
  // Each method's value is an array of route objects { pattern: RegExp, handler: Function }.
  const routeDefinitions = {};

  // Default configuration for the router instance.
  const routerConfig = {
    caseSensitiveRouting: options.caseSensitiveRouting !== undefined ? options.caseSensitiveRouting : false, // Inverted logic from ignoreCase
    errorHandler: options.errorHandler || standardNotFoundResponse
  };

  // The main request handling function, to be passed to http.createServer().
  const requestHandler = function(clientRequest, serverResponse) {
    // Ensure the URL has been parsed and its pathname is available.
    // If not, parse it now to avoid redundant operations.
    if (!clientRequest.parsedUrl || typeof clientRequest.parsedUrl.pathname !== 'string') {
      clientRequest.parsedUrl = urlParsingUtility(clientRequest.url);
    }

    const currentMethod = clientRequest.method;
    const currentPath = clientRequest.parsedUrl.pathname;

    // Check if any routes are defined for the current HTTP method.
    if (routeDefinitions[currentMethod]) {
      const methodSpecificRoutes = routeDefinitions[currentMethod];
      const invocationArguments = [clientRequest, serverResponse]; // Base arguments for the handler.

      // Iterate through registered routes for this method.
      for (const routeEntry of methodSpecificRoutes) {
        const pathSegments = routeEntry.pattern.exec(currentPath);

        // If a match is found, extract dynamic segments and invoke the handler.
        if (pathSegments) {
          // Append captured segments (from regex groups) to the invocation arguments.
          arrayPushReference.apply(invocationArguments, pathSegments.slice(1));
          return routeEntry.handler.apply(this, invocationArguments);
        }
      }
    }

    // If no route matched, invoke the configured error handler.
    routerConfig.errorHandler.apply(this, [clientRequest, serverResponse]);
  };

  // --- Internal Utility Functions ---

  /**
   * Compiles a route definition into a RegExp object with the attached handler.
   * @param {string|RegExp} routePath - The route pattern.
   * @param {Function} routeHandler - The function to execute when the route matches.
   * @param {boolean} isCaseSensitive - True if routing should be case-sensitive.
   * @returns {object} An object containing the compiled RegExp and the handler.
   */
  const compileRoutePattern = (routePath, routeHandler, isCaseSensitive) => {
    let compiledPattern;

    if (routePath instanceof RegExp) { // Check if it's already a RegExp object.
      // If it's a RegExp, create a new one to ensure flags are correctly applied
      // and prevent modification of the original.
      compiledPattern = new RegExp(routePath.source, routePath.flags + (isCaseSensitive ? '' : 'i'));
    } else {
      // Treat the string as a pattern where '*' matches URI segments.
      const patternString = String(routePath)
        .replace(regexEscapeCharacters, '\\$&') // Escape special regex characters.
        .replace(/\*\*/g, '(.*)')              // '**' matches any sequence of characters (greedy).
        .replace(/\*(?!\))/g, '([^/]*)');      // '*' matches any single path segment.

      compiledPattern = new RegExp(`^${patternString}$`, isCaseSensitive ? '' : 'i');
    }

    // Basic validation: ensure the handler is a function.
    if (typeof routeHandler !== 'function') {
      console.warn(`Warning: Route for '${routePath}' registered with a non-function handler.`);
      // Potentially throw an error or use a no-op handler. For now, just warn.
    }

    return { pattern: compiledPattern, handler: routeHandler };
  };

  /**
   * Adds a compiled route entry to the internal route registry.
   * @param {string} methodKey - The HTTP method (e.g., 'GET', 'POST').
   * @param {object} compiledRouteEntry - The object returned by compileRoutePattern.
   */
  const addRouteToRegistry = (methodKey, compiledRouteEntry) => {
    if (!routeDefinitions[methodKey]) {
      routeDefinitions[methodKey] = [];
    }
    routeDefinitions[methodKey].push(compiledRouteEntry);
  };

  // --- Public API for Defining Routes ---

  // Iterate over supported HTTP methods to create corresponding helper functions (e.g., router.get, router.post).
  supportedHttpMethods.forEach(methodName => {
    routeDefinitions[methodName] = []; // Initialize array for each method.

    // Assign a method-specific route registration function to the requestHandler object.
    // e.g., requestHandler.get('/path/:id', (req, res, id) => { ... });
    requestHandler[methodName.toLowerCase()] = function(pathExpression, handlerOptions, routeAction) {
      let currentHandler = routeAction;
      let shouldBeCaseSensitive = !routerConfig.caseSensitiveRouting; // Default from router config.

      // Handle overloaded arguments: (path, handler) or (path, options, handler).
      if (arguments.length === 2 && typeof handlerOptions === 'function') {
        currentHandler = handlerOptions;
        // shouldBeCaseSensitive remains at default.
      } else if (typeof handlerOptions === 'object' && handlerOptions !== null) {
        currentHandler = routeAction;
        if (typeof handlerOptions.caseSensitive === 'boolean') {
          shouldBeCaseSensitive = handlerOptions.caseSensitive;
        }
      }

      // Compile the route pattern.
      const compiledRoute = compileRoutePattern(pathExpression, currentHandler, shouldBeCaseSensitive);

      // Add the route to the registry for the specific HTTP method.
      addRouteToRegistry(methodName, compiledRoute);

      // Special handling for GET routes: automatically create a HEAD route.
      if (methodName === 'GET') {
        // HEAD requests should also match GET routes, but only execute the GET handler.
        // The server is responsible for handling HEAD semantics (no body in response).
        addRouteToRegistry('HEAD', compiledRoute);
      }

      return this; // Allow chaining.
    };
  });

  // --- Additional Router Configuration Methods ---

  // Allows setting a custom 404/not found handler.
  requestHandler.setNotFoundHandler = function(handlerFunction) {
    if (typeof handlerFunction === 'function') {
      routerConfig.errorHandler = handlerFunction;
    } else {
      console.error("Attempted to set a non-function as the not-found handler.");
    }
    return this;
  };

  // Expose the case sensitivity setting for inspection or modification.
  Object.defineProperty(requestHandler, 'isCaseSensitive', {
    get: () => routerConfig.caseSensitiveRouting,
    set: (value) => {
      if (typeof value === 'boolean') {
        routerConfig.caseSensitiveRouting = value;
      } else {
        console.error("isCaseSensitive must be a boolean value.");
      }
    }
  });


  return requestHandler; // Return the request handler function.
};