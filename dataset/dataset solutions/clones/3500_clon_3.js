// This file implements a simplified module loading system, akin to Webpack's runtime.
// It allows for bundling multiple JavaScript modules into a single executable file,
// managing dependencies, and providing compatibility features for different module formats.

module.exports = function(moduleDefinitions) {
    // A private cache to store modules that have already been loaded.
    // This ensures that each module is executed only once and its exports are
    // consistently returned upon subsequent requests.
    let loadedModuleCache = {};

    /**
     * The core module loading and resolution function. It acts as the internal 'require'
     * for all bundled modules, handling caching and execution.
     * @param {number} moduleIdToLoad - The unique numeric identifier of the module to load.
     * @returns {object} The exports object of the requested module.
     * @throws {Error} If the requested module ID is not found in the definitions.
     */
    function retrieveModule(moduleIdToLoad) {
        // First, check if the module is already in our cache.
        // If so, return its exports immediately to prevent re-execution.
        if (loadedModuleCache[moduleIdToLoad]) {
            return loadedModuleCache[moduleIdToLoad].exports;
        }

        // --- Type III Addition: Robustness and Validation ---
        // Guard clause: Ensure the requested module ID corresponds to an existing definition.
        if (moduleIdToLoad === null || moduleIdToLoad === undefined || !moduleDefinitions[moduleIdToLoad]) {
            console.error(`Runtime Error: Attempted to load an undefined or non-existent module with ID: '${moduleIdToLoad}'.`);
            throw new Error(`Module '${moduleIdToLoad}' is not registered in the bundle definitions.`);
        }

        // Create a new module object and store it in the cache *before* execution.
        // This is crucial for handling circular dependencies.
        // 'id': The module's identifier.
        // 'isInitialized': A flag indicating if the module's definition function has been run.
        // 'exports': The object that will hold the module's exported values.
        let newModuleInstance = loadedModuleCache[moduleIdToLoad] = {
            id: moduleIdToLoad,
            isInitialized: false,
            exports: {}
        };

        try {
            // Execute the module's definition function.
            // The `call` method sets `this` to `newModuleInstance.exports` (though not typically used by Webpack modules)
            // and passes three arguments:
            // 1. The module object itself (`newModuleInstance`).
            // 2. The module's exports object (`newModuleInstance.exports`).
            // 3. The `retrieveModule` function itself, allowing internal `require` calls.
            moduleDefinitions[moduleIdToLoad].call(
                newModuleInstance.exports,
                newModuleInstance,
                newModuleInstance.exports,
                retrieveModule
            );
            // Mark the module as fully initialized after successful execution.
            newModuleInstance.isInitialized = true;
        } catch (executionError) {
            // --- Type III Addition: Error Handling and Cleanup ---
            // If an error occurs during module execution, remove the module from the cache
            // to prevent returning a partially initialized or corrupted module.
            console.error(`Error initializing module '${moduleIdToLoad}':`, executionError.message);
            delete loadedModuleCache[moduleIdToLoad];
            throw executionError; // Re-throw the error to propagate it up the call stack.
        }

        // Return the exports object of the successfully loaded and initialized module.
        return newModuleInstance.exports;
    }

    // --- Helper properties and methods attached to the main module loader ---

    // Expose the complete set of module definitions. (Type II: Renamed from `t.m = r`)
    retrieveModule.allModuleDefinitions = moduleDefinitions;

    // Expose the module cache for introspection or advanced debugging. (Type II: Renamed from `t.c = e`)
    retrieveModule.internalCache = loadedModuleCache;

    /**
     * Defines an enumerable getter property on a target object.
     * This is primarily used for exposing module exports as properties.
     * @param {object} targetObj - The object on which to define the property.
     * @param {string} propName - The name of the property to define.
     * @param {function} getterFunc - The function that returns the property's value when accessed.
     */
    retrieveModule.defineExportProperty = function(targetObj, propName, getterFunc) {
        // --- Type III Addition: Compatibility Check ---
        // Fallback for environments that might not fully support Object.defineProperty,
        // though highly unlikely for Node.js.
        if (typeof Object.defineProperty !== 'function') {
            if (!retrieveModule.checkOwnProperty(targetObj, propName)) {
                targetObj[propName] = getterFunc(); // Assign directly if getter isn't possible.
            }
            return;
        }

        // Only define the property if it doesn't already exist on the target object.
        // (Type II: Rewritten `t.o(r, e) || ...` to explicit `if` and renamed `t.o` to `checkOwnProperty`)
        if (!retrieveModule.checkOwnProperty(targetObj, propName)) {
            Object.defineProperty(targetObj, propName, {
                enumerable: true, // Make the property visible during enumeration (e.g., `for...in`).
                get: getterFunc   // The function to call when the property is accessed.
            });
        }
    };

    /**
     * Flags a module's exports object as an ECMAScript Module (ESM).
     * This adds '__esModule: true' and potentially 'Symbol.toStringTag: "Module"'.
     * @param {object} moduleExportsObject - The exports object of the module.
     */
    retrieveModule.markAsEsModule = function(moduleExportsObject) {
        // --- Type III Addition: Intermediate variable for clarity ---
        const definePropertyFn = Object.defineProperty;

        // If 'Symbol' and 'Symbol.toStringTag' are available, set the toStringTag for better debugging/introspection.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            definePropertyFn(moduleExportsObject, Symbol.toStringTag, { value: 'Module' });
        }
        // Always set the '__esModule' flag, a common convention for bundlers to identify ES Modules.
        definePropertyFn(moduleExportsObject, '__esModule', { value: true });
    };

    /**
     * Creates a standardized namespace object for a module, handling different import scenarios
     * (e.g., CommonJS, ES Modules). It ensures consistent access to module exports.
     * @param {any} moduleInput - Can be a module ID or an already resolved module exports object.
     * @param {number} resolutionFlags - A bitmask indicating how to process `moduleInput`.
     * @returns {object} A namespace object representing the module's exports.
     */
    retrieveModule.createNamespaceObject = function(moduleInput, resolutionFlags) {
        let processedModule = moduleInput;

        // Flag 1: If set, `moduleInput` is a module ID, so load it using `retrieveModule`.
        if (resolutionFlags & 1) {
            processedModule = retrieveModule(moduleInput);
        }

        // Flag 8: If set, the module is already a namespace object or should be returned directly.
        if (resolutionFlags & 8) {
            return processedModule;
        }

        // Flag 4: If set, and it's an object already marked as an ESM, return it directly.
        if (resolutionFlags & 4 && typeof processedModule === 'object' && processedModule && processedModule.__esModule) {
            return processedModule;
        }

        // --- Type III Addition: Intermediate variable for new namespace ---
        // Create an empty object to serve as the new namespace.
        const namespaceHolder = Object.create(null);

        // Mark the new namespace as an ES Module.
        retrieveModule.markAsEsModule(namespaceHolder);

        // Define a 'default' export property on the namespace, pointing to the `processedModule`.
        Object.defineProperty(namespaceHolder, 'default', { enumerable: true, value: processedModule });

        // Flag 2: If set, and `processedModule` is not a primitive (like a string),
        // copy all its own enumerable properties as named exports to the namespace.
        if (resolutionFlags & 2 && typeof processedModule !== 'string') {
            for (let exportKey in processedModule) {
                // Ensure the property belongs directly to `processedModule` and isn't inherited.
                if (retrieveModule.checkOwnProperty(processedModule, exportKey)) {
                    // --- Type III Update: Direct closure instead of `bind` for getter ---
                    retrieveModule.defineExportProperty(namespaceHolder, exportKey, () => processedModule[exportKey]);
                }
            }
        }
        return namespaceHolder;
    };

    /**
     * A compatibility helper for non-ESM (e.g., CommonJS) imports. It provides a getter
     * that resolves to the module's default export or the entire module object.
     * @param {object} sourceModuleExports - The exports object of the source module.
     * @returns {function} A function that, when called, returns the module's resolved exports.
     */
    retrieveModule.getInteropModule = function(sourceModuleExports) {
        // --- Type III Addition: Input validation guard ---
        if (!sourceModuleExports) {
            console.warn("Interop helper received null/undefined source module exports. Returning empty getter.");
            return () => undefined; // Return a safe, empty getter.
        }

        let moduleExportResolver;
        // Determine if the source module is already an ES Module.
        if (sourceModuleExports && sourceModuleExports.__esModule) {
            moduleExportResolver = () => sourceModuleExports.default;
        } else {
            moduleExportResolver = () => sourceModuleExports;
        }

        // Define a property 'a' (a common convention in some bundlers) on the resolver function itself.
        // This effectively makes the resolver callable *and* allows access to its underlying result via 'a'.
        retrieveModule.defineExportProperty(moduleExportResolver, 'a', moduleExportResolver);
        return moduleExportResolver;
    };

    /**
     * Checks if an object has an own (non-inherited) property with the given key.
     * This is a robust way to check for property existence.
     * @param {object} targetObject - The object to inspect.
     * @param {string} propertyKey - The name of the property to check for.
     * @returns {boolean} True if the object has the property directly, false otherwise.
     */
    retrieveModule.checkOwnProperty = function(targetObject, propertyKey) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
    };

    // The base URL for public assets, often empty in Node.js environments.
    retrieveModule.publicAssetBase = "";

    // --- Type III Update: Separated entry point assignment and call ---
    // Set the application's entry point module ID.
    retrieveModule.entryModuleId = 0;
    // Load and execute the entry point module to start the application.
    return retrieveModule(retrieveModule.entryModuleId);
}([
    // --- Array of Module Definitions ---
    // Each function in this array represents a bundled module.
    // The index of the function in the array is its module ID.

    // Module 0: The primary entry point for the application.
    // It reads input from standard input, processes it, and prints the result.
    function(entryModule, entryModuleExports, entryModuleRequire) {
        // Import necessary dependencies using the internal `entryModuleRequire` function.
        const processInputAndCalculate = entryModuleRequire(1); // Our custom calculation logic.
        const nodeFileSystemModule = entryModuleRequire(2);     // Node.js 'fs' module for I/O.

        let inputContentBuffer;
        try {
            // --- Type III Addition: Robust error handling for file reading ---
            // Attempt to read the entire content from standard input (typically '/dev/stdin' on Unix-like systems).
            // Specify 'UTF-8' encoding to get a string directly.
            inputContentBuffer = nodeFileSystemModule.readFileSync("/dev/stdin", "UTF-8");
        } catch (fileReadError) {
            console.error(`File System Error: Could not read from /dev/stdin. Details: ${fileReadError.message}`);
            // If input cannot be read, the program cannot proceed. Re-throw to halt execution.
            throw fileReadError;
        }

        // --- Type III Addition: Input validation ---
        // Ensure that the read content is not empty or malformed before proceeding.
        if (!inputContentBuffer || typeof inputContentBuffer !== 'string' || inputContentBuffer.trim().length === 0) {
            console.warn("Warning: Received empty or invalid input from /dev/stdin. No processing will occur.");
            return; // Exit if there's no meaningful input.
        }

        // Split the raw input string into an array of lines.
        const arrayOfInputLines = inputContentBuffer.split("\n");

        // Pass the processed array of lines to the main calculation module.
        processInputAndCalculate(arrayOfInputLines);
    },

    // Module 1: Contains a specific iterative calculation logic.
    // This module expects an array of strings, parses the first line for two numbers,
    // and then performs a peculiar calculation based on those numbers.
    function(mathModule, mathModuleExports) {

        /**
         * A utility function to safely destructure an iterable (like an array) into an array
         * of a specified length. This helper mimics Babel's `_slicedToArray` behavior.
         * It handles native arrays, generic iterables, and throws a TypeError for invalid inputs.
         * @param {Iterable} sourceIterable - The iterable object to destructure.
         * @param {number} [desiredCount] - The optional number of elements to extract.
         * @returns {Array} An array containing the destructured elements.
         * @throws {TypeError} If the input is not iterable or cannot be destructured.
         */
        function safeDestructureIterable(sourceIterable, desiredCount) {
            // Helper 1: Try native array destructuring.
            // (Type III Addition: Separate helper for clarity)
            const attemptArrayCopy = (inputArray) => {
                if (Array.isArray(inputArray)) {
                    const result = Array.from(inputArray); // Create a shallow copy.
                    // If a specific count is desired and the array is shorter, pad with `undefined`.
                    if (desiredCount && result.length < desiredCount) {
                        while (result.length < desiredCount) result.push(undefined);
                    }
                    return result;
                }
                return null; // Not an array.
            };

            // Helper 2: Try iterable protocol destructuring.
            // (Type III Addition: Separate helper for clarity, re-structured loop)
            const attemptIterableExtraction = (iterableInput, limit) => {
                const collectedElements = [];
                let iterationCompleted = false;
                let iterationHadError = false;
                let capturedErrorValue = undefined;
                let currentIterator = null;

                try {
                    currentIterator = iterableInput[Symbol.iterator]();
                    let iteratorStep;
                    while (!(iterationCompleted = (iteratorStep = currentIterator.next()).done)) {
                        collectedElements.push(iteratorStep.value);
                        // Stop if we've collected enough elements, if a limit was specified.
                        if (limit && collectedElements.length === limit) {
                            break;
                        }
                    }
                } catch (err) {
                    iterationHadError = true;
                    capturedErrorValue = err;
                } finally {
                    // --- Type III Update: More explicit iterator closing logic ---
                    // Ensure the iterator's `return` method is called if it exists and
                    // the iteration didn't complete naturally (e.g., due to `break` or error).
                    if (!iterationCompleted && currentIterator && typeof currentIterator.return === 'function') {
                        try {
                            currentIterator.return();
                        } catch (finallyError) {
                            // If an error occurred in the primary iteration, preserve that error.
                            // Otherwise, propagate the error from `iterator.return()`.
                            if (!iterationHadError) {
                                throw finallyError;
                            }
                        }
                    }
                    if (iterationHadError) {
                        throw capturedErrorValue; // Re-throw the original iteration error.
                    }
                }
                return collectedElements;
            };

            let result = attemptArrayCopy(sourceIterable);
            if (result) return result;

            result = attemptIterableExtraction(sourceIterable, desiredCount);
            if (result) return result;

            // --- Type III Update: Custom error message ---
            // If neither method succeeded, the input is not a valid iterable for destructuring.
            throw new TypeError("Cannot destructure non-iterable or invalid instance. Expected an array or iterable.");
        }

        /**
         * Performs a specific, non-standard iterative calculation based on two numbers.
         * This algorithm initializes with the quotient and remainder of `numB / numA`,
         * and then applies a Euclidean-like algorithm to these derived values.
         * This faithfully replicates the original code's peculiar arithmetic logic.
         * @param {number} inputNumA - The first input number (used as divisor initially).
         * @param {number} inputNumB - The second input number (used as dividend initially).
         * @returns {number} The final calculated value from the iteration.
         */
        function performPeculiarCalculation(inputNumA, inputNumB) {
            // --- Type III Addition: Input validation and coercion ---
            let a = Number(inputNumA);
            let b = Number(inputNumB);

            if (isNaN(a) || isNaN(b) || !Number.isInteger(a) || !Number.isInteger(b)) {
                console.warn(`Calculation Warning: Non-integer or invalid numeric input detected (${inputNumA}, ${inputNumB}). Coercing to absolute integers.`);
                a = Math.abs(Math.floor(a));
                b = Math.abs(Math.floor(b));
            }

            // --- Type III Addition: Explicit handling for division by zero ---
            // The original code would produce `Infinity` or `NaN` for `Math.floor(b/a)`
            // and `NaN` for `b%a` if `a` is zero, then the loop `i > 0` (NaN > 0) would fail,
            // resulting in `NaN` being printed. We'll replicate this but with a warning.
            if (a === 0) {
                console.warn("Calculation Warning: Attempted division by zero for initial quotient/remainder. Result will be NaN.");
                return NaN;
            }

            // Initialize variables based on the original logic:
            // `currentDerivedQuotient` corresponds to `u` in the original code.
            // `currentDerivedRemainder` corresponds to `i` in the original code.
            let currentDerivedQuotient = Math.floor(b / a);
            let currentDerivedRemainder = b % a;

            // --- Type III Update: Rewritten loop structure and variable names ---
            // This loop applies a Euclidean-like algorithm to `currentDerivedQuotient` and `currentDerivedRemainder`.
            while (currentDerivedRemainder > 0) {
                let temporaryRemainderHolder = currentDerivedRemainder;
                currentDerivedRemainder = currentDerivedQuotient % currentDerivedRemainder;
                currentDerivedQuotient = temporaryRemainderHolder;
            }

            return currentDerivedQuotient;
        }

        // The main function exported by this module.
        // It processes an array of input lines (expects the first line to contain two numbers).
        mathModuleExports.default = function(allInputLines) {
            // --- Type III Addition: Input array validation ---
            if (!Array.isArray(allInputLines) || allInputLines.length === 0 || typeof allInputLines[0] !== 'string') {
                console.error("Input Error: Expected an array of strings with at least one line for calculation.");
                return;
            }

            // Parse the first line of input, expecting two space-separated numbers.
            const rawNumberStrings = allInputLines[0].split(" ");

            // --- Type III Addition: Helper for parsing and validation ---
            const parseAndEnsureInteger = (numStr, fallbackValue = 0) => {
                const parsed = Number(numStr);
                if (isNaN(parsed) || !Number.isInteger(parsed)) {
                    console.warn(`Parsing Warning: Invalid number string '${numStr}' encountered. Using fallback value ${fallbackValue}.`);
                    return fallbackValue;
                }
                return parsed;
            };

            const firstParsedValue = parseAndEnsureInteger(rawNumberStrings[0]);
            const secondParsedValue = parseAndEnsureInteger(rawNumberStrings[1]);

            // Use the `safeDestructureIterable` helper to get the two numbers.
            // This replicates the original code's use of `_slicedToArray`.
            const [operandA, operandB] = safeDestructureIterable([firstParsedValue, secondParsedValue], 2);

            // Perform the specific iterative calculation.
            const finalComputedResult = performPeculiarCalculation(operandA, operandB);

            // Output the final result to the console.
            console.log(finalComputedResult);
        };
    },

    // Module 2: A simple wrapper for Node.js's built-in 'fs' (File System) module.
    function(fsModuleInstance, fsModuleExports) {
        // --- Type III Update: Explicitly assigning to module.exports ---
        // In CommonJS, `module.exports = value` replaces the default exports object.
        // `fsModuleInstance` is the `module` object, so `fsModuleInstance.exports` is the way.
        fsModuleInstance.exports = require("fs");
    }
]);