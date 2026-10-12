"use strict";

class InputReader {
  constructor(inputString) {
    this.tokens = inputString.split(/ |\n/);
    this.currentIndex = 0;
  }

  readNextInt() {
    return +this.tokens[this.currentIndex++];
  }

  readNextString() {
    return this.tokens[this.currentIndex++];
  }

  readNextBigInt() {
    return BigInt(this.tokens[this.currentIndex++]);
  }

  readNInts(count) {
    const result = this.tokens.slice(this.currentIndex, this.currentIndex + count).map(Number);
    this.currentIndex += count;
    return result;
  }

  readNStrings(count) {
    const result = this.tokens.slice(this.currentIndex, this.currentIndex + count);
    this.currentIndex += count;
    return result;
  }

  readNSortedInts(count, descending = false) {
    const numbers = this.readNInts(count);
    return numbers.sort((a, b) => descending ? b - a : a - b);
  }

  readMatrix(height, width, asStrings = false) {
    const matrix = [];
    for (let i = 0; i < height; i++) {
      if (asStrings) {
        matrix.push(this.readNStrings(width));
      } else {
        matrix.push(this.readNInts(width));
      }
    }
    return matrix;
  }
}

// Helper function to create multi-dimensional arrays without using eval
function createMultiDimArray(initialValue, ...dimensions) {
  if (dimensions.length === 0) {
    return initialValue;
  }

  const createRecursive = (dimIndex) => {
    if (dimIndex === dimensions.length - 1) {
      return Array(dimensions[dimIndex]).fill(initialValue);
    } else {
      return Array(dimensions[dimIndex]).fill(null).map(() => createRecursive(dimIndex + 1));
    }
  };

  return createRecursive(0);
}

const outputBuffer = [];
function appendToOutput(content) { outputBuffer.push(content); }

const defaultValue = 0;

function SegmentTree(capacity) {
  // Calculate the smallest power of 2 that is greater than or equal to capacity
  let leafCount = 1;
  while (leafCount < capacity) {
    leafCount <<= 1;
  }
  // The total number of nodes in a complete binary tree with 'leafCount' leaves is 2*leafCount - 1
  this.treeData = Array(leafCount * 2 - 1).fill(defaultValue);
  // 'leafOffset' is the index of the first leaf node in the 'treeData' array
  this.leafOffset = leafCount;
}

SegmentTree.prototype = {
  queryMax: function (queryIndex) {
    const treeNodes = this.treeData;
    const offset = this.leafOffset;
    let currentIdx = queryIndex + offset - 1; // Convert query index to leaf node index
    let resultMax = defaultValue;

    // Traverse up from the leaf node to the root, updating resultMax
    while (currentIdx >= 0) {
      if (treeNodes[currentIdx] > resultMax) {
        resultMax = treeNodes[currentIdx];
      }
      currentIdx = Math.floor((currentIdx - 1) / 2); // Move to parent node
    }
    return resultMax;
  },

  rangeUpdate: function (rangeStart, rangeEnd, updateValue) {
    // Guard clause: if the range is empty or invalid, do nothing
    if (rangeStart >= rangeEnd) {
      return;
    }
    // Initiate the recursive update process from the root node
    this._performRecursiveUpdate(rangeStart, rangeEnd, 0, this.leafOffset, 0, updateValue);
  },

  // Internal helper method for recursive range updates
  _performRecursiveUpdate: function (queryL, queryR, nodeL, nodeR, nodeIdx, valueToSet) {
    // Base case: If the current node's range exactly matches the query range, update it
    if (queryL === nodeL && queryR === nodeR) {
      this.treeData[nodeIdx] = valueToSet;
      return;
    }

    const mid = Math.floor((nodeL + nodeR) / 2); // Calculate the midpoint of the current node's range

    // Determine which child node(s) to recurse into based on the query range
    if (queryR <= mid) { // The query range is entirely within the left child's range
      this._performRecursiveUpdate(queryL, queryR, nodeL, mid, nodeIdx * 2 + 1, valueToSet);
    } else if (queryL >= mid) { // The query range is entirely within the right child's range
      this._performRecursiveUpdate(queryL, queryR, mid, nodeR, nodeIdx * 2 + 2, valueToSet);
    } else { // The query range spans across both children
      // Recurse into the left child for the left part of the query range
      this._performRecursiveUpdate(queryL, mid, nodeL, mid, nodeIdx * 2 + 1, valueToSet);
      // Recurse into the right child for the right part of the query range
      this._performRecursiveUpdate(mid, queryR, mid, nodeR, nodeIdx * 2 + 2, valueToSet);
    }
  },
};

const finalResult = executeMainLogic();
if (finalResult !== undefined) console.log(String(finalResult));
if (outputBuffer.length) console.log(outputBuffer.join("\n"));

function executeMainLogic() {
  const MAX_COORD_VALUE = 300000;
  const inputReader = new InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

  const [numElements, rangeK] = inputReader.readNInts(2);
  const inputArray = inputReader.readNInts(numElements);

  // Initialize a segment tree to cover coordinates from 0 to MAX_COORD_VALUE
  const segmentTreeInstance = new SegmentTree(MAX_COORD_VALUE + 1);

  // Helper function to clamp a value within a specified range
  const clampValue = (value, minBoundary, maxBoundary) => Math.max(minBoundary, Math.min(value, maxBoundary));

  // Process each element in the input array
  for (let idx = 0; idx < numElements; idx++) {
    const currentCoordinate = inputArray[idx];
    // Calculate the lower and upper bounds for the update range, clamped to [0, MAX_COORD_VALUE]
    const lowerBound = clampValue(currentCoordinate - rangeK, 0, MAX_COORD_VALUE);
    const upperBound = clampValue(currentCoordinate + rangeK, 0, MAX_COORD_VALUE);
    
    // Query the current maximum value at the current coordinate
    const valueAtCurrentCoord = segmentTreeInstance.queryMax(currentCoordinate);
    
    // Update the segment tree for the calculated range [lowerBound, upperBound + 1)
    // The value to set is one greater than the queried value, representing a path increase
    segmentTreeInstance.rangeUpdate(lowerBound, upperBound + 1, valueAtCurrentCoord + 1);
  }

  let overallMaxResult = 0;
  // Iterate through all possible coordinates to find the maximum value stored in the segment tree
  for (let idx = 0; idx <= MAX_COORD_VALUE; idx++) {
    overallMaxResult = Math.max(overallMaxResult, segmentTreeInstance.queryMax(idx));
  }
  return overallMaxResult;
}
