'use strict';

// This module handles the primary logic for character sequence analysis.

/**
 * Parses a raw input string to determine the maximum number of '0'-'1' pairs
 * that can be formed and removed from the sequence.
 *
 * @param {string} rawInputContent - The complete input string, potentially multi-line.
 * @returns {number} The total count of characters that can be removed.
 */
const processInputSequence = (rawInputContent) => {
    // --- Input Validation and Pre-processing ---
    // Ensure the input is a valid string and not empty after trimming.
    if (typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
        console.error("Error: Provided input content is invalid or empty. Returning 0 removable characters.");
        return 0; // No characters can be removed from invalid input.
    }

    // Extract the primary sequence from the first line of the input.
    // Trim any leading/trailing whitespace from this specific line.
    const effectiveCharLine = rawInputContent.split('\n')[0].trim();

    // If the extracted line is empty, there's nothing to process.
    if (effectiveCharLine.length === 0) {
        console.warn("Warning: The first line of input contained no significant characters. Returning 0.");
        return 0;
    }

    // Convert the effective character line into an array of individual symbols.
    // Using `Array.from` provides an alternative to `String.prototype.split('')`.
    const symbolCollection = Array.from(effectiveCharLine);

    // --- Character Counting Logic ---
    // Initialize distinct counters for '0' and '1' symbols.
    let zerosTally = 0; // Accumulator for '0' occurrences.
    let onesTally = 0;  // Accumulator for '1' occurrences.

    // Iterate through each symbol in the collection to update tallies.
    // Using a `for...of` loop for modern iteration.
    for (const currentSymbol of symbolCollection) {
        // Use a switch statement for clarity and extensibility if more symbols were involved.
        switch (currentSymbol) {
            case '0':
                zerosTally++;
                break;
            case '1':
                onesTally++;
                break;
            default:
                // Optional: Log or handle unexpected characters.
                // For this problem, we assume only '0's and '1's are relevant.
                console.debug(`Encountered an unexpected symbol '${currentSymbol}'. It will be ignored.`);
                break;
        }
    }

    // --- Calculation of Removable Characters ---
    // Determine the limiting factor: the count of the less frequent symbol.
    // This value represents the maximum number of pairs ('0','1') that can be formed.
    const limitingSymbolCount = Math.min(zerosTally, onesTally);

    // Each pair consists of two characters. Therefore, multiply by two
    // to get the total number of characters that can be removed.
    const totalRemovableCharacters = limitingSymbolCount * 2;

    // --- Output Result ---
    // Display the final calculated count to the standard output.
    console.log(totalRemovableCharacters);

    // The function also returns the computed value for potential external use.
    return totalRemovableCharacters;
};

/**
 * A utility function to safely read content from standard input.
 *
 * @returns {string} The content read from /dev/stdin, or an empty string on error.
 */
const retrieveStandardInputContent = () => {
    try {
        // Attempt to read the entire file synchronously using Node.js 'fs' module.
        // Specifies UTF-8 encoding for text data.
        const inputBuffer = require('fs').readFileSync('/dev/stdin', 'utf-8');
        return inputBuffer;
    } catch (ioError) {
        // Log any errors encountered during file reading.
        console.error("Failed to read input from /dev/stdin:", ioError.message);
        // Return an empty string to allow the main logic to proceed gracefully.
        return '';
    }
};

// --- Execution Entry Point ---
// This block ensures the script runs the core logic when executed.
(function initializeApplication() {
    // Fetch the raw data from the standard input stream.
    const rawDataStream = retrieveStandardInputContent();

    // Pass the acquired data to the main processing function.
    processInputSequence(rawDataStream);
})();