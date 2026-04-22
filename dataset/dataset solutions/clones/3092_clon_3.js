"use strict";

/**
 * @class InputDataStreamParser
 * @description Utility class for parsing input data line by line and token by token.
 *              It manages line and token indices and converts tokens using a specified function.
 * @param {string} inputStringContent - The raw input string, typically from a file or stdin.
 * @param {Function} tokenParserFn - The function to use for converting parsed tokens (e.g., Number, parseInt).
 */
function InputDataStreamParser(inputStringContent, tokenParserFn) {
  // Store the input content, split into individual lines
  this.sourceLines = inputStringContent.split("\n");
  // Current index of the token within the active line
  this.currentTokenOffset = 0;
  // Current index of the line being processed in the input stream
  this.currentLineOffset = 0;
  // Function to use for converting parsed tokens (e.g., Number, parseInt)
  this.valueConverter = tokenParserFn || Number; // Default to Number conversion if not provided
}

/**
 * @method fetchNextToken
 * @description Reads and returns the next single token from the input stream.
 *              It handles line advancement and token parsing.
 * @returns {number|string|undefined} The converted token value, or undefined if no more input.
 */
InputDataStreamParser.prototype.fetchNextToken = function() {
  // Check if all lines have been processed
  if (this.currentLineOffset >= this.sourceLines.length) {
    return undefined; // No more input available
  }

  let activeLine = this.sourceLines[this.currentLineOffset];

  // Skip any empty lines or lines consisting only of whitespace
  while (!activeLine || activeLine.trim() === "") {
    this.currentLineOffset++;
    this.currentTokenOffset = 0; // Reset token offset when moving to a new line
    if (this.currentLineOffset >= this.sourceLines.length) {
      return undefined; // No more input after skipping empty lines
    }
    activeLine = this.sourceLines[this.currentLineOffset];
  }

  // Split the current line into individual tokens based on space delimiter
  const lineTokens = activeLine.trim().split(" ");

  // Handle cases where a line might unexpectedly be empty after trimming
  // or if the current token offset is beyond the available tokens.
  if (this.currentTokenOffset >= lineTokens.length || lineTokens.length === 0) {
    this.currentTokenOffset = 0;
    this.currentLineOffset++;
    // Recursively call to fetch from the next line
    return this.fetchNextToken();
  }

  // Extract the token at the current position
  const tokenValue = lineTokens[this.currentTokenOffset];
  this.currentTokenOffset++; // Advance the token pointer

  // If all tokens on the current line have been consumed, prepare for the next line
  if (this.currentTokenOffset >= lineTokens.length) {
    this.currentTokenOffset = 0; // Reset token index for the next line
    this.currentLineOffset++;    // Move to the next line in the input stream
  }
  
  // Convert the token using the specified converter and return
  return this.valueConverter(tokenValue);
};

/**
 * @method parseCurrentLine
 * @description Reads the entire current line, parses all its tokens, and advances to the next line.
 * @returns {Array<number|string>} An array of converted token values from the current line.
 */
InputDataStreamParser.prototype.parseCurrentLine = function() {
  // Check for end of input
  if (this.currentLineOffset >= this.sourceLines.length) {
    return []; // Return an empty array if no more lines
  }

  let lineToProcess = this.sourceLines[this.currentLineOffset];

  // Skip empty or whitespace-only lines
  while (!lineToProcess || lineToProcess.trim() === "") {
    this.currentLineOffset++;
    if (this.currentLineOffset >= this.sourceLines.length) {
      return []; // No more input after skipping
    }
    lineToProcess = this.sourceLines[this.currentLineOffset];
  }

  // Reset token offset as we are reading a new line from the start
  this.currentTokenOffset = 0;
  this.currentLineOffset++; // Immediately advance to the next line in the stream

  // Split, trim each token, and map them using the value converter
  return lineToProcess.trim().split(" ").map(this.valueConverter);
};

