"use strict";

// This module provides a robust input parsing utility.
// It's designed to read various formats of data from a string source.
var DATA_PARSER = (function () {
  /**
   * Creates and returns a new instance of the InputProcessor.
   * This is the primary entry point for using the parser.
   * @param {string} inputString - The complete raw input content.
   * @returns {InputProcessor} An object capable of parsing the input.
   */
  function createParser(inputString) {
    return new InputProcessor(inputString);
  }

  /**
   * The core class for processing input strings line by line.
   * @param {string} inputString - The raw string data to be processed.
   */
  function InputProcessor(inputString) {
    // Stores each line of the input string as an element in an array.
    // Trims leading/trailing whitespace from the whole input, then splits by newline.
    this.linesArray = inputString.trim().split("\n");
    // Keeps track of the current line being processed.
    this.currentLineIndex = 0;
  }

  /**
   * Reads a single value from the current line. If the line contains multiple
   * space-separated values, it reads them from right to left (LIFO).
   * Automatically advances to the next line when the current one is exhausted.
   * @param {boolean} [asString=false] - If true, returns the value as a string; otherwise, attempts conversion to number.
   * @returns {string|number} The parsed value.
   */
  InputProcessor.prototype.readNextValue = function (asString) {
    var lineData = this.linesArray;
    var idx = this.currentLineIndex;
    var resultValue;

    // If the current line is still a single string, split it into an array of values.
    // The original logic implies reading from the end of the line, so we reverse it.
    if (typeof lineData[idx] === "string") {
      lineData[idx] = lineData[idx].split(" ").reverse();
    }

    // Extract the last value (which was the first in the original order after reversing).
    resultValue = lineData[idx].pop();

    // If the current line array is now empty, move to the next line.
    if (!lineData[idx].length) {
      this.currentLineIndex++;
    }

    // Return the value, optionally converted to a number.
    return asString ? resultValue : +resultValue;
  };

  /**
   * Reads an entire line, splits it by spaces, and returns all values.
   * Advances the line index to the next line.
   * @param {boolean} [asString=false] - If true, returns values as strings; otherwise, attempts conversion to numbers.
   * @returns {Array<string|number>} An array of values from the line.
   */
  InputProcessor.prototype.readNextLine = function (asString) {
    // Get the current line, split it, and then increment the line index.
    var lineValues = this.linesArray[this.currentLineIndex++].split(" ");
    // Return values, optionally converted to numbers.
    return asString ? lineValues : lineValues.map(element => +element);
  };

  /**
   * Reads a specified number of lines, treating each as a row in a matrix.
   * Each row is split into individual values.
   * Advances the line index by `numRows`.
   * @param {number} numRows - The number of lines (rows) to read.
   * @param {boolean} [asString=false] - If true, returns values as strings; otherwise, attempts conversion to numbers.
   * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
   */
  InputProcessor.prototype.readMatrix = function (numRows, asString) {
    // Extract the block of lines and update the current line index.
    var matrixRows = this.linesArray.slice(this.currentLineIndex, this.currentLineIndex += numRows);
    // Map each raw line string to an array of its split values.
    var parsedMatrix = matrixRows.map(element => element.split(" "));
    // Return the matrix, optionally with all inner values converted to numbers.
    return asString ? parsedMatrix : parsedMatrix.map(element => element.map(innerElement => +innerElement));
  };

  /**
   * Reads a specified number of lines, treating each line as a single value.
   * Advances the line index by `numRows`.
   * @param {number} numRows - The number of lines to read.
   * @param {boolean} [asString=false] - If true, returns values as strings; otherwise, attempts conversion to numbers.
   * @returns {Array<string|number>} An array of values, one per line.
   */
  InputProcessor.prototype.readRows = function (numRows, asString) {
    // Extract the block of lines and update the current line index.
    var rowValues = this.linesArray.slice(this.currentLineIndex, this.currentLineIndex += numRows);
    // Return the values, optionally converted to numbers.
    return asString ? rowValues : rowValues.map(element => +element);
  };

  return createParser; // Expose the factory function.
})();

// Initialize the input reader by reading the entire content of stdin.
var inputReader = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array with specified dimensions, initialized with a given value.
 * The dimensions are provided as subsequent arguments after the initial value.
 * @param {*} initialValue - The value to fill all array elements with.
 * @param {...number} dimensions - The sizes for each dimension of the array.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var args = arguments;
  var argCount = args.length;
  // Construct the string representation of array creation, starting from the innermost dimension.
  var arrayCreationString = "Array(args[" + --argCount + "]).fill(0).map(item=>{return " + initialValue + ";})";
  // Wrap with outer dimensions iteratively.
  while (--argCount) {
    arrayCreationString = "Array(args[" + argCount + "]).fill(0).map(item=>" + arrayCreationString + ")";
  }
  // Evaluate the constructed string to create the actual array structure.
  return eval(arrayCreationString);
}

// Execute the main solution logic and print its return value to the console.
console.log(executeSolution());

/**
 * Contains the primary algorithm to solve the problem.
 * Reads input data, performs calculations, and formats the output.
 * @returns {string} The final computed result, formatted as a string with newlines.
 */
function executeSolution() {
  // Read the total count of elements from the input.
  var totalElements = inputReader.readNextValue();
  // Read the list of input values as an array.
  var inputValues = inputReader.readNextLine();

  // Create a frequency map (an array) initialized with zeros, sized by totalElements.
  var frequencyMap = createMultiDimArray(0, totalElements);
  // Populate the frequency map by counting occurrences of each value.
  for (var loopCounter = 0; loopCounter < totalElements; loopCounter++) {
    frequencyMap[inputValues[loopCounter] - 1]++;
  }

  // Collect all non-zero frequencies into a new array.
  var nonZeroFrequencies = [];
  for (var loopCounter = 0; loopCounter < totalElements; loopCounter++) {
    if (frequencyMap[loopCounter]) {
      nonZeroFrequencies.push(frequencyMap[loopCounter]);
    }
  }
  // Sort the collected frequencies in descending order.
  nonZeroFrequencies.sort((valA, valB) => valB - valA);

  // Initialize the array to store the final answers for each 'k'.
  // The answer for k=1 is always 'totalElements'.
  var finalResults = [totalElements];

  // Iterate for 'k' from 2 up to 'totalElements'.
  for (var loopCounter = 2; loopCounter <= totalElements; loopCounter++) {
    // If the number of distinct frequencies is less than 'k', the answer is 0.
    if (nonZeroFrequencies.length < loopCounter) {
      finalResults.push(0);
    } else {
      // Calculate the initial maximum allowed frequency per group for the current 'k'.
      var maxAllowedFrequency = totalElements / loopCounter | 0; // Integer division.
      var remainingElements = totalElements;

      // Adjust 'remainingElements' by subtracting excess frequencies that are above 'maxAllowedFrequency'.
      for (var listIndex = 0; listIndex < totalElements && maxAllowedFrequency < nonZeroFrequencies[listIndex]; listIndex++) {
        remainingElements -= (nonZeroFrequencies[listIndex] - maxAllowedFrequency);
      }
      // Recalculate 'maxAllowedFrequency' based on the adjusted remaining elements.
      maxAllowedFrequency = remainingElements / loopCounter | 0;
      finalResults.push(maxAllowedFrequency);
    }
  }
  // Join the calculated results with newline characters and return the final string.
  return finalResults.join("\n");
}
