module.exports = function (t) {
    // This 'e' object serves as a cache for already loaded modules.
    // Its keys are module IDs and values are module objects.
    var e = {};

    /**
     * The core 'require' function used to load modules.
     * @param {number} n The ID of the module to load.
     * @returns {any} The exports of the requested module.
     */
    function r(n) {
        // If the module is already in our cache, return its exports immediately.
        if (e[n]) {
            return e[n].exports;
        }

        // If not in cache, create a new module object and store it.
        // The 'i' variable represents this new module object.
        var i = e[n] = {
            i: n,       // Store the module ID.
            l: false,   // 'l' indicates if the module has been loaded (false initially).
            exports: {} // The object that will hold the module's exports.
        };

        // Execute the module's factory function.
        // 't[n]' is the actual function for module 'n'.
        // 'call' is used to set 'this' context and pass arguments:
        // 1. 'i.exports' as 'this' (though often ignored in modern modules).
        // 2. 'i' as the 'module' object.
        // 3. 'i.exports' as the 'exports' object.
        // 4. 'r' itself as the local 'require' function for the module.
        t[n].call(i.exports, i, i.exports, r);

        // After execution, mark the module as loaded.
        i.l = true;

        // Return the exports of the newly loaded module.
        return i.exports;
    }

    // Attach the original modules definition object to 'r.m'.
    // 'm' stands for 'modules'.
    r.m = t;

    // Attach the module cache to 'r.c'.
    // 'c' stands for 'cache'.
    r.c = e;

    /**
     * Defines a getter function for a specific property on an object.
     * This is used to create "live bindings" for ES module imports.
     * @param {object} t The target object where the property will be defined.
     * @param {string} e The name of the property to define.
     * @param {Function} n The getter function for the property.
     */
    r.d = function (t, e, n) {
        // Only define the property if it doesn't already exist on the object.
        if (!r.o(t, e)) {
            Object.defineProperty(t, e, {
                enumerable: true, // Make the property enumerable (visible in for...in loops).
                get: n            // Set the getter function.
            });
        }
    };

    /**
     * Marks an object as an ES module.
     * This adds '__esModule: true' and, if supported, 'Symbol.toStringTag: "Module"'.
     * @param {object} t The object to mark as an ES module.
     */
    r.r = function (t) {
        // If Symbol and Symbol.toStringTag are available, set it for better module identification.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(t, Symbol.toStringTag, {
                value: "Module"
            });
        }
        // Set '__esModule' property to true, which is a common indicator for ES modules.
        Object.defineProperty(t, "__esModule", {
            value: true
        });
    };

    /**
     * Creates a namespace object for module imports, handling different module formats.
     * This function is crucial for interoperability between CommonJS and ES modules.
     * @param {any} t The original module exports.
     * @param {number} e A bitmask of flags indicating how to process the exports.
     * @returns {any} A namespace object representing the module's exports.
     */
    r.t = function (t, e) {
        // Flag 1: If the input 't' is a module ID, immediately require it.
        if (1 & e) {
            t = r(t);
        }

        // Flag 8: If it's a direct export, return it as is.
        if (8 & e) {
            return t;
        }

        // Flag 4: If it's already an ES module object, return it as is.
        if (4 & e && typeof t === "object" && t && t.__esModule) {
            return t;
        }

        // Create a new, empty object to serve as the namespace.
        var n = Object.create(null);

        // Mark the new namespace object as an ES module.
        r.r(n);

        // Define a 'default' property on the namespace, pointing to the original exports 't'.
        Object.defineProperty(n, "default", {
            enumerable: true,
            value: t
        });

        // Flag 2: If it's a non-string export (likely CommonJS),
        // copy all its enumerable properties to the namespace.
        if (2 & e && typeof t !== "string") {
            // Iterate over all enumerable properties of the original exports 't'.
            for (var i in t) {
                // Define a getter for each property on the namespace object.
                // The bind ensures that 'i' (the property name) is correctly captured for each iteration.
                r.d(n, i, (function (e_param) {
                    return t[e_param];
                }).bind(null, i));
            }
        }

        // Return the constructed namespace object.
        return n;
    };

    /**
     * Helper function to retrieve the "default" export of a module.
     * It handles both ES modules (which have a '.default' property) and CommonJS modules.
     * @param {object} t The module exports object.
     * @returns {Function} A function that, when called, returns the default export.
     */
    r.n = function (t) {
        // Determine the function to return the default export based on whether 't' is an ES module.
        var e = t && t.__esModule ?
            // If it's an ES module, return its 'default' property.
            function () {
                return t.default;
            } :
            // Otherwise (CommonJS), the module itself is considered the default export.
            function () {
                return t;
            };

        // Define a getter for property 'a' on this function, making it point to itself.
        // This is often used for compatibility with certain module systems or tools.
        r.d(e, "a", e);

        // Return the function that provides the default export.
        return e;
    };

    /**
     * Checks if an object has a specified property directly on itself (not in its prototype chain).
     * This is a wrapper for Object.prototype.hasOwnProperty.call.
     * @param {object} t The object to check.
     * @param {string} e The name of the property to look for.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    r.o = function (t, e) {
        return Object.prototype.hasOwnProperty.call(t, e);
    };

    // 'r.p' is the public path for assets, often used for dynamic imports.
    // In this case, it's an empty string.
    r.p = "";

    // The entry point of the application: require module 0.
    // 'r.s = 0' sets the startup module ID.
    return r(r.s = 0);
}(
    // This array contains all the module definitions.
    // Each element is a function representing a specific module.
    [
        /**
         * Module 0: The main application entry point.
         * This module reads input from `/dev/stdin` and passes it to subsequent processing.
         * @param {object} t The module object.
         * @param {object} e The module's exports object.
         * @param {Function} r The local 'require' function.
         */
        function (t, e, r) {
            "use strict"; // Enable strict mode for this module.

            // Require module 1, which provides the 'fs' (file system) module.
            var n = r(1);

            // Require module 2, and immediately invoke it.
            // The argument passed to module 2 is the content read from `/dev/stdin` as a UTF-8 string.
            r(2)(n.readFileSync("/dev/stdin", "utf8"));
        },

        /**
         * Module 1: Exports the Node.js built-in 'fs' module.
         * @param {object} t The module object.
         * @param {object} e The module's exports object.
         */
        function (t, e) {
            // Assign the 'fs' module obtained via Node's native 'require' to this module's exports.
            t.exports = require("fs");
        },

        /**
         * Module 2: Orchestrates the input parsing and problem solving.
         * It initializes an input reader and then calls the main solver function.
         * @param {object} t The module object.
         * @param {object} e The module's exports object.
         * @param {Function} r The local 'require' function.
         */
        function (t, e, r) {
            "use strict"; // Enable strict mode.

            // Require module 3, which defines the 'InputReader' class.
            var n = r(3);

            // Require module 5, which contains the main problem-solving logic.
            var i = r(5);

            // This module exports a function that takes raw input 't'.
            t.exports = function (t) {
                // Create a new instance of the InputReader, initialized with the raw input string.
                var e = new n(t);

                // Call the solver function (from module 5), passing the InputReader instance.
                i(e);
            };
        },

        /**
         * Module 3: Defines the 'InputReader' class.
         * This class is responsible for reading and parsing tokens from an input string.
         * @param {object} t The module object.
         * @param {object} e The module's exports object.
         * @param {Function} r The local 'require' function.
         */
        function (t, e, r) {
            "use strict"; // Enable strict mode.

            // Require module 4, which defines a generic 'Queue' class.
            var n = r(4);

            // Export the InputReader class definition.
            t.exports = class {
                /**
                 * Constructor for the InputReader.
                 * @param {string} t The raw input string to be processed.
                 */
                constructor(t) {
                    // Trim leading/trailing whitespace from the input string,
                    // then split it into tokens using any sequence of whitespace characters.
                    var e = t.trim().split(/\s+/g);

                    // Initialize an internal queue ('inp') with these parsed tokens.
                    this.inp = new n(e);
                }

                /**
                 * Dequeues and returns the next raw string token from the input.
                 * @returns {string} The next string token.
                 */
                inr() {
                    return this.inp.deq();
                }

                /**
                 * Dequeues the next token and parses it as an integer (base 10).
                 * @returns {number} The next integer token.
                 */
                in() {
                    return parseInt(this.inp.deq(), 10);
                }

                /**
                 * Clears the internal input queue, effectively resetting the reader.
                 */
                fin() {
                    this.inp.clear();
                }
            };
        },

        /**
         * Module 4: Defines a simple Queue data structure.
         * This class allows enqueuing and dequeuing elements in a FIFO (First-In, First-Out) manner.
         * @param {object} t The module object.
         * @param {object} e The module's exports object.
         * @param {Function} r The local 'require' function.
         */
        function (t, e, r) {
            "use strict"; // Enable strict mode.

            // Export the Queue class definition.
            t.exports = class {
                /**
                 * Constructor for the Queue.
                 * @param {Array<any>} [t=[]] An optional initial array of items to populate the queue.
                 */
                constructor() {
                    // Handle the default argument for initial items.
                    // If no argument is provided or it's undefined, default to an empty array.
                    var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];

                    // Initialize the queue's properties:
                    // 'size' tracks the number of items currently in the queue.
                    // 'items' is the underlying array storing the queue elements.
                    // 'ind' is the index of the next element to be dequeued (head of the queue).
                    this.size = t.length;
                    this.items = t;
                    this.ind = 0;
                }

                /**
                 * Adds an item to the end of the queue.
                 * @param {any} t The item to enqueue.
                 */
                enq(t) {
                    this.size += 1;     // Increment the size of the queue.
                    this.items.push(t); // Add the item to the end of the internal array.
                }

                /**
                 * Removes and returns the item at the front of the queue.
                 * @returns {any} The dequeued item.
                 */
                deq() {
                    // Retrieve the item at the current 'ind' (front of the queue).
                    var t = this.items[this.ind];

                    this.size -= 1;     // Decrement the size of the queue.
                    this.ind += 1;      // Advance the index to the next item.

                    // Return the retrieved item.
                    return t;
                }

                /**
                 * Clears all items from the queue, resetting its state.
                 */
                clear() {
                    this.items = []; // Reset the items array to empty.
                    this.size = 0;   // Reset size to 0.
                    this.ind = 0;    // Reset the dequeue index to 0.
                }
            };
        },

        /**
         * Module 5: Contains the main algorithm to solve the problem.
         * It reads an integer, finds its divisors, and calculates a specific value based on them.
         * @param {object} t The module object.
         * @param {object} e The module's exports object.
         * @param {Function} r The local 'require' function.
         */
        function (t, e, r) {
            "use strict"; // Enable strict mode.

            // Require module 6, which provides a function to find divisors of a number.
            var n = r(6);

            // This module exports a function that takes an InputReader instance 't'.
            t.exports = function (t) {
                // Read an integer from the input using the InputReader.
                var e = t.in();

                // Get an object containing all divisors of 'e' (and their pairs).
                var r = n(e);

                // Initialize variables to track the best pair of divisors found so far.
                // 'i' stores the minimum difference between two factors.
                // 's' stores the first factor of the optimal pair.
                // 'o' stores the second factor of the optimal pair.
                var i = e;
                var s = 1;
                var o = e;

                // Iterate over the keys (divisors) in the 'r' object.
                // 'u' represents a divisor.
                for (var u in r) {
                    // Optimization: if 'u' (a divisor) is greater than its corresponding pair 'r[u]',
                    // it means we have already processed this pair (or its symmetric counterpart).
                    // We can break the loop as we only need to check up to the square root.
                    if (u > r[u]) {
                        break;
                    }

                    // Calculate the difference between the current pair of factors (r[u] and u).
                    // If this difference is smaller than the current minimum difference 'i',
                    // update our optimal factors and minimum difference.
                    if (i > r[u] - u) {
                        s = u;         // Update the first factor.
                        o = r[u];      // Update the second factor.
                        i = r[u] - u;  // Update the minimum difference.
                    }
                }

                // Output the final result to the console.
                // The problem likely requires (s-1) + (o-1), implying factors are 1-indexed
                // and the result needs to be adjusted.
                console.log(s - 1 + o - 1);
            };
        },

        /**
         * Module 6: Calculates all divisors of a given number.
         * It returns an object where keys and values are divisor pairs.
         * @param {object} t The module object.
         * @param {object} e The module's exports object.
         * @param {Function} r The local 'require' function.
         */
        function (t, e, r) {
            "use strict"; // Enable strict mode.

            // This module exports a function that takes a number 't'.
            t.exports = function (t) {
                // Initialize an empty object to store the divisor pairs.
                var e = {};

                // Calculate the ceiling of the square root of 't'.
                // We only need to check for divisors up to this point, as their pairs will be found symmetrically.
                var r = Math.ceil(Math.sqrt(t));

                // Loop from 1 up to the square root of 't' (inclusive).
                // 'n' represents the current potential divisor.
                for (var n = 1; n < r + 1; n++) {
                    // If 'n' divides 't' evenly (i.e., 'n' is a divisor of 't')...
                    if (t % n == 0) {
                        // Store the divisor pair: 'n' with its complement 't/n',
                        // and 't/n' with its complement 'n'.
                        // This ensures both factors of a pair are present as keys.
                        e[n] = t / n;
                        e[t / n] = n;
                    }
                }

                // Return the object containing all divisor pairs.
                return e;
            };
        }
    ]
);