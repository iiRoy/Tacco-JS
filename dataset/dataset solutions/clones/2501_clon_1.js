/*
 * This is the main entry point for the bundled application.
 * It sets up a custom module loading system, similar to Webpack's,
 * designed to bundle multiple JavaScript modules into a single file.
 *
 * The 't' parameter represents an array of module definitions,
 * where each element is a function corresponding to a module.
 */
module.exports = function (t) {

  // 'r' acts as a cache for loaded modules.
  // When a module is loaded, its exports are stored here to prevent
  // redundant execution and ensure singletons.
  var r = {};


  /**
   * The core module loading function.
   * This function is responsible for finding, executing, and caching modules.
   *
   * @param {number} n The module ID (index in the 't' array) to load.
   * @returns {object} The exports object of the loaded module.
   */
  function e(n) {
    // If the module is already in the cache, return its existing exports.
    if (r[n]) {
      return r[n].exports;
    }

    // If not, create a new module entry in the cache.
    // 'i' represents the module object itself, containing metadata
    // and the exports object.
    var i = r[n] = {
      i: n,        // The module's unique ID.
      l: !1,       // A flag indicating if the module has been loaded (initially false).
      exports: {}  // The object that will contain the module's exports.
    };

    // Execute the module function. The module function typically receives
    // (module, module.exports, require_function).
    // The 'this' context is set to 'i.exports' for compatibility.
    t[n].call(i.exports, i, i.exports, e);

    // After execution, mark the module as loaded.
    i.l = !0;

    // Return the module's exports.
    return i.exports;
  }


  // --- Public API of the module loader ---

  // Expose the module definitions array.
  e.m = t;

  // Expose the module cache.
  e.c = r;


  /**
   * Defines a getter function for a module export.
   * This is primarily used for compatibility with ES modules, allowing
   * properties to be defined on the exports object with custom getter logic.
   *
   * @param {object} t The target exports object.
   * @param {string} r The name of the property to define.
   * @param {function} n The getter function for the property.
   */
  e.d = function (t, r, n) {
    // Only define the property if it doesn't already exist on the object.
    if (!e.o(t, r)) {
      Object.defineProperty(t, r, {
        enumerable: !0, // Make the property enumerable (visible in for...in loops).
        get: n         // Assign the provided function as the getter.
      });
    }
  };


  /**
   * Marks an exports object as an ES module.
   * This adds specific properties to the module's exports object
   * to indicate its ES module status, which is important for
   * interoperability with native ES module loaders.
   *
   * @param {object} t The exports object to mark as an ES module.
   */
  e.r = function (t) {
    // Add Symbol.toStringTag for better module identification in console.
    // This makes `Object.prototype.toString.call(module)` return "[object Module]".
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(t, Symbol.toStringTag, {
        value: "Module"
      });
    }
    // Set the __esModule flag to true, a common convention
    // to indicate that an object is an ES module.
    Object.defineProperty(t, "__esModule", {
      value: !0
    });
  };


  /**
   * Creates a namespace object for module imports.
   * This function handles various module types (ES module, CommonJS, etc.)
   * and provides a consistent interface for accessing their exports,
   * especially the 'default' export.
   *
   * @param {any} t The module or its ID to process.
   * @param {number} r Flags indicating how to handle the module (bitmask).
   *                   - 1: If the module ID is passed, load it.
   *                   - 8: If 't' is already a namespace object, return it as is.
   *                   - 4: If 't' is an object and already an ES module, return it.
   *                   - 2: If 't' is a non-string and not an ES module, copy all its properties.
   * @returns {object} The created (or original) namespace object.
   */
  e.t = function (t, r) {
    // Flag 1: If 'r' has the 1st bit set, 't' is a module ID, so load it.
    if (1 & r && (t = e(t)));

    // Flag 8: If 'r' has the 8th bit set, 't' is already a namespace object.
    // No further processing needed, just return it.
    if (8 & r) {
      return t;
    }

    // Flag 4: If 'r' has the 4th bit set, and 't' is an object that
    // is already marked as an ES module, return it directly.
    if (4 & r && typeof t === "object" && t && t.__esModule) {
      return t;
    }

    // Create a new empty namespace object.
    var n = Object.create(null);

    // Mark the newly created object as an ES module.
    e.r(n);

    // Define the 'default' export on the namespace object.
    // This ensures that CommonJS modules can be imported with a default.
    Object.defineProperty(n, "default", {
      enumerable: !0,
      value: t
    });

    // Flag 2: If 'r' has the 2nd bit set and 't' is not a string,
    // iterate over all properties of 't' and define them as getters
    // on the new namespace object. This is for compatibility with
    // non-ES modules that have named exports.
    if (2 & r && typeof t !== "string") {
      for (var i in t) {
        e.d(n, i, function (r) {
          return t[r];
        }.bind(null, i));
      }
    }
    return n;
  };


  /**
   * Helper to create a getter for the 'default' export of a module.
   * This is used for the `e.n` function which helps in creating
   * interop getters for modules.
   *
   * @param {object} t The module object.
   * @returns {function} A getter function that returns the module's default export
   *                     or the module itself if it's not an ES module.
   */
  e.n = function (t) {
    var r = t && t.__esModule ? // Check if it's an ES module.
      function () {
        return t.default; // If yes, return its 'default' export.
      } :
      function () {
        return t; // If no, return the module object itself.
      };
    // Define a getter property 'a' on the 'r' function itself,
    // which returns 'r'. This is a Webpack-specific convention.
    e.d(r, "a", r);
    return r;
  };


  /**
   * Checks if an object has a specified property directly on itself (not inherited).
   * This is a wrapper around `Object.prototype.hasOwnProperty.call`.
   *
   * @param {object} t The object to check.
   * @param {string} r The name of the property to look for.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  e.o = function (t, r) {
    return Object.prototype.hasOwnProperty.call(t, r);
  };


  // Public path for assets (e.g., for dynamically loaded chunks).
  // In this bundled context, it's often an empty string.
  e.p = "";


  // --- Entry Point ---
  // Start the application by loading the entry module, which is module 0.
  // The 'e.s' property is set to 0 to indicate the startup module ID.
  return e(e.s = 0);

}(
  // --- Array of Module Definitions ---
  // Each function in this array corresponds to a module.
  // The parameters (t, r, e) typically map to (module, exports, require_function).

  [
    /*
     * Module 0: Main Application Entry Point
     * This module reads input from standard input and orchestrates the main logic.
     */
    function (t, r, e) {
      "use strict"; // Enforce strict mode for cleaner code.

      // Require module 1, which provides the Node.js 'fs' (file system) module.
      var n = e(1);

      // Require module 2, which is the main input processing and solver.
      // Then immediately call it with the content read from /dev/stdin.
      // The input is read synchronously and decoded as UTF-8.
      e(2)(n.readFileSync("/dev/stdin", "utf8"));
    },


    /*
     * Module 1: File System Module Wrapper
     * This module simply exports the native Node.js 'fs' module.
     */
    function (t, r) {
      t.exports = require("fs"); // Export the built-in 'fs' module.
    },


    /*
     * Module 2: Input Processing and Main Solver Orchestrator
     * This module takes raw input, creates an input reader, and then
     * passes the reader to the core solver logic.
     */
    function (t, r, e) {
      "use strict";

      // Require module 3, which defines the 'InputReader' class.
      var n = e(3),
        // Require module 5, which contains the main graph-related solver function.
        i = e(5);

      // Export a function that serves as the entry point for this part of the logic.
      // It takes the raw input string.
      t.exports = function (t) {
        // Create a new instance of the InputReader, initialized with the raw input.
        var r = new n(t);

        // Call the main solver function, passing it the InputReader instance.
        i(r);
      };
    },


    /*
     * Module 3: InputReader Class
     * Provides methods to parse and consume input tokens from a string.
     */
    function (t, r, e) {
      "use strict";

      // Require module 4, which defines a simple 'Queue' class.
      var n = e(4);

      // Export the InputReader class.
      t.exports = class {
        /**
         * Constructor for InputReader.
         * @param {string} t The raw input string.
         */
        constructor(t) {
          // Trim whitespace from the input string and split it into tokens
          // based on any sequence of whitespace characters.
          var r = t.trim().split(/\s+/g);

          // Initialize an internal queue (using the Queue class from module 4)
          // with the parsed input tokens.
          this.inp = new n(r);
        }

        /**
         * Dequeues and returns the next raw string token from the input.
         * @returns {string} The next input token as a string.
         */
        inr() {
          return this.inp.deq();
        }

        /**
         * Dequeues the next token, parses it as an integer, and returns it.
         * The radix (base) is explicitly set to 10 for decimal parsing.
         * @returns {number} The next input token as an integer.
         */
        in() {
          return parseInt(this.inp.deq(), 10);
        }

        /**
         * Clears the internal input buffer (queue).
         */
        fin() {
          this.inp.clear();
        }
      };
    },


    /*
     * Module 4: Queue Class
     * A basic implementation of a queue data structure.
     */
    function (t, r, e) {
      "use strict";

      // Export the Queue class.
      t.exports = class {
        /**
         * Constructor for Queue.
         * @param {Array} [t=[]] An optional initial array of items to populate the queue.
         */
        constructor() {
          // Use a default empty array if no initial items are provided.
          var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];

          this.size = t.length; // Current number of items in the queue.
          this.items = t;       // The underlying array storing the queue items.
          this.ind = 0;         // The index of the next item to be dequeued.
        }

        /**
         * Adds an item to the end of the queue.
         * @param {any} t The item to enqueue.
         */
        enq(t) {
          this.size += 1;      // Increment the size.
          this.items.push(t);  // Add the item to the end of the array.
        }

        /**
         * Removes and returns the item from the front of the queue.
         * @returns {any} The dequeued item.
         */
        deq() {
          var t = this.items[this.ind]; // Get the item at the current dequeue index.
          this.size -= 1;               // Decrement the size.
          this.ind += 1;                // Advance the dequeue index.
          return t;                     // Return the dequeued item.
        }

        /**
         * Clears all items from the queue, resetting its state.
         */
        clear() {
          this.items = []; // Reset the items array.
          this.size = 0;   // Reset the size.
          this.ind = 0;    // Reset the dequeue index.
        }
      };
    },


    /*
     * Module 5: Main Solver Logic (Graph Processing)
     * This module implements the core logic for solving a graph problem,
     * likely involving shortest paths with specific conditions.
     */
    function (t, r, e) {
      "use strict";

      // Require module 6, which provides the Floyd-Warshall algorithm implementation.
      var n = e(6);

      // Export the main solver function, which takes an InputReader instance.
      t.exports = function (t) {

        // Read graph parameters from the input:
        // r: Number of nodes in the graph.
        // e: Number of initial edges.
        // i: Maximum allowed distance for a "fast" connection.
        var r = t.in(),
          e = t.in(),
          i = t.in();

        // Initialize an adjacency matrix 'o'.
        // It's filled with a large number (representing infinity) to denote
        // no direct connection, or a very high cost.
        var o = new Array(r);
        for (var s = 0; s < r; s++) {
          o[s] = new Array(r).fill(9999999999);
        }

        // Read initial edges and populate the adjacency matrix.
        for (var u = 0; u < e; u++) {
          var c = t.in(), // First node of the edge.
            f = t.in(), // Second node of the edge.
            a = t.in(); // Weight (cost) of the edge.

          // Adjust node indices from 1-based to 0-based.
          // The graph is undirected, so update both (c,f) and (f,c).
          o[c - 1][f - 1] = a;
          o[f - 1][c - 1] = a;
        }

        // --- First Pass: Calculate all-pairs shortest paths for original weights ---
        // 'l' will store the shortest path distances based on the initial edge weights.
        var l = n(o);


        // --- Transform Graph Based on 'i' (Max Allowed Distance) ---
        // Iterate through all pairs of nodes. If the shortest path between
        // them (from 'l') is less than or equal to 'i', then consider
        // them to have a "fast" connection with a cost of 1.
        // Otherwise, keep the original "infinity" value.
        for (var p = 0; p < r; p++) {
          for (var v = 0; v < r; v++) {
            if (l[p][v] <= i) {
              o[p][v] = 1; // Mark as connected with cost 1 if reachable within 'i'.
            }
          }
        }

        // --- Second Pass: Calculate all-pairs shortest paths for transformed weights ---
        // 'd' will store the shortest path distances based on the new "fast" connection costs.
        // This essentially finds the minimum number of "hops" where each hop is a path
        // that originally had a length of at most 'i'.
        var d = n(o);


        // Read the number of queries.
        var h = t.in();

        // Process each query.
        for (var y = 0; y < h; y++) {
          var b = t.in(), // Start node for the current query.
            g = t.in(), // End node for the current query.
            m = d[b - 1][g - 1]; // Get the shortest "hop" distance from the 'd' matrix.

          // If the distance is still the "infinity" value, it means the nodes are unreachable.
          if (9999999999 == m) {
            console.log(-1); // Output -1 for unreachable.
          } else {
            // Otherwise, output the distance minus 1.
            // (The problem statement likely requires this adjustment, e.g., if 1 hop is 0 output).
            console.log(m - 1);
          }
        }
      };
    },


    /*
     * Module 6: Floyd-Warshall Algorithm Implementation
     * Computes all-pairs shortest paths in a given weighted, directed graph.
     */
    function (t, r, e) {
      "use strict";

      // Export the Floyd-Warshall function.
      // It takes an adjacency matrix 't' as input.
      t.exports = function (t) {
        var r = t.length; // 'r' represents the number of nodes in the graph.
        var e = [];       // 'e' will be the resulting distance matrix.

        // Create a deep copy of the input adjacency matrix 't' into 'e'.
        // This is crucial to avoid modifying the original input matrix.
        for (var n = 0; n < r; n++) {
          e.push(t[n].concat()); // .concat() creates a shallow copy of the inner array.
        }

        // --- Main Floyd-Warshall Triple Loop ---
        // This algorithm iterates through all possible intermediate nodes.
        // 'i' represents the intermediate node (k in standard notation).
        for (var i = 0; i < r; i++) {
          // 'o' represents the source node (i in standard notation).
          for (var o = 0; o < r; o++) {
            // 's' represents the destination node (j in standard notation).
            for (var s = 0; s < r; s++) {
              // If the path from 'o' to 's' through 'i' is shorter
              // than the currently known shortest path, update it.
              if (e[o][s] > e[o][i] + e[i][s]) {
                e[o][s] = e[o][i] + e[i][s];
              }
            }
          }
        }
        return e; // Return the matrix containing all-pairs shortest paths.
      };
    }
  ]
);