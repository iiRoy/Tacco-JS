/* This module provides utilities for parsing multi-line string input.
 * It's designed to read data from a source, line by line,
 * and convert segments into numerical or string formats.
 */
var INPUT_PROCESSOR = (function(){
  /**
   * Initializes a new input reader instance.
   * @param {string} sourceContent - The raw string content to be parsed.
   * @returns {LineInputHandler} A new handler object.
   */
  function createInputReader(sourceContent) {
    return new LineInputHandler(sourceContent);
  }

  /**
   * Handles the processing of input lines.
   * @class
   * @param {string} rawData - The complete raw input string.
   */
  function LineInputHandler(rawData) {
    // Stores each line of the input as an array of strings.
    this._inputSegments = rawData.trim().split("\n");
    // Keeps track of the current line being processed.
    this._processingPosition = 0;
  }

  /**
   * Extracts a single item from the current line.
   * If the line is exhausted, moves to the next.
   * @param {boolean} [asString=false] - If true, returns the item as a string; otherwise, as a number.
   * @returns {string|number} The extracted item.
   */
  LineInputHandler.prototype.fetchSingleItem = function(asString) {
    var currentLineParts = this._inputSegments;
    var lineCursor = this._processingPosition;
    var extractedValue;

    // Check if the current line needs to be split and reversed for easy popping.
    if (typeof currentLineParts[lineCursor] === "string") {
      currentLineParts[lineCursor] = currentLineParts[lineCursor].split(" ").reverse();
    }

    // Pop the last element from the current line's parts.
    extractedValue = currentLineParts[lineCursor].pop();

    // If the current line is now empty, advance to the next line.
    if (!currentLineParts[lineCursor].length) {
      this._processingPosition++;
    }

    // Return as string or convert to number based on the flag.
    return asString ? extractedValue : +extractedValue;
  };

  /**
   * Retrieves all items from the current line.
   * Advances the line pointer after reading.
   * @param {boolean} [keepOriginalType=false] - If true, returns items as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of items from the line.
   */
  LineInputHandler.prototype.retrieveLineItems = function(keepOriginalType) {
    // Get the current line, split by space, and advance the line pointer.
    var lineData = this._inputSegments[this._processingPosition++].split(" ");
    return keepOriginalType ? lineData : lineData.map(segmentText => +segmentText);
  };

  /**
   * Extracts a matrix (2D array) of data from multiple subsequent lines.
   * Advances the line pointer by the number of lines read.
   * @param {number} rowCount - The number of lines to read for the matrix.
   * @param {boolean} [keepOriginalType=false] - If true, returns items as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
   */
  LineInputHandler.prototype.extractMultipleRows = function(rowCount, keepOriginalType) {
    // Slice 'rowCount' lines, split each by space.
    var matrixResult = this._inputSegments
                         .slice(this._processingPosition, this._processingPosition += rowCount)
                         .map(segmentText => segmentText.split(" "));

    // Convert all elements to numbers if not keeping original type.
    return keepOriginalType ? matrixResult : matrixResult.map(row => row.map(itemString => +itemString));
  };

  /**
   * Reads a specified number of raw lines without splitting them into items.
   * Advances the line pointer by the number of lines read.
   * @param {number} numberOfLines - The count of lines to retrieve.
   * @param {boolean} [keepOriginalType=false] - If true, returns lines as strings; otherwise, attempts to convert to number.
   * @returns {Array<string|number>} An array of raw lines.
   */
  LineInputHandler.prototype.getRawLines = function(numberOfLines, keepOriginalType) {
    // Slice 'numberOfLines' directly.
    var rawLineData = this._inputSegments.slice(this._processingPosition, this._processingPosition += numberOfLines);
    return keepOriginalType ? rawLineData : rawLineData.map(itemString => +itemString);
  };

  return createInputReader;
})();

