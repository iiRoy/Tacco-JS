function InputProcessor(inputString) {
  // Stores the input string, split into an array of individual lines.
  this._sourceLines = inputString.split("\n");
  // Keeps track of the current line being processed.
  this._currentLineIndex = 0;
}

InputProcessor.prototype = {
  /**
   * Extracts the next single value from the current input line.
   * If the current line is exhausted, it advances to the next line.
   * @param {boolean} returnAsNumber - If true, attempts to convert the extracted value to a number.
   * @returns {string|number} The single extracted value.
   */
  getNextItem: function(returnAsNumber) {
    let lineBuffer = this._sourceLines;
    let currentIdx = this._currentLineIndex;
    let extractedItem;

    // If the current line is still a raw string, split it into words and reverse for efficient popping.
    if (typeof lineBuffer[currentIdx] === "string") {
      lineBuffer[currentIdx] = lineBuffer[currentIdx].split(" ").reverse();
    }

    // Retrieve the last element (which was originally the first) from the current line's word array.
    extractedItem = lineBuffer[currentIdx].pop();

    // If the current line's word array is now empty, increment the line index to move to the next line.
    if (!lineBuffer[currentIdx].length) {
      this._currentLineIndex++;
    }

    // Return the item, converting it to a number if 'returnAsNumber' is true.
    return returnAsNumber ? +extractedItem : extractedItem;
  },

  /**
   * Reads an entire line of input and returns its elements as an array.
   * The line pointer is automatically advanced after this operation.
   * @param {boolean} convertToNumbers - If true, all elements in the line are converted to numbers.
   * @returns {Array<string|number>} An array containing the elements of the line.
   */
  getLineOfItems: function(convertToNumbers) {
    // Fetch the current line, split it by spaces, and then advance the line index.
    let lineContent = this._sourceLines[this._currentLineIndex++].split(" ");
    // Return the array, optionally mapping each element to its numeric representation.
    return convertToNumbers ? lineContent.map(val => +val) : lineContent;
  },

  /**
   * Retrieves a specified number of consecutive lines as a 2D array.
   * The line pointer is advanced by the number of lines read.
   * @param {number} numberOfLines - The total number of lines to fetch.
   * @param {boolean} keepStrings - If true, elements are kept as strings; otherwise, they are converted to numbers.
   * @returns {Array<Array<string|number>>} A 2D array representing the block of lines.
   */
  getBlockOfLines: function(numberOfLines, keepStrings) {
    let dataLines = this._sourceLines;
    let startingIndex = this._currentLineIndex;
    let resultBlock = [];
    let lineIterator = 0;

    // Iterate through the specified number of lines to build the result block.
    if (keepStrings) {
      for (; lineIterator < numberOfLines; lineIterator++) {
        resultBlock[lineIterator] = dataLines[startingIndex + lineIterator].split(" ");
      }
    } else {
      for (; lineIterator < numberOfLines; lineIterator++) {
        resultBlock[lineIterator] = dataLines[startingIndex + lineIterator].split(" ").map(val => +val);
      }
    }

    // Update the global line index to reflect the lines that have been processed.
    this._currentLineIndex += numberOfLines;
    return resultBlock;
  },
};

// Initialize an input handler by reading the entire content of standard input.
let inputHandler = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the primary processing logic and print its return value to the console.
console.log(processMainLogic());

/**
 * Contains the core algorithm for processing the input data.
 * @returns {number} The final computed result.
 */
function processMainLogic() {
  // Read the first integer from input, which represents the count of elements.
  let elementCount = inputHandler.getNextItem();
  // Read the next line of input as an array of numbers.
  let primaryDataSet = inputHandler.getLineOfItems();
  // Declare an empty array to store intermediate derived values.
  let secondaryDataSet = [];

  // Handle edge cases where the element count is very small.
  if (elementCount <= 2) {
    return Math.max(...primaryDataSet);
  }

  // Populate 'secondaryDataSet' with the maximum of each adjacent pair from 'primaryDataSet'.
  for (let loopCounter = 0; loopCounter < elementCount - 1; loopCounter++) {
    secondaryDataSet[loopCounter] = Math.max(primaryDataSet[loopCounter], primaryDataSet[loopCounter + 1]);
  }

  // Branch the logic based on the remainder of 'elementCount' when divided by 4.
  if (elementCount % 4 === 1 || elementCount % 4 === 2) {
    // For these cases, concatenate both datasets and find the median of the combined array.
    return findArrayMedian(primaryDataSet.concat(secondaryDataSet));
  }

  if (elementCount % 4 === 3) {
    // Sort 'secondaryDataSet' numerically.
    secondaryDataSet.sort((valA, valB) => valA - valB);
    // Find the median of 'primaryDataSet' and reassign it to 'primaryDataSet'.
    primaryDataSet = findArrayMedian(primaryDataSet);
    // Construct a new array using the median of 'primaryDataSet' and specific elements from 'secondaryDataSet', then find its median.
    return findArrayMedian([primaryDataSet, primaryDataSet, secondaryDataSet[elementCount - 1 >> 1], secondaryDataSet[elementCount - 2 >> 1]]);
  }

  // This block executes if elementCount % 4 === 0.
  // Sort 'primaryDataSet' numerically.
  primaryDataSet.sort((valA, valB) => valA - valB);
  // Find the median of 'secondaryDataSet' and reassign it to 'secondaryDataSet'.
  secondaryDataSet = findArrayMedian(secondaryDataSet);
  // Construct a new array using the median of 'secondaryDataSet' and specific elements from 'primaryDataSet', then find its median.
  return findArrayMedian([secondaryDataSet, secondaryDataSet, primaryDataSet[elementCount >> 1], primaryDataSet[elementCount - 1 >> 1]]);

  /**
   * A utility function to compute the median of a given array of numbers.
   * The array is sorted in place.
   * @param {Array<number>} targetArray - The array for which to find the median.
   * @returns {number} The median value of the array.
   */
  function findArrayMedian(targetArray) {
    // Sort the array numerically in ascending order.
    targetArray.sort((valA, valB) => valA - valB);
    // Return the element at the middle index (using bitwise right shift for integer division).
    return targetArray[targetArray.length >> 1];
  }
}
