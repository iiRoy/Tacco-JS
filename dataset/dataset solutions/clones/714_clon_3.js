#!/usr/bin/node
(function() {
  "use strict"; // Enforce stricter parsing and error handling

  // Buffer to store complete lines read from standard input
  const bufferedInputLines = [];
  // Stores any incomplete line fragment received from 'data' event
  let pendingInputFragment = "";

  // Define offsets for 8-directional neighbor exploration (including diagonals)
  const DIRECTION_OFFSETS = [
    [-1, 0], [1, 0], [0, -1], [0, 1],       // Cardinal directions: Left, Right, Up, Down
    [-1, -1], [-1, 1], [1, -1], [1, 1]      // Diagonal directions: Top-Left, Top-Right, Bottom-Left, Bottom-Right
  ];

  /**
   * Recursively explores a connected region of '1's in a 2D grid,
   * marking visited cells as '0' to prevent re-counting.
   * This is a flood-fill algorithm.
   * @param {number} currentColumn The current column index to explore.
   * @param {number} currentRow The current row index to explore.
   * @param {number[][]} activeGrid The 2D array representing the current grid.
   */
  function exploreConnectedComponent(currentColumn, currentRow, activeGrid) {
    const gridRows = activeGrid.length;
    // Guard against empty grid or rows before accessing length
    const gridColumns = (gridRows > 0 && activeGrid[0]) ? activeGrid[0].length : 0;

    // Check boundary conditions and if the current cell is part of the component (value is 1)
    if (currentRow < 0 || currentRow >= gridRows ||
        currentColumn < 0 || currentColumn >= gridColumns ||
        activeGrid[currentRow][currentColumn] !== 1) { // Only proceed if it's an unvisited '1'
      return;
    }

    // Mark the current cell as visited by changing its value to 0
    activeGrid[currentRow][currentColumn] = 0;

    // Recursively call for all 8 neighbors
    for (const [deltaCol, deltaRow] of DIRECTION_OFFSETS) {
      exploreConnectedComponent(currentColumn + deltaCol, currentRow + deltaRow, activeGrid);
    }
  }

  // Initialize standard input stream
  const standardInputReader = process.openStdin();
  standardInputReader.setEncoding('utf8');

  // Event listener for incoming data chunks
  standardInputReader.on('data', (inputChunk) => {
    // Concatenate any previous pending fragment with the new chunk
    const fullBuffer = pendingInputFragment + inputChunk;
    // Split the buffer into lines. The last element might be an incomplete line.
    const linesFromChunk = fullBuffer.split('\n');
    // Store the last element back as a pending fragment
    pendingInputFragment = linesFromChunk.pop();

    // Process all complete lines
    for (const lineEntry of linesFromChunk) {
      const trimmedLine = lineEntry.trim();
      // Only add non-empty lines to our buffer
      if (trimmedLine.length > 0) {
        bufferedInputLines.push(trimmedLine);
      }
    }
  });

  // Event listener for end of input stream
  standardInputReader.on('end', () => {
    let totalGridsProcessed = 0; // Counter for processed grids

    // Continue processing buffered lines as long as there are any
    while (bufferedInputLines.length > 0) {
      // Attempt to read the grid height from the first line in the buffer
      const heightDeclarationLine = bufferedInputLines.shift();

      // Basic check if a line was actually retrieved (should be true if length > 0)
      if (typeof heightDeclarationLine === 'undefined') {
          console.error("Internal Error: Buffered lines unexpectedly empty while trying to read height.");
          break;
      }

      const currentGridHeight = parseInt(heightDeclarationLine, 10);

      // Validate the parsed height
      if (isNaN(currentGridHeight) || currentGridHeight <= 0) {
        console.error(`Warning: Detected an invalid grid height '${heightDeclarationLine}'. Skipping remaining input blocks.`);
        break; // Stop processing if height is not a valid positive integer
      }

      // Ensure enough lines are buffered for the declared grid height
      if (bufferedInputLines.length < currentGridHeight) {
          console.error(`Error: Insufficient data for a grid of height ${currentGridHeight}. Only ${bufferedInputLines.length} lines remain.`);
          break; // Cannot form the grid, so stop
      }

      // Extract the raw string rows for the current grid from the buffer
      const rawStringRows = bufferedInputLines.splice(0, currentGridHeight);

      let currentNumericGrid = [];
      let expectedRowWidth = -1; // Initialize to -1 to detect first row's length

      // Convert raw string rows into a 2D array of numbers (0 or 1)
      let gridParsingFailed = false;
      for (let rowIndex = 0; rowIndex < rawStringRows.length; rowIndex++) {
        const rowString = rawStringRows[rowIndex];

        // Determine expected width from the first row
        if (rowIndex === 0) {
          expectedRowWidth = rowString.length;
          if (expectedRowWidth === 0) {
            console.error("Warning: First row of grid has zero length. Skipping this grid block.");
            gridParsingFailed = true;
            break;
          }
        } else if (rowString.length !== expectedRowWidth) {
          // Validate consistent row length for subsequent rows
          console.error(`Warning: Inconsistent row length detected in grid. Expected ${expectedRowWidth}, got ${rowString.length} for row ${rowIndex}. Skipping this grid block.`);
          gridParsingFailed = true;
          break;
        }

        // Convert each character in the row string to an integer (0 or 1)
        currentNumericGrid.push(rowString.split('').map(char => parseInt(char, 10)));
      }

      if (gridParsingFailed) {
        continue; // Skip to the next potential grid block if parsing failed
      }

      totalGridsProcessed++; // Successfully parsed a grid

      let distinctComponentCount = 0; // Counter for connected components in the current grid

      // Iterate through the processed grid to find and count connected components
      // Using standard row-major order (row by row, then column by column)
      for (let rIdx = 0; rIdx < currentNumericGrid.length; rIdx++) {
        for (let cIdx = 0; cIdx < currentNumericGrid[rIdx].length; cIdx++) {
          if (currentNumericGrid[rIdx][cIdx] === 1) { // If an unvisited '1' is found
            distinctComponentCount++; // Increment component count
            // Start flood-fill from this point to mark all connected '1's as visited
            exploreConnectedComponent(cIdx, rIdx, currentNumericGrid);
          }
        }
      }

      // Output the total number of distinct connected components for the current grid
      console.log(distinctComponentCount);
    }

    // Optional: Log a message if no grids were processed
    if (totalGridsProcessed === 0) {
      // console.log("No valid grid data was processed from input.");
    }
  });
}).call(this); // Execute the anonymous function in the context of 'this' (global object for node)