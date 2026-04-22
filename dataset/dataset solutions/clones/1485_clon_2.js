"use strict";

// Core module for file system operations in Node.js
const fileSystem = require("fs");

// Read all incoming data from the standard input stream
const rawInputData = fileSystem.readFileSync("/dev/stdin", "utf-8");

// Split the entire input string into an array of individual tokens
// Tokens are separated by either spaces or newline characters
let inputTokens = rawInputData.split(/ |\n/);
// An index to keep track of the current token being processed
let tokenIndex = 0;

/**
 * Retrieves the next available token from the input stream and parses it as a number.
 * Increments the token index after retrieval.
 * @returns {number} The parsed numerical value of the next token.
 */
function getNextInt() {
  return +inputTokens[tokenIndex++];
}

/**
 * Retrieves the next available token from the input stream as a string.
 * Increments the token index after retrieval.
 * @returns {string} The string value of the next token.
 */
function getNextString() {
  return inputTokens[tokenIndex++];
}

/**
 * Retrieves the next available token from the input stream and parses it as a BigInt.
 * Increments the token index after retrieval.
 * @returns {BigInt} The parsed BigInt value of the next token.
 */
function getNextBigInt() {
  return BigInt(inputTokens[tokenIndex++]);
}

/**
 * Reads a specified number of tokens from the input stream.
 * Optionally converts these tokens to numbers or leaves them as strings.
 * @param {number} count - The total number of tokens to read.
 * @param {boolean} asStrings - If true, tokens are returned as strings; otherwise, they are parsed as numbers.
 * @returns {Array<number | string>} An array containing the requested tokens.
 */
function getMultipleNumbers(count, asStrings) {
  return asStrings
    ? inputTokens.slice(tokenIndex, (tokenIndex += count))
    : inputTokens.slice(tokenIndex, (tokenIndex += count)).map((val) => +val);
}

/**
 * Reads a specified number of tokens, converts them to numbers, and then sorts them.
 * The sorting order can be specified as ascending (default) or descending.
 * @param {number} count - The number of tokens to read and sort.
 * @param {boolean} descending - If true, sorts in descending order; otherwise, in ascending order.
 * @returns {Array<number>} An array of sorted numbers.
 */
function getSortedNumbers(count, descending) {
  return inputTokens
    .slice(tokenIndex, (tokenIndex += count))
    .map((val) => +val)
    .sort((valA, valB) => (descending ? valB - valA : valA - valB));
}

/**
 * Reads data from the input stream to form a 2D matrix (array of arrays).
 * @param {number} height - The number of rows for the matrix.
 * @param {number} width - The number of columns for each row.
 * @param {boolean} asStrings - If true, matrix elements are strings; otherwise, they are numbers.
 * @returns {Array<Array<number | string>>} The constructed matrix.
 */
function getMatrix(height, width, asStrings) {
  let matrixRows = [];
  let rowIdx = 0;
  if (asStrings) {
    for (; rowIdx < height; rowIdx++) {
      matrixRows.push(inputTokens.slice(tokenIndex, (tokenIndex += width)));
    }
  } else {
    for (; rowIdx < height; rowIdx++) {
      matrixRows.push(
        inputTokens.slice(tokenIndex, (tokenIndex += width)).map((val) => +val)
      );
    }
  }
  return matrixRows;
}

/**
 * A utility function to create multi-dimensional arrays dynamically.
 * The dimensions are passed as arguments after the initial value.
 * @param {any} initialValue - The value to initialize the innermost array elements with.
 * @returns {Array<any>} A multi-dimensional array as specified by the arguments.
 */
function createMultiDimArray(initialValue) {
  let args = arguments,
    argCount = args.length,
    arrayCreationString = `Array(args[--argCount]).fill().map(x=>{return ` + initialValue + `;})`;
  while (--argCount) {
    arrayCreationString = `Array(args[argCount]).fill().map(x=>` + arrayCreationString + `)`;
  }
  return eval(arrayCreationString); // Note: eval can be a security risk if input is untrusted.
}

