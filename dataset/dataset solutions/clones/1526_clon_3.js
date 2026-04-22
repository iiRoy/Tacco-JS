// This module is designed to identify the maximum product obtainable from combining elements of two distinct number pairs.
// It expects a single string input containing four space-separated integers.

/**
 * Calculates the largest possible product by selecting one number from the first pair
 * and one number from the second pair.
 *
 * @param {string} rawInputDataString - A string containing four space-separated numeric values.
 * @returns {number|null} The maximum product found, or null if input is invalid.
 */
function determineGreatestCrossPairProduct(rawInputDataString) {
    // --- Input Validation and Parsing ---
    // Ensure the input is a non-empty string.
    if (typeof rawInputDataString !== 'string' || rawInputDataString.trim().length === 0) {
        console.error("Validation Error: Input must be a non-empty string.");
        return null; // Indicate failure due to invalid input type or emptiness.
    }

    // Split the input string by spaces and attempt to convert each part to a number.
    // The .filter(Number.isFinite) step ensures only valid, finite numbers are processed,
    // effectively discarding any non-numeric or NaN values that might arise from map(Number).
    const numericComponents = rawInputDataString
        .trim() // Remove leading/trailing whitespace for cleaner splitting.
        .split(/\s+/) // Split by one or more whitespace characters.
        .map(Number)
        .filter(Number.isFinite); // Keep only actual finite numbers.

    // A crucial check to confirm we have exactly four valid numeric components.
    if (numericComponents.length !== 4) {
        console.error(`Validation Error: Expected 4 finite numbers, but received ${numericComponents.length}.`);
        return null; // Return null if the input structure is incorrect.
    }

    // --- Variable Assignment for Clarity ---
    // Assign the extracted numbers to descriptive variables for easier understanding.
    // These represent the two pairs: (valueA, valueB) and (valueC, valueD).
    const valueA = numericComponents[0];
    const valueB = numericComponents[1];
    const valueC = numericComponents[2];
    const valueD = numericComponents[3];

    // --- Product Calculation ---
    // Calculate all four possible product combinations between the two pairs.
    // This covers every scenario of picking one element from the first pair
    // and one element from the second pair.
    const productAC = valueA * valueC; // Product of first element of pair 1 and first element of pair 2
    const productAD = valueA * valueD; // Product of first element of pair 1 and second element of pair 2
    const productBC = valueB * valueC; // Product of second element of pair 1 and first element of pair 2
    const productBD = valueB * valueD; // Product of second element of pair 1 and second element of pair 2

    // --- Determine Maximum Product ---
    // Store all computed products in an array.
    const allCalculatedProducts = [productAC, productAD, productBC, productBD];

    // Utilize Math.max to efficiently find the largest value among all calculated products.
    // This is a more direct approach than sorting the array and picking the first element.
    const highestProductOverall = Math.max(...allCalculatedProducts);

    // Return the final result.
    return highestProductOverall;
}

// --- Main Program Execution Block ---
// This immediately invoked function expression (IIFE) handles the program's lifecycle:
// reading input, calling the main logic, and outputting the result or error messages.
(function main() {
    try {
        // Attempt to read input from standard input (e.g., piped data or file redirection).
        // The readFileSync method is synchronous and suitable for simple script execution.
        const stdinContent = require("fs").readFileSync("/dev/stdin", "utf8");

        // Call the primary function to process the input and get the result.
        const finalComputedResult = determineGreatestCrossPairProduct(stdinContent);

        // If a valid result was obtained (i.e., not null due to an error), print it.
        if (finalComputedResult !== null) {
            console.log(finalComputedResult);
        } else {
            // If the function returned null, it indicates an error was already logged internally.
            // We can optionally add a generic error message here or exit.
            // process.exit(1); // Exit with an error code.
        }
    } catch (ioError) {
        // Catch any errors that occur during file reading (e.g., /dev/stdin not available).
        console.error("Runtime Error: Failed to read input from standard input.", ioError.message);
        // process.exit(1); // Exit with an error code.
    }
})();