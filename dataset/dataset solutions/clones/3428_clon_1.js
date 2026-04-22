parcelRequire = function ( e , r , t , n ) {
    // Initialize variables for internal use within the parcelRequire function.
    var i ,
        o = "function" == typeof parcelRequire && parcelRequire ,
        u = "function" == typeof require && require ;

    // Define the core 'f' function, which acts as the module loader.
    function f ( t , n ) {
        // If the module is not already cached, attempt to load it.
        if ( ! r [ t ] ) {
            // Check if the module definition exists in the 'e' object.
            if ( ! e [ t ] ) {
                // Try to use an external parcelRequire if available and not a direct call.
                var i = "function" == typeof parcelRequire && parcelRequire ;
                if ( ! n && i )
                    return i ( t , ! 0 ) ;
                // Fallback to the parent parcelRequire or Node.js 'require'.
                if ( o )
                    return o ( t , ! 0 ) ;
                if ( u && "string" == typeof t )
                    return u ( t ) ;

                // If all attempts fail, throw a module not found error.
                var c = new Error ( "Cannot find module '" + t + "'" ) ;
                throw c.code = "MODULE_NOT_FOUND" , c ;
            }

            // Resolve paths for the module.
            p.resolve = function ( r ) {
                return e [ t ] [ 1 ] [ r ] || r ;
            } ;
            // Initialize module cache.
            p.cache = {} ;

            // Create a new module instance and execute its factory function.
            var l = r [ t ] = new f.Module ( t ) ;
            e [ t ] [ 0 ] . call ( l.exports , p , l , l.exports , this ) ;
        }
        // Return the exports of the loaded module.
        return r [ t ] . exports ;

        // Helper function for requiring dependencies within a module.
        function p ( e ) {
            return f ( p.resolve ( e ) ) ;
        }
    }

    // Mark the 'f' function as a parcelRequire instance.
    f.isParcelRequire = ! 0 ;

    // Define the Module constructor.
    f.Module = function ( e ) {
        this.id = e ;
        this.bundle = f ;
        this.exports = {} ;
    } ;

    // Assign internal data structures to the 'f' function.
    f.modules = e ;
    f.cache = r ;
    f.parent = o ;

    // Register a new module.
    f.register = function ( r , t ) {
        e [ r ] = [
            function ( e , r ) {
                r.exports = t ;
            } ,
            {}
        ] ;
    } ;

    // Loop through initial modules to load.
    for ( var c = 0 ; c < t . length ; c ++ ) {
        try {
            f ( t [ c ] ) ;
        }
        catch ( e ) {
            // Store the first encountered error.
            i || ( i = e ) ;
        }
    }

    // Handle exports for the main entry point if specified.
    if ( t . length ) {
        var l = f ( t [ t . length - 1 ] ) ;
        // CommonJS, AMD, or global export.
        "object" == typeof exports && "undefined" != typeof module
            ? module.exports = l
            : "function" == typeof define && define.amd
                ? define ( function ( ) {
                    return l ;
                } )
                : n && ( this [ n ] = l ) ;
    }

    // Reassign parcelRequire to the new loader instance.
    parcelRequire = f ;

    // If an error occurred during loading, re-throw it.
    if ( i )
        throw i ;

    // Return the module loader.
    return f ;

} (
    // The first argument 'e' is the modules object.
    {
        "Focm" : [
            function ( require , module , exports ) {
                // Initialize a global namespace object 'n'.
                var n = {} ;

                // Data.Functor module definition.
                ! function ( t ) {
                    "use strict" ;
                    n [ "Data.Functor" ] ;
                    n [ "Control.Semigroupoid" ] ;
                    n [ "Data.Function" ] ;
                    n [ "Data.Unit" ] ;

                    t . Functor = function ( n ) {
                        this . map = n ;
                    } ;

                    t . map = function ( n ) {
                        return n . map ;
                    } ;
                } ( n [ "Data.Functor" ] = n [ "Data.Functor" ] || {} ) ;

                // Control.Apply module definition.
                ! function ( t ) {
                    "use strict" ;
                    n [ "Control.Apply" ] ;
                    n [ "Control.Category" ] ;
                    n [ "Data.Function" ] ;
                    n [ "Data.Functor" ] ;

                    t . Apply = function ( n , t ) {
                        this . Functor0 = n ;
                        this . apply = t ;
                    } ;

                    t . apply = function ( n ) {
                        return n . apply ;
                    } ;
                } ( n [ "Control.Apply" ] = n [ "Control.Apply" ] || {} ) ;

                // Control.Applicative module definition.
                ! function ( t ) {
                    "use strict" ;
                    n [ "Control.Apply" ] ;
                    n [ "Data.Functor" ] ;
                    n [ "Data.Unit" ] ;

                    t . Applicative = function ( n , t ) {
                        this . Apply0 = n ;
                        this . pure = t ;
                    } ;

                    t . pure = function ( n ) {
                        return n . pure ;
                    } ;
                } ( n [ "Control.Applicative" ] = n [ "Control.Applicative" ] || {} ) ;

                // Control.Bind module definition.
                ! function ( t ) {
                    "use strict" ;
                    n [ "Control.Bind" ] ;
                    n [ "Control.Applicative" ] ;
                    n [ "Control.Apply" ] ;
                    n [ "Control.Category" ] ;
                    n [ "Data.Function" ] ;
                    n [ "Data.Functor" ] ;
                    n [ "Data.Unit" ] ;

                    t . Bind = function ( n , t ) {
                        this . Apply0 = n ;
                        this . bind = t ;
                    } ;

                    t . bind = function ( n ) {
                        return n . bind ;
                    } ;
                } ( n [ "Control.Bind" ] = n [ "Control.Bind" ] || {} ) ;

                // Data.Bounded module definition (part 1).
                ! function ( n ) {
                    "use strict" ;
                    n . topInt = 2147483647 ;
                    n . bottomInt = - 2147483648 ;
                } ( n [ "Data.Bounded" ] = n [ "Data.Bounded" ] || {} ) ;

                // Data.Eq module definition (part 1).
                ! function ( t ) {
                    "use strict" ;
                    ( n [ "Data.Eq" ] = n [ "Data.Eq" ] || {} ) . refEq = function ( n ) {
                        return function ( t ) {
                            return n === t ;
                        } ;
                    } ;
                } ( ) ;

                // Data.Eq module definition (part 2).
                ! function ( t ) {
                    "use strict" ;
                    var a = n [ "Data.Eq" ] ,
                        r = (
                            n [ "Data.HeytingAlgebra" ] ,
                            n [ "Data.Symbol" ] ,
                            n [ "Data.Unit" ] ,
                            n [ "Data.Void" ] ,
                            n [ "Record.Unsafe" ] ,
                            n [ "Type.Data.RowList" ] ,
                            function ( n ) {
                                this . eq = n ;
                            }
                        ) ,
                        e = new r ( a . refEq ) ;

                    t . Eq = r ;
                    t . eq = function ( n ) {
                        return n . eq ;
                    } ;
                    t . eqInt = e ;
                } ( n [ "Data.Eq" ] = n [ "Data.Eq" ] || {} ) ;

                // Data.Ord.Unsafe module definition (part 1).
                ! function ( t ) {
                    "use strict" ;
                    ( n [ "Data.Ord.Unsafe" ] = n [ "Data.Ord.Unsafe" ] || {} ) . unsafeCompareImpl = function ( n ) {
                        return function ( t ) {
                            return function ( a ) {
                                return function ( r ) {
                                    return function ( e ) {
                                        return r < e ? n : r === e ? t : a ;
                                    } ;
                                } ;
                            } ;
                        } ;
                    } ;
                } ( ) ;

                // Data.Show module definition (part 1).
                ! function ( t ) {
                    "use strict" ;
                    ( n [ "Data.Show" ] = n [ "Data.Show" ] || {} ) . showIntImpl = function ( n ) {
                        return n . toString ( ) ;
                    } ;
                } ( ) ;

                // Data.Show module definition (part 2).
                ! function ( t ) {
                    "use strict" ;
                    var a = n [ "Data.Show" ] ,
                        r = (
                            n [ "Data.Symbol" ] ,
                            n [ "Record.Unsafe" ] ,
                            n [ "Type.Data.RowList" ] ,
                            function ( n ) {
                                this . show = n ;
                            }
                        ) ,
                        e = new r ( a . showIntImpl ) ;

                    t . Show = r ;
                    t . show = function ( n ) {
                        return n . show ;
                    } ;
                    t . showInt = e ;
                } ( n [ "Data.Show" ] = n [ "Data.Show" ] || {} ) ;

                // Data.Ordering module definition.
                ! function ( t ) {
                    "use strict" ;
                    n [ "Data.Eq" ] ;
                    n [ "Data.Semigroup" ] ;
                    n [ "Data.Show" ] ;

                    var a = function ( ) {
                        function n ( ) { }
                        return n . value = new n , n ;
                    } ( ) ,
                        r = function ( ) {
                            function n ( ) { }
                            return n . value = new n , n ;
                        } ( ) ,
                        e = function ( ) {
                            function n ( ) { }
                            return n . value = new n , n ;
                        } ( ) ;

                    t . LT = a ;
                    t . GT = r ;
                    t . EQ = e ;
                } ( n [ "Data.Ordering" ] = n [ "Data.Ordering" ] || {} ) ;

                // Data.Ord.Unsafe module definition (part 2).
                ! function ( t ) {
                    "use strict" ;
                    var a = n [ "Data.Ord.Unsafe" ] ,
                        r = n [ "Data.Ordering" ] ,
                        e = a . unsafeCompareImpl ( r . LT . value ) ( r . EQ . value ) ( r . GT . value ) ;

                    t . unsafeCompare = e ;
                } ( n [ "Data.Ord.Unsafe" ] = n [ "Data.Ord.Unsafe" ] || {} ) ;

                // Data.Ring module definition (part 1).
                ! function ( t ) {
                    "use strict" ;
                    ( n [ "Data.Ring" ] = n [ "Data.Ring" ] || {} ) . intSub = function ( n ) {
                        return function ( t ) {
                            return n - t | 0 ;
                        } ;
                    } ;
                } ( ) ;

                // Data.Semiring module definition (part 1).
                ! function ( n ) {
                    "use strict" ;
                    n . intAdd = function ( n ) {
                        return function ( t ) {
                            return n + t | 0 ;
                        } ;
                    } ;

                    n . intMul = function ( n ) {
                        return function ( t ) {
                            return n * t | 0 ;
                        } ;
                    } ;
                } ( n [ "Data.Semiring" ] = n [ "Data.Semiring" ] || {} ) ;

                // Data.Semiring module definition (part 2).
                ! function ( t ) {
                    "use strict" ;
                    var a = n [ "Data.Semiring" ] ,
                        r = (
                            n [ "Data.Symbol" ] ,
                            n [ "Data.Unit" ] ,
                            n [ "Record.Unsafe" ] ,
                            n [ "Type.Data.Row" ] ,
                            n [ "Type.Data.RowList" ] ,
                            function ( n , t , a , r ) {
                                this . add = n ;
                                this . mul = t ;
                                this . one = a ;
                                this . zero = r ;
                            }
                        ) ,
                        e = new r ( a . intAdd , a . intMul , 1 , 0 ) ;

                    t . Semiring = r ;
                    t . add = function ( n ) {
                        return n . add ;
                    } ;
                    t . zero = function ( n ) {
                        return n . zero ;
                    } ;
                    t . mul = function ( n ) {
                        return n . mul ;
                    } ;
                    t . one = function ( n ) {
                        return n . one ;
                    } ;
                    t . semiringInt = e ;
                } ( n [ "Data.Semiring" ] = n [ "Data.Semiring" ] || {} ) ;

                // Data.Ring module definition (part 2).
                ! function ( t ) {
                    "use strict" ;
                    var a = n [ "Data.Ring" ] ,
                        r = n [ "Data.Semiring" ] ,
                        e = (
                            n [ "Data.Symbol" ] ,
                            n [ "Data.Unit" ] ,
                            n [ "Record.Unsafe" ] ,
                            n [ "Type.Data.RowList" ] ,
                            function ( n , t ) {
                                this . Semiring0 = n ;
                                this . sub = t ;
                            }
                        ) ,
                        o = function ( n ) {
                            return n . sub ;
                        } ,
                        i = new e ( function ( ) {
                            return r . semiringInt ;
                        } , a . intSub ) ;

                    t . Ring = e ;
                    t . sub = o ;
                    t . negate = function ( n ) {
                        return function ( t ) {
                            return o ( n ) ( r . zero ( n . Semiring0 ( ) ) ) ( t ) ;
                        } ;
                    } ;
                    t . ringInt = i ;
                } ( n [ "Data.Ring" ] = n [ "Data.Ring" ] || {} ) ;

                // Data.Ord module definition.
                ! function ( t ) {
                    "use strict" ;
                    n [ "Data.Ord" ] ;
                    var a = n [ "Data.Eq" ] ,
                        r = n [ "Data.Ord.Unsafe" ] ,
                        e = n [ "Data.Ordering" ] ,
                        o = n [ "Data.Ring" ] ,
                        i = n [ "Data.Semiring" ] ,
                        u = (
                            n [ "Data.Symbol" ] ,
                            n [ "Data.Unit" ] ,
                            n [ "Data.Void" ] ,
                            n [ "Record.Unsafe" ] ,
                            n [ "Type.Data.RowList" ] ,
                            function ( n , t ) {
                                this . Eq0 = n ;
                                this . compare = t ;
                            }
                        ) ,
                        c = new u ( function ( ) {
                            return a . eqInt ;
                        } , r . unsafeCompare ) ,
                        f = function ( n ) {
                            return n . compare ;
                        } ,
                        s = function ( n ) {
                            return function ( t ) {
                                return function ( a ) {
                                    return ! ( f ( n ) ( t ) ( a ) instanceof e . LT ) ;
                                } ;
                            } ;
                        } ;

                    t . Ord = u ;
                    t . compare = f ;
                    t . greaterThanOrEq = s ;
                    t . min = function ( n ) {
                        return function ( t ) {
                            return function ( a ) {
                                var r = f ( n ) ( t ) ( a ) ;
                                if ( r instanceof e . LT )
                                    return t ;
                                if ( r instanceof e . EQ )
                                    return t ;
                                if ( r instanceof e . GT )
                                    return a ;
                                throw new Error ( "Failed pattern match at Data.Ord (line 119, column 3 - line 122, column 12): " + [ r . constructor . name ] ) ;
                            } ;
                        } ;
                    } ;
                    t . abs = function ( n ) {
                        return function ( t ) {
                            return function ( a ) {
                                return s ( n ) ( a ) ( i . zero ( t . Semiring0 ( ) ) ) ? a : o . negate ( t ) ( a ) ;
                            } ;
                        } ;
                    } ;
                    t . ordInt = c ;
                } ( n [ "Data.Ord" ] = n [ "Data.Ord" ] || {} ) ;

                // Data.Bounded module definition (part 2).
                ! function ( t ) {
                    "use strict" ;
                    var a = n [ "Data.Bounded" ] ,
                        r = n [ "Data.Ord" ] ,
                        e = (
                            n [ "Data.Ordering" ] ,
                            n [ "Data.Unit" ] ,
                            function ( n , t , a ) {
                                this . Ord0 = n ;
                                this . bottom = t ;
                                this . top = a ;
                            }
                        ) ,
                        o = new e ( function ( ) {
                            return r . ordInt ;
                        } , a . bottomInt , a . topInt ) ;

                    t . Bounded = e ;
                    t . bottom = function ( n ) {
                        return n . bottom ;
                    } ;
                    t . top = function ( n ) {
                        return n . top ;
                    } ;
                    t . boundedInt = o ;
                } ( n [ "Data.Bounded" ] = n [ "Data.Bounded" ] || {} ) ;

                // Data.Maybe module definition.
                ! function ( t ) {
                    "use strict" ;
                    n [ "Control.Alt" ] ;
                    n [ "Control.Alternative" ] ;
                    n [ "Control.Applicative" ] ;
                    var a = n [ "Control.Apply" ] ,
                        r = n [ "Control.Bind" ] ,
                        e = (
                            n [ "Control.Category" ] ,
                            n [ "Control.Extend" ] ,
                            n [ "Control.Monad" ] ,
                            n [ "Control.MonadZero" ] ,
                            n [ "Control.Plus" ] ,
                            n [ "Data.Bounded" ] ,
                            n [ "Data.Eq" ] ,
                            n [ "Data.Function" ] ,
                            n [ "Data.Functor" ]
                        ) ,
                        o = (
                            n [ "Data.Functor.Invariant" ] ,
                            n [ "Data.Monoid" ] ,
                            n [ "Data.Ord" ] ,
                            n [ "Data.Ordering" ] ,
                            n [ "Data.Semigroup" ] ,
                            n [ "Data.Show" ] ,
                            n [ "Data.Unit" ] ,
                            n . Prelude ,
                            function ( ) {
                                function n ( ) { }
                                return n . value = new n , n ;
                            } ( )
                        ) ,
                        i = function ( ) {
                            function n ( n ) {
                                this . value0 = n ;
                            }
                            return n . create = function ( t ) {
                                return new n ( t ) ;
                            } , n ;
                        } ( ) ,
                        u = new e . Functor ( function ( n ) {
                            return function ( t ) {
                                return t instanceof i ? new i ( n ( t . value0 ) ) : o . value ;
                            } ;
                        } ) ,
                        c = new a . Apply ( function ( ) {
                            return u ;
                        } , function ( n ) {
                            return function ( t ) {
                                if ( n instanceof i )
                                    return e . map ( u ) ( n . value0 ) ( t ) ;
                                if ( n instanceof o )
                                    return o . value ;
                                throw new Error ( "Failed pattern match at Data.Maybe (line 67, column 1 - line 67, column 35): " + [ n . constructor . name , t . constructor . name ] ) ;
                            } ;
                        } ) ,
                        f = new r . Bind ( function ( ) {
                            return c ;
                        } , function ( n ) {
                            return function ( t ) {
                                if ( n instanceof i )
                                    return t ( n . value0 ) ;
                                if ( n instanceof o )
                                    return o . value ;
                                throw new Error ( "Failed pattern match at Data.Maybe (line 125, column 1 - line 125, column 33): " + [ n . constructor . name , t . constructor . name ] ) ;
                            } ;
                        } ) ;

                    t . Nothing = o ;
                    t . Just = i ;
                    t . functorMaybe = u ;
                    t . applyMaybe = c ;
                    t . bindMaybe = f ;
                } ( n [ "Data.Maybe" ] = n [ "Data.Maybe" ] || {} ) ;

                // Data.Either module definition.
                ! function ( t ) {
                    "use strict" ;
                    n [ "Control.Alt" ] ;
                    var a = n [ "Control.Applicative" ] ,
                        r = n [ "Control.Apply" ] ,
                        e = (
                            n [ "Control.Bind" ] ,
                            n [ "Control.Extend" ] ,
                            n [ "Control.Monad" ] ,
                            n [ "Control.Semigroupoid" ] ,
                            n [ "Data.Bifoldable" ] ,
                            n [ "Data.Bifunctor" ] ,
                            n [ "Data.Bitraversable" ] ,
                            n [ "Data.Bounded" ] ,
                            n [ "Data.Eq" ] ,
                            n [ "Data.Foldable" ] ,
                            n [ "Data.FoldableWithIndex" ] ,
                            n [ "Data.Function" ] ,
                            n [ "Data.Functor" ]
                        ) ,
                        o = (
                            n [ "Data.Functor.Invariant" ] ,
                            n [ "Data.FunctorWithIndex" ] ,
                            n [ "Data.Maybe" ] ,
                            n [ "Data.Monoid" ] ,
                            n [ "Data.Ord" ] ,
                            n [ "Data.Ordering" ] ,
                            n [ "Data.Semigroup" ] ,
                            n [ "Data.Show" ] ,
                            n [ "Data.Traversable" ] ,
                            n [ "Data.TraversableWithIndex" ] ,
                            n [ "Data.Unit" ] ,
                            n . Prelude ,
                            function ( ) {
                                function n ( n ) {
                                    this . value0 = n ;
                                }
                                return n . create = function ( t ) {
                                    return new n ( t ) ;
                                } , n ;
                            } ( )
                        ) ,
                        i = function ( ) {
                            function n ( n ) {
                                this . value0 = n ;
                            }
                            return n . create = function ( t ) {
                                return new n ( t ) ;
                            } , n ;
                        } ( ) ,
                        u = new e . Functor ( function ( n ) {
                            return function ( t ) {
                                if ( t instanceof o )
                                    return new o ( t . value0 ) ;
                                if ( t instanceof i )
                                    return new i ( n ( t . value0 ) ) ;
                                throw new Error ( "Failed pattern match at Data.Either (line 38, column 8 - line 38, column 52): " + [ t . constructor . name ] ) ;
                            } ;
                        } ) ,
                        c = new r . Apply ( function ( ) {
                            return u ;
                        } , function ( n ) {
                            return function ( t ) {
                                if ( n instanceof o )
                                    return new o ( n . value0 ) ;
                                if ( n instanceof i )
                                    return e . map ( u ) ( n . value0 ) ( t ) ;
                                throw new Error ( "Failed pattern match at Data.Either (line 82, column 1 - line 82, column 41): " + [ n . constructor . name , t . constructor . name ] ) ;
                            } ;
                        } ) ,
                        f = new a . Applicative ( function ( ) {
                            return c ;
                        } , i . create ) ;

                    t . Left = o ;
                    t . Right = i ;
                    t . functorEither = u ;
                    t . applyEither = c ;
                    t . applicativeEither = f ;
                } ( n [ "Data.Either" ] = n [ "Data.Either" ] || {} ) ;

                // Partial.Unsafe module definition (part 1).
                ! function ( t ) {
                    "use strict" ;
                    ( n [ "Partial.Unsafe" ] = n [ "Partial.Unsafe" ] || {} ) . unsafePartial = function ( n ) {
                        return n ( ) ;
                    } ;
                } ( ) ;

                // Partial module definition (part 1).
                ! function ( t ) {
                    "use strict" ;
                    ( n [ "Partial" ] = n [ "Partial" ] || {} ) . crashWith = function ( ) {
                        return function ( n ) {
                            throw new Error ( n ) ;
                        } ;
                    } ;
                } ( ) ;

                // Partial module definition (part 2).
                ! function ( t ) {
                    "use strict" ;
                    var a = n . Partial ;
                    t . crashWith = a . crashWith ;
                } ( n . Partial = n . Partial || {} ) ;

                // Partial.Unsafe module definition (part 2).
                ! function ( t ) {
                    "use strict" ;
                    var a = n [ "Partial.Unsafe" ] ,
                        r = n . Partial ;
                    t . unsafeCrashWith = function ( n ) {
                        return a . unsafePartial ( function ( t ) {
                            return r . crashWith ( t ) ( n ) ;
                        } ) ;
                    } ;
                } ( n [ "Partial.Unsafe" ] = n [ "Partial.Unsafe" ] || {} ) ;

                // Control.Monad.Rec.Class module definition.
                ! function ( t ) {
                    "use strict" ;
                    n [ "Control.Applicative" ] ;
                    n [ "Control.Bind" ] ;
                    n [ "Control.Monad" ] ;
                    n [ "Control.Semigroupoid" ] ;
                    n [ "Data.Bifunctor" ] ;
                    n [ "Data.Either" ] ;
                    n [ "Data.Functor" ] ;
                    n [ "Data.Identity" ] ;
                    n [ "Data.Maybe" ] ;
                    n [ "Data.Unit" ] ;
                    n . Effect ;
                    n [ "Effect.Ref" ] ;
                    n [ "Partial.Unsafe" ] ;
                    n . Prelude ;

                    var a = function ( ) {
                        function n ( n ) {
                            this . value0 = n ;
                        }
                        return n . create = function ( t ) {
                            return new n ( t ) ;
                        } , n ;
                    } ( ) ,
                        r = function ( ) {
                            function n ( n ) {
                                this . value0 = n ;
                            }
                            return n . create = function ( t ) {
                                return new n ( t ) ;
                            } , n ;
                        } ( ) ;

                    t . Loop = a ;
                    t . Done = r ;
                    t . tailRec = function ( n ) {
                        return function ( t ) {
                            return function ( t ) {
                                var e , o = ! 1 ;
                                function i ( e ) {
                                    if ( ! ( e instanceof a ) ) {
                                        if ( e instanceof r )
                                            return o = ! 0 , e . value0 ;
                                        throw new Error ( "Failed pattern match at Control.Monad.Rec.Class (line 91, column 3 - line 91, column 25): " + [ e . constructor . name ] ) ;
                                    }
                                    t = n ( e . value0 ) ;
                                }
                                for ( ; ! o ; )
                                    e = i ( t ) ;
                                return e ;
                            } ( n ( t ) ) ;
                        } ;
                    } ;
                } ( n [ "Control.Monad.Rec.Class" ] = n [ "Control.Monad.Rec.Class" ] || {} ) ;

                // Data.Int module definition (part 1).
                ! function ( t ) {
                    "use strict" ;
                    ( n [ "Data.Int" ] = n [ "Data.Int" ] || {} ) . fromStringAsImpl = function ( n ) {
                        return function ( t ) {
                            return function ( a ) {
                                var r ;
                                r = a < 11
                                    ? "[0-" + ( a - 1 ) . toString ( ) + "]"
                                    : 11 === a
                                        ? "[0-9a]"
                                        : "[0-9a-" + String . fromCharCode ( 86 + a ) + "]" ;
                                var e = new RegExp ( "^[\\+\\-]?" + r + "+$" , "i" ) ;
                                return function ( r ) {
                                    if ( e . test ( r ) ) {
                                        var o = parseInt ( r , a ) ;
                                        return ( 0 | o ) === o ? n ( o ) : t ;
                                    }
                                    return t ;
                                } ;
                            } ;
                        } ;
                    } ;
                } ( ) ;

                // Data.Boolean module definition.
                ! function ( t ) {
                    "use strict" ;
                    ( n [ "Data.Boolean" ] = n [ "Data.Boolean" ] || {} ) . otherwise = ! 0 ;
                } ( ) ;

                // Data.Int module definition (part 2).
                ! function ( t ) {
                    "use strict" ;
                    var a = n [ "Data.Int" ] ,
                        r = (
                            n [ "Control.Category" ] ,
                            n [ "Control.Semigroupoid" ] ,
                            n [ "Data.Boolean" ] ,
                            n [ "Data.Bounded" ] ,
                            n [ "Data.CommutativeRing" ] ,
                            n [ "Data.DivisionRing" ] ,
                            n [ "Data.Eq" ] ,
                            n [ "Data.EuclideanRing" ] ,
                            n [ "Data.HeytingAlgebra" ] ,
                            n [ "Data.Int.Bits" ] ,
                            n [ "Data.Maybe" ]
                        ) ,
                        e = (
                            n [ "Data.Ord" ] ,
                            n [ "Data.Ordering" ] ,
                            n [ "Data.Ring" ] ,
                            n [ "Data.Semiring" ] ,
                            n [ "Data.Show" ] ,
                            n . Global ,
                            n . Math ,
                            n . Prelude ,
                            a . fromStringAsImpl ( r . Just . create ) ( r . Nothing . value )
                        ) ,
                        o = e ( 10 ) ;

                    t . fromString = o ;
                    t . fromStringAs = e ;
                } ( n [ "Data.Int" ] = n [ "Data.Int" ] || {} ) ;

                // Data.String.CodeUnits module definition (part 1).
                ! function ( n ) {
                    "use strict" ;
                    n . length = function ( n ) {
                        return n . length ;
                    } ;
                    n . _slice = function ( n ) {
                        return function ( t ) {
                            return function ( a ) {
                                return a . slice ( n , t ) ;
                            } ;
                        } ;
                    } ;
                } ( n [ "Data.String.CodeUnits" ] = n [ "Data.String.CodeUnits" ] || {} ) ;

                // Data.String.CodeUnits module definition (part 2).
                ! function ( t ) {
                    "use strict" ;
                    var a = n [ "Data.String.CodeUnits" ] ,
                        r = (
                            n [ "Control.Semigroupoid" ] ,
                            n [ "Data.Boolean" ]
                        ) ,
                        e = (
                            n [ "Data.Eq" ] ,
                            n [ "Data.Function" ] ,
                            n [ "Data.HeytingAlgebra" ] ,
                            n [ "Data.Maybe" ]
                        ) ;
                    n [ "Data.Ord" ] ,
                        n [ "Data.Ring" ] ,
                        n [ "Data.Semiring" ] ,
                        n [ "Data.String.Pattern" ] ,
                        n [ "Data.String.Unsafe" ] ,
                        n . Prelude ;

                    t . slice = function ( n ) {
                        return function ( t ) {
                            return function ( o ) {
                                var i = a . length ( o ) ,
                                    u = function ( n ) {
                                        if ( n < 0 )
                                            return i + n | 0 ;
                                        if ( r . otherwise )
                                            return n ;
                                        throw new Error ( "Failed pattern match at Data.String.CodeUnits (line 314, column 5 - line 315, column 27): " + [ n . constructor . name ] ) ;
                                    } ,
                                    c = u ( t ) ,
                                    f = u ( n ) ;
                                return f < 0 || f >= i || c < 0 || c > i || f > c
                                    ? e . Nothing . value
                                    : new e . Just ( a . _slice ( n ) ( t ) ( o ) ) ;
                            } ;
                        } ;
                    } ;
                } ( n [ "Data.String.CodeUnits" ] = n [ "Data.String.CodeUnits" ] || {} ) ;

                // Data.String.Common module definition (part 1).
                ! function ( t ) {
                    "use strict" ;
                    ( n [ "Data.String.Common" ] = n [ "Data.String.Common" ] || {} ) . trim = function ( n ) {
                        return n . trim ( ) ;
                    } ;
                } ( ) ;

                // Data.String.Common module definition (part 2).
                ! function ( t ) {
                    "use strict" ;
                    var a = n [ "Data.String.Common" ] ;
                    n [ "Data.Eq" ] ,
                        n [ "Data.Ordering" ] ,
                        n [ "Data.String.Pattern" ] ,
                        n . Prelude ;

                    t . trim = a . trim ;
                } ( n [ "Data.String.Common" ] = n [ "Data.String.Common" ] || {} ) ;

                // AtCoder.ABC114.B module definition. This is the main logic.
                ! function ( t ) {
                    "use strict" ;
                    var a = n [ "Control.Applicative" ] ,
                        r = n [ "Control.Bind" ] ,
                        e = n [ "Control.Monad.Rec.Class" ] ,
                        o = n [ "Data.Bounded" ] ,
                        i = n [ "Data.Either" ] ,
                        u = n [ "Data.Int" ] ,
                        c = n [ "Data.Maybe" ] ,
                        f = n [ "Data.Ord" ] ,
                        s = n [ "Data.Ring" ] ,
                        l = (
                            n [ "Data.Semiring" ] ,
                            n [ "Data.Show" ]
                        ) ,
                        D = (
                            n [ "Data.String" ] ,
                            n [ "Data.String.CodeUnits" ]
                        ) ,
                        d = n [ "Data.String.Common" ] ,
                        m = (
                            n [ "Debug.Trace" ] ,
                            n [ "Partial.Unsafe" ]
                        ) ,
                        p = (
                            n . Prelude ,
                            function ( n ) {
                                var t = d . trim ( n ) ;
                                return a . pure ( i . applicativeEither ) ( l . show ( l . showInt ) ( function ( n ) {
                                    return e . tailRec ( function ( t ) {
                                        var a = r . bind ( c . bindMaybe ) ( D . slice ( t . i ) ( t . i + 3 | 0 ) ( n ) ) ( u . fromString ) ;
                                        if ( a instanceof c . Nothing )
                                            return new e . Done ( t . r ) ;
                                        if ( a instanceof c . Just )
                                            return new e . Loop ( {
                                                i : t . i + 1 | 0 ,
                                                r : f . min ( f . ordInt ) ( t . r ) ( f . abs ( f . ordInt ) ( s . ringInt ) ( a . value0 - 753 | 0 ) )
                                            } ) ;
                                        throw new Error ( "Failed pattern match at AtCoder.ABC114.B (line 33, column 7 - line 39, column 13): " + [ a . constructor . name ] ) ;
                                    } ) ( {
                                        i : 0 ,
                                        r : o . top ( o . boundedInt )
                                    } ) ;
                                } ( t ) ) ) ;
                            }
                        ) ;

                    t . solve = function ( n ) {
                        var t = p ( n ) ;
                        if ( t instanceof i . Left )
                            return m . unsafeCrashWith ( t . value0 ) ;
                        if ( t instanceof i . Right )
                            return t . value0 ;
                        throw new Error ( "Failed pattern match at AtCoder.ABC114.B (line 20, column 3 - line 22, column 24): " + [ t . constructor . name ] ) ;
                    } ;
                } ( n [ "AtCoder.ABC114.B" ] = n [ "AtCoder.ABC114.B" ] || {} ) ;

                // Effect.Console module definition (part 1).
                ! function ( t ) {
                    "use strict" ;
                    ( n [ "Effect.Console" ] = n [ "Effect.Console" ] || {} ) . log = function ( n ) {
                        return function ( ) {
                            return console . log ( n ) , {} ;
                        } ;
                    } ;
                } ( ) ;

                // Effect.Console module definition (part 2).
                ! function ( t ) {
                    "use strict" ;
                    var a = n [ "Effect.Console" ] ;
                    n [ "Data.Show" ] ,
                        n [ "Data.Unit" ] ,
                        n . Effect ;

                    t . log = a . log ;
                } ( n [ "Effect.Console" ] = n [ "Effect.Console" ] || {} ) ;

                // Node.Encoding module definition.
                ! function ( t ) {
                    "use strict" ;
                    n [ "Node.Encoding" ] ;
                    var a = n [ "Data.Show" ] ,
                        r = (
                            n . Prelude ,
                            function ( ) {
                                function n ( ) { }
                                return n . value = new n , n ;
                            } ( )
                        ) ,
                        e = function ( ) {
                            function n ( ) { }
                            return n . value = new n , n ;
                        } ( ) ,
                        o = function ( ) {
                            function n ( ) { }
                            return n . value = new n , n ;
                        } ( ) ,
                        i = function ( ) {
                            function n ( ) { }
                            return n . value = new n , n ;
                        } ( ) ,
                        u = function ( ) {
                            function n ( ) { }
                            return n . value = new n , n ;
                        } ( ) ,
                        c = function ( ) {
                            function n ( ) { }
                            return n . value = new n , n ;
                        } ( ) ,
                        f = function ( ) {
                            function n ( ) { }
                            return n . value = new n , n ;
                        } ( ) ,
                        s = function ( ) {
                            function n ( ) { }
                            return n . value = new n , n ;
                        } ( ) ,
                        l = new a . Show ( function ( n ) {
                            if ( n instanceof r )
                                return "ASCII" ;
                            if ( n instanceof e )
                                return "UTF8" ;
                            if ( n instanceof o )
                                return "UTF16LE" ;
                            if ( n instanceof i )
                                return "UCS2" ;
                            if ( n instanceof u )
                                return "Base64" ;
                            if ( n instanceof c )
                                return "Latin1" ;
                            if ( n instanceof f )
                                return "Binary" ;
                            if ( n instanceof s )
                                return "Hex" ;
                            throw new Error ( "Failed pattern match at Node.Encoding (line 19, column 1 - line 19, column 39): " + [ n . constructor . name ] ) ;
                        } ) ;

                    t . ASCII = r ;
                    t . UTF8 = e ;
                    t . UTF16LE = o ;
                    t . UCS2 = i ;
                    t . Base64 = u ;
                    t . Latin1 = c ;
                    t . Binary = f ;
                    t . Hex = s ;
                    t . showEncoding = l ;
                } ( n [ "Node.Encoding" ] = n [ "Node.Encoding" ] || {} ) ;

                // Node.FS.Internal module definition (part 1).
                ! function ( t ) {
                    "use strict" ;
                    ( n [ "Node.FS.Internal" ] = n [ "Node.FS.Internal" ] || {} ) . unsafeRequireFS = require ( "fs" ) ;
                } ( ) ;

                // Unsafe.Coerce module definition (part 1).
                ! function ( t ) {
                    "use strict" ;
                    ( n [ "Unsafe.Coerce" ] = n [ "Unsafe.Coerce" ] || {} ) . unsafeCoerce = function ( n ) {
                        return n ;
                    } ;
                } ( ) ;

                // Unsafe.Coerce module definition (part 2).
                ! function ( t ) {
                    "use strict" ;
                    var a = n [ "Unsafe.Coerce" ] ;
                    t . unsafeCoerce = a . unsafeCoerce ;
                } ( n [ "Unsafe.Coerce" ] = n [ "Unsafe.Coerce" ] || {} ) ;

                // Node.FS.Internal module definition (part 2).
                ! function ( t ) {
                    "use strict" ;
                    var a = n [ "Node.FS.Internal" ] ,
                        r = (
                            n . Effect ,
                            n . Prelude ,
                            n [ "Unsafe.Coerce" ] . unsafeCoerce
                        ) ;

                    t . mkEffect = r ;
                    t . unsafeRequireFS = a . unsafeRequireFS ;
                } ( n [ "Node.FS.Internal" ] = n [ "Node.FS.Internal" ] || {} ) ;

                // Node.FS.Sync module definition.
                ! function ( t ) {
                    "use strict" ;
                    n [ "Control.Bind" ] ;
                    n [ "Control.Semigroupoid" ] ;
                    n [ "Data.DateTime" ] ;
                    n [ "Data.DateTime.Instant" ] ;
                    n [ "Data.EuclideanRing" ] ;
                    n [ "Data.Function" ] ;
                    n [ "Data.Function.Uncurried" ] ;
                    n [ "Data.Functor" ] ;
                    n [ "Data.Int" ] ;
                    n [ "Data.Maybe" ] ;
                    n [ "Data.Nullable" ] ;

                    var a = n [ "Data.Show" ] ,
                        r = (
                            n [ "Data.Time.Duration" ] ,
                            n . Effect ,
                            n [ "Node.Buffer" ] ,
                            n [ "Node.Encoding" ]
                        ) ,
                        e = (
                            n [ "Node.FS" ] ,
                            n [ "Node.FS.Internal" ]
                        ) ,
                        o = (
                            n [ "Node.FS.Perms" ] ,
                            n [ "Node.FS.Stats" ] ,
                            n [ "Node.Path" ] ,
                            n . Prelude ,
                            e . unsafeRequireFS
                        ) ;

                    t . readTextFile = function ( n ) {
                        return function ( t ) {
                            return e . mkEffect ( function ( e ) {
                                return o . readFileSync ( t , {
                                    encoding : a . show ( r . showEncoding ) ( n )
                                } ) ;
                            } ) ;
                        } ;
                    } ;
                } ( n [ "Node.FS.Sync" ] = n [ "Node.FS.Sync" ] || {} ) ;

                // Main module definition. This is the entry point.
                ! function ( t ) {
                    "use strict" ;
                    var a = n [ "AtCoder.ABC114.B" ] ,
                        r = (
                            n [ "Control.Applicative" ] ,
                            n [ "Control.Bind" ] ,
                            n . Effect ,
                            n [ "Effect.Console" ]
                        ) ,
                        e = n [ "Node.Encoding" ] ,
                        o = n [ "Node.FS.Sync" ] ;
                    n . Prelude ;

                    t . main = function ( ) {
                        var n = o . readTextFile ( e . UTF8 . value ) ( "/dev/stdin" ) ( ) ,
                            t = a . solve ( n ) ;
                        return r . log ( t ) ( ) ;
                    } ;
                } ( n . Main = n . Main || {} ) ;

                // Call the main function to start execution.
                n . Main . main ( ) ;

            } ,
            {}
        ]
    } ,
    // The second argument 'r' is the cache object.
    {} ,
    // The third argument 't' is an array of entry point module IDs.
    [ "Focm" ] ,
    // The fourth argument 'n' is the global object name for exports (null here).
    null
) ;