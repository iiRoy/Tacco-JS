/*
 * This JavaScript code implements Dijkstra's algorithm
 * to find the shortest paths from a source node to all other nodes
 * in a given graph.
 *
 * The graph is represented as an adjacency matrix G,
 * where G[i][j] stores the cost of the edge from node i to node j.
 * Number.POSITIVE_INFINITY indicates no direct edge.
 *
 * Input is read from /dev/stdin, parsed, and then processed.
 * Output is printed to console.
 */


var input = require( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) ;

var lines = input.split( '\n' ) ;


// Read the number of nodes (n) from the first line of input
var n = +lines.shift( ) ;


// Initialize the adjacency matrix G
var G = [ ] ;

// Loop to set up the initial graph structure
for ( var i = 0 ; i < n ; i ++ ) {
  G.push( [ ] ) ; // Add a new row for node i

  // Initialize all direct edge costs to infinity
  for ( var j = 0 ; j < n ; j ++ ) {
    G[ i ] [ j ] = Number.POSITIVE_INFINITY ;
  }

  // Cost from a node to itself is 0
  G[ i ] [ i ] = 0 ;
}


// Populate the graph with edge information from subsequent input lines
for ( var i = 0 ; i < n ; i ++ ) {
  // Parse the current line: u[0]=node_id, u[1]=num_adjacencies, u[2+j*2]=adj_node, u[2+j*2+1]=cost
  var u = lines.shift( ) . trim( ) . split( ' ' ) . map( function ( n ) { return +n } ) ;

  var id = u[ 0 ] ; // The current node's ID (which should be 'i' in this loop)
  var k = u[ 1 ] ;  // Number of adjacent nodes for this 'id'

  // Loop through all adjacent nodes and their costs
  for ( var j = 0 ; j < k ; j ++ ) {
    var adj = u[ 2 + j * 2 ] ;      // Adjacent node ID
    var cost = u[ 2 + j * 2 + 1 ] ; // Cost to reach the adjacent node

    G[ i ] [ adj ] = cost ; // Set the cost in the adjacency matrix
  }
}


// Initialize cost array for Dijkstra's algorithm
var cost = [ 0 ] ; // Cost to reach the source (node 0) is 0

// Initialize costs to all other nodes as infinity
for ( var i = 1 ; i < n ; i ++ ) {
  cost.push( Number.POSITIVE_INFINITY ) ;
}

// Keep track of visited nodes
var visited = { } ;


// Main loop for Dijkstra's algorithm
while ( true ) {
  var u = -1 ; // Current node with the minimum cost that hasn't been visited yet

  // Find the unvisited node with the smallest current cost
  for ( var i = 0 ; i < n ; i ++ ) {
    // Check if node 'i' has not been visited AND
    // either 'u' is not set yet OR cost[i] is less than cost[u]
    if ( !visited[ i ] && ( u == -1 || cost[ i ] < cost[ u ] ) ) {
      u = i ; // Update 'u' to the new minimum cost node
    }
  }

  // If no unvisited node is found (all nodes processed), break the loop
  if ( u == -1 ) {
    break ;
  }

  visited[ u ] = true ; // Mark the selected node 'u' as visited

  // Relax edges from node 'u': update costs to its neighbors
  for ( var i = 0 ; i < n ; i ++ ) {
    // Update cost[i] if a shorter path is found through 'u'
    cost[ i ] = Math.min( cost[ i ] , cost[ u ] + G[ u ] [ i ] ) ;
  }
}


// Output the shortest path costs from the source node (node 0) to all other nodes
for ( var i = 0 ; i < n ; i ++ ) {
  console.log( i , cost[ i ] ) ;
}