/**
 * @file This script calculates the maximum possible sum of digits for any number X,
 *       where X is less than or equal to a given input number N.
 *       For example, if N = "123", the maximum sum of digits is for 99 (sum = 18).
 *       If N = "19", the maximum sum of digits is for 19 (sum = 10).
 *       If N = "5", the maximum sum of digits is for 5 (sum = 5).
 *       The logic handles different numerical string patterns to achieve this.
 */

/**
 * Computes the maximal sum of digits for any number less than or equal to the input numerical string.
 * This function handles various cases based on the length and digits of the input.
 *
 * @param {string} numericalString - The input number as a string (e.g., "123", "99").
 * @returns {number} The maximum sum of digits found, or 0 if input is invalid.
 */
function calculateMaximalDigitSum(numericalString) {
    // --- Type III: Added input validation / Guard clause ---
    if (typeof numericalString !== 'string' || numericalString.trim().length === 0 || !/^\d+$/.test(numericalString)) {
        console.error("Processing Error: Input must be a non-empty string containing only digits.");
        return 0; // Return a default value or throw an error for invalid input
    }

    // --- Type II: Renamed variables and reformat whitespace ---
    const numberStringLength = numericalString.length;
    const leadingDigitValue = Number.parseInt(numericalString.charAt(0), 10); // Using charAt for clarity
    const trailingDigitCharacter = numericalString.slice(-1); // Using slice for last character

    let finalComputedSum; // Renamed 'ans'

    // --- Type II: Rewritten comments ---
    // Case 1: If the input number consists of a single digit.
    if (numberStringLength === 1) {
        finalComputedSum = leadingDigitValue;
    }
    // Case 2: If the number has exactly two digits AND the last digit is '9'.
    // This specific condition was originally implicitly handled by a regex match length check.
    // --- Type III: Rewrote existing statements for clarity and efficiency ---
    else if (trailingDigitCharacter === '9' && numberStringLength === 2) {
        // In this scenario (e.g., "19", "29", "99"), the maximal sum is the sum of digits of N itself.
        // It's equivalent to (numberStringLength - 1) * 9 + leadingDigitValue
        finalComputedSum = (numberStringLength - 1) * 9 + leadingDigitValue;
    }
    // Case 3: For all other multi-digit numbers not covered by the above.
    else {
        // The maximal sum is achieved by a number with (leadingDigitValue - 1) followed by
        // (numberStringLength - 1) nines.
        // E.g., for "123", it's sum of digits of "099" (18).
        // E.g., for "20", it's sum of digits of "19" (10).
        // --- Type III: Added intermediate steps and variables for complex expressions (implicit here) ---
        finalComputedSum = (numberStringLength - 1) * 9 + leadingDigitValue - 1;
    }

    return finalComputedSum;
}

/**
 * Helper function to safely read input from stdin.
 * --- Type III: Added new fragment (helper function) ---
 * @returns {string} The trimmed content of stdin, or an empty string on error.
 */
const retrieveInputContent = () => {
    try {
        const fileSystem = require("fs"); // Dynamic import for fs module
        const rawData = fileSystem.readFileSync("/dev/stdin", "utf8");
        return rawData.trim(); // Trim whitespace from the input string
    } catch (errorReading) {
        console.error("Input Acquisition Error: Could not read from /dev/stdin.", errorReading.message);
        return ""; // Return an empty string or handle the error as appropriate
    }
};

// --- Type III: Main execution block with guard clauses and separation of concerns ---
const numberInputString = retrieveInputContent();

if (numberInputString.length > 0) { // Check if input was successfully retrieved
    const finalCalculatedResult = calculateMaximalDigitSum(numberInputString);
    console.log(finalCalculatedResult);
} else {
    // This block executes if input reading failed or returned an empty string.
    console.error("Application halted: No valid numerical input was provided.");
    // Optionally, you could log a default result or exit with an error code.
}