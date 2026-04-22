'use strict';

/**
 * A utility function designed to synchronously read the entire content
 * of a file from the specified path, decoding it as UTF-8.
 * This abstracts the file system interaction from the core logic.
 *
 * @param {string} sourcePath - The absolute or relative path to the file.
 * @returns {string} The full content of the file as a single string.
 */
const acquireTextualContent = (sourcePath) => {
    // Leverage the Node.js built-in 'fs' module for file system operations.
    // readFileSync is used for synchronous file reading, suitable for competitive programming contexts.
    return require("fs").readFileSync(sourcePath, "utf8");
};

/**
 * Analyzes an input string to determine if a specific character-chaining pattern exists
 * among three space-separated words on the first line.
 *
 * The pattern requires:
 * 1. The final character of the first word must match the initial character of the second word.
 * 2. The final character of the second word must match the initial character of the third word.
 *
 * @param {string} rawPayload - The complete raw input data, potentially spanning multiple lines.
 * @returns {string} "YES" if the pattern is successfully identified, otherwise "NO".
 */
function evaluateWordLinkage(rawPayload) {
    // Break down the raw input into individual lines.
    const inputLineCollection = rawPayload.split('\n');

    // Perform an initial validation: check if there's any usable input line.
    // If the input is empty or the first line is blank, the pattern cannot be formed.
    if (inputLineCollection.length === 0 || inputLineCollection[0].trim().length === 0) {
        return "NO";
    }

    // Focus solely on the first non-empty line provided by the input.
    const primaryInputLine = inputLineCollection[0].trim();

    // Divide the primary input line into its constituent word tokens using space as a delimiter.
    const wordTokens = primaryInputLine.split(' ');

    // Validate the number of tokens. Exactly three words are required for the pattern.
    if (wordTokens.length !== 3) {
        return "NO"; // Incorrect number of words implies the pattern cannot be satisfied.
    }

    // Use array destructuring to assign the tokens to descriptive variable names.
    const [alphaWord, betaWord, gammaWord] = wordTokens;

    // Further validation: ensure that none of the extracted words are empty strings.
    // Operations like charAt() or accessing length-1 would fail or yield unexpected results on empty strings.
    if (alphaWord.length === 0 || betaWord.length === 0 || gammaWord.length === 0) {
        return "NO";
    }

    // Extract the specific characters needed for the comparison.
    // Using charAt() for direct character access, which is explicit.
    const charFromAlphaEnd = alphaWord.charAt(alphaWord.length - 1);
    const charFromBetaStart = betaWord.charAt(0);
    const charFromBetaEnd = betaWord.charAt(betaWord.length - 1);
    const charFromGammaStart = gammaWord.charAt(0);

    // Evaluate the first linking condition.
    // Comparing character codes is an alternative to direct string comparison for single characters,
    // offering a different implementation approach while being functionally equivalent for this use case.
    const firstLinkIsValid = (charFromAlphaEnd.charCodeAt(0) === charFromBetaStart.charCodeAt(0));

    // Evaluate the second linking condition.
    const secondLinkIsValid = (charFromBetaEnd.charCodeAt(0) === charFromGammaStart.charCodeAt(0));

    // Determine the final outcome based on both conditions.
    // Using nested conditional logic instead of a single logical AND operator
    // to demonstrate an alternative control flow structure.
    let finalResultLabel;
    if (firstLinkIsValid) {
        if (secondLinkIsValid) {
            finalResultLabel = "YES"; // Both conditions are met, indicating a valid chain.
        } else {
            finalResultLabel = "NO";  // First condition met, but the second failed.
        }
    } else {
        finalResultLabel = "NO";      // The very first condition was not met.
    }

    // Return the computed result string.
    return finalResultLabel;
}

// Define a constant for the standard input file path, enhancing maintainability.
const STANDARD_INPUT_FILE_PATH = "/dev/stdin";

// Initiate the process:
// 1. Acquire the raw input content from the standard input source.
// 2. Pass the raw content to the core evaluation function.
// 3. Print the final determination to the console.
console.log(evaluateWordLinkage(acquireTextualContent(STANDARD_INPUT_FILE_PATH)));