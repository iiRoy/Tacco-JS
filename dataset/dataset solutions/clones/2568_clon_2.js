module.exports = (function(moduleDefinitions) {
    // This object serves as a cache for loaded modules.
    const moduleCache = {};

    // The core function to load and execute modules.
    function loadModule(moduleId) {
        // If the module is already in the cache, return its exports.
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        // If not cached, create a new module entry in the cache.
        const currentModule = moduleCache[moduleId] = {
            i: moduleId,    // Internal module identifier
            l: false,       // Flag indicating if the module has been loaded
            exports: {}     // The exports object for this module
        };

        // Execute the module function, passing the module object, its exports, and the loader itself.
        moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, loadModule);

        // Mark the module as loaded.
        currentModule.l = true;

        // Return the module's exports.
        return currentModule.exports;
    }

    // Attach module definitions and cache to the loader for internal use.
    loadModule.modules = moduleDefinitions;
    loadModule.cache = moduleCache;

    // Helper to define a getter property on an object if it doesn't already exist.
    loadModule.define = function(targetObject, propertyName, valueGetter) {
        loadModule.hasOwn(targetObject, propertyName) || Object.defineProperty(targetObject, propertyName, {
            enumerable: true,
            get: valueGetter
        });
    };

    // Helper to mark an object as an ES module.
    loadModule.register = function(targetObject) {
        // Set Symbol.toStringTag for better debugging if Symbol is available.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        // Mark as an ES module.
        Object.defineProperty(targetObject, "__esModule", {
            value: true
        });
    };

    // Helper for interoperability between CommonJS and ES modules.
    loadModule.interopRequire = function(moduleIdentifier, modeFlags) {
        // If flag 1 is set, load the module directly.
        if (1 & modeFlags && (moduleIdentifier = loadModule(moduleIdentifier))) return moduleIdentifier;
        // If flag 8 is set, return the module identifier as is.
        if (8 & modeFlags) return moduleIdentifier;
        // If flag 4 is set and it's an ES module, return it directly.
        if (4 & modeFlags && typeof moduleIdentifier === "object" && moduleIdentifier && moduleIdentifier.__esModule) return moduleIdentifier;

        // Create a new namespace object for the module.
        const namespaceObject = Object.create(null);
        loadModule.register(namespaceObject); // Mark it as an ES module.
        Object.defineProperty(namespaceObject, "default", {
            enumerable: true,
            value: moduleIdentifier
        });

        // If flag 2 is set and it's not a string, copy properties from the original module.
        if (2 & modeFlags && typeof moduleIdentifier !== "string") {
            for (const propName in moduleIdentifier) {
                loadModule.define(namespaceObject, propName, (function(currentProp) {
                    return moduleIdentifier[currentProp];
                }).bind(null, propName));
            }
        }
        return namespaceObject;
    };

    // Helper to get the default export of a module.
    loadModule.getDefaultExport = function(moduleExports) {
        const exportGetter = moduleExports && moduleExports.__esModule ?
            function() { return moduleExports.default; } :
            function() { return moduleExports; };
        return loadModule.define(exportGetter, "a", exportGetter), exportGetter;
    };

    // Helper to check if an object has a specific property.
    loadModule.hasOwn = function(targetObject, propertyKey) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
    };

    // Public path for assets (empty in this case).
    loadModule.publicPath = "";

    // Set the startup module ID and initiate loading.
    return loadModule(loadModule.startupModuleId = 0);
})([
    // Module 0: The main entry point of the application.
    function(moduleObject, exportsObject, requireModule) {
        // Read input from stdin, split by newlines, and pass to Module 1.
        requireModule(1)(requireModule(2).readFileSync("/dev/stdin", "UTF-8").split("\n"));
    },

    // Module 1: Contains the core logic for processing the input data.
    function(moduleObject, exportsObject) {
        // Helper function to safely extract elements from an iterable (like array destructuring).
        function extractArrayElements(inputIterable, elementCount) {
            // Attempt 1: If it's an array, return it directly.
            return (function(iterableInput) {
                if (Array.isArray(iterableInput)) return iterableInput;
            })(inputIterable) ||
            // Attempt 2: Iterate through the iterable to extract elements up to a limit.
            (function(iterableInput, limitCount) {
                const extractedElements = [];
                let isDone = true;
                let hasError = false;
                let errorValue = undefined;
                try {
                    for (let iteratorResult, iterableIterator = iterableInput[Symbol.iterator](); !(isDone = (iteratorResult = iterableIterator.next()).done) && (extractedElements.push(iteratorResult.value), !limitCount || extractedElements.length !== limitCount); isDone = true) {}
                } catch (err) {
                    hasError = true;
                    errorValue = err;
                } finally {
                    try {
                        // Ensure the iterator's return method is called if available.
                        isDone || (iterableIterator.return == null) || iterableIterator.return();
                    } finally {
                        if (hasError) throw errorValue;
                    }
                }
                return extractedElements;
            })(inputIterable, elementCount) ||
            // Attempt 3: If all else fails, throw a TypeError.
            (function() {
                throw new TypeError("Invalid attempt to destructure non-iterable instance");
            })();
        }

        // The main function exported by this module.
        moduleObject.exports = function(inputLines) {
            // Parse the first line for N (item count) and K (discount limit).
            const parsedParameters = extractArrayElements(inputLines[0].split(" ").map(function(strValue) {
                return Number(strValue);
            }), 2);
            const itemCountN = parsedParameters[0];
            const discountLimitK = parsedParameters[1];

            // Parse the second line for item prices.
            const itemPrices = inputLines[1].split(" ").map(function(strValue) {
                return Number(strValue);
            });

            // Sort prices in descending order.
            itemPrices.sort(function(priceA, priceB) {
                return priceB - priceA;
            });

            let accumulatedCost = 0;
            let remainingDiscounts = discountLimitK;

            // Iterate through each item to calculate its final cost.
            for (let itemIndex = 0; itemIndex < itemCountN; itemIndex++) {
                let currentPrice = itemPrices[itemIndex];
                let comparisonValue = 0; // This will be the threshold for applying discounts.

                // If it's not the last item, set comparisonValue to the minimum of the next item's price or 4.
                if (itemIndex !== itemCountN - 1) {
                    comparisonValue = Math.min(itemPrices[itemIndex + 1], 4);
                }

                // Apply discounts: halve the price as long as discounts remain and current price is above the comparison value.
                while (remainingDiscounts > 0 && currentPrice >= comparisonValue) {
                    currentPrice = Math.floor(currentPrice / 2);
                    remainingDiscounts--;
                }
                accumulatedCost += currentPrice; // Add the final price of the item to the total.
            }
            console.log(accumulatedCost); // Output the total accumulated cost.
        };
    },

    // Module 2: Provides access to the Node.js 'fs' (File System) module.
    function(moduleObject, exportsObject) {
        moduleObject.exports = require("fs");
    }
]);
