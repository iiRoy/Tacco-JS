module.exports = function(moduleDefinitions) {
    // This is a custom module loader, designed to mimic a simplified runtime
    // environment for bundled JavaScript modules.
    // It manages module definitions, caching, and dependency resolution.

    // A cache to store already loaded and initialized modules.
    // This prevents redundant execution of module factory functions.
    let moduleCache = {};

    /**
     * The core function responsible for loading and returning a module's exports.
     * It handles caching and execution of module factory functions.
     * @param {number} requestedModuleId - The unique identifier of the module to load.
     * @returns {object} The exports object of the requested module.
     */
    function moduleLoader(requestedModuleId) {
        // If the module is already in our cache, return its exports immediately.
        if (moduleCache[requestedModuleId]) {
            return moduleCache[requestedModuleId].exports;
        }

        // If not cached, create a new module object and add it to the cache.
        // This object holds metadata and the module's exports.
        let currentModuleMetadata = moduleCache[requestedModuleId] = {
            id: requestedModuleId,
            isModuleExecuted: false, // Flag to track if the factory function has been run
            exports: {} // The object where module exports will be collected
        };

        try {
            // Execute the module's factory function.
            // The 'this' context is set to currentModuleMetadata.exports.
            // Arguments passed are: module, exports, and the local 'require' function.
            moduleDefinitions[requestedModuleId].call(
                currentModuleMetadata.exports,
                currentModuleMetadata,
                currentModuleMetadata.exports,
                moduleLoader
            );
            // Mark the module as executed after its factory function completes.
            currentModuleMetadata.isModuleExecuted = true;
        } catch (executionError) {
            // Log any errors that occur during module execution.
            console.error(`Runtime Error: Failed to execute module ${requestedModuleId}.`, executionError);
            // Re-throw the error to halt execution or allow higher-level error handling.
            throw executionError;
        }

        // Return the exports object of the newly loaded (or previously cached) module.
        return currentModuleMetadata.exports;
    }

    // Attach all module definitions to the loader for internal access.
    moduleLoader.allDefinitions = moduleDefinitions;
    // Expose the internal module cache for debugging or advanced features.
    moduleLoader.resolvedCache = moduleCache;

    /**
     * Defines a getter for an export property on a target object.
     * This is typically used for lazy-loaded or non-direct exports in ES Modules.
     * @param {object} targetObject - The object on which to define the property.
     * @param {string} propertyName - The name of the property to define.
     * @param {function} getterFunction - The function that will be called to get the property's value.
     */
    moduleLoader.defineLazyExport = function(targetObject, propertyName, getterFunction) {
        // Only define the property if it doesn't already exist on the target object.
        if (!moduleLoader.hasProperty(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make the property visible during enumeration
                get: getterFunction // Assign the provided function as the getter
            });
        }
    };

    /**
     * Configures an exports object to be recognized as an ECMAScript Module (ESM).
     * This involves setting the Symbol.toStringTag and __esModule properties.
     * @param {object} exportsObject - The exports object to configure.
     */
    moduleLoader.setupESModule = function(exportsObject) {
        // Set Symbol.toStringTag for better debugging in environments that support it.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        // Mark the object as an ES Module for interop with other module systems.
        Object.defineProperty(exportsObject, "__esModule", {
            value: true
        });
    };

    /**
     * Creates a standardized namespace object for a module, handling various export types.
     * This function is crucial for compatibility between CommonJS and ES Module imports.
     * @param {any} moduleValue - The raw exports value of a module.
     * @param {number} modeFlags - A bitmask of flags indicating how to interpret `moduleValue`.
     * @returns {object} A well-formed module namespace object.
     */
    moduleLoader.createModuleNamespace = function(moduleValue, modeFlags) {
        // Flag 1: If moduleValue is a module ID, load it first.
        if ((modeFlags & 1) === 1) {
            moduleValue = moduleLoader(moduleValue);
        }

        // Flag 8: If moduleValue is already a namespace object, return it as is.
        if ((modeFlags & 8) === 8) {
            return moduleValue;
        }

        // Flag 4: If moduleValue is an object and already marked as an ES Module, return it.
        if ((modeFlags & 4) === 4 && typeof moduleValue === "object" && moduleValue !== null && moduleValue.__esModule) {
            return moduleValue;
        }

        // Default case: Create a new, empty namespace object.
        let namespaceObject = Object.create(null);
        moduleLoader.setupESModule(namespaceObject); // Mark it as an ES Module.

        // Define the 'default' export for the namespace object.
        Object.defineProperty(namespaceObject, "default", {
            enumerable: true, // Make it enumerable
            value: moduleValue // Set its value to the original moduleValue
        });

        // Flag 2: If moduleValue is not a string, iterate its properties and
        // define getters on the namespace object for each. This handles CommonJS exports.
        if ((modeFlags & 2) === 2 && typeof moduleValue !== "string") {
            for (let propName in moduleValue) {
                // Ensure we only process own properties of moduleValue.
                if (moduleLoader.hasProperty(moduleValue, propName)) {
                    moduleLoader.defineLazyExport(namespaceObject, propName, (function(key) {
                        return function() { return moduleValue[key]; };
                    })(propName));
                }
            }
        }
        return namespaceObject;
    };

    /**
     * Provides a getter function for a module's default export,
     * handling compatibility between CommonJS and ES Module default exports.
     * @param {object} moduleExports - The exports object of the module.
     * @returns {function} A function that, when called, returns the module's default export.
     */
    moduleLoader.getModuleDefault = function(moduleExports) {
        // Determine the appropriate getter based on whether __esModule is set.
        let defaultGetter = moduleExports && moduleExports.__esModule ?
            function() { return moduleExports.default; } : // If ES Module, return .default
            function() { return moduleExports; };          // Otherwise, the whole exports object is the default

        // Define an alias 'a' for the default getter, common in bundled code.
        moduleLoader.defineLazyExport(defaultGetter, "a", defaultGetter);
        return defaultGetter;
    };

    /**
     * A utility function to check if an object has a specific property as its own.
     * @param {object} targetObject - The object to inspect.
     * @param {string} propertyKey - The key of the property to check.
     * @returns {boolean} True if the property exists directly on the object, false otherwise.
     */
    moduleLoader.hasProperty = function(targetObject, propertyKey) {
        // Basic validation for targetObject to prevent errors.
        if (targetObject === null || typeof targetObject !== 'object' && typeof targetObject !== 'function') {
            // console.warn("hasProperty called with non-object target:", targetObject);
            return false;
        }
        return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
    };

    // The ID of the entry point module where application execution should begin.
    moduleLoader.initialModuleId = 0;

    // Start the application by loading the entry point module.
    return moduleLoader(moduleLoader.initialModuleId);
}([
    /* Module 0: Application Entry Point */
    function(moduleObj, exportsObj, requireFunc) {
        "use strict";
        // This module serves as the primary entry point for the application.
        // It's responsible for reading input and initiating the core logic.

        // Dynamically load the Node.js 'fs' (file system) module via the bundler's require.
        const fileSystemHandler = requireFunc(1);
        // Load the module that orchestrates the input processing and main logic.
        const processInputLogic = requireFunc(2);

        let rawInputContent = '';
        try {
            // Attempt to read all data from standard input (file descriptor 0)
            // as a UTF-8 encoded string. This is common for competitive programming.
            rawInputContent = fileSystemHandler.readFileSync(0, 'utf8');
            console.log("Application: Input data successfully acquired from stdin.");
        } catch (readError) {
            console.error("Application Error: Failed to read from stdin.", readError);
            // If reading fails, ensure rawInputContent is an empty string for safety
            // and terminate execution as input is critical.
            rawInputContent = '';
            return;
        }

        // Validate if any content was actually read.
        if (!rawInputContent || rawInputContent.trim().length === 0) {
            console.warn("Application Warning: No meaningful input provided via stdin. Terminating.");
            return; // Exit if input is empty.
        }

        // Pass the raw, validated input content to the main processing routine.
        processInputLogic(rawInputContent);
    },

    /* Module 1: Node.js File System Module Wrapper */
    function(moduleObject, exportsObject) {
        // This module acts as a simple wrapper to expose the native Node.js 'fs' module.
        // This pattern is often used in bundled environments to manage external dependencies.
        moduleObject.exports = require("fs");
    },

    /* Module 2: Input Processing Orchestrator */
    function(currentModule, exportTarget, localRequire) {
        "use strict";
        // This module coordinates the parsing of the raw input string and
        // then dispatches it to the main algorithmic routine.

        // Import the custom class designed for tokenizing and reading input.
        const inputTokenReaderClass = localRequire(3);
        // Import the core logic function that performs the actual number analysis.
        const numberAnalysisRoutine = localRequire(5);

        /**
         * Main entry function for this module: processes a given input string.
         * @param {string} inputStringData - The raw string data that needs to be processed.
         */
        currentModule.exports = function(inputStringData) {
            // Perform basic validation on the input data.
            if (typeof inputStringData !== 'string' || inputStringData.length === 0) {
                console.error("Orchestrator Error: Received invalid or empty input data for processing.");
                return; // Abort if input is not a valid string.
            }

            console.info("Orchestrator: Beginning input parsing and analysis sequence.");
            // Create an instance of our input reader, initializing it with the raw data.
            const inputDataParser = new inputTokenReaderClass(inputStringData);

            // Invoke the main number analysis routine, passing the parser instance.
            numberAnalysisRoutine(inputDataParser);
            console.info("Orchestrator: Input processing and analysis completed.");
        };
    },

    /* Module 3: Input Token Reader Class */
    function(moduleRef, exportsRef, reqRef) {
        "use strict";
        // This module defines a utility class for extracting and converting
        // tokens (specifically numbers) from a raw string input.

        // Import the BasicTokenQueue class to manage the sequence of parsed tokens.
        const TokenQueueManager = reqRef(4);

        /**
         * @class InputTokenReader
         * A specialized class to read and parse individual tokens (numbers)
         * from a given string, typically space-separated.
         */
        class InputTokenReader {
            /**
             * @constructor
             * @param {string} rawInputTextContent - The initial string containing tokens.
             */
            constructor(rawInputTextContent) {
                // Ensure the input is treated as a string and remove leading/trailing whitespace.
                const cleanedInput = String(rawInputTextContent || '').trim();

                // Use a regular expression to split the cleaned input into non-whitespace tokens.
                // This handles multiple spaces between tokens and ensures no empty tokens.
                const processedTokens = cleanedInput.match(/\S+/g) || [];

                if (processedTokens.length === 0) {
                    console.warn("InputTokenReader Warning: Initialized with an input string that yielded no valid tokens.");
                }

                // Initialize an internal queue (TokenQueueManager) with the extracted tokens.
                this.tokenStream = new TokenQueueManager(processedTokens);
            }

            /**
             * Retrieves the next raw string token from the internal stream.
             * @returns {string | undefined} The next token string, or `undefined` if the stream is exhausted.
             */
            fetchNextRaw() {
                if (this.tokenStream.isEmpty()) {
                    console.debug("InputTokenReader Debug: Attempted to fetch raw token from an exhausted stream.");
                    return undefined;
                }
                return this.tokenStream.retrieveItem();
            }

            /**
             * Retrieves the next token and attempts to parse it as an integer.
             * @returns {number | typeof NaN} The parsed integer, or `NaN` if parsing fails or no token is available.
             */
            fetchNextInt() {
                const rawToken = this.fetchNextRaw();
                if (rawToken === undefined) {
                    return NaN; // No token to parse.
                }

                const parsedValue = parseInt(rawToken, 10);
                if (Number.isNaN(parsedValue)) {
                    console.warn(`InputTokenReader Warning: Failed to parse token "${rawToken}" as an integer.`);
                }
                return parsedValue;
            }

            /**
             * Checks if there are any more tokens available in the stream.
             * @returns {boolean} `true` if tokens are remaining, `false` otherwise.
             */
            hasMoreTokens() {
                return !this.tokenStream.isEmpty();
            }

            /**
             * Peeks at the next raw token without removing it from the stream.
             * @returns {string | undefined} The next token string, or `undefined` if the stream is empty.
             */
            peekNextRaw() {
                return this.tokenStream.peek();
            }

            /**
             * Clears all tokens from the internal stream and resets its state.
             */
            clearAllTokens() {
                this.tokenStream.resetQueue();
                console.debug("InputTokenReader Debug: Internal token stream has been cleared.");
            }
        }

        moduleRef.exports = InputTokenReader;
    },

    /* Module 4: Basic Token Queue Class */
    function(moduleRef, exportsRef, reqRef) {
        "use strict";
        // This module provides a basic First-In, First-Out (FIFO) queue implementation.

        /**
         * @class BasicTokenQueue
         * A simple queue data structure implemented using an array,
         * optimized for efficient dequeue operations by using a read index.
         */
        class BasicTokenQueue {
            /**
             * @constructor
             * @param {Array<any>} [initialElementsArray=[]] - An optional array to pre-populate the queue.
             */
            constructor(initialElementsArray = []) {
                this.internalStorage = initialElementsArray; // The underlying array to store items.
                this.readIndex = 0; // Pointer to the next item to be dequeued.
            }

            /**
             * Gets the number of items currently considered "in" the queue.
             * This accounts for items that have been logically dequeued but not yet removed from storage.
             * @returns {number} The effective size of the queue.
             */
            get currentCount() {
                return this.internalStorage.length - this.readIndex;
            }

            /**
             * Checks if the queue is empty.
             * @returns {boolean} True if there are no items in the queue, false otherwise.
             */
            isEmpty() {
                return this.currentCount === 0;
            }

            /**
             * Adds an item to the end of the queue.
             * @param {any} item - The item to be added.
             */
            appendItem(item) {
                this.internalStorage.push(item);
            }

            /**
             * Removes and returns the item from the front of the queue.
             * This operation is O(1) amortized due to the `readIndex` and occasional cleanup.
             * @returns {any | undefined} The item at the front of the queue, or `undefined` if the queue is empty.
             */
            retrieveItem() {
                if (this.isEmpty()) {
                    console.debug("BasicTokenQueue Debug: Attempted to retrieve item from an empty queue.");
                    return undefined;
                }

                const item = this.internalStorage[this.readIndex];
                this.readIndex++; // Advance the read pointer.

                // Periodically clean up the `internalStorage` array to prevent
                // excessive memory usage from logically dequeued items.
                // This is a Type III optimization.
                const CLEANUP_THRESHOLD = 2000; // Example: clean up if readIndex exceeds this.
                if (this.readIndex > CLEANUP_THRESHOLD && this.readIndex > this.internalStorage.length / 2) {
                    this.internalStorage = this.internalStorage.slice(this.readIndex);
                    this.readIndex = 0; // Reset readIndex after slicing.
                    console.debug("BasicTokenQueue Debug: Performed internal storage cleanup.");
                }

                return item;
            }

            /**
             * Returns the item at the front of the queue without removing it.
             * @returns {any | undefined} The item at the front, or `undefined` if the queue is empty.
             */
            peek() {
                if (this.isEmpty()) {
                    return undefined;
                }
                return this.internalStorage[this.readIndex];
            }

            /**
             * Clears all items from the queue and resets its state.
             */
            resetQueue() {
                this.internalStorage = [];
                this.readIndex = 0;
                console.debug("BasicTokenQueue Debug: Queue has been reset and cleared.");
            }
        }

        moduleRef.exports = BasicTokenQueue;
    },

    /* Module 5: Core Number Analysis Logic */
    function(moduleRef, exportObj, localRequire) {
        "use strict";
        // This module contains the main algorithm to determine if a number
        // has three or more consecutive identical digits.

        /**
         * Analyzes a number obtained from an input source to check for consecutive identical digits.
         * The function determines if any digit appears a specified minimum number of times consecutively.
         * @param {object} inputDataSource - An object conforming to the InputTokenReader interface,
         *                                   expected to have a `fetchNextInt()` method.
         */
        moduleRef.exports = function analyzeNumberSequence(inputDataSource) {
            // Guard against invalid or missing input data source.
            if (!inputDataSource || typeof inputDataSource.fetchNextInt !== 'function') {
                console.error("NumberAnalysis Error: Invalid or incomplete input data source provided.");
                console.log("No"); // Default output for invalid input.
                return;
            }

            const MIN_CONSECUTIVE_COUNT = 3; // Define the threshold for consecutive digits as a constant.

            // Retrieve the number to be analyzed from the input source.
            let activeNumber = inputDataSource.fetchNextInt();

            // Validate the fetched number to ensure it's a valid integer.
            if (Number.isNaN(activeNumber) || !Number.isInteger(activeNumber)) {
                console.warn(`NumberAnalysis Warning: Input was not a valid integer: "${activeNumber}".`);
                console.log("No"); // Output "No" for non-numeric or non-integer input.
                return;
            }

            // Handle specific edge cases for the input number.
            if (activeNumber < 0) {
                console.debug("NumberAnalysis Debug: Input is negative. Converting to positive for digit extraction.");
                activeNumber = Math.abs(activeNumber); // Work with the absolute value of the number.
            }
            if (activeNumber === 0) {
                // The number '0' has only one digit. If MIN_CONSECUTIVE_COUNT is 3, it cannot meet the criteria.
                console.debug("NumberAnalysis Debug: Input is zero. No consecutive sequence possible for count >= 3.");
                console.log("No");
                return;
            }

            let consecutiveLength = 1; // Counter for the current sequence of identical digits.
            // Initialize `lastDigitSeen` to a value outside the 0-9 range to ensure the first digit
            // correctly starts a new sequence.
            let lastDigitSeen = -1;
            let foundLongSequence = false; // Flag to indicate if the condition has been met.

            console.debug(`NumberAnalysis Debug: Starting analysis for number: ${activeNumber}`);

            // Iterate through the digits of the number from right to left (least significant to most significant).
            while (activeNumber > 0) {
                const currentDigit = activeNumber % 10; // Extract the last digit.

                console.debug(`NumberAnalysis Debug: Processing digit: ${currentDigit}, remaining number: ${activeNumber}`);

                // Compare the current digit with the one seen in the previous iteration.
                if (currentDigit === lastDigitSeen) {
                    consecutiveLength++; // If they are the same, extend the current sequence.
                } else {
                    // If digits differ, reset the sequence counter and update the last seen digit.
                    lastDigitSeen = currentDigit;
                    consecutiveLength = 1;
                }

                // Check if the current consecutive sequence meets or exceeds the minimum required length.
                if (consecutiveLength >= MIN_CONSECUTIVE_COUNT) {
                    foundLongSequence = true;
                    // Optimization: Once the condition is met, there's no need to process further digits.
                    break;
                }

                // Remove the last digit from `activeNumber` for the next iteration.
                // Using Math.floor ensures integer division.
                activeNumber = Math.floor(activeNumber / 10);
            }

            // Output the final result based on whether a long sequence was found.
            if (foundLongSequence) {
                console.log("Yes");
            } else {
                console.log("No");
            }
        };
    }
]);