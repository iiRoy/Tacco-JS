module.exports = function(moduleDefinitions) {
    // A cache to store references to modules that have already been loaded.
    const moduleRegistry = {};

    /**
     * Resolves and loads a module based on its unique numerical identifier.
     * If the module is already loaded, its exports are returned from the cache.
     * Otherwise, the module's definition function is executed, and its exports are cached.
     * @param {number} requestedModuleId The numerical ID of the module to retrieve.
     * @returns {object} The exports object of the requested module.
     */
    function obtainResolvedModule(requestedModuleId) {
        // Check if the module is already available in our registry.
        if (moduleRegistry[requestedModuleId]) {
            return moduleRegistry[requestedModuleId].exports;
        }

        // If not, create a new module object and store it.
        const currentModuleObject = moduleRegistry[requestedModuleId] = {
            uniqueId: requestedModuleId, // The module's identifier.
            isInitialized: false,       // Flag indicating if the module's code has run.
            exports: {}                 // The object to hold the module's exported values.
        };

        // Execute the module's definition function.
        // The 'this' context is set to currentModuleObject.exports,
        // and the module object, its exports, and the obtainResolvedModule function itself are passed as arguments.
        moduleDefinitions[requestedModuleId].call(currentModuleObject.exports, currentModuleObject, currentModuleObject.exports, obtainResolvedModule);

        // Mark the module as initialized after its definition code has executed.
        currentModuleObject.isInitialized = true;

        // Return the populated exports object.
        return currentModuleObject.exports;
    }

    // --- Helper functions for managing module properties and interop (inspired by bundlers) ---

    // Store a direct reference to all available module definitions.
    obtainResolvedModule.allModuleDefinitions = moduleDefinitions;

    // Store a direct reference to the module cache/registry.
    obtainResolvedModule.cachedModuleReferences = moduleRegistry;

    /**
     * Defines a new enumerable getter property on a target object.
     * This is useful for exposing module exports as properties.
     * @param {object} targetObj The object on which to define the property.
     * @param {string} propKey The name of the property.
     * @param {Function} getterFunc The function to be called when the property is accessed.
     */
    obtainResolvedModule.defineExportProperty = function(targetObj, propKey, getterFunc) {
        // A check to prevent defining property if it already exists, though Object.defineProperty handles this.
        if (!obtainResolvedModule.hasDirectProperty(targetObj, propKey)) {
            Object.defineProperty(targetObj, propKey, {
                enumerable: true, // Make the property visible during enumeration (e.g., in a for...in loop).
                get: getterFunc   // The function that retrieves the property's value.
            });
        }
    };

    /**
     * Marks a given module's exports object as an ECMAScript Module (ESM).
     * This adds '__esModule' and 'Symbol.toStringTag' properties.
     * @param {object} moduleExportObject The exports object to mark as an ESM.
     */
    obtainResolvedModule.markAsESModule = function(moduleExportObject) {
        // If Symbol.toStringTag exists, use it for better module identification.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(moduleExportObject, Symbol.toStringTag, { value: "Module" });
        }
        // The standard '__esModule' flag for ES Module identification.
        Object.defineProperty(moduleExportObject, "__esModule", { value: true });
    };

    /**
     * Provides a unified way to get all exports from a module, handling different module formats (CommonJS, ESM).
     * This is a complex interop function that interprets a 'flags' bitmask.
     * @param {any} sourceOfExports The module ID or the module's exports object.
     * @param {number} interopFlags A bitmask indicating how to process the exports.
     * @returns {object} An object containing all exports.
     */
    obtainResolvedModule.aggregateExports = function(sourceOfExports, interopFlags) {
        let processedExportSource = sourceOfExports;

        // If the first bit (1) is set, it means `sourceOfExports` is a module ID, so resolve it.
        if (interopFlags & 1) {
            processedExportSource = obtainResolvedModule(sourceOfExports);
        }

        // If the third bit (8) is set, return the processed source directly.
        if (interopFlags & 8) {
            return processedExportSource;
        }

        // If the second bit (4) is set, and it's an object and an ES module, return it directly.
        if (interopFlags & 4 && typeof processedExportSource === "object" && processedExportSource && processedExportSource.__esModule) {
            return processedExportSource;
        }

        // Create a new object to hold the aggregated exports.
        const combinedExportsObject = Object.create(null);
        obtainResolvedModule.markAsESModule(combinedExportsObject); // Mark it as an ES module.

        // Define the 'default' export, pointing to the original processed source.
        Object.defineProperty(combinedExportsObject, "default", {
            enumerable: true,
            value: processedExportSource
        });

        // If the fourth bit (2) is set and the source is not a string, copy all its properties.
        if (interopFlags & 2 && typeof processedExportSource !== "string") {
            for (const propertyName in processedExportSource) {
                // Only copy direct properties, not inherited ones.
                if (obtainResolvedModule.hasDirectProperty(processedExportSource, propertyName)) {
                    obtainResolvedModule.defineExportProperty(combinedExportsObject, propertyName, () => processedExportSource[propertyName]);
                }
            }
        }
        return combinedExportsObject;
    };

    /**
     * Creates a getter function for a module's default export.
     * @param {object} moduleExportsObj The module's exports object.
     * @returns {Function} A function that returns the default export.
     */
    obtainResolvedModule.createDefaultExportGetter = function(moduleExportsObj) {
        const defaultExportAccessor = moduleExportsObj && moduleExportsObj.__esModule ?
            () => moduleExportsObj.default : // If it's an ES module, return its 'default' property.
            () => moduleExportsObj;         // Otherwise, the module itself is considered the default.

        // Conventionally, a property 'a' is defined to hold this getter.
        obtainResolvedModule.defineExportProperty(defaultExportAccessor, "a", defaultExportAccessor);
        return defaultExportAccessor;
    };

    /**
     * Checks if an object has a property directly (i.e., not inherited from its prototype chain).
     * @param {object} targetObject The object to check.
     * @param {string} propertyName The name of the property.
     * @returns {boolean} True if the object has the property directly, false otherwise.
     */
    obtainResolvedModule.hasDirectProperty = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    // --- End of helper functions ---

    // The entry point for the application, typically module ID 0.
    const applicationEntryModuleId = 0;
    return obtainResolvedModule(applicationEntryModuleId);
}([
    // --- Array of Module Definitions ---

    /* Module 0: Primary Application Execution Flow */
    function(moduleObject, moduleExports, localRequire) {
        "use strict";
        // Retrieve the Node.js 'fs' (file system) module via our custom loader.
        const fileSystemHelper = localRequire(1);

        // Retrieve the function responsible for processing the input and orchestrating the solution.
        const mainProblemHandler = localRequire(2);

        try {
            // Attempt to read all content from standard input synchronously.
            // Using '/dev/stdin' is a common convention for competitive programming in Unix-like systems.
            const rawInputStreamContent = fileSystemHelper.readFileSync("/dev/stdin", "utf8");

            // Validate if any content was actually read.
            if (!rawInputStreamContent || rawInputStreamContent.trim().length === 0) {
                console.error("Error: Standard input stream was empty or contained only whitespace. No data to process.");
                // Terminate gracefully if no input is provided.
                return;
            }

            // Pass the raw input string to the main problem handler for processing.
            mainProblemHandler(rawInputStreamContent);
        } catch (inputReadError) {
            // Catch and report any errors that occur during the file system read operation.
            console.error(`An error occurred while attempting to read from /dev/stdin: ${inputReadError.message}`);
            // Depending on the application, specific error handling (e.g., exiting the process) might be added here.
        }
    },

    /* Module 1: Node.js File System (fs) Module Wrapper */
    function(moduleObject, moduleExports) {
        // This module simply re-exports the native Node.js 'fs' module.
        // Using `globalThis.require` makes it explicit that we're accessing the global Node.js require.
        moduleExports.exports = globalThis.require("node:fs");
    },

    /* Module 2: Input Data Processor and Solver Initiator */
    function(moduleObject, moduleExports, localRequire) {
        "use strict";
        // Load the custom class designed to parse input data.
        const InputDataStreamParser = localRequire(3);
        // Load the core algorithm responsible for solving the problem.
        const CoreProblemSolver = localRequire(5);

        /**
         * Orchestrates the parsing of raw input data and initiates the problem-solving process.
         * @param {string} rawInputStringData The raw string content obtained from the input source.
         */
        moduleExports.exports = function initiateSolverExecution(rawInputStringData) {
            // Basic type and content validation for the input data.
            if (typeof rawInputStringData !== 'string' || rawInputStringData.length === 0) {
                console.error("Validation Error: 'initiateSolverExecution' received invalid or empty input data.");
                return; // Abort if input is not valid.
            }

            // Create an instance of our custom parser, feeding it the raw input.
            const inputDataReader = new InputDataStreamParser(rawInputStringData);

            // Execute the primary problem solver logic, passing the initialized input reader.
            CoreProblemSolver(inputDataReader);
        };
    },

    /* Module 3: Input Data Stream Parser Class */
    function(moduleObject, moduleExports, localRequire) {
        "use strict";
        // Load the custom queue implementation used to buffer input tokens.
        const TokenQueueBuffer = localRequire(4);

        /**
         * A utility class to parse a raw input string into individual tokens
         * and provide methods for sequential reading, specifically for integers.
         */
        moduleExports.exports = class InputDataStreamParser {
            /**
             * Constructs an `InputDataStreamParser` instance.
             * @param {string} rawInputContent The complete string containing input values, typically space-separated.
             */
            constructor(rawInputContent) {
                // Robustness check: ensure input is a string.
                if (typeof rawInputContent !== 'string') {
                    console.warn("InputDataStreamParser: Non-string input detected. Coercing to string.");
                    rawInputContent = String(rawInputContent);
                }

                // Tokenize the input string:
                // 1. Trim leading/trailing whitespace.
                // 2. Split by one or more whitespace characters.
                const parsedTokensArray = rawInputContent.trim().split(/\s+/g);

                // Initialize an internal queue (TokenQueueBuffer) with the extracted tokens.
                this.internalTokenQueue = new TokenQueueBuffer(parsedTokensArray);

                // Add a counter to track how many tokens have been successfully read.
                this.processedTokenCount = 0;
            }

            /**
             * Retrieves and returns the next raw string token from the internal queue.
             * @returns {string|undefined} The next token as a string, or `undefined` if the queue is empty.
             */
            readNextStringToken() {
                const tokenValue = this.internalTokenQueue.removeFront();
                if (tokenValue !== undefined) {
                    this.processedTokenCount++;
                }
                return tokenValue;
            }

            /**
             * Reads the next token and attempts to convert it into an integer.
             * @returns {number|NaN} The parsed integer value, or `NaN` if parsing fails or no more tokens.
             */
            readNextParsedInteger() {
                const tokenString = this.readNextStringToken();
                if (tokenString === undefined) {
                    console.warn("InputDataStreamParser: Attempted to read an integer from an exhausted stream.");
                    return NaN; // Indicate failure to read.
                }

                const integerValue = parseInt(tokenString, 10);
                // Log a warning if parsing was not successful.
                if (isNaN(integerValue)) {
                    console.warn(`InputDataStreamParser: Failed to parse "${tokenString}" into an integer.`);
                }
                return integerValue;
            }

            /**
             * Resets the internal token queue, effectively clearing all buffered input.
             * This method was present in the original structure but not actively used by the solver.
             */
            clearAllBufferedInput() {
                this.internalTokenQueue.emptyBuffer();
                this.processedTokenCount = 0; // Reset token count.
                console.info("Input buffer has been successfully cleared."); // Informative log.
            }
        };
    },

    /* Module 4: Token Queue Buffer Class (Deque-like) */
    function(moduleObject, moduleExports, localRequire) {
        "use strict";

        /**
         * A basic queue implementation that stores tokens in an array.
         * It uses a read pointer to simulate dequeuing, avoiding costly array shifts.
         * Elements are only physically removed upon calling `emptyBuffer()`.
         */
        moduleExports.exports = class TokenQueueBuffer {
            /**
             * Initializes the `TokenQueueBuffer`.
             * @param {Array<any>} [initialItems=[]] An optional array of items to pre-fill the buffer.
             */
            constructor(initialItems = []) {
                // Ensure `initialItems` is an array; if not, initialize with an empty array.
                if (!Array.isArray(initialItems)) {
                    console.warn("TokenQueueBuffer: Constructor received non-array input. Initializing with an empty array.");
                    initialItems = [];
                }
                // Create a shallow copy to prevent external modifications to the initial array.
                this.internalDataStorage = [...initialItems];
                this.currentReadIndex = 0; // Pointer to the next item to be read.
            }

            /**
             * Adds an item to the end of the buffer (enqueue operation).
             * @param {any} itemToAdd The item to be appended.
             */
            addBack(itemToAdd) {
                this.internalDataStorage.push(itemToAdd);
            }

            /**
             * Removes and returns the item from the front of the buffer (dequeue operation).
             * Advances the internal read pointer.
             * @returns {any|undefined} The item at the front, or `undefined` if the buffer is empty.
             */
            removeFront() {
                // Check if there are any unread items left in the buffer.
                if (this.currentReadIndex >= this.internalDataStorage.length) {
                    // console.warn("TokenQueueBuffer: Attempted to remove from an empty or fully consumed buffer.");
                    return undefined; // Indicate that no item could be retrieved.
                }
                const itemToBeReturned = this.internalDataStorage[this.currentReadIndex];
                this.currentReadIndex++; // Move the pointer to the next item.
                return itemToBeReturned;
            }

            /**
             * Gets the number of items currently available to be read from the buffer.
             * This is a getter property.
             * @returns {number} The count of remaining items.
             */
            get availableItemCount() {
                return this.internalDataStorage.length - this.currentReadIndex;
            }

            /**
             * Checks if the buffer is currently empty (i.e., no more items can be read).
             * @returns {boolean} `true` if empty, `false` otherwise.
             */
            isEmpty() {
                return this.availableItemCount === 0;
            }

            /**
             * Clears all items from the buffer and resets the read pointer to the beginning.
             */
            emptyBuffer() {
                this.internalDataStorage = []; // Discard the old array.
                this.currentReadIndex = 0;   // Reset the pointer.
            }
        };
    },

    /* Module 5: Core Problem-Solving Algorithm */
    function(moduleObject, moduleExports, localRequire) {
        "use strict";
        // Import the utility function that finds all divisors of a given number.
        const DivisorPairGenerator = localRequire(6);

        /**
         * Implements the main problem-solving logic:
         * Given an integer N, find two positive integer factors A and B such that A * B = N,
         * and the sum (A-1) + (B-1) is minimized. This is equivalent to minimizing A + B.
         * The function then outputs this minimized sum.
         * @param {object} inputParserInstance An instance of `InputDataStreamParser` to read N.
         */
        moduleExports.exports = function solveFactorSumMinimization(inputParserInstance) {
            // Read the main integer N from the provided input parser.
            const targetNumberN = inputParserInstance.readNextParsedInteger();

            // Perform input validation for N.
            if (isNaN(targetNumberN) || !Number.isInteger(targetNumberN) || targetNumberN <= 0) {
                console.error(`Solver Error: Invalid or non-positive integer input N received: ${targetNumberN}. Aborting.`);
                return; // Exit the function if input is invalid.
            }

            // Handle the edge case where N is 1. Factors are (1,1). (1-1)+(1-1) = 0.
            if (targetNumberN === 1) {
                console.log(0);
                return;
            }

            // Generate a map of all divisors and their complements for N.
            const divisorsAndComplementsMap = DivisorPairGenerator(targetNumberN);

            let minimumCombinedPenalty = Infinity; // Stores the smallest (A-1)+(B-1) found so far.
            let optimalFactor1 = 0;               // Stores the first factor of the optimal pair.
            let optimalFactor2 = 0;               // Stores the second factor of the optimal pair.

            // Iterate through the keys (divisors) of the generated map.
            // Using Object.entries for a more direct access to key-value pairs.
            for (const [factorKey, complementValue] of Object.entries(divisorsAndComplementsMap)) {
                // Parse the key to ensure it's treated as a number.
                const currentFactorA = parseInt(factorKey, 10);
                const currentFactorB = complementValue; // The complement is already a number.

                // Optimization: To avoid redundant calculations and ensure A <= B,
                // we only process a pair if currentFactorA is less than or equal to currentFactorB.
                // The map contains both (A:B) and (B:A), so we only need to check one direction.
                if (currentFactorA > currentFactorB) {
                    continue; // Skip if we've already considered this pair in reverse.
                }

                // Calculate the "penalty" or "cost" for the current pair of factors (A-1) + (B-1).
                const currentPairPenalty = (currentFactorA - 1) + (currentFactorB - 1);

                // If this pair's penalty is less than the current minimum, update our optimal values.
                if (currentPairPenalty < minimumCombinedPenalty) {
                    minimumCombinedPenalty = currentPairPenalty;
                    optimalFactor1 = currentFactorA;
                    optimalFactor2 = currentFactorB;
                }
            }

            // Output the calculated minimum combined penalty to the console.
            console.log(minimumCombinedPenalty);

            // Optional: Add detailed logging for debugging or verification.
            // console.debug(`For N=${targetNumberN}, optimal factors are ${optimalFactor1} and ${optimalFactor2}, yielding a minimum penalty of ${minimumCombinedPenalty}.`);
        };
    },

    /* Module 6: Divisor Pair Calculation Utility */
    function(moduleObject, moduleExports, localRequire) {
        "use strict";

        /**
         * Computes all positive integer divisors of a given `valueToFactor`
         * and returns them in an object where keys are divisors and values are their corresponding complements.
         * For example, for 12, it might return {1:12, 2:6, 3:4, 4:3, 6:2, 12:1}.
         * @param {number} valueToFactor The positive integer for which to find divisors.
         * @returns {object} An object (map) of divisor-complement pairs.
         */
        moduleExports.exports = function calculateDivisorPairs(valueToFactor) {
            const resultDivisorMap = {};

            // Input validation: ensure `valueToFactor` is a positive integer.
            if (typeof valueToFactor !== 'number' || !Number.isInteger(valueToFactor) || valueToFactor <= 0) {
                console.error(`Divisor Calculator Error: Invalid input value for factoring: ${valueToFactor}. Must be a positive integer.`);
                return resultDivisorMap; // Return an empty map for invalid input.
            }

            // We only need to check for divisors up to the square root of `valueToFactor`.
            // Any divisor `d` greater than `sqrt(N)` will have a complement `N/d` that is less than `sqrt(N)`.
            const upperLimitForCheck = Math.ceil(Math.sqrt(valueToFactor));

            // Iterate from 1 up to the calculated upper limit.
            for (let currentCandidate = 1; currentCandidate <= upperLimitForCheck; currentCandidate++) {
                // Check if `currentCandidate` is a divisor of `valueToFactor`.
                if (valueToFactor % currentCandidate === 0) {
                    const complementFactor = valueToFactor / currentCandidate;

                    // Store both the divisor and its complement in the map.
                    // This ensures that `resultDivisorMap[divisor]` and `resultDivisorMap[complement]` both work.
                    resultDivisorMap[currentCandidate] = complementFactor;
                    resultDivisorMap[complementFactor] = currentCandidate;

                    // Optional: Add a log for each pair found during calculation.
                    // console.debug(`Found factor pair for ${valueToFactor}: ${currentCandidate} and ${complementFactor}`);
                }
            }

            return resultDivisorMap;
        };
    }
]);