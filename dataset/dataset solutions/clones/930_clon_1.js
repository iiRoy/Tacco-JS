/*
 * This JavaScript code solves the classic Matrix Chain Multiplication problem
 * using dynamic programming. It calculates the minimum number of scalar
 * multiplications required to multiply a sequence of matrices.
 *
 * The input is expected to be a list of matrix dimensions, where each line
 * represents a matrix and contains two space-separated numbers:
 * the number of rows and the number of columns for that matrix.
 * The first line of the input specifies 'n', the total number of matrices.
 *
 * This version is configured for Linux environments by default.
 */


// --- Configuration Section ---

// The commented-out line below shows a configuration example for Windows,
// typically reading from a local file named 'tmp' and using Windows-style newlines.
// // config = { input: 'tmp', newline: '\r\n' }; // Windows environment setup

// The active configuration block specifies input source and newline character
// for the current execution environment, which is set up for Linux/Unix.
config = {
    input:   '/dev/stdin', // Path to the input stream (standard input on Linux).
    newline: '\n'          // Newline character used in the input file (Unix/Linux style).
};


// --- Input Reading and Parsing ---

// Use Node.js 'fs' module to read the input file synchronously.
// The data is read as 'ascii' to avoid potential encoding issues.
let rawDataBuffer = require( 'fs' )
                      .readFileSync( config.input,
                                     'ascii' );

// Remove any leading or trailing whitespace from the raw input string.
let cleanedInputString = rawDataBuffer.trim();

// Split the cleaned input string into an array of individual lines,
// using the newline character specified in the configuration.
let inputLinesArray = cleanedInputString.split( config.newline );

// 'M' will store the dimensions of the matrices.
// Each element M[i] will be an array [rows_i, cols_i].
// The map function processes each line.
M = inputLinesArray.map(

    /**
     * @param {string} line - A single line from the input file, e.g., "10 20".
     * @returns {number[]} An array containing two numbers: [rows, columns].
     */
    function ( line ) {
        // Split the line by spaces to get string representations of numbers.
        let stringDimensions = line.split( ' ' );

        // Convert each string dimension to a numerical type.
        return stringDimensions.map( Number );
    }
);


// 'n' represents the total number of matrices in the chain.
// It is typically found as the first element of the first line of input.
n = M[0][0];


// --- Dynamic Programming Initialization ---

// 'min' is a 2D object (acting like a matrix) that will store the
// minimum number of scalar multiplications needed for sub-chains.
// `min[i][j]` will hold the minimum cost to multiply matrices from `i` to `j`.
min = {};


// Initialize the 'min' table structure.
// For each matrix 'i' from 1 to 'n', create an empty object to hold its costs.
for ( let i = 1; i <= n; i++ )
{
    min[i] = {}; // Initialize the inner object for row 'i'.
}


// Base case for dynamic programming:
// The cost of multiplying a single matrix chain (from index 'i' to 'i') is 0.
// There are no multiplications needed if there's only one matrix.
for ( let i = 1; i <= n; i++ )
{
    min[i][i] = 0; // Cost for a chain of length 1 is always zero.
}


// --- Dynamic Programming Calculation ---

// This outer loop iterates through the possible lengths of the matrix chains.
// 'i' here represents the chain length minus one (e.g., if i=1, chain length is 2).
// It goes from 1 (chains of 2 matrices) up to n-1 (chain of n matrices).
for ( let i = 1; i < n; i++ )
{
    // This inner loop iterates through all possible starting positions 'j'
    // for a chain of the current length 'i + 1'.
    // 'k' represents the ending position of the current chain.
    // The chain starts at 'j' and ends at 'k', so its length is `k - j + 1`.
    for ( let j = 1, k = 1 + i; k <= n; j++, k++ )
    {
        // Initialize the minimum cost for the current chain [j, k] to a very large value.
        // This ensures that the first calculated cost will always be smaller.
        min[j][k] = Number.MAX_VALUE;

        // This innermost loop iterates through all possible split points 'l'
        // for the current matrix chain [j, k].
        // The chain is split into two sub-chains: [j, l] and [l+1, k].
        for ( let l = j; l < k; l++ )
        {
            // Calculate the cost for the current split point 'l'.
            // The cost is the sum of:
            // 1. Cost to multiply sub-chain [j, l] (stored in min[j][l]).
            // 2. Cost to multiply sub-chain [l+1, k] (stored in min[l+1][k]).
            // 3. Cost to multiply the results of these two sub-chains.
            //    This is given by (rows of matrix j) * (cols of matrix l) * (cols of matrix k).
            //    M[j][0] provides rows of matrix j.
            //    M[l][1] provides columns of matrix l.
            //    M[k][1] provides columns of matrix k.
            let currentCalculatedCost = M[j][0] * M[l][1] * M[k][1]
                                        + min[j][l]
                                        + min[l+1][k];

            // Update min[j][k] if the 'currentCalculatedCost' is less than
            // the previously found minimum cost for this chain.
            min[j][k] = Math.min(
                min[j][k],
                currentCalculatedCost
            );
        }
    }
}


// --- Output ---

// After filling the 'min' table, the final answer (minimum scalar multiplications
// for the entire chain from matrix 1 to matrix n) is stored in min[1][n].
console.log( min[1][n] );