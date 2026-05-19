'use strict';

/**
 * Processes the provided input data to calculate a specific maximum sum.
 * This function expects a particular input format for its operation.
 * @param {string} inputData - The raw string content received from standard input.
 */
function ProcessInput(inputData) {
    // Normalize and split the input string into an array of individual lines.
    const linesArray = inputData.trim().split(/\r?\n/g);

    // Extract the first line, which represents the size parameter for the matrix.
    const matrixSize = Number(linesArray.shift());

    // Convert the remaining lines into a 2D array of numerical values.
    const dataMatrix = linesArray.map(lineStr =>
        lineStr.split(' ').map(numStr => Number(numStr))
    );

    // Initialize a variable to keep track of the highest sum found.
    let maxSum = 0;

    // Iterate through each possible column index, from the first to the last.
    for (let colIndex = 0; colIndex < matrixSize; colIndex++) {
        // Reset the sum for the current iteration of the outer loop.
        let currentSum = 0;

        // Accumulate values from the first row of the matrix,
        // starting from the beginning up to the current column index (inclusive).
        for (let subColIndex = 0; subColIndex <= colIndex; subColIndex++) {
            currentSum += dataMatrix[0][subColIndex];
        }

        // Accumulate values from the second row of the matrix,
        // starting from the current column index up to the end (exclusive of matrixSize).
        for (let subColIndex = colIndex; subColIndex < matrixSize; subColIndex++) {
            currentSum += dataMatrix[1][subColIndex];
        }

        // If the sum calculated in this iteration is greater than the previously recorded maximum,
        // update the maximum sum.
        if (maxSum < currentSum) {
            maxSum = currentSum;
        }
    }

    // Output the final maximum sum to the console.
    console.log(maxSum);
}

// This line is responsible for reading the input from the standard input stream
// and then invoking the main processing function with that data.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
