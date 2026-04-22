// This module is responsible for processing a string input
// which contains two space-separated numerical values representing
// electrical resistances, and then calculating their equivalent
// resistance when connected in a parallel configuration.

/**
 * Computes the equivalent resistance of two resistors connected in parallel.
 * The input is expected to be a string containing two space-separated
 * numeric values. Robust error handling and validation are included.
 *
 * @param {string} sourceText - The raw input string containing two resistance values.
 * @returns {number} The calculated equivalent parallel resistance, or NaN if any error occurs.
 */
function determineParallelResistance(sourceText) {
    // Step 1: Input validation - Basic checks for null, type, and emptiness.
    if (typeof sourceText !== 'string' || sourceText === null || sourceText.trim().length === 0) {
        console.error("Runtime Error: Provided input is not a valid non-empty string.");
        return Number.NaN;
    }

    // Step 2: Tokenize the input string based on a space delimiter.
    // Ensure to trim whitespace before splitting to handle leading/trailing spaces.
    const valueTokens = sourceText.trim().split(" ");

    // Step 3: Validate the number of tokens. We expect exactly two.
    if (valueTokens.length !== 2) {
        console.error("Input Parsing Error: Expected two numerical resistance values, but found " + valueTokens.length + " tokens.");
        return Number.NaN;
    }

    // Step 4: Parse the individual string tokens into numeric types.
    // Using the unary plus operator is a concise way to convert to number,
    // similar to parseFloat but more strict regarding non-numeric characters.
    const componentR1 = +valueTokens[0];
    const componentR2 = +valueTokens[1];

    // Step 5: Validate that both parsed components are indeed valid numbers.
    if (Number.isNaN(componentR1) || Number.isNaN(componentR2)) {
        console.error("Data Conversion Error: One or both input tokens could not be converted to valid numbers. R1: '" + valueTokens[0] + "', R2: '" + valueTokens[1] + "'");
        return Number.NaN;
    }

    // Step 6: Apply a domain-specific validation: resistances are typically positive.
    // If non-positive values are encountered, issue a warning but proceed with calculation.
    if (componentR1 <= 0 || componentR2 <= 0) {
        console.warn("Semantic Warning: Non-positive resistance value(s) detected. Standard circuit models typically use positive resistances.");
    }

    // Step 7: Calculate the sum of the two resistance components.
    const sumOfComponents = componentR1 + componentR2;

    // Step 8: Guard against division by zero in the parallel resistance formula.
    // If the sum is zero, the formula (R1*R2)/(R1+R2) would fail.
    if (sumOfComponents === 0) {
        console.error("Calculation Logic Error: Sum of resistances is zero, which would lead to division by zero in parallel resistance formula.");
        return Number.NaN;
    }

    // Step 9: Calculate the product of the two resistance components.
    const productOfComponents = componentR1 * componentR2;

    // Step 10: Compute the final equivalent parallel resistance.
    // Using the formula R_eq = (R1 * R2) / (R1 + R2), which is
    // algebraically equivalent to 1 / (1/R1 + 1/R2).
    const finalParallelResult = productOfComponents / sumOfComponents;

    // Return the computed resistance.
    return finalParallelResult;
}

// This immediately invoked function expression (IIFE) handles the main
// execution flow of the script, including reading from standard input
// and displaying the output.
(function applicationEntryPoint() {
    // Define the standard input file path for convenience.
    const standardInputPath = "/dev/stdin";

    // Obtain the built-in Node.js 'fs' (file system) module.
    const fileSystemHandler = require("fs");

    // Read the entire content of the standard input file.
    // The 'utf8' encoding is specified for proper character interpretation.
    const rawSystemInput = fileSystemHandler.readFileSync(standardInputPath, "utf8");

    // Invoke our primary resistance calculation function with the raw input.
    const calculatedOutcome = determineParallelResistance(rawSystemInput);

    // Conditional output: only print the result if it's a valid number.
    // Otherwise, an error would have already been logged by the function.
    if (!Number.isNaN(calculatedOutcome)) {
        console.log(calculatedOutcome);
    } else {
        // A generic error message for cases where the specific error
        // might not have been caught or logged by the function itself.
        console.error("Processing could not be completed successfully.");
    }
})();