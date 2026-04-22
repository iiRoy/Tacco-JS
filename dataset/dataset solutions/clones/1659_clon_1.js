/*! path: /home/ts3min/work/tspro/src/contest/atcoder/msol2020/e.ts */
// This is a self-executing anonymous function (IIFE)
// It serves as the wrapper for the entire webpack bundle.
!function (t) {

    // 'e' acts as a module cache.
    var e = {};

    // The 'n' function is webpack's custom 'require' implementation.
    function n(r) {
        // If the module is already cached, return its exports immediately.
        if (e[r])
            return e[r].exports;

        // If not cached, create a new module object.
        var o = e[r] = {
            i: r,           // Module ID
            l: !1,          // Loaded flag, initially false
            exports: {}     // The exports object for this module
        };

        // Execute the module function. 't[r]' is the module definition.
        // It receives 'module', 'module.exports', and the 'require' function ('n').
        t[r].call(o.exports, o, o.exports, n);

        // After execution, mark the module as loaded.
        o.l = !0;

        // Return the module's exports.
        return o.exports
    }

    // Store the module definitions array 't' in 'n.m'.
    n.m = t;

    // Store the module cache 'e' in 'n.c'.
    n.c = e;

    // Helper function 'n.d' for defining enumerable getters on exports.
    n.d = function (t, e, r) {
        // Only define if the property doesn't already exist.
        if (!n.o(t, e))
            Object.defineProperty(t, e, {
                enumerable: !0,
                get: r
            })
    };

    // Helper function 'n.r' to mark a module as an ECMAScript Module.
    n.r = function (t) {
        // If Symbol and Symbol.toStringTag are available, set the toStringTag.
        if ("undefined" != typeof Symbol && Symbol.toStringTag)
            Object.defineProperty(t, Symbol.toStringTag, {
                value: "Module"
            });
        // Set the __esModule flag to true.
        Object.defineProperty(t, "__esModule", {
            value: !0
        })
    };

    // Helper function 'n.t' for handling interop between CommonJS and ES modules.
    n.t = function (t, e) {
        // If bit 1 is set, require the module directly.
        if (1 & e)
            t = n(t);
        // If bit 8 is set, return the module as is.
        if (8 & e)
            return t;
        // If bit 4 is set and it's an object-like ES module, return it directly.
        if (4 & e && "object" == typeof t && t && t.__esModule)
            return t;

        // Otherwise, create a new object to represent the module.
        var r = Object.create(null);
        // Mark it as an ES module.
        n.r(r);
        // Define a 'default' export pointing to the module.
        Object.defineProperty(r, "default", {
            enumerable: !0,
            value: t
        });
        // If bit 2 is set and it's not a string, copy all properties from the original module.
        if (2 & e && "string" != typeof t)
            for (var o in t)
                n.d(r, o, function (e) {
                    return t[e]
                }.bind(null, o));
        return r
    };

    // Helper function 'n.n' to create a getter for the default export.
    n.n = function (t) {
        var e = t && t.__esModule ?
            function () {
                return t.default
            } :
            function () {
                return t
            };
        n.d(e, "a", e); // Define a 'a' property which is the getter itself.
        return e
    };

    // Helper function 'n.o' to check if an object has a property.
    n.o = function (t, e) {
        return Object.prototype.hasOwnProperty.call(t, e)
    };

    // Set the public path for loading assets (empty string in this case).
    n.p = "";

    // Start the application by requiring the entry module (module with index 0).
    n(n.s = 0)

}([
    /* Module 0: Main Application Logic */
    function (t, e, n) {
        "use strict";
        (function (t) { // IIFE for 'this' context management.
            // Webpack's __importDefault helper for ES module compatibility.
            var r = this && this.__importDefault || function (t) {
                return t && t.__esModule ? t : {
                    default: t
                }
            };

            // Mark this module as an ES module and initialize 'main' export.
            Object.defineProperty(e, "__esModule", {
                value: !0
            });
            e.main = void 0;

            // Import dependencies: 'fs' (as 'o') and input utilities (as 'i').
            const o = r(n(2)); // 'fs' module
            const i = n(3);    // Input parsing utilities

            // Declare 'u', which will be used as an enum-like object for city states.
            var u;

            // Recursive function 'c' to explore all combinations of city assignments.
            // t: Current city index being processed (0 to N-1).
            // e: Count of cities assigned 'X' or 'Y' (covered by a line).
            // n: Context object containing N, C, ans, and cand.
            function c(t, e, n) {
                // Destructure parameters from the context object for easier access.
                const {
                    cand: r, // 'cand' array: stores assignment (X, Y, N) for each city.
                    N: o,    // Total number of cities.
                    C: i,    // Array of city objects (x, y, p).
                    ans: a   // 'ans' array: stores minimum cost for 'e' covered cities.
                } = n;

                // Base case: If we have processed all 'o' cities.
                if (t !== o) {
                    // Recursive Step: Try assigning 'N' (Not covered) to the current city 't'.
                    r[t] = u.N;
                    c(t + 1, e, n); // Recurse for the next city, covered count 'e' remains same.

                    // Recursive Step: Try assigning 'X' (Covered by vertical line) to city 't'.
                    r[t] = u.X;
                    c(t + 1, e + 1, n); // Recurse, increment 'e' (covered count).

                    // Recursive Step: Try assigning 'Y' (Covered by horizontal line) to city 't'.
                    r[t] = u.Y;
                    c(t + 1, e + 1, n); // Recurse, increment 'e' (covered count).
                } else {
                    // All cities have been assigned a type (X, Y, or N).
                    // Calculate the total cost for this specific configuration.
                    const t = function ({N: t, C: e, cand: n}) {
                        let r = 0; // Initialize total cost for this configuration.

                        // Iterate through each city to determine its minimum cost.
                        for (let o = 0; o < t; o++) {
                            // If city 'o' is already covered by a line (X or Y), it incurs no direct cost.
                            if (n[o] != u.N)
                                continue; // Skip to the next city.

                            // Initial cost for an uncovered city: min(|x|, |y|) * p.
                            let i = Math.min(Math.abs(e[o].x), Math.abs(e[o].y)) * e[o].p;

                            // Check if any other city's line (X or Y) can cover city 'o' more cheaply.
                            for (let r = 0; r < t; r++) {
                                // If city 'r' is covered by a horizontal line (Y), check if it covers city 'o'.
                                if (n[r] == u.Y) {
                                    i = Math.min(i, Math.abs(e[o].x - e[r].x) * e[o].p);
                                }
                                // If city 'r' is covered by a vertical line (X), check if it covers city 'o'.
                                else if (n[r] == u.X) {
                                    i = Math.min(i, Math.abs(e[o].y - e[r].y) * e[o].p);
                                }
                            }
                            r += i // Add the minimum cost for city 'o' to the running total.
                        }
                        return r // Return the total cost for this 'cand' array configuration.
                    }({N: o, C: i, cand: r}); // Pass N, C, and the current 'cand' array to the cost calculator.

                    // Update the minimum cost found so far for 'e' covered cities.
                    a[e] = Math.min(a[e], t);
                }
            }

            // Main function 'a' to handle input reading, problem solving, and output.
            function a(t) {
                // Get a function that reads the next integer from the input string 't'.
                const e = i.getNextInt(t);
                // Read the total number of cities, N.
                const n = e();
                // Initialize an array to store city data (x, y, p).
                const r = [];

                // Loop 'n' times to read data for each city.
                for (let t = 0; t < n; t++) {
                    // Read x, y, and p for the current city.
                    // Note: 't', 'n', 'o' here shadow outer variables. This is intentional.
                    const t = e(),
                        n = e(),
                        o = e();
                    // Add the city data as an object to the 'r' array.
                    r.push({
                        x: t,
                        y: n,
                        p: o
                    })
                }

                // Call the solver function and print the results.
                console.log(
                    function ({N: t, C: e}) {
                        // Initialize an array 'n' to store the minimum costs for each count of covered cities.
                        // The size is (N + 1), and values are initialized to MAX_SAFE_INTEGER.
                        const n = Array(t + 1).fill(Number.MAX_SAFE_INTEGER);

                        // Start the recursive process to find optimal configurations.
                        // 0: starting city index.
                        // 0: initial count of covered cities.
                        // {N: t, C: e, ans: n, cand: Array(t)}: context object for recursion.
                        c(0, 0, {
                            N: t,
                            C: e,
                            ans: n,
                            cand: Array(t) // Array to hold the assignment (X, Y, or N) for each city.
                        });
                        return n // Return the array of minimum costs.
                    }({N: n, C: r}) // Pass N and the cities array to the solver.
                    .join("\n") // Join the array elements with newline characters for output.
                )
            }

            // Define the enum-like object 'u' for city states: X, Y, N.
            // This IIFE pattern ensures 'u' is properly initialized.
            if (function (t) {
                t.X = "X"; // 'X' for vertical line coverage.
                t.Y = "Y"; // 'Y' for horizontal line coverage.
                t.N = "N"  // 'N' for no line coverage (city pays its own cost).
            }(u || (u = {})), e.main = a, n.c[n.s] === t) {
                // If this module is the main entry point (n.c[n.s] === t indicates this).
                // Read input from /dev/stdin and pass it to the 'a' function.
                a(o.default.readFileSync("/dev/stdin", "utf8"))
            }

        }).call(this, n(1)(t)) // Call the enclosing IIFE with the webpack polyfill for 't'.
    },

    /* Module 1: Webpack Polyfill for Module Context */
    function (t, e) {
        t.exports = function (t) {
            // Check if the webpackPolyfill has already been applied to 't'.
            if (!t.webpackPolyfill) {
                t.deprecate = function () {}; // Placeholder for deprecation warnings.
                t.paths = [];               // Initialize paths array.
                if (!t.children)            // Initialize children array if it doesn't exist.
                    t.children = [];

                // Define a getter for the 'loaded' property, returning 't.l'.
                Object.defineProperty(t, "loaded", {
                    enumerable: !0,
                    get: function () {
                        return t.l
                    }
                });

                // Define a getter for the 'id' property, returning 't.i'.
                Object.defineProperty(t, "id", {
                    enumerable: !0,
                    get: function () {
                        return t.i
                    }
                });

                t.webpackPolyfill = 1 // Mark the module as polyfilled.
            }
            return t // Return the (potentially modified) module object.
        }
    },

    /* Module 2: Node.js 'fs' (File System) Module */
    function (t, e) {
        // This module simply exports the Node.js built-in 'fs' module.
        t.exports = require("fs")
    },

    /* Module 3: Input Parsing Utility Functions */
    function (t, e, n) {
        "use strict";

        // Generator function 'r' to create an iterator for space-separated tokens.
        function* r(t) {
            const e = t.split(/\s+/); // Split the input string 't' by any whitespace.
            for (const t of e)         // Iterate over the resulting tokens.
                yield t                 // Yield each token.
        }

        // Mark this module as an ES module and define its exports.
        Object.defineProperty(e, "__esModule", {
            value: !0
        });
        e.getNextBigInt = e.getNextInt = e.getNext = e.getIteratorWithParser = e.getIterator = void 0;

        // Export the basic iterator function.
        e.getIterator = r;

        // Generator function to create an iterator that parses tokens using a provided parser function.
        e.getIteratorWithParser = function* (t, e) {
            const n = t.split(/\s+/); // Split the input string by whitespace.
            for (const t of n)         // Iterate over the tokens.
                yield e(t)              // Yield the result of parsing each token.
        };

        // Function to get a 'getNext' function that returns raw string tokens.
        e.getNext = function (t) {
            const e = r(t); // Get a basic token iterator.
            return () => e.next().value // Return a function that fetches the next token's value.
        };

        // Function to get a 'getNext' function that returns integer tokens.
        e.getNextInt = function (t) {
            const e = r(t); // Get a basic token iterator.
            return () => parseInt(e.next().value) // Return a function that parses the next token as an integer.
        };

        // Function to get a 'getNext' function that returns BigInt tokens.
        e.getNextBigInt = function (t) {
            const e = r(t); // Get a basic token iterator.
            return () => BigInt(e.next().value) // Return a function that parses the next token as a BigInt.
        }
    }
]);
// End of the webpack bundled code.
//# sourceMappingURL=submit.js.map