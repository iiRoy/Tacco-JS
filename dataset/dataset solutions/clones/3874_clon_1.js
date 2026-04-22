// This is the main Parcel bundler wrapper function.
// It handles module loading and execution.
parcelRequire = function ( e, r, t, n ) {

  // Declare some internal variables for the bundler.
  var i,
      o = "function" === typeof parcelRequire && parcelRequire,
      u = "function" === typeof require && require;


  // The core function 'f' acts as a custom 'require' for bundled modules.
  function f ( t, n ) {

    // If module 't' is not in the cache (r)...
    if ( !r[t] ) {

      // And if module 't' is not in the defined modules (e)...
      if ( !e[t] ) {

        // Try to use an existing global 'parcelRequire' if available.
        var i = "function" === typeof parcelRequire && parcelRequire;
        if ( !n && i ) return i( t, !0 );

        // Fallback to the bundler's own 'parcelRequire' if available.
        if ( o ) return o( t, !0 );

        // Fallback to Node.js 'require' for external modules.
        if ( u && "string" === typeof t ) return u( t );

        // If module cannot be found anywhere, throw an error.
        var c = new Error( "Cannot find module '" + t + "'" );
        throw ( c.code = "MODULE_NOT_FOUND" ), c;
      }

      // If module 't' is found in 'e', proceed to load it.
      // Set up resolver for relative paths within the module.
      p.resolve = function ( r ) {
        return e[t][1][r] || r;
      };
      p.cache = {}; // Initialize a cache for this module.

      // Create a new module object and store it in 'r'.
      var l = r[t] = new f.Module( t );

      // Execute the module's code.
      // 'e[t][0]' contains the module's factory function.
      e[t][0].call( l.exports, p, l, l.exports, this );
    }

    // Return the exports of the loaded module.
    return r[t].exports;


    // Local helper function 'p' for module resolution.
    function p ( e ) {
      return f( p.resolve( e ) );
    }
  }

  // Assign properties to the main 'f' function (the bundler's require).
  f.isParcelRequire = !0; // Mark as a Parcel require.
  f.Module = function ( e ) {
    this.id = e;
    this.bundle = f;
    this.exports = {};
  };
  f.modules = e; // Store all module definitions.
  f.cache = r; // Store the module cache.
  f.parent = o; // Reference to parent bundler if nested.
  f.register = function ( r, t ) {
    e[r] = [ function ( e, r ) { r.exports = t; }, {} ];
  };

  // Iterate over entry points 't' and load them.
  for ( var c = 0; c < t.length; c++ )
    try {
      f( t[c] ); // Attempt to load each entry module.
    } catch ( e ) {
      i || ( i = e ); // Capture the first error encountered.
    }

  // Handle bundle exports if entry points exist.
  if ( t.length ) {
    var l = f( t[t.length - 1] ); // Get the last entry point's exports.

    /*
     * Universal Module Definition (UMD) pattern.
     * Supports CommonJS, AMD, and global variable assignment.
     */
    "object" === typeof exports && "undefined" !== typeof module ?
        ( module.exports = l ) :
        "function" === typeof define && define.amd ?
            define( function () { return l; } ) :
            n && ( this[n] = l );
  }

  // Update the global 'parcelRequire' reference.
  if ( ( parcelRequire = f ), i ) throw i; // Re-throw any caught errors.

  return f; // Return the fully configured module loader.
}({
  // --- Start of Bundled Application Modules ---
  "Focm": [
    function ( require, module, exports ) {
      // Module Focm: Contains the main application logic and dependencies.

      var n = {}; // A common pattern for storing module exports.

      // --- Sub-module: Control.Apply (arrayApply) ---
      !function ( t ) {
        "use strict";
        ( n["Control.Apply"] = n["Control.Apply"] || {} ).arrayApply = function ( n ) {
          return function ( t ) {
            for (
                var r = n.length,
                    e = t.length,
                    i = new Array( r * e ),
                    u = 0,
                    o = 0;
                o < r;
                o++
            )
              for ( var a = n[o], c = 0; c < e; c++ )
                i[u++] = a( t[c] );
            return i;
          };
        };
      }(),

      // --- Sub-module: Control.Semigroupoid ---
      function ( n ) {
        "use strict";
        n["Control.Semigroupoid"] = n["Control.Semigroupoid"] || {};
        var t = n["Control.Semigroupoid"],
            r = function ( n ) {
              this.compose = n;
            },
            e = new r( function ( n ) {
              return function ( t ) {
                return function ( r ) {
                  return n( t( r ) );
                };
              };
            } );
        t.compose = function ( n ) { return n.compose; };
        t.Semigroupoid = r;
        t.semigroupoidFn = e;
      }( n ),

      // --- Sub-module: Control.Category ---
      function ( n ) {
        "use strict";
        n["Control.Category"] = n["Control.Category"] || {};
        var t = n["Control.Category"],
            r = n["Control.Semigroupoid"],
            e = function ( n, t ) {
              this.Semigroupoid0 = n;
              this.identity = t;
            },
            i = new e( function () { return r.semigroupoidFn; }, function ( n ) { return n; } );
        t.Category = e;
        t.identity = function ( n ) { return n.identity; };
        t.categoryFn = i;
      }( n ),

      // --- Sub-module: Data.Function ---
      function ( n ) {
        "use strict";
        n["Data.Function"] = n["Data.Function"] || {};
        var t = n["Data.Function"];
        t.flip = function ( n ) {
          return function ( t ) {
            return function ( r ) {
              return n( r )( t );
            };
          };
        };
        t.const = function ( n ) {
          return function ( t ) {
            return n;
          };
        };
      }( n ),

      // --- Sub-module: Data.Functor (arrayMap) ---
      function ( t ) {
        "use strict";
        ( n["Data.Functor"] = n["Data.Functor"] || {} ).arrayMap = function ( n ) {
          return function ( t ) {
            for (
                var r = t.length,
                    e = new Array( r ),
                    i = 0;
                i < r;
                i++
            )
              e[i] = n( t[i] );
            return e;
          };
        };
      }(),

      // --- Sub-module: Data.Unit (unit object) ---
      function ( t ) {
        "use strict";
        ( n["Data.Unit"] = n["Data.Unit"] || {} ).unit = {};
      }(),

      // --- Sub-module: Data.Unit (re-assign unit) ---
      function ( n ) {
        "use strict";
        n["Data.Unit"] = n["Data.Unit"] || {};
        var t = n["Data.Unit"],
            r = n["Data.Unit"];
        t.unit = r.unit;
      }( n ),

      // --- Sub-module: Data.Functor ---
      function ( n ) {
        "use strict";
        n["Data.Functor"] = n["Data.Functor"] || {};
        var t = n["Data.Functor"],
            r = n["Data.Functor"],
            e = n["Data.Function"],
            i = n["Data.Unit"],
            u = function ( n ) { this.map = n; },
            o = function ( n ) { return n.map; },
            a = new u( r.arrayMap );
        t.Functor = u;
        t.map = o;
        t.void = function ( n ) { return o( n )( e.const( i.unit ) ); };
        t.functorArray = a;
      }( n ),

      // --- Sub-module: Control.Apply ---
      function ( n ) {
        "use strict";
        n["Control.Apply"] = n["Control.Apply"] || {};
        var t = n["Control.Apply"],
            r = n["Control.Apply"],
            e = n["Control.Category"],
            i = n["Data.Function"],
            u = n["Data.Functor"],
            o = function ( n, t ) {
              this.Functor0 = n;
              this.apply = t;
            },
            a = new o( function () { return u.functorArray; }, r.arrayApply ),
            c = function ( n ) { return n.apply; };
        t.Apply = o;
        t.apply = c;
        t.applySecond = function ( n ) {
          return function ( t ) {
            return function ( r ) {
              return c( n )( u.map( n.Functor0() )( i.const( e.identity( e.categoryFn ) ) )( t ) )( r );
            };
          };
        };
        t.applyArray = a;
      }( n ),

      // --- Sub-module: Control.Applicative ---
      function ( n ) {
        "use strict";
        n["Control.Applicative"] = n["Control.Applicative"] || {};
        var t = n["Control.Applicative"],
            r = n["Control.Apply"],
            e = function ( n ) { return n.pure; };
        t.Applicative = function ( n, t ) { this.Apply0 = n; this.pure = t; };
        t.pure = e;
        t.liftA1 = function ( n ) {
          return function ( t ) {
            return function ( i ) {
              return r.apply( n.Apply0() )( e( n )( t ) )( i );
            };
          };
        };
      }( n ),

      // --- Sub-module: Control.Bind (arrayBind) ---
      function ( t ) {
        "use strict";
        ( n["Control.Bind"] = n["Control.Bind"] || {} ).arrayBind = function ( n ) {
          return function ( t ) {
            for ( var r = [], e = 0, i = n.length; e < i; e++ )
              Array.prototype.push.apply( r, t( n[e] ) );
            return r;
          };
        };
      }(),

      // --- Sub-module: Control.Bind ---
      function ( n ) {
        "use strict";
        n["Control.Bind"] = n["Control.Bind"] || {};
        var t = n["Control.Bind"],
            r = n["Control.Bind"],
            e = n["Control.Apply"],
            i = n["Data.Function"],
            u = function ( n, t ) { this.Apply0 = n; this.bind = t; },
            o = new u( function () { return e.applyArray; }, r.arrayBind ),
            a = function ( n ) { return n.bind; },
            c = function ( n ) { return i.flip( a( n ) ); };
        t.Bind = u;
        t.bind = a;
        t.bindFlipped = c;
        t.composeKleisliFlipped = function ( n ) {
          return function ( t ) {
            return function ( r ) {
              return function ( e ) {
                return c( n )( t )( r( e ) );
              };
            };
          };
        };
        t.bindArray = o;
      }( n ),

      // --- Sub-module: Control.Monad.Rec.Class ---
      function ( n ) {
        "use strict";
        n["Control.Monad.Rec.Class"] = n["Control.Monad.Rec.Class"] || {};
        var t = n["Control.Monad.Rec.Class"],
            r = function () {
              function n ( n ) { this.value0 = n; }
              return n.create = function ( t ) { return new n( t ); }, n;
            }(),
            e = function () {
              function n ( n ) { this.value0 = n; }
              return n.create = function ( t ) { return new n( t ); }, n;
            }();
        t.Loop = r;
        t.Done = e;
        t.tailRec = function ( n ) {
          return function ( t ) {
            return function ( t ) {
              var i,
                  u = !1;

              function o ( i ) {
                if ( !( i instanceof r ) ) {
                  if ( i instanceof e ) return u = !0, i.value0;
                  throw new Error( "Failed pattern match at Control.Monad.Rec.Class (line 91, column 3 - line 91, column 25): " + [i.constructor.name] );
                }
                t = n( i.value0 );
              }
              for ( ; !u; ) i = o( t );
              return i;
            }( n( t ) );
          };
        };
      }( n ),

      // --- Sub-module: Data.Array (basic operations) ---
      function ( n ) {
        "use strict";
        n.length = function ( n ) { return n.length; };
        n["uncons'"] = function ( n ) {
          return function ( t ) {
            return function ( r ) {
              return 0 === r.length ? n( {} ) : t( r[0] )( r.slice( 1 ) );
            };
          };
        };
        n.indexImpl = function ( n ) {
          return function ( t ) {
            return function ( r ) {
              return function ( e ) {
                return e < 0 || e >= r.length ? t : n( r[e] );
              };
            };
          };
        };
        n.slice = function ( n ) {
          return function ( t ) {
            return function ( r ) {
              return r.slice( n, t );
            };
          };
        };
      }( n["Data.Array"] = n["Data.Array"] || {} ),

      // --- Sub-module: Data.Maybe ---
      function ( n ) {
        "use strict";
        n["Data.Maybe"] = n["Data.Maybe"] || {};
        var t = n["Data.Maybe"],
            r = function () {
              function n () {}
              return n.value = new n, n;
            }(),
            e = function () {
              function n ( n ) { this.value0 = n; }
              return n.create = function ( t ) { return new n( t ); }, n;
            }();
        t.Nothing = r;
        t.Just = e;
        t.maybe = function ( n ) {
          return function ( t ) {
            return function ( i ) {
              if ( i instanceof r ) return n;
              if ( i instanceof e ) return t( i.value0 );
              throw new Error( "Failed pattern match at Data.Maybe (line 217, column 1 - line 217, column 51): " + [n.constructor.name, t.constructor.name, i.constructor.name] );
            };
          };
        };
      }( n ),

      // --- Sub-module: Data.Array (more operations) ---
      function ( n ) {
        "use strict";
        n["Data.Array"] = n["Data.Array"] || {};
        var t = n["Data.Array"],
            r = n["Data.Array"],
            e = n["Control.Bind"],
            i = n["Data.Function"],
            u = n["Data.Maybe"],
            o = r["uncons'"]( i.const( u.Nothing.value ) )( function ( n ) {
              return function ( t ) {
                return new u.Just( { head: n, tail: t } );
              };
            } ),
            a = function ( n ) { return [n]; },
            c = r.indexImpl( u.Just.create )( u.Nothing.value ),
            f = i.flip( e.bind( e.bindArray ) );
        t.singleton = a;
        t.uncons = o;
        t.index = c;
        t.concatMap = f;
        t.mapMaybe = function ( n ) {
          return f( function ( t ) {
            return u.maybe( [] )( a )( n( t ) );
          } );
        };
      }( n ),

      // --- Sub-module: Data.Bounded (int limits) ---
      function ( n ) {
        "use strict";
        n.topInt = 2147483647;
        n.bottomInt = -2147483648;
      }( n["Data.Bounded"] = n["Data.Bounded"] || {} ),

      // --- Sub-module: Data.Eq (refEq) ---
      function ( t ) {
        "use strict";
        ( n["Data.Eq"] = n["Data.Eq"] || {} ).refEq = function ( n ) {
          return function ( t ) {
            return n === t;
          };
        };
      }(),

      // --- Sub-module: Data.Eq ---
      function ( n ) {
        "use strict";
        n["Data.Eq"] = n["Data.Eq"] || {};
        var t = n["Data.Eq"],
            r = function ( n ) { this.eq = n; },
            e = new r( n["Data.Eq"].refEq );
        t.Eq = r;
        t.eq = function ( n ) { return n.eq; };
        t.eqInt = e;
      }( n ),

      // --- Sub-module: Data.Ord.Unsafe (unsafeCompareImpl) ---
      function ( t ) {
        "use strict";
        ( n["Data.Ord.Unsafe"] = n["Data.Ord.Unsafe"] || {} ).unsafeCompareImpl = function ( n ) {
          return function ( t ) {
            return function ( r ) {
              return function ( e ) {
                return function ( i ) {
                  return e < i ? n : e === i ? t : r;
                };
              };
            };
          };
        };
      }(),

      // --- Sub-module: Data.Ordering ---
      function ( n ) {
        "use strict";
        n["Data.Ordering"] = n["Data.Ordering"] || {};
        var t = n["Data.Ordering"],
            r = function () { function n () {} return n.value = new n, n; }(),
            e = function () { function n () {} return n.value = new n, n; }(),
            i = function () { function n () {} return n.value = new n, n; }();
        t.LT = r;
        t.GT = e;
        t.EQ = i;
      }( n ),

      // --- Sub-module: Data.Ord.Unsafe (unsafeCompare) ---
      function ( n ) {
        "use strict";
        n["Data.Ord.Unsafe"] = n["Data.Ord.Unsafe"] || {};
        var t = n["Data.Ord.Unsafe"],
            r = n["Data.Ord.Unsafe"],
            e = n["Data.Ordering"],
            i = r.unsafeCompareImpl( e.LT.value )( e.EQ.value )( e.GT.value );
        t.unsafeCompare = i;
      }( n ),

      // --- Sub-module: Data.Ord ---
      function ( n ) {
        "use strict";
        n["Data.Ord"] = n["Data.Ord"] || {};
        var t = n["Data.Ord"],
            r = n["Data.Eq"],
            e = n["Data.Ord.Unsafe"],
            i = n["Data.Ordering"],
            u = function ( n, t ) { this.Eq0 = n; this.compare = t; },
            o = new u( function () { return r.eqInt; }, e.unsafeCompare ),
            a = function ( n ) { return n.compare; };
        t.Ord = u;
        t.compare = a;
        t.min = function ( n ) {
          return function ( t ) {
            return function ( r ) {
              var e = a( n )( t )( r );
              if ( e instanceof i.LT ) return t;
              if ( e instanceof i.EQ ) return t;
              if ( e instanceof i.GT ) return r;
              throw new Error( "Failed pattern match at Data.Ord (line 119, column 3 - line 122, column 12): " + [e.constructor.name] );
            };
          };
        };
        t.ordInt = o;
      }( n ),

      // --- Sub-module: Data.Bounded ---
      function ( n ) {
        "use strict";
        n["Data.Bounded"] = n["Data.Bounded"] || {};
        var t = n["Data.Bounded"],
            r = n["Data.Bounded"],
            e = n["Data.Ord"],
            i = function ( n, t, r ) { this.Ord0 = n; this.bottom = t; this.top = r; },
            u = new i( function () { return e.ordInt; }, r.bottomInt, r.topInt );
        t.Bounded = i;
        t.bottom = function ( n ) { return n.bottom; };
        t.top = function ( n ) { return n.top; };
        t.boundedInt = u;
      }( n ),

      // --- Sub-module: Data.Either ---
      function ( n ) {
        "use strict";
        n["Data.Either"] = n["Data.Either"] || {};
        var t = n["Data.Either"],
            r = n["Control.Applicative"],
            e = n["Control.Apply"],
            i = n["Control.Bind"],
            u = n["Data.Functor"],
            o = n["Data.Maybe"],
            a = function () {
              function n ( n ) { this.value0 = n; }
              return n.create = function ( t ) { return new n( t ); }, n;
            }(),
            c = function () {
              function n ( n ) { this.value0 = n; }
              return n.create = function ( t ) { return new n( t ); }, n;
            }(),
            f = new u.Functor( function ( n ) {
              return function ( t ) {
                if ( t instanceof a ) return new a( t.value0 );
                if ( t instanceof c ) return new c( n( t.value0 ) );
                throw new Error( "Failed pattern match at Data.Either (line 38, column 8 - line 38, column 52): " + [t.constructor.name] );
              };
            } ),
            l = function ( n ) {
              return function ( t ) {
                return function ( r ) {
                  if ( r instanceof a ) return n( r.value0 );
                  if ( r instanceof c ) return t( r.value0 );
                  throw new Error( "Failed pattern match at Data.Either (line 238, column 1 - line 238, column 64): " + [n.constructor.name, t.constructor.name, r.constructor.name] );
                };
              };
            },
            s = new e.Apply( function () { return f; }, function ( n ) {
              return function ( t ) {
                if ( n instanceof a ) return new a( n.value0 );
                if ( n instanceof c ) return u.map( f )( n.value0 )( t );
                throw new Error( "Failed pattern match at Data.Either (line 82, column 1 - line 82, column 41): " + [n.constructor.name, t.constructor.name] );
              };
            } ),
            d = new i.Bind( function () { return s; }, l( function ( n ) {
              return function ( t ) {
                return new a( n );
              };
            } )( function ( n ) {
              return function ( t ) {
                return t( n );
              };
            } ) ),
            p = new r.Applicative( function () { return s; }, c.create );
        t.Left = a;
        t.Right = c;
        t.either = l;
        t.note = function ( n ) { return o.maybe( new a( n ) )( c.create ); };
        t.functorEither = f;
        t.applyEither = s;
        t.applicativeEither = p;
        t.bindEither = d;
      }( n ),

      // --- Sub-module: Data.EuclideanRing (int methods) ---
      function ( n ) {
        "use strict";
        n.intDegree = function ( n ) { return Math.min( Math.abs( n ), 2147483647 ); };
        n.intDiv = function ( n ) {
          return function ( t ) {
            return 0 === t ? 0 : t > 0 ? Math.floor( n / t ) : -Math.floor( n / -t );
          };
        };
        n.intMod = function ( n ) {
          return function ( t ) {
            if ( 0 === t ) return 0;
            var r = Math.abs( t );
            return ( n % r + r ) % r;
          };
        };
      }( n["Data.EuclideanRing"] = n["Data.EuclideanRing"] || {} ),

      // --- Sub-module: Data.Ring (intSub) ---
      function ( t ) {
        "use strict";
        ( n["Data.Ring"] = n["Data.Ring"] || {} ).intSub = function ( n ) {
          return function ( t ) {
            return n - t | 0;
          };
        };
      }(),

      // --- Sub-module: Data.Semiring (intAdd, intMul) ---
      function ( n ) {
        "use strict";
        n.intAdd = function ( n ) { return function ( t ) { return n + t | 0; }; };
        n.intMul = function ( n ) { return function ( t ) { return n * t | 0; }; };
      }( n["Data.Semiring"] = n["Data.Semiring"] || {} ),

      // --- Sub-module: Data.Semiring ---
      function ( n ) {
        "use strict";
        n["Data.Semiring"] = n["Data.Semiring"] || {};
        var t = n["Data.Semiring"],
            r = n["Data.Semiring"],
            e = function ( n, t, r, e ) { this.add = n; this.mul = t; this.one = r; this.zero = e; },
            i = new e( r.intAdd, r.intMul, 1, 0 );
        t.Semiring = e;
        t.add = function ( n ) { return n.add; };
        t.zero = function ( n ) { return n.zero; };
        t.mul = function ( n ) { return n.mul; };
        t.one = function ( n ) { return n.one; };
        t.semiringInt = i;
      }( n ),

      // --- Sub-module: Data.Ring ---
      function ( n ) {
        "use strict";
        n["Data.Ring"] = n["Data.Ring"] || {};
        var t = n["Data.Ring"],
            r = n["Data.Ring"],
            e = n["Data.Semiring"],
            i = function ( n, t ) { this.Semiring0 = n; this.sub = t; },
            u = new i( function () { return e.semiringInt; }, r.intSub );
        t.Ring = i;
        t.sub = function ( n ) { return n.sub; };
        t.ringInt = u;
      }( n ),

      // --- Sub-module: Data.CommutativeRing ---
      function ( n ) {
        "use strict";
        n["Data.CommutativeRing"] = n["Data.CommutativeRing"] || {};
        var t = n["Data.CommutativeRing"],
            r = n["Data.Ring"],
            e = function ( n ) { this.Ring0 = n; },
            i = new e( function () { return r.ringInt; } );
        t.CommutativeRing = e;
        t.commutativeRingInt = i;
      }( n ),

      // --- Sub-module: Data.EuclideanRing ---
      function ( n ) {
        "use strict";
        n["Data.EuclideanRing"] = n["Data.EuclideanRing"] || {};
        var t = n["Data.EuclideanRing"],
            r = n["Data.EuclideanRing"],
            e = n["Data.CommutativeRing"],
            i = function ( n, t, r, e ) {
              this.CommutativeRing0 = n;
              this.degree = t;
              this.div = r;
              this.mod = e;
            },
            u = new i( function () { return e.commutativeRingInt; }, r.intDegree, r.intDiv, r.intMod );
        t.EuclideanRing = i;
        t.degree = function ( n ) { return n.degree; };
        t.div = function ( n ) { return n.div; };
        t.mod = function ( n ) { return n.mod; };
        t.euclideanRingInt = u;
      }( n ),

      // --- Sub-module: Data.Int (fromStringAsImpl) ---
      function ( t ) {
        "use strict";
        ( n["Data.Int"] = n["Data.Int"] || {} ).fromStringAsImpl = function ( n ) {
          return function ( t ) {
            return function ( r ) {
              var e;
              // Regex for parsing integers based on radix.
              e = r < 11 ? "[0-" + ( r - 1 ).toString() + "]" : 11 === r ? "[0-9a]" : "[0-9a-" + String.fromCharCode( 86 + r ) + "]";
              var i = new RegExp( "^[\\+\\-]?" + e + "+$", "i" );
              return function ( e ) {
                if ( i.test( e ) ) {
                  var u = parseInt( e, r );
                  return ( 0 | u ) === u ? n( u ) : t;
                }
                return t;
              };
            };
          };
        };
      }(),

      // --- Sub-module: Data.Int ---
      function ( n ) {
        "use strict";
        n["Data.Int"] = n["Data.Int"] || {};
        var t = n["Data.Int"],
            r = n["Data.Int"],
            e = n["Data.Maybe"],
            i = r.fromStringAsImpl( e.Just.create )( e.Nothing.value ),
            u = i( 10 );
        t.fromString = u;
        t.fromStringAs = i;
      }( n ),

      // --- Sub-module: Data.Monoid ---
      function ( n ) {
        "use strict";
        n["Data.Monoid"] = n["Data.Monoid"] || {};
        var t = n["Data.Monoid"];
        t.Monoid = function ( n, t ) { this.Semigroup0 = n; this.mempty = t; };
        t.mempty = function ( n ) { return n.mempty; };
      }( n ),

      // --- Sub-module: Data.Show (showIntImpl) ---
      function ( t ) {
        "use strict";
        ( n["Data.Show"] = n["Data.Show"] || {} ).showIntImpl = function ( n ) {
          return n.toString();
        };
      }(),

      // --- Sub-module: Data.Show ---
      function ( n ) {
        "use strict";
        n["Data.Show"] = n["Data.Show"] || {};
        var t = n["Data.Show"],
            r = function ( n ) { this.show = n; },
            e = new r( n["Data.Show"].showIntImpl );
        t.Show = r;
        t.show = function ( n ) { return n.show; };
        t.showInt = e;
      }( n ),

      // --- Sub-module: Data.String.Common (split, trim) ---
      function ( n ) {
        "use strict";
        n.split = function ( n ) { return function ( t ) { return t.split( n ); }; };
        n.trim = function ( n ) { return n.trim(); };
      }( n["Data.String.Common"] = n["Data.String.Common"] || {} ),

      // --- Sub-module: Data.String.Common (re-export) ---
      function ( n ) {
        "use strict";
        n["Data.String.Common"] = n["Data.String.Common"] || {};
        var t = n["Data.String.Common"],
            r = n["Data.String.Common"];
        t.split = r.split;
        t.trim = r.trim;
      }( n ),

      // --- Sub-module: Data.Tuple ---
      function ( n ) {
        "use strict";
        n["Data.Tuple"] = n["Data.Tuple"] || {};
        var t = n["Data.Tuple"],
            r = function () {
              function n ( n, t ) { this.value0 = n, this.value1 = t; }
              return n.create = function ( t ) { return function ( r ) { return new n( t, r ); }; }, n;
            }();
        t.Tuple = r;
      }( n ),

      // --- Sub-module: Effect (pureE, bindE) ---
      function ( n ) {
        "use strict";
        n.Effect = n.Effect || {};
        n.pureE = function ( n ) { return function () { return n; }; };
        n.bindE = function ( n ) { return function ( t ) { return function () { return t( n() )(); }; }; };
      }( n.Effect = n.Effect || {} ),

      // --- Sub-module: Effect ---
      function ( n ) {
        "use strict";
        n.Effect = n.Effect || {};
        var t = n.Effect,
            r = n.Effect,
            e = n["Control.Applicative"],
            i = n["Control.Apply"],
            u = n["Control.Bind"],
            o = n["Control.Monad"],
            a = n["Data.Functor"],
            c = new o.Monad( function () { return s; }, function () { return f; } ),
            f = new u.Bind( function () { return l; }, r.bindE ),
            l = new i.Apply( function () { return d; }, o.ap( c ) ),
            s = new e.Applicative( function () { return l; }, r.pureE ),
            d = new a.Functor( e.liftA1( s ) );
        t.functorEffect = d;
        t.applyEffect = l;
        t.applicativeEffect = s;
        t.bindEffect = f;
        t.monadEffect = c;
      }( n ),

      // --- Sub-module: Effect.Aff (complex async effects) ---
      function ( n ) {
        "use strict";
        /*
         * This is a significant portion of the Effect.Aff module implementation.
         * It defines the core data types and execution logic for asynchronous computations.
         */
        var t = function () {
          var n = {}, // Internal namespace object.
              t = "Pure",
              r = "Throw",
              e = "Catch",
              i = "Sync",
              u = "Async",
              o = "Bind",
              a = "Bracket",
              c = "Fork",
              f = "Sequential",
              l = "Map",
              s = "Apply",
              d = "Alt",
              p = "Cons",
              m = "Resume",
              h = "Release",
              v = "Finalizer",
              w = "Finalized",
              g = "Forked";

          // D: The core data type for representing Aff computations.
          function D ( n, t, r, e ) {
            this.tag = n, this._1 = t, this._2 = r, this._3 = e
          }

          // E: Helper to create D instances with a given tag.
          function E ( n ) {
            var t = function ( t, r, e ) { return new D( n, t, r, e ) };
            return t.tag = n, t
          }

          // C: Represents a non-canceler (a no-op cancellation).
          function C ( n ) { return new D( t, void 0 ) }

          // y: Executes a thunk and logs errors if any.
          function y ( n ) {
            try { n() } catch ( t ) { setTimeout( function () { throw t }, 0 ) }
          }

          // A: Safely executes a function, catching errors and transforming them.
          function A ( n, t, r ) {
            try { return t( r() ) } catch ( e ) { return n( e ) }
          }

          // _: Async operation handler, manages callbacks and errors.
          function _ ( n, t, r ) {
            try { return t( r() ) } catch ( e ) { return r( n( e ) )(), C }
          }

          // b: The scheduler for managing asynchronous tasks.
          var b = function () {
            var n = 1024, // Buffer size for tasks.
                t = 0,    // Current number of tasks.
                r = 0,    // Index of the next task to process.
                e = new Array( n ), // Task buffer.
                i = !1;   // Is the scheduler currently draining?

            // u: Drains the task queue.
            function u () {
              var u;
              for ( i = !0; 0 !== t; )
                t--, u = e[r], e[r] = void 0, r = ( r + 1 ) % n, u();
              i = !1
            }
            return {
              isDraining: function () { return i },
              enqueue: function ( o ) {
                var a;
                t === n && ( a = i, u(), i = a ), e[( r + t ) % n] = o, t++, i || u()
              }
            }
          }();

          // States for the Fiber execution.
          var S = 0, F = 1, R = 2, B = 3, M = 4, P = 5, I = 6;

          // k: Represents a Fiber, a lightweight thread of execution.
          function k ( n, l, s ) {
            var d = 0, // Current call stack depth.
                g = S, // Current fiber state.
                E = s, // Current value/computation.
                C = null, // Current error.
                U = null, // External cancellation error.
                L = null, // Current bind continuation.
                q = null, // Bind continuation stack.
                T = null, // Finalizer stack.
                O = 0,    // Number of active bracket/finalizer blocks.
                x = 0,    // Counter for onComplete handlers.
                W = null, // onComplete handlers map.
                J = !0;   // Rethrow unhandled errors?

            // z: The main execution loop for a Fiber.
            function z ( s ) {
              for ( var x, G, K;;)
                switch ( x = null, G = null, K = null, g ) {
                  case R: // Resume state.
                    g = F, E = L( E ), null === q ? L = null : ( L = q._1, q = q._2 );
                    break;
                  case B: // Bind/Sync continuation.
                    n.isLeft( E ) ? ( g = P, C = E, E = null ) : null === L ? g = P : ( g = R, E = n.fromRight( E ) );
                    break;
                  case F: // Main execution state.
                    switch ( E.tag ) {
                      case o: // Bind operation.
                        L && ( q = new D( p, L, q ) ), L = E._2, g = F, E = E._1;
                        break;
                      case t: // Pure value.
                        null === L ? ( g = P, E = n.right( E._1 ) ) : ( g = R, E = E._1 );
                        break;
                      case i: // Sync effect.
                        g = B, E = A( n.left, n.right, E._1 );
                        break;
                      case u: // Async effect.
                        return g = M, void ( E = _( n.left, E._1, function ( n ) {
                          return function () {
                            d === s && ( d++, b.enqueue( function () {
                              d === s + 1 && ( g = B, E = n, z( d ) )
                            } ) )
                          }
                        } ) );
                      case r: // Throw error.
                        g = P, C = n.left( E._1 ), E = null;
                        break;
                      case e: // Catch block.
                        T = new D( p, E, null === L ? T : new D( m, L, q ), U ), L = null, q = null, g = F, E = E._1;
                        break;
                      case a: // Bracket operation.
                        O++, T = new D( p, E, null === L ? T : new D( m, L, q ), U ), L = null, q = null, g = F, E = E._1;
                        break;
                      case c: // Fork operation.
                        g = B, x = k( n, l, E._2 ), l && l.register( x ), E._1 && x.run(), E = n.right( x );
                        break;
                      case f: // Sequential composition.
                        g = F, E = N( n, l, E._1 );
                    }
                    break;
                  case P: // Pop continuation/error handling.
                    if ( L = null, q = null, null === T ) g = I, E = U || C || E;
                    else
                      switch ( x = T._3, K = T._1, T = T._2, K.tag ) {
                        case e: // Catch continuation.
                          U && U !== x ? g = P : C && ( g = F, E = K._2( n.fromLeft( C ) ), C = null );
                          break;
                        case m: // Resume continuation.
                          U && U !== x || C ? g = P : ( L = K._1, q = K._2, g = R, E = n.fromRight( E ) );
                          break;
                        case a: // Bracket finalizer.
                          O--, null === C && ( G = n.fromRight( E ), T = new D( p, new D( h, K._2, G ), T, x ), ( U === x || O > 0 ) && ( g = F, E = K._3( G ) ) );
                          break;
                        case h: // Release finalizer.
                          O++, T = new D( p, new D( w, E, C ), T, U ), g = F, E = U && U !== x ? K._1.killed( n.fromLeft( U ) )( K._2 ) : C ? K._1.failed( n.fromLeft( C ) )( K._2 ) : K._1.completed( n.fromRight( E ) )( K._2 ), C = null;
                          break;
                        case v: // Finalizer execution.
                          O++, T = new D( p, new D( w, E, C ), T, U ), g = F, E = K._1;
                          break;
                        case w: // Finalizer completed.
                          O--, g = P, E = K._1, C = K._2
                      }
                    break;
                  case I: // Fiber finished state.
                    for ( var Q in W ) W.hasOwnProperty( Q ) && ( J = J && W[Q].rethrow, y( W[Q].handler( E ) ) );
                    return W = null, void ( U && C ? setTimeout( function () { throw n.fromLeft( C ) }, 0 ) : n.isLeft( E ) && J && setTimeout( function () { if ( J ) throw n.fromLeft( E ) }, 0 ) );
                  case S: // Initial state.
                    g = F;
                    break;
                  case M: // Async suspended state.
                    return;
                }
            }

            // G: Registers an onComplete handler.
            function G ( n ) {
              return function () {
                if ( g === I ) return J = J && n.rethrow, n.handler( E )(), function () {};
                var t = x++;
                return ( W = W || {} )[t] = n, function () { null !== W && delete W[t] }
              }
            }
            return {
              kill: function ( t, r ) {
                return function () {
                  if ( g === I ) return r( n.right( void 0 ) )(), function () {};
                  var e = G( { rethrow: !1, handler: function () { return r( n.right( void 0 ) ) } } )();
                  switch ( g ) {
                    case S:
                      U = n.left( t ), g = I, E = U, z( d );
                      break;
                    case M:
                      null === U && ( U = n.left( t ) ), 0 === O && ( g === M && ( T = new D( p, new D( v, E( t ) ), T, U ) ), g = P, E = null, C = null, z( ++d ) );
                      break;
                    default:
                      null === U && ( U = n.left( t ) ), 0 === O && ( g = P, E = null, C = null )
                  }
                  return e
                }
              },
              join: function ( n ) {
                return function () {
                  var t = G( { rethrow: !1, handler: n } )();
                  return g === S && z( d ), t
                }
              },
              onComplete: G,
              isSuspended: function () { return g === S },
              run: function () { g === S && ( b.isDraining() ? z( d ) : b.enqueue( function () { z( d ) } ) ) }
            }
          }

          // U: Handles parallel execution logic.
          function U ( t, r, e, i ) {
            var o = 0,
                a = {},
                c = 0,
                f = {},
                m = new Error( "[ParAff] Early exit" ),
                h = null,
                v = n;

            // w: Kills running fibers.
            function w ( r, e, i ) {
              var u, o, c = e,
                  f = null,
                  m = null,
                  h = 0,
                  v = {};
              n: for ( ;; )
                switch ( u = null, c.tag ) {
                  case g:
                    if ( c._3 === n && ( u = a[c._1], v[h++] = u.kill( r, function ( n ) { return function () { 0 === --h && i( n )() } } ) ), null === f ) break n;
                    c = f._2, null === m ? f = null : ( f = m._1, m = m._2 );
                    break;
                  case l:
                    c = c._2;
                    break;
                  case s:
                  case d:
                    f && ( m = new D( p, f, m ) ), f = c, c = c._1
                }
              if ( 0 === h ) i( t.right( void 0 ) )();
              else
                for ( o = 0, u = h; o < u; o++ ) v[o] = v[o]();
              return v
            }

            // E: Callback for fiber completion in parallel context.
            function E ( r ) {
              return function ( e ) {
                return function () {
                  delete a[r._1], r._3 = e,
                      function r ( e, u, o ) {
                        var a, p, v, g, D, E;
                        for ( t.isLeft( e ) ? ( a = e, p = null ) : ( p = e, a = null );; ) {
                          if ( v = null, g = null, D = null, E = null, null !== h ) return;
                          if ( null === u ) return void i( a || p )();
                          if ( u._3 !== n ) return;
                          switch ( u.tag ) {
                            case l:
                              null === a ? ( u._3 = t.right( u._1( t.fromRight( p ) ) ), p = u._3 ) : u._3 = a;
                              break;
                            case s:
                              if ( v = u._1._3, g = u._2._3, a ) {
                                if ( u._3 = a, D = !0, E = c++, f[E] = w( m, a === v ? u._2 : u._1, function () {
                                  return function () {
                                    delete f[E], D ? D = !1 : null === o ? r( a, null, null ) : r( a, o._1, o._2 )
                                  }
                                } ), D ) return void ( D = !1 )
                              } else {
                                if ( v === n || g === n ) return;
                                p = t.right( t.fromRight( v )( t.fromRight( g ) ) ), u._3 = p
                              }
                              break;
                            case d:
                              if ( v = u._1._3, g = u._2._3, v === n && t.isLeft( g ) || g === n && t.isLeft( v ) ) return;
                              if ( v !== n && t.isLeft( v ) && g !== n && t.isLeft( v ) ) a = p === v ? g : v, p = null, u._3 = a;
                              else if ( u._3 = p, D = !0, E = c++, f[E] = w( m, p === v ? u._2 : u._1, function () {
                                return function () {
                                  delete f[E], D ? D = !1 : null === o ? r( p, null, null ) : r( p, o._1, o._2 )
                                }
                              } ), D ) return void ( D = !1 )
                          }
                          null === o ? u = null : ( u = o._1, o = o._2 )
                        }
                      }( e, r._2._1, r._2._2 )
                }
              }
            }
            return function () {
              var i, u, c = F,
                  f = e,
                  m = null,
                  h = null;
              n: for ( ;; )
                switch ( i = null, u = null, c ) {
                  case F:
                    switch ( f.tag ) {
                      case l:
                        m && ( h = new D( p, m, h ) ), m = new D( l, f._1, n, n ), f = f._2;
                        break;
                      case s:
                        m && ( h = new D( p, m, h ) ), m = new D( s, n, f._2, n ), f = f._1;
                        break;
                      case d:
                        m && ( h = new D( p, m, h ) ), m = new D( d, n, f._2, n ), f = f._1;
                        break;
                      default:
                        u = o++, c = P, i = f, f = new D( g, u, new D( p, m, h ), n ), ( i = k( t, r, i ) ).onComplete( { rethrow: !1, handler: E( f ) } )(), a[u] = i, r && r.register( i )
                    }
                    break;
                  case P:
                    if ( null === m ) break n;
                    m._1 === n ? ( m._1 = f, c = F, f = m._2, m._2 = n ) : ( m._2 = f, f = m, null === h ? m = null : ( m = h._1, h = h._2 ) )
                }
              for ( v = f, u = 0; u < o; u++ ) a[u].run()
            }(),
            function ( n ) {
              return new D( u, function ( r ) {
                return function () {
                  return function ( n, r ) {
                    var e;
                    for ( var i in h = t.left( n ), f )
                      if ( f.hasOwnProperty( i ) )
                        for ( i in e = f[i] ) e.hasOwnProperty( i ) && e[i]();
                    f = null;
                    var o = w( n, v, r );
                    return function ( n ) {
                      return new D( u, function () {
                        for ( var n in o ) o.hasOwnProperty( n ) && o[n]();
                        return C
                      } )
                    }
                  }( n, r )
                }
              } )
            }
          }

          // N: Transforms a sequential Aff into a parallel one.
          function N ( n, t, r ) {
            return new D( u, function ( e ) {
              return function () {
                return U( n, t, r, e )
              }
            } )
          }
          return D.EMPTY = n, D.Pure = E( t ), D.Throw = E( r ), D.Catch = E( e ), D.Sync = E( i ), D.Async = E( u ), D.Bind = E( o ), D.Bracket = E( a ), D.Fork = E( c ), D.Seq = E( f ), D.ParMap = E( l ), D.ParApply = E( s ), D.ParAlt = E( d ), D.Fiber = k, D.Supervisor = function ( n ) {
            var t = {},
                r = 0,
                e = 0;
            return {
              register: function ( n ) {
                var i = r++;
                n.onComplete( {
                  rethrow: !0,
                  handler: function ( n ) {
                    return function () {
                      e--, delete t[i]
                    }
                  }
                } ), t[i] = n, e++
              },
              isEmpty: function () { return 0 === e },
              killAll: function ( u, o ) {
                return function () {
                  var a = 0,
                      c = {};

                  function f ( r ) {
                    c[r] = t[r].kill( u, function ( t ) {
                      return function () {
                        delete c[r], a--, n.isLeft( t ) && n.fromLeft( t ) && setTimeout( function () { throw n.fromLeft( t ) }, 0 ), 0 === a && o()
                      }
                    } )()
                  }
                  for ( var l in t ) t.hasOwnProperty( l ) && ( a++, f( l ) );
                  return t = {}, r = 0, e = 0, function ( n ) {
                    return new D( i, function () {
                      for ( var n in c ) c.hasOwnProperty( n ) && c[n]();
                      return C
                    } )
                  }
                }
              }
            }
          }, D.Scheduler = b, D.nonCanceler = C, D
        }();

        // Effect.Aff namespace setup.
        n["Effect.Aff"] = n["Effect.Aff"] || {};
        n._pure = t.Pure;
        n._map = function ( n ) {
          return function ( r ) {
            return r.tag === t.Pure.tag ? t.Pure( n( r._1 ) ) : t.Bind( r, function ( r ) {
              return t.Pure( n( r ) )
            } )
          }
        };
        n._bind = function ( n ) { return function ( r ) { return t.Bind( n, r ) } };
        n._liftEffect = t.Sync;
        n._parAffMap = function ( n ) { return function ( r ) { return t.ParMap( n, r ) } };
        n._parAffApply = function ( n ) { return function ( r ) { return t.ParApply( n, r ) } };
        n.makeAff = t.Async;
        n._makeFiber = function ( n, r ) { return function () { return t.Fiber( n, null, r ) } };
        n._sequential = t.Seq;
      }( n["Effect.Aff"] = n["Effect.Aff"] || {} ),

      // --- Sub-module: Control.Parallel.Class ---
      function ( n ) {
        "use strict";
        n["Control.Parallel.Class"] = n["Control.Parallel.Class"] || {};
        var t = n["Control.Parallel.Class"];
        t.parallel = function ( n ) { return n.parallel; };
        t.sequential = function ( n ) { return n.sequential; };
        t.Parallel = function ( n, t, r, e ) {
          this.Applicative1 = n;
          this.Monad0 = t;
          this.parallel = r;
          this.sequential = e;
        };
      }( n ),

      // --- Sub-module: Data.Foldable (array folds) ---
      function ( n ) {
        "use strict";
        n.foldrArray = function ( n ) {
          return function ( t ) {
            return function ( r ) {
              for ( var e = t, i = r.length - 1; i >= 0; i-- ) e = n( r[i] )( e );
              return e;
            };
          };
        };
        n.foldlArray = function ( n ) {
          return function ( t ) {
            return function ( r ) {
              for ( var e = t, i = r.length, u = 0; u < i; u++ ) e = n( e )( r[u] );
              return e;
            };
          };
        };
      }( n["Data.Foldable"] = n["Data.Foldable"] || {} ),

      // --- Sub-module: Data.Semigroup ---
      function ( n ) {
        "use strict";
        n["Data.Semigroup"] = n["Data.Semigroup"] || {};
        var t = n["Data.Semigroup"];
        t.Semigroup = function ( n ) { this.append = n; };
        t.append = function ( n ) { return n.append; };
      }( n ),

      // --- Sub-module: Data.Foldable ---
      function ( n ) {
        "use strict";
        n["Data.Foldable"] = n["Data.Foldable"] || {};
        var t = n["Data.Foldable"],
            r = n["Data.Foldable"],
            e = n["Control.Applicative"],
            i = n["Control.Apply"],
            u = n["Data.Monoid"],
            o = n["Data.Semigroup"],
            a = n["Data.Unit"],
            c = function ( n, t, r ) { this.foldMap = n; this.foldl = t; this.foldr = r; },
            f = function ( n ) { return n.foldr; },
            l = function ( n ) {
              return function ( t ) {
                return function ( r ) {
                  return f( n )( function ( n ) {
                    return function ( e ) {
                      return o.append( t.Semigroup0() )( r( n ) )( e );
                    };
                  } )( u.mempty( t ) );
                };
              };
            },
            s = new c( function ( n ) { return l( s )( n ); }, r.foldlArray, r.foldrArray );
        t.Foldable = c;
        t.foldr = f;
        t.foldl = function ( n ) { return n.foldl; };
        t.foldMap = function ( n ) { return n.foldMap; };
        t.foldMapDefaultR = l;
        t.traverse_ = function ( n ) {
          return function ( t ) {
            return function ( r ) {
              return f( t )( function ( t ) {
                return i.applySecond( n.Apply0() )( r( t ) );
              } )( e.pure( n )( a.unit ) );
            };
          };
        };
        t.foldableArray = s;
      }( n ),

      // --- Sub-module: Control.Parallel ---
      function ( n ) {
        "use strict";
        n["Control.Parallel"] = n["Control.Parallel"] || {};
        var t = n["Control.Parallel"],
            r = n["Control.Category"],
            e = n["Control.Parallel.Class"],
            i = n["Data.Foldable"],
            u = function ( n ) {
              return function ( t ) {
                return function ( r ) {
                  return function ( u ) {
                    return e.sequential( n )( i.traverse_( n.Applicative1() )( t )( function ( t ) {
                      return e.parallel( n )( r( t ) );
                    } )( u ) );
                  };
                };
              };
            };
        t.parTraverse_ = u;
        t.parSequence_ = function ( n ) {
          return function ( t ) {
            return u( n )( t )( r.identity( r.categoryFn ) );
          };
        };
      }( n ),

      // --- Sub-module: Effect.Class ---
      function ( n ) {
        "use strict";
        n["Effect.Class"] = n["Effect.Class"] || {};
        var t = n["Effect.Class"];
        t.liftEffect = function ( n ) { return n.liftEffect; };
        t.MonadEffect = function ( n, t ) { this.Monad0 = n; this.liftEffect = t; };
      }( n ),

      // --- Sub-module: Partial.Unsafe (unsafePartial) ---
      function ( t ) {
        "use strict";
        ( n["Partial.Unsafe"] = n["Partial.Unsafe"] || {} ).unsafePartial = function ( n ) {
          return n();
        };
      }(),

      // --- Sub-module: Partial (crashWith) ---
      function ( t ) {
        "use strict";
        ( n["Partial"] = n["Partial"] || {} ).crashWith = function () {
          return function ( n ) {
            throw new Error( n );
          };
        };
      }(),

      // --- Sub-module: Partial (re-export) ---
      function ( n ) {
        "use strict";
        n.Partial = n.Partial || {};
        var t = n.Partial,
            r = n.Partial;
        t.crashWith = r.crashWith;
      }( n ),

      // --- Sub-module: Partial.Unsafe (unsafeCrashWith) ---
      function ( n ) {
        "use strict";
        n["Partial.Unsafe"] = n["Partial.Unsafe"] || {};
        var t = n["Partial.Unsafe"],
            r = n["Partial.Unsafe"],
            e = n.Partial;
        t.unsafeCrashWith = function ( n ) {
          return r.unsafePartial( function ( t ) {
            return e.crashWith( t )( n );
          } );
        };
      }( n ),

      // --- Sub-module: Unsafe.Coerce (unsafeCoerce) ---
      function ( t ) {
        "use strict";
        ( n["Unsafe.Coerce"] = n["Unsafe.Coerce"] || {} ).unsafeCoerce = function ( n ) {
          return n;
        };
      }(),

      // --- Sub-module: Unsafe.Coerce (re-export) ---
      function ( n ) {
        "use strict";
        n["Unsafe.Coerce"] = n["Unsafe.Coerce"] || {};
        var t = n["Unsafe.Coerce"],
            r = n["Unsafe.Coerce"];
        t.unsafeCoerce = r.unsafeCoerce;
      }( n ),

      // --- Sub-module: Effect.Aff (more definitions and instances) ---
      function ( n ) {
        "use strict";
        n["Effect.Aff"] = n["Effect.Aff"] || {};
        var t = n["Effect.Aff"],
            r = n["Effect.Aff"],
            e = n["Control.Applicative"],
            i = n["Control.Apply"],
            u = n["Control.Bind"],
            o = n["Control.Monad"],
            a = n["Control.Parallel"],
            c = n["Control.Parallel.Class"],
            f = n["Data.Either"],
            l = n["Data.Foldable"],
            s = n["Data.Function"],
            d = n["Data.Functor"],
            p = n["Data.Monoid"],
            m = n["Data.Semigroup"],
            h = n["Data.Unit"],
            v = n.Effect,
            w = n["Effect.Class"],
            g = n["Partial.Unsafe"],
            D = n["Unsafe.Coerce"],
            E = new d.Functor( r._parAffMap ),
            C = new d.Functor( r._map ),
            y = {
              isLeft: function ( n ) {
                if ( n instanceof f.Left ) return !0;
                if ( n instanceof f.Right ) return !1;
                throw new Error( "Failed pattern match at Effect.Aff (line 390, column 12 - line 392, column 20): " + [n.constructor.name] );
              },
              fromLeft: function ( n ) {
                if ( n instanceof f.Left ) return n.value0;
                if ( n instanceof f.Right ) return g.unsafeCrashWith( "unsafeFromLeft: Right" );
                throw new Error( "Failed pattern match at Effect.Aff (line 395, column 20 - line 399, column 3): " + [n.constructor.name] );
              },
              fromRight: function ( n ) {
                if ( n instanceof f.Right ) return n.value0;
                if ( n instanceof f.Left ) return g.unsafeCrashWith( "unsafeFromRight: Left" );
                throw new Error( "Failed pattern match at Effect.Aff (line 400, column 21 - line 402, column 31): " + [n.constructor.name] );
              },
              left: f.Left.create,
              right: f.Right.create
            },
            A = function ( n ) {
              return function () {
                var t = function ( n ) { return r._makeFiber( y, n ); }( n )();
                return t.run(), t;
              };
            },
            _ = new i.Apply( function () { return E; }, r._parAffApply ),
            b = new o.Monad( function () { return R; }, function () { return S; } ),
            S = new u.Bind( function () { return F; }, r._bind ),
            F = new i.Apply( function () { return C; }, o.ap( b ) ),
            R = new e.Applicative( function () { return F; }, r._pure ),
            B = new w.MonadEffect( function () { return b; }, r._liftEffect ),
            M = new c.Parallel( function () { return P; }, function () { return b; }, D.unsafeCoerce, r._sequential ),
            P = new e.Applicative( function () { return _; }, function ( n ) { return c.parallel( M )( e.pure( R )( n ) ); } ),
            I = new m.Semigroup( function ( n ) {
              return function ( t ) {
                return function ( r ) {
                  return a.parSequence_( M )( l.foldableArray )( [n( r ), t( r )] );
                };
              };
            } ),
            k = s.const( e.pure( R )( h.unit ) ),
            U = new p.Monoid( function () { return I; }, k );
        t.launchAff = A;
        t.launchAff_ = function ( n ) { return d.void( v.functorEffect )( A( n ) ); };
        t.nonCanceler = k;
        t.functorAff = C;
        t.applyAff = F;
        t.applicativeAff = R;
        t.bindAff = S;
        t.monadAff = b;
        t.monadEffectAff = B;
        t.functorParAff = E;
        t.applyParAff = _;
        t.applicativeParAff = P;
        t.parallelAff = M;
        t.semigroupCanceler = I;
        t.monoidCanceler = U;
        t.makeAff = r.makeAff;
      }( n ),

      // --- Sub-module: Effect.Ref (mutable references) ---
      function ( n ) {
        "use strict";
        n.new = function ( n ) { return function () { return { value: n }; }; };
        n.read = function ( n ) { return function () { return n.value; }; };
        n.write = function ( n ) { return function ( t ) { return function () { return t.value = n, {}; }; }; };
      }( n["Effect.Ref"] = n["Effect.Ref"] || {} ),

      // --- Sub-module: Effect.Ref (re-export) ---
      function ( n ) {
        "use strict";
        n["Effect.Ref"] = n["Effect.Ref"] || {};
        var t = n["Effect.Ref"],
            r = n["Effect.Ref"];
        t.new = r.new;
        t.read = r.read;
        t.write = r.write;
      }( n ),

      // --- Sub-module: Node.Encoding ---
      function ( n ) {
        "use strict";
        n["Node.Encoding"] = n["Node.Encoding"] || {};
        var t = n["Node.Encoding"],
            r = n["Data.Show"],
            e = function () { function n () {} return n.value = new n, n; }(),
            i = function () { function n () {} return n.value = new n, n; }(),
            u = function () { function n () {} return n.value = new n, n; }(),
            o = function () { function n () {} return n.value = new n, n; }(),
            a = function () { function n () {} return n.value = new n, n; }(),
            c = function () { function n () {} return n.value = new n, n; }(),
            f = function () { function n () {} return n.value = new n, n; }(),
            l = function () { function n () {} return n.value = new n, n; }(),
            s = new r.Show( function ( n ) {
              if ( n instanceof e ) return "ASCII";
              if ( n instanceof i ) return "UTF8";
              if ( n instanceof u ) return "UTF16LE";
              if ( n instanceof o ) return "UCS2";
              if ( n instanceof a ) return "Base64";
              if ( n instanceof c ) return "Latin1";
              if ( n instanceof f ) return "Binary";
              if ( n instanceof l ) return "Hex";
              throw new Error( "Failed pattern match at Node.Encoding (line 19, column 1 - line 19, column 39): " + [n.constructor.name] );
            } );
        t.ASCII = e;
        t.UTF8 = i;
        t.UTF16LE = u;
        t.UCS2 = o;
        t.Base64 = a;
        t.Latin1 = c;
        t.Binary = f;
        t.Hex = l;
        t.encodingToNode = function ( n ) {
          if ( n instanceof e ) return "ascii";
          if ( n instanceof i ) return "utf8";
          if ( n instanceof u ) return "utf16le";
          if ( n instanceof o ) return "ucs2";
          if ( n instanceof a ) return "base64";
          if ( n instanceof c ) return "latin1";
          if ( n instanceof f ) return "binary";
          if ( n instanceof l ) return "hex";
          throw new Error( "Failed pattern match at Node.Encoding (line 31, column 1 - line 31, column 37): " + [n.constructor.name] );
        };
        t.showEncoding = s;
      }( n ),

      // --- Sub-module: Node.Process (global process object) ---
      function ( t ) {
        "use strict";
        ( n["Node.Process"] = n["Node.Process"] || {} ).process = process;
      }(),

      // --- Sub-module: Node.Process (stdin, stdout) ---
      function ( n ) {
        "use strict";
        n["Node.Process"] = n["Node.Process"] || {};
        var t = n["Node.Process"],
            r = n["Node.Process"],
            e = r.process.stdout,
            i = r.process.stdin;
        t.stdin = i;
        t.stdout = e;
      }( n ),

      // --- Sub-module: Node.Stream (raw stream functions) ---
      function ( n ) {
        "use strict";
        n.readChunkImpl = function ( n ) {
          return function ( t ) {
            return function ( r ) {
              if ( r instanceof Buffer ) return t( r );
              if ( "string" === typeof r ) return n( r );
              throw new Error( "Node.Stream.readChunkImpl: Unrecognised chunk type; expected String or Buffer, got: " + r );
            };
          };
        };
        n.onDataEitherImpl = function ( n ) {
          return function ( t ) {
            return function ( r ) {
              return function () {
                t.on( "data", function ( t ) { r( n( t ) )(); } );
              };
            };
          };
        };
        n.onEnd = function ( n ) {
          return function ( t ) {
            return function () {
              n.on( "end", t );
            };
          };
        };
        n.write = function ( n ) {
          return function ( t ) {
            return function ( r ) {
              return function () {
                return n.write( t, null, r );
              };
            };
          };
        };
        n.writeStringImpl = function ( n ) {
          return function ( t ) {
            return function ( r ) {
              return function ( e ) {
                return function () {
                  return n.write( r, t, e );
                };
              };
            };
          };
        };
      }( n["Node.Stream"] = n["Node.Stream"] || {} ),

      // --- Sub-module: Effect.Exception (error handling) ---
      function ( n ) {
        "use strict";
        n.error = function ( n ) { return new Error( n ); };
        n.throwException = function ( n ) { return function () { throw n; }; };
      }( n["Effect.Exception"] = n["Effect.Exception"] || {} ),

      // --- Sub-module: Effect.Exception (throw) ---
      function ( n ) {
        "use strict";
        n["Effect.Exception"] = n["Effect.Exception"] || {};
        var t = n["Effect.Exception"],
            r = n["Effect.Exception"];
        t.throw = function ( n ) { return r.throwException( r.error( n ) ); };
      }( n ),

      // --- Sub-module: Node.Buffer (toStringImpl) ---
      function ( t ) {
        "use strict";
        ( n["Node.Buffer"] = n["Node.Buffer"] || {} ).toStringImpl = function ( n ) {
          return function ( t ) {
            return function () {
              return t.toString( n );
            };
          };
        };
      }(),

      // --- Sub-module: Node.Buffer (toString) ---
      function ( n ) {
        "use strict";
        n["Node.Buffer"] = n["Node.Buffer"] || {};
        var t = n["Node.Buffer"],
            r = n["Node.Buffer"],
            e = n["Node.Encoding"];
        t.toString = function ( n ) { return r.toStringImpl( e.encodingToNode( n ) ); };
      }( n ),

      // --- Sub-module: Node.Stream (higher-level stream functions) ---
      function ( n ) {
        "use strict";
        n["Node.Stream"] = n["Node.Stream"] || {};
        var t = n["Node.Stream"],
            r = n["Node.Stream"],
            e = n["Control.Applicative"],
            i = n["Control.Bind"],
            u = n["Data.Either"],
            o = n["Data.Show"],
            a = n.Effect,
            c = n["Effect.Exception"],
            f = n["Node.Buffer"],
            l = n["Node.Encoding"],
            s = r.readChunkImpl( u.Left.create )( u.Right.create ),
            d = function ( n ) {
              return function ( t ) {
                return r.onDataEitherImpl( s )( n )( t );
              };
            },
            p = function ( n ) {
              return function ( t ) {
                return d( n )( i.composeKleisliFlipped( a.bindEffect )( t )( function ( n ) {
                  if ( n instanceof u.Left ) return c.throw( "Stream encoding should not be set" );
                  if ( n instanceof u.Right ) return e.pure( a.applicativeEffect )( n.value0 );
                  throw new Error( "Failed pattern match at Node.Stream (line 94, column 5 - line 98, column 17): " + [n.constructor.name] );
                } ) );
              };
            };
        t.onData = p;
        t.onDataString = function ( n ) {
          return function ( t ) {
            return function ( r ) {
              return p( n )( i.composeKleisliFlipped( a.bindEffect )( r )( f.toString( t ) ) );
            };
          };
        };
        t.onDataEither = d;
        t.writeString = function ( n ) {
          return function ( t ) {
            return r.writeStringImpl( n )( o.show( l.showEncoding )( t ) );
          };
        };
        t.onEnd = r.onEnd;
      }( n ),

      // --- Sub-module: ABC095B (The main application logic) ---
      function ( n ) {
        "use strict";
        n.ABC095B = n.ABC095B || {};
        var t = n.ABC095B,
            r = n["Control.Applicative"],
            e = n["Control.Bind"],
            i = n["Control.Category"],
            u = n["Control.Monad.Rec.Class"],
            o = n["Data.Array"],
            a = n["Data.Bounded"],
            c = n["Data.Either"],
            f = n["Data.EuclideanRing"],
            l = n["Data.Functor"],
            s = n["Data.Int"],
            d = n["Data.Maybe"],
            p = n["Data.Monoid"],
            m = n["Data.Ord"],
            h = n["Data.Show"],
            v = n["Data.String.Common"],
            w = n["Data.Tuple"],
            g = n["Data.Unit"],
            D = n.Effect,
            E = n["Effect.Aff"],
            C = n["Effect.Class"],
            y = n["Effect.Ref"],
            A = n["Node.Encoding"],
            _ = n["Node.Process"],
            b = n["Node.Stream"],
            S = n["Partial.Unsafe"],
            F = E.makeAff( function ( n ) {
              return function () {
                // Create a mutable reference to store input data.
                var t = y.new( "" )();
                return b.onDataString( _.stdin )( A.UTF8.value )( function ( n ) {
                  return function () {
                    // Append incoming data to the ref.
                    var r = y.read( t )();
                    return y.write( r + n )( t )();
                  };
                } )(), b.onEnd( _.stdin )( function () {
                  // On end of input, read the final string and resolve the Aff.
                  var e = y.read( t )();
                  return n( r.pure( c.applicativeEither )( e ) )();
                } )(), p.mempty( E.monoidCanceler ); // Return a no-op canceller.
              };
            } ),
            R = function ( n ) {
              // Parse two integers separated by space from a string.
              var t = o.mapMaybe( s.fromString )( function ( n ) {
                return v.split( " " )( n );
              }( n ) );
              return 2 === t.length ? new d.Just( new w.Tuple( t[0], t[1] ) ) : d.Nothing.value;
            },
            B = function ( n ) {
              // Main solving logic for ABC095B.
              return c.either( function ( n ) {
                return S.unsafeCrashWith( n );
              } )( i.identity( i.categoryFn ) )( e.bind( c.bindEither )( c.note( "lines" )( o.uncons( ( t = n, v.split( "\n" )( v.trim( t ) ) ) ) ) )( function ( n ) {
                return e.bind( c.bindEither )( c.note( "n x" )( R( n.head ) ) )( function ( t ) {
                  var e, i = o.mapMaybe( s.fromString )( n.tail ); // Parse remaining lines as integers.
                  return r.pure( c.applicativeEither )( h.show( h.showInt )( ( e = t.value0,
                      function ( n ) {
                        return function ( t ) {
                          // Tail-recursive loop to calculate the result.
                          return u.tailRec( function ( r ) {
                            var i = o.index( t )( r.i );
                            if ( i instanceof d.Nothing ) return new u.Done( e + f.div( f.euclideanRingInt )( n - r["sum'"] | 0 )( r["min'"] ) | 0 );
                            if ( i instanceof d.Just ) return new u.Loop( {
                              i: r.i + 1 | 0,
                              "min'": m.min( m.ordInt )( r["min'"] )( i.value0 ),
                              "sum'": r["sum'"] + i.value0 | 0
                            } );
                            throw new Error( "Failed pattern match at ABC095B (line 76, column 7 - line 83, column 13): " + [i.constructor.name] );
                          } )( { i: 0, "min'": a.top( a.boundedInt ), "sum'": 0 } );
                        };
                      } )( t.value1 )( i ) ) + "\n" );
                } );
              } ) );
              var t
            },
            M = E.launchAff_( e.bind( E.bindAff )( F )( function ( n ) {
              return e.bind( E.bindAff )( r.pure( E.applicativeAff )( B( n ) ) )( function ( n ) {
                // Lift the effect to write the result to stdout.
                return C.liftEffect( E.monadEffectAff )( ( t = n, l.void( D.functorEffect )( b.writeString( _.stdout )( A.UTF8.value )( t )( r.pure( D.applicativeEffect )( g.unit ) ) ) ) );
                var t;
              } );
            } ) );
        t.main = M, t.solve = B;
      }( n ), n.ABC095B.main();
    }, {}
  ]
}, {}, ["Focm"], null);