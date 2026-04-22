/*
 * This JavaScript file processes standard input to solve a graph-related problem.
 * It identifies connected components within an undirected graph, where nodes represent
 * people and edges represent relationships (couples). The primary goal is to determine
 * the size of the largest connected component found.
 */

// Global variables are used to manage the input stream from `process.stdin`.
let inputString = "" ; // This variable accumulates all incoming data from stdin.
let currentLine   = 0 ; // This counter keeps track of the current line being read from `inputString`.

// Event listener for the 'data' event on the standard input stream.
// This function is executed whenever new data chunks are received.
process.stdin.on ( "data" , ( data ) => {
  // Append the newly received data chunk to the `inputString`.
  // This ensures that all input is collected before processing begins.
  inputString += data ;
} ) ;

// Event listener for the 'end' event on the standard input stream.
// This function runs only after all input data has been completely received.
process.stdin.on ( "end" , function ( ) {
  // First, clean up the accumulated input string:
  // 1. `trim()`: Removes any leading or trailing whitespace from the entire input.
  // 2. `split("\n")`: Divides the string into an array of lines based on newline characters.
  // 3. `map((str) => str.trim())`: Iterates over each line in the array and removes
  //    leading/trailing whitespace from individual lines.
  inputString = inputString
    . trim ( )
    . split ( "\n" )
    . map ( ( str ) => str . trim ( ) ) ;

  // Once the input is prepared, invoke the main logic function.
  main ( ) ;
} ) ;

/**
 * A utility function to read a single line from the processed input.
 * It uses the `currentLine` global variable to keep track of the position.
 *
 * @returns {string} The next available line from the `inputString` array.
 */
function readLine ( )
{
  // Returns the line at the `currentLine` index and then increments the index.
  return inputString [ currentLine ++ ] ;
}

// The main function encapsulates the core algorithm and problem-solving logic.
function main ( )
{
  // Read the first line of input, which contains two space-separated numbers:
  // `totalPeople`: The total number of people (though not directly used in this solution's logic, it's part of the input spec).
  // `t`: The number of relationships (couples) to follow.
  let [ totalPeople , t ] = readLine ( )
    . split ( " " ) // Splits the line by space to get string representations of numbers.
    . map ( ( n ) => parseInt ( n ) ) ; // Converts these string representations into actual integers.

  // Initialize data structures required for graph representation and edge tracking.
  const graph = { } ;      // An adjacency list to represent the undirected graph.
                           // Keys are person IDs, values are objects mapping neighbors to `true`.
  const seenCouple = { } ; // A hash map to keep track of couples already processed, preventing duplicate edge additions.
                           // Keys are formatted as "p1-p2" (e.g., "1-2").

  // Loop `t` times, processing each couple relationship provided in the input.
  while ( t -- )
  {
    // Read the current line, which contains two space-separated person IDs (p1 and p2).
    let [ p1 , p2 ] = readLine ( )
      . split ( " " ) // Split the line to get individual person ID strings.
      . map ( ( n ) => parseInt ( n ) ) ; // Convert these ID strings into integers.

    // Check if this specific couple (p1-p2) has already been processed.
    // This uses a canonical string key (e.g., "1-2") to ensure uniqueness.
    if ( ! seenCouple [ `${ p1 }-${ p2 }` ] )
    {
      // If the couple is new, mark it as seen to avoid re-processing.
      seenCouple [ `${ p1 }-${ p2 }` ] = true ;

      // Add an edge from p1 to p2 in the graph.
      // If p1 is not yet a key in `graph`, initialize its adjacency list.
      if ( ! graph [ p1 ] )
        graph [ p1 ] = { [ p2 ] : true } ;
      // Otherwise, add p2 to p1's existing list of neighbors.
      else
        graph [ p1 ] [ p2 ] = true ;

      // Since the graph is undirected, also add an edge from p2 to p1.
      // If p2 is not yet a key in `graph`, initialize its adjacency list.
      if ( ! graph [ p2 ] )
        graph [ p2 ] = { [ p1 ] : true } ;
      // Otherwise, add p1 to p2's existing list of neighbors.
      else
        graph [ p2 ] [ p1 ] = true ;
    }
  }

  // Variables for tracking the maximum connected component size and visited nodes during DFS.
  let max     = 0 ;     // Stores the largest component size found so far.
  let visited = { } ;   // A hash map to keep track of nodes already visited during DFS traversal.
                        // This prevents infinite loops in cycles and ensures each node is processed once.

  // Iterate over each person (node) present in the graph.
  for ( let key in graph )
  {
    // If the current node `key` has not yet been visited, it means it belongs
    // to a new, unexplored connected component.
    if ( ! visited [ key ] )
    {
      // Perform a Depth-First Search (DFS) starting from this unvisited node.
      // The DFS will return the size of the connected component it explores.
      // Update `max` if the current component's size is greater than the previously recorded maximum.
      max = Math . max ( max , dfs ( key ) ) ;
    }
  }

  // After checking all components, print the maximum size found to the console.
  console . log ( max ) ;

  /**
   * Implements a Depth-First Search (DFS) algorithm to traverse a connected component
   * of the graph and count the number of nodes within it.
   *
   * @param {string} node - The starting node (person ID) for the DFS traversal.
   * @returns {number} The total count of nodes in the connected component reachable from `node`.
   */
  function dfs ( node )
  {
    let count = 0 ; // Initialize a counter for nodes in the current component.

    visited [ node ] = true ; // Mark the current node as visited to prevent re-processing.
    count ++ ;                 // Increment the count for the current node.

    const neighbours = graph [ node ] ; // Retrieve the list of neighbors for the current node.

    // Iterate through each neighbor of the current node.
    for ( let neighbour in neighbours )
    {
      // If a neighbor has not yet been visited, recursively call DFS on it.
      if ( ! visited [ neighbour ] )
      {
        visited [ neighbour ] = true ; // Mark the neighbor as visited before the recursive call to prevent re-visiting in the same path.
        count += dfs ( neighbour ) ;   // Add the count of nodes from the neighbor's sub-component to the current component's total.
      }
    }
    return count ; // Return the total count of nodes in the connected component found.
  }
}