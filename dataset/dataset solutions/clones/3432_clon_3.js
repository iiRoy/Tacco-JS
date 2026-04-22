/*
 * This module processes a numerical input to count "Shichi-Go-San" numbers.
 * A Shichi-Go-San number is defined as a positive integer that consists
 * exclusively of the digits 3, 5, and 7, and contains at least one of each digit.
 * The counting is performed for all such numbers up to a specified upper limit.
 *
 * Extensive modifications have been applied to the original code,
 * including renaming identifiers, altering data types for consistency,
 * refactoring logic, adding new helper constants and error handling,
 * and generally restructuring for improved readability and robustness.
 */

// Define the required digits as a constant array for easy reference and modification.
const MANDATORY_DIGITS = ['3', '5', '7'];

/**
 * Main function to orchestrate the input processing and number counting.
 * It takes raw text input, parses it, and then initiates the recursive search.
 * @param {string} sourceText - The raw input string, expected to be a number.
 */
function processInputData(sourceText) {
    // Remove leading/trailing whitespace from the input string.
    const trimmedInput = sourceText.trim();

    // Attempt to parse the cleaned input string into an integer.
    // Using parseInt with radix 10 ensures correct parsing.
    const numericalLimit = parseInt(trimmedInput, 10);

    // --- Type III: Add guard clauses and validation ---
    // Validate the parsed input to ensure it's a valid non-negative number.
    if (isNaN(numericalLimit) || numericalLimit < 0) {
        console.error("Error: Provided input is not a valid non-negative number.");
        return; // Exit if input is invalid.
    }

    /**
     * Helper function to determine if a given number string contains all mandatory digits.
     * This replaces the original `check` function with a more descriptive name and modern string methods.
     * @param {string} candidateNumberString - The string representation of the number to check.
     * @returns {boolean} - True if all mandatory digits are present, false otherwise.
     */
    const verifyDigitsPresence = (candidateNumberString) => {
        // --- Type II: Change string operations from `~indexOf` to `includes` ---
        // --- Type III: Introduce intermediate variables for clarity ---
        const hasDigitThree = candidateNumberString.includes(MANDATORY_DIGITS[0]); // Checks for '3'
        const hasDigitFive = candidateNumberString.includes(MANDATORY_DIGITS[1]);  // Checks for '5'
        const hasDigitSeven = candidateNumberString.includes(MANDATORY_DIGITS[2]); // Checks for '7'

        // All three digits must be present for a number to be valid.
        return hasDigitThree && hasDigitFive && hasDigitSeven;
    };

    /**
     * A recursive depth-first search function to generate numbers using only 3, 5, 7
     * and count those that meet the Shichi-Go-San criteria and are within the limit.
     * This replaces the original `dfs` function with a more descriptive name
     * and ensures consistent string handling for number generation.
     * @param {string} currentNumBeingBuilt - The string representation of the number currently being constructed.
     * @returns {number} - The total count of valid Shichi-Go-San numbers found in this branch.
     */
    const recursivelyCountShichiGoSan = (currentNumBeingBuilt) => {
        // --- Type II/III: Consistent data type handling ---
        // Convert the string representation to a numerical value for comparison.
        const currentNumericalValue = Number(currentNumBeingBuilt);

        // --- Type III: Early exit/guard clause for numbers exceeding the limit ---
        // If the current number already surpasses the numerical limit,
        // no further valid numbers can be formed from this path, so return 0.
        if (currentNumericalValue > numericalLimit) {
            return 0;
        }

        let branchValidCount = 0; // Initialize a counter for this recursive branch.

        // --- Type III: Conditional check for empty string ---
        // Only check for Shichi-Go-San validity if a number has actually been formed (i.e., not an empty string).
        // If it's a non-empty string and meets the digit presence criteria, increment the count.
        if (currentNumBeingBuilt !== '' && verifyDigitsPresence(currentNumBeingBuilt)) {
            branchValidCount = 1;
        }

        // --- Type III: Refactor recursive calls ---
        // Recursively explore new numbers by appending each of the mandatory digits.
        // The recursion continues as long as the current number does not exceed the limit.
        // The check `currentNumericalValue <= numericalLimit` is implicitly handled
        // by the early exit at the top of the function for `currentNumericalValue > numericalLimit`.
        // We always try to append, and the next call will filter it out if too large.
        branchValidCount += recursivelyCountShichiGoSan(currentNumBeingBuilt + MANDATORY_DIGITS[0]); // Append '3'
        branchValidCount += recursivelyCountShichiGoSan(currentNumBeingBuilt + MANDATORY_DIGITS[1]); // Append '5'
        branchValidCount += recursivelyCountShichiGoSan(currentNumBeingBuilt + MANDATORY_DIGITS[2]); // Append '7'

        return branchValidCount; // Return the accumulated count for this branch.
    };

    // --- Type III: Introduce a variable for the final tally ---
    // Start the recursive process with an empty string, representing the initial state
    // before any digits have been appended.
    const finalShichiGoSanTally = recursivelyCountShichiGoSan('');

    // Output the total count to the console.
    console.log(finalShichiGoSanTally);
}

// --- Type II/III: Refactor input reading and add error handling ---
// Use a different variable name for the file system module.
const fileSystemHandler = require('fs');
// Define a constant for the standard input path to improve readability.
const standardInputFilePath = '/dev/stdin';

try {
    // Read the content of the standard input file synchronously.
    // Explicitly specify UTF-8 encoding for consistent string handling.
    const fileContents = fileSystemHandler.readFileSync(standardInputFilePath, { encoding: 'utf8' });

    // Invoke the main processing function with the read file content.
    processInputData(fileContents);
} catch (fileReadError) {
    // --- Type III: Add robust error handling for file operations ---
    // If an error occurs during file reading, log an informative message.
    console.error(`An error occurred while attempting to read from ${standardInputFilePath}:`, fileReadError.message);
    // Optionally, exit the process with an error code.
    // process.exit(1);
}