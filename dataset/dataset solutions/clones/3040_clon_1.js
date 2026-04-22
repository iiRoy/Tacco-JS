parcelRequire = function ( e, r, t, n ) {
  // This is the main Parcel module loader function.
  // It takes four arguments:
  // e: An object containing module definitions.
  // r: The module cache.
  // t: An array of entry module IDs.
  // n: The global export name (if applicable).
  var i; // Variable to store the first encountered error, if any.

  // Check if `parcelRequire` is already defined globally.
  // This is used for sandboxing or nested bundles.
  var o = "function" == typeof parcelRequire && parcelRequire;

  // Check for the Node.js `require` function.
  // This allows loading native Node modules.
  var u = "function" == typeof require && require;


  // The core module loading and caching function.
  function f ( t, n ) {

    // Check if the module is already in the cache.
    if ( ! r[ t ] ) {

      // If the module is not in the cache, check if its definition exists in 'e'.
      if ( ! e[ t ] ) {
        // If the module definition is also missing, try alternative loading methods.

        // Re-check for a global `parcelRequire` for internal module resolution.
        var i = "function" == typeof parcelRequire && parcelRequire;

        // If not a dependency and a global `parcelRequire` exists, try loading with it.
        if ( ! n && i ) {
          return i( t, ! 0 );
        }

        // If a parent `parcelRequire` (from an outer bundle) exists, try loading with it.
        if ( o ) {
          return o( t, ! 0 );
        }

        // If Node.js `require` is available and the module name is a string, try loading.
        if ( u && "string" == typeof t ) {
          return u( t );
        }

        // If all attempts fail, construct and throw a "module not found" error.
        var c = new Error( "Cannot find module '" + t + "'" );
        c.code = "MODULE_NOT_FOUND";
        throw c;
      }

      // If the module definition exists, set up a resolver for its internal dependencies.
      p.resolve = function ( r ) {
        return e[ t ][ 1 ][ r ] || r;
      };

      // Initialize an empty cache for the module's own dependencies (not used in this structure).
      p.cache = {};

      // Create a new module instance and store it in the cache 'r'.
      var l = r[ t ] = new f.Module( t );

      // Execute the module's code.
      // The module function is `e[t][0]`.
      // It's called with `l.exports` as `this` and context, and `p` (local require),
      // `l` (module object), and `l.exports` (module exports) as arguments.
      e[ t ][ 0 ].call( l.exports, p, l, l.exports, this );
    }

    // Return the module's exported values from the cache.
    return r[ t ].exports;


    // Local `require` function for modules.
    function p ( e ) {
      // It resolves the module path and then calls the main `f` function to load it.
      return f( p.resolve( e ) );
    }
  }


  // Mark `f` as a Parcel `require` instance.
  f.isParcelRequire = ! 0;

  // Define the Module constructor.
  f.Module = function ( e ) {
    this.id = e;        // Module ID.
    this.bundle = f;    // Reference to the bundle's `require` function.
    this.exports = {};  // The exports object for the module.
  };

  // Attach module definitions and cache to the `f` function.
  f.modules = e;
  f.cache = r;
  f.parent = o; // Keep track of the parent `parcelRequire`.

  // A method to dynamically register new modules.
  f.register = function ( r, t ) {
    e[ r ] = [
      function ( e, r ) {
        r.exports = t;
      },
      {}
    ];
  };


  // Loop through the entry modules specified in 't' and load them.
  for ( var c = 0; c < t.length; c ++ ) {
    try {
      f( t[ c ] );
    } catch ( e ) {
      // If an error occurs during loading, store it if it's the first one.
      i || ( i = e );
    }
  }


  // If there are entry modules, handle their final exports.
  if ( t.length ) {
    // Get the exports of the last entry module.
    var l = f( t[ t.length - 1 ] );

    // Handle CommonJS / Node.js environment exports.
    if ( "object" == typeof exports && "undefined" != typeof module ) {
      module.exports = l;
    }
    // Handle AMD environment exports.
    else if ( "function" == typeof define && define.amd ) {
      define( function () {
        return l;
      } );
    }
    // Handle global variable assignment if a name 'n' is provided.
    else if ( n ) {
      this[ n ] = l;
    }
  }


  // Update the global `parcelRequire` to this bundle's `f` function.
  parcelRequire = f;

  // If any error occurred during the initial module loading, re-throw it.
  if ( i ) {
    throw i;
  }

  // Return the main module loading function.
  return f;

} ( { // Module definitions start here.

  // Module with ID "Focm"
  "Focm": [
    function ( require, module, exports ) {
      // The actual code for the module "Focm" starts here.

      // 't' will be the global context object for modules, usually `window` or `global`.
      var t = {};

      // Self-executing function to define 'Control.Semigroupoid' module.
      ! function ( t ) {
        "use strict"; // Enforce strict mode for this module.

        // Semigroupoid constructor.
        var n = function ( t ) {
          this.compose = t
        };

        // Semigroupoid instance for functions.
        var a = new n( function ( t ) {
          return function ( n ) {
            return function ( a ) {
              return t( n( a ) )
            }
          }
        } );

        // Export `compose` function.
        t.compose = function ( t ) {
          return t.compose
        };

        // Export the Semigroupoid constructor.
        t.Semigroupoid = n;

        // Export the Semigroupoid instance for functions.
        t.semigroupoidFn = a
      } ( t[ "Control.Semigroupoid" ] = t[ "Control.Semigroupoid" ] || {} );


      // Self-executing function to define 'Control.Category' module.
      ! function ( n ) {
        "use strict";

        // Import 'Control.Semigroupoid'.
        var a = t[ "Control.Semigroupoid" ];

        // Category constructor.
        var r = function ( t, n ) {
          this.Semigroupoid0 = t, this.identity = n
        };

        // Category instance for functions.
        var e = new r( function () {
          return a.semigroupoidFn
        }, function ( t ) {
          return t
        } );

        // Export Category constructor.
        n.Category = r;

        // Export `identity` function.
        n.identity = function ( t ) {
          return t.identity
        };

        // Export Category instance for functions.
        n.categoryFn = e
      } ( t[ "Control.Category" ] = t[ "Control.Category" ] || {} );


      // Self-executing function to define 'Data.Boolean' module.
      ! function ( n ) {
        "use strict";
        // Export `otherwise` boolean constant, which is always true.
        ( t[ "Data.Boolean" ] = t[ "Data.Boolean" ] || {} ).otherwise = ! 0
      } ();


      // Self-executing function to define 'Data.Function' module.
      ! function ( n ) {
        "use strict";

        // Import necessary modules (some are unused, possibly due to minification).
        t[ "Control.Category" ], t[ "Data.Boolean" ], t[ "Data.Ord" ], t[ "Data.Ring" ];

        // Export the `const` function (K combinator).
        n.const = function ( t ) {
          return function ( n ) {
            return t
          }
        }
      } ( t[ "Data.Function" ] = t[ "Data.Function" ] || {} );


      // Self-executing function to define 'Data.Functor' module.
      ! function ( n ) {
        "use strict";

        // Import necessary modules.
        t[ "Data.Functor" ], t[ "Control.Semigroupoid" ], t[ "Data.Function" ], t[ "Data.Unit" ];

        // Functor constructor.
        n.Functor = function ( t ) {
          this.map = t
        };

        // Export `map` function.
        n.map = function ( t ) {
          return t.map
        }
      } ( t[ "Data.Functor" ] = t[ "Data.Functor" ] || {} );


      // Self-executing function to define 'Control.Apply' module.
      ! function ( n ) {
        "use strict";

        // Import necessary modules.
        t[ "Control.Apply" ], t[ "Control.Category" ], t[ "Data.Function" ], t[ "Data.Functor" ];

        // Apply constructor.
        n.Apply = function ( t, n ) {
          this.Functor0 = t, this.apply = n
        };

        // Export `apply` function.
        n.apply = function ( t ) {
          return t.apply
        }
      } ( t[ "Control.Apply" ] = t[ "Control.Apply" ] || {} );


      // Self-executing function to define 'Control.Applicative' module.
      ! function ( n ) {
        "use strict";

        // Import necessary modules.
        t[ "Control.Apply" ], t[ "Data.Functor" ], t[ "Data.Unit" ];

        // Applicative constructor.
        n.Applicative = function ( t, n ) {
          this.Apply0 = t, this.pure = n
        };

        // Export `pure` function.
        n.pure = function ( t ) {
          return t.pure
        }
      } ( t[ "Control.Applicative" ] = t[ "Control.Applicative" ] || {} );


      // Self-executing function to define 'Control.Bind' module.
      ! function ( n ) {
        "use strict";

        // Import necessary modules.
        t[ "Control.Bind" ], t[ "Control.Applicative" ], t[ "Control.Apply" ], t[ "Control.Category" ], t[ "Data.Function" ], t[ "Data.Functor" ], t[ "Data.Unit" ];

        // Bind constructor.
        n.Bind = function ( t, n ) {
          this.Apply0 = t, this.bind = n
        };

        // Export `bind` function.
        n.bind = function ( t ) {
          return t.bind
        }
      } ( t[ "Control.Bind" ] = t[ "Control.Bind" ] || {} );


      // Self-executing function to define 'Data.Eq' module's `refEq`.
      ! function ( n ) {
        "use strict";
        // Export `refEq` for reference equality check.
        ( t[ "Data.Eq" ] = t[ "Data.Eq" ] || {} ).refEq = function ( t ) {
          return function ( n ) {
            return t === n
          }
        }
      } ();


      // Self-executing function to define 'Data.Eq' module.
      ! function ( n ) {
        "use strict";

        // Import `Data.Eq` (which contains `refEq`).
        var a = t[ "Data.Eq" ];

        // Unused imports / type class definition for `Eq`.
        var r = ( t[ "Data.HeytingAlgebra" ], t[ "Data.Symbol" ], t[ "Data.Unit" ], t[ "Data.Void" ], t[ "Record.Unsafe" ], t[ "Type.Data.RowList" ],
          function ( t ) {
            this.eq = t
          } );

        // Eq instance for characters (uses `refEq`).
        var e = new r( a.refEq );

        // Export Eq constructor.
        n.Eq = r;

        // Export `eq` function.
        n.eq = function ( t ) {
          return t.eq
        };

        // Export character equality instance.
        n.eqChar = e
      } ( t[ "Data.Eq" ] = t[ "Data.Eq" ] || {} );


      // Self-executing function to define 'Data.Show' module's `showIntImpl`.
      ! function ( n ) {
        "use strict";
        // Export `showIntImpl` for converting integers to strings.
        ( t[ "Data.Show" ] = t[ "Data.Show" ] || {} ).showIntImpl = function ( t ) {
          return t.toString()
        }
      } ();


      // Self-executing function to define 'Data.Show' module.
      ! function ( n ) {
        "use strict";

        // Import `Data.Show` (which contains `showIntImpl`).
        var a = t[ "Data.Show" ];

        // Unused imports / type class definition for `Show`.
        var r = ( t[ "Data.Symbol" ], t[ "Record.Unsafe" ], t[ "Type.Data.RowList" ],
          function ( t ) {
            this.show = t
          } );

        // Show instance for integers.
        var e = new r( a.showIntImpl );

        // Export Show constructor.
        n.Show = r;

        // Export `show` function.
        n.show = function ( t ) {
          return t.show
        };

        // Export integer show instance.
        n.showInt = e
      } ( t[ "Data.Show" ] = t[ "Data.Show" ] || {} );


      // Self-executing function to define 'Data.Maybe' module.
      ! function ( n ) {
        "use strict";

        // Import required modules.
        t[ "Control.Alt" ];
        var a = t[ "Control.Applicative" ];
        var r = t[ "Control.Apply" ];
        var e = t[ "Control.Bind" ];

        // Various unused imports, or imports kept by minifier for consistency.
        var o = ( t[ "Control.Category" ], t[ "Control.Extend" ], t[ "Control.Monad" ], t[ "Control.MonadZero" ], t[ "Control.Plus" ], t[ "Data.Bounded" ], t[ "Data.Eq" ], t[ "Data.Function" ] );
        var i = t[ "Data.Functor" ];

        // The `Nothing` constructor object.
        // It's a singleton to represent the absence of a value.
        var u = ( t[ "Data.Functor.Invariant" ], t[ "Data.Monoid" ], t[ "Data.Ord" ], t[ "Data.Ordering" ], t[ "Data.Semigroup" ], t[ "Data.Show" ], t[ "Data.Unit" ], t.Prelude,
          function () {
            function t () {}
            return t.value = new t(), t;
          } () );

        // The `Just` constructor function.
        // It wraps a value.
        var c = function () {
          function t ( t ) {
            this.value0 = t;
          }
          return t.create = function ( n ) {
            return new t( n );
          }, t;
        } ();

        // The `maybe` function: takes a default value, a function for `Just`, and a Maybe value.
        var l = function ( t ) {
          return function ( n ) {
            return function ( a ) {
              if ( a instanceof u ) {
                return t; // If `Nothing`, return the default value.
              }
              if ( a instanceof c ) {
                return n( a.value0 ); // If `Just`, apply the function to the wrapped value.
              }
              // This error should ideally not be reached with proper type checking.
              throw new Error( "Failed pattern match at Data.Maybe (line 217, column 1 - line 217, column 51): " + [ t.constructor.name, n.constructor.name, a.constructor.name ] );
            }
          }
        };

        // The `isNothing` function: checks if a Maybe value is `Nothing`.
        // It uses the `maybe` function with `true` as default and `const false` for `Just`.
        var f = l( ! 0 )( o.const( ! 1 ) );

        // Functor instance for `Maybe`.
        var s = new i.Functor( function ( t ) {
          return function ( n ) {
            return n instanceof c ? new c( t( n.value0 ) ) : u.value;
          }
        } );

        // Apply instance for `Maybe`.
        var D = new r.Apply( function () {
          return s;
        }, function ( t ) {
          return function ( n ) {
            if ( t instanceof c ) {
              return i.map( s )( t.value0 )( n );
            }
            if ( t instanceof u ) {
              return u.value;
            }
            throw new Error( "Failed pattern match at Data.Maybe (line 67, column 1 - line 67, column 35): " + [ t.constructor.name, n.constructor.name ] );
          }
        } );

        // Bind instance for `Maybe`.
        var d = new e.Bind( function () {
          return D;
        }, function ( t ) {
          return function ( n ) {
            if ( t instanceof c ) {
              return n( t.value0 );
            }
            if ( t instanceof u ) {
              return u.value;
            }
            throw new Error( "Failed pattern match at Data.Maybe (line 125, column 1 - line 125, column 33): " + [ t.constructor.name, n.constructor.name ] );
          }
        } );


        // Export the constructors and type class instances.
        n.Nothing = u;
        n.Just = c;
        n.maybe = l;
        n.isNothing = f;

        // The `fromJust` function: extracts the value from a `Just` or throws an error for `Nothing`.
        n.fromJust = function ( t ) {
          return function ( t ) {
            if ( t instanceof c ) {
              return t.value0;
            }
            throw new Error( "Failed pattern match at Data.Maybe (line 268, column 1 - line 268, column 46): " + [ t.constructor.name ] );
          }
        };

        n.functorMaybe = s;
        n.applyMaybe = D;
        n.bindMaybe = d;

      } ( t[ "Data.Maybe" ] = t[ "Data.Maybe" ] || {} );


      // Self-executing function to define 'Data.Either' module.
      ! function ( n ) {
        "use strict";

        // Import required modules.
        t[ "Control.Alt" ];
        var a = t[ "Control.Applicative" ];
        var r = t[ "Control.Apply" ];
        var e = t[ "Control.Bind" ];

        // Various unused imports.
        var o = ( t[ "Control.Extend" ], t[ "Control.Monad" ], t[ "Control.Semigroupoid" ], t[ "Data.Bifoldable" ], t[ "Data.Bifunctor" ], t[ "Data.Bitraversable" ], t[ "Data.Bounded" ], t[ "Data.Eq" ], t[ "Data.Foldable" ], t[ "Data.FoldableWithIndex" ], t[ "Data.Function" ], t[ "Data.Functor" ] );
        var i = ( t[ "Data.Functor.Invariant" ], t[ "Data.FunctorWithIndex" ], t[ "Data.Maybe" ] );

        // More unused imports / prelude reference.
        var u = ( t[ "Data.Monoid" ], t[ "Data.Ord" ], t[ "Data.Ordering" ], t[ "Data.Semigroup" ], t[ "Data.Show" ], t[ "Data.Traversable" ], t[ "Data.TraversableWithIndex" ], t[ "Data.Unit" ], t.Prelude,
          // The `Left` constructor function.
          function () {
            function t ( t ) {
              this.value0 = t;
            }
            return t.create = function ( n ) {
              return new t( n );
            }, t;
          } () );

        // The `Right` constructor function.
        var c = function () {
          function t ( t ) {
            this.value0 = t;
          }
          return t.create = function ( n ) {
            return new t( n );
          }, t;
        } ();

        // Functor instance for `Either`.
        var l = new o.Functor( function ( t ) {
          return function ( n ) {
            if ( n instanceof u ) {
              return new u( n.value0 ); // Left values are unchanged.
            }
            if ( n instanceof c ) {
              return new c( t( n.value0 ) ); // Right values are mapped.
            }
            throw new Error( "Failed pattern match at Data.Either (line 38, column 8 - line 38, column 52): " + [ n.constructor.name ] );
          }
        } );

        // The `either` function: takes two functions and an `Either` value.
        var f = function ( t ) {
          return function ( n ) {
            return function ( a ) {
              if ( a instanceof u ) {
                return t( a.value0 ); // If `Left`, apply the first function.
              }
              if ( a instanceof c ) {
                return n( a.value0 ); // If `Right`, apply the second function.
              }
              throw new Error( "Failed pattern match at Data.Either (line 238, column 1 - line 238, column 64): " + [ t.constructor.name, n.constructor.name, a.constructor.name ] );
            }
          }
        };

        // Apply instance for `Either`.
        var s = new r.Apply( function () {
          return l;
        }, function ( t ) {
          return function ( n ) {
            if ( t instanceof u ) {
              return new u( t.value0 ); // If `Left`, propagate the Left value.
            }
            if ( t instanceof c ) {
              return o.map( l )( t.value0 )( n ); // If `Right`, apply the function inside.
            }
            throw new Error( "Failed pattern match at Data.Either (line 82, column 1 - line 82, column 41): " + [ t.constructor.name, n.constructor.name ] );
          }
        } );

        // Bind instance for `Either`.
        var D = new e.Bind( function () {
          return s;
        }, f( function ( t ) {
          return function ( n ) {
            return new u( t ); // If `Left`, propagate the Left value.
          }
        } )( function ( t ) {
          return function ( n ) {
            return n( t ); // If `Right`, apply the function.
          }
        } ) );

        // Applicative instance for `Either`.
        var d = new a.Applicative( function () {
          return s;
        }, c.create );


        // Export constructors and functions.
        n.Left = u;
        n.Right = c;
        n.either = f;

        // The `note` function: converts a `Maybe` to an `Either`.
        n.note = function ( t ) {
          return i.maybe( new u( t ) )( c.create );
        };

        n.functorEither = l;
        n.applyEither = s;
        n.applicativeEither = d;
        n.bindEither = D;

      } ( t[ "Data.Either" ] = t[ "Data.Either" ] || {} );


      // Self-executing function to define 'Partial.Unsafe' module.
      ! function ( n ) {
        "use strict";
        // Export `unsafePartial` function, which simply executes its argument.
        ( t[ "Partial.Unsafe" ] = t[ "Partial.Unsafe" ] || {} ).unsafePartial = function ( t ) {
          return t()
        }
      } ();


      // Self-executing function to define 'Partial' module's `crashWith`.
      ! function ( n ) {
        "use strict";
        // Export `crashWith` function, which throws an error with a given message.
        ( t[ "Partial" ] = t[ "Partial" ] || {} ).crashWith = function () {
          return function ( t ) {
            throw new Error( t )
          }
        }
      } ();


      // Self-executing function to define 'Partial' module.
      ! function ( n ) {
        "use strict";

        // Import `Partial` (which contains `crashWith`).
        var a = t.Partial;

        // Export `crashWith` (re-export).
        n.crashWith = a.crashWith
      } ( t.Partial = t.Partial || {} );


      // Self-executing function to define 'Partial.Unsafe' module's `unsafeCrashWith`.
      ! function ( n ) {
        "use strict";

        // Import `Partial.Unsafe` and `Partial`.
        var a = t[ "Partial.Unsafe" ];
        var r = t.Partial;

        // Export `unsafeCrashWith` function, which crashes the program.
        n.unsafeCrashWith = function ( t ) {
          return a.unsafePartial( function ( n ) {
            return r.crashWith( n )( t )
          } )
        }
      } ( t[ "Partial.Unsafe" ] = t[ "Partial.Unsafe" ] || {} );


      // Self-executing function to define 'Control.Monad.Rec.Class' module.
      ! function ( n ) {
        "use strict";

        // Import various modules.
        t[ "Control.Applicative" ], t[ "Control.Bind" ], t[ "Control.Monad" ], t[ "Control.Semigroupoid" ], t[ "Data.Bifunctor" ], t[ "Data.Either" ], t[ "Data.Functor" ], t[ "Data.Identity" ], t[ "Data.Maybe" ], t[ "Data.Unit" ], t.Effect, t[ "Effect.Ref" ], t[ "Partial.Unsafe" ], t.Prelude;

        // `Loop` constructor for `TailRec` monad.
        var a = function () {
          function t ( t ) {
            this.value0 = t;
          }
          return t.create = function ( n ) {
            return new t( n );
          }, t;
        } ();

        // `Done` constructor for `TailRec` monad.
        var r = function () {
          function t ( t ) {
            this.value0 = t;
          }
          return t.create = function ( n ) {
            return new t( n );
          }, t;
        } ();

        // Export constructors.
        n.Loop = a;
        n.Done = r;

        // The `tailRec` function for stack-safe recursion.
        n.tailRec = function ( t ) {
          return function ( n ) {
            return function ( n ) { // Inner 'n' shadows outer 'n' (initial state).
              var e, o = ! 1; // `e` for result, `o` for loop termination flag.

              function i ( e ) {
                if ( ! ( e instanceof a ) ) { // If not a `Loop` (i.e., it's `Done`).
                  if ( e instanceof r ) {
                    return o = ! 0, e.value0; // Set termination flag and return value.
                  }
                  throw new Error( "Failed pattern match at Control.Monad.Rec.Class (line 91, column 3 - line 91, column 25): " + [ e.constructor.name ] );
                }
                n = t( e.value0 ); // If `Loop`, update state and continue.
              }

              // The actual loop.
              for ( ; ! o; ) {
                e = i( n );
              }
              return e;

            } ( t( n ) ); // Initial call to `t` with the starting state.
          }
        };

      } ( t[ "Control.Monad.Rec.Class" ] = t[ "Control.Monad.Rec.Class" ] || {} );


      // Self-executing function to define 'Data.Array' module's JavaScript implementations.
      ! function ( t ) {
        "use strict";

        // `length` implementation for arrays.
        t.length = function ( t ) {
          return t.length
        };

        // `indexImpl` for safe array indexing.
        t.indexImpl = function ( t ) {
          return function ( n ) {
            return function ( a ) {
              return function ( r ) {
                return r < 0 || r >= a.length ? n : t( a[ r ] )
              }
            }
          }
        };

        // `filter` implementation for arrays.
        t.filter = function ( t ) {
          return function ( n ) {
            return n.filter( t )
          }
        };

        // `slice` implementation for arrays.
        t.slice = function ( t ) {
          return function ( n ) {
            return function ( a ) {
              return a.slice( t, n )
            }
          }
        };

        // `drop` implementation for arrays.
        t.drop = function ( t ) {
          return function ( n ) {
            return t < 1 ? n : n.slice( t )
          }
        };

      } ( t[ "Data.Array" ] = t[ "Data.Array" ] || {} );


      // Self-executing function to define 'Data.Tuple' module.
      ! function ( n ) {
        "use strict";

        // Import various modules (mostly unused in this specific block).
        t[ "Control.Applicative" ], t[ "Control.Apply" ], t[ "Control.Biapplicative" ], t[ "Control.Biapply" ], t[ "Control.Bind" ], t[ "Control.Comonad" ], t[ "Control.Extend" ], t[ "Control.Lazy" ], t[ "Control.Monad" ], t[ "Control.Semigroupoid" ], t[ "Data.Bifoldable" ], t[ "Data.Bifunctor" ], t[ "Data.Bitraversable" ], t[ "Data.BooleanAlgebra" ], t[ "Data.Bounded" ], t[ "Data.CommutativeRing" ], t[ "Data.Distributive" ], t[ "Data.Eq" ], t[ "Data.Foldable" ], t[ "Data.FoldableWithIndex" ], t[ "Data.Function" ], t[ "Data.Functor" ], t[ "Data.Functor.Invariant" ], t[ "Data.FunctorWithIndex" ], t[ "Data.HeytingAlgebra" ], t[ "Data.Maybe" ], t[ "Data.Maybe.First" ], t[ "Data.Monoid" ], t[ "Data.Newtype" ], t[ "Data.Ord" ], t[ "Data.Ordering" ], t[ "Data.Ring" ], t[ "Data.Semigroup" ], t[ "Data.Semigroup.Foldable" ], t[ "Data.Semigroup.Traversable" ], t[ "Data.Semiring" ], t[ "Data.Show" ], t[ "Data.Traversable" ], t[ "Data.TraversableWithIndex" ], t[ "Data.Unit" ], t.Prelude, t[ "Type.Equality" ];

        // The `Tuple` constructor function.
        var a = function () {
          function t ( t, n ) {
            this.value0 = t, this.value1 = n;
          }
          return t.create = function ( n ) {
            return function ( a ) {
              return new t( n, a );
            };
          }, t;
        } ();

        // Export the `Tuple` constructor.
        n.Tuple = a;

      } ( t[ "Data.Tuple" ] = t[ "Data.Tuple" ] || {} );


      // Self-executing function to define 'Unsafe.Coerce' module.
      ! function ( n ) {
        "use strict";
        // Export `unsafeCoerce` function, which performs unchecked type coercion.
        ( t[ "Unsafe.Coerce" ] = t[ "Unsafe.Coerce" ] || {} ).unsafeCoerce = function ( t ) {
          return t
        }
      } ();


      // Self-executing function to re-export 'Unsafe.Coerce'.
      ! function ( n ) {
        "use strict";

        // Import `Unsafe.Coerce`.
        var a = t[ "Unsafe.Coerce" ];

        // Re-export `unsafeCoerce`.
        n.unsafeCoerce = a.unsafeCoerce
      } ( t[ "Unsafe.Coerce" ] = t[ "Unsafe.Coerce" ] || {} );


      // Self-executing function to define 'Data.Array' module (higher-level functions).
      ! function ( n ) {
        "use strict";

        // Import `Data.Array` (JS implementations) and `Data.Maybe`.
        var a = t[ "Data.Array" ];
        var r = ( t[ "Control.Alt" ], t[ "Control.Alternative" ], t[ "Control.Applicative" ], t[ "Control.Apply" ], t[ "Control.Bind" ], t[ "Control.Category" ], t[ "Control.Lazy" ], t[ "Control.Monad.Rec.Class" ], t[ "Control.Monad.ST" ], t[ "Control.Monad.ST.Internal" ], t[ "Control.Semigroupoid" ], t[ "Data.Array.NonEmpty.Internal" ], t[ "Data.Array.ST" ], t[ "Data.Array.ST.Iterator" ], t[ "Data.Boolean" ], t[ "Data.Eq" ], t[ "Data.Foldable" ], t[ "Data.Function" ], t[ "Data.Functor" ], t[ "Data.HeytingAlgebra" ], t[ "Data.Maybe" ] );

        // Various unused imports.
        var e = ( t[ "Data.Ord" ], t[ "Data.Ordering" ], t[ "Data.Ring" ], t[ "Data.Semigroup" ], t[ "Data.Semiring" ], t[ "Data.Traversable" ], t[ "Data.Tuple" ], t[ "Data.Unfoldable" ], t[ "Partial.Unsafe" ], t.Prelude, t[ "Unsafe.Coerce" ],
          // `index` function with `Maybe` return type.
          a.indexImpl( r.Just.create )( r.Nothing.value ) );

        // Export `head` function (get first element as `Maybe`).
        n.head = function ( t ) {
          return e( t )( 0 )
        };

        // Export `index` function (get element at index as `Maybe`).
        n.index = e;

        // Export `length` from underlying JS implementation.
        n.length = a.length;

        // Export `filter` from underlying JS implementation.
        n.filter = a.filter;

        // Export `drop` from underlying JS implementation.
        n.drop = a.drop;

      } ( t[ "Data.Array" ] = t[ "Data.Array" ] || {} );


      // Self-executing function to define 'Data.Int' module's `fromStringAsImpl`.
      ! function ( n ) {
        "use strict";
        // Export `fromStringAsImpl` for parsing integers from strings with a given radix.
        ( t[ "Data.Int" ] = t[ "Data.Int" ] || {} ).fromStringAsImpl = function ( t ) {
          return function ( n ) {
            return function ( a ) {
              var r;
              // Dynamically create a regex pattern based on radix.
              r = a < 11 ? "[0-" + ( a - 1 ).toString() + "]" : 11 === a ? "[0-9a]" : "[0-9a-" + String.fromCharCode( 86 + a ) + "]";
              var e = new RegExp( "^[\\+\\-]?" + r + "+$", "i" );

              return function ( r ) {
                if ( e.test( r ) ) {
                  var o = parseInt( r, a );
                  return ( 0 | o ) === o ? t( o ) : n; // Check for integer overflow/validity.
                }
                return n; // If regex doesn't match, return Nothing.
              }
            }
          }
        }
      } ();


      // Self-executing function to define 'Data.Int' module (higher-level functions).
      ! function ( n ) {
        "use strict";

        // Import `Data.Int` (JS implementations) and `Data.Maybe`.
        var a = t[ "Data.Int" ];
        var r = ( t[ "Control.Category" ], t[ "Control.Semigroupoid" ], t[ "Data.Boolean" ], t[ "Data.Bounded" ], t[ "Data.CommutativeRing" ], t[ "Data.DivisionRing" ], t[ "Data.Eq" ], t[ "Data.EuclideanRing" ], t[ "Data.HeytingAlgebra" ], t[ "Data.Int.Bits" ], t[ "Data.Maybe" ] );

        // Various unused imports.
        var e = ( t[ "Data.Ord" ], t[ "Data.Ordering" ], t[ "Data.Ring" ], t[ "Data.Semiring" ], t[ "Data.Show" ], t.Global, t.Math, t.Prelude,
          // `fromStringAs` function, using `Maybe` for success/failure.
          a.fromStringAsImpl( r.Just.create )( r.Nothing.value ) );

        // `fromString` for base 10 integers.
        var o = e( 10 );

        // Export `fromString` and `fromStringAs`.
        n.fromString = o;
        n.fromStringAs = e;

      } ( t[ "Data.Int" ] = t[ "Data.Int" ] || {} );


      // Self-executing function to define 'Data.String.CodeUnits' module's JavaScript implementations.
      ! function ( t ) {
        "use strict";

        // `toCharArray` implementation.
        t.toCharArray = function ( t ) {
          return t.split( "" )
        };

        // `length` implementation.
        t.length = function ( t ) {
          return t.length
        };

        // `_indexOf'` (internal indexOf) implementation.
        t[ "_indexOf'" ] = function ( t ) {
          return function ( n ) {
            return function ( a ) {
              return function ( r ) {
                return function ( e ) {
                  if ( r < 0 || r > e.length ) {
                    return n;
                  }
                  var o = e.indexOf( a, r );
                  return - 1 === o ? n : t( o );
                }
              }
            }
          }
        };

        // `_slice` (internal slice) implementation.
        t._slice = function ( t ) {
          return function ( n ) {
            return function ( a ) {
              return a.slice( t, n )
            }
          }
        };

      } ( t[ "Data.String.CodeUnits" ] = t[ "Data.String.CodeUnits" ] || {} );


      // Self-executing function to define 'Data.String.CodeUnits' module (higher-level functions).
      ! function ( n ) {
        "use strict";

        // Import `Data.String.CodeUnits` (JS implementations) and `Data.Maybe`.
        var a = t[ "Data.String.CodeUnits" ];
        var r = ( t[ "Control.Semigroupoid" ], t[ "Data.Boolean" ] );

        // Various unused imports.
        var e = ( t[ "Data.Eq" ], t[ "Data.Function" ], t[ "Data.HeytingAlgebra" ], t[ "Data.Maybe" ] );

        // More unused imports.
        var o = ( t[ "Data.Ord" ], t[ "Data.Ring" ], t[ "Data.Semiring" ], t[ "Data.String.Pattern" ], t[ "Data.String.Unsafe" ], t.Prelude,
          // `indexOf'` function, using `Maybe` for result.
          a[ "_indexOf'" ]( e.Just.create )( e.Nothing.value ) );

        // Export `indexOf'`.
        n[ "indexOf'" ] = o;

        // `slice` function with `Maybe` return type and boundary checks.
        n.slice = function ( t ) {
          return function ( n ) {
            return function ( o ) {
              var i = a.length( o );
              // Helper to normalize negative indices.
              var u = function ( t ) {
                if ( t < 0 ) {
                  return i + t | 0;
                }
                if ( r.otherwise ) { // `Data.Boolean.otherwise` is true.
                  return t;
                }
                throw new Error( "Failed pattern match at Data.String.CodeUnits (line 314, column 5 - line 315, column 27): " + [ t.constructor.name ] );
              };
              var c = u( n ); // Normalized end index.
              var l = u( t ); // Normalized start index.

              // Return `Nothing` if indices are out of bounds or invalid.
              return l < 0 || l >= i || c < 0 || c > i || l > c ? e.Nothing.value : new e.Just( a._slice( t )( n )( o ) );
            }
          }
        };

        // Export `toCharArray` and `length`.
        n.toCharArray = a.toCharArray;
        n.length = a.length;

      } ( t[ "Data.String.CodeUnits" ] = t[ "Data.String.CodeUnits" ] || {} );


      // Self-executing function to define 'Data.String.Common' module's JavaScript implementations.
      ! function ( t ) {
        "use strict";

        // `split` implementation.
        t.split = function ( t ) {
          return function ( n ) {
            return n.split( t )
          }
        };

        // `trim` implementation.
        t.trim = function ( t ) {
          return t.trim()
        };

      } ( t[ "Data.String.Common" ] = t[ "Data.String.Common" ] || {} );


      // Self-executing function to define 'Data.String.Common' module (higher-level functions).
      ! function ( n ) {
        "use strict";

        // Import `Data.String.Common` (JS implementations).
        var a = t[ "Data.String.Common" ];

        // Unused imports.
        t[ "Data.Eq" ], t[ "Data.Ordering" ], t[ "Data.String.Pattern" ], t.Prelude;

        // Export `split` and `trim`.
        n.split = a.split;
        n.trim = a.trim;

      } ( t[ "Data.String.Common" ] = t[ "Data.String.Common" ] || {} );


      // Self-executing function to define 'AtCoder.Tenka12019Beginner.C' module.
      ! function ( n ) {
        "use strict";

        // Import necessary modules for the problem solution.
        var a = t[ "Control.Applicative" ];
        var r = t[ "Control.Bind" ];
        var e = t[ "Control.Category" ];
        var o = t[ "Control.Monad.Rec.Class" ];
        var i = t[ "Data.Array" ];
        var u = t[ "Data.Either" ];
        var c = t[ "Data.Eq" ];
        var l = t[ "Data.Int" ];
        var f = t[ "Data.Maybe" ];
        var s = ( t[ "Data.Semiring" ], t[ "Data.Show" ] );
        var D = ( t[ "Data.String" ], t[ "Data.String.CodeUnits" ] );
        var d = t[ "Data.String.Common" ];
        var p = ( t[ "Data.String.Pattern" ], t[ "Data.Tuple" ] );
        var C = t[ "Partial.Unsafe" ];

        t.Prelude; // Import Prelude.

        // The main `solve` function for the AtCoder problem.
        n.solve = function ( t ) {
          return u.either(
            function ( t ) {
              return C.unsafeCrashWith( t ); // If Left, crash with the error message.
            }
          )(
            e.identity( e.categoryFn ) // If Right, return the value unchanged.
          )(
            ( n = d.split( "\n" )( d.trim( t ) ), // Split input string by newlines after trimming.
              r.bind( u.bindEither )(
                u.note( "n" )( r.bind( f.bindMaybe )( i.head( n ) )( l.fromString ) ) // Parse 'n' (first line) as an integer.
              )(
                function ( t ) {
                  return r.bind( u.bindEither )(
                    u.note( "s" )( i.head( i.drop( 1 )( n ) ) ) // Get 's' (second line) as a string.
                  )(
                    function ( t ) {
                      return a.pure( u.applicativeEither )(
                        s.show( s.showInt )(
                          // Perform the main logic using `tailRec`.
                          ( n = t,
                            o.tailRec( function ( t ) {
                              var a = D[ "indexOf'" ]( "#." )( t.value0 )( n ); // Find "#." pattern.
                              if ( a instanceof f.Nothing ) {
                                return new o.Done( t.value1 ); // No more "#." found, end recursion.
                              }
                              if ( a instanceof f.Just ) {
                                // Check if there's another "#." after skipping two chars (for current "#.").
                                return f.isNothing( D[ "indexOf'" ]( "#." )( a.value0 + 2 | 0 )( n ) ) ?
                                  new o.Loop( new p.Tuple( a.value0 + 1 | 0, t.value1 + 1 | 0 ) ) : // If only one "#." pattern, flip it.
                                  new o.Done( t.value1 + i.length( i.filter( c.eq( c.eqChar )( "." ) )( D.toCharArray( f.fromJust()( D.slice( a.value0 + 1 | 0 )( D.length( n ) )( n ) ) ) ) ) | 0 ); // If more, calculate flips needed for the rest.
                              }
                              // Pattern match failure fallback.
                              throw new Error( "Failed pattern match at AtCoder.Tenka12019Beginner.C (line 30, column 7 - line 37, column 177): " + [ a.constructor.name ] );
                            } )( new p.Tuple( 0, 0 ) ) // Initial state for tailRec: (current index, flips count).
                          )
                      );
                    }
                  );
                }
              )
            )
          );
          var n; // Declare 'n' for the outer scope.
        };

      } ( t[ "AtCoder.Tenka12019Beginner.C" ] = t[ "AtCoder.Tenka12019Beginner.C" ] || {} );


      // Self-executing function to define 'Effect.Console' module's `log`.
      ! function ( n ) {
        "use strict";
        // Export `log` function for console output.
        ( t[ "Effect.Console" ] = t[ "Effect.Console" ] || {} ).log = function ( t ) {
          return function () {
            return console.log( t ), {}; // Log and return an empty object (Unit).
          }
        }
      } ();


      // Self-executing function to re-export 'Effect.Console'.
      ! function ( n ) {
        "use strict";

        // Import `Effect.Console`.
        var a = t[ "Effect.Console" ];

        // Unused imports.
        t[ "Data.Show" ], t[ "Data.Unit" ], t.Effect;

        // Re-export `log`.
        n.log = a.log;

      } ( t[ "Effect.Console" ] = t[ "Effect.Console" ] || {} );


      // Self-executing function to define 'Node.Encoding' module.
      ! function ( n ) {
        "use strict";

        // Import `Node.Encoding` (empty) and `Data.Show`.
        t[ "Node.Encoding" ];
        var a = t[ "Data.Show" ];

        // Unused prelude import.
        var r = ( t.Prelude,
          function () {
            function t () {}
            return t.value = new t(), t;
          } () ); // ASCII encoding constant.

        var e = function () {
          function t () {}
          return t.value = new t(), t;
        } (); // UTF8 encoding constant.

        var o = function () {
          function t () {}
          return t.value = new t(), t;
        } (); // UTF16LE encoding constant.

        var i = function () {
          function t () {}
          return t.value = new t(), t;
        } (); // UCS2 encoding constant.

        var u = function () {
          function t () {}
          return t.value = new t(), t;
        } (); // Base64 encoding constant.

        var c = function () {
          function t () {}
          return t.value = new t(), t;
        } (); // Latin1 encoding constant.

        var l = function () {
          function t () {}
          return t.value = new t(), t;
        } (); // Binary encoding constant.

        var f = function () {
          function t () {}
          return t.value = new t(), t;
        } (); // Hex encoding constant.

        // Show instance for `Encoding` types.
        var s = new a.Show( function ( t ) {
          if ( t instanceof r ) {
            return "ASCII";
          }
          if ( t instanceof e ) {
            return "UTF8";
          }
          if ( t instanceof o ) {
            return "UTF16LE";
          }
          if ( t instanceof i ) {
            return "UCS2";
          }
          if ( t instanceof u ) {
            return "Base64";
          }
          if ( t instanceof c ) {
            return "Latin1";
          }
          if ( t instanceof l ) {
            return "Binary";
          }
          if ( t instanceof f ) {
            return "Hex";
          }
          // Pattern match failure fallback.
          throw new Error( "Failed pattern match at Node.Encoding (line 19, column 1 - line 19, column 39): " + [ t.constructor.name ] );
        } );

        // Export all encoding constants.
        n.ASCII = r;
        n.UTF8 = e;
        n.UTF16LE = o;
        n.UCS2 = i;
        n.Base64 = u;
        n.Latin1 = c;
        n.Binary = l;
        n.Hex = f;

        // Export the Show instance.
        n.showEncoding = s;

      } ( t[ "Node.Encoding" ] = t[ "Node.Encoding" ] || {} );


      // Self-executing function to define 'Node.FS.Internal' module.
      ! function ( n ) {
        "use strict";
        // Export `unsafeRequireFS` to get the Node.js `fs` module.
        ( t[ "Node.FS.Internal" ] = t[ "Node.FS.Internal" ] || {} ).unsafeRequireFS = require( "fs" );
      } ();


      // Self-executing function to define 'Node.FS.Internal' module (higher-level functions).
      ! function ( n ) {
        "use strict";

        // Import `Node.FS.Internal` (containing `unsafeRequireFS`).
        var a = t[ "Node.FS.Internal" ];

        // Unused imports.
        var r = ( t.Effect, t.Prelude, t[ "Unsafe.Coerce" ].unsafeCoerce );

        // Export `mkEffect` (unsafeCoerce) and `unsafeRequireFS`.
        n.mkEffect = r;
        n.unsafeRequireFS = a.unsafeRequireFS;

      } ( t[ "Node.FS.Internal" ] = t[ "Node.FS.Internal" ] || {} );


      // Self-executing function to define 'Node.FS.Sync' module.
      ! function ( n ) {
        "use strict";

        // Import various modules.
        t[ "Control.Bind" ], t[ "Control.Semigroupoid" ], t[ "Data.DateTime" ], t[ "Data.DateTime.Instant" ], t[ "Data.EuclideanRing" ], t[ "Data.Function" ], t[ "Data.Function.Uncurried" ], t[ "Data.Functor" ], t[ "Data.Int" ], t[ "Data.Maybe" ], t[ "Data.Nullable" ];

        // Import `Data.Show`, `Node.Encoding`, `Node.FS.Internal`.
        var a = t[ "Data.Show" ];
        var r = ( t[ "Data.Time.Duration" ], t.Effect, t[ "Node.Buffer" ], t[ "Node.Encoding" ] );
        var e = ( t[ "Node.FS" ], t[ "Node.FS.Internal" ] );

        // More unused imports / prelude.
        var o = ( t[ "Node.FS.Perms" ], t[ "Node.FS.Stats" ], t[ "Node.Path" ], t.Prelude,
          // Get the Node.js `fs` module.
          e.unsafeRequireFS );

        // Export `readTextFile` function for synchronous file reading.
        n.readTextFile = function ( t ) {
          return function ( n ) {
            return e.mkEffect( function ( e ) {
              // Read file synchronously, specifying encoding.
              return o.readFileSync( n, {
                encoding: a.show( r.showEncoding )( t )
              } );
            } );
          }
        };

      } ( t[ "Node.FS.Sync" ] = t[ "Node.FS.Sync" ] || {} );


      // Self-executing function to define the 'Main' module.
      ! function ( n ) {
        "use strict";

        // Import necessary modules for the main application logic.
        var a = t[ "AtCoder.Tenka12019Beginner.C" ];
        var r = ( t[ "Control.Applicative" ], t[ "Control.Bind" ], t.Effect, t[ "Effect.Console" ] );
        var e = t[ "Node.Encoding" ];
        var o = t[ "Node.FS.Sync" ];

        t.Prelude; // Import Prelude.

        // The main entry point function.
        n.main = function () {
          // Read input from `/dev/stdin` synchronously using UTF8 encoding.
          var t = o.readTextFile( e.UTF8.value )( "/dev/stdin" )();

          // Solve the problem using the imported solver.
          var n = a.solve( t );

          // Log the result to the console.
          return r.log( n )();
        };

      } ( t.Main = t.Main || {} );


      // Immediately call the `main` function from the `Main` module.
      t.Main.main();


    }, // End of module "Focm" function.
    {} // Empty object for module dependencies (resolved by parcelRequire).
  ], // End of module "Focm" definition.

  // More modules would follow here if they were part of the bundle.

}, // End of module definitions object.

{}, // Empty object for initial module cache (will be populated by parcelRequire).

[ "Focm" ], // Array of entry module IDs.

null // Global export name (null in this case).
);