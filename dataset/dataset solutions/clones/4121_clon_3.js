"use strict"; // Enable strict mode for cleaner code execution

// --- Input Processing Utilities ---

// Import the Node.js file system module for input operations
const fileSystemModule = require('node:fs');

// Read the raw input data from standard input.
// Using '/dev/fd/0' as an alternative to '/dev/stdin' for reading from file descriptor 0.
const rawInputBuffer = fileSystemModule.readFileSync("/dev/fd/0");

// Convert the raw buffer data into a string using UTF-8 encoding.
const inputStringContent = rawInputBuffer.toString('utf8');

// Split the input string into an array of tokens.
// Uses a regular expression to split by one or more whitespace characters,
// and then filters out any resulting empty strings to ensure valid tokens.
const tokenStream = inputStringContent.split(/\s+/).filter(Boolean);

// Initialize a pointer to keep track of the current position in the token stream.
let currentTokenPointer = 0;

/**
 * Retrieves the next token from the stream and converts it into a numeric value.
 * Throws an error if the end of the input stream is reached unexpectedly.
 * @returns {number} The next available token, parsed as a number.
 */
function getNextNumericToken() {
    // Validate if there are remaining tokens to prevent out-of-bounds access.
    if (currentTokenPointer >= tokenStream.length) {
        throw new Error("Input stream exhausted! Attempted to read past available tokens.");
    }
    // Convert the token to a number and advance the pointer.
    return Number(tokenStream[currentTokenPointer++]);
}

/**
 * Reads a specified number of tokens from the stream and returns them as a numeric array.
 * Includes a warning for attempts to read beyond the available tokens.
 * @param {number} count - The number of numeric tokens to retrieve.
 * @returns {number[]} An array containing 'count' numeric tokens.
 */
function fetchNumericBlock(count) {
    // Check if the requested number of tokens exceeds what's left in the stream.
    if (currentTokenPointer + count > tokenStream.length) {
        console.warn(`Warning: Requested ${count} tokens, but only ${tokenStream.length - currentTokenPointer} remain.`);
        // Adjust 'count' to read only available tokens or return an empty array if none.
        count = Math.max(0, tokenStream.length - currentTokenPointer);
    }
    // Extract the slice of tokens, convert each to a number, and advance the pointer.
    const numericBlock = tokenStream.slice(currentTokenPointer, currentTokenPointer + count).map(Number);
    currentTokenPointer += count;
    return numericBlock;
}

/**
 * Constructs a 2D array (matrix) of numeric data by reading from the input stream.
 * @param {number} numberOfRows - The desired number of rows for the matrix.
 * @param {number} numberOfColumns - The desired number of columns for each row.
 * @returns {number[][]} A two-dimensional array representing the numeric matrix.
 */
function constructNumericMatrix(numberOfRows, numberOfColumns) {
    const dataMatrix = [];
    // Iterate to populate each row of the matrix.
    for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
        // For each row, fetch a block of 'numberOfColumns' numeric tokens.
        dataMatrix.push(fetchNumericBlock(numberOfColumns));
    }
    return dataMatrix;
}

/**
 * Recursively creates a multi-dimensional array initialized with a given value.
 * This function provides a safe alternative to `eval()` for array creation.
 * @param {*} initialValue - The value to fill array elements with.
 * @param {...number} dimensions - A sequence of numbers defining the size of each dimension.
 * @returns {Array} The newly created multi-dimensional array.
 * @throws {Error} If any dimension size is negative.
 */
function initializeMultiDimensionalArray(initialValue, ...dimensions) {
  // Base case: if no dimensions are left, return the initial value itself.
  if (dimensions.length === 0) {
    return initialValue;
  }

  const currentDimensionSize = dimensions[0];
  // Basic validation: ensure dimension sizes are non-negative.
  if (currentDimensionSize < 0) {
      throw new Error(`Invalid array dimension: ${currentDimensionSize}. Dimensions must be zero or positive.`);
  }

  // Recursively call for the remaining dimensions.
  const remainingDimensions = dimensions.slice(1);
  const newArray = new Array(currentDimensionSize);

  for (let index = 0; index < currentDimensionSize; index++) {
    newArray[index] = initializeMultiDimensionalArray(initialValue, ...remainingDimensions);
  }
  return newArray;
}

// --- Main Program Execution Flow ---

// Execute the primary algorithm logic and store its computed output.
const computationalOutput = executeMainAlgorithm();

// If the algorithm produces a meaningful result, print it to standard output.
if (computationalOutput !== undefined && computationalOutput !== null) {
    // Use process.stdout.write for direct console output, appending a newline.
    process.stdout.write(computationalOutput + '\n');
}

/**
 * Encapsulates the core business logic and computational steps of the program.
 * @returns {string} The final processed data, formatted as a newline-separated string.
 */
function executeMainAlgorithm() {
  // Read the total number of primary elements (often denoted as 'N' in problems).
  const totalPrimaryElements = getNextNumericToken();

  // Guard clause: Ensure the number of elements is positive, as per typical problem constraints.
  if (totalPrimaryElements <= 0) {
      return "Error: The total number of elements must be a positive integer.";
  }

  // Initialize an array to store the calculated results.
  // It's a 1D array of 'totalPrimaryElements' size, filled with zeros initially.
  const resultantValues = initializeMultiDimensionalArray(0, totalPrimaryElements);

  // Read the configuration matrix. This matrix typically contains parameters
  // for the iterative calculations. It has (N-1) rows and 3 columns.
  const configurationParametersMatrix = constructNumericMatrix(totalPrimaryElements - 1, 3);

  // --- Core Iterative Calculation Loop ---
  // The outer loop processes each set of parameters from the configuration matrix.
  for (let outerIterationIndex = 0; outerIterationIndex < totalPrimaryElements - 1; outerIterationIndex++) {
    // Extract the specific parameters for the current iteration from the matrix row.
    // Using descriptive constant names enhances readability.
    const minimumBoundary = configurationParametersMatrix[outerIterationIndex][1]; // Corresponds to c[i][1]
    const divisionStep = configurationParametersMatrix[outerIterationIndex][2];    // Corresponds to c[i][2]
    const finalIncrement = configurationParametersMatrix[outerIterationIndex][0];  // Corresponds to c[i][0]

    // The inner loop updates a growing subset of 'resultantValues'.
    // The number of elements processed in this loop increases with each outer iteration.
    for (let innerIterationIndex = 0; innerIterationIndex <= outerIterationIndex; innerIterationIndex++) {
      let currentElementValue = resultantValues[innerIterationIndex];

      // Step 1: Apply a minimum threshold.
      // If the current value is below the 'minimumBoundary', it is adjusted up to it.
      if (currentElementValue < minimumBoundary) {
        currentElementValue = minimumBoundary;
      }

      // Step 2: Adjust the value to be the next multiple of 'divisionStep'.
      // This logic is equivalent to Math.ceil(currentElementValue / divisionStep) * divisionStep.
      const remainderAfterDivision = currentElementValue % divisionStep;
      if (remainderAfterDivision !== 0) {
        // If there's a remainder, add the difference to reach the next exact multiple.
        currentElementValue += (divisionStep - remainderAfterDivision);
      }

      // Step 3: Apply a final additive offset.
      // Add the 'finalIncrement' to the adjusted value.
      currentElementValue += finalIncrement;

      // Update the 'resultantValues' array with the newly calculated value.
      resultantValues[innerIterationIndex] = currentElementValue;
    }
  }

  // Format the final array of calculated values into a single string,
  // with each element separated by a newline character, for output.
  return resultantValues.join("\n");
}