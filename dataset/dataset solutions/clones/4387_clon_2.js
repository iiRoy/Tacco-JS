module.exports = function(moduleDefinitions) {
    // This object serves as a cache for loaded modules.
    var moduleCache = {};

    // The core 'require' function for the bundled modules.
    function localRequire(moduleId) {
        // If the module is already in the cache, return its exports.
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        // If not, create a new module object and store it in the cache.
        // 'i': module ID, 'l': loaded flag, 'exports': the actual exports object.
        var currentModule = moduleCache[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };

        // Execute the module function, passing the module object, its exports, and the localRequire function.
        moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, localRequire);

        // Mark the module as loaded.
        currentModule.l = true;

        // Return the module's exports.
        return currentModule.exports;
    }

    // Store the module definitions array on the require function itself.
    localRequire.m = moduleDefinitions;

    // Store the module cache on the require function.
    localRequire.c = moduleCache;

    // Helper to define a getter function for an export property.
    localRequire.d = function(exportObject, propertyName, getterFunction) {
        // Only define if the property doesn't already exist.
        if (!localRequire.o(exportObject, propertyName)) {
            Object.defineProperty(exportObject, propertyName, {
                enumerable: true, // Make it enumerable.
                get: getterFunction // Use the provided getter.
            });
        }
    };

    // Helper to mark an exports object as an ES module.
    localRequire.r = function(exportObject) {
        // If Symbol and Symbol.toStringTag are available, set the toStringTag.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(exportObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        // Mark as an ES module.
        Object.defineProperty(exportObject, "__esModule", {
            value: true
        });
    };

    // Helper to create a namespace object for a module.
    localRequire.t = function(moduleOrValue, modeFlags) {
        // If modeFlags indicates it's a direct module ID (1), require it.
        if (1 & modeFlags) {
            moduleOrValue = localRequire(moduleOrValue);
        }
        // If modeFlags indicates it's already an object and an ES module (4 & object & __esModule), return it directly.
        if (4 & modeFlags && typeof moduleOrValue === "object" && moduleOrValue && moduleOrValue.__esModule) {
            return moduleOrValue;
        }

        // Otherwise, create a new namespace object.
        var namespaceObject = Object.create(null);
        localRequire.r(namespaceObject); // Mark as ES module.

        // Set the 'default' export to the moduleOrValue.
        Object.defineProperty(namespaceObject, "default", {
            enumerable: true,
            value: moduleOrValue
        });

        // If modeFlags indicates it's a non-string module (2 & not string),
        // copy all properties from the original module to the namespace object.
        if (2 & modeFlags && typeof moduleOrValue !== "string") {
            for (var propKey in moduleOrValue) {
                localRequire.d(namespaceObject, propKey, (function(key) {
                    return moduleOrValue[key];
                }).bind(null, propKey));
            }
        }
        return namespaceObject;
    };

    // Helper to get the default export of a module.
    localRequire.n = function(moduleObject) {
        // If it's an ES module, return a getter for its 'default' export.
        var defaultExportGetter = moduleObject && moduleObject.__esModule ?
            function() {
                return moduleObject.default;
            } :
            function() {
                return moduleObject;
            };
        // Define an 'a' property on the getter that returns the getter itself.
        localRequire.d(defaultExportGetter, "a", defaultExportGetter);
        return defaultExportGetter;
    };

    // Helper to check if an object has a property.
    localRequire.o = function(targetObject, targetProperty) {
        return Object.prototype.hasOwnProperty.call(targetObject, targetProperty);
    };

    // Public path for assets (empty in this case).
    localRequire.p = "";

    // Execute the entry module (module ID 0) and return its exports.
    return localRequire(localRequire.s = 0);
}(
    [
        /* Module 0: Entry Point */
        function(moduleZero, exportsZero, requireZero) {
            // Read input from stdin using fs module (required as module 2),
            // then pass the content to the main logic module (module 1).
            requireZero(1)(requireZero(2).readFileSync("/dev/stdin", "UTF-8"));
        },

        /* Module 1: Main Application Logic */
        function(moduleOne, exportsOne) {
            // This module exports a function that processes the input string.
            moduleOne.exports = function(inputDataString) {
                // Split the input string into lines.
                var inputLines = inputDataString.split("\n");

                // The first line contains the count N.
                var countN = Number(inputLines[0]);

                // The second line contains space-separated numbers, convert them to an array of numbers.
                var numberSequence = inputLines[1].split(" ").map(function(currentStringNum) {
                    return Number(currentStringNum);
                });

                // Initialize counters for the result and a flag for consecutive matches.
                var resultCounter = 0;
                var consecutiveFlag = 0; // 0: not consecutive, 1: consecutive

                // Iterate through the number sequence.
                for (var loopIndex = 0; loopIndex < countN; loopIndex++) {
                    // Check if the current number (1-indexed) matches its index (0-indexed).
                    // i.e., if numberSequence[loopIndex] - 1 === loopIndex
                    if (numberSequence[loopIndex] - 1 === loopIndex) {
                        // If it's a match:
                        if (consecutiveFlag === 1) {
                            // If the previous one was also a match, reset consecutive flag.
                            consecutiveFlag = 0;
                        } else {
                            // If not consecutive, increment result and set consecutive flag.
                            resultCounter += 1;
                            consecutiveFlag = 1;
                        }
                    } else {
                        // If no match, reset consecutive flag.
                        consecutiveFlag = 0;
                    }
                }

                // Output the final result.
                console.log(resultCounter);
            };
        },

        /* Module 2: File System (fs) Module */
        function(moduleTwo, exportsTwo) {
            // This module simply exports the Node.js 'fs' built-in module.
            moduleTwo.exports = require("fs");
        }
    ]
);
