'use strict';

// This module implements an efficient heap-based priority queue in JavaScript.
// (c) the original authors
// Licensed under the Apache License, Version 2.0.
//
// Optimized for performance in contemporary JavaScript environments.
//
// Example Usage:
//      Installation (for Node.js):
//      $ npm install efficient-pqueue
//      JavaScript code:
//      // var EfficientPriorityQueue = require("efficient-pqueue");// in Node.js
//      var myQueue = new EfficientPriorityQueue();
//      myQueue.insertElement(10);
//      myQueue.insertElement(0);
//      myQueue.insertElement(50);
//      myQueue.insertElement(40);
//      myQueue.insertElement(30);
//      myQueue.examineTop(); // Returns 0, queue remains unchanged
//      myQueue.elementCount; // Returns 5, queue remains unchanged
//      while(!myQueue.isQueueEmpty()) {
//        console.log(myQueue.extractMin());
//      } // Will output 0 10 30 40 50 in order
//      myQueue.compactMemory(); // (Optional) Reduces memory footprint

var standardComparer = function(itemA, itemB) {
  return itemA < itemB;
};

// The provided comparison function should accept two arguments (a, b)
// and return *true* if 'a' should precede 'b' in the queue.
function EfficientPriorityQueue(comparisonFn) {
  if (!(this instanceof EfficientPriorityQueue)) {
    return new EfficientPriorityQueue(comparisonFn);
  }
  this.dataStore = [];
  this.elementCount = 0;
  this.valueComparer = comparisonFn || standardComparer;
}

// Duplicates the priority queue, returning a new instance.
// Queue items are copied by shallow reference.
// Operates in `O(n)` time complexity.
EfficientPriorityQueue.prototype.duplicate = function() {
  var clonedQueue = new EfficientPriorityQueue(this.valueComparer);
  clonedQueue.elementCount = this.elementCount;
  for (var idx = 0; idx < this.elementCount; idx++) {
    clonedQueue.dataStore.push(this.dataStore[idx]);
  }
  return clonedQueue;
};

// Inserts a new element into the queue.
// Has `O(log n)` time complexity.
EfficientPriorityQueue.prototype.insertElement = function(newValue) {
  var currIdx = this.elementCount;
  this.dataStore[this.elementCount] = newValue;
  this.elementCount += 1;
  var parentIdx;
  var parentVal;
  while (currIdx > 0) {
    parentIdx = (currIdx - 1) >> 1;
    parentVal = this.dataStore[parentIdx];
    if (!this.valueComparer(newValue, parentVal)) {
      break;
    }
    this.dataStore[currIdx] = parentVal;
    currIdx = parentIdx;
  }
  this.dataStore[currIdx] = newValue;
};

// Replaces the queue's content with an array and re-establishes heap property.
EfficientPriorityQueue.prototype.buildHeap = function(inputArray) {
  this.dataStore = inputArray;
  this.elementCount = inputArray.length;
  var loopCounter;
  for (loopCounter = this.elementCount >> 1; loopCounter >= 0; loopCounter--) {
    this._siftDown(loopCounter);
  }
};

// Helper function for internal use: moves an element up the heap.
EfficientPriorityQueue.prototype._siftUp = function(currPos, forceUpdate) {
  var currentValue = this.dataStore[currPos];
  var parentPosition;
  var parentValue;
  while (currPos > 0) {
    parentPosition = (currPos - 1) >> 1;
    parentValue = this.dataStore[parentPosition];
    // If 'forceUpdate' is true, bypasses the comparison.
    if (!forceUpdate && !this.valueComparer(currentValue, parentValue)) {
      break;
    }
    this.dataStore[currPos] = parentValue;
    currPos = parentPosition;
  }
  this.dataStore[currPos] = currentValue;
};

