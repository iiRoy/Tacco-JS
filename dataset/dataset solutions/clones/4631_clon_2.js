'use strict';

// Obtain raw data from standard input
let rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Process the raw input by splitting it into lines
rawData = rawData.split('\n');

// Parse the second line into an array of integers
let numericSequence = rawData[1].split(' ').map(val => parseInt(val));

// Initialize a counter for "pauses" or trend changes
let breakCount = 1;

// Initialize a variable to track the current trend's sign (positive, negative, or neutral)
let currentTrend = 0;

// Iterate through the sequence starting from the second element
for (let idx = 1; idx < numericSequence.length; idx++) {
    // Determine the sign of the difference between the current and previous element
    let recentDirection = Math.sign(numericSequence[idx - 1] - numericSequence[idx]);

    // Check if the new direction is opposite to the established trend
    if (recentDirection * currentTrend < 0) {
        // If opposite, increment the break counter and reset the trend
        breakCount++;
        currentTrend = 0;
    } else if (currentTrend === 0) {
        // If there's no established trend, set the current trend to the new direction
        currentTrend = recentDirection;
    }
}

// Output the final count of trend breaks
console.log(breakCount);
