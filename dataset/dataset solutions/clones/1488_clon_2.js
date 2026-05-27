"use strict";

// Read entire standard input as a string
const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Split input into tokens by spaces or newlines, and initialize a pointer
const inputTokens = fileContent.split(/ |\n/);
let tokenPointer = 0;

/**
 * Reads the next token from the input stream and converts it to a number.
 * @returns {number} The next integer token.
 */
function readNextInteger() {
  return +inputTokens[tokenPointer++];
}

/**
 * Reads the next token from the input stream as a string.
 * @returns {string} The next string token.
 */
function readNextString() {
  return inputTokens[tokenPointer++];
}

/**
 * Reads the next token from the input stream and converts it to a BigInt.
 * @returns {BigInt} The next BigInt token.
 */
function readNextBigInt() {
  return BigInt(inputTokens[tokenPointer++]);
}

/**
 * Reads N tokens from the input stream.
 * @param {number} count - The number of tokens to read.
 * @param {boolean} [asStrings=false] - If true, returns tokens as strings; otherwise, as numbers.
 * @returns {Array<number|string>} An array of the read tokens.
 */
function readNItems(count, asStrings) {
  return asStrings
    ? inputTokens.slice(tokenPointer, (tokenPointer += count))
    : inputTokens.slice(tokenPointer, (tokenPointer += count)).map((val) => +val);
}

/**
 * Reads N tokens from the input stream and sorts them.
 * @param {number} count - The number of tokens to read.
 * @param {boolean} [descendingOrder=false] - If true, sorts in descending order; otherwise, ascending.
 * @returns {Array<number>} An array of the read and sorted numbers.
 */
function readNSortedItems(count, descendingOrder) {
  return descendingOrder
    ? inputTokens.slice(tokenPointer, (tokenPointer += count)).map((val) => +val).sort((a, b) => b - a)
    : inputTokens.slice(tokenPointer, (tokenPointer += count)).map((val) => +val).sort((a, b) => a - b);
}

/**
 * Reads a matrix (2D array) of dimensions H x W from the input stream.
 * @param {number} height - The number of rows.
 * @param {number} width - The number of columns.
 * @param {boolean} [asStrings=false] - If true, returns elements as strings; otherwise, as numbers.
 * @returns {Array<Array<number|string>>} The 2D array (matrix).
 */
function readMatrix(height, width, asStrings) {
  const matrixRows = [];
  let rowIndex = 0;
  if (asStrings) {
    for (; rowIndex < height; rowIndex++) {
      matrixRows.push(inputTokens.slice(tokenPointer, (tokenPointer += width)));
    }
  } else {
    for (; rowIndex < height; rowIndex++) {
      matrixRows.push(inputTokens.slice(tokenPointer, (tokenPointer += width)).map((val) => +val));
    }
  }
  return matrixRows;
}

/**
 * Dynamically creates a multi-dimensional array with a specified initial value.
 * The dimensions are passed as subsequent arguments.
 * @param {*} initialValue - The value to fill the innermost array with.
 * @param {...number} dimensions - The dimensions of the array (e.g., dim1, dim2, dim3).
 * @returns {Array} The multi-dimensional array.
 */
function initializeMultiDimArray(initialValue) {
  const args = arguments;
  let argCount = args.length;
  // Start building the string for the innermost array
  let arrayCreationString = "Array(args[" + --argCount + "]).fill().map(x=>{return " + initialValue + ";})";
  // Wrap with outer array creation strings
  while (--argCount) {
    arrayCreationString = "Array(args[" + argCount + "]).fill().map(x=>" + arrayCreationString + ")";
  }
  // Evaluate the string to create the array
  return eval(arrayCreationString);
}

// Buffer to collect output strings before printing
const outputCollector = [];

/**
 * Adds a string to the output buffer.
 * @param {string} str - The string to add.
 */
function addToOutput(str) {
  outputCollector.push(str);
}

// Default value for segment tree nodes (e.g., for max queries, 0 is a common default)
const defaultSegmentValue = 0;

/**
 * Implements a Segment Tree for range maximum queries and point updates.
 * The tree is built to handle a given capacity, automatically sizing to the next power of 2.
 */
function RangeMaxSegmentTree(treeCapacity) {
  let treeArraySize = 0x2; // Start with 2
  treeCapacity--; // Adjust capacity for power-of-2 calculation
  while (treeCapacity > 0x0) {
    treeCapacity >>= 0x1; // Divide by 2
    treeArraySize <<= 0x1; // Multiply by 2
  }
  // Initialize segment tree nodes with the default value
  this.segmentNodes = Array(treeArraySize - 0x1).fill(defaultSegmentValue);
  // Calculate the starting index of leaf nodes in the `segmentNodes` array
  this.leafStartIndex = treeArraySize >> 0x1;
}

