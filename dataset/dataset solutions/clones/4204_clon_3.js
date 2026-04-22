'use strict';

// Defines the standard input stream path commonly used in Unix-like environments.
const STANDARD_INPUT_STREAM_PATH = "/dev/stdin";

/**
 * Ensures the provided data is a string and removes leading/trailing whitespace.
 * Includes a safety check for non-string inputs.
 * @param {any} rawText - The input data, potentially a string.
 * @returns {string} A cleaned string or an empty string if input is invalid.
 */
const prepareTextForAnalysis = (rawText) => {
    // A precautionary measure to handle unexpected data types.
    if (typeof rawText !== 'string') {
        console.warn("Input received was not a string type; treating as empty for analysis.");
        return ''; // Return an empty string if the input isn't a string.
    }
    return rawText.trim(); // Standard whitespace removal.
};

/**
 * Validates if a given string begins with a specific "Akihabara-like" sequence.
 * This function mimics the behavior of a regular expression like /^A?KIHA?BA?RA?/.
 * It checks for optional 'A', followed by mandatory 'K' and 'I', then several optional characters.
 * The pattern does not require the entire string to be consumed; it only checks the prefix.
 * @param {string} targetSequence - The string to be evaluated.
 * @returns {boolean} True if the string starts with the pattern, false otherwise.
 */
const evaluateSequenceCompliance = (targetSequence) => {
    // An immediate exit for empty or null/undefined strings.
    if (!targetSequence || targetSequence.length === 0) {
        return false;
    }

    let currentCursorPosition = 0;
    const totalSequenceLength = targetSequence.length;

    // Phase 1: Check for an optional 'A' at the very beginning.
    if (currentCursorPosition < totalSequenceLength && targetSequence[currentCursorPosition] === 'A') {
        currentCursorPosition++;
    }

    // Phase 2: Mandatorily check for 'K'. If not present, the pattern is broken.
    if (currentCursorPosition < totalSequenceLength && targetSequence[currentCursorPosition] === 'K') {
        currentCursorPosition++;
    } else {
        return false; // 'K' is a required component.
    }

    // Phase 3: Mandatorily check for 'I'. If not present, the pattern is broken.
    if (currentCursorPosition < totalSequenceLength && targetSequence[currentCursorPosition] === 'I') {
        currentCursorPosition++;
    } else {
        return false; // 'I' is a required component.
    }

    // Phase 4: Check for an optional 'H'.
    if (currentCursorPosition < totalSequenceLength && targetSequence[currentCursorPosition] === 'H') {
        currentCursorPosition++;
    }

    // Phase 5: Check for an optional 'B'.
    if (currentCursorPosition < totalSequenceLength && targetSequence[currentCursorPosition] === 'B') {
        currentCursorPosition++;
    }

    // Phase 6: Check for an optional 'A'.
    if (currentCursorPosition < totalSequenceLength && targetSequence[currentCursorPosition] === 'A') {
        currentCursorPosition++;
    }

    // Phase 7: Check for an optional 'R'.
    if (currentCursorPosition < totalSequenceLength && targetSequence[currentCursorPosition] === 'R') {
        currentCursorPosition++;
    }

    // Phase 8: Check for a final optional 'A'.
    if (currentCursorPosition < totalSequenceLength && targetSequence[currentCursorPosition] === 'A') {
        currentCursorPosition++;
    }

    // If execution reaches this point, it means all mandatory characters were found
    // and optional characters were consumed if present. The pattern is considered matched
    // as a prefix, adhering to the original regex's non-anchored end behavior.
    return true;
};

// Main script execution block.
try {
    // Acquire the Node.js file system module.
    const systemFileHandler = require("fs");

    // Read the raw byte data from the standard input path, ensuring UTF-8 decoding.
    let rawIncomingPayload = systemFileHandler.readFileSync(STANDARD_INPUT_STREAM_PATH, "utf8");

    // Cleanse the raw data by trimming any extraneous whitespace.
    const sanitizedInputString = prepareTextForAnalysis(rawIncomingPayload);

    // Execute the pattern evaluation function.
    const isInputPatternDetected = evaluateSequenceCompliance(sanitizedInputString);

    // Formulate the final output message based on the evaluation result.
    const responseMessage = isInputPatternDetected ? "YES" : "NO";

    // Display the outcome to the console.
    console.log(responseMessage);

} catch (operationalError) {
    // Handle any potential errors during file operations or data processing.
    console.error("An error occurred during input acquisition or processing:", operationalError.message);
    // As a fallback, output 'NO' in case of an unhandled error.
    console.log("NO");
}