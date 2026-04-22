'use strict';

/**
 * Processes a sequence of number transformations and dynamically calculates the aggregate sum.
 *
 * The expected input structure is line-based:
 * - Line 1: An integer representing N (initial count of numbers), which is not used in the logic.
 * - Line 2: A space-separated list of initial numbers (A_i).
 * - Line 3: An integer representing Q (number of queries), also not used.
 * - Subsequent lines (Q of them): Two space-separated integers B_j and C_j, representing a transformation.
 *
 * For each transformation (B_j, C_j), all occurrences of B_j are replaced by C_j,
 * and the updated total sum of all numbers is printed.
 *
 * @param {string} rawInput The complete raw input string, typically read from standard input.
 */
function processInputData(rawInput) {
    // A utility function to safely convert string parts to BigInt.
    // Handles potential empty strings, though problem constraints usually guarantee valid numbers.
    const parseNumericValue = (str) => {
        if (!str || str.trim() === '') {
            return 0n; // Return 0n for empty/invalid string, or throw an error.
        }
        return BigInt(str);
    };

    // Split the entire input string into an array of individual lines.
    const inputLineSegments = rawInput.trim().split('\n');

    // --- Input Parsing Phase ---
    // The first line (N) and third line (Q) are part of the input specification
    // but their values are not directly used in this implementation's core logic.
    // We can simply acknowledge their presence by skipping their indices.
    // const initialElementCount = Number(inputLineSegments[0]); // Value of N, currently unutilized.
    // const queryOperationCount = Number(inputLineSegments[2]); // Value of Q, currently unutilized.

    // Parse the second line, containing the initial set of numbers.
    // We convert each string number to a BigInt. Sorting is not required for frequency mapping.
    const startingNumberSeries = inputLineSegments[1].split(' ').map(parseNumericValue);

    // Parse all transformation pairs from the fourth line onwards.
    // Each line contains two numbers: the 'old' value and the 'new' value.
    const valueTransformationPairs = inputLineSegments.slice(3).map(line => {
        const components = line.split(' ');
        // Basic validation: ensure each line for a transformation has exactly two numbers.
        if (components.length !== 2) {
            // In a production system, this might throw an error or log a warning.
            // For competitive programming, input format is usually guaranteed.
            return [0n, 0n];
        }
        return [parseNumericValue(components[0]), parseNumericValue(components[1])];
    });

    // --- Data Structure Initialization ---
    // Define the maximum possible value an element can take, used for array sizing.
    // This constant reflects the problem's constraints (e.g., max value up to 100,000).
    const MAX_POSSIBLE_VALUE_INDEX = 100001;

    // Create a frequency map (an array acting as a hash map) to store counts of each number.
    // Initialize all counts to 0n (BigInt zero). Using BigInt to prevent overflow for large sums.
    let numberFrequencyMap = new Array(MAX_POSSIBLE_VALUE_INDEX).fill(0n);

    // Populate the frequency map based on the initial series of numbers.
    for (const currentNumber of startingNumberSeries) {
        // Add a guard clause for out-of-bounds values, though constraints usually prevent this.
        if (currentNumber >= 0n && currentNumber < MAX_POSSIBLE_VALUE_INDEX) {
            numberFrequencyMap[currentNumber] += 1n;
        } else {
            // console.warn(`Initial number ${currentNumber} is outside the expected range.`);
        }
    }

    // --- Initial Aggregate Sum Calculation ---
    // Calculate the starting total sum of all numbers, where each number contributes
    // its value multiplied by its frequency.
    let currentTotalAggregateSum = 0n;

    // Rewriting the original `reduce` operation as a standard `for` loop for structural variation.
    for (let valueIndex = 0; valueIndex < MAX_POSSIBLE_VALUE_INDEX; valueIndex++) {
        const frequencyAtValue = numberFrequencyMap[valueIndex];
        // Optimization: Only add to sum if the value exists (frequency is non-zero).
        if (frequencyAtValue > 0n) {
            currentTotalAggregateSum += frequencyAtValue * BigInt(valueIndex);
        }
    }

    // --- Process Each Transformation Query ---
    // Iterate through each (old value, new value) pair provided in the input queries.
    for (const [oldValToReplace, newValToSubstitute] of valueTransformationPairs) {
        // Get the current count of the value that needs to be replaced.
        const existingCountOfOldValue = numberFrequencyMap[oldValToReplace];

        // Guard clause: If the old value doesn't exist (its count is zero),
        // this transformation has no effect on the sum or frequencies.
        // We still need to print the current sum for consistency with problem output.
        if (existingCountOfOldValue === 0n) {
            console.log(currentTotalAggregateSum.toString());
            continue; // Move to the next query.
        }

        // Calculate the difference in value that each replaced number contributes.
        const individualValueDifference = newValToSubstitute - oldValToReplace;

        // Calculate the total change in the aggregate sum due to this transformation.
        // The sum changes by (new value - old value) multiplied by how many times the old value appears.
        const totalSumChange = individualValueDifference * existingCountOfOldValue;

        // Update the main aggregate sum.
        currentTotalAggregateSum += totalSumChange;

        // Output the updated aggregate sum.
        // BigInts require explicit `.toString()` when used with `console.log` for reliable output.
        console.log(currentTotalAggregateSum.toString());

        // Update the frequency map to reflect the transformation:
        // 1. Add the count of the 'old' value to the 'new' value's count.
        numberFrequencyMap[newValToSubstitute] += existingCountOfOldValue;
        // 2. Set the count of the 'old' value to zero, as all instances have been replaced.
        numberFrequencyMap[oldValToReplace] = 0n;
    }

    // The function primarily performs side effects (printing to console), so no explicit return value is critical.
    return;
}

// --- Program Entry Point ---
// This immediately invoked function expression (IIFE) serves as the main execution block.
// It handles reading input from stdin and passing it to the core processing function.
(() => {
    try {
        // Read all input data from the standard input stream, typically `/dev/stdin` in competitive programming.
        const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
        // Call the main function to process the input.
        processInputData(standardInputContent);
    } catch (executionError) {
        // Basic error handling for file reading or processing issues.
        // In competitive programming, often unhandled, but good practice for robustness.
        // console.error("An error occurred during input processing:", executionError);
        // Depending on requirements, might exit with an error code or print a specific message.
    }
})();