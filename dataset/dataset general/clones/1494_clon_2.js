var extractLocation = require('url').parse;

exports.createPathProcessor = function() {
  // This function serves as the core request dispatcher,
  // designed for integration with `require('http').createServer()`.
  var requestDispatcher = function(incomingRequest, serverResponse) {
    // Ensure the URI has been thoroughly parsed and its pathname is accessible.
    if (!(incomingRequest.deconstructedUri && 'pathname' in incomingRequest.deconstructedUri)) {
      incomingRequest.deconstructedUri = extractLocation(incomingRequest.uri);
    }

    // Verify if the request verb has any associated routing rules.
    if (incomingRequest.verb in routeRegistry) {
      var requestPath = incomingRequest.deconstructedUri.pathname,
          verbSpecificRoutes = routeRegistry[incomingRequest.verb],
          routeCount = verbSpecificRoutes.length;

      // Traverse through all defined routes for the current HTTP verb.
      for (var idx = 0; idx < routeCount; idx += 1) {
        // For instance, a path like '/data/item/123' might align with '/data/*/*'
        var currentRule = verbSpecificRoutes[idx],
            foundSegments = currentRule.exec(requestPath);

        if (foundSegments) { // If a pattern match is successful, 'foundSegments' could be ['/data/item/123', 'item', '123']
          // Append any captured segments (from regex groups) to the arguments passed to the handler.
          _ArrayProto_push.apply(arguments, foundSegments.slice(1));
          // Execute the designated action handler with the current context and arguments.
          return currentRule.actionHandler.apply(this, arguments);
        }
      }
    }
    // Should no route match be found after exhausting all possibilities, invoke the dedicated no-match handler.
    noMatchHandler.apply(this, arguments);
  };

  // An internal collection that stores all defined route patterns, categorized by HTTP verb.
  var routeRegistry = {};

  // Initialize convenient methods for defining routes for common HTTP verbs.
  ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'TRACE', 'OPTIONS', 'CONNECT']
  .forEach(function(httpVerb) {
    routeRegistry[httpVerb] = []; // Establish an empty array to hold routes for each verb.

    // Provides a developer-friendly interface, e.g., `requestDispatcher.get('/users/:id', processUser)`.
    requestDispatcher[httpVerb.toLowerCase()] = function(pathPattern, caseInsensitiveOption, actionHandler) {
      // Handle the scenario where the 'caseInsensitiveOption' argument is omitted.
      if (arguments.length === 2) {
        actionHandler = caseInsensitiveOption;
        caseInsensitiveOption = requestDispatcher.caseInsensitive; // Apply a default setting if not provided.
      }

      var processedPattern;
      // If the supplied path pattern is already a RegExp object, create a new instance from it.
      if (pathPattern.constructor.name === 'RegExp') {
        processedPattern = new RegExp(pathPattern);
      } else { // Otherwise, transform the string pattern into a RegExp, interpreting wildcards.
        processedPattern = new RegExp(
          '^' // Ensure the pattern matches from the very start of the URI.
          + String(pathPattern)
              .replace(regexEscapeChars, '\\$&') // Escape any special characters that have regex meaning.
              .replace(/\*\*/g, '(.*)')          // Interpret double-asterisk as a catch-all for any characters.
              .replace(/\*(?!\))/g, '([^/]*)')   // Interpret single-asterisk as a segment wildcard (non-slash).
          + '$', // Ensure the pattern matches to the very end of the URI.
          caseInsensitiveOption ? 'i' : '' // Add the 'i' flag for case-insensitive matching if specified.
        );
      }
      processedPattern.actionHandler = actionHandler; // Attach the user-defined handler to the processed pattern.
      routeRegistry[httpVerb].push(processedPattern); // Incorporate the new route into the registry.

      return this; // Allow for method chaining (e.g., `dispatcher.get(...).post(...)`).
    };
  });

  // A regular expression identifying characters that must be escaped when constructing a RegExp object.
  var regexEscapeChars = /[|.+?{}()\[\]^$]/g;

  // Augment the GET route push mechanism: any GET route automatically registers a corresponding HEAD route.
  routeRegistry.GET.push = function(routeEntry) {
    _ArrayProto_push.call(this, routeEntry); // Add the route to the GET collection.
    routeRegistry.HEAD.push(routeEntry);    // Duplicate the route for the HEAD collection.
  };

  // Provides a mechanism to define a custom handler for requests that do not match any route.
  requestDispatcher.onNoMatch = function(fallbackHandler) {
    noMatchHandler = fallbackHandler;
    return this; // Enable fluent interface for configuration.
  };

  // The default handler that will be invoked when no matching route is found.
  var noMatchHandler = standardNoMatchResponse;

  return requestDispatcher; // Return the fully configured request dispatcher.
};

// A pre-fetched reference to the native Array.prototype.push method, used for performance optimization.
var _ArrayProto_push = [].push;

// The default function for generating an HTTP 404 "Not Found" response.
function standardNoMatchResponse(incomingRequest, serverResponse) {
  serverResponse.sendHeader(404, { 'Content-Type': 'text/html' });
  serverResponse.finalizeResponse('<html><head><title>Resource Not Available</title></head><body>\n' +
    '<h1>Resource Not Available</h1>\n' +
    '<p>The ' + incomingRequest.verb + ' request for ' + incomingRequest.uri + ' could not be located.</body></html>\n');
}