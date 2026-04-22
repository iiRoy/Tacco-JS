parcelRequire = function ( e , r , t , n ) {
  // Declare a variable for potential error tracking.
  var i ;

  // Check if parcelRequire is already defined globally.
  var o = "function" == typeof parcelRequire && parcelRequire ;

  // Check if Node.js 'require' is available.
  var u = "function" == typeof require && require ;

  /**
   * Main module loading function.
   * @param {string} t - Module ID.
   * @param {boolean} n - Flag indicating if it's a non-strict require.
   */
  function f ( t , n ) {
    // If the module is not already in the cache.
    if ( ! r [ t ] ) {
      // If the module definition does not exist.
      if ( ! e [ t ] ) {
        // Attempt to load via global parcelRequire if available and not strict.
        var i = "function" == typeof parcelRequire && parcelRequire ;

        if ( ! n && i ) {
          return i ( t , ! 0 ) ;
        }

        // Attempt to load via parent parcelRequire.
        if ( o ) {
          return o ( t , ! 0 ) ;
        }

        // Attempt to load via Node.js 'require'.
        if ( u && "string" == typeof t ) {
          return u ( t ) ;
        }

        // If all attempts fail, throw an error.
        var c = new Error ( "Cannot find module '" + t + "'" ) ;
        throw c . code = "MODULE_NOT_FOUND" , c ;
      }

      // Configure module resolution for this module.
      p . resolve = function ( r ) {
        return e [ t ] [ 1 ] [ r ] || r ;
      } ;

      // Initialize module cache.
      p . cache = {} ;

      // Create a new module instance and store it in the cache.
      var l = r [ t ] = new f . Module ( t ) ;

      // Execute the module's factory function.
      e [ t ] [ 0 ] . call ( l . exports , p , l , l . exports , this ) ;
    }

    // Return the module's exports.
    return r [ t ] . exports ;

    /**
     * Helper function for internal module resolution.
     * @param {string} e - Module path to resolve.
     */
    function p ( e ) {
      return f ( p . resolve ( e ) ) ;
    }
  }

  // Mark this function as a Parcel Require instance.
  f . isParcelRequire = ! 0 ;

  // Define the Module constructor.
  f . Module = function ( e ) {
    this . id = e ;
    this . bundle = f ;
    this . exports = {} ;
  } ;

  // Expose internal modules and cache.
  f . modules = e ;
  f . cache = r ;
  f . parent = o ;

  // Register a new module definition.
  f . register = function ( r , t ) {
    e [ r ] = [ function ( e , r ) {
      r . exports = t ;
    } , {} ] ;
  } ;

  // Iterate over entry points and attempt to load them.
  for ( var c = 0 ; c < t . length ; c ++ ) {
    try {
      f ( t [ c ] ) ;
    } catch ( e ) {
      // Store the first error encountered during entry point loading.
      i || ( i = e ) ;
    }
  }

  // If there are entry points, handle their exports.
  if ( t . length ) {
    var l = f ( t [ t . length - 1 ] ) ;

    // CommonJS compatibility.
    "object" == typeof exports && "undefined" != typeof module ? module . exports = l :
    // AMD compatibility.
    "function" == typeof define && define . amd ? define ( function ( ) {
      return l ;
    } ) :
    // Global export.
    n && ( this [ n ] = l ) ;
  }

  // Update the global parcelRequire reference.
  parcelRequire = f ;

  // If an error occurred during entry point loading, rethrow it.
  if ( i ) {
    throw i ;
  }

  // Return the main module loading function.
  return f ;
} ( {
  "9xaU" : [ function ( require , module , exports ) {
    // Start of the 'big-integer' module content.
    var t = function ( e ) {
      "use strict" ;

      var r = 1e7 ; // Base for big integer calculations (10^7).
      var o = 7 ; // Number of digits in each base segment.
      var n = 9007199254740992 ; // JavaScript's MAX_SAFE_INTEGER.
      var i = h ( n ) ; // Representation of MAX_SAFE_INTEGER as a big integer array.
      var u = "0123456789abcdefghijklmnopqrstuvwxyz" ; // Default alphabet for base conversion.
      var p = "function" == typeof BigInt ; // Feature detection for BigInt.

      /**
       * Main constructor for big integers.
       * Handles various input types and base conversions.
       * @param {*} t - The value to convert.
       * @param {number} e - Base for conversion.
       * @param {string} r - Custom alphabet for base conversion.
       * @param {boolean} o - Case sensitivity flag.
       * @returns {a} A big integer instance.
       */
      function a ( t , e , r , o ) {
        // If no value is provided, return zero.
        if ( void 0 === t ) {
          return a [ 0 ] ;
        }
        // If a base is specified (or it's base 10 with no specific alphabet/case sensitivity).
        if ( void 0 !== e && ( 10 != + e || r ) ) {
          return $ ( t , e , r , o ) ;
        }
        // Otherwise, convert directly.
        return Q ( t ) ;
      }

      /**
       * Represents a large integer using an array of digits.
       * @param {number[]} t - Array of digits.
       * @param {boolean} e - Sign of the number (true for negative).
       */
      function s ( t , e ) {
        this . value = t ;
        this . sign = e ;
        this . isSmall = ! 1 ;
      }

      /**
       * Represents a small integer (within JS safe integer limits).
       * @param {number} t - The integer value.
       */
      function l ( t ) {
        this . value = t ;
        this . sign = t < 0 ;
        this . isSmall = ! 0 ;
      }

      /**
       * Represents a BigInt native type.
       * @param {BigInt} t - The BigInt value.
       */
      function f ( t ) {
        this . value = t ;
      }

      /**
       * Checks if a number is within the safe integer range.
       * @param {number} t - The number to check.
       * @returns {boolean} True if small, false otherwise.
       */
      function v ( t ) {
        return - n < t && t < n ;
      }

      /**
       * Converts a number into its internal array representation.
       * @param {number} t - The number.
       * @returns {number[]} Array representation.
       */
      function h ( t ) {
        if ( t < 1e7 ) {
          return [ t ] ;
        }
        if ( t < 1e14 ) {
          return [ t % 1e7 , Math . floor ( t / 1e7 ) ] ;
        }
        return [ t % 1e7 , Math . floor ( t / 1e7 ) % 1e7 , Math . floor ( t / 1e14 ) ] ;
      }

      /**
       * Converts an internal array representation back to a number if possible.
       * @param {number[]} t - The array representation.
       * @returns {number|number[]} The number or the array itself.
       */
      function y ( t ) {
        c ( t ) ; // Clean up leading zeros.
        var e = t . length ;

        // If it's a small array and within the MAX_SAFE_INTEGER.
        if ( e < 4 && P ( t , i ) < 0 ) {
          switch ( e ) {
          case 0 :
            return 0 ;
          case 1 :
            return t [ 0 ] ;
          case 2 :
            return t [ 0 ] + t [ 1 ] * r ;
          default :
            return t [ 0 ] + ( t [ 1 ] + t [ 2 ] * r ) * r ;
          }
        }
        return t ;
      }

      /**
       * Removes trailing zeros from a digit array.
       * @param {number[]} t - The digit array.
       */
      function c ( t ) {
        for ( var e = t . length ; 0 === t [ -- e ] ; ) ;
        t . length = e + 1 ;
      }

      /**
       * Creates an array of zeros of a given length.
       * @param {number} t - Length of the array.
       * @returns {number[]} Array of zeros.
       */
      function g ( t ) {
        for ( var e = new Array ( t ) , r = - 1 ; ++ r < t ; ) {
          e [ r ] = 0 ;
        }
        return e ;
      }

      /**
       * Floors a number if positive, ceilings if negative.
       * @param {number} t - The number.
       * @returns {number} The floored/ceiled integer.
       */
      function m ( t ) {
        return t > 0 ? Math . floor ( t ) : Math . ceil ( t ) ;
      }

      /**
       * Adds two arrays of digits.
       * @param {number[]} t - First operand.
       * @param {number[]} e - Second operand.
       * @returns {number[]} Resulting digit array.
       */
      function d ( t , e ) {
        var o , n , i = t . length , u = e . length , p = new Array ( i ) , a = 0 , s = r ;

        for ( n = 0 ; n < u ; n ++ ) {
          a = ( o = t [ n ] + e [ n ] + a ) >= s ? 1 : 0 ;
          p [ n ] = o - a * s ;
        }
        for ( ; n < i ; ) {
          a = ( o = t [ n ] + a ) === s ? 1 : 0 ;
          p [ n ++ ] = o - a * s ;
        }
        if ( a > 0 ) {
          p . push ( a ) ;
        }
        return p ;
      }

      /**
       * Adds two digit arrays, handling different lengths.
       * @param {number[]} t - First operand.
       * @param {number[]} e - Second operand.
       * @returns {number[]} Resulting digit array.
       */
      function w ( t , e ) {
        return t . length >= e . length ? d ( t , e ) : d ( e , t ) ;
      }

      /**
       * Adds a small number to a digit array.
       * @param {number[]} t - Digit array.
       * @param {number} e - Small number.
       * @returns {number[]} Resulting digit array.
       */
      function b ( t , e ) {
        var o , n , i = t . length , u = new Array ( i ) , p = r ;

        for ( n = 0 ; n < i ; n ++ ) {
          o = t [ n ] - p + e ;
          e = Math . floor ( o / p ) ;
          u [ n ] = o - e * p ;
          e += 1 ;
        }
        for ( ; e > 0 ; ) {
          u [ n ++ ] = e % p ;
          e = Math . floor ( e / p ) ;
        }
        return u ;
      }

      /**
       * Subtracts one digit array from another.
       * Assumes t >= e.
       * @param {number[]} t - Minuend.
       * @param {number[]} e - Subtrahend.
       * @returns {number[]} Resulting digit array.
       */
      function S ( t , e ) {
        var o , n , i = t . length , u = new Array ( i ) , p = r ;
        var a = 0 ; // Borrow.

        for ( o = 0 ; o < e . length ; o ++ ) {
          ( n = t [ o ] - a - e [ o ] ) < 0 ? ( n += p , a = 1 ) : a = 0 ;
          u [ o ] = n ;
        }
        for ( o = e . length ; o < i ; o ++ ) {
          if ( ! ( ( n = t [ o ] - a ) < 0 ) ) {
            u [ o ++ ] = n ;
            break ;
          }
          n += p ;
          u [ o ] = n ;
        }
        for ( ; o < i ; o ++ ) {
          u [ o ] = t [ o ] ;
        }
        c ( u ) ; // Clean up leading zeros.
        return u ;
      }

      /**
       * Subtracts a small number from a digit array.
       * @param {number[]} t - Digit array.
       * @param {number} e - Small number.
       * @param {boolean} o - Sign of the result.
       * @returns {s|l} Resulting big integer.
       */
      function q ( t , e , o ) {
        var n , i , u = t . length , p = new Array ( u ) , a = - e , f = r ;

        for ( n = 0 ; n < u ; n ++ ) {
          i = t [ n ] + a ;
          a = Math . floor ( i / f ) ;
          i %= f ;
          p [ n ] = i < 0 ? i + f : i ;
        }
        // Convert to small if possible, apply sign.
        return "number" == typeof ( p = y ( p ) ) ? ( o && ( p = - p ) , new l ( p ) ) : new s ( p , o ) ;
      }

      /**
       * Multiplies two digit arrays.
       * @param {number[]} t - First operand.
       * @param {number[]} e - Second operand.
       * @returns {number[]} Resulting digit array.
       */
      function M ( t , e ) {
        var o , n , i , u , p = t . length , a = e . length , s = g ( p + a ) , l = r ;

        for ( i = 0 ; i < p ; ++ i ) {
          u = t [ i ] ;
          for ( var f = 0 ; f < a ; ++ f ) {
            o = u * e [ f ] + s [ i + f ] ;
            n = Math . floor ( o / l ) ;
            s [ i + f ] = o - n * l ;
            s [ i + f + 1 ] += n ;
          }
        }
        c ( s ) ;
        return s ;
      }

      /**
       * Multiplies a digit array by a small number.
       * @param {number[]} t - Digit array.
       * @param {number} e - Small number.
       * @returns {number[]} Resulting digit array.
       */
      function N ( t , e ) {
        var o , n , i = t . length , u = new Array ( i ) , p = r , a = 0 ;

        for ( n = 0 ; n < i ; n ++ ) {
          o = t [ n ] * e + a ;
          a = Math . floor ( o / p ) ;
          u [ n ] = o - a * p ;
        }
        for ( ; a > 0 ; ) {
          u [ n ++ ] = a % p ;
          a = Math . floor ( a / p ) ;
        }
        return u ;
      }

      /**
       * Prepends zeros to a digit array.
       * @param {number[]} t - The array.
       * @param {number} e - Number of zeros to prepend.
       * @returns {number[]} The padded array.
       */
      function E ( t , e ) {
        for ( var r = [] ; e -- > 0 ; ) {
          r . push ( 0 ) ;
        }
        return r . concat ( t ) ;
      }

      /**
       * Creates a big integer from a small number and a digit array, applying sign.
       * @param {number} t - Small number (or part of it).
       * @param {number[]} e - Digit array.
       * @param {boolean} o - Sign.
       * @returns {s} Big integer.
       */
      function O ( t , e , o ) {
        return new s ( t < r ? N ( e , t ) : M ( e , h ( t ) ) , o ) ;
      }

      /**
       * Squares a digit array.
       * @param {number[]} t - The digit array.
       * @returns {number[]} Resulting digit array.
       */
      function B ( t ) {
        var e , o , n , i , u = t . length , p = g ( u + u ) , a = r ;

        for ( n = 0 ; n < u ; n ++ ) {
          o = 0 - ( i = t [ n ] ) * i ;
          for ( var s = n ; s < u ; s ++ ) {
            e = i * t [ s ] * 2 + p [ n + s ] + o ;
            o = Math . floor ( e / a ) ;
            p [ n + s ] = e - o * a ;
          }
          p [ n + u ] = o ;
        }
        c ( p ) ;
        return p ;
      }

      /**
       * Divides a digit array by a small number.
       * @param {number[]} t - The digit array.
       * @param {number} e - The divisor.
       * @returns {[number[], number]} Array with quotient and remainder.
       */
      function I ( t , e ) {
        var o , n , i , u , p = t . length , a = g ( p ) , s = r ;

        for ( i = 0 , o = p - 1 ; o >= 0 ; -- o ) {
          i = ( u = i * s + t [ o ] ) - ( n = m ( u / e ) ) * e ;
          a [ o ] = 0 | n ; // Bitwise OR 0 for integer conversion.
        }
        return [ a , 0 | i ] ;
      }

      /**
       * Divides one big integer by another.
       * @param {a} t - Dividend.
       * @param {a} e - Divisor.
       * @returns {[a, a]} Array with quotient and remainder.
       */
      function A ( t , e ) {
        var o , n = Q ( e ) ;

        // If BigInt is supported, use native BigInt division.
        if ( p ) {
          return [ new f ( t . value / n . value ) , new f ( t . value % n . value ) ] ;
        }

        var i , u = t . value , v = n . value ;

        // Handle division by zero.
        if ( 0 === v ) {
          throw new Error ( "Cannot divide by zero" ) ;
        }

        // Handle small number cases.
        if ( t . isSmall ) {
          return n . isSmall ? [ new l ( m ( u / v ) ) , new l ( u % v ) ] : [ a [ 0 ] , t ] ;
        }
        if ( n . isSmall ) {
          if ( 1 === v ) {
            return [ t , a [ 0 ] ] ;
          }
          if ( - 1 == v ) {
            return [ t . negate ( ) , a [ 0 ] ] ;
          }
          var d = Math . abs ( v ) ;
          if ( d < r ) {
            i = y ( ( o = I ( u , d ) ) [ 0 ] ) ;
            var w = o [ 1 ] ;
            return t . sign && ( w = - w ) , "number" == typeof i ? ( t . sign !== n . sign && ( i = - i ) , [ new l ( i ) , new l ( w ) ] ) : [ new s ( i , t . sign !== n . sign ) , new l ( w ) ] ;
          }
          v = h ( d ) ;
        }

        // Compare magnitudes.
        var b = P ( u , v ) ;
        if ( - 1 === b ) {
          return [ a [ 0 ] , t ] ;
        }
        if ( 0 === b ) {
          return [ a [ t . sign === n . sign ? 1 : - 1 ] , a [ 0 ] ] ;
        }

        // Perform long division.
        i = ( o = u . length + v . length <= 200 ? function ( t , e ) {
          var o , n , i , u , p , a , s , l = t . length , f = e . length , v = r , h = g ( e . length ) , c = e [ f - 1 ] , m = Math . ceil ( v / ( 2 * c ) ) , d = N ( t , m ) , w = N ( e , m ) ;

          for ( d . length <= l && d . push ( 0 ) , w . push ( 0 ) , c = w [ f - 1 ] , n = l - f ; n >= 0 ; n -- ) {
            for ( o = v - 1 , d [ n + f ] !== c && ( o = Math . floor ( ( d [ n + f ] * v + d [ n + f - 1 ] ) / c ) ) , i = 0 , u = 0 , a = w . length , p = 0 ; p < a ; p ++ ) {
              i += o * w [ p ] ;
              s = Math . floor ( i / v ) ;
              u += d [ n + p ] - ( i - s * v ) ;
              i = s ;
              u < 0 ? ( d [ n + p ] = u + v , u = - 1 ) : ( d [ n + p ] = u , u = 0 ) ;
            }
            for ( ; 0 !== u ; ) {
              for ( o -= 1 , i = 0 , p = 0 ; p < a ; p ++ ) {
                ( i += d [ n + p ] - v + w [ p ] ) < 0 ? ( d [ n + p ] = i + v , i = 0 ) : ( d [ n + p ] = i , i = 1 ) ;
              }
              u += i ;
            }
            h [ n ] = o ;
          }
          return d = I ( d , m ) [ 0 ] , [ y ( h ) , y ( d ) ] ;
        } ( u , v ) : function ( t , e ) {
          for ( var o , n , i , u , p , a = t . length , s = e . length , l = [] , f = [] , v = r ; a ; ) {
            if ( f . unshift ( t [ -- a ] ) , c ( f ) , P ( f , e ) < 0 ) {
              l . push ( 0 ) ;
            } else {
              i = f [ ( n = f . length ) - 1 ] * v + f [ n - 2 ] ;
              u = e [ s - 1 ] * v + e [ s - 2 ] ;
              n > s && ( i = ( i + 1 ) * v ) ;
              o = Math . ceil ( i / u ) ;
              do {
                if ( P ( p = N ( e , o ) , f ) <= 0 ) {
                  break ;
                }
                o -- ;
              } while ( o ) ;
              l . push ( o ) ;
              f = S ( f , p ) ;
            }
          }
          return l . reverse ( ) , [ y ( l ) , y ( f ) ] ;
        } ( u , v ) ) [ 0 ] ;

        var q = t . sign !== n . sign ;
        var M = o [ 1 ] ;
        var E = t . sign ;

        // Construct results, applying signs.
        return "number" == typeof i ? ( q && ( i = - i ) , i = new l ( i ) ) : i = new s ( i , q ) , "number" == typeof M ? ( E && ( M = - M ) , M = new l ( M ) ) : M = new s ( M , E ) , [ i , M ] ;
      }

      /**
       * Compares two digit arrays.
       * @param {number[]} t - First array.
       * @param {number[]} e - Second array.
       * @returns {number} -1 if t < e, 1 if t > e, 0 if t == e.
       */
      function P ( t , e ) {
        if ( t . length !== e . length ) {
          return t . length > e . length ? 1 : - 1 ;
        }
        for ( var r = t . length - 1 ; r >= 0 ; r -- ) {
          if ( t [ r ] !== e [ r ] ) {
            return t [ r ] > e [ r ] ? 1 : - 1 ;
          }
        }
        return 0 ;
      }

      /**
       * Checks for primality for small numbers.
       * @param {a} t - The number.
       * @returns {boolean|undefined} True/false if definite, undefined if needs further testing.
       */
      function Z ( t ) {
        var e = t . abs ( ) ;
        return ! e . isUnit ( ) && ( !! ( e . equals ( 2 ) || e . equals ( 3 ) || e . equals ( 5 ) ) || ! ( e . isEven ( ) || e . isDivisibleBy ( 3 ) || e . isDivisibleBy ( 5 ) ) && ( !! e . lesser ( 49 ) || void 0 ) ) ;
      }

      /**
       * Miller-Rabin primality test helper.
       * @param {a} e - The number to test.
       * @param {number[]} r - Array of bases to test against.
       * @returns {boolean} True if probable prime, false if composite.
       */
      function x ( e , r ) {
        for ( var o , n , i , u = e . prev ( ) , p = u , a = 0 ; p . isEven ( ) ; ) {
          p = p . divide ( 2 ) ;
          a ++ ;
        }
        t : for ( n = 0 ; n < r . length ; n ++ ) {
          if ( ! e . lesser ( r [ n ] ) && ! ( i = t ( r [ n ] ) . modPow ( p , e ) ) . isUnit ( ) && ! i . equals ( u ) ) {
            for ( o = a - 1 ; 0 != o ; o -- ) {
              if ( ( i = i . square ( ) . mod ( e ) ) . isUnit ( ) ) {
                return ! 1 ;
              }
              if ( i . equals ( u ) ) {
                continue t ;
              }
            }
            return ! 1 ;
          }
        }
        return ! 0 ;
      }

      // --- Prototype methods for s (BigInt-like array) ---
      s . prototype = Object . create ( a . prototype ) ;
      l . prototype = Object . create ( a . prototype ) ;
      f . prototype = Object . create ( a . prototype ) ;

      s . prototype . add = function ( t ) {
        var e = Q ( t ) ;
        if ( this . sign !== e . sign ) {
          return this . subtract ( e . negate ( ) ) ;
        }
        var r = this . value , o = e . value ;
        return e . isSmall ? new s ( b ( r , Math . abs ( o ) ) , this . sign ) : new s ( w ( r , o ) , this . sign ) ;
      } ;
      s . prototype . plus = s . prototype . add ;

      l . prototype . add = function ( t ) {
        var e = Q ( t ) , r = this . value ;
        if ( r < 0 !== e . sign ) {
          return this . subtract ( e . negate ( ) ) ;
        }
        var o = e . value ;
        if ( e . isSmall ) {
          if ( v ( r + o ) ) {
            return new l ( r + o ) ;
          }
          o = h ( Math . abs ( o ) ) ;
        }
        return new s ( b ( o , Math . abs ( r ) ) , r < 0 ) ;
      } ;
      l . prototype . plus = l . prototype . add ;

      f . prototype . add = function ( t ) {
        return new f ( this . value + Q ( t ) . value ) ;
      } ;
      f . prototype . plus = f . prototype . add ;

      s . prototype . subtract = function ( t ) {
        var e = Q ( t ) ;
        if ( this . sign !== e . sign ) {
          return this . add ( e . negate ( ) ) ;
        }
        var r = this . value , o = e . value ;
        return e . isSmall ? q ( r , Math . abs ( o ) , this . sign ) : function ( t , e , r ) {
          var o ;
          return P ( t , e ) >= 0 ? o = S ( t , e ) : ( o = S ( e , t ) , r = ! r ) , "number" == typeof ( o = y ( o ) ) ? ( r && ( o = - o ) , new l ( o ) ) : new s ( o , r ) ;
        } ( r , o , this . sign ) ;
      } ;
      s . prototype . minus = s . prototype . subtract ;

      l . prototype . subtract = function ( t ) {
        var e = Q ( t ) , r = this . value ;
        if ( r < 0 !== e . sign ) {
          return this . add ( e . negate ( ) ) ;
        }
        var o = e . value ;
        return e . isSmall ? new l ( r - o ) : q ( o , Math . abs ( r ) , r >= 0 ) ;
      } ;
      l . prototype . minus = l . prototype . subtract ;

      f . prototype . subtract = function ( t ) {
        return new f ( this . value - Q ( t ) . value ) ;
      } ;
      f . prototype . minus = f . prototype . subtract ;

      s . prototype . negate = function ( ) {
        return new s ( this . value , ! this . sign ) ;
      } ;

      l . prototype . negate = function ( ) {
        var t = this . sign , e = new l ( - this . value ) ;
        return e . sign = ! t , e ;
      } ;

      f . prototype . negate = function ( ) {
        return new f ( - this . value ) ;
      } ;

      s . prototype . abs = function ( ) {
        return new s ( this . value , ! 1 ) ;
      } ;

      l . prototype . abs = function ( ) {
        return new l ( Math . abs ( this . value ) ) ;
      } ;

      f . prototype . abs = function ( ) {
        return new f ( this . value >= 0 ? this . value : - this . value ) ;
      } ;

      s . prototype . multiply = function ( t ) {
        var e , o , n , i = Q ( t ) , u = this . value , p = i . value , l = this . sign !== i . sign ;

        if ( i . isSmall ) {
          if ( 0 === p ) {
            return a [ 0 ] ;
          }
          if ( 1 === p ) {
            return this ;
          }
          if ( - 1 === p ) {
            return this . negate ( ) ;
          }
          if ( ( e = Math . abs ( p ) ) < r ) {
            return new s ( N ( u , e ) , l ) ;
          }
          p = h ( e ) ;
        }

        o = u . length ;
        n = p . length ;

        // Karatsuba multiplication for larger numbers.
        return new s ( - . 012 * o - . 012 * n + 15e-6 * o * n > 0 ? function t ( e , r ) {
          var o = Math . max ( e . length , r . length ) ;
          if ( o <= 30 ) {
            return M ( e , r ) ;
          }
          o = Math . ceil ( o / 2 ) ;
          var n = e . slice ( o ) ;
          var i = e . slice ( 0 , o ) ;
          var u = r . slice ( o ) ;
          var p = r . slice ( 0 , o ) ;
          var a = t ( i , p ) ;
          var s = t ( n , u ) ;
          var l = t ( w ( i , n ) , w ( p , u ) ) ;
          var f = w ( w ( a , E ( S ( S ( l , a ) , s ) , o ) ) , E ( s , 2 * o ) ) ;
          return c ( f ) , f ;
        } ( u , p ) : M ( u , p ) , l ) ;
      } ;
      s . prototype . times = s . prototype . multiply ;

      l . prototype . _multiplyBySmall = function ( t ) {
        return v ( t . value * this . value ) ? new l ( t . value * this . value ) : O ( Math . abs ( t . value ) , h ( Math . abs ( this . value ) ) , this . sign !== t . sign ) ;
      } ;

      s . prototype . _multiplyBySmall = function ( t ) {
        if ( 0 === t . value ) {
          return a [ 0 ] ;
        }
        if ( 1 === t . value ) {
          return this ;
        }
        if ( - 1 === t . value ) {
          return this . negate ( ) ;
        }
        return O ( Math . abs ( t . value ) , this . value , this . sign !== t . sign ) ;
      } ;

      l . prototype . multiply = function ( t ) {
        return Q ( t ) . _multiplyBySmall ( this ) ;
      } ;
      l . prototype . times = l . prototype . multiply ;

      f . prototype . multiply = function ( t ) {
        return new f ( this . value * Q ( t ) . value ) ;
      } ;
      f . prototype . times = f . prototype . multiply ;

      s . prototype . square = function ( ) {
        return new s ( B ( this . value ) , ! 1 ) ;
      } ;

      l . prototype . square = function ( ) {
        var t = this . value * this . value ;
        return v ( t ) ? new l ( t ) : new s ( B ( h ( Math . abs ( this . value ) ) ) , ! 1 ) ;
      } ;

      f . prototype . square = function ( t ) {
        return new f ( this . value * this . value ) ;
      } ;

      s . prototype . divmod = function ( t ) {
        var e = A ( this , t ) ;
        return {
          quotient : e [ 0 ] ,
          remainder : e [ 1 ]
        } ;
      } ;
      f . prototype . divmod = l . prototype . divmod = s . prototype . divmod ;

      s . prototype . divide = function ( t ) {
        return A ( this , t ) [ 0 ] ;
      } ;
      f . prototype . over = f . prototype . divide = function ( t ) {
        return new f ( this . value / Q ( t ) . value ) ;
      } ;
      l . prototype . over = l . prototype . divide = s . prototype . over = s . prototype . divide ;

      s . prototype . mod = function ( t ) {
        return A ( this , t ) [ 1 ] ;
      } ;
      f . prototype . mod = f . prototype . remainder = function ( t ) {
        return new f ( this . value % Q ( t ) . value ) ;
      } ;
      l . prototype . remainder = l . prototype . mod = s . prototype . remainder = s . prototype . mod ;

      s . prototype . pow = function ( t ) {
        var e , r , o , n = Q ( t ) , i = this . value , u = n . value ;

        if ( 0 === u ) {
          return a [ 1 ] ;
        }
        if ( 0 === i ) {
          return a [ 0 ] ;
        }
        if ( 1 === i ) {
          return a [ 1 ] ;
        }
        if ( - 1 === i ) {
          return n . isEven ( ) ? a [ 1 ] : a [ - 1 ] ;
        }
        if ( n . sign ) {
          return a [ 0 ] ;
        }
        if ( ! n . isSmall ) {
          throw new Error ( "The exponent " + n . toString ( ) + " is too large." ) ;
        }
        if ( this . isSmall && v ( e = Math . pow ( i , u ) ) ) {
          return new l ( m ( e ) ) ;
        }

        for ( r = this , o = a [ 1 ] ; ! 0 & u && ( o = o . times ( r ) , -- u ) , 0 !== u ; ) {
          u /= 2 ;
          r = r . square ( ) ;
        }
        return o ;
      } ;
      l . prototype . pow = s . prototype . pow ;

      f . prototype . pow = function ( t ) {
        var e = Q ( t ) , r = this . value , o = e . value , n = BigInt ( 0 ) , i = BigInt ( 1 ) , u = BigInt ( 2 ) ;

        if ( o === n ) {
          return a [ 1 ] ;
        }
        if ( r === n ) {
          return a [ 0 ] ;
        }
        if ( r === i ) {
          return a [ 1 ] ;
        }
        if ( r === BigInt ( - 1 ) ) {
          return e . isEven ( ) ? a [ 1 ] : a [ - 1 ] ;
        }
        if ( e . isNegative ( ) ) {
          return new f ( n ) ;
        }

        for ( var p = this , s = a [ 1 ] ; ( o & i ) === i && ( s = s . times ( p ) , -- o ) , o !== n ; ) {
          o /= u ;
          p = p . square ( ) ;
        }
        return s ;
      } ;

      s . prototype . modPow = function ( t , e ) {
        if ( t = Q ( t ) , ( e = Q ( e ) ) . isZero ( ) ) {
          throw new Error ( "Cannot take modPow with modulus 0" ) ;
        }
        for ( var r = a [ 1 ] , o = this . mod ( e ) ; t . isPositive ( ) ; ) {
          if ( o . isZero ( ) ) {
            return a [ 0 ] ;
          }
          t . isOdd ( ) && ( r = r . multiply ( o ) . mod ( e ) ) ;
          t = t . divide ( 2 ) ;
          o = o . square ( ) . mod ( e ) ;
        }
        return r ;
      } ;
      f . prototype . modPow = l . prototype . modPow = s . prototype . modPow ;

      s . prototype . compareAbs = function ( t ) {
        var e = Q ( t ) , r = this . value , o = e . value ;
        return e . isSmall ? 1 : P ( r , o ) ;
      } ;

      l . prototype . compareAbs = function ( t ) {
        var e = Q ( t ) , r = Math . abs ( this . value ) , o = e . value ;
        return e . isSmall ? r === ( o = Math . abs ( o ) ) ? 0 : r > o ? 1 : - 1 : - 1 ;
      } ;

      f . prototype . compareAbs = function ( t ) {
        var e = this . value , r = Q ( t ) . value ;
        return ( e = e >= 0 ? e : - e ) === ( r = r >= 0 ? r : - r ) ? 0 : e > r ? 1 : - 1 ;
      } ;

      s . prototype . compare = function ( t ) {
        if ( t === 1 / 0 ) {
          return - 1 ;
        }
        if ( t === - 1 / 0 ) {
          return 1 ;
        }
        var e = Q ( t ) , r = this . value , o = e . value ;
        return this . sign !== e . sign ? e . sign ? 1 : - 1 : e . isSmall ? this . sign ? - 1 : 1 : P ( r , o ) * ( this . sign ? - 1 : 1 ) ;
      } ;
      s . prototype . compareTo = s . prototype . compare ;

      l . prototype . compare = function ( t ) {
        if ( t === 1 / 0 ) {
          return - 1 ;
        }
        if ( t === - 1 / 0 ) {
          return 1 ;
        }
        var e = Q ( t ) , r = this . value , o = e . value ;
        return e . isSmall ? r == o ? 0 : r > o ? 1 : - 1 : r < 0 !== e . sign ? r < 0 ? - 1 : 1 : r < 0 ? 1 : - 1 ;
      } ;
      l . prototype . compareTo = l . prototype . compare ;

      f . prototype . compare = function ( t ) {
        if ( t === 1 / 0 ) {
          return - 1 ;
        }
        if ( t === - 1 / 0 ) {
          return 1 ;
        }
        var e = this . value , r = Q ( t ) . value ;
        return e === r ? 0 : e > r ? 1 : - 1 ;
      } ;
      f . prototype . compareTo = f . prototype . compare ;

      s . prototype . equals = function ( t ) {
        return 0 === this . compare ( t ) ;
      } ;
      f . prototype . eq = f . prototype . equals = l . prototype . eq = l . prototype . equals = s . prototype . eq = s . prototype . equals ;

      s . prototype . notEquals = function ( t ) {
        return 0 !== this . compare ( t ) ;
      } ;
      f . prototype . neq = f . prototype . notEquals = l . prototype . neq = l . prototype . notEquals = s . prototype . neq = s . prototype . notEquals ;

      s . prototype . greater = function ( t ) {
        return this . compare ( t ) > 0 ;
      } ;
      f . prototype . gt = f . prototype . greater = l . prototype . gt = l . prototype . greater = s . prototype . gt = s . prototype . greater ;

      s . prototype . lesser = function ( t ) {
        return this . compare ( t ) < 0 ;
      } ;
      f . prototype . lt = f . prototype . lesser = l . prototype . lt = l . prototype . lesser = s . prototype . lt = s . prototype . lesser ;

      s . prototype . greaterOrEquals = function ( t ) {
        return this . compare ( t ) >= 0 ;
      } ;
      f . prototype . geq = f . prototype . greaterOrEquals = l . prototype . geq = l . prototype . greaterOrEquals = s . prototype . geq = s . prototype . greaterOrEquals ;

      s . prototype . lesserOrEquals = function ( t ) {
        return this . compare ( t ) <= 0 ;
      } ;
      f . prototype . leq = f . prototype . lesserOrEquals = l . prototype . leq = l . prototype . lesserOrEquals = s . prototype . leq = s . prototype . lesserOrEquals ;

      s . prototype . isEven = function ( ) {
        return 0 == ( 1 & this . value [ 0 ] ) ;
      } ;
      l . prototype . isEven = function ( ) {
        return 0 == ( 1 & this . value ) ;
      } ;
      f . prototype . isEven = function ( ) {
        return ( this . value & BigInt ( 1 ) ) === BigInt ( 0 ) ;
      } ;

      s . prototype . isOdd = function ( ) {
        return 1 == ( 1 & this . value [ 0 ] ) ;
      } ;
      l . prototype . isOdd = function ( ) {
        return 1 == ( 1 & this . value ) ;
      } ;
      f . prototype . isOdd = function ( ) {
        return ( this . value & BigInt ( 1 ) ) === BigInt ( 1 ) ;
      } ;

      s . prototype . isPositive = function ( ) {
        return ! this . sign ;
      } ;
      l . prototype . isPositive = function ( ) {
        return this . value > 0 ;
      } ;
      f . prototype . isPositive = l . prototype . isPositive ;

      s . prototype . isNegative = function ( ) {
        return this . sign ;
      } ;
      l . prototype . isNegative = function ( ) {
        return this . value < 0 ;
      } ;
      f . prototype . isNegative = l . prototype . isNegative ;

      s . prototype . isUnit = function ( ) {
        return ! 1 ;
      } ;
      l . prototype . isUnit = function ( ) {
        return 1 === Math . abs ( this . value ) ;
      } ;
      f . prototype . isUnit = function ( ) {
        return this . abs ( ) . value === BigInt ( 1 ) ;
      } ;

      s . prototype . isZero = function ( ) {
        return ! 1 ;
      } ;
      l . prototype . isZero = function ( ) {
        return 0 === this . value ;
      } ;
      f . prototype . isZero = function ( ) {
        return this . value === BigInt ( 0 ) ;
      } ;

      s . prototype . isDivisibleBy = function ( t ) {
        var e = Q ( t ) ;
        return ! e . isZero ( ) && ( !! e . isUnit ( ) || ( 0 === e . compareAbs ( 2 ) ? this . isEven ( ) : this . mod ( e ) . isZero ( ) ) ) ;
      } ;
      f . prototype . isDivisibleBy = l . prototype . isDivisibleBy = s . prototype . isDivisibleBy ;

      s . prototype . isPrime = function ( e ) {
        var r = Z ( this ) ;
        if ( void 0 !== r ) {
          return r ;
        }
        var o = this . abs ( ) , n = o . bitLength ( ) ;
        if ( n <= 64 ) {
          return x ( o , [ 2 , 3 , 5 , 7 , 11 , 13 , 17 , 19 , 23 , 29 , 31 , 37 ] ) ;
        }
        for ( var i = Math . log ( 2 ) * n . toJSNumber ( ) , u = Math . ceil ( ! 0 === e ? 2 * Math . pow ( i , 2 ) : i ) , p = [] , a = 0 ; a < u ; a ++ ) {
          p . push ( t ( a + 2 ) ) ;
        }
        return x ( o , p ) ;
      } ;
      f . prototype . isPrime = l . prototype . isPrime = s . prototype . isPrime ;

      s . prototype . isProbablePrime = function ( e ) {
        var r = Z ( this ) ;
        if ( void 0 !== r ) {
          return r ;
        }
        for ( var o = this . abs ( ) , n = void 0 === e ? 5 : e , i = [] , u = 0 ; u < n ; u ++ ) {
          i . push ( t . randBetween ( 2 , o . minus ( 2 ) ) ) ;
        }
        return x ( o , i ) ;
      } ;
      f . prototype . isProbablePrime = l . prototype . isProbablePrime = s . prototype . isProbablePrime ;

      s . prototype . modInv = function ( e ) {
        for ( var r , o , n , i = t . zero , u = t . one , p = Q ( e ) , a = this . abs ( ) ; ! a . isZero ( ) ; ) {
          r = p . divide ( a ) ;
          o = i ;
          n = p ;
          i = u ;
          p = o . subtract ( r . multiply ( u ) ) ;
          a = n . subtract ( r . multiply ( a ) ) ;
        }
        if ( ! p . isUnit ( ) ) {
          throw new Error ( this . toString ( ) + " and " + e . toString ( ) + " are not co-prime" ) ;
        }
        return - 1 === i . compare ( 0 ) && ( i = i . add ( e ) ) , this . isNegative ( ) ? i . negate ( ) : i ;
      } ;
      f . prototype . modInv = l . prototype . modInv = s . prototype . modInv ;

      s . prototype . next = function ( ) {
        var t = this . value ;
        return this . sign ? q ( t , 1 , this . sign ) : new s ( b ( t , 1 ) , this . sign ) ;
      } ;

      l . prototype . next = function ( ) {
        var t = this . value ;
        return t + 1 < n ? new l ( t + 1 ) : new s ( i , ! 1 ) ;
      } ;

      f . prototype . next = function ( ) {
        return new f ( this . value + BigInt ( 1 ) ) ;
      } ;

      s . prototype . prev = function ( ) {
        var t = this . value ;
        return this . sign ? new s ( b ( t , 1 ) , ! 0 ) : q ( t , 1 , this . sign ) ;
      } ;

      l . prototype . prev = function ( ) {
        var t = this . value ;
        return t - 1 > - n ? new l ( t - 1 ) : new s ( i , ! 0 ) ;
      } ;

      f . prototype . prev = function ( ) {
        return new f ( this . value - BigInt ( 1 ) ) ;
      } ;

      // Pre-calculated powers of 2 for bitwise operations.
      for ( var J = [ 1 ] ; 2 * J [ J . length - 1 ] <= r ; ) {
        J . push ( 2 * J [ J . length - 1 ] ) ;
      }
      var L = J . length , U = J [ L - 1 ] ;

      /**
       * Checks if a number is small enough for standard JS operations.
       * @param {number} t - The number.
       * @returns {boolean} True if within range.
       */
      function T ( t ) {
        return Math . abs ( t ) <= r ;
      }

      /**
       * Performs bitwise operations (AND, OR, XOR) on two big integers.
       * @param {a} e - First operand.
       * @param {a} r - Second operand.
       * @param {function} o - Bitwise operator function.
       * @returns {a} Resulting big integer.
       */
      function j ( e , r , o ) {
        r = Q ( r ) ;
        var n = e . isNegative ( ) ;
        var i = r . isNegative ( ) ;

        // Handle two's complement for negative numbers.
        var u = n ? e . not ( ) : e ;
        var p = i ? r . not ( ) : r ;

        var a = 0 , s = 0 ;
        var l = null , f = null ;
        var v = [] ;

        // Process digits from LSB.
        for ( ; ! u . isZero ( ) || ! p . isZero ( ) ; ) {
          a = ( l = A ( u , U ) ) [ 1 ] . toJSNumber ( ) ;
          n && ( a = U - 1 - a ) ;
          s = ( f = A ( p , U ) ) [ 1 ] . toJSNumber ( ) ;
          i && ( s = U - 1 - s ) ;
          u = l [ 0 ] ;
          p = f [ 0 ] ;
          v . push ( o ( a , s ) ) ;
        }

        // Combine results, applying two's complement if applicable.
        var h = 0 !== o ( n ? 1 : 0 , i ? 1 : 0 ) ? t ( - 1 ) : t ( 0 ) ;
        for ( var y = v . length - 1 ; y >= 0 ; y -= 1 ) {
          h = h . multiply ( U ) . add ( t ( v [ y ] ) ) ;
        }
        return h ;
      }

      s . prototype . shiftLeft = function ( t ) {
        var e = Q ( t ) . toJSNumber ( ) ;
        if ( ! T ( e ) ) {
          throw new Error ( String ( e ) + " is too large for shifting." ) ;
        }
        if ( e < 0 ) {
          return this . shiftRight ( - e ) ;
        }
        var r = this ;
        if ( r . isZero ( ) ) {
          return r ;
        }
        for ( ; e >= L ; ) {
          r = r . multiply ( U ) ;
          e -= L - 1 ;
        }
        return r . multiply ( J [ e ] ) ;
      } ;
      f . prototype . shiftLeft = l . prototype . shiftLeft = s . prototype . shiftLeft ;

      s . prototype . shiftRight = function ( t ) {
        var e , r = Q ( t ) . toJSNumber ( ) ;
        if ( ! T ( r ) ) {
          throw new Error ( String ( r ) + " is too large for shifting." ) ;
        }
        if ( r < 0 ) {
          return this . shiftLeft ( - r ) ;
        }
        for ( var o = this ; r >= L ; ) {
          if ( o . isZero ( ) || o . isNegative ( ) && o . isUnit ( ) ) {
            return o ;
          }
          o = ( e = A ( o , U ) ) [ 1 ] . isNegative ( ) ? e [ 0 ] . prev ( ) : e [ 0 ] ;
          r -= L - 1 ;
        }
        return ( e = A ( o , J [ r ] ) ) [ 1 ] . isNegative ( ) ? e [ 0 ] . prev ( ) : e [ 0 ] ;
      } ;
      f . prototype . shiftRight = l . prototype . shiftRight = s . prototype . shiftRight ;

      s . prototype . not = function ( ) {
        return this . negate ( ) . prev ( ) ;
      } ;
      f . prototype . not = l . prototype . not = s . prototype . not ;

      s . prototype . and = function ( t ) {
        return j ( this , t , function ( t , e ) {
          return t & e ;
        } ) ;
      } ;
      f . prototype . and = l . prototype . and = s . prototype . and ;

      s . prototype . or = function ( t ) {
        return j ( this , t , function ( t , e ) {
          return t | e ;
        } ) ;
      } ;
      f . prototype . or = l . prototype . or = s . prototype . or ;

      s . prototype . xor = function ( t ) {
        return j ( this , t , function ( t , e ) {
          return t ^ e ;
        } ) ;
      } ;
      f . prototype . xor = l . prototype . xor = s . prototype . xor ;

      // Constants for bit length calculation.
      var C = 1 << 30 , D = ( r & - r ) * ( r & - r ) | C ;

      /**
       * Finds the lowest set bit (LSB) of a big integer.
       * @param {a} t - The big integer.
       * @returns {number} The LSB.
       */
      function z ( t ) {
        var e = t . value ;
        var o = "number" == typeof e ? e | C : "bigint" == typeof e ? e | BigInt ( C ) : e [ 0 ] + e [ 1 ] * r | D ;
        return o & - o ;
      }

      /**
       * Returns the greater of two big integers.
       * @param {a} t - First number.
       * @param {a} e - Second number.
       * @returns {a} The greater number.
       */
      function R ( t , e ) {
        return t = Q ( t ) , e = Q ( e ) , t . greater ( e ) ? t : e ;
      }

      /**
       * Returns the lesser of two big integers.
       * @param {a} t - First number.
       * @param {a} e - Second number.
       * @returns {a} The lesser number.
       */
      function k ( t , e ) {
        return t = Q ( t ) , e = Q ( e ) , t . lesser ( e ) ? t : e ;
      }

      /**
       * Calculates the greatest common divisor (GCD) of two big integers using Euclidean algorithm.
       * @param {a} t - First number.
       * @param {a} e - Second number.
       * @returns {a} The GCD.
       */
      function _ ( t , e ) {
        if ( t = Q ( t ) . abs ( ) , e = Q ( e ) . abs ( ) , t . equals ( e ) ) {
          return t ;
        }
        if ( t . isZero ( ) ) {
          return e ;
        }
        if ( e . isZero ( ) ) {
          return t ;
        }
        for ( var r , o , n = a [ 1 ] ; t . isEven ( ) && e . isEven ( ) ; ) {
          r = k ( z ( t ) , z ( e ) ) ;
          t = t . divide ( r ) ;
          e = e . divide ( r ) ;
          n = n . multiply ( r ) ;
        }
        for ( ; t . isEven ( ) ; ) {
          t = t . divide ( z ( t ) ) ;
        }
        do {
          for ( ; e . isEven ( ) ; ) {
            e = e . divide ( z ( e ) ) ;
          }
          t . greater ( e ) && ( o = e , e = t , t = o ) ;
          e = e . subtract ( t ) ;
        } while ( ! e . isZero ( ) ) ;
        return n . isUnit ( ) ? t : t . multiply ( n ) ;
      }

      s . prototype . bitLength = function ( ) {
        var e = this ;
        if ( e . compareTo ( t ( 0 ) ) < 0 && ( e = e . negate ( ) . subtract ( t ( 1 ) ) ) , 0 === e . compareTo ( t ( 0 ) ) ) {
          return t ( 0 ) ;
        }
        return t ( function e ( r , o ) {
          if ( o . compareTo ( r ) <= 0 ) {
            var n = e ( r , o . square ( o ) ) , i = n . p , u = n . e , p = i . multiply ( o ) ;
            return p . compareTo ( r ) <= 0 ? {
              p : p ,
              e : 2 * u + 1
            } : {
              p : i ,
              e : 2 * u
            } ;
          }
          return {
            p : t ( 1 ) ,
            e : 0
          } ;
        } ( e , t ( 2 ) ) . e ) . add ( t ( 1 ) ) ;
      } ;
      f . prototype . bitLength = l . prototype . bitLength = s . prototype . bitLength ;

      /**
       * Converts a string representation in a given base to a big integer.
       * @param {string} t - The string.
       * @param {number} e - The base.
       * @param {string} r - Custom alphabet.
       * @param {boolean} o - Case sensitivity.
       * @returns {a} The big integer.
       */
      var $ = function ( t , e , r , o ) {
        r = r || u ; // Default alphabet if not provided.
        t = String ( t ) ;

        // Convert to lowercase if case-insensitive.
        if ( ! o ) {
          t = t . toLowerCase ( ) ;
          r = r . toLowerCase ( ) ;
        }

        var n , i = t . length , p = Math . abs ( e ) , a = {} ;

        // Map characters to their digit values.
        for ( n = 0 ; n < r . length ; n ++ ) {
          a [ r [ n ] ] = n ;
        }

        // Validate digits in the input string.
        for ( n = 0 ; n < i ; n ++ ) {
          var f ;
          if ( "-" !== ( f = t [ n ] ) && ( f in a && a [ f ] >= p ) ) {
            if ( "1" === f && 1 === p ) {
              continue ;
            }
            throw new Error ( f + " is not a valid digit in base " + e + "." ) ;
          }
        }

        e = Q ( e ) ; // Convert base to big integer.
        var s = [] ; // Array to store converted digits.
        var l = "-" === t [ 0 ] ; // Check for negative sign.

        // Parse the input string, handling custom digit representations.
        for ( n = l ? 1 : 0 ; n < t . length ; n ++ ) {
          var f ;
          if ( ( f = t [ n ] ) in a ) {
            s . push ( Q ( a [ f ] ) ) ;
          } else {
            if ( "<" !== f ) {
              throw new Error ( f + " is not a valid character" ) ;
            }
            var v = n ;
            do {
              n ++ ;
            } while ( ">" !== t [ n ] && n < t . length ) ;
            s . push ( Q ( t . slice ( v + 1 , n ) ) ) ;
          }
        }
        return F ( s , e , l ) ;
      } ;

      /**
       * Converts an array of digits in a given base to a big integer.
       * @param {a[]} t - Array of digits (as big integers).
       * @param {a} e - The base (as a big integer).
       * @param {boolean} r - Sign flag.
       * @returns {a} The big integer.
       */
      function F ( t , e , r ) {
        var o , n = a [ 0 ] , i = a [ 1 ] ;
        for ( o = t . length - 1 ; o >= 0 ; o -- ) {
          n = n . add ( t [ o ] . times ( i ) ) ;
          i = i . times ( e ) ;
        }
        return r ? n . negate ( ) : n ;
      }

      /**
       * Converts a big integer to an array of digits in a given base.
       * @param {a} e - The big integer.
       * @param {number} r - The base.
       * @returns {{value: number[], isNegative: boolean}} Object with digit array and sign.
       */
      function G ( e , r ) {
        if ( ( r = t ( r ) ) . isZero ( ) ) {
          if ( e . isZero ( ) ) {
            return {
              value : [ 0 ] ,
              isNegative : ! 1
            } ;
          }
          throw new Error ( "Cannot convert nonzero numbers to base 0." ) ;
        }
        if ( r . equals ( - 1 ) ) {
          if ( e . isZero ( ) ) {
            return {
              value : [ 0 ] ,
              isNegative : ! 1
            } ;
          }
          if ( e . isNegative ( ) ) {
            return {
              value : [ ] . concat . apply ( [ ] , Array . apply ( null , Array ( - e . toJSNumber ( ) ) ) . map ( Array . prototype . valueOf , [ 1 , 0 ] ) ) ,
              isNegative : ! 1
            } ;
          }
          var o = Array . apply ( null , Array ( e . toJSNumber ( ) - 1 ) ) . map ( Array . prototype . valueOf , [ 0 , 1 ] ) ;
          return o . unshift ( [ 1 ] ) , {
            value : [ ] . concat . apply ( [ ] , o ) ,
            isNegative : ! 1
          } ;
        }
        var n = ! 1 ;
        if ( e . isNegative ( ) && r . isPositive ( ) && ( n = ! 0 , e = e . abs ( ) ) , r . isUnit ( ) ) {
          return e . isZero ( ) ? {
            value : [ 0 ] ,
            isNegative : ! 1
          } : {
            value : Array . apply ( null , Array ( e . toJSNumber ( ) ) ) . map ( Number . prototype . valueOf , 1 ) ,
            isNegative : n
          } ;
        }
        for ( var i , u = [] , p = e ; p . isNegative ( ) || p . compareAbs ( r ) >= 0 ; ) {
          i = p . divmod ( r ) ;
          p = i . quotient ;
          var a = i . remainder ;
          a . isNegative ( ) && ( a = r . minus ( a ) . abs ( ) , p = p . next ( ) ) ;
          u . push ( a . toJSNumber ( ) ) ;
        }
        return u . push ( p . toJSNumber ( ) ) , {
          value : u . reverse ( ) ,
          isNegative : n
        } ;
      }

      /**
       * Converts a big integer to its string representation in a given base.
       * @param {a} t - The big integer.
       * @param {number} e - The base.
       * @param {string} r - Custom alphabet.
       * @returns {string} The string representation.
       */
      function H ( t , e , r ) {
        var o = G ( t , e ) ;
        return ( o . isNegative ? "-" : "" ) + o . value . map ( function ( t ) {
          return function ( t , e ) {
            return t < ( e = e || u ) . length ? e [ t ] : "<" + t + ">" ;
          } ( t , r ) ;
        } ) . join ( "" ) ;
      }

      /**
       * Converts a string to a big integer.
       * @param {string} t - The string.
       * @returns {a} The big integer.
       */
      function K ( t ) {
        if ( v ( + t ) ) {
          var e = + t ;
          if ( e === m ( e ) ) {
            return p ? new f ( BigInt ( e ) ) : new l ( e ) ;
          }
          throw new Error ( "Invalid integer: " + t ) ;
        }
        var r = "-" === t [ 0 ] ;
        if ( r ) {
          t = t . slice ( 1 ) ;
        }
        var n = t . split ( /e/i ) ;
        if ( n . length > 2 ) {
          throw new Error ( "Invalid integer: " + n . join ( "e" ) ) ;
        }
        if ( 2 === n . length ) {
          var i = n [ 1 ] ;
          if ( "+" === i [ 0 ] && ( i = i . slice ( 1 ) ) , ( i = + i ) !== m ( i ) || ! v ( i ) ) {
            throw new Error ( "Invalid integer: " + i + " is not a valid exponent." ) ;
          }
          var u = n [ 0 ] , a = u . indexOf ( "." ) ;
          if ( a >= 0 && ( i -= u . length - a - 1 , u = u . slice ( 0 , a ) + u . slice ( a + 1 ) ) , i < 0 ) {
            throw new Error ( "Cannot include negative exponent part for integers" ) ;
          }
          t = u += new Array ( i + 1 ) . join ( "0" ) ;
        }
        if ( ! / ^ ( [ 0 - 9 ] [ 0 - 9 ] * ) $ / . test ( t ) ) {
          throw new Error ( "Invalid integer: " + t ) ;
        }
        if ( p ) {
          return new f ( BigInt ( r ? "-" + t : t ) ) ;
        }
        for ( var h = [] , y = t . length , g = o , d = y - g ; y > 0 ; ) {
          h . push ( + t . slice ( d , y ) ) ;
          ( d -= g ) < 0 && ( d = 0 ) ;
          y -= g ;
        }
        return c ( h ) , new s ( h , r ) ;
      }

      /**
       * Converts various types to a big integer instance.
       * @param {*} t - The value to convert.
       * @returns {a} The big integer instance.
       */
      function Q ( t ) {
        if ( "number" == typeof t ) {
          return function ( t ) {
            if ( p ) {
              return new f ( BigInt ( t ) ) ;
            }
            if ( v ( t ) ) {
              if ( t !== m ( t ) ) {
                throw new Error ( t + " is not an integer." ) ;
              }
              return new l ( t ) ;
            }
            return K ( t . toString ( ) ) ;
          } ( t ) ;
        }
        if ( "string" == typeof t ) {
          return K ( t ) ;
        }
        if ( "bigint" == typeof t ) {
          return new f ( t ) ;
        }
        return t ;
      }

      s . prototype . toArray = function ( t ) {
        return G ( this , t ) ;
      } ;
      l . prototype . toArray = function ( t ) {
        return G ( this , t ) ;
      } ;
      f . prototype . toArray = function ( t ) {
        return G ( this , t ) ;
      } ;

      s . prototype . toString = function ( t , e ) {
        if ( void 0 === t && ( t = 10 ) , 10 !== t ) {
          return H ( this , t , e ) ;
        }
        for ( var r , o = this . value , n = o . length , i = String ( o [ -- n ] ) ; -- n >= 0 ; ) {
          r = String ( o [ n ] ) ;
          i += "0000000" . slice ( r . length ) + r ;
        }
        return ( this . sign ? "-" : "" ) + i ;
      } ;

      l . prototype . toString = function ( t , e ) {
        return void 0 === t && ( t = 10 ) , 10 != t ? H ( this , t , e ) : String ( this . value ) ;
      } ;
      f . prototype . toString = l . prototype . toString ;

      f . prototype . toJSON = s . prototype . toJSON = l . prototype . toJSON = function ( ) {
        return this . toString ( ) ;
      } ;

      s . prototype . valueOf = function ( ) {
        return parseInt ( this . toString ( ) , 10 ) ;
      } ;
      s . prototype . toJSNumber = s . prototype . valueOf ;

      l . prototype . valueOf = function ( ) {
        return this . value ;
      } ;
      l . prototype . toJSNumber = l . prototype . valueOf ;

      f . prototype . valueOf = f . prototype . toJSNumber = function ( ) {
        return parseInt ( this . toString ( ) , 10 ) ;
      } ;

      // Pre-populate small integer constants.
      for ( var V = 0 ; V < 1e3 ; V ++ ) {
        a [ V ] = Q ( V ) ;
        V > 0 && ( a [ - V ] = Q ( - V ) ) ;
      }

      // Export common constants and utility functions.
      return a . one = a [ 1 ] , a . zero = a [ 0 ] , a . minusOne = a [ - 1 ] , a . max = R , a . min = k , a . gcd = _ , a . lcm = function ( t , e ) {
        return t = Q ( t ) . abs ( ) , e = Q ( e ) . abs ( ) , t . divide ( _ ( t , e ) ) . multiply ( e ) ;
      } , a . isInstance = function ( t ) {
        return t instanceof s || t instanceof l || t instanceof f ;
      } , a . randBetween = function ( t , e ) {
        var o = k ( t = Q ( t ) , e = Q ( e ) ) , n = R ( t , e ) . subtract ( o ) . add ( 1 ) ;
        if ( n . isSmall ) {
          return o . add ( Math . floor ( Math . random ( ) * n ) ) ;
        }
        for ( var i = G ( n , r ) . value , u = [] , p = ! 0 , s = 0 ; s < i . length ; s ++ ) {
          var l = p ? i [ s ] : r , f = m ( Math . random ( ) * l ) ;
          u . push ( f ) ;
          f < l && ( p = ! 1 ) ;
        }
        return o . add ( a . fromArray ( u , r , ! 1 ) ) ;
      } , a . fromArray = function ( t , e , r ) {
        return F ( t . map ( Q ) , Q ( e || 10 ) , r ) ;
      } , a ;
    } ( ) ;

    // CommonJS compatibility.
    "undefined" != typeof module && module . hasOwnProperty ( "exports" ) && ( module . exports = t ) ;

    // AMD compatibility.
    "function" == typeof define && define . amd && define ( "big-integer" , [ ] , function ( ) {
      return t ;
    } ) ;
    // End of 'big-integer' module content.
  } , {} ] ,
  "Focm" : [ function ( require , module , exports ) {
    // Initialize an empty object for module exports.
    var n = {} ;

    // Immediately invoked function expression to define modules.
    ! function ( n ) {
      "use strict" ;

      var t = function ( n ) {
        this . compose = n ;
      } ;
      var r = new t ( function ( n ) {
        return function ( t ) {
          return function ( r ) {
            return n ( t ( r ) ) ;
          } ;
        } ;
      } ) ;
      n . compose = function ( n ) {
        return n . compose ;
      } ;
      n . Semigroupoid = t ;
      n . semigroupoidFn = r ;
    } ( n [ "Control.Semigroupoid" ] = n [ "Control.Semigroupoid" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      var r = n [ "Control.Semigroupoid" ] ;
      var e = function ( n , t ) {
        this . Semigroupoid0 = n ;
        this . identity = t ;
      } ;
      var a = new e ( function ( ) {
        return r . semigroupoidFn ;
      } , function ( n ) {
        return n ;
      } ) ;
      t . Category = e ;
      t . identity = function ( n ) {
        return n . identity ;
      } ;
      t . categoryFn = a ;
    } ( n [ "Control.Category" ] = n [ "Control.Category" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      ( n [ "Data.Eq" ] = n [ "Data.Eq" ] || {} ) . refEq = function ( n ) {
        return function ( t ) {
          return n === t ;
        } ;
      } ;
    } ( ) ;

    ! function ( t ) {
      "use strict" ;

      ( n [ "Data.Unit" ] = n [ "Data.Unit" ] || {} ) . unit = {} ;
    } ( ) ;

    ! function ( t ) {
      "use strict" ;

      n [ "Data.Show" ] ;
      n [ "Data.Symbol" ] ;
      n [ "Record.Unsafe" ] ;
      n [ "Type.Data.RowList" ] ;
      t . Show = function ( n ) {
        this . show = n ;
      } ;
      t . show = function ( n ) {
        return n . show ;
      } ;
    } ( n [ "Data.Show" ] = n [ "Data.Show" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      var r = n [ "Data.Unit" ] ;
      n [ "Data.Show" ] ;
      t . unit = r . unit ;
    } ( n [ "Data.Unit" ] = n [ "Data.Unit" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      var r = n [ "Data.Eq" ] ;
      var e = ( n [ "Data.HeytingAlgebra" ] , n [ "Data.Symbol" ] , n [ "Data.Unit" ] , n [ "Data.Void" ] , n [ "Record.Unsafe" ] , n [ "Type.Data.RowList" ] , function ( n ) {
        this . eq = n ;
      } ) ;
      var a = new e ( r . refEq ) ;
      var o = new e ( r . refEq ) ;
      var i = function ( n ) {
        return n . eq ;
      } ;
      t . Eq = e ;
      t . eq = i ;
      t . notEq = function ( n ) {
        return function ( t ) {
          return function ( r ) {
            return i ( o ) ( i ( n ) ( t ) ( r ) ) ( ! 1 ) ;
          } ;
        } ;
      } ;
      t . eqBoolean = o ;
      t . eqChar = a ;
    } ( n [ "Data.Eq" ] = n [ "Data.Eq" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      n [ "Data.Semigroup" ] ;
      n [ "Data.Symbol" ] ;
      n [ "Data.Unit" ] ;
      n [ "Data.Void" ] ;
      n [ "Record.Unsafe" ] ;
      n [ "Type.Data.RowList" ] ;
      t . Semigroup = function ( n ) {
        this . append = n ;
      } ;
      t . append = function ( n ) {
        return n . append ;
      } ;
    } ( n [ "Data.Semigroup" ] = n [ "Data.Semigroup" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      n [ "Data.Eq" ] ;
      n [ "Data.Semigroup" ] ;
      n [ "Data.Show" ] ;
      var r = function ( ) {
        function n ( ) {}
        return n . value = new n , n ;
      } ( ) ;
      var e = function ( ) {
        function n ( ) {}
        return n . value = new n , n ;
      } ( ) ;
      var a = function ( ) {
        function n ( ) {}
        return n . value = new n , n ;
      } ( ) ;
      t . LT = r ;
      t . GT = e ;
      t . EQ = a ;
    } ( n [ "Data.Ordering" ] = n [ "Data.Ordering" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      n [ "Data.Ord" ] ;
      n [ "Data.Eq" ] ;
      n [ "Data.Ord.Unsafe" ] ;
      var r = n [ "Data.Ordering" ] ;
      var e = ( n [ "Data.Ring" ] , n [ "Data.Semiring" ] , n [ "Data.Symbol" ] , n [ "Data.Unit" ] , n [ "Data.Void" ] , n [ "Record.Unsafe" ] , n [ "Type.Data.RowList" ] , function ( n ) {
        return n . compare ;
      } ) ;
      t . Ord = function ( n , t ) {
        this . Eq0 = n ;
        this . compare = t ;
      } ;
      t . compare = e ;
      t . lessThanOrEq = function ( n ) {
        return function ( t ) {
          return function ( a ) {
            return ! ( e ( n ) ( t ) ( a ) instanceof r . GT ) ;
          } ;
        } ;
      } ;
    } ( n [ "Data.Ord" ] = n [ "Data.Ord" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      n [ "Control.Category" ] ;
      n [ "Data.Boolean" ] ;
      n [ "Data.Ord" ] ;
      n [ "Data.Ring" ] ;
      t . flip = function ( n ) {
        return function ( t ) {
          return function ( r ) {
            return n ( r ) ( t ) ;
          } ;
        } ;
      } ;
      t . const = function ( n ) {
        return function ( t ) {
          return n ;
        } ;
      } ;
    } ( n [ "Data.Function" ] = n [ "Data.Function" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      n [ "Data.Functor" ] ;
      n [ "Control.Semigroupoid" ] ;
      var r = n [ "Data.Function" ] ;
      var e = n [ "Data.Unit" ] ;
      var a = function ( n ) {
        return n . map ;
      } ;
      t . Functor = function ( n ) {
        this . map = n ;
      } ;
      t . map = a ;
      t . void = function ( n ) {
        return a ( n ) ( r . const ( e . unit ) ) ;
      } ;
    } ( n [ "Data.Functor" ] = n [ "Data.Functor" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      n [ "Control.Apply" ] ;
      var r = n [ "Control.Category" ] ;
      var e = n [ "Data.Function" ] ;
      var a = n [ "Data.Functor" ] ;
      var o = function ( n ) {
        return n . apply ;
      } ;
      t . Apply = function ( n , t ) {
        this . Functor0 = n ;
        this . apply = t ;
      } ;
      t . apply = o ;
      t . applySecond = function ( n ) {
        return function ( t ) {
          return function ( i ) {
            return o ( n ) ( a . map ( n . Functor0 ( ) ) ( e . const ( r . identity ( r . categoryFn ) ) ) ( t ) ) ( i ) ;
          } ;
        } ;
      } ;
    } ( n [ "Control.Apply" ] = n [ "Control.Apply" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      var r = n [ "Control.Apply" ] ;
      var e = ( n [ "Data.Functor" ] , n [ "Data.Unit" ] , function ( n ) {
        return n . pure ;
      } ) ;
      t . Applicative = function ( n , t ) {
        this . Apply0 = n ;
        this . pure = t ;
      } ;
      t . pure = e ;
      t . liftA1 = function ( n ) {
        return function ( t ) {
          return function ( a ) {
            return r . apply ( n . Apply0 ( ) ) ( e ( n ) ( t ) ) ( a ) ;
          } ;
        } ;
      } ;
    } ( n [ "Control.Applicative" ] = n [ "Control.Applicative" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      n [ "Control.Bind" ] ;
      n [ "Control.Applicative" ] ;
      n [ "Control.Apply" ] ;
      n [ "Control.Category" ] ;
      var r = n [ "Data.Function" ] ;
      var e = ( n [ "Data.Functor" ] , n [ "Data.Unit" ] , function ( n ) {
        return n . bind ;
      } ) ;
      var a = function ( n ) {
        return r . flip ( e ( n ) ) ;
      } ;
      t . Bind = function ( n , t ) {
        this . Apply0 = n ;
        this . bind = t ;
      } ;
      t . bind = e ;
      t . bindFlipped = a ;
      t . composeKleisliFlipped = function ( n ) {
        return function ( t ) {
          return function ( r ) {
            return function ( e ) {
              return a ( n ) ( t ) ( r ( e ) ) ;
            } ;
          } ;
        } ;
      } ;
    } ( n [ "Control.Bind" ] = n [ "Control.Bind" ] || {} ) ;

    ! function ( n ) {
      "use strict" ;

      n . length = function ( n ) {
        return n . length ;
      } ;
      n . indexImpl = function ( n ) {
        return function ( t ) {
          return function ( r ) {
            return function ( e ) {
              return e < 0 || e >= r . length ? t : n ( r [ e ] ) ;
            } ;
          } ;
        } ;
      } ;
      n . findIndexImpl = function ( n ) {
        return function ( t ) {
          return function ( r ) {
            return function ( e ) {
              for ( var a = 0 , o = e . length ; a < o ; a ++ ) {
                if ( r ( e [ a ] ) ) {
                  return n ( a ) ;
                }
              }
              return t ;
            } ;
          } ;
        } ;
      } ;
      n . slice = function ( n ) {
        return function ( t ) {
          return function ( r ) {
            return r . slice ( n , t ) ;
          } ;
        } ;
      } ;
      n . take = function ( n ) {
        return function ( t ) {
          return n < 1 ? [] : t . slice ( 0 , n ) ;
        } ;
      } ;
    } ( n [ "Data.Array" ] = n [ "Data.Array" ] || {} ) ;

    ! function ( n ) {
      "use strict" ;

      n . foldrArray = function ( n ) {
        return function ( t ) {
          return function ( r ) {
            for ( var e = t , a = r . length - 1 ; a >= 0 ; a -- ) {
              e = n ( r [ a ] ) ( e ) ;
            }
            return e ;
          } ;
        } ;
      } ;
      n . foldlArray = function ( n ) {
        return function ( t ) {
          return function ( r ) {
            for ( var e = t , a = r . length , o = 0 ; o < a ; o ++ ) {
              e = n ( e ) ( r [ o ] ) ;
            }
            return e ;
          } ;
        } ;
      } ;
    } ( n [ "Data.Foldable" ] = n [ "Data.Foldable" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      var r = n [ "Control.Applicative" ] ;
      var e = ( n [ "Control.Apply" ] , n [ "Control.Bind" ] ) ;
      n [ "Data.Functor" ] ;
      n [ "Data.Unit" ] ;
      t . Monad = function ( n , t ) {
        this . Applicative0 = n ;
        this . Bind1 = t ;
      } ;
      t . ap = function ( n ) {
        return function ( t ) {
          return function ( a ) {
            return e . bind ( n . Bind1 ( ) ) ( t ) ( function ( t ) {
              return e . bind ( n . Bind1 ( ) ) ( a ) ( function ( e ) {
                return r . pure ( n . Applicative0 ( ) ) ( t ( e ) ) ;
              } ) ;
            } ) ;
          } ;
        } ;
      } ;
    } ( n [ "Control.Monad" ] = n [ "Control.Monad" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      n [ "Data.Boolean" ] ;
      n [ "Data.Eq" ] ;
      n [ "Data.EuclideanRing" ] ;
      n [ "Data.Ord" ] ;
      n [ "Data.Ordering" ] ;
      n [ "Data.Semigroup" ] ;
      n [ "Data.Symbol" ] ;
      n [ "Data.Unit" ] ;
      n [ "Record.Unsafe" ] ;
      n [ "Type.Data.RowList" ] ;
      t . Monoid = function ( n , t ) {
        this . Semigroup0 = n ;
        this . mempty = t ;
      } ;
      t . mempty = function ( n ) {
        return n . mempty ;
      } ;
    } ( n [ "Data.Monoid" ] = n [ "Data.Monoid" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      n [ "Control.Alt" ] ;
      var r = n [ "Control.Applicative" ] ;
      var e = n [ "Control.Apply" ] ;
      var a = n [ "Control.Bind" ] ;
      var o = ( n [ "Control.Extend" ] , n [ "Control.Monad" ] , n [ "Control.MonadZero" ] , n [ "Control.Plus" ] , n [ "Data.Bounded" ] , n [ "Data.Eq" ] , n [ "Data.Function" ] , n [ "Data.Functor" ] ) ;
      var i = ( n [ "Data.Functor.Invariant" ] , n [ "Data.Monoid" ] , n [ "Data.Ord" ] , n [ "Data.Ordering" ] , n [ "Data.Semigroup" ] , n [ "Data.Show" ] , n [ "Data.Unit" ] , n . Prelude , function ( ) {
        function n ( ) {}
        return n . value = new n , n ;
      } ( ) ) ;
      var u = function ( ) {
        function n ( n ) {
          this . value0 = n ;
        }
        return n . create = function ( t ) {
          return new n ( t ) ;
        } , n ;
      } ( ) ;
      var c = function ( n ) {
        return function ( t ) {
          return function ( r ) {
            if ( r instanceof i ) {
              return n ;
            }
            if ( r instanceof u ) {
              return t ( r . value0 ) ;
            }
            throw new Error ( "Failed pattern match at Data.Maybe (line 217, column 1 - line 217, column 51): " + [ n . constructor . name , t . constructor . name , r . constructor . name ] ) ;
          } ;
        } ;
      } ;
      var f = new o . Functor ( function ( n ) {
        return function ( t ) {
          return t instanceof u ? new u ( n ( t . value0 ) ) : i . value ;
        } ;
      } ) ;
      var l = new e . Apply ( function ( ) {
        return f ;
      } , function ( n ) {
        return function ( t ) {
          if ( n instanceof u ) {
            return o . map ( f ) ( n . value0 ) ( t ) ;
          }
          if ( n instanceof i ) {
            return i . value ;
          }
          throw new Error ( "Failed pattern match at Data.Maybe (line 67, column 1 - line 67, column 35): " + [ n . constructor . name , t . constructor . name ] ) ;
        } ;
      } ) ;
      var s = new a . Bind ( function ( ) {
        return l ;
      } , function ( n ) {
        return function ( t ) {
          if ( n instanceof u ) {
            return t ( n . value0 ) ;
          }
          if ( n instanceof i ) {
            return i . value ;
          }
          throw new Error ( "Failed pattern match at Data.Maybe (line 125, column 1 - line 125, column 33): " + [ n . constructor . name , t . constructor . name ] ) ;
        } ;
      } ) ;
      t . Nothing = i ;
      t . Just = u ;
      t . maybe = c ;
      t . fromMaybe = function ( n ) {
        return c ( n ) ( n [ "Control.Category" ] . identity ( n [ "Control.Category" ] . categoryFn ) ) ;
      } ;
      t . fromJust = function ( n ) {
        return function ( n ) {
          if ( n instanceof u ) {
            return n . value0 ;
          }
          throw new Error ( "Failed pattern match at Data.Maybe (line 268, column 1 - line 268, column 46): " + [ n . constructor . name ] ) ;
        } ;
      } ;
      t . functorMaybe = f ;
      t . applyMaybe = l ;
      t . bindMaybe = s ;
    } ( n [ "Data.Maybe" ] = n [ "Data.Maybe" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      var r = n [ "Data.Foldable" ] ;
      var e = ( n [ "Control.Alt" ] , n [ "Control.Applicative" ] ) ;
      var a = n [ "Control.Apply" ] ;
      var o = ( n [ "Control.Bind" ] , n [ "Control.Category" ] , n [ "Control.Plus" ] , n [ "Control.Semigroupoid" ] , n [ "Data.Eq" ] , n [ "Data.Function" ] , n [ "Data.Functor" ] , n [ "Data.HeytingAlgebra" ] , n [ "Data.Maybe" ] , n [ "Data.Maybe.First" ] , n [ "Data.Maybe.Last" ] , n [ "Data.Monoid" ] ) ;
      var i = ( n [ "Data.Monoid.Additive" ] , n [ "Data.Monoid.Conj" ] , n [ "Data.Monoid.Disj" ] , n [ "Data.Monoid.Dual" ] , n [ "Data.Monoid.Endo" ] , n [ "Data.Monoid.Multiplicative" ] , n [ "Data.Newtype" ] , n [ "Data.Ord" ] , n [ "Data.Ordering" ] , n [ "Data.Semigroup" ] ) ;
      var u = ( n [ "Data.Semiring" ] , n [ "Data.Unit" ] , function ( n , t , r ) {
        this . foldMap = n ;
        this . foldl = t ;
        this . foldr = r ;
      } ) ;
      var c = function ( n ) {
        return n . foldr ;
      } ;
      var f = function ( n ) {
        return function ( t ) {
          return function ( r ) {
            return c ( n ) ( function ( n ) {
              return function ( e ) {
                return i . append ( t . Semigroup0 ( ) ) ( r ( n ) ) ( e ) ;
              } ;
            } ) ( o . mempty ( t ) ) ;
          } ;
        } ;
      } ;
      var l = new u ( function ( n ) {
        return f ( l ) ( n ) ;
      } , r . foldlArray , r . foldrArray ) ;
      t . Foldable = u ;
      t . foldr = c ;
      t . foldl = function ( n ) {
        return n . foldl ;
      } ;
      t . foldMap = function ( n ) {
        return n . foldMap ;
      } ;
      t . foldMapDefaultR = f ;
      t . traverse_ = function ( n ) {
        return function ( t ) {
          return function ( r ) {
            return c ( t ) ( function ( t ) {
              return a . applySecond ( n . Apply0 ( ) ) ( r ( t ) ) ;
            } ) ( e . pure ( n ) ( u . unit ) ) ;
          } ;
        } ;
      } ;
      t . foldableArray = l ;
    } ( n [ "Data.Foldable" ] = n [ "Data.Foldable" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      ( n [ "Partial.Unsafe" ] = n [ "Partial.Unsafe" ] || {} ) . unsafePartial = function ( n ) {
        return n ( ) ;
      } ;
    } ( ) ;

    ! function ( t ) {
      "use strict" ;

      ( n [ "Partial" ] = n [ "Partial" ] || {} ) . crashWith = function ( ) {
        return function ( n ) {
          throw new Error ( n ) ;
        } ;
      } ;
    } ( ) ;

    ! function ( t ) {
      "use strict" ;

      var r = n . Partial ;
      t . crashWith = r . crashWith ;
    } ( n . Partial = n . Partial || {} ) ;

    ! function ( t ) {
      "use strict" ;

      var r = n [ "Partial.Unsafe" ] ;
      var e = n . Partial ;
      t . unsafeCrashWith = function ( n ) {
        return r . unsafePartial ( function ( t ) {
          return e . crashWith ( t ) ( n ) ;
        } ) ;
      } ;
    } ( n [ "Partial.Unsafe" ] = n [ "Partial.Unsafe" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      ( n [ "Unsafe.Coerce" ] = n [ "Unsafe.Coerce" ] || {} ) . unsafeCoerce = function ( n ) {
        return n ;
      } ;
    } ( ) ;

    ! function ( t ) {
      "use strict" ;

      var r = n [ "Unsafe.Coerce" ] ;
      t . unsafeCoerce = r . unsafeCoerce ;
    } ( n [ "Unsafe.Coerce" ] = n [ "Unsafe.Coerce" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      var r = n [ "Data.Array" ] ;
      var e = ( n [ "Control.Alt" ] , n [ "Control.Alternative" ] , n [ "Control.Applicative" ] , n [ "Control.Apply" ] , n [ "Control.Bind" ] , n [ "Control.Category" ] , n [ "Control.Lazy" ] , n [ "Control.Monad.Rec.Class" ] , n [ "Control.Monad.ST" ] , n [ "Control.Monad.ST.Internal" ] , n [ "Control.Semigroupoid" ] , n [ "Data.Array.NonEmpty.Internal" ] , n [ "Data.Array.ST" ] , n [ "Data.Array.ST.Iterator" ] , n [ "Data.Boolean" ] , n [ "Data.Eq" ] , n [ "Data.Foldable" ] , n [ "Data.Function" ] , n [ "Data.Functor" ] , n [ "Data.HeytingAlgebra" ] , n [ "Data.Maybe" ] ) ;
      var a = ( n [ "Data.Ord" ] , n [ "Data.Ordering" ] , n [ "Data.Ring" ] , n [ "Data.Semigroup" ] , n [ "Data.Semiring" ] , n [ "Data.Traversable" ] , n [ "Data.Tuple" ] , n [ "Data.Unfoldable" ] , n [ "Partial.Unsafe" ] , n . Prelude , n [ "Unsafe.Coerce" ] , r . indexImpl ( e . Just . create ) ( e . Nothing . value ) ) ;
      var o = r . findIndexImpl ( e . Just . create ) ( e . Nothing . value ) ;
      t . head = function ( n ) {
        return a ( n ) ( 0 ) ;
      } ;
      t . last = function ( n ) {
        return a ( n ) ( r . length ( n ) - 1 | 0 ) ;
      } ;
      t . index = a ;
      t . findIndex = o ;
      t . length = r . length ;
      t . take = r . take ;
    } ( n [ "Data.Array" ] = n [ "Data.Array" ] || {} ) ;

    ! function ( n ) {
      var t = require ( "big-integer" ) ;
      n [ "fromBase'" ] = function ( n ) {
        return function ( r ) {
          return function ( e ) {
            return function ( a ) {
              try {
                var o = t ( a , e ) ;
                return n ( o ) ;
              } catch ( i ) {
                return r ;
              }
            } ;
          } ;
        } ;
      } ;
      n . fromInt = function ( n ) {
        return t ( n ) ;
      } ;
      n . toBase = function ( n ) {
        return function ( t ) {
          return t . toString ( n ) ;
        } ;
      } ;
      n . biEquals = function ( n ) {
        return function ( t ) {
          return n . equals ( t ) ;
        } ;
      } ;
      n . biCompare = function ( n ) {
        return function ( t ) {
          return n . compare ( t ) ;
        } ;
      } ;
    } ( n [ "Data.BigInt" ] = n [ "Data.BigInt" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      ( n [ "Data.Int" ] = n [ "Data.Int" ] || {} ) . fromStringAsImpl = function ( n ) {
        return function ( t ) {
          return function ( r ) {
            var e ;
            e = r < 11 ? "[0-" + ( r - 1 ) . toString ( ) + "]" : 11 === r ? "[0-9a]" : "[0-9a-" + String . fromCharCode ( 86 + r ) + "]" ;
            var a = new RegExp ( "^[\\+\\-]?" + e + "+$" , "i" ) ;
            return function ( e ) {
              if ( a . test ( e ) ) {
                var o = parseInt ( e , r ) ;
                return ( 0 | o ) === o ? n ( o ) : t ;
              }
              return t ;
            } ;
          } ;
        } ;
      } ;
    } ( ) ;

    ! function ( t ) {
      "use strict" ;

      var r = n [ "Data.Int" ] ;
      var e = ( n [ "Control.Category" ] , n [ "Control.Semigroupoid" ] , n [ "Data.Boolean" ] , n [ "Data.Bounded" ] , n [ "Data.CommutativeRing" ] , n [ "Data.DivisionRing" ] , n [ "Data.Eq" ] , n [ "Data.EuclideanRing" ] , n [ "Data.HeytingAlgebra" ] , n [ "Data.Int.Bits" ] , n [ "Data.Maybe" ] ) ;
      var a = ( n [ "Data.Ord" ] , n [ "Data.Ordering" ] , n [ "Data.Ring" ] , n [ "Data.Semiring" ] , n [ "Data.Show" ] , n . Global , n . Math , n . Prelude , r . fromStringAsImpl ( e . Just . create ) ( e . Nothing . value ) ) ;
      var o = a ( 10 ) ;
      t . fromString = o ;
      t . fromStringAs = a ;
    } ( n [ "Data.Int" ] = n [ "Data.Int" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      var r = n [ "Data.BigInt" ] ;
      var e = ( n [ "Control.Semigroupoid" ] , n [ "Data.Array.NonEmpty" ] , n [ "Data.CommutativeRing" ] , n [ "Data.Eq" ] ) ;
      var a = ( n [ "Data.EuclideanRing" ] , n [ "Data.Function" ] , n [ "Data.Int" ] , n [ "Data.Maybe" ] ) ;
      var o = n [ "Data.Ord" ] ;
      var i = n [ "Data.Ordering" ] ;
      var u = ( n [ "Data.Ring" ] , n [ "Data.Semigroup" ] , n [ "Data.Semiring" ] , n [ "Data.Show" ] , n [ "Data.String.NonEmpty" ] , n [ "Data.String.NonEmpty.Internal" ] , n [ "Partial.Unsafe" ] , n . Prelude , r . toBase ( 10 ) ) ;
      var c = r [ "fromBase'" ] ( a . Just . create ) ( a . Nothing . value ) ;
      var f = c ( 10 ) ;
      var l = new e . Eq ( r . biEquals ) ;
      var s = new o . Ord ( function ( ) {
        return l ;
      } , function ( n ) {
        return function ( t ) {
          var e = r . biCompare ( n ) ( t ) ;
          return 1 === e ? i . GT . value : 0 === e ? i . EQ . value : i . LT . value ;
        } ;
      } ) ;
      t . fromString = f ;
      t . fromBase = c ;
      t . toString = u ;
      t . eqBigInt = l ;
      t . ordBigInt = s ;
      t . fromInt = r . fromInt ;
    } ( n [ "Data.BigInt" ] = n [ "Data.BigInt" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      n [ "Control.Alt" ] ;
      var r = n [ "Control.Applicative" ] ;
      var e = n [ "Control.Apply" ] ;
      var a = n [ "Control.Bind" ] ;
      var o = ( n [ "Control.Extend" ] , n [ "Control.Monad" ] , n [ "Control.Semigroupoid" ] , n [ "Data.Bifoldable" ] , n [ "Data.Bifunctor" ] , n [ "Data.Bitraversable" ] , n [ "Data.Bounded" ] , n [ "Data.Eq" ] , n [ "Data.Foldable" ] , n [ "Data.FoldableWithIndex" ] , n [ "Data.Function" ] , n [ "Data.Functor" ] ) ;
      var i = ( n [ "Data.Functor.Invariant" ] , n [ "Data.FunctorWithIndex" ] , n [ "Data.Maybe" ] ) ;
      var u = ( n [ "Data.Monoid" ] , n [ "Data.Ord" ] , n [ "Data.Ordering" ] , n [ "Data.Semigroup" ] , n [ "Data.Show" ] , n [ "Data.Traversable" ] , n [ "Data.TraversableWithIndex" ] , n [ "Data.Unit" ] , n . Prelude , function ( ) {
        function n ( n ) {
          this . value0 = n ;
        }
        return n . create = function ( t ) {
          return new n ( t ) ;
        } , n ;
      } ( ) ) ;
      var c = function ( ) {
        function n ( n ) {
          this . value0 = n ;
        }
        return n . create = function ( t ) {
          return new n ( t ) ;
        } , n ;
      } ( ) ;
      var f = new o . Functor ( function ( n ) {
        return function ( t ) {
          if ( t instanceof u ) {
            return new u ( t . value0 ) ;
          }
          if ( t instanceof c ) {
            return new c ( n ( t . value0 ) ) ;
          }
          throw new Error ( "Failed pattern match at Data.Either (line 38, column 8 - line 38, column 52): " + [ t . constructor . name ] ) ;
        } ;
      } ) ;
      var l = function ( n ) {
        return function ( t ) {
          return function ( r ) {
            if ( r instanceof u ) {
              return n ( r . value0 ) ;
            }
            if ( r instanceof c ) {
              return t ( r . value0 ) ;
            }
            throw new Error ( "Failed pattern match at Data.Either (line 238, column 1 - line 238, column 64): " + [ n . constructor . name , t . constructor . name , r . constructor . name ] ) ;
          } ;
        } ;
      } ;
      var s = new e . Apply ( function ( ) {
        return f ;
      } , function ( n ) {
        return function ( t ) {
          if ( n instanceof u ) {
            return new u ( n . value0 ) ;
          }
          if ( n instanceof c ) {
            return o . map ( f ) ( n . value0 ) ( t ) ;
          }
          throw new Error ( "Failed pattern match at Data.Either (line 82, column 1 - line 82, column 41): " + [ n . constructor . name , t . constructor . name ] ) ;
        } ;
      } ) ;
      var d = new a . Bind ( function ( ) {
        return s ;
      } , l ( function ( n ) {
        return function ( t ) {
          return new u ( n ) ;
        } ;
      } ) ( function ( n ) {
        return function ( t ) {
          return t ( n ) ;
        } ;
      } ) ) ;
      var p = new r . Applicative ( function ( ) {
        return s ;
      } , c . create ) ;
      t . Left = u ;
      t . Right = c ;
      t . either = l ;
      t . note = function ( n ) {
        return i . maybe ( new u ( n ) ) ( c . create ) ;
      } ;
      t . functorEither = f ;
      t . applyEither = s ;
      t . applicativeEither = p ;
      t . bindEither = d ;
    } ( n [ "Data.Either" ] = n [ "Data.Either" ] || {} ) ;

    ! function ( n ) {
      "use strict" ;

      n . toCharArray = function ( n ) {
        return n . split ( "" ) ;
      } ;
      n . singleton = function ( n ) {
        return n ;
      } ;
    } ( n [ "Data.String.CodeUnits" ] = n [ "Data.String.CodeUnits" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      var r = n [ "Data.String.CodeUnits" ] ;
      n [ "Control.Semigroupoid" ] ;
      n [ "Data.Boolean" ] ;
      n [ "Data.Eq" ] ;
      n [ "Data.Function" ] ;
      n [ "Data.HeytingAlgebra" ] ;
      n [ "Data.Maybe" ] ;
      n [ "Data.Ord" ] ;
      n [ "Data.Ring" ] ;
      n [ "Data.Semiring" ] ;
      n [ "Data.String.Pattern" ] ;
      n [ "Data.String.Unsafe" ] ;
      n . Prelude ;
      t . singleton = r . singleton ;
      t . toCharArray = r . toCharArray ;
    } ( n [ "Data.String.CodeUnits" ] = n [ "Data.String.CodeUnits" ] || {} ) ;

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

    ! function ( t ) {
      "use strict" ;

      var r = n [ "Data.String.Common" ] ;
      n [ "Data.Eq" ] ;
      n [ "Data.Ordering" ] ;
      n [ "Data.String.Pattern" ] ;
      n . Prelude ;
      t . split = r . split ;
      t . trim = r . trim ;
    } ( n [ "Data.String.Common" ] = n [ "Data.String.Common" ] || {} ) ;

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

    ! function ( t ) {
      "use strict" ;

      var r = n . Effect ;
      var e = n [ "Control.Applicative" ] ;
      var a = n [ "Control.Apply" ] ;
      var o = n [ "Control.Bind" ] ;
      var i = n [ "Control.Monad" ] ;
      var u = n [ "Data.Functor" ] ;
      var c = ( n [ "Data.Monoid" ] , n [ "Data.Semigroup" ] , n . Prelude , new i . Monad ( function ( ) {
        return s ;
      } , function ( ) {
        return f ;
      } ) ) ;
      var f = new o . Bind ( function ( ) {
        return l ;
      } , r . bindE ) ;
      var l = new a . Apply ( function ( ) {
        return d ;
      } , i . ap ( c ) ) ;
      var s = new e . Applicative ( function ( ) {
        return l ;
      } , r . pureE ) ;
      var d = new u . Functor ( e . liftA1 ( s ) ) ;
      t . functorEffect = d ;
      t . applyEffect = l ;
      t . applicativeEffect = s ;
      t . bindEffect = f ;
      t . monadEffect = c ;
    } ( n . Effect = n . Effect || {} ) ;

    ! function ( t ) {
      "use strict" ;

      n [ "Control.Category" ] ;
      n [ "Control.Monad" ] ;
      n . Effect ;
      t . liftEffect = function ( n ) {
        return n . liftEffect ;
      } ;
      t . MonadEffect = function ( n , t ) {
        this . Monad0 = n ;
        this . liftEffect = t ;
      } ;
    } ( n [ "Effect.Class" ] = n [ "Effect.Class" ] || {} ) ;

    ! function ( n ) {
      "use strict" ;

      n . new = function ( n ) {
        return function ( ) {
          return {
            value : n
          } ;
        } ;
      } ;
      n . read = function ( n ) {
        return function ( ) {
          return n . value ;
        } ;
      } ;
      n . write = function ( n ) {
        return function ( t ) {
          return function ( ) {
            return t . value = n , {} ;
          } ;
        } ;
      } ;
    } ( n [ "Effect.Ref" ] = n [ "Effect.Ref" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      var r = n [ "Effect.Ref" ] ;
      n [ "Data.Function" ] ;
      n [ "Data.Functor" ] ;
      n . Effect ;
      n . Prelude ;
      t . new = r . new ;
      t . read = r . read ;
      t . write = r . write ;
    } ( n [ "Effect.Ref" ] = n [ "Effect.Ref" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      n [ "Control.Alt" ] ;
      n [ "Control.Alternative" ] ;
      n [ "Control.Applicative" ] ;
      n [ "Control.Apply" ] ;
      n [ "Control.Bind" ] ;
      n [ "Control.Monad.Cont.Trans" ] ;
      n [ "Control.Monad.Except.Trans" ] ;
      n [ "Control.Monad.Maybe.Trans" ] ;
      n [ "Control.Monad.Reader.Trans" ] ;
      n [ "Control.Monad.Writer.Trans" ] ;
      n [ "Control.Plus" ] ;
      n [ "Control.Semigroupoid" ] ;
      n [ "Data.Either" ] ;
      n [ "Data.Function" ] ;
      n [ "Data.Functor" ] ;
      n [ "Data.Functor.Compose" ] ;
      n [ "Data.Maybe" ] ;
      n [ "Data.Newtype" ] ;
      n [ "Data.Unit" ] ;
      n [ "Effect.Class" ] ;
      n [ "Effect.Ref" ] ;
      n . Prelude ;
      t . parallel = function ( n ) {
        return n . parallel ;
      } ;
      t . sequential = function ( n ) {
        return n . sequential ;
      } ;
      t . Parallel = function ( n , t , r , e ) {
        this . Applicative1 = n ;
        this . Monad0 = t ;
        this . parallel = r ;
        this . sequential = e ;
      } ;
    } ( n [ "Control.Parallel.Class" ] = n [ "Control.Parallel.Class" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      var r = n [ "Control.Alternative" ] ;
      var e = n [ "Control.Apply" ] ;
      var a = n [ "Control.Category" ] ;
      var o = ( n [ "Control.Parallel.Class" ] , n [ "Control.Semigroupoid" ] , n [ "Data.Foldable" ] ) ;
      var i = ( n [ "Data.Traversable" ] , n . Prelude , function ( n ) {
        return function ( t ) {
          return function ( r ) {
            return function ( o ) {
              return n . sequential ( n ) ( o . traverse_ ( n . Applicative1 ( ) ) ( t ) ( function ( t ) {
                return n . parallel ( n ) ( r ( t ) ) ;
              } ) ( o ) ) ;
            } ;
          } ;
        } ;
      } ) ;
      t . parTraverse_ = i ;
      t . parSequence_ = function ( n ) {
        return function ( t ) {
          return i ( n ) ( t ) ( a . identity ( a . categoryFn ) ) ;
        } ;
      } ;
    } ( n [ "Control.Parallel" ] = n [ "Control.Parallel" ] || {} ) ;

    ! function ( n ) {
      "use strict" ;

      n . error = function ( n ) {
        return new Error ( n ) ;
      } ;
      n . throwException = function ( n ) {
        return function ( ) {
          throw n ;
        } ;
      } ;
    } ( n [ "Effect.Exception" ] = n [ "Effect.Exception" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      var r = n [ "Effect.Exception" ] ;
      n [ "Control.Applicative" ] ;
      n [ "Control.Semigroupoid" ] ;
      n [ "Data.Either" ] ;
      n [ "Data.Functor" ] ;
      n [ "Data.Maybe" ] ;
      n [ "Data.Show" ] ;
      n . Effect ;
      n . Prelude ;
      t . throw = function ( n ) {
        return r . throwException ( r . error ( n ) ) ;
      } ;
    } ( n [ "Effect.Exception" ] = n [ "Effect.Exception" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      var r = n [ "Effect.Aff" ] ;
      var e = ( n [ "Control.Alt" ] , n [ "Control.Alternative" ] , n [ "Control.Applicative" ] ) ;
      var a = n [ "Control.Apply" ] ;
      var o = n [ "Control.Bind" ] ;
      var i = ( n [ "Control.Lazy" ] , n [ "Control.Monad" ] ) ;
      var u = ( n [ "Control.Monad.Error.Class" ] , n [ "Control.Monad.Rec.Class" ] , n [ "Control.Parallel" ] ) ;
      var c = n [ "Control.Parallel.Class" ] ;
      var f = ( n [ "Control.Plus" ] , n [ "Control.Semigroupoid" ] , n [ "Data.Either" ] ) ;
      var l = n [ "Data.Foldable" ] ;
      var s = n [ "Data.Function" ] ;
      var d = ( n [ "Data.Function.Uncurried" ] , n [ "Data.Functor" ] ) ;
      var p = n [ "Data.Monoid" ] ;
      var D = ( n [ "Data.Newtype" ] , n [ "Data.Semigroup" ] ) ;
      var m = ( n [ "Data.Time.Duration" ] , n [ "Data.Unit" ] ) ;
      var h = n . Effect ;
      var g = n [ "Effect.Class" ] ;
      var C = ( n [ "Effect.Exception" ] , n [ "Effect.Unsafe" ] , n [ "Partial.Unsafe" ] ) ;
      var w = ( n . Prelude , n [ "Unsafe.Coerce" ] ) ;
      var v = new d . Functor ( r . _parAffMap ) ;
      var E = new d . Functor ( r . _map ) ;
      var y = {
        isLeft : function ( n ) {
          if ( n instanceof f . Left ) {
            return ! 0 ;
          }
          if ( n instanceof f . Right ) {
            return ! 1 ;
          }
          throw new Error ( "Failed pattern match at Effect.Aff (line 390, column 12 - line 392, column 20): " + [ n . constructor . name ] ) ;
        } ,
        fromLeft : function ( n ) {
          if ( n instanceof f . Left ) {
            return n . value0 ;
          }
          if ( n instanceof f . Right ) {
            return C . unsafeCrashWith ( "unsafeFromLeft: Right" ) ;
          }
          throw new Error ( "Failed pattern match at Effect.Aff (line 395, column 20 - line 399, column 3): " + [ n . constructor . name ] ) ;
        } ,
        fromRight : function ( n ) {
          if ( n instanceof f . Right ) {
            return n . value0 ;
          }
          if ( n instanceof f . Left ) {
            return C . unsafeCrashWith ( "unsafeFromRight: Left" ) ;
          }
          throw new Error ( "Failed pattern match at Effect.Aff (line 400, column 21 - line 402, column 31): " + [ n . constructor . name ] ) ;
        } ,
        left : f . Left . create ,
        right : f . Right . create
      } ;
      var A = function ( n ) {
        return function ( ) {
          var t = function ( n ) {
            return r . _makeFiber ( y , n ) ;
          } ( n ) ( ) ;
          return t . run ( ) , t ;
        } ;
      } ;
      var S = new a . Apply ( function ( ) {
        return v ;
      } , r . _parAffApply ) ;
      var b = new i . Monad ( function ( ) {
        return P ;
      } , function ( ) {
        return _ ;
      } ) ;
      var _ = new o . Bind ( function ( ) {
        return F ;
      } , r . _bind ) ;
      var F = new a . Apply ( function ( ) {
        return E ;
      } , i . ap ( b ) ) ;
      var P = new e . Applicative ( function ( ) {
        return F ;
      } , r . _pure ) ;
      var M = new g . MonadEffect ( function ( ) {
        return b ;
      } , r . _liftEffect ) ;
      var B = new c . Parallel ( function ( ) {
        return U ;
      } , function ( ) {
        return b ;
      } , w . unsafeCoerce , r . _sequential ) ;
      var U = new e . Applicative ( function ( ) {
        return S ;
      } , function ( n ) {
        return c . parallel ( B ) ( e . pure ( P ) ( n ) ) ;
      } ) ;
      var k = new D . Semigroup ( function ( n ) {
        return function ( t ) {
          return function ( r ) {
            return u . parSequence_ ( B ) ( l . foldableArray ) ( [ n ( r ) , t ( r ) ] ) ;
          } ;
        } ;
      } ) ;
      var I = s . const ( e . pure ( P ) ( m . unit ) ) ;
      var R = new p . Monoid ( function ( ) {
        return k ;
      } , I ) ;
      t . launchAff = A ;
      t . launchAff_ = function ( n ) {
        return d . void ( h . functorEffect ) ( A ( n ) ) ;
      } ;
      t . nonCanceler = I ;
      t . functorAff = E ;
      t . applyAff = F ;
      t . applicativeAff = P ;
      t . bindAff = _ ;
      t . monadAff = b ;
      t . monadEffectAff = M ;
      t . functorParAff = v ;
      t . applyParAff = S ;
      t . applicativeParAff = U ;
      t . parallelAff = B ;
      t . semigroupCanceler = k ;
      t . monoidCanceler = R ;
      t . makeAff = r . makeAff ;
    } ( n [ "Effect.Aff" ] = n [ "Effect.Aff" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      n [ "Node.Encoding" ] ;
      var r = n [ "Data.Show" ] ;
      var e = ( n . Prelude , function ( ) {
        function n ( ) {}
        return n . value = new n , n ;
      } ( ) ) ;
      var a = function ( ) {
        function n ( ) {}
        return n . value = new n , n ;
      } ( ) ;
      var o = function ( ) {
        function n ( ) {}
        return n . value = new n , n ;
      } ( ) ;
      var i = function ( ) {
        function n ( ) {}
        return n . value = new n , n ;
      } ( ) ;
      var u = function ( ) {
        function n ( ) {}
        return n . value = new n , n ;
      } ( ) ;
      var c = function ( ) {
        function n ( ) {}
        return n . value = new n , n ;
      } ( ) ;
      var f = function ( ) {
        function n ( ) {}
        return n . value = new n , n ;
      } ( ) ;
      var l = function ( ) {
        function n ( ) {}
        return n . value = new n , n ;
      } ( ) ;
      var s = new r . Show ( function ( n ) {
        if ( n instanceof e ) {
          return "ASCII" ;
        }
        if ( n instanceof a ) {
          return "UTF8" ;
        }
        if ( n instanceof o ) {
          return "UTF16LE" ;
        }
        if ( n instanceof i ) {
          return "UCS2" ;
        }
        if ( n instanceof u ) {
          return "Base64" ;
        }
        if ( n instanceof c ) {
          return "Latin1" ;
        }
        if ( n instanceof f ) {
          return "Binary" ;
        }
        if ( n instanceof l ) {
          return "Hex" ;
        }
        throw new Error ( "Failed pattern match at Node.Encoding (line 19, column 1 - line 19, column 39): " + [ n . constructor . name ] ) ;
      } ) ;
      t . ASCII = e ;
      t . UTF8 = a ;
      t . UTF16LE = o ;
      t . UCS2 = i ;
      t . Base64 = u ;
      t . Latin1 = c ;
      t . Binary = f ;
      t . Hex = l ;
      t . encodingToNode = function ( n ) {
        if ( n instanceof e ) {
          return "ascii" ;
        }
        if ( n instanceof a ) {
          return "utf8" ;
        }
        if ( n instanceof o ) {
          return "utf16le" ;
        }
        if ( n instanceof i ) {
          return "ucs2" ;
        }
        if ( n instanceof u ) {
          return "base64" ;
        }
        if ( n instanceof c ) {
          return "latin1" ;
        }
        if ( n instanceof f ) {
          return "binary" ;
        }
        if ( n instanceof l ) {
          return "hex" ;
        }
        throw new Error ( "Failed pattern match at Node.Encoding (line 31, column 1 - line 31, column 37): " + [ n . constructor . name ] ) ;
      } ;
      t . showEncoding = s ;
    } ( n [ "Node.Encoding" ] = n [ "Node.Encoding" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      ( n [ "Node.Process" ] = n [ "Node.Process" ] || {} ) . process = process ;
    } ( ) ;

    ! function ( n ) {
      "use strict" ;

      n . readChunkImpl = function ( n ) {
        return function ( t ) {
          return function ( r ) {
            if ( r instanceof Buffer ) {
              return t ( r ) ;
            }
            if ( "string" == typeof r ) {
              return n ( r ) ;
            }
            throw new Error ( "Node.Stream.readChunkImpl: Unrecognised chunk type; expected String or Buffer, got: " + r ) ;
          } ;
        } ;
      } ;
      n . onDataEitherImpl = function ( n ) {
        return function ( t ) {
          return function ( r ) {
            return function ( ) {
              t . on ( "data" , function ( t ) {
                r ( n ( t ) ) ( ) ;
              } ) ;
            } ;
          } ;
        } ;
      } ;
      n . onEnd = function ( n ) {
        return function ( t ) {
          return function ( ) {
            n . on ( "end" , t ) ;
          } ;
        } ;
      } ;
      n . write = function ( n ) {
        return function ( t ) {
          return function ( r ) {
            return function ( ) {
              return n . write ( t , null , r ) ;
            } ;
          } ;
        } ;
      } ;
      n . writeStringImpl = function ( n ) {
        return function ( t ) {
          return function ( r ) {
            return function ( e ) {
              return function ( ) {
                return n . write ( r , t , e ) ;
              } ;
            } ;
          } ;
        } ;
      } ;
    } ( n [ "Node.Stream" ] = n [ "Node.Stream" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      ( n [ "Node.Buffer" ] = n [ "Node.Buffer" ] || {} ) . toStringImpl = function ( n ) {
        return function ( t ) {
          return function ( ) {
            return t . toString ( n ) ;
          } ;
        } ;
      } ;
    } ( ) ;

    ! function ( t ) {
      "use strict" ;

      var r = n [ "Node.Buffer" ] ;
      var e = ( n [ "Control.Semigroupoid" ] , n [ "Data.ArrayBuffer.Types" ] , n [ "Data.Maybe" ] , n [ "Data.Show" ] , n . Effect , n [ "Node.Encoding" ] ) ;
      n . Prelude ;
      t . toString = function ( n ) {
        return r . toStringImpl ( e . encodingToNode ( n ) ) ;
      } ;
    } ( n [ "Node.Buffer" ] = n [ "Node.Buffer" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      var r = n [ "Node.Stream" ] ;
      var e = n [ "Control.Applicative" ] ;
      var a = n [ "Control.Bind" ] ;
      var o = n [ "Data.Either" ] ;
      var i = ( n [ "Data.Functor" ] , n [ "Data.Maybe" ] , n [ "Data.Show" ] ) ;
      var u = n . Effect ;
      var c = n [ "Effect.Exception" ] ;
      var f = n [ "Node.Buffer" ] ;
      var l = n [ "Node.Encoding" ] ;
      var s = ( n . Prelude , r . readChunkImpl ( o . Left . create ) ( o . Right . create ) ) ;
      var d = function ( n ) {
        return function ( t ) {
          return r . onDataEitherImpl ( s ) ( n ) ( t ) ;
        } ;
      } ;
      var p = function ( n ) {
        return function ( t ) {
          return d ( n ) ( a . composeKleisliFlipped ( u . bindEffect ) ( t ) ( function ( n ) {
            if ( n instanceof o . Left ) {
              return c . throw ( "Stream encoding should not be set" ) ;
            }
            if ( n instanceof o . Right ) {
              return e . pure ( u . applicativeEffect ) ( n . value0 ) ;
            }
            throw new Error ( "Failed pattern match at Node.Stream (line 94, column 5 - line 98, column 17): " + [ n . constructor . name ] ) ;
          } ) ) ;
        } ;
      } ;
      t . onData = p ;
      t . onDataString = function ( n ) {
        return function ( t ) {
          return function ( r ) {
            return p ( n ) ( a . composeKleisliFlipped ( u . bindEffect ) ( r ) ( f . toString ( t ) ) ) ;
          } ;
        } ;
      } ;
      t . onDataEither = d ;
      t . writeString = function ( n ) {
        return function ( t ) {
          return r . writeStringImpl ( n ) ( i . show ( l . showEncoding ) ( t ) ) ;
        } ;
      } ;
      t . onEnd = r . onEnd ;
    } ( n [ "Node.Stream" ] = n [ "Node.Stream" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      var r = n [ "Node.Process" ] ;
      var e = ( n [ "Data.Functor" ] , n [ "Data.Maybe" ] , n [ "Data.Posix" ] , n [ "Data.Posix.Signal" ] , n . Effect , n [ "Foreign.Object" ] , n [ "Node.Platform" ] , n [ "Node.Stream" ] , n . Prelude , n [ "Unsafe.Coerce" ] , r . process . stdout ) ;
      var a = r . process . stdin ;
      t . stdin = a ;
      t . stdout = e ;
    } ( n [ "Node.Process" ] = n [ "Node.Process" ] || {} ) ;

    ! function ( t ) {
      "use strict" ;

      var r = n [ "Control.Applicative" ] ;
      var e = n [ "Control.Bind" ] ;
      var a = n [ "Control.Category" ] ;
      var o = n [ "Data.Array" ] ;
      var i = n [ "Data.BigInt" ] ;
      var u = n [ "Data.Either" ] ;
      var c = n [ "Data.Eq" ] ;
      var f = n [ "Data.Functor" ] ;
      var l = n [ "Data.Int" ] ;
      var s = n [ "Data.Maybe" ] ;
      var d = n [ "Data.Monoid" ] ;
      var p = n [ "Data.Ord" ] ;
      var D = ( n [ "Data.Ring" ] , n [ "Data.Semigroup" ] , n [ "Data.Semiring" ] , n [ "Data.String" ] , n [ "Data.String.CodeUnits" ] ) ;
      var m = n [ "Data.String.Common" ] ;
      var h = ( n [ "Data.String.Pattern" ] , n [ "Data.Unit" ] ) ;
      var g = n . Effect ;
      var C = n [ "Effect.Aff" ] ;
      var w = n [ "Effect.Class" ] ;
      var v = n [ "Effect.Ref" ] ;
      var E = n [ "Node.Encoding" ] ;
      var y = n [ "Node.Process" ] ;
      var A = n [ "Node.Stream" ] ;
      var S = n [ "Partial.Unsafe" ] ;
      var b = ( n . Prelude , function ( n ) {
        // This function processes input 'n' to solve the problem.
        return u . either ( function ( n ) {
          return S . unsafeCrashWith ( n ) ;
        } ) ( a . identity ( a . categoryFn ) ) ( ( t = n , f = m . split ( "\n" ) ( m . trim ( t ) ) , e . bind ( u . bindEither ) ( u . note ( "s" ) ( o . head ( f ) ) ) ( function ( n ) {
          return e . bind ( u . bindEither ) ( u . note ( "k" ) ( e . bind ( s . bindMaybe ) ( o . last ( f ) ) ( i . fromString ) ) ) ( function ( t ) {
            return r . pure ( u . applicativeEither ) ( ( e = n , function ( n ) {
              var t = D . toCharArray ( e ) , r = function ( ) {
                var n = o . findIndex ( c . notEq ( c . eqChar ) ( "1" ) ) ( t ) ;
                if ( n instanceof s . Nothing ) {
                  return [ "1" ] ;
                }
                if ( n instanceof s . Just ) {
                  return o . take ( n . value0 + 1 | 0 ) ( t ) ;
                }
                throw new Error ( "Failed pattern match at ABC106C (line 66, column 7 - line 68, column 46): " + [ n . constructor . name ] ) ;
              } ( ) , a = s . fromJust ( ) ( o . last ( r ) ) ;
              return D . singleton ( function ( ) {
                if ( p . lessThanOrEq ( i . ordBigInt ) ( i . fromInt ( o . length ( r ) ) ) ( n ) ) {
                  return a ;
                }
                var e = s . fromJust ( ) ( l . fromString ( i . toString ( n ) ) ) ;
                return s . fromMaybe ( a ) ( o . index ( t ) ( e - 1 | 0 ) ) ;
              } ( ) ) ;
            } ) ( t ) ) + "\n" ) ;
            var e ;
          } ) ;
        } ) ) ) ;
        var t , f ;
      } ) ;

      var _ = C . makeAff ( function ( n ) {
        // This is an asynchronous effect to read all input from stdin.
        return function ( ) {
          var t = v . new ( "" ) ( ) ; // Create a new mutable reference to store input.

          A . onDataString ( y . stdin ) ( E . UTF8 . value ) ( function ( n ) {
            return function ( ) {
              var r = v . read ( t ) ( ) ; // Read current content.
              return v . write ( r + n ) ( t ) ( ) ; // Append new chunk and write back.
            } ;
          } ) ( ) ;

          A . onEnd ( y . stdin ) ( function ( ) {
            var e = v . read ( t ) ( ) ; // Read final content.
            return n ( r . pure ( u . applicativeEither ) ( e ) ) ( ) ; // Resolve the Aff with the collected input.
          } ) ( ) ;

          return d . mempty ( C . monoidCanceler ) ; // Return a non-canceler.
        } ;
      } ) ;

      // Launch the main application effect.
      var F = C . launchAff_ ( e . bind ( C . bindAff ) ( _ ) ( function ( n ) {
        // After reading input, solve the problem.
        return e . bind ( C . bindAff ) ( r . pure ( C . applicativeAff ) ( b ( n ) ) ) ( function ( n ) {
          // Lift the effect to write the result to stdout.
          return w . liftEffect ( C . monadEffectAff ) ( ( t = n , f . void ( g . functorEffect ) ( A . writeString ( y . stdout ) ( E . UTF8 . value ) ( t ) ( r . pure ( g . applicativeEffect ) ( h . unit ) ) ) ) ) ;
          var t ;
        } ) ;
      } ) ) ;

      // Export the main function and solve logic.
      t . main = F ;
      t . solve = b ;
    } ( n [ "ABC106C" ] = n [ "ABC106C" ] || {} ) ;

    // Automatically run the main function.
    n . ABC106C . main ( ) ;
  } , {
    "big-integer" : "9xaU"
  } ]
} , {} , [ "Focm" ] , null ) ;