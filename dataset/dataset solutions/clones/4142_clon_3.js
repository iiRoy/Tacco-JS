// This is a custom module bundling runtime, inspired by Webpack's minimal runtime.
// It manages module loading, caching, and dependency resolution for a set of defined modules.
module.exports = function(moduleDefinitions) {
    // --- Internal Module Management Structures ---

    /**
     * @type {Object.<number, {id: number, isLoaded: boolean, exports: any}>}
     * A cache for loaded modules. Keys are module IDs, values are module objects.
     * 'id' stores the module's unique identifier.
     * 'isLoaded' indicates if the module has been fully processed and its exports are ready.
     * 'exports' holds the module's exported values.
     */
    var moduleCache = {};

    // --- Core Module Loader Function ---

    /**
     * Loads a module by its unique numeric identifier.
     * If the module is already present in the cache, its exports are returned immediately.
     * Otherwise, the module's definition function is executed, its exports are cached,
     * and then returned. This function also handles basic error logging.
     * @param {number} moduleId - The unique identifier of the module to load.
     * @returns {*} The exports of the requested module, or an empty object/throws error on failure.
     */
    function loadModule(moduleId) {
        // Guard clause: Validate the module ID.
        if (typeof moduleId !== 'number' || moduleId < 0 || !Number.isInteger(moduleId)) {
            console.error(`Runtime Error: Attempted to load an invalid module ID: '${moduleId}'. Module ID must be a non-negative integer.`);
            return {}; // Return an empty object for safety in case of invalid ID.
        }

        // Check if the module is already in the cache to prevent redundant loading.
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        // If the module is not in cache, initialize a new module entry.
        // This entry is immediately added to the cache to prevent circular dependency infinite loops.
        var currentModule = moduleCache[moduleId] = {
            id: moduleId,          // Store the module's identifier.
            isLoaded: false,       // Mark as not yet loaded.
            exports: {}            // Initialize an empty object for module exports.
        };

        // Retrieve the module's definition function from the provided array.
        var moduleDefinitionFunction = moduleDefinitions[moduleId];

        // Validate that a module definition exists and is a function.
        if (typeof moduleDefinitionFunction !== 'function') {
            console.warn(`Runtime Warning: Module definition for ID ${moduleId} is missing or not a function. Returning empty exports.`);
            currentModule.isLoaded = true; // Mark as loaded to prevent further warnings for this ID.
            return currentModule.exports;
        }

        try {
            // Execute the module's definition function.
            // It receives the module object, its exports object, and the `loadModule` (require) function.
            // The `this` context for the module function is set to its `exports` object.
            moduleDefinitionFunction.call(currentModule.exports, currentModule, currentModule.exports, loadModule);
        } catch (executionError) {
            // Log any errors that occur during module execution.
            console.error(`Runtime Error: Failed to execute module ${moduleId}:`, executionError);
            currentModule.isLoaded = true; // Mark as loaded to prevent re-execution attempts.
            throw executionError; // Re-throw the error to propagate it up the call stack.
        }

        // Mark the module as fully loaded after successful execution.
        currentModule.isLoaded = true;

        // Return the exports of the newly loaded module.
        return currentModule.exports;
    }

    // --- Utility Helper Functions (attached to the main loader function) ---

    // Expose the module definitions and cache for potential debugging or introspection.
    loadModule.allModuleDefinitions = moduleDefinitions; // Renamed 'm' to 'allModuleDefinitions'
    loadModule.currentModuleCache = moduleCache;         // Renamed 'c' to 'currentModuleCache'

    /**
     * Defines a property on a target object using Object.defineProperty.
     * This is used to create getter properties, often for module exports.
     * @param {Object} targetObject - The object on which to define the property.
     * @param {string} propertyKey - The name of the property to define.
     * @param {Function} getterFunction - The function to be called when the property is accessed.
     */
    loadModule.defineExportGetter = function(targetObject, propertyKey, getterFunction) { // Renamed 'd' to 'defineExportGetter'
        // Only define if the property does not already exist, to prevent accidental overwrites.
        if (!loadModule.hasOwnProperty(targetObject, propertyKey)) {
            Object.defineProperty(targetObject, propertyKey, {
                enumerable: true, // Make the property visible during enumeration (e.g., in `for...in` loops).
                get: getterFunction
            });
        }
    };

    /**
     * Registers a given module's exports object as an ECMAScript Module (ESM).
     * This involves setting the `Symbol.toStringTag` and `__esModule` properties.
     * @param {Object} moduleExportsObject - The exports object of the module to register.
     */
    loadModule.markAsESModule = function(moduleExportsObject) { // Renamed 'r' to 'markAsESModule'
        // Set Symbol.toStringTag for better debugging and type identification.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(moduleExportsObject, Symbol.toStringTag, { value: 'Module' });
        }
        // Set the __esModule flag, a common convention for indicating ES modules.
        Object.defineProperty(moduleExportsObject, '__esModule', { value: true });
    };

    /**
     * Processes and transforms module exports based on a set of bitmask flags.
     * This function handles various Webpack-specific export conventions.
     * @param {*} rawModuleValue - The raw value or module ID to process.
     * @param {number} processingFlags - A bitmask indicating the processing mode:
     *   - `1`: Treat `rawModuleValue` as a module ID and load it first.
     *   - `2`: If the processed value is not a string, iterate its properties and define getters for them.
     *   - `4`: If the processed value is an object and already marked as an ES module, return it directly.
     *   - `8`: Return `rawModuleValue` directly without any further wrapping or processing.
     * @returns {*} The processed module exports, typically an object with a default export.
     */
    loadModule.processModuleExports = function(rawModuleValue, processingFlags) { // Renamed 't' to 'processModuleExports'
        var intermediateExports = rawModuleValue;

        // Flag 1: If set, `rawModuleValue` is a module ID; load it.
        if (processingFlags & 1) {
            intermediateExports = loadModule(rawModuleValue);
        }

        // Flag 8: If set, return the value as-is, bypassing further processing.
        if (processingFlags & 8) {
            return intermediateExports;
        }

        // Flag 4: If set, check if the value is an object and already an ES module.
        // If so, return it directly.
        if ((processingFlags & 4) && typeof intermediateExports === 'object' && intermediateExports && intermediateExports.__esModule) {
            return intermediateExports;
        }

        // Create a new object to hold the processed exports.
        // This ensures a consistent structure, especially for default exports.
        var finalExportObject = Object.create(null);
        loadModule.markAsESModule(finalExportObject); // Mark the new object as an ES module.

        // Define a 'default' property on the final export object.
        Object.defineProperty(finalExportObject, 'default', { enumerable: true, value: intermediateExports });

        // Flag 2: If set and the intermediate exports are not a string,
        // copy all enumerable properties from `intermediateExports` to `finalExportObject` as getters.
        if ((processingFlags & 2) && typeof intermediateExports !== 'string') {
            for (var exportKeyName in intermediateExports) {
                // Ensure the property belongs directly to `intermediateExports` (not inherited).
                if (loadModule.hasOwnProperty(intermediateExports, exportKeyName)) {
                    loadModule.defineExportGetter(finalExportObject, exportKeyName, (function(key) {
                        return function() { return intermediateExports[key]; };
                    })(exportKeyName));
                }
            }
        }
        return finalExportObject;
    };

    /**
     * Creates a getter function for the default export of a given module entity.
     * This abstracts away whether the module uses `__esModule` or directly exports its default.
     * @param {Object} moduleEntity - The module's exports object or raw value.
     * @returns {Function} A function that, when invoked, returns the module's default export.
     */
    loadModule.obtainDefaultExport = function(moduleEntity) { // Renamed 'n' to 'obtainDefaultExport'
        // Determine the appropriate getter for the default export.
        var defaultExportGetter = (moduleEntity && moduleEntity.__esModule) ?
            function() { return moduleEntity.default; } : // If it's an ES module, use its 'default' property.
            function() { return moduleEntity; };         // Otherwise, the module entity itself is the default.

        // Attach the getter to itself under property 'a' (a common Webpack convention).
        loadModule.defineExportGetter(defaultExportGetter, 'a', defaultExportGetter);
        return defaultExportGetter;
    };

    /**
     * Checks if an object has a specific property as its own direct property (not inherited).
     * This uses `Object.prototype.hasOwnProperty.call` for robustness.
     * @param {Object} objectToInspect - The object to check for the property.
     * @param {string} propertyIdentifier - The name of the property.
     * @returns {boolean} True if the object has the property directly, false otherwise.
     */
    loadModule.hasOwnProperty = function(objectToInspect, propertyIdentifier) { // Renamed 'o' to 'hasOwnProperty'
        return Object.prototype.hasOwnProperty.call(objectToInspect, propertyIdentifier);
    };

    // --- Entry Point Execution ---

    // The application starts by loading the designated entry module.
    // In this setup, module ID 0 is conventionally the main entry point.
    const APPLICATION_ENTRY_MODULE_ID = 0;
    loadModule(APPLICATION_ENTRY_MODULE_ID);

    // The IIFE returns the primary module loader function, which can be used externally
    // if this runtime is part of a larger system.
    return loadModule;

