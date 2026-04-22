module.exports=function ( t ) {
  // This 'e' object serves as the module cache for the bundled modules.
  var e = {};

  // The custom 'require' function for this bundled environment.
  function r( n ) {
    // If the module is already in our cache, return its exports immediately.
    if ( e[n] ) {
      return e[n].exports;
    }

    // If not, we initialize a new module entry in the cache.
    // 'i.i' stores the module ID, 'i.l' is a boolean indicating if it's loaded,
    // and 'i.exports' is the object that will hold the module's exports.
    var i = e[n] = {
      i: n,
      l: !1,
      exports: {}
    };

    // Execute the module's code. The 't' array contains all module definitions.
    // We call the specific module function 't[n]' with 'i.exports' as 'this' context,
    // and pass 'i', 'i.exports', and our custom 'require' function 'r' as arguments.
    t[n].call( i.exports, i, i.exports, r );

    i.l = !0; // Mark the module as loaded after execution.

    return i.exports; // Return the module's exports object.
  }


  r.m = t; // 'm' property stores all module definitions (the 't' array itself).
  r.c = e; // 'c' property stores the module cache (our 'e' object).


  // 'd' property is a utility function to define a getter property on an object.
  // This is used for compatibility when defining exports.
  r.d = function ( t, e, n ) {
    if ( !r.o( t, e ) ) { // Check if the property 'e' does not already exist on object 't'.
      Object.defineProperty( t, e, {
        enumerable: !0, // Make the property enumerable (visible in for...in loops).
        get: n // Set the getter function for this property.
      } );
    }
  };


  // 'r' property adds '__esModule' and 'Symbol.toStringTag' properties to module exports.
  // This helps identify ES modules and provides a custom string tag.
  r.r = function ( t ) {
    if ( "undefined" != typeof Symbol && Symbol.toStringTag ) {
      Object.defineProperty( t, Symbol.toStringTag, {
        value: "Module"
      } );
    }
    Object.defineProperty( t, "__esModule", {
      value: !0
    } );
  };


  // 't' property is a complex utility for creating a namespace object for module imports.
  // It handles various types of imports (e.g., direct, CommonJS, ES modules).
  r.t = function ( t, e ) {
    if ( 1 & e ) { // If the first bit of 'e' is set, it's a direct import, so require it.
      t = r( t );
    }
    if ( 8 & e ) { // If the eighth bit is set, it's a CommonJS module, return as is.
      return t;
    }
    if ( 4 & e && "object" == typeof t && t && t.__esModule ) { // If it's an ES module, return as is.
      return t;
    }

    var n = Object.create( null ); // Create a new plain object for the namespace.
    r.r( n ); // Mark it as an ES module.
    Object.defineProperty( n, "default", {
      enumerable: !0,
      value: t
    } ); // Define the 'default' export.

    if ( 2 & e && "string" != typeof t ) { // If the second bit is set and it's a non-string CommonJS module.
      for ( var i in t ) { // Iterate over its properties.
        r.d( n, i, function ( e ) {
          return t[e];
        }.bind( null, i ) ); // Define getters for each property on the namespace object.
      }
    }
    return n; // Return the constructed namespace object.
  };


  // 'n' property is a getter function for the default export of a module.
  r.n = function ( t ) {
    var e = t && t.__esModule ? // If it's an ES module with __esModule flag.
      function () {
        return t.default; // Return a function that gets its default export.
      } :
      function () {
        return t; // Otherwise, return a function that returns the module itself.
      };
    r.d( e, "a", e ); // Also define a property 'a' that acts as the getter.
    return e;
  };


  // 'o' property is a simple utility to check if an object has a specific property.
  // It uses Object.prototype.hasOwnProperty.call for robust checking.
  r.o = function ( t, e ) {
    return Object.prototype.hasOwnProperty.call( t, e );
  };


  r.p = ""; // 'p' property specifies the public path for assets (empty in this case).

  // Finally, execute the entry module (module 0) and return its exports.
  return r( r.s = 0 );
}(
  // This array contains all the bundled JavaScript modules.
  [
    /* Module 0: Main Application Entry Point */
    function ( t, e, r ) {
      "use strict"; // Enable strict mode for this module.

      // Require module 1 (the 'fs' Node.js module).
      var n = r( 1 );
      // Require module 2 (the solver interface) and immediately call it.
      // The argument passed to module 2 is the content of '/dev/stdin',
      // read synchronously and decoded as UTF-8.
      r( 2 )( n.readFileSync( "/dev/stdin", "utf8" ) );
    },


    /* Module 1: Node.js 'fs' module */
    function ( t, e ) {
      // This module simply exports the native Node.js 'fs' (file system) module.
      t.exports = require( "fs" );
    },


    /* Module 2: Solver Interface and Setup */
    function ( t, e, r ) {
      "use strict"; // Strict mode.

      // Require module 3 (the InputReader class) and module 5 (the core solving logic).
      var n = r( 3 ),
        i = r( 5 );

      // This module exports a function that takes the raw input string 't'.
      t.exports = function ( t ) {
        // Create a new instance of the InputReader, initialized with the input string.
        var e = new n( t );
        i( e ); // Call the main solving logic function, passing the InputReader instance.
      };
    },


    /* Module 3: InputReader Class Definition */
    function ( t, e, r ) {
      "use strict"; // Strict mode.

      // Require module 4 (the Queue/Deque implementation).
      var n = r( 4 );

      // This module exports the InputReader class.
      t.exports = class {
        // The constructor takes the raw input string.
        constructor( t ) {
          // Trim leading/trailing whitespace and split the string by any whitespace
          // into an array of tokens.
          var e = t.trim().split( /\s+/g );
          // Initialize an internal input queue/deque using the class from module 4,
          // populated with the parsed tokens.
          this.inp = new n( e );
        }

        // Method to dequeue and return a raw string token.
        inr() {
          return this.inp.deq();
        }

        // Method to dequeue a token, parse it as an integer (base 10), and return it.
        in () {
          return parseInt( this.inp.deq(), 10 );
        }

        // Method to clear the internal input queue.
        fin() {
          this.inp.clear();
        }
      };
    },


    /* Module 4: Queue/Deque Class Implementation */
    function ( t, e, r ) {
      "use strict"; // Strict mode.

      // This module exports a simple Queue/Deque class.
      t.exports = class {
        // The constructor can optionally take an initial array of items.
        constructor() {
          var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
          this.size = t.length; // Initialize size based on initial items.
          this.items = t; // Store the items array.
          this.ind = 0; // 'ind' points to the next item to be dequeued.
        }

        // Enqueue an item: add it to the end of the queue.
        enq( t ) {
          this.size += 1;
          this.items.push( t );
        }

        // Dequeue an item: remove and return the item from the front of the queue.
        deq() {
          var t = this.items[ this.ind ]; // Get the item at the current index.
          this.size -= 1; // Decrement the size.
          this.ind += 1; // Advance the index for the next dequeue.
          return t; // Return the dequeued item.
        }

        // Clear the queue: reset all internal state.
        clear() {
          this.items = []; // Empty the items array.
          this.size = 0; // Reset size to 0.
          this.ind = 0; // Reset index to 0.
        }
      };
    },


    /* Module 5: The Actual Logic for Solving the Problem */
    function ( t, e, r ) {
      "use strict"; // Strict mode.

      // This module exports the main problem-solving function.
      t.exports = function ( t ) {
        // 'e' stores the total number of people/statements.
        for (
          var e = t.in(),
            r = new Array( e ), // 'r' will store arrays of statements for each person.
            n = new Array( e ), // 'n' will store the count of statements made by each person.
            i = 0; // Loop counter for iterating through people.
          i < e; // Loop until all 'e' people have been processed.
          i++ // Increment person counter.
        ) {
          n[i] = t.in(); // Read the number of statements made by person 'i'.
          for (
            var o = new Array( n[i] ), // 'o' will store the statements for the current person.
              s = 0; // Loop counter for iterating through statements of the current person.
            s < n[i]; // Loop until all statements by person 'i' are read.
            s++ // Increment statement counter.
          ) {
            var u = t.in() - 1, // Read the person being referred to (0-indexed).
              a = t.in(); // Read the stated honesty (0 for dishonest, 1 for honest).
            o[s] = {
              x: u,
              y: a
            }; // Store the statement as an object {referred_person_index, honesty_value}.
          }
          r[i] = o; // Assign the array of statements to the current person.
        }

        var c = 0; // 'c' will store the maximum number of honest people found so far.

        // This loop iterates through all possible combinations of honest/dishonest people.
        // There are 2^e combinations, represented by bitmasks from 0 to (1 << e) - 1.
        for ( var f = 0; f < ( 1 << e ); f++ ) {
          var l = !0; // 'l' is a flag; true if the current combination 'f' is consistent, false otherwise.
          var p = 0; // 'p' counts the number of people assumed to be honest in the current combination 'f'.

          // Iterate through each person to check their consistency with the current combination 'f'.
          for ( var d = 0; d < e; d++ ) {
            // Check if the 'd'-th bit of 'f' is 1, meaning person 'd' is assumed honest in this combination.
            if ( ( f >> d ) % 2 == 1 ) {
              p++; // Increment the count of honest people.
              // For each statement made by this honest person 'd'.
              for ( var v = n[d], h = 0; h < v; h++ ) {
                // Check if person 'd's statement about person r[d][h].x's honesty (r[d][h].y)
                // matches the assumed honesty of person r[d][h].x in the current combination 'f'.
                // (f >> r[d][h].x) % 2 gives the assumed honesty of the referred person.
                if ( ( f >> r[d][h].x ) % 2 != r[d][h].y ) {
                  l = !1; // If inconsistent, mark the combination as invalid.
                  break; // No need to check further statements for this person.
                }
              }
              if ( !l ) { // If an inconsistency was found for person 'd'.
                break; // No need to check further people for this combination 'f'.
              }
            }
          }
          if ( l ) { // If the combination 'f' was found to be consistent (the flag 'l' is still true).
            c = Math.max( p, c ); // Update 'c' with the maximum of current honest count 'p' and previous max 'c'.
          }
        }
        console.log( c ); // Print the maximum number of honest people found.
      };
    }
  ]
);