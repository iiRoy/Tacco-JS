const resourceLocator = require('url').parse;

// Regular expression to escape special characters for RegExp constructor
const regexPatternEscaper = /[|.+?{}()\[\]^$]/g;

// Default handler for requests that do not match any defined routes (404 Not Found)
function standardFallback(incomingRequest, outgoingResponse) {
    outgoingResponse.writeHead(404, { 'Content-Type': 'text/html' });
    outgoingResponse.end(`<html><head><title>Resource Not Found</title></head><body><h1>Resource Not Found</h1><p>Cannot ${incomingRequest.method} ${incomingRequest.url}</p></body></html>`);
}

/**
 * Establishes a request dispatcher. This function acts as a factory
 * for creating a callable HTTP request handler that also provides
 * methods for defining URL routes.
 *
 * @returns {Function} An HTTP request handler with route definition methods attached.
 */
module.exports = function establishRequestDispatcher() {
    // A collection of all registered route entries.
    // Each entry is an object: { verb: 'GET', pattern: /regex/, action: function }
    let handlerCollection = [];

    // The handler to be invoked when no route matches. Defaults to `standardFallback`.
    let defaultMissingHandler = standardFallback;

    // Global setting for case insensitivity in route matching.
    let globalCaseInsensitivity = false;

    /**
     * The primary dispatcher function. This function is intended to be passed
     * to `require('http').createServer()`. It processes incoming requests,
     * attempts to find a matching route, and dispatches to the appropriate handler.
     *
     * @param {object} incoming - The incoming HTTP request object.
     * @param {object} outgoing - The outgoing HTTP response object.
     */
    const requestDispatcher = function(incoming, outgoing) {
        // Parse the URL if it hasn't been parsed already (e.g., by another middleware)
        if (!incoming.parsedResource || !('pathname' in incoming.parsedResource)) {
            incoming.parsedResource = resourceLocator(incoming.url);
        }

        const currentVerb = incoming.method;
        const currentPath = incoming.parsedResource.pathname;

        let matchedAction = null;
        let pathCaptures = null;

        // Iterate through the registered handlers to find the first match.
        // `Array.prototype.some` is used for efficiency, allowing early exit.
        handlerCollection.some(item => {
            if (item.verb === currentVerb) {
                const results = item.pattern.exec(currentPath);
                if (results) {
                    matchedAction = item.action;
                    pathCaptures = results.slice(1); // Extract captured groups (path parameters)
                    return true; // Match found, stop iterating
                }
            }
            return false; // No match with this item, continue
        });

        if (matchedAction) {
            // Construct the arguments for the route handler: [request, response, ...path_params]
            const invocationArguments = [incoming, outgoing, ...pathCaptures];
            // Invoke the matched handler with the correct context and arguments.
            return matchedAction.apply(this, invocationArguments);
        } else {
            // No route matched, invoke the default missing handler (404).
            return defaultMissingHandler.apply(this, [incoming, outgoing]);
        }
    };

    /**
     * Helper function to convert a route definition (string or RegExp) into a RegExp object.
     * Handles wildcard conversion (`*` and `**`) and special character escaping.
     *
     * @param {(string|RegExp)} inputDefinition - The route pattern.
     * @param {boolean} [caseOverride] - Override the global case insensitivity setting for this pattern.
     * @returns {RegExp} A compiled regular expression for path matching.
     */
    const generatePattern = function(inputDefinition, caseOverride) {
        // Determine the effective case sensitivity for this pattern.
        let effectiveCaseSensitivity = caseOverride !== undefined ? caseOverride : globalCaseInsensitivity;

        if (inputDefinition.constructor.name === 'RegExp') {
            // If the input is already a RegExp, clone it to prevent accidental modification.
            return new RegExp(inputDefinition.source, inputDefinition.flags);
        } else {
            // Convert string patterns with wildcards to a regular expression string.
            let processedString = String(inputDefinition)
                .replace(regexPatternEscaper, '\\$&') // Escape regex special characters literally.
                .replace(/\*\*/g, '(.*)') // `**` matches any sequence of characters (including slashes).
                .replace(/\*(?!\))/g, '([^/]*)'); // `*` matches any sequence of non-slash characters.
                                                 // Negative lookahead `(?!\))` prevents matching `*` inside `(.*)`.

            // Construct the final RegExp, ensuring it matches the full path (`^...$`).
            return new RegExp('^' + processedString + '$', effectiveCaseSensitivity ? 'i' : '');
        }
    };

    /**
     * Registers a new route handler for a specific HTTP verb and path pattern.
     *
     * @param {string} requestedVerb - The HTTP method (e.g., 'GET', 'POST').
     * @param {(string|RegExp)} pathDefinition - The path pattern to match.
     * @param {boolean} [caseOption] - Optional: specifies case sensitivity for this route.
     * @param {Function} handlerFunction - The callback function to execute when the route matches.
     * @returns {Function} The `requestDispatcher` for method chaining.
     */
    const incorporatePath = function(requestedVerb, pathDefinition, caseOption, handlerFunction) {
        let finalHandler = handlerFunction;
        let finalCaseOption = caseOption;

        // Adjust arguments if `caseOption` was omitted.
        if (arguments.length === 3) {
            finalHandler = caseOption;
            finalCaseOption = globalCaseInsensitivity; // Use the global setting if not specified.
        }

        // Compile the path definition into a RegExp.
        const compiledPattern = generatePattern(pathDefinition, finalCaseOption);

        // Add the main route entry.
        handlerCollection.push({
            verb: requestedVerb,
            pattern: compiledPattern,
            action: finalHandler
        });

        // Special handling: If a GET route is registered, automatically register a HEAD route with the same pattern and action.
        if (requestedVerb === 'GET') {
            handlerCollection.push({
                verb: 'HEAD',
                pattern: compiledPattern,
                action: finalHandler
            });
        }
        return requestDispatcher; // Enable method chaining (e.g., `dispatcher.get(...).post(...)`).
    };

    // Define method-specific route registration functions (e.g., `dispatcher.get()`, `dispatcher.post()`).
    const httpVerbs = ['GET', 'POST', 'PUT', 'DELETE', 'TRACE', 'OPTIONS', 'CONNECT'];
    httpVerbs.forEach(verb => {
        requestDispatcher[verb.toLowerCase()] = function(pathDef, caseOpt, handler) {
            // Call `incorporatePath` with the correct context and arguments.
            return incorporatePath.call(this, verb, pathDef, caseOpt, handler);
        };
    });

    /**
     * Sets a custom handler for requests that don't match any defined routes.
     *
     * @param {Function} handler - The function to call for unmatched requests.
     * @returns {Function} The `requestDispatcher` for method chaining.
     */
    requestDispatcher.setMissingHandler = function(handler) {
        defaultMissingHandler = handler;
        return requestDispatcher;
    };

    /**
     * Property to get or set the global case insensitivity for route matching.
     * Setting this to `true` will make all subsequently defined routes case-insensitive
     * unless explicitly overridden.
     */
    Object.defineProperty(requestDispatcher, 'caseIndependent', {
        get() { return globalCaseInsensitivity; },
        set(value) { globalCaseInsensitivity = !!value; }, // Ensure boolean value
        enumerable: true,
        configurable: true
    });

    return requestDispatcher;
};