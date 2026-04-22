const initializeModuleSystem = function(moduleDefinitions) {
    // A cache to store references to modules that have already been loaded.
    const loadedModulesCache = {};

    /**
     * Custom `require` function for the bundled modules, mimicking Webpack's internal mechanism.
     * When a module is requested, this function attempts to retrieve it from the cache.
     * If not found, it initializes the module, executes its code, and stores its exports.
     *
     * @param {number} moduleId - The unique identifier of the module to resolve.
     * @returns {object} The exports object of the requested module.
     */
    function resolveModule(moduleId) {
        // If the module is already in our cache, return its exports immediately.
        if (loadedModulesCache[moduleId]) {
            return loadedModulesCache[moduleId].exports;
        }

        // If the module is not in cache, create a new entry for it.
        // This entry tracks its ID, loading status, and its exports object.
        const moduleEntry = loadedModulesCache[moduleId] = {
            id: moduleId,
            isLoaded: false, // Flag to indicate if the module's code has been executed
            exports: {}      // The object that module code will populate with its exports
        };

        // Execute the module's definition function.
        // The `call` method sets `this` to `moduleEntry.exports` (though not explicitly used in original modules),
        // and passes the module entry, its exports, and the `resolveModule` function itself.
        moduleDefinitions[moduleId].call(
            moduleEntry.exports, // 'this' context (not commonly used for `module.exports` but part of signature)
            moduleEntry,         // The module object (e.g., to access module.id, module.exports)
            moduleEntry.exports, // The exports object (e.g., to assign properties to)
            resolveModule        // The local `require` function, allowing modules to import others
        );

        // Mark the module as fully loaded after its definition function has executed.
        moduleEntry.isLoaded = true;
        return moduleEntry.exports;
    }

    // Attach various utility functions and properties to the `resolveModule` function,
    // mirroring Webpack's internal structure for advanced features and compatibility.

    // `moduleMap`: A reference to the original array of module definition functions.
    resolveModule.moduleMap = moduleDefinitions;

    // `cacheReference`: A direct reference to the `loadedModulesCache` object.
    resolveModule.cacheReference = loadedModulesCache;

    /**
     * Defines a getter property on an object, making it enumerable.
     * This is typically used for defining named exports in ES modules.
     * @param {object} targetObject - The object on which to define the property.
     * @param {string} propertyName - The name of the property to define.
     * @param {function} getterFunction - The function that returns the property's value.
     */
    resolveModule.defineExport = function(targetObject, propertyName, getterFunction) {
        // Only define the property if it doesn't already exist on the target object.
        // This prevents accidental overwrites or redefinitions.
        if (!resolveModule.hasOwnProp(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make the property visible during enumeration (e.g., `for...in`)
                get: getterFunction // The function to call when the property is accessed
            });
        }
    };

    /**
     * Marks a given module's exports object as an ES Module.
     * This adds the `__esModule` flag and potentially sets `Symbol.toStringTag`.
     * @param {object} targetModule - The exports object of the module to mark.
     */
    resolveModule.markAsESModule = function(targetModule) {
        // If `Symbol.toStringTag` is supported, set it for better object identification.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(targetModule, Symbol.toStringTag, { value: 'Module' });
        }
        // Set the `__esModule` flag, a common convention for ES module identification.
        Object.defineProperty(targetModule, '__esModule', { value: true });
    };

    /**
     * Handles interoperability between CommonJS and ES Modules, especially for default exports.
     * This function can perform various transformations based on the provided flags.
     *
     * @param {any} moduleRef - The module reference (either a module ID or an already resolved module).
     * @param {number} flags - A bitmask indicating various processing options.
     * @returns {object} The processed module exports object.
     */
    resolveModule.interopRequireDefault = function(moduleRef, flags) {
        // Flag 1: If set, `moduleRef` is an ID, so resolve it first.
        if (flags & 1) moduleRef = resolveModule(moduleRef);
        // Flag 8: If set, return the module reference directly without further processing.
        if (flags & 8) return moduleRef;
        // Flag 4: If set, and `moduleRef` is an object and already marked as an ES module, return it as is.
        if (flags & 4 && typeof moduleRef === 'object' && moduleRef && moduleRef.__esModule) return moduleRef;

        // If none of the above, create a new namespace object for the module.
        const newNamespace = Object.create(null);
        resolveModule.markAsESModule(newNamespace); // Mark it as an ES module.
        // Define a 'default' export pointing to the original `moduleRef`.
        Object.defineProperty(newNamespace, 'default', { enumerable: true, value: moduleRef });

        // Flag 2: If set and `moduleRef` is not a string, copy all its enumerable properties
        // as getters to the new namespace (mimicking named exports).
        if (flags & 2 && typeof moduleRef !== 'string') {
            for (const propName in moduleRef) {
                // Ensure the property is an own property, not inherited.
                if (resolveModule.hasOwnProp(moduleRef, propName)) {
                    // Define each property as a getter, ensuring lazy evaluation.
                    resolveModule.defineExport(newNamespace, propName, (() => moduleRef[propName]));
                }
            }
        }
        return newNamespace;
    };

    /**
     * Creates a getter function for a module's main export, typically used for the `a` property
     * in Webpack's `t.n` helper. It handles both ES module default exports and CommonJS exports.
     * @param {object} moduleExports - The exports object of the module.
     * @returns {function} A getter function that returns the module's main export.
     */
    resolveModule.createNamespaceGetter = function(moduleExports) {
        // Determine the actual value to export: `moduleExports.default` for ES modules, else `moduleExports`.
        const mainExportGetter = moduleExports && moduleExports.__esModule ?
            () => moduleExports.default :
            () => moduleExports;
        // Define an 'a' property on the getter itself, making it self-referential.
        resolveModule.defineExport(mainExportGetter, 'a', mainExportGetter);
        return mainExportGetter;
    };

    /**
     * A polyfill/wrapper for `Object.prototype.hasOwnProperty.call`.
     * @param {object} obj - The object to check.
     * @param {string} prop - The property name.
     * @returns {boolean} True if the object has the specified own property.
     */
    resolveModule.hasOwnProp = function(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    // `publicPath`: An empty string, often used by Webpack for asset paths.
    resolveModule.publicPath = "";

    // Set the entry module ID and immediately resolve it to start the application.
    // The result of the entry module (if any) is returned by the entire bundle.
    return resolveModule(resolveModule.startupModuleIndex = 0);
};

