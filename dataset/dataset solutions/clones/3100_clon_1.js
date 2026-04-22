// This is the main entry point for the webpack bundle.
// It defines a self-executing function that initializes the module system.
module.exports = function (t) {

  // The module cache. Stores already loaded modules.
  var e = {};

  // This is the webpack_require function.
  // It loads and caches modules.
  function r(n) {

    // If module is already in cache, return its exports.
    if (e[n]) {

      return e[n].exports;
    }

    // Create a new module (and put it into the cache).
    var i = e[n] = {
      i: n, // module id
      l: !1, // loaded flag
      exports: {} // module exports object
    };

    // Execute the module function.
    // 't' is an array of module definitions.
    t[n].call(i.exports, i, i.exports, r);

    // Mark the module as loaded.
    i.l = !0;

    // Return the exports of the module.
    return i.exports;
  }

  // Assign the modules object to the 'm' property on the require function.
  // This holds all module definition functions.
  r.m = t;

  // Assign the module cache object to the 'c' property on the require function.
  // This holds all loaded modules.
  r.c = e;

  // Define a getter function for exports.
  // Used for compatibility with non-ESM modules.
  r.d = function (t, e, n) {

    // If property 'e' does not exist on object 't', define it.
    if (!r.o(t, e)) {

      Object.defineProperty(t, e, {
        enumerable: !0, // Make it enumerable
        get: n // Use the provided getter function
      });
    }
  };

  // Define __esModule on exports.
  // Marks a module as an ES module.
  r.r = function (t) {

    // If Symbol.toStringTag is supported, define it on the module.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {

      Object.defineProperty(t, Symbol.toStringTag, {
        value: "Module"
      });
    }

    // Define __esModule property to true.
    Object.defineProperty(t, "__esModule", {
      value: !0
    });
  };

  // Create a fake namespace object for compatibility.
  // mode & 1: value is a module id, require it
  // mode & 8: return t (value)
  // mode & 4: return t when it's an object with __esModule already set
  // mode & 2: merge all properties of a non-ESM module into the namespace
  r.t = function (t, e) {

    if (1 & e) {
      t = r(t);
    }

    if (8 & e) {
      return t;
    }

    if (4 & e && typeof t === "object" && t && t.__esModule) {
      return t;
    }

    var n = Object.create(null);

    r.r(n); // Mark as ES module

    Object.defineProperty(n, "default", {
      enumerable: !0,
      value: t
    });

    if (2 & e && typeof t !== "string") {

      // Iterate over properties of 't' and merge them into 'n'.
      for (var i in t) {

        r.d(n, i, function (e) {
          return t[e];
        }.bind(null, i));
      }
    }
    return n;
  };

  // Get default export for compatibility.
  // If `t` is an ES module, return its `default` export. Otherwise, return `t` itself.
  r.n = function (t) {

    var e = t && t.__esModule ?
      function () {
        return t.default;
      } :
      function () {
        return t;
      };

    // Define a getter 'a' for the default export.
    r.d(e, "a", e);

    return e;
  };

  // Check if property 'e' exists on object 't'.
  r.o = function (t, e) {

    return Object.prototype.hasOwnProperty.call(t, e);
  };

  // Public path for assets. (Not used in this specific bundle, typically empty)
  r.p = "";

  // Load the entry module (module 0) and return its exports.
  // This starts the application.
  return r(r.s = 0);

  // The array contains all the module definitions.
}(
  [
    /* Module 0: Main application entry point */
    function (t, e, r) {
      "use strict"; // Enable strict mode for this module

      // Require module 1 (fs module)
      var n = r(1);

      // Require module 2 (main logic) and immediately execute it
      // with content read from stdin using fs.readFileSync
      r(2)(n.readFileSync("/dev/stdin", "utf8"));
    },

    /* Module 1: Node.js 'fs' (file system) module */
    function (t, e) {
      // Export the 'fs' module directly from Node.js
      t.exports = require("fs");
    },

    /* Module 2: Main application logic */
    function (t, e, r) {
      "use strict"; // Enable strict mode

      // Require module 3 (InputReader class)
      var n = r(3);

      // Require module 5 (solver function)
      var i = r(5);

      // Export a function that takes an input string 't'.
      t.exports = function (t) {

        // Create a new InputReader instance with the provided input string.
        var e = new n(t);

        // Call the solver function with the InputReader instance.
        i(e);
      };
    },

    /* Module 3: InputReader Class */
    function (t, e, r) {
      "use strict"; // Enable strict mode

      // Require module 4 (Queue class)
      var n = r(4);

      // Define and export the InputReader class.
      t.exports = class {

        // Constructor takes the raw input string.
        constructor(t) {

          // Trim whitespace and split the input string by any whitespace
          // to get an array of input tokens.
          var e = t.trim().split(/\s+/g);

          // Initialize an internal Queue instance with the parsed tokens.
          this.inp = new n(e);
        }

        // Dequeues and returns the next raw string token.
        inr() {
          return this.inp.deq();
        }

        // Dequeues the next token and parses it as an integer.
        in() {
          return parseInt(this.inp.deq(), 10);
        }

        // Clears all input tokens from the internal queue.
        fin() {
          this.inp.clear();
        }
      };
    },

    /* Module 4: Queue Class */
    function (t, e, r) {
      "use strict"; // Enable strict mode

      // Define and export the Queue class.
      t.exports = class {

        // Constructor initializes the queue, optionally with an initial array.
        constructor() {

          // Get the first argument, or an empty array if no arguments are provided.
          var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];

          // Initialize size, items array, and index for dequeuing.
          this.size = t.length;
          this.items = t;
          this.ind = 0;
        }

        // Enqueues an item to the end of the queue.
        enq(t) {

          this.size += 1; // Increment size
          this.items.push(t); // Add item
        }

        // Dequeues and returns the item at the front of the queue.
        deq() {

          // Get the item at the current index.
          var t = this.items[this.ind];

          this.size -= 1; // Decrement size
          this.ind += 1; // Move index to the next item

          return t; // Return the dequeued item
        }

        // Clears all items from the queue and resets its state.
        clear() {

          this.items = []; // Empty the items array
          this.size = 0; // Reset size
          this.ind = 0; // Reset index
        }
      };
    },

    /* Module 5: Solver Logic */
    function (t, e, r) {
      "use strict"; // Enable strict mode

      // Export a function that takes an InputReader instance 't'.
      t.exports = function (t) {

        // Read the input sequence as a raw string array.
        var e = t.inr();

        // Get the length of the sequence.
        var r = e.length;

        // Initialize 'n' to store the maximum continuous valid sequence length.
        var n = 0;

        // Outer loop: Iterate through the sequence, considering each character as a potential start.
        for (var i = 0; i < r - 1; i++) {

          // Initialize 's' to store the current continuous valid sequence length.
          var s = 0;

          // Inner loop: Iterate from the current outer loop index 'i' to find continuous valid characters.
          for (var o = i; o < r && ("A" == e[o] || "C" == e[o] || "G" == e[o] || "T" == e[o]); o++) {

            // If the character is 'A', 'C', 'G', or 'T', increment the current sequence length.
            s++;
          }

          // Update 'n' with the maximum of its current value and the current sequence length 's'.
          n = Math.max(n, s);
        }

        // Output the final maximum continuous valid sequence length to the console.
        console.log(n);
      };
    }
  ]
);