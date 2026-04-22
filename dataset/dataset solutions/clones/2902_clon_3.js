/**
 * Executes a specific arithmetic operation based on provided string input.
 * This function processes a string containing two space-separated numeric values,
 * performs a calculation, and returns the final integer result.
 * @param {string} rawInputStr The raw string input, e.g., "5 10".
 * @returns {number} The computed integer result. Returns NaN if input is invalid or parsing fails.
 */
function calculateTransformedValue(rawInputStr) {
    // --- Input parsing and validation ---

    // Ensure the input string is valid before proceeding.
    if (typeof rawInputStr !== 'string' || rawInputStr.trim() === '') {
        console.error("Invalid input: Expected a non-empty string for processing.");
        return NaN;
    }

    // Split the input string into constituent parts, filtering out any empty tokens
    // that might arise from multiple spaces or leading/trailing whitespace after trim.
    const inputTokens = rawInputStr.trim().split(/\s+/).filter(Boolean);

    // Validate that exactly two numeric tokens were successfully extracted.
    if (inputTokens.length !== 2) {
        console.error(`Input format error: Expected exactly 2 numerical components, but detected ${inputTokens.length}.`);
        return NaN;
    }

    // --- Data type conversion and validation ---

    // Convert the first token to a numerical operand using the unary plus operator,
    // which is a concise way to perform type coercion to number.
    const firstNumericVal = +inputTokens[0];
    // Convert the second token to a numerical operand.
    const secondNumericVal = +inputTokens[1];

    // Check if the conversions resulted in valid numbers. If either is NaN,
    // it indicates a parsing failure for a non-numeric string.
    if (isNaN(firstNumericVal) || isNaN(secondNumericVal)) {
        console.error("Parsing error: One or both input parts could not be converted to valid numbers.");
        return NaN;
    }

    // --- Core calculation logic ---

    // Introduce an intermediate step for the tripled value of the first operand.
    // This multiplication is rewritten as repeated addition for a structural change.
    const tripledFirstVal = firstNumericVal + firstNumericVal + firstNumericVal;

    // Calculate the sum of the tripled first value and the second value,
    // storing it in another intermediate variable.
    const numeratorSum = tripledFirstVal + secondNumericVal;

    // Perform the division by two.
    // Using a bitwise right shift (>>) which effectively performs integer division
    // and floors the result for positive numbers, thus mimicking Math.floor for this specific division.
    const finalComputedValue = numeratorSum >> 1;

    // Return the final integer result of the computation.
    return finalComputedValue;
}

// --- Main execution block for reading input and displaying output ---

try {
    // Attempt to read the entire content of standard input synchronously.
    // The 'fs' module is used for file system operations, including stdin.
    // Ensure UTF-8 encoding for correct string interpretation.
    const stdInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

    // Invoke the primary calculation function with the obtained input string.
    const processedResult = calculateTransformedValue(stdInputContent);

    // Output the result to the console, but only if the calculation yielded a valid number.
    // Error messages for invalid inputs would have already been printed by the function itself.
    if (!isNaN(processedResult)) {
        console.log(processedResult);
    } else {
        // If the result is NaN, it implies a preceding error.
        // We can optionally add a final generic failure message here or just exit.
        // console.error("Execution terminated due to a prior calculation failure.");
        process.exit(1); // Exit with a non-zero status code to indicate an error.
    }
} catch (executionError) {
    // Catch any unexpected errors that might occur during file reading
    // or other operations outside the `calculateTransformedValue` function.
    console.error("An unexpected runtime error occurred:", executionError.message);
    process.exit(1); // Exit with an error code.
}