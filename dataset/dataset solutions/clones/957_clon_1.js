/*
 * This section defines the configuration for input reading.
 * It primarily sets the input source and the newline character.
 */
// The following line is for Windows systems, but it's currently commented out.
// config = { input: 'tmp', newline: '\r\n' }; // Windows configuration for input.
config = { input: '/dev/stdin', newline: '\n' }; /* This is the standard configuration for Linux/Unix-like systems. */



// Read the input data from the specified source.
// The data is read as ASCII, then trimmed, and finally split into lines.
line = require('fs').readFileSync(config.input, 'ascii')
 .trim() /* Remove leading/trailing whitespace. */
 .split(config.newline); /* Split the entire content into an array of strings, one per line. */


// Parse the number of nodes (n) from the first line of input.
n = Number( line.shift() ); // Convert the first line (which should be 'n') to a number.


// Initialize adjacency lists for the graph.
// 'adj' stores forward edges (u -> v), 'adjinv' stores inverse/backward edges (v -> u).
adj = {}; // Adjacency list: u -> {v: cost}
adjinv = {}; // Inverse adjacency list: v -> {u: cost}


/*
 * Helper function to add an edge to an adjacency list.
 * Parameters:
 *   obj: The adjacency list object (either 'adj' or 'adjinv').
 *   u: The source node.
 *   v: The destination node.
 *   c: The cost/weight of the edge.
 */
function add ( obj , u , v , c ) {
 // Ensure the source node 'u' exists in the adjacency list.
 if ( ! obj.hasOwnProperty( u ) ) {
  obj[ u ] = {};
 }
 // Add or update the edge from 'u' to 'v' with cost 'c'.
 obj[ u ][ v ] = c ;
}


// Process each remaining line of input to build the graph.
// Each line represents a node 'u' and its outgoing edges.
for ( i in line ) {
 // Split the line by spaces and convert parts to numbers.
 ary = line[ i ].split(' ').map( Number ) ;
 u = ary[ 0 ] ; // The first element is the source node 'u'.

 // Iterate through the rest of the array, which contains pairs of (neighbor, cost).
 for ( j = 2 ; j < ary.length ; j += 2 ) {
  // Add the forward edge.
  add( adj , u , ary[ j ] , ary[ j + 1 ] ) ;
  // Add the inverse edge.
  add( adjinv , ary[ j ] , u , ary[ j + 1 ] ) ;
 }
}


/*
 * --- Start of a simple Breadth-First Search (BFS) implementation ---
 * This BFS calculates the shortest path in terms of number of edges
 * (stored in 'dist') and the shortest path cost (stored in 'd')
 * from the starting node (node 0) to all other reachable nodes.
 */

// Initialize BFS-related variables.
cnt = 0; /* Counter for BFS levels. */
dist = new Array( n ) ; // Stores the BFS level (distance in terms of edges) from the start node (node 0).
d = new Array( n ) ; // Stores the shortest path distance (cost) from the start node (node 0).

// Initialize distance arrays.
for ( i = 0 ; i < n ; i++ ) {
 dist[ i ] = null ; // 'null' means unvisited in terms of BFS level.
 d[ i ] = Number.MAX_VALUE ; // Initialize shortest path costs to infinity.
}

// Set the starting node (node 0) for BFS.
dist[ 0 ] = 0 ; // Node 0 is at level 0.
d[ 0 ] = 0 ; // Shortest path cost to node 0 is 0.


// Main BFS loop. Continues as long as 'rest' is 1, indicating new nodes were visited in the previous level.
do {
 rest = 0 ; // Flag to check if any new nodes were visited in this iteration.

 // Iterate through all nodes in the adjacency list.
 for ( i in adj ) {
  // Only process nodes that are at the current BFS level 'cnt'.
  if ( dist[ i ] !== cnt ) {
   continue ; // Skip nodes not at the current level.
  }

  adj_i = adj[ i ] ; // Get the adjacency list for the current node 'i'.

  // Iterate through neighbors 'j' of node 'i'.
  for ( j in adj_i ) {
   // If neighbor 'j' has not been visited yet (in terms of BFS level).
   if ( dist[ j ] === null ) {
    dist[ j ] = cnt + 1 ; // Assign it to the next BFS level.
    rest = 1 ; // Mark that new nodes were visited.
   }
   // Update the shortest path cost to 'j'.
   d[ j ] = Math.min( d[ j ] , d[ i ] + adj_i[ j ] ) ;
  }
 }
 cnt++ ; // Move to the next BFS level.
} while ( rest ) ; // Continue if new nodes were found.

/*
 * --- End of simple BFS ---
 */


/*
 * Prepare nodes for processing in a specific order.
 * This section creates a sorted list of nodes based on their shortest path distance 'd'.
 * It also creates an inverse mapping from node ID to its position in the sorted list.
 */

