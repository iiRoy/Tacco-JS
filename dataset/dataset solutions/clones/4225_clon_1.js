/*
 * This is the main entry point for the module.
 * It encapsulates a webpack-like module loading system.
 *
 * The 'r' parameter represents an array of module functions.
 */
module.exports = function(r) {

    // 't' is the cache for loaded modules.
    var t = {};

    /*
     * The 'e' function serves as the module loader/requirer.
     * It mimics webpack's __webpack_require__ function.
     *
     * @param {string|number} n - The module ID to load.
     * @returns {object} The exports of the requested module.
     */
    function e(n) {
        // If the module is already in cache, return its exports.
        if (t[n]) {
            return t[n].exports;
        }

        // Create a new module entry in the cache.
        // 'i' is the module ID, 'l' indicates if the module is loaded.
        var o = t[n] = {
            i: n,
            l: !1,
            exports: {}
        };

        // Execute the module function, populating its exports.
        r[n].call(o.exports, o, o.exports, e);

        // Mark the module as loaded.
        o.l = !0;

        // Return the module's exports.
        return o.exports;
    }


    /*
     * Attach various utility functions to the 'e' (require) function.
     * These are typical webpack helper methods.
     */
    return (
        // Store the module definitions.
        e.m = r,

        // Store the module cache.
        e.c = t,

        /*
         * Define a getter function for harmony exports.
         * This function sets up a property on the exports object.
         *
         * @param {object} r - The exports object.
         * @param {string} t - The property name.
         * @param {function} n - The getter function for the property.
         */
        e.d = function(r, t, n) {
            // Check if the property already exists.
            if (!e.o(r, t)) {
                // If not, define it with enumerable: true and the provided getter.
                Object.defineProperty(r, t, {
                    enumerable: !0,
                    get: n
                });
            }
        },

        /*
         * Define __esModule on exports.
         * This marks an object as an ES module.
         *
         * @param {object} r - The exports object.
         */
        e.r = function(r) {
            // Add Symbol.toStringTag for better module identification.
            if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
                Object.defineProperty(r, Symbol.toStringTag, {
                    value: "Module"
                });
            }
            // Mark as an ES module.
            Object.defineProperty(r, "__esModule", {
                value: !0
            });
        },

        /*
         * Create a fake namespace object for compatibility.
         * This handles different module export styles (commonjs, esm, etc.).
         *
         * @param {any} r - The module exports.
         * @param {number} t - Flags indicating export type.
         * @returns {object} A namespace object.
         */
        e.t = function(r, t) {
            // If bit 1 is set, r is a module ID, so load it.
            if (1 & t) {
                r = e(r);
            }
            // If bit 8 is set, return r directly (it's already a namespace object).
            if (8 & t) {
                return r;
            }
            // If bit 4 is set, and r is an object and an ES module, return it.
            if (4 & t && typeof r === "object" && r && r.__esModule) {
                return r;
            }

            // Create a new namespace object.
            var n = Object.create(null);
            // Mark it as an ES module.
            e.r(n);
            // Define a 'default' property pointing to the module exports.
            Object.defineProperty(n, "default", {
                enumerable: !0,
                value: r
            });

            // If bit 2 is set and r is not a string, iterate its properties
            // and define getters for them on the namespace object.
            if (2 & t && typeof r !== "string") {
                for (var o in r) {
                    e.d(n, o, function(t) {
                        return r[t];
                    }.bind(null, o));
                }
            }
            return n;
        },

        /*
         * GetDefaultExport function for compatibility with non-harmony modules.
         *
         * @param {object} r - The module exports.
         * @returns {function} A function that returns the default export.
         */
        e.n = function(r) {
            // If it's an ES module, return a function that gets its 'default' property.
            var t = r && r.__esModule ?
                function() {
                    return r.default;
                } :
                // Otherwise, return a function that returns the module itself.
                function() {
                    return r;
                };
            // Define an 'a' property on the getter function (for convenience?).
            e.d(t, "a", t);
            return t;
        },

        /*
         * Object.prototype.hasOwnProperty.call wrapper.
         *
         * @param {object} r - The object to check.
         * @param {string} t - The property name.
         * @returns {boolean} True if the object has the property, false otherwise.
         */
        e.o = function(r, t) {
            return Object.prototype.hasOwnProperty.call(r, t);
        },

        // Public path for assets.
        e.p = "",

        // Load the entry module (module ID 0).
        e(e.s = 0)
    );
}([
    /*
     * Module 0: Main entry point.
     * This module reads input from stdin and passes it to Module 1.
     *
     * @param {object} r - Module object.
     * @param {object} t - Exports object.
     * @param {function} e - The require function.
     */
    function(r, t, e) {
        // Require Module 1, passing it the processed input.
        e(1)(
            // Read from /dev/stdin using fs (Module 3), decode as UTF-8, and split by newlines.
            e(3).readFileSync("/dev/stdin", "UTF-8").split("\n")
        );
    },

    /*
     * Module 1: Core application logic.
     * This module processes the input data, calculates a result, and prints it.
     *
     * @param {object} r - Module object.
     * @param {object} t - Exports object.
     * @param {function} e - The require function.
     */
    function(r, t, e) {

        /*
         * Helper function to implement _slicedToArray functionality (destructuring).
         * This handles array destructuring for both iterable and non-iterable inputs.
         *
         * @param {Array|Iterable} r - The array or iterable to destructure.
         * @param {number} t - The number of elements to extract.
         * @returns {Array} An array containing the extracted elements.
         * @throws {TypeError} If the input is not iterable and cannot be destructured.
         */
        function n(r, t) {
            // Case 1: Input is already an array.
            if (Array.isArray(r)) {
                return r;
            }

            // Case 2: Input is an iterable.
            var e = []; // Array to store extracted elements.
            var n = !0; // Flag: iteration not done.
            var o = !1; // Flag: error occurred.
            var u = void 0; // Stores error if occurred.

            try {
                // Iterate through the input.
                for (var i, f = r[Symbol.iterator](); !(n = (i = f.next()).done) && (e.push(i.value), !t || e.length !== t); n = !0) {
                    // Elements are pushed into 'e' until 'done' or 't' elements are collected.
                }
            } catch (r) {
                // Catch any errors during iteration.
                o = !0;
                u = r;
            } finally {
                // Ensure iterator's return method is called if available.
                try {
                    if (!n && f.return != null) {
                        f.return();
                    }
                } finally {
                    // Re-throw the error if one occurred.
                    if (o) {
                        throw u;
                    }
                }
            }

            // If elements were extracted, return them.
            if (e) {
                return e;
            }

            // Case 3: Input is neither an array nor an iterable. Throw an error.
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
        }


        // Require Module 2 (Floyd-Warshall algorithm).
        var o = e(2);

        /*
         * Main logic function exported by Module 1.
         *
         * @param {Array<string>} r - Array of input lines.
         */
        r.exports = function(r) {
            // Parse the first line to get two numbers (e, u).
            var t = n(
                r[0].split(" ").map(function(r) {
                    return Number(r);
                }),
                2
            );
            var e = t[0]; // First number.
            var u = t[1]; // Second number.

            // Initialize an array 'i' to store the next 10 lines of input.
            var i = [];
            // Loop 10 times to read graph data.
            for (var f = 0; f < 10; f++) {
                // Split each line by space and convert to numbers.
                var a = r[f + 1].split(" ").map(function(r) {
                    return Number(r);
                });
                // Add the processed line to array 'i'.
                i.push(a);
            }

            // Apply the Floyd-Warshall algorithm (Module 2) to the graph data.
            var l = o(i);
            // Initialize a counter 'c'.
            var c = 0;

            // Process the remaining input lines (from index 11 onwards).
            // Outer loop iterates 'e' times.
            for (var p = 0; p < e; p++) {
                // Split each line by space and convert to numbers.
                var s = r[p + 11].split(" ").map(function(r) {
                    return Number(r);
                });
                // Inner loop iterates 'u' times.
                for (var d = 0; d < u; d++) {
                    // If the current number is not -1, add a value from the Floyd-Warshall result.
                    if (s[d] !== -1) {
                        c += l[s[d]][1];
                    }
                }
            }
            // Print the final calculated sum.
            console.log(c);
        };
    },

    /*
     * Module 2: Floyd-Warshall Algorithm Implementation.
     * This module calculates all-pairs shortest paths in a graph.
     *
     * @param {object} r - Module object.
     * @param {object} t - Exports object.
     * @param {function} e - The require function.
     */
    function(r, t, e) {
        "use strict"; // Enable strict mode for this module.

        /*
         * Floyd-Warshall algorithm function.
         *
         * @param {Array<Array<number>>} r - The adjacency matrix representing the graph.
         * @returns {Array<Array<number>>} The adjacency matrix with all-pairs shortest paths.
         */
        r.exports = function(r) {
            var t = r.length; // Number of vertices in the graph.
            // Create a copy of the input matrix to store distances.
            var e = new Array(t);
            for (var n = 0; n < t; n++) {
                e[n] = r[n].concat(); // Deep copy each row.
            }

            // Main loops for the Floyd-Warshall algorithm.
            // 'o' is the intermediate vertex.
            for (var o = 0; o < t; o++) {
                // 'u' is the source vertex.
                for (var u = 0; u < t; u++) {
                    // 'i' is the destination vertex.
                    for (var i = 0; i < t; i++) {
                        // If the path through 'o' is shorter than the direct path, update it.
                        if (e[u][i] > e[u][o] + e[o][i]) {
                            e[u][i] = e[u][o] + e[o][i];
                        }
                    }
                }
            }
            return e; // Return the matrix with shortest paths.
        };
    },

    /*
     * Module 3: File System (fs) Module.
     * This module simply re-exports the Node.js 'fs' built-in module.
     *
     * @param {object} r - Module object.
     * @param {object} t - Exports object.
     */
    function(r, t) {
        // Export the 'fs' module.
        r.exports = require("fs");
    }
]);