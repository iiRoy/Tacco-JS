// This JavaScript code processes multiple knapsack problem instances.
// It reads input from standard input and prints the results to standard output.

// Standard input handling setup:
// We use Node.js's 'fs' module to interact with the file system,
// specifically to read from the standard input file descriptor (fd).
var fs = require('fs')
    , length = fs.fstatSync( process.stdin.fd ).size // Get the size of the input stream content in bytes.
    , buffer = new Buffer( length ) // Create a Buffer of the determined size to hold the raw input data.
    , bytesRead = fs.readSync( process.stdin.fd , buffer , 0 , length , 0 ) // Read the entire content into the buffer.
    , input = buffer.toString( 'utf8' , 0 , bytesRead ).split('\n'); // Convert the buffer to a UTF-8 string, then split it by newline characters into an array of strings.

// The main processing logic starts here.
main();


/**
 * The primary function that orchestrates the knapsack problem solving.
 * It reads problem parameters, performs dynamic programming, and outputs results.
 */
function main ( ) {

    // 'read' acts as a pointer to the current line being read from the 'input' array.
    var read = 0;
    // 'resultCase' is a counter for outputting the case number.
    var resultCase = 1;

    // This loop continues to process knapsack problems until an empty maxWeight is encountered.
    while ( true ) {

        // Read the maximum weight capacity for the current knapsack instance.
        // The unary plus operator (+) converts the string to a number.
        var maxWeight = +input[read++];

        // If 'maxWeight' is 0 or evaluates to false, it signifies the end of input data.
        if ( ! maxWeight ) {
            break; // Exit the processing loop.
        }

        // Read the number of available treasures for the current knapsack instance.
        var treasures = +input[read++];

        // Initialize a dynamic programming array.
        // 'dp[w]' will store the maximum value that can be obtained with a total weight of 'w'.
        // Int16Array is used for potentially better performance and memory usage, assuming values fit.
        var dp = new Int16Array( maxWeight + 1 );

        // Loop through each treasure item.
        // The 'i--' in the loop condition means it iterates 'treasures' times, decrementing 'i' from 'treasures-1' down to 0.
        for ( var i = treasures ; i-- ; ) {

            // Read the treasure's value and weight from the input line.
            // The line is split by a comma.
            var c = input[read++].split( "," );
            var tv = +c[0]; // 'tv' stores the treasure's value.
            var tw = +c[1]; // 'tw' stores the treasure's weight.

            // This inner loop performs the knapsack DP update.
            // It iterates backward from the 'maxWeight' down to the 'tw' (current treasure's weight).
            // Iterating backward ensures that each treasure is considered only once for the current 'dp' state.
            for ( var w = maxWeight ; w - tw >= 0 ; w++ ) {
                // The core DP recurrence relation:
                // dp[w] is updated to be the maximum of:
                // 1. The current value at dp[w] (meaning the treasure 'i' is NOT included).
                // 2. The value obtained by including treasure 'i' (dp[w - tw] + tv).
                dp[w] = max( dp[w - tw] + tv , dp[w] );
            }
        }

        // After all treasures are processed, find the optimal result (maximum cost and corresponding weight).
        var resultWeight = 1001; // Initialize with a value outside the expected range for weight.
        var resultCost = 0; // Initialize with the minimum possible cost.

        // Iterate through the 'dp' array to find the highest value and its associated weight.
        for ( var i = 0 ; i <= maxWeight ; i++ ) {
            var dpi = dp[i]; // Get the value for the current weight 'i'.
            if ( dpi > resultCost ) { // If this value is greater than the best cost found so far...
                resultCost = dpi; // Update the best cost.
                resultWeight = i; // Update the weight that yields this best cost.
            }
        }

        // Print the result for the current test case in the specified format.
        // 'resultCase++' increments the case counter after its value is used.
        console.log( "Case " + resultCase++ + ":\n" + resultCost + "\n" + resultWeight );
    } // End of the 'while (true)' loop.
} // End of the 'main' function.


/**
 * A utility function to find the maximum of two numbers.
 * This implementation uses a bitwise trick for finding the maximum,
 * which can sometimes be faster than a conditional (if/else or ternary)
 * on certain architectures, especially when avoiding branching.
 *
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The greater of the two input numbers.
 */
function max ( a , b ) {
    var t = a - b; // Calculate the difference between 'a' and 'b'.
    // If 't' is negative (a < b), then (t >> 31) will be -1 (for 32-bit signed integers).
    // If 't' is non-negative (a >= b), then (t >> 31) will be 0.
    // The expression (t & (t >> 31)) effectively becomes:
    // - If a < b: (t & -1) which is 't'. So, a - t = a - (a - b) = b.
    // - If a >= b: (t & 0) which is 0. So, a - 0 = a.
    return a - ( t & ( t >> 31 ) );
}