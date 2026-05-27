#!/usr/bin/node

// Immediately Invoked Function Expression (IIFE) to encapsulate the code
(function() {
  // Array to hold the current grid data for processing
  var currentGrid = [];
  // Array to store all incoming lines of numbers from standard input
  var allInputLines = [];

  // Set up standard input stream
  var standardInput = process.openStdin();
  // Ensure input is treated as UTF-8 encoded text
  standardInput.setEncoding('utf8');

  /**
   * Recursively explores connected '1's in the grid and marks them as '0'.
   * This function implements a flood-fill-like algorithm to identify and clear regions.
   * @param {number} currentCol - The current column index.
   * @param {number} currentRow - The current row index.
   */
  var traverseAndMark = function(currentCol, currentRow) {
    // Check if the current coordinates are within grid boundaries
    // and if the cell contains a '1' (indicating an unvisited part of a region)
    if (0 <= currentCol && currentCol < currentGrid[0].length &&
        0 <= currentRow && currentRow < currentGrid.length &&
        currentGrid[currentRow][currentCol]) {

      // Mark the current cell as visited (change '1' to '0')
      currentGrid[currentRow][currentCol] = 0;

      // Recursively call for all 8 neighboring cells (including diagonals)
      traverseAndMark(currentCol - 1, currentRow);     // Left
      traverseAndMark(currentCol + 1, currentRow);     // Right
      traverseAndMark(currentCol, currentRow - 1);     // Up
      traverseAndMark(currentCol, currentRow + 1);     // Down
      traverseAndMark(currentCol - 1, currentRow - 1); // Top-Left
      traverseAndMark(currentCol + 1, currentRow - 1); // Top-Right
      traverseAndMark(currentCol - 1, currentRow + 1); // Bottom-Left
      traverseAndMark(currentCol + 1, currentRow + 1); // Bottom-Right
    }
  };

  // Buffer to store incomplete lines from input chunks
  var bufferedInputPart = "";

  // Event listener for incoming data chunks from standard input
  standardInput.on('data', function(dataChunk) {
    // Concatenate the buffered part with the new chunk and split by newline
    var processedInputSegments = (bufferedInputPart + dataChunk).split("\n");
    // The last element might be an incomplete line, so save it for the next chunk
    bufferedInputPart = processedInputSegments.pop();

    // Process each complete line
    for (var segmentIndex = 0; segmentIndex < processedInputSegments.length; segmentIndex++) {
      // Skip empty lines
      if (processedInputSegments[segmentIndex] === '') {
        continue;
      }
      // Split the line by space to get individual number strings
      var parsedValues = processedInputSegments[segmentIndex].split(" ");
      // Convert each string to an integer
      for (var valueIndex = 0; valueIndex < parsedValues.length; valueIndex++) {
        parsedValues[valueIndex] = parseInt(parsedValues[valueIndex]);
      }
      // Add the array of parsed numbers to our collection of all input lines
      allInputLines.push(parsedValues);
    }
  });

  // Event listener for the end of the standard input stream
  standardInput.on('end', function(_endEventArg) { // _endEventArg is unused
    var colIterator, rowIterator, regionCounter;

    // Main processing loop for multiple grid scenarios
    for (;;) {
      regionCounter = 0; // Reset region count for each new grid

      // The second element of the first line in allInputLines specifies the grid height
      var gridHeightToProcess = (allInputLines.shift())[1];

      // If gridHeightToProcess is 0 or undefined, it means no more grids to process
      if (!gridHeightToProcess) {
        break; // Exit the loop
      }

      // Extract the current grid from the collected input lines
      // The grid consists of 'gridHeightToProcess' lines following the header
      currentGrid = allInputLines.slice(0, gridHeightToProcess);

      // Iterate through each cell of the current grid
      for (colIterator = 0; colIterator < currentGrid[0].length; colIterator++) {
        for (rowIterator = 0; rowIterator < currentGrid.length; rowIterator++) {
          // If a cell contains '1', it's the start of a new region
          if (currentGrid[rowIterator][colIterator]) {
            regionCounter++; // Increment the region count
            // Explore and mark all connected '1's in this region as '0'
            traverseAndMark(colIterator, rowIterator);
          }
        }
      }
      // Output the total number of regions found for the current grid
      console.log(regionCounter);

      // Remove the processed grid lines from the allInputLines array
      allInputLines = allInputLines.slice(gridHeightToProcess);
    }
  });
}).call(this); // Execute the IIFE with 'this' context
