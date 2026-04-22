module.exports = function (t) {
  // This is the cache for loaded modules.
  var e = {};

  // The 'r' function is a custom require implementation.
  // It handles module loading and caching.
  function r(n) {
    // If the module is already in cache, return its exports.
    if (e[n]) {
      return e[n].exports;
    }

    // Create a new module object and put it into the cache.
    var i = (e[n] = {
      i: n, // Module ID
      l: !1, // Loaded flag
      exports: {}, // Module exports object
    });

    // Execute the module function, populating its exports.
    t[n].call(i.exports, i, i.exports, r);

    // Mark the module as loaded.
    i.l = !0;

    // Return the module's exports.
    return i.exports;
  }

  // Store the module definitions in 'r.m'.
  r.m = t;

  // Store the module cache in 'r.c'.
  r.c = e;

  // Define a getter function for exports on a module.
  r.d = function (t, e, n) {
    if (!r.o(t, e)) {
      Object.defineProperty(t, e, {
        enumerable: !0,
        get: n,
      });
    }
  };

  // Define __esModule on exports.
  r.r = function (t) {
    if (
      "undefined" != typeof Symbol &&
      Symbol.toStringTag
    ) {
      Object.defineProperty(t, Symbol.toStringTag, {
        value: "Module",
      });
    }
    Object.defineProperty(t, "__esModule", {
      value: !0,
    });
  };

  // Compatibility getter for non-ES modules.
  r.t = function (t, e) {
    // If bit 1 is set, it's a direct module ID, so resolve it.
    if (1 & e) {
      t = r(t);
    }
    // If bit 8 is set, return the module directly.
    if (8 & e) {
      return t;
    }
    // If bit 4 is set and it's an object with __esModule, return it.
    if (4 & e && "object" == typeof t && t && t.__esModule) {
      return t;
    }

    // Create a namespace object.
    var n = Object.create(null);

    // Mark it as an ES module.
    r.r(n);

    // Define 'default' property.
    Object.defineProperty(n, "default", {
      enumerable: !0,
      value: t,
    });

    // If bit 2 is set and it's not a string, copy all properties.
    if (2 & e && "string" != typeof t) {
      for (var i in t) {
        r.d(
          n,
          i,
          (function (e) {
            return t[e];
          }).bind(null, i)
        );
      }
    }

    // Return the namespace object.
    return n;
  };

  // Get the default export from a module.
  r.n = function (t) {
    var e =
      t && t.__esModule
        ? function () {
            return t.default;
          }
        : function () {
            return t;
          };
    r.d(e, "a", e);
    return e;
  };

  // Object.prototype.hasOwnProperty.call wrapper.
  r.o = function (t, e) {
    return Object.prototype.hasOwnProperty.call(t, e);
  };

  // Public path for assets.
  r.p = "";

  // Load the entry module (module 0) and return its exports.
  return r((r.s = 0));
}([
  /* Module 0 */
  function (t, e, r) {
    "use strict";
    // Require module 1 (fs)
    var n = r(1);

    // Require module 2 (main logic) and execute it with the input from stdin.
    r(2)(n.readFileSync("/dev/stdin", "utf8"));
  },
  /* Module 1 */
  function (t, e) {
    // Export the Node.js 'fs' module.
    t.exports = require("fs");
  },
  /* Module 2 */
  function (t, e, r) {
    "use strict";
    // Require module 3 (InputReader class).
    var n = r(3);

    // Require module 5 (main problem solver).
    var i = r(5);

    // Export a function that processes the input string.
    t.exports = function (t) {
      // Create a new InputReader instance with the provided input string.
      var e = new n(t);

      // Pass the InputReader instance to the main solver function.
      i(e);
    };
  },
  /* Module 3 */
  function (t, e, r) {
    "use strict";
    // Require module 4 (Queue class).
    var n = r(4);

    // Define and export the InputReader class.
    t.exports = class {
      // Constructor takes the raw input string.
      constructor(t) {
        // Trim whitespace and split the input into tokens by whitespace.
        var e = t.trim().split(/\s+/g);

        // Initialize an internal queue (n) with the parsed tokens.
        this.inp = new n(e);
      }

      // Method to read the next raw string token.
      inr() {
        return this.inp.deq();
      }

      // Method to read the next token and parse it as an integer.
      in() {
        return parseInt(this.inp.deq(), 10);
      }

      // Method to clear the internal input queue.
      fin() {
        this.inp.clear();
      }
    };
  },
  /* Module 4 */
  function (t, e, r) {
    "use strict";
    // Define and export a simple Queue-like class.
    t.exports = class {
      // Constructor can optionally take an initial array of items.
      constructor() {
        var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
        this.size = t.length; // Current number of items.
        this.items = t; // The array holding the items.
        this.ind = 0; // Index of the next item to dequeue.
      }

      // Enqueue an item to the end of the queue.
      enq(t) {
        this.size += 1;
        this.items.push(t);
      }

      // Dequeue an item from the front of the queue.
      deq() {
        var t = this.items[this.ind]; // Get the item at the current index.
        this.size -= 1; // Decrement size.
        this.ind += 1; // Advance the index.
        return t; // Return the dequeued item.
      }

      // Clear all items from the queue.
      clear() {
        this.items = [];
        this.size = 0;
        this.ind = 0;
      }
    };
  },
  /* Module 5 */
  function (t, e, r) {
    "use strict";
    // This module contains the main logic to solve the problem.
    // It takes an InputReader instance 't'.
    t.exports = function (t) {
      // Read the dimensions of the larger grid (N).
      for (var e = t.in(), r = t.in(), n = new Array(e), i = 0; i < e; i++) {
        // Read each row of the larger grid as a string array.
        n[i] = t.inr();
      }

      // Read the dimensions of the smaller pattern grid (M).
      for (var o = new Array(r), s = 0; s < r; s++) {
        // Read each row of the pattern grid as a string array.
        o[s] = t.inr();
      }

      // Iterate through all possible top-left starting positions (u, c) for the pattern
      // within the larger grid.
      // 'u' is the row offset for the larger grid.
      for (var u = 0; u < e - r + 1; u++) {
        // 'c' is the column offset for the larger grid.
        for (var c = 0; c < e - r + 1; c++) {
          // Assume the pattern is found at this position initially.
          for (var f = !0, a = 0; a < r; a++) {
            // Iterate through rows of the pattern (a).
            for (var l = 0; l < r; l++) {
              // Iterate through columns of the pattern (l).
              // Compare characters from the pattern grid 'o' with the
              // corresponding characters in the larger grid 'n' at the current offset.
              if (o[a][l] != n[u + a][c + l]) {
                // If a mismatch is found, the pattern is not here.
                f = !1;
                break; // Exit the inner column loop.
              }
            }

            // If a mismatch was found in the inner loop, no need to check further rows.
            if (!f) {
              break; // Exit the pattern row loop.
            }
          }

          // If 'f' is still true after checking all pattern cells, it means a match was found.
          if (f) {
            return void console.log("Yes"); // Print "Yes" and terminate.
          }
        }
      }

      // If no match was found after checking all possible positions, print "No".
      console.log("No");
    };
  },
]);