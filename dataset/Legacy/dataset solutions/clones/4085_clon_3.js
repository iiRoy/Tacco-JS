'use strict'
// This script provides a solution for a specific problem involving coordinate geometry and counting.
class SolverEntry {
  // Main execution point for the problem solver.
  processProblem() {
    // Fetch input parameters: two integers, N and K.
    const inputTuple = dataFetcher.retrieveIntArray(); // Renamed nextIntArr to retrieveIntArray
    const pointCount = inputTuple[0]; // Renamed n to pointCount
    const gridDivisor = inputTuple[1]; // Renamed k to gridDivisor

    // Validate input values to prevent issues with array indexing or loop bounds.
    if (pointCount <= 0 || gridDivisor <= 0) {
      console.warn("Invalid input: Point count or grid divisor is non-positive.");
      return 0; // No points or invalid grid, so max count is 0.
    }

    // Calculate a derived grid dimension.
    const doubleGridDivisor = gridDivisor * 2; // Renamed k2 to doubleGridDivisor, rewritten from 2*k

    // Read N lines of string data and transform them into point objects.
    const rawPoints = dataFetcher.fetchStringMatrix(pointCount); // Renamed nextStrRange to fetchStringMatrix
    const processedPoints = rawPoints.map((currentEntry) => {
      // Helper function for safe integer parsing
      const parseCoordinate = (coordString) => parseInt(coordString, 10);
      let xCoord = parseCoordinate(currentEntry[0]);
      let yCoord = parseCoordinate(currentEntry[1]);

      // Adjust x-coordinate based on a character flag.
      if (currentEntry[2] === 'B') {
        xCoord += gridDivisor;
      }

      // Apply modulo operations to normalize coordinates within the grid.
      xCoord = xCoord % doubleGridDivisor;
      yCoord = yCoord % doubleGridDivisor;

      return {
        x_val: xCoord, // Renamed x to x_val
        y_val: yCoord, // Renamed y to y_val
      };
    });

    // Construct a compressed grid data structure from the processed points.
    const compressedLayout = CoordinateGrid.buildFrom(processedPoints); // Renamed CGrid to CoordinateGrid, from to buildFrom

    // Define a coloring function based on coordinates and grid divisor.
    const determineColor = (x_pos, y_pos) => {
      // White (0) or Black (1) based on quadrant parity.
      const xQuadrant = (x_pos < gridDivisor) ? 0 : 1;
      const yQuadrant = (y_pos < gridDivisor) ? 0 : 1;
      return xQuadrant ^ yQuadrant; // Using XOR for color determination
    };

    // Initialize the current count of points in the "white" region (color 0).
    let currentWhitePointCount = processedPoints.filter((pointObj) => {
      return determineColor(pointObj.x_val, pointObj.y_val) === 0;
    }).length;

    // The maximum count found so far is initially the current count.
    let maximumAchievedCount = currentWhitePointCount;

    // Iterate through potential shifts in the grid.
    // The outer loop iterates over y-shifts (vertical).
    for (let deltaY = 0; deltaY < gridDivisor; ++deltaY) {
      // The inner loop iterates over x-shifts (horizontal).
      for (let deltaX = 0; deltaX < doubleGridDivisor; ++deltaX) {
        // Calculate an adjusted x-shift for wrapping around the grid.
        let effectiveDeltaX;
        const potentialWrappedX = deltaX + gridDivisor;
        if (potentialWrappedX >= doubleGridDivisor) {
          effectiveDeltaX = deltaX - gridDivisor;
        } else {
          effectiveDeltaX = potentialWrappedX;
        }

        // Optimization: Skip empty columns efficiently for x-shifts within the first half.
        // This helps to jump over regions with no points, improving performance.
        while (deltaX < gridDivisor &&
               compressedLayout.getDimensionSize('x_val', deltaX) === 0 &&
               compressedLayout.getDimensionSize('x_val', deltaX + gridDivisor) === 0) {
          deltaX++;
        }
        // Guard against deltaX exceeding bounds due to while loop increment.
        if (deltaX >= doubleGridDivisor) {
          break; // Exit inner loop if we skipped past the end
        }

        // Update the maximum count if the current count is higher.
        maximumAchievedCount = Math.max(maximumAchievedCount, currentWhitePointCount);

        // Calculate point counts for the current window.
        // `whiteLeft`: number of white points in the column at `deltaX` within `deltaY` to `deltaY+gridDivisor`
        const whiteLeft = compressedLayout.queryRangeCount(deltaX, deltaY, deltaX, deltaY + gridDivisor);
        // `blackLeft`: number of black points in the column at `deltaX`
        const blackLeft = compressedLayout.getDimensionSize('x_val', deltaX) - whiteLeft;
        // `whiteRight`: number of white points in the column at `effectiveDeltaX`
        const whiteRight = compressedLayout.queryRangeCount(effectiveDeltaX, deltaY, effectiveDeltaX, deltaY + gridDivisor);
        // `blackRight`: number of black points in the column at `effectiveDeltaX`
        const blackRight = compressedLayout.getDimensionSize('x_val', effectiveDeltaX) - whiteRight;

        // Adjust the current white point count based on points entering and leaving the window.
        // This formula effectively calculates the change in white points when sliding the window horizontally.
        const changeFromLeft = blackLeft - whiteLeft; // Points in left column that flip color or leave
        const changeFromRight = whiteRight - blackRight; // Points in right column that flip color or enter
        currentWhitePointCount += (changeFromLeft + changeFromRight);
      }

      // Optimization: Skip empty rows efficiently for y-shifts.
      // This helps to jump over vertical regions without points.
      while (deltaY < gridDivisor &&
             compressedLayout.getDimensionSize('y_val', deltaY) === 0 &&
             compressedLayout.getDimensionSize('y_val', deltaY + gridDivisor) === 0) {
        deltaY++;
      }
      // If deltaY reaches gridDivisor after the loop, we are done with vertical shifts.
      if (deltaY === gridDivisor) {
        break;
      }

      // After completing a full row scan, adjust count for vertical shift.
      // Similar logic to horizontal shift, but applied to rows.
      const rowWhiteLower = compressedLayout.queryRangeCount(0, deltaY, gridDivisor, deltaY);
      const rowBlackLower = compressedLayout.getDimensionSize('y_val', deltaY) - rowWhiteLower;
      const rowWhiteUpper = compressedLayout.queryRangeCount(0, deltaY + gridDivisor, gridDivisor, deltaY + gridDivisor);
      const rowBlackUpper = compressedLayout.getDimensionSize('y_val', deltaY + gridDivisor) - rowWhiteUpper;

      const changeFromLowerRow = rowBlackLower - rowWhiteLower;
      const changeFromUpperRow = rowWhiteUpper - rowBlackUpper;
      currentWhitePointCount += (changeFromLowerRow + changeFromUpperRow);
    }
    // Return the highest count of white points observed.
    return maximumAchievedCount;
  }
}

