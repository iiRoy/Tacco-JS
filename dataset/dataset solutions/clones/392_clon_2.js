/*
 * This script processes numerical data received from standard input.
 * It iterates through a sequence of numbers, performing a specialized calculation
 * for each non-zero entry, which involves modular arithmetic and difference analysis,
 * ultimately displaying processed results.
 */

// Acquire the complete raw input string from the file system.
let rawData = require('fs') .readFileSync('/dev/stdin', 'utf8');

// Refine the raw input: remove leading/trailing spaces, divide into lines,
// and convert each line segment into a numerical value.
const numericValues = rawData.trim().split("\n").map(Number);

// Core processing loop: continues indefinitely until a specific termination condition is met.
while (true) {
    // Extract the next problem size parameter from the beginning of the numeric array.
    var currentSize = numericValues.shift();

    // If the extracted size parameter is zero, exit the processing loop.
    if (currentSize === 0) {
        break;
    }

    // Initialize an array intended to hold boolean flags, setting all elements to false initially.
    let booleanFlags = [];
    for (let currentIdx = 0; currentIdx < currentSize; currentIdx++) {
        booleanFlags[currentIdx] = false;
    }

    // Populate the boolean flags array based on a quadratic modular congruence.
    // Specifically, set the flag to true for indices corresponding to `i*i % currentSize`.
    for (let currentIdx = 1; currentIdx < currentSize; currentIdx++) {
        booleanFlags[ (currentIdx * currentIdx) % currentSize ] = true;
    }

    // Create a new array to store only the indices where the boolean flag is true.
    const markedIndices = [];
    booleanFlags.forEach(function(flagStatus, currentIdx) {
        if (flagStatus) {
            markedIndices.push(currentIdx);
        }
    });

    // Declare an array that will store the final aggregated counts.
    let resultCounts = [];
    const halfRange = (currentSize - 1) / 2;

    // Initialize the result counts array with zeros, up to the calculated half-range.
    for (let counter = 0; counter <= halfRange; counter++) {
        resultCounts[counter] = 0;
    }

    // Iterate through all possible pairs of marked indices to calculate their differences.
    for (let outerIdx = 0; outerIdx < markedIndices.length; outerIdx++) {
        for (let innerIdx = 0; innerIdx < markedIndices.length; innerIdx++) {
            // Skip the current iteration if both indices point to the same element.
            if (outerIdx === innerIdx) {
                continue;
            }

            // Compute the difference between the two marked indices.
            let calculatedDifference = markedIndices[outerIdx] - markedIndices[innerIdx];

            // Adjust the difference to be positive within the currentSize modulus.
            if (calculatedDifference < 0) {
                calculatedDifference += currentSize;
            }

            // Further adjust the difference to fit within the half-range, if necessary.
            if (halfRange < calculatedDifference) {
                calculatedDifference -= currentSize;
            }

            // Increment the count for the specific calculated difference.
            resultCounts[calculatedDifference]++;
        }
    }

    // Remove the first element from the resultCounts array, as it's typically unused in the output.
    resultCounts.shift();

    // Iterate over the remaining counts and output each one multiplied by two.
    resultCounts.forEach(function(itemValue) {
        console.log(itemValue * 2);
    });
}