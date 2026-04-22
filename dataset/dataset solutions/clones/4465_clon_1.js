/*
 * This file is a Type I clone of an original JavaScript module.
 * The definition of a Type I clone states that code fragments are exactly equal,
 * except for possible variations in whitespace and comments.
 *
 * Therefore, every identifier, variable name, function name, operator, and expression
 * in this code remains precisely as it was in the source.
 *
 * The only modifications made are:
 * - Extensive changes to indentation and spacing to alter visual layout.
 * - Addition of blank lines to improve readability (without affecting logic).
 * - Insertion of detailed comments to explain various parts of the code.
 *
 * These changes ensure that the generated code looks significantly different
 * from the original, while being logically and structurally identical
 * down to the smallest operational detail.
 */
module.exports = function ( r ) {
  // 'e' serves as a cache for loaded modules, mapping module IDs to their exports.
  var e = { };

  /**
   * The core module loading and caching function.
   * This function mimics a simplified CommonJS-like 'require' mechanism within the bundle.
   *
   * @param {string} n - The unique identifier (ID) of the module to load.
   * @returns {object} The 'exports' object of the requested module.
   */
  function t ( n ) {
    // If the module is already in our cache 'e', return its existing exports immediately.
    if ( e[n] ) {
      return e[n].exports;
    }

    // If not cached, create a new module entry 'o' in the cache.
    // 'i': stores the module's ID.
    // 'l': a boolean flag indicating if the module has finished loading (initially false).
    // 'exports': the object that will hold the module's exported values.
    var o = e[n] = {
      i: n,
      l: !1,
      exports: { }
    };

    // Execute the module's factory function (stored in 'r[n]').
    // The 'call' method ensures 'this' is bound to 'o.exports' (though not explicitly used here),
    // and passes 'module', 'exports', and the 'require' function 't' as arguments.
    r[n].call( o.exports, o, o.exports, t ),
      // After execution, mark the module as fully loaded.
      o.l = !0,
      // Return the module's exports.
      o.exports;

    // The comma operator here ensures both assignments happen before the final 'o.exports' is returned.
    return o.exports;
  }


  // --- Public API / Helper functions exposed on the 't' (module loader) function ---

  // 't.m' stores the module definitions array, passed in as 'r'.
  t.m = r;

  // 't.c' stores the module cache object 'e'.
  t.c = e;

  /**
   * Defines a non-enumerable getter property on an object (typically an exports object).
   * This is used for creating "live bindings" to properties.
   *
   * @param {object} r - The target object on which to define the property.
   * @param {string} e - The name of the property to define.
   * @param {function} n - The getter function that will be called when the property is accessed.
   */
  t.d = function ( r, e, n ) {
    // Only define the property if it doesn't already exist on the object.
    if ( !t.o( r, e ) ) {
      Object.defineProperty( r, e, {
        enumerable: !0, // Make the property enumerable (visible in for...in loops, etc.).
        get: n // Assign the provided function 'n' as the getter for the property.
      } );
    }
  };

  /**
   * Marks an exports object as an ES Module and sets its Symbol.toStringTag.
   * This helps with interoperability and debugging when dealing with different module systems.
   *
   * @param {object} r - The exports object to modify.
   */
  t.r = function ( r ) {
    // Check if 'Symbol' is defined and 'Symbol.toStringTag' exists.
    // If so, define the Symbol.toStringTag property on the object 'r' with value "Module".
    // The '&&' ensures short-circuiting, and the comma operator ensures the second call always happens.
    "undefined" != typeof Symbol &&
      Symbol.toStringTag &&
      Object.defineProperty( r, Symbol.toStringTag, { value: "Module" } ),
      // Always define the '__esModule' property to 'true' to explicitly mark it as an ES Module.
      Object.defineProperty( r, "__esModule", { value: !0 } );
  };

  /**
   * Provides interoperability logic for different module formats (CommonJS, ES Modules).
   * This function attempts to return a consistent module object regardless of its original format.
   *
   * @param {any} r - The module content, which could be a module ID, a raw value, or an ES Module object.
   * @param {number} e - A bitmask of flags indicating how to interpret and process 'r'.
   * @returns {any} The interop-ed module object.
   */
  t.t = function ( r, e ) {
    // Flag check: (1 & e) indicates 'r' is a module ID that needs to be loaded.
    // If '1 & e' is true, load the module via 't(r)' and assign its exports back to 'r'.
    // The comma operator then evaluates '8 & e', and this result determines the 'if' condition.
    // Flag check: (8 & e) indicates 'r' is already the desired module object.
    if ( ( 1 & e ) && ( r = t( r ) ), 8 & e ) {
      return r;
    }

    // Flag check: (4 & e) indicates 'r' might be an ES Module object.
    // Check if 'r' is an object, not null, and has the '__esModule' flag set to true.
    if ( ( 4 & e ) && typeof r === "object" && r && r.__esModule ) {
      return r;
    }

    // If none of the above, create a new plain object to serve as the interop module.
    var n = Object.create( null );

    // Mark the new object 'n' as an ES Module.
    // Define a 'default' export on 'n' pointing to the original 'r' value.
    // The comma operator ensures these operations are performed.
    // The final part of the condition `(2 & e) && typeof r !== "string"` determines if the `for...in` loop runs.
    if (
      ( t.r( n ), Object.defineProperty( n, "default", { enumerable: !0, value: r } ) ),
      // Flag check: (2 & e) indicates 'r' might have named exports that need to be re-exported.
      // Additionally, ensure 'r' is not a simple string (which wouldn't have properties to re-export).
      ( 2 & e ) && typeof r !== "string"
    ) {
      // Iterate over all enumerable properties 'o' of the original 'r'.
      for ( var o in r ) {
        // For each property, define a getter on 'n' that mirrors the property from 'r'.
        // This creates "live bindings" for named exports.
        t.d(
          n,
          o,
          ( function ( e ) {
            return r[e];
          } ).bind( null, o )
        );
      }
    }

    // Return the newly constructed interop module object.
    return n;
  };

  /**
   * Helper function to get a module's value, preferring the 'default' export for ES Modules.
   * It creates a function that returns either `r.default` (if `r` is an ES module) or `r` itself.
   *
   * @param {object} r - The module object.
   * @returns {function} A function that, when called, returns the module's main value.
   */
  t.n = function ( r ) {
    // Determine the getter function: if 'r' is an ES Module, return its 'default' export, otherwise return 'r' itself.
    var e = r && r.__esModule ?
      function () {
        return r.default;
      } :
      function () {
        return r;
      };
    // Define a special getter 'a' on the function 'e' itself.
    // This is often used to provide a convenient way to access the module's value.
    // The comma operator ensures 't.d' is called, then 'e' is returned.
    return t.d( e, "a", e ), e;
  };

  /**
   * A polyfill-like function to check if an object has a specific property as its own property.
   *
   * @param {object} r - The object to check.
   * @param {string} e - The name of the property to look for.
   * @returns {boolean} True if the object has the property directly, false otherwise.
   */
  t.o = function ( r, e ) {
    // Uses the robust 'hasOwnProperty.call' method for checking own properties.
    return Object.prototype.hasOwnProperty.call( r, e );
  };

  // 't.p' is the public path for assets, typically a string. Here it's an empty string.
  t.p = "";

  // The entry point of the application: load module with ID 0.
  // 't.s = 0' sets the 'start' module ID, then 't(0)' loads it.
  return t( t.s = 0 );
}( [
  /*
   * Module 0: The main application entry point.
   * This module reads input from stdin, processes it, and then delegates to other modules.
   */
  function ( r, e, t ) {
    // Step 1: Load module 2 (which exports the 'fs' module).
    // Step 2: Call 'readFileSync' on the 'fs' module to read from "/dev/stdin" using "UTF-8" encoding.
    // Step 3: Split the read content by newline characters ("\n") into an array of strings.
    // Step 4: Load module 1, and pass the array of lines as an argument to its exported function.
    t( 1 )( t( 2 ).readFileSync( "/dev/stdin", "UTF-8" ).split( "\n" ) );
  },

  /*
   * Module 1: Contains the core logic for solving the problem.
   * It takes processed input lines and determines a "POSSIBLE" or "IMPOSSIBLE" outcome.
   */
  function ( r, e ) {
    /**
     * A utility function designed to safely destructure an iterable into an array,
     * similar to how ES6 array destructuring works. It handles various iterable types.
     *
     * @param {Iterable} r - The iterable (e.g., an array, string, or other iterable object) to destructure.
     * @param {number} [e] - An optional parameter specifying the desired number of elements to extract.
     * @returns {Array} An array containing the destructured elements.
     * @throws {TypeError} If the input 'r' is not an iterable or cannot be destructured.
     */
    function t ( r, e ) {
      // Attempt 1: If 'r' is already an array, return it directly.
      return (
        function ( r ) {
          if ( Array.isArray( r ) ) {
            return r;
          }
        }( r ) ||
        // Attempt 2: If 'r' is an iterable (has a Symbol.iterator), iterate over it.
        function ( r, e ) {
          var t = [], // Array to store extracted elements.
            n = !0, // Flag: true if iterator is not yet done.
            o = !1, // Flag: true if an error occurred during iteration.
            u = void 0; // Stores error if 'o' is true.
          try {
            // Loop through the iterable using its Symbol.iterator.
            for (
              var i,
              l = r[Symbol.iterator](); // Get the iterator from 'r'.
              // Loop condition: continue if not done and (either 'e' is not provided OR 't' hasn't reached 'e' elements).
              !( n = ( i = l.next() ).done ) && ( t.push( i.value ), !e || t.length !== e );
              n = !0
            ) {
              /* No operation needed inside the loop body, as elements are pushed in the condition. */
            }
          } catch ( r ) {
            o = !0; // Mark that an error occurred.
            u = r; // Store the error.
          } finally {
            try {
              // If the iterator wasn't done naturally and has a 'return' method, call it to clean up.
              if ( !n && null != l.return ) {
                l.return();
              }
            } finally {
              // If an error occurred, re-throw it.
              if ( o ) {
                throw u;
              }
            }
          }
          return t; // Return the array of extracted elements.
        }( r, e ) ||
        // Attempt 3: If neither of the above methods succeeded, throw a TypeError.
        function () {
          throw new TypeError( "Invalid attempt to destructure non-iterable instance" );
        }()
      );
    }

    // The main export of Module 1: a function that processes input 'r'.
    r.exports = function ( r ) {
      /*
       * The input 'r' is expected to be an array of strings, typically from stdin.
       * r[0]: The first line, containing two space-separated numbers (e.g., "N M").
       * r[1]: The second line, containing N space-separated numbers (e.g., "a1 a2 ... aN").
       */

      // Parse the first line (r[0]) to extract 'N' and 'M'.
      // Split by space, map to Number, then use the destructuring helper 't' to get two elements.
      var e = t(
          r[0].split( " " ).map( function ( r ) {
            return Number( r );
          } ),
          2 // Expect exactly 2 elements (N and M).
        ),
        n = e[0], // 'n' represents N (the count of numbers in the array).
        o = e[1]; // 'o' represents M (the target value).

      // Parse the second line (r[1]) to get the array of numbers 'u'.
      var u = r[1].split( " " ).map( function ( r ) {
        return Number( r );
      } );

      // Sort the array 'u' in ascending numerical order.
      u.sort( function ( r, e ) {
        return r - e;
      } );

      // Initialize flags for the conditions:
      var i = !1, // 'i' becomes true if any element (excluding the first) is NOT divisible by the first element.
        l = !1; // 'l' becomes true if any element is greater than 'M'.

      // Iterate through the sorted array 'u' from index 0 to n-1.
      for ( var f = 0; f < n; f++ ) {
        // This 'if' statement uses the comma operator for its condition.
        // It's crucial to understand that the expressions before the last comma are evaluated for their side effects,
        // but the final boolean result of the 'if' condition is determined ONLY by the last expression.
        if (
          // Side effect 1: If 'f' is not 0 (i.e., not the first element) AND 'u[f]' is not divisible by 'u[0]',
          // then set 'i' to true. The result of this entire sub-expression is discarded.
          ( 0 != f && u[f] % u[0] != 0 && ( i = !0 ) ),

          // Side effect 2: If 'u[f]' is greater than 'o' (M), then set 'l' to true.
          // The result of this entire sub-expression is discarded.
          ( u[f] > o && ( l = !0 ) ),

          // Final condition: If 'u[f]' is exactly equal to 'o' (M), then the 'if' block is entered.
          u[f] == o
        ) {
          // If an element equal to M is found, the condition is "POSSIBLE".
          // 'void console.log' ensures the return value of console.log is explicitly undefined.
          return void console.log( "POSSIBLE" );
        }
      }

      // After checking all elements, evaluate the final conditions:
      // If both 'i' (non-divisible element found) AND 'l' (element greater than M found) are true,
      // then the condition is "POSSIBLE".
      if ( i && l ) {
        console.log( "POSSIBLE" );
      } else {
        // Otherwise, if the previous 'return' wasn't triggered and both 'i' and 'l' are not true simultaneously,
        // the condition is "IMPOSSIBLE".
        console.log( "IMPOSSIBLE" );
      }
    };
  },

  /*
   * Module 2: A simple module that exports the Node.js built-in 'fs' (file system) module.
   */
  function ( r, e ) {
    // Assign the 'fs' module directly to 'r.exports'.
    r.exports = require( "fs" );
  }
] );