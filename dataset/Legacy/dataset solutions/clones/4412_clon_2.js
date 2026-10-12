var INPUT_PARSER = (function() {
  /**
   * Factory function to create an input parser instance.
   * @param {string} inputString - The raw string content to be parsed.
   * @returns {InputReader} A new instance of the InputReader.
   */
  function createParser(inputString) {
    return new InputReader(inputString);
  }

  /**
   * Constructor for the InputReader class.
   * Initializes the internal buffer and line pointer.
   * @param {string} rawInput - The complete raw input string.
   */
  function InputReader(rawInput) {
    // Store the input as an array of lines, after trimming whitespace.
    this.lineBuffer = rawInput.trim().split("\n");
    // Initialize the pointer to the current line being processed.
    this.currentLineIndex = 0;
  }

  /**
   * Reads a single token (word or number) from the current line.
   * If the current line is exhausted, it advances to the next line.
   * @param {boolean} asString - If true, returns the token as a string; otherwise, attempts to convert to a number.
   * @returns {string|number} The parsed token.
   */
  InputReader.prototype.readSingle = function(asString) {
    var bufferedLines = this.lineBuffer;
    var linePointer = this.currentLineIndex;
    var extractedValue;

    // If the current line has not yet been split into individual tokens, do so.
    // The tokens are reversed to allow efficient popping from the end.
    if (typeof bufferedLines[linePointer] === "string") {
      bufferedLines[linePointer] = bufferedLines[linePointer].split(" ").reverse();
    }

    // Extract the last token from the current line's array of tokens.
    extractedValue = bufferedLines[linePointer].pop();

    // If the current line is now empty after popping, increment the line pointer.
    if (!bufferedLines[linePointer].length) {
      this.currentLineIndex++;
    }

    // Return the value, converting to a number if 'asString' is false.
    return asString ? extractedValue : +extractedValue;
  };

  /**
   * Reads an entire line of space-separated tokens.
   * Advances the line pointer to the next line.
   * @param {boolean} asString - If true, returns tokens as strings; otherwise, attempts to convert to numbers.
   * @returns {Array<string|number>} An array containing all tokens from the line.
   */
  InputReader.prototype.readLine = function(asString) {
    // Get the current line, split it by spaces, and then advance the line pointer.
    var currentLineParts = this.lineBuffer[this.currentLineIndex++].split(" ");
    // Map the parts to numbers if 'asString' is false, otherwise return as strings.
    return asString ? currentLineParts : currentLineParts.map(itemStr => +itemStr);
  };

  /**
   * Reads a block of 'numLines' lines, treating each as a row in a matrix.
   * Each line is split into space-separated tokens.
   * Advances the line pointer by 'numLines'.
   * @param {number} numLines - The number of lines to read for the matrix.
   * @param {boolean} asString - If true, returns tokens as strings; otherwise, attempts to convert to numbers.
   * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
   */
  InputReader.prototype.readMatrix = function(numLines, asString) {
    // Extract the specified number of lines and split each into tokens.
    var resultLines = this.lineBuffer.slice(this.currentLineIndex, this.currentLineIndex += numLines).map(lineContent => lineContent.split(" "));
    // If 'asString' is false, convert all tokens in the matrix to numbers.
    return asString ? resultLines : resultLines.map(lineContent => lineContent.map(elementStr => +elementStr));
  };

  /**
   * Reads a specified number of raw lines without splitting them into tokens.
   * Advances the line pointer by 'numLines'.
   * @param {number} numLines - The number of lines to read.
   * @param {boolean} asString - If true, returns lines as strings; otherwise, attempts to convert each line to a number.
   * @returns {Array<string|number>} An array of raw line contents.
   */
  InputReader.prototype.readLines = function(numLines, asString) {
    // Extract the specified number of lines.
    var resultLines = this.lineBuffer.slice(this.currentLineIndex, this.currentLineIndex += numLines);
    // If 'asString' is false, convert each line to a number.
    return asString ? resultLines : resultLines.map(lineText => +lineText);
  };

  return createParser;
})();

/**
 * Creates a 2D array (matrix) of specified dimensions, initialized with zeros.
 * @param {number} matrixHeight - The number of rows for the matrix.
 * @param {number} matrixWidth - The number of columns for each row.
 * @returns {Array<Array<number>>} A matrix filled with zero values.
 */
function createZeroMatrix(matrixHeight, matrixWidth) {
  return Array(matrixHeight).fill(0).map(_ => Array(matrixWidth).fill(0));
}

// Initialize the input parser by reading the entire content of standard input.
var inputSource = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Define a constant for modulo operations, commonly used in competitive programming.
var MODULO_CONSTANT = 1e9 + 7;

// Execute the main problem-solving function and print its return value to the console.
console.log(solveProblem());

/**
 * The primary function containing the problem's core logic.
 * It reads two strings and calculates a specific value based on their character comparisons.
 * @returns {number} The final calculated answer.
 */
function solveProblem() {
  // Read the length of the input strings.
  var inputLength = inputSource.readSingle();
  // Read the first string.
  var firstString = inputSource.readSingle(true);
  // Read the second string.
  var secondString = inputSource.readSingle(true);

  // Initialize the final answer with a base value.
  var finalAnswer = 3;
  // Flag to track if the last compared characters were different (1) or same (0).
  var lastWasDifferent = 0;
  // Loop index, initialized based on the first character comparison.
  var loopIndex = 1;

  // Check the very first characters of the two strings.
  if (firstString[0] !== secondString[0]) {
    finalAnswer = 6; // If different, update the base answer.
    lastWasDifferent = 1; // Set the flag to indicate difference.
    loopIndex = 2; // Start the main loop from the second pair of characters.
  }

  // Iterate through the strings from the determined starting point.
  for (; loopIndex < inputLength; loopIndex++) {
    // If the current characters at 'loopIndex' are identical.
    if (firstString[loopIndex] === secondString[loopIndex]) {
      // If the previous characters were NOT different (i.e., they were the same).
      if (!lastWasDifferent) {
        finalAnswer *= 2; // Multiply the answer by 2.
      }
      lastWasDifferent = 0; // Reset the flag as current characters are the same.
    } else { // If the current characters at 'loopIndex' are different.
      loopIndex++; // Advance the loop index by an additional step (processing two characters at once).
      // If the previous characters WERE different.
      if (lastWasDifferent) {
        finalAnswer *= 3; // Multiply the answer by 3.
      } else { // If the previous characters were NOT different (i.e., they were the same).
        finalAnswer *= 2; // Multiply the answer by 2.
      }
      lastWasDifferent = 1; // Set the flag to indicate current characters are different.
    }
    // Apply the modulo operation to keep the answer within bounds.
    finalAnswer %= MODULO_CONSTANT;
  }

  return finalAnswer;
}
