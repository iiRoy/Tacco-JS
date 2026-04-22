/*!
 *  Path to the source file: /home/ts3min/work/tspro/src/contest/atcoder/msol2020/e.ts
 *  This is a generated file.
 */
/******/ (function(modules) {

    // This is the webpackBootstrap function, responsible for module loading.
    /******/ 	var installedModules = {}; // A cache for already loaded modules.

    // The main require function.
    /******/ 	function __webpack_require__(moduleId) {

        // Check if the requested module is already in the cache.
        /******/ 		if(installedModules[moduleId]) {
            /******/ 			return installedModules[moduleId].exports; // Return its exports if found.
            /******/ 		}

        // If not in cache, create a new module entry.
        /******/ 		var module = installedModules[moduleId] = {
            /******/ 			i: moduleId, // The module's ID.
            /******/ 			l: false,  // Flag indicating if the module has been loaded.
            /******/ 			exports: {} // The module's exports object.
            /******/ 		};

        // Execute the module function, passing necessary arguments.
        /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

        // After execution, mark the module as loaded.
        /******/ 		module.l = true;

        // Finally, return the exports of the newly loaded module.
        /******/ 		return module.exports;
        /******/ 	}


    // Expose the modules object to __webpack_require__.
    /******/ 	__webpack_require__.m = modules;

    // Expose the module cache object.
    /******/ 	__webpack_require__.c = installedModules;

    // Define a getter function for harmony exports (ES module interoperability).
    /******/ 	__webpack_require__.d = function(exports, name, getter) {
        /******/ 		if(!__webpack_require__.o(exports, name)) { // Check if the property doesn't already exist.
            /******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter }); // Define it if not.
            /******/ 		}
        /******/ 	};

    // Define __esModule on exports for ES module compatibility.
    /******/ 	__webpack_require__.r = function(exports) {
        /******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            /******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
            /******/ 		}
        /******/ 		Object.defineProperty(exports, '__esModule', { value: true });
        /******/ 	};

    // Create a fake namespace object for compatibility.
    // mode & 1: value is a module id, require it.
    // mode & 2: merge all properties of value into the namespace.
    // mode & 4: return value when already a namespace object.
    // mode & 8|1: behave like require.
    /******/ 	__webpack_require__.t = function(value, mode) {
        /******/ 		if(mode & 1) value = __webpack_require__(value);
        /******/ 		if(mode & 8) return value;
        /******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
        /******/ 		var ns = Object.create(null); // Create an empty object for the namespace.
        /******/ 		__webpack_require__.r(ns); // Mark it as an ES module.
        /******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value }); // Set a 'default' export.
        /******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
        /******/ 		return ns;
        /******/ 	};

    // getDefaultExport function for compatibility with non-harmony modules.
    /******/ 	__webpack_require__.n = function(module) {
        /******/ 		var getter = module && module.__esModule ?
            /******/ 			function getDefault() { return module['default']; } : // If it's an ES module, get its default export.
            /******/ 			function getModuleExports() { return module; }; // Otherwise, return the module itself.
        /******/ 		__webpack_require__.d(getter, 'a', getter); // Define a getter 'a' for convenience.
        /******/ 		return getter;
        /******/ 	};

    // Object.prototype.hasOwnProperty.call wrapper.
    /******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

    // __webpack_public_path__ - The public path for assets.
    /******/ 	__webpack_require__.p = "";


    // Load the entry module and return its exports.
    /******/ 	return __webpack_require__(__webpack_require__.s = "./src/contest/atcoder/msol2020/e.ts");
    /******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************************************************************************!*\
  !*** (webpack)/buildin/module.js - Webpack's built-in module polyfill for Node.js environment ***!
  \***********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

    module.exports = function(module) {
        // Polyfill webpack-specific properties if they don't exist.
        if (!module.webpackPolyfill) {
            module.deprecate = function() {}; // Stub for deprecation warnings.
            module.paths = []; // Empty paths array.
            // module.parent is undefined by default in webpack.
            if (!module.children) module.children = []; // Initialize children array if missing.
            Object.defineProperty(module, "loaded", {
                enumerable: true,
                get: function() {
                    return module.l; // Expose the 'l' (loaded) flag.
                }
            });
            Object.defineProperty(module, "id", {
                enumerable: true,
                get: function() {
                    return module.i; // Expose the 'i' (id) property.
                }
            });
            module.webpackPolyfill = 1; // Mark as polyfilled.
        }
        return module; // Return the modified module object.
    };


    /***/ }),

