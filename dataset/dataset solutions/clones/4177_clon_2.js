// This module provides utilities for reading input data.
var DATA_PROCESSOR = (function () {
  /**
   * Creates a new instance of the InputReader.
   * @param {string} inputStringContent - The raw string content to parse.
   * @returns {InputReader} A new InputReader instance.
   */
  function createDataReader(inputStringContent) {
    return new InputReader(inputStringContent);
  }

  /**
   * Represents a utility for parsing input strings line by line.
   * @constructor
   * @param {string} inputStringContent - The entire input string.
   */
  function InputReader(inputStringContent) {
    // Store lines after trimming whitespace and splitting by newline.
    this._lineBuffer = inputStringContent.trim().split("\n");
    // Initialize the pointer to the current line.
    this._currentLineIndex = 0;
  }

  /**
   * Reads the next single item from the current line.
   * If the current line has not been processed into individual items, it will be split.
   * Advances the line pointer if the current line becomes empty after popping an item.
   * @param {boolean} returnAsString - If true, returns the item as a string; otherwise, attempts to convert to a number.
   * @returns {string|number} The extracted item.
   */
  InputReader.prototype.readNextItem = function (returnAsString) {
    var lineData = this._lineBuffer, // Reference to the internal line buffer
      linePointer = this._currentLineIndex, // Current line index
      extractedValue; // Variable to hold the result

    // Check if the current line is still a single string; if so, split and reverse for easy popping.
    if (typeof lineData[linePointer] === "string") {
      lineData[linePointer] = lineData[linePointer].split(" ").reverse();
    }

    // Pop the last item from the (reversed) array of items on the current line.
    extractedValue = lineData[linePointer].pop();

    // If the current line is now empty, advance the line pointer to the next line.
    if (!lineData[linePointer].length) {
      this._currentLineIndex++;
    }

    // Return the value, converting to a number if returnAsString is false.
    return returnAsString ? extractedValue : +extractedValue;
  };

  /**
   * Reads an entire line and splits it into items.
   * Advances the line pointer to the next line.
   * @param {boolean} asStringArray - If true, returns an array of strings; otherwise, an array of numbers.
   * @returns {Array<string|number>} An array of items from the line.
   */
  InputReader.prototype.readLineAsNumbers = function (asStringArray) {
    // Get the current line, split it by space, and then advance the line pointer.
    var currentLineParts = this._lineBuffer[this._currentLineIndex++].split(" ");

    // Return as strings or map to numbers.
    return asStringArray ? currentLineParts : currentLineParts.map((item) => +item);
  };

  /**
   * Reads a specified number of lines and processes them as a matrix.
   * Each line is split into items.
   * Advances the line pointer by the number of rows read.
   * @param {number} numRows - The number of rows (lines) to read for the matrix.
   * @param {boolean} asStringMatrix - If true, returns a matrix of strings; otherwise, a matrix of numbers.
   * @returns {Array<Array<string|number>>} A 2D array (matrix) of items.
   */
  InputReader.prototype.readMatrixOfNumbers = function (numRows, asStringMatrix) {
    // Slice the relevant lines from the buffer and map each line to an array of its parts.
    // Also, update the current line index.
    var matrixData = this._lineBuffer.slice(this._currentLineIndex, (this._currentLineIndex += numRows)).map((row) =>
      row.split(" ")
    );

    // Return as strings or map all elements in the matrix to numbers.
    return asStringMatrix ? matrixData : matrixData.map((row) => row.map((element) => +element));
  };

  /**
   * Reads a specified number of raw lines without splitting them into items.
   * Advances the line pointer by the number of lines read.
   * @param {number} countOfLines - The number of lines to read.
   * @param {boolean} returnLinesAsStrings - If true, returns lines as strings; otherwise, tries to convert each line to a number.
   * @returns {Array<string|number>} An array of raw lines or numbers.
   */
  InputReader.prototype.readRawLines = function (countOfLines, returnLinesAsStrings) {
    // Extract a segment of lines from the buffer.
    // Update the current line index.
    var lineSegments = this._lineBuffer.slice(this._currentLineIndex, (this._currentLineIndex += countOfLines));

    // Return as strings or map to numbers.
    return returnLinesAsStrings ? lineSegments : lineSegments.map((line) => +line);
  };

  // The factory function is returned by the IIFE.
  return createDataReader;
})();


