var INPUT_PARSER = (function() {
  /**
   * Factory function to create a new data parser instance.
   * @param {string} rawInputString - The raw input string to parse.
   * @returns {DataProcessor} A new DataProcessor instance.
   */
  function createParser(rawInputString) {
    return new DataProcessor(rawInputString);
  }

  /**
   * DataProcessor class for parsing input strings.
   * @class
   * @param {string} initialString - The string content to be processed.
   */
  function DataProcessor(initialString) {
    // Store the input string, split by newlines and trimmed.
    this._sourceLines = initialString.trim().split("\n");
    // Keep track of the current line being processed.
    this._currentLineIndex = 0;
  }

  /**
   * Reads the next token from the current line. If the line is exhausted, moves to the next.
   * Tokens are read in reverse order from the line.
   * @param {boolean} [returnAsString=false] - If true, returns the token as a string; otherwise, as a number.
   * @returns {string|number} The next token.
   */
  DataProcessor.prototype.readNextToken = function(returnAsString) {
    var currentLines = this._sourceLines;
    var linePointer = this._currentLineIndex;
    var extractedToken;

    // If the current line hasn't been split into tokens yet, do so.
    if (typeof currentLines[linePointer] === "string") {
      currentLines[linePointer] = currentLines[linePointer].split(" ").reverse();
    }

    // Pop the last token (which is the first in original order due to reverse).
    extractedToken = currentLines[linePointer].pop();

    // If the current line is now empty, advance to the next line.
    if (!currentLines[linePointer].length) {
      this._currentLineIndex++;
    }

    // Return the token, optionally as a string.
    return returnAsString ? extractedToken : +extractedToken;
  };

  /**
   * Reads all tokens from the current line and advances the line pointer.
   * @param {boolean} [returnAsStrings=false] - If true, returns tokens as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of tokens from the line.
   */
  DataProcessor.prototype.readLineTokens = function(returnAsStrings) {
    var lineContent = this._sourceLines[this._currentLineIndex++].split(" ");
    return returnAsStrings ? lineContent : lineContent.map(item => +item);
  };

  /**
   * Reads a matrix of 'n' lines, splitting each line into tokens.
   * @param {number} numRows - The number of rows (lines) to read.
   * @param {boolean} [returnAsStrings=false] - If true, returns tokens as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
   */
  DataProcessor.prototype.readMatrix = function(numRows, returnAsStrings) {
    var matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows).map(line => line.split(" "));
    return returnAsStrings ? matrixRows : matrixRows.map(row => row.map(element => +element));
  };

  /**
   * Reads 'n' lines as a simple array.
   * @param {number} numLines - The number of lines to read.
   * @param {boolean} [returnAsStrings=false] - If true, returns lines as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of lines.
   */
  DataProcessor.prototype.readLines = function(numLines, returnAsStrings) {
    var lineArray = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
    return returnAsStrings ? lineArray : lineArray.map(item => +item);
  };

  return createParser;
})();

// Initialize the input data processor by reading from standard input.
var inputData = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a given value.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., 2, 3 for a 2x3 array).
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var args = arguments;
  var argCount = args.length;
  var arrayCreationString = "Array(args[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
  while (--argCount) {
    arrayCreationString = "Array(args[" + argCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

// Output the result of the main processing function.
console.log(processStrings());

/**
 * Main function to process a collection of strings and calculate a specific count.
 * The algorithm counts pairs of 'A' and 'B' characters within strings,
 * and then combines counts based on string start/end characters.
 * @returns {number} The final calculated count.
 */
function processStrings() {
  // Read the number of strings from input.
  var numStrings = inputData.readNextToken();
  // Read all strings, keeping them as strings (not converting to numbers).
  var stringCollection = inputData.readLines(numStrings, true);

  // Counters for strings ending in 'A', starting with 'B', and starting with 'B' and ending with 'A'.
  var endsInA = 0;
  var startsInB = 0;
  var startsB_endsA = 0;
  // Accumulator for the total number of 'AB' pairs.
  var totalPairs = 0;

  // Iterate through each string in the collection.
  for (var idx = 0; idx < numStrings; idx++) {
    var currentChar = stringCollection[idx][0]; // Start with the first character of the current string.

    // Iterate through characters of the current string to find 'AB' pairs.
    for (var charIdx = 1; charIdx < stringCollection[idx].length; charIdx++) {
      // If the previous character was 'A' and the current is 'B', increment totalPairs.
      if (currentChar === "A" && stringCollection[idx][charIdx] === "B") {
        totalPairs++;
      }
      // Update currentChar for the next iteration.
      currentChar = stringCollection[idx][charIdx];
    }

    // Check the start and end characters of the current string for specific patterns.
    if (stringCollection[idx][0] === "B") {
      if (stringCollection[idx][stringCollection[idx].length - 1] === "A") {
        startsB_endsA++; // String starts with 'B' and ends with 'A'.
      } else {
        startsInB++; // String starts with 'B' but does not end with 'A'.
      }
    } else if (stringCollection[idx][stringCollection[idx].length - 1] === "A") {
      endsInA++; // String ends with 'A' but does not start with 'B'.
    }
  }

  // Calculate the minimum and maximum of 'endsInA' and 'startsInB'.
  var minimumCount = Math.min(endsInA, startsInB);
  var maximumCount = Math.max(endsInA, startsInB);

  // Adjust totalPairs based on the collected counts.
  if (maximumCount) { // If either endsInA or startsInB is non-zero.
    if (startsB_endsA) {
      totalPairs += minimumCount + startsB_endsA;
    } else {
      totalPairs += minimumCount;
    }
  } else { // If both endsInA and startsInB are zero.
    totalPairs += startsB_endsA - 1;
  }

  return totalPairs;
}
