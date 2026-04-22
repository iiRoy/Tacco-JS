/**
 * This module provides a specialized string analysis utility. Its primary function
 * is to determine if a given input string can be constructed by concatenating
 * a predefined set of word segments. A key characteristic of this analysis
 * is that both the input string and the vocabulary words are processed in their
 * reversed forms before the matching operation commences.
 *
 * The program reads its input from standard input (/dev/stdin), processes the first
 * non-empty line, and outputs 'YES' or 'NO' to standard output, indicating
 * whether the string can be successfully composed.
 */

/**
 * Performs an in-place reversal of a given string.
 * This function iterates through the input string from its end to its beginning,
 * appending each character to a new result string.
 *
 * @param {string} sourceText The string that needs to be inverted.
 * @returns {string} The fully reversed version of the `sourceText`. Returns an empty string
 *                   if the input is not a valid string or is null/undefined.
 */
const performStringInversion = (sourceText) => {
    // Robust input type validation.
    if (typeof sourceText !== 'string' || sourceText === null) {
        console.warn("Warning: Attempted to invert non-string or null data. Returning an empty string.");
        return '';
    }

    let invertedSequence = ''; // Accumulator for the reversed string.
    // Loop backward through the characters of the source string.
    for (let charIndex = sourceText.length - 1; charIndex >= 0; charIndex--) {
        invertedSequence += sourceText[charIndex]; // Append character to the result.
    }
    return invertedSequence;
};

// Define constants for the program's success and failure output messages.
const POSITIVE_RESULT_MESSAGE = 'YES';
const NEGATIVE_RESULT_MESSAGE = 'NO';

/**
 * The core logic function that analyzes the input content.
 * It determines if the reversed first line of the input can be formed
 * by concatenating a set of predefined, also reversed, vocabulary words.
 *
 * @param {string} rawInputContent The complete raw string content, typically read from a file.
 */
function processTextualComposition(rawInputContent) {
    // --- Initial Input Validation and Extraction ---
    // Check for invalid or empty input content.
    if (typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
        console.log(NEGATIVE_RESULT_MESSAGE); // Cannot analyze empty or invalid input.
        return;
    }

    // Extract the primary target line from the input.
    // This handles both Windows (\r\n) and Unix (\n) line endings and trims leading/trailing whitespace.
    const primaryAnalyzedLine = rawInputContent.split(/\r?\n/)[0].trim();

    // If the extracted line is empty after trimming, it cannot be formed by any words.
    if (primaryAnalyzedLine.length === 0) {
        console.log(NEGATIVE_RESULT_MESSAGE);
        return;
    }

    // Invert the primary target line according to the problem's specific requirement.
    const invertedTargetSequence = performStringInversion(primaryAnalyzedLine);
    const totalTargetSequenceLength = invertedTargetSequence.length; // Cache length for performance.

    // --- Vocabulary Preparation ---
    // The foundational set of words that are permitted to form the input string.
    // Using Object.freeze() ensures that this array remains immutable during execution.
    const baseVocabularyTerms = Object.freeze(['dream', 'dreamer', 'erase', 'eraser']);

    // Pre-calculate the inverted versions of all vocabulary terms.
    // This avoids redundant string inversions within the main matching loop.
    const invertedVocabularyPatterns = baseVocabularyTerms.map(performStringInversion);

    // --- Greedy Pattern Matching Algorithm ---
    let currentScanPosition = 0; // Pointer to the current position in the `invertedTargetSequence`.
    let isConstructionPossible = true; // Flag to track the overall success of the construction.
    let matchAttemptCounter = 0; // An auxiliary counter to monitor loop iterations.

    // The main loop continues as long as there's still part of the target sequence left
    // to match and the construction has not yet been deemed impossible.
    while (currentScanPosition < totalTargetSequenceLength && isConstructionPossible) {
        matchAttemptCounter++; // Increment the counter for each major step.
        let identifiedMatchingPattern = null; // Stores the specific pattern found at `currentScanPosition`.

        // Iterate through all known inverted vocabulary patterns.
        // This explicitly replaces the `.find()` method for a structural change.
        for (const individualPattern of invertedVocabularyPatterns) {
            // Extract the segment of the target sequence starting from the `currentScanPosition`.
            const segmentToExamine = invertedTargetSequence.substring(currentScanPosition);
            // Check if this segment begins with the `individualPattern`.
            if (segmentToExamine.startsWith(individualPattern)) {
                identifiedMatchingPattern = individualPattern; // A match is found.
                break; // Exit the inner loop as we've found the first possible match.
            }
        }

        // If no pattern from the vocabulary could be matched at the current position,
        // then the entire string cannot be constructed.
        if (identifiedMatchingPattern === null) {
            isConstructionPossible = false; // Set flag to terminate the outer loop.
        } else {
            // If a pattern was successfully matched, advance the scan position
            // by the length of the matched pattern.
            currentScanPosition += identifiedMatchingPattern.length;
        }
    }

    // --- Final Outcome Determination and Output ---
    // The input string can be constructed if:
    // 1. The entire `invertedTargetSequence` has been consumed (`currentScanPosition` reached `totalTargetSequenceLength`).
    // 2. No point in the process indicated that construction was impossible (`isConstructionPossible` remains true).
    if (isConstructionPossible && currentScanPosition === totalTargetSequenceLength) {
        console.log(POSITIVE_RESULT_MESSAGE);
    } else {
        console.log(NEGATIVE_RESULT_MESSAGE);
    }
}

/**
 * Serves as the program's entry point.
 * It handles reading input from standard input and orchestrates the analysis.
 */
function initiateExecution() {
    try {
        const fileSystemModule = require('fs'); // Dynamically import the filesystem module.
        const standardInputFile = '/dev/stdin';
        const textEncoding = 'utf8';

        // Synchronously read the complete contents of the standard input file.
        const fileDataContents = fileSystemModule.readFileSync(standardInputFile, textEncoding);

        // Pass the read content to the main processing function.
        processTextualComposition(fileDataContents);
    } catch (fileReadError) {
        // Catch and report any errors that occur during file reading (e.g., file not found, permission issues).
        console.error(`An I/O operation error occurred during input reading: ${fileReadError.message}`);
        console.log(NEGATIVE_RESULT_MESSAGE); // Output failure due to an operational problem.
    }
}

// Execute the program's main entry point.
initiateExecution();