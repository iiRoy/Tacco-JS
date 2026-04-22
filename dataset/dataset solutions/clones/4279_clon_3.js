"use strict";

// Helper function to check if a segment matches the target pattern,
// considering '?' as a wildcard character.
const checkSegmentForPattern = (segmentToAnalyze, targetSubPattern) => {
    // Basic validation: segments must have the same length to be comparable.
    if (segmentToAnalyze.length !== targetSubPattern.length) {
        return false;
    }

    // Iterate through characters to perform a detailed comparison.
    for (let charIterator = 0; charIterator < targetSubPattern.length; charIterator++) {
        const sourceCharacter = segmentToAnalyze[charIterator];
        const patternCharacter = targetSubPattern[charIterator];

        // If characters don't match and the source character is not a wildcard,
        // then this segment is not a match.
        if (sourceCharacter !== patternCharacter && sourceCharacter !== '?') {
            return false; // Mismatch found, early exit.
        }
    }
    return true; // All characters matched or were wildcards.
};

// Main function to process the input and determine the restored string.
const processInput = inputPayload => {
    // Validate the input payload.
    if (!inputPayload || typeof inputPayload !== 'string' || inputPayload.trim().length === 0) {
        return console.log("UNRESTORABLE - Input data is invalid or empty.");
    }

    // Split the input into lines after trimming whitespace.
    const linesOfInput = inputPayload.trim().split('\n');

    // Ensure there are at least two lines (source string and target pattern).
    if (linesOfInput.length < 2) {
        return console.log("UNRESTORABLE - Insufficient lines in input.");
    }

    // Extract the source string and the pattern to search for.
    const referenceSource = linesOfInput[0];
    const searchPattern = linesOfInput[1];

    // Cache lengths for efficiency and readability.
    const sourceLength = referenceSource.length;
    const patternLength = searchPattern.length;

    // Early exit if the pattern is longer than the source string, as no match is possible.
    if (patternLength > sourceLength) {
        return console.log("UNRESTORABLE - Pattern length exceeds source string length.");
    }

    // Calculate the maximum possible starting position for the pattern in the source.
    const maxStartingPosition = sourceLength - patternLength;

    // Variable to store the index of the rightmost successful match.
    // Initialized to -1, indicating no match found yet.
    let foundMatchPosition = -1;

    // Iterate backwards from the rightmost possible starting position.
    // This ensures we find the rightmost match as per problem requirements.
    for (let currentScanPosition = maxStartingPosition; currentScanPosition >= 0; currentScanPosition--) {
        // Extract the current segment from the source string for comparison.
        // Using substring for clarity, equivalent to slice.
        const currentSegmentCandidate = referenceSource.substring(currentScanPosition, currentScanPosition + patternLength);

        // Use the helper function to check if this segment matches the pattern.
        if (checkSegmentForPattern(currentSegmentCandidate, searchPattern)) {
            foundMatchPosition = currentScanPosition; // Store the index of the successful match.
            break; // Found the rightmost match, no need to check further.
        }
    }

    // After the loop, process the result based on whether a match was found.
    if (foundMatchPosition !== -1) {
        // If a match was found, construct the restored string.
        let resultSegments = [];

        // Add the part of the source string before the match.
        if (foundMatchPosition > 0) { // Only if there's a prefix
            resultSegments.push(referenceSource.slice(0, foundMatchPosition));
        }

        // Insert the target pattern itself into the result.
        resultSegments.push(searchPattern);

        // Add the part of the source string after the match.
        const endOfPatternInSource = foundMatchPosition + patternLength;
        if (endOfPatternInSource < sourceLength) { // Only if there's a suffix
            resultSegments.push(referenceSource.slice(endOfPatternInSource));
        }

        // Join the segments to form the initial restored string.
        let finalRestoredString = resultSegments.join('');

        // Replace any remaining wildcards ('?') with 'a' as specified.
        finalRestoredString = finalRestoredString.replace(/\?/g, 'a');

        // Output the successfully restored string.
        console.log(finalRestoredString);
    } else {
        // If no match was found after checking all possibilities.
        console.log("UNRESTORABLE");
    }
};

// --- Execution Block ---
// Acquire the necessary module for file system operations.
const fileSystemHandler = require('fs');

// Define the standard input file path.
const standardInputFile = '/dev/stdin';

// Read the content from standard input, ensuring UTF-8 encoding.
const inputBufferContent = fileSystemHandler.readFileSync(standardInputFile, 'utf8');

// Invoke the main processing function with the collected input.
processInput(inputBufferContent);