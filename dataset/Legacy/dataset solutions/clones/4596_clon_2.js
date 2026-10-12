function parseInteger(strVal) {
  return parseInt(strVal);
}

function parseFloatNum(strVal) {
  return parseFloat(strVal);
}

function isEven(numVal) {
  return (numVal % 2) === 0;
}

function isOdd(numVal) {
  return (numVal % 2) === 1;
}

// Extend Array prototype with custom sorting and filtering methods
Array.prototype.sortAscendingNumbers = function () {
  return this.sort((valA, valB) => (valA - valB));
};

Array.prototype.sortDescendingNumbers = function () {
  return this.sort((valA, valB) => (valB - valA));
};

Array.prototype.sortAscendingStrings = function () {
  return this.sort();
};

Array.prototype.sortDescendingStrings = function () {
  return this.sort().reverse();
};

Array.prototype.filterOutElement = function (elementToRemove) {
  return this.filter(currentElement => currentElement !== elementToRemove);
};

function processInputData(inputLines) {
  // Parse the first line for grid dimensions and max steps
  var parsedDimensions = inputLines[0].split(' ').map(parseInteger);
  var gridHeight = parsedDimensions[0];
  var gridWidth = parsedDimensions[1];
  var maxSteps = parsedDimensions[2];

  var startPosition = []; // Stores [start_row, start_col]

  // Create the game grid from input lines, splitting each line into characters
  var gameGrid = inputLines.slice(1).map(lineStr => lineStr.split(''));

  // Find the starting position 'S' within the grid
  gridSearchLoop: for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    for (var colIdx = 0; colIdx < gridWidth; colIdx++) {
      if (gameGrid[rowIdx][colIdx] === 'S') {
        startPosition = [rowIdx, colIdx];
        break gridSearchLoop; // Exit both loops once 'S' is found
      }
    }
  }

  // Recursive function to explore paths from a given cell
  function explorePath(currRow, currCol, currentDepth) {
    // Base cases for stopping recursion
    if (currentDepth > maxSteps) {
      return; // Path too long
    }
    if (currRow < 0 || gridHeight <= currRow || currCol < 0 || gridWidth <= currCol) {
      return; // Out of bounds
    }

    var cellValue = gameGrid[currRow][currCol];

    // Check if the current cell can be visited or updated
    if (
      cellValue === '.' || cellValue === 'S' ||
      ((typeof cellValue === 'number') && cellValue > currentDepth)
    ) {
      gameGrid[currRow][currCol] = currentDepth; // Mark cell with current depth

      // Schedule exploration of adjacent cells for the next step
      setTimeout(function() {
        explorePath(currRow - 1, currCol, currentDepth + 1); // Up
        explorePath(currRow + 1, currCol, currentDepth + 1); // Down
        explorePath(currRow, currCol - 1, currentDepth + 1); // Left
        explorePath(currRow, currCol + 1, currentDepth + 1); // Right
      }, 0); // Use setTimeout to prevent stack overflow for deep recursion
    }
  }

  // Initiate the path exploration from the starting point
  explorePath(startPosition[0], startPosition[1], 0);

  // Function to calculate minimum steps to reach any edge from a cell
  function calculateMinExitSteps(currentH, currentW) {
    var distToBottom = (gridHeight - 1) - currentH;
    var distToTop = currentH;
    var distToRight = (gridWidth - 1) - currentW;
    var distToLeft = currentW;
    return Math.min(distToBottom, distToTop, distToRight, distToLeft);
  }

  var minExitPath = Number.POSITIVE_INFINITY; // Initialize with a very large value

  // Iterate through the grid to find the minimum steps to exit
  exitCalculationLoop: for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    for (var colIdx = 0; colIdx < gridWidth; colIdx++) {
      var cellContent = gameGrid[rowIdx][colIdx];
      // Only consider cells that were reached during exploration (marked with a number)
      if (typeof cellContent === 'number') {
        var currentStepCount = calculateMinExitSteps(rowIdx, colIdx);
        if (currentStepCount === 0) {
          minExitPath = 1; // If already at an edge, 1 step to exit
          break exitCalculationLoop; // Found the quickest exit, no need to check further
        }
        // Calculate steps to exit: (steps to edge / K) + 1 (for the exit move itself)
        minExitPath = Math.min(minExitPath, Math.ceil(currentStepCount / maxSteps) + 1);
      }
    }
  }

  console.log(minExitPath); // Output the final minimum steps
}

// Read input from stdin, split by newlines, trim each line, and pass to main function
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(line => line.trim()));
