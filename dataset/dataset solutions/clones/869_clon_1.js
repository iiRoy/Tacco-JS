/*
 * File: graph_processor.js
 * Author: Original Author (hiroqn)
 * Date: October 6, 2013
 * Description: This script processes graph data from standard input.
 * It calculates longest paths in a directed acyclic graph (DAG)
 * using a topological sort-like approach (though it's not strictly topological sort,
 * it propagates values like Bellman-Ford or Dijkstra, but for max path).
 *
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 */


var   fs = require( 'fs' )
  , length = fs.fstatSync( process.stdin.fd ).size
  , buffer = new Buffer( length )
  , bytesRead = fs.readSync( process.stdin.fd, buffer, 0, length, 0 )
  , input = buffer.toString( 'utf8', 0, bytesRead ).split( '\n' )
; // End of initial variable declarations.


main(); // Execute the primary function of the script.


/**
 * The main function orchestrates the graph processing logic.
 * It reads graph structure, computes distances, and prints the result.
 */
function main ( ) {

  // Parse the first line of input to get graph dimensions (n = nodes, m = edges).
  var   temp = input.shift( ).split( ' ' )
    , n = +temp[ 0 ] // Number of nodes. Unary plus converts string to number.
    , m = +temp[ 1 ] // Number of edges.
    , graph = [ ] // Adjacency list representation of the graph.
    , d = [ ] // Array to store calculated distances (e.g., longest path from source).
    , i // Loop counter for iterations.
    , j // Another loop counter, currently commented out for its original purpose.
  ; // End of main function variable declarations.


  // Initialize graph structure and distance array.
  for ( i = 0 ; i < n ; i++ ) {

    graph[ i ] = [ ]; // Each node gets an empty list for its outgoing edges.
    d[ i ] = 0;       // Initialize all distances to zero.

    /*
     * Original code had a commented-out loop for initializing an adjacency matrix,
     * but the current implementation uses an adjacency list.
     */
    //    for (j = 0; j < n; j++) {
    //      graph[i][j] = Infinity;
    //    }
  }


  // Read and populate the graph with edges.
  for ( i = 0 ; i < m ; i++ ) {

    temp = input[ i ].split( ' ' ); // Each line represents an edge: [from, to, weight].

    // Add edge to the graph. 'temp[0]' is source, 'temp[1]' is destination, 'temp[2]' is weight.
    // Unary minus converts string to number.
    graph[ temp[ 0 ] - 0 ].push( [ temp[ 1 ] - 0, temp[ 2 ] - 0 ] );

    // This was an alternative way to represent weights in an adjacency matrix, now commented out.
    //    graph[temp[0] - 0][temp[1] - 1] = temp[2] - 0;

    // A debugging console log was present here.
    //    console.log(temp);

  }


  // Perform a kind of relaxed Bellman-Ford or SPFA-like algorithm (but for max path).
  // 'vlist' acts as a queue/stack for nodes whose neighbors might need updating.
  var   vlist = [ 0 ] // Start processing from node 0.
    , v // Current node being processed.
    , v2 // Neighbor node.
  ;

  while ( vlist.length ) {

    v = vlist.pop( ); // Get a node from the list to process.

    // Iterate over all outgoing edges from the current node 'v'.
    for ( i = 0 ; i < graph[ v ].length ; i++ ) {

      v2 = graph[ v ][ i ][ 0 ]; // The destination node of the current edge.

      // Another debugging console log.
      //      console.log(d[v2]);

      // If a longer path to 'v2' is found through 'v'.
      if ( d[ v2 ] < d[ v ] + graph[ v ][ i ][ 1 ] ) {

        d[ v2 ] = d[ v ] + graph[ v ][ i ][ 1 ]; // Update the distance to 'v2'.
        vlist.push( v2 );                       // Add 'v2' to the list for further processing.

      }

      // This commented line shows an alternative for minimum path calculation.
      //      d[graph[v][i][0]] = Math.min(d[graph[v][i][0]],d[v]+graph[v][i][1]);
    }
  }

  console.log( d ); // Output the final calculated distances array.

}
// End of the main function definition.