// Initialize the input handler by reading the entire content of stdin.
var inputHandler = DATA_PROCESSOR(require("fs").readFileSync("/dev/stdin", "utf8"));


// Execute the main processing function and log its return value to the console.
console.log(processInputAndGenerateOutput());


/**
 * Main function to process input array and generate a sequence of operations.
 * This function aims to make all elements in the array non-decreasing (or non-increasing)
 * by applying a specific set of operations based on the element with the largest absolute value.
 * @returns {string} A newline-separated string of operations.
 */
function processInputAndGenerateOutput() {
  // Read the total number of elements.
  var elementCount = inputHandler.readNextItem();
  // Read the array of numbers.
  var numericArray = inputHandler.readLineAsNumbers();

  // Variables to track the maximum absolute value and its 1-based index.
  var maximumAbsoluteValue = 0,
    indexOfMaxValue;

  // Find the element with the largest absolute value in the array.
  for (var loopIndex = 0; loopIndex < elementCount; loopIndex++) {
    if (Math.abs(maximumAbsoluteValue) < Math.abs(numericArray[loopIndex])) {
      maximumAbsoluteValue = numericArray[loopIndex];
      indexOfMaxValue = loopIndex + 1; // Store 1-based index.
    }
  }

  // If all elements are zero, no operations are needed.
  if (maximumAbsoluteValue === 0) {
    return 0;
  }

  // Array to store the generated operations.
  var outputOperations = [];

  // Case 1: The element with the maximum absolute value is negative.
  // Goal: Make all elements non-increasing by adding the maximum absolute value element.
  if (maximumAbsoluteValue < 0) {
    // Initial operations to propagate the negative maximum element.
    outputOperations.push(indexOfMaxValue + " 1"); // Example: -5 1 -> a[0] = a[0] + a[index_of_max_abs_val]
    outputOperations.push(indexOfMaxValue + " 1"); // Apply twice to ensure effect or specific problem requirement.

    // Iterate through the array (starting from the second element as first might be modified or target).
    for (loopIndex = 1; loopIndex < elementCount; loopIndex++) {
      // If an element is negative, add the maximum absolute value element to it, then to itself.
      // This effectively makes it more negative or ensures non-increasing order.
      if (numericArray[loopIndex] < 0) {
        outputOperations.push("1 " + (loopIndex + 1));
        outputOperations.push("1 1");
      }
      // If an element is positive, add the maximum absolute value element to itself, then to it.
      // This makes it negative or ensures non-increasing order.
      else {
        outputOperations.push("1 1");
        outputOperations.push("1 " + (loopIndex + 1));
      }
    }
  }
  // Case 2: The element with the maximum absolute value is positive.
  // Goal: Make all elements non-decreasing by adding the maximum absolute value element.
  else {
    // Initial operations to propagate the positive maximum element.
    outputOperations.push(indexOfMaxValue + " " + elementCount); // Example: 5 N -> a[N-1] = a[N-1] + a[index_of_max_abs_val]
    outputOperations.push(indexOfMaxValue + " " + elementCount); // Apply twice.

    // Iterate through the array (excluding the last element as it might be modified or target).
    for (loopIndex = 0; loopIndex < elementCount - 1; loopIndex++) {
      // If an element is negative, add the maximum absolute value element to the last element, then to it.
      // This makes it positive or ensures non-decreasing order.
      if (numericArray[loopIndex] < 0) {
        outputOperations.push(elementCount + " " + elementCount);
        outputOperations.push(elementCount + " " + (loopIndex + 1));
      }
      // If an element is positive, add the maximum absolute value element to it, then to the last element.
      // This makes it more positive or ensures non-decreasing order.
      else {
        outputOperations.push(elementCount + " " + (loopIndex + 1));
        outputOperations.push(elementCount + " " + elementCount);
      }
    }
  }

  // The problem implies 2*n operations will always be performed, except for the trivial case.
  console.log(2 * elementCount);
  // Join all generated operations with newline characters and return the string.
  return outputOperations.join("\n");
}