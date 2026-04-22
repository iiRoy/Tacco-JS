try {
  const displayMessage = console.log; // Assign console.log to a new identifier for output

  // Check for Node.js environment to handle standard input stream
  if (typeof process !== "undefined") {
    let incomingText = ""; // Buffer for accumulating input data
    process.stdin.resume(); // Ensure the input stream remains active
    process.stdin.setEncoding('utf8'); // Specify UTF-8 encoding for input characters

    // Event listener to append data chunks as they arrive
    process.stdin.on('data', function (dataSegment) {
      incomingText += dataSegment;
    });

    // Event listener for when the input stream concludes
    process.stdin.on('end', function () {
      const inputRecords = incomingText.split("\n"); // Split the accumulated text into an array of lines
      processGrid(inputRecords); // Call the main grid processing function with the parsed lines
    });
  }


  // --- Auxiliary Coordinate Functions ---


  /**
   * Determines if the second coordinate pair is positioned to the right of the first.
   * @param {number[]} itemA - The initial coordinate pair, e.g., [row, column].
   * @param {number[]} itemB - The comparison coordinate pair.
   * @returns {boolean} True if itemB's column index is greater than itemA's.
   */
  function isMoreLateral(itemA, itemB) {
    return itemA[1] < itemB[1];
  }

  /**
   * Determines if the second coordinate pair is positioned below the first.
   * @param {number[]} itemA - The initial coordinate pair, e.g., [row, column].
   * @param {number[]} itemB - The comparison coordinate pair.
   * @returns {boolean} True if itemB's row index is greater than itemA's.
   */
  function isMoreVertical(itemA, itemB) {
    return itemA[0] < itemB[0];
  }

  /**
   * Computes the coordinate pair located one unit to the right of the provided point.
   * @param {number[]} currentPoint - The base coordinate pair [row, column].
   * @returns {number[]} A new coordinate pair [row, column + 1].
   */
  function obtainRightCoord(currentPoint) {
    return [currentPoint[0], currentPoint[1] + 1];
  }

  /**
   * Computes the coordinate pair located one unit below the provided point.
   * @param {number[]} currentPoint - The base coordinate pair [row, column].
   * @returns {number[]} A new coordinate pair [row + 1, column].
   */
  function obtainDownCoord(currentPoint) {
    return [currentPoint[0] + 1, currentPoint[1]];
  }

  /**
   * Ascertains if a given coordinate is "dominated" by any element within a collection of "superior" coordinates.
   * This involves checking for horizontal or vertical dominance.
   *
   * @param {number[]} testedCoord - The coordinate pair to evaluate for dominance [row, col].
   * @param {Array<number[]>} superiorCoords - A mutable list of potentially dominant coordinate pairs.
   * @returns {boolean} True if 'testedCoord' is found to be dominated by any point in 'superiorCoords'.
   */
  function findDominantPair(testedCoord, superiorCoords) {
    // The 'unshift' operation modifies the array by adding 'false' at the beginning,
    // and returns the new length. This is done to ensure the array is not empty
    // for the 'reduce' method, without providing an initial value to 'reduce'.
    // The specific returned length is not used in the logic.
    const temporaryPlaceholder = superiorCoords.unshift(false);

    const outcomeValue = superiorCoords.reduce(function (previousStatus, currentControlPoint) {
      if (previousStatus) {
        return previousStatus; // If a dominant point has already been found, propagate the true status
      } else {
        // If column indices are identical, check for vertical dominance
        if (testedCoord[1] === currentControlPoint[1]) {
          return isMoreVertical(currentControlPoint, testedCoord);
        }
        // If row indices are identical, check for lateral dominance
        if (testedCoord[0] === currentControlPoint[0]) {
          return isMoreLateral(currentControlPoint, testedCoord);
        }
        return previousStatus; // No dominance found in this iteration
      }
    });

    superiorCoords.shift(); // Remove the 'false' placeholder that was added at the beginning
    return outcomeValue;
  }


  /**
   * Main function responsible for processing the input grid and identifying the largest valid rectangular area.
   * @param {string[]} inputRecords - An array where each string represents a row of the grid.
   */
  function processGrid(inputRecords) {
    // Transform input strings into a 2D array of floating-point numbers
    const parsedInputRows = inputRecords.map(function (rowString) {
      return rowString.split(" ").map(function (cellString) {
        return parseFloat(cellString); // Convert string to number, handling potential decimals
      });
    });

    // Extract grid height and width from the first processed row
    const headerData = parsedInputRows.shift();
    const numRows = headerData[0]; // Grid's vertical dimension
    const numCols = headerData[1]; // Grid's horizontal dimension

    let peakArea = -1; // Variable to store the maximum area discovered, initialized to -1

    // Initialize 2D arrays to hold calculated states for each cell
    // zeroBoundaryX: Stores the maximum row index of a '0' that is above or at the current column.
    const zeroBoundaryX = Array(numRows).fill(0).map(() => Array(numCols).fill(-1));
    // zeroBoundaryY: Stores the maximum column index of a '0' that is to the left or at the current row.
    const zeroBoundaryY = Array(numRows).fill(0).map(() => Array(numCols).fill(-1));
    // controlPoints: Stores a list of "dominant" (top-left) '0' coordinates that define valid rectangles
    // ending at the current cell.
    const controlPoints = Array(numRows).fill(0).map(() => Array(numCols).fill([]));

    // Iterate through each cell (row by row, column by column) of the grid
    for (let rowIndex = 0; rowIndex < numRows; ++rowIndex) {
      for (let colIndex = 0; colIndex < numCols; ++colIndex) {
        const currentCellDatum = parsedInputRows[rowIndex][colIndex];

        // Determine the previous zero boundaries and inherited dominant points from adjacent cells
        let priorX = (rowIndex === 0) ? -1 : zeroBoundaryX[rowIndex - 1][colIndex];
        let priorY = (colIndex === 0) ? -1 : zeroBoundaryY[rowIndex][colIndex - 1];
        const inheritedControls = (rowIndex === 0 || colIndex === 0) ? [] : controlPoints[rowIndex - 1][colIndex - 1];

        let updatedControls; // This will store the new set of dominant points for the current cell

        if (currentCellDatum === 0) {
          // If the current cell contains a 0, update boundaries and dominant points
          const xReference = [priorX, colIndex]; // Reference point for vertical boundary checks
          const yReference = [rowIndex, priorY]; // Reference point for horizontal boundary checks

          updatedControls = inheritedControls.map(function (existingControl) {
            // Adjust existing dominant points based on the current cell's position and boundaries
            if (!isMoreLateral(yReference, existingControl)) {
              return [existingControl[0], priorY + 1];
            }
            if (!isMoreVertical(xReference, existingControl)) {
              return [priorX + 1, existingControl[1]];
            }
            return existingControl; // If no adjustment is needed, keep the existing control point
          });

          // Add new dominant points derived from the current cell's coordinates
          updatedControls.push(obtainRightCoord(yReference));
          updatedControls.push(obtainDownCoord(xReference));

          // Filter out any control points that are subdominant to others within the current set
          updatedControls = updatedControls.filter(function (candidateControl) {
            return !findDominantPair(candidateControl, updatedControls);
          });

          // Remove any duplicate control points that might have been generated
          updatedControls = updatedControls.filter(function (elementItem, currentIdx) {
            for (let comparisonIdx = 0; comparisonIdx < currentIdx; ++comparisonIdx) {
              const comparedItem = updatedControls[comparisonIdx];
              if (comparedItem[0] === elementItem[0] && comparedItem[1] === elementItem[1]) {
                return false; // This element is a duplicate of an earlier one
              }
            }
            return true; // This element is unique so far
          });

        } else {
          // If the current cell contains a 1, reset boundaries and clear dominant points,
          // as a '1' breaks any continuous rectangle.
          priorX = rowIndex;
          priorY = colIndex;
          updatedControls = [];
        }

        // Store the computed values for the current cell in their respective arrays
        controlPoints[rowIndex][colIndex] = updatedControls;
        zeroBoundaryX[rowIndex][colIndex] = priorX;
        zeroBoundaryY[rowIndex][colIndex] = priorY;

        // Calculate potential rectangle areas based on the current cell's dominant points
        const candidateProducts = [-1]; // Initialize with -1 to ensure Math.max works correctly even if updatedControls is empty
        updatedControls.forEach(function (controlPoint) {
          const heightMeasure = rowIndex - controlPoint[0] + 1;
          const widthMeasure = colIndex - controlPoint[1] + 1;
          candidateProducts.push(heightMeasure * widthMeasure);
        });

        // Determine the maximum area among the candidates for the current cell
        const currentMaxArea = Math.max.apply(null, candidateProducts);
        if (currentMaxArea > peakArea) {
          peakArea = currentMaxArea; // Update the overall maximum area found
        }
      }
    }
    displayMessage(peakArea); // Output the final largest rectangular area
  }
} catch (errorDetails) {
  displayMessage(errorDetails); // Catch and display any errors that occur during execution
}