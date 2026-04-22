'use strict'

/**
 * Executes the primary logic to process raw input, perform matrix multiplication,
 * and output the result.
 * @param {string} rawInputData - The complete input string, typically from standard input.
 */
const processInputData = (rawInputData) => {
    // Pre-process the raw input: trim whitespace and split into an array of lines.
    // Filtering out empty lines ensures robustness against trailing newlines or empty lines.
    const inputLines = rawInputData.trim().split('\n').filter(line => line.length > 0);

    // --- Type III: Added Input Validation ---
    // Early exit if no valid input lines are found.
    if (inputLines.length === 0) {
        console.error("Processing Error: Input data is empty or contains only whitespace.");
        return;
    }

    // Parse the very first line which contains the dimensions for the matrices.
    // Using `Number` for parsing, which is a functional equivalent to `parseInt(..., 10)`
    // but can handle floating points (though not expected here) and returns NaN for non-numeric.
    const dimensionSpecifications = inputLines[0].split(' ').map(Number);

    // --- Type III: Added Dimension Validation ---
    // Validate that exactly three positive integer dimensions are provided.
    if (dimensionSpecifications.length !== 3 || dimensionSpecifications.some(dim => !Number.isInteger(dim) || dim <= 0)) {
        console.error("Processing Error: Invalid matrix dimension specification. Expected three positive integers (R1 C1 C2).");
        return;
    }

    // Assign descriptive names to the extracted dimension values for better readability.
    const numRowsA = dimensionSpecifications[0];     // Number of rows for the first matrix.
    const numColsA = dimensionSpecifications[1];     // Number of columns for the first matrix, also rows for the second.
    const numColsB = dimensionSpecifications[2];     // Number of columns for the second matrix.

    // --- Type III: Added Input Line Count Validation ---
    // Calculate the total number of lines expected for dimensions and both matrices.
    const minimumExpectedLines = 1 + numRowsA + numColsA;
    if (inputLines.length < minimumExpectedLines) {
        console.error(`Processing Error: Incomplete input data. Expected at least ${minimumExpectedLines} lines but received ${inputLines.length}.`);
        return;
    }

    /**
     * Helper function (Type III: Function Extraction) to parse a block of lines into a 2D array (matrix).
     * @param {number} startLineIdx - The starting index (0-based) in `inputLines` for the matrix data.
     * @param {number} rowsToParse - The number of rows to parse for this matrix.
     * @returns {number[][]} A 2D array representing the parsed matrix.
     */
    const parseMatrixBlock = (startLineIdx, rowsToParse) => {
        return inputLines.slice(startLineIdx, startLineIdx + rowsToParse)
                         .map(lineText => lineText.split(' ').map(Number));
    };

    // Parse the first matrix (Matrix A) from the input.
    const matrixAlpha = parseMatrixBlock(1, numRowsA);

    // Parse the second matrix (Matrix B) from the input.
    // It starts immediately after Matrix A's last line.
    const matrixBeta = parseMatrixBlock(1 + numRowsA, numColsA);

    // --- Type III: Added Matrix Structure Validation ---
    // Verify that each row in the parsed matrices has the expected number of columns.
    if (matrixAlpha.some(row => row.length !== numColsA)) {
        console.error("Processing Error: Rows in the first matrix do not match the specified column count.");
        return;
    }
    if (matrixBeta.some(row => row.length !== numColsB)) {
        console.error("Processing Error: Rows in the second matrix do not match the specified column count.");
        return;
    }

    // Initialize the matrix that will store the product of matrixAlpha and matrixBeta.
    // It will have `numRowsA` rows and `numColsB` columns, all initially set to zero.
    // (Type II: Changed initialization method from `[...Array()]` to `Array.from()`)
    const productResultMatrix = Array.from({ length: numRowsA }, () =>
        Array.from({ length: numColsB }, () => 0)
    );

    // Perform the core matrix multiplication algorithm.
    // Iterate through each row of the first matrix.
    for (let currentAlphaRow = 0; currentAlphaRow < numRowsA; currentAlphaRow++) {
        // Iterate through each column of the second matrix.
        for (let currentBetaCol = 0; currentBetaCol < numColsB; currentBetaCol++) {
            // --- Type III: Optimized Calculation ---
            // Replaced intermediate array `cal` and `reduce` with a direct sum accumulator.
            let cellValueAccumulator = 0; // This variable accumulates the sum for the current cell (row, col).

            // Iterate through the common dimension (columns of Matrix A or rows of Matrix B).
            for (let commonDimensionIdx = 0; commonDimensionIdx < numColsA; commonDimensionIdx++) {
                // Multiply corresponding elements from matrixAlpha and matrixBeta and add to the accumulator.
                cellValueAccumulator += matrixAlpha[currentAlphaRow][commonDimensionIdx] *
                                        matrixBeta[commonDimensionIdx][currentBetaCol];
            }
            // Store the final computed sum for the current cell in the product matrix.
            productResultMatrix[currentAlphaRow][currentBetaCol] = cellValueAccumulator;
        }
    }

    // Format the computed product matrix into a string for console output.
    // Each row's elements are joined by a single space, and rows are separated by newlines.
    const finalFormattedOutput = productResultMatrix.map(rowElements =>
        rowElements.join(' ')
    ).join('\n');

    // Output the formatted matrix to standard output.
    console.log(finalFormattedOutput);
};

// --- Type II: Renamed `require('fs')` variable ---
// Read the input data from standard input using Node.js's file system module.
const nodeFileSystem = require('fs');
processInputData(nodeFileSystem.readFileSync('/dev/stdin', 'utf8'));