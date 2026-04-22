/*
 * This file represents a bundled JavaScript module system,
 * similar to what Webpack or Browserify might produce.
 * It encapsulates multiple modules and provides a custom
 * 'require' function for inter-module communication.
 */
module.exports = function(programModules) {
    // A cache to store already loaded modules.
    // This prevents redundant execution and ensures singletons.
    var moduleCache = {};

    /**
     * Custom module loader function.
     * Behaves like a 'require' call in Node.js.
     * @param {number} currentModuleId - The ID of the module to load.
     * @returns {object} The exports of the requested module.
     */
    function executeModule(currentModuleId) {
        // If the module is already in the cache, return its exports immediately.
        if (moduleCache[currentModuleId]) {
            return moduleCache[currentModuleId].exports;
        }

        // Create a new module instance and store it in the cache.
        // 'i': module ID, 'l': loaded flag, 'exports': actual exports object.
        var moduleInstance = moduleCache[currentModuleId] = {
            i: currentModuleId,
            l: false,
            exports: {}
        };

        // Execute the module's code within its own context.
        // The 'this' context is set to moduleInstance.exports, and
        // moduleInstance, moduleInstance.exports, and the loader function itself
        // are passed as arguments.
        programModules[currentModuleId].call(
            moduleInstance.exports,
            moduleInstance,
            moduleInstance.exports,
            executeModule
        );

        // Mark the module as loaded.
        moduleInstance.l = true;

        // Return the module's exports.
        return moduleInstance.exports;
    }

    // Attach utility properties and methods to the module loader function.

    // Store the original module definitions array.
    executeModule.moduleDefinitions = programModules;

    // Store the module cache for external access if needed.
    executeModule.cache = moduleCache;

    /**
     * Defines a getter property on an object, used for lazy loading or
     * exposing exports.
     * @param {object} targetObject - The object to define the property on.
     * @param {string} propertyName - The name of the property.
     * @param {function} getterFunction - The function to call when the property is accessed.
     */
    executeModule.defineExport = function(targetObject, propertyName, getterFunction) {
        if (!executeModule.hasProperty(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    /**
     * Marks an object as an ES Module, adding __esModule and Symbol.toStringTag properties.
     * @param {object} targetObject - The object to mark as an ES Module.
     */
    executeModule.registerModule = function(targetObject) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, { value: "Module" });
        }
        Object.defineProperty(targetObject, "__esModule", { value: true });
    };

    /**
     * Handles interop between CommonJS and ES Modules.
     * @param {*} value - The module value.
     * @param {number} mode - Bitmask for interop behavior.
     * @returns {*} The interop-ed module value.
     */
    executeModule.interopRequire = function(value, mode) {
        // If bit 1 is set, treat as CommonJS and load it.
        if (1 & mode) value = executeModule(value);
        // If bit 8 is set, just return the value as is.
        if (8 & mode) return value;
        // If bit 4 is set and it's an ES Module, return it.
        if (4 & mode && typeof value === "object" && value && value.__esModule) return value;

        // Otherwise, create a new object and populate it for interop.
        var interopObject = Object.create(null);
        executeModule.registerModule(interopObject);
        Object.defineProperty(interopObject, "default", { enumerable: true, value: value });
        // If bit 2 is set and not a string, copy all properties.
        if (2 & mode && typeof value !== "string") {
            for (var prop in value) {
                executeModule.defineExport(interopObject, prop, (function(innerProp) {
                    return value[innerProp];
                }).bind(null, prop));
            }
        }
        return interopObject;
    };

    /**
     * Gets the default export of a module or the module itself.
     * @param {*} moduleValue - The module or its exports.
     * @returns {function} A getter function for the module's default export.
     */
    executeModule.getModuleExports = function(moduleValue) {
        var getter = moduleValue && moduleValue.__esModule ?
            function() { return moduleValue.default; } :
            function() { return moduleValue; };
        executeModule.defineExport(getter, "a", getter); // 'a' is a common alias for default export getter
        return getter;
    };

    /**
     * Checks if an object has a specific property using Object.prototype.hasOwnProperty.call.
     * @param {object} targetObject - The object to check.
     * @param {string} propertyKey - The property name.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    executeModule.hasProperty = function(targetObject, propertyKey) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
    };

    // Public path for assets (often an empty string in simple bundles).
    executeModule.publicPath = "";

    // Set the startup module ID and immediately execute it to kick off the application.
    return executeModule(executeModule.startupModule = 0);

}([
    /* Module 0: Entry point for the application logic. */
    function(mod, exp, getMod) {
        // Load Module 1, passing the result of processing stdin data.
        // Module 2 is 'fs', used to read stdin.
        getMod(1)(getMod(2).readFileSync("/dev/stdin", "UTF-8").split("\n"));
    },

    /* Module 1: Contains the main algorithm for processing input lines. */
    function(component, output) {
        /**
         * Helper function to safely destructure an iterable into an array.
         * Handles non-array iterables and ensures a specific number of elements.
         * @param {*} inputArray - The iterable to destructure.
         * @param {number} [sliceLimit] - Optional, the maximum number of elements to extract.
         * @returns {Array} An array of the destructured elements.
         * @throws {TypeError} If the input is not iterable and cannot be destructured.
         */
        function destructureArray(inputArray, sliceLimit) {
            // Case 1: Already an array.
            if (Array.isArray(inputArray)) {
                return inputArray;
            }

            // Case 2: Iterable (e.g., Set, Map, String, custom iterator).
            // This complex block handles iteration and potential errors.
            var slicedParts = [];
            var stillIterating = true;
            var hadError = false;
            var errorValue = undefined;
            try {
                // Get the iterator from the input array.
                for (
                    var currentIterItem, iterator = inputArray[Symbol.iterator]();
                    !(stillIterating = (currentIterItem = iterator.next()).done) &&
                    (slicedParts.push(currentIterItem.value), !sliceLimit || slicedParts.length !== sliceLimit);
                    stillIterating = true
                ) {}
            } catch (err) {
                hadError = true;
                errorValue = err;
            } finally {
                // Ensure the iterator is closed if it has a return method.
                try {
                    if (!stillIterating && iterator["return"] != null) {
                        iterator["return"]();
                    }
                } finally {
                    if (hadError) {
                        throw errorValue;
                    }
                }
            }
            return slicedParts;
        }

        // Export the main logic function for this module.
        component.exports = function(dataRows) {
            // Parse the first line of input: two numbers.
            // Convert string numbers to actual numbers.
            var parsedValues = destructureArray(dataRows[0].split(" ").map(function(numStr) {
                return Number(numStr);
            }), 2);

            var firstNum = parsedValues[0]; // N
            var secondNum = parsedValues[1]; // K

            // Parse the second line of input: a sequence of numbers.
            var numberSequence = dataRows[1].split(" ").map(function(numStr) {
                return Number(numStr);
            });

            // Sort the sequence in ascending order.
            numberSequence.sort(function(valA, valB) {
                return valA - valB;
            });

            // Initialize flags for checking conditions.
            var hasNonDivisible = false; // True if any number is not divisible by the first number in sequence.
            var hasGreaterValue = false; // True if any number is greater than K.

            // Iterate through the sorted sequence.
            for (var idx = 0; idx < firstNum; idx++) {
                // Check if it's not the first element and not divisible by the first element.
                if (idx != 0 && numberSequence[idx] % numberSequence[0] != 0) {
                    hasNonDivisible = true;
                }
                // Check if the current number is greater than K.
                if (numberSequence[idx] > secondNum) {
                    hasGreaterValue = true;
                }
                // If a number exactly equals K, it's always possible.
                if (numberSequence[idx] == secondNum) {
                    return void console.log("POSSIBLE");
                }
            }

            // Determine the final outcome based on the flags.
            if (hasNonDivisible && hasGreaterValue) {
                console.log("POSSIBLE");
            } else {
                console.log("IMPOSSIBLE");
            }
        };
    },

    /* Module 2: Simply exports the Node.js 'fs' (file system) module. */
    function(modDef, expDef) {
        modDef.exports = require("fs");
    }
]);