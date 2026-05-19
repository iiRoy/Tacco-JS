function ProcessInput(rawData) {
  // Pre-process the raw input string: trim whitespace, split into lines, then split each line by space.
  // This prepares the input for easy access to grid dimensions and cell data.
  rawData = rawData.trim().split("\n").map(function(linePart) {
    return linePart.split(" ");
  });

  // Define a large prime number for modulo operations to prevent integer overflow,
  // common in dynamic programming problems involving counts.
  let moduloVal = 1000000007;

  // Parse the grid dimensions from the first line of the processed input.
  // gridHeight represents 'H' and gridWidth represents 'W'.
  let gridHeight = parseInt(rawData[0][0], 10);
  let gridWidth = parseInt(rawData[0][1], 10);

  // Initialize a 2D array (dynamic programming table) to store the number of paths
  // to each cell. All values are initially zero.
  let pathCounts = [];
  for (let r = 0; r < gridHeight; r++) {
    pathCounts.push(Array.from({
      length: gridWidth
    }, () => 0));
  }

  // The starting cell (0,0) has exactly one path to itself.
  pathCounts[0][0] = 1;

  // Iterate through diagonals of the grid.
  // 'diagSum' represents the sum of row and column indices (r + c).
  // The loop runs from 1 up to (gridHeight + gridWidth - 2) because the first cell (0,0) is handled,
  // and the last cell (H-1, W-1) has a diagSum of (H-1 + W-1).
  for (let diagSum = 1; diagSum < gridHeight + gridWidth - 1; diagSum++) {
    // Iterate through possible row indices for the current diagonal.
    // 'rowIdx' represents 'j' in the original code.
    // The bounds ensure 'rowIdx' is within [0, gridHeight-1] and 'colIdx' (diagSum - rowIdx) is within [0, gridWidth-1].
    for (let rowIdx = Math.max(0, diagSum - gridWidth + 1); rowIdx <= Math.min(diagSum, gridHeight - 1); rowIdx++) {
      // Calculate the corresponding column index for the current cell.
      let colIdx = diagSum - rowIdx;

      // If the current cell in the input grid is an obstacle ('#'),
      // then no paths can go through it, so we skip it.
      // Note: rawData uses 1-based indexing for rows in the problem description,
      // but 0-based for grid coordinates. The problem statement implies rawData[r+1][0][c] for grid cell (r,c).
      // The original code uses input[j + 1][0][i - j] for cell (j, i-j).
      // So, for cell (rowIdx, colIdx), it's rawData[rowIdx + 1][0][colIdx].
      if (rawData[rowIdx + 1][0][colIdx] === '#') {
        continue;
      }

      // Calculate the number of paths to the current cell (rowIdx, colIdx)
      // based on the paths to the cell above it (rowIdx-1, colIdx) and
      // the cell to its left (rowIdx, colIdx-1).
      if (rowIdx > 0 && colIdx > 0) {
        // If both cells (above and left) are valid, sum their path counts.
        pathCounts[rowIdx][colIdx] = (pathCounts[rowIdx - 1][colIdx] + pathCounts[rowIdx][colIdx - 1]) % moduloVal;
      } else if (rowIdx > 0) {
        // If only the cell above is valid (i.e., current cell is in the first column, but not first row).
        pathCounts[rowIdx][colIdx] = pathCounts[rowIdx - 1][colIdx];
      } else { // colIdx > 0
        // If only the cell to the left is valid (i.e., current cell is in the first row, but not first column).
        pathCounts[rowIdx][colIdx] = pathCounts[rowIdx][colIdx - 1];
      }
    }
  }

  // The result is the number of paths to the bottom-right cell (gridHeight-1, gridWidth-1).
  // The original code uses pop() twice, which is equivalent to pathCounts[gridHeight-1][gridWidth-1].
  // This is a slightly unusual way to access the last element of a 2D array, but it's functionally identical.
  console.log(pathCounts.pop().pop());
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
