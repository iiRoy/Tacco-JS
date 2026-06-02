"use strict";

const processGridData = (sourceText) => {
  const inputLines = sourceText.split('\n');
  const dimensions = inputLines[0].split(' ');
  const gridHeight = parseInt(dimensions[0], 10);
  const gridWidth = parseInt(dimensions[1], 10);

  // Replicate the original bug: 's' is populated with H-1 rows, not H rows.
  // This means gridCells will have gridHeight - 1 elements.
  const gridCells = inputLines.slice(1, gridHeight).map(rowString => rowString.split(''));

  // The original code's 'flagOut' variable, which would eventually be set to false
  // if the logic completed without error. However, it will not be reached.
  let overallProcessingStatus = true;

  // Use Array.prototype.reduce to iterate through rows, replacing the outer for loop.
  // The accumulator manages the overall status and a flag to stop early (like 'break' for the outer loop).
  const finalProcessingState = Array.from({ length: gridHeight }).reduce((accumulator, _, rowIndex) => {
    // This condition simulates the 'break' from the outer loop if 'flagOut' was set to false.
    // However, due to the TypeError, this path will not be fully executed.
    if (!accumulator.continueIteration) {
      return accumulator;
    }

    // This line replicates the original bug: when rowIndex reaches gridHeight - 1,
    // gridCells[rowIndex] will be undefined because gridCells only contains gridHeight - 1 elements.
    const currentGridRow = gridCells[rowIndex];
    // This line will then cause a TypeError: Cannot read properties of undefined (reading 'split')
    // exactly as in the original code.
    const currentRowCharacters = currentGridRow.split('');

    // The following logic is part of the original code's intended flow,
    // but will not be reached due to the TypeError above.
    let cellHasAdjacentHash = false; // Equivalent to '_flag' in original

    // Use Array.prototype.findIndex to replace the inner for loop and its 'break' behavior.
    // It finds the first column 'colIndex' where a hash neighbor is found for cell (rowIndex, colIndex).
    const firstHashNeighborColIndex = Array.from({ length: gridWidth }).findIndex((_, colIndex) => {
      // Check left neighbor
      if (colIndex > 0 && currentRowCharacters[colIndex - 1] === '#') return true;
      // Check right neighbor
      if (colIndex < gridWidth - 1 && currentRowCharacters[colIndex + 1] === '#') return true;
      // Check up neighbor
      if (rowIndex > 0 && gridCells[rowIndex - 1][colIndex] === '#') return true;
      // Check down neighbor
      if (rowIndex < gridHeight - 1 && gridCells[rowIndex + 1][colIndex] === '#') return true;
      return false; // No hash neighbor found for this cell (rowIndex, colIndex), continue findIndex
    });

    if (firstHashNeighborColIndex !== -1) {
      cellHasAdjacentHash = true; // Equivalent to '_flag = true; break;' in original inner loop
    }

    // This is the location of the original ReferenceError: 'flag is not defined'.
    // This code path will not be reached because the TypeError occurs earlier.
    if (!flag) { // This line would cause a ReferenceError if reached
      accumulator.overallProcessingStatus = false;
      accumulator.continueIteration = false;
    }

    return accumulator;
  }, { overallProcessingStatus: true, continueIteration: true });

  // These console.log statements would only be reached if no errors occurred,
  // which is not the case for the original code.
  // if (finalProcessingState.overallProcessingStatus) {
  //   console.log("Yes");
  // } else {
  //   console.log("No");
  // }
};

processGridData(require('fs').readFileSync('/dev/stdin', 'utf-8'));
