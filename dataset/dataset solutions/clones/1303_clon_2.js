const inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

// State variables to manage the input parsing process.
let configPhase = 0; // Tracks which part of the input is being read: 0 for NML, 1 for Matrix A, 2 for Matrix B.
let matrixARowsProcessed = 0; // Counter for rows of matrix A that have been parsed.
let matrixBColsProcessed = 0; // Counter for columns of matrix B that have been parsed.

// Variables to store the dimensions of the matrices.
let numRowsA; // Corresponds to 'n' in the original, number of rows in matrix A.
let numColsA_RowsB; // Corresponds to 'm' in the original, number of columns in matrix A and rows in matrix B.
let numColsB; // Corresponds to 'l' in the original, number of columns in matrix B.

// Arrays to hold the matrix data.
const matrixA = []; // Stores matrix A.
const matrixB = []; // Stores matrix B.

// This variable is declared and assigned in the original code but never used.
// It is included here for Type II cloning fidelity.
let processInputLine = parseDimensions;

// Set the input stream encoding to ASCII.
process.stdin.setEncoding('ascii');

// Event handler for each line of input received.
inputReader.on('line', function (currentLine) {
    // Direct the input line to the appropriate parsing function based on the current phase.
    if (configPhase === 0) {
        parseDimensions(currentLine); // First line defines N, M, L.
    } else if (matrixARowsProcessed < numRowsA) {
        parseMatrixA(currentLine); // Lines for matrix A.
    } else if (matrixBColsProcessed < numColsA_RowsB) { // Note: 'm' is numColsA_RowsB.
        parseMatrixB(currentLine); // Lines for matrix B.
    } else {
        inputReader.close(); // All expected input has been received.
    }
});

/**
 * Parses the initial line containing the dimensions N, M, and L.
 * @param {string} inputStr - The string line from standard input.
 */
function parseDimensions(inputStr) {
    // Split the line by spaces and convert each part to a number.
    const parsedNumbers = inputStr.split(' ').map(Number);

    numRowsA = parsedNumbers[0]; // Assign N.
    numColsA_RowsB = parsedNumbers[1]; // Assign M.
    numColsB = parsedNumbers[2]; // Assign L.

    // Initialize matrix A: N rows, each an Int16Array of size M.
    for (let loopCounter = numRowsA; loopCounter > 0; loopCounter--) {
        matrixA.push(new Int16Array(numColsA_RowsB));
    }

    // Initialize matrix B: L "rows", each an Int16Array of size M.
    // This structure effectively stores matrix B in a column-major fashion for easier dot product calculation.
    for (let loopCounter = numColsB; loopCounter > 0; loopCounter--) {
        matrixB.push(new Int16Array(numColsA_RowsB));
    }
    configPhase++; // Advance to the next input processing phase.
}

/**
 * Parses a line representing a row of matrix A.
 * @param {string} inputLine - The string line containing space-separated values for a row.
 */
function parseMatrixA(inputLine) {
    const rowValues = inputLine.split(' ').map(Number);
    // Populate the current row of matrix A with the parsed values.
    for (let elementIndex in rowValues) {
        matrixA[matrixARowsProcessed][elementIndex] = rowValues[elementIndex];
    }
    matrixARowsProcessed++; // Increment the counter for processed rows of matrix A.
}

/**
 * Parses a line representing a column of matrix B.
 * @param {string} inputLine - The string line containing space-separated values for a column.
 */
function parseMatrixB(inputLine) {
    const columnValues = inputLine.split(' ');
    // Populate the current column of matrix B.
    // The original code uses `b[k][stepb] = ary[k]`, which means `matrixB[colElementIndex][matrixBColsProcessed] = columnValues[colElementIndex]`.
    // This confirms that matrixB is structured such that matrixB[j] represents the j-th column of the conceptual matrix B.
    for (let colElementIndex in columnValues) {
        matrixB[colElementIndex][matrixBColsProcessed] = Number(columnValues[colElementIndex]); // Explicitly convert to number.
    }
    matrixBColsProcessed++; // Increment the counter for processed columns of matrix B.
}

// Event handler for when the input reader is closed, indicating all input has been processed.
inputReader.on('close', function() {
    // Iterate through each row of matrix A.
    for (let rowIdxA in matrixA) {
        let outputRowString = ""; // Accumulator for the current output row.
        // Iterate through each "row" of matrix B, which corresponds to a column of the conceptual matrix B.
        for (let colIdxB in matrixB) {
            // Calculate the dot product of the current row from A and the current column from B.
            outputRowString = outputRowString + calculateDotProduct(matrixA[rowIdxA], matrixB[colIdxB]) + " ";
        }
        // Print the resulting row, removing any trailing space.
        console.log(outputRowString.trim());
    }
});

/**
 * Calculates the dot product of two vectors (arrays).
 * Assumes both vectors have a length equal to numColsA_RowsB (m).
 * @param {Int16Array} vectorA - The first vector (a row from matrix A).
 * @param {Int16Array} vectorB - The second vector (a column from matrix B).
 * @returns {number} The computed dot product.
 */
function calculateDotProduct(vectorA, vectorB) {
    let dotProductResult = 0; // Initialize the sum.
    // Iterate backwards from m-1 to 0 to sum the products of corresponding elements.
    for (let elementIdx = numColsA_RowsB - 1; elementIdx >= 0; elementIdx--) {
        dotProductResult += vectorA[elementIdx] * vectorB[elementIdx];
    }
    return dotProductResult;
}

// The following functions are present in the original code but are never called.
// They are included here with renamed identifiers to maintain Type II cloning rules.

/**
 * Displays a 2D array to the console in a formatted string. (Unused in the main logic).
 * @param {Array<Array<number>>} twoDArray - The 2D array to be displayed.
 */
function displayMatrix(twoDArray) {
    let formattedOutput = "[ ";
    for (let arrayIndex in twoDArray) {
        formattedOutput = formattedOutput + formatRow(twoDArray[arrayIndex]) + " ";
    }
    console.log(formattedOutput + "]");
}

/**
 * Formats a 1D array (Int16Array) into a string representation. (Unused in the main logic).
 * @param {Int16Array} oneDArray - The 1D array to format.
 * @returns {string} A string representation of the array.
 */
function formatRow(oneDArray) {
    let rowRepresentation = "[ ";
    for (let itemIndex = 0; itemIndex < oneDArray.length; itemIndex++) {
        rowRepresentation = rowRepresentation + oneDArray[itemIndex].toString() + " ";
    }
    return rowRepresentation + "]";
}
