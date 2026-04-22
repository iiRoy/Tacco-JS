/*
 * This JavaScript module implements a custom module loading
 * and bundling mechanism, similar to what a tool like Webpack
 * might generate. It takes an array of module definitions
 * and executes them as needed.
 */
module.exports = function ( e ) {
    // This 't' object serves as the module cache.
    // It stores already loaded modules to prevent redundant execution.
    var t = {};

    /*
     * The core module loading function.
     * It simulates the 'require' behavior found in CommonJS.
     * @param {number} r - The numerical ID of the module to load.
     * @returns {object} The exports object of the requested module.
     */
    function n ( r ) {
        // If the module is already cached, return its exports immediately.
        if ( t[r] ) {
            return t[r].exports;
        }

        /*
         * If not cached, create a new module object.
         * 'i': module ID
         * 'l': loaded flag (initially false)
         * 'exports': the object that will contain the module's public interface
         */
        var o = t[r] = { i: r, l: !1, exports: {} };

        // Execute the module's definition function.
        // 'e[r]' is the actual function for the module with ID 'r'.
        // The function receives 'module', 'module.exports', and the 'n' (require) function.
        e[r].call( o.exports, o, o.exports, n ),

        // Mark the module as loaded after execution.
        o.l = !0;

        // Return the module's exports.
        return o.exports;
    }

    // Expose the array of module definitions on the loader function itself.
    return n.m = e,

    // Expose the module cache for introspection or advanced use cases.
    n.c = t,

    /*
     * Utility function for defining properties on exports,
     * typically used for ES module interop.
     * @param {object} e - The exports object.
     * @param {string} t - The property name.
     * @param {function} r - The getter function for the property.
     */
    n.d = function ( e, t, r ) {
        // Only define the property if it doesn't already exist.
        if ( ! n.o( e, t ) ) {
            Object.defineProperty( e, t, { enumerable: !0, get: r } );
        }
    },

    /*
     * Utility function to mark an exports object as an ES module.
     * This adds `Symbol.toStringTag` and `__esModule` properties.
     * @param {object} e - The exports object to mark.
     */
    n.r = function ( e ) {
        // Add `Symbol.toStringTag` if available, for better debugging.
        if ( "undefined" != typeof Symbol && Symbol.toStringTag ) {
            Object.defineProperty( e, Symbol.toStringTag, { value: "Module" } );
        }
        // Mark as an ES module.
        Object.defineProperty( e, "__esModule", { value: !0 } );
    },

    /*
     * Utility function for handling different module types and interop.
     * It helps convert non-ESM modules into a format compatible with ESM imports.
     * @param {any} e - The module or its exports.
     * @param {number} t - Bitmask flags indicating how to treat 'e'.
     * @returns {any} The processed module exports.
     */
    n.t = function ( e, t ) {
        // If bit 1 is set, it means 'e' is a module ID, so load it first.
        if ( 1 & t && ( e = n( e ) ) ) {
            // Nothing more to do here, assignment is sufficient.
        }

        // If bit 8 is set, return 'e' directly as it's already the desired export.
        if ( 8 & t ) {
            return e;
        }

        // If bit 4 is set AND 'e' is an object AND it's already an ES module, return it directly.
        if ( 4 & t && "object" == typeof e && e && e.__esModule ) {
            return e;
        }

        // Create a new object to represent the interop module.
        var r = Object.create( null );

        // Mark the new object as an ES module.
        n.r( r );

        // Define a 'default' export property pointing to 'e'.
        Object.defineProperty( r, "default", { enumerable: !0, value: e } );

        // If bit 2 is set AND 'e' is not a string, iterate over its properties
        // and define them on the interop object 'r'.
        if ( 2 & t && "string" != typeof e ) {
            for ( var o in e ) {
                n.d( r, o, ( function ( t ) { return e[t]; } ).bind( null, o ) );
            }
        }
        return r;
    },

    /*
     * Utility function to create a getter for the default export.
     * It handles both ES modules (`e.default`) and CommonJS modules (the module itself).
     * @param {any} e - The module or its exports.
     * @returns {function} A getter function that returns the default export.
     */
    n.n = function ( e ) {
        var t = e && e.__esModule ?
            function () { return e.default; } :
            function () { return e; };

        // Also define a property 'a' on the getter function itself, pointing to itself.
        return n.d( t, "a", t ), t;
    },

    /*
     * Utility function to check if an object has a specific property.
     * This is a safer alternative to `obj.hasOwnProperty(prop)` directly.
     * @param {object} e - The object to check.
     * @param {string} t - The property name.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    n.o = function ( e, t ) {
        return Object.prototype.hasOwnProperty.call( e, t );
    },

    // The public path for assets (empty in this configuration).
    n.p = "",

    // Finally, load the entry module. 'n.s' tracks the entry module ID.
    n( n.s = 0 )

}( /* The array of module definitions starts here */
[
    /*
     * Module 0: This is the entry point of the application.
     * It reads input from /dev/stdin, splits it by newlines,
     * and then passes the resulting array to Module 1.
     */
    function ( e, t, n ) {
        // Load module 2 (fs), then read from stdin, decode as UTF-8, split by newline.
        // Then, pass the resulting array of lines to module 1.
        n( 1 )( n( 2 ).readFileSync( "/dev/stdin", "UTF-8" ).split( "\n" ) );
    },

    /*
     * Module 1: Contains the core logic to process the input.
     * It checks a string for a specific palindrome-like property.
     */
    function ( e, t ) {
        e.exports = function ( e ) {
            // 'e' here is the array of lines read from stdin.
            // We are interested in the first line for processing.
            var t = e[0],

                // 'n' will count the number of 'x' characters treated as wildcards.
                n = 0,

                // 'r' is the left pointer, starting at the beginning of the string.
                r = 0,

                // 'o' is the right pointer, starting at the end of the string.
                o = t.length - 1;

            // Loop while the left pointer is to the left of the right pointer.
            while ( r < o ) {
                // If characters at both pointers match, move both pointers inward.
                if ( t[r] == t[o] ) {
                    r++;
                    o--;
                }
                // If the left character is 'x' (wildcard), treat it as a match.
                // Increment the 'x' count and move the left pointer inward.
                else if ( "x" == t[r] ) {
                    r++;
                    n++;
                }
                // If the left character is NOT 'x', then we check the right character.
                else {
                    // If the right character is ALSO NOT 'x', then it's an unresolvable mismatch.
                    // In this case, output -1 and terminate.
                    if ( "x" != t[o] ) {
                        return void console.log( -1 );
                    }
                    // If the right character IS 'x' (wildcard), treat it as a match.
                    // Increment the 'x' count and move the right pointer inward.
                    o--;
                    n++;
                }
            }
            // After the loop, output the total number of 'x' wildcards used.
            console.log( n );
        };
    },

    /*
     * Module 2: Provides access to Node.js's built-in 'fs' (File System) module.
     */
    function ( e, t ) {
        // Simply exports the 'fs' module.
        e.exports = require( "fs" );
    }
] );