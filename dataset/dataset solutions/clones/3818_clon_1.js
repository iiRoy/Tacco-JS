module.exports = function(t) {
    // This 'e' object serves as a cache for loaded modules.
    var e = {};

    // The main module loading function.
    // 'n' is the module identifier.
    function r(n) {
        // If the module is already in the cache, return its exports immediately.
        if (e[n]) {
            return e[n].exports;
        }

        // If the module is not cached, create a new module entry.
        // 'i' is the module object, containing its ID, loaded status, and exports.
        var i = e[n] = {
            i: n,
            l: false, // 'l' indicates if the module has been fully loaded (executed).
            exports: {}
        };

        // Execute the module function from the 't' array.
        // The module function is called with:
        // - 'i.exports' as its 'this' context.
        // - 'i' (module object), 'i.exports' (exports object), and 'r' (the loader itself) as arguments.
        t[n].call(i.exports, i, i.exports, r);

        // After execution, mark the module as loaded.
        i.l = true;

        // Return the module's exports.
        return i.exports;
    }

    // Attach additional utility functions and properties to the loader 'r'.

    // 'r.m': Stores the array of module definitions (the 't' array passed to the IIFE).
    r.m = t;

    // 'r.c': Stores the module cache (the 'e' object).
    r.c = e;

    // 'r.d': Defines a getter property on an exports object.
    // 't': The exports object. 'e': The property name. 'n': The getter function.
    r.d = function(t, e, n) {
        // Only define the property if it doesn't already exist.
        if (!r.o(t, e)) {
            Object.defineProperty(t, e, {
                enumerable: true, // Make the property enumerable.
                get: n // Use the provided function as the getter.
            });
        }
    };

    // 'r.r': Marks an exports object as an ES module.
    // 't': The exports object to mark.
    r.r = function(t) {
        // Add Symbol.toStringTag for better module identification in debugging.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(t, Symbol.toStringTag, {
                value: "Module"
            });
        }
        // Set the __esModule flag to true.
        Object.defineProperty(t, "__esModule", {
            value: true
        });
    };

    // 'r.t': Creates a namespace object for module exports, handling various export types.
    // 't': The module or its exports. 'e': A bitmask indicating export characteristics.
    r.t = function(t, e) {
        // Bit 1: If set, 't' is a module ID; load it.
        if (1 & e && (t = r(t))) {
            return t;
        }

        // Bit 8: If set, just return 't' as is.
        if (8 & e) {
            return t;
        }

        // Bit 4: If set, and 't' is an object and already an ES module, return it.
        if (4 & e && typeof t === "object" && t && t.__esModule) {
            return t;
        }

        // Otherwise, create a new namespace object.
        var n = Object.create(null);

        // Mark the new object as an ES module.
        r.r(n);

        // Define a 'default' export pointing to 't'.
        Object.defineProperty(n, "default", {
            enumerable: true,
            value: t
        });

        // Bit 2: If set, and 't' is not a string, copy all properties from 't' to the namespace.
        if (2 & e && typeof t !== "string") {
            for (var i in t) {
                r.d(n, i, (function(e) {
                    return t[e];
                }).bind(null, i)); // Use .bind to capture 'i' for the getter.
            }
        }
        return n;
    };

    // 'r.n': Creates a getter function for non-ES modules to access their default export.
    // 't': The module or its exports.
    r.n = function(t) {
        var e = t && t.__esModule ? // If it's an ES module, return a function that gets its 'default' export.
            function() {
                return t.default;
            } : // Otherwise, return a function that simply returns 't'.
            function() {
                return t;
            };
        // Define an 'a' property on the getter function itself, pointing back to the getter.
        r.d(e, "a", e);
        return e;
    };

    // 'r.o': A utility function to check if an object 't' has an own property 'e'.
    r.o = function(t, e) {
        return Object.prototype.hasOwnProperty.call(t, e);
    };

    // 'r.p': The public path for assets (often empty in simple bundles).
    r.p = "";

    // Finally, load the entry module (module with ID 0) and return its exports.
    return r(r.s = 0);

}(
    // The array of all module definitions.
    [
        /*
         * Module 0: Entry point of the application.
         * Reads from standard input and passes it to the main processing logic.
         */
        function(t, e, r) {
            "use strict"; // Enforce strict JavaScript rules.

            // Require module 1, which provides file system functionalities (e.g., 'fs').
            var n = r(1);

            // Require module 2 (the main orchestrator) and immediately call it.
            // The input for module 2 is the content read from '/dev/stdin' as UTF-8.
            r(2)(n.readFileSync("/dev/stdin", "utf8"));
        },

        /*
         * Module 1: Provides the Node.js 'fs' (file system) module.
         */
        function(t, e) {
            // Exports the 'fs' module directly.
            t.exports = require("fs");
        },

        /*
         * Module 2: Orchestrates the input processing and main logic execution.
         */
        function(t, e, r) {
            "use strict";

            // Require module 3 (an input reader class) and module 5 (the core algorithm).
            var n = r(3),
                i = r(5);

            // This module exports a function.
            // This function expects a raw input string.
            t.exports = function(t) {
                // Create an instance of the input reader, initialized with the provided string.
                var e = new n(t);

                // Pass the initialized input reader instance to the core algorithm module (module 5) for processing.
                i(e);
            };
        },

        /*
         * Module 3: Defines a class for reading input tokens.
         * It uses a queue-like structure (from module 4) internally.
         */
        function(t, e, r) {
            "use strict";

            // Require module 4, which is expected to be a queue/deque implementation.
            var n = r(4);

            // Export a class for structured input reading.
            t.exports = class {
                // Constructor: Takes the raw input string.
                constructor(t) {
                    // Trim leading/trailing whitespace and split the string by any whitespace.
                    // This creates an array of input tokens.
                    var e = t.trim().split(/\s+/g);

                    // Initialize an internal input queue/deque with these tokens.
                    this.inp = new n(e);
                }

                // Method 'inr': Reads and returns the next raw string token from the input.
                inr() {
                    return this.inp.deq();
                }

                // Method 'in': Reads the next token, parses it as an integer (base 10), and returns it.
                in() {
                    return parseInt(this.inp.deq(), 10);
                }

                // Method 'fin': Clears the internal input buffer.
                fin() {
                    this.inp.clear();
                }
            };
        },

        /*
         * Module 4: Implements a basic queue (or deque) class.
         * Supports enqueuing, dequeuing, and clearing.
         */
        function(t, e, r) {
            "use strict";

            // Export the Queue class.
            t.exports = class {
                // Constructor: Can optionally take an initial array of items.
                constructor() {
                    // Initialize 't' with the provided arguments, defaulting to an empty array.
                    var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];

                    // Set initial size, items array, and current index for dequeuing.
                    this.size = t.length;
                    this.items = t;
                    this.ind = 0;
                }

                // Method 'enq': Enqueues (adds) an item to the end of the queue.
                enq(t) {
                    this.size += 1; // Increment the count of items.
                    this.items.push(t); // Add the item to the end of the internal array.
                }

                // Method 'deq': Dequeues (removes and returns) an item from the front of the queue.
                deq() {
                    var t = this.items[this.ind]; // Get the item at the current index (front).
                    this.size -= 1; // Decrement the count of items.
                    this.ind += 1; // Advance the index to the next item.
                    return t; // Return the dequeued item.
                }

                // Method 'clear': Resets the queue to an empty state.
                clear() {
                    this.items = []; // Empty the items array.
                    this.size = 0; // Reset the size to zero.
                    this.ind = 0; // Reset the index.
                }
            };
        },

        /*
         * Module 5: Contains the core problem-solving algorithm.
         * It processes an array of numbers based on specific rules.
         */
        function(t, e, r) {
            "use strict";

            // 't' here refers to an instance of the input reader class (from Module 3).

            // Read the first integer from input, which defines the size 'e' of an array.
            var e = t.in();

            // Initialize an array 'r' of the determined size.
            var r = new Array(e);

            // Populate the array 'r' with 'e' subsequent integers read from input.
            for (var n = 0; n < e; n++) {
                r[n] = t.in();
            }

            // Begin the main logic based on the first element of the array.
            if (0 == r[0]) {
                // If the first element is 0, proceed with the calculation.
                var i = 0; // 'i' will accumulate the result.
                var o = 0; // 'o' stores the previous element's value.
                var s = 1; // 's' is the loop counter, starting from the second element.

                // Iterate through the array starting from the second element.
                for (; s < e; s++) {
                    // Compare the current element 'r[s]' with the previous element 'o'.
                    if (o <= r[s]) {
                        // If the current element is greater than or equal to the previous.
                        // Check if the difference is greater than 1.
                        if (r[s] - o > 1) {
                            // If the difference is too large, the sequence is invalid.
                            return void console.log(-1); // Output -1 and exit.
                        }
                        // If the difference is exactly 1, increment 'i'.
                        r[s] - o == 1 && i++;

                        // If the difference is 0 (elements are equal), add the current element to 'i'.
                        r[s] - o == 0 && (i += r[s]);
                    } else {
                        // If the current element is less than the previous, add the current element to 'i'.
                        i += r[s];
                    }
                    // Update 'o' to the current element for the next iteration.
                    o = r[s];
                }
                // After the loop, output the accumulated result.
                console.log(i);
            } else {
                // If the first element 'r[0]' is not 0, output -1.
                console.log(-1);
            }
        }
    ]
);