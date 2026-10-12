'use strict';

const executeLogic = (rawData) => {
    // Split the entire input string into individual lines
    const dataRows = rawData.split('\n');

    // Parse grid dimensions from the first line
    const sizeParts = dataRows[0].split(' ');
    const numRows = parseInt(sizeParts[0], 10);
    const numCols = parseInt(sizeParts[1], 10);

    // Initialize the 2D array (matrix) to store grid values
    const matrixData = [];
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        matrixData[rowIndex] = [];
        // Get the current row's string and split it by spaces
        const currentRowValues = dataRows[rowIndex + 1].split(' ');
        for (let colIndex = 0; colIndex < numCols; colIndex++) {
            // Convert string values to integers and populate the matrix
            matrixData[rowIndex][colIndex] = parseInt(currentRowValues[colIndex], 10);
        }
    }

    // Array to store the sequence of transfer operations
    const actionRecords = [];

    // Helper function to perform a value transfer and record it
    const performTransfer = function (sourceCol, sourceRow, destCol, destRow) {
        // Record the move in 1-based indexing for output
        actionRecords.push([sourceRow + 1, sourceCol + 1, destRow + 1, destCol + 1].join(' '));
        // Increment destination cell value
        matrixData[destRow][destCol]++;
        // Decrement source cell value
        matrixData[sourceRow][sourceCol]--;
    };

    // Iterate through the grid to process odd numbers
    // The strategy is to move odd values to an adjacent cell until all cells are even
    for (let currRow = 0; currRow < numRows; currRow++) {
        for (let currCol = 0; currCol < numCols; currCol++) {
            // Check if the current cell contains an odd number
            if (matrixData[currRow][currCol] % 2 !== 0) {
                // If it's an odd value, attempt to move it
                if (currCol + 1 < numCols) {
                    // Move to the right if possible
                    performTransfer(currCol, currRow, currCol + 1, currRow);
                } else if (currRow + 1 < numRows) {
                    // Otherwise, move downwards if possible
                    performTransfer(currCol, currRow, currCol, currRow + 1);
                }
            }
        }
    }

    // Output the total number of operations performed
    console.log(actionRecords.length);
    // Output each operation on a new line, followed by an extra newline
    console.log(actionRecords.join('\n') + '\n');
};

// Flag to determine if the script is running in a test environment
const runInTestMode = false;

// Conditional execution based on the test flag
if (runInTestMode) {
    // Execute with a predefined test input string
    executeLogic('2 3\n1 2 3\n0 1 1\n');
} else {
    // Read input from standard input for production execution
    executeLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));
}
