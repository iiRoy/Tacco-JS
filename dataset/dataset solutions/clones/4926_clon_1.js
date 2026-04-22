/*
 * This is a Type I clone of the original JavaScript module.
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved exactly as they were in the source code.
 *
 * Only whitespace (indentation, line breaks, spacing) and comments have been
 * altered or added to create a visually distinct but functionally identical clone.
 *
 * This module exports a function that acts as a custom module loader.
 * It sets up a basic CommonJS-like environment for a given array of modules.
 */

module.exports = function ( e ) {
  // A cache for loaded modules.
  var t = {
  };

  /**
   * The core module loading function.
   * @param {string} r - The module ID.
   * @returns {object} The exports of the loaded module.
   */
  function n ( r ) {
    // If the module is already in the cache, return its exports.
    if ( t[r] ) {
      return t[r].exports;
    }

    // Create a new module object and store it in the cache.
    // i: module ID, l: loaded status (false initially), exports: module exports object.
    var o = t[r] = {
      i: r,
      l: !1,
      exports: {
      }
    };

    // Call the module's function with its context.
    // e[r] is the module function itself.
    // o.exports is the exports object passed to the module.
    // n is the 'require' function for the module.
    e[r].call( o.exports, o, o.exports, n );

    // Mark the module as loaded.
    o.l = !0;

    // Return the module's exports.
    return o.exports;
  }

  // Attach properties to the 'n' (require) function for internal use.

  // .m: stores the module definitions (the 'e' parameter).
  n.m = e;
  // .c: stores the module cache (the 't' variable).
  n.c = t;

  // .d: defines a getter property on an object for a module export.
  n.d = function ( e, t, r ) {
    // Check if the property already exists.
    if ( !n.o( e, t ) ) {
      Object.defineProperty( e, t, {
        enumerable: !0, // Make it enumerable.
        get: r          // Use the provided getter function.
      } );
    }
  };

  // .r: marks a module as an ECMAScript module.
  n.r = function ( e ) {
    // Set Symbol.toStringTag for better debugging.
    if ( "undefined" != typeof Symbol && Symbol.toStringTag ) {
      Object.defineProperty( e, Symbol.toStringTag, {
        value: "Module"
      } );
    }
    // Set __esModule to true.
    Object.defineProperty( e, "__esModule", {
      value: !0
    } );
  };

  // .t: creates a namespace object for module exports.
  n.t = function ( e, t ) {
    // 1 & t: If the module is a direct export (e.g., `require('module')` directly).
    if ( 1 & t && ( e = n( e ) ), 8 & t ) {
      return e;
    }
    // 4 & t: If it's an already existing ES module.
    if ( 4 & t && "object" == typeof e && e && e.__esModule ) {
      return e;
    }

    // Create a new empty object for the namespace.
    var r = Object.create( null );

    // Mark it as an ES module.
    n.r( r );

    // Set the 'default' export.
    Object.defineProperty( r, "default", {
      enumerable: !0,
      value: e
    } );

    // 2 & t: If it's a CommonJS module and not a string,
    // iterate over its properties and define getters for them.
    if ( 2 & t && "string" != typeof e ) {
      for ( var o in e ) {
        n.d( r, o, function ( t ) {
          return e[t];
        }.bind( null, o ) );
      }
    }
    return r;
  };

  // .n: creates a getter function for a module's default export.
  n.n = function ( e ) {
    var t = e && e.__esModule ?
      function () {
        return e.default;
      } :
      function () {
        return e;
      };
    // Define a getter 'a' for the default export.
    n.d( t, "a", t );
    return t;
  };

  // .o: checks if an object has a property. (Wrapper for Object.prototype.hasOwnProperty.call)
  n.o = function ( e, t ) {
    return Object.prototype.hasOwnProperty.call( e, t );
  };

  // .p: public path for assets (empty in this case).
  n.p = "";

  // The entry point: Load module 0.
  return n( n.s = 0 );
}(
  // The array of module definitions.
  [
    // Module 0: Main entry point.
    function ( e, t, n ) {
      // Require module 1, passing it the result of
      // reading /dev/stdin with module 2 (fs) and splitting by newline.
      n( 1 )( n( 2 ).readFileSync( "/dev/stdin", "UTF-8" ).split( "\n" ) );
    },

    // Module 1: The core logic for processing the input.
    function ( e, t ) {
      // This module exports a function that takes an array of lines.
      e.exports = function ( e ) {
        // e[0] is expected to be the input string.
        for (
          var t = e[0],          // The first line of input.
          n = t.length,         // Length of the input string.
          r = 0,                // Score counter.
          o = 0,                // Balance counter (open 'g' vs 'p').
          u = 0;                // Loop index.
          u < n;
          u++
        ) {
          // If balance is positive and current char is 'g'.
          // This means we have an unmatched 'g' from before.
          if ( o > 0 && "g" == t[u] ) {
            // If it's a 'g', score a point and decrease balance.
            "g" == t[u] && r++;
            o--;
          } else {
            // Otherwise (balance is zero or negative, or char is 'p').
            // If it's a 'p', decrement score and increment balance.
            "p" == t[u] && r--;
            o++;
          }
        }
        // Output the final score.
        console.log( r );
      };
    },

    // Module 2: Node.js 'fs' module.
    function ( e, t ) {
      e.exports = require( "fs" );
    }
  ]
);