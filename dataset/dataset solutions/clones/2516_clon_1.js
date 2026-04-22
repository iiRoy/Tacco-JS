/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence,
 * with only variations in whitespace and comments.
 * The original functionality is preserved entirely.
 */

//  ----------------------------------------------------------------------
//  Start of boilerplate code for input/output handling.
//  This section is generally not relevant to the core algorithm.
//  ----------------------------------------------------------------------

var read = require('readline').createInterface(
  {
    input:  process.stdin,
    output: process.stdout
  }
);

/* Declare global variables for input processing. */
var obj;
var inLine = [];

// Event listener for each line of input received.
read.on(
  'line',
  function (input) {
    inLine.push(input);
  }
);

// Event listener for when input stream closes.
read.on(
  'close',
  function () {

    // Initialize the input object.
    obj = init(inLine);

    // Print a newline to stderr for visual separation in console.
    console.error("\n");

    // Record the starting time for performance measurement.
    var start = Date.now();

    // Execute the main logic of the program.
    Main();

    // Calculate the elapsed time.
    var end = Date.now() - start;

    // Output the execution time to stderr.
    myerr("time : " + end + "ms");

    // Output memory usage to stderr.
    myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");

  }
);

/*
 * Helper function to create a deep clone of an object.
 * Utilizes JSON serialization and deserialization.
 */
function makeClone( obj ) {

  return JSON.parse( JSON.stringify( obj ) );

}

/*
 * Functions to retrieve different types of input from the processed input stream.
 * These functions call 'myconv' to perform type conversion based on a 'no' parameter.
 */
function nextInt()       { return myconv( next(), 1 ); }
function nextStrArray()  { return myconv( next(), 2 ); }
function nextIntArray()  { return myconv( next(), 4 ); }
function nextCharArray() { return myconv( next(), 6 ); }

/*
 * Core functions to interact with the input object.
 * 'next()' retrieves the next item, 'hasNext()' checks if more input is available.
 */
function next()    { return obj.next();    }
function hasNext() { return obj.hasNext(); }

/*
 * Initializes the input object with the provided list of input lines.
 * Provides methods to check for and retrieve the next input line.
 */
function init( input ) {

  var returnObj = {
    list :  input,             // The array of input lines.
    index : 0,                 // Current index in the input array.
    max :   input.length,      // Total number of input lines.

    // Method to check if there is more input available.
    hasNext : function () {
      return (this.index < this.max);
    },

    // Method to retrieve the next input line.
    next : function () {

      // Check if input is exhausted.
      if ( !this.hasNext() ) {

        // Throw an error if no more input.
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";

      } else {

        // Retrieve the current input line and increment the index.
        var returnInput = this.list[this.index++];

        // Return the retrieved input.
        return returnInput;

      }

    }
  };

  // Return the initialized input object.
  return returnObj;

}

/*
 * Custom output function for standard output.
 * Simply logs the provided string to the console.
 */
function myout( s ) {

  console.log( s );

}

/*
 * Custom error/debug output function for standard error.
 * Uses Node.js's 'util.inspect' for detailed object inspection.
 */
function myerr( s ) {

  console.error( "debug:" + require("util").inspect( s, false, null ) );

}

/*
 * Parameter 'no' explanation for 'myconv' function:
 * -------------------------------------------------
 *  - unknown or outlier : returns 'i' as is.
 *  - 1: Parses 'i' as an integer (parseInt).
 *  - 2: Splits 'i' by space into an array of strings.
 *  - 4: Splits 'i' by space and maps each part to a Number.
 *  - 6: Splits 'i' into an array of single characters.
 *  - 7: Splits 'i' into characters and maps each to a Number.
 *  - 8: Joins elements of array 'i' with spaces.
 *  - 9: Joins elements of array 'i' with newlines.
 *  - 0: Joins elements of array 'i' with no separator.
 */
function myconv( i, no ) {

  try {

    switch ( no ) {

      case 1:  // Convert to integer.
        return parseInt( i );

      case 2:  // Split by space into string array.
        return i.split( " " );

      case 4:  // Split by space and convert to number array.
        return i.split( " " ).map( Number );

      case 6:  // Split into character array.
        return i.split( "" );

      case 7:  // Split into character array and convert to number array.
        return i.split( "" ).map( Number );

      case 8:  // Join array elements with spaces.
        return i.join( " " );

      case 9:  // Join array elements with newlines.
        return i.join( "\n" );

      case 0:  // Join array elements without any separator.
        return i.join( "" );

      default: // Default case: return input as is.
        return i;

    }

  } catch ( e ) {

    // In case of any error during conversion, return the original input.
    return i;

  }

}

