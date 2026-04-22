const processGridData = (inputLines) => {
  // This function takes an array of strings representing grid data
  // and computes the longest possible path of open cells.

  // Parse the grid dimensions from the initial input string.
  let gridDimensions = inputLines[0].split(" ");
  const gridHeight = parseInt(gridDimensions[0], 10); // The total number of vertical cells.
  const gridWidth = parseInt(gridDimensions[1], 10);   // The total number of horizontal cells.

  // Initialize data structures to store grid layout and path information.
  const gridRows = {};          // An object to hold each row's string content, indexed by row number.
  const horizontalPaths = {};   // Maps cell coordinates to an object containing its horizontal path length.
  const verticalPaths = {};     // Maps cell coordinates to an object containing its vertical path length.
  const traversableCells = [];  // An array to keep track of all cells that are not blocked by an obstacle.

  // Iterate over each cell in the grid to populate path length data.
  for (let rowIdx = 0; rowIdx < gridHeight; ++rowIdx) {
    gridRows[rowIdx] = inputLines[rowIdx + 1]; // Store the string for the current row.

    for (let colIdx = 0; colIdx < gridWidth; ++colIdx) {
      // Construct unique string identifiers for the current cell and its neighbors.
      const aboveCellId = `${rowIdx - 1}_${colIdx}`; // Identifier for the cell directly above.
      const leftCellId = `${rowIdx}_${colIdx - 1}`;   // Identifier for the cell directly to the left.
      const currentCellId = `${rowIdx}_${colIdx}`;     // Identifier for the cell currently being processed.

      // Check if the current cell is an obstacle ('#') or an open path.
      if (gridRows[rowIdx][colIdx] === "#") {
        // If it's an obstacle, no path can pass through it; skip.
      } else {
        // If it's an open cell, add its identifier to the list of traversable cells.
        traversableCells.push(currentCellId);

        // Determine the horizontal path length ending at this cell.
        // If the cell to the left was part of a horizontal path, extend it.
        if (horizontalPaths[leftCellId]) {
          horizontalPaths[currentCellId] = horizontalPaths[leftCellId];
          horizontalPaths[currentCellId].pathCount++; // Increment the path length.
        } else {
          // Otherwise, this cell starts a new horizontal path of length 1.
          horizontalPaths[currentCellId] = { pathCount: 1 };
        }

        // Determine the vertical path length ending at this cell.
        // If the cell above was part of a vertical path, extend it.
        if (verticalPaths[aboveCellId]) {
          verticalPaths[currentCellId] = verticalPaths[aboveCellId];
          verticalPaths[currentCellId].pathCount++; // Increment the path length.
        } else {
          // Otherwise, this cell starts a new vertical path of length 1.
          verticalPaths[currentCellId] = { pathCount: 1 };
        }
      }
    }
  }

  let maxPathLength = 0; // Initialize the variable to store the maximum path found.
  let cellCoordinateIdentifier; // A temporary variable to hold the current cell's identifier.

  // Iterate backwards through the list of traversable cells to compute the longest path.
  // This iteration order is consistent with the original code's approach.
  for (let cellIndex = traversableCells.length - 1; cellIndex >= 0; cellIndex--) {
    cellCoordinateIdentifier = traversableCells[cellIndex];
    // The total path length through a cell is the sum of its horizontal and vertical
    // path counts, minus one (because the current cell is counted in both).
    maxPathLength = Math.max(maxPathLength, verticalPaths[cellCoordinateIdentifier].pathCount + horizontalPaths[cellCoordinateIdentifier].pathCount - 1);

    // Optimization: if the theoretical maximum path (gridHeight + gridWidth - 1) is reached,
    // no longer paths are possible, so we can exit early.
    if (maxPathLength === gridHeight + gridWidth - 1) break;
  }

  // Display the final computed maximum path length.
  console.log(maxPathLength);
};

// Read the input from standard input, decode it, clean it, split it into lines,
// and then pass it to our grid processing function.
processGridData(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));