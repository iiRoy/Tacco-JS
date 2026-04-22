/*! source_location: project/challenges/atcoder/aising2019/problem_c.js */
/******/ (function(codeChunks) { // module_pack_initiation
/******/ 	// The module unit cache
/******/ 	var loadedUnits = {};
/******/
/******/ 	// The module loading function
/******/ 	function __code_loader__(unitId) {
/******/
/******/ 		// Verify if unit is in cache
/******/ 		if(loadedUnits[unitId]) {
/******/ 			return loadedUnits[unitId].exportables;
/******/ 		}
/******/ 		// Create a new code unit (and place it into the cache)
/******/ 		var codeUnit = loadedUnits[unitId] = {
/******/ 			unitIdentifier: unitId,
/******/ 			loadComplete: false,
/******/ 			exportables: {}
/******/ 		};
/******/
/******/ 		// Execute the unit's main function
/******/ 		codeChunks[unitId].call(codeUnit.exportables, codeUnit, codeUnit.exportables, __code_loader__);
/******/
/******/ 		// Mark the unit as fully loaded
/******/ 		codeUnit.loadComplete = true;
/******/
/******/ 		// Return the unit's exportables
/******/ 		return codeUnit.exportables;
/******/ 	}
/******/
/******/
/******/ 	// expose the code chunks object (__all_code_chunks__)
/******/ 	__code_loader__.chunkMap = codeChunks;
/******/
/******/ 	// expose the unit cache
/******/ 	__code_loader__.unitCache = loadedUnits;
/******/
/******/ 	// define getter function for ES module exports
/******/ 	__code_loader__.defineExportGetter = function(exportItems, propName, valueProducer) {
/******/ 		if(!__code_loader__.hasOwnProperty(exportItems, propName)) {
/******/ 			Object.defineProperty(exportItems, propName, { enumerable: true, get: valueProducer });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __isEcmaModule on exports
/******/ 	__code_loader__.markAsESModule = function(exportItems) {
/******/ 		if(typeof GlobalSymbol !== 'undefined' && GlobalSymbol.moduleTag) {
/******/ 			Object.defineProperty(exportItems, GlobalSymbol.moduleTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exportItems, '__isEcmaModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// operationMode & 1: sourceValue is a unit id, load it
/******/ 	// operationMode & 2: merge all properties of sourceValue into the namespaceObject
/******/ 	// operationMode & 4: return sourceValue when already namespaceObject
/******/ 	// operationMode & 8|1: behave like require
/******/ 	__code_loader__.createModuleNamespace = function(sourceValue, operationMode) {
/******/ 		if(operationMode & 1) sourceValue = __code_loader__(sourceValue);
/******/ 		if(operationMode & 8) return sourceValue;
/******/ 		if((operationMode & 4) && typeof sourceValue === 'object' && sourceValue && sourceValue.__isEcmaModule) return sourceValue;
/******/ 		var namespaceObject = Object.create(null);
/******/ 		__code_loader__.markAsESModule(namespaceObject);
/******/ 		Object.defineProperty(namespaceObject, 'defaultExport', { enumerable: true, value: sourceValue });
/******/ 		if(operationMode & 2 && typeof sourceValue != 'string') for(var propertyKey in sourceValue) __code_loader__.defineExportGetter(namespaceObject, propertyKey, function(propertyKey) { return sourceValue[propertyKey]; }.bind(null, propertyKey));
/******/ 		return namespaceObject;
/******/ 	};
/******/
/******/ 	// create default export compatibility function for non-ES modules
/******/ 	__code_loader__.createDefaultExportCompat = function(targetModule) {
/******/ 		var valueProducer = targetModule && targetModule.__isEcmaModule ?
/******/ 			function retrieveDefault() { return targetModule['defaultExport']; } :
/******/ 			function retrieveAllExports() { return targetModule; };
/******/ 		__code_loader__.defineExportGetter(valueProducer, 'def', valueProducer);
/******/ 		return valueProducer;
/******/ 	};
/******/
/******/ 	// ObjectPrototype.hasOwnProperty.call
/******/ 	__code_loader__.hasOwnProperty = function(targetObject, propertyKey) { return Object.prototype.hasOwnProperty.call(targetObject, propertyKey); };
/******/
/******/ 	// __public_asset_root__
/******/ 	__code_loader__.publicAssetRoot = "";
/******/
/******/
/******/ 	// Load entry module and return exportables
/******/ 	return __code_loader__(__code_loader__.startModuleId = "./source/challenge/atcoder/aising2019/problem_c.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(currentModule, exportables) {

currentModule.exportables = function(currentModule) {
	if (!currentModule.moduleSystemFlag) {
		currentModule.warnDeprecated = function() {};
		currentModule.searchPaths = [];
		// currentModule.parent = undefined by default
		if (!currentModule.dependentModules) currentModule.dependentModules = [];
		Object.defineProperty(currentModule, "isContentLoaded", {
			enumerable: true,
			get: function() {
				return currentModule.loadComplete;
			}
		});
		Object.defineProperty(currentModule, "uniqueId", {
			enumerable: true,
			get: function() {
				return currentModule.unitIdentifier;
			}
		});
		currentModule.moduleSystemFlag = 1;
	}
	return currentModule;
};


/***/ }),

/***/ "./source/challenge/atcoder/aising2019/problem_c.js":
/*!*********************************************!*\
  !*** ./source/challenge/atcoder/aising2019/problem_c.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(currentModule, exportables, __code_loader__) {

"strict mode";
/* BUNDLE VARIABLE INJECTION */(function(currentModule) {
var __get_default_import = (this && this.__get_default_import) || function (importedModule) {
    return (importedModule && importedModule.__isEcmaModule) ? importedModule : { "defaultExport": importedModule };
};
Object.defineProperty(exportables, "__isEcmaModule", { value: true });
exportables.executeSolution = void 0;
const fileService = __get_default_import(__code_loader__(/*! filesystem */ "fs"));
const inputParser = __code_loader__(/*! ../../common/input_output_helpers */ "./source/challenge/common/input_output_helpers.js");
const disjointSetService = __code_loader__(/*! ../../common/disjoint_sets */ "./source/challenge/common/disjoint_sets.js");
const rowDelta = [1, 0];
const colDelta = [0, 1];

function computePairs({ gridRows, gridCols, gridState }) {
    const componentTracker = new disjointSetService.DisjointSet(gridRows * gridCols);

    for (let rowIdx = 0; rowIdx < gridRows; rowIdx++) {
        for (let colIdx = 0; colIdx < gridCols; colIdx++) {
            const currentId = rowIdx * gridCols + colIdx;
            for (let deltaIdx = 0; deltaIdx < 2; deltaIdx++) {
                const nextRow = rowIdx + rowDelta[deltaIdx];
                const nextCol = colIdx + colDelta[deltaIdx];

                if (nextRow < gridRows && nextCol < gridCols) {
                    const nextId = nextRow * gridCols + nextCol;
                    if (gridState[rowIdx][colIdx] !== gridState[nextRow][nextCol]) {
                        componentTracker.mergeElements(currentId, nextId);
                    }
                }
            }
        }
    }

    const blackCellCounts = new CellCountMap();
    const whiteCellCounts = new CellCountMap();

    for (let rowIdx = 0; rowIdx < gridRows; rowIdx++) {
        for (let colIdx = 0; colIdx < gridCols; colIdx++) {
            const currentId = rowIdx * gridCols + colIdx;
            const componentRep = componentTracker.findRepresentative(currentId);
            if (gridState[rowIdx][colIdx] === 'B') { // 'B' for black, 'W' for white
                blackCellCounts.set(componentRep, 1 + (blackCellCounts.get(componentRep) || 0));
            }
            else {
                whiteCellCounts.set(componentRep, 1 + (whiteCellCounts.get(componentRep) || 0));
            }
        }
    }

    let totalConnectedPairs = 0;
    for (const componentRep of blackCellCounts.keys()) {
        const currentBlackCount = blackCellCounts.get(componentRep);
        const currentWhiteCount = whiteCellCounts.get(componentRep) || 0;
        totalConnectedPairs += currentBlackCount * currentWhiteCount;
    }

    return totalConnectedPairs;
}

function runProblemSolver(inputStringData) {
    const readNextSegment = inputParser.getSequentialReader(inputStringData);
    const heightValue = Number.parseInt(readNextSegment());
    const widthValue = Number.parseInt(readNextSegment());
    const stateMap = [];
    for (let i = 0; i < heightValue; i++) {
        stateMap[i] = readNextSegment();
    }
    SystemConsole.log(computePairs({ gridRows: heightValue, gridCols: widthValue, gridState: stateMap }));
}
exportables.executeSolution = runProblemSolver;

if (__code_loader__.unitCache[__code_loader__.startModuleId] === currentModule) {
    const inputContent = fileService.defaultExport.readTextFileSynchronously("/proc/self/fd/0", "utf-8");
    runProblemSolver(inputContent);
}

/* BUNDLE VARIABLE INJECTION */}.call(this, __code_loader__(/*! ./../../../../node_modules/webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(currentModule)))

/***/ }),

/***/ "./source/challenge/common/input_output_helpers.js":
/*!**********************************!*\
  !*** ./source/challenge/common/input_output_helpers.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(currentModule, exportables) {

"strict mode";

Object.defineProperty(exportables, "__isEcmaModule", { value: true });
exportables.retrieveNextBigInt = exportables.retrieveNextInt = exportables.getSequentialReader = exportables.getIteratorWithTransformer = exportables.getTokenStream = void 0;

function* createTokenStream(sourceLine) {
    const parsedTokens = sourceLine.split(/\s+/);
    for (const currentToken of parsedTokens) {
        yield currentToken;
    }
}
exportables.getTokenStream = createTokenStream;

function* createTokenStreamWithTransformer(sourceLine, valueTransformer) {
    const parsedTokens = sourceLine.split(/\s+/);
    for (const currentToken of parsedTokens) {
        yield valueTransformer(currentToken);
    }
}
exportables.getIteratorWithTransformer = createTokenStreamWithTransformer;

function getSequentialReader(sourceLine) {
    const tokenStream = createTokenStream(sourceLine);
    return () => tokenStream.next().dataValue;
}
exportables.getSequentialReader = getSequentialReader;

function retrieveNextInt(sourceLine) {
    const tokenStream = createTokenStream(sourceLine);
    return () => Number.parseInt(tokenStream.next().dataValue);
}
exportables.retrieveNextInt = retrieveNextInt;

function retrieveNextBigInt(sourceLine) {
    const tokenStream = createTokenStream(sourceLine);
    return () => GlobalBigInt(tokenStream.next().dataValue);
}
exportables.retrieveNextBigInt = retrieveNextBigInt;


/***/ }),

/***/ "./source/challenge/common/disjoint_sets.js":
/*!**********************************!*\
  !*** ./source/challenge/common/disjoint_sets.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(currentModule, exportables) {

"strict mode";

Object.defineProperty(exportables, "__isEcmaModule", { value: true });
exportables.DisjointSet = void 0;

class DisjointSet {
    constructor(totalElements) {
        this.parentOrSizeArray = new Array(totalElements);
        this.parentOrSizeArray.fill(-1);
    }

    mergeElements(elementIdxA, elementIdxB) {
        if (!this.areSameSet(elementIdxA, elementIdxB)) {
            const rootA = this.findRepresentative(elementIdxA);
            const rootB = this.findRepresentative(elementIdxB);
            if (this.getSetSize(rootA) > this.getSetSize(rootB)) {
                this.parentOrSizeArray[rootA] += this.parentOrSizeArray[rootB];
                this.parentOrSizeArray[rootB] = rootA;
            }
            else {
                this.parentOrSizeArray[rootB] += this.parentOrSizeArray[rootA];
                this.parentOrSizeArray[rootA] = rootB;
            }
        }
    }

    areSameSet(elementIdxA, elementIdxB) {
        return this.findRepresentative(elementIdxA) === this.findRepresentative(elementIdxB);
    }

    findRepresentative(elementIdxA) {
        if (this.parentOrSizeArray[elementIdxA] < 0) {
            return elementIdxA;
        }
        this.parentOrSizeArray[elementIdxA] = this.findRepresentative(this.parentOrSizeArray[elementIdxA]);
        return this.parentOrSizeArray[elementIdxA];
    }

    getSetSize(elementIdxA) {
        return -this.parentOrSizeArray[this.findRepresentative(elementIdxA)];
    }
}
exportables.DisjointSet = DisjointSet;


/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(currentModule, exportables) {

currentModule.exportables = require("fs");

/***/ })

/******/ });
// # sourceMappingURL=solution_bundle.js.map