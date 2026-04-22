'use strict'

//==================================//
// Utility Section Start
//

// Constants
const HUGE_VAL = 900719925474099; // A large constant for default minimums.

/**
 * Converts a space-separated string of numbers into an array of integers.
 * @param {string} inputString - The string containing space-separated numbers.
 * @returns {number[]} An array of parsed integers.
 */
function parseIntegerArray(inputString) {
  return inputString.split(' ').map((valStr) => parseInt(valStr, 10));
}

/**
 * Finds the lower bound of a target value in a sorted array using binary search.
 * @param {number[]} dataArr - The sorted array to search within.
 * @param {number} startIndex - The starting index for the search range.
 * @param {number} endIndex - The ending index (exclusive) for the search range.
 * @param {number} targetValue - The value to find the lower bound for.
 * @returns {number} The index of the first element not less than the target value.
 */
function findLowerBound(dataArr, startIndex, endIndex, targetValue) {
  let midIndex;
  while (1 < endIndex - startIndex) {
    midIndex = Math.floor((startIndex + endIndex) / 2);
    if (dataArr[midIndex] < targetValue) {
      startIndex = midIndex;
    } else {
      endIndex = midIndex;
    }
  }
  return dataArr[startIndex] < targetValue ? endIndex : startIndex;
}

/**
 * Constructor for a Segment Tree data structure.
 * Initializes the tree with a default large value.
 * @param {number} totalElements - The number of elements the segment tree will manage.
 */
function SegmentTree(totalElements) {
  let tempCount = totalElements - 1;
  let treeSize = 2;

  while (tempCount) {
    tempCount >>= 1;
    treeSize <<= 1;
  }

  this.treeNodes = new Array(treeSize - 1).fill(2_000_000_000); // Initialize with a very large number
  this.leafOffset = treeSize >> 1;
  // console.debug('Initialization:', totalElements, treeSize, this.treeNodes, this.leafOffset);
}

SegmentTree.prototype = {
  /**
   * Retrieves the minimum value in the segment tree up to a given index.
   * @param {number} queryIndex - The index for which to retrieve the minimum.
   * @returns {number} The minimum value found, or -1 if no valid minimum (i.e., still default value).
   */
  retrieveMinimum: function (queryIndex) {
    queryIndex += this.leafOffset - 1;
    let resultMin = 2_000_000_000; // Start with the default large value

    while (queryIndex >= 0) {
      if (this.treeNodes[queryIndex] < resultMin) {
        resultMin = this.treeNodes[queryIndex];
      }
      queryIndex = (queryIndex - 1) >> 1;
    }

    if (resultMin === 2_000_000_000) {
      resultMin = -1;
    }
    return resultMin;
  },

  /**
   * Applies an update value to a specified range within the segment tree.
   * This is a range update operation.
   * @param {number} rangeStart - The starting index of the update range (inclusive).
   * @param {number} rangeEnd - The ending index of the update range (exclusive).
   * @param {number} updateValue - The value to apply to the range.
   */
  applyUpdate: function (rangeStart, rangeEnd, updateValue) {
    // console.debug('Applying update:', rangeStart, rangeEnd, updateValue);
    let nodeValues = this.treeNodes;

    /**
     * Recursive helper function for range updates.
     * @param {number} currentL - The current left boundary of the query.
     * @param {number} currentR - The current right boundary of the query.
     * @param {number} nodeRangeStart - The left boundary of the current tree node's range.
     * @param {number} nodeRangeEnd - The right boundary of the current tree node's range.
     * @param {number} nodeIndex - The index of the current tree node.
     */
    function recursiveUpdate(currentL, currentR, nodeRangeStart, nodeRangeEnd, nodeIndex) {
      // console.debug('Recursive Call:', currentL, currentR, nodeRangeStart, nodeRangeEnd, nodeIndex);
      if (currentL === nodeRangeStart && currentR === nodeRangeEnd) {
        nodeValues[nodeIndex] = updateValue;
        return;
      }

      let midPoint = (nodeRangeStart + nodeRangeEnd) >> 1;

      if (midPoint < currentR) {
        if (currentL < midPoint) {
          recursiveUpdate(currentL, midPoint, nodeRangeStart, midPoint, nodeIndex * 2 + 1);
          recursiveUpdate(midPoint, currentR, midPoint, nodeRangeEnd, (nodeIndex + 1) * 2);
        } else {
          recursiveUpdate(currentL, currentR, midPoint, nodeRangeEnd, (nodeIndex + 1) * 2);
        }
      } else {
        recursiveUpdate(currentL, currentR, nodeRangeStart, midPoint, nodeIndex * 2 + 1);
      }
    }

    recursiveUpdate(rangeStart, rangeEnd, 0, this.leafOffset, 0);
    // this.displayTreeState();
  },

  /**
   * Prints the current state of the segment tree nodes for debugging purposes.
   * Displays nodes level by level.
   */
  displayTreeState: function () {
    console.log(this.treeNodes[0]);

    let segmentParts = [];
    for (let k = 1; k <= 2; ++k) {
      segmentParts.push(this.treeNodes[k]);
    }
    console.log(segmentParts.join(' '));

    segmentParts = [];
    for (let k = 3; k <= 6; ++k) {
      segmentParts.push(this.treeNodes[k]);
    }
    console.log(segmentParts.join(' '));

    segmentParts = [];
    for (let k = 7; k <= 14; ++k) {
      segmentParts.push(this.treeNodes[k]);
    }
    console.log(segmentParts.join(' '));
  },
};

