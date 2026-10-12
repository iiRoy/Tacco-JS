"use strict"; // Enforce strict mode for the entire script.

// Import the Node.js file system module to handle file operations.
const fileSystem = require("fs");

// Read the entire content of the standard input file (/dev/stdin).
// The input is read as a UTF-8 encoded string.
const rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8");

// Split the raw input string into an array of tokens using spaces or newlines as delimiters.
const tokenStream = rawInputData.split(/ |\n/);
let tokenIndex = 0; // Initialize an index to track the current position in the token stream.

/**
 * Retrieves the next token from the global token stream and converts it to a number.
 * The token index is incremented after retrieval.
 * @returns {number} The numeric value of the next token.
 */
function readNum() {
  return +tokenStream[tokenIndex++];
}

/**
 * Retrieves the next token from the global token stream as a string.
 * The token index is incremented after retrieval.
 * @returns {string} The string value of the next token.
 */
function readStr() {
  return tokenStream[tokenIndex++];
}

/**
 * Retrieves the next token from the global token stream and converts it to a BigInt.
 * The token index is incremented after retrieval.
 * @returns {BigInt} The BigInt value of the next token.
 */
function readBigNum() {
  return BigInt(tokenStream[tokenIndex++]);
}

/**
 * Reads a specified number of tokens from the global token stream.
 * Optionally converts them to numbers or keeps them as strings.
 * @param {number} count - The number of tokens to read.
 * @param {boolean} [asStrings] - If true, tokens are returned as strings; otherwise, they are converted to numbers.
 * @returns {Array<number|string>} An array containing the read tokens.
 */
function readNums(count, asStrings) {
  if (asStrings) {
    // If 'asStrings' is true, slice the tokens directly.
    return tokenStream.slice(tokenIndex, (tokenIndex += count));
  } else {
    // Otherwise, slice and then map to convert each token to a number.
    return tokenStream.slice(tokenIndex, (tokenIndex += count)).map((item) => +item);
  }
}

/**
 * Reads a 2D matrix of tokens from the global token stream.
 * @param {number} rows - The number of rows in the matrix.
 * @param {number} cols - The number of columns in each row.
 * @param {boolean} [asStrings] - If true, matrix elements are strings; otherwise, they are numbers.
 * @returns {Array<Array<number|string>>} A 2D array representing the matrix.
 */
function readMatrix(rows, cols, asStrings) {
  const matrixData = []; // Initialize an empty array to store matrix rows.
  let rowCounter = 0; // Counter for the current row.

  if (asStrings) {
    // If 'asStrings' is true, read rows as arrays of strings.
    for (; rowCounter < rows; rowCounter++) {
      matrixData.push(tokenStream.slice(tokenIndex, (tokenIndex += cols)));
    }
  } else {
    // Otherwise, read rows and convert elements to numbers.
    for (; rowCounter < rows; rowCounter++) {
      matrixData.push(tokenStream.slice(tokenIndex, (tokenIndex += cols)).map((item) => +item));
    }
  }
  return matrixData;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * The dimensions are provided as subsequent arguments.
 * @param {*} initialValue - The value to fill the array elements with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  const functionArguments = arguments; // Access all arguments passed to the function.
  let argumentCount = functionArguments.length; // Get the total number of arguments.

  // Construct a string that, when evaluated, creates the innermost array.
  let arrayCreationExpression =
    "Array(functionArguments[" +
    --argumentCount +
    "]).fill().map(element => { return " +
    initialValue +
    "; })";

  // Loop backwards through the dimensions to build the nested array creation expressions.
  while (--argumentCount) {
    arrayCreationExpression =
      "Array(functionArguments[" +
      argumentCount +
      "]).fill().map(element => " +
      arrayCreationExpression +
      ")";
  }
  // Evaluate the constructed string to create and return the multi-dimensional array.
  return eval(arrayCreationExpression);
}

// Execute the main program logic and store its return value.
const finalResult = processInput();

// If the main function returned a defined value, print it to the console.
if (finalResult !== undefined) {
  console.log(String(finalResult));
}

/**
 * The core function that implements the problem's algorithm.
 * It calculates the maximum possible score by traversing cycles in a permutation.
 * @returns {BigInt} The maximum score achievable.
 */
function processInput() {
  // Read the total number of elements (N) and the number of steps (K).
  const numElements = readNum();
  const iterations = readNum();

  // Read the permutation array 'p', adjusting values to be 0-indexed.
  const permutation = readNums(numElements).map((val) => val - 1);

  // Read the costs array 'c'.
  const costs = readNums(numElements);

  // Initialize the maximum score found so far to a very small BigInt value.
  let maximumValue = -2e18; // Using a standard number for initialization, will convert to BigInt later.

  // Create a temporary array to store accumulated path values within a cycle.
  // It's initialized with 'numElements' length, but its content will be reset per cycle.
  const currentPathValues = Array(numElements);

  // Iterate through each possible starting element in the permutation.
  for (let startIndex = 0; startIndex < numElements; startIndex++) {
    let pathLength = 1; // Initialize the length of the current path/cycle.
    currentPathValues.fill(0); // Reset the path values array for the new cycle.

    // Start traversing the cycle from the element pointed to by 'startIndex'.
    let currentId = permutation[startIndex];
    // The first step's value is simply the cost of the element it points to.
    currentPathValues[0] = costs[currentId];

    // Continue traversing the cycle until 'iterations' steps are reached or the cycle returns to 'startIndex'.
    while (pathLength < iterations && currentId !== startIndex) {
      currentId = permutation[currentId]; // Move to the next element in the cycle.
      // Accumulate the cost: current step's value is previous step's sum + current element's cost.
      currentPathValues[pathLength] = currentPathValues[pathLength - 1] + costs[currentId];
      pathLength++; // Increment the path length.
    }

    // This line is a no-op, but it is preserved for structural equivalence as per Type II cloning rules.
    pathLength;

    // Check if the total sum of the current cycle (last element in currentPathValues) is positive.
    if (currentPathValues[pathLength - 1] > 0) {
      // If the cycle sum is positive, repeating the cycle can increase the score.
      for (let pathStep = 0; pathStep < pathLength; pathStep++) {
        // Calculate the score: sum up to 'pathStep' + (number of full cycles) * total cycle sum.
        // The number of full cycles is (iterations - current_path_length_so_far - 1) / total_cycle_length.
        const tempValue =
          BigInt(currentPathValues[pathStep]) +
          BigInt(Math.floor((iterations - pathStep - 1) / pathLength)) *
            BigInt(currentPathValues[pathLength - 1]);

        // Update the overall maximum score if the current calculated value is greater.
        if (maximumValue < tempValue) {
          maximumValue = tempValue;
        }
      }
    } else {
      // If the cycle sum is zero or negative, repeating the cycle will not increase the score.
      // In this case, we only consider the scores achievable within a single traversal of the cycle.
      for (let pathStep = 0; pathStep < pathLength; pathStep++) {
        const tempValue = currentPathValues[pathStep]; // The score is simply the accumulated value up to this step.

        // Update the overall maximum score if the current calculated value is greater.
        if (maximumValue < tempValue) {
          maximumValue = tempValue;
        }
      }
    }
  }
  // Return the final maximum score found across all starting points and paths.
  return maximumValue;
}
