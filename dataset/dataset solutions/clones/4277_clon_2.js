/*
 * This file contains a JavaScript module bundle, similar to what a bundler like Webpack might produce.
 * It encapsulates several distinct code units (modules) and provides a mechanism to load and execute them.
 */
module.exports = function (allModuleDefinitions) {
    // A cache to store references to already loaded modules.
    // This prevents redundant loading and ensures singletons where appropriate.
    var loadedModuleCache = {};

    /**
     * The core module loading function.
     * It retrieves a module from the cache if available, or loads it if not.
     * @param {number} requestedModuleId - The unique identifier for the module to load.
     * @returns {object} The exports object of the requested module.
     */
    function retrieveModule(requestedModuleId) {
        // If the module is already in our cache, return its exports immediately.
        if (loadedModuleCache[requestedModuleId]) {
            return loadedModuleCache[requestedModuleId].exports;
        }

        // If not cached, create a new module entry in the cache.
        // This entry includes its ID, a flag indicating if it's loaded, and its exports object.
        var currentModuleEntry = loadedModuleCache[requestedModuleId] = {
            uniqueId: requestedModuleId,
            isModuleLoaded: false,
            exports: {}
        };

        // Execute the module's definition function.
        // The definition function receives the module's exports, the module object itself, and the loader function.
        allModuleDefinitions[requestedModuleId].call(
            currentModuleEntry.exports,
            currentModuleEntry,
            currentModuleEntry.exports,
            retrieveModule
        );

        // Mark the module as loaded after its definition has been executed.
        currentModuleEntry.isModuleLoaded = true;

        // Return the module's exports.
        return currentModuleEntry.exports;
    }

    // Attach the collection of all module definitions to the loader for easy access.
    retrieveModule.allModuleDefinitions = allModuleDefinitions;

    // Attach the module cache to the loader for internal management.
    retrieveModule.moduleCache = loadedModuleCache;

    /**
     * Defines an enumerable getter property on an object.
     * This is typically used for defining named exports.
     * @param {object} targetObject - The object on which to define the property.
     * @param {string} propertyName - The name of the property to define.
     * @param {function} getterFunction - The getter function for the property.
     */
    retrieveModule.defineExportProperty = function (targetObject, propertyName, getterFunction) {
        // Only define the property if it doesn't already exist on the object.
        if (!retrieveModule.hasOwnProp(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make the property enumerable, so it shows up in `for...in` loops.
                get: getterFunction // Set the getter function for the property.
            });
        }
    };

    /**
     * Marks a module as an ES module by defining a `__esModule` property.
     * It also sets `Symbol.toStringTag` for better debugging in environments that support it.
     * @param {object} targetModuleExports - The exports object of the module to mark.
     */
    retrieveModule.markAsEsModule = function (targetModuleExports) {
        // If Symbol and Symbol.toStringTag are available, set the toStringTag for better module identification.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetModuleExports, Symbol.toStringTag, { value: "Module" });
        }
        // Define the __esModule property to indicate it's an ES module.
        Object.defineProperty(targetModuleExports, "__esModule", { value: true });
    };

    /**
     * Creates a namespace object for a module, handling various export formats.
     * This ensures compatibility between CommonJS and ES modules.
     * @param {*} moduleValue - The module's exports.
     * @param {number} exportFlags - Bitmask flags indicating how to handle the exports.
     * @returns {object} A namespace object representing the module.
     */
    retrieveModule.createNamespaceObject = function (moduleValue, exportFlags) {
        // Flag 1: If it's a module ID, load it first.
        if (exportFlags & 1) {
            moduleValue = retrieveModule(moduleValue);
        }
        // Flag 8: If it's already a namespace object, return it as is.
        if (exportFlags & 8) {
            return moduleValue;
        }
        // Flag 4: If it's an ES module, return it as is.
        if (exportFlags & 4 && typeof moduleValue === "object" && moduleValue && moduleValue.__esModule) {
            return moduleValue;
        }

        // Otherwise, create a new namespace object.
        var namespaceHolder = Object.create(null);
        retrieveModule.markAsEsModule(namespaceHolder); // Mark it as an ES module.
        // Set the default export to the module value.
        Object.defineProperty(namespaceHolder, "default", { enumerable: true, value: moduleValue });

        // Flag 2: If the module value is not a string, copy all its properties to the namespace holder.
        if (exportFlags & 2 && typeof moduleValue !== "string") {
            for (var propName in moduleValue) {
                // Ensure properties are copied correctly, binding the getter.
                retrieveModule.defineExportProperty(
                    namespaceHolder,
                    propName,
                    (function (key) { return moduleValue[key]; }).bind(null, propName)
                );
            }
        }
        return namespaceHolder;
    };

    /**
     * Generates a compatibility getter function for a module's exports.
     * This handles both default exports from ES modules and direct CommonJS exports.
     * @param {object} moduleExports - The exports object of the module.
     * @returns {function} A getter function that returns the module's default export or the module itself.
     */
    retrieveModule.getCompatibilityExport = function (moduleExports) {
        // If the module is an ES module and has a __esModule flag, return a getter for its default export.
        var compatibilityGetter = moduleExports && moduleExports.__esModule ?
            function () { return moduleExports.default; } : // Getter for default export.
            function () { return moduleExports; }; // Getter for the entire module (CommonJS).

        // Define a property 'a' (common convention) on the getter itself, pointing to the getter.
        // This seems to be an internal mechanism for the bundler.
        retrieveModule.defineExportProperty(compatibilityGetter, "a", compatibilityGetter);
        return compatibilityGetter;
    };

    /**
     * Checks if an object has a specified property directly on itself (not inherited).
     * @param {object} checkObject - The object to check.
     * @param {string} propertyKey - The name of the property.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    retrieveModule.hasOwnProp = function (checkObject, propertyKey) {
        return Object.prototype.hasOwnProperty.call(checkObject, propertyKey);
    };

    // Initialize the public path for assets (empty in this case).
    retrieveModule.assetPath = "";

    // Load the entry module (module 0) and execute it.
    // The 'initialModule' property is set to 0, indicating the starting module.
    return retrieveModule(retrieveModule.initialModule = 0);
}(
    // Array containing all the module definition functions.
    [
        /* Module 0: Main application entry point */
        function (exportsObject, currentModule, moduleLoader) {
            // Load module 1 (the main logic) and call it with the result of reading stdin.
            // Module 2 provides the 'fs' (file system) functionality.
            moduleLoader(1)(
                moduleLoader(2).readFileSync("/dev/stdin", "UTF-8")
            );
        },

        /* Module 1: The core string manipulation logic */
        function (exportsObject, currentModule) {
            // The function assigned to exportsObject.exports will be the main logic executed by module 0.
            exportsObject.exports = function (inputData) {
                // Split the input into lines.
                var inputLines = inputData.split("\n");

                // The first line is the target string where replacements might occur.
                var targetString = inputLines[0];
                var targetLength = targetString.length;

                // The second line is the pattern string to search for.
                var patternString = inputLines[1];
                var patternLength = patternString.length;

                // Initialize the index where a match is found; -1 means no match yet.
                var matchStartIndex = -1;

                // Iterate backwards through the target string to find the rightmost match.
                // The loop starts from `targetLength - patternLength` down to 0.
                for (var searchPosition = targetLength - patternLength; searchPosition >= 0; searchPosition--) {
                    // Assume a match for the current position.
                    var isMatch = true;

                    // Compare the pattern with the substring of the target at the current position.
                    for (var charIndex = 0; charIndex < patternLength; charIndex++) {
                        // A mismatch occurs if characters don't match AND the target character isn't a '?'.
                        if (targetString[searchPosition + charIndex] !== patternString[charIndex] &&
                            targetString[searchPosition + charIndex] !== "?")
                        {
                            isMatch = false; // Mark as no match.
                            break;           // No need to check further characters for this position.
                        }
                    }

                    // If a match was found for this 'searchPosition', record it and exit the loop.
                    if (isMatch) {
                        matchStartIndex = searchPosition;
                        break;
                    }
                }

                // Check if no match was found or if the pattern is longer than the target.
                if (matchStartIndex === -1 || patternLength > targetLength) {
                    console.log("UNRESTORABLE"); // Output the unrestorable message.
                } else {
                    // Construct the restored string:
                    // 1. Part of the target before the match.
                    // 2. The pattern string itself.
                    // 3. Part of the target after the match.
                    var restoredString = targetString.slice(0, matchStartIndex) +
                                         patternString +
                                         targetString.slice(matchStartIndex + patternLength);

                    // Replace any remaining '?' characters in the restored string with 'a'.
                    restoredString = restoredString.replace(/\?/g, "a");

                    // Output the final restored string.
                    console.log(restoredString);
                }
            };
        },

        /* Module 2: File System module (Node.js 'fs') */
        function (exportsObject, currentModule) {
            // This module simply exports the Node.js 'fs' (file system) module.
            exportsObject.exports = require("fs");
        }
    ]
);