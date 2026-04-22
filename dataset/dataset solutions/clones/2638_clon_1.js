/*
 * This is a Type I clone of the original JavaScript code.
 *
 * According to the definition, this means:
 * - All identifiers, variable names, function names, operators, and expressions are exactly the same.
 * - The only permissible changes are variations in whitespace (spaces, tabs, newlines) and comments.
 *
 * The goal is to make the code visually distinct while maintaining
 * complete logical and structural equivalence to the original.
 */

// The main entry point for the module system.
module.exports = function ( e ) {

  // This object acts as a cache for already loaded modules.
  var t = {};

  /**
   * The core 'require' function for this module system.
   * It handles loading and caching of modules.
   *
   * @param {string} n - The unique identifier for the module to be loaded.
   * @returns {object} The exports object of the requested module.
   */
  function r ( n ) {

    // If the module is already in our cache, we simply return its exports.
    if ( t[ n ] ) {

      return t[ n ].exports;

    }

    // If not in cache, create a new module entry.
    // 'i' stores the module ID.
    // 'l' (loaded) is initially false.
    // 'exports' is the object that the module will populate.
    var i = t[ n ] = { i : n, l : !1, exports : {} };

    // Execute the module's function, passing in:
    // 1. i.exports (the module's exports object, also 'this')
    // 2. i (the module object itself)
    // 3. i.exports (the exports object again)
    // 4. r (the require function, for nested requires)
    e[ n ].call( i.exports, i, i.exports, r );

    // After execution, mark the module as loaded.
    i.l = !0;

    // Return the module's exports.
    return i.exports;

  } // End of function r definition.


  // --- Helper functions and properties attached to the 'r' (require) function ---

  // 'm' stores the modules definition object (the array passed to the outer function).
  r.m = e;

  // 'c' stores the module cache (the 't' object defined above).
  r.c = t;


  /**
   * Defines a getter function for a specific property on an exports object.
   * This is used to implement "harmony exports" (ES Modules).
   *
   * @param {object} e - The exports object on which to define the property.
   * @param {string} t - The name of the property to define.
   * @param {function} n - The getter function that returns the property's value.
   */
  r.d = function ( e, t, n ) {

    // Only define the property if it doesn't already exist on the object.
    if ( !r.o( e, t ) ) {

      Object.defineProperty( e, t, { enumerable : !0, get : n } );

    }

  }; // End of r.d definition.


  /**
   * Flags a module's exports object as an ES Module.
   * This adds a Symbol.toStringTag property and sets __esModule to true.
   *
   * @param {object} e - The exports object to flag as an ES Module.
   */
  r.r = function ( e ) {

    // If Symbol and Symbol.toStringTag are available, define the toStringTag.
    if ( "undefined" != typeof Symbol && Symbol.toStringTag ) {

      Object.defineProperty( e, Symbol.toStringTag, { value : "Module" } );

    }

    // Always set the __esModule flag to true.
    Object.defineProperty( e, "__esModule", { value : !0 } );

  }; // End of r.r definition.


  /**
   * Creates a compatibility layer for different module formats (e.g., CommonJS vs ES Modules).
   * It handles various flags to determine how to wrap or retrieve the module's exports.
   *
   * @param {any} e - The module's raw exports.
   * @param {number} t - A bitmask of flags indicating the desired compatibility mode.
   * @returns {object} A standardized module exports object.
   */
  r.t = function ( e, t ) {

    // Flag 1: If set, the module 'e' is an ID, so require it first.
    if ( 1 & t && ( e = r( e ) ) ) {
      return e;
    }

    // Flag 8: If set, return the module 'e' directly without any wrapping.
    if ( 8 & t ) {
      return e;
    }

    // Flag 4: If set, and 'e' is an object and already an ES Module, return it directly.
    if ( 4 & t && "object" == typeof e && e && e.__esModule ) {
      return e;
    }

    // Create a new plain object to serve as the namespace object.
    var n = Object.create( null );

    // Mark this new namespace object as an ES Module.
    r.r( n );

    // Define a 'default' export property on the namespace object.
    Object.defineProperty( n, "default", { enumerable : !0, value : e } );

    // Flag 2: If set, and 'e' is not a string, copy all its properties to the namespace object.
    if ( 2 & t && "string" != typeof e ) {
      for ( var i in e ) {
        r.d( n, i, ( function ( t ) {
          return e[ t ];
        } ).bind( null, i ) );
      }
    }

    return n;

  }; // End of r.t definition.


  /**
   * Returns a getter function for the default export of a module.
   * This is used to create a consistent way to access default exports.
   *
   * @param {object} e - The module's exports object.
   * @returns {function} A function that, when called, returns the module's default export.
   */
  r.n = function ( e ) {

    // Determine the getter function: if it's an ES module, get its default; otherwise, get the module itself.
    var t = e && e.__esModule ?
      function () { return e.default; } :
      function () { return e; };

    // Define an 'a' property on the getter function itself, pointing back to the getter.
    // This seems to be a common webpack pattern for default export access.
    r.d( t, "a", t );

    return t;

  }; // End of r.n definition.


  /**
   * A utility function to check if an object has a specific property.
   * This is a wrapper around Object.prototype.hasOwnProperty.call.
   *
   * @param {object} e - The object to check.
   * @param {string} t - The name of the property to look for.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  r.o = function ( e, t ) {

    return Object.prototype.hasOwnProperty.call( e, t );

  }; // End of r.o definition.


  // 'p' defines the public path for assets, typically used for dynamic imports.
  // In this case, it's an empty string.
  r.p = "";

  // Finally, execute the main entry module (module with ID 0) and return its exports.
  return r( r.s = 0 );

} ( [ // This array contains all the module definitions.

  /* Module 0: Entry Point */
  function ( e, t, r ) {

    // This module is responsible for reading input from stdin and passing it to Module 1.
    // It requires Module 1 and calls it with the content read from '/dev/stdin' in UTF-8.
    r( 1 ) ( r( 2 ).readFileSync( "/dev/stdin", "UTF-8" ) );

  }, // End of Module 0.


  /* Module 1: Main Application Logic */
  function ( e, t, r ) {

    "use strict"; // Enforce strict mode for this module.

    /**
     * A polyfill-like utility function for destructuring non-iterable values.
     * It attempts to convert a value into an array based on its type.
     * This is typically used for cases where an array is expected from an iterable or non-iterable.
     *
     * @param {any} e - The value to attempt to destructure.
     * @param {number} t - The expected number of elements (used if 'e' is iterable).
     * @returns {Array} An array containing the destructured elements.
     * @throws {TypeError} If the value cannot be destructured into an array.
     */
    function n ( e, t ) {

      // Case 1: If 'e' is already an array, return it directly.
      return function ( e ) {
        if ( Array.isArray( e ) ) {
          return e;
        }
      } ( e ) ||

      // Case 2: If 'e' is an iterable, attempt to extract 't' elements from it.
      function ( e, t ) {

        var r = [],        // Array to store extracted elements.
          n = !0,          // Loop continuation flag.
          i = !1,          // Error flag.
          o = void 0;      // Stores caught error.

        try {

          // Get the iterator for 'e'.
          for ( var a, u = e[ Symbol.iterator ]();
            // Loop while not done and either 't' is not specified or 'r' hasn't reached 't' elements.
            !( n = ( a = u.next() ).done ) && ( r.push( a.value ), !t || r.length !== t );
            n = !0
          ) { /* No operation inside the loop body */ }

        } catch ( e ) {
          i = !0; // Mark error occurred.
          o = e;  // Store the error.
        } finally {
          try {
            // Ensure the iterator's 'return' method is called if it exists and wasn't finished.
            if ( !n && null != u.return ) {
              u.return();
            }
          } finally {
            // If an error occurred, re-throw it.
            if ( i ) {
              throw o;
            }
          }
        }

        return r; // Return the array of extracted elements.

      } ( e, t ) ||

      // Case 3: If 'e' is neither an array nor an iterable, throw a TypeError.
      function () {
        throw new TypeError( "Invalid attempt to destructure non-iterable instance" );
      } ();

    } // End of function n definition.


    /**
     * A custom implementation of a Queue data structure using a doubly linked list.
     * This class, named 'i', provides basic enqueue (enq) and dequeue (deq) operations.
     */
    class i {

      /**
       * Constructor initializes the queue.
       * It sets the size to 0 and creates sentinel head and tail nodes.
       */
      constructor () {

        this.size = 0; // Current number of elements in the queue.

        // Head sentinel node. Its 'next' points to the first actual element.
        this.head = { value : void 0, pre : void 0, next : void 0 };

        // Tail sentinel node. Its 'pre' points to the last actual element.
        this.tail = { value : void 0, pre : void 0, next : void 0 };

      } // End of constructor.


      /**
       * Enqueues an element to the back (tail) of the queue.
       *
       * @param {any} e - The element to add to the queue.
       */
      enq ( e ) {

        this.size += 1; // Increment the queue size.

        // Create a new node for the element.
        var t = { value : e, pre : void 0, next : void 0 };

        // Check if the queue is currently empty (i.e., head's next is null/undefined).
        if ( this.head.next ) {
          // Queue is NOT empty:
          // 1. Link the current last actual node's 'next' to the new node.
          this.tail.pre.next = t;

          // 2. Link the new node's 'pre' to the current last actual node.
          t.pre = this.tail.pre;

          // 3. Link the new node's 'next' to the tail sentinel.
          t.next = this.tail;

          // 4. Update the tail sentinel's 'pre' to point to the new node.
          this.tail.pre = t;
        } else {
          // Queue IS empty:
          // 1. Link the head sentinel's 'next' to the new node.
          this.head.next = t;

          // 2. Link the tail sentinel's 'pre' to the new node.
          this.tail.pre = t;

          // 3. Link the new node's 'pre' to the head sentinel.
          t.pre = this.head;

          // 4. Link the new node's 'next' to the tail sentinel.
          t.next = this.tail;
        }

      } // End of enq method.


      /**
       * Dequeues an element from the front (head) of the queue.
       *
       * @returns {any|undefined} The element that was at the front of the queue,
       *                          or undefined if the queue was empty.
       */
      deq () {

        // Only proceed if the queue is not empty.
        if ( 0 != this.size ) {

          this.size -= 1; // Decrement the queue size.

          // Get the value of the first actual node.
          var e = this.head.next.value;

          // Update the head sentinel's 'next' to point to the new first actual node.
          this.head.next = this.head.next.next;

          // Update the 'pre' pointer of the new first actual node to point to the head sentinel.
          this.head.next.pre = this.head;

          return e; // Return the dequeued value.

        }

      } // End of deq method.


      /**
       * Returns an array containing all the values currently in the queue,
       * from front to back.
       *
       * This method is defined but not actually used in the main logic of this module.
       *
       * @returns {Array<any>} An array of the queue's elements.
       */
      getValuesArray () {

        var e = []; // Initialize an empty array to store values.
        var t = this.head.next; // Start traversing from the first actual node.

        // Loop while the current node's 'next' is not the tail sentinel.
        for ( ; t.next; ) {

          e.push( t.value ); // Add the current node's value to the array.
          t = t.next;        // Move to the next node.

        }

        return e; // Return the collected array of values.

      } // End of getValuesArray method.

    } // End of class i definition.


    /**
     * The main processing logic for the input data.
     * This function is exported by Module 1.
     *
     * It simulates a tree or graph traversal to propagate values.
     *
     * @param {string} e - The entire input string, typically from stdin.
     */
    e.exports = function ( e ) {

      // Split the input string into individual lines.
      for (
        var t = e.split( "\n" ),

          // Parse the first line (e.g., "N M") to get the number of nodes (o) and updates (a).
          r = n( t[ 0 ].split( " " ).map( function ( e ) { return Number( e ); } ), 2 ),
          o = r[ 0 ], // 'o' represents N, the number of nodes.
          a = r[ 1 ], // 'a' represents M, the number of updates.

          // Initialize an adjacency list 'u' to represent the graph.
          // It will be an array where each index 'i' holds an array of nodes connected to 'i'.
          u = new Array( o ),

          // Loop through the next N-1 lines to read the edges of the graph.
          l = 0;
        l < o - 1;
        l++
      ) {

        // Parse each edge line (e.g., "nodeA nodeB").
        var s = n( t[ l + 1 ].split( " " ).map( function ( e ) { return Number( e ) - 1; } ), 2 ), // Convert to 0-indexed.
          f = s[ 0 ], // The first node in the edge.
          d = s[ 1 ]; // The second node in the edge.

        // Ensure the adjacency lists for nodes 'f' and 'd' are initialized.
        if ( !u[ f ] ) {
          u[ f ] = [];
        }
        if ( !u[ d ] ) {
          u[ d ] = [];
        }

        // Add the connections to the adjacency list (undirected graph).
        u[ f ].push( d );
        u[ d ].push( f );

      } // End of loop for reading edges.


      // Initialize an array 'c' of size 'o' with all elements set to 0.
      // This array will store the values associated with each node.
      for (
        var c = new Array( o ).fill( 0 ),

          // Loop through the next 'a' lines to read and apply initial updates to node values.
          h = 0;
        h < a;
        h++
      ) {

        // Parse each update line (e.g., "nodeIndex valueToAdd").
        var p = n( t[ h + o ].split( " " ).map( function ( e ) { return Number( e ); } ), 2 ),
          v = p[ 0 ], // Node index (1-based from input).
          y = p[ 1 ]; // Value to add to the node.

        // Apply the value 'y' to the node at index 'v-1' (converting to 0-indexed).
        c[ v - 1 ] += y;

      } // End of loop for reading updates.


      // Initialize a queue 'x' using our custom 'i' class.
      var x = new i,

        // Initialize a 'visited' array 'b' of size 'o' with all elements set to 0.
        // 0 means not visited, 1 means visited.
        b = new Array( o ).fill( 0 );

      // Enqueue the starting node (node 0) to begin the Breadth-First Search (BFS).
      x.enq( 0 );

      // Perform BFS traversal while the queue is not empty.
      for ( ; x.size > 0; ) {

        var m = x.deq(); // Dequeue the current node.

        b[ m ] = 1; // Mark the current node 'm' as visited.

        // Variables used for the try-finally block within the iterator loop.
        var g = !0, // Flag for iterator completion.
          w = !1,   // Flag for error occurrence.
          j = void 0; // Variable to store caught error.

        try {

          // Iterate over all neighbors of the current node 'm'.
          for ( var S, O = u[ m ][ Symbol.iterator ](); !( g = ( S = O.next() ).done ); g = !0 ) {

            var q = S.value; // The current neighbor node 'q'.

            // If the neighbor 'q' has not been visited yet.
            if ( 1 != b[ q ] ) {

              // Propagate the value from the current node 'm' to its unvisited neighbor 'q'.
              c[ q ] += c[ m ];

              // Enqueue the neighbor 'q' to be processed later.
              x.enq( q );

            } // End of if (1 != b[q]).

          } // End of for-of loop for neighbors.

        } catch ( e ) {

          w = !0; // Set error flag.
          j = e;  // Store the error.

        } finally {

          try {
            // If the iterator did not complete normally, call its 'return' method if available.
            if ( !g && null == O.return ) {
              O.return();
            }
          } finally {
            // If an error occurred, re-throw it after cleanup.
            if ( w ) {
              throw j;
            }
          }

        } // End of try-finally block.

      } // End of BFS for loop.

      // After the BFS completes, print the final accumulated values for all nodes, space-separated.
      console.log( c.join( " " ) );

    }; // End of e.exports (main application logic).

  }, // End of Module 1.


  /* Module 2: File System Module */
  function ( e, t ) {

    // This module simply exports the Node.js built-in 'fs' (file system) module.
    e.exports = require( "fs" );

  } // End of Module 2.

] ); // End of the array of module definitions.