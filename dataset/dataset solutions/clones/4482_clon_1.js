/*
 * This JavaScript program solves a problem related to graph traversal and distance calculation.
 * It defines a main function `Main` that processes input, computes distances, and determines an outcome.
 * The core logic involves a custom shortest path algorithm, possibly a variant of Breadth-First Search (BFS)
 * or Dijkstra's algorithm, applied twice from different starting nodes.
 */
function          Main(   input  )    {

    // Step 1: Process the raw input string.
    // The input is expected to be a multi-line string.
    // We split it into an array of strings, where each element is a line from the input.
    input  =  input.split( "\n" )      ;

    // Step 2: Parse the first line to get the number of nodes in the graph.
    // The problem assumes the first line contains a single integer 'n'.
    var n   =   parseInt(   input[0]   )     ;

    // Step 3: Initialize distance array `d1` for distances from node 0.
    // All distances are initially set to 'n' (a value larger than any possible path length in a connected graph of 'n' nodes).
    d1 = new Array( n ) . fill( n )       ;
    // The distance from node 0 to itself is 0.
    d1[0] = 0        ;


    // Step 4: Initialize distance array `d2` for distances from node `n-1`.
    // Similar to `d1`, all distances are initially 'n'.
    d2 = new Array( n ) . fill( n )     ;
    // The distance from node `n-1` to itself is 0.
    d2[n - 1] = 0      ;

    /**
     * Function `f`: Computes shortest path distances from a given starting node `x`
     * to all other reachable nodes in the graph.
     * This function modifies the provided distance array `d` in place.
     *
     * @param {number} x - The index of the starting node.
     * @param {Array<number>} d - The distance array to be updated.
     * @returns {Array<number>} The updated distance array `d`.
     */
    function    f(   x ,   d   )      {

        // Initialize a queue with all node indices.
        // This queue will be used to manage nodes whose distances are still being considered or updated.
        queue = new Array( n ) ;

        // Populate the queue with all node indices from 0 to n-1.
        for ( i = 0 ; i < n ; i++ ) {
            queue[i] = i       ;
        }

        // Main loop: Continues as long as there are nodes in the queue.
        while ( queue.length != 0 ) {

            // Inner loop: Process all edges to potentially update distances from the current 'x'.
            // The input lines from index 1 to n-1 represent the edges.
            for ( i = 0 ; i < n - 1 ; i++ ) {

                // Parse the current edge: (a, b).
                // Subtract 1 to convert from 1-indexed (as often used in problem statements) to 0-indexed.
                var a = parseInt(   input[i + 1].split(" ")[0]   ) - 1   ;
                var b = parseInt(   input[i + 1].split(" ")[1]   ) - 1   ;

                // If node 'a' is the current source 'x' and a shorter path to 'b' is found via 'a'.
                if (   a == x   &&   d[b] > d[a]   ) {
                    d[b] = d[a] + 1    ; // Update distance to 'b'.
                }

                // If node 'b' is the current source 'x' and a shorter path to 'a' is found via 'b'.
                if (   b == x   &&   d[a] > d[b]   ) {
                    d[a] = d[b] + 1    ; // Update distance to 'a'.
                }
            }

            // After processing all edges relative to the current 'x', remove 'x' from the queue.
            // Its direct neighbors' distances have been propagated.
            queue.splice(   queue.indexOf(x)   ,   1   )   ;

            // Find the next node in the queue with the minimum distance.
            // This node will become the new 'x' for the next iteration of the while loop.
            var min = n      ; // Initialize minimum distance to a large value.
            for ( i = 0 ; i < queue.length ; i++ ) {
                if (   d[queue[i]] < min   ) {
                    x   =   queue[i]   ; // Update `x` to the node with the smallest distance found so far.
                    min =   d[queue[i]]   ; // Update the minimum distance value.
                }
            }
        }
        return d     ; // Return the final distance array.
    }

    // Step 5: Calculate distances from node 0 using the `f` function.
    d1 = f(   0   ,   d1   )    ;

    // Step 6: Calculate distances from node `n-1` using the `f` function.
    d2 = f(   n - 1   ,   d2   )    ;

    // Step 7: Initialize a counter `x` to count nodes closer to node 0.
    var x = 0    ;

    // Step 8: Iterate through all nodes (excluding node 0 and node n-1)
    // to compare their distances to the two source nodes.
    for ( i = 0 ; i < n ; i++ ) {
        // Only consider intermediate nodes.
        if (   i != 0   &&   i != n - 1   ) {
            // If the distance from node 0 to node 'i' is less than or equal to
            // the distance from node n-1 to node 'i', increment the counter.
            if (   d1[i] <= d2[i]   ) {
                x++    ;
            }
        }
    }

    // Step 9: Determine the winner based on the calculated `x` value.
    var ans = "Fennec"   ; // Default winner.

    // If the count of nodes closer to node 0 (`x`) is less than or equal to
    // the count of nodes closer to node n-1 (`n-2-x`), then Snuke wins.
    if (   x <= n - 2 - x   ) {
        ans = "Snuke"    ;
    }

    // Step 10: Output the final answer.
    console.log(   '%s'   ,   ans   )    ;
}

// Entry point: Read input from standard input and invoke the `Main` function.
Main(   require("fs").readFileSync(  "/dev/stdin"  ,  "utf8"  )   )    ;