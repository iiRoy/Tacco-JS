parcelRequire = function ( e, r, t, n ) {
    /* This is the main Parcel Require function. */
    /* It takes four arguments: */
    /* e: modules definitions */
    /* r: module cache */
    /* t: entry module IDs */
    /* n: global object name (optional) */

    var i,
        o = "function" == typeof parcelRequire && parcelRequire, /* Reference to the current parcelRequire */
        u = "function" == typeof require && require;             /* Reference to Node.js require */


    // Define the core module loading function 'f'
    function f ( t, n ) {

        /* Check if the module is already in the cache 'r' */
        if ( !r[t] ) {

            /* If not in cache, check if the module definition exists in 'e' */
            if ( !e[t] ) {

                var i = "function" == typeof parcelRequire && parcelRequire; // Another check for parcelRequire

                /* Attempt to load from an external parcelRequire instance */
                if ( !n && i ) {
                    return i( t, !0 );
                }

                /* Attempt to load from the 'o' (original parcelRequire) instance */
                if ( o ) {
                    return o( t, !0 );
                }

                /* Attempt to load using Node.js 'require' */
                if ( u && "string" == typeof t ) {
                    return u( t );
                }

                /* If all attempts fail, throw an error indicating module not found */
                var c = new Error( "Cannot find module '" + t + "'" );
                throw c.code = "MODULE_NOT_FOUND", c;
            }

            /* Module definition found, prepare its environment */
            p.resolve = function ( r ) {
                return e[t][1][r] || r
            };

            p.cache = {};

            /* Create a new module instance and store it in the cache */
            var l = r[t] = new f.Module( t );

            /* Execute the module's code, passing in its dependencies and exports */
            e[t][0].call( l.exports, p, l, l.exports, this )
        }

        /* Return the exports of the loaded module */
        return r[t].exports;


        /* Helper function 'p' to resolve module paths within the bundle */
        function p ( e ) {
            return f( p.resolve( e ) )
        }
    }


    /* Set properties on the main module loader function 'f' */
    f.isParcelRequire = !0; // Mark this function as a Parcel Require instance


    f.Module = function ( e ) {
        this.id = e;        // Module ID
        this.bundle = f;    // Reference to the bundle loader
        this.exports = {};  // Module exports object
    };


    f.modules = e; // Store module definitions
    f.cache = r;   // Store module cache
    f.parent = o;  // Store parent parcelRequire reference


    f.register = function ( r, t ) {
        e[r] = [
            function ( e, r ) {
                r.exports = t
            }, {}
        ]
    };


    /* Loop through the entry modules 't' and load them */
    for ( var c = 0; c < t.length; c++ ) {
        try {
            f( t[c] ) // Attempt to load each entry module
        } catch ( e ) {
            // If an error occurs, store the first one
            i || ( i = e )
        }
    }


    /* If there are entry modules, handle their exports */
    if ( t.length ) {

        var l = f( t[t.length - 1] ); // Get the last loaded entry module's exports

        /* Export the bundle based on the environment */
        "object" == typeof exports && "undefined" != typeof module
            ? module.exports = l                                         // CommonJS environment
            : "function" == typeof define && define.amd
                ? define( function () { return l } )                      // AMD environment
                : n && ( this[n] = l )                                   // Global variable assignment
    }


    /* Update the global parcelRequire reference to this instance */
    parcelRequire = f;


    /* If an error was caught during loading, rethrow it */
    if ( i ) {
        throw i;
    }


    /* Return the final module loader function */
    return f
}( {
    "Focm": [ function ( require, module, exports ) {

        // This is the start of the actual bundled application code.
        // It's wrapped in a function that receives 'require', 'module', and 'exports'.

        var n = {}; // A common pattern for a global namespace object


        // --- Control.Semigroupoid Module ---
        !function ( n ) {
            "use strict";

            n["Control.Semigroupoid"] = n["Control.Semigroupoid"] || {}; // Initialize namespace

            var t = n["Control.Semigroupoid"],
                r = function ( n ) { this.compose = n }, // Semigroupoid constructor
                e = new r( function ( n ) { // semigropoidFn instance
                    return function ( t ) {
                        return function ( r ) {
                            return n( t( r ) )
                        }
                    }
                } );

            t.compose = function ( n ) { return n.compose }; // Accessor for compose method
            t.Semigroupoid = r;                              // Export constructor
            t.semigroupoidFn = e                             // Export instance
        }( n ),


        // --- Control.Category Module ---
        function ( n ) {
            "use strict";

            n["Control.Category"] = n["Control.Category"] || {}; // Initialize namespace

            var t = n["Control.Category"],
                r = n["Control.Semigroupoid"],
                e = function ( n, t ) { this.Semigroupoid0 = n, this.identity = t }, // Category constructor
                i = new e( function () { return r.semigroupoidFn }, function ( n ) { return n } ); // categoryFn instance

            t.Category = e;                                // Export constructor
            t.identity = function ( n ) { return n.identity }; // Accessor for identity method
            t.categoryFn = i                               // Export instance
        }( n ),


        // --- Data.Function Module ---
        function ( n ) {
            "use strict";

            n["Data.Function"] = n["Data.Function"] || {}; // Initialize namespace

            var t = n["Data.Function"];

            t.flip = function ( n ) {                      // Function to flip arguments
                return function ( t ) {
                    return function ( r ) {
                        return n( r )( t )
                    }
                }
            };

            t.const = function ( n ) {                     // Function that always returns its first argument
                return function ( t ) {
                    return n
                }
            }
        }( n ),


        // --- Data.Unit Module (part 1) ---
        function ( t ) {
            "use strict";
            ( n["Data.Unit"] = n["Data.Unit"] || {} ).unit = {} // Define a global unit object
        }(),


        // --- Data.Unit Module (part 2) ---
        function ( n ) {
            "use strict";

            n["Data.Unit"] = n["Data.Unit"] || {}; // Initialize namespace

            var t = n["Data.Unit"],
                r = n["Data.Unit"];

            t.unit = r.unit // Assign unit to itself, effectively a re-export or confirmation
        }( n ),


        // --- Data.Functor Module ---
        function ( n ) {
            "use strict";

            n["Data.Functor"] = n["Data.Functor"] || {}; // Initialize namespace

            var t = n["Data.Functor"],
                r = n["Data.Function"],
                e = n["Data.Unit"],
                i = function ( n ) { return n.map }; // Accessor for map method

            t.Functor = function ( n ) { this.map = n }; // Functor constructor
            t.map = i;                                   // Export map accessor

            t.void = function ( n ) {                    // Function to discard result and return unit
                return i( n )( r.const( e.unit ) )
            }
        }( n ),


        // --- Control.Apply Module ---
        function ( n ) {
            "use strict";

            n["Control.Apply"] = n["Control.Apply"] || {}; // Initialize namespace

            var t = n["Control.Apply"],
                r = n["Control.Category"],
                e = n["Data.Function"],
                i = n["Data.Functor"],
                u = function ( n ) { return n.apply }; // Accessor for apply method

            t.Apply = function ( n, t ) { this.Functor0 = n, this.apply = t }; // Apply constructor
            t.apply = u;                                                        // Export apply accessor

            t.applySecond = function ( n ) { // Apply an action, then another, discarding the first result
                return function ( t ) {
                    return function ( o ) {
                        return u( n )( i.map( n.Functor0() )( e.const( r.identity( r.categoryFn ) ) )( t ) )( o )
                    }
                }
            }
        }( n ),


        // --- Control.Applicative Module ---
        function ( n ) {
            "use strict";

            n["Control.Applicative"] = n["Control.Applicative"] || {}; // Initialize namespace

            var t = n["Control.Applicative"],
                r = n["Control.Apply"],
                e = function ( n ) { return n.pure }; // Accessor for pure method

            t.Applicative = function ( n, t ) { this.Apply0 = n, this.pure = t }; // Applicative constructor
            t.pure = e;                                                          // Export pure accessor

            t.liftA1 = function ( n ) { // Lift a unary function into an applicative context
                return function ( t ) {
                    return function ( i ) {
                        return r.apply( n.Apply0() )( e( n )( t ) )( i )
                    }
                }
            }
        }( n ),


        // --- Control.Bind Module ---
        function ( n ) {
            "use strict";

            n["Control.Bind"] = n["Control.Bind"] || {}; // Initialize namespace

            var t = n["Control.Bind"],
                r = n["Data.Function"],
                e = function ( n ) { return n.bind }, // Accessor for bind method
                i = function ( n ) { return r.flip( e( n ) ) }; // bindFlipped helper

            t.Bind = function ( n, t ) { this.Apply0 = n, this.bind = t }; // Bind constructor
            t.bind = e;                                                   // Export bind accessor
            t.bindFlipped = i;                                            // Export bindFlipped

            t.composeKleisliFlipped = function ( n ) { // Compose two Kleisli arrows, flipped
                return function ( t ) {
                    return function ( r ) {
                        return function ( e ) {
                            return i( n )( t )( r( e ) )
                        }
                    }
                }
            }
        }( n ),


        // --- Data.Maybe Module ---
        function ( n ) {
            "use strict";

            n["Data.Maybe"] = n["Data.Maybe"] || {}; // Initialize namespace

            var t = n["Data.Maybe"],
                r = function () { // Nothing constructor
                    function n () { }
                    return n.value = new n, n
                }(),
                e = function () { // Just constructor
                    function n ( n ) { this.value0 = n }
                    return n.create = function ( t ) { return new n( t ) }, n
                }();

            t.Nothing = r; // Export Nothing
            t.Just = e;   // Export Just

            t.maybe = function ( n ) { // Pattern match on Maybe
                return function ( t ) {
                    return function ( i ) {
                        if ( i instanceof r ) {
                            return n;
                        }
                        if ( i instanceof e ) {
                            return t( i.value0 );
                        }
                        throw new Error( "Failed pattern match at Data.Maybe (line 217, column 1 - line 217, column 51): " + [ n.constructor.name, t.constructor.name, i.constructor.name ] )
                    }
                }
            }
        }( n ),


        // --- Data.Either Module ---
        function ( n ) {
            "use strict";

            n["Data.Either"] = n["Data.Either"] || {}; // Initialize namespace

            var t = n["Data.Either"],
                r = n["Control.Applicative"],
                e = n["Control.Apply"],
                i = n["Control.Bind"],
                u = n["Data.Functor"],
                o = n["Data.Maybe"],
                a = function () { // Left constructor
                    function n ( n ) { this.value0 = n }
                    return n.create = function ( t ) { return new n( t ) }, n
                }(),
                f = function () { // Right constructor
                    function n ( n ) { this.value0 = n }
                    return n.create = function ( t ) { return new n( t ) }, n
                }(),
                c = new u.Functor( function ( n ) { // functorEither instance
                    return function ( t ) {
                        if ( t instanceof a ) {
                            return new a( t.value0 );
                        }
                        if ( t instanceof f ) {
                            return new f( n( t.value0 ) );
                        }
                        throw new Error( "Failed pattern match at Data.Either (line 38, column 8 - line 38, column 52): " + [ t.constructor.name ] )
                    }
                } ),
                l = function ( n ) { // either pattern matcher
                    return function ( t ) {
                        return function ( r ) {
                            if ( r instanceof a ) {
                                return n( r.value0 );
                            }
                            if ( r instanceof f ) {
                                return t( r.value0 );
                            }
                            throw new Error( "Failed pattern match at Data.Either (line 238, column 1 - line 238, column 64): " + [ n.constructor.name, t.constructor.name, r.constructor.name ] )
                        }
                    }
                },
                s = new e.Apply( function () { return c }, function ( n ) { // applyEither instance
                    return function ( t ) {
                        if ( n instanceof a ) {
                            return new a( n.value0 );
                        }
                        if ( n instanceof f ) {
                            return u.map( c )( n.value0 )( t );
                        }
                        throw new Error( "Failed pattern match at Data.Either (line 82, column 1 - line 82, column 41): " + [ n.constructor.name, t.constructor.name ] )
                    }
                } ),
                p = new i.Bind( function () { return s }, l( function ( n ) { // bindEither instance
                    return function ( t ) {
                        return new a( n )
                    }
                } )( function ( n ) {
                    return function ( t ) {
                        return t( n )
                    }
                } ) ),
                d = new r.Applicative( function () { return s }, f.create ); // applicativeEither instance

            t.Left = a;           // Export Left constructor
            t.Right = f;          // Export Right constructor
            t.either = l;         // Export either pattern matcher

            t.note = function ( n ) { // Convert Maybe to Either, providing a default Left value
                return o.maybe( new a( n ) )( f.create )
            };

            t.functorEither = c;      // Export functorEither instance
            t.applyEither = s;        // Export applyEither instance
            t.applicativeEither = d;  // Export applicativeEither instance
            t.bindEither = p          // Export bindEither instance
        }( n ),


        // --- Data.EuclideanRing Module (raw functions) ---
        function ( n ) {
            "use strict";

            n.intDegree = function ( n ) { // Integer degree (absolute value, capped)
                return Math.min( Math.abs( n ), 2147483647 )
            };

            n.intDiv = function ( n ) { // Integer division
                return function ( t ) {
                    return 0 === t
                        ? 0
                        : t > 0
                            ? Math.floor( n / t )
                            : -Math.floor( n / -t )
                }
            };

            n.intMod = function ( n ) { // Integer modulo
                return function ( t ) {
                    if ( 0 === t ) {
                        return 0;
                    }
                    var r = Math.abs( t );
                    return ( n % r + r ) % r
                }
            }
        }( n["Data.EuclideanRing"] = n["Data.EuclideanRing"] || {} ),


        // --- Data.Ring Module (intSub) ---
        function ( t ) {
            "use strict";
            ( n["Data.Ring"] = n["Data.Ring"] || {} ).intSub = function ( n ) { // Integer subtraction
                return function ( t ) {
                    return n - t | 0
                }
            }
        }(),


        // --- Data.Semiring Module (intAdd, intMul) ---
        function ( n ) {
            "use strict";

            n.intAdd = function ( n ) { // Integer addition
                return function ( t ) {
                    return n + t | 0
                }
            };

            n.intMul = function ( n ) { // Integer multiplication
                return function ( t ) {
                    return n * t | 0
                }
            }
        }( n["Data.Semiring"] = n["Data.Semiring"] || {} ),


        // --- Data.Semiring Module (type and instance) ---
        function ( n ) {
            "use strict";

            n["Data.Semiring"] = n["Data.Semiring"] || {}; // Initialize namespace

            var t = n["Data.Semiring"],
                r = n["Data.Semiring"],
                e = function ( n, t, r, e ) { // Semiring constructor
                    this.add = n;
                    this.mul = t;
                    this.one = r;
                    this.zero = e
                },
                i = new e( r.intAdd, r.intMul, 1, 0 ); // semiringInt instance

            t.Semiring = e;              // Export Semiring constructor
            t.add = function ( n ) { return n.add }; // Accessor for add
            t.zero = function ( n ) { return n.zero }; // Accessor for zero
            t.mul = function ( n ) { return n.mul }; // Accessor for mul
            t.one = function ( n ) { return n.one }; // Accessor for one
            t.semiringInt = i            // Export semiringInt instance
        }( n ),


        // --- Data.Ring Module (type and instance) ---
        function ( n ) {
            "use strict";

            n["Data.Ring"] = n["Data.Ring"] || {}; // Initialize namespace

            var t = n["Data.Ring"],
                r = n["Data.Ring"],
                e = n["Data.Semiring"],
                i = function ( n, t ) { this.Semiring0 = n, this.sub = t }, // Ring constructor
                u = new i( function () { return e.semiringInt }, r.intSub ); // ringInt instance

            t.Ring = i;                                // Export Ring constructor
            t.sub = function ( n ) { return n.sub };   // Accessor for sub
            t.ringInt = u                              // Export ringInt instance
        }( n ),


        // --- Data.CommutativeRing Module ---
        function ( n ) {
            "use strict";

            n["Data.CommutativeRing"] = n["Data.CommutativeRing"] || {}; // Initialize namespace

            var t = n["Data.CommutativeRing"],
                r = n["Data.Ring"],
                e = function ( n ) { this.Ring0 = n }, // CommutativeRing constructor
                i = new e( function () { return r.ringInt } ); // commutativeRingInt instance

            t.CommutativeRing = e;                     // Export CommutativeRing constructor
            t.commutativeRingInt = i                   // Export commutativeRingInt instance
        }( n ),


        // --- Data.EuclideanRing Module (type and instance) ---
        function ( n ) {
            "use strict";

            n["Data.EuclideanRing"] = n["Data.EuclideanRing"] || {}; // Initialize namespace

            var t = n["Data.EuclideanRing"],
                r = n["Data.EuclideanRing"],
                e = n["Data.CommutativeRing"],
                i = function ( n, t, r, e ) { // EuclideanRing constructor
                    this.CommutativeRing0 = n;
                    this.degree = t;
                    this.div = r;
                    this.mod = e
                },
                u = new i( function () { return e.commutativeRingInt }, r.intDegree, r.intDiv, r.intMod ); // euclideanRingInt instance

            t.EuclideanRing = i;                   // Export EuclideanRing constructor
            t.degree = function ( n ) { return n.degree }; // Accessor for degree
            t.div = function ( n ) { return n.div };     // Accessor for div
            t.mod = function ( n ) { return n.mod };     // Accessor for mod
            t.euclideanRingInt = u                 // Export euclideanRingInt instance
        }( n ),


        // --- Data.Int Module (fromStringAsImpl) ---
        function ( t ) {
            "use strict";
            ( n["Data.Int"] = n["Data.Int"] || {} ).fromStringAsImpl = function ( n ) { // Parse integer from string with custom base
                return function ( t ) {
                    return function ( r ) {
                        var e;
                        e = r < 11
                            ? "[0-" + ( r - 1 ).toString() + "]"
                            : 11 === r
                                ? "[0-9a]"
                                : "[0-9a-" + String.fromCharCode( 86 + r ) + "]"; // Regex character set based on base

                        var i = new RegExp( "^[\\+\\-]?" + e + "+$", "i" ); // Create regex for validation

                        return function ( e ) {
                            if ( i.test( e ) ) { // If string matches regex
                                var u = parseInt( e, r ); // Parse integer
                                return ( 0 | u ) === u
                                    ? n( u ) // If it's an integer, return success
                                    : t      // Otherwise, return failure
                            }
                            return t // If regex doesn't match, return failure
                        }
                    }
                }
            }
        }(),


        // --- Data.Int Module (fromString) ---
        function ( n ) {
            "use strict";

            n["Data.Int"] = n["Data.Int"] || {}; // Initialize namespace

            var t = n["Data.Int"],
                r = n["Data.Int"],
                e = n["Data.Maybe"],
                i = r.fromStringAsImpl( e.Just.create )( e.Nothing.value ), // fromStringAs with Maybe
                u = i( 10 );                                                // fromString (base 10)

            t.fromString = u;     // Export fromString
            t.fromStringAs = i    // Export fromStringAs
        }( n ),


        // --- Data.Monoid Module ---
        function ( n ) {
            "use strict";

            n["Data.Monoid"] = n["Data.Monoid"] || {}; // Initialize namespace

            var t = n["Data.Monoid"];

            t.Monoid = function ( n, t ) { this.Semigroup0 = n, this.mempty = t }; // Monoid constructor
            t.mempty = function ( n ) { return n.mempty }                        // Accessor for mempty
        }( n ),


        // --- Data.Show Module (showIntImpl) ---
        function ( t ) {
            "use strict";
            ( n["Data.Show"] = n["Data.Show"] || {} ).showIntImpl = function ( n ) { // Convert integer to string
                return n.toString()
            }
        }(),


        // --- Data.Show Module (type and instance) ---
        function ( n ) {
            "use strict";

            n["Data.Show"] = n["Data.Show"] || {}; // Initialize namespace

            var t = n["Data.Show"],
                r = function ( n ) { this.show = n }, // Show constructor
                e = new r( n["Data.Show"].showIntImpl ); // showInt instance

            t.Show = r;                            // Export Show constructor
            t.show = function ( n ) { return n.show }; // Accessor for show
            t.showInt = e                          // Export showInt instance
        }( n ),


        // --- Data.String.Common Module (split, trim) ---
        function ( n ) {
            "use strict";

            n.split = function ( n ) { // Split string by separator
                return function ( t ) {
                    return t.split( n )
                }
            };

            n.trim = function ( n ) { // Trim whitespace from string
                return n.trim()
            }
        }( n["Data.String.Common"] = n["Data.String.Common"] || {} ),


        // --- Data.String.Common Module (re-export) ---
        function ( n ) {
            "use strict";

            n["Data.String.Common"] = n["Data.String.Common"] || {}; // Initialize namespace

            var t = n["Data.String.Common"],
                r = n["Data.String.Common"];

            t.split = r.split; // Re-export split
            t.trim = r.trim    // Re-export trim
        }( n ),


        // --- Effect Module (pureE, bindE) ---
        function ( n ) {
            "use strict";

            n.pureE = function ( n ) { // Lift a value into the Effect monad
                return function () {
                    return n
                }
            };

            n.bindE = function ( n ) { // Bind an effectful computation
                return function ( t ) {
                    return function () {
                        return t( n() )()
                    }
                }
            }
        }( n.Effect = n.Effect || {} ),


        // --- Control.Monad Module ---
        function ( n ) {
            "use strict";

            n["Control.Monad"] = n["Control.Monad"] || {}; // Initialize namespace

            var t = n["Control.Monad"],
                r = n["Control.Applicative"],
                e = n["Control.Bind"];

            t.Monad = function ( n, t ) { this.Applicative0 = n, this.Bind1 = t }; // Monad constructor

            t.ap = function ( n ) { // Apply an effectful function to an effectful argument
                return function ( t ) {
                    return function ( i ) {
                        return e.bind( n.Bind1() )( t )( function ( t ) {
                            return e.bind( n.Bind1() )( i )( function ( e ) {
                                return r.pure( n.Applicative0() )( t( e ) )
                            } )
                        } )
                    }
                }
            }
        }( n ),


        // --- Effect Module (functorEffect, etc.) ---
        function ( n ) {
            "use strict";

            n.Effect = n.Effect || {}; // Initialize namespace

            var t = n.Effect,
                r = n.Effect,
                e = n["Control.Applicative"],
                i = n["Control.Apply"],
                u = n["Control.Bind"],
                o = n["Control.Monad"],
                a = n["Data.Functor"],
                f = new o.Monad( function () { return s }, function () { return c } ), // monadEffect instance
                c = new u.Bind( function () { return l }, r.bindE ),                     // bindEffect instance
                l = new i.Apply( function () { return p }, o.ap( f ) ),                  // applyEffect instance
                s = new e.Applicative( function () { return l }, r.pureE ),              // applicativeEffect instance
                p = new a.Functor( e.liftA1( s ) );                                       // functorEffect instance

            t.functorEffect = p;      // Export functorEffect
            t.applyEffect = l;        // Export applyEffect
            t.applicativeEffect = s;  // Export applicativeEffect
            t.bindEffect = c;         // Export bindEffect
            t.monadEffect = f         // Export monadEffect
        }( n ),


        // --- Effect.Aff Module (internal implementation) ---
        function ( n ) {
            "use strict";

            var t = function () {
                // Internal constants for Aff tags
                var n = {},
                    t = "Pure",
                    r = "Throw",
                    e = "Catch",
                    i = "Sync",
                    u = "Async",
                    o = "Bind",
                    a = "Bracket",
                    f = "Fork",
                    c = "Sequential",
                    l = "Map",
                    s = "Apply",
                    p = "Alt",
                    d = "Cons",
                    h = "Resume",
                    m = "Release",
                    w = "Finalizer",
                    v = "Finalized",
                    g = "Forked";

                // E is a generic constructor for Aff effects
                function E ( n, t, r, e ) {
                    this.tag = n;
                    this._1 = t;
                    this._2 = r;
                    this._3 = e
                }

                // C creates a tagged E instance for constructors
                function C ( n ) {
                    var t = function ( t, r, e ) { return new E( n, t, r, e ) };
                    return t.tag = n, t
                }

                // D creates a Pure effect with undefined value
                function D ( n ) { return new E( t, void 0 ) }

                // _ handles throwing errors asynchronously to prevent blocking
                function _ ( n ) {
                    try {
                        n()
                    } catch ( t ) {
                        setTimeout( function () { throw t }, 0 )
                    }
                }

                // A handles synchronous effects, catching and returning errors
                function A ( n, t, r ) {
                    try {
                        return t( r() )
                    } catch ( e ) {
                        return n( e )
                    }
                }

                // y handles asynchronous effects, providing a cancellation mechanism
                function y ( n, t, r ) {
                    try {
                        return t( r() )
                    } catch ( e ) {
                        return r( n( e ) )(), D
                    }
                }

                // S is the scheduler for managing continuations (trampoline)
                var S = function () {
                    var n = 1024, // Buffer size
                        t = 0,    // Current queue size
                        r = 0,    // Read pointer
                        e = new Array( n ), // Queue array
                        i = !1;   // Draining flag

                    function u () {
                        var u;
                        for ( i = !0; 0 !== t; ) {
                            t--,
                                u = e[r],
                                e[r] = void 0,
                                r = ( r + 1 ) % n,
                                u();
                        }
                        i = !1
                    }

                    return {
                        isDraining: function () { return i },
                        enqueue: function ( o ) {
                            var a;
                            t === n && ( a = i, u(), i = a ), // If queue full, drain it
                                e[( r + t ) % n] = o,       // Add to queue
                                t++,
                                i || u()                    // If not draining, start draining
                        }
                    }
                }();

                // State constants for the Fiber interpreter
                var b = 0, // SUSPENDED
                    F = 1, // RUNNING
                    P = 2, // JUMP
                    R = 3, // SYNC
                    k = 4, // ASYNC
                    M = 5, // FAILED
                    B = 6; // KILLED

                // I represents a Fiber, which is a running Aff computation
                function I ( n, l, s ) {
                    var p = 0,    // Call ID for async operations
                        g = b,    // Current state of the fiber
                        C = s,    // Current value or effect to be interpreted
                        D = null, // Error value (Left) if computation failed
                        N = null, // Kill error (Left) if computation was killed
                        L = null, // Current continuation function
                        T = null, // Continuation stack
                        x = null, // Finalizer stack
                        q = 0,    // Bracket depth (for resource management)
                        W = 0,    // onComplete handler ID counter
                        O = null, // onComplete handlers (map from ID to handler)
                        z = !0;   // Flag to determine if unhandled errors should be rethrown


                    // K is the main interpreter loop for the Fiber (trampoline)
                    function K ( s ) {
                        for ( var W, H, J; ;) { // Infinite loop for trampoline
                            W = null, H = null, J = null; // Reset temporary variables

                            switch ( g ) {
                                case P: // JUMP state: apply a continuation and transition to RUNNING
                                    g = F,
                                        C = L( C ),
                                        null === T
                                            ? L = null
                                            : ( L = T._1, T = T._2 );
                                    break;

                                case R: // SYNC state: handle result of a synchronous effect
                                    n.isLeft( C )
                                        ? ( g = M, D = C, C = null ) // If error, transition to FAILED
                                        : null === L
                                            ? g = M                  // If no more continuations, transition to FAILED (done)
                                            : ( g = P, C = n.fromRight( C ) ); // Otherwise, apply next continuation
                                    break;

                                case F: // RUNNING state: interpret the current effect
                                    switch ( C.tag ) {
                                        case o: // Bind: push current continuation, set new continuation, and continue
                                            L && ( T = new E( d, L, T ) ),
                                                L = C._2,
                                                g = F,
                                                C = C._1;
                                            break;

                                        case t: // Pure: if no more continuations, transition to FAILED (done), otherwise apply next
                                            null === L
                                                ? ( g = M, C = n.right( C._1 ) )
                                                : ( g = P, C = C._1 );
                                            break;

                                        case i: // Sync: execute synchronous effect and transition to SYNC state
                                            g = R,
                                                C = A( n.left, n.right, C._1 );
                                            break;

                                        case u: // Async: schedule asynchronous effect, transition to ASYNC state
                                            return g = k,
                                                void ( C = y( n.left, C._1, function ( n ) {
                                                    return function () {
                                                        p === s && ( p++, S.enqueue( function () {
                                                            p === s + 1 && ( g = R, C = n, K( p ) )
                                                        } ) )
                                                    }
                                                } ) );

                                        case r: // Throw: transition to FAILED state with an error
                                            g = M,
                                                D = n.left( C._1 ),
                                                C = null;
                                            break;

                                        case e: // Catch: push a Catch finalizer, clear continuations, and continue
                                            x = new E( d, C, null === L ? x : new E( h, L, T ), N ),
                                                L = null,
                                                T = null,
                                                g = F,
                                                C = C._1;
                                            break;

                                        case a: // Bracket: increment bracket depth, push Bracket finalizer, clear continuations, and continue
                                            q++,
                                                x = new E( d, C, null === L ? x : new E( h, L, T ), N ),
                                                L = null,
                                                T = null,
                                                g = F,
                                                C = C._1;
                                            break;

                                        case f: // Fork: create a new fiber, register it, run it if immediate, and continue
                                            g = R,
                                                W = I( n, l, C._2 ),
                                                l && l.register( W ),
                                                C._1 && W.run(),
                                                C = n.right( W );
                                            break;

                                        case c: // Sequential: interpret a ParAff as a sequential effect
                                            g = F,
                                                C = U( n, l, C._1 );
                                            break;
                                    }
                                    break;

                                case M: // FAILED state: unwind finalizers or terminate
                                    if ( L = null, T = null, null === x ) {
                                        g = B,                  // If no more finalizers, transition to KILLED
                                            C = N || D || C;    // Result is kill error, or failure error, or current value
                                    } else {
                                        switch ( W = x._3, J = x._1, x = x._2, J.tag ) {
                                            case e: // Catch finalizer: handle error if present and not killed
                                                N && N !== W && 0 === q
                                                    ? g = M
                                                    : D && ( g = F, C = J._2( n.fromLeft( D ) ), D = null );
                                                break;

                                            case h: // Resume continuation: if not killed or failed, resume from stack
                                                N && N !== W && 0 === q || D
                                                    ? g = M
                                                    : ( L = J._1, T = J._2, g = P, C = n.fromRight( C ) );
                                                break;

                                            case a: // Bracket finalizer: decrement depth, run release if not failed/killed
                                                q--,
                                                    null === D && ( H = n.fromRight( C ), x = new E( d, new E( m, J._2, H ), x, W ), ( N === W || q > 0 ) && ( g = F, C = J._3( H ) ) );
                                                break;

                                            case m: // Release finalizer: execute release action based on outcome
                                                x = new E( d, new E( v, C, D ), x, N ),
                                                    g = F,
                                                    C = N && N !== W && 0 === q
                                                        ? J._1.killed( n.fromLeft( N ) )( J._2 )
                                                        : D
                                                            ? J._1.failed( n.fromLeft( D ) )( J._2 )
                                                            : J._1.completed( n.fromRight( C ) )( J._2 ),
                                                    D = null,
                                                    q++;
                                                break;

                                            case w: // Generic Finalizer: execute finalizer effect
                                                q++,
                                                    x = new E( d, new E( v, C, D ), x, N ),
                                                    g = F,
                                                    C = J._1;
                                                break;

                                            case v: // Finalized: finished finalizer, restore previous state
                                                q--,
                                                    g = M,
                                                    C = J._1,
                                                    D = J._2;
                                                break;
                                        }
                                    }
                                    break;

                                case B: // KILLED state: cleanup and rethrow unhandled errors
                                    for ( var j in O ) {
                                        O.hasOwnProperty( j ) && ( z = z && O[j].rethrow, _( O[j].handler( C ) ) );
                                    }
                                    O = null;
                                    return void ( N && D
                                        ? setTimeout( function () { throw n.fromLeft( D ) }, 0 )
                                        : n.isLeft( C ) && z && setTimeout( function () { if ( z ) throw n.fromLeft( C ) }, 0 ) );

                                case b: // SUSPENDED state: transition to RUNNING
                                    g = F;
                                    break;

                                case k: // ASYNC state: waiting for callback, so exit loop
                                    return;
                            }
                        }
                    }

                    // H registers an onComplete handler for the fiber
                    function H ( n ) {
                        return function () {
                            if ( g === B ) {
                                return z = z && n.rethrow, n.handler( C )(), function () { };
                            }

                            var t = W++; // Generate unique ID for handler
                            return ( O = O || {} )[t] = n, function () { // Store handler
                                null !== O && delete O[t] // Return canceller for this handler
                            }
                        }
                    }

                    // Public API for the Fiber
                    return {
                        kill: function ( t, r ) { // Kill the fiber with an error
                            return function () {
                                if ( g === B ) {
                                    return r( n.right( void 0 ) )(), function () { };
                                }

                                var e = H( { rethrow: !1, handler: function () { return r( n.right( void 0 ) ) } } )();

                                switch ( g ) {
                                    case b: // If suspended, set kill error and run
                                        N = n.left( t ),
                                            g = B,
                                            C = N,
                                            K( p );
                                        break;

                                    case k: // If async, set kill error and transition to FAILED
                                        null === N && ( N = n.left( t ) ),
                                            0 === q && ( g === k && ( x = new E( d, new E( w, C( t ) ), x, N ) ), g = M, C = null, D = null, K( ++p ) );
                                        break;

                                    default: // For other states, set kill error and transition to FAILED
                                        null === N && ( N = n.left( t ) ),
                                            0 === q && ( g = M, C = null, D = null )
                                }
                                return e
                            }
                        },
                        join: function ( n ) { // Register a handler to be called when the fiber completes
                            return function () {
                                var t = H( { rethrow: !1, handler: n } )();
                                return g === b && K( p ), t
                            }
                        },
                        onComplete: H,           // Expose onComplete handler registration
                        isSuspended: function () { return g === b }, // Check if fiber is suspended
                        run: function () { // Start running the fiber
                            g === b && ( S.isDraining() ? K( p ) : S.enqueue( function () { K( p ) } ) )
                        }
                    }
                }

                // N handles parallel execution of ParAff computations
                function N ( t, r, e, i ) {
                    var o = 0,    // Fiber ID counter
                        a = {},   // Map of fiber IDs to running Fiber instances
                        f = 0,    // Callback ID counter
                        c = {},   // Map of callback IDs to cancellers
                        h = new Error( "[ParAff] Early exit" ), // Error for early termination
                        m = null, // Global error for the parallel block
                        w = n;    // Placeholder for unit value

                    // v kills all active fibers in a parallel block
                    function v ( r, e, i ) {
                        var u, o, f = e, c = null, h = null, m = 0, w = {};

                        n: for ( ; ;) {
                            switch ( u = null, f.tag ) {
                                case g: // Forked: kill the associated fiber
                                    if ( f._3 === n && ( u = a[f._1], w[m++] = u.kill( r, function ( n ) {
                                        return function () {
                                            0 === --m && i( n )()
                                        }
                                    } ) ), null === c ) {
                                        break n;
                                    }

                                    f = c._2,
                                        null === h
                                            ? c = null
                                            : ( c = h._1, h = h._2 );
                                    break;

                                case l: // Map: traverse down
                                    f = f._2;
                                    break;

                                case s: // Apply: traverse down
                                case p: // Alt: traverse down
                                    c && ( h = new E( d, c, h ) ),
                                        c = f,
                                        f = f._1;
                            }
                        }

                        if ( 0 === m ) {
                            i( t.right( void 0 ) )();
                        } else {
                            for ( o = 0, u = m; o < u; o++ ) {
                                w[o] = w[o]();
                            }
                        }

                        return w
                    }

                    // C handles completion of a parallel fiber
                    function C ( r ) {
                        return function ( e ) {
                            return function () {
                                delete a[r._1], // Remove fiber from active map
                                    r._3 = e,   // Store result in the ParAff tree node
                                    // Inner recursive function to propagate results up the ParAff tree
                                    function r ( e, u, o ) {
                                        var a, d, w, g, E, C;

                                        for ( t.isLeft( e )
                                            ? ( a = e, d = null ) // If error, set 'a' (error) and clear 'd' (success)
                                            : ( d = e, a = null ); ; ) { // If success, set 'd' and clear 'a'

                                            if ( w = null, g = null, E = null, C = null, null !== m ) {
                                                return; // If global error set, stop propagation
                                            }

                                            if ( null === u ) {
                                                return void i( a || d )(); // If no more nodes, call final callback
                                            }

                                            if ( u._3 !== n ) {
                                                return; // If node already processed, skip
                                            }

                                            switch ( u.tag ) {
                                                case l: // Map: apply function to success, or propagate error
                                                    null === a
                                                        ? ( u._3 = t.right( u._1( t.fromRight( d ) ) ), d = u._3 )
                                                        : u._3 = a;
                                                    break;

                                                case s: // Apply: wait for both sides to complete
                                                    if ( w = u._1._3, g = u._2._3, a ) { // If current result is an error
                                                        if ( u._3 = a, E = !0, C = f++, c[C] = v( h, a === w ? u._2 : u._1, function () {
                                                            return function () {
                                                                delete c[C], E ? E = !1 : null === o ? r( a, null, null ) : r( a, o._1, o._2 )
                                                            }
                                                        } ), E ) {
                                                            return void ( E = !1 )
                                                        }
                                                    } else { // If current result is a success
                                                        if ( w === n || g === n ) {
                                                            return; // If other side not complete, wait
                                                        }

                                                        d = t.right( t.fromRight( w )( t.fromRight( g ) ) ), // Apply function
                                                            u._3 = d
                                                    }
                                                    break;

                                                case p: // Alt: propagate first success or aggregate errors
                                                    if ( w = u._1._3, g = u._2._3, w === n && t.isLeft( g ) || g === n && t.isLeft( w ) ) {
                                                        return; // If one side failed and other not complete, wait
                                                    }

                                                    if ( w !== n && t.isLeft( w ) && g !== n && t.isLeft( g ) ) { // If both failed, propagate one error
                                                        a = d === w ? g : w, d = null, u._3 = a;
                                                    } else if ( u._3 = d, E = !0, C = f++, c[C] = v( h, d === w ? u._2 : u._1, function () {
                                                        return function () {
                                                            delete c[C], E ? E = !1 : null === o ? r( d, null, null ) : r( d, o._1, o._2 )
                                                        }
                                                    } ), E ) {
                                                        return void ( E = !1 )
                                                    }
                                                    break;
                                            }

                                            null === o
                                                ? u = null
                                                : ( u = o._1, o = o._2 ) // Move up the tree
                                        }
                                    }( e, r._2._1, r._2._2 )
                            }
                        }
                    }

                    // This immediately invoked function traverses the ParAff tree
                    // and forks a Fiber for each leaf (Forked node).
                    return function () {
                        var i, u, f = F, c = e, h = null, m = null;

                        n: for ( ; ;) {
                            switch ( i = null, u = null, f ) {
                                case F: // RUNNING state for tree traversal
                                    switch ( c.tag ) {
                                        case l: // Map: push current node to stack, move to child
                                            h && ( m = new E( d, h, m ) ),
                                                h = new E( l, c._1, n, n ),
                                                c = c._2;
                                            break;

                                        case s: // Apply: push current node to stack, move to left child
                                            h && ( m = new E( d, h, m ) ),
                                                h = new E( s, n, c._2, n ),
                                                c = c._1;
                                            break;

                                        case p: // Alt: push current node to stack, move to left child
                                            h && ( m = new E( d, h, m ) ),
                                                h = new E( p, n, c._2, n ),
                                                c = c._1;
                                            break;

                                        default: // Base case: Fork a new fiber for the current effect
                                            u = o++, // Assign a unique ID
                                                f = M,   // Transition to a 'finished processing node' state
                                                i = c,   // Store the actual effect to be forked
                                                c = new E( g, u, new E( d, h, m ), n ), // Create a Forked node
                                                ( i = I( t, r, i ) ).onComplete( { rethrow: !1, handler: C( c ) } )(), // Create and register onComplete handler
                                                a[u] = i, // Store the fiber
                                                r && r.register( i ) // Register with supervisor if present
                                    }
                                    break;

                                case M: // Move up the tree, attaching results
                                    if ( null === h ) {
                                        break n; // If stack is empty, tree traversal is complete
                                    }

                                    h._1 === n
                                        ? ( h._1 = c, f = F, c = h._2, h._2 = n ) // If left child processed, move to right
                                        : ( h._2 = c, c = h, null === m ? h = null : ( h = m._1, m = m._2 ) ) // If right child processed, pop from stack
                            }
                        }

                        for ( w = c, u = 0; u < o; u++ ) {
                            a[u].run() // Start all forked fibers
                        }
                    }(),

                    // Return the actual asynchronous effect that represents the parallel computation
                    function ( n ) {
                        return new E( u, function ( r ) {
                            return function () {
                                return function ( n, r ) {
                                    var e;
                                    for ( var i in m = t.left( n ), c ) { // Cancel all pending callbacks
                                        if ( c.hasOwnProperty( i ) ) {
                                            for ( i in e = c[i] ) {
                                                e.hasOwnProperty( i ) && e[i]();
                                            }
                                        }
                                    }
                                    c = null;

                                    var o = v( n, w, r ); // Kill all active fibers

                                    return function ( n ) {
                                        return new E( u, function () {
                                            for ( var n in o ) {
                                                o.hasOwnProperty( n ) && o[n]();
                                            }
                                            return D
                                        } )
                                    }
                                }( n, r )
                            }
                        } )
                    }
                }

                // U creates a sequential effect from a ParAff (by running it with N)
                function U ( n, t, r ) {
                    return new E( u, function ( e ) {
                        return function () {
                            return N( n, t, r, e )
                        }
                    } )
                }

                // Exported Aff constructors and utilities
                return E.EMPTY = n,            // Empty cancellation token
                    E.Pure = C( t ),           // Pure constructor
                    E.Throw = C( r ),          // Throw constructor
                    E.Catch = C( e ),          // Catch constructor
                    E.Sync = C( i ),           // Sync constructor
                    E.Async = C( u ),          // Async constructor
                    E.Bind = C( o ),           // Bind constructor
                    E.Bracket = C( a ),        // Bracket constructor
                    E.Fork = C( f ),           // Fork constructor
                    E.Seq = C( c ),            // Sequential constructor
                    E.ParMap = C( l ),         // Parallel Map constructor
                    E.ParApply = C( s ),       // Parallel Apply constructor
                    E.ParAlt = C( p ),         // Parallel Alt constructor
                    E.Fiber = I,               // Fiber constructor
                    E.Supervisor = function ( n ) { // Supervisor for managing multiple fibers
                        var t = {}, // Map of fiber IDs to fibers
                            r = 0,  // Next available fiber ID
                            e = 0;  // Count of active fibers

                        return {
                            register: function ( n ) { // Register a new fiber
                                var i = r++;
                                n.onComplete( {
                                    rethrow: !0, // Rethrow unhandled errors by default
                                    handler: function ( n ) {
                                        return function () {
                                            e--, delete t[i] // Decrement count and remove from map on completion
                                        }
                                    }
                                } ),
                                    t[i] = n, // Store fiber
                                    e++       // Increment count
                            },
                            isEmpty: function () { return 0 === e }, // Check if no active fibers
                            killAll: function ( u, o ) { // Kill all supervised fibers
                                return function () {
                                    if ( 0 === e ) {
                                        return o(); // If no fibers, just call callback
                                    }

                                    var a = 0, // Count of fibers being killed
                                        f = {}; // Map of fiber IDs to cancellers

                                    function c ( r ) {
                                        f[r] = t[r].kill( u, function ( t ) {
                                            return function () {
                                                delete f[r],
                                                    a--,
                                                    n.isLeft( t ) && n.fromLeft( t ) && setTimeout( function () { throw n.fromLeft( t ) }, 0 ), // Rethrow if error
                                                0 === a && o() // Call final callback when all killed
                                            }
                                        } )()
                                    }

                                    for ( var l in t ) {
                                        t.hasOwnProperty( l ) && ( a++, c( l ) ); // Kill each fiber
                                    }

                                    return t = {}, r = 0, e = 0, function ( n ) { // Reset supervisor state
                                        return new E( i, function () {
                                            for ( var n in f ) {
                                                f.hasOwnProperty( n ) && f[n]()
                                            }
                                        } )
                                    }
                                }
                            }
                        }
                    },
                    E.Scheduler = S,           // Export the scheduler
                    E.nonCanceler = D,         // Export the non-canceler
                    E
            }();

            // Assign internal Aff functions to the module exports
            n._pure = t.Pure; // Internal pure function

            n._map = function ( n ) { // Internal map function
                return function ( r ) {
                    return r.tag === t.Pure.tag
                        ? t.Pure( n( r._1 ) ) // If Pure, apply function directly
                        : t.Bind( r, function ( r ) { return t.Pure( n( r ) ) } ) // Otherwise, bind and then pure
                }
            };

            n._bind = function ( n ) { // Internal bind function
                return function ( r ) {
                    return t.Bind( n, r )
                }
            };

            n._liftEffect = t.Sync; // Lift an Effect into Aff

            n._parAffMap = function ( n ) { // Internal parallel map function
                return function ( r ) {
                    return t.ParMap( n, r )
                }
            };

            n._parAffApply = function ( n ) { // Internal parallel apply function
                return function ( r ) {
                    return t.ParApply( n, r )
                }
            };

            n.makeAff = t.Async; // Export makeAff (Async constructor)

            n._makeFiber = function ( n, r ) { // Internal function to create a Fiber
                return function () {
                    return t.Fiber( n, null, r )
                }
            };

            n._sequential = t.Seq // Internal sequential function (for ParAff)
        }( n["Effect.Aff"] = n["Effect.Aff"] || {} ),


        // --- Control.Parallel.Class Module ---
        function ( n ) {
            "use strict";

            n["Control.Parallel.Class"] = n["Control.Parallel.Class"] || {}; // Initialize namespace

            var t = n["Control.Parallel.Class"];

            t.parallel = function ( n ) { return n.parallel };     // Accessor for parallel
            t.sequential = function ( n ) { return n.sequential }; // Accessor for sequential

            t.Parallel = function ( n, t, r, e ) { // Parallel constructor
                this.Applicative1 = n;
                this.Monad0 = t;
                this.parallel = r;
                this.sequential = e
            }
        }( n ),


        // --- Data.Foldable Module (foldrArray, foldlArray) ---
        function ( n ) {
            "use strict";

            n.foldrArray = function ( n ) { // Fold array from right
                return function ( t ) {
                    return function ( r ) {
                        for ( var e = t, i = r.length - 1; i >= 0; i-- ) {
                            e = n( r[i] )( e );
                        }
                        return e
                    }
                }
            };

            n.foldlArray = function ( n ) { // Fold array from left
                return function ( t ) {
                    return function ( r ) {
                        for ( var e = t, i = r.length, u = 0; u < i; u++ ) {
                            e = n( e )( r[u] );
                        }
                        return e
                    }
                }
            }
        }( n["Data.Foldable"] = n["Data.Foldable"] || {} ),


        // --- Data.Semigroup Module ---
        function ( n ) {
            "use strict";

            n["Data.Semigroup"] = n["Data.Semigroup"] || {}; // Initialize namespace

            var t = n["Data.Semigroup"];

            t.Semigroup = function ( n ) { this.append = n }; // Semigroup constructor
            t.append = function ( n ) { return n.append }      // Accessor for append
        }( n ),


        // --- Data.Foldable Module (type and instance) ---
        function ( n ) {
            "use strict";

            n["Data.Foldable"] = n["Data.Foldable"] || {}; // Initialize namespace

            var t = n["Data.Foldable"],
                r = n["Data.Foldable"],
                e = n["Control.Applicative"],
                i = n["Control.Apply"],
                u = n["Data.Monoid"],
                o = n["Data.Semigroup"],
                a = n["Data.Unit"],
                f = function ( n, t, r ) { // Foldable constructor
                    this.foldMap = n;
                    this.foldl = t;
                    this.foldr = r
                },
                c = function ( n ) { return n.foldr }, // Accessor for foldr
                l = function ( n ) { // Default foldMap implementation
                    return function ( t ) {
                        return function ( r ) {
                            return c( n )( function ( n ) {
                                return function ( e ) {
                                    return o.append( t.Semigroup0() )( r( n ) )( e )
                                }
                            } )( u.mempty( t ) )
                        }
                    }
                },
                s = new f( function ( n ) { return l( s )( n ) }, r.foldlArray, r.foldrArray ); // foldableArray instance

            t.Foldable = f;             // Export Foldable constructor
            t.foldr = c;                // Export foldr accessor

            t.foldl = function ( n ) { return n.foldl };     // Export foldl accessor
            t.foldMap = function ( n ) { return n.foldMap }; // Export foldMap accessor
            t.foldMapDefaultR = l;                           // Export default foldMap

            t.traverse_ = function ( n ) { // Traverse a foldable, discarding results
                return function ( t ) {
                    return function ( r ) {
                        return c( t )( function ( t ) {
                            return i.applySecond( n.Apply0() )( r( t ) )
                        } )( e.pure( n )( a.unit ) )
                    }
                }
            };

            t.foldableArray = s       // Export foldableArray instance
        }( n ),


        // --- Control.Parallel Module ---
        function ( n ) {
            "use strict";

            n["Control.Parallel"] = n["Control.Parallel"] || {}; // Initialize namespace

            var t = n["Control.Parallel"],
                r = n["Control.Category"],
                e = n["Control.Parallel.Class"],
                i = n["Data.Foldable"],
                u = function ( n ) { // Parallel traverse, discarding results
                    return function ( t ) {
                        return function ( r ) {
                            return function ( u ) {
                                return e.sequential( n )( i.traverse_( n.Applicative1() )( t )( function ( t ) {
                                    return e.parallel( n )( r( t ) )
                                } )( u ) )
                            }
                        }
                    }
                };

            t.parTraverse_ = u; // Export parTraverse_

            t.parSequence_ = function ( n ) { // Parallel sequence, discarding results
                return function ( t ) {
                    return u( n )( t )( r.identity( r.categoryFn ) )
                }
            }
        }( n ),


        // --- Effect.Class Module ---
        function ( n ) {
            "use strict";

            n["Effect.Class"] = n["Effect.Class"] || {}; // Initialize namespace

            var t = n["Effect.Class"];

            t.liftEffect = function ( n ) { return n.liftEffect }; // Accessor for liftEffect
            t.MonadEffect = function ( n, t ) { this.Monad0 = n, this.liftEffect = t }; // MonadEffect constructor
        }( n ),


        // --- Partial.Unsafe Module (unsafePartial) ---
        function ( t ) {
            "use strict";
            ( n["Partial.Unsafe"] = n["Partial.Unsafe"] || {} ).unsafePartial = function ( n ) { // Unsafely run a partial function
                return n()
            }
        }(),


        // --- Partial Module (crashWith) ---
        function ( t ) {
            "use strict";
            ( n["Partial"] = n["Partial"] || {} ).crashWith = function () { // Function to crash with a message
                return function ( n ) {
                    throw new Error( n )
                }
            }
        }(),


        // --- Partial Module (re-export) ---
        function ( n ) {
            "use strict";

            n.Partial = n.Partial || {}; // Initialize namespace

            var t = n.Partial,
                r = n.Partial;

            t.crashWith = r.crashWith // Re-export crashWith
        }( n ),


        // --- Partial.Unsafe Module (unsafeCrashWith) ---
        function ( n ) {
            "use strict";

            n["Partial.Unsafe"] = n["Partial.Unsafe"] || {}; // Initialize namespace

            var t = n["Partial.Unsafe"],
                r = n["Partial.Unsafe"],
                e = n.Partial;

            t.unsafeCrashWith = function ( n ) { // Unsafely crash with a message
                return r.unsafePartial( function ( t ) {
                    return e.crashWith( t )( n )
                } )
            }
        }( n ),


        // --- Unsafe.Coerce Module (unsafeCoerce) ---
        function ( t ) {
            "use strict";
            ( n["Unsafe.Coerce"] = n["Unsafe.Coerce"] || {} ).unsafeCoerce = function ( n ) { // Unsafely coerce type
                return n
            }
        }(),


        // --- Unsafe.Coerce Module (re-export) ---
        function ( n ) {
            "use strict";

            n["Unsafe.Coerce"] = n["Unsafe.Coerce"] || {}; // Initialize namespace

            var t = n["Unsafe.Coerce"],
                r = n["Unsafe.Coerce"];

            t.unsafeCoerce = r.unsafeCoerce // Re-export unsafeCoerce
        }( n ),


        // --- Effect.Aff Module (main part) ---
        function ( n ) {
            "use strict";

            n["Effect.Aff"] = n["Effect.Aff"] || {}; // Initialize namespace

            var t = n["Effect.Aff"],
                r = n["Effect.Aff"],
                e = n["Control.Applicative"],
                i = n["Control.Apply"],
                u = n["Control.Bind"],
                o = n["Control.Monad"],
                a = n["Control.Parallel"],
                f = n["Control.Parallel.Class"],
                c = n["Data.Either"],
                l = n["Data.Foldable"],
                s = n["Data.Function"],
                p = n["Data.Functor"],
                d = n["Data.Monoid"],
                h = n["Data.Semigroup"],
                m = n["Data.Unit"],
                w = n.Effect,
                v = n["Effect.Class"],
                g = n["Partial.Unsafe"],
                E = n["Unsafe.Coerce"],
                C = new p.Functor( r._parAffMap ), // functorParAff instance
                D = new p.Functor( r._map ),       // functorAff instance
                _ = { // Either helpers for Aff
                    isLeft: function ( n ) {
                        if ( n instanceof c.Left ) {
                            return !0;
                        }
                        if ( n instanceof c.Right ) {
                            return !1;
                        }
                        throw new Error( "Failed pattern match at Effect.Aff (line 390, column 12 - line 392, column 20): " + [ n.constructor.name ] )
                    },
                    fromLeft: function ( n ) {
                        if ( n instanceof c.Left ) {
                            return n.value0;
                        }
                        if ( n instanceof c.Right ) {
                            return g.unsafeCrashWith( "unsafeFromLeft: Right" );
                        }
                        throw new Error( "Failed pattern match at Effect.Aff (line 395, column 20 - line 399, column 3): " + [ n.constructor.name ] )
                    },
                    fromRight: function ( n ) {
                        if ( n instanceof c.Right ) {
                            return n.value0;
                        }
                        if ( n instanceof c.Left ) {
                            return g.unsafeCrashWith( "unsafeFromRight: Left" );
                        }
                        throw new Error( "Failed pattern match at Effect.Aff (line 400, column 21 - line 402, column 31): " + [ n.constructor.name ] )
                    },
                    left: c.Left.create,
                    right: c.Right.create
                },
                A = function ( n ) { // launchAff function
                    return function () {
                        var t = function ( n ) { return r._makeFiber( _, n ) }( n )();
                        return t.run(), t
                    }
                },
                y = new i.Apply( function () { return C }, r._parAffApply ),       // applyParAff instance
                S = new o.Monad( function () { return P }, function () { return b } ), // monadAff instance
                b = new u.Bind( function () { return F }, r._bind ),                  // bindAff instance
                F = new i.Apply( function () { return D }, o.ap( S ) ),               // applyAff instance
                P = new e.Applicative( function () { return F }, r._pure ),           // applicativeAff instance
                R = new v.MonadEffect( function () { return S }, r._liftEffect ),     // monadEffectAff instance
                k = new f.Parallel( function () { return M }, function () { return S }, E.unsafeCoerce, r._sequential ), // parallelAff instance
                M = new e.Applicative( function () { return y }, function ( n ) { return f.parallel( k )( e.pure( P )( n ) ) } ), // applicativeParAff instance
                B = new h.Semigroup( function ( n ) { // semigroupCanceler instance
                    return function ( t ) {
                        return function ( r ) {
                            return a.parSequence_( k )( l.foldableArray )( [ n( r ), t( r ) ] )
                        }
                    }
                } ),
                I = s.const( e.pure( P )( m.unit ) ), // nonCanceler constant
                N = new d.Monoid( function () { return B }, I ); // monoidCanceler instance

            t.launchAff = A; // Export launchAff

            t.launchAff_ = function ( n ) { // Launch Aff, discarding result
                return p.void( w.functorEffect )( A( n ) )
            };

            t.nonCanceler = I;          // Export nonCanceler
            t.functorAff = D;           // Export functorAff
            t.applyAff = F;             // Export applyAff
            t.applicativeAff = P;       // Export applicativeAff
            t.bindAff = b;              // Export bindAff
            t.monadAff = S;             // Export monadAff
            t.monadEffectAff = R;       // Export monadEffectAff
            t.functorParAff = C;        // Export functorParAff
            t.applyParAff = y;          // Export applyParAff
            t.applicativeParAff = M;    // Export applicativeParAff
            t.parallelAff = k;          // Export parallelAff
            t.semigroupCanceler = B;    // Export semigroupCanceler
            t.monoidCanceler = N;       // Export monoidCanceler
            t.makeAff = r.makeAff       // Export makeAff
        }( n ),


        // --- Effect.Ref Module (new, read, write) ---
        function ( n ) {
            "use strict";

            n.new = function ( n ) { // Create a new mutable reference
                return function () {
                    return { value: n }
                }
            };

            n.read = function ( n ) { // Read value from reference
                return function () {
                    return n.value
                }
            };

            n.write = function ( n ) { // Write value to reference
                return function ( t ) {
                    return function () {
                        return t.value = n, {}
                    }
                }
            }
        }( n["Effect.Ref"] = n["Effect.Ref"] || {} ),


        // --- Effect.Ref Module (re-export) ---
        function ( n ) {
            "use strict";

            n["Effect.Ref"] = n["Effect.Ref"] || {}; // Initialize namespace

            var t = n["Effect.Ref"],
                r = n["Effect.Ref"];

            t.new = r.new;       // Re-export new
            t.read = r.read;     // Re-export read
            t.write = r.write    // Re-export write
        }( n ),


        // --- Node.Encoding Module ---
        function ( n ) {
            "use strict";

            n["Node.Encoding"] = n["Node.Encoding"] || {}; // Initialize namespace

            var t = n["Node.Encoding"],
                r = n["Data.Show"],
                e = function () { function n () { } return n.value = new n, n }(), // ASCII constructor
                i = function () { function n () { } return n.value = new n, n }(), // UTF8 constructor
                u = function () { function n () { } return n.value = new n, n }(), // UTF16LE constructor
                o = function () { function n () { } return n.value = new n, n }(), // UCS2 constructor
                a = function () { function n () { } return n.value = new n, n }(), // Base64 constructor
                f = function () { function n () { } return n.value = new n, n }(), // Latin1 constructor
                c = function () { function n () { } return n.value = new n, n }(), // Binary constructor
                l = function () { function n () { } return n.value = new n, n }(), // Hex constructor
                s = new r.Show( function ( n ) { // showEncoding instance
                    if ( n instanceof e ) { return "ASCII"; }
                    if ( n instanceof i ) { return "UTF8"; }
                    if ( n instanceof u ) { return "UTF16LE"; }
                    if ( n instanceof o ) { return "UCS2"; }
                    if ( n instanceof a ) { return "Base64"; }
                    if ( n instanceof f ) { return "Latin1"; }
                    if ( n instanceof c ) { return "Binary"; }
                    if ( n instanceof l ) { return "Hex"; }
                    throw new Error( "Failed pattern match at Node.Encoding (line 19, column 1 - line 19, column 39): " + [ n.constructor.name ] )
                } );

            t.ASCII = e;   // Export ASCII
            t.UTF8 = i;    // Export UTF8
            t.UTF16LE = u; // Export UTF16LE
            t.UCS2 = o;    // Export UCS2
            t.Base64 = a;  // Export Base64
            t.Latin1 = f;  // Export Latin1
            t.Binary = c;  // Export Binary
            t.Hex = l;     // Export Hex

            t.encodingToNode = function ( n ) { // Convert internal encoding to Node.js string
                if ( n instanceof e ) { return "ascii"; }
                if ( n instanceof i ) { return "utf8"; }
                if ( n instanceof u ) { return "utf16le"; }
                if ( n instanceof o ) { return "ucs2"; }
                if ( n instanceof a ) { return "base64"; }
                if ( n instanceof f ) { return "latin1"; }
                if ( n instanceof c ) { return "binary"; }
                if ( n instanceof l ) { return "hex"; }
                throw new Error( "Failed pattern match at Node.Encoding (line 31, column 1 - line 31, column 37): " + [ n.constructor.name ] )
            };

            t.showEncoding = s // Export showEncoding
        }( n ),


        // --- Node.Process Module (process global) ---
        function ( t ) {
            "use strict";
            ( n["Node.Process"] = n["Node.Process"] || {} ).process = process // Export Node.js global process object
        }(),


        // --- Node.Process Module (stdin, stdout) ---
        function ( n ) {
            "use strict";

            n["Node.Process"] = n["Node.Process"] || {}; // Initialize namespace

            var t = n["Node.Process"],
                r = n["Node.Process"],
                e = r.process.stdout, // Get stdout from global process
                i = r.process.stdin;  // Get stdin from global process

            t.stdin = i;  // Export stdin
            t.stdout = e  // Export stdout
        }( n ),


        // --- Node.Stream Module (raw functions) ---
        function ( n ) {
            "use strict";

            n.readChunkImpl = function ( n ) { // Helper for reading stream chunks
                return function ( t ) {
                    return function ( r ) {
                        if ( r instanceof Buffer ) {
                            return t( r );
                        }
                        if ( "string" == typeof r ) {
                            return n( r );
                        }
                        throw new Error( "Node.Stream.readChunkImpl: Unrecognised chunk type; expected String or Buffer, got: " + r )
                    }
                }
            };

            n.onDataEitherImpl = function ( n ) { // Helper for 'data' event with Either
                return function ( t ) {
                    return function ( r ) {
                        return function () {
                            t.on( "data", function ( t ) { r( n( t ) )() } )
                        }
                    }
                }
            };

            n.onEnd = function ( n ) { // Helper for 'end' event
                return function ( t ) {
                    return function () {
                        n.on( "end", t )
                    }
                }
            };

            n.write = function ( n ) { // Write raw data to stream
                return function ( t ) {
                    return function ( r ) {
                        return function () {
                            return n.write( t, null, r )
                        }
                    }
                }
            };

            n.writeStringImpl = function ( n ) { // Write string with encoding to stream
                return function ( t ) {
                    return function ( r ) {
                        return function ( e ) {
                            return function () {
                                return n.write( r, t, e )
                            }
                        }
                    }
                }
            }
        }( n["Node.Stream"] = n["Node.Stream"] || {} ),


        // --- Effect.Exception Module (error, throwException) ---
        function ( n ) {
            "use strict";

            n.error = function ( n ) { return new Error( n ) }; // Create a new Error object
            n.throwException = function ( n ) {                 // Throw an exception
                return function () {
                    throw n
                }
            }
        }( n["Effect.Exception"] = n["Effect.Exception"] || {} ),


        // --- Effect.Exception Module (throw) ---
        function ( n ) {
            "use strict";

            n["Effect.Exception"] = n["Effect.Exception"] || {}; // Initialize namespace

            var t = n["Effect.Exception"],
                r = n["Effect.Exception"];

            t.throw = function ( n ) { // Throw an exception with a string message
                return r.throwException( r.error( n ) )
            }
        }( n ),


        // --- Node.Buffer Module (toStringImpl) ---
        function ( t ) {
            "use strict";
            ( n["Node.Buffer"] = n["Node.Buffer"] || {} ).toStringImpl = function ( n ) { // Convert Buffer to string with encoding
                return function ( t ) {
                    return function () {
                        return t.toString( n )
                    }
                }
            }
        }(),


        // --- Node.Buffer Module (toString) ---
        function ( n ) {
            "use strict";

            n["Node.Buffer"] = n["Node.Buffer"] || {}; // Initialize namespace

            var t = n["Node.Buffer"],
                r = n["Node.Buffer"],
                e = n["Node.Encoding"];

            t.toString = function ( n ) { // Convert Buffer to string using Node.Encoding
                return r.toStringImpl( e.encodingToNode( n ) )
            }
        }( n ),


        // --- Node.Stream Module (onData, onDataString, etc.) ---
        function ( n ) {
            "use strict";

            n["Node.Stream"] = n["Node.Stream"] || {}; // Initialize namespace

            var t = n["Node.Stream"],
                r = n["Node.Stream"],
                e = n["Control.Applicative"],
                i = n["Control.Bind"],
                u = n["Data.Either"],
                o = n["Data.Show"],
                a = n.Effect,
                f = n["Effect.Exception"],
                c = n["Node.Buffer"],
                l = n["Node.Encoding"],
                s = r.readChunkImpl( u.Left.create )( u.Right.create ), // Read chunk into an Either
                p = function ( n ) { // onDataEither helper
                    return function ( t ) {
                        return r.onDataEitherImpl( s )( n )( t )
                    }
                },
                d = function ( n ) { // onData helper (throws on Left)
                    return function ( t ) {
                        return p( n )( i.composeKleisliFlipped( a.bindEffect )( t )( function ( n ) {
                            if ( n instanceof u.Left ) {
                                return f.throw( "Stream encoding should not be set" );
                            }
                            if ( n instanceof u.Right ) {
                                return e.pure( a.applicativeEffect )( n.value0 );
                            }
                            throw new Error( "Failed pattern match at Node.Stream (line 94, column 5 - line 98, column 17): " + [ n.constructor.name ] )
                        } ) )
                    }
                };

            t.onData = d; // Export onData

            t.onDataString = function ( n ) { // onData for string data
                return function ( t ) {
                    return function ( r ) {
                        return d( n )( i.composeKleisliFlipped( a.bindEffect )( r )( c.toString( t ) ) )
                    }
                }
            };

            t.onDataEither = p; // Export onDataEither

            t.writeString = function ( n ) { // Write string with encoding
                return function ( t ) {
                    return r.writeStringImpl( n )( o.show( l.showEncoding )( t ) )
                }
            };

            t.onEnd = r.onEnd // Export onEnd
        }( n ),


        // --- ABC089A Module (main application logic) ---
        function ( n ) {
            "use strict";

            n["ABC089A"] = n["ABC089A"] || {}; // Initialize application namespace

            var t = n["ABC089A"],
                r = n["Control.Applicative"],
                e = n["Control.Bind"],
                i = n["Control.Category"],
                u = n["Data.Either"],
                o = n["Data.EuclideanRing"],
                a = n["Data.Functor"],
                f = n["Data.Int"],
                c = n["Data.Monoid"],
                l = n["Data.Show"],
                s = n["Data.String.Common"],
                p = n["Data.Unit"],
                d = n.Effect,
                h = n["Effect.Aff"],
                m = n["Effect.Class"],
                w = n["Effect.Ref"],
                v = n["Node.Encoding"],
                g = n["Node.Process"],
                E = n["Node.Stream"],
                C = n["Partial.Unsafe"],

                // D is the 'solve' function for the problem
                D = function ( n ) {
                    return u.either( function ( n ) {
                        return C.unsafeCrashWith( n ) // Crash if parsing fails
                    } )( i.identity( i.categoryFn ) )( e.bind( u.bindEither )( u.note( "n" )( f.fromString( s.trim( n ) ) ) )( function ( n ) {
                        return r.pure( u.applicativeEither )( l.show( l.showInt )( o.div( o.euclideanRingInt )( n )( 3 ) ) + "\n" ) // Calculate n/3 and format output
                    } ) )
                },

                // _ is an Aff computation to read all input from stdin
                _ = h.makeAff( function ( n ) {
                    return function () {
                        var t = w.new( "" )(); // Create a mutable reference to store input

                        return E.onDataString( g.stdin )( v.UTF8.value )( function ( n ) {
                            return function () {
                                var r = w.read( t )(); // Read current content
                                return w.write( r + n )( t )() // Append new data and write back
                            }
                        } )(),

                            E.onEnd( g.stdin )( function () {
                                var e = w.read( t )(); // Read final content
                                return n( r.pure( u.applicativeEither )( e ) )() // Resolve Aff with the full input
                            } )(),

                            c.mempty( h.monoidCanceler ) // Return a non-canceler
                    }
                } ),

                // A is the main Aff computation to run the program
                A = h.launchAff_( e.bind( h.bindAff )( _ )( function ( n ) { // Bind the input reading computation
                    return e.bind( h.bindAff )( r.pure( h.applicativeAff )( D( n ) ) )( function ( n ) { // Bind the solving computation
                        return m.liftEffect( h.monadEffectAff )( ( t = n, a.void( d.functorEffect )( E.writeString( g.stdout )( v.UTF8.value )( t )( r.pure( d.applicativeEffect )( p.unit ) ) ) ) ); // Lift write to stdout into Aff
                        var t // This 't' is a variable shadowing 't' from outer scope, but it's okay as it's immediately used and discarded.
                    } )
                } ) );

            t.main = A;   // Export the main computation
            t.solve = D   // Export the solve function
        }( n ),

        // Final call to execute the main function of ABC089A module
        n.ABC089A.main();

}, { } ], { }, [ "Focm" ], null );