// Strict mode activated
// This file contains a solution for a grid-based counting problem.
// It uses a custom data structure for efficient point retrieval and counting.

class ProblemSolver {
  // Main entry point for the problem solution logic.
  computeOptimalCoverage() {
    // Read initial problem parameters: total number of points and grid scaling factor.
    const dimensionDetails = dataReader.readIntegerArray();
    const pointCount = dimensionDetails[0];
    const gridSizeFactor = dimensionDetails[1];

    // Calculate a derived grid dimension (2 * k), which defines the repeating pattern.
    const doubleGridFactor = 2 * gridSizeFactor;

    // Process raw input strings into structured point objects with normalized coordinates.
    // The 'B' character indicates an offset for the X coordinate.
    const inputPoints = dataReader.readStringMatrix(pointCount).map(pointData => {
      let currentX = parseInt(pointData[0], 10);
      // Apply offset if the third element is 'B' (Black cell logic).
      if (pointData[2] === 'B') {
        currentX += gridSizeFactor;
      }
      return {
        xCoord: currentX % doubleGridFactor,
        yCoord: parseInt(pointData[1], 10) % doubleGridFactor,
      };
    });

    // Initialize a specialized grid structure for efficient spatial queries.
    const pointStore = CoordinateDataGrid.createFromData(inputPoints);

    // Helper function to determine the "color" (0 or 1) of a grid cell based on its coordinates
    // relative to the gridSizeFactor. This determines which points contribute to the initial count.
    const getCellParity = (xValue, yValue) => {
      const xQuadrant = (xValue < gridSizeFactor) ? 0 : 1;
      const yQuadrant = (yValue < gridSizeFactor) ? 0 : 1;
      return xQuadrant ^ yQuadrant; // XOR operation for alternating pattern
    };

    // Calculate the initial count of points in "white" cells (parity 0).
    let currentBlackCellCoverage = inputPoints.filter(p => getCellParity(p.xCoord, p.yCoord) === 0).length;
    let maximumCoverageFound = currentBlackCellCoverage; // Initialize max with the initial count.

    // Iterate through possible Y-axis shifts (dy) from 0 to k-1.
    // This loop simulates shifting the entire grid vertically.
    for (let currentYShift = 0; currentYShift < gridSizeFactor; ++currentYShift) {
      // Temporary storage for counts to optimize inner loop calculations.
      const columnCountsCache = new Array(doubleGridFactor).fill(null);

      // Iterate through possible X-axis shifts (dx) from 0 to 2k-1.
      // This loop simulates shifting the entire grid horizontally.
      for (let currentXShift = 0; currentXShift < doubleGridFactor; ++currentXShift) {
        // Update the maximum coverage found so far.
        maximumCoverageFound = Math.max(maximumCoverageFound, currentBlackCellCoverage);

        // Calculate the "wrapped" X coordinate for the adjacent column.
        // This handles the toroidal (wrapping) nature of the grid.
        let adjacentXShift = currentXShift + gridSizeFactor;
        if (adjacentXShift >= doubleGridFactor) {
            adjacentXShift -= doubleGridFactor;
        }

        // Cache lookup for counts of points within a specific column segment.
        // We are interested in points in the current column (dx) and the column shifted by k (dxk).
        // The segment spans from currentYShift to currentYShift + k.
        const segmentYEnd = currentYShift + gridSizeFactor;
        if (columnCountsCache[currentXShift] === null) {
          columnCountsCache[currentXShift] = pointStore.countPointsInRect(
            currentXShift, currentYShift,
            currentXShift, segmentYEnd
          );
        }
        if (columnCountsCache[adjacentXShift] === null) {
          columnCountsCache[adjacentXShift] = pointStore.countPointsInRect(
            adjacentXShift, currentYShift,
            adjacentXShift, segmentYEnd
          );
        }

        // Extract counts for the current column (dx) and its k-shifted counterpart (dxk).
        const currentColumnBlacks = columnCountsCache[currentXShift];
        const currentColumnTotal = pointStore.getDimensionSize('xCoord', currentXShift);
        const currentColumnWhites = currentColumnTotal - currentColumnBlacks;

        const adjacentColumnBlacks = columnCountsCache[adjacentXShift];
        const adjacentColumnTotal = pointStore.getDimensionSize('xCoord', adjacentXShift);
        const adjacentColumnWhites = adjacentColumnTotal - adjacentColumnBlacks;

        // Update the current coverage count based on the shift.
        // When shifting from dx to dx+1, points in dx change their "color" relative to the grid.
        // Points in dx that were "white" become "black", and vice versa.
        // Similarly for dx+k.
        // The change in count is (new_black_from_dx - old_black_from_dx) + (new_black_from_dxk - old_black_from_dxk).
        // A point moving from a white cell to a black cell contributes +1 to coverage.
        // A point moving from a black cell to a white cell contributes -1 to coverage.
        // So, for column dx: -currentColumnBlacks (they become white) + currentColumnWhites (they become black).
        // For column dxk: +adjacentColumnBlacks (they were white, now black) - adjacentColumnWhites (they were black, now white).
        currentBlackCellCoverage += (-currentColumnBlacks + currentColumnWhites) + (+adjacentColumnBlacks - adjacentColumnWhites);
      }

      // Skip empty rows (rows with no points) to optimize calculations.
      // This helps avoid unnecessary computations if large parts of the grid are sparse.
      while (currentYShift < gridSizeFactor - 1 &&
             pointStore.getDimensionSize('yCoord', currentYShift) === 0 &&
             pointStore.getDimensionSize('yCoord', currentYShift + gridSizeFactor) === 0) {
        ++currentYShift;
      }
      // If we've skipped past gridSizeFactor, no more processing is needed for Y shifts.
      if (currentYShift >= gridSizeFactor -1) {
        break; // Exit the outer loop if we've processed all relevant Y shifts
      }

      // After completing an X-shift cycle for a given Y-shift,
      // update the count based on the vertical shift for the *next* Y-shift.
      // This adjusts `currentBlackCellCoverage` for the transition to the next `currentYShift`.
      // We consider points in the current row (dy) and the row shifted by k (dy+k).
      // The range for X is from 0 to k (exclusive of k for the first part).
      const currentYRowBlacks = pointStore.countPointsInRect(0, currentYShift, gridSizeFactor, currentYShift);
      const currentYRowTotal = pointStore.getDimensionSize('yCoord', currentYShift);
      const currentYRowWhites = currentYRowTotal - currentYRowBlacks;

      const adjacentYRowBlacks = pointStore.countPointsInRect(0, currentYShift + gridSizeFactor, gridSizeFactor, currentYShift + gridSizeFactor);
      const adjacentYRowTotal = pointStore.getDimensionSize('yCoord', currentYShift + gridSizeFactor);
      const adjacentYRowWhites = adjacentYRowTotal - adjacentYRowBlacks;

      // Apply similar logic as the X-shift update to adjust for the Y-shift.
      // Points in currentYRow: -currentYRowBlacks (become white) + currentYRowWhites (become black)
      // Points in adjacentYRow: +adjacentYRowBlacks (were white, now black) - adjacentYRowWhites (were black, now white)
      currentBlackCellCoverage += (-currentYRowBlacks + currentYRowWhites) + (+adjacentYRowBlacks - adjacentYRowWhites);
    }
    // Ensure the final maximum is captured after the loop.
    maximumCoverageFound = Math.max(maximumCoverageFound, currentBlackCellCoverage);
    return maximumCoverageFound;
  }
}

