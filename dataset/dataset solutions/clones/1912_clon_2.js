"use strict"; // Enforce strict parsing and error handling for the entire script

// Import the file system module and read raw input data from standard input
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the raw input into a list of tokens using spaces or newlines as delimiters
var tokenList = rawData.split(/ |\n/);
// Initialize an index to keep track of the current token being processed
var currentTokenIndex = 0;

/**
 * Retrieves the next available token from the global token list.
 *
 * @param {boolean} returnAsString - If true, the token is returned as a string.
 *                                   Otherwise, it's converted to a number.
 * @returns {string|number} The next token from the input stream.
 */
function getNextToken(returnAsString) {
  return returnAsString ? tokenList[currentTokenIndex++] : +tokenList[currentTokenIndex++];
}

/**
 * Extracts a specified number of tokens from the global token list into an array.
 *
 * @param {number} quantity - The number of tokens to retrieve.
 * @param {boolean} returnAsStrings - If true, tokens are returned as strings.
 *                                    Otherwise, they are converted to numbers.
 * @returns {Array<string|number>} An array containing the requested tokens.
 */
function getTokensArray(quantity, returnAsStrings) {
  if (returnAsStrings) {
    // Return tokens as strings
    return tokenList.slice(currentTokenIndex, currentTokenIndex += quantity);
  } else {
    // Return tokens converted to numbers
    return tokenList.slice(currentTokenIndex, currentTokenIndex += quantity).map(parsedValue => +parsedValue);
  }
}

/**
 * Reads a matrix of tokens (2D array) from the global token list.
 *
 * @param {number} matrixHeight - The number of rows in the matrix.
 * @param {number} matrixWidth - The number of columns per row.
 * @param {boolean} returnAsStrings - If true, elements are returned as strings.
 *                                    Otherwise, they are converted to numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function getMatrixTokens(matrixHeight, matrixWidth, returnAsStrings) {
  var resultRows = []; // Array to store the rows of the matrix
  var currentRowIdx = 0; // Loop counter for rows

  if (returnAsStrings) {
    // Process rows, keeping elements as strings
    for (; currentRowIdx < matrixHeight; currentRowIdx++) {
      resultRows.push(tokenList.slice(currentTokenIndex, currentTokenIndex += matrixWidth));
    }
  } else {
    // Process rows, converting elements to numbers
    for (; currentRowIdx < matrixHeight; currentRowIdx++) {
      resultRows.push(tokenList.slice(currentTokenIndex, currentTokenIndex += matrixWidth).map(matrixElement => +matrixElement));
    }
  }
  return resultRows;
}

/**
 * Dynamically creates a multi-dimensional array using a string-based `eval` approach.
 * This utility function is generally used for creating arrays with dynamic dimensions.
 *
 * @param {*} initialValue - The value to initialize all elements of the array with.
 * @returns {Array} A multi-dimensional array as specified by subsequent arguments.
 * @deprecated Use with caution, as `eval` can be a security risk with untrusted input.
 */
function createMultiDimArray(initialValue) {
  var dimensionArguments = arguments; // Capture all arguments, including initialValue
  var argumentLength = dimensionArguments.length; // Number of arguments provided
  // Start building the array creation string from the innermost dimension
  var arrayDefinitionString = "Array(dimensionArguments[" + --argumentLength + "]).fill().map(elementPlaceholder=>{return " + initialValue + ";})";

  // Iterate backwards through the remaining dimensions to wrap the definition
  while (--argumentLength) {
    arrayDefinitionString = "Array(dimensionArguments[" + argumentLength + "]).fill().map(outerPlaceholder=>" + arrayDefinitionString + ")";
  }
  // Execute the constructed string to create the array
  return eval(arrayDefinitionString);
}


// Invoke the primary program execution function
var applicationOutput = executeProgram();

// If the main function returns a value, print it to the console
if (applicationOutput !== undefined) console.log(applicationOutput);


/**
 * The core logic function that solves the specific problem.
 * It processes a sequence of operations to determine a series of actions.
 *
 * @returns {string} A string representing "No" if no solution is found,
 *                   or "Yes" followed by the sequence of actions.
 */
