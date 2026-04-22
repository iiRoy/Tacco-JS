((moduleDefinitions) => {
    /**
     * @constant {Object} moduleCache - Stores references to modules that have already been loaded.
     * This prevents redundant execution of module definitions.
     */
    const moduleCache = {};

    /**
     * @function defineExportProperty - A utility to define a getter property on an object.
     * This is commonly used in module systems for named exports.
     * @param {Object} targetObject - The object on which to define the property (e.g., module.exports).
     * @param {string} propertyKey - The name of the property to define.
     * @param {Function} getterFunction - A function that returns the value of the property when accessed.
     */
    const defineExportProperty = (targetObject, propertyKey, getterFunction) => {
        // Only define if the property doesn't exist to avoid overwriting.
        if (!Object.prototype.hasOwnProperty.call(targetObject, propertyKey)) {
            Object.defineProperty(targetObject, propertyKey, {
                enumerable: true, // Allow the property to appear during enumeration (e.g., in `for...in` loops).
                get: getterFunction // Specify the getter function.
            });
        }
    };

    /**
     * @function obtainModule - The core module loading and execution function.
     * This acts as the internal 'require' mechanism for the bundled application.
     * @param {number} moduleId - The unique numeric identifier for the module to be loaded.
     * @returns {Object} The exports object of the requested module.
     */
    function obtainModule(moduleId) {
        // If the module is already in our cache, return its exports immediately.
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].processedExports;
        }

        // Initialize a new entry in the module cache for the current module.
        const moduleEntry = moduleCache[moduleId] = {
            id: moduleId,
            executed: false, // Flag to indicate if the module's definition has been run.
            processedExports: {} // The object that will contain the module's exported values.
        };

        // Execute the module's definition function.
        // The definition function is expected to populate `moduleEntry.processedExports`.
        // `call` is used to set the `this` context and pass parameters explicitly.
        moduleDefinitions[moduleId].call(
            moduleEntry.processedExports, // `this` context within the module function.
            moduleEntry,                  // The module object itself.
            moduleEntry.processedExports, // The object where exports are assigned.
            obtainModule                  // A reference to this `obtainModule` function for internal `require` calls.
        );

        // Mark the module as successfully executed.
        moduleEntry.executed = true;

        // Return the exports object, now populated by the module's definition.
        return moduleEntry.processedExports;
    }

    // --- Auxiliary functions attached to the main module loader ---

    // Expose the original module definitions array for debugging or introspection.
    obtainModule.sourceDefinitions = moduleDefinitions;

    // Expose the internal module cache.
    obtainModule.moduleRegistry = moduleCache;

    // Attach the property definition helper.
    obtainModule.defineExport = defineExportProperty;

    /**
     * @function markAsESModule - Adds properties to an exports object to signify it as an ES Module.
     * This is crucial for interoperability with other module systems.
     * @param {Object} exportsObject - The object to mark as an ES Module.
     */
    obtainModule.markAsESModule = (exportsObject) => {
        // Set `Symbol.toStringTag` for better object identification in debugging.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, { value: 'Module' });
        }
        // Set the `__esModule` flag, a common convention for ES Modules.
        Object.defineProperty(exportsObject, '__esModule', { value: true });
    };

    /**
     * @function createNamespace - Generates a standardized namespace object for a module.
     * This handles various module types (e.g., CommonJS, ES Module) and their default/named exports.
     * @param {any} moduleRawValue - The raw module value or a module ID.
     * @param {number} interpretationFlags - Bitmask flags indicating how to interpret `moduleRawValue`.
     *   - Bit 1: `moduleRawValue` is a module ID and needs to be loaded.
     *   - Bit 4: `moduleRawValue` is already an ES Module namespace.
     *   - Bit 8: `moduleRawValue` should be returned as-is (e.g., a primitive or already a namespace).
     *   - Bit 2: If not a string, copy all properties of `moduleRawValue` as named exports.
     * @returns {Object} A namespace object conforming to ES Module conventions.
     */
    obtainModule.createNamespace = (moduleRawValue, interpretationFlags) => {
        let currentModuleValue = moduleRawValue;

        // Flag 1: If `moduleRawValue` is an ID, load the module.
        if (interpretationFlags & 1) {
            currentModuleValue = obtainModule(moduleRawValue);
        }

        // Flag 8: If this flag is set, return the module value directly.
        if (interpretationFlags & 8) {
            return currentModuleValue;
        }

        // Flag 4: If it's an object and already marked as an ES Module, return it directly.
        if (interpretationFlags & 4 && typeof currentModuleValue === 'object' && currentModuleValue && currentModuleValue.__esModule) {
            return currentModuleValue;
        }

        // Create a new plain object to serve as the namespace.
        const newNamespaceObject = Object.create(null);
        // Mark the new object as an ES Module.
        obtainModule.markAsESModule(newNamespaceObject);
        // Define the 'default' export of this namespace.
        Object.defineProperty(newNamespaceObject, 'default', { enumerable: true, value: currentModuleValue });

        // Flag 2: If `currentModuleValue` is not a string, copy its properties as named exports.
        if ((interpretationFlags & 2) && typeof currentModuleValue !== 'string') {
            for (const key in currentModuleValue) {
                // Ensure the property is directly on the object, not from its prototype chain.
                if (Object.prototype.hasOwnProperty.call(currentModuleValue, key)) {
                    obtainModule.defineExport(newNamespaceObject, key, () => currentModuleValue[key]);
                }
            }
        }
        return newNamespaceObject;
    };

    /**
     * @function getDefaultExport - Provides a consistent way to access a module's default export.
     * Handles both CommonJS-style modules and ES Modules.
     * @param {Object} moduleReference - The module's exports object.
     * @returns {Function} A function that, when called, returns the module's default export.
     */
    obtainModule.getDefaultExport = (moduleReference) => {
        let accessorFunction;
        // If the module is an ES Module, its default export is under the 'default' property.
        if (moduleReference && moduleReference.__esModule) {
            accessorFunction = () => moduleReference.default;
        } else {
            // Otherwise, the entire module reference is considered its default export.
            accessorFunction = () => moduleReference;
        }
        // Attach a special 'a' getter to the accessor function itself, often used by bundlers.
        obtainModule.defineExport(accessorFunction, 'a', accessorFunction);
        return accessorFunction;
    };

    /**
     * @function hasOwnProp - A wrapper for `Object.prototype.hasOwnProperty.call` for convenience.
     * @param {Object} targetObject - The object to check.
     * @param {string} propertyName - The name of the property.
     * @returns {boolean} True if the object has the specified property directly, false otherwise.
     */
    obtainModule.hasOwnProp = (targetObject, propertyName) => {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    // Placeholder for the public path, typically used for loading assets.
    obtainModule.publicPath = '';

    // Set the entry module ID.
    obtainModule.entryModuleId = 0;

    // Load and execute the main entry point module (module at index 0).
    const applicationEntryPointExports = obtainModule(obtainModule.entryModuleId);

    // Determine how to expose the entry point exports based on the environment.
    if (typeof module !== 'undefined' && module.exports) {
        // For CommonJS environments (like Node.js), assign to `module.exports`.
        module.exports = applicationEntryPointExports;
    } else if (typeof window !== 'undefined') {
        // For browser environments, attach to the global window object.
        window.__BUNDLED_APP_ENTRY_POINT__ = applicationEntryPointExports;
    }

    return obtainModule; // Return the module loader function itself.

})([
    // --- Array of Module Definitions ---

    // Module 0: Primary Application Entry Point
    // This module orchestrates the reading of input, its processing, and the problem-solving logic.
    (currentModule, moduleExports, moduleLoader) => {
        // Load the native Node.js 'fs' (file system) module via our loader.
        const fileSystemUtil = moduleLoader(1);

        // Load the main processing logic module.
        const mainProcessingLogic = moduleLoader(2);

        // Define the standard input file path.
        const standardInputPath = "/dev/stdin";

        let retrievedInputData;
        try {
            // Attempt to read the content from standard input synchronously.
            retrievedInputData = fileSystemUtil.readFileSync(standardInputPath, "utf8");
            // Basic validation: if input is empty, log a warning and ensure it's an empty string.
            if (!retrievedInputData || retrievedInputData.length === 0) {
                console.warn("Warning: Standard input appears to be empty or unreadable.");
                retrievedInputData = ""; // Ensure string type for downstream consistency.
            }
        } catch (inputReadError) {
            // Handle errors during file reading.
            console.error(`Fatal Error: Could not read from ${standardInputPath}. Details: ${inputReadError.message}`);
            retrievedInputData = ""; // Provide a safe fallback.
            // Depending on requirements, could also re-throw or terminate.
        }

        // Pass the raw input data to the main processing function.
        mainProcessingLogic(retrievedInputData);
    },

    // Module 1: Native File System Module Wrapper
    // This module simply re-exports the Node.js 'fs' module.
    (currentModule, moduleExports) => {
        // In a Node.js environment, `require('fs')` directly provides the file system API.
        currentModule.processedExports = require("fs");
    },

    // Module 2: Input Orchestration and Problem Solving Invocation
    // This module takes raw input, instantiates an input processor, and then calls the solver.
    (currentModule, moduleExports, moduleLoader) => {
        // Load the custom InputProcessor class.
        const InputProcessorClass = moduleLoader(3);
        // Load the function responsible for solving the problem.
        const ProblemSolverFunction = moduleLoader(5);

        /**
         * The primary function exported by this module.
         * It serves as an entry point for processing and solving a problem given raw input.
         * @param {string} rawInputString - The raw string data, typically from standard input.
         */
        currentModule.processedExports = (rawInputString) => {
            // Validate that the input is indeed a string.
            if (typeof rawInputString !== 'string') {
                console.error("Error: Input for processing must be a string type.");
                return; // Abort if input is invalid.
            }
            // Create an instance of our InputProcessor to handle tokenizing the input.
            const inputDataHandler = new InputProcessorClass(rawInputString);
            // Invoke the problem solver, passing the input data handler.
            ProblemSolverFunction(inputDataHandler);
        };
    },

    // Module 3: InputProcessor Class Definition
    // This class is responsible for parsing raw string input into manageable tokens (strings or integers).
    (currentModule, moduleExports, moduleLoader) => {
        // Load the CustomQueue class, which will store our input tokens.
        const TokenQueue = moduleLoader(4);

        /**
         * @class InputProcessor
         * Manages tokenized input from a raw string, allowing sequential access.
         */
        class InputProcessor {
            /**
             * Creates an instance of InputProcessor.
             * @param {string} rawTextContent - The raw string input (e.g., from a file or stdin).
             */
            constructor(rawTextContent) {
                // Trim whitespace from the start/end and split the string by any sequence of whitespace characters.
                const parsedTokens = rawTextContent.trim().split(/\s+/g);

                // Initialize the internal token queue. Handle cases where input might be empty.
                if (parsedTokens.length === 0 || (parsedTokens.length === 1 && parsedTokens[0] === '')) {
                    console.warn("InputProcessor initialized with no effective tokens after parsing.");
                    this.tokenBuffer = new TokenQueue([]);
                } else {
                    this.tokenBuffer = new TokenQueue(parsedTokens);
                }
            }

            /**
             * Retrieves the next raw string token from the input buffer.
             * @returns {string|undefined} The next token as a string, or `undefined` if no more tokens.
             */
            getNextRawToken() {
                // Guard clause: check if the queue is empty before attempting to dequeue.
                if (this.tokenBuffer.isEmpty()) {
                    console.warn("Attempted to read a raw token from an empty input queue.");
                    return undefined;
                }
                return this.tokenBuffer.dequeue();
            }

            /**
             * Retrieves the next token and attempts to parse it as an integer.
             * @returns {number|NaN|undefined} The parsed integer, `NaN` if parsing fails, or `undefined` if no more tokens.
             */
            getNextInteger() {
                const tokenString = this.getNextRawToken();
                if (tokenString === undefined) {
                    return undefined; // No more tokens in the buffer.
                }
                // Use `parseInt` with an explicit radix (base 10) for reliability.
                const numericalValue = parseInt(tokenString, 10);
                // Optional: Log a warning if the token couldn't be parsed as an integer.
                if (isNaN(numericalValue)) {
                    console.warn(`Warning: Input token "${tokenString}" could not be parsed as an integer.`);
                }
                return numericalValue;
            }

            /**
             * Clears all tokens from the internal buffer, resetting the processor state.
             */
            clearAllTokens() {
                this.tokenBuffer.clearAll();
            }
        }
        // Export the InputProcessor class for use by other modules.
        currentModule.processedExports = InputProcessor;
    },

    // Module 4: CustomQueue Class Definition
    // A basic First-In, First-Out (FIFO) queue implementation.
    (currentModule, moduleExports) => {
        /**
         * @class CustomQueue
         * Implements a simple queue data structure using an array.
         */
        class CustomQueue {
            /**
             * Creates an instance of CustomQueue.
             * @param {Array<any>} [initialItems=[]] - An optional array of elements to pre-populate the queue.
             */
            constructor(initialItems = []) {
                // Ensure initialItems is an array; otherwise, default to an empty array.
                const validInitialItems = Array.isArray(initialItems) ? initialItems : [];

                // The internal array holding the queue's elements. A shallow copy is made.
                this.internalElements = [...validInitialItems];
                // The index of the element at the front of the queue (next to be dequeued).
                this.frontPointer = 0;
                // The current number of elements logically present in the queue.
                this.currentElementCount = this.internalElements.length;
            }

            /**
             * Adds an element to the end of the queue.
             * @param {any} itemToAdd - The element to be added.
             */
            enqueue(itemToAdd) {
                this.internalElements.push(itemToAdd);
                this.currentElementCount++;
            }

            /**
             * Removes and returns the element from the front of the queue.
             * @returns {any|undefined} The element removed, or `undefined` if the queue is empty.
             */
            dequeue() {
                // Guard clause: if the queue is empty, there's nothing to dequeue.
                if (this.isEmpty()) {
                    console.warn("Attempted to dequeue from an empty CustomQueue.");
                    return undefined;
                }

                // Retrieve the element at the front.
                const dequeuedItem = this.internalElements[this.frontPointer];
                // Advance the front pointer and decrement the count.
                this.frontPointer++;
                this.currentElementCount--;

                // Optimization: If a significant portion of the array is unused (due to `frontPointer` advancing),
                // compact the array to reclaim memory. This prevents the array from growing indefinitely.
                const RECOMPACTION_THRESHOLD = 500; // If frontPointer exceeds this number
                const USAGE_RATIO_LIMIT = 0.3;      // And less than 30% of the allocated array is currently in use
                if (this.frontPointer > RECOMPACTION_THRESHOLD &&
                    (this.frontPointer / this.internalElements.length > USAGE_RATIO_LIMIT)) {
                    this.internalElements = this.internalElements.slice(this.frontPointer);
                    this.frontPointer = 0; // Reset front pointer after compaction.
                }

                return dequeuedItem;
            }

            /**
             * Returns the element at the front of the queue without removing it.
             * @returns {any|undefined} The element at the front, or `undefined` if the queue is empty.
             */
            peek() {
                if (this.isEmpty()) {
                    return undefined;
                }
                return this.internalElements[this.frontPointer];
            }

            /**
             * Checks if the queue contains no elements.
             * @returns {boolean} `true` if the queue is empty, `false` otherwise.
             */
            isEmpty() {
                return this.currentElementCount === 0;
            }

            /**
             * Returns the current number of elements in the queue.
             * @returns {number} The size of the queue.
             */
            size() {
                return this.currentElementCount;
            }

            /**
             * Empties the queue by resetting its internal state.
             */
            clearAll() {
                this.internalElements = [];
                this.frontPointer = 0;
                this.currentElementCount = 0;
            }
        }
        // Export the CustomQueue class.
        currentModule.processedExports = CustomQueue;
    },

    // Module 5: Problem Solver Logic
    // This module contains the core algorithm to solve the specific problem described.
    (currentModule, moduleExports) => {
        /**
         * @function solveTheChallenge - Implements the problem-solving logic.
         * The problem involves finding a specific difference based on a list of numbers.
         * @param {InputProcessor} dataStreamReader - An instance of InputProcessor to fetch numerical inputs.
         */
        currentModule.processedExports = (dataStreamReader) => {
            // Read and discard the first integer. It's often a line count or irrelevant header in competitive programming.
            const initialIgnoredNumber = dataStreamReader.getNextInteger();
            if (initialIgnoredNumber === undefined) {
                console.error("Solver Error: Could not read the initial (ignored) number. Input format might be incorrect or empty.");
                return; // Terminate if essential input is missing.
            }

            // Read the count of subsequent numbers that form the main data set.
            const totalNumbersToProcess = dataStreamReader.getNextInteger();
            if (totalNumbersToProcess === undefined || totalNumbersToProcess < 0) {
                console.error("Solver Error: Invalid or missing count for the number of elements to process.");
                return;
            }
            // Edge case: if no numbers are to be processed, the result is 0.
            if (totalNumbersToProcess === 0) {
                console.log(0);
                return;
            }

            // Prepare an array to hold all the numbers.
            const inputNumberArray = [];
            let maximumValueFound = -Infinity; // Initialize with the smallest possible value.
            let indexOfMaximum = -1;           // Keep track of the index of the maximum value.

            // Iterate to read all numbers and simultaneously find the largest one.
            for (let k = 0; k < totalNumbersToProcess; k++) {
                const currentNumber = dataStreamReader.getNextInteger();
                if (currentNumber === undefined) {
                    console.error(`Solver Error: Expected ${totalNumbersToProcess} numbers, but only found ${k}. Input is incomplete.`);
                    return;
                }
                inputNumberArray[k] = currentNumber; // Store the number.

                // Update maximum value and its index if the current number is greater.
                if (currentNumber > maximumValueFound) {
                    maximumValueFound = currentNumber;
                    indexOfMaximum = k;
                }
            }

            // Calculate the sum of all numbers *except* the largest one.
            let sumOfRemainingNumbers = 0;
            for (let k = 0; k < totalNumbersToProcess; k++) {
                // Only add to sum if the current number is not the identified maximum value.
                if (k !== indexOfMaximum) {
                    sumOfRemainingNumbers += inputNumberArray[k];
                }
            }

            // The problem requires calculating (maximumValue - 1 - sumOfRemainingNumbers).
            const finalCalculatedDifference = maximumValueFound - 1 - sumOfRemainingNumbers;

            // Output the result. If the calculated difference is negative, output 0 instead.
            if (finalCalculatedDifference < 0) {
                console.log(0);
            } else {
                console.log(finalCalculatedDifference);
            }
        };
    }
]);