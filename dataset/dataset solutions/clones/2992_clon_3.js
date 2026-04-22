const moduleSystemBootstrap = (function(allModuleDefinitions) {
    // This object serves as a cache for modules that have already been loaded.
    // It prevents redundant execution and ensures module singletons.
    const moduleInstanceCache = {};

    /**
     * Core function to load and execute a module based on its unique identifier.
     * If the module is already in the cache, its exports are returned directly.
     * Otherwise, the module's definition function is executed, and its exports are cached.
     * @param {number} moduleIdentifier - The numerical ID of the module to load.
     * @returns {object} The exports object of the loaded module.
     */
    function retrieveAndExecuteModule(moduleIdentifier) {
        // Step 1: Check if the module is already in our cache.
        if (moduleInstanceCache[moduleIdentifier]) {
            return moduleInstanceCache[moduleIdentifier].exports;
        }

        // Step 2: If not cached, create a new module instance object.
        // This object will hold the module's ID and its exports.
        const currentModuleInstance = moduleInstanceCache[moduleIdentifier] = {
            id: moduleIdentifier,
            exports: {} // The object that will be populated with the module's exports.
        };

        // Step 3: Retrieve the module's definition function from the provided array.
        const moduleDefinitionFunction = allModuleDefinitions[moduleIdentifier];

        // Guard clause: Ensure a valid function exists for the requested module ID.
        if (typeof moduleDefinitionFunction !== 'function') {
            console.error(`Runtime Error: Module definition for ID ${moduleIdentifier} is not a valid function.`);
            // Return an empty exports object to prevent further errors, or throw for strictness.
            return currentModuleInstance.exports;
        }

        // Step 4: Execute the module's definition function.
        // It's called with `exports`, `module`, and the `require` function (this `retrieveAndExecuteModule` itself).
        // The `this` context for the module's code is set to its `exports` object.
        moduleDefinitionFunction.call(
            currentModuleInstance.exports, // `this` context and first argument (exports)
            currentModuleInstance.exports, // Second argument (module.exports)
            currentModuleInstance,         // Third argument (module object)
            retrieveAndExecuteModule       // Fourth argument (the `require` function)
        );

        // Step 5: Return the populated exports object.
        return currentModuleInstance.exports;
    }

    // --- Webpack-like Utility Functions for Module Interoperability ---

    // Expose the entire collection of module definitions for introspection (Type III addition).
    retrieveAndExecuteModule.moduleRegistry = allModuleDefinitions;

    // Expose the internal module cache (Type III addition).
    retrieveAndExecuteModule.cacheReference = moduleInstanceCache;

    /**
     * Defines a getter property on an object, often used for exposing module exports.
     * Ensures the property is enumerable.
     * @param {object} targetObject - The object on which to define the property.
     * @param {string} propertyName - The name of the property.
     * @param {function} propertyGetter - The function to call when the property is accessed.
     */
    retrieveAndExecuteModule.setupExportGetter = function(targetObject, propertyName, propertyGetter) {
        // Only define if the property does not already exist (Type III addition).
        if (!Object.prototype.hasOwnProperty.call(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make property visible in `for...in` loops and `Object.keys()`.
                get: propertyGetter // The function that returns the property's value.
            });
        }
    };

    /**
     * Marks an object as an ES Module, adding `__esModule` and `Symbol.toStringTag`.
     * This aids in interoperability and debugging.
     * @param {object} exportsContainer - The object to mark as an ES module.
     */
    retrieveAndExecuteModule.flagAsESModule = function(exportsContainer) {
        // Set `Symbol.toStringTag` for more descriptive `Object.prototype.toString` output.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsContainer, Symbol.toStringTag, { value: 'Module' });
        }
        // Common convention to mark an object as an ES module.
        Object.defineProperty(exportsContainer, '__esModule', { value: true });
    };

    /**
     * Handles interoperability for default exports, converting CommonJS-like modules
     * into objects that mimic ES module structure when needed.
     * @param {any} rawModuleValue - The value returned by a `require` call.
     * @param {number} conversionFlags - Bitmask flags to control conversion behavior.
     * @returns {any} The potentially wrapped or processed module value.
     */
    retrieveAndExecuteModule.interopConvertModule = function(rawModuleValue, conversionFlags) {
        // Flag 1: If set, `rawModuleValue` is actually a module ID, so load it first.
        if (conversionFlags & 1) rawModuleValue = retrieveAndExecuteModule(rawModuleValue);
        // Flag 8: If set, return the module value as is.
        if (conversionFlags & 8) return rawModuleValue;
        // Flag 4: If set, and it's an object already marked as `__esModule`, return as is.
        if (conversionFlags & 4 && typeof rawModuleValue === 'object' && rawModuleValue && rawModuleValue.__esModule) return rawModuleValue;

        // If none of the above, create a new object to act as an ES module wrapper.
        const esModuleWrapper = Object.create(null);
        retrieveAndExecuteModule.flagAsESModule(esModuleWrapper); // Mark it as an ES module.
        // Set the 'default' export to the original module value.
        Object.defineProperty(esModuleWrapper, 'default', { enumerable: true, value: rawModuleValue });

        // Flag 2: If set and the module isn't a string, copy all its properties to the wrapper.
        if (conversionFlags & 2 && typeof rawModuleValue !== 'string') {
            for (let propertyKey in rawModuleValue) {
                // Ensure the property is directly on the object, not from its prototype chain.
                if (Object.prototype.hasOwnProperty.call(rawModuleValue, propertyKey)) {
                    retrieveAndExecuteModule.setupExportGetter(
                        esModuleWrapper,
                        propertyKey,
                        // Create a closure to capture `propertyKey` correctly.
                        (function(keyToGet) {
                            return function() { return rawModuleValue[keyToGet]; };
                        }).bind(null, propertyKey)
                    );
                }
            }
        }
        return esModuleWrapper;
    };

    /**
     * Provides a helper function to get the actual exports from a module,
     * handling both CommonJS and ES module structures.
     * @param {object} rawModuleObject - The raw module object.
     * @returns {function} A getter function that returns the module's main export.
     */
    retrieveAndExecuteModule.getEffectiveExports = function(rawModuleObject) {
        // Determine whether to return the default export or the module itself.
        const effectiveExportGetter = (rawModuleObject && rawModuleObject.__esModule) ?
            function() { return rawModuleObject.default; } :
            function() { return rawModuleObject; };

        // Define a special 'a' property (a common convention) that points to this getter.
        retrieveAndExecuteModule.setupExportGetter(effectiveExportGetter, 'a', effectiveExportGetter);
        return effectiveExportGetter;
    };

    /**
     * Utility function for checking if an object has a direct own property.
     * @param {object} targetObj - The object to inspect.
     * @param {string} propName - The name of the property to check.
     * @returns {boolean} True if the object has the property directly, false otherwise.
     */
    retrieveAndExecuteModule.hasDirectProperty = function(targetObj, propName) {
        return Object.prototype.hasOwnProperty.call(targetObj, propName);
    };

    // The public path for loading chunk assets (often empty for single-bundle apps).
    retrieveAndExecuteModule.assetBasePath = "";

    // --- Application Entry Point ---
    // The module system starts by loading the designated startup module (ID 0 in this configuration).
    const applicationEntryModuleId = 0;
    retrieveAndExecuteModule(applicationEntryModuleId);

    // The IIFE itself does not return a value, as the startup module performs the main application logic.
})([ // Array containing all module definitions, indexed by their module IDs.

    // Module 0: The application's primary entry point.
    // It orchestrates reading input and calling the main processing logic.
    function(moduleExports, moduleContext, requireDependency) {
        // Load the 'fs' (File System) module, which is Module 2 in this bundle.
        const fileSystemUtil = requireDependency(2);
        // Read the entire content from standard input (`/dev/stdin`) as a UTF-8 string.
        const inputDataContent = fileSystemUtil.readFileSync("/dev/stdin", "UTF-8");

        // Load the main grid processing module, which is Module 1.
        const gridProcessorFunction = requireDependency(1);
        // Execute the grid processing function with the input data.
        gridProcessorFunction(inputDataContent);
    },

    // Module 1: Contains the core Breadth-First Search (BFS) algorithm
    // to calculate the maximum distance from '#' cells to any other reachable cell.
    function(moduleExports, moduleContext, requireDependency) {
        /*
         * This function takes a string representing a grid and computes the maximum
         * distance from any starting '#' character to any reachable '.' character.
         * This is typically solved using a multi-source Breadth-First Search.
         *
         * Input String Format:
         * - First line: "N M" (N = number of rows, M = number of columns).
         * - Subsequent N lines: Each line represents a row of the grid,
         *   composed of '#' (source) and '.' (empty) characters.
         */
        moduleExports.exports = function(rawInputString) {
            // Split the raw input string into an array of individual lines.
            const inputLinesArray = rawInputString.split('\n');

            // --- Input Validation and Parsing ---
            // Ensure there's at least one line for dimensions.
            if (inputLinesArray.length < 1 || !inputLinesArray[0]) {
                console.error("Error: Input data is empty or malformed; expected at least dimension line.");
                return;
            }

            // Parse the first line to extract grid dimensions (rows and columns).
            const dimensionTokens = inputLinesArray[0].split(' ');

            // Validate that dimension tokens are present.
            if (dimensionTokens.length < 2) {
                console.error("Error: Grid dimensions (N M) not found in the first line.");
                return;
            }

            const numberOfGridRows = Number(dimensionTokens[0]);
            const numberOfGridColumns = Number(dimensionTokens[1]);

            // Validate parsed dimensions. They must be positive integers.
            if (isNaN(numberOfGridRows) || isNaN(numberOfGridColumns) || numberOfGridRows <= 0 || numberOfGridColumns <= 0) {
                console.error(`Error: Invalid grid dimensions provided: "${dimensionTokens[0]} ${dimensionTokens[1]}". Expected positive integers.`);
                return;
            }

            // Validate that enough grid rows are provided based on the declared `numberOfGridRows`.
            if (inputLinesArray.length < numberOfGridRows + 1) {
                console.error(`Error: Incomplete grid data. Expected ${numberOfGridRows} rows, but only ${inputLinesArray.length - 1} were provided.`);
                return;
            }

            // --- BFS Data Structure Initialization ---
            // `bfsTraversalQueue`: Stores cells to be visited. Each element is an array: `[x_coordinate, y_coordinate, current_distance]`.
            const bfsTraversalQueue = [];
            // `cellVisitedStatus`: A 2D array (matrix) to keep track of which cells have been visited.
            // `false` means unvisited, `true` means visited. (Type III change: boolean flags).
            const cellVisitedStatus = Array(numberOfGridRows).fill(null).map(() => Array(numberOfGridColumns).fill(false));

            // `remainingCellsToVisit`: Counts the total number of non-source cells that need to be reached.
            let remainingCellsToVisit = numberOfGridRows * numberOfGridColumns;

            // Define character constants for clarity.
            const INITIAL_SOURCE_CHAR = '#';

            // --- Grid Parsing and Initial Queue Population ---
            for (let rowIndex = 0; rowIndex < numberOfGridRows; rowIndex++) {
                // Get the characters for the current grid row.
                // `.slice(0, numberOfGridColumns)` ensures we don't process extra characters if a line is too long (Type III addition).
                const currentRowCharacters = inputLinesArray[rowIndex + 1].split('').slice(0, numberOfGridColumns);

                // Validate individual row length.
                if (currentRowCharacters.length !== numberOfGridColumns) {
                    console.error(`Error: Row ${rowIndex + 1} has an incorrect number of columns. Expected ${numberOfGridColumns}, got ${currentRowCharacters.length}.`);
                    return;
                }

                for (let colIndex = 0; colIndex < numberOfGridColumns; colIndex++) {
                    // If the current cell is a source character ('#').
                    if (currentRowCharacters[colIndex] === INITIAL_SOURCE_CHAR) {
                        // Add it to the BFS queue with a distance of 0.
                        bfsTraversalQueue.push([colIndex, rowIndex, 0]);
                        // Mark it as visited immediately.
                        cellVisitedStatus[rowIndex][colIndex] = true;
                        // Decrement `remainingCellsToVisit` as source cells are 'visited' from start.
                        remainingCellsToVisit--;
                    }
                }
            }

            // Guard clause: If no source cells ('#') were found, the max distance is 0.
            if (bfsTraversalQueue.length === 0) {
                console.log(0);
                return;
            }

            // --- BFS Traversal Parameters ---
            // `deltaX` and `deltaY` arrays define the relative movements to adjacent cells (up, down, left, right).
            const deltaX = [0, 0, 1, -1];
            const deltaY = [1, -1, 0, 0];

            // Helper function to check if a given coordinate is within the grid boundaries (Type III addition).
            const isCoordinateValid = (x, y) =>
                x >= 0 && x < numberOfGridColumns && y >= 0 && y < numberOfGridRows;

            let highestDistanceAchieved = 0; // Tracks the maximum distance found during BFS.

            // --- Main BFS Loop ---
            // Continue as long as there are cells in the queue to process.
            while (bfsTraversalQueue.length > 0) {
                // Dequeue the next cell. Using array destructuring for clarity (Type III change).
                const [currentX, currentY, currentDistance] = bfsTraversalQueue.shift();

                // Update the highest distance found so far.
                if (currentDistance > highestDistanceAchieved) {
                    highestDistanceAchieved = currentDistance;
                }

                // Explore all four neighboring cells.
                for (let i = 0; i < 4; i++) {
                    const nextX = currentX + deltaX[i];
                    const nextY = currentY + deltaY[i];

                    // Check if the neighbor is within grid bounds AND has not been visited yet.
                    if (isCoordinateValid(nextX, nextY) && !cellVisitedStatus[nextY][nextX]) {
                        // Mark the neighbor as visited.
                        cellVisitedStatus[nextY][nextX] = true;
                        remainingCellsToVisit--; // Decrement the count of cells still needing to be reached.

                        // Enqueue the neighbor with an incremented distance.
                        bfsTraversalQueue.push([nextX, nextY, currentDistance + 1]);

                        // Optimization: If all reachable cells have been visited, the current distance
                        // (of the just-enqueued cell) is the maximum distance. We can exit early.
                        if (remainingCellsToVisit <= 0) {
                            console.log(currentDistance + 1); // The distance of the cell that completed the traversal.
                            return; // Exit the function immediately.
                        }
                    }
                }
            }

            // This line will only be reached if `remainingCellsToVisit` never reached 0
            // within the loop (e.g., if the grid was entirely '#' characters, or disconnected components).
            // In a fully connected grid where `remainingCellsToVisit` eventually hits 0,
            // the early `return` will always be triggered.
            // If the grid was all '#', `highestDistanceAchieved` would be 0, which is correct.
            console.log(highestDistanceAchieved);
        };
    },

    // Module 2: Provides the Node.js 'fs' (File System) module.
    function(moduleExports, moduleContext, requireDependency) {
        // Directly expose the built-in 'fs' module.
        moduleExports.exports = require("fs");
    }
]);