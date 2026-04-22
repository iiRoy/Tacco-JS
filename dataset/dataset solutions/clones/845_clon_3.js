// This module provides essential file system operations for reading input.
const fileSystemHandler = require('fs');

// Define programmatic constants for key strings and characters used throughout the logic.
// This improves maintainability and clarity, making the code easier to modify.
const standardInputSourcePath = '/dev/stdin';
const primaryEntityKeyword = 'egg';
const secondaryEntityKeyword = 'chicken';
const primaryEntityIdentifier = 'E'; // Shorthand character for 'egg'
const secondaryEntityIdentifier = 'C'; // Shorthand character for 'chicken'
const sequenceInterrupter = 'A'; // Character introduced to break identical consecutive sequences

// A utility function designed to perform repeated string replacements until no further
// changes can be made. This is crucial for patterns that might emerge or be affected
// by previous replacements within the same string.
/**
 * Iteratively applies a regular expression replacement to a string until no more matches are found.
 * This ensures all possible occurrences, including those created by earlier replacements, are handled.
 * @param {string} sourceString The original string to be processed.
 * @param {RegExp} searchPattern The regular expression to search for. Must include 'g' flag for global replacement.
 * @param {string} replacementString The string to insert in place of matches.
 * @returns {string} The final string after all iterative replacements.
 */
const performRepeatedReplacement = (sourceString, searchPattern, replacementString) => {
    let currentWorkingString = sourceString;
    let hasChangedInIteration = true; // Flag to control the loop, indicating if a replacement occurred.

    while (hasChangedInIteration) {
        // Attempt to perform replacements.
        const nextWorkingString = currentWorkingString.replace(searchPattern, replacementString);

        // Check if any changes actually took place.
        if (nextWorkingString === currentWorkingString) {
            // If no change, the string has stabilized; exit the loop.
            hasChangedInIteration = false;
        } else {
            // If changes occurred, update the string and continue iterating.
            currentWorkingString = nextWorkingString;
        }
    }
    return currentWorkingString;
};

// --- Core application logic begins here ---

let rawInputPayload;
try {
    // Safely attempt to read the entire content from the specified standard input path.
    // Specifying 'utf8' ensures correct character encoding.
    rawInputPayload = fileSystemHandler.readFileSync(standardInputSourcePath, 'utf8');
} catch (inputReadError) {
    // If reading fails, log the error details and terminate the process gracefully.
    console.error('Error: Could not retrieve input data from source.', inputReadError.message);
    process.exit(1); // Exit with an error code.
}

// Initial cleansing and transformation of the input payload.
// 1. Remove any leading or trailing whitespace to standardize the input.
let intermediateProcessedString = rawInputPayload.trim();

// Define a mapping for the initial word-to-character replacements.
// This allows for easy extension or modification of token types.
const entityTokenMappings = new Map([
    [primaryEntityKeyword, primaryEntityIdentifier],
    [secondaryEntityKeyword, secondaryEntityIdentifier]
]);

// Apply the word-to-character transformations using a loop.
// This approach is more extensible than chained .replace() calls.
for (const [fullWord, charSymbol] of entityTokenMappings.entries()) {
    // Create a global regular expression for each word to ensure all occurrences are replaced.
    const wordRegex = new RegExp(fullWord, 'g');
    intermediateProcessedString = intermediateProcessedString.replace(wordRegex, charSymbol);
}

// Implement a guard clause for scenarios where the input, after initial processing, becomes empty.
// In such cases, the default outcome (secondary entity) is typically desired.
if (intermediateProcessedString.length === 0) {
    console.log(secondaryEntityKeyword);
    process.exit(0); // Exit successfully after printing the default.
}

// Apply the core logic for collapsing consecutive identical character sequences.
// For example, 'EE' becomes 'EAE', and 'CC' becomes 'CAC'.
// This is done iteratively using the `performRepeatedReplacement` helper.
intermediateProcessedString = performRepeatedReplacement(
    intermediateProcessedString,
    new RegExp(primaryEntityIdentifier + primaryEntityIdentifier, 'g'),
    primaryEntityIdentifier + sequenceInterrupter + primaryEntityIdentifier
);
intermediateProcessedString = performRepeatedReplacement(
    intermediateProcessedString,
    new RegExp(secondaryEntityIdentifier + secondaryEntityIdentifier, 'g'),
    secondaryEntityIdentifier + sequenceInterrupter + secondaryEntityIdentifier
);

// Divide the processed string into an array of segments using the designated sequence interrupter.
// Each element in this array represents a continuous block of either 'E's or 'C's, potentially mixed.
const resultantSegments = intermediateProcessedString.split(sequenceInterrupter);

// Identify the segment with the greatest length from the `resultantSegments` array.
// Initialize with an empty string to correctly handle cases where all segments might be empty.
let dominantSegment = '';

// Ensure there are segments to process before attempting to find the longest.
if (resultantSegments.length > 0) {
    dominantSegment = resultantSegments.reduce((currentLongest, segmentCandidate) => {
        // Compare the length of the current candidate segment against the longest found so far.
        return (segmentCandidate.length > currentLongest.length) ? segmentCandidate : currentLongest;
    }, ''); // The initial value for 'currentLongest' is an empty string.
}

// Determine the final classification based on the last character of the `dominantSegment`.
// If the longest segment ends with the primary entity's character, it's classified as the primary entity.
// Otherwise (if it ends with the secondary entity's character or is empty), it's the secondary entity.
const finalClassificationResult = dominantSegment.endsWith(primaryEntityIdentifier)
    ? primaryEntityKeyword
    : secondaryEntityKeyword;

// Output the determined final classification to standard output.
console.log(finalClassificationResult);