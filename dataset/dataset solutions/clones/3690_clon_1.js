function    Main( s )
{
    // The input string 's' is expected to contain multiple lines.
    // We split it by newline characters to get an array of lines.
    s = s.split( "\n" ) ;

    /*
     * The first line of input (s[0]) contains several space-separated integers.
     * These represent the number of nodes (n), number of edges (m),
     * and the start/end points for the two Dijkstra runs (q, t).
     */
    var n = s[0].split( " " ).map( a => +a );

    // Extracting parameters from the parsed first line
    var m = n[1]; // Number of edges
    var q = n[2] - 1; // Start node for the first Dijkstra (0-indexed)
    var t = n[3] - 1; // Start node for the second Dijkstra (0-indexed)
    n = n[0]; // Number of nodes

    // Arrays to store edge information:
    // u, v: source and destination nodes for each edge
    // a, b: weights for each edge, corresponding to two different criteria
    var u = [ ] , v = [ ] , a = [ ] , b = [ ] ;

    // Loop through the subsequent lines to parse edge data.
    // Each line i+1 (from 1 to m) describes an edge.
    for ( var i = 0 ; i < m ; i++ )
    {
        /*
         * Parse the current edge line.
         * z[0]: source node (1-indexed)
         * z[1]: destination node (1-indexed)
         * z[2]: weight for the first Dijkstra
         * z[3]: weight for the second Dijkstra
         */
        var z = s[i+1].split( " " ).map( a => +a ) ;

        // Store the parsed edge data, converting nodes to 0-indexed.
        u[i] = z[0] - 1 ;
        v[i] = z[1] - 1 ;
        a[i] = z[2] ;
        b[i] = z[3] ;
    }

    // Run Dijkstra's algorithm to find shortest paths from 'q' using weights 'a'.
    // 'c' will store the shortest distances from 'q' to all other nodes.
    var c = dijkstra( u , v , a , q , n ) ;

    // Run Dijkstra's algorithm again to find shortest paths from 't' using weights 'b'.
    // 'd' will store the shortest distances from 't' to all other nodes.
    var d = dijkstra( u , v , b , t , n ) ;

    // Initialize an array 'e' to store the results of the calculation.
    var e = [ ] ;

    // Start iterating from the last node (n-1) down to 0.
    // The problem seems to involve finding a maximum value related to path sums.
    i = n - 1 ;

    // Calculate the initial value for the last node.
    // 1e15 is a large constant, likely representing a very large maximum value.
    e[i] = 1e15 - c[i] - d[i] ;

    // Iterate backwards from n-2 down to 0.
    // For each node i, e[i] is the maximum of e[i+1] and the current node's value.
    for ( ; i-- ; )
    {
        e[i] = Math.max( e[i+1] , 1e15 - c[i] - d[i] ) ;
    }

    // Output the calculated array 'e', with each element on a new line.
    console.log( e.join( "\n" ) ) ;
}


/*
 * This function implements Dijkstra's algorithm to find the shortest paths
 * from a single source node 's' to all other nodes in a graph.
 *
 * @param {Array<number>} a - Array of source nodes for edges.
 * @param {Array<number>} b - Array of destination nodes for edges.
 * @param {Array<number>} c - Array of weights for the edges.
 * @param {number} s - The starting node (source) for Dijkstra's algorithm.
 * @param {number} k - The total number of nodes in the graph.
 * @returns {Array<number>} An array 'r' where r[i] is the shortest distance from 's' to node 'i'.
 */
