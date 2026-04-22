/* This file is a Type I clone generated from an original JavaScript source. */
/* All functional aspects, variable names, and logic remain entirely unchanged. */
/* Only whitespace (spaces, tabs, newlines) and comments have been modified extensively */
/* to create a visually distinct but semantically identical version. */

/*! path: /contest/atcoder/tenka1-2017/c.ts */
(function (modules) { // Primary webpack bootstrap function starts here.

  // The internal module cache used by webpack.
  var installedModules = {};

  // The custom require function used to load modules within this bundle.
  function __webpack_require__ (moduleId) {

    // First, check if the module is already in our cache.
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports; // If so, return its exports immediately.
    }

    // If not in cache, create a new module entry.
    var module = installedModules[moduleId] = {
      i: moduleId,      // Store the module ID.
      l: false,         // Mark as not yet loaded.
      exports: {}       // Initialize an empty exports object.
    };

    // Execute the module function.
    // 'this' context is module.exports, parameters are module, module.exports, and the __webpack_require__ function itself.
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

    // After execution, mark the module as loaded.
    module.l = true;

    // Finally, return the exports of the module.
    return module.exports;
  }


  // Expose the modules object containing all defined modules.
  __webpack_require__.m = modules;

  // Expose the module cache for external access if needed.
  __webpack_require__.c = installedModules;


  // Utility function to define a getter for harmony exports (ES modules).
  __webpack_require__.d = function (exports, name, getter) {
    if (!__webpack_require__.o(exports, name)) { // Check if property doesn't already exist.
      Object.defineProperty(exports, name, { enumerable: true, get: getter });
    }
  };

  // Utility function to define __esModule on exports for ES module compatibility.
  __webpack_require__.r = function (exports) {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    }
    Object.defineProperty(exports, '__esModule', { value: true });
  };

  // Helper function to create a fake namespace object from various module types.
  __webpack_require__.t = function (value, mode) {
    if (mode & 1) value = __webpack_require__(value); // If mode 1, treat 'value' as a module ID and require it.
    if (mode & 8) return value; // If mode 8, return the value directly.
    if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value; // If mode 4 and value is already an ES module, return it.

    var ns = Object.create(null); // Create a new plain object for the namespace.
    __webpack_require__.r(ns); // Mark it as an ES module.

    Object.defineProperty(ns, 'default', { enumerable: true, value: value }); // Set the 'default' export.

    // If mode 2 and value is not a string, merge all properties into the namespace.
    if (mode & 2 && typeof value != 'string')
      for (var key in value)
        __webpack_require__.d(ns, key, function (key) { return value[key]; }.bind(null, key));

    return ns; // Return the constructed namespace object.
  };

  // Utility to get default export for compatibility with non-harmony modules.
  __webpack_require__.n = function (module) {
    var getter = module && module.__esModule ?
      function getDefault () { return module['default']; } : // If ES module, return its default export.
      function getModuleExports () { return module; };      // Otherwise, return the module itself.
    __webpack_require__.d(getter, 'a', getter); // Attach an 'a' property to the getter.
    return getter;
  };

  // Wrapper for Object.prototype.hasOwnProperty.call.
  __webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };

  // The public path for assets, typically set by webpack.
  __webpack_require__.p = "";


  // Load the entry module of the application and return its exports.
  return __webpack_require__(__webpack_require__.s = "./src/contest/atcoder/tenka1-2017/c.ts");
})
// End of the main webpack wrapper function.
({

  /***/ "./node_modules/webpack/buildin/module.js":
  /* This is a webpack built-in module to polyfill Node.js 'module' object properties. */
  /***/ (function (module, exports) {

    module.exports = function (module) {
      if (!module.webpackPolyfill) {
        module.deprecate = function () { }; // No-op for deprecation warnings.
        module.paths = []; // Initialize an empty paths array.
        // module.parent is undefined by default in webpack.
        if (!module.children) module.children = []; // Ensure module.children array exists.

        Object.defineProperty(module, "loaded", {
          enumerable: true,
          get: function () {
            return module.l; // Getter for the 'loaded' status.
          }
        });
        Object.defineProperty(module, "id", {
          enumerable: true,
          get: function () {
            return module.i; // Getter for the module's ID.
          }
        });
        module.webpackPolyfill = 1; // Mark the module as having webpack polyfills applied.
      }
      return module;
    };


    /***/
  }),

  /***/ "./src/contest/atcoder/tenka1-2017/c.ts":
  /* This is the core logic file for the AtCoder Tenka1-2017 C problem. */
  /***/ (function (module, exports, __webpack_require__) {

    "use strict";
    /* WEBPACK VAR INJECTION */
    (function (module) {
      var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
      };
      // Define __esModule property on exports for ES module compatibility.
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.main = void 0; // Initialize 'main' export as undefined.

      // Import the 'fs' (file system) module, potentially from Node.js globals.
      const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
      // Import custom I/O utility functions from a common path.
      const io_1 = __webpack_require__(/*! ../../common/io */ "./src/contest/common/io.ts");

      /**
       * Solves the problem: find positive integers h, n, w such that 1/N = 1/h + 1/n + 1/w.
       * The problem is constrained to find one such triplet.
       * A common approach involves fixing two variables and solving for the third.
       * Here, 'c' is iterated, effectively fixing two terms indirectly.
       */
      function solve ({ N, }) {
        // The problem can be rewritten as: 1/w = 1/N - 1/h - 1/n
        // If we set h = N, then 1/w = 1/N - 1/N - 1/n = -1/n, which doesn't work for positive integers.
        // A known solution pattern for 1/N = 1/h + 1/n + 1/w is to iterate h and n,
        // then calculate w = (N * h * n) / (h*n - N*n - N*h).
        // Another common approach for this specific problem (often seen in AtCoder)
        // is to iterate two variables and derive the third.
        // If we set h = N, and n = c * N, then 1/N = 1/N + 1/(cN) + 1/w
        // This simplifies to 0 = 1/(cN) + 1/w, leading to negative w, not valid.
        // The common trick used for this problem is 1/N = 1/h + 1/n + 1/w.
        // Let's assume h, n, w are such that N is related.
        // The provided solution iterates 'c' and finds values for h, n, w based on N and c.
        // The formula for the third term derived from 1/N = 1/x + 1/y + 1/z is
        // if x = N, y = cN, then 1/z = 1/N - 1/N - 1/(cN) = -1/(cN). This is not correct for positive integers.
        // The actual logic here seems to directly derive three terms based on N and an iterating `c`.
        // The comment `// 1/N + 1/cN + 1 / (cN / (3c - 1))` looks like a hint for the structure of the terms.
        // It implies the three terms are N, cN, and cN / (3c - 1). Let's verify:
        // 1/N + 1/(cN) + 1/(cN / (3c - 1))
        // = 1/N + 1/(cN) + (3c - 1)/(cN)
        // = (c + 1 + 3c - 1) / (cN)
        // = (4c) / (cN) = 4/N. This is not 1/N.
        // The comment is likely a partial thought or a different problem.
        // The actual code logic is:
        // iterate `c`. Calculate `cN = c * N` and `tc1 = 3 * c - 1`.
        // If `cN` is divisible by `tc1`, then the solution is `[N, cN, cN / tc1]`.
        // Let's test this:
        // 1/N = 1/N + 1/(cN) + 1/(cN / (3c - 1))
        // Is this the equation? No, the problem is 1/N = 1/h + 1/n + 1/w.
        // The solution found is [N, cN, cN / (3c - 1)].
        // So the terms are h=N, n=cN, w=cN/(3c-1).
        // Let's check if 1/N = 1/N + 1/(cN) + 1/(cN / (3c - 1))
        // This would mean 0 = 1/(cN) + (3c - 1)/(cN) = (1 + 3c - 1)/(cN) = 3c/(cN) = 3/N.
        // This is not 0, so the terms are NOT h=N, n=cN, w=cN/(3c-1) used in the sum.
        // The problem is to find h, n, w. The solution *returns* [N, cN, cN / tc1].
        // This implies h=N, n=cN, w=cN/tc1 are *the values* h, n, w.
        // Let's check the sum 1/h + 1/n + 1/w for these values.
        // 1/N + 1/(cN) + 1/(cN / (3c - 1))
        // = 1/N + 1/(cN) + (3c - 1)/(cN)
        // = (c + 1 + 3c - 1) / (cN)
        // = 4c / (cN) = 4/N.
        // The problem statement is 1/N = 1/h + 1/n + 1/w.
        // This implies the problem is searching for `h, n, w` such that `4/N = 1/h + 1/n + 1/w`.
        // No, the contest is Tenka1-2017 C. The problem is usually "4/N = 1/h + 1/n + 1/w".
        // Ah, the problem statement is almost certainly "4/N = 1/h + 1/n + 1/w".
        // The comment `// 1/N + 1/cN + 1 / (cN / (3c - 1))` is actually a calculation of the sum
        // 1/h + 1/n + 1/w if h=N, n=cN, w=cN/(3c-1).
        // Let's re-evaluate:
        // 1/N + 1/(cN) + (3c-1)/(cN) = (c + 1 + 3c - 1) / (cN) = 4c / (cN) = 4/N.
        // So the solution `[N, cN, cN / (3c - 1)]` correctly yields 4/N.
        // The comment was a bit misleading in its initial form but the calculation is correct for 4/N.
        for (let c = 1;; c++) { // Loop indefinitely, 'c' starting from 1.
          const cN = c * N; // Calculate c times N.
          const tc1 = 3 * c - 1; // Calculate (3 * c) minus 1.

          // If cN is perfectly divisible by tc1, we found our integer 'w'.
          if (cN % tc1 === 0) {
            return [N, cN, cN / tc1]; // Return the triplet [h, n, w].
          }
        }
      }

      // The main function that processes the input line and prints the output.
      function main (line) {
        const next = io_1.getNext(line); // Get a function to sequentially retrieve tokens from the input line.
        const N = io_1.getInt(next); // Parse the integer N from the first token.

        const [a, b, c] = solve({ N }); // Call the solve function with N and destructure the returned array.

        console.log(a, b, c); // Print the three found integers to standard output.
      }
      exports.main = main; // Export the main function for external use (e.g., testing).

      // This block checks if the current module is the main entry point of the application.
      if (__webpack_require__.c[__webpack_require__.s] === module) {
        const line = fs_1.default.readFileSync("/dev/stdin", "utf8"); // Read the entire input from standard input.
        main(line); // Execute the main function with the read input line.
      }

      /* WEBPACK VAR INJECTION */
    }.call(this, __webpack_require__(/*! ./../../../../node_modules/webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

    /***/
  }),

  /***/ "./src/contest/common/io.ts":
  /* This file contains common input/output utility functions for competitive programming. */
  /***/ (function (module, exports, __webpack_require__) {

    "use strict";

    Object.defineProperty(exports, "__esModule", { value: true });
    // Export various I/O functions, initialized as undefined, then assigned below.
    exports.getIntArray = exports.getInt = exports.getNextBigInt = exports.getNextInt = exports.getNext = exports.getIteratorWithParser = exports.getIterator = void 0;

    /**
     * A generator function that yields tokens from an input line, split by whitespace.
     * @param {string} line - The input string line.
     */
    function* getIterator (line) {
      const tokens = line.split(/\s+/); // Split the line by one or more whitespace characters.
      for (const token of tokens) {      // Iterate over each resulting token.
        yield token;                     // Yield the current token.
      }
    }
    exports.getIterator = getIterator; // Export the getIterator generator.

    /**
     * A generator function that yields parsed tokens from an input line.
     * @param {string} line - The input string line.
     * @param {function(string): any} parser - A function to parse each token.
     */
    function* getIteratorWithParser (line, parser) {
      const tokens = line.split(/\s+/); // Split the line into tokens.
      for (const token of tokens) {      // For each token...
        yield parser(token);             // ...yield the result of parsing it.
      }
    }
    exports.getIteratorWithParser = getIteratorWithParser; // Export the parsing iterator.

    /**
     * Returns a function that, when called, provides the next token from the input line.
     * @param {string} line - The input string line.
     * @returns {function(): string} A function to get the next token.
     */
    function getNext (line) {
      const it = getIterator(line); // Create an iterator for the line.
      return () => it.next().value; // Return a function that calls next() and returns its value.
    }
    exports.getNext = getNext; // Export the getNext function factory.

    /**
     * Returns a function that, when called, provides the next token from the input line as an integer.
     * @param {string} line - The input string line.
     * @returns {function(): number} A function to get the next integer.
     */
    function getNextInt (line) {
      const it = getIterator(line); // Create an iterator for the line.
      return () => parseInt(it.next().value); // Return a function that parses the next token as an integer.
    }
    exports.getNextInt = getNextInt; // Export the getNextInt function factory.

    /**
     * Returns a function that, when called, provides the next token from the input line as a BigInt.
     * @param {string} line - The input string line.
     * @returns {function(): bigint} A function to get the next BigInt.
     */
    function getNextBigInt (line) {
      const it = getIterator(line); // Create an iterator.
      return () => BigInt(it.next().value); // Return a function that converts the next token to BigInt.
    }
    exports.getNextBigInt = getNextBigInt; // Export the getNextBigInt function factory.

    /**
     * Parses the next token provided by a 'next' function as an integer.
     * @param {function(): string} next - A function that returns the next token.
     * @returns {number} The parsed integer.
     */
    function getInt (next) {
      return parseInt(next()); // Call the 'next' function and parse its result as an integer.
    }
    exports.getInt = getInt; // Export the getInt utility.

    /**
     * Reads N integers from the input using the 'next' function and returns them as an array.
     * @param {function(): string} next - A function that returns the next token.
     * @param {number} N - The number of integers to read.
     * @returns {number[]} An array containing N parsed integers.
     */
    function getIntArray (next, N) {
      const res = []; // Initialize an empty array.
      for (let i = 0; i < N; i++) { // Loop N times.
        res[i] = parseInt(next()); // Read and parse each integer, storing it in the array.
      }
      return res; // Return the populated array.
    }
    exports.getIntArray = getIntArray; // Export the getIntArray utility.


    /***/
  }),

  /***/ "fs":
  /* This module simply re-exports the Node.js built-in 'fs' (file system) module. */
  /***/ (function (module, exports) {

    module.exports = require("fs"); // Forward the Node.js 'fs' module.

    /***/
  })

});
// End of the complete webpack bundle.
// This comment visually marks the conclusion of the generated code.
//# sourceMappingURL=submit.js.map