'use strict';

// Utility function to verify if a given coordinate pair falls within the grid boundaries.
const validateCoordinates = (rowIndex, colIndex, totalRows, totalCols) =>
  rowIndex >= 0 && rowIndex < totalRows && colIndex >= 0 && colIndex < totalCols;

// Core logic function to determine if a specific cell has at least one '#' character as an immediate neighbor.
const checkNeighborPresence = (r, c, gridData, maxR, maxC) => {
  // Defines the relative offsets for checking the four cardinal directions (Up, Right, Down, Left).
  const directionalShifts = [
    [-1, 0], // North
    [0, 1],  // East
    [1, 0],  // South
    [0, -1]  // West
  ];

  // Uses the 'some' array method to efficiently check if any of the potential neighbors meet the criteria.
  // It short-circuits as soon as the first valid '#' neighbor is found.
  return directionalShifts.some(([rowShift, colShift]) => {
    const adjacentRow = r + rowShift;
    const adjacentCol = c + colShift;

    // First, ensure the adjacent cell is within the grid boundaries, then check its content.
    return validateCoordinates(adjacentRow, adjacentCol, maxR, maxC) && gridData[adjacentRow][adjacentCol] === '#';
  });
};

function processGridAnalysis(inputString) {
  const inputLines = inputString.split('\n');
  const [gridSizeLine] = inputLines;
  const [rowDimensionStr, colDimensionStr] = gridSizeLine.split(' ');
  const totalGridRows = Number(rowDimensionStr);
  const totalGridCols = Number(colDimensionStr);

  // Constructs the 2D character array representing the grid,
  // excluding the first line (dimensions) and the last (typically empty due to EOF newline).
  const gridMatrix = inputLines.slice(1, -1).map(line => line.split(''));

  // Generates a flat list of all [row, column] coordinate pairs for every cell in the grid.
  // This replaces traditional nested for-loops for grid iteration.
  const allGridPoints = Array.from({ length: totalGridRows }, (_, r) =>
    Array.from({ length: totalGridCols }, (_, c) => [r, c])
  ).flat(); // Flattens the array of row-arrays into a single array of points.

  // Determines if there is any '#' cell in the grid that does not have an adjacent '#' cell.
  // The 'some' method will return true and stop execution as soon as such a cell is identified.
  const isAnyHashIsolated = allGridPoints.some(([currentR, currentC]) => {
    // Only cells containing '#' are relevant for this condition.
    if (gridMatrix[currentR][currentC] === '#') {
      // If a '#' cell is found, check if it has any '#' neighbors.
      // If it DOES NOT have any, then this cell is "isolated" and the condition is met.
      return !checkNeighborPresence(currentR, currentC, gridMatrix, totalGridRows, totalGridCols);
    }
    // Cells with '.' do not contribute to the "isolated hash" problem.
    return false;
  });

  // Outputs 'No' if an isolated '#' character was detected, otherwise 'Yes'.
  console.log(isAnyHashIsolated ? 'No' : 'Yes');
}

processGridAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));