// Custom data structure for storing and querying 2D points efficiently.
// It organizes points by both X and Y coordinates for fast range queries.
class CoordinateDataGrid {
  // Default parameters for the dimensions to be indexed.
  static get DefaultDimensionParameters() {
    return ['xCoord', 'yCoord'];
  }
  // Default sorting functions for each dimension when collecting points.
  static get DefaultSortingComparators() {
    return { 'xCoord': (ptA, ptB) => ptA.yCoord - ptB.yCoord, 'yCoord': (ptA, ptB) => ptA.xCoord - ptB.xCoord };
  }

  // Factory method to create and initialize a new grid instance.
  static createFromData(pointList, additionalDimensions, additionalComparators) {
    const newGridInstance = new CoordinateDataGrid();
    newGridInstance.initializeDataStore(pointList, additionalDimensions, additionalComparators);
    return newGridInstance;
  }

  // Returns the number of points associated with a specific index along a given dimension.
  getDimensionSize(dimensionKey, indexValue) {
    const collection = this.indexedCollections[dimensionKey];
    return (collection && collection[indexValue]) ? collection[indexValue].length : 0;
  }

  // Initializes the internal data structures of the grid.
  initializeDataStore(pointList, additionalDimensions, additionalComparators) {
    // Handle optional parameters.
    const extraDims = additionalDimensions || [];
    const extraComps = additionalComparators || {};

    // Combine default and additional dimension keys and sorting comparators.
    this.dimensionKeys = CoordinateDataGrid.DefaultDimensionParameters.concat(extraDims);
    this.sortingComparators = { ...CoordinateDataGrid.DefaultSortingComparators, ...extraComps };

    // Initialize collections for each dimension.
    // Each collection will be an object where keys are coordinate values and values are arrays of points.
    this.indexedCollections = {};
    this.dimensionKeys.forEach(dim => {
      this.indexedCollections[dim] = {};
    });

    // Populate the collections with points from the input list.
    pointList.forEach(pointObject => {
      this.dimensionKeys.forEach(dim => {
        const dimValue = pointObject[dim];
        if (this.indexedCollections[dim][dimValue] === undefined) {
          this.indexedCollections[dim][dimValue] = [];
        }
        this.indexedCollections[dim][dimValue].push(pointObject);
      });
    });

    // Sort the point arrays within each dimension's collection for efficient binary search.
    this.dimensionKeys.forEach(dim => {
      const elementsForDimension = this.indexedCollections[dim];
      for (const coordValue in elementsForDimension) {
        if (Object.prototype.hasOwnProperty.call(elementsForDimension, coordValue)) {
          elementsForDimension[coordValue].sort(this.sortingComparators[dim]);
        }
      }
    });

    return this; // Allow method chaining.
  }

