const outputLog = console.info;

const INPUT_SOURCE_PATH = "/dev/stdin";

// Helper function to securely obtain input lines from a specified file path.
// This function includes error handling for file system operations.
const retrieveInputLines = (filePath) => {
  try {
    const fileSystemModule = require("fs");
    // Read the entire file content as a UTF-8 string.
    const rawContent = fileSystemModule.readFileSync(filePath, "utf-8");
    // Split the content by newline characters and filter out any empty strings,
    // which effectively handles trailing newlines or accidental blank lines.
    return rawContent.split("\n").filter(Boolean);
  } catch (ioError) {
    // In case of any error during file reading (e.g., file not found, permissions),
    // log the error and terminate the program gracefully.
    console.error(`ERROR: Failed to read input from ${filePath}. Details:`, ioError.message);
    process.exit(1); // Exit with an error code.
  }
};

// Global array to hold all processed input lines.
const processedInputRecords = retrieveInputLines(INPUT_SOURCE_PATH);

// Augment the String prototype with a utility method to convert a string
// of space-separated numbers into an array of integers.
String.prototype.parseNumericalTokens = function (separator = " ") {
  // Split the string by the specified separator, then map each resulting token
  // to an integer after trimming any leading/trailing whitespace.
  return this.split(separator).map(token => {
    const parsedValue = Number.parseInt(token.trim(), 10);
    // Basic validation: if parsing results in NaN, it indicates invalid input.
    if (Number.isNaN(parsedValue)) {
      throw new Error(`Failed to parse numerical token: '${token}' is not a valid integer.`);
    }
    return parsedValue;
  });
};

// Create a local alias for Array.prototype to simplify adding custom methods.
const customArrayUtilities = Array.prototype;

// Adds a method to create a shallow duplicate of an array.
customArrayUtilities.createDuplicate = function () {
  return [...this]; // Utilizes the spread syntax for concise array copying.
};

// Adds a method to determine the largest numeric value within an array.
customArrayUtilities.obtainMaximumValue = function () {
  if (this.length === 0) {
    // Return undefined for an empty array to avoid Math.max applying to an empty set.
    return undefined;
  }
  return Math.max(...this);
};

// Adds a method to determine the smallest numeric value within an array.
customArrayUtilities.obtainMinimumValue = function () {
  if (this.length === 0) {
    // Return undefined for an empty array to avoid Math.min applying to an empty set.
    return undefined;
  }
  return Math.min(...this);
};

// Adds a method to cyclically shift (rotate) the elements of an array.
customArrayUtilities.circularShift = function (shiftOffset) {
  if (typeof shiftOffset !== 'number' || !Number.isInteger(shiftOffset)) {
    throw new TypeError("Shift offset must be an integer.");
  }
  if (this.length === 0) {
    return []; // An empty array remains empty after shifting.
  }

  // Normalize the shift offset to be within the array's bounds.
  const effectiveShift = (shiftOffset % this.length + this.length) % this.length;
  // Use slice and concat to perform the rotation.
  return this.slice(effectiveShift).concat(this.slice(0, effectiveShift));
};

// Adds a method to generate all possible permutations of the array's elements.
// This is a recursive implementation of the permutation algorithm.
customArrayUtilities.generateAllPossiblePermutations = function () {
  const sourceArray = this;
  const currentLength = sourceArray.length;

  if (currentLength === 0) {
    return [
      []
    ]; // An empty array has one permutation (the empty array itself).
  }
  if (currentLength === 1) {
    return [
      [sourceArray[0]]
    ]; // An array with one element has one permutation.
  }

  const collectedPermutations = []; // Stores all generated permutations.

  // Iterate through each element to serve as the 'root' of a new permutation branch.
  for (let index = 0; index < currentLength; ++index) {
    const rootElement = sourceArray[index];
    // Form the 'remainder' array by excluding the current root element.
    const remainderArray = sourceArray.slice(0, index).concat(sourceArray.slice(index + 1));

    // Recursively obtain all permutations of the remainder array.
    const subPerms = remainderArray.generateAllPossiblePermutations();

    // Combine the root element with each sub-permutation.
    for (const subPermutation of subPerms) {
      collectedPermutations.push([rootElement, ...subPermutation]);
    }
  }
  return collectedPermutations;
};

// Adds a method to flatten an array of arrays by one level.
customArrayUtilities.flattenByOneLevel = function () {
  // Using the reduce method with concat for flattening.
  return this.reduce((accumulator, currentElement) => accumulator.concat(currentElement), []);
};

// Adds a method to create a new array containing only the unique elements.
customArrayUtilities.extractUniqueElements = function () {
  // Utilizes a Set for efficient identification and removal of duplicates.
  return Array.from(new Set(this));
};

