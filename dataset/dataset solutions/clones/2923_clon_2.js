/* This module provides utilities for parsing input text from various sources. */
var INPUT_PROCESSOR = (function () {
  /**
   * Factory function to create a new data processor instance.
   * This is the public interface for the input reading utility.
   * @param {string} rawInputContent - The complete string input to be processed.
   * @returns {InputSourceHandler} A new instance capable of reading data.
   */
  function makeDataProcessor(rawInputContent) {
    return new InputSourceHandler(rawInputContent);
  }

  /**
   * @class InputSourceHandler
   * @description Manages the reading and parsing of lines from a given text source.
   * @param {string} sourceText - The entire input text as a single, multi-line string.
   */
  function InputSourceHandler(sourceText) {
    // Internal storage for all lines, trimmed and split.
    this.sourceLines = sourceText.trim().split("\n");
    // Pointer indicating the current line index being read.
    this.currentLineNum = 0;
  }

  /**
   * Extracts the next single value from the current line. It handles splitting
   * the line into segments if not already done, and pops values from the end.
   * @param {boolean} returnRawText - If true, the value is returned as a string; otherwise, it's converted to a number.
   * @returns {string|number} The extracted value from the input.
   */
  InputSourceHandler.prototype.fetchItem = function (returnRawText) {
    const allLines = this.sourceLines; // Reference to the array of lines
    let lineIdx = this.currentLineNum; // Current line index
    let extractedElement; // Variable to hold the popped element

    // If the current line hasn't been split into an array of segments yet, do it now.
    // Splitting and reversing allows efficient popping from the "front" of the line.
    if (typeof allLines[lineIdx] === "string") {
      allLines[lineIdx] = allLines[lineIdx].split(" ").reverse();
    }

    // Remove and return the last element from the current line's segment array.
    extractedElement = allLines[lineIdx].pop();

    // If the current line is now empty, advance the line pointer to the next line.
    if (!allLines[lineIdx].length) {
      this.currentLineNum++;
    }

    // Return the element, either as a string or converted to a number using unary plus.
    return returnRawText ? extractedElement : +extractedElement;
  };

  /**
   * Reads and processes the entire next line, splitting it into elements.
   * The line pointer is automatically advanced after this operation.
   * @param {boolean} outputAsTextArray - If true, returns elements as strings; otherwise, attempts to convert each to a number.
   * @returns {Array<string|number>} An array containing all elements from the processed line.
   */
  InputSourceHandler.prototype.getLineElements = function (outputAsTextArray) {
    // Retrieve the current line, then increment the line pointer, and finally split the line by spaces.
    const parsedLine = this.sourceLines[this.currentLineNum++].split(" ");
    // Map the parsed elements based on the 'outputAsTextArray' flag.
    return outputAsTextArray ? parsedLine : parsedLine.map(itemRepresentation => +itemRepresentation);
  };

  /**
   * Reads a specified number of subsequent lines and parses them into a 2D array (matrix).
   * The line pointer is advanced by the number of rows read.
   * @param {number} numberOfRows - The count of lines to read and form into rows of the matrix.
   * @param {boolean} outputRawCells - If true, cell values remain strings; otherwise, they are converted to numbers.
   * @returns {Array<Array<string|number>>} A matrix (array of arrays) of values.
   */
  InputSourceHandler.prototype.fetchGrid = function (numberOfRows, outputRawCells) {
    // Extract a slice of lines starting from the current position, then advance the pointer.
    // Each extracted line is then split into an array of strings.
    const gridData = this.sourceLines.slice(this.currentLineNum, this.currentLineNum += numberOfRows).map(lineContent => lineContent.split(" "));
    // Process the grid data: either return as raw strings or convert all cell values to numbers.
    return outputRawCells ? gridData : gridData.map(rowContent => rowContent.map(cellValueText => +cellValueText));
  };

  /**
   * Retrieves a specified number of raw lines without further splitting them into elements.
   * The line pointer is advanced by the number of lines retrieved.
   * @param {number} numLinesToRetrieve - The quantity of lines to read.
   * @param {boolean} returnLinesAsIs - If true, lines are returned as raw strings; otherwise, each line is converted to a number.
   * @returns {Array<string|number>} An array of lines, either as strings or numbers.
   */
  InputSourceHandler.prototype.getLines = function (numLinesToRetrieve, returnLinesAsIs) {
    // Slice the required number of lines from the source, advancing the line pointer.
    const extractedLines = this.sourceLines.slice(this.currentLineNum, this.currentLineNum += numLinesToRetrieve);
    // Return the lines as-is (strings) or converted to numbers.
    return returnLinesAsIs ? extractedLines : extractedLines.map(singleLine => +singleLine);
  };

  return makeDataProcessor; // Expose the factory function for creating input processors.
})();

