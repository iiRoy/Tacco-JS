module.exports = function(moduleDefinitions) {
    // This object serves as a cache for modules that have already been loaded.
    var loadedModules = {};

    // The core function responsible for loading and executing modules.
    function moduleLoader(currentModuleId) {
        // If the module is already in the cache, return its exports immediately.
        if (loadedModules[currentModuleId]) {
            return loadedModules[currentModuleId].exports;
        }

        // If not cached, create a new module instance and store it.
        // 'i' stores the module ID, 'l' indicates if it's loaded, 'exports' holds its public interface.
        var moduleInstance = loadedModules[currentModuleId] = {
            i: currentModuleId,
            l: false,
            exports: {}
        };

        // Execute the module's definition function.
        // It receives the module object, its exports, and the loader itself (for internal 'require' calls).
        moduleDefinitions[currentModuleId].call(
            moduleInstance.exports,
            moduleInstance,
            moduleInstance.exports,
            moduleLoader
        );

        // Mark the module as loaded after execution.
        moduleInstance.l = true;

        // Return the module's exports.
        return moduleInstance.exports;
    }

    // Attach the original module definitions and the cache to the loader for internal access.
    moduleLoader.moduleMap = moduleDefinitions;
    moduleLoader.cache = loadedModules;

    // Helper function to define a getter property on an object.
    // This is used for lazy loading or creating read-only properties.
    moduleLoader.define = function(targetObj, propName, getterFn) {
        // Only define if the property doesn't already exist.
        if (!moduleLoader.hasOwn(targetObj, propName)) {
            Object.defineProperty(targetObj, propName, {
                enumerable: true, // Make the property enumerable.
                get: getterFn     // Assign the getter function.
            });
        }
    };

    // Helper function to mark an exports object as an ES module.
    // This adds '__esModule: true' and potentially 'Symbol.toStringTag: "Module"'.
    moduleLoader.register = function(exportsObj) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(exportsObj, Symbol.toStringTag, { value: "Module" });
        }
        Object.defineProperty(exportsObj, "__esModule", { value: true });
    };

    // Helper function for handling interoperability between CommonJS and ES modules.
    // It ensures a consistent default export structure.
    moduleLoader.interopDefault = function(moduleToProcess, flagBits) {
        // If flagBits indicates it's a direct module ID, load it first.
        if (1 & flagBits) {
            moduleToProcess = moduleLoader(moduleToProcess);
        }
        // If flagBits indicates it's an object and already an ES module, return it as is.
        if (4 & flagBits && typeof moduleToProcess === "object" && moduleToProcess && moduleToProcess.__esModule) {
            return moduleToProcess;
        }

        // Create a new object to represent the default export.
        var newDefaultExport = Object.create(null);
        moduleLoader.register(newDefaultExport); // Mark it as an ES module.
        Object.defineProperty(newDefaultExport, "default", { enumerable: true, value: moduleToProcess });

        // If flagBits indicates to copy all properties from the original module, do so.
        if (2 & flagBits && typeof moduleToProcess !== "string") {
            for (var keyName in moduleToProcess) {
                // Define getters for each property to ensure lazy access.
                moduleLoader.define(newDefaultExport, keyName, (function(originalKey) {
                    return moduleToProcess[originalKey];
                }).bind(null, keyName));
            }
        }
        return newDefaultExport;
    };

    // Helper function to create a getter for a module's exports,
    // primarily used for `__esModule` checks and default export access.
    moduleLoader.namespaceGetter = function(moduleExportsObj) {
        var exportGetter = moduleExportsObj && moduleExportsObj.__esModule ?
            function() { return moduleExportsObj.default; } : // If it's an ES module, return its 'default'.
            function() { return moduleExportsObj; };          // Otherwise, return the module itself.
        moduleLoader.define(exportGetter, "a", exportGetter); // Attach the getter as property 'a'.
        return exportGetter;
    };

    // Helper function to check if an object has a specific property directly (not inherited).
    moduleLoader.hasOwn = function(objectToCheck, propertyKey) {
        return Object.prototype.hasOwnProperty.call(objectToCheck, propertyKey);
    };

    // The public path for assets (empty in this configuration).
    moduleLoader.publicPath = "";

    // Set the entry point module ID and immediately load it to start the application.
    return moduleLoader(moduleLoader.startupModule = 0);

}([ // This array contains the definitions for all modules in the bundle.

    // Module 0: The application's entry point.
    function(module0Exports, module0Require, module0Context) {
        // This module loads module 1 and executes it with processed input from stdin.
        module0Context(1)(
            module0Context(2) // Load module 2 (which exports 'fs').
                .readFileSync("/dev/stdin", "UTF-8") // Read input from standard input.
                .split("\n") // Split the input into an array of lines.
        );
    },

    // Module 1: Contains the core logic to calculate the minimum absolute deviation.
    function(module1Exports, module1Require) {
        module1Exports.exports = function(inputDataLines) {
            // The first line of input specifies the array length.
            var arrayLength = Number(inputDataLines[0]);
            // The second line contains space-separated numbers, which are parsed into an array.
            var numericValues = inputDataLines[1].split(" ").map(function(valStr) {
                return Number(valStr);
            });

            // Create a new array to store values adjusted by their index.
            var adjustedValues = new Array(arrayLength).fill(0);

            // Adjust each number: original_value - its_index - 1.
            for (var loopCounter = 0; loopCounter < arrayLength; loopCounter++) {
                adjustedValues[loopCounter] = numericValues[loopCounter] - loopCounter - 1;
            }

            // Sort the adjusted values in ascending order.
            adjustedValues.sort(function(valueA, valueB) {
                return valueA - valueB;
            });

            // Calculate the median of the sorted adjusted values.
            var calculatedMedian = 0;
            if (arrayLength % 2 === 0) {
                // If the array has an even number of elements, the median is the average of the two middle elements.
                calculatedMedian = adjustedValues[arrayLength / 2 - 1] + adjustedValues[arrayLength / 2];
            } else {
                // If odd, the median is the single middle element.
                calculatedMedian = adjustedValues[Math.floor(arrayLength / 2)];
            }

            // Calculate the total absolute deviation from the median.
            var totalAbsoluteDeviation = 0;
            for (var iterationIndex = 0; iterationIndex < arrayLength; iterationIndex++) {
                totalAbsoluteDeviation += Math.abs(adjustedValues[iterationIndex] - calculatedMedian);
            }

            // Print the final calculated total absolute deviation to the console.
            console.log(totalAbsoluteDeviation);
        };
    },

    // Module 2: Simply exports the Node.js 'fs' (file system) module.
    function(module2Exports, module2Require) {
        module2Exports.exports = require("fs");
    }
]);
