// This is a Type II clone of the original JavaScript code.
// The structure and behavior are preserved, but identifiers, whitespace, and comments are altered.

// Webpack's module loading and bundling runtime.
(function(modules) {
    // A cache for loaded modules.
    var installedModules = {};

    // The custom require function for modules.
    function __webpack_require__(moduleId) {
        // If the module is already in cache, return its exports.
        if (installedModules[moduleId]) {
            return installedModules[moduleId].exports;
        }
        // Otherwise, create a new module entry and put it in the cache.
        var module = installedModules[moduleId] = {
            i: moduleId, // Module ID
            l: false,    // Loaded flag
            exports: {}  // Exported values
        };

        // Execute the module function with its context.
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

        // Mark the module as loaded.
        module.l = true;

        // Return the module's exports.
        return module.exports;
    }

    // Expose the modules object.
    __webpack_require__.m = modules;

    // Expose the module cache.
    __webpack_require__.c = installedModules;

    // Define a getter function for harmony exports (ESM compatibility).
    __webpack_require__.d = function(exports, name, getter) {
        if (!__webpack_require__.o(exports, name)) {
            Object.defineProperty(exports, name, { enumerable: true, get: getter });
        }
    };

    // Define __esModule on exports for ES module compatibility.
    __webpack_require__.r = function(exports) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
        }
        Object.defineProperty(exports, '__esModule', { value: true });
    };

    // Create a fake namespace object for various module modes.
    __webpack_require__.t = function(value, mode) {
        if (mode & 1) value = __webpack_require__(value); // If mode 1, require the module.
        if (mode & 8) return value; // If mode 8, return value directly.
        if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value; // If mode 4 and already an ES module.
        var ns = Object.create(null); // Create a new namespace object.
        __webpack_require__.r(ns); // Mark as ES module.
        Object.defineProperty(ns, 'default', { enumerable: true, value: value }); // Set default export.
        if (mode & 2 && typeof value != 'string') {
            for (var key in value) {
                __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
            }
        }
        return ns;
    };

    // GetDefaultExport function for compatibility with non-harmony modules.
    __webpack_require__.n = function(module) {
        var getter = module && module.__esModule ?
            function getDefault() { return module['default']; } :
            function getModuleExports() { return module; };
        __webpack_require__.d(getter, 'a', getter);
        return getter;
    };

    // Object.prototype.hasOwnProperty.call wrapper.
    __webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

    // Public path for assets.
    __webpack_require__.p = "";

    // Load the entry module and return its exports.
    return __webpack_require__(__webpack_require__.s = "./src/contest/atcoder/panasonic2020/c.ts");
})
/************************************************************************/
({

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

/***/ "./src/contest/atcoder/panasonic2020/c.ts":
/*!************************************************!*\
  !*** ./src/contest/atcoder/panasonic2020/c.ts ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {
// Helper for default imports in TypeScript/Webpack.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
// Define module as an ES module.
Object.defineProperty(exports, "__esModule", { value: true });
// Export the main function.
exports.executeProgram = void 0;
// Import the file system module.
const fileSystem = __importDefault(__webpack_require__(/*! fs */ "fs"));

/**
 * Recursively generates all possible strings based on the given parameters.
 * This function implements a backtracking algorithm.
 * @param {number} currentLength - The current length of the string being built.
 * @param {number} maxCharIndex - The maximum character index (0 for 'a', 1 for 'b', etc.) allowed for the current position.
 * @param {object} systemState - An object holding shared state: targetLength, resultList, currentString.
 */
function processCombinations(currentLength, maxCharIndex, systemState) {
    const { targetLength, resultList, currentString } = systemState;

    // Base case: if the current string length matches the target length, add it to the results.
    if (currentLength === targetLength) {
        resultList.push(currentString);
        return;
    }

    // Recursive step: iterate through possible characters for the current position.
    for (let charIterator = 0; charIterator <= maxCharIndex; charIterator++) {
        // Convert the character index to its corresponding letter ('a', 'b', etc.).
        const character = String.fromCharCode('a'.charCodeAt(0) + charIterator);
        
        // Recursively call the function with updated state.
        processCombinations(
            currentLength + 1,
            Math.max(maxCharIndex, charIterator + 1), // Update maxCharIndex for the next level.
            {
                targetLength: targetLength,
                resultList: resultList,
                currentString: currentString + character
            }
        );
    }
}

/**
 * Generates a list of strings based on a given target length.
 * @param {object} params - An object containing the target length.
 * @param {number} params.targetLength - The desired length of the strings to generate.
 * @returns {string[]} An array of generated strings.
 */
function generateStrings({ targetLength }) {
    const resultList = []; // Initialize an empty array to store the results.
    // Start the recursive generation process.
    processCombinations(0, 0, { targetLength: targetLength, resultList: resultList, currentString: '' });
    return resultList;
}

/**
 * Main entry point of the program. Reads input, generates strings, and prints them.
 * @param {string} inputLine - The input string, expected to be a number.
 */
function executeProgram(inputLine) {
    // Parse the input line to get the target length.
    const targetLength = parseInt(inputLine);
    // Generate the strings.
    const generatedStrings = generateStrings({ targetLength });
    // Print each generated string to the console.
    for (const outputString of generatedStrings) {
        console.log(outputString);
    }
}
exports.executeProgram = executeProgram;

// Check if this module is the main entry point.
if (__webpack_require__.c[__webpack_require__.s] === module) {
    // Read input from standard input.
    const inputData = fileSystem.default.readFileSync("/dev/stdin", "utf8");
    // Execute the program with the input data.
    executeProgram(inputData);
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../../node_modules/webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

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
// End of Type II clone.
