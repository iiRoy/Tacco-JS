/* This module serves as a custom JavaScript module loader, similar to Webpack's runtime. */
module.exports = function(moduleDefinitions) {
    /* Cache for already loaded modules. */
    var loadedModuleCache = {};

    /**
     * The core module loading function.
     * It checks the cache, creates a new module object if not found,
     * executes the module's definition, and stores it in the cache.
     * @param {number} moduleId - The ID of the module to load.
     * @returns {object} The exports of the loaded module.
     */
    function moduleLoader(moduleId) {
        // If module is already in cache, return its exports
        if (loadedModuleCache[moduleId]) {
            return loadedModuleCache[moduleId].exports;
        }

        // Create a new module object and store it in the cache
        var currentModuleObject = loadedModuleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };

        // Execute the module definition function
        // (this is where the module's actual code runs)
        moduleDefinitions[moduleId].call(currentModuleObject.exports, currentModuleObject, currentModuleObject.exports, moduleLoader);

        // Mark the module as loaded
        currentModuleObject.loaded = true;

        // Return the module's exports
        return currentModuleObject.exports;
    }

    /* Store the array of module definitions. */
    moduleLoader.moduleMap = moduleDefinitions;

    /* Store a reference to the module cache. */
    moduleLoader.cache = loadedModuleCache;

    /**
     * Defines a non-enumerable property on an object if it doesn't already exist.
     * Used for defining getters for module exports.
     * @param {object} targetObject - The object to define the property on.
     * @param {string} propertyName - The name of the property.
     * @param {function} getterFunction - The getter function for the property.
     */
    moduleLoader.defineProp = function(targetObject, propertyName, getterFunction) {
        if (!moduleLoader.hasOwn(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    /**
     * Marks a module's exports object as an ES Module.
     * This adds '__esModule: true' and potentially 'Symbol.toStringTag: "Module"'.
     * @param {object} moduleExports - The exports object to mark.
     */
    moduleLoader.markAsESM = function(moduleExports) {
        if ("undefined" !== typeof Symbol && Symbol.toStringTag) {
            Object.defineProperty(moduleExports, Symbol.toStringTag, { value: "Module" });
        }
        Object.defineProperty(moduleExports, "__esModule", { value: true });
    };

    /**
     * Compatibility function for interoperability between CommonJS and ES Modules.
     * Handles various scenarios for default exports.
     * @param {*} inputValue - The module's value or exports.
     * @param {number} modeFlags - Flags indicating how to interpret the input.
     * @returns {*} The processed module value.
     */
    moduleLoader.interopDefault = function(inputValue, modeFlags) {
        // If modeFlags indicates a direct module, load it
        if (1 & modeFlags) {
            inputValue = moduleLoader(inputValue);
        }
        // If modeFlags indicates an object and it's an ES Module, return it directly
        if (8 & modeFlags) {
            return inputValue;
        }
        if (4 & modeFlags && "object" === typeof inputValue && inputValue && inputValue.__esModule) {
            return inputValue;
        }

        // Otherwise, create a new object and set the default export
        var newObject = Object.create(null);
        moduleLoader.markAsESM(newObject);
        Object.defineProperty(newObject, "default", { enumerable: true, value: inputValue });

        // If modeFlags indicates string and not a string, copy all properties
        if (2 & modeFlags && "string" !== typeof inputValue) {
            for (var propName in inputValue) {
                moduleLoader.defineProp(newObject, propName, function(currentProp) {
                    return inputValue[currentProp];
                }.bind(null, propName));
            }
        }
        return newObject;
    };

    /**
     * Creates a getter function for module exports, handling default exports.
     * @param {object} exportsObject - The module's exports object.
     * @returns {function} A getter that returns the default export or the entire module.
     */
    moduleLoader.createDefaultGetter = function(exportsObject) {
        var defaultGetter = exportsObject && exportsObject.__esModule ?
            function() { return exportsObject.default; } :
            function() { return exportsObject; };
        moduleLoader.defineProp(defaultGetter, "a", defaultGetter);
        return defaultGetter;
    };

    /**
     * Checks if an object has a specific property as its own property.
     * @param {object} checkObject - The object to check.
     * @param {string} checkProperty - The property name to check for.
     * @returns {boolean} True if the property exists as an own property, false otherwise.
     */
    moduleLoader.hasOwn = function(checkObject, checkProperty) {
        return Object.prototype.hasOwnProperty.call(checkObject, checkProperty);
    };

    /* The public path for loading assets, currently empty. */
    moduleLoader.publicPath = "";

    // Load the entry module (module with ID 0) to start the application
    return moduleLoader(moduleLoader.startupModuleId = 0);
}(
    [
        /* Module 0: Main application logic. */
        function(moduleRef, moduleExports, loaderFunc) {
            // Load module 1, then execute it with the result of module 2's readFileSync
            loaderFunc(1)(
                loaderFunc(2)
                .readFileSync("/dev/stdin", "UTF-8")
                .split("\n")
            );
        },

        /* Module 1: Implements the Greatest Common Divisor (GCD) algorithm. */
        function(modRef, modExports) {
            /**
             * Helper function to safely destructure an iterable.
             * Provides fallbacks for non-array/non-iterable inputs.
             * @param {Iterable} inputIterable - The iterable to destructure.
             * @param {number} [limitCount] - Optional limit to the number of items to extract.
             * @returns {Array} An array containing the extracted elements.
             * @throws {TypeError} If the input is not iterable and cannot be destructured.
             */
            function extractParts(inputIterable, limitCount) {
                if (Array.isArray(inputIterable)) {
                    return inputIterable;
                }

                // Fallback for non-array iterables
                var resultArray = [];
                var isDone = true;
                var hasError = false;
                var errorInstance = undefined;
                try {
                    for (
                        var currentItem, dataIterator = inputIterable[Symbol.iterator]();
                        !(isDone = (currentItem = dataIterator.next()).done) &&
                        (resultArray.push(currentItem.value), !limitCount || resultArray.length !== limitCount);
                        isDone = true
                    ) {}
                } catch (err) {
                    hasError = true;
                    errorInstance = err;
                } finally {
                    try {
                        if (!isDone && null != dataIterator.return) {
                            dataIterator.return();
                        }
                    } finally {
                        if (hasError) {
                            throw errorInstance;
                        }
                    }
                }
                return resultArray;
            }

            // Export the main logic for processing input and calculating GCD
            modRef.exports = function(inputLines) {
                // Parse the first line of input into two numbers
                var parsedNumbers = extractParts(
                    inputLines[0]
                    .split(" ")
                    .map(function(numString) {
                        return Number(numString);
                    }),
                    2
                );

                var firstNum = parsedNumbers[0];
                var secondNum = parsedNumbers[1];

                // Implement the Euclidean algorithm to find GCD
                // `currentQuotient` initially holds the quotient, then becomes the GCD
                // `currentRemainder` initially holds the remainder, then becomes the divisor
                var currentQuotient = Math.floor(secondNum / firstNum);
                var currentRemainder = secondNum % firstNum;

                // Loop until the remainder is zero
                while (currentRemainder > 0) {
                    var tempRemainder = currentRemainder; // Store current remainder
                    currentRemainder = currentQuotient % currentRemainder; // New remainder is quotient % old_remainder
                    currentQuotient = tempRemainder; // New quotient is old remainder
                }

                // Log the final GCD to the console
                console.log(currentQuotient);
            };
        },

        /* Module 2: Provides access to the Node.js 'fs' (file system) module. */
        function(modHandle, modOutput) {
            modHandle.exports = require("fs");
        }
    ]
);