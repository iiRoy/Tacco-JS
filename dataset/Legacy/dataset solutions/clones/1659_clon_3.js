/*!
 * File: /home/user/project/src/core/solver_module.js
 * Description: A refactored and transformed version of the original problem solver.
 * This module orchestrates input parsing, recursive state exploration, and cost calculation.
 */
!function(moduleExports){
    var moduleCache = {}; // Cache for loaded modules

    // Module loading function
    function requireModule(moduleId) {
        // If module is already in cache, return its exports
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        // Create a new module entry and execute its factory function
        var currentModule = moduleCache[moduleId] = {
            identifier: moduleId,
            isLoaded: false,
            exports: {}
        };
        moduleExports[moduleId].call(currentModule.exports, currentModule, currentModule.exports, requireModule);
        currentModule.isLoaded = true; // Mark as loaded
        return currentModule.exports;
    }

    // Assign module definitions to the loader
    requireModule.moduleDefinitions = moduleExports;
    requireModule.moduleCache = moduleCache;

    // Utility for defining properties on exports (like getters)
    requireModule.defineExportProperty = function(targetObject, propertyName, getterFunction) {
        if (!requireModule.hasOwn(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    // Helper for ES Module compatibility (marking as __esModule)
    requireModule.markAsEsModule = function(targetObject) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, { value: "Module" });
        }
        Object.defineProperty(targetObject, "__esModule", { value: true });
    };

    // Interop helper for various module types
    requireModule.interopRequire = function(moduleReference, flags) {
        if (flags & 1) moduleReference = requireModule(moduleReference); // If it's a direct module ID
        if (flags & 8) return moduleReference; // Already an object, skip further processing
        if ((flags & 4) && typeof moduleReference === "object" && moduleReference && moduleReference.__esModule) return moduleReference;

        var defaultExportContainer = Object.create(null);
        requireModule.markAsEsModule(defaultExportContainer); // Mark the container as an ES module
        Object.defineProperty(defaultExportContainer, "default", { enumerable: true, value: moduleReference });

        // If flags indicate string export and not already a string, copy properties
        if ((flags & 2) && typeof moduleReference !== "string") {
            for (var propKey in moduleReference) {
                requireModule.defineExportProperty(defaultExportContainer, propKey, (function(key) {
                    return function() { return moduleReference[key]; };
                }).bind(null, propKey));
            }
        }
        return defaultExportContainer;
    };

    // Helper for getting default export from modules
    requireModule.getDefaultExport = function(moduleObject) {
        var defaultGetter = moduleObject && moduleObject.__esModule ?
            function() { return moduleObject.default; } :
            function() { return moduleObject; };
        requireModule.defineExportProperty(defaultGetter, "a", defaultGetter); // 'a' alias for default
        return defaultGetter;
    };

    // Check if an object has a property
    requireModule.hasOwn = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    requireModule.basePath = ""; // Base path for assets (not used here, but part of boilerplate)

    // Start execution by loading the entry module (module 0)
    requireModule(requireModule.moduleDefinitions.entryPoint = 0);
})
([
/* 0 */
function(currentModule, moduleExports, moduleRequester) {
    "use strict"; // Enforce strict mode for cleaner code

    // Helper to handle default exports from CommonJS modules (e.g., `fs`)
    var interopDefault = this && this.__importDefault || function(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    };

    // Standard ES module export setup
    Object.defineProperty(moduleExports, "__esModule", { value: true });
    moduleExports.entryPointFunction = void 0;

    // Importing necessary utilities and libraries
    const fileSystemHandler = interopDefault(moduleRequester(2)); // Imports 'fs' module
    const inputParsingTools = moduleRequester(3); // Imports custom input utility module

    /**
     * Enum-like object for defining protection types for points.
     * @typedef {'X_AXIS' | 'Y_AXIS' | 'NONE'} ProtectionStrategy
     */
    const ProtectionStrategy = {
        X_AXIS: "X", // Protects along the X-axis
        Y_AXIS: "Y", // Protects along the Y-axis
        NONE: "N"    // No specific protection applied by this point
    };

    /**
     * Calculates the minimum cost for a given configuration of protected points.
     * @param {object} config - Configuration object.
     * @param {number} config.totalPoints - Total number of points.
     * @param {Array<object>} config.pointSet - Array of point objects {x, y, p}.
     * @param {Array<ProtectionStrategy>} config.chosenStrategies - Array indicating protection choice for each point.
     * @returns {number} The total calculated cost.
     */
    function computeConfigurationCost({ totalPoints, pointSet, chosenStrategies }) {
        let totalCurrentCost = 0;

        // Iterate through each point to determine its individual protection cost
        for (let idx = 0; idx < totalPoints; ++idx) {
            // If the current point itself is selected as a protector, it has no cost to be protected.
            // Only points that are NOT protectors need to have their protection cost calculated.
            if (chosenStrategies[idx] !== ProtectionStrategy.NONE) {
                continue; // This point is a protector, it doesn't incur a direct protection cost
            }

            // Initial cost: minimum distance to an axis * its power
            let currentPointProtectionCost = Math.min(
                Math.abs(pointSet[idx].x),
                Math.abs(pointSet[idx].y)
            ) * pointSet[idx].p;

            // Check if any other chosen protector point can reduce this cost
            for (let protectorIdx = 0; protectorIdx < totalPoints; ++protectorIdx) {
                const protectorType = chosenStrategies[protectorIdx];

                if (protectorType === ProtectionStrategy.Y_AXIS) {
                    // Y-axis protector: reduces cost based on X-distance
                    const distanceX = Math.abs(pointSet[idx].x - pointSet[protectorIdx].x);
                    currentPointProtectionCost = Math.min(
                        currentPointProtectionCost,
                        distanceX * pointSet[idx].p
                    );
                } else if (protectorType === ProtectionStrategy.X_AXIS) {
                    // X-axis protector: reduces cost based on Y-distance
                    const distanceY = Math.abs(pointSet[idx].y - pointSet[protectorIdx].y);
                    currentPointProtectionCost = Math.min(
                        currentPointProtectionCost,
                        distanceY * pointSet[idx].p
                    );
                }
            }
            totalCurrentCost += currentPointProtectionCost; // Accumulate cost for this point
        }
        return totalCurrentCost;
    }

    /**
     * Recursively explores all possible protection strategies to find minimum costs.
     * This function uses backtracking to try all combinations of X, Y, or NONE for each point.
     * @param {number} currentPointIndex - The index of the point currently being considered (0 to N-1).
     * @param {number} currentActiveProtectors - The count of points chosen as X_AXIS or Y_AXIS protectors so far.
     * @param {object} context - Shared context object for the recursion.
     * @param {Array<ProtectionStrategy>} context.chosenStrategies - Array to store the protection choice for each point.
     * @param {number} context.totalPoints - Total number of points (N).
     * @param {Array<object>} context.pointCoordinates - Array of point objects {x, y, p}.
     * @param {Array<number>} context.minimumCostsByProtectorCount - Array to store the minimum cost for each protector count.
     */
    function exploreProtectionCombinations(
        currentPointIndex,
        currentActiveProtectors,
        context
    ) {
        const { chosenStrategies, totalPoints, pointCoordinates, minimumCostsByProtectorCount } = context;

        // Base case: All points have been assigned a strategy
        if (currentPointIndex === totalPoints) {
            // Calculate the cost for this complete configuration
            const calculatedCost = computeConfigurationCost({
                totalPoints: totalPoints,
                pointSet: pointCoordinates,
                chosenStrategies: chosenStrategies
            });
            // Update the minimum cost for the current number of active protectors
            minimumCostsByProtectorCount[currentActiveProtectors] = Math.min(
                minimumCostsByProtectorCount[currentActiveProtectors],
                calculatedCost
            );
            return; // End recursion for this path
        }

        // Recursive step: Try each of the three strategies for the current point

        // Option 1: Point is not a protector
        chosenStrategies[currentPointIndex] = ProtectionStrategy.NONE;
        exploreProtectionCombinations(
            currentPointIndex + 1,
            currentActiveProtectors,
            context
        );

        // Option 2: Point is an X-axis protector
        chosenStrategies[currentPointIndex] = ProtectionStrategy.X_AXIS;
        exploreProtectionCombinations(
            currentPointIndex + 1,
            currentActiveProtectors + 1, // Increment active protector count
            context
        );

        // Option 3: Point is a Y-axis protector
        chosenStrategies[currentPointIndex] = ProtectionStrategy.Y_AXIS;
        exploreProtectionCombinations(
            currentPointIndex + 1,
            currentActiveProtectors + 1, // Increment active protector count
            context
        );
    }

    /**
     * Initializes the solver and processes the input to find minimum costs.
     * @param {string} rawInputString - The raw string input from stdin.
     */
    function initializeAndSolve(rawInputString) {
        const integerReader = inputParsingTools.getIntegerParser(rawInputString);
        const numberOfPoints = integerReader(); // Read N, the total number of points
        const pointsData = [];

        // Read N lines of point data (x, y, p)
        for (let i = 0; i < numberOfPoints; ++i) {
            const coordinateX = integerReader();
            const coordinateY = integerReader();
            const protectionPower = integerReader();
            pointsData.push({
                x: coordinateX,
                y: coordinateY,
                p: protectionPower
            });
        }

        /**
         * Orchestrates the overall solution process.
         * @param {object} params - Parameters for the solver.
         * @param {number} params.numPoints - Total number of points.
         * @param {Array<object>} params.pointCollection - Array of point objects.
         * @returns {Array<number>} An array where index 'k' contains the minimum cost
         *                          when 'k' points are chosen as protectors.
         */
        const executeSolver = ({ numPoints, pointCollection }) => {
            // Initialize an array to store minimum costs for each possible number of protectors (0 to N)
            // Fill with a large value initially, as we are looking for minimums.
            const minCostsArray = Array(numPoints + 1).fill(Number.MAX_SAFE_INTEGER);

            // Setup the shared context object for the recursive function
            const solverContext = {
                totalPoints: numPoints,
                pointCoordinates: pointCollection,
                minimumCostsByProtectorCount: minCostsArray,
                chosenStrategies: Array(numPoints) // Array to hold current combination of strategies
            };

            // Start the recursive exploration from the first point (index 0) with 0 active protectors
            exploreProtectionCombinations(0, 0, solverContext);

            return minCostsArray;
        };

        // Execute the solver and print the results, each on a new line
        console.log(executeSolver({ numPoints: numberOfPoints, pointCollection: pointsData }).join("\n"));
    }

    // Set the main entry point function for the module
    moduleExports.entryPointFunction = initializeAndSolve;

    // If this module is the main entry point for the application (e.g., run via Node.js)
    if (moduleRequester.moduleCache[moduleRequester.moduleDefinitions.entryPoint] === currentModule) {
        // Read input from /dev/stdin and pass it to the main solver function
        initializeAndSolve(fileSystemHandler.default.readFileSync("/dev/stdin", { encoding: "utf8" }));
    }
},

/* 1 */
function(currentModule, moduleExports) {
    // Webpack polyfill for Node.js module object compatibility
    currentModule.exports = function(moduleObject) {
        if (!moduleObject.webpackPolyfill) {
            moduleObject.deprecate = function() {}; // Stub deprecate
            moduleObject.paths = []; // Stub paths
            moduleObject.children || (moduleObject.children = []); // Ensure children array exists

            // Define 'loaded' property as a getter for 'isLoaded'
            Object.defineProperty(moduleObject, "loaded", {
                enumerable: true,
                get: function() { return moduleObject.isLoaded; }
            });
            // Define 'id' property as a getter for 'identifier'
            Object.defineProperty(moduleObject, "id", {
                enumerable: true,
                get: function() { return moduleObject.identifier; }
            });
            moduleObject.webpackPolyfill = 1; // Mark as polyfilled
        }
        return moduleObject;
    };
},

/* 2 */
function(currentModule, moduleExports) {
    // This module simply re-exports the Node.js 'fs' (file system) module.
    currentModule.exports = require("fs");
},

/* 3 */
function(currentModule, moduleExports, moduleRequester) {
    "use strict"; // Enforce strict mode

    /**
     * Creates an iterator that yields tokens from a string, split by whitespace.
     * @param {string} sourceString - The string to tokenize.
     * @returns {Generator<string>} A generator yielding string tokens.
     */
    function* stringTokenizer(sourceString) {
        // Use a more robust regex for splitting, handling multiple spaces and trimming
        const tokens = sourceString.trim().split(/\s+/);
        for (const token of tokens) {
            yield token;
        }
    }

    // Standard ES module export setup
    Object.defineProperty(moduleExports, "__esModule", { value: true });
    moduleExports.getBigIntParser = moduleExports.getIntegerParser = moduleExports.getStringIterator = moduleExports.getParsedIterator = moduleExports.createStringIterator = void 0;

    // Export the basic string tokenizer
    moduleExports.createStringIterator = stringTokenizer;

    /**
     * Creates an iterator that yields tokens from a string, applying a parser function to each.
     * @param {string} sourceInput - The input string.
     * @param {function(string):any} parserFunction - The function to parse each token.
     * @returns {Generator<any>} A generator yielding parsed tokens.
     */
    moduleExports.getParsedIterator = function*(sourceInput, parserFunction) {
        const tokensArray = sourceInput.trim().split(/\s+/);
        for (const tokenValue of tokensArray) {
            yield parserFunction(tokenValue);
        }
    };

    /**
     * Returns a function that, when called, yields the next string token from the input.
     * @param {string} entireInputString - The complete input string.
     * @returns {function():string|undefined} A function to get the next string token.
     */
    moduleExports.getStringIterator = function(entireInputString) {
        const tokenGenerator = stringTokenizer(entireInputString);
        return function() {
            const nextResult = tokenGenerator.next();
            return nextResult.done ? undefined : nextResult.value;
        };
    };

    /**
     * Returns a function that, when called, yields the next integer from the input.
     * Includes a basic check for valid integer conversion.
     * @param {string} entireInputString - The complete input string.
     * @returns {function():number} A function to get the next integer.
     */
    moduleExports.getIntegerParser = function(entireInputString) {
        const tokenGenerator = stringTokenizer(entireInputString);
        return function() {
            const nextToken = tokenGenerator.next().value;
            const parsedInt = parseInt(nextToken, 10); // Always use radix 10
            if (isNaN(parsedInt)) {
                // Optionally, throw an error or return a default/sentinel value
                // For this clone, we'll mimic the original's behavior of assuming valid input.
                // console.warn(`Warning: Could not parse "${nextToken}" as an integer.`);
            }
            return parsedInt;
        };
    };

    /**
     * Returns a function that, when called, yields the next BigInt from the input.
     * @param {string} entireInputString - The complete input string.
     * @returns {function():bigint} A function to get the next BigInt.
     */
    moduleExports.getBigIntParser = function(entireInputString) {
        const tokenGenerator = stringTokenizer(entireInputString);
        return function() {
            const nextToken = tokenGenerator.next().value;
            return BigInt(nextToken);
        };
    };
}]);
// # sourceMappingURL=transformed_solver.js.map