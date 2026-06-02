const processGridData = (inputLines) => {
  // Parse grid dimensions from the first line of input
  let gridHeight = inputLines[0].split(" ")[0] - 0;
  let gridWidth = inputLines[0].split(" ")[1] - 0;

  // Initialize data structures for grid, horizontal path lengths, vertical path lengths, and traversable cell keys
  const gridCells = {};
  const horizontalPathData = {}; // Stores info about horizontal path segments ending at a cell
  const verticalPathData = {};   // Stores info about vertical path segments ending at a cell
  const traversableCellKeys = []; // List of keys for cells that are not walls

  // Iterate through each row of the grid
  for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    // Store the current row's string representation
    gridCells[rowIdx] = inputLines[rowIdx + 1];

    // Iterate through each column in the current row
    for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
      // Construct keys for adjacent cells (up and left) and the current cell
      const upCellKey = (rowIdx - 1) + "_" + colIdx;
      const leftCellKey = rowIdx + "_" + (colIdx - 1);
      const currentCellKey = rowIdx + "_" + colIdx;

      // Check if the current cell is a wall ('#')
      if (gridCells[rowIdx][colIdx] === "#") {
        // If it's a wall, skip processing for this cell
        continue;
      } else {
        // If it's a traversable cell, add its key to the list
        traversableCellKeys.push(currentCellKey);

        // Process horizontal path data
        if (horizontalPathData[leftCellKey]) {
          // If there's a horizontal path segment from the left, extend it
          horizontalPathData[currentCellKey] = horizontalPathData[leftCellKey];
          horizontalPathData[currentCellKey].segmentLength++;
        } else {
          // Otherwise, start a new horizontal path segment
          horizontalPathData[currentCellKey] = { segmentLength: 1 };
        }

        // Process vertical path data
        if (verticalPathData[upCellKey]) {
          // If there's a vertical path segment from above, extend it
          verticalPathData[currentCellKey] = verticalPathData[upCellKey];
          verticalPathData[currentCellKey].segmentLength++;
        } else {
          // Otherwise, start a new vertical path segment
          verticalPathData[currentCellKey] = { segmentLength: 1 };
        }
      }
    }
  }

  // Initialize the maximum path length found
  let maxPathLength = 0;
  let cellIdentifier;

  // Iterate through the traversable cell keys in reverse order
  for (let idx = traversableCellKeys.length - 1; idx >= 0; idx--) {
    cellIdentifier = traversableCellKeys[idx];

    // Calculate the path length for the current cell (vertical segment + horizontal segment - 1 for the cell itself)
    // Update the maximum path length if the current cell's path is longer
    maxPathLength = Math.max(maxPathLength, verticalPathData[cellIdentifier].segmentLength + horizontalPathData[cellIdentifier].segmentLength - 1);

    // Optimization: If the maximum possible path length (H+W-1) is reached, no need to check further
    if (maxPathLength === gridHeight + gridWidth - 1) {
      break;
    }
  }

  // Output the final maximum path length
  console.log(maxPathLength);
};

// Read input from standard input, process it, and pass to the main function
processGridData(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));
