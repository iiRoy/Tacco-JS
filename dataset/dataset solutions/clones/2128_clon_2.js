"use strict";
// Obtain raw input data from standard input
let rawData = require("fs").readFileSync("/dev/stdin", "utf8");
// Split input into tokens using spaces or newlines as delimiters
let tokenStream = rawData.split(/ |\n/);
// Initialize an index to keep track of the current token
let tokenIndex = 0;

/**
 * Reads the next token from the input stream.
 * @param {boolean} asString - If true, returns the token as a string; otherwise, converts to a number.
 * @returns {string|number} The next token.
 */
function readNext(asString) {
  return asString ? tokenStream[tokenIndex++] : +tokenStream[tokenIndex++];
}

/**
 * Reads a specified number of tokens from the input stream.
 * @param {number} count - The number of tokens to read.
 * @param {boolean} asStrings - If true, returns tokens as strings; otherwise, converts to numbers.
 * @returns {Array<string|number>} An array of tokens.
 */
function readMany(count, asStrings) {
  return asStrings ? tokenStream.slice(tokenIndex, tokenIndex += count) : tokenStream.slice(tokenIndex, tokenIndex += count).map(val => +val);
}

/**
 * Reads a 2D matrix of tokens from the input stream.
 * @param {number} height - The number of rows in the matrix.
 * @param {number} width - The number of columns in each row.
 * @param {boolean} asStrings - If true, returns tokens as strings; otherwise, converts to numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function readMatrix(height, width, asStrings) {
  let resultMatrix = [];
  let rowCounter = 0;
  if (asStrings) {
    for (; rowCounter < height; rowCounter++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width));
    }
  } else {
    for (; rowCounter < height; rowCounter++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width).map(val => +val));
    }
  }
  return resultMatrix;
}

/**
 * Creates a multi-dimensional array initialized with a given value.
 * The dimensions are passed as subsequent arguments.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  let args = arguments;
  let dimCount = args.length;
  // Construct the array creation string dynamically
  let arrayCreationString = "Array(args[" + --dimCount + "]).fill().map(elem => {return " + initialValue + ";})";
  while (--dimCount) {
    arrayCreationString = "Array(args[" + dimCount + "]).fill().map(elem => " + arrayCreationString + ")";
  }
  // Evaluate the string to create the array
  return eval(arrayCreationString);
}

// Fenwick Tree (Binary Indexed Tree) implementation
const FenwickTree = (function() {
  /**
   * Factory function to create a new FenwickTree instance.
   * @param {number} treeSize - The maximum size of the array the Fenwick Tree will manage.
   * @returns {FenwickTreeInternal} A new FenwickTree object.
   */
  function createFenwickTree(treeSize) {
    return new FenwickTreeInternal(treeSize);
  }

  /**
   * Internal constructor for the Fenwick Tree.
   * @param {number} treeSize - The maximum size of the array.
   */
  function FenwickTreeInternal(treeSize) {
    // The underlying array for the Fenwick Tree, 1-indexed.
    // It stores prefix sums in a specific way.
    this.dataArray = Array(treeSize + 1).fill(0);
  }

  /**
   * Updates the value at a given index in the conceptual array by adding `valueToAdd`.
   * This operation propagates the change up the tree.
   * @param {number} valueToAdd - The value to add to the element at `targetIndex`.
   * @param {number} targetIndex - The 1-indexed position to update.
   */
  FenwickTreeInternal.prototype.update = function(valueToAdd, targetIndex) {
    // Iterate through the tree, updating relevant nodes
    for (; targetIndex < this.dataArray.length; targetIndex += targetIndex & -targetIndex) {
      this.dataArray[targetIndex] += valueToAdd;
    }
  };

  /**
   * Queries the prefix sum up to a given index.
   * This operation sums values down the tree.
   * @param {number} targetIndex - The 1-indexed position up to which to sum.
   * @returns {number} The sum of elements from index 1 to `targetIndex`.
   */
  FenwickTreeInternal.prototype.querySum = function(targetIndex) {
    let currentSum = 0;
    // Iterate through the tree, summing relevant nodes
    for (; targetIndex > 0; targetIndex -= targetIndex & -targetIndex) {
      currentSum += this.dataArray[targetIndex];
    }
    return currentSum;
  };

  // Expose the factory function to create Fenwick Trees
  return createFenwickTree;
})();

// Execute the primary program logic and capture its output
let programOutput = executeProgram();
// If there's a defined output, print it to the console
if (programOutput !== undefined) {
  console.log(programOutput);
}

/**
 * Main function containing the core algorithm for processing string queries.
 * @returns {string} The newline-separated results of type 2 queries.
 */
function executeProgram() {
  // Read the length of the input string
  let stringLength = readNext();
  // Read the input string itself (as a string)
  let inputString = readNext(true);
  // Read the total number of queries to process
  let queryCount = readNext();

  // Create an array of 26 Fenwick Trees, one for each lowercase English letter (a-z).
  // Each tree will track the occurrences of its corresponding character in the string.
  let charFenwickTrees = Array(26).fill().map(elem => new FenwickTree(stringLength));

  // Initialize the Fenwick Trees based on the initial input string.
  // For each character in the string, increment its count in the corresponding BIT.
  for (let charIndex = 0; charIndex < stringLength; charIndex++) {
    // Convert character to a 0-25 index (e.g., 'a' -> 0, 'b' -> 1)
    // Then update the BIT at the 1-indexed position (charIndex + 1)
    charFenwickTrees[inputString[charIndex].charCodeAt(0) - 97].update(1, charIndex + 1);
  }

  // Array to store the results of type 2 queries (distinct character counts)
  let resultsList = [];

  // Process each query one by one
  for (let queryIdx = 0; queryIdx < queryCount; queryIdx++) {
    // Read the query type (1 for update, 2 for distinct count)
    if (readNext() === 1) {
      // Type 1 query: update a character at a specific position
      let positionToUpdate = readNext(); // 1-indexed position in the string
      let newCharValue = readNext(true); // The new character to place at that position

      // Decrement the count for the character that was originally at `positionToUpdate`.
      // Note: The `inputString` variable itself is not modified. This means
      // `inputString[positionToUpdate - 1]` will always refer to the character
      // from the *initial* string, not any character set by a previous update query.
      charFenwickTrees[inputString[positionToUpdate - 1].charCodeAt(0) - 97].update(-1, positionToUpdate);
      // Increment the count for the `newCharValue` at `positionToUpdate`.
      charFenwickTrees[newCharValue.charCodeAt(0) - 97].update(1, positionToUpdate);

    } else {
      // Type 2 query: count distinct characters within a given range
      let leftBound = readNext() - 1; // 0-indexed start of the range (exclusive for prefix sum)
      let rightBound = readNext(); // 1-indexed end of the range (inclusive for prefix sum)

      let distinctCharCount = 0;
      // Iterate through all 26 possible lowercase English characters
      for (let charTypeIdx = 0; charTypeIdx < 26; charTypeIdx++) {
        // Calculate the count of the current character type within the range [leftBound+1, rightBound].
        // This is done by subtracting the prefix sum up to `leftBound` from the prefix sum up to `rightBound`.
        // If the difference is greater than 0, it means this character type exists in the range.
        if (charFenwickTrees[charTypeIdx].querySum(rightBound) - charFenwickTrees[charTypeIdx].querySum(leftBound)) {
          distinctCharCount++; // Increment if the character is present
        }
      }
      // Store the calculated distinct character count for this query
      resultsList.push(distinctCharCount);
    }
  }
  // Join all collected results with newline characters and return the final string
  return resultsList.join("\n");
}
