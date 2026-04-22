/*
 * This script identifies all starting positions of a given search pattern (needle)
 * within a larger text string (haystack). It reads the haystack and needle
 * from standard input, separated by newlines, and outputs each found index
 * on a new line. If no matches are found, or if input is invalid, nothing or an
 * error message is printed to standard output/error respectively.
 */

// Utilize the Node.js file system module for reading input.
const fileSystemModule = require('fs');

// Define the standard input path as a constant for clarity and potential reusability.
const standardInputFile = '/dev/stdin';

let rawInputContent; // This variable will hold the raw string read from stdin.

// --- Input Acquisition and Initial Validation ---
try {
    // Attempt to synchronously read the entire content of standard input as UTF-8.
    rawInputContent = fileSystemModule.readFileSync(standardInputFile, 'utf8');
} catch (dataReadError) {
    // If an error occurs during file reading, log it and terminate the process.
    console.error("Failed to read input from standard input stream:", dataReadError.message);
    process.exit(1); // Exit with a non-zero code to indicate an error.
}

// Split the raw content into individual lines.
// Using a regex for split handles both Windows (\r\n) and Unix (\n) line endings.
// Filter out any empty lines that might result from trailing newlines or multiple consecutive newlines.
const processedInputLines = rawInputContent.split(/\r?\n/).filter(lineSegment => lineSegment.length > 0);

// Guard clause: Ensure there are at least two valid lines of input (haystack and needle).
if (processedInputLines.length < 2) {
    console.error("Insufficient input provided. Expected at least two non-empty lines (haystack string and search pattern).");
    process.exit(1);
}

// Extract the main strings from the processed lines.
const mainHaystackText = processedInputLines[0]; // The string to be searched within.
const searchNeedlePattern = processedInputLines[1]; // The pattern to search for.

// --- Pre-computation and Edge Case Handling ---
const haystackLength = mainHaystackText.length;
const needleLength = searchNeedlePattern.length;

// Handle the special case where the search pattern is an empty string.
// The original code implies that an empty pattern matches at every possible starting position.
if (needleLength === 0) {
    if (haystackLength === 0) {
        // If both are empty, no indices to print.
        process.exit(0);
    } else {
        // For a non-empty haystack and empty needle, print indices from 0 to haystackLength - 1.
        const allPossibleStartPoints = Array.from({ length: haystackLength }, (_, idx) => idx);
        console.log(allPossibleStartPoints.join('\n'));
        process.exit(0);
    }
}

// Guard clause: If the needle is longer than the haystack, no match is possible.
if (needleLength > haystackLength) {
    process.exit(0); // Simply exit without printing anything.
}

// An array to store the starting indices where the pattern is found.
// This is more efficient than repeatedly concatenating strings.
const discoveredMatchPositions = [];

// --- Core Pattern Matching Logic ---
// Outer loop: Iterates through all possible starting positions in the haystack.
// The loop condition is optimized: no need to check positions where the remaining haystack
// is shorter than the needle.
for (let currentHaystackIndex = 0; currentHaystackIndex <= haystackLength - needleLength; ++currentHaystackIndex) {
    let isCurrentSliceAMatch = true; // Flag to track if the current segment matches the needle.

    // Inner loop: Compares characters of the needle with the corresponding segment of the haystack.
    for (let patternCharacterOffset = 0; patternCharacterOffset < needleLength; ++patternCharacterOffset) {
        // If a character mismatch is found, this segment is not a match.
        if (mainHaystackText[currentHaystackIndex + patternCharacterOffset] !== searchNeedlePattern[patternCharacterOffset]) {
            isCurrentSliceAMatch = false; // Mark as not a match.
            break; // No need to check further characters for this starting position.
        }
    }

    // If the inner loop completed and the flag is still true, a full match was found.
    if (isCurrentSliceAMatch) {
        discoveredMatchPositions.push(currentHaystackIndex); // Record the starting index.
    }
}

// --- Output Generation ---
// Only print output if at least one match was found.
if (discoveredMatchPositions.length > 0) {
    // Join all collected indices with newline characters and print to console.
    console.log(discoveredMatchPositions.join('\n'));
}
// If discoveredMatchPositions is empty, nothing is printed, which aligns with the original behavior.