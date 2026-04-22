const outputLog = console.log;

// Read input data from standard input, remove any trailing empty lines.
const inputDataLines = require("fs")
  .readFileSync("/dev/stdin", "utf-8")
  .trim() // Remove leading/trailing whitespace, important for empty lines
  .split("\n")
  .filter(line => line.length > 0); // Ensure no empty lines remain after split/trim

/**
 * Parses a string into an integer.
 * @param {string} inputString The string to parse.
 * @returns {number} The integer value.
 */
function parseNumericValue(inputString) {
  return Number(inputString);
}

// Define custom methods on Array.prototype for convenience
const arrayExtensions = Array.prototype;

/**
 * Custom String method to extract space-separated integers from a string.
 * @param {string} [separator=' '] The separator character.
 * @returns {number[]} An array of parsed integers.
 */
String.prototype.extractNumericArray = function(separator = ' ') {
  // Ensure the input string is not empty before splitting
  if (!this || this.length === 0) {
    return [];
  }
  return this.split(separator).map(parseNumericValue);
};

/**
 * Creates a shallow copy of the array.
 * @returns {Array} A new array containing the same elements.
 */
arrayExtensions.duplicateElements = function() {
  return [...this];
};

/**
 * Calculates the maximum value within the array.
 * @returns {number} The largest number in the array.
 */
arrayExtensions.getLargest = function() {
  // Using Math.max directly with spread operator is generally cleaner.
  return Math.max(...this);
};

/**
 * Calculates the minimum value within the array.
 * @returns {number} The smallest number in the array.
 */
arrayExtensions.getSmallest = function() {
  // Using Math.min directly with spread operator is generally cleaner.
  return Math.min(...this);
};

/**
 * Performs a circular shift (rotation) on the array elements.
 * Elements from the start are moved to the end.
 * @param {number} shiftAmount The number of positions to rotate.
 * @returns {Array} A new array with elements rotated.
 */
arrayExtensions.performCyclicShift = function(shiftAmount) {
  // Handle negative or large shift amounts by normalizing
  const effectiveShift = shiftAmount % this.length;
  const normalizedShift = effectiveShift < 0 ? this.length + effectiveShift : effectiveShift;

  const firstPart = this.slice(normalizedShift);
  const secondPart = this.slice(0, normalizedShift);
  return firstPart.concat(secondPart);
};

/**
 * Generates all possible permutations of the array elements.
 * This is a recursive implementation.
 * @returns {Array<Array>} An array of arrays, each representing a permutation.
 */
arrayExtensions.generateAllPermutations = function() {
  const currentArray = this;
  const arrayLength = currentArray.length;

  if (arrayLength === 0) {
    return [
      []
    ]; // Return an array containing an empty array for an empty input
  }
  if (arrayLength === 1) {
    return [
      [currentArray[0]]
    ];
  }

  let resultPermutations = [];
  for (let idx = 0; idx < arrayLength; ++idx) {
    const elementToPermute = currentArray[idx];
    const remainingElements = currentArray.slice(0, idx).concat(currentArray.slice(idx + 1));

    // Recursively get permutations of the remaining elements
    const subPermutations = remainingElements.generateAllPermutations();

    // Prepend the current element to each sub-permutation
    for (const subP of subPermutations) {
      resultPermutations.push([elementToPermute, ...subP]);
    }
  }
  return resultPermutations;
};

/**
 * Flattens a nested array by one level.
 * Equivalent to Array.prototype.flat() without a depth argument.
 * @returns {Array} A new array with nested arrays unrolled.
 */
arrayExtensions.unfoldNestedArray = function() {
  return this.reduce((accumulator, currentValue) => {
    // If the current value is an array, concatenate its elements, otherwise add the value itself.
    return accumulator.concat(Array.isArray(currentValue) ? currentValue : [currentValue]);
  }, []);
};

/**
 * Returns a new array containing only the unique elements of the original array.
 * Uses a Set for efficient uniqueness checking.
 * @returns {Array} An array with duplicate elements removed.
 */
arrayExtensions.obtainUniqueElements = function() {
  return Array.from(new Set(this));
};

/**
 * Generates an arithmetic sequence of numbers.
 * @param {number} count The number of elements to generate.
 * @param {number} [startValue=0] The starting value of the sequence.
 * @param {number} [stepValue=1] The increment/decrement step between elements.
 * @returns {number[]} An array containing the generated sequence.
 */
function createNumericalSequence(count, startValue = 0, stepValue = 1) {
  if (count <= 0) {
    return [];
  }
  // Using Array.from with a mapping function for a more functional approach
  return Array.from({
    length: count
  }, (_, index) => startValue + index * stepValue);
}

/**
 * Main execution block for the program.
 * Encapsulates the core logic.
 */
(function executeSolution() {
  // Parse input values
  const gridDimensionValue = parseNumericValue(inputDataLines[0]);
  const startPointString = inputDataLines[1].extractNumericArray();
  const startGridRow = startPointString[0] - 1; // Adjust to 0-based index
  const startGridCol = startPointString[1] - 1; // Adjust to 0-based index

  const endPointString = inputDataLines[2].extractNumericArray();
  const endGridRow = endPointString[0] - 1; // Adjust to 0-based index
  const endGridCol = endPointString[1] - 1; // Adjust to 0-based index

  let minimumCalculatedDistance = gridDimensionValue * gridDimensionValue * 2; // Initialize with a sufficiently large value

  /**
   * Calculates the Manhattan distance between two points on a grid,
   * where coordinates are transformed based on a given divisor.
   * This effectively simulates a grid of size `divisor` x `divisor`.
   * @param {number} point1 The first point's linear index.
   * @param {number} point2 The second point's linear index.
   * @param {number} divisor The grid width for coordinate transformation.
   * @returns {number} The Manhattan distance.
   */
  function calculateManhattanDistanceForGrid(point1, point2, divisor) {
    // A divisor of 0 would lead to division by zero, which is not expected given the loop starts from 1.
    if (divisor <= 0) {
      // Return a very large number or throw an error if this state is unexpected.
      // For this problem, divisor will always be > 0.
      return Number.MAX_SAFE_INTEGER;
    }

    // Calculate row and column for point1 based on the current divisor (grid width)
    const p1Row = Math.floor(point1 / divisor);
    const p1Col = point1 % divisor;

    // Calculate row and column for point2 based on the current divisor (grid width)
    const p2Row = Math.floor(point2 / divisor);
    const p2Col = point2 % divisor;

    // Compute absolute differences for rows and columns
    const rowDifference = Math.abs(p1Row - p2Row);
    const colDifference = Math.abs(p1Col - p2Col);

    // Manhattan distance is the sum of absolute differences
    return rowDifference + colDifference;
  }

  // Iterate through possible grid widths (partition factors) from 1 up to N-1
  for (let currentPartitionFactor = 1; currentPartitionFactor < gridDimensionValue; ++currentPartitionFactor) {
    // Calculate the distance for the first pair of points (start to end)
    const distanceAtoB = calculateManhattanDistanceForGrid(startGridRow, startGridCol, currentPartitionFactor);
    // Calculate the distance for the second pair of points (end to target)
    const distanceCtoD = calculateManhattanDistanceForGrid(endGridRow, endGridCol, currentPartitionFactor);

    // Sum the distances for the current partition factor
    const currentCombinedDistance = distanceAtoB + distanceCtoD;

    // Update the minimum total distance found so far
    if (currentCombinedDistance < minimumCalculatedDistance) {
      minimumCalculatedDistance = currentCombinedDistance;
    }
  }

  // Output the final minimum distance found
  outputLog(minimumCalculatedDistance);
})();