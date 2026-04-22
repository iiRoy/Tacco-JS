/*
 * This is a Type I clone of the original JavaScript code.
 *
 * According to the definition of a Type I clone:
 * - All identifiers (variable names, function names, etc.), keywords, operators,
 *   and expressions are preserved exactly as they appeared in the original code.
 * - The only alterations made are variations in whitespace (indentation, spacing,
 *   and blank lines) and the addition or modification of comments.
 *
 * The purpose of this transformation is to make the code visually distinct
 * from the original, while maintaining byte-for-byte identical logical and
 * structural equivalence, excluding only whitespace and comments.
 */

// This immediately invoked function expression (IIFE) serves as the entry point
// for a custom module loading system, similar to what Webpack might generate.
! function( t ) {

  // 'e' acts as the cache for already loaded modules.
  var e = {};

  /**
   * The core module loading and caching function.
   * If a module is already loaded, its exports are returned from the cache.
   * Otherwise, the module is loaded, its exports object is prepared,
   * the module's code is executed, and then its exports are cached and returned.
   *
   * @param {number} r - The unique identifier for the module to be loaded.
   * @returns {object} The exports object of the requested module.
   */
  function n( r ) {
    // Check if the module is already in our cache.
    if ( e[ r ] ) {
      return e[ r ].exports;
    }

    // If not, create a new module entry in the cache.
    // 'i': module ID, 'l': loaded flag (initially false), 'exports': the actual exports object.
    var o = e[ r ] = {
      i: r,
      l: !1,
      exports: {}
    };

    // Execute the module's definition function.
    // 't[r]' holds the function that defines the module.
    // 'call' is used to set 'this' context and pass 'module', 'module.exports', and 'require' (n) arguments.
    t[ r ].call( o.exports, o, o.exports, n );

    // Mark the module as loaded after its execution.
    o.l = !0;

    // Return the module's exports.
    return o.exports;
  }

  // Store all the module definition functions (the 't' argument of the IIFE)
  // on the 'n' (require) function for internal use.
  n.m = t;

  // Store the module cache 'e' on 'n' as well.
  n.c = e;

  /**
   * Helper function to define an enumerable getter property on an object.
   * This is typically used for ES module compatibility, defining getters for named exports.
   *
   * @param {object} t - The target object (e.g., module.exports).
   * @param {string} e - The name of the property to define.
   * @param {function} r - The getter function that returns the property's value.
   */
  n.d = function( t, e, r ) {
    // Only define the property if it doesn't already exist on the object.
    if ( !n.o( t, e ) ) {
      Object.defineProperty( t, e, {
        enumerable: !0, // Make the property appear in 'for...in' loops and 'Object.keys()'.
        get: r // Set the getter function for this property.
      } );
    }
  };

  /**
   * Helper function to add ES module compatibility flags to an exports object.
   * This includes setting `Symbol.toStringTag` and `__esModule`.
   *
   * @param {object} t - The exports object to modify.
   */
  n.r = function( t ) {
    // If Symbol and Symbol.toStringTag are available, set the module's toStringTag.
    if ( "undefined" != typeof Symbol && Symbol.toStringTag ) {
      Object.defineProperty( t, Symbol.toStringTag, {
        value: "Module"
      } );
    }
    // Explicitly mark the module as an ES module.
    Object.defineProperty( t, "__esModule", {
      value: !0
    } );
  };

  /**
   * Interoperability helper for different module types (e.g., CommonJS, ES Modules).
   * It handles various flags to correctly resolve and expose module exports.
   *
   * @param {*} t - The module or module ID.
   * @param {number} e - Bitmask flags indicating how to handle the module.
   * @returns {*} The interoped module object.
   */
  n.t = function( t, e ) {
    // Flag 1: If it's a module ID, load it using 'n'.
    if ( 1 & e ) {
      t = n( t );
    }
    // Flag 8: If it's already an object, return it as is.
    if ( 8 & e ) {
      return t;
    }
    // Flag 4: If it's an object, truthy, and already marked as an ES module, return it.
    if ( 4 & e && "object" == typeof t && t && t.__esModule ) {
      return t;
    }

    // Create a new plain object to hold the interoped exports.
    var r = Object.create( null );

    // Mark the new object as an ES module.
    n.r( r );

    // Define a 'default' property on the new object, pointing to the original module's exports.
    Object.defineProperty( r, "default", {
      enumerable: !0,
      value: t
    } );

    // Flag 2: If the original module is not a string, copy all its properties
    // as getters onto the new interop object.
    if ( 2 & e && "string" != typeof t ) {
      for ( var o in t ) {
        // Use 'n.d' to define a getter for each property.
        // The getter simply returns the corresponding property from the original module.
        n.d( r, o, ( function( e ) {
          return t[ e ];
        } ).bind( null, o ) ); // 'bind' is used to capture 'o' for the getter.
      }
    }
    return r;
  };

  /**
   * Creates a getter function for a module's default export.
   * If the module is an ES module with a '__esModule' flag, it returns a getter for 't.default'.
   * Otherwise, it returns a getter for 't' itself (for CommonJS compatibility).
   *
   * @param {*} t - The module object.
   * @returns {function} A function that, when called, returns the module's default export.
   */
  n.n = function( t ) {
    var e = t && t.__esModule ?
      // If it's an ES module, the getter returns its 'default' property.
      function() {
        return t.default;
      } :
      // Otherwise (e.g., CommonJS), the getter returns the module object itself.
      function() {
        return t;
      };
    // Define an 'a' property on the getter itself, making it self-referential
    // (a common pattern in Webpack's interop).
    n.d( e, "a", e );
    return e;
  };

  /**
   * Checks if an object has a specified property directly (not inherited).
   * This is a robust way to check for own properties, avoiding issues with shadowed
   * `hasOwnProperty` methods.
   *
   * @param {object} t - The object to check.
   * @param {string} e - The name of the property to look for.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  n.o = function( t, e ) {
    return Object.prototype.hasOwnProperty.call( t, e );
  };

  // 'n.p' is typically used for the public path of assets.
  // It's an empty string here, meaning relative paths are used.
  n.p = "";

  // This is the entry point of the application.
  // It sets the starting module ID (17) on 'n.s' and then immediately loads it.
  n( n.s = 17 );

}( { // This object contains the definitions for all modules used in the application.
  // Each key is a module ID, and its value is the module's definition function.

  /**
   * Module 0: Contains utility functions, including TypeScript's __awaiter and __generator
   * helpers, and input/output-related functions.
   */
  0: function( t, e, n ) {
    "use strict"; // Enforce strict JavaScript parsing and execution for this module.

    // __awaiter: TypeScript's helper for async/await functionality.
    // This function transforms an async function (which is internally a generator)
    // into a Promise-based structure, managing its execution flow.
    var r = this && this.__awaiter || function( t, e, n, r ) {
      return new( n || ( n = Promise ) )( function( o, u ) {
        // Helper function to process the next step of the generator.
        function i( t ) {
          try {
            c( r.next( t ) );
          } catch ( t ) {
            u( t ); // If an error occurs, reject the promise.
          }
        }

        // Helper function to handle errors thrown into the generator.
        function a( t ) {
          try {
            c( r.throw( t ) );
          } catch ( t ) {
            u( t ); // If an error occurs, reject the promise.
          }
        }

        // Main execution loop for the generator.
        function c( t ) {
          // If the generator is done, resolve the promise with its value.
          // Otherwise, wrap the yielded value in a Promise and continue.
          t.done ? o( t.value ) : new n( function( e ) {
            e( t.value );
          } ).then( i, a );
        }
        // Start the generator execution.
        c( ( r = r.apply( t, e || [] ) ).next() );
      } );
    };

    // __generator: TypeScript's helper for generator functions.
    // This function provides the state management and iteration logic for a generator,
    // allowing it to pause and resume execution.
    var o = this && this.__generator || function( t, e ) {
      var n, r, o, u, i = {
        label: 0,
        sent: function() {
          if ( 1 & o[ 0 ] ) throw o[ 1 ];
          return o[ 1 ];
        },
        trys: [],
        ops: []
      };
      // 'u' represents the generator's iterator interface (next, throw, return).
      return u = {
        next: a( 0 ),
        throw: a( 1 ),
        return: a( 2 )
      }, "function" == typeof Symbol && ( u[ Symbol.iterator ] = function() {
        return this;
      } ), u;

      // Helper function to create the 'next', 'throw', 'return' methods.
      function a( u ) {
        return function( a ) {
          return function( u ) {
            // Ensure the generator is not already running.
            if ( n ) throw new TypeError( "Generator is already executing." );
            // Main loop for generator state machine.
            for ( ; i; ) try {
              // 'n' flag indicates generator is executing.
              // 'r' is the generator object itself.
              // 'o' stores the result of 'r.next()', 'r.throw()', or 'r.return()'.
              if ( n = 1, r && ( o = 2 & u[ 0 ] ? r.return : u[ 0 ] ? r.throw || ( ( o = r.return ) && o.call( r ), 0 ) : r.next ) && !( o = o.call( r, u[ 1 ] ) ).done ) return o;
              // Reset 'r' and update 'u' with the new state.
              switch ( r = 0, o && ( u = [ 2 & u[ 0 ], o.value ] ), u[ 0 ] ) {
                case 0: // Initial state or next step.
                case 1: // Next step.
                  o = u;
                  break;
                case 4: // Yield expression.
                  return i.label++, {
                    value: u[ 1 ],
                    done: !1
                  };
                case 5: // Yield after assignment.
                  i.label++, r = u[ 1 ], u = [ 0 ];
                  continue;
                case 7: // Pop from ops stack (for try/finally).
                  u = i.ops.pop(), i.trys.pop();
                  continue;
                default: // Handles try/catch/finally blocks and other control flow.
                  if ( !( o = ( o = i.trys ).length > 0 && o[ o.length - 1 ] ) && ( 6 === u[ 0 ] || 2 === u[ 0 ] ) ) {
                    i = 0;
                    continue;
                  }
                  if ( 3 === u[ 0 ] && ( !o || u[ 1 ] > o[ 0 ] && u[ 1 ] < o[ 3 ] ) ) {
                    i.label = u[ 1 ];
                    break;
                  }
                  if ( 6 === u[ 0 ] && i.label < o[ 1 ] ) {
                    i.label = o[ 1 ], o = u;
                    break;
                  }
                  if ( o && i.label < o[ 2 ] ) {
                    i.label = o[ 2 ], i.ops.push( u );
                    break;
                  }
                  o[ 2 ] && i.ops.pop(), i.trys.pop();
                  continue;
              }
              u = e.call( t, i );
            } catch ( t ) {
              u = [ 6, t ], r = 0;
            } finally {
              n = o = 0;
            }
            if ( 5 & u[ 0 ] ) throw u[ 1 ];
            return {
              value: u[ 0 ] ? u[ 1 ] : void 0,
              done: !0
            };
          }( [ u, a ] );
        };
      }
    };

    // __importDefault: TypeScript's helper for default imports.
    // Ensures that a module import behaves correctly whether it's an ES module
    // with a 'default' export or a CommonJS module.
    var u = this && this.__importDefault || function( t ) {
      return t && t.__esModule ? t : {
        default: t
      };
    };

    // 'i' stores the 'this' context for async functions in this module.
    var i = this;

    // Mark 'e' (module.exports) as an ES module for compatibility.
    e.__esModule = !0;

    // Import the 'fs' module (which is module 1 in this setup).
    // 'u' is the __importDefault helper, ensuring 'a.default' points to the fs module.
    var a = u( n( 1 ) );

    /**
     * A generator function that tokenizes a given string by splitting it
     * by whitespace and yielding each non-empty word. This is referred to
     * as the "fool" iterator.
     *
     * @param {string} t - The input string to tokenize.
     * @returns {Generator<string>} An iterator that yields words.
     */
    function c( t ) {
      var e, n; // 'e' will hold the array of words, 'n' will be the current index.
      return o( this, function( r ) {
        switch ( r.label ) {
          case 0:
            // Split the input string by one or more whitespace characters.
            // Filter out any empty strings that might result from consecutive spaces.
            e = t.split( /\s+/ ).filter( function( t ) {
              return t.length > 0;
            } );
            n = 0; // Initialize the word index to the first word.
            r.label = 1; // Set the label for the start of the loop.
          case 1:
            // Loop condition: continue as long as 'n' (current word index) is within bounds.
            // If there are more words, yield the current word and jump to case 2.
            // Otherwise, jump to case 4 to end the generator.
            return n < e.length ? [ 4, e[ n ] ] : [ 3, 4 ];
          case 2:
            // After yielding, consume the "sent" value (which is typically undefined for simple yields).
            r.sent(), r.label = 3; // Set the label for the next step (incrementing index).
          case 3:
            return n++, [ 3, 1 ]; // Increment the word index and loop back to check the condition.
          case 4:
            return [ 2 ]; // End of the generator function.
        }
      } );
    }

    /**
     * Asynchronously reads all input from standard input (/dev/stdin).
     *
     * @returns {Promise<string>} A Promise that resolves with the entire input content
     *                            as a UTF-8 string, or rejects with an error.
     */
    e.readInput = function() {
      return new Promise( function( t, e ) {
        // Use the imported 'fs' module to read the file.
        a.default.readFile( "/dev/stdin", "utf8", function( n, r ) {
          if ( n ) {
            // If an error (n) occurred during reading, reject the promise.
            e( n );
          } else {
            // Otherwise, resolve the promise with the read data (r).
            t( r );
          }
        } );
      } );
    };

    // Export the 'c' function (getFoolIterator) directly.
    e.getFoolIterator = c;

    /**
     * Asynchronously provides a function to get the next integer from standard input.
     * It first reads the entire input, then creates a "fool" iterator, and returns
     * a function that, when called, parses and returns the next integer from that iterator.
     *
     * @returns {Promise<function(): number>} A Promise that resolves to a function.
     *                                        Calling this function will return the next integer.
     */
    e.getFoolNextInt = function() {
      return r( i, void 0, void 0, function() {
        var t, n; // 't' will store the input string, 'n' will store the iterator.
        return o( this, function( r ) {
          switch ( r.label ) {
            case 0:
              // Step 0: Await the result of reading the entire standard input.
              return [ 4, e.readInput() ];
            case 1:
              t = r.sent(), // Store the input string.
              n = c( t ); // Create a word iterator ('fool iterator') from the input string.
              return [ 2, function() {
                // Return a new function. When this function is called, it will:
                // 1. Get the next value from the iterator.
                // 2. Parse that value as an integer using `parseInt`.
                return parseInt( n.next().value );
              } ];
          }
        } );
      } );
    };

    /**
     * Asynchronously provides a function to get the next "chotto mashina" token from standard input.
     * This uses a custom, more fine-grained tokenizer that handles whitespace differently.
     *
     * @returns {Promise<function(): string>} A Promise that resolves to a function.
     *                                        Calling this function will return the next token string.
     */
    e.getChottoMashinaNext = function() {
      return r( i, void 0, void 0, function() {
        var t, n; // 't' will store the input string, 'n' will store the custom tokenizer iterator.
        return o( this, function( r ) {
          switch ( r.label ) {
            case 0:
              // Step 0: Await the result of reading the entire standard input.
              return [ 4, e.readInput() ];
            case 1:
              t = r.sent(), // Store the input string.
              // Define and immediately invoke a generator function for custom tokenizing.
              n = function() {
                var e, n, r; // 'e': start index of current token, 'n': current position, 'r': temporary token.
                return o( this, function( o ) {
                  switch ( o.label ) {
                    case 0:
                      e = -1, // Initialize token start index to -1 (no token started).
                      n = 0, // Initialize current position to the beginning of the string.
                      o.label = 1; // Set label for the start of the tokenizing loop.
                    case 1:
                      // Loop condition: continue as long as 'n' is within or at the end of the string.
                      // If the current character is NOT whitespace, NOT a newline, AND NOT the end of string,
                      // then we are inside a token or starting one (jump to case 5).
                      // If 'e' is not -1 (a token was being built) AND we hit whitespace/newline/end,
                      // then we've found a complete token (jump to case 2).
                      // Otherwise, just advance (jump to case 6).
                      return n <= t.length ? " " !== t[ n ] && "\n" !== t[ n ] && n !== t.length ? [ 3, 5 ] : -1 !== e ? [ 3, 2 ] : [ 3, 6 ] : [ 3, 7 ];
                    case 2:
                      r = t.substring( e, n ), // Extract the token from 'e' to 'n'.
                      e = -1, // Reset token start index.
                      [ 4, r ]; // Yield the extracted token.
                    case 3:
                      o.sent(), o.label = 4; // Consume the yielded value, set label for next step.
                    case 4:
                      return [ 3, 6 ]; // Jump to increment 'n'.
                    case 5:
                      // If no token has started yet ('e' is -1), mark the current position as the start of a new token.
                      -1 === e && ( e = n ),
                      o.label = 6; // Set label for increment.
                    case 6:
                      return n++, [ 3, 1 ]; // Increment current position and loop back.
                    case 7:
                      return [ 2 ]; // End of the generator.
                  }
                } );
              }(),
              [ 2, function() {
                // Return a new function that, when called, gets the next value from the tokenizer iterator.
                return n.next().value;
              } ];
          }
        } );
      } );
    };

    /**
     * Asynchronously provides a function to get the next "chotto mashina" integer from standard input.
     * It first gets the token getter function (from getChottoMashinaNext), then returns a new function
     * that, when called, retrieves a token and parses it as an integer.
     *
     * @returns {Promise<function(): number>} A Promise that resolves to a function.
     *                                        Calling this function will return the next integer.
     */
    e.getChottoMashinaNextInt = function() {
      return r( i, void 0, void 0, function() {
        var t; // 't' will store the token getter function.
        return o( this, function( n ) {
          switch ( n.label ) {
            case 0:
              // Step 0: Await the function that can get the next "chotto mashina" token.
              return [ 4, e.getChottoMashinaNext() ];
            case 1:
              t = n.sent(), // Store the token getter function.
              [ 2, function() {
                // Return a new function. When this function is called, it will:
                // 1. Call the token getter function 't()'.
                // 2. Parse the returned token string as an integer using `parseInt`.
                return parseInt( t() );
              } ];
          }
        } );
      } );
    };
  },

  /**
   * Module 1: A simple wrapper for the Node.js built-in 'fs' (file system) module.
   */
  1: function( t, e ) {
    // This module simply exports the 'fs' module directly.
    t.exports = require( "fs" );
  },

  /**
   * Module 17: The main application logic. This is the entry point module (n.s = 17).
   * It reads an integer from input and performs calculations based on its parity.
   */
  17: function( t, e, n ) {
    "use strict"; // Enforce strict JavaScript parsing and execution for this module.

    // __awaiter: TypeScript's async/await helper (duplicated in minified output).
    // This helper transforms an async function (internally a generator) into a Promise-based structure.
    var r = this && this.__awaiter || function( t, e, n, r ) {
      return new( n || ( n = Promise ) )( function( o, u ) {
        function i( t ) {
          try {
            c( r.next( t ) );
          } catch ( t ) {
            u( t );
          }
        }

        function a( t ) {
          try {
            c( r.throw( t ) );
          } catch ( t ) {
            u( t );
          }
        }

        function c( t ) {
          t.done ? o( t.value ) : new n( function( e ) {
            e( t.value );
          } ).then( i, a );
        }
        c( ( r = r.apply( t, e || [] ) ).next() );
      } );
    };

    // __generator: TypeScript's generator function helper (duplicated in minified output).
    // This helper manages the state transitions of a generator function.
    var o = this && this.__generator || function( t, e ) {
      var n, r, o, u, i = {
        label: 0,
        sent: function() {
          if ( 1 & o[ 0 ] ) throw o[ 1 ];
          return o[ 1 ];
        },
        trys: [],
        ops: []
      };
      return u = {
        next: a( 0 ),
        throw: a( 1 ),
        return: a( 2 )
      }, "function" == typeof Symbol && ( u[ Symbol.iterator ] = function() {
        return this;
      } ), u;

      function a( u ) {
        return function( a ) {
          return function( u ) {
            if ( n ) throw new TypeError( "Generator is already executing." );
            for ( ; i; ) try {
              if ( n = 1, r && ( o = 2 & u[ 0 ] ? r.return : u[ 0 ] ? r.throw || ( ( o = r.return ) && o.call( r ), 0 ) : r.next ) && !( o = o.call( r, u[ 1 ] ) ).done ) return o;
              switch ( r = 0, o && ( u = [ 2 & u[ 0 ], o.value ] ), u[ 0 ] ) {
                case 0:
                case 1:
                  o = u;
                  break;
                case 4:
                  return i.label++, {
                    value: u[ 1 ],
                    done: !1
                  };
                case 5:
                  i.label++, r = u[ 1 ], u = [ 0 ];
                  continue;
                case 7:
                  u = i.ops.pop(), i.trys.pop();
                  continue;
                default:
                  if ( !( o = ( o = i.trys ).length > 0 && o[ o.length - 1 ] ) && ( 6 === u[ 0 ] || 2 === u[ 0 ] ) ) {
                    i = 0;
                    continue;
                  }
                  if ( 3 === u[ 0 ] && ( !o || u[ 1 ] > o[ 0 ] && u[ 1 ] < o[ 3 ] ) ) {
                    i.label = u[ 1 ];
                    break;
                  }
                  if ( 6 === u[ 0 ] && i.label < o[ 1 ] ) {
                    i.label = o[ 1 ], o = u;
                    break;
                  }
                  if ( o && i.label < o[ 2 ] ) {
                    i.label = o[ 2 ], i.ops.push( u );
                    break;
                  }
                  o[ 2 ] && i.ops.pop(), i.trys.pop();
                  continue;
              }
              u = e.call( t, i );
            } catch ( t ) {
              u = [ 6, t ], r = 0;
            } finally {
              n = o = 0;
            }
            if ( 5 & u[ 0 ] ) throw u[ 1 ];
            return {
              value: u[ 0 ] ? u[ 1 ] : void 0,
              done: !0
            };
          }( [ u, a ] );
        };
      }
    };

    // 'u' stores the 'this' context for async functions within this module.
    var u = this;

    // Mark 'e' (module.exports) as an ES module for compatibility.
    e.__esModule = !0;

    // Import module 0, which contains the input utility functions.
    var i = n( 0 );

    // This is the main asynchronous logic block for module 17.
    // It's wrapped by the __awaiter helper 'r'.
    r( u, void 0, void 0, function() {
      var t, e, n, r; // 't': function to get next int, 'e': actual integer value, 'n', 'r': loop counters.
      return o( this, function( o ) {
        switch ( o.label ) {
          case 0:
            // Step 0: Await the promise from 'getChottoMashinaNextInt()'.
            // This promise resolves to a function that, when called, yields the next integer.
            return [ 4, i.getChottoMashinaNextInt() ];
          case 1:
            // Step 1: 't' now holds the function returned by 'getChottoMashinaNextInt()'.
            t = o.sent();

            // Call 't()' to get the actual integer value from input and store it in 'e'.
            // Check if 'e' is an odd number.
            if ( ( e = t() ) % 2 == 1 ) {
              // If 'e' is odd:
              // Loop for 'n' from 1 up to 'e'.
              for ( n = 1; n <= e; n++ ) {
                // Inner loop for 'r' from 'n + 1' up to 'e'.
                for ( r = n + 1; r <= e; r++ ) {
                  // If the sum of 'n' and 'r' is NOT equal to 'e', then print 'n' and 'r'.
                  if ( n + r !== e ) {
                    console.log( n + " " + r );
                  }
                }
              }
            } else {
              // If 'e' is an even number:
              // Loop for 'n' from 1 up to 'e'.
              for ( n = 1; n <= e; n++ ) {
                // Inner loop for 'r' from 'n + 1' up to 'e'.
                for ( r = n + 1; r <= e; r++ ) {
                  // If the sum of 'n' and 'r' is NOT equal to 'e + 1', then print 'n' and 'r'.
                  if ( n + r !== e + 1 ) {
                    console.log( n + " " + r );
                  }
                }
              }
            }
            return [ 2 ]; // End of the async function's execution.
        }
      } );
    } );
  }
} ); // End of the module definitions object.