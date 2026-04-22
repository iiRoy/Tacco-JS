"use strict";

// This function acts as a custom module loader, similar to Webpack's internal runtime.
// It takes an array of module definitions and executes the entry point.
const exportModule = (moduleSources) => {
    // A cache to store modules that have already been loaded.
    const moduleRegistry = {};

    /**
     * The core module resolution and loading function.
     * @param {number} identifier - The unique ID of the module to resolve.
     * @returns {*} The exports of the resolved module.
     */
    function resolveModule(identifier) {
        // If the module is already in the cache, return its exports.
        if (moduleRegistry[identifier]) {
            return moduleRegistry[identifier].exports;
        }

        // Create a new module entry in the cache.
        const currentModuleContext = moduleRegistry[identifier] = {
            id: identifier, // Module identifier
            isModuleLoaded: false, // Flag to indicate if the module has been fully loaded
            exports: {} // The object that will hold the module's exports
        };

        // Execute the module function, populating its exports.
        // The module function receives:
        // 1. currentModuleContext (the module object itself)
        // 2. currentModuleContext.exports (the exports object)
        // 3. resolveModule (the local require function for this module)
        moduleSources[identifier].call(
            currentModuleContext.exports,
            currentModuleContext,
            currentModuleContext.exports,
            resolveModule
        );

        // Mark the module as loaded.
        currentModuleContext.isModuleLoaded = true;

        // Return the populated exports object.
        return currentModuleContext.exports;
    }

    // Helper to define a property on an object with a getter.
    const defineModuleGetter = (targetObject, propName, getterFunction) => {
        // Check if the property already exists to avoid unnecessary redefinitions.
        if (!resolveModule.hasOwnProp(targetObject, propName)) {
            Object.defineProperty(targetObject, propName, {
                enumerable: true, // Make the property enumerable
                get: getterFunction // The getter function
            });
        }
    };
    resolveModule.defineGetter = defineModuleGetter; // Assign to resolver

    // Helper to set the __esModule flag and Symbol.toStringTag for ES module compatibility.
    const setupESModuleFlags = (targetObject) => {
        // Check if Symbol is defined and toStringTag is available.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, { value: "Module" });
        }
        // Always set the __esModule flag.
        Object.defineProperty(targetObject, "__esModule", { value: true });
    };
    resolveModule.setESModuleFlag = setupESModuleFlags; // Assign to resolver

    // Helper to create a namespace object for a module.
    const constructNamespaceObject = (moduleExports, flags) => {
        // If flag 1 is set, it means the moduleExports is already a resolved module ID.
        if (flags & 1) {
            moduleExports = resolveModule(moduleExports);
        }
        // If flag 8 is set, moduleExports is already the desired namespace object.
        if (flags & 8) {
            return moduleExports;
        }
        // If flag 4 is set and it's an object with __esModule, it's already an ES module.
        if (flags & 4 && typeof moduleExports === "object" && moduleExports && moduleExports.__esModule) {
            return moduleExports;
        }

        // Create a new namespace object.
        const namespaceObject = Object.create(null);
        // Set ES module flags on the new object.
        resolveModule.setESModuleFlag(namespaceObject);
        // Define the 'default' export.
        Object.defineProperty(namespaceObject, "default", {
            enumerable: true,
            value: moduleExports
        });

        // If flag 2 is set and it's not a string, copy all properties from the original exports.
        if (flags & 2 && typeof moduleExports !== "string") {
            for (const propKey in moduleExports) {
                // Ensure it's an own property before defining a getter for it.
                if (Object.prototype.hasOwnProperty.call(moduleExports, propKey)) {
                    resolveModule.defineGetter(namespaceObject, propKey, () => moduleExports[propKey]);
                }
            }
        }
        return namespaceObject;
    };
    resolveModule.createNamespaceObject = constructNamespaceObject; // Assign to resolver

    // Helper to get the default export of a module.
    const retrieveDefaultExport = (moduleExports) => {
        // Determine the function that returns the default export.
        const defaultExportFn = moduleExports && moduleExports.__esModule ?
            () => moduleExports.default : // If it's an ES module, return its default property.
            () => moduleExports; // Otherwise, the module itself is the default export.

        // Define a getter 'a' (common Webpack alias for default) that returns the default export.
        resolveModule.defineGetter(defaultExportFn, "a", defaultExportFn);
        return defaultExportFn;
    };
    resolveModule.getDefaultExport = retrieveDefaultExport; // Assign to resolver

    // Helper to check if an object has a specific property.
    resolveModule.hasOwnProp = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

    // Public path for assets (empty in this case).
    resolveModule.publicPath = "";

    // Store the module definitions and cache on the resolver function itself.
    resolveModule.moduleSources = moduleSources;
    resolveModule.cache = moduleRegistry;

    // Set the entry point and immediately resolve it to start the application.
    resolveModule.entryPoint = 0;
    return resolveModule(resolveModule.entryPoint);
};

