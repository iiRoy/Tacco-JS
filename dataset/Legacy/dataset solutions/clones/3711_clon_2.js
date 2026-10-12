module.exports = function(moduleDefinitions) {
    // This object serves as a cache for modules that have already been loaded.
    var moduleCache = {};

    // The primary function responsible for loading and returning modules.
    function moduleLoader(moduleId) {
        // If the requested module is already in the cache, return its exports immediately.
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        // If not in cache, create a new module object and store it.
        // 'i': The unique identifier for the module.
        // 'l': A boolean flag indicating if the module has been loaded (false initially).
        // 'exports': The object that will hold the module's exported values.
        var currentModule = moduleCache[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };

        // Execute the module's definition function.
        // The 'call' method sets 'this' to 'currentModule.exports' and passes
        // 'currentModule', 'currentModule.exports', and 'moduleLoader' as arguments.
        moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, moduleLoader);

        // Mark the module as loaded after its definition function has executed.
        currentModule.l = true;

        // Return the exports of the newly loaded module.
        return currentModule.exports;
    }

    // Attach the module definitions to the loader for internal access.
    moduleLoader.m = moduleDefinitions;

    // Attach the module cache to the loader for internal access.
    moduleLoader.c = moduleCache;

    // Helper function to define a getter property on an object.
    // This is often used for ES module interop to expose named exports.
    moduleLoader.d = function(targetObject, propertyName, getterFunction) {
        // Only define the property if it doesn't already exist on the target object.
        if (!moduleLoader.o(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make the property enumerable.
                get: getterFunction // Use the provided function as a getter.
            });
        }
    };

    // Helper function to mark an object as an ES module.
    // This adds '__esModule: true' and potentially 'Symbol.toStringTag: "Module"'.
    moduleLoader.r = function(targetObject) {
        // If Symbol and Symbol.toStringTag are available, set the toStringTag.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        // Always set the '__esModule' flag to true.
        Object.defineProperty(targetObject, '__esModule', {
            value: true
        });
    };

    // Helper function to create a namespace object for a module.
    // This handles different module export patterns (e.g., CommonJS, ES Modules).
    moduleLoader.t = function(moduleExports, modeFlags) {
        // If modeFlags has bit 1 set, 'moduleExports' is a module ID, so load it.
        if (modeFlags & 1) {
            moduleExports = moduleLoader(moduleExports);
        }
        // If modeFlags has bit 8 set, return 'moduleExports' directly.
        if (modeFlags & 8) {
            return moduleExports;
        }
        // If modeFlags has bit 4 set, and 'moduleExports' is an object and an ES module, return it directly.
        if (modeFlags & 4 && typeof moduleExports === 'object' && moduleExports && moduleExports.__esModule) {
            return moduleExports;
        }

        // Create a new plain object to serve as the namespace.
        var namespaceObject = Object.create(null);
        // Mark this new object as an ES module.
        moduleLoader.r(namespaceObject);
        // Define a 'default' property on the namespace, pointing to the original module exports.
        Object.defineProperty(namespaceObject, 'default', {
            enumerable: true,
            value: moduleExports
        });
        // If modeFlags has bit 2 set and 'moduleExports' is not a string,
        // copy all properties from 'moduleExports' to the 'namespaceObject'.
        if (modeFlags & 2 && typeof moduleExports !== 'string') {
            for (var propName in moduleExports) {
                moduleLoader.d(namespaceObject, propName, (function(key) {
                    return moduleExports[key];
                }).bind(null, propName));
            }
        }
        return namespaceObject;
    };

    // Helper function to get the default export of a module.
    moduleLoader.n = function(moduleExports) {
        // Determine the getter function based on whether 'moduleExports' is an ES module.
        var defaultGetter = moduleExports && moduleExports.__esModule ?
            function() {
                return moduleExports.default;
            } :
            function() {
                return moduleExports;
            };
        // Define an 'a' property on the getter, which also points to the getter itself.
        // This is a common convention for accessing the default export.
        moduleLoader.d(defaultGetter, 'a', defaultGetter);
        return defaultGetter;
    };

    // Helper function to check if an object has a specific property directly (not inherited).
    moduleLoader.o = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    // The public path for loading assets (empty string in this configuration).
    moduleLoader.p = "";

    // Set the startup module ID (0 in this case) and then load it.
    // The result of loading the startup module is returned as the bundle's export.
    return moduleLoader(moduleLoader.s = 0);

}([
    // Module 0: The entry point of the application.
    function(moduleObj, moduleExports, localRequire) {
        // This module reads input from standard input, splits it by newlines,
        // and then passes the resulting array of strings to Module 1 for processing.
        localRequire(1)(localRequire(2).readFileSync("/dev/stdin", "UTF-8").split("\n"));
    },

    // Module 1: Contains the core application logic to solve the problem.
    function(moduleObj, moduleExports) {
        moduleObj.exports = function(inputLines) {
            // The first line of input contains the count N.
            var dataCount = Number(inputLines[0]);

            // The second line contains space-separated numbers, which are parsed into an array.
            var originalNumbers = inputLines[1].split(" ").map(function(strValue) {
                return Number(strValue);
            });

            // Create a new array 'transformedValues' of size N, initialized with zeros.
            var transformedValues = new Array(dataCount).fill(0);

            // Populate 'transformedValues' where each element is A[i] - i - 1.
            for (var currentIdx = 0; currentIdx < dataCount; currentIdx++) {
                transformedValues[currentIdx] = originalNumbers[currentIdx] - currentIdx - 1;
            }

            // Sort the 'transformedValues' array in ascending numerical order.
            transformedValues.sort(function(firstVal, secondVal) {
                return firstVal - secondVal;
            });

            // Calculate the median value of the sorted 'transformedValues' array.
            // If N is even, the median is the average of the two middle elements.
            // If N is odd, the median is the single middle element.
            var calculatedMedian = 0;
            calculatedMedian = (dataCount % 2 === 0) ?
                (transformedValues[dataCount / 2 - 1] + transformedValues[dataCount / 2]) / 2 :
                transformedValues[Math.floor(dataCount / 2)];

            // Calculate the sum of absolute differences between each element
            // in 'transformedValues' and the 'calculatedMedian'.
            var totalAbsoluteDeviation = 0;
            for (var loopCounter = 0; loopCounter < dataCount; loopCounter++) {
                totalAbsoluteDeviation += Math.abs(transformedValues[loopCounter] - calculatedMedian);
            }

            // Print the final calculated sum to the console.
            console.log(totalAbsoluteDeviation);
        };
    },

    // Module 2: Provides access to Node.js's built-in 'fs' (file system) module.
    function(moduleObj, moduleExports) {
        moduleObj.exports = require("fs");
    }
]);
