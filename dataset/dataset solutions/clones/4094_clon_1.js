/*
 * This file contains a bundled JavaScript application.
 * It uses a custom module loading system, similar to Webpack.
 * The structure involves a self-executing function that takes an array of modules.
 */

// Export the main application entry point function.
module.exports = function (
  t // 't' represents the array of all defined modules.
) {
  // 'e' serves as the cache for loaded modules.
  var e = {};

  /**
   * The core module loading function.
   * @param {number} n - The index of the module to load.
   * @returns {object} The exports of the requested module.
   */
  function r(
    n // 'n' is the module ID (index).
  ) {
    // Check if the module is already in the cache.
    if (e[n]) {
      // If found, return its cached exports immediately.
      return e[n].exports;
    }

    // If not in cache, create a new module object.
    // 'i' is the new module object, initialized with its ID,
    // a 'l' (loaded) flag set to false, and an empty 'exports' object.
    var i = e[n] = {
      i: n,
      l: false,
      exports: {}
    };

    // Execute the module function.
    // The module function is located in the 't' array at index 'n'.
    // It's called with 'i.exports' as 'this', and 'i', 'i.exports', 'r' as arguments.
    t[n].call(
      i.exports, // 'this' context for the module function.
      i, // The module object itself.
      i.exports, // The exports object to be populated.
      r // A reference to the module loader ('require' function).
    );

    // Mark the module as loaded.
    i.l = true;

    // Return the module's exports.
    return i.exports;
  }

  // Attach helper properties and methods to the 'r' (loader) function.

  // 'r.m' stores a reference to the modules array.
  r.m = t;

  // 'r.c' stores a reference to the module cache.
  r.c = e;

  /**
   * Defines a getter function for a property on an object.
   * This is used for lazy loading or exposing properties.
   * @param {object} t - The object on which to define the property.
   * @param {string} e - The name of the property.
   * @param {function} n - The getter function for the property.
   */
  r.d = function (
    t, // Target object.
    e, // Property name.
    n // Getter function.
  ) {
    // Only define if the property doesn't already exist.
    if (!r.o(t, e)) {
      Object.defineProperty(t, e, {
        enumerable: true, // Make the property enumerable.
        get: n // Assign the provided getter function.
      });
    }
  };

  /**
   * Marks a module as an ECMAScript Module (ESM).
   * This adds `Symbol.toStringTag` and `__esModule` properties.
   * @param {object} t - The module exports object.
   */
  r.r = function (
    t // Module exports object.
  ) {
    // Add Symbol.toStringTag for better debugging experience if Symbol is available.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(t, Symbol.toStringTag, {
        value: "Module"
      });
    }
    // Mark the module as an ES module.
    Object.defineProperty(t, "__esModule", {
      value: true
    });
  };

  /**
   * Creates a namespace object for a module.
   * This handles various module export formats (commonjs, esm, etc.).
   * @param {*} t - The module's exports.
   * @param {number} e - Flags indicating the type of module.
   * @returns {object} The namespace object.
   */
  r.t = function (
    t, // Module exports.
    e // Flags.
  ) {
    // Flag 1: If it's a regular module ID, load it.
    if (1 & e) {
      t = r(t);
    }

    // Flag 8: If it's a direct reference, return it as is.
    if (8 & e) {
      return t;
    }

    // Flag 4: If it's an object and already an ES module, return it.
    if (4 & e && typeof t === "object" && t && t.__esModule) {
      return t;
    }

    // Create a new namespace object.
    var n = Object.create(null);

    // Mark it as an ES module.
    r.r(n);

    // Define a 'default' property pointing to the module's exports.
    Object.defineProperty(n, "default", {
      enumerable: true,
      value: t
    });

    // Flag 2: If it's a non-string module, copy all its properties to the namespace.
    if (2 & e && typeof t !== "string") {
      for (var i in t) {
        // Ensure properties are not inherited from prototype.
        r.d(n, i, (function (e) {
          return t[e];
        }).bind(null, i));
      }
    }
    return n;
  };

  /**
   * Creates a getter function for the default export of a module.
   * This handles both ES modules and CommonJS modules.
   * @param {object} t - The module exports object.
   * @returns {function} A function that returns the default export.
   */
  r.n = function (
    t // Module exports object.
  ) {
    // If it's an ES module, return a function that gets its 'default' property.
    var e = t && t.__esModule ?
      function () {
        return t.default;
      } :
      // Otherwise, return a function that simply returns the module itself.
      function () {
        return t;
      };

    // Define an 'a' property on the getter function, pointing to itself.
    r.d(e, "a", e);

    return e;
  };

  /**
   * Checks if an object has a specific property.
   * This is a wrapper around `Object.prototype.hasOwnProperty.call`.
   * @param {object} t - The object to check.
   * @param {string} e - The property name.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  r.o = function (
    t, // Object.
    e // Property name.
  ) {
    return Object.prototype.hasOwnProperty.call(t, e);
  };

  // 'r.p' sets the public path for asset loading (empty in this case).
  r.p = "";

  // Load the entry module (module at index 0) and return its exports.
  // 'r.s' (startup) is set to 0, and then module 0 is loaded.
  return r(r.s = 0);
}(
  /*
   * The array of modules that comprise the application.
   * Each element in this array is a module function.
   */
  [
    /*
     * Module 0: Main entry point.
     * This module reads input from stdin and processes it.
     */
    function (
      t, // module object (not used directly here)
      e, // exports object (not used directly here)
      r // require function for this module
    ) {
      "use strict"; // Enable strict mode for this module.

      // Require module 1, which exports the Node.js 'fs' (file system) module.
      var n = r(1);

      // Require module 2, which is the main processing logic.
      // Then, call the function exported by module 2.
      // The argument passed is the content read from '/dev/stdin' as UTF-8 string.
      r(2)(
        n.readFileSync(
          "/dev/stdin", // Path to read from.
          "utf8" // Encoding for the input.
        )
      );
    },

    /*
     * Module 1: File System (fs) module wrapper.
     * Simply exports the Node.js built-in 'fs' module.
     */
    function (
      t, // module object
      e // exports object
    ) {
      // Assign the Node.js 'fs' module to this module's exports.
      t.exports = require("fs");
    },

    /*
     * Module 2: Input processing orchestrator.
     * This module takes the raw input string, creates an input handler,
     * and then passes it to the main algorithmic logic.
     */
    function (
      t, // module object
      e, // exports object
      r // require function for this module
    ) {
      "use strict"; // Enable strict mode.

      // Require module 3, which exports the `InputReader` class.
      var n = r(3),
        // Require module 5, which exports the main algorithm function.
        i = r(5);

      /**
       * Exports a function that processes the raw input string.
       * @param {string} t - The raw input string from stdin.
       */
      t.exports = function (
        t // The input string.
      ) {
        // Create a new instance of the InputReader class with the raw input.
        var e = new n(t);

        // Call the main algorithm function (from module 5) with the InputReader instance.
        i(e);
      };
    },

    /*
     * Module 3: InputReader class.
     * This class handles parsing and retrieving numbers/strings from the input.
     */
    function (
      t, // module object
      e, // exports object
      r // require function for this module
    ) {
      "use strict"; // Enable strict mode.

      // Require module 4, which exports the `Queue` class.
      var n = r(4);

      /**
       * Exports the InputReader class.
       * It tokenizes the input string and provides methods to read tokens.
       */
      t.exports = class {
        /**
         * Constructor for InputReader.
         * @param {string} t - The raw input string.
         */
        constructor(
          t // The input string.
        ) {
          // Trim whitespace from the input and split it by one or more spaces.
          var e = t.trim().split(/\s+/g);

          // Initialize an internal queue (`inp`) with the tokenized input.
          this.inp = new n(e);
        }

        /**
         * Reads and returns the next raw input token (string).
         * @returns {string} The next token from the input queue.
         */
        inr() {
          return this.inp.deq();
        }

        /**
         * Reads the next input token and parses it as an integer.
         * @returns {number} The next token parsed as an integer.
         */
        in() {
          return parseInt(this.inp.deq(), 10);
        }

        /**
         * Clears the input queue, effectively resetting the reader.
         */
        fin() {
          this.inp.clear();
        }
      };
    },

    /*
     * Module 4: Queue class.
     * A simple queue implementation using an array.
     */
    function (
      t, // module object (not used directly here)
      e, // exports object (not used directly here)
      r // require function (not used directly here)
    ) {
      "use strict"; // Enable strict mode.

      /**
       * Exports a Queue class.
       * Implements basic queue operations (enqueue, dequeue, clear).
       */
      t.exports = class {
        /**
         * Constructor for the Queue.
         * @param {Array} [t=[]] - Optional initial array of items.
         */
        constructor() {
          // Handle optional initial array argument.
          var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];

          // Initialize size, items array, and dequeue index.
          this.size = t.length;
          this.items = t;
          this.ind = 0;
        }

        /**
         * Adds an item to the end of the queue.
         * @param {*} t - The item to enqueue.
         */
        enq(
          t // Item to be added.
        ) {
          this.size += 1;
          this.items.push(t);
        }

        /**
         * Removes and returns the item from the front of the queue.
         * @returns {*} The item at the front of the queue.
         */
        deq() {
          var t = this.items[this.ind]; // Get the item at the current index.

          this.size -= 1; // Decrement the size.
          this.ind += 1; // Advance the index for the next dequeue.

          return t; // Return the dequeued item.
        }

        /**
         * Clears all items from the queue and resets its state.
         */
        clear() {
          this.items = []; // Empty the items array.
          this.size = 0; // Reset size to zero.
          this.ind = 0; // Reset index to zero.
        }
      };
    },

    /*
     * Module 5: Main algorithmic logic.
     * This module contains the core computation based on the input.
     */
    function (
      t, // module object (not used directly here)
      e, // exports object (not used directly here)
      r // require function (not used directly here)
    ) {
      "use strict"; // Enable strict mode.

      /**
       * Exports the main function that performs the algorithm.
       * @param {object} t - An instance of the InputReader class.
       */
      t.exports = function (
        t // InputReader instance.
      ) {
        // Read the first integer, which is the count 'e'.
        for (
          var e = t.in(),

            // Initialize an array 'r' to store 'e' numbers.
            r = new Array(e),

            // Loop counter 'n'.
            n = 0; n < e; n++
        ) {
          // Populate the array 'r' with subsequent integers from input.
          r[n] = t.in();
        }

        // Initialize two arrays 'i' (max values) and 'o' (min values)
        // with size 'e + 1' for dynamic programming / backward iteration.
        var i = new Array(e + 1),
          o = new Array(e + 1);

        // Set base cases for the last element (index 'e').
        // These values seem to be initial bounds or sentinel values.
        i[e] = 2; // Max value for the last segment.
        o[e] = 2; // Min value for the last segment.

        // Iterate backwards from 'e - 1' down to 0.
        for (var s = e - 1; s >= 0; s--) {
          // Calculate 'u' based on the current number 'r[s]' and the next max value 'i[s+1]'.
          // 'u' is effectively the smallest multiple of 'r[s]' that is greater than 'i[s+1]'.
          for (var u = r[s]; u <= i[s + 1];) {
            u += r[s];
          }

          // Calculate 'i[s]' (maximum value for the current segment) and 'o[s]' (minimum value).
          // 'i[s]' is one less than 'u'.
          i[s] = u - 1;
          // 'o[s]' is 'u' minus the current number 'r[s]'.
          o[s] = u - r[s];

          // Check for invalid conditions:
          // 1. If the calculated maximum 'i[s]' is less than the current number 'r[s]'.
          // 2. If the calculated minimum 'o[s]' is greater than the calculated maximum 'i[s]'.
          if (i[s] < r[s] || o[s] > i[s]) {
            // If any condition is met, output -1 and terminate.
            return void console.log(-1);
          }
        }

        // If all conditions are met, output the final minimum and maximum values
        // for the first segment (index 0).
        console.log(`${o[0]} ${i[0]}`);
      };
    }
  ]
);
// End of bundled application.