// This module is responsible for handling all file system-related operations within the application.
const sysFileHandler = require('node:fs');

// Defines the standard input stream path, a common convention for reading input in Unix-like systems.
// This path is typically used in competitive programming contexts to read user or test case input.
const standardInputSource = '/dev/stdin';

// Specifies the character encoding to be used when reading data from the input source.
// 'utf8' is a widely used and robust encoding for text data.
const textEncoding = 'utf8';

// A constant string containing all lowercase English vowels. This serves as the reference set
// for determining if an input character is a vowel.
const baseVowelSet = "aeiou";

/**
 * Safely reads a single character from the predefined standard input stream.
 * This function incorporates error handling and performs initial validation and processing
 * to ensure that a meaningful single character is returned.
 *
 * @returns {string} The first character of the input (converted to lowercase),
 *                   or a special indicator "NON_ALPHABETIC_INPUT" if the character
 *                   is not an English alphabet, or an empty string if no valid
 *                   input could be read or processed.
 */
function acquireInputCharacter() {
    let rawDataStream; // Variable to hold the raw content read from the input source.

    try {
        // Attempt to synchronously read the entire content from the standard input source.
        // If the file does not exist or permissions are insufficient, an error will be thrown.
        rawDataStream = sysFileHandler.readFileSync(standardInputSource, textEncoding);
    } catch (dataReadError) {
        // If an error occurs during the file reading process, log the error message for debugging.
        console.error("Failed to retrieve data from standard input stream:", dataReadError.message);
        // In such cases, return an empty string to indicate a failure to acquire valid input.
        return '';
    }

    // Perform initial validation on the acquired data.
    // Check if the data is actually a string and if it contains any content.
    if (typeof rawDataStream !== 'string' || rawDataStream.length === 0) {
        // If the input is not a string or is empty, there's no character to process.
        return '';
    }

    // Trim any leading or trailing whitespace characters from the raw input and
    // convert the entire string to lowercase to ensure case-insensitive processing.
    const processedData = rawDataStream.trim().toLowerCase();

    // After trimming, re-check if any content remains.
    if (processedData.length === 0) {
        // If the input was only whitespace or became empty after trimming, return empty.
        return '';
    }

    // Extract only the very first character from the processed input string.
    // This assumes the problem expects a single character analysis.
    const singleChar = processedData.charAt(0);

    // Add a specific validation step: check if the extracted character is an English alphabet.
    // The original problem context implies single alphabetic characters.
    if (!/[a-z]/.test(singleChar)) {
        // If the character is not an alphabet (e.g., a digit, symbol, or other non-alphabetic char),
        // return a distinct string to indicate this special input type.
        return "NON_ALPHABETIC_INPUT";
    }

    // If all checks pass, return the valid, single, lowercase alphabetic character.
    return singleChar;
}

/**
 * Classifies a given input character as either a "vowel", "consonant", or "non-alphabetic".
 * This function handles special indicator strings passed from the input acquisition step.
 *
 * @param {string} inputChar The character (or special indicator string) to be classified.
 * @returns {string} One of "vowel", "consonant", or "non-alphabetic".
 */
function classifyInputCharacter(inputChar) {
    // Introduce a guard clause to handle special input indicators or empty input from `acquireInputCharacter`.
    if (inputChar === "NON_ALPHABETIC_INPUT" || inputChar === '') {
        // If the input is identified as non-alphabetic or empty, classify it as such.
        return "non-alphabetic";
    }

    // Determine if the input character is present within the predefined set of vowels.
    // Using `indexOf() !== -1` is an equivalent and common alternative to `includes()`.
    const isPresentInVowels = baseVowelSet.indexOf(inputChar) !== -1;

    let characterCategoryLabel; // Variable to store the final classification label.

    // Replace the original ternary operator with an explicit if-else block.
    // This provides a more verbose and structurally different way to express the conditional logic.
    if (isPresentInVowels) {
        characterCategoryLabel = "vowel";
    } else {
        // If the character is an alphabetic character but not found in the vowel set,
        // it is by definition classified as a consonant.
        characterCategoryLabel = "consonant";
    }

    // Return the determined classification.
    return characterCategoryLabel;
}

// --- Main Program Execution Flow ---

// Step 1: Acquire the single character input from the standard stream.
// This call encapsulates the reading, error handling, and initial processing.
const receivedSingleCharacter = acquireInputCharacter();

// Step 2: Classify the acquired character based on whether it's a vowel, consonant,
// or a special non-alphabetic input.
const finalCharacterClassification = classifyInputCharacter(receivedSingleCharacter);

// Step 3: Output the final determined classification to the console.
// This is the program's final action, presenting the result to the user.
console.log(finalCharacterClassification);