module.exports = function(moduleDefinitions) {
    // This object serves as a cache for already loaded modules.
    var moduleCache = {};

    // The primary function responsible for loading and executing modules.
    function moduleLoader(moduleId) {
        // If the module is already in our cache, return its exported values.
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        // If not cached, create a new module object and store it.
        var moduleObject = moduleCache[moduleId] = {
            id: moduleId, // The unique identifier for this module.
            loaded: false, // Flag to indicate if the module has finished loading.
            exports: {} // The object where the module's exports will be stored.
        };

        // Execute the module's definition function.
        // 'this' context is moduleObject.exports, and it receives moduleObject, moduleObject.exports, and the moduleLoader itself.
        moduleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, moduleLoader);

        // Mark the module as fully loaded.
        moduleObject.loaded = true;

        // Return the module's exports.
        return moduleObject.exports;
    }

    // Attach the array of module definitions to the loader for internal use.
    moduleLoader.moduleDefinitions = moduleDefinitions;

    // Attach the module cache to the loader.
    moduleLoader.cache = moduleCache;

    // Helper function to define a getter property on an object, ensuring it's enumerable.
    moduleLoader.defineGetter = function(exportObject, propertyName, getterFunction) {
        // Only define if the property doesn't already exist on the object.
        if (!moduleLoader.hasOwnProperty(exportObject, propertyName)) {
            Object.defineProperty(exportObject, propertyName, {
                enumerable: true, // Make the property visible during enumeration.
                get: getterFunction // The function to call when the property is accessed.
            });
        }
    };

    // Helper function to mark an exports object as an ECMAScript module.
    moduleLoader.markAsEsModule = function(exportObject) {
        // If Symbol and Symbol.toStringTag are available, set the module's string tag.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(exportObject, Symbol.toStringTag, { value: "Module" });
        }
        // Set the __esModule flag to true, indicating it's an ES module.
        Object.defineProperty(exportObject, "__esModule", { value: true });
    };

    // Helper function to create a namespace object for a module, handling different import modes.
    moduleLoader.createNamespaceObject = function(moduleRef, modeFlags) {
        // Mode 1: If moduleRef is an ID, resolve it using the moduleLoader.
        if (1 & modeFlags) {
            moduleRef = moduleLoader(moduleRef);
        }
        // Mode 8: If moduleRef is already the direct export, return it.
        if (8 & modeFlags) {
            return moduleRef;
        }
        // Mode 4: If moduleRef is an object and already an ES module, return it.
        if (4 & modeFlags && typeof moduleRef === "object" && moduleRef && moduleRef.__esModule) {
            return moduleRef;
        }

        // Create a new plain object to serve as the namespace.
        var namespaceObject = Object.create(null);
        // Mark it as an ES module.
        moduleLoader.markAsEsModule(namespaceObject);
        // Define a 'default' export pointing to the original moduleRef.
        Object.defineProperty(namespaceObject, "default", { enumerable: true, value: moduleRef });

        // Mode 2: If moduleRef is not a string, iterate its properties and define getters on the namespace.
        if (2 & modeFlags && typeof moduleRef !== "string") {
            for (var propKey in moduleRef) {
                // Use an IIFE to capture 'propKey' for the getter function.
                moduleLoader.defineGetter(namespaceObject, propKey, (function(key) {
                    return function() { return moduleRef[key]; };
                })(propKey));
            }
        }
        return namespaceObject;
    };

    // Helper function to get the default export from a module, handling both ES and CommonJS modules.
    moduleLoader.getDefaultExport = function(moduleRef) {
        // If the module has an __esModule flag, its default export is moduleRef.default; otherwise, it's moduleRef itself.
        var defaultGetter = moduleRef && moduleRef.__esModule ?
            function() { return moduleRef.default; } :
            function() { return moduleRef; };
        // Define an 'a' property on the getter function that returns the getter itself (for compatibility).
        moduleLoader.defineGetter(defaultGetter, "a", defaultGetter);
        return defaultGetter;
    };

    // Helper function to check if an object has a specific property directly (not inherited).
    moduleLoader.hasOwnProperty = function(targetObject, propertyKey) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
    };

    // The public path for assets (empty in this configuration).
    moduleLoader.publicPath = "";

    // Set the entry module ID and immediately load it to start the application.
    return moduleLoader(moduleLoader.entryModuleId = 0);
}([ // Array containing all module definitions.

    // Module 0: The application's entry point.
    function(moduleInstance, moduleExports, localRequire) {
        // This module reads from standard input, processes it using module 1, and prints the result.
        localRequire(1)(localRequire(2).readFileSync("/dev/stdin", "UTF-8"));
    },

    // Module 1: Contains the core logic for processing the input string.
    function(moduleInstance, moduleExports) {
        // This function calculates the minimum segment length based on character changes.
        moduleExports.default = function(inputString) {
            // Extract the first line from the input string.
            var firstLine = inputString.split("\n")[0];
            // Determine the total length of the first line.
            var lineLength = firstLine.length;
            // Initialize the minimum segment length to the full line length.
            var minSegmentLength = lineLength;
            // Store the first character for comparison.
            var currentChar = firstLine[0];

            // Iterate through the line, starting from the second character.
            for (var charIndex = 1; charIndex < lineLength; charIndex++) {
                // If the current character is different from the previous one, a segment boundary is found.
                if (currentChar !== firstLine[charIndex]) {
                    // Calculate the length of the current segment, considering both ends of the string.
                    var currentSegmentLength = Math.max(charIndex, lineLength - charIndex);
                    // If this segment length is smaller than the current minimum, update the minimum.
                    if (currentSegmentLength < minSegmentLength) {
                        minSegmentLength = currentSegmentLength;
                    }
                    // Update the current character for the next iteration.
                    currentChar = firstLine[charIndex];
                }
            }
            // Output the calculated minimum segment length to the console.
            console.log(minSegmentLength);
        };
    },

    // Module 2: Exports the Node.js 'fs' (file system) module.
    function(moduleInstance, moduleExports) {
        // This module simply makes the 'fs' module available to other parts of the application.
        moduleExports.default = require("fs");
    }
]);
