module.exports = function ( r ) {
  // This 't' object serves as a cache for loaded modules.
  var t = {};

  /**
   * The main module loading function.
   * It mimics a 'require' call.
   * @param {number} n The ID of the module to load.
   * @returns {any} The exports of the requested module.
   */
  function e ( n ) {
    // If the module is already in the cache, return its exports.
    if ( t[ n ] ) {
      return t[ n ].exports;
    }

    // If not in cache, create a new module object and store it.
    var o = t[ n ] = {
      i: n,       // module id
      l: false,   // loaded flag (initially false)
      exports: {} // module exports object
    };

    // Execute the module function, providing it with 'module', 'exports', and 'require'.
    r[ n ].call( o.exports, o, o.exports, e );

    // Mark the module as loaded after execution.
    o.l = true;

    // Return the module's exports.
    return o.exports;
  }

  // Store the modules array on the loader function.
  e.m = r;

  // Store the module cache on the loader function.
  e.c = t;

  /**
   * Defines an enumerable getter property on an object.
   * Used for ES module compatibility.
   * @param {object} r_obj The object to define the property on.
   * @param {string} t_prop The name of the property.
   * @param {Function} n_getter The getter function for the property.
   */
  e.d = function ( r_obj, t_prop, n_getter ) {
    if ( !e.o( r_obj, t_prop ) ) { // Check if property doesn't already exist.
      Object.defineProperty( r_obj, t_prop, {
        enumerable: true, // Make the property enumerable.
        get: n_getter     // Assign the provided getter.
      } );
    }
  };

  /**
   * Marks an object as an ES module by setting '__esModule' and 'Symbol.toStringTag'.
   * @param {object} r_obj The object to mark as an ES module.
   */
  e.r = function ( r_obj ) {
    if ( typeof Symbol !== "undefined" && Symbol.toStringTag ) {
      Object.defineProperty( r_obj, Symbol.toStringTag, {
        value: "Module"
      } );
    }
    Object.defineProperty( r_obj, "__esModule", {
      value: true
    } );
  };

  /**
   * Creates a namespace object for a module, handling different import types.
   * @param {any} r_module The module's exports or ID.
   * @param {number} t_mode Flags indicating the import mode.
   * @returns {object} The namespace object or the module itself.
   */
  e.t = function ( r_module, t_mode ) {
    // If mode 1 (e.g., `require(id)`), resolve the module first.
    if ( 1 & t_mode && ( r_module = e( r_module ) ) );

    // If mode 8, return the module directly.
    if ( 8 & t_mode ) {
      return r_module;
    }

    // If mode 4 and it's an ES module, return it directly.
    if ( 4 & t_mode && typeof r_module === "object" && r_module && r_module.__esModule ) {
      return r_module;
    }

    // Otherwise, create a new namespace object.
    var n = Object.create( null );

    // Mark the new object as an ES module.
    e.r( n );

    // Define a 'default' export pointing to the module.
    Object.defineProperty( n, "default", {
      enumerable: true,
      value: r_module
    } );

    // If mode 2 and the module is not a string, copy all properties from the module.
    if ( 2 & t_mode && typeof r_module !== "string" ) {
      for ( var o in r_module ) {
        e.d( n, o, ( function ( t_prop ) {
          return r_module[ t_prop ];
        } ).bind( null, o ) );
      }
    }

    return n;
  };

  /**
   * Helper to get the default export of a module, handling CommonJS and ES modules.
   * @param {any} r_module The module's exports.
   * @returns {Function} A getter function for the default export.
   */
  e.n = function ( r_module ) {
    var t = r_module && r_module.__esModule ?
      function () {
        return r_module.default;
      } :
      function () {
        return r_module;
      };
    e.d( t, "a", t ); // Define a getter 'a' that returns the getter function itself.
    return t;
  };

  /**
   * Wrapper for Object.prototype.hasOwnProperty.call.
   * @param {object} r_obj The object to check.
   * @param {string} t_prop The property name.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  e.o = function ( r_obj, t_prop ) {
    return Object.prototype.hasOwnProperty.call( r_obj, t_prop );
  };

  // Public path for assets (empty string in this bundle).
  e.p = "";

  // Set the entry module ID and immediately execute it.
  return e( e.s = 0 );

  // Array containing all the modules.
}( [
  /* Module 0: The entry point of the application. */
  function ( r, t, e ) {
    // This module reads from /dev/stdin using the 'fs' module (e(2))
    // and then processes the content using the logic in module 1 (e(1)).
    e( 1 )( e( 2 ).readFileSync( "/dev/stdin", "UTF-8" ) );
  },

  /* Module 1: Contains the main problem-solving logic. */
  function ( r, t ) {

    /**
     * Helper function for destructuring array-like objects.
     * Mimics Babel's _iterableToArrayLimit.
     * @param {Iterable} r_iterable The iterable to convert/destructure.
     * @param {number} t_limit The maximum number of elements to take.
     * @returns {Array} An array of elements.
     * @throws {TypeError} If the input is not iterable.
     */
    function e ( r_iterable, t_limit ) {
      if ( Array.isArray( r_iterable ) ) {
        return r_iterable;
      } else if ( ( function ( r_target, t_count ) {
          var e_arr = [];
          var n_done = true;
          var o_error = false;
          var u_exception = undefined;
          try {
            for ( var i_iterator, f_next_val = r_target[ Symbol.iterator ]();
                  !( n_done = ( i_iterator = f_next_val.next() ).done ) &&
                  ( e_arr.push( i_iterator.value ), !t_count || e_arr.length !== t_count );
                  n_done = true ) {
              // Loop body is intentionally empty.
            }
          } catch ( r_err ) {
            o_error = true;
            u_exception = r_err;
          } finally {
            try {
              if ( !n_done && f_next_val.return != null ) {
                f_next_val.return();
              }
            } finally {
              if ( o_error ) {
                throw u_exception;
              }
            }
          }
          return e_arr;
        } )( r_iterable, t_limit ) ) {
        return ( function ( r_target, t_count ) {
          var e_arr = [];
          var n_done = true;
          var o_error = false;
          var u_exception = undefined;
          try {
            for ( var i_iterator, f_next_val = r_target[ Symbol.iterator ]();
                  !( n_done = ( i_iterator = f_next_val.next() ).done ) &&
                  ( e_arr.push( i_iterator.value ), !t_count || e_arr.length !== t_count );
                  n_done = true ) {
              // Loop body is intentionally empty.
            }
          } catch ( r_err ) {
            o_error = true;
            u_exception = r_err;
          } finally {
            try {
              if ( !n_done && f_next_val.return != null ) {
                f_next_val.return();
              }
            } finally {
              if ( o_error ) {
                throw u_exception;
              }
            }
          }
          return e_arr;
        } )( r_iterable, t_limit );
      } else {
        throw new TypeError( "Invalid attempt to destructure non-iterable instance" );
      }
    }

    // Export the main function of this module.
    r.exports = function ( r_input_string ) {
      // Process the input string to extract two numbers.
      // 1. Split by newline to get the first line.
      // 2. Split the first line by space.
      // 3. Convert each part to a number.
      // 4. Use the 'e' helper to destructure the array into 'n' and 'o'.
      var t_parsed_numbers = e(
        r_input_string.split( "\n" )[ 0 ]
                      .split( " " )
                      .map( function ( r_str_num ) {
                        return Number( r_str_num );
                      } ),
        2
      );

      var n = t_parsed_numbers[ 0 ]; // First number.
      var o = t_parsed_numbers[ 1 ]; // Second number.

      var u = 0; // Initialize sum accumulator.
      var i = 1; // Loop counter, starting from 1.

      // Iterate from 1 up to 'n'.
      for ( ; i <= n; i++ ) {
        var f = n % i; // Calculate the remainder.

        // Perform the calculation and add to the sum.
        u += Math.floor( n / i ) * Math.max( 0, i - o ) +
             Math.max( 0, f - o + 1 );
      }

      // Special handling for when 'o' is 0.
      if ( 0 === o ) {
        u -= n;
      }

      // Output the final calculated sum to the console.
      console.log( u );
    };
  },

  /* Module 2: Exports the Node.js 'fs' (file system) module. */
  function ( r, t ) {
    r.exports = require( "fs" );
  }
] );