/*
 * This is a module entry point for a JavaScript application.
 * It sets up a basic module loading system, similar to what Webpack or other bundlers might generate.
 * The primary function takes an array of module definitions as its argument.
 */
module.exports = function (t) {
  // 'e' serves as the cache for loaded modules.
  // When a module is requested, it's first checked here.
  var e = {};

  /**
   * The core module loading function.
   * This function is responsible for retrieving and executing modules.
   * @param {number} n - The unique identifier (index) of the module to load.
   * @returns {*} The exports object of the requested module.
   */
  function r(n) {
    // Check if the module is already in the cache 'e'.
    // If it is, return its exports immediately to prevent re-execution.
    if (e[n]) {
      return e[n].exports;
    }

    // If the module is not in the cache, initialize a new module entry.
    // 'i' represents the module object itself, containing its ID, loaded status, and exports.
    var i = e[n] = {
      i: n, // The module's identifier.
      l: !1, // A flag indicating whether the module has been loaded (false initially).
      exports: {} // The object that will hold the module's exported values.
    };

    // Execute the module's definition function.
    // 't[n]' is the actual function containing the module's code.
    // It's called with 'i.exports' as 'this', and 'i', 'i.exports', and 'r' (the loader itself) as arguments.
    t[n].call(i.exports, i, i.exports, r);

    // After execution, mark the module as loaded by setting its 'l' flag to true.
    i.l = !0;

    // Return the module's exports.
    return i.exports;
  }

  // Attach additional utility methods to the 'r' function (the module loader).

  // 'r.m' stores the array of module definitions.
  return r.m = t,

    // 'r.c' stores the module cache object.
    r.c = e,

    /**
     * 'r.d' is a utility to define a getter property on an object.
     * This is often used for lazy loading or for creating non-writable exports.
     * @param {object} t - The target object on which to define the property.
     * @param {string} e - The name of the property to define.
     * @param {function} n - The getter function for the property.
     */
    r.d = function (t, e, n) {
      // Check if the property 'e' already exists on object 't'.
      // If not, define it using Object.defineProperty.
      if (!r.o(t, e)) {
        Object.defineProperty(t, e, {
          enumerable: !0, // Make the property enumerable (visible during iteration).
          get: n // Assign the provided function 'n' as the getter.
        });
      }
    },

    /**
     * 'r.r' marks an object as an ECMAScript module.
     * This typically involves setting '__esModule' to true and potentially 'Symbol.toStringTag'.
     * @param {object} t - The object to mark as an ES module.
     */
    r.r = function (t) {
      // If Symbol and Symbol.toStringTag are available, set the 'Symbol.toStringTag' property.
      // This helps with better debugging and identification of module objects.
      if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
        Object.defineProperty(t, Symbol.toStringTag, {
          value: "Module"
        });
      }
      // Set the '__esModule' property to true, a common convention for ES modules.
      Object.defineProperty(t, "__esModule", {
        value: !0
      });
    },

    /**
     * 'r.t' creates a namespace object for module imports, handling various import types.
     * It normalizes different module formats (CommonJS, ES Modules) into a consistent object.
     * @param {*} t - The module or its ID.
     * @param {number} e - Flags indicating the type of import (e.g., 1 for direct import, 4 for ES module).
     * @returns {object} A namespace object representing the module's exports.
     */
    r.t = function (t, e) {
      // Flag 1: If it's a direct module import, load it using 'r'.
      if (1 & e) {
        t = r(t);
      }
      // Flag 8: If the module is already a namespace object, return it directly.
      if (8 & e) {
        return t;
      }
      // Flag 4: If it's an object and already marked as an ES module, return it directly.
      if (4 & e && typeof t === "object" && t && t.__esModule) {
        return t;
      }

      // Create a new empty object that will serve as the namespace.
      var n = Object.create(null);
      // Mark this new object as an ES module.
      r.r(n);
      // Define a 'default' export property on the namespace, pointing to the module 't'.
      Object.defineProperty(n, "default", {
        enumerable: !0,
        value: t
      });

      // Flag 2: If 't' is not a string and flag 2 is set, iterate over its properties.
      // This is often used to copy all named exports from a CommonJS module.
      if (2 & e && typeof t !== "string") {
        for (var i in t) {
          // For each property, define a getter on the new namespace object 'n'.
          // The getter simply returns the corresponding property from 't'.
          r.d(n, i, (function (e) {
            return t[e];
          }).bind(null, i));
        }
      }
      return n;
    },

    /**
     * 'r.n' is a utility to get the module's exports,
     * specifically handling the 'default' export for ES Modules.
     * It returns a function that, when called, provides the main export.
     * @param {*} t - The module object.
     * @returns {function} A function that returns the module's main export.
     */
    r.n = function (t) {
      // Determine the getter function based on whether 't' is an ES module.
      var e = t && t.__esModule ? // If 't' is an ES module...
        function () {
          return t.default; // ...return its 'default' export.
        } :
        function () {
          return t; // ...otherwise, return 't' itself.
        };
      // Define an additional getter 'a' on the 'e' function itself, pointing to 'e'.
      // This is a common pattern in Webpack for accessing the raw module.
      r.d(e, "a", e);
      return e;
    },

    /**
     * 'r.o' is a simple wrapper for Object.prototype.hasOwnProperty.call.
     * It checks if an object 't' directly possesses a property 'e'.
     * @param {object} t - The object to check.
     * @param {string} e - The property name.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    r.o = function (t, e) {
      return Object.prototype.hasOwnProperty.call(t, e);
    },

    // 'r.p' represents the public path for assets (e.g., for dynamically loaded chunks).
    // In this context, it's an empty string.
    r.p = "",

    // Finally, load the entry module. 'r.s' (start module) is set to 0,
    // and then the module loader 'r' is invoked with this start module ID.
    r(r.s = 0);

}(
  // This array contains all the module definitions. Each function is a module.
  [
    /*
     * Module 0: This is the application's entry point.
     * It reads input from /dev/stdin and passes it to the main processing logic.
     */
    function (t, e, r) {
      "use strict"; // Enforce strict JavaScript parsing and execution.

      // Load module 1, which provides the 'fs' (file system) capabilities.
      var n = r(1);

      // Load module 2 and immediately invoke it.
      // The content of '/dev/stdin' is read synchronously as UTF-8 and passed as an argument.
      r(2)(n.readFileSync("/dev/stdin", "utf8"));
    },

    /*
     * Module 1: Exports the Node.js 'fs' module.
     * This makes file system operations available to other modules.
     */
    function (t, e) {
      t.exports = require("fs"); // Node.js 'fs' module is directly exported.
    },

    /*
     * Module 2: Orchestrates the input processing.
     * It initializes an input reader and then calls the main solver.
     */
    function (t, e, r) {
      "use strict"; // Enforce strict mode.

      // Load module 3, which defines the 'InputReader' class.
      var n = r(3);
      // Load module 5, which contains the main problem-solving function.
      var i = r(5);

      // This module exports a function that takes raw input 't' (a string).
      t.exports = function (t) {
        // Create a new instance of the InputReader, initialized with the raw input.
        var e = new n(t);
        // Call the solver function (from module 5) and pass the initialized input reader to it.
        i(e);
      };
    },

    /*
     * Module 3: Defines the InputReader class.
     * This class helps in parsing space-separated integer inputs efficiently.
     */
    function (t, e, r) {
      "use strict"; // Enforce strict mode.

      // Load module 4, which defines the 'Queue' class.
      var n = r(4);

      // Export the InputReader class itself.
      t.exports = class {
        /**
         * Constructor for the InputReader.
         * @param {string} t - The raw input string, typically from stdin.
         */
        constructor(t) {
          // Trim leading/trailing whitespace from the input string.
          // Then, split the string by one or more whitespace characters to get an array of tokens.
          var e = t.trim().split(/\s+/g);
          // Initialize an internal queue ('inp') with these parsed tokens.
          this.inp = new n(e);
        }

        /**
         * Reads and returns the next raw token from the input queue.
         * This method does not perform any type conversion.
         * @returns {string} The next string token.
         */
        inr() {
          return this.inp.deq();
        }

        /**
         * Reads the next token from the input queue and parses it as an integer.
         * Uses base 10 for parsing.
         * @returns {number} The next integer from the input.
         */
        in() {
          return parseInt(this.inp.deq(), 10);
        }

        /**
         * Clears all remaining tokens from the input queue.
         * Useful if no more input is expected or to reset the reader.
         */
        fin() {
          this.inp.clear();
        }
      };
    },

    /*
     * Module 4: Defines a simple Queue class.
     * This queue is implemented using an array and a pointer for efficient dequeuing.
     */
    function (t, e, r) {
      "use strict"; // Enforce strict mode.

      // Export the Queue class.
      t.exports = class {
        /**
         * Constructor for the Queue.
         * @param {Array} [t=[]] - An optional initial array of items to populate the queue.
         */
        constructor() {
          // Initialize 't' with the first argument if provided, otherwise an empty array.
          var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
          this.size = t.length; // The current number of items in the queue.
          this.items = t; // The underlying array storing the queue elements.
          this.ind = 0; // The index of the front of the queue (for dequeuing).
        }

        /**
         * Adds an item to the back of the queue.
         * @param {*} t - The item to enqueue.
         */
        enq(t) {
          this.size += 1; // Increment the queue size.
          this.items.push(t); // Add the item to the end of the array.
        }

        /**
         * Removes and returns the item from the front of the queue.
         * @returns {*} The item that was at the front of the queue.
         */
        deq() {
          var t = this.items[this.ind]; // Get the item at the current front index.
          this.size -= 1; // Decrement the queue size.
          this.ind += 1; // Advance the front index.
          return t; // Return the retrieved item.
        }

        /**
         * Clears all items from the queue, resetting its state.
         */
        clear() {
          this.items = []; // Reset the items array to empty.
          this.size = 0; // Reset the size to zero.
          this.ind = 0; // Reset the front index to zero.
        }
      };
    },

    /*
     * Module 5: Contains the primary algorithm to solve the problem.
     * It calculates the minimum number of elements to remove to make an array sorted.
     * This is equivalent to finding the longest increasing subsequence.
     */
    function (t, e, r) {
      "use strict"; // Enforce strict mode.

      // Export the main solver function, which takes an input reader 't'.
      t.exports = function (t) {
        // Read the first integer from input, which represents the total number of elements 'e'.
        // This 'e' will be the size of the array to process.
        for (
          var e = t.in(),
            // Initialize an array 'r' of size 'e' to store the input numbers.
            r = new Array(e),
            // Loop counter 'n' from 0 up to 'e' (exclusive).
            n = 0; n < e; n++
        ) {
          // Read each subsequent integer and store it in the 'r' array.
          r[n] = t.in();
        }

        // Initialize an array 'i' of size 'e + 1' and fill it with zeros.
        // This array will store the lengths of increasing subsequences.
        // Specifically, i[k] will store the length of the longest increasing subsequence ending with value k.
        for (
          var i = new Array(e + 1).fill(0),
            // Loop counter 'o' from 1 up to 'e' (inclusive).
            o = 1; o <= e; o++
        ) {
          // This line is critical and assumes the input numbers in 'r' are 1-indexed values.
          // It calculates the length of the increasing subsequence ending with the value r[o].
          // The assumption is that if r[o] is the current number, and r[o]-1 was the previous number
          // in an increasing sequence, then the length ending at r[o] is 1 more than the length ending at r[o]-1.
          // Note: The original code uses `r[o]` directly, implying `r` is 1-indexed or its values are indices.
          // If `r` is 0-indexed, this would be `i[r[o-1]] = i[r[o-1]-1] + 1;` but we must preserve the original.
          i[r[o]] = i[r[o] - 1] + 1;
        }

        // Find the maximum length 's' among all calculated increasing subsequences.
        for (
          var s = 0, // Initialize 's' (maximum length found) to 0.
            // Loop counter 'u' from 1 up to 'e' (inclusive).
            u = 1; u <= e; u++
        ) {
          // Update 's' if the current subsequence length 'i[u]' is greater.
          s = Math.max(s, i[u]);
        }

        // The problem asks for the minimum number of elements to remove to make the array sorted.
        // This is equivalent to `total elements - length of the longest increasing subsequence`.
        console.log(e - s);
      };
    }
  ]
);