RangeMaxSegmentTree.prototype = {
  /**
   * Queries the maximum value from the root down to a specific index.
   * This is a point query, effectively getting the value at `targetIndex`
   * after all range updates have been propagated.
   * @param {number} targetIndex - The index to query.
   * @returns {number} The maximum value at the target index.
   */
  queryMaximum: function(targetIndex) {
    const nodeValues = this.segmentNodes;
    // Adjust targetIndex to be a leaf node index in the internal array
    let currentIdx = targetIndex + this.leafStartIndex - 0x1;
    let currentMaximum = defaultSegmentValue;

    // Traverse up from the leaf to the root, accumulating the maximum value
    while (currentIdx >= 0x0) {
      if (nodeValues[currentIdx] > currentMaximum) {
        currentMaximum = nodeValues[currentIdx];
      }
      currentIdx = (currentIdx - 0x1) >> 0x1; // Move to parent node
    }
    return currentMaximum;
  },

  /**
   * Applies a range update to the segment tree.
   * This update sets the maximum value in the range [updateRangeStart, updateRangeEnd) to `updateValue`.
   * @param {number} updateRangeStart - The starting index of the update range (inclusive).
   * @param {number} updateRangeEnd - The ending index of the update range (exclusive).
   * @param {number} updateValue - The value to update the range with.
   */
  applyRangeUpdate: function(updateRangeStart, updateRangeEnd, updateValue) {
    // If the range is invalid or empty, do nothing
    if (updateRangeStart >= updateRangeEnd) {
      return;
    }
    const thisInstance = this; // Capture 'this' for the nested function

    /**
     * Recursive helper function for range updates.
     * @param {number} segmentL - The left boundary of the current query segment.
     * @param {number} segmentR - The right boundary of the current query segment.
     * @param {number} nodeL - The left boundary of the current segment tree node's coverage.
     * @param {number} nodeR - The right boundary of the current segment tree node's coverage.
     * @param {number} nodeIdx - The index of the current node in the `segmentNodes` array.
     */
    function performRecursiveUpdate(segmentL, segmentR, nodeL, nodeR, nodeIdx) {
      // If the current node's range exactly matches the update range, apply the update
      if (segmentL === nodeL && segmentR === nodeR) {
        if (thisInstance.segmentNodes[nodeIdx] < updateValue) {
          thisInstance.segmentNodes[nodeIdx] = updateValue;
        }
        return;
      }

      // Calculate the midpoint of the current node's coverage
      const midPoint = (nodeL + nodeR) >> 0x1;

      // Recursively update child nodes based on overlap
      if (midPoint < segmentR) {
        // If the update range extends into the right child's territory
        if (segmentL < midPoint) {
          // If the update range also extends into the left child's territory
          performRecursiveUpdate(segmentL, midPoint, nodeL, midPoint, nodeIdx + nodeIdx + 0x1); // Left child
          performRecursiveUpdate(midPoint, segmentR, midPoint, nodeR, (nodeIdx + 0x1) << 0x1); // Right child
        } else {
          // Update range is entirely within the right child's territory
          performRecursiveUpdate(segmentL, segmentR, midPoint, nodeR, (nodeIdx + 0x1) << 0x1); // Right child
        }
      } else {
        // Update range is entirely within the left child's territory
        performRecursiveUpdate(segmentL, segmentR, nodeL, midPoint, nodeIdx + nodeIdx + 0x1); // Left child
      }
    }

    // Start the recursive update from the root (nodeIdx 0) covering the full tree capacity
    performRecursiveUpdate(updateRangeStart, updateRangeEnd, 0x0, this.leafStartIndex, 0x0);
  },
};

// Execute the main program logic
const programResult = runMainProgram();

// Output the result if it's not undefined
if (programResult !== undefined) {
  console.log(String(programResult));
}

// Output any buffered streams
if (outputCollector.length > 0x0) {
  console.log(outputCollector.join("\n"));
}

/**
 * The main function containing the core logic of the program.
 * It reads input, performs calculations using a segment tree, and returns a final answer.
 * @returns {number} The final calculated answer.
 */
function runMainProgram() {
  // Read two integers: itemCount (n) and rangeParameter (k)
  const [itemCount, rangeParameter] = readNItems(0x2);
  // Read an array of itemCount integers
  const dataArray = readNItems(itemCount);

  // Initialize a segment tree with a capacity of 300001 (max possible value + 1)
  const activeSegmentTree = new RangeMaxSegmentTree(300_001);

  // Iterate through the input data array
  for (let idx = 0x0; idx < itemCount; idx++) {
    // Calculate the lower bound for the update range
    const currentLowerBound = Math.max(0x0, dataArray[idx] - rangeParameter);
    // Calculate the upper bound for the update range
    const currentUpperBound = Math.min(300_000, dataArray[idx] + rangeParameter);
    // Query the current maximum value at the current data point's index
    const maxBeforeUpdate = activeSegmentTree.queryMaximum(dataArray[idx]);
    // Apply a range update: set max in [currentLowerBound, currentUpperBound + 1) to maxBeforeUpdate + 1
    activeSegmentTree.applyRangeUpdate(currentLowerBound, currentUpperBound + 0x1, maxBeforeUpdate + 0x1);
  }

  let finalResult = 0x0;
  // After all updates, query the maximum value across all possible indices (0 to 300000)
  for (let idx = 0x0; idx <= 300_000; idx++) {
    finalResult = Math.max(finalResult, activeSegmentTree.queryMaximum(idx));
  }

  return finalResult;
}
