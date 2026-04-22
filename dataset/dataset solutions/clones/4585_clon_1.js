function        main    (       input       ) {
    // This function processes graph data to find the longest path
    // or detect negative cycles using a Bellman-Ford-like algorithm.

    /*
     * Declare all necessary variables.
     * n: number of nodes
     * m: number of edges
     * tmp: temporary variable for parsing
     * a, b, c: for edge definition (start, end, weight)
     * g: adjacency list representation of the graph
     * dist: array to store maximum distances from the source node (node 0)
     * i, j, k: loop counters
     * inf: a very small negative number representing negative infinity for distances
     * t: temporary variable for target node
     * negativeLoop: boolean flag to indicate if a negative cycle is detected
     */
    var n;
    var m;
    var tmp;
    var a;
    var b;
    var c;
    var g;
    var dist;
    var i;
    var j;
    var k;
    var inf;
    var t;
    var negativeLoop;


    // Initialize 'inf' to a very small negative number.
    // This represents negative infinity, as we are looking for the longest path (maximum sum of edge weights).
    inf       =       -100000000000000;


    // Parse the first line of input to get the number of nodes (n) and edges (m).
    tmp = input[0] . split(" ");
    n   =   parseInt(tmp[0]);
    m   =   parseInt(tmp[1]);


    // Initialize the graph adjacency list and the distance array.
    // 'g' will store outgoing edges for each node.
    // 'dist' will store the maximum distance to each node from the source (node 0).
    g   =   [];
    dist    =   [];

    for      (       i       =       0;      i       <       n;      i++     )
    {
        g.push([]); // Each node gets an empty list for its outgoing edges.
        dist.push(inf); // Initialize all distances to negative infinity.
    }
    dist[0]     =       0; // The distance from the source node (node 0) to itself is 0.


    // Populate the graph with edges from the input.
    // Edges are 1-indexed in input, so convert to 0-indexed.
    // Store as [target_node, weight].
    for     (       i       =       0;      i       <       m;      i++     )
    {
        tmp     =       input[1       +       i] . split(" ");
        a       =       parseInt(tmp[0])        -       1; // Source node (0-indexed)
        b       =       parseInt(tmp[1])        -       1; // Target node (0-indexed)
        c       =       parseInt(tmp[2]); // Edge weight

        // Add the edge to the adjacency list of node 'a'.
        g[a].push([b,      c]);
    }


    /*
     * Bellman-Ford algorithm:
     * This loop performs (n-1) relaxations for all edges.
     * A path in a graph with 'n' nodes can have at most 'n-1' edges.
     * So, after 'n-1' iterations, all shortest/longest paths (without negative/positive cycles)
     * should have been found.
     * The outer 'k' loop here effectively runs 'n' times, which includes the 'n-1'
     * iterations for finding paths and one additional iteration for negative cycle detection.
     * The original code uses 'n' iterations for the outer loop for the path finding phase,
     * which is okay; effectively, the n-th iteration here will not change any distances
     * if there are no positive cycles.
     */
    for     (       k       =       0;      k       <       n;      k++     )
    {
        for     (       i       =       0;      i       <       n       -       1;      i++     )
        {
            // If the current node 'i' is unreachable (distance is still negative infinity),
            // we cannot extend any path from it, so skip.
            if      (       dist[i]     ===     inf     )
            {
                continue;
            }

            // Iterate over all outgoing edges from node 'i'.
            for     (       j       =       0;      j       <       g[i].length;        j++     )
            {
                t       =       g[i][j][0]; // Target node of the current edge.
                c       =       g[i][j][1]; // Weight of the current edge.

                // Relaxation step: If a longer path to 't' is found through 'i', update dist[t].
                if      (       dist[t]     <       dist[i]     +       c       )
                {
                    dist[t]     =       dist[i]     +       c;
                }
            }
        }
    }


    // Detect negative cycles (in this case, positive cycles because we are maximizing distances).
    // An additional 'n' iterations are performed. If any distance can still be improved
    // after the initial 'n-1' iterations, it indicates a positive cycle reachable from the source.
    negativeLoop    =       false;

    for     (       k       =       0;      k       <       n;      k++     )
    {
        for     (       i       =       0;      i       <       n;      i++     )
        {
            // Note: 't' here refers to the last 't' value from the previous loops.
            // This condition `dist[t] === inf` is potentially problematic due to 't' not
            // being re-initialized or checked for validity in this specific loop's context
            // before its use. However, as per Type I clone definition,
            // the logic must remain identical.
            if      (       dist[t]     ===     inf     )
            {
                continue;
            }

            for     (       j       =       0;      j       <       g[i].length;        j++     )
            {
                t       =       g[i][j][0]; // Current target node.
                c       =       g[i][j][1]; // Current edge weight.

                // If a distance can still be improved, it means there's a positive cycle.
                if      (       dist[t]     <       dist[i]     +       c       )
                {
                    dist[t]     =       dist[i]     +       c;

                    // If the improvement happens on the last node (n-1),
                    // it indicates a positive cycle affecting the target.
                    // This specific condition checks if the last node is part of a positive cycle
                    // or affected by one.
                    if      (       i       ===     n       -       1       )
                    {
                        negativeLoop    =       true;
                        break; // Exit inner 'j' loop.
                    }
                }
            }

            if      (       negativeLoop    )
            {
                break; // Exit 'i' loop if a positive cycle is detected.
            }
        }
    }


    // Output the result.
    if      (       negativeLoop    )
    {
        console.log("inf"); // If a positive cycle is detected, the longest path is infinite.
    }
    else
    {
        console.log(dist[n      -       1]); // Otherwise, print the maximum distance to the last node.
    }
}


// Read input from stdin, decode as UTF-8, and split by newline characters.
// Then call the main function with the processed input.
main(require("fs").readFileSync("/dev/stdin",       "utf8") . split("\n"));