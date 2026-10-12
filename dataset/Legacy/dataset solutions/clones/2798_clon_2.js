var DATA_PARSER = (function() {
  // This function serves as a factory to create an input processing instance.
  function createParser(rawInputString) {
    return new InputProcessor(rawInputString);
  }

  // The InputProcessor class manages the state of the input lines and current position.
  function InputProcessor(initialString) {
    // Internal storage for all input lines, trimmed and split by newline.
    this._sourceLines = initialString.trim().split("\n");
    // Keeps track of the current line being processed.
    this._currentLineIndex = 0;
  }

  /**
   * Reads and extracts the next token from the current input line.
   * Tokens are assumed to be space-separated. The method reads tokens from right-to-left
   * after reversing the line's token array, effectively processing them left-to-right.
   * @param {boolean} asString - If true, the token is returned as a string; otherwise, it's converted to a number.
   * @returns {string|number} The extracted token.
   */
  InputProcessor.prototype.readNextToken = function(asString) {
    var linesArray = this._sourceLines;
    var lineIdx = this._currentLineIndex;
    var tokenVal;

    // If the current line is still a raw string, split it into tokens and reverse for efficient popping.
    if (typeof linesArray[lineIdx] === "string") {
      linesArray[lineIdx] = linesArray[lineIdx].split(" ").reverse();
    }

    // Retrieve the last element (which was originally the first) from the current line's token array.
    tokenVal = linesArray[lineIdx].pop();

    // If the current line is now empty after popping, advance to the next line.
    if (!linesArray[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return the token, optionally converting it to a number.
    return asString ? tokenVal : +tokenVal;
  };

  /**
   * Reads the entire current line, splits it into tokens, and advances the line index.
   * @param {boolean} asString - If true, tokens are returned as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array containing all tokens from the line.
   */
  InputProcessor.prototype.readLineTokens = function(asString) {
    // Get the current line, split it by spaces, and then increment the line index.
    var lineTokens = this._sourceLines[this._currentLineIndex++].split(" ");
    // Return the tokens, mapping them to numbers if 'asString' is falsy.
    return asString ? lineTokens : lineTokens.map(item => +item);
  };

  /**
   * Reads a specified number of lines, treating each as a row of space-separated tokens,
   * effectively forming a 2D matrix.
   * @param {number} numLines - The count of lines to read for the matrix.
   * @param {boolean} asString - If true, tokens are returned as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
   */
  InputProcessor.prototype.readMatrix = function(numLines, asString) {
    // Extract a slice of lines and map each line string to an array of its tokens.
    var resultMatrix = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines).map(lineStr => lineStr.split(" "));
    // If not returning as strings, map all inner tokens to numbers.
    return asString ? resultMatrix : resultMatrix.map(row => row.map(item => +item));
  };

  /**
   * Reads a specified number of lines directly into an array.
   * @param {number} numLines - The count of lines to read.
   * @param {boolean} asString - If true, lines are returned as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of lines.
   */
  InputProcessor.prototype.readLines = function(numLines, asString) {
    // Extract a slice of lines from the source.
    var lineCollection = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
    // Return the lines, converting them to numbers if 'asString' is falsy.
    return asString ? lineCollection : lineCollection.map(item => +item);
  };

  return createParser; // Expose the factory function for external use.
})();

// Initialize the input reader by parsing content from standard input.
var inputReader = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array initialized with a specific value.
 * The dimensions are provided as subsequent arguments.
 * @param {*} initialValue - The value to fill all elements of the array with.
 * @param {...number} dimensions - The sizes of each dimension (e.g., multiDimArray(0, 2, 3) for a 2x3 array).
 * @returns {Array} The newly created multi-dimensional array.
 */
function multiDimArray(initialValue) {
  var argsList = arguments;
  var dimCount = argsList.length;
  // Construct the JavaScript code string to create the array.
  // Start with the innermost dimension.
  var arrayCreationCode = "Array(argsList[" + --dimCount + "]).fill(0).map(_ => {return " + initialValue + ";})";
  // Wrap with outer dimensions iteratively.
  while (--dimCount) {
    arrayCreationCode = "Array(argsList[" + dimCount + "]).fill(0).map(_ => " + arrayCreationCode + ")";
  }
  // Evaluate the generated code string to produce the array.
  return eval(arrayCreationCode);
}

// Execute the main processing logic and print its result to the console.
console.log(processInputAndDetermineOutcome());

/**
 * The primary function that processes the input according to the problem's logic.
 * It reads a single four-character string and checks for any consecutive identical characters.
 * @returns {string} "Bad" if any two adjacent characters are the same, otherwise "Good".
 */
function processInputAndDetermineOutcome() {
  // Read a single token from the input, ensuring it's treated as a string.
  var inputSequence = inputReader.readNextToken(true);

  // Check for consecutive identical characters within the four-character string.
  if (inputSequence[0] === inputSequence[1] ||
      inputSequence[1] === inputSequence[2] ||
      inputSequence[2] === inputSequence[3]) {
    return "Bad"; // If any pair is identical, the outcome is "Bad".
  } else {
    return "Good"; // Otherwise, the outcome is "Good".
  }
}
