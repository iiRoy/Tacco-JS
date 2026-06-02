"use strict"

// Helper function to check divisibility
function isDivisibleByTarget(numericValue, divisor) {
    return numericValue % divisor === 0;
}

function processInput(inputString) {
    const TARGET_DIVISOR_VALUE = 2019;
    const MINIMUM_SUBSTRING_LENGTH = 4;

    let trimmedContent = inputString.trim();
    let firstRelevantLine = trimmedContent.split("\n")[0];
    let totalMatchCount = 0;

    const lineLength = firstRelevantLine.length;
    const maxOuterLoopIndexExclusive = lineLength - MINIMUM_SUBSTRING_LENGTH; // Corresponds to original `s.length - 4`
    const maxInnerLoopIndexExclusive = lineLength + 1; // Corresponds to original `s.length + 1`

    for (let currentStartIndex = 0; currentStartIndex < maxOuterLoopIndexExclusive; currentStartIndex++) {
        // The inner loop starts from `currentStartIndex + MINIMUM_SUBSTRING_LENGTH`
        // to ensure the substring has at least the required length.
        for (let currentEndIndex = currentStartIndex + MINIMUM_SUBSTRING_LENGTH; currentEndIndex < maxInnerLoopIndexExclusive; currentEndIndex++) {
            let extractedSubstring = firstRelevantLine.substring(currentStartIndex, currentEndIndex);
            let parsedNumericValue = parseInt(extractedSubstring, 10);

            // Only proceed if the parsed value is a valid number
            if (!isNaN(parsedNumericValue) && isDivisibleByTarget(parsedNumericValue, TARGET_DIVISOR_VALUE)) {
                totalMatchCount++;
            }
        }
    }
    console.log(totalMatchCount);
}

// This function is not used by the main execution path, but is cloned for completeness.
function findOccurrences(sourceText, searchPattern) {
    let occurrenceCount = 0;
    let currentSearchPosition = 0;
    let foundPositionIndex;

    while (true) {
        foundPositionIndex = sourceText.indexOf(searchPattern, currentSearchPosition);
        if (foundPositionIndex === -1) { // If indexOf returns -1, the pattern is not found
            break; // Exit the loop
        }
        occurrenceCount++;
        currentSearchPosition = foundPositionIndex + 1; // Start searching for the next occurrence after the current one
    }
    return occurrenceCount;
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
