(function(inputSourceData) {
  // This IIFE (Immediately Invoked Function Expression) encapsulates the main logic
  // for processing input and initiating the pathfinding algorithm.

  // Step 1: Process the raw input data.
  // Convert the input to a string, remove any trailing newline characters,
  // and then split it into an array of individual lines.
  const rawLines = String(inputSourceData).trimEnd().split('\n');

  // Step 2: Validate the processed input.
  // If no lines are provided or the first line is empty, it indicates invalid input.
  // An error message is logged, and the execution of the IIFE is terminated.
  if (rawLines.length === 0 || rawLines[0].length === 0) {
    console.error("Input processing error: No valid grid data found.");
    return;
  }

  // Helper function to parse a single string row into an array of numbers.
  // This improves modularity and readability.
  const parseGridRow = (rowString) => {
    // Splits the string into characters and converts each character to a number.
    return rowString.split('').map(char => Number(char));
  };

  // Step 3: Transform the array of string lines into a 2D array (matrix) of numbers.
  // Each row in the `rawLines` array is processed by `parseGridRow`.
  const gridMatrixRepresentation = rawLines.map(parseGridRow);

  // Step 4: Define the initial state for the pathfinding algorithm.
  // The path typically starts at the top-left corner (0,0) and begins by moving Right.
  const initialCoordinateX = 0;
  const initialCoordinateY = 0;
  const startingMovementDirection = 'R'; // 'R' for Right

  // Step 5: Execute the recursive pathfinding function.
  // The `findGridPath` function computes the sequence of moves.
  // The `startingMovementDirection` is prepended to the result, as per the original logic.
  const computedPathSequence = startingMovementDirection + findGridPath(
    gridMatrixRepresentation,
    initialCoordinateX,
    initialCoordinateY,
    startingMovementDirection
  );

  // Step 6: Output the final path sequence to the console.
  console.log(computedPathSequence);

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Input is read from standard input using Node.js 'fs' module.


/**
 * Recursively determines a path through a grid based on current position, direction,
 * and available traversable cells. This function implements the core pathfinding logic.
 *
 * @param {number[][]} currentGridMatrix - The current state of the 2D grid map.
 * @param {number} currentXPosition - The current X-coordinate (column index).
 * @param {number} currentYPosition - The current Y-coordinate (row index).
 * @param {string} currentFacingDirection - The current direction of movement ('R', 'L', 'U', 'D').
 * @returns {string} A string representing the segment of the path found from this point onward.
 */
function findGridPath(currentGridMatrix, currentXPosition, currentYPosition, currentFacingDirection) {
  // Base case for recursion:
  // If the path reaches the starting point (0,0) while trying to move 'L' (Left),
  // it signifies a specific termination condition for the pathfinding process.
  if (currentXPosition === 0 && currentYPosition === 0 && currentFacingDirection === 'L') {
    return ''; // An empty string indicates the end of the path segment.
  }

  // Use a switch statement to handle different movement directions cleanly.
  switch (currentFacingDirection) {
    case 'R': // Current direction is Right
      // Attempt to move Up-Right (U)
      if (canTraverseCell(currentGridMatrix, currentXPosition + 1, currentYPosition - 1)) {
        return 'U' + findGridPath(currentGridMatrix, currentXPosition + 1, currentYPosition - 1, 'U');
      }
      // If Up-Right is not possible, attempt to move purely Right (R)
      if (canTraverseCell(currentGridMatrix, currentXPosition + 1, currentYPosition)) {
        return 'R' + findGridPath(currentGridMatrix, currentXPosition + 1, currentYPosition, 'R');
      }
      // If Right is not possible, attempt to move Down-Right (D)
      if (canTraverseCell(currentGridMatrix, currentXPosition + 1, currentYPosition + 1)) {
        return 'D' + findGridPath(currentGridMatrix, currentXPosition + 1, currentYPosition + 1, 'D');
      }
      // Fallback: If no forward moves are possible, turn Left (L) and try again from the current spot.
      return 'L' + findGridPath(currentGridMatrix, currentXPosition, currentYPosition, 'L');

    case 'L': // Current direction is Left
      // Attempt to move Down-Left (D)
      if (canTraverseCell(currentGridMatrix, currentXPosition, currentYPosition + 1)) {
        return 'D' + findGridPath(currentGridMatrix, currentXPosition, currentYPosition + 1, 'D');
      }
      // If Down-Left is not possible, attempt to move purely Left (L)
      if (canTraverseCell(currentGridMatrix, currentXPosition - 1, currentYPosition)) {
        return 'L' + findGridPath(currentGridMatrix, currentXPosition - 1, currentYPosition, 'L');
      }
      // If Left is not possible, attempt to move Up-Left (U)
      if (canTraverseCell(currentGridMatrix, currentXPosition, currentYPosition - 1)) {
        return 'U' + findGridPath(currentGridMatrix, currentXPosition, currentYPosition - 1, 'U');
      }
      // Fallback: If no forward moves are possible, turn Right (R) and try again from the current spot.
      return 'R' + findGridPath(currentGridMatrix, currentXPosition, currentYPosition, 'R');

    case 'D': // Current direction is Down
      // Attempt to move Right-Down (R)
      if (canTraverseCell(currentGridMatrix, currentXPosition, currentYPosition + 1)) {
        return 'R' + findGridPath(currentGridMatrix, currentXPosition, currentYPosition + 1, 'R');
      }
      // If Right-Down is not possible, attempt to move further Down (D).
      // Note: The original logic involved moving two steps down (y+2). This is preserved.
      if (canTraverseCell(currentGridMatrix, currentXPosition, currentYPosition + 2)) {
        return 'D' + findGridPath(currentGridMatrix, currentXPosition, currentYPosition + 2, 'D');
      }
      // If further Down is not possible, attempt to move Left-Down (L)
      if (canTraverseCell(currentGridMatrix, currentXPosition - 1, currentYPosition + 1)) {
        return 'L' + findGridPath(currentGridMatrix, currentXPosition - 1, currentYPosition + 1, 'L');
      }
      // Fallback: If no forward moves are possible, turn Up (U) and try again from the current spot.
      return 'U' + findGridPath(currentGridMatrix, currentXPosition, currentYPosition, 'U');

    case 'U': // Current direction is Up
      // Attempt to move Left-Up (L)
      if (canTraverseCell(currentGridMatrix, currentXPosition - 1, currentYPosition - 1)) {
        return 'L' + findGridPath(currentGridMatrix, currentXPosition - 1, currentYPosition - 1, 'L');
      }
      // If Left-Up is not possible, attempt to move further Up (U).
      // Note: The original logic involved moving two steps up (y-2). This is preserved.
      if (canTraverseCell(currentGridMatrix, currentXPosition, currentYPosition - 2)) {
        return 'U' + findGridPath(currentGridMatrix, currentXPosition, currentYPosition - 2, 'U');
      }
      // If further Up is not possible, attempt to move Right-Up (R)
      if (canTraverseCell(currentGridMatrix, currentXPosition, currentYPosition - 1)) {
        return 'R' + findGridPath(currentGridMatrix, currentXPosition, currentYPosition - 1, 'R');
      }
      // Fallback: If no forward moves are possible, turn Down (D) and try again from the current spot.
      return 'D' + findGridPath(currentGridMatrix, currentXPosition, currentYPosition, 'D');

    default:
      // This case handles any unexpected or invalid `currentFacingDirection` values.
      // It logs a warning and returns an empty string, indicating an inability to proceed.
      console.warn(`Warning: Unrecognized movement direction encountered: '${currentFacingDirection}'. Path may be incomplete.`);
      return '';
  }
}

/**
 * Checks if a specific cell within the grid is valid (within bounds) and contains a traversable value (e.g., 1).
 * This function acts as a guard for all movement attempts.
 *
 * @param {number[][]} mapDataMatrix - The 2D array representing the grid structure.
 * @param {number} targetXCoord - The X-coordinate (column) of the cell to check.
 * @param {number} targetYCoord - The Y-coordinate (row) of the cell to check.
 * @returns {boolean} True if the cell is within the grid boundaries and its value is 1; otherwise, false.
 */
function canTraverseCell(mapDataMatrix, targetXCoord, targetYCoord) {
  // Robustness check: Ensure the provided matrix is indeed an array and not empty.
  if (!Array.isArray(mapDataMatrix) || mapDataMatrix.length === 0) {
    // console.error("Invalid or empty mapDataMatrix provided for cell traversal check.");
    return false;
  }

  // Validate the Y-coordinate (row index). It must be non-negative and less than the total number of rows.
  const isTargetRowWithinBounds = targetYCoord >= 0 && targetYCoord < mapDataMatrix.length;
  if (!isTargetRowWithinBounds) {
    return false;
  }

  // Retrieve the specific row to validate its column boundaries.
  const specificRow = mapDataMatrix[targetYCoord];

  // Robustness check: Ensure the retrieved row is an array and not empty, as rows could be malformed.
  if (!Array.isArray(specificRow) || specificRow.length === 0) {
    // console.warn(`Warning: Row at index ${targetYCoord} is malformed in mapDataMatrix.`);
    return false;
  }

  // Validate the X-coordinate (column index). It must be non-negative and less than the number of columns in the specific row.
  const isTargetColumnWithinBounds = targetXCoord >= 0 && targetXCoord < specificRow.length;
  if (!isTargetColumnWithinBounds) {
    return false;
  }

  // Finally, check if the value at the target cell is strictly equal to 1,
  // which typically represents a traversable path in such grid problems.
  return specificRow[targetXCoord] === 1;
}