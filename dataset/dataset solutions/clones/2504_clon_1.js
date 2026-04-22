/*
 * This is a Type I clone generated from the original JavaScript code.
 * It maintains exact functional equivalence, only varying whitespace and comments.
 * The structure and logic remain completely identical to the source.
 */
module.exports = function( t ) { /* The main webpack bootstrap function. */

    var r = {}; /* This object serves as the module cache. */

    /*
     * The core 'e' function is responsible for loading modules.
     * It simulates a 'require' function within the bundled context.
     *
     * @param {number} n The module ID to load.
     * @returns {object} The exports of the loaded module.
     */
    function e( n ) {

        /* Check if the module is already in the cache. */
        if ( r[ n ] ) {

            /* If found, return its existing exports immediately. */
            return r[ n ].exports;

        }

        /*
         * If not cached, create a new module entry.
         * 'i' represents the module object.
         * 'i.i' is the module's ID.
         * 'i.l' is a flag indicating if the module has been loaded.
         * 'i.exports' is the object that will hold the module's exports.
         */
        var i = r[ n ] = {
            i: n,
            l: !1,
            exports: {}
        };

        /*
         * Execute the module function itself.
         * 't[n]' refers to the actual module definition function.
         * Arguments passed are:
         *   - 'this' context: i.exports (the module's exports object)
         *   - 'module': i (the module object)
         *   - 'exports': i.exports (the module's exports object)
         *   - 'require': e (the local require function)
         */
        t[ n ].call( i.exports, i, i.exports, e );

        i.l = !0; /* Mark the module as loaded after execution. */

        return i.exports; /* Return the module's exports. */

    }


    /*
     * Attach various utility properties and functions to the 'e' (require) function.
     * These are part of the standard webpack runtime.
     */

    e.m = t; /* Stores all the module definition functions. */

    e.c = r; /* Stores the module cache. */

    /*
     * Defines a getter function for a property on an object.
     * Used for compatibility with ES modules and webpack's internal property definition.
     *
     * @param {object} t The target object.
     * @param {string} r The name of the property to define.
     * @param {function} n The getter function for the property.
     */
    e.d = function( t, r, n ) {

        /* Only define the property if it doesn't already exist on the object. */
        if ( !e.o( t, r ) ) {

            Object.defineProperty( t, r, {
                enumerable: !0, /* Make the property enumerable. */
                get: n /* Assign the provided getter function. */
            } );

        }

    };

    /*
     * Defines __esModule on the exports object to signify it's an ES module.
     * This helps in interoperability with other module systems.
     *
     * @param {object} t The exports object.
     */
    e.r = function( t ) {

        /* For environments supporting Symbol and Symbol.toStringTag, define it. */
        if ( typeof Symbol !== "undefined" && Symbol.toStringTag ) {
            Object.defineProperty( t, Symbol.toStringTag, {
                value: "Module"
            } );
        }

        /* Always define the __esModule flag. */
        Object.defineProperty( t, "__esModule", {
            value: !0
        } );

    };

    /*
     * Creates a fake namespace object for compatibility.
     * This is crucial when importing non-ES modules (like CommonJS) into ES modules.
     *
     * @param {any} t The module's exports.
     * @param {number} r Flags indicating the type of module/import.
     * @returns {object} A namespace object.
     */
    e.t = function( t, r ) {

        /* If flag 1 is set, it means the module itself needs to be required first. */
        if ( 1 & r ) {
            t = e( t );
        }

        /* If flag 8 is set, it's a direct module export; return as is. */
        if ( 8 & r ) {
            return t;
        }

        /* If flag 4 is set, and it's an object that's already an ES module, return it. */
        if ( 4 & r && typeof t === "object" && t && t.__esModule ) {
            return t;
        }

        /* Create a new plain object to serve as the namespace. */
        var n = Object.create( null );

        e.r( n ); /* Mark the new object as an ES module. */

        /* Define the 'default' export property. */
        Object.defineProperty( n, "default", {
            enumerable: !0,
            value: t
        } );

        /* If flag 2 is set and the module isn't a string, iterate its properties. */
        if ( 2 & r && typeof t !== "string" ) {
            for ( var i in t ) {
                e.d( n, i, ( function( r ) {
                    return t[ r ];
                } ).bind( null, i ) );
            }
        }
        return n; /* Return the constructed namespace object. */

    };

    /*
     * Helper function to retrieve the default export of a module.
     * Handles both ES module default exports and CommonJS module.exports.
     *
     * @param {object} t The module's exports object.
     * @returns {function} A getter function for the default export.
     */
    e.n = function( t ) {

        var r = t && t.__esModule ? /* If it's an ES module, return its 'default' property. */
            function() {
                return t.default;
            } :
            function() {
                return t; /* Otherwise, return the module exports directly. */
            };

        e.d( r, "a", r ); /* Define a synthetic 'a' property that gets the default export. */

        return r; /* Return the getter function. */

    };

    /*
     * Checks if an object has a specified property using Object.prototype.hasOwnProperty.call.
     * This is a safer way to check for properties, avoiding issues with shadowed 'hasOwnProperty'.
     *
     * @param {object} t The object to check.
     * @param {string} r The property name.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    e.o = function( t, r ) {

        return Object.prototype.hasOwnProperty.call( t, r );

    };

    e.p = ""; /* The public path for assets (empty in this case). */

    /*
     * The entry point of the application.
     * Sets module '0' as the starting module and executes it.
     */
    return e( e.s = 0 );

}( [ /* The array of all modules in the bundle starts here. */

    /* Module 0: The primary application entry point. */
    function( t, r, e ) {
        "use strict"; /* Enforce strict JavaScript mode. */

        var n = e( 1 ); /* Require module 1, which provides the 'fs' (file system) functionality. */

        /*
         * Require module 2, then immediately call it.
         * The input to module 2 is the content of '/dev/stdin' (standard input),
         * read synchronously as a UTF-8 string using 'fs.readFileSync'.
         */
        e( 2 )( n.readFileSync( "/dev/stdin", "utf8" ) );
    },

    /* Module 1: Provides Node.js 'fs' (file system) module. */
    function( t, r ) {
        t.exports = require( "fs" ); /* Export the native Node.js 'fs' module. */
    },

    /* Module 2: The main logic orchestrator. */
    function( t, r, e ) {
        "use strict"; /* Strict mode enabled. */

        var n = e( 3 ), /* Require module 3, which defines the InputReader class. */
            i = e( 5 ); /* Require module 5, which contains the main algorithm logic. */

        /*
         * Export a function that takes the raw input string.
         * This function will set up the input reader and invoke the main algorithm.
         */
        t.exports = function( t ) {
            var r = new n( t ); /* Create a new InputReader instance, parsing the input string. */
            i( r ); /* Pass the InputReader instance to the main algorithm for processing. */
        };
    },

    /* Module 3: Defines the InputReader class. */
    function( t, r, e ) {
        "use strict"; /* Strict mode. */

        var n = e( 4 ); /* Require module 4, which defines the Queue class. */

        /*
         * The InputReader class facilitates reading tokens from a string input.
         * It uses a Queue internally to manage parsed tokens.
         */
        t.exports = class {

            /*
             * Constructor for InputReader.
             * @param {string} t The raw input string.
             */
            constructor( t ) {

                /*
                 * Trim whitespace from the input string, then split it by
                 * one or more whitespace characters to get an array of tokens.
                 */
                var r = t.trim().split( /\s+/g );

                /* Initialize an internal Queue with these tokens. */
                this.inp = new n( r );
            }

            /*
             * Reads and returns the next raw string token from the input.
             * @returns {string} The next token.
             */
            inr() {
                return this.inp.deq();
            }

            /*
             * Reads the next token, parses it as an integer (base 10), and returns it.
             * @returns {number} The next token as an integer.
             */
            in() {
                return parseInt( this.inp.deq(), 10 );
            }

            /*
             * Clears all remaining tokens from the input queue.
             */
            fin() {
                this.inp.clear();
            }

        };
    },

    /* Module 4: Defines a simple Queue class. */
    function( t, r, e ) {
        "use strict"; /* Strict mode. */

        /*
         * A basic Queue implementation using an array.
         * It supports enqueue (add to end) and dequeue (remove from front) operations.
         */
        t.exports = class {

            /*
             * Constructor for the Queue.
             * @param {Array} [t=[]] An optional initial array of items.
             */
            constructor() {

                var t = arguments.length > 0 && void 0 !== arguments[ 0 ] ? arguments[ 0 ] : [];

                this.size = t.length; /* The current number of items in the queue. */
                this.items = t; /* The internal array holding the queue items. */
                this.ind = 0; /* The index of the next item to be dequeued. */

            }

            /*
             * Adds an item to the back of the queue.
             * @param {any} t The item to enqueue.
             */
            enq( t ) {
                this.size += 1;
                this.items.push( t );
            }

            /*
             * Removes and returns the item from the front of the queue.
             * @returns {any} The dequeued item.
             */
            deq() {
                var t = this.items[ this.ind ];
                this.size -= 1;
                this.ind += 1;
                return t;
            }

            /*
             * Resets the queue, clearing all its items.
             */
            clear() {
                this.items = [];
                this.size = 0;
                this.ind = 0;
            }

        };
    },

    /* Module 5: Contains the main algorithm logic for pathfinding. */
    function( t, r, e ) {
        "use strict"; /* Strict mode. */

        var n = e( 6 ); /* Require module 6, which implements the Floyd-Warshall algorithm. */

        /*
         * This function processes the graph data, applies Floyd-Warshall twice,
         * and then answers queries about path costs.
         * @param {InputReader} t An instance of the InputReader to get graph parameters and queries.
         */
        t.exports = function( t ) {

            // Read initial graph parameters: number of nodes (r), number of edges (e),
            // and the maximum cost for a direct 'road' (i).
            var r = t.in(),
                e = t.in(),
                i = t.in(),
                o = new Array( r ); /* Initialize adjacency matrix for original travel costs. */


            /*
             * Initialize the adjacency matrix 'o'.
             * All distances are set to a very large number (representing infinity) initially.
             */
            for ( var s = 0; s < r; s++ ) {
                o[ s ] = new Array( r ).fill( 9999999999 );
            }

            /*
             * Read 'e' number of edges from input.
             * Each edge connects two nodes (c, f) with a specific cost (a).
             * The graph is undirected, so update both o[c-1][f-1] and o[f-1][c-1].
             */
            for ( var u = 0; u < e; u++ ) {
                var c = t.in(),
                    f = t.in(),
                    a = t.in();
                o[ c - 1 ][ f - 1 ] = a;
                o[ f - 1 ][ c - 1 ] = a;
            }

            /*
             * Apply the Floyd-Warshall algorithm to the initial cost matrix 'o'.
             * This calculates the shortest path between all pairs of nodes based on original costs.
             * The result is stored in 'l'.
             */
            var l = n( o );

            /*
             * Now, re-evaluate the adjacency matrix 'o' based on the 'road' condition.
             * If the shortest original path between two nodes (from 'l') is less than or equal to 'i',
             * then a direct 'road' exists between them with a cost of 1.
             */
            for ( var p = 0; p < r; p++ ) {
                for ( var v = 0; v < r; v++ ) {
                    if ( l[ p ][ v ] <= i ) {
                        o[ p ][ v ] = 1;
                        o[ v ][ p ] = 1;
                    }
                }
            }

            /*
             * Apply Floyd-Warshall again, this time on the 'road' cost matrix 'o'.
             * This calculates the shortest path between all pairs of nodes using only 'roads' (cost 1).
             * The result is stored in 'd'.
             */
            var d = n( o );

            /*
             * Read the number of queries (h).
             * For each query, find the shortest 'road' path between two specified nodes.
             */
            var h = t.in();
            for ( var y = 0; y < h; y++ ) {
                var b = t.in(),
                    g = t.in(),
                    m = d[ b - 1 ][ g - 1 ]; /* Get the shortest 'road' path from matrix 'd'. */

                /*
                 * Output the result for the current query.
                 * If 'm' is still the large "infinity" value, it means no path exists; output -1.
                 * Otherwise, output 'm - 1' as per the problem's specific output requirement.
                 */
                if ( 9999999999 == m ) {
                    console.log( -1 );
                } else {
                    console.log( m - 1 );
                }
            }
        };
    },

    /* Module 6: Implements the Floyd-Warshall All-Pairs Shortest Path algorithm. */
    function( t, r, e ) {
        "use strict"; /* Strict mode. */

        /*
         * Implements the Floyd-Warshall algorithm to find the shortest paths
         * between all pairs of vertices in a given weighted graph.
         *
         * @param {Array<Array<number>>} t The adjacency matrix of the graph.
         * @returns {Array<Array<number>>} A new matrix with all-pairs shortest paths.
         */
        t.exports = function( t ) {

            var r = t.length, /* Number of vertices in the graph. */
                e = []; /* The matrix to store the shortest path distances. */

            /*
             * Initialize the 'e' matrix as a deep copy of the input matrix 't'.
             * This ensures that the original input matrix is not modified.
             */
            for ( var n = 0; n < r; n++ ) {
                e.push( t[ n ].concat() );
            }

            /*
             * The core Floyd-Warshall triple loop.
             * 'i' represents the intermediate vertex.
             * 'o' represents the starting vertex.
             * 's' represents the ending vertex.
             */
            for ( var i = 0; i < r; i++ ) { /* Iterate through all possible intermediate vertices. */
                for ( var o = 0; o < r; o++ ) { /* Iterate through all possible starting vertices. */
                    for ( var s = 0; s < r; s++ ) { /* Iterate through all possible ending vertices. */

                        /*
                         * If the path from 'o' to 's' through 'i' is shorter than the
                         * currently known shortest path from 'o' to 's', update it.
                         * e[o][s] > e[o][i] + e[i][s]
                         */
                        if ( e[ o ][ s ] > e[ o ][ i ] + e[ i ][ s ] ) {
                            e[ o ][ s ] = e[ o ][ i ] + e[ i ][ s ];
                        }

                    }
                }
            }
            return e; /* Return the matrix containing all-pairs shortest path distances. */

        };
    }
] );