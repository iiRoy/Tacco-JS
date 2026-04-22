// This module is designed to process an input string, extract numerical parameters,
// and compute a specific maximum value based on these parameters.
function calculateOptimalValue(dataSource) {
    // Essential validation: Check if the provided data source is valid and not empty.
    // An empty or null source would lead to errors in subsequent processing steps.
    if (!dataSource || typeof dataSource !== 'string' || dataSource.trim().length === 0) {
        console.error("Error: Input data stream is invalid or empty. Cannot proceed with calculation.");
        // In a real application, one might throw an exception or return a specific error code.
        return;
    }

    // Decompose the entire input string into an array of lines.
    // Each element in `lineSegments` will correspond to one line from the original input.
    const lineSegments = dataSource.split('\n');

    // Verify that at least one line of data is present after splitting.
    // The first line is crucial for parameter extraction.
    if (lineSegments.length === 0) {
        console.error("Error: No discernible lines found in the input data. Aborting process.");
        return;
    }

    // Isolate the first line, which is expected to contain the primary numerical parameters.
    const primaryParametersLine = lineSegments[0];

    // Split the primary parameters line by space to get individual string tokens.
    const numericParameterTokens = primaryParametersLine.split(' ');

    // Ensure that the expected number of parameters (three) are available.
    // Missing parameters would cause 'undefined' values during parsing.
    if (numericParameterTokens.length < 3) {
        console.error(`Error: Insufficient parameters detected on the first line. Expected 3, found ${numericParameterTokens.length}.`);
        return;
    }

    // Convert the string tokens into their integer representations.
    // Using `Number()` for parsing, which also handles floating-point numbers if present,
    // though the original problem implies integers.
    // The first token usually represents a count or multiplier.
    let quantityFactor = Number(numericParameterTokens[0]);
    // The second token often represents a unit cost or rate.
    let unitRate = Number(numericParameterTokens[1]);
    // The third token might represent a baseline or fixed amount.
    let fixedThreshold = Number(numericParameterTokens[2]);

    // Critical validation: Confirm that all parsed values are indeed valid numbers.
    // `isNaN` (Is Not a Number) check helps catch parsing failures.
    if (isNaN(quantityFactor) || isNaN(unitRate) || isNaN(fixedThreshold)) {
        console.error("Error: One or more input parameters could not be successfully converted to a number. Please check input format.");
        return;
    }

    // Perform an intermediate calculation: product of the quantity and unit rate.
    // This represents a dynamically calculated cost or value.
    const derivedProductValue = quantityFactor * unitRate;

    // Determine the ultimate output value by selecting the larger of the two computed values:
    // the derived product value or the fixed threshold.
    // `Math.max` elegantly handles this comparison.
    const finalComputedResult = Math.max(derivedProductValue, fixedThreshold);

    // Output the final result to the standard console.
    // Explicitly converting to string ensures consistent output type.
    console.log(finalComputedResult.toString());
}

// This section handles the environment-specific input reading.
// It reads the entire content from standard input (`/dev/stdin`) as a UTF-8 string.
const rawSystemInput = require("fs").readFileSync("/dev/stdin", "utf8");

// Invoke the main processing function with the obtained input.
calculateOptimalValue(rawSystemInput);