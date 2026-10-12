/******/ (function(modMap) {
/******/ 	// The module cache
/******/ 	var loadedModules = {};
/******/
/******/ 	// The require function
/******/ 	function _require(modId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(loadedModules[modId]) {
/******/ 			return loadedModules[modId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var mod = loadedModules[modId] = {
/******/ 			i: modId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modMap[modId].call(mod.exports, mod, mod.exports, _require);
/******/
/******/ 		// Flag the module as loaded
/******/ 		mod.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return mod.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	_require.modDefs = modMap;
/******/
/******/ 	// expose the module cache
/******/ 	_require.modCache = loadedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	_require.defineExport = function(exp, expName, expGetter) {
/******/ 		if(!_require.hasOwnProp(exp, expName)) {
/******/ 			Object.defineProperty(exp, expName, { enumerable: true, get: expGetter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	_require.registerEsModule = function(exp) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exp, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exp, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// nsMode & 1: val is a module id, require it
/******/ 	// nsMode & 2: merge all properties of val into the ns
/******/ 	// nsMode & 4: return val when already ns object
/******/ 	// nsMode & 8|1: behave like require
/******/ 	_require.createNamespace = function(val, nsMode) {
/******/ 		if(nsMode & 1) val = _require(val);
/******/ 		if(nsMode & 8) return val;
/******/ 		if((nsMode & 4) && typeof val === 'object' && val && val.__esModule) return val;
/******/ 		var ns = Object.create(null);
/******/ 		_require.registerEsModule(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: val });
/******/ 		if (nsMode & 2 && typeof val != 'string') {
/******/             for (var propKey in val) {
/******/                 _require.defineExport(ns, propKey, ((k) => val[k]).bind(null, propKey));
/******/             }
/******/         }
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	_require.getModuleDefault = function(mod) {
/******/ 		var getter = mod && mod.__esModule ?
/******/ 			function getDefault() { return mod['default']; } :
/******/ 			function getModuleExports() { return mod; };
/******/ 		_require.defineExport(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	_require.hasOwnProp = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	_require.publicPath = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return _require(_require.entryModId = "./src/contest/atcoder/msol2020/e.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(modExp, exp) {

modExp.exports = function(modRef) {
    const isPolyfilled = modRef.isPolyfilled;
	if (!isPolyfilled) {
		modRef.deprecateFn = function() {};
		modRef.resolvePaths = [];
		if (!modRef.childModules) {
            modRef.childModules = [];
        }

        const defineModProp = (propName, getterFn) => {
            Object.defineProperty(modRef, propName, {
                enumerable: true,
                get: getterFn
            });
        };

		defineModProp("loaded", () => modRef.l);
		defineModProp("id", () => modRef.i);

		modRef.isPolyfilled = 1;
	}
	return modRef;
};


/***/ }),

/***/ "./src/contest/atcoder/msol2020/e.ts":
/*!*******************************************!*\
  !*** ./src/contest/atcoder/msol2020/e.ts ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(mod, exp, _require) {

"use strict";
/* WEBPACK VAR INJECTION */(function(modRef) {
const _importDef = (currentMod) => {
    if (currentMod && currentMod.__esModule) {
        return currentMod;
    }
    return { "default": currentMod };
};
Object.defineProperty(exp, "__esModule", { value: true });
exp.runSolution = void 0;
const fileSys = _importDef(_require("fs"));
const inputOutput = _require("./src/contest/common/io.ts");
const MAX_COST = 1 << 30;

var CoordAxis;
(function (CoordAxis) {
    CoordAxis["X"] = "X";
    CoordAxis["Y"] = "Y";
    CoordAxis["N"] = "N";
})(CoordAxis || (CoordAxis = {}));

function calculateCostForUnassigned({ numPoints, coords, assignment }) {
    let totalCost = 0;
    for (let pointIdx = 0; pointIdx < numPoints; pointIdx++) {
        if (assignment[pointIdx] !== CoordAxis.N) {
            continue;
        }

        const currentPoint = coords[pointIdx];
        const currentPointPrice = currentPoint.p;

        let currentPointCost = Math.min(Math.abs(currentPoint.x), Math.abs(currentPoint.y)) * currentPointPrice;

        for (let otherPointIdx = 0; otherPointIdx < numPoints; otherPointIdx++) {
            const otherPointAssignment = assignment[otherPointIdx];
            if (otherPointAssignment === CoordAxis.Y) {
                currentPointCost = Math.min(currentPointCost, Math.abs(currentPoint.x - coords[otherPointIdx].x) * currentPointPrice);
            } else if (otherPointAssignment === CoordAxis.X) {
                currentPointCost = Math.min(currentPointCost, Math.abs(currentPoint.y - coords[otherPointIdx].y) * currentPointPrice);
            }
        }
        totalCost += currentPointCost;
    }
    return totalCost;
}

function recursiveAssign(pointIdx, assignedCount, systemState) {
    const { assignment, numPoints, coords, minCosts } = systemState;

    if (pointIdx === numPoints) {
        const computedCost = calculateCostForUnassigned({ numPoints, coords, assignment });
        minCosts[assignedCount] = Math.min(minCosts[assignedCount], computedCost);
        return;
    }

    // Option 1: Assign to N (no axis)
    assignment[pointIdx] = CoordAxis.N;
    recursiveAssign(pointIdx + 1, assignedCount, systemState);

    // Option 2: Assign to X axis
    assignment[pointIdx] = CoordAxis.X;
    recursiveAssign(pointIdx + 1, assignedCount + 1, systemState);

    // Option 3: Assign to Y axis
    assignment[pointIdx] = CoordAxis.Y;
    recursiveAssign(pointIdx + 1, assignedCount + 1, systemState);
}

function solveProblem({ numPoints, coords }) {
    const initialMinCosts = Array(numPoints + 1).fill(MAX_COST);
    const currentAssignments = Array(numPoints);

    const problemState = {
        numPoints: numPoints,
        coords: coords,
        minCosts: initialMinCosts,
        assignment: currentAssignments,
    };

    recursiveAssign(0, 0, problemState);
    return initialMinCosts;
}

function runSolution(inputLine) {
    const inputReader = inputOutput.createInputReader(inputLine);
    const numPoints = inputReader.getNextInt();
    const pointCoordinates = [];

    const readSinglePointData = () => {
        const coordX = inputReader.getNextInt();
        const coordY = inputReader.getNextInt();
        const price = inputReader.getNextInt();
        return { x: coordX, y: coordY, p: price };
    };

    for (let idx = 0; idx < numPoints; idx++) {
        pointCoordinates.push(readSinglePointData());
    }

    console.log(solveProblem({ numPoints: numPoints, coords: pointCoordinates }).join('\n'));
}
exp.runSolution = runSolution;

if (_require.modCache[_require.entryModId] === modRef) {
    const stdinContent = fileSys.default.readFileSync("/dev/stdin", "utf8");
    runSolution(stdinContent);
}

/* WEBPACK VAR INJECTION */}.call(this, _require("./../../../../node_modules/webpack/buildin/module.js")(mod)))

/***/ }),

/***/ "./src/contest/common/io.ts":
/*!**********************************!*\
  !*** ./src/contest/common/io.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(mod, exp, _require) {

"use strict";

Object.defineProperty(exp, "__esModule", { value: true });
exp.createInputReader = void 0;

function createInputReader(inputString) {
    const inputTokens = inputString.split(/\s+/).filter(t => t.length > 0);
    let currentTokenIndex = 0;

    const getNextTokenValue = () => {
        if (currentTokenIndex >= inputTokens.length) {
            return undefined;
        }
        return inputTokens[currentTokenIndex++];
    };

    const getNextIntValue = () => {
        const token = getNextTokenValue();
        return token !== undefined ? parseInt(token, 10) : NaN;
    };

    const getNextBigIntValue = () => {
        const token = getNextTokenValue();
        return token !== undefined ? BigInt(token) : BigInt(0);
    };

    return {
        getNext: getNextTokenValue,
        getNextInt: getNextIntValue,
        getNextBigInt: getNextBigIntValue,
    };
}
exp.createInputReader = createInputReader;


/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(mod, exp) {

mod.exports = require("fs");

/***/ })

/******/ });
