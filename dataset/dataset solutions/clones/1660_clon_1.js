/* This file is a Type I clone generated from the original source.
 * It maintains exact logical equivalence but with altered whitespace and comments.
 * Original path: /home/ts3min/work/tspro/src/contest/atcoder/msol2020/e.ts
 */
/***** (function(modules) { /* webpackBootstrap */
/***** // This is the core module cache for webpack.
/*****  var installedModules = {};
/*****
/*****  // The custom 'require' function for this webpack bundle.
/*****  function __webpack_require__(  moduleId  ) {
/*****
/*****    // If the module is already in the cache, return its exports.
/*****    if ( installedModules[moduleId] ) {
/*****      return installedModules[moduleId].exports;
/*****    }
/*****    // Otherwise, create a new module entry in the cache.
/*****    var module = installedModules[moduleId] = {
/*****      i: moduleId, // Module ID
/*****      l: false,    // Loaded flag (initially false)
/*****      exports: {}  // Module exports object
/*****    };
/*****
/*****    // Execute the module function, populating 'module.exports'.
/*****    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/*****
/*****    // Mark the module as loaded.
/*****    module.l = true;
/*****
/*****    // Return the exports of the newly loaded module.
/*****    return module.exports;
/*****  }
/*****
/*****
/*****  // Expose the modules object to the require function itself.
/*****  __webpack_require__.m = modules;
/*****
/*****  // Expose the module cache for external access if needed.
/*****  __webpack_require__.c = installedModules;
/*****
/*****  // Helper to define getter functions for harmony exports.
/*****  __webpack_require__.d = function(exports, name, getter) {
/*****    if ( !__webpack_require__.o(exports, name) ) {
/*****      Object.defineProperty(exports, name, { enumerable: true, get: getter });
/*****    }
/*****  };
/*****
/*****  // Define __esModule on exports for ES module compatibility.
/*****  __webpack_require__.r = function(exports) {
/*****    // Set Symbol.toStringTag if available.
/*****    if ( typeof Symbol !== 'undefined' && Symbol.toStringTag ) {
/*****      Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/*****    }
/*****    // Mark as an ES module.
/*****    Object.defineProperty(exports, '__esModule', { value: true });
/*****  };
/*****
/*****  // Create a fake namespace object for various module modes.
/*****  // mode & 1: value is a module id, require it.
/*****  // mode & 2: merge all properties of value into the namespace.
/*****  // mode & 4: return value when already a namespace object.
/*****  // mode & 8|1: behave like require.
/*****  __webpack_require__.t = function(value, mode) {
/*****    if ( mode & 1 ) value = __webpack_require__(value);
/*****    if ( mode & 8 ) return value;
/*****    if ( (mode & 4) && typeof value === 'object' && value && value.__esModule ) return value;
/*****    var ns = Object.create(null);
/*****    __webpack_require__.r(ns);
/*****    Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/*****    if ( mode & 2 && typeof value != 'string' ) {
/*****      for ( var key in value ) {
/*****        __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/*****      }
/*****    }
/*****    return ns;
/*****  };
/*****
/*****  // getDefaultExport function for compatibility with non-harmony modules.
/*****  __webpack_require__.n = function(module) {
/*****    var getter = module && module.__esModule ?
/*****      function getDefault() { return module['default']; } :
/*****      function getModuleExports() { return module; };
/*****    __webpack_require__.d(getter, 'a', getter);
/*****    return getter;
/*****  };
/*****
/*****  // Object.prototype.hasOwnProperty.call wrapper.
/*****  __webpack_require__.o = function(object, property) {
/*****    return Object.prototype.hasOwnProperty.call(object, property);
/*****  };
/*****
/*****  // Public path for assets.
/*****  __webpack_require__.p = "";
/*****
/*****
/*****  // Load the entry module and return its exports to start the application.
/*****  return __webpack_require__(__webpack_require__.s = "./src/contest/atcoder/msol2020/e.ts");
/***** })
/************************************************************************/
/***** ({

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

// This function polyfills webpack-specific module properties.
module.exports = function(module) {
  if ( !module.webpackPolyfill ) {
    module.deprecate = function() {};
    module.paths = [];
    // module.parent is undefined by default in webpack.
    if ( !module.children ) module.children = [];
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
exports.main = void 0; // Ensure main is exported.

// Import file system module for reading input.
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));

// Import I/O utility functions.
const io_1 = __webpack_require__(/*! ../../common/io */ "./src/contest/common/io.ts");

