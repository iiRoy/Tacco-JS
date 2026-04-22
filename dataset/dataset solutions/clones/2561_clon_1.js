/*
 * This JavaScript module is a self-executing function designed to
 * load and manage other JavaScript modules. It mimics a simplified
 * Webpack-like runtime environment.
 *
 * The `module.exports` statement makes this entire bundle the export
 * of the main entry file if this script is required by another Node.js module.
 */
module.exports = function (t) {

    // This object serves as a cache for already loaded modules.
    // Module exports are stored here once they are processed.
    var e = {};

    /**
     * The core function responsible for loading and executing modules.
     * It handles caching to prevent redundant execution and ensures
     * that each module is a singleton within this runtime.
     *
     * @param {number} r The unique identifier (ID) of the module to load.
     * @returns {object} The exports object of the requested module.
     */
    function i(r) {

        // Check if the module is already in our cache 'e'.
        // If it is, return its exports immediately to save processing time.
        if (e[r]) {
            return e[r].exports;
        }

        // If the module is not cached, initialize a new module entry.
        // 's' represents the module object itself, containing its state.
        var s = e[r] = {
            i: r,      // Store the module ID.
            l: !1,     // 'l' (loaded flag) is initially false.
            exports: {} // An empty object where the module's exports will be collected.
        };

        // Execute the module function provided in the 't' array.
        // The 'call' method sets 's.exports' as the 'this' context for the module function,
        // and passes 's' (module), 's.exports' (exports), and 'i' (the module loader itself,
        // often named 'require') as arguments, mimicking Node.js module loading.
        t[r].call(s.exports, s, s.exports, i);

        // After execution, mark the module as loaded by setting 'l' to true.
        s.l = !0;

        // Return the 'exports' object, which now contains the module's public interface.
        return s.exports;
    }


    /*
     * Attach the array of module definitions ('t') to the loader function 'i'.
     * This makes the module definitions accessible to the loader.
     */
    i.m = t;

    /*
     * Attach the module cache ('e') to the loader function 'i'.
     * This provides access to the cache from other parts of the loader if needed.
     */
    i.c = e;


    /**
     * Helper function to define an enumerable getter property on an object.
     * This is typically used for defining named exports in ES module compatibility.
     *
     * @param {object} t The target object where the property will be defined (e.g., module.exports).
     * @param {string} e The name of the property to define.
     * @param {function} r The getter function that will be called when the property is accessed.
     */
    i.d = function (t, e, r) {
        // Only define the property if it doesn't already exist on the object.
        if (!i.o(t, e)) {
            Object.defineProperty(t, e, {
                enumerable: !0, // Make the property visible when iterating over object keys.
                get: r         // Assign the provided getter function.
            });
        }
    };


    /**
     * Helper function to add ES module compatibility flags to an exports object.
     * This helps tools and environments correctly identify and interact with ES modules.
     *
     * @param {object} t The exports object to which ES module flags will be added.
     */
    i.r = function (t) {
        // If Symbol is available and Symbol.toStringTag exists, define it.
        // This provides a custom string description for the module object.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(t, Symbol.toStringTag, {
                value: "Module"
            });
        }

        // Define '__esModule' property as true, explicitly marking it as an ES module.
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
    };


    /**
     * Creates a namespace object for a module's exports, handling different
     * module formats (CommonJS, ES Modules) for interoperability.
     *
     * @param {any} t The module's raw exports.
     * @param {number} e A bitmask of flags indicating how to process the exports.
     * @returns {object} A standardized namespace object containing the exports.
     */
    i.t = function (t, e) {
        // Flag 1: If it's a CommonJS module, load it using the main loader 'i'.
        if (1 & e && (t = i(t))) {
            return t;
        }

        // Flag 8: Return the module exports as is, without further processing.
        if (8 & e) {
            return t;
        }

        // Flag 4: If it's already an ES module object, return it directly.
        if (4 & e && typeof t === "object" && t && t.__esModule) {
            return t;
        }

        // Create a new plain object to serve as the namespace.
        var r = Object.create(null);

        // Apply ES module compatibility flags to the new namespace object.
        i.r(r);

        // Define a 'default' export property pointing to the original module exports 't'.
        Object.defineProperty(r, "default", {
            enumerable: !0,
            value: t
        });

        // Flag 2: If the module exports 't' are not a string, iterate over its properties
        // and re-export them as named exports in the new namespace 'r'.
        if (2 & e && typeof t !== "string") {
            for (var s in t) {
                // Ensure the property is owned by 't' and not inherited.
                // Define a getter for each property to lazily retrieve its value.
                i.d(r, s, (function (e) {
                    return t[e];
                }).bind(null, s));
            }
        }

        return r;
    };


    /**
     * Creates a getter function for a module's default export.
     * This helps in accessing the `default` export consistently, whether
     * the module is a true ES module or a CommonJS module.
     *
     * @param {object} t The module's exports object.
     * @returns {function} A function that, when called, returns the module's default export.
     */
    i.n = function (t) {
        var e = t && t.__esModule
            ? function () {
                return t.default;
            } // If it's an ES module, return its 'default' property.
            : function () {
                return t;
            };       // Otherwise, the module object itself is considered the default.

        // Define an 'a' property on the getter function, which is an alias for the getter itself.
        i.d(e, "a", e);

        return e;
    };


    /**
     * A safe way to check if an object has a specific property as its own property.
     * This avoids issues that might arise if `Object.prototype.hasOwnProperty` is
     * shadowed or if the object is created without a prototype (e.g., `Object.create(null)`).
     *
     * @param {object} t The object to check.
     * @param {string} e The name of the property to look for.
     * @returns {boolean} `true` if the object has the property, `false` otherwise.
     */
    i.o = function (t, e) {
        return Object.prototype.hasOwnProperty.call(t, e);
    };


    // This property defines the public path for loading additional chunks (dynamic imports).
    // In this specific bundle, it's an empty string, meaning relative paths are used.
    i.p = "";


    /*
     * The final step: execute the main entry module.
     * `i.s = 0` sets the startup module ID to 0, and then `i(0)` loads and runs it.
     * This initiates the application's logic.
     */
    return i(i.s = 0);

}(
    // The array 't' contains all the module definitions.
    // Each element is a function that represents a module.
    // These functions are executed by the 'i' loader when their module ID is requested.
    [
        /*
         * Module 0: The primary entry point of the application.
         * This module is responsible for reading input and initiating the main process.
         */
        function (t, e, i) {
            "use strict"; // Enable strict mode for this module.

            // Require module 1, which is expected to be the Node.js 'fs' (file system) module.
            var r = i(1);

            // Require module 2, then immediately call it with the content read from standard input.
            // '/dev/stdin' is a common Unix path for the standard input stream.
            // The 'utf8' encoding specifies how the input should be interpreted.
            i(2)(r.readFileSync("/dev/stdin", "utf8"));
        },

        /*
         * Module 1: Node.js 'fs' module wrapper.
         * This module simply exports the native Node.js 'fs' module,
         * making it available to other modules within this bundle.
         */
        function (t, e) {
            // Assign the result of Node's `require('fs')` to `t.exports`.
            // This makes the 'fs' module available as an export.
            t.exports = require("fs");
        },

        /*
         * Module 2: Application logic orchestrator.
         * This module takes raw input text, initializes an InputReader,
         * and then passes the reader to the main algorithm function.
         */
        function (t, e, i) {
            "use strict"; // Enable strict mode.

            // Require module 3, which defines the InputReader class.
            var r = i(3);

            // Require module 5, which contains the main algorithm function.
            var s = i(5);

            // Export a function that serves as the entry point for processing input.
            t.exports = function (t) {
                // Create a new instance of the InputReader, passing the raw input text.
                var e = new r(t);

                // Call the main algorithm function, providing it with the initialized InputReader.
                s(e);
            };
        },

        /*
         * Module 3: InputReader Class.
         * This class is designed to parse input strings into individual tokens
         * and provide convenient methods for reading different data types (strings, integers).
         */
        function (t, e, i) {
            "use strict"; // Enable strict mode.

            // Require module 4, which is expected to be a Queue-like data structure.
            var r = i(4);

            // Export the InputReader class.
            t.exports = class {
                /**
                 * Constructor for the InputReader.
                 *
                 * @param {string} t The raw input string to be processed.
                 */
                constructor(t) {
                    // Trim leading/trailing whitespace from the input string.
                    // Then, split the string into an array of tokens using any whitespace
                    // as a delimiter (globally).
                    var e = t.trim().split(/\s+/g);

                    // Initialize an internal queue-like structure (`r`) with these parsed tokens.
                    this.inp = new r(e);
                }

                /**
                 * Reads and returns the next raw token from the input buffer as a string.
                 *
                 * @returns {string} The next token.
                 */
                inr() {
                    return this.inp.deq();
                }

                /**
                 * Reads the next token from the input buffer, parses it as an integer
                 * (base 10), and returns the numeric value.
                 *
                 * @returns {number} The next token parsed as an integer.
                 */
                in() {
                    return parseInt(this.inp.deq(), 10);
                }

                /**
                 * Clears all remaining tokens from the internal input buffer,
                 * resetting the reader's state.
                 */
                fin() {
                    this.inp.clear();
                }
            };
        },

        /*
         * Module 4: Simple Deque (Double-Ended Queue) Class.
         * This class provides basic queue-like functionality: adding to the end,
         * removing from the front, and clearing all items.
         */
        function (t, e, i) {
            "use strict"; // Enable strict mode.

            // Export the Deque class.
            t.exports = class {
                /**
                 * Constructor for the Deque.
                 *
                 * @param {Array} [t=[]] An optional initial array of items to populate the deque.
                 *                       Defaults to an empty array if not provided.
                 */
                constructor() {
                    // Handle variable arguments to allow optional initial array.
                    var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];

                    // Initialize the size of the deque.
                    this.size = t.length;
                    // Store the items in an array.
                    this.items = t;
                    // 'ind' tracks the index of the next item to be dequeued (front of the queue).
                    this.ind = 0;
                }

                /**
                 * Adds an item to the back (end) of the deque.
                 *
                 * @param {any} t The item to add.
                 */
                enq(t) {
                    this.size += 1;      // Increment the size.
                    this.items.push(t);  // Add the item to the end of the array.
                }

                /**
                 * Removes and returns the item from the front of the deque.
                 * This operation advances the internal index.
                 *
                 * @returns {any} The item that was at the front of the deque.
                 */
                deq() {
                    // Get the item at the current front index.
                    var t = this.items[this.ind];

                    this.size -= 1;      // Decrement the size.
                    this.ind += 1;       // Move the front index forward.

                    return t;            // Return the dequeued item.
                }

                /**
                 * Clears all items from the deque and resets its internal state
                 * (size and index).
                 */
                clear() {
                    this.items = []; // Reset the items array to empty.
                    this.size = 0;   // Reset size to zero.
                    this.ind = 0;    // Reset the index to zero.
                }
            };
        },

        /*
         * Module 5: Core Algorithm Implementation.
         * This module contains the main logic that processes input using a heap
         * (priority queue) data structure.
         */
        function (t, e, i) {
            "use strict"; // Enable strict mode.

            // Require module 6, which defines the Heap (PriorityQueue) class.
            var r = i(6);

            // Export the main algorithm function.
            t.exports = function (t) {
                // Read the first integer from input, representing the number of initial items.
                var e = t.in();
                // Read the second integer from input, representing the number of operations to perform.
                var i = t.in();

                // Create a new instance of the Heap (defaulting to a max-heap if not specified).
                var s = new r();

                // Loop 'e' times to read initial items and push them into the heap.
                for (var n = 0; n < e; n++) {
                    var o = t.in(); // Read an item.
                    s.pushItem(o);   // Add it to the heap.
                }

                // Loop 'i' times to perform the specified operations.
                for (var h = 0; h < i; h++) {
                    var a = s.getTop();       // Get the top (max) element from the heap.
                    s.removeTop();            // Remove the top element.
                    s.pushItem(Math.floor(a / 2)); // Add the floor of (top element / 2) back to the heap.
                }

                // Initialize a variable to accumulate the sum of remaining elements.
                for (var u = 0; s.size > 0;) {
                    u += s.getTop();   // Add the current top element to the sum.
                    s.removeTop();     // Remove the top element.
                }

                // Print the final calculated sum to the console.
                console.log(u);
            };
        },

        /*
         * Module 6: Heap (PriorityQueue) Class.
         * This module provides a flexible implementation of a binary heap,
         * configurable as either a min-heap or a max-heap.
         */
        function (t, e, i) {
            "use strict"; // Enable strict mode.

            // Comparison function for a min-heap: 't' is considered "better" if it's less than or equal to 'e'.
            function r(t, e) {
                return t <= e;
            }

            // Comparison function for a max-heap: 't' is considered "better" if it's greater than or equal to 'e'.
            function s(t, e) {
                return t >= e;
            }

            // Export the Heap class.
            t.exports = class {
                /**
                 * Constructor for the Heap.
                 *
                 * @param {Array} [t=[]] An optional initial array of elements to build the heap from.
                 * @param {boolean} [e=true] If true, configures a min-heap; if false, a max-heap.
                 * @param {function} [i=undefined] An optional custom comparison function to override `e`.
                 */
                constructor() {
                    // Extract constructor arguments, providing default values.
                    var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
                    var e = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1]; // Default to true (min-heap).
                    var i = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : void 0; // Custom comparator.

                    // Set the comparison function based on the 'e' flag or a custom 'i' function.
                    this.cf = e ? r : s; // If 'e' is true, use 'r' (min-heap); otherwise, use 's' (max-heap).
                    if (i) {
                        this.cf = i;     // If a custom comparator is provided, override.
                    }

                    // Initialize the internal array that stores heap elements.
                    this.heap = t;
                    // Initialize the current size of the heap.
                    this.size = this.heap.length;

                    // If initial elements were provided, build the heap property.
                    this.heapify();
                }

                /**
                 * Transforms an arbitrary array into a heap by applying the heap property
                 * from the bottom-up.
                 */
                heapify() {
                    // Find the index of the last non-leaf node (parent of the last element).
                    // This is usually Math.floor((this.size / 2) - 1).
                    // The original code calculates it slightly differently but achieves the same.
                    for (var t = 0, e = this.size; 2 * t + 1 <= e;) {
                        t = 2 * t + 1;
                    }
                    t = Math.floor((t - 1) / 2); // Adjust 't' to be the correct starting parent index.

                    // Iterate backwards from the last parent up to the root (index 0).
                    for (var i = t; i >= 0;) {
                        // If the current node is a leaf or has no children, just move to the next parent.
                        if (2 * i + 1 > e - 1) {
                            i--;
                        } else {
                            // Otherwise, down-heap the current node to ensure the heap property.
                            this.downHeap(i);
                            i--;
                        }
                    }
                }

                /**
                 * Restores the heap property by moving an element at a given index
                 * downwards in the heap until its correct position is found.
                 *
                 * @param {number} t The index of the element to down-heap.
                 */
                downHeap(t) {
                    var e = this.size; // Get the current heap size.
                    var i = t;         // Start at the given index.

                    // Continue as long as the current node has at least one child.
                    while (2 * i + 1 < e) {
                        var r = this.heap[2 * i + 1]; // Value of the left child.
                        // Value of the right child, or left child's value if no right child exists.
                        var s = 2 * i + 2 < e ? this.heap[2 * i + 2] : r;

                        // Determine the "better" child (e.g., smaller for min-heap, larger for max-heap)
                        // and its index.
                        var n = this.cf(s, r) ? r : s;
                        var o = this.cf(s, r) ? 2 * i + 1 : 2 * i + 2;

                        // If the current node is already "better" than or equal to its "better" child,
                        // the heap property is satisfied, so we can stop.
                        if (this.cf(n, this.heap[i])) {
                            break;
                        }

                        // Otherwise, swap the current node with the "better" child.
                        var h = n;               // Temporarily store the child's value.
                        this.heap[o] = this.heap[i]; // Move the parent down to the child's position.
                        this.heap[i] = h;             // Move the child up to the parent's position.

                        // Update the current index to the child's index and continue the process.
                        i = o;
                    }
                }

                /**
                 * Restores the heap property by moving an element at a given index
                 * upwards in the heap until its correct position is found.
                 *
                 * @param {number} t The index of the element to up-heap.
                 */
                upHeap(t) {
                    var e = t; // Start at the given index.

                    // Continue as long as the current node is not the root (index 0).
                    while (e !== 0) {
                        var i = Math.floor((e - 1) / 2); // Calculate the parent's index.

                        // If the current element is "better" than or equal to its parent,
                        // the heap property is satisfied, so we can stop.
                        if (this.cf(this.heap[e], this.heap[i])) {
                            break;
                        }

                        // Otherwise, swap the current node with its parent.
                        var r = this.heap[i];       // Temporarily store the parent's value.
                        this.heap[i] = this.heap[e]; // Move the current element up to the parent's position.
                        this.heap[e] = r;             // Move the parent down to the current element's position.

                        // Update the current index to the parent's index and continue.
                        e = i;
                    }
                }

                /**
                 * Adds a new item to the heap and maintains the heap property
                 * by performing an up-heap operation.
                 *
                 * @param {any} t The item to be added to the heap.
                 */
                pushItem(t) {
                    this.size += 1;          // Increment the heap size.
                    this.heap.push(t);       // Add the new item to the end of the array.
                    this.upHeap(this.size - 1); // Restore heap property by up-heaping the newly added item.
                }

                /**
                 * Returns the top element of the heap (the minimum for a min-heap,
                 * or the maximum for a max-heap) without removing it.
                 *
                 * @returns {any} The top element of the heap.
                 */
                getTop() {
                    return this.heap[0]; // The root element (index 0) is always the top.
                }

                /**
                 * Removes and returns the top element of the heap.
                 * The heap property is then restored by moving the last element
                 * to the root and performing a down-heap operation.
                 *
                 * @returns {boolean} `true` if an item was successfully removed, `false` if the heap was empty.
                 */
                removeTop() {
                    // Only proceed if the heap is not empty.
                    if (this.size !== 0) {
                        this.size -= 1;          // Decrement the heap size.
                        this.heap[0] = this.heap.pop(); // Move the last element to the root position.
                        this.downHeap(0);        // Restore heap property by down-heaping the new root.
                        return !0;               // Indicate successful removal.
                    }
                    return false; // Return false if the heap was empty and no item was removed.
                }

                /**
                 * Returns the internal array that represents the heap.
                 * Note that this array is not necessarily sorted, but it satisfies the heap property.
                 *
                 * @returns {Array} The underlying array of heap values.
                 */
                getValuesList() {
                    return this.heap;
                }
            };
        }
    ]
);