//  ----------------------------------------------------------------------
//  End of boilerplate code.
//  ----------------------------------------------------------------------

/*
 * The main function containing the primary logic of the program.
 * This function processes input, builds a graph-like structure,
 * and performs a traversal to calculate a specific output.
 */
function Main() {

  /* Read the number of nodes (N) from input. */
  var N = nextInt();

  /* Initialize an array 'list' of size N to store node information. */
  var list = new Array( N );

  /*
   * Initialize each node object in the 'list'.
   * Each node will have:
   * - 'child': an array to store indices of its connected children.
   * - 'access': a boolean flag to track if the node has been visited.
   * - 'depth': an integer to store the depth of the node in a traversal.
   */
  for ( var i = 0; i < N; i++ ) {

    list[ i ] = {
      child :  [],    // Array to hold indices of connected nodes.
      access : false,  // Flag for visitation status.
      depth :  1      // Initial depth, typically 1 for root-like nodes or unvisited.
    };

  }

  /*
   * Populate the 'child' array for each node based on adjacency matrix input.
   * Reads N lines, each representing a row in an N x N matrix.
   */
  for ( var i = 0; i < N; i++ ) {

    /* Read the current row as an array of characters (e.g., "0101"). */
    var tmp = nextCharArray();

    /* Iterate through columns (j) of the current row. */
    for ( var j = 0; j < N; j++ ) {

      /*
       * If the current node (i) is not the same as the target node (j),
       * and the adjacency matrix indicates a connection ('1').
       */
      if ( ( i != j ) && ( tmp[ j ] == "1" ) ) {

        /* Add node 'j' to the children list of node 'i'. */
        list[ i ].child.push( j );

      }

    }

  }

  /*
   * Initialize 'output' to -1, which will store the maximum depth found.
   * 'isOK' flag indicates if a suitable starting node for BFS was found.
   */
  var output = -1;
  var isOK = false;

  /*
   * Iterate through all nodes to find a starting point for BFS.
   * A suitable starting point is defined as a node with exactly one child.
   */
  for ( var i = 0; i < N; i++ ) {

    /* Check if the current node has exactly one child. */
    if ( list[ i ].child.length == 1 ) {

      isOK = true; // A suitable starting node has been found.

      /* Initialize a queue for Breadth-First Search (BFS) with the current node. */
      var queue = [ i ];

      /* Mark the starting node as accessed/visited. */
      list[ i ].access = true;

      /* Perform BFS as long as the queue is not empty. */
      while ( queue.length > 0 ) {

        /* Dequeue the current node for processing. */
        var now = queue.shift();

        /* Get the children of the current node. */
        var child = list[ now ].child;

        /* Iterate through each child of the current node. */
        for ( var k = 0; k < child.length; k++ ) {

          /* If the child node has not been accessed yet. */
          if ( !list[ child[ k ] ].access ) {

            /* Mark the child node as accessed. */
            list[ child[ k ] ].access = true;

            /* Set the depth of the child node based on its parent's depth. */
            list[ child[ k ] ].depth = list[ now ].depth + 1;

            /* Update the maximum depth found so far. */
            output = Math.max( output, list[ now ].depth + 1 );

            /* Enqueue the child node for further processing. */
            queue.push( child[ k ] );

          }

        }

      }

      /*
       * Since we only need one such starting node to perform the BFS,
       * break out of the loop once the first one is processed.
       */
      break;

    }

  }

  /*
   * If no suitable starting node (with exactly one child) was found,
   * output the initial 'output' value (-1) and terminate.
   */
  if ( !isOK ) {

    myout( output );
    return;

  }

  /*
   * Perform a final check for specific conditions related to node depths and connections.
   * This nested loop iterates through all unique pairs of nodes (i, j) where i < j.
   */
  for ( var i = 0; i < N - 1; i++ ) {

    for ( var j = i + 1; j < N; j++ ) {

      /*
       * Check if two distinct nodes (i and j) have the same depth
       * AND if they are directly connected (either i -> j or j -> i).
       * If this condition is met, it indicates an invalid graph structure
       * for the problem's criteria, and the output should be -1.
       */
      if ( ( list[ i ].depth == list[ j ].depth ) && ( ( list[ i ].child.indexOf( j ) != -1 ) || ( list[ j ].child.indexOf( i ) != -1 ) ) ) {

        myerr( { i, j } ); // Log the problematic nodes for debugging.
        output = -1;       // Set output to -1 indicating an invalid state.
        break;             // Break the inner loop, as the condition is met.

      }

    }

  }

  /* Output the final calculated value. */
  myout( output );

}