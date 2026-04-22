/*
 * This JavaScript file processes input data
 * to perform some calculations, likely
 * involving 2D prefix sums or similar
 * data structure operations.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

// Declare global variables to store input and results.
// 'lines' will hold all input lines read from stdin.
var lines = [];

// N, M, Q are parameters read from the first line of input.
var N, M, Q;

/*
 * 'sum' is a 2D array (matrix) that will be used
 * to store prefix sums or similar aggregated values.
 * It's initialized later based on N.
 */
var sum;


// Require the 'readline' module for reading input line by line.
var readline = require('readline');

// Create an interface for reading input.
// This configures how the program interacts with standard input/output.
var rl = readline.createInterface(
    {
        input: process.stdin,   // Input stream is standard input.
        output: process.stdout  // Output stream is standard output.
    }
);


// Event listener for each line of input received.
// When a line is read, it's pushed into the 'lines' array.
rl.on('line', function (x)
{
    lines.push(x); /* Add the current line 'x' to our collection. */
});


// Event listener for when the input stream closes.
// This is where the main logic of the program executes
// after all input has been received.
rl.on('close', function ()
{
    // Parse N, M, Q from the first line of input (lines[0]).
    // The values are space-separated.
    N = Number(lines[0].split(" ")[0]);
    M = Number(lines[0].split(" ")[1]);
    Q = Number(lines[0].split(" ")[2]);

    // Initialize the 'sum' 2D array.
    // It's an (N+1)x(N+1) matrix, filled with zeros initially.
    sum = Array(N + 1)
        .fill(0)
        .map(i => i = Array(N + 1).fill(0));


    // Declare arrays L and R of size M.
    // These will store pairs of integers from the input.
    var L = Array(M), R = Array(M);

    // Loop through the next M lines to populate L and R.
    // These lines start from index 1 in the 'lines' array.
    for (var i = 0; i < M; i++) {
        // Split the current line by space to get two numbers.
        var t = lines[i + 1].split(" ");
        // Parse and store the numbers in L and R.
        L[i] = Number(t[0]);
        R[i] = Number(t[1]);
    }

    // Declare arrays p and q of size Q.
    // These will store query parameters.
    var p = Array(Q), q = Array(Q);

    // Loop through the subsequent Q lines to populate p and q.
    // These lines follow the M lines processed above.
    for (var i = 0; i < Q; i++) {
        // Split the query line by space.
        var t = lines[i + M + 1].split(" ");
        // Parse and store the query parameters.
        p[i] = Number(t[0]);
        q[i] = Number(t[1]);
    }

    // Call the function to build the 2D prefix sum table.
    // This function modifies the global 'sum' array.
    buildsumtable(L, R);

    // Process each query.
    // For each query (p[i], q[i]), calculate the answer
    // using the precomputed 'sum' table and print it.
    for (var i = 0; i < Q; i++)
    {
        // Calculate the answer for the current query (p[i], q[i]).
        // This is a standard 2D prefix sum query to get the sum
        // within a rectangle defined by (p[i], p[i]) to (q[i], q[i]).
        var ans = sum[q[i]][q[i]] - sum[q[i]][p[i] - 1] - sum[p[i] - 1][q[i]] + sum[p[i] - 1][p[i] - 1];

        // Output the calculated answer to the console.
        console.log(ans);
    }

}); // End of rl.on('close') event handler.


/*
 * Function to build the 2D prefix sum table based on L and R arrays.
 * This function modifies the global 'sum' array.
 */
function buildsumtable(L, R)
{
    // First pass: Increment counts for each (L[i], R[i]) pair.
    // This effectively marks points in our 2D grid.
    for (var i = 0; i < M; i++) {
        sum[L[i]][R[i]]++; // Increment the count at coordinates (L[i], R[i]).
    }

    // Second pass: Compute the actual 2D prefix sums.
    // Iterate through the 'sum' matrix starting from (1,1).
    for (var i = 1; i <= N; i++) {
        for (var j = 1; j <= N; j++) {
            // Add the value from the cell directly above.
            sum[i][j] += sum[i - 1][j];
            // Add the value from the cell directly to the left.
            sum[i][j] += sum[i][j - 1];
            // Subtract the value from the top-left diagonal cell
            // to avoid double-counting the overlap.
            sum[i][j] -= sum[i - 1][j - 1];
        }
    }
} // End of buildsumtable function.