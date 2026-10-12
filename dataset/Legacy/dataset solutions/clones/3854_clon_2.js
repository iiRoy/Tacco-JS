"use strict";

/*
 * This module processes a grid of characters to determine if a specific condition is met.
 * The condition involves checking adjacent cells for a particular character ('#').
 */
var processGridData = function processGridData(rawInputString) {
  // Split the entire input string into individual lines.
  var inputLines = rawInputString.split('\n');

  // Extract grid dimensions (height and width) from the first line.
  var gridDimensions = inputLines[0].split(' ');
  var gridRows = gridDimensions[0]; // Number of rows in the grid
  var gridCols = gridDimensions[1]; // Number of columns in the grid

  // Initialize an array to store the grid's character data.
  var gridContent = [];
  // This flag will track the overall outcome of the grid analysis.
  var overallSuccess = true;

  // Populate the gridContent array with rows from the input, skipping the first line (dimensions).
  for (var rowIdxPopulate = 1; rowIdxPopulate < gridRows; rowIdxPopulate++) {
    gridContent.push(inputLines[rowIdxPopulate]);
  }

  // Iterate through each cell of the grid to perform the adjacency check.
  // The outer loop handles rows.
  for (var currentRowIndex = 0; currentRowIndex < gridRows; currentRowIndex++) {
    // Convert the current row string into an array of characters for easier access.
    var currentGridRow = gridContent[currentRowIndex].split('');

    // The inner loop handles columns within the current row.
    for (var currentColIndex = 0; currentColIndex < gridCols; currentColIndex++) {
      // Flag to indicate if the current cell has an adjacent '#' character.
      var hasAdjacentHash = false;
      // Store the character of the current cell (declared but not used later).
      var cellValue = currentGridRow[currentColIndex];

      // Check the cell to the left, if not at the leftmost edge.
      if (currentColIndex !== 0) {
        if (currentGridRow[currentColIndex - 1] === '#') {
          hasAdjacentHash = true;
          break; // Exit inner loop if an adjacent '#' is found.
        }
      }

      // Check the cell to the right, if not at the rightmost edge.
      if (currentColIndex < gridCols - 1) {
        if (currentGridRow[currentColIndex + 1] === '#') {
          hasAdjacentHash = true;
          break; // Exit inner loop if an adjacent '#' is found.
        }
      }

      // Check the cell above, if not at the topmost row.
      if (currentRowIndex !== 0) {
        // Get the row above and split it into characters.
        var aboveRowChars = gridContent[currentRowIndex - 1].split('');
        if (aboveRowChars[currentColIndex] === '#') {
          hasAdjacentHash = true;
          break; // Exit inner loop if an adjacent '#' is found.
        }
      }

      // Check the cell below, if not at the bottommost row.
      if (currentRowIndex < gridRows - 1) {
        // Get the row below and split it into characters.
        var belowRowChars = gridContent[currentRowIndex + 1].split('');
        if (belowRowChars[currentColIndex] === '#') {
          hasAdjacentHash = true;
          break; // Exit inner loop if an adjacent '#' is found.
        }
      }
    }

    // Note: The original code uses 'flag' which is undefined here.
    // This results in '!flag' always evaluating to true, causing 'No' to be printed
    // and the outer loop to break after the first row (if H >= 2).
    // This behavior is preserved as per Type II cloning rules.
    if (!flag) {
      overallSuccess = false;
      console.log("No");
      break; // Exit outer loop if the condition is not met for the current row.
    }
  }

  // If the overall success flag remains true after all checks, print "Yes".
  if (overallSuccess) {
    console.log("Yes");
  }
};

// Read input from standard input and pass it to the processing function.
processGridData(require('fs').readFileSync('/dev/stdin', 'utf-8'));
