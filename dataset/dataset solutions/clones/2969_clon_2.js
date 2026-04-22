// This module provides utilities for parsing input data.
const DATA_PARSER = (function () {
  /**
   * Initializes a new input reader instance.
   * @param {string} sourceText The raw input string.
   * @returns {InputReader} A new InputReader object.
   */
  function createParser(sourceText) {
    return new InputReader(sourceText);
  }

  /**
   * Manages reading lines and tokens from an input string.
   * @param {string} sourceText The complete text to be parsed.
   */
  function InputReader(sourceText) {
    // Store lines after trimming whitespace and splitting by newline.
    this._sourceLines = sourceText.trim().split("\n");
    // Keep track of the current line index being processed.
    this._currentLineIndex = 0;
  }

  /**
   * Extracts a single value (token) from the current line.
   * If the line is not yet processed, it's split into tokens and reversed.
   * @param {boolean} returnAsString If true, returns the value as a string; otherwise, converts to a number.
   * @returns {string|number} The extracted value.
   */
  InputReader.prototype.extractValue = function (returnAsString) {
    let lineContent = this._sourceLines;
    let currentLinePos = this._currentLineIndex;
    let extractedToken;

    // If the current line is a string, process it into a reversable array of tokens.
    if (typeof lineContent[currentLinePos] === "string") {
      lineContent[currentLinePos] = lineContent[currentLinePos].split(" ").reverse();
    }

    // Pop the last token from the current line's token array.
    extractedToken = lineContent[currentLinePos].pop();

    // If the current line is now empty, advance to the next line.
    if (!lineContent[currentLinePos].length) {
      this._currentLineIndex++;
    }

    // Return the token as a string or convert it to a number.
    return returnAsString ? extractedToken : Number(extractedToken);
  };

  /**
   * Reads an entire line, splits it into tokens, and advances the line pointer.
   * @param {boolean} returnAsString If true, returns tokens as strings; otherwise, converts to numbers.
   * @returns {Array<string|number>} An array of tokens from the line.
   */
  InputReader.prototype.readListOfTokens = function (returnAsString) {
    // Get the current line, split it by space, and then advance the line index.
    const tokensOnLine = this._sourceLines[this._currentLineIndex++].split(" ");
    // Return tokens as strings or convert them to numbers.
    return returnAsString ? tokensOnLine : tokensOnLine.map(item => Number(item));
  };

  /**
   * Reads multiple lines, treating each as a row of space-separated tokens, forming a matrix.
   * @param {number} numRows The number of rows to read.
   * @param {boolean} returnAsString If true, returns all tokens as strings; otherwise, converts to numbers.
   * @returns {Array<Array<string|number>>} A 2D array (matrix) of tokens.
   */
  InputReader.prototype.readMatrixOfTokens = function (numRows, returnAsString) {
    // Slice 'numRows' from the source lines, advance the index, and split each line into tokens.
    const rowData = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows)
                                     .map(rowLine => rowLine.split(" "));
    // Return as strings or convert all elements in the matrix to numbers.
    return returnAsString ? rowData : rowData.map(row => row.map(item => Number(item)));
  };

  /**
   * Reads multiple raw lines without splitting them into tokens.
   * Useful for lines that are single values or need custom parsing.
   * @param {number} numRows The number of raw lines to read.
   * @param {boolean} returnAsString If true, returns lines as strings; otherwise, attempts to convert each line to a number.
   * @returns {Array<string|number>} An array of raw lines.
   */
  InputReader.prototype.readRawRows = function (numRows, returnAsString) {
    // Slice 'numRows' from the source lines and advance the index.
    const rawRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows);
    // Return as strings or convert all elements in the rows to numbers (assuming single number per line).
    return returnAsString ? rawRows : rawRows.map(item => Number(item));
  };

  return createParser;
})();

// Initialize the input processing system by reading from standard input.
const inputProcessor = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically constructs a multi-dimensional array with a specified initial value.
 * The dimensions are passed as subsequent arguments.
 * @param {*} initialValue The value to fill the innermost array with.
 * @param {...number} dimensions The dimensions of the array (e.g., 2, 3 for a 2x3 array).
 * @returns {Array} The newly created multi-dimensional array.
 */
