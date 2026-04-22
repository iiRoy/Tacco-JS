(function(modules) { /* This is the webpackBootstrap function wrapper */
    // The module cache variable declaration
    var installedModules = {};

    // The core require function definition
    function __webpack_require__(moduleId) {

        // Check if the module is already in the cache
        if (installedModules[moduleId]) {
            return installedModules[moduleId].exports;
        }

        // Create a brand new module (and immediately place it into the cache)
        var module = installedModules[moduleId] = {
            i: moduleId, // The module ID
            l: false,    // A flag indicating if the module has been loaded (initially false)
            exports: {}  // The exports object for this specific module
        };

        // Execute the module's main function
        // 'this' context is set to module.exports
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

        // After execution, flag the module as fully loaded
        module.l = true;

        // Return the resulting exports of the module
        return module.exports;
    }


    // Expose the original modules object (which is named __webpack_modules__ internally)
    __webpack_require__.m = modules;

    // Expose the module cache object
    __webpack_require__.c = installedModules;

    // Define a getter function for harmony exports (ES modules compatibility)
    __webpack_require__.d = function(exports, name, getter) {
        // Only define if the property doesn't already exist
        if (!__webpack_require__.o(exports, name)) {
            Object.defineProperty(exports, name, {
                enumerable: true, // Make it enumerable
                get: getter       // Provide the getter function
            });
        }
    };

    // Define __esModule property on exports for ES module identification
    __webpack_require__.r = function(exports) {
        // Add Symbol.toStringTag for better debugging experience if Symbol is available
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exports, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        // Explicitly mark as an ES module
        Object.defineProperty(exports, '__esModule', {
            value: true
        });
    };

    /*
     * This function creates a fake namespace object for module interoperability.
     * It handles various modes for different module types and scenarios.
     */
    __webpack_require__.t = function(value, mode) {
        // Mode & 1: If value is a module ID, require it first.
        if (mode & 1) value = __webpack_require__(value);
        // Mode & 8: If it should behave like require, return the value directly.
        if (mode & 8) return value;
        // Mode & 4: If value is already a namespace object and an ES module, return it.
        if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;

        // Otherwise, create a new empty namespace object.
        var ns = Object.create(null);
        __webpack_require__.r(ns); // Mark it as an ES module.
        Object.defineProperty(ns, 'default', {
            enumerable: true,
            value: value
        }); // Set the default export.
        // Mode & 2: If value is an object (and not a string), merge its properties into the namespace.
        if (mode & 2 && typeof value != 'string')
            for (var key in value)
                __webpack_require__.d(ns, key, function(key) {
                    return value[key];
                }.bind(null, key));
        return ns;
    };

    // Function to get default export for compatibility with non-harmony modules
    __webpack_require__.n = function(module) {
        var getter = module && module.__esModule ?
            function getDefault() {
                return module['default'];
            } :
            function getModuleExports() {
                return module;
            };
        __webpack_require__.d(getter, 'a', getter); // Expose the getter under property 'a'
        return getter;
    };

    // Object.prototype.hasOwnProperty.call wrapper for safety and brevity
    __webpack_require__.o = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };

    // __webpack_public_path__ variable - base path for assets
    __webpack_require__.p = "";


    // Load the designated entry module and return its exports
    return __webpack_require__(__webpack_require__.s = "./src/panasonic2020/D.js");
})
/************************************************************************/
({ /* This object maps module paths to their respective functions */

    /***/
    "./src/panasonic2020/D.js":
    /*!********************************!*\
      *** ./src/panasonic2020/D.js ***!
      \********************************/
    /*! no static exports found */
    /***/
    (function(module, exports, __webpack_require__) {

        eval("var fs = __webpack_require__(/*! fs */ \"fs\");\n\nvar alphabets = 'abcdefghijklmnopqrstuvwxyz'.split('');\nvar n = 0;\n\nvar dfs = function dfs(s, mx) {\n  if (s.length === n) {\n    console.log(s);\n    return;\n  }\n\n  var ch = alphabets[mx];\n\n  for (var i = 0; i <= alphabets.indexOf(ch) + 1; i++) {\n    var t = s;\n    t += alphabets[i];\n    dfs(t, Math.max(alphabets.indexOf(ch), i));\n  }\n};\n\nvar main = function main(input) {\n  n = input.split('\\n')[0] - 0;\n  dfs('', -1);\n};\n\nmain(fs.readFileSync('/dev/stdin', 'utf8'));\n\n//# sourceURL=webpack:///./src/panasonic2020/D.js?");

    }),

    /***/
    "fs":
    /*!*********************!*\
      *** external "fs" ***!
      \*********************/
    /*! no static exports found */
    /***/
    (function(module, exports) {

        eval("module.exports = require(\"fs\");\n\n//# sourceURL=webpack:///external_%22fs%22?");

    })

});