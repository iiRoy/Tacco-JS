parcelRequire = function ( e , r , t , n ) {

  // This is the core Parcel module loader function.
  var i , o = "function" == typeof parcelRequire && parcelRequire , u = "function" == typeof require && require ;

  function f ( t , n ) { // Main module loading function

    if ( ! r [ t ] ) { // Check if module is already loaded

      if ( ! e [ t ] ) { // Check if module definition exists

        /*
         * Attempt to resolve module via parent Parcel instance
         * or Node.js require if available.
         */
        var i = "function" == typeof parcelRequire && parcelRequire ;

        if ( ! n && i ) {
          return i ( t , ! 0 ) ;
        }

        if ( o ) {
          return o ( t , ! 0 ) ;
        }

        if ( u && "string" == typeof t ) {
          return u ( t ) ;
        }

        // If module cannot be found, throw an error.
        var c = new Error ( "Cannot find module '" + t + "'" ) ;
        throw c . code = "MODULE_NOT_FOUND" , c ;
      }

      p . resolve = function ( r ) {
        return e [ t ] [ 1 ] [ r ] || r ;
      } ;

      p . cache = {} ;

      // Create a new module instance and store it.
      var l = r [ t ] = new f . Module ( t ) ;

      // Execute the module's code.
      e [ t ] [ 0 ] . call ( l . exports , p , l , l . exports , this ) ;
    }

    return r [ t ] . exports ;

    function p ( e ) {
      return f ( p . resolve ( e ) ) ;
    }
  }

  // Set Parcel-specific properties on the loader function.
  f . isParcelRequire = ! 0 ;

  f . Module = function ( e ) {
    this . id = e ;
    this . bundle = f ;
    this . exports = {} ;
  } ;

  f . modules = e ;
  f . cache = r ;
  f . parent = o ;

  // Register a new module.
  f . register = function ( r , t ) {
    e [ r ] = [ function ( e , r ) { r . exports = t ; } , {} ] ;
  } ;

  // Iterate through and load initial bundle modules.
  for ( var c = 0 ; c < t . length ; c ++ ) {
    try {
      f ( t [ c ] ) ;
    } catch ( e ) {
      i || ( i = e ) ; // Store the first error encountered.
    }
  }

  // Handle exports for the bundle.
  if ( t . length ) {
    var l = f ( t [ t . length - 1 ] ) ;

    if ( "object" == typeof exports && "undefined" != typeof module ) {
      module . exports = l ;
    } else if ( "function" == typeof define && define . amd ) {
      define ( function ( ) { return l ; } ) ;
    } else if ( n ) {
      this [ n ] = l ;
    }
  }

  // Update global parcelRequire and rethrow error if any.
  parcelRequire = f ;
  if ( i ) {
    throw i ;
  }

  return f ;
} ( { // Start of module definitions object
  "Focm" : [ function ( require , module , exports ) {

    // Main application module "Focm"
    var n = {} ;

    ! function ( n ) {
      "use strict" ;

      n [ "Control.Apply" ] = n [ "Control.Apply" ] || {} ;

      var t = n [ "Control.Apply" ] ;

      // Constructor for Apply
      t . Apply = function ( n , t ) {
        this . Functor0 = n ;
        this . apply = t ;
      } ;

      // Apply function
      t . apply = function ( n ) {
        return n . apply ;
      } ;
    } ( n ) ;

    ! function ( n ) {
      "use strict" ;

      n [ "Control.Applicative" ] = n [ "Control.Applicative" ] || {} ;

      var t = n [ "Control.Applicative" ] ,
        i = n [ "Control.Apply" ] ,
        r = function ( n ) {
          return n . pure ;
        } ;

      // Constructor for Applicative
      t . Applicative = function ( n , t ) {
        this . Apply0 = n ;
        this . pure = t ;
      } ;

      // Pure function
      t . pure = r ;

      // liftA1 function
      t . liftA1 = function ( n ) {
        return function ( t ) {
          return function ( e ) {
            return i . apply ( n . Apply0 ( ) ) ( r ( n ) ( t ) ) ( e ) ;
          } ;
        } ;
      } ;
    } ( n ) ;

    ! function ( n ) {
      "use strict" ;

      n . intDegree = function ( n ) {
        return Math . min ( Math . abs ( n ) , 2147483647 ) ;
      } ;

      n . intDiv = function ( n ) {
        return function ( t ) {
          return 0 === t ? 0 : t > 0 ? Math . floor ( n / t ) : - Math . floor ( n / - t ) ;
        } ;
      } ;

      n . intMod = function ( n ) {
        return function ( t ) {
          if ( 0 === t ) {
            return 0 ;
          }
          var i = Math . abs ( t ) ;
          return ( n % i + i ) % i ;
        } ;
      } ;
    } ( n [ "Data.EuclideanRing" ] = n [ "Data.EuclideanRing" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      ( n [ "Data.Ring" ] = n [ "Data.Ring" ] || {} ) . intSub = function ( n ) {
        return function ( t ) {
          return n - t | 0 ;
        } ;
      } ;
    } ( ) ;

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

    ! function ( n ) {
      "use strict" ;

      n [ "Data.Semiring" ] = n [ "Data.Semiring" ] || {} ;

      var t = n [ "Data.Semiring" ] ,
        i = n [ "Data.Semiring" ] ,
        r = function ( n , t , i , r ) {
          this . add = n ;
          this . mul = t ;
          this . one = i ;
          this . zero = r ;
        } ,
        e = new r ( i . intAdd , i . intMul , 1 , 0 ) ;

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
    } ( n ) ;

    ! function ( n ) {
      "use strict" ;

      n [ "Data.Ring" ] = n [ "Data.Ring" ] || {} ;

      var t = n [ "Data.Ring" ] ,
        i = n [ "Data.Ring" ] ,
        r = n [ "Data.Semiring" ] ,
        e = function ( n , t ) {
          this . Semiring0 = n ;
          this . sub = t ;
        } ,
        o = new e ( function ( ) {
          return r . semiringInt ;
        } , i . intSub ) ;

      t . Ring = e ;

      t . sub = function ( n ) {
        return n . sub ;
      } ;

      t . ringInt = o ;
    } ( n ) ;

    ! function ( n ) {
      "use strict" ;

      n [ "Data.CommutativeRing" ] = n [ "Data.CommutativeRing" ] || {} ;

      var t = n [ "Data.CommutativeRing" ] ,
        i = n [ "Data.Ring" ] ,
        r = function ( n ) {
          this . Ring0 = n ;
        } ,
        e = new r ( function ( ) {
          return i . ringInt ;
        } ) ;

      t . CommutativeRing = r ;

      t . commutativeRingInt = e ;
    } ( n ) ;

    ! function ( n ) {
      "use strict" ;

      n [ "Data.EuclideanRing" ] = n [ "Data.EuclideanRing" ] || {} ;

      var t = n [ "Data.EuclideanRing" ] ,
        i = n [ "Data.EuclideanRing" ] ,
        r = n [ "Data.CommutativeRing" ] ,
        e = function ( n , t , i , r ) {
          this . CommutativeRing0 = n ;
          this . degree = t ;
          this . div = i ;
          this . mod = r ;
        } ,
        o = new e ( function ( ) {
          return r . commutativeRingInt ;
        } , i . intDegree , i . intDiv , i . intMod ) ;

      t . EuclideanRing = e ;

      t . degree = function ( n ) {
        return n . degree ;
      } ;

      t . div = function ( n ) {
        return n . div ;
      } ;

      t . mod = function ( n ) {
        return n . mod ;
      } ;

      t . euclideanRingInt = o ;
    } ( n ) ;

    ! function ( t ) {
      "use strict" ;

      ( n [ "Data.Int" ] = n [ "Data.Int" ] || {} ) . fromStringAsImpl = function ( n ) {
        return function ( t ) {
          return function ( i ) {

            var r ;
            r = i < 11 ? "[0-" + ( i - 1 ) . toString ( ) + "]" : 11 === i ? "[0-9a]" : "[0-9a-" + String . fromCharCode ( 86 + i ) + "]" ;

            var e = new RegExp ( "^[\\+\\-]?" + r + "+$" , "i" ) ;

            return function ( r ) {
              if ( e . test ( r ) ) {
                var o = parseInt ( r , i ) ;
                return ( 0 | o ) === o ? n ( o ) : t ;
              }
              return t ;
            } ;
          } ;
        } ;
      } ( ) ;
    } ( ) ;

    ! function ( n ) {
      "use strict" ;

      n [ "Data.Maybe" ] = n [ "Data.Maybe" ] || {} ;

      var t = n [ "Data.Maybe" ] ,
        i = function ( ) {
          function n ( ) {}
          return n . value = new n , n ;
        } ( ) ,
        r = function ( ) {
          function n ( n ) {
            this . value0 = n ;
          }
          return n . create = function ( t ) {
            return new n ( t ) ;
          } , n ;
        } ( ) ;

      t . Nothing = i ;
      t . Just = r ;

      t . fromJust = function ( n ) {
        return function ( n ) {
          if ( n instanceof r ) {
            return n . value0 ;
          }
          throw new Error ( "Failed pattern match at Data.Maybe (line 268, column 1 - line 268, column 46): " + [ n . constructor . name ] ) ;
        } ;
      } ;
    } ( n ) ;

    ! function ( n ) {
      "use strict" ;

      n [ "Data.Int" ] = n [ "Data.Int" ] || {} ;

      var t = n [ "Data.Int" ] ,
        i = n [ "Data.Int" ] ,
        r = n [ "Data.Maybe" ] ,
        e = i . fromStringAsImpl ( r . Just . create ) ( r . Nothing . value ) ,
        o = e ( 10 ) ;

      t . fromString = o ;
      t . fromStringAs = e ;
    } ( n ) ;

    ! function ( t ) {
      "use strict" ;

      ( n [ "Data.Show" ] = n [ "Data.Show" ] || {} ) . showIntImpl = function ( n ) {
        return n . toString ( ) ;
      } ;
    } ( ) ;

    ! function ( n ) {
      "use strict" ;

      n [ "Data.Show" ] = n [ "Data.Show" ] || {} ;

      var t = n [ "Data.Show" ] ,
        i = function ( n ) {
          this . show = n ;
        } ,
        r = new i ( n [ "Data.Show" ] . showIntImpl ) ;

      t . Show = i ;

      t . show = function ( n ) {
        return n . show ;
      } ;

      t . showInt = r ;
    } ( n ) ;

    ! function ( n ) {
      "use strict" ;

      n . split = function ( n ) {
        return function ( t ) {
          return t . split ( n ) ;
        } ;
      } ;

      n . trim = function ( n ) {
        return n . trim ( ) ;
      } ;
    } ( n [ "Data.String.Common" ] = n [ "Data.String.Common" ] || {} ) ;

    ! function ( n ) {
      "use strict" ;

      n [ "Data.String.Common" ] = n [ "Data.String.Common" ] || {} ;

      var t = n [ "Data.String.Common" ] ,
        i = n [ "Data.String.Common" ] ;

      t . split = i . split ;
      t . trim = i . trim ;
    } ( n ) ;

    ! function ( t ) {
      "use strict" ;

      ( n [ "Data.Unit" ] = n [ "Data.Unit" ] || {} ) . unit = {} ;
    } ( ) ;

    ! function ( n ) {
      "use strict" ;

      n [ "Data.Unit" ] = n [ "Data.Unit" ] || {} ;

      var t = n [ "Data.Unit" ] ,
        i = n [ "Data.Unit" ] ;

      t . unit = i . unit ;
    } ( n ) ;

    ! function ( n ) {
      "use strict" ;

      n . pureE = function ( n ) {
        return function ( ) {
          return n ;
        } ;
      } ;

      n . bindE = function ( n ) {
        return function ( t ) {
          return function ( ) {
            return t ( n ( ) ) ( ) ;
          } ;
        } ;
      } ;
    } ( n . Effect = n . Effect || {} ) ;

    ! function ( n ) {
      "use strict" ;

      n [ "Control.Bind" ] = n [ "Control.Bind" ] || {} ;

      var t = n [ "Control.Bind" ] ;

      t . Bind = function ( n , t ) {
        this . Apply0 = n ;
        this . bind = t ;
      } ;

      t . bind = function ( n ) {
        return n . bind ;
      } ;
    } ( n ) ;

    ! function ( n ) {
      "use strict" ;

      n [ "Control.Monad" ] = n [ "Control.Monad" ] || {} ;

      var t = n [ "Control.Monad" ] ,
        i = n [ "Control.Applicative" ] ,
        r = n [ "Control.Bind" ] ;

      t . Monad = function ( n , t ) {
        this . Applicative0 = n ;
        this . Bind1 = t ;
      } ;

      t . ap = function ( n ) {
        return function ( t ) {
          return function ( e ) {
            return r . bind ( n . Bind1 ( ) ) ( t ) ( function ( t ) {
              return r . bind ( n . Bind1 ( ) ) ( e ) ( function ( r ) {
                return i . pure ( n . Applicative0 ( ) ) ( t ( r ) ) ;
              } ) ;
            } ) ;
          } ;
        } ;
      } ;
    } ( n ) ;

    ! function ( n ) {
      "use strict" ;

      n [ "Data.Functor" ] = n [ "Data.Functor" ] || {} ;

      var t = n [ "Data.Functor" ] ;

      t . Functor = function ( n ) {
        this . map = n ;
      } ;

      t . map = function ( n ) {
        return n . map ;
      } ;
    } ( n ) ;

    ! function ( n ) {
      "use strict" ;

      n . Effect = n . Effect || {} ;

      var t = n . Effect ,
        i = n . Effect ,
        r = n [ "Control.Applicative" ] ,
        e = n [ "Control.Apply" ] ,
        o = n [ "Control.Bind" ] ,
        u = n [ "Control.Monad" ] ,
        a = n [ "Data.Functor" ] ,
        c = new u . Monad ( function ( ) {
          return l ;
        } , function ( ) {
          return f ;
        } ) ,
        f = new o . Bind ( function ( ) {
          return s ;
        } , i . bindE ) ,
        s = new e . Apply ( function ( ) {
          return d ;
        } , u . ap ( c ) ) ,
        l = new r . Applicative ( function ( ) {
          return s ;
        } , i . pureE ) ,
        d = new a . Functor ( r . liftA1 ( l ) ) ;

      t . functorEffect = d ;
      t . applyEffect = s ;
      t . applicativeEffect = l ;
      t . bindEffect = f ;
      t . monadEffect = c ;
    } ( n ) ;

    ! function ( n ) {
      "use strict" ;

      n [ "Node.Encoding" ] = n [ "Node.Encoding" ] || {} ;

      var t = n [ "Node.Encoding" ] ,
        i = n [ "Data.Show" ] ,
        r = function ( ) {
          function n ( ) {}
          return n . value = new n , n ;
        } ( ) ,
        e = function ( ) {
          function n ( ) {}
          return n . value = new n , n ;
        } ( ) ,
        o = function ( ) {
          function n ( ) {}
          return n . value = new n , n ;
        } ( ) ,
        u = function ( ) {
          function n ( ) {}
          return n . value = new n , n ;
        } ( ) ,
        a = function ( ) {
          function n ( ) {}
          return n . value = new n , n ;
        } ( ) ,
        c = function ( ) {
          function n ( ) {}
          return n . value = new n , n ;
        } ( ) ,
        f = function ( ) {
          function n ( ) {}
          return n . value = new n , n ;
        } ( ) ,
        s = function ( ) {
          function n ( ) {}
          return n . value = new n , n ;
        } ( ) ,
        l = new i . Show ( function ( n ) {
          if ( n instanceof r ) {
            return "ASCII" ;
          }
          if ( n instanceof e ) {
            return "UTF8" ;
          }
          if ( n instanceof o ) {
            return "UTF16LE" ;
          }
          if ( n instanceof u ) {
            return "UCS2" ;
          }
          if ( n instanceof a ) {
            return "Base64" ;
          }
          if ( n instanceof c ) {
            return "Latin1" ;
          }
          if ( n instanceof f ) {
            return "Binary" ;
          }
          if ( n instanceof s ) {
            return "Hex" ;
          }
          throw new Error ( "Failed pattern match at Node.Encoding (line 19, column 1 - line 19, column 39): " + [ n . constructor . name ] ) ;
        } ) ;

      t . ASCII = r ;
      t . UTF8 = e ;
      t . UTF16LE = o ;
      t . UCS2 = u ;
      t . Base64 = a ;
      t . Latin1 = c ;
      t . Binary = f ;
      t . Hex = s ;
      t . showEncoding = l ;
    } ( n ) ;

    ! function ( t ) {
      "use strict" ;

      ( n [ "Node.FS.Internal" ] = n [ "Node.FS.Internal" ] || {} ) . unsafeRequireFS = require ( "fs" ) ;
    } ( ) ;

    ! function ( t ) {
      "use strict" ;

      ( n [ "Unsafe.Coerce" ] = n [ "Unsafe.Coerce" ] || {} ) . unsafeCoerce = function ( n ) {
        return n ;
      } ;
    } ( ) ;

    ! function ( n ) {
      "use strict" ;

      n [ "Unsafe.Coerce" ] = n [ "Unsafe.Coerce" ] || {} ;

      var t = n [ "Unsafe.Coerce" ] ,
        i = n [ "Unsafe.Coerce" ] ;

      t . unsafeCoerce = i . unsafeCoerce ;
    } ( n ) ;

    ! function ( n ) {
      "use strict" ;

      n [ "Node.FS.Internal" ] = n [ "Node.FS.Internal" ] || {} ;

      var t = n [ "Node.FS.Internal" ] ,
        i = n [ "Node.FS.Internal" ] ,
        r = n [ "Unsafe.Coerce" ] . unsafeCoerce ;

      t . mkEffect = r ;
      t . unsafeRequireFS = i . unsafeRequireFS ;
    } ( n ) ;

    ! function ( n ) {
      "use strict" ;

      n [ "Node.FS.Sync" ] = n [ "Node.FS.Sync" ] || {} ;

      var t = n [ "Node.FS.Sync" ] ,
        i = n [ "Data.Show" ] ,
        r = n [ "Node.Encoding" ] ,
        e = n [ "Node.FS.Internal" ] ,
        o = e . unsafeRequireFS ;

      t . readTextFile = function ( n ) {
        return function ( t ) {
          return e . mkEffect ( function ( e ) {
            return o . readFileSync ( t , {
              encoding : i . show ( r . showEncoding ) ( n )
            } ) ;
          } ) ;
        } ;
      } ;
    } ( n ) ;

    ! function ( t ) {
      "use strict" ;

      ( n [ "Node.Process" ] = n [ "Node.Process" ] || {} ) . process = process ;
    } ( ) ;

    ! function ( n ) {
      "use strict" ;

      n [ "Node.Process" ] = n [ "Node.Process" ] || {} ;

      var t = n [ "Node.Process" ] ,
        i = n [ "Node.Process" ] . process . stdout ;

      t . stdout = i ;
    } ( n ) ;

    ! function ( n ) {
      "use strict" ;

      n . write = function ( n ) {
        return function ( t ) {
          return function ( i ) {
            return function ( ) {
              return n . write ( t , null , i ) ;
            } ;
          } ;
        } ;
      } ;

      n . writeStringImpl = function ( n ) {
        return function ( t ) {
          return function ( i ) {
            return function ( r ) {
              return function ( ) {
                return n . write ( i , t , r ) ;
              } ;
            } ;
          } ;
        } ;
      } ;
    } ( n [ "Node.Stream" ] = n [ "Node.Stream" ] || {} ) ;

    ! function ( n ) {
      "use strict" ;

      n [ "Node.Stream" ] = n [ "Node.Stream" ] || {} ;

      var t = n [ "Node.Stream" ] ,
        i = n [ "Node.Stream" ] ,
        r = n [ "Data.Show" ] ,
        e = n [ "Node.Encoding" ] ;

      t . writeString = function ( n ) {
        return function ( t ) {
          return i . writeStringImpl ( n ) ( r . show ( e . showEncoding ) ( t ) ) ;
        } ;
      } ;
    } ( n ) ;

    ! function ( n ) {
      "use strict" ;

      n . ABC087A = n . ABC087A || {} ;

      var t = n . ABC087A ,
        i = n [ "Control.Applicative" ] ,
        r = n [ "Data.EuclideanRing" ] ,
        e = n [ "Data.Int" ] ,
        o = n [ "Data.Maybe" ] ,
        u = n [ "Data.Show" ] ,
        a = n [ "Data.String.Common" ] ,
        c = n [ "Data.Unit" ] ,
        f = n . Effect ,
        s = n [ "Node.Encoding" ] ,
        l = n [ "Node.FS.Sync" ] ,
        d = n [ "Node.Process" ] ,
        m = n [ "Node.Stream" ] ,
        p = ( a . split ( " " ) , function ( n ) {
          var t ,
            i = ( t = n , a . split ( "\n" ) ( a . trim ( t ) ) ) ,
            c = o . fromJust ( ) ( e . fromString ( i [ 0 ] ) ) ,
            f = o . fromJust ( ) ( e . fromString ( i [ 2 ] ) ) ,
            s = o . fromJust ( ) ( e . fromString ( i [ 1 ] ) ) ;
          return u . show ( u . showInt ) ( r . mod ( r . euclideanRingInt ) ( c - s | 0 ) ( f ) ) + "\n" ;
        } ) ;

      t . main = function ( ) {
        // Read input from /dev/stdin with UTF8 encoding
        var n = l . readTextFile ( s . UTF8 . value ) ( "/dev/stdin" ) ( ) ;

        // Solve the problem and write the result to stdout
        m . writeString ( d . stdout ) ( s . UTF8 . value ) ( p ( n ) ) ( i . pure ( f . applicativeEffect ) ( c . unit ) ) ( ) ;

        return c . unit ;
      } ;

      t . solve = p ;
    } ( n ) ;

    // Execute the main function of ABC087A
    n . ABC087A . main ( ) ;

  } ]
} , {} , [ "Focm" ] , null ) ;

// End of Parcel bundle
/*
 * This entire file is a Type I clone,
 * preserving all functionality while extensively
 * altering whitespace and adding comments.
 */