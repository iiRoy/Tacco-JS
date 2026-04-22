/*
 * This is a Type I clone generated to demonstrate variations
 * solely in whitespace and comments.
 * This code aims to solve a problem involving connected components or paths in a graph-like structure.
 */
'use strict' ; // Enforce strict mode for cleaner and safer JavaScript code execution.


function   main ( stdin )
{
  // Step 1: Parse the input data from the standard input string.
  // The input string is first split into an array of lines based on newline characters.
  const input = stdin . split ( '\n' ) ;

  // The first line of the input typically contains parameters for the problem.
  // It's shifted off the input array, split by spaces, and then each part is converted to an integer.
  const param = input . shift ( ) . split ( ' ' ) . map ( v => parseInt ( v , 10 ) ) ;

  // Extract N (number of nodes/elements) from the parsed parameters.
  const N = param [ 0 ] ;

  // Extract M (number of relations/pairs) from the parsed parameters.
  const M = param [ 1 ] ;

  // The remaining lines in the input array represent pairs of related elements.
  // Each line is processed similarly: split by spaces and convert parts to integers.
  const pairs = input . map ( p => p . split ( ' ' ) . map ( v => parseInt ( v , 10 ) ) ) ;


  // Step 2: Initialize data structures required for tracking node states and relationships.
  // 'arrived' array: A boolean array to keep track of whether a node has been visited/arrived at during a search.
  const arrived = [ ] ;
  // 'refs' array: An array of arrays (adjacency list) to store references (outgoing edges) for each node.
  const refs = [ ] ;

  // Initialize both 'arrived' status and 'refs' list for each node from 1 to N.
  for ( let i = 1 ; i <= N ; ++ i )
  {
    arrived [ i ] = false ; // Initially, no node has been visited.
    refs [ i ] = [ ] ;      // Each node starts with an empty list of references.
  }

  // Populate the 'refs' (adjacency list) array based on the 'pairs' extracted from input.
  // For each pair [source, destination], add 'destination' to the 'refs' list of 'source'.
  pairs . forEach ( p => {
    refs [ p [ 0 ] ] . push ( p [ 1 ] ) ; // Add a directed reference from p[0] to p[1].
  } ) ;


  /**
   * Step 3: Define the search function.
   * This function performs a depth-first-like traversal starting from a given node.
   * It marks nodes as 'arrived' as it visits them.
   * @param {number} n The current node from which to continue the search.
   * @returns {boolean} Returns true if the search completes without further references.
   */
  function   search ( n )
  {
    arrived [ n ] = true ; // Mark the current node 'n' as visited.

    // If the current node has no more outgoing references, this path ends.
    if ( ! refs [ n ] . length )
    {
      return true ;
    }

    // Recursively call search on the next available reference (first element) of the current node.
    // The .shift() method removes and returns the first element, effectively consuming the reference.
    search ( refs [ n ] . shift ( ) ) ;
  }


  // Step 4: Main loop to count distinct "components" or paths.
  let i = 1 ;     // Initialize a counter 'i' to iterate through nodes, starting from 1.
  let ans = 0 ;   // Initialize 'ans' to store the final count of components.

  // Loop through all nodes from 1 to N.
  while ( i <= N )
  {
    ++ ans ; // Increment the answer for each new component identified.
    search ( i ) ; // Start a new search from node 'i'. This search will mark all reachable nodes as 'arrived'.

    // After a search completes, advance 'i' past all nodes that have now been marked as 'arrived'.
    // This ensures that subsequent searches start only from unvisited nodes, thus counting distinct components.
    while ( arrived [ i ] )
    {
      ++ i ;
    }
  }


  // Step 5: Output the final result.
  // Print the calculated number of components to the console.
  console . log ( ans ) ;
}

// Entry point of the script: Read the entire content of '/dev/stdin' as UTF-8
// and pass it to the 'main' function for processing.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;