//
// Utility Section End
//==================================//

/**
 * Main function to process input data, perform calculations, and output results.
 * @param {string} rawData - The raw input string read from stdin.
 */
function processInputData(rawData) {
  let linesArray = rawData.trim().split('\n');

  let firstLineNumbers = parseIntegerArray(linesArray[0]);
  let numItems = firstLineNumbers.shift();
  let numQueries = firstLineNumbers.shift();

  let itemData = new Array(numItems);
  for (let idx = 1; idx <= numItems; ++idx) {
    itemData[idx - 1] = parseIntegerArray(linesArray[idx]);
  }

  let queryValues = new Array(numQueries);
  for (let idx = 1; idx <= numQueries; ++idx) {
    queryValues[idx - 1] = parseInt(linesArray[numItems + idx], 10);
  }

  let segmentDataManager = new SegmentTree(numQueries);
  itemData.sort((itemA, itemB) => itemB[2] - itemA[2]); // Sort items in descending order based on the third element

  for (let currentItemIdx = 0; currentItemIdx < numItems; ++currentItemIdx) {
    // Skip if the condition for the first query value is not met
    if (itemData[currentItemIdx][1] - itemData[currentItemIdx][2] - 1 < queryValues[0]) {
      continue;
    }

    // Find the left boundary for the update range
    let leftBound = findLowerBound(queryValues, 0, numQueries, itemData[currentItemIdx][0] - itemData[currentItemIdx][2]);
    // Find the right boundary for the update range
    let rightBound = findLowerBound(queryValues, leftBound, numQueries, itemData[currentItemIdx][1] - itemData[currentItemIdx][2]);

    // If the range is valid, apply the update to the segment tree
    if (leftBound < rightBound) {
      segmentDataManager.applyUpdate(leftBound, rightBound, itemData[currentItemIdx][2]);
    }
  }

  let finalResults = new Array(numQueries);
  for (let resultIdx = 0; resultIdx < numQueries; ++resultIdx) {
    finalResults[resultIdx] = segmentDataManager.retrieveMinimum(resultIdx);
  }

  console.log(finalResults.join("\n"));
  // segmentDataManager.displayTreeState();
}

// Execute the main processing function with data from standard input
processInputData(require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" }));