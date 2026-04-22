"use strict"; /* This directive enables strict mode for the entire script, enforcing stricter parsing and error handling. */


/*
 *  The `xArray` function is a versatile utility designed to dynamically create multi-dimensional arrays.
 *  It initializes all elements with a specified value (`v`) and supports arbitrary dimensions
 *  based on the number of arguments provided. For instance, `xArray(0, 3, 4)` would create a 3x4
 *  array filled with zeros.
 *
 *  @param {*} v - The initial value to fill the array elements with.
 *  @param {...number} dimensions - A variable number of arguments, each representing a dimension size.
 *  @returns {Array} A newly created multi-dimensional array.
 */
function xArray( v )
{
  var a = arguments,                                                                // Capture all arguments passed to this function.
      l = a.length,                                                                   // Get the total count of arguments.
      r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})"; // The base case: string for the innermost array, filled with `v`.

  // Loop to construct the nested Array creation string for each higher dimension.
  while ( --l )
  {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")"; // Wrap the existing 'r' string in a new Array.map structure.
  }

  // Evaluate the dynamically generated JavaScript string to create the actual array.
  return eval( r );
}


/**
 *  The `unionFind` constructor initializes a Disjoint Set Union (DSU) data structure.
 *  This structure is highly efficient for managing a collection of disjoint sets
 *  and performing operations like finding the set representative and merging sets.
 *
 *  @param {number} n - The total number of elements that will be managed by this Union-Find structure.
 *                       The array will be sized `n + 1` to accommodate 0-indexed or 1-indexed elements up to `n`.
 */
function unionFind( n )
{
  this.a = Array( n + 1 ).fill( -1 ); // Initialize the internal array 'a'. Each element is -1, indicating it's a root and its set has size 1.
}


// Attach methods to the `unionFind` prototype to enable shared functionality across all instances.
unionFind.prototype = {

  /**
   *  Finds the representative (root) of the set containing element `i`.
   *  This method incorporates path compression for optimal performance,
   *  flattening the tree structure during each `root` call.
   *
   *  @param {number} i - The element for which to find the set representative.
   *  @returns {number} The root element of the set containing `i`.
   */
  root: function( i )
  {
    // If a[i] is negative, 'i' is a root (its value stores the negative size of the set).
    // Otherwise, recursively find the root of its parent and apply path compression by setting a[i] directly to the root.
    return this.a[ i ] < 0
      ? i
      : ( this.a[ i ] = this.root( this.a[ i ] ) );
  },


  /**
   *  Checks if two elements, `x` and `y`, belong to the same disjoint set.
   *
   *  @param {number} x - The first element.
   *  @param {number} y - The second element.
   *  @returns {boolean} `true` if `x` and `y` are in the same set, `false` otherwise.
   */
  same: function( x, y )
  {
    return this.root( x ) === this.root( y );
  },


  /**
   *  Unites the sets containing elements `x` and `y`.
   *  This method employs the union-by-size heuristic to maintain a balanced tree structure,
   *  attaching the smaller tree under the root of the larger tree.
   *
   *  @param {number} x - The first element whose set is to be united.
   *  @param {number} y - The second element whose set is to be united.
   *  @returns {number|undefined} Returns `1` if `x` and `y` were already in the same set (no union performed),
   *                              otherwise `undefined` (union was successful).
   */
  unite: function( x, y )
  {
    x = this.root( x ); // Find the root of element x.
    y = this.root( y ); // Find the root of element y.

    if ( x === y )
    {
      return 1; // If roots are the same, elements are already in the same set; no union needed.
    }

    // Union by size: attach the smaller tree to the root of the larger tree.
    // The negative value in this.a[root] represents the size of the set.
    if ( this.a[ y ] <= this.a[ x ] )
    {
      this.a[ y ] += this.a[ x ]; // Update the size of the new root (y).
      this.a[ x ] = y;            // Make y the parent of x.
    }
    else
    {
      this.a[ x ] += this.a[ y ]; // Update the size of the new root (x).
      this.a[ y ] = x;            // Make x the parent of y.
    }
  },


  /**
   *  Returns the current size of the set containing element `i`.
   *  The size is stored as a negative value at the root of the set.
   *
   *  @param {number} i - The element whose set size is to be determined.
   *  @returns {number} The number of elements in the set containing `i`.
   */
  size: function( i )
  {
    return -this.a[ this.root( i ) ]; // Return the absolute value of the root's entry.
  },

}; // End of `unionFind.prototype` object definition.


