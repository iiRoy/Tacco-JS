/*
 * Utility functions for common data parsing and array operations.
 * These functions assist in processing various types of input data.
 */
function parseInteger( inputStr ) {
  // Converts a string to an integer.
  return parseInt(inputStr);
}

function parseFloatValue( inputStr ) {
  // Converts a string to a floating-point number.
  return parseFloat(inputStr);
}

function isEvenNumber( numVal ) {
  // Checks if a number is even.
  return ( numVal % 2 ) === 0;
}

function isOddNumber( numVal ) {
  // Checks if a number is odd.
  return ( numVal % 2 ) === 1;
}

// Extend Array prototype with custom sorting and filtering methods.

Array.prototype.orderNumbersAscending = function() {
  // Sorts array elements numerically in ascending order.
  return this.sort((valA, valB) => (valA - valB));
};

Array.prototype.orderNumbersDescending = function() {
  // Sorts array elements numerically in descending order.
  return this.sort((valA, valB) => (valB - valA));
};

Array.prototype.orderStringsAscending = function() {
  // Sorts array elements lexicographically in ascending order.
  return this.sort();
};

Array.prototype.orderStringsDescending = function() {
  // Sorts array elements lexicographically in descending order.
  return this.sort().reverse();
};

Array.prototype.filterOutElement = function( excludedVal ) {
  // Returns a new array with all occurrences of `excludedVal` removed.
  return this.filter(currentElement => currentElement !== excludedVal);
};

/*
 * Main function to process grid-based input and calculate a minimum distance.
 * It simulates a propagation process on a grid.
 */
function processInputData( inputLines ) {
  // Parse dimensions and propagation steps from the first line.
  const numericValues = inputLines[0].split(' ').map(parseInteger);
  const gridHeight = numericValues[0];
  const gridWidth = numericValues[1];
  const propagationSteps = numericValues[2];

  // Initialize the grid state and find the starting 'StartPoint' cells.
  let activeCells = []; // Stores coordinates of currently 'StartPoint' cells.
  const gridState = inputLines.slice(1).map(lineSegment => lineSegment.split(''));

  // Locate the initial 'StartPoint' cell in the grid.
  searchStartCell: for (let currentRow = 0; currentRow < gridHeight; currentRow++) {
    for (let currentCol = 0; currentCol < gridWidth; currentCol++) {
      if (gridState[currentRow][currentCol] === 'S') { // Original 'S'
        activeCells = [[currentRow, currentCol]];
        break searchStartCell; // Exit both loops once found.
      }
    }
  }

  // Simulate the propagation process for K steps.
  for (let stepIndex = 0; stepIndex < propagationSteps; stepIndex++) {
    const nextActiveCells = []; // Cells that become 'StartPoint' in the next step.

    // Iterate through all currently active cells.
    for (let cellIndex = 0, totalActiveCells = activeCells.length; cellIndex < totalActiveCells; cellIndex++) {
      const currentCellCoords = activeCells[cellIndex];
      const cellRow = currentCellCoords[0];
      const cellCol = currentCellCoords[1];

      // Check all four cardinal directions (up, down, left, right).
      let directionIterator = 4;
      while (directionIterator--) {
        let neighborRow, neighborCol;

        // Determine neighbor coordinates based on direction.
        switch(directionIterator) {
          case 3: // Up
            neighborRow = cellRow - 1;
            neighborCol = cellCol;
            break;
          case 2: // Down
            neighborRow = cellRow + 1;
            neighborCol = cellCol;
            break;
          case 1: // Left
            neighborRow = cellRow;
            neighborCol = cellCol - 1;
            break;
          case 0: // Right
            neighborRow = cellRow;
            neighborCol = cellCol + 1;
            break;
        }

        // Validate neighbor coordinates and check if it's an 'Empty' cell.
        if (0 <= neighborRow && neighborRow < gridHeight &&
            0 <= neighborCol && neighborCol < gridWidth &&
            (gridState[neighborRow][neighborCol] === '.') // Original '.'
        ) {
          // Mark the neighbor as 'StartPoint' and add it to the next set of active cells.
          gridState[neighborRow][neighborCol] = 'S'; // Original 'S'
          nextActiveCells.push([neighborRow, neighborCol]);
        }
      }
    }
    activeCells = nextActiveCells; // Update active cells for the next step.
  }

  // Calculate the minimum distance from any 'StartPoint' cell to the border.
  let minDistance = Number.POSITIVE_INFINITY;

  findMinDistance: for (let checkRow = 0; checkRow < gridHeight; checkRow++) {
    for (let checkCol = 0; checkCol < gridWidth; checkCol++) {
      const cellContent = gridState[checkRow][checkCol];

      // If the cell is an 'StartPoint' cell, calculate its distance to the border.
      if (cellContent === 'S') { // Original 'S'
        const distanceToBorder = Math.min(
          checkCol,                     // Distance to left border
          checkRow,                     // Distance to top border
          gridWidth - 1 - checkCol,     // Distance to right border
          gridHeight - 1 - checkRow     // Distance to bottom border
        );

        // If a cell is directly on the border, the minimum distance is 1.
        if (distanceToBorder === 0) {
          minDistance = 1;
          break findMinDistance; // No need to check further, 1 is the absolute minimum.
        }

        // Calculate the required steps to reach the border and update minDistance.
        minDistance = Math.min(minDistance, Math.ceil(distanceToBorder / propagationSteps) + 1);
      }
    }
  }

  // Output the final calculated minimum distance.
  console.log(minDistance);
}

// Read input from standard input, process it, and call the main function.
processInputData(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .split('\n')
    .map(lineData => lineData.trim())
);