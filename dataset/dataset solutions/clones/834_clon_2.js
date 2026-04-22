const exploreGroup = (rowCoord, colCoord, cellType) => {
  // Define relative offsets for neighboring cells (up, left, right, down)
  const rowOffsets = [-1, 0, 0, 1];
  const colOffsets = [0, -1, 1, 0];

  // Iterate through all four possible directions
  for (let currentDir = 0; currentDir < 4; currentDir++) {
    // Calculate coordinates of the neighboring cell
    let nextRow = rowCoord + rowOffsets[currentDir];
    let nextCol = colCoord + colOffsets[currentDir];

    // Check if the neighboring cell is within the grid boundaries (12 rows, 6 columns)
    if (nextRow < 0 || nextCol < 0 || nextRow >= 12 || nextCol >= 6) {
      continue; // Skip if out of bounds
    }

    // If the neighbor matches the current cell type
    if (playArea[nextRow][nextCol] === cellType) {
      clusterSize++; // Increment the count of connected cells
      // If the cluster size reaches 4, add its coordinates to the list of potential removals
      if (clusterSize === 4) {
        detonationPoints.push([nextRow, nextCol]);
      }
      // Mark the cell to prevent re-processing in this recursion path (e.g., "R" becomes "R0")
      playArea[nextRow][nextCol] = cellType + 0;
      // Recursively call for the connected neighbor
      exploreGroup(nextRow, nextCol, cellType);
    }
  }
};

const removeCluster = (rowCoord, colCoord, cellType) => {
  // Define relative offsets for neighboring cells (up, left, right, down)
  const rowOffsets = [-1, 0, 0, 1];
  const colOffsets = [0, -1, 1, 0];

  // Iterate through all four possible directions
  for (let currentDir = 0; currentDir < 4; currentDir++) {
    // Calculate coordinates of the neighboring cell
    let nextRow = rowCoord + rowOffsets[currentDir];
    let nextCol = colCoord + colOffsets[currentDir];

    // Check if the neighboring cell is within the grid boundaries
    if (nextRow < 0 || nextCol < 0 || nextRow >= 12 || nextCol >= 6) {
      continue; // Skip if out of bounds
    }

    // If the neighbor matches the target cell type, clear it and recurse
    if (playArea[nextRow][nextCol] === cellType) {
      playArea[nextRow][nextCol] = "."; // Mark as empty
      removeCluster(nextRow, nextCol, cellType);
    } else if (playArea[nextRow][nextCol] === "O") {
      // Special handling for 'O' type cells (also clear them)
      playArea[nextRow][nextCol] = "."; // Mark as empty
    }
  }
};

// Function to apply gravity: move cells upwards if there's an empty space below
const applyGravity = (targetRow, targetCol) => {
  // Keep track of the original row position for placement
  let currentRow = targetRow;
  // Iterate upwards from the target row
  while (targetRow > 0) {
    targetRow--; // Move to the row above
    // If a non-empty cell is found
    if (playArea[targetRow][targetCol] !== ".") {
      // Move it down to the original target empty spot
      playArea[currentRow][targetCol] = playArea[targetRow][targetCol];
      playArea[targetRow][targetCol] = "."; // Clear the old spot
      break; // Only move one block up
    }
  }
};

// --- Main Program Execution ---

// Read raw input from standard input
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split input into lines and remove any leading/trailing whitespace
const inputLines = rawData.trim().split("\n");
// Get the number of test cases from the first line
let numCases = parseInt(inputLines.shift()); // Convert to integer

// Loop through each test case
for (let caseIter = 0; caseIter < numCases; caseIter++) {
  let playArea = []; // Initialize the 2D grid for the current game
  // Populate the game grid with 12 rows
  for (let rowIdx = 0; rowIdx < 12; rowIdx++) {
    const currentLine = inputLines.shift().split(""); // Get a row and split into characters
    playArea.push(currentLine); // Add row to the grid
  }

  let totalClears = 0; // Counter for the number of successful clear operations

  // Main game loop: continues as long as clusters are being cleared
  while (true) {
    let detonationPoints = []; // List to store coordinates of cells that form a 4-block cluster
    let clusterSize; // Counter for the size of a connected cluster

    // First pass: Identify and mark all potential clusters
    for (let rowIdx = 0; rowIdx < 12; rowIdx++) {
      for (let colIdx = 0; colIdx < 6; colIdx++) {
        // Check for different cell types and initiate cluster exploration
        if (playArea[rowIdx][colIdx] === "R") {
          playArea[rowIdx][colIdx] = "R0"; // Temporarily mark to prevent re-exploration in current chain
          clusterSize = 1; // Reset cluster size for new exploration
          exploreGroup(rowIdx, colIdx, "R");
        }
        if (playArea[rowIdx][colIdx] === "G") {
          playArea[rowIdx][colIdx] = "G0";
          clusterSize = 1;
          exploreGroup(rowIdx, colIdx, "G");
        }
        if (playArea[rowIdx][colIdx] === "B") {
          playArea[rowIdx][colIdx] = "B0";
          clusterSize = 1;
          exploreGroup(rowIdx, colIdx, "B");
        }
        if (playArea[rowIdx][colIdx] === "Y") {
          playArea[rowIdx][colIdx] = "Y0";
          clusterSize = 1;
          exploreGroup(rowIdx, colIdx, "Y");
        }
        if (playArea[rowIdx][colIdx] === "P") {
          playArea[rowIdx][colIdx] = "P0";
          clusterSize = 1;
          exploreGroup(rowIdx, colIdx, "P");
        }
      }
    }

    // Second pass: Reset temporary marks (e.g., "R0" back to "R")
    for (let rowIter = 0; rowIter < 12; rowIter++) {
      for (let colIter = 0; colIter < 6; colIter++) {
        playArea[rowIter][colIter] = playArea[rowIter][colIter].slice(0, 1);
      }
    }

    // If no clusters of 4 or more were found, the game ends for this case
    if (detonationPoints.length === 0) {
      break;
    }

    totalClears++; // Increment the count of successful clear operations

    // Third pass: Clear the identified clusters
    detonationPoints.forEach(function (currentPoint) {
      const pointRow = currentPoint[0];
      const pointCol = currentPoint[1];
      const pointColor = playArea[pointRow][pointCol];
      // Only clear if the cell hasn't already been cleared by another bomb in the same step
      if (pointColor !== ".") {
        removeCluster(pointRow, pointCol, pointColor);
      }
    });

    // Fourth pass: Apply gravity to shift cells downwards to fill empty spaces
    // Iterate from bottom-up and left-to-right
    for (let rowIter = 11; rowIter > 0; rowIter--) { // Start from second last row, as bottom-most cannot move up
      for (let colIter = 0; colIter < 6; colIter++) {
        // If a cell is empty, attempt to move a cell from above into it
        if (playArea[rowIter][colIter] === ".") {
          applyGravity(rowIter, colIter);
        }
      }
    }
  }
  // Output the final count of clears for the current test case
  console.log(totalClears);
}