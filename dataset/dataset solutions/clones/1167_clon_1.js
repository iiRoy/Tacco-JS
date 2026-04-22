/*
 * This file implements a maximum flow algorithm using a Depth-First Search (DFS)
 * approach (often associated with Edmonds-Karp or Dinic's algorithm, though
 * this specific implementation structure is a simplified Edmonds-Karp variant).
 *
 * It processes graph input from standard input:
 * - The first line specifies V (number of vertices) and E (number of edges).
 * - Subsequent lines define edges: 'from', 'to', 'capacity'.
 *
 * The maximum flow is calculated from source vertex 0 to sink vertex V-1.
 */

// Global variable to store the adjacency list representation of the graph.
// G[u] will contain an array of edge objects { to: v, cap: capacity, rev: index_of_reverse_edge }.
var G = [];

// Global variables to store the number of vertices (V) and edges (E) in the graph.
var V, E;


// Initialize standard input processing.
process.stdin.resume();
process.stdin.setEncoding( 'utf8' ); // Set encoding to ensure correct character interpretation.

// Attach an event listener for when data is received from standard input.
process.stdin.on( 'data', function( input )
{
    // Split the received input string into an array of lines.
    var lines = input.split( '\n' );

    // Loop through each line of input, excluding the last one which is often empty.
    for ( var i = 0; i < lines.length - 1; ++i )
    {
        // The very first line defines the graph's dimensions (V and E).
        if ( i == 0 )
        {
            // Split the line by space and convert the resulting parts to numbers.
            var ves = lines[i].split( ' ' ).map( Number );

            // Assign the first value as the number of vertices.
            V = ves[0];
            // Assign the second value as the number of edges.
            E = ves[1];

            // Initialize the adjacency list for each vertex.
            // Each G[j] will be an empty array to which edges will be pushed.
            for ( var j = 0; j < V; ++j )
            {
                G[j] = [];
            }
        }
        // For all subsequent lines, these represent individual edges.
        else
        {
            // Parse the edge data: 'from', 'to', 'capacity'.
            var uvc = lines[i].split( ' ' ).map( Number );

            // Check if the line correctly provides three components for an edge.
            if ( uvc.length == 3 )
            {
                // Call the helper function to add this edge to the graph.
                addEdge( uvc[0], uvc[1], uvc[2] );
            }
        }
    }

    // After all input lines have been processed and the graph is built,
    // calculate the maximum flow from source (0) to sink (V-1) and print it.
    console.log( maxFlow( 0, V - 1 ) );
} );


/**
 * Adds a directed edge to the graph's adjacency list.
 * This function also implicitly creates a reverse edge with 0 capacity for residual graph purposes.
 *
 * @param {number} from - The starting vertex of the edge.
 * @param {number} to   - The ending vertex of the edge.
 * @param {number} cap  - The capacity of the edge.
 */
function addEdge( from, to, cap )
{
    // Push the forward edge from 'from' to 'to' with its capacity.
    // 'rev' stores the index of its corresponding reverse edge in G[to]'s list.
    G[from].push( { to: to, cap: cap, rev: G[to].length } );

    // Push the reverse edge from 'to' to 'from' with 0 capacity.
    // This represents the residual capacity for flow returning.
    // 'rev' stores the index of its corresponding forward edge in G[from]'s list.
    G[to].push( { to: from, cap: 0, rev: G[from].length - 1 } );
}


// Global array to keep track of visited nodes during a single DFS traversal.
// This prevents infinite loops in cycles and ensures each DFS finds a distinct path.
var used;


/**
 * Performs a Depth-First Search (DFS) to find an augmenting path from vertex 'v' to the sink 't'.
 * It attempts to push a flow 'f' along this path.
 *
 * @param {number} v - The current vertex in the DFS traversal.
 * @param {number} t - The target sink vertex.
 * @param {number} f - The maximum flow capacity that can be pushed along the path found so far to 'v'.
 * @returns {number} The amount of flow successfully pushed through the found path, or 0 if no path to 't' exists.
 */
function dfs( v, t, f )
{
    // Base case: If the sink 't' is reached, return the current flow 'f'.
    if ( v == t )
    {
        return f;
    }

    // Mark the current vertex 'v' as visited for this DFS pass.
    used[v] = true;

    // Iterate through all outgoing edges from the current vertex 'v'.
    for ( var i = 0; i < G[v].length; ++i )
    {
        var e = G[v][i]; // Get the current edge object.

        // Check if the destination vertex 'e.to' has not been visited in this DFS pass
        // AND if there is remaining capacity on this edge (e.cap > 0).
        if ( !used[e.to] && e.cap > 0 )
        {
            // Recursively call DFS from the next vertex 'e.to'.
            // The flow for this recursive call is limited by 'f' and the edge's capacity 'e.cap'.
            var resF = dfs( e.to, t, Math.min( f, e.cap ) );

            // If a positive flow 'resF' was found from 'e.to' to 't' (i.e., an augmenting path exists).
            if ( resF > 0 )
            {
                // Decrease the capacity of the forward edge 'e'.
                e.cap -= resF;
                // Increase the capacity of the corresponding reverse edge in the residual graph.
                // This allows for "undoing" flow if a better path is found later.
                G[e.to][e.rev].cap += resF;

                // Return the flow found, as this path is now augmented.
                return resF;
            }
        }
    }

    // If no augmenting path was found from 'v' to 't' through any of its outgoing edges.
    return 0;
}


/**
 * Calculates the maximum flow from a source vertex 's' to a sink vertex 't'
 * using repeated DFS calls to find augmenting paths.
 *
 * @param {number} s - The source vertex.
 * @param {number} t - The sink vertex.
 * @returns {number} The total maximum flow from 's' to 't'.
 */
function maxFlow( s, t )
{
    var f = 0; // Initialize the total maximum flow to 0.

    // Continue finding augmenting paths until no more can be found.
    while ( true )
    {
        // For each new DFS search for an augmenting path, reset the 'used' array.
        // All vertices are considered unvisited at the start of a new DFS pass.
        used = new Array( V ).fill( false );

        // Perform a DFS starting from the source 's' to find an augmenting path to 't'.
        // Initialize the path capacity with a very large number (positive infinity).
        var resF = dfs( s, t, Number.POSITIVE_INFINITY );

        // Add the flow found in this DFS pass to the total flow.
        f += resF;

        // If no flow was found in the current DFS pass (resF is 0),
        // it means there are no more augmenting paths from 's' to 't'.
        if ( resF == 0 )
        {
            break; // Exit the loop.
        }
    }

    // Return the accumulated maximum flow.
    return f;
}