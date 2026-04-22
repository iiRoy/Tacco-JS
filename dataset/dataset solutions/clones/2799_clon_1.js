module.exports = function ( e ) {
  // This object acts as a module cache.
  var t = {};

  /*
   * The primary function for loading modules within this bundle.
   * It handles caching and execution of module definitions.
   *
   * @param {string} r - The unique identifier of the module to load.
   */
  function n( r ) {

    // If the module is already loaded and cached, return its exports immediately.
    if ( t[r] ) {
      return t[r].exports;
    }

    // Initialize a new module entry in the cache.
    // 'i' stores the module ID, 'l' indicates if it's loaded (initially false).
    var o = t[r] = { i: r, l: !1, exports: {} };

    // Execute the module's definition function.
    // The 'e' array holds all module definitions.
    e[r].call( o.exports, o, o.exports, n );

    // Mark the module as loaded after its definition has been executed.
    o.l = !0;

    // Return the exports of the newly loaded module.
    return o.exports;
  }


  // Store the array of module definitions.
  n.m = e;

  // Store the module cache object.
  n.c = t;

  /**
   * Defines a getter property on the exports object for ES module compatibility.
   * This ensures that named exports are properly exposed.
   *
   * @param {object} e - The exports object.
   * @param {string} t - The name of the property to define.
   * @param {function} r - The getter function for the property.
   */
  n.d = function ( e, t, r ) {
    // Only define the property if it doesn't already exist.
    if ( ! n.o( e, t ) ) {
      Object.defineProperty( e, t, { enumerable: !0, get: r } );
    }
  };


  /*
   * Marks an exports object as an ES module.
   * This involves setting '__esModule: true' and, if available, 'Symbol.toStringTag'.
   *
   * @param {object} e - The exports object to mark.
   */
  n.r = function ( e ) {
    // Set Symbol.toStringTag for better module identification in certain environments.
    if ( "undefined" != typeof Symbol && Symbol.toStringTag ) {
      Object.defineProperty( e, Symbol.toStringTag, { value: "Module" } );
    }

    // Mark the object as an ES module.
    Object.defineProperty( e, "__esModule", { value: !0 } );
  };


  /*
   * Creates a namespace object for module imports, handling various import types.
   * This is crucial for interoperability between CommonJS and ES modules.
   *
   * @param {any} e - The module or its exports.
   * @param {number} t - Bitmask indicating import type (e.g., 1=direct, 2=copy all, 4=is ES module, 8=raw).
   * @returns {object} The normalized module namespace object.
   */
  n.t = function ( e, t ) {
    // If bit 1 is set, it means 'e' is a module ID, so load it.
    if ( 1 & t && ( e = n( e ) ) ) {
      // The assignment handles the return value for this specific case.
    }

    // If bit 8 is set, return the module as is (raw import).
    if ( 8 & t ) {
      return e;
    }

    // If bit 4 is set and 'e' is an object and already an ES module, return it directly.
    if ( 4 & t && "object" == typeof e && e && e.__esModule ) {
      return e;
    }

    // Create a new empty object to serve as the namespace.
    var r = Object.create( null );

    // Mark the new namespace object as an ES module.
    n.r( r );

    // Set the 'default' export of the namespace to the module 'e'.
    Object.defineProperty( r, "default", { enumerable: !0, value: e } );

    // If bit 2 is set and 'e' is not a string, copy all properties from 'e' to the namespace.
    if ( 2 & t && "string" != typeof e ) {
      // Iterate over enumerable properties of 'e'.
      for ( var o in e ) {
        // Define a getter for each property on the namespace 'r'.
        n.d( r, o, ( function ( t_inner_scope ) {
          return e[t_inner_scope];
        } ).bind( null, o ) );
      }
    }

    // Return the constructed namespace object.
    return r;
  };


  /*
   * Provides a getter for the default export of a module.
   * This helps in accessing CommonJS exports as ES module defaults.
   *
   * @param {object} e - The module's exports object.
   * @returns {function} A getter function for the default export.
   */
  n.n = function ( e ) {
    // Determine if 'e' is an ES module and create an appropriate getter.
    var t = e && e.__esModule
      ? function () {
        return e.default; // If ES module, return its default export.
      }
      : function () {
        return e;         // Otherwise, return the module itself.
      };

    // Attach this getter to the 'a' property of the getter function itself.
    n.d( t, "a", t );

    // Return the getter function.
    return t;
  };


  /*
   * Checks if an object has a specified property directly (not inherited).
   * This is a wrapper around Object.prototype.hasOwnProperty.call.
   *
   * @param {object} e - The object to check.
   * @param {string} t - The property name.
   * @returns {boolean} True if the property exists directly on the object, false otherwise.
   */
  n.o = function ( e, t ) {
    return Object.prototype.hasOwnProperty.call( e, t );
  };

  // Public path for assets; typically used for loading chunks or resources.
  // In this case, it's an empty string.
  n.p = "";

  // The entry point of the application: load module 0.
  // 'n.s = 0' sets the start module ID before calling 'n'.
  return n( n.s = 0 );

  // The array of module definitions follows, passed as 'e' to the outer function.
}( [
  /* Module 0: The application's entry point. */
  function ( e, t, n ) {
    // This module reads input from stdin, splits it by newlines,
    // and then passes the resulting array to module 1 for processing.
    n( 1 )( n( 2 ).readFileSync( "/dev/stdin", "UTF-8" ).split( "\n" ) );
  },

  /* Module 1: Contains the core logic for processing the input. */
  function ( e, t, n ) {
    "use strict"; // Enforce strict JavaScript parsing and error handling for this module.

    // This module exports a function that takes an array 'e' (lines from stdin).
    e.exports = function ( e ) {
      // Get the first line of input.
      var t = e[0];
      // Determine the length of the first line.
      var n = t.length;

      // Iterate through the characters of the first line, up to the second-to-last character.
      for ( var r = 0; r < n - 1; r++ ) {
        // Compare the current character with the next one.
        if ( t[r] == t[r + 1] ) {
          // If two adjacent characters are identical, print "Bad" and terminate.
          return void console.log( "Bad" );
        }
      }
      // If the loop completes without finding any identical adjacent characters, print "Good".
      console.log( "Good" );
    };
  },

  /* Module 2: A simple module that exports Node.js's 'fs' (file system) module. */
  function ( e, t ) {
    // This makes the 'fs' module available to other modules within the bundle.
    e.exports = require( "fs" );
  }
] );