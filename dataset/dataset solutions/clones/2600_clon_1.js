/*
 * This file is a Type I clone of another JavaScript file.
 * It maintains exact functional equivalence while varying whitespace and comments extensively.
 *
 * Official Type I definition:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * This means:
 * - Every identifier, variable name, function name, operator, and expression
 *   must remain completely unchanged.
 * - The only permitted changes are whitespace (indentation, spacing, blank lines)
 *   and comments (add, remove, or modify them).
 * - These changes are made extensively throughout the entire file so the result
 *   looks visually different, but is logically and structurally identical.
 */

/*
 * Start of the main self-executing function
 * This structure is typical for bundling modules (e.g., Webpack).
 */
! function( t )
{
  // `r` serves as the module cache, storing already loaded modules.
  var r = {};

  /**
   *  The core module loading function, similar to `require` in Node.js.
   *  @param { string } e - The module ID to load.
   *  @returns { object } The exports of the requested module.
   */
  function n( e )
  {
    // Check if the module is already in the cache.
    if ( r[ e ] )
    {
      // If found, return its exports immediately.
      return r[ e ].exports;
    }

    // If not in cache, create a new module entry.
    var o = r[ e ] = {
      i: e,        // module id
      l: ! 1,      // loaded flag, initially false
      exports: {}  // exports object for the module
    };

    // Execute the module function, populating `o.exports`.
    t[ e ].call( o.exports, o, o.exports, n );

    // Mark the module as loaded.
    o.l = ! 0;

    // Return the module's exports.
    return o.exports;
  }

  // Store the array of all module functions (t) on the loader (n).
  n.m = t;

  // Store the module cache (r) on the loader (n).
  n.c = r;

  /**
   *  Define a getter property on an object, used for ES Module interop.
   *  @param { object } t - The target object.
   *  @param { string } r - The name of the property.
   *  @param { Function } e - The getter function.
   */
  n.d = function( t, r, e )
  {
    // Only define if the property doesn't already exist.
    if ( ! n.o( t, r ) )
    {
      Object.defineProperty( t, r, {
        enumerable: ! 0,  // Make the property enumerable.
        get: e            // Assign the getter function.
      } );
    }
  };

  /**
   *  Add properties to mark an object as an ES Module.
   *  @param { object } t - The module exports object.
   */
  n.r = function( t )
  {
    // Set Symbol.toStringTag for better debugging.
    "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty( t, Symbol.toStringTag, { value: "Module" } );
    // Mark as an ES Module.
    Object.defineProperty( t, "__esModule", { value: ! 0 } );
  };

  /**
   *  Create a namespace object for module exports, handling various module types.
   *  @param { any } t - The module's exports.
   *  @param { number } r - Flags indicating module type.
   *  @returns { object } The namespace object.
   */
  n.t = function( t, r )
  {
    // If flag 1 is set, load the module.
    if ( 1 & r && ( t = n( t ) ), 8 & r )
    {
      return t;
    }
    // If flag 4 is set, and it's an ES Module, return it directly.
    if ( 4 & r && "object" == typeof t && t && t.__esModule )
    {
      return t;
    }

    // Create a new empty object as a namespace.
    var e = Object.create( null );

    // Mark the new object as an ES Module.
    if ( n.r( e ),
         // Define a default export.
         Object.defineProperty( e, "default", { enumerable: ! 0, value: t } ),
         // If flag 2 is set and it's not a string, iterate and define getters.
         2 & r && "string" != typeof t )
    {
      // Iterate over properties of `t`.
      for ( var o in t )
      {
        // Define a getter for each property.
        n.d( e, o, function( r ) { return t[ r ] }.bind( null, o ) );
      }
    }
    return e;
  };

  /**
   *  Helper to get the default export from a module.
   *  @param { object } t - The module exports.
   *  @returns { Function } A function that returns the default export.
   */
  n.n = function( t )
  {
    // Check if it's an ES Module and has a default export.
    var r = t && t.__esModule ?
      function() { return t.default; } :  // If so, return the default.
      function() { return t; };           // Otherwise, return the module itself.
    // Define an 'a' property as a getter for the default.
    return n.d( r, "a", r ), r;
  };

  /**
   *  Check if a property exists directly on an object (not inherited).
   *  @param { object } t - The object to check.
   *  @param { string } r - The property name.
   *  @returns { boolean } True if the property exists, false otherwise.
   */
  n.o = function( t, r )
  {
    return Object.prototype.hasOwnProperty.call( t, r );
  };

  // Set the public path for assets (empty string in this case).
  n.p = "";

  // Load the entry module (module 133) to start the application.
  n( n.s = 133 );
}(
  // Array of module definitions.
  [
    /*
     * Module 0: Common module for defining properties and handling feature detection.
     * This module appears to be a core utility for polyfilling or extending built-in objects.
     */
    function( t, r, n )
    {
      var e = n( 5 ),     // Global object (window or globalThis)
          o = n( 22 ).f,  // Object.getOwnPropertyDescriptor.f
          i = n( 16 ),    // Object.defineProperty (or fallback)
          u = n( 23 ),    // Define property on an object (with optional flags)
          a = n( 79 ),    // Get or create shared global object
          c = n( 100 ),   // Copy properties from source to target
          f = n( 62 );    // Feature detection utility

      t.exports = function( t, r )
      {
        var n, s, l, p, h,
            v = t.target,  // Target object name (e.g., 'Array', 'String')
            g = t.global,  // Is it a global object?
            d = t.stat;    // Is it a static method?

        // Determine the base object to work on.
        if ( n = g ? e : d ? e[ v ] || a( v, {} ) : ( e[ v ] || {} ).prototype )
        {
          // Iterate over the properties in the `r` object (methods/properties to add/modify).
          for ( s in r )
          {
            p = r[ s ]; // The new value/function.

            // Get the existing property descriptor or value.
            l = t.noTargetGet ? ( ( h = o( n, s ) ) && h.value ) : n[ s ];

            // Check if the feature is forced or if the existing implementation is problematic.
            if ( ! f( g ? s : v + ( d ? "." : "#" ) + s, t.forced ) && void 0 !== l )
            {
              // If types match, no need to overwrite unless forced.
              if ( typeof p == typeof l )
              {
                continue;
              }
              // If types differ, copy properties (e.g., from native to polyfill).
              c( p, l );
            }

            // Set a 'sham' flag for non-standard polyfills.
            ( t.sham || ( l && l.sham ) ) && i( p, "sham", !0 );

            // Apply the new property/method.
            u( n, s, p, t );
          }
        }
      };
    },

    /*
     * Module 1: Type checking utility - ensures a value is an object.
     */
    function( t, r )
    {
      t.exports = function( t )
      {
        // Use module 8 (isObject) to validate.
        if ( ! n( 8 )( t ) )
        {
          throw TypeError( String( t ) + " is not an object" );
        }
        return t;
      };
    },

    /*
     * Module 2: A simple boolean constant module.
     * This might be used for feature flags or environment checks.
     */
    function( t, r )
    {
      t.exports = ! 1;
    },

    /*
     * Module 3: Iteration utility - iterates over iterable objects.
     */
    function( t, r, n )
    {
      var e = n( 1 ),   // ensureObject
          o = n( 84 ),  // isArrayIteratorMethod
          i = n( 10 ),  // toLength
          u = n( 13 ),  // functionBindContext
          a = n( 52 ),  // getIteratorMethod
          c = n( 108 ), // iteratorClose and Call
          f = function( t, r ) { this.stopped = t, this.result = r }; // Internal StopIteration-like object

      ( t.exports = function( t, r, n, s, l )
      {
        var p, h, v, g, d, y,
            m = u( r, n, s ? 2 : 1 ); // Bind the callback function.

        if ( l )
        {
          // If already an iterator.
          p = t;
        }
        else
        {
          // Get the iterator method.
          if ( "function" != typeof ( h = a( t ) ) )
          {
            throw TypeError( "Target is not iterable" );
          }
          // If it's an array iterator.
          if ( o( h