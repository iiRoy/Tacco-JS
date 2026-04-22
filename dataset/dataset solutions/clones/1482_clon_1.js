/*
 *  This file contains a set of JavaScript functions
 *  designed to process graph-related data.
 *  It includes functions for vector-like operations
 *  and a main function to handle input and
 *  perform graph connectivity analysis.
 *
 *  Author: Expert Code Cloner
 *  Date: 2023-10-27
 *  Version: 1.0.0
 */

// Function to calculate the dot product of two lists (vectors).
// This is effectively a "kakeru" (multiply) operation.
function kakeru ( listx , listy ) {

  var count = 0 ; // Initialize a counter for the sum of products.

  // Loop through the elements of the lists.
  for ( var k = 0 ; k < listx.length ; k++ ) {
    // Add the product of corresponding elements to the count.
    count = count + listx[k] * listy[k] ;
  }

  return count ; // Return the final calculated dot product.
}




// Function to perform a specific element-wise modification on two lists.
// This is effectively a "tasu" (add) operation, but with a twist.
function tasu ( listx , listy ) {
  // Iterate over the elements of the lists.
  for ( var k = 0 ; k < listx.length ; k++ ) {
    // First, update an element in listx.
    listx[k] = listx[k] + listy[k] ; // Add corresponding elements.
    // Then, update an element in listy, using the *newly updated* listx[k].
    listy[k] = listy[k] + listx[k] ;
  }
}



/*
 *  The main entry point of the program.
 *  It processes input data to build and analyze a graph.
 *  The input is expected to be a string containing numbers
 *  separated by spaces and newlines.
 */
function Main ( input ) {
  // Parse the input string: split by newlines, then by spaces,
  // and convert all resulting parts to numbers.
  input = input.split( /\n/ ).map( n => n.split( ' ' ).map( v => +v ) ) ;

  // Extract N (number of nodes) and M (number of edges) from the first line of input.
  const N = input[0][0] ; // N is the first element of the first line.
  const M = input[0][1] ; // M is the second element of the first line.


  // --- Graph Initialization ---
  // This section initializes an adjacency matrix 'G' for the graph.
  var G = [] ; // Declare the graph adjacency matrix.

  // Initialize G as an N x N matrix filled with zeros.
  for ( var i = 0 ; i < N ; i++ ) {

    G.push( [] ) ; // Add a new row to the graph.

    for ( var j = 0 ; j < N ; j++ ) {

      G[i].push( 0 ) ; // Fill the row with zeros.
    }
  }

  // Set diagonal elements to 1, indicating self-loops or self-connectivity.
  for ( var i = 0 ; i < N ; i++ ) {

    G[i][i] = 1 ; // Node i is connected to itself.
  }


  // --- Populate Graph Edges ---
  // Read edge information from the input and update the adjacency matrix.
  var a , b ; // Declare variables for node indices.

  // Loop through the 'M' edges provided in the input.
  for ( var i = 1 ; i <= M ; i++ ) {
    a = input[i][0] ; // First node of the current edge.
    b = input[i][1] ; // Second node of the current edge.

    // Adjust indices to be 0-based.
    // Set connections in both directions for an undirected graph.
    G[a-1][b-1] = 1 ;
    G[b-1][a-1] = 1 ;
  }


  // --- Apply Connectivity Logic (Floyd-Warshall-like modification) ---
  // This section propagates connectivity information throughout the graph.
  // The original comment was "上下に卸す。" which means "Distribute up and down."
  // It effectively updates reachability based on existing paths.
  for ( var i = 0 ; i < N ; i++ ) { // Iterate over each row (node i).

    for ( var I = 0 ; I < N ; I++ ) { // Iterate over each row again (node I).

      // If there's any common connection between row G[i] and row G[I] (dot product is non-zero).
      if ( kakeru( G[i] , G[I] ) != 0 ) {
        // Apply the 'tasu' function to modify both rows,
        // potentially propagating connectivity.
        tasu( G[i] , G[I] ) ;
      }
    }
  }


  // --- Group Connected Components ---
  // This section identifies and groups connected components based on the modified graph 'G'.
  var group = [] ; // Array to store the identified groups.
  var cities = [ ...Array(N).keys() ] ; // Initialize an array of cities (nodes) from 0 to N-1.

  for ( var i = 0 ; i < N ; i++ ) { // Iterate through each city.

    if ( cities[i] != null ) { // If the city hasn't been grouped yet.

      cities[i] = null ; // Mark the current city as visited.
      group.push( [i] ) ; // Start a new group with the current city.

      for ( var j = 0 ; j < N ; j++ ) { // Check connectivity to other cities.

        // If it's a different city and there's a connection in the graph.
        if ( i != j && G[i][j] != 0 ) {

          group[ group.length - 1 ].push( j ) ; // Add the connected city to the current group.
          cities[j] = null ; // Mark the connected city as visited.
        }
      }
    }
  }

  // Calculate the result: The number of groups minus one (often used for specific graph problems).
  result = group.length - 1 ;
  console.log( result ) ; // Output the final result.
}


// Read input from standard input and pass it to the Main function.
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;