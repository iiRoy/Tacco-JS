/*!
 * This file contains the JavaScript code for a competitive programming problem.
 * Original path: atcoder/abc155/d
 * Original URL: https://github.com/koukimetal/procomvis/tree/master/src/contest/atcoder/abc155/d
 * This is a Type I clone, with extensive whitespace and comment modifications.
 */
!function( t ) {


    var i = {};

    // The core module loading function
    function n( e ) {

        if ( i[ e ] ) {
            return i[ e ].exports;
        }

        var r = i[ e ] = {
            i: e,
            l: !1,
            exports: {}
        };


        t[ e ].call( r.exports, r, r.exports, n );


        r.l = !0;

        return r.exports;
    }

    // Store all modules in n.m
    n.m = t;

    // Cache modules in n.c
    n.c = i;

    // Define property getters for exports
    n.d = function( t, i, e ) {
        if ( !n.o( t, i ) ) {
            Object.defineProperty( t, i, {
                enumerable: !0,
                get: e
            } );
        }
    };

    // Define __esModule on exports
    n.r = function( t ) {
        if ( "undefined" != typeof Symbol && Symbol.toStringTag ) {
            Object.defineProperty( t, Symbol.toStringTag, {
                value: "Module"
            } );
        }
        Object.defineProperty( t, "__esModule", {
            value: !0
        } );
    };

    // Create a namespace object for module exports
    n.t = function( t, i ) {

        if ( 1 & i ) {
            t = n( t );
        }

        if ( 8 & i ) {
            return t;
        }

        if ( 4 & i && "object" == typeof t && t && t.__esModule ) {
            return t;
        }

        var e = Object.create( null );

        n.r( e );

        Object.defineProperty( e, "default", {
            enumerable: !0,
            value: t
        } );

        if ( 2 & i && "string" != typeof t ) {
            for ( var r in t ) {
                n.d( e, r, function( i ) {
                    return t[ i ];
                }.bind( null, r ) );
            }
        }

        return e;
    };

    // Get default export if it exists, otherwise return the module itself
    n.n = function( t ) {
        var i = t && t.__esModule ? function() {
            return t.default;
        } : function() {
            return t;
        };
        n.d( i, "a", i );
        return i;
    };

    // Check if property exists on object
    n.o = function( t, i ) {
        return Object.prototype.hasOwnProperty.call( t, i );
    };

    // Public path for assets
    n.p = "";

    // Load the entry module (module 0)
    n( n.s = 0 );

}( [
    /* Module 0: Main application logic */
    function( t, i, n ) {

        "use strict";

        // Helper for __importDefault
        var e = this && this.__importDefault || function( t ) {
            return t && t.__esModule ? t : {
                default: t
            };
        };

        i.__esModule = !0; // Mark this module as an ES module

        // Import 'fs' module
        var r = e( n( 1 ) );

        // Import 'Solver' and 'getSpaceIterator' from module 2
        var s = n( 2 );

        // Read input from /dev/stdin asynchronously
        r.default.readFile( "/dev/stdin", "utf8", ( function( t, i ) {

            // If an error occurred during file reading
            if ( t ) {
                // In competitive programming, typically errors are not handled this way,
                // but for robustness, one might add error logging.
                console.error( "Error reading input:", t );
                return;
            }


            // Inner function to process the input string
            !function( t ) {

                var i = new s.Solver; // Create a new Solver instance

                var n = i.parse( t ); // Parse the input string

                var e = i.solve( n ); // Solve the problem with parsed input

                i.print( e ); // Print the result

            }( i ); // Execute immediately with the read data

        } ) );

    },
    /* Module 1: 'fs' module */
    function( t, i ) {
        // This module simply exports the 'fs' (file system) Node.js built-in module.
        t.exports = require( "fs" );
    },
    /* Module 2: Solver class implementation */
    function( t, i, n ) {

        "use strict";

        // Helper for __extends (TypeScript inheritance)
        var e, r = this && this.__extends || ( e = function( t, i ) {
            // Standard ES6 class extension, or fallback for older environments
            return ( e = Object.setPrototypeOf || {
                __proto__: []
            }
            instanceof Array && function( t, i ) {
                t.__proto__ = i;
            } || function( t, i ) {
                for ( var n in i ) {
                    if ( i.hasOwnProperty( n ) ) {
                        t[ n ] = i[ n ];
                    }
                }
            } )( t, i );
        }, function( t, i ) {
            function n() {
                this.constructor = t;
            }
            e( t, i );
            t.prototype = null === i ? Object.create( i ) : ( n.prototype = i.prototype, new n );
        } );

        // Helper for __importDefault
        var s = this && this.__importDefault || function( t ) {
            return t && t.__esModule ? t : {
                default: t
            };
        };

        i.__esModule = !0; // Mark this module as an ES module

        // Import SolverBase from module 3
        var o = n( 3 );

        // Import getSpaceIterator from module 4
        var u = n( 4 );

        // Import the Long.js library from module 5
        var h = s( n( 5 ) );

        // Define the Solver class, extending SolverBase
        var f = function( t ) {

            // Constructor
            function i() {
                return null !== t && t.apply( this, arguments ) || this;
            }

            r( i, t ); // Apply inheritance

            // The main solving method
            i.prototype.solve = function( t ) {

                var i = t.N; // N: number of elements
                var n = t.K; // K: K-th smallest product
                var e = t.A; // A: array of numbers

                // Sort the array A in ascending order
                e.sort( ( function( t, i ) {
                    return t - i;
                } ) );


                // Convert numbers in A to Long instances
                for ( var r = new Array( i ), s = 0; s < i; s++ ) {
                    r[ s ] = h.default.fromNumber( e[ s ] );
                }


                // Count positive, negative, and zero numbers
                var o = 0; // Count of negative numbers
                var u = 0; // Count of positive numbers
                var f = 0; // Count of zero numbers

                for ( s = 0; s < i; s++ ) {
                    if ( e[ s ] < 0 ) {
                        o++;
                    } else if ( e[ s ] > 0 ) {
                        u++;
                    } else {
                        f++;
                    }
                }

                // Calculate number of positive and zero products
                var l = o * u; // Number of negative * positive products (which are negative)
                var a = f * ( u + o ) + f * ( f - 1 ) / 2; // Number of products involving zero (which are zero)


                // Initialize binary search bounds for the answer
                var g = h.default.fromNumber( 2 ); // Constant for division by 2

                // Lower bound for binary search, a very small number
                var c = h.default.fromString( "-1000000000000000005" );

                // Upper bound for binary search, a very large number
                var d = h.default.fromString( "1000000000000000005" );


                // Binary search for the K-th smallest product
                while ( d.sub( c ).gt( h.default.ONE ) ) {

                    // Calculate midpoint (candidate answer)
                    var v = d.add( c ).divide( g );

                    var p = 0; // Count of products less than or equal to 'v'

                    if ( v.lt( h.default.ZERO ) ) {
                        // If candidate product is negative
                        for ( s = 0; s < i && !( e[ s ] >= 0 ); s++ ) {
                            // For each negative number e[s], find how many positive numbers e[y]
                            // satisfy e[s] * e[y] <= v
                            var w = o + f - 1; // Start search from the right end of negative/zero part
                            var m = i; // End search from the very end of the array

                            while ( m - w > 1 ) {
                                var y = ( w + m ) / 2 | 0; // Midpoint index
                                if ( r[ s ].multiply( r[ y ] ).lt( v ) ) {
                                    m = y; // Product is too small, move upper bound
                                } else {
                                    w = y; // Product is large enough, move lower bound
                                }
                            }
                            p += i - m; // Add count of numbers that make the product <= v
                        }
                    } else if ( v.gt( h.default.ZERO ) ) {
                        // If candidate product is positive
                        // All negative products and zero products are less than or equal to 'v'
                        p += l + a;

                        for ( s = 0; s < i; s++ ) {
                            if ( e[ s ] < 0 ) {
                                // For negative numbers, find other negative numbers such that product <= v
                                // (e[s] * e[y] <= v when e[y] is also negative, product is positive)
                                // This requires sorting the remaining negative numbers in reverse order or similar logic.
                                // The original code uses a slightly different approach for the search bounds.
                                w = s; // Start search from current index
                                m = o; // End search at the end of negative numbers

                                while ( m - w > 1 ) {
                                    y = ( w + m ) / 2 | 0;
                                    if ( r[ s ].multiply( r[ y ] ).lt( v ) ) {
                                        m = y;
                                    } else {
                                        w = y;
                                    }
                                }
                                p += o - m;
                            } else if ( e[ s ] > 0 ) {
                                // For positive numbers, find other positive numbers such that product <= v
                                w = s; // Start search from current index
                                m = i; // End search at the end of the array

                                while ( m - w > 1 ) {
                                    y = ( w + m ) / 2 | 0;
                                    if ( r[ s ].multiply( r[ y ] ).lt( v ) ) {
                                        w = y;
                                    } else {
                                        m = y;
                                    }
                                }
                                p += w - s;
                            }
                        }
                    } else {
                        // If candidate product is zero
                        p = l + a; // All negative products and all zero products satisfy this
                    }

                    // Adjust binary search bounds based on count 'p'
                    if ( p < n ) {
                        c = v; // 'v' is too small, move lower bound up
                    } else {
                        d = v; // 'v' is potentially the answer or too large, move upper bound down
                    }
                }

                return {
                    answer: c
                };
            };

            // Method to parse input string into problem-specific data structure
            i.prototype.parse = function( t ) {

                // Get an iterator for space-separated integers
                for ( var i = u.getSpaceIterator( t, ( function( t ) {
                    return parseInt( t );
                } ) ), n = i.next().value, e = i.next().value, r = [], s = 0; s < n; s++ ) {
                    r.push( i.next().value );
                }

                return {
                    N: n,
                    K: e,
                    A: r
                };
            };

            // Method to print the answer
            i.prototype.print = function( t ) {
                console.log( t.answer.toString() );
            };

            return i;

        }( o.SolverBase );

        i.Solver = f; // Export the Solver class

    },
    /* Module 3: SolverBase class */
    function( t, i, n ) {

        "use strict";

        i.__esModule = !0; // Mark this module as an ES module

        // Base class for solvers, currently empty but can be extended
        var e = function() {};

        i.SolverBase = e; // Export the SolverBase class

    },
    /* Module 4: getSpaceIterator function */
    function( t, i, n ) {

        "use strict";

        // Helper for __generator (TypeScript generator function support)
        var e = this && this.__generator || function( t, i ) {
            var n, e, r, s, o = {
                label: 0,
                sent: function() {
                    if ( 1 & r[ 0 ] ) {
                        throw r[ 1 ];
                    }
                    return r[ 1 ];
                },
                trys: [],
                ops: []
            };
            return s = {
                next: u( 0 ),
                throw: u( 1 ),
                return: u( 2 )
            }, "function" == typeof Symbol && ( s[ Symbol.iterator ] = function() {
                return this;
            } ), s;

            function u( s ) {
                return function( u ) {
                    return function( s ) {
                        if ( n ) {
                            throw new TypeError( "Generator is already executing." );
                        }
                        for ( ; o; ) {
                            try {
                                if ( n = 1, e && ( r = 2 & s[ 0 ] ? e.return : s[ 0 ] ? e.throw || ( ( r = e.return ) && r.call( e ), 0 ) : e.next ) && !( r = r.call( e, s[ 1 ] ) ).done ) {
                                    return r;
                                }
                                switch ( e = 0, r && ( s = [ 2 & s[ 0 ], r.value ] ), s[ 0 ] ) {
                                    case 0:
                                    case 1:
                                        r = s;
                                        break;
                                    case 4:
                                        return o.label++, {
                                            value: s[ 1 ],
                                            done: !1
                                        };
                                    case 5:
                                        o.label++, e = s[ 1 ], s = [ 0 ];
                                        continue;
                                    case 7:
                                        s = o.ops.pop(), o.trys.pop();
                                        continue;
                                    default:
                                        if ( !( r = o.trys.length > 0 && o.trys[ o.trys.length - 1 ] ) && ( 6 === s[ 0 ] || 2 === s[ 0 ] ) ) {
                                            o = 0;
                                            continue;
                                        }
                                        if ( 3 === s[ 0 ] && ( !r || s[ 1 ] > r[ 0 ] && s[ 1 ] < r[ 3 ] ) ) {
                                            o.label = s[ 1 ];
                                            break;
                                        }
                                        if ( 6 === s[ 0 ] && o.label < r[ 1 ] ) {
                                            o.label = r[ 1 ], r = s;
                                            break;
                                        }
                                        if ( r && o.label < r[ 2 ] ) {
                                            o.label = r[ 2 ], o.ops.push( s );
                                            break;
                                        }
                                        r[ 2 ] && o.ops.pop(), o.trys.pop();
                                        continue;
                                }
                                s = i.call( t, o );
                            } catch ( t ) {
                                s = [ 6, t ], e = 0;
                            } finally {
                                n = r = 0;
                            }
                            if ( 5 & s[ 0 ] ) {
                                throw s[ 1 ];
                            }
                            return {
                                value: s[ 0 ] ? s[ 1 ] : void 0,
                                done: !0
                            };
                        }
                    }( [ s, u ] );
                };
            }
        };

        i.__esModule = !0; // Mark this module as an ES module

        // Generator function to iterate over space-separated values
        i.getSpaceIterator = function( t, i ) {
            var n, r;
            return e( this, ( function( e ) {
                switch ( e.label ) {
                    case 0:
                        n = 0, r = t.split( /\s+/ ).map( ( function( t ) {
                            return i( t );
                        } ) ), e.label = 1;
                    case 1:
                        return n < r.length ? [ 4, r[ n ] ] : [ 3, 4 ];
                    case 2:
                        e.sent(), e.label = 3;
                    case 3:
                        return n++, [ 3, 1 ];
                    case 4:
                        return [ 2, void 0 ];
                }
            } ) );
        };

    },
    /* Module 5: Long.js library (big integer implementation) */
    function( t, i ) {

        // Exports the 'e' object, which is the Long constructor.
        t.exports = e;

        var n = null;

        // Try to load WebAssembly version of Long.js for performance
        try {
            n = new WebAssembly.Instance( new WebAssembly.Module( new Uint8Array( [ 0, 97, 115, 109, 1, 0, 0, 0, 1, 13, 2, 96, 0, 1, 127, 96, 4, 127, 127, 127, 127, 1, 127, 3, 7, 6, 0, 1, 1, 1, 1, 1, 6, 6, 1, 127, 1, 65, 0, 11, 7, 50, 6, 3, 109, 117, 108, 0, 1, 5, 100, 105, 118, 95, 115, 0, 2, 5, 100, 105, 118, 95, 117, 0, 3, 5, 114, 101, 109, 95, 115, 0, 4, 5, 114, 101, 109, 95, 117, 0, 5, 8, 103, 101, 116, 95, 104, 105, 103, 104, 0, 0, 10, 191, 1, 6, 4, 0, 35, 0, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 126, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 127, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 128, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 129, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 130, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11 ] ) ), {} ).exports;
        } catch ( t ) {} // Catch WebAssembly loading errors

        // Long constructor
        function e( t, i, n ) {
            this.low = 0 | t; // Low 32 bits
            this.high = 0 | i; // High 32 bits
            this.unsigned = !!n; // Whether the number is unsigned
        }

        // Check if an object is a Long instance
        function r( t ) {
            return !0 === ( t && t.__isLong__ );
        }

        // Mark Long prototype with __isLong__ property
        e.prototype.__isLong__, Object.defineProperty( e.prototype, "__isLong__", {
            value: !0
        } ), e.isLong = r;

        // Cache for small signed integers
        var s = {};

        // Cache for small unsigned integers
        var o = {};

        // Create a Long from an integer (cached for small values)
        function u( t, i ) {
            var n, e, r;
            return i ? ( r = 0 <= ( t >>>= 0 ) && t < 256 ) && ( e = o[ t ] ) ? e : ( n = f( t, ( 0 | t ) < 0 ? -1 : 0, !0 ), r && ( o[ t ] = n ), n ) : ( r = -128 <= ( t |= 0 ) && t < 128 ) && ( e = s[ t ] ) ? e : ( n = f( t, t < 0 ? -1 : 0, !1 ), r && ( s[ t ] = n ), n );
        }

        // Create a Long from a number
        function h( t, i ) {
            if ( isNaN( t ) ) {
                return i ? m : w;
            }
            if ( i ) {
                if ( t < 0 ) {
                    return m;
                }
                if ( t >= d ) {
                    return E;
                }
            } else {
                if ( t <= -v ) {
                    return O;
                }
                if ( t + 1 >= v ) {
                    return N;
                }
            }
            return t < 0 ? h( -t, i ).neg() : f( t % c | 0, t / c | 0, i );
        }

        // Create a Long from low and high bits
        function f( t, i, n ) {
            return new e( t, i, n );
        }

        // Export static factory methods
        e.fromInt = u, e.fromNumber = h, e.fromBits = f;

        var l = Math.pow; // Alias for Math.pow

        // Create a Long from a string (with optional radix)
        function a( t, i, n ) {

            if ( 0 === t.length ) {
                throw Error( "empty string" );
            }

            if ( "NaN" === t || "Infinity" === t || "+Infinity" === t || "-Infinity" === t ) {
                return w;
            }

            if ( "number" == typeof i ? ( n = i, i = !1 ) : i = !!i, ( n = n || 10 ) < 2 || 36 < n ) {
                throw RangeError( "radix" );
            }

            var e;

            if ( ( e = t.indexOf( "-" ) ) > 0 ) {
                throw Error( "interior hyphen" );
            }

            if ( 0 === e ) {
                return a( t.substring( 1 ), i, n ).neg();
            }

            for ( var r = h( l( n, 8 ) ), s = w, o = 0; o < t.length; o += 8 ) {
                var u = Math.min( 8, t.length - o );
                var f = parseInt( t.substring( o, o + u ), n );
                if ( u < 8 ) {
                    var g = h( l( n, u ) );
                    s = s.mul( g ).add( h( f ) );
                } else {
                    s = ( s = s.mul( r ) ).add( h( f ) );
                }
            }
            return s.unsigned = i, s;
        }

        // Create a Long from various value types
        function g( t, i ) {
            return "number" == typeof t ? h( t, i ) : "string" == typeof t ? a( t, i ) : f( t.low, t.high, "boolean" == typeof i ? i : t.unsigned );
        }

        // Export static factory methods
        e.fromString = a, e.fromValue = g;

        // Constants for 32-bit arithmetic
        var c = 4294967296; // 2^32
        var d = c * c; // 2^64
        var v = d / 2; // 2^63

        // Pre-computed Long constants
        var p = u( 1 << 24 ); // Long representing 2^24
        var w = u( 0 ); // Long representing 0
        e.ZERO = w; // Export ZERO

        var m = u( 0, !0 ); // Unsigned Long representing 0
        e.UZERO = m; // Export UZERO

        var y = u( 1 ); // Long representing 1
        e.ONE = y; // Export ONE

        var b = u( 1, !0 ); // Unsigned Long representing 1
        e.UONE = b; // Export UONE

        var _ = u( -1 ); // Long representing -1
        e.NEG_ONE = _; // Export NEG_ONE

        var N = f( -1, 2147483647, !1 ); // Max signed 64-bit integer
        e.MAX_VALUE = N; // Export MAX_VALUE

        var E = f( -1, -1, !0 ); // Max unsigned 64-bit integer
        e.MAX_UNSIGNED_VALUE = E; // Export MAX_UNSIGNED_VALUE

        var O = f( 0, -2147483648, !1 ); // Min signed 64-bit integer
        e.MIN_VALUE = O; // Export MIN_VALUE

        var q = e.prototype; // Alias for Long prototype

        // Convert Long to 32-bit integer
        q.toInt = function() {
            return this.unsigned ? this.low >>> 0 : this.low;
        };

        // Convert Long to JavaScript number (potentially losing precision)
        q.toNumber = function() {
            return this.unsigned ? ( this.high >>> 0 ) * c + ( this.low >>> 0 ) : this.high * c + ( this.low >>> 0 );
        };

        // Convert Long to string with a given radix
        q.toString = function( t ) {
            if ( ( t = t || 10 ) < 2 || 36 < t ) {
                throw RangeError( "radix" );
            }
            if ( this.isZero() ) {
                return "0";
            }
            if ( this.isNegative() ) {
                if ( this.eq( O ) ) {
                    var i = h( t );
                    var n = this.div( i );
                    var e = n.mul( i ).sub( this );
                    return n.toString( t ) + e.toInt().toString( t );
                }
                return "-" + this.neg().toString( t );
            }
            for ( var r = h( l( t, 6 ), this.unsigned ), s = this, o = "";; ) {
                var u = s.div( r );
                var f = ( s.sub( u.mul( r ) ).toInt() >>> 0 ).toString( t );
                if ( ( s = u ).isZero() ) {
                    return f + o;
                }
                for ( ; f.length < 6; ) {
                    f = "0" + f;
                }
                o = "" + f + o;
            }
        };

        // Get high 32 bits (signed)
        q.getHighBits = function() {
            return this.high;
        };

        // Get high 32 bits (unsigned)
        q.getHighBitsUnsigned = function() {
            return this.high >>> 0;
        };

        // Get low 32 bits (signed)
        q.getLowBits = function() {
            return this.low;
        };

        // Get low 32 bits (unsigned)
        q.getLowBitsUnsigned = function() {
            return this.low >>> 0;
        };

        // Get the number of bits required to represent the absolute value
        q.getNumBitsAbs = function() {
            if ( this.isNegative() ) {
                return this.eq( O ) ? 64 : this.neg().getNumBitsAbs();
            }
            for ( var t = 0 != this.high ? this.high : this.low, i = 31; i > 0 && 0 == ( t & 1 << i ); i-- );
            return 0 != this.high ? i + 33 : i + 1;
        };

        // Check if Long is zero
        q.isZero = function() {
            return 0 === this.high && 0 === this.low;
        };
        q.eqz = q.isZero; // Alias

        // Check if Long is negative
        q.isNegative = function() {
            return !this.unsigned && this.high < 0;
        };

        // Check if Long is positive or zero
        q.isPositive = function() {
            return this.unsigned || this.high >= 0;
        };

        // Check if Long is odd
        q.isOdd = function() {
            return 1 == ( 1 & this.low );
        };

        // Check if Long is even
        q.isEven = function() {
            return 0 == ( 1 & this.low );
        };

        // Check if Long equals another Long or value
        q.equals = function( t ) {
            return r( t ) || ( t = g( t ) ), ( this.unsigned === t.unsigned || this.high >>> 31 != 1 || t.high >>> 31 != 1 ) && ( this.high === t.high && this.low === t.low );
        };
        q.eq = q.equals; // Alias

        // Check if Long does not equal another Long or value
        q.notEquals = function( t ) {
            return !this.eq( t );
        };
        q.neq = q.notEquals, q.ne = q.notEquals; // Aliases

        // Less than
        q.lessThan = function( t ) {
            return this.comp( t ) < 0;
        };
        q.lt = q.lessThan; // Alias

        // Less than or equal to
        q.lessThanOrEqual = function( t ) {
            return this.comp( t ) <= 0;
        };
        q.lte = q.lessThanOrEqual, q.le = q.lessThanOrEqual; // Aliases

        // Greater than
        q.greaterThan = function( t ) {
            return this.comp( t ) > 0;
        };
        q.gt = q.greaterThan; // Alias

        // Greater than or equal to
        q.greaterThanOrEqual = function( t ) {
            return this.comp( t ) >= 0;
        };
        q.gte = q.greaterThanOrEqual, q.ge = q.greaterThanOrEqual; // Aliases

        // Compare with another Long or value
        q.compare = function( t ) {
            if ( r( t ) || ( t = g( t ) ), this.eq( t ) ) {
                return 0;
            }
            var i = this.isNegative(),
                n = t.isNegative();
            return i && !n ? -1 : !i && n ? 1 : this.unsigned ? t.high >>> 0 > this.high >>> 0 || t.high === this.high && t.low >>> 0 > this.low >>> 0 ? -1 : 1 : this.sub( t ).isNegative() ? -1 : 1;
        };
        q.comp = q.compare; // Alias

        // Negate the Long
        q.negate = function() {
            return !this.unsigned && this.eq( O ) ? O : this.not().add( y );
        };
        q.neg = q.negate; // Alias

        // Add another Long or value
        q.add = function( t ) {
            r( t ) || ( t = g( t ) );
            var i = this.high >>> 16,
                n = 65535 & this.high,
                e = this.low >>> 16,
                s = 65535 & this.low,
                o = t.high >>> 16,
                u = 65535 & t.high,
                h = t.low >>> 16,
                l = 0,
                a = 0,
                c = 0,
                d = 0;
            return c += ( d += s + ( 65535 & t.low ) ) >>> 16, a += ( c += e + h ) >>> 16, l += ( a += n + u ) >>> 16, l += i + o, f( ( c &= 65535 ) << 16 | ( d &= 65535 ), ( l &= 65535 ) << 16 | ( a &= 65535 ), this.unsigned );
        };

        // Subtract another Long or value
        q.subtract = function( t ) {
            return r( t ) || ( t = g( t ) ), this.add( t.neg() );
        };
        q.sub = q.subtract; // Alias

        // Multiply by another Long or value
        q.multiply = function( t ) {
            if ( this.isZero() ) {
                return w;
            }
            if ( r( t ) || ( t = g( t ) ), n ) {
                return f( n.mul( this.low, this.high, t.low, t.high ), n.get_high(), this.unsigned );
            }
            if ( t.isZero() ) {
                return w;
            }
            if ( this.eq( O ) ) {
                return t.isOdd() ? O : w;
            }
            if ( t.eq( O ) ) {
                return this.isOdd() ? O : w;
            }
            if ( this.isNegative() ) {
                return t.isNegative() ? this.neg().mul( t.neg() ) : this.neg().mul( t ).neg();
            }
            if ( t.isNegative() ) {
                return this.mul( t.neg() ).neg();
            }
            if ( this.lt( p ) && t.lt( p ) ) {
                return h( this.toNumber() * t.toNumber(), this.unsigned );
            }
            var i = this.high >>> 16,
                e = 65535 & this.high,
                s = this.low >>> 16,
                o = 65535 & this.low,
                u = t.high >>> 16,
                l = 65535 & t.high,
                a = t.low >>> 16,
                c = 65535 & t.low,
                d = 0,
                v = 0,
                m = 0,
                y = 0;
            return m += ( y += o * c ) >>> 16, v += ( m += s * c ) >>> 16, m &= 65535, v += ( m += o * a ) >>> 16, d += ( v += e * c ) >>> 16, v &= 65535, d += ( v += s * a ) >>> 16, v &= 65535, d += ( v += o * l ) >>> 16, d += i * c + e * a + s * l + o * u, f( ( m &= 65535 ) << 16 | ( y &= 65535 ), ( d &= 65535 ) << 16 | ( v &= 65535 ), this.unsigned );
        };
        q.mul = q.multiply; // Alias

        // Divide by another Long or value
        q.divide = function( t ) {
            if ( r( t ) || ( t = g( t ) ), t.isZero() ) {
                throw Error( "division by zero" );
            }
            var i, e, s;
            if ( n ) {
                return this.unsigned || -2147483648 !== this.high || -1 !== t.low || -1 !== t.high ? f( ( this.unsigned ? n.div_u : n.div_s )( this.low, this.high, t.low, t.high ), n.get_high(), this.unsigned ) : this;
            }
            if ( this.isZero() ) {
                return this.unsigned ? m : w;
            }
            if ( this.unsigned ) {
                if ( t.unsigned || ( t = t.toUnsigned() ), t.gt( this ) ) {
                    return m;
                }
                if ( t.gt( this.shru( 1 ) ) ) {
                    return b;
                }
                s = m;
            } else {
                if ( this.eq( O ) ) {
                    return t.eq( y ) || t.eq( _ ) ? O : t.eq( O ) ? y : ( i = this.shr( 1 ).div( t ).shl( 1 ) ).eq( w ) ? t.isNegative() ? y : _ : ( e = this.sub( t.mul( i ) ), s = i.add( e.div( t ) ) );
                }
                if ( t.eq( O ) ) {
                    return this.unsigned ? m : w;
                }
                if ( this.isNegative() ) {
                    return t.isNegative() ? this.neg().div( t.neg() ) : this.neg().div( t ).neg();
                }
                if ( t.isNegative() ) {
                    return this.div( t.neg() ).neg();
                }
                s = w;
            }
            for ( e = this; e.gte( t ); ) {
                i = Math.max( 1, Math.floor( e.toNumber() / t.toNumber() ) );
                for ( var o = Math.ceil( Math.log( i ) / Math.LN2 ), u = o <= 48 ? 1 : l( 2, o - 48 ), a = h( i ), c = a.mul( t ); c.isNegative() || c.gt( e ); ) {
                    c = ( a = h( i -= u, this.unsigned ) ).mul( t );
                }
                a.isZero() && ( a = y ), s = s.add( a ), e = e.sub( c );
            }
            return s;
        };
        q.div = q.divide; // Alias

        // Modulo by another Long or value
        q.modulo = function( t ) {
            return r( t ) || ( t = g( t ) ), n ? f( ( this.unsigned ? n.rem_u : n.rem_s )( this.low, this.high, t.low, t.high ), n.get_high(), this.unsigned ) : this.sub( this.div( t ).mul( t ) );
        };
        q.mod = q.modulo, q.rem = q.modulo; // Aliases

        // Bitwise NOT
        q.not = function() {
            return f( ~this.low, ~this.high, this.unsigned );
        };

        // Bitwise AND
        q.and = function( t ) {
            return r( t ) || ( t = g( t ) ), f( this.low & t.low, this.high & t.high, this.unsigned );
        };

        // Bitwise OR
        q.or = function( t ) {
            return r( t ) || ( t = g( t ) ), f( this.low | t.low, this.high | t.high, this.unsigned );
        };

        // Bitwise XOR
        q.xor = function( t ) {
            return r( t ) || ( t = g( t ) ), f( this.low ^ t.low, this.high ^ t.high, this.unsigned );
        };

        // Shift left
        q.shiftLeft = function( t ) {
            return r( t ) && ( t = t.toInt() ), 0 == ( t &= 63 ) ? this : t < 32 ? f( this.low << t, this.high << t | this.low >>> 32 - t, this.unsigned ) : f( 0, this.low << t - 32, this.unsigned );
        };
        q.shl = q.shiftLeft; // Alias

        // Signed shift right
        q.shiftRight = function( t ) {
            return r( t ) && ( t = t.toInt() ), 0 == ( t &= 63 ) ? this : t < 32 ? f( this.low >>> t | this.high << 32 - t, this.high >> t, this.unsigned ) : f( this.high >> t - 32, this.high >= 0 ? 0 : -1, this.unsigned );
        };
        q.shr = q.shiftRight; // Alias

        // Unsigned shift right
        q.shiftRightUnsigned = function( t ) {
            if ( r( t ) && ( t = t.toInt() ), 0 === ( t &= 63 ) ) {
                return this;
            }
            var i = this.high;
            return t < 32 ? f( this.low >>> t | i << 32 - t, i >>> t, this.unsigned ) : f( 32 === t ? i : i >>> t - 32, 0, this.unsigned );
        };
        q.shru = q.shiftRightUnsigned, q.shr_u = q.shiftRightUnsigned; // Aliases

        // Convert to signed Long
        q.toSigned = function() {
            return this.unsigned ? f( this.low, this.high, !1 ) : this;
        };

        // Convert to unsigned Long
        q.toUnsigned = function() {
            return this.unsigned ? this : f( this.low, this.high, !0 );
        };

        // Convert to byte array (endianness specified)
        q.toBytes = function( t ) {
            return t ? this.toBytesLE() : this.toBytesBE();
        };

        // Convert to byte array (Little Endian)
        q.toBytesLE = function() {
            var t = this.high,
                i = this.low;
            return [ 255 & i, i >>> 8 & 255, i >>> 16 & 255, i >>> 24, 255 & t, t >>> 8 & 255, t >>> 16 & 255, t >>> 24 ];
        };

        // Convert to byte array (Big Endian)
        q.toBytesBE = function() {
            var t = this.high,
                i = this.low;
            return [ t >>> 24, t >>> 16 & 255, t >>> 8 & 255, 255 & t, i >>> 24, i >>> 16 & 255, i >>> 8 & 255, 255 & i ];
        };

        // Create Long from byte array (endianness specified)
        e.fromBytes = function( t, i, n ) {
            return n ? e.fromBytesLE( t, i ) : e.fromBytesBE( t, i );
        };

        // Create Long from byte array (Little Endian)
        e.fromBytesLE = function( t, i ) {
            return new e( t[ 0 ] | t[ 1 ] << 8 | t[ 2 ] << 16 | t[ 3 ] << 24, t[ 4 ] | t[ 5 ] << 8 | t[ 6 ] << 16 | t[ 7 ] << 24, i );
        };

        // Create Long from byte array (Big Endian)
        e.fromBytesBE = function( t, i ) {
            return new e( t[ 4 ] << 24 | t[ 5 ] << 16 | t[ 6 ] << 8 | t[ 7 ], t[ 0 ] << 24 | t[ 1 ] << 16 | t[ 2 ] << 8 | t[ 3 ], i );
        };

    }
] );