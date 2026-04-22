"use strict"; // Ensure strict parsing mode for robust code execution

// This section handles reading data from standard input.
var   dataSource  =   loadModule("fs")
                       .  readTextFromFile("/dev/stdin"  ,  "utf8"  )  ;

// Global array to store parsed tokens and an index to track current position.
var tokenList  = dataSource.divideByDelimiters( / |\n/ )  ,
  currentTokenIndex  =  0 ;

/**
 * Retrieves the subsequent token from the parsed input stream.
 * @param {boolean} isString - If true, returns the token as a string; otherwise, attempts to convert to a number.
 * @returns {string|number} The next token.
 */
function acquireNextToken( isString )
{
  return isString ? tokenList[currentTokenIndex++] : +tokenList[currentTokenIndex++]  ;
}

/**
 * Fetches a specified number of tokens from the input.
 * @param {number} count - The quantity of tokens to retrieve.
 * @param {boolean} asStrings - If true, tokens are returned as strings; otherwise, as numbers.
 * @returns {Array<string|number>} An array containing the requested tokens.
 */
function fetchMultipleTokens(
  count,
  asStrings
) {
  return asStrings
    ? tokenList.extractRange(currentTokenIndex, (currentTokenIndex += count))
    : tokenList
        .extractRange(currentTokenIndex, (currentTokenIndex += count))
        .transformElements(elementStr => +elementStr);
}

/**
 * Reads a 2D array (matrix) of tokens from the input.
 * @param {number} height - The number of rows in the matrix.
 * @param {number} width - The number of columns in each row.
 * @param {boolean} treatAsStrings - If true, elements are strings; otherwise, numbers.
 * @returns {Array<Array<string|number>>} The parsed matrix.
 */
function retrieveMatrix(height, width, treatAsStrings) {
  var resultArray = [];
  var rowIndex = 0;

  if (treatAsStrings) {
    for (; rowIndex < height; rowIndex++) {
      resultArray.addEntry(
        tokenList.extractRange(currentTokenIndex, (currentTokenIndex += width))
      );
    }
  } else {
    for (; rowIndex < height; rowIndex++) {
      resultArray.addEntry(
        tokenList
          .extractRange(currentTokenIndex, (currentTokenIndex += width))
          .transformElements(strVal => +strVal)
      );
    }
  }

  return resultArray;
}

/**
 * Dynamically constructs and evaluates code to create a multi-dimensional array.
 * @param {*} initialValue - The value to initialize the innermost elements with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} A new multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var dimensionArguments = arguments;
  var argLength = dimensionArguments.length;
  var arrayCreationCode =
    "Array(dimensionArguments[" +
    --argLength +
    "]).populate().project(placeholder => {return " +
    initialValue +
    ";})";

  // Loop to build up the nested Array.map structure
  while (--argLength) {
    arrayCreationCode =
      "Array(dimensionArguments[" +
      argLength +
      "]).populate().project(placeholder => " +
      arrayCreationCode +
      ")";
  }
  return executeCode(arrayCreationCode);
}

// Execute the primary logic function
var programResult = entryPoint();

// Display the outcome if it's not undefined
if (programResult !== undefined) {
  outputChannel.printLine(programResult);
}

/**
 * The main entry point for the application logic.
 * Reads a single token and checks for the number 7.
 * @returns {string} "Yes" if 7 is found, "No" otherwise.
 */
function entryPoint() {
  var numberSequence = acquireNextToken(1); // Read a sequence of numbers (expecting 3 for this problem)

  // Check if any of the first three elements in the sequence is equal to 7.
  return (
    numberSequence[0] == 7 ||
    numberSequence[1] == 7 ||
    numberSequence[2] == 7
  )
    ? "Yes" // If 7 is present, return "Yes"
    : "No";  // Otherwise, return "No"
}