// Global variables to manage the simulation state and parameters.
var leng    = 0,     // Remaining length of the current path segment to traverse.
    nextV   = 0,     // The next vertex the agent is currently moving towards or is at.
    day     = 0,     // The current day in the simulation.
    takeday = -1;    // The last day for which orders have been processed and taken.

var score   = 0;     // The accumulated score based on timely deliveries.

const INF   = 1e9;   // A large constant representing infinity, used for unreachable paths or initial distances.

var V;               // Number of vertices (nodes) in the graph, typically in the range 200-400.
var E;               // Number of edges in the graph, typically 1.5 to 2 times V.

var dist;            // A 2D array storing all-pairs shortest path distances between vertices (computed by Floyd-Warshall).
var directDist;      // A 2D array storing direct edge distances between adjacent vertices.
var e;               // Adjacency list representation of the graph (e.g., `e[u]` contains neighbors of `u`).
var f;               // An array, purpose unclear from context but likely input-related.
var tmax;            // The maximum number of days the simulation will run (e.g., 10000).
var tmax2;           // `tmax` squared, pre-calculated for efficient score computations.

const has     = new Set(); // A `Set` to keep track of vertices that currently have active delivery items.
var round     = [];        // An array representing the current path (sequence of vertices) for pickups/deliveries.
var orderTime = xArray( "[]", V ); // A 2D array where `orderTime[v]` is a list of days when items for vertex `v` were picked up.

const item = []; // A buffer array to store raw input data related to items and orders.
const out  = []; // An array to store the output decision (next vertex) for each simulation day.

var cx = 0; // Current index for reading from the `item` buffer.


/**
 *  Retrieves and consumes the next numerical value from the global `item` buffer.
 *  It increments the `cx` pointer after reading.
 *
 *  @returns {number} The next numeric item from the `item` buffer.
 */
function next()
{
  return +item[ cx++ ]; // Uses the unary plus operator to convert the item (which might be a string) to a number.
}


/**
 *  Implements a specialized Kruskal's algorithm to find a Minimum Spanning Tree (MST).
 *  This MST is constructed for a subgraph comprising vertex 0 (the starting/home point)
 *  and all vertices currently present in the `set` of active delivery locations.
 *  The MST helps in determining an efficient tour for picking up/delivering items.
 *
 *  @param {Set<number>} set - A set of vertex indices representing active delivery locations.
 *  @returns {Array<Array<number>>} An array of edges, where each edge is `[u, v, weight]`,
 *                                  constituting the calculated MST.
 */
function kruskal( set )
{
  // Combine the set of active vertices with vertex 0 to form the subgraph vertices.
  var vs = Array.from( set ).concat( 0 );
  var n  = vs.length;   // The total number of vertices in this specific subgraph.
  var es = [];          // An array to collect all potential edges between these vertices.

  // Generate all possible edges between pairs of vertices in `vs`, along with their shortest path distances.
  for ( var i = 0; i < n; i++ )
  {
    for ( var j = i + 1; j < n; j++ )
    {
      es.push( [ vs[ i ], vs[ j ], dist[ vs[ i ] ][ vs[ j ] ] ] );
    }
  }

  // Sort all potential edges by their weight (distance) in ascending order.
  es.sort( ( a, b ) => a[ 2 ] - b[ 2 ] );

  var uf  = new unionFind( V ); // Initialize a Union-Find structure to detect cycles, covering all possible vertices.
  var res = [];                 // This array will store the edges that form the MST.

  // Iterate through the sorted edges, adding them to the MST if they connect two previously disjoint sets.
  for ( var i = 0; uf.size( 0 ) !== n; i++ ) // Continue until all `n` vertices are connected into one component (rooted at 0).
  {
    if ( uf.unite( es[ i ][ 0 ], es[ i ][ 1 ] ) )
    {
      continue; // If `unite` returns 1, it means the vertices were already in the same set (adding this edge would form a cycle).
    }
    res.push( [ es[ i ][ 0 ], es[ i ][ 1 ], es[ i ][ 2 ] ] ); // Add the edge to the MST.
  }

  return res; // Return the list of edges that form the MST.
}


