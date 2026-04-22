module.exports = function (t) {
  // This is a self-executing function that sets up a module loading system.
  // It's a common pattern seen in bundled JavaScript files (e.g., from webpack).

  // e: This object serves as the module cache.
  // It stores already loaded modules to prevent redundant execution.
  var e = {};

  // r: This is the custom 'require' function for this module system.
  function r(n) {
    // Check if the module with ID 'n' is already in the cache.
    if (e[n]) {
      // If found, return its exports immediately.
      return e[n].exports;
    }

    // If the module is not in the cache, create a new module entry.
    // i: This variable represents the module object itself.
    var i = e[n] = {
      i: n,        // The module ID (identifier).
      l: false,    // A flag indicating if the module has been loaded (false initially).
      exports: {}  // The object that will hold the module's exports.
    };

    // Execute the module's code.
    // The module function (t[n]) is called with 'i.exports' as 'this' context,
    // and 'i', 'i.exports', and the 'r' (require) function as arguments.
    t[n].call(i.exports, i, i.exports, r);

    // After execution, mark the module as loaded.
    i.l = true;

    // Return the populated exports object of the module.
    return i.exports;
  }

  // r.m: Stores the module definitions (the 't' array passed to the outer function).
  // This is where all the actual module code resides.
  r.m = t;

  // r.c: Stores a reference to the module cache (the 'e' object).
  r.c = e;

  // r.d: A helper function to define a getter property on an object.
  // This is used for defining exports that are lazily evaluated.
  r.d = function (t, e, n) {
    // Check if the property 'e' already exists on object 't'.
    if (!r.o(t, e)) {
      // If it doesn't exist, define it using Object.defineProperty.
      Object.defineProperty(t, e, {
        enumerable: true, // Make the property enumerable (visible in for...in loops).
        get: n            // The getter function that provides the property's value.
      });
    }
  };

  // r.r: A helper function to mark an exports object as an ECMAScript module.
  // This adds special properties to enable better interoperability.
  r.r = function (t) {
    // If Symbol and Symbol.toStringTag are available in the environment,
    // define Symbol.toStringTag on the exports object.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(t, Symbol.toStringTag, {
        value: "Module"
      });
    }
    // Always define the __esModule property to true, indicating it's an ES module.
    Object.defineProperty(t, "__esModule", {
      value: true
    });
  };

  // r.t: A complex helper for creating a namespace object for module exports.
  // It handles various module types (CommonJS, ES Modules) and their interop.
  r.t = function (t, e) {
    // Bit 0 (1): If set, 't' is a module ID, so require it first.
    if (1 & e) {
      t = r(t);
    }
    // Bit 3 (8): If set, 't' is already a namespace object, return it directly.
    if (8 & e) {
      return t;
    }
    // Bit 2 (4): If set, and 't' is an object marked as an ES module, return it directly.
    if (4 & e && typeof t === "object" && t && t.__esModule) {
      return t;
    }

    // Otherwise, create a new plain object to serve as the namespace.
    var n = Object.create(null);

    // Mark the new namespace object as an ES module.
    r.r(n);

    // Define a 'default' export on the namespace object, pointing to 't'.
    Object.defineProperty(n, "default", {
      enumerable: true,
      value: t
    });

    // Bit 1 (2): If set, and 't' is not a string,
    // iterate over its properties and re-export them on the new namespace.
    if (2 & e && typeof t !== "string") {
      for (var i in t) {
        // Use r.d to define each property with a getter function.
        r.d(n, i, function (e) {
          return t[e];
        }.bind(null, i)); // The bind ensures 'i' is captured for the getter.
      }
    }
    return n;
  };

  // r.n: A helper function to create a getter for a module's 'default' export.
  // This is for compatibility, allowing access to 'default' even if not explicitly defined.
  r.n = function (t) {
    // If 't' is an ES module (has __esModule), the getter returns 't.default'.
    var e = t && t.__esModule ?
      function () {
        return t.default;
      } :
      // Otherwise, the getter simply returns 't' itself.
      function () {
        return t;
      };

    // Define an 'a' property on the getter function itself, which is the getter.
    // This is often used to quickly get the main export.
    r.d(e, "a", e);

    return e;
  };

  // r.o: A wrapper for Object.prototype.hasOwnProperty.call.
  // Used to safely check if an object 't' has a direct property 'e'.
  r.o = function (t, e) {
    return Object.prototype.hasOwnProperty.call(t, e);
  };

  // r.p: The public path for assets (e.g., for dynamically loaded chunks).
  // In this case, it's an empty string, meaning relative paths.
  r.p = "";

  // The entry point of the application.
  // It sets module 1 as the starting module (r.s = 1) and then immediately requires it.
  return r(r.s = 1);
}(
  // This array contains all the module definitions.
  // Each element is a function representing a module.
  [
    /* Module 0 */
    function (t, e, r) {
      "use strict";

      // This module exports a custom class that behaves like a queue or an array wrapper.
      // It manages a collection of items and an index for sequential access.
      t.exports = class {
        /**
         * Constructor for the custom data structure.
         * Initializes the collection with an optional array of items.
         *
         * @param {Array} t - An array of initial items (optional).
         */
        constructor(t) {
          // Safely get the initial items from arguments, defaulting to an empty array.
          var initialItems = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
          this.size = initialItems.length; // Current number of items.
          this.items = initialItems;       // The underlying array storing items.
          this.ind = 0;                    // Index for the next item to dequeue.
        }

        /**
         * Enqueues an item by adding it to the end of the collection.
         *
         * @param {*} t - The item to be added.
         */
        enq(t) {
          this.size += 1;      // Increment the size.
          this.items.push(t);  // Add the item to the end of the array.
        }

        /**
         * Dequeues an item by retrieving it from the current 'ind' position
         * and advancing the index.
         *
         * @returns {*} The item that was dequeued.
         */
        deq() {
          var t = this.items[this.ind]; // Get the item at the current index.
          this.size -= 1;               // Decrement the size.
          this.ind += 1;                // Advance the index for the next dequeue.
          return t;                     // Return the dequeued item.
        }

        /**
         * Clears all items from the collection and resets its state.
         */
        clear() {
          this.items = []; // Empty the items array.
          this.size = 0;   // Reset the size to zero.
          this.ind = 0;    // Reset the dequeue index.
        }
      };
    },

    /* Module 1 */
    function (t, e, r) {
      "use strict";

      // This is the main entry point module for the application logic.
      // It reads input from standard input and passes it to the processing module.

      // Require Module 2, which exports the Node.js 'fs' (file system) module.
      var n = r(2);

      // Require Module 3 and immediately invoke it.
      // The argument passed to Module 3 is the content read from /dev/stdin.
      // The input is read synchronously and decoded as UTF-8.
      r(3)(n.readFileSync("/dev/stdin", "utf8"));
    },

    /* Module 2 */
    function (t, e) {
      // This module simply exports the native Node.js 'fs' (file system) module.
      // This allows other modules to interact with the file system.
      t.exports = require("fs");
    },

    /* Module 3 */
    function (t, e, r) {
      "use strict";

      // This module acts as an orchestrator, setting up the input parser
      // and then initiating the main processing logic.

      // Require Module 4, which exports the InputParser class.
      var n = r(4);

      // Require Module 5, which contains the primary algorithm/processing logic.
      var i = r(5);

      // This module exports a function that takes a raw input string.
      t.exports = function (t) {
        // Create a new instance of the InputParser, initialized with the provided string.
        var e = new n(t);

        // Pass the initialized input parser to the main processing function (Module 5).
        i(e);
      };
    },

    /* Module 4 */
    function (t, e, r) {
      "use strict";

      // This module exports a class responsible for parsing input data.
      // It uses the custom queue-like structure from Module 0 to manage tokens.

      // Require Module 0, which exports the custom queue/array wrapper class.
      var n = r(0);

      // This module exports the InputParser class.
      t.exports = class {
        /**
         * Constructor for the InputParser.
         *
         * @param {string} t - The raw input string to be parsed.
         */
        constructor(t) {
          // Trim leading/trailing whitespace from the input string.
          // Split the string into an array of tokens using one or more whitespace characters as delimiters.
          var e = t.trim().split(/\s+/g);

          // Initialize an internal queue (using Module 0's class) with these tokens.
          this.inp = new n(e);
        }

        /**
         * Reads and returns the next raw string token from the input queue.
         *
         * @returns {string} The next token as a string.
         */
        inr() {
          return this.inp.deq();
        }

        /**
         * Reads the next string token and attempts to parse it as an integer (base 10).
         *
         * @returns {number} The next token as an integer.
         */
        in() {
          return parseInt(this.inp.deq(), 10);
        }

        /**
         * Clears the internal input queue, effectively resetting the parser.
         */
        fin() {
          this.inp.clear();
        }
      };
    },

    /* Module 5 */
    function (t, e, r) {
      "use strict";

      // This module contains the primary algorithm or data processing logic
      // based on the input provided by the InputParser.

      // Although Module 0 is required here, its exports are not directly used in this module's scope.
      // It might be a transitive dependency or included for other reasons.
      r(0);

      // This module exports a function that takes an InputParser instance.
      t.exports = function (t) {
        // Read the first integer from the input; typically represents the number of elements or nodes.
        for (
          var e = t.in(),
            // 'r': An array initialized with 'e' zeros. Could represent degrees, counts, or flags.
            r = new Array(e).fill(0),
            // 'n': Another array initialized with 'e' zeros. Used for tracking state or values.
            n = new Array(e).fill(0),
            // 'i': An array to store results, sized for 'e-1' elements.
            i = new Array(e - 1),
            // 'o': A variable to keep track of a maximum value found during processing.
            o = 0,
            // Loop counter.
            s = 0;

          // The loop runs 'e-1' times. This often suggests processing edges in a graph
          // or pairs of elements.
          s < e - 1;

          s++
        ) {
          // Read two integers from the input and convert them to 0-based indexing.
          var u = t.in() - 1,
            c = t.in() - 1;

          // Increment the counter/value at index 'u' in array 'r'.
          r[u]++;

          // This is a specific condition: if r[u] equals n[u], increment r[u] again.
          // This logic is crucial and highly specific to the problem being solved.
          if (r[u] == n[u]) {
            r[u]++;
          }

          // Update 'o' to be the maximum of its current value and the current r[u].
          o = Math.max(o, r[u]);

          // Assign the current value of r[u] to n[c].
          n[c] = r[u];

          // Store the current value of r[u] in the 'i' array at the current loop index.
          i[s] = r[u];
        }

        // After the loop, print the final maximum value found ('o').
        console.log(o);

        // Iterate through the 'i' array and print each stored value.
        // These are likely the results or intermediate values collected during the loop.
        for (var l = 0; l < e - 1; l++) {
          console.log(i[l]);
        }
      };
    }
  ]
);