bfsnode = new Array( n ) ; // Array to hold nodes sorted by their 'd' value.
// Populate bfsnode with node indices.
for ( i = 0 ; i < n ; i++ ) {
 bfsnode[ i ] = i ;
}

// Sort bfsnode based on the shortest path distance 'd' from node 0.
bfsnode.sort( function ( a , b ) { return d[ a ] - d[ b ] ; } ) ;


bfsnodeinv = {} ; // Inverse map: node ID -> its index in the sorted bfsnode array.
// Populate the inverse map.
for ( i = 0 ; i < n ; i++ ) {
 bfsnodeinv[ bfsnode[ i ] ] = i ;
}


/*
 * The following block is commented out, but represents a
 * more advanced dynamic programming approach combined with DFS
 * to potentially re-evaluate or refine shortest paths.
 * It seems to be an attempt at a Bellman-Ford or Dijkstra-like
 * relaxation process, possibly for handling negative cycles
 * or a specific kind of pathfinding optimization.
 *
 * Current logic:
 *   min[0, u] = min { min[0, v] + adj[v, u] if min[0, v] is known,
 *                     find min[0, v] starting from (bfsmin[0, u] - adj[u, v])
 *                       and min[0, v] + adj[v, u] }
 *                   for v in adjinv[u]
 */

/*
// Variables for DFS and dynamic programming.
visited = new Array( n ) ; // Tracks visited nodes during DFS traversal.
for ( i = 0 ; i < n ; i++ ) {
 visited[ i ] = false ; // Initialize all nodes as unvisited.
}

cur = new Array( n ) ; // This array acts as a stack for the current path in DFS.
rest = new Array( n ) ; // This array also acts as a stack, storing unvisited neighbors for backtracking.


// Recursive Depth-First Search function.
// This function appears to be looking for paths from 'v' to 'u' under certain cost constraints.
function dfs ( v , u , start ) {
 var sp = 0 , cost = 0 , res = start , going , next ; // Initialize DFS internal variables.
 visited[ u ] = true ; // Mark 'u' as visited.
 visited[ v ] = true ; // Mark 'v' as visited.
 cur[ 0 ] = v ; // Start the current path from 'v'.
 rest[ 0 ] = Object.keys( adjinv[ v ] ) ; // Get neighbors of 'v' from the inverse adjacency list.

 while ( true ) { // Loop indefinitely until an explicit return.
  if ( rest[ sp ].length === 0 ) {
   if ( sp === 0 ) {
    return res ; // If stack is empty, return the result.
   }
   cost -= adjinv[ cur[ sp - 1 ] ][ cur[ sp ] ] ; // Backtrack: remove cost of the last edge.
   sp-- ; // Pop from stack.
   continue ; // Continue to the next iteration of the while loop.
  }
  next = rest[ sp ].pop() ; // Get the next neighbor to explore.
  if ( visited[ next ] ) {
   continue ; // Skip if already visited.
  }
  if ( cost + adjinv[ cur[ sp ] ][ next ] >= start ) {
   continue ; // Pruning: skip if path cost exceeds 'start' threshold.
  }
  if ( bfsnodeinv[ next ] < bfsnodeinv[ u ] ) {
   // If 'next' is processed earlier than 'u' in bfsnode order.
   res = Math.min( res , cost + adjinv[ cur[ sp ] ][ next ] + d[ next ] ) ;
   continue ;
  }
  cost += adjinv[ cur ][ next ] ; // Add edge cost to current path cost.
  sp++ ; // Push to stack.
  cur[ sp ] = next ; // Add 'next' to the current path.
  rest[ sp ] = Object.keys( adjinv[ next ] ) ; // Get neighbors of 'next'.
 }
}


// Main loop for dynamic programming using the sorted bfsnode order.
for ( i in bfsnode ) {
 u = bfsnode[ i ] ; // Current node 'u' from the sorted list.

 // First pass: Relax edges from nodes already processed (smaller bfsnodeinv index).
 for ( v in adjinv[ u ] ) {
  if ( bfsnodeinv[ v ] < bfsnodeinv[ u ] ) {
   d[ u ] = Math.min( d[ u ] , d[ v ] + adj[ v ][ u ] ) ;
  }
 }

 // Second pass: Explore paths using DFS for nodes not yet processed (larger bfsnodeinv index).
 for ( v in adjinv[ u ] ) {
  if ( bfsnodeinv[ v ] > bfsnodeinv[ u ] ) {
   d[ u ] = dfs( v , u , d[ u ] - adj[ v ][ u ] ) + adj[ v ][ u ] ;
  }
 }
}

// Output the final shortest path distances.
for ( i = 0 ; i < n ; i++ ) {
 console.log( i + ' ' + d[ i ] ) ;
}
*/