// A specialized data structure for efficiently storing and querying 2D coordinates.
// It organizes points by their x and y values into sorted lists.
class CoordinateGrid {
  // Default coordinate parameters to track.
  static get DefaultDimensions() {
    return ['x_val', 'y_val'];
  }
  // Default sorting keys for each dimension's list.
  static get DefaultDimensionSortOrders() {
    return {
      'x_val': (point_a, point_b) => point_a.y_val - point_b.y_val, // Sort by y for x-dimension lists
      'y_val': (point_a, point_b) => point_a.x_val - point_b.x_val // Sort by x for y-dimension lists
    };
  }

  // Factory method to create and initialize a CoordinateGrid instance.
  static buildFrom(pointList, additionalDimensions = [], customSortOrders = {}) {
    // Validate input list.
    if (!Array.isArray(pointList)) {
      console.warn("Input to CoordinateGrid.buildFrom is not an array, returning empty grid.");
      return new CoordinateGrid(); // Return an empty grid
    }
    const newGrid = new CoordinateGrid();
    newGrid.initialize(pointList, additionalDimensions, customSortOrders);
    return newGrid;
  }

  // Retrieves the number of points associated with a specific dimension value.
  getDimensionSize(dimensionKey, dimensionValue) {
    const targetList = this.dimensionCollections[dimensionKey][dimensionValue];
    return targetList ? targetList.length : 0;
  }

