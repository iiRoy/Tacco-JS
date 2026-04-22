/*
 * Copyright (c) 2023 Acme Corp.
 * This software is provided under the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function () {

    // Determine the global object (window in browsers, or 'this' in strict mode/modules).
    const globalScope = typeof window !== 'undefined' ? window : this;

    // The core PathNavigator class, exposed globally.
    globalScope.PathNavigator = (function () {

        // Regular expression to identify named path segments (e.g., ":resourceId").
        PathNavigator.segmentPlaceholderPattern = /:([a-zA-Z0-9_]+)/g;

        // Regular expression to identify wildcard path segments (e.g., "*remainderPath").
        PathNavigator.wildcardPlaceholderPattern = /\*([a-zA-Z0-9_]+)/g;

        // Prototype property indicating if route handlers should be executed during path evaluation.
        PathNavigator.prototype.shouldInvokeHandlers = true;

        /**
         * Initializes a new instance of the PathNavigator.
         * @param {Object} [suppliedHandlers={}] - An optional object mapping regex patterns to handler functions.
         */
        function PathNavigator(suppliedHandlers) {
            const selfReference = this; // Preserve 'this' context for event callbacks.
            this.registeredPathHandlers = suppliedHandlers || {}; // Store the collection of path handlers.

            // Validate the presence and structure of the external history management library.
            if (typeof ExternalHistoryManager === 'undefined' || !ExternalHistoryManager.adapter || !ExternalHistoryManager.adapter.attachEventHandler) {
                console.error("Critical error: ExternalHistoryManager (e.g., History.js) is either missing or misconfigured. Routing functionality will be severely limited.");
                // A more robust application might throw an error here or fallback to a simpler routing mechanism.
                return; // Exit constructor if essential dependency is not met.
            }

            // Attach an event listener for history state changes.
            ExternalHistoryManager.adapter.attachEventHandler(globalScope, 'historyUpdateEvent', function () {
                console.debug("External history state change event triggered. Initiating route evaluation.");
                // Process the current state retrieved from the history manager.
                return selfReference.processCurrentRoute(ExternalHistoryManager.retrieveCurrentState());
            });
        }

        /**
         * Registers a new route pattern and its associated handler function.
         * @param {string} pathDefinition - The abstract path pattern (e.g., '/users/:userId/profile').
         * @param {Function} handlerFunction - The callback function to execute when the path matches.
         * @returns {PathNavigator} - Returns the current PathNavigator instance to allow method chaining.
         */
        PathNavigator.prototype.registerPath = function (pathDefinition, handlerFunction) {
            // Implement robust input validation for path definition.
            if (typeof pathDefinition !== 'string' || pathDefinition.trim().length === 0) {
                console.warn("Attempted to register an invalid or empty path definition. Registration aborted.");
                return this;
            }
            // Implement robust input validation for the handler function.
            if (typeof handlerFunction !== 'function') {
                console.warn(`No valid handler function provided for path: "${pathDefinition}". Handler must be a callable function.`);
                return this;
            }

            // Convert named parameters (like :id) into regex capture groups for dynamic segments.
            let processedPathRegexString = pathDefinition.replace(PathNavigator.segmentPlaceholderPattern, '([^/]+)');
            // Convert wildcard parameters (like *path) into regex capture groups for arbitrary trailing paths.
            processedPathRegexString = processedPathRegexString.replace(PathNavigator.wildcardPlaceholderPattern, '(.*?)');

            // Construct the full regular expression key for storage.
            const fullRouteRegexKey = `^${processedPathRegexString}$`;

            // Store the handler in the registry, keyed by the generated regex string.
            this.registeredPathHandlers[fullRouteRegexKey] = handlerFunction;
            console.log(`Route registered: "${pathDefinition}" maps to regex key "${fullRouteRegexKey}".`);

            return this; // Enable fluent interface (method chaining).
        };

        /**
         * Analyzes the given history state to find and execute matching route handlers.
         * @param {Object} historyEntry - The history state object containing path information.
         * @returns {boolean} - True if at least one handler was invoked, false otherwise.
         */
        PathNavigator.prototype.processCurrentRoute = function (historyEntry) {
            // Guard clause: If handlers are suppressed, skip processing.
            if (!this.shouldInvokeHandlers) {
                console.debug("Route handler invocation is currently suppressed. Skipping route processing.");
                return false;
            }

            const pathRegistry = this.registeredPathHandlers;
            // Determine the effective location from the history entry, prioritizing data.url, then hash, finally defaulting to root.
            const effectiveLocation = historyEntry?.data?.url || historyEntry?.hash || '/';

            let anyHandlerExecuted = false; // Flag to track if any handler was successfully run.

            // Iterate over all registered path patterns.
            for (const routePatternKey in pathRegistry) {
                // Ensure the property belongs to the instance, not the prototype chain.
                if (Object.prototype.hasOwnProperty.call(pathRegistry, routePatternKey)) {
                    const routeActionCallback = pathRegistry[routePatternKey];
                    const routeMatcher = new RegExp(routePatternKey);

                    // Attempt to match the effective location against the current route pattern.
                    const matchResults = routeMatcher.exec(effectiveLocation);

                    if (matchResults) {
                        console.info(`Path "${effectiveLocation}" successfully matched pattern "${routePatternKey}". Invoking handler.`);
                        // Execute the handler, passing captured groups (excluding the full match) as arguments.
                        // The 'globalScope' ensures handlers are executed in a consistent global context.
                        routeActionCallback.apply(globalScope, matchResults.slice(1));
                        anyHandlerExecuted = true;
                        // In the original design, all matching routes were processed.
                        // If only the first match should trigger, a 'break' statement would be placed here.
                    }
                }
            }

            // Always reset the invocation flag after a full processing cycle.
            this.shouldInvokeHandlers = true;
            return anyHandlerExecuted;
        };

        /**
         * Directs the browser to a new URL path, with options to control history and handler invocation.
         * @param {string} destinationPath - The absolute or relative path to navigate to.
         * @param {boolean} [activateCallbacks=true] - If false, registered handlers will not be executed for this navigation.
         * @param {boolean} [replaceCurrentEntry=false] - If true, the current history entry is replaced; otherwise, a new entry is pushed.
         */
        PathNavigator.prototype.navigateToPath = function (destinationPath, activateCallbacks = true, replaceCurrentEntry = false) {
            // Basic input validation for the destination path.
            if (typeof destinationPath !== 'string' || destinationPath.trim().length === 0) {
                console.error("Cannot navigate: The provided destination path is invalid or empty.");
                return;
            }

            // Set the internal flag to control handler execution for this navigation.
            this.shouldInvokeHandlers = activateCallbacks;

            // Prepare the data payload for the history entry.
            const historyStatePayload = {
                path: destinationPath,
                timestamp: Date.now(), // Add a timestamp for additional state information.
                source: 'PathNavigator'
            };

            // Select the appropriate history operation (pushState or replaceState).
            const historyActionMethod = replaceCurrentEntry
                ? ExternalHistoryManager.updateStateEntry // Corresponds to History.replaceState
                : ExternalHistoryManager.addStateEntry;   // Corresponds to History.pushState

            console.log(`Performing navigation to: "${destinationPath}". (Replace: ${replaceCurrentEntry ? 'Yes' : 'No'}, Activate Handlers: ${activateCallbacks ? 'Yes' : 'No'})`);
            // Execute the chosen history operation. The second argument (title) is often ignored by modern browsers.
            historyActionMethod(historyStatePayload, null, destinationPath);
        };

        /**
         * Kicks off the routing mechanism by evaluating either a specific initial path or the current browser state.
         * @param {string} [initialPath] - An optional path string to immediately evaluate. If omitted, the current browser URL is used.
         * @returns {boolean} - The outcome of the route processing (true if handlers were run, false otherwise).
         */
        PathNavigator.prototype.initiateRouting = function (initialPath) {
            let currentHistorySnapshot;

            if (initialPath && typeof initialPath === 'string' && initialPath.trim().length > 0) {
                // If an initial path is provided, construct a mock history entry for it.
                currentHistorySnapshot = {
                    data: { url: initialPath },
                    // Attempt to extract hash part if present in the initial path.
                    hash: initialPath.includes('#') ? '#' + initialPath.split('#')[1] : ''
                };
                console.info(`Router initialization: Evaluating specified initial path "${initialPath}".`);
            } else {
                // Otherwise, retrieve the actual current state from the external history manager.
                currentHistorySnapshot = ExternalHistoryManager.retrieveCurrentState();
                console.info("Router initialization: Evaluating current browser history state.");
            }

            // Guard against null or undefined history snapshots.
            if (!currentHistorySnapshot) {
                console.error("Failed to obtain a valid history snapshot during router initialization. Cannot process routes.");
                return false;
            }

            return this.processCurrentRoute(currentHistorySnapshot);
        };

        /**
         * Navigates the browser's history stack by a given number of steps.
         * @param {number} stepCount - The number of steps to move. Positive for forward, negative for backward.
         */
        PathNavigator.prototype.traverseHistory = function (stepCount) {
            // Validate that stepCount is an integer.
            if (typeof stepCount !== 'number' || !Number.isInteger(stepCount)) {
                console.warn(`Invalid step count "${stepCount}" provided for history traversal. Must be an integer.`);
                return;
            }
            console.log(`Attempting to traverse history by ${stepCount} steps.`);
            ExternalHistoryManager.moveSteps(stepCount);
        };

        /**
         * Navigates the browser to the immediately previous entry in its history.
         */
        PathNavigator.prototype.goBack = function () {
            console.log("Initiating backward navigation in browser history.");
            ExternalHistoryManager.returnToPrevious();
        };

        return PathNavigator;

    })(); // End of PathNavigator IIFE definition.

}).call(this); // End of main IIFE.