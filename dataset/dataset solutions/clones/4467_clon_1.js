module.exports = function ( r ) {
    // This is the cache for loaded modules.
    var e = {};

    /**
     * The main module loading function.
     * @param {string} n - The module ID.
     * @returns {*} The exported module content.
     */
    function t ( n ) {
        // Check if module is already in cache.
        if ( e[ n ] ) {
            return e[ n ].exports;
        }

        // Create a new module entry in the cache.
        var o = e[ n ] = {
            i: n,      // Module ID
            l: !1,     // Loaded flag (false initially)
            exports: {} // Exports object
        };

        /*
         * Call the module function with its dependencies.
         * r[n] is the module function itself.
         * o.exports is the module's exports object.
         * t is the local require function.
         */
        r[ n ].call( o.exports, o, o.exports, t );

        // Mark the module as loaded.
        o.l = !0;

        // Return the module's exports.
        return o.exports;
    }

    // Store all module functions in t.m (modules).
    t.m = r;

    // Store the module cache in t.c (cache).
    t.c = e;

    /*
     * Define a getter function for harmony exports.
     * This ensures compatibility with ES modules.
     */
    t.d = function ( r, e, n ) {
        // If the property is not already defined.
        if ( !t.o( r, e ) ) {
            Object.defineProperty( r, e, {
                enumerable: !0,  // Make it enumerable.
                get: n           // Set the getter function.
            } );
        }
    };

    /**
     * Define __esModule on exports.
     * This marks a module as an ES module.
     * @param {Object} r - The exports object.
     */
    t.r = function ( r ) {
        // For Symbol.toStringTag, if available.
        if ( typeof Symbol !== "undefined" && Symbol.toStringTag ) {
            Object.defineProperty( r, Symbol.toStringTag, {
                value: "Module"
            } );
        }

        // Define __esModule property.
        Object.defineProperty( r, "__esModule", {
            value: !0
        } );
    };

    /**
     * Create a mock namespace object for compatibility.
     * This is used when importing non-ES modules.
     * @param {*} r - The module exports.
     * @param {number} e - Flags for processing.
     * @returns {Object} A namespace object.
     */
    t.t = function ( r, e ) {
        // Flag 1: If module is already loaded, just return it.
        if ( 1 & e ) {
            r = t( r );
        }

        // Flag 8: Return the module directly.
        if ( 8 & e ) {
            return r;
        }

        // Flag 4: If it's an object and an ES module, return it directly.
        if ( 4 & e && typeof r === "object" && r && r.__esModule ) {
            return r;
        }

        // Create a new namespace object.
        var n = Object.create( null );

        // Mark it as an ES module.
        t.r( n );

        // Define a "default" export pointing to the original module.
        Object.defineProperty( n, "default", {
            enumerable: !0,
            value: r
        } );

        // Flag 2: If not a string, copy all properties from original module.
        if ( 2 & e && typeof r !== "string" ) {
            for ( var o in r ) {
                t.d( n, o, ( function ( e ) {
                    return r[ e ];
                } ).bind( null, o ) );
            }
        }

        return n;
    };

    /**
     * Get the default export from a module.
     * @param {*} r - The module.
     * @returns {Function} A function that returns the default export.
     */
    t.n = function ( r ) {
        // If it's an ES module, return its default.
        var e = r && r.__esModule ?
            function () {
                return r.default;
            } :
            // Otherwise, return the module itself.
            function () {
                return r;
            };

        // Define a getter for 'a' that returns the function.
        t.d( e, "a", e );

        return e;
    };

    /**
     * Check if an object has a property.
     * @param {Object} r - The object to check.
     * @param {string} e - The property name.
     * @returns {boolean} True if the property exists, false otherwise.
     */
    t.o = function ( r, e ) {
        // Use Object.prototype.hasOwnProperty.call for robust checking.
        return Object.prototype.hasOwnProperty.call( r, e );
    };

    // Public path for assets (empty in this case).
    t.p = "";

    // Load the entry module (module ID 0) and execute it.
    return t( t.s = 0 );
}( [
    /*
     * Module 0: Main entry point.
     * This module reads from stdin and passes the input to module 1.
     */
    function ( r, e, t ) {
        // Require module 1.
        // Then, require module 2 (fs), read from /dev/stdin, decode as UTF-8, and split by newline.
        // Finally, call the function exported by module 1 with the processed input.
        t( 1 )(
            t( 2 )
            .readFileSync( "/dev/stdin", "UTF-8" )
            .split( "\n" )
        );
    },

    /*
     * Module 1: Core logic for processing input.
     * This module contains the main algorithm.
     */
    function ( r, e ) {
        // Helper function for array destructuring.
        function t ( r, e ) {
            // Case 1: If it's already an array, return it.
            if ( Array.isArray( r ) ) {
                return r;
            }

            // Case 2: Attempt to iterate and destructure.
            ( function ( r, e ) {
                var t = [],
                    n = !0,
                    o = !1,
                    u = void 0;

                try {
                    // Iterate through the iterable.
                    for (
                        var i, l = r[ Symbol.iterator ]();
                        !( n = ( i = l.next() ).done ) && ( t.push( i.value ), !e || t.length !== e );
                        n = !0
                    ) {}
                } catch ( r ) {
                    // Handle errors during iteration.
                    o = !0;
                    u = r;
                } finally {
                    try {
                        // Ensure iterator is closed if not done.
                        if ( !n && null != l.return ) {
                            l.return();
                        }
                    } finally {
                        // Re-throw if an error occurred.
                        if ( o ) {
                            throw u;
                        }
                    }
                }

                return t;
            } )( r, e ) ||

            // Case 3: If destructuring fails, throw a TypeError.
            ( function () {
                throw new TypeError( "Invalid attempt to destructure non-iterable instance" );
            } )();
        }

        // Export the main processing function.
        r.exports = function ( r ) {
            // Process the first line of input: split by space, convert to numbers.
            // Destructure the result into n and o.
            var e = t(
                    r[ 0 ]
                    .split( " " )
                    .map( function ( r ) {
                        return Number( r );
                    } ),
                    2
                ),
                n = e[ 0 ], // First number (n_count)
                o = e[ 1 ], // Second number (target_value)
                // Process the second line of input: split by space, convert to numbers.
                u = r[ 1 ]
                .split( " " )
                .map( function ( r ) {
                    return Number( r );
                } );

            // Sort the array of numbers in ascending order.
            u.sort( function ( r, e ) {
                return r - e;
            } );

            // Initialize flags for conditions.
            var i = !1, // Flag for 'i' (if current number is congruent to target mod first number)
                l = !1; // Flag for 'l' (if current number is greater than target)

            // Loop through the sorted array.
            for ( var f = 0; f < n; f++ ) {
                // Check condition for 'i' flag.
                // If not the first element AND current element modulo u[0] equals target modulo u[0].
                if ( 0 != f && u[ f ] % u[ 0 ] == o % u[ 0 ] && ( i = !0 ) ) {
                    /* This comment adds some extra padding */
                }

                // Check condition for 'l' flag.
                // If current element is greater than the target.
                if ( u[ f ] > o && ( l = !0 ) ) {
                    /* Another comment to vary whitespace */
                }

                // If current element is exactly equal to the target, it's possible.
                if ( u[ f ] == o ) {
                    // Output "POSSIBLE" and terminate.
                    return void console.log( "POSSIBLE" );
                }
            }

            // After the loop, check the flags to determine the outcome.
            // If both 'i' and 'l' flags are true, it's possible.
            if ( i && l ) {
                console.log( "POSSIBLE" );
            } else {
                // Otherwise, it's impossible.
                console.log( "IMPOSSIBLE" );
            }
        };
    },

    /*
     * Module 2: File System module.
     * This module simply exports the Node.js 'fs' module.
     */
    function ( r, e ) {
        // Export the 'fs' module directly.
        r.exports = require( "fs" );
    }
] );