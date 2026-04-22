/**
 * This module provides functionality to process a raw input string,
 * extract a numerical value from it, and determine if that value
 * is perfectly divisible by a predefined integer.
 * It's designed for simple command-line numerical evaluation.
 */

// Import the Node.js file system module for reading standard input.
const fileSystemModule = require('fs');

/**
 * Executes the primary logic of the application. It takes a raw string input,
 * processes it to derive a number, and then checks if this number is
 * divisible by a specific constant value (currently 4).
 * The result ("YES" or "NO") is printed to the console.
 *
 * @param {string} rawInputContent - The complete string read from the input source.
 *                                  It is expected to contain numeric characters,
 *                                  potentially separated by whitespace.
 * @returns {void} This function does not return a value; it prints directly to stdout.
 */
function processAndEvaluateNumericString(rawInputContent) {
    // Define constants for the divisibility check and output messages.
    // Using constants enhances readability and makes future modifications easier.
    const TARGET_DIVISOR = 4;
    const SUCCESS_MESSAGE = "YES";
    const FAILURE_MESSAGE = "NO";
    const LINE_TERMINATOR = "\n"; // Standard newline character

    // Step 1: Normalize and segment the input string.
    // First, remove any leading or trailing whitespace from the input line.
    // Then, split the cleaned string into an array of substrings (tokens)
    // using one or more whitespace characters as delimiters. This handles
    // varied spacing, e.g., "  1  2 3   " becomes ["1", "2", "3"].
    const stringTokens = rawInputContent
                            .trim()
                            .split(/\s+/);

    // Step 2: Reconstruct a single numeric string from the tokens.
    // Join all the string tokens together without any separators.
    // For example, ["1", "2", "3"] becomes "123". This effectively
    // consolidates a potentially space-separated number into a single string.
    const consolidatedNumericString = stringTokens.join('');

    // Step 3: Convert the consolidated string into a numerical data type.
    // The `Number()` constructor is used for a direct conversion.
    // It's generally more robust than `parseInt()` for full string-to-number conversion.
    const resultingNumericValue = Number(consolidatedNumericString);

    // Initialize a variable to hold the final output message.
    let finalOutputVerdict;

    // Step 4: Validate the parsed number and perform the divisibility check.
    // A Type III addition: Check if the string actually parsed into a valid number.
    // If `isNaN` (Not-a-Number), it means the input was not purely numeric.
    if (isNaN(resultingNumericValue)) {
        // If the value is not a number, it cannot be divisible by 4.
        finalOutputVerdict = FAILURE_MESSAGE;
    } else {
        // If it's a valid number, proceed with the divisibility check.
        // This logic is encapsulated in a separate helper function for modularity.
        if (isNumberDivisibleBy(resultingNumericValue, TARGET_DIVISOR)) {
            finalOutputVerdict = SUCCESS_MESSAGE;
        } else {
            finalOutputVerdict = FAILURE_MESSAGE;
        }
    }

    // Step 5: Output the determined verdict to the standard console.
    // Using a template literal for cleaner string concatenation.
    console.log(`${finalOutputVerdict}${LINE_TERMINATOR}`);
}

/**
 * A private helper function to perform the actual divisibility calculation.
 * This abstracts the core mathematical operation.
 *
 * @param {number} dividend - The number to be checked for divisibility.
 * @param {number} divisor - The number by which to divide the dividend.
 * @returns {boolean} - Returns `true` if `dividend` is perfectly divisible by `divisor`
 *                      (i.e., the remainder is zero), otherwise returns `false`.
 */
function isNumberDivisibleBy(dividend, divisor) {
    // The modulo operator (%) returns the remainder of the division.
    // If the remainder is exactly 0, the dividend is perfectly divisible.
    return (dividend % divisor === 0);
}


// --- Application Entry Point ---
// This block handles reading the input from the system's standard input stream.
// A try-catch block is used to gracefully manage potential errors during file
// reading operations, which is a Type III addition for robustness.
try {
    // Read the entire content of the standard input file synchronously.
    // '/dev/stdin' is the conventional path for standard input on Unix-like systems.
    // 'utf8' specifies the character encoding for the input.
    const inputBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

    // Once the input is successfully read, pass it to the main processing function.
    processAndEvaluateNumericString(inputBuffer);

} catch (inputReadError) {
    // If an error occurs during the file reading process (e.g., file not found,
    // permission issues), log the error to the standard error stream.
    console.error("An error occurred while attempting to read input:", inputReadError.message);
    // In a real-world scenario, you might want to exit the process with an
    // error code here (e.g., `process.exit(1);`).
}