/**
 *  Determines the next logical action for the agent: returning to home,
 *  continuing a delivery route, or starting a new path.
 *
 *  @returns {number} The next vertex the agent should move towards, or -2 if no movement is currently required.
 */
function deliver()
{
  // If there are no active items to deliver or pick up.
  if ( has.size === 0 )
  {
    if ( nextV === 0 )
    {
      return -2; // Agent is at home (vertex 0) and has nothing to do.
    }
    return minPath( 0 ); // Agent should return to home (vertex 0).
  }

  // If the agent has just arrived at the last vertex in the `round` path, remove it.
  if ( nextV === round[ round.length - 1 ] )
  {
    round.pop();
  }

  // If the `round` path is now empty, the agent should return home.
  if ( round.length === 0 )
  {
    return minPath( 0 );
  }

  // Otherwise, the agent should continue along the planned `round` path.
  return minPath( round[ round.length - 1 ] );
}


/**
 *  Calculates the immediate next step on the shortest path from the current vertex (`nextV`) to `to`.
 *  It uses pre-computed all-pairs shortest paths (`dist`) and direct edge distances (`directDist`).
 *
 *  @param {number} to - The target destination vertex.
 *  @returns {number} The next vertex in the shortest path from `nextV` to `to`, or -2 if `nextV` is already `to`.
 */
function minPath( to )
{
  if ( to === nextV )
  {
    return -2; // Already at the destination, no movement needed.
  }

  // Iterate through all direct neighbors `v` of `nextV`.
  for ( var v of e[ nextV ] )
  {
    // Check if `v` lies on the shortest path from `nextV` to `to` using the triangle inequality.
    // If `dist[nextV][to]` equals the sum of `directDist[nextV][v]` and `dist[v][to]`, then `v` is the next step.
    if ( dist[ nextV ][ to ] === directDist[ nextV ][ v ] + dist[ v ][ to ] )
    {
      leng    = dist[ nextV ][ v ] - 1; // Set `leng` to the remaining distance on this direct edge.
      return nextV = v;                 // Update `nextV` to the new vertex and return it.
    }
  }

  return -2; // This case should ideally not be reached if `to` is reachable and `nextV` is not `to`.
}


/**
 *  The main function for a single simulation step (one unit of time/move).
 *  It manages movement along edges, and triggers `take` or `give` actions at vertices.
 *
 *  @returns {number} The vertex ID where the agent is currently, or is moving towards.
 */
function solve()
{
  // If `leng` is greater than 0, it means the agent is currently traversing an edge.
  if ( leng )
  {
    leng--;      // Decrement the remaining length of the edge traversal.
    return nextV; // Agent remains visually at `nextV` while traversing the edge.
  }

  // If `leng` is 0, the agent has arrived at a vertex.
  if ( nextV === 0 )
  {
    take(); // If at vertex 0 (home), perform the "take orders" action.
  }
  else
  {
    give(); // If at any other vertex, perform the "give/deliver" action.
  }

  return deliver(); // After performing an action, determine the next destination.
}


/**
 *  Handles the process of "taking" new orders at vertex 0 (the home base).
 *  It updates the `has` set with new delivery locations and records the pickup day for items.
 */
