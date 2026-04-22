"no use strict";
// This script provides core worker functionality for a JavaScript environment,
// including a custom module system and communication utilities.
// It's designed to run within a Web Worker.
;(function(globalEnv) {
    // Prevent re-initialization if the environment is already set up.
    // This check ensures the worker initializes only once.
    if (typeof globalEnv.self !== "undefined" && globalEnv.document) {
        return; // Exit if already active in a document context (unlikely for a worker but good safeguard).
    }

    // --- Custom Console/Logger Implementation ---
    // Redirects console messages to the main thread via postMessage.
    globalEnv.workerLog = function() {
        const logEntries = [...arguments]; // Convert arguments to a real array.
        // Attempt to send the log message to the main thread.
        try {
            globalEnv.postMessage({messageType: "logOutput", payload: logEntries});
        } catch (e) {
            // Fallback for environments where postMessage might not be available or fails.
            // In a worker, postMessage should always be available. This is mostly defensive.
            console.warn("Failed to post log message:", e, logEntries);
        }
    };

    // Alias common console methods to the custom logger.
    // This makes sure 'console.error', 'console.warn', etc., all use `workerLog`.
    globalEnv.workerLog.error =
    globalEnv.workerLog.warn =
    globalEnv.workerLog.info =
    globalEnv.workerLog.debug =
    globalEnv.workerLog.trace = globalEnv.workerLog;

    // Map standard 'console' to our custom implementation.
    globalEnv.console = globalEnv.workerLog;

    // --- Global Object References ---
    // Establishes self-references for compatibility or convenience.
    globalEnv.selfRef = globalEnv;
    globalEnv.aceEngine = globalEnv; // A specific alias for the ACE editor context.

    // --- Error Handling for the Worker ---
    // Catches uncaught errors within the worker and reports them to the main thread.
    globalEnv.onErrorOccurred = function(errorMessage, scriptFile, lineNumber, columnNumber, errorObject) {
        let errorDetails = errorObject && errorObject.stack ? errorObject.stack : errorMessage;
        // Prefix the error message for clarity.
        globalEnv.console.error(`Worker execution failure: ${errorDetails}`);
        // Optionally, could post a specific error message type back to the main thread.
    };
    globalEnv.onerror = globalEnv.onErrorOccurred;


    // --- Module Path Normalization ---
    // Standardizes module identifiers, resolving relative paths and handling special prefixes.
    globalEnv.standardizeModuleIdentifier = function(baseIdentifier, moduleReference) {
        // Handle "!" separator for loader plugins (e.g., "text!./template.html").
        if (moduleReference.includes("!")) {
            const pathParts = moduleReference.split("!");
            // Recursively normalize both parts of the path.
            return `${globalEnv.standardizeModuleIdentifier(baseIdentifier, pathParts[0])}!${globalEnv.standardizeModuleIdentifier(baseIdentifier, pathParts[1])}`;
        }

        // Resolve relative paths (starting with ".").
        if (moduleReference.startsWith(".")) {
            // Determine the base directory of the parent module.
            const parentDirectory = baseIdentifier.substring(0, baseIdentifier.lastIndexOf('/')) || '';
            let resolvedPath = parentDirectory ? `${parentDirectory}/${moduleReference}` : moduleReference;

            // Simplify ".." and "." in paths.
            let priorPath;
            do {
                priorPath = resolvedPath;
                resolvedPath = resolvedPath
                    .replace(/^\.\//, "")             // Remove leading "./"
                    .replace(/\/\.\//g, "/")          // Remove "/./"
                    .replace(/[^\/]+\/\.\.\//g, "");  // Resolve "../" (e.g., "foo/../bar" -> "bar")
            } while (priorPath !== resolvedPath); // Continue until no more changes are made.

            return resolvedPath;
        }

        return moduleReference; // Return as-is if no special handling is needed.
    };


    // --- Custom Module Loader (`require`) ---
    // Implements a simplified AMD-like module loading mechanism.
    globalEnv.obtainModule = function(contextIdentifier, targetModuleId) {
        // Handle cases where only one argument is provided (acting as `id`).
        if (!targetModuleId) {
            targetModuleId = contextIdentifier;
            contextIdentifier = null;
        }

        // Basic validation for module ID.
        if (typeof targetModuleId !== 'string') {
            throw new Error("obtainModule() requires string identifiers for module loading.");
        }

        // Normalize the module identifier to a canonical form.
        const normalizedId = globalEnv.standardizeModuleIdentifier(contextIdentifier, targetModuleId);

        // Check if the module is already cached.
        let cachedModuleData = globalEnv.obtainModule.moduleCache[normalizedId];
        if (cachedModuleData) {
            // Initialize the module if it hasn't been already.
            if (!cachedModuleData.hasBeenInitialized) {
                cachedModuleData.hasBeenInitialized = true;
                cachedModuleData.exportedValue = cachedModuleData.factoryFunction().exportedValue;
            }
            return cachedModuleData.exportedValue;
        }

        // If not cached, attempt to load it.
        const pathSegments = normalizedId.split("/");
        // Resolve top-level namespaces if configured.
        if (!globalEnv.obtainModule.namespaceMap) {
            // If top-level namespaces are not set up, log an error and return.
            // This is a critical dependency for module loading.
            globalEnv.console.error(`Cannot load module '${normalizedId}': Top-level namespace mappings are absent.`);
            return undefined; // Or throw an error depending on desired strictness.
        }
        pathSegments[0] = globalEnv.obtainModule.namespaceMap[pathSegments[0]] || pathSegments[0];
        const moduleScriptPath = `${pathSegments.join("/")}.js`;

        // Store the ID of the module currently being resolved.
        globalEnv.obtainModule.currentlyResolvingId = normalizedId;

        // Use `importScripts` to load the module synchronously.
        // This will execute the `define` call for the module.
        try {
            globalEnv.importScripts(moduleScriptPath);
        } catch (e) {
            globalEnv.console.error(`Error loading module script '${moduleScriptPath}':`, e);
            // Re-attempt to obtain the module after loading, in case `define` was called.
            // This recursive call ensures the module is returned if it was defined,
            // or reports failure if not.
            return globalEnv.obtainModule(contextIdentifier, normalizedId);
        }

        // After `importScripts`, the module should be in the cache.
        // Try to obtain it again.
        return globalEnv.obtainModule(contextIdentifier, normalizedId);
    };
    // Initialize module cache and namespace map.
    globalEnv.obtainModule.moduleCache = {};
    globalEnv.obtainModule.namespaceMap = {};


    // --- Custom Module Definition (`define`) ---
    // Allows modules to register themselves with the loader.
    globalEnv.declareModule = function(moduleIdentifier, moduleDependencies, moduleFactoryFunction) {
        let currentId = moduleIdentifier;
        let actualDependencies = moduleDependencies;
        let finalFactory = moduleFactoryFunction;

        // Handle flexible argument signatures:
        // define(deps, factory)
        if (arguments.length === 2 && typeof moduleIdentifier !== "string") {
            finalFactory = moduleDependencies;
            actualDependencies = moduleIdentifier;
            currentId = globalEnv.obtainModule.currentlyResolvingId; // Use the ID from the `require` call.
        }
        // define(factory)
        else if (arguments.length === 1) {
            finalFactory = moduleIdentifier;
            actualDependencies = []; // No explicit dependencies.
            currentId = globalEnv.obtainModule.currentlyResolvingId;
        }

        // Ensure currentId is properly set, if still null, default to a fallback or throw.
        if (!currentId) {
            globalEnv.console.warn("Module defined without an explicit ID or active resolution context.");
            currentId = `anonymous_module_${Date.now()}`; // Fallback ID.
        }

        // Default dependencies if none are provided.
        if (actualDependencies.length === 0) {
            actualDependencies = ['obtainModule', 'exports', 'module'];
        }

        // Skip "text!" modules as they are handled by a different loader (or ignored here).
        if (currentId.startsWith("text!")) {
            globalEnv.console.debug(`Skipping definition for text module: ${currentId}`);
            return;
        }

        // Helper function to resolve individual dependencies.
        const resolveDependency = function(childId) {
            return globalEnv.obtainModule(currentId, childId);
        };

        // Store the module definition in the cache.
        globalEnv.obtainModule.moduleCache[currentId] = {
            exportedValue: {}, // Default empty exports object.
            hasBeenInitialized: Boolean(0), // Flag to track initialization status.
            factoryFunction: function() {
                const moduleContext = this; // 'this' will be the module object itself.
                const dependencyInstances = actualDependencies.map(function(depName) {
                    switch(depName) {
                        case 'obtainModule': return resolveDependency;
                        case 'exports': return moduleContext.exportedValue;
                        case 'module':  return moduleContext;
                        default:        return resolveDependency(depName);
                    }
                });

                // Execute the factory function.
                const factoryResult = finalFactory.apply(moduleContext, dependencyInstances);

                // If the factory returns a value, it becomes the module's export.
                if (factoryResult) {
                    moduleContext.exportedValue = factoryResult;
                }
                return moduleContext; // Return the module object.
            }
        };
    };
    // Indicate AMD compliance.
    globalEnv.declareModule.isAmdCompliant = {};


    // --- Global Configuration Functions ---
    // Sets up top-level namespace mappings for the module loader.
    globalEnv.setupNamespaceMappings = function(namespaceConfiguration) {
        globalEnv.obtainModule.namespaceMap = namespaceConfiguration;
    };

    // Initializes the communication agent for sending messages back to the main thread.
    globalEnv.initializeCommunicationAgent = function() {
        // Ensure postMessage is available before proceeding.
        if (typeof globalEnv.postMessage !== 'function') {
            globalEnv.console.error("postMessage API is not available in this worker environment.");
            return null;
        }

        // Load necessary utility modules using our custom loader.
        const EventDispatcher = globalEnv.obtainModule("ace/lib/event_emitter").EventEmitter;
        const objectUtilities = globalEnv.obtainModule("ace/lib/oop");

        // Define the WorkerCommunicator class.
        const WorkerCommunicator = function() {};

        // Extend WorkerCommunicator with EventDispatcher capabilities.
        (function() {
            objectUtilities.applyMixins(this, EventDispatcher);

            // Method to send a response to a specific callback ID in the main thread.
            this.sendCallbackResponse = function(responseData, callbackIdentifier) {
                globalEnv.postMessage({
                    responseType: "callbackResponse",
                    callbackId: callbackIdentifier,
                    dataPayload: responseData
                });
            };

            // Method to dispatch a custom event to the main thread.
            this.dispatchWorkerEvent = function(eventName, eventPayload) {
                globalEnv.postMessage({
                    responseType: "workerEvent",
                    eventName: eventName,
                    dataPayload: eventPayload
                });
            };

        }).call(WorkerCommunicator.prototype); // Apply methods to the prototype.

        return new WorkerCommunicator(); // Return an instance of the communicator.
    };

    // --- Worker Global State Variables ---
    let applicationCoreInstance = null; // Holds the main application logic instance.
    let workerCommunicationAgent = null; // Handles communication with the main thread.
    globalEnv.applicationCore = applicationCoreInstance;
    globalEnv.workerAgent = workerCommunicationAgent;

    // --- Main Message Handler for Incoming Messages ---
    // Processes messages sent from the main thread to this worker.
    globalEnv.onWorkerMessage = function(eventData) {
        const receivedMessage = eventData.data; // The actual message payload.

        // Handle command execution requests.
        if (receivedMessage.actionType) {
            if (applicationCoreInstance && typeof applicationCoreInstance[receivedMessage.actionType] === 'function') {
                applicationCoreInstance[receivedMessage.actionType].apply(applicationCoreInstance, receivedMessage.actionArgs);
            } else {
                // Log and throw an error for unknown commands.
                const errMsg = `Unknown command received: ${receivedMessage.actionType}`;
                globalEnv.console.error(errMsg, receivedMessage);
                throw new Error(errMsg);
            }
        }
        // Handle worker initialization messages.
        else if (receivedMessage.initializationRequest) {
            // Setup base URLs for module loading.
            globalEnv.setupNamespaceMappings(receivedMessage.initialMappings);
            // Load essential shims for older JS compatibility.
            globalEnv.obtainModule("ace/lib/es5-shim");
            // Initialize the communication agent.
            workerCommunicationAgent = globalEnv.workerAgent = globalEnv.initializeCommunicationAgent();

            // Load and instantiate the main application class.
            const mainModulePath = receivedMessage.modulePath;
            const mainClassName = receivedMessage.className;

            if (!mainModulePath || !mainClassName) {
                globalEnv.console.error("Initialization request missing modulePath or className.");
                return;
            }

            const mainModule = globalEnv.obtainModule(mainModulePath);
            const mainClassConstructor = mainModule ? mainModule[mainClassName] : null;

            if (typeof mainClassConstructor === 'function') {
                applicationCoreInstance = globalEnv.applicationCore = new mainClassConstructor(workerCommunicationAgent);
            } else {
                globalEnv.console.error(`Could not find constructor '${mainClassName}' in module '${mainModulePath}'.`, mainModule);
            }
        }
        // Handle internal event signaling.
        else if (receivedMessage.internalEvent && workerCommunicationAgent) {
            workerCommunicationAgent.triggerEvent(receivedMessage.eventName, receivedMessage.eventData);
        }
        // Handle unrecognised message types.
        else {
            globalEnv.console.warn("Received unhandled message type:", receivedMessage);
        }
    };
})(this); // Pass 'this' (which is the global scope in a worker) to the IIFE.


// --- ACE Editor Specific Module Definitions (Type III Clones) ---

// Module: 'ace/mode/html_worker'
aceEngine.declareModule('ace/mode/html_worker', ['obtainModule', 'exports', 'module' , 'ace/lib/oop', 'ace/lib/lang', 'ace/worker/mirror', 'ace/mode/html/saxparser'], function(depRequire, moduleExports, moduleMeta) {

    // Internal module dependencies.
    const objectHelpers = depRequire("../lib/oop");
    const utilityFunctions = depRequire("../lib/lang");
    const DocumentMirror = depRequire("../worker/mirror").Mirror;
    const HtmlContentParser = depRequire("./html/saxparser").SAXParser;

    // Mapping for HTML parser error codes to severity levels.
    const problemSeverityMap = {
        "expected-doctype-but-got-start-tag": "info",
        "expected-doctype-but-got-chars": "info",
        "non-html-root": "info",
        // Default to "error" if not specified.
    };

    /**
     * @class HtmlWorkerProcessor
     * @augments DocumentMirror
     * Processes HTML content for syntax validation and emits errors.
     */
    const HtmlWorkerProcessor = moduleExports.Worker = function(messageChannel) {
        DocumentMirror.call(this, messageChannel); // Call parent constructor.
        this.setTimeout(400); // Set a debounced update timeout.
        this.parsingContext = null; // Stores HTML parsing context (e.g., 'body', 'head').
    };

    // Establish inheritance.
    objectHelpers.establishInheritance(HtmlWorkerProcessor, DocumentMirror);

    // HtmlWorkerProcessor prototype methods.
    (function() {
        /**
         * Configures the HTML worker with new options.
         * @param {object} options - Configuration options, e.g., `{context: "body"}`.
         */
        this.configureProcessor = function(options) {
            if (options && typeof options === 'object') {
                this.parsingContext = options.context || null;
            } else {
                this.parsingContext = null; // Reset context if options are invalid.
            }
        };

        /**
         * Called when the document content is updated. Triggers HTML parsing and error reporting.
         */
        this.processContentUpdate = function() {
            const documentContent = this.doc.getValue();
            if (!documentContent) {
                // If content is empty, clear any existing errors and return.
                this.messageChannel.dispatchWorkerEvent("error", []);
                return;
            }

            const htmlParserInstance = new HtmlContentParser();
            const detectedIssues = []; // Array to collect parsing errors.

            // Define no-op handlers for content events to prevent default SAX actions.
            const emptyHandler = () => {};
            htmlParserInstance.contentHandler = {
                startDocument: emptyHandler,
                endDocument: emptyHandler,
                startElement: emptyHandler,
                endElement: emptyHandler,
                characters: emptyHandler
            };

            // Custom error handler to capture and format parsing issues.
            htmlParserInstance.errorHandler = {
                error: function(issueMessage, issueLocation, issueCode) {
                    detectedIssues.push({
                        row: issueLocation.line,
                        column: issueLocation.column,
                        issueDescription: issueMessage,
                        issueSeverity: problemSeverityMap[issueCode] || "error" // Default to "error".
                    });
                }
            };

            // Parse the content, either as a fragment or a full document.
            if (this.parsingContext) {
                htmlParserInstance.parseFragment(documentContent, this.parsingContext);
            } else {
                htmlParserInstance.parse(documentContent);
            }

            // Emit the collected errors to the main thread.
            this.messageChannel.dispatchWorkerEvent("error", detectedIssues);
        };

    }).call(HtmlWorkerProcessor.prototype); // Attach methods to prototype.

});

// Module: 'ace/lib/oop'
aceEngine.declareModule('ace/lib/oop', ['obtainModule', 'exports', 'module' ], function(depRequire, moduleExports, moduleMeta) {

    /**
     * Establishes classical inheritance between two constructors.
     * @param {function} childConstructor - The constructor function that will inherit.
     * @param {function} parentConstructor - The constructor function to inherit from.
     */
    moduleExports.establishInheritance = function(childConstructor, parentConstructor) {
        childConstructor.super_ = parentConstructor; // Store a reference to the super constructor.
        childConstructor.prototype = Object.create(parentConstructor.prototype, {
            constructor: {
                value: childConstructor,
                enumerable: Boolean(0), // Not enumerable.
                writable: Boolean(1),   // Writable.
                configurable: Boolean(1) // Configurable.
            }
        });
    };

    /**
     * Copies properties from a source object to a target object (shallow copy).
     * @param {object} targetObject - The object to which properties will be copied.
     * @param {object} sourceObject - The object from which properties will be copied.
     * @returns {object} The modified target object.
     */
    moduleExports.blendObjects = function(targetObject, sourceObject) {
        for (const keyProperty in sourceObject) {
            // Ensure the property is directly on the source object, not its prototype chain.
            if (Object.prototype.hasOwnProperty.call(sourceObject, keyProperty)) {
                targetObject[keyProperty] = sourceObject[keyProperty];
            }
        }
        return targetObject;
    };

    /**
     * Applies mixins to a prototype, effectively blending properties.
     * A convenience wrapper around `blendObjects`.
     * @param {object} prototypeObject - The prototype to which mixins will be applied.
     * @param {object} mixinSource - The object whose properties will be mixed in.
     */
    moduleExports.applyMixins = function(prototypeObject, mixinSource) {
        moduleExports.blendObjects(prototypeObject, mixinSource);
    };

});

// Module: 'ace/lib/lang'
aceEngine.declareModule('ace/lib/lang', ['obtainModule', 'exports', 'module' ], function(depRequire, moduleExports, moduleMeta) {

    const utilityFunctions = moduleExports; // Alias for convenience.

    /**
     * Returns the last element of an array.
     * @param {Array} inputArray - The array.
     * @returns {*} The last element, or `undefined` if the array is empty.
     */
    utilityFunctions.getLastElement = function(inputArray) {
        return inputArray[inputArray.length - 1];
    };

    /**
     * Reverses a string.
     * @param {string} inputString - The string to reverse.
     * @returns {string} The reversed string.
     */
    utilityFunctions.reverseString = function(inputString) {
        return inputString.split("").reverse().join("");
    };

    /**
     * Repeats a string a specified number of times.
     * Uses a binary exponentiation (doubling) algorithm for efficiency.
     * @param {string} inputString - The string to repeat.
     * @param {number} repeatCount - The number of times to repeat the string.
     * @returns {string} The repeated string.
     */
    utilityFunctions.repeatString = function (inputString, repeatCount) {
        let repeatedString = '';
        let currentString = inputString;
        let remainingCount = repeatCount;

        while (remainingCount > 0) {
            if (remainingCount & 1) { // If the last bit is 1, append currentString.
                repeatedString += currentString;
            }
            if (remainingCount >>= 1) { // Shift right by 1 (divide by 2).
                currentString += currentString; // Double the string for the next iteration.
            }
        }
        return repeatedString;
    };

    // Regular expressions for trimming whitespace.
    const startWhitespaceRegex = /^\s\s*/;
    const endWhitespaceRegex = /\s\s*$/;

    /**
     * Removes leading whitespace from a string.
     * @param {string} inputString - The string to trim.
     * @returns {string} The string with leading whitespace removed.
     */
    utilityFunctions.trimLeadingWhitespace = function (inputString) {
        return inputString.replace(startWhitespaceRegex, '');
    };

    /**
     * Removes trailing whitespace from a string.
     * @param {string} inputString - The string to trim.
     * @returns {string} The string with trailing whitespace removed.
     */
    utilityFunctions.trimTrailingWhitespace = function (inputString) {
        return inputString.replace(endWhitespaceRegex, '');
    };

    /**
     * Creates a shallow copy of an object.
     * @param {object} sourceObject - The object to copy.
     * @returns {object} A new object with the same properties and values as the source.
     */
    utilityFunctions.shallowCopyObject = function(sourceObject) {
        const copiedObject = {};
        for (const key in sourceObject) {
            if (Object.prototype.hasOwnProperty.call(sourceObject, key)) {
                copiedObject[key] = sourceObject[key];
            }
        }
        return copiedObject;
    };

    /**
     * Creates a shallow copy of an array. If array elements are objects, they are deep-copied.
     * NOTE: This behavior is a bit hybrid - shallow for primitives, deep for objects.
     * @param {Array} sourceArray - The array to copy.
     * @returns {Array} A new array with copied elements.
     */
    utilityFunctions.shallowCopyArray = function(sourceArray){
        const copiedArray = [];
        for (let i = 0, len = sourceArray.length; i < len; i++) {
            const currentElement = sourceArray[i];
            // If element is an object, deep copy it, otherwise shallow copy.
            copiedArray[i] = (currentElement && typeof currentElement === "object")
                ? utilityFunctions.createDeepClone(currentElement)
                : currentElement;
        }
        return copiedArray;
    };

    /**
     * Creates a deep clone of an object. Handles nested objects recursively.
     * Skips RegExp objects as they are complex to clone perfectly without losing state.
     * @param {*} sourceValue - The value to clone.
     * @returns {*} The deep cloned value.
     */
    utilityFunctions.createDeepClone = function (sourceValue) {
        // Primitive values or null are returned directly.
        if (typeof sourceValue !== "object" || sourceValue === null) {
            return sourceValue;
        }

        const originalConstructor = sourceValue.constructor;
        // Special handling for RegExp: return the original instance.
        if (originalConstructor === RegExp) {
            return sourceValue;
        }

        // Create a new instance using the original constructor.
        const clonedObject = new originalConstructor();
        for (const key in sourceValue) {
            if (Object.prototype.hasOwnProperty.call(sourceValue, key)) {
                const propertyValue = sourceValue[key];
                // Recursively deep copy nested objects.
                clonedObject[key] = (typeof propertyValue === "object" && propertyValue !== null)
                    ? utilityFunctions.createDeepClone(propertyValue)
                    : propertyValue;
            }
        }
        return clonedObject;
    };

    /**
     * Converts an array of strings into a map where array elements are keys and values are 1.
     * Useful for quick existence checks.
     * @param {Array<string>} stringArray - The input array.
     * @returns {object} A map object.
     */
    utilityFunctions.convertArrayToKeyMap = function(stringArray) {
        const keySetMap = {};
        for (let i = 0; i < stringArray.length; i++) {
            keySetMap[stringArray[i]] = 1;
        }
        return keySetMap;
    };

    /**
     * Creates an object with a null prototype and assigns properties.
     * Useful for creating plain data objects without inherited properties/methods.
     * @param {object} initialProperties - Properties to assign to the new object.
     * @returns {object} An object with a null prototype.
     */
    utilityFunctions.createNullPrototypeMap = function(initialProperties) {
        const nullProtoMap = Object.create(null);
        for (const propKey in initialProperties) {
            if (Object.prototype.hasOwnProperty.call(initialProperties, propKey)) {
                nullProtoMap[propKey] = initialProperties[propKey];
            }
        }
        return nullProtoMap;
    };

    /**
     * Removes all occurrences of a specific value from an array.
     * Modifies the array in place.
     * @param {Array} targetArray - The array to modify.
     * @param {*} valueToRemove - The value to remove.
     */
    utilityFunctions.removeValueFromArray = function(targetArray, valueToRemove) {
        let i = targetArray.length;
        while (i--) { // Iterate backwards to safely remove elements.
            if (targetArray[i] === valueToRemove) {
                targetArray.splice(i, 1);
            }
        }
    };

    /**
     * Escapes special characters in a string so it can be used safely in a regular expression.
     * @param {string} inputString - The string to escape.
     * @returns {string} The escaped string.
     */
    utilityFunctions.escapeRegexSpecialChars = function(inputString) {
        return inputString.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
    };

    /**
     * Escapes HTML entities in a string to prevent XSS.
     * @param {string} inputString - The string to escape.
     * @returns {string} The HTML-escaped string.
     */
    utilityFunctions.escapeHtmlEntities = function(inputString) {
        return inputString.replace(/&/g, "&#38;")
                         .replace(/"/g, "&#34;")
                         .replace(/'/g, "&#39;")
                         .replace(/</g, "&#60;");
    };

    /**
     * Finds all occurrences of a regular expression in a string and returns their offsets and lengths.
     * @param {string} textContent - The string to search within.
     * @param {RegExp} searchRegex - The regular expression to use for matching.
     * @returns {Array<object>} An array of objects, each with `offset` and `length` properties.
     */
    utilityFunctions.findRegexMatchOffsets = function(textContent, searchRegex) {
        const foundMatches = [];
        textContent.replace(searchRegex, function(matchedString) {
            // The last two arguments of the replace callback are the offset and the original string.
            const offset = arguments[arguments.length - 2];
            foundMatches.push({
                offset: offset,
                length: matchedString.length
            });
            return matchedString; // Return matched string to not alter the original.
        });
        return foundMatches;
    };

    /**
     * Creates a debounced function. The function will only execute after a specified delay
     * since the last time it was called. Subsequent calls within the delay period reset the timer.
     * @param {function} funcToDebounce - The function to debounce.
     * @returns {object} An object with methods to schedule, call immediately, cancel, and check pending status.
     */
    utilityFunctions.createDebouncedFunction = function(funcToDebounce) {
        let debounceTimer = null; // Holds the timeout ID.

        const executeDebouncedCallback = function() {
            debounceTimer = null;
            funcToDebounce();
        };

        const debouncedHandler = function(delayMs) {
            debouncedHandler.cancel(); // Clear any existing timer.
            debounceTimer = setTimeout(executeDebouncedCallback, delayMs || 0);
            return debouncedHandler;
        };

        debouncedHandler.schedule = debouncedHandler; // Alias for convenience.

        debouncedHandler.callImmediately = function() {
            this.cancel(); // Cancel any pending debounce.
            funcToDebounce();
            return debouncedHandler;
        };

        debouncedHandler.cancel = function() {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
                debounceTimer = null;
            }
            return debouncedHandler;
        };

        debouncedHandler.isPending = function() {
            return Boolean(debounceTimer); // Returns true if a timer is active.
        };

        return debouncedHandler;
    };


    /**
     * Creates a throttled function. The function will execute at most once per a specified delay.
     * Subsequent calls within the delay period are ignored or queued for later execution.
     * @param {function} funcToThrottle - The function to throttle.
     * @param {number} defaultDelay - The default delay in milliseconds.
     * @returns {object} An object with methods to schedule, call immediately, cancel, and check pending status.
     */
    utilityFunctions.createThrottledFunction = function(funcToThrottle, defaultDelay) {
        let throttleTimer = null; // Holds the timeout ID.

        const executeThrottledCallback = function() {
            throttleTimer = null;
            funcToThrottle();
        };

        const throttledHandler = function(delayMs) {
            // Only schedule if no timer is currently active.
            if (throttleTimer === null) {
                throttleTimer = setTimeout(executeThrottledCallback, delayMs || defaultDelay);
            }
        };

        throttledHandler.delayExecution = function(delayMs) {
            // Clear existing timer and reschedule.
            if (throttleTimer) {
                clearTimeout(throttleTimer);
            }
            throttleTimer = setTimeout(executeThrottledCallback, delayMs || defaultDelay);
        };
        throttledHandler.schedule = throttledHandler; // Alias.

        throttledHandler.callImmediately = function() {
            this.cancel(); // Cancel any pending throttle.
            funcToThrottle();
        };

        throttledHandler.cancel = function() {
            if (throttleTimer) {
                clearTimeout(throttleTimer);
                throttleTimer = null;
            }
        };

        throttledHandler.isPending = function() {
            return Boolean(throttleTimer); // Returns true if a timer is active.
        };

        return throttledHandler;
    };

});

// Module: 'ace/lib/es5-shim'
aceEngine.declareModule('ace/lib/es5-shim', ['obtainModule', 'exports', 'module' ], function(depRequire, moduleExports, moduleMeta) {

    // A no-operation constructor for prototype chain manipulation.
    function NoopConstructor() {}

    // Polyfill for Function.prototype.bind
    if (!Function.prototype.bind) {
        Function.prototype.bind = function boundFunction(thisArg) {
            const originalFunction = this;
            // Ensure 'this' is a callable function.
            if (typeof originalFunction !== "function") {
                throw new TypeError("Function.prototype.bind called on an incompatible object: " + originalFunction);
            }

            // Capture any arguments passed to bind, excluding the 'thisArg'.
            const initialArgs = arraySliceMethod.call(arguments, 1);

            // The new bound function.
            const newBoundFunction = function () {
                // If the bound function is called with 'new', it acts as a constructor.
                if (this instanceof newBoundFunction) {
                    // Create an instance, apply original function with combined arguments.
                    const executionResult = originalFunction.apply(
                        this,
                        initialArgs.concat(arraySliceMethod.call(arguments)) // Combine initial args with call-time args.
                    );
                    // If the original function returned an object, use that; otherwise, use 'this'.
                    if (Object(executionResult) === executionResult) {
                        return executionResult;
                    }
                    return this; // Return the new instance.
                } else {
                    // If called as a regular function, apply with the specified 'thisArg'.
                    return originalFunction.apply(
                        thisArg,
                        initialArgs.concat(arraySliceMethod.call(arguments))
                    );
                }
            };

            // Maintain the prototype chain for instances created with 'new'.
            if(originalFunction.prototype) {
                NoopConstructor.prototype = originalFunction.prototype;
                newBoundFunction.prototype = new NoopConstructor();
                NoopConstructor.prototype = null; // Clear to prevent memory leaks.
            }
            return newBoundFunction;
        };
    }

    // Cache frequently used native methods for performance and consistency.
    const functionCallMethod = Function.prototype.call;
    const arrayProto = Array.prototype;
    const objectProto = Object.prototype;
    const arraySliceMethod = functionCallMethod.bind(arrayProto.slice); // `Array.prototype.slice.call` equivalent.
    const objectToString = functionCallMethod.bind(objectProto.toString); // `Object.prototype.toString.call` equivalent.
    const objectHasOwnProperty = functionCallMethod.bind(objectProto.hasOwnProperty); // `Object.prototype.hasOwnProperty.call` equivalent.

    // Export these for potential external use if needed, though they are mostly internal shims.
    moduleExports.slice = arraySliceMethod;
    moduleExports.toString = objectToString;
    moduleExports.hasOwnProperty = objectHasOwnProperty;

});