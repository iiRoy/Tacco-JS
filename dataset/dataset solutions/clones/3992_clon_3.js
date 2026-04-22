/**
 * This module is designed to process spatial configuration data from standard input.
 * Its primary function is to calculate the total count of specific cells within a grid,
 * considering certain boundary conditions and potential large number results.
 */

/**
 * Orchestrates the processing of raw input data to determine the final cell count.
 * It handles parsing, validation, core calculation, and formatting of the output.
 *
 * @param {string} rawInputData - The complete input string, typically read from `stdin`.
 */
function processInputData(rawInputData) {
    // Define a constant representing the offset for boundary conditions.
    const BOUNDARY_OFFSET = 2;
    // Define a threshold for large numbers. Results exceeding this value will be
    // formatted as a string to maintain precision beyond standard JavaScript Number limits.
    const LARGE_NUMBER_THRESHOLD = 1_000_000_000_000_000; // Represents 10^15

    // --- Input Validation and Parsing ---

    // Guard clause: Check if the input data is empty or only contains whitespace.
    if (!rawInputData || rawInputData.trim().length === 0) {
        console.error("Error: Input data is empty or consists solely of whitespace. Cannot process.");
        return; // Terminate execution for invalid input.
    }

    // Split the input into an array of lines, first trimming any leading/trailing whitespace
    // from the entire input string to prevent issues with empty lines.
    const dataLines = rawInputData.trim().split('\n');

    // Guard clause: Ensure at least one line of configuration is available.
    if (dataLines.length === 0) {
        console.error("Error: No configuration lines were found in the provided input.");
        return;
    }

    // The first line is expected to contain the two dimension parameters.
    // Split this line by spaces to get the individual dimension strings.
    const dimensionStrings = dataLines[0].split(' ');

    // Guard clause: Verify that two dimension parameters are present.
    if (dimensionStrings.length < 2) {
        console.error("Error: Insufficient dimension parameters. Expected two values.");
        return;
    }

    // Parse the dimension strings into integer values. Using radix 10 for explicit decimal conversion.
    const firstDimensionSize = parseInt(dimensionStrings[0], 10);
    const secondDimensionSize = parseInt(dimensionStrings[1], 10);

    // Guard clause: Validate that the parsed dimensions are actual numbers.
    if (isNaN(firstDimensionSize) || isNaN(secondDimensionSize)) {
        console.error("Error: One or both dimension values are invalid (not a number).");
        return;
    }

    // --- Core Calculation Logic ---

    // Calculate the 'adjusted' dimensions by subtracting the boundary offset.
    // These adjusted values can be negative, zero, or positive, mirroring the original problem's intent
    // for `(N-2)` and `(M-2)`.
    const adjustedFirstDim = firstDimensionSize - BOUNDARY_OFFSET;
    const adjustedSecondDim = secondDimensionSize - BOUNDARY_OFFSET;

    // Compute the raw product of the adjusted dimensions.
    const rawProductResult = adjustedFirstDim * adjustedSecondDim;

    // The final cell count is the absolute value of this product.
    let finalCalculatedCellCount = Math.abs(rawProductResult);

    let formattedOutputString; // This variable will hold the final string representation.

    // --- Large Number Handling and Output Formatting ---

    // If the calculated cell count exceeds the large number threshold,
    // a special string-based multiplication approach is used to preserve precision.
    if (finalCalculatedCellCount > LARGE_NUMBER_THRESHOLD) {
        // Define an internal helper function for performing string-based multiplication of large numbers.
        // This simulates multiplication by splitting one factor into parts.
        const computeLargeProductString = (factorA, factorB, splitBase) => {
            // Work with absolute values to align with the `Math.abs` applied earlier.
            const absFactorA = Math.abs(factorA);
            const absFactorB = Math.abs(factorB);

            // Split the first factor into a 'high' part and a 'low' part using the specified base.
            const factorAHighComponent = Math.floor(absFactorA / splitBase);
            const factorALowComponent = absFactorA % splitBase;

            // Calculate the product contribution from the low part of factorA.
            const lowPartProductSegment = factorALowComponent * absFactorB;

            // Calculate the high part of the overall product. This includes the product of
            // factorA's high component and factorB, plus any carry-over from the low part's product.
            const highPartProductComponent = factorAHighComponent * absFactorB + Math.floor(lowPartProductSegment / splitBase);

            // Format the low part of the result. It needs to be padded with leading zeros
            // to ensure it always occupies the correct number of digits relative to the split base.
            // Example: if splitBase=10000, pad to 4 digits.
            const lowPartFormatted = String(lowPartProductSegment % splitBase).padStart(String(splitBase - 1).length, '0');

            // Concatenate the high and formatted low parts to form the complete string representation.
            return String(highPartProductComponent) + lowPartFormatted;
        };

        // Use a base of 10000 for splitting the numbers, offering a different approach than 1000.
        const NUMERIC_SPLIT_BASE = 10000;
        formattedOutputString = computeLargeProductString(adjustedFirstDim, adjustedSecondDim, NUMERIC_SPLIT_BASE);

        // Edge case: If the true result is 0, the string multiplication might produce "0000".
        // Normalize this to "0" for cleaner output.
        if (finalCalculatedCellCount === 0) {
            formattedOutputString = "0";
        }

    } else {
        // If the number is within standard JavaScript Number limits, directly convert it to a string.
        formattedOutputString = String(finalCalculatedCellCount);
    }

    // Output the final computed result to the console.
    console.log(formattedOutputString);
}


// --- DO NOT MODIFY THE CODE BELOW THIS LINE ---
// This section is responsible for reading input from standard input (stdin)
// and invoking the main processing function. It is standard boilerplate for
// competitive programming environments.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));