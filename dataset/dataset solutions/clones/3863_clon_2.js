var INPUT_PARSER = (function() {
  /**
   * Creates a new input reader instance.
   * @param {string} inputStringContent - The raw string content to parse.
   * @returns {InputReader} A new InputReader object.
   */
  function createInputReader(inputStringContent) {
    return new InputReader(inputStringContent);
  }

  /**
   * Represents an input reader that processes lines and tokens.
   * @param {string} inputStringContent - The raw string content.
   */
  function InputReader(inputStringContent) {
    // Store all input lines, trimmed and split by newline.
    this._sourceLines = inputStringContent.trim().split('\n');
    // Current line index being processed.
    this._currentLineIndex = 0;
  }

  /**
   * Reads a single token from the current line.
   * If the current line hasn't been split into tokens yet, it splits it and reverses the order.
   * @param {boolean} asStringFlag - If true, returns the token as a string; otherwise, as a number.
   * @returns {string|number} The extracted token.
   */
  InputReader.prototype.readSingleValue = function(asStringFlag) {
    var lineData = this._sourceLines;
    var currentIdx = this._currentLineIndex;
    var extractedValue;

    // If the current line is still a single string, split it into tokens and reverse.
    // This allows reading tokens from right to left using pop().
    if (typeof lineData[currentIdx] === 'string') {
      lineData[currentIdx] = lineData[currentIdx].split(' ').reverse();
    }

    // Extract the last token from the current line's array.
    extractedValue = lineData[currentIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!lineData[currentIdx].length) {
      this._currentLineIndex++;
    }

    // Return the token as a string or convert it to a number.
    return asStringFlag ? extractedValue : +extractedValue;
  };

  /**
   * Reads an entire line of tokens.
   * @param {boolean} asStringFlag - If true, returns tokens as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of tokens from the line.
   */
  InputReader.prototype.readLineOfValues = function(asStringFlag) {
    // Get the current line, split by space, and then advance the line index.
    var lineTokens = this._sourceLines[this._currentLineIndex++].split(' ');
    // Return tokens as strings or convert them all to numbers.
    return asStringFlag ? lineTokens : lineTokens.map(item => +item);
  };

  /**
   * Reads a specified number of lines as a 2D array (matrix) of tokens.
   * @param {number} numberOfLines - The count of lines to read.
   * @param {boolean} asStringFlag - If true, returns tokens as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} A 2D array of tokens.
   */
  InputReader.prototype.readMatrixOfValues = function(numberOfLines, asStringFlag) {
    // Slice the required number of lines and advance the line index.
    var resultCollection = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numberOfLines);
    // Split each line into tokens.
    resultCollection = resultCollection.map(item => item.split(' '));
    // Return as strings or convert all tokens to numbers.
    return asStringFlag ? resultCollection : resultCollection.map(row => row.map(element => +element));
  };

  /**
   * Reads a specified number of lines as a 1D array of values.
   * @param {number} numberOfLines - The count of lines to read.
   * @param {boolean} asStringFlag - If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<string|number>} A 1D array of values.
   */
  InputReader.prototype.readArrayOfValues = function(numberOfLines, asStringFlag) {
    // Slice the required number of lines and advance the line index.
    var resultCollection = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numberOfLines);
    // Return as strings or convert all values to numbers.
    return asStringFlag ? resultCollection : resultCollection.map(item => +item);
  };

  // The IIFE returns the outer constructor function.
  return createInputReader;
})();

// Initialize the input handler by reading from standard input.
var inputHandler = INPUT_PARSER(require('fs').readFileSync('/dev/stdin', 'utf8'));

// Output the result of the main calculation function.
console.log(calculateSubarraySums());

/**
 * Main function to calculate the number of subarrays with a sum of zero.
 * This uses the prefix sum technique.
 * @returns {number} The total count of zero-sum subarrays.
 */
function calculateSubarraySums() {
  // Read the length of the array from the first line.
  var arrayLength = inputHandler.readSingleValue();
  // Read the array elements from the second line.
  var numberArray = inputHandler.readLineOfValues();

  // A Map to store the frequency of each prefix sum encountered.
  // Key: prefix sum, Value: count of times this sum has appeared.
  var prefixSumCounts = new Map();
  // Initialize with a prefix sum of 0 occurring once (for empty prefix).
  prefixSumCounts.set(0x0, 0x1);

  // Variable to store the final count of zero-sum subarrays.
  var finalResult = 0x0;
  // Variable to keep track of the current running prefix sum.
  var currentPrefixSum = 0x0;

  // Iterate through the input array to calculate prefix sums.
  for (var loopIndex = 0x0; loopIndex < arrayLength; loopIndex++) {
    // Add the current array element to the running prefix sum.
    currentPrefixSum += numberArray[loopIndex];

    // Check if the current prefix sum has been seen before.
    if (prefixSumCounts.get(currentPrefixSum)) {
      // If seen, increment its count.
      prefixSumCounts.set(currentPrefixSum, prefixSumCounts.get(currentPrefixSum) + 0x1);
    } else {
      // If not seen, add it to the map with a count of 1.
      prefixSumCounts.set(currentPrefixSum, 0x1);
    }
  }

  // Iterate through the counts of each prefix sum in the map.
  // For each prefix sum that appeared 'k' times, it means there are 'k C 2' pairs
  // of indices (i, j) such that prefixSum[i] == prefixSum[j].
  // Each such pair corresponds to a subarray with a sum of zero.
  prefixSumCounts.forEach(countValue => finalResult += countValue * (countValue - 0x1) / 0x2);

  // Return the total count of zero-sum subarrays.
  return finalResult;
}
