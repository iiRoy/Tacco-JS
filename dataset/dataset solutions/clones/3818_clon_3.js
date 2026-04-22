const createModuleSystem = (moduleDefinitions) => {
    // A private cache to store modules once they have been loaded.
    const moduleLoadCache = {};

    /**
     * Resolves and loads a module by its identifier.
     * This function mimics a simplified 'require' mechanism.
     * @param {number} moduleIdentifier - The numerical ID of the module to load.
     * @returns {object} The exports object of the loaded module.
     */
    const loadAndResolveModule = (moduleIdentifier) => {
        // If the module is already in our cache, return its exports immediately.
        if (moduleLoadCache[moduleIdentifier]) {
            return moduleLoadCache[moduleIdentifier].exports;
        }

        // If not cached, create a new module entry in the cache.
        // This structure holds the module's state and its exports.
        const moduleEntry = moduleLoadCache[moduleIdentifier] = {
            id: moduleIdentifier, // Store the identifier for debugging/introspection.
            isInitialized: false, // Flag indicating if the module's definition has been run.
            exports: {} // The object that will contain the module's exported values.
        };

        // Execute the module's definition function.
        // The definition function is expected to be in the 'moduleDefinitions' array.
        // It's called with 'this' context as `moduleEntry.exports`, and arguments
        // `moduleEntry`, `moduleEntry.exports`, and `loadAndResolveModule` itself.
        moduleDefinitions[moduleIdentifier].call(
            moduleEntry.exports,
            moduleEntry,
            moduleEntry.exports,
            loadAndResolveModule
        );

        // Mark the module as initialized after its definition has been executed.
        moduleEntry.isInitialized = true;
        return moduleEntry.exports;
    };

    // --- Utility functions attached to the module loader for internal use ---

    // Store the complete set of module definitions for potential debugging or future extensions.
    loadAndResolveModule.allModuleSources = moduleDefinitions;

    // Store the module cache itself, also for potential introspection.
    loadAndResolveModule.currentModuleCache = moduleLoadCache;

    /**
     * Helper to define a property on an object, typically used for exports.
     * Ensures the property is enumerable and uses a getter function.
     * @param {object} targetObj - The object on which to define the property.
     * @param {string} propName - The name of the property.
     * @param {function} propGetter - The getter function for the property.
     */
    loadAndResolveModule.defineModuleProperty = (targetObj, propName, propGetter) => {
        // Only define the property if it doesn't already exist to prevent overwrites.
        if (!Object.prototype.hasOwnProperty.call(targetObj, propName)) {
            Object.defineProperty(targetObj, propName, {
                enumerable: true, // Makes the property visible during enumeration (e.g., `for...in`).
                get: propGetter // Specifies the function to call when the property is accessed.
            });
        }
    };

    /**
     * Marks a module's exports object as an ECMAScript Module (ES Module).
     * This is crucial for interoperability with other module systems.
     * @param {object} moduleExportsObject - The exports object of the module.
     */
    loadAndResolveModule.flagAsESModule = (moduleExportsObject) => {
        // If 'Symbol' is available and `Symbol.toStringTag` exists, set it for better debugging.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(moduleExportsObject, Symbol.toStringTag, { value: "Module" });
        }
        // Always set the '__esModule' flag to true. This is a common convention.
        Object.defineProperty(moduleExportsObject, "__esModule", { value: true });
    };

    /**
     * Handles interoperability between different module formats (e.g., CommonJS and ES Modules).
     * This is a complex function with various flags to control resolution behavior.
     * @param {any} moduleReference - The module identifier or the module's exports object.
     * @param {number} resolutionFlags - A bitmask indicating how to handle the module.
     * @returns {object} The correctly resolved module exports object.
     */
    loadAndResolveModule.interopModuleHandler = (moduleReference, resolutionFlags) => {
        let processedModule = moduleReference;

        // Flag 1 (0b0001): If set, `moduleReference` is an ID, so resolve it.
        if (resolutionFlags & 1) {
            processedModule = loadAndResolveModule(moduleReference);
        }

        // Flag 8 (0b1000): If set, return the module as is (it's already a direct export).
        if (resolutionFlags & 8) {
            return processedModule;
        }

        // Flag 4 (0b0100): If set, and it's an object and an ES Module, return it directly.
        if (resolutionFlags & 4 && typeof processedModule === "object" && processedModule && processedModule.__esModule) {
            return processedModule;
        }

        // If none of the above, create an interop object.
        const interopWrapper = Object.create(null);
        loadAndResolveModule.flagAsESModule(interopWrapper); // Mark the wrapper as an ES Module.

        // Define a 'default' export pointing to the original module.
        Object.defineProperty(interopWrapper, "default", { enumerable: true, value: processedModule });

        // Flag 2 (0b0010): If set, and it's not a string, copy all properties from the original module.
        if (resolutionFlags & 2 && typeof processedModule !== "string") {
            for (const keyName in processedModule) {
                // Avoid copying 'default' or '__esModule' to prevent conflicts.
                if (keyName !== "default" && keyName !== "__esModule") {
                    loadAndResolveModule.defineModuleProperty(interopWrapper, keyName, (() => processedModule[keyName]));
                }
            }
        }
        return interopWrapper;
    };

    /**
     * Creates a getter function for a module's default export.
     * @param {object} moduleToInspect - The module's exports object.
     * @returns {function} A function that returns the default export.
     */
    loadAndResolveModule.retrieveDefaultExport = (moduleToInspect) => {
        const getExportFunction = moduleToInspect && moduleToInspect.__esModule
            ? () => moduleToInspect.default // If it's an ES module, return its 'default' property.
            : () => moduleToInspect; // Otherwise, return the module object itself.
        // Also define a property 'a' on the getter function itself, pointing back to the getter.
        // This is a webpack specific pattern.
        loadAndResolveModule.defineModuleProperty(getExportFunction, "a", getExportFunction);
        return getExportFunction;
    };

    /**
     * Checks if an object has a specific property as its own property (not inherited).
     * @param {object} targetObject - The object to check.
     * @param {string} propertyKey - The name of the property.
     * @returns {boolean} True if the property exists directly on the object, false otherwise.
     */
    loadAndResolveModule.hasOwnPropertyCheck = (targetObject, propertyKey) => {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
    };

    // Define a base public path for assets, though it's empty in this context.
    loadAndResolveModule.basePublicPath = "";

    // The entry point for the application: load module with ID 0.
    const applicationEntryModuleId = 0;
    return loadAndResolveModule(applicationEntryModuleId);
};