// Function to produce a sequence of numbers, similar to Python's range or Haskell's iota.
function constructNumericSequence(count, initialValue = 0, stepIncrement = 1) {
  const sequenceElements = [];
  let currentVal = initialValue;
  for (let iter = 0; iter < count; ++iter) {
    sequenceElements.push(currentVal);
    currentVal += stepIncrement;
  }
  return sequenceElements;
}


// The primary execution logic of the program, encapsulated in an IIFE
// to prevent global scope pollution and manage variable lifecycles.
(function performMainCalculation() {
  // Retrieve the grid dimension from the first line of input.
  const gridDimensionValue = Number.parseInt(processedInputRecords[0], 10);
  // Robust input validation for the grid dimension.
  if (Number.isNaN(gridDimensionValue) || gridDimensionValue <= 0) {
    console.error("Input Error: Grid dimension must be a positive integer.");
    process.exit(1);
  }

  // Parse the starting coordinates (x1, y1) from the second line.
  const startPointCoordinates = processedInputRecords[1].parseNumericalTokens();
  if (startPointCoordinates.length !== 2 || startPointCoordinates.some(Number.isNaN)) {
    console.error("Input Error: Starting coordinates must be two valid numbers.");
    process.exit(1);
  }
  const startXCoord = startPointCoordinates[0];
  const startYCoord = startPointCoordinates[1];

  // Parse the destination coordinates (x2, y2) from the third line.
  const destinationPointCoordinates = processedInputRecords[2].parseNumericalTokens();
  if (destinationPointCoordinates.length !== 2 || destinationPointCoordinates.some(Number.isNaN)) {
    console.error("Input Error: Destination coordinates must be two valid numbers.");
    process.exit(1);
  }
  const destinationXCoord = destinationPointCoordinates[0];
  const destinationYCoord = destinationPointCoordinates[1];

  // Initialize the variable to track the overall minimum distance found.
  // Using Number.POSITIVE_INFINITY ensures any valid distance will be smaller.
  let minimalTotalDistanceEncountered = Number.POSITIVE_INFINITY;

  /**
   * Computes a specific type of Manhattan-like distance between two points (p1, p2)
   * on a 'transformed' grid based on a given divisor 'gridDivisor'.
   * The distance is calculated as |(p1 % gridDivisor) - (p2 % gridDivisor)| + |floor(p1 / gridDivisor) - floor(p2 / gridDivisor)|.
   * @param {number} coordinateA The first coordinate component.
   * @param {number} coordinateB The second coordinate component.
   * @param {number} gridDivisor The transformation factor for the grid.
   * @returns {number} The calculated 'transformed' grid distance.
   */
  const calculateTransformedGridDistance = (coordinateA, coordinateB, gridDivisor) => {
    // Critical validation: the gridDivisor must be a positive integer to avoid division by zero
    // or nonsensical modulo operations.
    if (gridDivisor <= 0 || !Number.isInteger(gridDivisor)) {
      throw new Error("Invalid Argument: The gridDivisor must be a positive integer.");
    }

    // Calculate the 'remainder' components for both coordinates.
    const remainderA = coordinateA % gridDivisor;
    const remainderB = coordinateB % gridDivisor;

    // Calculate the 'floor division' components for both coordinates.
    const floorDivA = Math.floor(coordinateA / gridDivisor);
    const floorDivB = Math.floor(coordinateB / gridDivisor);

    // Sum the absolute differences of both component types to get the total distance.
    const distanceComponentRemainder = Math.abs(remainderA - remainderB);
    const distanceComponentFloor = Math.abs(floorDivA - floorDivB);

    return distanceComponentRemainder + distanceComponentFloor;
  };

  // Iterate through all possible integer divisors from 1 up to (but not including)
  // the main grid dimension.
  let currentGridDivisor = 1;
  while (currentGridDivisor < gridDimensionValue) {
    // Calculate the transformed distance for the starting point's coordinates.
    const startPointTransformedDistance = calculateTransformedGridDistance(
      startXCoord, startYCoord, currentGridDivisor
    );

    // Calculate the transformed distance for the destination point's coordinates.
    const destinationPointTransformedDistance = calculateTransformedGridDistance(
      destinationXCoord, destinationYCoord, currentGridDivisor
    );

    // The total distance for the current divisor is the sum of these two transformed distances.
    const totalDistanceForCurrentDivisor = startPointTransformedDistance + destinationPointTransformedDistance;

    // Update the overall minimum distance if the newly calculated total is smaller.
    minimalTotalDistanceEncountered = Math.min(minimalTotalDistanceEncountered, totalDistanceForCurrentDivisor);

    // Move to the next divisor.
    currentGridDivisor++;
  }

  // Output the final computed minimum total distance to the console.
  outputLog(minimalTotalDistanceEncountered);

})();

// End of program execution.