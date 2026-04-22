/*
 * This script initializes Node.js standard input processing.
 * It's designed to read lines from the console.
 */
process.stdin.resume();

// Set the encoding for standard input to UTF-8
process.stdin.setEncoding('utf8');


// Array to store all input lines
var lines = [];

// Initialize the readline interface for input/output operations
var reader = require('readline').createInterface(
    {
        input:  process.stdin, // Use standard input
        output: process.stdout // Use standard output
    }
);

// Event listener for each line of input received
reader.on(
    'line',
    (line) => {
        // Process the incoming line of input.
        // In this case, simply add it to the 'lines' array.
        lines.push(line);
    }
);

// Event listener for when the input stream closes
reader.on(
    'close',
    () => {

        // All input has been received, now perform calculations and output results.

        // Parse N and K from the first line of input.
        // N is the first number, K is the second.
        var N = Number(lines[0].split(" ")[0]); /* N represents the size of arrays A and B */
        var K = Number(lines[0].split(" ")[1]); /* K represents the number of iterations */

        // Parse array A from the second line of input.
        var A = lines[1].split(" "); // A contains initial values

        // Initialize array B with N elements.
        var B = new Array(N); // B is a temporary array for calculations


        // Declare loop counters for various iterations.
        var i = 0; /* Outer loop counter for K iterations */
        var j = 0; /* Middle loop counter for N elements in B */
        var k = 0; /* Inner loop counter for N elements in A */
        var l = 0; /* Loop counter for copying B back to A */

        // Main processing loop, runs K times.
        for (i = 0; i < K; i++) {

            // Inner loop to calculate values for array B.
            for (j = 0; j < N; j++) {
                B[j] = 0; // Initialize current B element to 0 before calculation

                // Innermost loop to sum values based on array A.
                for (k = 0; k < N; k++) {
                    // Check condition involving A[k] and absolute difference of indices.
                    if (A[k] >= Math.abs(j - k)) {
                        B[j]++; // Increment B[j] if condition is met.
                    }
                }
            }

            // After calculating all B values for the current iteration,
            // copy them back to array A for the next iteration.
            for (l = 0; l < N; l++) {
                A[l] = B[l];
            }
        }

        // Output the first five elements of the final array A, space-separated.
        console.log(A[0] + ' ' + A[1] + ' ' + A[2] + ' ' + A[3] + ' ' + A[4]);
    }
);