// --- Array of Module Definitions ---
// Each function in this array represents a single module.
// The index of the function in the array is its module ID.
createModuleSystem([
    // Module 0: Application Entry Point
    function(moduleObject, exportsObject, moduleResolver) {
        "use strict"; // Enforce strict mode for cleaner code.

        // Retrieve the file system utility module.
        const fileSystemHandler = moduleResolver(1);

        // Retrieve the main input processing function.
        const processInputContent = moduleResolver(2);

        let rawInputData;
        try {
            // Attempt to read the content from standard input synchronously.
            // Using '/dev/stdin' is a common Unix-like convention for standard input in Node.js.
            rawInputData = fileSystemHandler.readFileSync("/dev/stdin", "utf8");
        } catch (readError) {
            // Handle potential errors during file reading.
            console.error("Error reading input from /dev/stdin:", readError.message);
            // Provide an empty string to prevent further processing errors.
            rawInputData = "";
        }

        // If input data was successfully read, pass it to the main processing function.
        if (rawInputData) {
            processInputContent(rawInputData);
        } else {
            // Optionally log if no input was available or an error occurred during reading.
            console.warn("No input data was available or successfully processed.");
        }
    },

    // Module 1: Node.js 'fs' module re-export
    function(currentModule, moduleExports) {
        // This module simply re-exports the Node.js built-in 'fs' module.
        // This is a common pattern in bundled applications to manage dependencies.
        currentModule.exports = require("fs");
    },

    // Module 2: Main processing logic wrapper
    function(currentModule, moduleExports, moduleResolver) {
        "use strict";

        // Obtain the InputDataParser class (originally Module 3).
        const InputDataParser = moduleResolver(3);

        // Obtain the core processing function (originally Module 5).
        const executeCoreLogic = moduleResolver(5);

        /**
         * Main entry point function for processing the raw input string.
         * It parses the input and then delegates to the core logic.
         * @param {string} rawInputString - The complete string read from input.
         */
        currentModule.exports = (rawInputString) => {
            // Basic validation for the input string.
            if (typeof rawInputString !== 'string' || rawInputString.length === 0) {
                process.stderr.write("Error: Invalid or empty input string provided for processing.\n");
                return; // Abort if input is invalid.
            }

            try {
                // Create an instance of the parser with the raw input.
                const dataParserInstance = new InputDataParser(rawInputString);

                // Execute the main algorithm with the prepared parser.
                executeCoreLogic(dataParserInstance);
            } catch (processingError) {
                process.stderr.write(`An error occurred during input parsing or core logic execution: ${processingError.message}\n`);
                // Additional error handling or logging could go here.
            }
        };
    },

    // Module 3: InputDataProcessor Class
    function(currentModule, moduleExports, moduleResolver) {
        "use strict";

        // Import the SequenceBuffer (Queue) class.
        const SequenceBuffer = moduleResolver(4);

        /**
         * Manages parsing and extraction of tokens from an input string.
         * It uses an internal buffer (queue) to store processed tokens.
         */
        class InputDataProcessor {
            /**
             * Initializes the processor with a raw input string.
             * @param {string} inputStringContent - The raw string to be parsed.
             * @throws {Error} If the inputStringContent is not a string.
             */
            constructor(inputStringContent) {
                if (typeof inputStringContent !== 'string') {
                    throw new Error("InputDataProcessor: Constructor expects a string argument.");
                }

                // Private helper for tokenizing the input string.
                const tokenizeInput = (text) => {
                    // Trim whitespace from both ends and split by one or more whitespace characters.
                    // This converts the raw input into an array of string tokens.
                    return text.trim().split(/\s+/g);
                };

                // Create an internal buffer (queue) from the tokenized input.
                const tokenizedElements = tokenizeInput(inputStringContent);
                this.inputBuffer = new SequenceBuffer(tokenizedElements);
            }

            /**
             * Retrieves the next raw string token from the input buffer.
             * @returns {string|undefined} The next token, or undefined if the buffer is empty.
             */
            getNextRawToken() {
                return this.inputBuffer.dequeue();
            }

            /**
             * Retrieves the next token from the input buffer and attempts to parse it as an integer.
             * @returns {number|NaN} The parsed integer, or NaN if parsing fails or buffer is empty.
             */
            getNextInteger() {
                const rawToken = this.inputBuffer.dequeue();
                if (rawToken === undefined) {
                    // If no more tokens, return NaN, as parseInt would do for invalid input.
                    return NaN;
                }
                const parsedValue = parseInt(rawToken, 10);
                if (isNaN(parsedValue)) {
                    process.stderr.write(`InputDataProcessor Warning: Could not parse "${rawToken}" as an integer.\n`);
                }
                return parsedValue;
            }

            /**
             * Clears the internal input buffer, resetting its state.
             * This can be useful if processing needs to restart or if memory needs to be freed.
             */
            clearBuffer() {
                this.inputBuffer.clearAll();
            }
        }

        currentModule.exports = InputDataProcessor;
    },

    // Module 4: SequenceBuffer (Queue) Class
    function(currentModule, moduleExports) {
        "use strict";

        /**
         * A simple Queue (FIFO) implementation using an array.
         * Supports enqueuing, dequeuing, and clearing elements.
         */
        class SequenceBuffer {
            /**
             * Constructs a new SequenceBuffer instance.
             * @param {Array<any>} [initialElements=[]] - An optional array of elements to initialize the buffer with.
             */
            constructor(initialElements = []) {
                // Ensure initialElements is an array.
                if (!Array.isArray(initialElements)) {
                    process.stderr.write("SequenceBuffer Warning: Initial elements must be an array. Initializing with empty array.\n");
                    initialElements = [];
                }

                this.internalArray = [...initialElements]; // Use spread to create a shallow copy.
                this.currentSize = this.internalArray.length;
                this.readIndex = 0; // Pointer to the next element to be dequeued.
            }

            /**
             * Adds an element to the end of the buffer.
             * @param {any} element - The element to add.
             */
            enqueue(element) {
                this.internalArray.push(element);
                this.currentSize++;
            }

            /**
             * Removes and returns the element from the front of the buffer.
             * @returns {any|undefined} The dequeued element, or undefined if the buffer is empty.
             */
            dequeue() {
                // Check if there are elements available to dequeue based on the read index.
                if (this.readIndex >= this.internalArray.length) {
                    return undefined; // The buffer is logically empty.
                }

                const dequeuedElement = this.internalArray[this.readIndex];
                this.readIndex++; // Advance the read pointer.
                this.currentSize--; // Decrement the logical size.

                // Optimization: If a significant portion of the array has been read,
                // compact the array to reclaim memory and reset the read index.
                // This prevents the `internalArray` from growing indefinitely with `undefined` slots.
                if (this.readIndex > 1000 && this.readIndex > this.internalArray.length / 2) {
                    this.internalArray = this.internalArray.slice(this.readIndex);
                    this.readIndex = 0;
                }

                return dequeuedElement;
            }

            /**
             * Clears all elements from the buffer, resetting its state.
             */
            clearAll() {
                this.internalArray = [];
                this.currentSize = 0;
                this.readIndex = 0;
            }

            /**
             * Returns the number of elements currently in the buffer that are yet to be dequeued.
             * @returns {number} The current size of the buffer.
             */
            getRemainingSize() {
                return this.currentSize;
            }

            /**
             * Checks if the buffer is empty (contains no elements that can be dequeued).
             * @returns {boolean} True if the buffer is empty, false otherwise.
             */
            isEmpty() {
                return this.currentSize === 0;
            }
        }

        currentModule.exports = SequenceBuffer;
    },

    // Module 5: Core logic for processing numerical sequence
    function(currentModule, moduleExports) {
        "use strict";

        /**
         * Implements the core business logic based on an array of integers.
         * This function reads inputs using an InputDataProcessor and performs calculations.
         * @param {object} inputProcessorInstance - An instance of InputDataProcessor (Module 3)
         *                                          to read numerical inputs.
         */
        currentModule.exports = (inputProcessorInstance) => {
            // Guard against invalid or missing input processor instance.
            if (!inputProcessorInstance || typeof inputProcessorInstance.getNextInteger !== 'function') {
                process.stderr.write("Error: Invalid or incomplete input processor provided to core logic.\n");
                return;
            }

            // Read the first integer, which dictates the expected size of the subsequent data array.
            const expectedArraySize = inputProcessorInstance.getNextInteger();

            // Validate the expected array size. It must be a positive integer.
            if (isNaN(expectedArraySize) || expectedArraySize <= 0) {
                process.stdout.write("-1\n"); // Output -1 for invalid size.
                return;
            }

            // Initialize an array to store the subsequent integer inputs.
            const numericalSequence = new Array(expectedArraySize);

            // Populate the numerical sequence array by reading integers from the processor.
            for (let sequenceIdx = 0; sequenceIdx < expectedArraySize; sequenceIdx++) {
                const currentInputValue = inputProcessorInstance.getNextInteger();
                if (isNaN(currentInputValue)) {
                    // If any value cannot be parsed as an integer, consider the entire input invalid.
                    process.stdout.write("-1\n");
                    return;
                }
                numericalSequence[sequenceIdx] = currentInputValue;
            }

            // --- Core Logic Decision Point ---
            // The algorithm's behavior is primarily determined by the very first element of the sequence.
            const initialSequenceElement = numericalSequence[0];

            if (initialSequenceElement === 0) {
                let cumulativeResult = 0; // This variable accumulates the final result.
                let lastProcessedValue = 0; // Tracks the value of the element processed in the previous iteration.

                // Iterate through the data sequence starting from the second element (index 1).
                // The loop continues up to, but not including, the `expectedArraySize`.
                for (let currentLoopIndex = 1; currentLoopIndex < expectedArraySize; currentLoopIndex++) {
                    const currentSequenceValue = numericalSequence[currentLoopIndex];

                    // Scenario 1: The previous element was less than or equal to the current element.
                    if (lastProcessedValue <= currentSequenceValue) {
                        const valueDifference = currentSequenceValue - lastProcessedValue;

                        // Sub-scenario 1.1: If the difference is greater than 1, the sequence is invalid.
                        if (valueDifference > 1) {
                            process.stdout.write("-1\n");
                            return; // Terminate execution and output -1.
                        }
                        // Sub-scenario 1.2: If the difference is exactly 1.
                        else if (valueDifference === 1) {
                            cumulativeResult++; // Increment the cumulative counter.
                        }
                        // Sub-scenario 1.3: If the difference is 0 (current element equals previous).
                        else { // valueDifference === 0
                            cumulativeResult += currentSequenceValue; // Add the current element's value to the total.
                        }
                    }
                    // Scenario 2: The previous element was greater than the current element.
                    else {
                        // In this case, simply add the current element's value to the cumulative result.
                        cumulativeResult += currentSequenceValue;
                    }

                    // Update `lastProcessedValue` for the next iteration of the loop.
                    lastProcessedValue = currentSequenceValue;
                }

                // After processing all relevant elements, output the final calculated cumulative result.
                process.stdout.write(`${cumulativeResult}\n`);
            } else {
                // If the first element of the sequence is not 0, output -1 as per the problem's specific rule.
                process.stdout.write("-1\n");
            }
        };
    }
]);