function dijkstra( a , b , c , s , k )
{
    /*
     * 't' represents the adjacency list (or matrix) of the graph.
     * It's initialized as an array of empty arrays.
     * t[u][v] will store the weight of the edge between u and v.
     * This implementation assumes an undirected graph where t[u][v] = t[v][u].
     */
    var t = Array( k ) .fill( 0 ) .map( a => [ ] ) ;

    // Populate the adjacency list with edge weights.
    // Edges are added for both directions (u-v and v-u).
    for ( var i = 0 ; i < a.length ; i++ )
    {
        t[a[i]][b[i]] = t[b[i]][a[i]] = c[i] ;
    }

    /*
     * 'r' stores the shortest distance found so far from the source 's' to each node.
     * It's initialized with a very large number (9e99) to represent infinity.
     * The distance from 's' to itself is initialized to 0.
     */
    var r = Array( k ) .fill( 9e99 ) ;
    r[s] = 0 ;

    /*
     * 'f' is a boolean array (0 or 1) indicating whether a node has been "finalized"
     * (i.e., its shortest path from 's' has been determined).
     */
    var f = Array( k ) .fill( 0 ) ;

    // Create a new instance of the custom PriorityQueue.
    var pq = new PriorityQueue( ) ;

    // Push the starting node 's' with its distance (0) into the priority queue.
    // The priority queue stores pairs [node, distance].
    pq.push( [ s , 0 ] ) ;

    // Main loop of Dijkstra's algorithm: continues as long as there are nodes in the priority queue.
    while ( pq.size( ) )
    {
        // Extract the node with the smallest distance from the priority queue.
        // 'x' will be the node ID. The custom pop returns only the node ID.
        var x = pq.pop( ) ;

        // If this node has already been finalized, skip it.
        if ( f[x] ) continue ;

        // Mark the current node 'x' as finalized.
        f[x] = 1 ;

        // Iterate over all neighbors 'i' of node 'x'.
        for ( i in t[x] )
        {
            // Check if a shorter path to neighbor 'i' can be found through 'x'.
            // If the current distance to 'i' is already less than or equal to
            // the distance to 'x' plus the edge weight from 'x' to 'i', then skip.
            if ( r[i] <= r[x] + t[x][i] ) continue ;

            // A shorter path is found! Update the distance to 'i'.
            r[i] = r[x] + t[x][i] ;

            // Push the neighbor 'i' with its new shorter distance into the priority queue.
            pq.push( [ i , r[i] ] ) ;
        }
    }

    // Return the array of shortest distances from 's' to all nodes.
    return r ;
}


/*
 * Constructor for a custom PriorityQueue.
 * This implementation uses a min-heap to store elements,
 * where elements are arrays [value, priority].
 * It prioritizes elements with smaller 'priority' values.
 */
var PriorityQueue = function( ) {
  // The heap array stores the elements.
  this.heap = new Array( ) ;
  // 'pointer' keeps track of the current number of elements in the heap.
  this.pointer = 0 ;
};


/*
 * Prototype methods for the PriorityQueue.
 * These methods define the behavior of the priority queue.
 */
PriorityQueue.prototype = {

  /*
   * Adds an element 'x' to the priority queue.
   * 'x' is expected to be an array [value, priority].
   * The new element is inserted at the end and then "heapified up"
   * to maintain the min-heap property.
   */
  push : function( x ) {
    // 'i' is the index where the new element is initially placed (at the end).
    var i = this.pointer++ ;

    // While 'i' is not the root and the new element 'x' has a higher priority
    // (smaller value) than its parent, swap with the parent.
    while ( i > 0 ) {
      // Calculate the index of the parent node.
      var p = Math.floor( ( i - 1 ) / 2 ) ;
      // If the parent's priority is already less than or equal to x's priority,
      // the heap property is satisfied, so we break the loop.
      if ( this.heap[p][1] <= x[1] ) break ;
      // Move the parent down to the current position.
      this.heap[i] = this.heap[p] ;
      // Move up to the parent's position.
      i = p ;
    }
    // Place the new element 'x' at its final sorted position.
    this.heap[i] = x ;
  },

  /*
   * Removes and returns the element with the highest priority (smallest value)
   * from the priority queue (which is always the root of the min-heap).
   * The last element is moved to the root, and then "heapified down"
   * to restore the min-heap property.
   */
  pop : function( ) {
    // Store the root element (highest priority) to be returned.
    var ret = this.heap[0] ;
    // Take the last element from the heap and decrement the pointer.
    var x = this.heap[--this.pointer] ;
    // Start heapifying down from the root (index 0).
    var i = 0 ;

    // Loop until the current node 'i' has no children (or no left child).
    while ( i * 2 + 1 < this.pointer ) {
      var a = i * 2 + 1 ; // Index of the left child.
      var b = i * 2 + 2 ; // Index of the right child.

      // If the right child exists and has a higher priority (smaller value)
      // than the left child, then 'a' should point to the right child for comparison.
      if ( b < this.pointer && this.heap[b][1] < this.heap[a][1] ) a = b ;

      // If the element 'x' (which we are placing) has a priority
      // less than or equal to the higher-priority child,
      // then the heap property is satisfied, and we break.
      if ( this.heap[a][1] >= x[1] ) break ;

      // Move the child up to the current position.
      this.heap[i] = this.heap[a] ;
      // Move down to the child's position.
      i = a ;
    }
    // Place the element 'x' at its final sorted position.
    this.heap[i] = x ;
    // Remove the last element from the heap array (it was moved or is now redundant).
    this.heap.pop( ) ;
    // Return the value part of the original root element.
    return ret[0] ;
  },

  /*
   * Returns the current number of elements in the priority queue.
   */
  size : function( ) {
    return this.heap.length ;
  }
} ;

// Main execution block:
// Reads input from standard input, converts it to UTF-8, and passes it to the Main function.
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;