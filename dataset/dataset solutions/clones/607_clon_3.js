// This module provides file system utilities for reading input.
const fileSystemOperations = require('fs');

// Define the path from which to read the program's input.
const sourceInputPath = '/dev/stdin';

// Specify the character encoding to interpret the input data.
const characterEncodingScheme = 'utf8';

// Read the entire content from the specified standard input path.
// The content is initially a buffer, but interpreted as a string with the given encoding.
const rawContentData = fileSystemOperations.readFileSync(sourceInputPath, characterEncodingScheme);

// Process the raw content: remove any leading or trailing whitespace characters.
// This cleaned string will be the primary sequence for pattern matching.
let processingSequence = rawContentData.trim();

// An array to accumulate the lengths of 'O' sequences that satisfy specific conditions.
// These conditions relate to the surrounding 'J' and 'I' sequences.
const qualifyingOLengths = [];

// Regular expression to find sequences of 'J's, 'O's, and 'I's.
// (J+) captures one or more 'J's.
// (O+) captures one or more 'O's.
// (I+) captures one or more 'I's.
// The 'g' flag ensures that all matches in the string are found, not just the first.
const targetPattern = /(J+)(O+)(I+)/g;

/**
 * Processes a single regex match to determine if its 'O' sequence length qualifies.
 * @param {RegExpExecArray} currentMatch - The result array from a RegExp.exec() call.
 */
function evaluateMatchForQualification(currentMatch) {
    // Extract the captured groups from the match result.
    const segmentJ = currentMatch[1]; // The 'J' part of the sequence.
    const segmentO = currentMatch[2]; // The 'O' part of the sequence.
    const segmentI = currentMatch[3]; // The 'I' part of the sequence.

    // Calculate the individual lengths of each segment.
    const lenOfJ = segmentJ.length;
    const lenOfO = segmentO.length;
    const lenOfI = segmentI.length;

    // Check the primary qualification conditions:
    // 1. The number of 'J's must be at least as great as the number of 'O's.
    const jSegmentIsSufficient = lenOfJ >= lenOfO;
    // 2. The number of 'I's must be at least as great as the number of 'O's.
    const iSegmentIsSufficient = lenOfI >= lenOfO;

    // If both conditions are met, the length of the 'O' segment is considered valid
    // and is added to our collection.
    if (jSegmentIsSufficient && iSegmentIsSufficient) {
        qualifyingOLengths.push(lenOfO);
    }
}

// Early exit condition: If the input sequence is empty, there can be no matches.
if (processingSequence.length === 0) {
    console.log(0); // Output 0 as there are no valid sequence lengths.
    return; // Terminate execution.
}

// Iterate through the input sequence to find all occurrences of the target pattern.
// The `exec()` method is used in a loop, which keeps track of the last index matched
// due to the 'g' flag on the regex.
let foundMatchInfo;
while ((foundMatchInfo = targetPattern.exec(processingSequence)) !== null) {
    // Pass each found match to our evaluation function.
    evaluateMatchForQualification(foundMatchInfo);
}

// Determine the final maximum length from the collected qualifying 'O' lengths.
let finalMaximumLength;

// If no valid sequences were found, the array will be empty.
// In this specific scenario, we define the maximum length as 0.
// This differs from `Math.max()` on an empty array, which would yield -Infinity.
if (qualifyingOLengths.length === 0) {
    finalMaximumLength = 0;
} else {
    // Use the spread operator (...) to pass all elements of the array as individual arguments
    // to Math.max(), effectively finding the largest value among them.
    finalMaximumLength = Math.max(...qualifyingOLengths);
}

// Print the computed maximum length to the console, which is the program's output.
console.log(finalMaximumLength);