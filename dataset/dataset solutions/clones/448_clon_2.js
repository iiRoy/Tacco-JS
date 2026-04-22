let fileContents = require("fs").readFileSync("/dev/stdin", "utf8"); // Read input data from standard input path
let processedLines = fileContents.trim().split("\n"); // Trim whitespace and split into individual lines

// Main processing loop: continues until a specific termination condition is met
while (true) {
  // Parse dimensions (width and height) from the next line of input
  const dimensionsPair = processedLines.shift().split(" ").map(Number);
  const gridWidth = dimensionsPair[0]; // Extract the width value
  const gridHeight = dimensionsPair[1]; // Extract the height value

  // Check for termination condition: both dimensions are zero
  if (gridWidth === 0 && gridHeight === 0) {
    break; // Exit the loop
  }

  // Initialize a 2D array to store the problem's grid data
  const spatialGrid = [];
  for (let rowIterator = 0; rowIterator < gridHeight; rowIterator++) {
    // Populate the grid by parsing subsequent input lines
    spatialGrid.push(processedLines.shift().split(" ").map(Number));
  }

  // Initialize a 2D array for dynamic programming memoization, filled with zeros
  const memoizationTable = [];
  for (let rowIterator = 0; rowIterator < gridHeight; rowIterator++) {
    memoizationTable[rowIterator] = [];
    for (let columnIterator = 0; columnIterator < gridWidth; columnIterator++) {
      memoizationTable[rowIterator][columnIterator] = 0;
    }
  }

  // Populate the dynamic programming table based on the spatial grid
  for (let rowIterator = 0; rowIterator < gridHeight; rowIterator++) {
    for (let columnIterator = 0; columnIterator < gridWidth; columnIterator++) {
      // Special handling for the first row (rowIterator === 0)
      if (rowIterator === 0 && spatialGrid[rowIterator][columnIterator] === 0) {
        memoizationTable[rowIterator][columnIterator] = 1;
      }
      // For subsequent rows (rowIterator >= 1)
      else if (rowIterator >= 1) {
        // Calculate contributions from relevant cells in previous rows
        // Contribution from top-left diagonal cell
        const fromUpperLeft =
          columnIterator === 0 || spatialGrid[rowIterator - 1][columnIterator - 1] === 2
            ? 0
            : memoizationTable[rowIterator - 1][columnIterator - 1];
        // Contribution from directly above cell
        const fromStraightUp =
          spatialGrid[rowIterator - 1][columnIterator] === 2
            ? 0
            : memoizationTable[rowIterator - 1][columnIterator];
        // Contribution from top-right diagonal cell
        const fromUpperRight =
          columnIterator === gridWidth - 1 || spatialGrid[rowIterator - 1][columnIterator + 1] === 2
            ? 0
            : memoizationTable[rowIterator - 1][columnIterator + 1];
        // Contribution from two rows above (straight up)
        const fromTwoRowsUp =
          rowIterator >= 2 && spatialGrid[rowIterator - 2][columnIterator] === 2
            ? memoizationTable[rowIterator - 2][columnIterator]
            : 0;

        // Apply rules based on the current cell's value in the spatial grid
        if (spatialGrid[rowIterator][columnIterator] === 0) {
          memoizationTable[rowIterator][columnIterator] +=
            fromUpperLeft + fromStraightUp + fromUpperRight + fromTwoRowsUp;
        } else if (spatialGrid[rowIterator][columnIterator] === 1) {
          memoizationTable[rowIterator][columnIterator] = 0; // Reset to zero if value is 1
        } else if (spatialGrid[rowIterator][columnIterator] === 2) {
          memoizationTable[rowIterator][columnIterator] += fromStraightUp + fromTwoRowsUp;
        }
      }
    }
  }

  // Calculate the final accumulated total based on specific conditions in the last two rows
  let finalAccumulatedResult = 0;
  for (let rowIterator = gridHeight - 2; rowIterator < gridHeight; rowIterator++) {
    for (let columnIterator = 0; columnIterator < gridWidth; columnIterator++) {
      // Condition for the second-to-last row
      if (rowIterator === gridHeight - 2 && spatialGrid[rowIterator][columnIterator] === 2) {
        finalAccumulatedResult += memoizationTable[rowIterator][columnIterator];
      }
      // Condition for the very last row
      if (
        rowIterator === gridHeight - 1 &&
        (spatialGrid[rowIterator][columnIterator] === 0 || spatialGrid[rowIterator][columnIterator] === 2)
      ) {
        finalAccumulatedResult += memoizationTable[rowIterator][columnIterator];
      }
    }
  }

  // Output the calculated final result for the current test case
  console.log(finalAccumulatedResult);
}