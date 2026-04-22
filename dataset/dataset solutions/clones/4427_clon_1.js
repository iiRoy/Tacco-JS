/* This is a webpack bootstrap function.
 * It encapsulates modules and provides a way to load them. */
module.exports = function ( r ) {
    // A cache for loaded modules.
    var t = { };

    /**
     * The core module loading function.
     * @param {string} n - The module ID.
     * @returns {object} The exports of the module.
     */
    function e ( n ) {
        // If module is already in cache, return its exports.
        if ( t[ n ] ) {
            return t[ n ].exports;
        }

        // Create a new module entry in the cache.
        var u = t[ n ] = {
            i: n,      // Module ID
            l: !1,     // Loaded flag (false initially)
            exports: { } // Exports object
        };

        // Execute the module function, populating u.exports.
        r[ n ].call( u.exports, u, u.exports, e );

        // Mark the module as loaded.
        u.l = !0;

        // Return the module's exports.
        return u.exports;
    }

    /* --- Webpack runtime helper functions --- */

    // Store the module definitions.
    e.m = r;

    // Store the module cache.
    e.c = t;

    /**
     * Define a getter function for an export.
     * This is used for compatibility with non-ESM modules.
     * @param {object} r - The exports object.
     * @param {string} t - The property name.
     * @param {function} n - The getter function.
     */
    e.d = function ( r, t, n ) {
        if ( !e.o( r, t ) ) {
            Object.defineProperty( r, t, {
                enumerable: !0, // Make it enumerable
                get: n          // The getter function
            } );
        }
    };

    /**
     * Mark an exports object as an ES module.
     * This adds __esModule and Symbol.toStringTag properties.
     * @param {object} r - The exports object.
     */
    e.r = function ( r ) {
        if ( "undefined" != typeof Symbol && Symbol.toStringTag ) {
            Object.defineProperty( r, Symbol.toStringTag, { value: "Module" } );
        }
        Object.defineProperty( r, "__esModule", { value: !0 } );
    };

    /**
     * Create a namespace object for module exports.
     * This is used for compatibility between different module types.
     * @param {any} r - The module exports.
     * @param {number} t - Flags indicating export type.
     * @returns {object} The namespace object.
     */
    e.t = function ( r, t ) {
        // Check if r is already a module or needs to be loaded.
        if ( 1 & t && ( r = e( r ) ) ) {
            return r;
        }

        // If it's already a namespace object, return it.
        if ( 8 & t ) {
            return r;
        }

        // If it's a CommonJS module, and not already a namespace.
        if ( 4 & t && "object" == typeof r && r && r.__esModule ) {
            return r;
        }

        // Create a new namespace object.
        var n = Object.create( null );

        // Mark as ES module.
        e.r( n );

        // Set 'default' export.
        Object.defineProperty( n, "default", { enumerable: !0, value: r } );

        // If not a string, copy all properties from the original module.
        if ( 2 & t && "string" != typeof r ) {
            for ( var u in r ) {
                e.d( n, u, ( function ( t ) {
                    return r[ t ];
                } ).bind( null, u ) );
            }
        }
        return n;
    };

    /**
     * Get a default export function from a module.
     * Used for interop with CommonJS default exports.
     * @param {object} r - The module exports.
     * @returns {function} A function that returns the default export.
     */
    e.n = function ( r ) {
        var t = r && r.__esModule
            ? function ( ) { return r.default; }
            : function ( ) { return r; };
        e.d( t, "a", t ); // Add a property 'a' pointing to the function itself.
        return t;
    };

    /**
     * Check if an object has a property.
     * A polyfill for Object.prototype.hasOwnProperty.call.
     * @param {object} r - The object to check.
     * @param {string} t - The property name.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    e.o = function ( r, t ) {
        return Object.prototype.hasOwnProperty.call( r, t );
    };

    // Public path for assets (empty in this case).
    e.p = "";

    // Load the entry module (module 0).
    return e( e.s = 0 );
} ( [

    /* Module 0: Entry point */
    function ( r, t, e ) {
        // Load module 1, passing it the result of module 2 reading stdin.
        e( 1 ) ( e( 2 ).readFileSync( "/dev/stdin", "UTF-8" ).split( "\n" ) );
    },

    /* Module 1: Main application logic */
    function ( r, t, e ) {
        "use strict"; // Enable strict mode for this module.

        /**
         * Helper function to destructure an iterable (like an array).
         * @param {Array} r - The array to destructure.
         * @param {number} t - The number of elements to extract.
         * @returns {Array} An array containing the destructured elements.
         * @throws {TypeError} If the input is not iterable or cannot be destructured.
         */
        function n ( r, t ) {
            return function ( r ) {
                // If it's already an array, just return it.
                if ( Array.isArray( r ) ) {
                    return r;
                }
            } ( r )
            || function ( r, t ) {
                var e = [ ],
                    n = !0,
                    u = !1,
                    o = void 0;
                try {
                    // Iterate through the iterable.
                    for ( var i, l = r[ Symbol.iterator ]( );
                          ! ( n = ( i = l.next( ) ).done ) && ( e.push( i.value ), !t || e.length !== t );
                          n = !0 ) {
                        /* Loop continues */
                    }
                } catch ( r ) {
                    u = !0;
                    o = r;
                } finally {
                    try {
                        if ( !n && null != l.return ) {
                            l.return( );
                        }
                    } finally {
                        if ( u ) {
                            throw o;
                        }
                    }
                }
                return e;
            } ( r, t )
            || function ( ) {
                throw new TypeError( "Invalid attempt to destructure non-iterable instance" );
            } ( );
        }

        // Export the main function of this module.
        r.exports = function ( r ) {
            // Parse the first line to get the number of nodes (t).
            for (
                var t = Number( r[ 0 ] ), // Number of nodes
                e = new Array( t ),      // Adjacency list for the graph
                u = 0;                   // Loop counter
                u < t;
                u++
            ) {
                e[ u ] = [ ]; // Initialize each node's adjacency list as an empty array.
            }

            // Loop through the next t-1 lines to build the graph.
            for ( var o = 0; o < t - 1; o++ ) {
                // Parse edge data: l (node1), a (node2), f (cost).
                var i = n( r[ o + 1 ].split( " " ).map( function ( r ) { return Number( r ); } ), 3 ),
                    l = i[ 0 ],
                    a = i[ 1 ],
                    f = i[ 2 ];

                // Add edges to the adjacency list (0-indexed).
                e[ l - 1 ].push( { v: a - 1, c: f } );
                e[ a - 1 ].push( { v: l - 1, c: f } );
            }

            // Parse the t-th line for start and end nodes of the path.
            var c = n( r[ t ].split( " " ).map( function ( r ) { return Number( r ); } ), 2 ),
                s = c[ 0 ], // Number of queries
                v = c[ 1 ]; // Starting node for BFS

            // Array to store shortest path sums from the starting node (v).
            // Initialized with -1 to indicate unvisited nodes.
            var p = new Array( t ).fill( -1 );

            // Queue for BFS (Breadth-First Search).
            // Starts with the initial node and a sum of 0.
            var y = [ { v: v - 1, sum: 0 } ];

            // Index for processing the queue.
            var d = 0;

            // BFS algorithm to find shortest path sums from 'v'.
            while ( y.length > d ) {
                var m = y[ d ]; // Current node from the queue.
                d++;            // Move to the next element in the queue.

                // If this node has not been visited, record its sum.
                // Note: The original code assigns sum directly, meaning if a node is visited multiple times,
                // the *first* visit's sum is kept due to the -1 check.
                // This implies it's a simple BFS for unweighted graphs or a specific path sum problem.
                // Given the `sum+j.c` later, it's a path sum.
                p[ m.v ] = m.sum;

                // Loop through neighbors.
                var b = !0, // Flag for iterator completion
                    h = !1, // Flag for iterator error
                    x = void 0; // Error object

                try {
                    for ( var g, S = e[ m.v ][ Symbol.iterator ]( );
                          ! ( b = ( g = S.next( ) ).done );
                          b = !0 ) {
                        var j = g.value; // Neighbor node data {v: neighbor_index, c: cost_to_neighbor}

                        // If neighbor has not been visited, add it to the queue.
                        if ( -1 == p[ j.v ] ) {
                            y.push( { v: j.v, sum: m.sum + j.c } );
                        }
                    }
                } catch ( r ) {
                    h = !0;
                    x = r;
                } finally {
                    try {
                        if ( !b && null == S.return ) {
                            S.return( );
                        }
                    } finally {
                        if ( h ) {
                            throw x;
                        }
                    }
                }
            }

            // Process 's' queries.
            for ( var w = 0; w < s; w++ ) {
                // Parse query nodes (source and destination for query).
                var O = n( r[ w + t + 1 ].split( " " ).map( function ( r ) { return Number( r ); } ), 2 ),
                    _ = O[ 0 ], // Query node 1
                    P = O[ 1 ], // Query node 2
                    A = p[ _ - 1 ] + p[ P - 1 ]; // Sum of distances from 'v' to each query node.

                // Output the result.
                console.log( A );
            }
        };
    },

    /* Module 2: Node.js 'fs' module */
    function ( r, t ) {
        r.exports = require( "fs" ); // Export the 'fs' module.
    }
] );