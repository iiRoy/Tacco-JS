"use strict";

// This script is designed to process text input from the standard input stream (stdin).
// Its primary function is to count the occurrences of a specific keyword within the text,
// until a designated termination marker is encountered.

// A buffer to accumulate all incoming data chunks from stdin.
let accumulatedRawInput = '';

// A control flag to ensure the main text analysis logic runs only once
// after the entire input stream has been received.
let processingHasConcluded = false;

/**
 * Standardizes a given string by converting it to lowercase.
 * This helper function ensures case-insensitive comparisons throughout the analysis.
 * @param {string} originalString - The text string to be normalized.
 * @returns {string} The lowercase version of the input string.
 */
const convertToStandardCase = (originalString) => {
    // It's a fundamental step for case-insensitive matching.
    return originalString.toLowerCase();
};

/**
 * Orchestrates the entire text analysis process.
 * It takes the full raw input, extracts the search keyword, and counts its occurrences.
 * @param {string} entireInputBuffer - The complete string of data gathered from stdin.
 * @returns {number} The final tally of how many times the keyword appeared.
 */
const performKeywordAnalysis = (entireInputBuffer) => {
    // Define the special string that signals the end of the text data for processing.
    // Using uppercase for comparison robustness, irrespective of input casing.
    const DATA_TERMINATION_MARKER = "END_OF_TEXT";

    // Split the input buffer into individual lines.
    // We filter out any lines that are empty or contain only whitespace,
    // as these typically don't carry meaningful data for analysis.
    const contentLines = entireInputBuffer
        .split('\n')
        .map(line => line.trim()) // Trim whitespace from each line
        .filter(line => line.length > 0); // Remove truly empty lines

    // If, after filtering, there are no lines left, we can't perform any analysis.
    if (contentLines.length === 0) {
        console.error("Error: No valid content lines were found for analysis. Input might be empty or malformed.");
        return 0; // Return zero as no keyword could be found.
    }

    // The very first meaningful line of input is designated as the keyword to search for.
    // It is immediately converted to standard case for consistent matching.
    const primarySearchKeyword = convertToStandardCase(contentLines[0]);

    // Initialize our counter for keyword matches.
    let matchCounter = 0;

    // Begin iterating through the content lines starting from the second line (index 1).
    // The first line was already consumed as the keyword.
    // We use a traditional for-loop to allow for explicit control over iteration,
    // including an early exit condition.
    for (let currentLineIdx = 1; currentLineIdx < contentLines.length; currentLineIdx++) {
        const lineText = contentLines[currentLineIdx];

        // Extract the first word of the current line to check for the termination marker.
        // This is a common pattern for processing structured input.
        const candidateTerminationWord = lineText.split(' ')[0];

        // If the first word matches our termination marker (case-insensitively),
        // we stop processing further lines as per the problem's specification.
        if (candidateTerminationWord && candidateTerminationWord.toUpperCase() === DATA_TERMINATION_MARKER) {
            break; // Exit the loop as the end of text has been reached.
        }

        // Split the current line into individual word tokens.
        // Again, we filter out any empty strings that might result from multiple spaces.
        const wordTokensInLine = lineText
            .split(' ')
            .filter(token => token.length > 0); // Ensure tokens are not empty strings.

        // Now, iterate over each word token found in the current line.
        // Convert each token to standard case and compare it against our primary keyword.
        wordTokensInLine.forEach(singleWordToken => {
            const normalizedToken = convertToStandardCase(singleWordToken);
            // If the normalized token matches the primary keyword, increment our counter.
            if (normalizedToken === primarySearchKeyword) {
                matchCounter++;
            }
        });
    }

    // After processing all relevant lines, return the final accumulated count.
    return matchCounter;
};

// --- Standard Input Stream Setup ---

// Resume the standard input stream to allow data to flow into our application.
process.stdin.resume();

// Explicitly set the character encoding for the incoming data to UTF-8.
// This is crucial for handling various text characters correctly.
process.stdin.setEncoding('utf-8');

// Attach an event listener for 'data' events on stdin.
// This event fires whenever a new chunk of data is available.
process.stdin.on('data', (incomingDataSegment) => {
    // Append the newly received data segment to our overall input buffer.
    // This effectively concatenates all chunks into a single string.
    accumulatedRawInput += incomingDataSegment;
});

// Attach an event listener for the 'end' event on stdin.
// This event signals that the input stream has closed and no more data will be received.
process.stdin.on('end', () => {
    // Implement a guard clause to ensure this block of code executes only once.
    // This prevents potential issues if the 'end' event is somehow triggered multiple times.
    if (processingHasConcluded) {
        console.warn("Warning: Attempted to re-process input after completion.");
        return;
    }
    processingHasConcluded = true; // Mark processing as started.

    try {
        // Invoke the core analysis function with the complete buffered input.
        const finalOccurrenceCount = performKeywordAnalysis(accumulatedRawInput);

        // Output the computed result to the standard output.
        console.log(finalOccurrenceCount);
    } catch (processingError) {
        // Catch any errors that might occur during the analysis phase.
        // Log the error details and exit the process with an error code.
        console.error("An unhandled error occurred during keyword analysis:", processingError.message);
        process.exit(1); // Indicate an abnormal termination.
    }
});

// Attach an event listener for 'error' events on stdin.
// This handles potential issues with the input stream itself (e.g., I/O errors).
process.stdin.on('error', (streamError) => {
    console.error("A critical error occurred on the standard input stream:", streamError.message);
    process.exit(1); // Terminate with an error code if stdin encounters an issue.
});