/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved exactly as they were in the original source.
 *
 * Only whitespace (indentation, spacing, blank lines) and comments have been altered.
 * The purpose is to demonstrate a visually distinct but functionally identical clone.
 *
 * This structure is typical of Webpack's module bundling output.
 */

// Exporting the main function that sets up the module system
module .exports = function ( t ) {
  // e: The module cache, stores already loaded modules.
  var e = {};

  /**
   * r: The Webpack 'require' function.
   * It loads modules, executes them, and caches their exports.
   * @param {number} n - The module ID to load.
   * @returns {*} The exports of the requested module.
   */
  function r (n) {
    // If module is already in cache, return its exports.
    if ( e [ n ] ) {
      return e[n].exports;
    }

    // Create a new module entry in the cache.
    // i: The module object itself.
    var i = ( e [ n ] = {
      i: n,          // Module ID
      l: false,      // Loaded flag (false = not loaded yet)
      exports: {}    // Module exports object
    } );

    // Execute the module function, passing module object, module exports, and require function.
    t [ n ] . call ( i . exports , i , i . exports , r ) ;

    // Mark the module as loaded.
    i.l = true;

    // Return the module's exports.
    return i.exports;
  }

  // --- Webpack runtime helper functions ---

  // r.m: Stores all module functions (the 'modules' array passed to the IIFE).
  r . m = t ;

  // r.c: Stores the module cache (the 'e' object).
  r . c = e ;

  // r.d: Defines a getter function for a module export.
  r . d = function ( t , e , n ) {
    // If the property doesn't exist on the target object, define it.
    if ( ! r . o ( t , e ) ) {
      Object . defineProperty ( t , e , {
        enumerable : true , // Make it enumerable
        get : n             // Use the provided getter function
      } ) ;
    }
  } ;

  // r.r: Adds __esModule and Symbol.toStringTag properties to a module's exports.
  r . r = function ( t ) {
    // If Symbol is available and toStringTag exists, define it for better module identification.
    if ( "undefined" != typeof Symbol && Symbol . toStringTag ) {
      Object . defineProperty ( t , Symbol . toStringTag , { value : "Module" } ) ;
    }
    // Mark the module as an ES module.
    Object . defineProperty ( t , "__esModule" , { value : true } ) ;
  } ;


  // r.t: Creates a fake namespace object for module compatibility.
  r . t = function ( t , e ) {
    // If flag 1 is set, resolve the module (t might be an ID).
    if ( 1 & e ) {
      t = r ( t ) ;
    }

    // If flag 8 is set, just return t as is (raw module).
    if ( 8 & e ) {
      return t ;
    }

    // If flag 4 is set and t is an object and an ES module, return it directly.
    if ( 4 & e && "object" == typeof t && t && t . __esModule ) {
      return t ;
    }

    // Create a new empty object for the namespace.
    var n = Object . create ( null ) ;

    // Register it as an ES module.
    r . r ( n ) ;

    // Define 'default' export.
    Object . defineProperty ( n , "default" , { enumerable : true , value : t } ) ;

    // If flag 2 is set and t is not a string, copy all properties from t to n.
    if ( 2 & e && "string" != typeof t ) {
      for ( var i in t ) {
        r . d ( n , i , ( function ( e ) {
          return t [ e ] ;
        } ) . bind ( null , i ) ) ;
      }
    }

    // Return the created namespace object.
    return n ;
  } ;

  // r.n: Gets the default export of a module.
  r . n = function ( t ) {
    var e =
      t && t . __esModule
        ? function () {
            return t . default ;
          }
        : function () {
            return t ;
          } ;

    r . d ( e , "a" , e ) ; // Define 'a' as an alias for the default export getter.
    return e ;
  } ;


  // r.o: Checks if an object has a specific property. (Object.prototype.hasOwnProperty.call)
  r . o = function ( t , e ) {
    return Object . prototype . hasOwnProperty . call ( t , e ) ;
  } ;

  // r.p: Public path for assets. (Often an empty string for relative paths).
  r . p = "" ;

  // Start the application by requiring the entry module (module 0).
  return r ( r . s = 0 ) ;

// The array of modules, indexed by their ID.
} ( [
  /* Module 0: Main entry point */
  function ( t , e , r ) {
    "use strict" ; // Enforce strict mode for this module.

    // Require module 1 (which exports 'fs').
    var n = r ( 1 ) ;

    // Require module 2, passing the result of reading /dev/stdin using 'fs'.
    r ( 2 ) ( n . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
  } ,

  /* Module 1: 'fs' (file system) module */
  function ( t , e ) {
    t . exports = require ( "fs" ) ; // Export Node.js 'fs' module.
  } ,

  /* Module 2: Main logic handler */
  function ( t , e , r ) {
    "use strict" ;

    // Require module 3 (InputReader class).
    var n = r ( 3 ) ;
    // Require module 5 (the core problem solver logic).
    var i = r ( 5 ) ;

    // Export a function that takes input string, creates an InputReader, and calls the solver.
    t . exports = function ( t ) {
      var e = new n ( t ) ; // Create a new InputReader instance.
      i ( e ) ;             // Pass the InputReader to the solver.
    } ;
  } ,

  /* Module 3: InputReader class */
  function ( t , e , r ) {
    "use strict" ;

    // Require module 4 (Queue class).
    var n = r ( 4 ) ;

    // Export the InputReader class.
    t . exports = class {
      // Constructor takes the raw input string.
      constructor ( t ) {
        // Trim whitespace, split by whitespace, and create a new queue.
        var e = t . trim ( ) . split ( / \s + / g ) ;
        this . inp = new n ( e ) ; // Store the queue of input tokens.
      }

      // Read a string token from input.
      inr ( ) {
        return this . inp . deq ( ) ;
      }

      // Read an integer from input.
      in ( ) {
        return parseInt ( this . inp . deq ( ) , 10 ) ;
      }

      // Clear the input buffer.
      fin ( ) {
        this . inp . clear ( ) ;
      }
    } ;
  } ,

  /* Module 4: Queue class */
  function ( t , e , r ) {
    "use strict" ;

    // Export the Queue class.
    t . exports = class {
      // Constructor can optionally take an initial array of items.
      constructor ( ) {
        var t = arguments . length > 0 && void 0 !== arguments [ 0 ] ? arguments [ 0 ] : [ ] ;
        this . size = t . length ; // Current number of items in the queue.
        this . items = t ;         // The underlying array storing items.
        this . ind = 0 ;           // Index of the next item to dequeue.
      }

      // Enqueue an item.
      enq ( t ) {
        this . size += 1 ;
        this . items . push ( t ) ;
      }

      // Dequeue an item.
      deq ( ) {
        var t = this . items [ this . ind ] ;
        this . size -= 1 ;
        this . ind += 1 ;
        return t ;
      }

      // Clear the queue.
      clear ( ) {
        this . items = [ ] ;
        this . size = 0 ;
        this . ind = 0 ;
      }
    } ;
  } ,

  /* Module 5: Core problem solver (dynamic programming) */
  function ( t , e , r ) {
    "use strict" ;

    // Export the solver function.
    t . exports = function ( t ) {
      // Read the input string (e.g., "12?3").
      var e = t . inr ( ) ;
      var r = e . length ; // Length of the input string.

      // Initialize a 2D array 'n' (dp table) of size (r+1) x 13, filled with zeros.
      // n[i][j] will store the number of ways to form a number of length 'i'
      // that has a remainder 'j' when divided by 13.
      var n = new Array ( r ) ;
      var i = 0 ;
      while ( i <= r ) {
        n [ i ] = new Array ( 13 ) . fill ( 0 ) ;
        i ++ ;
      }

      // Base case: An empty string (length 0) has 1 way to form a number with remainder 0.
      n [ 0 ] [ 0 ] = 1 ;

      // Iterate through each character of the input string.
      // 'o' represents the current length of the prefix being considered.
      for ( var o = 1 ; o <= r ; o ++ ) {
        // If the current character is a '?' (wildcard).
        if ( "?" == e [ o - 1 ] ) {
          // Iterate through all possible previous remainders.
          for ( var s = 0 ; s < 13 ; s ++ ) {
            // Iterate through all possible digits (0-9) for the '?'.
            for ( var u = 0 ; u < 10 ; u ++ ) {
              // Calculate the new remainder.
              // (previous remainder * 10 + current digit) % 13
              n [ o ] [ ( 10 * s + u ) % 13 ] += n [ o - 1 ] [ s ] ;
              // Apply modulo to prevent integer overflow.
              n [ o ] [ ( 10 * s + u ) % 13 ] %= 1000000007 ;
            }
          }
        } else {
          // If the current character is a specific digit.
          var c = Number ( e [ o - 1 ] ) ; // Convert character to number.

          // Iterate through all possible previous remainders.
          for ( var f = 0 ; f < 13 ; f ++ ) {
            // Calculate the new remainder.
            n [ o ] [ ( 10 * f + c ) % 13 ] += n [ o - 1 ] [ f ] ;
            // Apply modulo.
            n [ o ] [ ( 10 * f + c ) % 13 ] %= 1000000007 ;
          }
        }
      }

      // The final answer is the number of ways to form a number of length 'r'
      // that has a remainder of 5 when divided by 13.
      console . log ( n [ r ] [ 5 ] ) ;
    } ;
  }
] ) ;