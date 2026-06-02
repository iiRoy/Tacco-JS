module.exports = function(moduleDefinitions) {
    // This object serves as a cache for modules that have already been loaded.
    var moduleCache = {};

    // The central function responsible for loading and caching modules.
    function moduleLoader(moduleId) {
        // If the requested module is already in the cache, return its exports immediately.
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        // If not cached, create a new module object and store it in the cache.
        // This object holds the module's unique ID, a loaded status, and its exports.
        var currentModule = moduleCache[moduleId] = {
            identifier: moduleId, // The unique identifier for this module.
            isLoaded: false,      // A flag indicating whether the module's code has been executed.
            exports: {}           // The object that will hold the module's exported values.
        };

        // Execute the module's definition function.
        // It receives the module object, its exports, and the moduleLoader itself (for nested requires).
        moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, moduleLoader);

        // After execution, mark the module as loaded.
        currentModule.isLoaded = true;

        // Return the module's exports.
        return currentModule.exports;
    }

    // Attach the array of module definitions to the loader for internal use.
    moduleLoader.moduleMap = moduleDefinitions;

    // Attach the module cache to the loader.
    moduleLoader.cache = moduleCache;

    // A utility function to define a getter for harmony exports (ES module compatibility).
    // It ensures that a property is defined on the export object with a specified getter.
    moduleLoader.defineGetter = function(exportObject, propertyName, getterFunction) {
        // Only define if the property doesn't already exist on the object.
        if (!moduleLoader.hasOwn(exportObject, propertyName)) {
            Object.defineProperty(exportObject, propertyName, {
                enumerable: true,    // Make the property visible during enumeration.
                get: getterFunction  // The function to call when the property is accessed.
            });
        }
    };

    // A utility function to mark an export object as an ES module.
    moduleLoader.markAsEsModule = function(exportObject) {
        // If Symbol.toStringTag is supported, set it for better module identification.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(exportObject, Symbol.toStringTag, { value: "Module" });
        }
        // Explicitly mark the object as an ES module.
        Object.defineProperty(exportObject, "__esModule", { value: true });
    };

    // A utility function to create a fake namespace object for module compatibility.
    // 'modeFlags' controls how the namespace is constructed:
    //   & 1: If set, 'moduleOrId' is a module ID and needs to be loaded first.
    //   & 8: If set, 'moduleOrId' is already a namespace object, return it directly.
    //   & 4: If set, and 'moduleOrId' is an ES module object, return it directly.
    //   & 2: If set, merge all properties from 'moduleOrId' into the new namespace.
    moduleLoader.createNamespace = function(moduleOrId, modeFlags) {
        // If mode 1 is active, load the module by its ID.
        if (1 & modeFlags) {
            moduleOrId = moduleLoader(moduleOrId);
        }
        // If mode 8 is active, the input is already a namespace, so return it.
        if (8 & modeFlags) {
            return moduleOrId;
        }
        // If mode 4 is active and it's an existing ES module object, return it.
        if (4 & modeFlags && typeof moduleOrId === "object" && moduleOrId && moduleOrId.__esModule) {
            return moduleOrId;
        }

        // Create a new, empty object to serve as the namespace.
        var namespaceObject = Object.create(null);
        // Mark this new object as an ES module.
        moduleLoader.markAsEsModule(namespaceObject);
        // Define a 'default' export property pointing to the original module or its value.
        Object.defineProperty(namespaceObject, "default", { enumerable: true, value: moduleOrId });

        // If mode 2 is active and the module is not a string, merge its properties.
        if (2 & modeFlags && typeof moduleOrId !== "string") {
            for (var propKey in moduleOrId) {
                // Define a getter for each property to lazily access its value from the original module.
                moduleLoader.defineGetter(namespaceObject, propKey, (function(propNameForGetter) {
                    return function() { return moduleOrId[propNameForGetter]; };
                }).bind(null, propKey));
            }
        }
        return namespaceObject;
    };

    // A utility function to get the default export for compatibility with non-ES modules.
    moduleLoader.getDefaultExport = function(moduleToWrap) {
        // Determine the appropriate getter function:
        // If it's an ES module, return its 'default' export. Otherwise, return the module itself.
        var defaultExportGetter = moduleToWrap && moduleToWrap.__esModule ?
            function() { return moduleToWrap.default; } :
            function() { return moduleToWrap; };
        // Define an 'a' property on the getter function itself, pointing to itself.
        moduleLoader.defineGetter(defaultExportGetter, "a", defaultExportGetter);
        return defaultExportGetter;
    };

    // A utility function that wraps Object.prototype.hasOwnProperty.call.
    moduleLoader.hasOwn = function(targetObject, keyToCheck) {
        return Object.prototype.hasOwnProperty.call(targetObject, keyToCheck);
    };

    // The public path for assets, typically used for dynamic imports or asset loading.
    moduleLoader.publicPath = "";

    // Set the startup module ID (entry point) and load it.
    // The exports of the entry module are returned by the main IIFE.
    return moduleLoader(moduleLoader.startupModuleId = 0);

}([ // This array contains all the module definitions.

    /* Module 0: The primary entry point of the application. */
    function(moduleZeroExports, moduleZeroModule, moduleZeroRequire) {
        // This module reads input from standard input, processes it, and then logs a result.
        // It first loads module 2 (Node.js 'fs' module) to read the file.
        // Then it reads from '/dev/stdin' (standard input), decodes it as UTF-8,
        // splits the content by newline characters, and passes the resulting array
        // of lines to the function exported by module 1.
        moduleZeroRequire(1)(moduleZeroRequire(2).readFileSync("/dev/stdin", "UTF-8").split("\n"));
    },

    /* Module 1: Contains the core logic for processing the input string. */
    function(moduleOneExports, moduleOneModule) {
        // The main processing function is assigned to module.exports.
        moduleOneExports.exports = function(inputLines) {
            // Extract the first line from the input array.
            var firstLine = inputLines[0];
            // Get the total number of characters in the first line.
            var lineLength = firstLine.length;
            // Initialize a variable to keep track of the final score.
            var scoreCounter = 0;
            // Initialize a variable to track the balance of 'p' and 'g' characters.
            var balanceTracker = 0;

            // Iterate through each character of the first line.
            for (var charIndex = 0; charIndex < lineLength; charIndex++) {
                // If the balance tracker is positive, it means we have 'p's that need matching.
                if (balanceTracker > 0) {
                    // If the current character is 'g', it matches a 'p', so increment score.
                    if (firstLine[charIndex] === "g") {
                        scoreCounter++;
                    }
                    // In this state, always decrement the balance tracker.
                    balanceTracker--;
                } else {
                    // If the balance tracker is zero or negative, we are looking for 'p's.
                    // If the current character is 'p', it means we've found one, so decrement score.
                    if (firstLine[charIndex] === "p") {
                        scoreCounter--;
                    }
                    // In this state, always increment the balance tracker.
                    balanceTracker++;
                }
            }
            // Output the final calculated score to the console.
            console.log(scoreCounter);
        };
    },

    /* Module 2: Provides access to the Node.js 'fs' (file system) module. */
    function(moduleTwoExports, moduleTwoModule) {
        // This module simply exports the Node.js built-in 'fs' module.
        moduleTwoExports.exports = require("fs");
    }
]);
