const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

let processedLines = rawInputData.trim().split('\n');

const TYPE_STANDARD_CELL = 0;
const TYPE_BLOCKED_CELL = 1;
const TYPE_UNIQUE_CELL = 2;

while (true) {
  const [gridWidth, gridHeight] = processedLines.shift().split(' ').map(Number);

  // Terminate processing if dimensions are zero
  if (gridWidth === 0 && gridHeight === 0) {
    break;
  }

  // Basic validation for grid dimensions
  if (gridWidth <= 0 || gridHeight <= 0 || isNaN(gridWidth) || isNaN(gridHeight)) {
    // Skip this malformed test case
    for (let r = 0; r < gridHeight; r++) {
      processedLines.shift();
    }
    continue;
  }

  // Parse the grid configuration for the current test case
  const cellConfiguration = [];
  for (let r = 0; r < gridHeight; r++) {
    cellConfiguration.push(processedLines.shift().split(' ').map(Number));
  }

  // Initialize the dynamic programming table to store path counts
  // All cells initially have 0 paths
  const cumulativePathCounts = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));

  // --- Core Dynamic Programming Calculation ---
  for (let r = 0; r < gridHeight; r++) {
    for (let c = 0; c < gridWidth; c++) {
      const currentCellType = cellConfiguration[r][c];

      // Blocked cells prevent any paths from passing through
      if (currentCellType === TYPE_BLOCKED_CELL) {
        cumulativePathCounts[r][c] = 0;
        continue;
      }

      // Base case: First row
      // A standard cell in the first row has one path to itself
      if (r === 0) {
        if (currentCellType === TYPE_STANDARD_CELL) {
          cumulativePathCounts[r][c] = 1;
        }
        continue;
      }

      // For subsequent rows, calculate path contributions from previous states
      let pathsFromLeftUpper = 0;
      let pathsFromDirectUpper = 0;
      let pathsFromRightUpper = 0;
      let pathsFromTwoRowsAbove = 0;

      // Contribution from directly above (r-1, c)
      if (cellConfiguration[r - 1][c] !== TYPE_UNIQUE_CELL) {
        pathsFromDirectUpper = cumulativePathCounts[r - 1][c];
      }

      // Contribution from upper-left diagonal (r-1, c-1)
      if (c > 0 && cellConfiguration[r - 1][c - 1] !== TYPE_UNIQUE_CELL) {
        pathsFromLeftUpper = cumulativePathCounts[r - 1][c - 1];
      }

      // Contribution from upper-right diagonal (r-1, c+1)
      if (c < gridWidth - 1 && cellConfiguration[r - 1][c + 1] !== TYPE_UNIQUE_CELL) {
        pathsFromRightUpper = cumulativePathCounts[r - 1][c + 1];
      }

      // Special contribution from two rows above (r-2, c)
      // Only if the source cell (r-2, c) was of type TYPE_UNIQUE_CELL
      if (r >= 2 && cellConfiguration[r - 2][c] === TYPE_UNIQUE_CELL) {
        pathsFromTwoRowsAbove = cumulativePathCounts[r - 2][c];
      }

      // Apply path accumulation rules based on current cell's type
      switch (currentCellType) {
        case TYPE_STANDARD_CELL:
          cumulativePathCounts[r][c] = pathsFromLeftUpper + pathsFromDirectUpper + pathsFromRightUpper + pathsFromTwoRowsAbove;
          break;
        case TYPE_UNIQUE_CELL:
          // For unique cells, paths come only from direct upper neighbor (if not unique itself)
          // and from two rows above (if that cell was unique)
          let directUpperContribution = (cellConfiguration[r - 1][c] === TYPE_UNIQUE_CELL) ? 0 : cumulativePathCounts[r - 1][c];
          let twoRowsAboveContribution = (r >= 2 && cellConfiguration[r - 2][c] === TYPE_UNIQUE_CELL) ? cumulativePathCounts[r - 2][c] : 0;
          cumulativePathCounts[r][c] = directUpperContribution + twoRowsAboveContribution;
          break;
        // TYPE_BLOCKED_CELL handled at loop start
        default:
          // Unrecognized cell type; treat as blocked for safety.
          cumulativePathCounts[r][c] = 0;
      }
    }
  }

  // --- Final Path Summation ---
  let finalTotalPaths = 0;

  // Sum paths from the second-to-last row if applicable
  if (gridHeight >= 2) {
    const secondLastRowIndex = gridHeight - 2;
    for (let c = 0; c < gridWidth; c++) {
      if (cellConfiguration[secondLastRowIndex][c] === TYPE_UNIQUE_CELL) {
        finalTotalPaths += cumulativePathCounts[secondLastRowIndex][c];
      }
    }
  }

  // Sum paths from the last row if applicable
  if (gridHeight >= 1) {
    const lastRowIndex = gridHeight - 1;
    for (let c = 0; c < gridWidth; c++) {
      const cellTypeInLastRow = cellConfiguration[lastRowIndex][c];
      if (cellTypeInLastRow === TYPE_STANDARD_CELL || cellTypeInLastRow === TYPE_UNIQUE_CELL) {
        finalTotalPaths += cumulativePathCounts[lastRowIndex][c];
      }
    }
  }

  // Output the calculated total paths for the current grid
  console.log(finalTotalPaths);
}