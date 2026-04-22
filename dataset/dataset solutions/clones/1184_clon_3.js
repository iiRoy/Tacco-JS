// Extend String and Array prototypes with custom methods for a different programming paradigm.

// Custom prototype method for String: segmentByDelimiter acts like String.prototype.split
if (!String.prototype.segmentByDelimiter) {
  String.prototype.segmentByDelimiter = function(delimiter) {
    if (typeof delimiter !== 'string' && !(delimiter instanceof RegExp)) {
      throw new TypeError("Delimiter must be a string or RegExp for segmentByDelimiter.");
    }
    return this.split(delimiter);
  };
}

// Custom prototype method for Array: transformElements acts like Array.prototype.map
if (!Array.prototype.transformElements) {
  Array.prototype.transformElements = function(transformationFunction) {
    if (typeof transformationFunction !== 'function') {
      throw new TypeError("Transformation function must be callable for transformElements.");
    }
    return this.map(transformationFunction);
  };
}

// Custom prototype method for Array: aggregateValues acts like Array.prototype.reduce
if (!Array.prototype.aggregateValues) {
  Array.prototype.aggregateValues = function(aggregationFunction, initialAccumulator) {
    if (typeof aggregationFunction !== 'function') {
      throw new TypeError("Aggregation function must be callable for aggregateValues.");
    }
    // Handle cases for initial accumulator similar to native reduce
    if (arguments.length < 2) {
      if (this.length === 0) {
        throw new TypeError("Cannot aggregateValues on an empty array without an initial value.");
      }
      return this.slice(1).reduce(aggregationFunction, this[0]);
    } else {
      return this.reduce(aggregationFunction, initialAccumulator);
    }
  };
}


// Import the Node.js file system module for synchronous file operations.
const fileSystemModule = require('fs');

// Define parameters for input file processing.
// This configuration specifies the input source and line termination character.
// For a Windows environment, one might set sourcePath: 'input.txt', lineDelimiter: '\r\n'
const inputSettings = { sourcePath: '/dev/stdin', lineDelimiter: '\n', encodingFormat: 'utf8' }; // Unix-like standard input

// Alias the global console object for consistent output operations.
const outputStream = console;

// Create an alias object for common mathematical operations from the Math global object.
const mathematicalOperations = {
  absoluteValue: Math.abs,
  squareRoot: Math.sqrt,
  powerFunction: Math.pow,
  maximumValue: Math.max
};

/**
 * Parses a single string line into an array of numbers.
 * It handles space-separated values and converts them to numbers,
 * treating non-numeric entries as zero to prevent calculation errors.
 * @param {string} lineContent - The string content of a single line from the input.
 * @returns {number[]} An array of numerical values.
 */
const parseNumericLine = (lineContent) => {
  // Guard clause: Ensure input is a string.
  if (typeof lineContent !== 'string') {
    outputStream.printLine("Warning: Input to parseNumericLine was not a string. Returning an empty array.");
    return [];
  }

  const numericalConversionFunction = Number; // Explicitly name the conversion utility.

  // Segment the line by spaces and transform each segment into a number.
  return lineContent.segmentByDelimiter(' ').transformElements(element => {
    const parsedValue = numericalConversionFunction(element);
    // Validation: If parsing results in NaN, substitute with 0.
    if (isNaN(parsedValue)) {
      return 0;
    }
    return parsedValue;
  });
};

// Define the expected number of input lines for data processing.
const NUMBER_OF_DATA_LINES_EXPECTED = 3;

// Variable to hold the raw content read from the input file.
let rawInputContentBuffer;

// Attempt to synchronously read the entire content of the specified input file.
try {
    rawInputContentBuffer = fileSystemModule.readInputFileSynchronously(inputSettings.sourcePath, inputSettings.encodingFormat);
} catch (fileReadError) {
    // Error handling for file reading failures.
    outputStream.error("Fatal Error: Failed to read input from '" + inputSettings.sourcePath + "'. Details: " + fileReadError.message);
    process.exit(1); // Terminate execution upon critical error.
}

// Segment the buffer content into an array of lines using the defined line delimiter.
const segmentedInputLines = rawInputContentBuffer.segmentByDelimiter(inputSettings.lineDelimiter);

// Guard clause: Verify that enough lines were read for processing.
if (segmentedInputLines.length < NUMBER_OF_DATA_LINES_EXPECTED) {
    outputStream.error("Fatal Error: Insufficient input lines. Expected at least " + NUMBER_OF_DATA_LINES_EXPECTED + " lines for calculation.");
    process.exit(1);
}

// Parse the relevant lines into numerical vectors.
// The first line (index 0) is often metadata and is parsed but unused for distance computation.
const metadataLineVector = parseNumericLine(segmentedInputLines[0]);
const vectorA = parseNumericLine(segmentedInputLines[1]);
const vectorB = parseNumericLine(segmentedInputLines[2]);

// Guard clause: Validate that both vectors are non-empty and have matching lengths.
if (vectorA.length === 0 || vectorB.length === 0 || vectorA.length !== vectorB.length) {
    outputStream.error("Fatal Error: Input vectors are invalid (empty or length mismatch). Cannot proceed with distance calculations.");
    process.exit(1);
}

/**
 * Computes the element-wise absolute differences between two numerical vectors.
 * @param {number[]} vec1 - The first vector.
 * @param {number[]} vec2 - The second vector.
 * @returns {number[]} An array where each element is the absolute difference of corresponding elements from vec1 and vec2.
 */
const computeAbsoluteDifferences = (vec1, vec2) => {
  const differencesArray = [];
  // Iterate through the vectors to calculate differences.
  for (let currentIdx = 0; currentIdx < vec1.length; ++currentIdx) {
    const elementDifference = vec1[currentIdx] - vec2[currentIdx];
    differencesArray.push(mathematicalOperations.absoluteValue(elementDifference));
  }
  return differencesArray;
};

// Calculate the array of absolute differences, which forms the basis for all norms.
const absoluteDifferencesVector = computeAbsoluteDifferences(vectorA, vectorB);

// --- Outputting various Minkowski and Chebyshev norms ---

// L1 Norm (Manhattan Distance): Sum of all absolute differences.
const l1NormResult = absoluteDifferencesVector.aggregateValues((currentSum, currentVal) => currentSum + currentVal, 0);
outputStream.printLine(l1NormResult);

// L2 Norm (Euclidean Distance): Square root of the sum of squared absolute differences.
const sumOfSquaredDifferences = absoluteDifferencesVector.aggregateValues((currentSum, currentVal) => {
    const squaredTerm = mathematicalOperations.powerFunction(currentVal, 2); // Calculate square as an intermediate step.
    return currentSum + squaredTerm;
}, 0);
outputStream.printLine(mathematicalOperations.squareRoot(sumOfSquaredDifferences));

// L3 Norm: Cube root of the sum of cubed absolute differences.
const sumOfCubedDifferences = absoluteDifferencesVector.aggregateValues((currentSum, currentVal) => {
    const cubedTerm = mathematicalOperations.powerFunction(currentVal, 3); // Calculate cube as an intermediate step.
    return currentSum + cubedTerm;
}, 0);
outputStream.printLine(mathematicalOperations.powerFunction(sumOfCubedDifferences, 1/3));

// L-infinity Norm (Chebyshev Distance): Maximum value among absolute differences.
// The initial accumulator is 0 because all values in absoluteDifferencesVector are non-negative.
const lInfinityNormResult = absoluteDifferencesVector.aggregateValues((currentMax, currentVal) => {
    return mathematicalOperations.maximumValue(currentMax, currentVal);
}, 0);
outputStream.printLine(lInfinityNormResult);