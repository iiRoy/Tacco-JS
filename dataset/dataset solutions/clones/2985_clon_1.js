! function ( n ) {
  // This is the webpack bootstrap function.
  // It initializes and exports modules.

  // The 't' object serves as a cache for loaded modules.
  var t = {};

  /**
   * The webpack require function.
   * @param {string} r - The module ID.
   * @returns {object} The exports of the required module.
   */
  function e( r ) {
    // If the module is already in cache, return its exports.
    if ( t[ r ] ) {
      return t[ r ].exports;
    }

    // Create a new module entry in the cache.
    // 'i': module ID
    // 'l': loaded status (false initially)
    // 'exports': the exports object (empty initially)
    var u = t[ r ] = {
      i: r,
      l: !1,
      exports: {}
    };

    // Execute the module function, populating 'u.exports'.
    // 'n[r]' is the module function itself.
    // 'u.exports' is the 'exports' object passed to the module.
    // 'u' is the module object.
    // 'e' is the local 'require' function for the module.
    n[ r ].call( u.exports, u, u.exports, e );

    // Mark the module as loaded.
    u.l = !0;

    // Return the module's exports.
    return u.exports;
  }

  // Store all module functions on 'e.m' (modules).
  e.m = n;

  // Store the module cache on 'e.c' (cache).
  e.c = t;

  /**
   * Define a getter function for an export property.
   * Used for compatibility with non-ESM modules.
   * @param {object} n - The exports object.
   * @param {string} t - The property name.
   * @param {function} r - The getter function.
   */
  e.d = function ( n, t, r ) {
    // Only define if the property doesn't already exist.
    if ( !e.o( n, t ) ) {
      Object.defineProperty( n, t, {
        enumerable: !0, // Make it enumerable
        get: r // Set the getter function
      } );
    }
  };

  /**
   * Define __esModule on exports.
   * Used to mark an exports object as an ES module.
   * @param {object} n - The exports object.
   */
  e.r = function ( n ) {
    // If Symbol.toStringTag is supported, set it to "Module".
    if ( "undefined" != typeof Symbol && Symbol.toStringTag ) {
      Object.defineProperty( n, Symbol.toStringTag, {
        value: "Module"
      } );
    }

    // Define __esModule property to true.
    Object.defineProperty( n, "__esModule", {
      value: !0
    } );
  };

  /**
   * Compatibility function for various module systems.
   * @param {any} n - The module or export.
   * @param {number} t - Flags indicating how to interpret 'n'.
   * @returns {any} The resolved module exports.
   */
  e.t = function ( n, t ) {
    // If flag 1 is set, 'n' is a module ID, so require it.
    if ( 1 & t ) {
      n = e( n );
    }

    // If flag 8 is set, return 'n' as is (raw module).
    if ( 8 & t ) {
      return n;
    }

    // If flag 4 is set and 'n' is an object and an ES module, return it.
    if ( 4 & t && "object" == typeof n && n && n.__esModule ) {
      return n;
    }

    // Create a new empty object to hold interop exports.
    var r = Object.create( null );

    // Mark it as an ES module.
    e.r( r );

    // Define a 'default' property pointing to 'n'.
    Object.defineProperty( r, "default", {
      enumerable: !0,
      value: n
    } );

    // If flag 2 is set and 'n' is not a string,
    // copy all properties from 'n' to 'r' except 'default'.
    if ( 2 & t && "string" != typeof n ) {
      for ( var u in n ) {
        e.d( r, u, function ( t ) {
          return n[ t ];
        }.bind( null, u ) );
      }
    }

    // Return the interop exports object.
    return r;
  };

  /**
   * Create a getter function for the default export.
   * @param {any} n - The module or exports object.
   * @returns {function} A getter function that returns the default export.
   */
  e.n = function ( n ) {
    // If 'n' is an ES module and has a default, return a function that gets it.
    // Otherwise, return a function that returns 'n' itself.
    var t = n && n.__esModule ?
      function () {
        return n.default;
      } :
      function () {
        return n;
      };

    // Define a getter 'a' on the function 't' that also returns 't'.
    e.d( t, "a", t );

    // Return the getter function.
    return t;
  };

  /**
   * Check if an object has a property.
   * @param {object} n - The object to check.
   * @param {string} t - The property name.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  e.o = function ( n, t ) {
    return Object.prototype.hasOwnProperty.call( n, t );
  };

  // Set the public path for webpack assets (empty in this case).
  e.p = "";

  // Execute the entry module (module ID 2).
  e( e.s = 2 );

}( [
  // --- Module Definitions ---

  /**
   * Module 0: 'fs' (file system) Node.js module.
   * Exports the Node.js 'require("fs")'.
   */
  function ( n, t ) {
    n.exports = require( "fs" );
  },

  /**
   * Module 1: 'readline' Node.js module.
   * Exports the Node.js 'require("readline")'.
   */
  function ( n, t ) {
    n.exports = require( "readline" );
  },

  /**
   * Module 2: Main application logic.
   * This module contains the solutions to various programming problems.
   */
  function ( n, t, e ) {
    "use strict"; // Enforce strict mode.

    // Mark 't' (module.exports) as an ES module.
    e.r( t );


    // --- Problem Set 'r': beginner_contest_122 ---
    var r = {
      /**
       * Problem A: Double Helix.
       * Given a nucleotide, return its complementary base.
       * @param {string[]} n - An array containing the input nucleotide.
       * @returns {string[]} An array containing the complementary base.
       */
      A_DoubleHelix: function ( n ) {
        switch ( n[ 0 ] ) {
          case "A":
            return [ "T" ];
          case "T":
            return [ "A" ];
          case "C":
            return [ "G" ];
          case "G":
            return [ "C" ];
          default:
            throw new Error( "invalid string" );
        }
      },

      /**
       * Problem B: ATCoder.
       * Find the length of the longest contiguous subsequence of ACGT.
       * @param {string[]} n - An array containing the input string.
       * @returns {string[]} An array containing the maximum length as a string.
       */
      B_ATCoder: function ( n ) {
        // 't' here refers to the input string.
        for (
          var t = n[ 0 ],
            e = 0, // 'e' stores the maximum length found so far.
            r = 0, // 'r' is the loop counter.
            u = 0; // 'u' stores the current contiguous length.
          r < t.length; r += 1
        ) {
          // 'o' is the current character.
          o = t[ r ];

          // Check if the character is one of 'A', 'T', 'C', 'G'.
          if ( "A" === o || "T" === o || "C" === o || "G" === o ) {
            u += 1; // Increment current length.
          } else {
            // If not a valid character, check if current length is max.
            if ( u > e ) {
              e = u;
            }
            u = 0; // Reset current length.
          }
        }

        var o; // Declare 'o' outside loop for hoisting consistency.

        // After loop, check if the last sequence is the maximum.
        if ( u > e ) {
          e = u;
        }

        return [ String( e ) ];
      },

      /**
       * Problem C: GeT AC.
       * Count occurrences of "AC" substring within given ranges.
       * @param {string[]} n - Input lines: [N M, S, L1 R1, L2 R2, ...]
       * @returns {string[]} An array of strings, each being the count for a query.
       */
      C_GeT_AC: function ( n ) {
        // Parse N and M from the first line (unused explicitly, but part of input format).
        var t = n[ 0 ].split( " " ).map( function ( n ) {
            return Number( n );
          } ),
          // 'e' is the string S.
          e = ( t[ 0 ], t[ 1 ], n[ 1 ] ),
          // 'r' are the query ranges [Li, Ri].
          r = n.slice( 2 ).map( function ( n ) {
            return n.split( " " ).map( function ( n ) {
              return Number( n );
            } );
          } ),
          // 'u' is a boolean array indicating if S[i] and S[i+1] form "AC".
          u = e.split( "" ).map( function ( n, t, e ) {
            return "A" === n && e.length > t + 1 && "C" === e[ t + 1 ];
          } );

        // Process each query.
        return r.map( function ( n ) {
          // 't' is L, 'e' is R for the current query.
          for (
            var t = n[ 0 ],
              e = n[ 1 ],
              r = 0, // 'r' is the count of "AC" for this query.
              o = t - 1; // 'o' is the 0-indexed start of the range.
            o < e - 1; o += 1
          ) {
            // If 'u[o]' is true, it means S[o]S[o+1] is "AC".
            if ( u[ o ] ) {
              r += 1;
            }
          }
          return String( r );
        } );
      }
    };


    // --- Problem Set 'u': Diverta2019ProgrammingContest ---
    // Note: The problem names 'c' and 'd' here are internal function names,
    // not directly corresponding to problem labels like A, B, C, D.
    // The main entry point 'y.Diverta2019ProgrammingContest.d' uses the 'd' function.
    var u = {
      /**
       * Function 'c' for Diverta2019ProgrammingContest.
       * This problem seems to involve counting specific string patterns.
       * @param {string[]} n - Input lines.
       * @returns {string[]} An array containing the result as a string.
       */
      c: function ( n ) {
        // Parse N from the first line (unused explicitly, but part of input format).
        n[ 0 ].split( " " ).map( function ( n ) {
          return Number( n );
        } )[ 0 ];

        var t = n.slice( 1 ), // 't' is an array of strings (lines after N).
          e = 0, // 'e' counts "AB" substrings.
          r = 0, // 'r' counts strings ending with 'A'.
          u = 0, // 'u' counts strings starting with 'B'.
          o = 0; // 'o' counts strings starting with 'B' AND ending with 'A'.

        // Iterate over each string in 't'.
        t.forEach( function ( n, t ) {
          // Check if string starts with 'B'.
          if ( "B" === n[ 0 ] ) {
            u += 1;
          }
          // Check if string ends with 'A'.
          if ( "A" === n[ n.length - 1 ] ) {
            r += 1;
          }
          // Check if string starts with 'B' AND ends with 'A'.
          if ( "B" === n[ 0 ] && "A" === n[ n.length - 1 ] ) {
            o += 1;
          }

          // Count occurrences of "AB" substring.
          e += ( n.match( /AB/g ) || [] ).length;
        } );

        // Calculate the final result based on counts.
        if ( r - o == 0 && u - o == 0 ) {
          return [ String( e + o - 1 ) ];
        } else {
          return [ String( r < u ? r + e : u + e ) ];
        }
      },

      /**
       * Function 'd' for Diverta2019ProgrammingContest.
       * This problem seems to involve finding divisors or properties related to numbers.
       * @param {string[]} n - An array containing the input number as a string.
       * @returns {string[]} An array containing the sum of divisors as a string.
       */
      d: function ( n ) {
        // Parse the input number 'N'.
        for (
          var t = n[ 0 ].split( " " ).map( function ( n ) {
              return Number( n );
            } )[ 0 ],
            e = 0, // 'e' accumulates the sum.
            r = Math.sqrt( t ), // Calculate square root for optimization.
            u = 1; // 'u' is the divisor.
          u < r; u += 1
        ) {
          // Check if 'u' is a divisor of 't'.
          // 'o' is the other divisor (t / u).
          var o = ( t - u ) / u;

          // If 'o' is an integer, it means 'u' divides 't' evenly.
          if ( Number.isInteger( o ) ) {
            e += o; // Add the other divisor to the sum.
          }
        }
        return [ String( e ) ];
      }
    };


    // --- Helper variables for GrandContest029 (problem 'l') ---
    var o = !0, // Boolean true.
      i = !1; // Boolean false.

    /**
     * Helper function 'c' for AIrreversibleOperation.
     * Recursively calculates the maximum number of operations.
     * @param {boolean[]} n - An array of booleans representing the state.
     * @returns {number} The maximum number of operations.
     */
    function c( n ) {
      // Find indices where 'true' is followed by 'false'.
      var t = function ( n ) {
        for ( var t = [], e = 0; e < n.length - 1; e += 1 ) {
          if ( n[ e ] === o && n[ e + 1 ] === i ) {
            t.push( e );
          }
        }
        return t;
      }( n );

      // If no such pairs exist, no more operations.
      if ( 0 === t.length ) {
        return 0;
      }

      // Recursively calculate and find the maximum.
      return 1 + Math.max.apply( Math, t.map( function ( t ) {
        return c( function ( n, t ) {
          var e = n.concat(); // Create a copy of the array.
          e[ t ] = !e[ t ]; // Flip the first element.
          e[ t + 1 ] = !e[ t + 1 ]; // Flip the second element.
          return e;
        }( n, t ) );
      } ) );
    }

    /**
     * Helper function 'a' for BPowerOfTwo.
     * Recursively calculates the maximum chain length for powers of two.
     * @param {number[]} n - An array of numbers.
     * @returns {number} The maximum chain length.
     */
    function a( n ) {
      // Base case: if array has less than 2 elements, no chain.
      if ( n.length < 2 ) {
        return 0;
      }

      // Iterate through each element as a potential start of a chain.
      return Math.max.apply( Math, n.map( function ( t, e ) {
        // Create a sub-array excluding the current element 't'.
        var r = n.filter( function ( n, t ) {
          return t !== e;
        } );

        // Iterate through remaining elements as potential next elements in chain.
        return Math.max.apply( Math, r.map( function ( n, e ) {
          // Check if 't' and 'n' sum to a power of two.
          return function ( n, t ) {
            var e = n + t;
            // A number is a power of two if it's positive and (num & (num - 1)) is 0.
            return 0 == ( e & e - 1 );
          }( t, n ) ?
            // If they form a power of two, recursively call 'a' with remaining elements
            // and add 1 to the chain length.
            a( r.filter( function ( n, t ) {
              return t !== e;
            } ) ) + 1 :
            // Otherwise, this pair doesn't form a chain.
            0;
        } ) );
      } ) );
    }


    // --- Problem Set 'l': GrandContest029 ---
    var l = {
      /**
       * Problem A: Irreversible Operation.
       * Given a string of 'B' and 'W', find max operations to make it sorted.
       * @param {string[]} n - An array containing the input string.
       * @returns {string[]} An array containing the result as a string.
       */
      AIrreversibleOperation: function ( n ) {
        // Convert 'B' to true, 'W' to false.
        return [ c( n[ 0 ].split( "" ).map( function ( n ) {
          return "B" === n;
        } ) ) ];
      },

      /**
       * Problem B: Power Of Two.
       * Find the maximum chain of numbers that sum to powers of two.
       * @param {string[]} n - Input: [N, "numbers separated by space"]
       * @returns {string[]} An array containing the result as a string.
       */
      BPowerOfTwo: function ( n ) {
        // Parse N from the first line (unused explicitly).
        Number( n[ 0 ] );

        // Parse the numbers and separate into odds and evens.
        var t = function ( n ) {
            var t = n.filter( function ( n ) {
                return n % 2 == 1;
              } ), // Odd numbers.
              e = n.filter( function ( n ) {
                return n % 2 == 0;
              } ); // Even numbers.
            return {
              odds: t,
              evens: e
            };
          }( n[ 1 ].split( " " ).map( function ( n ) {
            return Number( n );
          } ) ),
          e = t.odds,
          r = t.evens;

        // Apply helper 'a' to both odd and even sets and sum the results.
        return [ a( e ) + a( r ) ];
      }
    };


    // --- Webpack Imports (fs and readline) ---
    var f = e( 0 ), // Import module 0 (fs).
      s = e.n( f ), // Get the default export of fs (fs itself).
      p = e( 1 ); // Import module 1 (readline).


    /**
     * Function 'h': Reads input from stdin asynchronously.
     * @returns {Promise<string[]>} A promise that resolves with an array of input lines.
     */
    function h() {
      process.stdin.resume(); // Resume stdin to listen for data.
      process.stdin.setEncoding( "utf8" ); // Set encoding to UTF-8.

      var n = [], // Array to store input lines.
        t = p.createInterface( { // Create a readline interface.
          input: process.stdin,
          output: process.stdout
        } );

      // Event listener for each line received.
      t.on( "line", function ( t ) {
        n.push( t );
      } );

      // Return a promise that resolves when the input stream closes.
      return new Promise( function ( e ) {
        t.on( "close", function () {
          e( n );
        } );
      } );
    }


    // --- TypeScript __awaiter (v) and __generator (d) helper functions ---
    // These are generated by TypeScript when compiling async/await.

    /**
     * TypeScript __awaiter: Helper for async functions.
     * @param {any} n - The 'this' context.
     * @param {any[]} t - Arguments for the generator function.
     * @param {any} e - The Promise constructor.
     * @param {any} r - The generator function.
     * @returns {Promise<any>} A promise representing the async operation.
     */
    var v = function ( n, t, e, r ) {
      return new ( e || ( e = Promise ) )( function ( u, o ) {
        function i( n ) {
          try {
            a( r.next( n ) );
          } catch ( n ) {
            o( n );
          }
        }

        function c( n ) {
          try {
            a( r.throw( n ) );
          } catch ( n ) {
            o( n );
          }
        }

        function a( n ) {
          n.done ? u( n.value ) : new e( function ( t ) {
            t( n.value );
          } ).then( i, c );
        }
        a( ( r = r.apply( n, t || [] ) ).next() );
      } );
    };

    /**
     * TypeScript __generator: Helper for generator functions (used by __awaiter).
     * @param {any} n - The 'this' context.
     * @param {any[]} t - Arguments for the generator function.
     * @returns {Iterator<any>} An iterator for the generator.
     */
    var d = function ( n, t ) {
      var e, r, u, o, i = {
        label: 0,
        sent: function () {
          if ( 1 & u[ 0 ] ) throw u[ 1 ];
          return u[ 1 ];
        },
        trys: [],
        ops: []
      };
      return o = {
        next: c( 0 ),
        throw: c( 1 ),
        return: c( 2 )
      }, "function" == typeof Symbol && ( o[ Symbol.iterator ] = function () {
        return this;
      } ), o;

      function c( o ) {
        return function ( c ) {
          return function ( o ) {
            if ( e ) throw new TypeError( "Generator is already executing." );
            for ( ; i; ) try {
              if ( e = 1, r && ( u = 2 & o[ 0 ] ? r.return : o[ 0 ] ? r.throw || ( ( u = r.return ) && u.call( r ), 0 ) : r.next ) && !( u = u.call( r, o[ 1 ] ) ).done ) return u;
              switch ( r = 0, u && ( o = [ 2 & o[ 0 ], u.value ] ), o[ 0 ] ) {
                case 0:
                case 1:
                  u = o;
                  break;
                case 4:
                  return i.label++, {
                    value: o[ 1 ],
                    done: !1
                  };
                case 5:
                  i.label++, r = o[ 1 ], o = [ 0 ];
                  continue;
                case 7:
                  o = i.ops.pop(), i.trys.pop();
                  continue;
                default:
                  if ( !( u = ( u = i.trys ).length > 0 && u[ u.length - 1 ] ) && ( 6 === o[ 0 ] || 2 === o[ 0 ] ) ) {
                    i = 0;
                    continue;
                  }
                  if ( 3 === o[ 0 ] && ( !u || o[ 1 ] > u[ 0 ] && o[ 1 ] < u[ 3 ] ) ) {
                    i.label = o[ 1 ];
                    break;
                  }
                  if ( 6 === o[ 0 ] && i.label < u[ 1 ] ) {
                    i.label = u[ 1 ], u = o;
                    break;
                  }
                  if ( u && i.label < u[ 2 ] ) {
                    i.label = u[ 2 ], i.ops.push( o );
                    break;
                  }
                  u[ 2 ] && i.ops.pop(), i.trys.pop();
                  continue;
              }
              o = t.call( n, i );
            } catch ( n ) {
              o = [ 6, n ], r = 0;
            } finally {
              e = u = 0;
            }
            if ( 5 & o[ 0 ] ) throw o[ 1 ];
            return {
              value: o[ 0 ] ? o[ 1 ] : void 0,
              done: !0
            };
          }( [ o, c ] );
        };
      }
    };


    // --- Helper functions for interactiveSorting problem ---

    /**
     * Function 'b': Asynchronously performs a merge sort.
     * Uses an external comparison function 'm'.
     * @param {string[]} n - The array to sort.
     * @returns {Promise<string[]>} A promise that resolves with the sorted array.
     */
    function b( n ) {
      return v( this, void 0, void 0, function () {
        var t, e, r, u, o, i;
        return d( this, function ( c ) {
          switch ( c.label ) {
            case 0:
              // Base case: if array has 0 or 1 element, it's already sorted.
              if ( 1 === n.length ) {
                return [ 2, n ];
              }

              // Split the array into two halves.
              t = n.slice( 0, Math.ceil( n.length / 2 ) );
              e = n.slice( Math.ceil( n.length / 2 ) );

              // Recursively sort the left half.
              return [ 4, b( t ) ];
            case 1:
              r = c.sent(); // 'r' is the sorted left half.

              // Recursively sort the right half.
              return [ 4, b( e ) ];
            case 2:
              u = c.sent(); // 'u' is the sorted right half.

              o = []; // 'o' will be the merged result.
              c.label = 3;
            case 3:
              // While both halves have elements, compare and merge.
              if ( !( r.length > 0 && u.length > 0 ) ) {
                return [ 3, 5 ];
              }

              // Compare the first elements of each half.
              return [ 4, m( r[ 0 ], u[ 0 ] ) ];
            case 4:
              // If 'r[0]' is smaller, take it; otherwise, take 'u[0]'.
              i = c.sent() ? r.shift() : u.shift();

              // Add the chosen element to the merged array.
              if ( i ) {
                o.push( i );
              }
              return [ 3, 3 ];
            case 5:
              // Add any remaining elements from either half.
              o.push.apply( o, r.concat( u ) );

              return [ 2, o ]; // Return the merged and sorted array.
          }
        } );
      } );
    }

    /**
     * Function 'm': Interactively compares two elements.
     * Writes a query to stdout and reads the response from stdin.
     * @param {string} n - The first element.
     * @param {string} t - The second element.
     * @returns {Promise<boolean>} A promise that resolves to true if n < t, false otherwise.
     */
    function m( n, t ) {
      return v( this, void 0, void 0, function () {
        return d( this, function ( e ) {
          switch ( e.label ) {
            case 0:
              // Output the query to stdout.
              console.log( "? " + n + " " + t );

              // Read the response from stdin.
              return [ 4, s.a.readFileSync( "/dev/stdin", "utf8" ) ];
            case 1:
              // Return true if the response is "<", indicating n < t.
              return [ 2, "<" === e.sent() ];
          }
        } );
      } );
    }


    // --- Problem Set 'y': Collection of problem solvers ---
    var y = {
      // Maps 'beginner_contest_122' to the 'r' object.
      beginner_contest_122: r,

      // Maps 'Diverta2019ProgrammingContest' to the 'u' object.
      Diverta2019ProgrammingContest: u,

      // Maps 'GrandContest029' to the 'l' object.
      GrandContest029: l,

      /**
       * Problem: interactiveSorting.
       * Sorts characters 'A' through 'A + (N-1)' using interactive comparisons.
       * @param {string[]} n - Input: [N M] (M is unused).
       * @returns {Promise<string[]>} A promise resolving to an array containing the final sorted string.
       */
      interactiveSorting: function ( n ) {
        return v( this, void 0, void 0, function () {
          var t, e, r;
          return d( this, function ( u ) {
            switch ( u.label ) {
              case 0:
                // Parse N and M from the input.
                t = n[ 0 ].split( " " ).map( function ( n ) {
                  return Number( n );
                } );
                e = t[ 0 ]; // N
                t[ 1 ]; // M (unused)

                // Get ASCII code for 'A'.
                r = "A".charCodeAt( 0 );

                // Create an array of characters 'A', 'B', ..., 'A + (N-1)'.
                // Then perform an asynchronous merge sort on them.
                return [ 4, b( Array.apply( null, new Array( e ) ).map( function ( n, t ) {
                  return String.fromCharCode( r + t );
                } ) ) ];
              case 1:
                // After sorting, format the output.
                return [ 2, [ "! " + u.sent().join( "" ) ] ];
            }
          } );
        } );
      },

      /**
       * Problem: welcomeToAtCoder.
       * A simple arithmetic problem.
       * @param {string[]} n - Input: [a, "b c", s].
       * @returns {string[]} An array containing the calculated sum and string.
       */
      welcomeToAtCoder: function ( n ) {
        // Parse 'a'.
        var t = Number( n[ 0 ] ),
          // Parse 'b' and 'c'.
          e = n[ 1 ].split( " " ).map( function ( n ) {
            return Number( n );
          } );

        // Calculate sum and concatenate with 's'.
        return [ t + e[ 0 ] + e[ 1 ] + " " + n[ 2 ] ];
      }
    };


    // --- TypeScript __awaiter (g) and __generator (w) helper functions ---
    // These are similar to 'v' and 'd', potentially used for the top-level async IIFE.

    /**
     * TypeScript __awaiter: Helper for async functions.
     * @param {any} n - The 'this' context.
     * @param {any[]} t - Arguments for the generator function.
     * @param {any} e - The Promise constructor.
     * @param {any} r - The generator function.
     * @returns {Promise<any>} A promise representing the async operation.
     */
    var g = function ( n, t, e, r ) {
      return new ( e || ( e = Promise ) )( function ( u, o ) {
        function i( n ) {
          try {
            a( r.next( n ) );
          } catch ( n ) {
            o( n );
          }
        }

        function c( n ) {
          try {
            a( r.throw( n ) );
          } catch ( n ) {
            o( n );
          }
        }

        function a( n ) {
          n.done ? u( n.value ) : new e( function ( t ) {
            t( n.value );
          } ).then( i, c );
        }
        a( ( r = r.apply( n, t || [] ) ).next() );
      } );
    };

    /**
     * TypeScript __generator: Helper for generator functions (used by __awaiter).
     * @param {any} n - The 'this' context.
     * @param {any[]} t - Arguments for the generator function.
     * @returns {Iterator<any>} An iterator for the generator.
     */
    var w = function ( n, t ) {
      var e, r, u, o, i = {
        label: 0,
        sent: function () {
          if ( 1 & u[ 0 ] ) throw u[ 1 ];
          return u[ 1 ];
        },
        trys: [],
        ops: []
      };
      return o = {
        next: c( 0 ),
        throw: c( 1 ),
        return: c( 2 )
      }, "function" == typeof Symbol && ( o[ Symbol.iterator ] = function () {
        return this;
      } ), o;

      function c( o ) {
        return function ( c ) {
          return function ( o ) {
            if ( e ) throw new TypeError( "Generator is already executing." );
            for ( ; i; ) try {
              if ( e = 1, r && ( u = 2 & o[ 0 ] ? r.return : o[ 0 ] ? r.throw || ( ( u = r.return ) && u.call( r ), 0 ) : r.next ) && !( u = u.call( r, o[ 1 ] ) ).done ) return u;
              switch ( r = 0, u && ( o = [ 2 & o[ 0 ], u.value ] ), o[ 0 ] ) {
                case 0:
                case 1:
                  u = o;
                  break;
                case 4:
                  return i.label++, {
                    value: o[ 1 ],
                    done: !1
                  };
                case 5:
                  i.label++, r = o[ 1 ], o = [ 0 ];
                  continue;
                case 7:
                  o = i.ops.pop(), i.trys.pop();
                  continue;
                default:
                  if ( !( u = ( u = i.trys ).length > 0 && u[ u.length - 1 ] ) && ( 6 === o[ 0 ] || 2 === o[ 0 ] ) ) {
                    i = 0;
                    continue;
                  }
                  if ( 3 === o[ 0 ] && ( !u || o[ 1 ] > u[ 0 ] && o[ 1 ] < u[ 3 ] ) ) {
                    i.label = o[ 1 ];
                    break;
                  }
                  if ( 6 === o[ 0 ] && i.label < u[ 1 ] ) {
                    i.label = u[ 1 ], u = o;
                    break;
                  }
                  if ( u && i.label < u[ 2 ] ) {
                    i.label = u[ 2 ], i.ops.push( o );
                    break;
                  }
                  u[ 2 ] && i.ops.pop(), i.trys.pop();
                  continue;
              }
              o = t.call( n, i );
            } catch ( n ) {
              o = [ 6, n ], r = 0;
            } finally {
              e = u = 0;
            }
            if ( 5 & o[ 0 ] ) throw o[ 1 ];
            return {
              value: o[ 0 ] ? o[ 1 ] : void 0,
              done: !0
            };
          }( [ o, c ] );
        };
      }
    };


    // --- Main Execution Block (Async IIFE) ---
    ! function () {
      g( this, void 0, void 0, function () {
        var n; // Variable to hold the input lines.
        return w( this, function ( t ) {
          switch ( t.label ) {
            case 0:
              // Case 0: Read input lines asynchronously.
              return [ 4, h() ]; // Call the input reading function.
            case 1:
              // Case 1: After input is received.
              n = t.sent(); // Store the received input lines in 'n'.

              // Call the problem solver for 'Diverta2019ProgrammingContest.d'
              // with the input 'n'.
              // Then, for each result line, print it to console.
              y.Diverta2019ProgrammingContest.d( n ).forEach( function ( n ) {
                return console.log( n );
              } );

              return [ 2 ]; // Indicate completion of the async function.
          }
        } );
      } );
    }(); // Immediately invoke this async function.
  }
] );
//# sourceMappingURL=main.js.map