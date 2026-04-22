parcelRequire=function( e, r, t, n ) { /* This is the main Parcel module loader function */

    // Declare some internal variables for scope and module resolution.
    var i,
        o = "function" == typeof parcelRequire && parcelRequire, // Capture any existing `parcelRequire`
        u = "function" == typeof require && require; // Capture Node.js `require` if available


    // The core module loading function `f`
    function f( t, n ) {

        // If the module is not already in the cache...
        if ( !r[t] ) {

            // And if the module definition doesn't exist in the provided `e` object...
            if ( !e[t] ) {

                /* Attempt to load the module from a parent Parcel scope. */
                var i = "function" == typeof parcelRequire && parcelRequire;

                if ( !n && i ) return i( t, !0 ); // If not a top-level call and parent exists, use it.
                if ( o ) return o( t, !0 ); // Fallback to the original `parcelRequire`.
                if ( u && "string" == typeof t ) return u( t ); // Fallback to Node.js `require` for string paths.

                // If all else fails, throw an error indicating the module could not be found.
                var c = new Error( "Cannot find module '" + t + "'" );
                throw c.code = "MODULE_NOT_FOUND", c;

            }

            // Define a `resolve` method for the local `p` (require-like) function.
            p.resolve = function( r ) { return e[t][1][r] || r };

            // Initialize a cache for the module's own dependencies.
            p.cache = {};

            // Create a new module instance and store it in `r` (the cache).
            var l = r[t] = new f.Module( t );

            // Execute the module's code, passing in `p` (local require), `l` (module object),
            // `l.exports` (exports object), and `this` (global context).
            e[t][0].call( l.exports, p, l, l.exports, this );

        }

        // Return the module's exports from the cache.
        return r[t].exports;


        // This is a local `require`-like function for modules loaded by `f`.
        function p( e ) { return f( p.resolve( e ) ) }

    }

    // Mark this `f` function as a ParcelRequire instance.
    f.isParcelRequire = !0;

    // Define the `Module` constructor used internally.
    f.Module = function( e ) {
        this.id = e;
        this.bundle = f;
        this.exports = {};
    };

    // Attach module definitions, cache, parent reference, and a registration method.
    f.modules = e;
    f.cache = r;
    f.parent = o;
    f.register = function( r, t ) { e[r] = [function( e, r ) { r.exports = t }, {}] };


    // Loop through the entry points (`t`) and attempt to load each one.
    for ( var c = 0; c < t.length; c++ )
        try {
            f( t[c] )
        } catch ( e ) {
            // If an error occurs during loading, store it but continue.
            i || ( i = e )
        }


    // If there were entry points, handle exporting the last one.
    if ( t.length ) {
        var l = f( t[t.length - 1] ); // Get the exports of the last entry point.

        // Standard CommonJS/Node.js export.
        "object" == typeof exports && "undefined" != typeof module ?
            module.exports = l :
            // AMD (RequireJS) export.
            "function" == typeof define && define.amd ?
            define( function() { return l } ) :
            // Global (browser) export.
            n && ( this[n] = l )
    }

    // Set `parcelRequire` globally to this loader instance.
    // If any error was stored during loading, rethrow it.
    if ( parcelRequire = f, i ) throw i;

    // Finally, return the module loader function itself.
    return f

}({ /* Module definitions start here */

    "Focm": [function( require, module, exports ) { /* Module 'Focm' entry point. This appears to be the primary application code. */

        var n = {}; // Main namespace object for generated modules.

        /* --- Control.Apply module --- */
        ! function( t ) {
            "use strict";
            // Initialize or retrieve 'Control.Apply' namespace and define `arrayApply`.
            ( n["Control.Apply"] = n["Control.Apply"] || {} ).arrayApply = function( n ) {
                return function( t ) {
                    // Efficiently applies a list of functions (`n`) to a list of arguments (`t`).
                    for ( var r = n.length,
                            e = t.length,
                            a = new Array( r * e ), // Pre-allocate result array.
                            o = 0,
                            i = 0; i < r; i++ )
                        for ( var u = n[i],
                                c = 0; c < e; c++ )
                            a[o++] = u( t[c] ); // Apply each function to each argument.
                    return a
                }
            }
        }(); // IIFE for Control.Apply.

        /* --- Control.Semigroupoid module --- */
        ! function( n ) {
            "use strict";
            var t = function( n ) {
                    this.compose = n
                }, // Semigroupoid constructor: holds a composition function.
                r = new t( function( n ) {
                    return function( t ) {
                        return function( r ) {
                            return n( t( r ) )
                        }
                    }
                } ); // `semigroupoidFn`: instance for function composition.
            n.compose = function( n ) { return n.compose }; // Export `compose` accessor.
            n.Semigroupoid = t; // Export the `Semigroupoid` type.
            n.semigroupoidFn = r // Export the function composition instance.
        }( n["Control.Semigroupoid"] = n["Control.Semigroupoid"] || {} ); // IIFE for Control.Semigroupoid.

        /* --- Control.Category module --- */
        ! function( t ) {
            "use strict";
            var r = n["Control.Semigroupoid"], // Import `Control.Semigroupoid`.
                e = function( n, t ) {
                    this.Semigroupoid0 = n, // Reference to a Semigroupoid instance.
                        this.identity = t // Identity function for the category.
                }, // Category constructor.
                a = new e( function() { return r.semigroupoidFn }, function( n ) { return n } ); // `categoryFn`: instance for functions.
            t.Category = e; // Export the `Category` type.
            t.identity = function( n ) { return n.identity }; // Export `identity` accessor.
            t.categoryFn = a // Export the function category instance.
        }( n["Control.Category"] = n["Control.Category"] || {} ); // IIFE for Control.Category.

        /* --- Data.Eq module (refEq) --- */
        ! function( t ) {
            "use strict";
            ( n["Data.Eq"] = n["Data.Eq"] || {} ).refEq = function( n ) {
                return function( t ) {
                    return n === t // Reference equality check.
                }
            }
        }(); // IIFE for Data.Eq (refEq).

        /* --- Data.Unit module --- */
        ! function( t ) {
            "use strict";
            ( n["Data.Unit"] = n["Data.Unit"] || {} ).unit = {} // Define a singleton 'unit' object.
        }(); // IIFE for Data.Unit.

        /* --- Data.Show module (showIntImpl) --- */
        ! function( t ) {
            "use strict";
            ( n["Data.Show"] = n["Data.Show"] || {} ).showIntImpl = function( n ) {
                return n.toString() // Convert integer to string.
            }
        }(); // IIFE for Data.Show (showIntImpl).

        /* --- Data.Show module (Show type class) --- */
        ! function( t ) {
            "use strict";
            var r = n["Data.Show"], // Import Data.Show (for showIntImpl).
                e = ( n["Data.Symbol"], n["Record.Unsafe"], n["Type.Data.RowList"], function( n ) { this.show = n } ), // Show type class constructor.
                a = new e( r.showIntImpl ); // `showInt`: Show instance for integers.
            t.Show = e; // Export the `Show` type class.
            t.show = function( n ) { return n.show }; // Export the `show` function.
            t.showInt = a // Export the `showInt` instance.
        }( n["Data.Show"] = n["Data.Show"] || {} ); // IIFE for Data.Show.

        /* --- Data.Unit module (unit export) --- */
        ! function( t ) {
            "use strict";
            var r = n["Data.Unit"]; // Import Data.Unit.
            n["Data.Show"];
            t.unit = r.unit // Export the `unit` value.
        }( n["Data.Unit"] = n["Data.Unit"] || {} ); // IIFE for Data.Unit.

        /* --- Data.Eq module (Eq type class) --- */
        ! function( t ) {
            "use strict";
            var r = n["Data.Eq"], // Import Data.Eq (for refEq).
                e = ( n["Data.HeytingAlgebra"], n["Data.Symbol"], n["Data.Unit"], n["Data.Void"], n["Record.Unsafe"], n["Type.Data.RowList"], function( n ) { this.eq = n } ), // Eq type class constructor.
                a = new e( r.refEq ); // `eqInt`: Eq instance for integers.
            t.Eq = e; // Export the `Eq` type class.
            t.eq = function( n ) { return n.eq }; // Export the `eq` function.
            t.eqInt = a // Export the `eqInt` instance.
        }( n["Data.Eq"] = n["Data.Eq"] || {} ); // IIFE for Data.Eq.

        /* --- Data.Ord.Unsafe module (unsafeCompareImpl) --- */
        ! function( t ) {
            "use strict";
            ( n["Data.Ord.Unsafe"] = n["Data.Ord.Unsafe"] || {} ).unsafeCompareImpl = function( n ) {
                return function( t ) {
                    return function( r ) {
                        return function( e ) {
                            return function( a ) {
                                return e < a ? n : e === a ? t : r // Basic comparison logic.
                            }
                        }
                    }
                }
            }
        }(); // IIFE for Data.Ord.Unsafe (unsafeCompareImpl).

        /* --- Data.Semigroup module --- */
        ! function( t ) {
            "use strict";
            n["Data.Semigroup"], n["Data.Symbol"], n["Data.Unit"], n["Data.Void"], n["Record.Unsafe"], n["Type.Data.RowList"];
            t.Semigroup = function( n ) { this.append = n }; // Semigroup type class constructor.
            t.append = function( n ) { return n.append } // Export `append` accessor.
        }( n["Data.Semigroup"] = n["Data.Semigroup"] || {} ); // IIFE for Data.Semigroup.

        /* --- Data.Ordering module --- */
        ! function( t ) {
            "use strict";
            var r = function() { function n() {} return n.value = new n, n }(), // LT (Less Than)
                e = function() { function n() {} return n.value = new n, n }(), // GT (Greater Than)
                a = function() { function n() {} return n.value = new n, n }(); // EQ (Equal)
            t.LT = r; // Export LT constructor.
            t.GT = e; // Export GT constructor.
            t.EQ = a // Export EQ constructor.
        }( n["Data.Ordering"] = n["Data.Ordering"] || {} ); // IIFE for Data.Ordering.

        /* --- Data.Ord.Unsafe module (unsafeCompare) --- */
        ! function( t ) {
            "use strict";
            var r = n["Data.Ord.Unsafe"], // Import `unsafeCompareImpl`.
                e = n["Data.Ordering"], // Import `Data.Ordering` constructors.
                a = r.unsafeCompareImpl( e.LT.value )( e.EQ.value )( e.GT.value ); // Define `unsafeCompare` using constants.
            t.unsafeCompare = a // Export `unsafeCompare`.
        }( n["Data.Ord.Unsafe"] = n["Data.Ord.Unsafe"] || {} ); // IIFE for Data.Ord.Unsafe.

        /* --- Data.Ring module (intSub) --- */
        ! function( t ) {
            "use strict";
            ( n["Data.Ring"] = n["Data.Ring"] || {} ).intSub = function( n ) {
                return function( t ) {
                    return n - t | 0 // Integer subtraction (bitwise OR 0 for 32-bit int).
                }
            }
        }(); // IIFE for Data.Ring (intSub).

        /* --- Data.Semiring module (intAdd, intMul) --- */
        ! function( n ) {
            "use strict";
            n.intAdd = function( n ) {
                return function( t ) {
                    return n + t | 0 // Integer addition.
                }
            };
            n.intMul = function( n ) {
                return function( t ) {
                    return n * t | 0 // Integer multiplication.
                }
            }
        }( n["Data.Semiring"] = n["Data.Semiring"] || {} ); // IIFE for Data.Semiring.

        /* --- Data.Semiring module (Semiring type class) --- */
        ! function( t ) {
            "use strict";
            var r = n["Data.Semiring"], // Import raw Semiring ops.
                e = ( n["Data.Symbol"], n["Data.Unit"], n["Record.Unsafe"], n["Type.Data.Row"], n["Type.Data.RowList"], function( n, t, r, e ) {
                    this.add = n,
                        this.mul = t,
                        this.one = r,
                        this.zero = e
                } ), // Semiring type class constructor.
                a = new e( r.intAdd, r.intMul, 1, 0 ); // `semiringInt`: Semiring instance for integers.
            t.Semiring = e; // Export the `Semiring` type class.
            t.add = function( n ) { return n.add }; // Export `add` accessor.
            t.zero = function( n ) { return n.zero }; // Export `zero` accessor.
            t.mul = function( n ) { return n.mul }; // Export `mul` accessor.
            t.one = function( n ) { return n.one }; // Export `one` accessor.
            t.semiringInt = a // Export the `semiringInt` instance.
        }( n["Data.Semiring"] = n["Data.Semiring"] || {} ); // IIFE for Data.Semiring.

        /* --- Data.Ring module (Ring type class) --- */
        ! function( t ) {
            "use strict";
            var r = n["Data.Ring"], // Import raw Ring ops.
                e = n["Data.Semiring"], // Import `Data.Semiring`.
                a = ( n["Data.Symbol"], n["Data.Unit"], n["Record.Unsafe"], n["Type.Data.RowList"], function( n, t ) {
                    this.Semiring0 = n, // Reference to a Semiring instance.
                        this.sub = t // Subtraction function.
                } ), // Ring type class constructor.
                o = new a( function() { return e.semiringInt }, r.intSub ); // `ringInt`: Ring instance for integers.
            t.Ring = a; // Export the `Ring` type class.
            t.sub = function( n ) { return n.sub }; // Export `sub` accessor.
            t.ringInt = o // Export the `ringInt` instance.
        }( n["Data.Ring"] = n["Data.Ring"] || {} ); // IIFE for Data.Ring.

        /* --- Data.Ord module --- */
        ! function( t ) {
            "use strict";
            n["Data.Ord"];
            var r = n["Data.Eq"], // Import `Data.Eq`.
                e = n["Data.Ord.Unsafe"], // Import `Data.Ord.Unsafe`.
                a = n["Data.Ordering"], // Import `Data.Ordering`.
                o = ( n["Data.Ring"], n["Data.Semiring"], n["Data.Symbol"], n["Data.Unit"], n["Data.Void"], n["Record.Unsafe"], n["Type.Data.RowList"], function( n, t ) {
                    this.Eq0 = n, // Reference to an Eq instance.
                        this.compare = t // Comparison function.
                } ), // Ord type class constructor.
                i = new o( function() { return r.eqInt }, e.unsafeCompare ), // `ordInt`: Ord instance for integers.
                u = function( n ) { return n.compare }; // Helper to get the `compare` function.
            t.Ord = o; // Export the `Ord` type class.
            t.compare = u; // Export the `compare` function.
            t.min = function( n ) {
                return function( t ) {
                    return function( r ) {
                        var e = u( n )( t )( r ); // Perform comparison.
                        if ( e instanceof a.LT ) return t; // If Less Than, return first value.
                        if ( e instanceof a.EQ ) return t; // If Equal, return first value.
                        if ( e instanceof a.GT ) return r; // If Greater Than, return second value.
                        // This should ideally not be reached with proper Ord instances.
                        throw new Error( "Failed pattern match at Data.Ord (line 119, column 3 - line 122, column 12): " + [e.constructor.name] )
                    }
                }
            };
            t.max = function( n ) {
                return function( t ) {
                    return function( r ) {
                        var e = u( n )( t )( r ); // Perform comparison.
                        if ( e instanceof a.LT ) return r; // If Less Than, return second value.
                        if ( e instanceof a.EQ ) return t; // If Equal, return first value.
                        if ( e instanceof a.GT ) return t; // If Greater Than, return first value.
                        // This should ideally not be reached.
                        throw new Error( "Failed pattern match at Data.Ord (line 128, column 3 - line 131, column 12): " + [e.constructor.name] )
                    }
                }
            };
            t.ordInt = i // Export the `ordInt` instance.
        }( n["Data.Ord"] = n["Data.Ord"] || {} ); // IIFE for Data.Ord.

        /* --- Data.Function module --- */
        ! function( t ) {
            "use strict";
            n["Control.Category"], n["Data.Boolean"], n["Data.Ord"], n["Data.Ring"];
            t.flip = function( n ) {
                return function( t ) {
                    return function( r ) {
                        return n( r )( t ) // Flips the first two arguments of a function.
                    }
                }
            };
            t.const = function( n ) {
                return function( t ) {
                    return n // Returns a constant value, ignoring its argument.
                }
            }
        }( n["Data.Function"] = n["Data.Function"] || {} ); // IIFE for Data.Function.

        /* --- Data.Functor module (arrayMap) --- */
        ! function( t ) {
            "use strict";
            ( n["Data.Functor"] = n["Data.Functor"] || {} ).arrayMap = function( n ) {
                return function( t ) {
                    // Maps a function `n` over each element of an array `t`.
                    for ( var r = t.length, e = new Array( r ), a = 0; a < r; a++ ) e[a] = n( t[a] );
                    return e
                }
            }
        }(); // IIFE for Data.Functor (arrayMap).

        /* --- Data.Functor module (Functor type class) --- */
        ! function( t ) {
            "use strict";
            var r = n["Data.Functor"], // Import `arrayMap`.
                e = ( n["Control.Semigroupoid"], n["Data.Function"] ), // Import `Data.Function`.
                a = n["Data.Unit"], // Import `Data.Unit`.
                o = function( n ) { this.map = n }, // Functor type class constructor.
                i = function( n ) { return n.map }, // Helper to get the `map` function.
                u = new o( r.arrayMap ); // `functorArray`: Functor instance for arrays.
            t.Functor = o; // Export the `Functor` type class.
            t.map = i; // Export the `map` function.
            t.void = function( n ) {
                return i( n )( e.const( a.unit ) ) // Maps a function that ignores its input and returns `unit`.
            };
            t.functorArray = u // Export the `functorArray` instance.
        }( n["Data.Functor"] = n["Data.Functor"] || {} ); // IIFE for Data.Functor.

        /* --- Control.Apply module (Apply type class) --- */
        ! function( t ) {
            "use strict";
            var r = n["Control.Apply"], // Import `arrayApply`.
                e = n["Control.Category"], // Import `Control.Category`.
                a = n["Data.Function"], // Import `Data.Function`.
                o = n["Data.Functor"], // Import `Data.Functor`.
                i = function( n, t ) {
                    this.Functor0 = n, // Reference to a Functor instance.
                        this.apply = t // Application function.
                }, // Apply type class constructor.
                u = new i( function() { return o.functorArray }, r.arrayApply ), // `applyArray`: Apply instance for arrays.
                c = function( n ) { return n.apply }; // Helper to get the `apply` function.
            t.Apply = i; // Export the `Apply` type class.
            t.apply = c; // Export the `apply` function.
            t.applySecond = function( n ) {
                return function( t ) {
                    return function( r ) {
                        // Apply `t` (a value in a context) and then ignore its result,
                        // keeping the result of `r` (another value in a context).
                        return c( n )( o.map( n.Functor0() )( a.const( e.identity( e.categoryFn ) ) )( t ) )( r )
                    }
                }
            };
            t.applyArray = u // Export the `applyArray` instance.
        }( n["Control.Apply"] = n["Control.Apply"] || {} ); // IIFE for Control.Apply.

        /* --- Control.Applicative module --- */
        ! function( t ) {
            "use strict";
            var r = n["Control.Apply"], // Import `Control.Apply`.
                e = ( n["Data.Functor"], n["Data.Unit"], function( n ) { return n.pure } ); // Helper to get the `pure` function.
            t.Applicative = function( n, t ) {
                this.Apply0 = n, // Reference to an Apply instance.
                    this.pure = t // Pure function.
            }; // Applicative type class constructor.
            t.pure = e; // Export the `pure` function.
            t.liftA1 = function( n ) {
                return function( t ) {
                    return function( a ) {
                        // Lifts a unary function `t` into the Applicative context.
                        return r.apply( n.Apply0() )( e( n )( t ) )( a )
                    }
                }
            }
        }( n["Control.Applicative"] = n["Control.Applicative"] || {} ); // IIFE for Control.Applicative.

        /* --- Control.Bind module (arrayBind) --- */
        ! function( t ) {
            "use strict";
            ( n["Control.Bind"] = n["Control.Bind"] || {} ).arrayBind = function( n ) {
                return function( t ) {
                    // Flat-maps a function `t` over an array `n`.
                    for ( var r = [], e = 0, a = n.length; e < a; e++ ) Array.prototype.push.apply( r, t( n[e] ) );
                    return r
                }
            }
        }(); // IIFE for Control.Bind (arrayBind).

        /* --- Control.Bind module (Bind type class) --- */
        ! function( t ) {
            "use strict";
            var r = n["Control.Bind"], // Import `arrayBind`.
                e = ( n["Control.Applicative"], n["Control.Apply"] ), // Import `Control.Apply`.
                a = ( n["Control.Category"], n["Data.Function"] ), // Import `Data.Function`.
                o = ( n["Data.Functor"], n["Data.Unit"], function( n, t ) {
                    this.Apply0 = n, // Reference to an Apply instance.
                        this.bind = t // Bind function.
                } ), // Bind type class constructor.
                i = new o( function() { return e.applyArray }, r.arrayBind ), // `bindArray`: Bind instance for arrays.
                u = function( n ) { return n.bind }, // Helper to get the `bind` function.
                c = function( n ) { return a.flip( u( n ) ) }; // `bindFlipped`: `bind` with arguments flipped.
            t.Bind = o; // Export the `Bind` type class.
            t.bind = u; // Export the `bind` function.
            t.bindFlipped = c; // Export `bindFlipped`.
            t.composeKleisliFlipped = function( n ) {
                return function( t ) {
                    return function( r ) {
                        return function( e ) {
                            // Composes two Kleisli arrows, flipped.
                            return c( n )( t )( r( e ) )
                        }
                    }
                }
            };
            t.bindArray = i // Export the `bindArray` instance.
        }( n["Control.Bind"] = n["Control.Bind"] || {} ); // IIFE for Control.Bind.

        /* --- Control.Monad module --- */
        ! function( t ) {
            "use strict";
            var r = n["Control.Applicative"], // Import `Control.Applicative`.
                e = ( n["Control.Apply"], n["Control.Bind"] ); // Import `Control.Bind`.
            n["Data.Functor"], n["Data.Unit"];
            t.Monad = function( n, t ) {
                this.Applicative0 = n, // Reference to an Applicative instance.
                    this.Bind1 = t // Reference to a Bind instance.
            }; // Monad type class constructor.
            t.ap = function( n ) {
                return function( t ) {
                    return function( a ) {
                        // `ap` implementation for Monad, using `bind` and `pure`.
                        return e.bind( n.Bind1() )( t )( function( t ) {
                            return e.bind( n.Bind1() )( a )( function( e ) {
                                return r.pure( n.Applicative0() )( t( e ) )
                            } )
                        } )
                    }
                }
            }
        }( n["Control.Monad"] = n["Control.Monad"] || {} ); // IIFE for Control.Monad.

        /* --- Control.Monad.ST.Internal module (raw JS ops) --- */
        ! function( n ) {
            "use strict";
            n.map_ = function( n ) { return function( t ) { return function() { return n( t() ) } } }; // Map over an ST action.
            n.pure_ = function( n ) { return function() { return n } }; // Create a pure ST action.
            n.bind_ = function( n ) { return function( t ) { return function() { return t( n() )() } } }; // Bind two ST actions.
            n.for = function( n ) {
                return function( t ) {
                    return function( r ) {
                        return function() {
                            for ( var e = n; e < t; e++ ) r( e )(); // Imperative for loop in ST.
                        }
                    }
                }
            };
            n["modify'"] = function( n ) {
                return function( t ) {
                    return function() {
                        var r = n( t.value ); // Apply function to STRef value.
                        return t.value = r.state, r.value // Update STRef and return new value.
                    }
                }
            }
        }( n["Control.Monad.ST.Internal"] = n["Control.Monad.ST.Internal"] || {} ); // IIFE for Control.Monad.ST.Internal.

        /* --- Partial.Unsafe module (unsafePartial) --- */
        ! function( t ) {
            "use strict";
            ( n["Partial.Unsafe"] = n["Partial.Unsafe"] || {} ).unsafePartial = function( n ) {
                return n() // Directly executes a thunk, bypassing safety checks.
            }
        }(); // IIFE for Partial.Unsafe.

        /* --- Partial module (crashWith) --- */
        ! function( t ) {
            "use strict";
            ( n["Partial"] = n["Partial"] || {} ).crashWith = function() {
                return function( n ) {
                    throw new Error( n ) // Throws a JavaScript Error.
                }
            }
        }(); // IIFE for Partial.

        /* --- Partial module (crashWith export) --- */
        ! function( t ) {
            "use strict";
            var r = n.Partial; // Import `Partial`.
            t.crashWith = r.crashWith // Export `crashWith`.
        }( n.Partial = n.Partial || {} ); // IIFE for Partial.

        /* --- Partial.Unsafe module (unsafeCrashWith) --- */
        ! function( t ) {
            "use strict";
            var r = n["Partial.Unsafe"], // Import `Partial.Unsafe`.
                e = n.Partial; // Import `Partial`.
            t.unsafeCrashWith = function( n ) {
                return r.unsafePartial( function( t ) {
                    return e.crashWith( t )( n ) // Calls `crashWith` via `unsafePartial`.
                } )
            }
        }( n["Partial.Unsafe"] = n["Partial.Unsafe"] || {} ); // IIFE for Partial.Unsafe.

        /* --- Control.Monad.ST.Internal module (ST instances) --- */
        ! function( t ) {
            "use strict";
            var r = n["Control.Monad.ST.Internal"], // Import raw ST operations.
                e = n["Control.Applicative"], // Import `Control.Applicative`.
                a = n["Control.Apply"], // Import `Control.Apply`.
                o = n["Control.Bind"], // Import `Control.Bind`.
                i = n["Control.Monad"], // Import `Control.Monad`.
                u = ( n["Control.Monad.Rec.Class"], n["Data.Functor"] ), // Import `Data.Functor`.
                c = ( n["Data.Unit"], n["Partial.Unsafe"], n.Prelude, new u.Functor( r.map_ ) ), // `functorST`: Functor instance for ST.
                f = new i.Monad( function() { return d }, function() { return l } ), // `monadST`: Monad instance for ST.
                l = new o.Bind( function() { return s }, r.bind_ ), // `bindST`: Bind instance for ST.
                s = new a.Apply( function() { return c }, i.ap( f ) ), // `applyST`: Apply instance for ST.
                d = new e.Applicative( function() { return s }, r.pure_ ); // `applicativeST`: Applicative instance for ST.
            t.modify = function( n ) {
                return r["modify'"]( function( t ) {
                    var r = n( t );
                    return { state: r, value: r } // Helper to modify an STRef.
                } )
            };
            t.functorST = c; // Export `functorST`.
            t.applyST = s; // Export `applyST`.
            t.applicativeST = d; // Export `applicativeST`.
            t.bindST = l; // Export `bindST`.
            t.monadST = f; // Export `monadST`.
            t.for = r.for // Export `for`.
        }( n["Control.Monad.ST.Internal"] = n["Control.Monad.ST.Internal"] || {} ); // IIFE for Control.Monad.ST.Internal.

        /* --- Data.Foldable module (raw JS ops) --- */
        ! function( n ) {
            "use strict";
            n.foldrArray = function( n ) {
                return function( t ) {
                    return function( r ) {
                        for ( var e = t, a = r.length - 1; a >= 0; a-- ) e = n( r[a] )( e ); // Fold right over an array.
                        return e
                    }
                }
            };
            n.foldlArray = function( n ) {
                return function( t ) {
                    return function( r ) {
                        for ( var e = t, a = r.length, o = 0; o < a; o++ ) e = n( e )( r[o] ); // Fold left over an array.
                        return e
                    }
                }
            }
        }( n["Data.Foldable"] = n["Data.Foldable"] || {} ); // IIFE for Data.Foldable.

        /* --- Data.EuclideanRing module (raw JS ops) --- */
        ! function( n ) {
            "use strict";
            n.intDegree = function( n ) { return Math.min( Math.abs( n ), 2147483647 ) }; // Integer degree (abs and clamp).
            n.intDiv = function( n ) {
                return function( t ) {
                    return 0 === t ? 0 : t > 0 ? Math.floor( n / t ) : -Math.floor( n / -t ) // Integer division.
                }
            };
            n.intMod = function( n ) {
                return function( t ) {
                    if ( 0 === t ) return 0;
                    var r = Math.abs( t );
                    return ( n % r + r ) % r // Integer modulo.
                }
            }
        }( n["Data.EuclideanRing"] = n["Data.EuclideanRing"] || {} ); // IIFE for Data.EuclideanRing.

        /* --- Data.CommutativeRing module --- */
        ! function( t ) {
            "use strict";
            var r = n["Data.Ring"], // Import `Data.Ring`.
                e = ( n["Data.Semiring"], n["Data.Symbol"], n["Data.Unit"], function( n ) { this.Ring0 = n } ), // CommutativeRing type class constructor.
                a = new e( function() { return r.ringInt } ); // `commutativeRingInt`: CommutativeRing instance for integers.
            t.CommutativeRing = e; // Export the `CommutativeRing` type class.
            t.commutativeRingInt = a // Export the `commutativeRingInt` instance.
        }( n["Data.CommutativeRing"] = n["Data.CommutativeRing"] || {} ); // IIFE for Data.CommutativeRing.

        /* --- Data.EuclideanRing module (EuclideanRing type class) --- */
        ! function( t ) {
            "use strict";
            var r = n["Data.EuclideanRing"], // Import raw EuclideanRing ops.
                e = ( n["Data.BooleanAlgebra"], n["Data.CommutativeRing"] ), // Import `Data.CommutativeRing`.
                a = ( n["Data.Eq"], n["Data.HeytingAlgebra"], n["Data.Ring"], n["Data.Semiring"], function( n, t, r, e ) {
                    this.CommutativeRing0 = n, // Reference to a CommutativeRing instance.
                        this.degree = t, // Degree function.
                        this.div = r, // Division function.
                        this.mod = e // Modulo function.
                } ), // EuclideanRing type class constructor.
                o = new a( function() { return e.commutativeRingInt }, r.intDegree, r.intDiv, r.intMod ); // `euclideanRingInt`: EuclideanRing instance for integers.
            t.EuclideanRing = a; // Export the `EuclideanRing` type class.
            t.degree = function( n ) { return n.degree }; // Export `degree` accessor.
            t.div = function( n ) { return n.div }; // Export `div` accessor.
            t.mod = function( n ) { return n.mod }; // Export `mod` accessor.
            t.euclideanRingInt = o // Export the `euclideanRingInt` instance.
        }( n["Data.EuclideanRing"] = n["Data.EuclideanRing"] || {} ); // IIFE for Data.EuclideanRing.

        /* --- Data.Monoid module --- */
        ! function( t ) {
            "use strict";
            n["Data.Boolean"], n["Data.Eq"], n["Data.EuclideanRing"], n["Data.Ord"], n["Data.Ordering"], n["Data.Semigroup"], n["Data.Symbol"], n["Data.Unit"], n["Record.Unsafe"], n["Type.Data.RowList"];
            t.Monoid = function( n, t ) {
                this.Semigroup0 = n, // Reference to a Semigroup instance.
                    this.mempty = t // Empty element.
            }; // Monoid type class constructor.
            t.mempty = function( n ) { return n.mempty } // Export `mempty` accessor.
        }( n["Data.Monoid"] = n["Data.Monoid"] || {} ); // IIFE for Data.Monoid.

        /* --- Data.Maybe module --- */
        ! function( t ) {
            "use strict";
            n["Control.Alt"], n["Control.Alternative"], n["Control.Applicative"], n["Control.Apply"], n["Control.Bind"], n["Control.Category"], n["Control.Extend"], n["Control.Monad"], n["Control.MonadZero"], n["Control.Plus"], n["Data.Bounded"], n["Data.Eq"], n["Data.Function"], n["Data.Functor"], n["Data.Functor.Invariant"], n["Data.Monoid"], n["Data.Ord"], n["Data.Ordering"], n["Data.Semigroup"], n["Data.Show"], n["Data.Unit"], n.Prelude;
            var r = function() { function n() {} return n.value = new n, n }(), // `Nothing` constructor (singleton).
                e = function() { function n( n ) { this.value0 = n } return n.create = function( t ) { return new n( t ) }, n }(); // `Just` constructor.
            t.Nothing = r; // Export `Nothing`.
            t.Just = e; // Export `Just`.
            t.maybe = function( n ) {
                return function( t ) {
                    return function( a ) {
                        if ( a instanceof r ) return n; // If Nothing, return default value.
                        if ( a instanceof e ) return t( a.value0 ); // If Just, apply function to inner value.
                        // Handle impossible pattern match.
                        throw new Error( "Failed pattern match at Data.Maybe (line 217, column 1 - line 217, column 51): " + [n.constructor.name, t.constructor.name, a.constructor.name] )
                    }
                }
            }
        }( n["Data.Maybe"] = n["Data.Maybe"] || {} ); // IIFE for Data.Maybe.

        /* --- Data.Foldable module (Foldable type class) --- */
        ! function( t ) {
            "use strict";
            var r = n["Data.Foldable"], // Import raw Foldable ops.
                e = ( n["Control.Alt"], n["Control.Applicative"] ), // Import `Control.Applicative`.
                a = n["Control.Apply"], // Import `Control.Apply`.
                o = ( n["Control.Bind"], n["Control.Category"], n["Control.Plus"], n["Control.Semigroupoid"], n["Data.Eq"], n["Data.Function"], n["Data.Functor"], n["Data.HeytingAlgebra"], n["Data.Maybe"], n["Data.Maybe.First"], n["Data.Maybe.Last"], n["Data.Monoid"] ), // Import `Data.Monoid`.
                i = ( n["Data.Monoid.Additive"], n["Data.Monoid.Conj"], n["Data.Monoid.Disj"], n["Data.Monoid.Dual"], n["Data.Monoid.Endo"], n["Data.Monoid.Multiplicative"], n["Data.Newtype"], n["Data.Ord"], n["Data.Ordering"], n["Data.Semigroup"] ), // Import `Data.Semigroup`.
                u = ( n["Data.Semiring"], n["Data.Unit"] ), // Import `Data.Unit`.
                c = ( n.Prelude, function( n, t, r ) {
                    this.foldMap = n, // FoldMap function.
                        this.foldl = t, // Foldl function.
                        this.foldr = r // Foldr function.
                } ), // Foldable type class constructor.
                f = function( n ) { return n.foldr }, // Helper to get `foldr`.
                l = function( n ) {
                    return function( t ) {
                        return function( r ) {
                            // Default `foldMap` implementation using `foldr`.
                            return f( n )( function( n ) {
                                return function( e ) {
                                    return i.append( t.Semigroup0() )( r( n ) )( e )
                                }
                            } )( o.mempty( t ) )
                        }
                    }
                }, // `foldMapDefaultR`.
                s = new c( function( n ) { return l( s )( n ) }, r.foldlArray, r.foldrArray ); // `foldableArray`: Foldable instance for arrays.
            t.Foldable = c; // Export the `Foldable` type class.
            t.foldr = f; // Export `foldr`.
            t.foldl = function( n ) { return n.foldl }; // Export `foldl`.
            t.foldMap = function( n ) { return n.foldMap }; // Export `foldMap`.
            t.foldMapDefaultR = l; // Export `foldMapDefaultR`.
            t.traverse_ = function( n ) {
                return function( t ) {
                    return function( r ) {
                        // Traverse a Foldable structure, discarding results.
                        return f( t )( function( t ) {
                            return a.applySecond( n.Apply0() )( r( t ) )
                        } )( e.pure( n )( u.unit ) )
                    }
                }
            };
            t.foldableArray = s // Export the `foldableArray` instance.
        }( n["Data.Foldable"] = n["Data.Foldable"] || {} ); // IIFE for Data.Foldable.

        /* --- Data.Either module --- */
        ! function( t ) {
            "use strict";
            n["Control.Alt"];
            var r = n["Control.Applicative"], // Import `Control.Applicative`.
                e = n["Control.Apply"], // Import `Control.Apply`.
                a = n["Control.Bind"], // Import `Control.Bind`.
                o = ( n["Control.Extend"], n["Control.Monad"], n["Control.Semigroupoid"], n["Data.Bifoldable"], n["Data.Bifunctor"], n["Data.Bitraversable"], n["Data.Bounded"], n["Data.Eq"], n["Data.Foldable"], n["Data.FoldableWithIndex"], n["Data.Function"], n["Data.Functor"] ), // Import `Data.Functor`.
                i = ( n["Data.Functor.Invariant"], n["Data.FunctorWithIndex"], n["Data.Maybe"] ), // Import `Data.Maybe`.
                u = ( n["Data.Monoid"], n["Data.Ord"], n["Data.Ordering"], n["Data.Semigroup"], n["Data.Show"], n["Data.Traversable"], n["Data.TraversableWithIndex"], n["Data.Unit"], n.Prelude, function() { function n( n ) { this.value0 = n } return n.create = function( t ) { return new n( t ) }, n }() ), // `Left` constructor.
                c = function() { function n( n ) { this.value0 = n } return n.create = function( t ) { return new n( t ) }, n }(), // `Right` constructor.
                f = new o.Functor( function( n ) {
                    return function( t ) {
                        if ( t instanceof u ) return new u( t.value0 ); // Map over Left (no change).
                        if ( t instanceof c ) return new c( n( t.value0 ) ); // Map over Right (apply function).
                        // Handle impossible pattern match.
                        throw new Error( "Failed pattern match at Data.Either (line 38, column 8 - line 38, column 52): " + [t.constructor.name] )
                    }
                } ), // `functorEither`: Functor instance for Either.
                l = function( n ) {
                    return function( t ) {
                        return function( r ) {
                            if ( r instanceof u ) return n( r.value0 ); // If Left, apply first function.
                            if ( r instanceof c ) return t( r.value0 ); // If Right, apply second function.
                            // Handle impossible pattern match.
                            throw new Error( "Failed pattern match at Data.Either (line 238, column 1 - line 238, column 64): " + [n.constructor.name, t.constructor.name, r.constructor.name] )
                        }
                    }
                }, // `either` function.
                s = new e.Apply( function() { return f }, function( n ) {
                    return function( t ) {
                        if ( n instanceof u ) return new u( n.value0 ); // If Left, propagate Left.
                        if ( n instanceof c ) return o.map( f )( n.value0 )( t ); // If Right, apply function from Right.
                        // Handle impossible pattern match.
                        throw new Error( "Failed pattern match at Data.Either (line 82, column 1 - line 82, column 41): " + [n.constructor.name, t.constructor.name] )
                    }
                } ), // `applyEither`: Apply instance for Either.
                d = new a.Bind( function() { return s }, l( function( n ) { return function( t ) { return new u( n ) } } )( function( n ) { return function( t ) { return t( n ) } } ) ), // `bindEither`: Bind instance for Either.
                p = new r.Applicative( function() { return s }, c.create ); // `applicativeEither`: Applicative instance for Either.
            t.Left = u; // Export `Left`.
            t.Right = c; // Export `Right`.
            t.either = l; // Export `either`.
            t.note = function( n ) { return i.maybe( new u( n ) )( c.create ) }; // Convert Maybe to Either.
            t.functorEither = f; // Export `functorEither`.
            t.applyEither = s; // Export `applyEither`.
            t.applicativeEither = p; // Export `applicativeEither`.
            t.bindEither = d // Export `bindEither`.
        }( n["Data.Either"] = n["Data.Either"] || {} ); // IIFE for Data.Either.

        /* --- Effect module (raw JS ops) --- */
        ! function( n ) {
            "use strict";
            n.pureE = function( n ) { return function() { return n } }; // Create a pure Effect action.
            n.bindE = function( n ) { return function( t ) { return function() { return t( n() )() } } } // Bind two Effect actions.
        }( n.Effect = n.Effect || {} ); // IIFE for Effect.

        /* --- Effect module (Effect instances) --- */
        ! function( t ) {
            "use strict";
            var r = n.Effect, // Import raw Effect ops.
                e = n["Control.Applicative"], // Import `Control.Applicative`.
                a = n["Control.Apply"], // Import `Control.Apply`.
                o = n["Control.Bind"], // Import `Control.Bind`.
                i = n["Control.Monad"], // Import `Control.Monad`.
                u = n["Data.Functor"], // Import `Data.Functor`.
                c = ( n["Data.Monoid"], n["Data.Semigroup"], n.Prelude, new i.Monad( function() { return s }, function() { return f } ) ), // `monadEffect`: Monad instance for Effect.
                f = new o.Bind( function() { return l }, r.bindE ), // `bindEffect`: Bind instance for Effect.
                l = new a.Apply( function() { return d }, i.ap( c ) ), // `applyEffect`: Apply instance for Effect.
                s = new e.Applicative( function() { return l }, r.pureE ), // `applicativeEffect`: Applicative instance for Effect.
                d = new u.Functor( e.liftA1( s ) ); // `functorEffect`: Functor instance for Effect.
            t.functorEffect = d; // Export `functorEffect`.
            t.applyEffect = l; // Export `applyEffect`.
            t.applicativeEffect = s; // Export `applicativeEffect`.
            t.bindEffect = f; // Export `bindEffect`.
            t.monadEffect = c // Export `monadEffect`.
        }( n.Effect = n.Effect || {} ); // IIFE for Effect.

        /* --- Effect.Class module --- */
        ! function( t ) {
            "use strict";
            n["Control.Category"], n["Control.Monad"], n.Effect;
            t.liftEffect = function( n ) { return n.liftEffect }; // Helper to lift an Effect.
            t.MonadEffect = function( n, t ) {
                this.Monad0 = n, // Reference to a Monad instance.
                    this.liftEffect = t // Function to lift Effect actions.
            } // MonadEffect type class constructor.
        }( n["Effect.Class"] = n["Effect.Class"] || {} ); // IIFE for Effect.Class.

        /* --- Effect.Ref module (raw JS ops) --- */
        ! function( n ) {
            "use strict";
            n.new = function( n ) { return function() { return { value: n } } }; // Create a new mutable reference.
            n.read = function( n ) { return function() { return n.value } }; // Read the value from a reference.
            n.write = function( n ) { return function( t ) { return function() { return t.value = n, {} } } } // Write a new value to a reference.
        }( n["Effect.Ref"] = n["Effect.Ref"] || {} ); // IIFE for Effect.Ref.

        /* --- Effect.Ref module (Ref exports) --- */
        ! function( t ) {
            "use strict";
            var r = n["Effect.Ref"]; // Import raw Ref ops.
            n["Data.Function"], n["Data.Functor"], n.Effect, n.Prelude;
            t.new = r.new; // Export `new`.
            t.read = r.read; // Export `read`.
            t.write = r.write // Export `write`.
        }( n["Effect.Ref"] = n["Effect.Ref"] || {} ); // IIFE for Effect.Ref.

        /* --- Control.Parallel.Class module --- */
        ! function( t ) {
            "use strict";
            n["Control.Alternative"], n["Control.Apply"], n["Control.Bind"], n["Control.Monad.Cont.Trans"], n["Control.Monad.Except.Trans"], n["Control.Monad.Maybe.Trans"], n["Control.Monad.Reader.Trans"], n["Control.Monad.Writer.Trans"], n["Control.Plus"], n["Control.Semigroupoid"], n["Data.Either"], n["Data.Function"], n["Data.Functor"], n["Data.Functor.Compose"], n["Data.Maybe"], n["Data.Newtype"], n["Data.Unit"], n["Effect.Class"], n["Effect.Ref"], n.Prelude;
            t.parallel = function( n ) { return n.parallel }; // Helper to convert to parallel context.
            t.sequential = function( n ) { return n.sequential }; // Helper to convert to sequential context.
            t.Parallel = function( n, t, r, e ) {
                this.Applicative1 = n, // Reference to an Applicative instance for the parallel context.
                    this.Monad0 = t, // Reference to a Monad instance for the sequential context.
                    this.parallel = r, // Function to convert sequential to parallel.
                    this.sequential = e // Function to convert parallel to sequential.
            } // Parallel type class constructor.
        }( n["Control.Parallel.Class"] = n["Control.Parallel.Class"] || {} ); // IIFE for Control.Parallel.Class.

        /* --- Control.Parallel module --- */
        ! function( t ) {
            "use strict";
            n["Control.Alternative"], n["Control.Apply"];
            var r = n["Control.Category"], // Import `Control.Category`.
                e = n["Control.Parallel.Class"], // Import `Control.Parallel.Class`.
                a = ( n["Control.Semigroupoid"], n["Data.Foldable"] ), // Import `Data.Foldable`.
                o = ( n["Data.Traversable"], n.Prelude, function( n ) {
                    return function( t ) {
                        return function( r ) {
                            return function( o ) {
                                // `parTraverse_`: Traverses a Foldable structure in parallel, discarding results.
                                return e.sequential( n )( a.traverse_( n.Applicative1() )( t )( function( t ) {
                                    return e.parallel( n )( r( t ) )
                                } )( o ) )
                            }
                        }
                    }
                } );
            t.parTraverse_ = o; // Export `parTraverse_`.
            t.parSequence_ = function( n ) {
                return function( t ) {
                    // `parSequence_`: Sequences a list of parallel actions, discarding results.
                    return o( n )( t )( r.identity( r.categoryFn ) )
                }
            }
        }( n["Control.Parallel"] = n["Control.Parallel"] || {} ); // IIFE for Control.Parallel.

        /* --- Data.Tuple module --- */
        ! function( t ) {
            "use strict";
            n["Control.Applicative"], n["Control.Apply"], n["Control.Biapplicative"], n["Control.Biapply"], n["Control.Bind"], n["Control.Comonad"], n["Control.Extend"], n["Control.Lazy"], n["Control.Monad"], n["Control.Semigroupoid"], n["Data.Bifoldable"], n["Data.Bifunctor"], n["Data.Bitraversable"], n["Data.BooleanAlgebra"], n["Data.Bounded"], n["Data.CommutativeRing"], n["Data.Distributive"], n["Data.Eq"], n["Data.Foldable"], n["Data.FoldableWithIndex"], n["Data.Function"], n["Data.Functor"], n["Data.Functor.Invariant"], n["Data.FunctorWithIndex"], n["Data.HeytingAlgebra"], n["Data.Maybe"], n["Data.Maybe.First"], n["Data.Monoid"], n["Data.Newtype"], n["Data.Ord"], n["Data.Ordering"], n["Data.Ring"], n["Data.Semigroup"], n["Data.Semigroup.Foldable"], n["Data.Semigroup.Traversable"], n["Data.Semiring"], n["Data.Show"], n["Data.Traversable"], n["Data.TraversableWithIndex"], n["Data.Unit"], n.Prelude, n["Type.Equality"];
            var r = function() {
                function n( n, t ) {
                    this.value0 = n,
                        this.value1 = t
                }
                return n.create = function( t ) {
                    return function( r ) {
                        return new n( t, r )
                    }
                }, n
            }(); // `Tuple` constructor (product type).
            t.Tuple = r // Export `Tuple`.
        }( n["Data.Tuple"] = n["Data.Tuple"] || {} ); // IIFE for Data.Tuple.

        /* --- Unsafe.Coerce module (unsafeCoerce) --- */
        ! function( t ) {
            "use strict";
            ( n["Unsafe.Coerce"] = n["Unsafe.Coerce"] || {} ).unsafeCoerce = function( n ) {
                return n // Performs an unchecked type cast.
            }
        }(); // IIFE for Unsafe.Coerce.

        /* --- Unsafe.Coerce module (unsafeCoerce export) --- */
        ! function( t ) {
            "use strict";
            var r = n["Unsafe.Coerce"]; // Import raw Unsafe.Coerce.
            t.unsafeCoerce = r.unsafeCoerce // Export `unsafeCoerce`.
        }( n["Unsafe.Coerce"] = n["Unsafe.Coerce"] || {} ); // IIFE for Unsafe.Coerce.

        /* --- Data.Array module --- */
        ! function( t ) {
            "use strict";
            n["Data.Array"], n["Control.Alt"], n["Control.Alternative"], n["Control.Applicative"], n["Control.Apply"];
            var r = n["Control.Bind"], // Import `Control.Bind`.
                e = ( n["Control.Category"], n["Control.Lazy"], n["Control.Monad.Rec.Class"], n["Control.Monad.ST"], n["Control.Monad.ST.Internal"], n["Control.Semigroupoid"], n["Data.Array.NonEmpty.Internal"], n["Data.Array.ST"], n["Data.Array.ST.Iterator"], n["Data.Boolean"], n["Data.Eq"], n["Data.Foldable"], n["Data.Function"] ), // Import `Data.Function`.
                a = ( n["Data.Functor"], n["Data.HeytingAlgebra"], n["Data.Maybe"] ), // Import `Data.Maybe`.
                o = ( n["Data.Ord"], n["Data.Ordering"], n["Data.Ring"], n["Data.Semigroup"], n["Data.Semiring"], n["Data.Traversable"], n["Data.Tuple"], n["Data.Unfoldable"], n["Partial.Unsafe"], n.Prelude, n["Unsafe.Coerce"], function( n ) { return [n] } ), // Creates a singleton array.
                i = e.flip( r.bind( r.bindArray ) ); // `concatMap` implementation using `bind` for arrays.
            t.singleton = o; // Export `singleton`.
            t.concatMap = i; // Export `concatMap`.
            t.mapMaybe = function( n ) {
                return i( function( t ) {
                    return a.maybe( [] )( o )( n( t ) ) // Maps a function that might return Nothing, filters out Nothings.
                } )
            }
        }( n["Data.Array"] = n["Data.Array"] || {} ); // IIFE for Data.Array.

        /* --- Data.Int module (fromStringAsImpl) --- */
        ! function( t ) {
            "use strict";
            ( n["Data.Int"] = n["Data.Int"] || {} ).fromStringAsImpl = function( n ) {
                return function( t ) {
                    return function( r ) {
                        var e;
                        // Determine regex character set based on radix.
                        e = r < 11 ? "[0-" + ( r - 1 ).toString() + "]" :
                            11 === r ? "[0-9a]" :
                            "[0-9a-" + String.fromCharCode( 86 + r ) + "]";
                        var a = new RegExp( "^[\\+\\-]?" + e + "+$", "i" ); // Regex for valid integer string.
                        return function( e ) {
                            if ( a.test( e ) ) {
                                var o = parseInt( e, r ); // Parse integer.
                                return ( 0 | o ) === o ? n( o ) : t // Check if it's a valid 32-bit integer.
                            }
                            return t // Return `Nothing` equivalent if parsing fails.
                        }
                    }
                }
            }
        }(); // IIFE for Data.Int (fromStringAsImpl).

        /* --- Data.Int module (fromString, fromStringAs) --- */
        ! function( t ) {
            "use strict";
            var r = n["Data.Int"], // Import raw Int ops.
                e = ( n["Control.Category"], n["Control.Semigroupoid"], n["Data.Boolean"], n["Data.Bounded"], n["Data.CommutativeRing"], n["Data.DivisionRing"], n["Data.Eq"], n["Data.EuclideanRing"], n["Data.HeytingAlgebra"], n["Data.Int.Bits"], n["Data.Maybe"] ), // Import `Data.Maybe`.
                a = ( n["Data.Ord"], n["Data.Ordering"], n["Data.Ring"], n["Data.Semiring"], n["Data.Show"], n.Global, n.Math, n.Prelude, r.fromStringAsImpl( e.Just.create )( e.Nothing.value ) ), // `fromStringAs` implementation.
                o = a( 10 ); // `fromString` (base 10).
            t.fromString = o; // Export `fromString`.
            t.fromStringAs = a // Export `fromStringAs`.
        }( n["Data.Int"] = n["Data.Int"] || {} ); // IIFE for Data.Int.

        /* --- Data.String.Common module (raw JS ops) --- */
        ! function( n ) {
            "use strict";
            n.split = function( n ) { return function( t ) { return t.split( n ) } }; // String split.
            n.trim = function( n ) { return n.trim() } // String trim.
        }( n["Data.String.Common"] = n["Data.String.Common"] || {} ); // IIFE for Data.String.Common.

        /* --- Data.String.Common module (split, trim exports) --- */
        ! function( t ) {
            "use strict";
            var r = n["Data.String.Common"]; // Import raw String ops.
            n["Data.Eq"], n["Data.Ordering"], n["Data.String.Pattern"], n.Prelude;
            t.split = r.split; // Export `split`.
            t.trim = r.trim // Export `trim`.
        }( n["Data.String.Common"] = n["Data.String.Common"] || {} ); // IIFE for Data.String.Common.

        /* --- Effect.Aff module (core types and functions) --- */
        ! function( n ) {
            "use strict";
            var t = function() {
                    // Define constants for various Aff action tags.
                    var n = {},
                        t = "Pure",
                        r = "Throw",
                        e = "Catch",
                        a = "Sync",
                        o = "Async",
                        i = "Bind",
                        u = "Bracket",
                        c = "Fork",
                        f = "Sequential",
                        l = "Map",
                        s = "Apply",
                        d = "Alt",
                        p = "Cons",
                        D = "Resume",
                        m = "Release",
                        g = "Finalizer",
                        h = "Finalized",
                        v = "Forked";

                    // Constructor for Aff actions.
                    function C( n, t, r, e ) {
                        this.tag = n, // Action type tag.
                            this._1 = t,
                            this._2 = r,
                            this._3 = e
                    }

                    // Helper to create tagged constructors.
                    function w( n ) { var t = function( t, r, e ) { return new C( n, t, r, e ) }; return t.tag = n, t }

                    // Represents a non-canceler effect.
                    function y( n ) { return new C( t, void 0 ) }

                    // Utility to throw exceptions asynchronously, preventing uncaught errors from stopping the event loop immediately.
                    function E( n ) { try { n() } catch ( t ) { setTimeout( function() { throw t }, 0 ) } }

                    // Handles synchronous effect execution with error catching.
                    function A( n, t, r ) { try { return t( r() ) } catch ( e ) { return n( e ) } }

                    // Handles asynchronous effect execution with error catching and cancellation.
                    function S( n, t, r ) { try { return t( r() ) } catch ( e ) { return r( n( e ) )(), y } }

                    // Scheduler implementation (a microtask queue).
                    var b = function() {
                        var n = 1024, // Queue size.
                            t = 0, // Current number of items.
                            r = 0, // Read index.
                            e = new Array( n ), // Internal queue array.
                            a = !1; // Draining flag.

                        function o() {
                            var o;
                            for ( a = !0; 0 !== t; ) t--, o = e[r], e[r] = void 0, r = ( r + 1 ) % n, o(); // Drain the queue.
                            a = !1
                        }
                        return {
                            isDraining: function() { return a },
                            enqueue: function( i ) {
                                var u;
                                t === n && ( u = a, o(), a = u ), e[( r + t ) % n] = i, t++, a || o() // Add to queue, drain if not already.
                            }
                        }
                    }();

                    // Fiber states.
                    var _ = 0,
                        F = 1,
                        M = 2,
                        R = 3,
                        P = 4,
                        T = 5,
                        I = 6;

                    // `B`: The Fiber interpreter, responsible for executing Aff actions.
                    function B( n, l, s ) {
                        var d = 0, // Current depth for async continuations.
                            v = _, // Current fiber state.
                            w = s, // Current Aff action being evaluated.
                            y = null, // Stored error (Left value).
                            U = null, // Kill signal.
                            L = null, // Continuation function.
                            q = null, // Continuation stack.
                            N = null, // Catch stack.
                            O = 0, // Bracket depth.
                            x = 0, // `onComplete` handler ID counter.
                            W = null, // `onComplete` handlers.
                            H = !0; // Rethrow unhandled exceptions flag.

                        function z( s ) {
                            for ( var x, V, G;;) // The main fiber execution loop.
                                switch ( x = null, V = null, G = null, v ) {
                                    case M: // Resume state: apply continuation.
                                        v = F, w = L( w ), null === q ? L = null : ( L = q._1, q = q._2 );
                                        break;
                                    case R: // Evaluate Sync action.
                                        n.isLeft( w ) ? ( v = T, y = w, w = null ) : null === L ? v = T : ( v = M, w = n.fromRight( w ) );
                                        break;
                                    case F: // Main evaluation state: process current action.
                                        switch ( w.tag ) {
                                            case i: // Bind: push continuation and continue with first action.
                                                L && ( q = new C( p, L, q ) ), L = w._2, v = F, w = w._1;
                                                break;
                                            case t: // Pure: apply continuation or finish.
                                                null === L ? ( v = T, w = n.right( w._1 ) ) : ( v = M, w = w._1 );
                                                break;
                                            case a: // Sync: evaluate synchronously.
                                                v = R, w = A( n.left, n.right, w._1 );
                                                break;
                                            case o: // Async: suspend fiber and wait for callback.
                                                return v = P, void( w = S( n.left, w._1, function( n ) {
                                                    return function() {
                                                        d === s && ( d++, b.enqueue( function() {
                                                            d === s + 1 && ( v = R, w = n, z( d ) )
                                                        } ) )
                                                    }
                                                } ) );
                                            case r: // Throw: set error and transition to finalization.
                                                v = T, y = n.left( w._1 ), w = null;
                                                break;
                                            case e: // Catch: push catch handler onto stack.
                                                N = new C( p, w, null === L ? N : new C( D, L, q ), U ), L = null, q = null, v = F, w = w._1;
                                                break;
                                            case u: // Bracket: increment depth, push bracket handler.
                                                O++, N = new C( p, w, null === L ? N : new C( D, L, q ), U ), L = null, q = null, v = F, w = w._1;
                                                break;
                                            case c: // Fork: create new fiber, run it if not suspended.
                                                v = R, x = B( n, l, w._2 ), l && l.register( x ), w._1 && x.run(), w = n.right( x );
                                                break;
                                            case f: // Sequential: delegate to `k` (sequential interpreter).
                                                v = F, w = k( n, l, w._1 );
                                                break;
                                        }
                                        break;
                                    case T: // Finalization/Error handling state.
                                        if ( L = null, q = null, null === N ) v = I, w = U || y || w; // No more handlers, prepare to exit.
                                        else switch ( x = N._3, G = N._1, N = N._2, G.tag ) {
                                            case e: // Catch handler.
                                                U && U !== x ? v = T : y && ( v = F, w = G._2( n.fromLeft( y ) ), y = null );
                                                break;
                                            case D: // Resume from Catch.
                                                U && U !== x || y ? v = T : ( L = G._1, q = G._2, v = M, w = n.fromRight( w ) );
                                                break;
                                            case u: // Bracket cleanup.
                                                O--, null === y && ( V = n.fromRight( w ), N = new C( p, new C( m, G._2, V ), N, x ) ), ( U === x || O > 0 ) && ( v = F, w = G._3( V ) );
                                                break;
                                            case m: // Release action from Bracket.
                                                O++, N = new C( p, new C( h, w, y ), N, U ), v = F, w = U && U !== x ? G._1.killed( n.fromLeft( U ) )( G._2 ) : y ? G._1.failed( n.fromLeft( y ) )( G._2 ) : G._1.completed( n.fromRight( w ) )( G._2 ), y = null;
                                                break;
                                            case g: // Finalizer action.
                                                O++, N = new C( p, new C( h, w, y ), N, U ), v = F, w = G._1;
                                                break;
                                            case h: // Finalized state.
                                                O--, v = T, w = G._1, y = G._2;
                                                break;
                                        }
                                        break;
                                    case I: // Exit state: process onComplete handlers.
                                        for ( var j in W ) W.hasOwnProperty( j ) && ( H = H && W[j].rethrow, E( W[j].handler( w ) ) );
                                        return W = null, void( U && y ? setTimeout( function() { throw n.fromLeft( y ) }, 0 ) : n.isLeft( w ) && H && setTimeout( function() { if ( H ) throw n.fromLeft( w ) }, 0 ) );
                                    case _: // Initial state.
                                        v = F;
                                        break;
                                    case P: // Async suspended state.
                                        return
                                }
                        }

                        // Registers an `onComplete` handler for the fiber.
                        function V( n ) {
                            return function() {
                                if ( v === I ) return H = H && n.rethrow, n.handler( w )(),
                                    function() {};
                                var t = x++;
                                return ( W = W || {} )[t] = n,
                                    function() { null !== W && delete W[t] }
                            }
                        }

                        return {
                            kill: function( t, r ) {
                                return function() {
                                    if ( v === I ) return r( n.right( void 0 ) )(),
                                        function() {};
                                    var e = V( { rethrow: !1, handler: function() { return r( n.right( void 0 ) ) } } )();
                                    switch ( v ) {
                                        case _: // If not started, set kill signal and run.
                                            U = n.left( t ), v = I, w = U, z( d );
                                            break;
                                        case P: // If async suspended, set kill signal and reschedule.
                                            null === U && ( U = n.left( t ) ), 0 === O && ( v === P && ( N = new C( p, new C( g, w( t ) ), N, U ) ), v = T, w = null, y = null, z( ++d ) );
                                            break;
                                        default: // If running, set kill signal and transition to finalization.
                                            null === U && ( U = n.left( t ) ), 0 === O && ( v = T, w = null, y = null )
                                    }
                                    return e
                                }
                            },
                            join: function( n ) {
                                return function() {
                                    var t = V( { rethrow: !1, handler: n } )();
                                    return v === _ && z( d ), t
                                }
                            },
                            onComplete: V,
                            isSuspended: function() { return v === _ },
                            run: function() { v === _ && ( b.isDraining() ? z( d ) : b.enqueue( function() { z( d ) } ) ) }
                        }
                    }

                    // `U`: The Sequential interpreter for parallel computations.
                    function U( t, r, e, a ) {
                        var i = 0, // Forked fiber ID counter.
                            u = {}, // Map of fiber IDs to Fiber objects.
                            c = 0, // Completion handler ID counter.
                            f = {}, // Map of completion handler IDs to cleanup functions.
                            D = new Error( "[ParAff] Early exit" ), // Error for early termination.
                            m = null, // Early exit error.
                            g = n; // Current parallel action being processed.

                        // Kills all active forked fibers.
                        function h( r, e, a ) {
                            var o, i, c = e,
                                f = null,
                                D = null,
                                m = 0,
                                g = {};
                            n: for (;;) // Traverse the parallel action tree to find forked fibers.
                                switch ( o = null, c.tag ) {
                                    case v: // Forked action: kill the corresponding fiber.
                                        if ( c._3 === n && ( o = u[c._1], g[m++] = o.kill( r, function( n ) { return function() { 0 === --m && a( n )() } } ) ), null === f ) break n;
                                        c = f._2, null === D ? f = null : ( f = D._1, D = D._2 );
                                        break;
                                    case l: // ParMap: recurse on the mapped action.
                                        c = c._2;
                                        break;
                                    case s: // ParApply: recurse on the left action.
                                    case d: // ParAlt: recurse on the left action.
                                        f && ( D = new C( p, f, D ) ), f = c, c = c._1
                                }
                            if ( 0 === m ) a( t.right( void 0 ) )(); // If no fibers to kill, complete immediately.
                            else
                                for ( i = 0, o = m; i < o; i++ ) g[i] = g[i](); // Execute kill cancelers.
                            return g
                        }

                        // Completion handler for a forked fiber.
                        function w( r ) {
                            return function( e ) {
                                return function() {
                                    delete u[r._1], r._3 = e,
                                        function r( e, o, i ) {
                                            var u, p, g, v, C, w;
                                            for ( t.isLeft( e ) ? ( u = e, p = null ) : ( p = e, u = null );; ) {
                                                if ( g = null, v = null, C = null, w = null, null !== m ) return; // If early exit already triggered.
                                                if ( null === o ) return void a( u || p )(); // If no more parallel actions, complete.
                                                if ( o._3 !== n ) return; // If already resolved, skip.
                                                switch ( o.tag ) {
                                                    case l: // ParMap: apply function to result.
                                                        null === u ? ( o._3 = t.right( o._1( t.fromRight( p ) ) ), p = o._3 ) : o._3 = u;
                                                        break;
                                                    case s: // ParApply: combine results.
                                                        if ( g = o._1._3, v = o._2._3, u ) { // If an error occurred.
                                                            if ( o._3 = u, C = !0, w = c++, f[w] = h( D, u === g ? o._2 : o._1, function() { return function() { delete f[w], C ? C = !1 : null === i ? r( u, null, null ) : r( u, i._1, i._2 ) } } ), C ) return void( C = !1 )
                                                        } else { // If both succeeded.
                                                            if ( g === n || v === n ) return; // If not both results are available.
                                                            p = t.right( t.fromRight( g )( t.fromRight( v ) ) ), o._3 = p
                                                        }
                                                        break;
                                                    case d: // ParAlt: pick first successful result or combine errors.
                                                        if ( g = o._1._3, v = o._2._3, g === n && t.isLeft( v ) || v === n && t.isLeft( g ) ) return;
                                                        if ( g !== n && t.isLeft( g ) && v !== n && t.isLeft( v ) ) u = p === g ? v : g, p = null, o._3 = u;
                                                        else if ( o._3 = p, C = !0, w = c++, f[w] = h( D, p === g ? o._2 : o._1, function() { return function() { delete f[w], C ? C = !1 : null === i ? r( p, null, null ) : r( p, i._1, i._2 ) } } ), C ) return void( C = !1 )
                                                }
                                                null === i ? o = null : ( o = i._1, i = i._2 ) // Move to next parallel action.
                                            }
                                        }( e, r._2._1, r._2._2 )
                                }
                            }
                        }

                        return function() {
                            var a, o, c = F,
                                f = e,
                                D = null,
                                m = null;
                            n: for (;;) // Traverse the parallel action tree to fork fibers.
                                switch ( a = null, o = null, c ) {
                                    case F: // Process current node.
                                        switch ( f.tag ) {
                                            case l: // ParMap: push `ParMap` node onto stack.
                                                D && ( m = new C( p, D, m ) ), D = new C( l, f._1, n, n ), f = f._2;
                                                break;
                                            case s: // ParApply: push `ParApply` node onto stack.
                                                D && ( m = new C( p, D, m ) ), D = new C( s, n, f._2, n ), f = f._1;
                                                break;
                                            case d: // ParAlt: push `ParAlt` node onto stack.
                                                D && ( m = new C( p, D, m ) ), D = new C( d, n, f._2, n ), f = f._1;
                                                break;
                                            default: // Base case: fork the fiber.
                                                o = i++, c = T, a = f, f = new C( v, o, new C( p, D, m ), n ), ( a = B( t, r, a ) ).onComplete( { rethrow: !1, handler: w( f ) } )(), u[o] = a, r && r.register( a )
                                        }
                                        break;
                                    case T: // Pop from stack and continue.
                                        if ( null === D ) break n;
                                        D._1 === n ? ( D._1 = f, c = F, f = D._2, D._2 = n ) : ( D._2 = f, f = D, null === m ? D = null : ( D = m._1, m = m._2 ) )
                                }
                            for ( g = f, o = 0; o < i; o++ ) u[o].run() // Run all forked fibers.
                        }(),
                        function( n ) {
                            return new C( o, function( r ) {
                                return function() {
                                    return function( n, r ) {
                                        var e;
                                        for ( var a in m = t.left( n ), f ) // Set early exit error and trigger cleanup.
                                            if ( f.hasOwnProperty( a ) )
                                                for ( a in e = f[a] ) e.hasOwnProperty( a ) && e[a]();
                                        f = null;
                                        var i = h( n, g, r ); // Kill remaining fibers.
                                        return function( n ) {
                                            return new C( o, function( n ) {
                                                return function() {
                                                    for ( var n in i ) i.hasOwnProperty( n ) && i[n]();
                                                    return y
                                                }
                                            } )
                                        }
                                    }( n, r )
                                }
                            } )
                        }
                    }

                    // `k`: Interprets a `Sequential` action by delegating to `U`.
                    function k( n, t, r ) {
                        return new C( o, function( e ) {
                            return function() {
                                return U( n, t, r, e )
                            }
                        } )
                    }

                    // Export all internal constructors and helpers.
                    return C.EMPTY = n,
                        C.Pure = w( t ),
                        C.Throw = w( r ),
                        C.Catch = w( e ),
                        C.Sync = w( a ),
                        C.Async = w( o ),
                        C.Bind = w( i ),
                        C.Bracket = w( u ),
                        C.Fork = w( c ),
                        C.Seq = w( f ),
                        C.ParMap = w( l ),
                        C.ParApply = w( s ),
                        C.ParAlt = w( d ),
                        C.Fiber = B,
                        C.Supervisor = function( n ) {
                            var t = {},
                                r = 0,
                                e = 0;
                            return {
                                register: function( n ) {
                                    var a = r++;
                                    n.onComplete( { rethrow: !0, handler: function( n ) { return function() { e--, delete t[a] } } } ), t[a] = n, e++
                                },
                                isEmpty: function() { return 0 === e },
                                killAll: function( o, i ) {
                                    return function() {
                                        var u = 0,
                                            c = {};

                                        function f( r ) {
                                            c[r] = t[r].kill( o, function( t ) {
                                                return function() {
                                                    delete c[r], u--, n.isLeft( t ) && n.fromLeft( t ) && setTimeout( function() { throw n.fromLeft( t ) }, 0 ), 0 === u && i()
                                                }
                                            } )()
                                        }
                                        for ( var l in t ) t.hasOwnProperty( l ) && ( u++, f( l ) );
                                        return t = {}, r = 0, e = 0,
                                            function( n ) {
                                                return new C( a, function() {
                                                    for ( var n in c ) c.hasOwnProperty( n ) && c[n]()
                                                } )
                                            }
                                    }
                                }
                            }
                        },
                        C.Scheduler = b,
                        C.nonCanceler = y,
                        C
                }();
            n._pure = t.Pure;
            n._map = function( n ) {
                return function( r ) {
                    return r.tag === t.Pure.tag ? t.Pure( n( r._1 ) ) : t.Bind( r, function( r ) { return t.Pure( n( r ) ) } )
                }
            };
            n._bind = function( n ) { return function( r ) { return t.Bind( n, r ) } };
            n._liftEffect = t.Sync;
            n._parAffMap = function( n ) { return function( r ) { return t.ParMap( n, r ) } };
            n._parAffApply = function( n ) { return function( r ) { return t.ParApply( n, r ) } };
            n.makeAff = t.Async;
            n._makeFiber = function( n, r ) { return function() { return t.Fiber( n, null, r ) } };
            n._sequential = t.Seq
        }( n["Effect.Aff"] = n["Effect.Aff"] || {} );

        /* --- Effect.Exception module (raw JS ops) --- */
        ! function( n ) {
            "use strict";
            n.error = function( n ) { return new Error( n ) }; // Create a new Error object.
            n.throwException = function( n ) { return function() { throw n } } // Throw a given exception.
        }( n["Effect.Exception"] = n["Effect.Exception"] || {} );

        /* --- Effect.Exception module (throw export) --- */
        ! function( t ) {
            "use strict";
            var r = n["Effect.Exception"]; // Import raw Exception ops.
            n["Control.Applicative"], n["Control.Semigroupoid"], n["Data.Either"], n["Data.Functor"], n["Data.Maybe"], n["Data.Show"], n.Effect, n.Prelude;
            t.throw = function( n ) { return r.throwException( r.error( n ) ) } // Export `throw` as an Aff action.
        }( n["Effect.Exception"] = n["Effect.Exception"] || {} );

        /* --- Effect.Aff module (Aff instances and combinators) --- */
        ! function( t ) {
            "use strict";
            var r = n["Effect.Aff"], // Import core Aff functions.
                e = ( n["Control.Alt"], n["Control.Alternative"], n["Control.Applicative"] ), // Import `Control.Applicative`.
                a = n["Control.Apply"], // Import `Control.Apply`.
                o = n["Control.Bind"], // Import `Control.Bind`.
                i = ( n["Control.Lazy"], n["Control.Monad"] ), // Import `Control.Monad`.
                u = ( n["Control.Monad.Error.Class"], n["Control.Monad.Rec.Class"], n["Control.Parallel"] ), // Import `Control.Parallel`.
                c = n["Control.Parallel.Class"], // Import `Control.Parallel.Class`.
                f = ( n["Control.Plus"], n["Control.Semigroupoid"], n["Data.Either"] ), // Import `Data.Either`.
                l = n["Data.Foldable"], // Import `Data.Foldable`.
                s = n["Data.Function"], // Import `Data.Function`.
                d = ( n["Data.Function.Uncurried"], n["Data.Functor"] ), // Import `Data.Functor`.
                p = n["Data.Monoid"], // Import `Data.Monoid`.
                D = ( n["Data.Newtype"], n["Data.Semigroup"] ), // Import `Data.Semigroup`.
                m = ( n["Data.Time.Duration"], n["Data.Unit"] ), // Import `Data.Unit`.
                g = n.Effect, // Import `Effect`.
                h = n["Effect.Class"], // Import `Effect.Class`.
                v = ( n["Effect.Exception"], n["Effect.Unsafe"], n["Partial.Unsafe"] ), // Import `Partial.Unsafe`.
                C = ( n.Prelude, n["Unsafe.Coerce"] ), // Import `Unsafe.Coerce`.
                w = new d.Functor( r._parAffMap ), // `functorParAff`: Functor instance for ParAff.
                y = new d.Functor( r._map ), // `functorAff`: Functor instance for Aff.
                E = {
                    isLeft: function( n ) {
                        if ( n instanceof f.Left ) return !0;
                        if ( n instanceof f.Right ) return !1;
                        throw new Error( "Failed pattern match at Effect.Aff (line 390, column 12 - line 392, column 20): " + [n.constructor.name] )
                    },
                    fromLeft: function( n ) {
                        if ( n instanceof f.Left ) return n.value0;
                        if ( n instanceof f.Right ) return v.unsafeCrashWith( "unsafeFromLeft: Right" );
                        throw new Error( "Failed pattern match at Effect.Aff (line 395, column 20 - line 399, column 3): " + [n.constructor.name] )
                    },
                    fromRight: function( n ) {
                        if ( n instanceof f.Right ) return n.value0;
                        if ( n instanceof f.Left ) return v.unsafeCrashWith( "unsafeFromRight: Left" );
                        throw new Error( "Failed pattern match at Effect.Aff (line 400, column 21 - line 402, column 31): " + [n.constructor.name] )
                    },
                    left: f.Left.create,
                    right: f.Right.create
                }, // Helper functions for Either in Aff.
                A = function( n ) { return function() { var t = function( n ) { return r._makeFiber( E, n ) }( n )(); return t.run(), t } }, // `launchAff`: Runs an Aff computation and returns a Fiber.
                S = new a.Apply( function() { return w }, r._parAffApply ), // `applyParAff`: Apply instance for ParAff.
                b = new i.Monad( function() { return M }, function() { return _ } ), // `monadAff`: Monad instance for Aff.
                _ = new o.Bind( function() { return F }, r._bind ), // `bindAff`: Bind instance for Aff.
                F = new a.Apply( function() { return y }, i.ap( b ) ), // `applyAff`: Apply instance for Aff.
                M = new e.Applicative( function() { return F }, r._pure ), // `applicativeAff`: Applicative instance for Aff.
                R = new h.MonadEffect( function() { return b }, r._liftEffect ), // `monadEffectAff`: MonadEffect instance for Aff.
                P = new c.Parallel( function() { return T }, function() { return b }, C.unsafeCoerce, r._sequential ), // `parallelAff`: Parallel instance for Aff.
                T = new e.Applicative( function() { return S }, function( n ) { return c.parallel( P )( e.pure( M )( n ) ) } ), // `applicativeParAff`: Applicative instance for ParAff.
                I = new D.Semigroup( function( n ) { return function( t ) { return function( r ) { return u.parSequence_( P )( l.foldableArray )( [n( r ), t( r )] ) } } } ), // `semigroupCanceler`: Semigroup instance for Cancelers.
                B = s.const( e.pure( M )( m.unit ) ), // `nonCanceler`: A Canceler that does nothing.
                U = new p.Monoid( function() { return I }, B ); // `monoidCanceler`: Monoid instance for Cancelers.
            t.launchAff = A;
            t.launchAff_ = function( n ) { return d.void( g.functorEffect )( A( n ) ) }; // `launchAff_`: Launches an Aff, discarding the Fiber.
            t.nonCanceler = B;
            t.functorAff = y;
            t.applyAff = F;
            t.applicativeAff = M;
            t.bindAff = _;
            t.monadAff = b;
            t.monadEffectAff = R;
            t.functorParAff = w;
            t.applyParAff = S;
            t.applicativeParAff = T;
            t.parallelAff = P;
            t.semigroupCanceler = I;
            t.monoidCanceler = U;
            t.makeAff = r.makeAff // Export `makeAff`.
        }( n["Effect.Aff"] = n["Effect.Aff"] || {} );

        /* --- Node.Encoding module --- */
        ! function( t ) {
            "use strict";
            n["Node.Encoding"];
            var r = n["Data.Show"], // Import `Data.Show`.
                e = ( n.Prelude, function() { function n() {} return n.value = new n, n }() ), // `ASCII` constructor.
                a = function() { function n() {} return n.value = new n, n }(), // `UTF8` constructor.
                o = function() { function n() {} return n.value = new n, n }(), // `UTF16LE` constructor.
                i = function() { function n() {} return n.value = new n, n }(), // `UCS2` constructor.
                u = function() { function n() {} return n.value = new n, n }(), // `Base64` constructor.
                c = function() { function n() {} return n.value = new n, n }(), // `Latin1` constructor.
                f = function() { function n() {} return n.value = new n, n }(), // `Binary` constructor.
                l = function() { function n() {} return n.value = new n, n }(), // `Hex` constructor.
                s = new r.Show( function( n ) {
                    if ( n instanceof e ) return "ASCII";
                    if ( n instanceof a ) return "UTF8";
                    if ( n instanceof o ) return "UTF16LE";
                    if ( n instanceof i ) return "UCS2";
                    if ( n instanceof u ) return "Base64";
                    if ( n instanceof c ) return "Latin1";
                    if ( n instanceof f ) return "Binary";
                    if ( n instanceof l ) return "Hex";
                    throw new Error( "Failed pattern match at Node.Encoding (line 19, column 1 - line 19, column 39): " + [n.constructor.name] )
                } ); // `showEncoding`: Show instance for Encoding.
            t.ASCII = e;
            t.UTF8 = a;
            t.UTF16LE = o;
            t.UCS2 = i;
            t.Base64 = u;
            t.Latin1 = c;
            t.Binary = f;
            t.Hex = l;
            t.encodingToNode = function( n ) {
                if ( n instanceof e ) return "ascii";
                if ( n instanceof a ) return "utf8";
                if ( n instanceof o ) return "utf16le";
                if ( n instanceof i ) return "ucs2";
                if ( n instanceof u ) return "base64";
                if ( n instanceof c ) return "latin1";
                if ( n instanceof f ) return "binary";
                if ( n instanceof l ) return "hex";
                throw new Error( "Failed pattern match at Node.Encoding (line 31, column 1 - line 31, column 37): " + [n.constructor.name] )
            }; // Converts custom encoding types to Node.js string representations.
            t.showEncoding = s
        }( n["Node.Encoding"] = n["Node.Encoding"] || {} );

        /* --- Node.Process module (process export) --- */
        ! function( t ) {
            "use strict";
            ( n["Node.Process"] = n["Node.Process"] || {} ).process = process // Export Node.js `process` global.
        }();

        /* --- Node.Stream module (raw JS ops) --- */
        ! function( n ) {
            "use strict";
            n.readChunkImpl = function( n ) {
                return function( t ) {
                    return function( r ) {
                        if ( r instanceof Buffer ) return t( r ); // If chunk is Buffer.
                        if ( "string" == typeof r ) return n( r ); // If chunk is string.
                        throw new Error( "Node.Stream.readChunkImpl: Unrecognised chunk type; expected String or Buffer, got: " + r )
                    }
                }
            };
            n.onDataEitherImpl = function( n ) {
                return function( t ) {
                    return function( r ) {
                        return function() {
                            t.on( "data", function( t ) { r( n( t ) )() } ) // Attach data event listener.
                        }
                    }
                }
            };
            n.onEnd = function( n ) { return function( t ) { return function() { n.on( "end", t ) } } }; // Attach end event listener.
            n.write = function( n ) { return function( t ) { return function( r ) { return function() { return n.write( t, null, r ) } } } }; // Write data to stream.
            n.writeStringImpl = function( n ) { return function( t ) { return function( r ) { return function( e ) { return function() { return n.write( r, t, e ) } } } } } // Write string to stream with encoding.
        }( n["Node.Stream"] = n["Node.Stream"] || {} );

        /* --- Node.Buffer module (toStringImpl) --- */
        ! function( t ) {
            "use strict";
            ( n["Node.Buffer"] = n["Node.Buffer"] || {} ).toStringImpl = function( n ) {
                return function( t ) {
                    return function() {
                        return t.toString( n ) // Convert Buffer to string with encoding.
                    }
                }
            }
        }();

        /* --- Node.Buffer module (toString export) --- */
        ! function( t ) {
            "use strict";
            var r = n["Node.Buffer"], // Import raw Buffer ops.
                e = ( n["Control.Semigroupoid"], n["Data.ArrayBuffer.Types"], n["Data.Maybe"], n["Data.Show"], n.Effect, n["Node.Encoding"] ); // Import `Node.Encoding`.
            n.Prelude;
            t.toString = function( n ) { return r.toStringImpl( e.encodingToNode( n ) ) } // Export `toString` for Buffer.
        }( n["Node.Buffer"] = n["Node.Buffer"] || {} );

        /* --- Node.Stream module (stream functions) --- */
        ! function( t ) {
            "use strict";
            var r = n["Node.Stream"], // Import raw Stream ops.
                e = n["Control.Applicative"], // Import `Control.Applicative`.
                a = n["Control.Bind"], // Import `Control.Bind`.
                o = n["Data.Either"], // Import `Data.Either`.
                i = ( n["Data.Functor"], n["Data.Maybe"], n["Data.Show"] ), // Import `Data.Show`.
                u = n.Effect, // Import `Effect`.
                c = n["Effect.Exception"], // Import `Effect.Exception`.
                f = n["Node.Buffer"], // Import `Node.Buffer`.
                l = n["Node.Encoding"], // Import `Node.Encoding`.
                s = ( n.Prelude, r.readChunkImpl( o.Left.create )( o.Right.create ) ), // `readChunkImpl` wrapped for Either.
                d = function( n ) { return function( t ) { return r.onDataEitherImpl( s )( n )( t ) } }, // `onDataEither`.
                p = function( n ) {
                    return function( t ) {
                        return d( n )( a.composeKleisliFlipped( u.bindEffect )( t )( function( n ) {
                            if ( n instanceof o.Left ) return c.throw( "Stream encoding should not be set" );
                            if ( n instanceof o.Right ) return e.pure( u.applicativeEffect )( n.value0 );
                            throw new Error( "Failed pattern match at Node.Stream (line 94, column 5 - line 98, column 17): " + [n.constructor.name] )
                        } ) )
                    }
                }; // `onData`.
            t.onData = p;
            t.onDataString = function( n ) {
                return function( t ) {
                    return function( r ) {
                        return p( n )( a.composeKleisliFlipped( u.bindEffect )( r )( f.toString( t ) ) )
                    }
                }
            }; // `onDataString`.
            t.onDataEither = d;
            t.writeString = function( n ) {
                return function( t ) {
                    return r.writeStringImpl( n )( i.show( l.showEncoding )( t ) )
                }
            }; // `writeString`.
            t.onEnd = r.onEnd
        }( n["Node.Stream"] = n["Node.Stream"] || {} );

        /* --- Node.Process module (stdin, stdout exports) --- */
        ! function( t ) {
            "use strict";
            var r = n["Node.Process"], // Import raw Process ops.
                e = ( n["Data.Functor"], n["Data.Maybe"], n["Data.Posix"], n["Data.Posix.Signal"], n.Effect, n["Foreign.Object"], n["Node.Platform"], n["Node.Stream"], n.Prelude, n["Unsafe.Coerce"], r.process.stdout ), // Node.js `stdout`.
                a = r.process.stdin; // Node.js `stdin`.
            t.stdin = a;
            t.stdout = e
        }( n["Node.Process"] = n["Node.Process"] || {} );

        /* --- DIVERTA2019B module (main application logic) --- */
        ! function( t ) {
            "use strict";
            var r = n["Control.Applicative"], // Import `Control.Applicative`.
                e = n["Control.Bind"], // Import `Control.Bind`.
                a = n["Control.Category"], // Import `Control.Category`.
                o = ( n["Control.Monad.ST"], n["Control.Monad.ST.Internal"] ), // Import `Control.Monad.ST.Internal`.
                i = ( n["Control.MonadZero"], n["Data.Array"] ), // Import `Data.Array`.
                u = n["Data.Either"], // Import `Data.Either`.
                c = ( n["Data.Eq"], n["Data.EuclideanRing"] ), // Import `Data.EuclideanRing`.
                f = n["Data.Functor"], // Import `Data.Functor`.
                l = ( n["Data.HeytingAlgebra"], n["Data.Int"] ), // Import `Data.Int`.
                s = n["Data.Maybe"], // Import `Data.Maybe`.
                d = n["Data.Monoid"], // Import `Data.Monoid`.
                p = n["Data.Ord"], // Import `Data.Ord`.
                D = ( n["Data.Ring"], n["Data.Semigroup"], n["Data.Semiring"] ), // Import `Data.Semiring`.
                m = n["Data.Show"], // Import `Data.Show`.
                g = ( n["Data.String"], n["Data.String.Common"] ), // Import `Data.String.Common`.
                h = ( n["Data.String.Pattern"], n["Data.Tuple"], n["Data.Unit"] ), // Import `Data.Unit`.
                v = n.Effect, // Import `Effect`.
                C = n["Effect.Aff"], // Import `Effect.Aff`.
                w = n["Effect.Class"], // Import `Effect.Class`.
                y = n["Effect.Ref"], // Import `Effect.Ref`.
                E = n["Node.Encoding"], // Import `Node.Encoding`.
                A = n["Node.Process"], // Import `Node.Process`.
                S = n["Node.Stream"], // Import `Node.Stream`.
                b = n["Partial.Unsafe"], // Import `Partial.Unsafe`.
                _ = ( n.Prelude, function( n ) { return g.split( " " )( n ) } ), // Helper to split string by space.
                F = function( n ) {
                    return u.either( function( n ) { return b.unsafeCrashWith( n ) } )( a.identity( a.categoryFn ) )( e.bind( u.bindEither )( u.note( "r g b n" )( 4 === ( t = i.mapMaybe( l.fromString )( _( g.trim( n ) ) ) ).length ? new s.Just( { r: t[0], g: t[1], b: t[2], n: t[3] } ) : s.Nothing.value ) )( function( n ) {
                        return r.pure( u.applicativeEither )( m.show( m.showInt )( ( t = n.r, function( n ) {
                            return function( e ) {
                                return function( a ) {
                                    return i = { value: 0 }, o.for( 0 )( p.min( p.ordInt )( 3e3 )( c.div( c.euclideanRingInt )( a )( t ) ) + 1 | 0 )( function( u ) {
                                        var l = t * u | 0;
                                        return o.for( 0 )( p.max( p.ordInt )( 0 )( p.min( p.ordInt )( 3e3 )( c.div( c.euclideanRingInt )( a - l | 0 )( n ) ) ) + 1 | 0 )( function( t ) {
                                            var u = n * t | 0;
                                            return ( l + u | 0 ) <= a && 0 === c.mod( c.euclideanRingInt )( a - ( l + u | 0 ) | 0 )( e ) ? f.void( o.functorST )( o.modify( D.add( D.semiringInt )( 1 ) )( i ) ) : r.pure( o.applicativeST )( h.unit )
                                        } )
                                    } )(), i.value;
                                    var i
                                }
                            }
                        } )( n.g )( n.b )( n.n ) ) + "\n" );
                        var t
                    } ) );
                    var t
                }, // The `solve` function: parses input, performs calculations, returns result.
                M = C.makeAff( function( n ) {
                    return function() {
                        var t = y.new( "" )(); // Create a mutable string reference.
                        return S.onDataString( A.stdin )( E.UTF8.value )( function( n ) {
                            return function() {
                                var r = y.read( t )(); // Read current content.
                                return y.write( r + n )( t )() // Append new data.
                            }
                        } )(),
                        S.onEnd( A.stdin )( function() {
                            var e = y.read( t )(); // Read final content.
                            return n( r.pure( u.applicativeEither )( e ) )() // Resolve Aff with the full input.
                        } )(),
                        d.mempty( C.monoidCanceler ) // Return a non-canceler.
                    }
                } ), // `M`: Aff action to read all stdin.
                R = C.launchAff_( e.bind( C.bindAff )( M )( function( n ) {
                    return e.bind( C.bindAff )( r.pure( C.applicativeAff )( F( n ) ) )( function( n ) {
                        return w.liftEffect( C.monadEffectAff )( ( t = n, f.void( v.functorEffect )( S.writeString( A.stdout )( E.UTF8.value )( t )( r.pure( v.applicativeEffect )( h.unit ) ) ) ) );
                        var t
                    } )
                } ) ); // `R`: Main program flow - read stdin, solve, write stdout.
            t.main = R; // Export `main`.
            t.solve = F // Export `solve`.
        }( n.DIVERTA2019B = n.DIVERTA2019B || {} ),
        n.DIVERTA2019B.main(); // Execute the main function of the DIVERTA2019B module.

    }, { /* Dependencies for Focm module. This object is empty, implying Focm is self-contained or its dependencies are resolved globally/via Parcel's `f` function. */
    }]

}, {}, ["Focm"], null) // End of parcelRequire call.