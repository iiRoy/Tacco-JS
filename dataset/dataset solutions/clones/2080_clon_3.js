(function(moduleDefinitions) {
    // A repository to store modules that have already been loaded, preventing redundant work.
    var cachedModules = {};

    // The primary function responsible for loading and resolving module dependencies.
    function dependencyResolver(resourceIdentifier) {
        // Check if the requested module is already in our cache.
        if (cachedModules[resourceIdentifier]) {
            return cachedModules[resourceIdentifier].exports;
        }

        // If not cached, create a new module entry and store it.
        var currentModule = cachedModules[resourceIdentifier] = {
            // Unique identifier for this resource.
            id: resourceIdentifier,
            // Flag indicating whether the module has finished loading.
            loaded: false,
            // The object that will hold the exports of this module.
            exports: {}
        };

        // Execute the module's code, populating its exports.
        // The 'call' method ensures 'this' context, and provides module-specific variables.
        moduleDefinitions[resourceIdentifier].call(currentModule.exports, currentModule, currentModule.exports, dependencyResolver);

        // Mark the module as fully loaded.
        currentModule.loaded = true;

        // Return the populated exports object.
        return currentModule.exports;
    }

    // --- Auxiliary functions for module handling, mirroring webpack's behavior ---

    // Expose the raw module definitions for inspection or advanced usage.
    dependencyResolver.definitions = moduleDefinitions;

    // Expose the module cache for external access.
    dependencyResolver.moduleCache = cachedModules;

    // Helper to define a getter function for harmony exports (ES Modules).
    // This allows lazy evaluation and proper enumeration.
    dependencyResolver.defineExportGetter = function(exportObject, propertyName, accessorFunction) {
        if (!dependencyResolver.hasOwnProp(exportObject, propertyName)) {
            Object.defineProperty(exportObject, propertyName, {
                enumerable: true,
                get: accessorFunction
            });
        }
    };

    // Marks an exports object as an ES Module.
    dependencyResolver.markAsESModule = function(exportObject) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportObject, Symbol.toStringTag, { value: 'Module' });
        }
        Object.defineProperty(exportObject, '__esModule', { value: true });
    };

    // Creates a fake namespace object, handling different module import modes.
    dependencyResolver.createNamespaceObject = function(sourceValue, operationMode) {
        // Mode & 1: Source value is a module ID, resolve it first.
        if (operationMode & 1) sourceValue = dependencyResolver(sourceValue);
        // Mode & 8: Direct return, behaving like 'require'.
        if (operationMode & 8) return sourceValue;
        // Mode & 4: If already an ES Module namespace, return it.
        if ((operationMode & 4) && typeof sourceValue === 'object' && sourceValue && sourceValue.__esModule) return sourceValue;

        // Otherwise, construct a new namespace object.
        var newNamespace = Object.create(null);
        dependencyResolver.markAsESModule(newNamespace);
        Object.defineProperty(newNamespace, 'default', { enumerable: true, value: sourceValue });
        // Mode & 2: Merge all properties from the source value into the namespace.
        if (operationMode & 2 && typeof sourceValue != 'string') {
            for (var currentKey in sourceValue) {
                dependencyResolver.defineExportGetter(newNamespace, currentKey, (function(keyToBind) {
                    return function() { return sourceValue[keyToBind]; };
                }).bind(null, currentKey));
            }
        }
        return newNamespace;
    };

    // Provides a getter function for compatibility with non-harmony modules.
    // This helps in accessing the 'default' export or the module itself.
    dependencyResolver.createCompatibilityGetter = function(targetModule) {
        var propertyAccessor = targetModule && targetModule.__esModule ?
            function retrieveDefaultExport() { return targetModule['default']; } :
            function retrieveModuleExports() { return targetModule; };
        dependencyResolver.defineExportGetter(propertyAccessor, 'a', propertyAccessor);
        return propertyAccessor;
    };

    // Checks if an object has a specific property directly (not via prototype chain).
    dependencyResolver.hasOwnProp = function(targetObject, propertyKey) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
    };

    // Defines the base path for public assets, though often empty for server-side JS.
    dependencyResolver.publicPath = "";

    // The entry point: load the designated startup module and return its exports.
    return dependencyResolver(dependencyResolver.startupModuleId = "./src/contest/atcoder/panasonic2020/c.ts");

})
/************************************************************************/
({
    // --- Module Definitions ---

    // This module provides a polyfill for webpack's module object.
    "./node_modules/webpack/buildin/module.js":
        (function(targetModule, exportObject) {
            exportObject = function(innerModule) {
                if (!innerModule.webpackPolyfill) {
                    innerModule.deprecate = function() {}; // A no-op deprecation function
                    innerModule.paths = []; // Empty paths array
                    // innerModule.parent is undefined by default
                    if (!innerModule.children) innerModule.children = []; // Ensure children array exists
                    Object.defineProperty(innerModule, "loaded", {
                        enumerable: true,
                        get: function() { return innerModule.l; } // Map 'loaded' to 'l'
                    });
                    Object.defineProperty(innerModule, "id", {
                        enumerable: true,
                        get: function() { return innerModule.i; } // Map 'id' to 'i'
                    });
                    innerModule.webpackPolyfill = 1; // Mark as polyfilled
                }
                return innerModule;
            };
        }),

    // This is the main application logic module for the Panasonic 2020 C problem.
    "./src/contest/atcoder/panasonic2020/c.ts":
        (function(currentModule, moduleExports, dependencyResolver) {
            "use strict";
            /* CORE MODULE INJECTION */ (function(currentModule) {
                // Helper to handle default imports for ES Modules.
                var defaultImportHandler = (this && this.__importDefault) || function(moduleObj) {
                    return (moduleObj && moduleObj.__esModule) ? moduleObj : { "default": moduleObj };
                };
                Object.defineProperty(moduleExports, "__esModule", { value: true });
                moduleExports.executeProgram = void 0; // Initialize export

                // Import the file system module.
                const fileSystemAccessor = defaultImportHandler(dependencyResolver("fs"));

                // ASCII value for 'a' character.
                const ASCII_A_OFFSET = 97;

                // Recursive function to generate all possible lexicographical strings.
                // It builds strings of a target length, ensuring characters are non-decreasing
                // and within the range defined by the current maximum character used.
                function buildLexicographicalStrings(
                    currentDepth, // Current length of the string being built.
                    upperBoundCharIndex, // The highest character index (0 for 'a', 1 for 'b', etc.) used so far.
                    generationContext // Object containing N (target length), output collection, and current partial string.
                ) {
                    const { targetLength, outputCollection, partialString } = generationContext;

                    // Base case: If the current string has reached the desired length.
                    if (currentDepth === targetLength) {
                        outputCollection.push(partialString); // Add the completed string to the results.
                        return; // Terminate this branch of recursion.
                    }

                    // Iterate through possible characters to append.
                    // The character index 'charIdx' ranges from 0 ('a') up to 'upperBoundCharIndex'.
                    for (let charIdx = 0; charIdx <= upperBoundCharIndex; charIdx++) {
                        // Determine the actual character.
                        const charToAppend = String.fromCharCode(ASCII_A_OFFSET + charIdx);

                        // Calculate the new upper bound for the next recursive call.
                        // If the current character is the highest used so far, the new upper bound
                        // can be one greater (allowing the next character to be 'a', 'b', 'c', or 'd' if current is 'c').
                        // Otherwise, it remains the same.
                        const nextUpperBound = Math.max(upperBoundCharIndex, charIdx + 1);

                        // Recursive call for the next character position.
                        buildLexicographicalStrings(
                            currentDepth + 1, // Increment current string length.
                            nextUpperBound, // Pass the new upper bound.
                            { // Create a new context object for the next level.
                                targetLength: targetLength,
                                outputCollection: outputCollection,
                                partialString: partialString + charToAppend // Append the character.
                            }
                        );
                    }
                }

                // Orchestrates the string generation process based on the input length.
                function processInputAndGenerate({ targetLength }) {
                    // Validate input: ensure targetLength is a positive integer.
                    if (typeof targetLength !== 'number' || !Number.isInteger(targetLength) || targetLength <= 0) {
                        console.error("Invalid targetLength provided. Must be a positive integer.");
                        return []; // Return an empty array for invalid input.
                    }

                    const generatedStrings = []; // Initialize an empty array to store results.
                    // Start the recursive generation process.
                    // Initial call: depth 0, max char index 0 ('a'), empty string.
                    buildLexicographicalStrings(0, 0, {
                        targetLength: targetLength,
                        outputCollection: generatedStrings,
                        partialString: ''
                    });
                    return generatedStrings; // Return the collection of generated strings.
                }

                // The main entry point for the application.
                // Takes a string 'inputLine' as input, typically from stdin.
                function executeProgram(inputLine) {
                    // Attempt to parse the input line into an integer.
                    const desiredLength = parseInt(inputLine, 10);

                    // Perform a basic validation for the parsed number.
                    if (isNaN(desiredLength)) {
                        console.error("Input line could not be parsed as a number.");
                        return; // Exit if parsing failed.
                    }

                    // Generate the strings using the core logic.
                    const finalResults = processInputAndGenerate({ targetLength: desiredLength });

                    // Output each generated string to the console.
                    for (const resultString of finalResults) {
                        console.log(resultString);
                    }
                }
                moduleExports.executeProgram = executeProgram; // Export the main function.

                // This block ensures the program runs when executed directly
                // (i.e., when this module is the main entry point in the webpack context).
                // It checks if the current module is the startup module.
                if (dependencyResolver.moduleCache[dependencyResolver.startupModuleId] === currentModule) {
                    // Read the input from standard input.
                    const stdinContent = fileSystemAccessor.default.readFileSync("/dev/stdin", "utf8");
                    // Call the main program function with the read content.
                    executeProgram(stdinContent);
                }

            }).call(this, dependencyResolver("./node_modules/webpack/buildin/module.js")(currentModule)))
        }),

    // External 'fs' module definition.
    "fs":
        (function(module, exports) {
            module.exports = require("fs");
        })

});