/*! path: /home/ts3min/work/tspro/src/contest/atcoder/msol2020/e.ts */
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/contest/atcoder/msol2020/e.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),

/***/ "./src/contest/atcoder/msol2020/e.ts":
/*!*******************************************!*\
  !*** ./src/contest/atcoder/msol2020/e.ts ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0; // Export the primary function
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs")); // File system module import
const io_1 = __webpack_require__(/*! ../../common/io */ "./src/contest/common/io.ts"); // Custom I/O utilities import

// A large integer representing infinity for cost calculations, used for initialization.
const MAX_POSSIBLE_VALUE = 1 << 30;

// Enum to define the axis type for a point's selection.
// The string values "X", "Y", "N" are critical for problem logic and must not be changed.
var CoordinateSelection;
(function (CoordinateSelection) {
    CoordinateSelection["X_AXIS"] = "X"; // Point is selected for X-axis projection.
    CoordinateSelection["Y_AXIS"] = "Y"; // Point is selected for Y-axis projection.
    CoordinateSelection["NONE"] = "N"; // Point is not selected for any axis.
})(CoordinateSelection || (CoordinateSelection = {}));

/**
 * Calculates the total cost for points not yet assigned to an axis.
 * This function computes the minimum cost for each unassigned point based on its own coordinates
 * or its distance to an already assigned point.
 *
 * @param {object} params - Parameters for calculation.
 * @param {number} params.numPoints - Total number of points.
 * @param {Array<object>} params.pointsData - Array of point objects, each with x, y, and p properties.
 * @param {Array<CoordinateSelection>} params.selectionArray - Array indicating the selection status for each point.
 * @returns {number} The calculated total cost for the unassigned points.
 */
function calculateUnassignedCost({ numPoints, pointsData, selectionArray }) {
    let totalCalculatedCost = 0; // Accumulator for the final cost.

    // Iterate through all points to find those not yet assigned.
    for (let pointIndex = 0; pointIndex < numPoints; pointIndex++) {
        // Only consider points that have not been assigned to an axis yet.
        if (selectionArray[pointIndex] !== CoordinateSelection.NONE) {
            continue; // Skip if already assigned.
        }

        // Calculate initial cost for the current unassigned point.
        // This is the minimum of its absolute x or y coordinate multiplied by its pressure.
        let currentPointCost = Math.min(Math.abs(pointsData[pointIndex].x), Math.abs(pointsData[pointIndex].y)) * pointsData[pointIndex].p;

        // Check against already assigned points to find a potentially lower cost.
        for (let otherPointIndex = 0; otherPointIndex < numPoints; otherPointIndex++) {
            // If the other point is assigned to Y-axis, calculate cost based on X-difference.
            if (selectionArray[otherPointIndex] === CoordinateSelection.Y_AXIS) {
                currentPointCost = Math.min(currentPointCost, Math.abs(pointsData[pointIndex].x - pointsData[otherPointIndex].x) * pointsData[pointIndex].p);
            }
            // If the other point is assigned to X-axis, calculate cost based on Y-difference.
            else if (selectionArray[otherPointIndex] === CoordinateSelection.X_AXIS) {
                currentPointCost = Math.min(currentPointCost, Math.abs(pointsData[pointIndex].y - pointsData[otherPointIndex].y) * pointsData[pointIndex].p);
            }
        }
        totalCalculatedCost += currentPointCost; // Add the minimum cost for this point to the total.
    }
    return totalCalculatedCost; // Return the accumulated cost.
}

/**
 * Recursive function to explore all possible assignments of points to axes.
 * This function uses backtracking to try three options for each point:
 * 1. Not assigned (NONE).
 * 2. Assigned to X-axis (X_AXIS).
 * 3. Assigned to Y-axis (Y_AXIS).
 *
 * @param {number} currentIndex - The current point index being considered (from 0 to numPoints-1).
 * @param {number} currentKValue - The count of points assigned to an axis so far.
 * @param {object} systemState - Object holding shared state for the recursion.
 * @param {Array<CoordinateSelection>} systemState.selectionArray - Current assignment choices for each point.
 * @param {number} systemState.numPoints - Total number of points.
 * @param {Array<object>} systemState.pointsData - Point data (x, y, p).
 * @param {Array<number>} systemState.resultArray - Array to store minimum costs for each k.
 */
function exploreAssignments(currentIndex, currentKValue, systemState) {
    const { selectionArray, numPoints, pointsData, resultArray } = systemState;

    // Base case: all points have been considered.
    if (currentIndex === numPoints) {
        // Calculate the cost for the current set of assignments.
        const calculatedResult = calculateUnassignedCost({ numPoints, pointsData, selectionArray });
        // Update the minimum cost for the current k-value (number of assigned points).
        resultArray[currentKValue] = Math.min(resultArray[currentKValue], calculatedResult);
        return;
    }

    // Recursive step: Try assigning the current point in three ways.

    // 1. Assign to NONE (not selected for any axis).
    selectionArray[currentIndex] = CoordinateSelection.NONE;
    exploreAssignments(currentIndex + 1, currentKValue, systemState);

    // 2. Assign to X_AXIS (selected for X-axis projection).
    selectionArray[currentIndex] = CoordinateSelection.X_AXIS;
    exploreAssignments(currentIndex + 1, currentKValue + 1, systemState);

    // 3. Assign to Y_AXIS (selected for Y-axis projection).
    selectionArray[currentIndex] = CoordinateSelection.Y_AXIS;
    exploreAssignments(currentIndex + 1, currentKValue + 1, systemState);
}

