/*!
 *  Path to source file: src/contest/atcoder/aising2019/c.ts
 *  This is a generated file by webpack.
 */
/******/ (function (modules) {
    // This is the webpackBootstrap function.
    // It takes a modules object as an argument.

    /**
     * @type {Object.<number, Module>}
     * The cache for loaded modules.
     */
    var installedModules = {};

    // The require function.
    function __webpack_require__(moduleId) {

        // Check if module is already in cache.
        if (installedModules[moduleId]) {
            return installedModules[moduleId].exports;
        }

        // Create a new module (and put it into the cache).
        var module = installedModules[moduleId] = {
            i: moduleId, // Module ID
            l: false, // Not loaded yet
            exports: {} // Exported objects
        };

        // Execute the module function.
        modules[moduleId].call(
            module.exports,
            module,
            module.exports,
            __webpack_require__
        );

        // Flag the module as loaded.
        module.l = true;

        // Return the exports of the module.
        return module.exports;
    }


    // Expose the modules object (__webpack_modules__).
    __webpack_require__.m = modules;

    // Expose the module cache.
    __webpack_require__.c = installedModules;

    // Define getter function for harmony exports.
    __webpack_require__.d = function (exports, name, getter) {
        if (!__webpack_require__.o(exports, name)) {
            Object.defineProperty(exports, name, {
                enumerable: true,
                get: getter
            });
        }
    };

    // Define __esModule on exports.
    __webpack_require__.r = function (exports) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exports, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        Object.defineProperty(exports, '__esModule', {
            value: true
        });
    };

    // Create a fake namespace object.
    // mode & 1: value is a module id, require it.
    // mode & 2: merge all properties of value into the ns.
    // mode & 4: return value when already ns object.
    // mode & 8|1: behave like require.
    __webpack_require__.t = function (value, mode) {
        if (mode & 1)
            value = __webpack_require__(value);
        if (mode & 8)
            return value;
        if ((mode & 4) && typeof value === 'object' && value && value.__esModule)
            return value;
        var ns = Object.create(null);
        __webpack_require__.r(ns);
        Object.defineProperty(ns, 'default', {
            enumerable: true,
            value: value
        });
        if (mode & 2 && typeof value != 'string')
            for (var key in value)
                __webpack_require__.d(ns, key, function (key) {
                    return value[key];
                }.bind(null, key));
        return ns;
    };

    // getDefaultExport function for compatibility with non-harmony modules.
    __webpack_require__.n = function (module) {
        var getter = module && module.__esModule ?
            function getDefault() {
                return module['default'];
            } :
            function getModuleExports() {
                return module;
            };
        __webpack_require__.d(getter, 'a', getter);
        return getter;
    };

    // Object.prototype.hasOwnProperty.call.
    __webpack_require__.o = function (object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };

    // __webpack_public_path__.
    __webpack_require__.p = "";


    // Load entry module and return exports.
    return __webpack_require__(
        (__webpack_require__.s = "./src/contest/atcoder/aising2019/c.ts")
    );
})
/************************************************************************/
/******/ ({

    /***/
    "./node_modules/webpack/buildin/module.js":
    /*!***********************************!*\
      !*** (webpack)/buildin/module.js ***!
      \***********************************/
    /*! no static exports found */
    /***/
    (function (module, exports) {

        /**
         * This function provides a polyfill for the Node.js `module` object
         * to make it compatible with webpack's internal module system.
         * @param {Module} module The module object to polyfill.
         */
        module.exports = function (module) {
            if (!module.webpackPolyfill) {
                module.deprecate = function () {};
                module.paths = [];
                // module.parent is undefined by default in webpack.
                if (!module.children)
                    module.children = [];
                Object.defineProperty(module, "loaded", {
                    enumerable: true,
                    get: function () {
                        return module.l;
                    }
                });
                Object.defineProperty(module, "id", {
                    enumerable: true,
                    get: function () {
                        return module.i;
                    }
                });
                module.webpackPolyfill = 1; // Mark as polyfilled.
            }
            return module;
        };


        /***/
    }),

    /***/
    "./src/contest/atcoder/aising2019/c.ts":
    /*!*********************************************!*\
      !*** ./src/contest/atcoder/aising2019/c.ts ***!
      \*********************************************/
    /*! no static exports found */
    /***/
    (function (module, exports, __webpack_require__) {

        "use strict";
        /* WEBPACK VAR INJECTION */
        (function (module) {
            var __importDefault = (this && this.__importDefault) || function (mod) {
                return (mod && mod.__esModule) ? mod : {
                    "default": mod
                };
            };
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.main = void 0;
            // Import file system module.
            const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
            // Import I/O utilities.
            const io_1 = __webpack_require__(/*! ../../common/io */ "./src/contest/common/io.ts");
            // Import Union-Find data structure.
            const uf_1 = __webpack_require__(/*! ../../common/uf */ "./src/contest/common/uf.ts");

            // Define row and column offsets for neighbors.
            const vr = [1, 0]; // Vertical movement (down)
            const vc = [0, 1]; // Horizontal movement (right)

            /**
             * Solves the problem for the given grid.
             * @param {Object} params - The input parameters.
             * @param {number} params.H - Height of the grid.
             * @param {number} params.W - Width of the grid.
             * @param {string[]} params.S - The grid as an array of strings.
             * @returns {number} The final answer.
             */
            function solve({
                H,
                W,
                S
            }) {
                // Initialize Union-Find structure for H * W elements.
                const uf = new uf_1.UnionFind(H * W);

                // Iterate through each cell in the grid.
                for (let r = 0; r < H; r++) {
                    for (let c = 0; c < W; c++) {
                        // Calculate the unique ID for the current cell.
                        const id = r * W + c;

                        // Check neighbors (only right and down for unique pairs).
                        for (let i = 0; i < 2; i++) {
                            const nr = r + vr[i]; // Neighbor row
                            const nc = c + vc[i]; // Neighbor column

                            // Check if neighbor is within grid bounds.
                            if (nr < H && nc < W) {
                                // Calculate neighbor's unique ID.
                                const nid = nr * W + nc;

                                // If current cell and neighbor have different colors, union them.
                                if (S[r][c] !== S[nr][nc]) {
                                    uf.union(id, nid);
                                }
                            }
                        }
                    }
                }

                // Maps to store counts of dark and light cells per connected component.
                const dark = new Map();
                const light = new Map();

                // Populate dark and light counts for each component.
                for (let r = 0; r < H; r++) {
                    for (let c = 0; c < W; c++) {
                        const id = r * W + c; // Current cell ID.
                        const root = uf.root(id); // Find the root of its component.

                        // Increment count based on cell color.
                        if (S[r][c] === '#') {
                            dark.set(root, 1 + (dark.get(root) || 0));
                        } else {
                            light.set(root, 1 + (light.get(root) || 0));
                        }
                    }
                }

                let ans = 0; // Initialize total answer.

                // Calculate the answer by multiplying dark and light counts for each component.
                for (const root of dark.keys()) {
                    const dc = dark.get(root); // Dark cells in this component.
                    const lc = light.get(root) || 0; // Light cells in this component (default to 0 if none).
                    ans += dc * lc; // Add product to total.
                }

                return ans; // Return the final answer.
            }

            /**
             * Main function to read input, process, and output the result.
             * @param {string} line - The input string containing all data.
             */
            function main(line) {
                const getNextToken = io_1.getNext(line); // Get a function to retrieve next token.

                const H = parseInt(getNextToken()); // Parse height H.
                const W = parseInt(getNextToken()); // Parse width W.

                const S = []; // Initialize grid array.
                for (let i = 0; i < H; i++) {
                    S[i] = getNextToken(); // Read each row of the grid.
                }

                // Solve the problem and print the result to console.
                console.log(solve({
                    H,
                    W,
                    S
                }));
            }
            exports.main = main; // Export main function.

            // Check if this module is the main entry point (not imported by another module).
            if (__webpack_require__.c[__webpack_require__.s] === module) {
                // Read input from standard in.
                const line = fs_1.default.readFileSync("/dev/stdin", "utf8");
                main(line); // Call the main function.
            }

            /* WEBPACK VAR INJECTION */
        }.call(this, __webpack_require__(/*! ./../../../../node_modules/webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

        /***/
    }),

    /***/
    "./src/contest/common/io.ts":
    /*!**********************************!*\
      !*** ./src/contest/common/io.ts ***!
      \**********************************/
    /*! no static exports found */
    /***/
    (function (module, exports, __webpack_require__) {

        "use strict";

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.getNextBigInt = exports.getNextInt = exports.getNext = exports.getIteratorWithParser = exports.getIterator = void 0;

        /**
         * Creates an iterator over tokens in a line, split by whitespace.
         * @param {string} line The input string.
         * @yields {string} Each token from the line.
         */
        function* getIterator(line) {
            const tokens = line.split(/\s+/); // Split by one or more whitespace characters.
            for (const token of tokens) {
                yield token; // Yield each token.
            }
        }
        exports.getIterator = getIterator;

        /**
         * Creates an iterator over parsed tokens in a line.
         * @param {string} line The input string.
         * @param {function(string):any} parser A function to parse each token.
         * @yields {any} Each parsed token.
         */
        function* getIteratorWithParser(line, parser) {
            const tokens = line.split(/\s+/); // Split the line into tokens.
            for (const token of tokens) {
                yield parser(token); // Parse and yield each token.
            }
        }
        exports.getIteratorWithParser = getIteratorWithParser;

        /**
         * Returns a function that gets the next token from an input line.
         * @param {string} line The input string.
         * @returns {function():string} A function to get the next token.
         */
        function getNext(line) {
            const it = getIterator(line); // Get a token iterator.
            return () => it.next().value; // Return a function that returns the next token's value.
        }
        exports.getNext = getNext;

        /**
         * Returns a function that gets the next integer from an input line.
         * @param {string} line The input string.
         * @returns {function():number} A function to get the next integer.
         */
        function getNextInt(line) {
            const it = getIterator(line); // Get a token iterator.
            return () => parseInt(it.next().value); // Parse and return the next integer.
        }
        exports.getNextInt = getNextInt;

        /**
         * Returns a function that gets the next BigInt from an input line.
         * @param {string} line The input string.
         * @returns {function():bigint} A function to get the next BigInt.
         */
        function getNextBigInt(line) {
            const it = getIterator(line); // Get a token iterator.
            return () => BigInt(it.next().value); // Parse and return the next BigInt.
        }
        exports.getNextBigInt = getNextBigInt;


        /***/
    }),

    /***/
    "./src/contest/common/uf.ts":
    /*!**********************************!*\
      !*** ./src/contest/common/uf.ts ***!
      \**********************************/
    /*! no static exports found */
    /***/
    (function (module, exports, __webpack_require__) {

        "use strict";

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.UnionFind = void 0;

        /**
         * Implements a Union-Find data structure.
         * Supports union, find, root, and size operations.
         */
        class UnionFind {
            /**
             * Initializes the UnionFind structure with `n` elements.
             * Each element is initially its own set, with size 1 (represented as -1).
             * @param {number} n The number of elements.
             */
            constructor(n) {
                this.v = new Array(n); // Internal array to store parent/size.
                this.v.fill(-1); // Initialize all elements as roots with size -1.
            }

            /**
             * Unions the sets containing elements `a` and `b`.
             * Performs union by size optimization.
             * @param {number} a The first element.
             * @param {number} b The second element.
             */
            union(a, b) {
                if (!this.find(a, b)) { // Only union if they are in different sets.
                    const ra = this.root(a); // Get root of a.
                    const rb = this.root(b); // Get root of b.

                    // Union by size: attach smaller tree to root of larger tree.
                    if (this.size(ra) > this.size(rb)) {
                        this.v[ra] += this.v[rb]; // Update size of new root.
                        this.v[rb] = ra; // Set parent of smaller tree's root.
                    } else {
                        this.v[rb] += this.v[ra]; // Update size of new root.
                        this.v[ra] = rb; // Set parent of smaller tree's root.
                    }
                }
            }

            /**
             * Checks if elements `a` and `b` are in the same set.
             * @param {number} a The first element.
             * @param {number} b The second element.
             * @returns {boolean} True if `a` and `b` are in the same set, false otherwise.
             */
            find(a, b) {
                return this.root(a) === this.root(b); // Compare their roots.
            }

            /**
             * Finds the root of the set containing element `a`.
             * Performs path compression optimization.
             * @param {number} a The element.
             * @returns {number} The root of the set.
             */
            root(a) {
                if (this.v[a] < 0) {
                    return a; // If negative, 'a' is a root.
                }
                // Path compression: set parent of 'a' to its root.
                this.v[a] = this.root(this.v[a]);
                return this.v[a];
            }

            /**
             * Returns the size of the set containing element `a`.
             * @param {number} a The element.
             * @returns {number} The size of the set.
             */
            size(a) {
                return -this.v[this.root(a)]; // Size is stored as the negative value at the root.
            }
        }
        exports.UnionFind = UnionFind;


        /***/
    }),

    /***/
    "fs":
    /*!*********************!*\
      !*** external "fs" ***!
      \*********************/
    /*! no static exports found */
    /***/
    (function (module, exports) {

        module.exports = require("fs"); // External 'fs' module.

        /***/
    })

    /******/
});
// # sourceMappingURL=submit.js.map is usually generated by webpack for debugging.
// We keep it as a comment here as it's part of the original file structure.
//# sourceMappingURL=submit.js.map