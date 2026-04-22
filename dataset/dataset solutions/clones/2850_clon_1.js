'use strict'
// This script processes input from stdin to perform a calculation.
// It uses a dynamic programming approach for the core logic.

    process.stdin.resume(); // Ensure stdin is resumed for input processing.

        process.stdin.setEncoding('utf-8'); // Set the encoding for incoming data.

let inputString = ''; // Initialize a string to accumulate all input.

    let currentLine = 0; // Initialize a counter for the current line being read.

/*
 * Event listener for 'data' event on stdin.
 * Appends incoming chunks of data to `inputString`.
 */
process.stdin.on('data',
    inputStdin => {
        inputString += inputStdin;
    }
);

/*
 * Event listener for 'end' event on stdin.
 * This signifies that all input has been received.
 */
process.stdin.on('end',
    _ => {
            // Split the accumulated input string into an array of lines.
            // The commented-out line below shows an alternative processing step.
        inputString = inputString.split('\n')
            // .map(str => str.trim()); // Option to trim whitespace from each line.

        // After processing input, call the main function to start computation.
        main();
    }
);

// Helper function to read a line from the processed input.
function readLine() {
    // Returns the current line and then increments the line counter.
    return inputString[currentLine++];
}


/**
 * Core dynamic programming function.
 * Calculates a maximum value based on N, A, and B.
 *
 * @param {number} N - The target number.
 * @param {number[]} A - An array of costs/steps.
 * @param {number[]} B - An array of corresponding values/rewards.
 * @returns {number} The maximum calculated value for N.
 */
function F(N, A, B) {
    // Initialize a DP array of size N+1 with zeros.
    let dp = Array(N + 1).fill(0);

    // Iterate from 0 up to N to populate the DP table.
    for (let n = 0; n <= N; n++) {
        let x = n; // Initialize x with the current 'n' value. This will store the max value for 'n'.

        // Iterate through the three possible choices (A[j], B[j]).
        for (let j = 0; j < 3; j++) {
            // Check if the current 'n' is greater than or equal to the cost A[j].
            if (n >= A[j]) {
                // Calculate a potential new value 'y'.
                // It's the value from a previous state (n - A[j]) plus the reward B[j].
                let y = dp[n - A[j]] + B[j];

                // If 'y' is greater than the current maximum 'x' for 'n', update 'x'.
                if (x < y) {
                    x = y;
                }
            }
        }
        // Store the maximum value found for 'n' in the DP table.
        dp[n] = x;
    }

    // Return the final calculated value for N.
    return dp[N];
}


// Main function to orchestrate the program's execution.
function main() {
        // Read the first input line and parse it as an integer for 'n'.
    const n = parseInt(readLine(), 10);

        // Read the second line, split by space, and parse elements as integers for array 'a'.
    const a = readLine().split(' ').map(_ => parseInt(_, 10));

        // Read the third line, split by space, and parse elements as integers for array 'b'.
    const b = readLine().split(' ').map(_ => parseInt(_, 10));

    // Calculate the first result using function F with (n, a, b).
    let n1 = F(n, a, b);

    // Calculate the second result using function F with (n1, b, a) - note the swapped arrays.
    let n2 = F(n1, b, a);

    // Output the final result to the console.
    console.log(n2);
}