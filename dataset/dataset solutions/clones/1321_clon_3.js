const fileSystemHandler = require('fs');

/**
 * Normalizes a string by trimming whitespace and converting to lowercase.
 * Provides a consistent way to handle string comparisons.
 * @param {string} inputString - The string to normalize.
 * @returns {string} The normalized string, or an empty string if input is not a string.
 */
const standardizeTextFragment = (inputString) => {
    if (typeof inputString !== 'string') {
        return '';
    }
    return inputString.trim().toLowerCase();
};

/**
 * Counts occurrences of a specific target word within a given line of text.
 * It uses a regular expression with word boundaries to ensure whole word matches.
 * @param {string} lineContent - The line of text to search within.
 * @param {string} targetTerm - The word to count.
 * @returns {number} The number of times the target word appears in the line.
 */
const tallyWordInSegment = (lineContent, targetTerm) => {
    if (!lineContent || !targetTerm) {
        return 0;
    }

    const normalizedLine = standardizeTextFragment(lineContent);
    // Escape special characters in the target term to prevent regex issues
    const escapedTargetTerm = targetTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Create a regular expression for whole word matching, global flag for all occurrences
    const wordSearchRegex = new RegExp(`\\b${escapedTargetTerm}\\b`, 'g');
    const detectedMatches = normalizedLine.match(wordSearchRegex);
    
    return detectedMatches ? detectedMatches.length : 0;
};

/**
 * Main function to read input, process it, and calculate word occurrences.
 * Encapsulates the entire logic for better modularity.
 * @returns {number} The total count of the target word.
 */
const executeWordCountingProcess = () => {
    // Attempt to read the raw input data from standard input
    const rawInputBuffer = fileSystemHandler.readFileSync('/dev/stdin');
    const fullSourceText = rawInputBuffer.toString('utf8').trim();

    // Early exit if no input is provided
    if (!fullSourceText) {
        return 0;
    }

    // Split the entire text into individual lines
    const allInputSegments = fullSourceText.split('\n');

    // Handle cases where there are no effective lines after splitting
    if (allInputSegments.length === 0 || (allInputSegments.length === 1 && !allInputSegments[0].trim())) {
        return 0;
    }

    // The first line defines the word we are looking for
    const primarySearchTerm = standardizeTextFragment(allInputSegments[0]);

    // If the primary search term is empty after normalization, there's nothing to count
    if (!primarySearchTerm) {
        return 0;
    }

    const contentStartLineIndex = 1;
    let terminationMarkerLineIndex = -1;

    // Iterate through subsequent lines to find the 'END_OF_TEXT' marker
    for (let segmentIdx = contentStartLineIndex; segmentIdx < allInputSegments.length; segmentIdx++) {
        if (standardizeTextFragment(allInputSegments[segmentIdx]) === 'end_of_text') {
            terminationMarkerLineIndex = segmentIdx;
            break; // Stop at the first occurrence of the marker
        }
    }

    // Extract only the relevant content lines, excluding the first line and anything after the marker
    const effectiveContentLines = (terminationMarkerLineIndex !== -1)
        ? allInputSegments.slice(contentStartLineIndex, terminationMarkerLineIndex)
        : allInputSegments.slice(contentStartLineIndex); // If no marker, process all remaining lines

    // Initialize the accumulator for the total count
    let totalOccurrencesAccumulator = 0;

    // Process each content line to count the target word
    for (const currentLineBeingAnalyzed of effectiveContentLines) {
        totalOccurrencesAccumulator += tallyWordInSegment(currentLineBeingAnalyzed, primarySearchTerm);
    }

    return totalOccurrencesAccumulator;
};

// Execute the process and log the final result to standard output
const finalResult = executeWordCountingProcess();
console.log(finalResult);