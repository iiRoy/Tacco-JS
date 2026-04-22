const initializeModuleSystem = function(allModuleDefinitions) {
    // This object serves as a cache for loaded modules, preventing redundant execution.
    const loadedModuleCache = {};

    /**
     * Custom module loader function, mimicking a simplified CommonJS/Webpack require.
     * @param {number} requestedModuleId - The unique identifier of the module to load.
     * @returns {object} The exports object of the loaded module.
     */
    function retrieveAndLoadModule(requestedModuleId) {
        // If the module is already in the cache, return its exports immediately.
        if (loadedModuleCache[requestedModuleId]) {
            return loadedModuleCache[requestedModuleId].exports;
        }

        // If not cached, create a new module entry in the cache.
        const currentModuleInstance = loadedModuleCache[requestedModuleId] = {
            uniqueId: requestedModuleId, // The identifier of this module
            isFullyLoaded: false,        // Flag indicating if the module's code has been executed
            exports: {}                  // The object that will hold the module's exports
        };

        // Execute the module's definition function.
        // The 'this' context is set to the exports object, and it receives
        // the module instance, its exports, and the custom require function itself.
        allModuleDefinitions[requestedModuleId].call(
            currentModuleInstance.exports,
            currentModuleInstance,
            currentModuleInstance.exports,
            retrieveAndLoadModule
        );

        // Mark the module as fully loaded after its definition function has run.
        currentModuleInstance.isFullyLoaded = true;
        return currentModuleInstance.exports;
    }

    // --- Utility functions and properties attached to the custom module loader ---

    // Store all module definitions for potential introspection (though not used in this application).
    retrieveAndLoadModule.allModuleSources = allModuleDefinitions;
    // Store the cache for loaded modules.
    retrieveAndLoadModule.moduleRegistry = loadedModuleCache;

    /**
     * Defines an enumerable getter property on an object, ensuring it's only defined once.
     * @param {object} targetObject - The object on which to define the property.
     * @param {string} propertyName - The name of the property to define.
     * @param {Function} getterFunction - The function to call when the property is accessed.
     */
    retrieveAndLoadModule.addExportGetter = function(targetObject, propertyName, getterFunction) {
        // Check if the property already exists to avoid re-defining.
        if (!retrieveAndLoadModule.objectHasProperty(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make the property enumerable (visible in for...in loops)
                get: getterFunction // The getter function for the property
            });
        }
    };

    /**
     * Marks an exports object as an ES Module, adding __esModule and Symbol.toStringTag properties.
     * @param {object} exportsContainer - The exports object to mark.
     */
    retrieveAndLoadModule.declareEsModule = function(exportsContainer) {
        // If Symbol and Symbol.toStringTag are available, define it for better module identification.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(exportsContainer, Symbol.toStringTag, {
                value: "Module" // Standard ES Module tag
            });
        }
        // Define the __esModule flag, a common convention for ES Modules.
        Object.defineProperty(exportsContainer, "__esModule", {
            value: true // Indicate this is an ES Module
        });
    };

    /**
     * Handles interoperability between CommonJS and ES Modules, creating a namespace object.
     * This function is complex and covers several scenarios based on the 'flags' parameter.
     * @param {any} sourceModuleOrId - The module ID or the module's exports object.
     * @param {number} interopFlags - Bitmask flags indicating how to handle the module.
     * @returns {object} A namespace object representing the module's exports.
     */
    retrieveAndLoadModule.createModuleNamespace = function(sourceModuleOrId, interopFlags) {
        let processedModule = sourceModuleOrId; // Start with the input module/ID

        // Flag 1: If set (interopFlags is odd), require the module first.
        if (interopFlags % 2 !== 0) { // Equivalent to (interopFlags & 1)
            processedModule = retrieveAndLoadModule(sourceModuleOrId);
        }

        // Guard: If processedModule is null/undefined, return an empty object or throw.
        // For this clone, we'll proceed as the original code would, potentially leading to errors later.

        // Flag 8: If set (4th bit is 1), the module is already a namespace, return as is.
        if ((interopFlags >> 3) % 2 !== 0) { // Equivalent to (interopFlags & 8)
            return processedModule;
        }

        // Flag 4: If set (3rd bit is 1), and it's an object and already an ES Module, return as is.
        if (((interopFlags >> 2) % 2 !== 0) && typeof processedModule === "object" && processedModule && processedModule.__esModule) {
            return processedModule;
        }

        // Create a new empty object for the namespace.
        const newNamespaceObject = Object.create(null);
        // Mark it as an ES Module.
        retrieveAndLoadModule.declareEsModule(newNamespaceObject);

        // Define a 'default' export pointing to the processed module.
        Object.defineProperty(newNamespaceObject, "default", {
            enumerable: true,
            value: processedModule
        });

        // Flag 2: If set (2nd bit is 1) and the module is not a string, copy all its properties to the namespace.
        if (((interopFlags >> 1) % 2 !== 0) && typeof processedModule !== "string") { // Equivalent to (interopFlags & 2)
            // Iterate over properties of the processed module.
            for (const exportKey in processedModule) {
                // Use a closure to capture the current key for the getter function.
                const valueGetter = (currentKey) => {
                    return processedModule[currentKey];
                };
                retrieveAndLoadModule.addExportGetter(newNamespaceObject, exportKey, valueGetter.bind(null, exportKey));
            }
        }
        return newNamespaceObject;
    };

    /**
     * Creates a getter function for a module's default export, or the module itself if no default.
     * @param {object} moduleObject - The module's exports object.
     * @returns {Function} A function that returns the default export.
     */
    retrieveAndLoadModule.createDefaultExportGetter = function(moduleObject) {
        let finalExportGetter;

        // Determine the appropriate getter based on whether the module is an ES module with a 'default' export.
        if (!moduleObject || typeof moduleObject !== 'object' || !moduleObject.__esModule) {
            // If not an ES module or invalid, return the module object itself.
            finalExportGetter = function() {
                return moduleObject;
            };
        } else {
            // If it's an ES module, return its 'default' property.
            finalExportGetter = function() {
                return moduleObject.default;
            };
        }

        // Add an 'a' property to the getter function itself, pointing to itself.
        // This is a webpack specific optimization/convention for easy access to the getter.
        retrieveAndLoadModule.addExportGetter(finalExportGetter, "a", finalExportGetter);
        return finalExportGetter;
    };

    /**
     * Checks if an object has a specific property directly (not inherited).
     * @param {object} targetObject - The object to check.
     * @param {string} propertyName - The name of the property.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    retrieveAndLoadModule.objectHasProperty = function(targetObject, propertyName) {
        // Use Object.prototype.hasOwnProperty.call for robust checking, especially with potentially nullish objects.
        return Object.prototype.hasOwnProperty.call(targetObject || {}, propertyName);
    };

    // Public path for assets (empty string in this context, typical for webpack).
    retrieveAndLoadModule.assetPublicPath = "";

    // Set the entry point module ID and initiate the loading process.
    // The entry point is module with ID 0 in the provided array.
    retrieveAndLoadModule.entryModuleId = 0;
    return retrieveAndLoadModule(retrieveAndLoadModule.entryModuleId);
}([
    // --- Module 0: Application Entry Point ---
    function(entryModule, entryExports, localModuleLoader) {
        // Define constants for input source and encoding for clarity.
        const standardInputSource = "/dev/stdin";
        const inputEncodingFormat = "UTF-8";

        try {
            // Load the 'fs' (file system) module using the local module loader.
            const fileSystemModule = localModuleLoader(2);
            // Read the raw input data from stdin synchronously with specified encoding.
            const rawInputData = fileSystemModule.readFileSync(standardInputSource, inputEncodingFormat);

            // Load the main processing logic module.
            const gridProcessor = localModuleLoader(1);
            // Execute the main processing logic function with the raw input data.
            gridProcessor(rawInputData);
        } catch (error) {
            // Catch and log any errors encountered during file reading or processing.
            console.error("An error occurred during input processing:", error.message);
            // In a production environment, you might want to exit with a non-zero status code.
            // process.exit(1);
        }
    },

    // --- Module 1: Core Grid Processing Logic ---
    function(processingModule, processingExports) {
        /**
         * Safely extracts a fixed number of elements from an array-like iterable.
         * This function mimics Babel's _slicedToArray helper, providing robustness.
         * @param {Array|Iterable|null|undefined} sourceIterable - The array or iterable to destructure.
         * @param {number} [expectedCount] - The maximum number of elements to extract.
         * @returns {Array} An array containing the extracted elements.
         * @throws {TypeError} If the input is not iterable and not an array.
         */
        function safelyDestructureArray(sourceIterable, expectedCount) {
            // Early exit if the source is already an array.
            if (Array.isArray(sourceIterable)) {
                return sourceIterable;
            }

            // Guard clause: If the source is null or undefined, return an empty array and log a warning.
            if (sourceIterable === null || typeof sourceIterable === 'undefined') {
                console.warn("Attempted to destructure a null or undefined source. Returning empty array.");
                return [];
            }

            // Check if the source is an iterable (has a Symbol.iterator method).
            if (typeof Symbol !== "undefined" && Symbol.iterator in Object(sourceIterable)) {
                let extractedElements = [];
                let iterationComplete = false;
                let encounteredError = false;
                let currentIterator; // Will hold the iterator object or the error

                try {
                    // Get the iterator for the source iterable.
                    currentIterator = sourceIterable[Symbol.iterator]();
                    let iterationResult;

                    // Loop through the iterator until 'done' is true or 'expectedCount' elements are collected.
                    while (!(iterationComplete = (iterationResult = currentIterator.next()).done)) {
                        extractedElements.push(iterationResult.value);
                        // If expectedCount is provided, stop once enough elements are collected.
                        if (expectedCount && extractedElements.length === expectedCount) {
                            iterationComplete = true; // Mark as complete to break the loop
                            break;
                        }
                    }
                } catch (iterationError) {
                    encounteredError = true;
                    currentIterator = iterationError; // Store the error to re-throw later.
                } finally {
                    // Ensure the iterator's 'return' method is called if it exists and wasn't naturally completed.
                    if (!iterationComplete && currentIterator && typeof currentIterator.return === 'function') {
                        try {
                            currentIterator.return();
                        } catch (returnError) {
                            // Log any error during iterator cleanup, but don't override the original error.
                            console.error("Error during iterator cleanup:", returnError);
                        }
                    }
                    // If an error occurred during iteration, re-throw it.
                    if (encounteredError) {
                        throw currentIterator;
                    }
                }
                return extractedElements;
            }

            // If not an array and not iterable, throw a TypeError.
            throw new TypeError("Invalid attempt to destructure a non-iterable instance.");
        }

        /**
         * Parses a string containing two space-separated numbers into an array representing rows and columns.
         * Includes basic validation for positive integer dimensions.
         * @param {string} dimensionString - The string to parse (e.g., "5 10").
         * @returns {number[]} An array [rows, columns]. Returns [0, 0] for invalid input.
         */
        const parseGridDimensions = (dimensionString) => {
            const parts = dimensionString.split(' ');
            // Use parseInt with radix 10 for robust number conversion.
            const rows = parseInt(parts[0], 10);
            const cols = parseInt(parts[1], 10);

            // Basic validation: check for NaN and ensure dimensions are positive.
            if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1) {
                console.error(`Invalid grid dimensions detected: "${dimensionString}". Expected two positive integers.`);
                return [0, 0]; // Return invalid dimensions to trigger early exit in main logic.
            }
            return [rows, cols];
        };

        // The main function exported by this module, which processes the input text data.
        processingExports.exports = function(incomingTextData) {
            // Split the input text into individual lines based on newline characters.
            const allInputLines = incomingTextData.split('\n');

            // Guard clause: Ensure we have enough lines for grid dimensions and sequence values.
            if (allInputLines.length < 3) {
                console.error("Insufficient input data. Expected at least 3 lines for dimensions and fill sequence.");
                return; // Exit early if input is malformed.
            }

            // Extract grid dimensions (rows and columns) from the first line using our helper.
            const [gridRowsCount, gridColumnsCount] = safelyDestructureArray(
                parseGridDimensions(allInputLines[0]), 2
            );

            // Guard clause: If dimensions are invalid (e.g., [0,0] from parseGridDimensions), stop processing.
            if (gridRowsCount === 0 || gridColumnsCount === 0) {
                console.error("Grid dimensions are invalid or zero after parsing. Cannot proceed with grid generation.");
                return;
            }

            // The original code had a line (Number(e[1])) that consumed the second line but did nothing with its value.
            // This is intentionally deleted as a non-essential statement in a Type III clone.
            // const ignoredSecondLineValue = Number(allInputLines[1]); // This line is not needed and removed.

            // Parse the sequence of fill values from the third line.
            // Using parseInt with radix 10 for explicit and safe number conversion.
            const fillValueSequence = allInputLines[2].split(' ').map(val => parseInt(val, 10));

            // Initialize the 2D grid (matrix) with zeros.
            // Using Array.from for a more modern and concise array initialization.
            const outputGridMatrix = Array.from({
                length: gridRowsCount
            }, () => new Array(gridColumnsCount).fill(0));

            // Variables to track the current fill value from the sequence and its progress.
            let currentSequenceElementPointer = 0; // Index for fillValueSequence array.
            let currentElementFillProgressCount = 0; // How many cells have been filled with the current value.

            // The actual value to place in the grid (1-indexed based on sequence element pointer).
            let valueToPlace = currentSequenceElementPointer + 1;

            // Iterate through each row of the grid to fill it.
            for (let rowIndex = 0; rowIndex < gridRowsCount; rowIndex++) {
                const isEvenRow = (rowIndex % 2 === 0); // Determine if it's an even-indexed row (0, 2, 4...).

                // Guard clause: Check if we have run out of fill sequence values.
                if (currentSequenceElementPointer >= fillValueSequence.length) {
                    // If exhausted, the remaining cells will remain 0 (from initialization),
                    // but we log a warning for debugging.
                    console.warn(`Fill sequence exhausted at row ${rowIndex}. Remaining cells will default to 0.`);
                    break; // No more values to place, so we can stop processing further rows.
                }

                // Fill cells based on row parity: left-to-right for even rows, right-to-left for odd rows.
                if (isEvenRow) {
                    // Loop from left to right for even rows.
                    for (let colIndex = 0; colIndex < gridColumnsCount; colIndex++) {
                        outputGridMatrix[rowIndex][colIndex] = valueToPlace;
                        currentElementFillProgressCount++;

                        // Check if the current fill value's quota is met.
                        if (currentElementFillProgressCount >= fillValueSequence[currentSequenceElementPointer]) {
                            currentElementFillProgressCount = 0; // Reset count for the next value.
                            currentSequenceElementPointer++; // Move to the next fill value in the sequence.
                            valueToPlace = currentSequenceElementPointer + 1; // Update the value to place.

                            // Additional guard: If sequence exhausted after advancing, set valueToPlace to 0.
                            if (currentSequenceElementPointer >= fillValueSequence.length) {
                                valueToPlace = 0; // Ensures remaining cells are explicitly filled with 0 if sequence runs out mid-row.
                            }
                        }
                    }
                } else {
                    // Loop from right to left for odd rows.
                    for (let colIndex = gridColumnsCount - 1; colIndex >= 0; colIndex--) {
                        outputGridMatrix[rowIndex][colIndex] = valueToPlace;
                        currentElementFillProgressCount++;

                        // Check if the current fill value's quota is met.
                        if (currentElementFillProgressCount >= fillValueSequence[currentSequenceElementPointer]) {
                            currentElementFillProgressCount = 0; // Reset count.
                            currentSequenceElementPointer++; // Move to the next fill value.
                            valueToPlace = currentSequenceElementPointer + 1; // Update the value.

                            // Additional guard: If sequence exhausted after advancing.
                            if (currentSequenceElementPointer >= fillValueSequence.length) {
                                valueToPlace = 0;
                            }
                        }
                    }
                }
                // Output the current row to standard output, with elements joined by spaces.
                // Using process.stdout.write for a slight variation from console.log.
                process.stdout.write(outputGridMatrix[rowIndex].join(' ') + '\n');
            }
        };
    },

    // --- Module 2: Node.js File System Module ---
    function(fsModuleInstance, fsExportsObject) {
        // Export the native Node.js 'fs' (file system) module.
        // Using 'node:fs' prefix for clarity and modern Node.js practice.
        fsExportsObject.exports = require('node:fs');
    }
]);