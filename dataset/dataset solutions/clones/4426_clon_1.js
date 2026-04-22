module.exports = function (r) {
  /* This is the module cache.
   * It stores already loaded modules to prevent redundant loading.
   */
  var e = {};

  /**
   * The 't' function serves as a custom 'require' implementation
   * for this bundled JavaScript environment.
   *
   * @param {number} n - The unique identifier of the module to be loaded.
   * @returns {object} The exports object of the requested module.
   */
  function t(n) {
    // If the module is already present in the cache, return its exports immediately.
    if (e[n]) {
      return e[n].exports;
    }

    /*
     * If the module is not in the cache, create a new entry for it.
     * 'o' represents the module object itself.
     */
    var o = (e[n] = {
      i: n, // 'i' stores the module's ID.
      l: !1, // 'l' is a boolean flag indicating if the module has been loaded.
      exports: {}, // 'exports' is the object that will hold the module's exports.
    });

    // Execute the module's factory function.
    // The factory function is found in 'r[n]' (the modules array).
    // It's called with 'o.exports' as 'this', and 'o', 'o.exports', and 't' (the require function) as arguments.
    r[n].call(o.exports, o, o.exports, t);

    // After execution, mark the module as loaded.
    o.l = !0;

    // Finally, return the module's exports.
    return o.exports;
  }

  // 't.m' stores the entire array of module definitions.
  t.m = r;

  // 't.c' stores the module cache itself.
  t.c = e;

  /**
   * Defines a getter function for an export on an object.
   * This is used to create "live" bindings for ES module exports.
   *
   * @param {object} r - The target object on which to define the property.
   * @param {string} e - The name of the property to define.
   * @param {function} n - The getter function that returns the property's value.
   */
  t.d = function (r, e, n) {
    // Only define the property if it doesn't already exist on the object.
    if (!t.o(r, e)) {
      Object.defineProperty(r, e, {
        enumerable: !0, // Make the property enumerable so it shows up in loops.
        get: n, // Assign the provided function as the getter.
      });
    }
  };

  /**
   * Marks an exports object as an ES module.
   * This typically involves setting '__esModule: true' and potentially
   * 'Symbol.toStringTag' for better introspection.
   *
   * @param {object} r - The exports object to mark as an ES module.
   */
  t.r = function (r) {
    // If 'Symbol' and 'Symbol.toStringTag' are available, set the toStringTag.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(r, Symbol.toStringTag, {
        value: "Module",
      });
    }
    // Always set '__esModule' to true to indicate an ES module.
    Object.defineProperty(r, "__esModule", {
      value: !0,
    });
  };

  /**
   * Creates a namespace object for a module, handling various export formats.
   * This function is crucial for interoperability between CommonJS and ES modules.
   *
   * @param {any} r - The module's exports or module ID.
   * @param {number} e - Flags indicating how to interpret 'r' and process exports.
   * @returns {object} A standardized namespace object for the module.
   */
  t.t = function (r, e) {
    // Flag 1: If 'r' is a module ID, resolve it using 't'.
    if (1 & e) {
      r = t(r);
    }

    // Flag 8: If set, return 'r' as is (e.g., already a namespace object).
    if (8 & e) {
      return r;
    }

    // Flag 4: If set and 'r' is an object and already an ES module, return it directly.
    if (4 & e && typeof r === "object" && r && r.__esModule) {
      return r;
    }

    // Otherwise, create a new blank object to serve as the namespace.
    var n = Object.create(null);

    // Mark the new namespace object as an ES module.
    t.r(n);

    // Define a 'default' export on the namespace object, pointing to 'r'.
    Object.defineProperty(n, "default", {
      enumerable: !0,
      value: r,
    });

    // Flag 2: If set and 'r' is not a string, iterate over its properties
    // and expose them as individual exports on the namespace object.
    if (2 & e && typeof r !== "string") {
      for (var o in r) {
        t.d(
          n,
          o,
          (function (e) {
            return r[e];
          }).bind(null, o)
        );
      }
    }
    return n;
  };

  /**
   * Creates a getter function for a module's default export.
   * This function helps in accessing the default export consistently,
   * whether the module is an ES module or a CommonJS module.
   *
   * @param {any} r - The module object or its exports.
   * @returns {function} A function that, when called, returns the module's default export.
   */
  t.n = function (r) {
    // If 'r' is an ES module, the getter should return 'r.default'.
    // Otherwise, it should return 'r' itself (CommonJS default export).
    var e =
      r && r.__esModule ?
      function () {
        return r.default;
      } :
      function () {
        return r;
      };

    // Define a property 'a' on the getter function itself, which is the getter.
    // This is often used for internal tracking or additional metadata.
    t.d(e, "a", e);
    return e;
  };

  /**
   * A utility function to check if an object has a specific property.
   * It uses 'Object.prototype.hasOwnProperty.call' for robust checking.
   *
   * @param {object} r - The object to inspect.
   * @param {string} e - The name of the property to check for.
   * @returns {boolean} True if the object has the specified property, false otherwise.
   */
  t.o = function (r, e) {
    return Object.prototype.hasOwnProperty.call(r, e);
  };

  // 't.p' is the public path for assets, often left empty in simple bundles.
  t.p = "";

  // Execute the entry module. 't.s' typically holds the ID of the entry module (here, 0).
  // The result of executing the entry module (its exports) is returned by the wrapper function.
  return t((t.s = 0));
})(
  // This array contains all the module definitions for the bundle.
  [
    /*
     * Module 0: The primary entry point of the application.
     * It reads input, processes it, and orchestrates the main logic.
     */
    function (r, e, t) {
      // Module 0 requires module 1 and passes it processed input from standard input.
      t(1)(
        t(2) // Module 2 is 'fs' (file system).
        .readFileSync("/dev/stdin", "UTF-8") // Read from stdin with UTF-8 encoding.
        .split("\n") // Split the input by newlines into an array of strings.
      );
    },

    /*
     * Module 1: Contains the core algorithm and business logic.
     * It processes graph data and answers queries.
     */
    function (r, e, t) {
      "use strict"; // Enforce strict mode for this module.

      /**
       * A helper function designed to safely destructure an iterable into an array.
       * It handles various scenarios, including actual arrays, iterators,
       * and throws a TypeError if the input is not a valid iterable instance.
       *
       * @param {Iterable} r - The iterable object or array to destructure.
       * @param {number} e - The maximum number of elements to extract.
       * @returns {Array} A new array containing the extracted elements.
       */
      function n(r, e) {
        // If 'r' is already an array, return it directly.
        if (Array.isArray(r)) {
          return r;
        }

        // If 'r' is not an array, attempt to destructure it as an iterable.
        return (
          (function (r, e) {
            var t = [], // Array to store destructured elements.
              n = !0, // Flag for iterator 'done' status.
              o = !1, // Flag for error occurrence.
              u = void 0; // Variable to store potential error.
            try {
              // Iterate through the input 'r' using its Symbol.iterator.
              for (
                var i,
                  f = r[Symbol.iterator](); // Get the iterator.
                !(n = (i = f.next()).done) && // Check if iterator is done.
                (t.push(i.value), !e || t.length !== e); // Push value and check length limit.
                n = !0
              ) {}
            } catch (r) {
              // Catch any errors during iteration.
              o = !0;
              u = r;
            } finally {
              try {
                // Ensure the iterator's 'return' method is called if available.
                if (!n && null != f.return) {
                  f.return();
                }
              } finally {
                // If an error occurred, re-throw it.
                if (o) {
                  throw u;
                }
              }
            }
            return t; // Return the collected elements.
          })(r, e) ||
          // If the above iterable destructuring fails, throw a TypeError.
          function () {
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
          }()
        );
      }

      // The main export function of Module 1.
      // It takes an array 'r' (lines of input) as its argument.
      r.exports = function (r) {
        // The first line of input specifies the number of nodes in the graph.
        var e = Number(r[0]);

        // Initialize an adjacency list 't' for the graph.
        // Each element of 't' will be an array representing connections from a node.
        var t = new Array(e);
        for (var o = 0; o < e; o++) {
          t[o] = [];
        }

        // The (e)-th line of input contains two numbers: 'i' (source node count for queries)
        // and 'f' (the special destination node for path calculations).
        var u = n(
            r[e] // Access the line at index 'e'.
            .split(" ") // Split it into numbers by space.
            .map(function (r) {
              return Number(r);
            }), // Convert string parts to numbers.
            2 // Expect exactly 2 numbers.
          ),
          i = u[0], // 'i' is the first number.
          f = u[1]; // 'f' is the second number.

        // Process the next 'e-1' lines, which define the edges of the graph.
        for (var a = 0; a < e - 1; a++) {
          var l = n(
              r[a + 1] // Access lines from index 1 to 'e-1'.
              .split(" ") // Split by space.
              .map(function (r) {
                return Number(r);
              }), // Convert to numbers.
              3 // Expect exactly 3 numbers: node1, node2, weight.
            ),
            c = l[0], // First node of the edge.
            p = l[1], // Second node of the edge.
            s = l[2]; // Weight of the edge.

          // Add edges to the adjacency list.
          // Only add edges that do NOT connect directly to the special node 'f'.
          // Adjust node indices to be 0-based (c-1, p-1).
          if (p != f) {
            t[c - 1].push({
              v: p - 1,
              c: s,
            });
          }
          if (c != f) {
            t[p - 1].push({
              v: c - 1,
              c: s,
            });
          }
        }

        // Initialize a distance array 'v'.
        // 'v[x]' will store the shortest distance from 'f' to node 'x'.
        // All distances are initially -1, indicating unvisited nodes.
        var v = new Array(e).fill(-1);

        // Implement a Breadth-First Search (BFS) or Dijkstra-like algorithm
        // to find shortest paths from 'f' to all other nodes, considering only
        // the edges that were added (i.e., not directly connected to 'f').
        // 'd' acts as a queue for nodes to visit.
        var d = [{
          v: f - 1, // Start node (adjusted to 0-based index).
          s: 0, // Initial distance from 'f' to itself is 0.
        }];

        // Continue as long as there are nodes in the queue to process.
        while (d.length > 0) {
          var y = d.pop(); // Pop the last element (simulating a stack for DFS, but context implies BFS/Dijkstra where order matters).

          // Iterate through all neighbors of the current node 'y.v'.
          for (var b = t[y.v].length, m = 0; m < b; m++) {
            var h = t[y.v][m]; // Current neighbor 'h'.

            // If the neighbor 'h.v' has not been visited yet (distance is -1).
            if (-1 == v[h.v]) {
              var g = y.s + h.c; // Calculate the new distance: current node's distance + edge weight.
              v[h.v] = g; // Update the shortest distance to 'h.v'.
              d.push({
                v: h.v,
                s: g,
              }); // Add the neighbor to the queue for further processing.
            }
          }
        }

        // Process 'i' queries. Each query consists of two nodes.
        for (var x = 0; x < i; x++) {
          var j = n(
              r[x + e + 1] // Access query lines, starting after node and edge definitions.
              .split(" ") // Split by space.
              .map(function (r) {
                return Number(r);
              }), // Convert to numbers.
              2 // Expect two node IDs for the query.
            ),
            O = j[0], // First node in the query.
            S = j[1], // Second node in the query.
            w = v[O - 1] + v[S - 1]; // Calculate the sum of distances from 'f' to O and from 'f' to S.

          // Print the calculated sum for the current query.
          console.log(w);
        }
      };
    },

    /*
     * Module 2: A simple module that exports the Node.js 'fs' (file system) module.
     * This allows other modules in the bundle to interact with the file system.
     */
    function (r, e) {
      // Assign the 'fs' module (obtained via Node.js's native 'require')
      // to the 'exports' object of this module.
      r.exports = require("fs");
    },
  ]
);