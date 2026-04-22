/*
 * This file contains the main module export, which is an Immediately Invoked Function Expression (IIFE).
 * The IIFE takes an array of module definitions as its argument.
 * It sets up a basic module loading system, similar to a simplified Webpack runtime.
 */
module.exports = function ( e ) {

  // r: This object serves as a cache for already loaded modules.
  // Each key is a module ID, and its value is the module's export object.
  var r = {};

  /**
   * t: This is the core 'require' function for our module system.
   * It attempts to load and return a module by its ID.
   * @param {number} n - The ID of the module to load.
   * @returns {any} The exports of the requested module.
   */
  function t ( n ) {

    // If the module is already in the cache, return its exports immediately.
    if ( r[n] ) {
      return r[n].exports;
    }

    // If not in cache, create a new module object.
    // o.i: module ID, o.l: loaded flag, o.exports: the actual exports object.
    var o = r[n] = {
      i: n,
      l: !1,
      exports: {}
    };

    // Call the module definition function (e[n]) with the appropriate context.
    // The module definition function receives (module, module.exports, require_function).
    e[n].call( o.exports, o, o.exports, t );

    // Mark the module as loaded.
    o.l = !0;

    // Return the module's exports.
    return o.exports;
  }


  // Attach various utility functions to the 't' (require) function itself.

  // t.m: Stores the module definitions array.
  t.m = e;

  // t.c: Stores the module cache object.
  t.c = r;


  // t.d: Defines a getter property on an object for a module's export.
  // This is used for compatibility with ES modules.
  t.d = function ( e, r, n ) {
    // Only define if the property doesn't already exist.
    if ( !t.o( e, r ) ) {
      Object.defineProperty( e, r, {
        enumerable: true, // Make the property enumerable.
        get: n          // Use 'n' as the getter function.
      } );
    }
  };


  // t.r: Marks an object as an ES module.
  // Adds __esModule: true and Symbol.toStringTag: 'Module' properties.
  t.r = function ( e ) {
    // Add Symbol.toStringTag for better debugging/introspection.
    if ( typeof Symbol !== "undefined" && Symbol.toStringTag ) {
      Object.defineProperty( e, Symbol.toStringTag, { value: "Module" } );
    }

    // Mark as an ES module.
    Object.defineProperty( e, "__esModule", { value: true } );
  };


  // t.t: Creates a namespace object for module exports.
  // Handles various module export formats (commonjs, esm, etc.).
  t.t = function ( e, r ) {
    // If the module is a CommonJS module (1&r), load it.
    if ( 1 & r && ( e = t( e ) ) ) {
      return e;
    }

    // If it's a direct export (8&r), return it as is.
    if ( 8 & r ) {
      return e;
    }

    // If it's an ES module (4&r) and an object, return it.
    if ( 4 & r && typeof e === "object" && e && e.__esModule ) {
      return e;
    }

    // Otherwise, create a new namespace object.
    var n = Object.create( null );

    // Mark the new object as an ES module.
    t.r( n );

    // Define a 'default' export property.
    Object.defineProperty( n, "default", { enumerable: true, value: e } );

    // If it's a string (2&r) and not an ES module, copy all properties from the original export.
    if ( 2 & r && typeof e !== "string" ) {
      for ( var o in e ) {
        t.d( n, o, ( function ( r ) {
          return e[r];
        } ).bind( null, o ) );
      }
    }

    // Return the created namespace object.
    return n;
  };


  // t.n: Creates a getter function for a module's exports.
  // Handles both CommonJS and ES module default exports.
  t.n = function ( e ) {
    var r = e && e.__esModule ?
      function () {
        return e.default; // If ES module, return its default export.
      } :
      function () {
        return e;         // Otherwise, return the module itself.
      };

    // Define a property 'a' on the getter function that returns the getter itself.
    // This is a convention for Webpack's interop.
    t.d( r, "a", r );

    return r;
  };


  // t.o: Utility function to check if an object has a property directly (not via prototype chain).
  t.o = function ( e, r ) {
    return Object.prototype.hasOwnProperty.call( e, r );
  };


  // t.p: The public path for assets (empty in this case).
  t.p = "";


  // This is the entry point of the application.
  // It sets the starting module (t.s = 0) and then immediately loads it.
  return t( t.s = 0 );

// The array of module definitions.
}( [
  // Module 0: The main application entry point.
  function ( e, r, t ) {
    // This module requires module 1, and passes it the result of
    // reading from standard input using module 2 (fs).
    // The input is read as UTF-8 and split by newlines.
    t( 1 )( t( 2 ).readFileSync( "/dev/stdin", "UTF-8" ).split( "\n" ) );
  },

  // Module 1: Contains the core logic for processing the input.
  function ( e, r ) {

    e.exports = function ( e ) {

      // r: The first line of input, converted to a number.
      var r = Number( e[0] );

      // t: The second line of input, split by spaces and each part converted to a number.
      var t = e[1].split( " " ).map( function ( e ) {
        return Number( e );
      } );


      // n: An array of size 'r', initialized with zeros.
      var n = new Array( r ).fill( 0 );

      // Iterate from 0 to r-1.
      for ( var o = 0; o < r; o++ ) {
        // Calculate n[o] based on t[o], o, and 1.
        n[o] = t[o] - o - 1;
      }


      // Sort the array 'n' in ascending order.
      n.sort( function ( e, r ) {
        return e - r;
      } );


      // u: Variable to store the median value.
      var u = 0;

      // Calculate the median of the sorted array 'n'.
      // If 'r' (length) is even, it's the average of the two middle elements.
      // If 'r' is odd, it's the middle element.
      u = r % 2 === 0 ? ( n[r / 2 - 1] + n[r / 2] ) / 2 : n[Math.floor( r / 2 )];


      // i: Variable to accumulate the sum of absolute differences.
      var i = 0;

      // Iterate through the array 'n' again.
      for ( var f = 0; f < r; f++ ) {
        // Add the absolute difference between n[f] and the median 'u' to 'i'.
        i += Math.abs( n[f] - u );
      }

      // Print the final calculated sum to the console.
      console.log( i );
    };
  },

  // Module 2: Simply exports the Node.js 'fs' (file system) module.
  function ( e, r ) {
    e.exports = require( "fs" );
  }
] );