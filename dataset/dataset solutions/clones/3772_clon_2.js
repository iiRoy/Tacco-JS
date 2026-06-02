"use strict";

// Acquire the raw input data from the standard input stream,
// interpreting it as a UTF-8 encoded string.
let sourceData = require("fs").readFileSync("/dev/stdin", "utf8");

// Initialize an array to store the minimum count of operations
// required to reach each numerical value. This serves as our
// dynamic programming table.
let minCoins = [];

// Establish the base condition: zero operations are needed to achieve a value of zero.
minCoins[0] = 0;

// Iterate through each integer value from one up to one hundred thousand,
// progressively populating the DP table.
for (let currentValue = 1; currentValue <= 100000; currentValue++) {
    // Initially set the minimum operations for the current value to an
    // extremely large number, signifying an uncalculated or unreachable state.
    minCoins[currentValue] = Infinity;

    // First phase: Evaluate combinations using powers of six (1, 6, 36, 216, etc.).
    let baseMultiplier = 1;
    while (baseMultiplier <= currentValue) {
        // Update the minimum operations for 'currentValue' if using a power of six
        // leads to a more efficient solution. This is calculated as
        // minCoins[currentValue - baseMultiplier] + 1.
        minCoins[currentValue] = Math.min(minCoins[currentValue], minCoins[currentValue - baseMultiplier] + 1);
        baseMultiplier *= 6; // Advance to the subsequent power of six.
    }

    // Reset the multiplier for the next evaluation phase.
    baseMultiplier = 1;
    // Second phase: Evaluate combinations using powers of nine (1, 9, 81, 729, etc.).
    while (baseMultiplier <= currentValue) {
        // Update the minimum operations for 'currentValue' if incorporating a power of nine
        // yields a more optimal result. This is computed as
        // minCoins[currentValue - baseMultiplier] + 1.
        minCoins[currentValue] = Math.min(minCoins[currentValue], minCoins[currentValue - baseMultiplier] + 1);
        baseMultiplier *= 9; // Progress to the next power of nine.
    }
}

// Convert the input string into an integer and then display the
// corresponding minimum number of operations from the calculated table.
console.log(minCoins[parseInt(sourceData)]);
