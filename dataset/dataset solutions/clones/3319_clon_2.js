console.log(
  (function (inputData) {
    // Process the raw input string to get grid lines
    const gridLines = inputData.trim().split('\n');

    // Extract dimensions (height and width) from the first line
    const [numRows, numCols] = gridLines
      .shift()
      .split(' ')
      .map((valStr) => parseInt(valStr, 10)); // Using parseInt for clarity, behavior is identical to v|0

    // Initialize a 2D array (dynamic programming table) with zeros
    const pathCounts = Array(numRows)
      .fill(null)
      .map((rowFiller) => Array(numCols).fill(0));

    // Set the starting point's path count to 1
    pathCounts[0][0] = 1;

    // Define a large prime number for modulo operation to prevent overflow
    const MODULO_VAL = 1000000007; // Equivalent to 1e9+7

    // Iterate through each cell of the grid
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
      for (let colIndex = 0; colIndex < numCols; colIndex++) {
        // If the current cell is an obstacle ('#'), no paths can go through it
        if (gridLines[rowIndex][colIndex] === '#') {
          continue; // Skip to the next cell
        }

        // If not in the first row, add paths from the cell directly above
        if (rowIndex > 0) {
          pathCounts[rowIndex][colIndex] =
            (pathCounts[rowIndex][colIndex] + pathCounts[rowIndex - 1][colIndex]) % MODULO_VAL;
        }

        // If not in the first column, add paths from the cell directly to the left
        if (colIndex > 0) {
          pathCounts[rowIndex][colIndex] =
            (pathCounts[rowIndex][colIndex] + pathCounts[rowIndex][colIndex - 1]) % MODULO_VAL;
        }
      }
    }

    // The result is the number of paths to the bottom-right cell
    // Convert the final count to a string before returning
    return pathCounts[numRows - 1][numCols - 1].toString();
  })(require('fs').readFileSync('/dev/stdin', 'utf8'))
);