// Instantiate the input handler with content from standard input.
var dataHandler = INPUT_PROCESSOR(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array with a specified initial value.
 * The dimensions are passed as subsequent arguments.
 * @param {*} fillerContent - The value to fill the innermost array elements with.
 * @param {...number} dimensions - The sizes of each dimension, from outermost to innermost.
 * @returns {Array} The dynamically created multi-dimensional array.
 */
function generateNestedArray(fillerContent) {
  var argumentList = arguments;
  var dimCount = argumentList.length;
  // Start building the array creation code from the innermost dimension.
  var dynamicCode = "Array(argumentList[" + --dimCount + "]).fill(0).map(x=>{return " + fillerContent + ";})";

  // Wrap with Array.map for each remaining dimension.
  while (--dimCount) {
    dynamicCode = "Array(argumentList[" + dimCount + "]).fill(0).map(x=>" + dynamicCode + ")";
  }
  // Evaluate the constructed string to create the array.
  return eval(dynamicCode);
}

// Output the result of the main calculation function.
console.log(determineBestOutcome());

/**
 * Main function to perform the core logic and calculation.
 * It processes input data, sorts it, and uses a binary search
 * to find an optimal value based on certain conditions.
 * @returns {number} The calculated optimal value.
 */
function determineBestOutcome() {
  // Read the number of items and a threshold value from input.
  var numElements = dataHandler.fetchSingleItem();
  var limitFactor = dataHandler.fetchSingleItem();
  // Read a matrix of data for all items.
  var resourceMatrix = dataHandler.extractMultipleRows(numElements);

  var totalBaseValue = 0; // Accumulator for initial costs.

  // First pass: calculate additional properties for each item.
  for (var elementIdx = 0; elementIdx < numElements; elementIdx++) {
    // Calculate primary product (base cost).
    var primaryProduct = resourceMatrix[elementIdx][0] * resourceMatrix[elementIdx][1];
    // Calculate secondary product (additional cost based on limit factor).
    var additionalCost = (limitFactor - resourceMatrix[elementIdx][0]) * resourceMatrix[elementIdx][2];

    totalBaseValue += primaryProduct; // Add base cost to total.
    // Append calculated costs and their sum to the current item's row.
    resourceMatrix[elementIdx].push(additionalCost, primaryProduct, additionalCost + primaryProduct);
  }

  // Sort the resource matrix based on the combined cost (index 5).
  // Descending order, so items with higher combined costs are first.
  resourceMatrix.sort((firstItem, secondItem) => secondItem[5] - firstItem[5]);

  // Initialize binary search bounds.
  var upperBound = numElements * limitFactor; // 'ok' in original, represents a possible maximum.
  var lowerBound = -1; // 'ng' in original, represents an impossible minimum.

  // Perform binary search.
  while (upperBound - lowerBound > 1) {
    var currentGuess = Math.floor((upperBound + lowerBound) / 2); // Calculate midpoint.
    var remainingSum = totalBaseValue; // Initialize remaining sum with the total base value.
    var availableCapacity = currentGuess; // Initialize available capacity with the current guess.

    // Iterate through sorted items, trying to satisfy 'availableCapacity'.
    for (var elementIdx = 0;
         elementIdx < numElements && availableCapacity > 0 && remainingSum > 0;
         elementIdx++)
    {
      // If the limitFactor is less than or equal to availableCapacity,
      // it means we can fully apply the cost reduction for this item.
      if (limitFactor <= availableCapacity) {
        remainingSum -= resourceMatrix[elementIdx][5]; // Subtract combined cost.
        availableCapacity -= limitFactor; // Reduce available capacity.
      } else {
        // If limitFactor is greater than availableCapacity,
        // we need a more granular calculation.
        var workingTotal = remainingSum; // Use a temporary variable for inner loop calculations.

        // Inner loop, potentially problematic if 'elementIdx' is advanced here too.
        // This structure is preserved as per Type II cloning rules.
        for (
          /* No initialization, 'elementIdx' continues from outer loop */;
          elementIdx < numElements && workingTotal > 0;
          elementIdx++
        ) {
          workingTotal = remainingSum; // Reset workingTotal for each inner iteration (this is key to original logic).

          // If availableCapacity is less than the item's first property.
          if (availableCapacity < resourceMatrix[elementIdx][0]) {
            workingTotal -= resourceMatrix[elementIdx][1] * availableCapacity; // Subtract partial cost.
          } else {
            // If availableCapacity is sufficient or more.
            workingTotal -= resourceMatrix[elementIdx][4] + (availableCapacity - resourceMatrix[elementIdx][0]) * resourceMatrix[elementIdx][2];
          }
        }
        // After inner loop, update remainingSum and reset availableCapacity.
        remainingSum = workingTotal;
        availableCapacity = 0;
      }
    }

    // Adjust binary search bounds based on whether remainingSum is positive.
    if (remainingSum > 0) {
      lowerBound = currentGuess; // If sum is still positive, currentGuess is too low.
    } else {
      upperBound = currentGuess; // If sum is zero or negative, currentGuess is a possible solution or too high.
    }
  }
  return upperBound; // The final upper bound is the optimal value.
}