"use strict"; // Enforce stricter parsing and error handling for the entire script.

/**
 * A specialized utility function designed to take a string,
 * break it down into individual characters, and then sort those characters
 * lexicographically before rejoining them into a single string.
 * This ensures a consistent, ordered representation of the string's character set.
 *
 * @param {string} sourceText The original string to be processed.
 * @returns {string} A new string composed of the sorted characters from the input.
 *                   Returns an empty string if the input is not a valid string.
 */
function obtainSortedCharacterSequence(sourceText) {
    // Basic type check for robustness.
    if (typeof sourceText !== 'string') {
        console.warn("Warning: Attempted to sort non-string input. Returning empty string.");
        return "";
    }

    // Convert the string into an array of characters.
    // Using Array.from() is often preferred over split('') for better Unicode support.
    const characterArray = Array.from(sourceText);

    // Sort the character array alphabetically (lexicographically).
    characterArray.sort();

    // Join the sorted characters back into a single string.
    return characterArray.join('');
}

/**
 * The primary entry point for processing the input data.
 * This function reads a multi-line string, extracts specific segments,
 * normalizes them according to defined rules, and then performs a
 * lexicographical comparison to determine an outcome.
 *
 * @param {string} entireInputPayload The complete input string, expected to contain
 *                                    at least two lines separated by newline characters.
 */
const executeComparativeAnalysis = (entireInputPayload) => {
    // Declare constants for the possible output messages.
    // This improves readability and makes message changes easier.
    const AFFIRMATIVE_RESPONSE = "Yes";
    const NEGATIVE_RESPONSE = "No";

    // Initial validation: check if the input is a non-empty string.
    // If not, log an error and output the negative response as a default fallback.
    if (typeof entireInputPayload !== 'string' || entireInputPayload.trim().length === 0) {
        console.error("Processing halted: Input payload is either invalid or empty.");
        console.log(NEGATIVE_RESPONSE);
        return; // Exit the function early.
    }

    // Split the entire payload into an array of individual lines.
    // Using 'let' as a stylistic choice, though 'const' would also work here.
    let parsedInputLines = entireInputPayload.split('\n');

    // Critical guard clause: ensure there are at least two lines available for comparison.
    // If not, log a relevant message and output the negative response.
    if (parsedInputLines.length < 2) {
        console.error("Processing halted: Insufficient lines detected in input for comparison. Expected at least two.");
        console.log(NEGATIVE_RESPONSE);
        return; // Exit the function early.
    }

    // --- Processing the First Line ---
    // Extract the content of the very first line.
    const initialSegmentContent = parsedInputLines[0];
    // Apply the sorting utility to get the normalized form of the first line.
    const normalizedFirstSegment = obtainSortedCharacterSequence(initialSegmentContent);

    // --- Processing the Second Line ---
    // Extract the content of the second line.
    const subsequentSegmentContent = parsedInputLines[1];
    // Convert the second line into a character array.
    const charactersOfSecondSegment = Array.from(subsequentSegmentContent);
    // Sort these characters lexicographically.
    charactersOfSecondSegment.sort();
    // Reverse the order of the *sorted* characters.
    charactersOfSecondSegment.reverse();
    // Join them back to form the final reversed-sorted string.
    const reversedNormalizedSecondSegment = charactersOfSecondSegment.join('');

    // --- Final Comparison and Output ---
    // Perform a standard lexicographical string comparison.
    // If the normalized first segment comes before the reversed-normalized second segment,
    // the condition is met.
    if (normalizedFirstSegment < reversedNormalizedSecondSegment) {
        console.log(AFFIRMATIVE_RESPONSE);
    } else {
        console.log(NEGATIVE_RESPONSE);
    }
};

// --- Script Execution Bootstrap ---
// This block handles the actual execution flow when the script is run.
try {
    // Dynamically import the Node.js 'fs' (File System) module.
    const fileSystemModule = require('fs');

    // Read the entire content of the standard input file synchronously.
    // '/dev/stdin' is the conventional path for standard input in Unix-like systems.
    // 'utf8' encoding is specified to handle a wide range of characters correctly.
    const dataFromStandardInput = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    
    // Pass the acquired input data to the main processing function.
    executeComparativeAnalysis(dataFromStandardInput);
} catch (runtimeException) {
    // Catch and report any exceptions that occur during file reading or initial setup.
    console.error("A critical error prevented script execution:", runtimeException.message);
    // In case of an unhandled exception, default to the negative response to ensure an output.
    console.log("No");
}