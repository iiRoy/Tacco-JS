// This module provides utilities for parsing input from standard input.
var INPUT_PARSER = (function () {
  /**
   * Factory function to create a new input reader instance.
   * @param {string} rawInputContent - The entire input content as a single string.
   * @returns {InputReader} An initialized InputReader object.
   */
  function createParser(rawInputContent) {
    return new InputReader(rawInputContent);
  }

  /**
   * Constructor for the InputReader class.
   * Manages the state of input lines and current reading position.
   * @class
   * @param {string} initialStringData - The string containing all input lines.
   */
  function InputReader(initialStringData) {
    // Store the input string, split into lines, and trim whitespace from each.
    this._lines = initialStringData.trim().split("\n");
    // Initialize the pointer to the current line being processed.
    this._currentLineIndex = 0;
  }

  /**
   * Reads and returns a single token from the current line.
   * If the current line is exhausted, it advances to the next line.
   * @param {boolean} [returnAsString=false] - If true, returns the token as a string; otherwise, attempts to convert to a number.
   * @returns {string|number} The extracted token.
   */
  InputReader.prototype.readToken = function (returnAsString) {
    var lineData = this._lines,
      lineIdx = this._currentLineIndex,
      extractedValue;

    // If the current line hasn't been tokenized yet, split it by spaces and reverse for efficient popping.
    if (typeof lineData[lineIdx] === "string") {
      lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
    }

    // Retrieve the next token from the end of the reversed array.
    extractedValue = lineData[lineIdx].pop();

    // If the current line is now empty after popping, increment the line index.
    if (!lineData[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return the value either as a string or as a number.
    return returnAsString ? extractedValue : +extractedValue;
  };

  /**
   * Reads and returns all tokens from the current line as an array.
   * Advances the internal line index to the next line.
   * @param {boolean} [returnAsString=false] - If true, returns tokens as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of tokens from the line.
   */
  InputReader.prototype.readLine = function (returnAsString) {
    var tokensOnLine = this._lines[this._currentLineIndex++].split(" ");
    return returnAsString ? tokensOnLine : tokensOnLine.map((element) => +element);
  };

  /**
   * Reads a specified number of lines and parses them into a 2D array (matrix).
   * Advances the internal line index by the number of lines read.
   * @param {number} numLinesToRead - The count of lines to include in the matrix.
   * @param {boolean} [returnAsString=false] - If true, returns matrix elements as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} The parsed matrix.
   */
  InputReader.prototype.readMatrix = function (numLinesToRead, returnAsString) {
    var matrixRows = this._lines
      .slice(this._currentLineIndex, (this._currentLineIndex += numLinesToRead))
      .map((rowString) => rowString.split(" "));
    return returnAsString
      ? matrixRows
      : matrixRows.map((row) => row.map((element) => +element));
  };

  /**
   * Reads a specified number of lines, treating each line as a single value.
   * Advances the internal line index by the number of lines read.
   * @param {number} numLinesToRead - The count of lines to read.
   * @param {boolean} [returnAsString=false] - If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of parsed values.
   */
  InputReader.prototype.readLinesAsArray = function (numLinesToRead, returnAsString) {
    var lineValues = this._lines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += numLinesToRead)
    );
    return returnAsString ? lineValues : lineValues.map((element) => +element);
  };

  return createParser;
})();

// Initialize the input handler by reading all data from standard input.
var inputHandler = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main problem-solving logic and print its result to the console.
console.log(performCalculation());

/**
 * The primary function that encapsulates the problem's logic.
 * It reads a square matrix, effectively duplicates its rows for circular access,
 * and then counts specific symmetric configurations within this extended structure.
 * @returns {number} The total count of identified symmetric patterns.
 */
function performCalculation() {
  // Read the dimension (N) of the square matrix.
  var matrixSize = inputHandler.readToken();
  // Read N lines, each representing a row of the matrix, as an array of strings.
  var originalMatrix = inputHandler.readLinesAsArray(matrixSize, true);

  // Extend the matrix by appending its first N rows again.
  // This allows for "circular" shifts without complex modulo arithmetic.
  for (var outerLoopIndex = 0; outerLoopIndex < matrixSize; outerLoopIndex++) {
    originalMatrix[outerLoopIndex + matrixSize] = originalMatrix[outerLoopIndex];
  }

  var finalCount = 0; // Accumulator for the total number of symmetric configurations.

  // Iterate through all possible starting row offsets for a sub-matrix.
  for (outerLoopIndex = 0; outerLoopIndex < matrixSize; outerLoopIndex++) {
    var isSymmetric = true; // Flag to track symmetry for the current sub-matrix.

    // Labeled loop to allow breaking out of both inner loops if asymmetry is detected.
    checkSymmetry: for (var rowIdx = 0; rowIdx < matrixSize; rowIdx++) {
      for (var colIdx = rowIdx + 1; colIdx < matrixSize; colIdx++) {
        // Compare elements (row, col) and (col, row) for symmetry.
        // The 'outerLoopIndex' effectively shifts the entire sub-matrix vertically.
        if (
          originalMatrix[rowIdx + outerLoopIndex][colIdx] ===
          originalMatrix[colIdx + outerLoopIndex][rowIdx]
        ) {
          continue; // Elements match, continue checking other pairs.
        }
        // If a mismatch is found, the sub-matrix is not symmetric.
        isSymmetric = false;
        break checkSymmetry; // Exit both inner loops immediately.
      }
    }

    // If the sub-matrix (with the current offset) is symmetric, add 'matrixSize' to the total count.
    if (isSymmetric) {
      finalCount += matrixSize;
    }
  }

  return finalCount; // Return the final computed count.
}
