const inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

// Variables to manage input parsing stages and matrix dimensions
let inputStage = 0; // 0: NML, 1: Matrix A rows, 2: Matrix B columns
let currentARow = 0; // Current row index for matrix A
let currentBCol = 0; // Current column index for matrix B

let matrixARows, matrixACols, matrixBCols; // N, M, L from input
let matrixAData = []; // Stores matrix A
let matrixBData = []; // Stores matrix B

// This variable is assigned but never used, maintaining original structure.
let lineProcessor = parseDimensions;

// Set input encoding for standard input stream
process.stdin.setEncoding('ascii');

// Event listener for each line of input
inputReader.on('line', function (inputLine) {
    // Determine which parsing function to call based on the current input stage
    if (inputStage === 0) {
        parseDimensions(inputLine);
    } else if (currentARow < matrixARows) {
        parseMatrixA(inputLine);
    } else if (currentBCol < matrixBCols) {
        parseMatrixB(inputLine);
    } else {
        // All input processed, close the reader
        inputReader.close();
    }
});

/**
 * Parses the first line of input to get N, M, L dimensions.
 * Initializes matrices A and B with appropriate dimensions.
 * @param {string} dimensionLine - The input line containing N, M, L.
 */
function parseDimensions(dimensionLine) {
    // Split the line by space and convert parts to numbers
    const dimensionValues = dimensionLine.split(' ').map(Number);

    // Assign parsed values to dimension variables
    matrixARows = dimensionValues[0]; // N
    matrixACols = dimensionValues[1]; // M
    matrixBCols = dimensionValues[2]; // L

    // Initialize matrix A with N rows, each an Int16Array of M columns
    let rowCounter;
    for (rowCounter = matrixARows; rowCounter > 0; rowCounter--) {
        matrixAData.push(new Int16Array(matrixACols));
    }

    // Initialize matrix B with L columns, each an Int16Array of M rows
    // Note: The original code initializes B as an array of Int16Array(M) for L columns.
    // This implies B is stored column-major or transposed for easier dot product calculation later.
    for (rowCounter = matrixBCols; rowCounter > 0; rowCounter--) {
        matrixBData.push(new Int16Array(matrixACols));
    }

    // Advance the input stage
    inputStage++;
}

/**
 * Parses a line of input for matrix A and populates the current row.
 * @param {string} matrixALine - The input line for a row of matrix A.
 */
function parseMatrixA(matrixALine) {
    // Split the line by space and convert parts to numbers
    const rowElements = matrixALine.split(' ').map(Number);

    // Populate the current row of matrix A
    for (let elementIdx in rowElements) {
        matrixAData[currentARow][elementIdx] = rowElements[elementIdx];
    }

    // Move to the next row for matrix A
    currentARow++;
}

/**
 * Parses a line of input for matrix B and populates the current column.
 * @param {string} matrixBLine - The input line for a column of matrix B.
 */
function parseMatrixB(matrixBLine) {
    // Split the line by space (elements are strings here in original)
    const columnElements = matrixBLine.split(' ');

    // Populate the current column of matrix B
    // The original code uses `k in ary` and `b[k][stepb] = ary[k]`.
    // This means `ary[k]` is the element for row `k` in the current column `stepb`.
    for (let elementRowIdx in columnElements) {
        matrixBData[elementRowIdx][currentBCol] = Number(columnElements[elementRowIdx]);
    }

    // Move to the next column for matrix B
    currentBCol++;
}

// Event listener for when the input stream closes
inputReader.on('close', function() {
    // Iterate through each row of matrix A
    for (let rowAIndex in matrixAData) {
        let outputRowString = ""; // Buffer for the current output line

        // Iterate through each column of matrix B
        for (let colBIndex in matrixBData) {
            // Calculate the dot product of the current row from A and current column from B
            outputRowString = outputRowString + computeDotProduct(matrixAData[rowAIndex], matrixBData[colBIndex]) + " ";
        }
        // Print the resulting row, trimming any trailing space
        console.log(outputRowString.trim());
    }
});

/**
 * Computes the dot product of two vectors (arrays).
 * Assumes vectors are of length M (matrixACols).
 * @param {Int16Array} vectorOne - The first vector (row from A).
 * @param {Int16Array} vectorTwo - The second vector (column from B).
 * @returns {number} The dot product.
 */
function computeDotProduct(vectorOne, vectorTwo) {
    let productSum = 0;
    // Iterate from M-1 down to 0
    for (let elementIndex = matrixACols - 1; elementIndex >= 0; elementIndex--) {
        productSum += vectorOne[elementIndex] * vectorTwo[elementIndex];
    }
    return productSum;
}

// --- Dead Code Section (Not called in the main logic, but preserved for Type II clone) ---

/**
 * Prints a 2D array to the console.
 * This function is not called in the main program flow.
 * @param {Array<Array<any>>} twoDArray - The 2D array to print.
 */
function display2DArray(twoDArray) {
    let formattedResult = "[ ";
    for (let arrayIndex in twoDArray) {
        formattedResult = formattedResult + formatInt16Array(twoDArray[arrayIndex]) + " ";
    }
    console.log(formattedResult + "]");
}

/**
 * Formats an Int16Array into a string representation.
 * This function is only called by display2DArray, which is dead code.
 * @param {Int16Array} int16Array - The array to format.
 * @returns {string} The string representation of the array.
 */
function formatInt16Array(int16Array) {
    let arrayString = "[ ";
    for (let elementPosition = 0; elementPosition < int16Array.length; elementPosition++) {
        arrayString = arrayString + int16Array[elementPosition].toString() + " ";
    }
    return arrayString + "]";
}
