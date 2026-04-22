module.exports = function(moduleDefinitionsCollection) {
    // This object serves as a cache for all modules that have been loaded.
    // It prevents redundant execution and helps manage dependencies.
    const loadedModulesRegistry = {};

    /**
     * The core function responsible for loading and resolving modules.
     * It handles caching, execution of module definitions, and dependency injection.
     * @param {number} requestedModuleId - The unique numeric identifier for the module to load.
     * @returns {object} The exports object of the specified module.
     * @throws {Error} If the requested module ID is not found in the definitions collection.
     */
    function internalModuleLoader(requestedModuleId) {
        // If the module has already been loaded, return its cached exports immediately.
        if (loadedModulesRegistry[requestedModuleId]) {
            return loadedModulesRegistry[requestedModuleId].exports;
        }

        // --- Guard Clause: Ensure the module definition exists ---
        if (!moduleDefinitionsCollection[requestedModuleId]) {
            throw new Error(`Module definition for ID ${requestedModuleId} is missing.`);
        }

        // Initialize a new module instance object and store it in the registry.
        // This object holds the module's ID, a loading status flag, and its exports.
        const currentModuleInstance = loadedModulesRegistry[requestedModuleId] = {
            id: requestedModuleId,
            isLoaded: false, // Flag indicating whether the module's code has finished executing.
            exports: {}      // The object that will be populated with the module's exported values.
        };

        // Execute the module's definition function.
        // The `call` method is used to set the `this` context for the module function
        // (which is typically `module.exports` in CommonJS) and pass the standard
        // `module`, `exports`, and `require` arguments.
        moduleDefinitionsCollection[requestedModuleId].call(
            currentModuleInstance.exports, // 'this' context for the module function
            currentModuleInstance,         // The 'module' object
            currentModuleInstance.exports, // The 'exports' object
            internalModuleLoader           // The 'require' function (this loader itself)
        );

        // After successful execution of the module's definition, mark it as loaded.
        currentModuleInstance.isLoaded = true;
        return currentModuleInstance.exports;
    }

    // --- Exposing internal utilities on the module loader for advanced features ---
    internalModuleLoader.allDefinitions = moduleDefinitionsCollection; // All module definitions.
    internalModuleLoader.moduleCache = loadedModulesRegistry;         // The runtime module cache.

    /**
     * A utility function to define a getter property on a target object.
     * This is commonly used in module systems to create "live" bindings or aliases.
     * @param {object} targetObject - The object on which to define the property.
     * @param {string} propertyKey - The name of the property to define.
     * @param {Function} propertyGetter - The function that returns the value of the property when accessed.
     */
    const defineObjectPropertyGetter = (targetObject, propertyKey, propertyGetter) => {
        // Only define the property if it doesn't already exist to avoid overwriting.
        if (!internalModuleLoader.checkOwnProperty(targetObject, propertyKey)) {
            Object.defineProperty(targetObject, propertyKey, {
                enumerable: true, // Make the property visible during enumeration (e.g., in `for...in` loops).
                get: propertyGetter // Assign the provided getter function.
            });
        }
    };
    internalModuleLoader.defineGetter = defineObjectPropertyGetter; // Renamed from 'd'

    /**
     * Marks an exports object as an ECMAScript module.
     * This adds `__esModule: true` and potentially `Symbol.toStringTag: 'Module'`.
     * Essential for compatibility between CommonJS and ES module interoperability.
     * @param {object} moduleExportsObject - The exports object to modify.
     */
    internalModuleLoader.setEsModuleFlag = function(moduleExportsObject) {
        // Set `Symbol.toStringTag` for better object identification in debugging or introspection.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(moduleExportsObject, Symbol.toStringTag, { value: 'Module' });
        }
        // Explicitly declare this object as an ES module.
        Object.defineProperty(moduleExportsObject, '__esModule', { value: true });
    };

    /**
     * Standard utility to retrieve module exports, supporting various import syntaxes (e.g., default, namespace).
     * @param {any} moduleReference - The module's ID or its already-loaded exports object.
     * @param {number} importModeFlags - A bitmask indicating the desired import behavior.
     * @returns {any} The processed module exports, tailored to the specified import mode.
     */
    internalModuleLoader.getProcessedModule = function(moduleReference, importModeFlags) {
        // Mode 1: If the moduleReference is an ID, load the module first.
        if (importModeFlags & 1) {
            moduleReference = internalModuleLoader(moduleReference);
        }
        // Mode 8: Return the moduleReference as-is; no further processing needed.
        if (importModeFlags & 8) {
            return moduleReference;
        }
        // Mode 4: If it's an object and already marked as an ES module, return it directly.
        if (importModeFlags & 4 && typeof moduleReference === 'object' && moduleReference && moduleReference.__esModule) {
            return moduleReference;
        }

        // For other modes, create a new namespace object to aggregate exports.
        const moduleNamespace = Object.create(null);
        internalModuleLoader.setEsModuleFlag(moduleNamespace); // Mark this new object as an ES module.

        // Define a 'default' export property pointing to the original moduleReference.
        Object.defineProperty(moduleNamespace, 'default', {
            enumerable: true,
            value: moduleReference
        });

        // Mode 2: If the moduleReference is not a string, iterate its properties
        // and define getters for them on the new namespace object.
        if (importModeFlags & 2 && typeof moduleReference !== 'string') {
            for (const keyName in moduleReference) {
                // Ensure the property is directly on the moduleReference, not inherited.
                if (internalModuleLoader.checkOwnProperty(moduleReference, keyName)) {
                    internalModuleLoader.defineGetter(moduleNamespace, keyName, (() => moduleReference[keyName]).bind(null));
                }
            }
        }
        return moduleNamespace;
    };

    /**
     * Creates a getter function specifically for a module's default export.
     * This is often used to simplify access to default exports from different module types.
     * @param {object} sourceModule - The module object from which to get the default export.
     * @returns {Function} A function that, when called, returns the default export.
     */
    internalModuleLoader.createDefaultExportAccessor = function(sourceModule) {
        // Determine the actual default export accessor based on whether it's an ES module.
        const accessorFunction = sourceModule && sourceModule.__esModule
            ? () => sourceModule.default // If it's an ES module, use its 'default' property.
            : () => sourceModule;       // Otherwise, the entire module object is considered the default.

        // Define an 'a' property (a common alias) on the accessor itself, pointing back to the accessor.
        // This is a subtle pattern sometimes used in bundlers.
        internalModuleLoader.defineGetter(accessorFunction, 'a', accessorFunction);
        return accessorFunction;
    };

    /**
     * Checks if an object has a specific property as its own (non-inherited) property.
     * This is a safer alternative to `obj.hasOwnProperty(prop)` as `hasOwnProperty` can be shadowed.
     * @param {object} targetObject - The object to inspect.
     * @param {string} propertyIdentifier - The name of the property to check.
     * @returns {boolean} True if the property is a direct property of the object, false otherwise.
     */
    internalModuleLoader.checkOwnProperty = function(targetObject, propertyIdentifier) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyIdentifier);
    };

    // --- Entry Point: Execute the application's starting module ---
    // The `entryModuleIdentifier` specifies which module kicks off the application.
    internalModuleLoader.entryModuleIdentifier = 0;

    // Load and execute the designated entry module, returning its exports (though
    // for a main application entry, the return value might not be directly used externally).
    return internalModuleLoader(internalModuleLoader.entryModuleIdentifier);
}([ // This array contains the definitions for all modules in the bundle.

    // Module 0: The primary application entry point.
    // This module orchestrates input reading and delegates to the main calculation logic.
    function(currentModule, exportsObject, moduleRequester) {
        try {
            // Require the file system module which is defined as module 2 in this bundle.
            const fileSystemHandler = moduleRequester(2);

            // --- Guard Clause: Validate file system module availability ---
            if (!fileSystemHandler || typeof fileSystemHandler.readFileSync !== 'function') {
                throw new Error("Required 'fs' module or its 'readFileSync' method is unavailable.");
            }

            // Read the input data from standard input, assuming UTF-8 encoding.
            const rawInputStream = fileSystemHandler.readFileSync("/dev/stdin", "UTF-8");

            // --- Validation: Check for valid input stream data ---
            if (typeof rawInputStream !== 'string' || rawInputStream.trim().length === 0) {
                console.error("Application Error: No valid input data received from /dev/stdin.");
                // In a production scenario, one might exit or provide default behavior here.
                return;
            }

            // Require the main computational logic module, defined as module 1.
            const mainProcessorFunction = moduleRequester(1);

            // --- Guard Clause: Validate main processor function ---
            if (typeof mainProcessorFunction !== 'function') {
                throw new Error("Main processing module (ID 1) did not export a callable function.");
            }

            // Execute the main processing logic with the collected input.
            mainProcessorFunction(rawInputStream);

        } catch (executionError) {
            // Centralized error reporting for the entry point.
            console.error("An unhandled exception occurred during application startup:", executionError.message);
            // Additional error details (stack, etc.) could be logged here.
        }
    },

    // Module 1: Contains the core algorithm for string sequence comparison and calculation.
    function(moduleRef, exportsRef) {
        // This function encapsulates the main problem-solving logic.
        moduleRef.exports = function(sourceDataString) {
            // --- Input Validation: Ensure the data string is valid ---
            if (typeof sourceDataString !== 'string' || sourceDataString.length === 0) {
                console.error("Calculation Error: Input data string is empty or not a string.");
                return;
            }

            // Split the input string into an array of lines based on newline characters.
            const inputLines = sourceDataString.split("\n");

            // Define the modulus constant used for all arithmetic operations to keep results within bounds.
            const calculationModulo = 1000000007; // A common large prime for modular arithmetic.

            // --- Input Validation: Check for sufficient lines ---
            if (inputLines.length < 3) {
                console.error("Calculation Error: Expected at least 3 lines (N, String A, String B), but received fewer.");
                return;
            }

            // Parse the first line to get the size of the sequences.
            const sequenceSizeN = Number(inputLines[0]);

            // --- Input Validation: Validate sequence size N ---
            if (isNaN(sequenceSizeN) || sequenceSizeN < 0) {
                console.error("Calculation Error: Invalid or negative sequence size (N) provided.");
                return;
            }

            // Convert the second and third lines into character arrays for efficient indexed access.
            const firstSequenceChars = inputLines[1].split("");
            const secondSequenceChars = inputLines[2].split("");

            // --- Input Validation: Check if sequences are long enough ---
            if (firstSequenceChars.length < sequenceSizeN || secondSequenceChars.length < sequenceSizeN) {
                console.error("Calculation Error: Input sequence lengths are shorter than specified N.");
                return;
            }

            // Initialize the accumulator for the final result.
            let finalComputedResult = 1;

            // `previousComparisonStatus` tracks the outcome of the last character comparison.
            // 0: Initial state (no previous comparison, or state reset).
            // 1: The immediately preceding characters matched (charA === charB).
            // 2: The immediately preceding characters did NOT match (charA !== charB).
            let previousComparisonStatus = 0;

            // Define lookup tables for multiplication factors based on `previousComparisonStatus`.
            // This replaces nested `if-else` blocks for cleaner logic.
            const factorsForMatch = [3, 2, 1];    // Factors when current characters match: [for state 0, for state 1, for state 2]
            const factorsForMismatch = [6, 2, 3]; // Factors when current characters mismatch: [for state 0, for state 1, for state 2]

            // Iterate through the sequences. The loop counter (`charIndex`) is manually managed
            // within the loop body to allow for skipping characters in case of mismatches.
            for (let charIndex = 0; charIndex < sequenceSizeN; ) {
                const charFromA = firstSequenceChars[charIndex];
                const charFromB = secondSequenceChars[charIndex];

                // Determine if the characters at the current index are identical.
                const areCurrentCharsIdentical = (charFromA === charFromB);

                if (areCurrentCharsIdentical) {
                    // If characters match, multiply the result by the factor corresponding to the previous state.
                    finalComputedResult = (finalComputedResult * factorsForMatch[previousComparisonStatus]) % calculationModulo;
                    previousComparisonStatus = 1; // Update state to indicate a match.
                    charIndex++;                  // Move to the next character in sequence.
                } else {
                    // If characters do not match, multiply the result by the factor for a mismatch.
                    finalComputedResult = (finalComputedResult * factorsForMismatch[previousComparisonStatus]) % calculationModulo;
                    previousComparisonStatus = 2; // Update state to indicate a mismatch.
                    charIndex += 2;               // Skip the current and the next character as per problem rule.
                }
            }

            // Prepare the result for output.
            const resultDisplayString = String(finalComputedResult);
            // Output the final calculated result to the console.
            console.log(resultDisplayString);
        };
    },

    // Module 2: A simple wrapper for Node.js's built-in 'fs' (File System) module.
    // This allows other modules in the bundle to access file system operations.
    function(moduleInstance, exportsInstance) {
        // Directly assign the Node.js 'fs' module to this module's exports.
        // This makes `require('fs')` inside the bundle behave as expected.
        exportsInstance = moduleInstance.exports = require("fs");
    }
]);