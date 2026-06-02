'use strict';

const processGridData = (rawData) => {
    // Split the entire input string into individual lines.
    const lines = rawData.split('\n');

    // Parse grid dimensions from the first line.
    const dimensionsStr = lines[0].split(' ');
    const gridHeight = parseInt(dimensionsStr[0], 10);
    const gridWidth = parseInt(dimensionsStr[1], 10);

    // Initialize a 2D array to store grid values.
    const gridValues = [];
    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        gridValues[rowIdx] = [];
        const currentLineParts = lines[rowIdx + 1].split(' ');
        for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
            gridValues[rowIdx][colIdx] = parseInt(currentLineParts[colIdx], 10);
        }
    }

    // Array to store records of operations.
    const operationRecords = [];

    // Helper function to perform a value adjustment and log it.
    const performAdjustment = function (startCol, startRow, endCol, endRow) {
        operationRecords.push([startCol, startRow, endCol, endRow].join(' '));
        gridValues[endRow][endCol]++;
        gridValues[startRow][startCol]--;
    };

    // Iterate through the grid to find odd numbers and move their excess.
    // The strategy is to move the 'oddness' to an adjacent cell.
    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
            // Check if the current cell's value is odd.
            if (gridValues[rowIdx][colIdx] % 2 !== 0) {
                // If odd, attempt to move to the right.
                if (colIdx + 1 < gridWidth) {
                    performAdjustment(colIdx, rowIdx, colIdx + 1, rowIdx);
                }
                // If at the rightmost column, attempt to move down.
                else if (rowIdx + 1 < gridHeight) {
                    performAdjustment(colIdx, rowIdx, colIdx, rowIdx + 1);
                }
            }
        }
    }

    // Output the total number of operations.
    console.log(operationRecords.length);
    // Output each operation record, separated by newlines.
    console.log(operationRecords.join('\n') + '\n');
};

const isDebuggingMode = false;

if (isDebuggingMode) {
    // Example test case for debugging.
    processGridData('2 3\n1 2 3\n0 1 1\n');
} else {
    // Read input from standard input in production.
    processGridData(require('fs').readFileSync('/dev/stdin', 'utf8'));
}
