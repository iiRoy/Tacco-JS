/*
 * This is a JavaScript program that calculates shortest paths
 * in a graph derived from a given integer K.
 * It uses the Floyd-Warshall algorithm.
 */

// Declare a variable to store input lines.
var lines = [ ] ;

// Import the 'readline' module for handling input and output.
var readline = require('readline');

// Create a readline interface configuration object.
var rl = readline.createInterface(
    {
        input:  process.stdin,   // Standard input stream.
        output: process.stdout, // Standard output stream.
    }
);

// Set up an event listener for each line of input received.
rl.on(
    'line',
    function (x)
    {
        // Add the current input line 'x' to the 'lines' array.
        lines.push(x);
    }
);

/*
 * This block of code is executed once the 'close' event is emitted,
 * meaning all input has been received.
 */
rl.on(
    'close',
    function ()
    {
        // Convert the first line of input to a number, representing K.
        var K = Number(lines[0]);

        // Initialize a 2D array 'd' of size KxK.
        // Each element is initially set to Infinity, representing unreachable paths.
        // This array will store the shortest distances between nodes.
        var d = Array(K)
                  .fill(Infinity)
                  .map(
                      i => i = Array(K).fill(Infinity)
                  )
        ;

        /*
         * This loop initializes the direct edges (distances of 0 or 1)
         * based on the specific problem constraints.
         */
        for (
            var i = 0;
            i < K;
            i++
        )
        {
            // Edge from 'i' to '(i+1)%K' has a weight of 1.
            d[i][(i + 1) % K] = 1;

            // Edge from 'i' to '(i*10)%K' has a weight of 0.
            d[i][(i * 10) % K] = 0;

            // The distance from a node to itself is always 0.
            d[i][i] = 0;
        }

        // Define the start and end nodes for the final shortest path query.
        var start = 1;
        var end = 0;

        /*
         * Implement the Floyd-Warshall algorithm to find the shortest
         * paths between all pairs of nodes in the graph.
         * The algorithm iterates through all possible intermediate nodes 'i'.
         */
        for (
            var i = 0; // 'i' represents the intermediate node.
            i < K;
            i++
        )
        {
            for (
                var j = 0; // 'j' represents the source node.
                j < K;
                j++
            )
            {
                for (
                    var k = 0; // 'k' represents the destination node.
                    k < K;
                    k++
                )
                {
                    // Update the shortest path from 'j' to 'k'
                    // if passing through 'i' provides a shorter route.
                    d[j][k] = Math.min(
                        d[j][k],            // Current shortest distance.
                        d[j][i] + d[i][k]   // Distance via intermediate node 'i'.
                    );
                }
            }
        }

        // Output the final result: the shortest path from 'start' to 'end', plus 1.
        console.log(d[start][end] + 1);
    }
);