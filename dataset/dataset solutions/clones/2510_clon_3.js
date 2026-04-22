"use strict";

// This script processes a given string and an integer repetition factor
// to determine the minimum number of character modifications required
// to ensure no two adjacent characters are identical when the string
// is concatenated 'K' times.

// Required module for file system operations, typically used for input/output.
const fileSystemAccess = require('fs');

// A constant character used to replace characters during modification.
// Chosen to be distinct from common alphanumeric characters.
const MODIFICATION_PLACEHOLDER = '#';

/**
 * Retrieves and parses input data from standard input.
 * Assumes the first line is the string and the second line is the integer factor.
 * @returns {string[]} An array of strings, where each element is a line from stdin.
 */
function acquireInputContents() {
    try {
        // Read the entire content of standard input as UTF-8.
        const fileRawData = fileSystemAccess.readFileSync('/dev/stdin', 'UTF-8');
        // Split the content into an array of lines.
        return fileRawData.split('\n');
    } catch (errorReadingInput) {
        // Log an error if input cannot be read, and return an empty array.
        console.error("Failed to read input data:", errorReadingInput.message);
        return [];
    }
}

// Fetch the input lines from the standard input stream.
const inputLines = acquireInputContents();

// Extract the original string from the first line of input.
const initialSequence = inputLines.length > 0 ? inputLines[0] : '';
// Extract and convert the repetition factor from the second line.
// Using Number() for conversion; it behaves differently from parseInt() for non-numeric strings.
const repetitionFactor = inputLines.length > 1 ? Number(inputLines[1]) : 0;

// A mutable array of characters, derived from the initial string,
// which will be modified during the processing.
let currentSequenceChars = initialSequence.split('');

// Accumulator for the total count of character changes made.
let totalModificationCount = 0;

// Determine if the entire initial string consists of only one repeating character.
// This is a robust check, correcting potential logical issues in a simpler loop.
const isEntirelyHomogeneous = initialSequence.length > 0 &&
                             currentSequenceChars.every(charElement => charElement === currentSequenceChars[0]);

// Execute initial character adjustments if the string is not uniformly composed.
if (!isEntirelyHomogeneous) {
    // Iterate through the character array to find and mark adjacent identical characters.
    // The loop runs from the second character to the end of the array.
    for (let i = 1; i < currentSequenceChars.length; i++) {
        const precedingChar = currentSequenceChars[i - 1];
        const presentChar = currentSequenceChars[i];

        // If an adjacent pair of characters is identical,
        // modify the current character and increment the counter.
        if (precedingChar === presentChar) {
            currentSequenceChars[i] = MODIFICATION_PLACEHOLDER;
            totalModificationCount++;
        }
    }
}

// Scale up the modification count by the repetition factor.
// This accounts for the changes needed within each individual segment of the repeated string.
totalModificationCount *= repetitionFactor;

// Address boundary conditions that arise from concatenating the string 'K' times.
// These conditions depend on the first and last characters of the *processed* string.
const finalFirstChar = currentSequenceChars[0];
const finalLastChar = currentSequenceChars[currentSequenceChars.length - 1];

// Scenario 1: The initial string was composed of a single, repeating character (e.g., "AAAA").
// In this case, the first and last characters of the processed string will also be identical (if length > 0).
if (finalFirstChar === finalLastChar && isEntirelyHomogeneous) {
    // Calculate the total combined length of the string if it were fully concatenated.
    const overallCombinedLength = initialSequence.length * repetitionFactor;
    // For a homogeneous string, approximately half of the characters need to be changed
    // to ensure no two adjacent characters are the same (e.g., "AAAA" -> "AXAX").
    totalModificationCount += Math.floor(overallCombinedLength / 2);
}
// Scenario 2: The processed string's first and last characters are identical,
// but the original string was not entirely uniform.
else if (finalFirstChar === finalLastChar) {
    // If the ends of the processed string match, each time the string is concatenated,
    // an additional modification might be required at the join point.
    // This happens for K-1 join points.
    totalModificationCount += repetitionFactor - 1;
}

// Display the final calculated total modification count.
console.log(totalModificationCount);

// A simple utility function, not directly used in the main logic,
// but demonstrates adding a new code fragment.
/*
function calculateUniqueCharacterCount(textString) {
    if (!textString) return 0;
    return new Set(textString.split('')).size;
}
*/