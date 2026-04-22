/*
 * This JavaScript code processes input lines to solve a graph problem.
 * It uses the readline module for input/output operations.
 */

/* Declaration of a global array to store all input lines. */
var lines = [];

/* Importing the 'readline' module for interactive terminal input. */
var readline = require('readline');


/*
 * Creating a readline interface instance.
 * It reads from standard input (process.stdin) and writes to standard output (process.stdout).
 */
var rl = readline.createInterface({

    input: process.stdin,

    output: process.stdout,
});


/*
 * Event listener for each 'line' event.
 * When a new line of input is received, it's pushed into the 'lines' array.
 */
rl.on('line', function (x) {

    lines.push(x); /* Add the current line to our collection. */

});


/*
 * Event listener for the 'close' event.
 * This function executes once all input has been received and the input stream is closed.
 */
rl.on('close', function () {

    // The first line of input is expected to be N, the number of nodes.
    var N = Number(lines[0]);

    // Remove the first line (N) as it's already processed.
    lines.shift();


    /*
     * Process the remaining lines, each representing an edge (u, v, w).
     * Each line is split by space, and values are converted to numbers.
     */
    var uvw = lines.map(i => i.split(" ").map(i => Number(i)))

    /*
     * Initialize a 2D array 'cost' to store edge weights.
     * All initial costs are set to Infinity, representing no direct path.
     */
    var cost = Array(N).fill(Infinity).map(i => i = Array(N).fill(Infinity))


    /*
     * Loop through each edge defined in the 'uvw' array.
     * This populates the 'cost' adjacency matrix.
     */
    for (var i = 0; i < N - 1; i++) {

        // Extract u, v, w (nodes and weight) from the current edge.
        var u = uvw[i][0];
        var v = uvw[i][1];
        var w = uvw[i][2];

        // The cost from a node to itself is 0.
        cost[i][i] = 0;

        // Set the cost for the edge (u-1, v-1) and (v-1, u-1) as 'w'.
        // Nodes are 1-indexed in input, so convert to 0-indexed.
        cost[u - 1][v - 1] = w;
        cost[v - 1][u - 1] = w;

    }

    // Ensure the last node's self-cost is also 0.
    cost[N - 1][N - 1] = 0;


    /*
     * Initialize an array 'ans' to store the color (0 or 1) for each node.
     * It's filled with empty strings initially, indicating unvisited/uncolored nodes.
     */
    var ans = Array(N).fill("");

    // Start the coloring process from node 0.
    var start = 0;


    // Assign color "0" to the starting node.
    ans[start] = "0";

    /*
     * Initialize a queue 'q' for a Breadth-First Search (BFS) like traversal.
     * Each element in the queue is a pair: [node_index, node_color].
     */
    var q = [[start, ans[start]]];


    /*
     * Main loop for the graph traversal.
     * Continues as long as there are nodes in the queue to process.
     */
    while (q.length) {

        // Dequeue the last element (simulating pop from a stack, acting like DFS in this implementation if not careful, but BFS if used with shift).
        // Given `pop` is used, it's more like a DFS.
        var t = q.pop();

        // Extract the current node and its color from the dequeued element.
        var node = t[0];
        var color = t[1];


        /*
         * Iterate through all possible neighbors of the current 'node'.
         */
        for (var i = 0; i < N; i++) {

            // If the neighbor 'i' is already colored or there's no direct edge, skip it.
            if (ans[i] !== "" || cost[node][i] === Infinity) {
                continue; // Move to the next neighbor.
            }


            /*
             * If the edge weight between 'node' and 'i' is even,
             * the neighbor 'i' gets the same color as 'node'.
             */
            if (cost[node][i] % 2 === 0) {
                ans[i] = color; // Assign the same color.
                q.push([i, ans[i]]); // Add the neighbor to the queue.
            }


            /*
             * If the edge weight between 'node' and 'i' is odd,
             * the neighbor 'i' gets the opposite color of 'node'.
             */
            if (cost[node][i] % 2 === 1) {
                ans[i] = (color === "0" ? "1" : "0"); // Assign the opposite color.
                q.push([i, ans[i]]); // Add the neighbor to the queue.
            }

        }

    }

    /*
     * After the traversal, print the assigned color for each node.
     */
    for (var i = 0; i < ans.length; i++) {
        console.log(ans[i]); // Output the color of the current node.
    }
});