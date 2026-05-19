"use strict";

var processInput = function processInput(rawData) {
  var inputLines = rawData.split('\n');

  // Type III: Extracting dimension parsing into temporary variables
  var firstLineData = inputLines[0];
  var dimensionParts = firstLineData.split(' ');
  var gridHeight = parseInt(dimensionParts[0], 10);
  var gridWidth = parseInt(dimensionParts[1], 10);

  var gridRows = [];
  var isPatternValid = true; // Renamed flagOut

  // Original loop: reads H-1 rows. This behavior must be preserved.
  // If gridHeight is 0 or 1, this loop doesn't run or runs 0 times.
  for (var rowPopulateIndex = 1; rowPopulateIndex < gridHeight; rowPopulateIndex++) {
    gridRows.push(inputLines[rowPopulateIndex]);
  }

  // Type III: Introduce a temporary constant for the outer loop limit
  var outerLoopLimit = gridHeight;

  // Main check loop
  for (var currentGridRowIndex = 0; currentGridRowIndex < outerLoopLimit; currentGridRowIndex++) {
    // This line will throw TypeError if currentGridRowIndex >= gridRows.length
    // which happens when currentGridRowIndex == 0 if gridHeight == 1 (as gridRows is empty)
    // or when currentGridRowIndex == gridHeight - 1 if gridHeight > 1 (as gridRows has gridHeight - 1 elements)
    var currentRawRow = gridRows[currentGridRowIndex]; // Type III: temporary variable
    var currentRowChars = currentRawRow.split('');

    // Type III: Introduce a temporary constant for the inner loop limit
    var innerLoopLimit = gridWidth;

    for (var currentGridColIndex = 0; currentGridColIndex < innerLoopLimit; currentGridColIndex++) {
      var hasAdjacentHash = false; // Renamed _flag, local to inner loop
      var cellValue = currentRowChars[currentGridColIndex]; // Renamed target, still unused.

      // Type III: Use helper variables for boundary checks
      var isNotFirstColumn = currentGridColIndex !== 0;
      var isNotLastColumn = currentGridColIndex < gridWidth - 1;
      var isNotFirstRow = currentGridRowIndex !== 0;
      var isNotLastRow = currentGridRowIndex < gridHeight - 1;

      // Left neighbor check
      if (isNotFirstColumn) {
        var leftNeighborChar = currentRowChars[currentGridColIndex - 1]; // Type III: temporary variable
        if (leftNeighborChar === '#') {
          hasAdjacentHash = true;
          break; // Breaks out of the inner (currentGridColIndex) loop
        }
      }

      // Right neighbor check
      if (isNotLastColumn) {
        var rightNeighborChar = currentRowChars[currentGridColIndex + 1]; // Type III: temporary variable
        if (rightNeighborChar === '#') {
          hasAdjacentHash = true;
          break; // Breaks out of the inner (currentGridColIndex) loop
        }
      }

      // Up neighbor check
      if (isNotFirstRow) {
        var aboveRowData = gridRows[currentGridRowIndex - 1]; // Type III: temporary variable
        var aboveRowChars = aboveRowData.split(''); // Re-splitting every time, as in original
        var upNeighborChar = aboveRowChars[currentGridColIndex]; // Type III: temporary variable
        if (upNeighborChar === '#') {
          hasAdjacentHash = true;
          break; // Breaks out of the inner (currentGridColIndex) loop
        }
      }

      // Down neighbor check
      if (isNotLastRow) {
        var belowRowData = gridRows[currentGridRowIndex + 1]; // Type III: temporary variable
        // This line will throw TypeError if belowRowData is undefined,
        // which happens when currentGridRowIndex = gridHeight - 2 (for H > 1)
        // because gridRows only contains elements up to index gridHeight - 2.
        var belowRowChars = belowRowData.split(''); // Re-splitting every time, as in original
        var downNeighborChar = belowRowChars[currentGridColIndex]; // Type III: temporary variable
        if (downNeighborChar === '#') {
          hasAdjacentHash = true;
          break; // Breaks out of the inner (currentGridColIndex) loop
        }
      }
    } // End of inner (currentGridColIndex) loop

    // This is the line that causes ReferenceError: flag is not defined
    // The variable `flag` is not declared anywhere in this scope.
    // This error is reached only if no TypeError occurs before it.
    // Based on analysis, this line is only reached if H=0 (where it's skipped)
    // or if a TypeError happens earlier.
    if (!flag) { // This will throw ReferenceError if H > 0 and no TypeError occurred earlier
      isPatternValid = false;
      console.log("No");
      break; // Breaks out of the outer (currentGridRowIndex) loop
    }
  } // End of outer (currentGridRowIndex) loop

  if (isPatternValid) {
    console.log("Yes");
  }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