/***/ "./src/contest/atcoder/msol2020/e.ts":
/*!*******************************************************************************************!*\
  !*** ./src/contest/atcoder/msol2020/e.ts - Main entry point for the contest solution. ***!
  \*******************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

    "use strict";
    /* WEBPACK VAR INJECTION */(function(module) { // Webpack variable injection for 'module'
        var __importDefault = (this && this.__importDefault) || function (mod) {
            return (mod && mod.__esModule) ? mod : { "default": mod };
        };
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.main = void 0; // Ensure main function is exported.

        const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs")); // Import Node.js 'fs' module.
        const io_1 = __webpack_require__(/*! ../../common/io */ "./src/contest/common/io.ts"); // Import custom I/O utilities.

        // Enum to represent the axis type or 'None'.
        var Axis;
        (function (Axis) {
            Axis["X"] = "X"; // X-axis.
            Axis["Y"] = "Y"; // Y-axis.
            Axis["N"] = "N"; // None (not chosen).
        })(Axis || (Axis = {}));

        /**
         * Calculates the total minimum cost for a given configuration of axis choices.
         * @param {object} params - Input parameters.
         * @param {number} params.N - Number of points.
         * @param {Array<object>} params.C - Array of point objects (x, y, p, i).
         * @param {Array<Axis>} params.cand - Array indicating chosen axis for each point.
         * @returns {number} The calculated total minimum cost.
         */
        function calc({ N, C, cand }) {

            const short = Array(N); // Initialize an array to store shortest distances.

            // Calculate initial shortest distance to an axis for each point.
            for (let i = 0; i < N; i++) {
                short[i] = Math.min(Math.abs(C[i].x), Math.abs(C[i].y)) * C[i].p;
            }

            // Sort points by X-coordinate to process X-axis candidates.
            C.sort((a, b) => a.x - b.x);

            let bef = null; // Pointer to the previous Y-axis candidate.

            // First pass: left-to-right for X-axis distances, considering Y-axis candidates.
            for (let i = 0; i < N; i++) {
                if (cand[C[i].i] == Axis.Y) { // If this point is a Y-axis candidate.
                    bef = i; // Update the 'previous' Y-axis candidate.
                    short[C[i].i] = 0; // Cost for a Y-axis candidate is 0.
                }
                else if (bef !== null) { // If there's a previous Y-axis candidate.
                    // Update shortest distance if connecting to 'bef' is cheaper.
                    short[C[i].i] = Math.min(Math.abs(C[i].x - C[bef].x) * C[i].p, short[C[i].i]);
                }
            }

            bef = null; // Reset pointer for the reverse pass.

            // Second pass: right-to-left for X-axis distances, considering Y-axis candidates.
            for (let i = N - 1; i >= 0; i--) {
                if (cand[C[i].i] == Axis.Y) { // If this point is a Y-axis candidate.
                    bef = i; // Update the 'previous' Y-axis candidate.
                    short[C[i].i] = 0; // Cost is 0 for Y-axis candidates.
                }
                else if (bef !== null) { // If there's a previous Y-axis candidate.
                    // Update shortest distance again.
                    short[C[i].i] = Math.min(Math.abs(C[i].x - C[bef].x) * C[i].p, short[C[i].i]);
                }
            }

            // Sort points by Y-coordinate to process Y-axis candidates.
            C.sort((a, b) => a.y - b.y);

            bef = null; // Pointer to the previous X-axis candidate.

            // Third pass: left-to-right for Y-axis distances, considering X-axis candidates.
            for (let i = 0; i < N; i++) {
                if (cand[C[i].i] == Axis.X) { // If this point is an X-axis candidate.
                    bef = i; // Update the 'previous' X-axis candidate.
                    short[C[i].i] = 0; // Cost for an X-axis candidate is 0.
                }
                else if (bef !== null) { // If there's a previous X-axis candidate.
                    // Update shortest distance if connecting to 'bef' is cheaper.
                    short[C[i].i] = Math.min(Math.abs(C[i].y - C[bef].y) * C[i].i * C[i].p, short[C[i].i]);
                }
            }

            bef = null; // Reset pointer for the reverse pass.

            // Fourth pass: right-to-left for Y-axis distances, considering X-axis candidates.
            for (let i = N - 1; i >= 0; i--) {
                if (cand[C[i].i] == Axis.X) { // If this point is an X-axis candidate.
                    bef = i; // Update the 'previous' X-axis candidate.
                    short[C[i].i] = 0; // Cost is 0 for X-axis candidates.
                }
                else if (bef !== null) { // If there's a previous X-axis candidate.
                    // Update shortest distance again.
                    short[C[i].i] = Math.min(Math.abs(C[i].y - C[bef].y) * C[i].p, short[C[i].i]);
                }
            }

            // Sum up all shortest distances to get the total cost.
            return short.reduce((sum, v) => sum + v, 0);
        }

        /**
         * Recursive function to explore all combinations of axis choices.
         * @param {number} i - Current point index being considered.
         * @param {number} k - Number of chosen X or Y axis candidates so far.
         * @param {object} sys - System state (N, C, ans, cand).
         */
        function rec(i, k, sys) {
            const { cand, N, C, ans } = sys; // Destructure system state.

            // Base case: All points have been considered.
            if (i === N) {
                const CC = [...C]; // Create a shallow copy of points for sorting within calc.
                const res = calc({ N, C: CC, cand }); // Calculate cost for this configuration.
                ans[k] = Math.min(ans[k], res); // Update minimum cost for 'k' candidates.
                return;
            }

            // Option 1: Point i is not chosen as an X or Y candidate (Axis.N).
            cand[i] = Axis.N;
            rec(i + 1, k, sys);

            // Option 2: Point i is chosen as an X-axis candidate (Axis.X).
            cand[i] = Axis.X;
            rec(i + 1, k + 1, sys); // Increment k as a candidate is chosen.

            // Option 3: Point i is chosen as a Y-axis candidate (Axis.Y).
            cand[i] = Axis.Y;
            rec(i + 1, k + 1, sys); // Increment k as a candidate is chosen.
        }

        /**
         * Solves the main problem by iterating through all possible axis choices.
         * @param {object} params - Input parameters.
         * @param {number} params.N - Number of points.
         * @param {Array<object>} params.C - Array of point objects.
         * @returns {Array<number>} An array where ans[k] is the minimum cost for choosing k candidates.
         */
        function solve({ N, C }) {
            // Initialize answer array with max safe integer.
            const ans = Array(N + 1).fill(Number.MAX_SAFE_INTEGER);
            const cand = Array(N); // Array to store axis choices for each point.

            // System object to pass mutable state to recursive function.
            const sys = {
                N, C, ans, cand,
            };

            rec(0, 0, sys); // Start the recursive process from the first point.

            return ans; // Return the final minimum costs.
        }

        /**
         * Main function to read input, process, and print output.
         * @param {string} line - The input string containing N and point data.
         */
        function main(line) {
            const nextInt = io_1.getNextInt(line); // Get a function to parse integers from input.
            const N = nextInt(); // Read the number of points.
            const C = []; // Array to store point data.

            // Loop to read N points.
            for (let i = 0; i < N; i++) {
                const x = nextInt(); // X-coordinate.
                const y = nextInt(); // Y-coordinate.
                const p = nextInt(); // Power/cost multiplier.
                C.push({ x, y, p, i }); // Store point data along with its original index.
            }

            // Solve the problem and print the results, one per line.
            console.log(solve({ N, C }).join('\n'));
        }

        exports.main = main; // Export the main function.

        // Check if this module is the main entry point (executed directly).
        if (__webpack_require__.c[__webpack_require__.s] === module) {
            // Read input from stdin.
            const line = fs_1.default.readFileSync("/dev/stdin", "utf8");
            main(line); // Call the main function with the input.
        }

        /* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../../node_modules/webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

    /***/ }),

