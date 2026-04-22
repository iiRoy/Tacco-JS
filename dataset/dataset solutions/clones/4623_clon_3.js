'use strict';

/**
 * Executes a character-by-character comparison of two numerical strings.
 * This approach is essential for handling numbers that exceed standard integer
 * or floating-point precision limits in JavaScript, treating them as sequences of digits.
 *
 * @param {string} firstNumericalString - The first number represented as a string.
 * @param {string} secondNumericalString - The second number represented as a string.
 * @returns {string} One of 'GREATER', 'LESS', or 'EQUAL' indicating the comparison outcome.
 */
function compareLargeNumbers(firstNumericalString, secondNumericalString) {
    const comparisonResultGreater = 'GREATER';
    const comparisonResultLesser = 'LESS';
    const comparisonResultEqual = 'EQUAL';

    // Early exit: If the strings are identical, they are equal.
    if (firstNumericalString === secondNumericalString) {
        return comparisonResultEqual;
    }

    const lengthOfFirst = firstNumericalString.length;
    const lengthOfSecond = secondNumericalString.length;

    // The primary comparison rule for large numbers: length.
    // A longer number (assuming no leading zeros, which is typical for such problems)
    // is greater than a shorter number.
    if (lengthOfFirst > lengthOfSecond) {
        return comparisonResultGreater;
    } else if (lengthOfFirst < lengthOfSecond) {
        return comparisonResultLesser;
    } else {
        // If the lengths are identical, a digit-by-digit comparison from left to right is required.
        for (let currentDigitIndex = 0; currentDigitIndex < lengthOfFirst; ++currentDigitIndex) {
            // Convert character digits to numbers for direct comparison.
            const digitFromFirst = parseInt(firstNumericalString[currentDigitIndex], 10);
            const digitFromSecond = parseInt(secondNumericalString[currentDigitIndex], 10);

            // The first differing digit determines the overall magnitude.
            if (digitFromFirst > digitFromSecond) {
                return comparisonResultGreater;
            } else if (digitFromFirst < digitFromSecond) {
                return comparisonResultLesser;
            }
            // If digits are equal, continue to the next position.
        }
        // If the loop completes without finding any differing digits, it means
        // the numbers are identical, which should have been caught by the initial `===` check.
        // This return acts as a logical fallback if that initial check were absent.
        return comparisonResultEqual;
    }
}

/**
 * Main entry point for processing raw input containing two large numbers.
 * It parses the input, validates its structure, and orchestrates the comparison.
 *
 * @param {string} rawDataContent - The raw input string, expected to contain two numbers separated by newlines.
 */
function processNumericalStrings(rawDataContent) {
    // Clean and split the input into individual lines.
    // .trim() handles potential leading/trailing whitespace or newlines.
    const inputLines = rawDataContent.trim().split('\n');

    // Input validation: Ensure the expected number of lines (two numerical strings) is present.
    if (inputLines.length !== 2) {
        console.error("Input processing error: Expected exactly two lines of numerical data, but received " + inputLines.length + " lines.");
        // In a more robust application, this might throw an exception or return an error code.
        return;
    }

    const firstOperand = inputLines[0];
    const secondOperand = inputLines[1];

    // Delegate the core numerical string comparison to a dedicated function.
    const finalComparisonOutcome = compareLargeNumbers(firstOperand, secondOperand);

    // Output the final result to the console.
    console.log(finalComparisonOutcome);
}

// Standard input handling for competitive programming environments.
// Reads the entire content of /dev/stdin as a UTF-8 string and passes it for processing.
processNumericalStrings(require("fs").readFileSync("/dev/stdin", "utf8"));