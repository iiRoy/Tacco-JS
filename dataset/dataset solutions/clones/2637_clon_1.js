input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;
lines = input . split ( '\n' ) ;

// The first line contains N (number of nodes) and Q (number of queries).
line = lines . shift ( ) . split ( ' ' ) ;

N = line [ 0 ] * 1 ; // Convert N to a number.

e = [ ] ; // Array 'e' likely used for visited status during graph traversal.
e [ 1 ] = ; // This line appears to be an incomplete assignment in the original.

Q = line [ 1 ] * 1 ; // Convert Q to a number.

t = { } ; // Object 't' will serve as an adjacency list for the graph.
n = [ ] ; // Array 'n' will store values associated with each node.
a = [ ] ; // Array 'a' will store the final accumulated values for each node.

// Initialize graph structures based on N.
for ( i = 1 ; i <= N ; i++ ) {
  t [ i ] = [ ] ;   // Each node gets an empty list for its neighbors.
  n [ i ] = 0 ;     // Initialize each node's value to 0.
  a . push ( 0 ) ;  // Initialize the result array with 0s for N nodes.
}

// Read N-1 lines to build the graph (edges).
for ( i = 0 ; i < N - 1 ; i ++ ) {
  line = lines [ i ] . split ( ' ' ) ; // Split current line into two node IDs.

  // Add bidirectional edges.
  t [ line [ 0 ] ] . push ( line [ 1 ] ) ;
  t [ line [ 1 ] ] . push ( line [ 0 ] ) ;
}

// Process Q queries to update node values.
for ( i = N - 1 ; i < N + Q ; i ++ ) {
  line = lines [ i ] . split ( ' ' ) ; // Each query line has a node ID and a value.

  // Add the value to the specified node's current total.
  n [ line [ 0 ] ] += line [ 1 ] * 1 ;
}

h = [ ] ; // 'h' acts as a stack/queue for graph traversal (stores [node, accumulated_value]).
c = 0 ;   // 'c' will temporarily hold accumulated value during traversal.

h . push ( [ 1 , 0 ] ) ; // Start traversal from node 1, with an initial accumulated value of 0.

e = [ ] ;     // Re-initialize 'e' for tracking visited nodes during traversal.
e [ 1 ] = 1 ; // Mark the starting node (node 1) as visited.

// Perform a depth-first-like traversal to accumulate values.
while ( h . length ) {

  s = h . pop ( ) ; // Pop the next node and its parent's accumulated value.
  j = s [ 0 ] ;     // Current node ID.
  c = s [ 1 ] ;     // Accumulated value inherited from parent.

  c += n [ j ] ; // Add the current node's own value to the accumulated sum.

  a [ j - 1 ] = c ; // Store the final accumulated value for node 'j' (adjusting for 0-indexing).

  // Explore neighbors of the current node 'j'.
  for ( k = 0 ; k < t [ j ] . length ; k ++ ) {

    // If the neighbor has not been visited yet.
    if ( ! e [ t [ j ] [ k ] ] ) {

      h . push ( [ t [ j ] [ k ] , c ] ) ; // Push neighbor to stack with current accumulated value.
      e [ t [ j ] [ k ] ] = 1 ;           // Mark the neighbor as visited.
    }
  }
}

// Output the final accumulated values, joined by spaces.
console . log ( a . join ( ' ' ) ) ;