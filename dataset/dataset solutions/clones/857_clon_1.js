/*
 * This file processes graph data from standard input.
 * It identifies specific nodes and edges based on path lengths.
 * A demonstration of Type I code cloning techniques.
 */

// Core Node.js modules for file system operations.
var  fs  =  require ( 'fs'  ) , // File system module import.
    length = fs.fstatSync( process.stdin.fd ).size , // Get size of stdin to read all input.
    buffer = new Buffer( length ) , // Allocate a buffer of the determined size.
    bytesRead = fs.readSync( process.stdin.fd , buffer , 0 , length , 0 ) , // Read data from stdin into the buffer.
    input = buffer.toString( 'utf8' , 0 , bytesRead ).split( '\n' ) ; // Convert buffer to string, then split into lines.

// Entry point for the application logic.
main ( ) ;

// The primary function where all graph processing occurs.
function main ( )
{

  // Declare variables used within the main function scope.
  var  temp  =  input . shift ( ) . split ( ' ' ) , // Extract first line, split by space.
      n  =  temp [ 0 ] , // Number of nodes in the graph.
      m  =  temp [ 1 ] , // Number of edges in the graph.
      edges  =  [ ] , // Array to store all edges.
      g  =  [ ] , // Adjacency list for the graph (forward).
      gInv  =  [ ] , // Adjacency list for the inverse graph (backward).
      dp  =  [ ] , // Dynamic programming array to store path lengths.
      i ,  j , // Loop counters.
      len , // Length variable for loops.
      a ,  b ; // Variables to hold node indices for edges.

  // Initialize graph structures and DP array for 'n' nodes.
  for  (  i  =  0  ;  i  <  n  ;  i ++  )
  {
    g [ i ]  =  [ ] ; // Initialize adjacency list for node 'i'.
    gInv [ i ]  =  [ ] ; // Initialize inverse adjacency list for node 'i'.
    dp [ i ]  =  0 ; // Initialize DP value for node 'i' to zero.
  }


  // Process 'm' edges from the input.
  for  (  i  =  0  ;  i  <  m  ;  i ++  )
  {
    temp  =  input [ i ] . split ( ' ' ) ; // Get the current edge line and split it.
    a  =  temp [ 0 ]  -  1 ; // First node of the edge (0-indexed).
    b  =  temp [ 1 ]  -  1 ; // Second node of the edge (0-indexed).

    edges [ i ]  =  [ a ,  b ] ; // Store the edge.
    g [ a ] . push ( b ) ; // Add 'b' to 'a's adjacency list (forward edge).
    gInv [ b ] . push ( a ) ; // Add 'a' to 'b's inverse adjacency list (backward edge).
  }


  // Calculate longest path lengths using dynamic programming.
  // This computes the maximum depth of each node from a source.
  for  (  i  =  0  ;  i  <  n  ;  i ++  )
  {
    for  (  j  =  0  ,  len  =  g [ i ] . length  ;  j  <  len  ;  j ++  )
    {
      // If a longer path to g[i][j] is found through 'i'.
      if  (  dp [ g [ i ] [ j ] ]  <  dp [ i ]  +  1  )
      {
        dp [ g [ i ] [ j ] ]  =  dp [ i ]  +  1 ; // Update the longest path.
      }
    }
  }


  // Find the maximum path length encountered and initialize node lists.
  var  max  =  Math . max . apply ( null ,  dp ) , // Determine the global maximum path length.
      nodeList  =  [ ] , // Boolean array to mark nodes on a longest path.
      level  =  [ ] ; // Array to count nodes at specific DP levels.

  // Initialize nodeList and level arrays.
  for  (  i  =  0  ;  i  <  n  ;  i ++  )
  {
    nodeList [ i ]  =  max  ===  dp [ i ] ; // Mark nodes that are at the maximum path length.
    level [ i ]  =  0 ; // Initialize level counts.
  }

  // Back-traverse from nodes on longest paths to identify all nodes participating in such paths.
  for  (  i  =  n  -  1  ;  i  >=  0  ;  i --  )
  {
    if  (  nodeList [ i ]  ) // If the current node is part of a longest path.
    {
      for  (  j  =  0  ,  len  =  gInv [ i ] . length  ;  j  <  len  ;  j ++  )
      {
        // Check if an incoming edge leads to a node that could be on a longest path.
        if  (  dp [ gInv [ i ] [ j ] ]  +  1  ===  dp [ i ]  )
        {
          nodeList [ gInv [ i ] [ j ] ]  =  true ; // Mark the predecessor node as part of a longest path.
          level [ dp [ gInv [ i ] [ j ] ] ] ++ ; // Increment count for its DP level.
        }
      }
    }
  }


  // Iterate through all edges to find and print specific ones.
  // These are edges connecting two nodes on a longest path,
  // where the source node's DP level has a count of exactly one.
  for  (  i  =  0  ;  i  <  m  ;  i ++  )
  {
    // Check three conditions for an edge:
    // 1. Source node is on a longest path.
    // 2. Destination node is on a longest path.
    // 3. The count of nodes at the source node's DP level is exactly one.
    if  (  nodeList [ edges [ i ] [ 0 ] ]  &&  nodeList [ edges [ i ] [ 1 ] ]  &&  level [ dp [ edges [ i ] [ 0 ] ] ]  ===  1  )
    {
      console . log ( i  +  1 ) ; // Print the 1-indexed edge number.
    }
  }

  // The following commented-out blocks are original debugging/placeholder comments.
  // They are kept as comments but with different formatting.

  /*
   * For (i = 0; i < n; i++) {
   *   for (j = 0, len = g[i].length; j < len; j++) {
   *     // This block was empty in the original code, possibly a placeholder.
   *   }
   * }
   */

  // console.log(dp) // Original debug output for dp array.

  // console.log(nodeList) // Original debug output for nodeList array.
  // console.log(level) // Original debug output for level array.

}