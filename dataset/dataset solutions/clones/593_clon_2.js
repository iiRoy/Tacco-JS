let sourceData = require('node:fs').readFileSync('/dev/stdin', 'utf-8'); // Read input from standard input as UTF-8

// Process the raw input data: trim whitespace and split into individual lines
const lineFragments = sourceData.trim().split("\n");

// Initialize an index to keep track of the current line being processed
let currentLineIndex = 0;

// Parse the first line to get the two main dimensions (m and n)
const dimensions = lineFragments[currentLineIndex].split(" ").map(Number);

// Increment the line counter after reading the dimensions
currentLineIndex++;

// Extract the first dimension, often representing the number of segments or rows
const firstDimension = dimensions[0];

// Extract the second dimension, often representing the number of movements or columns
const secondDimension = dimensions[1];

// Array to store segment increment values
const segmentIncrements = [];

// Loop to populate the segmentIncrements array from input lines
for (let segmentIdx = 0; segmentIdx < firstDimension - 1; segmentIdx++) {
    segmentIncrements[segmentIdx] = parseInt(lineFragments[currentLineIndex], 10); // Parse integer from current line
    currentLineIndex++; // Move to the next line
}

// Array to store movement step values
const movementArray = [];

// Loop to populate the movementArray from input lines
for (let moveIdx = 0; moveIdx < secondDimension; moveIdx++) {
    movementArray[moveIdx] = parseInt(lineFragments[currentLineIndex], 10); // Parse integer from current line
    currentLineIndex++; // Advance the line counter
}

// Variable to accumulate the total sum, initialized to zero
let totalAccumulation = 0;

// Variable to track the current position within the segments
let currentPosition = 0;

// Iterate through each step value in the movement array
movementArray.forEach(function(stepValue) {
    // Determine the direction factor based on the step value (1 for positive, -1 for negative)
    const directionFactor = (stepValue > 0) ? 1 : -1;

    // Get the absolute value of the step to use in the loop
    let absoluteStep = Math.abs(stepValue);

    // Loop for the number of absolute steps
    while (absoluteStep--) {
        // If moving in the positive direction, add the current segment's value
        if (directionFactor === 1) {
            totalAccumulation += segmentIncrements[currentPosition];
        }

        // Update the current position based on the direction factor
        currentPosition += directionFactor;

        // If moving in the negative direction, add the new segment's value after movement
        if (directionFactor === -1) {
            totalAccumulation += segmentIncrements[currentPosition];
        }
    }

    // Apply modulo operation to keep the sum within a specific range
    totalAccumulation %= 100000;
});

// Output the final calculated total accumulation
console.log(totalAccumulation);