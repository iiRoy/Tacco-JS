// This file is part of a competitive programming solution.
// Original path: /contest/atcoder/sumitrust2019/d.ts
/******/ (function(modules) { // Webpack entry point function
/******/ 	// A cache for loaded modules
/******/ 	var installedModules = {};
/******/
/******/ 	// The custom require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if the module is already in the cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module entry and store it in the cache
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId, // Module ID
/******/ 			l: false,    // Not yet loaded
/******/ 			exports: {}  // Exported values
/******/ 		};
/******/
/******/ 		// Execute the module's function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Mark the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// Expose the modules object to the global scope
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// Expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// Define a getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// Define __esModule on exports for ES module compatibility
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// Create a fake namespace object for module interoperability
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
/******/ 	// GetDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call wrapper
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// Public path for assets
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load the entry module and return its exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/contest/atcoder/sumitrust2019/d.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/webpack/buildin/module.js":
/*!************************************************!*\
  !*** (webpack)/buildin/module.js - Webpack Module Polyfill ***!
  \************************************************/
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

/***/ "./src/contest/atcoder/sumitrust2019/d.ts":
/*!************************************************!*\
  !*** ./src/contest/atcoder/sumitrust2019/d.ts - Main Solution Logic ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0; // Export the main function
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
const io_1 = __webpack_require__(/*! ../../common/io */ "./src/contest/common/io.ts");

/**
 * Solves the main problem by finding unique 3-digit passcodes.
 * @param {object} params - The input parameters.
 * @param {number} params.N - The length of the input string.
 * @param {string} params.S - The input string of digits.
 * @returns {number} The total count of unique passcodes.
 */
function computeResult({ N: inputLength, S: inputString }) {
    // dynamicProgression[i][digit] stores the index of the next occurrence of 'digit' after index 'i'.
    const dynamicProgression = Array(inputLength);
    // nextIndexDigit[digit] stores the index of the next occurrence of 'digit' from the current position (iterating backwards).
    const nextIndexDigit = Array(10).fill(-1);

    // Populate the DP table by iterating backwards through the input string.
    for (let currentIdx = inputLength - 1; currentIdx >= 0; currentIdx--) {
        const digitValue = parseInt(inputString[currentIdx]);
        dynamicProgression[currentIdx] = [...nextIndexDigit]; // Copy current state of nextIndexDigit
        nextIndexDigit[digitValue] = currentIdx; // Update for the current digit
    }

    let finalCount = 0; // Initialize the counter for valid passcodes

    // Iterate through all possible 3-digit passcodes (000 to 999).
    codeLoop: for (let currentPasscodeNum = 0; currentPasscodeNum < 1000; currentPasscodeNum++) {
        const targetCode = currentPasscodeNum.toString().padStart(3, '0'); // e.g., "012"

        // Find the first digit of the passcode.
        let currentSearchIndex = nextIndexDigit[parseInt(targetCode[0])];
        if (currentSearchIndex < 0) {
            // If the first digit is not found, this passcode is impossible.
            continue codeLoop;
        }

        // Find the second and third digits of the passcode using the DP table.
        for (let codeDigitIndex = 1; codeDigitIndex < 3; codeDigitIndex++) {
            currentSearchIndex = dynamicProgression[currentSearchIndex][parseInt(targetCode[codeDigitIndex])];
            if (currentSearchIndex < 0) {
                // If any subsequent digit is not found, this passcode is impossible.
                continue codeLoop;
            }
        }

        // If all three digits are found in sequence, increment the count.
        // console.log(targetCode); // Debugging line, commented out as per rules
        finalCount++;
    }
    return finalCount; // Return the total count
}

/**
 * Main function to process input and output the result.
 * @param {string} inputLine - The entire input string from stdin.
 */
function processInput(inputLine) {
    const getNextToken = io_1.getNext(inputLine);
    const inputLength = parseInt(getNextToken());
    const inputString = getNextToken();

    const finalCount = computeResult({ N: inputLength, S: inputString });
    console.log(finalCount);
}
exports.main = processInput; // Export the renamed main function

// Check if this module is the main entry point (webpack specific)
if (__webpack_require__.c[__webpack_require__.s] === module) {
    const fileContent = fs_1.default.readFileSync("/dev/stdin", "utf8");
    processInput(fileContent);
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../../node_modules/webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

/***/ }),

/***/ "./src/contest/common/io.ts":
/*!**********************************!*\
  !*** ./src/contest/common/io.ts - Input/Output Utilities ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextBigInt = exports.getNextInt = exports.getNext = exports.getIteratorWithParser = exports.getIterator = void 0;

/**
 * Creates an iterator that yields string tokens from a line.
 * Tokens are separated by one or more whitespace characters.
 * @param {string} inputStr - The input string line.
 * @returns {Generator<string>} An iterator yielding string tokens.
 */
function* createTokenIterator(inputStr) {
    const strTokens = inputStr.split(/\s+/);
    for (const singleToken of strTokens) {
        yield singleToken;
    }
}
exports.getIterator = createTokenIterator;

/**
 * Creates an iterator that yields parsed tokens from a line.
 * @param {string} inputStr - The input string line.
 * @param {(token: string) => T} valueParser - A function to parse each token.
 * @returns {Generator<T>} An iterator yielding parsed tokens.
 * @template T
 */
function* createParsedIterator(inputStr, valueParser) {
    const strTokens = inputStr.split(/\s+/);
    for (const singleToken of strTokens) {
        yield valueParser(singleToken);
    }
}
exports.getIteratorWithParser = createParsedIterator;

/**
 * Returns a function that gets the next string token from the input line.
 * @param {string} inputStr - The input string line.
 * @returns {() => string} A function to retrieve the next string token.
 */
function getTokenizer(inputStr) {
    const tokenIterator = createTokenIterator(inputStr);
    return () => tokenIterator.next().value;
}
exports.getNext = getTokenizer;

/**
 * Returns a function that gets the next integer token from the input line.
 * @param {string} inputStr - The input string line.
 * @returns {() => number} A function to retrieve the next integer token.
 */
function getIntegerTokenizer(inputStr) {
    const tokenIterator = createTokenIterator(inputStr);
    return () => parseInt(tokenIterator.next().value);
}
exports.getNextInt = getIntegerTokenizer;

/**
 * Returns a function that gets the next BigInt token from the input line.
 * @param {string} inputStr - The input string line.
 * @returns {() => bigint} A function to retrieve the next BigInt token.
 */
function getBigIntTokenizer(inputStr) {
    const tokenIterator = createTokenIterator(inputStr);
    return () => BigInt(tokenIterator.next().value);
}
exports.getNextBigInt = getBigIntTokenizer;


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
