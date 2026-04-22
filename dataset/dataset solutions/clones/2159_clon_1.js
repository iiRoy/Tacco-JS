/*!
 * path: atcoder/abc155/d
 * URL: https://github.com/koukimetal/procomvis/tree/master/src/contest/atcoder/abc155/d
 */
// This immediately invoked function expression (IIFE) encapsulates the entire application,
// acting as a basic module loader, similar to Webpack's runtime.
!function ( e ) {

  // r: Module cache object
  var r = {};

  // t: The 'require' function for loading modules.
  function t ( n ) {

    // If module is already in cache, return its exports.
    if ( r[n] )
      return r[n].exports;

    // Create a new module entry in the cache.
    // i: module id, l: loaded flag, exports: module's exports object.
    var o = r[n] = {
      i: n,
      l: !1,
      exports: {}
    };

    // Execute the module function, passing module.exports, module, and the 'require' function itself.
    e[n].call( o.exports, o, o.exports, t ),

    // Mark module as loaded.
    o.l = !0;

    // Return the module's exports.
    return o.exports
  }

  // t.m: Stores all module definitions (the 'e' array passed to the IIFE).
  t.m = e,

  // t.c: Stores the module cache (the 'r' object).
  t.c = r,

  // t.d: Defines a getter property on an object.
  // This is used for creating export getters for ES module interop.
  t.d = function ( e, r, n ) {
    t.o( e, r ) || Object.defineProperty( e, r, { enumerable: !0, get: n } )
  },

  // t.r: Marks an exports object as an ES module.
  t.r = function ( e ) {
    // Set Symbol.toStringTag for better debugging of module objects.
    "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty( e, Symbol.toStringTag, { value: "Module" } ),

    // Mark the module as an ES module.
    Object.defineProperty( e, "__esModule", { value: !0 } )
  },

  // t.t: Creates a namespace object for module exports.
  // This handles various import syntaxes (e.g., import * as X from Y).
  t.t = function ( e, r ) {
    // If r & 1, it's a direct import, so resolve the module.
    if ( 1 & r && ( e = t( e ) ), 8 & r )
      return e;

    // If r & 4 and it's an object and an ES module, return it directly.
    if ( 4 & r && "object" == typeof e && e && e.__esModule )
      return e;

    // Create a new namespace object.
    var n = Object.create( null );

    // Mark it as an ES module.
    if ( t.r( n ),

    // Set the default export.
    Object.defineProperty( n, "default", { enumerable: !0, value: e } ),

    // If r & 2 and it's not a string, copy all properties from the original module to the namespace object.
    2 & r && "string" != typeof e )
      for ( var o in e )
        t.d( n, o, function ( r ) { return e[r] }.bind( null, o ) );

    return n
  },

  // t.n: Creates a getter function for non-ES modules to access their default export.
  // This helps interop between CommonJS and ES modules.
  t.n = function ( e ) {
    var r = e && e.__esModule ?
      function () { return e.default } : // If it's an ES module, return its default export.
      function () { return e };          // Otherwise, return the module itself.

    // Define 'a' property as a getter for the module.
    return t.d( r, "a", r ), r
  },

  // t.o: Checks if a property exists on an object (like Object.prototype.hasOwnProperty.call).
  t.o = function ( e, r ) {
    return Object.prototype.hasOwnProperty.call( e, r )
  },

  // t.p: Public path for assets (empty string in this case).
  t.p = "",

  // Load the entry module (module 0).
  t( t.s = 0 )

}(
  // Array of module definitions. Each function is a module.
  [
    // Module 0: Main application logic
    function ( e, r, t ) {
      "use strict"; // Enable strict mode for this module.

      // __importDefault: Helper function for handling default exports from ES modules or CommonJS.
      var n = this && this.__importDefault || function ( e ) {
        return e && e.__esModule ? e : { default: e }
      };

      // Mark this module as an ES module.
      r.__esModule = !0;

      // o: Import the 'fs' module (file system).
      var o = n( t( 1 ) ),

      // i: Import the Solver class from module 2.
      i = t( 2 );

      // Read input from /dev/stdin (common for competitive programming).
      o.default.readFile( "/dev/stdin", "utf8", ( function ( e, r ) {
        // IIFE to process the input.
        !function ( e ) {
          // Create a new Solver instance.
          var r = new i.Solver,
          // Parse the input string.
          t = r.parse( e ),
          // Solve the problem with the parsed input.
          n = r.solve( t );
          // Print the answer.
          r.print( n )
        }( r ) // Pass the read file content (r) to the processing function.
      } ) )
    },

    // Module 1: Node.js 'fs' (file system) module
    function ( e, r ) {
      // Export the 'fs' module.
      e.exports = require( "fs" )
    },

    // Module 2: Solver class definition
    function ( e, r, t ) {
      "use strict"; // Enable strict mode.

      // __extends: Helper for implementing class inheritance in TypeScript/JavaScript.
      // This boilerplate ensures proper prototype chain setup.
      var n, o = this && this.__extends || ( n = function ( e, r ) {
        // Standard way to set prototype chain.
        return ( n = Object.setPrototypeOf ||
          ( { __proto__: [] } instanceof Array && function ( e, r ) { e.__proto__ = r } ) ||
          function ( e, r ) { for ( var t in r ) r.hasOwnProperty( t ) && ( e[t] = r[t] ) } )( e, r )
      }, function ( e, r ) {
        function t () { this.constructor = e }
        n( e, r ),
        e.prototype = null === r ? Object.create( r ) : ( t.prototype = r.prototype, new t )
      } );

      // Mark this module as an ES module.
      r.__esModule = !0;

      // __importDefault: Helper function for handling default imports.
      var i = this && this.__importDefault || function ( e ) {
        return e && e.__esModule ? e : { default: e }
      };

      // s: Import SolverBase from module 3.
      var s = t( 3 ),
      // u: Import getSpaceIterator from module 4.
      u = t( 4 ),
      // f: Import the Big.js library (default export) from module 5.
      f = i( t( 5 ) ),

      // c: The main Solver class, extending SolverBase.
      c = function ( e ) {
        // Constructor for the Solver class.
        // Calls the parent class constructor.
        function r () {
          return null !== e && e.apply( this, arguments ) || this
        }

        // Apply inheritance boilerplate.
        return o( r, e ),

        // Solver.prototype.solve method: Contains the core logic to solve the problem.
        r.prototype.solve = function ( e ) {
          // Destructure input parameters.
          var r = e.N,
          t = e.K,
          n = e.A;

          // Sort the input array A in ascending order.
          n.sort( ( function ( e, r ) { return e - r } ) );

          // Create an array of Big.js objects from the sorted numbers.
          for ( var o = new Array( r ), i = 0; i < r; i++ )
            o[i] = new f.default( n[i] );

          // Count positive, negative, and zero numbers.
          var s = 0, // Count of negative numbers
          u = 0,     // Count of positive numbers
          c = 0;     // Count of zero numbers

          for ( i = 0; i < r; i++ )
            n[i] < 0 ? s++ :
              n[i] > 0 ? u++ :
                c++;

          // Calculate counts for different product types.
          // l: Count of negative products (negative * positive).
          var l = s * u,
          // a: Count of zero products (zero * anything else, or zero * zero).
          a = c * ( u + s ) + c * ( c - 1 ) / 2,

          // Initialize Big.js constants for binary search.
          h = new f.default( 1 ),   // Big(1)
          p = new f.default( 0 ),   // Big(0)
          // v: Lower bound for binary search (a very small negative number).
          v = new f.default( "-1000000000000000005" ),
          // d: Upper bound for binary search (a very large positive number).
          d = new f.default( "1000000000000000005" );

          // Binary search for the K-th smallest product.
          // The loop continues as long as the difference between upper and lower bound is greater than 1.
          while ( d.minus( v ).gt( h ) ) {
            // Calculate the midpoint (potential K-th product).
            var g = d.plus( v ).div( 2 ).round(),
            w = 0; // Counter for products less than or equal to 'g'.

            // If 'g' is negative:
            if ( g.lt( p ) ) {
              // Iterate through negative numbers (n[i] < 0).
              for ( i = 0; i < r && !( n[i] >= 0 ); i++ ) {
                // Binary search for 'm' such that o[i] * o[m] < g.
                // b: lower bound, y: upper bound for inner binary search.
                for ( var b = s + c - 1, y = r; y - b > 1; ) {
                  var m = ( b + y ) / 2 | 0; // Midpoint index.
                  // If product is less than g, try larger 'm'.
                  o[i].mul( o[m] ).lt( g ) ? y = m : b = m
                }
                // Add count of numbers whose product with n[i] is less than g.
                w += r - y
              }
            }
            // If 'g' is positive:
            else if ( g.gt( p ) ) {
              // All negative * positive products and zero products are less than positive 'g'.
              w += l + a;

              // Iterate through negative numbers (n[i] < 0).
              for ( i = 0; i < r; i++ )
                if ( n[i] < 0 ) {
                  // Binary search for 'm' such that o[i] * o[m] < g.
                  for ( b = i, y = s; y - b > 1; ) {
                    m = ( b + y ) / 2 | 0;
                    o[i].mul( o[m] ).lt( g ) ? y = m : b = m
                  }
                  w += s - y
                }
                // Iterate through positive numbers (n[i] > 0).
                else if ( n[i] > 0 ) {
                  // Binary search for 'm' such that o[i] * o[m] < g.
                  for ( b = i, y = r; y - b > 1; ) {
                    m = ( b + y ) / 2 | 0;
                    o[i].mul( o[m] ).lt( g ) ? b = m : y = m
                  }
                  w += b - i
                }
            }
            // If 'g' is zero:
            else
              // Only negative * positive products are less than zero.
              w = l;

            // Adjust binary search bounds.
            w < t ? v = g : d = g
          }

          // The K-th smallest product is 'v'.
          return { answer: v }
        },

        // Solver.prototype.parse method: Parses the input string into problem-specific data.
        r.prototype.parse = function ( e ) {
          // Create an iterator that splits the input by space and parses each part as an integer.
          for (
            var r = u.getSpaceIterator( e, ( function ( e ) { return parseInt( e ) } ) ),
            // First value: N (number of elements).
            t = r.next().value,
            // Second value: K (the K-th smallest product to find).
            n = r.next().value,
            // o: Array to store input numbers A.
            o = [],
            i = 0;
            i < t;
            i++
          )
            // Push remaining values into array A.
            o.push( r.next().value );

          // Return parsed data as an object.
          return { N: t, K: n, A: o }
        },

        // Solver.prototype.print method: Prints the final answer to the console.
        r.prototype.print = function ( e ) {
          console.log( e.answer.toString() )
        }
      }( s.SolverBase ); // Solver extends SolverBase.

      // Export the Solver class.
      r.Solver = c
    },

    // Module 3: SolverBase class
    function ( e, r, t ) {
      "use strict"; // Enable strict mode.

      // n: An empty constructor function, serving as the base class for solvers.
      var n = function () {};

      // Export SolverBase.
      r.SolverBase = n
    },

    // Module 4: getSpaceIterator function
    function ( e, r, t ) {
      "use strict"; // Enable strict mode.

      // __generator: Helper function for implementing generators in TypeScript/JavaScript.
      // This boilerplate allows async/await-like syntax for iterators.
      var n = this && this.__generator || function ( e, r ) {
        var t, n, o, i, s = {
          label: 0,
          sent: function () {
            if ( 1 & o[0] )
              throw o[1];
            return o[1]
          },
          trys: [],
          ops: []
        };
        return i = {
          next: u( 0 ),
          throw: u( 1 ),
          return: u( 2 )
        },
        "function" == typeof Symbol && ( i[Symbol.iterator] = function () { return this } ),
        i;
        function u ( i ) {
          return function ( u ) {
            return function ( i ) {
              if ( t )
                throw new TypeError( "Generator is already executing." );
              for ( ; s; )
                try {
                  if ( t = 1, n && ( o = 2 & i[0] ? n.return : i[0] ? n.throw || ( ( o = n.return ) && o.call( n ), 0 ) : n.next ) && !( o = o.call( n, i[1] ) ).done )
                    return o;
                  switch ( n = 0, o && ( i = [ 2 & i[0], o.value ] ), i[0] ) {
                    case 0:
                    case 1:
                      o = i;
                      break;
                    case 4:
                      return s.label++, { value: i[1], done: !1 };
                    case 5:
                      s.label++, n = i[1], i = [ 0 ];
                      continue;
                    case 7:
                      i = s.ops.pop(), s.trys.pop();
                      continue;
                    default:
                      if ( !( o = ( o = s.trys ).length > 0 && o[o.length - 1] ) && ( 6 === i[0] || 2 === i[0] ) ) {
                        s = 0;
                        continue
                      }
                      if ( 3 === i[0] && ( !o || i[1] > o[0] && i[1] < o[3] ) ) {
                        s.label = i[1];
                        break
                      }
                      if ( 6 === i[0] && s.label < o[1] ) {
                        s.label = o[1], o = i;
                        break
                      }
                      if ( o && s.label < o[2] ) {
                        s.label = o[2], s.ops.push( i );
                        break
                      }
                      o[2] && s.ops.pop(), s.trys.pop();
                      continue
                  }
                  i = r.call( e, s )
                }
                catch ( e ) {
                  i = [ 6, e ], n = 0
                }
                finally {
                  t = o = 0
                }
              if ( 5 & i[0] )
                throw i[1];
              return { value: i[0] ? i[1] : void 0, done: !0 }
            }( [ i, u ] )
          }
        }
      };

      // Mark this module as an ES module.
      r.__esModule = !0,

      // getSpaceIterator: Function to create an iterator for space-separated values.
      r.getSpaceIterator = function ( e, r ) {
        var t, o;
        // Uses the __generator helper to create an iterable.
        return n( this, ( function ( n ) {
          switch ( n.label ) {
            case 0:
              // Initialize index and parse the input string.
              t = 0,
              o = e.split( /\s+/ ).map( ( function ( e ) { return r( e ) } ) ),
              n.label = 1;
            case 1:
              // Yield values one by one until all are processed.
              return t < o.length ? [ 4, o[t] ] : [ 3, 4 ];
            case 2:
              n.sent(), n.label = 3;
            case 3:
              return t++, [ 3, 1 ];
            case 4:
              return [ 2, void 0 ]
          }
        } ) )
      }
    },

    // Module 5: Big.js Library
    function ( e, r, t ) {
      "use strict"; // Enable strict mode.

      // Export 'Big' as a named export from the module.
      t.r( r ), t.d( r, "Big", ( function () { return l } ) );

      // Error message constants.
      var n = "[big.js] ",
      o = n + "Invalid ",
      i = o + "decimal places",

      // s: Prototype object for Big.js instances.
      s = {},

      // u: Regular expression to validate number strings.
      u = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;

      // f: Internal function for rounding Big.js numbers.
      function f ( e, r, t, n ) {
        var o = e.c, // Coefficients array.
        i = e.e + r + 1; // Effective index for rounding.

        if ( i < o.length ) {
          // Determine if rounding up is needed based on rounding mode 't'.
          if ( 1 === t ) // ROUND_HALF_UP (0.5 always rounds up)
            n = o[i] >= 5;
          else if ( 2 === t ) // ROUND_HALF_EVEN (0.5 rounds to nearest even)
            n = o[i] > 5 || 5 == o[i] && ( n || i < 0 || void 0 !== o[i + 1] || 1 & o[i - 1] );
          else if ( 3 === t ) // ROUND_UP (always rounds away from zero if non-zero)
            n = n || !!o[0];
          else if ( n = !1, 0 !== t ) // ROUND_DOWN (always rounds towards zero)
            throw Error( "[big.js] Invalid rounding mode" );

          // Apply rounding.
          if ( i < 1 )
            // If rounding to an integer or less than 1 decimal place.
            o.length = 1,
            n ? ( e.e = -r, o[0] = 1 ) : o[0] = e.e = 0;
          else {
            // Trim coefficients and adjust exponent if rounding up.
            if ( o.length = i--, n )
              for ( ; ++o[i] > 9; )
                o[i] = 0, i-- || ( ++e.e, o.unshift( 1 ) );
            // Remove trailing zeros.
            for ( i = o.length; !o[--i]; )
              o.pop()
          }
        }
        else if ( t < 0 || t > 3 || t !== ~~t )
          throw Error( "[big.js] Invalid rounding mode" ); // Invalid rounding mode.

        return e
      }

      // c: Internal function for formatting Big.js numbers to strings (toExponential, toFixed, toPrecision, toString).
      function c ( e, r, t, n ) {
        var s, u, c = e.constructor,
        l = !e.c[0]; // Is the number zero?

        if ( void 0 !== t ) {
          // Validate decimal places/precision.
          if ( t !== ~~t || t < ( 3 == r ) || t > 1e6 )
            throw Error( 3 == r ? o + "precision" : i );

          // Adjust number based on precision/decimal places.
          for ( t = n - ( e = new c( e ) ).e, e.c.length > ++n && f( e, t, c.RM ), 2 == r && ( n = e.e + t + 1 ); e.c.length < n; )
            e.c.push( 0 )
        }

        // s: exponent, t: number of digits in coefficient string.
        if ( s = e.e, t = ( u = e.c.join( "" ) ).length,

        // Format to exponential notation if necessary.
        2 != r && ( 1 == r || 3 == r && n <= s || s <= c.NE || s >= c.PE ) )
          u = u.charAt( 0 ) + ( t > 1 ? "." + u.slice( 1 ) : "" ) + ( s < 0 ? "e" : "e+" ) + s;
        // Format to fixed decimal notation.
        else if ( s < 0 ) {
          for ( ; ++s; )
            u = "0" + u;
          u = "0." + u
        }
        else if ( s > 0 )
          if ( ++s > t )
            for ( s -= t; s--; )
              u += "0";
          else
            s < t && ( u = u.slice( 0, s ) + "." + u.slice( s ) );
        else
          t > 1 && ( u = u.charAt( 0 ) + "." + u.slice( 1 ) );

        // Add negative sign if applicable.
        return e.s < 0 && ( !l || 4 == r ) ? "-" + u : u
      }

      // Big.prototype.abs: Returns the absolute value of a Big number.
      s.abs = function () {
        var e = new this.constructor( this );
        return e.s = 1, e
      },

      // Big.prototype.cmp: Compares two Big numbers. Returns 1 if greater, -1 if less, 0 if equal.
      s.cmp = function ( e ) {
        var r, t = this,
        n = t.c,
        o = ( e = new t.constructor( e ) ).c,
        i = t.s,
        s = e.s,
        u = t.e,
        f = e.e;

        // Handle zero values.
        if ( !n[0] || !o[0] )
          return n[0] ? i : o[0] ? -s : 0;

        // Compare signs.
        if ( i != s )
          return i;

        // r: indicates if numbers are negative.
        if ( r = i < 0,

        // Compare exponents.
        u != f )
          return u > f ^ r ? 1 : -1; // If exponents differ, larger exponent means larger number (considering sign).

        // Compare coefficients digit by digit.
        for ( s = ( u = n.length ) < ( f = o.length ) ? u : f, i = -1; ++i < s; )
          if ( n[i] != o[i] )
            return n[i] > o[i] ^ r ? 1 : -1;

        // If coefficients are the same up to the shorter length, compare lengths.
        return u == f ? 0 : u > f ^ r ? 1 : -1
      },

      // Big.prototype.div: Divides two Big numbers.
      s.div = function ( e ) {
        var r = this,
        t = r.constructor,
        n = r.c,
        o = ( e = new t( e ) ).c,
        s = r.s == e.s ? 1 : -1, // Determine sign of result.
        u = t.DP; // Decimal places for division.

        // Validate decimal places.
        if ( u !== ~~u || u < 0 || u > 1e6 )
          throw Error( i );

        // Handle division by zero.
        if ( !o[0] )
          throw Error( "[big.js] Division by zero" );

        // Handle zero numerator.
        if ( !n[0] )
          return new t( 0 * s );

        var c, l, a, h, p,
        v = o.slice(), // Divisor coefficients.
        d = c = o.length, // Length of divisor coefficients.
        g = n.length, // Length of dividend coefficients.
        w = n.slice( 0, c ), // Current part of dividend being processed.
        b = w.length,
        y = e,
        m = y.c = [], // Result coefficients.
        _ = 0,
        M = u + ( y.e = r.e - e.e ) + 1; // Effective exponent of result + precision.

        // Set result sign and adjust precision for negative M.
        for ( y.s = s, s = M < 0 ? 0 : M, v.unshift( 0 ); b++ < c; )
          w.push( 0 ); // Pad dividend part with zeros.

        // Main division loop.
        do {
          for ( a = 0; a < 10; a++ ) {
            // Compare current dividend part with divisor.
            if ( c != ( b = w.length ) )
              h = c > b ? 1 : -1;
            else
              for ( p = -1, h = 0; ++p < c; )
                if ( o[p] != w[p] ) {
                  h = o[p] > w[p] ? 1 : -1;
                  break
                }
            if ( !( h < 0 ) )
              break; // Current dividend part is greater than or equal to divisor.

            // Subtract divisor from dividend part.
            for ( l = b == c ? o : v; b; ) {
              if ( w[--b] < l[b] ) {
                for ( p = b; p && !w[--p]; )
                  w[p] = 9;
                --w[p], w[b] += 10
              }
              w[b] -= l[b]
            }
            // Remove leading zeros from dividend part.
            for ( ; !w[0]; )
              w.shift()
          }

          // Store quotient digit.
          m[_++] = h ? a : ++a,
          // Bring down next digit from dividend.
          w[0] && h ? w[b] = n[d] || 0 : w = [ n[d] ]
        } while ( ( d++ < g || void 0 !== w[0] ) && s-- ); // Continue until dividend exhausted or precision reached.

        // Adjust result coefficients and exponent.
        return m[0] || 1 == _ || ( m.shift(), y.e-- ),
        // Round the final result.
        _ > M && f( y, u, t.RM, void 0 !== w[0] ), y
      },

      // Big.prototype.eq: Checks for equality.
      s.eq = function ( e ) { return !this.cmp( e ) },
      // Big.prototype.gt: Checks if greater than.
      s.gt = function ( e ) { return this.cmp( e ) > 0 },
      // Big.prototype.gte: Checks if greater than or equal to.
      s.gte = function ( e ) { return this.cmp( e ) > -1 },
      // Big.prototype.lt: Checks if less than.
      s.lt = function ( e ) { return this.cmp( e ) < 0 },
      // Big.prototype.lte: Checks if less than or equal to.
      s.lte = function ( e ) { return this.cmp( e ) < 1 },

      // Big.prototype.minus (subtraction) / sub (alias).
      s.minus = s.sub = function ( e ) {
        var r, t, n, o,
        i = this,
        s = i.constructor,
        u = i.s, // Sign of 'this'.
        f = ( e = new s( e ) ).s; // Sign of 'e'.

        // If signs are different, convert to addition.
        if ( u != f )
          return e.s = -f, i.plus( e );

        var c = i.c.slice(), // Coefficients of 'this'.
        l = i.e,             // Exponent of 'this'.
        a = e.c,             // Coefficients of 'e'.
        h = e.e;             // Exponent of 'e'.

        // Handle zero values.
        if ( !c[0] || !a[0] )
          return a[0] ? ( e.s = -f, e ) : new s( c[0] ? i : 0 );

        // Align decimal points by padding with zeros.
        if ( u = l - h ) {
          for ( ( o = u < 0 ) ? ( u = -u, n = c ) : ( h = l, n = a ), n.reverse(), f = u; f--; )
            n.push( 0 );
          n.reverse()
        }
        else
          // If exponents are equal, determine which number is larger for initial 'o'.
          for ( t = ( ( o = c.length < a.length ) ? c : a ).length, u = f = 0; f < t; f++ )
            if ( c[f] != a[f] ) {
              o = c[f] < a[f];
              break
            }

        // If 'this' is smaller than 'e', swap them and negate the result's sign.
        if ( o && ( n = c, c = a, a = n, e.s = -e.s ),
        // Pad shorter coefficient array with zeros to match length.
        ( f = ( t = a.length ) - ( r = c.length ) ) > 0 )
          for ( ; f--; )
            c[r++] = 0;

        // Perform digit-by-digit subtraction.
        for ( f = r; t > u; ) {
          if ( c[--t] < a[t] ) {
            for ( r = t; r && !c[--r]; )
              c[r] = 9;
            --c[r], c[t] += 10
          }
          c[t] -= a[t]
        }

        // Remove trailing zeros.
        for ( ; 0 === c[--f]; )
          c.pop();

        // Remove leading zeros and adjust exponent.
        for ( ; 0 === c[0]; )
          c.shift(), --h;

        // If result is zero, set sign to 1 and exponent to 0.
        return c[0] || ( e.s = 1, c = [ h = 0 ] ), e.c = c, e.e = h, e
      },

      // Big.prototype.mod: Calculates the remainder of division (modulo).
      s.mod = function ( e ) {
        var r, t = this,
        n = t.constructor,
        o = t.s,
        i = ( e = new n( e ) ).s;

        // Handle division by zero.
        if ( !e.c[0] )
          throw Error( "[big.js] Division by zero" );

        // Store original signs, set to positive for comparison.
        return t.s = e.s = 1,
        r = 1 == e.cmp( t ), // Check if divisor is greater than dividend.
        t.s = o, e.s = i,    // Restore original signs.

        // If divisor > dividend, remainder is the dividend itself.
        r ? new n( t ) : (
          // Perform division, then subtract (quotient * divisor) from dividend.
          o = n.DP, i = n.RM, // Store original DP and RM.
          n.DP = n.RM = 0,    // Set to integer division.
          t = t.div( e ),     // Perform division.
          n.DP = o, n.RM = i, // Restore original DP and RM.
          this.minus( t.times( e ) )
        )
      },

      // Big.prototype.plus (addition) / add (alias).
      s.plus = s.add = function ( e ) {
        var r, t = this,
        n = t.constructor,
        o = t.s, // Sign of 'this'.
        i = ( e = new n( e ) ).s; // Sign of 'e'.

        // If signs are different, convert to subtraction.
        if ( o != i )
          return e.s = -i, t.minus( e );

        var s = t.e, // Exponent of 'this'.
        u = t.c,     // Coefficients of 'this'.
        f = e.e,     // Exponent of 'e'.
        c = e.c;     // Coefficients of 'e'.

        // Handle zero values.
        if ( !u[0] || !c[0] )
          return c[0] ? e : new n( u[0] ? t : 0 * o );

        // Clone coefficients for manipulation.
        if ( u = u.slice(),

        // Align decimal points by padding with zeros.
        o = s - f ) {
          for ( o > 0 ? ( f = s, r = c ) : ( o = -o, r = u ), r.reverse(); o--; )
            r.push( 0 );
          r.reverse()
        }

        // Ensure 'u' is the longer array for easier addition.
        for ( u.length - c.length < 0 && ( r = c, c = u, u = r ),
        o = c.length, i = 0; o; u[o] %= 10 )
          // Perform digit-by-digit addition with carry.
          i = ( u[--o] = u[o] + c[o] + i ) / 10 | 0;

        // If there's a final carry, prepend it and increment exponent.
        for ( i && ( u.unshift( i ), ++f ),
        // Remove trailing zeros.
        o = u.length; 0 === u[--o]; )
          u.pop();

        // Update result object.
        return e.c = u, e.e = f, e
      },

      // Big.prototype.pow: Raises a Big number to an integer power.
      s.pow = function ( e ) {
        var r = this,
        t = new r.constructor( 1 ), // Result initialized to 1.
        n = t,
        i = e < 0; // Flag for negative exponent.

        // Validate exponent.
        if ( e !== ~~e || e < -1e6 || e > 1e6 )
          throw Error( o + "exponent" );

        // Handle negative exponent by taking reciprocal.
        for ( i && ( e = -e );
          1 & e && ( n = n.times( r ) ), // If odd, multiply current result.
          e >>= 1;                      // Right shift (divide by 2).
        )
          r = r.times( r ); // Square the base.

        // If original exponent was negative, return 1 / result.
        return i ? t.div( n ) : n
      },

      // Big.prototype.round: Rounds a Big number to a specified decimal place.
      s.round = function ( e, r ) {
        var t = this.constructor;

        // Default decimal places to 0 if not provided.
        if ( void 0 === e )
          e = 0;
        // Validate decimal places.
        else if ( e !== ~~e || e < -1e6 || e > 1e6 )
          throw Error( i );

        // Call internal rounding function.
        return f( new t( this ), e, void 0 === r ? t.RM : r )
      },

      // Big.prototype.sqrt: Calculates the square root of a Big number.
      s.sqrt = function () {
        var e, r, t,
        o = this,
        i = o.constructor,
        s = o.s, // Sign.
        u = o.e, // Exponent.
        c = new i( .5 ); // Constant 0.5 for Newton's method.

        // Handle zero.
        if ( !o.c[0] )
          return new i( o );

        // Handle negative numbers (no real square root).
        if ( s < 0 )
          throw Error( n + "No square root" );

        // Initial guess for square root using standard Math.sqrt.
        // If Math.sqrt gives 0 or Infinity, construct a guess from coefficients.
        0 === ( s = Math.sqrt( o + "" ) ) || s === 1 / 0 ? (
          ( r = o.c.join( "" ) ).length + u & 1 || ( r += "0" ), // Adjust length for even number of digits.
          u = ( ( u + 1 ) / 2 | 0 ) - ( u < 0 || 1 & u ), // Adjust exponent.
          e = new i( ( ( s = Math.sqrt( r ) ) == 1 / 0 ? "1e" : ( s = s.toExponential() ).slice( 0, s.indexOf( "e" ) + 1 ) ) + u ) // Construct Big number from guess.
        ) :
          e = new i( s ), // Use Math.sqrt result directly.
        u = e.e + ( i.DP += 4 ); // Set precision for iteration.

        // Newton's method iteration: x_n+1 = 0.5 * (x_n + N / x_n).
        do {
          t = e,
          e = c.times( t.plus( o.div( t ) ) )
        } while ( t.c.slice( 0, u ).join( "" ) !== e.c.slice( 0, u ).join( "" ) ); // Iterate until sufficient precision is reached.

        // Round the final result and restore original DP.
        return f( e, i.DP -= 4, i.RM )
      },

      // Big.prototype.times (multiplication) / mul (alias).
      s.times = s.mul = function ( e ) {
        var r, t = this,
        n = t.constructor,
        o = t.c, // Coefficients of 'this'.
        i = ( e = new n( e ) ).c, // Coefficients of 'e'.
        s = o.length,
        u = i.length,
        f = t.e, // Exponent of 'this'.
        c = e.e; // Exponent of 'e'.

        // Determine sign of result.
        if ( e.s = t.s == e.s ? 1 : -1,

        // Handle zero values.
        !o[0] || !i[0] )
          return new n( 0 * e.s );

        // Result exponent is sum of exponents.
        for ( e.e = f + c,

        // Ensure 'o' is the longer array for easier multiplication.
        s < u && ( r = o, o = i, i = r, c = s, s = u, u = c ),

        // Initialize result coefficients array.
        r = new Array( c = s + u ); c--; )
          r[c] = 0;

        // Perform digit-by-digit multiplication.
        for ( f = u; f--; ) {
          for ( u = 0, c = s + f; c > f; )
            u = r[c] + i[f] * o[c - f - 1] + u,
            r[c--] = u % 10,
            u = u / 10 | 0;
          r[c] = ( r[c] + u ) % 10
        }

        // Adjust exponent and remove leading/trailing zeros.
        for ( u ? ++e.e : r.shift(),
        f = r.length; !r[--f]; )
          r.pop();

        // Update result object.
        return e.c = r, e
      },

      // Big.prototype.toExponential: Formats number in exponential notation.
      s.toExponential = function ( e ) { return c( this, 1, e, e ) },
      // Big.prototype.toFixed: Formats number with fixed decimal places.
      s.toFixed = function ( e ) { return c( this, 2, e, this.e + e ) },
      // Big.prototype.toPrecision: Formats number to specified significant digits.
      s.toPrecision = function ( e ) { return c( this, 3, e, e - 1 ) },
      // Big.prototype.toString: Default string representation.
      s.toString = function () { return c( this ) },
      // Big.prototype.valueOf / toJSON: Returns string representation for JSON or primitive value.
      s.valueOf = s.toJSON = function () { return c( this, 4 ) };

      // l: The Big constructor function.
      var l = function e () {
        function r ( t ) {
          var n = this;
          // If called without 'new', return a new instance.
          if ( !( n instanceof r ) )
            return void 0 === t ? e() : new r( t );

          // If 't' is already a Big instance, copy its properties.
          t instanceof r ? ( n.s = t.s, n.e = t.e, n.c = t.c.slice() ) :
          // Otherwise, parse the input string/number.
          function ( e, r ) {
            var t, n, i;

            // Handle -0.
            if ( 0 === r && 1 / r < 0 )
              r = "-0";
            // Validate input format.
            else if ( !u.test( r += "" ) )
              throw Error( o + "number" );

            // Set sign (s).
            e.s = "-" == r.charAt( 0 ) ? ( r = r.slice( 1 ), -1 ) : 1,

            // Handle decimal point.
            ( t = r.indexOf( "." ) ) > -1 && ( r = r.replace( ".", "" ) );

            // Handle exponential notation.
            ( n = r.search( /e/i ) ) > 0 ?
              ( t < 0 && ( t = n ), t += +r.slice( n + 1 ), r = r.substring( 0, n ) ) :
              t < 0 && ( t = r.length );

            // Remove leading zeros and set coefficient array (c) and exponent (e).
            for ( i = r.length, n = 0; n < i && "0" == r.charAt( n ); )
              ++n;

            if ( n == i )
              e.c = [ e.e = 0 ]; // Value is zero.
            else {
              for ( ; i > 0 && "0" == r.charAt( --i ); ); // Remove trailing zeros.
              for ( e.e = t - n - 1, e.c = [], t = 0; n <= i; )
                e.c[t++] = +r.charAt( n++ )
            }
          }( n, t ), n.constructor = r
        }

        // Set prototype, default configuration, and version.
        return r.prototype = s,
        r.DP = 20, // Default decimal places.
        r.RM = 1,  // Default rounding mode (ROUND_HALF_UP).
        r.NE = -7, // Negative exponent threshold.
        r.PE = 21, // Positive exponent threshold.
        r.version = "5.2.2",
        r
      }();

      // Export Big as the default export.
      r.default = l
    }
  ]
);