"use strict";

const fileStreamUtils = require("fs");

// Utility to safely convert a string to an integer, providing a fallback.
const convertToInteger = (textValue, fallback = 0) => {
    const num = parseInt(textValue, 10);
    return isNaN(num) ? fallback : num;
};

// Obtains raw input from standard input and cleans it.
const acquireCleanInputData = () => {
    try {
        const rawBuffer = fileStreamUtils.readFileSync('/dev/stdin', 'utf8');
        return rawBuffer.trimEnd(); // Removes trailing newlines or spaces.
    } catch (inputError) {
        console.error("Failed to read from standard input:", inputError.message);
        return ""; // Return an empty string on error to prevent crashes.
    }
};

// Computes the sum of all elements in a given numeric array.
const calculateVectorSum = (numericVector) => {
    let totalAccumulator = 0;
    for (const elementValue of numericVector) {
        totalAccumulator += elementValue;
    }
    return totalAccumulator;
};

// --- Main processing logic ---

// Fetch and split the entire input into individual lines.
const systemInputLines = acquireCleanInputData().split('\n');

// Ensure sufficient input is present for processing.
if (systemInputLines.length < 4) {
    console.error("Insufficient input lines. At least 4 lines are required for operation.");
    process.exit(1);
}

// Initialize the primary data array from the second line of input.
const mutableDataSeries = systemInputLines[1].split(" ").map(s => convertToInteger(s));

// Container for the final computed sums.
const aggregatedSums = [];

// Iterate through the instruction lines, starting from the fourth line.
systemInputLines.slice(3).forEach(instructionSegment => {
    // Parse the current instruction into its components.
    const parts = instructionSegment.split(" ");
    if (parts.length !== 2) {
        console.warn(`Skipping malformed instruction: "${instructionSegment}"`);
        return; // Skip this instruction and proceed to the next.
    }

    const targetIndexOneBased = convertToInteger(parts[0]);
    const replacementNumber = convertToInteger(parts[1]);

    // Validate the target index to prevent out-of-bounds access.
    if (targetIndexOneBased < 1 || targetIndexOneBased > mutableDataSeries.length) {
        console.warn(`Invalid index ${targetIndexOneBased} specified for instruction: "${instructionSegment}". Skipping.`);
        return;
    }

    const actualIndexZeroBased = targetIndexOneBased - 1;

    // Preserve the original value before temporary modification.
    const originalValueAtPosition = mutableDataSeries[actualIndexZeroBased];

    // Apply the temporary modification.
    mutableDataSeries[actualIndexZeroBased] = replacementNumber;

    // Calculate the sum with the temporary change.
    const currentTotalForIteration = calculateVectorSum(mutableDataSeries);

    // Restore the original value to revert the temporary change.
    mutableDataSeries[actualIndexZeroBased] = originalValueAtPosition;

    // Store the calculated sum.
    aggregatedSums.push(currentTotalForIteration);
});

// Output the final list of calculated sums.
console.log(aggregatedSums);