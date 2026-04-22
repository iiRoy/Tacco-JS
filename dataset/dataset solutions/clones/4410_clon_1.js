/* This entire block is a self-executing function
 * that acts as a module loader, similar to webpack's bootstrap.
 * It encapsulates the module system and its dependencies.
 *
 * The 'e' parameter represents the array of all module definitions.
 */
module.exports = function ( e ) {

    // 't' serves as the cache for already loaded modules.
    var t = {};

    /* The core 'require' function for this custom module system.
     * When called with a module ID 'n', it attempts to load that module.
     */
    function r( n ) {

        // Check if the module is already in the cache.
        if ( t[ n ] ) {
            // If yes, return its exports immediately.
            return t[ n ].exports;
        }

        /* If the module is not in the cache, create a new module object.
         * 'o' will hold the module's state (id, loaded status, and exports).
         */
        var o = t[ n ] = {
            i: n,         // Module ID (identifier)
            l: false,     // 'l' indicates if the module has been loaded (false initially)
            exports: {}   // The actual exports object for this module
        };

        /* Execute the module function.
         * The module function is found in the 'e' array (all modules) at index 'n'.
         * 'call' is used to set 'o.exports' as 'this' context, and pass
         * 'o', 'o.exports', and the 'r' (require) function as arguments.
         */
        e[ n ].call( o.exports, o, o.exports, r );

        // After execution, mark the module as loaded.
        o.l = true;

        // Finally, return the module's exports.
        return o.exports;
    }

    // Store all available module functions in 'r.m'.
    r.m = e;

    // Store the module cache itself in 'r.c'.
    r.c = t;

    /* 'r.d' is a helper function to define properties on exports objects,
     * specifically for compatibility with ES modules.
     * It ensures a property is defined only if it doesn't already exist.
     */
    r.d = function ( e, t, n ) {
        // Check if the property 't' exists on object 'e'.
        if ( !r.o( e, t ) ) {
            // If it doesn't exist, define it using Object.defineProperty.
            Object.defineProperty( e, t, {
                enumerable: true, // Make the property enumerable (visible in for...in loops)
                get: n            // Use 'n' as the getter function for the property
            } );
        }
    };

    /* 'r.r' is another helper for ES module compatibility.
     * It marks an exports object as an ES module by setting '__esModule: true'
     * and optionally 'Symbol.toStringTag' for better debugging.
     */
    r.r = function ( e ) {
        // Check for Symbol and Symbol.toStringTag availability.
        if ( "undefined" != typeof Symbol && Symbol.toStringTag ) {
            Object.defineProperty( e, Symbol.toStringTag, { value: "Module" } );
        }
        // Always set the '__esModule' flag to true.
        Object.defineProperty( e, "__esModule", { value: true } );
    };

    /* 'r.t' creates a "fake" namespace object for a module.
     * This is crucial for handling different module export formats (CommonJS, ES Modules).
     * 'e' is the module, 't' is a bitmask indicating how to handle it.
     */
    r.t = function ( e, t ) {
        // Bit 1: If set, 'e' is a module ID, so resolve it using 'r'.
        if ( 1 & t && ( e = r( e ) ) ) {
            /* This is an empty statement block.
             * It serves no functional purpose but adds whitespace variation.
             */
        }

        // Bit 8: If set, return the module directly.
        if ( 8 & t ) {
            return e;
        }

        // Bit 4: If set, and 'e' is an object and an ES module, return it directly.
        if ( 4 & t && "object" == typeof e && e && e.__esModule ) {
            return e;
        }

        // Create a new plain object to serve as the namespace.
        var n = Object.create( null );

        // Mark this new namespace object as an ES module.
        r.r( n );

        // Define a 'default' export property on the namespace.
        Object.defineProperty( n, "default", { enumerable: true, value: e } );

        // Bit 2: If set, and 'e' is not a string, iterate over its properties
        // and define them on the namespace object.
        if ( 2 & t && "string" != typeof e ) {
            for ( var o in e ) {
                // Use 'r.d' to define each property, ensuring it's an own property
                // and correctly bound.
                r.d( n, o, ( function ( t ) {
                    return e[ t ];
                } ).bind( null, o ) );
            }
        }

        // Return the constructed namespace object.
        return n;
    };

    /* 'r.n' creates a getter function for a module's default export.
     * It handles both ES module default exports and CommonJS module exports.
     */
    r.n = function ( e ) {
        // Determine the correct getter function based on whether 'e' is an ES module.
        var t = e && e.__esModule ?
            function () { return e.default; } : // If it's an ES module, return its 'default' property.
            function () { return e; };          // Otherwise, return the module 'e' itself.

        // Define an 'a' property on the getter function 't' that points back to 't'.
        r.d( t, "a", t );

        // Return the getter function.
        return t;
    };

    /* 'r.o' is a simple wrapper for Object.prototype.hasOwnProperty.call.
     * It checks if an object 'e' has an own property named 't'.
     */
    r.o = function ( e, t ) {
        return Object.prototype.hasOwnProperty.call( e, t );
    };

    // 'r.p' represents the public path for assets; it's empty in this setup.
    r.p = "";

    // Finally, load the entry module (module ID 0) by setting 'r.s' and calling 'r'.
    return r( r.s = 0 );

}( [ // The array of module definitions starts here. Each element is a module function.

    /* Module 0: The entry point of the application.
     * This module reads data from standard input and passes it to module 1 for processing.
     * Parameters: e (module object), t (exports object), r (local require function)
     */
    function ( e, t, r ) {
        // First, require module 2 (which is 'fs').
        // Then, call its 'readFileSync' method to read from '/dev/stdin' with UTF-8 encoding.
        // The result of readFileSync is then passed as an argument to module 1's exported function.
        r( 1 )( r( 2 ).readFileSync( "/dev/stdin", "UTF-8" ) );
    },

    /* Module 1: Contains the core logic for processing the input.
     * This module exports a function that takes a string input and performs calculations.
     * Parameters: e (module object), t (exports object)
     */
    function ( e, t ) {
        e.exports = function ( e ) { // The function exported by this module.

            // Split the input string 'e' into an array of lines.
            var t = e.split( "\n" ),
                // Define a large prime number for modulo operations (10^9 + 7).
                r = 1000000007,
                // Parse the first line as the number of iterations 'n'.
                n = Number( t[ 0 ] ),
                // Split the second line into an array of characters 'o'.
                o = t[ 1 ].split( "" ),
                // Split the third line into an array of characters 'u'.
                u = t[ 2 ].split( "" ),
                // Initialize result 'i' to 1.
                i = 1,
                // Initialize state 'f' to 0.
                f = 0,
                // Initialize loop counter 'l' to 0.
                l = 0;

            // Loop 'n' times to process the character sequences.
            for ( ; l < n; l++ ) {
                // Compare characters at the current position 'l' from both sequences.
                if ( o[ l ] == u[ l ] ) {
                    // If characters are equal:
                    // Apply multiplication based on the current state 'f'.
                    if ( 0 == f ) {
                        i *= 3;
                    }
                    if ( 1 == f ) {
                        i *= 2;
                    }
                    if ( 2 == f ) {
                        i *= 1;
                    }
                    // Update state 'f' to 1.
                    f = 1;
                    // Apply modulo 'r' to 'i'.
                    i %= r;
                } else {
                    // If characters are not equal:
                    // Apply multiplication based on the current state 'f'.
                    if ( 0 == f ) {
                        i *= 6;
                    }
                    if ( 1 == f ) {
                        i *= 2;
                    }
                    if ( 2 == f ) {
                        i *= 3;
                    }
                    // Apply modulo 'r' to 'i'.
                    i %= r;
                    // Update state 'f' to 2.
                    f = 2;
                    // Increment loop counter 'l' an additional time.
                    l += 1;
                }
            }
            // Print the final calculated result 'i' to the console.
            console.log( i );
        };
    },

    /* Module 2: Provides access to the Node.js 'fs' (File System) module.
     * Parameters: e (module object), t (exports object)
     */
    function ( e, t ) {
        // Simply export the built-in 'fs' module.
        e.exports = require( "fs" );
    }

] ); // End of the module definitions array.