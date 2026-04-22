// This JavaScript module is designed to solve a grid-related problem,
// specifically calculating the number of "inner" cells or points
// within a conceptual grid of two given dimensions, after applying
// a specific removal rule for outer layers.
// It aims to provide a more structured and robust implementation
// compared to a highly condensed original, while maintaining identical
// core functionality for valid inputs.

/**
 * Orchestrates the process of reading grid dimensions from a string input,
 * performing the required calculation, and outputting the result.
 * This function serves as the primary entry point for the problem solution.
 *
 * @param {string} rawInputContent - A string expected to contain two positive integers,
 *                                   separated by a single space (e.g., "7 12").
 *                                   Any leading or trailing whitespace will be trimmed.
 * @returns {void} - The calculated integer result is printed to standard output.
 *                   Error messages or a default value (0) are printed for invalid inputs.
 */
function solveGridCellCount(rawInputContent) {
    // --- Phase 1: Input Preparation and Validation ---

    // Ensure the input string is clean by removing any extraneous whitespace
    // from the beginning or end.
    const cleanedInputString = rawInputContent.trim();

    // Split the cleaned string into its constituent parts based on the space delimiter.
    // This is expected to yield an array of two string-encoded numbers.
    const dimensionTokens = cleanedInputString.split(" ");

    // Critical validation: Check if exactly two dimension tokens were provided.
    // If not, the input is malformed, and we cannot proceed meaningfully.
    if (dimensionTokens.length !== 2) {
        // Log an error to standard error for diagnostic purposes.
        console.error("Input format error: Expected two space-separated values.");
        // Output a default result (e.g., 0) for malformed inputs and terminate.
        console.log(0);
        return;
    }

    // Convert the string tokens into their numerical (integer) representations.
    // Using `parseInt` with radix 10 ensures correct base conversion.
    const firstGridDimension = parseInt(dimensionTokens[0], 10);
    const secondGridDimension = parseInt(dimensionTokens[1], 10);

    // Further validation: Ensure both parsed dimensions are valid positive integers.
    // `isNaN` checks for non-numeric conversion, and `firstGridDimension < 1`
    // ensures dimensions are appropriate for a grid problem (typically >= 1).
    if (isNaN(firstGridDimension) || isNaN(secondGridDimension) ||
        firstGridDimension < 1 || secondGridDimension < 1) {
        console.error(`Input data error: Dimensions must be positive integers. Received: ${dimensionTokens[0]}, ${dimensionTokens[1]}`);
        console.log(0); // Output 0 for invalid numerical inputs.
        return;
    }

    // --- Phase 2: Core Calculation Logic ---

    let computedResult; // This variable will store the final calculated value.

    // Determine if either of the grid dimensions is equal to 1.
    // This condition defines a special case for the calculation.
    const isAnyDimensionOne = (firstGridDimension === 1 || secondGridDimension === 1);

    if (isAnyDimensionOne) {
        // Scenario A: At least one dimension is 1 (e.g., a 1xN or Nx1 "line" grid).

        // Sub-scenario A.1: Both dimensions are 1 (a 1x1 grid).
        // In this specific case, there are no "inner" points after removing borders.
        if (firstGridDimension === 1 && secondGridDimension === 1) {
            computedResult = 0;
        } else {
            // Sub-scenario A.2: Only one dimension is 1 (e.g., 1x5 or 7x1).
            // The calculation involves taking the larger of the two dimensions
            // and subtracting two (representing the removal of two "endpoints").
            const largerDimensionValue = Math.max(firstGridDimension, secondGridDimension);
            computedResult = largerDimensionValue - 2;

            // Ensure the result is never negative, as a count of cells cannot be negative.
            // If the larger dimension was 1 or 2 (e.g., 1x1, 1x2, 2x1, 2x2), this ensures 0.
            if (computedResult < 0) {
                computedResult = 0;
            }
        }
    } else {
        // Scenario B: Neither dimension is 1 (i.e., both are 2 or greater).
        // This is the general case for a 2D grid where an inner rectangle's area is calculated.
        // The formula is effectively (rows - 2) * (cols - 2), representing
        // the remaining dimensions after removing a 1-unit border on all sides.

        const reducedRows = firstGridDimension - 2;
        const reducedCols = secondGridDimension - 2;

        // Apply `Math.max(0, ...)` to ensure that if a dimension is exactly 2,
        // its reduced value becomes 0, not a negative number, correctly yielding 0 for the product.
        computedResult = Math.max(0, reducedRows) * Math.max(0, reducedCols);
    }

    // --- Phase 3: Output Result ---

    // Print the final calculated integer value to standard output.
    console.log(computedResult);
}

// --- Application Entry Point ---
// This block handles the execution flow when the script is run.
// It reads input from standard input, typically used in competitive programming environments.
try {
    // Utilize Node.js's file system module to synchronously read
    // all data from the standard input stream (`/dev/stdin`).
    // The input is expected to be UTF-8 encoded.
    const systemStandardInput = require("fs").readFileSync("/dev/stdin", "utf8");

    // Invoke the main processing function with the obtained system input.
    solveGridCellCount(systemStandardInput);
} catch (executionError) {
    // Catch and report any exceptions that might occur during input reading
    // or initial processing, providing a fallback default output.
    console.error("An unexpected runtime error occurred:", executionError.message);
    console.log(0); // Output 0 as a safe default in case of critical errors.
}