function executeProgram() {
  // Read the initial four numerical parameters: N, A, B, C
  var [numOperations, valA, valB, valC] = getTokensArray(4);

  // Read the sequence of N operations, which are strings
  var operationSequence = getTokensArray(numOperations, true);

  // Initialize an array to store the resulting actions
  var finalActions = [];

  // Define a constant string for the "No solution" case
  var NO_SOLUTION_FOUND = "No";

  // Loop through all operations except the very last one
  for (var opIdx = 0; opIdx < numOperations - 1; opIdx++) {
    // Handle "AB" operation type
    if (operationSequence[opIdx] === "AB") {
      valA--; // Decrement count A
      valB--; // Decrement count B
      // If both counts fall below zero, no valid path exists
      if (valA < 0 && valB < 0) return NO_SOLUTION_FOUND;

      // Decision logic for "AB":
      // Prioritize action 'B' if A is currently greater than B,
      // OR if the next operation is not "AC" and A is still non-negative.
      if (valA > valB || (operationSequence[opIdx + 1] !== "AC" && valA >= 0)) {
        valB += 2; // Increment B by 2
        finalActions.push("B"); // Record action B
      } else {
        valA += 2; // Increment A by 2
        finalActions.push("A"); // Record action A
      }
    }
    // Handle "AC" operation type
    if (operationSequence[opIdx] === "AC") {
      valA--; // Decrement count A
      valC--; // Decrement count C
      // If both counts fall below zero, no valid path exists
      if (valA < 0 && valC < 0) return NO_SOLUTION_FOUND;

      // Decision logic for "AC":
      // Prioritize action 'C' if A is currently greater than C,
      // OR if the next operation is not "AB" and A is still non-negative.
      if (valA > valC || (operationSequence[opIdx + 1] !== "AB" && valA >= 0)) {
        valC += 2; // Increment C by 2
        finalActions.push("C"); // Record action C
      } else {
        valA += 2; // Increment A by 2
        finalActions.push("A"); // Record action A
      }
    }
    // Handle "BC" operation type
    if (operationSequence[opIdx] === "BC") {
      valC--; // Decrement count C
      valB--; // Decrement count B
      // If both counts fall below zero, no valid path exists
      if (valC < 0 && valB < 0) return NO_SOLUTION_FOUND;

      // Decision logic for "BC":
      // Prioritize action 'B' if C is currently greater than B,
      // OR if the next operation is not "AC" and C is still non-negative.
      if (valC > valB || (operationSequence[opIdx + 1] !== "AC" && valC >= 0)) {
        valB += 2; // Increment B by 2
        finalActions.push("B"); // Record action B
      } else {
        valC += 2; // Increment C by 2
        finalActions.push("C"); // Record action C
      }
    }
  }

  // Handle the very last operation separately, as it doesn't have a 'next' operation to consider
  var lastOperation = numOperations - 1;
  if (operationSequence[lastOperation] === "AB") {
    valA--;
    valB--;
    if (valA < 0 && valB < 0) return NO_SOLUTION_FOUND; // Final check for impossibility
    if (valA > valB) finalActions.push("B"); // If A is greater, choose B
    else finalActions.push("A"); // Otherwise, choose A
  } else if (operationSequence[lastOperation] === "AC") {
    valA--;
    valC--;
    if (valA < 0 && valC < 0) return NO_SOLUTION_FOUND; // Final check for impossibility
    if (valA > valC) finalActions.push("C"); // If A is greater, choose C
    else finalActions.push("A"); // Otherwise, choose A
  } else { // This block handles "BC"
    valB--;
    valC--;
    if (valB < 0 && valC < 0) return NO_SOLUTION_FOUND; // Final check for impossibility
    if (valB > valC) finalActions.push("C"); // If B is greater, choose C
    else finalActions.push("B"); // Otherwise, choose B
  }

  // If the program reaches this point, a valid sequence of actions was found
  console.log("Yes"); // Indicate success
  return finalActions.join("\n"); // Return the actions joined by newlines
}