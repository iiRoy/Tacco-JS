"use strict";

// This module provides utilities for parsing input data from a string.
var DATA_PARSER = (function() {
  /**
   * Factory function to create an input parser instance.
   * @param {string} inputString - The raw input string, typically from a file.
   * @returns {InputReader} A new InputReader object configured with the input.
   */
  function createParser(inputString) {
    return new InputReader(inputString);
  }

  /**
   * InputReader class for sequential processing of lines and tokens.
   * @param {string} rawInput - The complete raw input string to be parsed.
   */
  function InputReader(rawInput) {
    // Stores all lines of the input, initially as strings.
    this._sourceLines = rawInput.trim().split("\n");
    // Keeps track of the current line being processed.
    this._currentLineIndex = 0;
  }

  /**
   * Reads and extracts the next token from the current line.
   * Advances to the next line if the current one is exhausted.
   * @param {boolean} [asString=false] - If true, returns the token as a string; otherwise, attempts to convert to a number.
   * @returns {string|number} The parsed token.
   */
  InputReader.prototype.readNextToken = function(asString) {
    let lineArray = this._sourceLines;
    let lineIdx = this._currentLineIndex;
    let extractedToken;

    // If the current line is still a single string, split it into tokens and reverse for efficient popping.
    if (typeof lineArray[lineIdx] === "string") {
      lineArray[lineIdx] = lineArray[lineIdx].split(" ").reverse();
    }

    // Get the last token from the (reversed) array.
    extractedToken = lineArray[lineIdx].pop();

    // If the current line's token array is now empty, increment the line index.
    if (!lineArray[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return the token, optionally converted to a number.
    return asString ? extractedToken : +extractedToken;
  };

  /**
   * Reads all tokens from the current line and advances to the next line.
   * @param {boolean} [returnStrings=false] - If true, returns tokens as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array containing all tokens from the line.
   */
  InputReader.prototype.readLineTokens = function(returnStrings) {
    // Split the current line into tokens and then advance the line index.
    let tokens = this._sourceLines[this._currentLineIndex++].split(" ");
    // Return tokens, optionally converted to numbers.
    return returnStrings ? tokens : tokens.map(val => +val);
  };

  /**
   * Reads a specified number of subsequent lines as a matrix.
   * Advances the line index by the number of rows read.
   * @param {number} numRows - The count of rows to read for the matrix.
   * @param {boolean} [asStrings=false] - If true, returns matrix elements as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} The parsed matrix.
   */
  InputReader.prototype.readMatrix = function(numRows, asStrings) {
    // Extract the specified number of lines and split each into elements.
    let matrixData = this._sourceLines
      .slice(this._currentLineIndex, (this._currentLineIndex += numRows))
      .map(rowStr => rowStr.split(" "));
    // Return the matrix, with elements optionally converted to numbers.
    return asStrings ?
      matrixData :
      matrixData.map(row => row.map(cellStr => +cellStr));
  };

  /**
   * Reads a specified number of raw lines without splitting them into tokens.
   * Advances the line index by the number of lines read.
   * @param {number} count - The number of raw lines to retrieve.
   * @param {boolean} [stringOutput=false] - If true, returns lines as strings; otherwise, attempts to convert to numbers.
   * @returns {Array<string|number>} An array of the raw lines.
   */
  InputReader.prototype.readRawLines = function(count, stringOutput) {
    // Extract the specified number of raw lines.
    let rawLines = this._sourceLines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += count)
    );
    // Return the lines, optionally converted to numbers.
    return stringOutput ? rawLines : rawLines.map(lineVal => +lineVal);
  };

  return createParser;
})();

// Initialize the input processor by reading from standard input.
var inputProcessor = DATA_PARSER(
  require("fs").readFileSync("/dev/stdin", "utf8")
);

/**
 * Generates a multi-dimensional array initialized with a specific value.
 * The dimensions are provided as subsequent arguments.
 * @param {*} initialValue - The value to fill the array elements with.
 * @param {...number} dimensions - The sizes of each dimension (e.g., `multiDimArray(0, 2, 3)` for a 2x3 array).
 * @returns {Array} The newly created multi-dimensional array.
 */
function multiDimArray(initialValue) {
  var dimensions = arguments;
  var dimCount = dimensions.length;
  // Construct the innermost array creation string.
  var arrayCreationString =
    "Array(dimensions[" +
    --dimCount +
    "]).fill(0).map(x=>{return " +
    initialValue +
    ";})";
  // Wrap with outer array creation strings for each remaining dimension.
  while (--dimCount) {
    arrayCreationString =
      "Array(dimensions[" + dimCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
  }
  // Evaluate the constructed string to create the array.
  return eval(arrayCreationString);
}

// Execute the main problem-solving logic and print its result to the console.
console.log(solveProblem());

/**
 * Contains the primary logic to solve the problem.
 * Reads input parameters, calculates a path, and returns it as a formatted string.
 * @returns {string} A space-separated string representing the path, or "-1" if no path is found.
 */
function solveProblem() {
  // Read the total length N.
  var totalLength = inputProcessor.readNextToken();
  // Read the maximum jump distance M.
  var maxJump = inputProcessor.readNextToken();
  // Read the binary string S (e.g., "01010").
  var binaryString = inputProcessor.readNextToken(1);

  // Collect indices of '0' characters in the binary string.
  // The loop iterates from N-1 down to 0, so indices are pushed in descending order.
  var zeroIndices = [];
  for (var idx = totalLength - 1; idx >= 0; idx--) {
    if (binaryString[idx] === "0") {
      zeroIndices.push(idx);
    }
  }

  var resultPath = []; // Stores the lengths of the jumps taken.
  var currentPosition = totalLength; // Represents the current position, starting at N.

  // Iterate through the collected zero indices to determine the path.
  for (var idx = 0; idx < zeroIndices.length; idx++) {
    // If the distance from the current position to the current '0' is too large,
    // it's impossible to reach, so return -1.
    if (currentPosition - zeroIndices[idx] > maxJump) {
      return -1;
    }

    // Greedily find the furthest '0' (smallest index) that can be reached
    // from the currentPosition within maxJump.
    // `zeroIndices` is sorted descending, so `zeroIndices[idx+1]` is a smaller index.
    while (
      idx < zeroIndices.length - 1 &&
      currentPosition - zeroIndices[idx + 1] <= maxJump
    ) {
      idx++; // Advance to consider the next '0' (further left).
    }

    // Record the jump distance from the current position to the chosen '0'.
    resultPath.push(currentPosition - zeroIndices[idx]);
    // Update the current position to the chosen '0'.
    currentPosition = zeroIndices[idx];
  }

  // Reverse the path to represent jumps from 0 to N, and join with spaces.
  return resultPath.reverse().join(" ");
}
