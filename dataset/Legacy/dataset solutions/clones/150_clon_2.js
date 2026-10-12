(function(rawData) {
  // Remove any trailing newline character and split the input string into an array of lines.
  var linesArray = rawData.replace(/\n$/, '').split('\n');
  // Initialize a 2D array (matrix) to store the parsed grid data.
  var gridData = [];

  // Iterate over each line to convert it into a row of numbers in the grid.
  for (var idx = 0; idx < linesArray.length; idx++) {
    // Split the current line into individual characters, convert each to a number,
    // and then add this new row to our gridData matrix.
    gridData.push(linesArray[idx].split('').map(Number));
  }

  // Initiate the grid traversal from the starting point (0,0) with an initial direction 'R'.
  // The problem specifies an 'R' prefix for the final output path.
  console.log('R' + navigateGrid(gridData, 0, 0, 'R'));
})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read the entire content of /dev/stdin as a UTF-8 string.

/**
 * Recursively determines the path through a grid based on specific movement rules.
 * The function attempts to move in a preferred order for each direction.
 *
 * @param {Array<Array<number>>} pathMatrix - The 2D array representing the grid, where 1 indicates a traversable cell.
 * @param {number} currentX - The current column index (X-coordinate) in the grid.
 * @param {number} currentY - The current row index (Y-coordinate) in the grid.
 * @param {string} currentDirection - The current facing direction ('R', 'L', 'D', 'U').
 * @returns {string} A string representing the sequence of moves taken to reach the termination condition.
 */
function navigateGrid(pathMatrix, currentX, currentY, currentDirection) {
  // This line is commented out but could be used for debugging the function's state.
  // console.log(pathMatrix, currentX, currentY, currentDirection);

  // Base case for recursion: If the path returns to (0,0) facing 'L', the cycle is complete.
  if (currentX === 0 && currentY === 0 && currentDirection === 'L') {
    return '';
  }

  // --- Movement logic based on the current direction ---

  // If currently facing Right ('R')
  if (currentDirection === 'R') {
    // 1. Try moving Up-Right
    if (checkCell(pathMatrix, currentX + 1, currentY - 1)) {
      return 'U' + navigateGrid(pathMatrix, currentX + 1, currentY - 1, 'U');
    }
    // 2. Try moving Straight Right
    if (checkCell(pathMatrix, currentX + 1, currentY)) {
      return 'R' + navigateGrid(pathMatrix, currentX + 1, currentY, 'R');
    }
    // 3. Try moving Down-Right
    if (checkCell(pathMatrix, currentX + 1, currentY + 1)) {
      return 'D' + navigateGrid(pathMatrix, currentX + 1, currentY + 1, 'D');
    }
    // If no forward moves are possible, turn Left and try from the current position.
    return 'L' + navigateGrid(pathMatrix, currentX, currentY, 'L');
  }

  // If currently facing Left ('L')
  if (currentDirection === 'L') {
    // 1. Try moving Down-Left
    if (checkCell(pathMatrix, currentX, currentY + 1)) {
      return 'D' + navigateGrid(pathMatrix, currentX, currentY + 1, 'D');
    }
    // 2. Try moving Straight Left
    if (checkCell(pathMatrix, currentX - 1, currentY)) {
      return 'L' + navigateGrid(pathMatrix, currentX - 1, currentY, 'L');
    }
    // 3. Try moving Up-Left
    if (checkCell(pathMatrix, currentX, currentY - 1)) {
      return 'U' + navigateGrid(pathMatrix, currentX, currentY - 1, 'U');
    }
    // If no forward moves are possible, turn Right and try from the current position.
    return 'R' + navigateGrid(pathMatrix, currentX, currentY, 'R');
  }

  // If currently facing Down ('D')
  if (currentDirection === 'D') {
    // 1. Try moving Right-Down
    if (checkCell(pathMatrix, currentX, currentY + 1)) {
      return 'R' + navigateGrid(pathMatrix, currentX, currentY + 1, 'R');
    }
    // 2. Try moving Straight Down (two steps)
    if (checkCell(pathMatrix, currentX, currentY + 2)) {
      return 'D' + navigateGrid(pathMatrix, currentX, currentY + 2, 'D');
    }
    // 3. Try moving Left-Down
    if (checkCell(pathMatrix, currentX - 1, currentY + 1)) {
      return 'L' + navigateGrid(pathMatrix, currentX - 1, currentY + 1, 'L');
    }
    // If no forward moves are possible, turn Up and try from the current position.
    return 'U' + navigateGrid(pathMatrix, currentX, currentY, 'U');
  }

  // If currently facing Up ('U')
  if (currentDirection === 'U') {
    // 1. Try moving Left-Up
    if (checkCell(pathMatrix, currentX - 1, currentY - 1)) {
      return 'L' + navigateGrid(pathMatrix, currentX - 1, currentY - 1, 'L');
    }
    // 2. Try moving Straight Up (two steps)
    if (checkCell(pathMatrix, currentX, currentY - 2)) {
      return 'U' + navigateGrid(pathMatrix, currentX, currentY - 2, 'U');
    }
    // 3. Try moving Right-Up
    if (checkCell(pathMatrix, currentX, currentY - 1)) {
      return 'R' + navigateGrid(pathMatrix, currentX, currentY - 1, 'R');
    }
    // If no forward moves are possible, turn Down and try from the current position.
    return 'D' + navigateGrid(pathMatrix, currentX, currentY, 'D');
  }
}

/**
 * Checks if a specified cell in the grid is within bounds and contains a '1' (traversable).
 *
 * @param {Array<Array<number>>} gridRef - The 2D array representing the grid.
 * @param {number} targetX - The X-coordinate (column) of the cell to check.
 * @param {number} targetY - The Y-coordinate (row) of the cell to check.
 * @returns {boolean} True if the cell is valid and traversable (value is 1), false otherwise.
 */
function checkCell(gridRef, targetX, targetY) {
  // First, check if the target Y-coordinate is within the vertical bounds of the grid.
  if (targetY < 0 || targetY >= gridRef.length) {
    return false; // Out of vertical bounds.
  }
  // Next, check if the target X-coordinate is within the horizontal bounds of the specific row.
  if (targetX < 0 || targetX >= gridRef[targetY].length) {
    return false; // Out of horizontal bounds for this row.
  }
  // If within bounds, return true if the cell's value is 1, indicating it's traversable.
  return gridRef[targetY][targetX] === 1;
}
