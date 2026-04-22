/*!
 * This file contains the solution for AtCoder ABC155 Problem D.
 * Original source path: atcoder/abc155/d
 * Original URL: https://github.com/koukimetal/procomvis/tree/master/src/contest/atcoder/abc155/d
 *
 * This is a Type I code clone, meaning its functionality and identifiers are identical
 * to the original, but whitespace and comments have been extensively modified
 * to create a visually distinct representation.
 */
! function( t ) {

    // This object caches loaded modules.
    var i = {};

    // The webpack require function.
    function n( e ) {

        // If module is already in cache, return its exports.
        if ( i[ e ] ) {
            return i[ e ].exports;
        }

        // Create a new module (and put it into the cache).
        var r = i[ e ] = {
            i: e,
            l: !1,
            exports: {}
        };

        // Execute the module function.
        t[ e ].call( r.exports, r, r.exports, n );

        // Flag the module as loaded.
        r.l = !0;

        // Return the exports of the module.
        return r.exports;
    }

    // Expose loaded modules on the `n` object.
    n.m = t;

    // Expose the module cache.
    n.c = i;

    // Define getter function for harmony exports.
    n.d = function( t, i, e ) {
        if ( !n.o( t, i ) ) {
            Object.defineProperty( t, i, {
                enumerable: !0,
                get: e
            } );
        }
    };

    // Define __esModule on exports.
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

    // Create a fake namespace object.
    // mode & 1: value is a module id, require it.
    // mode & 8: behave like require.
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

    // getDefaultExport function for compatibility with non-harmony modules.
    n.n = function( t ) {
        var i = t && t.__esModule ?
            function() {
                return t.default;
            } :
            function() {
                return t;
            };

        n.d( i, "a", i );
        return i;
    };

    // Object.prototype.hasOwnProperty.call.
    n.o = function( t, i ) {
        return Object.prototype.hasOwnProperty.call( t, i );
    };

    // Public path.
    n.p = "";

    // Load entry module and return exports.
    n( n.s = 0 );

}( [
    /* 0 */
    function( t, i, n ) {
        "use strict";

        // Helper for __importDefault.
        var e = this && this.__importDefault || function( t ) {
            return ( t && t.__esModule ) ? t : {
                default: t
            };
        };

        // Mark as an ES module.
        i.__esModule = !0;

        // Import 'fs' module for file system operations.
        var r = e( n( 1 ) );

        // Import Solver class from module 2.
        var s = n( 2 );

        // Read input from /dev/stdin.
        r.default.readFile( "/dev/stdin", "utf8", ( function( t, i ) {
            // If there's an error reading the file, throw it.
            if ( t ) {
                throw t;
            }

            // Immediately invoked function expression to process input.
            ! function( t ) {
                // Create a new Solver instance.
                var i = new s.Solver;

                // Parse the input string.
                var n = i.parse( t );

                // Solve the problem.
                var e = i.solve( n );

                // Print the result.
                i.print( e );
            }( i ); // Pass the file content 'i' to the processing function.
        } ) );
    },

    /* 1 */
    function( t, i ) {
        // This module simply exports the Node.js 'fs' (file system) module.
        t.exports = require( "fs" );
    },

    /* 2 */
    function( t, i, n ) {
        "use strict";

        // Helper for __extends (TypeScript inheritance).
        var e, r = this && this.__extends || ( e = function( t, i ) {
            // Standard ES6 way if available (setPrototypeOf).
            return ( e = Object.setPrototypeOf ||
                ( {
                    __proto__: []
                }
                instanceof Array && function( t, i ) {
                    t.__proto__ = i;
                } ) ||
                function( t, i ) {
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
            t.prototype = i === null ? Object.create( i ) : ( n.prototype = i.prototype, new n() );
        } );

        // Helper for __importDefault.
        var s = this && this.__importDefault || function( t ) {
            return ( t && t.__esModule ) ? t : {
                default: t
            };
        };

        // Mark as an ES module.
        i.__esModule = !0;

        // Import SolverBase from module 3.
        var o = n( 3 );

        // Import getSpaceIterator from module 4.
        var u = n( 4 );

        // Import the Long.js library from module 5.
        var h = s( n( 5 ) );

        // Define the Solver class, extending SolverBase.
        var f = function( t ) {

            // Constructor for the Solver class.
            function i() {
                return t !== null && t.apply( this, arguments ) || this;
            }

            // Set up inheritance from SolverBase.
            r( i, t );

            // Solve method: contains the core logic of the problem.
            i.prototype.solve = function( t ) {
                var i = t.N,
                    n = t.K,
                    e = t.A;

                // Sort the input array 'A' in ascending order.
                e.sort( ( function( t, i ) {
                    return t - i;
                } ) );

                // Convert numbers in 'A' to Long instances for precise arithmetic.
                for ( var r = new Array( i ), s = 0; s < i; s++ ) {
                    r[ s ] = h.default.fromNumber( e[ s ] );
                }

                // Count positive, negative, and zero numbers.
                var o = 0,
                    u = 0,
                    f = 0;

                for ( s = 0; s < i; s++ ) {
                    if ( e[ s ] < 0 ) {
                        o++;
                    } else if ( e[ s ] > 0 ) {
                        u++;
                    } else {
                        f++;
                    }
                }

                // Calculate the number of pairs with negative product.
                var l = o * u;

                // Calculate the number of pairs with zero product.
                // This includes (zero, positive), (zero, negative), and (zero, zero) pairs.
                var a = f * ( u + o ) + f * ( f - 1 ) / 2;

                // Constants for binary search (Long instances).
                var g = h.default.fromNumber( 2 ); // Used for division by 2.
                var c = h.default.fromString( "-1000000000000000005" ); // Lower bound for binary search.
                var d = h.default.fromString( "1000000000000000005" ); // Upper bound for binary search.

                // Binary search for the K-th smallest product.
                while ( d.sub( c ).gt( h.default.ONE ) ) {
                    // Calculate the midpoint.
                    var v = d.add( c ).divide( g );

                    // Count pairs whose product is less than 'v'.
                    var p = 0;

                    // Case 1: Midpoint 'v' is negative.
                    if ( v.lt( h.default.ZERO ) ) {
                        var w = 0;
                        // Iterate through negative numbers (e[s] < 0).
                        for ( s = 0; s < i && !( e[ s ] >= 0 ); s++ ) {
                            // If current number is same as previous, reuse count.
                            if ( s > 0 && e[ s ] === e[ s - 1 ] ) {
                                p += w;
                            } else {
                                // Binary search for 'y' such that r[s] * r[y] < v.
                                // We are looking for numbers in the positive part of the array.
                                for ( var m = o + f - 1, y = i; y - m > 1; ) {
                                    var b = ( m + y ) / 2 | 0;
                                    if ( r[ s ].multiply( r[ b ] ).lt( v ) ) {
                                        y = b;
                                    } else {
                                        m = b;
                                    }
                                }
                                w = i - y; // Count of elements that satisfy the condition.
                                p += i - y;
                            }
                        }
                    }
                    // Case 2: Midpoint 'v' is positive.
                    else if ( v.gt( h.default.ZERO ) ) {
                        // All negative-positive pairs and zero pairs will have product < v.
                        p += l + a;
                        w = 0;
                        // Iterate through all numbers to count products less than 'v'.
                        for ( s = 0; s < i; s++ ) {
                            if ( 0 !== e[ s ] ) {
                                if ( s > 0 && e[ s ] === e[ s - 1 ] ) {
                                    p += w;
                                } else if ( e[ s ] < 0 ) {
                                    // Current number is negative. Search in the negative part for numbers to pair with.
                                    // The goal is to find r[s] * r[b] < v. Since r[s] < 0, we need r[b] > v / r[s].
                                    // This means we are looking for smaller absolute values in the negative part.
                                    for ( m = s, y = o; y - m > 1; ) {
                                        b = ( m + y ) / 2 | 0;
                                        if ( r[ s ].multiply( r[ b ] ).lt( v ) ) {
                                            y = b;
                                        } else {
                                            m = b;
                                        }
                                    }
                                    w = o - y;
                                    p += o - y;
                                } else if ( e[ s ] > 0 ) {
                                    // Current number is positive. Search in the positive part.
                                    for ( m = s, y = i; y - m > 1; ) {
                                        b = ( m + y ) / 2 | 0;
                                        if ( r[ s ].multiply( r[ b ] ).lt( v ) ) {
                                            m = b;
                                        } else {
                                            y = b;
                                        }
                                    }
                                    w = m - s;
                                    p += m - s;
                                }
                            }
                        }
                    }
                    // Case 3: Midpoint 'v' is zero.
                    else {
                        // Only negative-positive pairs contribute to products less than zero.
                        p = l;
                    }

                    // Adjust binary search bounds.
                    if ( p < n ) {
                        c = v; // If count is too low, increase the lower bound.
                    } else {
                        d = v; // If count is sufficient, this value might be the answer, try smaller.
                    }
                }

                // The answer is the lower bound 'c'.
                return {
                    answer: c
                };
            };

            // Parse method: takes raw input string and converts it to structured data.
            i.prototype.parse = function( t ) {
                // Get an iterator for space-separated integers.
                for ( var i = u.getSpaceIterator( t, ( function( t ) {
                        return parseInt( t );
                    } ) ),
                    // Read N (number of elements).
                    n = i.next().value,
                    // Read K (K-th smallest product).
                    e = i.next().value,
                    // Initialize array A.
                    r = new Array( n ),
                    s = 0; s < n; s++ ) {
                    // Populate array A with remaining values.
                    r[ s ] = i.next().value;
                }

                return {
                    N: n,
                    K: e,
                    A: r
                };
            };

            // Print method: outputs the result to the console.
            i.prototype.print = function( t ) {
                console.log( t.answer.toString() );
            };

            return i;
        }( o.SolverBase );

        // Export the Solver class.
        i.Solver = f;
    },

    /* 3 */
    function( t, i, n ) {
        "use strict";

        // Mark as an ES module.
        i.__esModule = !0;

        // Base class for solvers.
        var e = function() {};

        // Export SolverBase.
        i.SolverBase = e;
    },

    /* 4 */
    function( t, i, n ) {
        "use strict";

        // Helper for __generator (TypeScript generator function compilation).
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
                                        if ( !( r = ( r = o.trys ).length > 0 && r[ r.length - 1 ] ) && ( 6 === s[ 0 ] || 2 === s[ 0 ] ) ) {
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

        // Mark as an ES module.
        i.__esModule = !0;

        // Generator function to iterate over space-separated values.
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

    /* 5 */
    function( t, i ) {
        // Export the Long constructor (e).
        t.exports = e;

        // WebAssembly module for faster operations if available.
        var n = null;

        try {
            // Attempt to load WebAssembly module.
            n = new WebAssembly.Instance( new WebAssembly.Module( new Uint8Array( [
                0, 97, 115, 109, 1, 0, 0, 0, 1, 13, 2, 96, 0, 1, 127, 96, 4, 127, 127, 127, 127, 1, 127, 3, 7, 6, 0, 1, 1, 1, 1, 1, 6, 6, 1, 127, 1, 65, 0, 11, 7, 50, 6, 3, 109, 117, 108, 0, 1, 5, 100, 105, 118, 95, 115, 0, 2, 5, 100, 105, 118, 95, 117, 0, 3, 5, 114, 101, 109, 95, 115, 0, 4, 5, 114, 101, 109, 95, 117, 0, 5, 8, 103, 101, 116, 95, 104, 105, 103, 104, 0, 0, 10, 191, 1, 6, 4, 0, 35, 0, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 126, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 127, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 128, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 129, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 130, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11
            ] ) ), {} ).exports;
        } catch ( t ) {} // Catch and ignore WebAssembly loading errors.

        /**
         * A 64-bit two's complement integer.
         * @class
         * @param {number} low - The low 32 bits.
         * @param {number} high - The high 32 bits.
         * @param {boolean} [unsigned=false] - Whether the long is unsigned.
         * @constructor
         */
        function e( t, i, n ) {
            /** @type {number} */
            this.low = 0 | t; // Ensure 32-bit integer.
            /** @type {number} */
            this.high = 0 | i; // Ensure 32-bit integer.
            /** @type {boolean} */
            this.unsigned = !!n;
        }

        /**
         * Tests if the specified object is a Long.
         * @param {*} t - The object to test.
         * @returns {boolean} - True if the object is a Long, false otherwise.
         */
        function r( t ) {
            return !0 === ( t && t.__isLong__ );
        }

        /**
         * Mark the prototype as a Long instance.
         * @type {boolean}
         * @private
         */
        e.prototype.__isLong__, Object.defineProperty( e.prototype, "__isLong__", {
            value: !0
        } );

        /**
         * @function
         * @param {*} obj
         * @returns {boolean}
         */
        e.isLong = r;

        // Cache for small signed integers.
        var s = {};

        // Cache for small unsigned integers.
        var o = {};

        /**
         * Creates a Long from a 32-bit integer.
         * @param {number} t - The 32-bit integer.
         * @param {boolean} [i=false] - Whether the long is unsigned.
         * @returns {Long}
         */
        function u( t, i ) {
            var n, e, r;

            if ( i ) {
                // Unsigned cache lookup.
                r = 0 <= ( t >>>= 0 ) && t < 256;
                if ( r && ( e = o[ t ] ) ) {
                    return e;
                }
                n = f( t, ( 0 | t ) < 0 ? -1 : 0, !0 );
                if ( r ) {
                    o[ t ] = n;
                }
                return n;
            } else {
                // Signed cache lookup.
                r = -128 <= ( t |= 0 ) && t < 128;
                if ( r && ( e = s[ t ] ) ) {
                    return e;
                }
                n = f( t, t < 0 ? -1 : 0, !1 );
                if ( r ) {
                    s[ t ] = n;
                }
                return n;
            }
        }

        /**
         * Creates a Long from a number.
         * @param {number} t - The number.
         * @param {boolean} [i=false] - Whether the long is unsigned.
         * @returns {Long}
         */
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

        /**
         * Creates a Long from its low and high 32-bit parts.
         * @param {number} t - The low 32 bits.
         * @param {number} i - The high 32 bits.
         * @param {boolean} [n=false] - Whether the long is unsigned.
         * @returns {Long}
         */
        function f( t, i, n ) {
            return new e( t, i, n );
        }

        /**
         * @function
         * @param {number} int
         * @param {boolean} [unsigned=false]
         * @returns {Long}
         */
        e.fromInt = u;

        /**
         * @function
         * @param {number} num
         * @param {boolean} [unsigned=false]
         * @returns {Long}
         */
        e.fromNumber = h;

        /**
         * @function
         * @param {number} lowBits
         * @param {number} highBits
         * @param {boolean} [unsigned=false]
         * @returns {Long}
         */
        e.fromBits = f;

        /**
         * @type {function(number, number): number}
         * @private
         */
        var l = Math.pow;

        /**
         * Creates a Long from a string.
         * @param {string} t - The string to parse.
         * @param {number|boolean} [i=false] - Radix (2-36) or whether the long is unsigned.
         * @param {number} [n=10] - Radix.
         * @returns {Long}
         */
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

            s.unsigned = i;
            return s;
        }

        /**
         * Creates a Long from a value.
         * @param {(Long|number|string)} t - The value.
         * @param {boolean} [i=false] - Whether the long is unsigned.
         * @returns {Long}
         */
        function g( t, i ) {
            return "number" == typeof t ? h( t, i ) : "string" == typeof t ? a( t, i ) : f( t.low, t.high, "boolean" == typeof i ? i : t.unsigned );
        }

        /**
         * @function
         * @param {string} str
         * @param {boolean|number} [unsigned=false]
         * @param {number} [radix=10]
         * @returns {Long}
         */
        e.fromString = a;

        /**
         * @function
         * @param {(Long|number|string)} val
         * @param {boolean} [unsigned=false]
         * @returns {Long}
         */
        e.fromValue = g;

        // Constants.
        var c = 4294967296; // 2^32
        var d = c * c; // 2^64
        var v = d / 2; // 2^63

        // Pre-calculated constants.
        var p = u( 1 << 24 ); // 2^24 for optimization.
        var w = u( 0 ); // Zero.

        /** @type {Long} */
        e.ZERO = w;

        var m = u( 0, !0 ); // Unsigned Zero.

        /** @type {Long} */
        e.UZERO = m;

        var y = u( 1 ); // One.

        /** @type {Long} */
        e.ONE = y;

        var b = u( 1, !0 ); // Unsigned One.

        /** @type {Long} */
        e.UONE = b;

        var _ = u( -1 ); // Negative One.

        /** @type {Long} */
        e.NEG_ONE = _;

        var N = f( -1, 2147483647, !1 ); // Max signed value.

        /** @type {Long} */
        e.MAX_VALUE = N;

        var E = f( -1, -1, !0 ); // Max unsigned value.

        /** @type {Long} */
        e.MAX_UNSIGNED_VALUE = E;

        var O = f( 0, -2147483648, !1 ); // Min signed value.

        /** @type {Long} */
        e.MIN_VALUE = O;

        // Prototype alias for convenience.
        var q = e.prototype;

        /**
         * Converts the Long to a 32-bit integer.
         * @returns {number}
         */
        q.toInt = function() {
            return this.unsigned ? this.low >>> 0 : this.low;
        };

        /**
         * Converts the Long to a number.
         * @returns {number}
         */
        q.toNumber = function() {
            return this.unsigned ? ( this.high >>> 0 ) * c + ( this.low >>> 0 ) : this.high * c + ( this.low >>> 0 );
        };

        /**
         * Converts the Long to a string.
         * @param {number} [t=10] - Radix (2-36).
         * @returns {string}
         */
        q.toString = function( t ) {
            if ( ( t = t || 10 ) < 2 || 36 < t ) {
                throw RangeError( "radix" );
            }
            if ( this.isZero() ) {
                return "0";
            }
            if ( this.isNegative() ) {
                // Handle MIN_VALUE specially.
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

        /**
         * Gets the high 32 bits as a signed integer.
         * @returns {number}
         */
        q.getHighBits = function() {
            return this.high;
        };

        /**
         * Gets the high 32 bits as an unsigned integer.
         * @returns {number}
         */
        q.getHighBitsUnsigned = function() {
            return this.high >>> 0;
        };

        /**
         * Gets the low 32 bits as a signed integer.
         * @returns {number}
         */
        q.getLowBits = function() {
            return this.low;
        };

        /**
         * Gets the low 32 bits as an unsigned integer.
         * @returns {number}
         */
        q.getLowBitsUnsigned = function() {
            return this.low >>> 0;
        };

        /**
         * Gets the number of bits needed to represent the absolute value of this Long.
         * @returns {number}
         */
        q.getNumBitsAbs = function() {
            if ( this.isNegative() ) {
                return this.eq( O ) ? 64 : this.neg().getNumBitsAbs();
            }

            for ( var t = 0 != this.high ? this.high : this.low, i = 31; i > 0 && 0 == ( t & 1 << i ); i-- );
            return 0 != this.high ? i + 33 : i + 1;
        };

        /**
         * Tests if this Long is zero.
         * @returns {boolean}
         */
        q.isZero = function() {
            return 0 === this.high && 0 === this.low;
        };

        /** @function */
        q.eqz = q.isZero;

        /**
         * Tests if this Long is negative.
         * @returns {boolean}
         */
        q.isNegative = function() {
            return !this.unsigned && this.high < 0;
        };

        /**
         * Tests if this Long is positive.
         * @returns {boolean}
         */
        q.isPositive = function() {
            return this.unsigned || this.high >= 0;
        };

        /**
         * Tests if this Long is odd.
         * @returns {boolean}
         */
        q.isOdd = function() {
            return 1 == ( 1 & this.low );
        };

        /**
         * Tests if this Long is even.
         * @returns {boolean}
         */
        q.isEven = function() {
            return 0 == ( 1 & this.low );
        };

        /**
         * Compares this Long to the specified Long.
         * @param {Long} t - The Long to compare against.
         * @returns {boolean}
         */
        q.equals = function( t ) {
            return r( t ) || ( t = g( t ) ), ( this.unsigned === t.unsigned || this.high >>> 31 != 1 || t.high >>> 31 != 1 ) && ( this.high === t.high && this.low === t.low );
        };

        /** @function */
        q.eq = q.equals;

        /**
         * Tests if this Long is not equal to the specified Long.
         * @param {Long} t - The Long to compare against.
         * @returns {boolean}
         */
        q.notEquals = function( t ) {
            return !this.eq( t );
        };

        /** @function */
        q.neq = q.notEquals;

        /** @function */
        q.ne = q.notEquals;

        /**
         * Tests if this Long is less than the specified Long.
         * @param {Long} t - The Long to compare against.
         * @returns {boolean}
         */
        q.lessThan = function( t ) {
            return this.comp( t ) < 0;
        };

        /** @function */
        q.lt = q.lessThan;

        /**
         * Tests if this Long is less than or equal to the specified Long.
         * @param {Long} t - The Long to compare against.
         * @returns {boolean}
         */
        q.lessThanOrEqual = function( t ) {
            return this.comp( t ) <= 0;
        };

        /** @function */
        q.lte = q.lessThanOrEqual;

        /** @function */
        q.le = q.lessThanOrEqual;

        /**
         * Tests if this Long is greater than the specified Long.
         * @param {Long} t - The Long to compare against.
         * @returns {boolean}
         */
        q.greaterThan = function( t ) {
            return this.comp( t ) > 0;
        };

        /** @function */
        q.gt = q.greaterThan;

        /**
         * Tests if this Long is greater than or equal to the specified Long.
         * @param {Long} t - The Long to compare against.
         * @returns {boolean}
         */
        q.greaterThanOrEqual = function( t ) {
            return this.comp( t ) >= 0;
        };

        /** @function */
        q.gte = q.greaterThanOrEqual;

        /** @function */
        q.ge = q.greaterThanOrEqual;

        /**
         * Compares this Long to the specified Long.
         * @param {Long} t - The Long to compare against.
         * @returns {number} - 0 if equal, -1 if less, 1 if greater.
         */
        q.compare = function( t ) {
            if ( r( t ) || ( t = g( t ) ), this.eq( t ) ) {
                return 0;
            }

            var i = this.isNegative();
            var n = t.isNegative();

            return i && !n ? -1 : !i && n ? 1 : this.unsigned ? t.high >>> 0 > this.high >>> 0 || t.high === this.high && t.low >>> 0 > this.low >>> 0 ? -1 : 1 : this.sub( t ).isNegative() ? -1 : 1;
        };

        /** @function */
        q.comp = q.compare;

        /**
         * Negates this Long.
         * @returns {Long}
         */
        q.negate = function() {
            return !this.unsigned && this.eq( O ) ? O : this.not().add( y );
        };

        /** @function */
        q.neg = q.negate;

        /**
         * Adds the specified Long to this Long.
         * @param {Long} t - The Long to add.
         * @returns {Long}
         */
        q.add = function( t ) {
            r( t ) || ( t = g( t ) );

            // Divide each number into 16-bit segments.
            var i = this.high >>> 16;
            var n = 65535 & this.high;
            var e = this.low >>> 16;
            var s = 65535 & this.low;

            var o = t.high >>> 16;
            var u = 65535 & t.high;
            var h = t.low >>> 16;
            var l = 0,
                a = 0,
                c = 0,
                d = 0;

            // Perform addition on 16-bit segments with carries.
            c += ( d += s + ( 65535 & t.low ) ) >>> 16;
            a += ( c += e + h ) >>> 16;
            l += ( a += n + u ) >>> 16;
            l += i + o;

            // Reconstruct the Long from the segments.
            return f( ( c &= 65535 ) << 16 | ( d &= 65535 ), ( l &= 65535 ) << 16 | ( a &= 65535 ), this.unsigned );
        };

        /**
         * Subtracts the specified Long from this Long.
         * @param {Long} t - The Long to subtract.
         * @returns {Long}
         */
        q.subtract = function( t ) {
            return r( t ) || ( t = g( t ) ), this.add( t.neg() );
        };

        /** @function */
        q.sub = q.subtract;

        /**
         * Multiplies this Long by the specified Long.
         * @param {Long} t - The Long to multiply by.
         * @returns {Long}
         */
        q.multiply = function( t ) {
            if ( this.isZero() ) {
                return w;
            }
            if ( r( t ) || ( t = g( t ) ), n ) {
                // Use WebAssembly for faster multiplication if available.
                return f( n.mul( this.low, this.high, t.low, t.high ), n.get_high(), this.unsigned );
            }
            if ( t.isZero() ) {
                return w;
            }

            // Handle special cases for MIN_VALUE.
            if ( this.eq( O ) ) {
                return t.isOdd() ? O : w;
            }
            if ( t.eq( O ) ) {
                return this.isOdd() ? O : w;
            }

            // Handle signs.
            if ( this.isNegative() ) {
                return t.isNegative() ? this.neg().mul( t.neg() ) : this.neg().mul( t ).neg();
            }
            if ( t.isNegative() ) {
                return this.mul( t.neg() ).neg();
            }

            // Optimized for small numbers.
            if ( this.lt( p ) && t.lt( p ) ) {
                return h( this.toNumber() * t.toNumber(), this.unsigned );
            }

            // Full 64-bit multiplication.
            var i = this.high >>> 16;
            var e = 65535 & this.high;
            var s = this.low >>> 16;
            var o = 65535 & this.low;

            var u = t.high >>> 16;
            var l = 65535 & t.high;
            var a = t.low >>> 16;
            var c = 65535 & t.low;

            var d = 0,
                v = 0,
                m = 0,
                y = 0;

            // Perform multiplication on 16-bit segments.
            m += ( y += o * c ) >>> 16;
            v += ( m += s * c ) >>> 16;
            m &= 65535;
            v += ( m += o * a ) >>> 16;
            d += ( v += e * c ) >>> 16;
            v &= 65535;
            d += ( v += s * a ) >>> 16;
            v &= 65535;
            d += ( v += o * l ) >>> 16;
            d += i * c + e * a + s * l + o * u;

            // Reconstruct the Long.
            return f( ( m &= 65535 ) << 16 | ( y &= 65535 ), ( d &= 65535 ) << 16 | ( v &= 65535 ), this.unsigned );
        };

        /** @function */
        q.mul = q.multiply;

        /**
         * Divides this Long by the specified Long.
         * @param {Long} t - The Long to divide by.
         * @returns {Long}
         */
        q.divide = function( t ) {
            if ( r( t ) || ( t = g( t ) ), t.isZero() ) {
                throw Error( "division by zero" );
            }

            var i, e, s;

            if ( n ) {
                // Use WebAssembly for faster division if available.
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
                // Signed division logic.
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

            // Repeated subtraction method for division.
            for ( e = this; e.gte( t ); ) {
                i = Math.max( 1, Math.floor( e.toNumber() / t.toNumber() ) );

                for ( var o = Math.ceil( Math.log( i ) / Math.LN2 ), u = o <= 48 ? 1 : l( 2, o - 48 ), a = h( i ), c = a.mul( t ); c.isNegative() || c.gt( e ); ) {
                    c = ( a = h( i -= u, this.unsigned ) ).mul( t );
                }
                a.isZero() && ( a = y ), s = s.add( a ), e = e.sub( c );
            }

            return s;
        };

        /** @function */
        q.div = q.divide;

        /**
         * Calculates the modulo of this Long and the specified Long.
         * @param {Long} t - The Long to modulo by.
         * @returns {Long}
         */
        q.modulo = function( t ) {
            return r( t ) || ( t = g( t ) ), n ? f( ( this.unsigned ? n.rem_u : n.rem_s )( this.low, this.high, t.low, t.high ), n.get_high(), this.unsigned ) : this.sub( this.div( t ).mul( t ) );
        };

        /** @function */
        q.mod = q.modulo;

        /** @function */
        q.rem = q.modulo;

        /**
         * Performs a bitwise NOT operation on this Long.
         * @returns {Long}
         */
        q.not = function() {
            return f( ~this.low, ~this.high, this.unsigned );
        };

        /**
         * Performs a bitwise AND operation on this Long and the specified Long.
         * @param {Long} t - The Long to AND with.
         * @returns {Long}
         */
        q.and = function( t ) {
            return r( t ) || ( t = g( t ) ), f( this.low & t.low, this.high & t.high, this.unsigned );
        };

        /**
         * Performs a bitwise OR operation on this Long and the specified Long.
         * @param {Long} t - The Long to OR with.
         * @returns {Long}
         */
        q.or = function( t ) {
            return r( t ) || ( t = g( t ) ), f( this.low | t.low, this.high | t.high, this.unsigned );
        };

        /**
         * Performs a bitwise XOR operation on this Long and the specified Long.
         * @param {Long} t - The Long to XOR with.
         * @returns {Long}
         */
        q.xor = function( t ) {
            return r( t ) || ( t = g( t ) ), f( this.low ^ t.low, this.high ^ t.high, this.unsigned );
        };

        /**
         * Performs a left shift operation on this Long.
         * @param {number|Long} t - The number of bits to shift.
         * @returns {Long}
         */
        q.shiftLeft = function( t ) {
            return r( t ) && ( t = t.toInt() ), 0 == ( t &= 63 ) ? this : t < 32 ? f( this.low << t, this.high << t | this.low >>> ( 32 - t ), this.unsigned ) : f( 0, this.low << ( t - 32 ), this.unsigned );
        };

        /** @function */
        q.shl = q.shiftLeft;

        /**
         * Performs a signed right shift operation on this Long.
         * @param {number|Long} t - The number of bits to shift.
         * @returns {Long}
         */
        q.shiftRight = function( t ) {
            return r( t ) && ( t = t.toInt() ), 0 == ( t &= 63 ) ? this : t < 32 ? f( this.low >>> t | this.high << ( 32 - t ), this.high >> t, this.unsigned ) : f( this.high >> ( t - 32 ), this.high >= 0 ? 0 : -1, this.unsigned );
        };

        /** @function */
        q.shr = q.shiftRight;

        /**
         * Performs an unsigned right shift operation on this Long.
         * @param {number|Long} t - The number of bits to shift.
         * @returns {Long}
         */
        q.shiftRightUnsigned = function( t ) {
            if ( r( t ) && ( t = t.toInt() ), 0 === ( t &= 63 ) ) {
                return this;
            }

            var i = this.high;
            return t < 32 ? f( this.low >>> t | i << ( 32 - t ), i >>> t, this.unsigned ) : f( 32 === t ? i : i >>> ( t - 32 ), 0, this.unsigned );
        };

        /** @function */
        q.shru = q.shiftRightUnsigned;

        /** @function */
        q.shr_u = q.shiftRightUnsigned;

        /**
         * Converts this Long to a signed Long.
         * @returns {Long}
         */
        q.toSigned = function() {
            return this.unsigned ? f( this.low, this.high, !1 ) : this;
        };

        /**
         * Converts this Long to an unsigned Long.
         * @returns {Long}
         */
        q.toUnsigned = function() {
            return this.unsigned ? this : f( this.low, this.high, !0 );
        };

        /**
         * Converts this Long to a byte array.
         * @param {boolean} [t=false] - True for little-endian, false for big-endian.
         * @returns {number[]}
         */
        q.toBytes = function( t ) {
            return t ? this.toBytesLE() : this.toBytesBE();
        };

        /**
         * Converts this Long to a little-endian byte array.
         * @returns {number[]}
         */
        q.toBytesLE = function() {
            var t = this.high;
            var i = this.low;
            return [
                255 & i,
                i >>> 8 & 255,
                i >>> 16 & 255,
                i >>> 24,
                255 & t,
                t >>> 8 & 255,
                t >>> 16 & 255,
                t >>> 24
            ];
        };

        /**
         * Converts this Long to a big-endian byte array.
         * @returns {number[]}
         */
        q.toBytesBE = function() {
            var t = this.high;
            var i = this.low;
            return [
                t >>> 24,
                t >>> 16 & 255,
                t >>> 8 & 255,
                255 & t,
                i >>> 24,
                i >>> 16 & 255,
                i >>> 8 & 255,
                255 & i
            ];
        };

        /**
         * Creates a Long from a byte array.
         * @param {number[]} t - The byte array.
         * @param {boolean} [i=false] - Whether the long is unsigned.
         * @param {boolean} [n=false] - True for little-endian, false for big-endian.
         * @returns {Long}
         */
        e.fromBytes = function( t, i, n ) {
            return n ? e.fromBytesLE( t, i ) : e.fromBytesBE( t, i );
        };

        /**
         * Creates a Long from a little-endian byte array.
         * @param {number[]} t - The byte array.
         * @param {boolean} [i=false] - Whether the long is unsigned.
         * @returns {Long}
         */
        e.fromBytesLE = function( t, i ) {
            return new e( t[ 0 ] | t[ 1 ] << 8 | t[ 2 ] << 16 | t[ 3 ] << 24, t[ 4 ] | t[ 5 ] << 8 | t[ 6 ] << 16 | t[ 7 ] << 24, i );
        };

        /**
         * Creates a Long from a big-endian byte array.
         * @param {number[]} t - The byte array.
         * @param {boolean} [i=false] - Whether the long is unsigned.
         * @returns {Long}
         */
        e.fromBytesBE = function( t, i ) {
            return new e( t[ 4 ] << 24 | t[ 5 ] << 16 | t[ 6 ] << 8 | t[ 7 ], t[ 0 ] << 24 | t[ 1 ] << 16 | t[ 2 ] << 8 | t[ 3 ], i );
        };
    }
] );