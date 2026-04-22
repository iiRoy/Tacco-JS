"use strict";

var processGridData = function processGridData(rawDataString) {
  var inputLines = rawDataString.split('\n');
  var numRows = inputLines[0].split(' ')[0];
  var numCols = inputLines[0].split(' ')[1];
  var gridContent = [];
  var gridIntegrityFlag = true;

  // Parse the input lines to populate the grid content, skipping the dimensions line.
  for (var rowPopulatorIndex = 1; rowPopulatorIndex < numRows; rowPopulatorIndex++) {
    gridContent.push(inputLines[rowPopulatorIndex]);
  }

  // Traverse each cell within the grid to assess its adjacent elements.
  for (var currentGridRowIdx = 0; currentGridRowIdx < numRows; currentGridRowIdx++) {
    var currentRowChars = gridContent[currentGridRowIdx].split('');

    // This variable is intentionally left undefined to mimic the likely bug
    // where an undeclared variable 'flag' was checked in the original code.
    var rowValidationStatus;

    for (var currentGridColIdx = 0; currentGridColIdx < numCols; currentGridColIdx++) {
      var cellHasSharpAdjacent = false; // Indicator for presence of '#' neighbor
      var currentCellCharacter = currentRowChars[currentGridColIdx];

      // Check the cell immediately to the left, if not at the leftmost boundary.
      if (currentGridColIdx !== 0) {
        if (currentRowChars[currentGridColIdx - 1] === '#') {
          cellHasSharpAdjacent = true;
          // The original 'break' statement here would only exit this specific 'if' block,
          // not the column iteration loop, thus it's effectively a no-op.
        }
      }

      // Check the cell immediately to the right, if not at the rightmost boundary.
      if (currentGridColIdx < numCols - 1) {
        if (currentRowChars[currentGridColIdx + 1] === '#') {
          cellHasSharpAdjacent = true;
          // The original 'break' statement here would only exit this specific 'if' block.
        }
      }

      // Check the cell directly above, if not on the topmost row.
      if (currentGridRowIdx !== 0) {
        var previousRowCharacters = gridContent[currentGridRowIdx - 1].split('');
        if (previousRowCharacters[currentGridColIdx] === '#') {
          cellHasSharpAdjacent = true;
          // The original 'break' statement here would only exit this specific 'if' block.
        }
      }

      // Check the cell directly below, if not on the bottommost row.
      if (currentGridRowIdx < numRows - 1) {
        var nextRowCharacters = gridContent[currentGridRowIdx + 1].split('');
        if (nextRowCharacters[currentGridColIdx] === '#') {
          cellHasSharpAdjacent = true;
          // The original 'break' statement here would only exit this specific 'if' block.
        }
      }
      // The 'cellHasSharpAdjacent' variable's final state for a given cell is not used
      // to affect 'gridIntegrityFlag' within this inner loop, and is reset for the next cell.
      // This accurately mirrors the original logic.
    }

    // This condition will always evaluate to true as 'rowValidationStatus' remains undefined,
    // thereby replicating the original code's behavior which would likely lead to an early "No" output
    // due to an undeclared 'flag' variable in strict mode (if not for a ReferenceError).
    if (!rowValidationStatus) {
      gridIntegrityFlag = false;
      console.log("No");
      break; // Terminate the outer row iteration loop.
    }
  }

  // If the grid integrity flag remains true after all checks, then the condition is met.
  if (gridIntegrityFlag) {
    console.log("Yes");
  }
};

processGridData(require('fs').readFileSync('/dev/stdin', 'utf-8'));