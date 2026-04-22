'use strict' ; // This directive enforces strict mode, leading to cleaner code and fewer silent errors.

// Defines a PriorityQueue data structure.
// It uses a binary heap internally, ordered by a custom comparison function.
function  PriorityQueue( comp ) /* Constructor function for the PriorityQueue. */
{
  this.list = [ ] ; // An array to store the heap elements.
  this.comp = comp ; // The comparison function (e.g., (a, b) => a - b for min-heap).
}

// Enqueues an element 'x' into the priority queue, maintaining the heap property.
PriorityQueue.prototype.enq = function ( x )
{
  this.list.push( x ) ; // Add the new element to the end of the array.
  var i = this.list.length - 1 ; // Get the index of the newly added element.

  // Perform 'heapify up' operation to restore heap property.
  // This loop moves the new element upwards until its parent is smaller (or equal).
  while ( i > 0 ) // Continue as long as we are not at the root of the heap.
  {
    var p = Math.floor( ( i - 1 ) / 2 ) ; // Calculate the index of the parent node.
    
    // If the parent element is already less than or equal to the new element 'x'
    // according to the comparison function, then 'x' is in its correct place.
    if ( this.comp( this.list[ p ] , x ) <= 0 )
      break ; // Exit the loop, heap property is satisfied.

    // If 'x' is smaller than its parent, swap them.
    this.list[ i ] = this.list[ p ] ; // Move the parent down to the current position.
    i = p ; // Update 'i' to the parent's position to continue moving 'x' up.
  }

  // After the loop, 'i' is the final position for 'x'.
  // This check ensures we don't try to assign to an empty list (though 'push' makes it non-empty).
  if ( this.list.length > 0 )
    this.list[ i ] = x ; // Place 'x' at its sorted position.
} ;

// Dequeues (removes and returns) the element with the highest priority (smallest, for a min-heap).
PriorityQueue.prototype.deq = function ( ) {
  var min = this.peek( ) ; // Store the highest priority element (the root) to return later.
  var root = this.list[ this.list.length - 1 ] ; // Get the last element in the heap.
  this.list.splice( this.list.length - 1 , 1 ) ; // Remove the last element from the array.

  var i = 0 ; // Start the 'heapify down' process from the root (index 0).

  // Perform 'heapify down' operation to restore heap property.
  // The last element (now 'root') is placed at the root and moved downwards.
  while ( i * 2 + 1 < this.list.length ) // Continue as long as the current node has at least a left child.
  {
    var a = i * 2 + 1 , // Index of the left child.
        b = i * 2 + 2 , // Index of the right child.
        // Determine the index 'c' of the smaller child.
        // Note: 'comp' here is a global variable reference, not 'this.comp'. This matches the original code's potential bug.
        c = b < this.list.length && comp( this.list[ b ] , this.list[ a ] ) < 0 ? b : a ;

    // If the element at 'c' (smaller child) is greater than or equal to 'root',
    // then 'root' is in its correct position.
    if ( this.comp( this.list[ c ] , root ) >= 0 )
      break ; // Exit the loop, heap property is satisfied.

    // If 'root' is larger than its smallest child, swap them.
    this.list[ i ] = this.list[ c ] ; // Move the smaller child up to the current position.
    i = c ; // Update 'i' to the child's position to continue moving 'root' down.
  }

  // After the loop, 'i' is the final position for 'root'.
  if ( this.list.length > 0 )
    this.list[ i ] = root ; // Place the 'root' element at its sorted position.

  return min ; // Return the original minimum element.
} ;

// Returns the element with the highest priority without removing it.
PriorityQueue.prototype.peek = function ( ) {
  return this.list.length == 0 ? undefined : this.list[ 0 ] ; // If empty, return undefined; otherwise, return the root element.
} ;

// Returns the number of elements currently in the priority queue.
PriorityQueue.prototype.size = function ( ) {
  return this.list.length ; // The size is simply the length of the internal array.
} ;

// Checks if the priority queue is empty.
PriorityQueue.prototype.isEmpty = function ( ) {
  return this.size( ) == 0 ; // Returns true if size is 0, false otherwise.
} ;

