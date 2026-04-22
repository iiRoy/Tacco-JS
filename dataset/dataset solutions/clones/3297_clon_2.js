/*
 * This file contains a bundled JavaScript application.
 * It uses a custom module loading system similar to Webpack.
 */
exportManager.interface = function (moduleDefinitions) {

    // Cache for already loaded modules.
    const moduleCache = {};

    /**
     * Resolves and loads a module by its identifier.
     * @param {number} moduleIdKey The unique identifier for the module.
     * @returns {object} The exports of the requested module.
     */
    function resolveDependency(moduleIdKey) {
        // If the module is already in cache, return its exports.
        if (moduleCache[moduleIdKey]) return moduleCache[moduleIdKey].exportedContent;

        /*
         * Create a new module context in the cache.
         * Initialize it with module ID, a 'not loaded' flag, and an empty exports object.
         */
        const dependencyContext = moduleCache[moduleIdKey] = {
            contextId: moduleIdKey,
            isResolved: false,
            exportedContent: {}
        };

        /*
         * Execute the module definition function.
         * The function receives the module context, its exports, and the resolver itself.
         */
        moduleDefinitions[moduleIdKey].call(
            dependencyContext.exportedContent,
            dependencyContext,
            dependencyContext.exportedContent,
            resolveDependency
        );

        // Mark the module as loaded.
        dependencyContext.isResolved = true;

        // Return the module's exported content.
        return dependencyContext.exportedContent;
    }

    // Assign the module definitions to the resolver for internal use.
    resolveDependency.definitions = moduleDefinitions;

    // Assign the module cache to the resolver for internal access.
    resolveDependency.cached = moduleCache;

    /**
     * Defines a non-enumerable property on an object.
     * This is typically used for getters or internal flags.
     * @param {object} targetObject The object to define the property on.
     * @param {string} propertyName The name of the property.
     * @param {function} getterFunction The function to call when the property is accessed.
     */
    resolveDependency.defineProperty = function(targetObject, propertyName, getterFunction) {
        // Check if the property already exists using a helper.
        if (!resolveDependency.hasProperty(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };


    /**
     * Registers a module as a namespace object, adding __esModule and Symbol.toStringTag properties.
     * @param {object} targetObject The module exports object.
     */
    resolveDependency.registerNamespace = function(targetObject) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        Object.defineProperty(targetObject, '__esModule', {
            value: true
        });
    };

    /**
     * Handles interoperability for ES Modules, returning a default export or the module itself.
     * @param {any} moduleContent The content of the module.
     * @param {number} flagValue Bitmask indicating how to handle the module.
     * @returns {any} The processed module content.
     */
    resolveDependency.interopImport = function(moduleContent, flagValue) {
        // If flag 1 is set, resolve the module first.
        if (1 & flagValue) moduleContent = resolveDependency(moduleContent);

        // If flag 8 is set, return the module as is.
        if (8 & flagValue) return moduleContent;

        /*
         * If flag 4 is set and it's an object with __esModule, return it directly.
         * This signifies it's already an ES module.
         */
        if (4 & flagValue && typeof moduleContent === 'object' && moduleContent && moduleContent.__esModule) return moduleContent;

        // Create a new namespace object.
        var namespaceObject = Object.create(null);

        // Register it as an ES module namespace.
        resolveDependency.registerNamespace(namespaceObject);

        // Define a 'default' export pointing to the module content.
        Object.defineProperty(namespaceObject, 'default', {
            enumerable: true,
            value: moduleContent
        });

        /*
         * If flag 2 is set and it's not a string, iterate over its properties
         * and define them as exports in the new namespace object.
         */
        if (2 & flagValue && typeof moduleContent !== 'string') {
            for (var propertyKey in moduleContent) {
                resolveDependency.defineProperty(
                    namespaceObject,
                    propertyKey,
                    (function(currentProperty) {
                        return moduleContent[currentProperty];
                    }).bind(null, propertyKey)
                );
            }
        }
        return namespaceObject;
    };

    /**
     * Creates a wrapper function to access the default export or the module itself.
     * @param {any} sourceModule The module to wrap.
     * @returns {function} A function that returns the module's content.
     */
    resolveDependency.createInteropWrapper = function(sourceModule) {
        var defaultAccessor = sourceModule && sourceModule.__esModule ?
            function() {
                return sourceModule.default;
            } :
            function() {
                return sourceModule;
            };
        // Define an 'a' property (common webpack convention) as an alias to the accessor.
        resolveDependency.defineProperty(defaultAccessor, 'a', defaultAccessor);
        return defaultAccessor;
    };

    /**
     * Checks if an object has a specific property directly (not through prototype chain).
     * @param {object} targetObject The object to check.
     * @param {string} propertyName The name of the property.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    resolveDependency.hasProperty = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    // Public path for assets (currently empty).
    resolveDependency.assetPath = "";

    // Set the entry point module and immediately resolve it to start the application.
    return resolveDependency(resolveDependency.entryPoint = 0);

}(
    // Array of module definitions passed to the main function.
    [
        // --- Module 0: Main application entry point ---
        function(currentModule, moduleExports, dependencyResolver) {
            // Read data from standard input, then process it using module 1's functionality.
            dependencyResolver(1)(
                dependencyResolver(2).readFileContent("/dev/stdin", "UTF-8")
            );
        },

        // --- Module 1: Input data processing and calculation logic ---
        function(exportedContent, currentExports) {

            /**
             * Extracts a fixed number of elements from an array-like source,
             * handling non-iterable inputs gracefully.
             * @param {Array|Iterable} inputCollection The source data.
             * @param {number} countLimit The maximum number of elements to extract.
             * @returns {Array} An array containing the extracted elements.
             * @throws {TypeError} If the input is not iterable and cannot be destructured.
             */
            function retrieveSubset(inputCollection, countLimit) {
                // Helper to get an array from an array-like or iterable.
                return (function(inputCollection) {
                        if (Array.isArray(inputCollection)) return inputCollection;
                    })(inputCollection) ||
                    (function(sourceArray, subsetSize) {
                        var resultArray = [],
                            isRunning = true,
                            hadError = false,
                            errorObject = undefined;
                        try {
                            for (
                                var itemIterator = sourceArray[Symbol.iterator](); !(isRunning = (itemIterator = itemIterator.next()).done) &&
                                (resultArray.push(itemIterator.value), !subsetSize || resultArray.length !== subsetSize); isRunning = true
                            ) {}
                        } catch (exception) {
                            hadError = true;
                            errorObject = exception;
                        } finally {
                            try {
                                if (!isRunning && itemIterator['return'] != null) {
                                    itemIterator['return']();
                                }
                            } finally {
                                if (hadError) throw errorObject;
                            }
                        }
                        return resultArray;
                    })(inputCollection, countLimit) ||
                    (function() {
                        throw new TypeError("Invalid attempt to destructure non-iterable instance");
                    })();
            }

            // Export the main data processing function.
            exportedContent.exports = function(inputString) {
                // Split the input string into individual lines.
                const inputLines = inputString.split("\n");

                // The first line contains the total number of data sets.
                const totalCount = Number(inputLines[0]);

                // Array to store the parsed numerical data.
                const parsedValues = [];

                // Loop through the remaining lines to parse the data.
                for (let currentLineIdx = 0; currentLineIdx < totalCount; currentLineIdx++) {
                    /*
                     * Parse each line: split by space, convert to numbers,
                     * and extract 3 components using the helper function.
                     */
                    let extractedComponents = retrieveSubset(
                        inputLines[currentLineIdx + 1].split(" ").map(function(numStr) {
                            return Number(numStr);
                        }), 3
                    );

                    // Destructure the extracted components.
                    let firstComponent = extractedComponents[0],
                        secondComponent = extractedComponents[1],
                        thirdComponent = extractedComponents[2];

                    // Add the components as a new entry to the parsed data.
                    parsedValues.push([firstComponent, secondComponent, thirdComponent]);
                }

                // Initialize a 2D array for dynamic programming calculations.
                const calculationMatrix = [];
                for (let matrixRowIdx = 0; matrixRowIdx < totalCount; matrixRowIdx++) {
                    calculationMatrix.push([0, 0, 0]);
                }

                // Initialize the first row of the calculation matrix with the first parsed data set.
                calculationMatrix[0][0] = parsedValues[0][0];
                calculationMatrix[0][1] = parsedValues[0][1];
                calculationMatrix[0][2] = parsedValues[0][2];

                /*
                 * Perform dynamic programming calculation.
                 * Iterate through rows (except the last one).
                 */
                for (let outerLoopIdx = 0; outerLoopIdx < totalCount - 1; outerLoopIdx++) {
                    // Iterate through possible 'current' column choices.
                    for (let currentColIdx = 0; currentColIdx < 3; currentColIdx++) {
                        // Iterate through possible 'previous' column choices.
                        for (let prevColIdx = 0; prevColIdx < 3; prevColIdx++) {
                            // Ensure the current and previous column choices are different.
                            if (prevColIdx !== currentColIdx) {
                                // Calculate the sum for the current path.
                                let computedSum = calculationMatrix[outerLoopIdx][currentColIdx] + parsedValues[outerLoopIdx + 1][prevColIdx];

                                // If the computed sum is greater, update the matrix.
                                if (calculationMatrix[outerLoopIdx + 1][prevColIdx] < computedSum) {
                                    calculationMatrix[outerLoopIdx + 1][prevColIdx] = computedSum;
                                }
                            }
                        }
                    }
                }

                // Find the maximum value in the last row of the calculation matrix.
                const maximumValue = Math.max(...calculationMatrix[totalCount - 1]);

                // Output the final result to the console.
                console.log(maximumValue);
            };
        },

        // --- Module 2: File system utility wrapper ---
        function(exportContainer, currentExports) {
            // Export the Node.js 'fs' module for file system operations.
            exportContainer.exports = obtainExternal("fs");
        }
    ]
);