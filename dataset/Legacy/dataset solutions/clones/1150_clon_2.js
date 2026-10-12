try {
  // Establish a logging utility for displaying results or errors.
  var outputLogger = console.log;

  // Check for Node.js environment to handle standard input.
  if (typeof process !== "undefined") {
    var receivedData = ""; // Buffer to accumulate input chunks.
    process.stdin.resume(); // Ensure the input stream stays open.
    process.stdin.setEncoding('utf8'); // Specify character encoding for input.

    // Event handler for incoming data.
    process.stdin.on('data', function (chunk) {
      receivedData += chunk; // Append each data chunk to the buffer.
    });

    // Event handler for the end of input stream.
    process.stdin.on('end', function () {
      var dataRows = receivedData.split("\n"); // Split the accumulated data into individual lines.
      processGridData(dataRows); // Invoke the primary grid processing function.
    });
  }

  // --- Auxiliary Functions for Coordinate Logic ---

  /**
   * Determines if a second coordinate is positioned to the right of a first coordinate.
   * @param {Array<number>} coordA - The reference coordinate [row, column].
   * @param {Array<number>} coordB - The coordinate to compare [row, column].
   * @returns {boolean} True if coordB's column index is greater than coordA's.
   */
  function isFurtherRight(coordA, coordB) {
    return coordA[1] < coordB[1];
  }

  /**
   * Determines if a second coordinate is positioned below a first coordinate.
   * @param {Array<number>} coordA - The reference coordinate [row, column].
   * @param {Array<number>} coordB - The coordinate to compare [row, column].
   * @returns {boolean} True if coordB's row index is greater than coordA's.
   */
  function isFurtherDown(coordA, coordB) {
    return coordA[0] < coordB[0];
  }

  /**
   * Computes the coordinate directly to the right of a given coordinate.
   * @param {Array<number>} currentCoord - The base coordinate [row, column].
   * @returns {Array<number>} A new coordinate [row, column + 1].
   */
  function getRightNeighbor(currentCoord) {
    return [currentCoord[0], currentCoord[1] + 1];
  }

  /**
   * Computes the coordinate directly below a given coordinate.
   * @param {Array<number>} currentCoord - The base coordinate [row, column].
   * @returns {Array<number>} A new coordinate [row + 1, column].
   */
  function getDownNeighbor(currentCoord) {
    return [currentCoord[0] + 1, currentCoord[1]];
  }

  /**
   * Checks if a candidate element is dominated by any other element within a provided set.
   * Dominance is defined by being further down (same column) or further right (same row).
   * @param {Array<number>} candidateElement - The coordinate [row, column] to check for dominance.
   * @param {Array<Array<number>>} dominantSet - The collection of potential dominant coordinates.
   * @returns {boolean} True if the candidate is subdominant to at least one element in the set.
   */
  function hasMoreDominantElement(candidateElement, dominantSet) {
    // The original code uses unshift/shift to handle reduce's initial value.
    // This pattern is preserved for Type II structural equivalence.
    var tempPlaceholder = dominantSet.unshift(false);
    var resultFlag = dominantSet.reduce(function (previousValue, currentValue) {
      if (previousValue) {
        return previousValue; // If dominance already detected, propagate true.
      } else {
        // Check if currentValue dominates candidateElement.
        if (candidateElement[1] === currentValue[1]) { // If in the same column
          return isFurtherDown(currentValue, candidateElement);
        }
        if (candidateElement[0] === currentValue[0]) { // If in the same row
          return isFurtherRight(currentValue, candidateElement);
        }
        return previousValue; // No dominance found by this currentValue.
      }
    });
    dominantSet.shift(); // Remove the temporary placeholder.
    return resultFlag;
  }

  /**
   * The main function to process the grid, calculate and output the maximum area.
   * @param {Array<string>} inputLines - An array of strings, each representing a row of the grid.
   */
  function processGridData(inputLines) {
    // Convert string lines into arrays of numbers.
    var parsedLines = inputLines.map(function (lineStr) {
      return lineStr.split(" ").map(function (numStr) {
        return Number(numStr);
      });
    });

    // Extract grid dimensions from the first line of input.
    var gridDimensions = parsedLines.shift();
    var gridHeight = gridDimensions[0];
    var gridWidth = gridDimensions[1];

    var maximumArea = -1; // Variable to store the largest rectangle area found.

    // Initialize 2D arrays to store computed values for each cell.
    // `nextXCoords` and `nextYCoords` track the 'next' valid X and Y coordinates for rectangle formation.
    // `dominantElements` stores a list of dominant points for each cell.
    var nextXCoords = new Array(gridHeight).fill(0).map(function () {
      return new Array(gridWidth).fill(-1);
    });
    var nextYCoords = new Array(gridHeight).fill(0).map(function () {
      return new Array(gridWidth).fill(-1);
    });
    var dominantElements = new Array(gridHeight).fill(0).map(function () {
      return new Array(gridWidth).fill([]);
    });

    // Iterate through each cell of the grid, row by row, column by column.
    for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
      for (var colIdx = 0; colIdx < gridWidth; colIdx++) {
        var cellValue = parsedLines[rowIdx][colIdx]; // Get the value of the current cell.

        // Retrieve values from previously processed adjacent cells.
        var prevNextX = rowIdx === 0 ? -1 : nextXCoords[rowIdx - 1][colIdx];
        var prevNextY = colIdx === 0 ? -1 : nextYCoords[rowIdx][colIdx - 1];
        var prevDominant = (rowIdx === 0 || colIdx === 0) ? [] : dominantElements[rowIdx - 1][colIdx - 1];

        var newDominantSet; // This will hold the updated set of dominant elements for the current cell.

        if (cellValue === 0) {
          // If the cell value is 0, it can extend or start a rectangle.
          var xCandidate = [prevNextX, colIdx]; // A potential top-left X-coordinate.
          var yCandidate = [rowIdx, prevNextY]; // A potential top-left Y-coordinate.

          // Transform previous dominant elements based on current cell's context.
          newDominantSet = prevDominant.map(function (domElem) {
            if (!isFurtherRight(yCandidate, domElem)) {
              return [domElem[0], prevNextY + 1];
            }
            if (!isFurtherDown(xCandidate, domElem)) {
              return [prevNextX + 1, domElem[1]];
            }
            return domElem;
          });

          // Add new dominant points derived from the current cell's position.
          newDominantSet.push(getRightNeighbor(yCandidate));
          newDominantSet.push(getDownNeighbor(xCandidate));

          // Filter out any elements that are subdominant within the new set.
          newDominantSet = newDominantSet.filter(function (filterElem) {
            return !hasMoreDominantElement(filterElem, newDominantSet);
          });

          // Filter out duplicate elements to ensure uniqueness in the set.
          newDominantSet = newDominantSet.filter(function (filterElem, filterIdx) {
            for (var checkIdx = 0; checkIdx < filterIdx; checkIdx++) {
              var otherElem = newDominantSet[checkIdx];
              if (otherElem[0] === filterElem[0] && otherElem[1] === filterElem[1]) {
                return false; // This element is a duplicate.
              }
            }
            return true; // This element is unique so far.
          });

        } else {
          // If the cell value is 1, it acts as an obstacle, resetting rectangle potential.
          prevNextX = rowIdx; // The 'next' X coordinate becomes the current row.
          prevNextY = colIdx; // The 'next' Y coordinate becomes the current column.
          newDominantSet = []; // No dominant elements can pass through an obstacle.
        }

        // Store the computed values for the current cell.
        dominantElements[rowIdx][colIdx] = newDominantSet;
        nextXCoords[rowIdx][colIdx] = prevNextX;
        nextYCoords[rowIdx][colIdx] = prevNextY;

        // Calculate areas of all possible rectangles ending at the current cell.
        var currentMaxAreas = [-1]; // Initialize with -1 to ensure Math.max works correctly even with an empty set.
        newDominantSet.forEach(function (currentDom) {
          var currentHeight = rowIdx - currentDom[0] + 1;
          var currentWidth = colIdx - currentDom[1] + 1;
          currentMaxAreas.push(currentHeight * currentWidth);
        });
        var localMaxArea = Math.max.apply(this, currentMaxAreas); // Find the maximum area among these.
        if (localMaxArea > maximumArea) {
          maximumArea = localMaxArea; // Update the overall maximum area if a larger one is found.
        }
      }
    }
    outputLogger(maximumArea); // Output the final calculated maximum area.
  }
} catch (errorObject) {
  outputLogger(errorObject); // Catch and log any exceptions that occur during execution.
}
