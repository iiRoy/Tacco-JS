module.exports = function(moduleDefinitions) {
    // This object serves as a cache for loaded modules, preventing redundant execution.
    var moduleCache = {};

    // The core function responsible for loading and returning modules.
    function requireModule(moduleIdentifier) {
        // If the module is already in our cache, simply return its exported value.
        if (moduleCache[moduleIdentifier]) {
            return moduleCache[moduleIdentifier].exports;
        }

        // If the module is not cached, create a new entry for it.
        var moduleEntry = moduleCache[moduleIdentifier] = {
            i: moduleIdentifier, // Store the unique identifier of the module.
            l: false,            // A flag indicating whether the module has been fully loaded.
            exports: {}          // The object that will hold the module's exported values.
        };

        // Execute the module's definition function.
        // It receives the module entry, its exports object, and the local require function.
        moduleDefinitions[moduleIdentifier].call(moduleEntry.exports, moduleEntry, moduleEntry.exports, requireModule);

        // Mark the module as fully loaded after its execution.
        moduleEntry.l = true;

        // Return the exports of the newly loaded module.
        return moduleEntry.exports;
    }

    // Attach all module definitions to the require function for internal use.
    requireModule.m = moduleDefinitions;

    // Attach the module cache to the require function.
    requireModule.c = moduleCache;

    // Helper to define a getter property on an object.
    requireModule.d = function(targetObject, propertyName, getterFunction) {
        // Only define the property if it doesn't already exist on the target object.
        if (!requireModule.o(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make the property enumerable.
                get: getterFunction // Assign the provided function as the getter.
            });
        }
    };

    // Helper to mark an object as an ES module.
    requireModule.r = function(exportsObject) {
        // If Symbol and Symbol.toStringTag are available, set the toStringTag.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, { value: 'Module' });
        }
        // Always set the __esModule flag to true.
        Object.defineProperty(exportsObject, '__esModule', { value: true });
    };

    // Helper for handling different module types (e.g., CommonJS, ES modules).
    requireModule.t = function(value, mode) {
        // If mode 1 is set, it means the value is a module ID, so require it.
        if (1 & mode) value = requireModule(value);
        // If mode 8 is set, return the value as is.
        if (8 & mode) return value;
        // If mode 4 is set and the value is an object and an ES module, return it as is.
        if (4 & mode && typeof value === 'object' && value && value.__esModule) return value;

        // Otherwise, create a new object to represent the module.
        var newObject = Object.create(null);
        requireModule.r(newObject); // Mark it as an ES module.
        Object.defineProperty(newObject, 'default', { enumerable: true, value: value }); // Define a 'default' export.

        // If mode 2 is set and the value is not a string, copy all its properties.
        if (2 & mode && typeof value !== 'string') {
            for (var key in value) {
                requireModule.d(newObject, key, (function(k) {
                    return value[k];
                }).bind(null, key));
            }
        }
        return newObject;
    };

    // Helper to create a getter for the default export of a module.
    requireModule.n = function(moduleExports) {
        var getter = moduleExports && moduleExports.__esModule ?
            function() { return moduleExports.default; } : // If it's an ES module, return its default.
            function() { return moduleExports; };          // Otherwise, return the module exports directly.
        requireModule.d(getter, 'a', getter); // Define a property 'a' that returns the getter itself.
        return getter;
    };

    // Helper to check if an object has a specific property.
    requireModule.o = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    // The public path for assets, typically used for dynamic imports.
    requireModule.p = '';

    // Set the entry point module (module 0) and execute it to start the application.
    return requireModule(requireModule.s = 0);

}([
    /* Module 0: Application Entry Point */
    function(moduleObject, exportsObject, localRequire) {
        'use strict'; // Enable strict mode for this module.

        // Import the Node.js 'fs' (file system) module.
        var fileSystemModule = localRequire(1);

        // Read the entire content from standard input ('/dev/stdin') as a UTF-8 string.
        // Then, pass this content to module 2 for further processing.
        localRequire(2)(fileSystemModule.readFileSync('/dev/stdin', 'utf8'));
    },

    /* Module 1: Node.js 'fs' Module Wrapper */
    function(moduleObject, exportsObject) {
        // Export the native Node.js 'fs' module directly.
        moduleObject.exports = require('fs');
    },

    /* Module 2: Main Application Logic Orchestrator */
    function(moduleObject, exportsObject, localRequire) {
        'use strict'; // Enable strict mode.

        // Import the DataHandler class (from module 3) and the main algorithm function (from module 5).
        var inputProcessorClass = localRequire(3);
        var mainAlgorithmFunction = localRequire(5);

        // Export a function that takes an input string, initializes a processor, and runs the algorithm.
        moduleObject.exports = function(inputString) {
            // Create a new instance of DataHandler, passing the raw input string.
            var processorInstance = new inputProcessorClass(inputString);
            // Execute the main algorithm, providing it with the initialized data processor.
            mainAlgorithmFunction(processorInstance);
        };
    },

    /* Module 3: DataHandler Class for Input Parsing */
    function(moduleObject, exportsObject, localRequire) {
        'use strict'; // Enable strict mode.

        // Import the DataStore (queue) class from module 4.
        var queueClass = localRequire(4);

        // Define and export the DataHandler class.
        moduleObject.exports = class DataHandler {
            // The constructor takes the raw input string.
            constructor(rawData) {
                // Trim leading/trailing whitespace and split the string by any whitespace
                // into an array of individual tokens.
                var tokenArray = rawData.trim().split(/\s+/g);
                // Initialize an internal DataStore (queue) with these parsed tokens.
                this.dataQueue = new queueClass(tokenArray);
            }

            // Method to dequeue and return the next string token from the input.
            readString() {
                return this.dataQueue.dequeueElement();
            }

            // Method to dequeue the next token, parse it as an integer (base 10), and return it.
            readInt() {
                return parseInt(this.dataQueue.dequeueElement(), 10);
            }

            // Method to clear the internal data store, effectively resetting the input state.
            finishProcessing() {
                this.dataQueue.resetStore();
            }
        };
    },

    /* Module 4: DataStore Class (Queue Implementation) */
    function(moduleObject, exportsObject, localRequire) {
        'use strict'; // Enable strict mode.

        // Define and export the DataStore class, which acts as a simple queue.
        moduleObject.exports = class DataStore {
            // The constructor can optionally take an array of initial elements.
            constructor() {
                var initialElements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
                // Initialize the current size of the store.
                this.currentSize = initialElements.length;
                // Store the elements in an array.
                this.elementList = initialElements;
                // Keep track of the current index for dequeuing.
                this.currentIndex = 0;
            }

            // Method to add an element to the end of the queue.
            enqueueElement(itemToAdd) {
                this.currentSize += 1;
                this.elementList.push(itemToAdd);
            }

            // Method to remove and return the element from the front of the queue.
            dequeueElement() {
                var retrievedItem = this.elementList[this.currentIndex];
                this.currentSize -= 1;
                this.currentIndex += 1;
                return retrievedItem;
            }

            // Method to clear all elements from the queue and reset its state.
            resetStore() {
                this.elementList = [];
                this.currentSize = 0;
                this.currentIndex = 0;
            }
        };
    },

    /* Module 5: Main Algorithm for Finding Longest Consecutive ACGT Sequence */
    function(moduleObject, exportsObject, localRequire) {
        'use strict'; // Enable strict mode.

        // Export the main algorithm function. It takes a data processor instance.
        moduleObject.exports = function(dataProcessor) {
            // Read the entire input sequence as a single string.
            var inputSequence = dataProcessor.readString();
            // Get the total length of the input sequence.
            var sequenceLength = inputSequence.length;
            // Initialize a variable to keep track of the maximum consecutive count found.
            var maxConsecutive = 0;

            // Iterate through the sequence with an outer loop.
            // The loop runs up to 'sequenceLength - 1' because the inner loop checks from 'outerLoopIndex'.
            for (var outerLoopIndex = 0; outerLoopIndex < sequenceLength - 1; outerLoopIndex++) {
                // Initialize a counter for the current consecutive sequence of 'ACGT' characters.
                var currentConsecutive = 0;
                // Inner loop to check for consecutive 'ACGT' characters starting from 'outerLoopIndex'.
                for (var innerLoopIndex = outerLoopIndex;
                     innerLoopIndex < sequenceLength &&
                     (inputSequence[innerLoopIndex] === 'A' ||
                      inputSequence[innerLoopIndex] === 'C' ||
                      inputSequence[innerLoopIndex] === 'G' ||
                      inputSequence[innerLoopIndex] === 'T');
                     innerLoopIndex++) {
                    currentConsecutive++; // Increment the count if the character is one of 'A', 'C', 'G', 'T'.
                }
                // Update 'maxConsecutive' if the 'currentConsecutive' count is higher.
                maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
            }
            // Print the final maximum consecutive count to the console.
            console.log(maxConsecutive);
        };
    }
]);
