/**
 * This module provides a function to analyze a numerical sequence
 * from a string input and determine a specific operational symbol.
 * It identifies if the sum or product of two numbers equals 15.
 */

/**
 * Processes a raw input string containing two space-separated numbers.
 * It determines if their sum or product matches a predefined target value (15).
 *
 * @param {string} rawInputSequence - The string expected to contain two numbers separated by a space.
 * @returns {string} The symbol indicating the relationship:
 *                   - "+" if the sum is 15.
 *                   - "*" if the product is 15 (overrides "+" if both are true).
 *                   - "x" if neither condition is met, or if input is invalid.
 */
function EvaluateNumericPair(rawInputSequence) {
    // Initialize the symbol that will be returned.
    // By default, it indicates no specific condition has been met.
    let outcomeSymbol = "x";

    // Step 1: Prepare the input string by trimming whitespace and splitting it.
    // The filter(Boolean) removes any empty strings that might result from multiple spaces.
    const components = rawInputSequence.trim().split(" ").filter(Boolean);

    // Step 2: Validate the structure of the parsed components.
    // We strictly expect exactly two numerical values.
    if (components.length !== 2) {
        // If the input structure is incorrect, the default 'x' symbol remains.
        // In a production system, more detailed error logging or specific error return might be used.
        // console.warn("Input format error: Expected exactly two numeric components.");
        return outcomeSymbol; // Early exit with default symbol.
    }

    // Step 3: Convert the string components into integer numerical values.
    // Using parseInt with radix 10 ensures explicit base-10 conversion.
    const firstOperand = parseInt(components[0], 10);
    const secondOperand = parseInt(components[1], 10);

    // Step 4: Validate if the parsed components are actual numbers.
    // This guard prevents calculations with NaN values.
    if (isNaN(firstOperand) || isNaN(secondOperand)) {
        // If either operand is not a number, the default 'x' symbol remains.
        // console.warn("Data type error: One or both input components are not valid numbers.");
        return outcomeSymbol; // Early exit with default symbol.
    }

    // Step 5: Perform the required arithmetic operations.
    const sumResult = firstOperand + secondOperand;
    const productResult = firstOperand * secondOperand;

    // Step 6: Apply the conditional logic to determine the output symbol.
    // The order of these checks is important as the product condition can override the sum condition.
    const targetValue = 15; // Define the target value as a constant for clarity.

    if (sumResult === targetValue) {
        outcomeSymbol = "+"; // Set symbol if sum matches.
    }

    if (productResult === targetValue) {
        outcomeSymbol = "*"; // Set symbol if product matches (this will override '+' if both are true).
    }

    // Step 7: Return the final determined symbol.
    return outcomeSymbol;
}

/**
 * A utility function to output the final result to the console.
 * @param {string} resultSymbol - The symbol to be displayed.
 */
function EmitCalculatedResult(resultSymbol) {
    console.log(resultSymbol);
}

// --- Application Entry Point ---
// This block handles reading input from the environment and orchestrating the processing.
try {
    // Dynamically load the file system module.
    const fileSystemAccess = require("fs");

    // Read the entire content from standard input synchronously.
    // The encoding is specified as UTF-8.
    const stdinContent = fileSystemAccess.readFileSync("/dev/stdin", "utf8");

    // Pass the raw input string to our core processing function.
    const finalDeterminedSymbol = EvaluateNumericPair(stdinContent);

    // Display the outcome symbol to the standard output.
    EmitCalculatedResult(finalDeterminedSymbol);

} catch (executionError) {
    // Catch and handle any errors that occur during file reading or processing.
    // For robust applications, error handling would be more sophisticated.
    console.error("An unexpected error occurred during execution:", executionError.message);
    // In case of an error, output the default 'x' symbol as a fallback.
    EmitCalculatedResult("x");
}