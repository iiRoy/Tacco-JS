"use strict"; // Enforce strict parsing and error handling

// Module import and initial data setup
var dataSource = require("fs").readFileSync("/dev/stdin", "utf8"); // Read entire standard input synchronously
var tokenStream = dataSource.split(/ |\n/), // Divide the input into tokens by spaces or newlines
  currentTokenPosition = 0; // Initialize an index to track the current token being processed

/**
 * Retrieves the next token from the global token stream.
 * @param {boolean} asStringFlag - If true, returns the token as a string; otherwise, attempts to convert it to a number.
 * @returns {string|number} The next token.
 */
function acquireNextToken(asStringFlag) {
  // Move to the next token after retrieval
  return asStringFlag ? tokenStream[currentTokenPosition++] : +tokenStream[currentTokenPosition++];
}

/**
 * Retrieves a sequence of tokens from the global token stream.
 * @param {number} countToFetch - The number of tokens to retrieve.
 * @param {boolean} returnStrings - If true, returns tokens as strings; otherwise, converts them to numbers.
 * @returns {Array<string|number>} An array containing the requested tokens.
 */
function acquireTokenSequence(countToFetch, returnStrings) {
  // Slice the array and advance the token position
  return returnStrings ?
    tokenStream.slice(currentTokenPosition, (currentTokenPosition += countToFetch)) :
    tokenStream.slice(currentTokenPosition, (currentTokenPosition += countToFetch)).map(val => +val);
}

/**
 * Retrieves a matrix (2D array) of tokens from the global token stream.
 * @param {number} matrixRows - The number of rows in the matrix.
 * @param {number} matrixCols - The number of columns in each row.
 * @param {boolean} stringElements - If true, elements are kept as strings; otherwise, converted to numbers.
 * @returns {Array<Array<string|number>>} The parsed matrix.
 */
function acquireMatrixTokens(matrixRows, matrixCols, stringElements) {
  var resultGrid = [], // Initialize an empty array to store the matrix rows
    rowIndex = 0; // Initialize row counter

  if (stringElements) {
    // If elements should remain strings
    for (; rowIndex < matrixRows; rowIndex++) {
      resultGrid.push(tokenStream.slice(currentTokenPosition, (currentTokenPosition += matrixCols)));
    }
  } else {
    // If elements should be converted to numbers
    for (; rowIndex < matrixRows; rowIndex++) {
      resultGrid.push(tokenStream.slice(currentTokenPosition, (currentTokenPosition += matrixCols)).map(val => +val));
    }
  }
  return resultGrid; // Return the constructed matrix
}

/**
 * Dynamically constructs a multi-dimensional array based on provided dimensions.
 * Uses `eval` for dynamic array creation, which should be used with caution.
 * @param {*} defaultValue - The initial value for the innermost elements.
 * @returns {Array} A multi-dimensional array initialized with the default value.
 */
function constructNDArray(defaultValue) {
  var dimensionSizes = arguments, // Get all arguments as an array of dimensions
    currentDimIndex = dimensionSizes.length, // Start from the last dimension
    arrayCreationCode = "Array(dimensionSizes[" + --currentDimIndex + "]).fill().map(element => { return " + defaultValue + "; })"; // Build innermost array creation string

  // Loop backwards through dimensions to nest the array creation
  while (--currentDimIndex >= 0) {
    arrayCreationCode = "Array(dimensionSizes[" + currentDimIndex + "]).fill().map(element => " + arrayCreationCode + ")";
  }
  return eval(arrayCreationCode); // Execute the dynamically generated code to create the array
}

// Execute the primary logic and handle output
var computedOutcome = executeCoreLogic(); // Call the main processing function
// If the core logic returns a value, print it to the console
if (computedOutcome !== undefined) console.log(computedOutcome);

/**
 * The primary function containing the core business logic.
 * Reads three numbers and performs a mathematical comparison.
 * @returns {string} "Yes" if the condition is met, "No" otherwise.
 */
function executeCoreLogic() {
  var firstOperand = acquireNextToken(), // Get the first number from input
    secondOperand = acquireNextToken(), // Get the second number from input
    thirdOperand = acquireNextToken(); // Get the third number from input

  // Compare the sum of square roots of the first two numbers with the square root of the third
  return Math.sqrt(firstOperand) + Math.sqrt(secondOperand) < Math.sqrt(thirdOperand) ? "Yes" : "No";
}