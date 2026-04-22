// This script implements a custom module loading system, similar to a simplified Webpack runtime.
// It bundles several internal modules and executes an entry point.

module.exports = (function(moduleDefinitions) {
    // A cache for already loaded modules. Keys are module IDs, values are module objects.
    const loadedModuleCache = {};

    /**
     * The core module loading function.
     * It attempts to retrieve a module from cache, or loads it if not found.
     * @param {number} requestedModuleId The ID of the module to load.
     * @returns {object} The exports of the requested module.
     */
    function internalModuleLoader(requestedModuleId) {
        // Guard clause: Ensure module ID is a valid number.
        if (typeof requestedModuleId !== 'number' || requestedModuleId < 0 || requestedModuleId >= moduleDefinitions.length) {
            console.error(`Attempted to load an invalid module ID: ${requestedModuleId}`);
            // Depending on strictness, could throw an error or return an empty object.
            // For Type III, we can add a warning and return default behavior.
            return {};
        }

        // If the module is already in the cache, return its exports.
        if (loadedModuleCache[requestedModuleId]) {
            return loadedModuleCache[requestedModuleId].exports;
        }

        // Create a new module object and store it in the cache.
        // 'i': module ID
        // 'l': loaded flag (false initially)
        // 'exports': the actual exports object for this module
        const currentModule = loadedModuleCache[requestedModuleId] = {
            id: requestedModuleId,
            isLoaded: false,
            exports: {}
        };

        // Execute the module function.
        // The module function is expected to be in moduleDefinitions[requestedModuleId].
        // It receives `module`, `exports`, and the `internalModuleLoader` function as arguments.
        moduleDefinitions[requestedModuleId].call(
            currentModule.exports,
            currentModule,
            currentModule.exports,
            internalModuleLoader
        );

        // Mark the module as loaded.
        currentModule.isLoaded = true;

        // Return the module's exports.
        return currentModule.exports;
    }

    // --- Helper functions attached to the module loader for advanced features ---

    // Store the entire module definitions array for potential introspection.
    internalModuleLoader.allAvailableModules = moduleDefinitions;
    // Store the module cache for potential introspection.
    internalModuleLoader.moduleCacheReference = loadedModuleCache;

    /**
     * Defines a getter property on an object if it doesn't already exist.
     * Used for lazy property loading or non-enumerable properties.
     * @param {object} targetObject The object on which to define the property.
     * @param {string} propertyKey The name of the property.
     * @param {function} getterFunction The function to call when the property is accessed.
     */
    internalModuleLoader.defineGetterProperty = function(targetObject, propertyKey, getterFunction) {
        // Ensure the target is a valid object before attempting to define properties.
        if (!targetObject || typeof targetObject !== 'object' || Array.isArray(targetObject)) {
            console.warn(`Attempted to define property '${propertyKey}' on a non-object target.`);
            return;
        }
        // Only define the property if it doesn't already exist on the target object.
        if (!internalModuleLoader.hasOwn(targetObject, propertyKey)) {
            Object.defineProperty(targetObject, propertyKey, {
                enumerable: true, // Make the property iterable.
                get: getterFunction // Define the getter for the property.
            });
        }
    };

    /**
     * Marks an exports object as an ECMAScript Module (ESM).
     * This adds special properties for module interoperability.
     * @param {object} exportsObject The module's exports object.
     */
    internalModuleLoader.markAsESModule = function(exportsObject) {
        // Early exit if the target is not a valid object.
        if (!exportsObject || typeof exportsObject !== 'object') {
            return;
        }
        // If Symbol and Symbol.toStringTag are supported, define a `Symbol.toStringTag` property.
        // This helps identify the object as a module when inspected.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, { value: "Module" });
        }
        // Define the `__esModule` property to true, indicating it's an ESM.
        Object.defineProperty(exportsObject, "__esModule", { value: true });
    };

    /**
     * Provides interoperability logic for handling different module export formats.
     * It can convert a CommonJS export to an ESM-like namespace object.
     * @param {any} moduleContent The raw module content (could be a module ID or actual exports).
     * @param {number} interopFlags Bit flags indicating desired interoperability behavior.
     *   - 1: If moduleContent is an ID, resolve it via the loader.
     *   - 4: If moduleContent is an object and already an ESM, return it directly.
     *   - 8: (Not explicitly used in original, but common for "namespace object" flag)
     * @returns {object} An ESM-compatible namespace object.
     */
    internalModuleLoader.interopRequireWildcard = function(moduleContent, interopFlags) {
        // If flag 1 is set, and moduleContent is not already an object, load it.
        if ((interopFlags & 1) && !(moduleContent instanceof Object)) {
            moduleContent = internalModuleLoader(moduleContent);
        }
        // If flag 4 is set, and it's an object and already an ESM, return it as-is.
        if ((interopFlags & 4) && typeof moduleContent === 'object' && moduleContent && moduleContent.__esModule) {
            return moduleContent;
        }

        // Create a new plain object to act as the namespace.
        const namespaceObject = Object.create(null);
        // Mark this new object as an ESM.
        internalModuleLoader.markAsESModule(namespaceObject);
        // Define a 'default' export pointing to the original module content.
        Object.defineProperty(namespaceObject, "default", { enumerable: true, value: moduleContent });

        // If flag 2 is NOT set (meaning it's not a string module, usually a CommonJS module),
        // iterate over its properties and re-export them as named exports.
        if (!(interopFlags & 2) && typeof moduleContent !== "string") {
            for (const exportKey in moduleContent) {
                // Ensure the property belongs to the moduleContent itself, not its prototype chain.
                if (internalModuleLoader.hasOwn(moduleContent, exportKey)) {
                    // Define a getter for each property on the namespace object,
                    // which retrieves the value from the original module content.
                    internalModuleLoader.defineGetterProperty(namespaceObject, exportKey, (function(boundKey) {
                        return moduleContent[boundKey];
                    }).bind(null, exportKey)); // Use bind to capture exportKey for the getter.
                }
            }
        }
        return namespaceObject;
    };

    /**
     * Creates a getter function for a module's default export.
     * This is used for compatibility between CommonJS and ESM default exports.
     * @param {object} sourceModule The module object to extract the default export from.
     * @returns {function} A function that returns the default export.
     */
    internalModuleLoader.interopRequireDefault = function(sourceModule) {
        // Determine the function that will return the default export.
        // If the module is an ESM and has a `default` property, return that.
        // Otherwise, return the entire module object as the default.
        const defaultExportGetter = sourceModule && sourceModule.__esModule ?
            function() { return sourceModule.default; } :
            function() { return sourceModule; };

        // Define a property 'a' (often used as a placeholder) on the getter itself,
        // which also points to the getter function. This seems like a vestige or specific pattern.
        internalModuleLoader.defineGetterProperty(defaultExportGetter, "a", defaultExportGetter);
        return defaultExportGetter;
    };

    /**
     * A utility function to check if an object has a specific property as its own property.
     * @param {object} targetObject The object to check.
     * @param {string} propertyName The name of the property.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    internalModuleLoader.hasOwn = function(targetObject, propertyName) {
        if (!targetObject || typeof targetObject !== 'object') {
            return false; // Cannot check properties on non-objects.
        }
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    // Public path for assets, often left empty in bundled environments.
    internalModuleLoader.assetPublicPath = "";

    // --- Application Entry Point ---
    // The entry module ID (usually 0 for the main application logic).
    const START_MODULE_INDEX = 0;
    // Store the start module ID for potential debugging or later use.
    internalModuleLoader.startModuleId = START_MODULE_INDEX;

    // Execute the entry module and return its exports (though often unused for side-effect heavy entry points).
    return internalModuleLoader(START_MODULE_INDEX);

}([
    /**
     * Module 0: The application's entry point.
     * It reads from standard input and passes the content to the main processing logic.
     * @param {object} currentModule The module object.
     * @param {object} moduleExports The exports object for this module.
     * @param {function} requireDependency The local require function.
     */
    function(currentModule, moduleExports, requireDependency) {
        // Define constants for module IDs to improve readability.
        const MAIN_LOGIC_PROCESSOR_ID = 1;
        const FILE_SYSTEM_UTILITIES_ID = 2;

        // Retrieve the main string processing function from module 1.
        const processInputString = requireDependency(MAIN_LOGIC_PROCESSOR_ID);
        // Retrieve the Node.js 'fs' module from module 2.
        const nodeFileSystem = requireDependency(FILE_SYSTEM_UTILITIES_ID);

        let inputContent;
        try {
            // Read all content from standard input synchronously, interpreted as UTF-8.
            inputContent = nodeFileSystem.readFileSync("/dev/stdin", "UTF-8");
        } catch (error) {
            console.error("Error reading from /dev/stdin:", error.message);
            // In a real application, you might exit or provide a default.
            // For this clone, we'll proceed with an empty string or error state.
            inputContent = ""; // Fallback to empty string
        }

        // Add a basic validation for the input content.
        if (typeof inputContent !== 'string' || inputContent.length === 0) {
            console.warn("No content or invalid content received from /dev/stdin. Processing skipped.");
            // Explicitly log 0 if no valid input for the specific problem this solves.
            console.log(0);
            return; // Exit if no valid input.
        }

        // Pass the read content to the main processing function.
        processInputString(inputContent);
    },

    /**
     * Module 1: Contains the core string processing logic.
     * This function finds the length of the longest prefix of a string that
     * can be represented as `PP` (a prefix repeated twice).
     * For example, for "ababa", "ab" is repeated twice ("abab"), so length is 4.
     * For "abcabc", no such 'PP' prefix exists within any shorter prefix.
     * @param {object} currentModule The module object.
     * @param {object} moduleExports The exports object for this module.
     */
    function(currentModule, moduleExports) {
        // This module exports a single function.
        currentModule.exports = function(fullInputString) {
            // Basic validation for the input string.
            if (!fullInputString || fullInputString.length < 2) {
                console.log(0); // If input is too short, no 'PP' pattern can exist.
                return;
            }

            // Extract the first line and convert it to an array of characters.
            // Assuming the relevant string is always the first line.
            const firstLine = fullInputString.split("\n")[0];
            const charArray = Array.from(firstLine); // More explicit than split('')

            let maxRepeatingPrefixLength = 0; // Stores the length of the longest found 'PP' prefix.

            // Iterate backwards from the second-to-last character (charArray.length - 2) down to 0.
            // 'potentialEndIndex' marks the end of the *second* occurrence of the repeating prefix (P2).
            // So, the substring considered is `charArray[0...potentialEndIndex]`.
            for (let potentialEndIndex = charArray.length - 2; potentialEndIndex >= 0; potentialEndIndex--) {
                // 'splitPoint' marks the start of the *second* occurrence of the repeating prefix (P2).
                // It iterates from the beginning of the string up to 'potentialEndIndex'.
                for (let splitPoint = 0; splitPoint <= potentialEndIndex; splitPoint++) {
                    // Extract the first part (P1) from the beginning of the string up to the split point.
                    const firstPartCandidate = charArray.slice(0, splitPoint).join("");
                    // Extract the second part (P2) from the split point up to potentialEndIndex.
                    const secondPartCandidate = charArray.slice(splitPoint, potentialEndIndex + 1).join("");

                    // Check if P1 is identical to P2.
                    if (firstPartCandidate === secondPartCandidate) {
                        // If a match is found, update the max length and immediately log and return.
                        // The problem asks for the length of the 'PP' segment, which is (potentialEndIndex + 1).
                        maxRepeatingPrefixLength = potentialEndIndex + 1;
                        console.log(maxRepeatingPrefixLength);
                        return; // Exit the function as soon as the longest is found (due to outer loop iterating backwards).
                    }
                }
            }

            // If no such 'PP' pattern is found after checking all possibilities, log 0.
            console.log(0);
        };
    },

    /**
     * Module 2: Simply exports the Node.js 'fs' (file system) module.
     * @param {object} currentModule The module object.
     * @param {object} moduleExports The exports object for this module.
     */
    function(currentModule, moduleExports) {
        // Assign the Node.js 'fs' module directly to this module's exports.
        currentModule.exports = require("fs");
    }
]));