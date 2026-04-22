/*
 * This JavaScript code implements the Dinic's algorithm for
 * finding the maximum flow in a flow network.
 * It reads graph input from standard input and prints the max flow.
 */

// Global adjacency list representation of the graph.
var G = [ ] ;
/*
 * V represents the number of vertices in the graph.
 * E represents the number of edges in the graph.
 */
var V , E ;

// Set up standard input processing.
process.stdin.resume ( ) ;
process.stdin.setEncoding ( 'utf8' ) ;

// Event listener for incoming data from standard input.
process.stdin.on
(
  'data',
  function ( input )
  {
    // Split the entire input string into individual lines.
    var lines = input.split ( '\n' ) ;


    // Iterate over each line of input, excluding the last empty line.
    for
    (
      var i = 0 ;
      i < lines.length - 1 ;
      ++i
    )
    {
      // The first line contains the number of vertices (V) and edges (E).
      if ( i == 0 )
      {
        // Parse V and E from the first line.
        var ves = lines[i].split(' ').map( Number ) ;
        V = ves[0] ;
        E = ves[1] ;

        // Initialize the adjacency list for each vertex.
        for ( var j = 0 ; j < V ; ++j )
        {
          G[j] = [ ] ; // Each vertex gets an empty array for its neighbors.
        }
      }
      else /* Subsequent lines define the edges. */
      {
        // Parse the 'from', 'to', and 'capacity' for the current edge.
        var uvc = lines[i].split ( ' ' ) .map ( Number ) ;
        // Add the edge to the graph.
        addEdge ( uvc[0] , uvc[1] , uvc[2] ) ;
      }
    }

    // After processing all input, calculate and print the maximum flow
    // from source (0) to sink (V-1).
    console.log ( maxFlow ( 0 , V - 1 ) ) ;
  }
) ;

/*
 * Function to add a directed edge to the graph.
 * It also adds a residual edge for backward flow.
 */
function addEdge ( from , to , cap )
{
  // Add forward edge from 'from' to 'to' with given capacity.
  // 'rev' stores the index of the corresponding reverse edge in the 'to' node's adjacency list.
  G[from].push ( { to : to , cap : cap , rev : G[to].length } ) ;

  // Add backward (residual) edge from 'to' to 'from' with capacity 0.
  // 'rev' stores the index of the corresponding forward edge in the 'from' node's adjacency list.
  G[to].push ( { to : from , cap : 0 , rev : G[from].length - 1 } ) ;
}

// Array to keep track of visited nodes during DFS.
var used ;

/*
 * Performs a Depth-First Search to find an augmenting path
 * from the current vertex 'v' to the target 't' with available flow 'f'.
 */
function dfs ( v , t , f )
{
  // If the target is reached, return the current flow.
  if ( v == t )
  {
    return f ;
  }

  // Mark the current vertex as visited.
  used[v] = true ;

  // Iterate over all edges connected to the current vertex.
  for ( var i = 0 ; i < G[v].length ; ++i )
  {
    var e = G[v][i] ; // Get the current edge.
    // Check if the neighbor 'e.to' has not been visited and has available capacity.
    if
    (
      !used[e.to]
      &&
      e.cap > 0
    )
    {
      // Recursively call DFS for the neighbor.
      // The flow is limited by the current path's bottleneck capacity (Math.min(f, e.cap)).
      var resF = dfs ( e.to , t , Math.min ( f , e.cap ) ) ;

      // If an augmenting path was found (resF > 0).
      if ( resF > 0 )
      {
        // Reduce capacity of the forward edge.
        e.cap -= resF ;
        // Increase capacity of the reverse edge.
        G[e.to][e.rev].cap += resF ;

        // Return the found flow.
        return resF ;
      }
    }
  }

  // No augmenting path found from this vertex.
  return 0 ;
}

/*
 * Calculates the maximum flow from a source 's' to a sink 't'
 * using Dinic's algorithm (specifically, Edmonds-Karp variant with DFS).
 */
function maxFlow ( s , t )
{
  var f = 0 ; // Initialize total flow.

  while ( true ) // Loop until no more augmenting paths can be found.
  {
    // Reset the 'used' array for each DFS traversal to find a new path.
    used = new Array ( V ) .fill ( false ) ;

    // Perform DFS to find an augmenting path and its flow.
    // Start with infinite capacity (Number.POSITIVE_INFINITY).
    var resF = dfs ( s , t , Number.POSITIVE_INFINITY ) ;

    // Add the flow found in this iteration to the total flow.
    f += resF ;

    // If no flow was found in this DFS, it means no more augmenting paths exist.
    if ( resF == 0 )
    {
      break ; // Exit the loop.
    }
  }

  return f ; // Return the total maximum flow.
}