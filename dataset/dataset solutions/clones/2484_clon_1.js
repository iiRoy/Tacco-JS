module.exports = function ( e ) {

    // This object is used to cache loaded modules.
    var r = {};

    /**
     * Webpack's module loading function.
     * It simulates a CommonJS require.
     * @param {number} t - The module ID.
     * @returns {object} The exports of the module.
     */
    function n ( t ) {

        // If the module is already in cache, return its exports.
        if ( r[t] ) {
            return r[t].exports;
        }

        // Create a new module object and put it into the cache.
        var i = r[t] = {
            i: t,
            l: !1, // 'l' indicates if the module has been loaded.
            exports: {}
        };

        // Execute the module function, providing `module`, `exports`, and `require` (this `n` function).
        e[t].call( i.exports, i, i.exports, n );

        // Mark the module as loaded.
        i.l = !0;

        // Return the exports of the module.
        return i.exports;
    }


    // Store all module definitions.
    n.m = e;

    // Store the module cache.
    n.c = r;


    /**
     * Define property getters for exports.
     * This is used for compatibility with non-ESM modules.
     * @param {object} e - The exports object.
     * @param {string} r - The property name.
     * @param {function} t - The getter function.
     */
    n.d = function ( e, r, t ) {

        // If the property doesn't already exist on the object.
        if ( ! n.o( e, r ) ) {
            Object.defineProperty( e, r, {
                enumerable: !0, // Make it enumerable.
                get: t         // Set the getter function.
            } );
        }

    };


    /**
     * Add __esModule and Symbol.toStringTag properties to exports for ESM compatibility.
     * @param {object} e - The exports object.
     */
    n.r = function ( e ) {

        // Add Symbol.toStringTag if available.
        if ( "undefined" != typeof Symbol && Symbol.toStringTag ) {
            Object.defineProperty( e, Symbol.toStringTag, { value: "Module" } );
        }

        // Add __esModule flag.
        Object.defineProperty( e, "__esModule", { value: !0 } );
    };


    /**
     * Create a namespace object for module exports.
     * This is used to handle different module export formats (ESM, CommonJS, etc.).
     * @param {*} e - The module export value.
     * @param {number} r - Flags indicating the type of module.
     * @returns {object} The namespace object.
     */
    n.t = function ( e, r ) {

        // If the flag indicates it's a module ID, load it.
        if ( 1 & r ) {
            e = n( e );
        }

        // If the flag indicates raw exports, return as is.
        if ( 8 & r ) {
            return e;
        }

        // If it's an object and already an ES module, return as is.
        if ( 4 & r && "object" == typeof e && e && e.__esModule ) {
            return e;
        }

        // Create a new namespace object.
        var t = Object.create( null );

        // Mark it as an ES module.
        n.r( t );

        // Define a 'default' property pointing to the original export.
        Object.defineProperty( t, "default", {
            enumerable: !0,
            value: e
        } );

        // If it's a CommonJS module and not just a string, copy all properties.
        if ( 2 & r && "string" != typeof e ) {
            for ( var i in e ) {
                n.d( t, i, function ( r ) {
                    return e[r];
                }.bind( null, i ) );
            }
        }

        return t;
    };


    /**
     * Helper for `n.t` to create a getter for `default` export.
     * @param {object} e - The module exports.
     * @returns {function} A getter function.
     */
    n.n = function ( e ) {
        var r = e && e.__esModule ?
            function () {
                return e.default;
            } :
            function () {
                return e;
            };
        n.d( r, "a", r ); // Add a 'a' property that is also the getter.
        return r;
    };


    /**
     * Check if an object has a property.
     * Equivalent to `Object.prototype.hasOwnProperty.call(obj, prop)`.
     * @param {object} e - The object.
     * @param {string} r - The property name.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    n.o = function ( e, r ) {
        return Object.prototype.hasOwnProperty.call( e, r );
    };


    // Public path for assets (empty in this case).
    n.p = "";

    // Load the entry module (module 0).
    return n( n.s = 0 );

}( [
    /* Module 0 */
    function ( e, r, n ) {
        "use strict";

        // Import the 'fs' module (from module 1).
        var t = n( 1 );

        // Import and execute the main logic (from module 2), passing the result of reading from stdin.
        n( 2 )( t.readFileSync( "/dev/stdin", "utf8" ) );
    },


    /* Module 1 */
    function ( e, r ) {

        // Export the built-in 'fs' module.
        e.exports = require( "fs" );
    },


    /* Module 2 */
    function ( e, r, n ) {
        "use strict";

        // Import the InputReader class (from module 3).
        var t = n( 3 );

        // Import the main algorithm logic (from module 5).
        var i = n( 5 );

        /**
         * Main entry point for processing input.
         * @param {string} e - The input string.
         */
        e.exports = function ( e ) {

            // Create a new InputReader instance with the provided input.
            var r = new t( e );

            // Execute the main algorithm logic with the input reader.
            i( r );
        };
    },


    /* Module 3 */
    function ( e, r, n ) {
        "use strict";

        // Import the Deque class (from module 4).
        var t = n( 4 );

        /**
         * InputReader class to parse and provide input.
         */
        e.exports = class {

            /**
             * Constructor for InputReader.
             * @param {string} e - The raw input string.
             */
            constructor ( e ) {

                // Trim whitespace and split the input by whitespace into an array of strings.
                var r = e.trim().split( /\s+/g );

                // Initialize an internal Deque with the parsed input tokens.
                this.inp = new t( r );
            }


            /**
             * Reads the next raw string token from the input.
             * @returns {string} The next input token.
             */
            inr () {
                return this.inp.deq();
            }


            /**
             * Reads the next input token and parses it as an integer.
             * @returns {number} The next input token as an integer.
             */
            in () {
                return parseInt( this.inp.deq(), 10 );
            }


            /**
             * Clears the internal input buffer.
             */
            fin () {
                this.inp.clear();
            }
        };
    },


    /* Module 4 */
    function ( e, r, n ) {
        "use strict";

        /**
         * Deque (Double-Ended Queue) class implementation.
         */
        e.exports = class {

            /**
             * Constructor for Deque.
             * @param {Array<*>} [e=[]] - Initial array of items.
             */
            constructor () {
                // Default to an empty array if no initial items are provided.
                var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];

                this.size  = e.length; // Current number of items.
                this.items = e;        // The underlying array.
                this.ind   = 0;        // Index of the front of the queue.
            }


            /**
             * Enqueues an item to the back of the deque.
             * @param {*} e - The item to enqueue.
             */
            enq ( e ) {
                this.size += 1;
                this.items.push( e );
            }


            /**
             * Dequeues an item from the front of the deque.
             * @returns {*} The item dequeued.
             */
            deq () {
                var e = this.items[ this.ind ];

                this.size -= 1;
                this.ind  += 1;

                return e;
            }


            /**
             * Clears all items from the deque.
             */
            clear () {
                this.items = [];
                this.size  = 0;
                this.ind   = 0;
            }
        };
    },


    /* Module 5 */
    function ( e, r, n ) {
        "use strict";

        // Import the BigNumber library (from module 6).
        var t = n( 6 );

        /**
         * Main algorithm logic.
         * This function reads input, performs calculations, and prints the result.
         * @param {InputReader} e - An instance of the InputReader.
         */
        e.exports = function ( e ) {

            // Read the number of items (r).
            var r = e.in();

            // Read a BigNumber 'n' (this seems to be unused, or a placeholder for future use or a special case).
            // It's possible 'n' is meant to be a BigNumber representing a limit or constraint, but in the problem context, it's not directly used in the calculation of 'l'.
            var n = new t( e.inr() );

            // Initialize an array 'i' of size 'r' for the first set of numbers.
            var i = new Array( r );

            // Initialize 'o' to store the maximum value in array 'i'.
            var o = 0;

            // Populate array 'i' and find its maximum value.
            for ( var s = 0; s < r; s++ ) {
                i[ s ] = e.in();
                o      = Math.max( o, i[ s ] );
            }


            // Initialize an array 'u' of size 'r' for the second set of numbers.
            var u = new Array( r );

            // Initialize 'f' to store the maximum value in array 'u'.
            var f = 0;

            // Populate array 'u' and find its maximum value.
            for ( var c = 0; c < r; c++ ) {
                u[ c ] = e.in();
                f      = Math.max( f, u[ c ] );
            }


            // Sort array 'i' in ascending order.
            i.sort( function ( e, r ) {
                return e - r;
            } );

            // Sort array 'u' in descending order.
            u.sort( function ( e, r ) {
                return r - e;
            } );


            // Initialize 'l' (lower bound for binary search) with the product of max values.
            var l = o * f;

            // Initialize 'a' (upper bound for binary search) with -1.
            var a = -1;


            // Perform binary search to find the minimum 'h' that satisfies the condition.
            // The loop continues as long as the absolute difference between 'l' and 'a' is greater than 1.
            while ( Math.abs( l - a ) > 1 ) {

                // Calculate the middle point 'h'.
                var h = Math.floor( ( l + a ) / 2 );

                // Initialize 'p' (penalty count).
                var p = 0;

                // Iterate through the sorted arrays.
                for ( var g = 0; g < r; g++ ) {

                    // Calculate the product of corresponding elements.
                    var d = i[ g ] * u[ g ];

                    // If the product 'd' is greater than 'h', calculate the penalty.
                    if ( d > h ) {
                        p += Math.ceil( ( d - h ) / u[ g ] );
                    }
                }

                // Adjust the binary search bounds based on the penalty 'p'.
                // If 'p' is less than or equal to 'n' (the unused BigNumber, which is effectively 0 here since it's not used in 'comparedTo' after being initialized with a string from input reader which should be a number, then 'comparedTo' will act on numeric value), then 'h' is a possible answer, so try smaller.
                // If n.comparedTo(p) >= 0 is true, it means n >= p. Since n is initialized with BigNumber(e.inr()), and e.inr() is assumed to be a number string like "0", then n is likely 0.
                // So, if 0 >= p, it means p must be 0 or negative. Since p is a count, it's always non-negative. Thus, this condition effectively checks if p == 0.
                // If p == 0, then 'h' is a valid candidate for the minimum possible maximum product, so we try to find an even smaller 'h'.
                if ( n.comparedTo( p ) >= 0 ) {
                    l = h;
                } else {
                    // Otherwise, 'h' is too small, so we need a larger 'h'.
                    a = h;
                }
            }


            // Print the final result.
            console.log( l );
        };
    },


    /* Module 6 */
    function ( e, r, n ) {

        var t;

        // BigNumber.js
        // A arbitrary-precision decimal and non-decimal arithmetic library.
        // https://github.com/MikeMcl/bignumber.js
        !function ( i ) {
            "use strict";

            var o, // The BigNumber constructor.

                // Regular expression to test for a valid base 10 number.
                s = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i,

                // Math functions.
                u = Math.ceil,
                f = Math.floor,

                // Error messages.
                c = "[BigNumber Error] ",
                l = c + "Number primitive has more than 15 significant digits: ",

                // Constants for internal representation.
                a = 1e14, // Base for digits.
                h = 14,   // Number of digits per base unit.
                p = 9007199254740991, // Max safe integer.

                // Powers of 10 for digit extraction.
                g = [ 1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13 ],

                d = 1e7,  // Half base for some calculations.
                w = 1e9;  // Max precision/range.


            /**
             * Truncates a number towards zero.
             * @param {number} e
             * @returns {number}
             */
            function m ( e ) {
                var r = 0 | e;
                return e > 0 || e === r ? r : r - 1;
            }


            /**
             * Converts an array of digits (base 'a') to a string representation.
             * @param {Array<number>} e - Array of digits.
             * @returns {string} The string representation.
             */
            function v ( e ) {
                for ( var r, n, t = 1, i = e.length, o = e[0] + ""; t < i; ) {
                    for ( r = e[t++] + "", n = h - r.length; n--; r = "0" + r );
                    o += r;
                }
                for ( i = o.length; 48 === o.charCodeAt( --i ); );
                return o.slice( 0, i + 1 || 1 );
            }


            /**
             * Compares two BigNumber instances.
             * @param {BigNumber} e
             * @param {BigNumber} r
             * @returns {number|null} -1, 0, 1, or null if NaN.
             */
            function b ( e, r ) {
                var n, t, i = e.c, o = r.c, s = e.s, u = r.s, f = e.e, c = r.e;

                // Handle NaN or zero.
                if ( !s || !u ) {
                    return null;
                }

                n = i && !i[0]; // Is e zero?
                t = o && !o[0]; // Is r zero?

                // Compare zeros or with non-zeros.
                if ( n || t ) {
                    return n ? t ? 0 : -u : s; // If e is zero, return 0 if r is zero, else -u. If r is zero, return s.
                }

                // Compare signs.
                if ( s != u ) {
                    return s;
                }

                // If both are zero, return 0.
                if ( n && t ) {
                    return 0;
                }

                // Compare exponents.
                if ( n = s < 0, t = f == c, !i || !o ) {
                    return t ? 0 : !i ^ n ? 1 : -1;
                }

                if ( !t ) {
                    return f > c ^ n ? 1 : -1;
                }

                // Compare digits.
                for ( u = ( f = i.length ) < ( c = o.length ) ? f : c, s = 0; s < u; s++ ) {
                    if ( i[s] != o[s] ) {
                        return i[s] > o[s] ^ n ? 1 : -1;
                    }
                }

                // If digits are equal up to the shorter length, compare lengths.
                return f == c ? 0 : f > c ^ n ? 1 : -1;
            }


            /**
             * Validates a numeric argument.
             * @param {number} e - The argument value.
             * @param {number} r - Minimum allowed value.
             * @param {number} n - Maximum allowed value.
             * @param {string} t - Argument name for error message.
             * @throws {Error} If validation fails.
             */
            function y ( e, r, n, t ) {
                if ( e < r || e > n || e !== f( e ) ) {
                    throw Error( c + ( t || "Argument" ) + ( "number" == typeof e ? e < r || e > n ? " out of range: " : " not an integer: " : " not a primitive number: " ) + String( e ) );
                }
            }


            /**
             * Checks if a BigNumber is odd.
             * @param {BigNumber} e
             * @returns {boolean}
             */
            function O ( e ) {
                var r = e.c.length - 1;
                return m( e.e / h ) == r && e.c[r] % 2 != 0;
            }


            /**
             * Formats a number string into scientific notation.
             * @param {string} e - Number string.
             * @param {number} r - Exponent.
             * @returns {string} Scientific notation string.
             */
            function N ( e, r ) {
                return ( e.length > 1 ? e.charAt( 0 ) + "." + e.slice( 1 ) : e ) + ( r < 0 ? "e" : "e+" ) + r;
            }


            /**
             * Formats a number string with a decimal point.
             * @param {string} e - Number string.
             * @param {number} r - Exponent.
             * @param {string} n - Zero padding character.
             * @returns {string} Fixed-point string.
             */
            function E ( e, r, n ) {
                var t, i;
                if ( r < 0 ) {
                    for ( i = n + "."; ++r; i += n );
                    e = i + e;
                } else if ( ++r > ( t = e.length ) ) {
                    for ( i = n, r -= t; --r; i += n );
                    e += i;
                } else {
                    r < t && ( e = e.slice( 0, r ) + "." + e.slice( r ) );
                }
                return e;
            }


            // The BigNumber constructor function.
            // It's wrapped in an IIFE to allow for configuration.
            ( o = function e ( r ) {

                var n, t, i, o, A, x, S, _, P, M = k.prototype = {
                    constructor: k,
                    toString: null,
                    valueOf: null
                },
                    R = new k( 1 ), // BigNumber(1)
                    D = 20,        // DECIMAL_PLACES (default)
                    B = 4,         // ROUNDING_MODE (default: ROUND_HALF_UP)
                    L = -7,        // EXPONENTIAL_AT lower bound (default)
                    T = 21,        // EXPONENTIAL_AT upper bound (default)
                    I = -1e7,      // RANGE lower bound (default)
                    U = 1e7,       // RANGE upper bound (default)
                    C = !1,        // CRYPTO (default: false)
                    j = 1,         // MODULO_MODE (default: ROUND_DOWN)
                    q = 0,         // POW_PRECISION (default: 0)

                    // Default format object for toFormat.
                    G = {
                        prefix: "",
                        groupSize: 3,
                        secondaryGroupSize: 0,
                        groupSeparator: ",",
                        decimalSeparator: ".",
                        fractionGroupSize: 0,
                        fractionGroupSeparator: " ", // Non-breaking space
                        suffix: ""
                    },

                    F = "0123456789abcdefghijklmnopqrstuvwxyz"; // ALPHABET (default)


                /**
                 * BigNumber constructor.
                 * @param {number|string|BigNumber} e - The value.
                 * @param {number} [r] - The base of the value (2-36).
                 */
                function k ( e, r ) {
                    var n, o, u, c, a, g, d, w, m = this;

                    // Ensure 'new' keyword is used.
                    if ( !( m instanceof k ) ) {
                        return new k( e, r );
                    }

                    // If no base is provided (default base 10).
                    if ( null == r ) {

                        // Handle BigNumber instance.
                        if ( e && !0 === e._isBigNumber ) {
                            return m.s = e.s,
                                void ( !e.c || e.e > U ? m.c = m.e = null : e.e < I ? m.c = [ m.e = 0 ] : ( m.e = e.e, m.c = e.c.slice() ) );
                        }

                        // Handle number primitive.
                        if ( ( g = "number" == typeof e ) && 0 * e == 0 ) {

                            // Determine sign.
                            if ( m.s = 1 / e < 0 ? ( e = -e, -1 ) : 1, e === ~~e ) { // If integer.
                                for ( c = 0, a = e; a >= 10; a /= 10, c++ );
                                return void ( c > U ? m.c = m.e = null : ( m.e = c, m.c = [ e ] ) );
                            }
                            w = String( e );
                        } else {
                            // Handle string.
                            if ( !s.test( w = String( e ) ) ) {
                                return i( m, w, g );
                            }
                            m.s = 45 == w.charCodeAt( 0 ) ? ( w = w.slice( 1 ), -1 ) : 1;
                        }

                        // Parse decimal point and exponent.
                        ( c = w.indexOf( "." ) ) > -1 && ( w = w.replace( ".", "" ) );
                        ( a = w.search( /e/i ) ) > 0 ? ( c < 0 && ( c = a ), c += +w.slice( a + 1 ), w = w.substring( 0, a ) ) : c < 0 && ( c = w.length );

                    } else {
                        // Handle custom base.
                        if ( y( r, 2, F.length, "Base" ), 10 == r ) {
                            return V( m = new k( e ), D + m.e + 1, B );
                        }

                        if ( w = String( e ), g = "number" == typeof e ) {
                            if ( 0 * e != 0 ) {
                                return i( m, w, g, r );
                            }
                            if ( m.s = 1 / e < 0 ? ( w = w.slice( 1 ), -1 ) : 1, k.DEBUG && w.replace( /^0\.0*|\./, "" ).length > 15 ) {
                                throw Error( l + e );
                            }
                        } else {
                            m.s = 45 === w.charCodeAt( 0 ) ? ( w = w.slice( 1 ), -1 ) : 1;
                        }

                        for ( n = F.slice( 0, r ), c = a = 0, d = w.length; a < d; a++ ) {
                            if ( n.indexOf( o = w.charAt( a ) ) < 0 ) {
                                if ( "." == o ) {
                                    if ( a > c ) {
                                        c = d;
                                        continue;
                                    }
                                } else if ( !u && ( w == w.toUpperCase() && ( w = w.toLowerCase() ) || w == w.toLowerCase() && ( w = w.toUpperCase() ) ) ) {
                                    u = !0, a = -1, c = 0;
                                    continue;
                                }
                                return i( m, String( e ), g, r );
                            }
                        }

                        g = !1, ( c = ( w = t( w, r, 10, m.s ) ).indexOf( "." ) ) > -1 ? w = w.replace( ".", "" ) : c = w.length;
                    }

                    // Remove leading/trailing zeros.
                    for ( a = 0; 48 === w.charCodeAt( a ); a++ );
                    for ( d = w.length; 48 === w.charCodeAt( --d ); );

                    if ( w = w.slice( a, ++d ) ) {
                        // Handle numbers out of range.
                        if ( d -= a, g && k.DEBUG && d > 15 && ( e > p || e !== f( e ) ) ) {
                            throw Error( l + m.s * e );
                        }

                        if ( ( c = c - a - 1 ) > U ) {
                            m.c = m.e = null;
                        } else if ( c < I ) {
                            m.c = [ m.e = 0 ];
                        } else {
                            // Convert to internal array format.
                            if ( m.e = c, m.c = [], a = ( c + 1 ) % h, c < 0 && ( a += h ), a < d ) {
                                for ( a && m.c.push( +w.slice( 0, a ) ), d -= h; a < d; ) {
                                    m.c.push( +w.slice( a, a += h ) );
                                }
                                a = h - ( w = w.slice( a ) ).length;
                            } else {
                                a -= d;
                            }
                            for ( ; a--; w += "0" );
                            m.c.push( +w );
                        }
                    } else {
                        m.c = [ m.e = 0 ];
                    }
                }


                /**
                 * Formats a BigNumber to a string with a specified number of decimal places.
                 * @param {BigNumber} e - The BigNumber instance.
                 * @param {number} r - Number of decimal places.
                 * @param {number} n - Rounding mode.
                 * @param {number} t - Formatting type (1 for exponential, 2 for precision).
                 * @returns {string} The formatted string.
                 */
                function z ( e, r, n, t ) {
                    var i, o, s, u, f;

                    if ( null == n ? n = B : y( n, 0, 8 ), !e.c ) {
                        return e.toString();
                    }

                    if ( i = e.c[0], s = e.e, null == r ) {
                        f = v( e.c ),
                            f = 1 == t || 2 == t && ( s <= L || s >= T ) ? N( f, s ) : E( f, s, "0" );
                    } else if ( o = ( e = V( new k( e ), r, n ) ).e, u = ( f = v( e.c ) ).length, 1 == t || 2 == t && ( r <= o || o <= L ) ) {
                        for ( ; u < r; f += "0", u++ );
                        f = N( f, o );
                    } else if ( r -= s, f = E( f, o, "0" ), o + 1 > u ) {
                        if ( --r > 0 ) {
                            for ( f += "."; r--; f += "0" );
                        }
                    } else if ( ( r += o - u ) > 0 ) {
                        for ( o + 1 == u && ( f += "." ); r--; f += "0" );
                    }

                    return e.s < 0 && i ? "-" + f : f;
                }


                /**
                 * Finds the maximum or minimum BigNumber in an array.
                 * @param {Array<BigNumber>} e - Array of BigNumber instances.
                 * @param {function} r - Comparison function (e.g., M.lt for max, M.gt for min).
                 * @returns {BigNumber} The max/min BigNumber.
                 */
                function $ ( e, r ) {
                    for ( var n, t = 1, i = new k( e[0] ); t < e.length; t++ ) {
                        if ( !( n = new k( e[t] ) ).s ) {
                            i = n;
                            break;
                        }
                        r.call( i, n ) && ( i = n );
                    }
                    return i;
                }


                /**
                 * Helper to normalize a BigNumber's internal representation.
                 * Removes trailing zeros from the digit array and sets the exponent.
                 * @param {BigNumber} e - The BigNumber instance.
                 * @param {Array<number>} r - The digit array.
                 * @param {number} n - The exponent.
                 * @returns {BigNumber} The normalized BigNumber.
                 */
                function H ( e, r, n ) {
                    for ( var t = 1, i = r.length; !r[--i]; r.pop() );
                    for ( i = r[0]; i >= 10; i /= 10, t++ );
                    return ( n = t + n * h - 1 ) > U ? e.c = e.e = null : n < I ? e.c = [ e.e = 0 ] : ( e.e = n, e.c = r ), e;
                }


                /**
                 * Rounds a BigNumber to a specified precision/decimal places.
                 * @param {BigNumber} e - The BigNumber to round.
                 * @param {number} r - Precision or decimal places.
                 * @param {number} n - Rounding mode.
                 * @param {boolean} [t] - Whether to force rounding up.
                 * @returns {BigNumber} The rounded BigNumber.
                 */
                function V ( e, r, n, t ) {
                    var i, o, s, c, l, p, d, w = e.c, m = g;

                    if ( w ) {
                        e: {
                            for ( i = 1, c = w[0]; c >= 10; c /= 10, i++ );

                            // Calculate offset and digit to check for rounding.
                            if ( ( o = r - i ) < 0 ) {
                                o += h, s = r, d = ( l = w[p = 0] ) / m[i - s - 1] % 10 | 0;
                            } else if ( ( p = u( ( o + 1 ) / h ) ) >= w.length ) {
                                if ( !t ) {
                                    break e;
                                }
                                for ( ; w.length <= p; w.push( 0 ) );
                                l = d = 0, i = 1, s = ( o %= h ) - h + 1;
                            } else {
                                for ( l = c = w[p], i = 1; c >= 10; c /= 10, i++ );
                                d = ( s = ( o %= h ) - h + i ) < 0 ? 0 : l / m[i - s - 1] % 10 | 0;
                            }

                            // Determine if rounding is needed.
                            t = t || r < 0 || null != w[p + 1] || ( s < 0 ? l : l % m[i - s - 1] );
                            t = n < 4 ? ( d || t ) && ( 0 == n || n == ( e.s < 0 ? 3 : 2 ) ) : d > 5 || 5 == d && ( 4 == n || t || 6 == n && ( o > 0 ? s > 0 ? l / m[i - s] : 0 : w[p - 1] ) % 10 & 1 || n == ( e.s < 0 ? 8 : 7 ) );

                            // Apply rounding.
                            if ( r < 1 || !w[0] ) {
                                return w.length = 0, t ? ( r -= e.e + 1, w[0] = m[ ( h - r % h ) % h ], e.e = -r || 0 ) : w[0] = e.e = 0, e;
                            }

                            if ( 0 == o ? ( w.length = p, c = 1, p-- ) : ( w.length = p + 1, c = m[h - o], w[p] = s > 0 ? f( l / m[i - s] % m[s] ) * c : 0 ), t ) {
                                for ( ;; ) {
                                    if ( 0 == p ) {
                                        for ( o = 1, s = w[0]; s >= 10; s /= 10, o++ );
                                        for ( s = w[0] += c, c = 1; s >= 10; s /= 10, c++ );
                                        o != c && ( e.e++, w[0] == a && ( w[0] = 1 ) );
                                        break;
                                    }
                                    if ( w[p] += c, w[p] != a ) {
                                        break;
                                    }
                                    w[p--] = 0, c = 1;
                                }
                            }

                            // Remove trailing zeros from the digit array.
                            for ( o = w.length; 0 === w[--o]; w.pop() );
                        }
                        // Handle range limits after rounding.
                        e.e > U ? e.c = e.e = null : e.e < I && ( e.c = [ e.e = 0 ] );
                    }
                    return e;
                }


                /**
                 * Converts a BigNumber to its string representation.
                 * This is the default toString method for BigNumber.
                 * @param {BigNumber} e - The BigNumber instance.
                 * @returns {string} The string representation.
                 */
                function W ( e ) {
                    var r, n = e.e;

                    if ( null === n ) {
                        return e.toString();
                    }

                    r = v( e.c );
                    r = n <= L || n >= T ? N( r, n ) : E( r, n, "0" );

                    return e.s < 0 ? "-" + r : r;
                }


                // Static properties for rounding modes.
                k.clone = e; // Allows creating a new BigNumber constructor with different config.
                k.ROUND_UP = 0;
                k.ROUND_DOWN = 1;
                k.ROUND_CEIL = 2;
                k.ROUND_FLOOR = 3;
                k.ROUND_HALF_UP = 4;
                k.ROUND_HALF_DOWN = 5;
                k.ROUND_HALF_EVEN = 6;
                k.ROUND_HALF_CEIL = 7;
                k.ROUND_HALF_FLOOR = 8;
                k.EUCLID = 9;


                /**
                 * Configures BigNumber settings.
                 * @param {object} e - Configuration object.
                 * @returns {object} Current configuration.
                 */
                k.config = k.set = function ( e ) {
                    var r, n;

                    if ( null != e ) {
                        if ( "object" != typeof e ) {
                            throw Error( c + "Object expected: " + e );
                        }

                        // DECIMAL_PLACES
                        if ( e.hasOwnProperty( r = "DECIMAL_PLACES" ) && ( y( n = e[r], 0, w, r ), D = n ),
                            // ROUNDING_MODE
                            e.hasOwnProperty( r = "ROUNDING_MODE" ) && ( y( n = e[r], 0, 8, r ), B = n ),
                            // EXPONENTIAL_AT
                            e.hasOwnProperty( r = "EXPONENTIAL_AT" ) ) {
                            ( n = e[r] ) && n.pop ? ( y( n[0], -w, 0, r ), y( n[1], 0, w, r ), L = n[0], T = n[1] ) : ( y( n, -w, w, r ), L = -( T = n < 0 ? -n : n ) );
                        }

                        // RANGE
                        if ( e.hasOwnProperty( r = "RANGE" ) ) {
                            if ( ( n = e[r] ) && n.pop ) {
                                y( n[0], -w, -1, r ), y( n[1], 1, w, r ), I = n[0], U = n[1];
                            } else {
                                if ( y( n, -w, w, r ), !n ) {
                                    throw Error( c + r + " cannot be zero: " + n );
                                }
                                I = -( U = n < 0 ? -n : n );
                            }
                        }

                        // CRYPTO
                        if ( e.hasOwnProperty( r = "CRYPTO" ) ) {
                            if ( ( n = e[r] ) !== !!n ) {
                                throw Error( c + r + " not true or false: " + n );
                            }
                            if ( n ) {
                                if ( "undefined" == typeof crypto || !crypto || !crypto.getRandomValues && !crypto.randomBytes ) {
                                    throw C = !n, Error( c + "crypto unavailable" );
                                }
                                C = n;
                            } else {
                                C = n;
                            }
                        }

                        // MODULO_MODE
                        if ( e.hasOwnProperty( r = "MODULO_MODE" ) && ( y( n = e[r], 0, 9, r ), j = n ),
                            // POW_PRECISION
                            e.hasOwnProperty( r = "POW_PRECISION" ) && ( y( n = e[r], 0, w, r ), q = n ),
                            // FORMAT
                            e.hasOwnProperty( r = "FORMAT" ) ) {
                            if ( "object" != typeof ( n = e[r] ) ) {
                                throw Error( c + r + " not an object: " + n );
                            }
                            G = n;
                        }

                        // ALPHABET
                        if ( e.hasOwnProperty( r = "ALPHABET" ) ) {
                            if ( "string" != typeof ( n = e[r] ) || /^.$|[+-.\s]|(.).*\1/.test( n ) ) {
                                throw Error( c + r + " invalid: " + n );
                            }
                            F = n;
                        }
                    }

                    // Return current configuration.
                    return {
                        DECIMAL_PLACES: D,
                        ROUNDING_MODE: B,
                        EXPONENTIAL_AT: [ L, T ],
                        RANGE: [ I, U ],
                        CRYPTO: C,
                        MODULO_MODE: j,
                        POW_PRECISION: q,
                        FORMAT: G,
                        ALPHABET: F
                    };
                };


                /**
                 * Checks if an object is a BigNumber instance.
                 * @param {*} e - The object to check.
                 * @returns {boolean} True if it's a BigNumber, false otherwise.
                 */
                k.isBigNumber = function ( e ) {
                    if ( !e || !0 !== e._isBigNumber ) {
                        return !1;
                    }
                    if ( !k.DEBUG ) {
                        return !0;
                    }

                    var r, n, t = e.c, i = e.e, o = e.s;

                    e: if ( "[object Array]" == {}.toString.call( t ) ) {
                        if ( ( 1 === o || -1 === o ) && i >= -w && i <= w && i === f( i ) ) {
                            if ( 0 === t[0] ) {
                                if ( 0 === i && 1 === t.length ) {
                                    return !0;
                                }
                                break e;
                            }
                            if ( ( r = ( i + 1 ) % h ) < 1 && ( r += h ), String( t[0] ).length == r ) {
                                for ( r = 0; r < t.length; r++ ) {
                                    if ( ( n = t[r] ) < 0 || n >= a || n !== f( n ) ) {
                                        break e;
                                    }
                                }
                                if ( 0 !== n ) {
                                    return !0;
                                }
                            }
                        } else if ( null === t && null === i && ( null === o || 1 === o || -1 === o ) ) {
                            return !0;
                        }
                        throw Error( c + "Invalid BigNumber: " + e );
                    }
                };


                /**
                 * Finds the maximum of multiple BigNumbers.
                 * @returns {BigNumber} The maximum.
                 */
                k.maximum = k.max = function () {
                    return $( arguments, M.lt );
                };


                /**
                 * Finds the minimum of multiple BigNumbers.
                 * @returns {BigNumber} The minimum.
                 */
                k.minimum = k.min = function () {
                    return $( arguments, M.gt );
                };


                /**
                 * Generates a random BigNumber.
                 * @param {number} e - Number of decimal places.
                 * @returns {BigNumber} A random BigNumber.
                 */
                k.random = ( o = 9007199254740992 * Math.random() & 2097151 ? function () {
                    return f( 9007199254740992 * Math.random() );
                } : function () {
                    return 8388608 * ( 1073741824 * Math.random() | 0 ) + ( 8388608 * Math.random() | 0 );
                }, function ( e ) {
                    var r, n, t, i, s, l = 0, a = [], p = new k( R );

                    if ( null == e ? e = D : y( e, 0, w ), i = u( e / h ), C ) {
                        // Use crypto for randomness if available.
                        if ( crypto.getRandomValues ) {
                            for ( r = crypto.getRandomValues( new Uint32Array( i *= 2 ) ); l < i; ) {
                                ( s = 131072 * r[l] + ( r[l + 1] >>> 11 ) ) >= 9e15 ? ( n = crypto.getRandomValues( new Uint32Array( 2 ) ), r[l] = n[0], r[l + 1] = n[1] ) : ( a.push( s % 1e14 ), l += 2 );
                            }
                            l = i / 2;
                        } else {
                            if ( !crypto.randomBytes ) {
                                throw C = !1, Error( c + "crypto unavailable" );
                            }
                            for ( r = crypto.randomBytes( i *= 7 ); l < i; ) {
                                ( s = 281474976710656 * ( 31 & r[l] ) + 1099511627776 * r[l + 1] + 4294967296 * r[l + 2] + 16777216 * r[l + 3] + ( r[l + 4] << 16 ) + ( r[l + 5] << 8 ) + r[l + 6] ) >= 9e15 ? crypto.randomBytes( 7 ).copy( r, l ) : ( a.push( s % 1e14 ), l += 7 );
                            }
                            l = i / 7;
                        }
                    }

                    // Fallback to Math.random if crypto is not used or unavailable.
                    if ( !C ) {
                        for ( ; l < i; ) {
                            ( s = o() ) < 9e15 && ( a[l++] = s % 1e14 );
                        }
                    }

                    // Trim and adjust the digit array.
                    for ( i = a[--l], e %= h, i && e && ( s = g[h - e], a[l] = f( i / s ) * s ); 0 === a[l]; a.pop(), l-- );

                    if ( l < 0 ) {
                        a = [ t = 0 ];
                    } else {
                        for ( t = -1; 0 === a[0]; a.splice( 0, 1 ), t -= h );
                        for ( l = 1, s = a[0]; s >= 10; s /= 10, l++ );
                        l < h && ( t -= h - l );
                    }

                    p.e = t, p.c = a;
                    return p;
                } );


                /**
                 * Sums multiple BigNumbers.
                 * @returns {BigNumber} The sum.
                 */
                k.sum = function () {
                    for ( var e = 1, r = arguments, n = new k( r[0] ); e < r.length; ) {
                        n = n.plus( r[e++] );
                    }
                    return n;
                };


                /**
                 * Converts a number from one base to another.
                 * This is an internal helper function.
                 */
                t = function () {
                    function e ( e, r, n, t ) {
                        for ( var i, o, s = [ 0 ], u = 0, f = e.length; u < f; ) {
                            for ( o = s.length; o--; s[o] *= r );
                            for ( s[0] += t.indexOf( e.charAt( u++ ) ), i = 0; i < s.length; i++ ) {
                                s[i] > n - 1 && ( null == s[i + 1] && ( s[i + 1] = 0 ), s[i + 1] += s[i] / n | 0, s[i] %= n );
                            }
                        }
                        return s.reverse();
                    }

                    return function ( r, t, i, o, s ) {
                        var u, f, c, l, a, h, p, g, d = r.indexOf( "." ), w = D, m = B;

                        if ( d >= 0 && ( l = q, q = 0, r = r.replace( ".", "" ), h = ( g = new k( t ) ).pow( r.length - d ), q = l, g.c = e( E( v( h.c ), h.e, "0" ), 10, i, "0123456789" ), g.e = g.c.length ),
                            c = l = ( p = e( r, t, i, s ? ( u = F, "0123456789" ) : ( u = "0123456789", F ) ) ).length, 0 == p[--l]; p.pop() );

                        if ( !p[0] ) {
                            return u.charAt( 0 );
                        }

                        if ( d < 0 ? --c : ( h.c = p, h.e = c, h.s = o, p = ( h = n( h, g, w, m, i ) ).c, a = h.r, c = h.e ),
                            d = p[f = c + w + 1], l = i / 2, a = a || f < 0 || null != p[f + 1],
                            a = m < 4 ? ( null != d || a ) && ( 0 == m || m == ( h.s < 0 ? 3 : 2 ) ) : d > l || d == l && ( 4 == m || a || 6 == m && 1 & p[f - 1] || m == ( h.s < 0 ? 8 : 7 ) ),
                            f < 1 || !p[0] ) {
                            r = a ? E( u.charAt( 1 ), -w, u.charAt( 0 ) ) : u.charAt( 0 );
                        } else {
                            if ( p.length = f, a ) {
                                for ( --i; ++p[--f] > i; ) {
                                    p[f] = 0, f || ( ++c, p = [ 1 ].concat( p ) );
                                }
                            }
                            for ( l = p.length; !p[--l]; );
                            for ( d = 0, r = ""; d <= l; r += u.charAt( p[d++] ) );
                            r = E( r, c, u.charAt( 0 ) );
                        }
                        return r;
                    };
                }();


                /**
                 * Performs division of two BigNumber instances.
                 * This is an internal helper function.
                 */
                n = function () {
                    function e ( e, r, n ) {
                        var t, i, o, s, u = 0, f = e.length, c = r % d, l = r / d | 0;
                        for ( e = e.slice(); f--; ) {
                            u = ( ( i = c * ( o = e[f] % d ) + ( t = l * o + ( s = e[f] / d | 0 ) * c ) % d * d + u ) / n | 0 ) + ( t / d | 0 ) + l * s, e[f] = i % n;
                        }
                        return u && ( e = [ u ].concat( e ) ), e;
                    }

                    function r ( e, r, n, t ) {
                        var i, o;
                        if ( n != t ) {
                            o = n > t ? 1 : -1;
                        } else {
                            for ( i = o = 0; i < n; i++ ) {
                                if ( e[i] != r[i] ) {
                                    o = e[i] > r[i] ? 1 : -1;
                                    break;
                                }
                            }
                        }
                        return o;
                    }

                    function n ( e, r, n, t ) {
                        for ( var i = 0; n--; ) {
                            e[n] -= i, i = e[n] < r[n] ? 1 : 0, e[n] = i * t + e[n] - r[n];
                        }
                        for ( ; !e[0] && e.length > 1; e.splice( 0, 1 ) );
                    }

                    return function ( t, i, o, s, u ) {
                        var c, l, p, g, d, w, v, b, y, O, N, E, A, x, S, _, P, M = t.s == i.s ? 1 : -1, R = t.c, D = i.c;

                        // Handle NaN, Infinity, and zero cases.
                        if ( !( R && R[0] && D && D[0] ) ) {
                            return new k( t.s && i.s && ( R ? !D || R[0] != D[0] : D ) ? R && 0 == R[0] || !D ? 0 * M : M / 0 : NaN );
                        }

                        // Adjust precision.
                        for ( y = ( b = new k( M ) ).c = [], M = o + ( l = t.e - i.e ) + 1, u || ( u = a, l = m( t.e / h ) - m( i.e / h ), M = M / h | 0 ), p = 0; D[p] == ( R[p] || 0 ); p++ );

                        if ( D[p] > ( R[p] || 0 ) && l--, M < 0 ) {
                            y.push( 1 ), g = !0;
                        } else {
                            for ( x = R.length, _ = D.length, p = 0, M += 2, ( d = f( u / ( D[0] + 1 ) ) ) > 1 && ( D = e( D, d, u ), R = e( R, d, u ), _ = D.length, x = R.length ), A = _, N = ( O = R.slice( 0, _ ) ).length; N < _; O[N++] = 0 );
                            P = D.slice(), P = [ 0 ].concat( P ), S = D[0], D[1] >= u / 2 && S++;

                            do {
                                if ( d = 0, ( c = r( D, O, _, N ) ) < 0 ) {
                                    if ( E = O[0], _ != N && ( E = E * u + ( O[1] || 0 ) ), ( d = f( E / S ) ) > 1 ) {
                                        for ( d >= u && ( d = u - 1 ), v = ( w = e( D, d, u ) ).length, N = O.length; 1 == r( w, O, v, N ); ) {
                                            d--, n( w, _ < v ? P : D, v, u ), v = w.length, c = 1;
                                        }
                                    } else {
                                        0 == d && ( c = d = 1 ), v = ( w = D.slice() ).length;
                                    }
                                    if ( v < N && ( w = [ 0 ].concat( w ) ), n( O, w, N, u ), N = O.length, -1 == c ) {
                                        for ( ; r( D, O, _, N ) < 1; ) {
                                            d++, n( O, _ < N ? P : D, N, u ), N = O.length;
                                        }
                                    }
                                } else {
                                    0 === c && ( d++, O = [ 0 ] );
                                }
                                y[p++] = d, O[0] ? O[N++] = R[A] || 0 : ( O = [ R[A] ], N = 1 );
                            } while ( ( A++ < x || null != O[0] ) && M-- );

                            g = null != O[0], y[0] || y.splice( 0, 1 );
                        }

                        if ( u == a ) {
                            for ( p = 1, M = y[0]; M >= 10; M /= 10, p++ );
                            V( b, o + ( b.e = p + l * h - 1 ) + 1, s, g );
                        } else {
                            b.e = l, b.r = +g;
                        }
                        return b;
                    };
                }();


                // Regular expressions for number parsing.
                A = /^(-?)0([xbo])(?=\w[\w.]*$)/i, // Hex, binary, octal prefix.
                    x = /^([^.]+)\.$/,                  // Trailing decimal point.
                    S = /^\.([^.]+)$/,                  // Leading decimal point.
                    _ = /^-?(Infinity|NaN)$/,           // Infinity/NaN.
                    P = /^\s*\+(?=[\w.])|^\s+|\s+$/g,   // Whitespace and leading plus.


                    /**
                     * Internal function to handle invalid number strings.
                     * @param {BigNumber} e - The BigNumber instance.
                     * @param {string} r - The invalid string.
                     * @param {boolean} n - True if it was a number primitive.
                     * @param {number} [t] - The base.
                     */
                    i = function ( e, r, n, t ) {
                        var i, o = n ? r : r.replace( P, "" );

                        if ( _.test( o ) ) {
                            e.s = isNaN( o ) ? null : o < 0 ? -1 : 1;
                        } else {
                            if ( !n && ( o = o.replace( A, function ( e, r, n ) {
                                return i = "x" == ( n = n.toLowerCase() ) ? 16 : "b" == n ? 2 : 8, t && t != i ? e : r;
                            } ), t && ( i = t, o = o.replace( x, "$1" ).replace( S, "0.$1" ) ), r != o ) ) {
                                return new k( o, i );
                            }
                            if ( k.DEBUG ) {
                                throw Error( c + "Not a" + ( t ? " base " + t : "" ) + " number: " + r );
                            }
                            e.s = null;
                        }
                        e.c = e.e = null;
                    };


                // Prototype methods for BigNumber.

                /**
                 * Returns the absolute value of the BigNumber.
                 * @returns {BigNumber}
                 */
                M.absoluteValue = M.abs = function () {
                    var e = new k( this );
                    return e.s < 0 && ( e.s = 1 ), e;
                };


                /**
                 * Compares this BigNumber to another value.
                 * @param {number|string|BigNumber} e - The value to compare with.
                 * @param {number} [r] - The base of the value.
                 * @returns {number} -1 if less, 0 if equal, 1 if greater.
                 */
                M.comparedTo = function ( e, r ) {
                    return b( this, new k( e, r ) );
                };


                /**
                 * Returns the number of decimal places of the BigNumber.
                 * @param {number} [e] - Number of decimal places to set.
                 * @param {number} [r] - Rounding mode.
                 * @returns {number|BigNumber} The number of decimal places or a new BigNumber.
                 */
                M.decimalPlaces = M.dp = function ( e, r ) {
                    var n, t, i, o = this;

                    if ( null != e ) {
                        return y( e, 0, w ), null == r ? r = B : y( r, 0, 8 ), V( new k( o ), e + o.e + 1, r );
                    }

                    if ( !( n = o.c ) ) {
                        return null;
                    }

                    if ( t = ( ( i = n.length - 1 ) - m( this.e / h ) ) * h, i = n[i] ) {
                        for ( ; i % 10 == 0; i /= 10, t-- );
                    }
                    return t < 0 && ( t = 0 ), t;
                };


                /**
                 * Divides this BigNumber by another value.
                 * @param {number|string|BigNumber} e - The divisor.
                 * @param {number} [r] - The base of the divisor.
                 * @returns {BigNumber} The quotient.
                 */
                M.dividedBy = M.div = function ( e, r ) {
                    return n( this, new k( e, r ), D, B );
                };


                /**
                 * Divides this BigNumber by another value and returns the integer part of the quotient.
                 * @param {number|string|BigNumber} e - The divisor.
                 * @param {number} [r] - The base of the divisor.
                 * @returns {BigNumber} The integer quotient.
                 */
                M.dividedToIntegerBy = M.idiv = function ( e, r ) {
                    return n( this, new k( e, r ), 0, 1 );
                };


                /**
                 * Raises this BigNumber to the power of an exponent.
                 * @param {number|string|BigNumber} e - The exponent.
                 * @param {number|string|BigNumber} [r] - A modulus.
                 * @returns {BigNumber} The result.
                 */
                M.exponentiatedBy = M.pow = function ( e, r ) {
                    var n, t, i, o, s, l, a, p, g = this;

                    // Exponent must be an integer.
                    if ( ( e = new k( e ) ).c && !e.isInteger() ) {
                        throw Error( c + "Exponent not an integer: " + W( e ) );
                    }

                    // Handle modulus if provided.
                    if ( null != r && ( r = new k( r ) ), s = e.e > 14, !g.c || !g.c[0] || 1 == g.c[0] && !g.e && 1 == g.c.length || !e.c || !e.c[0] ) {
                        // Special cases for 0, 1, NaN, Infinity.
                        return p = new k( Math.pow( +W( g ), s ? 2 - O( e ) : +W( e ) ) ), r ? p.mod( r ) : p;
                    }

                    // Handle negative exponent.
                    if ( l = e.s < 0, r ) {
                        if ( r.c ? !r.c[0] : !r.s ) {
                            return new k( NaN );
                        }
                        ( t = !l && g.isInteger() && r.isInteger() ) && ( g = g.mod( r ) );
                    } else {
                        // Handle large exponents.
                        if ( e.e > 9 && ( g.e > 0 || g.e < -1 || ( 0 == g.e ? g.c[0] > 1 || s && g.c[1] >= 24e7 : g.c[0] < 8e13 || s && g.c[0] <= 9999975e7 ) ) ) {
                            return o = g.s < 0 && O( e ) ? -0 : 0, g.e > -1 && ( o = 1 / o ), new k( l ? 1 / o : o );
                        }
                        q && ( o = u( q / h + 2 ) );
                    }

                    // Binary exponentiation (power by squaring).
                    for ( s ? ( n = new k( .5 ), l && ( e.s = 1 ), a = O( e ) ) : a = ( i = Math.abs( +W( e ) ) ) % 2, p = new k( R ); ; ) {
                        if ( a ) {
                            if ( !( p = p.times( g ) ).c ) {
                                break;
                            }
                            o ? p.c.length > o && ( p.c.length = o ) : t && ( p = p.mod( r ) );
                        }

                        if ( i ) {
                            if ( 0 === ( i = f( i / 2 ) ) ) {
                                break;
                            }
                            a = i % 2;
                        } else if ( V( e = e.times( n ), e.e + 1, 1 ), e.e > 14 ) {
                            a = O( e );
                        } else {
                            if ( 0 == ( i = +W( e ) ) ) {
                                break;
                            }
                            a = i % 2;
                        }
                        g = g.times( g ), o ? g.c && g.c.length > o && ( g.c.length = o ) : t && ( g = g.mod( r ) );
                    }

                    return t ? p : ( l && ( p = R.div( p ) ), r ? p.mod( r ) : o ? V( p, q, B, void 0 ) : p );
                };


                /**
                 * Returns the integer part of the BigNumber.
                 * @param {number} [e] - Rounding mode.
                 * @returns {BigNumber} The integer part.
                 */
                M.integerValue = function ( e ) {
                    var r = new k( this );
                    return null == e ? e = B : y( e, 0, 8 ), V( r, r.e + 1, e );
                };


                /**
                 * Checks if this BigNumber is equal to another value.
                 * @param {number|string|BigNumber} e - The value to compare with.
                 * @param {number} [r] - The base of the value.
                 * @returns {boolean} True if equal, false otherwise.
                 */
                M.isEqualTo = M.eq = function ( e, r ) {
                    return 0 === b( this, new k( e, r ) );
                };


                /**
                 * Checks if this BigNumber is finite.
                 * @returns {boolean} True if finite, false otherwise.
                 */
                M.isFinite = function () {
                    return !!this.c;
                };


                /**
                 * Checks if this BigNumber is greater than another value.
                 * @param {number|string|BigNumber} e - The value to compare with.
                 * @param {number} [r] - The base of the value.
                 * @returns {boolean} True if greater, false otherwise.
                 */
                M.isGreaterThan = M.gt = function ( e, r ) {
                    return b( this, new k( e, r ) ) > 0;
                };


                /**
                 * Checks if this BigNumber is greater than or equal to another value.
                 * @param {number|string|BigNumber} e - The value to compare with.
                 * @param {number} [r] - The base of the value.
                 * @returns {boolean} True if greater than or equal, false otherwise.
                 */
                M.isGreaterThanOrEqualTo = M.gte = function ( e, r ) {
                    return 1 === ( r = b( this, new k( e, r ) ) ) || 0 === r;
                };


                /**
                 * Checks if this BigNumber is an integer.
                 * @returns {boolean} True if integer, false otherwise.
                 */
                M.isInteger = function () {
                    return !!this.c && m( this.e / h ) > this.c.length - 2;
                };


                /**
                 * Checks if this BigNumber is less than another value.
                 * @param {number|string|BigNumber} e - The value to compare with.
                 * @param {number} [r] - The base of the value.
                 * @returns {boolean} True if less, false otherwise.
                 */
                M.isLessThan = M.lt = function ( e, r ) {
                    return b( this, new k( e, r ) ) < 0;
                };


                /**
                 * Checks if this BigNumber is less than or equal to another value.
                 * @param {number|string|BigNumber} e - The value to compare with.
                 * @param {number} [r] - The base of the value.
                 * @returns {boolean} True if less than or equal, false otherwise.
                 */
                M.isLessThanOrEqualTo = M.lte = function ( e, r ) {
                    return -1 === ( r = b( this, new k( e, r ) ) ) || 0 === r;
                };


                /**
                 * Checks if this BigNumber is NaN.
                 * @returns {boolean} True if NaN, false otherwise.
                 */
                M.isNaN = function () {
                    return !this.s;
                };


                /**
                 * Checks if this BigNumber is negative.
                 * @returns {boolean} True if negative, false otherwise.
                 */
                M.isNegative = function () {
                    return this.s < 0;
                };


                /**
                 * Checks if this BigNumber is positive.
                 * @returns {boolean} True if positive, false otherwise.
                 */
                M.isPositive = function () {
                    return this.s > 0;
                };


                /**
                 * Checks if this BigNumber is zero.
                 * @returns {boolean} True if zero, false otherwise.
                 */
                M.isZero = function () {
                    return !!this.c && 0 == this.c[0];
                };


                /**
                 * Subtracts a value from this BigNumber.
                 * @param {number|string|BigNumber} e - The value to subtract.
                 * @param {number} [r] - The base of the value.
                 * @returns {BigNumber} The difference.
                 */
                M.minus = function ( e, r ) {
                    var n, t, i, o, s = this, u = s.s;

                    if ( r = ( e = new k( e, r ) ).s, !u || !r ) {
                        return new k( NaN );
                    }

                    // If signs are different, convert to addition.
                    if ( u != r ) {
                        return e.s = -r, s.plus( e );
                    }

                    // Handle zero and NaN cases.
                    var f = s.e / h, c = e.e / h, l = s.c, p = e.c;
                    if ( !f || !c ) {
                        if ( !l || !p ) {
                            return l ? ( e.s = -r, e ) : new k( p ? s : NaN );
                        }
                        if ( !l[0] || !p[0] ) {
                            return p[0] ? ( e.s = -r, e ) : new k( l[0] ? s : 3 == B ? -0 : 0 );
                        }
                    }

                    // Align exponents and perform subtraction.
                    if ( f = m( f ), c = m( c ), l = l.slice(), u = f - c ) {
                        for ( ( o = u < 0 ) ? ( u = -u, i = l ) : ( c = f, i = p ), i.reverse(), r = u; r--; i.push( 0 ) );
                        i.reverse();
                    } else {
                        for ( t = ( o = ( u = l.length ) < ( r = p.length ) ) ? u : r, u = r = 0; r < t; r++ ) {
                            if ( l[r] != p[r] ) {
                                o = l[r] < p[r];
                                break;
                            }
                        }
                    }

                    // Ensure the larger number is subtracted from the smaller one (absolute value).
                    if ( o && ( i = l, l = p, p = i, e.s = -e.s ), ( r = ( t = p.length ) - ( n = l.length ) ) > 0 ) {
                        for ( ; r--; l[n++] = 0 );
                    }

                    for ( r = a - 1; t > u; ) {
                        if ( l[--t] < p[t] ) {
                            for ( n = t; n && !l[--n]; l[n] = r );
                            --l[n], l[t] += a;
                        }
                        l[t] -= p[t];
                    }

                    // Remove leading zeros and normalize.
                    for ( ; 0 == l[0]; l.splice( 0, 1 ), --c );

                    return l[0] ? H( e, l, c ) : ( e.s = 3 == B ? -1 : 1, e.c = [ e.e = 0 ], e );
                };


                /**
                 * Calculates the modulo of this BigNumber by another value.
                 * @param {number|string|BigNumber} e - The modulus.
                 * @param {number} [r] - The base of the modulus.
                 * @returns {BigNumber} The remainder.
                 */
                M.modulo = M.mod = function ( e, r ) {
                    var t, i, o = this;

                    if ( e = new k( e, r ), !o.c || !e.s || e.c && !e.c[0] ) {
                        return new k( NaN );
                    }

                    if ( !e.c || o.c && !o.c[0] ) {
                        return new k( o );
                    }

                    // Apply modulo mode.
                    return 9 == j ? ( i = e.s, e.s = 1, t = n( o, e, 0, 3 ), e.s = i, t.s *= i ) : t = n( o, e, 0, j ), ( e = o.minus( t.times( e ) ) ).c[0] || 1 != j || ( e.s = o.s ), e;
                };


                /**
                 * Multiplies this BigNumber by another value.
                 * @param {number|string|BigNumber} e - The multiplier.
                 * @param {number} [r] - The base of the multiplier.
                 * @returns {BigNumber} The product.
                 */
                M.multipliedBy = M.times = function ( e, r ) {
                    var n, t, i, o, s, u, f, c, l, p, g, w, v, b, y, O = this, N = O.c, E = ( e = new k( e, r ) ).c;

                    if ( !( N && E && N[0] && E[0] ) ) {
                        // Handle NaN, Infinity, and zero cases.
                        return !O.s || !e.s || N && !N[0] && !E || E && !E[0] && !N ? e.c = e.e = e.s = null : ( e.s *= O.s, N && E ? ( e.c = [ 0 ], e.e = 0 ) : e.c = e.e = null ), e;
                    }

                    // Calculate exponent and sign.
                    for ( t = m( O.e / h ) + m( e.e / h ), e.s *= O.s, ( f = N.length ) < ( p = E.length ) && ( v = N, N = E, E = v, i = f, f = p, p = i ), i = f + p, v = []; i--; v.push( 0 ) );

                    // Perform multiplication (Karatsuba-like for large numbers).
                    for ( b = a, y = d, i = p; --i >= 0; ) {
                        for ( n = 0, g = E[i] % y, w = E[i] / y | 0, o = i + ( s = f ); o > i; ) {
                            n = ( ( c = g * ( c = N[--s] % y ) + ( u = w * c + ( l = N[s] / y | 0 ) * g ) % y * y + v[o] + n ) / b | 0 ) + ( u / y | 0 ) + w * l, v[o--] = c % b;
                        }
                        v[o] = n;
                    }

                    // Normalize and set the result.
                    return n ? ++t : v.splice( 0, 1 ), H( e, v, t );
                };


                /**
                 * Returns the negated value of this BigNumber.
                 * @returns {BigNumber}
                 */
                M.negated = function () {
                    var e = new k( this );
                    return e.s = -e.s || null, e;
                };


                /**
                 * Adds a value to this BigNumber.
                 * @param {number|string|BigNumber} e - The value to add.
                 * @param {number} [r] - The base of the value.
                 * @returns {BigNumber} The sum.
                 */
                M.plus = function ( e, r ) {
                    var n, t = this, i = t.s;

                    if ( r = ( e = new k( e, r ) ).s, !i || !r ) {
                        return new k( NaN );
                    }

                    // If signs are different, convert to subtraction.
                    if ( i != r ) {
                        return e.s = -r, t.minus( e );
                    }

                    // Handle zero and NaN cases.
                    var o = t.e / h, s = e.e / h, u = t.c, f = e.c;
                    if ( !o || !s ) {
                        if ( !u || !f ) {
                            return new k( i / 0 );
                        }
                        if ( !u[0] || !f[0] ) {
                            return f[0] ? e : new k( u[0] ? t : 0 * i );
                        }
                    }

                    // Align exponents and perform addition.
                    if ( o = m( o ), s = m( s ), u = u.slice(), i = o - s ) {
                        for ( i > 0 ? ( s = o, n = f ) : ( i = -i, n = u ), n.reverse(); i--; n.push( 0 ) );
                        n.reverse();
                    }

                    for ( ( i = u.length ) - ( r = f.length ) < 0 && ( n = f, f = u, u = n, r = i ), i = 0; r; ) {
                        i = ( u[--r] = u[r] + f[r] + i ) / a | 0, u[r] = a === u[r] ? 0 : u[r] % a;
                    }

                    // Handle carry and normalize.
                    return i && ( u = [ i ].concat( u ), ++s ), H( e, u, s );
                };


                /**
                 * Returns the precision (number of significant digits) of the BigNumber.
                 * @param {number|boolean} [e] - Precision to set or whether to include trailing zeros.
                 * @param {number} [r] - Rounding mode.
                 * @returns {number|BigNumber} The precision or a new BigNumber.
                 */
                M.precision = M.sd = function ( e, r ) {
                    var n, t, i, o = this;

                    if ( null != e && e !== !!e ) {
                        return y( e, 1, w ), null == r ? r = B : y( r, 0, 8 ), V( new k( o ), e, r );
                    }

                    if ( !( n = o.c ) ) {
                        return null;
                    }

                    if ( t = ( i = n.length - 1 ) * h + 1, i = n[i] ) {
                        for ( ; i % 10 == 0; i /= 10, t-- );
                        for ( i = n[0]; i >= 10; i /= 10, t++ );
                    }

                    return e && o.e + 1 > t && ( t = o.e + 1 ), t;
                };


                /**
                 * Multiplies this BigNumber by a power of 10.
                 * @param {number} e - The exponent.
                 * @returns {BigNumber} The shifted BigNumber.
                 */
                M.shiftedBy = function ( e ) {
                    return y( e, -p, p ), this.times( "1e" + e );
                };


                /**
                 * Calculates the square root of this BigNumber.
                 * @returns {BigNumber} The square root.
                 */
                M.squareRoot = M.sqrt = function () {
                    var e, r, t, i, o, s = this, u = s.c, f = s.s, c = s.e, l = D + 4, a = new k( "0.5" );

                    // Handle negative, NaN, and zero cases.
                    if ( 1 !== f || !u || !u[0] ) {
                        return new k( !f || f < 0 && ( !u || u[0] ) ? NaN : u ? s : 1 / 0 );
                    }

                    if ( 0 == ( f = Math.sqrt( +W( s ) ) ) || f == 1 / 0 ) {
                        // Estimate initial value for very large/small numbers.
                        ( ( ( r = v( u ) ).length + c ) % 2 == 0 && ( r += "0" ), f = Math.sqrt( +r ), c = m( ( c + 1 ) / 2 ) - ( c < 0 || c % 2 ), t = new k( r = f == 1 / 0 ? "1e" + c : ( r = f.toExponential() ).slice( 0, r.indexOf( "e" ) + 1 ) + c ) );
                    } else {
                        t = new k( f + "" );
                    }

                    // Newton's method for square root.
                    if ( t.c[0] ) {
                        for ( ( f = ( c = t.e ) + l ) < 3 && ( f = 0 ); ; ) {
                            if ( o = t, t = a.times( o.plus( n( s, o, l, 1 ) ) ), v( o.c ).slice( 0, f ) === ( r = v( t.c ) ).slice( 0, f ) ) {
                                if ( t.e < c && --f, "9999" != ( r = r.slice( f - 3, f + 1 ) ) && ( i || "4999" != r ) ) {
                                    +r && ( +r.slice( 1 ) || "5" != r.charAt( 0 ) ) || ( V( t, t.e + D + 2, 1 ), e = !t.times( t ).eq( s ) );
                                    break;
                                }
                                if ( !i && ( V( o, o.e + D + 2, 0 ), o.times( o ).eq( s ) ) ) {
                                    t = o;
                                    break;
                                }
                                l += 4, f += 4, i = 1;
                            }
                        }
                    }
                    return V( t, t.e + D + 1, B, e );
                };


                /**
                 * Converts this BigNumber to exponential notation.
                 * @param {number} [e] - Number of significant digits.
                 * @param {number} [r] - Rounding mode.
                 * @returns {string} The exponential string.
                 */
                M.toExponential = function ( e, r ) {
                    return null != e && ( y( e, 0, w ), e++ ), z( this, e, r, 1 );
                };


                /**
                 * Converts this BigNumber to fixed-point notation.
                 * @param {number} [e] - Number of decimal places.
                 * @param {number} [r] - Rounding mode.
                 * @returns {string} The fixed-point string.
                 */
                M.toFixed = function ( e, r ) {
                    return null != e && ( y( e, 0, w ), e = e + this.e + 1 ), z( this, e, r );
                };


                /**
                 * Formats this BigNumber using a specified format object.
                 * @param {number} [e] - Number of decimal places.
                 * @param {number} [r] - Rounding mode.
                 * @param {object} [n] - Format object.
                 * @returns {string} The formatted string.
                 */
                M.toFormat = function ( e, r, n ) {
                    var t, i = this;

                    // Determine format object.
                    if ( null == n ) {
                        null != e && r && "object" == typeof r ? ( n = r, r = null ) : e && "object" == typeof e ? ( n = e, e = r = null ) : n = G;
                    } else if ( "object" != typeof n ) {
                        throw Error( c + "Argument not an object: " + n );
                    }

                    if ( t = i.toFixed( e, r ), i.c ) {
                        var o, s = t.split( "." ), u = +n.groupSize, f = +n.secondaryGroupSize, l = n.groupSeparator || "", a = s[0], h = s[1], p = i.s < 0, g = p ? a.slice( 1 ) : a, d = g.length;

                        if ( f && ( o = u, u = f, f = o, d -= o ), u > 0 && d > 0 ) {
                            for ( o = d % u || u, a = g.substr( 0, o ); o < d; o += u ) {
                                a += l + g.substr( o, u );
                            }
                            f > 0 && ( a += l + g.slice( o ) ), p && ( a = "-" + a );
                        }
                        t = h ? a + ( n.decimalSeparator || "" ) + ( ( f = +n.fractionGroupSize ) ? h.replace( new RegExp( "\\d{" + f + "}\\B", "g" ), "$&" + ( n.fractionGroupSeparator || "" ) ) : h ) : a;
                    }

                    return ( n.prefix || "" ) + t + ( n.suffix || "" );
                };


                /**
                 * Converts this BigNumber to a common fraction.
                 * @param {number|string|BigNumber} [e] - Maximum denominator.
                 * @returns {Array<BigNumber>} An array [numerator, denominator].
                 */
                M.toFraction = function ( e ) {
                    var r, t, i, o, s, u, f, l, a, p, d, w, m = this, b = m.c;

                    if ( null != e && ( !( f = new k( e ) ).isInteger() && ( f.c || 1 !== f.s ) || f.lt( R ) ) ) {
                        throw Error( c + "Argument " + ( f.isInteger() ? "out of range: " : "not an integer: " ) + W( f ) );
                    }

                    if ( !b ) {
                        return new k( m );
                    }

                    for ( r = new k( R ), a = t = new k( R ), i = l = new k( R ), w = v( b ), s = r.e = w.length - m.e - 1, r.c[0] = g[ ( u = s % h ) < 0 ? h + u : u ],
                        e = !e || f.comparedTo( r ) > 0 ? s > 0 ? r : a : f, u = U, U = 1 / 0, f = new k( w ), l.c[0] = 0;
                        p = n( f, r, 0, 1 ), 1 != ( o = t.plus( p.times( i ) ) ).comparedTo( e ); ) {
                        t = i, i = o, a = l.plus( p.times( o = a ) ), l = o, r = f.minus( p.times( o = r ) ), f = o;
                    }

                    return o = n( e.minus( t ), i, 0, 1 ), l = l.plus( o.times( a ) ), t = t.plus( o.times( i ) ), l.s = a.s = m.s,
                        d = n( a, i, s *= 2, B ).minus( m ).abs().comparedTo( n( l, t, s, B ).minus( m ).abs() ) < 1 ? [ a, i ] : [ l, t ], U = u, d;
                };


                /**
                 * Converts this BigNumber to a JavaScript number primitive.
                 * @returns {number} The numeric value.
                 */
                M.toNumber = function () {
                    return +W( this );
                };


                /**
                 * Converts this BigNumber to a string with a specified precision.
                 * @param {number} [e] - Number of significant digits.
                 * @param {number} [r] - Rounding mode.
                 * @returns {string} The precision string.
                 */
                M.toPrecision = function ( e, r ) {
                    return null != e && y( e, 1, w ), z( this, e, r, 2 );
                };


                /**
                 * Converts this BigNumber to a string.
                 * @param {number} [e] - The base of the output (2-36).
                 * @returns {string} The string representation.
                 */
                M.toString = function ( e ) {
                    var r, n = this, i = n.s, o = n.e;

                    if ( null === o ) {
                        return i ? ( r = "Infinity", i < 0 && ( r = "-" + r ) ) : r = "NaN", r;
                    }

                    // Format based on exponent or base.
                    return ( null == e ? r = o <= L || o >= T ? N( v( n.c ), o ) : E( v( n.c ), o, "0" ) : 10 === e ? r = E( v( ( n = V( new k( n ), D + o + 1, B ) ).c ), n.e, "0" ) : ( y( e, 2, F.length, "Base" ), r = t( E( v( n.c ), o, "0" ), 10, e, i, !0 ) ), i < 0 && n.c[0] && ( r = "-" + r ) ), r;
                };


                /**
                 * Returns the primitive value of the BigNumber.
                 * @returns {string} The string representation.
                 */
                M.valueOf = M.toJSON = function () {
                    return W( this );
                };

                // Internal flag to identify BigNumber instances.
                M._isBigNumber = !0;

                // Apply initial configuration if provided.
                null != r && k.set( r );

                return k;

            }() ).default = o.BigNumber = o,

                // Check for CommonJS/AMD environment and export.
                void 0 === ( t = function () {
                    return o;
                }.call( r, n, r, e ) ) || ( e.exports = t );

        }();
    }
] );