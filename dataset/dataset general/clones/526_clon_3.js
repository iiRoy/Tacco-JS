!function(externalModule) {
    // Check for CommonJS environment
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = externalModule();
    }
    // Check for AMD environment
    else if (typeof define === "function" && define.amd) {
        define(externalModule);
    }
    // Browser global
    else {
        let globalContext;
        // Determine the global object
        if (typeof window !== "undefined") {
            globalContext = window;
        } else if (typeof global !== "undefined") {
            globalContext = global;
        } else if (typeof self !== "undefined") {
            globalContext = self;
        } else {
            // Fallback, though unlikely to be reached in typical JS environments
            globalContext = this;
        }
        // Attach to global context, creating a namespace if necessary
        const targetNamespace = globalContext.myLib || (globalContext.myLib = {});
        targetNamespace.remoteUtils = externalModule();
    }
}(function() {
    // Start of the module's internal scope
    let localDefine, localModule, localExports;

    // This section mimics a module bundler's output,
    // ensuring `module` and `exports` are available.
    // We'll simplify this internal structure while maintaining its intent.
    const moduleFactory = (function(componentMap, moduleDeps, bootstrapModules) {
        // Internal cache for loaded modules
        const moduleCache = {};

        // Helper to resolve and retrieve a module
        function getModule(moduleIdentifier, requestorIsInternal) {
            // If module is already cached, return it
            if (moduleCache[moduleIdentifier]) {
                return moduleCache[moduleIdentifier];
            }

            // If module definition doesn't exist, throw an error
            if (!componentMap[moduleIdentifier]) {
                const globalRequire = typeof require === "function" && require;
                if (!requestorIsInternal && globalRequire) {
                    return globalRequire(moduleIdentifier); // Try global require if available
                }
                // If not found and no global require, or if internal, throw
                if (window && window.console && typeof window.console.error === 'function') {
                    window.console.error("Module not found: " + moduleIdentifier);
                }
                throw new Error("Unable to locate module: '" + moduleIdentifier + "'");
            }

            // Create a new module object and its exports
            const currentModule = moduleCache[moduleIdentifier] = { exports: {} };

            // Execute the module's factory function
            // It expects a 'require' function, the module object, and its exports
            componentMap[moduleIdentifier][0].call(
                currentModule.exports,
                function(dependencyPath) {
                    // This is the internal 'require' function for dependencies
                    const resolvedDep = componentMap[moduleIdentifier][1][dependencyPath];
                    return getModule(resolvedDep ? resolvedDep : dependencyPath);
                },
                currentModule,
                currentModule.exports,
                moduleFactory, // Pass the factory itself for recursive calls if needed
                componentMap,
                moduleDeps,
                bootstrapModules
            );

            return currentModule.exports;
        }

        // --- Main execution flow for the bundler-like structure ---
        // Ensure all bootstrap modules are loaded
        for (let i = 0; i < bootstrapModules.length; i++) {
            getModule(bootstrapModules[i]);
        }

        // Return the exports of the primary bootstrap module (last one in the list)
        return getModule(bootstrapModules[bootstrapModules.length - 1]);

    })({ // Module definitions start here
        1: [function(_internalRequire, currentMod, currentModExports) {
            "use strict";

            // Enhanced utility for handling asynchronous requests in JavaScript applications.
            // This module provides robust request handling with promise-based responses
            // and an optional fixture system for testing.
            // License: MIT - (c) 2023 Acme Corp.
            // Inspired by various promise-based AJAX implementations.

            // --- Core Application Framework Integration ---
            // Attempts to retrieve the main framework object (e.g., Ember, Vue, React)
            // If not found, a placeholder or warning might be beneficial.
            const AppFramework = window.AppCore || window.Ember;
            if (!AppFramework) {
                console.warn("Application framework (AppCore/Ember) not found. Some functionality may be limited.");
            }

            // --- Utility Functions ---

            /**
             * Creates a deep copy of an object.
             * @param {Object} sourceObj - The object to copy.
             * @returns {Object} A deep copy of the source object.
             */
            function makeDeepCopy(sourceObj) {
                if (sourceObj === null || typeof sourceObj !== 'object') {
                    return sourceObj;
                }
                // Using JSON parse/stringify for a simple deep copy,
                // suitable for JSON-serializable objects.
                return JSON.parse(JSON.stringify(sourceObj));
            }

            /**
             * Throws an error if any of the given callbacks are present in the settings.
             * @param {Object} callOptions - The options object for the AJAX call.
             * @param {Array<string>} forbiddenCallbacks - List of callback property names to check.
             * @throws {AppFramework.Error} If a forbidden callback is found.
             */
            function validateNoCallbacks(callOptions, forbiddenCallbacks) {
                for (const cbName of forbiddenCallbacks) {
                    if (callOptions[cbName]) {
                        const errorMsg = `Asynchronous operations should use promises. Detected '${cbName}' callback.`;
                        if (AppFramework && AppFramework.Error) {
                            throw new AppFramework.Error(errorMsg);
                        } else {
                            throw new Error(errorMsg);
                        }
                    }
                }
            }

            // --- Main API Functions ---

            /**
             * Performs an asynchronous request, returning a promise that resolves
             * only with the response data, unwrapped from the full AJAX response.
             * This function is a convenience wrapper around `sendRequestRaw`.
             *
             * @param {string|object} firstArg - URL string or an options object.
             * @param {object} [secondArg] - Options object if firstArg is a URL.
             * @returns {AppFramework.RSVP.Promise} A promise resolving to the response data.
             */
            function performCall(firstArg, secondArg) {
                // Delegate argument parsing and execution to the raw sender
                return sendRequestRaw(firstArg, secondArg).then(function(fullResponse) {
                    // Extract and return only the response payload
                    return fullResponse.payload;
                }, null, 'myLib.remoteUtils: extracting response data');
            }
            // Expose the primary function
            currentModExports.performCall = performCall;
            // Set a flag that might be used by external integrations (e.g., ORM adapters)
            performCall.ADAPTER_OVERRIDE_FLAG = true;
            currentModExports["default"] = performCall; // Also export as default

            /**
             * Executes an asynchronous request, returning a promise that resolves
             * with the complete AJAX response object, including payload, status, and XHR object.
             * This is useful when access to headers or other low-level details is required.
             *
             * @param {string|object} inputOne - URL string or an options object.
             * @param {object} [inputTwo] - Options object if inputOne is a URL.
             * @returns {AppFramework.RSVP.Promise} A promise resolving to an object:
             *   `{ payload: any, statusText: string, xhrObject: XMLHttpRequest }`.
             */
            function sendRequestRaw(inputOne, inputTwo) {
                // Process the incoming arguments into a standardized settings object
                const processedSettings = normalizeCallOptions(inputOne, inputTwo);
                return wrapRequestInPromise(processedSettings);
            }
            // Expose the raw request sender
            currentModExports.sendRequestRaw = sendRequestRaw;

            // --- Fixture Management for Testing ---
            /**
             * Internal store for mock API responses.
             * This allows for stubbing network calls during testing without actual network requests.
             * @private
             * @type {Object.<string, Object>}
             */
            const testStubs = {};
            currentModExports.testStubs = testStubs; // Expose for debugging/testing environments

            /**
             * Registers a mock response for a given URL. When a request is made to this URL,
             * the mock response will be returned instead of an actual AJAX call.
             *
             * Example:
             *    registerMock('/api/users/me', {
             *      payload: { id: 1, name: 'Jane Doe' },
             *      statusText: 'success',
             *      xhrObject: { status: 200 }
             *    });
             *
             * @param {string} endpointUrl - The URL to stub.
             * @param {object} mockResponse - The response object to return.
             *   Must contain `payload`, `statusText`, and optionally `xhrObject`.
             * @throws {Error} If `mockResponse` is invalid.
             */
            function registerMock(endpointUrl, mockResponse) {
                if (typeof endpointUrl !== 'string' || !endpointUrl) {
                    throw new Error("Endpoint URL must be a non-empty string for registering a mock.");
                }
                if (typeof mockResponse !== 'object' || mockResponse === null) {
                    throw new Error(`Mock response for ${endpointUrl} must be an object.`);
                }
                if (!('payload' in mockResponse) || !('statusText' in mockResponse)) {
                    console.warn(`Mock response for ${endpointUrl} is missing 'payload' or 'statusText'.`);
                }

                testStubs[endpointUrl] = makeDeepCopy(mockResponse);
            }
            currentModExports.registerMock = registerMock;

            /**
             * Retrieves a registered mock response for a given URL.
             * @param {string} endpointUrl - The URL to look up.
             * @returns {object|undefined} The mock response object if found, otherwise `undefined`.
             */
            function retrieveMock(endpointUrl) {
                return testStubs[endpointUrl];
            }
            currentModExports.retrieveMock = retrieveMock;

            /**
             * Clears all registered mock responses. Useful for resetting test environments.
             */
            function clearAllMocks() {
                for (const key in testStubs) {
                    if (Object.prototype.hasOwnProperty.call(testStubs, key)) {
                        delete testStubs[key];
                    }
                }
            }
            currentModExports.clearAllMocks = clearAllMocks; // New fragment

            // --- Internal Helper Functions ---

            /**
             * Wraps an AJAX request in an AppFramework.RSVP.Promise.
             * Handles fixture lookup and actual AJAX execution.
             * @param {object} settingsObj - The processed settings for the AJAX call.
             * @returns {AppFramework.RSVP.Promise} A promise that resolves or rejects with the AJAX response.
             */
            function wrapRequestInPromise(settingsObj) {
                // Ensure AppFramework.RSVP.Promise is available
                if (!AppFramework || !AppFramework.RSVP || !AppFramework.RSVP.Promise) {
                    throw new Error("AppFramework.RSVP.Promise is required but not found.");
                }

                // Provide a descriptive label for debugging promises
                const promiseLabel = `myLib.remoteUtils: ${settingsObj.method || 'GET'} to ${settingsObj.url || '[unknown]'}`;

                return new AppFramework.RSVP.Promise(function(resolveFn, rejectFn) {
                    const foundMock = retrieveMock(settingsObj.url);

                    if (foundMock) {
                        // Simulate asynchronous response for fixtures
                        if (foundMock.statusText === 'success') {
                            return AppFramework.run(null, resolveFn, foundMock);
                        } else {
                            return AppFramework.run(null, rejectFn, foundMock);
                        }
                    }

                    // If no fixture, proceed with actual AJAX call
                    // Assign success and error handlers
                    settingsObj.success = buildSuccessCallback(resolveFn);
                    settingsObj.error = buildErrorCallback(rejectFn);

                    // Execute the AJAX call using the framework's utility
                    if (AppFramework && AppFramework.$ && typeof AppFramework.$.ajax === 'function') {
                        AppFramework.$.ajax(settingsObj);
                    } else {
                        // Fallback or error if framework's AJAX is missing
                        console.error("AppFramework.$.ajax is not available. Cannot perform actual AJAX request.");
                        AppFramework.run(null, rejectFn, {
                            payload: null,
                            statusText: 'error',
                            xhrObject: { status: 0, statusText: 'No AJAX utility' },
                            errorDetails: 'AppFramework.$.ajax is not defined.'
                        });
                    }

                }, promiseLabel);
            }

            /**
             * Parses and normalizes input arguments for `performCall` or `sendRequestRaw`.
             * Supports (url) or (options) or (url, options) signatures.
             * @param {*} arg1 - First argument, can be a string URL or an options object.
             * @param {*} arg2 - Second argument, optional options object.
             * @returns {object} A standardized options object.
             * @throws {AppFramework.Error} If unsupported callbacks are provided.
             */
            function normalizeCallOptions(arg1, arg2) {
                let currentOptions = {};

                // Handle different call signatures
                if (typeof arg1 === "string") {
                    // Signature: (url, options) or (url)
                    currentOptions.url = arg1;
                    if (typeof arg2 === "object" && arg2 !== null) {
                        Object.assign(currentOptions, arg2); // Merge provided options
                    }
                } else if (typeof arg1 === "object" && arg1 !== null) {
                    // Signature: (options)
                    Object.assign(currentOptions, arg1);
                } else {
                    // Invalid argument type
                    const errorMsg = "Invalid arguments provided to remote utility function. Expected URL string or options object.";
                    if (AppFramework && AppFramework.Error) {
                        throw new AppFramework.Error(errorMsg);
                    } else {
                        throw new Error(errorMsg);
                    }
                }

                // Add a default HTTP method if none specified
                currentOptions.method = currentOptions.method || currentOptions.type || 'GET';
                delete currentOptions.type; // Standardize on 'method'

                // Ensure URL is present
                if (!currentOptions.url) {
                    const errorMsg = "Request options must include a 'url' property.";
                    if (AppFramework && AppFramework.Error) {
                        throw new AppFramework.Error(errorMsg);
                    } else {
                        throw new Error(errorMsg);
                    }
                }

                // Enforce promise-based API: disallow traditional callbacks
                validateNoCallbacks(currentOptions, ['success', 'error', 'complete']);

                return currentOptions;
            }

            /**
             * Creates a success callback for AppFramework.$.ajax that resolves the promise.
             * @param {Function} promiseResolve - The promise's resolve function.
             * @returns {Function} The success callback.
             */
            function buildSuccessCallback(promiseResolve) {
                return function(responseData, statusText, ajaxXHR) {
                    // Execute resolve in the framework's run loop for consistency
                    AppFramework.run(null, promiseResolve, {
                        payload: responseData,
                        statusText: statusText,
                        xhrObject: ajaxXHR
                    });
                };
            }

            /**
             * Creates an error callback for AppFramework.$.ajax that rejects the promise.
             * @param {Function} promiseReject - The promise's reject function.
             * @returns {Function} The error callback.
             */
            function buildErrorCallback(promiseReject) {
                return function(ajaxXHR, statusText, errorDetails) {
                    // Execute reject in the framework's run loop for consistency
                    AppFramework.run(null, promiseReject, {
                        xhrObject: ajaxXHR,
                        statusText: statusText,
                        errorDetails: errorDetails
                    });
                };
            }

            // --- Framework-Specific Integrations (e.g., Data Store Adapters) ---
            // This section conditionally extends a data store adapter if `window.DataStore` is present.
            if (typeof window.DataStore !== 'undefined') {
                // Wait for the application to load before attempting to modify its components
                AppFramework.onLoad('AppFramework.Application', function(ApplicationClass) {
                    ApplicationClass.initializer({
                        name: 'myLib_remoteUtils_DataStoreAdapter', // Renamed initializer
                        after: 'data-store-service', // Renamed 'store' to 'data-store-service'
                        initialize: function(appContainer, applicationInstance) {
                            // Only override if the flag is explicitly set
                            if (performCall.ADAPTER_OVERRIDE_FLAG) {
                                window.DataStore.RESTAdapter.reopen({ // Renamed DS to DataStore
                                    // Override the default ajax method for the REST adapter
                                    ajax: function(targetUrl, httpMethod, requestOptions) {
                                        // Merge adapter's options with the base options
                                        const mergedOptions = this.ajaxOptions(targetUrl, httpMethod, requestOptions);
                                        // Use our custom promise-based utility
                                        return performCall(mergedOptions); // Call the main API function
                                    }
                                });
                            } else {
                                console.log("myLib.remoteUtils: DataStore adapter override skipped (ADAPTER_OVERRIDE_FLAG is false).");
                            }
                        }
                    });
                });
            }
        }], // End of module 1 definition
    }, {}, [1]) // Bootstrap module 1
    (1); // Execute the factory with module 1
});