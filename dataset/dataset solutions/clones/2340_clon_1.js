module.exports = function (t) {
  // This is the cache for loaded modules.
  var i = {};

  /**
   * Webpack's custom require function.
   * It loads modules, caches them, and handles their exports.
   * @param {string} e - The module ID to load.
   * @returns {*} The exports of the requested module.
   */
  function r(e) {
    // If the module is already in the cache, return its exports.
    if (i[e]) {
      return i[e].exports;
    }

    // If not, create a new module entry in the cache.
    // 'n' represents the module object.
    var n = i[e] = {
      i: e, // Module ID
      l: !1, // Loaded flag, initially false
      exports: {} // The exports object for the module
    };

    // Call the module function with the correct context.
    // 't[e]' is the module function itself.
    // 'n.exports' is the module's exports object.
    // 'r' is the local require function for this module.
    t[e].call(
      n.exports,
      n,
      n.exports,
      r
    );

    // Mark the module as loaded.
    n.l = !0;

    // Return the module's exports.
    return n.exports;
  }

  // --- Webpack Runtime Helper Functions ---

  // Store the modules object for later use.
  r.m = t;

  // Store the module cache.
  r.c = i;

  /**
   * Define property getter for compatibility.
   * This is used to define getters on the exports object.
   * @param {object} t - The exports object.
   * @param {string} i - The property name.
   * @param {function} e - The getter function.
   */
  r.d = function (t, i, e) {
    // Only define if the property doesn't already exist.
    if (
      !r.o(t, i)
    ) {
      Object.defineProperty(
        t,
        i,
        {
          enumerable: !0,
          get: e
        }
      );
    }
  };

  /**
   * Define __esModule on exports.
   * This marks a module as an ES module.
   * @param {object} t - The exports object.
   */
  r.r = function (t) {
    if (
      "undefined" != typeof Symbol &&
      Symbol.toStringTag
    ) {
      Object.defineProperty(
        t,
        Symbol.toStringTag,
        {
          value: "Module"
        }
      );
    }

    Object.defineProperty(
      t,
      "__esModule",
      {
        value: !0
      }
    );
  };

  /**
   * Create a namespace object for module.
   * This handles interop between CommonJS and ES modules.
   * @param {*} t - The module or its exports.
   * @param {number} i - Flags indicating how to handle the module.
   * @returns {object} The namespace object.
   */
  r.t = function (t, i) {
    // If flag 1 is set, treat 't' as a module ID and require it.
    if (1 & i) {
      t = r(t);
    }

    // If flag 8 is set, return 't' as is.
    if (8 & i) {
      return t;
    }

    // If flag 4 is set, and 't' is an object and an ES module, return it.
    if (
      4 & i &&
      "object" == typeof t &&
      t &&
      t.__esModule
    ) {
      return t;
    }

    // Create a new empty object for the namespace.
    var e = Object.create(null);

    // Mark it as an ES module.
    r.r(e);

    // Define 'default' property pointing to 't'.
    Object.defineProperty(
      e,
      "default",
      {
        enumerable: !0,
        value: t
      }
    );

    // If flag 2 is set and 't' is not a string,
    // copy all properties from 't' to the namespace object.
    if (
      2 & i &&
      "string" != typeof t
    ) {
      for (
        var n in t
      ) {
        r.d(
          e,
          n,
          function (i) {
            return t[i];
          }.bind(null, n)
        );
      }
    }

    return e;
  };

  /**
   * Get default export from module.
   * This creates a getter for the default export.
   * @param {*} t - The module exports.
   * @returns {function} A getter function for the default export.
   */
  r.n = function (t) {
    var i = t && t.__esModule ?
      function () {
        return t.default;
      } :
      function () {
        return t;
      };

    // Define a property 'a' on the getter function itself, which is the getter.
    r.d(
      i,
      "a",
      i
    );

    return i;
  };

  /**
   * Check if an object has a property.
   * This is a polyfill for Object.prototype.hasOwnProperty.call.
   * @param {object} t - The object to check.
   * @param {string} i - The property name.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  r.o = function (t, i) {
    return Object.prototype.hasOwnProperty.call(t, i);
  };

  // Public path for assets (empty in this case).
  r.p = "";

  // Load the entry module (module 0) and execute it.
  return r(r.s = 0);

}(
  // Array of modules, where each element is a module function.
  [
    /* Module 0: Main entry point */
    function (t, i, r) {
      "use strict"; // Enable strict mode for this module.

      // Require module 1 (filesystem module).
      var e = r(1);

      // Require module 2 (main logic), and immediately call it
      // with the content of /dev/stdin read as UTF-8.
      r(2)(
        e.readFileSync(
          "/dev/stdin",
          "utf8"
        )
      );
    },

    /* Module 1: Node.js 'fs' module */
    function (t, i) {
      // Export the native 'fs' module.
      t.exports = require("fs");
    },

    /* Module 2: Main processing logic wrapper */
    function (t, i, r) {
      "use strict"; // Enable strict mode.

      // Require module 3 (InputReader class).
      var e = r(3);

      // Require module 5 (BFS algorithm logic).
      var n = r(5);

      /**
       * Exports a function that processes the input string.
       * @param {string} t - The input string.
       */
      t.exports = function (t) {
        // Create a new InputReader instance with the input string.
        var i = new e(t);

        // Call the BFS algorithm function with the InputReader instance.
        n(i);
      };
    },

    /* Module 3: InputReader class */
    function (t, i, r) {
      "use strict"; // Enable strict mode.

      // Require module 4 (Queue/ArrayWrapper class).
      var e = r(4);

      /**
       * InputReader class to parse and consume input tokens.
       */
      t.exports = class {
        /**
         * Constructor for InputReader.
         * @param {string} t - The raw input string.
         */
        constructor(t) {
          // Trim whitespace and split the input string by any whitespace
          // to get an array of tokens.
          var i = t.trim().split(/\s+/g);

          // Initialize an internal queue (ArrayWrapper) with these tokens.
          this.inp = new e(i);
        }

        /**
         * Reads and returns the next raw input token (string).
         * @returns {string} The next token.
         */
        inr() {
          return this.inp.deq();
        }

        /**
         * Reads the next input token and parses it as an integer.
         * @returns {number} The next token as an integer.
         */
        in() {
          return parseInt(
            this.inp.deq(),
            10
          );
        }

        /**
         * Clears all remaining input tokens.
         */
        fin() {
          this.inp.clear();
        }
      };
    },

    /* Module 4: ArrayWrapper (Queue-like structure) */
    function (t, i, r) {
      "use strict"; // Enable strict mode.

      /**
       * A simple class that acts like a queue, wrapping an array.
       */
      t.exports = class {
        /**
         * Constructor for ArrayWrapper.
         * @param {Array<any>} [t=[]] - Initial array of items.
         */
        constructor() {
          // Use arguments to allow optional initial array.
          // If no argument or undefined, default to an empty array.
          var t = arguments.length > 0 && void 0 !== arguments[0] ?
            arguments[0] :
            [];

          // Current size of the active queue.
          this.size = t.length;

          // The underlying array holding the items.
          this.items = t;

          // Index of the next item to dequeue.
          this.ind = 0;
        }

        /**
         * Enqueues an item to the end of the queue.
         * @param {*} t - The item to add.
         */
        enq(t) {
          this.size += 1;
          this.items.push(t);
        }

        /**
         * Dequeues an item from the front of the queue.
         * @returns {*} The item removed from the front.
         */
        deq() {
          // Get the item at the current index.
          var t = this.items[this.ind];

          // Decrement size and advance index.
          this.size -= 1;
          this.ind += 1;

          return t;
        }

        /**
         * Clears the queue, resetting its state.
         */
        clear() {
          this.items = [];
          this.size = 0;
          this.ind = 0;
        }
      };
    },

    /* Module 5: BFS Algorithm for pathfinding */
    function (t, i, r) {
      "use strict"; // Enable strict mode.

      /**
       * Solves a graph problem using BFS to find distances.
       * @param {object} t - An instance of InputReader.
       */
      t.exports = function (t) {
        // Read graph parameters:
        // i: number of nodes
        // r: starting node for T (minus 1 for 0-indexed)
        // e: starting node for A (minus 1 for 0-indexed)
        var i = t.in(),
          r = t.in() - 1,
          e = t.in() - 1;

        // n: Adjacency list for the graph.
        // s: Array to store visited status and distances for each node.
        var n = new Array(i),
          s = new Array(i);

        // Initialize adjacency lists and node status/distance objects.
        for (
          var o = 0; o < i; o++
        ) {
          n[o] = []; // Each node gets an empty adjacency list.
          s[o] = {
            visT: 0, // Visited status for BFS from T (0: unvisited, 1: visited)
            visA: 0, // Visited status for BFS from A
            disT: -1, // Distance from T (-1: unreachable)
            disA: -1 // Distance from A
          };
        }

        // Read edges and build the adjacency list for an undirected graph.
        for (
          var u = 0; u < i - 1; u++
        ) {
          // Read two connected nodes (and convert to 0-indexed).
          var a = t.in() - 1,
            d = t.in() - 1;

          // Add edges to both nodes' adjacency lists.
          n[a].push(d);
          n[d].push(a);
        }

        // --- BFS from node 'e' (for character A) ---

        // Initialize starting node 'e' for BFS_A.
        s[e].visA = 1; // Mark as visited.
        s[e].disA = 0; // Distance from itself is 0.

        // Initialize a queue for BFS_A with the starting node.
        for (
          var c = [{
            v: e,
            dis: 0
          }]; c.length > 0;
        ) {
          // Dequeue the current node and its distance.
          var f = c.pop();

          // Get neighbors of the current node.
          var v = n[f.v];

          // Iterate through all neighbors.
          for (
            var l = 0; l < v.length; l++
          ) {
            var p = v[l]; // Current neighbor node.

            // If the neighbor has not been visited by BFS_A.
            if (
              1 != s[p].visA
            ) {
              // Mark as visited by BFS_A.
              s[p].visA = 1;

              // Set its distance from 'e'.
              s[p].disA = f.dis + 1;

              // Enqueue the neighbor for further exploration.
              c.push({
                v: p,
                dis: f.dis + 1
              });
            }
          }
        }

        // --- BFS from node 'r' (for character T) ---

        // Initialize starting node 'r' for BFS_T.
        s[r].visT = 1; // Mark as visited.
        s[r].disT = 0; // Distance from itself is 0.

        // Initialize a queue for BFS_T with the starting node.
        for (
          var h = [{
            v: r,
            dis: 0
          }]; h.length > 0;
        ) {
          // Dequeue the current node and its distance.
          var m = h.pop();

          // Get neighbors of the current node.
          var y = n[m.v];

          // Iterate through all neighbors.
          for (
            var g = 0; g < y.length; g++
          ) {
            var b = y[g]; // Current neighbor node.

            // If the neighbor has not been visited by BFS_T.
            if (
              1 != s[b].visT
            ) {
              // Mark as visited by BFS_T.
              s[b].visT = 1;

              // Set its distance from 'r'.
              s[b].disT = m.dis + 1;

              // Enqueue the neighbor for further exploration.
              h.push({
                v: b,
                dis: m.dis + 1
              });
            }
          }
        }

        // --- Calculate the maximum distance ---

        // x: Stores the maximum distance for nodes where T is closer than A.
        // T: Stores the minimum distance for nodes where T and A are equidistant.
        // A: Flag to check if any node exists where T and A are equidistant.
        var x = 0,
          T = 99999999999, // Initialize with a very large number.
          A = !1; // Boolean flag, initially false.

        // Iterate through all nodes to find the optimal meeting point.
        for (
          var j = 0; j < i; j++
        ) {
          // If T can reach a node 'j' faster than A can.
          if (
            s[j].disT - s[j].disA < 0
          ) {
            // Update 'x' with the maximum distance T can travel
            // to such a node.
            var M = s[j].disT;
            x = Math.max(
              M,
              x
            );
          }

          // If T and A can reach a node 'j' in the same number of steps.
          if (
            s[j].disT - s[j].disA == 0
          ) {
            // Set the flag to true.
            A = !0;

            // Update 'T' with the minimum distance among such nodes.
            T = Math.min(
              T,
              s[j].disT
            );
          }
        }

        // Calculate the final result:
        // If there's at least one node where T and A are equidistant,
        // the answer is the maximum of 'x' (T is closer) and 'T' (equidistant).
        // Otherwise, it's just 'x'.
        var O = A ?
          Math.max(x, T) :
          x;

        // Print the final result to the console.
        console.log(O);
      };
    }
  ]
);