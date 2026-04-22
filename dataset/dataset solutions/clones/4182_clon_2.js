/*
*   Module for handling input operations.
*   Reads all data from the standard input stream.
*/
const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

// Parse the very first line to extract essential configuration values.
let firstLineTokens = inputLines.shift().split(' ');

// The total count of data items that will follow.
let totalElements = firstLineTokens[0];

// The maximum allowed number of distinct items.
let maxUnique = firstLineTokens[1];

// The actual sequence of data items, parsed from the second line.
let dataSequence = inputLines.shift().split(' ');

// An object to efficiently track which data values have been encountered.
const uniqueTracker = {};

// A sparse array used as a frequency map: index is the value, value is its count.
const occurrenceCounts = [];

// Iterate through the entire data sequence to build frequency data.
for (let elementIndex = 0; elementIndex < totalElements; elementIndex++) {
    let currentDataValue = dataSequence[elementIndex];
    // Increment the count for the current value. Initialize to 0 if not seen before.
    occurrenceCounts[currentDataValue] = (occurrenceCounts[currentDataValue] || 0) + 1;
    // Mark this value as seen in the unique tracker.
    uniqueTracker[currentDataValue] = 1;
}

// Obtain an array containing all the distinct data values that were found.
const distinctValues = Object.keys(uniqueTracker);

// Calculate how many distinct values exceed the allowed maximum.
let toRemove = distinctValues.length - maxUnique;

// Proceed only if there are more unique items than permitted.
if (toRemove > 0) {
    // Sort the frequency counts in ascending order.
    // This operates on the numeric values stored within the sparse array.
    occurrenceCounts.sort();

    // Variable to accumulate the sum of the smallest counts.
    let sumOfSmallest = 0;

    // Iterate through the sorted frequency counts.
    for (const itemCount of occurrenceCounts) {
        sumOfSmallest += itemCount; // Add the current frequency to the running total.
        toRemove--; // Decrement the counter for items still needing removal.

        // If the required number of items have been accounted for, exit.
        if (toRemove === 0) {
            break;
        }
    }
    // Output the final accumulated sum.
    console.log(sumOfSmallest);
} else {
    // If no unique items need to be removed (i.e., within limits), output zero.
    console.log(0);
}