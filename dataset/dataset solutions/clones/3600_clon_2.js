function InputProcessor(sourceString) {
  // Stores the raw input string split into individual lines.
  this._dataRows = sourceString.split("\n");
  // Keeps track of the current line being processed.
  this._currentRowIndex = 0;
}

InputProcessor.prototype = {
  /**
   * Extracts a single token from the current input line.
   * It processes the line by splitting it into words and reversing,
   * then pops the last element (which was the first word).
   *
   * @param {boolean} returnAsString - If true, the token is returned as a string; otherwise, it's converted to a number.
   * @returns {string|number} The extracted token.
   */
  retrieveToken: function(returnAsString) {
    let currentInputLines = this._dataRows;
    let currentLinePointer = this._currentRowIndex;
    let extractedToken;

    // If the current line hasn't been processed into an array of words yet, do so.
    // Reversing allows efficient extraction from the end using pop().
    if (typeof currentInputLines[currentLinePointer] === "string") {
      currentInputLines[currentLinePointer] = currentInputLines[currentLinePointer].split(" ").reverse();
    }

    // Get the next token from the current line.
    extractedToken = currentInputLines[currentLinePointer].pop();

    // If the current line is now empty, advance to the next line.
    if (!currentInputLines[currentLinePointer].length) {
      this._currentRowIndex++;
    }

    // Return the token, optionally converted to a number.
    return returnAsString ? extractedToken : +extractedToken;
  },

  /**
   * Reads an entire line of input, splitting it into tokens.
   * The line pointer is advanced after this operation.
   *
   * @param {boolean} returnAsStrings - If true, tokens are returned as strings; otherwise, they are converted to numbers.
   * @returns {Array<string|number>} An array of tokens from the line.
   */
  retrieveLineTokens: function(returnAsStrings) {
    // Fetch the current line, split it by space, and then increment the line index.
    let lineContent = this._dataRows[this._currentRowIndex++].split(" ");
    // Map tokens to numbers if not requested as strings.
    return returnAsStrings ? lineContent : lineContent.map(token => +token);
  },

  /**
   * Reads multiple consecutive lines of input, processing each into an array of tokens.
   * The line pointer is advanced by the number of lines read.
   *
   * @param {number} numberOfLines - The count of lines to read.
   * @param {boolean} returnAsStrings - If true, tokens are returned as strings; otherwise, they are converted to numbers.
   * @returns {Array<Array<string|number>>} A 2D array representing the collected lines and their tokens.
   */
  retrieveMultipleLines: function(numberOfLines, returnAsStrings) {
    let sourceLines = this._dataRows;
    let startingLineIndex = this._currentRowIndex;
    let collectedDataMatrix = [];
    let lineIterator = 0;

    if (returnAsStrings) {
      // Populate the matrix with lines as arrays of strings.
      for (; lineIterator < numberOfLines; lineIterator++) {
        collectedDataMatrix[lineIterator] = sourceLines[startingLineIndex + lineIterator].split(" ");
      }
    } else {
      // Populate the matrix with lines as arrays of numbers.
      for (; lineIterator < numberOfLines; lineIterator++) {
        collectedDataMatrix[lineIterator] = sourceLines[startingLineIndex + lineIterator].split(" ").map(token => +token);
      }
    }

    // Update the line pointer to reflect the lines consumed.
    this._currentRowIndex += numberOfLines;
    return collectedDataMatrix;
  },
};

// Initialize the input handler by reading all data from standard input.
let inputHandler = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// Implements a Binary Indexed Tree (Fenwick Tree) for efficient range sum queries and point updates.
function BinaryIndexedTree(treeCapacity) {
  // The internal array for the BIT, initialized with zeros.
  // It's 1-indexed, so size 'treeCapacity' means indices 1 to treeCapacity-1 are used.
  this._bitStorage = Array(treeCapacity).fill(0);
}

