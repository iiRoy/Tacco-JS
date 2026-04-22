// This module handles matrix calculations based on user input.
const inputReader = require('readline').createInterface({
    source: process.stdin,
    destination: process.stdout
});

// Global state variables for parsing input and matrix dimensions.
var readCountNML = 0,
    readCountA = 0,
    readCountB = 0,
    numRows, numCols, numLayers,
    firstMatrix = [],
    secondMatrix = [],
    // Alias for the initial data processing function (unused but kept for structural clone).
    processInputData = processDimensions;

// Set the encoding for standard input.
process.stdin.setEncoding('ascii');

// Event listener for each line of input received.
inputReader.on('line', function (inputLine) {
    if (readCountNML === 0) {
        processDimensions(inputLine);
    }
    else if (readCountA < numRows) {
        processMatrixA(inputLine);
    }
    else if (readCountB < numCols) {
        processMatrixB(inputLine);
    }
    else {
        inputReader.close(); // Finish input processing.
    }
});

// Function to parse the initial dimensions (N, M, L).
function processDimensions(inputLine) {
    // Split the line by spaces and convert to numbers.
    var dimensionsArray = inputLine.split(' ').map(Number);
    numRows = dimensionsArray[0]; // N
    numCols = dimensionsArray[1]; // M
    numLayers = dimensionsArray[2]; // L

    var index;
    // Initialize matrix A (N rows, M columns).
    for (index = numRows; index > 0; index--) {
        firstMatrix.push(new Int16Array(numCols));
    }
    // Initialize matrix B (L rows, M columns).
    for (index = numLayers; index > 0; index--) {
        secondMatrix.push(new Int16Array(numCols));
    }
    readCountNML++; // Increment state counter.
}

// Function to parse rows of matrix A.
function processMatrixA(inputLine) {
    var rowValues = inputLine.split(' ').map(Number);
    // Populate the current row of matrix A.
    for (var colIndex in rowValues) {
        firstMatrix[readCountA][colIndex] = rowValues[colIndex];
    }
    readCountA++; // Increment row counter for A.
}

// Function to parse columns of matrix B.
function processMatrixB(inputLine) {
    var columnValues = inputLine.split(' ');
    // Populate the current column of matrix B (column-major storage).
    for (var rowIndex in columnValues) {
        secondMatrix[rowIndex][readCountB] = columnValues[rowIndex];
    }
    readCountB++; // Increment column counter for B.
}

// Event listener for when the input stream closes.
inputReader.on('close', function () {
    // Iterate through rows of firstMatrix.
    for (var rowIdxA in firstMatrix) {
        var outputString = ""; // Initialize string for the current output line.
        // Iterate through rows of secondMatrix.
        for (var rowIdxB in secondMatrix) {
            // Calculate dot product and append to string.
            outputString = outputString + calculateDotProduct(firstMatrix[rowIdxA], secondMatrix[rowIdxB]) + " ";
        }
        // Print the trimmed line to console.
        console.log(outputString.trim());
    }
});

// Function to calculate the dot product of two vectors (rows/columns).
function calculateDotProduct(vectorOne, vectorTwo) {
    var cumulativeSum = 0; // Accumulator for the dot product.
    // Iterate from right to left (M-1 down to 0).
    for (var elementIdx = numCols - 1; elementIdx >= 0; elementIdx--) {
        cumulativeSum += vectorOne[elementIdx] * vectorTwo[elementIdx];
    }
    return cumulativeSum; // Return the final dot product.
}

// Helper function to display a 2D array (not used in main logic).
function displayMatrix(inputMatrix) {
    var displayResult = "[ ";
    for (var rowKey in inputMatrix) {
        displayResult = displayResult + formatRow(inputMatrix[rowKey]) + " ";
    }
    console.log(displayResult + "]");
}

// Helper function to format a single row (not used in main logic).
function formatRow(inputRow) {
    var rowFormat = "[ ";
    for (var elementIndex = 0; elementIndex < inputRow.length; elementIndex++) {
        rowFormat = rowFormat + inputRow[elementIndex].toString() + " ";
    }
    return rowFormat + "]";
}