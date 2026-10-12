/*! path: src/contest/atcoder/aising2019/c.ts */
/******/ (function(moduleMap) { // webpack entry point for modules
/******/ 	// The module cache for already loaded modules
/******/ 	var loadedModulesCache = {};
/******/
/******/ 	// The custom module require function
/******/ 	function customRequire(moduleIdentifier) {
/******/
/******/ 		// Check if the module is already in the cache
/******/ 		if(loadedModulesCache[moduleIdentifier]) {
/******/ 			return loadedModulesCache[moduleIdentifier].exports;
/******/ 		}
/******/ 		// Create a new module entry (and store it in the cache)
/******/ 		var currentModule = loadedModulesCache[moduleIdentifier] = {
/******/ 			i: moduleIdentifier, // module ID
/******/ 			l: false,            // loaded flag, initially false
/******/ 			exports: {}          // module exports object
/******/ 		};
/******/
/******/ 		// Execute the module's function with its context
/******/ 		moduleMap[moduleIdentifier].call(currentModule.exports, currentModule, currentModule.exports, customRequire);
/******/
/******/ 		// Mark the module as fully loaded
/******/ 		currentModule.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return currentModule.exports;
/******/ 	}
/******/
/******/
/******/ 	// Expose the modules object (similar to __webpack_modules__)
/******/ 	customRequire.m = moduleMap;
/******/
/******/ 	// Expose the module cache object
/******/ 	customRequire.c = loadedModulesCache;
/******/
/******/ 	// Define getter function for harmony exports (ESM compatibility)
/******/ 	customRequire.d = function(exportsObject, exportName, getterFunction) {
/******/ 		if(!customRequire.o(exportsObject, exportName)) {
/******/ 			Object.defineProperty(exportsObject, exportName, { enumerable: true, get: getterFunction });
/******/ 		}
/******/ 	};
/******/
/******/ 	// Define __esModule on exports for ESM compatibility
/******/ 	customRequire.r = function(exportsObject) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exportsObject, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exportsObject, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// Create a fake namespace object for various module types
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the namespace
/******/ 	// mode & 4: return value when already a namespace object
/******/ 	// mode & 8|1: behave like require
/******/ 	customRequire.t = function(valueToProcess, processingMode) {
/******/ 		if(processingMode & 1) valueToProcess = customRequire(valueToProcess);
/******/ 		if(processingMode & 8) return valueToProcess;
/******/ 		if((processingMode & 4) && typeof valueToProcess === 'object' && valueToProcess && valueToProcess.__esModule) return valueToProcess;
/******/ 		var namespaceObject = Object.create(null);
/******/ 		customRequire.r(namespaceObject);
/******/ 		Object.defineProperty(namespaceObject, 'default', { enumerable: true, value: valueToProcess });
/******/ 		if(processingMode & 2 && typeof valueToProcess != 'string') for(var propKey in valueToProcess) customRequire.d(namespaceObject, propKey, function(propKey) { return valueToProcess[propKey]; }.bind(null, propKey));
/******/ 		return namespaceObject;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	customRequire.n = function(moduleObject) {
/******/ 		var defaultGetter = moduleObject && moduleObject.__esModule ?
/******/ 			function getTheDefault() { return moduleObject['default']; } :
/******/ 			function getModuleExports() { return moduleObject; };
/******/ 		customRequire.d(defaultGetter, 'a', defaultGetter);
/******/ 		return defaultGetter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call check utility
/******/ 	customRequire.o = function(targetObject, propertyName) { return Object.prototype.hasOwnProperty.call(targetObject, propertyName); };
/******/
/******/ 	// __webpack_public_path__ (empty in this case)
/******/ 	customRequire.p = "";
/******/
/******/
/******/ 	// Load the entry module and return its exports
/******/ 	return customRequire(customRequire.s = "./src/contest/atcoder/aising2019/c.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(currentModule) {

currentModule.exports = function(mod) {
	if (!mod.webpackPolyfill) {
		mod.deprecate = function() {};
		mod.paths = [];
		// mod.parent is undefined by default
		if (!mod.children) mod.children = [];
		Object.defineProperty(mod, "loaded", {
			enumerable: true,
			get: function() {
				return mod.l;
			}
		});
		Object.defineProperty(mod, "id", {
			enumerable: true,
			get: function() {
				return mod.i;
			}
		});
		mod.webpackPolyfill = 1;
	}
	return mod;
};


/***/ }),

/***/ "./src/contest/atcoder/aising2019/c.ts":
/*!*********************************************!*\
  !*** ./src/contest/atcoder/aising2019/c.ts ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, customRequire) {

"use strict";
/* WEBPACK VAR INJECTION */(function(currentModule) {
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.entryPoint = void 0; // Renamed 'main' to 'entryPoint'
const fileSystem = __importDefault(customRequire(/*! fs */ "fs")); // Renamed 'fs_1' to 'fileSystem'
const inputOutput = customRequire(/*! ../../common/io */ "./src/contest/common/io.ts"); // Renamed 'io_1' to 'inputOutput'
const disjointSetUtil = customRequire(/*! ../../common/uf */ "./src/contest/common/uf.ts"); // Renamed 'uf_1' to 'disjointSetUtil'

// Array for row offsets (down, right)
const rowOffsets = [1, 0]; // Renamed 'vr' to 'rowOffsets'
// Array for column offsets (down, right)
const colOffsets = [0, 1]; // Renamed 'vc' to 'colOffsets'

/**
 * Calculates the number of alternating color pairs in a grid.
 * @param {object} gridParameters - Object containing grid dimensions and data.
 * @param {number} gridParameters.gridHeight - The number of rows in the grid.
 * @param {number} gridParameters.gridWidth - The number of columns in the grid.
 * @param {string[]} gridParameters.gridData - An array of strings, each representing a row of the grid.
 * @returns {number} The total count of black-white alternating pairs.
 */
function processGrid({ gridHeight, gridWidth, gridData }) { // Renamed 'solve', 'H', 'W', 'S'
    // Initialize a Disjoint Set Union structure for all cells in the grid
    const cellDisjointSet = new disjointSetUtil.DisjointSet(gridHeight * gridWidth); // Renamed 'uf', 'UnionFind'

    // Iterate through each cell to establish connections based on color differences
    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) { // Renamed 'r' to 'rowIndex'
        for (let colIndex = 0; colIndex < gridWidth; colIndex++) { // Renamed 'c' to 'colIndex'
            const currentCellId = rowIndex * gridWidth + colIndex; // Renamed 'id' to 'currentCellId'

            // Check two specific neighbors: the cell directly below and the cell directly to the right
            for (let offsetIndex = 0; offsetIndex < 2; offsetIndex++) { // Renamed 'i' to 'offsetIndex'
                const nextRow = rowIndex + rowOffsets[offsetIndex]; // Renamed 'nr' to 'nextRow'
                const nextCol = colIndex + colOffsets[offsetIndex]; // Renamed 'nc' to 'nextCol'

                // Ensure the neighbor is within the grid boundaries
                if (nextRow < gridHeight && nextCol < gridWidth) {
                    const nextCellId = nextRow * gridWidth + nextCol; // Renamed 'nid' to 'nextCellId'
                    // If the current cell and its neighbor have different colors, unite their sets
                    if (gridData[rowIndex][colIndex] !== gridData[nextRow][nextCol]) {
                        cellDisjointSet.uniteSets(currentCellId, nextCellId); // Renamed 'union'
                    }
                }
            }
        }
    }

    // Maps to store the counts of black ('#') and white ('.') cells for each connected component's root
    const blackCellCounts = new Map(); // Renamed 'dark' to 'blackCellCounts'
    const whiteCellCounts = new Map(); // Renamed 'light' to 'whiteCellCounts'

    // Populate the counts for each component by iterating through all cells again
    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) { // Renamed 'r' to 'rowIndex'
        for (let colIndex = 0; colIndex < gridWidth; colIndex++) { // Renamed 'c' to 'colIndex'
            const currentCellId = rowIndex * gridWidth + colIndex; // Renamed 'id' to 'currentCellId'
            const componentRoot = cellDisjointSet.findRoot(currentCellId); // Renamed 'root', 'uf.root'

            // Increment the count for the respective color in its component's map
            if (gridData[rowIndex][colIndex] === '#') {
                blackCellCounts.set(componentRoot, 1 + (blackCellCounts.get(componentRoot) || 0));
            } else {
                whiteCellCounts.set(componentRoot, 1 + (whiteCellCounts.get(componentRoot) || 0));
            }
        }
    }

    let totalAlternatingPairs = 0; // Renamed 'ans' to 'totalAlternatingPairs'

    // Calculate the total number of alternating pairs by multiplying black and white counts for each component
    for (const componentRoot of blackCellCounts.keys()) { // Renamed 'root' to 'componentRoot'
        const blackCount = blackCellCounts.get(componentRoot); // Renamed 'dc' to 'blackCount'
        const whiteCount = whiteCellCounts.get(componentRoot) || 0; // Renamed 'lc' to 'whiteCount'
        totalAlternatingPairs += blackCount * whiteCount;
    }

    return totalAlternatingPairs;
}

/**
 * The main entry point function for processing input and producing output.
 * @param {string} inputLine - The complete input string read from stdin.
 */
function entryPoint(inputLine) { // Renamed 'main' to 'entryPoint', 'line' to 'inputLine'
    const tokenReader = inputOutput.getReaderFunction(inputLine); // Renamed 'next', 'getNext'
    const gridHeight = parseInt(tokenReader()); // Renamed 'H', 'next'
    const gridWidth = parseInt(tokenReader()); // Renamed 'W', 'next'

    const gridData = []; // Renamed 'S' to 'gridData'
    for (let i = 0; i < gridHeight; i++) {
        gridData[i] = tokenReader(); // Renamed 'S', 'next'
    }

    console.log(processGrid({ gridHeight, gridWidth, gridData })); // Renamed 'solve', 'H', 'W', 'S'
}
exports.entryPoint = entryPoint; // Renamed 'main' to 'entryPoint'

// Check if this module is the main entry point (webpack specific condition)
if (customRequire.c[customRequire.s] === currentModule) {
    const stdinContent = fileSystem.default.readFileSync("/dev/stdin", "utf8"); // Renamed 'line', 'fs_1'
    entryPoint(stdinContent); // Renamed 'main', 'line'
}

/* WEBPACK VAR INJECTION */}.call(this, customRequire(/*! ./../../../../node_modules/webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

/***/ }),

/***/ "./src/contest/common/io.ts":
/*!**********************************!*\
  !*** ./src/contest/common/io.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.getBigIntReader = exports.getIntegerReader = exports.getReaderFunction = exports.createParsedTokenIterator = exports.createTokenIterator = void 0; // Renamed exports

/**
 * Generates an iterator that yields string tokens from a given line of text.
 * Tokens are split by one or more whitespace characters.
 * @param {string} textLine - The input string to be tokenized.
 * @returns {Generator<string>} An iterator yielding string tokens.
 */
function* createTokenIterator(textLine) { // Renamed 'getIterator', 'line' to 'textLine'
    const stringTokens = textLine.split(/\s+/); // Renamed 'tokens' to 'stringTokens'
    for (const currentToken of stringTokens) { // Renamed 'token' to 'currentToken'
        yield currentToken;
    }
}
exports.createTokenIterator = createTokenIterator; // Renamed 'getIterator'

/**
 * Generates an iterator that yields parsed tokens from a line of text.
 * Each token is processed by the provided parser function.
 * @param {string} textLine - The input string to tokenize and parse.
 * @param {(token: string) => any} tokenParser - A function to parse each individual token.
 * @returns {Generator<any>} An iterator yielding the parsed tokens.
 */
function* createParsedTokenIterator(textLine, tokenParser) { // Renamed 'getIteratorWithParser', 'line' to 'textLine', 'parser' to 'tokenParser'
    const stringTokens = textLine.split(/\s+/); // Renamed 'tokens' to 'stringTokens'
    for (const currentToken of stringTokens) { // Renamed 'token' to 'currentToken'
        yield tokenParser(currentToken);
    }
}
exports.createParsedTokenIterator = createParsedTokenIterator; // Renamed 'getIteratorWithParser'

/**
 * Returns a function that, when called, provides the next string token from the input line.
 * @param {string} textLine - The input string from which to read tokens.
 * @returns {() => string} A function that returns the next string token.
 */
function getReaderFunction(textLine) { // Renamed 'getNext', 'line' to 'textLine'
    const tokenIterator = createTokenIterator(textLine); // Renamed 'it', 'getIterator'
    return () => tokenIterator.next().value;
}
exports.getReaderFunction = getReaderFunction; // Renamed 'getNext'

/**
 * Returns a function that, when called, provides the next integer token from the input line.
 * @param {string} textLine - The input string from which to read integer tokens.
 * @returns {() => number} A function that returns the next integer token.
 */
function getIntegerReader(textLine) { // Renamed 'getNextInt', 'line' to 'textLine'
    const tokenIterator = createTokenIterator(textLine); // Renamed 'it', 'getIterator'
    return () => parseInt(tokenIterator.next().value);
}
exports.getIntegerReader = getIntegerReader; // Renamed 'getNextInt'

/**
 * Returns a function that, when called, provides the next BigInt token from the input line.
 * @param {string} textLine - The input string from which to read BigInt tokens.
 * @returns {() => bigint} A function that returns the next BigInt token.
 */
function getBigIntReader(textLine) { // Renamed 'getNextBigInt', 'line' to 'textLine'
    const tokenIterator = createTokenIterator(textLine); // Renamed 'it', 'getIterator'
    return () => BigInt(tokenIterator.next().value);
}
exports.getBigIntReader = getBigIntReader; // Renamed 'getNextBigInt'


/***/ }),