  // Initializes the grid with a list of points and configuration.
  initialize(pointList, extraDimensions, customSorts) {
    this.activeDimensions = CoordinateGrid.DefaultDimensions.concat(extraDimensions || []);
    this.dimensionSortComparators = { ...CoordinateGrid.DefaultDimensionSortOrders, ...customSorts }; // Use spread for shallow copy
    this.dimensionCollections = {}; // Stores points categorized by dimension values

    // Prepare an empty object for each dimension.
    for (const dim of this.activeDimensions) {
      this.dimensionCollections[dim] = {};
    }

    // Populate dimension collections with points.
    for (const currentPoint of pointList) {
      for (const dim of this.activeDimensions) {
        const dimValue = currentPoint[dim];
        if (this.dimensionCollections[dim][dimValue] === undefined) {
          this.dimensionCollections[dim][dimValue] = [];
        }
        this.dimensionCollections[dim][dimValue].push(currentPoint);
      }
    }

    // Sort points within each dimension's lists.
    for (const dim of this.activeDimensions) {
      const elementsInDim = this.dimensionCollections[dim];
      for (const key in elementsInDim) {
        if (Object.prototype.hasOwnProperty.call(elementsInDim, key)) { // Guard for own properties
          elementsInDim[key].sort(this.dimensionSortComparators[dim]);
        }
      }
    }
    return this;
  }

  // Retrieves a single point at exact coordinates.
  fetchPoint(x_coord, y_coord) {
    const xListForCoord = this.dimensionCollections.x_val[x_coord];
    if (!xListForCoord) return null;

    // Use the utility for binary search to find the potential index.
    const searchIndex = toolkit.performBinarySearch(xListForCoord, y_coord, 'y_val');

    // Check if the point exists at the found index and matches the y_coord.
    if (searchIndex < xListForCoord.length && xListForCoord[searchIndex].y_val === y_coord) {
      return xListForCoord[searchIndex];
    }
    return null;
  }

  // Counts points within a specified rectangular range (exclusive end bounds).
  // Optimized for horizontal or vertical lines (x_start=x_end or y_start=y_end).
  queryRangeCount(x_start, y_start, x_end, y_end) {
    // Add validation for range order.
    if (x_start > x_end || y_start > y_end) {
        return 0; // Invalid range, no points.
    }

    if (x_start === x_end) { // Vertical line query
      const targetXList = this.dimensionCollections.x_val[x_start];
      if (!targetXList) return 0; // No points at this x-coordinate

      const lowerBoundIndex = toolkit.performBinarySearch(targetXList, y_start, 'y_val');
      const upperBoundIndex = toolkit.performBinarySearch(targetXList, y_end, 'y_val'); // y_end is exclusive for count
      return upperBoundIndex - lowerBoundIndex;
    }

    if (y_start === y_end) { // Horizontal line query
      const targetYList = this.dimensionCollections.y_val[y_start];
      if (!targetYList) return 0; // No points at this y-coordinate

      const lowerBoundIndex = toolkit.performBinarySearch(targetYList, x_start, 'x_val');
      const upperBoundIndex = toolkit.performBinarySearch(targetYList, x_end, 'x_val'); // x_end is exclusive for count
      return upperBoundIndex - lowerBoundIndex;
    }
    // For general rectangular queries, this method is not implemented efficiently and returns 0.
    return 0;
  }

  // Retrieves points within a specified rectangular range (exclusive end bounds).
  // Optimized for horizontal or vertical lines (x_start=x_end or y_start=y_end).
  fetchPointsInRegion(x_start, y_start, x_end, y_end) {
    const collectedPoints = [];

    // Add validation for range order.
    if (x_start > x_end || y_start > y_end) {
        return collectedPoints; // Return empty array for invalid range.
    }

    if (x_start === x_end) { // Vertical line query
      const targetXList = this.dimensionCollections.x_val[x_start];
      if (!targetXList) return collectedPoints;

      const lowerIdx = toolkit.performBinarySearch(targetXList, y_start, 'y_val');
      const upperIdx = toolkit.performBinarySearch(targetXList, y_end, 'y_val');

      for (let idx = lowerIdx; idx < upperIdx; ++idx) {
        collectedPoints.push(targetXList[idx]);
      }
      return collectedPoints;
    }

    if (y_start === y_end) { // Horizontal line query
      const targetYList = this.dimensionCollections.y_val[y_start];
      if (!targetYList) return collectedPoints;

      const lowerIdx = toolkit.performBinarySearch(targetYList, x_start, 'x_val');
      const upperIdx = toolkit.performBinarySearch(targetYList, x_end, 'x_val');

      for (let idx = lowerIdx; idx < upperIdx; ++idx) {
        collectedPoints.push(targetYList[idx]);
      }
      return collectedPoints;
    }
    // For general rectangular queries, this method is not implemented.
    return collectedPoints; // Return empty array.
  }
}

// Utility class for performing arithmetic operations in modular space.
class ModularCalculator {
  constructor(moduloValue) {
    // Default to a common large prime if no modulo is provided.
    this.currentModulo = moduloValue == null ? 1000000007 : moduloValue;
  }

