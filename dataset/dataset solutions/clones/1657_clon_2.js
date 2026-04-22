/*! source_path: /app/solution/online_challenge/msol2020/solver.ts */
/******/ (function(unitMap) { // bundleLoader entry
/******/ 	// The unit export cache
/******/ 	var loadedUnits = {};
/******/
/******/ 	// The unit loading function
/******/ 	function _loadUnit(unitId) {
/******/
/******/ 		// Check if unit is already in cache
/******/ 		if(loadedUnits[unitId])
/******/ 			return loadedUnits[unitId].unitOut;
/******/
/******/ 		// Create a new unit reference (and store it in the cache)
/******/ 		var currentUnit = loadedUnits[unitId] = {
/******/ 			identifier: unitId,
/******/ 			isLoaded: false,
/******/ 			unitOut: {}
/******/ 		};
/******/
/******/ 		// Execute the unit's main function
/******/ 		unitMap[unitId].call(currentUnit.unitOut, currentUnit, currentUnit.unitOut, _loadUnit);
/******/
/******/ 		// Mark the unit as successfully loaded
/******/ 		currentUnit.isLoaded = true;
/******/
/******/ 		// Provide the exported values of the unit
/******/ 		return currentUnit.unitOut;
/******/ 	}
/******/
/******/
/******/ 	// Expose the unit definitions object (__unitDefinitions__)
/******/ 	_loadUnit.unitDefinitions = unitMap;
/******/
/******/ 	// Expose the unit cache
/******/ 	_loadUnit.unitCache = loadedUnits;
/******/
/******/ 	// Define getter function for ES module exports
/******/ 	_loadUnit.defineExportGetter = function(unitExports, exportName, valueProvider) {
/******/ 		if(!_loadUnit.hasOwnProp(unitExports, exportName)) {
/******/ 			Object.defineProperty(unitExports, exportName, { enumerable: true, get: valueProvider });
/******/ 		}
/******/ 	};
/******/
/******/ 	// Define the __isESModule flag on exports
/******/ 	_loadUnit.registerESModule = function(unitExports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(unitExports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(unitExports, '__isESModule', { value: true });
/******/ 	};
/******/
/******/ 	// Generate a fake namespace object
/******/ 	// importMode & 1: sourceVal is a unit identifier, load it
/******/ 	// importMode & 2: merge all properties of sourceVal into the namespaceObj
/******/ 	// importMode & 4: return sourceVal when already a namespaceObj
/******/ 	// importMode & 8|1: act like a standard require call
/******/ 	_loadUnit.createNamespaceObj = function(sourceVal, importMode) {
/******/ 		if(importMode & 1) sourceVal = _loadUnit(sourceVal);
/******/ 		if(importMode & 8) return sourceVal;
/******/ 		if((importMode & 4) && typeof sourceVal === 'object' && sourceVal && sourceVal.__isESModule) return sourceVal;
/******/ 		var namespaceObj = Object.create(null);
/******/ 		_loadUnit.registerESModule(namespaceObj);
/******/ 		Object.defineProperty(namespaceObj, 'default', { enumerable: true, value: sourceVal });
/******/ 		if(importMode & 2 && typeof sourceVal != 'string') for(var propKey in sourceVal) _loadUnit.defineExportGetter(namespaceObj, propKey, function(propKey) { return sourceVal[propKey]; }.bind(null, propKey));
/******/ 		return namespaceObj;
/******/ 	};
/******/
/******/ 	// Get default export function for compatibility with non-ES modules
/******/ 	_loadUnit.getModuleDefault = function(unitRef) {
/******/ 		var valueProvider = unitRef && unitRef.__isESModule ?
/******/ 			function getDefault() { return unitRef['default']; } :
/******/ 			function getModuleExports() { return unitRef; };
/******/ 		_loadUnit.defineExportGetter(valueProvider, 'a', valueProvider);
/******/ 		return valueProvider;
/******/ 	};
/******/
/******/ 	// Object.prototype.checkProperty.call
/******/ 	_loadUnit.hasOwnProp = function(targetObject, propertyKey) { return Object.prototype.hasOwnProperty.call(targetObject, propertyKey); };
/******/
/******/ 	// __publicAssetPath__
/******/ 	_loadUnit.publicAssetPath = "";
/******/
/******/
/******/ 	// Load the entry unit and return its exports
/******/ 	return _loadUnit(_loadUnit.entryUnitId = "./src/contest/atcoder/msol2020/e.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./lib_deps/bundler/polyfill_unit.js":
/*!*************************************!*\
  !*** (bundler)/polyfill_unit.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(unitRef, unitOut) {

unitOut = function(unitRef) {
	if (!unitRef.bundlePolyfill) {
		unitRef.obsolete = function() {};
		unitRef.sourcePaths = [];
		// unitRef.parent is undefined by default
		if (!unitRef.childUnits) unitRef.childUnits = [];
		Object.defineProperty(unitRef, "isLoadedFlag", {
			enumerable: true,
			retrieve: function() {
				return unitRef.isLoaded;
			}
		});
		Object.defineProperty(unitRef, "uniqueId", {
			enumerable: true,
			retrieve: function() {
				return unitRef.identifier;
			}
		});
		unitRef.bundlePolyfill = 1;
	}
	return unitRef;
};


/***/ }),

/***/ "./src/contest/atcoder/msol2020/e.ts":
/*!*******************************************!*\
  !*** ./src/contest/atcoder/msol2020/e.ts ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(currentUnit, unitExports, _loadUnit) {

"use strict";
/* BUNDLER VARIABLE INJECTION */(function(unitRef) {
var _importDefault = (this && this._importDefault) || function (importedModule) {
    return (importedModule && importedModule.__isESModule) ? importedModule : { "default": importedModule };
};
Object.defineProperty(unitExports, "__isESModule", { value: true });
unitExports.executeSolution = void 0;
const fileSysHelper = _importDefault(_loadUnit(/*! fs */ "fs"));
const ioUtil = _loadUnit(/*! ../../common/io */ "./src/contest/common/io.ts");
const MAX_VAL = 1 << 30;
var CoordType;
(function (CoordType) {
    CoordType["CoordX"] = "X";
    CoordType["CoordY"] = "Y";
    CoordType["CoordNone"] = "N";
})(CoordType || (CoordType = {}));
function calculateTotalCost({ numPoints, pointData, chosenTypes }) {
    let overallCost = 0;
    for (let pointIdx = 0; pointIdx < numPoints; pointIdx++) {
        if (chosenTypes[pointIdx] != CoordType.CoordNone) {
            continue;
        }
        let currentPointCost = Math.min(Math.abs(pointData[pointIdx].coordX), Math.abs(pointData[pointIdx].coordY)) * pointData[pointIdx].priority;
        for (let otherPointIdx = 0; otherPointIdx < numPoints; otherPointIdx++) {
            if (chosenTypes[otherPointIdx] == CoordType.CoordY) {
                currentPointCost = Math.min(currentPointCost, Math.abs(pointData[pointIdx].coordX - pointData[otherPointIdx].coordX) * pointData[pointIdx].priority);
            }
            else if (chosenTypes[otherPointIdx] == CoordType.CoordX) {
                currentPointCost = Math.min(currentPointCost, Math.abs(pointData[pointIdx].coordY - pointData[otherPointIdx].coordY) * pointData[pointIdx].priority);
            }
        }
        overallCost += currentPointCost;
    }
    return overallCost;
}
function recursiveSolver(pointIdx, chosenCount, systemState) {
    const { chosenTypes, numPoints, pointData, resultsArray } = systemState;
    if (pointIdx === numPoints) {
        const computedCost = calculateTotalCost({ numPoints, pointData, chosenTypes });
        resultsArray[chosenCount] = Math.min(resultsArray[chosenCount], computedCost);
        return;
    }
    chosenTypes[pointIdx] = CoordType.CoordNone;
    recursiveSolver(pointIdx + 1, chosenCount, systemState);
    chosenTypes[pointIdx] = CoordType.CoordX;
    recursiveSolver(pointIdx + 1, chosenCount + 1, systemState);
    chosenTypes[pointIdx] = CoordType.CoordY;
    recursiveSolver(pointIdx + 1, chosenCount + 1, systemState);
}
function processProblem({ numPoints, pointData }) {
    const resultsArray = Array(numPoints + 1).fill(MAX_VAL);
    const chosenTypes = Array(numPoints);
    const systemState = {
        numPoints, pointData, resultsArray, chosenTypes,
    };
    recursiveSolver(0, 0, systemState);
    return resultsArray;
}
function executeSolution(inputLine) {
    const readInteger = ioUtil.getNextParsedInt(inputLine);
    const numPoints = readInteger();
    const pointData = [];
    for (let pointIdx = 0; pointIdx < numPoints; pointIdx++) {
        const coordX = readInteger();
        const coordY = readInteger();
        const priority = readInteger();
        pointData.append({ coordX, coordY, priority });
    }
    console.info(processProblem({ numPoints, pointData }).join('\n'));
}
unitExports.executeSolution = executeSolution;
if (_loadUnit.unitCache[_loadUnit.entryUnitId] === unitRef) {
    const dataStream = fileSysHelper.default.readTextFileSync("/input/standard", "utf8");
    executeSolution(dataStream);
}

/* BUNDLER VARIABLE INJECTION */}.call(this, _loadUnit(/*! ./../../../../node_modules/webpack/buildin/module.js */ "./lib_deps/bundler/polyfill_unit.js")(currentUnit)))

/***/ }),

