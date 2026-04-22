/* This is a Type I clone of a JavaScript module.
   Whitespace and comments have been extensively modified to alter visual appearance,
   while preserving the exact logical and structural identity of the code. */

module . exports = function ( e ) {
  // 't' serves as a cache for loaded modules, mapping module IDs to their exports.
  var   t   =   {
  } ;

  /**
   * The core module loading function, similar to webpack's __webpack_require__.
   * It retrieves a module from the cache or loads it if not already present.
   *
   * @param {number} n - The unique identifier (ID) of the module to load.
   * @returns {object} The exports object of the requested module.
   */
  function r ( n ) {
    // If the module is already in the cache, return its pre-computed exports.
    if ( t [ n ] ) {
      return t [ n ] . exports ;
    }

    // If not in cache, create a new module entry.
    // 'o' represents the new module object.
    // 'i': module ID.
    // 'l': loaded flag, initially false.
    // 'exports': an empty object where the module's exports will be placed.
    var   o   =   t [ n ]   =   {
      i : n ,
      l : ! ! ! false , // Explicitly setting 'l' to boolean false.
      exports : {
      }
    } ;

    // Execute the module definition function.
    // 'e[n]' is the function for the module with ID 'n'.
    // It is called with 'o.exports' as 'this', and also passed as arguments:
    // 'o' (module object), 'o.exports' (module exports), and 'r' (the require function itself).
    e [ n ] . call ( o . exports ,   o ,   o . exports ,   r ) ;

    // After execution, mark the module as loaded.
    o . l   =   ! 0 ;

    // Return the module's exports.
    return o . exports ;
  }

  // --- Helper properties and methods attached to the 'r' function ---

  // 'r.m' stores the original module definitions object.
  r . m = e ;

  // 'r.c' stores the module cache object.
  r . c = t ;

  /**
   * Defines a getter function for an enumerable property on an object.
   * This is used to expose named exports from ES modules.
   *
   * @param {object} e - The object on which to define the property.
   * @param {string} t - The name of the property to define.
   * @param {function} n - The getter function that will return the property's value.
   */
  r . d = function ( e ,   t ,   n ) {
    // Check if the property does not already exist on the object 'e'.
    if ( ! r . o ( e ,   t ) ) {
      Object . defineProperty ( e ,   t ,   {
        enumerable : ! 0 ,   // Make the property enumerable (visible in for...in loops).
        get : n              // Assign the provided function 'n' as the getter.
      } ) ;
    }
  } ;

  /**
   * Marks an object as an ECMAScript module (ES module).
   * It sets the '__esModule' property to true and potentially 'Symbol.toStringTag'.
   *
   * @param {object} e - The object to mark as an ES module.
   */
  r . r = function ( e ) {
    // If Symbol and Symbol.toStringTag are available, set the toStringTag.
    if ( "undefined" != typeof Symbol && Symbol . toStringTag ) {
      Object . defineProperty ( e ,   Symbol . toStringTag ,   {
        value : "Module"
      } ) ;
    }
    // Always set the '__esModule' flag to true.
    Object . defineProperty ( e ,   "__esModule" ,   {
      value : ! 0
    } ) ;
  } ;

  /**
   * Creates a namespace object for a module, handling various module formats.
   * This function normalizes module exports into a consistent namespace structure.
   *
   * @param {*} e - The module's exports (could be a raw value, an object, etc.).
   * @param {number} t - A bitmask of flags indicating the type/status of the module.
   * @returns {object} A namespace object representing the module's exports.
   */
  r . t = function ( e ,   t ) {
    // Flag 1: If the module is a commonjs module, resolve it using 'r(e)'.
    if ( 1 & t && ( e = r ( e ) ) ) {
      /* No further action if resolved via 'r(e)' */
    }

    // Flag 8: If it's a commonjs module, return its exports directly.
    if ( 8 & t ) {
      return e ;
    }

    // Flag 4: If it's an ES module (object with __esModule: true), return it directly.
    if ( 4 & t && "object" == typeof e && e && e . __esModule ) {
      return e ;
    }

    // Create a new empty object to serve as the namespace.
    var   n   =   Object . create ( null ) ;

    // Mark the new namespace object as an ES module.
    r . r ( n ) ;

    // Define a 'default' export property on the namespace, pointing to the original 'e'.
    Object . defineProperty ( n ,   "default" ,   {
      enumerable : ! 0 ,
      value : e
    } ) ;

    // Flag 2: If 'e' is a commonjs module (and not a string),
    // copy all its properties as named exports to the namespace.
    if ( 2 & t && "string" != typeof e ) {
      for ( var o in e ) {
        r . d ( n ,   o ,   ( function ( t ) {
          return e [ t ] ;
        } ) . bind ( null ,   o ) ) ;
      }
    }

    return n ;
  } ;

  /**
   * Creates a getter function that returns a module's exports.
   * This handles both ES module default exports and regular commonjs exports.
   *
   * @param {*} e - The module's exports.
   * @returns {function} A function that, when called, returns the module's exports.
   */
  r . n = function ( e ) {
    var   t   =   e   &&   e . __esModule   ?
      function ( ) {
        return e . default ; // If it's an ES module, return its 'default' export.
      } :
      function ( ) {
        return e ;             // Otherwise, return the module exports directly.
      } ;

    // Define a property 'a' (for "access") on the getter function 't' itself,
    // which, when accessed, returns the module's exports.
    r . d ( t ,   "a" ,   t ) ;
    return t ;
  } ;

  /**
   * A utility function to check if an object has a specific property directly.
   * It's a wrapper around `Object.prototype.hasOwnProperty.call`.
   *
   * @param {object} e - The object to check.
   * @param {string} t - The name of the property to look for.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  r . o = function ( e ,   t ) {
    return Object . prototype . hasOwnProperty . call ( e ,   t ) ;
  } ;

  // 'r.p' represents the public path for assets, often an empty string in bundled code.
  r . p = "" ;

  // Load the entry module (identified by 'r.s', which is set to 0 here).
  // The result of loading the entry module is the ultimate return value of the IIFE.
  return r ( r . s = 0 ) ;
} ( // The Immediately Invoked Function Expression (IIFE) is called with an array of module definitions.
  [
    /*
     * Module 0: The primary entry point of the application.
     * This module orchestrates reading input and processing it.
     */
    function ( e ,   t ,   r ) {
      // This module calls 'r(1)' (the processing module)
      // with the result of 'r(2).readFileSync("/dev/stdin","UTF-8")'
      // (reading from standard input using the 'fs' module).
      r ( 1 ) ( r ( 2 ) . readFileSync ( "/dev/stdin" ,   "UTF-8" ) ) ;
    } ,

    /*
     * Module 1: Contains the core logic for processing the input data.
     * It exports a function that takes a string and prints a calculated result.
     */
    function ( e ,   t ) {
      e . exports = function ( e ) {
        // This 'for' loop is highly condensed. It declares several variables
        // within its initializer and uses a single, complex ternary expression
        // as its loop body.
        for (
          var   t   =   e . split ( "\n" ) , // 't' becomes an array of lines from the input string.
                r   =   Number ( t [ 0 ] ) , // 'r' parses the first line as the total count of elements.
                n   =   t [ 1 ] . split ( " " ) . map ( function ( e ) {
                  return Number ( e ) ; // 'n' parses the second line into an array of numbers.
                } ) ,
                o   =   0 , // 'o' will store the final count of 'segments'.
                u   =   0 , // 'u' acts as a state flag: 0 for not in a segment, 1 for in a segment.
                i   =   0   ; // 'i' is the loop counter, iterating from 0 up to 'r' (exclusive).
          i   <   r   ;
          i ++
        )
          // The body of the loop is a single, nested ternary operator.
          // It checks if the current number (n[i]) matches its 1-based index (i+1).
          n [ i ]   -   1   ==   i   ?
            // If n[i] is (i+1):
            (
              1   ==   u   ?     // Check if currently in a segment (u == 1).
                u   =   0      // If yes, end the current segment (reset u to 0).
                :                // Else (not in a segment, but found a match):
                ( o   +=   1 ,   // Increment segment count 'o'.
                  u   =   1 )    // Start a new segment (set u to 1).
            )
            :                    // If n[i] is NOT (i+1):
            u   =   0 ;          // Reset segment state (u to 0).

        // After the loop completes, the final calculated segment count 'o' is logged to the console.
        console . log ( o ) ;
      } ;
    } ,

    /*
     * Module 2: A simple utility module that exports the Node.js 'fs' (file system) module.
     * This allows other modules to perform file operations, such as reading from stdin.
     */
    function ( e ,   t ) {
      e . exports = require ( "fs" ) ;
    }
  ]
) ;