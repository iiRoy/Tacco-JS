// This module provides functionality to analyze numerical sequences
// to find the maximum length of a contiguous non-increasing subsequence.

/**
 * Analyzes a given array of numbers to identify segments where values are
 * non-increasing. It returns an array containing the lengths of these
 * non-increasing "runs". The length represents the number of comparisons
 * that satisfy the non-increasing condition within a segment.
 *
 * For example, if [5, 4, 3], the comparisons are 5>=4 (true), 4>=3 (true).
 * This segment would yield a length of 2.
 *
 * @param {Array<number>} numericSeries - The input array of numbers to analyze.
 * @returns {Array<number>} An array of integers, where each integer is the
 *                          length of a non-increasing segment found.
 */
const evaluateSequenceDurations = (numericSeries) => {
    // A collection to store the calculated lengths of non-increasing segments.
    const runDurations = [];
    // A dynamic counter for the length of the currently observed non-increasing run.
    let activeRunCounter = 0;

    // --- Type III: Add guard clause for empty or invalid input ---
    // If the input array is null, undefined, or empty, return a default segment length of [0].
    // This ensures Math.max doesn't fail on an empty array and matches the original's
    // effective output for such cases (which would be 0).
    if (!Array.isArray(numericSeries) || numericSeries.length === 0) {
        runDurations.push(0);
        return runDurations;
    }

    // --- Type III: Introduce helper variable for array length ---
    const totalElements = numericSeries.length;

    // --- Type II: Reformat loop structure, rename identifiers ---
    // Iterate through the array, comparing each element with its successor.
    // The loop runs up to, but not including, the last element to prevent
    // out-of-bounds access for 'nextValue'.
    for (let currentIdx = 0; currentIdx < totalElements - 1; currentIdx++) {
        // --- Type III: Introduce intermediate variables for clarity ---
        const currentElement = numericSeries[currentIdx];
        const nextElement = numericSeries[currentIdx + 1];

        // Check if the current element is greater than or equal to the next one.
        // This condition signifies the continuation of a non-increasing sequence.
        if (currentElement >= nextElement) {
            activeRunCounter++; // Increment the counter for the ongoing run.
        } else {
            // --- Type II: Consistent formatting ---
            // If the non-increasing sequence is broken (current < next),
            // record the length of the completed run and reset the counter.
            runDurations.push(activeRunCounter);
            activeRunCounter = 0; // Reset for the next potential run.
        }
    }

    // --- Type III: Explicitly handle the final segment ---
    // After the loop finishes, the 'activeRunCounter' will hold the length
    // of the last non-increasing segment (if any). This needs to be added
    // to the collection of run durations.
    runDurations.push(activeRunCounter);

    // Return the array containing all recorded segment lengths.
    return runDurations;
};

// --- Type II: Rename identifiers, reformat external code ---
// Utilize Node.js's file system module to read input.
const fileSystemModule = require('fs');

// Define standard input path.
const standardInputPath = '/dev/stdin';
// Specify UTF-8 encoding for text processing.
const textEncoding = 'utf8';

// --- Type III: Add an intermediate step for raw input processing ---
// Read the entire standard input, convert it to a string, and split it by newlines.
const rawInputLines = fileSystemModule.readFileSync(standardInputPath, textEncoding).split('\n');

// --- Type II: Rename variables, reformat mapping logic ---
// The second line of input (`rawInputLines[1]`) contains the space-separated numbers.
// Split this line by spaces and convert each part to a numerical value.
const parsedNumericSeries = rawInputLines[1].split(" ").map(entry => Number(entry));

// --- Type III: Add a helper variable for the final result ---
// Calculate the maximum length among all identified non-increasing runs.
// If the `evaluateSequenceDurations` returns an empty array (which it shouldn't
// with the guard clause, but as a safeguard), `Math.max` on an empty array
// would result in -Infinity. The guard clause ensures it always gets `[0]` minimum.
const maximumRunLength = Math.max(...evaluateSequenceDurations(parsedNumericSeries));

// --- Type II: Consistent naming and formatting ---
// Output the final maximum run length to the console.
console.log(maximumRunLength);