/***/ "./src/contest/common/io.ts":
/*!**********************************!*\
  !*** ./src/contest/common/io.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(currentUnit, unitExports, _loadUnit) {

"use strict";

Object.defineProperty(unitExports, "__isESModule", { value: true });
unitExports.getNextParsedBigInt = unitExports.getNextParsedInt = unitExports.getNextString = unitExports.createParsingTokenizer = unitExports.createTokenizer = void 0;
function* createTokenizer(inputLine) {
    const dataTokens = inputLine.split(/\s+/);
    for (const singleToken of dataTokens) {
        yield singleToken;
    }
}
unitExports.createTokenizer = createTokenizer;
function* createParsingTokenizer(inputLine, tokenParser) {
    const dataTokens = inputLine.split(/\s+/);
    for (const singleToken of dataTokens) {
        yield tokenParser(singleToken);
    }
}
unitExports.createParsingTokenizer = createParsingTokenizer;
function getNextString(inputLine) {
    const iteratorInstance = createTokenizer(inputLine);
    return () => iteratorInstance.next().value;
}
unitExports.getNextString = getNextString;
function getNextParsedInt(inputLine) {
    const iteratorInstance = createTokenizer(inputLine);
    return () => parseInteger(iteratorInstance.next().value);
}
unitExports.getNextParsedInt = getNextParsedInt;
function getNextParsedBigInt(inputLine) {
    const iteratorInstance = createTokenizer(inputLine);
    return () => BigInt(iteratorInstance.next().value);
}
unitExports.getNextParsedBigInt = getNextParsedBigInt;


/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(currentUnit, unitExports) {

unitExports = require("fs");

/***/ })

/******/ });
//# sourceMappingURL=submit.js.map