/**
 * @function createMultiDimensionalArray
 * @description Recursively constructs a multi-dimensional array with specified dimensions,
 *              initialized with a given default value.
 * @param {number[]} dimensions - An array defining the size of each dimension (e.g., [3, 2] for 3 rows, 2 columns).
 * @param {*} defaultValue - The value to populate all elements of the array with.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimensionalArray(dimensions, defaultValue) {
  // Base case for recursion: if no more dimensions, return the default value itself.
  if (dimensions.length === 0) {
    return defaultValue;
  }

  // Get the size for the current outermost dimension
  const currentDimensionSize = dimensions[0];
  // Prepare the remaining dimensions for the recursive call
  const remainingDimensions = dimensions.slice(1);

  // Create an array for the current dimension, filling each slot by recursively calling
  // createMultiDimensionalArray for the next level of dimensions.
  return Array.from({ length: currentDimensionSize }, () =>
    createMultiDimensionalArray(remainingDimensions, defaultValue)
  );
}

/**
 * @function calculateProductSeries
 * @description Computes the product of integers from `startIndex + 1` up to `endIndex` (inclusive).
 *              Mathematically, this is equivalent to `endIndex! / startIndex!`.
 * @param {number} startIndex - The integer value *before* the first number in the product series.
 * @param {number} endIndex - The last integer value to include in the product series.
 * @returns {number} The cumulative product of the series.
 */
function calculateProductSeries(startIndex, endIndex) {
  let accumulatedProduct = 1; // Initialize product accumulator

  // Iterate from one greater than startIndex up to endIndex
  for (let currentMultiplier = startIndex + 1; currentMultiplier <= endIndex; currentMultiplier++) {
    accumulatedProduct *= currentMultiplier; // Multiply into the accumulator
  }
  return accumulatedProduct;
}

// Define a global constant for the modulo operation, commonly used in competitive programming.
const MODULO_CONSTANT = 1000000007;

/**
 * @function solveProblem
 * @description The main entry point for solving the problem. It reads input,
 *              performs calculations using dynamic programming, and outputs the result.
 * @param {string} rawInputData - The entire input string read from the source (e.g., stdin).
 */
