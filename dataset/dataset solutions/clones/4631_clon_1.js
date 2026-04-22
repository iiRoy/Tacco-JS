/*
 * This JavaScript code processes a sequence of numbers to determine
 * the number of "pauses" based on changes in trend direction.
 * It strictly adheres to "strict mode" for cleaner code.
 */
'use strict'

// Import the 'fs' (file system) module to read input from stdin.
let input = require("fs").readFileSync("/dev/stdin", "utf8"); // Read the entire input as a UTF-8 string.

// Split the raw input string into an array of lines.
input = input.split('\n')

// The sequence of numbers is expected on the second line (index 1).
// Split that line by spaces and convert each part to an integer.
let seq = input[1].split(' ').map(x => parseInt(x))

// Initialize 'pause' counter. A pause indicates a change in trend direction.
// It starts at 1 because the first trend segment always exists.
let pause = 1;

// Initialize 'diffSign' to track the current trend direction:
// 0: no established trend yet (e.g., first comparison or after a pause)
// 1: increasing trend (previous - current is negative)
// -1: decreasing trend (previous - current is positive)
let diffSign = 0;

// Iterate through the sequence starting from the second element (index 1)
// to compare each element with its predecessor.
for (let i = 1; i < seq.length; i++) {
    // Calculate the sign of the difference between the previous and current element.
    // Math.sign returns -1, 0, or 1.
    // If seq[i-1] - seq[i] > 0, nowSign is 1 (decreasing trend).
    // If seq[i-1] - seq[i] < 0, nowSign is -1 (increasing trend).
    // If seq[i-1] - seq[i] == 0, nowSign is 0 (no change).
    let nowSign = Math.sign(seq[i - 1] - seq[i]);

    // Check if the current trend direction (nowSign) is opposite to the
    // established trend direction (diffSign).
    // A product less than 0 means one is positive and the other is negative.
    // We also consider 0 for nowSign. A 0 indicates no change, which doesn't
    // break an existing trend, so we only trigger a pause if nowSign is non-zero
    // and opposite to diffSign.
    if (nowSign * diffSign < 0) {
        // If the trend changes direction, increment the 'pause' counter.
        pause++;
        // Reset diffSign, as a new trend segment is starting.
        diffSign = 0;
    }
    // If there's no established trend yet (diffSign is 0)
    // and the current difference indicates a trend (nowSign is not 0).
    else if (diffSign === 0) {
        // Establish the new trend direction.
        diffSign = nowSign;
    }
    // If nowSign is 0, or if nowSign is the same as diffSign,
    // or if diffSign is 0 and nowSign is also 0,
    // then no action is taken, and the trend continues or remains undefined.
}

// Output the final count of pauses.
console.log(pause)

/*
 * End of script.
 * This program efficiently determines the number of trend reversals
 * within a given sequence of integers.
 */