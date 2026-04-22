/*
 * This file implements a simplified module system,
 * similar to a webpack runtime or a custom module loader.
 * It's designed to bundle multiple modules into a single self-executing function.
 */

// The main entry point for the module bundle.
// It exports a function that takes an array of modules 'e'
// and initializes the module loading process.
module.exports = function ( e ) {

   // This object 'r' serves as a cache for already loaded modules.
   // It stores module instances keyed by their module ID.
   var r = {};

   /**
    * The core module loading and caching function.
    * This function 't' (think 'require') is responsible for
    * loading a module by its ID 'n'.
    *
    * @param {number} n The unique identifier for the module to be loaded.
    * @returns {object} The exports object of the requested module.
    */
   function t ( n ) {

      // First, check if the module is already in our cache 'r'.
      if ( r [ n ] ) {
         // If found, return its exports immediately to prevent re-execution.
         return r [ n ].exports;
      }

      // If the module is not in the cache, create a new module object.
      // This object 'o' will hold the module's state.
      var o = r [ n ] = {
         i: n,        // 'i' stands for module ID.
         l: !1,       // 'l' is a boolean flag indicating if the module has been loaded.
         exports: {}  // 'exports' is the object that will contain the module's public API.
      };

      // Execute the module's function.
      // The module function is found in the 'e' array (the bundled modules).
      // It's called with 'o.exports' as 'this', and also passed as arguments:
      // 'o' (module object), 'o.exports' (module exports), and 't' (the loader itself).
      e [ n ] .call ( o.exports, o, o.exports, t );

      // After execution, mark the module as loaded.
      o.l = !0;

      // Finally, return the module's exports.
      return o.exports;
   }


   // Attach the bundled modules array 'e' to the loader function 't' as 't.m'.
   // 'm' likely stands for "modules".
   t.m = e;


   // Attach the module cache 'r' to the loader function 't' as 't.c'.
   // 'c' likely stands for "cache".
   t.c = r;


   /**
    * Define a getter function for an export.
    * This helper 't.d' ensures that a property 'r' is defined on object 'e'
    * with a getter function 'n', making it enumerable.
    *
    * @param {object} e The object on which to define the property.
    * @param {string} r The name of the property to define.
    * @param {Function} n The getter function for the property.
    */
   t.d = function ( e, r, n ) {
      // Check if the property 'r' already exists on object 'e'.
      // If not, define it using Object.defineProperty.
      if ( ! t.o ( e, r ) ) {
         Object.defineProperty ( e, r, {
            enumerable: !0, // Make the property enumerable.
            get: n          // Set the provided function 'n' as the getter.
         } );
      }
   };


   /**
    * Helper for marking an exports object as an ES module.
    * This function 't.r' adds '__esModule' and 'Symbol.toStringTag' properties
    * to the exports object 'e' to signify it as an ES module.
    *
    * @param {object} e The exports object to mark as an ES module.
    */
   t.r = function ( e ) {
      // If Symbol and Symbol.toStringTag are available, define Symbol.toStringTag.
      if ( "undefined" != typeof Symbol && Symbol.toStringTag ) {
         Object.defineProperty ( e, Symbol.toStringTag, {
            value: "Module" // Set its value to "Module".
         } );
      }
      // Always define the __esModule property to true.
      Object.defineProperty ( e, "__esModule", {
         value: !0
      } );
   };


   /**
    * Interop function for handling different module types.
    * This function 't.t' handles various scenarios for module interoperability,
    * such as default exports and namespace objects.
    *
    * @param {*} e The module or module ID.
    * @param {number} r Flags indicating how to interpret the module.
    * @returns {*} The processed module object.
    */
   t.t = function ( e, r ) {
      // Flag 1: If it's a module ID, load it.
      if ( 1 & r && ( e = t ( e ) ) ) { /* no-op, assignment in condition */ }

      // Flag 8: If it's a namespace object, return it as is.
      if ( 8 & r ) {
         return e;
      }

      // Flag 4: If it's an object and already an ES module, return it.
      if ( 4 & r && "object" == typeof e && e && e.__esModule ) {
         return e;
      }

      // Create a new empty object 'n' to serve as a namespace.
      var n = Object.create ( null );

      // Mark the new object 'n' as an ES module.
      t.r ( n );

      // Define a 'default' export on 'n' pointing to 'e'.
      Object.defineProperty ( n, "default", {
         enumerable: !0, // Make it enumerable.
         value: e        // Set its value.
      } );

      // Flag 2: If 'e' is not a string (i.e., it's an object with properties),
      // iterate over its properties and define getters on 'n'.
      if ( 2 & r && "string" != typeof e ) {
         for ( var o in e ) {
            t.d ( n, o, ( function ( r ) {
               return e [ r ];
            } ) .bind ( null, o ) );
         }
      }
      // Return the constructed namespace object.
      return n;
   };


   /**
    * Get a default export from a module.
    * This function 't.n' creates a getter for a module's default export.
    *
    * @param {*} e The module object.
    * @returns {Function} A function that returns the default export.
    */
   t.n = function ( e ) {
      // Determine the getter function: if it's an ES module, return its default;
      // otherwise, return the module itself.
      var r = e && e.__esModule ?
         function () {
            return e.default;
         } :
         function () {
            return e;
         };
      // Define a property 'a' on the getter function 'r' that returns 'r' itself.
      t.d ( r, "a", r );
      // Return the constructed getter.
      return r;
   };


   /**
    * Check if an object has a property.
    * This function 't.o' is a wrapper for Object.prototype.hasOwnProperty.call.
    *
    * @param {object} e The object to check.
    * @param {string} r The property name.
    * @returns {boolean} True if the object has the property, false otherwise.
    */
   t.o = function ( e, r ) {
      return Object.prototype.hasOwnProperty.call ( e, r );
   };


   // Initialize the public path for dynamic imports (though empty here).
   t.p = "";


   // This is the entry point of the application.
   // It loads module 0 (t.s = 0) and executes it.
   t ( t.s = 0 );

} ( // The array of bundled modules (functions) follows here.
   [
      /**
       * Module 0: The main application logic.
       * This module reads from stdin and passes it to module 1.
       *
       * @param {object} e Module object.
       * @param {object} r Exports object.
       * @param {function} t The module loader.
       */
      function ( e, r, t ) {
         // Load module 1, then pass the result of reading from /dev/stdin
         // using module 2 (fs module) to it.
         t ( 1 ) ( t ( 2 ) .readFileSync ( "/dev/stdin", "UTF-8" ) );
      },

      /**
       * Module 1: The core string manipulation logic.
       * This module takes a string, splits it into two lines,
       * and attempts to restore a pattern in the first line.
       *
       * @param {object} e Module object.
       * @param {object} r Exports object.
       */
      function ( e, r ) {

         e.exports = function ( e ) {

            // Split the input string 'e' by newline characters.
            var r = e.split ( "\n" );

            // 't' is the first line, the main string to be processed.
            var t = r [ 0 ];
            // 'n' is the length of the first line.
            var n = t.length;

            // 'o' is the second line, the pattern to search for.
            var o = r [ 1 ];
            // 'u' is the length of the pattern.
            var u = o.length;

            // 'i' will store the starting index of the match, initialized to -1 (no match).
            var i = -1;

            // 'l' represents the current starting position for the pattern in the main string.
            // It iterates backward from the latest possible start position.
            for ( var l = n - u; l >= 0; l-- ) {

               // 'f' (found) flag, assumed true for each potential match.
               var f = !0;

               // Iterate through the pattern's characters.
               for ( var c = 0; c < u; c++ ) {
                  // Check if characters match or if the main string has a '?' wildcard.
                  if ( t [ l + c ] != o [ c ] && "?" != t [ l + c ] ) {
                     // If mismatch and not a wildcard, this is not a valid match.
                     f = !1;
                     // No need to check further for this 'l'.
                     break;
                  }
               }

               // If 'f' is still true, a match was found.
               if ( f ) {
                  i = l;    // Store the starting index of the match.
                  break;    // Exit the outer loop as we found the rightmost match.
               }
            }

            // Check if no match was found or if the pattern is longer than the main string.
            if ( -1 == i || u > n ) {
               console.log ( "UNRESTORABLE" );
            } else {
               // If a match was found, construct the restored string.
               // It's the part before the match + the pattern + the part after the match.
               var a = t.slice ( 0, i ) + o + t.slice ( i + u );

               // Replace any remaining '?' wildcards with 'a'.
               a = a.replace ( /\?/g, "a" );

               // Output the restored string.
               console.log ( a );
            }
         };
      },

      /**
       * Module 2: Provides the Node.js 'fs' (file system) module.
       *
       * @param {object} e Module object.
       * @param {object} r Exports object.
       */
      function ( e, r ) {
         // Simply exports the 'fs' module.
         e.exports = require ( "fs" );
      }

   ]
);