function solveProblem(rawInputData) {
  // Initialize the custom input parser with the raw data
  const inputHandler = new InputDataStreamParser(rawInputData);

  // Read the initial problem parameters: N (number of elements) and X (target value)
  const numElements = inputHandler.fetchNextToken();
  const targetSumValue = inputHandler.fetchNextToken();
  
  // Read N subsequent data points into an array
  const dataPoints = [];
  for(let elementIdx = 0; elementIdx < numElements; elementIdx++) {
    dataPoints.push(inputHandler.fetchNextToken());
  }

  // Sort the data points in ascending order. This is crucial for the DP logic.
  dataPoints.sort((a, b) => a - b);

  // Precompute factorials modulo MODULO_CONSTANT.
  // factorialCache[i] will store (i! % MODULO_CONSTANT).
  // This is used for combinatorial calculations.
  const factorialCache = [1, 1]; // Base cases: 0! = 1, 1! = 1
  for(let factIdx = 2; factIdx <= numElements; factIdx++) {
    factorialCache[factIdx] = (factorialCache[factIdx - 1] * factIdx) % MODULO_CONSTANT;
  }

  // Initialize a memoization table (Dynamic Programming cache)
  // This 2D array stores results of subproblems to avoid redundant computations.
  // Dimensions are (numElements + 1) by (targetSumValue + 1).
  // It's filled with -1 to signify that a state has not yet been computed.
  const memoizationTable = createMultiDimensionalArray([numElements + 1, targetSumValue + 1], -1);

  /**
   * @function computeCombinatorialSum
   * @description A recursive function with memoization to calculate a specific combinatorial sum.
   *              It represents the core dynamic programming logic of the problem.
   * @param {number} currentK - The number of elements remaining to consider for the combination.
   * @param {number} currentX - The current value (or remaining value) for which to compute the sum.
   * @returns {number} The computed sum for the given (currentK, currentX) state, modulo MODULO_CONSTANT.
   */
  function computeCombinatorialSum(currentK, currentX) {
    // --- Extensive Guard Clauses and Base Cases ---
    // If no elements are left to consider, the sum is 0.
    if (currentK <= 0) {
        return 0;
    }
    // If the remaining value is negative, it's an invalid state, return 0.
    if (currentX < 0) {
        return 0;
    }
    // If the currentX is 0, then the result depends on factorial of k, as 0 % any_number is 0.
    // This is implicitly handled by the `currentX < dataPoints[0]` condition if `dataPoints[0]` > 0.
    // Explicitly, if `currentX === 0`, then `(0 * factorialCache[currentK]) % MODULO_CONSTANT` which is `0`.

    // Check the memoization table first: if this state has been computed, return the stored result.
    if (memoizationTable[currentK][currentX] !== -1) {
      return memoizationTable[currentK][currentX];
    }

    let resultForCurrentState; // Variable to hold the calculated result for the current (currentK, currentX) state

    // Special case: If currentX is smaller than the smallest available data point,
    // a simplified calculation can be applied.
    if (currentX < dataPoints[0]) {
      resultForCurrentState = (currentX * factorialCache[currentK]) % MODULO_CONSTANT;
    } else {
      let cumulativeSumOfRecursiveCalls = 0; // Accumulator for sums from recursive subproblems
      let dataPointIterator = 0; // Index to iterate through the sorted `dataPoints` array

      // Iterate through `dataPoints` as long as the current data point is less than or equal to `currentX`
      // and we haven't exhausted the `dataPoints` array.
      while (dataPointIterator < numElements && dataPoints[dataPointIterator] <= currentX) {
        // Make a recursive call: consider one less element (`currentK - 1`) and the remainder of `currentX`
        // after dividing by the current data point (`currentX % dataPoints[dataPointIterator]`).
        const recursiveSubproblemResult = computeCombinatorialSum(currentK - 1, currentX % dataPoints[dataPointIterator]);
        
        // Accumulate the results, ensuring to apply modulo at each step to prevent overflow.
        cumulativeSumOfRecursiveCalls = (cumulativeSumOfRecursiveCalls + recursiveSubproblemResult) % MODULO_CONSTANT;
        dataPointIterator++; // Move to the next data point
      }
      
      // After iterating through all relevant data points, calculate the final result for this state.
      // The `calculateProductSeries` here computes `currentK! / dataPointIterator!`
      // which is `(dataPointIterator + 1) * ... * currentK`.
      const combinatorialFactor = calculateProductSeries(dataPointIterator, currentK);
      resultForCurrentState = (cumulativeSumOfRecursiveCalls * combinatorialFactor) % MODULO_CONSTANT;
    }

    // Store the newly computed result in the memoization table before returning it.
    memoizationTable[currentK][currentX] = resultForCurrentState;
    return resultForCurrentState;
  }

  // Initiate the main computation by calling the recursive DP function with initial parameters (N, X).
  const finalCalculatedResult = computeCombinatorialSum(numElements, targetSumValue);
  
  // Output the final result to the console.
  console.log(finalCalculatedResult);
}

// --- Program Entry Point ---
// This block reads the input from standard input and passes it to the `solveProblem` function.
// It includes basic error handling for file system operations.
try {
  // Dynamically require the 'fs' (file system) module
  const fileSystem = require("fs");
  // Read all data from standard input ('/dev/stdin' is common for Unix-like systems)
  // and ensure it's decoded as UTF-8 text.
  const stdInput = fileSystem.readFileSync("/dev/stdin", "utf8");
  // Execute the main problem-solving logic
  solveProblem(stdInput);
} catch (error) {
  // If any error occurs during file reading or execution, log it to standard error.
  console.error("An unexpected error occurred during program execution:", error.message);
  // Exit the process with a non-zero status code to indicate failure.
  process.exit(1);
}