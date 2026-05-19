'use strict';

// This section contains utility functions and data structures.
// It's a common practice to group such reusable components.

// A very large numerical constant, used as an initial "infinity" value.
const BIG_NUM = 900719925474099; // Represents a sufficiently large number.

// Converts a space-separated string of numbers into an array of integers.
function parseNumbers(inputLine) {
  return inputLine.split(' ').map((valStr) => parseInt(valStr, 10));
}

// Implements a binary search to find the insertion point for a value in a sorted array.
// Returns the index where 'targetVal' would be inserted to maintain sorted order.
function findInsertionPoint(sortedArr, startIdx, endIdx, targetVal) {
  let midIdx;
  while (1 < endIdx - startIdx) {
    midIdx = 0 | ((startIdx + endIdx) / 2);
    if (sortedArr[midIdx] < targetVal) {
      startIdx = midIdx;
    } else {
      endIdx = midIdx;
    }
  }
  return sortedArr[startIdx] < targetVal ? endIdx : startIdx;
}

// Defines a Segment Tree data structure.
function segmentTreeStructure(totalElements) {
  let tempVal = totalElements - 1;
  let powerOfTwo = 2;
  while (tempVal) {
    tempVal >>= 1;
    powerOfTwo <<= 1;
  }
  this.dataStore = Array(powerOfTwo - 1).fill(2e9); // Initialize with a large value (effectively infinity).
  this.leafOffset = powerOfTwo >> 1;
  // console.log('Initialization details:', totalElements, powerOfTwo, this.dataStore, this.leafOffset);
}

segmentTreeStructure.prototype = {
  // Retrieves the minimum value in the segment tree that covers the given index.
  retrieveValue: function (targetIndex) {
    let currentIdx = targetIndex + this.leafOffset - 1;
    let minimumValue = 2e9; // Start with infinity.
    while (currentIdx >= 0) {
      if (this.dataStore[currentIdx] < minimumValue) {
        minimumValue = this.dataStore[currentIdx];
      }
      currentIdx = (currentIdx - 1) >> 1; // Move to parent node.
    }
    if (minimumValue === 2e9) {
      minimumValue = -1; // If no value was found, return -1.
    }
    return minimumValue;
  },

  // Updates a range [rangeStart, rangeEnd) in the segment tree with a new value.
  modifyRange: function (rangeStart, rangeEnd, newValue) {
    // console.log('Updating range:', rangeStart, rangeEnd, newValue);
    let treeValues = this.dataStore; // Reference to the internal array.

    // Recursive helper function for range updates.
    function recursiveUpdate(currentL, currentR, nodeX, nodeY, nodeIdx) {
      // console.log('Recursive call -- currentL:', currentL, 'currentR:', currentR, 'nodeX:', nodeX, 'nodeY:', nodeY, 'nodeIdx:', nodeIdx);
      if (currentL === nodeX && currentR === nodeY) {
        treeValues[nodeIdx] = newValue; // Leaf node or full coverage.
        return;
      }
      let midPoint = (nodeX + nodeY) >> 1;
      if (midPoint < currentR) {
        if (currentL < midPoint) {
          recursiveUpdate(currentL, midPoint, nodeX, midPoint, nodeIdx + nodeIdx + 1);
          recursiveUpdate(midPoint, currentR, midPoint, nodeY, (nodeIdx + 1) << 1);
        } else {
          recursiveUpdate(currentL, currentR, midPoint, nodeY, (nodeIdx + 1) << 1);
        }
      } else {
        recursiveUpdate(currentL, currentR, nodeX, midPoint, nodeIdx + nodeIdx + 1);
      }
    }
    recursiveUpdate(rangeStart, rangeEnd, 0, this.leafOffset, 0);
    // this.displayStructure(); // Optional: for debugging.
  },

  // Prints the segment tree structure for debugging purposes.
  displayStructure: function () {
    console.log(this.dataStore[0]);
    let tempArr = [];
    for (let i = 1; i <= 2; i++) {
      tempArr.push(this.dataStore[i]);
    }
    console.log(tempArr.join(' '));
    tempArr = [];
    for (let i = 3; i <= 6; i++) {
      tempArr.push(this.dataStore[i]);
    }
    console.log(tempArr.join(' '));
    tempArr = [];
    for (let i = 7; i <= 14; i++) {
      tempArr.push(this.dataStore[i]);
    }
    console.log(tempArr.join(' '));
  },
};

// Main function to process the input and generate the output.
function processInput(rawInput) {
  let inputLines = rawInput.trim().split('\n');
  let parsedHeader = parseNumbers(inputLines[0]);
  let numItems = parsedHeader.shift();
  let numQueries = parsedHeader.shift();

  let itemData = new Array(numItems);
  for (let i = 1; i <= numItems; i++) {
    itemData[i - 1] = parseNumbers(inputLines[i]);
  }

  let queryValues = new Array(numQueries);
  for (let i = 1; i <= numQueries; i++) {
    queryValues[i - 1] = parseInt(inputLines[numItems + i], 10);
  }

  let treeInstance = new segmentTreeStructure(numQueries);
  itemData.sort((a, b) => b[2] - a[2]); // Sort items by their third element in descending order.

  for (let idx = 0; idx < numItems; idx++) {
    // Skip if the item's range doesn't cover the first query value.
    if (itemData[idx][1] - itemData[idx][2] - 1 < queryValues[0]) continue;

    // Find the range of query values that this item can affect.
    let leftBound = findInsertionPoint(queryValues, 0, numQueries, itemData[idx][0] - itemData[idx][2]);
    let rightBound = findInsertionPoint(queryValues, leftBound, numQueries, itemData[idx][1] - itemData[idx][2]);

    if (leftBound < rightBound) {
      treeInstance.modifyRange(leftBound, rightBound, itemData[idx][2]);
    }
  }

  let resultsArray = Array(numQueries);
  for (let idx = 0; idx < numQueries; idx++) {
    resultsArray[idx] = treeInstance.retrieveValue(idx);
  }

  console.log(resultsArray.join('\n'));
  // treeInstance.displayStructure(); // Optional: for debugging.
}

// Reads input from stdin and passes it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