function buildMultiDimArray(initialValue) {
  const dimensionArguments = arguments;
  let dimensionCount = dimensionArguments.length;
  // Start building the array creation code from the innermost dimension.
  let arrayCreationCode = `Array(dimensionArguments[${--dimensionCount}]).fill(0).map( _ => { return ${initialValue}; })`;

  // Wrap the array creation code for each remaining dimension, working outwards.
  while (--dimensionCount) {
    arrayCreationCode = `Array(dimensionArguments[${dimensionCount}]).fill(0).map( _ => ${arrayCreationCode} )`;
  }
  // Evaluate the generated code string to create the array dynamically.
  return eval(arrayCreationCode);
}

// Output the result of the main solution execution to the console.
console.log(executeSolution());

/**
 * Implements the primary logic to generate a sequence based on input parameters.
 * This function reads two integer parameters, 'm' and 'k', and constructs a specific sequence.
 * @returns {string} A space-separated string representing the generated sequence, or -1 if conditions are not met.
 */
function executeSolution() {
  // Read the first integer parameter (m), representing a dimension.
  const dimensionParam = inputProcessor.extractValue();
  // Read the second integer parameter (k), representing a target value.
  const targetValueParam = inputProcessor.extractValue();

  // Handle specific edge cases for input values based on problem constraints.
  if (targetValueParam >= (1 << dimensionParam)) {
    return -1; // Target value is too large for the given dimension (2^m).
  }
  if (targetValueParam && dimensionParam === 1) {
    return -1; // Special case: if k is non-zero and m is 1, return -1.
  }
  if (targetValueParam === 0) {
    return handleZeroTarget(dimensionParam); // Delegate to a helper function for the k = 0 case.
  }

  // Initialize an array to store the generated sequence of numbers.
  const solutionSequence = [];
  // Calculate the total number of elements expected in the sequence (2^m).
  const totalElementsCount = 1 << dimensionParam;

  // First loop: generate numbers counting up from 0 to (2^m - 1),
  // skipping the target value `k` when encountered.
  for (let loopIndex = 0, currentNumber = 0; loopIndex < totalElementsCount - 1; loopIndex++, currentNumber++) {
    if (currentNumber === targetValueParam) {
      currentNumber++; // Increment `currentNumber` to effectively skip `targetValueParam`.
    }
    solutionSequence.push(currentNumber);
  }
  solutionSequence.push(targetValueParam); // Add the `targetValueParam` at the end of the first half.

  // Second loop: generate numbers counting down from the last `currentNumber` (which is 2^m - 1 or 2^m),
  // again skipping the target value `k`.
  for (let loopIndex = 0; loopIndex < totalElementsCount - 1; loopIndex++) {
    currentNumber--; // Decrement `currentNumber`.
    if (currentNumber === targetValueParam) {
      currentNumber--; // Decrement again to skip `targetValueParam` if it's the next value.
    }
    solutionSequence.push(currentNumber);
  }
  solutionSequence.push(targetValueParam); // Add the `targetValueParam` at the end of the second half.

  // Join all elements of the `solutionSequence` with a space and return the resulting string.
  return solutionSequence.join(" ");
}

/**
 * Generates a specific sequence when the target value (k) is zero.
 * This sequence is formed by numbers from 0 up to (2^(m+1) - 1),
 * where each number is bit-shifted right by 1 (equivalent to integer division by 2).
 * @param {number} dimensionParam The dimension parameter (m) for this specific case.
 * @returns {string} A space-separated string representing the sequence.
 */
function handleZeroTarget(dimensionParam) {
  // Calculate the total number of elements for this specific case, which is 2^(m+1).
  const totalElementsForZero = 1 << (dimensionParam + 1);
  const resultNumbers = [];

  // Populate the array with numbers where each number is `idx` shifted right by 1 bit (i.e., `idx / 2`).
  for (let idx = 0; idx < totalElementsForZero; idx++) {
    resultNumbers[idx] = idx >> 1;
  }
  return resultNumbers.join(" "); // Join and return the sequence.
}