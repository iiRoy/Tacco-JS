/*
 * This is a self-executing function (IIFE) that encapsulates
 * a module loading system, commonly seen in bundled JavaScript applications
 * like those produced by webpack.
 *
 * The 't' parameter represents the collection of all defined modules.
 */
!function( t ) {

    // 'e' serves as a cache for already loaded modules.
    // Each entry in 'e' will store the exports of a module once it's processed.
    var e = {};

    /*
     * The core module loading and caching function.
     * This function is analogous to the 'require' function in CommonJS.
     *
     * @param {number} r - The ID of the module to load.
     * @returns {object} The exports object of the requested module.
     */
    function n( r ) {

        // If the module with ID 'r' is already present in the cache 'e',
        // we simply return its pre-computed exports to avoid reprocessing.
        if ( e[ r ] ) {
            return e[ r ].exports;
        }

        // If the module is not in the cache, we initialize a new module entry.
        // 'o' will hold the module's state:
        //   - i: The module's ID.
        //   - l: A boolean flag indicating if the module has been loaded.
        //   - exports: An empty object where the module's exports will be accumulated.
        var o = e[ r ] = {
            i: r,
            l: !1,
            exports: {}
        };

        // Execute the module's function definition.
        // The module definition is retrieved from the 't' object using its ID 'r'.
        // It's called with the module's exports object, the module object itself,
        // and the 'n' (require) function for internal dependencies.
        t[ r ].call( o.exports, o, o.exports, n );

        // After execution, mark the module as loaded.
        o.l = !0;

        // Finally, return the module's exports object.
        return o.exports;
    }


    // Attach the modules definitions object 't' to 'n.m'.
    // 'n.m' typically holds all the module definitions (functions).
    n.m = t;

    // Attach the module cache 'e' to 'n.c'.
    // 'n.c' typically holds the cache of loaded modules.
    n.c = e;

    /*
     * Define a getter function on an object property.
     * This is used for defining properties on exports that are
     * only computed when accessed.
     *
     * @param {object} t - The target object.
     * @param {string} e - The name of the property.
     * @param {Function} r - The getter function for the property.
     */
    n.d = function( t, e, r ) {
        // If the property 'e' does not already exist on 't',
        // define it as an enumerable getter property.
        n.o( t, e ) || Object.defineProperty( t, e, {
            enumerable: !0,
            get: r
        } );
    };

    /*
     * Mark an exports object as an ES module.
     * This adds the '__esModule' property and potentially 'Symbol.toStringTag'.
     *
     * @param {object} t - The exports object to mark.
     */
    n.r = function( t ) {
        // If 'Symbol' and 'Symbol.toStringTag' are available,
        // define 'Symbol.toStringTag' on the exports object for better debugging.
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty( t, Symbol.toStringTag, {
            value: "Module"
        } );

        // Define the '__esModule' property to true, indicating it's an ES module.
        Object.defineProperty( t, "__esModule", {
            value: !0
        } );
    };

    /*
     * Create a "namespace object" for module exports,
     * handling various module export types (ESM, CommonJS, etc.) for compatibility.
     *
     * @param {any} t - The module's exports.
     * @param {number} e - Flags indicating the type of module.
     * @returns {object} A namespace object representing the module's exports.
     */
    n.t = function( t, e ) {
        // Flag 1: If it's already a default export or has been processed.
        if ( 1 & e && ( t = n( t ) ), 8 & e ) {
            return t;
        }

        // Flag 4: If it's an object and already marked as an ES module.
        if ( 4 & e && "object" == typeof t && t && t.__esModule ) {
            return t;
        }

        // Create a new plain object to serve as the namespace.
        var r = Object.create( null );

        // Mark the new namespace object as an ES module.
        n.r( r );

        // Define a 'default' property on the namespace object,
        // pointing to the module's actual exports.
        Object.defineProperty( r, "default", {
            enumerable: !0,
            value: t
        } );

        // Flag 2: If it's a non-string module, copy all its properties
        // to the namespace object using getters.
        if ( 2 & e && "string" != typeof t ) {
            for ( var o in t ) {
                n.d( r, o, function( e ) {
                    return t[ e ];
                }.bind( null, o ) );
            }
        }

        // Return the constructed namespace object.
        return r;
    };

    /*
     * Helper function to create a getter for non-ES modules,
     * primarily for interop compatibility.
     *
     * @param {any} t - The module's exports.
     * @returns {Function} A function that returns the module's exports.
     */
    n.n = function( t ) {
        // Create a getter function: if 't' is an ES module, return its default export;
        // otherwise, return 't' directly.
        var e = t && t.__esModule ?
            function() {
                return t.default;
            } :
            function() {
                return t;
            };

        // Define an 'a' property on the getter function itself,
        // making the getter accessible via 'e.a'.
        return n.d( e, "a", e ), e;
    };

    /*
     * Utility function to check if an object has a specific property.
     * This is a safe way to check for own properties.
     *
     * @param {object} t - The object to check.
     * @param {string} e - The property name.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    n.o = function( t, e ) {
        return Object.prototype.hasOwnProperty.call( t, e );
    };

    // Set the public path for assets (empty string in this case).
    n.p = "";

    // Load the entry module (module with ID 13).
    // This is where the application's main logic begins execution.
    n( n.s = 13 );

} ( { // The object containing all module definitions.

    /*
     * Module 0: Contains utility functions, primarily for asynchronous operations
     * and input parsing from standard input.
     */
    0: function( t, e, n ) {
        "use strict"; // Enable strict mode for this module.

        // Polyfill for __awaiter.
        // This function is generated by TypeScript/Babel to transform async/await
        // syntax into a generator-based state machine, allowing asynchronous code
        // to run in environments without native async/await support.
        var r = this && this.__awaiter || function( t, e, n, r ) {
            return new( n || ( n = Promise ) )( function( o, u ) {
                // Helper function to advance the generator with a resolved value.
                function i( t ) {
                    try {
                        c( r.next( t ) );
                    } catch ( t ) {
                        u( t );
                    }
                }

                // Helper function to advance the generator with an error.
                function a( t ) {
                    try {
                        c( r.throw( t ) );
                    } catch ( t ) {
                        u( t );
                    }
                }

                // Core function to handle generator steps.
                function c( t ) {
                    t.done ? o( t.value ) : new n( function( e ) {
                        e( t.value );
                    } ).then( i, a );
                }
                c( ( r = r.apply( t, e || [] ) ).next() );
            } );
        };

        // Polyfill for __generator.
        // This is another TypeScript/Babel helper for compiling generator functions
        // (including those used by async/await) into a state machine.
        var o = this && this.__generator || function( t, e ) {
            var n, r, o, u, i = {
                label: 0,
                sent: function() {
                    if ( 1 & o[ 0 ] ) {
                        throw o[ 1 ];
                    }
                    return o[ 1 ];
                },
                trys: [],
                ops: []
            };

            // Generator control methods: next, throw, return.
            u = {
                next: a( 0 ),
                throw: a( 1 ),
                return: a( 2 )
            };

            // If Symbol.iterator is available, make the generator iterable.
            "function" == typeof Symbol && ( u[ Symbol.iterator ] = function() {
                return this;
            } );

            return u;

            // Internal helper to create the state machine steps.
            function a( u ) {
                return function( a ) {
                    return function( u ) {
                        // Prevent re-entry if the generator is already running.
                        if ( n ) {
                            throw new TypeError( "Generator is already executing." );
                        }

                        // Main loop for the generator's state machine.
                        for ( ; i; ) {
                            try {
                                // Check for next step, return, or throw.
                                if ( n = 1, r && ( o = 2 & u[ 0 ] ? r.return : u[ 0 ] ? r.throw || ( ( o = r.return ) && o.call( r ), 0 ) : r.next ) && !( o = o.call( r, u[ 1 ] ) ).done ) {
                                    return o;
                                }

                                // State machine switch based on operation code.
                                switch ( r = 0, o && ( u = [ 2 & u[ 0 ], o.value ] ), u[ 0 ] ) {
                                    case 0:
                                    case 1:
                                        o = u;
                                        break;
                                    case 4:
                                        return i.label++, {
                                            value: u[ 1 ],
                                            done: !1
                                        };
                                    case 5:
                                        i.label++, r = u[ 1 ], u = [ 0 ];
                                        continue;
                                    case 7:
                                        u = i.ops.pop(), i.trys.pop();
                                        continue;
                                    default:
                                        // Handle try/catch/finally blocks within the generator.
                                        if ( !( o = ( o = i.trys ).length > 0 && o[ o.length - 1 ] ) && ( 6 === u[ 0 ] || 2 === u[ 0 ] ) ) {
                                            i = 0;
                                            continue;
                                        }
                                        if ( 3 === u[ 0 ] && ( !o || u[ 1 ] > o[ 0 ] && u[ 1 ] < o[ 3 ] ) ) {
                                            i.label = u[ 1 ];
                                            break;
                                        }
                                        if ( 6 === u[ 0 ] && i.label < o[ 1 ] ) {
                                            i.label = o[ 1 ], o = u;
                                            break;
                                        }
                                        if ( o && i.label < o[ 2 ] ) {
                                            i.label = o[ 2 ], i.ops.push( u );
                                            break;
                                        }
                                        o[ 2 ] && i.ops.pop(), i.trys.pop();
                                        continue;
                                }
                                u = e.call( t, i );
                            } catch ( t ) {
                                u = [ 6, t ], r = 0;
                            } finally {
                                n = o = 0;
                            }
                            // If an error occurred or generator is done.
                            if ( 5 & u[ 0 ] ) {
                                throw u[ 1 ];
                            }
                            return {
                                value: u[ 0 ] ? u[ 1 ] : void 0,
                                done: !0
                            };
                        }
                    }( [ u, a ] );
                };
            }
        };

        // Polyfill for __importDefault.
        // This helps with interoperability between CommonJS and ES Modules.
        // If a module has '__esModule' set, it means it's an ES module,
        // and its default export is accessed via '.default'.
        var u = this && this.__importDefault || function( t ) {
            return t && t.__esModule ? t : {
                default: t
            };
        };

        // Capture the 'this' context, often 'undefined' in strict mode,
        // or the global object in non-strict mode.
        var i = this;

        // Mark this module's exports as an ES module.
        e.__esModule = !0;

        // Import module 1 (which exports 'fs') using the internal module loader 'n'.
        // The 'u' (importDefault) wrapper ensures correct handling of its exports.
        var a = u( n( 1 ) );

        /*
         * A generator function 'c' (getFoolIterator).
         * It takes a string, splits it by whitespace, and yields each non-empty token.
         *
         * @param {string} t - The input string.
         * @returns {Generator} A generator that yields string tokens.
         */
        function c( t ) {
            var e, n; // Declare local variables 'e' (tokens array) and 'n' (index).
            return o( this, function( r ) {
                switch ( r.label ) {
                    case 0:
                        // Split the input string by one or more whitespace characters,
                        // then filter out any empty strings that might result.
                        e = t.split( /\s+/ ).filter( function( t ) {
                            return t.length > 0;
                        } );
                        n = 0; // Initialize index for iterating through tokens.
                        r.label = 1; // Set the next state label.

                    case 1:
                        // Check if there are more tokens to process.
                        return n < e.length ? [ 4, e[ n ] ] : [ 3, 4 ]; // If yes, yield the next token; otherwise, jump to end.

                    case 2:
                        r.sent(), r.label = 3; // Consume the yielded value (not used here), set next state.

                    case 3:
                        return n++, [ 3, 1 ]; // Increment index, loop back to check for more tokens.

                    case 4:
                        return [ 2 ]; // Generator is done, return.
                }
            } );
        }

        /*
         * Exported function to asynchronously read input from '/dev/stdin'.
         *
         * @returns {Promise<string>} A promise that resolves with the input string
         *                            or rejects with an error.
         */
        e.readInput = function() {
            return new Promise( function( t, e ) {
                // Use the 'fs' module's 'readFile' method to read from stdin.
                a.default.readFile( "/dev/stdin", "utf8", function( n, r ) {
                    // If an error 'n' occurred, reject the promise.
                    // Otherwise, resolve with the data 'r'.
                    n ? e( n ) : t( r );
                } );
            } );
        };

        // Export the 'c' (getFoolIterator) generator function.
        e.getFoolIterator = c;

        /*
         * Exported async function to get a function that returns the next integer
         * from the standard input, using the 'getFoolIterator' for tokenization.
         *
         * @returns {Promise<Function>} A promise resolving to a function that,
         *                              when called, returns the next parsed integer.
         */
        e.getFoolNextInt = function() {
            // Use the __awaiter polyfill to handle the async logic.
            return r( i, void 0, void 0, function() {
                var t, n; // Declare local variables 't' (input string) and 'n' (iterator).
                return o( this, function( r ) {
                    switch ( r.label ) {
                        case 0:
                            // Await the result of reading input from stdin.
                            return [ 4, e.readInput() ];

                        case 1:
                            t = r.sent(); // Store the input string.
                            n = c( t ); // Create a token iterator from the input.
                            // Return a function that, when called, parses the next token as an integer.
                            return [ 2, function() {
                                return parseInt( n.next().value );
                            } ];
                    }
                } );
            } );
        };

        /*
         * Exported async function to get a function that returns the next string token
         * from standard input, using a custom, more "chotto mashina" (slightly better)
         * tokenization logic.
         *
         * @returns {Promise<Function>} A promise resolving to a function that,
         *                              when called, returns the next string token.
         */
        e.getChottoMashinaNext = function() {
            return r( i, void 0, void 0, function() {
                var t, n; // Declare local variables 't' (input string) and 'n' (custom iterator).
                return o( this, function( r ) {
                    switch ( r.label ) {
                        case 0:
                            // Await the input string.
                            return [ 4, e.readInput() ];

                        case 1:
                            t = r.sent(); // Store the input string.
                            // Define and immediately execute a generator function for custom tokenization.
                            n = function() {
                                var e, n, r; // Local variables for the inner generator: e (start index), n (current char index), r (token).
                                return o( this, function( o ) {
                                    switch ( o.label ) {
                                        case 0:
                                            e = -1, n = 0, o.label = 1; // Initialize start index, current index, and state label.

                                        case 1:
                                            // Loop through the input string character by character.
                                            return n <= t.length ? // While within bounds of the string.
                                                " " !== t[ n ] && "\n" !== t[ n ] && n !== t.length ? // If current char is not space/newline and not end of string.
                                                [ 3, 5 ] : // Continue building token.
                                                -1 !== e ? // If a token was being built.
                                                [ 3, 2 ] : // Yield the token.
                                                [ 3, 6 ] : // Skip whitespace.
                                                [ 3, 7 ]; // End of string, generator done.

                                        case 2:
                                            r = t.substring( e, n ), e = -1; // Extract token, reset start index.
                                            return [ 4, r ]; // Yield the extracted token.

                                        case 3:
                                            o.sent(), o.label = 4; // Consume yielded value, set next state.

                                        case 4:
                                            return [ 3, 6 ]; // Continue loop.

                                        case 5:
                                            -1 === e && ( e = n ), o.label = 6; // If new token, set start index.

                                        case 6:
                                            return n++, [ 3, 1 ]; // Increment char index, loop.

                                        case 7:
                                            return [ 2 ]; // Generator done.
                                    }
                                } );
                            }(), [ 2, function() {
                                return n.next().value;
                            } ]; // Return a function that, when called, gets the next token from the generator.
                    }
                } );
            } );
        };

        /*
         * Exported async function to get a function that returns the next integer
         * from standard input, using the 'getChottoMashinaNext' for tokenization.
         *
         * @returns {Promise<Function>} A promise resolving to a function that,
         *                              when called, returns the next parsed integer.
         */
        e.getChottoMashinaNextInt = function() {
            return r( i, void 0, void 0, function() {
                var t; // Declare local variable 't' (the tokenizing function).
                return o( this, function( n ) {
                    switch ( n.label ) {
                        case 0:
                            // Await the function that gets the next token.
                            return [ 4, e.getChottoMashinaNext() ];

                        case 1:
                            t = n.sent(); // Store the tokenizing function.
                            // Return a function that, when called, gets a token and parses it as an integer.
                            return [ 2, function() {
                                return parseInt( t() );
                            } ];
                    }
                } );
            } );
        };

    }, // End of Module 0 definition.


    /*
     * Module 1: A simple module that exports the Node.js 'fs' (file system) module.
     */
    1: function( t, e ) {
        // Assign the result of `require("fs")` to `t.exports`.
        // This makes the 'fs' module available to other modules that import module 1.
        t.exports = require( "fs" );
    }, // End of Module 1 definition.


    /*
     * Module 13: The main entry point of the application.
     * This module contains the primary logic to solve the problem.
     */
    13: function( t, e, n ) {
        "use strict"; // Enable strict mode for this module.

        // Polyfill for __awaiter (re-declaration, common in bundled code).
        // This ensures async/await functionality is available within this module.
        var r = this && this.__awaiter || function( t, e, n, r ) {
            return new( n || ( n = Promise ) )( function( o, u ) {
                function i( t ) {
                    try {
                        c( r.next( t ) );
                    } catch ( t ) {
                        u( t );
                    }
                }

                function a( t ) {
                    try {
                        c( r.throw( t ) );
                    } catch ( t ) {
                        u( t );
                    }
                }

                function c( t ) {
                    t.done ? o( t.value ) : new n( function( e ) {
                        e( t.value );
                    } ).then( i, a );
                }
                c( ( r = r.apply( t, e || [] ) ).next() );
            } );
        };

        // Polyfill for __generator (re-declaration).
        // Provides generator state machine implementation for async functions.
        var o = this && this.__generator || function( t, e ) {
            var n, r, o, u, i = {
                label: 0,
                sent: function() {
                    if ( 1 & o[ 0 ] ) {
                        throw o[ 1 ];
                    }
                    return o[ 1 ];
                },
                trys: [],
                ops: []
            };
            u = {
                next: a( 0 ),
                throw: a( 1 ),
                return: a( 2 )
            };
            "function" == typeof Symbol && ( u[ Symbol.iterator ] = function() {
                return this;
            } );
            return u;

            function a( u ) {
                return function( a ) {
                    return function( u ) {
                        if ( n ) {
                            throw new TypeError( "Generator is already executing." );
                        }
                        for ( ; i; ) {
                            try {
                                if ( n = 1, r && ( o = 2 & u[ 0 ] ? r.return : u[ 0 ] ? r.throw || ( ( o = r.return ) && o.call( r ), 0 ) : r.next ) && !( o = o.call( r, u[ 1 ] ) ).done ) {
                                    return o;
                                }
                                switch ( r = 0, o && ( u = [ 2 & u[ 0 ], o.value ] ), u[ 0 ] ) {
                                    case 0:
                                    case 1:
                                        o = u;
                                        break;
                                    case 4:
                                        return i.label++, {
                                            value: u[ 1 ],
                                            done: !1
                                        };
                                    case 5:
                                        i.label++, r = u[ 1 ], u = [ 0 ];
                                        continue;
                                    case 7:
                                        u = i.ops.pop(), i.trys.pop();
                                        continue;
                                    default:
                                        if ( !( o = ( o = i.trys ).length > 0 && o[ o.length - 1 ] ) && ( 6 === u[ 0 ] || 2 === u[ 0 ] ) ) {
                                            i = 0;
                                            continue;
                                        }
                                        if ( 3 === u[ 0 ] && ( !o || u[ 1 ] > o[ 0 ] && u[ 1 ] < o[ 3 ] ) ) {
                                            i.label = u[ 1 ];
                                            break;
                                        }
                                        if ( 6 === u[ 0 ] && i.label < o[ 1 ] ) {
                                            i.label = o[ 1 ], o = u;
                                            break;
                                        }
                                        if ( o && i.label < o[ 2 ] ) {
                                            i.label = o[ 2 ], i.ops.push( u );
                                            break;
                                        }
                                        o[ 2 ] && i.ops.pop(), i.trys.pop();
                                        continue;
                                }
                                u = e.call( t, i );
                            } catch ( t ) {
                                u = [ 6, t ], r = 0;
                            } finally {
                                n = o = 0;
                            }
                            if ( 5 & u[ 0 ] ) {
                                throw u[ 1 ];
                            }
                            return {
                                value: u[ 0 ] ? u[ 1 ] : void 0,
                                done: !0
                            };
                        }
                    }( [ u, a ] );
                };
            }
        };

        // Capture the 'this' context for use in async functions.
        var u = this;

        // Mark this module's exports as an ES module.
        e.__esModule = !0;

        // Import utility functions from Module 0.
        // Module 0 provides `getChottoMashinaNext` which is used here.
        var i = n( 0 );

        /*
         * Main execution block of Module 13.
         * This is an async IIFE that performs the core logic of the program.
         * It reads input, counts token frequencies, and performs a calculation.
         */
        r( u, void 0, void 0, function() {
            // Declare variables used within this async function's scope.
            var t, e, n, r, u, a, c;

            return o( this, function( o ) {
                switch ( o.label ) {
                    case 0:
                        // Await the function that returns the next string token.
                        return [ 4, i.getChottoMashinaNext() ];

                    case 1:
                        // Get the tokenizing function 't', then immediately call it to initialize.
                        // 'e' will then be the input string split into tokens.
                        ( t = o.sent() )(), e = t(), n = {}, r = 0;

                        // Loop through the array of tokens 'e'.
                        for ( ; r < e.length; r++ ) {
                            // Get the current count for the token 'e[r]' from object 'n',
                            // or initialize to 0 if not present.
                            u = n[ e[ r ] ] || 0;
                            // Increment the count for the current token.
                            n[ e[ r ] ] = u + 1;
                        }

                        // Define a helper function 'a' for modular arithmetic.
                        // It ensures results stay within the range [0, 1000000006] for modulo 1000000007.
                        a = function( t ) {
                            return ( t + 1000000007 ) % 1000000007;
                        };

                        // Initialize 'c' (our result accumulator) to 1.
                        c = 1;

                        // Iterate over the unique tokens (keys of 'n').
                        Object.keys( n ).forEach( function( t ) {
                            // Multiply 'c' by (1 + count of current token),
                            // then apply modular arithmetic.
                            c = a( c * ( 1 + n[ t ] ) );
                        } );

                        // Calculate the final result: (c - 1) modulo 1000000007.
                        // Then print it to the console.
                        console.log( a( c - 1 ) );

                        return [ 2 ]; // Indicate that the async function is done.
                }
            } );
        } );

    } // End of Module 13 definition.

} ); // End of the modules object and the IIFE call.