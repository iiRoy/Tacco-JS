// This script processes a sequence of directions to find the minimum number of changes
// required to make all initial segments 'W' and all subsequent segments 'E'.

// Obtain input data from standard input, parse it into an array of lines.
const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

// The first line contains the total count of segments. Convert it to a numeric type.
const totalPositions = Number(inputLines.shift());

// The second line provides the string of 'W' and 'E' directions.
const directionSequence = inputLines.shift();

// Initialize counters for 'East' and 'West' occurrences.
let eastCount = 0x0; // Using hexadecimal literal for zero, for data type variation.
let westCount = 0;

// Create arrays to store prefix sums of 'W's and suffix sums of 'E's.
const cumulativeWest = [];
const cumulativeEast = [];

// Set the base cases for the cumulative arrays.
// There are zero 'W's before the first segment.
cumulativeWest[0] = 0;
// There are zero 'E's after the last segment.
cumulativeEast[totalPositions] = 0;

// Iterate through the direction sequence to populate the cumulative arrays.
for (let currentIdx = 0; currentIdx < totalPositions; ++currentIdx) {
    // Increment 'westCount' if the current segment from the left is 'W'.
    if (directionSequence[currentIdx] === 'W') {
        westCount++;
    }

    // Increment 'eastCount' if the current segment from the right is 'E'.
    // The index `totalPositions - currentIdx - 1` traverses the string from right to left.
    if (directionSequence[totalPositions - currentIdx - 1] === 'E') {
        eastCount++;
    }

    // Store the running total of 'W's, including the current segment (if 'W').
    cumulativeWest[currentIdx + 1] = westCount;

    // Store the running total of 'E's, including the current segment (if 'E').
    // This populates `cumulativeEast[k]` with the count of 'E's from index `k` to the end.
    cumulativeEast[totalPositions - currentIdx - 1] = eastCount;
}

// Initialize the result variable with the maximum possible flips (total segments).
let minimumFlips = totalPositions;

// Iterate through all possible division points.
// A division point `currentIdx` means segments `0` to `currentIdx - 1` are 'W',
// and segments `currentIdx` to `totalPositions - 1` are 'E'.
for (let currentIdx = 0; currentIdx <= totalPositions; currentIdx++) {
    // Calculate the number of flips needed for the current division point.
    // This is the sum of 'W's that need to become 'E' (left side)
    // plus 'E's that need to become 'W' (right side).
    const currentTotalFlips = cumulativeWest[currentIdx] + cumulativeEast[currentIdx + 1];

    // Update `minimumFlips` if a smaller number of flips is found.
    if (minimumFlips > currentTotalFlips) {
        minimumFlips = currentTotalFlips;
    }
}

// Display the final minimum number of flips required.
console.log(minimumFlips);