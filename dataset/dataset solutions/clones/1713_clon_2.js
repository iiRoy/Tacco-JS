"use strict";

// This module handles file system operations to read input.
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// The input string is split into tokens using spaces or newlines as delimiters.
// A pointer `tokenIndex` keeps track of the current position in the token stream.
var tokenStream = rawData.split(/ |\n/),
  tokenIndex = 0;

/**
 * Extracts the next token from the global token stream and converts it to a numeric type.
 * The token pointer is advanced after retrieval.
 * @returns {number} The numeric value of the next token.
 */
function readNextNum() {
  return +tokenStream[tokenIndex++];
}

/**
 * Retrieves the next token from the global token stream as a string.
 * The token pointer is advanced after retrieval.
 * @returns {string} The string value of the next token.
 */
function readNextStr() {
  return tokenStream[tokenIndex++];
}

/**
 * Fetches the next token from the global token stream and converts it into a BigInt.
 * The token pointer is advanced after retrieval.
 * @returns {BigInt} The BigInt representation of the next token.
 */
function readNextBigInt() {
  return BigInt(tokenStream[tokenIndex++]);
}

/**
 * Reads a specified number of tokens from the stream, forming a one-dimensional array.
 * Tokens can be returned as strings or converted to numbers based on the `asStrings` flag.
 * @param {number} count - The total number of elements to read for the array.
 * @param {boolean} asStrings - If true, elements are kept as strings; otherwise, they are parsed as numbers.
 * @returns {Array<number|string>} An array containing the processed tokens.
 */
function readNumArray(count, asStrings) {
  // If `asStrings` is truthy, return the slice of tokens directly.
  // Otherwise, map each token in the slice to its numeric equivalent.
  return asStrings ?
    tokenStream.slice(tokenIndex, (tokenIndex += count)) :
    tokenStream.slice(tokenIndex, (tokenIndex += count)).map((val) => +val);
}

/**
 * Reads a two-dimensional matrix (array of arrays) from the token stream.
 * Each row consists of `cols` elements, and there are `rows` such rows.
 * Elements can be returned as strings or numbers.
 * @param {number} rows - The number of rows to read for the matrix.
 * @param {number} cols - The number of columns in each row.
 * @param {boolean} asStrings - If true, matrix elements are strings; otherwise, they are numbers.
 * @returns {Array<Array<number|string>>} The constructed 2D matrix.
 */
function readMatrix(rows, cols, asStrings) {
  var resultMatrix = [],
    rowIndex = 0; // Initialize a counter for rows.

  if (asStrings) {
    // Populate the matrix with string arrays.
    for (; rowIndex < rows; rowIndex++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, (tokenIndex += cols)));
    }
  } else {
    // Populate the matrix with numeric arrays.
    for (; rowIndex < rows; rowIndex++) {
      resultMatrix.push(
        tokenStream.slice(tokenIndex, (tokenIndex += cols)).map((val) => +val)
      );
    }
  }
  return resultMatrix;
}

/**
 * Generates a multi-dimensional array initialized with a specific value.
 * The dimensions are provided as subsequent arguments after the initial value.
 * This function uses `eval` to dynamically construct the array creation logic.
 * @param {*} initialValue - The value to fill all elements of the array with.
 * @param {...number} dimensions - A variable number of arguments specifying the size of each dimension.
 * @returns {Array} A multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var argsList = arguments,
    argLength = argsList.length,
    // Start building the string for the innermost array.
    arrayCreationString =
    "Array(argsList[" +
    --argLength +
    "]).fill().map(_element => {return " +
    initialValue +
    ";})";

  // Loop to build the string for outer dimensions.
  while (--argLength) {
    arrayCreationString =
      "Array(argsList[" + argLength + "]).fill().map(_element => " +
      arrayCreationString +
      ")";
  }
  // Execute the dynamically created string to form the array.
  return eval(arrayCreationString);
}

// Global variable to accumulate the total score throughout the program's execution.
var currentScore = 0;

// Invoke the main program logic and store any returned value.
var programResult = executeProgram();

// If the main program returns a defined value, print it to the console.
if (programResult !== undefined) {
  console.log(String(programResult));
}

/**
 * This is the main execution function of the program.
 * It processes daily competition data, updates scores, and outputs daily results.
 */
function executeProgram() {
  // Read the total number of days for the competition.
  const dayCount = readNextNum(); // e.g., 365 days

  // Define the fixed number of competitors participating.
  const competitorCount = 26;

  // Read the array of penalty costs, one for each competitor.
  const penaltyCosts = readNumArray(competitorCount);

  // Read the 2D matrix of satisfaction scores, where rows are days and columns are competitors.
  const satisfactionScores = readMatrix(dayCount, competitorCount);

  // Initialize an array to hold the current scores for each contestant, all starting at zero.
  var contestantScores = createMultiDimArray(0, competitorCount);

  // Iterate through each day of the competition, from day 0 up to `dayCount - 1`.
  for (var dayIterator = 0; dayIterator < dayCount; dayIterator++) {
    // Read the identifier (1-indexed) of the contestant chosen for the current day.
    var chosenContestant = readNextNum();

    // Apply the daily penalty cost to every contestant's score.
    for (var loopIndex = 0; loopIndex < competitorCount; loopIndex++) {
      contestantScores[loopIndex] -= penaltyCosts[loopIndex];
    }

    // Reset the score of the chosen contestant for today to zero.
    // Note: `chosenContestant` is 1-indexed, so we subtract 1 for array access.
    contestantScores[chosenContestant - 1] = 0;

    // Add the satisfaction score for the chosen contestant on this specific day to the total score.
    currentScore += satisfactionScores[dayIterator][chosenContestant - 1];

    // Sum up all current contestant scores and add them to the total score.
    for (var loopIndex = 0; loopIndex < competitorCount; loopIndex++) {
      currentScore += contestantScores[loopIndex];
    }

    // Output the cumulative score after all calculations for the current day are complete.
    console.log(currentScore);
  }
}
