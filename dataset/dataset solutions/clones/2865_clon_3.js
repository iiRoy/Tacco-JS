const processGridData = (inputLines) => {
  // Validate input: Ensure lines are provided
  if (!inputLines || inputLines.length === 0) {
    console.error("Input data is missing or empty. Cannot process grid.");
    return;
  }

  // Parse grid dimensions from the first line of input
  const initialLineParts = inputLines[0].split(" ");
  const gridHeight = parseInt(initialLineParts[0], 10);
  const gridWidth = parseInt(initialLineParts[1], 10);

  // Validate parsed dimensions
  if (isNaN(gridHeight) || isNaN(gridWidth) || gridHeight <= 0 || gridWidth <= 0) {
    console.error("Invalid grid dimensions detected. Height and Width must be positive integers.");
    return;
  }
  
  // A mapping to store the character layout of the grid cells
  const cellCharLayout = {}; 
  // Registry to track contiguous horizontal path segment lengths
  const horizontalSegmentRegistry = {}; 
  // Registry to track contiguous vertical path segment lengths
  const verticalSegmentRegistry = {}; 
  // A collection of string keys representing all traversable cell coordinates
  const discoverableCellKeys = [];

  // Helper function to create a unique string key for a cell's coordinates
  const generateCellKey = (r, c) => `${r}_${c}`;

  // Loop through each row of the grid to populate layouts and calculate initial path segments
  for (let currentRow = 0; currentRow < gridHeight; currentRow++) {
    const rowContent = inputLines[currentRow + 1];
    // Validate each row's content
    if (!rowContent || rowContent.length !== gridWidth) {
        console.error(`Row ${currentRow} has an incorrect length or is missing. Expected ${gridWidth} characters.`);
        return;
    }
    cellCharLayout[currentRow] = rowContent; // Store the row string

    for (let currentCol = 0; currentCol < gridWidth; currentCol++) {
      const currentCellCharacter = cellCharLayout[currentRow][currentCol];
      const currentCellIdentifier = generateCellKey(currentRow, currentCol);

      // If the current cell is an obstacle ('#'), skip all path calculations for it
      if (currentCellCharacter === '#') {
        continue; 
      }

      // Add the identifier of this traversable cell to our list
      discoverableCellKeys.push(currentCellIdentifier);

      // --- Determine horizontal path segment length ---
      const leftAdjacentCellIdentifier = generateCellKey(currentRow, currentCol - 1);
      if (currentCol > 0 && horizontalSegmentRegistry[leftAdjacentCellIdentifier]) {
        // If the cell to the left was traversable and part of a horizontal path, extend that path
        horizontalSegmentRegistry[currentCellIdentifier] = horizontalSegmentRegistry[leftAdjacentCellIdentifier];
        horizontalSegmentRegistry[currentCellIdentifier].lengthCount++; // Increment count on the shared object reference
      } else {
        // Otherwise, this cell starts a new horizontal path segment
        horizontalSegmentRegistry[currentCellIdentifier] = { lengthCount: 1 };
      }

      // --- Determine vertical path segment length ---
      const aboveAdjacentCellIdentifier = generateCellKey(currentRow - 1, currentCol);
      if (currentRow > 0 && verticalSegmentRegistry[aboveAdjacentCellIdentifier]) {
        // If the cell directly above was traversable and part of a vertical path, extend that path
        verticalSegmentRegistry[currentCellIdentifier] = verticalSegmentRegistry[aboveAdjacentCellIdentifier];
        verticalSegmentRegistry[currentCellIdentifier].lengthCount++; // Increment count on the shared object reference
      } else {
        // Otherwise, this cell starts a new vertical path segment
        verticalSegmentRegistry[currentCellIdentifier] = { lengthCount: 1 };
      }
    }
  }

  let maximumLPathLength = 0;
  // The maximum possible path length in an HxW grid is H + W - 1 (e.g., a straight line or an L-shape filling the grid)
  const absoluteMaxPossiblePath = gridHeight + gridWidth - 1; 

  // Iterate through all discovered traversable cells, starting from the end
  // (the order of iteration for calculating the max path doesn't strictly matter here,
  // but reversing matches the original code's pattern for Type III cloning)
  for (let cellIndex = discoverableCellKeys.length - 1; cellIndex >= 0; cellIndex--) {
    const currentCellKey = discoverableCellKeys[cellIndex];
    
    // Retrieve the calculated path lengths for the current cell
    const currentHorizontalLength = horizontalSegmentRegistry[currentCellKey] ? horizontalSegmentRegistry[currentCellKey].lengthCount : 0;
    const currentVerticalLength = verticalSegmentRegistry[currentCellKey] ? verticalSegmentRegistry[currentCellKey].lengthCount : 0;

    // Calculate the combined length of the 'L' shape path ending at this cell.
    // We subtract 1 because the current cell itself is included in both the horizontal and vertical counts.
    const combinedPathAtCurrentCell = currentHorizontalLength + currentVerticalLength - 1; 

    // Update the overall maximum L-shaped path length found so far
    if (combinedPathAtCurrentCell > maximumLPathLength) {
      maximumLPathLength = combinedPathAtCurrentCell;
    }

    // Optimization: If we've already found the theoretical maximum path,
    // no further calculations are needed.
    if (maximumLPathLength === absoluteMaxPossiblePath) {
      break; 
    }
  }

  // Output the final result
  console.log(maximumLPathLength);
};

// Entry point: Read input from standard input and initiate processing
try {
  const fileData = require('fs').readFileSync('/dev/stdin', 'UTF-8');
  const processedInputContent = fileData.trim();
  const inputLinesArray = processedInputContent.split("\n");
  processGridData(inputLinesArray);
} catch (error) {
  // Handle any errors that occur during file reading or initial processing
  console.error("An error occurred during input reading or processing:", error.message);
}