  // Counts points within a specified rectangular region.
  // This implementation is optimized for queries where either x1 == x2 or y1 == y2 (a line segment).
  // For general rectangles, it returns -1 as it's not implemented.
  countPointsInRect(x1, y1, x2, y2) {
    // If it's a vertical line segment (same X coordinate).
    if (x1 === x2) {
      const column = this.indexedCollections.xCoord[x1];
      if (!column) return 0; // No points in this column.

      // Use binary search to find the start and end indices of points within the Y range.
      const startIndex = utils.findInsertionIndex(column, { yCoord: y1 }, 'yCoord');
      const endIndex = utils.findInsertionIndex(column, { yCoord: y2 }, 'yCoord');
      return endIndex - startIndex;
    }
    // If it's a horizontal line segment (same Y coordinate).
    if (y1 === y2) {
      const row = this.indexedCollections.yCoord[y1];
      if (!row) return 0; // No points in this row.

      // Use binary search to find the start and end indices of points within the X range.
      const startIndex = utils.findInsertionIndex(row, { xCoord: x1 }, 'xCoord');
      const endIndex = utils.findInsertionIndex(row, { xCoord: x2 }, 'xCoord');
      return endIndex - startIndex;
    }
    // For general rectangular queries (x1 != x2 AND y1 != y2), this method is not implemented.
    return -1; // Indicate unsupported query type.
  }
}

// Utility class for modular arithmetic operations.
// Only multiplication and power are kept as `comb` is not used in the main logic.
class ModularArithmeticUtil {
  constructor(modulus = 1_000_000_007) { // Default modulus value.
    this.moduloValue = modulus;
  }

  // Performs modular multiplication (a * b) % M.
  multiplyModulo(factorA, factorB) {
    let result = 0;
    factorA %= this.moduloValue;
    factorB %= this.moduloValue;

    // Use binary multiplication for robustness with large numbers.
    while (factorB > 0) {
      if ((factorB & 1) !== 0) { // If factorB is odd, add factorA to result.
        result = (result + factorA);
        if (result >= this.moduloValue) { result -= this.moduloValue; } // Keep result within modulo.
      }
      factorA = (factorA << 1); // Double factorA.
      if (factorA >= this.moduloValue) { factorA -= this.moduloValue; } // Keep factorA within modulo.
      factorB >>= 1; // Halve factorB.
    }
    return result;
  }

  // Computes (base ^ exponent) % M using modular exponentiation (binary exponentiation).
  powerModulo(base, exponent) {
    let accumulator = 1;
    let currentBase = base % this.moduloValue;

    while (exponent > 0) {
      if ((exponent & 1) !== 0) { // If exponent is odd, multiply accumulator by currentBase.
        accumulator = this.multiplyModulo(accumulator, currentBase);
      }
      currentBase = this.multiplyModulo(currentBase, currentBase); // Square currentBase.
      exponent >>= 1; // Halve exponent.
    }
    return accumulator;
  }
}
// Instantiate the modular arithmetic utility with a common prime modulus.
const MOD_CALCULATOR = new ModularArithmeticUtil();

