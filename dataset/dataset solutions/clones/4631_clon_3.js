'use strict';

/**
 * fileSystemModule: Module for interacting with the file system.
 * inputFilePath: The standard input path for reading data.
 */
const fileSystemModule = require("fs");
const inputFilePath = "/dev/stdin";

/**
 * Determines the directional trend between two consecutive numeric values.
 * @param {number} valA - The previous value in the sequence.
 * @param {number} valB - The current value in the sequence.
 * @returns {number} 1 if decreasing (valA > valB), -1 if increasing (valA < valB), 0 if flat (valA === valB).
 */
const determineDirection = (valA, valB) => {
    if (valA > valB) {
        return 1;  // Sequence is decreasing
    } else if (valA < valB) {
        return -1; // Sequence is increasing
    } else {
        return 0;  // Sequence is flat
    }
};

/**
 * Reads raw data from the standard input path.
 * The data is expected to be UTF-8 encoded.
 */
let rawDataBuffer = fileSystemModule.readFileSync(inputFilePath, "utf8");

/**
 * Processes the raw data into an array of lines.
 * Filters out any empty lines that might result from splitting.
 */
let dataLines = rawDataBuffer
    .split(/\r?\n/) // Split by newline, supporting both Unix and Windows
    .filter(line => line.trim() !== ''); // Remove empty or whitespace-only lines

// Basic validation: Ensure we have at least two lines (one for metadata, one for the sequence).
if (dataLines.length < 2) {
    // If there isn't enough data to form a sequence, consider it a single segment.
    console.log(1);
    process.exit(0); // Terminate execution early.
}

/**
 * Parses the sequence of numbers from the second line of the input data.
 * Filters out any non-numeric or empty strings before converting to numbers.
 */
const rawNumericStrings = dataLines[1]
    .split(' ')
    .filter(s => s.trim() !== ''); // Ensure only valid number strings are processed

const numericValues = rawNumericStrings.map(str => Number(str)); // Convert string parts to actual numbers

/**
 * Initializes the count of trend reversals (or "pauses").
 * A sequence, even if empty or single-element, is considered to have at least one segment.
 */
let trendReversals = 1;

/**
 * Stores the currently established trend direction of the sequence.
 * +1: Sequence is decreasing.
 * -1: Sequence is increasing.
 * 0: No clear trend established yet (e.g., at the beginning, after a reversal, or during a flat segment).
 */
let currentTrendDirection = 0;

// Edge case: If the sequence has 0 or 1 elements, there are no trend changes possible.
if (numericValues.length <= 1) {
    console.log(trendReversals); // Output the initial value, which is 1.
    process.exit(0); // Terminate execution early.
}

/**
 * Iterates through the numeric sequence to detect and count trend reversals.
 * It compares each element with its immediate successor.
 */
for (let idx = 0; idx < numericValues.length - 1; idx++) {
    // Determine the direction between the current element and the next element.
    const observedDirection = determineDirection(numericValues[idx], numericValues[idx + 1]);

    // Check for a trend reversal:
    // A reversal occurs if the observed direction is non-zero AND
    // the product of the observed direction and the current established trend is negative.
    // (e.g., current trend was +1 (decreasing), observed is -1 (increasing) => product is -1)
    if (observedDirection !== 0 && (observedDirection * currentTrendDirection < 0)) {
        trendReversals++; // Increment the count of reversals.
        currentTrendDirection = 0; // Reset the trend direction to 'unknown' after a reversal.
    }
    // If no established trend yet (currentTrendDirection is 0), attempt to establish one.
    // This happens at the beginning or after a trend reversal.
    else if (currentTrendDirection === 0) {
        currentTrendDirection = observedDirection; // Set the current trend based on the observed direction.
    }
    // If observedDirection is 0 (flat), or if it matches currentTrendDirection,
    // no action is taken, and the trend continues or remains undefined.
}

// Output the final computed number of trend reversals.
console.log(trendReversals);