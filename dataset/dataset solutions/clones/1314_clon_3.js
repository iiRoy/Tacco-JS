/**
 * This module is designed to perform a detailed analysis of textual content,
 * specifically counting the occurrences of each lowercase English alphabetic character.
 * It provides a structured report of these frequencies.
 */

/**
 * Processes a given string to calculate the frequency of each lowercase English alphabet.
 * Non-alphabetic characters are ignored, and all input characters are converted to lowercase
 * before counting to ensure case-insensitivity.
 *
 * @param {string} sourceContent The text string to be analyzed for character frequencies.
 * @returns {string} A formatted report string, where each line displays a character
 *                   and its corresponding frequency count, sorted alphabetically by character.
 *                   Includes a header and footer for clarity.
 */
function calculateAlphabetFrequencies(sourceContent) {
    // --- Pre-analysis Validation ---
    // Implement a robust check for the input's validity.
    // If the input is not a string or is empty, issue a warning and return an informative message.
    if (typeof sourceContent !== 'string' || sourceContent.trim().length === 0) {
        console.warn("Frequency Analyzer: Input provided is either not a string or contains no substantive content. Skipping analysis.");
        return "--- Character Frequency Report ---\nNo valid text found for analysis.\n--- End of Report ---";
    }

    // --- Data Structure Initialization ---
    // A JavaScript Map is chosen for its efficiency in handling key-value pairs
    // and maintaining insertion order, which can be useful for certain scenarios,
    // although we will explicitly sort later for consistent output.
    const characterTallyMap = new Map();

    // Pre-populate the map with all 26 lowercase English alphabets,
    // initializing their counts to zero. This guarantees that all letters
    // will appear in the final report, even if they don't occur in the input text.
    const startCharAscii = 'a'.charCodeAt(0);
    const endCharAscii = 'z'.charCodeAt(0);

    for (let currentAsciiValue = startCharAscii; currentAsciiValue <= endCharAscii; currentAsciiValue++) {
        const alphabetKey = String.fromCharCode(currentAsciiValue);
        characterTallyMap.set(alphabetKey, 0);
    }

    // --- Text Iteration and Counting Logic ---
    // Iterate through each individual character of the input string.
    // The `for...of` loop provides a clean way to access each character.
    for (const charUnit of sourceContent) {
        // Convert the current character to its lowercase equivalent to ensure case-insensitive counting.
        const normalizedChar = charUnit.toLowerCase();

        // Check if the normalized character is one of the English alphabets we are tracking.
        // If it is, increment its corresponding count in the map.
        if (characterTallyMap.has(normalizedChar)) {
            // Safely retrieve the current count and update it.
            const existingCount = characterTallyMap.get(normalizedChar);
            characterTallyMap.set(normalizedChar, existingCount + 1);
        }
        // Non-alphabetic characters (numbers, symbols, spaces) are automatically disregarded here.
    }

    // --- Output Generation and Formatting ---
    const reportSections = [];
    const entryDelimiter = " -> "; // A custom delimiter for the output format.

    // Add a descriptive header to the report.
    reportSections.push("--- Character Frequency Analysis Report ---");

    // Convert the Map entries into an array, then sort them alphabetically by character key.
    // This ensures a consistent and readable output order, regardless of processing order.
    const sortedOutputEntries = Array.from(characterTallyMap.entries()).sort((entryA, entryB) =>
        entryA[0].localeCompare(entryB[0])
    );

    // Iterate through the sorted entries and format each character-frequency pair.
    for (const [characterSymbol, occurrenceCount] of sortedOutputEntries) {
        // Each line shows the character and its count, separated by the custom delimiter.
        reportSections.push(`${characterSymbol}${entryDelimiter}${occurrenceCount}`);
    }

    // Add a footer to mark the end of the report.
    reportSections.push("--- End of Analysis ---");

    // Join all formatted sections into a single string, with each section on a new line.
    return reportSections.join('\n');
}

// --- Main Execution Context ---
// This immediately-invoked function expression (IIFE) encapsulates the script's
// primary execution flow, handling input acquisition and output display.
(function executeAnalysis() {
    const standardInputPath = '/dev/stdin';
    let fileContent = '';

    try {
        // Attempt to read the entire content from standard input synchronously.
        // Explicitly specifying 'utf8' encoding to ensure correct character interpretation.
        fileContent = require('fs').readFileSync(standardInputPath, { encoding: 'utf8', flag: 'r' });
    } catch (readOperationError) {
        // Catches potential errors during file reading (e.g., file not found, permission issues).
        // Provides an error message and prevents further processing with invalid input.
        console.error(`Error encountered while attempting to read from '${standardInputPath}': ${readOperationError.message}`);
        // Terminate execution gracefully if input cannot be read.
        return;
    }

    // Invoke the character frequency analysis function with the obtained file content.
    const finalAnalysisReport = calculateAlphabetFrequencies(fileContent);

    // Output the generated report to the console (standard output).
    console.log(finalAnalysisReport);
})();