// A buffer to accumulate output strings before they are finally printed.
const outputBuffer = [];

/**
 * Adds a given message string to the global output buffer.
 * @param {string} message - The string to be buffered for output.
 */
function appendToOutput(message) {
  outputBuffer.push(message);
}

// The default numerical value for nodes in the segment tree.
const defaultValue = 0;

/**
 * Constructs an Interval Tree, also known as a Segment Tree.
 * This tree supports range updates and point queries for maximum values.
 * @param {number} initialCapacity - The maximum index that the tree needs to cover.
 */
function IntervalTree(initialCapacity) {
  // Calculate the smallest power of 2 that is greater than or equal to initialCapacity.
  let powerOfTwo = 2;
  let tempCapacity = initialCapacity - 1;
  while (tempCapacity > 0) {
    tempCapacity >>= 1; // Equivalent to tempCapacity = Math.floor(tempCapacity / 2)
    powerOfTwo <<= 1; // Equivalent to powerOfTwo = powerOfTwo * 2
  }

  // Initialize the internal data array for the segment tree.
  // The size is (2*powerOfTwo - 1) to accommodate all nodes up to the leaves.
  this.data = new Array(powerOfTwo * 2 - 1).fill(defaultValue);
  // The 'leafOffset' is the index of the first leaf node in the 'data' array.
  this.leafOffset = powerOfTwo;
}

// Define the methods for the IntervalTree prototype.
IntervalTree.prototype = {
  /**
   * Performs a point query to find the maximum value associated with a specific leaf index.
   * This method traverses from the specified leaf node up to the root,
   * accumulating the maximum value found on this path.
   * @param {number} leafIndex - The zero-based index of the leaf node to query.
   * @returns {number} The maximum value encountered from the leaf to the root.
   */
  queryMax: function (leafIndex) {
    const treeArray = this.data;
    // Calculate the actual array index for the given leaf node.
    let currentNodeIndex = leafIndex + this.leafOffset - 1;
    let currentMaxValue = defaultValue;

    // Iterate upwards from the leaf node towards the root.
    while (currentNodeIndex >= 0) {
      if (treeArray[currentNodeIndex] > currentMaxValue) {
        currentMaxValue = treeArray[currentNodeIndex];
      }
      // Move to the parent node. Parent of node 'i' is '(i-1)/2'.
      currentNodeIndex = (currentNodeIndex - 1) >> 1;
    }
    return currentMaxValue;
  },

  /**
   * Updates a specified range [startIndex, endIndex) with a new numerical value.
   * This implementation uses a form of lazy propagation, where updates are applied
   * directly to nodes that fully cover the target range.
   * @param {number} startIndex - The inclusive start index of the range to update.
   * @param {number} endIndex - The exclusive end index of the range to update.
   * @param {number} newValue - The value to set for the nodes within the specified range.
   */
  modifyRange: function (startIndex, endIndex, newValue) {
    // If the update range is empty or invalid, return immediately.
    if (startIndex >= endIndex) {
      return;
    }

    // Capture 'this' for use in the nested recursive function.
    const instanceRef = this;

    /**
     * Internal recursive function to perform the range update.
     * @param {number} currentRangeStart - The start of the update range for the current call.
     * @param {number} currentRangeEnd - The end of the update range for the current call.
     * @param {number} nodeRangeStart - The start of the range covered by the current tree node.
     * @param {number} nodeRangeEnd - The end of the range covered by the current tree node.
     * @param {number} nodeIndex - The array index of the current node in 'instanceRef.data'.
     */
    function recursiveUpdate(
      currentRangeStart,
      currentRangeEnd,
      nodeRangeStart,
      nodeRangeEnd,
      nodeIndex
    ) {
      // If the current node's covered range perfectly matches the update range,
      // apply the new value directly to this node.
      if (currentRangeStart === nodeRangeStart && currentRangeEnd === nodeRangeEnd) {
        instanceRef.data[nodeIndex] = newValue;
        return;
      }

      // Calculate the midpoint of the current node's range to split into children.
      const midPoint = (nodeRangeStart + nodeRangeEnd) >> 1;

      // Determine which child nodes need to be visited based on the overlap with the update range.
      if (midPoint < currentRangeEnd) {
        // The update range extends into the right child's domain.
        if (currentRangeStart < midPoint) {
          // The update range also overlaps with the left child's domain.
          // Recursively update the left child.
          recursiveUpdate(
            currentRangeStart,
            midPoint,
            nodeRangeStart,
            midPoint,
            (nodeIndex * 2) + 1
          );
          // Recursively update the right child.
          recursiveUpdate(
            midPoint,
            currentRangeEnd,
            midPoint,
            nodeRangeEnd,
            (nodeIndex * 2) + 2
          );
        } else {
          // The update range is entirely within the right child's domain.
          // Recursively update only the right child.
          recursiveUpdate(
            currentRangeStart,
            currentRangeEnd,
            midPoint,
            nodeRangeEnd,
            (nodeIndex * 2) + 2
          );
        }
      } else {
        // The update range is entirely within the left child's domain.
        // Recursively update only the left child.
        recursiveUpdate(
          currentRangeStart,
          currentRangeEnd,
          nodeRangeStart,
          midPoint,
          (nodeIndex * 2) + 1
        );
      }
    }

    // Begin the recursive update process from the root node (index 0),
    // covering the full range of the tree's leaves.
    recursiveUpdate(startIndex, endIndex, 0, this.leafOffset, 0);
  },
};