// The array contains the definitions for all modules in the bundle.
// Each function in the array corresponds to a module.
initializeModuleSystem([
    // --- Module 0: Entry Point ---
    // This module is responsible for reading input from stdin and passing it to the main solver module.
    function(currentModule, exportsObject, requireFunction) {
        // First, get access to the Node.js 'fs' (file system) module via the custom `require`.
        const fileSystemUtility = requireFunction(2);

        // Read the entire content of standard input synchronously.
        // Using 'utf8' encoding ensures the input is read as a string.
        const rawInputContent = fileSystemUtility.readFileSync("/dev/stdin", "utf8");

        // Pass the raw input content to Module 1, which contains the main problem-solving logic.
        // Module 1's export is expected to be a function that accepts the input.
        requireFunction(1).solveProblem(rawInputContent);
    },

    // --- Module 1: Core Application Logic (Dynamic Programming Solver) ---
    // This module contains the algorithm to solve a pathfinding problem on a grid of numbers.
    function(moduleRef, exportsRef) {
        /**
         * A robust utility function to extract a fixed number of elements from an iterable
         * (like an array or a string), similar to what Babel's `_slicedToArray` helper does.
         * It handles arrays directly and attempts to iterate over other iterables.
         *
         * @param {Array|Iterable<any>} sourceIterable - The collection to extract elements from.
         * @param {number} [requiredCount] - The exact number of elements to extract.
         * @returns {Array<any>} An array containing the extracted elements.
         * @throws {TypeError} If the source is not iterable or if destructuring fails.
         */
        function extractElementsSafely(sourceIterable, requiredCount) {
            // Optimization: If it's already an array, we can slice it directly.
            if (Array.isArray(sourceIterable)) {
                return requiredCount ? sourceIterable.slice(0, requiredCount) : sourceIterable;
            }

            let collectedElements = [];
            let iterationFinished = false;
            let errorOccurred = false;
            let caughtError = undefined;
            let dataIterator = undefined;

            try {
                // Attempt to get an iterator from the source.
                if (sourceIterable && typeof sourceIterable[Symbol.iterator] === 'function') {
                    dataIterator = sourceIterable[Symbol.iterator]();
                } else {
                    // Fallback for array-like objects without Symbol.iterator (e.g., arguments object in old JS).
                    if (sourceIterable && typeof sourceIterable.length === 'number') {
                        for (let k = 0; k < Math.min(sourceIterable.length, requiredCount || Infinity); k++) {
                            collectedElements.push(sourceIterable[k]);
                        }
                        return collectedElements;
                    }
                    throw new TypeError("Provided input is not an iterable or an array-like structure.");
                }

                let nextIterationResult;
                // Iterate until done or until the required number of elements are collected.
                while (!(iterationFinished = (nextIterationResult = dataIterator.next()).done)) {
                    collectedElements.push(nextIterationResult.value);
                    if (requiredCount && collectedElements.length === requiredCount) {
                        break; // Stop early if we have enough elements.
                    }
                }
            } catch (err) {
                errorOccurred = true;
                caughtError = err;
            } finally {
                // Ensure the iterator's `return` method is called if available and iteration wasn't naturally finished.
                if (!iterationFinished && dataIterator && typeof dataIterator.return === 'function') {
                    try {
                        dataIterator.return();
                    } finally {
                        if (errorOccurred) throw caughtError; // Re-throw the original error if one occurred.
                    }
                } else if (errorOccurred) {
                    throw caughtError; // Re-throw if error occurred and no `return` or iteration finished.
                }
            }
            return collectedElements;
        }

        /**
         * The main function exported by this module, responsible for solving the problem.
         * It parses the input, constructs a DP table, and calculates the maximum path sum.
         *
         * @param {string} rawInputString - The complete input as a single string, typically from stdin.
         */
        exportsRef.solveProblem = function(rawInputString) {
            // Split the input string into an array of lines, filtering out any empty lines.
            const inputLines = rawInputString.split("\n").filter(line => line.trim() !== '');

            // --- Input Validation and Parsing ---
            if (inputLines.length === 0) {
                console.error("Application Error: No input data was provided for processing.");
                return; // Exit if no input is present.
            }

            // The first line should contain the total number of data rows. Parse it as an integer.
            const totalDataRows = parseInt(inputLines[0].trim(), 10);

            // Validate the parsed number of rows.
            if (isNaN(totalDataRows) || totalDataRows <= 0) {
                console.error("Application Error: The first line must specify a positive integer for the number of data rows.");
                return; // Exit if the count is invalid.
            }

            const problemDataSet = []; // Stores the parsed numerical data for each row.

            // Iterate from the second line (index 1) to parse each data row.
            for (let currentLineIdx = 0; currentLineIdx < totalDataRows; currentLineIdx++) {
                const actualInputLineIndex = currentLineIdx + 1; // Map to original line numbers
                if (actualInputLineIndex >= inputLines.length) {
                    console.error(`Input Error: Expected ${totalDataRows} data rows, but line ${actualInputLineIndex} is missing.`);
                    return;
                }

                // Split the current line by spaces and convert each part to a number.
                const numericalParts = inputLines[actualInputLineIndex].split(" ").map(Number);

                // Ensure each data row contains exactly 3 numbers.
                if (numericalParts.length !== 3) {
                    console.error(`Input Error: Data line ${actualInputLineIndex} must contain exactly 3 numerical values. Found ${numericalParts.length}.`);
                    return;
                }

                // Use the helper to safely extract the three values.
                const rowValues = extractElementsSafely(numericalParts, 3);
                const [val1, val2, val3] = rowValues;
                problemDataSet.push([val1, val2, val3]);
            }

            // --- Dynamic Programming Table Initialization ---
            // Create a 2D array (DP table) to store maximum path sums.
            // `dpTable[r][c]` will hold the max sum ending at row `r` by choosing option `c`.
            const dpTable = Array.from({ length: totalDataRows }, () => Array(3).fill(0));

            // Set the base case for the first row (row 0).
            // The max sum ending at row 0 is simply the values themselves from the input.
            if (totalDataRows > 0) {
                dpTable[0][0] = problemDataSet[0][0];
                dpTable[0][1] = problemDataSet[0][1];
                dpTable[0][2] = problemDataSet[0][2];
            } else {
                // If somehow `totalDataRows` became 0 despite earlier validation (edge case).
                console.log(0);
                return;
            }

            // --- DP Table Calculation ---
            // Iterate through the DP table, starting from the second row.
            // For each cell, calculate the maximum sum that can lead to it from the previous row,
            // considering the constraint that consecutive choices cannot be the same.
            for (let currentRow = 0; currentRow < totalDataRows - 1; currentRow++) {
                for (let prevChoice = 0; prevChoice < 3; prevChoice++) {
                    // If the current path value is 0 (and not the first row), it implies
                    // this path was not reachable or initialized to 0, and won't contribute
                    // to a maximum sum for positive inputs. Skip this path.
                    if (dpTable[currentRow][prevChoice] === 0 && currentRow > 0) {
                        continue;
                    }

                    const sumUpToPreviousRow = dpTable[currentRow][prevChoice];

                    // Now, consider all possible choices for the next row.
                    for (let nextChoice = 0; nextChoice < 3; nextChoice++) {
                        // Crucial constraint: The next choice must be different from the previous one.
                        if (nextChoice !== prevChoice) {
                            const valueAtNextPosition = problemDataSet[currentRow + 1][nextChoice];
                            const potentialNewTotalSum = sumUpToPreviousRow + valueAtNextPosition;

                            // If this new sum is greater than what's currently stored in the DP table
                            // for the next cell, update it.
                            if (potentialNewTotalSum > dpTable[currentRow + 1][nextChoice]) {
                                dpTable[currentRow + 1][nextChoice] = potentialNewTotalSum;
                            }
                        }
                    }
                }
            }

            // --- Result Extraction ---
            // After filling the entire DP table, the maximum path sum will be the largest value
            // in the last row of the `dpTable`.
            const sumsInLastRow = dpTable[totalDataRows - 1];
            const finalMaximumSum = Math.max(...sumsInLastRow);

            // Output the computed maximum sum to the console.
            console.log(finalMaximumSum);
        };
    },

    // --- Module 2: Node.js File System (fs) Module Wrapper ---
    // This module simply exports the native Node.js 'fs' module.
    function(moduleReference, exportsReference) {
        // Using 'node:fs' for explicit Node.js built-in module access, a modern best practice.
        moduleReference.exports = require('node:fs');
    }
]);