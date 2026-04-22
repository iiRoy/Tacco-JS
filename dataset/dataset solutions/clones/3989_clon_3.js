// This function serves as the primary entry point for processing raw input data.
function ProcessInput(rawInputString) {
    // The incoming raw string is expected to contain space-separated numerical values.
    // We split this string into an array of individual string segments.
    const numericalSegments = rawInputString.split(" ");

    // It's good practice to ensure we have enough data to proceed.
    // If fewer than two segments are present, we cannot perform the intended calculation.
    if (numericalSegments.length < 2) {
        console.error("Input error: Expected at least two numerical components, but received fewer.");
        return; // Exit early due to malformed input.
    }

    /**
     * Helper function to safely parse a string segment into an integer.
     * Includes basic validation for non-numeric input.
     * @param {string} segment - The string part to parse.
     * @returns {number} The parsed integer, or 0 if parsing fails.
     */
    const convertToInteger = (segment) => {
        // Use an explicit radix for parseInt to avoid unexpected behavior.
        const value = parseInt(segment, 10);
        // If the parsed value is not a number, treat it as 0 to prevent NaN in calculations.
        if (isNaN(value)) {
            console.warn(`Warning: Non-numeric input segment '${segment}' encountered. Treating as 0.`);
            return 0;
        }
        return value;
    };

    /**
     * Core logic function to calculate a specific area-like value based on two dimensions.
     * Each dimension is effectively reduced by two before multiplication.
     * @param {string[]} dimensionStrings - An array containing string representations of two dimensions.
     * @returns {number} The calculated result, or 0 if input dimensions are invalid.
     */
    const computeAdjustedProduct = (dimensionStrings) => {
        // Extract and convert the primary and secondary dimensions from the input array.
        const primaryDimension = convertToInteger(dimensionStrings[0]);
        const secondaryDimension = convertToInteger(dimensionStrings[1]);

        // Calculate the effective dimensions by subtracting 2 from each.
        // We use Math.max(0, ...) to ensure dimensions don't become negative,
        // which would lead to non-sensical negative areas in this context.
        const effectivePrimary = Math.max(0, primaryDimension - 2);
        const effectiveSecondary = Math.max(0, secondaryDimension - 2);

        // Multiply the effective dimensions to get the final area-like value.
        const finalComputedValue = effectivePrimary * effectiveSecondary;
        return finalComputedValue;
    };

    // Execute the core computation using the parsed segments.
    const resultForOutput = computeAdjustedProduct(numericalSegments);

    // Display the final computed result to the standard output.
    console.log(resultForOutput);

    // Note: Any code related to palindrome checks or other unrelated logic
    // found in the original source was deemed unreachable due to an unconditional 'return'
    // and has been intentionally omitted to reflect the actual execution flow.
}

// Boilerplate code for handling standard input/output in a Node.js environment.
// This part typically remains stable across different problem solutions.
// It reads the entire standard input and passes it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));