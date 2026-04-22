#!/usr/bin/node
// This script processes a series of 2D grids (matrices) provided via standard input.
// It identifies and counts connected components of '1's within each grid,
// considering 8-directional connectivity (including diagonals).

(function() {
  // Collection to store all parsed numeric lines from standard input.
  // Each inner array represents a row of numbers.
  let parsedNumericLines = [];
  // Buffer to hold incomplete lines received from stdin.
  // This ensures that multi-chunk input lines are correctly reassembled.
  let partialLineBuffer = "";

  // Helper function to determine if a given coordinate (column, row) is
  // within the valid bounds of a provided 2D grid.
  // This helps prevent out-of-bounds errors during grid traversal.
  const isValidCoordinate = (currentGrid, col, row) => {
    // Ensure the grid itself is valid and has at least one row/column.
    if (!currentGrid || currentGrid.length === 0 || currentGrid[0].length === 0) {
      return false;
    }
    const totalRows = currentGrid.length;
    const totalCols = currentGrid[0].length;
    // Check if column and row indices are within their respective bounds.
    return col >= 0 && col < totalCols && row >= 0 && row < totalRows;
  };

  /**
   * Recursively explores and "clears" a connected component of '1's in a grid.
   * When a '1' is found, it's marked as '0' (cleared), and its 8 neighbors are
   * checked for further '1's to clear. This is a flood-fill-like algorithm.
   * @param {Array<Array<number>>} grid The 2D array representing the current matrix.
   * @param {number} currentColumn The column index of the current cell.
   * @param {number} currentRow The row index of the current cell.
   */
  const traverseConnectedRegion = (grid, currentColumn, currentRow) => {
    // Define all 8 possible neighbor offsets (deltaCol, deltaRow) including diagonals.
    // These offsets represent movements relative to the current cell.
    const neighborOffsets = [
      [-1, 0], [1, 0], [0, -1], [0, 1],     // Cardinal (horizontal/vertical) directions
      [-1, -1], [1, -1], [-1, 1], [1, 1]    // Diagonal directions
    ];

    // First, check if the current coordinate is within grid boundaries using the helper.
    // Also, verify that the cell at the current coordinates contains a '1'.
    // If it's not valid, or if the cell value is already 0 (or falsy),
    // then there's nothing to process further from this point.
    if (!isValidCoordinate(grid, currentColumn, currentRow) || grid[currentRow][currentColumn] !== 1) {
      return; // Base case for recursion: out of bounds or already processed/empty cell.
    }

    // Mark the current cell as visited/cleared by setting its value to 0.
    // This prevents re-processing the same cell and infinite recursion within a component.
    grid[currentRow][currentColumn] = 0;

    // Recursively call this function for all 8 neighbors.
    // This ensures the entire connected component is traversed and cleared.
    for (const [deltaCol, deltaRow] of neighborOffsets) {
      const nextCol = currentColumn + deltaCol;
      const nextRow = currentRow + deltaRow;
      traverseConnectedRegion(grid, nextCol, nextRow);
    }
  };

  // Set up standard input stream for reading user input.
  const inputSource = process.openStdin();
  // Ensure the input is treated as UTF-8 encoded text.
  inputSource.setEncoding('utf8');

  // Event listener for incoming data chunks from stdin.
  inputSource.on('data', (incomingData) => {
    // Concatenate any previous partial line with the new incoming data.
    // This handles cases where a line might be split across multiple data chunks.
    const combinedInput = partialLineBuffer + incomingData;
    // Split the combined input by newline characters.
    // The last element might be an incomplete line, so it's handled separately.
    const linesFromBuffer = combinedInput.split("\n");

    // Store the last element back into the partial line buffer if it's incomplete.
    // If the input ended perfectly with a newline, this will be an empty string.
    partialLineBuffer = linesFromBuffer.pop();

    // Process each complete line received.
    for (const lineText of linesFromBuffer) {
      // Skip empty lines or lines containing only whitespace characters.
      if (lineText.trim() === '') {
        continue;
      }

      // Parse the current line: split by space, then convert each part to a number.
      // Example: "1 0 1" becomes [1, 0, 1]
      const numericRowValues = lineText.split(" ").map(val => {
        const num = Number(val); // Use Number() for conversion.
        // Basic validation: ensure the parsed value is a valid number.
        // If not, log a warning and default to 0 to prevent errors downstream.
        if (isNaN(num)) {
          console.error(`Warning: Non-numeric value "${val}" encountered in input. Defaulting to 0.`);
          return 0;
        }
        return num;
      });

      // Add the fully parsed numeric row to our collection of all input lines.
      parsedNumericLines.push(numericRowValues);
    }
  });

  // Event listener for the end of the standard input stream.
  // This signals that all input has been received and can now be processed.
  inputSource.on('end', () => {
    let currentMatrixIndex = 0; // Tracks our current position in the `parsedNumericLines` array.

    // Loop indefinitely until there are no more matrices to process from the input.
    while (true) {
      // Check if there's enough data left to read a matrix header (width and height).
      // A header requires at least one line (the dimension line).
      if (currentMatrixIndex >= parsedNumericLines.length) {
        break; // No more matrix definitions available, exit loop.
      }

      // The first line of each matrix block contains its dimensions (Width, Height).
      // We assume the format is "W H".
      const dimensionLine = parsedNumericLines[currentMatrixIndex];
      // Immediately advance the index past the dimension line.
      currentMatrixIndex++;

      // Ensure the dimension line is valid and contains at least two numbers.
      if (!dimensionLine || dimensionLine.length < 2) {
        console.error("Error: Invalid or malformed dimension line encountered. Skipping this matrix block.");
        continue; // Move to the next potential matrix block.
      }

      // Extract width and height from the dimension line.
      const matrixWidth = dimensionLine[0];
      const matrixHeight = dimensionLine[1];

      // If matrixHeight is 0 or undefined, it's typically a signal to stop processing.
      // This matches the original code's `if(!h)break;` logic for termination.
      if (!matrixHeight) {
        break; // End of input signal or an empty matrix definition.
      }

      // Validate dimensions: ensure they are positive.
      if (matrixWidth <= 0 || matrixHeight <= 0) {
        console.error(`Warning: Invalid matrix dimensions (${matrixWidth}x${matrixHeight}) detected. Skipping this block.`);
        // Advance the index past the expected matrix data rows as well,
        // even if invalid, to avoid an infinite loop or misinterpretation of subsequent data.
        currentMatrixIndex += matrixHeight;
        continue; // Move to the next potential matrix block.
      }

      // Extract the actual matrix data rows based on the determined height.
      // Use slice() to create a shallow copy, preventing direct modification of `parsedNumericLines`.
      const currentGrid = parsedNumericLines.slice(currentMatrixIndex, currentMatrixIndex + matrixHeight);
      
      // After extracting the grid data, advance the index past these rows
      // so `currentMatrixIndex` points to the start of the next matrix block or end of data.
      currentMatrixIndex += matrixHeight;

      let detectedComponents = 0; // Counter for connected components in the current grid.

      // Iterate through each cell of the current grid to find '1's.
      // The outer loop iterates through rows (y-coordinate), and the inner loop through columns (x-coordinate).
      // This order is often more natural when accessing 2D arrays (e.g., `grid[row][col]`).
      for (let rowIndex = 0; rowIndex < matrixHeight; rowIndex++) {
        // Robustness check: Ensure the current row actually exists and has enough columns.
        // If a row is missing or too short, it indicates malformed input.
        if (!currentGrid[rowIndex] || currentGrid[rowIndex].length < matrixWidth) {
          console.error(`Warning: Row ${rowIndex} in the current grid is malformed or too short. Padding with zeros.`);
          // If a row is too short, pad it with zeros to match `matrixWidth`.
          // This prevents `undefined` access errors during iteration and ensures
          // the grid dimensions are consistent for processing.
          if (!currentGrid[rowIndex]) {
            currentGrid[rowIndex] = []; // Create an empty row if it was missing entirely.
          }
          while (currentGrid[rowIndex].length < matrixWidth) {
            currentGrid[rowIndex].push(0);
          }
        }

        for (let colIndex = 0; colIndex < matrixWidth; colIndex++) {
          // If a '1' is found, it signifies the start of a new, unvisited connected component.
          if (currentGrid[rowIndex][colIndex] === 1) {
            detectedComponents++; // Increment the component counter.
            // Recursively clear this entire component by setting all its '1's to '0'.
            // This prevents counting parts of the same component multiple times.
            traverseConnectedRegion(currentGrid, colIndex, rowIndex);
          }
        }
      }
      
      // Output the total number of components found for the current grid.
      console.log(detectedComponents);
    }
  });
}).call(this); // Execute the anonymous function immediately, binding 'this' to the global object.