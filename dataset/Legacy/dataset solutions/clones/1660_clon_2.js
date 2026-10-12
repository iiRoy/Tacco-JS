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
exports.main = void 0;
const fileSystemModule = __importDefault(__webpack_require__(/*! fs */ "fs"));
const inputOutputModule = __webpack_require__(/*! ../../common/io */ "./src/contest/common/io.ts");
// Defines possible axis assignments for points
var CoordType;
(function (CoordType) {
    CoordType["Horizontal"] = "X";
    CoordType["Vertical"] = "Y";
    CoordType["NoneAssigned"] = "N";
})(CoordType || (CoordType = {}));
/**
 * Calculates the total minimum cost for a given set of point assignments.
 * @param {object} params - Parameters for calculation.
 * @param {number} params.pointCount - Total number of points.
 * @param {Array<object>} params.allPoints - Original array of point objects.
 * @param {Array<CoordType>} params.currentAssignments - Array indicating axis assignment for each point.
 * @param {Array<object>} params.xSortedPoints - Points sorted by X-coordinate.
 * @param {Array<object>} params.ySortedPoints - Points sorted by Y-coordinate.
 * @returns {number} The total calculated minimum cost.
 */
function computeCost({ pointCount, allPoints, currentAssignments, xSortedPoints, ySortedPoints, }) {
    // Initialize an array to store the shortest distance for each point
    // Initially, it's the minimum of |x| or |y| times its power.
    const minDistances = Array(pointCount);
    for (let idx = 0; idx < pointCount; idx++) {
        minDistances[idx] = Math.min(Math.abs(allPoints[idx].x), Math.abs(allPoints[idx].y)) * allPoints[idx].p;
    }
    // First pass: Iterate through X-sorted points to find minimum distances
    // considering points assigned to Y-axis.
    let prevIdx = null;
    for (let idx = 0; idx < pointCount; idx++) {
        // If the current point is assigned to Y-axis, it acts as a reference point.
        if (currentAssignments[xSortedPoints[idx].i] == CoordType.Vertical) {
            prevIdx = idx;
            minDistances[xSortedPoints[idx].i] = 0; // Cost is 0 if it's a reference point
        }
        // If a reference point exists, update the current point's minimum distance
        else if (prevIdx !== null) {
            minDistances[xSortedPoints[idx].i] = Math.min(Math.abs(xSortedPoints[idx].x - xSortedPoints[prevIdx].x) * xSortedPoints[idx].p, minDistances[xSortedPoints[idx].i]);
        }
    }
    // Second pass (reverse): Iterate through X-sorted points from right to left
    // to find minimum distances considering points assigned to Y-axis.
    prevIdx = null;
    for (let idx = pointCount - 1; idx >= 0; idx--) {
        if (currentAssignments[xSortedPoints[idx].i] == CoordType.Vertical) {
            prevIdx = idx;
            minDistances[xSortedPoints[idx].i] = 0;
        }
        else if (prevIdx !== null) {
            minDistances[xSortedPoints[idx].i] = Math.min(Math.abs(xSortedPoints[idx].x - xSortedPoints[prevIdx].x) * xSortedPoints[idx].p, minDistances[xSortedPoints[idx].i]);
        }
    }
    // Third pass: Iterate through Y-sorted points to find minimum distances
    // considering points assigned to X-axis.
    prevIdx = null;
    for (let idx = 0; idx < pointCount; idx++) {
        if (currentAssignments[ySortedPoints[idx].i] == CoordType.Horizontal) {
            prevIdx = idx;
            minDistances[ySortedPoints[idx].i] = 0;
        }
        else if (prevIdx !== null) {
            minDistances[ySortedPoints[idx].i] = Math.min(Math.abs(ySortedPoints[idx].y - ySortedPoints[prevIdx].y) * ySortedPoints[idx].p, minDistances[ySortedPoints[idx].i]);
        }
    }
    // Fourth pass (reverse): Iterate through Y-sorted points from bottom to top
    // to find minimum distances considering points assigned to X-axis.
    prevIdx = null;
    for (let idx = pointCount - 1; idx >= 0; idx--) {
        if (currentAssignments[ySortedPoints[idx].i] == CoordType.Horizontal) {
            prevIdx = idx;
            minDistances[ySortedPoints[idx].i] = 0;
        }
        else if (prevIdx !== null) {
            minDistances[ySortedPoints[idx].i] = Math.min(Math.abs(ySortedPoints[idx].y - ySortedPoints[prevIdx].y) * ySortedPoints[idx].p, minDistances[ySortedPoints[idx].i]);
        }
    }
    // Sum up all the minimum distances to get the total cost.
    return minDistances.reduce((totalSum, currentVal) => totalSum + currentVal, 0);
}
/**
 * Recursive function to explore all combinations of axis assignments.
 * @param {number} idx - Current point index being considered.
 * @param {number} count - Number of points assigned to an axis so far.
 * @param {object} systemState - Object holding shared state for the recursion.
 */
