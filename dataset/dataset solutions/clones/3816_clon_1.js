// This is a Type I clone of the original JavaScript code.
// Only whitespace and comments have been altered.
// All identifiers, variable names, function names, operators, and expressions
// remain exactly as they were in the original source.
// This file demonstrates extensive modifications to visual presentation
// without any change to the underlying logic or structure.

// The main module export function, typical of webpack bundles.
module.exports = function (t) {
    // A cache for loaded modules.
    var e = {};

    // The module loader function 'r'.
    function r(n) {
        // If the module is already in cache, return its exports.
        if (e[n]) {
            return e[n].exports;
        }

        // Create a new module entry in the cache.
        var i = e[n] = {
            i: n, // Module ID
            l: !1, // Loaded flag
            exports: {} // Exports object
        };

        // Execute the module function.
        t[n].call(i.exports, i, i.exports, r);

        // Mark the module as loaded.
        i.l = !0;

        // Return the module's exports.
        return i.exports;
    }

    // Attach modules to the loader.
    r.m = t;

    // Attach module cache to the loader.
    r.c = e;

    // Define property 'd' on exports.
    r.d = function (t, e, n) {
        // Check if property exists.
        if (!r.o(t, e)) {
            // If not, define it.
            Object.defineProperty(t, e, {
                enumerable: !0,
                get: n
            });
        }
    };

    // Define property 'r' for __esModule.
    r.r = function (t) {
        // Set Symbol.toStringTag for modules.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(t, Symbol.toStringTag, {
                value: "Module"
            });
        }
        // Set __esModule to true.
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
    };

    // Define property 't' for module getters.
    r.t = function (t, e) {
        // Handle direct module export.
        if (1 & e) {
            t = r(t);
        }

        // Handle namespace object.
        if (8 & e) {
            return t;
        }

        // Handle compatibility for default exports.
        if (4 & e && typeof t === "object" && t && t.__esModule) {
            return t;
        }

        // Create a new namespace object.
        var n = Object.create(null);

        // Mark as __esModule.
        r.r(n);

        // Set default export.
        Object.defineProperty(n, "default", {
            enumerable: !0,
            value: t
        });

        // Copy all properties if not a string.
        if (2 & e && typeof t !== "string") {
            for (var i in t) {
                r.d(n, i, function (e) {
                    return t[e];
                }.bind(null, i));
            }
        }

        return n;
    };

    // Define property 'n' for compatibility getters.
    r.n = function (t) {
        // Create a getter for default or the module itself.
        var e = t && t.__esModule ?
            function () {
                return t.default;
            } :
            function () {
                return t;
            };

        // Attach a property 'a' to the getter.
        r.d(e, "a", e);

        return e;
    };

    // Define property 'o' for hasOwnProperty check.
    r.o = function (t, e) {
        return Object.prototype.hasOwnProperty.call(t, e);
    };

    // Public path (empty in this case).
    r.p = "";

    // Load the entry module (module 0).
    return r(r.s = 0);

}(
    // Array of modules for the bundle.
    [
        // Module 0: Entry point.
        function (t, e, r) {
            "use strict";
            // Require module 1 (fs).
            var n = r(1);
            // Require module 2 and pass it the stdin content.
            r(2)(n.readFileSync("/dev/stdin", "utf8"));
        },

        // Module 1: Node.js 'fs' module.
        function (t, e) {
            t.exports = require("fs");
        },

        // Module 2: Main logic handler.
        function (t, e, r) {
            "use strict";
            // Require module 3 (InputReader).
            var n = r(3);
            // Require module 5 (solution logic).
            var i = r(5);

            // Export a function that processes input.
            t.exports = function (t) {
                // Create a new InputReader instance.
                var e = new n(t);
                // Pass the InputReader to the solution logic.
                i(e);
            };
        },

        // Module 3: InputReader class.
        function (t, e, r) {
            "use strict";
            // Require module 4 (Queue).
            var n = r(4);

            // Export the InputReader class.
            t.exports = class {
                // Constructor takes raw input string.
                constructor(t) {
                    // Trim and split input string by whitespace into a queue.
                    var e = t.trim().split(/\s+/g);
                    this.inp = new n(e);
                }

                // Read and return a raw string token.
                inr() {
                    return this.inp.deq();
                }

                // Read and return an integer token.
                in() {
                    return parseInt(this.inp.deq(), 10);
                }

                // Clear the input queue.
                fin() {
                    this.inp.clear();
                }
            };
        },

        // Module 4: Queue class.
        function (t, e, r) {
            "use strict";
            // Export the Queue class.
            t.exports = class {
                // Constructor takes an optional initial array.
                constructor() {
                    var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
                    this.size = t.length;
                    this.items = t;
                    this.ind = 0; // Current index for dequeuing.
                }

                // Enqueue an item.
                enq(t) {
                    this.size += 1;
                    this.items.push(t);
                }

                // Dequeue an item.
                deq() {
                    var t = this.items[this.ind];
                    this.size -= 1;
                    this.ind += 1;
                    return t;
                }

                // Clear the queue.
                clear() {
                    this.items = [];
                    this.size = 0;
                    this.ind = 0;
                }
            };
        },

        // Module 5: Solution logic.
        function (t, e, r) {
            "use strict";
            // Export the main solution function.
            t.exports = function (t) {
                // Read the number of elements 'e'.
                for (var e = t.in(),
                        // Create an array to store input numbers.
                        r = new Array(e),
                        n = 0; // Loop counter.
                    n < e;
                    n++
                ) {
                    r[n] = t.in(); // Populate the array with input integers.
                }

                // Initialize a frequency/count array 'i'.
                // It's sized e+1 and filled with zeros.
                for (
                    var i = new Array(e + 1).fill(0),
                        o = 1; // Loop counter for processing 'r'.
                    o <= e;
                    o++
                ) {
                    // For each number in 'r', update its count in 'i'.
                    // This creates a running count of occurrences for each number.
                    i[r[o - 1]] = i[r[o - 1] - 1] + 1;
                }

                // Find the maximum frequency 's'.
                for (
                    var s = 0, // Maximum frequency found so far.
                        u = 0; // Loop counter for 'i'.
                    u <= e;
                    u++
                ) {
                    s = Math.max(s, i[u]); // Update maximum frequency.
                }

                // The result is the total number of elements minus the maximum frequency.
                console.log(e - s);
            };
        }
    ]
);
// End of Type I clone.