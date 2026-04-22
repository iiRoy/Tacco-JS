/*
 * This is a JavaScript program designed to calculate the minimum cost
 * of multiplying a chain of matrices. It reads input from standard
 * input, processes it, and then prints the result to standard output.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

// Read the entire input from /dev/stdin, decode it as UTF-8, and remove leading/trailing whitespace.
var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

// Split the input string into an array of lines.
var lines = input.split('\n');

// The first line contains the number of matrices, 'n'.
// Convert it to a number using the unary plus operator.
var n = lines.shift() - 0; // Explicitly convert to number, even though shift() might return string

// Initialize an array 'r' to store the dimensions of the matrices.
// r[i] will store the number of rows for matrix i, and r[i+1] will store the number of columns.
var r = [];

/*
 * Populate the 'r' array with matrix dimensions.
 * The input format is:
 * n
 * r1_rows r1_cols
 * r2_rows r2_cols
 * ...
 * rn_rows rn_cols
 *
 * For a matrix chain A1 * A2 * ... * An, where Ai is r_i x c_i,
 * the dimensions can be represented as a sequence (r_1, c_1, c_2, ..., c_n).
 * Here, we store r[i] as the first dimension and r[i+1] as the second dimension
 * for the i-th matrix, effectively meaning r[i] x r[i+1].
 * This is a common way to represent matrix dimensions for chain multiplication.
 *
 * Example: A1 (r[1] x r[2]), A2 (r[2] x r[3]), ..., An (r[n] x r[n+1])
 */
for (var i = 1; i <= n; i++) {

    // Read the current line, split it by space to get two numbers (rows and columns).
    var arr = lines.shift().split(' ');

    // Store the first dimension (rows of current matrix)
    r[i] = +arr[0];

    // Store the second dimension (columns of current matrix, which is also rows of next matrix)
    r[i + 1] = +arr[1];
}


// Initialize a 2D array 'cost' to store the minimum multiplication costs.
// cost[i][j] will store the minimum cost to multiply matrices from i to j.
// Initialize with -1, which will be overwritten.
var cost = [[-1]]; // Placeholder for index 0, not used for matrix indices

// Dynamically create the 2D array and initialize with a large value (infinity).
// This loop sets up the dimensions of the 'cost' table.
for (var i = 1; i <= n; i++) {

    var arr = [-1]; // Placeholder for index 0 of inner array

    cost.push(arr); // Add a new row to the cost table

    // Initialize all values in the current row to positive infinity.
    // This is because we are looking for a minimum cost.
    for (var j = 1; j <= n; j++) {
        cost[i][j] = Number.POSITIVE_INFINITY;
    }
}


// Base case: The cost of multiplying a single matrix (i.e., from i to i) is 0.
// There is no multiplication needed for a single matrix.
for (var i = 1; i <= n; i++) {
    cost[i][i] = 0;
}


// This is the core dynamic programming loop for matrix chain multiplication.
// 'j' represents the chain length (number of matrices in the subproblem - 1).
// For example, j=1 means multiplying 2 matrices (Ai * A(i+1)).
for (var j = 1; j < n; j++) {

    // 'i' represents the starting matrix index of the subproblem.
    // 'n - j' ensures that 'i + j' (the ending matrix index) does not exceed 'n'.
    for (var i = 1; i <= n - j; i++) {

        // 'k' represents the split point. We are trying all possible ways
        // to split the chain (Ai ... A(i+j)) into two sub-chains:
        // (Ai ... Ak-1) and (Ak ... A(i+j)).
        // The multiplication cost is the sum of costs of these two sub-chains
        // plus the cost of multiplying the result of the two sub-chains.
        for (var k = i + 1; k <= i + j; k++) {

            // Calculate the cost for the current split point 'k'.
            // cost[i][k-1] = cost of multiplying matrices from i to k-1.
            // cost[k][i+j] = cost of multiplying matrices from k to i+j.
            // r[i] * r[k] * r[i+j+1] = cost of multiplying the two resulting matrices.
            //    (dimensions are r[i] x r[k]) and (r[k] x r[i+j+1])
            var c = cost[i][k - 1] + cost[k][i + j] + r[i] * r[k] * r[i + j + 1];

            // If the calculated cost 'c' is less than the currently stored minimum cost
            // for multiplying matrices from 'i' to 'i+j', update it.
            if (c < cost[i][i + j]) {
                cost[i][i + j] = c;
            }
        }
    }
}


// The final result is the minimum cost to multiply all matrices from 1 to 'n'.
console.log(cost[1][n]);