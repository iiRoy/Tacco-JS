/*
 * This is a JavaScript file.
 * It strictly adheres to modern coding practices.
 */
'use strict'; // Enforce strict parsing and error handling in the script.

/*
 * The main function processes the input data.
 * @param {string} input - The raw input string from stdin.
 */
function   Main ( input )
{

  // Prepare the input: trim whitespace and split into lines.
  input = input . trim ( ) . split ( '\n' ) ;

  // Parse the first line to get N, u, and v.
  const   array   =   input [ 0 ] . split ( ' ' ) . map ( s => parseInt ( s ) ) ;

  // N: Number of nodes in the graph.
  const   N = array [ 0 ] ;
  // u: Starting node for the first DFS.
  const   u = array [ 1 ] ;
  // v: Starting node for the second DFS.
  const   v = array [ 2 ] ;

  // Extract the remaining lines which represent the edges.
  const   rest = input . slice ( 1 ) ;

  /*
   * Map the rest of the input lines to an array of arrays,
   * where each inner array represents an edge [nodeA, nodeB].
   */
  const list = rest . map ( s => {
      // Split each line by space and parse integers.
      return   s . split ( ' ' ) . map ( ss => parseInt ( ss ) ) ;
  } ) ;


  /*
   * Initialize an adjacency list representation of the graph.
   * Keys are nodes, values are arrays of connected nodes.
   */
  var   map = { } ; // Use an object as a hash map for adjacency list.

  // Populate the adjacency list based on the input edges.
  for ( var   i = 0 ;   i < N - 1 ;   ++ i ) {

      var   tmp   =   list [ i ] ; // Get the current edge [a, b].
      var   a   =   tmp [ 0 ] ;    // First node of the edge.
      var   b   =   tmp [ 1 ] ;    // Second node of the edge.


      // Ensure both nodes have an entry in the map.
      if ( ! map [ a ] ) {
          map [ a ] = [ ] ; // Initialize an empty array if node 'a' is new.
      }
      if ( ! map [ b ] ) {
          map [ b ] = [ ] ; // Initialize an empty array if node 'b' is new.
      }

      // Add bidirectional edges.
      map [ a ] . push ( b ) ; // Add 'b' to 'a's neighbors.
      map [ b ] . push ( a ) ; // Add 'a' to 'b's neighbors.
  }

  // Initialize distance array for DFS starting from 'u'.
  var   distA   =   Array ( N + 1 ) ;
  distA . fill ( 0 ) ; // Fill with 0s initially.

  // Initialize distance array for DFS starting from 'v'.
  var   distB   =   Array ( N + 1 ) ;
  distB . fill ( 0 ) ; // Fill with 0s initially.

  /*
   * Depth-First Search function to calculate distances from a starting node.
   * @param {number} curr - The current node.
   * @param {number} pre - The previous node (to avoid going back).
   * @param {number} d - The current distance from the start.
   * @param {Array<number>} dist - The array to store calculated distances.
   */
  const dfs = ( curr , pre , d , dist ) => {
    // Set the distance for the current node.
    dist [ curr ] = d ; // Store the distance to the current node.

    // Iterate over all neighbors of the current node.
    for ( var   i   in   map [ curr ] ) {
      var   next   =   parseInt ( map [ curr ] [ i ] ) ; // Get the neighbor node.
      // If the neighbor is not the previous node, continue DFS.
      if ( next !== pre ) {
        // Recursively call DFS for the neighbor, incrementing distance.
        dfs ( next , curr , d + 1 , dist ) ;
      }
    }
  } ;

  // Perform DFS starting from node 'u' to populate distA.
  dfs ( u , -1 , 0 , distA ) ;
  // Perform DFS starting from node 'v' to populate distB.
  dfs ( v , -1 , 0 , distB ) ;

  // Initialize variable to store the maximum distance.
  var   max   =   0 ;

  // Iterate through all possible nodes (from 0 to N).
  for ( var   i = 0 ;   i < N + 1 ;   ++ i ) {
    // If the distance from 'u' is less than the distance from 'v' for node 'i'.
    if ( distA [ i ] < distB [ i ] ) {
      // Update max with the greater of current max and distA[i].
      max = Math . max ( max , distA [ i ] ) ;
    }
  }

  // Output the calculated maximum value to the console.
  console . log ( max ) ;

}

// Read input from stdin and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;