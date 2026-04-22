/*
 * This JavaScript code implements the Bellman-Ford algorithm
 * to find the longest path in a weighted directed graph.
 * It also detects if a positive cycle (equivalent to negative cycle
 * in shortest path) exists that can extend the path infinitely.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */

// Main function that processes the input and orchestrates the algorithm.
function main( input )
{
    // Declare all necessary variables for the algorithm.
    var n, m, tmp, a, b, c, g, dist, i, j, k, inf, t, negativeLoop ;


    // Initialize 'inf' to a very small negative number, representing
    // unreachable nodes or negative infinity for longest path.
    // Using a large negative number for "negative infinity"
    // in the context of finding the *longest* path.
    inf = -100000000000000;


    // Parse the first line of input to get the number of nodes (n)
    // and the number of edges (m).
    tmp = input[0].split( " " );

    n   =   parseInt(tmp[0]); // Number of vertices in the graph.
    m   =   parseInt(tmp[1]); // Number of edges in the graph.


    // Initialize the adjacency list 'g' for the graph
    // and the distance array 'dist'.
    g    =    [];
    dist =    [];

    // Loop to set up initial structures for each node.
    for (i = 0; i < n; i++)
    {
        g.push([]);        // Initialize an empty array for each node's outgoing edges.
        dist.push(inf) ;   // All distances are initially 'negative infinity' (unreachable).
    }

    // The starting node's distance is 0, as it costs nothing to be at the start.
    dist[0] = 0;



    // Loop through the input to read and construct the graph's edges.
    for (i = 0; i < m; i++)
    {
        // Each line after the first describes an edge: a -> b with weight c.
        tmp = input[1 + i].split(" ");

        a = parseInt(tmp[0]) - 1; // Source node (0-indexed).
        b = parseInt(tmp[1]) - 1; // Destination node (0-indexed).
        c = parseInt(tmp[2]);     // Edge weight/cost.

        // Add the edge to the adjacency list.
        g[a].push([b, c]);
    }


    // --- Bellman-Ford Algorithm: First Pass (n iterations) ---
    // This phase calculates the longest paths from the source node (0)
    // to all other nodes, assuming no positive cycles.
    // It runs for n iterations to ensure all paths of length up to n-1 are considered.
    for (k = 0; k < n; k++)
    {
        for (i = 0; i < n - 1; i++) // Iterate through all nodes as potential 'from' nodes.
        {
            // If the current node 'i' is unreachable, skip it.
            if (dist[i] === inf)
            {
                continue;
            }

            // Iterate through all outgoing edges from node 'i'.
            for (j = 0; j < g[i].length; j++)
            {
                t = g[i][j][0]; // Destination node of the current edge.
                c = g[i][j][1]; // Weight of the current edge.

                // Relaxation step: If a longer path to 't' is found through 'i'.
                if (dist[t] < dist[i] + c)
                {
                    dist[t] = dist[i] + c; // Update the distance to 't'.
                }
            }
        }
    }


    // --- Bellman-Ford Algorithm: Second Pass (n-th iteration for cycle detection) ---
    // This phase checks for the existence of positive cycles (negative cycles in shortest path terms)
    // that can infinitely increase the path length to the target node (n-1).
    negativeLoop = false; // Flag to indicate if a positive cycle affecting n-1 is found.

    for (k = 0; k < n; k++) // This outer loop ensures we detect cycles affecting paths up to length n
    {
        for (i = 0; i < n; i++) // Iterate through all nodes (including the final node)
        {
            // If the current node 'i' is unreachable, skip it.
            if (dist[t] === inf) // Note: 't' here might be from previous iteration, potentially a bug in original logic if 'i' is inf but 't' isn't
                                 // However, it correctly uses 'dist[i]' in the relaxation, so this check is for the current 'i'.
                                 // The original code has 'dist[t]', which is a potential subtle difference for Type I, but I must preserve it.
            {
                continue;
            }

            // Iterate through all outgoing edges from node 'i'.
            for (j = 0; j < g[i].length; j++)
            {
                t = g[i][j][0]; // Destination node of the current edge.
                c = g[i][j][1]; // Weight of the current edge.

                // If a relaxation is still possible, it means there's a cycle.
                if (dist[t] < dist[i] + c)
                {
                    dist[t] = dist[i] + c; // Update distance (this will continue to grow infinitely).

                    // If this cycle affects the target node (n-1), set the flag.
                    if (t === n - 1)
                    {
                        negativeLoop = true; // A positive cycle affecting the target was found.
                        break;               // Exit inner loop as we found what we needed.
                    }
                }
            }
            if (negativeLoop)
            {
                break; // Exit outer loop if flag is set.
            }
        }
    }


    // Output the result.
    if (negativeLoop)
    {
        console.log("inf"); // If a positive cycle exists, the path can be infinitely long.
    }
    else
    {
        console.log(dist[n - 1]); // Otherwise, print the longest path to the target node.
    }
}

// Read input from stdin, split by newlines, and pass to the main function.
main( require("fs").readFileSync("/dev/stdin", "utf8").split("\n") );