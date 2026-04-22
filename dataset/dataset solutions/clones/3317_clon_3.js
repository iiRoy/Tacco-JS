let currentInputData; // Global variable to hold input, simulating a common competitive programming pattern

/**
 * Executes the main logic of the pathfinding problem.
 * This function processes the raw input, parses grid dimensions,
 * constructs the terrain map, and then computes the number of valid paths.
 * @param {string} rawProblemData - The entire input string from stdin.
 */
function solveGridProblem(rawProblemData) {
  // Define a constant for the modulo operation to prevent integer overflow
  const MODULO_CONSTANT = 1000000007; // Represents 10^9 + 7

  // Split the input data into individual lines and filter out any empty strings
  // This ensures robust handling of input with trailing newlines.
  const processedLines = rawProblemData.split('\n').filter(Boolean);

  // Validate that there's at least one line for dimensions
  if (processedLines.length === 0) {
    console.error("Input data is empty. Cannot proceed.");
    return;
  }

  // Helper function to safely parse a string into an integer.
  // Using Number() is a concise way to convert strings to numbers.
  const parseCoordinate = (str) => Number(str);

  // Extract grid dimensions (height and width) from the first line.
  // Destructuring assignment is used for clarity.
  const [gridHeight, gridWidth] = processedLines[0].split(' ').map(parseCoordinate);

  // Basic validation for grid dimensions
  if (isNaN(gridHeight) || isNaN(gridWidth) || gridHeight <= 0 || gridWidth <= 0) {
    console.error("Invalid grid dimensions provided.");
    return;
  }

  // Prepare the 2D array representing the terrain map.
  // We slice the processed lines to get only the grid data, excluding the dimension line.
  const obstacleMap = [];
  for (let r = 0; r < gridHeight; r++) {
    const mapRow = processedLines[r + 1]; // +1 because the first line is dimensions
    if (!mapRow || mapRow.length !== gridWidth) {
      console.error(`Row ${r} has incorrect length or is missing.`);
      return;
    }
    obstacleMap.push(mapRow.split(''));
  }

  // Calculate the total number of distinct paths using dynamic programming.
  // The modulo operation is applied at the very end as per problem statement,
  // though intermediate modulo is often used in similar problems to prevent overflow.
  const totalValidPaths = computePathsDP(gridHeight, gridWidth, obstacleMap, MODULO_CONSTANT);

  // Output the final count of paths, ensuring it's within the modulo range.
  console.log(totalValidPaths);
}

/**
 * Computes the number of unique paths from the top-left (0,0) to the bottom-right (H-1, W-1)
 * of a grid, avoiding obstacles.
 * This function uses a dynamic programming approach.
 * @param {number} totalRows - The height of the grid.
 * @param {number} totalCols - The width of the grid.
 * @param {Array<Array<string>>} mapLayout - The 2D array representing the grid, where '#' denotes an obstacle.
 * @param {number} modulusValue - The value to use for the modulo operation.
 * @returns {number} The count of unique paths modulo modulusValue.
 */
function computePathsDP(totalRows, totalCols, mapLayout, modulusValue) {
  // Define the character representing an impassable obstacle.
  const IMPASSABLE_CELL = '#';

  // Initialize a 2D array to store the number of ways to reach each cell.
  // All cells are initially set to 0.
  const pathCountsGrid = Array.from({ length: totalRows }, () =>
    Array.from({ length: totalCols }, () => 0)
  );

  // The starting cell (0,0) always has one way to reach it (by starting there),
  // provided it's not an obstacle.
  if (mapLayout[0][0] !== IMPASSABLE_CELL) {
    pathCountsGrid[0][0] = 1;
  } else {
    // If the start is an obstacle, no paths are possible.
    return 0;
  }

  // Iterate through each cell of the grid from top-left to bottom-right.
  for (let rIdx = 0; rIdx < totalRows; rIdx++) {
    for (let cIdx = 0; cIdx < totalCols; cIdx++) {
      // Skip obstacle cells as no paths can go through them.
      if (mapLayout[rIdx][cIdx] === IMPASSABLE_CELL) {
        continue;
      }

      // If this is the starting cell (0,0), we've already initialized it.
      // No need to add paths from previous cells.
      if (rIdx === 0 && cIdx === 0) {
        continue;
      }

      // Calculate paths from the cell directly above (if it exists).
      // A path can reach the current cell from the cell (rIdx-1, cIdx).
      if (rIdx > 0) {
        pathCountsGrid[rIdx][cIdx] = (pathCountsGrid[rIdx][cIdx] + pathCountsGrid[rIdx - 1][cIdx]) % modulusValue;
      }

      // Calculate paths from the cell directly to the left (if it exists).
      // A path can also reach the current cell from the cell (rIdx, cIdx-1).
      if (cIdx > 0) {
        pathCountsGrid[rIdx][cIdx] = (pathCountsGrid[rIdx][cIdx] + pathCountsGrid[rIdx][cIdx - 1]) % modulusValue;
      }
    }
  }

  // The final answer is the number of ways to reach the bottom-right cell.
  // Ensure the result is non-negative, as modulo can sometimes yield negative results
  // in some languages for negative numbers, though JS % handles it fine for positive.
  const finalPathCount = pathCountsGrid[totalRows - 1][totalCols - 1];
  return (finalPathCount < 0 ? finalPathCount + modulusValue : finalPathCount);
}

// Entry point for execution: Read input from stdin and pass it to the solver.
// This pattern is common in competitive programming environments.
currentInputData = require("fs").readFileSync("/dev/stdin", "utf8");
solveGridProblem(currentInputData);