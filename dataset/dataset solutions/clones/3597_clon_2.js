function InputProcessor(inputString) {
  // Store the input string, split by newlines, into an internal buffer.
  this._lineBuffer = inputString.split("\n");
  // Initialize the current line index to the beginning.
  this._currentLineIndex = 0;
}

InputProcessor.prototype = {
  /**
   * Reads a single value from the current line.
   * If the line hasn't been processed yet, it's split into words and reversed.
   *
   * @param {boolean} asString - If true, returns the value as a string; otherwise, as a number.
   * @returns {string|number} The extracted value.
   */
  readSingleValue: function(asString) {
    let lineCollection = this._lineBuffer;
    let linePointer = this._currentLineIndex;
    let resultValue;

    // If the current line is still a single string, split it into words and reverse for easy popping.
    if (typeof lineCollection[linePointer] === "string") {
      lineCollection[linePointer] = lineCollection[linePointer].split(" ").reverse();
    }

    // Pop the last element (which was the first due to reversal).
    resultValue = lineCollection[linePointer].pop();

    // If the current line is now empty, advance to the next line.
    if (!lineCollection[linePointer].length) {
      this._currentLineIndex++;
    }

    // Return the value, either as a string or converted to a number.
    return asString ? resultValue : +resultValue;
  },

  /**
   * Reads an entire line, splits it by spaces, and advances the line index.
   *
   * @param {boolean} asString - If true, returns an array of strings; otherwise, an array of numbers.
   * @returns {Array<string|number>} An array of values from the line.
   */
  readLineValues: function(asString) {
    // Get the current line, split it by spaces, and then increment the line index.
    let lineValues = this._lineBuffer[this._currentLineIndex++].split(" ");
    // Return the array, either as strings or converted to numbers.
    return asString ? lineValues : lineValues.map(item => +item);
  },

  /**
   * Reads multiple consecutive lines, splitting each by spaces.
   *
   * @param {number} numLines - The number of lines to read.
   * @param {boolean} asString - If true, returns a 2D array of strings; otherwise, a 2D array of numbers.
   * @returns {Array<Array<string|number>>} A 2D array containing values from the read lines.
   */
  readMultipleLines: function(numLines, asString) {
    let lineCollection = this._lineBuffer;
    let linePointer = this._currentLineIndex;
    let resultArray = [];
    let loopCounter = 0;

    // Iterate 'numLines' times to process each requested line.
    if (asString) {
      for (; loopCounter < numLines; loopCounter++) {
        resultArray[loopCounter] = lineCollection[linePointer + loopCounter].split(" ");
      }
    } else {
      for (; loopCounter < numLines; loopCounter++) {
        resultArray[loopCounter] = lineCollection[linePointer + loopCounter].split(" ").map(item => +item);
      }
    }

    // Advance the line index by the number of lines read.
    this._currentLineIndex += numLines;
    return resultArray;
  },
};

// Create an instance of the input processor, reading from standard input.
let inputHandler = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main processing function and print its result to the console.
console.log(processData());

function processData() {
  // Read the first number, which represents the count of elements.
  let countElements = inputHandler.readSingleValue();
  // Read the next line as an array of numbers.
  let initialArray = inputHandler.readLineValues();
  // Initialize an empty array to store pairwise maximums.
  let pairwiseMaxes = [];

  // Handle edge case where the number of elements is 2 or less.
  if (countElements <= 2) {
    return Math.max(...initialArray);
  }

  // Calculate the maximum of adjacent pairs and store them in 'pairwiseMaxes'.
  for (let idx = 0; idx < countElements - 1; idx++) {
    pairwiseMaxes[idx] = Math.max(initialArray[idx], initialArray[idx + 1]);
  }

  // Concatenate the original array with the array of pairwise maximums.
  initialArray = initialArray.concat(pairwiseMaxes);

  // Find and return the median of the combined array.
  return findMedian(initialArray);

  /**
   * Helper function to find the median of a numeric array.
   *
   * @param {Array<number>} dataCollection - The array to find the median from.
   * @returns {number} The median value.
   */
  function findMedian(dataCollection) {
    // Sort the array numerically in ascending order.
    dataCollection.sort((valA, valB) => valA - valB);
    // Return the middle element (using bitwise right shift for integer division).
    return dataCollection[dataCollection.length >> 1];
  }
}
