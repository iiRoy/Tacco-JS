module.exports = function (r) {
    /*
     * This is the main module loader function, often seen in bundled JavaScript files.
     * It mimics a CommonJS-like environment for managing modules.
     */

    // 'e' serves as the module cache. Loaded modules are stored here.
    var e = {};

    /**
     * The core module loading and execution function.
     * @param {number} n - The ID of the module to load.
     * @returns {object} The exports object of the requested module.
     */
    function t(n) {
        // If the module is already in the cache, return its exports immediately.
        if (e[n]) {
            return e[n].exports;
        }

        // If not in cache, create a new module entry.
        // 'o' is the module object itself, containing metadata and its exports.
        var o = e[n] = {
            i: n,        // The module's unique ID.
            l: !1,       // A flag indicating if the module has been loaded.
            exports: {}  // The object that will hold the module's exports.
        };

        // Execute the module function.
        // The module function (from 'r[n]') receives 'module', 'exports', and 'require' ('t') as arguments.
        r[n].call(
            o.exports,   // `this` context for the module function.
            o,           // The module object itself.
            o.exports,   // The exports object.
            t            // The local 'require' function (this 't').
        );

        // After execution, mark the module as loaded.
        o.l = !0;

        // Return the module's exports.
        return o.exports;
    }


    /*
     *  Below are various utility functions attached to the 't' (require) function.
     *  These are common patterns in webpack-generated bundles for module management.
     */


    // 't.m' stores the module definitions array (the 'r' parameter passed to the wrapper).
    t.m = r;

    // 't.c' stores a reference to the module cache 'e'.
    t.c = e;

    /**
     * 't.d' defines a getter function for module exports.
     * It ensures properties are enumerable and uses Object.defineProperty.
     * @param {object} r - The object to define the property on.
     * @param {string} e - The name of the property.
     * @param {function} n - The getter function for the property.
     */
    t.d = function (r, e, n) {
        // Check if the property already exists on the object.
        if (!t.o(r, e)) {
            Object.defineProperty(
                r,
                e,
                {
                    enumerable: !0, // Make the property enumerable.
                    get: n         // Assign the getter function.
                }
            );
        }
    };

    /**
     * 't.r' sets up ES module compatibility flags (__esModule and Symbol.toStringTag).
     * @param {object} r - The module exports object.
     */
    t.r = function (r) {
        // Set Symbol.toStringTag for better module identification in console.
        if (
            "undefined" != typeof Symbol &&
            Symbol.toStringTag
        ) {
            Object.defineProperty(
                r,
                Symbol.toStringTag,
                {
                    value: "Module"
                }
            );
        }
        // Mark the module as an ES module.
        Object.defineProperty(
            r,
            "__esModule",
            {
                value: !0
            }
        );
    };

    /**
     * 't.t' creates a namespace object for module exports, handling various export types.
     * @param {any} r - The module or its exports.
     * @param {number} e - A bitmask indicating the export type.
     * @returns {object} The normalized exports object.
     */
    t.t = function (r, e) {
        // If bit 1 is set, 'r' is a module ID, load it.
        if (1 & e && (r = t(r)), 8 & e) {
            return r; // If bit 8 is set, return 'r' directly.
        }
        // If bit 4 is set and 'r' is an object and an ES module, return it directly.
        if (4 & e && "object" == typeof r && r && r.__esModule) {
            return r;
        }

        // Create a new namespace object.
        var n = Object.create(null);
        t.r(n); // Apply ES module compatibility flags.
        Object.defineProperty(
            n,
            "default",
            {
                enumerable: !0, // Make 'default' property enumerable.
                value: r        // Assign 'r' as the default export.
            }
        );
        // If bit 2 is set and 'r' is not a string, copy all properties from 'r' to 'n'.
        if (2 & e && "string" != typeof r) {
            for (var o in r) {
                t.d(
                    n,
                    o,
                    function (e) {
                        return r[e];
                    }.bind(null, o) // Bind 'o' to the getter for correct scope.
                );
            }
        }
        return n; // Return the created namespace object.
    };

    /**
     * 't.n' creates a getter for a module's default export.
     * @param {object} r - The module exports object.
     * @returns {function} A function that returns the default export.
     */
    t.n = function (r) {
        // If 'r' is an ES module, return its 'default' export, otherwise return 'r' itself.
        var e = r && r.__esModule ?
            function () {
                return r.default;
            } :
            function () {
                return r;
            };
        t.d(e, "a", e); // Define a getter 'a' for convenience.
        return e;
    };

    /**
     * 't.o' checks if an object has a specified property using Object.prototype.hasOwnProperty.
     * @param {object} r - The object to check.
     * @param {string} e - The property name.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    t.o = function (r, e) {
        return Object.prototype.hasOwnProperty.call(r, e);
    };

    // 't.p' represents the public path for assets (often an empty string in bundles).
    t.p = "";

    // Load the entry module (module with ID 0) and return its exports.
    return t(t.s = 0);

}(
    [ // This array contains all the module definitions. Each function is a module.

        /*
         * Module 0: This is the application's entry point.
         * It reads input from standard input and passes it to Module 1.
         */
        function (r, e, t) {
            // Call module 1, passing it the content of /dev/stdin, split by newlines.
            t(1)(
                t(2).readFileSync( // Read file content using module 2 (fs).
                    "/dev/stdin",  // Path to standard input.
                    "UTF-8"        // Encoding for the input.
                ).split("\n")      // Split the input into an array of lines.
            );
        },

        /*
         * Module 1: Contains the main problem-solving logic.
         * It processes graph data to find a specific cycle.
         */
        function (r, e, t) {
            "use strict"; // Enforce strict mode for cleaner code.

            /**
             * Helper function 'n' for safe array destructuring.
             * It attempts to convert an iterable into an array or throws an error.
             * @param {Iterable} r - The iterable object to convert.
             * @param {number} e - The desired number of elements to extract.
             * @returns {Array} An array containing the extracted elements.
             * @throws {TypeError} If the input is not a valid iterable instance.
             */
            function n(r, e) {
                // First attempt: Check if 'r' is already an array.
                return function (r) {
                    if (Array.isArray(r)) {
                        return r; // If it's an array, return it directly.
                    }
                }(r) || // Chain to the next function if the first one returns undefined.

                // Second attempt: Try to iterate over 'r' and extract elements up to 'e'.
                function (r, e) {
                    var t = [], // Array to store extracted elements.
                        n = !0, // Flag to track if iterator is done.
                        o = !1, // Flag to track if an error occurred during iteration.
                        u = void 0; // Variable to store error if any.
                    try {
                        // Iterate through the iterable 'r'.
                        for (
                            var l, // Current value from iterator.
                                i = r[Symbol.iterator](); // Get the iterator.
                            !(n = (l = i.next()).done) && // Loop while not done.
                            (t.push(l.value), !e || t.length !== e); // Push value and check length limit.
                            n = !0 // Reset done flag for next iteration in case of a break.
                        ) {
                            // Empty loop body, all work done in the condition.
                        }
                    } catch (r) {
                        o = !0; // Mark that an error occurred.
                        u = r; // Store the error.
                    } finally {
                        try {
                            // Ensure the iterator's return method is called if it exists and wasn't done.
                            if (!n && null != i.return) {
                                i.return();
                            }
                        } finally {
                            if (o) {
                                throw u; // Re-throw the stored error.
                            }
                        }
                    }
                    return t; // Return the array of extracted elements.
                }(r, e) || // Chain to the final fallback if iteration fails.

                // Final fallback: If no valid iterable was found, throw a TypeError.
                function () {
                    throw new TypeError(
                        "Invalid attempt to destructure non-iterable instance"
                    );
                }(); // Self-executing function to immediately throw the error.
            }

            // The main logic exported by this module.
            r.exports = function (r) {
                // Parse the first line of input to get the number of nodes (t) and edges (o).
                var e = n(
                    r[0].split(" ").map(
                        function (r) {
                            return Number(r); // Convert string numbers to actual numbers.
                        }
                    ),
                    2 // Expecting exactly 2 elements.
                );
                var t = e[0]; // 't' represents the number of nodes.
                var o = e[1]; // 'o' represents the number of edges.

                // Initialize an adjacency list 'u' for the graph.
                // 'u' will be an array of arrays, where u[i] contains neighbors of node i.
                var u = new Array(t);
                for (var l = 0; l < t; l++) {
                    u[l] = []; // Initialize each node's adjacency list as an empty array.
                }

                // Populate the adjacency list with edges from the input.
                for (var i = 0; i < o; i++) {
                    var f = n(
                        r[i + 1].split(" ").map(
                            function (r) {
                                return Number(r) - 1; // Convert to 0-indexed node numbers.
                            }
                        ),
                        2 // Expecting exactly 2 elements (source and destination).
                    );
                    var a = f[0]; // 'a' is the source node.
                    var c = f[1]; // 'c' is the destination node.
                    u[a].push(c); // Add an edge from 'a' to 'c'.
                }

                // Perform a modified graph traversal (DFS-like) for each possible starting node.
                // The goal is to find the shortest cycle from any node back to itself.
                for (var p = 0; p < t; p++) {
                    // 's' is a boolean array tracking visited nodes in the current path.
                    var s = new Array(t).fill(!1);
                    s[p] = 1; // Mark the starting node 'p' as visited in its own path.

                    // 'v' acts as a stack for DFS. Each element is an object:
                    // { v: current_vertex, fl: visited_flags_for_path, k: path_length }
                    var v = [{
                        v: p,  // Current vertex.
                        fl: s, // Visited flags for the path leading to 'v'.
                        k: 1   // Path length from the initial starting node 'p'.
                    }];

                    // Continue traversal as long as there are nodes in the stack.
                    while (v.length > 0) {
                        var y = v.pop(); // Get the last element (DFS behavior).
                        var d = !0, // Flag for iterator done status.
                            b = !1, // Flag for error status.
                            m = void 0; // Variable to store error object.
                        try {
                            // Iterate through neighbors of the current vertex 'y.v'.
                            for (
                                var g,
                                    h = u[y.v][Symbol.iterator](); // Get iterator for neighbors.
                                !(d = (g = h.next()).done); // Loop while iterator is not done.
                                d = !0
                            ) {
                                var x = g.value; // 'x' is a neighbor of 'y.v'.

                                // If the neighbor 'x' is the original starting node 'p', a cycle is found.
                                if (x == p) {
                                    console.log(y.k); // Output the length of the cycle.
                                    // Output all nodes (1-indexed) that are part of this cycle.
                                    for (var S = 0; S < t; S++) {
                                        if (1 == y.fl[S]) {
                                            console.log(S + 1);
                                        }
                                    }
                                    return; // Exit the function as the shortest cycle is found.
                                }

                                // If the neighbor 'x' has not been visited in the current path.
                                if (1 != y.fl[x]) {
                                    var j = y.fl.concat(); // Create a new array for visited flags (path copy).
                                    j[x] = 1; // Mark neighbor 'x' as visited in this new path.
                                    v.push({
                                        v: x,        // Add the neighbor to the stack.
                                        fl: j,       // Pass the updated visited flags.
                                        k: y.k + 1   // Increment path length.
                                    });
                                }
                            }
                        } catch (r) {
                            b = !0; // Mark error occurred.
                            m = r;  // Store the error.
                        } finally {
                            try {
                                // Ensure the iterator's return method is called if it exists and wasn't done.
                                if (!d && null == h.return) {
                                    // Do nothing if return is null/undefined.
                                } else if (!d) {
                                    h.return();
                                }
                            } finally {
                                if (b) {
                                    throw m; // Re-throw the stored error.
                                }
                            }
                        }
                    }
                }

                // If no cycle was found after checking all paths from all possible starting nodes.
                console.log(-1); // Output -1 to indicate no cycle found.
            };
        },

        /*
         * Module 2: A simple module that exports Node.js's 'fs' (file system) module.
         */
        function (r, e) {
            r.exports = require("fs"); // Make the 'fs' module available.
        }
    ]
);