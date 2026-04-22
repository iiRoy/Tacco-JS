// This script processes numerical data from standard input.
// It performs calculations based on three distinct sequences of numerical information.

// Acquire the entire content from the standard input stream.
const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Divide the received content into an array of lines, removing any leading/trailing whitespace.
let dataLines = fileContent.trim().split("\n");

// Discard the initial line of the input, as it's often a metadata line like a count.
dataLines.shift();

// Extract the first sequence of numbers from the input.
// These are parsed from a space-separated string into an array of actual numbers.
let primaryValues = dataLines.shift().split(" ").map(Number);

// Arrange the primary numerical values in ascending order.
primaryValues.sort(function (valA, valB) {
    return valA - valB;
});

// Discard yet another line from the input stream.
dataLines.shift();

// Retrieve the second sequence of numbers; these will serve as keys for queries.
let queryNumbers = dataLines.shift().split(" ").map(Number);

// Obtain the third sequence of numbers, which represent comparison thresholds.
let limitValues = dataLines.shift().split(" ").map(Number);

// Define the maximum size for our lookup table.
const lookupTableSize = 1000000;
// Initialize a sparse array (or lookup table) to store cumulative sums.
// Each entry is initially set to 'false' to signify an uncomputed or invalid state.
let cumulativeSums = new Array(lookupTableSize);
for (let counter = 0; counter < lookupTableSize; counter++) {
    cumulativeSums[counter] = false;
}

// The cumulative sum at index zero is, by definition, zero.
cumulativeSums[0] = 0;

// Initialize a variable to maintain the running total during accumulation.
let runningTotal = 0;

// Iterate through the primary values to populate the cumulative sums lookup table.
// For each `elementValue`, `cumulativeSums[elementValue]` stores the sum of all primary values up to and including `elementValue`.
primaryValues.forEach(function (elementValue) {
    runningTotal += elementValue;
    cumulativeSums[elementValue] = runningTotal;
});

// Process each query number against the pre-calculated cumulative sums.
queryNumbers.forEach(function (searchKey, queryIndex) {
    // Continuously decrement the search key until a valid cumulative sum is found.
    // This effectively finds the largest sum for a value less than or equal to the original search key.
    while (true) {
        if (cumulativeSums[searchKey] !== false) { // If a sum exists for the current key,
            break; // then we've found our target sum.
        }
        searchKey--; // Otherwise, try the next smaller key.
    }
    // Compare the corresponding threshold with the found cumulative sum.
    // Output "Yes" if the threshold is less than or equal to the sum, otherwise "No".
    console.log((limitValues[queryIndex] <= cumulativeSums[searchKey]) ? "Yes" : "No");
});