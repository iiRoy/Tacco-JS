'use strict';

/**
 * Processes raw input data to count string patterns and calculate a final score.
 * This function expects a string where the first token is a number (ignored)
 * followed by space-separated strings to analyze.
 * @param {string} incomingText The raw input string from stdin.
 */
function processInputData(incomingText) {
    // Helper function to count non-overlapping occurrences of a substring.
    // This replaces the 'split("AB").length - 1' approach for diversity and to demonstrate a different counting method.
    const countSubstringOccurrences = (mainStr, subStr) => {
        let occurrenceCount = 0;
        let searchStartIndex = 0;
        const targetLength = subStr.length;

        // Early exit for invalid or empty substring patterns.
        if (targetLength === 0) {
            return 0;
        }

        // Loop to find all non-overlapping occurrences.
        while (true) {
            const foundPosition = mainStr.indexOf(subStr, searchStartIndex);
            if (foundPosition === -1) {
                // No more occurrences found, exit loop.
                break;
            }
            occurrenceCount++;
            // Move the search start index past the current occurrence to find the next.
            searchStartIndex = foundPosition + targetLength;
        }
        return occurrenceCount;
    };

    // Prepare the input: first, remove leading/trailing whitespace, then split into individual tokens.
    const tokenCollection = incomingText.trim().split(/\s+/);

    // The very first token in the input typically represents the total count of subsequent data strings.
    // In this specific problem's logic, its numerical value is not directly used for calculations,
    // but it must be removed from the array so that only the actual data strings are processed.
    const _disregardedInitialCount = tokenCollection.shift();

    // Initialize accumulators for various string characteristics we need to track.
    let countStringsEndingWithA = 0;
    let countStringsStartingWithB = 0;
    let countStringsBothStartingBAndEndingA = 0;
    let totalContiguousABs = 0;

    // Iterate through each relevant string in the collection to gather all necessary statistics.
    // This single loop replaces multiple 'reduce' operations found in the original code,
    // improving efficiency and providing a different structural approach.
    for (const currentElement of tokenCollection) {
        // Check if the current string concludes with the character 'A'.
        if (currentElement.endsWith('A')) {
            countStringsEndingWithA++;
        }

        // Check if the current string commences with the character 'B'.
        if (currentElement.startsWith('B')) {
            countStringsStartingWithB++;
        }

        // Identify strings that both begin with 'B' AND terminate with 'A'.
        // These are special "bridge" strings.
        if (currentElement.startsWith('B') && currentElement.endsWith('A')) {
            countStringsBothStartingBAndEndingA++;
        }

        // Accumulate the number of "AB" substring occurrences found within each string.
        totalContiguousABs += countSubstringOccurrences(currentElement, 'AB');
    }

    // Calculate the maximum number of 'bridges' that can be formed by linking
    // strings that end in 'A' with strings that start with 'B'. This is limited
    // by the lesser of the two counts.
    let maximumLinkableSegments = Math.min(countStringsEndingWithA, countStringsStartingWithB);

    // Apply a specific adjustment for a unique edge case:
    // If every string that ends with 'A' also starts with 'B', AND
    // every string that starts with 'B' also ends with 'A', AND
    // there is at least one such string (to prevent decrementing when counts are zero).
    // This scenario implies all relevant strings are of the "B...A" type.
    // In this specific configuration, one potential 'bridge' connection is effectively "lost"
    // because a "B...A" string can only form one bridge, not two distinct ones as if it were just "B..." and "...A".
    const allRelevantAreBothType = (countStringsBothStartingBAndEndingA === countStringsEndingWithA &&
                                    countStringsEndingWithA === countStringsStartingWithB);

    if (allRelevantAreBothType && countStringsBothStartingBAndEndingA > 0) {
        maximumLinkableSegments--;
    }

    // The final computed value is the sum of direct "AB" occurrences already
    // present within the strings, plus the additional "AB" sequences that can be
    // created by optimally linking the strings together.
    console.log(totalContiguousABs + maximumLinkableSegments);
}

// Entry point for execution: read the entire content from standard input,
// assuming UTF-8 encoding, and then pass it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));