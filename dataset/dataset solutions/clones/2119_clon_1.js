/******/ (function (modules) {
    /* This is the webpackBootstrap function, responsible for module loading. */

    // The module cache: stores all loaded modules.
    var installedModules = {};


    // The core require function for loading modules.
    function __webpack_require__(moduleId) {

        // Check if the requested module is already in the cache.
        if (installedModules[moduleId]) {
            return installedModules[moduleId].exports; // If so, return its exports immediately.
        }

        /*
         * If the module is not in the cache:
         * Create a new module object and add it to the cache.
         */
        var module = installedModules[moduleId] = {
            i: moduleId,    // The module's ID.
            l: false,       // A flag indicating if the module has been loaded.
            exports: {}     // The module's exports object.
        };

        // Execute the module's function, passing in necessary parameters.
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

        // Mark the module as loaded after execution.
        module.l = true;

        // Return the exports of the module.
        return module.exports;
    }


    /*
     * Expose the 'modules' object to __webpack_require__.m.
     * This contains all the module definitions.
     */
    __webpack_require__.m = modules;

    /*
     * Expose the 'installedModules' cache to __webpack_require__.c.
     * This allows external access to the module cache.
     */
    __webpack_require__.c = installedModules;


    /*
     * Define a getter function for harmony exports.
     * This is used for ES Module compatibility.
     */
    __webpack_require__.d = function (exports, name, getter) {
        // If the property 'name' is not already defined on 'exports'.
        if (!__webpack_require__.o(exports, name)) {
            // Define a new property with an enumerable getter.
            Object.defineProperty(exports, name, { enumerable: true, get: getter });
        }
    };

    /*
     * Define the __esModule property on exports.
     * This indicates that the module is an ES module.
     */
    __webpack_require__.r = function (exports) {
        // If 'Symbol' and 'Symbol.toStringTag' are available.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
        }
        // Always set __esModule to true for ES modules.
        Object.defineProperty(exports, '__esModule', { value: true });
    };

    /*
     * Create a fake namespace object for compatibility.
     * This function handles various module import modes.
     *
     * mode & 1: value is a module ID, so require it.
     * mode & 2: merge all properties of value into the namespace object.
     * mode & 4: return value directly if it's already a namespace object.
     * mode & 8|1: behave like require, returning the module's exports.
     */
    __webpack_require__.t = function (value, mode) {
        // If mode 1 is set, treat value as a module ID and require it.
        if (mode & 1) value = __webpack_require__(value);

        // If mode 8 is set, return the value directly.
        if (mode & 8) return value;

        /*
         * If mode 4 is set, and value is an object that is already an ES module,
         * return it as is.
         */
        if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;

        // Create a new empty namespace object.
        var ns = Object.create(null);

        // Mark the new namespace object as an ES module.
        __webpack_require__.r(ns);

        // Define a 'default' export property, making the original value its content.
        Object.defineProperty(ns, 'default', { enumerable: true, value: value });

        /*
         * If mode 2 is set and value is not a string,
         * merge all properties from 'value' into the new namespace object.
         */
        if (mode & 2 && typeof value != 'string') {
            for (var key in value) {
                __webpack_require__.d(ns, key, function (key) { return value[key]; }.bind(null, key));
            }
        }
        return ns; // Return the constructed namespace object.
    };

    /*
     * getDefaultExport function for compatibility with non-harmony modules.
     * This creates a getter for the 'default' export of a module.
     */
    __webpack_require__.n = function (module) {
        // Determine the appropriate getter function.
        var getter = module && module.__esModule ?
            function getDefault() { return module['default']; } : // If it's an ES module, get its 'default' export.
            function getModuleExports() { return module; }; // Otherwise, return the module itself.

        // Define a property 'a' on the getter, which is the getter itself.
        __webpack_require__.d(getter, 'a', getter);
        return getter; // Return the getter function.
    };

    /*
     * Object.prototype.hasOwnProperty.call wrapper.
     * This is a safe way to check if an object has a property.
     */
    __webpack_require__.o = function (object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };

    // __webpack_public_path__: The base path for all assets.
    __webpack_require__.p = "";


    /*
     * Load the entry module and return its exports.
     * This is the starting point of the application bundle.
     */
    return __webpack_require__(__webpack_require__.s = "./src/ABC157/C.js");
})
/************************************************************************/
/******/ ({

    /***/ "./src/ABC157/C.js":
    /*!*************************!*\
      !*** ./src/ABC157/C.js ***!
      \*************************/
    /*! no static exports found */
    /***/ (function (module, exports, __webpack_require__) {

        eval("/*\n * Helper function to slice an array or iterable into a fixed number of elements.\n * Used for destructuring assignment compatibility in older environments.\n */\nfunction _slicedToArray(arr, i) {\n    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();\n} /* End of _slicedToArray function */\n\n/**\n * Throws an error if a non-iterable instance is attempted to be destructured,\n * and no other destructuring helper caught it.\n */\nfunction _nonIterableRest() {\n    throw new TypeError(\"Invalid attempt to destructure non-iterable instance\");\n} /* End of _nonIterableRest function */\n\n// This function attempts to convert an iterable into an array up to a certain limit.\nfunction _iterableToArrayLimit(arr, i) {\n    // Check if the input is actually iterable or an arguments object.\n    if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === \"[object Arguments]\")) {\n        return; /* If not iterable, return undefined. */\n    }\n\n    var _arr = []; // Initialize an empty array to store elements.\n    var _n = true; // Flag to indicate if iteration is still ongoing.\n    var _d = false; // Flag for whether an error occurred during iteration.\n    var _e = undefined; // Stores the error object if an error occurs.\n\n    try {\n        // Iterate over the input array/iterable.\n        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {\n            _arr.push(_s.value); // Add the current value to the temporary array.\n            if (i && _arr.length === i) {\n                break; // If the limit 'i' is reached, stop iteration.\n            }\n        }\n    } catch (err) {\n        _d = true; // Mark that an error occurred.\n        _e = err; // Store the error.\n    } finally {\n        try {\n            // If iteration was not done and a return method exists, call it.\n            if (!_n && _i[\"return\"] != null) {\n                _i[\"return\"]();\n            }\n        } finally {\n            // If an error occurred, re-throw it.\n            if (_d) {\n                throw _e;\n            }\n        }\n    }\n    return _arr; // Return the collected array elements.\n} /* End of _iterableToArrayLimit function */\n\n/*\n * Checks if an array is actually an array.\n * Part of the Babel destructuring transform.\n */\nfunction _arrayWithHoles(arr) {\n    if (Array.isArray(arr)) {\n        return arr; // If it's an array, return it directly.\n    }\n} /* End of _arrayWithHoles function */\n\n\n// Load the 'fs' (file system) module, which is an external dependency.\nvar fs = __webpack_require__(/*! fs */ \"fs\");\n\n/*\n * Define a constant for an incorrect or invalid result.\n * This value will be printed in error conditions.\n */\nvar INCORRECT = -1;\n\n/*\n * The main entry point function for the program logic.\n * It processes the input string to solve the problem.\n */\nvar main = function main(input) {\n\n    // Split the input string into an array of lines.\n    var lines = input.split('\\n');\n\n    /*\n     * Parse the first line of input to get N and M.\n     * N represents the number of digits, M represents the number of constraints.\n     */\n    var _lines$shift$split$ma = lines.shift().split(' ').map(function (i) {\n            return i - 0; // Convert string to number.\n        }),\n        _lines$shift$split$ma2 = _slicedToArray(_lines$shift$split$ma, 2),\n        N = _lines$shift$split$ma2[0],\n        M = _lines$shift$split$ma2[1];\n\n\n    var p = []; // Initialize an array 'p' to store the digits of the number.\n\n    // Populate 'p' with a default value of -1, indicating an unknown digit.\n    for (var i = 0; i < N; i++) {\n        p.push(-1);\n    }\n\n    /*\n     * Process M constraints. Each constraint specifies a digit\n     * at a particular position.\n     */\n    for (var _i2 = 0; _i2 < M; _i2++) {\n\n        // Read and parse each constraint line (s: position, c: digit).\n        var _lines$shift$split$ma3 = lines.shift().split(' ').map(function (i) {\n                return i - 0; // Convert string to number.\n            }),\n            _lines$shift$split$ma4 = _slicedToArray(_lines$shift$split$ma3, 2),\n            s = _lines$shift$split$ma4[0],\n            c = _lines$shift$split$ma4[1];\n\n\n        var column = s - 1; // Adjust s to be a zero-based index.\n\n        /*\n         * Check for conflicts: if a digit is already set for this column\n         * and it's different from the current constraint 'c'.\n         */\n        if (p[column] !== -1 && p[column] !== c) {\n            console.log(INCORRECT); // Output error and exit.\n            return;\n        }\n\n        p[column] = c; // Apply the digit constraint to the array.\n    }\n\n    /*\n     * Special handling for the first digit (most significant digit).\n     * If N > 1 and the first digit is 0, it's an invalid number unless N=1 and it's '0'.\n     * The problem implies N is the length of the number, so N=1, p[0]=0 is valid.\n     * However, the original code has `if (p[0] === 0)` which will output `INCORRECT`\n     * even if N=1. This seems like a bug in the original code for N=1, c=0.\n     * But for Type I clone, I must preserve this behavior.\n     */\n    if (p[0] === 0) {\n        console.log(INCORRECT);\n        return;\n    }\n\n    // Another condition for the first digit being -1 (unset).\n    // This also results in an incorrect scenario.\n    if (p[0] === -1) {\n        console.log(INCORRECT);\n        return;\n    }\n\n    /*\n     * Fill in any remaining unset digits (-1) with 0.\n     * This forms the smallest possible number satisfying constraints.\n     */\n    for (var _i3 = 0; _i3 < N; _i3++) {\n        if (p[_i3] === -1) {\n            p[_i3] = 0;\n        }\n    }\n\n    // Finally, print the constructed number by joining the digits.\n    console.log(p.join(''));\n};\n\n// Read input from standard input and pass it to the main function.\nmain(fs.readFileSync('/dev/stdin', 'utf8'));\n\n/* End of the webpack module for ./src/ABC157/C.js */\n//# sourceURL=webpack:///./src/ABC157/C.js?");

    /***/
    }),

    /***/ "fs":
    /*!*********************!*\
      !*** external "fs" ***!
      \*********************/
    /*! no static exports found */
    /***/ (function (module, exports) {

        eval("/* This module simply exports the Node.js 'fs' (file system) built-in module. */\nmodule.exports = require(\"fs\");\n\n/*\n * Original source URL for debugging purposes.\n * It's important to keep this comment unchanged as it's part of webpack's output.\n */\n//# sourceURL=webpack:///external_%22fs%22?");

    /***/
    })

    /******/
});