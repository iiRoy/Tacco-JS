parcelRequire=function( e , r , t , n ) {

  /*
   * This is a custom module loading function, similar to require.
   * It handles module caching and resolution.
   */

  var i ,
      o = "function" == typeof parcelRequire && parcelRequire ,
      u = "function" == typeof require && require ;

  function f( t , n ) {

    if ( ! r [ t ] ) {

      if ( ! e [ t ] ) {

        /* Check for global parcelRequire or Node.js require */
        var i = "function" == typeof parcelRequire && parcelRequire ;

        if ( ! n && i )
          return i( t , !0 ) ;

        if ( o )
          return o( t , !0 ) ;

        if ( u && "string" == typeof t )
          return u( t ) ;

        /* Module not found, throw an error */
        var c = new Error( "Cannot find module '" + t + "'" ) ;

        throw c.code = "MODULE_NOT_FOUND" , c ;
      }

      /* Module definition found in `e` */
      p.resolve = function ( r ) {
        return e [ t ] [ 1 ] [ r ] || r ;
      } ;

      p.cache = {} ;

      /* Create a new module instance */
      var l = r [ t ] = new f.Module( t ) ;

      /* Execute the module's code */
      e [ t ] [ 0 ].call( l.exports , p , l , l.exports , this ) ;
    }

    /* Return the exported module content */
    return r [ t ].exports ;

    function p( e ) {
      return f( p.resolve( e ) ) ;
    }
  }

  // Initialize parcelRequire properties
  f.isParcelRequire = !0 ;

  f.Module = function ( e ) {
    this.id = e ;
    this.bundle = f ;
    this.exports = {} ;
  } ;

  f.modules = e ;
  f.cache = r ;
  f.parent = o ;

  f.register = function ( r , t ) {
    e [ r ] = [ function ( e , r ) {
      r.exports = t ;
    } , {} ] ;
  } ;

  /* Loop through initial modules and require them */
  for ( var c = 0 ; c < t.length ; c++ ) {
    try {
      f( t [ c ] ) ;
    } catch ( e ) {
      /* Store error if it's the first one */
      i || ( i = e ) ;
    }
  }

  /* Handle entry points for different environments */
  if ( t.length ) {
    var l = f( t [ t.length - 1 ] ) ;

    "object" == typeof exports && "undefined" != typeof module
      ? module.exports = l
      : "function" == typeof define && define.amd
        ? define( function () {
          return l ;
        } )
        : n && ( this [ n ] = l ) ;
  }

  /* Set global parcelRequire and re-throw error if present */
  if ( parcelRequire = f , i )
    throw i ;

  return f ;
}( {
  "9xaU": [ function ( require , module , exports ) {
    // Start of module 9xaU (big-integer library)
    var t = function ( e ) {
      "use strict" ;

      var r = 1e7 , /* Base for numbers, 10^7 */
          o = 7 , /* Digits per number in base r */
          n = 9007199254740992 , /* Max safe integer */
          i = h( n ) , /* Max safe integer as a big-integer array */
          u = "0123456789abcdefghijklmnopqrstuvwxyz" , /* Default alphabet for bases */
          p = "function" == typeof BigInt ; /* Check for BigInt support */

      /* Main constructor function for big-integer */
      function a( t , e , r , o ) {
        return void 0 === t
          ? a [ 0 ]
          : void 0 !== e && ( 10 != +e || r )
            ? $( t , e , r , o )
            : Q( t ) ;
      }

      /* Represents a large number (array of digits) */
      function s( t , e ) {
        this.value = t ;
        this.sign = e ;
        this.isSmall = !1 ;
      }

      /* Represents a small number (single JS number) */
      function l( t ) {
        this.value = t ;
        this.sign = t < 0 ;
        this.isSmall = !0 ;
      }

      /* Represents a BigInt number */
      function f( t ) {
        this.value = t ;
      }

      /* Checks if a number can be represented as a small integer */
      function v( t ) {
        return -n < t && t < n ;
      }

      /* Converts a JS number to an array of base-r digits */
      function h( t ) {
        return t < 1e7
          ? [ t ]
          : t < 1e14
            ? [ t % 1e7 , Math.floor( t / 1e7 ) ]
            : [ t % 1e7 , Math.floor( t / 1e7 ) % 1e7 , Math.floor( t / 1e14 ) ] ;
      }

      /* Cleans up leading zeros from a digit array */
      function y( t ) {
        c( t ) ;
        var e = t.length ;
        if ( e < 4 && P( t , i ) < 0 )
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
        return t ;
      }

      /* Removes leading zeros */
      function c( t ) {
        for ( var e = t.length ; 0 === t [ --e ] ; ) ;
        t.length = e + 1 ;
      }

      /* Creates an array filled with zeros */
      function g( t ) {
        for ( var e = new Array( t ) , r = -1 ; ++r < t ; )
          e [ r ] = 0 ;
        return e ;
      }

      /* Floors a number (handles negative numbers correctly) */
      function m( t ) {
        return t > 0 ? Math.floor( t ) : Math.ceil( t ) ;
      }

      /* Adds two arrays of digits (used for non-small numbers) */
      function d( t , e ) {
        var o ,
            n ,
            i = t.length ,
            u = e.length ,
            p = new Array( i ) ,
            a = 0 ,
            s = r ;
        for ( n = 0 ; n < u ; n++ )
          a = ( o = t [ n ] + e [ n ] + a ) >= s ? 1 : 0 , p [ n ] = o - a * s ;
        for ( ; n < i ; )
          a = ( o = t [ n ] + a ) === s ? 1 : 0 , p [ n++ ] = o - a * s ;
        return a > 0 && p.push( a ) , p ;
      }

      /* Wrapper for addition, ensures longer array is first */
      function w( t , e ) {
        return t.length >= e.length ? d( t , e ) : d( e , t ) ;
      }

      /* Adds a small number to a digit array */
      function b( t , e ) {
        var o ,
            n ,
            i = t.length ,
            u = new Array( i ) ,
            p = r ;
        for ( n = 0 ; n < i ; n++ )
          o = t [ n ] - p + e , e = Math.floor( o / p ) , u [ n ] = o - e * p , e += 1 ;
        for ( ; e > 0 ; )
          u [ n++ ] = e % p , e = Math.floor( e / p ) ;
        return u ;
      }

      /* Subtracts two arrays of digits */
      function S( t , e ) {
        var o ,
            n ,
            i = t.length ,
            u = new Array( i ) ,
            p = r ;
        for ( o = 0 ; o < u ; o++ )
          ( n = t [ o ] - a - e [ o ] ) < 0 ? ( n += p , a = 1 ) : a = 0 , u [ o ] = n ;
        for ( o = u ; o < i ; o++ ) {
          if ( !( ( n = t [ o ] - a ) < 0 ) ) {
            u [ o++ ] = n ;
            break ;
          }
          n += p , u [ o ] = n ;
        }
        for ( ; o < i ; o++ )
          u [ o ] = t [ o ] ;
        return c( u ) , u ;
      }

      /* Subtracts a small number from a digit array */
      function q( t , e , o ) {
        var n ,
            i ,
            u = t.length ,
            p = new Array( u ) ,
            a = -e ,
            f = r ;
        for ( n = 0 ; n < u ; n++ )
          i = t [ n ] + a , a = Math.floor( i / f ) , i %= f , p [ n ] = i < 0 ? i + f : i ;
        return "number" == typeof ( p = y( p ) )
          ? ( o && ( p = -p ) , new l( p ) )
          : new s( p , o ) ;
      }

      /* Multiplies two arrays of digits (long multiplication) */
      function M( t , e ) {
        var o ,
            n ,
            i ,
            u ,
            p = t.length ,
            a = e.length ,
            s = g( p + a ) ,
            l = r ;
        for ( i = 0 ; i < p ; ++i ) {
          u = t [ i ] ;
          for ( var f = 0 ; f < a ; ++f )
            o = u * e [ f ] + s [ i + f ] , n = Math.floor( o / l ) , s [ i + f ] = o - n * l , s [ i + f + 1 ] += n ;
        }
        return c( s ) , s ;
      }

      /* Multiplies a digit array by a small number */
      function N( t , e ) {
        var o ,
            n ,
            i = t.length ,
            u = new Array( i ) ,
            p = r ,
            a = 0 ;
        for ( n = 0 ; n < i ; n++ )
          o = t [ n ] * e + a , a = Math.floor( o / p ) , u [ n ] = o - a * p ;
        for ( ; a > 0 ; )
          u [ n++ ] = a % p , a = Math.floor( a / p ) ;
        return u ;
      }

      /* Prepends zeros to a digit array */
      function E( t , e ) {
        for ( var r = [] ; e-- > 0 ; )
          r.push( 0 ) ;
        return r.concat( t ) ;
      }

      /* Multiplies a digit array by a JS number */
      function O( t , e , o ) {
        return new s( t < r ? N( e , t ) : M( e , h( t ) ) , o ) ;
      }

      /* Squares a digit array */
      function B( t ) {
        var e ,
            o ,
            n ,
            i ,
            u = t.length ,
            p = g( u + u ) ,
            a = r ;
        for ( n = 0 ; n < u ; n++ ) {
          o = 0 - ( i = t [ n ] ) * i ;
          for ( var s = n ; s < u ; s++ )
            e = i * t [ s ] * 2 + p [ n + s ] + o , o = Math.floor( e / a ) , p [ n + s ] = e - o * a ;
          p [ n + u ] = o ;
        }
        return c( p ) , p ;
      }

      /* Divides a digit array by a small number */
      function I( t , e ) {
        var o ,
            n ,
            i ,
            u ,
            p = t.length ,
            a = g( p ) ,
            s = r ;
        for ( i = 0 , o = p - 1 ; o >= 0 ; --o )
          i = ( u = i * s + t [ o ] ) - ( n = m( u / e ) ) * e , a [ o ] = 0 | n ;
        return [ a , 0 | i ] ;
      }

      /* Divides two big-integers */
      function A( t , e ) {
        var o ,
            n = Q( e ) ;
        if ( p )
          return [ new f( t.value / n.value ) , new f( t.value % n.value ) ] ;
        var i ,
            u = t.value ,
            v = n.value ;
        if ( 0 === v )
          throw new Error( "Cannot divide by zero" ) ;
        if ( t.isSmall )
          return n.isSmall ? [ new l( m( u / v ) ) , new l( u % v ) ] : [ a [ 0 ] , t ] ;
        if ( n.isSmall ) {
          if ( 1 === v )
            return [ t , a [ 0 ] ] ;
          if ( -1 == v )
            return [ t.negate() , a [ 0 ] ] ;
          var d = Math.abs( v ) ;
          if ( d < r ) {
            i = y( ( o = I( u , d ) ) [ 0 ] ) ;
            var w = o [ 1 ] ;
            return t.sign && ( w = -w ) , "number" == typeof i
              ? ( t.sign !== n.sign && ( i = -i ) , [ new l( i ) , new l( w ) ] )
              : [ new s( i , t.sign !== n.sign ) , new l( w ) ] ;
          }
          v = h( d ) ;
        }
        var b = P( u , v ) ;
        if ( -1 === b )
          return [ a [ 0 ] , t ] ;
        if ( 0 === b )
          return [ a [ t.sign === n.sign ? 1 : -1 ] , a [ 0 ] ] ;
        i = ( o = u.length + v.length <= 200
          ? function ( t , e ) {
            var o ,
                n ,
                i ,
                u ,
                p ,
                a ,
                s ,
                l = t.length ,
                f = e.length ,
                v = r ,
                h = g( e.length ) ,
                c = e [ f - 1 ] ,
                m = Math.ceil( v / ( 2 * c ) ) ,
                d = N( t , m ) ,
                w = N( e , m ) ;
            for ( d.length <= l && d.push( 0 ) , w.push( 0 ) , c = w [ f - 1 ] , n = l - f ; n >= 0 ; n-- ) {
              for ( o = v - 1 , d [ n + f ] !== c && ( o = Math.floor( ( d [ n + f ] * v + d [ n + f - 1 ] ) / c ) ) , i = 0 , u = 0 , a = w.length , p = 0 ; p < a ; p++ )
                i += o * w [ p ] , s = Math.floor( i / v ) , u += d [ n + p ] - ( i - s * v ) , i = s , u < 0 ? ( d [ n + p ] = u + v , u = -1 ) : ( d [ n + p ] = u , u = 0 ) ;
              for ( ; 0 !== u ; ) {
                for ( o -= 1 , i = 0 , p = 0 ; p < a ; p++ )
                  ( i += d [ n + p ] - v + w [ p ] ) < 0 ? ( d [ n + p ] = i + v , i = 0 ) : ( d [ n + p ] = i , i = 1 ) ;
                u += i ;
              }
              h [ n ] = o ;
            }
            return d = I( d , m ) [ 0 ] , [ y( h ) , y( d ) ] ;
          }( u , v )
          : function ( t , e ) {
            for ( var o , n , i , u , p , a = t.length , s = e.length , l = [] , f = [] , v = r ; a ; )
              if ( f.unshift( t [ --a ] ) , c( f ) , P( f , e ) < 0 )
                l.push( 0 ) ;
              else {
                i = f [ ( n = f.length ) - 1 ] * v + f [ n - 2 ] , u = e [ s - 1 ] * v + e [ s - 2 ] , n > s && ( i = ( i + 1 ) * v ) , o = Math.ceil( i / u ) ;
                do {
                  if ( P( p = N( e , o ) , f ) <= 0 )
                    break ;
                  o-- ;
                } while ( o ) ;
                l.push( o ) , f = S( f , p ) ;
              }
            return l.reverse() , [ y( l ) , y( f ) ] ;
          }( u , v ) ) [ 0 ] ;
        var q = t.sign !== n.sign ,
            M = o [ 1 ] ,
            E = t.sign ;
        return "number" == typeof i
          ? ( q && ( i = -i ) , i = new l( i ) )
          : i = new s( i , q ) , "number" == typeof M
            ? ( E && ( M = -M ) , M = new l( M ) )
            : M = new s( M , E ) , [ i , M ] ;
      }

      /* Compares two digit arrays */
      function P( t , e ) {
        if ( t.length !== e.length )
          return t.length > e.length ? 1 : -1 ;
        for ( var r = t.length - 1 ; r >= 0 ; r-- )
          if ( t [ r ] !== e [ r ] )
            return t [ r ] > e [ r ] ? 1 : -1 ;
        return 0 ;
      }

      /* Checks for primality (simple cases) */
      function Z( t ) {
        var e = t.abs() ;
        return !e.isUnit() && ( !!( e.equals( 2 ) || e.equals( 3 ) || e.equals( 5 ) ) || !( e.isEven() || e.isDivisibleBy( 3 ) || e.isDivisibleBy( 5 ) ) && ( !!e.lesser( 49 ) || void 0 ) ) ;
      }

      /* Miller-Rabin primality test helper */
      function x( e , r ) {
        for ( var o , n , i , u = e.prev() , p = u , a = 0 ; p.isEven() ; )
          p = p.divide( 2 ) , a++ ;
        t: for ( n = 0 ; n < r.length ; n++ )
          if ( !e.lesser( r [ n ] ) && !( i = t( r [ n ] ).modPow( p , e ) ).isUnit() && !i.equals( u ) ) {
            for ( o = a - 1 ; 0 != o ; o-- ) {
              if ( ( i = i.square().mod( e ) ).isUnit() )
                return !1 ;
              if ( i.equals( u ) )
                continue t ;
            }
            return !1 ;
          }
        return !0 ;
      }

      /* Prototype assignments for BigNumber types */
      s.prototype = Object.create( a.prototype ) ;
      l.prototype = Object.create( a.prototype ) ;
      f.prototype = Object.create( a.prototype ) ;

      /* Addition methods */
      s.prototype.add = function ( t ) {
        var e = Q( t ) ;
        if ( this.sign !== e.sign )
          return this.subtract( e.negate() ) ;
        var r = this.value ,
            o = e.value ;
        return e.isSmall ? new s( b( r , Math.abs( o ) ) , this.sign ) : new s( w( r , o ) , this.sign ) ;
      } ;
      s.prototype.plus = s.prototype.add ;

      l.prototype.add = function ( t ) {
        var e = Q( t ) ,
            r = this.value ;
        if ( r < 0 !== e.sign )
          return this.subtract( e.negate() ) ;
        var o = e.value ;
        if ( e.isSmall ) {
          if ( v( r + o ) )
            return new l( r + o ) ;
          o = h( Math.abs( o ) ) ;
        }
        return new s( b( o , Math.abs( r ) ) , r < 0 ) ;
      } ;
      l.prototype.plus = l.prototype.add ;

      f.prototype.add = function ( t ) {
        return new f( this.value + Q( t ).value ) ;
      } ;
      f.prototype.plus = f.prototype.add ;

      /* Subtraction methods */
      s.prototype.subtract = function ( t ) {
        var e = Q( t ) ;
        if ( this.sign !== e.sign )
          return this.add( e.negate() ) ;
        var r = this.value ,
            o = e.value ;
        return e.isSmall
          ? q( r , Math.abs( o ) , this.sign )
          : function ( t , e , r ) {
            var o ;
            return P( t , e ) >= 0 ? o = S( t , e ) : ( o = S( e , t ) , r = !r ) , "number" == typeof ( o = y( o ) ) ? ( r && ( o = -o ) , new l( o ) ) : new s( o , r ) ;
          }( r , o , this.sign ) ;
      } ;
      s.prototype.minus = s.prototype.subtract ;

      l.prototype.subtract = function ( t ) {
        var e = Q( t ) ,
            r = this.value ;
        if ( r < 0 !== e.sign )
          return this.add( e.negate() ) ;
        var o = e.value ;
        return e.isSmall ? new l( r - o ) : q( o , Math.abs( r ) , r >= 0 ) ;
      } ;
      l.prototype.minus = l.prototype.subtract ;

      f.prototype.subtract = function ( t ) {
        return new f( this.value - Q( t ).value ) ;
      } ;
      f.prototype.minus = f.prototype.subtract ;

      /* Negation methods */
      s.prototype.negate = function () {
        return new s( this.value , !this.sign ) ;
      } ;

      l.prototype.negate = function () {
        var t = this.sign ,
            e = new l( -this.value ) ;
        return e.sign = !t , e ;
      } ;

      f.prototype.negate = function () {
        return new f( -this.value ) ;
      } ;

      /* Absolute value methods */
      s.prototype.abs = function () {
        return new s( this.value , !1 ) ;
      } ;

      l.prototype.abs = function () {
        return new l( Math.abs( this.value ) ) ;
      } ;

      f.prototype.abs = function () {
        return new f( this.value >= 0 ? this.value : -this.value ) ;
      } ;

      /* Multiplication methods */
      s.prototype.multiply = function ( t ) {
        var e ,
            o ,
            n ,
            i = Q( t ) ,
            u = this.value ,
            p = i.value ,
            l = this.sign !== i.sign ;
        if ( i.isSmall ) {
          if ( 0 === p )
            return a [ 0 ] ;
          if ( 1 === p )
            return this ;
          if ( -1 === p )
            return this.negate() ;
          if ( ( e = Math.abs( p ) ) < r )
            return new s( N( u , e ) , l ) ;
          p = h( e ) ;
        }
        return o = u.length , n = p.length , new s( - .012 * o - .012 * n + 15e-6 * o * n > 0
          ? function t( e , r ) {
            var o = Math.max( e.length , r.length ) ;
            if ( o <= 30 )
              return M( e , r ) ;
            o = Math.ceil( o / 2 ) ;
            var n = e.slice( o ) ,
                i = e.slice( 0 , o ) ,
                u = r.slice( o ) ,
                p = r.slice( 0 , o ) ,
                a = t( i , p ) ,
                s = t( n , u ) ,
                l = t( w( i , n ) , w( p , u ) ) ,
                f = w( w( a , E( S( S( l , a ) , s ) , o ) ) , E( s , 2 * o ) ) ;
            return c( f ) , f ;
          }( u , p )
          : M( u , p ) , l ) ;
      } ;
      s.prototype.times = s.prototype.multiply ;

      l.prototype._multiplyBySmall = function ( t ) {
        return v( t.value * this.value ) ? new l( t.value * this.value ) : O( Math.abs( t.value ) , h( Math.abs( this.value ) ) , this.sign !== t.sign ) ;
      } ;

      s.prototype._multiplyBySmall = function ( t ) {
        return 0 === t.value ? a [ 0 ] : 1 === t.value ? this : -1 === t.value ? this.negate() : O( Math.abs( t.value ) , this.value , this.sign !== t.sign ) ;
      } ;

      l.prototype.multiply = function ( t ) {
        return Q( t )._multiplyBySmall( this ) ;
      } ;
      l.prototype.times = l.prototype.multiply ;

      f.prototype.multiply = function ( t ) {
        return new f( this.value * Q( t ).value ) ;
      } ;
      f.prototype.times = f.prototype.multiply ;

      /* Square methods */
      s.prototype.square = function () {
        return new s( B( this.value ) , !1 ) ;
      } ;

      l.prototype.square = function () {
        var t = this.value * this.value ;
        return v( t ) ? new l( t ) : new s( B( h( Math.abs( this.value ) ) ) , !1 ) ;
      } ;

      f.prototype.square = function ( t ) {
        return new f( this.value * this.value ) ;
      } ;

      /* Division and Modulo methods */
      s.prototype.divmod = function ( t ) {
        var e = A( this , t ) ;
        return {
          quotient : e [ 0 ] ,
          remainder : e [ 1 ]
        } ;
      } ;
      f.prototype.divmod = l.prototype.divmod = s.prototype.divmod ;

      s.prototype.divide = function ( t ) {
        return A( this , t ) [ 0 ] ;
      } ;
      f.prototype.over = f.prototype.divide = function ( t ) {
        return new f( this.value / Q( t ).value ) ;
      } ;
      l.prototype.over = l.prototype.divide = s.prototype.over = s.prototype.divide ;

      s.prototype.mod = function ( t ) {
        return A( this , t ) [ 1 ] ;
      } ;
      f.prototype.mod = f.prototype.remainder = function ( t ) {
        return new f( this.value % Q( t ).value ) ;
      } ;
      l.prototype.remainder = l.prototype.mod = s.prototype.remainder = s.prototype.mod ;

      /* Exponentiation methods */
      s.prototype.pow = function ( t ) {
        var e ,
            r ,
            o ,
            n = Q( t ) ,
            i = this.value ,
            u = n.value ;
        if ( 0 === u )
          return a [ 1 ] ;
        if ( 0 === i )
          return a [ 0 ] ;
        if ( 1 === i )
          return a [ 1 ] ;
        if ( -1 === i )
          return n.isEven() ? a [ 1 ] : a [ -1 ] ;
        if ( n.sign )
          return a [ 0 ] ;
        if ( !n.isSmall )
          throw new Error( "The exponent " + n.toString() + " is too large." ) ;
        if ( this.isSmall && v( e = Math.pow( i , u ) ) )
          return new l( m( e ) ) ;
        for ( r = this , o = a [ 1 ] ; !0 & u && ( o = o.times( r ) , --u ) , 0 !== u ; )
          u /= 2 , r = r.square() ;
        return o ;
      } ;
      l.prototype.pow = s.prototype.pow ;

      f.prototype.pow = function ( t ) {
        var e = Q( t ) ,
            r = this.value ,
            o = e.value ,
            n = BigInt( 0 ) ,
            i = BigInt( 1 ) ,
            u = BigInt( 2 ) ;
        if ( o === n )
          return a [ 1 ] ;
        if ( r === n )
          return a [ 0 ] ;
        if ( r === i )
          return a [ 1 ] ;
        if ( r === BigInt( -1 ) )
          return e.isEven() ? a [ 1 ] : a [ -1 ] ;
        if ( e.isNegative() )
          return new f( n ) ;
        for ( var p = this , s = a [ 1 ] ;
          ( o & i ) === i && ( s = s.times( p ) , --o ) , o !== n ; )
          o /= u , p = p.square() ;
        return s ;
      } ;

      /* Modular exponentiation */
      s.prototype.modPow = function ( t , e ) {
        if ( t = Q( t ) , ( e = Q( e ) ).isZero() )
          throw new Error( "Cannot take modPow with modulus 0" ) ;
        for ( var r = a [ 1 ] , o = this.mod( e ) ; t.isPositive() ; ) {
          if ( o.isZero() )
            return a [ 0 ] ;
          t.isOdd() && ( r = r.multiply( o ).mod( e ) ) , t = t.divide( 2 ) , o = o.square().mod( e ) ;
        }
        return r ;
      } ;
      f.prototype.modPow = l.prototype.modPow = s.prototype.modPow ;

      /* Comparison methods */
      s.prototype.compareAbs = function ( t ) {
        var e = Q( t ) ,
            r = this.value ,
            o = e.value ;
        return e.isSmall ? 1 : P( r , o ) ;
      } ;

      l.prototype.compareAbs = function ( t ) {
        var e = Q( t ) ,
            r = Math.abs( this.value ) ,
            o = e.value ;
        return e.isSmall ? r === ( o = Math.abs( o ) ) ? 0 : r > o ? 1 : -1 : -1 ;
      } ;

      f.prototype.compareAbs = function ( t ) {
        var e = this.value ,
            r = Q( t ).value ;
        return ( e = e >= 0 ? e : -e ) === ( r = r >= 0 ? r : -r ) ? 0 : e > r ? 1 : -1 ;
      } ;

      s.prototype.compare = function ( t ) {
        if ( t === 1 / 0 )
          return -1 ;
        if ( t === -1 / 0 )
          return 1 ;
        var e = Q( t ) ,
            r = this.value ,
            o = e.value ;
        return this.sign !== e.sign ? e.sign ? 1 : -1 : e.isSmall ? this.sign ? -1 : 1 : P( r , o ) * ( this.sign ? -1 : 1 ) ;
      } ;
      s.prototype.compareTo = s.prototype.compare ;

      l.prototype.compare = function ( t ) {
        if ( t === 1 / 0 )
          return -1 ;
        if ( t === -1 / 0 )
          return 1 ;
        var e = Q( t ) ,
            r = this.value ,
            o = e.value ;
        return e.isSmall ? r == o ? 0 : r > o ? 1 : -1 : r < 0 !== e.sign ? r < 0 ? -1 : 1 : r < 0 ? 1 : -1 ;
      } ;
      l.prototype.compareTo = l.prototype.compare ;

      f.prototype.compare = function ( t ) {
        if ( t === 1 / 0 )
          return -1 ;
        if ( t === -1 / 0 )
          return 1 ;
        var e = this.value ,
            r = Q( t ).value ;
        return e === r ? 0 : e > r ? 1 : -1 ;
      } ;
      f.prototype.compareTo = f.prototype.compare ;

      s.prototype.equals = function ( t ) {
        return 0 === this.compare( t ) ;
      } ;
      f.prototype.eq = f.prototype.equals = l.prototype.eq = l.prototype.equals = s.prototype.eq = s.prototype.equals ;

      s.prototype.notEquals = function ( t ) {
        return 0 !== this.compare( t ) ;
      } ;
      f.prototype.neq = f.prototype.notEquals = l.prototype.neq = l.prototype.notEquals = s.prototype.neq = s.prototype.notEquals ;

      s.prototype.greater = function ( t ) {
        return this.compare( t ) > 0 ;
      } ;
      f.prototype.gt = f.prototype.greater = l.prototype.gt = l.prototype.greater = s.prototype.gt = s.prototype.greater ;

      s.prototype.lesser = function ( t ) {
        return this.compare( t ) < 0 ;
      } ;
      f.prototype.lt = f.prototype.lesser = l.prototype.lt = l.prototype.lesser = s.prototype.lt = s.prototype.lesser ;

      s.prototype.greaterOrEquals = function ( t ) {
        return this.compare( t ) >= 0 ;
      } ;
      f.prototype.geq = f.prototype.greaterOrEquals = l.prototype.geq = l.prototype.greaterOrEquals = s.prototype.geq = s.prototype.greaterOrEquals ;

      s.prototype.lesserOrEquals = function ( t ) {
        return this.compare( t ) <= 0 ;
      } ;
      f.prototype.leq = f.prototype.lesserOrEquals = l.prototype.leq = l.prototype.lesserOrEquals = s.prototype.leq = s.prototype.lesserOrEquals ;

      /* Property checks */
      s.prototype.isEven = function () {
        return 0 == ( 1 & this.value [ 0 ] ) ;
      } ;

      l.prototype.isEven = function () {
        return 0 == ( 1 & this.value ) ;
      } ;

      f.prototype.isEven = function () {
        return ( this.value & BigInt( 1 ) ) === BigInt( 0 ) ;
      } ;

      s.prototype.isOdd = function () {
        return 1 == ( 1 & this.value [ 0 ] ) ;
      } ;

      l.prototype.isOdd = function () {
        return 1 == ( 1 & this.value ) ;
      } ;

      f.prototype.isOdd = function () {
        return ( this.value & BigInt( 1 ) ) === BigInt( 1 ) ;
      } ;

      s.prototype.isPositive = function () {
        return !this.sign ;
      } ;

      l.prototype.isPositive = function () {
        return this.value > 0 ;
      } ;

      f.prototype.isPositive = l.prototype.isPositive ;

      s.prototype.isNegative = function () {
        return this.sign ;
      } ;

      l.prototype.isNegative = function () {
        return this.value < 0 ;
      } ;

      f.prototype.isNegative = l.prototype.isNegative ;

      s.prototype.isUnit = function () {
        return !1 ;
      } ;

      l.prototype.isUnit = function () {
        return 1 === Math.abs( this.value ) ;
      } ;

      f.prototype.isUnit = function () {
        return this.abs().value === BigInt( 1 ) ;
      } ;

      s.prototype.isZero = function () {
        return !1 ;
      } ;

      l.prototype.isZero = function () {
        return 0 === this.value ;
      } ;

      f.prototype.isZero = function () {
        return this.value === BigInt( 0 ) ;
      } ;

      s.prototype.isDivisibleBy = function ( t ) {
        var e = Q( t ) ;
        return !e.isZero() && ( !!e.isUnit() || ( 0 === e.compareAbs( 2 ) ? this.isEven() : this.mod( e ).isZero() ) ) ;
      } ;
      f.prototype.isDivisibleBy = l.prototype.isDivisibleBy = s.prototype.isDivisibleBy ;

      s.prototype.isPrime = function ( e ) {
        var r = Z( this ) ;
        if ( void 0 !== r )
          return r ;
        var o = this.abs() ,
            n = o.bitLength() ;
        if ( n <= 64 )
          return x( o , [ 2 , 3 , 5 , 7 , 11 , 13 , 17 , 19 , 23 , 29 , 31 , 37 ] ) ;
        for ( var i = Math.log( 2 ) * n.toJSNumber() , u = Math.ceil( !0 === e ? 2 * Math.pow( i , 2 ) : i ) , p = [] , a = 0 ; a < u ; a++ )
          p.push( t( a + 2 ) ) ;
        return x( o , p ) ;
      } ;
      f.prototype.isPrime = l.prototype.isPrime = s.prototype.isPrime ;

      s.prototype.isProbablePrime = function ( e ) {
        var r = Z( this ) ;
        if ( void 0 !== r )
          return r ;
        for ( var o = this.abs() , n = void 0 === e ? 5 : e , i = [] , u = 0 ; u < n ; u++ )
          i.push( t.randBetween( 2 , o.minus( 2 ) ) ) ;
        return x( o , i ) ;
      } ;
      f.prototype.isProbablePrime = l.prototype.isProbablePrime = s.prototype.isProbablePrime ;

      s.prototype.modInv = function ( e ) {
        for ( var r , o , n , i = t.zero , u = t.one , p = Q( e ) , a = this.abs() ; !a.isZero() ; )
          r = p.divide( a ) , o = i , n = p , i = u , p = a , u = o.subtract( r.multiply( u ) ) , a = n.subtract( r.multiply( a ) ) ;
        if ( !p.isUnit() )
          throw new Error( this.toString() + " and " + e.toString() + " are not co-prime" ) ;
        return -1 === i.compare( 0 ) && ( i = i.add( e ) ) , this.isNegative() ? i.negate() : i ;
      } ;
      f.prototype.modInv = l.prototype.modInv = s.prototype.modInv ;

      /* Increment and Decrement */
      s.prototype.next = function () {
        var t = this.value ;
        return this.sign ? q( t , 1 , this.sign ) : new s( b( t , 1 ) , this.sign ) ;
      } ;

      l.prototype.next = function () {
        var t = this.value ;
        return t + 1 < n ? new l( t + 1 ) : new s( i , !1 ) ;
      } ;

      f.prototype.next = function () {
        return new f( this.value + BigInt( 1 ) ) ;
      } ;

      s.prototype.prev = function () {
        var t = this.value ;
        return this.sign ? new s( b( t , 1 ) , !0 ) : q( t , 1 , this.sign ) ;
      } ;

      l.prototype.prev = function () {
        var t = this.value ;
        return t - 1 > -n ? new l( t - 1 ) : new s( i , !0 ) ;
      } ;

      f.prototype.prev = function () {
        return new f( this.value - BigInt( 1 ) ) ;
      } ;

      /* Constants for bitwise operations */
      for ( var J = [ 1 ] ; 2 * J [ J.length - 1 ] <= r ; )
        J.push( 2 * J [ J.length - 1 ] ) ;
      var L = J.length ,
          U = J [ L - 1 ] ;

      /* Checks if a number is within the safe integer range */
      function T( t ) {
        return Math.abs( t ) <= r ;
      }

      /* Generic bitwise operation function */
      function j( e , r , o ) {
        r = Q( r ) ;
        for ( var n = e.isNegative() , i = r.isNegative() , u = n ? e.not() : e , p = i ? r.not() : r , a = 0 , s = 0 , l = null , f = null , v = [] ; !u.isZero() || !p.isZero() ; )
          a = ( l = A( u , U ) ) [ 1 ].toJSNumber() , n && ( a = U - 1 - a ) , s = ( f = A( p , U ) ) [ 1 ].toJSNumber() , i && ( s = U - 1 - s ) , u = l [ 0 ] , p = f [ 0 ] , v.push( o( a , s ) ) ;
        for ( var h = 0 !== o( n ? 1 : 0 , i ? 1 : 0 ) ? t( -1 ) : t( 0 ) , y = v.length - 1 ; y >= 0 ; y -= 1 )
          h = h.multiply( U ).add( t( v [ y ] ) ) ;
        return h ;
      }

      /* Bitwise shift left */
      s.prototype.shiftLeft = function ( t ) {
        var e = Q( t ).toJSNumber() ;
        if ( !T( e ) )
          throw new Error( String( e ) + " is too large for shifting." ) ;
        if ( e < 0 )
          return this.shiftRight( -e ) ;
        var r = this ;
        if ( r.isZero() )
          return r ;
        for ( ; e >= L ; )
          r = r.multiply( U ) , e -= L - 1 ;
        return r.multiply( J [ e ] ) ;
      } ;
      f.prototype.shiftLeft = l.prototype.shiftLeft = s.prototype.shiftLeft ;

      /* Bitwise shift right */
      s.prototype.shiftRight = function ( t ) {
        var e ,
            r = Q( t ).toJSNumber() ;
        if ( !T( r ) )
          throw new Error( String( r ) + " is too large for shifting." ) ;
        if ( r < 0 )
          return this.shiftLeft( -r ) ;
        for ( var o = this ; r >= L ; ) {
          if ( o.isZero() || o.isNegative() && o.isUnit() )
            return o ;
          o = ( e = A( o , U ) ) [ 1 ].isNegative() ? e [ 0 ].prev() : e [ 0 ] , r -= L - 1 ;
        }
        return ( e = A( o , J [ r ] ) ) [ 1 ].isNegative() ? e [ 0 ].prev() : e [ 0 ] ;
      } ;
      f.prototype.shiftRight = l.prototype.shiftRight = s.prototype.shiftRight ;

      /* Bitwise NOT */
      s.prototype.not = function () {
        return this.negate().prev() ;
      } ;
      f.prototype.not = l.prototype.not = s.prototype.not ;

      /* Bitwise AND */
      s.prototype.and = function ( t ) {
        return j( this , t , function ( t , e ) {
          return t & e ;
        } ) ;
      } ;
      f.prototype.and = l.prototype.and = s.prototype.and ;

      /* Bitwise OR */
      s.prototype.or = function ( t ) {
        return j( this , t , function ( t , e ) {
          return t | e ;
        } ) ;
      } ;
      f.prototype.or = l.prototype.or = s.prototype.or ;

      /* Bitwise XOR */
      s.prototype.xor = function ( t ) {
        return j( this , t , function ( t , e ) {
          return t ^ e ;
        } ) ;
      } ;
      f.prototype.xor = l.prototype.xor = s.prototype.xor ;

      var C = 1 << 30 ,
          D = ( r & -r ) * ( r & -r ) | C ;

      /* Helper for bitLength, finds the lowest set bit */
      function z( t ) {
        var e = t.value ,
            o = "number" == typeof e ? e | C : "bigint" == typeof e ? e | BigInt( C ) : e [ 0 ] + e [ 1 ] * r | D ;
        return o & -o ;
      }

      /* Returns the greater of two big-integers */
      function R( t , e ) {
        return t = Q( t ) , e = Q( e ) , t.greater( e ) ? t : e ;
      }

      /* Returns the lesser of two big-integers */
      function k( t , e ) {
        return t = Q( t ) , e = Q( e ) , t.lesser( e ) ? t : e ;
      }

      /* Calculates the greatest common divisor (GCD) */
      function _( t , e ) {
        if ( t = Q( t ).abs() , e = Q( e ).abs() , t.equals( e ) )
          return t ;
        if ( t.isZero() )
          return e ;
        if ( e.isZero() )
          return t ;
        for ( var r , o , n = a [ 1 ] ; t.isEven() && e.isEven() ; )
          r = k( z( t ) , z( e ) ) , t = t.divide( r ) , e = e.divide( r ) , n = n.multiply( r ) ;
        for ( ; t.isEven() ; )
          t = t.divide( z( t ) ) ;
        do {
          for ( ; e.isEven() ; )
            e = e.divide( z( e ) ) ;
          t.greater( e ) && ( o = e , e = t , t = o ) , e = e.subtract( t ) ;
        } while ( !e.isZero() ) ;
        return n.isUnit() ? t : t.multiply( n ) ;
      }

      /* Calculates the bit length of the number */
      s.prototype.bitLength = function () {
        var e = this ;
        return e.compareTo( t( 0 ) ) < 0 && ( e = e.negate().subtract( t( 1 ) ) ) , 0 === e.compareTo( t( 0 ) ) ? t( 0 ) : t( function e( r , o ) {
          if ( o.compareTo( r ) <= 0 ) {
            var n = e( r , o.square( o ) ) ,
                i = n.p ,
                u = n.e ,
                p = i.multiply( o ) ;
            return p.compareTo( r ) <= 0 ? {
              p : p ,
              e : 2 * u + 1
            } : {
              p : i ,
              e : 2 * u
            } ;
          }
          return {
            p : t( 1 ) ,
            e : 0
          } ;
        }( e , t( 2 ) ).e ).add( t( 1 ) ) ;
      } ;
      f.prototype.bitLength = l.prototype.bitLength = s.prototype.bitLength ;

      /* Converts a string to a big-integer in a specific base */
      var $ = function ( t , e , r , o ) {
        r = r || u , t = String( t ) , o || ( t = t.toLowerCase() , r = r.toLowerCase() ) ;
        var n ,
            i = t.length ,
            p = Math.abs( e ) ,
            a = {} ;
        for ( n = 0 ; n < r.length ; n++ )
          a [ r [ n ] ] = n ;
        for ( n = 0 ; n < i ; n++ ) {
          if ( "-" !== ( f = t [ n ] ) && ( f in a && a [ f ] >= p ) ) {
            if ( "1" === f && 1 === p )
              continue ;
            throw new Error( f + " is not a valid digit in base " + e + "." ) ;
          }
        }
        e = Q( e ) ;
        var s = [] ,
            l = "-" === t [ 0 ] ;
        for ( n = l ? 1 : 0 ; n < t.length ; n++ ) {
          var f ;
          if ( ( f = t [ n ] ) in a )
            s.push( Q( a [ f ] ) ) ;
          else {
            if ( "<" !== f )
              throw new Error( f + " is not a valid character" ) ;
            var v = n ;
            do {
              n++ ;
            } while ( ">" !== t [ n ] && n < t.length ) ;
            s.push( Q( t.slice( v + 1 , n ) ) ) ;
          }
        }
        return F( s , e , l ) ;
      } ;

      /* Converts an array of digits (in a given base) to a big-integer */
      function F( t , e , r ) {
        var o ,
            n = a [ 0 ] ,
            i = a [ 1 ] ;
        for ( o = t.length - 1 ; o >= 0 ; o-- )
          n = n.add( t [ o ].times( i ) ) , i = i.times( e ) ;
        return r ? n.negate() : n ;
      }

      /* Converts a big-integer to an array of digits in a given base */
      function G( e , r ) {
        if ( ( r = t( r ) ).isZero() ) {
          if ( e.isZero() )
            return {
              value : [ 0 ] ,
              isNegative : !1
            } ;
          throw new Error( "Cannot convert nonzero numbers to base 0." ) ;
        }
        if ( r.equals( -1 ) ) {
          if ( e.isZero() )
            return {
              value : [ 0 ] ,
              isNegative : !1
            } ;
          if ( e.isNegative() )
            return {
              value : [].concat.apply( [] , Array.apply( null , Array( -e.toJSNumber() ) ).map( Array.prototype.valueOf , [ 1 , 0 ] ) ) ,
              isNegative : !1
            } ;
          var o = Array.apply( null , Array( e.toJSNumber() - 1 ) ).map( Array.prototype.valueOf , [ 0 , 1 ] ) ;
          return o.unshift( [ 1 ] ) , {
            value : [].concat.apply( [] , o ) ,
            isNegative : !1
          } ;
        }
        var n = !1 ;
        if ( e.isNegative() && r.isPositive() && ( n = !0 , e = e.abs() ) ) ;
        if ( r.isUnit() )
          return e.isZero()
            ? {
              value : [ 0 ] ,
              isNegative : !1
            }
            : {
              value : Array.apply( null , Array( e.toJSNumber() ) ).map( Number.prototype.valueOf , 1 ) ,
              isNegative : n
            } ;
        for ( var i , u = [] , p = e ; p.isNegative() || p.compareAbs( r ) >= 0 ; ) {
          i = p.divmod( r ) , p = i.quotient ;
          var a = i.remainder ;
          a.isNegative() && ( a = r.minus( a ).abs() , p = p.next() ) , u.push( a.toJSNumber() ) ;
        }
        return u.push( p.toJSNumber() ) , {
          value : u.reverse() ,
          isNegative : n
        } ;
      }

      /* Formats a big-integer into a string representation of a given base */
      function H( t , e , r ) {
        var o = G( t , e ) ;
        return ( o.isNegative ? "-" : "" ) + o.value.map( function ( t ) {
          return function ( t , e ) {
            return t < ( e = e || u ).length ? e [ t ] : "<" + t + ">" ;
          }( t , r ) ;
        } ).join( "" ) ;
      }

      /* Parses a string into a big-integer */
      function K( t ) {
        if ( v( +t ) ) {
          var e = +t ;
          if ( e === m( e ) )
            return p ? new f( BigInt( e ) ) : new l( e ) ;
          throw new Error( "Invalid integer: " + t ) ;
        }
        var r = "-" === t [ 0 ] ;
        r && ( t = t.slice( 1 ) ) ;
        var n = t.split( /e/i ) ;
        if ( n.length > 2 )
          throw new Error( "Invalid integer: " + n.join( "e" ) ) ;
        if ( 2 === n.length ) {
          var i = n [ 1 ] ;
          if ( "+" === i [ 0 ] && ( i = i.slice( 1 ) ) , ( i = +i ) !== m( i ) || !v( i ) )
            throw new Error( "Invalid integer: " + i + " is not a valid exponent." ) ;
          var u = n [ 0 ] ,
              a = u.indexOf( "." ) ;
          if ( a >= 0 && ( i -= u.length - a - 1 , u = u.slice( 0 , a ) + u.slice( a + 1 ) ) , i < 0 )
            throw new Error( "Cannot include negative exponent part for integers" ) ;
          t = u += new Array( i + 1 ).join( "0" ) ;
        }
        if ( !/^([0-9][0-9]*)$/.test( t ) )
          throw new Error( "Invalid integer: " + t ) ;
        if ( p )
          return new f( BigInt( r ? "-" + t : t ) ) ;
        for ( var h = [] , y = t.length , g = o , d = y - g ; y > 0 ; )
          h.push( +t.slice( d , y ) ) , ( d -= g ) < 0 && ( d = 0 ) , y -= g ;
        return c( h ) , new s( h , r ) ;
      }

      /* Converts various types to a big-integer object */
      function Q( t ) {
        return "number" == typeof t
          ? function ( t ) {
            if ( p )
              return new f( BigInt( t ) ) ;
            if ( v( t ) ) {
              if ( t !== m( t ) )
                throw new Error( t + " is not an integer." ) ;
              return new l( t ) ;
            }
            return K( t.toString() ) ;
          }( t )
          : "string" == typeof t
            ? K( t )
            : "bigint" == typeof t
              ? new f( t )
              : t ;
      }

      /* Exported conversion methods */
      s.prototype.toArray = function ( t ) {
        return G( this , t ) ;
      } ;
      l.prototype.toArray = function ( t ) {
        return G( this , t ) ;
      } ;
      f.prototype.toArray = function ( t ) {
        return G( this , t ) ;
      } ;

      s.prototype.toString = function ( t , e ) {
        if ( void 0 === t && ( t = 10 ) , 10 !== t )
          return H( this , t , e ) ;
        for ( var r , o = this.value , n = o.length , i = String( o [ --n ] ) ; --n >= 0 ; )
          r = String( o [ n ] ) , i += "0000000".slice( r.length ) + r ;
        return ( this.sign ? "-" : "" ) + i ;
      } ;

      l.prototype.toString = function ( t , e ) {
        return void 0 === t && ( t = 10 ) , 10 != t ? H( this , t , e ) : String( this.value ) ;
      } ;
      f.prototype.toString = l.prototype.toString ;

      f.prototype.toJSON = s.prototype.toJSON = l.prototype.toJSON = function () {
        return this.toString() ;
      } ;

      s.prototype.valueOf = function () {
        return parseInt( this.toString() , 10 ) ;
      } ;
      s.prototype.toJSNumber = s.prototype.valueOf ;

      l.prototype.valueOf = function () {
        return this.value ;
      } ;
      l.prototype.toJSNumber = l.prototype.valueOf ;

      f.prototype.valueOf = f.prototype.toJSNumber = function () {
        return parseInt( this.toString() , 10 ) ;
      } ;

      /* Pre-populate small integers for efficiency */
      for ( var V = 0 ; V < 1e3 ; V++ )
        a [ V ] = Q( V ) , V > 0 && ( a [ -V ] = Q( -V ) ) ;

      /* Exported utility functions */
      return a.one = a [ 1 ] ,
             a.zero = a [ 0 ] ,
             a.minusOne = a [ -1 ] ,
             a.max = R ,
             a.min = k ,
             a.gcd = _ ,
             a.lcm = function ( t , e ) {
               return t = Q( t ).abs() , e = Q( e ).abs() , t.divide( _( t , e ) ).multiply( e ) ;
             } ,
             a.isInstance = function ( t ) {
               return t instanceof s || t instanceof l || t instanceof f ;
             } ,
             a.randBetween = function ( t , e ) {
               var o = k( t = Q( t ) , e = Q( e ) ) ,
                   n = R( t , e ).subtract( o ).add( 1 ) ;
               if ( n.isSmall )
                 return o.add( Math.floor( Math.random() * n ) ) ;
               for ( var i = G( n , r ).value , u = [] , p = !0 , s = 0 ; s < i.length ; s++ ) {
                 var l = p ? i [ s ] : r ,
                     f = m( Math.random() * l ) ;
                 u.push( f ) , f < l && ( p = !1 ) ;
               }
               return o.add( a.fromArray( u , r , !1 ) ) ;
             } ,
             a.fromArray = function ( t , e , r ) {
               return F( t.map( Q ) , Q( e || 10 ) , r ) ;
             } ,
             a ;
    }() ;

    /* Module export for Node.js and AMD */
    "undefined" != typeof module && module.hasOwnProperty( "exports" ) && ( module.exports = t ) ;

    "function" == typeof define && define.amd && define( "big-integer" , [] , function () {
      return t ;
    } ) ;
    // End of module 9xaU
  } , {} ] ,
  "Focm": [ function ( require , module , exports ) {
    // Start of module Focm (PureScript runtime code)

    var n = {} ;

    ! function ( e ) {
      "use strict" ;

      /* Control.Apply.arrayApply: Applies an array of functions to an array of values */
      ( n [ "Control.Apply" ] = n [ "Control.Apply" ] || {} ).arrayApply = function ( n ) {
        return function ( e ) {
          for ( var a = n.length , t = e.length , u = new Array( a * t ) , r = 0 , o = 0 ; o < a ; o++ )
            for ( var i = n [ o ] , l = 0 ; l < t ; l++ )
              u [ r++ ] = i( e [ l ] ) ;
          return u ;
        } ;
      } ;
    }() ,

    function ( n ) {
      "use strict" ;

      /* Control.Semigroupoid: Defines composition */
      var e = function ( n ) {
            this.compose = n ;
          } ,
          a = new e( function ( n ) {
            return function ( e ) {
              return function ( a ) {
                return n( e( a ) ) ;
              } ;
            } ;
          } ) ;

      n.compose = function ( n ) {
        return n.compose ;
      } ;
      n.Semigroupoid = e ;
      n.semigroupoidFn = a ;
    }( n [ "Control.Semigroupoid" ] = n [ "Control.Semigroupoid" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      /* Control.Category: Defines identity */
      var a = n [ "Control.Semigroupoid" ] ,
          t = function ( n , e ) {
            this.Semigroupoid0 = n , this.identity = e ;
          } ,
          u = new t( function () {
            return a.semigroupoidFn ;
          } , function ( n ) {
            return n ;
          } ) ;

      e.Category = t ;
      e.identity = function ( n ) {
        return n.identity ;
      } ;
      e.categoryFn = u ;
    }( n [ "Control.Category" ] = n [ "Control.Category" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      /* Data.Boolean.otherwise: Simple boolean true */
      ( n [ "Data.Boolean" ] = n [ "Data.Boolean" ] || {} ).otherwise = !0 ;
    }() ,

    function ( e ) {
      "use strict" ;

      /* Data.Eq.refEq: Reference equality check */
      ( n [ "Data.Eq" ] = n [ "Data.Eq" ] || {} ).refEq = function ( n ) {
        return function ( e ) {
          return n === e ;
        } ;
      } ;
    }() ,

    function ( e ) {
      "use strict" ;

      /* Data.Unit.unit: The unit value */
      ( n [ "Data.Unit" ] = n [ "Data.Unit" ] || {} ).unit = {} ;
    }() ,

    function ( e ) {
      "use strict" ;

      n [ "Data.Show" ] , n [ "Data.Symbol" ] , n [ "Record.Unsafe" ] , n [ "Type.Data.RowList" ] ;
      e.Show = function ( n ) {
        this.show = n ;
      } ;
      e.show = function ( n ) {
        return n.show ;
      } ;
    }( n [ "Data.Show" ] = n [ "Data.Show" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      var a = n [ "Data.Unit" ] ;
      n [ "Data.Show" ] ;
      e.unit = a.unit ;
    }( n [ "Data.Unit" ] = n [ "Data.Unit" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      var a = n [ "Data.Eq" ] ,
          t = ( n [ "Data.HeytingAlgebra" ] , n [ "Data.Symbol" ] , n [ "Data.Unit" ] , n [ "Data.Void" ] , n [ "Record.Unsafe" ] , n [ "Type.Data.RowList" ] , function ( n ) {
            this.eq = n ;
          } ) ,
          u = new t( a.refEq ) ;

      e.Eq = t ;
      e.eq = function ( n ) {
        return n.eq ;
      } ;
      e.eqInt = u ;
    }( n [ "Data.Eq" ] = n [ "Data.Eq" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      /* Data.Ord.Unsafe.unsafeCompareImpl: Low-level comparison function */
      ( n [ "Data.Ord.Unsafe" ] = n [ "Data.Ord.Unsafe" ] || {} ).unsafeCompareImpl = function ( n ) {
        return function ( e ) {
          return function ( a ) {
            return function ( t ) {
              return function ( u ) {
                return t < u ? n : t === u ? e : a ;
              } ;
            } ;
          } ;
        } ;
      } ;
    }() ,

    function ( e ) {
      "use strict" ;

      n [ "Data.Semigroup" ] , n [ "Data.Symbol" ] , n [ "Data.Unit" ] , n [ "Data.Void" ] , n [ "Record.Unsafe" ] , n [ "Type.Data.RowList" ] ;
      e.Semigroup = function ( n ) {
        this.append = n ;
      } ;
      e.append = function ( n ) {
        return n.append ;
      } ;
    }( n [ "Data.Semigroup" ] = n [ "Data.Semigroup" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      n [ "Data.Eq" ] , n [ "Data.Semigroup" ] , n [ "Data.Show" ] ;
      /* Data.Ordering: Data types for comparison results */
      var a = function () {
            function n() {}
            return n.value = new n , n ;
          }() ,
          t = function () {
            function n() {}
            return n.value = new n , n ;
          }() ,
          u = function () {
            function n() {}
            return n.value = new n , n ;
          }() ;

      e.LT = a , e.GT = t , e.EQ = u ;
    }( n [ "Data.Ordering" ] = n [ "Data.Ordering" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      var a = n [ "Data.Ord.Unsafe" ] ,
          t = n [ "Data.Ordering" ] ,
          u = a.unsafeCompareImpl( t.LT.value )( t.EQ.value )( t.GT.value ) ;

      e.unsafeCompare = u ;
    }( n [ "Data.Ord.Unsafe" ] = n [ "Data.Ord.Unsafe" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      n [ "Data.Semiring" ] , n [ "Data.Symbol" ] , n [ "Data.Unit" ] , n [ "Record.Unsafe" ] , n [ "Type.Data.Row" ] , n [ "Type.Data.RowList" ] ;
      e.Semiring = function ( n , e , a , t ) {
        this.add = n , this.mul = e , this.one = a , this.zero = t ;
      } ;
      e.add = function ( n ) {
        return n.add ;
      } ;
      e.zero = function ( n ) {
        return n.zero ;
      } ;
      e.mul = function ( n ) {
        return n.mul ;
      } ;
      e.one = function ( n ) {
        return n.one ;
      } ;
    }( n [ "Data.Semiring" ] = n [ "Data.Semiring" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      n [ "Data.Ord" ] ;
      var a = n [ "Data.Eq" ] ,
          t = n [ "Data.Ord.Unsafe" ] ,
          u = n [ "Data.Ordering" ] ,
          r = ( n [ "Data.Ring" ] , n [ "Data.Semiring" ] , n [ "Data.Symbol" ] , n [ "Data.Unit" ] , n [ "Data.Void" ] , n [ "Record.Unsafe" ] , n [ "Type.Data.RowList" ] , function ( n , e ) {
            this.Eq0 = n , this.compare = e ;
          } ) ,
          o = new r( function () {
            return a.eqInt ;
          } , t.unsafeCompare ) ,
          i = function ( n ) {
            return n.compare ;
          } ;

      e.Ord = r ;
      e.compare = i ;
      e.min = function ( n ) {
        return function ( e ) {
          return function ( a ) {
            var t = i( n )( e )( a ) ;
            if ( t instanceof u.LT )
              return e ;
            if ( t instanceof u.EQ )
              return e ;
            if ( t instanceof u.GT )
              return a ;
            throw new Error( "Failed pattern match at Data.Ord (line 119, column 3 - line 122, column 12): " + [ t.constructor.name ] ) ;
          } ;
        } ;
      } ;
      e.ordInt = o ;
    }( n [ "Data.Ord" ] = n [ "Data.Ord" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      n [ "Control.Category" ] , n [ "Data.Boolean" ] , n [ "Data.Ord" ] , n [ "Data.Ring" ] ;
      e.flip = function ( n ) {
        return function ( e ) {
          return function ( a ) {
            return n( a )( e ) ;
          } ;
        } ;
      } ;
      e.const = function ( n ) {
        return function ( e ) {
          return n ;
        } ;
      } ;
    }( n [ "Data.Function" ] = n [ "Data.Function" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      /* Data.Functor.arrayMap: Maps a function over an array */
      ( n [ "Data.Functor" ] = n [ "Data.Functor" ] || {} ).arrayMap = function ( n ) {
        return function ( e ) {
          for ( var a = e.length , t = new Array( a ) , u = 0 ; u < a ; u++ )
            t [ u ] = n( e [ u ] ) ;
          return t ;
        } ;
      } ;
    }() ,

    function ( e ) {
      "use strict" ;

      var a = n [ "Data.Functor" ] ,
          t = ( n [ "Control.Semigroupoid" ] , n [ "Data.Function" ] ) ,
          u = n [ "Data.Unit" ] ,
          r = function ( n ) {
            this.map = n ;
          } ,
          o = function ( n ) {
            return n.map ;
          } ,
          i = new r( a.arrayMap ) ;

      e.Functor = r ;
      e.map = o ;
      e.void = function ( n ) {
        return o( n )( t.const( u.unit ) ) ;
      } ;
      e.functorArray = i ;
    }( n [ "Data.Functor" ] = n [ "Data.Functor" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      var a = n [ "Control.Apply" ] ,
          t = ( n [ "Control.Category" ] , n [ "Data.Function" ] , n [ "Data.Functor" ] ) ,
          u = function ( n , e ) {
            this.Functor0 = n , this.apply = e ;
          } ,
          r = new u( function () {
            return t.functorArray ;
          } , a.arrayApply ) ;

      e.Apply = u ;
      e.apply = function ( n ) {
        return n.apply ;
      } ;
      e.applyArray = r ;
    }( n [ "Control.Apply" ] = n [ "Control.Apply" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      n [ "Control.Apply" ] , n [ "Data.Functor" ] , n [ "Data.Unit" ] ;
      e.Applicative = function ( n , e ) {
        this.Apply0 = n , this.pure = e ;
      } ;
      e.pure = function ( n ) {
        return n.pure ;
      } ;
    }( n [ "Control.Applicative" ] = n [ "Control.Applicative" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      /* Control.Bind.arrayBind: Binds a monadic function over an array */
      ( n [ "Control.Bind" ] = n [ "Control.Bind" ] || {} ).arrayBind = function ( n ) {
        return function ( e ) {
          for ( var a = [] , t = 0 , u = n.length ; t < u ; t++ )
            Array.prototype.push.apply( a , e( n [ t ] ) ) ;
          return a ;
        } ;
      } ;
    }() ,

    function ( e ) {
      "use strict" ;

      var a = n [ "Control.Bind" ] ,
          t = ( n [ "Control.Applicative" ] , n [ "Control.Apply" ] ) ,
          u = ( n [ "Control.Category" ] , n [ "Data.Function" ] ) ,
          r = ( n [ "Data.Functor" ] , n [ "Data.Unit" ] , function ( n , e ) {
            this.Apply0 = n , this.bind = e ;
          } ) ,
          o = function ( n ) {
            this.discard = n ;
          } ,
          i = new r( function () {
            return t.applyArray ;
          } , a.arrayBind ) ,
          l = function ( n ) {
            return n.bind ;
          } ,
          c = new o( function ( n ) {
            return l( n ) ;
          } ) ;

      e.Bind = r ;
      e.bind = l ;
      e.bindFlipped = function ( n ) {
        return u.flip( l( n ) ) ;
      } ;
      e.Discard = o ;
      e.discard = function ( n ) {
        return n.discard ;
      } ;
      e.bindArray = i ;
      e.discardUnit = c ;
    }( n [ "Control.Bind" ] = n [ "Control.Bind" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      var a = n [ "Control.Applicative" ] ,
          t = ( n [ "Control.Apply" ] , n [ "Control.Bind" ] ) ;
      n [ "Data.Functor" ] , n [ "Data.Unit" ] ;
      e.Monad = function ( n , e ) {
        this.Applicative0 = n , this.Bind1 = e ;
      } ;
      e.ap = function ( n ) {
        return function ( e ) {
          return function ( u ) {
            return t.bind( n.Bind1() )( e )( function ( e ) {
              return t.bind( n.Bind1() )( u )( function ( t ) {
                return a.pure( n.Applicative0() )( e( t ) ) ;
              } ) ;
            } ) ;
          } ;
        } ;
      } ;
    }( n [ "Control.Monad" ] = n [ "Control.Monad" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      n [ "Data.Boolean" ] , n [ "Data.Eq" ] , n [ "Data.EuclideanRing" ] , n [ "Data.Ord" ] , n [ "Data.Ordering" ] , n [ "Data.Semigroup" ] , n [ "Data.Symbol" ] , n [ "Data.Unit" ] , n [ "Record.Unsafe" ] , n [ "Type.Data.RowList" ] ;
      e.mempty = function ( n ) {
        return n.mempty ;
      } ;
    }( n [ "Data.Monoid" ] = n [ "Data.Monoid" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      n [ "Control.Alt" ] , n [ "Control.Alternative" ] ;
      var a = n [ "Control.Applicative" ] ,
          t = n [ "Control.Apply" ] ,
          u = n [ "Control.Bind" ] ,
          r = ( n [ "Control.Category" ] , n [ "Control.Extend" ] , n [ "Control.Monad" ] , n [ "Control.MonadZero" ] , n [ "Control.Plus" ] , n [ "Data.Bounded" ] , n [ "Data.Eq" ] , n [ "Data.Function" ] ) ,
          o = n [ "Data.Functor" ] ,
          i = ( n [ "Data.Functor.Invariant" ] , n [ "Data.Monoid" ] , n [ "Data.Ord" ] , n [ "Data.Ordering" ] , n [ "Data.Semigroup" ] , n [ "Data.Show" ] , n [ "Data.Unit" ] , n.Prelude , function () {
            function n() {}
            return n.value = new n , n ;
          }() ) ,
          l = function () {
            function n( n ) {
              this.value0 = n ;
            }
            return n.create = function ( e ) {
              return new n( e ) ;
            } , n ;
          }() ,
          c = function ( n ) {
            return function ( e ) {
              return function ( a ) {
                if ( a instanceof i )
                  return n ;
                if ( a instanceof l )
                  return e( a.value0 ) ;
                throw new Error( "Failed pattern match at Data.Maybe (line 217, column 1 - line 217, column 51): " + [ n.constructor.name , e.constructor.name , a.constructor.name ] ) ;
              } ;
            } ;
          } ,
          v = c( !1 )( r.const( !0 ) ) ,
          f = new o.Functor( function ( n ) {
            return function ( e ) {
              return e instanceof l ? new l( n( e.value0 ) ) : i.value ;
            } ;
          } ) ,
          s = new t.Apply( function () {
            return f ;
          } , function ( n ) {
            return function ( e ) {
              if ( n instanceof l )
                return o.map( f )( n.value0 )( e ) ;
              if ( n instanceof i )
                return i.value ;
              throw new Error( "Failed pattern match at Data.Maybe (line 67, column 1 - line 67, column 35): " + [ n.constructor.name , e.constructor.name ] ) ;
            } ;
          } ) ,
          d = new u.Bind( function () {
            return s ;
          } , function ( n ) {
            return function ( e ) {
              if ( n instanceof l )
                return e( n.value0 ) ;
              if ( n instanceof i )
                return i.value ;
              throw new Error( "Failed pattern match at Data.Maybe (line 125, column 1 - line 125, column 33): " + [ n.constructor.name , e.constructor.name ] ) ;
            } ;
          } ) ,
          p = new a.Applicative( function () {
            return s ;
          } , l.create ) ;

      e.Nothing = i , e.Just = l , e.maybe = c , e.isJust = v , e.fromJust = function ( n ) {
        return function ( n ) {
          if ( n instanceof l )
            return n.value0 ;
          throw new Error( "Failed pattern match at Data.Maybe (line 268, column 1 - line 268, column 46): " + [ n.constructor.name ] ) ;
        } ;
      } , e.functorMaybe = f , e.applyMaybe = s , e.applicativeMaybe = p , e.bindMaybe = d ;
    }( n [ "Data.Maybe" ] = n [ "Data.Maybe" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      n [ "Data.Foldable" ] , n [ "Control.Alt" ] , n [ "Control.Applicative" ] , n [ "Control.Apply" ] , n [ "Control.Bind" ] , n [ "Control.Category" ] , n [ "Control.Plus" ] , n [ "Control.Semigroupoid" ] , n [ "Data.Eq" ] , n [ "Data.Function" ] , n [ "Data.Functor" ] , n [ "Data.HeytingAlgebra" ] , n [ "Data.Maybe" ] , n [ "Data.Maybe.First" ] , n [ "Data.Maybe.Last" ] , n [ "Data.Monoid" ] , n [ "Data.Monoid.Additive" ] , n [ "Data.Monoid.Conj" ] , n [ "Data.Monoid.Disj" ] , n [ "Data.Monoid.Dual" ] , n [ "Data.Monoid.Endo" ] , n [ "Data.Monoid.Multiplicative" ] , n [ "Data.Newtype" ] , n [ "Data.Ord" ] , n [ "Data.Ordering" ] , n [ "Data.Semigroup" ] , n [ "Data.Semiring" ] , n [ "Data.Unit" ] , n.Prelude ;
      e.Foldable = function ( n , e , a ) {
        this.foldMap = n , this.foldl = e , this.foldr = a ;
      } ;
      e.foldr = function ( n ) {
        return n.foldr ;
      } ;
      e.foldl = function ( n ) {
        return n.foldl ;
      } ;
      e.foldMap = function ( n ) {
        return n.foldMap ;
      } ;
    }( n [ "Data.Foldable" ] = n [ "Data.Foldable" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      n [ "Control.Alt" ] ;
      var a = n [ "Control.Applicative" ] ,
          t = n [ "Control.Apply" ] ,
          u = n [ "Control.Bind" ] ,
          r = ( n [ "Control.Extend" ] , n [ "Control.Monad" ] , n [ "Control.Semigroupoid" ] , n [ "Data.Bifoldable" ] , n [ "Data.Bifunctor" ] , n [ "Data.Bitraversable" ] , n [ "Data.Bounded" ] , n [ "Data.Eq" ] , n [ "Data.Foldable" ] , n [ "Data.FoldableWithIndex" ] , n [ "Data.Function" ] , n [ "Data.Functor" ] ) ,
          o = ( n [ "Data.Functor.Invariant" ] , n [ "Data.FunctorWithIndex" ] , n [ "Data.Maybe" ] , n [ "Data.Monoid" ] , n [ "Data.Ord" ] , n [ "Data.Ordering" ] , n [ "Data.Semigroup" ] , n [ "Data.Show" ] , n [ "Data.Traversable" ] , n [ "Data.TraversableWithIndex" ] , n [ "Data.Unit" ] , n.Prelude , function () {
            function n( n ) {
              this.value0 = n ;
            }
            return n.create = function ( e ) {
              return new n( e ) ;
            } , n ;
          }() ) ,
          i = function () {
            function n( n ) {
              this.value0 = n ;
            }
            return n.create = function ( e ) {
              return new n( e ) ;
            } , n ;
          }() ,
          l = new r.Functor( function ( n ) {
            return function ( e ) {
              if ( e instanceof o )
                return new o( e.value0 ) ;
              if ( e instanceof i )
                return new i( n( e.value0 ) ) ;
              throw new Error( "Failed pattern match at Data.Either (line 38, column 8 - line 38, column 52): " + [ e.constructor.name ] ) ;
            } ;
          } ) ,
          c = function ( n ) {
            return function ( e ) {
              return function ( a ) {
                if ( a instanceof o )
                  return n( a.value0 ) ;
                if ( a instanceof i )
                  return e( a.value0 ) ;
                throw new Error( "Failed pattern match at Data.Either (line 238, column 1 - line 238, column 64): " + [ n.constructor.name , e.constructor.name , a.constructor.name ] ) ;
              } ;
            } ;
          } ,
          v = new t.Apply( function () {
            return l ;
          } , function ( n ) {
            return function ( e ) {
              if ( n instanceof o )
                return new o( n.value0 ) ;
              if ( n instanceof i )
                return r.map( l )( n.value0 )( e ) ;
              throw new Error( "Failed pattern match at Data.Either (line 82, column 1 - line 82, column 41): " + [ n.constructor.name , e.constructor.name ] ) ;
            } ;
          } ) ,
          f = new u.Bind( function () {
            return v ;
          } , c( function ( n ) {
            return function ( e ) {
              return new o( n ) ;
            } ;
          } )( function ( n ) {
            return function ( e ) {
              return e( n ) ;
            } ;
          } ) ) ,
          s = new a.Applicative( function () {
            return v ;
          } , i.create ) ;

      e.Left = o , e.Right = i , e.either = c , e.functorEither = l , e.applyEither = v , e.applicativeEither = s , e.bindEither = f ;
    }( n [ "Data.Either" ] = n [ "Data.Either" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      /* Partial.Unsafe.unsafePartial: Allows unsafe partial functions */
      ( n [ "Partial.Unsafe" ] = n [ "Partial.Unsafe" ] || {} ).unsafePartial = function ( n ) {
        return n() ;
      } ;
    }() ,

    function ( e ) {
      "use strict" ;

      /* Partial.crashWith: Throws an error */
      ( n [ "Partial" ] = n [ "Partial" ] || {} ).crashWith = function () {
        return function ( n ) {
          throw new Error( n ) ;
        } ;
      } ;
    }() ,

    function ( e ) {
      "use strict" ;

      var a = n.Partial ;
      e.crashWith = a.crashWith ;
    }( n.Partial = n.Partial || {} ) ,

    function ( e ) {
      "use strict" ;

      var a = n [ "Partial.Unsafe" ] ,
          t = n.Partial ;
      e.unsafeCrashWith = function ( n ) {
        return a.unsafePartial( function ( e ) {
          return t.crashWith( e )( n ) ;
        } ) ;
      } ;
    }( n [ "Partial.Unsafe" ] = n [ "Partial.Unsafe" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      n [ "Control.Applicative" ] , n [ "Control.Bind" ] , n [ "Control.Monad" ] , n [ "Control.Semigroupoid" ] , n [ "Data.Bifunctor" ] , n [ "Data.Either" ] , n [ "Data.Functor" ] , n [ "Data.Identity" ] , n [ "Data.Maybe" ] , n [ "Data.Unit" ] , n.Effect , n [ "Effect.Ref" ] , n [ "Partial.Unsafe" ] , n.Prelude ;
      /* Control.Monad.Rec.Class: Monadic recursion */
      var a = function () {
            function n( n ) {
              this.value0 = n ;
            }
            return n.create = function ( e ) {
              return new n( e ) ;
            } , n ;
          }() ,
          t = function () {
            function n( n ) {
              this.value0 = n ;
            }
            return n.create = function ( e ) {
              return new n( e ) ;
            } , n ;
          }() ;

      e.Loop = a , e.Done = t , e.MonadRec = function ( n , e ) {
        this.Monad0 = n , this.tailRecM = e ;
      } ;
      e.tailRecM = function ( n ) {
        return n.tailRecM ;
      } ;
    }( n [ "Control.Monad.Rec.Class" ] = n [ "Control.Monad.Rec.Class" ] || {} ) ,

    function ( n ) {
      "use strict" ;

      /* Control.Monad.ST.Internal: ST Monad implementation */
      n.map_ = function ( n ) {
        return function ( e ) {
          return function () {
            return n( e() ) ;
          } ;
        } ;
      } , n.pure_ = function ( n ) {
        return function () {
          return n ;
        } ;
      } , n.bind_ = function ( n ) {
        return function ( e ) {
          return function () {
            return e( n() )() ;
          } ;
        } ;
      } , n.while = function ( n ) {
        return function ( e ) {
          return function () {
            for ( ; n() ; )
              e() ;
          } ;
        } ;
      } , n.new = function ( n ) {
        return function () {
          return {
            value : n
          } ;
        } ;
      } , n.read = function ( n ) {
        return function () {
          return n.value ;
        } ;
      } , n.write = function ( n ) {
        return function ( e ) {
          return function () {
            return e.value = n ;
          } ;
        } ;
      } ;
    }( n [ "Control.Monad.ST.Internal" ] = n [ "Control.Monad.ST.Internal" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      var a = n [ "Control.Monad.ST.Internal" ] ,
          t = n [ "Control.Applicative" ] ,
          u = n [ "Control.Apply" ] ,
          r = n [ "Control.Bind" ] ,
          o = n [ "Control.Monad" ] ,
          i = n [ "Control.Monad.Rec.Class" ] ,
          l = n [ "Data.Functor" ] ,
          c = n [ "Data.Unit" ] ,
          v = ( n [ "Partial.Unsafe" ] , n.Prelude , new l.Functor( a.map_ ) ) ,
          f = new o.Monad( function () {
            return p ;
          } , function () {
            return s ;
          } ) ,
          s = new r.Bind( function () {
            return d ;
          } , a.bind_ ) ,
          d = new u.Apply( function () {
            return v ;
          } , o.ap( f ) ) ,
          p = new t.Applicative( function () {
            return d ;
          } , a.pure_ ) ,
          D = new i.MonadRec( function () {
            return f ;
          } , function ( n ) {
            return function ( e ) {
              var u = function ( n ) {
                    return n instanceof i.Loop ;
                  } ,
                  o = function ( n ) {
                    if ( n instanceof i.Done )
                      return n.value0 ;
                    throw new Error( "Failed pattern match at Control.Monad.ST.Internal (line 54, column 32 - line 54, column 46): " + [ n.constructor.name ] ) ;
                  } ;
              return r.bind( s )( r.bindFlipped( s )( a.new )( n( e ) ) )( function ( e ) {
                return r.discard( r.discardUnit )( s )( a.while( l.map( v )( u )( a.read( e ) ) )( r.bind( s )( a.read( e ) )( function ( u ) {
                  if ( u instanceof i.Loop )
                    return r.bind( s )( n( u.value0 ) )( function ( n ) {
                      return l.void( v )( a.write( n )( e ) ) ;
                    } ) ;
                  if ( u instanceof i.Done )
                    return t.pure( p )( c.unit ) ;
                  throw new Error( "Failed pattern match at Control.Monad.ST.Internal (line 46, column 18 - line 50, column 28): " + [ u.constructor.name ] ) ;
                } ) ) )( function () {
                  return l.map( v )( o )( a.read( e ) ) ;
                } ) ;
              } ) ;
            } ;
          } ) ;

      e.functorST = v , e.applyST = d , e.applicativeST = p , e.bindST = s , e.monadST = f , e.monadRecST = D , e.read = a.read , e.write = a.write ;
    }( n [ "Control.Monad.ST.Internal" ] = n [ "Control.Monad.ST.Internal" ] || {} ) ,

    function ( n ) {
      "use strict" ;

      /* Data.Array: Basic array operations */
      n.length = function ( n ) {
        return n.length ;
      } , n.indexImpl = function ( n ) {
        return function ( e ) {
          return function ( a ) {
            return function ( t ) {
              return t < 0 || t >= a.length ? e : n( a [ t ] ) ;
            } ;
            ;
          } ;
        } ;
      } , n.sortImpl = function ( n ) {
        return function ( e ) {
          return e.slice().sort( function ( e , a ) {
            return n( e )( a ) ;
          } ) ;
        } ;
      } , n.slice = function ( n ) {
        return function ( e ) {
          return function ( a ) {
            return a.slice( n , e ) ;
          } ;
        } ;
      } ;
    }( n [ "Data.Array" ] = n [ "Data.Array" ] || {} ) ,

    function ( n ) {
      "use strict" ;

      /* Data.Array.ST: Mutable array operations */
      n.empty = function () {
        return [] ;
      } , n.pushAll = function ( n ) {
        return function ( e ) {
          return function () {
            return e.push.apply( e , n ) ;
          } ;
        } ;
      } ;
    }( n [ "Data.Array.ST" ] = n [ "Data.Array.ST" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      /* Unsafe.Coerce.unsafeCoerce: Raw type coercion */
      ( n [ "Unsafe.Coerce" ] = n [ "Unsafe.Coerce" ] || {} ).unsafeCoerce = function ( n ) {
        return n ;
      } ;
    }() ,

    function ( e ) {
      "use strict" ;

      var a = n [ "Unsafe.Coerce" ] ;
      e.unsafeCoerce = a.unsafeCoerce ;
    }( n [ "Unsafe.Coerce" ] = n [ "Unsafe.Coerce" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      var a = n [ "Data.Array.ST" ] ,
          t = n [ "Control.Applicative" ] ,
          u = ( n [ "Control.Bind" ] , n [ "Control.Monad.ST" ] , n [ "Control.Monad.ST.Internal" ] ) ;
      n [ "Control.Semigroupoid" ] , n [ "Data.Maybe" ] , n [ "Data.Ord" ] , n [ "Data.Ordering" ] , n [ "Data.Ring" ] , n.Prelude , n [ "Unsafe.Coerce" ] ;
      e.push = function ( n ) {
        return a.pushAll( [ n ] ) ;
      } ;
      e.unsafeFreeze = function ( n ) {
        return t.pure( u.applicativeST )( n ) ;
      } ;
      e.empty = a.empty ;
    }( n [ "Data.Array.ST" ] = n [ "Data.Array.ST" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      n [ "Control.Applicative" ] , n [ "Control.Apply" ] , n [ "Control.Biapplicative" ] , n [ "Control.Biapply" ] , n [ "Control.Bind" ] , n [ "Control.Comonad" ] , n [ "Control.Extend" ] , n [ "Control.Lazy" ] , n [ "Control.Monad" ] , n [ "Control.Semigroupoid" ] , n [ "Data.Bifoldable" ] , n [ "Data.Bifunctor" ] , n [ "Data.Bitraversable" ] , n [ "Data.BooleanAlgebra" ] , n [ "Data.Bounded" ] , n [ "Data.CommutativeRing" ] , n [ "Data.Distributive" ] , n [ "Data.Eq" ] , n [ "Data.Foldable" ] , n [ "Data.FoldableWithIndex" ] , n [ "Data.Function" ] , n [ "Data.Functor" ] , n [ "Data.Functor.Invariant" ] , n [ "Data.FunctorWithIndex" ] , n [ "Data.HeytingAlgebra" ] , n [ "Data.Maybe" ] , n [ "Data.Maybe.First" ] , n [ "Data.Monoid" ] , n [ "Data.Newtype" ] , n [ "Data.Ord" ] , n [ "Data.Ordering" ] , n [ "Data.Ring" ] , n [ "Data.Semigroup" ] , n [ "Data.Semigroup.Foldable" ] , n [ "Data.Semigroup.Traversable" ] , n [ "Data.Semiring" ] , n [ "Data.Show" ] , n [ "Data.Traversable" ] , n [ "Data.TraversableWithIndex" ] , n [ "Data.Unit" ] , n.Prelude , n [ "Type.Equality" ] ;
      /* Data.Tuple: Represents a pair of values */
      var a = function () {
        function n( n , e ) {
          this.value0 = n , this.value1 = e ;
        }
        return n.create = function ( e ) {
          return function ( a ) {
            return new n( e , a ) ;
          } ;
        } , n ;
      }() ;

      e.Tuple = a , e.snd = function ( n ) {
        return n.value1 ;
      } ;
    }( n [ "Data.Tuple" ] = n [ "Data.Tuple" ] || {} ) ,

    function ( e ) {
      "use strict" ;

      var a = n [ "Data.Array" ] ,
          t = ( n [ "Control.Alt" ] , n [ "Control.Alternative" ] , n [ "Control.Applicative" ] , n [ "Control.Apply" ] , n [ "Control.Bind" ] ) ,
          u = ( n [ "Control.Category" ] , n [ "Control.Lazy" ] , n [ "Control.Monad.Rec.Class" ] , n [ "Control.Monad.ST" ] , n [ "Control.Monad.ST.Internal" ] , n [ "Control.Semigroupoid" ] , n [ "Data.Array.NonEmpty.Internal" ] , n [ "Data.Array.ST" ] , n [ "Data.Array.ST.Iterator" ] , n [ "Data.Boolean" ] , n [ "Data.Eq" ] , n [ "Data.Foldable" ] , n [ "Data.Function" ] ) ,
          r = ( n [ "Data.Functor" ] , n [ "Data.HeytingAlgebra" ] , n [ "Data.Maybe" ] ) ,
          o = ( n [ "Data.Ord" ] , n [ "Data.Ordering" ] ) ,
          i = ( n [ "Data.Ring" ] , n [ "Data.Semigroup" ] , n [ "Data.Semiring" ] , n [ "Data.Traversable" ] , n [ "Data.Tuple" ] , n [ "Data.Unfoldable" ] , n [ "Partial.Unsafe" ] , n.Prelude , n [ "Unsafe.Coerce" ] , function ( n ) {
            return [ n ] ;
          } ) ,
          l = a.indexImpl( r.Just.create )( r.Nothing.value ) ,
          c = u.flip( t.bind( t.bindArray ) ) ;

      e.singleton = i , e.index = l , e.concatMap = c , e.mapMaybe = function ( n ) {
        return c( function ( e ) {
          return r.maybe( [] )( i )( n( e ) ) ;
        } ) ;
      } , e.sortBy = function ( n ) {
        return function ( e ) {
          return a.sortImpl( function ( e ) {
            return function ( a ) {
              var t = n( e )( a ) ;
              if ( t instanceof o.GT )
                return 1 ;
              if ( t instanceof o.EQ )
                return 0 ;
              if ( t instanceof o.LT )
                return -1 ;
              throw new Error( "Failed pattern match at Data.Array (line 702, column 15 - line 707, column 1): " + [ t.constructor.name ] ) ;
            } ;
          } )( e ) ;
        } ;
      } ;
    }( n [ "Data.Array" ] = n [ "Data.Array" ] || {} ) ,

    function ( n ) {
      var e = require( "big-integer" ) ;
      n [ "fromBase'" ] = function ( n ) {
        return function ( a ) {
          return function ( t ) {
            return function ( u ) {
              try {
                var r = e( u , t ) ;
                return n( r ) ;
              } catch ( o ) {
                return a ;
              }
            } ;
          } ;
        } ;
      } , n.fromInt = function ( n ) {
        return e( n ) ;
      } , n.toBase = function ( n ) {
        return function ( e ) {
          return e.toString( n ) ;
        } ;
      } , n.biAdd = function ( n ) {
        return function ( e ) {
          return n.add( e ) ;
        } ;
      } , n.biMul = function ( n ) {
        return function ( e ) {
          return n.multiply( e ) ;
        } ;
      } , n.biEquals = function ( n ) {
        return function ( e ) {
          return n.equals( e ) ;
        } ;
      } , n.biCompare = function ( n ) {
        return function ( e ) {
          return n.compare( e ) ;
        } ;
      } ;
    }( n [ "Data.BigInt" ] = n [ "Data.BigInt" ] || {} ) ,

    function