function exploreAdjacent(rowCoord, colCoord, targetColor) {
  // Define relative offsets for checking adjacent cells (up, left, right, down)
  const rowOffsets = [-1, 0, 0, 1];
  const colOffsets = [0, -1, 1, 0];

  // Iterate through the four possible directions
  for (let directionIndex = 0; directionIndex < 4; directionIndex++) {
    const nextRow = rowCoord + rowOffsets[directionIndex];
    const nextCol = colCoord + colOffsets[directionIndex];

    // Check if the next cell is within the grid boundaries (12 rows, 6 columns)
    if (nextRow < 0 || nextCol < 0 || nextRow >= 12 || nextCol >= 6) {
      continue; // Skip if out of bounds
    }

    // If the adjacent cell has the same color as the target
    if (gameGrid[nextRow][nextCol] === targetColor) {
      currentCount++; // Increment the count of connected cells
      // If 4 or more connected cells are found, add the current cell to the explosion list
      if (currentCount === 4) {
        explosionPoints.push([nextRow, nextCol]);
      }
      // Mark the current cell with its color and the current count to avoid re-processing in this chain
      gameGrid[nextRow][nextCol] = targetColor + currentCount;
      // Recursively call to explore its neighbors
      exploreAdjacent(nextRow, nextCol, targetColor);
    }
  }
}

function clearConnected(rowCoord, colCoord, targetColor) {
  // Define relative offsets for checking adjacent cells (up, left, right, down)
  const rowOffsets = [-1, 0, 0, 1];
  const colOffsets = [0, -1, 1, 0];

  // Iterate through the four possible directions
  for (let directionIndex = 0; directionIndex < 4; directionIndex++) {
    const nextRow = rowCoord + rowOffsets[directionIndex];
    const nextCol = colCoord + colOffsets[directionIndex];

    // Check if the next cell is within the grid boundaries
    if (nextRow < 0 || nextCol < 0 || nextRow >= 12 || nextCol >= 6) {
      continue; // Skip if out of bounds
    }

    // If the adjacent cell has the same color as the target, clear it and recurse
    if (gameGrid[nextRow][nextCol] === targetColor) {
      gameGrid[nextRow][nextCol] = "."; // Mark as empty
      clearConnected(nextRow, nextCol, targetColor); // Recursively clear its neighbors
    } else if (gameGrid[nextRow][nextCol] === "O") {
      // If it's an 'O' (obstacle/special block), clear it as well
      gameGrid[nextRow][nextCol] = "."; // Mark as empty
    }
  }
}

function shiftDown(rowCoord, colCoord) {
  let initialRow = rowCoord; // Store the original row position
  // Move upwards from the current row to find a non-empty cell
  while (rowCoord > 0) {
    rowCoord--; // Move to the row above
    // If a non-empty cell is found
    if (gameGrid[rowCoord][colCoord] !== ".") {
      // Move its content to the initial empty spot
      gameGrid[initialRow][colCoord] = gameGrid[rowCoord][colCoord];
      gameGrid[rowCoord][colCoord] = "."; // Clear the original position
      break; // Stop after shifting one block
    }
  }
}

// Global variables for game state and processing
let gameGrid; // Represents the 2D game board
let currentCount; // Counter for connected blocks of the same color
let explosionPoints; // List of coordinates where explosions should occur

// Read input from stdin
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawData.trim().split("\n");

// Get the number of test cases
const numTestCases = parseInt(inputLines.shift(), 10);

// Process each test case
for (let testCaseIndex = 0; testCaseIndex < numTestCases; testCaseIndex++) {
  gameGrid = []; // Initialize the game grid for the current test case

  // Populate the game grid from input lines
  for (let rowIndex = 0; rowIndex < 12; rowIndex++) {
    const rowChars = inputLines.shift().split("");
    gameGrid.push(rowChars);
  }

  let totalExplosions = 0; // Counter for the total number of explosion chains

  // Main game loop: continues as long as explosions occur
  while (true) {
    explosionPoints = []; // Reset the list of explosion points for this iteration

    // First pass: Identify potential explosion chains
    for (let rowIndex = 0; rowIndex < 12; rowIndex++) {
      for (let colIndex = 0; colIndex < 6; colIndex++) {
        const cellContent = gameGrid[rowIndex][colIndex];
        // Check for each color type and initiate a search if found
        if (cellContent === "R") {
          currentCount = 1;
          gameGrid[rowIndex][colIndex] = "R" + currentCount;
          exploreAdjacent(rowIndex, colIndex, "R");
        }
        if (cellContent === "G") {
          currentCount = 1;
          gameGrid[rowIndex][colIndex] = "G" + currentCount;
          exploreAdjacent(rowIndex, colIndex, "G");
        }
        if (cellContent === "B") {
          currentCount = 1;
          gameGrid[rowIndex][colIndex] = "B" + currentCount;
          exploreAdjacent(rowIndex, colIndex, "B");
        }
        if (cellContent === "Y") {
          currentCount = 1;
          gameGrid[rowIndex][colIndex] = "Y" + currentCount;
          exploreAdjacent(rowIndex, colIndex, "Y");
        }
        if (cellContent === "P") {
          currentCount = 1;
          gameGrid[rowIndex][colIndex] = "P" + currentCount;
          exploreAdjacent(rowIndex, colIndex, "P");
        }
      }
    }

    // Reset temporary marks (e.g., "R1", "G2") back to their original color
    for (let rowIndex = 0; rowIndex < 12; rowIndex++) {
      for (let colIndex = 0; colIndex < 6; colIndex++) {
        gameGrid[rowIndex][colIndex] = gameGrid[rowIndex][colIndex].slice(0, 1);
      }
    }

    // If no explosion points were found in this pass, the game ends
    if (explosionPoints.length === 0) {
      break;
    }

    totalExplosions++; // Increment the total explosion count

    // Second pass: Clear the identified explosion chains
    explosionPoints.forEach(function (pointCoords) {
      const targetRow = pointCoords[0];
      const targetCol = pointCoords[1];
      const blockColor = gameGrid[targetRow][targetCol];

      // Only clear if the block hasn't been cleared by a previous explosion in this chain
      if (blockColor !== ".") {
        clearConnected(targetRow, targetCol, blockColor);
      }
    });

    // Third pass: Apply gravity to make blocks fall down
    // Iterate from bottom-up, column by column
    for (let rowIndex = 11; rowIndex > 0; rowIndex--) {
      for (let colIndex = 0; colIndex < 6; colIndex++) {
        // If a cell is empty, attempt to shift a block down into it
        if (gameGrid[rowIndex][colIndex] === ".") {
          shiftDown(rowIndex, colIndex);
        }
      }
    }
  }
  // Output the total number of explosions for the current test case
  console.log(totalExplosions);
}
