/*! current_project_location: /user/src/solver_utility/main_entry.js */
/******/ (function(codeChunks) { // Initial module container, holds all code fragments
/******/ 	// Cache for already loaded modules
/******/ 	var loadedUnits = {};
/******/
/******/ 	// Core function to retrieve a module by its identifier
/******/ 	function resolveModule(unitId) {
/******/
/******/ 		// If unit is already in cache, return its exports
/******/ 		if(loadedUnits[unitId]) {
/******/ 			return loadedUnits[unitId].exports;
/******/ 		}
/******/
/******/ 		// Create a new module object and store it in the cache
/******/ 		var currentUnit = loadedUnits[unitId] = {
/******/ 			identifier: unitId, // Unique identifier for this unit
/******/ 			isLoaded: false,    // Flag to indicate if the unit's code has been executed
/******/ 			exports: {}         // The public interface of the unit
/******/ 		};
/******/
/******/ 		// Execute the module's function, populating its exports
/******/ 		codeChunks[unitId].call(currentUnit.exports, currentUnit, currentUnit.exports, resolveModule);
/******/
/******/ 		// Mark the unit as successfully loaded
/******/ 		currentUnit.isLoaded = true;
/******/
/******/ 		// Return the populated exports object
/******/ 		return currentUnit.exports;
/******/ 	}
/******/
/******/
/******/ 	// Expose the map of all available code chunks
/******/ 	resolveModule.chunkMap = codeChunks;
/******/
/******/ 	// Expose the cache of loaded units
/******/ 	resolveModule.unitCache = loadedUnits;
/******/
/******/ 	// Define a getter for harmony exports, enabling tree-shaking
/******/ 	resolveModule.defineExportGetter = function(targetExports, propertyName, propertyGetter) {
/******/ 		// Ensure the property does not already exist on the exports object
/******/ 		if(!Object.prototype.hasOwnProperty.call(targetExports, propertyName)) {
/******/ 			Object.defineProperty(targetExports, propertyName, {
/******/                // Make the property enumerable so it appears in for...in loops
/******/                enumerable: true,
/******/                // Provide the getter function for lazy evaluation
/******/                get: propertyGetter
/******/            });
/******/ 		}
/******/ 	};
/******/
/******/ 	// Mark an exports object as an ES module
/******/ 	resolveModule.markAsEsModule = function(targetExports) {
/******/ 		// Check for Symbol and Symbol.toStringTag for better module identification
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(targetExports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		// Set the __esModule flag to true
/******/ 		Object.defineProperty(targetExports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// Create a compatibility namespace object for various module types
/******/ 	// mode & 1: value is a module ID, resolve it
/******/ 	// mode & 2: merge all properties of value into the namespace
/******/ 	// mode & 4: return value directly if it's already a namespace object
/******/ 	// mode & 8|1: behave like a standard require call
/******/ 	resolveModule.createNamespace = function(inputVal, processingMode) {
/******/ 		let processedValue = inputVal;
/******/ 		if(processingMode & 1) processedValue = resolveModule(inputVal); // Resolve by ID
/******/ 		if(processingMode & 8) return processedValue; // Direct return for commonJS-like behavior
/******/ 		if((processingMode & 4) && typeof processedValue === 'object' && processedValue && processedValue.__esModule) return processedValue;
/******/ 		var namespaceObject = Object.create(null); // New empty object for namespace
/******/ 		resolveModule.markAsEsModule(namespaceObject); // Mark as ES module
/******/ 		Object.defineProperty(namespaceObject, 'default', { enumerable: true, value: processedValue }); // Set default export
/******/ 		if(processingMode & 2 && typeof processedValue != 'string') {
/******/            // Merge properties if mode 2 is set and not a string
/******/            for(var propKey in processedValue) {
/******/                resolveModule.defineExportGetter(namespaceObject, propKey, ((currentKey) => processedValue[currentKey]).bind(null, propKey));
/******/            }
/******/        }
/******/ 		return namespaceObject;
/******/ 	};
/******/
/******/ 	// Provide a getter for `default` export for compatibility
/******/ 	resolveModule.getDefaultExport = function(targetModule) {
/******/ 		var defaultGetter = targetModule && targetModule.__esModule ?
/******/ 			function getModuleDefault() { return targetModule['default']; } :
/******/ 			function getModuleRawExports() { return targetModule; };
/******/ 		resolveModule.defineExportGetter(defaultGetter, 'a', defaultGetter); // 'a' is a common alias for default
/******/ 		return defaultGetter;
/******/ 	};
/******/
/******/ 	// Utility for checking object's own properties
/******/ 	resolveModule.hasOwn = function(targetObject, propertyName) { return Object.prototype.hasOwnProperty.call(targetObject, propertyName); };
/******/
/******/ 	// Public path for assets (empty by default)
/******/ 	resolveModule.publicAssetPath = "";
/******/
/******/
/******/ 	// Execute the primary entry point module and return its exports
/******/ 	const entryPointIdentifier = "./src/contest/atcoder/msol2020/e.ts";
/******/ 	return resolveModule(entryPointIdentifier);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/webpack/buildin/module.js":
/*!********************************************************!*\
  !*** (internal-pkg)/build_utilities/common_module.js ***!
  \********************************************************/
/*! No static exports found in this internal utility */
/***/ (function(currentModuleInstance, moduleExports) {

// This function ensures compatibility for older CommonJS modules within the webpack environment.
currentModuleInstanceExports = function(wrappedModule) {
	// If the polyfill isn't active, initialize it.
	if (!wrappedModule.webpackPolyfillActivated) {
		wrappedModule.deprecateFunction = function() {}; // A placeholder for deprecation warnings
		wrappedModule.searchPaths = []; // An empty array for module search paths
		// wrappedModule.parent is usually undefined initially
		if (!wrappedModule.childModules) wrappedModule.childModules = []; // Initialize children if not present
		Object.defineProperty(wrappedModule, "isLoaded", {
			enumerable: true,
			get: function() {
				return wrappedModule.isFinishedLoading; // Use custom property name
			}
		});
		Object.defineProperty(wrappedModule, "uniqueId", {
			enumerable: true,
			get: function() {
				return wrappedModule.identifier; // Use custom property name
			}
		});
		wrappedModule.webpackPolyfillActivated = 1; // Mark polyfill as active
	}
	return wrappedModule;
};


/***/ }),

/***/ "./src/contest/atcoder/msol2020/e.ts":
/*!***************************************************!*\
  !*** ./src/contest/atcoder/msol2020/e.ts ***
  \***************************************************/
/*! No explicit exports found for this competition solution */
/***/ (function(currentModule, moduleExports, moduleResolver) {

"use strict";
/* WEBPACK_VARS_INJECTION */(function(modulePolyfillWrapper) { // This section handles module-specific variable injections
var __standardImport = (globalThis && globalThis.__importDefault) || function (modObject) {
    // If the module is already an ES module, return it directly.
    // Otherwise, wrap it in an object with a 'default' property.
    return (modObject && modObject.__esModule) ? modObject : { "default": modObject };
};

// Define __esModule on the exports object for ES module compatibility
Object.defineProperty(moduleExports, "__esModule", { value: true });

// Export the primary execution function for external use
moduleExports.executeSolver = void 0;

// Import necessary utilities
const fileSystemOps = __standardImport(moduleResolver("fs")); // Node's file system module
const inputOutputHandler = moduleResolver("./src/contest/common/io.ts"); // Custom I/O utilities

// A large integer value representing infinity for cost calculations
const MAX_POSSIBLE_COST = 1 << 30;

// Enum for coordinate system types or assignment choices
var CoordinateType;
(function (CoordinateType) {
    CoordinateType["HORIZONTAL_AXIS"] = "H"; // Corresponds to X-axis
    CoordinateType["VERTICAL_AXIS"] = "V";   // Corresponds to Y-axis
    CoordinateType["UNASSIGNED"] = "U";      // Not yet assigned to an axis
})(CoordinateType || (CoordinateType = {}));

/**
 * Calculates the total minimum cost for points that are currently unassigned.
 * @param {object} params - Parameters including item count, point details, and current assignments.
 * @param {number} params.itemCount - Total number of points.
 * @param {Array<object>} params.pointDetails - Array of point objects {x, y, p}.
 * @param {Array<CoordinateType>} params.assignmentChoices - Array indicating chosen axis for each point.
 * @returns {number} The accumulated cost for unassigned points based on their closest assigned axis.
 */
function computeMinCostForUnassigned({ itemCount, pointDetails, assignmentChoices }) {
    let accumulatedCost = 0; // Stores the sum of minimum costs for unassigned points

    if (itemCount === 0) {
        return 0; // No points, no cost
    }

    // Helper to calculate absolute difference
    const absoluteDifference = (val1, val2) => {
        let diff = val1 - val2;
        return diff < 0 ? -diff : diff;
    };

    for (let pointIdxA = 0; pointIdxA < itemCount; pointIdxA++) {
        // Only process points that are currently unassigned
        if (assignmentChoices[pointIdxA] !== CoordinateType.UNASSIGNED) {
            continue; // Skip if already assigned
        }

        const currentPoint = pointDetails[pointIdxA];
        let minPointCost = Math.min(
            absoluteDifference(currentPoint.x, 0), // Cost to X-axis origin
            absoluteDifference(currentPoint.y, 0)  // Cost to Y-axis origin
        ) * currentPoint.p; // Multiply by price factor

        // Iterate through all other points to find the closest assigned axis
        for (let pointIdxB = 0; pointIdxB < itemCount; pointIdxB++) {
            const potentialAnchor = pointDetails[pointIdxB];
            const anchorAssignment = assignmentChoices[pointIdxB];

            if (anchorAssignment === CoordinateType.VERTICAL_AXIS) {
                // If point B is assigned to Y-axis, calculate cost to its X-coordinate
                const costToAnchorX = absoluteDifference(currentPoint.x, potentialAnchor.x) * currentPoint.p;
                if (costToAnchorX < minPointCost) {
                    minPointCost = costToAnchorX;
                }
            } else if (anchorAssignment === CoordinateType.HORIZONTAL_AXIS) {
                // If point B is assigned to X-axis, calculate cost to its Y-coordinate
                const costToAnchorY = absoluteDifference(currentPoint.y, potentialAnchor.y) * currentPoint.p;
                if (costToAnchorY < minPointCost) {
                    minPointCost = costToAnchorY;
                }
            }
        }
        accumulatedCost += minPointCost; // Add the minimum cost for this point
    }
    return accumulatedCost;
}

/**
 * Recursive function to explore all possible axis assignments for points.
 * It uses backtracking to try assigning each point to X-axis, Y-axis, or leaving it unassigned.
 * @param {number} currentPointIndex - The index of the point currently being considered.
 * @param {number} assignedCount - The number of points already assigned to an axis.
 * @param {object} sharedSystemState - An object holding shared data for the recursion.
 * @param {Array<CoordinateType>} sharedSystemState.assignmentChoices - Current assignment state.
 * @param {number} sharedSystemState.totalPoints - Total number of points.
 * @param {Array<object>} sharedSystemState.pointData - Point coordinates and prices.
 * @param {Array<number>} sharedSystemState.minCostsPerAssignedGroup - Array to store minimum costs for each `assignedCount`.
 */
function exploreAssignments(currentPointIndex, assignedCount, sharedSystemState) {
    const { assignmentChoices, totalPoints, pointData, minCostsPerAssignedGroup } = sharedSystemState;

    // Base case: All points have been considered for assignment
    if (currentPointIndex === totalPoints) {
        // Once all points are processed, calculate the cost for the current configuration
        const currentConfigurationCost = computeMinCostForUnassigned({
            itemCount: totalPoints,
            pointDetails: pointData,
            assignmentChoices: assignmentChoices
        });
        // Update the minimum cost for the current number of assigned points
        if (currentConfigurationCost < minCostsPerAssignedGroup[assignedCount]) {
            minCostsPerAssignedGroup[assignedCount] = currentConfigurationCost;
        }
        return; // Backtrack
    }

    // --- Recursive calls for each assignment possibility ---

    // 1. Assign current point as UNASSIGNED
    assignmentChoices[currentPointIndex] = CoordinateType.UNASSIGNED;
    exploreAssignments(currentPointIndex + 1, assignedCount, sharedSystemState);

    // 2. Assign current point to HORIZONTAL_AXIS (X-axis)
    assignmentChoices[currentPointIndex] = CoordinateType.HORIZONTAL_AXIS;
    exploreAssignments(currentPointIndex + 1, assignedCount + 1, sharedSystemState);

    // 3. Assign current point to VERTICAL_AXIS (Y-axis)
    assignmentChoices[currentPointIndex] = CoordinateType.VERTICAL_AXIS;
    exploreAssignments(currentPointIndex + 1, assignedCount + 1, sharedSystemState);
}

/**
 * Initializes the recursive solver and returns the array of minimum costs.
 * @param {object} params - Parameters including the number of points and their details.
 * @param {number} params.numPoints - The total count of points.
 * @param {Array<object>} params.pointDetails - An array of point objects {x, y, p}.
 * @returns {Array<number>} An array where `result[k]` is the minimum cost when exactly `k` points are assigned to an axis.
 */
function initiateSolver({ numPoints, pointDetails }) {
    if (numPoints < 0) {
        throw new Error("Number of points cannot be negative.");
    }

    // Initialize an array to store the minimum cost for each possible count of assigned points (0 to N)
    const minCostsPerAssignedGroup = Array.from({ length: numPoints + 1 }, () => MAX_POSSIBLE_COST);
    // Initialize an array to hold the current assignment choices for points
    const currentAssignments = Array(numPoints).fill(CoordinateType.UNASSIGNED); // Pre-fill for clarity

    // Prepare the shared state object for the recursive function
    const processingContext = {
        assignmentChoices: currentAssignments,
        totalPoints: numPoints,
        pointData: pointDetails,
        minCostsPerAssignedGroup: minCostsPerAssignedGroup,
    };

    // Begin the recursive assignment exploration from the first point (index 0) with 0 assigned points
    exploreAssignments(0, 0, processingContext);

    return minCostsPerAssignedGroup;
}

/**
 * Main function to read input, process, and print results.
 * @param {string} inputDataString - The entire input data as a single string.
 */
function processInputAndExecute(inputDataString) {
    const readNextInteger = inputOutputHandler.obtainNextInteger(inputDataString);

    const numPoints = readNextInteger();
    const pointsCollection = [];

    // Construct the array of point objects
    for (let currentIdx = 0; currentIdx < numPoints; currentIdx++) {
        const coordX = readNextInteger();
        const coordY = readNextInteger();
        const priceFactor = readNextInteger();
        pointsCollection.push({ x: coordX, y: coordY, p: priceFactor });
    }

    // Compute the solution and print each result on a new line
    const finalResults = initiateSolver({ numPoints: numPoints, pointDetails: pointsCollection });
    console.log(finalResults.join('\n'));
}

moduleExports.executeSolver = processInputAndExecute;

// Entry point for execution when this module is the main script
if (moduleResolver.unitCache[moduleResolver.entryPointIdentifier] === modulePolyfillWrapper) {
    const stdInputFilePath = "/dev/stdin";
    // Check if fs module exists before trying to read
    if (fileSystemOps && fileSystemOps.default && typeof fileSystemOps.default.readFileSync === 'function') {
        const fileContent = fileSystemOps.default.readFileSync(stdInputFilePath, "utf8");
        processInputAndExecute(fileContent);
    } else {
        // Fallback or error handling if fs is not available (e.g., in browser)
        console.error("File system access is not available for reading /dev/stdin.");
    }
}

/* WEBPACK_VARS_INJECTION */}.call(this, moduleResolver("./node_modules/webpack/buildin/module.js")(currentModule)))

/***/ }),

/***/ "./src/contest/common/io.ts":
/*!******************************************!*\
  !*** ./src/contest/utility/dataStream.ts ***!
  \******************************************/
/*! No static exports found in this utility module */
/***/ (function(module, moduleExports, moduleResolver) {

"use strict";

Object.defineProperty(moduleExports, "__esModule", { value: true });
moduleExports.obtainNextBigInteger = moduleExports.obtainNextInteger = moduleExports.obtainNextSegment = moduleExports.createParsedTokenStream = moduleExports.createTokenStream = void 0;

/**
 * Creates an iterator to yield tokens from a given input string.
 * Tokens are split by whitespace.
 * @param {string} inputLineContent - The string to tokenize.
 * @returns {Generator<string>} An iterator yielding string tokens.
 */
function* createTokenStream(inputLineContent) {
    // Ensure content is trimmed before splitting to handle leading/trailing whitespace
    const parsedSegments = inputLineContent.trim().split(/\s+/);
    for (const segment of parsedSegments) {
        // Skip any empty segments that might result from multiple spaces
        if (segment.length > 0) {
            yield segment;
        }
    }
}
moduleExports.createTokenStream = createTokenStream;

/**
 * Creates an iterator to yield parsed tokens from an input string, applying a parser function.
 * @param {string} inputLineContent - The string to tokenize and parse.
 * @param {function(string): any} valueConverter - A function to parse each token.
 * @returns {Generator<any>} An iterator yielding parsed values.
 */
function* createParsedTokenStream(inputLineContent, valueConverter) {
    const parsedSegments = inputLineContent.trim().split(/\s+/);
    for (const segment of parsedSegments) {
        if (segment.length > 0) {
            yield valueConverter(segment);
        }
    }
}
moduleExports.createParsedTokenStream = createParsedTokenStream;

/**
 * Returns a function that, when called, provides the next string token from the input line.
 * @param {string} inputLineContent - The string containing space-separated values.
 * @returns {function(): string} A function to get the next string.
 */
function obtainNextSegment(inputLineContent) {
    const streamIterator = createTokenStream(inputLineContent);
    const nextValueRetriever = () => {
        const result = streamIterator.next();
        return result.value;
    };
    return nextValueRetriever;
}
moduleExports.obtainNextSegment = obtainNextSegment;

/**
 * Returns a function that, when called, provides the next integer from the input line.
 * @param {string} inputLineContent - The string containing space-separated integer values.
 * @returns {function(): number} A function to get the next integer.
 */
function obtainNextInteger(inputLineContent) {
    const streamIterator = createTokenStream(inputLineContent);
    const integerRetriever = () => {
        const rawValue = streamIterator.next().value;
        // Using Number.parseInt for explicit base 10 parsing
        return Number.parseInt(rawValue, 10);
    };
    return integerRetriever;
}
moduleExports.obtainNextInteger = obtainNextInteger;

/**
 * Returns a function that, when called, provides the next BigInt from the input line.
 * @param {string} inputLineContent - The string containing space-separated BigInt values.
 * @returns {function(): BigInt} A function to get the next BigInt.
 */
function obtainNextBigInteger(inputLineContent) {
    const streamIterator = createTokenStream(inputLineContent);
    const bigIntRetriever = () => {
        const rawValue = streamIterator.next().value;
        // Using globalThis.BigInt for explicit global scope reference
        return globalThis.BigInt(rawValue);
    };
    return bigIntRetriever;
}
moduleExports.obtainNextBigInteger = obtainNextBigInteger;


/***/ }),

/***/ "fs":
/*!********************************!*\
  !*** external "node:fs" module ***!
  \********************************/
/*! No static exports found in external 'fs' */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ })

/******/ });
//# sourceMappingURL=submit.js.map