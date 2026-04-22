/* This is a Type I clone generated from the original source code.
 * All identifiers, operators, and expressions remain identical.
 * Only whitespace and comments have been altered significantly.
 */

module.exports = function ( e ) {


    // A cache for loaded modules, indexed by module ID.
    var r = {};


    /**
     * The core module loading function.
     * @param {number} n - The module ID to load.
     * @returns {*} The exports of the requested module.
     */
    function t ( n ) {

        // If the module is already in the cache, return its exports.
        if ( r[n] ) {
            return r[n].exports;
        }

        // Create a new module entry in the cache.
        var o = r[n] = {
            i: n,          // Module ID
            l: false,      // Loaded flag, initially false
            exports: {}    // Module exports object, initially empty
        };

        // Execute the module function, populating o.exports.
        // The module function is expected to be in the 'e' array.
        e[n].call( o.exports, o, o.exports, t );

        // Mark the module as loaded.
        o.l = true;

        // Return the populated exports object.
        return o.exports;
    }


    // Store all module definitions (the 'e' array) on the 't' function.
    t.m = e;


    // Store the module cache (the 'r' object) on the 't' function.
    t.c = r;


    /**
     * Define a getter function for an export.
     * This ensures enumerable properties are correctly defined.
     * @param {object} e - The exports object on which to define the property.
     * @param {string} r - The property name.
     * @param {function} n - The getter function for the property.
     */
    t.d = function ( e, r, n ) {
        // Only define the property if it doesn't already exist.
        if ( !t.o( e, r ) ) {
            Object.defineProperty( e, r, {
                enumerable: true, // Make the property enumerable.
                get: n            // Assign the provided getter function.
            } );
        }
    };


    /**
     * Mark an exports object as an ECMAScript Module (ESM).
     * @param {object} e - The exports object to mark as an ESM.
     */
    t.r = function ( e ) {
        // Add Symbol.toStringTag for better module identification in environments that support it.
        if ( typeof Symbol !== "undefined" && Symbol.toStringTag ) {
            Object.defineProperty( e, Symbol.toStringTag, {
                value: "Module"
            } );
        }
        // Mark the object as an ES module using the __esModule flag.
        Object.defineProperty( e, "__esModule", {
            value: true
        } );
    };


    /**
     * Compatibility function for various module formats (e.g., CommonJS, ES Modules).
     * @param {*} e - The module or its exports.
     * @param {number} r - Flags indicating how 'e' should be interpreted and processed.
     * @returns {*} The normalized module exports, resembling an ES module namespace object.
     */
    t.t = function ( e, r ) {
        // Flag 1: If 'e' is a module ID, load it first.
        if ( 1 & r ) {
            e = t( e );
        }
        // Flag 8: If 'e' is already a namespace object, return it directly.
        if ( 8 & r ) {
            return e;
        }
        // Flag 4: If 'e' is an object and already marked as an ES module, return it.
        if ( 4 & r && typeof e === "object" && e && e.__esModule ) {
            return e;
        }

        // Create a new plain object to serve as the namespace.
        var n = Object.create( null );

        // Mark the new object as an ES module.
        t.r( n );

        // Define a 'default' export on the new namespace object.
        Object.defineProperty( n, "default", {
            enumerable: true, // Make 'default' enumerable.
            value: e          // Set its value to the original 'e'.
        } );

        // Flag 2: If 'e' is not a string, iterate over its properties and copy them to the new namespace.
        if ( 2 & r && typeof e !== "string" ) {
            for ( var o in e ) {
                // For each property, define a getter on the new namespace.
                t.d( n, o, ( function ( r ) {
                    return e[r]; // The getter simply returns the original property's value.
                } ).bind( null, o ) ); // Bind 'o' to the inner function.
            }
        }
        return n; // Return the constructed namespace object.
    };


    /**
     * Get a getter function for the module's default export.
     * This is useful for interoperability between CommonJS and ES modules.
     * @param {*} e - The module exports object.
     * @returns {function} A getter function that returns the default export.
     */
    t.n = function ( e ) {
        // Determine the appropriate getter based on whether 'e' is an ES module.
        var r = e && e.__esModule ?
            function () {
                return e.default; // If ES module, return its 'default' export.
            } :
            function () {
                return e;         // Otherwise, 'e' itself is the default export.
            };
        // Define a non-enumerable 'a' property on the getter function itself, which returns the getter.
        t.d( r, "a", r );
        return r; // Return the getter function.
    };


    /**
     * Check if an object has a specific property directly (not inherited).
     * This is a wrapper around `Object.prototype.hasOwnProperty.call`.
     * @param {object} e - The object to check.
     * @param {string} r - The name of the property.
     * @returns {boolean} True if the property exists directly on 'e', false otherwise.
     */
    t.o = function ( e, r ) {
        return Object.prototype.hasOwnProperty.call( e, r );
    };


    // Public path for assets (e.g., for dynamic imports or loading chunks).
    // Currently set to an empty string.
    t.p = "";


    // Set the entry module ID (t.s) to 0 and then immediately load it.
    return t( t.s = 0 );


// The array of modules, keyed by their ID, wrapped in an Immediately Invoked Function Expression (IIFE).
}( [
    /* Module 0: Entry point of the application */
    function ( e, r, t ) {
        // This module's purpose is to read from stdin and pass the parsed data to Module 1.
        t( 1 )(
            // Load Module 1 and immediately call it with the processed data.
            t( 2 ) // Load Module 2 (which exports the 'fs' module).
            .readFileSync( "/dev/stdin", "UTF-8" ) // Use 'fs' to read from standard input as UTF-8.
            .split( "\n" )                          // Split the input string into an array of lines.
        );
    },

    /* Module 1: Contains the main problem-solving logic */
    function ( e, r ) {
        /**
         * Helper function to safely destructure an iterable into an array.
         * It handles arrays, iterables, and throws a TypeError for non-iterable instances.
         * @param {*} e - The iterable or array-like object.
         * @param {number} r - The optional number of elements to extract.
         * @returns {Array} The destructured array.
         */
        function t ( e, r ) {
            // Case 1: If 'e' is already an array, return it directly.
            if ( Array.isArray( e ) ) {
                return e;
            }

            // Case 2: If 'e' is an iterable (e.g., Set, Map, custom iterator).
            var t = [],      // Array to store destructured elements.
                n = true,    // Flag for `done` state of iterator.
                o = false,   // Flag indicating if an error occurred.
                u = undefined; // Variable to store any caught error.
            try {
                for (
                    var i, // Current item from iterator.
                        l = e[ Symbol.iterator ](); // Get the iterator from 'e'.
                    !( n = ( i = l.next() ).done ) && // Continue as long as iterator is not done.
                    ( t.push( i.value ), !r || t.length !== r ); // Push value; stop if 'r' is defined and length matches.
                    n = true // Reset 'n' for the next iteration if loop continues.
                ) {
                    // Loop body is empty, all work done in the condition.
                }
            } catch ( e ) {
                o = true; // An error occurred during iteration.
                u = e;    // Store the error.
            } finally {
                try {
                    // If the iterator wasn't finished naturally, call its 'return' method if it exists.
                    if ( !n && l.return != null ) {
                        l.return();
                    }
                } finally {
                    // If an error occurred, re-throw it.
                    if ( o ) {
                        throw u;
                    }
                }
            }
            return t; // Return the accumulated array of elements.

            // Case 3: If 'e' is not an array and not an iterable, throw a TypeError.
            // This IIFE will be executed if previous checks fail to return.
            ( function () {
                throw new TypeError( "Invalid attempt to destructure non-iterable instance" );
            } )();
        }

        // Export the main logic function for this module.
        e.exports = function ( e ) {
            // Parse the first line of input (e[0]) into three numbers.
            // Input format is expected to be "n o u" (space-separated).
            var r = t(
                e[0] // Get the first line of input.
                .split( " " ) // Split the line by spaces into an array of strings.
                .map( function ( e ) {
                    return Number( e ); // Convert each string element to a number.
                } ),
                3 // Expect exactly 3 numbers to be destructured.
            );

            // Destructure the parsed numbers into distinct variables.
            var n = r[0], // First number.
                o = r[1], // Second number.
                u = r[2]; // Third number.

            // Apply conditional logic based on the values of n, o, and u.
            // This is a nested ternary operation.
            // Original: n != u || 0 != o ? n < u && n + o >= u ? console.log("YES") : console.log("NO") : console.log("YES")

            if ( n != u || 0 != o ) { // Outer condition: If n is not equal to u OR o is not zero.
                if ( n < u && n + o >= u ) { // Inner condition: If n is less than u AND (n + o) is greater than or equal to u.
                    console.log( "YES" );
                } else {
                    console.log( "NO" );
                }
            } else { // Else branch of the outer condition: If n IS equal to u AND o IS zero.
                console.log( "YES" );
            }
        };
    },

    /* Module 2: Exports the Node.js 'fs' (File System) module */
    function ( e, r ) {
        // Simply assign the 'fs' module to this module's exports.
        e.exports = require( "fs" );
    }
] );