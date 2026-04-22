// This module processes structured input data to compute and display a specific set of aggregated values.
// The primary goal is to find the largest sums from combinations of three lists,
// constrained by dimension limits and a maximum product threshold.

'use strict'; // Enforce stricter parsing and error handling in the code.

/**
 * Executes the main data processing logic.
 * @param {string} rawInputString - The raw string input containing configuration and data lines.
 */
function processInputData(rawInputString) {
    // Basic validation for input presence
    if (!rawInputString || typeof rawInputString !== 'string') {
        console.error("Error: Input data is missing or invalid.");
        return; // Exit if input is bad
    }

    // Step 1: Normalize and segment the raw input into individual lines.
    const normalizedLines = rawInputString.trim().split('\n');

    // Ensure there are enough lines for configuration and data.
    if (normalizedLines.length < 4) { // At least 1 config line + 3 data lines
        console.error("Error: Insufficient input lines for processing.");
        return;
    }

    // Step 2: Extract configuration parameters from the first line.
    // These parameters define the dimensions for processing and the final result count.
    const dimensionLimitsStr = normalizedLines.shift().split(' ');
    const dimensionParameters = dimensionLimitsStr.map(str => parseInt(str.trim(), 10));

    // Validate configuration parameters
    if (dimensionParameters.length !== 4 || dimensionParameters.some(isNaN)) {
        console.error("Error: Invalid configuration parameters found in the first line.");
        return;
    }

    const maxDimA = dimensionParameters[0]; // Limit for the first data set
    const maxDimB = dimensionParameters[1]; // Limit for the second data set
    const maxDimC = dimensionParameters[2]; // Limit for the third data set
    const resultCountLimit = dimensionParameters[3]; // How many top results to display

    // Step 3: Parse the remaining lines into structured numeric data sets.
    // Each line represents a list of numbers.
    const numericDataSets = normalizedLines.map(lineContent =>
        lineContent.split(' ').map(s => parseInt(s.trim(), 10))
    );

    // Ensure we have exactly three data sets for the triple summation.
    if (numericDataSets.length !== 3) {
        console.error("Error: Expected exactly three data sets for summation, but got " + numericDataSets.length);
        return;
    }

    // Step 4: Sort each data set in descending order.
    // This optimization is crucial for the early 'break' condition in the nested loops.
    numericDataSets.forEach(dataSet => {
        // Using a stable sort and ensuring numeric comparison.
        dataSet.sort((valY, valX) => valX - valY); // Sort descending
    });

    let aggregatedSums = []; // Array to store all computed sums.
    const productThreshold = 3000; // Define the maximum allowed product for combination indices.

    // Step 5: Iterate through combinations of elements from the three data sets.
    // This uses nested loops, with an early exit condition based on the product threshold.
    // The indices (plus one) are multiplied to check against a predefined limit.
    for (let currentIdxA = 0; currentIdxA < maxDimA; ++currentIdxA) {
        // Ensure we don't go out of bounds for the first data set
        if (currentIdxA >= numericDataSets[0].length) break;

        const valueFromSetA = numericDataSets[0][currentIdxA];

        for (let currentIdxB = 0; currentIdxB < maxDimB; ++currentIdxB) {
            // Ensure we don't go out of bounds for the second data set
            if (currentIdxB >= numericDataSets[1].length) break;

            const valueFromSetB = numericDataSets[1][currentIdxB];

            for (let currentIdxC = 0; currentIdxC < maxDimC; ++currentIdxC) {
                // Check the product condition for early termination of the innermost loop.
                // This relies on the data sets being sorted in descending order.
                const currentProduct = (currentIdxA + 1) * (currentIdxB + 1) * (currentIdxC + 1);

                if (currentProduct > productThreshold) {
                    // If the product exceeds the threshold, further combinations with larger indices
                    // will also exceed it, so we can break this inner loop.
                    break;
                }

                // Ensure we don't go out of bounds for the third data set
                if (currentIdxC >= numericDataSets[2].length) break;

                const valueFromSetC = numericDataSets[2][currentIdxC];

                // Calculate the sum for the current combination.
                const currentSum = valueFromSetA + valueFromSetB + valueFromSetC;
                aggregatedSums.push(currentSum);
            }
        }
    }

    // Step 6: Process the collected sums.
    // Sort all sums in descending order and then select the top 'resultCountLimit' sums.
    aggregatedSums.sort((sumY, sumX) => sumX - sumY); // Sort all sums descending

    // Truncate the list to the desired number of results.
    const finalSelection = aggregatedSums.slice(0, resultCountLimit);

    // Step 7: Output the final results, each on a new line.
    console.log(finalSelection.join('\n'));
}

// Entry point: Read input from standard input and pass it to the processing function.
// This assumes a Node.js environment where 'fs' module is available.
try {
    const systemInput = require('fs').readFileSync('/dev/stdin', 'utf8');
    processInputData(systemInput);
} catch (error) {
    console.error("Failed to read input from /dev/stdin:", error.message);
    // Optionally, provide a fallback or exit with an error code.
    process.exit(1);
}