// The array of module definitions follows, each being a function.
}([
    /* Module 0: Application Entry Point */
    function(moduleReference, exportsReference, dependencyResolver) { // Renamed parameters
        // This module serves as the main entry point for the application.
        // It's responsible for reading input from stdin and initiating the core processing logic.

        const fileSystemModule = dependencyResolver(2); // Load the Node.js 'fs' module.
        const standardInputPath = "/dev/stdin";
        const textEncoding = "UTF-8";

        try {
            // Attempt to read content from the standard input.
            // This operation is synchronous and can throw errors if the file cannot be accessed.
            const rawInputContent = fileSystemModule.readFileSync(standardInputPath, textEncoding);
            
            // Validate if any content was actually read.
            if (!rawInputContent || rawInputContent.length === 0) {
                console.warn("Input Processor Warning: No content was read from standard input. Exiting without processing.");
                return; // Early exit if no data.
            }

            // Load the core string processing logic from Module 1.
            // Note: The original code implies that Module 1 exports a function directly.
            const stringProcessingFunction = dependencyResolver(1);

            // Execute the processing function, ensuring the input is treated as a string.
            // `readFileSync` can return a Buffer, so `.toString()` is used for safety.
            stringProcessingFunction(rawInputContent.toString());

        } catch (inputReadError) {
            // Catch and log any errors encountered during the file reading process.
            console.error(`Input Processor Error: Failed to read from '${standardInputPath}'. Details: ${inputReadError.message}`);
            // Depending on requirements, could re-throw, exit process, or provide default output.
        }
    },

    /* Module 1: Core String Processing Logic */
    function(currentModuleObject, moduleExportsObject) { // Renamed parameters
        /**
         * Analyzes a given input string to determine a specific minimum distance metric.
         * The metric is the minimum of `Math.max(index, length - index)` for all
         * indices `index` where `inputString[index]` differs from `inputString[index-1]`.
         * If no such difference is found, the string's length is returned.
         * @param {string} inputString - The string content to analyze (typically the first line of input).
         * @returns {void} The calculated minimum distance is printed to the console.
         */
        currentModuleObject.exports = function(inputString) { // Renamed 'e.exports = function(e)' to 'currentModuleObject.exports = function(inputString)'
            // Guard clause: Ensure the input is a valid non-empty string.
            if (typeof inputString !== 'string' || inputString.trim().length === 0) {
                console.warn("String Processor Warning: Provided input is empty or not a string. Cannot process.");
                console.log(0); // Output a default value for invalid input.
                return;
            }

            const firstLineOfInput = inputString.split("\n")[0]; // Extract only the first line for processing.
            const lineCharacterLength = firstLineOfInput.length;

            // Early exit for trivial cases: empty or single-character strings.
            // In these cases, no difference can be found, so the "distance" is simply the length.
            if (lineCharacterLength <= 1) {
                console.log(lineCharacterLength);
                return;
            }

            let minimumCalculatedDistance = lineCharacterLength; // Initialize with maximum possible distance.
            let previousCharacterInSequence = firstLineOfInput[0]; // Start comparison from the second character.

            // Cache Math.max for potential minor performance gain or clarity.
            const calculateMaximum = Math.max;

            // Iterate through the string, starting from the second character (index 1).
            for (let charIndex = 1; charIndex < lineCharacterLength; charIndex++) {
                const currentCharacter = firstLineOfInput[charIndex];

                // If the current character is different from the one immediately preceding it,
                // calculate its distance from both ends of the string.
                if (currentCharacter !== previousCharacterInSequence) {
                    const distanceToStart = charIndex;
                    const distanceToEnd = lineCharacterLength - charIndex;
                    
                    // The "distance" for this differing character is the maximum of its distance
                    // from the start and its distance from the end.
                    const currentCharacterDistance = calculateMaximum(distanceToStart, distanceToEnd);

                    // Update the overall minimum distance found if the current one is smaller.
                    if (currentCharacterDistance < minimumCalculatedDistance) {
                        minimumCalculatedDistance = currentCharacterDistance;
                    }
                }
                // Update the previous character for the next iteration.
                // This ensures we are always comparing current with (current-1).
                previousCharacterInSequence = currentCharacter;
            }

            // Output the final minimum distance found across all differing characters.
            console.log(minimumCalculatedDistance);
        };
    },

    /* Module 2: File System Module Exporter */
    function(moduleObject, exportsObject) { // Renamed parameters
        // This module simply acts as a proxy to export Node.js's built-in 'fs' (file system) module.
        try {
            moduleObject.exports = require("fs"); // Directly export the 'fs' module.
        } catch (loadingError) {
            // If 'fs' cannot be loaded (e.g., in a browser environment), log an error
            // and provide an empty object as a fallback to prevent runtime crashes.
            console.error("FS Module Error: Failed to load Node.js 'fs' module. This application may require a Node.js environment.", loadingError.message);
            moduleObject.exports = {}; // Provide an empty fallback object.
        }
    }
]);