/***/ "./src/contest/common/uf.ts":
/*!**********************************!*\
  !*** ./src/contest/common/uf.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.DisjointSet = void 0; // Renamed 'UnionFind' to 'DisjointSet'

/**
 * Implements a Disjoint Set Union (DSU) data structure, also known as Union-Find.
 * It supports path compression and union by size for efficient operations.
 */
class DisjointSet { // Renamed 'UnionFind'
    /**
     * Constructs a new DisjointSet instance.
     * @param {number} elementCount - The initial number of elements in the collection.
     */
    constructor(elementCount) { // Renamed 'n' to 'elementCount'
        this.parentArray = new Array(elementCount); // Renamed 'v' to 'parentArray'
        this.parentArray.fill(-1); // Initialize all elements as roots, with size 1 (represented by -1)
    }

    /**
     * Unites the sets containing elements at index `idxA` and `idxB`.
     * If they are already in the same set, no action is taken.
     * @param {number} idxA - The index of the first element.
     * @param {number} idxB - The index of the second element.
     */
    uniteSets(idxA, idxB) { // Renamed 'union', 'a' to 'idxA', 'b' to 'idxB'
        // Only perform union if the two elements are not already connected
        if (!this.areConnected(idxA, idxB)) { // Renamed 'find'
            let rootA = this.findRoot(idxA); // Renamed 'ra', 'root'
            let rootB = this.findRoot(idxB); // Renamed 'rb', 'root'

            // Union by size: attach the smaller tree under the root of the larger tree
            if (this.getSetSize(rootA) > this.getSetSize(rootB)) { // Renamed 'size'
                this.parentArray[rootA] += this.parentArray[rootB]; // Update the size of the new root
                this.parentArray[rootB] = rootA; // Make rootA the parent of rootB
            } else {
                this.parentArray[rootB] += this.parentArray[rootA]; // Update the size of the new root
                this.parentArray[rootA] = rootB; // Make rootB the parent of rootA
            }
        }
    }

