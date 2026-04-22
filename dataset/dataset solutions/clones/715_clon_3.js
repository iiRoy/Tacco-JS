#!/usr/bin/node
(function() {
  // This array will store all parsed input lines, acting as a queue
  // of data blocks (matrix dimensions followed by matrix rows).
  let bufferedInputBlocks = [];

  // This variable will hold the current grid (matrix) being processed.
  // Its cells will be modified during the component counting process.
  let currentGrid = [];

  // Initialize the standard input stream reader.
  // We'll read input as UTF-8 encoded text.
  const inputReader = process.openStdin();
  inputReader.setEncoding('utf8');

  /**
   * Recursively explores a connected region of 'active' cells (value 1)
   * starting from a given coordinate (currentX, currentY).
   * All visited 'active' cells are marked as 'inactive' (value 0) to prevent re-counting.
   *
   * @param {number} currentX   The X-coordinate (column index) of the current cell.
   * @param {number} currentY   The Y-coordinate (row index) of the current cell.
   * @param {number} gridWidth  The total width (number of columns) of the grid.
   * @param {number} gridHeight The total height (number of rows) of the grid.
   */
  const clearConnectedRegion = (currentX, currentY, gridWidth, gridHeight) => {
    // Define the 8 possible directions to check for neighboring cells:
    // [dx, dy] where dx is change in x, dy is change in y.
    const neighborOffsets = [
      [-1, 0], [1, 0], [0, -1], [0, 1],       // Cardinal (horizontal/vertical)
      [-1, -1], [-1, 1], [1, -1], [1, 1]      // Diagonal
    ];

    // Helper function to check if a given coordinate is within the grid boundaries.
    const isWithinBounds = (x, y) => {
      return x >= 0 && x < gridWidth && y >= 0 && y < gridHeight;
    };

    // Base case for recursion:
    // 1. If the current cell is outside the grid boundaries.
    // 2. If the current row (currentGrid[currentY]) doesn't exist or the cell itself doesn't exist.
    // 3. If the cell's value is not 1 (meaning it's already visited, 0, or not an active part of a component).
    if (!isWithinBounds(currentX, currentY) ||
        !currentGrid[currentY] ||
        currentGrid[currentY][currentX] !== 1) {
      return;
    }

    // Mark the current cell as visited by changing its value from 1 to 0.
    currentGrid[currentY][currentX] = 0;

    // Recursively call this function for all 8 neighboring cells.
    for (const [deltaX, deltaY] of neighborOffsets) {
      clearConnectedRegion(currentX + deltaX, currentY + deltaY, gridWidth, gridHeight);
    }
  };

  // Buffer to store any incomplete line fragments received from stdin.
  let partialLineBuffer = "";

  // Event listener for incoming data chunks from the standard input.
  inputReader.on('data', (incomingData) => {
    // Combine any previous partial line with the new data chunk.
    const combinedInput = partialLineBuffer + incomingData;
    // Split the combined string into individual lines based on newline characters.
    let processedLines = combinedInput.split("\n");

    // The last element of 'processedLines' might be an incomplete line;
    // store it back into 'partialLineBuffer' for the next 'data' event.
    partialLineBuffer = processedLines.pop();

    // Iterate through each complete line received.
    for (let lineIndex = 0; lineIndex < processedLines.length; lineIndex++) {
      const currentLine = processedLines[lineIndex].trim(); // Remove leading/trailing whitespace.

      // Skip processing if the line is empty after trimming.
      if (currentLine === '') {
        continue;
      }

      // Parse the line: split by spaces and convert each part to an integer.
      const parsedRowData = currentLine.split(" ").map(str => {
        const numValue = parseInt(str, 10); // Use radix 10 for explicit decimal parsing.
        // Basic validation: if parsing results in NaN, treat it as an invalid number.
        if (isNaN(numValue)) {
          // console.warn(`Non-numeric data found: '${str}'. Skipping this value.`);
          return null; // Filter out invalid numbers later.
        }
        return numValue;
      }).filter(value => value !== null); // Remove any nulls (invalid numbers) from the array.

      // If the parsed row contains valid numbers, add it to our buffer.
      if (parsedRowData.length > 0) {
        bufferedInputBlocks.push(parsedRowData);
      }
    }
  });

  // Event listener for when the standard input stream ends (EOF).
  inputReader.on('end', () => {
    let totalComponentCount; // Variable to store the count of connected components for each grid.

    // Continue processing buffered input blocks until no more grids are available.
    while (true) {
      totalComponentCount = 0; // Reset the counter for each new grid.

      // The first line of each input block contains dimension information [width, height].
      const dimensionInfo = bufferedInputBlocks.shift();

      // If no dimension information is available, or it's not a valid array,
      // it means there are no more grids to process, so break the loop.
      if (!dimensionInfo || !Array.isArray(dimensionInfo) || dimensionInfo.length < 2) {
        break;
      }

      const gridWidth = dimensionInfo[0];  // The width (number of columns) of the current grid.
      const gridHeight = dimensionInfo[1]; // The height (number of rows) of the current grid.

      // Extract the actual grid data rows based on the reported height.
      // This is equivalent to `S.slice(0, h)` in the original code.
      currentGrid = bufferedInputBlocks.slice(0, gridHeight);

      // Remove the extracted grid data from the buffered input,
      // leaving only the remaining blocks for subsequent processing.
      // This is equivalent to `S = S.slice(h)` in the original code.
      bufferedInputBlocks = bufferedInputBlocks.slice(gridHeight);

      // Optional: Basic validation to check if the extracted grid matches reported dimensions.
      if (currentGrid.length !== gridHeight || (gridHeight > 0 && currentGrid[0].length !== gridWidth)) {
        // console.warn(`Dimension mismatch for grid (W:${gridWidth}, H:${gridHeight}). Actual grid: ${currentGrid.length} rows.`);
        // Depending on requirements, one might skip this grid or try to proceed.
        // For this clone, we proceed, but the warning indicates a potential input issue.
      }

      // Iterate through each cell of the current grid to find active components.
      // We iterate row by row (y-coordinate), then column by column (x-coordinate).
      for (let yCoord = 0; yCoord < gridHeight; yCoord++) {
        // Ensure the current row exists and has the expected width before processing its cells.
        if (!currentGrid[yCoord] || currentGrid[yCoord].length !== gridWidth) {
            // console.warn(`Row ${yCoord} in grid has unexpected length or is missing. Skipping.`);
            continue; // Skip malformed rows to prevent errors.
        }
        for (let xCoord = 0; xCoord < gridWidth; xCoord++) {
          // If a cell contains an 'active' value (explicitly 1), it signifies the start
          // of a new connected component that hasn't been visited yet.
          if (currentGrid[yCoord][xCoord] === 1) {
            totalComponentCount++; // Increment the count of distinct components.
            // Start the recursive flood-fill-like exploration to mark all cells
            // belonging to this component as visited (changing their value to 0).
            clearConnectedRegion(xCoord, yCoord, gridWidth, gridHeight);
          }
        }
      }

      // After processing the entire grid, print the total number of connected components found.
      console.log(totalComponentCount);
    }
  });
}).call(this);