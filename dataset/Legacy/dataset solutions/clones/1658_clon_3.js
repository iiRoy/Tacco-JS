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
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
const io_1 = __webpack_require__(/*! ../../common/io */ "./src/contest/common/io.ts");

var PointAssignmentType;
(function (PointAssignmentType) {
    PointAssignmentType["AssignX"] = "X";
    PointAssignmentType["AssignY"] = "Y";
    PointAssignmentType["NoAssignment"] = "N";
})(PointAssignmentType || (PointAssignmentType = {}));

const MAX_INT_VALUE = Number.MAX_SAFE_INTEGER;

function calculateInitialPointCost(point) {
    return Math.min(Math.abs(point.x), Math.abs(point.y)) * point.p;
}

function applyAxisOptimization(
    pointsArray,
    assignmentsArray,
    axisProperty,
    targetAssignmentType,
    currentCostsArray
) {
    pointsArray.sort((a, b) => a[axisProperty] - b[axisProperty]);

    let lastAssignedPointIndex = null;
    for (let i = 0; i < pointsArray.length; i++) {
        const currentPoint = pointsArray[i];
        const originalPointIdentifier = currentPoint.i;
        if (assignmentsArray[originalPointIdentifier] === targetAssignmentType) {
            lastAssignedPointIndex = i;
            currentCostsArray[originalPointIdentifier] = 0;
        } else if (lastAssignedPointIndex !== null) {
            const coordinateDifference = Math.abs(currentPoint[axisProperty] - pointsArray[lastAssignedPointIndex][axisProperty]);
            currentCostsArray[originalPointIdentifier] = Math.min(currentCostsArray[originalPointIdentifier], coordinateDifference * currentPoint.p);
        }
    }

    lastAssignedPointIndex = null;
    for (let i = pointsArray.length - 1; i >= 0; i--) {
        const currentPoint = pointsArray[i];
        const originalPointIdentifier = currentPoint.i;
        if (assignmentsArray[originalPointIdentifier] === targetAssignmentType) {
            lastAssignedPointIndex = i;
            currentCostsArray[originalPointIdentifier] = 0;
        } else if (lastAssignedPointIndex !== null) {
            const coordinateDifference = Math.abs(currentPoint[axisProperty] - pointsArray[lastAssignedPointIndex][axisProperty]);
            currentCostsArray[originalPointIdentifier] = Math.min(currentCostsArray[originalPointIdentifier], coordinateDifference * currentPoint.p);
        }
    }
}

function calculateConfigurationCost({ N: pointCount, C: pointsData, cand: assignments }) {
    const currentMinCosts = pointsData.map(calculateInitialPointCost);

    applyAxisOptimization(pointsData, assignments, 'x', PointAssignmentType.AssignY, currentMinCosts);
    applyAxisOptimization(pointsData, assignments, 'y', PointAssignmentType.AssignX, currentMinCosts);

    return currentMinCosts.reduce((totalSum, value) => totalSum + value, 0);
}

function exploreAssignmentCombinations(currentPointIndex, assignedCount, solverContext) {
    const { pointAssignments, numPoints, pointsData, resultsArray } = solverContext;

    if (currentPointIndex === numPoints) {
        const clonedPointsForCalc = [...pointsData];
        const configurationCost = calculateConfigurationCost({ N: numPoints, C: clonedPointsForCalc, cand: pointAssignments });
        resultsArray[assignedCount] = Math.min(resultsArray[assignedCount], configurationCost);
        return;
    }

    pointAssignments[currentPointIndex] = PointAssignmentType.NoAssignment;
    exploreAssignmentCombinations(currentPointIndex + 1, assignedCount, solverContext);

    pointAssignments[currentPointIndex] = PointAssignmentType.AssignX;
    exploreAssignmentCombinations(currentPointIndex + 1, assignedCount + 1, solverContext);

    pointAssignments[currentPointIndex] = PointAssignmentType.AssignY;
    exploreAssignmentCombinations(currentPointIndex + 1, assignedCount + 1, solverContext);
}

function solveMinCostProblem({ N: totalPoints, C: inputPoints }) {
    const minimumCostsPerK = Array(totalPoints + 1).fill(MAX_INT_VALUE);
    const pointAssignments = Array(totalPoints);

    const problemSolverContext = {
        numPoints: totalPoints,
        pointsData: inputPoints,
        resultsArray: minimumCostsPerK,
        pointAssignments,
    };

    exploreAssignmentCombinations(0, 0, problemSolverContext);
    return minimumCostsPerK;
}

function runSolution(inputLine) {
    const fetchNextInteger = io_1.getIntegerFetcher(inputLine);
    const totalPointsCount = fetchNextInteger();
    const pointDetails = [];

    for (let idx = 0; idx < totalPointsCount; idx++) {
        const coordX = fetchNextInteger();
        const coordY = fetchNextInteger();
        const power = fetchNextInteger();
        pointDetails.push({ x: coordX, y: coordY, p: power, i: idx });
    }
    console.log(solveMinCostProblem({ N: totalPointsCount, C: pointDetails }).join('\n'));
}
exports.main = runSolution;
if (__webpack_require__.c[__webpack_require__.s] === module) {
    const inputLine = fs_1.default.readFileSync("/dev/stdin", "utf8");
    runSolution(inputLine);
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
exports.getBigIntegerFetcher = exports.getIntegerFetcher = exports.getLineValueFetcher = exports.createParsedTokenizer = exports.createLineTokenizer = void 0;

const WHITESPACE_REGEX = /\s+/;

function* createLineTokenizer(line) {
    const tokens = line.split(WHITESPACE_REGEX);
    for (const token of tokens) {
        yield token;
    }
}
exports.createLineTokenizer = createLineTokenizer;

function* createParsedTokenizer(line, parser) {
    const tokens = line.split(WHITESPACE_REGEX);
    for (const token of tokens) {
        yield parser(token);
    }
}
exports.createParsedTokenizer = createParsedTokenizer;

function getLineValueFetcher(line) {
    const it = createLineTokenizer(line);
    return () => it.next().value;
}
exports.getLineValueFetcher = getLineValueFetcher;

function getIntegerFetcher(line) {
    const it = createLineTokenizer(line);
    return () => parseInt(it.next().value);
}
exports.getIntegerFetcher = getIntegerFetcher;

function getBigIntegerFetcher(line) {
    const it = createLineTokenizer(line);
    return () => BigInt(it.next().value);
}
exports.getBigIntegerFetcher = getBigIntegerFetcher;


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