    /**
     * Checks if two elements are part of the same disjoint set.
     * @param {number} idxA - The index of the first element.
     * @param {number} idxB - The index of the second element.
     * @returns {boolean} True if elements are in the same set, false otherwise.
     */
    areConnected(idxA, idxB) { // Renamed 'find', 'a' to 'idxA', 'b' to 'idxB'
        return this.findRoot(idxA) === this.findRoot(idxB); // Renamed 'root'
    }

    /**
     * Finds the root (representative) of the set containing the element at `idx`.
     * This method also performs path compression to flatten the tree structure.
     * @param {number} idx - The index of the element.
     * @returns {number} The root of the set containing `idx`.
     */
    findRoot(idx) { // Renamed 'root', 'a' to 'idx'
        if (this.parentArray[idx] < 0) {
            return idx; // If the value is negative, it's a root
        }
        // Path compression: recursively find the root and set it as the direct parent
        this.parentArray[idx] = this.findRoot(this.parentArray[idx]);
        return this.parentArray[idx];
    }

    /**
     * Retrieves the size of the set containing the element at `idx`.
     * @param {number} idx - The index of the element.
     * @returns {number} The number of elements in the set.
     */
    getSetSize(idx) { // Renamed 'size', 'a' to 'idx'
        return -this.parentArray[this.findRoot(idx)]; // The size is stored as a negative value at the root
    }
}
exports.DisjointSet = DisjointSet; // Renamed 'UnionFind'


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
