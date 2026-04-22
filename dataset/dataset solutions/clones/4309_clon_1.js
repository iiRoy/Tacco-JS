/*
 * This file contains a module bundling system,
 * similar to what Webpack or other bundlers might produce.
 * It wraps multiple modules into a single executable unit.
 */
module.exports = function ( e ) {

    // 'r' serves as the module cache.
    // It stores already loaded modules to prevent redundant execution.
    var r = {};

    /**
     * The core 'n' function acts as a simplified 'require' mechanism.
     * It's responsible for loading and caching modules.
     * @param {number} t - The ID of the module to load.
     * @returns {object} The exports of the requested module.
     */
    function n( t ) {

        // Check if the module is already in the cache.
        if ( r[t] ) {
            return r[t].exports;
        }

        // If not in cache, create a new module entry.
        // 'o' is the module object itself.
        var o = r[t] = {
            i: t,      // Module ID
            l: !1,     // 'l' indicates if the module has been loaded (false initially).
            exports: {} // 'exports' object, where module exports are placed.
        };

        // Execute the module function from the 'e' array (the modules list).
        // 'this' context is set to 'o.exports'.
        // Arguments passed are 'module', 'module.exports', and the 'require' function itself.
        e[t].call( o.exports, o, o.exports, n );

        // After execution, mark the module as loaded.
        o.l = !0;

        // Return the exports of the newly loaded module.
        return o.exports;
    }


    // 'n.m' stores the array of module definitions.
    // This is essentially the 'e' argument passed to the main function.
    n.m = e;

    // 'n.c' references the module cache.
    // This allows external access to the cache if needed.
    n.c = r;

    /**
     * 'n.d' is a helper function to define a getter property on an object.
     * It's used for exporting named exports in ES modules.
     * @param {object} e - The object to define the property on.
     * @param {string} r - The name of the property.
     * @param {function} t - The getter function for the property.
     */
    n.d = function ( e, r, t ) {
        // Only define if the property doesn't already exist.
        if ( !n.o( e, r ) ) {
            Object.defineProperty( e, r, {
                enumerable: !0, // Make it enumerable so it shows up in loops.
                get: t         // The getter function.
            } );
        }
    };

    /**
     * 'n.r' marks an exports object as an ES module.
     * This adds '__esModule: true' and a Symbol.toStringTag for better interoperability.
     * @param {object} e - The exports object to mark.
     */
    n.r = function ( e ) {
        // If Symbol and Symbol.toStringTag are available, set the toStringTag.
        if ( 'undefined' != typeof Symbol && Symbol.toStringTag ) {
            Object.defineProperty( e, Symbol.toStringTag, { value: "Module" } );
        }
        // Always set '__esModule' to true.
        Object.defineProperty( e, "__esModule", { value: !0 } );
    };

    /**
     * 'n.t' creates a namespace object for a module.
     * This handles various export formats (CommonJS, ES modules, etc.)
     * and ensures consistent access to module exports.
     * @param {any} e - The module or module ID.
     * @param {number} r - A bitmask indicating how to interpret 'e'.
     * @returns {object} The namespace object.
     */
    n.t = function ( e, r ) {
        // Bit 1: If 'e' is a module ID, load it.
        if ( 1 & r ) {
            e = n( e );
        }
        // Bit 8: If 'e' is already the desired namespace object, return it.
        if ( 8 & r ) {
            return e;
        }
        // Bit 4: If 'e' is an object and an ES module, return it directly.
        if ( 4 & r && 'object' == typeof e && e && e.__esModule ) {
            return e;
        }

        // Create a new empty object for the namespace.
        var t = Object.create( null );

        // Mark the new object as an ES module.
        n.r( t );

        // Set the 'default' export to 'e'.
        Object.defineProperty( t, "default", { enumerable: !0, value: e } );

        // Bit 2: If 'e' is not a string, iterate its properties
        // and create getters for them on the new namespace object.
        if ( 2 & r && 'string' != typeof e ) {
            for ( var o in e ) {
                n.d( t, o, ( function ( r ) {
                    return e[r];
                } ).bind( null, o ) );
            }
        }
        return t;
    };

    /**
     * 'n.n' creates a getter function for a module's default export.
     * It handles both CommonJS and ES module default exports.
     * @param {object} e - The module object.
     * @returns {function} A function that returns the module's default export.
     */
    n.n = function ( e ) {
        var r = e && e.__esModule ? // If it's an ES module, return its 'default' property.
            function () {
                return e.default;
            } :
            // Otherwise, return the module itself (CommonJS style).
            function () {
                return e;
            };
        // Define a getter 'a' on the returned function, which also points to 'r'.
        // This seems to be a convention for interop.
        n.d( r, "a", r );
        return r;
    };

    /**
     * 'n.o' is a utility function to check if an object has its own property.
     * It's a robust way to check properties, avoiding prototype chain issues.
     * @param {object} e - The object to check.
     * @param {string} r - The property name.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    n.o = function ( e, r ) {
        return Object.prototype.hasOwnProperty.call( e, r );
    };

    // 'n.p' is the public path for assets, typically an empty string here.
    n.p = "";

    // Load and execute the entry module (module with ID 0).
    // The result of 'n(0)' is implicitly returned by the IIFE.
    return n( n.s = 0 );

// The array of modules, indexed by their ID.
}( [
    /*
     * Module 0: The entry point of the application logic.
     * It reads from standard input and processes it.
     */
    function ( e, r, n ) {
        // Require module 1 (the main logic) and pass it the content
        // read from standard input using module 2 (the 'fs' module).
        n( 1 )( n( 2 ).readFileSync( "/dev/stdin", "UTF-8" ) );
    },

    /*
     * Module 1: Contains the core logic to determine if a condition is met.
     * It processes input lines related to numbers.
     */
    function ( e, r ) {
        e.exports = function ( e ) {

            // Split the input string into lines.
            var r = e.split( "\n" );

            // Initialize 'n' as an empty object (acts as a frequency map for the first set of numbers).
            // The result of Number(r[0]) is discarded, but the expression is kept.
            var n = ( Number( r[0] ), {} );

            // Process the second line (r[1]): split by space, convert to numbers, and count frequencies.
            r[1].split( " " ).map( function ( e ) {
                var r = Number( e ); // Convert string to number.
                if ( !n[r] ) {
                    n[r] = 0; // Initialize count if number not seen before.
                }
                n[r] += 1; // Increment count.
            } );

            // The result of Number(r[2]) is discarded, but the expression is kept.
            Number( r[2] );

            // 't' will act as a frequency map for the second set of numbers.
            var t = {};

            // Process the fourth line (r[3]): split by space, convert to numbers, and count frequencies.
            r[3].split( " " ).map( function ( e ) {
                var r = Number( e );
                if ( !t[r] ) {
                    t[r] = 0;
                }
                t[r] += 1;
            } );

            // Iterate through the numbers in the second frequency map ('t').
            for ( var o in t ) {
                // If a number from 't' is not present in 'n', or if its count in 't'
                // is greater than its count in 'n', then the condition is NOT met.
                if ( !n[o] || t[o] > n[o] ) {
                    return void console.log( "NO" ); // Output "NO" and exit.
                }
            }
            // If the loop completes without returning, the condition IS met.
            console.log( "YES" );
        };
    },

    /*
     * Module 2: Simply exports the Node.js built-in 'fs' (file system) module.
     * This allows other modules to use file system operations.
     */
    function ( e, r ) {
        e.exports = require( "fs" );
    }
] );