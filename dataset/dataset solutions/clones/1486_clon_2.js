// This script processes numerical data from standard input to compute maximum lengths within a specific range.

const dataSource = require("fs").readFileSync("/dev/stdin", "utf8");

const dataRows = dataSource.split('\n');

// Parse the first line to get the primary count and the range adjustment factor
let [ mainCount, rangeFactor ] = dataRows[0].split(' ').map(parseInt);

// Initialize an array to store maximum lengths for values up to 300,000.
// The array is pre-filled with zeros.
let maxLengths = Array(300_001).fill(0);

// Iterate through each data row, starting from the second line (index 1) up to 'mainCount'.
for ( let idx = 1; idx <= mainCount; idx++ ) {
    // Convert the current line's value to a number.
    const currentValue = Number(dataRows[idx]);

    // Determine the current maximum length for 'currentValue' plus one.
    const calculatedLength = maxLengths[currentValue] + 1;

    // Calculate the lower bound for the range based on 'currentValue' and 'rangeFactor'.
    // Ensure the lower bound does not go below zero.
    const lowerBound = Math.max(0, currentValue - rangeFactor);

    // Calculate the upper bound for the range.
    const upperBound = currentValue + rangeFactor;

    // Iterate through the determined range [lowerBound, upperBound].
    // For each element within this range, update its maximum length if 'calculatedLength' is greater.
    for ( let rangeIndex = lowerBound; rangeIndex <= upperBound; rangeIndex++ ) {
        maxLengths[rangeIndex] = Math.max(calculatedLength, maxLengths[rangeIndex]);
    }
}

// After processing all data, find and output the overall maximum value in the 'maxLengths' array.
console.log(maxLengths.reduce((accumulator, currentElement) => Math.max(accumulator, currentElement)));