/***/ "./src/contest/common/io.ts":
/*!***************************************************************************!*\
  !*** ./src/contest/common/io.ts - Common input/output utility functions. ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

    "use strict";

    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getNextBigInt = exports.getNextInt = exports.getNext = exports.getIteratorWithParser = exports.getIterator = void 0;

    /**
     * Creates an iterator that yields string tokens from a line.
     * Tokens are split by whitespace.
     * @param {string} line - The input string line.
     * @returns {Generator<string>} An iterator yielding tokens.
     */
    function* getIterator(line) {
        const tokens = line.split(/\s+/); // Split by one or more whitespace characters.
        for (const token of tokens) {
            yield token; // Yield each token.
        }
    }
    exports.getIterator = getIterator;

    /**
     * Creates an iterator that yields parsed tokens from a line.
     * @param {string} line - The input string line.
     * @param {function(string): any} parser - A function to parse each token.
     * @returns {Generator<any>} An iterator yielding parsed tokens.
     */
    function* getIteratorWithParser(line, parser) {
        const tokens = line.split(/\s+/); // Split by whitespace.
        for (const token of tokens) {
            yield parser(token); // Parse and yield each token.
        }
    }
    exports.getIteratorWithParser = getIteratorWithParser;

    /**
     * Returns a function that gets the next string token from the input line.
     * @param {string} line - The input string line.
     * @returns {function(): string} A function that returns the next token.
     */
    function getNext(line) {
        const it = getIterator(line); // Get a string iterator.
        return () => it.next().value; // Return a function that calls next().value.
    }
    exports.getNext = getNext;

    /**
     * Returns a function that gets the next integer token from the input line.
     * @param {string} line - The input string line.
     * @returns {function(): number} A function that returns the next integer.
     */
    function getNextInt(line) {
        const it = getIterator(line); // Get a string iterator.
        return () => parseInt(it.next().value); // Parse to integer and return.
    }
    exports.getNextInt = getNextInt;

    /**
     * Returns a function that gets the next BigInt token from the input line.
     * @param {string} line - The input string line.
     * @returns {function(): bigint} A function that returns the next BigInt.
     */
    function getNextBigInt(line) {
        const it = getIterator(line); // Get a string iterator.
        return () => BigInt(it.next().value); // Parse to BigInt and return.
    }
    exports.getNextBigInt = getNextBigInt;


    /***/ }),

/***/ "fs":
/*!*************************************!*\
  !*** external "fs" - Node.js 'fs' module ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

    module.exports = require("fs"); // Import the native Node.js 'fs' module.

    /***/ })

/******/ });
//# sourceMappingURL=submit.js.map