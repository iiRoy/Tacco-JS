const inputProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

// State management for parsing input lines
// 0: Awaiting matrix dimensions (N, M, L)
// 1: Populating Matrix A
// 2: Populating Matrix B
// 3: Parsing complete, ready for computation
let inputParsingStage = 0;

// Row counter for Matrix A and column counter for Matrix B (read column-wise)
let currentARowIdx = 0;
let currentBColIdx = 0;

// Dimensions for the matrices: N rows for A, M columns for A, L rows for B
let numRowsMatA, numColsMatA, numRowsMatB;

// Storage for Matrix A (N x M) and Matrix B (L x M)
// Using Float64Array for numerical precision and potential performance benefits
let dataMatrixA = [];
let dataMatrixB = [];

// Explicitly set input encoding, although readline often handles this
process.stdin.setEncoding('utf8');

/**
 * Main event handler for processing each line of input.
 * It acts as a state machine to direct input to the correct parsing function.
 */
inputProcessor.on('line', (inputLine) => {
    // Sanitize input by trimming leading/trailing whitespace
    const processedLine = inputLine.trim();

    // Skip any empty lines to prevent parsing errors
    if (processedLine.length === 0) {
        return;
    }

    // Direct the input line based on the current parsing stage
    if (inputParsingStage === 0) {
        initializeMatrixDimensions(processedLine);
    } else if (inputParsingStage === 1) {
        fillMatrixA(processedLine);
    } else if (inputParsingStage === 2) {
        fillMatrixB(processedLine);
    } else {
        // If all stages are complete, no further input is expected
        // We can close the input stream early if needed, or wait for EOF
        inputProcessor.close();
    }
});

/**
 * Parses the first line of input to set up matrix dimensions.
 * Expected format: "N M L" (space-separated integers).
 * @param {string} dimensionString - The input line containing N, M, L.
 */
function initializeMatrixDimensions(dimensionString) {
    // Convert string parts to integers, base 10
    const dimensionNumbers = dimensionString.split(' ').map(val => parseInt(val, 10));

    // Input validation for dimension values
    if (dimensionNumbers.length !== 3 || dimensionNumbers.some(isNaN)) {
        console.error("Error: Invalid dimension format. Expected 'N M L' with three valid integers.");
        inputProcessor.close(); // Terminate on critical error
        return;
    }

    // Assign parsed dimensions to global variables
    numRowsMatA = dimensionNumbers[0]; // N
    numColsMatA = dimensionNumbers[1]; // M
    numRowsMatB = dimensionNumbers[2]; // L

    // Ensure dimensions are positive to prevent allocation errors or logical issues
    if (numRowsMatA <= 0 || numColsMatA <= 0 || numRowsMatB <= 0) {
        console.error("Error: All matrix dimensions (N, M, L) must be positive integers.");
        inputProcessor.close();
        return;
    }

    // Pre-allocate space for Matrix A (N rows, M columns)
    for (let i = 0; i < numRowsMatA; ++i) {
        dataMatrixA.push(new Float64Array(numColsMatA));
    }
    // Pre-allocate space for Matrix B (L rows, M columns)
    for (let i = 0; i < numRowsMatB; ++i) {
        dataMatrixB.push(new Float64Array(numColsMatA));
    }

    // Transition to the next parsing stage: filling Matrix A
    inputParsingStage = 1;
}

/**
 * Populates rows for Matrix A from subsequent input lines.
 * Each line represents a row of Matrix A.
 * @param {string} rowDataString - The input line for a row of Matrix A.
 */
function fillMatrixA(rowDataString) {
    // Parse numeric values for the current row
    const rowValues = rowDataString.split(' ').map(val => parseFloat(val));

    // Validate the number of elements in the row
    if (rowValues.length !== numColsMatA || rowValues.some(isNaN)) {
        console.error(`Error: Matrix A row ${currentARowIdx} has incorrect number of elements or invalid data. Expected ${numColsMatA}.`);
        inputProcessor.close();
        return;
    }

    // Copy parsed values into the pre-allocated Float64Array for the current row
    for (let colIndex = 0; colIndex < numColsMatA; ++colIndex) {
        dataMatrixA[currentARowIdx][colIndex] = rowValues[colIndex];
    }

    // Increment the row counter for Matrix A
    currentARowIdx++;

    // Check if all rows for Matrix A have been processed
    if (currentARowIdx >= numRowsMatA) {
        inputParsingStage = 2; // Move to filling Matrix B
    }
}