function exploreCombinations(idx, count, systemState) {
    const { currentAssignments, pointCount, allPoints, resultCosts, xSortedPoints, ySortedPoints } = systemState;
    // Base case: All points have been assigned.
    if (idx === pointCount) {
        // Calculate the cost for this specific combination.
        const currentResult = computeCost({
            pointCount: pointCount,
            allPoints: allPoints,
            xSortedPoints: xSortedPoints,
            ySortedPoints: ySortedPoints,
            currentAssignments: currentAssignments
        });
        // Update the minimum cost for the current 'count' of assigned points.
        resultCosts[count] = Math.min(resultCosts[count], currentResult);
        return;
    }
    // Recursive step: Try assigning the current point to 'NoneAssigned'.
    currentAssignments[idx] = CoordType.NoneAssigned;
    exploreCombinations(idx + 1, count, systemState);
    // Recursive step: Try assigning the current point to 'Horizontal' (X-axis).
    currentAssignments[idx] = CoordType.Horizontal;
    exploreCombinations(idx + 1, count + 1, systemState);
    // Recursive step: Try assigning the current point to 'Vertical' (Y-axis).
    currentAssignments[idx] = CoordType.Vertical;
    exploreCombinations(idx + 1, count + 1, systemState);
}
/**
 * Solves the main problem by finding minimum costs for different numbers of assigned points.
 * @param {object} params - Input parameters.
 * @param {number} params.N - Total number of points.
 * @param {Array<object>} params.C - Array of point objects.
 * @returns {Array<number>} An array where `resultCosts[k]` is the minimum cost when `k` points are assigned to an axis.
 */
function determineMinCosts({ N, C }) {
    // Initialize an array to store the minimum costs for k = 0 to N assigned points.
    // Fill with a very large number initially.
    const finalCosts = Array(N + 1).fill(Number.MAX_SAFE_INTEGER);
    // Array to hold the axis assignment choice for each point during recursion.
    const assignmentChoices = Array(N);
    // Create sorted copies of the points for efficient distance calculations.
    const pointsSortedByX = [...C];
    pointsSortedByX.sort((a, b) => a.x - b.x);
    const pointsSortedByY = [...C];
    pointsSortedByY.sort((a, b) => a.y - b.y);
    // Bundle all necessary state into a single object for recursive calls.
    const systemState = {
        pointCount: N,
        allPoints: C,
        resultCosts: finalCosts,
        currentAssignments: assignmentChoices,
        xSortedPoints: pointsSortedByX,
        ySortedPoints: pointsSortedByY,
    };
    // Start the recursive exploration from the first point (index 0) with 0 assigned points.
    exploreCombinations(0, 0, systemState);
    return finalCosts;
}
/**
 * Main function to process input and output results.
 * @param {string} inputLine - The entire input string.
 */
function executeSolution(inputLine) {
    // Helper function to read the next integer from the input.
    const readInteger = inputOutputModule.fetchNextInteger(inputLine);
    // Read the total number of points.
    const numPoints = readInteger();
    // Array to store all point data.
    const pointData = [];
    // Read coordinates and power for each point.
    for (let idx = 0; idx < numPoints; idx++) {
        const coordX = readInteger();
        const coordY = readInteger();
        const powerVal = readInteger();
        pointData.push({ x: coordX, y: coordY, p: powerVal, i: idx });
    }
    // Calculate and print the results.
    console.log(determineMinCosts({ N: numPoints, C: pointData }).join('\n'));
}
exports.main = executeSolution;
// Entry point for execution when run as a script (e.g., in Node.js).
if (__webpack_require__.c[__webpack_require__.s] === module) {
    const inputContent = fileSystemModule.default.readFileSync("/dev/stdin", "utf8");
    executeSolution(inputContent);
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
exports.fetchNextBigInteger = exports.fetchNextInteger = exports.fetchNextToken = exports.createParsedIterator = exports.createTokenIterator = void 0;
/**
 * Creates an iterator that yields tokens from a line of text.
 * Tokens are separated by one or more whitespace characters.
 * @param {string} line - The input string.
 * @returns {Generator<string>} An iterator yielding string tokens.
 */
function* createTokenIterator(line) {
    const inputTokens = line.split(/\s+/);
    for (const currentToken of inputTokens) {
        yield currentToken;
    }
}
exports.createTokenIterator = createTokenIterator;
/**
 * Creates an iterator that yields parsed tokens from a line of text.
 * @param {string} line - The input string.
 * @param {function(string): any} parser - A function to parse each token.
 * @returns {Generator<any>} An iterator yielding parsed tokens.
 */
function* createParsedIterator(line, parser) {
    const inputTokens = line.split(/\s+/);
    for (const currentToken of inputTokens) {
        yield parser(currentToken);
    }
}
exports.createParsedIterator = createParsedIterator;
/**
 * Returns a function that, when called, provides the next string token from the input line.
 * @param {string} line - The input string.
 * @returns {function(): string} A function to get the next token.
 */
function fetchNextToken(line) {
    const dataIterator = createTokenIterator(line);
    return () => dataIterator.next().value;
}
exports.fetchNextToken = fetchNextToken;
/**
 * Returns a function that, when called, provides the next integer from the input line.
 * @param {string} line - The input string.
 * @returns {function(): number} A function to get the next integer.
 */
function fetchNextInteger(line) {
    const dataIterator = createTokenIterator(line);
    return () => parseInt(dataIterator.next().value);
}
exports.fetchNextInteger = fetchNextInteger;
/**
 * Returns a function that, when called, provides the next BigInt from the input line.
 * @param {string} line - The input string.
 * @returns {function(): bigint} A function to get the next BigInt.
 */
function fetchNextBigInteger(line) {
    const dataIterator = createTokenIterator(line);
    return () => BigInt(dataIterator.next().value);
}
exports.fetchNextBigInteger = fetchNextBigInteger;


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
