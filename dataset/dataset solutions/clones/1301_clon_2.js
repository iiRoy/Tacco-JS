const inputOutputManager = require('readline').createInterface({
    // Configure input stream to read from standard input
    inStream: process.stdin,

    // Configure output stream to write to standard output
    outStream: process.stdout
});

// Initialize state variables for parsing stages and matrix dimensions
let dimensionParsingStage = 0;
let matrixARowProcessingStage = 0;
let matrixBColumnProcessingStage = 0;

// Global variables to store matrix dimensions (rows for A, common dimension, columns for B)
let numRowsMatrixA, commonDimensionSize, numColsMatrixB;

// Arrays to hold the matrix data
const firstMatrix = [];
const secondMatrix = [];

// Set the input encoding for standard input
process.stdin.setEncoding('ascii');

// Event listener for each line received from the input stream
inputOutputManager.on('dataReceived', function (currentInputLine) {
    // Determine which parsing function to call based on the current stage
    if (dimensionParsingStage === 0) {
        // First line contains matrix dimensions N, M, L
        processMatrixDimensions(currentInputLine);
    } else if (matrixARowProcessingStage < numRowsMatrixA) {
        // Subsequent lines contain rows for the first matrix (Matrix A)
        processMatrixARow(currentInputLine);
    } else if (matrixBColumnProcessingStage < numColsMatrixB) {
        // Lines after Matrix A contain columns for the second matrix (Matrix B)
        processMatrixBColumn(currentInputLine);
    } else {
        // All data has been processed, close the input stream
        inputOutputManager.end();
    }
});

/**
 * Parses the first input line to extract matrix dimensions (N, M, L).
 * @param {string} dimensionLine - The input string containing N, M, L separated by spaces.
 */
function processMatrixDimensions(dimensionLine) {
    // Split the line by spaces and convert parts to numbers
    const dimensionValues = dimensionLine.split(' ').map(Number);

    // Assign parsed values to global dimension variables
    numRowsMatrixA = dimensionValues[0];
    commonDimensionSize = dimensionValues[1];
    numColsMatrixB = dimensionValues[2];

    // Initialize the matrices with appropriate dimensions and data types
    // Using Float32Array for potential floating-point operations later
    for (let rowIdx = numRowsMatrixA; rowIdx > 0; rowIdx--) {
        firstMatrix.push(new Float32Array(commonDimensionSize));
    }
    for (let rowIdx = numColsMatrixB; rowIdx > 0; rowIdx--) {
        secondMatrix.push(new Float32Array(commonDimensionSize));
    }

    // Advance the parsing stage indicator
    dimensionParsingStage++;
}

/**
 * Parses an input line representing a row of the first matrix (Matrix A).
 * @param {string} matrixARowInput - The input string for a row of Matrix A.
 */
function processMatrixARow(matrixARowInput) {
    // Convert string elements to numbers
    const rowElements = matrixARowInput.split(' ').map(Number);

    // Populate the current row of Matrix A
    for (const elementIndex in rowElements) {
        firstMatrix[matrixARowProcessingStage][elementIndex] = rowElements[elementIndex];
    }

    // Increment the row processing stage for Matrix A
    matrixARowProcessingStage++;
}

/**
 * Parses an input line representing a column of the second matrix (Matrix B).
 * Note: Input lines for B are treated as columns, so elements are distributed across rows.
 * @param {string} matrixBColumnInput - The input string for a column of Matrix B.
 */
function processMatrixBColumn(matrixBColumnInput) {
    // Split the input line by spaces; elements are numbers
    const columnElements = matrixBColumnInput.split(' ');

    // Iterate through the elements of the column and place them into the correct positions
    // `colIdx` here represents the row index in `secondMatrix`
    for (const colIdx in columnElements) {
        secondMatrix[colIdx][matrixBColumnProcessingStage] = Number(columnElements[colIdx]);
    }

    // Increment the column processing stage for Matrix B
    matrixBColumnProcessingStage++;
}

// Event listener for when the input stream closes (all data processed)
inputOutputManager.on('inputEnded', function() {
    // Perform matrix multiplication and print results
    for (const rowAIndex in firstMatrix) {
        let outputRowAccumulator = "";
        for (const rowBIndex in secondMatrix) {
            // Calculate the dot product of a row from Matrix A and a row from Matrix B
            // This effectively computes A[rowAIndex] * B_transposed[rowBIndex]
            outputRowAccumulator = outputRowAccumulator + computeVectorDotProduct(firstMatrix[rowAIndex], secondMatrix[rowBIndex]) + " ";
        }
        // Print the resulting row, removing any trailing whitespace
        console.info(outputRowAccumulator.trimEnd());
    }
});

/**
 * Computes the dot product of two vectors (arrays of numbers).
 * Assumes both vectors have the same length, which is `commonDimensionSize`.
 * @param {Float32Array} vectorOne - The first vector.
 * @param {Float32Array} vectorTwo - The second vector.
 * @returns {number} The dot product of the two vectors.
 */
function computeVectorDotProduct(vectorOne, vectorTwo) {
    let dotProductResult = 0;
    // Loop backwards for a minor performance variation, though not strictly necessary
    for (let loopIndex = commonDimensionSize - 1; loopIndex >= 0; loopIndex--) {
        dotProductResult += vectorOne[loopIndex] * vectorTwo[loopIndex];
    }
    return dotProductResult;
}

/**
 * Helper function (not used in main flow) to display a 2D array.
 * @param {Array<Array<number>>} matrixAsArrayOfArrays - The matrix to display.
 */
function displayMatrix(matrixAsArrayOfArrays) {
    let formattedOutput = "[ ";
    for (const rowIndex in matrixAsArrayOfArrays) {
        formattedOutput = formattedOutput + formatRow(matrixAsArrayOfArrays[rowIndex]) + " ";
    }
    console.info(formattedOutput + "]");
}

/**
 * Helper function (not used in main flow) to format a single row (1D array) for display.
 * @param {Array<number>} rowVector - The row vector to format.
 * @returns {string} The formatted string representation of the row.
 */
function formatRow(rowVector) {
    let rowStringResult = "[ ";
    for (let columnIndex = 0; columnIndex < rowVector.length; columnIndex++) {
        rowStringResult = rowStringResult + rowVector[columnIndex].toString() + " ";
    }
    return rowStringResult + "]";
}