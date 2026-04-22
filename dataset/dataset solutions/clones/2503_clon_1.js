module.exports = function (t) {
  // This is the webpack boilerplate wrapper function.
  // 't' represents the modules array.

  var r = {}; // This object caches already loaded modules.

  /*
   * The core module loading function.
   * It takes a module ID 'n' as input.
   */
  function e(n) {
    // If the module is already in the cache, return its exports.
    if (r[n]) return r[n].exports;

    // Otherwise, create a new module entry in the cache.
    var i = (r[n] = {
      i: n, // Module ID
      l: !1, // Loaded flag (false initially)
      exports: {}, // The module's exports object
    });

    // Call the module function, providing it with 'module', 'exports', and 'require' (e itself).
    t[n].call(i.exports, i, i.exports, e);

    // Mark the module as loaded.
    i.l = !0;

    // Return the module's exports.
    return i.exports;
  }

  // Attach additional properties to the 'e' (require) function.

  // 'e.m' stores the module definitions (the 't' array).
  e.m = t;

  // 'e.c' stores the module cache (the 'r' object).
  e.c = r;

  /*
   * 'e.d' is a helper to define getter functions for module exports.
   * t: exports object
   * r: property name
   * n: getter function
   */
  e.d = function (t, r, n) {
    if (!e.o(t, r)) {
      // Only define if the property doesn't already exist.
      Object.defineProperty(t, r, {
        enumerable: !0, // Make it enumerable
        get: n, // The getter function
      });
    }
  };

  /*
   * 'e.r' adds __esModule property to exports for ESM compatibility.
   * t: exports object
   */
  e.r = function (t) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(t, Symbol.toStringTag, {
        value: "Module",
      });
    }
    Object.defineProperty(t, "__esModule", {
      value: !0,
    });
  };

  /*
   * 'e.t' creates a namespace object for module imports.
   * t: module or module ID
   * r: bitmask for import type
   */
  e.t = function (t, r) {
    // If bit 1 is set, it's a direct import, so load the module.
    if (1 & r) t = e(t);

    // If bit 8 is set, just return the module as is.
    if (8 & r) return t;

    // If bit 4 is set, and it's an object with __esModule, return it.
    if (4 & r && typeof t === "object" && t && t.__esModule) return t;

    // Otherwise, create a new namespace object.
    var n = Object.create(null);

    // Set __esModule on the new namespace object.
    e.r(n);

    // Define 'default' property as a getter for the original module.
    Object.defineProperty(n, "default", {
      enumerable: !0,
      value: t,
    });

    // If bit 2 is set and it's not a string, iterate and add all properties from the original module.
    if (2 & r && typeof t !== "string") {
      for (var i in t) {
        e.d(
          n,
          i,
          (function (r) {
            return t[r];
          }).bind(null, i)
        );
      }
    }

    return n;
  };

  /*
   * 'e.n' creates a getter function for non-ESM modules.
   * t: module exports
   */
  e.n = function (t) {
    var r =
      t && t.__esModule
        ? // If it's an ES module, return its default export.
          function () {
            return t.default;
          }
        : // Otherwise, return the module itself.
          function () {
            return t;
          };

    // Define a getter 'a' on the function, which returns the function itself.
    e.d(r, "a", r);

    return r;
  };

  /*
   * 'e.o' is a utility for Object.prototype.hasOwnProperty.call.
   * t: object
   * r: property name
   */
  e.o = function (t, r) {
    return Object.prototype.hasOwnProperty.call(t, r);
  };

  // 'e.p' is the public path for assets (empty in this case).
  e.p = "";

  // Load the entry module (module 0) by setting 'e.s' and calling 'e'.
  return e((e.s = 0));
})(
  /*
   * Array of module definitions.
   * Each function represents a module, with parameters:
   * t: module object (webpack's `module`)
   * r: exports object (webpack's `exports`)
   * e: require function (webpack's `__webpack_require__`)
   */
  [
    function (t, r, e) {
      // Module 0: Main entry point
      "use strict";

      // Require module 1 (fs module).
      var n = e(1);

      // Require module 2 (main application logic) and immediately call it
      // with the content read from /dev/stdin.
      e(2)(n.readFileSync("/dev/stdin", "utf8"));
    },
    function (t, r) {
      // Module 1: Node.js 'fs' module
      // Directly exports the 'fs' module from Node.js.
      t.exports = require("fs");
    },
    function (t, r, e) {
      // Module 2: Application initializer
      "use strict";

      // Require module 3 (InputReader class).
      var n = e(3);

      // Require module 5 (solver function).
      var i = e(5);

      // Export a function that takes input data 't'.
      t.exports = function (t) {
        // Create a new instance of the InputReader with the provided data.
        var r = new n(t);

        // Call the solver function with the InputReader instance.
        i(r);
      };
    },
    function (t, r, e) {
      // Module 3: InputReader Class
      "use strict";

      // Require module 4 (Deque class).
      var n = e(4);

      // Export the InputReader class.
      t.exports = class {
        /*
         * Constructor for InputReader.
         * Takes a string 't' (the entire input).
         */
        constructor(t) {
          // Trim whitespace and split the input string by any whitespace
          // to get an array of tokens.
          var r = t.trim().split(/\s+/g);

          // Initialize an internal Deque instance with these tokens.
          this.inp = new n(r);
        }

        // Reads the next raw string token from the input.
        inr() {
          return this.inp.deq();
        }

        // Reads the next integer token from the input.
        in() {
          return parseInt(this.inp.deq(), 10);
        }

        // Clears the internal input buffer.
        fin() {
          this.inp.clear();
        }
      };
    },
    function (t, r, e) {
      // Module 4: Deque (Double-Ended Queue) Class
      "use strict";

      // Export the Deque class.
      t.exports = class {
        /*
         * Constructor for Deque.
         * Can optionally take an initial array of items.
         */
        constructor() {
          var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
          this.size = t.length; // Current number of items.
          this.items = t; // The underlying array storing items.
          this.ind = 0; // Index of the next item to dequeue (front of the queue).
        }

        // Adds an item to the end of the queue.
        enq(t) {
          this.size += 1;
          this.items.push(t);
        }

        // Removes and returns the item from the front of the queue.
        deq() {
          var t = this.items[this.ind]; // Get the item at the current index.
          this.size -= 1; // Decrement the size.
          this.ind += 1; // Move the index forward.
          return t; // Return the dequeued item.
        }

        // Clears all items from the queue and resets its state.
        clear() {
          this.items = [];
          this.size = 0;
          this.ind = 0;
        }
      };
    },
    function (t, r, e) {
      // Module 5: Solver Function (Main Application Logic)
      "use strict";

      // Require module 6 (Floyd-Warshall algorithm).
      var n = e(6);

      // Export the main solver function.
      t.exports = function (t) {
        // Initialize a very large number to represent infinity for distances.
        var r = 99999999999;

        // Read N (number of nodes), M (number of edges), and K (max distance for direct connection).
        var e = t.in(),
          i = t.in(),
          o = t.in();

        // Create an adjacency matrix 's' for N nodes.
        // Initialize all distances to 'infinity'.
        var s = new Array(e);
        for (var u = 0; u < e; u++) {
          s[u] = new Array(e).fill(r);
        }

        // Read M edges and populate the adjacency matrix.
        for (var c = 0; c < i; c++) {
          var f = t.in(), // Node 1 (1-indexed)
            a = t.in(), // Node 2 (1-indexed)
            l = t.in(); // Weight/distance

          // Adjust to 0-indexed.
          s[f - 1][a - 1] = l;
          s[a - 1][f - 1] = l; // Assuming an undirected graph.
        }

        // Apply Floyd-Warshall to find all-pairs shortest paths considering initial edges.
        var p = n(s);

        // Now, transform the graph: if path_distance <= K, set edge weight to 1, else infinity.
        for (var v = 0; v < e; v++) {
          for (var d = 0; d < e; d++) {
            if (p[v][d] <= o) {
              s[v][d] = 1; // Treat as a direct 'connection' if within K distance.
            } else {
              s[v][d] = r; // Otherwise, no direct connection.
            }
          }
        }

        // Apply Floyd-Warshall again on the transformed graph to find shortest paths
        // where each step costs 1 (representing a 'connection').
        var h = n(s);

        // Read Y (number of queries).
        var y = t.in();

        // Array to store results for each query.
        var b = [];

        // Process Y queries.
        for (var m = 0; m < y; m++) {
          var x = t.in(), // Start node (1-indexed)
            g = t.in(); // End node (1-indexed)

          // Get the shortest path distance from the second Floyd-Warshall result.
          var j = h[x - 1][g - 1];

          // If distance is still infinity, it means no path exists.
          if (j == r) {
            b.push(-1);
          } else {
            // Otherwise, push the distance minus 1 (as paths count steps, not nodes).
            b.push(j - 1);
          }
        }

        // Print all results, joined by newlines.
        console.log(b.join("\n"));
      };
    },
    function (t, r, e) {
      // Module 6: Floyd-Warshall Algorithm Implementation
      "use strict";

      // Export the Floyd-Warshall function.
      t.exports = function (t) {
        // Get the number of nodes (assuming square matrix).
        var r = t.length;

        // Create a deep copy of the input graph to store distances.
        // This is important to avoid modifying the original matrix.
        var e = [];
        for (var n = 0; n < r; n++) {
          e.push(t[n].concat());
        }

        // Main Floyd-Warshall triple loop.
        // i: intermediate node
        // o: start node
        // s: end node
        for (var i = 0; i < r; i++) {
          // Iterate through all possible intermediate nodes.
          for (var o = 0; o < r; o++) {
            // Iterate through all possible source nodes.
            for (var s = 0; s < r; s++) {
              // If the path from 'o' to 's' via 'i' is shorter than the current
              // known path from 'o' to 's', update the distance.
              if (e[o][s] > e[o][i] + e[i][s]) {
                e[o][s] = e[o][i] + e[i][s];
              }
            }
          }
        }

        // Return the matrix with all-pairs shortest path distances.
        return e;
      };
    },
  ]
);