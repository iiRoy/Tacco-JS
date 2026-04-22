/*
 * This section initializes the 'firstSequence' array.
 * It calculates values based on a simple recurrence relation.
 * The sequence grows quadratically.
 */
var firstSequence = [1];
for (var genIdx = 1; genIdx < 100000; genIdx++) {
    firstSequence[genIdx] = firstSequence[genIdx - 1] + genIdx + 1;
}

// Prepare another sequence, 'secondSequence', derived from 'firstSequence'.
// This loop continues until a specific threshold is exceeded.
var secondSequence = [1];
var procIdx = 1;
while (true) { // Loop indefinitely until a break condition is met.
    secondSequence[procIdx] = secondSequence[procIdx - 1] + firstSequence[procIdx];
    if (secondSequence[procIdx] > 100000) {
        break; // Exit loop if the current value exceeds the limit.
    }
    procIdx++; // Increment the processing index for the next iteration.
}

// Declare and initialize two dynamic programming arrays.
// These will store minimum costs for different scenarios.
var costMatrixA = [];
var costMatrixB = [];

// Fill both DP arrays with a large initial value (representing infinity).
// This ensures that any valid path found will be smaller.
for (var initIdx = 0; initIdx < 100000; initIdx++) {
    costMatrixA[initIdx] = Infinity;
}
for (var initIdx = 0; initIdx < 100000; initIdx++) {
    costMatrixB[initIdx] = Infinity;
}

// Set the base cases for the dynamic programming problem.
// A value of 0 at index 0 typically means no cost to achieve 0.
costMatrixA[0] = 0;
costMatrixB[0] = 0;

/*
 * This nested loop performs the core dynamic programming calculations.
 * It iterates through possible target values and available 'secondSequence' elements
 * to find minimum costs for two different conditions.
 */
for (var currVal = 0; currVal < 100000; currVal++) {
    for (var itemIdx = 0; itemIdx < secondSequence.length; itemIdx++) {
        // Condition for costMatrixA: general case.
        if (currVal - secondSequence[itemIdx] >= 0) {
            costMatrixA[currVal] = Math.min(costMatrixA[currVal - secondSequence[itemIdx]] + 1, costMatrixA[currVal]);
        }
        // Condition for costMatrixB: only considers odd 'secondSequence' elements.
        if (secondSequence[itemIdx] % 2 === 1 && currVal - secondSequence[itemIdx] >= 0) {
            costMatrixB[currVal] = Math.min(costMatrixB[currVal - secondSequence[itemIdx]] + 1, costMatrixB[currVal]);
        }
    }
}

// --- Input and Output Handling Section ---

// Use Node.js 'fs' module to read synchronous input from standard in.
var incomingText = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace, split by newlines, and convert each part to a number.
var numericQueries = incomingText.trim().split("\n").map(Number);

// Process queries one by one until a termination value (0) is encountered.
while (true) {
    var targetValue = numericQueries.shift(); // Get the next query value.
    if (targetValue === 0) {
        break; // Terminate if the query is 0.
    }
    // Output the calculated costs from both DP matrices for the target value.
    console.log(costMatrixA[targetValue] + " " + costMatrixB[targetValue]);
}