function PriorityQueue (comp) /* Constructor for a PriorityQueue object */
{
   // Initialize the internal list to store elements.
   this.list = [];

   // Store the comparison function provided by the user.
   this.comp = comp;
}


PriorityQueue.prototype.enq = function (x) /* Enqueues an element into the priority queue, maintaining heap property */
{
   // Add the new element to the end of the list initially.
   this.list.push( x );

   // Get the index of the newly added element.
   var i = this.list.length - 1;

   // Bubble up the new element to its correct position.
   while (i > 0)
   {
      /* Calculate the parent index for the current element */
      var p = Math.floor( ( i - 1 ) / 2 );

      // If the parent is already smaller or equal (based on comparator),
      // then the heap property is satisfied, so we can stop.
      if ( this.comp( this.list[p], x ) <= 0 )
         break;

      // Swap the current element with its parent.
      this.list[i] = this.list[p];
      i = p; // Move up to the parent's position.
   }

   // After finding the correct position or if list was empty, place the element.
   if ( this.list.length > 0 )
      this.list[i] = x;
};


PriorityQueue.prototype.deq = function() { // Dequeues the smallest element from the priority queue.
  var min = this.peek(); // Store the minimum element (which is at the root).
  var root = this.list[this.list.length - 1]; // Get the last element to use as a temporary root.
  this.list.splice( this.list.length - 1, 1 ); // Remove the last element.

  var i = 0; // Start at the root for bubbling down.

  while ( i * 2 + 1 < this.list.length )
  {
    /* Calculate child indices and find the smaller child */
    var a = i * 2 + 1,
        b = i * 2 + 2,
        c = b < this.list.length && comp(this.list[b], this.list[a]) < 0 ? b : a;

    // If the smaller child is greater than or equal to the temporary root,
    // then the heap property is restored, so stop.
    if ( this.comp( this.list[c], root ) >= 0 )
      break;

    this.list[i] = this.list[c]; // Move the smaller child up.
    i = c; // Move down to the child's position.
  }

  // If the list is not empty, place the temporary root at its final position.
  if ( this.list.length > 0 )
    this.list[i] = root;

  return min; // Return the original minimum element.
};


PriorityQueue.prototype.peek = function ( ) { /* Returns the smallest element without removing it */
    return this.list.length == 0
        ? undefined  // If the list is empty, there's no element.
        : this.list[0]; // Otherwise, return the first element (root).
};


PriorityQueue.prototype.size = function()
{ // Returns the current number of elements in the queue.
  return this.list.length;
};


PriorityQueue.prototype.isEmpty = function ()
{
    // Checks if the priority queue contains any elements.
    return this.size() == 0;
};


const MAX_V = 100000; // Define a maximum number of vertices.

const INF = Number.POSITIVE_INFINITY / 4; // A large value representing infinity for distances.

var V, E, r; // V: number of vertices, E: number of edges, r: start node for Dijkstra.

var G; // Adjacency list for the graph.

var d; // Array to store shortest distances from the source.


/*
 * This function implements Dijkstra's algorithm to find the shortest
 * paths from a source node 's' to all other nodes in the graph G.
 *
 * It uses a priority queue to efficiently retrieve the next closest node.
 */
/*
function dijkstra ( s )
{
  // Create a new PriorityQueue instance with a custom comparator.
  // The comparator prioritizes by 'dist' first, then by 'v' for tie-breaking.
  var pque = new PriorityQueue(function ( a, b ) {
    if ( a.dist != b.dist )
      return a.dist - b.dist; // Compare by distance if they are different.

    return a.v - b.v; // Otherwise, compare by vertex index.
  } );

  d[s] = 0; // Initialize the distance to the source node as 0.
  pque.enq({ dist: 0, v: s }); // Enqueue the source node with its distance.

  // Process nodes from the priority queue until it's empty.
  while ( ! pque.isEmpty() )
  {
    var p = pque.deq(); // Get the node with the smallest distance.

    // If we've already found a shorter path to this node, skip it.
    if ( d[p.v] < p.dist )
      continue;

    // Iterate over all neighbors of the current node.
    for ( var i = 0; i < G[p.v].length; ++i )
    {
      var e = G[p.v][i]; // Get the edge information (to node and cost).

      // If a shorter path to the neighbor 'e.to' is found through 'p.v'.
      if ( d[e.to] > d[p.v] + e.cost )
      {
        d[e.to] = d[p.v] + e.cost; // Update the shortest distance.
        pque.enq({ dist: d[e.to], v: e.to }); // Enqueue the neighbor with its new distance.
      }
    }
  }
}
*/


(function main (input) // Self-executing anonymous function to encapsulate the main logic.
{
  /*
   * The following code block is commented out, but it represents the
   * typical input parsing and execution flow for a Dijkstra problem.
   */
  /*
  var lines = input.trim().split('\n'); // Split input into lines.
  var fst = true; // Flag to indicate the first line.

  // Loop through each line of the input.
  for ( var j = 0; j < lines.length; ++j )
  {
    var words = lines[j].split(' ').map(Number); // Parse numbers from the current line.

    if ( fst ) // If it's the first line, parse V, E, r.
    {
      V = words[0]; // Number of vertices.
      E = words[1]; // Number of edges.
      r = words[2]; // Starting node for Dijkstra.

      G = []; // Initialize adjacency list.
      for ( var i = 0; i < V; ++i )
        G[i] = []; // Each vertex gets an empty list of neighbors.

      d = ( new Array(V) ).fill(INF); // Initialize distances to infinity.
    }
    else // For subsequent lines, parse edge information.
    {
      // Add an edge to the graph: from words[0] to words[1] with cost words[2].
      G[words[0]].push({ to: words[1], cost: words[2] });
    }

    fst = false; // After processing the first line, set flag to false.
  }

  // Call the dijkstra function with the starting node.
  dijkstra( r );

  // Output the results: shortest distances to all nodes.
  // If a distance is INF, print "INF", otherwise print the distance.
  d.forEach( function (v) { console.log( v == INF ? "INF" : v ) } );
  */
})( require('fs').readFileSync('/dev/stdin', 'utf8') ); // Read input from stdin.