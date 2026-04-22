/* This is a Type I clone of the original JavaScript code. */
/* All identifiers, keywords, operators, and expressions are preserved exactly. */
/* Only whitespace (spaces, tabs, newlines) and comments have been altered. */

// The entire application is wrapped in an Immediately Invoked Function Expression (IIFE).
!function (t) {

  // 'e' serves as a cache for loaded modules.
  var e = {};

  /*
   * The core module loading function, analogous to `require` in Node.js
   * or `__webpack_require__` in Webpack bundles.
   *
   * @param {number} r - The module ID.
   * @returns {object} The exports of the requested module.
   */
  function n(r) {
    // If the module is already in the cache, return its exports immediately.
    if (e[r]) {
      return e[r].exports;
    }

    // If not in cache, create a new module entry.
    // 'i': module ID, 'l': loaded status (false initially), 'exports': module exports object.
    var o = e[r] = {
      i: r,
      l: !1,
      exports: {}
    };

    // Execute the module function.
    // The module function is expected to be in 't' (the modules object).
    // It receives 'module', 'module.exports', and the 'n' (require) function as arguments.
    t[r].call(o.exports, o, o.exports, n);

    // Mark the module as loaded.
    o.l = !0;

    // Return the module's exports.
    return o.exports;
  }


  // Attach the modules object to the 'm' property of the require function.
  n.m = t;

  // Attach the cache object to the 'c' property.
  n.c = e;


  /*
   * Helper function to define a getter for a property on an object.
   * Used for defining exports.
   *
   * @param {object} t - The target object.
   * @param {string} e - The name of the property to define.
   * @param {function} r - The getter function for the property.
   */
  n.d = function(t, e, r) {
    // Only define the property if it doesn't already exist.
    if (!n.o(t, e)) {
      Object.defineProperty(t, e, {
        enumerable: !0, // Make the property enumerable.
        get: r // Set the getter function.
      });
    }
  };


  /*
   * Helper function to define properties on an ES module namespace object.
   * Sets `Symbol.toStringTag` and `__esModule`.
   *
   * @param {object} t - The module namespace object.
   */
  n.r = function(t) {
    // If `Symbol.toStringTag` is supported, define it for better module identification.
    if ("undefined" != typeof Symbol && Symbol.toStringTag) {
      Object.defineProperty(t, Symbol.toStringTag, {
        value: "Module"
      });
    }
    // Define `__esModule` to indicate that this is an ES module.
    Object.defineProperty(t, "__esModule", {
      value: !0
    });
  };


  /*
   * Creates a module namespace object for compatibility with ES modules.
   * Handles various import scenarios (e.g., default export, named exports).
   *
   * @param {*} t - The module or module ID.
   * @param {number} e - Flags indicating the type of import.
   * @returns {object} The module namespace object.
   */
  n.t = function(t, e) {
    // If bit 1 is set, `t` is a module ID, so resolve it.
    if (1 & e) {
      t = n(t);
    }
    // If bit 8 is set, return `t` directly.
    if (8 & e) {
      return t;
    }
    // If bit 4 is set, `t` is an object, and it's already an ES module, return it.
    if (4 & e && "object" == typeof t && t && t.__esModule) {
      return t;
    }

    // Create a new plain object to serve as the module namespace.
    var r = Object.create(null);

    // Mark the new object as an ES module.
    n.r(r);

    // Define a 'default' property pointing to the original 't'.
    Object.defineProperty(r, "default", {
      enumerable: !0,
      value: t
    });

    // If bit 2 is set and 't' is not a string,
    // iterate over its properties and define getters for them on the new namespace object.
    if (2 & e && "string" != typeof t) {
      for (var o in t) {
        // Use `n.d` to define enumerable getters for each property.
        n.d(r, o, (function(e) {
          return t[e];
        }).bind(null, o));
      }
    }
    return r;
  };


  /*
   * Creates a getter function for module exports,
   * handling default exports for ES modules.
   *
   * @param {object} t - The module exports object.
   * @returns {function} A function that returns the module's primary export.
   */
  n.n = function(t) {
    // If the module is an ES module and has a 'default' export,
    // the getter function will return `t.default`.
    // Otherwise, it will return `t` itself.
    var e = t && t.__esModule ?
      function() {
        return t.default;
      } :
      function() {
        return t;
      };

    // Define an 'a' property on the getter function itself, which returns the getter.
    n.d(e, "a", e);

    return e;
  };


  /*
   * A utility function to check if an object has a specific property.
   * This is a safe wrapper for `Object.prototype.hasOwnProperty.call`.
   *
   * @param {object} t - The object to check.
   * @param {string} e - The property name.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  n.o = function(t, e) {
    return Object.prototype.hasOwnProperty.call(t, e);
  };


  // Public path for assets (e.g., for dynamically loaded chunks).
  // It's an empty string here, meaning relative paths.
  n.p = "";

  // Load the entry point module.
  // `n.s = 15` sets the `s` property of `n` to 15 (the entry module ID)
  // and then calls `n(15)` to load it.
  n(n.s = 15);

} /* End of the IIFE wrapper for the module system */ ({

  // Module definitions start here. Each key is a module ID.

  // Module 0: Contains utility functions for reading and parsing input.
  0: function(t, e, n) {
    "use strict"; // Enforce strict mode within this module.

    // `__awaiter` helper function for transpiled async/await code.
    // This is a common pattern in TypeScript-compiled or Babel-transpiled JavaScript.
    var r = this && this.__awaiter || function(t, e, n, r) {
      return new(n || (n = Promise))(function(o, u) {
        function i(t) {
          try {
            l(r.next(t));
          } catch (t) {
            u(t);
          }
        }

        function a(t) {
          try {
            l(r.throw(t));
          } catch (t) {
            u(t);
          }
        }

        function l(t) {
          t.done ? o(t.value) : new n(function(e) {
            e(t.value);
          }).then(i, a);
        }
        l((r = r.apply(t, e || [])).next());
      });
    };

    // `__generator` helper function for transpiled generator functions (used by async/await).
    var o = this && this.__generator || function(t, e) {
      var n, r, o, u, i = {
        label: 0,
        sent: function() {
          if (1 & o[0]) throw o[1];
          return o[1];
        },
        trys: [],
        ops: []
      };
      return u = {
        next: a(0),
        throw: a(1),
        return: a(2)
      }, "function" == typeof Symbol && (u[Symbol.iterator] = function() {
        return this;
      }), u;

      function a(u) {
        return function(a) {
          return function(u) {
            if (n) throw new TypeError("Generator is already executing.");
            for (; i;)
              try {
                if (n = 1, r && (o = 2 & u[0] ? r.return : u[0] ? r.throw || ((o = r.return) && o.call(r), 0) : r.next) && !(o = o.call(r, u[1])).done) return o;
                switch (r = 0, o && (u = [2 & u[0], o.value]), u[0]) {
                  case 0:
                  case 1:
                    o = u;
                    break;
                  case 4:
                    return i.label++, {
                      value: u[1],
                      done: !1
                    };
                  case 5:
                    i.label++, r = u[1], u = [0];
                    continue;
                  case 7:
                    u = i.ops.pop(), i.trys.pop();
                    continue;
                  default:
                    if (!(o = (o = i.trys).length > 0 && o[o.length - 1]) && (6 === u[0] || 2 === u[0])) {
                      i = 0;
                      continue;
                    }
                    if (3 === u[0] && (!o || u[1] > o[0] && u[1] < o[3])) {
                      i.label = u[1];
                      break;
                    }
                    if (6 === u[0] && i.label < o[1]) {
                      i.label = o[1], o = u;
                      break;
                    }
                    if (o && i.label < o[2]) {
                      i.label = o[2], i.ops.push(u);
                      break;
                    }
                    o[2] && i.ops.pop(), i.trys.pop();
                    continue;
                }
                u = e.call(t, i);
              } catch (t) {
                u = [6, t], r = 0;
              } finally {
                n = o = 0;
              }
            if (5 & u[0]) throw u[1];
            return {
              value: u[0] ? u[1] : void 0,
              done: !0
            };
          }([u, a]);
        };
      }
    };

    // `__importDefault` helper for handling ES module interop.
    var u = this && this.__importDefault || function(t) {
      return t && t.__esModule ? t : {
        default: t
      };
    };

    // Store the `this` context for use in async/generator functions.
    var i = this;

    // Mark this module as an ES module.
    e.__esModule = !0;

    // Import the 'fs' module from module 1.
    var a = u(n(1));


    /**
     * `l` (aliased as `getFoolIterator`) is a generator function
     * that takes a string, splits it by whitespace, filters out empty strings,
     * and yields each non-empty token.
     *
     * @param {string} t - The input string.
     * @returns {Generator<string>} A generator that yields tokens.
     */
    function l(t) {
      var e, n;
      return o(this, function(r) {
        switch (r.label) {
          case 0:
            // Split the input string by one or more whitespace characters
            // and filter out any empty strings resulting from the split.
            e = t.split(/\s+/).filter(function(t) {
              return t.length > 0;
            });
            n = 0; // Initialize a counter for the tokens array.
            r.label = 1;
          case 1:
            // If there are more tokens, yield the current one.
            return n < e.length ? [4, e[n]] : [3, 4];
          case 2:
            r.sent(); // Consume the yielded value (it's not used here).
            r.label = 3;
          case 3:
            return n++, [3, 1]; // Increment the counter and loop back to check for more tokens.
          case 4:
            return [2]; // All tokens processed, return from the generator.
        }
      });
    }


    /**
     * `readInput` is an exported function that reads the entire content
     * of `/dev/stdin` asynchronously as a UTF-8 string.
     *
     * @returns {Promise<string>} A promise that resolves with the input string
     *                            or rejects with an error.
     */
    e.readInput = function() {
      return new Promise(function(t, e) {
        // Use Node.js `fs.readFile` to read from standard input.
        a.default.readFile("/dev/stdin", "utf8", function(n, r) {
          if (n) { // If an error occurred (e.g., file not found, permissions).
            e(n); // Reject the promise.
          } else {
            t(r); // Resolve the promise with the data.
          }
        });
      });
    };

    // Export the `l` generator function as `getFoolIterator`.
    e.getFoolIterator = l;


    /**
     * `getFoolNextInt` is an exported function that returns an async function.
     * The returned function, when called, will read input, tokenize it using `getFoolIterator`,
     * and provide a function that yields the next token parsed as an integer.
     *
     * @returns {Promise<function(): number>} A promise resolving to a function that returns the next int.
     */
    e.getFoolNextInt = function() {
      return r(i, void 0, void 0, function() {
        var t, n;
        return o(this, function(r) {
          switch (r.label) {
            case 0:
              return [4, e.readInput()]; // Await the input string.
            case 1:
              t = r.sent(); // Store the input string.
              n = l(t); // Create a token iterator from the input.
              // Return a function that, when called, gets the next token from the iterator
              // and parses it as an integer.
              return [2, function() {
                return parseInt(n.next().value);
              }];
          }
        });
      });
    };


    /**
     * `getChottoMashinaNext` is an exported function that returns an async function.
     * The returned function, when called, will read input and provide a function
     * that yields the next token using a custom, more granular tokenizer.
     *
     * @returns {Promise<function(): string>} A promise resolving to a function that returns the next token.
     */
    e.getChottoMashinaNext = function() {
      return r(i, void 0, void 0, function() {
        var t, n;
        return o(this, function(r) {
          switch (r.label) {
            case 0:
              return [4, e.readInput()]; // Await the input string.
            case 1:
              t = r.sent(); // Store the input string.
              // Define an inner generator function for custom tokenization.
              n = function() {
                var e, n, r;
                return o(this, function(o) {
                  switch (o.label) {
                    case 0:
                      e = -1; // `e` stores the starting index of the current token.
                      n = 0; // `n` is the current character index.
                      o.label = 1;
                    case 1:
                      // Loop while `n` is within the bounds of the string length.
                      return n <= t.length ?
                        // Check if the current character is NOT whitespace AND not end of string.
                        (" " !== t[n] && "\n" !== t[n] && n !== t.length) ?
                        [3, 5] : // If not whitespace, continue building the token.
                        // If it IS whitespace or end of string, check if a token was being built.
                        (-1 !== e ? [3, 2] : [3, 6]) // If `e` is not -1, yield the token; otherwise, just continue.
                        :
                        [3, 7]; // If `n` is past string length, end the generator.
                    case 2:
                      r = t.substring(e, n); // Extract the token using the start (`e`) and end (`n`) indices.
                      e = -1; // Reset `e` as the token has been extracted.
                      return [4, r]; // Yield the extracted token.
                    case 3:
                      o.sent(); // Consume the yielded value.
                      o.label = 4;
                    case 4:
                      return [3, 6]; // Continue to the next character.
                    case 5:
                      // If `e` is -1, it means a new token is starting.
                      if (-1 === e) {
                        e = n; // Set `e` to the current character's index.
                      }
                      o.label = 6;
                    case 6:
                      n++; // Move to the next character.
                      return [3, 1]; // Loop back.
                    case 7:
                      return [2]; // End of generator.
                  }
                });
              }(); // Immediately invoke the generator function to get the generator object.
              // Return a function that, when called, gets the next token from the custom tokenizer.
              return [2, function() {
                return n.next().value;
              }];
          }
        });
      });
    };


    /**
     * `getChottoMashinaNextInt` is an exported function that returns an async function.
     * The returned function reads input using `getChottoMashinaNext` and provides
     * a function that yields the next token parsed as an integer.
     *
     * @returns {Promise<function(): number>} A promise resolving to a function that returns the next int.
     */
    e.getChottoMashinaNextInt = function() {
      return r(i, void 0, void 0, function() {
        var t;
        return o(this, function(n) {
          switch (n.label) {
            case 0:
              return [4, e.getChottoMashinaNext()]; // Await the function that returns the next token.
            case 1:
              t = n.sent(); // Store the token-getting function.
              // Return a function that, when called, gets a token and parses it as an integer.
              return [2, function() {
                return parseInt(t());
              }];
          }
        });
      });
    };
  },

  // Module 1: A simple module that exports the Node.js 'fs' (file system) module.
  1: function(t, e) {
    // This is a standard CommonJS export.
    t.exports = require("fs");
  },

  // Module 15: The main entry point of the application.
  15: function(t, e, n) {
    "use strict";

    // Re-declaration of `__awaiter` and `__generator` helpers.
    // This redundancy is common in bundled code where modules might be compiled independently.
    var r = this && this.__awaiter || function(t, e, n, r) {
      return new(n || (n = Promise))(function(o, u) {
        function i(t) {
          try {
            l(r.next(t));
          } catch (t) {
            u(t);
          }
        }

        function a(t) {
          try {
            l(r.throw(t));
          } catch (t) {
            u(t);
          }
        }

        function l(t) {
          t.done ? o(t.value) : new n(function(e) {
            e(t.value);
          }).then(i, a);
        }
        l((r = r.apply(t, e || [])).next());
      });
    };
    var o = this && this.__generator || function(t, e) {
      var n, r, o, u, i = {
        label: 0,
        sent: function() {
          if (1 & o[0]) throw o[1];
          return o[1];
        },
        trys: [],
        ops: []
      };
      return u = {
        next: a(0),
        throw: a(1),
        return: a(2)
      }, "function" == typeof Symbol && (u[Symbol.iterator] = function() {
        return this;
      }), u;

      function a(u) {
        return function(a) {
          return function(u) {
            if (n) throw new TypeError("Generator is already executing.");
            for (; i;)
              try {
                if (n = 1, r && (o = 2 & u[0] ? r.return : u[0] ? r.throw || ((o = r.return) && o.call(r), 0) : r.next) && !(o = o.call(r, u[1])).done) return o;
                switch (r = 0, o && (u = [2 & u[0], o.value]), u[0]) {
                  case 0:
                  case 1:
                    o = u;
                    break;
                  case 4:
                    return i.label++, {
                      value: u[1],
                      done: !1
                    };
                  case 5:
                    i.label++, r = u[1], u = [0];
                    continue;
                  case 7:
                    u = i.ops.pop(), i.trys.pop();
                    continue;
                  default:
                    if (!(o = (o = i.trys).length > 0 && o[o.length - 1]) && (6 === u[0] || 2 === u[0])) {
                      i = 0;
                      continue;
                    }
                    if (3 === u[0] && (!o || u[1] > o[0] && u[1] < o[3])) {
                      i.label = u[1];
                      break;
                    }
                    if (6 === u[0] && i.label < o[1]) {
                      i.label = o[1], o = u;
                      break;
                    }
                    if (o && i.label < o[2]) {
                      i.label = o[2], i.ops.push(u);
                      break;
                    }
                    o[2] && i.ops.pop(), i.trys.pop();
                    continue;
                }
                u = e.call(t, i);
              } catch (t) {
                u = [6, t], r = 0;
              } finally {
                n = o = 0;
              }
            if (5 & u[0]) throw u[1];
            return {
              value: u[0] ? u[1] : void 0,
              done: !0
            };
          }([u, a]);
        };
      }
    };

    // Store the `this` context.
    var u = this;

    // Mark this module as an ES module.
    e.__esModule = !0;

    // Import the utility functions from Module 0.
    var i = n(0);

    // Main asynchronous logic of the application.
    r(u, void 0, void 0, function() {
      // Declare variables used in the generator.
      var t, e, n, r, u, a, l, c, s, f, h, p, b, d;
      return o(this, function(o) {
        switch (o.label) {
          case 0:
            // Asynchronously get the function to retrieve the next integer from input.
            return [4, i.getChottoMashinaNextInt()];
          case 1:
            // Call the function three times to get three integer values.
            t = o.sent(); // `t` becomes the integer-getting function.
            e = t(); // First integer.
            n = t(); // Second integer.
            r = t(); // Third integer.

            // Helper function to calculate Hamming distance between two numbers.
            // It counts the number of bits that differ up to 'e' bits.
            if (1 !== function(t, n) {
                for (var r = 0, o = 0; o < e; o++) {
                  // Check if the o-th bit is different in t and n.
                  (t & 1 << o) != (n & 1 << o) && r++;
                }
                return r;
              }(n, r)) {
              // If the Hamming distance between `n` and `r` is not 1, print "NO" and exit.
              return console.log("NO"), [2];
            }

            // Helper function `u`: Expands an array by appending shifted values.
            // It duplicates the array elements, adds a shifted bit to the duplicates,
            // effectively creating a larger array.
            u = function(t, e) {
              // Create a new array twice the size of the input array.
              for (var n = new Array(2 * t.length), r = 0; r < t.length; r++) {
                n[r] = t[r]; // Copy original elements.
              }
              var o = t.length - 1; // Start from the last index of the original array.
              for (r = t.length; r < n.length; r++) {
                // Append original elements in reverse order,
                // with `1 << e` (a bitmask) added to each.
                n[r] = t[o--] + (1 << e);
              }
              return n;
            };

            // Helper function `a`: Finds the index of an element in an array.
            // Returns -1 if not found.
            a = function(t, e) {
              for (var n = 0; n < e.length; n++) {
                if (e[n] === t) {
                  return n;
                }
              }
              return -1;
            };

            // Main sequence generation logic (`l`).
            // This function dynamically builds a sequence based on `e`, `n`, and `r`.
            l = function(t) {
              for (var e = [0, 1], o = 1; o < t; o++) {
                // If the o-th bit of `n` and `r` are different.
                if ((n & 1 << o) != (r & 1 << o)) {
                  for (
                    // `i` is a mask for bits less than `o`.
                    var i = n & (1 << o) - 1,
                      // `l` (local) is a helper for calculating previous index in a circular array.
                      l = function(t) {
                        return (t - 1 + e.length) % e.length;
                      },
                      c = [], // Temporary array for rebuilding `e`.
                      // `s` finds the index of `i` in `e` and then gets the previous element's index.
                      s = l(a(i, e)); e[s] !== i; s = l(s)
                  ) {
                    c.push(e[s]); // Add elements from `e` before `i` to `c`.
                  }
                  c.push(i); // Add `i` itself.
                  e = c; // Update `e` with the new sequence.
                }
                e = u(e, o); // Expand `e` using the `u` helper function.
              }
              return e; // Return the final sequence.
            }(e); // Call `l` with the value of `e`.

            c = a(n, l); // Find the index of `n` in the generated sequence `l`.

            // `f` (local): Calculates the previous index in a circular array `l`.
            f = function(t) {
              return (t - 1 + l.length) % l.length;
            };

            // `s` (local): Calculates the next index in a circular array `l`.
            s = function(t) {
              return (t + 1) % l.length;
            };

            h = s(c); // Get the element immediately after `c` in `l` (circularly).
            p = f(c); // Get the element immediately before `c` in `l` (circularly).

            // Check if the element after `c` (forward direction) is `r`.
            if (l[h] === r) {
              b = []; // Initialize path array.
              d = c; // Start `d` at the index of `n`.
              // Traverse backwards from `d` until `h` is reached.
              for (; d !== h; d = f(d)) {
                b.push(l[d]); // Add elements to the path.
              }
              b.push(r); // Add `r` to complete the path.
              console.log("YES");
              console.log(b.join(" ")); // Print "YES" and the path.
            }
            // Else, check if the element before `c` (backward direction) is `r`.
            else if (l[p] === r) {
              b = []; // Initialize path array.
              d = c; // Start `d` at the index of `n`.
              // Traverse forwards from `d` until `p` is reached.
              for (; d !== p; d = s(d)) {
                b.push(l[d]); // Add elements to the path.
              }
              b.push(r); // Add `r` to complete the path.
              console.log("YES");
              console.log(b.join(" ")); // Print "YES" and the path.
            } else {
              // If `r` is neither the immediate next nor previous element, print "NO".
              console.log("NO");
            }
            return [2]; // End of the main logic.
        }
      });
    });
  }
});