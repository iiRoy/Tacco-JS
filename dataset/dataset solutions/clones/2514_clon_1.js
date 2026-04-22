/* This section handles input/output and utility functions.
 * It's generally boilerplate for competitive programming.
 */
// Start of boilerplate code ---------------------------------------------------
var read = require('readline').createInterface( {
  input : process.stdin,
  output : process.stdout
} );

// Global variables for input processing
var obj;
var inLine = [ ];

// Event listener for each line of input
read.on( 'line', function( input ) {
  inLine.push( input );
} );

// Event listener for end of input
read.on( 'close', function( ) {
  // Initialize the input object
  obj = init( inLine );

  // Print a newline to stderr for visual separation
  console.error( "\n" );

  // Record start time for performance measurement
  var start = Date.now( );

  // Execute the main logic of the program
  Main( );

  // Calculate elapsed time
  var end = Date.now( ) - start;

  // Output execution time to stderr
  myerr( "time : " + end + "ms" );
  // Output memory usage to stderr
  myerr( "memory : " + Math.round( process.memoryUsage( ).heapTotal / 1024 ) + "KB" );
} );

/**
 * Creates a deep clone of a given object using JSON serialization.
 * @param {Object} obj The object to clone.
 * @returns {Object} A deep copy of the object.
 */
function makeClone( obj ) {
  return JSON.parse( JSON.stringify( obj ) );
}

// Functions to read next input tokens with type conversion.
function nextInt( ) { return myconv( next( ), 1 ); }
function nextStrArray( ) { return myconv( next( ), 2 ); }
function nextIntArray( ) { return myconv( next( ), 4 ); }
function nextCharArray( ) { return myconv( next( ), 6 ); }

/**
 * Retrieves the next available input line.
 * @returns {string} The next line from input.
 */
function next( ) { return obj.next( ); }

/**
 * Checks if there are more input lines available.
 * @returns {boolean} True if more input exists, false otherwise.
 */
function hasNext( ) { return obj.hasNext( ); }

/**
 * Initializes the input reader object.
 * @param {Array<string>} input An array of input lines.
 * @returns {Object} An object with methods to access input lines.
 */
function init( input ) {
  var returnObj = {
    list : input,
    index : 0,
    max : input.length,

    // Method to check if there are more elements in the list
    hasNext : function( ) {
      return ( this.index < this.max );
    },

    // Method to get the next element from the list
    next : function( ) {
      if ( !this.hasNext( ) ) {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      } else {
        var returnInput = this.list[ this.index++ ];
        return returnInput;
      }
    }
  };
  return returnObj;
}

/**
 * Outputs a string to standard output (console.log).
 * @param {any} s The item to output.
 */
function myout( s ) {
  console.log( s );
}

/**
 * Outputs a debug message to standard error (console.error).
 * Uses util.inspect for detailed object printing.
 * @param {any} s The item to debug output.
 */
function myerr( s ) {
  console.error( "debug:" + require( "util" ).inspect( s, false, null ) );
}

/*
 * This function performs type conversion based on the 'no' parameter.
 * It's a versatile utility for parsing input.
 * Parameter 'no' mapping:
 *   - default (or unknown/outlier): returns 'i' as is.
 *   - 1: Parses 'i' as an integer (parseInt).
 *   - 2: Splits 'i' by space into a string array.
 *   - 4: Splits 'i' by space and maps to numbers (parseInt for each part).
 *   - 6: Splits 'i' into an array of single characters.
 *   - 7: Splits 'i' into characters and maps them to numbers.
 *   - 8: Joins array 'i' with spaces.
 *   - 9: Joins array 'i' with newlines.
 *   - 0: Joins array 'i' with no separator.
 */
function myconv( i, no ) {
  try {
    switch ( no ) {
      case 1:
        return parseInt( i );
      case 2:
        return i.split( " " );
      case 4:
        return i.split( " " ).map( Number );
      case 6:
        return i.split( "" );
      case 7:
        return i.split( "" ).map( Number );
      case 8:
        return i.join( " " );
      case 9:
        return i.join( "\n" );
      case 0:
        return i.join( "" );
      default:
        return i;
    }
  } catch ( e ) {
    // In case of any conversion error, return the original input.
    return i;
  }
}

