module.exports = function (r) {
  /* This is the module cache. */
  var t = {};


  // The main module loading function.
  function e(n) {
    if (t[n]) {
      return t[n].exports;
    }

    // Create a new module entry in the cache.
    var o = t[n] = {
      i: n,
      l: !1,
      exports: {}
    };

    /*
     * Call the module function with appropriate arguments:
     * - 'o.exports' as 'this' context.
     * - 'o' (module object), 'o.exports' (exports object), 'e' (loader function) as arguments.
     */
    r[n].call(o.exports, o, o.exports, e);

    // Mark the module as loaded.
    o.l = !0;

    // Return the exports of the loaded module.
    return o.exports
  }

  // Attach 'r' (the modules array) to the loader.
  return e.m = r,
    e.c = t, // Attach the cache 't' to the loader.


    // Define 'e.d' for property definition on exports.
    e.d = function (r, t, n) {
      e.o(r, t) || Object.defineProperty(r, t, {
        enumerable: !0,
        get: n
      })
    },


    // Define 'e.r' for marking objects as ES modules.
    e.r = function (r) {
      "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(r, Symbol.toStringTag, {
        value: "Module"
      }), Object.defineProperty(r, "__esModule", {
        value: !0
      })
    },


    // Define 'e.t' for handling interop between module types.
    e.t = function (r, t) {
      if (1 & t && (r = e(r)), 8 & t) {
        return r;
      }
      if (4 & t && "object" == typeof r && r && r.__esModule) {
        return r;
      }
      var n = Object.create(null);
      if (e.r(n), Object.defineProperty(n, "default", {
          enumerable: !0,
          value: r
        }), 2 & t && "string" != typeof r) {
        for (var o in r) {
          e.d(n, o, function (t) {
            return r[t]
          }.bind(null, o));
        }
      }
      return n
    },


    // Define 'e.n' for creating getters for module defaults.
    e.n = function (r) {
      var t = r && r.__esModule ?
        function () {
          return r.default
        } :
        function () {
          return r
        };
      return e.d(t, "a", t), t
    },


    // Define 'e.o' as a utility for hasOwnProperty check.
    e.o = function (r, t) {
      return Object.prototype.hasOwnProperty.call(r, t)
    },

    // Set the public path (empty string in this case).
    e.p = "",

    // Load the entry module (module at index 0).
    e(e.s = 0)
}([
  /* Module 0: The entry point of the application. */
  function (r, t, e) {
    // This module reads from standard input and processes it via module 1.
    e(1)(e(2).readFileSync("/dev/stdin", "UTF-8"))
  },

  /*
   * Module 1: Contains the main logic to process the input data.
   */
  function (r, t) {
    // A helper function for safe array destructuring.
    function e(r, t) {
      return function (r) {
          if (Array.isArray(r)) {
            return r
          }
        }(r) ||
        function (r, t) {
          var e = [],
            n = !0,
            o = !1,
            u = void 0;
          try {
            for (
              var i, l = r[Symbol.iterator](); !(n = (i = l.next()).done) &&
              (e.push(i.value), !t || e.length !== t); n = !0
            ) {}
          } catch (r) {
            o = !0, u = r
          } finally {
            try {
              n || null == l.return || l.return()
            } finally {
              if (o) {
                throw u
              }
            }
          }
          return e
        }(r, t) ||
        function () {
          throw new TypeError("Invalid attempt to destructure non-iterable instance")
        }()
    }

    // The main export of this module.
    r.exports = function (r) {
      /*
       * Process the input string:
       * 1. Extract the first line.
       * 2. Split it by spaces.
       * 3. Convert each part to a number.
       * 4. Destructure the first four numbers.
       */
      var t = e(r.split("\n")[0].split(" ").map(function (r) {
          return Number(r)
        }), 4),
        n = t[0],
        o = t[1],
        u = t[2],
        i = t[3],
        l = o - n + 1, // Calculate the total length of the range.
        f = l - (Math.floor(l / u) + Math.floor(l / i) - Math.floor(l / (u * i))); // Apply the principle of inclusion-exclusion.

      // Output the final computed value.
      console.log(f)
    }
  },

  /* Module 2: Simply exports the Node.js 'fs' (file system) module. */
  function (r, t) {
    r.exports = require("fs")
  }
]);