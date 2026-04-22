!function ( t )
{
  // This is a self-invoking function that encapsulates the module system.
  // The 't' parameter will receive the module definitions object.

  var e = {};
  // 'e' serves as the module cache. It stores already loaded modules.

  function n ( r )
  {
    // The core 'require' function of this module system.
    // 'r' is the module ID to be loaded.

    if ( e[ r ] )
    {
      // If the module is already in the cache, return its exports.
      return e[ r ].exports;
    }

    // If not in cache, create a new module entry.
    var o = e[ r ] = {
      i: r,      // module ID
      l: !1,     // loaded flag (initially false)
      exports: {} // the module's exports object
    };

    // Call the module function with appropriate arguments.
    // t[r] is the module factory function itself.
    // o.exports is the 'exports' object.
    // o is the 'module' object.
    // n is the 'require' function for this module.
    t[ r ].call( o.exports, o, o.exports, n );

    // Mark the module as loaded.
    o.l = !0;

    // Return the module's exports.
    return o.exports;
  }

  // Store the module definitions.
  n.m = t;

  // Store the module cache.
  n.c = e;

  // Helper function to define a getter property on exports.
  // This is used for compatibility with CommonJS and ES modules.
  n.d = function ( t, e, r )
  {
    // Check if the property 'e' already exists on 't'.
    if ( !n.o( t, e ) )
    {
      // If not, define it as an enumerable getter.
      Object.defineProperty( t, e, {
        enumerable: !0,
        get: r
      } );
    }
  };

  // Helper function to define ES module properties on exports.
  // This helps in distinguishing ES modules.
  n.r = function ( t )
  {
    // Set Symbol.toStringTag for better debugging experience.
    if ( "undefined" != typeof Symbol && Symbol.toStringTag )
    {
      Object.defineProperty( t, Symbol.toStringTag, { value: "Module" } );
    }

    // Mark the module as an ES module.
    Object.defineProperty( t, "__esModule", { value: !0 } );
  };

  // Helper function to create a namespace object for module exports.
  // This handles various export patterns (default, named, mixed).
  n.t = function ( t, e )
  {
    // If bit 1 is set, it means 't' is a module ID, so require it.
    if ( 1 & e ) t = n( t );

    // If bit 8 is set, return 't' as is (likely a direct module value).
    if ( 8 & e ) return t;

    // If bit 4 is set and 't' is an object and an ES module, return it directly.
    if ( 4 & e && "object" == typeof t && t && t.__esModule ) return t;

    // Create a new empty object for the namespace.
    var r = Object.create( null );

    // Mark the new object as an ES module.
    n.r( r );

    // Define a 'default' property pointing to 't'.
    Object.defineProperty( r, "default", { enumerable: !0, value: t } );

    // If bit 2 is set and 't' is not a string, iterate its properties
    // and define getters for them on the new namespace object.
    if ( 2 & e && "string" != typeof t )
    {
      for ( var o in t )
      {
        n.d( r, o, function ( e )
        {
          return t[ e ];
        }.bind( null, o ) );
      }
    }

    // Return the created namespace object.
    return r;
  };

  // Helper function to get a default export, handling both ES modules and CommonJS.
  n.n = function ( t )
  {
    var e = t && t.__esModule ?
      function () { return t.default; } : // If it's an ES module, return its default export.
      function () { return t; };         // Otherwise, return the module itself.

    // Define a getter 'a' for convenience, pointing to the resolved export.
    return n.d( e, "a", e ), e;
  };

  // Helper function for Object.prototype.hasOwnProperty.call.
  // Used to safely check for properties.
  n.o = function ( t, e )
  {
    return Object.prototype.hasOwnProperty.call( t, e );
  };

  // Set the public path for assets (empty in this case).
  n.p = "";

  // Start loading the main module (module ID 16).
  n( n.s = 16 );

}({
  // Module definitions start here. Each key is a module ID.

  // Module 0: Contains utility functions for async operations and input reading.
  0: function ( t, e, n )
  {
    "use strict";
    // This module uses strict mode.

    // __awaiter: TypeScript helper for async/await syntax.
    // It transforms async functions into generator-based state machines.
    var r = ( this && this.__awaiter ) || function ( t, e, n, r )
    {
      // Returns a new Promise.
      return new ( n || ( n = Promise ) )( function ( o, u )
      {
        // Helper functions for generator iteration.
        function i ( t )
        {
          try
          {
            l( r.next( t ) );
          }
          catch ( t )
          {
            u( t ); // Reject the promise on error.
          }
        }

        function a ( t )
        {
          try
          {
            l( r.throw( t ) );
          }
          catch ( t )
          {
            u( t ); // Reject the promise on error.
          }
        }

        function l ( t )
        {
          // If generator is done, resolve the promise.
          t.done ? o( t.value ) :
            // Otherwise, wrap the value in a new Promise and continue.
            new n( function ( e ) { e( t.value ); } ).then( i, a );
        }

        // Start the generator execution.
        l( ( r = r.apply( t, e || [] ) ).next() );
      } );
    };

    // __generator: TypeScript helper for generator functions.
    // It creates an iterator-like object for generator functions.
    var o = ( this && this.__generator ) || function ( t, e )
    {
      var n, r, o, u, i = {
        label: 0,
        sent: function ()
        {
          if ( 1 & o[ 0 ] ) throw o[ 1 ]; // If error flag is set, throw.
          return o[ 1 ];
        },
        trys: [], // Stack for try/catch/finally blocks.
        ops: []   // Stack for generator operations.
      };

      u = {
        next: a( 0 ),
        throw: a( 1 ),
        return: a( 2 )
      };

      // If Symbol.iterator is available, make the object iterable.
      "function" == typeof Symbol && ( u[ Symbol.iterator ] = function () { return this; } );

      return u;

      function a ( u )
      {
        return function ( a )
        {
          return function ( u )
          {
            // Ensure generator is not already executing.
            if ( n ) throw new TypeError( "Generator is already executing." );

            // Main generator state machine loop.
            for ( ; i; )
            {
              try
              {
                n = 1; // Mark as executing.

                // Handle 'yield' expressions and control flow.
                if ( r && ( o = 2 & u[ 0 ] ? r.return : u[ 0 ] ? r.throw || ( ( o = r.return ) && o.call( r ), 0 ) : r.next ) && !( o = o.call( r, u[ 1 ] ) ).done )
                {
                  return o;
                }

                r = 0; // Reset 'r' (the yielded value).
                o && ( u = [ 2 & u[ 0 ], o.value ] ); // Update 'u' with yielded value.

                switch ( u[ 0 ] )
                {
                  case 0: // Initial state or after a 'yield'.
                  case 1: // After a 'yield'.
                    o = u;
                    break;
                  case 4: // 'yield' expression.
                    return i.label++, { value: u[ 1 ], done: !1 };
                  case 5: // 'yield*' or similar.
                    i.label++, r = u[ 1 ], u = [ 0 ];
                    continue;
                  case 7: // Pop from ops stack (e.g., after try block finishes).
                    u = i.ops.pop(), i.trys.pop();
                    continue;
                  default:
                    // Handle try/catch/finally blocks and their labels.
                    if ( !( o = ( o = i.trys ).length > 0 && o[ o.length - 1 ] ) && ( 6 === u[ 0 ] || 2 === u[ 0 ] ) )
                    {
                      i = 0;
                      continue;
                    }

                    if ( 3 === u[ 0 ] && ( !o || u[ 1 ] > o[ 0 ] && u[ 1 ] < o[ 3 ] ) )
                    {
                      i.label = u[ 1 ];
                      break;
                    }

                    if ( 6 === u[ 0 ] && i.label < o[ 1 ] )
                    {
                      i.label = o[ 1 ], o = u;
                      break;
                    }

                    if ( o && i.label < o[ 2 ] )
                    {
                      i.label = o[ 2 ], i.ops.push( u );
                      break;
                    }

                    o[ 2 ] && i.ops.pop(), i.trys.pop();
                    continue;
                }

                // Call the original generator function with updated state.
                u = e.call( t, i );
              }
              catch ( t )
              {
                u = [ 6, t ], r = 0; // Handle exceptions.
              }
              finally
              {
                n = o = 0; // Reset execution flags.
              }

              // If the generator is done, return its value.
              if ( 5 & u[ 0 ] ) throw u[ 1 ];
              return { value: u[ 0 ] ? u[ 1 ] : void 0, done: !0 };
            }
          }( [ u, a ] ); // Pass the arguments to the inner function.
        };
      }
    };

    // __importDefault: TypeScript helper for importing modules,
    // ensuring default exports are handled correctly.
    var u = ( this && this.__importDefault ) || function ( t )
    {
      return t && t.__esModule ? t : { default: t };
    };

    // Capture 'this' context for later use in async functions.
    var i = this;

    // Mark this module as an ES module.
    e.__esModule = !0;

    // Import the 'fs' module (file system).
    // The 'u' helper is used to handle its default export.
    var a = u( n( 1 ) );

    // getFoolIterator: A generator function to split input string into words.
    function l ( t )
    {
      var e, n;
      return o( this, function ( r )
      {
        switch ( r.label )
        {
          case 0:
            // Split the input string by whitespace and filter out empty strings.
            e = t.split( /\s+/ ).filter( function ( t ) { return t.length > 0; } );
            n = 0; // Initialize loop counter.
            r.label = 1;
          case 1:
            // Check loop condition: n < e.length.
            return n < e.length ? [ 4, e[ n ] ] : [ 3, 4 ]; // Yield current word or jump to end.
          case 2:
            r.sent(); // Consume the yielded value (not used here).
            r.label = 3;
          case 3:
            n++; // Increment counter.
            return [ 3, 1 ]; // Loop back to condition check.
          case 4:
            return [ 2 ]; // Generator finished.
        }
      } );
    }

    // readInput: Asynchronously reads input from /dev/stdin.
    e.readInput = function ()
    {
      return new Promise( function ( t, e )
      {
        a.default.readFile( "/dev/stdin", "utf8", function ( n, r )
        {
          // If an error occurred, reject the promise.
          n ? e( n ) :
            // Otherwise, resolve with the data.
            t( r );
        } );
      } );
    };

    // Export the getFoolIterator function.
    e.getFoolIterator = l;

    // getFoolNextInt: Reads input, splits it into words, and returns a function
    // that yields the next integer from the input.
    e.getFoolNextInt = function ()
    {
      return r( i, void 0, void 0, function ()
      {
        var t, n;
        return o( this, function ( r )
        {
          switch ( r.label )
          {
            case 0:
              // Await the input from stdin.
              return [ 4, e.readInput() ];
            case 1:
              t = r.sent(); // Store the input string.
              n = l( t );   // Create a fool iterator from the input.
              // Return a function that, when called, parses and returns the next integer.
              return [ 2, function () { return parseInt( n.next().value ); } ];
          }
        } );
      } );
    };

    // getChottoMashinaNext: Reads input and returns a function
    // that yields the next "token" (non-whitespace sequence).
    e.getChottoMashinaNext = function ()
    {
      return r( i, void 0, void 0, function ()
      {
        var t, n;
        return o( this, function ( r )
        {
          switch ( r.label )
          {
            case 0:
              // Await input from stdin.
              return [ 4, e.readInput() ];
            case 1:
              t = r.sent(); // Store the input string.
              // Define an inner generator function to extract tokens.
              n = function ()
              {
                var e, n, r;
                return o( this, function ( o )
                {
                  switch ( o.label )
                  {
                    case 0:
                      e = -1; // Start index of the current token.
                      n = 0;  // Current character index.
                      o.label = 1;
                    case 1:
                      // Loop through the input string.
                      return n <= t.length ?
                        // Check if current char is whitespace OR end of string.
                        // If it's whitespace or end AND we have a token (e != -1).
                        ( " " !== t[ n ] && "\n" !== t[ n ] && n !== t.length ?
                          [ 3, 5 ] : // If not whitespace and not end, continue building token.
                          -1 !== e ?
                            [ 3, 2 ] : // If whitespace/end and a token exists, yield it.
                            [ 3, 6 ]   // If whitespace/end and no token, just advance.
                        ) :
                        [ 3, 7 ]; // End of string, exit loop.
                    case 2:
                      r = t.substring( e, n ); // Extract the token.
                      e = -1;                  // Reset start index.
                      return [ 4, r ];         // Yield the token.
                    case 3:
                      o.sent(); // Consume yielded value.
                      o.label = 4;
                    case 4:
                      return [ 3, 6 ]; // Continue loop.
                    case 5:
                      -1 === e && ( e = n ); // If not in a token, start a new one.
                      o.label = 6;
                    case 6:
                      n++; // Move to next character.
                      return [ 3, 1 ]; // Loop back.
                    case 7:
                      return [ 2 ]; // Generator finished.
                  }
                } );
              }(); // Immediately invoke the inner generator to get the iterator.

              // Return a function that, when called, yields the next token.
              return [ 2, function () { return n.next().value; } ];
          }
        } );
      } );
    };

    // getChottoMashinaNextInt: Reads input using getChottoMashinaNext
    // and returns a function that yields the next integer.
    e.getChottoMashinaNextInt = function ()
    {
      return r( i, void 0, void 0, function ()
      {
        var t;
        return o( this, function ( n )
        {
          switch ( n.label )
          {
            case 0:
              // Await the token-yielding function.
              return [ 4, e.getChottoMashinaNext() ];
            case 1:
              t = n.sent(); // Store the token-yielding function.
              // Return a function that, when called, parses and returns the next integer.
              return [ 2, function () { return parseInt( t() ); } ];
          }
        } );
      } );
    };
  },

  // Module 1: Simple module to export the 'fs' (file system) native Node.js module.
  1: function ( t, e )
  {
    t.exports = require( "fs" );
  },

  // Module 16: The main application logic.
  16: function ( t, e, n )
  {
    "use strict";
    // This module also uses strict mode.

    // __awaiter and __generator are repeated here, likely due to how
    // TypeScript compiles modules or Webpack bundles them if they are
    // used in multiple entry points or asynchronously loaded chunks.
    // They are identical to the ones in Module 0.
    var r = ( this && this.__awaiter ) || function ( t, e, n, r )
    {
      return new ( n || ( n = Promise ) )( function ( o, u )
      {
        function i ( t )
        {
          try
          {
            l( r.next( t ) );
          }
          catch ( t )
          {
            u( t );
          }
        }

        function a ( t )
        {
          try
          {
            l( r.throw( t ) );
          }
          catch ( t )
          {
            u( t );
          }
        }

        function l ( t )
        {
          t.done ? o( t.value ) : new n( function ( e ) { e( t.value ); } ).then( i, a );
        }

        l( ( r = r.apply( t, e || [] ) ).next() );
      } );
    };

    var o = ( this && this.__generator ) || function ( t, e )
    {
      var n, r, o, u, i = {
        label: 0,
        sent: function ()
        {
          if ( 1 & o[ 0 ] ) throw o[ 1 ];
          return o[ 1 ];
        },
        trys: [],
        ops: []
      };

      return u = {
        next: a( 0 ),
        throw: a( 1 ),
        return: a( 2 )
      }, "function" == typeof Symbol && ( u[ Symbol.iterator ] = function () { return this; } ), u;

      function a ( u )
      {
        return function ( a )
        {
          return function ( u )
          {
            if ( n ) throw new TypeError( "Generator is already executing." );
            for ( ; i; )
            {
              try
              {
                if ( n = 1, r && ( o = 2 & u[ 0 ] ? r.return : u[ 0 ] ? r.throw || ( ( o = r.return ) && o.call( r ), 0 ) : r.next ) && !( o = o.call( r, u[ 1 ] ) ).done )
                {
                  return o;
                }
                switch ( r = 0, o && ( u = [ 2 & u[ 0 ], o.value ] ), u[ 0 ] )
                {
                  case 0:
                  case 1:
                    o = u;
                    break;
                  case 4:
                    return i.label++, { value: u[ 1 ], done: !1 };
                  case 5:
                    i.label++, r = u[ 1 ], u = [ 0 ];
                    continue;
                  case 7:
                    u = i.ops.pop(), i.trys.pop();
                    continue;
                  default:
                    if ( !( o = ( o = i.trys ).length > 0 && o[ o.length - 1 ] ) && ( 6 === u[ 0 ] || 2 === u[ 0 ] ) )
                    {
                      i = 0;
                      continue;
                    }
                    if ( 3 === u[ 0 ] && ( !o || u[ 1 ] > o[ 0 ] && u[ 1 ] < o[ 3 ] ) )
                    {
                      i.label = u[ 1 ];
                      break;
                    }
                    if ( 6 === u[ 0 ] && i.label < o[ 1 ] )
                    {
                      i.label = o[ 1 ], o = u;
                      break;
                    }
                    if ( o && i.label < o[ 2 ] )
                    {
                      i.label = o[ 2 ], i.ops.push( u );
                      break;
                    }
                    o[ 2 ] && i.ops.pop(), i.trys.pop();
                    continue;
                }
                u = e.call( t, i );
              }
              catch ( t )
              {
                u = [ 6, t ], r = 0;
              }
              finally
              {
                n = o = 0;
              }
              if ( 5 & u[ 0 ] ) throw u[ 1 ];
              return { value: u[ 0 ] ? u[ 1 ] : void 0, done: !0 };
            }
          }( [ u, a ] );
        };
      }
    };

    // Capture 'this' context for async functions.
    var u = this;

    // Mark this module as an ES module.
    e.__esModule = !0;

    // Import functions from module 0.
    var i = n( 0 );

    // Define a constant array 'a' with values [0, 1, 2, 3].
    // This likely represents dimensions or indices for the 4D array.
    var a = [ 0, 1, 2, 3 ];

    // Function 'l' (likely 'clear' or 'initialize') sets certain elements
    // of a 4D array 't' to 0.
    var l = function ( t )
    {
      // Loop through the 'a' array.
      for ( var e = 0, n = a; e < n.length; e++ )
      {
        var r = n[ e ]; // Get current index.

        // These lines seem to be setting specific boundary conditions or initial states
        // within a 4D data structure, possibly related to dynamic programming or a grid.
        t[ 0 ][ 2 ][ 1 ][ r ] = 0;
        t[ r ][ 0 ][ 2 ][ 1 ] = 0;
        t[ 0 ][ 1 ][ 2 ][ r ] = 0;
        t[ r ][ 0 ][ 1 ][ 2 ] = 0;
        t[ 2 ][ 0 ][ 1 ][ r ] = 0;
        t[ r ][ 2 ][ 0 ][ 1 ] = 0;
        t[ 0 ][ r ][ 2 ][ 1 ] = 0;
        t[ 0 ][ 2 ][ r ][ 1 ] = 0;
      }
    };

    // Main execution block, wrapped in an async function.
    r( u, void 0, void 0, function ()
    {
      var t, e, n, r, u, c, f, s, h, p, b, d, v, g, y, w, x, _, m, M, I, S, k, P, j, O, N, C, T, F, E, G, q, D, z, A, B, H;
      // Many variables, likely representing loop counters, temporary values, and state.

      return o( this, function ( o )
      {
        switch ( o.label )
        {
          case 0:
            // Read the first integer input using the "Chotto Mashina" method.
            return [ 4, i.getChottoMashinaNextInt() ];
          case 1:
            t = o.sent(); // 't' holds the input integer.
            e = t();      // Call the function returned by getChottoMashinaNextInt to get the actual value.

            // If the input value 'e' is 3, log 61 and exit.
            // This is likely a special base case or a specific problem constraint.
            if ( 3 === e )
            {
              return console.log( 61 ), [ 2 ];
            }

            // Initialize a 4D object 'n'.
            // This structure will store intermediate results, possibly for dynamic programming.
            for ( n = {}, r = 0, u = a; r < u.length; r++ )
            {
              // First dimension.
              for ( n[ T = u[ r ] ] = {}, c = 0, f = a; c < f.length; c++ )
              {
                // Second dimension.
                for ( G = f[ c ], n[ T ][ G ] = {}, s = 0, h = a; s < h.length; s++ )
                {
                  // Third dimension.
                  for ( z = h[ s ], n[ T ][ G ][ z ] = {}, p = 0, b = a; p < b.length; p++ )
                  {
                    // Fourth dimension. Initialize all elements to 1.
                    H = b[ p ], n[ T ][ G ][ z ][ H ] = 1;
                  }
                }
              }
            }

            // Apply the 'l' function (clear/initialize) to the 'n' array.
            l( n );

            // Define a modulo function to keep results within a certain range.
            d = function ( t ) { return t % 1000000007; };

            // Main loop for dynamic programming.
            // Iterates from 5 up to the input value 'e'.
            for ( v = 5; v <= e; v++ )
            {
              // Create a new 4D object 'g' for the current iteration.
              // It will store results for the current 'v'.
              for ( g = {}, y = 0, w = a; y < w.length; y++ )
              {
                for ( g[ T = w[ y ] ] = {}, x = 0, _ = a; x < _.length; x++ )
                {
                  for ( G = _[ x ], g[ T ][ G ] = {}, m = 0, M = a; m < M.length; m++ )
                  {
                    for ( z = M[ m ], g[ T ][ G ][ z ] = {}, I = 0, S = a; I < S.length; I++ )
                    {
                      // Initialize the current element of 'g' to 0.
                      for ( H = S[ I ], g[ T ][ G ][ z ][ H ] = 0, k = 0, P = a; k < P.length; k++ )
                      {
                        // Update the current element of 'g' by summing values from 'n' (previous iteration).
                        // This is the core recurrence relation of the dynamic programming solution.
                        j = P[ k ], g[ T ][ G ][ z ][ H ] = d( g[ T ][ G ][ z ][ H ] + n[ j ][ T ][ G ][ z ] );
                      }
                    }
                  }
                }
              }

              // Apply the 'l' function again to 'g'.
              l( g );

              // Update 'n' to 'g' for the next iteration.
              n = g;
            }

            // After the loop, calculate the final sum 'O'.
            // Iterate through all elements of the final 'n' array.
            for ( O = 0, N = 0, C = a; N < C.length; N++ )
            {
              for ( T = C[ N ], F = 0, E = a; F < E.length; F++ )
              {
                for ( G = E[ F ], q = 0, D = a; q < D.length; q++ )
                {
                  for ( z = D[ q ], A = 0, B = a; A < B.length; A++ )
                  {
                    // Add each element to the total sum, applying the modulo operation.
                    H = B[ A ], O = d( O + n[ T ][ G ][ z ][ H ] );
                  }
                }
              }
            }

            // Log the final result.
            return console.log( O ), [ 2 ]; // Return and exit the async function.
        }
      } );
    } );
  }
} );