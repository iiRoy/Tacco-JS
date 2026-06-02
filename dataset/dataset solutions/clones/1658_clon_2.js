/******/ (function(moduleMap) {
/******/ 	// The internal module cache
/******/ 	var cachedModules = {};
/******/
/******/ 	// The module loading function
/******/ 	function __webpack_loader__(moduleIdentifier) {
/******/
/******/ 		// Check if module is already in cache
/******/ 		if(cachedModules[moduleIdentifier]) {
/******/ 			return cachedModules[moduleIdentifier].exports;
/******/ 		}
/******/ 		// Create a fresh module entry (and store it in the cache)
/******/ 		var currentModule = cachedModules[moduleIdentifier] = {
/******/ 			i: moduleIdentifier,
/******/ 			l: false, // 'loaded' flag
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module's function
/******/ 		moduleMap[moduleIdentifier].call(currentModule.exports, currentModule, currentModule.exports, __webpack_loader__);
/******/
/******/ 		// Mark the module as fully loaded
/******/ 		currentModule.l = true;
/******/
/******/ 		// Return the module's exports
/******/ 		return currentModule.exports;
/******/ 	}
/******/
/******/
/******/ 	// Expose the modules object (__webpack_modules__)
/******/ 	__webpack_loader__.m = moduleMap;
/******/
/******/ 	// Expose the module cache
/******/ 	__webpack_loader__.c = cachedModules;
/******/
/******/ 	// Define a getter function for harmony exports
/******/ 	__webpack_loader__.d = function(exportsObj, exportName, getterFunc) {
/******/ 		if(!__webpack_loader__.o(exportsObj, exportName)) {
/******/ 			Object.defineProperty(exportsObj, exportName, { enumerable: true, get: getterFunc });
/******/ 		}
/******/ 	};
/******/
/******/ 	// Define __esModule on exports
/******/ 	__webpack_loader__.r = function(exportsObj) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exportsObj, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exportsObj, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// Create a fake namespace object for compatibility
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the namespace
/******/ 	// mode & 4: return value when already a namespace object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_loader__.t = function(val, mode) {
/******/ 		if(mode & 1) val = __webpack_loader__(val);
/******/ 		if(mode & 8) return val;
/******/ 		if((mode & 4) && typeof val === 'object' && val && val.__esModule) return val;
/******/ 		var namespaceObj = Object.create(null);
/******/ 		__webpack_loader__.r(namespaceObj);
/******/ 		Object.defineProperty(namespaceObj, 'default', { enumerable: true, value: val });
/******/ 		if(mode & 2 && typeof val != 'string') for(var propKey in val) __webpack_loader__.d(namespaceObj, propKey, function(propKey) { return val[propKey]; }.bind(null, propKey));
/******/ 		return namespaceObj;
/******/ 	};
/******/
/******/ 	// Get default export function for compatibility with non-harmony modules
/******/ 	__webpack_loader__.n = function(mod) {
/******/ 		var getter = mod && mod.__esModule ?
/******/ 			function getDef() { return mod['default']; } :
/******/ 			function getModExports() { return mod; };
/******/ 		__webpack_loader__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call shorthand
/******/ 	__webpack_loader__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_loader__.p = "";
/******/
/******/
/******/ 	// Load the entry module and return its exports
/******/ 	return __webpack_loader__(__webpack_loader__.s = "./src/contest/atcoder/msol2020/e.ts");
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
		// module.parent is undefined by default
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
/***/ (function(module, exports, __webpack_loader__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processInput = void 0;
const fs_1 = __importDefault(__webpack_loader__(/*! fs */ "fs"));
const io_1 = __webpack_loader__(/*! ../../common/io */ "./src/contest/common/io.ts");
var CoordType;
(function (CoordType) {
    CoordType["X"] = "X";
    CoordType["Y"] = "Y";
    CoordType["N"] = "N";
})(CoordType || (CoordType = {}));
function computeMinCost({ numPoints, pointsData, candidateAxes }) {
    const minDistances = Array(numPoints);
    for (let idx = 0; idx < numPoints; idx++) {
        minDistances[idx] = Math.min(Math.abs(pointsData[idx].coordX), Math.abs(pointsData[idx].coordY)) * pointsData[idx].powerVal;
    }
    // Sort by X coordinate
    pointsData.sort((ptA, ptB) => ptA.coordX - ptB.coordX);
    let prevIdx = null;
    for (let idx = 0; idx < numPoints; idx++) {
        if (candidateAxes[pointsData[idx].originalIndex] == CoordType.Y) {
            prevIdx = idx;
            minDistances[pointsData[idx].originalIndex] = 0;
        }
        else if (prevIdx !== null) {
            minDistances[pointsData[idx].originalIndex] = Math.min(Math.abs(pointsData[idx].coordX - pointsData[prevIdx].coordX) * pointsData[idx].powerVal, minDistances[pointsData[idx].originalIndex]);
        }
    }
    prevIdx = null;
    for (let idx = numPoints - 1; idx >= 0; idx--) {
        if (candidateAxes[pointsData[idx].originalIndex] == CoordType.Y) {
            prevIdx = idx;
            minDistances[pointsData[idx].originalIndex] = 0;
        }
        else if (prevIdx !== null) {
            minDistances[pointsData[idx].originalIndex] = Math.min(Math.abs(pointsData[idx].coordX - pointsData[prevIdx].coordX) * pointsData[idx].powerVal, minDistances[pointsData[idx].originalIndex]);
        }
    }
    // Sort by Y coordinate
    pointsData.sort((ptA, ptB) => ptA.coordY - ptB.coordY);
    prevIdx = null;
    for (let idx = 0; idx < numPoints; idx++) {
        if (candidateAxes[pointsData[idx].originalIndex] == CoordType.X) {
            prevIdx = idx;
            minDistances[pointsData[idx].originalIndex] = 0;
        }
        else if (prevIdx !== null) {
            minDistances[pointsData[idx].originalIndex] = Math.min(Math.abs(pointsData[idx].coordY - pointsData[prevIdx].coordY) * pointsData[idx].powerVal, minDistances[pointsData[idx].originalIndex]);
        }
    }
    prevIdx = null;
    for (let idx = numPoints - 1; idx >= 0; idx--) {
        if (candidateAxes[pointsData[idx].originalIndex] == CoordType.X) {
            prevIdx = idx;
            minDistances[pointsData[idx].originalIndex] = 0;
        }
        else if (prevIdx !== null) {
            minDistances[pointsData[idx].originalIndex] = Math.min(Math.abs(pointsData[idx].coordY - pointsData[prevIdx].coordY) * pointsData[idx].powerVal, minDistances[pointsData[idx].originalIndex]);
        }
    }
    return minDistances.reduce((totalSum, currentVal) => totalSum + currentVal, 0);
}
function recursiveSolver(currentIdx, currentK, systemState) {
    const { candidateAxes, numPoints, pointsData, resultsArray } = systemState;
    if (currentIdx === numPoints) {
        const clonedPoints = [...pointsData];
        const currentResult = computeMinCost({ numPoints, pointsData: clonedPoints, candidateAxes });
        resultsArray[currentK] = Math.min(resultsArray[currentK], currentResult);
        return;
    }
    // Option 1: No axis chosen for this point
    candidateAxes[currentIdx] = CoordType.N;
    recursiveSolver(currentIdx + 1, currentK, systemState);
    // Option 2: X-axis chosen for this point
    candidateAxes[currentIdx] = CoordType.X;
    recursiveSolver(currentIdx + 1, currentK + 1, systemState);
    // Option 3: Y-axis chosen for this point
    candidateAxes[currentIdx] = CoordType.Y;
    recursiveSolver(currentIdx + 1, currentK + 1, systemState);
}
function findOptimalCosts({ totalPoints, pointList }) {
    const finalCosts = Array(totalPoints + 1).fill(Number.MAX_SAFE_INTEGER);
    const axisChoices = Array(totalPoints);
    const solverContext = {
        numPoints: totalPoints,
        pointsData: pointList,
        resultsArray: finalCosts,
        candidateAxes: axisChoices,
    };
    recursiveSolver(0, 0, solverContext);
    return finalCosts;
}
function processInput(inputLine) {
    const getNextInteger = io_1.getIntegerReader(inputLine);
    const totalCount = getNextInteger();
    const pointCollection = [];
    for (let idx = 0; idx < totalCount; idx++) {
        const xCoord = getNextInteger();
        const yCoord = getNextInteger();
        const powerFactor = getNextInteger();
        pointCollection.push({ coordX: xCoord, coordY: yCoord, powerVal: powerFactor, originalIndex: idx });
    }
    console.log(findOptimalCosts({ totalPoints: totalCount, pointList: pointCollection }).join('\n'));
}
exports.processInput = processInput;
if (__webpack_loader__.c[__webpack_loader__.s] === module) {
    const inputData = fs_1.default.readFileSync("/dev/stdin", "utf8");
    processInput(inputData);
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_loader__(/*! ./../../../../node_modules/webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

/***/ }),

/***/ "./src/contest/common/io.ts":
/*!**********************************!*\
  !*** ./src/contest/common/io.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_loader__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.getBigIntegerReader = exports.getIntegerReader = exports.getSingleNext = exports.createParsedIterator = exports.createTokenIterator = void 0;
function* createTokenIterator(inputString) {
    const stringTokens = inputString.split(/\s+/);
    for (const currentToken of stringTokens) {
        yield currentToken;
    }
}
exports.createTokenIterator = createTokenIterator;
function* createParsedIterator(inputString, valueParser) {
    const stringTokens = inputString.split(/\s+/);
    for (const currentToken of stringTokens) {
        yield valueParser(currentToken);
    }
}
exports.createParsedIterator = createParsedIterator;
function getSingleNext(inputString) {
    const iteratorInstance = createTokenIterator(inputString);
    return () => iteratorInstance.next().value;
}
exports.getSingleNext = getSingleNext;
function getIntegerReader(inputString) {
    const iteratorInstance = createTokenIterator(inputString);
    return () => parseInt(iteratorInstance.next().value);
}
exports.getIntegerReader = getIntegerReader;
function getBigIntegerReader(inputString) {
    const iteratorInstance = createTokenIterator(inputString);
    return () => BigInt(iteratorInstance.next().value);
}
exports.getBigIntegerReader = getBigIntegerReader;


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