function take()
{
  round = []; // Clear the current `round` path, as new orders will require a new path.

  // Process all new orders up to the current simulation `day`.
  while ( takeday < day )
  {
    takeday++;          // Increment `takeday` to process orders for the next day.
    var n = next();     // Read the number of new orders for this `takeday`.

    for ( var i = 0; i < n; i++ )
    {
      var id = next() - 1, // Read item ID (adjusted to be 0-indexed, though `id` is not used further here).
          d  = next() - 1; // Read destination vertex `d` (adjusted to be 0-indexed).
      has.add( d );        // Add the destination vertex `d` to the set of active delivery locations.
      orderTime[ d ].push( takeday ); // Record `takeday` as the pickup day for an item destined for `d`.
    }
  }

  // If there are no active delivery locations after processing new orders, there's nothing to plan.
  if ( has.size === 0 )
  {
    return;
  }

  // Calculate an MST for the set of active delivery locations plus vertex 0.
  var tree = kruskal( has );
  var road = xArray( "[]", V ); // Initialize an adjacency list for the MST.

  // Convert the list of MST edges into an adjacency list representation.
  for ( var i = 0; i < tree.length; i++ )
  {
    var a = tree[ i ][ 0 ], // First vertex of the edge.
        b = tree[ i ][ 1 ]; // Second vertex of the edge.
    road[ a ].push( b );    // Add `b` to `a`'s neighbors.
    road[ b ].push( a );    // Add `a` to `b`'s neighbors (undirected graph).
  }

  // Perform a Depth-First Search (DFS) on the MST to generate a traversal path for pickups/deliveries.
  dfs( 0, -1, road ); // Start DFS from vertex 0, with -1 as a dummy parent to ensure all branches are explored.
  round.reverse();     // Reverse the `round` path to get the correct order from home to destinations.
  round.pop();         // Remove the initial 0 that was added by DFS, as it's the starting point, not a destination in the path.
}


/**
 *  Performs a Depth-First Search (DFS) traversal on the given `road` (MST adjacency list).
 *  This function populates the global `round` array with the sequence of visited vertices.
 *
 *  @param {number} v - The current vertex being visited.
 *  @param {number} p - The parent vertex of `v` in the DFS tree, used to prevent immediate backtracking.
 *  @param {Array<Array<number>>} road - The adjacency list representing the MST.
 */
function dfs( v, p, road )
{
  round.push( v ); // Add the current vertex `v` to the `round` path.

  // Iterate through all neighbors `i` of the current vertex `v`.
  for ( var i of road[ v ] )
  {
    if ( i === p )
    {
      continue; // If `i` is the parent, skip it to avoid traversing back up the tree.
    }
    dfs( i, v, road ); // Recursively call DFS for the neighbor `i`, with `v` as its parent.
  }
}


/**
 *  Handles the process of "giving" (delivering) an item at the current vertex `nextV`.
 *  It updates the `has` set and calculates the score based on delivery time.
 */
function give()
{
  has.delete( nextV ); // Remove `nextV` from the `has` set, as items for it are now delivered.

  // Process all items that were destined for `nextV`.
  while ( orderTime[ nextV ].length )
  {
    var t = day - orderTime[ nextV ].pop(); // Calculate the time taken for this delivery (`day` - pickup `takeday`).
    score += tmax2 - t * t;                 // Update the global score based on the delivery time penalty (`tmax^2 - t^2`).
  }
}


// Initialize the `readline` interface to handle input from stdin and output to stdout.
const rl = require( "readline" ).createInterface( process.stdin, process.stdout );


/*
 *  The `g` generator function orchestrates the entire simulation.
 *  It asynchronously reads input, initializes game parameters, performs daily simulation steps,
 *  and outputs results. It uses `yield gets()` to pause execution and wait for input.
 */
