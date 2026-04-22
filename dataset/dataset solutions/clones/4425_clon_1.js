module.exports = function ( t ) {

    // This object serves as the modules cache.
    var e = {};

    // The core module loading function.
    function r ( n ) {
        // If the module is already in the cache, return its exports immediately.
        if ( e[ n ] ) {
            return e[ n ].exports;
        }

        // Otherwise, create a new module entry in the cache.
        var i = e[ n ] = {
            i: n,       // The module ID.
            l: !1,      // A flag indicating if the module has been loaded.
            exports: {} // The exports object for this module.
        };

        // Execute the module's factory function, populating its exports.
        // `t[n]` is the module's factory function.
        // `i.exports` is passed as `this` and `exports`.
        // `i` is the module object itself.
        // `r` is the local `require` function.
        t[ n ].call( i.exports, i, i.exports, r );

        // Mark the module as loaded after execution.
        i.l = !0;

        // Return the populated exports object.
        return i.exports;
    }

    // Expose the modules object (contains all module factory functions).
    r.m = t;

    // Expose the module cache object.
    r.c = e;

    // Helper function to define a getter for harmony exports.
    r.d = function ( t, e, n ) {
        // Only define the property if it doesn't already exist on the object.
        if ( !r.o( t, e ) ) {
            Object.defineProperty( t, e, {
                enumerable: !0, // Make the property enumerable.
                get: n          // The getter function for the property.
            } );
        }
    };

    // Helper function to define __esModule on exports.
    r.r = function ( t ) {
        // If Symbol and Symbol.toStringTag are available, define it for better module identification.
        if ( typeof Symbol !== "undefined" && Symbol.toStringTag ) {
            Object.defineProperty( t, Symbol.toStringTag, { value: "Module" } );
        }
        // Define the __esModule property to indicate it's an ES module.
        Object.defineProperty( t, "__esModule", { value: !0 } );
    };

    // Helper function to create a fake namespace object for compatibility.
    // This handles various scenarios for module interoperability.
    // mode & 1: value is a module id, require it.
    // mode & 8: behave like require.
    // mode & 4: return existing value if it's already a namespace object.
    // mode & 2: merge all properties of value into the ns.
    r.t = function ( t, e ) {
        // If mode 1 is set, treat `t` as a module ID and load it.
        if ( 1 & e ) {
            t = r( t );
        }

        // If mode 8 is set, simply return `t`.
        if ( 8 & e ) {
            return t;
        }

        // If mode 4 is set and `t` is already an ES module namespace object, return it.
        if ( 4 & e && typeof t === "object" && t && t.__esModule ) {
            return t;
        }

        // Create a new empty object for the namespace.
        var n = Object.create( null );

        // Mark the new object as an ES module.
        r.r( n );

        // Define a 'default' property that points to the original `t`.
        Object.defineProperty( n, "default", { enumerable: !0, value: t } );

        // If mode 2 is set and `t` is not a string, merge all properties from `t` into `n`.
        if ( 2 & e && typeof t !== "string" ) {
            for ( var i in t ) {
                // Define a getter for each property, binding it to the current `i`.
                r.d( n, i, ( function ( e ) {
                    return t[ e ];
                } ).bind( null, i ) );
            }
        }
        return n;
    };

    // Helper function to get the default export from a module.
    r.n = function ( t ) {
        // Create a getter function:
        // If `t` is an ES module, return `t.default`.
        // Otherwise, return `t` itself.
        var e = t && t.__esModule ?
            function () {
                return t.default;
            } :
            function () {
                return t;
            };

        // Define a property 'a' on the getter function `e` itself, making it point to `e`.
        // This is a common Webpack pattern for non-interop getters.
        r.d( e, "a", e );
        return e;
    };

    // Helper function for Object.prototype.hasOwnProperty.call.
    r.o = function ( t, e ) {
        return Object.prototype.hasOwnProperty.call( t, e );
    };

    // The public path for assets (often empty in simple bundles).
    r.p = "";

    // Load the entry module (module ID 0) and return its exports.
    return r( r.s = 0 );

// The array of all module definitions (factory functions).
}( [
    // Module 0: The primary entry point of the application.
    function ( t, e, r ) {
        "use strict";

        // Require the 'fs' (filesystem) module.
        var n = r( 1 );

        // Initialize a new input reader.
        // It reads from /dev/stdin, decodes as UTF-8, and splits the content by whitespace.
        var i = new ( r( 2 ) )( n.readFileSync( "/dev/stdin", "utf8" ).split( /\s+/g ) );

        // Execute the main logic contained in module 4, passing the input reader.
        r( 4 )( i );
    },

    // Module 1: Exports the Node.js built-in 'fs' module.
    function ( t, e ) {
        // Direct export of the 'fs' module.
        t.exports = require( "fs" );
    },

    // Module 2: A custom class for reading parsed input tokens.
    function ( t, e, r ) {
        "use strict";

        // Require the underlying queue-like data structure.
        var n = r( 3 );

        // Export the InputReader class.
        t.exports = class {
            // Constructor: Initializes with an array of input tokens.
            constructor ( t ) {
                this.inp = new n( t ); // Creates an instance of the queue-like structure.
            }

            // Method `n()`: Dequeues and returns the next input token.
            n () {
                return this.inp.deq();
            }

            // Method `ni()`: Dequeues the next input token and parses it as an integer.
            ni () {
                return parseInt( this.inp.deq(), 10 );
            }

            // Method `add()`: Enqueues a token into the input (unusual for a reader, but part of the original).
            add ( t ) {
                this.inp.enq( t );
            }
        };
    },

    // Module 3: A simple Queue-like class implementation.
    function ( t, e, r ) {
        "use strict";

        // Export the Queue class.
        t.exports = class {
            // Constructor: Can be initialized with an optional array of items.
            constructor () {
                var t = arguments.length > 0 && void 0 !== arguments[ 0 ] ? arguments[ 0 ] : [];
                this.size = t.length; // Tracks the number of items currently in the queue.
                this.items = t;       // The internal array holding the items.
                this.ind = 0;         // The index of the next item to be dequeued.
            }

            // Method `enq()`: Enqueues an item (adds to the end).
            enq ( t ) {
                this.size += 1;
                this.items.push( t );
            }

            // Method `deq()`: Dequeues an item (removes from the front, by advancing `ind`).
            deq () {
                var t = this.items[ this.ind ];
                this.size -= 1;
                this.ind += 1;
                return t;
            }
        };
    },

    // Module 4: Contains the main application logic, likely involving graph traversal.
    function ( t, e, r ) {
        "use strict";

        // The main function that takes an input reader object.
        t.exports = function ( t ) {

            // Read the number of nodes (vertices) in the graph.
            var e = t.ni();

            // Initialize an adjacency list representation for the graph.
            var r = new Array( e );
            for ( var n = 0; n < e; n++ ) {
                r[ n ] = []; // Each node gets an empty list for its neighbors.
            }

            // Read (e - 1) edges to build the graph.
            // Assuming a tree or connected graph structure for (e-1) edges for 'e' nodes.
            for ( var i = 0; i < e - 1; i++ ) {
                var o = t.ni(), // First node of the edge (1-indexed).
                    s = t.ni(), // Second node of the edge (1-indexed).
                    u = t.ni(); // Weight/cost of the edge.

                // Add edge to adjacency list (undirected graph).
                r[ o - 1 ].push( [ s - 1, u ] ); // Store neighbor and weight.
                r[ s - 1 ].push( [ o - 1, u ] );
            }

            // Read the number of queries and the starting node for path calculations.
            var f = t.ni(), // Number of queries.
                a = t.ni(); // Starting node (1-indexed) for BFS.

            // Initialize a distance array; -1 means unvisited.
            var c = new Array( e ).fill( -1 );

            // Initialize a queue for Breadth-First Search (BFS).
            // Each element in the queue is `[node_index, distance_from_start]`.
            var l = [ [ a - 1, 0 ] ];

            // Perform BFS to calculate distances from the starting node 'a' to all other reachable nodes.
            while ( l.length > 0 ) {
                // Dequeue the current node and its distance.
                var p = l.pop(); // Using pop, so it's technically DFS if not careful, but works for distance propagation.

                // Get the number of neighbors for the current node.
                var d = r[ p[ 0 ] ].length;

                // Iterate through all neighbors of the current node.
                for ( var v = 0; v < d; v++ ) {
                    var h = r[ p[ 0 ] ][ v ]; // Neighbor: `[neighbor_node_index, edge_weight]`.

                    // If the neighbor has not been visited yet (distance is -1).
                    if ( c[ h[ 0 ] ] == -1 ) {
                        // Calculate the total distance to this neighbor.
                        var y = p[ 1 ] + h[ 1 ];

                        // Update the distance for the neighbor.
                        c[ h[ 0 ] ] = y;

                        // Enqueue the neighbor for further exploration.
                        l.push( [ h[ 0 ], y ] );
                    }
                }
            }

            // Process the given queries.
            for ( var b = 0; b < f; b++ ) {
                var g = t.ni() - 1, // First query node (1-indexed).
                    m = t.ni() - 1; // Second query node (1-indexed).

                // Calculate the sum of distances from the starting node 'a' to 'g' and from 'a' to 'm'.
                var x = c[ g ] + c[ m ];
                console.log( x ); // Output the result for each query.
            }
        };
    }
] );