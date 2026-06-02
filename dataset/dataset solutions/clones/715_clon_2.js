#!/usr/bin/node
(function() {
  // This array will hold the current grid segment being processed.
  let gridData = [];
  // This array stores all incoming parsed number lines from standard input.
  let rawInput = [];

  // Set up standard input stream.
  const inputSource = process.openStdin();
  inputSource.setEncoding('utf8');

  /**
   * Recursively explores and marks connected components in the grid.
   * @param {number} colIdx - The current column index.
   * @param {number} rowIdx - The current row index.
   */
  const exploreConnected = function(colIdx, rowIdx) {
    // Check if coordinates are within bounds and the cell contains a '1' (true).
    if (colIdx >= 0 && colIdx < gridData[0].length &&
        rowIdx >= 0 && rowIdx < gridData.length &&
        gridData[rowIdx][colIdx]) {

      // Mark the current cell as visited by setting its value to 0.
      gridData[rowIdx][colIdx] = 0;

      // Recursively call for all 8 neighboring cells (including diagonals).
      exploreConnected(colIdx - 1, rowIdx);     // Left
      exploreConnected(colIdx + 1, rowIdx);     // Right
      exploreConnected(colIdx, rowIdx - 1);     // Up
      exploreConnected(colIdx, rowIdx + 1);     // Down
      exploreConnected(colIdx - 1, rowIdx - 1); // Top-left
      exploreConnected(colIdx + 1, rowIdx - 1); // Top-right
      exploreConnected(colIdx - 1, rowIdx + 1); // Bottom-left
      exploreConnected(colIdx + 1, rowIdx + 1); // Bottom-right
    }
  };

  // Buffer for incomplete lines from stdin.
  let partialInputBuffer = "";

  // Event listener for incoming data chunks from stdin.
  inputSource.on('data', function(incomingChunk) {
    // Combine buffer with new chunk and split by newline.
    // The last element might be an incomplete line, so save it.
    let processedLines = (partialInputBuffer + incomingChunk).split("\n");
    partialInputBuffer = processedLines.pop();

    // Process each complete line.
    for (let lineIndex = 0; lineIndex < processedLines.length; lineIndex++) {
      if (processedLines[lineIndex] === '') {
        continue; // Skip empty lines.
      }
      // Split the line by space and parse each part as an integer.
      let parsedNumbers = processedLines[lineIndex].split(" ");
      for (let numIndex = 0; numIndex < parsedNumbers.length; numIndex++) {
        parsedNumbers[numIndex] = parseInt(parsedNumbers[numIndex], 10);
      }
      // Add the array of parsed numbers to our raw input storage.
      rawInput.push(parsedNumbers);
    }
  });

  // Event listener for the end of the input stream.
  inputSource.on('end', function(endEventArg) {
    let currentCol, currentRow, regionCount;

    // Main processing loop for multiple grid scenarios.
    for (;;) {
      regionCount = 0; // Reset region counter for each grid.

      // Get the height of the next grid from the second element of the first line.
      // The first element is usually width, but only height is used here.
      const heightValue = (rawInput.shift())[1];

      // If height is 0 or undefined, it means no more grids to process.
      if (!heightValue) {
        break;
      }

      // Extract the current grid segment based on the determined height.
      gridData = rawInput.slice(0, heightValue);

      // Iterate through the current grid to find and count connected regions.
      for (currentCol = 0; currentCol < gridData[0].length; currentCol++) {
        for (currentRow = 0; currentRow < gridData.length; currentRow++) {
          // If a '1' is found, it's the start of a new region.
          if (gridData[currentRow][currentCol]) {
            regionCount++; // Increment region count.
            // Explore and mark all connected cells for this region.
            exploreConnected(currentCol, currentRow);
          }
        }
      }
      // Output the total number of regions found for the current grid.
      console.log(regionCount);

      // Remove the processed grid lines from the raw input array.
      rawInput = rawInput.slice(heightValue);
    }
  });
}).call(this);
