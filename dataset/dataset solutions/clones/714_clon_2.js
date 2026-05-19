#!/usr/bin/node

// This script processes grid data from standard input to count connected regions.
// It uses a recursive flood-fill algorithm to identify and clear regions.

(function() {
  // Declare variables to hold the current grid and accumulated input lines.
  var gridData = []; // Stores the current grid (matrix) for processing.
  var inputLines = []; // Accumulates lines read from standard input.

  // Obtain a readable stream for standard input.
  var standardInput = process.openStdin();
  // Set the encoding for the input stream to UTF-8.
  standardInput.setEncoding('utf8');

  /**
   * Recursively explores and clears connected cells in the grid.
   * This function implements a 8-directional flood-fill algorithm.
   * @param {number} colIdx - The column index of the current cell.
   * @param {number} rowIdx - The row index of the current cell.
   */
  var traverseCells = function(colIdx, rowIdx) {
    // Check if the current cell is within bounds and contains a '1' (truthy value).
    if (colIdx >= 0 && colIdx < gridData[0].length &&
        rowIdx >= 0 && rowIdx < gridData.length &&
        gridData[rowIdx][colIdx]) {

      // If valid and '1', mark it as visited by setting to '0'.
      gridData[rowIdx][colIdx] = 0;

      // Recursively call for all 8 neighboring cells.
      traverseCells(colIdx - 1, rowIdx);     // Left
      traverseCells(colIdx + 1, rowIdx);     // Right
      traverseCells(colIdx, rowIdx - 1);     // Up
      traverseCells(colIdx, rowIdx + 1);     // Down
      traverseCells(colIdx - 1, rowIdx - 1); // Top-left
      traverseCells(colIdx + 1, rowIdx - 1); // Top-right
      traverseCells(colIdx - 1, rowIdx + 1); // Bottom-left
      traverseCells(colIdx + 1, rowIdx + 1); // Bottom-right
    }
  };

  // Buffer for incomplete lines received from stdin.
  var partialInputBuffer = "";

  // Event listener for incoming data chunks from standard input.
  standardInput.on('data', function(incomingData) {
    // Concatenate the new data with any previously buffered fragment.
    // Then split the combined string by newline characters.
    var lineSegments = (partialInputBuffer + incomingData).split("\n");
    // The last element might be an incomplete line; store it back in the buffer.
    partialInputBuffer = lineSegments.pop();

    // Iterate through the complete lines received.
    for (var lineCounter = 0; lineCounter < lineSegments.length; lineCounter++) {
      // Skip empty lines.
      if (lineSegments[lineCounter] === '') {
        continue;
      }
      // Add non-empty lines to our queue of input lines.
      inputLines.push(lineSegments[lineCounter]);
    }
  });

  // Event listener for the 'end' of the standard input stream.
  standardInput.on('end', function(endEventArg) {
    // Declare loop counters and a variable for region count.
    var colIterator, rowIterator, regionCount;

    // Main processing loop. Continues until no more grid data is available.
    for (;;) {
      regionCount = 0; // Reset region count for each new grid.

      // Attempt to extract the height of the next grid from the input lines.
      // The height is expected to be the second character of the first line of a grid block.
      var matrixHeight = (inputLines.shift())[1];

      // If no height is found (e.g., inputLines is empty or first line is malformed),
      // it signifies the end of all grid inputs.
      if (!matrixHeight) {
        break;
      }

      // Extract the lines corresponding to the current grid based on its height.
      gridData = inputLines.slice(0, matrixHeight);

      // Iterate through each cell of the current grid.
      // Outer loop for columns, inner loop for rows.
      for (colIterator = 0; colIterator < gridData[0].length; colIterator++) {
        for (rowIterator = 0; rowIterator < gridData.length; rowIterator++) {
          // If a cell contains a '1' (truthy), it's the start of a new, uncounted region.
          if (gridData[rowIterator][colIterator]) {
            regionCount++; // Increment the region counter.
            // Start the flood-fill from this cell to clear the entire region.
            traverseCells(colIterator, rowIterator);
          }
        }
      }
      // Output the total number of regions found for the current grid.
      console.log(regionCount);

      // Remove the processed grid lines from the input queue.
      inputLines = inputLines.slice(matrixHeight);
    }
  });
}).call(this); // Execute the anonymous function immediately.
