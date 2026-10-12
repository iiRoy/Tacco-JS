'use strict';

// This function processes the input string to determine a specific grid property.
function processInput(inputData) {
  // Split the entire input into an array of lines.
  inputData = inputData.split('\n');

  // Parse grid dimensions from the first line.
  const gridDimensions = inputData[0].split(' ');
  const gridRows = Number(gridDimensions[0]); // Height of the grid
  const gridCols = Number(gridDimensions[1]); // Width of the grid

  // Extract the grid map, excluding the first line (dimensions) and the last (potentially empty).
  // Each row string is then split into an array of characters.
  const gridMap = inputData.slice(1, -1).map(rowString => rowString.split(''));

  // Define arrays for row and column offsets to check 4-directional neighbors (up, right, down, left).
  const rowDirectionOffsets = [-1, 0, 1, 0]; // Changes in row index
  const colDirectionOffsets = [0, 1, 0, -1]; // Changes in column index

  // Initialize the final outcome as 'Yes', assuming the condition holds until proven otherwise.
  let finalOutcome = 'Yes';

  // Iterate through each cell in the grid.
  for (let currentRowIndex = 0; currentRowIndex < gridRows; currentRowIndex++) {
    for (let currentColIndex = 0; currentColIndex < gridCols; currentColIndex++) {
      // If the current cell is a '.', it doesn't affect the condition, so skip it.
      if (gridMap[currentRowIndex][currentColIndex] === '.') {
        continue;
      }

      // If the cell is a '#', check its neighbors.
      let adjacentHashCount = 0; // Counter for '#' neighbors

      // Check all four cardinal directions.
      for (let directionIterator = 0; directionIterator < 4; directionIterator++) {
        // Calculate the coordinates of the neighboring cell.
        const nextRowIndex = currentRowIndex + rowDirectionOffsets[directionIterator];
        const nextColIndex = currentColIndex + colDirectionOffsets[directionIterator];

        // Check if the neighboring cell is within the grid boundaries.
        if (nextRowIndex < 0 || gridRows <= nextRowIndex) {
          continue; // Out of bounds vertically
        }
        if (nextColIndex < 0 || gridCols <= nextColIndex) {
          continue; // Out of bounds horizontally
        }

        // If the neighbor is within bounds and is a '#', increment the counter.
        if (gridMap[nextRowIndex][nextColIndex] === '#') {
          adjacentHashCount += 1;
        }
      }

      // If a '#' cell has no '#' neighbors, the condition is not met.
      if (adjacentHashCount === 0) {
        finalOutcome = 'No'; // Set the outcome to 'No'
        // No need to break here, as the problem implies we check all cells,
        // and once 'No' is set, it won't change back to 'Yes'.
      }
    }
  }

  // Output the final determination.
  console.log(finalOutcome);
}

// Read input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
