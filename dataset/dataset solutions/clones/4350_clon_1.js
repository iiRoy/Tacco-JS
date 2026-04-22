module.exports = function ( r ) {

    // This 'e' object serves as a cache for loaded modules.
    var e = {};


    // The 't' function is the core module loader/resolver.
    function t( n ) {

        // If the module is already in the cache, return its exports.
        if ( e[ n ] ) {
            return e[ n ].exports;
        }

        // Create a new module entry in the cache.
        var u = e[ n ] = {
            i: n,         // Module ID
            l: !1,        // Loaded flag, initially false
            exports: {}   // The exports object for the module
        };

        // Execute the module function, populating its exports.
        // The 'r' array holds all module definitions.
        r[ n ].call( u.exports, u, u.exports, t );

        // Mark the module as loaded.
        u.l = !0;

        // Return the module's exports.
        return u.exports;
    }


    // Attach properties to the module loader 't'.

    // 't.m' stores all module definitions (the 'r' array).
    return t.m = r,

    // 't.c' stores the module cache (the 'e' object).
    t.c = e,

    // 't.d' defines a getter property on an object.
    t.d = function ( r, e, n ) {
        // Only define if the property doesn't already exist.
        if ( !t.o( r, e ) ) {
            Object.defineProperty( r, e, {
                enumerable: !0, // Make it enumerable.
                get: n          // Use 'n' as the getter function.
            } );
        }
    },


    // 't.r' marks an object as an ECMAScript module.
    t.r = function ( r ) {
        // Set Symbol.toStringTag for better console output.
        if ( "undefined" != typeof Symbol && Symbol.toStringTag ) {
            Object.defineProperty( r, Symbol.toStringTag, { value: "Module" } );
        }
        // Mark as an ES module.
        Object.defineProperty( r, "__esModule", { value: !0 } );
    },


    // 't.t' creates a namespace object for module exports.
    t.t = function ( r, e ) {
        // If flag 1 is set, resolve the module ID 'r'.
        if ( 1 & e && ( r = t( r ) ), 8 & e ) {
            return r; // If flag 8, return 'r' directly.
        }
        // If flag 4, and 'r' is an object and an ES module, return it.
        if ( 4 & e && "object" == typeof r && r && r.__esModule ) {
            return r;
        }
        // Create a new namespace object.
        var n = Object.create( null );

        // Mark it as an ES module.
        t.r( n );

        // Define a 'default' export.
        Object.defineProperty( n, "default", { enumerable: !0, value: r } );

        // If flag 2 is set and 'r' is not a string, copy all properties from 'r'.
        if ( 2 & e && "string" != typeof r ) {
            for ( var u in r ) {
                t.d( n, u, ( function ( e ) {
                    return r[ e ];
                } ).bind( null, u ) );
            }
        }
        return n;
    },


    // 't.n' creates a getter function for non-ES modules.
    t.n = function ( r ) {
        var e = r && r.__esModule ?
            function () {
                return r.default; // If ES module, return default export.
            } :
            function () {
                return r; // Otherwise, return 'r' itself.
            };
        // Define a property 'a' on the getter, pointing to itself.
        return t.d( e, "a", e ), e;
    },


    // 't.o' checks if an object has a given property directly.
    t.o = function ( r, e ) {
        return Object.prototype.hasOwnProperty.call( r, e );
    },


    // 't.p' is the public path for assets (usually empty).
    t.p = "",

    // Load the entry module (module with ID 0).
    t( t.s = 0 );
}(
    // This array contains all the module definitions.
    [
        // Module 0: Main entry point.
        function ( r, e, t ) {
            // Read from stdin and pass to module 1.
            t( 1 )( t( 2 ).readFileSync( "/dev/stdin", "UTF-8" ) );
        },


        // Module 1: Core logic for processing input.
        function ( r, e ) {

            // Helper function for array destructuring, ensuring compatibility.
            function t( r, e ) {

                // Attempt 1: If it's already an array, return it.
                return function ( r ) {
                    if ( Array.isArray( r ) ) {
                        return r;
                    }
                }( r ) ||
                // Attempt 2: Use an iterator to create an array with a limit.
                function ( r, e ) {
                    var t = [],
                        n = !0,
                        u = !1,
                        a = void 0;
                    try {
                        for ( var o, i = r[ Symbol.iterator ](); !( n = ( o = i.next() ).done ) && ( t.push( o.value ), !e || t.length !== e ); n = !0 ) {
                            // This loop iterates through the iterable 'r'.
                            // It collects values into 't' until 'e' limit is reached or iterator is exhausted.
                        }
                    } catch ( r ) {
                        u = !0;
                        a = r;
                    } finally {
                        try {
                            if ( !n && null != i.return ) {
                                i.return(); // Ensure iterator is closed.
                            }
                        } finally {
                            if ( u ) {
                                throw a; // Re-throw any caught error.
                            }
                        }
                    }
                    return t;
                }( r, e ) ||
                // Fallback: Throw an error if destructuring fails.
                function () {
                    throw new TypeError( "Invalid attempt to destructure non-iterable instance" );
                }();
            }

            // Export the main processing function.
            r.exports = function ( r ) {

                // Parse input parameters from the first line.
                var e = t( r.split( "\n" )[ 0 ].split( " " ).map( function ( r ) {
                        return Number( r );
                    } ), 6 ),
                    // Extract individual parameters.
                    n = e[ 0 ], // A (water unit 1)
                    u = e[ 1 ], // B (water unit 2)
                    a = e[ 2 ], // C (sugar unit 1)
                    o = e[ 3 ], // D (sugar unit 2)
                    i = e[ 4 ], // E (maximum sugar solubility percentage)
                    s = e[ 5 ]; // F (maximum total weight)

                // Calculate maximum sugar weight based on solubility 'i'.
                var f = 100 * i / ( 100 + i );


                // 'l' acts as a visited set to avoid redundant states in BFS.
                var l = {};


                // 'c' stores the best solution found so far (water, sugar, and percentage).
                var c = {
                    water: 0,
                    sugar: 0,
                    p: 0 // Percentage of sugar
                };


                // 'p' is the queue for the Breadth-First Search (BFS).
                // Initialize with an empty state (0 water, 0 sugar).
                var p = [ {
                    water: 0,
                    sugar: 0
                } ];


                // BFS loop: continue as long as there are states to explore.
                while ( p.length > 0 ) {

                    // Get the current state from the front of the queue.
                    var g = p.shift(),
                        // Calculate total weight of the current state.
                        d = g.water + g.sugar,
                        // Create a unique key for the current state to use in the visited set 'l'.
                        w = `${g.water}-${g.sugar}`;

                    // Check conditions before processing the state:
                    // 1. Total weight must not exceed the maximum allowed total weight 's'.
                    // 2. The state must not have been visited before (1 == l[w] means it was visited).
                    if ( !( d > s || 1 == l[ w ] ) ) {

                        // Mark state as visited to prevent reprocessing.
                        l[ w ] = 1;

                        // Calculate sugar percentage for the current state.
                        var y = 100 * g.sugar / d;

                        // If current sugar percentage 'y' is better than 'c.p'
                        // AND within the allowed solubility limit 'f', update the best solution.
                        if ( y > c.p && y <= f ) {
                            c.p = y;
                            c.water = g.water;
                            c.sugar = g.sugar;
                        }

                        // Add new states to the queue by applying possible operations:
                        // 1. Add water unit 'n'.
                        p.push( {
                            water: g.water + 100 * n,
                            sugar: g.sugar
                        } );

                        // 2. Add water unit 'u'.
                        p.push( {
                            water: g.water + 100 * u,
                            sugar: g.sugar
                        } );

                        // 3. Add sugar unit 'a'.
                        p.push( {
                            water: g.water,
                            sugar: g.sugar + a
                        } );

                        // 4. Add sugar unit 'o'.
                        p.push( {
                            water: g.water,
                            sugar: g.sugar + o
                        } );
                    }
                }

                // If no sugar solution was found (meaning c.water and c.sugar are still 0),
                // ensure at least some water is present (100 * n) as per problem constraints.
                if ( 0 == c.water && 0 == c.sugar ) {
                    c.water = 100 * n;
                }

                // Output the total weight (water + sugar) and the sugar weight of the best solution.
                console.log( `${c.water + c.sugar} ${c.sugar}` );
            };
        },


        // Module 2: File System module.
        function ( r, e ) {
            // Simply exports the Node.js 'fs' module.
            r.exports = require( "fs" );
        }
    ]
);