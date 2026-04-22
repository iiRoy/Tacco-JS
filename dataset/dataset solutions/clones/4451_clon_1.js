/*
 * This is a Type I clone of a JavaScript module.
 * All identifiers, variable names, function names, operators, and expressions
 * remain exactly the same.
 * Only whitespace (indentation, spacing, blank lines) and comments have been
 * extensively modified to create a visually distinct but functionally identical clone.
 */

// Export the main module function.
module.exports = function ( r ) {

    // Cache for loaded modules.
    var e = {};

    /**
     * The core module loading and caching function.
     * @param {number} n - The module ID to load.
     * @returns {*} The exports of the requested module.
     */
    function t( n ) {
        // If module is already in cache, return its exports.
        if ( e[ n ] ) {
            return e[ n ].exports;
        }

        // Create a new module object and put it into the cache.
        var o = e[ n ] = {
            i: n,          // Module ID
            l: !1,         // Loaded flag
            exports: {}    // Module exports object
        };

        // Execute the module function, populating o.exports.
        r[ n ].call( o.exports, o, o.exports, t );

        // Mark the module as loaded.
        o.l = !0;

        // Return the module's exports.
        return o.exports;
    }

    // Store all module definitions.
    t.m = r;

    // Store the module cache.
    t.c = e;

    /**
     * Define a getter function for a property on an object.
     * This is used for defining `__esModule` and default exports.
     * @param {object} r - The object on which to define the property.
     * @param {string} e - The name of the property to define.
     * @param {function} n - The getter function for the property.
     */
    t.d = function ( r, e, n ) {
        // Only define if the property doesn't already exist.
        if ( !t.o( r, e ) ) {
            Object.defineProperty( r, e, {
                enumerable: !0, // Make the property enumerable.
                get: n          // Set the getter function.
            } );
        }
    };

    /**
     * Add `__esModule` and `Symbol.toStringTag` properties to an object.
     * This marks the object as an ES module.
     * @param {object} r - The object to mark as an ES module.
     */
    t.r = function ( r ) {
        // Add Symbol.toStringTag if available.
        if ( "undefined" != typeof Symbol && Symbol.toStringTag ) {
            Object.defineProperty( r, Symbol.toStringTag, { value: "Module" } );
        }

        // Add __esModule flag.
        Object.defineProperty( r, "__esModule", { value: !0 } );
    };

    /**
     * Get a namespace object for a module.
     * Handles different module export formats (commonJS, ES modules).
     * @param {*} r - The module exports.
     * @param {number} e - Flags indicating the type of module export.
     * @returns {object} A namespace object.
     */
    t.t = function ( r, e ) {
        // If flag 1 is set, treat r as a module ID and load it.
        if ( 1 & e ) {
            r = t( r );
        }

        // If flag 8 is set, return r directly.
        if ( 8 & e ) {
            return r;
        }

        // If flag 4 is set, and r is an object and an ES module, return r.
        if ( 4 & e && "object" == typeof r && r && r.__esModule ) {
            return r;
        }

        // Create a new namespace object.
        var n = Object.create( null );

        // Mark it as an ES module.
        t.r( n );

        // Define a 'default' export.
        Object.defineProperty( n, "default", { enumerable: !0, value: r } );

        // If flag 2 is set and r is not a string, copy all properties from r to n.
        if ( 2 & e && "string" != typeof r ) {
            for ( var o in r ) {
                t.d( n, o, function ( e ) {
                    return r[ e ];
                }.bind( null, o ) );
            }
        }

        return n;
    };

    /**
     * Create a getter function for a module's exports.
     * This handles `default` exports for ES modules.
     * @param {object} r - The module's exports.
     * @returns {function} A getter function for the module's primary export.
     */
    t.n = function ( r ) {
        var e = r && r.__esModule ?
            function () { return r.default; } :
            function () { return r; };

        // Define a getter 'a' on the function itself, pointing to the function.
        t.d( e, "a", e );

        return e;
    };

    /**
     * Check if an object has a property.
     * @param {object} r - The object to check.
     * @param {string} e - The property name.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    t.o = function ( r, e ) {
        return Object.prototype.hasOwnProperty.call( r, e );
    };

    // Public path for assets (empty in this context).
    t.p = "";

    // Load and execute the entry module (module ID 0).
    return t( t.s = 0 )( [
        /*
         * Module 0: Entry point for the application.
         * Reads input from `/dev/stdin` using the `fs` module.
         */
        function ( r, e, t ) {
            // Load module 1 (the main logic) and execute it with the input from module 2 (fs).
            t( 1 )(
                t( 2 ).readFileSync( "/dev/stdin", "UTF-8" )
            );
        },

        /*
         * Module 1: Contains the main algorithm for processing input and generating output.
         */
        function ( r, e ) {

            /**
             * Helper function for destructuring arrays.
             * Supports iterable protocol and ensures a specific number of elements.
             * @param {Array|Iterable} r - The array or iterable to destructure.
             * @param {number} e - The expected number of elements.
             * @returns {Array} The destructured array.
             * @throws {TypeError} If the input is not a valid iterable or cannot be destructured.
             */
            function t( r, e ) {
                // If it's already an array, return it directly.
                if ( Array.isArray( r ) ) {
                    return r;
                }

                // Attempt to destructure from an iterable.
                var t = [],
                    n = !0,
                    o = !1,
                    u = void 0;

                try {
                    // Iterate through the input.
                    for ( var i, f = r[ Symbol.iterator ](); !( n = ( i = f.next() ).done ) && ( t.push( i.value ), !e || t.length !== e ); n = !0 );
                } catch ( r ) {
                    // Catch any errors during iteration.
                    o = !0;
                    u = r;
                } finally {
                    // Ensure cleanup of the iterator.
                    try {
                        if ( !n && null != f.return ) {
                            f.return();
                        }
                    } finally {
                        if ( o ) {
                            throw u;
                        }
                    }
                }

                // If destructuring was successful, return the result.
                return t;
            }

            // The main export of this module.
            // It takes the raw input string and processes it.
            r.exports = function ( r ) {
                // Split the input string into lines.
                for (
                    var e = r.split( "\n" ),

                    // Parse the first line for dimensions (N, M).
                    n = t( e[ 0 ].split( " " ).map( function ( r ) { return Number( r ); } ), 2 ),
                    o = n[ 0 ], // N (number of rows)
                    u = n[ 1 ], // M (number of columns)

                    // Parse the third line for the number of blocks for each color.
                    // The second line (e[1]) is ignored as per the original code's structure.
                    i = ( Number( e[ 1 ] ), e[ 2 ].split( " " ).map( function ( r ) { return Number( r ); } ) ),

                    // Initialize the 2D array (matrix) to store the output.
                    f = [],
                    l = 0;
                    l < o;
                    l++
                ) {
                    // Initialize each row with M zeros.
                    var a = new Array( u ).fill( 0 );
                    f.push( a );
                }

                // Initialize counters for current color (c), blocks placed for current color (p), and row index (s).
                for ( var c = 0, p = 0, s = 0; s < o; s++ ) {
                    // For even rows, fill from left to right.
                    if ( s % 2 == 0 ) {
                        for ( j = 0; j < u; j++ ) {
                            f[ s ][ j ] = c + 1, // Assign the current color (1-indexed).
                                ( p += 1 ) >= i[ c ] && ( p = 0, c += 1 ); // Increment blocks, switch color if current color is exhausted.
                        }
                    }
                    // For odd rows, fill from right to left.
                    else {
                        for ( j = u - 1; j >= 0; j-- ) {
                            f[ s ][ j ] = c + 1, // Assign the current color (1-indexed).
                                ( p += 1 ) >= i[ c ] && ( p = 0, c += 1 ); // Increment blocks, switch color if current color is exhausted.
                        }
                    }

                    // Print the current row, joined by spaces.
                    console.log( f[ s ].join( " " ) );
                }
            };
        },

        /*
         * Module 2: Provides the Node.js 'fs' (file system) module.
         */
        function ( r, e ) {
            // Simply export the built-in 'fs' module.
            r.exports = require( "fs" );
        }
    ] );
};