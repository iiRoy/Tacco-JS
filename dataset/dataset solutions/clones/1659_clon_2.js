/* This module facilitates complex calculation processes for optimal point placement. */
!function(moduleDefinitions) {
    var moduleCache = {};

    function moduleResolver(requestedModuleId) {
        if (moduleCache[requestedModuleId]) {
            return moduleCache[requestedModuleId].exports;
        }

        var currentModuleEntry = moduleCache[requestedModuleId] = {
            identifier: requestedModuleId,
            isLoaded: false,
            exports: {}
        };

        // Execute the module function, populating its exports.
        moduleDefinitions[requestedModuleId].call(currentModuleEntry.exports, currentModuleEntry, currentModuleEntry.exports, moduleResolver);
        currentModuleEntry.isLoaded = true;
        return currentModuleEntry.exports;
    }

    // Assign module definitions and cache to the resolver for internal use.
    moduleResolver.moduleSource = moduleDefinitions;
    moduleResolver.moduleCache = moduleCache;

    // Utility to define a getter property on an object.
    moduleResolver.defineGetter = function(targetObject, propertyName, getterFunction) {
        if (!moduleResolver.hasProperty(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    // Utility to mark a module as a webpack module.
    moduleResolver.markModuleAsWebpack = function(targetModule) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetModule, Symbol.toStringTag, { value: "Module" });
        }
        Object.defineProperty(targetModule, "__esModule", { value: true });
    };

    // Utility to create an interop namespace object for a module.
    moduleResolver.createInteropNamespace = function(targetModule, flag) {
        if (flag & 1) targetModule = moduleResolver(targetModule);
        if (flag & 8) return targetModule;
        if (flag & 4 && typeof targetModule === "object" && targetModule && targetModule.__esModule) {
            return targetModule;
        }

        var interopObject = Object.create(null);
        moduleResolver.markModuleAsWebpack(interopObject);
        Object.defineProperty(interopObject, "default", { enumerable: true, value: targetModule });

        if (flag & 2 && typeof targetModule !== "string") {
            for (var propName in targetModule) {
                moduleResolver.defineGetter(interopObject, propName, (function(currentProp) {
                    return targetModule[currentProp];
                }).bind(null, propName));
            }
        }
        return interopObject;
    };

    // Utility to get a module's default export.
    moduleResolver.getDefaultExport = function(moduleObject) {
        var defaultExportGetter = moduleObject && moduleObject.__esModule ?
            function() { return moduleObject.default; } :
            function() { return moduleObject; };
        moduleResolver.defineGetter(defaultExportGetter, "a", defaultExportGetter);
        return defaultExportGetter;
    };

    // Utility to check if an object has a property.
    moduleResolver.hasProperty = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    moduleResolver.publicPath = "";

    // Start execution by resolving the entry module (module with ID 0).
    moduleResolver(moduleResolver.entryModuleId = 0);
}([

    /* Module 0: Main application logic for solving the problem. */
    function(currentModule, moduleExports, moduleLoader) {
        "use strict";

        // Helper function for interopRequireDefault, handling ES module default imports.
        var defaultImporter = this && this.__importDefault || function(importedModule) {
            return importedModule && importedModule.__esModule ? importedModule : { default: importedModule };
        };

        // Mark this module as an ES module and initialize 'main' export.
        Object.defineProperty(moduleExports, "__esModule", { value: true });
        moduleExports.mainFunction = void 0;

        // Import necessary external modules.
        const fileSystemAccess = defaultImporter(moduleLoader(2));
        const inputParser = moduleLoader(3);

        var placementOptionType; // Declare an enum-like object for placement choices.

        /**
         * Recursive function to explore all possible placement configurations
         * and calculate the minimum cost for each count of 'X'/'Y' placements.
         * @param {number} currentIndex - The current point index being considered.
         * @param {number} activeCount - The current count of 'X' or 'Y' placements made so far.
         * @param {object} calculationOptions - Object containing N, C, ans, cand.
         */
        function calculateMinimumCost(currentIndex, activeCount, calculationOptions) {
            const {
                candidatePlacements: currentChoices,
                pointCount: totalPoints,
                coordinateData: pointCoordinates,
                resultArray: minCosts
            } = calculationOptions;

            // Base case: if all points have been assigned a placement.
            if (currentIndex !== totalPoints) {
                // Explore 'N' (None) placement for the current point.
                currentChoices[currentIndex] = placementOptionType.NONE;
                calculateMinimumCost(currentIndex + 1, activeCount, calculationOptions);

                // Explore 'X' placement for the current point (increments activeCount).
                currentChoices[currentIndex] = placementOptionType.X_AXIS;
                calculateMinimumCost(currentIndex + 1, activeCount + 1, calculationOptions);

                // Explore 'Y' placement for the current point (increments activeCount).
                currentChoices[currentIndex] = placementOptionType.Y_AXIS;
                calculateMinimumCost(currentIndex + 1, activeCount + 1, calculationOptions);
            } else {
                // All points placed, now calculate the total cost for this configuration.
                const currentConfigurationCost = (function({
                    totalPoints: numPoints,
                    pointCoordinates: coords,
                    placementChoices: choices
                }) {
                    let accumulatedCost = 0;

                    // Iterate through each point to calculate its individual cost.
                    for (let pointIdx = 0; pointIdx < numPoints; pointIdx++) {
                        // Only consider points marked as 'N' (None) for initial cost calculation.
                        if (choices[pointIdx] !== placementOptionType.NONE) {
                            continue;
                        }

                        // Calculate initial cost for 'N' point: min of |x| or |y| times price.
                        let pointSpecificCost = Math.min(Math.abs(coords[pointIdx].x), Math.abs(coords[pointIdx].y)) * coords[pointIdx].p;

                        // Check other points for potential cost reduction.
                        for (let otherPointIdx = 0; otherPointIdx < numPoints; otherPointIdx++) {
                            if (choices[otherPointIdx] === placementOptionType.Y_AXIS) {
                                // If otherPoint is 'Y', it covers points on its X-coordinate.
                                pointSpecificCost = Math.min(pointSpecificCost, Math.abs(coords[pointIdx].x - coords[otherPointIdx].x) * coords[pointIdx].p);
                            } else if (choices[otherPointIdx] === placementOptionType.X_AXIS) {
                                // If otherPoint is 'X', it covers points on its Y-coordinate.
                                pointSpecificCost = Math.min(pointSpecificCost, Math.abs(coords[pointIdx].y - coords[otherPointIdx].y) * coords[pointIdx].p);
                            }
                        }
                        accumulatedCost += pointSpecificCost;
                    }
                    return accumulatedCost;
                })({
                    totalPoints: totalPoints,
                    pointCoordinates: pointCoordinates,
                    placementChoices: currentChoices
                });

                // Update the minimum cost found for the current 'activeCount'.
                minCosts[activeCount] = Math.min(minCosts[activeCount], currentConfigurationCost);
            }
        }

        /**
         * Main function to read input, perform calculations, and print results.
         * @param {string} rawDataString - The raw input data as a string.
         */
        function processInputAndSolve(rawDataString) {
            // Get a function to extract integers from the input string.
            const integerExtractor = inputParser.getIntegerToken(rawDataString);
            const numberOfPoints = integerExtractor();
            const pointCollection = [];

            // Read N points, each with x, y, and price (p) coordinates.
            for (let currentPointIdx = 0; currentPointIdx < numberOfPoints; currentPointIdx++) {
                const coordX = integerExtractor();
                const coordY = integerExtractor();
                const priceFactor = integerExtractor();
                pointCollection.push({ x: coordX, y: coordY, p: priceFactor });
            }

            // Perform the main calculation and print the results.
            console.log(
                (function({ totalPoints: N_count, coordinateData: C_coords }) {
                    // Initialize an array to store minimum costs for each 'activeCount' (0 to N).
                    // Fill with a large number (Number.MAX_VALUE) initially.
                    const finalCosts = Array(N_count + 1).fill(Number.MAX_VALUE);

                    // Start the recursive cost calculation.
                    // Initial call: index 0, activeCount 0, with options object.
                    calculateMinimumCost(0, 0, {
                        pointCount: N_count,
                        coordinateData: C_coords,
                        resultArray: finalCosts,
                        candidatePlacements: Array(N_count)
                    });
                    return finalCosts;
                })({ totalPoints: numberOfPoints, coordinateData: pointCollection }).join("\n")
            );
        }

        // Define the enum-like object for placement options.
        (function(placementEnum) {
            placementEnum.X_AXIS = "X";
            placementEnum.Y_AXIS = "Y";
            placementEnum.NONE = "N";
        })(placementOptionType || (placementOptionType = {}));

        // Export the main function.
        moduleExports.mainFunction = processInputAndSolve;

        // If this module is the entry point (main module), read from stdin and execute.
        if (moduleLoader.moduleCache[moduleLoader.entryModuleId] === currentModule) {
            processInputAndSolve(fileSystemAccess.default.readFileSync("/dev/stdin", "utf8"));
        }
    },

    /* Module 1: Webpack Polyfill for module context. */
    function(currentModuleContext, moduleExportsContext) {
        currentModuleContext.exports = function(polyfillContext) {
            return polyfillContext.webpackPolyfill || (
                polyfillContext.deprecate = function() {},
                polyfillContext.paths = [],
                polyfillContext.children || (polyfillContext.children = []),
                Object.defineProperty(polyfillContext, "loaded", {
                    enumerable: true,
                    get: function() { return polyfillContext.isLoaded; }
                }),
                Object.defineProperty(polyfillContext, "id", {
                    enumerable: true,
                    get: function() { return polyfillContext.identifier; }
                }),
                polyfillContext.webpackPolyfill = 1
            ), polyfillContext;
        };
    },

    /* Module 2: File System Access (Node.js 'fs' module). */
    function(currentModuleContext, moduleExportsContext) {
        currentModuleContext.exports = require("fs");
    },

    /* Module 3: Input parsing utility functions. */
    function(currentModuleContext, moduleExportsContext, moduleLoader) {
        "use strict";

        /**
         * Generator function to tokenize a string by whitespace.
         * @param {string} textInput - The string to tokenize.
         * @yields {string} Each token.
         */
        function* tokenStreamGenerator(textInput) {
            const tokenArray = textInput.split(/\s+/);
            for (const singleToken of tokenArray) {
                yield singleToken;
            }
        }

        // Mark this module as an ES module and initialize exports.
        Object.defineProperty(moduleExportsContext, "__esModule", { value: true });
        moduleExportsContext.getBigIntToken = moduleExportsContext.getIntegerToken = moduleExportsContext.getStringToken = moduleExportsContext.getTokenStreamWithParser = moduleExportsContext.getTokenStream = void 0;

        // Export the basic token stream generator.
        moduleExportsContext.getTokenStream = tokenStreamGenerator;

        /**
         * Generator function to tokenize a string and parse each token.
         * @param {string} textInput - The string to tokenize.
         * @param {Function} parsingFunction - A function to parse each token.
         * @yields {*} The parsed value of each token.
         */
        moduleExportsContext.getTokenStreamWithParser = function*(textInput, parsingFunction) {
            const tokenArray = textInput.split(/\s+/);
            for (const singleToken of tokenArray) {
                yield parsingFunction(singleToken);
            }
        };

        /**
         * Returns a function that sequentially extracts string tokens.
         * @param {string} textInput - The input string.
         * @returns {Function} A function that returns the next string token.
         */
        moduleExportsContext.getStringToken = function(textInput) {
            const tokenIterator = tokenStreamGenerator(textInput);
            return () => tokenIterator.next().value;
        };

        /**
         * Returns a function that sequentially extracts and parses integer tokens.
         * @param {string} textInput - The input string.
         * @returns {Function} A function that returns the next integer token.
         */
        moduleExportsContext.getIntegerToken = function(textInput) {
            const tokenIterator = tokenStreamGenerator(textInput);
            return () => parseInt(tokenIterator.next().value, 10);
        };

        /**
         * Returns a function that sequentially extracts and parses BigInt tokens.
         * @param {string} textInput - The input string.
         * @returns {Function} A function that returns the next BigInt token.
         */
        moduleExportsContext.getBigIntToken = function(textInput) {
            const tokenIterator = tokenStreamGenerator(textInput);
            return () => BigInt(tokenIterator.next().value);
        };
    }
]);
// This file contains a cloned version of a JavaScript program.