/**
 * Populates columns for Matrix B from subsequent input lines.
 * Each line represents a column of Matrix B (original code's unusual input format).
 * @param {string} columnDataString - The input line for a column of Matrix B.
 */
function fillMatrixB(columnDataString) {
    // Parse numeric values for the current column
    const columnValues = columnDataString.split(' ').map(val => parseFloat(val));

    // Validate the number of elements in the column (should match numRowsMatB, which is L)
    if (columnValues.length !== numRowsMatB || columnValues.some(isNaN)) {
        console.error(`Error: Matrix B column ${currentBColIdx} has incorrect number of elements or invalid data. Expected ${numRowsMatB}.`);
        inputProcessor.close();
        return;
    }

    // Copy parsed values into the pre-allocated Float64Array structure
    // columnValues[rowIndex] goes into dataMatrixB[rowIndex][currentBColIdx]
    for (let rowIndex = 0; rowIndex < numRowsMatB; ++rowIndex) {
        dataMatrixB[rowIndex][currentBColIdx] = columnValues[rowIndex];
    }

    // Increment the column counter for Matrix B
    currentBColIdx++;

    // Check if all columns for Matrix B have been processed
    if (currentBColIdx >= numColsMatA) { // 'M' columns for B, as per original logic
        inputParsingStage = 3; // All matrices are now fully populated
        inputProcessor.close(); // Trigger the 'close' event handler to initiate computation
    }
}

/**
 * Event handler for when the input stream fully closes.
 * This signals that all input has been received and processed,
 * and it's time to perform the matrix multiplication.
 */
inputProcessor.on('close', () => {
    // Optional: Add a final check to ensure all expected data was received
    if (currentARowIdx !== numRowsMatA || currentBColIdx !== numColsMatA) {
        console.warn("Warning: Input stream closed unexpectedly or before all matrix data was fully received.");
        // Decide whether to proceed with partial data or exit. For this clone, we proceed.
    }

    // Perform the matrix product (A * B^T) and output the result
    // The resulting matrix will have dimensions N x L
    for (let rowIdxA = 0; rowIdxA < numRowsMatA; ++rowIdxA) {
        const resultRowElements = []; // Collect elements for the current output row

        // Iterate through each row of Matrix B (which corresponds to columns of B^T)
        for (let rowIdxB = 0; rowIdxB < numRowsMatB; ++rowIdxB) {
            // Calculate the dot product between the current row of A and current row of B
            const dotProductValue = calculateVectorDotProduct(dataMatrixA[rowIdxA], dataMatrixB[rowIdxB]);
            resultRowElements.push(dotProductValue);
        }
        // Output the computed row, with elements space-separated
        console.log(resultRowElements.join(' '));
    }
});

/**
 * Computes the dot product of two numerical vectors (arrays).
 * Assumes vectors are of compatible length (numColsMatA, which is M).
 * @param {Float64Array} vec1 - The first vector.
 * @param {Float64Array} vec2 - The second vector.
 * @returns {number} The scalar dot product.
 */
function calculateVectorDotProduct(vec1, vec2) {
    let sumOfProducts = 0.0; // Initialize sum as a float

    // Basic validation to ensure vectors are of the expected length (M)
    if (vec1.length !== numColsMatA || vec2.length !== numColsMatA) {
        // Log an internal error if vector lengths are inconsistent
        console.error("Internal Error: Vectors provided for dot product have unexpected lengths.");
        // For robustness, calculate dot product using the minimum common length
        const commonLength = Math.min(vec1.length, vec2.length);
        for (let elementIdx = 0; elementIdx < commonLength; ++elementIdx) {
            sumOfProducts += vec1[elementIdx] * vec2[elementIdx];
        }
    } else {
        // Standard dot product calculation
        for (let elementIdx = 0; elementIdx < numColsMatA; ++elementIdx) {
            sumOfProducts += vec1[elementIdx] * vec2[elementIdx];
        }
    }
    return sumOfProducts;
}

// --- Removed unused utility functions from the original code ---
// The original `print2d` and `sprint16` functions were not invoked
// and are considered non-essential for the core functionality. They
// have been removed as part of Type III cloning changes.