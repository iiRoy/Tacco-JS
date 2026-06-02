function ProcessInput(rawData) {
  // Split the raw input string into an array of lines
  rawData = rawData.split("\n");

  // Helper function to convert a string to an integer
  const parseNumericValue = ((strVal) => {
    return parseInt(strVal, 10);
  });

  // Extract dimensions (height and width) from the first line
  const [heightDim, widthDim] = rawData[0].split(' ').map(parseNumericValue);

  // Initialize a 2D array (matrix) to store the grid characters
  const charMatrix = [];
  // Populate the character matrix from the subsequent input lines
  for (var rowIdx = 0; rowIdx < heightDim; rowIdx++) {
    charMatrix.push(rawData[rowIdx + 1].split(''));
  }

  // Calculate the number of paths using dynamic programming and print the result
  // The result is taken modulo 10^9 + 7 to prevent overflow
  console.log(calculatePaths(heightDim, widthDim, charMatrix) % (10**9 + 7));
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Calculates the number of unique paths from the top-left corner (0,0)
 * to the bottom-right corner (H-1, W-1) of a grid.
 * Obstacles ('#') block paths. Only moves right or down are allowed.
 *
 * @param {number} heightDim The height of the grid.
 * @param {number} widthDim The width of the grid.
 * @param {string[][]} charMatrix The grid represented as a 2D array of characters.
 * @returns {number} The total number of valid paths.
 */
function calculatePaths(heightDim, widthDim, charMatrix) {
  // Initialize a 2D array for dynamic programming, filled with zeros
  // This array will store the number of ways to reach each cell
  const pathCounts = Array(heightDim).fill(0).map(val => Array(widthDim).fill(0));

  // There is one way to reach the starting cell (0,0)
  pathCounts[0][0] = 1;

  // Iterate through each cell of the grid
  for (var rowIdx = 0; rowIdx < heightDim; rowIdx++) {
    for (var colIdx = 0; colIdx < widthDim; colIdx++) {
        // If the current cell is an obstacle, no paths can go through it
        if (charMatrix[rowIdx][colIdx] === '#') {
            continue; // Skip to the next cell
        }

        // If not in the first row, add paths from the cell directly above
        if (rowIdx > 0) {
          pathCounts[rowIdx][colIdx] = pathCounts[rowIdx - 1][colIdx] + pathCounts[rowIdx][colIdx];
        }
        // If not in the first column, add paths from the cell directly to the left
        if (colIdx > 0) {
          pathCounts[rowIdx][colIdx] = pathCounts[rowIdx][colIdx] + pathCounts[rowIdx][colIdx - 1];
        }
    }
  }
  // The result is the number of ways to reach the bottom-right cell
  return pathCounts[heightDim - 1][widthDim - 1];
}
