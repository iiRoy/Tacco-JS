/*
 * This is a Type I clone of the original JavaScript module.
 * The purpose of this clone is to demonstrate identical functionality
 * while extensively varying whitespace and comments.
 *
 * All identifiers, operators, and expressions remain precisely the same.
 * Only formatting, indentation, spacing, and comments have been altered.
 */

// The main module wrapper function, immediately invoked with an array of modules.
// 'e' here represents the array of all modules in the bundle.
module.exports = function (e) {
    // 'r' serves as the cache for loaded modules.
    // It stores module objects once they have been loaded and initialized.
    var r = {};

    /**
     * The core module loading function.
     * This function is responsible for retrieving and executing modules.
     *
     * @param {number} n - The module ID to load.
     * @returns {object} The exports of the requested module.
     */
    function t(n) {
        // Check if the module is already in the cache.
        // If it is, return its exports directly to prevent re-execution.
        if (r[n]) {
            return r[n].exports;
        }

        // If the module is not in the cache, create a new module object.
        // 'o' is the module object itself, containing properties like:
        // 'i': module ID
        // 'l': loaded status (boolean)
        // 'exports': the actual exports object that will be populated by the module.
        var o = r[n] = {
            i: n,
            l: !1,
            exports: {}
        };

        // Execute the module function.
        // 'e[n]' is the module definition function from the bundle array.
        // 'call' is used to set the context of 'this' and pass arguments:
        //   - 'o.exports': The 'exports' object that the module can populate.
        //   - 'o': The module object itself.
        //   - 'o.exports': Again, the exports object.
        //   - 't': A reference to this very module loading function,
        //          allowing modules to require other modules ('require' in CommonJS context).
        e[n].call(o.exports, o, o.exports, t);

        // Mark the module as loaded after its execution.
        o.l = !0;

        // Return the populated exports object of the module.
        return o.exports;
    }

    // Attach the module definitions to the loader function.
    // 't.m' stores the module definitions array.
    t.m = e;

    // Attach the module cache to the loader function.
    // 't.c' stores the module cache object.
    t.c = r;

    // Helper function to define a getter property on an exports object.
    // This is used for creating getters for named exports in ES modules.
    t.d = function (e, r, n) {
        // Check if the property already exists on the object.
        // If not, define it using Object.defineProperty.
        if (!t.o(e, r)) {
            Object.defineProperty(e, r, {
                enumerable: !0, // Make the property enumerable.
                get: n         // Use the provided function 'n' as the getter.
            });
        }
    };

    // Helper function to mark an exports object as an ES module.
    // This adds '__esModule: true' and a Symbol.toStringTag for better interoperability.
    t.r = function (e) {
        // If Symbol and Symbol.toStringTag are available, set the toStringTag.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(e, Symbol.toStringTag, {
                value: "Module"
            });
        }
        // Always set the '__esModule' flag to true.
        Object.defineProperty(e, "__esModule", {
            value: !0
        });
    };

    // Helper function to create a namespace object for a module.
    // This handles various types of module imports (CommonJS, ES module, etc.).
    // 'r' is a bitmask indicating how the module should be treated.
    t.t = function (e, r) {
        // Bit 1: If the module is already an ID, load it.
        if (1 & r) {
            e = t(e);
        }
        // Bit 8: If it's a direct return (e.g., `require("foo")` where foo is a non-object).
        if (8 & r) {
            return e;
        }
        // Bit 4: If it's an ES module and an object, return it as is.
        if (4 & r && typeof e === "object" && e && e.__esModule) {
            return e;
        }

        // Create a new namespace object, marked as an ES module.
        var n = Object.create(null);
        t.r(n);

        // Define a 'default' export getter that returns the original module 'e'.
        Object.defineProperty(n, "default", {
            enumerable: !0,
            value: e
        });

        // Bit 2: If 'e' is not a string, iterate over its properties
        // and define getters for them on the new namespace object 'n'.
        if (2 & r && typeof e !== "string") {
            for (var o in e) {
                t.d(n, o, (function (r) {
                    return e[r];
                }).bind(null, o));
            }
        }
        // Return the created namespace object.
        return n;
    };

    // Helper function for compatibility with CommonJS and ES modules.
    // It creates a getter function that returns the module's exports.
    t.n = function (e) {
        // If 'e' is an ES module, return a function that gets its 'default' export.
        var r = e && e.__esModule ?
            function () {
                return e.default;
            } :
            // Otherwise, return a function that returns the module 'e' itself.
            function () {
                return e;
            };
        // Define a getter 'a' on the 'r' function that returns 'r' itself.
        // This is a common pattern for module interoperability.
        t.d(r, "a", r);
        return r;
    };

    // Helper function to check if an object has a property.
    // Uses Object.prototype.hasOwnProperty.call for robust checking.
    t.o = function (e, r) {
        return Object.prototype.hasOwnProperty.call(e, r);
    };

    // Public path for assets (empty in this case).
    t.p = "";

    // Execute the entry module.
    // 't.s = 0' sets the start module ID to 0, and 't(0)' loads and executes it.
    return t(t.s = 0);
}(
    // The array of bundled modules. Each element is a function representing a module.
    [
        /* Module 0: Entry point */
        function (e, r, t) {
            // This module reads from /dev/stdin and passes the content to module 1.
            // t(2) loads module 2 (which is 'fs').
            // .readFileSync("/dev/stdin","UTF-8") reads the input.
            // t(1) loads module 1 and then immediately calls it with the read content.
            t(1)(t(2).readFileSync("/dev/stdin", "UTF-8"));
        },

        /* Module 1: Core logic for string processing */
        function (e, r) {
            // This module exports a function that processes a string 'e'.
            e.exports = function (e) {
                // Split the input string by newline, take the first line, and then split into characters.
                var r = e.split("\n")[0].split("");
                // Initialize 't' (result) to 0.
                var t = 0;

                // Loop backward from the second-to-last character down to the beginning of the string.
                // 'n' represents the end index of the potential prefix to check.
                for (var n = r.length - 2; n >= 0; n--) {
                    // 'o' is a flag to indicate if a matching prefix has been found.
                    var o = !1;

                    // Inner loop: Iterate from the beginning of the string up to 'n'.
                    // 'u' represents the length of the first part of the potential prefix.
                    for (var u = 0; u <= n; u++) {
                        // Check if the prefix from index 0 to 'u-1' (length 'u')
                        // is equal to the substring from index 'u' to 'n'.
                        // This effectively checks for overlapping prefixes.
                        if (r.slice(0, u).join("") == r.slice(u, n + 1).join("")) {
                            o = !0; // A match is found.
                            break;  // Exit the inner loop.
                        }
                    }

                    // If a match was found (meaning 'o' is true),
                    // calculate the result 't' and print it.
                    if (o) {
                        t = n + 1; // The length of the longest repeating prefix.
                        void console.log(t); // Print the result.
                        return; // Exit the function as the longest prefix is found.
                    }
                }
            };
        },

        /* Module 2: Node.js 'fs' module */
        function (e, r) {
            // This module simply exports the Node.js built-in 'fs' module.
            e.exports = require("fs");
        }
    ]
);