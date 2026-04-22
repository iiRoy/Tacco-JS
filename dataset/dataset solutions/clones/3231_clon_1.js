! function ( t ) {
// This is the main webpack bootstrap function wrapper.
// It encapsulates the module system.

    var n = {}; // This object holds the cache of loaded modules.

    /**
     * The webpack require function.
     * @param {number} r - The module ID.
     * @returns {any} The exports of the required module.
     */
    function e ( r ) {

        // Check if module is already in cache
        if ( n[ r ] ) {
            return n[ r ].exports;
        }

        // Create a new module (and put it into the cache)
        var i = n[ r ] = {
            i : r,      // Module ID
            l : ! 1,    // Loaded flag
            exports : {} // Module exports object
        };

        // Execute the module function
        t[ r ].call( i.exports, i, i.exports, e );

        // Set loaded flag to true
        i.l = ! 0;

        // Return the exports of the module
        return i.exports;
    }


    // Expose the modules object (__webpack_modules__)
    e.m = t;

    // Expose the module cache (__webpack_cache__)
    e.c = n;


    // Define getter functions for harmony exports
    e.d = function ( t, n, r ) {

        // If property doesn't exist on exports object, define it
        e.o( t, n ) || Object.defineProperty( t, n, {
            enumerable : ! 0, // Make it enumerable
            get : r           // Define a getter
        } );

    };

    // Define __esModule on exports
    e.r = function ( t ) {

        // Set Symbol.toStringTag for module namespace object
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty( t, Symbol.toStringTag, { value : "Module" } );

        // Set __esModule to true
        Object.defineProperty( t, "__esModule", { value : ! 0 } );
    };


    // Compatibility getter for non-harmony modules
    e.t = function ( t, n ) {

        // 1 = module is a require.a
        if ( 1 & n && ( t = e( t ) ) , 8 & n ) return t;

        // 4 = module is an export
        if ( 4 & n && "object" == typeof t && t && t.__esModule ) return t;

        // Create a fake namespace object
        var r = Object.create( null );

        // Define __esModule on the fake namespace
        if ( e.r( r ) , Object.defineProperty( r, "default", { enumerable : ! 0, value : t } ) , 2 & n && "string" != typeof t ) {
            for ( var i in t ) {
                e.d( r, i, function ( n ) { return t[ n ] }.bind( null, i ) );
            }
        }
        return r;
    };


    // Get default export for compatibility with non-harmony modules
    e.n = function ( t ) {

        var n = t && t.__esModule ?
            function () { return t.default; } :
            function () { return t; };

        // Define a "a" getter for the default export
        return e.d( n, "a", n ), n;
    };


    // Object.prototype.hasOwnProperty.call
    e.o = function ( t, n ) {
        return Object.prototype.hasOwnProperty.call( t, n );
    };

    // Public path
    e.p = "";

    // Load entry module and return exports
    return e( e.s = 4 );

} ( [
    /* 0 */
    function ( t, n, e ) {
        "use strict";

        // __awaiter polyfill for async/await
        var r = this && this.__awaiter || function ( t, n, e, r ) {
            return new ( e || ( e = Promise ) )( function ( i, o ) {
                function u ( t ) {
                    try {
                        c( r.next( t ) );
                    } catch ( t ) {
                        o( t );
                    }
                }
                function a ( t ) {
                    try {
                        c( r.throw( t ) );
                    } catch ( t ) {
                        o( t );
                    }
                }
                function c ( t ) {
                    t.done ? i( t.value ) : new e( function ( n ) { n( t.value ) } ).then( u, a );
                }
                c( ( r = r.apply( t, n || [] ) ).next() );
            } );
        };

        // __generator polyfill for async iterators
        var i = this && this.__generator || function ( t, n ) {
            var e, r, i, o, u = {
                label : 0,
                sent : function () {
                    if ( 1 & i[ 0 ] ) throw i[ 1 ];
                    return i[ 1 ];
                },
                trys : [],
                ops : []
            };
            return o = {
                next : a( 0 ),
                throw : a( 1 ),
                return : a( 2 )
            }, "function" == typeof Symbol && ( o[ Symbol.iterator ] = function () { return this; } ), o;
            function a ( o ) {
                return function ( a ) {
                    return function ( o ) {
                        if ( e ) throw new TypeError( "Generator is already executing." );
                        for ( ; u ; )
                            try {
                                if ( e = 1, r && ( i = 2 & o[ 0 ] ? r.return : o[ 0 ] ? r.throw || ( ( i = r.return ) && i.call( r ), 0 ) : r.next ) && ! ( i = i.call( r, o[ 1 ] ) ).done ) return i;
                                switch ( r = 0, i && ( o = [ 2 & o[ 0 ], i.value ] ), o[ 0 ] ) {
                                    case 0:
                                    case 1:
                                        i = o;
                                        break;
                                    case 4:
                                        return u.label ++, { value : o[ 1 ], done : ! 1 };
                                    case 5:
                                        u.label ++, r = o[ 1 ], o = [ 0 ];
                                        continue;
                                    case 7:
                                        o = u.ops.pop(), u.trys.pop();
                                        continue;
                                    default:
                                        if ( ! ( i = ( i = u.trys ).length > 0 && i[ i.length - 1 ] ) && ( 6 === o[ 0 ] || 2 === o[ 0 ] ) ) {
                                            u = 0;
                                            continue;
                                        }
                                        if ( 3 === o[ 0 ] && ( ! i || o[ 1 ] > i[ 0 ] && o[ 1 ] < i[ 3 ] ) ) {
                                            u.label = o[ 1 ];
                                            break;
                                        }
                                        if ( 6 === o[ 0 ] && u.label < i[ 1 ] ) {
                                            u.label = i[ 1 ], i = o;
                                            break;
                                        }
                                        if ( i && u.label < i[ 2 ] ) {
                                            u.label = i[ 2 ], u.ops.push( o );
                                            break;
                                        }
                                        i[ 2 ] && u.ops.pop(), u.trys.pop();
                                        continue;
                                }
                                o = n.call( t, u );
                            } catch ( t ) {
                                o = [ 6, t ], r = 0;
                            } finally {
                                e = i = 0;
                            }
                        if ( 5 & o[ 0 ] ) throw o[ 1 ];
                        return { value : o[ 0 ] ? o[ 1 ] : void 0, done : ! 0 };
                    }
                }( o );
            }
        };

        // __importDefault polyfill
        var o = this && this.__importDefault || function ( t ) {
            return t && t.__esModule ? t : { default : t };
        };

        var u = this; // Capture 'this' context

        // Mark this module as an ES module
        n.__esModule = ! 0;

        // Import 'fs' module
        var a = o( e( 1 ) );


        /**
         * Generator function to iterate over words in a string.
         * @param {string} t - The input string.
         */
        function c ( t ) {
            var n, e;

            return i( this, function ( r ) {
                switch ( r.label ) {
                    case 0:
                        n = t.split( /\s+/ ).filter( function ( t ) { return t.length > 0 } );
                        e = 0;
                        r.label = 1;

                    case 1:
                        return e < n.length ? [ 4, n[ e ] ] : [ 3, 4 ];

                    case 2:
                        r.sent();
                        r.label = 3;

                    case 3:
                        return e ++, [ 3, 1 ];

                    case 4:
                        return [ 2 ];
                }
            } );
        }


        // Function to read input from stdin
        n.readInput = function () {
            return new Promise( function ( t, n ) {
                a.default.readFile( "/dev/stdin", "utf8", function ( e, r ) {
                    e ? n( e ) : t( r );
                } );
            } );
        };

        // Expose the word iterator function
        n.getFoolIterator = c;


        // Function to get the next integer from stdin using the "fool" iterator
        n.getFoolNextInt = function () {
            return r( u, void 0, void 0, function () {
                var t, e;
                return i( this, function ( r ) {
                    switch ( r.label ) {
                        case 0:
                            return [ 4, n.readInput() ];
                        case 1:
                            t = r.sent();
                            e = c( t );
                            return [ 2, function () { return parseInt( e.next().value ); } ];
                    }
                } );
            } );
        };


        // Function to get the next "chotto mashina" (slightly better) token from stdin
        n.getChottoMashinaNext = function () {
            return r( u, void 0, void 0, function () {
                var t, e;
                return i( this, function ( r ) {
                    switch ( r.label ) {
                        case 0:
                            return [ 4, n.readInput() ];
                        case 1:
                            t = r.sent();
                            e = function () {
                                var n, e, r;
                                return i( this, function ( i ) {
                                    switch ( i.label ) {
                                        case 0:
                                            n = - 1; // Start index of current token
                                            e = 0;   // Current character index
                                            i.label = 1;

                                        case 1:
                                            // Loop through the input string
                                            return e <= t.length ?
                                                " " !== t[ e ] && "\n" !== t[ e ] && e !== t.length ?
                                                    [ 3, 5 ] : // Character is part of token
                                                    - 1 !== n ?
                                                        [ 3, 2 ] : // End of token, yield it
                                                        [ 3, 6 ] : // Whitespace, continue scanning
                                                [ 3, 7 ]; // End of string

                                        case 2:
                                            r = t.substring( n, e ); // Extract token
                                            n = - 1;                 // Reset start index
                                            return [ 4, r ];         // Yield token

                                        case 3:
                                            i.sent();
                                            i.label = 4;
                                        case 4:
                                            return [ 3, 6 ];

                                        case 5:
                                            - 1 === n && ( n = e ); // Mark start of new token
                                            i.label = 6;

                                        case 6:
                                            return e ++, [ 3, 1 ]; // Move to next character

                                        case 7:
                                            return [ 2 ]; // Generator done
                                    }
                                } );
                            } ();
                            return [ 2, function () { return e.next().value; } ];
                    }
                } );
            } );
        };

        // Function to get the next integer from stdin using the "chotto mashina" iterator
        n.getChottoMashinaNextInt = function () {
            return r( u, void 0, void 0, function () {
                var t;
                return i( this, function ( e ) {
                    switch ( e.label ) {
                        case 0:
                            return [ 4, n.getChottoMashinaNext() ];
                        case 1:
                            t = e.sent();
                            return [ 2, function () { return parseInt( t() ); } ];
                    }
                } );
            } );
        };

    },
    /* 1 */
    function ( t, n ) {

        // Module 1 simply exports the Node.js 'fs' module.
        t.exports = require( "fs" );

    },
    /* 2 */
    ,
    /* 3 */
    ,
    /* 4 */
    function ( t, n, e ) {
        "use strict";

        // __awaiter polyfill, identical to module 0
        var r = this && this.__awaiter || function ( t, n, e, r ) {
            return new ( e || ( e = Promise ) )( function ( i, o ) {
                function u ( t ) { try { c( r.next( t ) ) } catch ( t ) { o( t ) } }
                function a ( t ) { try { c( r.throw( t ) ) } catch ( t ) { o( t ) } }
                function c ( t ) { t.done ? i( t.value ) : new e( function ( n ) { n( t.value ) } ).then( u, a ) }
                c( ( r = r.apply( t, n || [] ) ).next() )
            } )
        };

        // __generator polyfill, identical to module 0
        var i = this && this.__generator || function ( t, n ) {
            var e, r, i, o, u = {
                label : 0,
                sent : function () { if ( 1 & i[ 0 ] ) throw i[ 1 ]; return i[ 1 ] },
                trys : [],
                ops : []
            };
            return o = {
                next : a( 0 ),
                throw : a( 1 ),
                return : a( 2 )
            }, "function" == typeof Symbol && ( o[ Symbol.iterator ] = function () { return this } ), o;
            function a ( o ) {
                return function ( a ) {
                    return function ( o ) {
                        if ( e ) throw new TypeError( "Generator is already executing." );
                        for ( ; u ; )
                            try {
                                if ( e = 1, r && ( i = 2 & o[ 0 ] ? r.return : o[ 0 ] ? r.throw || ( ( i = r.return ) && i.call( r ), 0 ) : r.next ) && ! ( i = i.call( r, o[ 1 ] ) ).done ) return i;
                                switch ( r = 0, i && ( o = [ 2 & o[ 0 ], i.value ] ), o[ 0 ] ) {
                                    case 0:
                                    case 1:
                                        i = o;
                                        break;
                                    case 4:
                                        return u.label ++, { value : o[ 1 ], done : ! 1 };
                                    case 5:
                                        u.label ++, r = o[ 1 ], o = [ 0 ];
                                        continue;
                                    case 7:
                                        o = u.ops.pop(), u.trys.pop();
                                        continue;
                                    default:
                                        if ( ! ( i = ( i = u.trys ).length > 0 && i[ i.length - 1 ] ) && ( 6 === o[ 0 ] || 2 === o[ 0 ] ) ) { u = 0; continue }
                                        if ( 3 === o[ 0 ] && ( ! i || o[ 1 ] > i[ 0 ] && o[ 1 ] < i[ 3 ] ) ) { u.label = o[ 1 ]; break }
                                        if ( 6 === o[ 0 ] && u.label < i[ 1 ] ) { u.label = i[ 1 ], i = o; break }
                                        if ( i && u.label < i[ 2 ] ) { u.label = i[ 2 ], u.ops.push( o ); break }
                                        i[ 2 ] && u.ops.pop(), u.trys.pop(); continue
                                }
                                o = n.call( t, u )
                            } catch ( t ) { o = [ 6, t ], r = 0 } finally { e = i = 0 }
                        if ( 5 & o[ 0 ] ) throw o[ 1 ];
                        return { value : o[ 0 ] ? o[ 1 ] : void 0, done : ! 0 }
                    }
                }( o )
            }
        };

        var o = this; // Capture 'this' context

        // Mark this module as an ES module
        n.__esModule = ! 0;

        // Import BigBit class from module 5
        var u = e( 5 );

        // Import utility functions from module 0
        var a = e( 0 );

        // Main execution logic for module 4 (entry point)
        r( o, void 0, void 0, function () {
            var t, n, e, r;
            return i( this, function ( i ) {
                switch ( i.label ) {
                    case 0:
                        // Get the 'nextInt' function from input utilities
                        return [ 4, a.getChottoMashinaNextInt() ];
                    case 1:
                        t = i.sent(); // 't' is now the nextInt function
                        n = t();      // Read the first integer (N)
                        new u.BigBit( t() ); // Read another integer, perhaps a seed or initial value, but not stored.
                        e = new Array( n );  // Initialize an array of size N
                        r = 0;               // Loop counter
                        for ( ; r < n ; r ++ ) {
                            e[ r ] = new u.BigBit( t() ); // Populate array with N BigBit instances, each from an integer
                        }
                        return [ 2 ]; // Generator done
                }
            } );
        } );

    },
    /* 5 */
    function ( t, n, e ) {
        "use strict";

        // Mark this module as an ES module
        n.__esModule = ! 0;

        // Define the BigBit class
        var r = function () {

            /**
             * BigBit class constructor.
             * Represents a large binary number.
             * @param {number|string|string[]} n - Initial value (number, binary string, or bit array).
             */
            function t ( n ) {
                var e = this; // Capture 'this' for method definitions

                // Instance method: Bitwise OR operation
                this.or = function ( n ) {
                    return new t( t.common( n, e, function ( t, n ) {
                        return "1" === t || "1" === n ? "1" : "0";
                    } ) );
                };

                // Instance method: Bitwise AND operation
                this.and = function ( n ) {
                    return new t( t.common( n, e, function ( t, n ) {
                        return "1" === t && "1" === n ? "1" : "0";
                    } ) );
                };

                // Instance method: Bitwise XOR operation
                this.xor = function ( n ) {
                    return new t( t.common( n, e, function ( t, n ) {
                        return "1" === t && "0" === n || "0" === t && "1" === n ? "1" : "0";
                    } ) );
                };

                // Instance method: Get bit at a specific index
                this.getBit = function ( t ) { return e.bit[ t ]; };

                // Instance method: Get the highest zero index (or -1 if all zeros)
                this.getHighestZeroIndex = function () {
                    return e.isZero() ? - 1 : e.bit.length - 1;
                };

                // Instance method: Check if the BigBit represents zero
                this.isZero = function () {
                    return 1 === e.bit.length && "0" === e.bit[ 0 ];
                };

                // Instance method: Convert BigBit to a binary string
                this.toString = function () {
                    return e.bit.slice( 0 ).reverse().join( "" );
                };

                // Instance method: Convert BigBit to a number (up to JS number limits)
                this.toNumber = function () {
                    for ( var t = 0, n = 0 ; n < e.bit.length ; n ++ ) {
                        "1" === e.bit[ n ] && ( t += Math.pow( 2, n ) );
                    }
                    return t;
                };

                // Constructor logic based on input type
                if ( "number" == typeof n ) {
                    // If number, convert to binary string and then to bit array
                    this.bit = t.stringToBit( n.toString( 2 ) );
                } else if ( "string" == typeof n ) {
                    // If string, remove leading zeros and convert to bit array
                    var r = n.replace( /^0+/, "" );
                    0 === r.length && ( r = "0" ); // Handle case where string was "000"
                    this.bit = t.stringToBit( r );
                } else if ( Array.isArray( n ) ) {
                    // If array, find the last '1' and slice to remove trailing zeros
                    var i = n.lastIndexOf( "1" );
                    this.bit = i < 0 ? [ "0" ] : n.slice( 0, i + 1 );
                }

            }

            // Static method: Check if a character is a valid bit ('0' or '1')
            t.isBit = function ( t ) {
                return "0" === t || "1" === t;
            };

            // Static method: Convert a binary string to a reversed bit array
            t.stringToBit = function ( n ) {
                for ( var e = new Array( n.length ), r = 0 ; r < n.length ; r ++ ) {
                    var i = n[ r ];
                    if ( ! t.isBit( i ) ) {
                        throw Error( n + " is not bit" ); // Error for invalid character
                    }
                    e[ r ] = i;
                }
                return e.reverse(), e; // Reverse the array for little-endian representation
            };

            // Static method: Common logic for bitwise operations
            t.common = function ( t, n, e ) {
                var r = Math.max( t.bit.length, n.bit.length ); // Determine max length
                var i = new Array( r );                         // Result array
                for ( var o = 0 ; o < r ; o ++ ) {
                    // Apply the bitwise logic function 'e' to corresponding bits
                    var u = e( o < t.bit.length ? t.bit[ o ] : "0", o < n.bit.length ? n.bit[ o ] : "0" );
                    i[ r - o - 1 ] = u; // Store result in big-endian order temporarily
                }
                return i; // Return the bit array
            };

            return t; // Return the BigBit class
        }();

        // Expose BigBit class
        n.BigBit = r;

    }
] );
// This comment is for the end of the file. It was originally "Checking input speed".
// It's now just a generic concluding comment.