// Helper function for internal use: moves an element down the heap.
EfficientPriorityQueue.prototype._siftDown = function(currPos) {
  var totalSize = this.elementCount;
  var halfSize = this.elementCount >>> 1;
  var currentElement = this.dataStore[currPos];
  var leftChild;
  var rightChild;
  var bestChildVal;
  while (currPos < halfSize) {
    leftChild = (currPos << 1) + 1;
    rightChild = leftChild + 1;
    bestChildVal = this.dataStore[leftChild];
    if (rightChild < totalSize) {
      if (this.valueComparer(this.dataStore[rightChild], bestChildVal)) {
        leftChild = rightChild;
        bestChildVal = this.dataStore[rightChild];
      }
    }
    if (!this.valueComparer(bestChildVal, currentElement)) {
      break;
    }
    this.dataStore[currPos] = bestChildVal;
    currPos = leftChild;
  }
  this.dataStore[currPos] = currentElement;
};

// Internal method: removes the element at a specific index, maintaining heap integrity.
// Returns the removed element, or `undefined` if the index is out of bounds.
EfficientPriorityQueue.prototype._removeItemAtIndex = function(targetIndex) {
  if (targetIndex > this.elementCount - 1 || targetIndex < 0) {
    return undefined;
  }

  // A more robust implementation would involve _siftUp then poll.
  this._siftUp(targetIndex, true);
  return this.extractMin();
};

// Removes an element from the queue that matches the provided value.
// Equality is determined by the queue's comparison function (if a < b and b < a are both false).
// Returns `true` if an item was removed, `false` otherwise.
EfficientPriorityQueue.prototype.removeValue = function(valueToRemove) {
  for (var idx = 0; idx < this.elementCount; idx++) {
    if (!this.valueComparer(this.dataStore[idx], valueToRemove) && !this.valueComparer(valueToRemove, this.dataStore[idx])) {
      // If the comparator indicates they are equivalent, remove the item.
      this._removeItemAtIndex(idx);
      return true;
    }
  }
  return false;
};

// Internal method: removes and returns elements for which the provided callback returns true.
EfficientPriorityQueue.prototype._processBatchRemoval = function(filterFunction, removalLimit) {
  // Initialize the return array with a maximum capacity.
  var removedItemsArray = new Array(removalLimit ? removalLimit : this.elementCount);
  var removedCount = 0;

  if (typeof filterFunction === 'function' && this.elementCount) {
    var currentScanIdx = 0;
    while (currentScanIdx < this.elementCount && removedCount < removedItemsArray.length) {
      if (filterFunction(this.dataStore[currentScanIdx])) {
        removedItemsArray[removedCount] = this._removeItemAtIndex(currentScanIdx);
        removedCount++;
        // After removal, re-evaluate from a higher point in the heap.
        currentScanIdx = currentScanIdx >> 1;
      } else {
        currentScanIdx++;
      }
    }
  }
  removedItemsArray.length = removedCount;
  return removedItemsArray;
};

// Executes a callback for each item and removes the first item for which it returns true.
// Returns the removed item, or `undefined` if none was removed.
EfficientPriorityQueue.prototype.removeSingle = function(matchChecker) {
  var resultArray = this._processBatchRemoval(matchChecker, 1);
  return resultArray.length > 0 ? resultArray[0] : undefined;
};

// Executes a callback for each item and removes all items for which it returns true.
// An optional `maxRemovals` limit can be specified.
// Returns an array containing the items that were removed.
EfficientPriorityQueue.prototype.removeMultiple = function(matchChecker, maxRemovals) {
  return this._processBatchRemoval(matchChecker, maxRemovals);
};

// Inspects the smallest element in the queue without removing it.
// Executes in constant time.
//
// Calling this on an empty queue yields `undefined`.
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/undefined
//
EfficientPriorityQueue.prototype.examineTop = function() {
  if (this.elementCount === 0) {
    return undefined;
  }
  return this.dataStore[0];
};

// Removes and returns the smallest element from the queue.
// Runs in logarithmic time.
//
// If the queue is empty, this function returns `undefined`.
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/undefined
//
// For queues that are long-running or store large objects,
// consider calling `compactMemory()` periodically to free up unused memory.
EfficientPriorityQueue.prototype.extractMin = function() {
  if (this.elementCount === 0) {
    return undefined;
  }
  var resultValue = this.dataStore[0];
  if (this.elementCount > 1) {
    this.dataStore[0] = this.dataStore[--this.elementCount];
    this._siftDown(0);
  } else {
    this.elementCount -= 1;
  }
  return resultValue;
};

