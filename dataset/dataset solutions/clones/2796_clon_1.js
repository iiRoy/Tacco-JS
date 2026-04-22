/*
 * This file contains the solution to a programming problem.
 * It includes input/output handling and the core algorithm.
 * All rights reserved.
 */

var read = require( 'readline' ) .createInterface( {
  input  : process.stdin,
  output : process.stdout
} ) ;

var obj ;
var inLine = [ ] ;

// This listener collects all input lines until EOF.
read.on( 'line' , function ( input ) {
  inLine.push( input ) ;
} ) ;


read.on( 'close' , function ( ) {
  obj = init( inLine ) ; // Initialize the input reader object.
  console.error( "\n" ) ; // Print a newline to stderr for visual separation.

  var start = Date.now( ) ; // Record start time for performance measurement.
  Main( ) ; // Execute the main logic of the program.
  var end = Date.now( ) - start ; // Calculate elapsed time.

  myerr( "time : " + end + "ms" ) ; // Output execution time.
  myerr( "memory : " + Math.round( process.memoryUsage( ) .heapTotal / 1024 ) + "KB" ) ; // Output memory usage.
} ) ;


/* Utility function to create a deep clone of an object using JSON serialization. */
function makeClone ( obj ) {
  return JSON.parse( JSON.stringify( obj ) ) ;
}

// These functions abstract the process of reading and converting input.
function nextInt( ) { return myconv( next( ) , 1 ) ; }
function nextStrArray( ) { return myconv( next( ) , 2 ) ; }
function nextIntArray( ) { return myconv( next( ) , 4 ) ; }
function nextCharArray( ) { return myconv( next( ) , 6 ) ; }

function next( ) { return obj.next( ) ; }
function hasNext( ) { return obj.hasNext( ) ; }

/*
 * Initializes an object to handle input lines efficiently.
 * It provides methods to check for more input and retrieve the next line.
 */
function init ( input ) {
  var returnObj = {
    list  : input,
    index : 0,
    max   : input.length,

    // Checks if there are more lines to read.
    hasNext : function ( ) {
      return ( this.index < this.max ) ;
    } ,

    // Retrieves the next line from the input list.
    next : function ( ) {
      if ( !this.hasNext( ) ) {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input" ;
      } else {
        var returnInput = this.list[ this.index++ ] ;
        return returnInput ;
      }
    }
  } ;
  return returnObj ;
}


// Prints a string to standard output, followed by a newline.
function myout ( s ) {
  console.log( s ) ;
}

// Prints debug information to standard error.
function myerr ( s ) {
  console.error( "debug:" + require( "util" ) .inspect( s , false , null ) ) ;
}

/*
 * This function converts input based on the 'no' parameter.
 * 'no' defines the conversion type:
 *   1: parseInt (string to integer)
 *   2: split by space (string to array of strings)
 *   4: split by space and map to Number (string to array of numbers)
 *   6: split by character (string to array of characters)
 *   7: split by character and map to Number (string to array of single-digit numbers)
 *   8: join array with space
 *   9: join array with newline
 *   0: join array with no character (concatenate)
 *   default: return input as is
 */
function myconv ( i , no ) {
  try {
    switch ( no ) {
      case 1:
        return parseInt( i ) ;
      case 2:
        return i.split( " " ) ;
      case 4:
        return i.split( " " ) .map( Number ) ;
      case 6:
        return i.split( "" ) ;
      case 7:
        return i.split( "" ) .map( Number ) ;
      case 8:
        return i.join( " " ) ;
      case 9:
        return i.join( "\n" ) ;
      case 0:
        return i.join( "" ) ;
      default:
        return i ;
    }
  } catch ( e ) {
    return i ; // In case of error, return the original input.
  }
}


/*
 * The main function encapsulates the problem's solution logic.
 * It reads graph data, performs a DFS, then a BFS to find the shortest path.
 */
function Main ( ) {
  var one = nextIntArray( ) ; // Reads the first line of input (N and M).
  var N = one[ 0 ] ; // Number of nodes.
  var M = one[ 1 ] ; // Number of edges.

  var list    = new Array( N ) ;     // Adjacency list for original graph.
  var newList = new Array( N ) ; // Adjacency list and state for transformed graph.

  // Initialize graph structures.
  for ( var i = 0 ; i < N ; i++ ) {
    list[ i ] = {
      child : [ ] // Children in the original graph.
    } ;
    newList[ i ] = {
      parent : new Set( ) , // Parents in the transformed graph (for BFS).
      access : false ,      // Visited flag for BFS.
      depth  : 0            // Distance from target in BFS.
    } ;
  }

  // Populate the original graph's adjacency list.
  for ( var i = 0 ; i < M ; i++ ) {
    var tmp = nextIntArray( ) ;
    list[ tmp[ 0 ] - 1 ] .child .push( tmp[ 1 ] - 1 ) ; // Adjust for 0-based indexing.
  }

  // Perform Depth First Search to build the 'parent' relationships in newList.
  for ( var i = 0 ; i < N ; i++ ) {
    dfs( i , i , 0 ) ;
  }

  var tmp = nextIntArray( ) ; // Read the start and target nodes.
  var s = tmp[ 0 ] - 1 ;     // Start node (0-based).
  var t = tmp[ 1 ] - 1 ;     // Target node (0-based).

  var maeIndex = 0 ; // Front pointer for the queue.
  var atoIndex = 1 ; // Back pointer for the queue.

  var queue = new Array( 100007 ) ; // A pre-allocated array for the BFS queue.
  queue[ 0 ] = t ; // Start BFS from the target node 't'.
  newList[ t ] .access = true ; // Mark target node as visited.

  var output = -1 ; // Default output if path not found.

  // Breadth First Search to find the shortest path from 's' to 't' in the transformed graph.
  while ( maeIndex != atoIndex ) {
    var now = queue[ maeIndex ] ; // Dequeue current node.
    maeIndex++ ;

    if ( now == s ) {
      output = newList[ now ] .depth ; // Path found, record its depth.
      break ;
    }

    var child = Array.from( newList[ now ] .parent ) ; // Get parents of the current node.
    for ( var i = 0 ; i < child.length ; i++ ) {
      if ( !newList[ child[ i ] ] .access ) { // If parent not yet visited.
        newList[ child[ i ] ] .access = true ; // Mark as visited.
        newList[ child[ i ] ] .depth = newList[ now ] .depth + 1 ; // Update depth.
        queue[ atoIndex ] = child[ i ] ; // Enqueue the parent.
        atoIndex++ ;
      }
    }
  }

  // myerr( list ) ; // Debugging output for the original graph structure.
  // myerr( newList ) ; // Debugging output for the transformed graph structure.

  myout( output ) ; // Print the final result.


  /*
   * Performs a Depth First Search from a root node to build relationships
   * in the `newList` structure. Specifically, it finds nodes that can reach
   * `now` in exactly 3 steps in the original graph and adds `root` as a parent
   * in `newList`.
   */
  function dfs ( root , now , depth ) {
    if ( depth == 3 ) { // Base case: if depth reaches 3.
      newList[ now ] .parent .add( root ) ; // Add root as a parent to 'now' in newList.
      return ;
    }

    var child = list[ now ] .child ; // Get children of the current node in the original graph.
    for ( var j = 0 ; j < child.length ; j++ ) {
      dfs( root , child[ j ] , depth + 1 ) ; // Recursive call for children.
    }
    return ; // End of this DFS path.
  }
}