const MAX_V = 100000 ; // A constant representing the maximum number of vertices.
const INF = Number.POSITIVE_INFINITY / 4 ; // Represents a very large number, used as infinity for distances.
var V , E , r ; // Variables to hold the number of vertices, edges, and the starting node for Dijkstra.
var G ; // An adjacency list to represent the graph.
var d ; // An array to store the shortest distances from the source node.

// Implements Dijkstra's algorithm for finding the shortest paths from a single source vertex 's'.
function dijkstra( s )
{
  // Initialize a new PriorityQueue for Dijkstra's.
  // The comparison function prioritizes by 'dist' (distance), then by 'v' (vertex index) as a tie-breaker.
  var pque = new PriorityQueue( function ( a , b ) { 
    if ( a.dist != b.dist )
      return a.dist - b.dist ; // Primary sort key: distance.

    return a.v - b.v ; // Secondary sort key: vertex index.
  } ) ;
  d[ s ] = 0 ; // Set the distance to the source node 's' as 0.
  pque.enq( { dist : 0 , v : s } ) ; // Enqueue the source node with its distance.

  while ( !pque.isEmpty( ) ) // Continue as long as there are nodes in the priority queue to process.
  {
    var p = pque.deq( ) ; // Dequeue the node 'p' with the smallest distance found so far.

    // If a shorter path to this vertex 'p.v' has already been found and processed,
    // then this dequeued path is outdated, so skip it.
    if ( d[ p.v ] < p.dist )
      continue ;

    // Iterate through all neighbors (edges) of the current vertex 'p.v'.
    for ( var i = 0 ; i < G[ p.v ].length ; ++i )
    {
      var e = G[ p.v ][ i ] ; // Get the current edge 'e'.

      // Relaxation step: If a shorter path to the neighbor 'e.to' is found
      // through the current vertex 'p.v'.
      if ( d[ e.to ] > d[ p.v ] + e.cost )
      {
        d[ e.to ] = d[ p.v ] + e.cost ; // Update the shortest distance to 'e.to'.
        pque.enq( { dist : d[ e.to ] , v : e.to } ) ; // Enqueue the neighbor with its new, shorter distance.
      }
    }
  }
}

// Immediately Invoked Function Expression (IIFE) for the main program logic.
( function main( input )
{
  // The following lines were commented out in the original source.
  // They would typically parse the input to set up the graph.
  // var lines = input.trim().split('\n'); // Split the entire input string into an array of lines.
  var fst = true ; // A boolean flag, often used to differentiate the first line of input (e.g., graph size) from subsequent lines (e.g., edges).

  for ( var j = 0 ; j < lines.length ; ++j ) // Loop through each line read from the input.
  {
    // var words = lines[j].split(' ').map(Number); // Split each line by space and convert parts to numbers.

    /*
     * This block of code, originally commented out, would typically handle
     * the parsing of graph parameters (V, E, r) from the first line of input.
     * It also initializes the adjacency list 'G' and the distance array 'd'.
     */
    /* if( fst )
    {
      V = words[0]; // Number of vertices.
      E = words[1]; // Number of edges.
      r = words[2]; // Starting node for Dijkstra.

      G = []; // Initialize adjacency list.
      for( var i = 0; i < V; ++i )
        G[i] = []; // Each vertex gets an empty list of neighbors.

      d = (new Array(V)).fill(INF); // Initialize distances to infinity.
    } */
    /*
     * This 'else' block, also originally commented out, would process
     * subsequent lines to add edges to the graph.
     */
    /* else
      G[words[0]].push( { to: words[1], cost: words[2] } ); */

    fst = false ; // After processing the first line (or skipping it if commented out), set 'fst' to false.
  }

  // dijkstra( r ); // Call the dijkstra algorithm with the starting node 'r'.

  // d.forEach( function(v) { console.log( v == INF ? "INF" : v ) } ); // Iterate through distances and print them, replacing INF with "INF" string.
} )( require( 'fs' ).readFileSync( '/dev/stdin' , 'utf8' ) ) ; // This part reads the entire content of '/dev/stdin' as a UTF-8 string and passes it to the 'main' function.