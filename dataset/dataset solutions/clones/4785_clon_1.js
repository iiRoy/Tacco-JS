/*
 *  This section declares global variables that are intended for use
 *  across various functions within this JavaScript module.
 *  These variables are initialized to default values.
 */
var N = 0;                                         // Represents the total number of nodes/vertices in the graph.
var M = 0;                                         // Represents the total number of edges in the graph.

// An array designated to store information about vertices and their connections (edges).
var ARY = [];                                      // This will typically hold the adjacency list or edge list.

/*
 *  This array serves as a dynamic programming table.
 *  It is intended to store the shortest path costs or details between various nodes.
 */
var dp = [];                                       // Initialized as an empty array, will be populated later.

// A memoization array used to track whether specific edges or routes have been utilized or processed.
var rtmemo = [];                                   // Route memoization table, initially empty.

/**
 *  Performs a full search or traversal, often recursively, to compute
 *  a value based on a path from 'i' to 'j'.
 *
 *  @param {number} i - The starting point or node index for the search.
 *  @param {number} j - The ending point or node index for the search.
 *  @returns {number} The calculated value or cost for the path from 'i' to 'j'.
 */
function FullSearch ( i , j )
{
  // Base case for the recursion: if the start and end points are the same,
  // the cost or value of traversing is zero.
  if ( i === j )
  {
    return 0;
  }
  // Recursive step: calculates the sum of the direct cost from 'i' to 'j'
  // and the cost of the subsequent search from 'i+1' to 'j'.
  return RootSearch ( i , j ) + FullSearch ( i + 1 , j ) ;
}

/*
 *  Function: RootSearch
 *  Description: This function is responsible for searching the ARY (adjacency/edge list)
 *               to find and return the direct cost associated with an edge
 *               connecting node 'i' to node 'j'.
 *
 *  @param {number} i - The source node of the edge.
 *  @param {number} j - The destination node of the edge.
 *  @returns {number} The cost of the direct edge from 'i' to 'j'. Returns 0 if no such edge is explicitly found
 *                    or if the cost is indeed zero.
 */
function RootSearch ( i , j )
{
  var tmp = 0 ;                                           // Temporary variable to hold the cost of the found edge.

  // Iterate through each entry in the ARY array.
  // Each entry is expected to represent an edge, typically as [source, destination, cost].
  for ( var posi = 0 ; posi < N ; posi ++ )
  {
    // Check if the current array entry corresponds to the edge from 'i' to 'j'.
    if ( ARY [ posi ] [ 0 ] === i && ARY [ posi ] [ 1 ] === j )
    {
      tmp = ARY [ posi ] [ 2 ] ;                          // If a match is found, extract the cost (third element).
      break;                                              // Exit the loop as the desired edge has been located.
    }
  }
  return tmp ;                                            // Return the accumulated cost.
}

/**
 *  The primary function that orchestrates the program's execution.
 *  It handles input parsing, data structure initialization, and the main
 *  logic for pathfinding and processing.
 *
 *  @param {string} input - The raw string input received by the program, typically from standard input.
 */
function Main ( input )
{
  // Split the entire input string into an array of individual lines.
  input = input . split ( "\n" ) ;

  // Parse the first line of the input to extract key parameters N and M.
  inputStr = input [ 0 ] . split ( " " ) ;
  N = Number . parseInt ( inputStr [ 0 ] ) ; // N: Number of nodes.
  M = Number . parseInt ( inputStr [ 1 ] ) ; // M: Number of edges.

  // Re-initialize the ARY array to ensure it's empty before loading new edge data.
  // This is crucial for handling multiple test cases or re-runs.
  ARY = [ ] ;

  // Loop through the input lines (from the second line onwards) to populate ARY with edge information.
  // Each line represents an edge, consisting of source, destination, and cost.
  for ( var i = 1 ; i <= M ; i ++ )
  {
    inputStr = input [ i ] . split ( " " ) ;                                        // Split the current edge line by spaces.
    // Convert the string components of the edge into integers.
    var tmp = inputStr . map ( inputStr => Number . parseInt ( inputStr ) ) ;
    ARY . push ( tmp ) ;                                                            // Add the parsed edge array to ARY.
  }

  // Initialize the dynamic programming table 'dp' for storing shortest path calculations.
  dp = [ ] ;

  // Populate 'dp' with initial entries for all unique pairs of nodes (i, j)
  // where i is not equal to j and i is less than j to avoid redundant pairs and self-loops.
  for ( var i = 1 ; i <= N ; i ++ )
  {
    for ( var j = 1 ; j <= N ; j ++ )
    {
      // Ensure we're considering distinct nodes and only one direction (e.g., A->B, not B->A if already covered).
      if ( i != j && i < j )
      {
        dp . push ( [ i , j , 0 ] ) ;                                               // Store [start_node, end_node, initial_cost_or_placeholder].
      }
    }
  }

  // Assign the initialized 'dp' array to 'rtmemo'.
  // This effectively copies the structure of potential paths for memoization purposes,
  // allowing tracking of which paths were used or updated during the search.
  rtmemo = dp ;

  /*
   * ========================================================================================
   * CORE PROCESSING LOGIC: Pathfinding and Optimization
   * ========================================================================================
   *
   * The following block implements the main algorithm.
   * 1.  **Exhaustive Path Exploration**: Systematically search all possible paths
   *     from a starting vertex (A) to an ending vertex (B).
   * 2.  **Shortest Path Storage**: The most efficient (e.g., shortest or lowest cost)
   *     path found for each pair (A, B) will be stored in the 'dp' array.
   * 3.  **Route Memoization**: Concurrently, the 'rtmemo' array is updated to record
   *     the specific routes or edges that were part of the optimal paths.
   * 4.  **Final Aggregation**: At the conclusion of the search, the program will
   *     count and report the number of entries in 'rtmemo' that still retain their
   *     initial "0" value, indicating these paths were not part of any optimal route
   *     or were not traversed as such.
   */

  // This nested loop iterates through all possible pairs of distinct nodes (i, j)
  // to find the shortest path between them. It aims to identify direct routes
  // (parameters) and also explore indirect routes via intermediate nodes.
  // The structure itself primarily serves to enumerate all (i,j) pairs for processing.
  for ( var i = 1 ; i <= N ; i ++ )
  {
    for ( var j = 1 ; j <= N ; j ++ )
    {
      // Only process unique pairs where i is less than j to avoid redundant calculations.
      if ( i != j && i < j )
      {
        // Execute the path exploration logic for the current (i, j) pair.
        var tmp = FullSearch ( i , j ) ;

        // Output debugging information to the console.
        console . log ( "i=" , i , "j=" , j , "の最短値は" ) ;              // Japanese: "The shortest value for i=... j=... is"
        console . log ( "計算値=" , tmp ) ;                                 // Japanese: "Calculated value="
        console . log ( "パラメータ=" , RootSearch ( i , j ) ) ;          // Japanese: "Parameter value="

        // The following line is commented out, but it indicates the intended logic
        // for updating the shortest path in the 'dp' table:
        // dp [ i ] [ j ] = Math . min ( tmp , RootSearch ( i , j ) ) ;
      }
    }
  }
} // End of Main function.

// Execute the Main function by reading input data from standard input.
// This is the typical way competitive programming environments provide input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;