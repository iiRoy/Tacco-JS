/*
 * This JavaScript bundle is a Type I clone of an original source file.
 *
 * According to the Type I definition, this code is exactly equal to its original,
 * with the sole exceptions being variations in whitespace and comments.
 *
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved precisely as they appeared in the original source code.
 *
 * This particular structure suggests a Webpack-like runtime,
 * designed to manage and execute modular JavaScript code.
 *
 * The code defines a module loading system and then immediately
 * executes an entry point module.
 */
module.exports = function ( e ) {


    // 'r' serves as the module cache.
    // It stores already loaded modules to prevent redundant execution.
    var r = {};


    /**
     * The central module loading function, analogous to Webpack's `__webpack_require__`.
     *
     * @param {number} n The unique identifier (ID) of the module to be loaded.
     * @returns {object} The `exports` object of the requested module.
     */
    function t( n ) {

        // Check if the module is already in the cache.
        if ( r[ n ] ) {

            // If found, return its cached exports immediately.
            return r[ n ].exports;

        }

        // If the module is not cached, create a new module entry.
        // 'o' represents the module object itself.
        // It includes:
        //   'i': The module's ID.
        //   'l': A boolean flag indicating if the module has been loaded (initially false).
        //   'exports': An empty object that will be populated by the module's code.
        var o = r[ n ] = {
            i: n,
            l: !1,
            exports: {}
        };


        // Execute the module's factory function.
        // `e[n]` refers to the actual function that defines the module's logic.
        // It's called with the following arguments:
        //   - `o.exports` (as `this` context and `exports` parameter)
        //   - `o` (as `module` parameter)
        //   - `t` (this very `require` function, allowing modules to `require` others)
        e[ n ].call(
            o.exports,
            o,
            o.exports,
            t
        );


        // After execution, mark the module as loaded.
        o.l = !0;


        // Return the populated `exports` object.
        return o.exports;
    }


    // --- Runtime Properties and Utility Functions ---

    // `t.m`: Stores the entire map of module definitions passed into the IIFE.
    t.m = e;


    // `t.c`: Stores a reference to the module cache (`r`).
    t.c = r;


    /**
     * Defines a getter property on an object.
     * This is a utility function used for handling module exports,
     * particularly for compatibility between CommonJS and ES Modules.
     *
     * @param {object} e The target object on which to define the property.
     * @param {string} r The name of the property to define.
     * @param {function} n The getter function that will be invoked when the property is accessed.
     */
    t.d = function ( e, r, n ) {

        // Only define the property if it does not already exist on the object.
        if ( !t.o( e, r ) ) {

            Object.defineProperty( e, r, {
                enumerable: !0, // The property will be enumerable (e.g., visible in `for...in`).
                get: n          // The provided function `n` will act as the property's getter.
            } );

        }
    };


    /**
     * Marks an object as an ES Module.
     * This involves setting the `__esModule` property to `true`
     * and potentially the `Symbol.toStringTag` to "Module" for better debugging.
     *
     * @param {object} e The object to be marked as an ES Module.
     */
    t.r = function ( e ) {

        // If `Symbol.toStringTag` is supported in the current environment,
        // define it on the object to identify it as a "Module".
        if ( "undefined" != typeof Symbol && Symbol.toStringTag ) {
            Object.defineProperty( e, Symbol.toStringTag, {
                value: "Module"
            } );
        }

        // Always set the `__esModule` property to `true` for ES Module interoperability.
        Object.defineProperty( e, "__esModule", {
            value: !0
        } );

    };


    /**
     * Creates a namespace object for various module import types.
     * This function is crucial for handling complex import scenarios,
     * such as `import * as name from 'module'`.
     *
     * @param {any} e The module's exports or module ID.
     * @param {number} r A bitmask of flags indicating the type of import operation.
     * @returns {object} The constructed namespace object.
     */
    t.t = function ( e, r ) {

        // Flag 1: If the first bit is set, it indicates a direct module import,
        // so `e` is treated as a module ID and loaded.
        if ( 1 & r ) {
            e = t( e );
        }

        // Flag 8: If the eighth bit is set, it signifies a legacy export;
        // the module is returned as-is.
        if ( 8 & r ) {
            return e;
        }

        // Flag 4: If the fourth bit is set AND 'e' is an object with `__esModule: true`,
        // it's already a proper ES Module namespace; return it directly.
        if ( 4 & r && "object" == typeof e && e && e.__esModule ) {
            return e;
        }


        // Create a new plain object to serve as the namespace.
        var n = Object.create( null );

        // Mark this new namespace object as an ES Module.
        t.r( n );

        // Define a 'default' property on the namespace, pointing to the original module exports 'e'.
        Object.defineProperty( n, "default", {
            enumerable: !0, // Make 'default' enumerable.
            value: e        // The value of the 'default' export.
        } );


        // Flag 2: If the second bit is set AND 'e' is not a string,
        // iterate over all properties of 'e' and define corresponding getters
        // in the new namespace 'n'. This helps with `import * as name`.
        if ( 2 & r && "string" != typeof e ) {
            for ( var o in e ) {
                t.d( n, o, ( function ( r ) {
                    return e[ r ];
                } ).bind( null, o ) );
            }
        }

        // Return the fully constructed namespace object.
        return n;
    };


    /**
     * Helper function to retrieve the default export of a module.
     * It handles both ES Modules (which have an explicit `default` export)
     * and CommonJS modules (where the entire `exports` object is the default).
     *
     * @param {object} e The module's exports object.
     * @returns {function} A function that, when called, returns the default export.
     */
    t.n = function ( e ) {
        // Determine the appropriate getter function.
        // If 'e' is an ES Module (`e.__esModule` is true), return `e.default`.
        // Otherwise, return 'e' itself (CommonJS style).
        var r = e && e.__esModule ?
            function () {
                return e.default;
            } :
            function () {
                return e;
            };

        // Define a getter property 'a' on the returned function, which points back to itself.
        // This is a common Webpack pattern for interop.
        t.d( r, "a", r );
        return r;
    };


    /**
     * Checks if an object `e` has its own property `r`.
     * This uses `Object.prototype.hasOwnProperty.call` for robust checking,
     * avoiding issues with shadowed `hasOwnProperty` methods.
     *
     * @param {object} e The object to inspect.
     * @param {string} r The name of the property to check for.
     * @returns {boolean} `true` if `e` has its own property `r`, `false` otherwise.
     */
    t.o = function ( e, r ) {
        return Object.prototype.hasOwnProperty.call( e, r );
    };


    // `t.p`: The public path for assets within the bundle.
    // In this specific bundle, it's an empty string, meaning relative paths.
    t.p = "";


    // --- Application Entry Point ---

    // Set the entry module ID (`t.s = 0`) and then immediately execute it.
    // This starts the main application logic.
    return t( t.s = 0 );

}( [
    /**
     * Module 0: The Primary Entry Module
     *
     * This module serves as the initial point of execution for the bundled application.
     * Its main task is to read input from `/dev/stdin` and pipe it into Module 1.
     *
     * @param {object} e The Webpack-style `module` object.
     * @param {object} r The `exports` object for this module.
     * @param {function} t The local `require` function.
     */
    function ( e, r, t ) {

        // This line reads data from standard input and passes it to Module 1.
        // 1. `t(2)` loads Module 2 (which exports the Node.js `fs` module).
        // 2. `.readFileSync("/dev/stdin", "UTF-8")` reads the content of standard input as a UTF-8 string.
        // 3. `t(1)(...)` loads Module 1 and then immediately calls its exported function
        //    with the content read from `/dev/stdin`.
        t( 1 )(
            t( 2 )
            .readFileSync( "/dev/stdin", "UTF-8" )
        );

    },

    /**
     * Module 1: Core Problem-Solving Logic
     *
     * This module contains the main algorithm to process the input string
     * provided by Module 0 and determine the final output ("Yes" or "No").
     * It includes a utility function for array destructuring.
     *
     * @param {object} e The Webpack-style `module` object.
     * @param {object} r The `exports` object for this module.
     */
    function ( e, r ) {


        // Helper function 't' for safe array destructuring.
        // This function is designed to robustly handle various input types:
        //  - Actual JavaScript arrays.
        //  - Objects conforming to the iterable protocol (e.g., Sets, Maps, Strings, etc.).
        //  - It throws a `TypeError` if the input is neither an array nor an iterable.
        // The implementation uses a series of chained logical OR (`||`) operators
        // with immediately-invoked function expressions (IIFEs) for a concise flow.
        function t( e, r ) {
            return (
                // Attempt 1: Check if 'e' is already an array.
                // If `Array.isArray(e)` is true, return 'e'.
                // Otherwise, this IIFE returns `undefined`, which is falsy,
                // causing the `||` operator to proceed to the next part.
                function ( e ) {
                    if ( Array.isArray( e ) ) {
                        return e;
                    }
                }( e )

                ||

                // Attempt 2: Try to destructure 'e' as an iterable object.
                // This complex IIFE handles the iteration process.
                function ( e, r ) {
                    var t = [], // `t` will store the destructured elements.
                        n = !0, // `n` (not done) flag, initialized to true.
                        o = !1, // `o` (error occurred) flag, initialized to false.
                        u = void 0; // `u` will store any caught error.
                    try {
                        // Get the iterator from 'e'.
                        // Loop condition:
                        //  - `!(n = (i = l.next()).done)`: Continue as long as the iterator is not `done`.
                        //  - `(t.push(i.value), !r || t.length !== r)`: Push the current value into `t`.
                        //    Also, continue if `r` (limit) is not specified OR if `t.length` hasn't reached `r`.
                        for (
                            var i, l = e[ Symbol.iterator ](); !( n = ( i = l.next() ).done ) &&
                            ( t.push( i.value ), !r || t.length !== r );
                            n = !0
                        ) {
                            /* The loop body is intentionally empty; all logic is in the condition. */
                        }
                    } catch ( e ) {
                        // If any error occurs during iteration, flag it and store the error.
                        o = !0;
                        u = e;
                    } finally {
                        // This `finally` block ensures proper cleanup of the iterator.
                        try {
                            // This highly condensed expression attempts to call `l.return()` if:
                            //  - The iteration was not fully completed (`n` is false, meaning `!done`).
                            //  - AND the iterator has a `return` method (`l.return` is not null or undefined).
                            // The `||` operator ensures short-circuiting:
                            //  - If `n` is true (iteration completed), the rest is skipped.
                            //  - If `l.return` is null/undefined, the `l.return()` call is skipped.
                            //  - Otherwise, `l.return()` is executed.
                            n || null == l.return || l.return();
                        } finally {
                            // If an error was caught in the outer `try` block, re-throw it here.
                            if ( o ) {
                                throw u;
                            }
                        }
                    }
                    // If the collected array `t` has the expected length `r`, return it.
                    // Otherwise, this function implicitly returns `undefined`,
                    // allowing the `||` operator to proceed to the final fallback.
                    if ( t.length === r ) {
                        return t;
                    }
                }( e, r )

                ||

                // Attempt 3 (Fallback): If neither of the above attempts succeeded,
                // this IIFE is executed, which throws a `TypeError`.
                function () {
                    throw new TypeError( "Invalid attempt to destructure non-iterable instance" );
                }()
            );
        }


        // The main function exported by Module 1.
        // It takes the entire input string `e` (from `/dev/stdin`) as its argument.
        e.exports = function ( e ) {


            // Split the input string into an array of lines.
            var r = e.split( "\n" );


            // Process the first line of input:
            // 1. `r[0].split(" ")`: Split the first line by spaces.
            // 2. `.map(function(e){return Number(e)})`: Convert each part to a number.
            // 3. `t(..., 5)`: Use the helper `t` function to destructure the resulting array into 5 elements.
            var n = t( r[ 0 ].split( " " ).map( function ( e ) {
                return Number( e );
            } ), 5 );


            // Assign the destructured values to individual variables.
            // Note: `n[1]` is accessed but its value is discarded in the comma expression `(n[1], n[2])`,
            // so `u` effectively gets `n[2]`.
            var o = n[ 0 ]; // Represents the number of elements in the second line.
            var u = ( n[ 1 ], n[ 2 ] ); // An index or parameter.
            var i = n[ 3 ]; // Another index or parameter.
            var l = n[ 4 ]; // A final index or parameter.


            // Split the second line of input into an array of individual characters.
            var f = r[ 1 ].split( "" );


            // Iterate through the character array `f` to check for consecutive '#' characters.
            // The loop runs from the second character (`c = 1`) up to `o - 1`.
            for ( var c = 1; c < o; c++ ) {
                // If a '#' is followed immediately by another '#', print "No" and exit the function.
                if ( "#" == f[ c - 1 ] && "#" == f[ c ] ) {
                    // `void console.log("No")` ensures `undefined` is returned, a common minification pattern.
                    return void console.log( "No" );
                }
            }


            // Conditional logic branch: Execute if `i` is NOT less than `l`.
            if ( !( i < l ) ) {

                // Initialize a counter `a` to 0.
                // Loop from index `s = u` up to `l - 2` (exclusive).
                for ( var a = 0, s = u; s < l - 1; s++ ) {

                    if ( "." == f[ s ] ) {
                        // If the current character is '.', increment the counter `a`.
                        // If `a` reaches 2, print "Yes" and exit.
                        if ( 2 == a ) {
                            return void console.log( "Yes" );
                        }
                        a += 1;
                    } else {
                        // If the character is not '.', reset `a` to 0.
                        a = 0;
                    }
                }

                // This line uses the comma operator.
                // The boolean expression `l-2>=0 && l-2<o && "#"==f[l-2] || l>=0 && l<o && f[l]`
                // is evaluated first, but its result is discarded.
                // Then, `void console.log("No")` is evaluated, and its result (undefined) is returned.
                // This means if the `if (!(i < l))` condition is met, "No" is always printed and the function returns.
                return l - 2 >= 0 && l - 2 < o && "#" == f[ l - 2 ] || l >= 0 && l < o && f[ l ],
                    void console.log( "No" );
            }


            // If none of the preceding conditions caused an early return,
            // it means the input satisfies the "Yes" criteria.
            console.log( "Yes" );
        };

    },

    /**
     * Module 2: File System Module
     *
     * This module simply exports the Node.js built-in `fs` (file system) module.
     * It allows other modules to interact with the file system, such as reading from `/dev/stdin`.
     *
     * @param {object} e The Webpack-style `module` object.
     * @param {object} r The `exports` object for this module.
     */
    function ( e, r ) {

        // Export the Node.js 'fs' module.
        e.exports = require( "fs" );

    }

] );