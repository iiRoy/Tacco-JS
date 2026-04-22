function ProcessInput(rawData) {
  // Parse the incoming raw data string into an array of individual lines.
  let processedLines = rawData.split('\n');

  // Define a utility function to convert string representations to base-10 integers.
  const parseNumeric = (strVal) => {
    return parseInt(strVal, 10);
  };

  // Extract the grid dimensions (number of rows and columns) from the first line.
  const [rowCount, colCount] = processedLines[0].split(' ').map(parseNumeric);

  // Initialize an empty 2D array (matrix) to store the grid's character data.
  const charMatrix = [];
  // Populate the character matrix using subsequent lines from the input.
  for (let rowIdx = 0; rowIdx < rowCount; ++rowIdx) {
    charMatrix.push(processedLines[rowIdx + 1].split(''));
  }

  // Compute the total number of unique paths and print the result,
  // applying a modulo operation with a large prime to prevent overflow.
  console.log(calculatePaths(rowCount, colCount, charMatrix) % (10**9 + 7));
}

// Initiate the primary data processing flow by reading from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Computes the number of distinct paths from the top-left cell (0,0)
 * to the bottom-right cell (verticalExtent-1, horizontalExtent-1)
 * in a grid, avoiding obstacles.
 *
 * @param {number} verticalExtent - The total number of rows in the grid.
 * @param {number} horizontalExtent - The total number of columns in the grid.
 * @param {Array<Array<string>>} symbolGrid - The 2D array representing the grid,
 *                                            where '#' denotes an obstacle.
 * @returns {number} The count of unique valid paths.
 */
function calculatePaths(verticalExtent, horizontalExtent, symbolGrid) {
  // Create a dynamic programming table (2D array) to store path counts.
  // Each cell [r][c] will store the number of ways to reach that cell.
  const pathCounts = Array(verticalExtent)
    .fill(0)
    .map(_ => Array(horizontalExtent).fill(0));

  // Base case: There is exactly one way to reach the starting cell (0,0).
  pathCounts[0][0] = 1;

  // Iterate through each cell of the grid to fill the pathCounts table.
  for (let rCoord = 0; rCoord < verticalExtent; ++rCoord) {
    for (let cCoord = 0; cCoord < horizontalExtent; ++cCoord) {
      // If the current cell contains an obstacle ('#'), no paths can pass through it.
      // So, we skip this cell and its contribution to subsequent cells.
      if (symbolGrid[rCoord][cCoord] === '#') {
        continue;
      }

      // If not in the first row, paths can reach the current cell from the cell directly above.
      // Add the path count from the cell above to the current cell's total.
      if (rCoord > 0) {
        pathCounts[rCoord][cCoord] = pathCounts[rCoord - 1][cCoord] + pathCounts[rCoord][cCoord];
      }

      // If not in the first column, paths can reach the current cell from the cell directly to its left.
      // Add the path count from the cell to the left to the current cell's total.
      if (cCoord > 0) {
        pathCounts[rCoord][cCoord] = pathCounts[rCoord][cCoord] + pathCounts[rCoord][cCoord - 1];
      }
    }
  }

  // The final result is the number of paths to reach the bottom-right corner.
  return pathCounts[verticalExtent - 1][horizontalExtent - 1];
}