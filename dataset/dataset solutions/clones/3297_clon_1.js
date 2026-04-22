/*
 * This JavaScript module is a self-executing function that implements a
 * simple module bundling system, similar to a simplified webpack output.
 * It encapsulates several utility functions for managing modules,
 * handling exports, and ensuring compatibility between different
 * module formats (like CommonJS and ES Modules).
 *
 * The primary purpose of this specific bundle is to read input from
 * standard input, process it using a dynamic programming algorithm,
 * and then output a result to the console.
 */
module.exports = function ( r ) {

  // A cache for loaded modules.
  var e = {};

  /**
   * The core module loading function.
   * It attempts to retrieve a module from cache or load it if not found.
   *
   * @param {string} n - The unique identifier for the module to load.
   * @returns {*} The exports of the requested module.
   */
  function t( n ) {

    // Check if the module is already in our cache.
    if ( e[n] ) return e[n].exports;

    // If not cached, create a new module entry.
    var o = e[n] = {
      i: n,         // Module ID.
      l: !1,        // 'l' indicates if the module has been loaded (false initially).
      exports: {}   // The object that will hold the module's exports.
    };

    // Execute the module's function, binding its context and exports.
    r[n].call( o.exports, o, o.exports, t );

    // Mark the module as loaded.
    o.l = !0;

    // Return the module's exports.
    return o.exports;

  }

  // --- Utility functions attached to the 't' (module loader) function ---

  // 't.m' stores all module definitions (the 'r' parameter passed to the wrapper).
  t.m = r;

  // 't.c' stores the module cache (the 'e' object).
  t.c = e;

  /**
   * 't.d' is a helper to define enumerable properties on an object.
   * It's used for defining getters, often for named exports.
   *
   * @param {object} r - The object on which to define the property.
   * @param {string} e - The name of the property.
   * @param {Function} n - The getter function for the property.
   */
  t.d = function ( r, e, n ) {
    // Only define the property if it doesn't already exist on the object.
    t.o( r, e ) || Object.defineProperty( r, e, { enumerable: !0, get: n } );
  };

  /**
   * 't.r' marks an object as an ES Module (ESM).
   * This is done by setting the '__esModule' property to true
   * and potentially the 'Symbol.toStringTag' for better debugging.
   *
   * @param {object} r - The module exports object to mark as an ESM.
   */
  t.r = function ( r ) {
    // If Symbol.toStringTag is supported, set it to "Module".
    "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty( r, Symbol.toStringTag, { value: "Module" } ),
    // Always set __esModule to true.
    Object.defineProperty( r, "__esModule", { value: !0 } );
  };

  /**
   * 't.t' creates a namespace object for module exports.
   * It handles various scenarios for importing modules (e.g., CommonJS, ESM default/named exports).
   *
   * @param {*} r - The module exports or module ID.
   * @param {number} e - A bitmask indicating how to interpret 'r' and what kind of namespace to create.
   * @returns {object} The created namespace object.
   */
  t.t = function ( r, e ) {
    // If bit 1 is set, 'r' is a module ID, so resolve it using 't'.
    if ( 1 & e && ( r = t( r ) ), 8 & e ) return r;

    // If bit 4 is set, and 'r' is an object that's already an ESM, return it directly.
    if ( 4 & e && "object" == typeof r && r && r.__esModule ) return r;

    // Create a new empty object as the namespace.
    var n = Object.create( null );

    // Mark the new namespace as an ES Module.
    t.r( n );

    // Define a 'default' export property on the namespace.
    Object.defineProperty( n, "default", { enumerable: !0, value: r } );

    // If bit 2 is set and 'r' is not a string, copy all properties from 'r' to 'n' as named exports.
    if ( 2 & e && "string" != typeof r )
      for ( var o in r ) t.d( n, o, ( function ( e ) { return r[e]; } ).bind( null, o ) );

    // Return the constructed namespace object.
    return n;
  };

  /**
   * 't.n' creates a getter function for module exports.
   * This helps with interoperability between CommonJS and ES Modules,
   * ensuring that 'default' exports are correctly accessed.
   *
   * @param {object} r - The module exports object.
   * @returns {Function} A getter function that returns the module's main export.
   */
  t.n = function ( r ) {
    // If the module is an ESM, return a getter for its 'default' export.
    var e = r && r.__esModule ?
      function () { return r.default; } :
      // Otherwise, return a getter for the module itself.
      function () { return r; };

    // Define a property 'a' on the getter, which is the getter itself.
    t.d( e, "a", e );

    // Return the getter function.
    return e;
  };

  /**
   * 't.o' is a shorthand for Object.prototype.hasOwnProperty.call.
   * It's used to check if an object directly owns a specified property.
   *
   * @param {object} r - The object to check.
   * @param {string} e - The property name.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  t.o = function ( r, e ) {
    return Object.prototype.hasOwnProperty.call( r, e );
  };

  // 't.p' represents the public path for loading assets, which is empty here.
  t.p = "";

  // The entry point of the application: load module with ID 0.
  // 't.s = 0' sets the 's' property of 't' to 0 (start module), then 't(0)' loads it.
  return t( t.s = 0 );

}(
  // --- Array of module definitions ---
  [
    /*
     * Module 0: The application's main entry point.
     * It reads from standard input using the 'fs' module (Module 2)
     * and passes the content to Module 1 for processing.
     */
    function ( r, e, t ) {
      // Load Module 1 and immediately call it with the content read from stdin.
      t( 1 )(
        // Read file synchronously from /dev/stdin using 'fs' (Module 2).
        t( 2 ).readFileSync( "/dev/stdin", "UTF-8" )
      );
    },

    /*
     * Module 1: Contains the core logic for processing the input.
     * It implements a dynamic programming solution to a maximization problem.
     */
    function ( r, e ) {

      /**
       * A local helper function 't' (distinct from the global 't')
       * for safely destructuring iterable values into an array of a specific length.
       * This is a common pattern generated by transpilers like Babel for array destructuring.
       *
       * @param {*} r - The value to destructure.
       * @param {number} e - The desired number of elements to extract.
       * @returns {Array} An array containing the destructured elements.
       * @throws {TypeError} If the input is not iterable and cannot be destructured.
       */
      function t( r, e ) {
        // Attempt 1: If 'r' is already an array, return it directly.
        return ( function ( r ) {
          if ( Array.isArray( r ) ) return r;
        } )( r ) ||
        // Attempt 2: If 'r' is an iterable, iterate and collect up to 'e' elements.
        ( function ( r, e ) {
          var t = [],      // Array to store collected elements.
            n = !0,      // Flag indicating if iteration is not done.
            o = !1,      // Flag for whether an error occurred.
            u = void 0;  // Stores the error if one occurs.
          try {
            // Iterate over the iterable 'r'.
            for (
              var i,
                f = r[Symbol.iterator]();
              !( n = ( i = f.next() ).done ) && ( t.push( i.value ), !e || t.length !== e );
              n = !0
            ) {}
          } catch ( r ) {
            o = !0;
            u = r;
          } finally {
            try {
              // Ensure the iterator's 'return' method is called if available and iteration wasn't done naturally.
              n || null == f.return || f.return();
            } finally {
              // If an error occurred during iteration, re-throw it.
              if ( o ) throw u;
            }
          }
          return t;
        } )( r, e ) ||
        // Attempt 3: If 'r' is neither an array nor a successfully destructured iterable, throw an error.
        ( function () {
          throw new TypeError( "Invalid attempt to destructure non-iterable instance" );
        } )();
      }

      /**
       * The main function exported by Module 1.
       * It processes a multi-line string input to solve a dynamic programming problem.
       * The problem appears to involve finding a maximum path or sum through a grid-like structure.
       *
       * @param {string} r - The input string, expected to be multiple lines of numbers.
       */
      r.exports = function ( r ) {

        // Split the input string into individual lines.
        var e = r.split( "\n" );

        // The first line contains the number of data rows, 'n'.
        var n = Number( e[0] );

        // 'o' will store the parsed input data rows.
        var o = [];

        // Loop through the input lines, starting from the second line (index 1).
        for ( var u = 0; u < n; u++ ) {
          // Each line is split by space, mapped to numbers, and then destructured into 3 variables.
          var i = t(
              e[u + 1].split( " " ).map( function ( r ) { return Number( r ); } ),
              3
            ),
            f = i[0], // First number in the row.
            a = i[1], // Second number in the row.
            l = i[2]; // Third number in the row.

          // Add the parsed row as an array of three numbers to 'o'.
          o.push( [f, a, l] );
        }

        // 'c' is a 2D array used for dynamic programming; it stores intermediate maximums.
        var c = [];

        // Initialize 'c' with 'n' rows, each containing three zeros.
        for ( var p = 0; p < n; p++ ) c.push( [0, 0, 0] );

        // Initialize the first row of 'c' with the values from the first row of 'o'.
        c[0][0] = o[0][0], c[0][1] = o[0][1], c[0][2] = o[0][2];

        // Dynamic programming calculation loop.
        // Iterate through rows from the second row up to the last (s from 0 to n-2).
        for ( var s = 0; s < n - 1; s++ )
          // Iterate through columns of the current row (d from 0 to 2).
          for ( var d = 0; d < 3; d++ )
            // Iterate through columns of the *next* row (v from 0 to 2).
            for ( var v = 0; v < 3; v++ )
              // Constraint: The chosen column in the next row 'v' must not be the same as the current column 'd'.
              if ( v != d ) {
                // Calculate a potential new maximum sum for c[s+1][v].
                // This sum is the current maximum at c[s][d] plus the value from o[s+1][v].
                var y = c[s][d] + o[s + 1][v];

                // If the calculated sum 'y' is greater than the current value in c[s+1][v], update it.
                // This is a short-circuit assignment: if c[s+1][v] < y, then c[s+1][v] = y.
                c[s + 1][v] < y && ( c[s + 1][v] = y );
              }

        // After all calculations, find the maximum value in the last row of 'c'.
        var b = Math.max( ...c[n - 1] );

        // Output the final maximum value to the console.
        console.log( b );
      };
    },

    /*
     * Module 2: A simple module that exports the Node.js 'fs' (file system) module.
     * This allows other modules in the bundle to perform file operations.
     */
    function ( r, e ) {
      r.exports = require( "fs" );
    }
  ]
);