/*
 * This is a Type I clone generated from an original JavaScript source file.
 * All identifiers, operators, and expressions are preserved exactly as in the original.
 * Only whitespace (spacing, indentation, blank lines) and comments have been modified
 * to create a visually distinct, yet functionally identical, code fragment.
 */

// Core modules for file system operations
var fs = require('fs');

// Determine the length of standard input
var length = fs.fstatSync(process.stdin.fd).size;

// Create a buffer to hold the input data
var buffer = new Buffer(length);

// Read data from standard input into the buffer
var bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0);

// Convert the buffer to a UTF-8 string and split it by newlines to get an array of input lines
var input = buffer.toString('utf8', 0, bytesRead).split('\n');


// Global variables for problem context
var max, n;

// Loop counter variable, reused across different scopes
var i;


/**
 * Creates and initializes a 2D matrix (array of arrays).
 *
 * @param {number} n    Number of rows.
 * @param {number} m    Number of columns.
 * @param {*}      init Initial value for all matrix elements.
 * @returns {Array<Array<*>>} The initialized matrix.
 */
function matrix(n, m, init)
{
    var arr = [],                 // The main array to hold rows
        i,                        // Row index
        j;                        // Column index

    // Initialize rows
    for (i = 0; i < n; i++)
    {
        arr[i] = [];              // Create an empty row array

        // Initialize columns for the current row
        for (j = 0; j < m; j++)
        {
            arr[i][j] = init;     // Assign the initial value
        }
    }

    return arr;                   // Return the fully initialized matrix
}


/**
 * Implements Dijkstra's algorithm to find the shortest paths from a source node
 * in a graph where edge weights are non-negative.
 *
 * @param {Array<Array<number>>} g The adjacency matrix representing the graph.
 * @param {number}               s The source node index.
 * @returns {Array<number>} An array where d[i] is the shortest distance from s to i.
 */
function dijkstra(g, s)
{
    var d = [],                   // Array to store shortest distances from source
        use = [],                 // Array to mark visited nodes
        i,                        // General loop counter
        n = g.length,             // Number of nodes in the graph
        v,                        // Current node with minimum distance
        u;                        // Neighbor node / loop counter for all nodes

    // Initialize distances to Infinity and all nodes as unvisited
    for (u = 0; u < n; u++)
    {
        d[u] = Infinity;
        use[u] = false;
    }

    // Distance from source to itself is 0
    d[s] = 0;

    // Main loop of Dijkstra's algorithm
    while (true)
    {
        v = -1;                   // Reset current minimum distance node

        // Find the unvisited node with the smallest distance
        for (u = 0; u < n; u++)
        {
            if (!use[u] && (v === -1 || d[v] > d[u]))
            {
                v = u;
            }
        }

        // If no unvisited node found, all reachable nodes processed
        if (v === -1)
        {
            break;
        }

        use[v] = true;            // Mark the selected node as visited

        // Update distances to neighbors of v
        for (u = 0; u < n; u++)
        {
            // Ternary operator for relaxation step: d[u] = min(d[u], d[v] + g[v][u])
            d[u] = d[u] < d[v] + g[v][u] ? d[u] : d[v] + g[v][u];
        }
    }

    return d;                     // Return the array of shortest distances
}


/**
 * Solves the specific problem logic using graph construction and Dijkstra's algorithm.
 *
 * @param {number}                 max The maximum jump length allowed.
 * @param {number}                 n   The number of intermediate points.
 * @param {Array<number>}          d   An array containing jump costs for each point.
 * @returns {boolean} True if a solution path exists, false otherwise.
 */
function solve(max, n, d)
{
    // Create an adjacency matrix for a graph with n+2 nodes (0 to n+1)
    // 0 is start, n+1 is end, 1 to n are intermediate points.
    var g = matrix(n + 2, n + 2, Infinity);

    var i, j; // Loop counters
    var pos;  // Calculated position after a jump

    // Build the graph edges
    for (i = 0; i <= n; i++)
    {
        // Iterate through possible jump lengths backwards from max
        for (var j = max; j--; )
        {
            // Calculate the target position based on current position, jump length, and jump cost
            pos = i + j + d[i + j];

            // Ensure the target position stays within bounds [0, n+1]
            pos = Math.min(Math.max(pos, 0), n + 1);

            // If the calculated position is different from the current position, add an edge
            if (pos !== i)
            {
                g[i][pos] = 1; // Edge weight is 1 (representing one jump)
            }
        }
    }

    // First check: Can we reach the end (n+1) from the start (0)?
    var reachable = dijkstra(g, 0);

    if (reachable[n + 1] === Infinity)
    {
        return false; // If end is not reachable, no solution
    }

    // Reuse d for temporary Dijkstra results, it's a local var here
    var d_temp; // Renamed to avoid conflict with function parameter 'd' in this scope. Wait, no, it's allowed.

    // Second check: For every intermediate point reachable from the start,
    // can the end (n+1) be reached from that intermediate point?
    for (i = 1; i <= n; i++)
    {
        if (reachable[i] < Infinity) // If this intermediate point is reachable from start
        {
            d_temp = dijkstra(g, i); // Calculate distances from this intermediate point

            if (d_temp[n + 1] === Infinity)
            {
                return false; // If end is not reachable from this intermediate point, no solution
            }
        }
    }

    return true; // All conditions met, a solution exists
}


// Main program loop: Process input until max is 0
while ((max = input.shift() - 0) !== 0)
{
    // Array to store jump costs for this test case
    var d = [];

    // Read the number of intermediate points
    n = input.shift() - 0;

    // Set jump costs for virtual start and end points
    d[0] = 0;
    d[n + 1] = 0;

    // Read jump costs for intermediate points (1 to n)
    for (i = 1; i <= n; i++)
    {
        d[i] = input.shift() - 0;
    }

    // Solve the problem and print 'OK' or 'NG' based on the result
    console.log(solve(max, n, d) ? 'OK' : 'NG');
}