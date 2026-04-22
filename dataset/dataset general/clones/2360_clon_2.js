"no use strict";
;(function(globalScope) {
// Check if the environment is already initialized, if so, exit.
if (typeof globalScope.thisScope !== "undefined" && globalScope.docHandler) {
    return;
}

// Polyfill for console functionality in web workers
globalScope.debugOutput = function() {
    // Convert arguments object to a true array for messaging
    var logEntries = Array.prototype.slice.apply(arguments, [0]);
    // Send a message to the main thread with log data
    postMessage({ eventKind: "record", info: logEntries });
};

// Alias various console methods to the main debug output function
globalScope.debugOutput.reportError =
globalScope.debugOutput.alertUser =
globalScope.debugOutput.emitMessage =
globalScope.debugOutput.trackCall = globalScope.debugOutput;

// Self-reference global scope
globalScope.thisScope = globalScope;
// Define a core application object
globalScope.kernel = globalScope;

// Global error handler for uncaught exceptions
globalScope.onFailure = function(errorMsg, sourceFile, lineNumber, columnNumber, errorObject) {
    // Log the error using the custom debug output
    debugOutput.reportError("Worker encountered an issue: " + (errorObject ? errorObject.stack : errorMsg));
};

// Function to standardize module paths
globalScope.standardizePath = function(basePath, resourceName) {
    // Handle "!" separators for special module types
    if (resourceName.includes("!")) {
        var pathSegments = resourceName.split("!");
        return globalScope.standardizePath(basePath, pathSegments[0]) + "!" + globalScope.standardizePath(basePath, pathSegments[1]);
    }
    // Handle relative paths starting with "."
    if (resourceName.charCodeAt(0) === 46) {
        var origin = basePath.split("/").slice(0, -1).join("/");
        resourceName = (origin ? origin + "/" : "") + resourceName;

        // Resolve ".." and "." in the path
        var priorPath = "";
        while (resourceName.includes(".") && priorPath !== resourceName) {
            priorPath = resourceName;
            resourceName = resourceName.replace(/^\.\//, "") // Remove leading ./
                                     .replace(/\/\.\//, "/")  // Replace /./ with /
                                     .replace(/[^/]+\/\.\.\//, ""); // Resolve /foo/../ to /
        }
    }

    return resourceName;
};

// Module loading function
globalScope.fetchDependency = function(parentIdentifier, dependencyId) {
    // If only one argument is provided, it's the dependency ID
    if (!dependencyId) {
        dependencyId = parentIdentifier;
        parentIdentifier = null;
    }
    // Validate that dependencyId is a string
    if (typeof dependencyId !== "string")
        throw new Error("task_executor.js fetchDependency() accepts only (parentIdentifier, dependencyId) as arguments");

    // Normalize the module path
    dependencyId = globalScope.standardizePath(parentIdentifier, dependencyId);

    // Check if the module is already registered
    var component = globalScope.fetchDependency.registeredItems[dependencyId];
    if (component) {
        // Initialize if not already done
        if (!component.isPrepared) {
            component.isPrepared = true;
            component.exportsOutput = component.creatorFunction().exportsOutput;
        }
        return component.exportsOutput; // Return the exported module content
    }

    // If module not found, attempt to load it via script import
    var pathParts = dependencyId.split("/");
    if (!globalScope.fetchDependency.topLevelMappings)
        return debugOutput.emitMessage("Unable to load " + dependencyId);
    // Resolve top-level namespace if present
    pathParts[0] = globalScope.fetchDependency.topLevelMappings[pathParts[0]] || pathParts[0];
    var filePath = pathParts.join("/") + ".js"; // Construct full file path

    // Set current ID for define calls
    globalScope.fetchDependency.currentId = dependencyId;
    // Dynamically load the script
    importScripts(filePath);
    // Recursively call fetchDependency to get the now-loaded module
    return globalScope.fetchDependency(parentIdentifier, dependencyId);
};
// Store for registered modules
globalScope.fetchDependency.registeredItems = {};
// Store for top-level namespace mappings
globalScope.fetchDependency.topLevelMappings = {};

// Module definition function (AMD style)
globalScope.declareComponent = function(componentId, dependencies, creationFunction) {
    // Handle different argument signatures
    if (arguments.length === 2) {
        creationFunction = dependencies;
        if (typeof componentId !== "string") {
            dependencies = componentId;
            componentId = globalScope.fetchDependency.currentId;
        }
    } else if (arguments.length === 1) {
        creationFunction = componentId;
        dependencies = [];
        componentId = globalScope.fetchDependency.currentId;
    }

    // Default dependencies if none provided
    if (dependencies.length === 0)
        dependencies = ['fetchDependency', 'exportsOutput', 'thisComponent'];

    // Skip text plugin modules for now
    if (componentId.startsWith("text!"))
        return;

    // Local require function for the current module
    var dependentLoader = function(nestedId) {
        return globalScope.fetchDependency(componentId, nestedId);
    };

    // Register the module factory
    globalScope.fetchDependency.registeredItems[componentId] = {
        exportsOutput: {}, // Initial empty exports object
        creatorFunction: function() {
            var currentComponent = this; // Reference to the module object

            // Map dependencies to their actual values
            var finalExports = creationFunction.apply(this, dependencies.map(function(depItem) {
              switch(depItem) {
                  case 'fetchDependency': return dependentLoader; // Local require
                  case 'exportsOutput':   return currentComponent.exportsOutput; // Module exports object
                  case 'thisComponent':   return currentComponent; // Module instance
                  default:                return dependentLoader(depItem); // Other dependencies
              }
            }));
            // If the factory returns a value, it becomes the module's exports
            if (finalExports)
                currentComponent.exportsOutput = finalExports;
            return currentComponent; // Return the module object
        }
    };
};
// Indicate AMD compliance
globalScope.declareComponent.asyncModuleDefinition = {};

// Initialize base URLs for module resolution
globalScope.initializePaths = function initializePaths(namespaceMappings) {
    fetchDependency.topLevelMappings = namespaceMappings;
};

// Prepare the communication sender for the worker
globalScope.prepareCommunicator = function prepareCommunicator() {

    // Load necessary utility modules
    var MessageEmitter = globalScope.fetchDependency("kernel/utilities/message_emitter").MessageEmitter;
    var objectUtils    = globalScope.fetchDependency("kernel/utilities/object_tools");

    // Define the Communicator class
    var Communicator = function() {};

    // Implement EventEmitter functionality for Communicator prototype
    (function() {

        objectUtils.applyMixins(this, MessageEmitter); // Mixin event handling methods

        // Method to send a callback response
        this.respondToCall = function(responseData, callbackIdentifier) {
            postMessage({
                messageType: "response",
                identifier: callbackIdentifier,
                payload: responseData
            });
        };

        // Method to dispatch an event
        this.dispatch = function(eventName, eventPayload) {
            postMessage({
                messageType: "notification",
                eventName: eventName,
                eventPayload: eventPayload
            });
        };

    }).call(Communicator.prototype); // Apply methods to Communicator's prototype

    return new Communicator(); // Return a new instance of the communicator
};

// Global variables for the main application instance and its communicator
var primaryApp = globalScope.primaryApp = null;
var appCommunicator = globalScope.appCommunicator = null;

// Handler for incoming messages from the main thread
globalScope.onIncomingMessage = function(eventObject) {
    var receivedData = eventObject.data; // Extract message data

    // Handle commands
    if (receivedData.action) {
        if (primaryApp[receivedData.action])
            primaryApp[receivedData.action].apply(primaryApp, receivedData.parameters); // Execute command on main app instance
        else
            throw new Error("Unknown command: " + receivedData.action);
    }
    // Handle initialization message
    else if (receivedData.initialize) {
        initializePaths(receivedData.namespaceMaps); // Set up module paths
        fetchDependency("kernel/utilities/legacy_support"); // Load ES5 shim
        appCommunicator = globalScope.appCommunicator = prepareCommunicator(); // Create and assign communicator
        var constructorRef = fetchDependency(receivedData.componentModule)[receivedData.componentClass]; // Get main app class
        primaryApp = globalScope.primaryApp = new constructorRef(appCommunicator); // Instantiate main app
    }
    // Handle events
    else if (receivedData.notification && appCommunicator) {
        appCommunicator._notifyListeners(receivedData.notification, receivedData.payload); // Signal event through communicator
    }
};
})(this); // Execute the IIFE with 'this' as the global scope (Window or WorkerGlobalScope)

kernel.declareComponent('kernel/modes/markup_processor', ['fetchDependency', 'exportsOutput', 'thisComponent'], function(fetchDependency, moduleExports, moduleHandle) { // Define the HTML worker component


var objectUtils = fetchDependency("../utilities/object_tools"); // Import object utility functions
var stringTools = fetchDependency("../utilities/string_helpers"); // Import string utility functions
var Reflector = fetchDependency("../task_runner/reflector").Reflector; // Import base Mirror worker functionality
var XMLStreamParser = fetchDependency("./markup/xmlstreamparser").XMLStreamParser; // Import the SAX parser for HTML

// Mapping of specific error codes to their severity types
var issueCategories = {
    "expected-doctype-but-got-start-tag": "info",
    "expected-doctype-but-got-chars": "info",
    "non-html-root": "info",
};

// The main TaskProcessor class for HTML analysis
var TaskProcessor = moduleExports.TaskProcessor = function(msgCommunicator) {
    Reflector.call(this, msgCommunicator); // Call the base constructor
    this.setDelay(400); // Set a processing delay (e.g., for debouncing)
    this.parsingContext = null; // Initialize parsing context
};

objectUtils.inheritFrom(TaskProcessor, Reflector); // Inherit from the Reflector base class

(function() {

    // Method to configure worker settings
    this.configureSettings = function(configuration) {
        this.parsingContext = configuration.contextData; // Update parsing context
    };

    // Method executed when document content is updated
    this.processContent = function() {
        var documentText = this.documentHandle.retrieveValue(); // Get current document content
        if (!documentText)
            return; // If no content, do nothing

        var streamProcessor = new XMLStreamParser(); // Create a new SAX parser instance
        var foundIssues = []; // Array to store detected errors/warnings
        var doNothing = function(){}; // A no-op function for content handler callbacks

        // Assign content handler methods (mostly no-ops for this worker)
        streamProcessor.contentHandler = {
           beginDocument: doNothing,
           endDocument: doNothing,
           beginElement: doNothing,
           endElement: doNothing,
           textContent: doNothing
        };

        // Assign error handler
        streamProcessor.errorHandler = {
            reportProblem: function(problemMessage, position, errorCode) {
                // Push error details into the foundIssues array
                foundIssues.push({
                    lineNum: position.lineNumber,
                    charCol: position.columnIndex,
                    description: problemMessage,
                    issueKind: issueCategories[errorCode] || "error" // Default to "error" if category not found
                });
            }
        };

        // Parse the document, either as a fragment or a full document
        if (this.parsingContext)
            streamProcessor.parseFragment(documentText, this.parsingContext);
        else
            streamProcessor.parseFull(documentText);

        // Emit the collected errors back to the main thread
        this.msgCommunicator.dispatch("parsingError", foundIssues);
    };

}).call(TaskProcessor.prototype); // Apply methods to TaskProcessor's prototype

}); // End of kernel.declareComponent for 'kernel/modes/markup_processor'

kernel.declareComponent('kernel/utilities/object_tools', ['fetchDependency', 'exportsOutput', 'thisComponent'], function(fetchDependency, moduleExports, moduleHandle) {


// Function to establish inheritance between constructor functions
moduleExports.inheritFrom = function(childClass, baseClass) {
    childClass.parentClass = baseClass; // Store a reference to the super constructor
    childClass.prototype = Object.create(baseClass.prototype, {
        ctorProperty: { // Renamed 'constructor' to avoid direct override, but maintains its role
            value: childClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
};

// Function to copy properties from a mixin object to a target object
moduleExports.applyPartial = function(targetObject, sourceMixin) {
    for (var propName in sourceMixin) {
        targetObject[propName] = sourceMixin[propName]; // Copy each property
    }
    return targetObject;
};

// Function to apply mixin properties to a prototype (often used for interfaces/traits)
moduleExports.applyMixins = function(targetPrototype, sourceMixin) {
    moduleExports.applyPartial(targetPrototype, sourceMixin); // Use applyPartial for the actual copying
};

}); // End of kernel.declareComponent for 'kernel/utilities/object_tools'

kernel.declareComponent('kernel/utilities/string_helpers', ['fetchDependency', 'exportsOutput', 'thisComponent'], function(fetchDependency, moduleExports, moduleHandle) {


// Get the last element of an array
moduleExports.getLastElement = function(inputArray) {
    return inputArray[inputArray.length - 1];
};

// Reverse a string
moduleExports.reverseString = function(textValue) {
    return textValue.split("").reverse().join("");
};

// Repeat a string a specified number of times
moduleExports.repeatString = function (textValue, repetitions) {
    var repeatedText = '';
    while (repetitions > 0) {
        if (repetitions & 1) // If repetitions is odd
            repeatedText += textValue;

        if (repetitions >>= 1) // Divide repetitions by 2 (integer division)
            textValue += textValue; // Double the string for next iteration
    }
    return repeatedText;
};

// Regular expressions for trimming whitespace
var leadingWhitespacePattern = /^\s\s*/;
var trailingWhitespacePattern = /\s\s*$/;

// Trim leading whitespace from a string
moduleExports.trimLeft = function (textValue) {
    return textValue.replace(leadingWhitespacePattern, '');
};

// Trim trailing whitespace from a string
moduleExports.trimRight = function (textValue) {
    return textValue.replace(trailingWhitespacePattern, '');
};

// Create a shallow copy of an object
moduleExports.cloneObject = function(sourceObject) {
    var duplicatedObject = {};
    for (var propKey in sourceObject) {
        duplicatedObject[propKey] = sourceObject[propKey];
    }
    return duplicatedObject;
};

// Create a shallow copy of an array, deeply copying nested objects if found
moduleExports.cloneArray = function(sourceArray){
    var duplicatedArray = [];
    for (var index = 0, len = sourceArray.length; index < len; index++) {
        if (sourceArray[index] && typeof sourceArray[index] === "object")
            duplicatedArray[index] = this.cloneObject( sourceArray[index] ); // Shallow copy nested objects
        else
            duplicatedArray[index] = sourceArray[index];
    }
    return duplicatedArray;
};

// Perform a recursive deep copy of an object
moduleExports.recursiveClone = function (sourceObject) {
    // Return primitive values or null directly
    if (typeof sourceObject !== "object" || !sourceObject)
        return sourceObject;

    var objectConstructor = sourceObject.constructor;
    // Special handling for RegExp objects (copy by reference)
    if (objectConstructor === RegExp)
        return sourceObject;

    var deepDuplication = objectConstructor(); // Create new object of the same type
    for (var propKey in sourceObject) {
        if (typeof sourceObject[propKey] === "object") {
            deepDuplication[propKey] = moduleExports.recursiveClone(sourceObject[propKey]); // Recursively clone nested objects
        } else {
            deepDuplication[propKey] = sourceObject[propKey]; // Copy primitive values
        }
    }
    return deepDuplication;
};

// Convert an array of strings into a hash map where values are 1
moduleExports.convertArrayToHashMap = function(inputArray) {
    var hashMap = {};
    for (var itemIndex = 0; itemIndex < inputArray.length; itemIndex++) {
        hashMap[inputArray[itemIndex]] = 1;
    }
    return hashMap;
};

// Create an object with null prototype, populating it with provided properties
moduleExports.createObjectMap = function(properties) {
    var objectMap = Object.create(null);
    for (var propName in properties) {
        objectMap[propName] = properties[propName];
    }
    return objectMap;
};

// Remove all occurrences of a specific value from an array
moduleExports.removeItemFromArray = function(targetArray, itemValue) {
    for (var idx = 0; idx <= targetArray.length; idx++) { // Note: Original logic iterates up to and including array.length
        if (itemValue === targetArray[idx]) {
            targetArray.splice(idx, 1); // Remove item
        }
    }
};

// Escape a string for use in a regular expression
moduleExports.escapeRegexString = function(inputString) {
    return inputString.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
};

// Escape HTML entities in a string
moduleExports.escapeHtmlEntities = function(inputString) {
    return inputString.replace(/&/g, "&#38;")
                      .replace(/"/g, "&#34;")
                      .replace(/'/g, "&#39;")
                      .replace(/</g, "&#60;");
};

// Get the offsets and lengths of all matches for a regex in a string
moduleExports.retrieveMatchPositions = function(sourceString, regexPattern) {
    var foundMatches = [];

    sourceString.replace(regexPattern, function(matchedText) {
        // arguments[arguments.length-2] is the offset of the match
        foundMatches.push({
            startOffset: arguments[arguments.length-2],
            lengthValue: matchedText.length
        });
    });

    return foundMatches;
};

// Creates a function that defers its execution until no calls are made for a certain timeout
moduleExports.deferExecution = function(actionFunction) {

    var timeoutHandle = null;
    var deferredCallback = function() {
        timeoutHandle = null;
        actionFunction();
    };

    var lazyExecutor = function(delayMilliseconds) {
        lazyExecutor.cancelPending(); // Clear any existing pending call
        timeoutHandle = setTimeout(deferredCallback, delayMilliseconds || 0); // Schedule new call
        return lazyExecutor;
    };

    lazyExecutor.scheduleCall = lazyExecutor; // Alias for scheduling

    lazyExecutor.executeNow = function() {
        this.cancelPending(); // Clear pending call
        actionFunction(); // Execute immediately
        return lazyExecutor;
    };

    lazyExecutor.cancelPending = function() {
        clearTimeout(timeoutHandle); // Clear the scheduled timeout
        timeoutHandle = null;
        return lazyExecutor;
    };

    lazyExecutor.isTaskPending = function() {
        return timeoutHandle; // Check if a task is currently pending
    };

    return lazyExecutor;
};


// Creates a function that throttles its execution, only calling after a delay if no new calls in that delay
moduleExports.throttleExecution = function(operation, defaultDelay) {
    var throttleTimer = null;
    var throttledCallback = function() {
        throttleTimer = null;
        operation();
    };

    var throttledFunction = function(delayMilliseconds) {
        if (throttleTimer === null) // Only schedule if no timer is active
            throttleTimer = setTimeout(throttledCallback, delayMilliseconds || defaultDelay);
    };

    throttledFunction.reschedule = function(delayMilliseconds) {
        throttleTimer && clearTimeout(throttleTimer); // Clear existing timer
        throttleTimer = setTimeout(throttledCallback, delayMilliseconds || defaultDelay); // Schedule new one
    };
    throttledFunction.scheduleAction = throttledFunction; // Alias for scheduling

    throttledFunction.performImmediately = function() {
        this.clearPending(); // Clear pending call
        operation(); // Execute immediately
    };

    throttledFunction.clearPending = function() {
        throttleTimer && clearTimeout(throttleTimer); // Clear the scheduled timeout
        throttleTimer = null;
    };

    throttledFunction.isActionScheduled = function() {
        return throttleTimer; // Check if an action is currently scheduled
    };

    return throttledFunction;
};
}); // End of kernel.declareComponent for 'kernel/utilities/string_helpers'

kernel.declareComponent('kernel/utilities/legacy_support', ['fetchDependency', 'exportsOutput', 'thisComponent'], function(fetchDependency, moduleExports, moduleHandle) {

// Dummy constructor for prototype chain manipulation
function DummyConstructor() {}

// Polyfill for Function.prototype.bind if not natively supported
if (!Function.prototype.bind) {
    Function.prototype.bind = function bind(that) { // .length is 1
        var originalFunction = this;
        // Ensure 'this' is a function
        if (typeof originalFunction != "function") {
            throw new TypeError("Function.prototype.bind called on incompatible " + originalFunction);
        }
        // Capture arguments passed to bind, excluding 'that'
        var boundArguments = Array.prototype.slice.call(arguments, 1);
        var newBoundFunction = function () {

            // If the bound function is used as a constructor (new operator)
            if (this instanceof newBoundFunction) {

                // Apply original function with 'this' context and combined arguments
                var executionResult = originalFunction.apply(
                    this,
                    boundArguments.concat(Array.prototype.slice.call(arguments))
                );
                // If result is an object, return it; otherwise, return 'this' (the new instance)
                if (Object(executionResult) === executionResult) {
                    return executionResult;
                }
                return this;

            } else {
                // If called as a regular function, apply with the 'that' context
                return originalFunction.apply(
                    that,
                    boundArguments.concat(Array.prototype.slice.call(arguments))
                );

            }

        };
        // Maintain prototype chain for constructor calls
        if(originalFunction.prototype) {
            DummyConstructor.prototype = originalFunction.prototype;
            newBoundFunction.prototype = new DummyConstructor();
            DummyConstructor.prototype = null;
        }
        return newBoundFunction;
    };
}
// Cache references to native methods for performance and bind polyfill
var directCall = Function.prototype.call;
var arrayBaseProto = Array.prototype;
var objectBaseProto = Object.prototype;
var arraySlice = arrayBaseProto.slice; // Renamed 'slice' for clarity within this module
var objectToString = directCall.bind(objectBaseProto.toString); // Renamed '_toString'
var hasOwnProp = directCall.bind(objectBaseProto.hasOwnProperty); // Renamed 'owns'

}); // End of kernel.declareComponent for 'kernel/utilities/legacy_support'