// Define an enumeration for coordinate axes.
var Axis;
(function (Axis) {
    Axis["X"] = "X"; // X-axis
    Axis["Y"] = "Y"; // Y-axis
    Axis["N"] = "N"; // None/Neutral
})(Axis || (Axis = {}));

/**
 * Calculates the total shortest path cost based on chosen axes.
 * @param {object} params - Input parameters including N, C, cand, XC, YC.
 * @returns {number} The calculated total shortest path cost.
 */
function calc({ N, C, cand, XC, YC, }) {

    const short = Array(N); // Array to store shortest distances for each point.

    // Initialize 'short' with the minimum of |x|*p or |y|*p for each coordinate.
    for (let i = 0; i < N; i++) {
        short[i] = Math.min(Math.abs(C[i].x), Math.abs(C[i].y)) * C[i].p;
    }

    let bef = null; // Variable to track the index of the last chosen Y-axis point.

    // First pass: Iterate through X-sorted points to find closer Y-axis points (left to right).
    for (let i = 0; i < N; i++) {
        if (cand[XC[i].i] == Axis.Y) { // If the current point is selected for Y-axis.
            bef = i;
            short[XC[i].i] = 0; // Cost is 0 if it's a chosen axis point.
        }
        else if (bef !== null) { // If a Y-axis point was found previously.
            // Update shortest cost if distance to previous Y-axis point is less.
            short[XC[i].i] = Math.min(Math.abs(XC[i].x - XC[bef].x) * XC[i].p, short[XC[i].i]);
        }
    }

    bef = null; // Reset for the next pass.

    // Second pass: Iterate through X-sorted points (right to left) for Y-axis points.
    for (let i = N - 1; i >= 0; i--) {
        if (cand[XC[i].i] == Axis.Y) {
            bef = i;
            short[XC[i].i] = 0;
        }
        else if (bef !== null) {
            short[XC[i].i] = Math.min(Math.abs(XC[i].x - XC[bef].x) * XC[i].p, short[XC[i].i]);
        }
    }

    bef = null; // Reset for Y-axis calculations.

    // Third pass: Iterate through Y-sorted points to find closer X-axis points (bottom to top).
    for (let i = 0; i < N; i++) {
        if (cand[YC[i].i] == Axis.X) { // If the current point is selected for X-axis.
            bef = i;
            short[YC[i].i] = 0; // Cost is 0 if it's a chosen axis point.
        }
        else if (bef !== null) { // If an X-axis point was found previously.
            // Update shortest cost if distance to previous X-axis point is less.
            short[YC[i].i] = Math.min(Math.abs(YC[i].y - YC[bef].y) * YC[i].p, short[YC[i].i]);
        }
    }

    bef = null; // Reset.

    // Fourth pass: Iterate through Y-sorted points (top to bottom) for X-axis points.
    for (let i = N - 1; i >= 0; i--) {
        if (cand[YC[i].i] == Axis.X) {
            bef = i;
            short[YC[i].i] = 0;
        }
        else if (bef !== null) {
            short[YC[i].i] = Math.min(Math.abs(YC[i].y - YC[bef].y) * YC[i].p, short[YC[i].i]);
        }
    }

    // Sum up all the shortest costs.
    return short.reduce((sum, v) => sum + v, 0);
}

/**
 * Recursive function to explore all combinations of axis choices.
 * @param {number} i - Current index of point being considered.
 * @param {number} k - Number of points chosen for an axis.
 * @param {object} sys - System state (cand, N, C, ans, XC, YC).
 */
function rec(i, k, sys) {
    const { cand, N, C, ans, XC, YC } = sys; // Destructure system state.

    // Base case: All points have been considered.
    if (i === N) {
        const res = calc({ N, C, XC, YC, cand }); // Calculate cost for current combination.
        ans[k] = Math.min(ans[k], res); // Update minimum cost for 'k' chosen points.
        return;
    }

    // Option 1: Point 'i' is not chosen for any axis.
    cand[i] = Axis.N;
    rec(i + 1, k, sys);

    // Option 2: Point 'i' is chosen for the X-axis.
    cand[i] = Axis.X;
    rec(i + 1, k + 1, sys);

    // Option 3: Point 'i' is chosen for the Y-axis.
    cand[i] = Axis.Y;
    rec(i + 1, k + 1, sys);
}