const g = ( function* ()
{
  // `gets` is a helper function that returns a Promise-like object which resolves with the next line of input.
  const gets = () => rl.once( "line", ( s ) => g.next( s ) );

  var yi = yield gets(); // Read the first line of input, which contains V (vertices) and E (edges).
  yi     = yi.split( " " );
  E      = +yi[ 1 ];     // Parse the number of edges.
  V      = +yi[ 0 ];     // Parse the number of vertices.

  // Initialize the `dist`, `directDist` (distance matrices), and `e` (adjacency list) arrays.
  dist        = xArray( INF, V, V );
  directDist  = xArray( INF, V, V );
  e           = xArray( "[]", V );

  // Initialize the distance from a vertex to itself as 0.
  for ( var i = 0; i < V; i++ )
  {
    dist[ i ][ i ] = 0;
  }

  // Read and process all edge data for the graph.
  for ( var i = 0; i < E; i++ )
  {
    var t  = ( yield gets() ).split( " " ); // Read a line containing edge details: v1, v2, distance.
    var v1 = +t[ 0 ] - 1,                   // First vertex (0-indexed).
        v2 = +t[ 1 ] - 1,                   // Second vertex (0-indexed).
        d  = +t[ 2 ];                       // Distance between v1 and v2.

    // Store distances for both directions (undirected graph).
    dist[ v1 ][ v2 ] = dist[ v2 ][ v1 ] = directDist[ v1 ][ v2 ] = directDist[ v2 ][ v1 ] = d;
    e[ v1 ].push( v2 ); // Add v2 to v1's adjacency list.
    e[ v2 ].push( v1 ); // Add v1 to v2's adjacency list.
  }

  // Apply the Floyd-Warshall algorithm to compute all-pairs shortest paths.
  // This computes the shortest `dist[i][j]` for all `i, j` pairs.
  for ( var k = 0; k < V; k++ )
  {
    for ( var i = 0; i < V; i++ )
    {
      for ( var j = 0; j < V; j++ )
      {
        // If the path from `i` to `j` through `k` is shorter than the current `dist[i][j]`, update it.
        if ( dist[ i ][ k ] + dist[ k ][ j ] < dist[ i ][ j ] )
        {
          dist[ i ][ j ] = dist[ i ][ k ] + dist[ k ][ j ];
        }
      }
    }
  }

  f = ( yield gets() ).split( " " ).map( ( a ) => +a ); // Read an array `f` (its specific use is not immediately clear from this snippet).

  tmax  = +( yield gets() ); // Read the maximum simulation time (e.g., 10000 days).
  tmax2 = tmax * tmax;       // Pre-calculate `tmax` squared for score calculation efficiency.

  orderTime = xArray( "[]", V ); // Re-initialize or ensure `orderTime` is correctly sized after `V` is known.

  // The main simulation loop: iterates for `tmax` days.
  for ( ; day < tmax; day++ )
  {
    var t = +( yield gets() ); // Read the number of new orders for the current `day`.
    item.push( t );            // Store this number in the `item` buffer.

    // Read details for each new order.
    for ( var i = 0; i < t; i++ )
    {
      var u = ( yield gets() ).split( " " ).map( ( a ) => +a ); // Read item_id and destination vertex.
      item.push( u[ 0 ], u[ 1 ] );                           // Store item_id and destination in the `item` buffer.
    }

    t = +( yield gets() ); // Read another integer, possibly related to events or queries.
    // Consume 't' lines of input, potentially containing additional data or debug information.
    for ( var i = 0; i < t; i++ )
    {
      var u = yield gets();
    }

    // Execute the `solve` function to determine the agent's action for the current day.
    out[ day ] = solve() + 1;     // Store the result (add 1 for 1-based output indexing).
    console.log( out[ day ] );    // Output the agent's chosen next vertex.

    t = yield gets(); // Read feedback from the environment (e.g., "OK" for success).
    if ( t[ 0 ] !== "O" )
    {
      return; // If the feedback is not "OK", terminate the simulation.
    }

    t = +( yield gets() ); // Read yet another integer.
    // Consume 't' more lines of input.
    for ( var i = 0; i < t; i++ )
    {
      var u = yield gets();
    }
  }
} )();

g.next(); // Start the generator function to begin the simulation process.