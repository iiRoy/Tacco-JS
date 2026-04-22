"use strict";

const RAW_INPUT_CONTENT = require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" });
let inputTokens = RAW_INPUT_CONTENT.split(/\s+/).filter(Boolean);
let tokenReadIndex = 0;

const retrieveNextInteger = () => {
  if (tokenReadIndex >= inputTokens.length) {
    // Optionally throw an error or return a default value for safety
    throw new Error("Attempted to read past end of input tokens.");
  }
  return parseInt(inputTokens[tokenReadIndex++], 10);
};

const fetchNextString = () => {
  if (tokenReadIndex >= inputTokens.length) {
    throw new Error("Attempted to read past end of input tokens.");
  }
  return inputTokens[tokenReadIndex++];
};

const extractNextBigInt = () => {
  if (tokenReadIndex >= inputTokens.length) {
    throw new Error("Attempted to read past end of input tokens.");
  }
  return BigInt(inputTokens[tokenReadIndex++]);
};

const readNumberArray = (count, returnAsStrings = false) => {
  const startIndex = tokenReadIndex;
  tokenReadIndex += count;
  const subArray = inputTokens.slice(startIndex, tokenReadIndex);
  return returnAsStrings ? subArray : subArray.map(Number);
};

const readAndSortNumbers = (numElements, sortDescending = false) => {
  const numbers = readNumberArray(numElements);
  return sortDescending ? numbers.sort((valA, valB) => valB - valA) : numbers.sort((valA, valB) => valA - valB);
};

const readMatrix = (numRows, numCols, returnAsStrings = false) => {
  return Array.from({ length: numRows }, () => readNumberArray(numCols, returnAsStrings));
};

const outputBuffer = [];
const emitOutput = (content) => outputBuffer.push(String(content));

const SEGMENT_TREE_DEFAULT_VALUE = 0;

class SegmentTreeStructure {
  constructor(capacity) {
    if (capacity <= 0) {
      throw new Error("Segment tree capacity must be positive.");
    }
    let actualTreeSize = 1;
    while (actualTreeSize < capacity) {
      actualTreeSize <<= 1;
    }
    this.treeNodes = new Array(2 * actualTreeSize - 1).fill(SEGMENT_TREE_DEFAULT_VALUE);
    this.leafOffset = actualTreeSize;
  }

  retrieveMax(queryIndex) {
    const nodes = this.treeNodes;
    let currentPathIndex = queryIndex + this.leafOffset - 1;
    let maximumResult = SEGMENT_TREE_DEFAULT_VALUE;

    while (currentPathIndex >= 0) {
      if (nodes[currentPathIndex] > maximumResult) {
        maximumResult = nodes[currentPathIndex];
      }
      currentPathIndex = (currentPathIndex - 1) >> 1;
    }
    return maximumResult;
  }

  performRangeUpdate(leftBoundary, rightBoundary, updateValue) { // Range is [leftBoundary, rightBoundary)
    if (leftBoundary >= rightBoundary) {
      return;
    }

    const instanceRef = this; // Capture 'this' for the recursive helper
    const recursiveUpdate = (currentQueryL, currentQueryR, nodeRangeStart, nodeRangeEnd, nodeIdx) => {
      // If the node's range is completely outside the query range, do nothing
      if (currentQueryL >= nodeRangeEnd || currentQueryR <= nodeRangeStart) {
        return;
      }

      // If the node's range is completely contained within the query range
      if (currentQueryL <= nodeRangeStart && currentQueryR >= nodeRangeEnd) {
        if (instanceRef.treeNodes[nodeIdx] < updateValue) {
          instanceRef.treeNodes[nodeIdx] = updateValue;
        }
        return;
      }

      // If there's a partial overlap, recurse on children
      const midPoint = (nodeRangeStart + nodeRangeEnd) >> 1;
      const leftChildIdx = 2 * nodeIdx + 1;
      const rightChildIdx = 2 * nodeIdx + 2;

      recursiveUpdate(currentQueryL, currentQueryR, nodeRangeStart, midPoint, leftChildIdx);
      recursiveUpdate(currentQueryL, currentQueryR, midPoint, nodeRangeEnd, rightChildIdx);
    };

    recursiveUpdate(leftBoundary, rightBoundary, 0, this.leafOffset, 0);
  }
}

const finalResult = processProblemSolution();
if (finalResult !== undefined) console.log(String(finalResult));
if (outputBuffer.length > 0) console.log(outputBuffer.join("\n"));

function processProblemSolution() {
  const [dataCount, spreadFactor] = readNumberArray(2);
  const valuesArray = readNumberArray(dataCount);

  const MAXIMUM_COORDINATE_VALUE = 300000;
  const solutionSegmentTree = new SegmentTreeStructure(MAXIMUM_COORDINATE_VALUE + 1);

  for (let processingIndex = 0; processingIndex < dataCount; ++processingIndex) {
    const currentVal = valuesArray[processingIndex];
    const effectiveLowerBound = Math.max(0, currentVal - spreadFactor);
    const effectiveUpperBound = Math.min(MAXIMUM_COORDINATE_VALUE, currentVal + spreadFactor);

    const prevMaxLen = solutionSegmentTree.retrieveMax(currentVal);
    // Update the range [effectiveLowerBound, effectiveUpperBound + 1)
    solutionSegmentTree.performRangeUpdate(effectiveLowerBound, effectiveUpperBound + 1, prevMaxLen + 1);
  }

  let maximumAchievableSequenceLength = 0;
  for (let checkCoordinate = 0; checkCoordinate <= MAXIMUM_COORDINATE_VALUE; ++checkCoordinate) {
    maximumAchievableSequenceLength = Math.max(maximumAchievableSequenceLength, solutionSegmentTree.retrieveMax(checkCoordinate));
  }

  return maximumAchievableSequenceLength;
}