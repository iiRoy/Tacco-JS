module.exports = function (e) {
    // This is the main module loader function.
    // It takes an array of modules 'e' as input.

    // t is the cache for loaded modules.
    var t = {};

    /**
     * n is the custom 'require' function.
     * It loads a module by its ID 'r'.
     */
    function n(r) {
        // If the module is already in cache, return its exports.
        if (t[r]) {
            return t[r].exports;
        }

        // If not in cache, create a new module entry.
        var o = t[r] = {
            i: r,      // module ID
            l: !1,     // loaded flag (false initially)
            exports: {} // module exports object
        };

        // Execute the module function, passing in module, exports, and the 'require' function itself.
        e[r].call(o.exports, o, o.exports, n);

        // Mark the module as loaded.
        o.l = !0;

        // Return the module's exports.
        return o.exports;
    }


    // Attach properties to the 'require' function (n).

    // m stores the module definitions.
    n.m = e;

    // c stores the module cache.
    n.c = t;

    // d defines getter functions for harmony exports.
    n.d = function (e, t, r) {
        if (!n.o(e, t)) {
            Object.defineProperty(e, t, {
                enumerable: !0,
                get: r
            });
        }
    };

    // r defines __esModule on exports.
    n.r = function (e) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(e, Symbol.toStringTag, { value: "Module" });
        }
        Object.defineProperty(e, "__esModule", { value: !0 });
    };

    // t creates a fake namespace object for compatibility.
    n.t = function (e, t) {
        // Handle module as a direct export.
        if (1 & t) {
            e = n(e);
        }
        // Handle module as a direct return.
        if (8 & t) {
            return e;
        }
        // Handle module with __esModule flag.
        if (4 & t && typeof e === "object" && e && e.__esModule) {
            return e;
        }

        // Create a new namespace object.
        var r = Object.create(null);

        // Define __esModule on the namespace object.
        n.r(r);

        // Define 'default' export.
        Object.defineProperty(r, "default", {
            enumerable: !0,
            value: e
        });

        // Copy all properties from the original module if it's not a string.
        if (2 & t && typeof e !== "string") {
            for (var o in e) {
                n.d(r, o, (function (t) {
                    return e[t];
                }).bind(null, o));
            }
        }
        return r;
    };

    // n provides a getDefaultExport function for compatibility with non-harmony modules.
    n.n = function (e) {
        var t = e && e.__esModule ?
            function () {
                return e.default;
            } :
            function () {
                return e;
            };
        // Define 'a' property as a getter for the default export.
        n.d(t, "a", t);
        return t;
    };

    // o is a shorthand for Object.prototype.hasOwnProperty.call.
    n.o = function (e, t) {
        return Object.prototype.hasOwnProperty.call(e, t);
    };

    // p is the public path, usually used for asset loading.
    n.p = "";

    // Load the entry module (module 0 in this case) and return its exports.
    return n(n.s = 0);

}(
    // This is the array of modules passed to the main loader function.
    [
        /**
         * Module 0: Entry point.
         * It requires module 1 and passes it the content of /dev/stdin read by module 2.
         */
        function (e, t, n) {
            // Require module 1, and execute it with the content read from stdin.
            n(1)(n(2).readFileSync("/dev/stdin", "UTF-8"));
        },

        /**
         * Module 1: Contains the core logic.
         * It processes the input string and logs a result.
         */
        function (e, t) {
            // Assign an anonymous function to module.exports.
            e.exports = function (e) {
                // Split the input string by newline, take the first line, and then split it into an array of characters.
                var t = e.split("\n")[0].split("");
                // Get the length of the character array.
                var n = t.length;
                // Initialize variables for counting.
                var r = 0; // count of 'S' type
                var o = 0; // count of 'T' type
                var u = 0; // adjusted 'S' count for the condition
                var i = 0; // loop counter

                // Loop through the characters until the end or condition is met.
                for (
                    ;
                    i < n && (
                        // If the current character is 'T'.
                        "T" == t[i] ?
                            (
                                // Increment 'T' count.
                                o += 1,
                                // If adjusted 'S' count is less than 'S' count, increment adjusted 'S' count.
                                u < r && (u += 1)
                            ) :
                            // If the current character is 'S', increment 'S' count.
                            r += 1,
                        // Continue loop as long as 'T' count is not half of total length.
                        o != n / 2
                    );
                    i++
                );

                // Calculate the final result.
                var f = n - 2 * u;

                // Log the result to the console.
                console.log(f);
            };
        },

        /**
         * Module 2: Provides the 'fs' (file system) module.
         */
        function (e, t) {
            // Simply exports the Node.js 'fs' module.
            e.exports = require("fs");
        }
    ]
);