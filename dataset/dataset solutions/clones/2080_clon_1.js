/*! path: /contest/atcoder/panasonic2020/c.ts */
/* This is the entry point for the webpack bundled application. */
/******/ (function (modules) {

    // webpackBootstrap: This is the core Webpack runtime.
    // It manages modules and their dependencies.

    /* The module cache stores loaded modules to avoid redundant loading. */
    var installedModules = {};


    /**
     * The require function: This is how modules request and receive their dependencies.
     * @param {string} moduleId - The identifier of the module to load.
     * @returns {object} The exports of the requested module.
     */
    function __webpack_require__(moduleId) {

        /* Check if the module is already in the cache. */
        if (installedModules[moduleId]) {

            return installedModules[moduleId].exports;
        }

        // Create a new module entry in the cache.
        // It initializes with basic properties.
        var module = installedModules[moduleId] = {
            i: moduleId, // Module ID
            l: false,    // Loaded flag, initially false
            exports: {}  // The exports object for this module
        };

        // Execute the module function, populating its exports.
        // `this` is bound to `module.exports`, and it receives module, exports, and __webpack_require__.
        modules[moduleId].call(
            module.exports,
            module,
            module.exports,
            __webpack_require__
        );

        // Mark the module as loaded after execution.
        module.l = true;

        // Return the exports of the module.
        return module.exports;
    }


    /* Expose the modules object (__webpack_modules__) for introspection. */
    __webpack_require__.m = modules;


    /* Expose the module cache for debugging or advanced scenarios. */
    __webpack_require__.c = installedModules;


    /**
     * Define getter function for harmony exports.
     * This helps in creating non-enumerable getters for ES module exports.
     * @param {object} exports - The exports object.
     * @param {string} name - The name of the export.
     * @param {function} getter - The function to get the value of the export.
     */
    __webpack_require__.d = function (exports, name, getter) {
        if (!__webpack_require__.o(exports, name)) {
            Object.defineProperty(exports, name, {
                enumerable: true,
                get: getter
            });
        }
    };


    /**
     * Define __esModule on exports.
     * This marks an exports object as an ES module.
     * @param {object} exports - The exports object to mark.
     */
    __webpack_require__.r = function (exports) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
        }
        Object.defineProperty(exports, '__esModule', { value: true });
    };


    /**
     * Create a fake namespace object for compatibility.
     * This handles various module types (ES modules, CommonJS, etc.).
     * @param {any} value - The module value.
     * @param {number} mode - Flags indicating how to interpret the value.
     * @returns {object} The namespace object.
     */
    __webpack_require__.t = function (value, mode) {
        if (mode & 1) value = __webpack_require__(value); // mode & 1: value is a module id, require it.
        if (mode & 8) return value; // mode & 8: behave like require.
        if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value; // mode & 4: return value when already ns object.

        // Create a new namespace object.
        var ns = Object.create(null);
        __webpack_require__.r(ns); // Mark as ES module.

        Object.defineProperty(ns, 'default', { enumerable: true, value: value });

        // If mode & 2 and value is not a string, merge all properties into the namespace.
        if (mode & 2 && typeof value != 'string')
            for (var key in value)
                __webpack_require__.d(ns, key, function (key) { return value[key]; }.bind(null, key));

        return ns;
    };


    /**
     * getDefaultExport function for compatibility with non-harmony modules.
     * This provides a way to get the default export, even if it's a CommonJS module.
     * @param {object} module - The module object.
     * @returns {function} A getter function for the default export.
     */
    __webpack_require__.n = function (module) {
        var getter = module && module.__esModule ?
            function getDefault() { return module['default']; } :
            function getModuleExports() { return module; };
        __webpack_require__.d(getter, 'a', getter);
        return getter;
    };


    /**
     * Object.prototype.hasOwnProperty.call wrapper.
     * This is a safe way to check for own properties.
     * @param {object} object - The object to check.
     * @param {string} property - The property name.
     * @returns {boolean} True if the object has the specified property.
     */
    __webpack_require__.o = function (object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };


    /* __webpack_public_path__: The public path for assets. */
    __webpack_require__.p = "";


    /* Load the entry module and return its exports. */
    return __webpack_require__(
        __webpack_require__.s = "./src/contest/atcoder/panasonic2020/c.ts"
    );

})
/************************************************************************/
/******/ ({

    /***/ "./node_modules/webpack/buildin/module.js":
    /*!***********************************!*\
      !*** (webpack)/buildin/module.js ***!
      \***********************************/
    /*! no static exports found */
    /***/ (function (module, exports) {

        /*
         * This module provides a polyfill for the Node.js `module` object
         * within a Webpack bundled environment.
         */
        module.exports = function (module) {
            if (!module.webpackPolyfill) {
                // Initialize polyfill properties if not already present.
                module.deprecate = function () { };
                module.paths = [];
                /* module.parent is typically undefined in browser environments by default */
                if (!module.children) {
                    module.children = [];
                }

                // Define 'loaded' property as a getter for 'l'.
                Object.defineProperty(module, "loaded", {
                    enumerable: true,
                    get: function () {
                        return module.l;
                    }
                });

                // Define 'id' property as a getter for 'i'.
                Object.defineProperty(module, "id", {
                    enumerable: true,
                    get: function () {
                        return module.i;
                    }
                });
                module.webpackPolyfill = 1; // Mark as polyfilled.
            }
            return module;
        };


    /***/ }),

    /***/ "./src/contest/atcoder/panasonic2020/c.ts":
    /*!************************************************!*\
      !*** ./src/contest/atcoder/panasonic2020/c.ts ***!
      \************************************************/
    /*! no static exports found */
    /***/ (function (module, exports, __webpack_require__) {

        "use strict"; /* This file uses strict mode. */
        /* WEBPACK VAR INJECTION: This function wraps the module code for variable injection. */
        (function (module) {

            /* Helper function for default imports. */
            var __importDefault = (this && this.__importDefault) || function (mod) {
                return (mod && mod.__esModule) ? mod : { "default": mod };
            };

            /* Mark this module as an ES module. */
            Object.defineProperty(exports, "__esModule", { value: true });

            /* Initialize exports.main as undefined. */
            exports.main = void 0;

            /* Import the 'fs' module using __importDefault for compatibility. */
            const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));


            /**
             * Recursive function to generate permutations of characters.
             * It builds strings of length 'N' using characters from 'a' up to 'a' + max.
             *
             * @param {number} len - The current length of the string being built.
             * @param {number} max - The maximum character index used so far (e.g., 0 for 'a', 1 for 'b').
             * @param {object} sys - System state containing N, ans (result array), and current (current string).
             */
            function rec(len, max, sys) {
                const { N, ans, current } = sys; // Destructure system parameters.

                // Base case: If current string length equals N, add it to results.
                if (len === N) {
                    ans.push(current);
                    return;
                }

                // Iterate through possible characters for the current position.
                // Characters range from 'a' to 'a' + max.
                for (let i = 0; i <= max; i++) {
                    const ch = String.fromCharCode('a'.charCodeAt(0) + i); // Get the character.

                    // Recursive call: extend the string and update max character used.
                    rec(
                        len + 1,
                        Math.max(max, i + 1), // Max char index for the next level.
                        { N, ans, current: current + ch } // Pass updated current string.
                    );
                }
            }


            /**
             * Solves the problem by generating all possible character sequences.
             *
             * @param {object} options - An object containing the input N.
             * @param {number} options.N - The desired length of the character sequences.
             * @returns {string[]} An array of generated strings.
             */
            function solve({ N, }) {
                const ans = []; // Initialize an empty array to store results.

                // Start the recursive generation process.
                // Initial call: length 0, max char index 0 ('a'), empty string.
                rec(0, 0, { N, ans, current: '' });

                return ans; // Return the collected answers.
            }


            /**
             * Main function to process input and output results.
             * It reads a number N, generates sequences, and prints them.
             *
             * @param {string} line - The input line containing the number N.
             */
            function main(line) {
                const N = parseInt(line); // Parse the input string to an integer.

                const ans = solve({ N }); // Call the solver function.

                // Iterate through the generated answers and print each one.
                for (const str of ans) {
                    console.log(str);
                }
            }

            exports.main = main; // Export the main function.

            // Check if this module is the main entry point (executed directly).
            if (__webpack_require__.c[__webpack_require__.s] === module) {
                // Read input from /dev/stdin (standard input).
                const line = fs_1.default.readFileSync("/dev/stdin", "utf8");
                main(line); // Execute the main logic.
            }

            /* WEBPACK VAR INJECTION: This concludes the variable injection wrapper. */
        }.call(this, __webpack_require__(/*! ./../../../../node_modules/webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

    /***/ }),

    /***/ "fs":
    /*!*********************!*\
      !*** external "fs" ***!
      \*********************/
    /*! no static exports found */
    /***/ (function (module, exports) {

        /*
         * This module is an external dependency, directly requiring Node.js's 'fs' module.
         * Webpack does not bundle it, but expects it to be available in the runtime environment.
         */
        module.exports = require("fs");

    /***/ })

/******/ });
//# sourceMappingURL=submit.js.map