  // Performs modular multiplication (a * b) % mod.
  multiply(factorA, factorB) {
    let result = 0;
    let termA = factorA % this.currentModulo;
    let termB = factorB % this.currentModulo;

    // Standard iterative multiplication with modular reduction at each step.
    while (termB > 0) {
      if (termB % 2 === 1) { // If termB is odd
        result = (result + termA) % this.currentModulo;
      }
      termA = (termA * 2) % this.currentModulo; // Double termA
      termB = Math.floor(termB / 2); // Halve termB
    }
    return result;
  }

  // Computes modular exponentiation (base^power) % mod.
  power(base, exponent) {
    let outcome = 1;
    let currentBase = base % this.currentModulo;

    // Exponentiation by squaring.
    while (exponent > 0) {
      if (exponent % 2 === 1) {
        outcome = this.multiply(outcome, currentBase);
      }
      currentBase = this.multiply(currentBase, currentBase);
      exponent = Math.floor(exponent / 2);
    }
    return outcome;
  }

  // Performs modular division (numerator / denominator) % mod.
  // This uses Fermat's Little Theorem for modular inverse: a/b = a * b^(mod-2) % mod.
  divide(numerator, denominator) {
    // Check for division by zero (modulo).
    if (denominator === 0) {
        throw new Error("Modular division by zero is undefined.");
    }
    const inverseDenominator = this.power(denominator, this.currentModulo - 2);
    return this.multiply(numerator, inverseDenominator);
  }

  // Calculates modular combinations C(n, k) % mod.
  // This method depends on pre-calculated factorial and inverse factorial tables
  // which are not provided in this context. It's a placeholder.
  combinations(numN, numK) {
    if (numK < 0 || numK > numN) return 0;
    console.warn("Combinations method requires precomputed factorial tables, returning 0 as a placeholder.");
    return 0; // Placeholder value.
  }
}
const modularArithmetic = new ModularCalculator(); // Renamed MOD to modularArithmetic

// A collection of general-purpose utility functions for array manipulation and common tasks.
class UtilityToolkit {
  // Calculates the sum of all elements in an array.
  calculateSum(numericArray) {
    let total = 0;
    for (const num of numericArray) {
      total += num;
    }
    return total;
  }

  // Calculates the sum of array elements with modular reduction.
  modularSum(numericArray, customModulo) {
    const activeModulo = customModulo == null ? modularArithmetic.currentModulo : customModulo;
    let runningTotal = 0;
    for (const val of numericArray) {
      runningTotal = (runningTotal + val) % activeModulo;
    }
    return runningTotal;
  }

  // Finds the minimum element in an array based on an optional comparison function.
  findMinimum(dataArray, comparatorFunc = (a, b) => a - b) {
    if (!dataArray || dataArray.length === 0) return undefined;
    let currentMin = dataArray[0];
    for (let i = 1; i < dataArray.length; ++i) {
      if (comparatorFunc(dataArray[i], currentMin) < 0) {
        currentMin = dataArray[i];
      }
    }
    return currentMin;
  }

  // Finds the maximum element in an array based on an optional comparison function.
  findMaximum(dataArray, comparatorFunc = (a, b) => a - b) {
    if (!dataArray || dataArray.length === 0) return undefined;
    let currentMax = dataArray[0];
    for (let i = 1; i < dataArray.length; ++i) {
      if (comparatorFunc(dataArray[i], currentMax) > 0) {
        currentMax = dataArray[i];
      }
    }
    return currentMax;
  }

  // Sorts an array in place using an optional comparison function.
  sortArray(dataArray, comparisonFn = (a, b) => a - b) {
    return dataArray.sort(comparisonFn);
  }

  // Returns a new array with unique elements (after sorting and filtering).
  getUniqueElements(inputArray) {
    if (!inputArray || inputArray.length === 0) return [];
    const sortedArray = [...inputArray].sort(); // Create a copy and sort
    const uniqueValues = [];
    if (sortedArray.length > 0) {
      uniqueValues.push(sortedArray[0]);
      for (let i = 1; i < sortedArray.length; i++) {
        if (sortedArray[i] !== sortedArray[i - 1]) {
          uniqueValues.push(sortedArray[i]);
        }
      }
    }
    return uniqueValues;
  }

