// Utility function to convert a string to an integer.
function parseInteger(inputString) {
  return parseInt(inputString, 10);
}

// Utility function to convert a string to a floating-point number.
function parseFloatValue(inputString) {
  return parseFloat(inputString);
}

// Checks if a number is even.
function isEven(value) {
  return (value % 2) === 0;
}

// Checks if a number is odd.
function isOdd(value) {
  return (value % 2) === 1;
}

// Extends Array prototype with a method to sort numbers in ascending order.
Array.prototype.numericSortAscending = function () {
  return this.sort((firstElement, secondElement) => (firstElement - secondElement));
};

// Extends Array prototype with a method to sort numbers in descending order.
Array.prototype.numericSortDescending = function () {
  return this.sort((firstElement, secondElement) => (secondElement - firstElement));
};

// Extends Array prototype with a method to sort strings in ascending order.
Array.prototype.stringSortAscending = function () {
  return this.sort();
};

// Extends Array prototype with a method to sort strings in descending order.
Array.prototype.stringSortDescending = function () {
  return this.sort().reverse();
};

// Extends Array prototype with a method to filter out a specific element.
Array.prototype.filterOutElement = function (elementToRemove) {
  return this.filter(currentElement => currentElement !== elementToRemove);
};

// Main function to process the grid data and calculate the minimum moves.
function processGridData(inputLines) {
  // Parse the first line for grid dimensions and expansion steps.
  const initialParams = inputLines[0].split(' ').map(parseInteger);
  const gridHeight = initialParams[0];
  const gridWidth = initialParams[1];
  const expansionSteps = initialParams[2];

  // Initialize an array to store the current expansion points (starting with 'S').
  let currentExpansionPoints = [];

  // Create the game grid from the input lines, splitting each line into characters.
  const gameGrid = inputLines.slice(1).map(lineContent => lineContent.split(''));

  // Find the initial 'S' position on the grid.
  gridSearch: for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
      if (gameGrid[rowIdx][colIdx] === 'S') {
        currentExpansionPoints = [[rowIdx, colIdx]];
        break gridSearch; // Exit both loops once 'S' is found.
      }
    }
  }

  // Perform K expansion steps.
  for (let stepCounter = 0; stepCounter < expansionSteps; stepCounter++) {
    const nextExpansionPoints = []; // Stores points expanded in this step.

    // Iterate through all current expansion points.
    for (let pointIndex = 0, currentPointsLength = currentExpansionPoints.length; pointIndex < currentPointsLength; pointIndex++) {
      const currentCoords = currentExpansionPoints[pointIndex];
      const currentRow = currentCoords[0];
      const currentCol = currentCoords[1];

      // Check all four cardinal directions (up, down, left, right).
      let directionIdx = 4;
      while (directionIdx--) { // Loop from 3 down to 0
        let nextRow, nextCol;

        switch (directionIdx) {
          case 3: // Up
            nextRow = currentRow - 1;
            nextCol = currentCol;
            break;
          case 2: // Down
            nextRow = currentRow + 1;
            nextCol = currentCol;
            break;
          case 1: // Left
            nextRow = currentRow;
            nextCol = currentCol - 1;
            break;
          case 0: // Right
            nextRow = currentRow;
            nextCol = currentCol + 1;
            break;
        }

        // Check if the new coordinates are within grid boundaries and the cell is empty ('.').
        if (nextRow >= 0 && nextRow < gridHeight &&
            nextCol >= 0 && nextCol < gridWidth &&
            (gameGrid[nextRow][nextCol] === '.')
        ) {
          gameGrid[nextRow][nextCol] = 'S'; // Mark the cell as expanded.
          nextExpansionPoints.push([nextRow, nextCol]); // Add to the list for the next step.
        }
      }
    }
    currentExpansionPoints = nextExpansionPoints; // Update points for the next iteration.
  }

  // Calculate the minimum number of moves required to reach a border.
  let minRequiredMoves = Infinity;

  // Iterate through the entire grid to find expanded 'S' cells.
  gridSearch: for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
      const cellContent = gameGrid[rowIdx][colIdx];
      if (cellContent === 'S') {
        // Calculate the distance to the nearest border.
        const distanceToBorder = Math.min(colIdx, rowIdx, gridWidth - 1 - colIdx, gridHeight - 1 - rowIdx);

        if (distanceToBorder === 0) {
          minRequiredMoves = 1; // If an 'S' is on the border, 1 move is enough.
          break gridSearch; // No need to check further.
        }
        // Update the minimum moves, considering K expansion steps per move.
        minRequiredMoves = Math.min(minRequiredMoves, Math.ceil(distanceToBorder / expansionSteps) + 1);
      }
    }
  }

  // Output the final minimum number of moves.
  console.log(minRequiredMoves);
}

// Read input from stdin, process it, and call the main function.
processGridData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(line => line.trim()));
