module.exports = function( r ) {
    /*
     * This is the main bundle wrapper function.
     * It simulates a module loading system, similar to Webpack.
     */

    // e: A cache for loaded modules.
    var e = {};

    // t: The core module loading function (webpack_require).
    function t( n ) {

        // If the module is already in cache, return its exports.
        if ( e[ n ] ) {
            return e[ n ].exports;
        }

        // Create a new module entry in the cache.
        var o = e[ n ] = {
            i: n,      // module ID
            l: !1,     // loaded flag
            exports: {} // module exports object
        };

        /*
         * Execute the module function, passing in:
         * - module.exports (o.exports)
         * - module (o)
         * - module.exports again (o.exports)
         * - the webpack_require function itself (t)
         */
        r[ n ].call( o.exports, o, o.exports, t );

        // Mark the module as loaded.
        o.l = !0;

        // Return the module's exports.
        return o.exports
    }

    // --- Webpack Runtime Functions ---

    // t.m: Stores all the module functions (the 'r' argument).
    t.m = r;

    // t.c: Stores the module cache (the 'e' variable).
    t.c = e;

    /**
     * t.d: Defines a getter function for an export.
     * @param {object} r - The exports object.
     * @param {string} e - The property name.
     * @param {function} n - The getter function.
     */
    t.d = function( r, e, n ) {
        if ( !t.o( r, e ) ) {
            Object.defineProperty( r, e, {
                enumerable: !0,
                get:        n
            } );
        }
    };

    /**
     * t.r: Adds __esModule and Symbol.toStringTag properties to exports.
     * @param {object} r - The exports object.
     */
    t.r = function( r ) {
        // Add Symbol.toStringTag for better module identification.
        if ( "undefined" != typeof Symbol && Symbol.toStringTag ) {
            Object.defineProperty( r, Symbol.toStringTag, { value: "Module" } );
        }
        // Mark as an ES module.
        Object.defineProperty( r, "__esModule", { value: !0 } );
    };

    /**
     * t.t: Creates a namespace object for module exports.
     * This handles various export formats (commonjs, esm, etc.).
     * @param {any} r - The module to process.
     * @param {number} e - Flags indicating export type.
     */
    t.t = function( r, e ) {
        // Flag 1: If it's a module ID, load it.
        if ( 1 & e && ( r = t( r ) ) ) {
            return r;
        }

        // Flag 8: Return the module as is.
        if ( 8 & e ) {
            return r;
        }

        // Flag 4: If it's an ES module, return it directly.
        if ( 4 & e && "object" == typeof r && r && r.__esModule ) {
            return r;
        }

        // Create a new namespace object.
        var n = Object.create( null );

        // Mark it as an ES module and define the 'default' export.
        t.r( n );
        Object.defineProperty( n, "default", { enumerable: !0, value: r } );

        // Flag 2: If not a string, copy all properties from the original module.
        if ( 2 & e && "string" != typeof r ) {
            for ( var o in r ) {
                t.d( n, o, ( function( e ) {
                    return r[ e ]
                } ).bind( null, o ) );
            }
        }
        return n
    };

    /**
     * t.n: Creates a getter for the default export.
     * Handles both ES module default exports and commonjs exports.
     * @param {object} r - The module object.
     */
    t.n = function( r ) {
        var e = r && r.__esModule ?
            function() { return r.default } :
            function() { return r };

        // Define a getter 'a' for the default export.
        t.d( e, "a", e );
        return e
    };

    /**
     * t.o: Checks if an object has a property.
     * @param {object} r - The object to check.
     * @param {string} e - The property name.
     */
    t.o = function( r, e ) {
        return Object.prototype.hasOwnProperty.call( r, e )
    };

    // t.p: Public path for assets (empty in this case).
    t.p = "";

    // --- Entry Point ---
    // Load and execute the entry module (module ID 0).
    return t( t.s = 0 )

}(
    // The array of all modules in the bundle.
    [
        /*
         * Module 0: Entry point for the application.
         * Reads input from /dev/stdin and passes it to module 1.
         */
        function( r, e, t ) {
            // Read from stdin, decode as UTF-8, split by newlines, then pass to module 1.
            t( 1 )( t( 2 ).readFileSync( "/dev/stdin", "UTF-8" ).split( "\n" ) )
        },

        /*
         * Module 1: Contains the main logic to calculate GCD.
         * It takes an array of strings (lines from stdin).
         */
        function( r, e ) {

            /**
             * Helper function for destructuring arrays.
             * Mimics array destructuring behavior for non-iterable instances.
             * @param {Iterable} r - The iterable to destructure.
             * @param {number} e - The maximum number of elements to extract.
             */
            function t( r, e ) {
                // Case 1: Already an array.
                return function( r ) {
                    if ( Array.isArray( r ) ) {
                        return r
                    }
                }( r ) ||

                // Case 2: Iterable, extract up to 'e' elements.
                function( r, e ) {
                    var t = [],
                        n = !0,
                        o = !1,
                        u = void 0;
                    try {
                        for (
                            var i,
                                f = r[ Symbol.iterator ]();
                            !( n = ( i = f.next() ).done ) && ( t.push( i.value ), !e || t.length !== e );
                            n = !0
                        ) {
                            // Loop body is intentionally empty.
                            ;
                        }
                    } catch ( r ) {
                        o = !0;
                        u = r
                    } finally {
                        try {
                            if ( !n && null != f.return ) {
                                f.return()
                            }
                        } finally {
                            if ( o ) {
                                throw u
                            }
                        }
                    }
                    return t
                }( r, e ) ||

                // Case 3: Neither array nor iterable, throw an error.
                function() {
                    throw new TypeError( "Invalid attempt to destructure non-iterable instance" )
                }()
            }

            // The main logic exported by this module.
            r.exports = function( r ) {
                // Parse the first line of input.
                // It's expected to be two space-separated numbers.
                var e = t( r[ 0 ].split( " " ).map( function( r ) {
                    return Number( r )
                } ), 2 ),
                    n = e[ 0 ], // First number
                    o = e[ 1 ], // Second number
                    u = Math.floor( o / n ), // Initialize u with quotient
                    i = o % n; // Initialize i with remainder

                // Euclidean algorithm to find GCD.
                // Uses a modified version for potentially larger numbers or specific context.
                while ( i > 0 ) {
                    var f = i;
                    i = u % i;
                    u = f
                }

                // Output the Greatest Common Divisor (GCD).
                console.log( u )
            }
        },

        /*
         * Module 2: Simply exports the Node.js 'fs' module.
         */
        function( r, e ) {
            r.exports = require( "fs" )
        }
    ]
);