// Execute the main business logic of the application.
let finalResult = executeMainLogic();

// If the main logic returned a non-undefined value, print it to the console.
if (finalResult !== undefined) {
  console.info(String(finalResult));
}

// If there are accumulated messages in the output buffer, join them with newlines
// and print them all to the console.
if (outputBuffer.length > 0) {
  console.info(outputBuffer.join("\n"));
}

/**
 * The primary function encapsulating the program's core operations.
 * It reads input, processes it using an Interval Tree, and computes a final answer.
 * @returns {number} The ultimate computed maximum value.
 */
function executeMainLogic() {
  // Read two numbers from the input: elementsCount (N) and rangeK (K).
  const [elementsCount, rangeK] = getMultipleNumbers(2);
  // Read an array of 'elementsCount' numbers from the input.
  const inputArray = getMultipleNumbers(elementsCount);

  // Instantiate an IntervalTree. The capacity is set to 300001,
  // which is typically chosen to cover the maximum possible value (e.g., max a[i] + k).
  const segmentTreeInstance = new IntervalTree(300001);

  // Iterate through each element in the provided inputArray.
  for (let loopCounter = 0; loopCounter < elementsCount; loopCounter++) {
    // Determine the lower bound for the update range.
    // It's the maximum of 0 and (current element - rangeK).
    const lowerBound = Math.max(0, inputArray[loopCounter] - rangeK);
    // Determine the upper bound for the update range.
    // It's the minimum of 300000 and (current element + rangeK).
    const upperBound = Math.min(300000, inputArray[loopCounter] + rangeK);

    // Query the IntervalTree for the current maximum value at the current element's position.
    const currentMax = segmentTreeInstance.queryMax(inputArray[loopCounter]);

    // Update a range in the IntervalTree. The range is [lowerBound, upperBound + 1).
    // The value used for the update is 'currentMax + 1'.
    segmentTreeInstance.modifyRange(lowerBound, upperBound + 1, currentMax + 1);
  }

  // After all updates, find the overall maximum value across the entire possible range
  // covered by the segment tree.
  let overallMaximum = 0;
  // Iterate from 0 up to 300000 (inclusive) to query all possible points.
  for (let loopCounter = 0; loopCounter <= 300000; loopCounter++) {
    overallMaximum = Math.max(
      overallMaximum,
      segmentTreeInstance.queryMax(loopCounter)
    );
  }

  // Return the final maximum value found.
  return overallMaximum;
}