// The array contains definitions for all application modules.
exportModule([
    /* Module 0: Application Entry Point */
    function (moduleContext, exportsObject, moduleResolver) {
        "use strict"; // Ensure strict mode for this module as well.
        // Obtain the file system utility module.
        const fileSystemUtil = moduleResolver(1);

        // Define the path for standard input.
        const standardInputPath = "/dev/stdin";
        let rawInputContent;

        try {
            // Read the entire content from standard input synchronously as UTF-8.
            rawInputContent = fileSystemUtil.readFileSync(standardInputPath, "utf8");
        } catch (errorReadingInput) {
            // Log an error if reading from stdin fails and exit.
            console.error(`Error reading from ${standardInputPath}:`, errorReadingInput.message);
            // In a real application, you might want to throw or exit process.
            return; // Exit module execution.
        }

        // Resolve and execute the main processing module with the read input.
        moduleResolver(2)(rawInputContent);
    },

    /* Module 1: File System Module Wrapper */
    function (currentModule, moduleExports) {
        // Simply exports the Node.js 'fs' module.
        currentModule.exports = require("fs");
    },

    /* Module 2: Main Application Processor */
    function (moduleContext, exportsObject, moduleResolver) {
        "use strict";
        // Resolve the InputParser class and the ProblemSolver function.
        const InputParserClass = moduleResolver(3);
        const ProblemSolverFunction = moduleResolver(5);

        // Export a function that takes raw input data, processes it, and then solves the problem.
        moduleContext.exports = function (rawInputData) {
            // Basic validation for input data.
            if (typeof rawInputData !== 'string' || rawInputData.length === 0) {
                console.error("Invalid or empty input data provided to the processor.");
                return; // Abort if input is bad.
            }

            // Create an instance of the input parser using the raw data.
            const processorInstance = new InputParserClass(rawInputData);

            // Execute the problem solver with the prepared input processor.
            ProblemSolverFunction(processorInstance);

            // Optionally clear the input processor's internal state after use.
            // This is a stylistic addition; not strictly necessary if the processor is short-lived.
            processorInstance.clearInput();
        };
    },

    /* Module 3: Input Processing Utility Class */
    function (moduleContext, exportsObject, moduleResolver) {
        "use strict";
        // Resolve the DataQueue class.
        const DataQueueClass = moduleResolver(4);

        /**
         * @class InputProcessor
         * @description Handles parsing raw string input into a stream of tokens or numbers.
         */
        moduleContext.exports = class InputProcessor {
            /**
             * @constructor
             * @param {string} fullInputString - The complete input string to be processed.
             */
            constructor(fullInputString) {
                // Pre-process the input string: trim whitespace and split by any sequence of whitespace.
                const tokenArray = fullInputString.trim().split(/\s+/g);
                // Initialize an internal queue with the tokenized input.
                this.dataStream = new DataQueueClass(tokenArray);
            }

            /**
             * Dequeues and returns the next raw string token from the input stream.
             * @returns {string|undefined} The next string token, or undefined if the stream is empty.
             */
            readStringToken() {
                // Add a simple guard clause for empty stream
                if (this.dataStream.isEmpty()) {
                    // console.warn("Attempted to read string from an empty input stream.");
                    return undefined;
                }
                return this.dataStream.dequeueItem();
            }

            /**
             * Dequeues the next token, parses it as an integer, and returns it.
             * @returns {number|undefined} The next integer, or undefined if stream is empty or parsing fails.
             */
            readInteger() {
                const token = this.readStringToken();
                if (token === undefined) {
                    return undefined; // Stream was empty
                }
                const parsedValue = parseInt(token, 10);
                // Check for NaN resulting from invalid parsing.
                if (isNaN(parsedValue)) {
                    console.warn(`Could not parse "${token}" as an integer. Returning NaN.`);
                    return NaN; // Or throw an error, depending on desired behavior.
                }
                return parsedValue;
            }

            /**
             * Clears the internal data queue, resetting the input stream.
             */
            clearInput() {
                this.dataStream.resetQueue();
            }
        };
    },

    /* Module 4: Custom Queue Data Structure */
    function (moduleContext, exportsObject, moduleResolver) {
        "use strict";

        /**
         * @class CustomQueue
         * @description A simple queue implementation optimized for sequential reads (dequeue).
         *              Avoids `shift()` for performance by using a read pointer.
         */
        moduleContext.exports = class CustomQueue {
            /**
             * @constructor
             * @param {Array<any>} [initialElements=[]] - An optional array of elements to initialize the queue with.
             */
            constructor(initialElements = []) {
                // Ensure initialElements is an array.
                const validatedElements = Array.isArray(initialElements) ? initialElements : [];

                this.elementContainer = validatedElements; // The underlying array storing queue elements.
                this.currentSize = validatedElements.length; // Current number of elements in the effective queue.
                this.readPointer = 0; // Index of the next element to be dequeued.
            }

            /**
             * Adds an element to the end of the queue.
             * @param {any} item - The element to add.
             */
            enqueueItem(item) {
                this.elementContainer.push(item);
                this.currentSize++;
            }

            /**
             * Removes and returns the element at the front of the queue.
             * The element is not physically removed from the array but marked as "read".
             * @returns {any|undefined} The dequeued element, or undefined if the queue is empty.
             */
            dequeueItem() {
                // Guard clause: Check if there are elements available to dequeue.
                if (this.readPointer >= this.elementContainer.length) {
                    // console.warn("Attempted to dequeue from an empty queue.");
                    return undefined;
                }

                const dequeuedValue = this.elementContainer[this.readPointer];
                this.readPointer++; // Advance the read pointer.
                this.currentSize--; // Decrement the logical size.

                // Optional: Periodically clean up the underlying array if the read pointer gets too far ahead.
                // This prevents unbounded memory growth for very long-lived queues with many dequeues.
                // For this specific problem, it's not strictly necessary as the queue is short-lived.
                if (this.readPointer > 1000 && this.readPointer > this.elementContainer.length / 2) {
                     this.elementContainer = this.elementContainer.slice(this.readPointer);
                     this.readPointer = 0;
                }

                return dequeuedValue;
            }

            /**
             * Returns the element at the front of the queue without removing it.
             * @returns {any|undefined} The element at the front, or undefined if the queue is empty.
             */
            peekFront() {
                if (this.isEmpty()) {
                    return undefined;
                }
                return this.elementContainer[this.readPointer];
            }

            /**
             * Checks if the queue is empty.
             * @returns {boolean} True if the queue contains no elements, false otherwise.
             */
            isEmpty() {
                return this.currentSize <= 0 || this.readPointer >= this.elementContainer.length;
            }

            /**
             * Resets the queue to an empty state.
             */
            resetQueue() {
                this.elementContainer = [];
                this.currentSize = 0;
                this.readPointer = 0;
            }

            /**
             * Returns the current number of elements in the queue.
             * @returns {number} The number of elements.
             */
            getCurrentSize() {
                return this.currentSize;
            }
        };
    },

    /* Module 5: Problem Solver Function (Dynamic Programming) */
    function (moduleContext, exportsObject, moduleResolver) {
        "use strict";

        // Define a constant for the modulo operation.
        const MODULO_VALUE = 1000000007;
        // Define the target remainder we are looking for.
        const TARGET_REMAINDER = 5;
        // Define the divisor for the modulo operations.
        const DIVISOR = 13;

        /**
         * Helper function to perform modulo arithmetic consistently.
         * @param {number} value - The number to apply modulo to.
         * @returns {number} The result of value % MODULO_VALUE.
         */
        const applyModulo = (value) => value % MODULO_VALUE;

        /**
         * Solves the problem of counting numbers formed from a given sequence that are divisible by 13
         * and have a specific remainder.
         *
         * @param {Object} inputReader - An instance of InputProcessor to read the input sequence.
         */
        moduleContext.exports = function (inputReader) {
            // Read the input sequence as a string.
            const inputSequence = inputReader.readStringToken();

            // Validate that an input sequence was provided.
            if (!inputSequence) {
                console.error("No input sequence provided for the solver.");
                return;
            }

            const sequenceLength = inputSequence.length;

            // Initialize a 2D dynamic programming table (dpTable).
            // dpTable[i][j] will store the count of numbers formed by the first 'i' characters
            // of the input sequence that have a remainder 'j' when divided by DIVISOR.
            const dpTable = Array.from({ length: sequenceLength + 1 }, () =>
                Array.from({ length: DIVISOR }, () => 0)
            );

            // Base case: An empty prefix (0 characters) can form one number (empty string, interpreted as 0)
            // which has a remainder of 0 when divided by DIVISOR.
            dpTable[0][0] = 1;

            // Iterate through each character of the input sequence.
            for (let charIndex = 1; charIndex <= sequenceLength; ++charIndex) {
                const currentChar = inputSequence[charIndex - 1]; // Get the current character.

                // If the current character is a wildcard '?'.
                if (currentChar === '?') {
                    // Iterate through all possible previous remainders (0 to DIVISOR-1).
                    for (let prevRemainder = 0; prevRemainder < DIVISOR; ++prevRemainder) {
                        // Iterate through all possible digits (0-9) that '?' can represent.
                        for (let digitOption = 0; digitOption < 10; ++digitOption) {
                            // Calculate the new remainder.
                            const newRemainder = (prevRemainder * 10 + digitOption) % DIVISOR;
                            // Add the count from the previous state to the current state, applying modulo.
                            dpTable[charIndex][newRemainder] = applyModulo(dpTable[charIndex][newRemainder] + dpTable[charIndex - 1][prevRemainder]);
                        }
                    }
                } else { // If the current character is a specific digit.
                    const currentDigit = Number(currentChar); // Convert character to a number.

                    // Iterate through all possible previous remainders (0 to DIVISOR-1).
                    for (let prevRemainder = 0; prevRemainder < DIVISOR; ++prevRemainder) {
                        // Calculate the new remainder using the fixed current digit.
                        const newRemainder = (prevRemainder * 10 + currentDigit) % DIVISOR;
                        // Add the count from the previous state to the current state, applying modulo.
                        dpTable[charIndex][newRemainder] = applyModulo(dpTable[charIndex][newRemainder] + dpTable[charIndex - 1][prevRemainder]);
                    }
                }
            }

            // The final answer is the count of numbers formed by the entire sequence
            // that have a remainder of TARGET_REMAINDER when divided by DIVISOR.
            const finalResult = dpTable[sequenceLength][TARGET_REMAINDER];
            console.log(finalResult);
        };
    }
]);