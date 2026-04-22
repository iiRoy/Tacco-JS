/*
 * This is a Type I code clone.
 * All identifiers, variable names, function names, operators, and expressions
 * remain exactly as in the original code.
 * Only whitespace and comments have been altered to provide a visually distinct
 * but functionally identical version of the original JavaScript module.
 */
module . exports = function ( e ) {
  // A cache for loaded modules.
  var t = {};


  /**
   * The webpack require function.
   * This function is responsible for loading and caching modules.
   * @param {number} r - The module ID.
   * @returns {*} The exports of the requested module.
   */
  function n( r ) {
    // If the module is already in the cache, return its exports.
    if ( t [ r ] ) {
      return t [ r ] . exports;
    }

    // Create a new module entry in the cache.
    // 'i' is the module ID, 'l' indicates if the module has been loaded.
    var o = t [ r ] = { i: r , l: !1 , exports: {} };

    // Execute the module function, passing the module object, module exports, and the require function itself.
    e [ r ] . call ( o . exports , o , o . exports , n ) ;

    // Mark the module as loaded.
    o . l = !0 ;

    // Return the module's exports.
    return o . exports ;
  }


  // Store all modules in the 'm' property of the require function.
  return n . m = e ,
  // Store the module cache in the 'c' property.
  n . c = t ,


  /**
   * Define a getter function for enumerable properties.
   * This is used to define exports for modules.
   * @param {object} e - The exports object.
   * @param {string} t - The property name.
   * @param {function} r - The getter function.
   */
  n . d = function ( e , t , r ) {
    // If the property doesn't already exist on the exports object, define it.
    if ( ! n . o ( e , t ) ) {
      Object . defineProperty ( e , t , { enumerable: !0 , get: r } ) ;
    }
  } ,


  /**
   * Define __esModule on exports and set Symbol.toStringTag for ES module compatibility.
   * @param {object} e - The exports object.
   */
  n . r = function ( e ) {
    // For ES module compatibility, if Symbol.toStringTag is available, set it.
    if ( "undefined" != typeof Symbol && Symbol . toStringTag ) {
      Object . defineProperty ( e , Symbol . toStringTag , { value: "Module" } ) ;
    }

    // Mark the module as an ES module.
    Object . defineProperty ( e , "__esModule" , { value: !0 } ) ;
  } ,


  /**
   * Create a namespace object for module exports.
   * This handles various export formats (default export, named exports).
   * @param {*} e - The module or its exports.
   * @param {number} t - Flags indicating export type.
   * @returns {*} The normalized exports object.
   */
  n . t = function ( e , t ) {
    // Flag 1: If it's a module ID, load the module.
    if ( 1 & t && ( e = n ( e ) ) ) {
      /* No-op */
    }

    // Flag 8: If it's already a namespace object, return it.
    if ( 8 & t ) {
      return e;
    }

    // Flag 4: If it's an object and already an ES module, return it.
    if ( 4 & t && "object" == typeof e && e && e . __esModule ) {
      return e;
    }


    // Create a new namespace object.
    var r = Object . create ( null ) ;

    // Mark it as an ES module.
    n . r ( r ) ;

    // Define the 'default' export.
    Object . defineProperty ( r , "default" , { enumerable: !0 , value: e } ) ;

    // Flag 2: If it's not a string, copy all properties from the original exports to the new namespace object.
    if ( 2 & t && "string" != typeof e ) {
      for ( var o in e ) {
        n . d ( r , o , ( function ( t ) {
          return e [ t ] ;
        } ) . bind ( null , o ) ) ;
      }
    }

    // Return the created namespace object.
    return r ;
  } ,


  /**
   * Get the default export of a module.
   * @param {*} e - The module or its exports.
   * @returns {function} A getter function for the default export.
   */
  n . n = function ( e ) {
    // If it's an ES module with a default export, return a function that returns e.default.
    var t = e && e . __esModule ?
      function () {
        return e . default ;
      } :
      // Otherwise, return a function that returns the module itself.
      function () {
        return e ;
      } ;

    // Define a getter 'a' on the function 't' that returns 't'.
    n . d ( t , "a" , t ) ;

    // Return the getter function.
    return t ;
  } ,


  /**
   * Checks if an object has a specified property.
   * @param {object} e - The object to check.
   * @param {string} t - The property name.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  n . o = function ( e , t ) {
    return Object . prototype . hasOwnProperty . call ( e , t ) ;
  } ,


  // Set the public path for webpack assets (empty string for relative paths).
  n . p = "" ,


  // Load the entry module (module 0) and execute it.
  n ( n . s = 0 )
} ( [

  /*
   * Module 0: Entry point.
   * Reads from stdin, processes it, and prints the result.
   */
  function ( e , t , n ) {
    // Require module 1 (the main logic) and pass it the content read from module 2 (fs).
    n ( 1 ) ( n ( 2 ) . readFileSync ( "/dev/stdin" , "UTF-8" ) ) ;
  } ,

  /*
   * Module 1: Main logic for processing the input string.
   * This module calculates the minimum length of a substring that needs to be
   * removed to make all characters in the remaining string identical.
   */
  function ( e , t ) {
    e . exports = function ( e ) {
      // Get the first line of the input string.
      var t = e . split ( "\n" ) [ 0 ] ;

      // 'n' stores the length of the string.
      var n = t . length ;

      // 'r' stores the minimum length found so far, initialized to the full length.
      var r = n ;

      // 'o' stores the current character being compared.
      var o = t [ 0 ] ;

      // 'u' is the loop counter.
      var u = 1 ;

      // Iterate through the string starting from the second character.
      while ( u < n ) {
        // If the current character is different from the previous one.
        if ( o != t [ u ] ) {
          // Calculate the length of the prefix or suffix that would remain if we cut at 'u'.
          // 'i' is the maximum of the current index (prefix length) and remaining length (suffix length).
          var i = Math . max ( u , n - u ) ;

          // If this 'i' is smaller than the current minimum 'r', update 'r'.
          if ( i < r ) {
            r = i ;
          }

          // Update 'o' to the current character for the next comparison.
          o = t [ u ] ;
        }

        // Move to the next character.
        u ++ ;
      }

      // Print the calculated minimum length to the console.
      console . log ( r ) ;
    } ;
  } ,

  /*
   * Module 2: Provides the Node.js 'fs' module.
   */
  function ( e , t ) {
    e . exports = require ( "fs" ) ;
  }
] ) ;