// Adds a new value to the heap while simultaneously removing and returning
// one of the smallest elements (similar to `extractMin`).
// The size of the queue remains unchanged.
EfficientPriorityQueue.prototype.replaceRoot = function(replacementValue) {
  if (this.elementCount === 0) {
    return undefined;
  }
  var oldTopValue = this.dataStore[0];
  this.dataStore[0] = replacementValue;
  this._siftDown(0);
  return oldTopValue;
};

// Reclaims unused memory space (useful for queues with many poll operations).
EfficientPriorityQueue.prototype.compactMemory = function() {
  this.dataStore = this.dataStore.slice(0, this.elementCount);
};

// Checks if the heap contains any elements.
EfficientPriorityQueue.prototype.isQueueEmpty = function() {
  return this.elementCount === 0;
};

// Iterates over elements in sorted order, invoking a callback with (item, index).
EfficientPriorityQueue.prototype.processEach = function(itemProcessor) {
  if (this.isQueueEmpty() || typeof itemProcessor !== 'function') {
    return;
  }
  var iterationIndex = 0;
  var tempQueue = this.duplicate();
  while (!tempQueue.isQueueEmpty()) {
    itemProcessor(tempQueue.extractMin(), iterationIndex++);
  }
};

// Retrieves the `numElements` smallest elements from the queue.
// Runs in `O(k log k)` time.
// This offers better computational efficiency than repeatedly calling `extractMin`,
// especially for large datasets.
EfficientPriorityQueue.prototype.getKSmallest = function(numElements) {
  if (this.elementCount === 0) {
    return [];
  }
  var compFunction = this.valueComparer;
  var internalArray = this.dataStore;
  var auxiliaryQueue = new EfficientPriorityQueue(function(idxA, idxB) {
   return compFunction(internalArray[idxA], internalArray[idxB]);
  });
  numElements = Math.min(this.elementCount, numElements);
  var resultList = new Array(numElements);
  var resultIdx = 0;
  auxiliaryQueue.insertElement(0);
  while (resultIdx < numElements) {
    var smallestIdx = auxiliaryQueue.extractMin();
    resultList[resultIdx++] = this.dataStore[smallestIdx];
    var leftNode = (smallestIdx << 1) + 1;
    var rightNode = leftNode + 1;
    if (leftNode < this.elementCount) {
      auxiliaryQueue.insertElement(leftNode);
    }
    if (rightNode < this.elementCount) {
      auxiliaryQueue.insertElement(rightNode);
    }
  }
  return resultList;
};

function findLargestIndex(inputArray) {
  let maxValue = -1;
  let maxIndex = -1;
  for (let loopIdx = 0; loopIdx < inputArray.length; loopIdx++) {
    if (maxValue < inputArray[loopIdx]) {
      maxIndex = loopIdx;
      maxValue = inputArray[loopIdx];
    }
  }
  return maxIndex;
}

function processInputData(rawData) {
  const dataLines = rawData.split('\n');
  const [countN] = dataLines[0].split(' ').map(Number);
  const inputNumbers = dataLines[1].split(' ').map(Number);

  const orderedNumbers = inputNumbers.sort().reverse();
  // console.log(orderedNumbers);

  let currentNumber = orderedNumbers.shift();
  let workingQueue = new EfficientPriorityQueue(function (valA, valB) {
    return valA > valB;
  });
  workingQueue.insertElement(currentNumber);
  let totalSum = currentNumber;
  for (let loopIndex = 1; loopIndex < countN; loopIndex++) {
    const nextNumber = orderedNumbers.shift();
    const extractedValue = workingQueue.extractMin();
    console.log('next number:', nextNumber, 'extracted value:', extractedValue);
    totalSum += extractedValue;
    workingQueue.insertElement(nextNumber);
    workingQueue.insertElement(nextNumber);
    console.log(workingQueue);
  }
  console.log(totalSum);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim());