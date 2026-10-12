console.log(((inputData) => {
  // The input string is first trimmed and split by newline characters.
  // The first line contains dimensions, and subsequent lines represent the grid.
  const [dimensionsStr, ...inputRows] = inputData.trim().split('\n');

  // Parse the dimensions from the first line.
  // H (heightVal), W (widthVal) are used; K (numCuts) is read but not utilized in this logic.
  const [heightVal, widthVal, numCuts] = dimensionsStr.split(' ').map(valStr => 0 | valStr);

  // Initialize a 2D array (matrix) with dimensions H x W, filled with zeros.
  // This matrix will store the assigned group IDs for each cell.
  const gridMatrix = Array.from({ length: heightVal }, () => Array(widthVal).fill(0));

  // This helper function is crucial for propagating group IDs.
  // If a cell at (rowIdx, colIdx) already has a non-zero group ID, that ID is used.
  // Otherwise, if a currentGroup is provided (and non-zero), it's assigned to the cell.
  // This ensures that once a cell is part of a group, its ID doesn't change,
  // and empty cells adjacent to a group can be filled.
  const fillCell = (rowIdx, colIdx, currentGroup) => {
    return gridMatrix[rowIdx][colIdx]
      ? (currentGroup = gridMatrix[rowIdx][colIdx]) // If cell already has a group, use it.
      : currentGroup                                // Otherwise, if currentGroup is valid, assign it.
        ? (gridMatrix[rowIdx][colIdx] = currentGroup)
        : currentGroup;                             // If currentGroup is 0, keep it 0.
  };

  // A global counter to assign unique IDs to distinct '#' characters found.
  let globalGroupCounter = 0;

  // First major pass: Iterate through each row of the input.
  // This pass handles horizontal propagation of group IDs.
  for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
    let currentGroup = 0; // Group ID for the current row's processing.

    // Forward scan (left to right) within the current row.
    // If a '#' is found, a new unique group ID is assigned.
    // This ID is then propagated to subsequent cells in the row.
    for (let colIdx = 0; colIdx < widthVal; colIdx++) {
      if (inputRows[rowIdx][colIdx] === '#') {
        currentGroup = ++globalGroupCounter; // Assign a new, incremented group ID.
      }
      gridMatrix[rowIdx][colIdx] = currentGroup; // Store the current group ID in the matrix.
    }

    // Backward scan (right to left) within the current row.
    // This ensures that any empty cells to the left of a '#' (which might have been 0 initially)
    // correctly receive the group ID from the '#' or a cell to its right.
    for (let colIdx = widthVal - 1; colIdx >= 0; colIdx--) {
      currentGroup = fillCell(rowIdx, colIdx, currentGroup);
    }
  }

  // Second major pass: Iterate through each column of the grid.
  // This pass handles vertical propagation of group IDs.
  for (let colIdx = 0; colIdx < widthVal; colIdx++) {
    let currentGroup = 0; // Group ID for the current column's processing.

    // Forward scan (top to bottom) within the current column.
    // Propagates group IDs downwards, filling any empty cells.
    for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
      currentGroup = fillCell(rowIdx, colIdx, currentGroup);
    }

    // Backward scan (bottom to top) within the current column.
    // Propagates group IDs upwards, ensuring empty cells above a filled cell
    // also receive the correct group ID.
    for (let rowIdx = heightVal - 1; rowIdx >= 0; rowIdx--) {
      currentGroup = fillCell(rowIdx, colIdx, currentGroup);
    }
  }

  // Format the final grid matrix into a string for output.
  // Each row's elements are joined by a space, and rows are joined by a newline.
  return gridMatrix.map(rowArr => rowArr.join(' ')).join('\n');

// The entire logic is wrapped in an Immediately Invoked Function Expression (IIFE).
// It reads input from standard input using Node.js 'fs' module.
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
