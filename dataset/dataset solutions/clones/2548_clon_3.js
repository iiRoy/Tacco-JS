"use strict";

// This script processes input from standard input to find unique array configurations.
// It identifies segments of a given length, sorts them, and then reconstructs the array.

// Core Node.js module for file system operations.
const fsModule = require('fs');

// Read the entire content from the standard input as a UTF-8 string.
const inputContentBuffer = fsModule.readFileSync('/dev/stdin', 'UTF-8');

// Defensive check: Ensure input content is not empty or just whitespace.
if (!inputContentBuffer || inputContentBuffer.trim().length === 0) {
    console.error("Error: No data received from standard input. Please provide valid input.");
    process.exit(1); // Terminate script with an error code.
}

// Split the raw input buffer into individual lines.
const inputLines = inputContentBuffer.split('\n');

// The first line contains two space-separated numerical parameters.
const firstInputLineParts = inputLines[0].split(' ');

// The second line contains the array elements, also space-separated.
const sourceElementStrings = inputLines[1].split(' ');

// Parse the numerical parameters, ensuring they are integers.
// `totalElementsCount` is the expected length of the source array.
const totalElementsCount = parseInt(firstInputLineParts[0], 10);
// `segmentLength` is the size of the window/segment to be sorted.
const segmentLength = parseInt(firstInputLineParts[1], 10);

// --- Robust Input Parameter Validation ---
// Check if parsing resulted in valid numbers and if `segmentLength` is logical.
if (isNaN(totalElementsCount) || isNaN(segmentLength) || segmentLength <= 0 || segmentLength > totalElementsCount) {
    console.error(`Error: Invalid numerical parameters. N=${totalElementsCount}, K=${segmentLength}. K must be positive and not exceed N.`);
    process.exit(1);
}

// A JavaScript Set is used here to efficiently store and manage unique string representations.
// This is more performant than an array with `indexOf` checks for uniqueness.
const uniqueConfigurations = new Set();

// Calculate the maximum possible starting index for a segment of `segmentLength`.
// This ensures the loop does not attempt to create segments beyond the array's bounds.
const maxStartIndex = sourceElementStrings.length - segmentLength;

// Iterate through the `sourceElementStrings` to generate all possible segment permutations.
// Replaced the less direct `Array.prototype.map` on a dummy array with a clear `for` loop.
for (let currentOffset = 0; currentOffset <= maxStartIndex; currentOffset++) {

    // 1. Extract the initial part of the array, before the current segment.
    const prefixSegment = sourceElementStrings.slice(0, currentOffset);

    // 2. Extract the segment that needs to be sorted.
    const unsortedMiddleSegment = sourceElementStrings.slice(currentOffset, currentOffset + segmentLength);

    // 3. Create a sorted version of the middle segment.
    // Use `localeCompare` for robust string sorting, as the original elements are strings.
    const middleSortedSegment = [...unsortedMiddleSegment].sort((elemA, elemB) => elemA.localeCompare(elemB));

    // 4. Extract the remaining part of the array, after the current segment.
    const suffixSegment = sourceElementStrings.slice(currentOffset + segmentLength);

    // 5. Reconstruct the full sequence by combining the three parts.
    // Using spread syntax for cleaner array concatenation.
    const combinedSequence = [...prefixSegment, ...middleSortedSegment, ...suffixSegment];

    // 6. Convert the reconstructed array into a single string to serve as a unique identifier.
    // This allows the Set to easily check for and store unique configurations.
    const sequenceIdentifier = combinedSequence.join('');

    // 7. Add the unique string identifier to the Set.
    // If the identifier already exists, the Set will simply ignore the addition.
    uniqueConfigurations.add(sequenceIdentifier);
}

// The original `count` variable has been removed as it was redundant;
// the `Set.size` property directly provides the count of unique items.

// Output the final count of all distinct configurations found.
console.log(uniqueConfigurations.size);