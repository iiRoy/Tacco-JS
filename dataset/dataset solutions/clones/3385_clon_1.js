/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered extensively
 * to create a visually distinct but functionally identical version.
 */

// Exporting the main module function
module.exports = function (t) {
    // Cache for loaded modules
    var e = {};

    // The require function (webpack's __webpack_require__)
    function n(r) {
        // If module is already in cache, return its exports
        if (e[r]) {
            return e[r].exports;
        }

        // Create a new module (and put it into the cache)
        var i = e[r] = {
            i: r,
            l: !1, // loaded flag
            exports: {}
        };

        // Execute the module function
        // 't[r]' is the module function itself
        // 'i.exports' is the module.exports object
        // 'n' is the local require function
        t[r].call(i.exports, i, i.exports, n);

        // Mark the module as loaded
        i.l = !0;

        // Return the exports of the module
        return i.exports;
    }

    // Expose the modules object (__webpack_modules__)
    n.m = t;

    // Expose the module cache (__webpack_cache__)
    n.c = e;

    // Define property getter function for harmony exports
    n.d = function (t, e, r) {
        // Check if property is not already defined
        if (!n.o(t, e)) {
            // Define the property with a getter
            Object.defineProperty(t, e, {
                enumerable: !0,
                get: r
            });
        }
    };

    // Define __esModule on exports
    n.r = function (t) {
        // For Symbol.toStringTag
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(t, Symbol.toStringTag, {
                value: "Module"
            });
        }
        // Mark as an ES module
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
    };

    // Compatibility getter for non-ES modules
    n.t = function (t, e) {
        // 1 = CommonJS, 2 = require
        if (1 & e) {
            t = n(t);
        }
        // 8 = namespace object
        if (8 & e) {
            return t;
        }
        // 4 = exports from non-ES module
        if (4 & e && typeof t === "object" && t && t.__esModule) {
            return t;
        }

        // Create a fake namespace object
        var r = Object.create(null);

        // Define __esModule on it
        n.r(r);

        // Add default export
        Object.defineProperty(r, "default", {
            enumerable: !0,
            value: t
        });

        // 2 = if not a string, add all properties from original object
        if (2 & e && typeof t !== "string") {
            for (var i in t) {
                n.d(r, i, function (e) {
                    return t[e];
                }.bind(null, i));
            }
        }
        return r;
    };

    // Create a getter for exports object
    n.n = function (t) {
        var e = t && t.__esModule ?
            function () {
                return t.default;
            } :
            function () {
                return t;
            };

        // Define "a" property on the getter function itself
        n.d(e, "a", e);

        return e;
    };

    // Object.prototype.hasOwnProperty.call
    n.o = function (t, e) {
        return Object.prototype.hasOwnProperty.call(t, e);
    };

    // Public path
    n.p = "";

    // Load entry module and return exports
    return n(n.s = 0);
}(
    // Array of modules
    [
        // Module 0: Main application logic
        function (t, e, n) {
            "use strict"; // Enforce strict mode

            // Require module 1 (fs)
            var r = n(1);

            // Create a new instance of the custom input reader (module 2)
            // It reads from /dev/stdin, trims, and splits by whitespace
            var i = new(n(2))(r.readFileSync("/dev/stdin", "utf8").trim().split(/\s+/g));

            // Call module 4 with the input reader instance
            n(4)(i);
        },

        // Module 1: Node.js 'fs' module
        function (t, e) {
            t.exports = require("fs");
        },

        // Module 2: Custom input reader class
        function (t, e, n) {
            "use strict";

            // Require module 3 (custom queue/deque)
            var r = n(3);

            // Export the InputReader class
            t.exports = class {
                constructor(t) {
                    // Initialize with a new queue based on the provided input array
                    this.inp = new r(t);
                }

                // Read and parse an integer (convenience method)
                inr() {
                    return this.inp.deq();
                }

                // Read and parse an integer
                in() {
                    return parseInt(this.inp.deq(), 10);
                }

                // Add an item to the input (enqueue)
                add(t) {
                    this.inp.enq(t);
                }
            };
        },

        // Module 3: Custom Queue/Deque implementation
        function (t, e, n) {
            "use strict";

            // Export the Queue class
            t.exports = class {
                constructor() {
                    // Default to an empty array if no initial items are provided
                    var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
                    this.size = t.length; // Current size of the queue
                    this.items = t; // Array holding the queue elements
                    this.ind = 0; // Index for dequeuing
                }

                // Enqueue an item
                enq(t) {
                    this.size += 1;
                    this.items.push(t);
                }

                // Dequeue an item
                deq() {
                    var t = this.items[this.ind]; // Get the item at the current index
                    this.size -= 1; // Decrement size
                    this.ind += 1; // Increment index for next dequeue
                    return t; // Return the dequeued item
                }
            };
        },

        // Module 4: Core logic based on input
        function (t, e, n) {
            "use strict";

            // Export a function that takes the input reader
            t.exports = function (t) {
                // Read the first integer, which determines the loop count
                for (var e = t.in(), n = 0; n < e; n++) {
                    // Read subsequent integers and check if any are odd
                    if (t.in() % 2 == 1) {
                        // If an odd number is found, print "first" and exit
                        return void console.log("first");
                    }
                }
                // If no odd numbers are found after the loop, print "second"
                console.log("second");
            };
        }
    ]
);