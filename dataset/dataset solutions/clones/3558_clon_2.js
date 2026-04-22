'use strict';

const processGrid = (rawData) => {
  const linesArray = rawData.split('\n');

  const dimensionStrings = linesArray[0].split(' ');
  const gridHeight = parseInt(dimensionStrings[0], 10);
  const gridWidth = parseInt(dimensionStrings[1], 10);

  const dataMatrix = [];
  for (let rowIdx = 0; rowIdx < gridHeight; ++rowIdx) {
    dataMatrix[rowIdx] = [];
    const rowValues = linesArray[rowIdx + 1].split(' ');
    for (let colIdx = 0; colIdx < gridWidth; ++colIdx) {
      dataMatrix[rowIdx][colIdx] = parseInt(rowValues[colIdx], 10);
    }
  }

  const operationRecords = [];
  const transferAmount = function(sourceColumn, sourceRow, destinationColumn, destinationRow) {
    operationRecords.push([sourceRow + 1, sourceColumn + 1, destinationRow + 1, destinationColumn + 1].join(' '));
    dataMatrix[destinationRow][destinationColumn]++;
    dataMatrix[sourceRow][sourceColumn]--;
  };

  // The algorithm processes each cell, propagating any odd values to an adjacent cell.
  for (let rowIdx = 0; rowIdx < gridHeight; ++rowIdx) {
    for (let colIdx = 0; colIdx < gridWidth; ++colIdx) {
      if (dataMatrix[rowIdx][colIdx] % 2 !== 0) {
        // If the current cell's value is odd
        if (colIdx + 1 < gridWidth) {
          // Propagate to the right if possible
          transferAmount(colIdx, rowIdx, colIdx + 1, rowIdx);
        } else if (rowIdx + 1 < gridHeight) {
          // Otherwise, propagate downwards if possible
          transferAmount(colIdx, rowIdx, colIdx, rowIdx + 1);
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