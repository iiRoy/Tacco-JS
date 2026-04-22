/* This script processes a grid input to calculate unique paths. */
console.log((function(inputString){
  // Clean up the input string by removing leading/trailing whitespace
  // and then splitting it into an array of lines.
  const gridData = inputString.trim()
                             .split('\n');

  // Extract grid dimensions (number of rows and columns) from the first line.
  // The first line is removed from gridData after processing.
  // Each dimension string is converted to an integer.
  const [numRows, numCols] = gridData.shift()
                                     .split(' ')
                                     .map(valStr => parseInt(valStr, 10));

  // Initialize a 2D array, often called a dynamic programming table,
  // to store the number of distinct paths to each cell.
  // All initial counts are set to zero.
  const pathCounts = Array(numRows)
                     .fill(0)
                     .map(rowFiller => Array(numCols).fill(0));

  // The starting cell (top-left) has exactly one path to itself.
  pathCounts[0][0] = 1;

  // Define a large prime number to use as a modulo.
  // This prevents integer overflow when summing path counts.
  const LARGE_PRIME_MODULO = 1000000007;

  // Iterate through each cell of the grid, row by row, column by column.
  for ( let currentRow = 0; currentRow < numRows; ++currentRow ) {
    for ( let currentCol = 0; currentCol < numCols; ++currentCol ) {
      // If the current cell is marked as an obstacle ('#'),
      // no paths can pass through it. Skip to the next cell.
      if ( gridData[currentRow][currentCol] === '#' ) {
        continue;
      }

      // If not the first row, add paths from the cell directly above.
      // Apply modulo operation to keep numbers within bounds.
      if ( currentRow > 0 ) {
        pathCounts[currentRow][currentCol] = (pathCounts[currentRow][currentCol] + pathCounts[currentRow - 1][currentCol]) % LARGE_PRIME_MODULO;
      }

      // If not the first column, add paths from the cell directly to the left.
      // Apply modulo operation again.
      if ( currentCol > 0 ) {
        pathCounts[currentRow][currentCol] = (pathCounts[currentRow][currentCol] + pathCounts[currentRow][currentCol - 1]) % LARGE_PRIME_MODULO;
      }
    }
  }

  // The final result is the total number of paths to the bottom-right cell.
  // This value is then converted into a string before being returned.
  return pathCounts[numRows - 1][numCols - 1].toString();

// Immediately invoke the anonymous function with input read from standard input.
}(require('fs').readFileSync('/dev/stdin', 'utf8')));