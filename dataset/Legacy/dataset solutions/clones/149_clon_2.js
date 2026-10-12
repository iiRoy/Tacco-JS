(function(sourceData) {
  // Remove any trailing newline character and split the input into an array of lines.
  var lineSegments = sourceData.replace(/\n$/, '').split('\n');
  // Initialize a 2D array to represent the grid map.
  var gridMap = [];
  // Iterate through each line to populate the grid map.
  for (var idx = 0; idx < lineSegments.length; idx++) {
    // Convert each character in the line to a number and add it as a row to the grid.
    gridMap.push(lineSegments[idx].split('').map(Number));
  }
  // Start the path navigation from coordinates (0,0) with an initial direction 'R'.
  // The first 'R' is prepended to the result of the recursive navigation.
  console.log('R' + navigatePath(gridMap, 0, 0, 'R'));
})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read the entire content of /dev/stdin as a UTF-8 string.

/**
 * Recursively determines the path through a grid based on current position and direction.
 * This function attempts to move in a specific order of priority based on the current direction.
 *
 * @param {Array<Array<number>>} gridMap - The 2D array representing the grid, where 1 means traversable.
 * @param {number} coordX - The current X-coordinate (column index).
 * @param {number} coordY - The current Y-coordinate (row index).
 * @param {string} currentDirection - The current direction of movement ('R', 'L', 'D', 'U').
 * @returns {string} A string representing the sequence of moves taken.
 */
function navigatePath(gridMap, coordX, coordY, currentDirection) {
  // Log the current state for debugging purposes; this is a behavior-critical output.
  console.log(gridMap, coordX, coordY, currentDirection);

  // Base case: If the path returns to the origin (0,0) and the last attempted move was 'L',
  // it signifies the completion of a cycle or the end of the path.
  if (coordX === 0 && coordY === 0 && currentDirection === 'L') {
    return ''; // Return an empty string to terminate the recursion.
  }

  // Logic for moving when the current direction is 'R' (Right).
  if (currentDirection === 'R') {
    // Priority 1: Try to move Up-Right (x+1, y-1) and change direction to 'U'.
    if (checkGridCell(gridMap, coordX + 1, coordY - 1)) {
      return 'U' + navigatePath(gridMap, coordX + 1, coordY - 1, 'U');
    }
    // Priority 2: Try to move Right (x+1, y) and maintain direction 'R'.
    if (checkGridCell(gridMap, coordX + 1, coordY)) {
      return 'R' + navigatePath(gridMap, coordX + 1, coordY, 'R');
    }
    // Priority 3: Try to move Down-Right (x+1, y+1) and change direction to 'D'.
    if (checkGridCell(gridMap, coordX + 1, coordY + 1)) {
      return 'D' + navigatePath(gridMap, coordX + 1, coordY + 1, 'D');
    }
    // If no other moves are possible, turn Left (stay at current position conceptually for the turn).
    return 'L' + navigatePath(gridMap, coordX, coordY, 'L');
  }

  // Logic for moving when the current direction is 'L' (Left).
  if (currentDirection === 'L') {
    // Priority 1: Try to move Down (x, y+1) and change direction to 'D'.
    if (checkGridCell(gridMap, coordX, coordY + 1)) {
      return 'D' + navigatePath(gridMap, coordX, coordY + 1, 'D');
    }
    // Priority 2: Try to move Left (x-1, y) and maintain direction 'L'.
    if (checkGridCell(gridMap, coordX - 1, coordY)) {
      return 'L' + navigatePath(gridMap, coordX - 1, coordY, 'L');
    }
    // Priority 3: Try to move Up (x, y-1) and change direction to 'U'.
    if (checkGridCell(gridMap, coordX, coordY - 1)) {
      return 'U' + navigatePath(gridMap, coordX, coordY - 1, 'U');
    }
    // If no other moves are possible, turn Right.
    return 'R' + navigatePath(gridMap, coordX, coordY, 'R');
  }

  // Logic for moving when the current direction is 'D' (Down).
  if (currentDirection === 'D') {
    // Priority 1: Try to move Right (x, y+1) and change direction to 'R'.
    if (checkGridCell(gridMap, coordX, coordY + 1)) {
      return 'R' + navigatePath(gridMap, coordX, coordY + 1, 'R');
    }
    // Priority 2: Try to move Down (x, y+2) and maintain direction 'D'.
    if (checkGridCell(gridMap, coordX, coordY + 2)) {
      return 'D' + navigatePath(gridMap, coordX, coordY + 2, 'D');
    }
    // Priority 3: Try to move Left-Down (x-1, y+1) and change direction to 'L'.
    if (checkGridCell(gridMap, coordX - 1, coordY + 1)) {
      return 'L' + navigatePath(gridMap, coordX - 1, coordY + 1, 'L');
    }
    // If no other moves are possible, turn Up.
    return 'U' + navigatePath(gridMap, coordX, coordY, 'U');
  }

  // Logic for moving when the current direction is 'U' (Up).
  if (currentDirection === 'U') {
    // Priority 1: Try to move Left-Up (x-1, y-1) and change direction to 'L'.
    if (checkGridCell(gridMap, coordX - 1, coordY - 1)) {
      return 'L' + navigatePath(gridMap, coordX - 1, coordY - 1, 'L');
    }
    // Priority 2: Try to move Up (x, y-2) and maintain direction 'U'.
    if (checkGridCell(gridMap, coordX, coordY - 2)) {
      return 'U' + navigatePath(gridMap, coordX, coordY - 2, 'U');
    }
    // Priority 3: Try to move Right (x, y-1) and change direction to 'R'.
    if (checkGridCell(gridMap, coordX, coordY - 1)) {
      return 'R' + navigatePath(gridMap, coordX, coordY - 1, 'R');
    }
    // If no other moves are possible, turn Down.
    return 'D' + navigatePath(gridMap, coordX, coordY, 'D');
  }
}

/**
 * Checks if a given cell in the grid is within bounds and contains a traversable value (1).
 *
 * @param {Array<Array<number>>} gridMap - The 2D array representing the grid.
 * @param {number} coordX - The X-coordinate (column index) to check.
 * @param {number} coordY - The Y-coordinate (row index) to check.
 * @returns {number} Returns 1 (truthy) if the cell is valid and contains 1, otherwise 0 (falsy).
 */
function checkGridCell(gridMap, coordX, coordY) {
  // Check if the Y-coordinate is out of the vertical bounds of the grid.
  if (coordY < 0 || coordY >= gridMap.length) {
    return 0; // Out of bounds vertically.
  }
  // Check if the X-coordinate is out of the horizontal bounds for the specific row.
  if (coordX < 0 || coordX >= gridMap[coordY].length) {
    return 0; // Out of bounds horizontally.
  }
  // Return 1 if the cell contains a 1 (traversable), otherwise 0.
  return gridMap[coordY][coordX] === 1;
}