  // Generates a sequence of numbers within a specified range.
  generateRange(startValue, stopValue, stepValue) {
    let actualStart = 0, actualStop = 0, actualStep = 1;

    if (stopValue == null) { // If only one argument, assume it's stop, start at 0.
      actualStop = startValue || 0;
      actualStart = 0;
    } else {
      actualStart = startValue;
      actualStop = stopValue;
    }

    if (stepValue == null) { // Determine step direction if not provided.
      actualStep = (actualStop < actualStart) ? -1 : 1;
    } else {
      actualStep = stepValue;
    }

    const outputRange = [];
    if (actualStep === 0) {
      console.warn("Step value cannot be zero for range generation.");
      return outputRange;
    }

    if (actualStep > 0) {
      for (let current = actualStart; current < actualStop; current += actualStep) {
        outputRange.push(current);
      }
    } else { // Negative step
      for (let current = actualStart; current > actualStop; current += actualStep) {
        outputRange.push(current);
      }
    }
    return outputRange;
  }

  // Retrieves the first N elements of an array.
  retrieveFirst(collection, numElements) {
    if (!collection || collection.length < 1) {
      return numElements == null ? undefined : [];
    }
    if (numElements == null) {
      return collection[0];
    }
    return collection.slice(0, Math.max(0, numElements));
  }

  // Retrieves the last N elements of an array.
  retrieveLast(collection, numElements) {
    if (!collection || collection.length < 1) {
      return numElements == null ? undefined : [];
    }
    if (numElements == null) {
      return collection[collection.length - 1];
    }
    return collection.slice(Math.max(0, collection.length - numElements));
  }

  // Computes a cumulative sum array.
  calculateCumulativeSum(originalArray) {
    if (!originalArray || originalArray.length === 0) return [];
    const cumulativeSums = [originalArray[0]];
    for (let i = 1; i < originalArray.length; ++i) {
      cumulativeSums.push(originalArray[i] + cumulativeSums[i - 1]);
    }
    return cumulativeSums;
  }

  // Computes an array of differences between adjacent elements.
  calculateDifferences(originalArray) {
    const diffs = [];
    for (let i = 1; i < originalArray.length; ++i) {
      diffs.push(originalArray[i] - originalArray[i - 1]);
    }
    return diffs;
  }

  // Performs a binary search on a sorted array or array of objects.
  // Returns the index where the key would be inserted to maintain sort order.
  performBinarySearch(sortedCollection, searchKey, propertyName = null) {
    if (!sortedCollection || sortedCollection.length === 0) return 0; // Return 0 for empty array

    const getValue = (item) => (propertyName != null && typeof item === 'object' && item !== null) ? item[propertyName] : item;
    const targetValue = getValue(searchKey);

    let lowPointer = 0;
    let highPointer = sortedCollection.length;

    while (lowPointer < highPointer) {
      const midPointer = Math.floor((lowPointer + highPointer) / 2);
      if (getValue(sortedCollection[midPointer]) < targetValue) {
        lowPointer = midPointer + 1;
      } else {
        highPointer = midPointer;
      }
    }
    return lowPointer;
  }
}
const toolkit = new UtilityToolkit(); // Renamed _ to toolkit

// Handles reading input data from standard input.
class DataLoader {
  constructor() {
    this.currentLineIndex = 0;
    this.inputDataLines = [];
    this.loadAllInput(); // Renamed inputAll to loadAllInput
  }

  // Reads all available input from stdin.
  loadAllInput() {
    try {
      const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
      this.inputDataLines = rawInput.split('\n');
    } catch (error) {
      console.error("Failed to read from stdin:", error.message);
      // In a competitive programming context, this might mean exiting or providing default data.
      // For this clone, we'll just log and leave inputDataLines empty.
      this.inputDataLines = [];
    }
    return this.inputDataLines;
  }

  // Retrieves one or more lines of input.
  retrieveNextLines(count = 1) { // Renamed nextLine to retrieveNextLines, added default count
    if (count <= 0) return [];
    if (this.currentLineIndex >= this.inputDataLines.length) {
      console.warn("Attempted to read past end of input.");
      return []; // Return empty array if no more lines.
    }

    const endIndex = Math.min(this.currentLineIndex + count, this.inputDataLines.length);
    const linesToReturn = this.inputDataLines.slice(this.currentLineIndex, endIndex);
    this.currentLineIndex = endIndex;

    // If only one line was requested, return it directly, otherwise return the array.
    return linesToReturn.length === 1 && count === 1 ? linesToReturn[0] : linesToReturn;
  }

  // Parses the next line as a single integer.
  fetchNextInteger() { // Renamed nextInt to fetchNextInteger
    const lineContent = this.retrieveNextLines();
    return parseInt(lineContent, 10);
  }

