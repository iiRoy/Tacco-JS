"use strict";
// This module provides a utility for reading input from a string, typically from stdin.
var GET_INPUT_PARSER = (function () {
  /**
   * Factory function to create an input reader instance.
   * @param {string} rawInputString - The complete input as a single string.
   * @returns {InputDataProcessor} An instance capable of parsing the input.
   */
  function createInputReader(rawInputString) {
    return new InputDataProcessor(rawInputString);
  }

  /**
   * Class to process and extract data from the input string.
   * @class InputDataProcessor
   */
  function InputDataProcessor(inputContent) {
    // Store the input lines, trimmed and split by newline.
    this.sourceLines = inputContent.trim().split("\n");
    // Current line index being processed.
    this.currentLineIndex = 0;
  }

  /**
   * Reads the next token from the current line. If the current line is exhausted,
   * it moves to the next line. Tokens are space-separated.
   * @param {boolean} [returnAsString=false] - If true, returns the token as a string; otherwise, as a number.
   * @returns {string|number} The next token.
   */
  InputDataProcessor.prototype.a = function (returnAsString) {
    let lineSegments = this.sourceLines;
    let currentLinePos = this.currentLineIndex;
    let resultToken;

    // If the current line hasn't been split into tokens yet, do so.
    // Tokens are processed in reverse order for efficient popping.
    if (typeof lineSegments[currentLinePos] === "string") {
      lineSegments[currentLinePos] = lineSegments[currentLinePos].split(" ").reverse();
    }

    // Extract the last token from the current line's array.
    resultToken = lineSegments[currentLinePos].pop();

    // If the current line is now empty, advance to the next line.
    if (!lineSegments[currentLinePos].length) {
      this.currentLineIndex++;
    }

    // Return the token, optionally parsed as a number.
    return returnAsString ? resultToken : +resultToken;
  };

  /**
   * Reads an entire line and splits it into tokens.
   * @param {boolean} [returnAsString=false] - If true, returns tokens as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of tokens from the line.
   */
  InputDataProcessor.prototype.l = function (returnAsString) {
    // Get the current line, split it by space, and advance the line index.
    let lineTokens = this.sourceLines[this.currentLineIndex++].split(" ");
    // Return tokens as strings or mapped to numbers.
    return returnAsString ? lineTokens : lineTokens.map(val => +val);
  };

  /**
   * Reads a specified number of lines as a matrix.
   * @param {number} numLines - The number of lines to read.
   * @param {boolean} [returnAsString=false] - If true, returns matrix elements as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} A 2D array (matrix) of tokens.
   */
  InputDataProcessor.prototype.m = function (numLines, returnAsString) {
    // Extract the relevant lines and split each into tokens.
    let matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex += numLines).map(line => line.split(" "));
    // Return matrix, optionally with elements mapped to numbers.
    return returnAsString ? matrixRows : matrixRows.map(row => row.map(val => +val));
  };

  /**
   * Reads a specified number of lines as a 1D array.
   * @param {number} numLines - The number of lines to read.
   * @param {boolean} [returnAsString=false] - If true, returns elements as strings; otherwise, as numbers.
   * @returns {Array<string|number>} A 1D array of values.
   */
  InputDataProcessor.prototype.r = function (numLines, returnAsString) {
    // Extract the relevant lines.
    let dataRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex += numLines);
    // Return array, optionally with elements mapped to numbers.
    return returnAsString ? dataRows : dataRows.map(val => +val);
  };

  return createInputReader;
})();

// Initialize the input reader by reading from standard input.
var inputReader = GET_INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a specific value or expression.
 * @param {string} initExpression - The string expression to initialize each element (e.g., "new Set()", "[]", "0").
 * @param {...number} dimensions - The dimensions of the array (e.g., createMultiDimArray("0", 2, 3) for a 2x3 array).
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimArray(initExpression) {
  var args = arguments;
  var numDimensions = args.length;
  var arrayCreationString = "Array(args[" + --numDimensions + "]).fill(0).map(element => {return " + initExpression + ";})";
  // Build the nested array creation string.
  while (--numDimensions) {
    arrayCreationString = "Array(args[" + numDimensions + "]).fill(0).map(element => " + arrayCreationString + ")";
  }
  // Use eval to dynamically create the array structure.
  return eval(arrayCreationString);
}

// Execute the main problem-solving function and print its result.
console.log(solveProblem());

/**
 * Main function to solve the problem.
 * It calculates the minimum absolute difference between sums of elements
 * from two matrices, considering paths from top-left to bottom-right.
 * @returns {number} The minimum absolute difference.
 */
function solveProblem() {
  // Read matrix dimensions.
  var heightDim = inputReader.a(); // Number of rows
  var widthDim = inputReader.a();  // Number of columns

  // Initialize a 2D DP array where each cell stores a Set of possible absolute differences.
  var dynamicProgGrid = createMultiDimArray("new Set()", heightDim, widthDim);

  // Read the two input matrices.
  var matrixA = inputReader.m(heightDim);
  var matrixB = inputReader.m(heightDim);

  // Create a difference matrix C = A - B.
  var diffMatrix = createMultiDimArray("[]", heightDim);
  for (var rowIdx = 0; rowIdx < heightDim; rowIdx++) {
    for (var colIdx = 0; colIdx < widthDim; colIdx++) {
      diffMatrix[rowIdx][colIdx] = matrixA[rowIdx][colIdx] - matrixB[rowIdx][colIdx];
    }
  }

  // Initialize the starting point of the DP.
  // The first cell (0,0) can only have the absolute difference of c[0][0].
  dynamicProgGrid[0][0].add(Math.abs(diffMatrix[0][0]));

  // Fill the DP table.
  // Iterate through each cell of the grid.
  for (var rowIdx = 0; rowIdx < heightDim; rowIdx++) {
    for (var colIdx = 0; colIdx < widthDim; colIdx++) {
      // If not in the first row, consider paths coming from the cell above.
      if (rowIdx > 0) {
        // For each possible absolute difference from the cell above...
        for (var prevVal of dynamicProgGrid[rowIdx - 1][colIdx]) {
          // Add new possible differences by adding or subtracting the current cell's difference.
          dynamicProgGrid[rowIdx][colIdx].add(Math.abs(prevVal + diffMatrix[rowIdx][colIdx]));
          dynamicProgGrid[rowIdx][colIdx].add(Math.abs(prevVal - diffMatrix[rowIdx][colIdx]));
        }
      }
      // If not in the first column, consider paths coming from the cell to the left.
      if (colIdx > 0) {
        // For each possible absolute difference from the cell to the left...
        for (var prevVal of dynamicProgGrid[rowIdx][colIdx - 1]) {
          // Add new possible differences by adding or subtracting the current cell's difference.
          dynamicProgGrid[rowIdx][colIdx].add(Math.abs(prevVal + diffMatrix[rowIdx][colIdx]));
          dynamicProgGrid[rowIdx][colIdx].add(Math.abs(prevVal - diffMatrix[rowIdx][colIdx]));
        }
      }
    }
  }

  // Find the minimum absolute difference in the bottom-right cell.
  var minAbsDiff = 1e9; // Initialize with a very large number.
  for (var finalDiff of dynamicProgGrid[heightDim - 1][widthDim - 1]) {
    if (finalDiff < minAbsDiff) {
      minAbsDiff = finalDiff;
    }
  }
  return minAbsDiff;
}
