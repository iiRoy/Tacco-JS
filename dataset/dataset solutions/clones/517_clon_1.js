/*
 * This JavaScript file processes input from stdin to solve a graph problem.
 * It uses the Warshall-Floyd algorithm for all-pairs shortest path.
 */


// --- Global variable declarations for input processing and problem parameters ---
var fs        = require('fs')                                           ; // File system module for I/O operations
var length    = fs.fstatSync( process.stdin.fd ) . size                 ; // Determine the size of the standard input stream
var buffer    = new Buffer( length )                                    ; // Allocate a buffer to hold the input data
var bytesRead = fs.readSync( process.stdin.fd, buffer, 0, length, 0 )   ; // Read data from stdin into the buffer
var input     = buffer.toString( 'utf8', 0, bytesRead ) . split( '\n' ) ; // Convert buffer to UTF-8 string and split into lines

var max          ,          n ; // 'max' for a problem-specific limit, 'n' for graph size
var i            ;             // General-purpose loop counter


/**
 * Function: makeGraph
 * -------------------
 * Initializes a square 2D array (adjacency matrix) representing a graph.
 * All diagonal elements are set to 0 (distance to self), and
 * all other elements are set to Infinity (no direct path initially).
 *
 * @param {number} n - The number of nodes in the graph.
 * @returns {Array<Array<number>>} An n x n adjacency matrix.
 */
function makeGraph( n )
{
  var i, j, g ; // Local loop counters and the graph variable itself

  g = [ ]     ; // Initialize g as an empty array

  for ( i = 0 ; i < n ; i++ )
  {
    g[i] = [ ] ; // Initialize each row as an empty array

    for ( j = 0 ; j < n ; j++ )
    {
      /*
       * If i and j are the same (diagonal element), distance is 0.
       * Otherwise, it's Infinity, indicating no direct edge initially.
       */
      g[i][j] = i === j ? 0 : Infinity ;
    }
  }

  return g ; // Return the newly created graph
}


/**
 * Function: warshall_floyd
 * ------------------------
 * Implements the Warshall-Floyd algorithm to find all-pairs shortest paths
 * in a given weighted graph represented by an adjacency matrix.
 * It updates the input graph matrix 'd' in place.
 *
 * @param {Array<Array<number>>} d - The adjacency matrix of the graph.
 *                                   Assumed to be square and contain initial edge weights.
 * @returns {Array<Array<number>>} The updated adjacency matrix with all-pairs shortest paths.
 */
function warshall_floyd( d )
{
  var i, j, k, n = d.length ; // Loop counters and 'n' for the number of nodes

  // Iterate through all possible intermediate nodes (k)
  for ( k = 0 ; k < n ; k++ )
  {
    // Iterate through all possible source nodes (i)
    for ( i = 0 ; i < n ; i++ )
    {
      // Iterate through all possible destination nodes (j)
      for ( j = 0 ; j < n ; j++ )
      {
        /*
         * Check if the path from i to j through k is shorter than
         * the currently known shortest path from i to j.
         * If d[i][k] or d[k][j] is Infinity, their sum will also be Infinity,
         * unless one of them is 0 (self-loop). This handles unreachable nodes.
         */
        d[i][j] = d[i][j] > d[i][k] + d[k][j] ? d[i][k] + d[k][j] : d[i][j] ;
      }
    }
  }

  return d ; // Return the graph with all-pairs shortest paths
}


/**
 * Function: solve
 * ---------------
 * Solves a specific problem using graph construction and Warshall-Floyd algorithm.
 * It constructs a specialized graph based on 'max', 'n', and 'd',
 * then checks reachability conditions.
 *
 * @param {number} max - A maximum value used in position calculation.
 * @param {number} n   - The number of primary nodes.
 * @param {Array<number>} d - An array of distances/offsets.
 * @returns {boolean} True if a specific reachability condition is met, false otherwise.
 */
function solve( max, n, d )
{
    // Create a graph with n + 2 nodes (0 to n+1)
    var g = makeGraph( n + 2 ) ;

    var i, j ; // Loop counters
    var pos  ; // Variable to store calculated position


    // Populate the graph based on problem logic
    for ( i = 0 ; i <= n ; i++ )
    {
        // Inner loop runs 'max' times, decrementing 'j' from max-1 down to 0
        for ( var j = max ; j-- ; )
        {
            /*
             * Calculate 'pos' based on current 'i', 'j', and 'd' array.
             * The ternary operator checks if 'i + j' is within the bounds
             * of the 'd' array indices relevant to 'n'.
             */
            pos = i + j + ( ( i + j < n + 1 ) ? d[i + j] : 0 ) ;

            // Ensure 'pos' stays within the valid node range [0, n+1]
            pos = Math.min( Math.max( pos, 0 ), n + 1 ) ;

            // If the calculated position is different from the current node 'i', add an edge
            if( pos !== i )
            {
                g[i][pos] = 1 ; // Assign a weight of 1 for this edge
            }
        }
    }

    // Run Warshall-Floyd on the constructed graph to find all shortest paths
    warshall_floyd( g ) ;


    // Check the specific reachability condition for the problem
    for ( i = 0 ; i <= n ; i++ )
    {
      /*
       * If node 0 can reach node 'i' (g[0][i] is not Infinity)
       * AND node 'i' cannot reach node n+1 (g[i][n+1] is Infinity),
       * then the condition is not met.
       */
      if( g[0][i] < Infinity && g[i][n+1] === Infinity )
      {
        return false ; // Condition failed, return false immediately
      }
    }

    return true ; // All conditions met, return true
}


/*
 * Main execution loop:
 * Continuously read input until 'max' (first value of a line) is 0.
 * Each iteration processes one test case.
 */
while ( ( max = input.shift() - 0 ) !== 0 )
{
    var d = [ ] ; // Initialize array 'd' for current test case

    n = input.shift() - 0 ; // Read the number of primary nodes 'n'

    d[0]     = 0 ; // Set d[0] to 0
    d[n + 1] = 0 ; // Set d[n+1] to 0

    // Read remaining 'n' values into 'd' array, from index 1 to n
    for ( i = 1 ; i <= n ; i++ )
    {
        d[i] = input.shift() - 0 ; // Parse each line as an integer
    }

    // Call the solve function and print 'OK' or 'NG' based on its return value
    console.log( solve( max, n, d ) ? 'OK' : 'NG' ) ;
}