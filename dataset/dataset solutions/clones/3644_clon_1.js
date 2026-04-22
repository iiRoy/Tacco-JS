parcelRequire = function ( e , r, t, n ) {
// This is the main Parcel Require function definition.
// It handles module loading, caching, and execution.

    var i ; // Declaration for a variable, possibly used for error tracking.

    // Check if a global 'parcelRequire' function already exists.
    var o = "function" == typeof parcelRequire && parcelRequire ;

    // Check if a global 'require' function exists (common in Node.js environments).
    var u = "function" == typeof require && require ;


    // The core function 'f' responsible for loading and resolving modules.
    function f ( t, n ) {

        // Check if the module 't' is already in the cache 'r'.
        if ( !r[t] ) {

            // If the module is not in the bundled modules 'e'.
            if ( !e[t] ) {

                // Another check for a global 'parcelRequire' within this specific context.
                var i = "function" == typeof parcelRequire && parcelRequire ;

                // If 'n' is falsey (indicating it's not a local require call) and 'parcelRequire' exists.
                if ( !n && i ) {
                    return i( t, !0 ) ; // Use the global 'parcelRequire' to load the module.
                }

                // If the outer 'parcelRequire' ('o') exists.
                if ( o ) {
                    return o( t, !0 ) ; // Use the outer 'parcelRequire'.
                }

                // If a Node.js-style 'require' exists and the module 't' is a string.
                if ( u && "string" == typeof t ) {
                    return u( t ) ; // Use the Node.js 'require' function.
                }

                // If the module cannot be found by any means, throw an error.
                var c = new Error( "Cannot find module '" + t + "'" ) ;
                // Assign a standard error code for module not found.
                throw c.code = "MODULE_NOT_FOUND", c ;
            }

            // Define a 'resolve' function for the module's local 'require' context.
            p.resolve = function ( r ) {
                return e[t][1][r] || r ; // Resolve relative paths within the module or return the path as is.
            } ;

            // Initialize an empty cache object for the module's local 'require'.
            p.cache = {} ;

            // Create a new module instance and store it in the cache 'r'.
            var l = r[t] = new f.Module( t ) ;

            // Execute the module's code.
            // e[t][0] contains the module's factory function.
            // It's called with (exports, module, module.exports, global/this).
            e[t][0].call( l.exports, p, l, l.exports, this ) ;
        }
        // Return the exports of the loaded (or previously cached) module.
        return r[t].exports ;

        // The local 'require' function available inside each module.
        function p ( e ) {
            return f( p.resolve( e ) ) ; // Resolve the module path and then load it using the main 'f' function.
        }
    }

    // Set a flag indicating this function is a Parcel Require.
    f.isParcelRequire = !0 ;

    // Define the 'Module' constructor used internally by Parcel.
    f.Module = function ( e ) {
        this.id = e ; // The unique identifier of the module.
        this.bundle = f ; // A reference back to the main Parcel Require function.
        this.exports = {} ; // The object that will hold the module's exports.
    } ;

    // Store a reference to all bundled modules.
    f.modules = e ;

    // Store a reference to the module cache.
    f.cache = r ;

    // Store a reference to the parent 'parcelRequire' (if any).
    f.parent = o ;

    // Function to dynamically register new modules.
    f.register = function ( r, t ) {
        e[r] = [ function ( e, r ) {
            r.exports = t ;
        }, {} ] ;
    } ;

    // Iterate through the entry points 't' and attempt to load each one.
    for ( var c = 0 ; c < t.length ; c++ ) {
        try {
            f( t[c] ) ; // Load the current entry point.
        } catch ( e ) {
            i || ( i = e ) ; // If an error occurs, store the first one encountered.
        }
    }

    // If there are entry points.
    if ( t.length ) {

        // Get the exports of the very last entry point.
        var l = f( t[t.length - 1] ) ;

        // Handle different module export systems: CommonJS, AMD, or global assignment.
        "object" == typeof exports && "undefined" != typeof module
            ? module.exports = l // CommonJS export.
            : "function" == typeof define && define.amd
                ? define( function () { return l ; } ) // AMD export.
                : n && ( this[n] = l ) ; // Assign to global scope if a global name 'n' is provided.
    }

    // Re-assign the global 'parcelRequire' to the current 'f' function.
    // If an error 'i' was caught during entry point loading, re-throw it.
    if ( parcelRequire = f, i ) {
        throw i ;
    }

    // Finally, return the main 'parcelRequire' function.
    return f ;

} ( {
    // This object contains all the bundled modules.
    // Each key is a module ID, and its value is an array:
    // [0] -> The module's factory function.
    // [1] -> A mapping for resolved paths (if any).

    "Focm" : [ function ( require, module, exports ) { // Definition for the module "Focm".

        // 'n' is a local object that will accumulate exports from various sub-modules.
        var n = {} ;

        // Immediately Invoked Function Expression (IIFE) for "Control.Apply".
        !function ( t ) {
            "use strict" ;
            // Initialize 'n["Control.Apply"]' if it doesn't exist, then define 'arrayApply'.
            ( n["Control.Apply"] = n["Control.Apply"] || {} ).arrayApply = function ( n ) {
                return function ( t ) { // This inner function takes an array 't' of arguments.
                    // 'r' stores the number of functions to apply.
                    // 'e' stores the number of arguments to apply to.
                    // 'a' is the result array, pre-allocated for efficiency.
                    var r = n.length, e = t.length, a = new Array( r * e ), o = 0 ;
                    // Loop through each function in 'n'.
                    for ( var i = 0 ; i < r ; i++ ) {
                        var u = n[i] ; // Current function to apply.
                        // Loop through each argument in 't'.
                        for ( var c = 0 ; c < e ; c++ ) {
                            a[o++] = u( t[c] ) ; // Apply the function to the argument and store the result.
                        }
                    }
                    return a ; // Return the array of all results.
                } ;
            } ;
        } () , // End of Control.Apply IIFE.

        // IIFE for "Control.Semigroupoid".
        function ( n ) {
            "use strict" ;
            // Define a constructor 't' for Semigroupoid, which has a 'compose' method.
            var t = function ( n ) { this.compose = n } ;
            // Create an instance 'r' of Semigroupoid for function composition.
            var r = new t( function ( n ) {
                return function ( t ) {
                    return function ( r ) {
                        return n( t( r ) ) ; // Standard function composition: f(g(x)).
                    } ;
                } ;
            } ) ;
            // Export the 'compose' function from the instance.
            n.compose = function ( n ) { return n.compose } ;
            // Export the Semigroupoid constructor.
            n.Semigroupoid = t ;
            // Export the function composition instance.
            n.semigroupoidFn = r ;
        } ( n["Control.Semigroupoid"] = n["Control.Semigroupoid"] || {} ) , // End of Control.Semigroupoid IIFE.

        // IIFE for "Control.Category".
        function ( t ) {
            "use strict" ;
            // Import 'r' from "Control.Semigroupoid".
            var r = n["Control.Semigroupoid"] ;
            // Define a constructor 'e' for Category, which has 'Semigroupoid0' and 'identity'.
            var e = function ( n, t ) { this.Semigroupoid0 = n, this.identity = t } ;
            // Create an instance 'a' for the function category.
            var a = new e( function () { return r.semigroupoidFn }, function ( n ) { return n } ) ;
            // Export the Category constructor.
            t.Category = e ;
            // Export the 'identity' function.
            t.identity = function ( n ) { return n.identity } ;
            // Export the function category instance.
            t.categoryFn = a ;
        } ( n["Control.Category"] = n["Control.Category"] || {} ) , // End of Control.Category IIFE.

        // IIFE for "Data.Eq" (defining 'refEq').
        function ( t ) {
            "use strict" ;
            // Define 'refEq' for performing strict equality checks (===).
            ( n["Data.Eq"] = n["Data.Eq"] || {} ).refEq = function ( n ) {
                return function ( t ) {
                    return n === t ; // Returns true if 'n' and 't' are strictly equal.
                } ;
            } ;
        } () , // End of Data.Eq (refEq) IIFE.

        // IIFE for "Data.Unit" (defining 'unit').
        function ( t ) {
            "use strict" ;
            // Define 'unit' as an empty object, representing the Unit type.
            ( n["Data.Unit"] = n["Data.Unit"] || {} ).unit = {} ;
        } () , // End of Data.Unit IIFE.

        // IIFE for "Data.Show" (defining 'showIntImpl').
        function ( t ) {
            "use strict" ;
            // Define 'showIntImpl' to convert an integer to its string representation.
            ( n["Data.Show"] = n["Data.Show"] || {} ).showIntImpl = function ( n ) {
                return n.toString() ; // Uses the native 'toString' method of numbers.
            } ;
        } () , // End of Data.Show (showIntImpl) IIFE.

        // IIFE for "Data.Show" (defining 'Show', 'show', 'showInt').
        function ( t ) {
            "use strict" ;
            // Import 'r' (showIntImpl) from "Data.Show".
            var r = n["Data.Show"] ;
            // Unused imports: Data.Symbol, Record.Unsafe, Type.Data.RowList.
            var e = ( n["Data.Symbol"], n["Record.Unsafe"], n["Type.Data.RowList"],
                function ( n ) { this.show = n } ) ; // Define the 'Show' constructor.
            // Create an instance 'a' of 'Show' for integers, using 'showIntImpl'.
            var a = new e( r.showIntImpl ) ;
            // Export the 'Show' constructor.
            t.Show = e ;
            // Export the 'show' function, which extracts the 'show' method from a 'Show' instance.
            t.show = function ( n ) { return n.show } ;
            // Export the 'showInt' instance.
            t.showInt = a ;
        } ( n["Data.Show"] = n["Data.Show"] || {} ) , // End of Data.Show IIFE.

        // IIFE for "Data.Unit" (re-exporting 'unit').
        function ( t ) {
            "use strict" ;
            // Import 'r' from "Data.Unit".
            var r = n["Data.Unit"] ;
            // Unused import: Data.Show.
            n["Data.Show"] ;
            // Re-export 'unit'.
            t.unit = r.unit ;
        } ( n["Data.Unit"] = n["Data.Unit"] || {} ) , // End of Data.Unit (re-export) IIFE.

        // IIFE for "Data.Eq" (defining 'Eq', 'eq', 'eqInt').
        function ( t ) {
            "use strict" ;
            // Import 'r' (refEq) from "Data.Eq".
            var r = n["Data.Eq"] ;
            // Unused imports: HeytingAlgebra, Symbol, Unit, Void, Record.Unsafe, Type.Data.RowList.
            var e = ( n["Data.HeytingAlgebra"], n["Data.Symbol"], n["Data.Unit"], n["Data.Void"], n["Record.Unsafe"], n["Type.Data.RowList"],
                function ( n ) { this.eq = n } ) ; // Define the 'Eq' constructor.
            // Create an instance 'a' of 'Eq' for integers, using 'refEq'.
            var a = new e( r.refEq ) ;
            // Export the 'Eq' constructor.
            t.Eq = e ;
            // Export the 'eq' function, which extracts the 'eq' method from an 'Eq' instance.
            t.eq = function ( n ) { return n.eq } ;
            // Export the 'eqInt' instance.
            t.eqInt = a ;
        } ( n["Data.Eq"] = n["Data.Eq"] || {} ) , // End of Data.Eq IIFE.

        // IIFE for "Data.Ord.Unsafe" (defining 'unsafeCompareImpl').
        function ( t ) {
            "use strict" ;
            // Define 'unsafeCompareImpl', a low-level comparison function.
            ( n["Data.Ord.Unsafe"] = n["Data.Ord.Unsafe"] || {} ).unsafeCompareImpl = function ( n ) {
                return function ( t ) {
                    return function ( r ) {
                        return function ( e ) {
                            return function ( a ) {
                                // Compares 'e' and 'a'. Returns 'n' if e < a, 't' if e === a, 'r' if e > a.
                                return e < a ? n : e === a ? t : r ;
                            } ;
                        } ;
                    } ;
                } ;
            } ;
        } () , // End of Data.Ord.Unsafe (unsafeCompareImpl) IIFE.

        // IIFE for "Data.Semigroup" (defining 'Semigroup', 'append').
        function ( t ) {
            "use strict" ;
            // Unused imports: Semigroup, Symbol, Unit, Void, Record.Unsafe, Type.Data.RowList.
            n["Data.Semigroup"], n["Data.Symbol"], n["Data.Unit"], n["Data.Void"], n["Record.Unsafe"], n["Type.Data.RowList"] ;
            // Define the 'Semigroup' constructor, which has an 'append' method.
            t.Semigroup = function ( n ) { this.append = n } ;
            // Export the 'append' function, which extracts the 'append' method from a 'Semigroup' instance.
            t.append = function ( n ) { return n.append } ;
        } ( n["Data.Semigroup"] = n["Data.Semigroup"] || {} ) , // End of Data.Semigroup IIFE.

        // IIFE for "Data.Ordering" (defining 'LT', 'GT', 'EQ').
        function ( t ) {
            "use strict" ;
            // Unused imports: Eq, Semigroup, Show.
            n["Data.Eq"], n["Data.Semigroup"], n["Data.Show"] ;
            // Define 'LT' (Less Than) as a singleton object.
            var r = function () { function n () {} return n.value = new n, n } () ;
            // Define 'GT' (Greater Than) as a singleton object.
            var e = function () { function n () {} return n.value = new n, n } () ;
            // Define 'EQ' (Equal) as a singleton object.
            var a = function () { function n () {} return n.value = new n, n } () ;
            // Export the 'LT', 'GT', 'EQ' singletons.
            t.LT = r ;
            t.GT = e ;
            t.EQ = a ;
        } ( n["Data.Ordering"] = n["Data.Ordering"] || {} ) , // End of Data.Ordering IIFE.

        // IIFE for "Data.Ord.Unsafe" (defining 'unsafeCompare').
        function ( t ) {
            "use strict" ;
            // Import 'r' (unsafeCompareImpl) from "Data.Ord.Unsafe".
            var r = n["Data.Ord.Unsafe"] ;
            // Import 'e' (LT, EQ, GT) from "Data.Ordering".
            var e = n["Data.Ordering"] ;
            // Create the 'unsafeCompare' function by applying the ordering singletons to 'unsafeCompareImpl'.
            var a = r.unsafeCompareImpl( e.LT.value )( e.EQ.value )( e.GT.value ) ;
            // Export 'unsafeCompare'.
            t.unsafeCompare = a ;
        } ( n["Data.Ord.Unsafe"] = n["Data.Ord.Unsafe"] || {} ) , // End of Data.Ord.Unsafe (unsafeCompare) IIFE.

        // IIFE for "Data.Semiring" (defining 'intAdd', 'intMul').
        function ( n ) {
            "use strict" ;
            // Define 'intAdd' for integer addition (using bitwise OR 0 for 32-bit integer conversion).
            n.intAdd = function ( n ) { return function ( t ) { return n + t | 0 } } ;
            // Define 'intMul' for integer multiplication (using bitwise OR 0 for 32-bit integer conversion).
            n.intMul = function ( n ) { return function ( t ) { return n * t | 0 } } ;
        } ( n["Data.Semiring"] = n["Data.Semiring"] || {} ) , // End of Data.Semiring (intAdd, intMul) IIFE.

        // IIFE for "Data.Semiring" (defining 'Semiring', 'add', 'mul', 'one', 'zero', 'semiringInt').
        function ( t ) {
            "use strict" ;
            // Import 'r' (intAdd, intMul) from "Data.Semiring".
            var r = n["Data.Semiring"] ;
            // Unused imports: Symbol, Unit, Record.Unsafe, Type.Data.Row, Type.Data.RowList.
            var e = ( n["Data.Symbol"], n["Data.Unit"], n["Record.Unsafe"], n["Type.Data.Row"], n["Type.Data.RowList"],
                function ( n, t, r, e ) { this.add = n, this.mul = t, this.one = r, this.zero = e } ) ; // Define the 'Semiring' constructor.
            // Create an instance 'a' of 'Semiring' for integers.
            // It uses 'intAdd', 'intMul', 1 for 'one', and 0 for 'zero'.
            var a = new e( r.intAdd, r.intMul, 1, 0 ) ;
            // Export the 'Semiring' constructor.
            t.Semiring = e ;
            // Export the 'add' function.
            t.add = function ( n ) { return n.add } ;
            // Export the 'zero' function.
            t.zero = function ( n ) { return n.zero } ;
            // Export the 'mul' function.
            t.mul = function ( n ) { return n.mul } ;
            // Export the 'one' function.
            t.one = function ( n ) { return n.one } ;
            // Export the 'semiringInt' instance.
            t.semiringInt = a ;
        } ( n["Data.Semiring"] = n["Data.Semiring"] || {} ) , // End of Data.Semiring IIFE.

        // IIFE for "Data.Ord" (defining 'Ord', 'compare', 'min', 'ordInt').
        function ( t ) {
            "use strict" ;
            // Unused import: Data.Ord.
            n["Data.Ord"] ;
            // Import 'r' (eqInt) from "Data.Eq".
            var r = n["Data.Eq"] ;
            // Import 'e' (unsafeCompare) from "Data.Ord.Unsafe".
            var e = n["Data.Ord.Unsafe"] ;
            // Import 'a' (LT, EQ, GT) from "Data.Ordering".
            var a = n["Data.Ordering"] ;
            // Unused imports: Ring, Semiring, Symbol, Unit, Void, Record.Unsafe, Type.Data.RowList.
            var o = ( n["Data.Ring"], n["Data.Semiring"], n["Data.Symbol"], n["Data.Unit"], n["Data.Void"], n["Record.Unsafe"], n["Type.Data.RowList"],
                function ( n, t ) { this.Eq0 = n, this.compare = t } ) ; // Define the 'Ord' constructor.
            // Create an instance 'i' of 'Ord' for integers.
            var i = new o( function () { return r.eqInt }, e.unsafeCompare ) ;
            // Helper function 'u' to extract the 'compare' method from an 'Ord' instance.
            var u = function ( n ) { return n.compare } ;
            // Export the 'Ord' constructor.
            t.Ord = o ;
            // Export the 'compare' function.
            t.compare = u ;
            // Export the 'min' function, which returns the smaller of two values.
            t.min = function ( n ) {
                return function ( t ) {
                    return function ( r ) {
                        var e = u( n )( t )( r ) ; // Compare 't' and 'r' using the provided 'Ord' instance.
                        if ( e instanceof a.LT ) {
                            return t ; // If 't' is less than 'r', return 't'.
                        }
                        if ( e instanceof a.EQ ) {
                            return t ; // If 't' is equal to 'r', return 't'.
                        }
                        if ( e instanceof a.GT ) {
                            return r ; // If 't' is greater than 'r', return 'r'.
                        }
                        // This error should ideally not be reached if pattern matching is exhaustive.
                        throw new Error( "Failed pattern match at Data.Ord (line 119, column 3 - line 122, column 12): " + [ e.constructor.name ] ) ;
                    } ;
                } ;
            } ;
            // Export the 'ordInt' instance.
            t.ordInt = i ;
        } ( n["Data.Ord"] = n["Data.Ord"] || {} ) , // End of Data.Ord IIFE.

        // IIFE for "Data.Function" (defining 'flip', 'const').
        function ( t ) {
            "use strict" ;
            // Unused imports: Control.Category, Data.Boolean, Data.Ord, Data.Ring.
            n["Control.Category"], n["Data.Boolean"], n["Data.Ord"], n["Data.Ring"] ;
            // Define the 'flip' function, which swaps the first two arguments of a binary function.
            t.flip = function ( n ) {
                return function ( t ) {
                    return function ( r ) {
                        return n( r )( t ) ;
                    } ;
                } ;
            } ;
            // Define the 'const' function, which always returns its first argument, ignoring subsequent ones.
            t.const = function ( n ) {
                return function ( t ) {
                    return n ;
                } ;
            } ;
        } ( n["Data.Function"] = n["Data.Function"] || {} ) , // End of Data.Function IIFE.

        // IIFE for "Data.Functor" (defining 'arrayMap').
        function ( t ) {
            "use strict" ;
            // Define 'arrayMap' for mapping a function over an array.
            ( n["Data.Functor"] = n["Data.Functor"] || {} ).arrayMap = function ( n ) {
                return function ( t ) {
                    var r = t.length, e = new Array( r ), a = 0 ;
                    for ( ; a < r ; a++ ) {
                        e[a] = n( t[a] ) ; // Apply function 'n' to each element of array 't'.
                    }
                    return e ; // Return the new array with transformed elements.
                } ;
            } ;
        } () , // End of Data.Functor (arrayMap) IIFE.

        // IIFE for "Data.Functor" (defining 'Functor', 'map', 'void', 'functorArray').
        function ( t ) {
            "use strict" ;
            // Import 'r' (arrayMap) from "Data.Functor".
            var r = n["Data.Functor"] ;
            // Import 'e' (const) from "Data.Function", 'a' (unit) from "Data.Unit".
            var e = ( n["Control.Semigroupoid"], n["Data.Function"] ), a = n["Data.Unit"] ;
            // Define the 'Functor' constructor, which has a 'map' method.
            var o = function ( n ) { this.map = n } ;
            // Helper function 'i' to extract the 'map' method from a 'Functor' instance.
            var i = function ( n ) { return n.map } ;
            // Create an instance 'u' of 'Functor' for arrays, using 'arrayMap'.
            var u = new o( r.arrayMap ) ;
            // Export the 'Functor' constructor.
            t.Functor = o ;
            // Export the 'map' function.
            t.map = i ;
            // Export the 'void' function, which maps a functor to 'unit', discarding its original values.
            t.void = function ( n ) { return i( n )( e.const( a.unit ) ) } ;
            // Export the 'functorArray' instance.
            t.functorArray = u ;
        } ( n["Data.Functor"] = n["Data.Functor"] || {} ) , // End of Data.Functor IIFE.

        // IIFE for "Control.Apply" (defining 'Apply', 'apply', 'applySecond', 'applyArray').
        function ( t ) {
            "use strict" ;
            // Import 'r' (arrayApply) from "Control.Apply".
            var r = n["Control.Apply"] ;
            // Import 'e' (identity, categoryFn) from "Control.Category", 'a' (const) from "Data.Function", 'o' (map, functorArray) from "Data.Functor".
            var e = n["Control.Category"], a = n["Data.Function"], o = n["Data.Functor"] ;
            // Define the 'Apply' constructor, which has 'Functor0' (a Functor instance) and 'apply' method.
            var i = function ( n, t ) { this.Functor0 = n, this.apply = t } ;
            // Create an instance 'u' of 'Apply' for arrays.
            var u = new i( function () { return o.functorArray }, r.arrayApply ) ;
            // Helper function 'c' to extract the 'apply' method from an 'Apply' instance.
            var c = function ( n ) { return n.apply } ;
            // Export the 'Apply' constructor.
            t.Apply = i ;
            // Export the 'apply' function.
            t.apply = c ;
            // Export the 'applySecond' function, which applies a computation and then discards its result, keeping the result of the second computation.
            t.applySecond = function ( n ) {
                return function ( t ) {
                    return function ( r ) {
                        return c( n )( o.map( n.Functor0() )( a.const( e.identity( e.categoryFn ) ) )( t ) )( r ) ;
                    } ;
                } ;
            } ;
            // Export the 'applyArray' instance.
            t.applyArray = u ;
        } ( n["Control.Apply"] = n["Control.Apply"] || {} ) , // End of Control.Apply IIFE.

        // IIFE for "Control.Applicative" (defining 'Applicative', 'pure', 'liftA1', 'when').
        function ( t ) {
            "use strict" ;
            // Import 'r' (apply) from "Control.Apply".
            var r = n["Control.Apply"] ;
            // Import 'e' (unit) from "Data.Unit".
            var e = ( n["Data.Functor"], n["Data.Unit"] ) ;
            // Helper function 'a' to extract the 'pure' method from an 'Applicative' instance.
            var a = function ( n ) { return n.pure } ;
            // Define the 'Applicative' constructor, which has 'Apply0' (an Apply instance) and 'pure' method.
            t.Applicative = function ( n, t ) { this.Apply0 = n, this.pure = t } ;
            // Export the 'pure' function.
            t.pure = a ;
            // Export the 'liftA1' function, which lifts a unary function into an applicative context.
            t.liftA1 = function ( n ) {
                return function ( t ) {
                    return function ( e ) {
                        return r.apply( n.Apply0() )( a( n )( t ) )( e ) ;
                    } ;
                } ;
            } ;
            // Export the 'when' function, which conditionally executes an applicative action.
            t.when = function ( n ) {
                return function ( t ) {
                    return function ( r ) {
                        if ( t ) {
                            return r ; // If the condition 't' is true, execute 'r'.
                        }
                        if ( !t ) {
                            return a( n )( e.unit ) ; // If 't' is false, return 'pure unit'.
                        }
                        // Error for non-exhaustive pattern matching.
                        throw new Error( "Failed pattern match at Control.Applicative (line 57, column 1 - line 57, column 63): " + [ t.constructor.name, r.constructor.name ] ) ;
                    } ;
                } ;
            } ;
        } ( n["Control.Applicative"] = n["Control.Applicative"] || {} ) , // End of Control.Applicative IIFE.

        // IIFE for "Control.Bind" (defining 'arrayBind').
        function ( t ) {
            "use strict" ;
            // Define 'arrayBind' for binding over arrays, effectively flat-mapping.
            ( n["Control.Bind"] = n["Control.Bind"] || {} ).arrayBind = function ( n ) {
                return function ( t ) {
                    var r = [] ; // Initialize an empty result array.
                    for ( var e = 0, a = n.length ; e < a ; e++ ) {
                        // Apply function 't' to each element of 'n' and concatenate the results into 'r'.
                        Array.prototype.push.apply( r, t( n[e] ) ) ;
                    }
                    return r ; // Return the flattened array.
                } ;
            } ;
        } () , // End of Control.Bind (arrayBind) IIFE.

        // IIFE for "Control.Bind" (defining 'Bind', 'bind', 'bindFlipped', 'composeKleisliFlipped', 'bindArray').
        function ( t ) {
            "use strict" ;
            // Import 'r' (arrayBind) from "Control.Bind".
            var r = n["Control.Bind"] ;
            // Import 'e' (applyArray) from "Control.Apply", 'a' (flip) from "Data.Function".
            var e = ( n["Control.Applicative"], n["Control.Apply"] ), a = ( n["Control.Category"], n["Data.Function"] ) ;
            // Unused imports: Data.Functor, Data.Unit.
            var o = ( n["Data.Functor"], n["Data.Unit"],
                function ( n, t ) { this.Apply0 = n, this.bind = t } ) ; // Define the 'Bind' constructor.
            // Create an instance 'i' of 'Bind' for arrays.
            var i = new o( function () { return e.applyArray }, r.arrayBind ) ;
            // Helper function 'u' to extract the 'bind' method from a 'Bind' instance.
            var u = function ( n ) { return n.bind } ;
            // Define 'c' as 'bindFlipped', which is 'flip bind'.
            var c = function ( n ) { return a.flip( u( n ) ) } ;
            // Export the 'Bind' constructor.
            t.Bind = o ;
            // Export the 'bind' function.
            t.bind = u ;
            // Export the 'bindFlipped' function.
            t.bindFlipped = c ;
            // Export 'composeKleisliFlipped' for composing Kleisli arrows in a flipped order.
            t.composeKleisliFlipped = function ( n ) {
                return function ( t ) {
                    return function ( r ) {
                        return function ( e ) {
                            return c( n )( t )( r( e ) ) ;
                        } ;
                    } ;
                } ;
            } ;
            // Export the 'bindArray' instance.
            t.bindArray = i ;
        } ( n["Control.Bind"] = n["Control.Bind"] || {} ) , // End of Control.Bind IIFE.

        // IIFE for "Control.Monad.ST.Internal" (defining internal ST monad operations).
        function ( n ) {
            "use strict" ;
            // Define '_map' for the ST monad. It applies a function to the result of an ST computation.
            n.map_ = function ( n ) { return function ( t ) { return function () { return n( t() ) } } } ;
            // Define '_pure' for the ST monad. It creates an ST computation that immediately returns a value.
            n.pure_ = function ( n ) { return function () { return n } } ;
            // Define '_bind' for the ST monad. It sequences two ST computations.
            n.bind_ = function ( n ) { return function ( t ) { return function () { return t( n() )() } } } ;
            // Define 'for' as a looping construct within the ST monad.
            n.for = function ( n ) {
                return function ( t ) {
                    return function ( r ) {
                        return function () {
                            for ( var e = n ; e < t ; e++ ) {
                                r( e )() ; // Execute 'r' for each value 'e' in the range.
                            }
                        } ;
                    } ;
                } ;
            } ;
            // Define 'modify'' for updating the state within the ST monad.
            n["modify'"] = function ( n ) {
                return function ( t ) {
                    return function () {
                        var r = n( t.value ) ; // Apply 'n' to the current state value.
                        return t.value = r.state, r.value ; // Update the state and return the new value.
                    } ;
                } ;
            } ;
        } ( n["Control.Monad.ST.Internal"] = n["Control.Monad.ST.Internal"] || {} ) , // End of Control.Monad.ST.Internal IIFE.

        // IIFE for "Control.Monad" (defining 'Monad', 'ap').
        function ( t ) {
            "use strict" ;
            // Import 'r' (pure) from "Control.Applicative", 'e' (bind) from "Control.Bind".
            var r = n["Control.Applicative"], e = ( n["Control.Apply"], n["Control.Bind"] ) ;
            // Unused imports: Data.Functor, Data.Unit.
            n["Data.Functor"], n["Data.Unit"] ;
            // Define the 'Monad' constructor, which has 'Applicative0' and 'Bind1' instances.
            t.Monad = function ( n, t ) { this.Applicative0 = n, this.Bind1 = t } ;
            // Export the 'ap' function, which is a default implementation for Monads.
            t.ap = function ( n ) {
                return function ( t ) {
                    return function ( a ) {
                        return e.bind( n.Bind1() )( t )( function ( t ) {
                            return e.bind( n.Bind1() )( a )( function ( e ) {
                                return r.pure( n.Applicative0() )( t( e ) ) ;
                            } ) ;
                        } ) ;
                    } ;
                } ;
            } ;
        } ( n["Control.Monad"] = n["Control.Monad"] || {} ) , // End of Control.Monad IIFE.

        // IIFE for "Partial.Unsafe" (defining 'unsafePartial').
        function ( t ) {
            "use strict" ;
            // Define 'unsafePartial', which simply executes a thunk.
            // It bypasses the safety guarantees of a total language.
            ( n["Partial.Unsafe"] = n["Partial.Unsafe"] || {} ).unsafePartial = function ( n ) {
                return n() ; // Direct execution without checks.
            } ;
        } () , // End of Partial.Unsafe (unsafePartial) IIFE.

        // IIFE for "Partial" (defining 'crashWith').
        function ( t ) {
            "use strict" ;
            // Define 'crashWith', a function that throws an error.
            ( n["Partial"] = n["Partial"] || {} ).crashWith = function () {
                return function ( n ) {
                    throw new Error( n ) ; // Throws a JavaScript Error object.
                } ;
            } ;
        } () , // End of Partial (crashWith) IIFE.

        // IIFE for "Partial" (re-exporting 'crashWith').
        function ( t ) {
            "use strict" ;
            // Import 'r' (crashWith) from "Partial".
            var r = n.Partial ;
            // Re-export 'crashWith'.
            t.crashWith = r.crashWith ;
        } ( n.Partial = n.Partial || {} ) , // End of Partial (re-export) IIFE.

        // IIFE for "Partial.Unsafe" (defining 'unsafeCrashWith').
        function ( t ) {
            "use strict" ;
            // Import 'r' (unsafePartial) from "Partial.Unsafe", 'e' (crashWith) from "Partial".
            var r = n["Partial.Unsafe"], e = n.Partial ;
            // Define 'unsafeCrashWith', which uses 'unsafePartial' to call 'crashWith'.
            t.unsafeCrashWith = function ( n ) {
                return r.unsafePartial( function ( t ) {
                    return e.crashWith( t )( n ) ;
                } ) ;
            } ;
        } ( n["Partial.Unsafe"] = n["Partial.Unsafe"] || {} ) , // End of Partial.Unsafe (unsafeCrashWith) IIFE.

        // IIFE for "Control.Monad.ST.Internal" (defining ST monad instances and helper functions).
        function ( t ) {
            "use strict" ;
            // Import various modules and internal ST operations.
            var r = n["Control.Monad.ST.Internal"], e = n["Control.Applicative"], a = n["Control.Apply"], o = n["Control.Bind"], i = n["Control.Monad"] ;
            // Unused imports: Control.Monad.Rec.Class, Data.Unit, Partial.Unsafe, Prelude.
            // Create a Functor instance for ST.
            var u = ( n["Control.Monad.Rec.Class"], n["Data.Functor"] ),
                c = ( n["Data.Unit"], n["Partial.Unsafe"], n.Prelude, new u.Functor( r.map_ ) ) ;
            // Create a Monad instance for ST.
            var f = new i.Monad( function () { return d }, function () { return l } ) ;
            // Create a Bind instance for ST.
            var l = new o.Bind( function () { return s }, r.bind_ ) ;
            // Create an Apply instance for ST.
            var s = new a.Apply( function () { return c }, i.ap( f ) ) ;
            // Create an Applicative instance for ST.
            var d = new e.Applicative( function () { return s }, r.pure_ ) ;

            // Export 'modify' function for updating ST references.
            t.modify = function ( n ) {
                return r["modify'"]( function ( t ) {
                    var r = n( t ) ; // Apply the update function 'n' to the current state.
                    return { state : r, value : r } ; // Return the new state and value.
                } ) ;
            } ;
            // Export all ST monad instances.
            t.functorST = c ;
            t.applyST = s ;
            t.applicativeST = d ;
            t.bindST = l ;
            t.monadST = f ;
            // Export the 'for' loop helper.
            t.for = r.for ;
        } ( n["Control.Monad.ST.Internal"] = n["Control.Monad.ST.Internal"] || {} ) , // End of Control.Monad.ST.Internal IIFE.

        // IIFE for "Data.Array" (defining 'length', 'uncons'', 'slice').
        function ( n ) {
            "use strict" ;
            // Define 'length' to get the length of an array.
            n.length = function ( n ) { return n.length } ;
            // Define 'uncons'' to extract the head and tail of an array, or an empty object if empty.
            n["uncons'"] = function ( n ) {
                return function ( t ) {
                    return function ( r ) {
                        return 0 === r.length ? n( {} ) : t( r[0] )( r.slice( 1 ) ) ;
                    } ;
                } ;
            } ;
            // Define 'slice' to get a portion of an array.
            n.slice = function ( n ) {
                return function ( t ) {
                    return function ( r ) {
                        return r.slice( n, t ) ;
                    } ;
                } ;
            } ;
        } ( n["Data.Array"] = n["Data.Array"] || {} ) , // End of Data.Array (length, uncons', slice) IIFE.

        // IIFE for "Data.Foldable" (defining 'foldrArray', 'foldlArray').
        function ( n ) {
            "use strict" ;
            // Define 'foldrArray' for right-to-left folding over an array.
            n.foldrArray = function ( n ) {
                return function ( t ) {
                    return function ( r ) {
                        for ( var e = t, a = r.length - 1 ; a >= 0 ; a-- ) {
                            e = n( r[a] )( e ) ; // Apply 'n' from right to left.
                        }
                        return e ;
                    } ;
                } ;
            } ;
            // Define 'foldlArray' for left-to-right folding over an array.
            n.foldlArray = function ( n ) {
                return function ( t ) {
                    return function ( r ) {
                        for ( var e = t, a = r.length, o = 0 ; o < a ; o++ ) {
                            e = n( e )( r[o] ) ; // Apply 'n' from left to right.
                        }
                        return e ;
                    } ;
                } ;
            } ;
        } ( n["Data.Foldable"] = n["Data.Foldable"] || {} ) , // End of Data.Foldable (foldrArray, foldlArray) IIFE.

        // IIFE for "Data.Bounded" (defining 'topInt', 'bottomInt').
        function ( n ) {
            "use strict" ;
            // Define the maximum and minimum values for a 32-bit signed integer.
            n.topInt = 2147483647 ;
            n.bottomInt = -2147483648 ;
        } ( n["Data.Bounded"] = n["Data.Bounded"] || {} ) , // End of Data.Bounded (topInt, bottomInt) IIFE.

        // IIFE for "Data.Bounded" (defining 'Bounded', 'bottom', 'top', 'boundedInt').
        function ( t ) {
            "use strict" ;
            // Import 'r' (topInt, bottomInt) from "Data.Bounded", 'e' (ordInt) from "Data.Ord".
            var r = n["Data.Bounded"], e = n["Data.Ord"] ;
            // Unused imports: Data.Ordering, Data.Unit.
            var a = ( n["Data.Ordering"], n["Data.Unit"],
                function ( n, t, r ) { this.Ord0 = n, this.bottom = t, this.top = r } ) ; // Define the 'Bounded' constructor.
            // Create an instance 'o' of 'Bounded' for integers.
            var o = new a( function () { return e.ordInt }, r.bottomInt, r.topInt ) ;
            // Export the 'Bounded' constructor.
            t.Bounded = a ;
            // Export the 'bottom' function.
            t.bottom = function ( n ) { return n.bottom } ;
            // Export the 'top' function.
            t.top = function ( n ) { return n.top } ;
            // Export the 'boundedInt' instance.
            t.boundedInt = o ;
        } ( n["Data.Bounded"] = n["Data.Bounded"] || {} ) , // End of Data.Bounded IIFE.

        // IIFE for "Data.Monoid" (defining 'Monoid', 'mempty').
        function ( t ) {
            "use strict" ;
            // Unused imports: Boolean, Eq, EuclideanRing, Ord, Ordering, Semigroup, Symbol, Unit, Record.Unsafe, Type.Data.RowList.
            n["Data.Boolean"], n["Data.Eq"], n["Data.EuclideanRing"], n["Data.Ord"], n["Data.Ordering"], n["Data.Semigroup"], n["Data.Symbol"], n["Data.Unit"], n["Record.Unsafe"], n["Type.Data.RowList"] ;
            // Define the 'Monoid' constructor, which has 'Semigroup0' and 'mempty' methods.
            t.Monoid = function ( n, t ) { this.Semigroup0 = n, this.mempty = t } ;
            // Export the 'mempty' function.
            t.mempty = function ( n ) { return n.mempty } ;
        } ( n["Data.Monoid"] = n["Data.Monoid"] || {} ) , // End of Data.Monoid IIFE.

        // IIFE for "Data.Maybe" (defining 'Nothing', 'Just', 'maybe').
        function ( t ) {
            "use strict" ;
            // Unused imports: Alt, Alternative, Applicative, Apply, Bind, Category, Extend, Monad, MonadZero, Plus, Bounded, Eq, Function, Functor, Functor.Invariant, Monoid, Ord, Ordering, Semigroup, Show, Unit, Prelude.
            n["Control.Alt"], n["Control.Alternative"], n["Control.Applicative"], n["Control.Apply"], n["Control.Bind"], n["Control.Category"], n["Control.Extend"], n["Control.Monad"], n["Control.MonadZero"], n["Control.Plus"], n["Data.Bounded"], n["Data.Eq"], n["Data.Function"], n["Data.Functor"], n["Data.Functor.Invariant"], n["Data.Monoid"], n["Data.Ord"], n["Data.Ordering"], n["Data.Semigroup"], n["Data.Show"], n["Data.Unit"], n.Prelude ;
            // Define 'Nothing' as a singleton object.
            var r = function () { function n () {} return n.value = new n, n } () ;
            // Define 'Just' constructor.
            var e = function () { function n ( n ) { this.value0 = n } return n.create = function ( t ) { return new n( t ) }, n } () ;
            // Export 'Nothing' and 'Just'.
            t.Nothing = r ;
            t.Just = e ;
            // Export the 'maybe' function, which provides a default value for 'Nothing' and applies a function for 'Just'.
            t.maybe = function ( n ) {
                return function ( t ) {
                    return function ( a ) {
                        if ( a instanceof r ) {
                            return n ; // If it's 'Nothing', return the default value 'n'.
                        }
                        if ( a instanceof e ) {
                            return t( a.value0 ) ; // If it's 'Just', apply function 't' to its value.
                        }
                        // Error for non-exhaustive pattern matching.
                        throw new Error( "Failed pattern match at Data.Maybe (line 217, column 1 - line 217, column 51): " + [ n.constructor.name, t.constructor.name, a.constructor.name ] ) ;
                    } ;
                } ;
            } ;
        } ( n["Data.Maybe"] = n["Data.Maybe"] || {} ) , // End of Data.Maybe IIFE.

        // IIFE for "Data.Foldable" (defining 'Foldable', 'foldr', 'foldl', 'foldMap', 'foldMapDefaultR', 'traverse_', 'foldableArray').
        function ( t ) {
            "use strict" ;
            // Import various modules and internal folding operations.
            var r = n["Data.Foldable"], e = ( n["Control.Alt"], n["Control.Applicative"] ), a = n["Control.Apply"] ;
            // Unused imports: Control.Bind, Control.Category, Control.Plus, Control.Semigroupoid, Data.Eq, Data.Function, Data.Functor, Data.HeytingAlgebra, Data.Maybe, Data.Maybe.First, Data.Maybe.Last, Data.Monoid, Data.Monoid.Additive, Data.Monoid.Conj, Data.Monoid.Disj, Data.Monoid.Dual, Data.Monoid.Endo, Data.Monoid.Multiplicative, Data.Newtype, Data.Ord, Data.Ordering, Data.Semigroup, Data.Semiring, Data.Unit, Prelude.
            var o = ( n["Control.Bind"], n["Control.Category"], n["Control.Plus"], n["Control.Semigroupoid"], n["Data.Eq"], n["Data.Function"], n["Data.Functor"], n["Data.HeytingAlgebra"], n["Data.Maybe"], n["Data.Maybe.First"], n["Data.Maybe.Last"], n["Data.Monoid"] ) ;
            var i = ( n["Data.Monoid.Additive"], n["Data.Monoid.Conj"], n["Data.Monoid.Disj"], n["Data.Monoid.Dual"], n["Data.Monoid.Endo"], n["Data.Monoid.Multiplicative"], n["Data.Newtype"], n["Data.Ord"], n["Data.Ordering"], n["Data.Semigroup"] ) ;
            var u = ( n["Data.Semiring"], n["Data.Unit"] ) ;
            var c = ( n.Prelude, function ( n, t, r ) { this.foldMap = n, this.foldl = t, this.foldr = r } ) ; // Define the 'Foldable' constructor.
            // Helper function 'f' to extract the 'foldr' method.
            var f = function ( n ) { return n.foldr } ;
            // Define 'foldMapDefaultR', a default implementation for 'foldMap' using 'foldr'.
            var l = function ( n ) {
                return function ( t ) {
                    return function ( r ) {
                        return f( n )( function ( n ) { return function ( e ) { return i.append( t.Semigroup0() )( r( n ) )( e ) } } )( o.mempty( t ) ) ;
                    } ;
                } ;
            } ;
            // Create an instance 's' of 'Foldable' for arrays.
            var s = new c( function ( n ) { return l( s )( n ) }, r.foldlArray, r.foldrArray ) ;
            // Export the 'Foldable' constructor.
            t.Foldable = c ;
            // Export the 'foldr' function.
            t.foldr = f ;
            // Export the 'foldl' function.
            t.foldl = function ( n ) { return n.foldl } ;
            // Export the 'foldMap' function.
            t.foldMap = function ( n ) { return n.foldMap } ;
            // Export the 'foldMapDefaultR' function.
            t.foldMapDefaultR = l ;
            // Export the 'traverse_' function, which applies an applicative action to each element and discards the results.
            t.traverse_ = function ( n ) {
                return function ( t ) {
                    return function ( r ) {
                        return f( t )( function ( t ) {
                            return a.applySecond( n.Apply0() )( r( t ) ) ;
                        } )( e.pure( n )( u.unit ) ) ;
                    } ;
                } ;
            } ;
            // Export the 'foldableArray' instance.
            t.foldableArray = s ;
        } ( n["Data.Foldable"] = n["Data.Foldable"] || {} ) , // End of Data.Foldable IIFE.

        // IIFE for "Data.Tuple" (defining 'Tuple').
        function ( t ) {
            "use strict" ;
            // Unused imports: Applicative, Apply, Biapplicative, Biapply, Bind, Comonad, Extend, Lazy, Monad, Semigroupoid, Bifoldable, Bifunctor, Bitraversable, BooleanAlgebra, Bounded, CommutativeRing, Distributive, Eq, Foldable, FoldableWithIndex, Function, Functor, Functor.Invariant, FunctorWithIndex, HeytingAlgebra, Maybe, Maybe.First, Monoid, Newtype, Ord, Ordering, Ring, Semigroup, Semigroup.Foldable, Semigroup.Traversable, Semiring, Show, Traversable, TraversableWithIndex, Unit, Prelude, Type.Equality.
            n["Control.Applicative"], n["Control.Apply"], n["Control.Biapplicative"], n["Control.Biapply"], n["Control.Bind"], n["Control.Comonad"], n["Control.Extend"], n["Control.Lazy"], n["Control.Monad"], n["Control.Semigroupoid"], n["Data.Bifoldable"], n["Data.Bifunctor"], n["Data.Bitraversable"], n["Data.BooleanAlgebra"], n["Data.Bounded"], n["Data.CommutativeRing"], n["Data.Distributive"], n["Data.Eq"], n["Data.Foldable"], n["Data.FoldableWithIndex"], n["Data.Function"], n["Data.Functor"], n["Data.Functor.Invariant"], n["Data.FunctorWithIndex"], n["Data.HeytingAlgebra"], n["Data.Maybe"], n["Data.Maybe.First"], n["Data.Monoid"], n["Data.Newtype"], n["Data.Ord"], n["Data.Ordering"], n["Data.Ring"], n["Data.Semigroup"], n["Data.Semigroup.Foldable"], n["Data.Semigroup.Traversable"], n["Data.Semiring"], n["Data.Show"], n["Data.Traversable"], n["Data.TraversableWithIndex"], n["Data.Unit"], n.Prelude, n["Type.Equality"] ;
            // Define the 'Tuple' constructor.
            var r = function () { function n ( n, t ) { this.value0 = n, this.value1 = t } return n.create = function ( t ) { return function ( r ) { return new n( t, r ) } }, n } () ;
            // Export the 'Tuple' constructor.
            t.Tuple = r ;
        } ( n["Data.Tuple"] = n["Data.Tuple"] || {} ) , // End of Data.Tuple IIFE.

        // IIFE for "Unsafe.Coerce" (defining 'unsafeCoerce').
        function ( t ) {
            "use strict" ;
            // Define 'unsafeCoerce', which performs an unchecked type coercion.
            ( n["Unsafe.Coerce"] = n["Unsafe.Coerce"] || {} ).unsafeCoerce = function ( n ) {
                return n ; // Simply returns the input, effectively changing its perceived type.
            } ;
        } () , // End of Unsafe.Coerce (unsafeCoerce) IIFE.

        // IIFE for "Unsafe.Coerce" (re-exporting 'unsafeCoerce').
        function ( t ) {
            "use strict" ;
            // Import 'r' (unsafeCoerce) from "Unsafe.Coerce".
            var r = n["Unsafe.Coerce"] ;
            // Re-export 'unsafeCoerce'.
            t.unsafeCoerce = r.unsafeCoerce ;
        } ( n["Unsafe.Coerce"] = n["Unsafe.Coerce"] || {} ) , // End of Unsafe.Coerce (re-export) IIFE.

        // IIFE for "Data.Array" (defining 'singleton', 'uncons', 'concatMap', 'mapMaybe').
        function ( t ) {
            "use strict" ;
            // Import 'r' (uncons') from "Data.Array".
            var r = n["Data.Array"] ;
            // Import 'a' (const) from "Data.Function", 'o' (Nothing, Just) from "Data.Maybe".
            var e = ( n["Control.Alt"], n["Control.Alternative"], n["Control.Applicative"], n["Control.Apply"], n["Control.Bind"] ) ;
            var a = ( n["Control.Category"], n["Control.Lazy"], n["Control.Monad.Rec.Class"], n["Control.Monad.ST"], n["Control.Monad.ST.Internal"], n["Control.Semigroupoid"], n["Data.Array.NonEmpty.Internal"], n["Data.Array.ST"], n["Data.Array.ST.Iterator"], n["Data.Boolean"], n["Data.Eq"], n["Data.Foldable"], n["Data.Function"] ) ;
            var o = ( n["Data.Functor"], n["Data.HeytingAlgebra"], n["Data.Maybe"] ) ;
            // Unused imports: Ord, Ordering, Ring, Semigroup, Semiring, Traversable, Tuple, Unfoldable, Partial.Unsafe, Prelude, Unsafe.Coerce.
            // Define 'i' (uncons) using 'uncons'' and wrapping results in 'Maybe'.
            var i = ( n["Data.Ord"], n["Data.Ordering"], n["Data.Ring"], n["Data.Semigroup"], n["Data.Semiring"], n["Data.Traversable"], n["Data.Tuple"], n["Data.Unfoldable"], n["Partial.Unsafe"], n.Prelude, n["Unsafe.Coerce"],
                r["uncons'"]( a.const( o.Nothing.value ) )( function ( n ) { return function ( t ) { return new o.Just( { head : n, tail : t } ) } } ) ) ;
            // Define 'singleton' function, which creates an array with a single element.
            var u = function ( n ) { return [ n ] } ;
            // Define 'c' (concatMap) using flipped bind for arrays.
            var c = a.flip( e.bind( e.bindArray ) ) ;
            // Export 'singleton'.
            t.singleton = u ;
            // Export 'uncons'.
            t.uncons = i ;
            // Export 'concatMap'.
            t.concatMap = c ;
            // Export 'mapMaybe' function, which maps over an array and filters out 'Nothing' results.
            t.mapMaybe = function ( n ) {
                return c( function ( t ) {
                    return o.maybe( [] )( u )( n( t ) ) ; // Apply 'n', then convert Maybe to array (empty for Nothing, singleton for Just).
                } ) ;
            } ;
        } ( n["Data.Array"] = n["Data.Array"] || {} ) , // End of Data.Array IIFE.

        // IIFE for "Data.Either" (defining 'Left', 'Right', 'either', 'note', functor, apply, applicative, bind instances).
        function ( t ) {
            "use strict" ;
            // Unused import: Control.Alt.
            n["Control.Alt"] ;
            // Import various modules.
            var r = n["Control.Applicative"], e = n["Control.Apply"], a = n["Control.Bind"] ;
            // Unused imports: Control.Extend, Control.Monad, Control.Semigroupoid, Data.Bifoldable, Data.Bifunctor, Data.Bitraversable, Data.Bounded, Data.Eq, Data.Foldable, Data.FoldableWithIndex, Data.Function, Data.Functor, Data.Functor.Invariant, Data.FunctorWithIndex, Data.Maybe, Data.Monoid, Data.Ord, Data.Ordering, Data.Semigroup, Data.Show, Data.Traversable, Data.TraversableWithIndex, Data.Unit, Prelude.
            // Define 'Left' constructor.
            var o = ( n["Control.Extend"], n["Control.Monad"], n["Control.Semigroupoid"], n["Data.Bifoldable"], n["Data.Bifunctor"], n["Data.Bitraversable"], n["Data.Bounded"], n["Data.Eq"], n["Data.Foldable"], n["Data.FoldableWithIndex"], n["Data.Function"], n["Data.Functor"] ) ;
            var i = ( n["Data.Functor.Invariant"], n["Data.FunctorWithIndex"], n["Data.Maybe"] ) ;
            var u = ( n["Data.Monoid"], n["Data.Ord"], n["Data.Ordering"], n["Data.Semigroup"], n["Data.Show"], n["Data.Traversable"], n["Data.TraversableWithIndex"], n["Data.Unit"], n.Prelude,
                function () { function n ( n ) { this.value0 = n } return n.create = function ( t ) { return new n( t ) }, n } () ) ;
            // Define 'Right' constructor.
            var c = function () { function n ( n ) { this.value0 = n } return n.create = function ( t ) { return new n( t ) }, n } () ;
            // Create a Functor instance 'f' for 'Either'.
            var f = new o.Functor( function ( n ) {
                return function ( t ) {
                    if ( t instanceof u ) {
                        return new u( t.value0 ) ; // If Left, map does nothing, returns Left unchanged.
                    }
                    if ( t instanceof c ) {
                        return new c( n( t.value0 ) ) ; // If Right, apply 'n' to the value inside Right.
                    }
                    // Error for non-exhaustive pattern matching.
                    throw new Error( "Failed pattern match at Data.Either (line 38, column 8 - line 38, column 52): " + [ t.constructor.name ] ) ;
                } ;
            } ) ;
            // Define 'l' (the 'either' function), which handles 'Left' and 'Right' cases.
            var l = function ( n ) {
                return function ( t ) {
                    return function ( r ) {
                        if ( r instanceof u ) {
                            return n( r.value0 ) ; // If Left, apply 'n' to the Left value.
                        }
                        if ( r instanceof c ) {
                            return t( r.value0 ) ; // If Right, apply 't' to the Right value.
                        }
                        // Error for non-exhaustive pattern matching.
                        throw new Error( "Failed pattern match at Data.Either (line 238, column 1 - line 238, column 64): " + [ n.constructor.name, t.constructor.name, r.constructor.name ] ) ;
                    } ;
                } ;
            } ;
            // Create an Apply instance 's' for 'Either'.
            var s = new e.Apply( function () { return f }, function ( n ) {
                return function ( t ) {
                    if ( n instanceof u ) {
                        return new u( n.value0 ) ; // If Left, return Left unchanged.
                    }
                    if ( n instanceof c ) {
                        return o.map( f )( n.value0 )( t ) ; // If Right, apply 't' to the value inside Right.
                    }
                    // Error for non-exhaustive pattern matching.
                    throw new Error( "Failed pattern match at Data.Either (line 82, column 1 - line 82, column 41): " + [ n.constructor.name, t.constructor.name ] ) ;
                } ;
            } ) ;
            // Create a Bind instance 'd' for 'Either'.
            var d = new a.Bind( function () { return s }, l( function ( n ) { return function ( t ) { return new u( n ) } } )( function ( n ) { return function ( t ) { return t( n ) } } ) ) ;
            // Create an Applicative instance 'p' for 'Either'.
            var p = new r.Applicative( function () { return s }, c.create ) ;
            // Export 'Left' and 'Right' constructors.
            t.Left = u ;
            t.Right = c ;
            // Export the 'either' function.
            t.either = l ;
            // Export the 'note' function, which converts a 'Maybe' to an 'Either'.
            t.note = function ( n ) { return i.maybe( new u( n ) )( c.create ) } ;
            // Export 'Either' functor, apply, applicative, bind instances.
            t.functorEither = f ;
            t.applyEither = s ;
            t.applicativeEither = p ;
            t.bindEither = d ;
        } ( n["Data.Either"] = n["Data.Either"] || {} ) , // End of Data.Either IIFE.

        // IIFE for "Data.Int" (defining 'fromStringAsImpl', 'pow').
        function ( n ) {
            "use strict" ;
            // Define 'fromStringAsImpl' for parsing integers from strings with a given radix.
            n.fromStringAsImpl = function ( n ) {
                return function ( t ) {
                    return function ( r ) {
                        var e ;
                        // Determine the regular expression pattern based on the radix.
                        e = r < 11 ? "[0-" + ( r - 1 ).toString() + "]" : 11 === r ? "[0-9a]" : "[0-9a-" + String.fromCharCode( 86 + r ) + "]" ;
                        var a = new RegExp( "^[\\+\\-]?" + e + "+$", "i" ) ; // Create the regex.
                        return function ( e ) {
                            if ( a.test( e ) ) { // If the string matches the regex pattern.
                                var o = parseInt( e, r ) ; // Parse the integer with the specified radix.
                                return ( 0 | o ) === o ? n( o ) : t ; // If it's a valid 32-bit integer, apply 'n', otherwise 't'.
                            }
                            return t ; // If the string does not match the regex, apply 't'.
                        } ;
                    } ;
                } ;
            } ;
            // Define 'pow' for integer exponentiation (using bitwise OR 0 for 32-bit integer conversion).
            n.pow = function ( n ) { return function ( t ) { return 0 | Math.pow( n, t ) } } ;
        } ( n["Data.Int"] = n["Data.Int"] || {} ) , // End of Data.Int (fromStringAsImpl, pow) IIFE.

        // IIFE for "Data.Int" (defining 'fromString', 'fromStringAs', 'pow').
        function ( t ) {
            "use strict" ;
            // Import 'r' (fromStringAsImpl, pow) from "Data.Int".
            var r = n["Data.Int"] ;
            // Unused imports: Control.Category, Control.Semigroupoid, Data.Boolean, Data.Bounded, Data.CommutativeRing, Data.DivisionRing, Data.Eq, Data.EuclideanRing, Data.HeytingAlgebra, Data.Int.Bits, Data.Maybe.
            var e = ( n["Control.Category"], n["Control.Semigroupoid"], n["Data.Boolean"], n["Data.Bounded"], n["Data.CommutativeRing"], n["Data.DivisionRing"], n["Data.Eq"], n["Data.EuclideanRing"], n["Data.HeytingAlgebra"], n["Data.Int.Bits"], n["Data.Maybe"] ) ;
            // Imports for global objects like Math.
            var a = ( n["Data.Ord"], n["Data.Ordering"], n["Data.Ring"], n["Data.Semiring"], n["Data.Show"], n.Global, n.Math, n.Prelude,
                r.fromStringAsImpl( e.Just.create )( e.Nothing.value ) ) ; // Create a parsing function that returns a 'Maybe' integer.
            // Create a specific parser 'o' for base 10 integers.
            var o = a( 10 ) ;
            // Export 'fromString'.
            t.fromString = o ;
            // Export 'fromStringAs'.
            t.fromStringAs = a ;
            // Export 'pow'.
            t.pow = r.pow ;
        } ( n["Data.Int"] = n["Data.Int"] || {} ) , // End of Data.Int IIFE.

        // IIFE for "Data.String.Common" (defining 'split', 'trim').
        function ( n ) {
            "use strict" ;
            // Define 'split' function for strings.
            n.split = function ( n ) { return function ( t ) { return t.split( n ) } } ;
            // Define 'trim' function for strings.
            n.trim = function ( n ) { return n.trim() } ;
        } ( n["Data.String.Common"] = n["Data.String.Common"] || {} ) , // End of Data.String.Common (split, trim) IIFE.

        // IIFE for "Data.String.Common" (re-exporting 'split', 'trim').
        function ( t ) {
            "use strict" ;
            // Import 'r' (split, trim) from "Data.String.Common".
            var r = n["Data.String.Common"] ;
            // Unused imports: Data.Eq, Data.Ordering, Data.String.Pattern, Prelude.
            n["Data.Eq"], n["Data.Ordering"], n["Data.String.Pattern"], n.Prelude ;
            // Export 'split'.
            t.split = r.split ;
            // Export 'trim'.
            t.trim = r.trim ;
        } ( n["Data.String.Common"] = n["Data.String.Common"] || {} ) , // End of Data.String.Common (re-export) IIFE.

        // IIFE for "Effect" (defining 'pureE', 'bindE').
        function ( n ) {
            "use strict" ;
            // Define 'pureE' for the 'Effect' monad, which wraps a value in an effect.
            n.pureE = function ( n ) { return function () { return n } } ;
            // Define 'bindE' for the 'Effect' monad, for sequencing effects.
            n.bindE = function ( n ) { return function ( t ) { return function () { return t( n() )() } } } ;
        } ( n.Effect = n.Effect || {} ) , // End of Effect (pureE, bindE) IIFE.

        // IIFE for "Effect" (defining 'functorEffect', 'applyEffect', 'applicativeEffect', 'bindEffect', 'monadEffect').
        function ( t ) {
            "use strict" ;
            // Import necessary modules and internal Effect operations.
            var r = n.Effect, e = n["Control.Applicative"], a = n["Control.Apply"], o = n["Control.Bind"], i = n["Control.Monad"], u = n["Data.Functor"] ;
            // Unused imports: Data.Monoid, Data.Semigroup, Prelude.
            // Create a Monad instance 'c' for 'Effect'.
            var c = ( n["Data.Monoid"], n["Data.Semigroup"], n.Prelude, new i.Monad( function () { return s }, function () { return f } ) ) ;
            // Create a Bind instance 'f' for 'Effect'.
            var f = new o.Bind( function () { return l }, r.bindE ) ;
            // Create an Apply instance 'l' for 'Effect'.
            var l = new a.Apply( function () { return d }, i.ap( c ) ) ;
            // Create an Applicative instance 's' for 'Effect'.
            var s = new e.Applicative( function () { return l }, r.pureE ) ;
            // Create a Functor instance 'd' for 'Effect'.
            var d = new u.Functor( e.liftA1( s ) ) ;
            // Export all 'Effect' monad instances.
            t.functorEffect = d ;
            t.applyEffect = l ;
            t.applicativeEffect = s ;
            t.bindEffect = f ;
            t.monadEffect = c ;
        } ( n.Effect = n.Effect || {} ) , // End of Effect IIFE.

        // IIFE for "Effect.Aff" (defining internal Aff primitives and constructors).
        function ( n ) {
            "use strict" ;
            // Define 't', which is a complex internal object containing Aff constructors and state management.
            var t = function () {
                var n = {}, t = "Pure", r = "Throw", e = "Catch", a = "Sync", o = "Async", i = "Bind", u = "Bracket", c = "Fork", f = "Sequential", l = "Map", s = "Apply", d = "Alt", p = "Cons", D = "Resume", m = "Release", v = "Finalizer", h = "Finalized", w = "Forked" ;
                // Constructor 'C' for internal Aff states.
                function C ( n, t, r, e ) { this.tag = n, this._1 = t, this._2 = r, this._3 = e }
                // Helper function 'g' to create tagged constructors.
                function g ( n ) { var t = function ( t, r, e ) { return new C( n, t, r, e ) } ; return t.tag = n, t }
                // 'y' represents a non-canceler effect.
                function y ( n ) { return new C( t, void 0 ) }
                // Function 'E' to handle and rethrow exceptions asynchronously.
                function E ( n ) { try { n() } catch ( t ) { setTimeout( function () { throw t }, 0 ) } }
                // Function 'A' to apply a synchronous action with error handling.
                function A ( n, t, r ) { try { return t( r() ) } catch ( e ) { return n( e ) } }
                // Function 'S' to apply an asynchronous action with error handling and cancellation.
                function S ( n, t, r ) { try { return t( r() ) } catch ( e ) { return r( n( e ) )(), y } }
                // 'b' is a scheduler for microtasks, similar to a simplified event loop.
                var b = function () {
                    var n = 1024, t = 0, r = 0, e = new Array( n ), a = !1 ;
                    function o () { var o ; for ( a = !0 ; 0 !== t ; ) t--, o = e[r], e[r] = void 0, r = ( r + 1 ) % n, o() ; a = !1 }
                    return { isDraining : function () { return a }, enqueue : function ( i ) { var u ; t === n && ( u = a, o(), a = u ), e[( r + t ) % n] = i, t++, a || o() } } ;
                } () ;
                // Fiber states: _, F, M, P, T, B, I.
                var _ = 0, F = 1, M = 2, P = 3, T = 4, B = 5, I = 6 ;
                // The 'U' function represents the fiber runner, managing the execution state of an Aff computation.
                function U ( n, l, s ) {
                    var d = 0, w = _, g = s, y = null, R = null, L = null, O = null, N = null, q = 0, x = 0, W = null, z = !0 ;
                    function H ( s ) {
                        for ( var x, j, G ; ; )
                            switch ( x = null, j = null, G = null, w ) {
                                case M:
                                    w = F, g = L( g ), null === O ? L = null : ( L = O._1, O = O._2 ) ;
                                    break ;
                                case P:
                                    n.isLeft( g ) ? ( w = B, y = g, g = null ) : null === L ? w = B : ( w = M, g = n.fromRight( g ) ) ;
                                    break ;
                                case F:
                                    switch ( g.tag ) {
                                        case i:
                                            L && ( O = new C( p, L, O ) ), L = g._2, w = F, g = g._1 ;
                                            break ;
                                        case t:
                                            null === L ? ( w = B, g = n.right( g._1 ) ) : ( w = M, g = g._1 ) ;
                                            break ;
                                        case a:
                                            w = P, g = A( n.left, n.right, g._1 ) ;
                                            break ;
                                        case o:
                                            return w = T, void ( g = S( n.left, g._1, function ( n ) { return function () { d === s && ( d++, b.enqueue( function () { d === s + 1 && ( w = P, g = n, H( d ) ) } ) ) } } ) ) ;
                                        case r:
                                            w = B, y = n.left( g._1 ), g = null ;
                                            break ;
                                        case e:
                                            N = new C( p, g, null === L ? N : new C( p, new C( D, L, O ), N, R ), R ), L = null, O = null, w = F, g = g._1 ;
                                            break ;
                                        case u:
                                            q++, N = new C( p, g, null === L ? N : new C( p, new C( D, L, O ), N, R ), R ), L = null, O = null, w = F, g = g._1 ;
                                            break ;
                                        case c:
                                            w = P, x = U( n, l, g._2 ), l && l.register( x ), g._1 && x.run(), g = n.right( x ) ;
                                            break ;
                                        case f:
                                            w = F, g = k( n, l, g._1 ) ;
                                    }
                                    break ;
                                case B:
                                    if ( L = null, O = null, null === N ) w = I, g = R || y || g ;
                                    else
                                        switch ( x = N._3, G = N._1, N = N._2, G.tag ) {
                                            case e:
                                                R && R !== x ? w = B : y && ( w = F, g = G._2( n.fromLeft( y ) ), y = null ) ;
                                                break ;
                                            case D:
                                                R && R !== x || y ? w = B : ( L = G._1, O = G._2, w = M, g = n.fromRight( g ) ) ;
                                                break ;
                                            case u:
                                                q--, null === y && ( j = n.fromRight( g ), N = new C( p, new C( m, G._2, j ), N, x ), ( R === x || q > 0 ) && ( w = F, g = G._3( j ) ) ) ;
                                                break ;
                                            case m:
                                                q++, N = new C( p, new C( h, g, y ), N, R ), w = F, g = R && R !== x ? G._1.killed( n.fromLeft( R ) )( G._2 ) : y ? G._1.failed( n.fromLeft( y ) )( G._2 ) : G._1.completed( n.fromRight( g ) )( G._2 ), y = null ;
                                                break ;
                                            case v:
                                                q++, N = new C( p, new C( h, g, y ), N, R ), w = F, g = G._1 ;
                                                break ;
                                            case h:
                                                q--, w = B, g = G._1, y = G._2 ;
                                        }
                                    break ;
                                case I:
                                    for ( var J in W ) W.hasOwnProperty( J ) && ( z = z && W[J].rethrow, E( W[J].handler( g ) ) ) ;
                                    return W = null, void ( R && y ? setTimeout( function () { throw n.fromLeft( y ) }, 0 ) : n.isLeft( g ) && z && setTimeout( function () { if ( z ) throw n.fromLeft( g ) }, 0 ) ) ;
                                case _:
                                    w = F ;
                                    break ;
                                case T:
                                    return ;
                            }
                    }
                    function j ( n ) {
                        return function () {
                            if ( w === I ) return z = z && n.rethrow, n.handler( g )(), function () {} ;
                            var t = x++ ;
                            return ( W = W || {} )[t] = n, function () { null !== W && delete W[t] } ;
                        } ;
                    }
                    return {
                        kill : function ( t, r ) {
                            return function () {
                                if ( w === I ) return r( n.right( void 0 ) )(), function () {} ;
                                var e = j( { rethrow : !1, handler : function () { return r( n.right( void 0 ) ) } } )() ;
                                switch ( w ) {
                                    case _:
                                        R = n.left( t ), w = I, g = R, H( d ) ;
                                        break ;
                                    case T:
                                        null === R && ( R = n.left( t ) ), 0 === q && ( w === T && ( N = new C( p, new C( v, g( t ) ), N, R ) ), w = B, g = null, y = null, H( ++d ) ) ;
                                        break ;
                                    default:
                                        null === R && ( R = n.left( t ) ), 0 === q && ( w = B, g = null, y = null ) ;
                                }
                                return e ;
                            } ;
                        }, join : function ( n ) {
                            return function () {
                                var t = j( { rethrow : !1, handler : n } )() ;
                                return w === _ && H( d ), t ;
                            } ;
                        }, onComplete : j, isSuspended : function () { return w === _ }, run : function () { w === _ && ( b.isDraining() ? H( d ) : b.enqueue( function () { H( d ) } ) ) }
                    } ;
                }
                // The 'R' function implements the parallel Aff runner.
                function R ( t, r, e, a ) {
                    var i = 0, u = {}, c = 0, f = {}, D = new Error( "[ParAff] Early exit" ), m = null, v = n ;
                    function h ( r, e, a ) {
                        var o, i, c = e, f = null, D = null, m = 0, v = {} ;
                        n: for ( ; ; )
                            switch ( o = null, c.tag ) {
                                case w:
                                    if ( c._3 === n && ( o = u[c._1], v[m++] = o.kill( r, function ( n ) { return function () { 0 === --m && a( n )() } } ) ), null === f ) break n ;
                                    c = f._2, null === D ? f = null : ( f = D._1, D = D._2 ) ;
                                    break ;
                                case l:
                                    c = c._2 ;
                                    break ;
                                case s:
                                case d:
                                    f && ( D = new C( p, f, D ) ), f = c, c = c._1 ;
                            }
                        if ( 0 === m ) a( t.right( void 0 ) )() ; else for ( i = 0, o = m ; i < o ; i++ ) v[i] = v[i]() ;
                        return v ;
                    }
                    function g ( r ) {
                        return function ( e ) {
                            return function () {
                                delete u[r._1], r._3 = e, function r ( e, o, i ) {
                                    var u, p, v, w, C, g ;
                                    for ( t.isLeft( e ) ? ( u = e, p = null ) : ( p = e, u = null ) ; ; ) {
                                        if ( v = null, w = null, C = null, g = null, null !== m ) return ;
                                        if ( null === o ) return void a( u || p )() ;
                                        if ( o._3 !== n ) return ;
                                        switch ( o.tag ) {
                                            case l:
                                                null === u ? ( o._3 = t.right( o._1( t.fromRight( p ) ) ), p = o._3 ) : o._3 = u ;
                                                break ;
                                            case s:
                                                if ( v = o._1._3, w = o._2._3, u ) {
                                                    if ( o._3 = u, C = !0, g = c++, f[g] = h( D, u === v ? o._2 : o._1, function () { return function () { delete f[g], C ? C = !1 : null === i ? r( u, null, null ) : r( u, i._1, i._2 ) } } ), C ) return void ( C = !1 ) ;
                                                } else {
                                                    if ( v === n || w === n ) return ;
                                                    p = t.right( t.fromRight( v )( t.fromRight( w ) ) ), o._3 = p ;
                                                }
                                                break ;
                                            case d:
                                                if ( v = o._1._3, w = o._2._3, v === n && t.isLeft( w ) || w === n && t.isLeft( v ) ) return ;
                                                if ( v !== n && t.isLeft( v ) && w !== n && t.isLeft( w ) ) u = p === v ? w : v, p = null, o._3 = u ;
                                                else if ( o._3 = p, C = !0, g = c++, f[g] = h( D, p === v ? o._2 : o._1, function () { return function () { delete f[g], C ? C = !1 : null === i ? r( p, null, null ) : r( p, i._1, i._2 ) } } ), C ) return void ( C = !1 ) ;
                                        }
                                        null === i ? o = null : ( o = i._1, i = i._2 ) ;
                                    }
                                }( e, r._2._1, r._2._2 ) ;
                            } ;
                        } ;
                    }
                    return function () {
                        var a, o, c = F, f = e, D = null, m = null ;
                        n: for ( ; ; )
                            switch ( a = null, o = null, c ) {
                                case F:
                                    switch ( f.tag ) {
                                        case l:
                                            D && ( m = new C( p, D, m ) ), D = new C( l, f._1, n, n ), f = f._2 ;
                                            break ;
                                        case s:
                                            D && ( m = new C( p, D, m ) ), D = new C( s, n, f._2, n ), f = f._1 ;
                                            break ;
                                        case d:
                                            D && ( m = new C( p, D, m ) ), D = new C( d, n, f._2, n ), f = f._1 ;
                                            break ;
                                        default:
                                            o = i++, c = B, a = f, f = new C( w, o, new C( p, D, m ), n ), ( a = U( t, r, a ) ).onComplete( { rethrow : !1, handler : g( f ) } )(), u[o] = a, r && r.register( a ) ;
                                    }
                                    break ;
                                case B:
                                    if ( null === D ) break n ;
                                    D._1 === n ? ( D._1 = f, c = F, f = D._2, D._2 = n ) : ( D._2 = f, f = D, null === m ? D = null : ( D = m._1, m = m._2 ) ) ;
                            }
                        for ( v = f, o = 0 ; o < i ; o++ ) u[o].run() ;
                    }(), function ( n ) {
                        return new C( o, function ( r ) {
                            return function () {
                                return function ( n, r ) {
                                    var e ;
                                    for ( var a in m = t.left( n ), f )
                                        if ( f.hasOwnProperty( a ) )
                                            for ( a in e = f[a] ) e.hasOwnProperty( a ) && e[a]() ;
                                    f = null ;
                                    var i = h( n, v, r ) ;
                                    return function ( n ) {
                                        return new C( o, function ( n ) {
                                            return function () {
                                                for ( var n in i ) i.hasOwnProperty( n ) && i[n]() ;
                                                return y ;
                                            } ;
                                        } ) ;
                                    } ;
                                }( n, r ) ;
                            } ;
                        } ) ;
                    } ;
                }
                // The 'k' function represents the sequential Aff runner.
                function k ( n, t, r ) { return new C( o, function ( e ) { return function () { return R( n, t, r, e ) } } ) }
                // Export internal constructors and helper functions from the 'C' object.
                return C.EMPTY = n, C.Pure = g( t ), C.Throw = g( r ), C.Catch = g( e ), C.Sync = g( a ), C.Async = g( o ), C.Bind = g( i ), C.Bracket = g( u ), C.Fork = g( c ), C.Seq = g( f ), C.ParMap = g( l ), C.ParApply = g( s ), C.ParAlt = g( d ), C.Fiber = U, C.Supervisor = function ( n ) {
                    var t = {}, r = 0, e = 0 ;
                    return {
                        register : function ( n ) {
                            var a = r++ ;
                            n.onComplete( { rethrow : !0, handler : function ( n ) { return function () { e--, delete t[a] } } } ), t[a] = n, e++ ;
                        }, isEmpty : function () { return 0 === e }, killAll : function ( o, i ) {
                            return function () {
                                var u = 0, c = {} ;
                                function f ( r ) { c[r] = t[r].kill( o, function ( t ) { return function () { delete c[r], u--, n.isLeft( t ) && n.fromLeft( t ) && setTimeout( function () { throw n.fromLeft( t ) }, 0 ), 0 === u && i() } } )() }
                                for ( var l in t ) t.hasOwnProperty( l ) && ( u++, f( l ) ) ;
                                return t = {}, r = 0, e = 0, function ( n ) { return new C( a, function () { for ( var n in c ) c.hasOwnProperty( n ) && c[n]() } ) } ;
                            } ;
                        }
                    } ;
                }, C.Scheduler = b, C.nonCanceler = y, C ;
            } () ;
            // Export public interfaces for the Aff monad from the internal 't' object.
            n._pure = t.Pure ;
            n._map = function ( n ) {
                return function ( r ) {
                    return r.tag === t.Pure.tag ? t.Pure( n( r._1 ) ) : t.Bind( r, function ( r ) { return t.Pure( n( r ) ) } ) ;
                } ;
            } ;
            n._bind = function ( n ) { return function ( r ) { return t.Bind( n, r ) } } ;
            n._liftEffect = t.Sync ;
            n._parAffMap = function ( n ) { return function ( r ) { return t.ParMap( n, r ) } } ;
            n._parAffApply = function ( n ) { return function ( r ) { return t.ParApply( n, r ) } } ;
            n.makeAff = t.Async ;
            n._makeFiber = function ( n, r ) { return function () { return t.Fiber( n, null, r ) } } ;
            n._sequential = t.Seq ;
        } ( n["Effect.Aff"] = n["Effect.Aff"] || {} ) , // End of Effect.Aff (internal) IIFE.

        // IIFE for "Effect.Class" (defining 'liftEffect', 'MonadEffect').
        function ( t ) {
            "use strict" ;
            // Unused imports: Control.Category, Control.Monad, Effect.
            n["Control.Category"], n["Control.Monad"], n.Effect ;
            // Export 'liftEffect' function.
            t.liftEffect = function ( n ) { return n.liftEffect } ;
            // Define the 'MonadEffect' constructor.
            t.MonadEffect = function ( n, t ) { this.Monad0 = n, this.liftEffect = t } ;
        } ( n["Effect.Class"] = n["Effect.Class"] || {} ) , // End of Effect.Class IIFE.

        // IIFE for "Effect.Ref" (defining 'new', 'read', 'write' for mutable references).
        function ( n ) {
            "use strict" ;
            // Define 'new' for creating a new mutable reference with an initial value.
            n.new = function ( n ) { return function () { return { value : n } } } ;
            // Define 'read' for reading the value from a mutable reference.
            n.read = function ( n ) { return function () { return n.value } } ;
            // Define 'write' for writing a new value to a mutable reference.
            n.write = function ( n ) { return function ( t ) { return function () { return t.value = n, {} } } } ;
        } ( n["Effect.Ref"] = n["Effect.Ref"] || {} ) , // End of Effect.Ref (new, read, write) IIFE.

        // IIFE for "Effect.Ref" (re-exporting 'new', 'read', 'write').
        function ( t ) {
            "use strict" ;
            // Import 'r' (new, read, write) from "Effect.Ref".
            var r = n["Effect.Ref"] ;
            // Unused imports: Data.Function, Data.Functor, Effect, Prelude.
            n["Data.Function"], n["Data.Functor"], n.Effect, n.Prelude ;
            // Re-export 'new', 'read', 'write'.
            t.new = r.new ;
            t.read = r.read ;
            t.write = r.write ;
        } ( n["Effect.Ref"] = n["Effect.Ref"] || {} ) , // End of Effect.Ref (re-export) IIFE.

        // IIFE for "Control.Parallel.Class" (defining 'parallel', 'sequential', 'Parallel').
        function ( t ) {
            "use strict" ;
            // Unused imports: Alt, Alternative, Applicative, Apply, Bind, Monad.Cont.Trans, Monad.Except.Trans, Monad.Maybe.Trans, Monad.Reader.Trans, Monad.Writer.Trans, Plus, Semigroupoid, Data.Either, Data.Function, Data.Functor, Data.Functor.Compose, Data.Maybe, Data.Newtype, Data.Unit, Effect.Class, Effect.Ref, Prelude.
            n["Control.Alt"], n["Control.Alternative"], n["Control.Applicative"], n["Control.Apply"], n["Control.Bind"], n["Control.Monad.Cont.Trans"], n["Control.Monad.Except.Trans"], n["Control.Monad.Maybe.Trans"], n["Control.Monad.Reader.Trans"], n["Control.Monad.Writer.Trans"], n["Control.Plus"], n["Control.Semigroupoid"], n["Data.Either"], n["Data.Function"], n["Data.Functor"], n["Data.Functor.Compose"], n["Data.Maybe"], n["Data.Newtype"], n["Data.Unit"], n["Effect.Class"], n["Effect.Ref"], n.Prelude ;
            // Export 'parallel' function.
            t.parallel = function ( n ) { return n.parallel } ;
            // Export 'sequential' function.
            t.sequential = function ( n ) { return n.sequential } ;
            // Define the 'Parallel' constructor.
            t.Parallel = function ( n, t, r, e ) { this.Applicative1 = n, this.Monad0 = t, this.parallel = r, this.sequential = e } ;
        } ( n["Control.Parallel.Class"] = n["Control.Parallel.Class"] || {} ) , // End of Control.Parallel.Class IIFE.

        // IIFE for "Control.Parallel" (defining 'parTraverse_', 'parSequence_').
        function ( t ) {
            "use strict" ;
            // Import necessary modules.
            var r = n["Control.Category"], e = n["Control.Parallel.Class"], a = ( n["Control.Semigroupoid"], n["Data.Foldable"] ) ;
            // Unused imports: Data.Traversable, Prelude.
            // Define 'parTraverse_' for traversing a foldable structure in parallel, discarding results.
            var o = ( n["Data.Traversable"], n.Prelude,
                function ( n ) {
                    return function ( t ) {
                        return function ( r ) {
                            return function ( o ) {
                                return e.sequential( n )( a.traverse_( n.Applicative1() )( t )( function ( t ) { return e.parallel( n )( r( t ) ) } )( o ) ) ;
                            } ;
                        } ;
                    } ;
                } ) ;
            // Export 'parTraverse_'.
            t.parTraverse_ = o ;
            // Export 'parSequence_' for sequencing a foldable of parallel actions, discarding results.
            t.parSequence_ = function ( n ) {
                return function ( t ) {
                    return o( n )( t )( r.identity( r.categoryFn ) ) ;
                } ;
            } ;
        } ( n["Control.Parallel"] = n["Control.Parallel"] || {} ) , // End of Control.Parallel IIFE.

        // IIFE for "Effect.Exception" (defining 'error', 'throwException').
        function ( n ) {
            "use strict" ;
            // Define 'error' to create a new Error object.
            n.error = function ( n ) { return new Error( n ) } ;
            // Define 'throwException' to throw a given exception.
            n.throwException = function ( n ) { return function () { throw n } } ;
        } ( n["Effect.Exception"] = n["Effect.Exception"] || {} ) , // End of Effect.Exception (error, throwException) IIFE.

        // IIFE for "Effect.Exception" (defining 'throw').
        function ( t ) {
            "use strict" ;
            // Import 'r' (error, throwException) from "Effect.Exception".
            var r = n["Effect.Exception"] ;
            // Unused imports: Control.Applicative, Control.Semigroupoid, Data.Either, Data.Functor, Data.Maybe, Data.Show, Effect, Prelude.
            n["Control.Applicative"], n["Control.Semigroupoid"], n["Data.Either"], n["Data.Functor"], n["Data.Maybe"], n["Data.Show"], n.Effect, n.Prelude ;
            // Export 'throw' function, which creates and throws an error as an Effect.
            t.throw = function ( n ) { return r.throwException( r.error( n ) ) } ;
        } ( n["Effect.Exception"] = n["Effect.Exception"] || {} ) , // End of Effect.Exception (throw) IIFE.

        // IIFE for "Effect.Aff" (defining public Aff functions and instances).
        function ( t ) {
            "use strict" ;
            // Import various modules and internal Aff operations.
            var r = n["Effect.Aff"], e = ( n["Control.Alt"], n["Control.Alternative"], n["Control.Applicative"] ), a = n["Control.Apply"], o = n["Control.Bind"], i = ( n["Control.Lazy"], n["Control.Monad"] ) ;
            var u = ( n["Control.Monad.Error.Class"], n["Control.Monad.Rec.Class"], n["Control.Parallel"] ), c = n["Control.Parallel.Class"] ;
            var f = ( n["Control.Plus"], n["Control.Semigroupoid"], n["Data.Either"] ), l = n["Data.Foldable"], s = n["Data.Function"] ;
            var d = ( n["Data.Function.Uncurried"], n["Data.Functor"] ), p = n["Data.Monoid"] ;
            var D = ( n["Data.Newtype"], n["Data.Semigroup"] ), m = ( n["Data.Time.Duration"], n["Data.Unit"] ), v = n.Effect, h = n["Effect.Class"] ;
            var w = ( n["Effect.Exception"], n["Effect.Unsafe"], n["Partial.Unsafe"] ), C = ( n.Prelude, n["Unsafe.Coerce"] ) ;

            // Functor instance 'g' for ParAff.
            var g = new d.Functor( r._parAffMap ) ;
            // Functor instance 'y' for Aff.
            var y = new d.Functor( r._map ) ;
            // Helper object 'E' for working with 'Either' in the context of Aff.
            var E = {
                isLeft : function ( n ) {
                    if ( n instanceof f.Left ) return !0 ;
                    if ( n instanceof f.Right ) return !1 ;
                    throw new Error( "Failed pattern match at Effect.Aff (line 390, column 12 - line 392, column 20): " + [ n.constructor.name ] ) ;
                },
                fromLeft : function ( n ) {
                    if ( n instanceof f.Left ) return n.value0 ;
                    if ( n instanceof f.Right ) return w.unsafeCrashWith( "unsafeFromLeft: Right" ) ;
                    throw new Error( "Failed pattern match at Effect.Aff (line 395, column 20 - line 399, column 3): " + [ n.constructor.name ] ) ;
                },
                fromRight : function ( n ) {
                    if ( n instanceof f.Right ) return n.value0 ;
                    if ( n instanceof f.Left ) return w.unsafeCrashWith( "unsafeFromRight: Left" ) ;
                    throw new Error( "Failed pattern match at Effect.Aff (line 400, column 21 - line 402, column 31): " + [ n.constructor.name ] ) ;
                },
                left : f.Left.create,
                right : f.Right.create
            } ;
            // 'A' function to launch an Aff computation and return its Fiber.
            var A = function ( n ) { return function () { var t = function ( n ) { return r._makeFiber( E, n ) }( n )() ; return t.run(), t } } ;
            // Apply instance 'S' for ParAff.
            var S = new a.Apply( function () { return g }, r._parAffApply ) ;
            // Monad instance 'b' for Aff.
            var b = new i.Monad( function () { return M }, function () { return _ } ) ;
            // Bind instance '_' for Aff.
            var _ = new o.Bind( function () { return F }, r._bind ) ;
            // Apply instance 'F' for Aff.
            var F = new a.Apply( function () { return y }, i.ap( b ) ) ;
            // Applicative instance 'M' for Aff.
            var M = new e.Applicative( function () { return F }, r._pure ) ;
            // MonadEffect instance 'P' for Aff.
            var P = new h.MonadEffect( function () { return b }, r._liftEffect ) ;
            // Parallel instance 'T' for Aff.
            var T = new c.Parallel( function () { return B }, function () { return b }, C.unsafeCoerce, r._sequential ) ;
            // Applicative instance 'B' for ParAff.
            var B = new e.Applicative( function () { return S }, function ( n ) { return c.parallel( T )( e.pure( M )( n ) ) } ) ;
            // Semigroup instance 'I' for Cancelers.
            var I = new D.Semigroup( function ( n ) { return function ( t ) { return function ( r ) { return u.parSequence_( T )( l.foldableArray )( [ n( r ), t( r ) ] ) } } } ) ;
            // 'U' represents a non-canceler (constant pure unit).
            var U = s.const( e.pure( M )( m.unit ) ) ;
            // Monoid instance 'R' for Cancelers.
            var R = new p.Monoid( function () { return I }, U ) ;

            // Export 'launchAff'.
            t.launchAff = A ;
            // Export 'launchAff_', which launches an Aff computation and discards its result.
            t.launchAff_ = function ( n ) { return d.void( v.functorEffect )( A( n ) ) } ;
            // Export 'nonCanceler'.
            t.nonCanceler = U ;
            // Export Aff functor, apply, applicative, bind, monad instances.
            t.functorAff = y ;
            t.applyAff = F ;
            t.applicativeAff = M ;
            t.bindAff = _ ;
            t.monadAff = b ;
            // Export MonadEffect instance for Aff.
            t.monadEffectAff = P ;
            // Export ParAff functor, apply, applicative instances.
            t.functorParAff = g ;
            t.applyParAff = S ;
            t.applicativeParAff = B ;
            // Export Parallel instance for Aff.
            t.parallelAff = T ;
            // Export Semigroup and Monoid instances for Cancelers.
            t.semigroupCanceler = I ;
            t.monoidCanceler = R ;
            // Export 'makeAff'.
            t.makeAff = r.makeAff ;
        } ( n["Effect.Aff"] = n["Effect.Aff"] || {} ) , // End of Effect.Aff (public) IIFE.

        // IIFE for "Node.Encoding" (defining encoding types and conversion functions).
        function ( t ) {
            "use strict" ;
            // Unused import: Node.Encoding.
            n["Node.Encoding"] ;
            // Import 'r' (Show) from "Data.Show".
            var r = n["Data.Show"] ;
            // Unused import: Prelude.
            // Define various encoding types as singleton objects.
            var e = ( n.Prelude, function () { function n () {} return n.value = new n, n } () ) ; // ASCII
            var a = function () { function n () {} return n.value = new n, n } () ; // UTF8
            var o = function () { function n () {} return n.value = new n, n } () ; // UTF16LE
            var i = function () { function n () {} return n.value = new n, n } () ; // UCS2
            var u = function () { function n () {} return n.value = new n, n } () ; // Base64
            var c = function () { function n () {} return n.value = new n, n } () ; // Latin1
            var f = function () { function n () {} return n.value = new n, n } () ; // Binary
            var l = function () { function n () {} return n.value = new n, n } () ; // Hex
            // Create a 'Show' instance 's' for encodings.
            var s = new r.Show( function ( n ) {
                if ( n instanceof e ) return "ASCII" ;
                if ( n instanceof a ) return "UTF8" ;
                if ( n instanceof o ) return "UTF16LE" ;
                if ( n instanceof i ) return "UCS2" ;
                if ( n instanceof u ) return "Base64" ;
                if ( n instanceof c ) return "Latin1" ;
                if ( n instanceof f ) return "Binary" ;
                if ( n instanceof l ) return "Hex" ;
                // Error for non-exhaustive pattern matching.
                throw new Error( "Failed pattern match at Node.Encoding (line 19, column 1 - line 19, column 39): " + [ n.constructor.name ] ) ;
            } ) ;
            // Export encoding singletons.
            t.ASCII = e ;
            t.UTF8 = a ;
            t.UTF16LE = o ;
            t.UCS2 = i ;
            t.Base64 = u ;
            t.Latin1 = c ;
            t.Binary = f ;
            t.Hex = l ;
            // Export 'encodingToNode' function, which converts an encoding type to its Node.js string equivalent.
            t.encodingToNode = function ( n ) {
                if ( n instanceof e ) return "ascii" ;
                if ( n instanceof a ) return "utf8" ;
                if ( n instanceof o ) return "utf16le" ;
                if ( n instanceof i ) return "ucs2" ;
                if ( n instanceof u ) return "base64" ;
                if ( n instanceof c ) return "latin1" ;
                if ( n instanceof f ) return "binary" ;
                if ( n instanceof l ) return "hex" ;
                // Error for non-exhaustive pattern matching.
                throw new Error( "Failed pattern match at Node.Encoding (line 31, column 1 - line 31, column 37): " + [ n.constructor.name ] ) ;
            } ;
            // Export the 'showEncoding' instance.
            t.showEncoding = s ;
        } ( n["Node.Encoding"] = n["Node.Encoding"] || {} ) , // End of Node.Encoding IIFE.

        // IIFE for "Node.Process" (re-exporting global 'process').
        function ( t ) {
            "use strict" ;
            // Export Node.js global 'process' object.
            ( n["Node.Process"] = n["Node.Process"] || {} ).process = process ;
        } () , // End of Node.Process (process) IIFE.

        // IIFE for "Node.Stream" (defining raw stream operations).
        function ( n ) {
            "use strict" ;
            // Define 'readChunkImpl' for handling different types of stream chunks (Buffer or string).
            n.readChunkImpl = function ( n ) {
                return function ( t ) {
                    return function ( r ) {
                        if ( r instanceof Buffer ) return t( r ) ; // If it's a Buffer, apply 't'.
                        if ( "string" == typeof r ) return n( r ) ; // If it's a string, apply 'n'.
                        // Throw an error for unrecognized chunk types.
                        throw new Error( "Node.Stream.readChunkImpl: Unrecognised chunk type; expected String or Buffer, got: " + r ) ;
                    } ;
                } ;
            } ;
            // Define 'onDataEitherImpl' for attaching a 'data' event listener to a stream.
            n.onDataEitherImpl = function ( n ) {
                return function ( t ) {
                    return function ( r ) {
                        return function () {
                            t.on( "data", function ( t ) { r( n( t ) )() } ) ; // Attach event listener.
                        } ;
                    } ;
                } ;
            } ;
            // Define 'onEnd' for attaching an 'end' event listener to a stream.
            n.onEnd = function ( n ) { return function ( t ) { return function () { n.on( "end", t ) } } } ;
            // Define 'write' for writing raw data to a stream.
            n.write = function ( n ) { return function ( t ) { return function ( r ) { return function () { return n.write( t, null, r ) } } } } ;
            // Define 'writeStringImpl' for writing string data with encoding to a stream.
            n.writeStringImpl = function ( n ) {
                return function ( t ) {
                    return function ( r ) {
                        return function ( e ) {
                            return function () {
                                return n.write( r, t, e ) ; // Write string 'r' with encoding 't' and a callback 'e'.
                            } ;
                        } ;
                    } ;
                } ;
            } ;
        } ( n["Node.Stream"] = n["Node.Stream"] || {} ) , // End of Node.Stream (raw ops) IIFE.

        // IIFE for "Node.Buffer" (defining 'toStringImpl').
        function ( t ) {
            "use strict" ;
            // Export Node.js Buffer's internal 'toStringImpl' for converting Buffer to string.
            ( n["Node.Buffer"] = n["Node.Buffer"] || {} ).toStringImpl = function ( n ) {
                return function ( t ) {
                    return function () {
                        return t.toString( n ) ; // Calls Buffer.prototype.toString with the specified encoding.
                    } ;
                } ;
            } ;
        } () , // End of Node.Buffer (toStringImpl) IIFE.

        // IIFE for "Node.Buffer" (defining 'toString').
        function ( t ) {
            "use strict" ;
            // Import 'r' (toStringImpl) from "Node.Buffer", 'e' (encodingToNode) from "Node.Encoding".
            var r = n["Node.Buffer"], e = ( n["Control.Semigroupoid"], n["Data.ArrayBuffer.Types"], n["Data.Maybe"], n["Data.Show"], n.Effect, n["Node.Encoding"] ) ;
            // Unused import: Prelude.
            n.Prelude ;
            // Export 'toString' function, which converts a Buffer to a string using a Node.Encoding type.
            t.toString = function ( n ) { return r.toStringImpl( e.encodingToNode( n ) ) } ;
        } ( n["Node.Buffer"] = n["Node.Buffer"] || {} ) , // End of Node.Buffer (toString) IIFE.

        // IIFE for "Node.Stream" (defining high-level stream functions).
        function ( t ) {
            "use strict" ;
            // Import necessary modules.
            var r = n["Node.Stream"], e = n["Control.Applicative"], a = n["Control.Bind"], o = n["Data.Either"], i = ( n["Data.Functor"], n["Data.Maybe"], n["Data.Show"] ), u = n.Effect, c = n["Effect.Exception"], f = n["Node.Buffer"], l = n["Node.Encoding"] ;
            // Unused import: Prelude.
            // 's' is a function to read stream chunks into an 'Either' (Left for string, Right for Buffer).
            var s = ( n.Prelude, r.readChunkImpl( o.Left.create )( o.Right.create ) ) ;
            // 'd' is 'onDataEither', attaching a data listener that handles chunks as 'Either'.
            var d = function ( n ) { return function ( t ) { return r.onDataEitherImpl( s )( n )( t ) } } ;
            // 'p' is 'onData', handling stream data and ensuring encoding is not set if expecting raw.
            var p = function ( n ) {
                return function ( t ) {
                    return d( n )( a.composeKleisliFlipped( u.bindEffect )( t )( function ( n ) {
                        if ( n instanceof o.Left ) return c.throw( "Stream encoding should not be set" ) ; // Error if Left (string) is received unexpectedly.
                        if ( n instanceof o.Right ) return e.pure( u.applicativeEffect )( n.value0 ) ; // If Right (Buffer), return its value.
                        throw new Error( "Failed pattern match at Node.Stream (line 94, column 5 - line 98, column 17): " + [ n.constructor.name ] ) ;
                    } ) ) ;
                } ;
            } ;
            // Export 'onData'.
            t.onData = p ;
            // Export 'onDataString', which handles stream data as strings with a specified encoding.
            t.onDataString = function ( n ) {
                return function ( t ) {
                    return function ( r ) {
                        return p( n )( a.composeKleisliFlipped( u.bindEffect )( r )( f.toString( t ) ) ) ;
                    } ;
                } ;
            } ;
            // Export 'onDataEither'.
            t.onDataEither = d ;
            // Export 'writeString', for writing strings to a stream with an encoding.
            t.writeString = function ( n ) {
                return function ( t ) {
                    return r.writeStringImpl( n )( i.show( l.showEncoding )( t ) ) ;
                } ;
            } ;
            // Export 'onEnd'.
            t.onEnd = r.onEnd ;
        } ( n["Node.Stream"] = n["Node.Stream"] || {} ) , // End of Node.Stream (high-level) IIFE.

        // IIFE for "Node.Process" (re-exporting stdin and stdout streams).
        function ( t ) {
            "use strict" ;
            // Import 'r' (process) from "Node.Process".
            var r = n["Node.Process"] ;
            // Unused imports: Data.Functor, Data.Maybe, Data.Posix, Data.Posix.Signal, Effect, Foreign.Object, Node.Platform, Node.Stream, Prelude, Unsafe.Coerce.
            // 'e' gets the standard output stream.
            var e = ( n["Data.Functor"], n["Data.Maybe"], n["Data.Posix"], n["Data.Posix.Signal"], n.Effect, n["Foreign.Object"], n["Node.Platform"], n["Node.Stream"], n.Prelude, n["Unsafe.Coerce"],
                r.process.stdout ) ;
            // 'a' gets the standard input stream.
            var a = r.process.stdin ;
            // Export 'stdin' and 'stdout'.
            t.stdin = a ;
            t.stdout = e ;
        } ( n["Node.Process"] = n["Node.Process"] || {} ) , // End of Node.Process (stdin, stdout) IIFE.

        // IIFE for "ABC104C" (main application logic).
        function ( t ) {
            "use strict" ;
            // Import all necessary modules for the problem solution.
            var r = n["Control.Applicative"], e = n["Control.Bind"], a = n["Control.Category"] ;
            var o = ( n["Control.Monad.ST"], n["Control.Monad.ST.Internal"] ) ;
            var i = n["Data.Array"], u = n["Data.Bounded"], c = n["Data.Either"] ;
            var f = ( n["Data.Eq"], n["Data.Functor"] ) ;
            var l = n["Data.Int"], s = ( n["Data.Int.Bits"], n["Data.Maybe"] ) ;
            var d = n["Data.Monoid"], p = n["Data.Ord"] ;
            var D = ( n["Data.Ring"], n["Data.Semigroup"], n["Data.Semiring"] ) ;
            var m = n["Data.Show"] ;
            var v = ( n["Data.String"], n["Data.String.Common"] ) ;
            var h = ( n["Data.String.Pattern"], n["Data.Tuple"] ), w = n["Data.Unit"], C = n.Effect, g = n["Effect.Aff"] ;
            var y = n["Effect.Class"], E = n["Effect.Ref"] ;
            var A = n["Node.Encoding"], S = n["Node.Process"], b = n["Node.Stream"] ;
            var _ = n["Partial.Unsafe"] ;

            // 'F' is an Aff computation to read all input from stdin.
            var F = ( n.Prelude,
                g.makeAff( function ( n ) {
                    return function () {
                        var t = E.new( "" )() ; // Create a new mutable reference to store the input string.
                        // Attach an 'onDataString' listener to stdin.
                        b.onDataString( S.stdin )( A.UTF8.value )( function ( n ) {
                            return function () {
                                var r = E.read( t )() ; // Read the current content of the reference.
                                return E.write( r + n )( t )() ; // Append the new data chunk to the content.
                            } ;
                        } )(),
                        // Attach an 'onEnd' listener to stdin.
                        b.onEnd( S.stdin )( function () {
                            var e = E.read( t )() ; // Read the final content of the reference.
                            return n( r.pure( c.applicativeEither )( e ) )() ; // Resolve the Aff with the complete input string.
                        } )(),
                        d.mempty( g.monoidCanceler ) ; // Return a non-canceler for this Aff.
                    } ;
                } ) ) ;

            // 'M' is a function to parse a line string (e.g., "100 3") into a Maybe Tuple of two integers.
            var M = function ( n ) {
                var t = i.mapMaybe( l.fromString )( function ( n ) { return v.split( " " )( n ) }( n ) ) ; // Split by space and try to parse each part as an integer.
                return 2 === t.length ? new s.Just( new h.Tuple( t[0], t[1] ) ) : s.Nothing.value ; // If exactly two integers were parsed, return Just a Tuple, otherwise Nothing.
            } ;

            // 'P' is the main solver function. It takes the raw input string and returns the minimum problems solved.
            var P = function ( n ) {
                // Use 'either' to handle potential errors from parsing.
                return c.either( function ( n ) { return _.unsafeCrashWith( n ) } )( a.identity( a.categoryFn ) )(
                    // Bind over the result of processing the input lines.
                    e.bind( c.bindEither )( c.note( "lines" )( i.uncons( ( t = n, v.split( "\n" )( v.trim( t ) ) ) ) ) )( function ( n ) { // Split input into lines, trim whitespace, and get head/tail.
                        // Bind over the result of parsing the first line (D and G values).
                        return e.bind( c.bindEither )( c.note( "d g" )( M( n.head ) ) )( function ( t ) { // Parse the head line (D, G).
                            var e, a = i.mapMaybe( M )( n.tail ) ; // Parse the remaining lines (problem definitions).
                            // Return the result wrapped in an Either, showing the integer result.
                            return r.pure( c.applicativeEither )( m.show( m.showInt )( ( e = t.value0, function ( n ) { // 'e' is D (number of problem types), 'n' is G (target score).
                                return function ( t ) { // 't' is the array of problem definitions [ [count, bonus], ... ].
                                    return a = { value : u.top( u.boundedInt ) }, // Initialize 'a' (minimum problems) with max integer value.
                                    // Iterate through all possible combinations of solving problem types (bitmask).
                                    o.for( 0 )( l.pow( 2 )( e ) )( function ( i ) { // 'i' is the bitmask.
                                        return function () {
                                            var u = { value : 0 }, c = { value : 0 } ; // 'u' for current score, 'c' for problems solved in this combination.
                                            // Calculate score and problems for the types chosen by the bitmask.
                                            o.for( 0 )( e )( function ( n ) { // Iterate through problem types.
                                                return r.when( o.applicativeST )( 0 != ( i & 1 << n ) )( function () { // If the n-th bit is set (this problem type is fully solved).
                                                    // Add the score for solving all problems of this type plus the bonus.
                                                    return f.void( o.functorST )( o.modify( D.add( D.semiringInt )( ( ( ( 100 * ( n + 1 | 0 ) | 0 ) * t[n].value0 | 0 ) + t[n].value1 | 0 ) ) )( u ) )(),
                                                    // Add the count of problems of this type.
                                                    f.void( o.functorST )( o.modify( D.add( D.semiringInt )( t[n].value0 ) )( c ) )() ;
                                                } )() ;
                                            } )() ;

                                            // 'l' calculates remaining problems needed if target 'n' is not met.
                                            var l = function () {
                                                if ( u.value >= n ) return c.value ; // If target score is already met, return current problem count.
                                                var a = { value : 0 }, l = { value : 0 } ; // 'a' for additional score, 'l' for additional problems.
                                                // Iterate through problem types in reverse order to pick problems greedily.
                                                return o.for( 0 )( e )( function ( c ) {
                                                    var s = ( e - c | 0 ) - 1 | 0 ; // Problem index (reversed).
                                                    // If this problem type was NOT fully solved in the current combination.
                                                    return r.when( o.applicativeST )( 0 == ( i & 1 << s ) )( function () {
                                                        // If the target score is not yet reached with current score + additional score.
                                                        return r.when( o.applicativeST )( ( u.value + a.value | 0 ) < n )(
                                                            // Check if adding all problems of this type would meet/exceed the target.
                                                            ( ( ( u.value + a.value | 0 ) + ( ( ( 100 * ( s + 1 | 0 ) | 0 ) * t[s].value0 | 0 ) | 0 ) ) >= n ?
                                                                // If it would, add problems one by one until the target is met.
                                                                o.for( 0 )( t[s].value0 )( function ( t ) {
                                                                    return function () {
                                                                        return r.when( o.applicativeST )( ( u.value + a.value | 0 ) < n )( function () {
                                                                            return f.void( o.functorST )( o.modify( D.add( D.semiringInt )( 100 * ( s + 1 | 0 ) | 0 ) )( a ) )(),
                                                                            f.void( o.functorST )( o.modify( D.add( D.semiringInt )( 1 ) )( l ) )() ;
                                                                        } )() ;
                                                                    } ;
                                                                } )
                                                                // If adding all problems of this type would still not meet the target, add all of them.
                                                                : function () {
                                                                    return f.void( o.functorST )( o.modify( D.add( D.semiringInt )( ( ( ( 100 * ( s + 1 | 0 ) | 0 ) * t[s].value0 | 0 ) + t[s].value1 | 0 ) ) )( a ) )(),
                                                                    f.void( o.functorST )( o.modify( D.add( D.semiringInt )( t[s].value0 ) )( l ) )() ;
                                                                } )() ;
                                                    } )() ;
                                                } )(),
                                                c.value + l.value | 0 ; // Total problem count for this branch.
                                            } () ;
                                            // Update the minimum problem count 'a'.
                                            return a.value = p.min( p.ordInt )( l )( a.value ) ;
                                        } ;
                                    } )()),
                                    a.value ; // Return the final minimum problem count.
                                } ;
                            } )( t.value1 )( a ) ) + "\n" ) ; // Call the problem solver with G and the problem definitions.
                        } ) ;
                    } )
                ) ;
            } ;

            // 'T' is the main program execution, launched as an Aff computation.
            var T = g.launchAff_( e.bind( g.bindAff )( F )( function ( n ) { // First, read all input from stdin (via F).
                return e.bind( g.bindAff )( r.pure( g.applicativeAff )( P( n ) ) )( function ( n ) { // Then, solve the problem with the input 'n'.
                    // Lift the effect of writing the result to stdout.
                    return y.liftEffect( g.monadEffectAff )( ( t = n, f.void( C.functorEffect )( b.writeString( S.stdout )( A.UTF8.value )( t )( r.pure( C.applicativeEffect )( w.unit ) ) ) ) ) ;
                    var t ; // This variable declaration is unused and can be ignored.
                } ) ;
            } ) ) ;

            // Export 'main' and 'solve' functions.
            t.main = T ;
            t.solve = P ;

        } ( n.ABC104C = n.ABC104C || {} ) , // End of ABC104C IIFE.

    n.ABC104C.main() ; // Immediately invoke the main function of the ABC104C module.

} ] }, {}, ["Focm"], null ) ; // End of the main Parcel Require call.