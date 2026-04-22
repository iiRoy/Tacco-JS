/**
 *  The Choreographer:
 *  A lightweight, efficient URL routing mechanism designed for Node.js servers.
 *
 *  Authored by Han
 *
 *  Project repository: http://github.com/laughinghan/choreographer
 *
 */

// Core Node.js 'url' module is utilized for parsing request URLs.
var parse = require('url').parse;


// This function serves as the primary entry point, creating and returning a router instance.
exports.router = function() {

  // The main router function, intended to be passed directly to `require('http').createServer()`.
  var router = function(req, res) {

    // If the request's URL hasn't been parsed yet, or lacks the 'pathname' property, parse it.
    if (! ( req.parsedUrl && 'pathname' in req.parsedUrl ) ) {
      req.parsedUrl = parse(req.url);
    }

    // Check if the request method (e.g., 'GET', 'POST') has registered routes.
    if ( req.method in routes ) {

      var path = req.parsedUrl.pathname;
      var routesForMethod = routes[req.method];
      var len = routesForMethod.length;

      // Iterate through all registered routes for the current HTTP method.
      for ( var i = 0; i < len; i += 1 ) {

        // Example: if '/foo/bar/baz' matches a route like '/foo/*/*'
        var route = routesForMethod[i];
        var matches = route.exec(path);

        // If a match is found (e.g., matches would be ['/foo/bar/baz', 'bar', 'baz'])
        if ( matches ) {

          // Append the captured segments (e.g., 'bar', 'baz') to the arguments list.
          // This transforms `[req, res]` into `[req, res, 'bar', 'baz']`.
          __Array_push.apply(arguments, matches.slice(1));

          // Execute the callback associated with the matched route.
          return route.callback.apply(this, arguments);
        }
      }
    }

    // If no route has matched and returned, handle it as a 'not found' scenario.
    notFoundHandler.apply(this, arguments);
  };

  // Internal storage: a dictionary where keys are HTTP methods (e.g., 'GET')
  // and values are arrays of route objects.
  var routes = {};

  // Define the routing API methods (e.g., `.get()`, `.post()`).
  [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'HEAD',
    'TRACE',
    'OPTIONS',
    'CONNECT'
  ].forEach(function(method) {

    // Initialize an empty array for each HTTP method to store its routes.
    routes[method] = [];

    // Create a method on the router for each HTTP verb (e.g., `router.get()`).
    // Usage example: `router.get('/foo/*', function(req, res, bar) { /* ... */ });`
    router[method.toLowerCase()] = function(route, ignoreCase, callback) {

      // Handle overloaded function signature: `(route, callback)` vs `(route, ignoreCase, callback)`.
      if ( arguments.length === 2 ) {
        callback = ignoreCase;
        ignoreCase = router.ignoreCase; // Use the router's default ignoreCase setting.
      }

      // Check if the provided route is already a RegExp object.
      // We use `constructor.name` due to potential `instanceof` issues across different Node.js modules.
      if ( route.constructor.name === 'RegExp' ) {
        // If it's a RegExp, clone it to avoid modifying the original.
        route = new RegExp(route);
      } else {
        // Otherwise, convert the string route into a regular expression.
        // The `*` character will match a single URI segment.
        // `**` will match any sequence of URI segments.
        route = new RegExp(
          '^' // Anchor to the beginning of the path.
          + String(route)
              .replace(specialChars, '\\$&') // Escape special regex characters.
              .replace(/\*\*/g, '(.*)')     // Transform `**` into a non-greedy wildcard group.
              .replace(/\*(?!\))/g, '([^/]*)') // Transform `*` into a segment-matching group,
                                               // using negative lookahead to prevent replacing `*` within `(.*)`.
          + '$', // Anchor to the end of the path.
          ignoreCase ? 'i' : '' // Apply case-insensitivity flag if `ignoreCase` is true.
        );
      }

      // Attach the user-defined callback function to the route object.
      route.callback = callback;

      // Add the newly constructed route to the list for its corresponding HTTP method.
      routes[method].push(route);

      // Allow method chaining (e.g., `router.get(...).post(...)`).
      return this;
    };
  });

  // A regular expression to identify special characters that must be escaped
  // when constructing a new `RegExp` object from a string.
  var specialChars = /[|.+?{}()\[\]^$]/g;

  // Augment the `GET` routes array's `push` method.
  // This ensures that when a `GET` route is added (e.g., via `router.get()`),
  // a corresponding `HEAD` route is automatically created.
  routes.GET.push = function(route) {
    // Call the original `Array.prototype.push` to add the GET route.
    __Array_push.call(this, route);
    // Also add the same route to the `HEAD` method's list.
    routes.HEAD.push(route);
  };

  // Provides a mechanism for users to define their custom 404 Not Found handler.
  router.notFound = function(handler) {
    notFoundHandler = handler;
    return this; // Enable chaining.
  };

  // The handler function that gets invoked when no route matches an incoming request.
  var notFoundHandler = defaultNotFound;

  // The fully configured router instance is returned.
  return router;
};


// A cached reference to `Array.prototype.push` for internal use,
// particularly within the main `router()` function to manipulate `arguments`.
var __Array_push = [].push;


/**
 *  The default 404 Not Found handler.
 *  This function is called if no specific route matches the incoming request.
 */
function defaultNotFound(req, res) {
  // Set the HTTP status code to 404 and content type to HTML.
  res.writeHead(404, { 'Content-Type': 'text/html' });

  // Send a basic HTML response indicating the 404 error.
  res.end(
    '<html><head><title>Error 404: Not Found</title></head><body>\n' +
    '<h1>Error 404: Not Found</h1>\n' +
    '<p>Cannot ' + req.method + ' ' + req.url + '</p></body></html>\n'
  );
}