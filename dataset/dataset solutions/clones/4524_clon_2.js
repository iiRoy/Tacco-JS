"use strict"; // Enforce strict mode for cleaner code execution.

/**
 * Processes the provided raw input string to determine if a specific condition is met.
 * This function expects a string that can be converted into a number.
 *
 * @param {string} rawDataString - The raw input string, typically read from standard input.
 */
function processInputData(rawDataString) {

    // First, remove all whitespace characters from the input string.
    // Then, convert the cleaned string into a numerical value.
    // This ensures that only the digits are considered for the numeric operation.
    let processedNumericValue = Number(rawDataString.replace(/\s/g, ''));

    // Evaluate if the resulting numeric value is perfectly divisible by 4.
    // The modulo operator (%) returns the remainder of a division.
    // If the remainder is 0, it means the number is divisible by 4.
    const outcomeResult = (processedNumericValue % 4 === 0) ? 'YES' : 'NO';

    // Output the determined result string ('YES' or 'NO') to the console.
    // This is the final observable behavior of the function.
    console.log(outcomeResult);

}

// This line reads the entire content of standard input synchronously.
// It uses Node.js's 'fs' module to read from '/dev/stdin' (common for competitive programming).
// The content is then decoded as a 'utf8' string and passed to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