  // Parses the next line into an array of strings.
  fetchStringArray() { // Renamed nextStrArr to fetchStringArray
    const lineContent = this.retrieveNextLines();
    return String(lineContent).split(' '); // Ensure lineContent is treated as string
  }

  // Parses the next line into an array of integers.
  retrieveIntArray() { // Renamed nextIntArr to retrieveIntArray
    return this.fetchStringArray().map((item) => parseInt(item, 10));
  }

  // Parses the next line into an array of floating-point numbers.
  retrieveFloatArray() { // Renamed nextFloatArr to retrieveFloatArray
    return this.fetchStringArray().map((item) => parseFloat(item));
  }

  // Parses N lines into an array of integers (each line a single integer).
  fetchIntegerLines(numLines) { // Renamed nextIntLine to fetchIntegerLines
    const lines = this.retrieveNextLines(numLines);
    return lines.map((line) => parseInt(line, 10));
  }

  // Parses N lines into an array of floats (each line a single float).
  fetchFloatLines(numLines) { // Renamed nextFloatLine to fetchFloatLines
    const lines = this.retrieveNextLines(numLines);
    return lines.map((line) => parseFloat(line));
  }

  // Parses N lines into a 2D array of strings.
  fetchStringMatrix(numLines) { // Renamed nextStrRange to fetchStringMatrix
    const lines = this.retrieveNextLines(numLines);
    return lines.map((line) => String(line).split(' '));
  }

  // Parses N lines into a 2D array of integers.
  fetchIntegerMatrix(numLines) { // Renamed nextIntRange to fetchIntegerMatrix
    const lines = this.retrieveNextLines(numLines);
    return lines.map((line) => String(line).split(' ').map((item) => parseInt(item, 10)));
  }

  // Parses N lines into a 2D array of floating-point numbers.
  fetchFloatMatrix(numLines) { // Renamed nextFloatRange to fetchFloatMatrix
    const lines = this.retrieveNextLines(numLines);
    return lines.map((line) => String(line).split(' ').map((item) => parseFloat(item)));
  }

  // New fragment: Reads a single character from the beginning of the next line.
  fetchNextChar() {
    const line = this.retrieveNextLines();
    if (typeof line === 'string' && line.length > 0) {
      return line.charAt(0);
    }
    return ''; // Return empty string if no character can be read.
  }
}
const dataFetcher = new DataLoader(); // Renamed input to dataFetcher

// Manages outputting results to the console with optional formatting.
class OutputFormatter {
  constructor() {
    // Default mappings for boolean output.
    this.booleanDisplayOptions = {
      'true': 'Yes',
      'false': 'No',
    };
    this.outputPrefix = ''; // New fragment: Prefix for output
    this.outputSuffix = ''; // New fragment: Suffix for output
  }

  // Writes the given content to the console, applying boolean formatting if applicable.
  displayOutput(content) { // Renamed write to displayOutput
    let formattedContent;
    if (content === null || content === undefined) {
      return; // Do nothing for null/undefined content.
    }

    if (typeof content === 'boolean') {
      if (content === true) {
        formattedContent = this.booleanDisplayOptions['true'];
      } else { // content === false
        formattedContent = this.booleanDisplayOptions['false'];
      }
    } else {
      formattedContent = String(content); // Ensure output is a string.
    }
    console.log(this.outputPrefix + formattedContent + this.outputSuffix);
  }

  // Configures custom strings for boolean true/false output.
  setBooleanOptions(customFalseString, customTrueString) { // Renamed bool to setBooleanOptions, changed parameter signature
    if (typeof customFalseString === 'string' && typeof customTrueString === 'string') {
      this.booleanDisplayOptions['false'] = customFalseString;
      this.booleanDisplayOptions['true'] = customTrueString;
    } else {
      console.warn("Invalid boolean option types provided. Expected strings.");
    }
    return this; // Allow chaining.
  }

  // New fragment: Set a prefix for all outputs.
  setPrefix(prefixString) {
    this.outputPrefix = String(prefixString);
    return this;
  }

  // New fragment: Set a suffix for all outputs.
  setSuffix(suffixString) {
    this.outputSuffix = String(suffixString);
    return this;
  }
}
const resultWriter = new OutputFormatter(); // Renamed out to resultWriter

// Execute the main problem-solving logic and display the result.
resultWriter.setPrefix("Final Answer: ").displayOutput(new SolverEntry().processProblem());