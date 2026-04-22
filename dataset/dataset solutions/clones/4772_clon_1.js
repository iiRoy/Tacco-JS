module.exports = function ( e ) {
    // This is the main module function, often used by webpack or similar bundlers.
    // It takes a modules object 'e' as an argument.

    var r = {}; // The cache for already loaded modules.

    /**
     * The require function for internal modules.
     * @param {string} t - The module ID.
     * @returns {*} The exported value of the module.
     */
    function n( t ) {
        if ( r[t] ) {
            return r[t].exports; // Return from cache if module is already loaded.
        }

        // Create a new module (and put it into the cache).
        var i = r[t] = {
            i: t, // module ID
            l: !1, // loaded flag
            exports: {} // empty exports object
        };

        // Execute the module function.
        // e[t] is the actual module definition function.
        e[t].call( i.exports, i, i.exports, n );

        i.l = !0; // Mark module as loaded.

        return i.exports; // Return the module's exports.
    }

    // Assign properties to the 'n' (require) function.
    // These are often webpack-specific helper functions.

    n.m = e; // Store all module definitions.
    n.c = r; // Store the module cache.

    // Define property getter for compatibility with non-ES modules.
    n.d = function ( e, r, t ) {
        if ( !n.o( e, r ) ) {
            Object.defineProperty( e, r, {
                enumerable: !0,
                get: t
            } );
        }
    };

    // Define __esModule on exports.
    n.r = function ( e ) {
        if ( "undefined" != typeof Symbol && Symbol.toStringTag ) {
            Object.defineProperty( e, Symbol.toStringTag, {
                value: "Module"
            } );
        }

        Object.defineProperty( e, "__esModule", {
            value: !0
        } );
    };

    // Create a fake namespace object.
    // mode & 1: value is a module id, require it
    // mode & 8: return the value directly
    // mode & 4: return value for invalid module
    // mode & 2: merge all properties of value into the ns
    n.t = function ( e, r ) {
        if ( 1 & r ) {
            e = n( e );
        }

        if ( 8 & r ) {
            return e;
        }

        if ( 4 & r && "object" == typeof e && e && e.__esModule ) {
            return e;
        }

        var t = Object.create( null ); // Create a new empty object.

        n.r( t ); // Mark it as an ES module.

        Object.defineProperty( t, "default", {
            enumerable: !0,
            value: e
        } );

        if ( 2 & r && "string" != typeof e ) {
            for ( var i in e ) {
                n.d( t, i, ( function ( r ) {
                    return e[r];
                } ).bind( null, i ) );
            }
        }

        return t;
    };

    // Get default export if it exists, otherwise return the module itself.
    // Used for compatibility with CommonJS modules.
    n.n = function ( e ) {
        var r = e && e.__esModule ?
            function () {
                return e.default;
            } :
            function () {
                return e;
            };

        n.d( r, "a", r ); // Add a getter for 'a' property.

        return r;
    };

    // Check if property 'r' exists on object 'e'.
    n.o = function ( e, r ) {
        return Object.prototype.hasOwnProperty.call( e, r );
    };

    n.p = ""; // Public path for assets.

    // Load the entry module (module ID 0).
    return n( n.s = 0 );

} ( [

    // Module definitions start here.
    // This is the first module (index 0).
    function ( e, r, n ) {
        // Module 0: Reads from stdin and processes it.
        // It calls module 1 with the lines read from standard input.
        n( 1 ) ( n( 3 ).readFileSync( "/dev/stdin", "UTF-8" ).split( "\n" ) );
    },

    // Module 1: Contains the main logic for calculations.
    function ( e, r, n ) {

        /**
         * Helper function for destructuring non-iterable instances.
         * @param {Array} e - The array-like object to destructure.
         * @param {number} r - The expected number of elements.
         * @returns {Array} The destructured array.
         */
        function t( e, r ) {
            return ( function ( e ) {
                if ( Array.isArray( e ) ) {
                    return e;
                }
            } ) ( e ) || ( function ( e, r ) {
                var n = [],
                    t = !0,
                    i = !1,
                    o = void 0;
                try {
                    for ( var u, f = e[Symbol.iterator](); !( t = ( u = f.next() ).done ) && ( n.push( u.value ), !r || n.length !== r ); t = !0 );
                } catch ( e ) {
                    i = !0, o = e;
                } finally {
                    try {
                        if ( !t && null != f.return ) {
                            f.return();
                        }
                    } finally {
                        if ( i ) {
                            throw o;
                        }
                    }
                }
                return n;
            } ) ( e, r ) || ( function () {
                throw new TypeError( "Invalid attempt to destructure non-iterable instance" );
            } ) ();
        }

        var i = n( 2 ); // Import BigNumber library (module 2).

        e.exports = function ( e ) {
            // Parse the first line of input.
            // e[0] contains space-separated numbers: n, o, u
            var r = t( e[0].split( " " ).map( function ( e ) {
                return Number( e );
            } ), 3 ),
                n = r[0], // n: number of items
                o = r[1], // o: cost per unit distance
                u = r[2]; // u: maximum cost per item

            // Parse the second line of input (item positions).
            // e[1] contains space-separated numbers: f[0], f[1], ..., f[n-1]
            var f = e[1].split( " " ).map( function ( e ) {
                return Number( e );
            } );

            var s = new i( 0 ); // Initialize total cost as BigNumber(0).

            // Loop through items to calculate costs between consecutive items.
            for ( var l = 0; l < n - 1; l++ ) {
                var c = f[l + 1] - f[l]; // Distance between current item (f[l]) and next item (f[l+1]).
                var a = new i( o ).times( c ); // Calculate cost for this segment: distance * cost_per_unit.

                // Compare calculated cost with the maximum allowed cost per item.
                // Add the minimum of the two to the total cost.
                // 1 == a.comparedTo(u) means a > u.
                s = 1 == a.comparedTo( u ) ? s.plus( u ) : s.plus( a );
            }

            console.log( s.toString() ); // Output the final total cost as a string.
        };
    },

    // Module 2: The BigNumber.js library.
    // This is a comprehensive arbitrary-precision decimal arithmetic library.
    function ( e, r, n ) {
        var t;
        ! function ( i ) {
            "use strict";

            var o,
                u = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i, // Regex for validating numeric strings.
                f = Math.ceil, // Shorthand for Math.ceil.
                s = Math.floor, // Shorthand for Math.floor.
                l = "[BigNumber Error] ", // Error prefix.
                c = l + "Number primitive has more than 15 significant digits: ", // Specific error message.
                a = 1e14, // Base for internal calculations (10^14), chosen for performance.
                h = 14, // Number of digits per array element (log10(a)).
                p = 9007199254740991, // Max safe integer in JavaScript (2^53 - 1).
                g = [
                    1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13
                ], // Powers of 10 for digit manipulation.
                d = 1e7, // A constant used in division, roughly sqrt(a).
                w = 1e9; // Max value for some configuration settings.

            /**
             * Floors a number, handling negative numbers correctly (e.g., -0.5 -> -1).
             * @param {number} e - The number to floor.
             * @returns {number} The floored integer.
             */
            function m( e ) {
                var r = 0 | e;
                return e > 0 || e === r ? r : r - 1;
            }

            /**
             * Converts the internal coefficient array to a string representation.
             * @param {Array<number>} e - The coefficient array.
             * @returns {string} The string representation of the number (without sign or exponent).
             */
            function v( e ) {
                for ( var r, n, t = 1, i = e.length, o = e[0] + ""; t < i; ) {
                    for ( r = e[t++] + "", n = h - r.length; n--; r = "0" + r );
                    o += r;
                }
                for ( i = o.length; 48 === o.charCodeAt( --i ); ); // Remove trailing zeros.
                return o.slice( 0, i + 1 || 1 ); // Ensure at least '0' is returned.
            }

            /**
             * Compares two BigNumber instances.
             * @param {BigNumber} e - The first BigNumber.
             * @param {BigNumber} r - The second BigNumber.
             * @returns {number|null} -1 if e < r, 0 if e == r, 1 if e > r, null if NaN.
             */
            function y( e, r ) {
                var n, t, i = e.c,
                    o = r.c,
                    u = e.s,
                    f = r.s,
                    s = e.e,
                    l = r.e;

                if ( !u || !f ) {
                    return null; // One or both are NaN.
                }

                if ( n = i && !i[0], t = o && !o[0], n || t ) {
                    return n ? t ? 0 : -f : u; // Handle zero values.
                }

                if ( u != f ) {
                    return u; // Different signs.
                }

                if ( n = u < 0, t = s == l, !i || !o ) {
                    return t ? 0 : !i ^ n ? 1 : -1; // One or both are Infinity.
                }

                if ( !t ) {
                    return s > l ^ n ? 1 : -1; // Different exponents.
                }

                for ( f = ( s = i.length ) < ( l = o.length ) ? s : l, u = 0; u < f; u++ ) {
                    if ( i[u] != o[u] ) {
                        return i[u] > o[u] ^ n ? 1 : -1; // Compare coefficients.
                    }
                }

                return s == l ? 0 : s > l ^ n ? 1 : -1; // One is a prefix of the other.
            }

            /**
             * Throws an error if a number is out of range or not an integer.
             * @param {number} e - The number to check.
             * @param {number} r - Lower bound.
             * @param {number} n - Upper bound.
             * @param {string} [t] - Argument name for error message.
             */
            function b( e, r, n, t ) {
                if ( e < r || e > n || e !== s( e ) ) {
                    throw Error( l + ( t || "Argument" ) + ( "number" == typeof e ? e < r || e > n ? " out of range: " : " not an integer: " : " not a primitive number: " ) + String( e ) );
                }
            }

            /**
             * Checks if a BigNumber represents an odd integer.
             * @param {BigNumber} e - The BigNumber instance.
             * @returns {boolean} True if odd, false otherwise.
             */
            function O( e ) {
                var r = e.c.length - 1;
                return m( e.e / h ) == r && e.c[r] % 2 != 0;
            }

            /**
             * Formats a number string into exponential notation.
             * @param {string} e - The number string.
             * @param {number} r - The exponent.
             * @returns {string} The exponential string.
             */
            function N( e, r ) {
                return ( e.length > 1 ? e.charAt( 0 ) + "." + e.slice( 1 ) : e ) + ( r < 0 ? "e" : "e+" ) + r;
            }

            /**
             * Formats a number string with a decimal point at a specific position.
             * @param {string} e - The number string.
             * @param {number} r - The exponent (position of decimal point).
             * @param {string} n - The character to pad with (usually '0').
             * @returns {string} The formatted string.
             */
            function E( e, r, n ) {
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

            ( o = function e( r ) {
                var n, t, i, o, A, S, x, _, P, R = q.prototype = {
                        constructor: q,
                        toString: null,
                        valueOf: null
                    },
                    T = new q( 1 ), // BigNumber(1) constant.
                    D = 20, // DECIMAL_PLACES: default number of decimal places.
                    B = 4, // ROUNDING_MODE: default rounding mode (ROUND_HALF_UP).
                    L = -7, // EXPONENTIAL_AT lower bound: numbers < 10^L use exponential notation.
                    U = 21, // EXPONENTIAL_AT upper bound: numbers >= 10^U use exponential notation.
                    I = -1e7, // RANGE lower bound: minimum exponent value.
                    M = 1e7, // RANGE upper bound: maximum exponent value.
                    C = !1, // CRYPTO: use crypto.getRandomValues for random numbers.
                    j = 1, // MODULO_MODE: default modulo mode (ROUND_DOWN).
                    F = 0, // POW_PRECISION: precision for power operations.
                    G = { // FORMAT: default formatting options.
                        prefix: "",
                        groupSize: 3,
                        secondaryGroupSize: 0,
                        groupSeparator: ",",
                        decimalSeparator: ".",
                        fractionGroupSize: 0,
                        fractionGroupSeparator: " ",
                        suffix: ""
                    },
                    k = "0123456789abcdefghijklmnopqrstuvwxyz"; // ALPHABET for base conversions.

                /**
                 * BigNumber constructor.
                 * Creates a new BigNumber instance from a value.
                 * @param {number|string|BigNumber} e - The value to convert.
                 * @param {number} [r] - The base of the value if it's a string (2-36).
                 */
                function q( e, r ) {
                    var n, o, f, l, a, g, d, w, m = this;

                    // Ensure 'new' keyword is used.
                    if ( !( m instanceof q ) ) {
                        return new q( e, r );
                    }

                    // Handle cloning an existing BigNumber instance.
                    if ( null == r ) {
                        if ( e && !0 === e._isBigNumber ) {
                            return m.s = e.s, void ( !e.c || e.e > M ? m.c = m.e = null : e.e < I ? m.c = [ m.e = 0 ] : ( m.e = e.e, m.c = e.c.slice() ) );
                        }

                        // Handle number primitive input.
                        if ( ( g = "number" == typeof e ) && 0 * e == 0 ) {
                            if ( m.s = 1 / e < 0 ? ( e = -e, -1 ) : 1, e === ~~e ) { // Check if integer.
                                for ( l = 0, a = e; a >= 10; a /= 10, l++ );
                                return void ( l > M ? m.c = m.e = null : ( m.e = l, m.c = [ e ] ) );
                            }
                            w = String( e );
                        } else {
                            // Handle string input (base 10).
                            if ( !u.test( w = String( e ) ) ) {
                                return i( m, w, g ); // Invalid number format.
                            }
                            m.s = 45 == w.charCodeAt( 0 ) ? ( w = w.slice( 1 ), -1 ) : 1; // Determine sign.
                        }

                        // Parse decimal point and exponent.
                        ( l = w.indexOf( "." ) ) > -1 && ( w = w.replace( ".", "" ) );
                        ( a = w.search( /e/i ) ) > 0 ? ( l < 0 && ( l = a ), l += +w.slice( a + 1 ), w = w.substring( 0, a ) ) : l < 0 && ( l = w.length );

                    } else {
                        // Handle string input with a specified base.
                        b( r, 2, k.length, "Base" ); // Validate base.

                        if ( 10 == r ) {
                            return V( m = new q( e ), D + m.e + 1, B ); // If base 10, just parse normally and round.
                        }

                        w = String( e );
                        g = "number" == typeof e;

                        if ( g ) {
                            if ( 0 * e != 0 ) {
                                return i( m, w, g, r );
                            }
                            m.s = 1 / e < 0 ? ( w = w.slice( 1 ), -1 ) : 1;
                            if ( q.DEBUG && w.replace( /^0\.0*|\./, "" ).length > 15 ) {
                                throw Error( c + e ); // Warn about precision loss.
                            }
                        } else {
                            m.s = 45 === w.charCodeAt( 0 ) ? ( w = w.slice( 1 ), -1 ) : 1;
                        }

                        // Validate characters for the given base.
                        for ( n = k.slice( 0, r ), l = a = 0, d = w.length; a < d; a++ ) {
                            if ( n.indexOf( o = w.charAt( a ) ) < 0 ) {
                                if ( "." == o ) {
                                    if ( a > l ) {
                                        l = d;
                                        continue;
                                    }
                                } else if ( !f && ( w == w.toUpperCase() && ( w = w.toLowerCase() ) || w == w.toLowerCase() && ( w = w.toUpperCase() ) ) ) {
                                    f = !0, a = -1, l = 0;
                                    continue;
                                }
                                return i( m, String( e ), g, r ); // Invalid character for base.
                            }
                        }

                        g = !1;
                        // Convert from base 'r' to base 10 (internal representation).
                        ( l = ( w = t( w, r, 10, m.s ) ).indexOf( "." ) ) > -1 ? w = w.replace( ".", "" ) : l = w.length;
                    }

                    // Remove leading/trailing zeros and convert to internal coefficient array.
                    for ( a = 0; 48 === w.charCodeAt( a ); a++ ); // Skip leading zeros.
                    for ( d = w.length; 48 === w.charCodeAt( --d ); ); // Skip trailing zeros.

                    if ( w = w.slice( a, ++d ) ) {
                        if ( d -= a, g && q.DEBUG && d > 15 && ( e > p || e !== s( e ) ) ) {
                            throw Error( c + m.s * e ); // Warn about precision loss for number primitives.
                        }

                        if ( ( l = l - a - 1 ) > M ) {
                            m.c = m.e = null; // Too large, set to Infinity.
                        } else if ( l < I ) {
                            m.c = [ m.e = 0 ]; // Too small, set to 0.
                        } else {
                            // Convert string to coefficient array.
                            if ( m.e = l, m.c = [], a = ( l + 1 ) % h, l < 0 && ( a += h ), a < d ) {
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
                        m.c = [ m.e = 0 ]; // Value is 0.
                    }
                }

                /**
                 * Formats a BigNumber to a string representation, possibly with rounding.
                 * This is a core formatting utility used by toExponential, toFixed, toPrecision.
                 * @param {BigNumber} e - The BigNumber instance.
                 * @param {number} r - Decimal places or significant digits.
                 * @param {number} n - Rounding mode.
                 * @param {number} t - Formatting type (1 for exponential, 2 for fixed, 0 for general).
                 * @returns {string} The formatted string.
                 */
                function $( e, r, n, t ) {
                    var i, o, u, f, s;
                    if ( null == n ? n = B : b( n, 0, 8 ), !e.c ) {
                        return e.toString(); // Handle NaN/Infinity.
                    }

                    if ( i = e.c[0], u = e.e, null == r ) {
                        s = v( e.c );
                        s = 1 == t || 2 == t && ( u <= L || u >= U ) ? N( s, u ) : E( s, u, "0" );
                    } else if ( o = ( e = V( new q( e ), r, n ) ).e, f = ( s = v( e.c ) ).length, 1 == t || 2 == t && ( r <= o || o <= L ) ) {
                        for ( ; f < r; s += "0", f++ ); // Pad with zeros if needed.
                        s = N( s, o );
                    } else if ( r -= u, s = E( s, o, "0" ), o + 1 > f ) {
                        if ( --r > 0 ) {
                            for ( s += "."; r--; s += "0" );
                        }
                    } else if ( ( r += o - f ) > 0 ) {
                        for ( o + 1 == f && ( s += "." ); r--; s += "0" );
                    }

                    return e.s < 0 && i ? "-" + s : s; // Add sign.
                }

                /**
                 * Helper to find the maximum or minimum BigNumber from a list.
                 * @param {Array<BigNumber>} e - Array-like object of BigNumber instances.
                 * @param {function} r - Comparison function (e.g., R.lt for max, R.gt for min).
                 * @returns {BigNumber} The max/min BigNumber.
                 */
                function z( e, r ) {
                    for ( var n, t = 1, i = new q( e[0] ); t < e.length; t++ ) {
                        if ( !( n = new q( e[t] ) ).s ) {
                            i = n; // If any is NaN, result is NaN.
                            break;
                        }
                        r.call( i, n ) && ( i = n ); // Update max/min if condition met.
                    }
                    return i;
                }

                /**
                 * Sets the exponent and coefficient array for a BigNumber, handling normalization.
                 * This is often called after arithmetic operations.
                 * @param {BigNumber} e - The BigNumber instance to modify.
                 * @param {Array<number>} r - The new coefficient array.
                 * @param {number} n - The new exponent.
                 * @returns {BigNumber} The modified BigNumber.
                 */
                function H( e, r, n ) {
                    for ( var t = 1, i = r.length; !r[--i]; r.pop() ); // Remove trailing zeros from coefficients.
                    for ( i = r[0]; i >= 10; i /= 10, t++ ); // Determine number of digits in first coefficient.
                    return ( n = t + n * h - 1 ) > M ? e.c = e.e = null : n < I ? e.c = [ e.e = 0 ] : ( e.e = n, e.c = r ), e;
                }

                /**
                 * Rounds a BigNumber to a specified number of decimal places or significant digits.
                 * This is a core rounding utility.
                 * @param {BigNumber} e - The BigNumber instance.
                 * @param {number} r - The target number of digits after which rounding occurs.
                 * @param {number} n - The rounding mode.
                 * @param {boolean} [t] - Optional boolean to force rounding up.
                 * @returns {BigNumber} The rounded BigNumber.
                 */
                function V( e, r, n, t ) {
                    var i, o, u, l, c, p, d, w = e.c,
                        m = g;

                    if ( w ) {
                        e: {
                            for ( i = 1, l = w[0]; l >= 10; l /= 10, i++ ); // Get number of digits in first coefficient.

                            if ( ( o = r - i ) < 0 ) { // Rounding within the first coefficient.
                                o += h, u = r, d = ( c = w[p = 0] ) / m[i - u - 1] % 10 | 0;
                            } else if ( ( p = f( ( o + 1 ) / h ) ) >= w.length ) { // Rounding beyond existing coefficients.
                                if ( !t ) break e; // No need to round if no extra digits and not forced.
                                for ( ; w.length <= p; w.push( 0 ) ); // Pad with zeros.
                                c = d = 0, i = 1, u = ( o %= h ) - h + 1;
                            } else { // Rounding in later coefficients.
                                for ( c = l = w[p], i = 1; l >= 10; l /= 10, i++ );
                                d = ( u = ( o %= h ) - h + i ) < 0 ? 0 : c / m[i - u - 1] % 10 | 0;
                            }

                            // Determine if rounding up is needed based on rounding mode and digit 'd'.
                            t = t || r < 0 || null != w[p + 1] || ( u < 0 ? c : c % m[i - u - 1] );
                            t = n < 4 ? ( d || t ) && ( 0 == n || n == ( e.s < 0 ? 3 : 2 ) ) : d > 5 || 5 == d && ( 4 == n || t || 6 == n && ( o > 0 ? u > 0 ? c / m[i - u] : 0 : w[p - 1] ) % 10 & 1 || n == ( e.s < 0 ? 8 : 7 ) );

                            if ( r < 1 || !w[0] ) { // If result is zero or less than 1 digit.
                                return w.length = 0, t ? ( r -= e.e + 1, w[0] = m[ ( h - r % h ) % h ], e.e = -r || 0 ) : w[0] = e.e = 0, e;
                            }

                            if ( 0 == o ? ( w.length = p, l = 1, p-- ) : ( w.length = p + 1, l = m[h - o], w[p] = u > 0 ? s( c / m[i - u] % m[u] ) * l : 0 ), t ) {
                                for ( ;; ) {
                                    if ( 0 == p ) { // If rounding caused a carry to a new leading digit.
                                        for ( o = 1, u = w[0]; u >= 10; u /= 10, o++ );
                                        for ( u = w[0] += l, l = 1; u >= 10; u /= 10, l++ );
                                        o != l && ( e.e++, w[0] == a && ( w[0] = 1 ) );
                                        break;
                                    }
                                    if ( w[p] += l, w[p] != a ) break; // Propagate carry.
                                    w[p--] = 0, l = 1;
                                }
                            }

                            for ( o = w.length; 0 === w[--o]; w.pop() ); // Remove any new trailing zeros.
                        }
                        e.e > M ? e.c = e.e = null : e.e < I && ( e.c = [ e.e = 0 ] ); // Check for overflow/underflow.
                    }
                    return e;
                }

                /**
                 * Converts a BigNumber instance to its full string representation (without formatting rules).
                 * Used internally to get a raw string from coefficients and exponent.
                 * @param {BigNumber} e - The BigNumber instance.
                 * @returns {string} The string representation.
                 */
                function W( e ) {
                    var r, n = e.e;
                    return null === n ? e.toString() : ( r = v( e.c ), r = n <= L || n >= U ? N( r, n ) : E( r, n, "0" ), e.s < 0 ? "-" + r : r );
                }

                q.clone = e; // Allow cloning the BigNumber factory.

                // Constants for rounding modes.
                q.ROUND_UP = 0;
                q.ROUND_DOWN = 1;
                q.ROUND_CEIL = 2;
                q.ROUND_FLOOR = 3;
                q.ROUND_HALF_UP = 4;
                q.ROUND_HALF_DOWN = 5;
                q.ROUND_HALF_EVEN = 6;
                q.ROUND_HALF_CEIL = 7;
                q.ROUND_HALF_FLOOR = 8;
                q.EUCLID = 9; // Modulo mode: Euclidean division.

                /**
                 * Configures BigNumber settings.
                 * Allows changing default decimal places, rounding mode, exponential thresholds, etc.
                 * @param {object} e - Configuration object with properties to set.
                 * @returns {object} The current configuration.
                 */
                q.config = q.set = function ( e ) {
                    var r, n;
                    if ( null != e ) {
                        if ( "object" != typeof e ) {
                            throw Error( l + "Object expected: " + e );
                        }

                        // Set DECIMAL_PLACES.
                        if ( e.hasOwnProperty( r = "DECIMAL_PLACES" ) && ( b( n = e[r], 0, w, r ), D = n ),
                            // Set ROUNDING_MODE.
                            e.hasOwnProperty( r = "ROUNDING_MODE" ) && ( b( n = e[r], 0, 8, r ), B = n ),
                            // Set EXPONENTIAL_AT.
                            e.hasOwnProperty( r = "EXPONENTIAL_AT" ) && ( ( n = e[r] ) && n.pop ? ( b( n[0], -w, 0, r ), b( n[1], 0, w, r ), L = n[0], U = n[1] ) : ( b( n, -w, w, r ), L = -( U = n < 0 ? -n : n ) ) ),
                            // Set RANGE.
                            e.hasOwnProperty( r = "RANGE" ) ) {
                            if ( ( n = e[r] ) && n.pop ) {
                                b( n[0], -w, -1, r ), b( n[1], 1, w, r ), I = n[0], M = n[1];
                            } else {
                                if ( b( n, -w, w, r ), !n ) {
                                    throw Error( l + r + " cannot be zero: " + n );
                                }
                                I = -( M = n < 0 ? -n : n );
                            }
                        }

                        // Set CRYPTO.
                        if ( e.hasOwnProperty( r = "CRYPTO" ) ) {
                            if ( ( n = e[r] ) !== !!n ) {
                                throw Error( l + r + " not true or false: " + n );
                            }
                            if ( n ) {
                                if ( "undefined" == typeof crypto || !crypto || !crypto.getRandomValues && !crypto.randomBytes ) {
                                    throw C = !n, Error( l + "crypto unavailable" );
                                }
                                C = n;
                            } else {
                                C = n;
                            }
                        }

                        // Set MODULO_MODE.
                        if ( e.hasOwnProperty( r = "MODULO_MODE" ) && ( b( n = e[r], 0, 9, r ), j = n ),
                            // Set POW_PRECISION.
                            e.hasOwnProperty( r = "POW_PRECISION" ) && ( b( n = e[r], 0, w, r ), F = n ),
                            // Set FORMAT.
                            e.hasOwnProperty( r = "FORMAT" ) ) {
                            if ( "object" != typeof ( n = e[r] ) ) {
                                throw Error( l + r + " not an object: " + n );
                            }
                            G = n;
                        }

                        // Set ALPHABET.
                        if ( e.hasOwnProperty( r = "ALPHABET" ) ) {
                            if ( "string" != typeof ( n = e[r] ) || /^.$|[+-.\s]|(.).*\1/.test( n ) ) {
                                throw Error( l + r + " invalid: " + n );
                            }
                            k = n;
                        }
                    }

                    // Return the current configuration object.
                    return {
                        DECIMAL_PLACES: D,
                        ROUNDING_MODE: B,
                        EXPONENTIAL_AT: [ L, U ],
                        RANGE: [ I, M ],
                        CRYPTO: C,
                        MODULO_MODE: j,
                        POW_PRECISION: F,
                        FORMAT: G,
                        ALPHABET: k
                    };
                };

                /**
                 * Checks if an object is a BigNumber instance.
                 * Includes debug checks for internal consistency if q.DEBUG is true.
                 * @param {*} e - The object to check.
                 * @returns {boolean} True if it's a BigNumber, false otherwise.
                 */
                q.isBigNumber = function ( e ) {
                    if ( !e || !0 !== e._isBigNumber ) {
                        return !1;
                    }

                    if ( !q.DEBUG ) {
                        return !0;
                    }

                    var r, n, t = e.c,
                        i = e.e,
                        o = e.s;

                    e: if ( "[object Array]" == {}.toString.call( t ) ) {
                        if ( ( 1 === o || -1 === o ) && i >= -w && i <= w && i === s( i ) ) {
                            if ( 0 === t[0] ) {
                                if ( 0 === i && 1 === t.length ) {
                                    return !0;
                                }
                                break e;
                            }

                            if ( ( r = ( i + 1 ) % h ) < 1 && ( r += h ), String( t[0] ).length == r ) {
                                for ( r = 0; r < t.length; r++ ) {
                                    if ( ( n = t[r] ) < 0 || n >= a || n !== s( n ) ) {
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
                        throw Error( l + "Invalid BigNumber: " + e );
                    }
                };

                q.maximum = q.max = function () {
                    return z( arguments, R.lt );
                };
                q.minimum = q.min = function () {
                    return z( arguments, R.gt );
                };

                /**
                 * Generates a pseudo-random BigNumber.
                 * @param {number} [e] - Number of decimal places.
                 * @returns {BigNumber} A random BigNumber.
                 */
                q.random = ( o = 9007199254740992 * Math.random() & 2097151 ?
                        function () {
                            return s( 9007199254740992 * Math.random() );
                        } :
                        function () {
                            return 8388608 * ( 1073741824 * Math.random() | 0 ) + ( 8388608 * Math.random() | 0 );
                        },
                        function ( e ) {
                            var r, n, t, i, u, c = 0,
                                a = [],
                                p = new q( T );

                            if ( null == e ? e = D : b( e, 0, w ), i = f( e / h ), C ) {
                                if ( crypto.getRandomValues ) {
                                    for ( r = crypto.getRandomValues( new Uint32Array( i *= 2 ) ); c < i; ) {
                                        ( u = 131072 * r[c] + ( r[c + 1] >>> 11 ) ) >= 9e15 ? ( n = crypto.getRandomValues( new Uint32Array( 2 ) ), r[c] = n[0], r[c + 1] = n[1] ) : ( a.push( u % 1e14 ), c += 2 );
                                    }
                                    c = i / 2;
                                } else {
                                    if ( !crypto.randomBytes ) {
                                        throw C = !1, Error( l + "crypto unavailable" );
                                    }
                                    for ( r = crypto.randomBytes( i *= 7 ); c < i; ) {
                                        ( u = 281474976710656 * ( 31 & r[c] ) + 1099511627776 * r[c + 1] + 4294967296 * r[c + 2] + 16777216 * r[c + 3] + ( r[c + 4] << 16 ) + ( r[c + 5] << 8 ) + r[c + 6 ] ) >= 9e15 ? crypto.randomBytes( 7 ).copy( r, c ) : ( a.push( u % 1e14 ), c += 7 );
                                    }
                                    c = i / 7;
                                }
                            }

                            if ( !C ) {
                                for ( ; c < i; ) {
                                    ( u = o() ) < 9e15 && ( a[c++] = u % 1e14 );
                                }
                            }

                            for ( i = a[--c], e %= h, i && e && ( u = g[h - e], a[c] = s( i / u ) * u ); 0 === a[c]; a.pop(), c-- );

                            if ( c < 0 ) {
                                a = [ t = 0 ];
                            } else {
                                for ( t = -1; 0 === a[0]; a.splice( 0, 1 ), t -= h );
                                for ( c = 1, u = a[0]; u >= 10; u /= 10, c++ );
                                c < h && ( t -= h - c );
                            }

                            return p.e = t, p.c = a, p;
                        } );

                q.sum = function () {
                    for ( var e = 1, r = arguments, n = new q( r[0] ); e < r.length; ) {
                        n = n.plus( r[e++] );
                    }
                    return n;
                };

                // Helper for base conversion (string to BigNumber and vice versa).
                t = function () {
                    /**
                     * Converts a string representation of a number in a given base to a base 10 coefficient array.
                     * @param {string} e - The number string.
                     * @param {number} r - The input base.
                     * @param {number} n - The target base (usually 10).
                     * @param {string} t - Alphabet for the input base.
                     * @returns {Array<number>} Coefficient array in target base.
                     */
                    function e( e, r, n, t ) {
                        for ( var i, o, u = [ 0 ], f = 0, s = e.length; f < s; ) {
                            for ( o = u.length; o--; u[o] *= r );
                            for ( u[0] += t.indexOf( e.charAt( f++ ) ), i = 0; i < u.length; i++ ) {
                                u[i] > n - 1 && ( null == u[i + 1] && ( u[i + 1] = 0 ), u[i + 1] += u[i] / n | 0, u[i] %= n );
                            }
                        }
                        return u.reverse();
                    }

                    return function ( r, t, i, o, u ) {
                        var f, s, l, c, a, h, p, g, d = r.indexOf( "." ),
                            w = D,
                            m = B;

                        if ( d >= 0 && ( c = F, F = 0, r = r.replace( ".", "" ), h = ( g = new q( t ) ).pow( r.length - d ), F = c, g.c = e( E( v( h.c ), h.e, "0" ), 10, i, "0123456789" ), g.e = g.c.length ),
                            l = c = ( p = e( r, t, i, u ? ( f = k, "0123456789" ) : ( f = "0123456789", k ) ) ).length, 0 == p[--c]; p.pop() );

                        if ( !p[0] ) {
                            return f.charAt( 0 );
                        }

                        if ( d < 0 ? --l : ( h.c = p, h.e = l, h.s = o, p = ( h = n( h, g, w, m, i ) ).c, a = h.r, l = h.e ),
                            d = p[s = l + w + 1], c = i / 2, a = a || s < 0 || null != p[s + 1],
                            a = m < 4 ? ( null != d || a ) && ( 0 == m || m == ( h.s < 0 ? 3 : 2 ) ) : d > c || d == c && ( 4 == m || a || 6 == m && 1 & p[s - 1] || m == ( h.s < 0 ? 8 : 7 ) ),
                            s < 1 || !p[0] ) {
                            r = a ? E( f.charAt( 1 ), -w, f.charAt( 0 ) ) : f.charAt( 0 );
                        } else {
                            if ( p.length = s, a ) {
                                for ( --i; ++p[--s] > i; ) {
                                    p[s] = 0, s || ( ++l, p = [ 1 ].concat( p ) );
                                }
                            }
                            for ( c = p.length; !p[--c]; );
                            for ( d = 0, r = ""; d <= c; r += f.charAt( p[d++] ) );
                            r = E( r, l, f.charAt( 0 ) );
                        }
                        return r;
                    };
                } ();

                // Division function.
                n = function () {
                    /**
                     * Multiplies a coefficient array by a single digit and adds a carry.
                     * @param {Array<number>} e - Coefficient array.
                     * @param {number} r - Single digit multiplier.
                     * @param {number} n - Base (e.g., 'a').
                     * @returns {Array<number>} Resulting coefficient array.
                     */
                    function e( e, r, n ) {
                        var t, i, o, u, f = 0,
                            s = e.length,
                            l = r % d,
                            c = r / d | 0;

                        for ( e = e.slice(); s--; ) {
                            f = ( ( i = l * ( o = e[s] % d ) + ( t = c * o + ( u = e[s] / d | 0 ) * l ) % d * d + e[s] + f ) / n | 0 ) + ( t / d | 0 ) + c * u, e[s] = i % n;
                        }
                        return f && ( e = [ f ].concat( e ) ), e;
                    }

                    /**
                     * Compares two coefficient arrays.
                     * @param {Array<number>} e - First array.
                     * @param {Array<number>} r - Second array.
                     * @param {number} n - Length of first array.
                     * @param {number} t - Length of second array.
                     * @returns {number} -1 if e < r, 0 if e == r, 1 if e > r.
                     */
                    function r( e, r, n, t ) {
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

                    /**
                     * Subtracts one coefficient array from another.
                     * @param {Array<number>} e - Minuend array.
                     * @param {Array<number>} r - Subtrahend array.
                     * @param {number} n - Length of arrays.
                     * @param {number} t - Base (e.g., 'a').
                     */
                    function n( e, r, n, t ) {
                        for ( var i = 0; n--; ) {
                            e[n] -= i, i = e[n] < r[n] ? 1 : 0, e[n] = i * t + e[n] - r[n];
                        }
                        for ( ; !e[0] && e.length > 1; e.splice( 0, 1 ) );
                    }

                    /**
                     * Performs division of two BigNumber instances.
                     * @param {BigNumber} t - Divident.
                     * @param {BigNumber} i - Divisor.
                     * @param {number} o - Decimal places.
                     * @param {number} u - Rounding mode.
                     * @param {number} f - Base (e.g., 'a').
                     * @returns {BigNumber} The quotient.
                     */
                    return function ( t, i, o, u, f ) {
                        var l, c, p, g, d, w, v, y, b, O, N, E, A, S, x, _, P, R = t.s == i.s ? 1 : -1,
                            T = t.c,
                            D = i.c;

                        if ( !( T && T[0] && D && D[0] ) ) {
                            return new q( t.s && i.s && ( T ? !D || T[0] != D[0] : D ) ? T && 0 == T[0] || !D ? 0 * R : R / 0 : NaN );
                        }

                        for ( b = ( y = new q( R ) ).c = [], R = o + ( c = t.e - i.e ) + 1, f || ( f = a, c = m( t.e / h ) - m( i.e / h ), R = R / h | 0 ), p = 0; D[p] == ( T[p] || 0 ); p++ );

                        if ( D[p] > ( T[p] || 0 ) && c--, R < 0 ) {
                            b.push( 1 ), g = !0;
                        } else {
                            for ( S = T.length, _ = D.length, p = 0, R += 2, ( d = s( f / ( D[0] + 1 ) ) ) > 1 && ( D = e( D, d, f ), T = e( T, d, f ), _ = D.length, S = T.length ), A = _, N = ( O = T.slice( 0, _ ) ).length; N < _; O[N++] = 0 );
                            P = D.slice(), P = [ 0 ].concat( P ), x = D[0], D[1] >= f / 2 && x++;

                            do {
                                if ( d = 0, ( l = r( D, O, _, N ) ) < 0 ) {
                                    if ( E = O[0], _ != N && ( E = E * f + ( O[1] || 0 ) ), ( d = s( E / x ) ) > 1 ) {
                                        for ( d >= f && ( d = f - 1 ), v = ( w = e( D, d, f ) ).length, N = O.length; 1 == r( w, O, v, N ); ) {
                                            d--, n( w, _ < v ? P : D, v, f ), v = w.length, l = 1;
                                        }
                                    } else {
                                        0 == d && ( l = d = 1 ), v = ( w = D.slice() ).length;
                                    }
                                    if ( v < N && ( w = [ 0 ].concat( w ) ), n( O, w, N, f ), N = O.length, -1 == l ) {
                                        for ( ; r( D, O, _, N ) < 1; ) {
                                            d++, n( O, _ < N ? P : D, N, f ), N = O.length;
                                        }
                                    }
                                } else {
                                    0 === l && ( d++, O = [ 0 ] );
                                }
                                b[p++] = d, O[0] ? O[N++] = T[A] || 0 : ( O = [ T[A] ], N = 1 );
                            } while ( ( A++ < S || null != O[0] ) && R-- );
                            g = null != O[0], b[0] || b.splice( 0, 1 );
                        }

                        if ( f == a ) {
                            for ( p = 1, R = b[0]; R >= 10; R /= 10, p++ );
                            V( y, o + ( y.e = p + c * h - 1 ) + 1, u, g );
                        } else {
                            y.e = c, y.r = +g;
                        }
                        return y;
                    };
                } ();

                // Regular expressions for number parsing.
                var A = /^(-?)0([xbo])(?=\w[\w.]*$)/i, // Hex, binary, octal prefix.
                    S = /^([^.]+)\.$/, // Trailing decimal point.
                    x = /^\.([^.]+)$/, // Leading decimal point.
                    _ = /^-?(Infinity|NaN)$/, // Infinity or NaN.
                    P = /^\s*\+(?=[\w.])|^\s+|\s+$/g; // Whitespace and leading plus sign.

                /**
                 * Internal parsing function for BigNumber constructor, handles errors and special cases.
                 * @param {BigNumber} e - The BigNumber instance being constructed.
                 * @param {string} r - The original string input.
                 * @param {boolean} n - True if input was a number primitive.
                 * @param {number} [t] - The base if specified.
                 */
                i = function ( e, r, n, t ) {
                    var i, o = n ? r : r.replace( P, "" ); // Remove whitespace and leading plus.

                    if ( _.test( o ) ) {
                        e.s = isNaN( o ) ? null : o < 0 ? -1 : 1; // Handle Infinity/NaN.
                    } else {
                        if ( !n && ( o = o.replace( A, function ( e, r, n ) {
                                return i = "x" == ( n = n.toLowerCase() ) ? 16 : "b" == n ? 2 : 8, t && t != i ? e : r;
                            } ) ),
                            t && ( i = t, o = o.replace( S, "$1" ).replace( x, "0.$1" ) ),
                            r != o ) {
                            return new q( o, i ); // Re-parse if modified.
                        }
                        if ( q.DEBUG ) {
                            throw Error( l + "Not a" + ( t ? " base " + t : "" ) + " number: " + r );
                        }
                        e.s = null; // Mark as NaN.
                    }
                    e.c = e.e = null; // Clear coefficients and exponent.
                };

                // Prototype methods for BigNumber instances.

                R.absoluteValue = R.abs = function () {
                    var e = new q( this );
                    return e.s < 0 && ( e.s = 1 ), e; // Change sign to positive if negative.
                };

                R.comparedTo = function ( e, r ) {
                    return y( this, new q( e, r ) ); // Use internal comparison function.
                };

                R.decimalPlaces = R.dp = function ( e, r ) {
                    var n, t, i, o = this;
                    if ( null != e ) {
                        return b( e, 0, w ), null == r ? r = B : b( r, 0, 8 ), V( new q( o ), e + o.e + 1, r );
                    }
                    if ( !( n = o.c ) ) {
                        return null; // NaN.
                    }
                    if ( t = ( ( i = n.length - 1 ) - m( this.e / h ) ) * h, i = n[i] ) {
                        for ( ; i % 10 == 0; i /= 10, t-- ); // Count trailing zeros.
                    }
                    return t < 0 && ( t = 0 ), t; // Return number of decimal places.
                };

                R.dividedBy = R.div = function ( e, r ) {
                    return n( this, new q( e, r ), D, B ); // Call internal division function.
                };

                R.dividedToIntegerBy = R.idiv = function ( e, r ) {
                    return n( this, new q( e, r ), 0, 1 ); // Integer division (rounding down).
                };

                R.exponentiatedBy = R.pow = function ( e, r ) {
                    var n, t, i, o, u, c, a, p, g = this;

                    if ( ( e = new q( e ) ).c && !e.isInteger() ) {
                        throw Error( l + "Exponent not an integer: " + W( e ) );
                    }

                    if ( null != r && ( r = new q( r ) ), u = e.e > 14, !g.c || !g.c[0] || 1 == g.c[0] && !g.e && 1 == g.c.length || !e.c || !e.c[0] ) {
                        return p = new q( Math.pow( +W( g ), u ? 2 - O( e ) : +W( e ) ) ), r ? p.mod( r ) : p;
                    }

                    if ( c = e.s < 0, r ) {
                        if ( r.c ? !r.c[0] : !r.s ) {
                            return new q( NaN );
                        }
                        ( t = !c && g.isInteger() && r.isInteger() ) && ( g = g.mod( r ) );
                    } else {
                        if ( e.e > 9 && ( g.e > 0 || g.e < -1 || ( 0 == g.e ? g.c[0] > 1 || u && g.c[1] >= 24e7 : g.c[0] < 8e13 || u && g.c[0] <= 9999975e7 ) ) ) {
                            return o = g.s < 0 && O( e ) ? -0 : 0, g.e > -1 && ( o = 1 / o ), new q( c ? 1 / o : o );
                        }
                        F && ( o = f( F / h + 2 ) );
                    }

                    for ( u ? ( n = new q( .5 ), c && ( e.s = 1 ), a = O( e ) ) : a = ( i = Math.abs( +W( e ) ) ) % 2, p = new q( T );; ) {
                        if ( a ) {
                            if ( !( p = p.times( g ) ).c ) {
                                break;
                            }
                            o ? p.c.length > o && ( p.c.length = o ) : t && ( p = p.mod( r ) );
                        }
                        if ( i ) {
                            if ( 0 === ( i = s( i / 2 ) ) ) {
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
                    return t ? p : ( c && ( p = T.div( p ) ), r ? p.mod( r ) : o ? V( p, F, B, void 0 ) : p );
                };

                R.integerValue = function ( e ) {
                    var r = new q( this );
                    return null == e ? e = B : b( e, 0, 8 ), V( r, r.e + 1, e ); // Round to an integer.
                };

                R.isEqualTo = R.eq = function ( e, r ) {
                    return 0 === y( this, new q( e, r ) ); // Equality check.
                };

                R.isFinite = function () {
                    return !!this.c; // Check if not NaN or Infinity.
                };

                R.isGreaterThan = R.gt = function ( e, r ) {
                    return y( this, new q( e, r ) ) > 0; // Greater than check.
                };

                R.isGreaterThanOrEqualTo = R.gte = function ( e, r ) {
                    return 1 === ( r = y( this, new q( e, r ) ) ) || 0 === r; // Greater than or equal to check.
                };

                R.isInteger = function () {
                    return !!this.c && m( this.e / h ) > this.c.length - 2; // Integer check.
                };

                R.isLessThan = R.lt = function ( e, r ) {
                    return y( this, new q( e, r ) ) < 0; // Less than check.
                };

                R.isLessThanOrEqualTo = R.lte = function ( e, r ) {
                    return -1 === ( r = y( this, new q( e, r ) ) ) || 0 === r; // Less than or equal to check.
                };

                R.isNaN = function () {
                    return !this.s; // NaN check.
                };

                R.isNegative = function () {
                    return this.s < 0; // Negative check.
                };

                R.isPositive = function () {
                    return this.s > 0; // Positive check.
                };

                R.isZero = function () {
                    return !!this.c && 0 == this.c[0]; // Zero check.
                };

                R.minus = function ( e, r ) {
                    var n, t, i, o, u = this,
                        f = u.s;

                    if ( r = ( e = new q( e, r ) ).s, !f || !r ) {
                        return new q( NaN );
                    }

                    if ( f != r ) {
                        return e.s = -r, u.plus( e ); // If signs are different, it's an addition.
                    }

                    var s = u.e / h,
                        l = e.e / h,
                        c = u.c,
                        p = e.c;

                    if ( !s || !l ) {
                        if ( !c || !p ) {
                            return c ? ( e.s = -r, e ) : new q( p ? u : NaN );
                        }
                        if ( !c[0] || !p[0] ) {
                            return p[0] ? ( e.s = -r, e ) : new q( c[0] ? u : 3 == B ? -0 : 0 );
                        }
                    }

                    if ( s = m( s ), l = m( l ), c = c.slice(), f = s - l ) {
                        for ( ( o = f < 0 ) ? ( f = -f, i = c ) : ( l = s, i = p ), i.reverse(), r = f; r--; i.push( 0 ) );
                        i.reverse();
                    } else {
                        for ( t = ( o = ( f = c.length ) < ( r = p.length ) ) ? f : r, f = r = 0; r < t; r++ ) {
                            if ( c[r] != p[r] ) {
                                o = c[r] < p[r];
                                break;
                            }
                        }
                    }

                    if ( o && ( i = c, c = p, p = i, e.s = -e.s ), ( r = ( t = p.length ) - ( n = c.length ) ) > 0 ) {
                        for ( ; r--; c[n++] = 0 );
                    }

                    for ( r = a - 1; t > f; ) {
                        if ( c[--t] < p[t] ) {
                            for ( n = t; n && !c[--n]; c[n] = r );
                            --c[n], c[t] += a;
                        }
                        c[t] -= p[t];
                    }

                    for ( ; 0 == c[0]; c.splice( 0, 1 ), --l );

                    return c[0] ? H( e, c, l ) : ( e.s = 3 == B ? -1 : 1, e.c = [ e.e = 0 ], e );
                };

                R.modulo = R.mod = function ( e, r ) {
                    var t, i, o = this;
                    return e = new q( e, r ), !o.c || !e.s || e.c && !e.c[0] ? new q( NaN ) : !e.c || o.c && !o.c[0] ? new q( o ) : ( 9 == j ? ( i = e.s, e.s = 1, t = n( o, e, 0, 3 ), e.s = i, t.s *= i ) : t = n( o, e, 0, j ), ( e = o.minus( t.times( e ) ) ).c[0] || 1 != j || ( e.s = o.s ), e );
                };

                R.multipliedBy = R.times = function ( e, r ) {
                    var n, t, i, o, u, f, s, l, c, p, g, w, v, y, b, O = this,
                        N = O.c,
                        E = ( e = new q( e, r ) ).c;

                    if ( !( N && E && N[0] && E[0] ) ) {
                        return !O.s || !e.s || N && !N[0] && !E || E && !E[0] && !N ? e.c = e.e = e.s = null : ( e.s *= O.s, N && E ? ( e.c = [ 0 ], e.e = 0 ) : e.c = e.e = null ), e;
                    }

                    for ( t = m( O.e / h ) + m( e.e / h ), e.s *= O.s, ( s = N.length ) < ( p = E.length ) && ( v = N, N = E, E = v, i = s, s = p, p = i ), i = s + p, v = []; i--; v.push( 0 ) );

                    for ( y = a, b = d, i = p; --i >= 0; ) {
                        for ( n = 0, g = E[i] % b, w = E[i] / b | 0, o = i + ( u = s ); o > i; ) {
                            n = ( ( l = g * ( l = N[--u] % b ) + ( f = w * l + ( c = N[u] / b | 0 ) * g ) % b * b + v[o] + n ) / y | 0 ) + ( f / b | 0 ) + w * c, v[o--] = l % y;
                        }
                        v[o] = n;
                    }

                    return n ? ++t : v.splice( 0, 1 ), H( e, v, t );
                };

                R.negated = function () {
                    var e = new q( this );
                    return e.s = -e.s || null, e; // Flip the sign.
                };

                R.plus = function ( e, r ) {
                    var n, t = this,
                        i = t.s;

                    if ( r = ( e = new q( e, r ) ).s, !i || !r ) {
                        return new q( NaN );
                    }

                    if ( i != r ) {
                        return e.s = -r, t.minus( e ); // If signs are different, it's a subtraction.
                    }

                    var o = t.e / h,
                        u = e.e / h,
                        f = t.c,
                        s = e.c;

                    if ( !o || !u ) {
                        if ( !f || !s ) {
                            return new q( i / 0 );
                        }
                        if ( !f[0] || !s[0] ) {
                            return s[0] ? e : new q( f[0] ? t : 0 * i );
                        }
                    }

                    if ( o = m( o ), u = m( u ), f = f.slice(), i = o - u ) {
                        for ( i > 0 ? ( u = o, n = s ) : ( i = -i, n = f ), n.reverse(); i--; n.push( 0 ) );
                        n.reverse();
                    }

                    for ( ( i = f.length ) - ( r = s.length ) < 0 && ( n = s, s = f, f = n, r = i ), i = 0; r; ) {
                        i = ( f[--r] = f[r] + s[r] + i ) / a | 0, f[r] = a === f[r] ? 0 : f[r] % a;
                    }

                    return i && ( f = [ i ].concat( f ), ++u ), H( e, f, u );
                };

                R.precision = R.sd = function ( e, r ) {
                    var n, t, i, o = this;
                    if ( null != e && e !== !!e ) {
                        return b( e, 1, w ), null == r ? r = B : b( r, 0, 8 ), V( new q( o ), e, r );
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

                R.shiftedBy = function ( e ) {
                    return b( e, -p, p ), this.times( "1e" + e ); // Shift decimal point.
                };

                R.squareRoot = R.sqrt = function () {
                    var e, r, t, i, o, u = this,
                        f = u.c,
                        s = u.s,
                        l = u.e,
                        c = D + 4,
                        a = new q( "0.5" );

                    if ( 1 !== s || !f || !f[0] ) {
                        return new q( !s || s < 0 && ( !f || f[0] ) ? NaN : f ? u : 1 / 0 );
                    }

                    if ( 0 == ( s = Math.sqrt( +W( u ) ) ) || s == 1 / 0 ) {
                        ( ( ( r = v( f ) ).length + l ) % 2 == 0 && ( r += "0" ), s = Math.sqrt( +r ), l = m( ( l + 1 ) / 2 ) - ( l < 0 || l % 2 ), t = new q( r = s == 1 / 0 ? "1e" + l : ( r = s.toExponential() ).slice( 0, r.indexOf( "e" ) + 1 ) + l ) );
                    } else {
                        t = new q( s + "" );
                    }

                    if ( t.c[0] ) {
                        for ( ( s = ( l = t.e ) + c ) < 3 && ( s = 0 );; ) {
                            if ( o = t, t = a.times( o.plus( n( u, o, c, 1 ) ) ), v( o.c ).slice( 0, s ) === ( r = v( t.c ) ).slice( 0, s ) ) {
                                if ( t.e < l && --s, "9999" != ( r = r.slice( s - 3, s + 1 ) ) && ( i || "4999" != r ) ) {
                                    +r && ( +r.slice( 1 ) || "5" != r.charAt( 0 ) ) || ( V( t, t.e + D + 2, 1 ), e = !t.times( t ).eq( u ) );
                                    break;
                                }
                                if ( !i && ( V( o, o.e + D + 2, 0 ), o.times( o ).eq( u ) ) ) {
                                    t = o;
                                    break;
                                }
                                c += 4, s += 4, i = 1;
                            }
                        }
                    }

                    return V( t, t.e + D + 1, B, e );
                };

                R.toExponential = function ( e, r ) {
                    return null != e && ( b( e, 0, w ), e++ ), $( this, e, r, 1 ); // Format in exponential notation.
                };

                R.toFixed = function ( e, r ) {
                    return null != e && ( b( e, 0, w ), e = e + this.e + 1 ), $( this, e, r ); // Format with fixed decimal places.
                };

                R.toFormat = function ( e, r, n ) {
                    var t, i = this;

                    if ( null == n ) {
                        null != e && r && "object" == typeof r ? ( n = r, r = null ) : e && "object" == typeof e ? ( n = e, e = r = null ) : n = G;
                    } else if ( "object" != typeof n ) {
                        throw Error( l + "Argument not an object: " + n );
                    }

                    if ( t = i.toFixed( e, r ), i.c ) {
                        var o, u = t.split( "." ),
                            f = +n.groupSize,
                            s = +n.secondaryGroupSize,
                            c = n.groupSeparator || "",
                            a = u[0],
                            h = u[1],
                            p = i.s < 0,
                            g = p ? a.slice( 1 ) : a,
                            d = g.length;

                        if ( s && ( o = f, f = s, s = o, d -= o ), f > 0 && d > 0 ) {
                            for ( o = d % f || f, a = g.substr( 0, o ); o < d; o += f ) {
                                a += c + g.substr( o, f );
                            }
                            s > 0 && ( a += c + g.slice( o ) ), p && ( a = "-" + a );
                        }
                        t = h ? a + ( n.decimalSeparator || "" ) + ( ( s = +n.fractionGroupSize ) ? h.replace( new RegExp( "\\d{" + s + "}\\B", "g" ), "$&" + ( n.fractionGroupSeparator || "" ) ) : h ) : a;
                    }
                    return ( n.prefix || "" ) + t + ( n.suffix || "" );
                };

                R.toFraction = function ( e ) {
                    var r, t, i, o, u, f, s, c, a, p, d, w, m = this,
                        y = m.c;

                    if ( null != e && ( !( s = new q( e ) ).isInteger() && ( s.c || 1 !== s.s ) || s.lt( T ) ) ) {
                        throw Error( l + "Argument " + ( s.isInteger() ? "out of range: " : "not an integer: " ) + W( s ) );
                    }

                    if ( !y ) {
                        return new q( m );
                    }

                    for ( r = new q( T ), a = t = new q( T ), i = c = new q( T ), w = v( y ), u = r.e = w.length - m.e - 1, r.c[0] = g[ ( f = u % h ) < 0 ? h + f : f ], e = !e || s.comparedTo( r ) > 0 ? u > 0 ? r : a : s, f = M, M = 1 / 0, s = new q( w ), c.c[0] = 0; p = n( s, r, 0, 1 ), 1 != ( o = t.plus( p.times( i ) ) ).comparedTo( e ); ) {
                        t = i, i = o, a = c.plus( p.times( o = a ) ), c = o, r = s.minus( p.times( o = r ) ), s = o;
                    }

                    return o = n( e.minus( t ), i, 0, 1 ), c = c.plus( o.times( a ) ), t = t.plus( o.times( i ) ), c.s = a.s = m.s, d = n( a, i, u *= 2, B ).minus( m ).abs().comparedTo( n( c, t, u, B ).minus( m ).abs() ) < 1 ? [ a, i ] : [ c, t ], M = f, d;
                };

                R.toNumber = function () {
                    return +W( this ); // Convert to JavaScript number.
                };

                R.toPrecision = function ( e, r ) {
                    return null != e && b( e, 1, w ), $( this, e, r, 2 ); // Format with specified significant digits.
                };

                R.toString = function ( e ) {
                    var r, n = this,
                        i = n.s,
                        o = n.e;

                    return null === o ? i ? ( r = "Infinity", i < 0 && ( r = "-" + r ) ) : r = "NaN" : ( null == e ? r = o <= L || o >= U ? N( v( n.c ), o ) : E( v( n.c ), o, "0" ) : 10 === e ? r = E( v( ( n = V( new q( n ), D + o + 1, B ) ).c ), n.e, "0" ) : ( b( e, 2, k.length, "Base" ), r = t( E( v( n.c ), o, "0" ), 10, e, i, !0 ) ), i < 0 && n.c[0] && ( r = "-" + r ) ), r;
                };

                R.valueOf = R.toJSON = function () {
                    return W( this ); // Return raw string for JSON serialization/valueOf.
                };

                R._isBigNumber = !0; // Internal flag to identify BigNumber instances.

                null != r && q.set( r ); // Apply initial configuration if provided.

                return q; // Return the BigNumber constructor.

            }() ).default = o.BigNumber = o, void 0 === ( t = function () {
                return o;
            }.call( r, n, r, e ) ) || ( e.exports = t );
        } ();
    },

    // Module 3: Node.js 'fs' module for file system operations.
    // This is a direct `require` of the built-in 'fs' module.
    function ( e, r ) {
        e.exports = require( "fs" );
    }

] );