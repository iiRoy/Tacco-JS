'use strict';

const processGrid = (rawData) => {
    const lineSegments = rawData.split('\n');

    const dimStr = lineSegments[0].split(' ');
    const gridHeight = parseInt(dimStr[0], 10);
    const gridWidth = parseInt(dimStr[1], 10);

    const numericGrid = [];
    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        numericGrid[rowIdx] = [];
        const currentLineNums = lineSegments[rowIdx + 1].split(' ');
        for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
            numericGrid[rowIdx][colIdx] = parseInt(currentLineNums[colIdx], 10);
        }
    }

    const operationRecords = [];

    const transferValue = function (sourceCol, sourceRow, destCol, destRow) {
        operationRecords.push([sourceCol, sourceRow, destCol, destRow].join(' '));
        numericGrid[destRow][destCol]++;
        numericGrid[sourceRow][sourceCol]--;
    };

    // The core logic: iterate through the grid to normalize values by transferring odd counts
    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
            // If the current cell's value is an odd number
            if (numericGrid[rowIdx][colIdx] % 2 !== 0) {
                // Attempt to move the odd count to an adjacent cell
                if (colIdx + 1 < gridWidth) {
                    // Move to the right if within bounds
                    transferValue(colIdx, rowIdx, colIdx + 1, rowIdx);
                } else if (rowIdx + 1 < gridHeight) {
                    // Otherwise, move downwards if within bounds
                    transferValue(colIdx, rowIdx, colIdx, rowIdx + 1);
                }
            }
        }
    }

    console.log(operationRecords.length);
    console.log(operationRecords.join('\n') + '\n');
};

const isDevelopmentMode = false;

if (isDevelopmentMode) {
    processGrid('2 3\n1 2 3\n0 1 1\n');
} else {
    processGrid(require('fs').readFileSync('/dev/stdin', 'utf8'));
}