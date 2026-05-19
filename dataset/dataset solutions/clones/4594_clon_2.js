function parseInteger(inputStr) {
  // Converts a string to an integer.
  return parseInt(inputStr);
}

function parseFloatValue(inputStr) {
  // Converts a string to a floating-point number.
  return parseFloat(inputStr);
}

function isEven(numVal) {
  // Checks if a number is even.
  return (numVal % 2) === 0;
}

function isOdd(numVal) {
  // Checks if a number is odd.
  return (numVal % 2) === 1;
}

// Extend Array prototype with custom sorting and filtering methods.
Array.prototype.sortAscendingNumbers = function () {
  // Sorts an array of numbers in ascending order.
  return this.sort((first, second) => (first - second));
};

Array.prototype.sortDescendingNumbers = function () {
  // Sorts an array of numbers in descending order.
  return this.sort((first, second) => (second - first));
};

Array.prototype.sortAscendingStrings = function () {
  // Sorts an array of strings in ascending lexicographical order.
  return this.sort();
};

Array.prototype.sortDescendingStrings = function () {
  // Sorts an array of strings in descending lexicographical order.
  return this.sort().reverse();
};

Array.prototype.filterOutElement = function (elementToRemove) {
  // Returns a new array with all occurrences of a specific element removed.
  return this.filter(currentElement => currentElement !== elementToRemove);
};

function processGridData(inputLines) {
  // Main function to process grid data and find the minimum steps.

  // Parse the first line for grid dimensions and max steps per jump.
  var dimensionsArray = inputLines[0].split(' ').map(parseInteger);
  var gridHeight = dimensionsArray[0];
  var gridWidth = dimensionsArray[1];
  var maxStepsPerJump = dimensionsArray[2];

  // Initialize starting position.
  var startPosition = [];

  // Create the grid from the remaining input lines.
  var currentGridState = inputLines.slice(1).map(lineContent => lineContent.split(''));

  // Find the 'S' (start) position in the grid.
  findStart: for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    for (var colIdx = 0; colIdx < gridWidth; colIdx++) {
      if (currentGridState[rowIdx][colIdx] === 'S') {
        startPosition = [rowIdx, colIdx];
        break findStart; // Exit both loops once 'S' is found.
      }
    }
  }

  // Recursive function to explore paths from the start position.
  function explorePath(currentRow, currentCol, currentStepCount) {
    // If current steps exceed K, or outside grid boundaries, stop.
    if (currentStepCount > maxStepsPerJump) return;
    if (currentRow < 0 || gridHeight <= currentRow || currentCol < 0 || gridWidth <= currentCol) return;

    var cellValue = currentGridState[currentRow][currentCol];

    // If the cell is traversable ('.', 'S', or a higher step count already recorded),
    // update it and explore neighbors.
    if (
      cellValue === '.' || cellValue === 'S' ||
      ((typeof cellValue === 'number') && cellValue > currentStepCount)
    ) {
      currentGridState[currentRow][currentCol] = currentStepCount; // Mark cell with current step count.

      // Explore adjacent cells.
      explorePath(currentRow - 1, currentCol, currentStepCount + 1); // Up
      explorePath(currentRow + 1, currentCol, currentStepCount + 1); // Down
      explorePath(currentRow, currentCol - 1, currentStepCount + 1); // Left
      explorePath(currentRow, currentCol + 1, currentStepCount + 1); // Right
    }
  }

  // Start the path exploration from the 'S' position with 0 steps.
  explorePath(startPosition[0], startPosition[1], 0);

  // Helper function to calculate minimum distance from a cell to any edge.
  function calculateMinDistanceToEdge(currentH, currentW) {
    var distToBottom = (gridHeight - 1) - currentH;
    var distToTop = currentH;
    var distToRight = (gridWidth - 1) - currentW;
    var distToLeft = currentW;
    return Math.min(distToBottom, distToTop, distToRight, distToLeft);
  }

  var overallMinimumSteps = Infinity; // Initialize minimum steps to a very large value.

  // Iterate through the grid to find the minimum steps to reach an edge.
  findMin: for (var r = 0; r < gridHeight; r++) {
    for (var c = 0; c < gridWidth; c++) {
      var cellData = currentGridState[r][c];

      // If the cell was visited (contains a number representing steps).
      if (typeof cellData === 'number') {
        var stepsToEdge = calculateMinDistanceToEdge(r, c);

        // If an edge cell is reachable, the minimum steps is 1.
        if (stepsToEdge === 0) {
          overallMinimumSteps = 1;
          break findMin; // Optimization: if 1 step is possible, it's the minimum.
        }

        // Calculate total steps: (ceil(distance_to_edge / K) + 1 for the jump itself)
        overallMinimumSteps = Math.min(overallMinimumSteps, Math.ceil(stepsToEdge / maxStepsPerJump) + 1);
      }
    }
  }

  // Output the final minimum steps.
  console.log(overallMinimumSteps);
}

// Read input from stdin, split by newlines, and trim each line.
processGridData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(l => l.trim()));
