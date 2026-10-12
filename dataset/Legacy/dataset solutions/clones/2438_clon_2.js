"use strict";

// This IIFE creates and returns a function to initialize an input data parser.
var DATA_PARSER = (function() {
  /**
   * Factory function to create a new InputParser instance.
   * @param {string} inputString The raw input string, typically from stdin.
   * @returns {InputParser} A new parser object.
   */
  function createParser(inputString) {
    return new InputParser(inputString);
  }

  /**
   * InputParser class for reading various data types from a string.
   * @param {string} rawInput The complete input string.
   */
  function InputParser(rawInput) {
    // Split the input into lines and trim whitespace.
    this._lines = rawInput.trim().split("\n");
    // Keep track of the current line being processed.
    this._currentLineIndex = 0;
  }

  /**
   * Reads the next single value from the current line.
   * If the line is exhausted, it moves to the next line.
   * Values are read in reverse order of how they appear on the line.
   * @param {boolean} [returnAsString=false] If true, returns the value as a string; otherwise, as a number.
   * @returns {string|number} The extracted value.
   */
  InputParser.prototype.readNextValue = function(returnAsString) {
    var linesRef = this._lines;
    var lineIdx = this._currentLineIndex;
    var extractedVal;

    // If the current line hasn't been split into individual values yet, do so.
    // Values are processed from right to left, so reverse the split array.
    if (typeof linesRef[lineIdx] === "string") {
      linesRef[lineIdx] = linesRef[lineIdx].split(" ").reverse();
    }

    // Pop the last element (which was originally the first on the line after reversing).
    extractedVal = linesRef[lineIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!linesRef[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return as string or convert to number.
    return returnAsString ? extractedVal : +extractedVal;
  };

  /**
   * Reads all values from the current line and advances to the next line.
   * @param {boolean} [returnStrings=false] If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of values from the line.
   */
  InputParser.prototype.readLineValues = function(returnStrings) {
    var lineContent = this._lines[this._currentLineIndex++].split(" ");
    return returnStrings ? lineContent : lineContent.map(item => +item);
  };

  /**
   * Reads a matrix of 'numRows' rows, where each row contains space-separated values.
   * Advances the line index by 'numRows'.
   * @param {number} numRows The number of rows to read for the matrix.
   * @param {boolean} [returnAsStrings=false] If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} The parsed matrix.
   */
  InputParser.prototype.readMatrix = function(numRows, returnAsStrings) {
    var matrixData = this._lines.slice(this._currentLineIndex, this._currentLineIndex += numRows).map(rowStr => rowStr.split(" "));
    return returnAsStrings ? matrixData : matrixData.map(row => row.map(cellStr => +cellStr));
  };

  /**
   * Reads 'count' number of lines, where each line is a single value.
   * Advances the line index by 'count'.
   * @param {number} count The number of single-value rows to read.
   * @param {boolean} [asStrings=false] If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of single values.
   */
  InputParser.prototype.readRows = function(count, asStrings) {
    var rowArray = this._lines.slice(this._currentLineIndex, this._currentLineIndex += count);
    return asStrings ? rowArray : rowArray.map(rowItem => +rowItem);
  };

  return createParser;
})();

// Initialize the input reader by reading from standard input.
var inputReader = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * The dimensions are provided as subsequent arguments.
 * Example: initializeMultiDimArray(0, 2, 3) creates a 2x3 array filled with 0s.
 * @param {*} initialValue The value to fill the array with.
 * @param {...number} dimensions The sizes of each dimension.
 * @returns {Array} The initialized multi-dimensional array.
 */
function initializeMultiDimArray(initialValue) {
  var dimensions = arguments;
  var dimCount = dimensions.length;
  // Build the array creation code string from innermost to outermost dimension.
  var arrayCreationCode = "Array(dimensions[" + --dimCount + "]).fill(0).map(_element => {return " + initialValue + ";})";
  while (--dimCount) {
    arrayCreationCode = "Array(dimensions[" + dimCount + "]).fill(0).map(_element => " + arrayCreationCode + ")";
  }
  // Use eval to execute the dynamically generated array creation code.
  return eval(arrayCreationCode);
}

// Execute the main problem-solving logic and print the result.
console.log(solveProblem());

/**
 * Main function containing the problem's logic.
 * This problem appears to be a variation of the knapsack problem.
 * @returns {number} The maximum value that can be achieved.
 */
function solveProblem() {
  // Read the number of items.
  var itemCount = inputReader.readNextValue();
  // Read the maximum capacity (or target value/weight).
  var maxCapacity = inputReader.readNextValue();
  // Read the item data (e.g., [weight, value] for each item).
  var itemsData = inputReader.readMatrix(itemCount);

  // Initialize a DP table. The size is maxCapacity + a buffer (3001)
  // to handle potential overflows or specific problem constraints.
  // All values are initialized to 0.
  var dynamicProgrammingTable = initializeMultiDimArray(0, maxCapacity + 3001);

  // Iterate through each item.
  for (var itemIndex = 0; itemIndex < itemCount; itemIndex++) {
    // Iterate through the DP table from maxCapacity down to 0.
    // This reverse iteration is crucial for 0/1 knapsack to ensure
    // each item is considered only once per capacity.
    for (var currentCapacity = maxCapacity; currentCapacity >= 0; currentCapacity--) {
      // Check if including the current item (itemsData[itemIndex][0] is its weight/cost)
      // would yield a higher value for the new capacity (currentCapacity + item's weight).
      if (dynamicProgrammingTable[currentCapacity + itemsData[itemIndex][0]] < dynamicProgrammingTable[currentCapacity] + itemsData[itemIndex][1]) {
        // If so, update the DP table with the new maximum value.
        dynamicProgrammingTable[currentCapacity + itemsData[itemIndex][0]] = dynamicProgrammingTable[currentCapacity] + itemsData[itemIndex][1];
      }
    }
  }

  // The maximum value will be the largest element in the DP table.
  return Math.max(...dynamicProgrammingTable);
}