// End of utility and input/output boilerplate.
// --------------------------------------------------------------------------

/**
 * The main function containing the core logic of the program.
 * It processes graph data and calculates properties.
 */
function Main( ) {
  // Read the number of nodes in the graph.
  var N = nextInt( );

  // Initialize a list to represent the nodes and their properties.
  var list = new Array( N );

  // Populate the initial structure for each node.
  for ( var i = 0; i < N; i++ ) {
    list[ i ] = {
      no : i,          // Node identifier
      child : [ ],     // List of connected children nodes
      access : false,  // Flag for BFS visited status
      depth : 1        // Depth in the graph (initially 1)
    };
  }

  // Read adjacency matrix and build graph connections.
  for ( var i = 0; i < N; i++ ) {
    var tmp = nextCharArray( ); // Read a row of the adjacency matrix.
    for ( var j = 0; j < N; j++ ) {
      // If there's an edge from i to j (and not a self-loop).
      if ( i != j && tmp[ j ] == "1" ) {
        list[ i ].child.push( j );
      }
    }
  }

  // Variables to store results of BFS traversals.
  var output = -1; // Unused in final output, but present.
  var maxDepth = -1;
  var maeList;     // Unused in final output, but present.

  // Perform BFS from each node to find the maximum depth reached from any starting node.
  for ( var i = 0; i < N; i++ ) {
    var depth = bfs( i ); // Execute Breadth-First Search starting from node 'i'.
    if ( maxDepth < depth ) {
      maeList = list;     // This assignment is redundant as 'list' is global and modified by bfs.
      maxDepth = depth;   // Update the overall maximum depth found.
    }
  }

  // Check for a specific graph property: cycle with odd/even depth conflict.
  // This loop iterates through all unique pairs of nodes (i, j).
  for ( var i = 0; i < N - 1; i++ ) {
    for ( var j = i + 1; j < N; j++ ) {
      // Check if there's a bidirectional edge between i and j.
      if ( list[ i ].child.indexOf( j ) != -1 && list[ j ].child.indexOf( i ) != -1 ) {
        // If both nodes have the same parity depth (after a specific BFS, though 'depth' here
        // refers to the last BFS run, which might not be global graph depth),
        // then output -1 and terminate. This implies a specific graph structure constraint check.
        if ( list[ i ].depth % 2 == list[ j ].depth % 2 ) {
          myout( -1 );
          return; // Exit the Main function immediately.
        }
      }
    }
  }

  // Output the maximum depth found across all BFS traversals.
  myout( maxDepth );

  /**
   * Performs a Breadth-First Search (BFS) starting from a given node.
   * This function updates the 'access' and 'depth' properties of nodes
   * in the global 'list' array for the current BFS run.
   * @param {number} s The starting node index for the BFS.
   * @returns {number} The maximum depth reached during this specific BFS traversal.
   */
  function bfs( s ) {
    // Reset access and depth for all nodes before starting a new BFS.
    for ( var i = 0; i < N; i++ ) {
      list[ i ].access = false; // Mark all nodes as unvisited.
      list[ i ].depth = 1;      // Reset depth for all nodes.
    }

    // Initialize the queue for BFS with the starting node.
    var queue = [ s ];
    list[ s ].access = true; // Mark the starting node as visited.
    var maxDepth = 0;        // Track the maximum depth reached in this BFS.

    // Continue BFS while the queue is not empty.
    while ( queue.length > 0 ) {
      var now = queue.shift( );      // Dequeue the current node.
      var child = list[ now ].child; // Get its children.
      maxDepth = list[ now ].depth;  // Update maxDepth with the current node's depth.

      // Iterate through all children of the current node.
      for ( var k = 0; k < child.length; k++ ) {
        // If a child node has not been visited yet.
        if ( !list[ child[ k ] ].access ) {
          list[ child[ k ] ].access = true;                          // Mark as visited.
          list[ child[ k ] ].depth = list[ now ].depth + 1;          // Set its depth.
          queue.push( child[ k ] );                                  // Enqueue the child.
        }
      }
    }
    return maxDepth; // Return the deepest level found in this BFS.
  }
}