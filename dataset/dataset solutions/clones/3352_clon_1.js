'use strict' /* This directive enforces stricter parsing and error handling in the code. */


var  mod  =  1e9  +  7 ;  //  A large prime number often used as a modulus in calculations to prevent integer overflow.


function  dfs (  root ,   adj ,   visited  )
{
  // Initialize 'ans' array with two elements, both set to 1.
  // These values typically represent base cases or initial products in a tree traversal.
  var   ans   =   [ 1 ,  1 ] ;

  /*
   * Loop through all adjacent nodes (neighbors) of the current 'root' node.
   * 'adj' is the adjacency list representing the graph.
   */
  for  (  var   i   =   0 ;    i   <   adj[root].length ;    i++  )
  {
    // Check if the current neighbor has not been visited yet.
    // This is crucial to prevent infinite loops in graph traversals and ensure each node is processed once.
    if  (  ! visited[adj[root][i]]  )
    {
      // Mark the neighbor as visited before making a recursive call.
      visited[adj[root][i]]   =   1 ;

      // Recursively call the DFS function for the unvisited neighbor.
      // The result 'res' will contain computed values from the subtree rooted at the neighbor.
      var   res   =   dfs (  adj[root][i] ,   adj ,   visited  ) ;

      // Update the first element of 'ans' using values from the child's result.
      // The modulo operator ensures the result stays within a manageable range.
      ans[0]   =   (  ans[0]   *   ( res[0]   +   res[1] )  )   %   mod ;

      // Update the second element of 'ans' similarly.
      ans[1]   =   (  ans[1]   *   res[0]  )   %   mod ;
    }
  }

  // After visiting all children, return the accumulated answer for the current 'root' node.
  return   ans ;
}


function  adjList (  N ,   E  )
{
  // Create a new array of size N+1.
  // Fill it with 0s initially, then map each 0 to a new empty array.
  // This creates an adjacency list where each index `i` stores an array of neighbors for node `i`.
  var   list   =   new   Array ( N + 1 ) . fill ( 0 ) . map (  e   =>   new   Array ( )  ) ;

  /*
   * Iterate through each edge in the input array 'E'.
   * Each element in 'E' is an array representing an edge [source, destination].
   */
  for  (  var   i   =   0 ;    i   <   E.length ;    i++  )
  {
    // Extract the source node from the current edge.
    var   src    =   E[i][0] ;
    // Extract the destination node from the current edge.
    var   dest   =   E[i][1] ;

    // Add the destination node to the source node's adjacency list.
    list[src].push (  dest  ) ;
    // Add the source node to the destination node's adjacency list.
    // This makes the graph undirected.
    list[dest].push (  src  ) ;
  }

  // Return the fully constructed adjacency list.
  return   list ;
}


function  solve (  N ,   E  )
{
  // Generate the adjacency list representation of the graph using the provided N (number of nodes) and E (edges).
  var   adj   =   adjList ( N ,  E ) ;

  /*
   * The following lines are commented out in the original code.
   * They illustrate typical setup for a graph traversal (like DFS) from node 1.
   */
  // var  visited  =  new  Array ( N + 1 ) . fill ( 0 ) ;  // Initialize a 'visited' array for tracking nodes.
  // visited[1]  =  1 ;                                // Mark the starting node (node 1) as visited.
  // res  =  dfs ( 1 ,  adj ,  visited ) ;              // Begin the Depth First Search from node 1.

  // Currently, this function returns a fixed value 0.
  // In a complete solution, it would likely return a computed result based on the graph traversal.
  return   0 ;
}


function  main (  input  )
{
  // Split the entire input string by newline characters to get an array of individual lines.
  var   lines   =   input.split ( "\n" ) ;

  // Parse the first line to get the number of nodes (N), assuming it's an integer.
  var   N   =   parseInt ( lines[0] ) ;

  // Process the remaining lines (from the second line onwards) to extract edge information.
  // Each line is split by space, and each part is converted to an integer to form an edge array.
  var   E   =   lines.slice ( 1 ) . map (  l   =>   l.split ( ' ' ) . map (  e   =>   parseInt ( e )  )  ) ;

  // Call the 'solve' function with the parsed number of nodes and edges to get the final answer.
  var   ans   =   solve ( N ,  E ) ;

  // Print the computed answer to the console.
  console.log ( ans ) ;
}


// Read the entire content of '/dev/stdin' (standard input) as a UTF-8 string.
// Then, pass this input string to the 'main' function to start the program execution.
main (  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' )  ) ;