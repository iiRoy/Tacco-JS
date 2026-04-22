// This function serves as the primary entry point for processing the raw text input.
function processInputData(sourcePayload) {
    // Perform initial validation: ensure the input is a non-empty string.
    if (typeof sourcePayload !== 'string' || sourcePayload.trim() === '') {
        console.error("Error: The provided input payload is either empty or not a string.");
        return; // Exit early if input is invalid.
    }

    // Split the entire input string into an array of individual lines.
    const inputLines = sourcePayload.split('\n');

    // Validate that there are at least two lines for configuration and data.
    const MIN_REQUIRED_LINES = 2;
    if (inputLines.length < MIN_REQUIRED_LINES) {
        console.error(`Error: Expected at least ${MIN_REQUIRED_LINES} input lines, but received ${inputLines.length}.`);
        return; // Exit if input is insufficient.
    }

    // Parse the first line to extract key configuration parameters.
    // This line typically contains two space-separated integers.
    const dimensionTokens = inputLines[0].split(' ')
                                         .map(token => parseInt(token.trim(), 10));

    // Validate the parsed dimension tokens.
    // Ensure both tokens are valid numbers and present.
    if (dimensionTokens.some(isNaN) || dimensionTokens.length < MIN_REQUIRED_LINES) {
        console.error("Error: Failed to correctly parse numeric dimensions from the first line.");
        return;
    }

    const totalElements = dimensionTokens[0]; // Represents the 'n' value from the original problem.
    const exclusionThreshold = dimensionTokens[1]; // Represents the 'k' value from the original problem.

    // Extract the second line which contains the actual data values.
    const dataValueString = inputLines[1];

    // Convert the space-separated data string into an array of integers.
    // Filter out any empty strings that might result from multiple spaces.
    const numericValues = dataValueString.split(' ')
                                         .filter(s => s.trim() !== '')
                                         .map(s => parseInt(s.trim(), 10));

    // Validate the parsed numeric data:
    // Check if any parsed value is NaN or if the count of values doesn't match 'totalElements'.
    if (numericValues.some(isNaN) || numericValues.length !== totalElements) {
        console.error("Error: Data integrity issue detected. Expected number of elements mismatch or invalid numeric data found.");
        return; // Abort processing due to data inconsistency.
    }

    let accumulatedSum = 0; // Initialize a variable to store the final calculated sum.

    // --- Conditional Logic for Summation based on 'totalElements' and 'exclusionThreshold' ---

    // Case 1: If the total number of elements is less than or equal to the threshold, the result is zero.
    if (totalElements <= exclusionThreshold) {
        console.log("0");
    }
    // Case 2: If the exclusion threshold is exactly zero, sum all available numeric elements.
    else if (exclusionThreshold === 0) {
        // Iterate through all numeric values and add them to the accumulated sum.
        // This addresses a potential bug in the original code's loop variable usage.
        for (let currentIdx = 0; currentIdx < numericValues.length; currentIdx++) {
            accumulatedSum += numericValues[currentIdx];
        }
        // Output the total sum using a template literal for clarity.
        console.log(`${accumulatedSum}`);
    }
    // Case 3: When totalElements is greater than exclusionThreshold, and exclusionThreshold is positive.
    else {
        // Sort the array of numeric values in descending order.
        // This places the largest numbers at the beginning of the array.
        numericValues.sort((a, b) => b - a);

        // Sum the elements starting from the 'exclusionThreshold' index up to the end of the array.
        // This effectively sums the smallest (totalElements - exclusionThreshold) values
        // after the array has been sorted from largest to smallest.
        // The original `console.log('%d', k);` was removed as it was non-functional.
        for (let iterationIndex = exclusionThreshold; iterationIndex < totalElements; iterationIndex++) {
            accumulatedSum += numericValues[iterationIndex];
        }
        // Display the final computed sum.
        console.log(`${accumulatedSum}`);
    }
}

// Do not modify the line below this comment. It handles standard input/output.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));