/**
 * Solves the main problem by orchestrating the recursive search.
 * @param {object} params - Input containing N (number of points) and C (coordinates).
 * @returns {Array<number>} An array where ans[k] is the minimum cost for choosing k points.
 */
function solve({ N, C }) {
    // Initialize 'ans' array with max safe integer, representing minimum costs for k points.
    const ans = Array(N + 1).fill(Number.MAX_SAFE_INTEGER);

    const cand = Array(N); // Array to store axis choices for each point.

    // Create sorted copies of points for efficient lookup.
    const XC = [...C]; // Points sorted by X-coordinate.
    XC.sort((a, b) => a.x - b.x);

    const YC = [...C]; // Points sorted by Y-coordinate.
    YC.sort((a, b) => a.y - b.y);

    // Bundle system state for recursive calls.
    const sys = {
        N, C, ans, cand, XC, YC,
    };

    // Start the recursive process from the first point (index 0) with 0 chosen points.
    rec(0, 0, sys);

    return ans; // Return the results.
}

/**
 * Main function to read input, process, and print output.
 * @param {string} line - The entire input string from stdin.
 */
function main(line) {
    const nextInt = io_1.getNextInt(line); // Get a function to read integers from the input.

    const N = nextInt(); // Read the number of points.
    const C = [];         // Array to store coordinate objects.

    // Read N points, each with x, y, p, and its original index i.
    for (let i = 0; i < N; i++) {
        const x = nextInt();
        const y = nextInt();
        const p = nextInt();
        C.push({ x, y, p, i }); // Store point data.
    }

    // Solve the problem and print the results, joined by newlines.
    console.log(solve({ N, C }).join('\n'));
}

exports.main = main; // Export main function.

// Check if this script is being run as the main module.
if (__webpack_require__.c[__webpack_require__.s] === module) {
    const line = fs_1.default.readFileSync("/dev/stdin", "utf8"); // Read input from stdin.
    main(line); // Execute the main logic.
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

// Export various utility functions for input parsing.
exports.getNextBigInt = exports.getNextInt = exports.getNext = exports.getIteratorWithParser = exports.getIterator = void 0;

/**
 * Creates an iterator for tokens in a given line.
 * @param {string} line - The input string.
 * @yields {string} Each token from the line.
 */
function* getIterator(line) {
    const tokens = line.split(/\s+/); // Split by one or more whitespace characters.
    for (const token of tokens) {
        yield token;
    }
}
exports.getIterator = getIterator;

/**
 * Creates an iterator for parsed tokens in a given line.
 * @param {string} line - The input string.
 * @param {function} parser - A function to parse each token.
 * @yields {*} The parsed value of each token.
 */
function* getIteratorWithParser(line, parser) {
    const tokens = line.split(/\s+/);
    for (const token of tokens) {
        yield parser(token);
    }
}
exports.getIteratorWithParser = getIteratorWithParser;

/**
 * Returns a function that gets the next string token from a line.
 * @param {string} line - The input string.
 * @returns {function(): string} A function that returns the next string token.
 */
function getNext(line) {
    const it = getIterator(line); // Create an iterator.
    return () => it.next().value; // Return a function to get the next value.
}
exports.getNext = getNext;

/**
 * Returns a function that gets the next integer token from a line.
 * @param {string} line - The input string.
 * @returns {function(): number} A function that returns the next parsed integer.
 */
function getNextInt(line) {
    const it = getIterator(line);
    return () => parseInt(it.next().value); // Parse as integer.
}
exports.getNextInt = getNextInt;

/**
 * Returns a function that gets the next BigInt token from a line.
 * @param {string} line - The input string.
 * @returns {function(): bigint} A function that returns the next parsed BigInt.
 */
function getNextBigInt(line) {
    const it = getIterator(line);
    return () => BigInt(it.next().value); // Parse as BigInt.
}
exports.getNextBigInt = getNextBigInt;


/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("fs"); // External dependency: Node.js 'fs' module.

/***/ })

/***** });
// This marks the end of the webpack bundle.
*/