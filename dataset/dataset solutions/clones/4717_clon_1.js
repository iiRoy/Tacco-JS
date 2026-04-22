'use strict' ; /* This directive enforces strict parsing and error handling for the entire script. */


// The main function orchestrates the processing of input data for the graph problem.
function main ( input )
{
  // First, the entire input string is split into individual lines.
  const   tmp   =   input . split ( '\n' ) ;

  /*
   * The first line of the input contains the dimensions N (number of nodes)
   * and M (number of edges). It's extracted, split by space, and parsed.
   */
  const   NM   =   tmp . shift ( ) . split ( ' ' ) . map ( ( elem )   =>   parseInt ( elem , 10 ) ) ;

  // N is the total number of vertices (nodes) in the graph.
  const   N   =   NM [ 0 ] ;
  // M is the total number of edges that will be defined for the graph.
  const   M   =   NM [ 1 ] ;


  // Initialize an adjacency matrix 'graph' of size N x N.
  // All elements are initially set to 0, indicating no connections.
  let   graph   =   new   Array ( N ) . fill ( 0 ) . map ( ( elem )   =>   new   Array ( N ) . fill ( 0 ) ) ;

  // Iterate over the remaining lines in 'tmp', each representing an edge.
  for   ( let   line   of   tmp )
  {
    // Each edge line is split into two node identifiers and parsed as integers.
    const   splited   =   line . split ( ' ' ) . map ( ( elem )   =>   parseInt ( elem , 10 ) ) ;

    // 'a' is the first node of the current edge.
    const   a   =   splited [ 0 ] ;
    // 'b' is the second node of the current edge.
    const   b   =   splited [ 1 ] ;


    // Mark the connection in the adjacency matrix.
    // We subtract 1 from 'a' and 'b' to convert them to 0-based array indices.
    graph [ a   -   1 ] [ b   -   1 ]   =   1 ;
    // Since the graph is undirected, we also mark the connection in the reverse direction.
    graph [ b   -   1 ] [ a   -   1 ]   =   1 ;
  }

  // Create a 'visited' array to keep track of nodes visited during the DFS traversal.
  // It's initialized with N zeros, meaning no nodes have been visited yet.
  let   visited   =   new   Array ( N ) . fill ( 0 ) ;

  // Mark the starting node (node at index 0) as visited.
  visited [ 0 ]   =   1 ;

  // Perform a Depth-First Search (DFS) starting from node 0.
  // The result (total count of paths) is then printed to the console.
  console . log ( dfs ( 0 ,   N ,   graph ,   visited ) ) ;
}


// This auxiliary function checks if all nodes in the graph have been visited.
// It is crucial for determining if a valid path covering all nodes has been found.
function visitedAll ( visited )
{
  let   flag   =   true ; // Assume all nodes are visited by default.

  // Loop through each element in the 'visited' array.
  for   ( let   vis   of   visited )
  {
    // If any node's status is not '1' (meaning it hasn't been visited),
    // then the flag is set to false.
    if   ( vis   !==   1 )
    {
      flag   =   false ;
    }
  }
  return   flag ; // Return the final status.
}

// The Depth-First Search (DFS) function to find all Hamiltonian paths (paths visiting all nodes).
function dfs ( v ,   N ,   graph ,   visited )
{
  // If the current state of 'visited' array indicates all nodes have been reached,
  // then we've found a valid path, so increment the global counter.
  if   ( visitedAll ( visited ) )
  {
    count ++ ; // Increment the global counter for valid paths.
  }


  // Iterate through all possible neighbors (i) of the current node (v).
  for   ( let   i   =   0 ;   i   <   N ;   i ++ )
  {
    // Check two conditions:
    // 1. Is there an edge between node 'v' and node 'i'? (graph[v][i] === 1)
    // 2. Has node 'i' not been visited yet in the current path? (visited[i] === 0)
    if   ( graph [ v ] [ i ]   ===   1   &&   visited [ i ]   ===   0 )
    {
      visited [ i ]   =   1 ; // Mark node 'i' as visited for this path.
      dfs ( i ,   N ,   graph ,   visited ) ; // Recursively call DFS for the next node 'i'.
      visited [ i ]   =   0 ; // Backtrack: unmark node 'i' to allow it to be part of other paths.
    }
  }

  return   count ; // Return the cumulative count of paths found.

}

// Initialize a global variable 'count' to store the number of valid paths found.
let   count   =   0 ;

// Read the input from standard input and pass it to the main function to start the execution.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;