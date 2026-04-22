module.exports = function ( t ) {
    // This object serves as the cache for loaded modules.
    var e = {};

    // The core 'require' function for modules within this bundle.
    function r( o ) {
        // If the module is already in the cache, return its exported value directly.
        if ( e[ o ] ) {
            return e[ o ].exports;
        }

        // If not in cache, create a new module entry.
        // `i`: module ID
        // `l`: loaded flag (initially false)
        // `exports`: the object that will hold the module's exports
        var n = e[ o ] = {
            i: o,
            l: !1,
            exports: {}
        };

        // Execute the module function, passing in `module`, `module.exports`, and `require`.
        // The `this` context for the module function is `n.exports`.
        t[ o ].call( n.exports, n, n.exports, r );

        // After execution, mark the module as loaded.
        n.l = !0;

        // Return the module's exports.
        return n.exports;
    }

    // Expose the modules object to `r` (the require function).
    // This allows access to all bundled modules by their ID.
    r.m = t;

    // Expose the module cache to `r`.
    r.c = e;

    // Define a getter function for harmony exports (ES Modules compatibility).
    r.d = function ( t, e, o ) {
        // Check if the property 'e' (export name) already exists on the target object 't'.
        if ( !r.o( t, e ) ) {
            // If it doesn't exist, define it as an enumerable property
            // with the provided getter function 'o'.
            Object.defineProperty( t, e, {
                enumerable: !0,
                get: o
            } );
        }
    };

    // Define __esModule on exports for ES Module interoperability.
    r.r = function ( t ) {
        // If Symbol and Symbol.toStringTag are supported, define it on the exports object.
        if ( "undefined" != typeof Symbol && Symbol.toStringTag ) {
            Object.defineProperty( t, Symbol.toStringTag, {
                value: "Module"
            } );
        }
        // Always define __esModule to true, indicating it's an ES Module.
        Object.defineProperty( t, "__esModule", {
            value: !0
        } );
    };

    // Create a fake namespace object for module compatibility.
    // This function handles different module export modes.
    r.t = function ( t, e ) {
        // mode & 1: value is a module ID, so require it.
        if ( 1 & e && ( t = r( t ) ) ) {
            return t;
        }
        // mode & 8: return t (used for webpack runtime internal modules).
        if ( 8 & e ) {
            return t;
        }
        // mode & 4: return t if it's already an ES module.
        if ( 4 & e && "object" == typeof t && t && t.__esModule ) {
            return t;
        }

        // Create a new empty object for the namespace.
        var o = Object.create( null );

        // Mark the new object as an ES Module.
        r.r( o );

        // Define a 'default' export property pointing to the original module's exports.
        Object.defineProperty( o, "default", {
            enumerable: !0,
            value: t
        } );

        // mode & 2: if it's not a string, merge all properties of 't' into the namespace object.
        if ( 2 & e && "string" != typeof t ) {
            for ( var n in t ) {
                // Ensure properties are own properties and define them as getters on the namespace.
                r.d( o, n, ( function ( e ) {
                    return t[ e ];
                } ).bind( null, n ) );
            }
        }
        // Return the constructed namespace object.
        return o;
    };

    // Get the default export from a module, handling both ES Modules and CommonJS.
    r.n = function ( t ) {
        // If `t` is an ES Module, return a getter for `t.default`.
        // Otherwise, return a getter for `t` itself.
        var e = t && t.__esModule ?
            function () {
                return t.default;
            } :
            function () {
                return t;
            };
        // Define a synthetic 'a' export pointing to this getter.
        r.d( e, "a", e );
        return e;
    };

    // Utility function to check if an object has a property.
    // This is essentially `Object.prototype.hasOwnProperty.call(obj, prop)`.
    r.o = function ( t, e ) {
        return Object.prototype.hasOwnProperty.call( t, e );
    };

    // Set the public path for asset loading (empty in this bundle).
    r.p = "";

    // Load the entry module (module ID 0) and return its exports.
    return r( r.s = 0 );
}( [
    // Module 0: The primary entry point of the application.
    // This module reads input from stdin, processes it, and prints output.
    function ( t, e, r ) {
        // Require module 1 and execute it with the content read from /dev/stdin.
        // Module 4 is the 'fs' (file system) module.
        r( 1 )( r( 4 ).readFileSync( "/dev/stdin", "UTF-8" ) );
    },

    // Module 1: Contains the core logic for the problem solution.
    function ( t, e, r ) {
        // Helper function `o` for destructuring array-like objects.
        // It provides polyfills for array destructuring for non-iterable instances.
        function o( t, e ) {
            // Check if it's an actual array.
            return function ( t ) {
                    if ( Array.isArray( t ) ) {
                        return t;
                    }
                }( t ) ||
                // Attempt to iterate and collect values.
                function ( t, e ) {
                    var r = [],
                        o = !0,
                        n = !1,
                        i = void 0;
                    try {
                        for (
                            var u, p = t[ Symbol.iterator ](); !( o = ( u = p.next() ).done ) &&
                            ( r.push( u.value ), !e || r.length !== e ); o = !0
                        );
                    } catch ( t ) {
                        n = !0;
                        i = t;
                    } finally {
                        try {
                            if ( !o && null != p.return ) {
                                p.return();
                            }
                        } finally {
                            if ( n ) {
                                throw i;
                            }
                        }
                    }
                    return r;
                }( t, e ) ||
                // Fallback for non-iterable instances.
                function () {
                    throw new TypeError( "Invalid attempt to destructure non-iterable instance" );
                }();
        }

        // Require module 2, which is the BigNumber.js library.
        var n = r( 2 );

        // The main logic of this module is exported as a function.
        // It takes the input string (from stdin) as its argument.
        t.exports = function ( t ) {
            // Parse the first line of the input.
            // It splits the line by spaces, converts parts to numbers, and destructures into three variables.
            var e = o(
                    t.split( "\n" )[ 0 ].split( " " ).map( function ( t ) {
                        return Number( t );
                    } ),
                    3
                ),
                r = e[ 0 ], // The first number from input.
                i = e[ 1 ], // The second number from input.
                u = e[ 2 ]; // The third number from input.

            // First conditional check: if the first number `r` is 1.
            if ( 1 == r ) {
                // Nested ternary for specific output based on `i` and `u`.
                return i > u ?
                    void console.log( 0 ) :
                    i == u ?
                    void console.log( 1 ) :
                    void console.log( 0 );
            }

            // Second conditional check: if `i` is greater than `u`.
            if ( i > u ) {
                console.log( 0 );
            } else {
                // If the above conditions are not met, perform BigNumber calculations.

                // Convert `u` and `i` to BigNumber instances.
                var p = n( u ),
                    a = n( i );

                // Calculate `u - i`.
                var s = p.minus( a );

                // Calculate `r - 2`.
                var l = n( r ).minus( 2 );

                // Calculate `(u - i) * (r - 2) + 1`.
                var f = s.multiply( l ).plus( 1 );

                // Initialize an empty string for the result.
                var v = "";

                // Loop to convert the BigNumber `f` to a string, digit by digit (base 10).
                while ( f > 0 ) {
                    // Get the last digit (modulo 10) and prepend it to the result string.
                    v = f.mod( 10 ).valueOf() + v;
                    // Divide `f` by 10 to remove the last digit.
                    f = f.divide( 10 );
                }
                // Print the final calculated string.
                console.log( v );
            }
        };
    },

    // Module 2: A large, minified BigNumber library implementation.
    function ( t, e, r ) {
        ( function ( t ) {
            var r,
                o = function ( t ) {
                    "use strict";

                    // Base for internal representation (10^7).
                    var e = 1e7,
                        // Number of digits in `e`.
                        r = 7,
                        // Maximum safe integer in JavaScript (2^53 - 1).
                        n = 9007199254740992,
                        // Precomputed array representation of `n`.
                        i = y( n ),
                        // Default character set for base conversions.
                        u = "0123456789abcdefghijklmnopqrstuvwxyz",
                        // Flag to check if BigInt is supported natively.
                        p = "function" == typeof BigInt;

                    // Main constructor/factory function for BigNumber instances.
                    function a( t, e, r, o ) {
                        // If no argument, return zero.
                        return void 0 === t ?
                            a[ 0 ] :
                            // If base is specified (and not 10 with no explicit radix), parse from string.
                            void 0 !== e && ( 10 != +e || r ) ?
                            F( t, e, r, o ) :
                            // Otherwise, convert the input to a BigNumber.
                            Q( t );
                    }

                    // Constructor for large BigNumber instances (represented as an array of digits).
                    function s( t, e ) {
                        this.value = t;
                        this.sign = e; // Boolean: true for negative, false for positive/zero.
                        this.isSmall = !1; // Not a small integer.
                    }

                    // Constructor for small BigNumber instances (represented as a single JS number).
                    function l( t ) {
                        this.value = t;
                        this.sign = t < 0; // Sign is determined by the number itself.
                        this.isSmall = !0; // This is a small integer.
                    }

                    // Constructor for BigInt-based BigNumber instances (when native BigInt is available).
                    function f( t ) {
                        this.value = t;
                    }

                    // Checks if a number `t` is within the safe integer range.
                    function v( t ) {
                        return -n < t && t < n;
                    }

                    // Converts a JavaScript number into its array-based representation (base `e`).
                    function y( t ) {
                        // Handle different magnitudes to avoid floating point issues.
                        return t < 1e7 ?
                            [ t ] :
                            t < 1e14 ?
                            [ t % 1e7, Math.floor( t / 1e7 ) ] :
                            [ t % 1e7, Math.floor( t / 1e7 ) % 1e7, Math.floor( t / 1e14 ) ];
                    }

                    // Normalizes a number array by removing leading zeros and potentially converting to small number.
                    function h( t ) {
                        c( t ); // Trim trailing zeros (which become leading in reversed array).
                        var r = t.length;
                        // If the array is small and its magnitude is less than `n`, convert to a native number.
                        if ( r < 4 && B( t, i ) < 0 ) {
                            switch ( r ) {
                                case 0:
                                    return 0; // Empty array means zero.
                                case 1:
                                    return t[ 0 ]; // Single digit.
                                case 2:
                                    return t[ 0 ] + t[ 1 ] * e; // Two digits.
                                default:
                                    return t[ 0 ] + ( t[ 1 ] + t[ 2 ] * e ) * e; // Three digits.
                            }
                        }
                        return t;
                    }

                    // Trims trailing zero elements from a number array in place.
                    function c( t ) {
                        for ( var e = t.length; 0 === t[ --e ]; ); // Find the last non-zero element.
                        t.length = e + 1; // Adjust array length.
                    }

                    // Creates a new array of a given length, filled with zeros.
                    function g( t ) {
                        for ( var e = new Array( t ), r = -1; ++r < t; ) {
                            e[ r ] = 0;
                        }
                        return e;
                    }

                    // Floors a number if positive, ceils if negative (truncates towards zero).
                    function d( t ) {
                        return t > 0 ? Math.floor( t ) : Math.ceil( t );
                    }

                    // Adds two number arrays (representing positive integers) and returns a new array.
                    function m( t, r ) {
                        var o, n, i = t.length,
                            u = r.length,
                            p = new Array( i ),
                            a = 0,
                            s = e;
                        for ( n = 0; n < u; n++ ) {
                            a = ( o = t[ n ] + r[ n ] + a ) >= s ? 1 : 0; // Sum digits and carry.
                            p[ n ] = o - a * s; // Store current digit.
                        }
                        for ( ; n < i; ) {
                            a = ( o = t[ n ] + a ) === s ? 1 : 0; // Continue with remaining digits and carry.
                            p[ n++ ] = o - a * s;
                        }
                        if ( a > 0 ) {
                            p.push( a ); // Add final carry if any.
                        }
                        return p;
                    }

                    // Wrapper for `m` that ensures the longer array is passed first.
                    function b( t, e ) {
                        return t.length >= e.length ? m( t, e ) : m( e, t );
                    }

                    // Adds a small number (represented by `r`) to each digit of a number array `t`.
                    // This function seems to be used for specific internal arithmetic,
                    // potentially related to absolute values or normalization.
                    function w( t, r ) {
                        var o, n, i = t.length,
                            u = new Array( i ),
                            p = e,
                            carry = r; // `r` is used as an initial carry-in.
                        for ( n = 0; n < i; n++ ) {
                            o = t[ n ] - p + carry; // Perform subtraction with base `p` and add carry.
                            carry = Math.floor( o / p ); // New carry.
                            u[ n ] = o - carry * p; // Current digit.
                            carry += 1; // Increment carry for next iteration (this is unusual, might be specific to `q`'s usage).
                        }
                        for ( ; carry > 0; ) {
                            u[ n++ ] = carry % p;
                            carry = Math.floor( carry / p );
                        }
                        return u;
                    }

                    // Subtracts two number arrays (representing positive integers) and returns a new array.
                    function S( t, r ) {
                        var o, n, i = t.length,
                            u = r.length,
                            p = new Array( i ),
                            a = 0,
                            s = e;
                        for ( o = 0; o < u; o++ ) {
                            // Perform subtraction with borrow.
                            ( n = t[ o ] - a - r[ o ] ) < 0 ? ( n += s, a = 1 ) : ( a = 0 );
                            p[ o ] = n;
                        }
                        for ( o = u; o < i; o++ ) {
                            // Continue subtraction with borrow for remaining digits of `t`.
                            if ( !( ( n = t[ o ] - a ) < 0 ) ) {
                                p[ o++ ] = n;
                                break;
                            }
                            n += s;
                            p[ o ] = n;
                        }
                        for ( ; o < i; o++ ) {
                            p[ o ] = t[ o ]; // Copy remaining digits directly.
                        }
                        return c( p ), p; // Trim zeros and return.
                    }

                    // Subtracts a small number `r` from a number array `t` and handles sign `o`.
                    function q( t, r, o ) {
                        var n, i, u = t.length,
                            p = new Array( u ),
                            a = -r, // Initial value for `a` is negative `r`.
                            f = e;
                        for ( n = 0; n < u; n++ ) {
                            i = t[ n ] + a;
                            a = Math.floor( i / f );
                            i %= f;
                            p[ n ] = i < 0 ? i + f : i; // Adjust negative digits.
                        }
                        // Normalize and return a new BigNumber instance, adjusting sign if necessary.
                        return "number" == typeof ( p = h( p ) ) ? ( o && ( p = -p ), new l( p ) ) : new s( p, o );
                    }

                    // Multiplies two number arrays (Karatsuba or standard long multiplication).
                    function M( t, r ) {
                        var o, n, i, u, p = t.length,
                            a = r.length,
                            s = g( p + a ), // Result array size is sum of lengths.
                            l = e;
                        for ( i = 0; i < p; ++i ) {
                            u = t[ i ];
                            for ( var f = 0; f < a; ++f ) {
                                o = u * r[ f ] + s[ i + f ]; // Multiply digits and add to partial sum.
                                n = Math.floor( o / l ); // Calculate carry.
                                s[ i + f ] = o - n * l; // Store current digit.
                                s[ i + f + 1 ] += n; // Add carry to next position.
                            }
                        }
                        return c( s ), s; // Trim zeros and return.
                    }

                    // Multiplies a number array `t` by a single JavaScript number `r`.
                    function N( t, r ) {
                        var o, n, i = t.length,
                            u = new Array( i ),
                            p = e,
                            a = 0;
                        for ( n = 0; n < i; n++ ) {
                            o = t[ n ] * r + a; // Multiply digit by `r` and add carry.
                            a = Math.floor( o / p ); // New carry.
                            u[ n ] = o - a * p; // Store current digit.
                        }
                        for ( ; a > 0; ) {
                            u[ n++ ] = a % p; // Add remaining carries.
                            a = Math.floor( a / p );
                        }
                        return u;
                    }

                    // Prepends `e` zeros to the array `t`.
                    function E( t, e ) {
                        for ( var r = []; e-- > 0; ) {
                            r.push( 0 );
                        }
                        return r.concat( t );
                    }

                    // Creates a new `s` (large BigNumber) instance from `r` (array) and `o` (sign).
                    // `t` is a small number; it determines whether to use `N` or `M`.
                    function O( t, r, o ) {
                        return new s( t < e ? N( r, t ) : M( r, y( t ) ), o );
                    }

                    // Squares a number array `t`.
                    function P( t ) {
                        var r, o, n, i, u = t.length,
                            p = g( u + u ), // Result array size is twice the length.
                            a = e;
                        for ( n = 0; n < u; n++ ) {
                            o = 0 - ( i = t[ n ] ) * i; // Initialize `o` with negative square of current digit.
                            for ( var s = n; s < u; s++ ) {
                                r = i * t[ s ] * 2 + p[ n + s ] + o; // Core multiplication logic for squaring.
                                o = Math.floor( r / a ); // Calculate carry.
                                p[ n + s ] = r - o * a; // Store current digit.
                            }
                            p[ n + u ] = o; // Add final carry.
                        }
                        return c( p ), p; // Trim zeros and return.
                    }

                    // Divides a number array `t` by a single JavaScript number `r`.
                    // Returns an array `[quotient_array, remainder_number]`.
                    function I( t, r ) {
                        var o, n, i, u, p = t.length,
                            a = g( p ),
                            s = e;
                        for ( i = 0, o = p - 1; o >= 0; --o ) {
                            i = ( u = i * s + t[ o ] ) - ( n = d( u / r ) ) * r; // Long division step.
                            a[ o ] = 0 | n; // Store quotient digit.
                        }
                        return [ a, 0 | i ]; // Return quotient array and remainder.
                    }

                    // Performs division and modulo operations for two BigNumber instances.
                    function x( t, r ) {
                        var o, n = Q( r ); // Convert divisor to BigNumber.
                        if ( p ) {
                            // If BigInt is supported, use native BigInt division.
                            return [ new f( t.value / n.value ), new f( t.value % n.value ) ];
                        }
                        var i, u = t.value,
                            v = n.value;
                        if ( 0 === v ) {
                            throw new Error( "Cannot divide by zero" ); // Handle division by zero.
                        }
                        if ( t.isSmall ) {
                            // If dividend is small.
                            return n.isSmall ?
                                // Both small, use native JS division.
                                [ new l( d( u / v ) ), new l( u % v ) ] :
                                // Dividend small, divisor large: quotient is 0, remainder is dividend.
                                [ a[ 0 ], t ];
                        }
                        if ( n.isSmall ) {
                            // If divisor is small.
                            if ( 1 === v ) {
                                return [ t, a[ 0 ] ]; // Divide by 1.
                            }
                            if ( -1 == v ) {
                                return [ t.negate(), a[ 0 ] ]; // Divide by -1.
                            }
                            var m = Math.abs( v );
                            if ( m < e ) {
                                // If absolute divisor is within base `e` range, use `I`.
                                i = h( ( o = I( u, m ) )[ 0 ] );
                                var b = o[ 1 ];
                                if ( t.sign ) {
                                    b = -b;
                                }
                                return "number" == typeof i ?
                                    ( t.sign !== n.sign && ( i = -i ), [ new l( i ), new l( b ) ] ) :
                                    [ new s( i, t.sign !== n.sign ), new l( b ) ];
                            }
                            v = y( m ); // Convert small divisor to array if it's too large for `I`.
                        }
                        var w = B( u, v ); // Compare magnitudes of dividend and divisor.
                        if ( -1 === w ) {
                            return [ a[ 0 ], t ]; // Dividend < Divisor, quotient is 0.
                        }
                        if ( 0 === w ) {
                            return [ a[ t.sign === n.sign ? 1 : -1 ], a[ 0 ] ]; // Dividend == Divisor, quotient is +/-1.
                        }
                        // Perform long division. Uses different algorithms based on length.
                        i = ( o = u.length + v.length <= 200 ?
                            function ( t, r ) {
                                // Optimized long division for relatively small arrays.
                                var o, n, i, u, p, a, s, l = t.length,
                                    f = r.length,
                                    v = e,
                                    y = g( r.length ),
                                    c = r[ f - 1 ],
                                    d = Math.ceil( v / ( 2 * c ) ),
                                    m = N( t, d ),
                                    b = N( r, d );
                                for ( m.length <= l && m.push( 0 ), b.push( 0 ), c = b[ f - 1 ], n = l - f; n >= 0; n-- ) {
                                    for (
                                        o = v - 1, m[ n + f ] !== c &&
                                        ( o = Math.floor( ( m[ n + f ] * v + m[ n + f - 1 ] ) / c ) ), i = 0, u = 0,
                                        a = b.length, p = 0; p < a; p++
                                    ) {
                                        i += o * b[ p ];
                                        s = Math.floor( i / v );
                                        u += m[ n + p ] - ( i - s * v );
                                        i = s;
                                        u < 0 ? ( m[ n + p ] = u + v, u = -1 ) : ( m[ n + p ] = u, u = 0 );
                                    }
                                    for ( ; 0 !== u; ) {
                                        for ( o -= 1, i = 0, p = 0; p < a; p++ ) {
                                            ( i += m[ n + p ] - v + b[ p ] ) < 0 ? ( m[ n + p ] = i + v, i = 0 ) : ( m[ n + p ] = i, i = 1 );
                                        }
                                        u += i;
                                    }
                                    y[ n ] = o;
                                }
                                return m = I( m, d )[ 0 ], [ h( y ), h( m ) ];
                            }( u, v ) :
                            function ( t, r ) {
                                // Standard long division for very large arrays.
                                for (
                                    var o, n, i, u, p, a = t.length, s = r.length, l = [], f = [], v = e; a;
                                ) {
                                    if ( f.unshift( t[ --a ] ), c( f ), B( f, r ) < 0 ) {
                                        l.push( 0 );
                                    } else {
                                        i = f[ ( n = f.length ) - 1 ] * v + f[ n - 2 ];
                                        u = r[ s - 1 ] * v + r[ s - 2 ];
                                        n > s && ( i = ( i + 1 ) * v );
                                        o = Math.ceil( i / u );
                                        do {
                                            if ( B( p = N( r, o ), f ) <= 0 ) {
                                                break;
                                            }
                                            o--;
                                        } while ( o );
                                        l.push( o );
                                        f = S( f, p );
                                    }
                                }
                                return l.reverse(), [ h( l ), h( f ) ];
                            }( u, v ) )[ 0 ];
                        var q = t.sign !== n.sign,
                            M = o[ 1 ],
                            E = t.sign;
                        // Construct and return quotient and remainder BigNumber instances.
                        return "number" == typeof i ?
                            ( q && ( i = -i ), i = new l( i ) ) :
                            i = new s( i, q ),
                            "number" == typeof M ?
                            ( E && ( M = -M ), M = new l( M ) ) :
                            M = new s( M, E ),
                            [ i, M ];
                    }

                    // Compares two number arrays (magnitudes only).
                    // Returns 1 if t > e, -1 if t < e, 0 if t == e.
                    function B( t, e ) {
                        if ( t.length !== e.length ) {
                            return t.length > e.length ? 1 : -1;
                        }
                        for ( var r = t.length - 1; r >= 0; r-- ) {
                            if ( t[ r ] !== e[ r ] ) {
                                return t[ r ] > e[ r ] ? 1 : -1;
                            }
                        }
                        return 0;
                    }

                    // Preliminary check for primality using small divisors.
                    function A( t ) {
                        var e = t.abs();
                        return !e.isUnit() &&
                            ( !!( e.equals( 2 ) || e.equals( 3 ) || e.equals( 5 ) ) ||
                                !( e.isEven() || e.isDivisibleBy( 3 ) || e.isDivisibleBy( 5 ) ) &&
                                ( !!e.lesser( 49 ) || void 0 ) );
                    }

                    // Miller-Rabin primality test.
                    function Z( t, e ) {
                        for ( var r, n, i, u = t.prev(), p = u, a = 0; p.isEven(); ) {
                            p = p.divide( 2 );
                            a++;
                        }
                        t: for ( n = 0; n < e.length; n++ ) {
                            if ( !( t.lesser( e[ n ] ) ) && !( i = o( e[ n ] ).modPow( p, t ) ).isUnit() && !i.equals( u ) ) {
                                for ( r = a - 1; 0 != r; r-- ) {
                                    if ( ( i = i.square().mod( t ) ).isUnit() ) {
                                        return !1;
                                    }
                                    if ( i.equals( u ) ) {
                                        continue t;
                                    }
                                }
                                return !1;
                            }
                        }
                        return !0;
                    }

                    // Set up prototype chains for inheritance.
                    s.prototype = Object.create( a.prototype );
                    l.prototype = Object.create( a.prototype );
                    f.prototype = Object.create( a.prototype );

                    // BigNumber.prototype.add method for large numbers.
                    s.prototype.add = function ( t ) {
                        var e = Q( t ); // Convert argument to BigNumber.
                        if ( this.sign !== e.sign ) {
                            return this.subtract( e.negate() ); // If signs differ, convert to subtraction.
                        }
                        var r = this.value,
                            o = e.value;
                        return e.isSmall ?
                            new s( w( r, Math.abs( o ) ), this.sign ) : // If other is small, use `w`.
                            new s( b( r, o ), this.sign ); // Otherwise, use `b` for array addition.
                    };
                    s.prototype.plus = s.prototype.add; // Alias 'plus'.

                    // BigNumber.prototype.add method for small numbers.
                    l.prototype.add = function ( t ) {
                        var e = Q( t ),
                            r = this.value;
                        if ( r < 0 !== e.sign ) {
                            return this.subtract( e.negate() );
                        }
                        var o = e.value;
                        if ( e.isSmall ) {
                            if ( v( r + o ) ) {
                                return new l( r + o ); // Both small and result fits.
                            }
                            o = y( Math.abs( o ) ); // Result too large, convert to array.
                        }
                        return new s( w( o, Math.abs( r ) ), r < 0 ); // Perform array addition.
                    };
                    l.prototype.plus = l.prototype.add; // Alias 'plus'.

                    // BigNumber.prototype.add method for BigInt numbers.
                    f.prototype.add = function ( t ) {
                        return new f( this.value + Q( t ).value );
                    };
                    f.prototype.plus = f.prototype.add; // Alias 'plus'.

                    // BigNumber.prototype.subtract method for large numbers.
                    s.prototype.subtract = function ( t ) {
                        var e = Q( t );
                        if ( this.sign !== e.sign ) {
                            return this.add( e.negate() ); // If signs differ, convert to addition.
                        }
                        var r = this.value,
                            o = e.value;
                        return e.isSmall ?
                            q( r, Math.abs( o ), this.sign ) : // If other is small, use `q`.
                            function ( t, e, r ) {
                                // Internal subtraction logic.
                                var o;
                                return B( t, e ) >= 0 ?
                                    o = S( t, e ) : // `t >= e`, perform `t - e`.
                                    ( o = S( e, t ), r = !r ), // `t < e`, perform `e - t` and flip sign.
                                    "number" == typeof ( o = h( o ) ) ?
                                    ( r && ( o = -o ), new l( o ) ) :
                                    new s( o, r );
                            }( r, o, this.sign );
                    };
                    s.prototype.minus = s.prototype.subtract; // Alias 'minus'.

                    // BigNumber.prototype.subtract method for small numbers.
                    l.prototype.subtract = function ( t ) {
                        var e = Q( t ),
                            r = this.value;
                        if ( r < 0 !== e.sign ) {
                            return this.add( e.negate() );
                        }
                        var o = e.value;
                        return e.isSmall ?
                            new l( r - o ) : // Both small, use native JS subtraction.
                            q( o, Math.abs( r ), r >= 0 ); // Other is large, use `q`.
                    };
                    l.prototype.minus = l.prototype.subtract; // Alias 'minus'.

                    // BigNumber.prototype.subtract method for BigInt numbers.
                    f.prototype.subtract = function ( t ) {
                        return new f( this.value - Q( t ).value );
                    };
                    f.prototype.minus = f.prototype.subtract; // Alias 'minus'.

                    // BigNumber.prototype.negate method for large numbers.
                    s.prototype.negate = function () {
                        return new s( this.value, !this.sign ); // Flip the sign.
                    };

                    // BigNumber.prototype.negate method for small numbers.
                    l.prototype.negate = function () {
                        var t = this.sign,
                            e = new l( -this.value );
                        return e.sign = !t, e; // Flip value and sign.
                    };

                    // BigNumber.prototype.negate method for BigInt numbers.
                    f.prototype.negate = function () {
                        return new f( -this.value );
                    };

                    // BigNumber.prototype.abs method for large numbers.
                    s.prototype.abs = function () {
                        return new s( this.value, !1 ); // Return with positive sign.
                    };

                    // BigNumber.prototype.abs method for small numbers.
                    l.prototype.abs = function () {
                        return new l( Math.abs( this.value ) ); // Return absolute value.
                    };

                    // BigNumber.prototype.abs method for BigInt numbers.
                    f.prototype.abs = function () {
                        return new f( this.value >= 0 ? this.value : -this.value );
                    };

                    // BigNumber.prototype.multiply method for large numbers.
                    s.prototype.multiply = function ( t ) {
                        var r, o, n, i = Q( t ),
                            u = this.value,
                            p = i.value,
                            l = this.sign !== i.sign; // Determine result sign.
                        if ( i.isSmall ) {
                            // Optimized for multiplication by small numbers.
                            if ( 0 === p ) {
                                return a[ 0 ];
                            }
                            if ( 1 === p ) {
                                return this;
                            }
                            if ( -1 === p ) {
                                return this.negate();
                            }
                            if ( ( r = Math.abs( p ) ) < e ) {
                                return new s( N( u, r ), l ); // Use `N` for small multiplier.
                            }
                            p = y( r ); // Convert small multiplier to array if too large for `N`.
                        }
                        o = u.length;
                        n = p.length;
                        return new s(
                            // Use Karatsuba algorithm for very large numbers, otherwise standard multiplication `M`.
                            -.012 * o - .012 * n + 15e-6 * o * n > 0 ?
                            function t( e, r ) {
                                // Karatsuba multiplication algorithm.
                                var o = Math.max( e.length, r.length );
                                if ( o <= 30 ) {
                                    return M( e, r );
                                }
                                o = Math.ceil( o / 2 );
                                var n = e.slice( o ),
                                    i = e.slice( 0, o ),
                                    u = r.slice( o ),
                                    p = r.slice( 0, o ),
                                    a = t( i, p ),
                                    s = t( n, u ),
                                    l = t( b( i, n ), b( p, u ) ),
                                    f = b( b( a, E( S( S( l, a ), s ), o ) ), E( s, 2 * o ) );
                                return c( f ), f;
                            }( u, p ) :
                            M( u, p ),
                            l
                        );
                    };
                    s.prototype.times = s.prototype.multiply; // Alias 'times'.

                    // Internal helper for small number multiplication by small.
                    l.prototype._multiplyBySmall = function ( t ) {
                        return v( t.value * this.value ) ?
                            new l( t.value * this.value ) :
                            O( Math.abs( t.value ), y( Math.abs( this.value ) ), this.sign !== t.sign );
                    };

                    // Internal helper for large number multiplication by small.
                    s.prototype._multiplyBySmall = function ( t ) {
                        return 0 === t.value ?
                            a[ 0 ] :
                            1 === t.value ?
                            this :
                            -1 === t.value ?
                            this.negate() :
                            O( Math.abs( t.value ), this.value, this.sign !== t.sign );
                    };

                    // BigNumber.prototype.multiply method for small numbers.
                    l.prototype.multiply = function ( t ) {
                        return Q( t )._multiplyBySmall( this );
                    };
                    l.prototype.times = l.prototype.multiply; // Alias 'times'.

                    // BigNumber.prototype.multiply method for BigInt numbers.
                    f.prototype.multiply = function ( t ) {
                        return new f( this.value * Q( t ).value );
                    };
                    f.prototype.times = f.prototype.multiply; // Alias 'times'.

                    // BigNumber.prototype.square method for large numbers.
                    s.prototype.square = function () {
                        return new s( P( this.value ), !1 );
                    };

                    // BigNumber.prototype.square method for small numbers.
                    l.prototype.square = function () {
                        var t = this.value * this.value;
                        return v( t ) ?
                            new l( t ) :
                            new s( P( y( Math.abs( this.value ) ) ), !1 );
                    };

                    // BigNumber.prototype.square method for BigInt numbers.
                    f.prototype.square = function ( t ) {
                        return new f( this.value * this.value );
                    };

                    // BigNumber.prototype.divmod method (returns an object with quotient and remainder).
                    s.prototype.divmod = function ( t ) {
                        var e = x( this, t ); // Perform division using `x`.
                        return {
                            quotient: e[ 0 ],
                            remainder: e[ 1 ]
                        };
                    };
                    f.prototype.divmod = l.prototype.divmod = s.prototype.divmod; // Share implementation.

                    // BigNumber.prototype.divide method (returns only the quotient).
                    s.prototype.divide = function ( t ) {
                        return x( this, t )[ 0 ];
                    };

                    // BigNumber.prototype.divide method for BigInt numbers.
                    f.prototype.over = f.prototype.divide = function ( t ) {
                        return new f( this.value / Q( t ).value );
                    };
                    l.prototype.over = l.prototype.divide = s.prototype.over = s.prototype.divide; // Share implementation.

                    // BigNumber.prototype.mod method (returns only the remainder).
                    s.prototype.mod = function ( t ) {
                        return x( this, t )[ 1 ];
                    };

                    // BigNumber.prototype.mod method for BigInt numbers.
                    f.prototype.mod = f.prototype.remainder = function ( t ) {
                        return new f( this.value % Q( t ).value );
                    };
                    l.prototype.remainder = l.prototype.mod = s.prototype.remainder = s.prototype.mod; // Share implementation.

                    // BigNumber.prototype.pow method for large numbers (exponentiation).
                    s.prototype.pow = function ( t ) {
                        var e, r, o, n = Q( t ),
                            i = this.value,
                            u = n.value;
                        if ( 0 === u ) {
                            return a[ 1 ]; // x^0 = 1.
                        }
                        if ( 0 === i ) {
                            return a[ 0 ]; // 0^y = 0 (for y > 0).
                        }
                        if ( 1 === i ) {
                            return a[ 1 ]; // 1^y = 1.
                        }
                        if ( -1 === i ) {
                            return n.isEven() ? a[ 1 ] : a[ -1 ]; // (-1)^y = 1 if y even, -1 if y odd.
                        }
                        if ( n.sign ) {
                            return a[ 0 ]; // x^negative = 0 (for integers, simplified).
                        }
                        if ( !n.isSmall ) {
                            throw new Error( "The exponent " + n.toString() + " is too large." );
                        }
                        if ( this.isSmall && v( e = Math.pow( i, u ) ) ) {
                            return new l( d( e ) ); // If base and exponent are small and result fits.
                        }
                        // Binary exponentiation (exponentiation by squaring).
                        for ( r = this, o = a[ 1 ]; !0 & u && ( o = o.times( r ), --u ), 0 !== u; ) {
                            u /= 2;
                            r = r.square();
                        }
                        return o;
                    };
                    l.prototype.pow = s.prototype.pow; // Share implementation.

                    // BigNumber.prototype.pow method for BigInt numbers.
                    f.prototype.pow = function ( t ) {
                        var e = Q( t ),
                            r = this.value,
                            o = e.value,
                            n = BigInt( 0 ),
                            i = BigInt( 1 ),
                            u = BigInt( 2 );
                        if ( o === n ) {
                            return a[ 1 ];
                        }
                        if ( r === n ) {
                            return a[ 0 ];
                        }
                        if ( r === i ) {
                            return a[ 1 ];
                        }
                        if ( r === BigInt( -1 ) ) {
                            return e.isEven() ? a[ 1 ] : a[ -1 ];
                        }
                        if ( e.isNegative() ) {
                            return new f( n );
                        }
                        // Binary exponentiation for BigInt.
                        for ( var p = this, s = a[ 1 ]; ( o & i ) === i && ( s = s.times( p ), --o ), o !== n; ) {
                            o /= u;
                            p = p.square();
                        }
                        return s;
                    };

                    // BigNumber.prototype.modPow method (modular exponentiation).
                    s.prototype.modPow = function ( t, e ) {
                        if ( t = Q( t ), ( e = Q( e ) ).isZero() ) {
                            throw new Error( "Cannot take modPow with modulus 0" );
                        }
                        var r = a[ 1 ],
                            o = this.mod( e );
                        // Handle negative exponent (modular inverse).
                        for ( t.isNegative() && ( t = t.multiply( a[ -1 ] ), o = o.modInv( e ) ); t.isPositive(); ) {
                            if ( o.isZero() ) {
                                return a[ 0 ];
                            }
                            t.isOdd() && ( r = r.multiply( o ).mod( e ) ); // If exponent is odd, multiply result.
                            t = t.divide( 2 ); // Halve exponent.
                            o = o.square().mod( e ); // Square base.
                        }
                        return r;
                    };
                    f.prototype.modPow = l.prototype.modPow = s.prototype.modPow; // Share implementation.

                    // BigNumber.prototype.compareAbs method (compares absolute values).
                    s.prototype.compareAbs = function ( t ) {
                        var e = Q( t ),
                            r = this.value,
                            o = e.value;
                        return e.isSmall ? 1 : B( r, o ); // If other is small, current is greater. Otherwise, use `B`.
                    };

                    // BigNumber.prototype.compareAbs method for small numbers.
                    l.prototype.compareAbs = function ( t ) {
                        var e = Q( t ),
                            r = Math.abs( this.value ),
                            o = e.value;
                        return e.isSmall ?
                            r === ( o = Math.abs( o ) ) ?
                            0 :
                            r > o ?
                            1 :
                            -1 :
                            -1;
                    };

                    // BigNumber.prototype.compareAbs method for BigInt numbers.
                    f.prototype.compareAbs = function ( t ) {
                        var e = this.value,
                            r = Q( t ).value;
                        return ( e = e >= 0 ? e : -e ) === ( r = r >= 0 ? r : -r ) ?
                            0 :
                            e > r ?
                            1 :
                            -1;
                    };

                    // BigNumber.prototype.compare method (full comparison, including sign).
                    s.prototype.compare = function ( t ) {
                        if ( t === 1 / 0 ) {
                            return -1; // Current is less than positive infinity.
                        }
                        if ( t === -1 / 0 ) {
                            return 1; // Current is greater than negative infinity.
                        }
                        var e = Q( t ),
                            r = this.value,
                            o = e.value;
                        return this.sign !== e.sign ?
                            e.sign ?
                            1 :
                            -1 : // If signs differ, negative is smaller.
                            e.isSmall ?
                            this.sign ?
                            -1 :
                            1 : // If other is small, current is larger.
                            B( r, o ) * ( this.sign ? -1 : 1 ); // Compare magnitudes, adjust by sign.
                    };
                    s.prototype.compareTo = s.prototype.compare; // Alias 'compareTo'.

                    // BigNumber.prototype.compare method for small numbers.
                    l.prototype.compare = function ( t ) {
                        if ( t === 1 / 0 ) {
                            return -1;
                        }
                        if ( t === -1 / 0 ) {
                            return 1;
                        }
                        var e = Q( t ),
                            r = this.value,
                            o = e.value;
                        return e.isSmall ?
                            r == o ?
                            0 :
                            r > o ?
                            1 :
                            -1 :
                            r < 0 !== e.sign ?
                            r < 0 ?
                            -1 :
                            1 :
                            r < 0 ?
                            1 :
                            -1;
                    };
                    l.prototype.compareTo = l.prototype.compare; // Alias 'compareTo'.

                    // BigNumber.prototype.compare method for BigInt numbers.
                    f.prototype.compare = function ( t ) {
                        if ( t === 1 / 0 ) {
                            return -1;
                        }
                        if ( t === -1 / 0 ) {
                            return 1;
                        }
                        var e = this.value,
                            r = Q( t ).value;
                        return e === r ? 0 : e > r ? 1 : -1;
                    };
                    f.prototype.compareTo = f.prototype.compare; // Alias 'compareTo'.

                    // BigNumber.prototype.equals method.
                    s.prototype.equals = function ( t ) {
                        return 0 === this.compare( t );
                    };
                    f.prototype.eq = f.prototype.equals = l.prototype.eq = l.prototype.equals = s.prototype.eq = s.prototype.equals; // Aliases.

                    // BigNumber.prototype.notEquals method.
                    s.prototype.notEquals = function ( t ) {
                        return 0 !== this.compare( t );
                    };
                    f.prototype.neq = f.prototype.notEquals = l.prototype.neq = l.prototype.notEquals = s.prototype.neq = s.prototype.notEquals; // Aliases.

                    // BigNumber.prototype.greater method.
                    s.prototype.greater = function ( t ) {
                        return this.compare( t ) > 0;
                    };
                    f.prototype.gt = f.prototype.greater = l.prototype.gt = l.prototype.greater = s.prototype.gt = s.prototype.greater; // Aliases.

                    // BigNumber.prototype.lesser method.
                    s.prototype.lesser = function ( t ) {
                        return this.compare( t ) < 0;
                    };
                    f.prototype.lt = f.prototype.lesser = l.prototype.lt = l.prototype.lesser = s.prototype.lt = s.prototype.lesser; // Aliases.

                    // BigNumber.prototype.greaterOrEquals method.
                    s.prototype.greaterOrEquals = function ( t ) {
                        return this.compare( t ) >= 0;
                    };
                    f.prototype.geq = f.prototype.greaterOrEquals = l.prototype.geq = l.prototype.greaterOrEquals = s.prototype.geq = s.prototype.greaterOrEquals; // Aliases.

                    // BigNumber.prototype.lesserOrEquals method.
                    s.prototype.lesserOrEquals = function ( t ) {
                        return this.compare( t ) <= 0;
                    };
                    f.prototype.leq = f.prototype.lesserOrEquals = l.prototype.leq = l.prototype.lesserOrEquals = s.prototype.leq = s.prototype.lesserOrEquals; // Aliases.

                    // BigNumber.prototype.isEven method.
                    s.prototype.isEven = function () {
                        return 0 == ( 1 & this.value[ 0 ] ); // Check the least significant digit.
                    };
                    l.prototype.isEven = function () {
                        return 0 == ( 1 & this.value ); // Check the number itself.
                    };
                    f.prototype.isEven = function () {
                        return ( this.value & BigInt( 1 ) ) === BigInt( 0 );
                    };

                    // BigNumber.prototype.isOdd method.
                    s.prototype.isOdd = function () {
                        return 1 == ( 1 & this.value[ 0 ] );
                    };
                    l.prototype.isOdd = function () {
                        return 1 == ( 1 & this.value );
                    };
                    f.prototype.isOdd = function () {
                        return ( this.value & BigInt( 1 ) ) === BigInt( 1 );
                    };

                    // BigNumber.prototype.isPositive method.
                    s.prototype.isPositive = function () {
                        return !this.sign;
                    };
                    l.prototype.isPositive = function () {
                        return this.value > 0;
                    };
                    f.prototype.isPositive = l.prototype.isPositive; // Share implementation.

                    // BigNumber.prototype.isNegative method.
                    s.prototype.isNegative = function () {
                        return this.sign;
                    };
                    l.prototype.isNegative = function () {
                        return this.value < 0;
                    };
                    f.prototype.isNegative = l.prototype.isNegative; // Share implementation.

                    // BigNumber.prototype.isUnit method (checks if absolute value is 1).
                    s.prototype.isUnit = function () {
                        return !1; // Large numbers are generally not unit (unless they are 1).
                    };
                    l.prototype.isUnit = function () {
                        return 1 === Math.abs( this.value );
                    };
                    f.prototype.isUnit = function () {
                        return this.abs().value === BigInt( 1 );
                    };

                    // BigNumber.prototype.isZero method.
                    s.prototype.isZero = function () {
                        return !1; // Large numbers are not zero (unless their array is empty).
                    };
                    l.prototype.isZero = function () {
                        return 0 === this.value;
                    };
                    f.prototype.isZero = function () {
                        return this.value === BigInt( 0 );
                    };

                    // BigNumber.prototype.isDivisibleBy method.
                    s.prototype.isDivisibleBy = function ( t ) {
                        var e = Q( t );
                        return !e.isZero() &&
                            ( !!e.isUnit() ||
                                ( 0 === e.compareAbs( 2 ) ? this.isEven() : this.mod( e ).isZero() ) );
                    };
                    f.prototype.isDivisibleBy = l.prototype.isDivisibleBy = s.prototype.isDivisibleBy; // Share implementation.

                    // BigNumber.prototype.isPrime method (primality test).
                    s.prototype.isPrime = function ( t ) {
                        var e = A( this ); // Preliminary small divisor checks.
                        if ( void 0 !== e ) {
                            return e;
                        }
                        var r = this.abs(),
                            n = r.bitLength();
                        if ( n <= 64 ) {
                            return Z( r, [ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37 ] ); // Use fixed bases for small numbers.
                        }
                        for (
                            var i = Math.log( 2 ) * n.toJSNumber(),
                                u = Math.ceil( !0 === t ? 2 * Math.pow( i, 2 ) : i ),
                                p = [],
                                a = 0; a < u; a++
                        ) {
                            p.push( o( a + 2 ) ); // Generate bases for larger numbers.
                        }
                        return Z( r, p ); // Run Miller-Rabin with generated bases.
                    };
                    f.prototype.isPrime = l.prototype.isPrime = s.prototype.isPrime; // Share implementation.

                    // BigNumber.prototype.isProbablePrime method (probabilistic primality test).
                    s.prototype.isProbablePrime = function ( t ) {
                        var e = A( this );
                        if ( void 0 !== e ) {
                            return e;
                        }
                        for (
                            var r = this.abs(),
                                n = void 0 === t ? 5 : t, // Number of iterations (default 5).
                                i = [],
                                u = 0; u < n; u++
                        ) {
                            i.push( o.randBetween( 2, r.minus( 2 ) ) ); // Generate random bases.
                        }
                        return Z( r, i ); // Run Miller-Rabin with random bases.
                    };
                    f.prototype.isProbablePrime = l.prototype.isProbablePrime = s.prototype.isProbablePrime; // Share implementation.

                    // BigNumber.prototype.modInv method (modular multiplicative inverse).
                    s.prototype.modInv = function ( t ) {
                        for (
                            var e, r, n, i = o.zero, u = o.one, p = Q( t ), a = this.abs(); !a.isZero();
                        ) {
                            // Extended Euclidean algorithm.
                            e = p.divide( a );
                            r = i;
                            n = p;
                            i = u;
                            p = a;
                            u = r.subtract( e.multiply( u ) );
                            a = n.subtract( e.multiply( a ) );
                        }
                        if ( !p.isUnit() ) {
                            throw new Error( this.toString() + " and " + t.toString() + " are not co-prime" );
                        }
                        if ( -1 === i.compare( 0 ) ) {
                            i = i.add( t ); // Adjust result to be positive.
                        }
                        return this.isNegative() ? i.negate() : i; // Adjust sign if original number was negative.
                    };
                    f.prototype.modInv = l.prototype.modInv = s.prototype.modInv; // Share implementation.

                    // BigNumber.prototype.next method (increment by 1).
                    s.prototype.next = function () {
                        var t = this.value;
                        return this.sign ?
                            q( t, 1, this.sign ) : // If negative, decrement magnitude.
                            new s( w( t, 1 ), this.sign ); // If positive, increment magnitude.
                    };

                    // BigNumber.prototype.next method for small numbers.
                    l.prototype.next = function () {
                        var t = this.value;
                        return t + 1 < n ? new l( t + 1 ) : new s( i, !1 ); // Handle overflow to large number.
                    };

                    // BigNumber.prototype.next method for BigInt numbers.
                    f.prototype.next = function () {
                        return new f( this.value + BigInt( 1 ) );
                    };

                    // BigNumber.prototype.prev method (decrement by 1).
                    s.prototype.prev = function () {
                        var t = this.value;
                        return this.sign ?
                            new s( w( t, 1 ), !0 ) : // If negative, increment magnitude.
                            q( t, 1, this.sign ); // If positive, decrement magnitude.
                    };

                    // BigNumber.prototype.prev method for small numbers.
                    l.prototype.prev = function () {
                        var t = this.value;
                        return t - 1 > -n ? new l( t - 1 ) : new s( i, !0 ); // Handle underflow to large number.
                    };

                    // BigNumber.prototype.prev method for BigInt numbers.
                    f.prototype.prev = function () {
                        return new f( this.value - BigInt( 1 ) );
                    };

                    // Initialize powers of 2 up to base `e` for bitwise operations.
                    for ( var j = [ 1 ]; 2 * j[ j.length - 1 ] <= e; ) {
                        j.push( 2 * j[ j.length - 1 ] );
                    }
                    var J = j.length,
                        L = j[ J - 1 ];

                    // Check if a number `t` is small enough to be a native integer.
                    function T( t ) {
                        return Math.abs( t ) <= e;
                    }

                    // Generic helper for bitwise operations (AND, OR, XOR).
                    function U( t, e, r ) {
                        e = Q( e );
                        for (
                            var n = t.isNegative(),
                                i = e.isNegative(),
                                u = n ? t.not() : t, // Two's complement for negative numbers.
                                p = i ? e.not() : e,
                                a = 0,
                                s = 0,
                                l = null,
                                f = null,
                                v = []; // Stores results of bitwise operations on segments.
                            !u.isZero() || !p.isZero(); // Continue until both numbers are zero.
                        ) {
                            // Extract segments (digits) of the numbers using division by `L`.
                            a = ( l = x( u, L ) )[ 1 ].toJSNumber();
                            if ( n ) {
                                a = L - 1 - a; // Adjust for two's complement if negative.
                            }
                            s = ( f = x( p, L ) )[ 1 ].toJSNumber();
                            if ( i ) {
                                s = L - 1 - s; // Adjust for two's complement if negative.
                            }
                            u = l[ 0 ]; // Remaining part of `u`.
                            p = f[ 0 ]; // Remaining part of `p`.
                            v.push( r( a, s ) ); // Apply bitwise operation to segments.
                        }
                        // Reconstruct the result from segments.
                        for (
                            var y = 0 !== r( n ? 1 : 0, i ? 1 : 0 ) ? o( -1 ) : o( 0 ), // Determine initial sign.
                                h = v.length - 1; h >= 0; h -= 1
                        ) {
                            y = y.multiply( L ).add( o( v[ h ] ) );
                        }
                        return y;
                    }

                    // BigNumber.prototype.shiftLeft method.
                    s.prototype.shiftLeft = function ( t ) {
                        var e = Q( t ).toJSNumber(); // Convert shift amount to number.
                        if ( !T( e ) ) {
                            throw new Error( String( e ) + " is too large for shifting." );
                        }
                        if ( e < 0 ) {
                            return this.shiftRight( -e ); // Negative shift left is shift right.
                        }
                        var r = this;
                        if ( r.isZero() ) {
                            return r;
                        }
                        // Perform shifts in chunks of `J` (log2(L)).
                        for ( ; e >= J; ) {
                            r = r.multiply( L );
                            e -= J - 1; // Adjust `e` by `J-1` due to how `j` is constructed.
                        }
                        return r.multiply( j[ e ] ); // Final shift by remaining amount.
                    };
                    f.prototype.shiftLeft = l.prototype.shiftLeft = s.prototype.shiftLeft; // Share implementation.

                    // BigNumber.prototype.shiftRight method.
                    s.prototype.shiftRight = function ( t ) {
                        var e, r = Q( t ).toJSNumber();
                        if ( !T( r ) ) {
                            throw new Error( String( r ) + " is too large for shifting." );
                        }
                        if ( r < 0 ) {
                            return this.shiftLeft( -r ); // Negative shift right is shift left.
                        }
                        for ( var o = this; r >= J; ) {
                            if ( o.isZero() || o.isNegative() && o.isUnit() ) {
                                return o; // Shifting negative unit or zero results in itself.
                            }
                            o = ( e = x( o, L ) )[ 1 ].isNegative() ? e[ 0 ].prev() : e[ 0 ]; // Divide by `L`.
                            r -= J - 1;
                        }
                        return ( e = x( o, j[ r ] ) )[ 1 ].isNegative() ? e[ 0 ].prev() : e[ 0 ]; // Final division.
                    };
                    f.prototype.shiftRight = l.prototype.shiftRight = s.prototype.shiftRight; // Share implementation.

                    // BigNumber.prototype.not method (bitwise NOT, two's complement).
                    s.prototype.not = function () {
                        return this.negate().prev(); // Equivalent to -(this + 1).
                    };
                    f.prototype.not = l.prototype.not = s.prototype.not; // Share implementation.

                    // BigNumber.prototype.and method (bitwise AND).
                    s.prototype.and = function ( t ) {
                        return U( this, t, function ( t, e ) {
                            return t & e;
                        } );
                    };
                    f.prototype.and = l.prototype.and = s.prototype.and; // Share implementation.

                    // BigNumber.prototype.or method (bitwise OR).
                    s.prototype.or = function ( t ) {
                        return U( this, t, function ( t, e ) {
                            return t | e;
                        } );
                    };
                    f.prototype.or = l.prototype.or = s.prototype.or; // Share implementation.

                    // BigNumber.prototype.xor method (bitwise XOR).
                    s.prototype.xor = function ( t ) {
                        return U( this, t, function ( t, e ) {
                            return t ^ e;
                        } );
                    };
                    f.prototype.xor = l.prototype.xor = s.prototype.xor; // Share implementation.

                    // Constants for bit manipulation in `C`.
                    var _ = 1 << 30,
                        k = ( e & -e ) * ( e & -e ) | _;

                    // Calculate C, used in GCD.
                    function C( t ) {
                        var r = t.value,
                            o = "number" == typeof r ?
                            r | _ :
                            "bigint" == typeof r ?
                            r | BigInt( _ ) :
                            r[ 0 ] + r[ 1 ] * e | k; // Combine parts of array for bitwise ops.
                        return o & -o; // Returns the lowest set bit.
                    }

                    // Static max function.
                    function D( t, e ) {
                        return t = Q( t ), e = Q( e ), t.greater( e ) ? t : e;
                    }

                    // Static min function.
                    function z( t, e ) {
                        return t = Q( t ), e = Q( e ), t.lesser( e ) ? t : e;
                    }

                    // Static Greatest Common Divisor (GCD) function.
                    function R( t, e ) {
                        if ( t = Q( t ).abs(), e = Q( e ).abs(), t.equals( e ) ) {
                            return t;
                        }
                        if ( t.isZero() ) {
                            return e;
                        }
                        if ( e.isZero() ) {
                            return t;
                        }
                        for ( var r, o, n = a[ 1 ]; t.isEven() && e.isEven(); ) {
                            // If both even, divide by common power of 2 and multiply result.
                            r = z( C( t ), C( e ) );
                            t = t.divide( r );
                            e = e.divide( r );
                            n = n.multiply( r );
                        }
                        for ( ; t.isEven(); ) {
                            t = t.divide( C( t ) ); // Remove powers of 2 from t.
                        }
                        do {
                            for ( ; e.isEven(); ) {
                                e = e.divide( C( e ) ); // Remove powers of 2 from e.
                            }
                            if ( t.greater( e ) ) {
                                o = e;
                                e = t;
                                t = o; // Swap if t > e.
                            }
                            e = e.subtract( t ); // Euclidean algorithm step.
                        } while ( !e.isZero() );
                        return n.isUnit() ? t : t.multiply( n ); // Multiply back common factors of 2.
                    }

                    // BigNumber.prototype.bitLength method.
                    s.prototype.bitLength = function () {
                        var t = this;
                        if ( t.compareTo( o( 0 ) ) < 0 ) {
                            t = t.negate().subtract( o( 1 ) ); // For negative numbers, bit length of `x` is bit length of `|x|-1`.
                        }
                        return 0 === t.compareTo( o( 0 ) ) ?
                            o( 0 ) :
                            o(
                                function t( e, r ) {
                                    // Recursive helper to find bit length.
                                    if ( r.compareTo( e ) <= 0 ) {
                                        var n = t( e, r.square() ),
                                            i = n.p,
                                            u = n.e,
                                            p = i.multiply( r );
                                        return p.compareTo( e ) <= 0 ?
                                            {
                                                p: p,
                                                e: 2 * u + 1
                                            } :
                                            {
                                                p: i,
                                                e: 2 * u
                                            };
                                    }
                                    return {
                                        p: o( 1 ),
                                        e: 0
                                    };
                                }( t, o( 2 ) ).e
                            ).add( o( 1 ) );
                    };
                    f.prototype.bitLength = l.prototype.bitLength = s.prototype.bitLength; // Share implementation.

                    // Converts a string `t` to a BigNumber in a given base `e`.
                    var F = function ( t, e, r, o ) {
                        r = r || u; // Default character set.
                        t = String( t );
                        if ( !o ) {
                            t = t.toLowerCase();
                            r = r.toLowerCase();
                        }
                        var n, i = t.length,
                            p = Math.abs( e ),
                            a = {}; // Map characters to digit values.
                        for ( n = 0; n < r.length; n++ ) {
                            a[ r[ n ] ] = n;
                        }
                        for ( n = 0; n < i; n++ ) {
                            var f;
                            if ( "-" !== ( f = t[ n ] ) && ( f in a && a[ f ] >= p ) ) {
                                if ( "1" === f && 1 === p ) {
                                    continue;
                                }
                                throw new Error( f + " is not a valid digit in base " + e + "." );
                            }
                        }
                        e = Q( e ); // Convert base to BigNumber.
                        var s = [],
                            l = "-" === t[ 0 ]; // Check for negative sign.
                        for ( n = l ? 1 : 0; n < t.length; n++ ) {
                            var f;
                            if ( ( f = t[ n ] ) in a ) {
                                s.push( Q( a[ f ] ) ); // Push digit as BigNumber.
                            } else {
                                if ( "<" !== f ) {
                                    throw new Error( f + " is not a valid character" );
                                }
                                var v = n;
                                do {
                                    n++;
                                } while ( ">" !== t[ n ] && n < t.length );
                                s.push( Q( t.slice( v + 1, n ) ) ); // Handle custom digits like <123>.
                            }
                        }
                        return $( s, e, l ); // Convert array of digits to BigNumber.
                    };

                    // Converts an array of BigNumber digits `t` in base `e` to a single BigNumber.
                    function $( t, e, r ) {
                        var o, n = a[ 0 ],
                            i = a[ 1 ];
                        for ( o = t.length - 1; o >= 0; o-- ) {
                            n = n.add( t[ o ].times( i ) ); // n = n + digit * power_of_base.
                            i = i.times( e ); // power_of_base = power_of_base * base.
                        }
                        return r ? n.negate() : n; // Apply sign.
                    }

                    // Converts a BigNumber `t` to an array of digits in a given base `e`.
                    function G( t, e ) {
                        if ( ( e = o( e ) ).isZero() ) {
                            if ( t.isZero() ) {
                                return {
                                    value: [ 0 ],
                                    isNegative: !1
                                };
                            }
                            throw new Error( "Cannot convert nonzero numbers to base 0." );
                        }
                        if ( e.equals( -1 ) ) {
                            // Special handling for base -1.
                            if ( t.isZero() ) {
                                return {
                                    value: [ 0 ],
                                    isNegative: !1
                                };
                            }
                            if ( t.isNegative() ) {
                                return {
                                    value: [].concat.apply( [],
                                        Array.apply( null, Array( -t.toJSNumber() ) )
                                        .map( Array.prototype.valueOf, [ 1, 0 ] )
                                    ),
                                    isNegative: !1
                                };
                            }
                            var r = Array.apply( null, Array( t.toJSNumber() - 1 ) )
                                .map( Array.prototype.valueOf, [ 0, 1 ] );
                            return r.unshift( [ 1 ] ), {
                                value: [].concat.apply( [], r ),
                                isNegative: !1
                            };
                        }
                        var n = !1;
                        if ( t.isNegative() && e.isPositive() && ( n = !0, t = t.abs() ) ) {} // Adjust for negative input and positive base.
                        if ( e.isUnit() ) {
                            // Special handling for base 1.
                            return t.isZero() ?
                                {
                                    value: [ 0 ],
                                    isNegative: !1
                                } :
                                {
                                    value: Array.apply( null, Array( t.toJSNumber() ) )
                                        .map( Number.prototype.valueOf, 1 ),
                                    isNegative: n
                                };
                        }
                        for ( var i, u = [], p = t; p.isNegative() || p.compareAbs( e ) >= 0; ) {
                            i = p.divmod( e ); // Repeatedly divide by base.
                            p = i.quotient;
                            var a = i.remainder;
                            if ( a.isNegative() ) {
                                a = e.minus( a ).abs(); // Adjust negative remainder.
                                p = p.next(); // Adjust quotient.
                            }
                            u.push( a.toJSNumber() ); // Store remainder.
                        }
                        return u.push( p.toJSNumber() ), {
                            value: u.reverse(),
                            isNegative: n
                        }; // Reverse and return.
                    }

                    // Converts a BigNumber `t` to a string representation in a given base `e` with characters `r`.
                    function H( t, e, r ) {
                        var o = G( t, e ); // Convert to digit array.
                        return ( o.isNegative ? "-" : "" ) +
                            o.value.map( function ( t ) {
                                return function ( t, e ) {
                                    return t < ( e = e || u ).length ? e[ t ] : "<" + t + ">"; // Map digit value to character.
                                }( t, r );
                            } ).join( "" );
                    }

                    // Converts a string `t` to a BigNumber (integer parsing).
                    function K( t ) {
                        if ( v( +t ) ) {
                            // If it's a small number that fits into a JS number.
                            var e = +t;
                            if ( e === d( e ) ) {
                                return p ? new f( BigInt( e ) ) : new l( e );
                            }
                            throw new Error( "Invalid integer: " + t );
                        }
                        var o = "-" === t[ 0 ]; // Check for negative sign.
                        if ( o ) {
                            t = t.slice( 1 );
                        }
                        var n = t.split( /e/i ); // Handle scientific notation.
                        if ( n.length > 2 ) {
                            throw new Error( "Invalid integer: " + n.join( "e" ) );
                        }
                        if ( 2 === n.length ) {
                            var i = n[ 1 ];
                            if ( "+" === i[ 0 ] ) {
                                i = i.slice( 1 );
                            }
                            if ( ( i = +i ) !== d( i ) || !v( i ) ) {
                                throw new Error( "Invalid integer: " + i + " is not a valid exponent." );
                            }
                            var u = n[ 0 ],
                                a = u.indexOf( "." );
                            if ( a >= 0 ) {
                                i -= u.length - a - 1;
                                u = u.slice( 0, a ) + u.slice( a + 1 );
                            }
                            if ( i < 0 ) {
                                throw new Error( "Cannot include negative exponent part for integers" );
                            }
                            t = u += new Array( i + 1 ).join( "0" ); // Apply exponent by padding zeros.
                        }
                        if ( !/^([0-9][0-9]*)$/.test( t ) ) {
                            throw new Error( "Invalid integer: " + t );
                        }
                        if ( p ) {
                            return new f( BigInt( o ? "-" + t : t ) ); // Use BigInt if available.
                        }
                        // Convert string to number array.
                        for ( var y = [], h = t.length, g = r, m = h - g; h > 0; ) {
                            y.push( +t.slice( m, h ) );
                            if ( ( m -= g ) < 0 ) {
                                m = 0;
                            }
                            h -= g;
                        }
                        return c( y ), new s( y, o ); // Trim zeros and return.
                    }

                    // Universal converter to BigNumber instance.
                    function Q( t ) {
                        return "number" == typeof t ?
                            function ( t ) {
                                if ( p ) {
                                    return new f( BigInt( t ) );
                                }
                                if ( v( t ) ) {
                                    if ( t !== d( t ) ) {
                                        throw new Error( t + " is not an integer." );
                                    }
                                    return new l( t );
                                }
                                return K( t.toString() );
                            }( t ) :
                            "string" == typeof t ?
                            K( t ) :
                            "bigint" == typeof t ?
                            new f( t ) :
                            t; // If already a BigNumber instance, return it.
                    }

                    // BigNumber.prototype.toArray method.
                    s.prototype.toArray = function ( t ) {
                        return G( this, t );
                    };
                    l.prototype.toArray = function ( t ) {
                        return G( this, t );
                    };
                    f.prototype.toArray = function ( t ) {
                        return G( this, t );
                    };

                    // BigNumber.prototype.toString method for large numbers.
                    s.prototype.toString = function ( t, e ) {
                        if ( void 0 === t && ( t = 10 ), 10 !== t ) {
                            return H( this, t, e ); // If not base 10, use `H`.
                        }
                        for (
                            var r, o = this.value, n = o.length, i = String( o[ --n ] ); --n >= 0;
                        ) {
                            r = String( o[ n ] );
                            i += "0000000".slice( r.length ) + r; // Pad digits with leading zeros.
                        }
                        return ( this.sign ? "-" : "" ) + i; // Prepend sign.
                    };

                    // BigNumber.prototype.toString method for small numbers.
                    l.prototype.toString = function ( t, e ) {
                        return void 0 === t && ( t = 10 ), 10 != t ? H( this, t, e ) : String( this.value );
                    };
                    f.prototype.toString = l.prototype.toString; // Share implementation.

                    // JSON serialization for all BigNumber types.
                    f.prototype.toJSON = s.prototype.toJSON = l.prototype.toJSON = function () {
                        return this.toString();
                    };

                    // BigNumber.prototype.valueOf / toJSNumber for large numbers.
                    s.prototype.valueOf = function () {
                        return parseInt( this.toString(), 10 );
                    };
                    s.prototype.toJSNumber = s.prototype.valueOf; // Alias.

                    // BigNumber.prototype.valueOf / toJSNumber for small numbers.
                    l.prototype.valueOf = function () {
                        return this.value;
                    };
                    l.prototype.toJSNumber = l.prototype.valueOf; // Alias.

                    // BigNumber.prototype.valueOf / toJSNumber for BigInt numbers.
                    f.prototype.valueOf = f.prototype.toJSNumber = function () {
                        return parseInt( this.toString(), 10 );
                    };

                    // Pre-populate a cache for small BigNumber instances (0 to 999 and their negatives).
                    for ( var V = 0; V < 1e3; V++ ) {
                        a[ V ] = Q( V );
                        if ( V > 0 ) {
                            a[ -V ] = Q( -V );
                        }
                    }

                    // Add static utility methods to the main BigNumber function `a`.
                    a.one = a[ 1 ];
                    a.zero = a[ 0 ];
                    a.minusOne = a[ -1 ];
                    a.max = D; // Maximum of two BigNumbers.
                    a.min = z; // Minimum of two BigNumbers.
                    a.gcd = R; // Greatest Common Divisor.

                    // Static Least Common Multiple (LCM) function.
                    a.lcm = function ( t, e ) {
                        return t = Q( t ).abs(), e = Q( e ).abs(), t.divide( R( t, e ) ).multiply( e );
                    };

                    // Static instance check.
                    a.isInstance = function ( t ) {
                        return t instanceof s || t instanceof l || t instanceof f;
                    };

                    // Static random number generation between two BigNumber bounds.
                    a.randBetween = function ( t, r ) {
                        var o = z( t = Q( t ), r = Q( r ) ), // Ensure t <= r.
                            n = D( t, r ).subtract( o ).add( 1 ); // Range size.
                        if ( n.isSmall ) {
                            return o.add( Math.floor( Math.random() * n ) ); // If range is small, use native random.
                        }
                        for (
                            var i = G( n, e ).value, // Convert range to array of digits.
                                u = [],
                                p = !0,
                                s = 0; s < i.length; s++
                        ) {
                            var l = p ? i[ s ] : e,
                                f = d( Math.random() * l );
                            u.push( f );
                            if ( f < l ) {
                                p = !1;
                            }
                        }
                        return o.add( a.fromArray( u, e, !1 ) ); // Add random offset to lower bound.
                    };

                    // Static function to create BigNumber from array of digits.
                    a.fromArray = function ( t, e, r ) {
                        return $( t.map( Q ), Q( e || 10 ), r );
                    };

                    return a; // Return the main BigNumber factory function.
                }();

            // Export logic for the module, handling CommonJS and AMD.
            if ( t.hasOwnProperty( "exports" ) ) {
                t.exports = o;
            }
            if ( void 0 === ( r = function () {
                    return o;
                }.apply( e, [] ) ) || ( t.exports = r ) ) {}
        } ).call( this, r( 3 )( t ) ); // Call with webpack polyfill context.
    },

    // Module 3: Webpack polyfill for Node.js `module` object.
    function ( t, e ) {
        t.exports = function ( t ) {
            // If `webpackPolyfill` flag is not set, initialize module properties.
            if ( !t.webpackPolyfill ) {
                t.deprecate = function () {}; // No-op deprecate function.
                t.paths = []; // Empty paths array.
                if ( !t.children ) {
                    t.children = []; // Ensure children array exists.
                }
                // Define `loaded` property as a getter for `t.l`.
                Object.defineProperty( t, "loaded", {
                    enumerable: !0,
                    get: function () {
                        return t.l;
                    }
                } );
                // Define `id` property as a getter for `t.i`.
                Object.defineProperty( t, "id", {
                    enumerable: !0,
                    get: function () {
                        return t.i;
                    }
                } );
                t.webpackPolyfill = 1; // Set the polyfill flag.
            }
            return t; // Return the modified module object.
        };
    },

    // Module 4: Node.js 'fs' (File System) module.
    function ( t, e ) {
        t.exports = require( "fs" ); // Simply re-exports the native 'fs' module.
    }
] );