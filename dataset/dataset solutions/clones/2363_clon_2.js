"use strict";

// This module provides utilities for parsing input from a source string.
const INPUT_PARSER = (function () {
  /**
   * Creates a new input parser instance.
   * @param {string} sourceText - The raw input string.
   * @returns {InputSource} A new input source object.
   */
  function createParser(sourceText) {
    return new InputSource(sourceText);
  }

  /**
   * Represents an input source, allowing sequential reading of lines and values.
   * @param {string} sourceText - The raw input string.
   */
  function InputSource(sourceText) {
    // Store lines after trimming and splitting.
    this._lines = sourceText.trim().split("\n");
    // Keep track of the current line being processed.
    this._currentLineIndex = 0;
  }

  /**
   * Extracts the next value from the current line.
   * If the current line is exhausted, it moves to the next.
   * @param {boolean} [asString=false] - If true, returns the value as a string; otherwise, as a number.
   * @returns {string|number} The extracted value.
   */
  InputSource.prototype.extractNextValue = function (asString) {
    const currentLineParts = this._lines;
    const lineIdx = this._currentLineIndex;
    let extractedPart;

    // If the current line hasn't been split into parts yet, do it.
    if (typeof currentLineParts[lineIdx] === "string") {
      currentLineParts[lineIdx] = currentLineParts[lineIdx].split(" ").reverse();
    }

    // Pop the last element (which is the first in original order due to reverse).
    extractedPart = currentLineParts[lineIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!currentLineParts[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return as string or convert to number.
    return asString ? extractedPart : +extractedPart;
  };

  /**
   * Reads an entire line from the input source.
   * @param {boolean} [asString=false] - If true, returns parts as strings; otherwise, as numbers.
   * @returns {string[]|number[]} An array of values from the line.
   */
  InputSource.prototype.readNextLine = function (asString) {
    const lineContent = this._lines[this._currentLineIndex++].split(" ");
    return asString ? lineContent : lineContent.map((item) => +item);
  };

  /**
   * Reads a specified number of lines as a matrix.
   * @param {number} numRows - The number of rows to read.
   * @param {boolean} [asString=false] - If true, returns elements as strings; otherwise, as numbers.
   * @returns {string[][]|number[][]} A 2D array (matrix) of values.
   */
  InputSource.prototype.readMatrix = function (numRows, asString) {
    const matrixRows = this._lines
      .slice(this._currentLineIndex, (this._currentLineIndex += numRows))
      .map((rowStr) => rowStr.split(" "));
    return asString
      ? matrixRows
      : matrixRows.map((row) => row.map((item) => +item));
  };

  /**
   * Reads a specified number of raw lines.
   * @param {number} numRows - The number of lines to read.
   * @param {boolean} [asString=false] - If true, returns lines as strings; otherwise, attempts to convert to number.
   * @returns {string[]|number[]} An array of lines.
   */
  InputSource.prototype.readLines = function (numRows, asString) {
    const rawLines = this._lines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += numRows)
    );
    return asString ? rawLines : rawLines.map((item) => +item);
  };

  return createParser;
})();

// Initialize the input reader by reading from standard input.
const inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a given value.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., 2, 3 for a 2x3 array).
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  const argsList = arguments;
  let argCount = argsList.length;
  let arrayCreationString =
    "Array(argsList[" +
    --argCount +
    "]).fill(0).map(x=>{return " +
    initialValue +
    ";})";
  while (--argCount) {
    arrayCreationString =
      "Array(argsList[" + argCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

// Output the result of the main processing function.
console.log(processInput());

/**
 * Main function to process the input and determine the result.
 * @returns {number} The calculated result based on input.
 */
function processInput() {
  // Read the first line of data.
  let dataLine = inputReader.readNextLine();
  // Read the second line of data (this line is intentionally duplicated in the original).
  dataLine = inputReader.readNextLine();

  // Check the second element of the last read line.
  return dataLine[1] === 1 ? 1 : 0;
}
