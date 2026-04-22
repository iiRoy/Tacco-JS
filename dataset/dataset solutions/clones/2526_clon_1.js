module.exports = function(  e  )
{
    // This object serves as a cache for all loaded modules.
    // When a module is requested, we first check if it's already here.
    var r = {};

    /**
     * The core function responsible for loading and resolving modules within the bundle.
     * It mimics the behavior of a 'require' function.
     * @param {number} n - The unique identifier for the module to be loaded.
     * @returns {object} The exports object of the requested module.
     */
    function t(   n   )
    {
        // If the module is already present in our cache, we can simply return its exports.
        if  (   r[n]   )
        {
            return   r[n].exports;
        }

        // If the module is not in the cache, we need to create a new module entry.
        // 'i' stores the module's ID, 'l' indicates if it's been fully loaded (false initially),
        // and 'exports' is the object that the module will populate with its public API.
        var o = r[n] = {
            i        :   n,
            l        :   !1,
            exports  :   {}
        };

        // Execute the module's definition function.
        // The 'e' array contains all module definitions. We call the specific module's function
        // with 'module.exports', 'module', 'module.exports' (again for convenience), and the 't' function itself
        // (so modules can 'require' other modules).
        e[n].call(   o.exports,   o,   o.exports,   t   );

        // After execution, mark the module as fully loaded.
        o.l = !0;

        // Finally, return the exports of the newly loaded module.
        return   o.exports;
    }

    // Attach various utility properties and functions to our module loader 't'.
    // These are part of the internal workings of the webpack module system.

    // 'm' holds the complete map of module definitions.
    t.m = e;
    // 'c' holds the module cache itself.
    t.c = r;

    /**
     * A helper function to define a getter for a property on an exports object.
     * This is particularly useful for exposing individual exports from ES Modules.
     * @param {object} e - The target object (e.g., module.exports).
     * @param {string} r - The name of the property to define.
     * @param {function} n - The getter function that provides the property's value.
     */
    t.d = function(  e,   r,   n  )
    {
        // Only define the property if it doesn't already exist on the object.
        if  (   !t.o(  e,   r  )   )
        {
            Object.defineProperty(
                e,
                r,
                {
                    enumerable   :   !0, // Make the property enumerable so it shows up in loops.
                    get          :   n   // Assign the provided getter function.
                }
            );
        }
    };

    /**
     * Marks an exports object as an ECMAScript Module (ESM).
     * This adds '__esModule: true' and potentially 'Symbol.toStringTag: "Module"' for better compatibility.
     * @param {object} e - The exports object to be marked as an ESM.
     */
    t.r = function(  e  )
    {
        // If Symbol and Symbol.toStringTag are supported, define the toStringTag property.
        if  (   "undefined"   !=   typeof   Symbol   &&   Symbol.toStringTag   )
        {
            Object.defineProperty(
                e,
                Symbol.toStringTag,
                {
                    value   :   "Module"
                }
            );
        }

        // Always define '__esModule: true' to explicitly mark it as an ES Module.
        Object.defineProperty(
            e,
            "__esModule",
            {
                value   :   !0
            }
        );
    };

    /**
     * Creates a "namespace object" for a module, facilitating interoperability between
     * CommonJS and ES Modules. It handles various scenarios based on the 'flags' (r).
     * @param {any} e - The module's exports, or the module ID if a flag indicates.
     * @param {number} r - Bitmask flags indicating how 'e' should be treated.
     * @returns {object} A namespace object representing the module's exports.
     */
    t.t = function(  e,   r  )
    {
        // Flag 1: If 'e' is a module ID, load it first.
        if  (   1   &   r   )
        {
            e   =   t(  e  );
        }

        // Flag 8: If 'e' is already a module object, return it directly.
        if  (   8   &   r   )
        {
            return   e;
        }

        // Flag 4: If 'e' is an object and already an ES Module, return it directly.
        if  (   4   &   r   &&   "object"   ==   typeof   e   &&   e   &&   e.__esModule   )
        {
            return   e;
        }

        // Create a new, empty object to serve as the namespace.
        var n = Object.create(  null  );

        // Mark this new namespace object as an ES Module.
        t.r(  n  );

        // Define a 'default' export on the namespace, pointing to the original 'e'.
        Object.defineProperty(
            n,
            "default",
            {
                enumerable   :   !0,
                value        :   e
            }
        );

        // Flag 2: If 'e' is not a string, iterate over its properties and
        // expose them as individual exports on the namespace object.
        if  (   2   &   r   &&   "string"   !=   typeof   e   )
        {
            for  (   var o   in   e   )
            {
                // Use t.d to define a getter for each property, binding 'o' to the getter.
                t.d(
                    n,
                    o,
                    function(   r   )
                    {
                        return   e[r];
                    }.bind(  null,   o  )
                );
            }
        }
        return   n;
    };

    /**
     * A utility function to retrieve the default export of a module.
     * It intelligently handles both traditional CommonJS exports and ES Module default exports.
     * @param {object} e - The module's exports object.
     * @returns {function} A function that, when called, returns the module's default export.
     */
    t.n = function(  e  )
    {
        // Determine the function that will return the default export.
        // If it's an ES Module with a '__esModule' flag, return its 'default' property.
        // Otherwise, assume it's a CommonJS module and return the entire exports object.
        var r = e   &&   e.__esModule
            ?   function()   {   return   e.default;   }
            :   function()   {   return   e;   };

        // Define a getter for a property named 'a' on the returned function 'r',
        // which itself returns 'r'. This is a common webpack pattern.
        t.d(  r,   "a",   r  );
        return   r;
    };

    /**
     * Checks if an object possesses a specified property directly (not inherited).
     * This is a safer alternative to calling `object.hasOwnProperty()` directly.
     * @param {object} e - The object to inspect.
     * @param {string} r - The name of the property to check for.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    t.o = function(  e,   r  )
    {
        return   Object.prototype.hasOwnProperty.call(  e,   r  );
    };

    // The public path for loading chunk files or other assets.
    // An empty string usually means relative paths.
    t.p = "";

    // The final step: Execute the application's entry point module.
    // 't.s = 0' sets the starting module ID to 0, and then 't(0)' loads and runs it.
    return   t(  t.s   =   0  );
}
(  [
    // Module 0: This is the main entry point of the application.
    // It orchestrates the reading of input and passing it to the core logic module.
    function(   e,   r,   t   )
    {
        // First, load module 2 (which exports the 'fs' module for file system operations).
        // Then, read the content of '/dev/stdin' (standard input) as UTF-8.
        // Split the input by newline characters to get an array of lines.
        // Finally, call module 1 (the main logic) with this array of input lines.
        t(  1  )  (
            t(  2  )
            .readFileSync(
                "/dev/stdin",
                "UTF-8"
            )
            .split(  "\n"  )
        );
    },

    // Module 1: Contains the primary business logic for processing the input data.
    // It expects an array of strings as input.
    function(   e,   r,   t   )
    {
        "use strict"; // Enforce strict mode for this module.

        // This module exports a single function.
        e.exports = function(   e   )
        {
            // The first element of the input array 'e' is expected to be a string representing a number.
            // Convert it to a numeric type. This will be the count of elements.
            var r = Number(  e[0]  );

            // The second element of the input array 'e' is a space-separated string of numbers.
            // Split this string by spaces and then map each resulting string to a number.
            var t = e[1]
                .split(  " "  )
                .map(
                    function(   e   )
                    {
                        return   Number(  e  );
                    }
                );

            // Initialize an empty array. This will store objects, each containing
            // the original index (num) and its corresponding value (sum) from the input.
            var n = [];

            // Loop 'r' times (where 'r' is the count of elements).
            // For each iteration, create an object with 'num' (original index + 1) and 'sum' (value from 't' array).
            // Push this object into the 'n' array.
            for  (   var o = 0;   o   <   r;   o++   )
            {
                n.push(
                    {
                        num   :   o   +   1,
                        sum   :   t[o]
                    }
                );
            }

            // Sort the 'n' array. The sorting is based on the 'sum' property of the objects.
            // This will arrange the objects in ascending order of their 'sum' values.
            n.sort(
                function(   e,   r   )
                {
                    return   e.sum   -   r.sum;
                }
            );

            // Initialize another empty array. This will store only the 'num' (original indices)
            // after the sorting has been applied.
            var u = [];

            // Iterate through the now sorted 'n' array.
            // For each object, extract its 'num' property and push it into the 'u' array.
            for  (   var i = 0;   i   <   r;   i++   )
            {
                u.push(  n[i].num  );
            }

            // Join the elements of the 'u' array (which are the sorted original indices)
            // with a space character in between them, and print the resulting string to the console.
            console.log(  u.join(  " "  )  );
        };
    },

    // Module 2: A simple module that exports the Node.js built-in 'fs' (file system) module.
    // This allows other modules in the bundle to access file system operations.
    function(   e,   r   )
    {
        e.exports = require(  "fs"  );
    }
]  );