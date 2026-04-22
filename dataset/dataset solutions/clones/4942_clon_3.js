// This file defines a self-executing function that sets up a module loading system.
// It serves as a runtime environment for the application's individual modules,
// managing their definitions, caching, and interdependencies.

module.exports = function(applicationModuleDefinitions) {
    // A private object to store modules that have been loaded.
    // This cache prevents redundant module execution and ensures that
    // modules are treated as singletons within this runtime.
    const internalLoadedModulesCache = {};

    /**
     * The core function responsible for loading modules.
     * It acts as the 'require' equivalent within this custom module system.
     * If a module has already been loaded, its exports are returned from the cache.
     * Otherwise, the module's code is executed, its exports are captured, and then cached.
     *
     * @param {number} requestedModuleIdentifier The unique numerical ID of the module to load.
     * @returns {object} The exports object of the requested module.
     */
    function applicationModuleLoader(requestedModuleIdentifier) {
        // Step 1: Check if the module is already present in the cache.
        if (internalLoadedModulesCache[requestedModuleIdentifier]) {
            return internalLoadedModulesCache[requestedModuleIdentifier].exports;
        }

        // Step 2: If not cached, prepare a new module object.
        // 'id': The unique identifier for this module.
        // 'isInitialized': A flag indicating if the module's code has been executed.
        // 'exports': The object where the module's public interface will be stored.
        const currentModuleObject = internalLoadedModulesCache[requestedModuleIdentifier] = {
            id: requestedModuleIdentifier,
            isInitialized: false, // Initially, the module's code has not run.
            exports: {}
        };

        // Step 3: Execute the module's code.
        // The module's function is called with specific arguments:
        // - `currentModuleObject.exports`: The `exports` object to which the module should add its public members.
        // - `currentModuleObject`: The `module` object itself (containing `id`, `isInitialized`, `exports`).
        // - `applicationModuleLoader`: A reference to this loader function, allowing modules to `require` other modules.
        applicationModuleDefinitions[requestedModuleIdentifier].call(
            currentModuleObject.exports,
            currentModuleObject,
            currentModuleObject.exports,
            applicationModuleLoader
        );

        // Step 4: Mark the module as initialized after its code has run.
        currentModuleObject.isInitialized = true;

        // Step 5: Return the exports of the newly loaded module.
        return currentModuleObject.exports;
    }

    // --- Auxiliary functions and properties attached to the main module loader ---

    // Store a reference to the array of all module definitions for introspection or advanced use.
    applicationModuleLoader.allDefinitions = applicationModuleDefinitions;
    // Expose the internal module cache for debugging or module management.
    applicationModuleLoader.moduleCache = internalLoadedModulesCache;

    /**
     * Defines a non-writable, enumerable getter property on a target object.
     * This is commonly used to create named exports for ES Modules compatibility,
     * where the property's value is retrieved dynamically via the getter.
     *
     * @param {object} targetObject The object on which the property will be defined.
     * @param {string} propertyKey The name of the property to define.
     * @param {function} valueGetterFunction The function that will be called to retrieve the property's value.
     */
    applicationModuleLoader.defineGetterExport = function(targetObject, propertyKey, valueGetterFunction) {
        // Ensure the property is not already defined to prevent accidental overwrites.
        // This check enhances robustness, especially in dynamic module environments.
        if (!applicationModuleLoader.hasOwnPropertyCheck(targetObject, propertyKey)) {
            Object.defineProperty(targetObject, propertyKey, {
                enumerable: true, // Make the property visible when iterating over object keys.
                get: valueGetterFunction // The function that supplies the property's value.
            });
        }
        // else {
        //     // Optional: Add a warning if a property is attempted to be redefined.
        //     console.warn(`Attempted to redefine existing export property '${propertyKey}'.`);
        // }
    };

    /**
     * Flags an exports object as an ECMAScript Module (ES Module).
     * This involves setting two specific properties: `Symbol.toStringTag` and `__esModule`.
     * These flags are crucial for interoperability between CommonJS and ES Module syntax.
     *
     * @param {object} exportsContainerObject The object to be marked as an ES Module.
     */
    applicationModuleLoader.markAsEsModule = function(exportsContainerObject) {
        // Set `Symbol.toStringTag` for better object identification in `Object.prototype.toString`.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsContainerObject, Symbol.toStringTag, { value: 'Module' });
        }
        // Set the `__esModule` flag, a common convention used by bundlers (like Webpack)
        // to indicate that an object represents an ES Module's exports.
        Object.defineProperty(exportsContainerObject, '__esModule', { value: true });
    };

    /**
     * Provides interoperability logic for different module export patterns (e.g., CommonJS `module.exports`, ES Module `export default`).
     * It attempts to resolve a module's default export or create a suitable namespace object.
     *
     * @param {any} moduleReference The module itself, or its ID, or its exports object.
     * @param {number} resolutionFlags A bitmask indicating how to interpret `moduleReference` and perform resolution.
     * @returns {any} The resolved module, its default export, or a namespace object.
     */
    applicationModuleLoader.resolveModuleInterop = function(moduleReference, resolutionFlags) {
        let currentProcessedModule = moduleReference;

        // Flag 1: If `resolutionFlags` includes 1, `moduleReference` is a module ID; load it.
        if (resolutionFlags & 1) {
            currentProcessedModule = applicationModuleLoader(moduleReference);
        }

        // Flag 8: If `resolutionFlags` includes 8, return the module directly without further processing.
        if (resolutionFlags & 8) {
            return currentProcessedModule;
        }

        // Flag 4: If `resolutionFlags` includes 4, and the module is an object already marked as an ES Module, return it.
        if (resolutionFlags & 4 && typeof currentProcessedModule === 'object' && currentProcessedModule !== null && currentProcessedModule.__esModule) {
            return currentProcessedModule;
        }

        // Create a new, empty object to serve as the namespace for interop.
        const interopNamespaceObject = Object.create(null);
        // Mark this new object as an ES Module.
        applicationModuleLoader.markAsEsModule(interopNamespaceObject);

        // Define a 'default' export property on the namespace object, pointing to the `currentProcessedModule`.
        Object.defineProperty(interopNamespaceObject, 'default', { enumerable: true, value: currentProcessedModule });

        // Flag 2: If `resolutionFlags` includes 2, and the module is not a string,
        // iterate over its properties and define getters for them on the namespace object.
        // This handles named exports for non-ES modules.
        if (resolutionFlags & 2 && typeof currentProcessedModule !== 'string') {
            for (const propertyName in currentProcessedModule) {
                // Ensure the property is directly owned by the module, not inherited.
                if (Object.prototype.hasOwnProperty.call(currentProcessedModule, propertyName)) {
                    applicationModuleLoader.defineGetterExport(interopNamespaceObject, propertyName, () => currentProcessedModule[propertyName]);
                }
            }
        }

        return interopNamespaceObject;
    };

    /**
     * Creates a getter function that resolves to a module's default export,
     * or the module itself if no explicit default is found.
     * This is primarily for compatibility with `import * as ... from 'module'` syntax.
     *
     * @param {object} moduleToWrap The module's exports object.
     * @returns {function} A getter function for the module's "default" representation.
     */
    applicationModuleLoader.createDefaultExportGetter = function(moduleToWrap) {
        // Determine the appropriate getter for the default export.
        // If the module is explicitly an ES Module with a `default` property, use that.
        // Otherwise, the entire `moduleToWrap` object is considered the default.
        const resolvedDefaultGetter = (moduleToWrap && moduleToWrap.__esModule)
            ? () => moduleToWrap.default
            : () => moduleToWrap;

        // Attach a conventional 'a' property (often used by bundlers) to the getter itself,
        // which also points to the same resolved default getter.
        applicationModuleLoader.defineGetterExport(resolvedDefaultGetter, 'a', resolvedDefaultGetter);
        return resolvedDefaultGetter;
    };

    /**
     * A robust utility to check if an object has an own (non-inherited) property.
     * This is a safer alternative to `Object.prototype.hasOwnProperty.call()`.
     *
     * @param {object} targetObject The object to inspect.
     * @param {string} propertyName The name of the property to check for.
     * @returns {boolean} `true` if the object has the specified own property, `false` otherwise.
     */
    applicationModuleLoader.hasOwnPropertyCheck = function(targetObject, propertyName) {
        // Guard against null, undefined, or non-object inputs.
        if (targetObject === null || typeof targetObject !== 'object') {
            return false;
        }
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    // --- Application Entry Point Configuration ---

    // Validate the module definitions array before attempting to load.
    if (!Array.isArray(applicationModuleDefinitions) || applicationModuleDefinitions.length === 0) {
        // Log an error and exit if the module definitions are invalid or missing.
        console.error("Critical Error: Application module definitions are invalid or empty. Cannot start.");
        return; // Terminate execution.
    }

    // Set the identifier for the main entry module (conventionally 0).
    const mainApplicationEntryId = 0;
    applicationModuleLoader.startupModuleId = mainApplicationEntryId; // Store for reference.

    // Load and execute the main entry module to kick off the application.
    return applicationModuleLoader(mainApplicationEntryId);
}(
    // --- The array containing all application module definitions ---
    [
        // Module ID 0: The primary entry point for the application.
        // This module handles input/output and orchestrates the core logic module.
        function(module0Context, module0Exports, module0Require) {
            // Load the Node.js 'fs' (file system) module via the custom loader.
            const fileSystemHandler = module0Require(2);
            // Load the core business logic module.
            const coreLogicProcessor = module0Require(1);

            try {
                // Read input data from standard input (stdin) using UTF-8 encoding.
                const rawDataFromStdin = fileSystemHandler.readFileSync("/dev/stdin", "UTF-8");

                // Pass the raw input data to the core logic processor for calculation.
                coreLogicProcessor(rawDataFromStdin);
            } catch (ioError) {
                // Handle potential errors during file reading (e.g., stdin not available).
                console.error("Failed to read input from /dev/stdin:", ioError.message);
                // Provide a fallback or default output in case of input failure.
                console.log(0);
            }

            // This entry module typically does not export anything itself.
        },

        // Module ID 1: Contains the specialized algorithm for processing character sequences.
        // It calculates a specific numeric value based on 'T' and 'R' character balances.
        function(module1Context, module1Exports) {
            /**
             * Processes an input string, analyzing character balances ('T' and 'R') to compute a result.
             * The algorithm seems designed to find a specific state or condition within the string.
             *
             * @param {string} inputStringData The string to be processed (e.g., "TRRTTRT").
             */
            module1Exports.exports = function(inputStringData) {
                // --- Input Data Validation and Preparation ---
                // Ensure the input is a valid non-empty string.
                if (typeof inputStringData !== 'string' || inputStringData.trim().length === 0) {
                    console.error("Error: Provided input data is empty or not a valid string.");
                    console.log(0); // Output a default value for invalid input.
                    return;
                }

                // Extract the first line of the input and convert it into an array of individual characters.
                const charactersOfFirstLine = inputStringData.split('\n')[0].split('');
                const totalCharacterCount = charactersOfFirstLine.length;

                // Handle cases where the first line itself is empty after splitting.
                if (totalCharacterCount === 0) {
                    console.log(0); // Output 0 for an empty character array.
                    return;
                }

                // --- Algorithm Variables Initialization ---
                let currentRBalance = 0; // Counter for 'R' characters encountered so far.
                let currentTBalance = 0; // Counter for 'T' characters encountered so far.
                // This variable tracks a specific minimum count for 'T's,
                // which increments conditionally based on 'R' balance.
                let minimumTRequiredTracker = 0;
                let characterPosition = 0; // The current index in the character array.

                // Pre-calculate half of the total character count, used as a termination condition.
                const requiredTCountForTermination = totalCharacterCount / 2;

                // --- Core Processing Loop ---
                // The loop iterates through the characters until either all characters are processed
                // or the `currentTBalance` reaches the `requiredTCountForTermination`.
                while (characterPosition < totalCharacterCount) {
                    const characterAtCurrentPosition = charactersOfFirstLine[characterPosition];

                    // Process the current character.
                    if (characterAtCurrentPosition === 'T') {
                        currentTBalance++; // Increment the 'T' counter.
                        // If `minimumTRequiredTracker` is less than `currentRBalance`, update it.
                        // This logic implies `minimumTRequiredTracker` attempts to keep pace with `currentRBalance`
                        // but only when a 'T' character is processed.
                        if (minimumTRequiredTracker < currentRBalance) {
                            minimumTRequiredTracker++;
                        }
                    } else if (characterAtCurrentPosition === 'R') {
                        currentRBalance++; // Increment the 'R' counter.
                    }
                    // For any other unexpected characters, they are effectively ignored by this logic.
                    // An explicit 'else' block could log a warning or handle them if needed.

                    // Check the early termination condition: if 'T' balance reaches half the total length.
                    if (currentTBalance === requiredTCountForTermination) {
                        break; // Exit the loop as the specific condition is met.
                    }

                    characterPosition++; // Move to the next character in the sequence.
                }

                // --- Final Calculation and Output ---
                // Compute the final result based on the total character count and the tracked minimum 'T' value.
                const finalComputedResult = totalCharacterCount - (2 * minimumTRequiredTracker);

                // Display the calculated result to the console.
                console.log(finalComputedResult);
            };
        },

        // Module ID 2: A simple wrapper module to expose the Node.js built-in 'fs' (file system) module.
        // This allows other modules within this custom system to access file system functionalities.
        function(module2Context, module2Exports) {
            // Directly assign the result of Node.js's native 'require("fs")' to this module's exports.
            module2Exports.exports = require("fs");
        }
    ]
);