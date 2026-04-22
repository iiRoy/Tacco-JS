const initialPayload = "3\n101 9901 999999000001";

/**
 * Processes a string containing numerical data to calculate the product of
 * a sequence of numbers, with an upper limit check.
 * If the product exceeds a predefined threshold, a specific error value is returned.
 *
 * @param {string} sourceInputData - The raw input string, expected to have numbers on the second line.
 * @returns {void} Outputs the calculated product or an error indicator to the console.
 */
function computeLimitedProduct(sourceInputData) {
    // Define the maximum allowed product value as a BigInt.
    // This constant helps in preventing overflows and provides a clear threshold.
    const PRODUCT_UPPER_BOUND = 10n ** 18n;

    // Split the entire input string into individual lines.
    const dataLines = sourceInputData.split('\n');

    // --- Input Validation and Guard Clauses ---

    // Ensure there are at least two lines of data as per expected format.
    if (dataLines.length < 2) {
        console.error("Input format invalid: Expected a minimum of two lines of data.");
        // In a production scenario, one might throw an exception or return a specific error code.
        return; // Terminate execution for invalid input structure.
    }

    // Extract the second line, which is expected to contain the numbers.
    const numberSequenceString = dataLines[1];

    // If the second line is empty or contains only whitespace, there are no numbers to multiply.
    // In this case, the product is conventionally considered zero.
    if (!numberSequenceString.trim()) {
        console.log(0);
        return;
    }

    // Split the number string by spaces and filter out any empty strings that
    // might result from multiple consecutive spaces.
    const individualNumberTokens = numberSequenceString.split(' ').filter(token => token.trim() !== '');

    // If no valid number tokens are found after splitting and filtering.
    if (individualNumberTokens.length === 0) {
        console.log(0); // Product of an empty set of numbers is zero by convention or error.
        return;
    }

    // --- Product Calculation Using BigInt and Early Overflow Detection ---

    // The `reduce` method is used to cumulatively multiply the numbers.
    // It starts with the first number as the initial accumulator.
    let resultantProduct = individualNumberTokens.reduce((currentAccumulator, currentNumericToken) => {
        // If an overflow was detected in a previous step, propagate the error value (-1n)
        // to avoid further unnecessary computations.
        if (currentAccumulator === -1n) {
            return -1n;
        }

        let currentBigIntFactor;
        try {
            // Attempt to convert the string token to a BigInt.
            currentBigIntFactor = BigInt(currentNumericToken);
        } catch (conversionError) {
            // If conversion fails (e.g., non-numeric string), treat this as an error
            // and set the accumulator to the overflow indicator.
            console.error(`Data conversion error: Could not parse '${currentNumericToken}' into a BigInt. Message: ${conversionError.message}`);
            return -1n; // Indicate an error state.
        }

        // Calculate the potential product with the current factor.
        const intermediateProduct = currentAccumulator * currentBigIntFactor;

        // Check if the intermediate product has exceeded the defined upper bound.
        // If it has, set the accumulator to the overflow indicator (-1n)
        // to signal that the limit has been surpassed.
        if (intermediateProduct > PRODUCT_UPPER_BOUND) {
            return -1n; // Signal an overflow.
        }

        // If no overflow, continue with the new accumulated product.
        return intermediateProduct;
    }, BigInt(individualNumberTokens[0])); // Initialize the accumulator with the first number as BigInt.

    // --- Final Result Output ---

    // Based on the final accumulated product, determine the output.
    if (resultantProduct === -1n) {
        console.log(-1); // Output -1 if an overflow or error occurred.
    } else {
        // Output the valid product. Explicitly convert BigInt to string for robust console display.
        console.log(String(resultantProduct));
    }
}

// Initiate the product calculation process with the defined input payload.
computeLimitedProduct(initialPayload);