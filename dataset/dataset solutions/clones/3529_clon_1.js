/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain exactly the same.
 *
 * The only modifications are extensive changes to whitespace (indentation,
 * spacing, blank lines) and the addition of comments throughout the file.
 * This makes the code visually distinct but logically and structurally identical.
 */

// The main module wrapper function, immediately invoked.
module.exports = function ( e ) {

    // A cache for loaded modules.
    var t = {};

    /**
     * The module loading function (webpack's 'require').
     * @param {string} r - The module ID.
     * @returns {*} The exports of the requested module.
     */
    function n ( r ) {

        // If module is already in cache, return its exports.
        if ( t[ r ] ) {
            return t[ r ].exports;
        }

        // Create a new module object and put it into the cache.
        var i = t[ r ] = {
            i: r,
            l: !1,
            exports: {}
        };

        // Execute the module function.
        // `e[r]` is the module's factory function.
        // `i.exports` is the `this` context and `exports` object.
        // `n` is the local `require` function for this module.
        e[ r ].call( i.exports, i, i.exports, n );

        // Mark the module as loaded.
        i.l = !0;

        // Return the exports of the module.
        return i.exports;

    } // End of `n` (module loader) function.


    // Store all module factory functions in `n.m`.
    n.m = e;

    // Store the module cache in `n.c`.
    n.c = t;


    /**
     * Define getter functions for harmony exports.
     * @param {object} e - The exports object.
     * @param {string} t - The property name to define.
     * @param {function} r - The getter function.
     */
    n.d = function ( e, t, r ) {

        // Only define if the property doesn't already exist.
        if ( !n.o( e, t ) ) {

            Object.defineProperty( e, t, {
                enumerable: !0,
                get: r
            } );

        }

    }; // End of `n.d` function.


    /**
     * Adds `__esModule` and `Symbol.toStringTag` properties to the exports object.
     * Marks the module as an ES module.
     * @param {object} e - The exports object.
     */
    n.r = function ( e ) {

        // Set `Symbol.toStringTag` for better `Object.prototype.toString` representation.
        if ( typeof Symbol !== "undefined" && Symbol.toStringTag ) {

            Object.defineProperty( e, Symbol.toStringTag, {
                value: "Module"
            } );

        }

        // Mark as an ES module.
        Object.defineProperty( e, "__esModule", {
            value: !0
        } );

    }; // End of `n.r` function.


    /**
     * Compatibility function for non-ES modules.
     * @param {*} e - The module.
     * @param {number} t - Bitmask flags.
     * @returns {*} The module exports.
     */
    n.t = function ( e, t ) {

        // 1 = production get default export
        if ( 1 & t ) {
            e = n( e );
        }

        // 8 = return all properties from the module.
        if ( 8 & t ) {
            return e;
        }

        // 4 = return e when it's an ES module.
        if ( 4 & t && typeof e === "object" && e && e.__esModule ) {
            return e;
        }

        // Create a fake namespace object.
        var r = Object.create( null );

        // Mark as ES module.
        n.r( r );

        // Define 'default' property.
        Object.defineProperty( r, "default", {
            enumerable: !0,
            value: e
        } );

        // 2 = merge all properties of a non-ES module into the namespace object.
        if ( 2 & t && typeof e !== "string" ) {

            for ( var i in e ) {

                n.d( r, i, ( function ( t ) {
                    return e[ t ];
                } ).bind( null, i ) );

            }

        }

        return r;

    }; // End of `n.t` function.


    /**
     * Creates a getter function for non-ES modules (e.g., CommonJS).
     * @param {object} e - The module exports.
     * @returns {function} A getter function for the default export or the module itself.
     */
    n.n = function ( e ) {

        var t = e && e.__esModule ?
            function () {
                return e.default;
            } :
            function () {
                return e;
            };

        // Add a 'a' property to the getter function, pointing to itself.
        n.d( t, "a", t );

        return t;

    }; // End of `n.n` function.


    /**
     * Checks if an object has a property.
     * Equivalent to `Object.prototype.hasOwnProperty.call(obj, prop)`.
     * @param {object} e - The object to check.
     * @param {string} t - The property name.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    n.o = function ( e, t ) {
        return Object.prototype.hasOwnProperty.call( e, t );
    }; // End of `n.o` function.


    // Public path for assets (empty in this case).
    n.p = "";

    // Load the entry module (module 0).
    return n( n.s = 0 );

} // End of main module wrapper function.
( [
    /* Module 0 */
    function ( e, t, n ) {

        // Enable strict mode for this module.
        "use strict";

        // Require the 'fs' module (aliased as module 1).
        var r = n( 1 );

        // Call module 2 with the content read from '/dev/stdin'.
        // The content is read synchronously and decoded as UTF-8.
        n( 2 )( r.readFileSync( "/dev/stdin", "utf8" ) );

    },
    /* Module 1 */
    function ( e, t ) {

        // Export the 'fs' (file system) module directly.
        e.exports = require( "fs" );

    },
    /* Module 2 */
    function ( e, t, n ) {

        // Enable strict mode for this module.
        "use strict";

        // Require module 3 (the InputReader class).
        var r = n( 3 );

        // Require module 5 (the main problem logic).
        var i = n( 5 );

        // Export a function that takes input string 'e'.
        e.exports = function ( e ) {

            // Create a new instance of the InputReader with the input string.
            var t = new r( e );

            // Pass the InputReader instance to the main problem logic function.
            i( t );

        };

    },
    /* Module 3 */
    function ( e, t, n ) {

        // Enable strict mode for this module.
        "use strict";

        // Require module 4 (the internal Queue class).
        var r = n( 4 );

        // Export an anonymous class named `InputReader`.
        e.exports = class {

            // Constructor for the InputReader class.
            constructor ( e ) {

                // Trim whitespace from the input string and split it by one or more spaces.
                // Create a new Queue instance from the resulting array of strings.
                var t = e.trim().split( /\s+/g );
                this.inp = new r( t );

            } // End of constructor.

            /**
             * Dequeues and returns the next string from the input queue.
             * @returns {string} The next input string.
             */
            inr () {
                return this.inp.deq();
            }

            /**
             * Dequeues the next string from the input queue and parses it as an integer.
             * @returns {number} The next input integer.
             */
            in () {
                return parseInt( this.inp.deq(), 10 );
            }

            /**
             * Clears the internal input queue.
             */
            fin () {
                this.inp.clear();
            }

        }; // End of InputReader class definition.

    },
    /* Module 4 */
    function ( e, t, n ) {

        // Enable strict mode for this module.
        "use strict";

        // Export an anonymous class named `Queue`.
        e.exports = class {

            // Constructor for the Queue class.
            constructor () {

                // Default initial items to an empty array if not provided.
                var e = arguments.length > 0 && void 0 !== arguments[ 0 ] ? arguments[ 0 ] : [];

                // Initialize size, items array, and internal index.
                this.size = e.length;
                this.items = e;
                this.ind = 0;

            } // End of constructor.

            /**
             * Enqueues an item to the end of the queue.
             * @param {*} e - The item to enqueue.
             */
            enq ( e ) {
                this.size += 1;
                this.items.push( e );
            }

            /**
             * Dequeues an item from the front of the queue.
             * @returns {*} The dequeued item.
             */
            deq () {

                // Get the item at the current index.
                var e = this.items[ this.ind ];

                // Decrement size and advance index.
                this.size -= 1;
                this.ind += 1;

                // Return the item.
                return e;

            }

            /**
             * Clears the queue, resetting its state.
             */
            clear () {
                this.items = [];
                this.size = 0;
                this.ind = 0;
            }

        }; // End of Queue class definition.

    },
    /* Module 5 */
    function ( e, t, n ) {

        // Enable strict mode for this module.
        "use strict";

        // Export the main logic function. It takes an `InputReader` instance `e`.
        e.exports = function ( e ) {

            // Read the first array of strings.
            var t = e.inr();

            // Read the second array of strings.
            var n = e.inr();

            // Get the length of the arrays (assuming both are of equal length).
            var r = t.length;

            // Create two Maps to store mappings:
            // `i`: from t[s] to n[s]
            // `o`: from n[s] to t[s]
            var i = new Map();
            var o = new Map();

            // Iterate through the input arrays to establish initial mappings.
            for ( var s = 0; s < r; s++ ) {

                // If t[s] is already in map `i`.
                if ( i[ t[ s ] ] ) {

                    // If the existing mapping for t[s] is different from n[s],
                    // then it's inconsistent, so output "No" and terminate.
                    if ( i[ t[ s ] ] != n[ s ] ) {
                        return void console.log( "No" );
                    }

                } else {

                    // Otherwise, establish the mapping: t[s] -> n[s] in `i`.
                    i[ t[ s ] ] = n[ s ];

                    // And the reverse mapping: n[s] -> t[s] in `o`.
                    o[ n[ s ] ] = t[ s ];

                }

            } // End of first loop.


            // After establishing all direct and reverse mappings,
            // iterate through the keys in map `i` to check for consistency.
            for ( var u in i ) {

                // Case 1: `u` maps to itself (u -> u).
                if ( u == i[ u ] ) {

                    // If `u` maps to itself in `i`, then its reverse mapping in `o`
                    // must also map to itself (u <- u).
                    // If `o[u]` is not `u`, it means `u` is mapped to something else in `o`,
                    // which is an inconsistency.
                    if ( o[ u ] != u ) {
                        return void console.log( "No" );
                    }

                } else {

                    // Case 2: `u` maps to something else (`i[u]`).
                    // For consistency, `i[u]` must map back to `u` in `o`.
                    // That is, `o[i[u]]` must be equal to `u`.
                    // If `i[u]` maps to something else in `o` (i.e., `o[i[u]]` is not `u`),
                    // then it's an inconsistency.
                    // Note: `o[i[u]]` is the value that `i[u]` maps to in the reverse map.
                    // If `o[i[u]]` is equal to `i[u]`, it implies `i[u]` maps to itself in `o`,
                    // which is also an inconsistency in the context of `u -> i[u]` where `u != i[u]`.
                    if ( i[ u ] == o[ i[ u ] ] ) {
                        return void console.log( "No" );
                    }

                }

            } // End of second loop.


            // If all checks pass, the mappings are consistent.
            console.log( "Yes" );

        }; // End of main logic function.

    }
] );