BinaryIndexedTree.prototype = {
  /**
   * Adds a value to the element at a specific index and updates the tree.
   *
   * @param {number} targetIndex - The 1-based index to update.
   * @param {number} valueToAdd - The delta value to add.
   */
  addValue: function(targetIndex, valueToAdd) {
    // Traverse up the tree, updating parent nodes.
    for (; targetIndex < this._bitStorage.length; targetIndex += targetIndex & -targetIndex) {
      this._bitStorage[targetIndex] += valueToAdd;
    }
  },

  /**
   * Queries the prefix sum from index 1 up to a given index.
   *
   * @param {number} targetIndex - The 1-based index up to which the sum is required.
   * @returns {number} The cumulative sum.
   */
  queryPrefixSum: function(targetIndex) {
    let accumulatedSum = 0;
    // Traverse down the tree, summing relevant nodes.
    for (; targetIndex > 0; targetIndex -= targetIndex & -targetIndex) {
      accumulatedSum += this._bitStorage[targetIndex];
    }
    return accumulatedSum;
  },
};

// Execute the main computation and print its result to the console.
console.log(executeMainAlgorithm());

/**
 * This function encapsulates the primary algorithm to solve the problem.
 * It typically involves finding a specific statistical value (like a median)
 * within an array using binary search and a Fenwick tree for efficient counting.
 *
 * @returns {number} The final computed result.
 */
function executeMainAlgorithm() {
  // Read the number of elements in the input array.
  let dataArrayLength = inputHandler.retrieveToken();
  // Read the array of elements.
  let dataElementsArray = inputHandler.retrieveLineTokens();

  // Handle edge cases for very small arrays.
  if (dataArrayLength <= 2) {
    return Math.max(...dataElementsArray);
  }

  // Calculate the target rank (position) for the desired median-like value.
  // This is often related to the total number of subarrays.
  let targetRankPosition = Math.floor(dataArrayLength * (dataArrayLength + 1) / 4 + 1);

  // Initialize bounds for binary search on the answer value.
  let searchLowerBound = 2;
  let searchUpperBound = 1e9 + 1; // A common upper limit for problem constraints.

  // Perform binary search to find the answer.
  while (searchLowerBound < searchUpperBound) {
    // Calculate the midpoint value. Using bit shift for integer division.
    let currentMidValue = (searchLowerBound + searchUpperBound) >> 1;

    // Initialize variables for the Fenwick tree logic.
    // 'currentBalanceOffset' is used to map balance values (which can be negative) to positive indices for the BIT.
    // 'subarraysWithMedianGE' will count subarrays whose median is greater than or equal to 'currentMidValue'.
    let currentBalanceOffset = dataArrayLength + 1;
    let subarraysWithMedianGE = 0;
    // The BIT needs to cover the full range of possible balance values.
    let bitStructure = new BinaryIndexedTree(currentBalanceOffset * 2);

    // Initialize the BIT with the starting balance.
    bitStructure.addValue(currentBalanceOffset, 1);

    // Iterate through the input array to update counts.
    for (let elementIdx = 0; elementIdx < dataArrayLength; elementIdx++) {
      // Adjust the balance based on whether the current element is less than or greater than 'currentMidValue'.
      // Decrement balance if element < midValue, increment if element >= midValue.
      currentBalanceOffset += (dataElementsArray[elementIdx] < currentMidValue ? -1 : 1);

      // Query the BIT to count previous states that contribute to subarrays
      // whose median is >= 'currentMidValue'.
      subarraysWithMedianGE += bitStructure.queryPrefixSum(currentBalanceOffset);

      // Update the BIT with the current balance.
      bitStructure.addValue(currentBalanceOffset, 1);
    }

    // Calculate the total number of possible subarrays.
    let totalPossibleSubarrays = dataArrayLength * (dataArrayLength + 1) / 2;
    // Derive the count of subarrays whose median is strictly less than 'currentMidValue'.
    let subarraysWithMedianLT = totalPossibleSubarrays - subarraysWithMedianGE;

    // Adjust binary search bounds based on the count.
    if (subarraysWithMedianLT < targetRankPosition) {
      // If not enough subarrays have median < currentMidValue, then currentMidValue is too small.
      searchLowerBound = currentMidValue + 1;
    } else {
      // Otherwise, currentMidValue might be the answer or too large.
      searchUpperBound = currentMidValue;
    }
  }

  // The binary search finds the smallest value 'X' such that at least 'targetRankPosition'
  // subarrays have a median less than 'X'. The actual answer is 'X - 1'.
  return searchLowerBound - 1;
}
