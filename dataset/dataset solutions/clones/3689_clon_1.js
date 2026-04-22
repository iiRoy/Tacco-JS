/*
 * This is the primary entry point function for the program.
 * It reads input, processes it, performs Dijkstra's algorithm twice,
 * and then computes and prints the final result.
 */
function     Main(s)
{
    // Split the input string by newline characters into an array of lines.
    s = s.split("\n")   ;

    // Parse the first line to get problem parameters.
    // n[0] becomes the actual 'n', n[1] is 'm', n[2] is 'q', n[3] is 't'.
    var n   = s[0].split(" ") . map(a => +a) ;

    var m   = n[1] ; // Number of edges.
    var q   = n[2] - 1 ; // Starting node for the first Dijkstra run (0-indexed).
    var t   = n[3] - 1 ; // Starting node for the second Dijkstra run (0-indexed).

    n   = n[0] ; // Total number of nodes.

    // Initialize arrays to store edge information.
    // u and v store connected nodes, a and b store edge weights.
    var u = []  ,   v = []  ,   a = []  ,   b = []  ;


    // Loop through the remaining input lines to populate edge data.
    for (var i = 0 ; i < m ; i++)
    {
        // Parse each edge line.
        var z = s[i + 1].split(" ") . map(a => +a) ;

        // Store edge details, adjusting node indices to be 0-based.
        u[i] = z[0] - 1 ;
        v[i] = z[1] - 1 ;
        a[i] = z[2] ; // Weight for the first path.
        b[i] = z[3] ; // Weight for the second path.
    }


    // Perform Dijkstra's algorithm for the first set of weights (a).
    var c = dijkstra(u, v, a, q, n) ;

    // Perform Dijkstra's algorithm for the second set of weights (b).
    var d = dijkstra(u, v, b, t, n) ;


    // Initialize an array to store the final results.
    var e = []  ;

    // Initialize loop counter for processing results from right to left.
    i = n - 1 ;

    // Calculate the value for the last element (n-1).
    // 1e15 is a large number representing infinity or a base value.
    e[i] = 1e15 - c[i] - d[i] ;

    // Iterate backwards from n-2 down to 0.
    // This loop calculates the maximum value up to the current index.
    for ( ; i-- ; )
    {
        e[i] = Math.max(e[i + 1] , 1e15 - c[i] - d[i]) ;
    }

    // Print the final array 'e', with elements joined by newlines.
    console.log(e.join("\n")) ;
}
/**
 * Implements Dijkstra's algorithm to find the shortest paths
 * from a single source node to all other nodes in a graph.
 *
 * @param {Array<number>} a - Array of source nodes for edges.
 * @param {Array<number>} b - Array of destination nodes for edges.
 * @param {Array<number>} c - Array of weights for edges.
 * @param {number} s - The starting node (source) for Dijkstra's.
 * @param {number} k - The total number of nodes in the graph.
 * @returns {Array<number>} An array where r[i] is the shortest distance from 's' to node 'i'.
 */
function dijkstra(a , b , c , s , k)
{
    // Initialize an adjacency list/matrix 't' for the graph.
    // It's an array of arrays, representing connections and weights.
    var t   = Array(k).fill(0).map(a => Array()) ;


    // Populate the graph 't' with edge weights.
    // The graph is undirected, so add edges in both directions.
    for (var i = 0 ; i < a.length ; i++)
    {
        t[a[i]][b[i]]   = t[b[i]][a[i]] = c[i] ;
    }


    // Initialize 'r' array to store shortest distances from source 's'.
    // Fill with a very large number (effectively infinity).
    var r   = Array(k).fill(9e99) ;
    r[s]    = 0 ; // Distance from source to itself is 0.


    // 'm' will store the minimum distance found so far.
    // 'n' will store the index of the node with the minimum distance.
    // 'p' is a "priority queue" (though implemented as a simple array here).
    var m   = 9e999 ,   n   ,   p   = [] ;


    // Initialize 'p' with neighbors of the source 's'.
    // And update their distances if they are less than current 'r' values.
    for (i in t[s])
    {
        p.push(i) ;
        r[i]    = t[s][i] ;

        // Find the initial minimum distance and its corresponding node.
        if (m > r[i])
        {
            m   = r[i] ;
            n   = i ;
        }
    }


    // Main Dijkstra's loop: continues as long as there are unvisited nodes in 'p'.
    while (p.length)
    {
        m   = 9e999 ; // Reset minimum distance for this iteration.
        n   = -1 ;    // Reset node index.

        // Find the node with the smallest distance in 'p'.
        for (i = 0 ; i < p.length ; i++)
        {
            // Note: This 'i' here is an index into 'p', not a node ID directly.
            // The actual node ID is p[i].
            if (m > r[p[i]]) // Compare 'm' with the distance to the node at p[i].
            {
                m   = r[p[i]] ;
                n   = i ; // Store the index within 'p'.
            }
        }

        // If no valid node was found (shouldn't happen if p.length > 0)
        if (n === -1) break; // Added a safety break, though original logic assumes one is always found.


        // 'm' now holds the node ID with the smallest distance.
        // Remove 'm' from the "priority queue" 'p'.
        m   = p[n] ; // Get the actual node ID.
        p   = p.slice(0 , n).concat(p.slice(n + 1)) ; // Remove element at index 'n'.


        // Explore neighbors of the selected node 'm'.
        for (i in t[m])
        {
            // If a shorter path to neighbor 'i' is found via 'm'.
            if (r[i] <= r[m] + t[m][i])
            {
                continue ; // No improvement, skip.
            }

            // A shorter path is found. Update distance and add/re-add to 'p'.
            p.push(i) ; // Add neighbor to 'p' for re-evaluation.
            r[i]    = r[m] + t[m][i] ; // Update shortest distance.
        }
    }

    return r ; // Return the array of shortest distances.
}
// Execute the Main function with input read from standard input.
// This is a common pattern for competitive programming in Node.js.
Main(  require("fs")  .  readFileSync("/dev/stdin"  ,  "utf8"  )  )  ;