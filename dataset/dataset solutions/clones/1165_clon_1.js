/*
 * This is a JavaScript code snippet implementing the Dinic's algorithm (or a similar max-flow algorithm)
 * using a depth-first search (DFS) approach to find augmenting paths.
 *
 * It reads graph input from standard input:
 * - The first line contains two integers: V (number of vertices) and E (number of edges).
 * - Subsequent E lines contain three integers: u, v, c (representing an edge from u to v with capacity c).
 *
 * The output is the maximum flow from source (vertex 0) to sink (vertex V-1).
 */

// Global adjacency list representation of the graph.
// G[u] will store an array of edge objects { to: v, cap: capacity, rev: reverse_edge_index }
var G =    [];
// V: Number of vertices, E: Number of edges
var V, E;

// Set up standard input processing.
process.stdin.resume(); // Ensure the process doesn't exit immediately.
process.stdin.setEncoding( 'utf8' ); // Specify input encoding.


// Listener for 'data' events from standard input.
// This function is executed when input data is received.
process.stdin.on( 'data', function( input )
{
  // Trim whitespace from input and split into individual lines.
  var lines = input.trim().split( '\n' );

  // Loop through each line of the input.
  for ( var i = 0; i < lines.length; ++i )
  {
    // The first line contains graph dimensions (V and E).
    if ( i == 0 )
    {
      // Parse V and E from the first line.
      var ves = lines[i].split( ' ' ).map( Number );
      V = ves[0]; // Store number of vertices.
      E = ves[1]; // Store number of edges.

      // Initialize the adjacency list for each vertex.
      for ( var j = 0; j < V; ++j )
      {
        G[j] = []; // Each vertex starts with an empty list of outgoing edges.
      }
    }
    // Subsequent lines define edges.
    else
    {
      // Parse edge details (from, to, capacity).
      var uvc = lines[i].split( ' ' ).map( Number );
      // Add the edge to the graph.
      addEdge( uvc[0], uvc[1], uvc[2] );
    }
  }

  // After processing all input, calculate and print the max flow.
  // Source is 0, sink is V-1.
  console.log( maxFlow( 0, V - 1 ) );
} );

/**
 * Adds a directed edge to the graph with a given capacity.
 * For max-flow algorithms, a reverse edge with 0 capacity is also added for residual graph representation.
 * @param {number} from - The starting vertex of the edge.
 * @param {number} to - The ending vertex of the edge.
 * @param {number} cap - The capacity of the edge.
 */
function addEdge( from, to, cap )
{
  // Add forward edge from 'from' to 'to'
  G[from].push( { to: to, cap: cap, rev: G[to].length } );
  // Add backward (residual) edge from 'to' to 'from' with 0 capacity.
  // 'rev' points to the index of this edge in the 'from' vertex's list.
  G[to].push( { to: from, cap: 0, rev: G[from].length - 1 } );
}

// Array to keep track of visited nodes during DFS to prevent cycles and redundant paths.
var used;

/**
 * Performs a Depth-First Search to find an augmenting path in the residual graph.
 * This is a core component of the Ford-Fulkerson or Edmonds-Karp-like algorithms.
 * @param {number} v - The current vertex being visited.
 * @param {number} t - The target sink vertex.
 * @param {number} f - The current flow capacity found along the path so far (bottleneck capacity).
 * @returns {number} The amount of flow pushed through this path, or 0 if no path to sink found.
 */
function dfs( v, t, f )
{
  // Base case: If we reached the sink, return the current flow.
  if ( v == t )
    return f;

  // Mark the current vertex as visited for this DFS traversal.
  used[v] = true;

  // Iterate over all edges originating from the current vertex 'v'.
  for ( var i = 0; i < G[v].length; ++i )
  {
    var e = G[v][i]; // Get the current edge object.

    // Check if the destination vertex 'e.to' has not been visited
    // and if there's remaining capacity on this edge.
    if ( !used[e.to] && e.cap > 0 )
    {
      // Recursively call DFS for the next vertex.
      // The flow is limited by the minimum of current path flow 'f' and edge capacity 'e.cap'.
      var resF = dfs( e.to, t, Math.min( f, e.cap ) );

      // If a path to the sink was found and flow can be pushed through it.
      if ( resF > 0 )
      {
        // Reduce capacity of the forward edge (flow consumed).
        e.cap -= resF;
        // Increase capacity of the reverse edge (flow can be returned).
        // G[e.to][e.rev] refers to the reverse edge.
        G[e.to][e.rev].cap += resF;

        // Return the flow found for this path.
        return resF;
      }
    }
  }

  // If no augmenting path was found from this vertex 'v' to the sink 't'.
  return 0;
}

/**
 * Calculates the maximum flow from a source vertex 's' to a sink vertex 't'
 * using repeated DFS calls (Ford-Fulkerson method variant).
 * @param {number} s - The source vertex.
 * @param {number} t - The sink vertex.
 * @returns {number} The total maximum flow.
 */
function maxFlow( s, t )
{
  var f = 0; // Initialize total flow to zero.

  // Loop indefinitely until no more augmenting paths can be found.
  while ( true )
  {
    // Reset the 'used' array for each new DFS traversal.
    // All vertices are initially marked as not visited.
    used = new Array(V).fill(false);

    // Find an augmenting path using DFS from source 's' to sink 't'
    // with an initial infinite flow capacity.
    var resF = dfs( s, t, Number.POSITIVE_INFINITY );

    // Add the flow found in this DFS path to the total flow.
    f += resF;

    // If no flow was found in the current DFS (no more augmenting paths), break the loop.
    if ( resF == 0 )
      break;
  }

  // Return the accumulated maximum flow.
  return f;
}