/**
 * Solves the main problem by finding minimum costs for different k values.
 * It initializes the state and then calls the recursive exploration function.
 *
 * @param {object} params - Input parameters.
 * @param {number} params.numPoints - Total number of points.
 * @param {Array<object>} params.pointsData - Array of point objects.
 * @returns {Array<number>} An array where resultArray[k] is the minimum cost for k selected points.
 */
function solveProblem({ numPoints, pointsData }) {
    // Initialize resultArray with a large value (infinity) for all possible k values.
    const resultArray = Array(numPoints + 1).fill(MAX_POSSIBLE_VALUE);
    // Initialize selectionArray to store current choices for each point.
    const selectionArray = Array(numPoints);

    // Create a system state object to pass around in recursion, avoiding many parameters.
    const systemState = {
        numPoints,
        pointsData,
        resultArray,
        selectionArray,
    };

    // Start the recursive exploration from the first point (index 0) with 0 points assigned (k=0).
    exploreAssignments(0, 0, systemState);

    return resultArray; // Return the array of minimum costs.
}

/**
 * Main entry point function to read input, process, and print output.
 * This function orchestrates the entire process from input parsing to result display.
 *
 * @param {string} inputLine - The entire input string from stdin.
 */
function entryPoint(inputLine) {
    // Get a function to parse the next integer from the input string.
    const getNextInteger = io_1.getNextInt(inputLine);
    // Read the total number of points from the input.
    const numPoints = getNextInteger();
    // Initialize an array to store point data.
    const pointsData = [];

    // Read x, y, and p coordinates for each point.
    for (let pointIndex = 0; pointIndex < numPoints; pointIndex++) {
        const coordX = getNextInteger();
        const coordY = getNextInteger();
        const pressure = getNextInteger();
        pointsData.push({ x: coordX, y: coordY, p: pressure });
    }

    // Solve the problem with the collected data and print the results, each on a new line.
    console.log(solveProblem({ numPoints, pointsData }).join('\n'));
}

exports.main = entryPoint; // Export the entry point function.

// Check if this module is the main entry point (not imported by another module).
if (__webpack_require__.c[__webpack_require__.s] === module) {
    // Read input from stdin and call the main entry point.
    const inputContent = fs_1.default.readFileSync("/dev/stdin", "utf8");
    entryPoint(inputContent);
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../../node_modules/webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

/***/ }),

/***/ "./src/contest/common/io.ts":
/*!**********************************!*\
  !*** ./src/contest/common/io.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextBigInt = exports.getNextInt = exports.getNext = exports.getIteratorWithParser = exports.getIterator = void 0;

/**
 * Creates an iterator over tokens in a string, splitting by one or more whitespace characters.
 *
 * @param {string} inputString - The string to tokenize.
 * @yields {string} Each token from the string.
 */
function* createStringIterator(inputString) {
    const stringTokens = inputString.split(/\s+/);
    for (const singleToken of stringTokens) {
        yield singleToken;
    }
}
exports.getIterator = createStringIterator;

/**
 * Creates an iterator over tokens in a string, applying a specified parser function to each token.
 *
 * @param {string} inputString - The string to tokenize.
 * @param {Function} parsingFunction - A function to parse each token (e.g., parseInt, parseFloat).
 * @yields {*} The parsed value of each token.
 */
function* createParsedIterator(inputString, parsingFunction) {
    const stringTokens = inputString.split(/\s+/);
    for (const singleToken of stringTokens) {
        yield parsingFunction(singleToken);
    }
}
exports.getIteratorWithParser = createParsedIterator;

/**
 * Returns a function that, when called, provides the next string token from an input line.
 * This is useful for sequential reading of string inputs.
 *
 * @param {string} inputString - The input line.
 * @returns {Function} A function that, when called, returns the next string token.
 */
function getNextStringToken(inputString) {
    const iteratorInstance = createStringIterator(inputString);
    return () => iteratorInstance.next().value;
}
exports.getNext = getNextStringToken;

/**
 * Returns a function that, when called, provides the next integer token from an input line.
 * This is useful for sequential reading of integer inputs.
 *
 * @param {string} inputString - The input line.
 * @returns {Function} A function that, when called, returns the next integer token.
 */
function getNextInteger(inputString) {
    const iteratorInstance = createStringIterator(inputString);
    return () => parseInt(iteratorInstance.next().value);
}
exports.getNextInt = getNextInteger;

/**
 * Returns a function that, when called, provides the next BigInt token from an input line.
 * This is useful for sequential reading of large integer inputs.
 *
 * @param {string} inputString - The input line.
 * @returns {Function} A function that, when called, returns the next BigInt token.
 */
function getNextBigInteger(inputString) {
    const iteratorInstance = createStringIterator(inputString);
    return () => BigInt(iteratorInstance.next().value);
}
exports.getNextBigInt = getNextBigInteger;


/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ })

/******/ });
//# sourceMappingURL=submit.js.map
