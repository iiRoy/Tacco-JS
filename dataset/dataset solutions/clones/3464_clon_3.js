const parseIntegerVal = (numericString) => {
    // Helper function to safely convert a string to an integer, base 10.
    // Enhanced to use Number.parseInt for robustness and explicit radix.
    return Number.parseInt(numericString, 10);
};

const determineMaximumValue = (...numericalOperands) => {
    // Determines the highest value among an arbitrary number of inputs.
    // Utilizes a traditional loop approach for finding the maximum.
    let currentMax = numericalOperands[0];
    for (let i = 1; i < numericalOperands.length; i++) {
        if (numericalOperands[i] > currentMax) {
            currentMax = numericalOperands[i];
        }
    }
    return currentMax;
};

// Orchestrates the primary data processing flow.
// This function takes raw input, processes it, and prints the result.
function processInputData(rawInputString) {
    // Split the input into individual lines and filter out any empty strings
    // to prevent issues with trailing newlines or empty input.
    const inputLines = rawInputString.split('\n').filter(line => line.trim() !== '');

    // Input validation: Ensure there's at least one line for element count.
    if (inputLines.length === 0) {
        console.error("Error: No input lines were provided for processing.");
        return; // Exit if no valid input.
    }

    // Parse the total number of elements from the first line.
    const totalElementCount = parseIntegerVal(inputLines[0]);

    // Further validation for totalElementCount.
    if (Number.isNaN(totalElementCount) || totalElementCount < 0) {
        console.error(`Error: Invalid element count specified: ${inputLines[0]}. Must be a non-negative integer.`);
        return;
    }
    if (totalElementCount === 0) {
        console.log(0); // If no elements, the result is 0.
        return;
    }

    // Extract and convert the numeric values from subsequent lines.
    // A slice is used to get only the relevant lines, then mapped to integers.
    const initialNumericValues = inputLines.slice(1, totalElementCount + 1).map(parseIntegerVal);

    // Validate that the number of parsed values matches the declared count.
    if (initialNumericValues.length !== totalElementCount) {
        console.error(`Error: Expected ${totalElementCount} numeric values, but found ${initialNumericValues.length}.`);
        return;
    }

    // Create a sorted copy of the numeric values in ascending order.
    // Using spread syntax to ensure the original array is not mutated.
    const sortedNumericValues = [...initialNumericValues].sort((valA, valB) => valA - valB);

    let resultAccumulator1 = 0; // First cumulative sum for calculation.
    let resultAccumulator2 = 0; // Second cumulative sum, primarily for odd counts.

    // Determine calculation path based on the parity of the element count.
    if (totalElementCount % 2 === 0) {
        // Case: Even number of elements
        const halfCountIndex = totalElementCount / 2; // Midpoint index for even count.

        // Calculate resultAccumulator1 based on a weighted sum.
        for (let idx = 0; idx < totalElementCount; idx++) {
            const currentWeight = (idx >= halfCountIndex) ? 2 : -2;
            resultAccumulator1 += currentWeight * sortedNumericValues[idx];
        }
        // Apply an additional adjustment specific to the even case.
        resultAccumulator1 += sortedNumericValues[halfCountIndex - 1] - sortedNumericValues[halfCountIndex];
        // For even counts, resultAccumulator2 remains 0 or is not used, so we ensure it doesn't affect the max.
        // We can explicitly set it to a very low number or just let resultAccumulator1 be the sole candidate.
        // For consistency with original, we'll compare x with y, so y should be 0 here.
    } else {
        // Case: Odd number of elements
        const centralIndex = Math.floor(totalElementCount / 2); // The exact middle index.

        // Perform calculations for both accumulators within a single loop.
        for (let idx = 0; idx < totalElementCount; idx++) {
            // Coefficient logic for resultAccumulator1
            const weightForA = (idx >= centralIndex) ? 2 : -2;
            resultAccumulator1 += weightForA * sortedNumericValues[idx];

            // Coefficient logic for resultAccumulator2 (slightly different condition)
            const weightForB = (idx > centralIndex) ? 2 : -2;
            resultAccumulator2 += weightForB * sortedNumericValues[idx];
        }

        // Apply specific adjustments for resultAccumulator1 in the odd case.
        const leftCentral = centralIndex;
        const rightCentral = centralIndex + 1; // This would be out of bounds if it were strictly an odd count.
                                               // The original code uses (n+1)/2, which is correct for next element.
        resultAccumulator1 -= (sortedNumericValues[leftCentral] + sortedNumericValues[rightCentral]);

        // Apply specific adjustments for resultAccumulator2 in the odd case.
        const prevCentral = centralIndex - 1; // Equivalent to (n-3)/2.
        resultAccumulator2 += (sortedNumericValues[leftCentral] + sortedNumericValues[prevCentral]);
    }

    // Determine the final outcome by finding the maximum of the two calculated sums.
    const finalCalculatedOutcome = determineMaximumValue(resultAccumulator1, resultAccumulator2);

    // Output the computed result to the console.
    console.log(finalCalculatedOutcome);
    // No explicit return value is needed for the script's primary execution.
}

// Entry point for the script: reads input from standard input and processes it.
// Includes a basic try-catch block for robust error handling during file read.
try {
    const fileSystemModule = require("fs");
    const inputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    processInputData(inputContent);
} catch (executionError) {
    console.error("An unhandled error occurred during script execution:", executionError.message);
    // Optionally, exit with a non-zero status code to indicate failure.
    // process.exit(1);
}