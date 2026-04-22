"use strict"; /* Enable strict mode for cleaner code */

/**
 * Orchestrates the processing of input data to calculate a minimum cost.
 * @param {string} rawData - The raw string input, typically from stdin.
 */
function processInput(rawData) {
    // Break down the entire input string into an array of individual lines.
    const linesOfText = rawData.split("\n");

    // The very first line indicates the total count of subsequent data items.
    const totalElements = Number(linesOfText[0]);

    // Initialize an array to store the numeric sequence for processing.
    const numericSequence = [];
    // Iterate through the input lines, starting from the second line, to populate the sequence.
    for (let currentLineIndex = 0; currentLineIndex < totalElements; currentLineIndex++) {
        numericSequence.push( Number(linesOfText[currentLineIndex + 1]));
    }

    // Initialize a 2D dynamic programming table.
    // Dimensions: (totalElements + 1) rows, 5 columns.
    // Each cell will initially be undefined.
    const dynamicCostMatrix = Array(totalElements + 1).fill().map(() => Array(5).fill());
    // Set the base case for the first row of the matrix (index 0).
    // All initial costs are zero before processing any elements.
    dynamicCostMatrix[0] = [0, 0, 0, 0, 0];

    // Iterate through each item in the numeric sequence to fill the dynamic programming table.
    for (let elementCounter = 1; elementCounter <= totalElements; elementCounter++) {
        // Retrieve the current numeric value from the sequence.
        const currentNumericValue = numericSequence[elementCounter - 1];
        // Calculate a specific cost component based on whether the current value is even or zero.
        // If zero, cost is 2; otherwise, it's the remainder when divided by 2 (0 for even, 1 for odd).
        const evenParityCost = currentNumericValue === 0 ? 2 : currentNumericValue % 2;
        // Calculate another specific cost component based on the odd parity.
        // (currentNumericValue + 1) % 2 will be 1 for even, 0 for odd.
        const oddParityCost = (currentNumericValue + 1) % 2;

        // Populate the current row of the dynamic programming matrix based on previous calculations.
        // Each column represents a different state or accumulated cost path.
        dynamicCostMatrix[elementCounter][0] = dynamicCostMatrix[elementCounter - 1][0] + currentNumericValue;
        dynamicCostMatrix[elementCounter][1] = Math.min(dynamicCostMatrix[elementCounter - 1][0], dynamicCostMatrix[elementCounter - 1][1]) + evenParityCost;
        dynamicCostMatrix[elementCounter][2] = Math.min(dynamicCostMatrix[elementCounter - 1][0], dynamicCostMatrix[elementCounter - 1][1], dynamicCostMatrix[elementCounter - 1][2]) + oddParityCost;
        dynamicCostMatrix[elementCounter][3] = Math.min(dynamicCostMatrix[elementCounter - 1][0], dynamicCostMatrix[elementCounter - 1][1], dynamicCostMatrix[elementCounter - 1][2], dynamicCostMatrix[elementCounter - 1][3]) + evenParityCost;
        dynamicCostMatrix[elementCounter][4] = Math.min(dynamicCostMatrix[elementCounter - 1][0], dynamicCostMatrix[elementCounter - 1][1], dynamicCostMatrix[elementCounter - 1][2], dynamicCostMatrix[elementCounter - 1][3], dynamicCostMatrix[elementCounter - 1][4]) + currentNumericValue;
    }

    // After processing all elements, the minimum cost is found in the last row of the matrix.
    // Use the spread operator to pass all elements of the last row to Math.min.
    console.log(Math.min(...dynamicCostMatrix[totalElements]));
}


// Entry point for execution: Read input from standard in and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));