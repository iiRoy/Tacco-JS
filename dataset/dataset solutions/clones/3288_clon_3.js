/*! path: utilities/data-processing/grid-solver.js */
/******/ (function(componentDefinitions) { // Module Orchestrator
/******/ 	// The component cache storage
/******/ 	let loadedComponents = {};
/******/
/******/ 	// The component loading function
/******/ 	function componentLoader(componentKey) {
/******/
/******/ 		// Check if component is in cache
/******/ 		if(loadedComponents[componentKey]) {
/******/ 			return loadedComponents[componentKey].outputPayload;
/******/ 		}
/******/ 		// Create a new component instance (and put it into the cache)
/******/ 		let currentComp = loadedComponents[componentKey] = {
/******/ 			moduleIdentifier: componentKey,
/******/ 			isLoadedFlag: false,
/******/ 			outputPayload: {}
/******/ 		};
/******/
/******/ 		// Execute the component's main routine
/******/ 		componentDefinitions[componentKey].call(currentComp.outputPayload, currentComp, currentComp.outputPayload, componentLoader);
/******/
/******/ 		// Mark the component as fully loaded
/******/ 		currentComp.isLoadedFlag = true;
/******/
/******/ 		// Return the component's public interface
/******/ 		return currentComp.outputPayload;
/******/ 	}
/******/
/******/
/******/ 	// expose the component definitions object (__webpack_modules__)
/******/ 	componentLoader.definitions = componentDefinitions;
/******/
/******/ 	// expose the component cache (__webpack_require__.c)
/******/ 	componentLoader.cache = loadedComponents;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	componentLoader.defineExport = function(outputPayload, exportName, getterFunction) {
/******/ 		if(!componentLoader.hasOwnProp(outputPayload, exportName)) {
/******/ 			Object.defineProperty(outputPayload, exportName, { enumerable: true, get: getterFunction });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on outputPayload
/******/ 	componentLoader.markAsEsModule = function(outputPayload) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(outputPayload, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(outputPayload, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a component id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	componentLoader.createNamespace = function(val, mode) {
/******/ 		if(mode & 1) val = componentLoader(val);
/******/ 		if(mode & 8) return val;
/******/ 		if((mode & 4) && typeof val === 'object' && val && val.__esModule) return val;
/******/ 		let namespaceObj = Object.create(null);
/******/ 		componentLoader.markAsEsModule(namespaceObj);
/******/ 		Object.defineProperty(namespaceObj, 'default', { enumerable: true, value: val });
/******/ 		if(mode & 2 && typeof val != 'string') for(let propKey in val) componentLoader.defineExport(namespaceObj, propKey, function(propKey) { return val[propKey]; }.bind(null, propKey));
/******/ 		return namespaceObj;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony components
/******/ 	componentLoader.getCompatibilityExport = function(currentMod) {
/******/ 		let getterFunction = currentMod && currentMod.__esModule ?
/******/ 			function getStandardDefault() { return currentMod['default']; } :
/******/ 			function getLegacyExports() { return currentMod; };
/******/ 		componentLoader.defineExport(getterFunction, 'a', getterFunction);
/******/ 		return getterFunction;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	componentLoader.hasOwnProp = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); };
/******/
/******/ 	// Load entry component and return outputPayload
/******/ 	return componentLoader(componentLoader.entryPoint = "./source/grid/pathfinder/main.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/webpack/buildin/module.js":
/*!************************************************!
  *** (webpack)/buildin/module.js (utility for module polyfill) ***!
  \************************************************/
/*! no static exports found */
/***/ (function(currentMod, outputPayload) {

currentMod.exports = function(moduleInstance) {
	if (!moduleInstance.polyfillActive) {
		moduleInstance.deprecateFunc = function() {};
		moduleInstance.modulePaths = [];
		// moduleInstance.parent is undefined by default
		if (!moduleInstance.childModules) moduleInstance.childModules = [];
		Object.defineProperty(moduleInstance, "isLoadedFlag", {
			enumerable: true,
			get: function() {
				return moduleInstance.isLoadedFlag;
			}
		});
		Object.defineProperty(moduleInstance, "moduleIdentifier", {
			enumerable: true,
			get: function() {
				return moduleInstance.moduleIdentifier;
			}
		});
		moduleInstance.polyfillActive = 1;
	}
	return moduleInstance;
};


/***/ }),

/***/ "./source/common/connectivity.ts":
/*!***************************************!
  *** ./source/common/connectivity.ts (Disjoint Set Data Structure) ***!
  \***************************************/
/*! no static exports found */
/***/ (function(currentMod, outputPayload, componentLoader) {

"use strict";

outputPayload.DisjointSetStructure = null;
/**
 * Manages disjoint sets for efficient connectivity checks.
 */
class DisjointSetStructure {
    /**
     * Initializes the structure with 'elementCount' individual sets.
     * @param {number} elementCount - The total number of elements to manage.
     */
    constructor(elementCount) {
        if (elementCount <= 0) {
            throw new Error("Element count for DisjointSetStructure must be positive.");
        }
        this.parentArray = Array.from({ length: elementCount }, () => -1);
    }

    /**
     * Attempts to merge the sets containing idxA and idxB.
     * Uses union-by-size optimization.
     * @param {number} idxA - Index of the first element.
     * @param {number} idxB - Index of the second element.
     */
    mergeSets(idxA, idxB) {
        let rootA = this.findRepresentative(idxA);
        let rootB = this.findRepresentative(idxB);

        if (rootA !== rootB) { // Only merge if they are in different sets
            const sizeA = this.parentArray[rootA]; // Negative value stores size
            const sizeB = this.parentArray[rootB];

            if (sizeA > sizeB) { // rootA's set is smaller (more negative means larger size)
                this.parentArray[rootA] += this.parentArray[rootB];
                this.parentArray[rootB] = rootA;
            } else { // rootB's set is smaller or equal
                this.parentArray[rootB] += this.parentArray[rootA];
                this.parentArray[rootA] = rootB;
            }
        }
    }

    /**
     * Checks if two elements are part of the same set.
     * @param {number} idxA - Index of the first element.
     * @param {number} idxB - Index of the second element.
     * @returns {boolean} True if elements are in the same set, false otherwise.
     */
    areInSameSet(idxA, idxB) {
        return this.findRepresentative(idxA) === this.findRepresentative(idxB);
    }

    /**
     * Finds the representative (root) of the set containing the given element.
     * Applies path compression for efficiency.
     * @param {number} idx - The element's index.
     * @returns {number} The index of the set's representative.
     */
    findRepresentative(idx) {
        if (this.parentArray[idx] < 0) {
            return idx; // This element is a root
        }
        // Path compression: set parent to root directly
        this.parentArray[idx] = this.findRepresentative(this.parentArray[idx]);
        return this.parentArray[idx];
    }

    /**
     * Returns the size of the set containing the given element.
     * @param {number} idx - The element's index.
     * @returns {number} The number of elements in the set.
     */
    getComponentSize(idx) {
        // The root's parentArray value stores the negative size of the set.
        return -this.parentArray[this.findRepresentative(idx)];
    }
}
outputPayload.DisjointSetStructure = DisjointSetStructure;


/***/ }),

/***/ "./source/common/input-parser.ts":
/*!***************************************!
  *** ./source/common/input-parser.ts (Input Parsing Utilities) ***!
  \***************************************/
/*! no static exports found */
/***/ (function(currentMod, outputPayload, componentLoader) {

"use strict";

outputPayload.retrieveBigInt = outputPayload.retrieveInt = outputPayload.retrieveString = outputPayload.parseAndIterate = outputPayload.iterateTokens = null;

/**
 * Creates an iterator to yield string tokens from an input string.
 * @param {string} inputString - The string to tokenize.
 * @returns {Generator<string>} An iterator for string tokens.
 */
function* tokenStream(inputString) {
    const parts = inputString.split(/\s+/).filter(Boolean); // Filter out empty strings from multiple spaces
    for (const part of parts) {
        yield part;
    }
}
outputPayload.iterateTokens = tokenStream;

/**
 * Creates an iterator to yield parsed tokens from an input string.
 * @param {string} sourceString - The string to tokenize and parse.
 * @param {(s: string) => T} parsingFunction - The function to parse each token.
 * @returns {Generator<T>} An iterator for parsed tokens.
 * @template T
 */
function* parsedTokenStream(sourceString, parsingFunction) {
    const parts = sourceString.split(new RegExp('\\s+')).filter(Boolean);
    for (const part of parts) {
        yield parsingFunction(part);
    }
}
outputPayload.parseAndIterate = parsedTokenStream;

/**
 * Returns a function that, when called, provides the next string token from the input line.
 * @param {string} inputLine - The full input string.
 * @returns {() => string} A function to get the next string.
 */
function createStringRetriever(inputLine) {
    const iteratorInstance = tokenStream(inputLine);
    return () => iteratorInstance.next().value ?? ''; // Ensure a string is always returned
}
outputPayload.retrieveString = createStringRetriever;

/**
 * Returns a function that, when called, provides the next integer token from the input line.
 * @param {string} inputLine - The full input string.
 * @returns {() => number} A function to get the next integer.
 */
function createIntRetriever(inputLine) {
    const iteratorInstance = tokenStream(inputLine);
    return () => Number.parseInt(iteratorInstance.next().value, 10);
}
outputPayload.retrieveInt = createIntRetriever;

/**
 * Returns a function that, when called, provides the next BigInt token from the input line.
 * @param {string} inputLine - The full input string.
 * @returns {() => bigint} A function to get the next BigInt.
 */
function createBigIntRetriever(inputLine) {
    const iteratorInstance = tokenStream(inputLine);
    return () => BigInt(iteratorInstance.next().value);
}
outputPayload.retrieveBigInt = createBigIntRetriever;


/***/ }),

/***/ "./source/grid/pathfinder/main.ts":
/*!****************************************!
  *** ./source/grid/pathfinder/main.ts (Main Grid Processing Logic) ***!
  \****************************************/
/*! no static exports found */
/***/ (function(currentMod, outputPayload, componentLoader) {

"use strict";
/* WEBPACK VAR INJECTION */(function(moduleInstance) {
let importHandler = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
outputPayload.__esModule = true;
outputPayload.runMainLogic = null;
const fileSystemAccess = importHandler(componentLoader("fs"));
const inputOutputUtils = componentLoader("./source/common/input-parser.ts");
const disjointSetLogic = componentLoader("./source/common/connectivity.ts");

// Relative offsets for checking right and down neighbors
const displacementVectors = [
    [1, 0], // Move right (column increment)
    [0, 1]  // Move down (row increment)
];

/**
 * Computes the product of black and white cells within connected components
 * where adjacent cells of different colors are considered connected.
 * @param {object} gridParameters - Object containing grid dimensions and data.
 * @param {number} gridParameters.dimHeight - Number of rows in the grid.
 * @param {number} gridParameters.dimWidth - Number of columns in the grid.
 * @param {string[]} gridParameters.gridSymbols - Array of strings representing grid rows.
 * @returns {number} The total sum of (black_count * white_count) for each component.
 */
function computeConnectedComponentsProduct({ dimHeight, dimWidth, gridSymbols }) {
    if (dimHeight <= 0 || dimWidth <= 0) {
        return 0; // No grid or invalid dimensions, no pairs possible.
    }

    // Initialize Disjoint Set Union structure for all grid cells.
    // Each cell (r, c) maps to a flat index r * dimWidth + c.
    const componentTracker = new disjointSetLogic.DisjointSetStructure(dimHeight * dimWidth);

    // Phase 1: Build connectivity based on adjacent cells of DIFFERENT colors.
    for (let rowIndex = 0; rowIndex < dimHeight; ++rowIndex) {
        for (let colIndex = 0; colIndex < dimWidth; ++colIndex) {
            const currentCellIndex = rowIndex * dimWidth + colIndex;
            const currentCellSymbol = gridSymbols[rowIndex][colIndex];

            // Check neighbors (right and down)
            for (const [dRow, dCol] of displacementVectors) {
                const nextRow = rowIndex + dRow;
                const nextCol = colIndex + dCol;

                // Validate neighbor coordinates
                if (nextRow < dimHeight && nextCol < dimWidth) {
                    const neighborCellIndex = nextRow * dimWidth + nextCol;
                    const neighborCellSymbol = gridSymbols[nextRow][nextCol];

                    // If current cell and neighbor have different symbols, they are connected.
                    if (currentCellSymbol !== neighborCellSymbol) {
                        componentTracker.mergeSets(currentCellIndex, neighborCellIndex);
                    }
                }
            }
        }
    }

    // Phase 2: Count black and white cells within each connected component.
    const blackCounts = new Map(); // Stores count of '#' cells for each component root
    const whiteCounts = new Map(); // Stores count of '.' cells for each component root

    for (let rowIndex = 0; rowIndex < dimHeight; ++rowIndex) {
        for (let colIndex = 0; colIndex < dimWidth; ++colIndex) {
            const cellFlatIndex = rowIndex * dimWidth + colIndex;
            const componentRoot = componentTracker.findRepresentative(cellFlatIndex);
            const cellSymbol = gridSymbols[rowIndex][colIndex];

            if (cellSymbol === '#') {
                blackCounts.set(componentRoot, (blackCounts.get(componentRoot) || 0) + 1);
            } else { // Assuming '.'' for non-'#' cells
                whiteCounts.set(componentRoot, (whiteCounts.get(componentRoot) || 0) + 1);
            }
        }
    }

    // Phase 3: Calculate the final score.
    // For each component, multiply its black count by its white count and sum these products.
    let finalScore = 0;
    for (const [rootKey, currentBlackCount] of blackCounts.entries()) {
        const currentWhiteCount = whiteCounts.get(rootKey) || 0;
        finalScore += currentBlackCount * currentWhiteCount;
    }

    return finalScore;
}

/**
 * Main entry point function for processing standard input.
 * @param {string} rawInputText - The entire input content as a single string.
 */
function entryPointFunction(rawInputText) {
    const tokenProvider = inputOutputUtils.retrieveString(rawInputText);
    const gridH = Number.parseInt(tokenProvider(), 10);
    const gridW = Number.parseInt(tokenProvider(), 10);

    const symbolGrid = [];
    for (let i = 0; i < gridH; ++i) {
        symbolGrid.push(tokenProvider());
    }

    const result = computeConnectedComponentsProduct({ dimHeight: gridH, dimWidth: gridW, gridSymbols: symbolGrid });
    process.stdout.write(String(result) + '\n');
}
outputPayload.runMainLogic = entryPointFunction;

// Check if this module is the entry point (e.g., run directly via Node.js or webpack's entry)
// This condition mimics webpack's entry point detection for execution.
if (componentLoader.cache[componentLoader.entryPoint] === moduleInstance) {
    const rawContent = fileSystemAccess.default.readFileSync("/dev/stdin", "utf8");
    entryPointFunction(rawContent);
}

/* WEBPACK VAR INJECTION */}.call(this, componentLoader("./node_modules/webpack/buildin/module.js")(currentMod)))

/***/ }),

/***/ "fs":
/*!***************************************!
  *** external "fs" (Node.js File System) ***!
  \***************************************/
/*! no static exports found */
/***/ (function(currentMod, outputPayload) {

currentMod.exports = require("fs");

/***/ })

/******/ });