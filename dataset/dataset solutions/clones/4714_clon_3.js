// The entire module loader has been significantly refactored and renamed.
// This structure emulates a simplified module bundling system, similar to Webpack's runtime.
module.exports = function(moduleDefinitions) {
    // A cache to store already loaded modules, preventing redundant execution.
    const moduleCache = {};

    /**
     * Custom module loading function.
     * @param {number} moduleId - The identifier for the module to load.
     * @returns {object} The exports of the requested module.
     */
    function obtainModule(moduleId) {
        // If the module is already in the cache, return its exports immediately.
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        // Initialize a new entry in the cache for the module.
        // 'modInfo.loaded' tracks if the module has finished loading.
        const modInfo = moduleCache[moduleId] = {
            modId: moduleId, // Store the module's unique ID.
            loaded: false,   // Flag indicating loading status.
            exports: {}      // The object that will hold the module's exports.
        };

        // Execute the module's definition function, populating its exports.
        // The definition function receives (module, module.exports, customRequire).
        // A try-catch block is added for robust error handling during module execution.
        try {
            // Guard clause: Ensure the module definition exists before calling.
            if (typeof moduleDefinitions[moduleId] !== 'function') {
                throw new Error(`Module definition for ID ${moduleId} is missing or not a function.`);
            }
            moduleDefinitions[moduleId].call(modInfo.exports, modInfo, modInfo.exports, obtainModule);
        } catch (executionError) {
            console.error(`Error executing module ${moduleId}:`, executionError);
            // Optionally re-throw or handle more gracefully. For this clone, re-throw.
            throw executionError;
        }

        // Mark the module as loaded after successful execution.
        modInfo.loaded = true;
        // Return the populated exports object.
        return modInfo.exports;
    }

    // --- Helper functions attached to the module loader for advanced features ---

    // Store a reference to the module definitions for potential future use (e.g., hot reloading).
    obtainModule.moduleSources = moduleDefinitions;
    // Store a reference to the module cache.
    obtainModule.loadedModules = moduleCache;

    /**
     * Defines a getter function for a module's export property.
     * This is used for compatibility with ES module exports.
     * @param {object} targetObject - The object to define the property on.
     * @param {string} propertyName - The name of the property to define.
     * @param {function} getterFunc - The function that returns the property's value.
     */
    obtainModule.defineExportGetter = function(targetObject, propertyName, getterFunc) {
        // Only define if the property doesn't already exist.
        if (!obtainModule.checkOwnProperty(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make the property iterable.
                get: getterFunc   // The getter function.
            });
        }
    };

    /**
     * Marks a module as an ES module by adding the '__esModule' property.
     * Also sets Symbol.toStringTag for better debugging.
     * @param {object} targetModule - The module's exports object.
     */
    obtainModule.markAsEsModule = function(targetModule) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(targetModule, Symbol.toStringTag, { value: 'Module' });
        }
        Object.defineProperty(targetModule, '__esModule', { value: true });
    };

    /**
     * Creates a namespace object for a module.
     * This handles various module types (ES module, CommonJS, etc.)
     * @param {any} sourceModule - The module or its ID.
     * @param {number} flags - Bitmask flags for module processing.
     * @returns {object} A namespace object.
     */
    obtainModule.createNamespace = function(sourceModule, flags) {
        let resolvedModule = sourceModule;

        // Flag 1: If sourceModule is an ID, resolve it via obtainModule.
        const IS_MODULE_ID_FLAG = 1;
        if (flags & IS_MODULE_ID_FLAG) {
            resolvedModule = obtainModule(sourceModule);
        }

        // Flag 8: If it's already an ES module, return it directly.
        const IS_ES_MODULE_FLAG = 8;
        if (flags & IS_ES_MODULE_FLAG && typeof resolvedModule === 'object' && resolvedModule && resolvedModule.__esModule) {
            return resolvedModule;
        }

        // Flag 4: If it's an object and looks like an ES module, use it. (Less strict than flag 8)
        const IS_POTENTIAL_ES_MODULE_FLAG = 4;
        if (flags & IS_POTENTIAL_ES_MODULE_FLAG && typeof resolvedModule === 'object' && resolvedModule && resolvedModule.__esModule) {
            return resolvedModule;
        }


        // Create a new namespace object.
        const namespaceObject = Object.create(null);
        obtainModule.markAsEsModule(namespaceObject); // Mark as ES module.

        // Set the 'default' export.
        Object.defineProperty(namespaceObject, "default", {
            enumerable: true,
            value: resolvedModule
        });

        // Flag 2: Copy all properties from the source module to the namespace, except 'default' if it's not a string.
        const COPY_PROPERTIES_FLAG = 2;
        if (flags & COPY_PROPERTIES_FLAG && typeof resolvedModule !== 'string') {
            for (const propKey in resolvedModule) {
                // Ensure we don't overwrite 'default' if it's already defined or a special key.
                if (propKey === "default" || obtainModule.checkOwnProperty(namespaceObject, propKey)) continue;

                // Define a getter for each property to lazily retrieve its value.
                obtainModule.defineExportGetter(namespaceObject, propKey, (() => resolvedModule[propKey]).bind(null));
            }
        }
        return namespaceObject;
    };

    /**
     * Helper to get the default export of a module.
     * @param {object} targetModule - The module's exports object.
     * @returns {function} A function that returns the default export.
     */
    obtainModule.getDefaultExport = function(targetModule) {
        const getExport = targetModule && targetModule.__esModule
            ? () => targetModule['default'] // If it's an ES module, get 'default'.
            : () => targetModule;           // Otherwise, the module itself is the default.

        // Define a getter 'a' for convenience, pointing to the default export.
        obtainModule.defineExportGetter(getExport, "a", getExport);
        return getExport;
    };

    /**
     * Checks if an object has a specified property directly (not inherited).
     * @param {object} obj - The object to check.
     * @param {string} prop - The property name.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    obtainModule.checkOwnProperty = function(obj, prop) {
        // Using Object.prototype.hasOwnProperty.call for robustness,
        // especially when 'obj' might override hasOwnProperty.
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    // Initialize the public path for assets (empty string by default).
    obtainModule.publicPath = "";

    // The entry point for the application. Load module 0.
    // The 's' property was often used in webpack for the entry module ID.
    const entryModuleId = 0;
    obtainModule.startingModuleId = entryModuleId; // Store for debugging/inspection.
    return obtainModule(entryModuleId);

}(
    // --- Array of Module Definitions for the Application ---
    [
        // Module 0: Main Application Entry Point
        // This module reads input and orchestrates the main processing.
        function(moduleObj, moduleExports, customRequire) {
            "use strict"; // Enforce strict mode for cleaner code.

            // Custom error handling for file system operations.
            let fileSystemAccess;
            try {
                fileSystemAccess = customRequire(1); // Load the 'fs' module.
            } catch (err) {
                console.error("Failed to load file system module. Ensure 'fs' is available.", err);
                process.exit(1); // Exit if critical dependency fails.
            }

            // Obtain the main processing function from module 2.
            const dataProcessor = customRequire(2);

            // Define the input source. For /dev/stdin, 'utf8' encoding is standard.
            const inputFilePath = "/dev/stdin";
            let rawInputContent = '';

            try {
                // Read the content from the specified input path.
                rawInputContent = fileSystemAccess.readFileSync(inputFilePath, "utf8");
                if (!rawInputContent || rawInputContent.trim().length === 0) {
                    console.warn("Warning: Input from /dev/stdin was empty or contained only whitespace.");
                    // Optionally handle empty input differently, e.g., print "No" immediately.
                    // For now, proceed with empty string, which the processor might handle.
                }
            } catch (readError) {
                console.error(`Error reading input from ${inputFilePath}:`, readError);
                // Provide a default empty input or exit, depending on requirements.
                // For this clone, we'll exit on critical read failure.
                process.exit(1);
            }

            // Pass the raw input content to the data processor.
            dataProcessor(rawInputContent);

            // No direct exports from the entry module.
        },

        // Module 1: File System Access (Wrapper for Node.js 'fs' module)
        function(moduleObj, moduleExports, customRequire) {
            // This module simply re-exports the Node.js built-in 'fs' module.
            // It's a common pattern in bundled applications to manage external dependencies.
            moduleObj.exports = customRequire("fs");
            // A simple check to ensure 'fs' was loaded correctly.
            if (!moduleObj.exports || typeof moduleObj.exports.readFileSync !== 'function') {
                console.error("Critical: 'fs' module not properly loaded or is missing readFileSync.");
            }
        },

        // Module 2: High-Level Input Processing Orchestrator
        // This module takes the raw string input, parses it, and invokes the core logic.
        function(moduleObj, moduleExports, customRequire) {
            "use strict";

            // Load the custom InputBuffer class (Module 3) for input parsing.
            const InputBufferParser = customRequire(3);
            // Load the main pattern matching logic (Module 5).
            const MatrixPatternMatcher = customRequire(5);

            /**
             * The main function exported by this module.
             * It processes the raw input string.
             * @param {string} rawInputString - The complete input content as a string.
             */
            moduleObj.exports = function(rawInputString) {
                // Instantiate the input buffer with the provided string.
                // Add a guard clause for empty input.
                if (!rawInputString || rawInputString.trim().length === 0) {
                    console.log("No"); // If no input, no pattern can be found.
                    return;
                }
                const dataBuffer = new InputBufferParser(rawInputString);

                // Invoke the core matrix pattern matching algorithm with the parsed input.
                MatrixPatternMatcher(dataBuffer);

                // Optionally, clear the buffer after use, though it might be garbage collected.
                dataBuffer.resetBuffer();
            };
        },

        // Module 3: InputBufferParser Class
        // Manages tokenizing and reading values from the input string.
        function(moduleObj, moduleExports, customRequire) {
            "use strict";

            // Load the underlying SequentialDataStore (Queue-like) class (Module 4).
            const SequentialDataStore = customRequire(4);

            /**
             * @class InputBufferParser
             * Provides methods to parse and consume tokens from an input string.
             */
            moduleObj.exports = class InputBufferParser {
                /**
                 * @constructor
                 * @param {string} fullInputText - The raw string input to parse.
                 */
                constructor(fullInputText) {
                    // Tokenize the input string by whitespace, filtering out empty tokens.
                    const tokens = fullInputText.trim().split(/\s+/g).filter(token => token.length > 0);
                    // Initialize the internal sequential data store with these tokens.
                    this.tokenStore = new SequentialDataStore(tokens);
                }

                /**
                 * Reads and returns the next raw string token from the buffer.
                 * Includes a guard for buffer emptiness.
                 * @returns {string} The next token.
                 * @throws {Error} If no more tokens are available.
                 */
                readNextString() {
                    if (this.tokenStore.isEmpty()) {
                        throw new Error("Input buffer exhausted. No more string tokens available.");
                    }
                    return this.tokenStore.dequeue();
                }

                /**
                 * Reads the next token and attempts to parse it as an integer.
                 * Includes robust error checking for parsing.
                 * @returns {number} The parsed integer value.
                 * @throws {Error} If no more tokens or if parsing fails.
                 */
                readNextInteger() {
                    const stringValue = this.readNextString(); // Uses existing string reader.
                    const parsedValue = parseInt(stringValue, 10);

                    // Validate if parseInt returned a valid number.
                    if (isNaN(parsedValue)) {
                        throw new Error(`Failed to parse "${stringValue}" as an integer.`);
                    }
                    return parsedValue;
                }

                /**
                 * Reads the next token and attempts to parse it as a floating-point number.
                 * Added for extended functionality, though not strictly used in original.
                 * @returns {number} The parsed float value.
                 * @throws {Error} If no more tokens or if parsing fails.
                 */
                readNextFloat() {
                    const stringValue = this.readNextString();
                    const parsedValue = parseFloat(stringValue);

                    if (isNaN(parsedValue)) {
                        throw new Error(`Failed to parse "${stringValue}" as a floating-point number.`);
                    }
                    return parsedValue;
                }

                /**
                 * Resets the internal token store, clearing all items and index.
                 * This method was named 'fin' in the original, now more descriptive.
                 */
                resetBuffer() {
                    this.tokenStore.clearAll();
                }
            };
        },

        // Module 4: SequentialDataStore Class (Queue-like structure)
        // A generic queue implementation for managing sequential data.
        function(moduleObj, moduleExports, customRequire) {
            "use strict";

            /**
             * @class SequentialDataStore
             * Implements a basic queue-like data structure for sequential access.
             */
            moduleObj.exports = class SequentialDataStore {
                /**
                 * @constructor
                 * @param {Array<any>} initialItems - An optional array of items to pre-populate the store.
                 */
                constructor(initialItems = []) {
                    // Initialize the internal array and pointers.
                    this.storage = Array.isArray(initialItems) ? [...initialItems] : []; // Ensure a copy for safety.
                    this.headIndex = 0; // Points to the next item to be dequeued.
                    this.currentSize = this.storage.length; // Current number of available items.
                }

                /**
                 * Adds an item to the end of the store.
                 * This method was 'enq' in the original, but it's unused by InputBufferParser.
                 * Keeping it for demonstration of "new fragments added" and "updated" functionality,
                 * but it could be deleted if strict adherence to usage is followed.
                 * @param {any} item - The item to add.
                 */
                enqueue(item) {
                    this.storage.push(item);
                    this.currentSize++;
                    // Optionally, could add a debug log here.
                    // console.log(`Enqueued item: ${item}. New size: ${this.currentSize}`);
                }

                /**
                 * Removes and returns the item at the front of the store.
                 * Includes a guard clause for an empty store.
                 * @returns {any} The item removed from the front.
                 * @throws {Error} If the store is empty.
                 */
                dequeue() {
                    if (this.isEmpty()) {
                        throw new Error("Attempted to dequeue from an empty SequentialDataStore.");
                    }
                    const retrievedItem = this.storage[this.headIndex];
                    this.headIndex++;
                    this.currentSize--;

                    // Optimization: If the buffer is mostly consumed, slice to reclaim memory.
                    // This is a new structural addition to improve performance for very large inputs.
                    const CONSUMED_THRESHOLD = 0.75;
                    const RECLAIM_SIZE_THRESHOLD = 1000; // Only reclaim if enough items exist.
                    if (this.headIndex > this.storage.length * CONSUMED_THRESHOLD && this.storage.length > RECLAIM_SIZE_THRESHOLD) {
                        this.storage = this.storage.slice(this.headIndex);
                        this.headIndex = 0; // Reset head index after slicing.
                    }

                    return retrievedItem;
                }

                /**
                 * Returns the item at the front of the store without removing it.
                 * This is a new fragment, adding functionality not in the original.
                 * @returns {any} The item at the front.
                 * @throws {Error} If the store is empty.
                 */
                peek() {
                    if (this.isEmpty()) {
                        throw new Error("Attempted to peek into an empty SequentialDataStore.");
                    }
                    return this.storage[this.headIndex];
                }

                /**
                 * Checks if the data store is empty.
                 * @returns {boolean} True if empty, false otherwise.
                 */
                isEmpty() {
                    // Check both for robustness, though currentSize should reflect it.
                    return this.currentSize <= 0 || this.headIndex >= this.storage.length;
                }

                /**
                 * Clears all items from the store and resets its state.
                 * This method was 'clear' in the original, now 'clearAll'.
                 */
                clearAll() {
                    this.storage = [];
                    this.headIndex = 0;
                    this.currentSize = 0;
                }

                /**
                 * Returns the current number of items available in the store.
                 * New helper method for convenience.
                 * @returns {number} The count of items.
                 */
                getLength() {
                    return this.currentSize;
                }
            };
        },

        // Module 5: Core Matrix Pattern Matching Logic
        // This module contains the algorithm to find a smaller 2D pattern within a larger 2D matrix.
        function(moduleObj, moduleExports, customRequire) {
            "use strict";

            /**
             * Helper function to read a 2D matrix from the input buffer.
             * @param {InputBufferParser} bufferReader - The input buffer instance.
             * @param {number} rows - Number of rows for the matrix.
             * @param {number} cols - Number of columns for the matrix.
             * @returns {Array<Array<string>>} The parsed 2D matrix.
             * @throws {Error} If input is malformed or buffer is exhausted.
             */
            function readMatrixFromInput(bufferReader, rows, cols) {
                if (rows <= 0 || cols <= 0) {
                    throw new Error("Matrix dimensions must be positive.");
                }
                // Pre-allocate array for efficiency.
                const matrix = Array.from({ length: rows });
                for (let rIdx = 0; rIdx < rows; rIdx++) {
                    const rowString = bufferReader.readNextString(); // Reads entire row as one string.
                    if (rowString.length !== cols) {
                        throw new Error(`Row ${rIdx} has unexpected length. Expected ${cols}, got ${rowString.length}.`);
                    }
                    // Populate the row character by character.
                    matrix[rIdx] = Array.from(rowString); // Convert string to array of characters.
                }
                return matrix;
            }

            /**
             * Helper function to compare a sub-matrix of the main grid with the pattern.
             * @param {Array<Array<string>>} mainGrid - The larger matrix.
             * @param {number} startRow - Starting row index in mainGrid.
             * @param {number} startCol - Starting column index in mainGrid.
             * @param {Array<Array<string>>} patternGrid - The smaller pattern matrix.
             * @param {number} patternSize - The dimension of the square pattern (patternSize x patternSize).
             * @returns {boolean} True if the sub-matrix matches the pattern, false otherwise.
             */
            function compareSubMatrixWithPattern(mainGrid, startRow, startCol, patternGrid, patternSize) {
                // Loop through each element of the pattern grid.
                for (let pRow = 0; pRow < patternSize; pRow++) {
                    for (let pCol = 0; pCol < patternSize; pCol++) {
                        // Check if the current character in the pattern matches the corresponding
                        // character in the main grid's sub-matrix.
                        if (patternGrid[pRow][pCol] !== mainGrid[startRow + pRow][startCol + pCol]) {
                            return false; // Mismatch found, no need to check further.
                        }
                    }
                }
                return true; // All characters matched.
            }


            /**
             * The main pattern matching function exported by this module.
             * @param {InputBufferParser} inputSource - An instance of the InputBufferParser.
             */
            moduleObj.exports = function(inputSource) {
                // Read the dimensions for the main grid (N x N).
                const mainGridDimension = inputSource.readNextInteger();
                // Read the dimensions for the pattern grid (M x M).
                const patternDimension = inputSource.readNextInteger();

                // --- Input Validation and Guard Clauses ---
                if (mainGridDimension <= 0 || patternDimension <= 0) {
                    console.log("No"); // Dimensions must be positive.
                    return;
                }
                if (patternDimension > mainGridDimension) {
                    console.log("No"); // Pattern cannot be larger than the main grid.
                    return;
                }

                // Read the main grid from input.
                const mainMatrix = readMatrixFromInput(inputSource, mainGridDimension, mainGridDimension);
                // Read the pattern grid from input.
                const patternMatrix = readMatrixFromInput(inputSource, patternDimension, patternDimension);

                let patternFound = false; // Flag to track if a match is found.

                // Iterate through all possible top-left corners for the pattern in the main grid.
                // The outer loops determine the starting position (row_offset, col_offset) for the pattern.
                const maxOffset = mainGridDimension - patternDimension;
                for (let rowOffset = 0; rowOffset <= maxOffset; rowOffset++) {
                    for (let colOffset = 0; colOffset <= maxOffset; colOffset++) {
                        // Check if the current sub-matrix matches the pattern.
                        if (compareSubMatrixWithPattern(mainMatrix, rowOffset, colOffset, patternMatrix, patternDimension)) {
                            patternFound = true; // A match is found!
                            break; // Exit the inner loop immediately.
                        }
                    }
                    if (patternFound) {
                        break; // Exit the outer loop immediately if a match was found.
                    }
                }

                // Output the result based on whether the pattern was found.
                if (patternFound) {
                    console.log("Yes");
                } else {
                    console.log("No");
                }
            };
        }
    ]
);