// Initialize a data processor by reading the entire content of standard input.
var dataProcessor = INPUT_PROCESSOR(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically constructs a multi-dimensional array with specified dimensions and fills it with an initial value.
 * This function uses 'eval' for dynamic array creation, which should be used with caution.
 * @param {*} initialValue - The value to populate all elements of the array with.
 * @param {...number} dimensions - A variable number of arguments, each representing a dimension's size.
 * @returns {Array} A new multi-dimensional array structured according to the provided dimensions.
 */
function generateNestedArray(initialValue) {
  const dimensionArgs = arguments; // All arguments passed to the function.
  let currentArgIndex = dimensionArgs.length; // Start from the last dimension.
  // Construct the innermost array creation string.
  let arrayCreationString = `Array(dimensionArgs[${--currentArgIndex}]).fill(0).map( _ => { return ${initialValue}; })`;

  // Build up the nested array creation string by iterating backwards through dimensions.
  while (--currentArgIndex) {
    arrayCreationString = `Array(dimensionArgs[${currentArgIndex}]).fill(0).map( _ => ${arrayCreationString})`;
  }

  // Execute the dynamically generated string to create the array structure.
  return eval(arrayCreationString);
}

// Execute the main solution logic and print its returned result to the console.
console.log(executeSolution());

/**
 * The primary function containing the core algorithm to solve the problem.
 * It processes a sequence of numbers to find a specific maximum sum based on
 * symmetric positions and step values.
 * @returns {number} The calculated maximum sum found during the process.
 */
function executeSolution() {
  // Read the total count of elements in the main sequence.
  const sequenceLength = dataProcessor.fetchItem();
  // Read the full sequence of numbers as an array.
  const valueArray = dataProcessor.getLineElements();

  let maximumSum = 0; // Variable to store the highest sum encountered.
  // Calculate the midpoint of the sequence length for loop control.
  // Bitwise right shift (`>> 1`) is an efficient way to perform integer division by 2.
  const halfLength = sequenceLength >> 1;

  // Outer loop: iterates through possible 'step' values from 1 up to (but not including) the midpoint.
  for (let stepValue = 1; stepValue < halfLength; stepValue++) {
    // A Set to keep track of indices that have been included in the current 'iterationTotal'
    // to prevent double counting or redundant calculations for symmetric pairs.
    const processedPositions = new Set();
    let iterationTotal = 0; // Accumulator for the sum generated in the current outer loop iteration.

    // Inner loop: iterates through positions that are multiples of 'stepValue'.
    for (let currentPosition = stepValue; currentPosition < sequenceLength; currentPosition += stepValue) {
      // Check if the current position or its symmetric counterpart has already been processed,
      // or if the position is its own symmetric counterpart (center element for odd lengths).
      if (processedPositions.has(currentPosition) || processedPositions.has(sequenceLength - currentPosition - 1) || currentPosition === sequenceLength - currentPosition - 1) {
        break; // If any of these conditions are true, break from the inner loop as this path is exhausted.
      }

      // Add the value at the current position and its symmetric mirror position to the current iteration's total.
      iterationTotal += valueArray[currentPosition] + valueArray[sequenceLength - currentPosition - 1];

      // If the current iteration's total exceeds the overall maximum sum found so far, update it.
      if (maximumSum < iterationTotal) {
        maximumSum = iterationTotal;
      }

      // Mark both the current position and its symmetric mirror position as processed.
      processedPositions.add(currentPosition);
      processedPositions.add(sequenceLength - currentPosition - 1);
    }
  }

  return maximumSum; // Return the final computed maximum sum.
}