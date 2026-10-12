"use strict";

// This module provides a utility for parsing input data from standard input.
var INPUT_PARSER = (function() {
  /**
   * Creates a new input parser instance.
   * @param {string} sourceText - The raw input string.
   * @returns {InputReader} An instance of InputReader.
   */
  function createParser(sourceText) {
    return new InputReader(sourceText);
  }

  /**
   * Constructor for the InputReader class.
   * @param {string} rawInput - The complete input string.
   */
  function InputReader(rawInput) {
    // Store input lines, trimmed and split by newline.
    this._lines = rawInput.trim().split("\n");
    // Initialize current line index.
    this._currentLineIndex = 0;
  }

  /**
   * Reads the next item from the current line. Items are processed in reverse order on the line.
   * If the current line is exhausted, it moves to the next line.
   * @param {boolean} [asString=false] - If true, returns the item as a string; otherwise, as a number.
   * @returns {string|number} The extracted item.
   */
  InputReader.prototype.readNextItem = function(asString) {
    var currentLines = this._lines;
    var lineIdx = this._currentLineIndex;
    var extractedItem;

    // If the current line hasn't been split into parts yet, do so.
    // Items are processed in reverse order, so we reverse the split array.
    if (typeof currentLines[lineIdx] === "string") {
      currentLines[lineIdx] = currentLines[lineIdx].split(" ").reverse();
    }

    // Pop the last item (which is the first item in original order) from the current line's array.
    extractedItem = currentLines[lineIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!currentLines[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return as string or convert to number.
    return asString ? extractedItem : +extractedItem;
  };

  /**
   * Reads an entire line and splits it into items.
   * @param {boolean} [returnStrings=false] - If true, returns items as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of items from the line.
   */
  InputReader.prototype.readLineItems = function(returnStrings) {
    // Get the current line, split by space, and then advance the line index.
    var lineParts = this._lines[this._currentLineIndex++].split(" ");

    // Return as strings or map to numbers.
    return returnStrings ? lineParts : lineParts.map(val => +val);
  };

  /**
   * Reads 'numRows' lines and parses them as a matrix.
   * @param {number} numRows - The number of rows to read.
   * @param {boolean} [asStrings=false] - If true, returns matrix elements as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} A 2D array (matrix).
   */
  InputReader.prototype.readMatrix = function(numRows, asStrings) {
    // Extract 'numRows' lines, split each into parts.
    var matrixRows = this._lines
      .slice(this._currentLineIndex, (this._currentLineIndex += numRows))
      .map(line => line.split(" "));

    // Return as strings or map all elements to numbers.
    return asStrings ? matrixRows : matrixRows.map(row => row.map(val => +val));
  };

  /**
   * Reads 'count' lines and parses them as a flat array of numbers.
   * @param {number} count - The number of lines to read.
   * @param {boolean} [asStringArray=false] - If true, returns lines as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of items.
   */
  InputReader.prototype.readLinesAsNumbers = function(count, asStringArray) {
    // Extract 'count' lines.
    var rawLines = this._lines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += count)
    );

    // Return as strings or map all lines to numbers.
    return asStringArray ? rawLines : rawLines.map(val => +val);
  };

  return createParser;
})();

// Create an input reader instance by reading from standard input.
var inputReaderInstance = INPUT_PARSER(
  require("fs").readFileSync("/dev/stdin", "utf8")
);

/**
 * Creates a multi-dimensional array initialized with a given value.
 * The dimensions are passed as additional arguments.
 * Example: createMultiDimArray(0, 2, 3) creates a 2x3 array filled with 0s.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var dimensions = arguments;
  var dimCount = dimensions.length;
  var arrayCreationString =
    "Array(dimensions[" +
    --dimCount +
    "]).fill(0).map(x=>{return " +
    initialValue +
    ";})";

  // Build the string for nested Array.map calls.
  while (--dimCount) {
    arrayCreationString =
      "Array(dimensions[" + dimCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
  }

  // Use eval to dynamically create the multi-dimensional array.
  return eval(arrayCreationString);
}

// A large number constant, often used as an "infinity" placeholder.
var HUGE_NUMBER_THRESHOLD = 1e15;

// Execute the main logic and print the result to console.
console.log(mainLogic());

/**
 * The main function containing the problem's solution logic.
 * @returns {string} The final result formatted as a string.
 */
function mainLogic() {
  // Read the total number of items (N).
  var itemCount = inputReaderInstance.readNextItem();
  // Read the array of items.
  var dataArray = inputReaderInstance.readLineItems();

  // Create a frequency map for items, initialized to zeros.
  // The size of the map is 'itemCount' because item values are 1-indexed up to N.
  var frequencyMap = createMultiDimArray(0, itemCount);

  // Populate the frequency map.
  // For each item 'dataArray[idx]', increment the count at index 'dataArray[idx] - 1'.
  for (var idx = 0; idx < itemCount; idx++) {
    frequencyMap[dataArray[idx] - 1]++;
  }

  // Collect all non-zero frequencies into a new array.
  var uniqueFrequencies = [];
  for (var jdx = 0; jdx < itemCount; jdx++) {
    if (frequencyMap[jdx]) {
      uniqueFrequencies.push(frequencyMap[jdx]);
    }
  }

  // Sort the unique frequencies in descending order.
  uniqueFrequencies.sort((freqA, freqB) => freqB - freqA);

  // Calculate prefix sums of the *reversed* sorted frequencies.
  // This effectively gives suffix sums of the original sorted array.
  // `prefixSums[kdx]` will store the sum of the `kdx` smallest frequencies.
  var prefixSums = Array(uniqueFrequencies.length + 1);
  prefixSums[0] = 0; // Base case for prefix sum.
  for (var kdx = 1; kdx <= uniqueFrequencies.length; kdx++) {
    prefixSums[kdx] =
      prefixSums[kdx - 1] + uniqueFrequencies[uniqueFrequencies.length - kdx];
  }

  // Initialize the results array. The first element (for k=1) is always N.
  var results = [itemCount];

  // Iterate for k from 2 to N.
  for (var currentK = 2; currentK <= itemCount; currentK++) {
    // If there are fewer unique frequencies than 'currentK', it's impossible to form 'currentK' groups.
    if (uniqueFrequencies.length < currentK) {
      results.push(0);
    } else {
      // Calculate the maximum possible value for the current 'currentK'.
      // This is the minimum of:
      // 1. The maximum possible average (N / currentK, floored).
      // 2. The sum of the 'currentK' smallest frequencies (from the prefixSums array).
      var maximumPossible = Math.min(
        Math.floor(itemCount / currentK),
        prefixSums[uniqueFrequencies.length - currentK + 1]
      );
      results.push(maximumPossible);
    }
  }

  // Join the results with newline characters and return.
  return results.join("\n");
}