// A collection of general utility functions, similar to Lodash/Underscore.
class UtilityFunctions {
  // Finds the appropriate insertion index for a `key` in a sorted `array`
  // such that `array[index]` is the first element greater than or equal to `key`.
  // `iteratee` specifies the property to compare if array elements are objects.
  findInsertionIndex(sortedArray, searchKey, propertyName) {
    const getComparableValue = (item) => (typeof item === 'object' && item !== null) ? item[propertyName] : item;
    const valueToSearch = getComparableValue(searchKey);

    let lowIndex = 0;
    let highIndex = sortedArray.length;

    // Standard binary search for the lower bound.
    while (lowIndex < highIndex) {
      const midIndex = Math.floor((lowIndex + highIndex) / 2); // Use floor for mid-point.
      if (getComparableValue(sortedArray[midIndex]) < valueToSearch) {
        lowIndex = midIndex + 1;
      } else {
        highIndex = midIndex;
      }
    }
    return lowIndex;
  }
}
// Create a singleton instance of the utility functions.
const utils = new UtilityFunctions();

// Handles reading input data from standard input.
class InputReader {
  constructor() {
    this.currentLineIndex = 0;
    this.allInputLines = [];
    this.readAllInputData(); // Read all input upon instantiation.
  }

  // Reads all lines from standard input and stores them.
  readAllInputData() {
    // Using Node.js specific file system module to read from stdin.
    // Ensure the input is treated as UTF-8 and split into individual lines.
    try {
      this.allInputLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    } catch (error) {
      console.error("Error reading from stdin:", error.message);
      // Fallback for environments where /dev/stdin is not available or for testing.
      this.allInputLines = ["0 0", ""]; // Provide dummy data or handle gracefully.
    }
    // Remove any trailing empty lines if present.
    while (this.allInputLines.length > 0 && this.allInputLines[this.allInputLines.length - 1] === '') {
        this.allInputLines.pop();
    }
    return this.allInputLines;
  }

  // Retrieves one or more lines from the input.
  // If `lineCount` is provided, returns an array of lines.
  // Otherwise, returns a single line.
  getNextLineOrLines(lineCount) {
    if (lineCount && lineCount > 0) {
      // Return a slice of lines and advance the cursor.
      const requestedLines = this.allInputLines.slice(this.currentLineIndex, this.currentLineIndex + lineCount);
      this.currentLineIndex += lineCount;
      return requestedLines;
    }
    // Return a single line and advance the cursor.
    if (this.currentLineIndex < this.allInputLines.length) {
      return this.allInputLines[this.currentLineIndex++];
    }
    return null; // No more lines.
  }

  // Parses the next line as an integer.
  readInteger() {
    const line = this.getNextLineOrLines();
    if (line === null) return NaN; // Indicate end of input or error.
    return parseInt(line, 10);
  }

  // Parses the next line as an array of strings, split by space.
  readStringArray() {
    const line = this.getNextLineOrLines();
    if (line === null) return [];
    return line.split(' ');
  }

  // Parses the next line as an array of integers.
  readIntegerArray() {
    const stringArray = this.readStringArray();
    return stringArray.map(element => parseInt(element, 10));
  }

  // Parses multiple lines into a 2D array of strings.
  readStringMatrix(rows) {
    // Add a guard to prevent reading negative or zero rows.
    if (rows <= 0) return [];
    return this.getNextLineOrLines(rows).map(line => line.split(' '));
  }
}
// Instantiate the global input reader.
const dataReader = new InputReader();

// Manages outputting results to standard output.
class OutputWriter {
  constructor() {
    // Default options for boolean output.
    this.booleanOptions = {
      trueValue: 'Yes',
      falseValue: 'No',
    };
  }

  // Displays the given output value. Handles booleans specifically.
  displayResult(valueToOutput) {
    let formattedOutput;
    if (valueToOutput === null || valueToOutput === undefined) {
        // Do nothing for null/undefined to prevent printing "null" or "undefined".
        return;
    } else if (typeof valueToOutput === 'boolean') {
      formattedOutput = valueToOutput ? this.booleanOptions.trueValue : this.booleanOptions.falseValue;
    } else {
      formattedOutput = valueToOutput; // Use value as is for other types.
    }
    console.log(formattedOutput);
  }

  // Configures the string representations for true/false output.
  configureBooleanOutput(customTrue, customFalse) {
    this.booleanOptions.trueValue = customTrue;
    this.booleanOptions.falseValue = customFalse;
    return this; // Allow method chaining.
  }
}
// Instantiate the global output writer.
const resultOutputter = new OutputWriter();

// Execute the main problem solver and display its result.
resultOutputter.displayResult(new ProblemSolver().computeOptimalCoverage());