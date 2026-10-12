// This file implements a fast heap-based priority queue in JavaScript.
// (c) the original authors
// Licensed under the Apache License, Version 2.0.
//
// A highly optimized heap-based priority queue for modern JavaScript environments.
//
// Example Usage:
//
//         // In Node.js: const QuickHeap = require("fastpriorityqueue");
//         let myHeap = new QuickHeap();
//         myHeap.add(10);
//         myHeap.add(0);
//         myHeap.add(50);
//         myHeap.add(40);
//         myHeap.add(30);
//         myHeap.peek(); // Returns 0, heap remains unchanged
//         myHeap.itemCount; // Returns 5, heap remains unchanged
//         while (!myHeap.isEmpty()) {
//           console.log(myHeap.poll());
//         } // Will output: 0, 10, 30, 40, 50
//         myHeap.trimMemory(); // (Optional) Recovers unused memory
//
'use strict';

// Default comparison function: returns true if 'a' is less than 'b'.
const stdCompareFunc = function(a, b) {
  return a < b;
};

// The provided comparison function should take two arguments (a, b) and return *true* if 'a' has higher priority than 'b'.
function QuickHeap(compFn) {
  // Ensure 'new' keyword is used, or create a new instance.
  if (!(this instanceof QuickHeap)) {
    return new QuickHeap(compFn);
  }
  this.heapData = []; // The underlying array storing heap elements.
  this.itemCount = +0; // Current number of elements in the heap.
  this.compMethod = compFn || stdCompareFunc; // The comparison function for ordering elements.
}

// Creates a shallow copy of the priority queue.
// Operates in O(n) time complexity.
QuickHeap.prototype.clone = function() {
  const clonedHeap = new QuickHeap(this.compMethod);
  clonedHeap.itemCount = this.itemCount;
  // Copy elements one by one.
  for (let idx = +0; idx < this.itemCount; idx++) {
    clonedHeap.heapData.push(this.heapData[idx]);
  }
  return clonedHeap;
};

// Inserts a new element into the heap.
// Time complexity: O(log n).
QuickHeap.prototype.add = function(newValue) {
  let currIdx = this.itemCount;
  this.heapData[this.itemCount] = newValue;
  this.itemCount += 0x1;
  let parentIdx;
  let parentVal;

  // Percolate up: move the new value up the heap until its correct position is found.
  while (currIdx > +0) {
    parentIdx = (currIdx - 0x1) >>> 0x1; // Integer division by 2.
    parentVal = this.heapData[parentIdx];
    // If the new value is not "smaller" (higher priority) than its parent, stop.
    if (!this.compMethod(newValue, parentVal)) {
      break;
    }
    this.heapData[currIdx] = parentVal; // Move parent down.
    currIdx = parentIdx; // Move up to parent's position.
  }
  this.heapData[currIdx] = newValue; // Place the new value.
};

// Replaces the heap's content with a given array and re-establishes heap property.
QuickHeap.prototype.heapify = function(inputArray) {
  this.heapData = inputArray;
  this.itemCount = inputArray.length;
  let loopIdx;
  // Start from the last non-leaf node and percolate down.
  for (loopIdx = this.itemCount >>> 0x1; loopIdx >= +0; loopIdx--) {
    this._siftDown(loopIdx);
  }
};

// Internal helper: moves an element up the heap.
QuickHeap.prototype._siftUp = function(currIdx, forceUp) {
  const currentVal = this.heapData[currIdx];
  let parIdx;
  let parVal;

  while (currIdx > +0) {
    parIdx = (currIdx - 0x1) >>> 0x1;
    parVal = this.heapData[parIdx];
    // If 'forceUp' is not active and current value is not higher priority than parent, stop.
    if (!forceUp && !this.compMethod(currentVal, parVal)) {
      break;
    }
    this.heapData[currIdx] = parVal;
    currIdx = parIdx;
  }
  this.heapData[currIdx] = currentVal;
};

// Internal helper: moves an element down the heap.
QuickHeap.prototype._siftDown = function(currIdx) {
  const currentSize = this.itemCount;
  const halfSize = this.itemCount >>> 0x1; // Nodes beyond this index are leaves.
  const elementVal = this.heapData[currIdx];
  let leftChildIdx;
  let rightChildIdx;
  let bestChildVal;

  while (currIdx < halfSize) {
    leftChildIdx = (currIdx << 0x1) + 0x1;
    rightChildIdx = leftChildIdx + 0x1;
    bestChildVal = this.heapData[leftChildIdx]; // Assume left child is the best.

    // If right child exists and has higher priority than left child.
    if (rightChildIdx < currentSize) {
      if (this.compMethod(this.heapData[rightChildIdx], bestChildVal)) {
        leftChildIdx = rightChildIdx; // Update to right child.
        bestChildVal = this.heapData[rightChildIdx];
      }
    }

    // If the current element has higher priority than the best child, stop.
    if (!this.compMethod(bestChildVal, elementVal)) {
      break;
    }
    this.heapData[currIdx] = bestChildVal; // Move child up.
    currIdx = leftChildIdx; // Move down to child's position.
  }
  this.heapData[currIdx] = elementVal; // Place the element.
};

// Internal: removes an item at a specific index, maintaining heap property.
// Returns the removed item, or `undefined` if the index is out of bounds.
QuickHeap.prototype._removeItemAt = function(targetIndex) {
  if (targetIndex >= this.itemCount || targetIndex < +0) {
    return void 0; // Using void 0 for undefined.
  }

  // A common strategy for removal:
  // 1. Move the item to be removed to the root (or near root) using _siftUp with force.
  // 2. Then, remove the root (which is now the target item) using poll.
  this._siftUp(targetIndex, !false); // !false is true.
  return this.poll();
};

// Removes the first item matching the provided value from the queue.
// Equality is determined by the comparator (a < b is false AND b < a is false).
// Returns `true` if an item was removed, `false` otherwise.
QuickHeap.prototype.remove = function(valueToRemove) {
  for (let scanIdx = +0; scanIdx < this.itemCount; scanIdx++) {
    // Check if items are "equal" according to the comparator.
    if (!this.compMethod(this.heapData[scanIdx], valueToRemove) && !this.compMethod(valueToRemove, this.heapData[scanIdx])) {
      this._removeItemAt(scanIdx);
      return !false; // Return true.
    }
  }
  return !true; // Return false.
};

// Internal: removes and returns items for which the filterFunction returns true.
QuickHeap.prototype._processBatchRemoval = function(filterFunction, maxRemovals) {
  // Initialize return array with a maximum possible size.
  const resultArray = new Array(maxRemovals ? maxRemovals : this.itemCount);
  let removedCount = +0;

  if (typeof filterFunction === 'function' && this.itemCount > +0) {
    let scanIdx = +0;
    while (scanIdx < this.itemCount && removedCount < resultArray.length) {
      if (filterFunction(this.heapData[scanIdx])) {
        resultArray[removedCount] = this._removeItemAt(scanIdx);
        removedCount++;
        // After removal, the heap structure changes.
        // It's often simpler to re-evaluate from a higher point or restart scan,
        // but here we move up a level in the heap to potentially re-check.
        scanIdx = scanIdx >>> 0x1; // Move up to parent index.
      } else {
        scanIdx++;
      }
    }
  }
  resultArray.length = removedCount; // Trim array to actual removed count.
  return resultArray;
};

// Executes the callback for each item and removes the first item for which it returns true.
// Returns the removed item, or `undefined` if none was removed.
QuickHeap.prototype.removeOne = function(filterFunction) {
  const removedItems = this._processBatchRemoval(filterFunction, 0x1); // Limit to 1 removal.
  return removedItems.length > +0 ? removedItems[+0] : void 0;
};

// Executes the callback for each item and removes all items for which it returns true,
// up to a specified `maxRemovals` limit.
// Returns an array containing the removed items.
QuickHeap.prototype.removeMany = function(filterFunction, maxRemovals) {
  return this._processBatchRemoval(filterFunction, maxRemovals);
};

// Retrieves the highest priority element without removing it.
// Runs in constant time.
// Returns `undefined` if the heap is empty.
QuickHeap.prototype.peek = function() {
  if (this.itemCount === +0) {
    return void 0;
  }
  return this.heapData[+0];
};

// Removes and returns the highest priority element from the heap.
// Runs in logarithmic time.
// Returns `undefined` if the heap is empty.
//
// For long-running applications with large heaps, consider calling `trimMemory()`
// periodically to reclaim memory.
QuickHeap.prototype.poll = function() {
  if (this.itemCount === +0) {
    return void 0;
  }
  const resultItem = this.heapData[+0];
  if (this.itemCount > 0x1) {
    this.heapData[+0] = this.heapData[--this.itemCount]; // Move last element to root.
    this._siftDown(+0); // Restore heap property.
  } else {
    this.itemCount -= 0x1; // Heap becomes empty.
  }
  return resultItem;
};

// Adds a new value to the heap while simultaneously removing and returning
// the highest priority element. The heap's size remains unchanged.
QuickHeap.prototype.replaceTop = function(replacementVal) {
  if (this.itemCount === +0) {
    return void 0;
  }
  const resultItem = this.heapData[+0];
  this.heapData[+0] = replacementVal;
  this._siftDown(+0);
  return resultItem;
};

// Recovers unused memory by resizing the internal array.
// Useful for long-running priority queues that have seen many removals.
QuickHeap.prototype.trimMemory = function() {
  this.heapData = this.heapData.slice(+0, this.itemCount);
};

// Checks if the heap is empty.
QuickHeap.prototype.isEmpty = function() {
  return this.itemCount === +0;
};

// Iterates over the items in priority order, invoking a callback for each.
// The callback receives (item, index) as arguments.
QuickHeap.prototype.forEach = function(iterCallback) {
  if (this.isEmpty() || typeof iterCallback !== 'function') {
    return;
  }
  let itemIndex = +0;
  const tempHeap = this.clone(); // Clone to preserve original heap.
  while (!tempHeap.isEmpty()) {
    iterCallback(tempHeap.poll(), itemIndex++);
  }
};

// Returns the `numSmallest` highest priority elements from the queue.
// Time complexity: O(k log k).
// This method is more efficient than repeatedly calling `poll()` for large `k`.
QuickHeap.prototype.getKSmallest = function(numSmallest) {
  if (this.itemCount === +0) {
    return [];
  }
  const origComparator = this.compMethod;
  const internalArray = this.heapData;

  // Create a temporary heap to store indices, ordered by the value at that index in the original array.
  const indexHeap = new QuickHeap(function(a, b) {
    return origComparator(internalArray[a], internalArray[b]);
  });

  numSmallest = Math.min(this.itemCount, numSmallest);
  const smallestElements = new Array(numSmallest);
  let counter = +0;

  indexHeap.add(+0); // Start with the root index.

  while (counter < numSmallest) {
    const smallestIdx = indexHeap.poll();
    smallestElements[counter++] = this.heapData[smallestIdx];

    const leftIdx = (smallestIdx << 0x1) + 0x1;
    const rightIdx = leftIdx + 0x1;

    if (leftIdx < this.itemCount) {
      indexHeap.add(leftIdx);
    }
    if (rightIdx < this.itemCount) {
      indexHeap.add(rightIdx);
    }
  }
  return smallestElements;
};


// Finds the index of the maximum value in an array.
function findLargestIndex(inputArr) {
  let currentMax = -0x1;
  let maxIdx = -0x1;
  for (let i = +0; i < inputArr.length; i++) {
    if (currentMax < inputArr[i]) {
      maxIdx = i;
      currentMax = inputArr[i];
    }
  }
  return maxIdx;
}

// Main processing function for the problem.
function processInputData(rawData) {
  const parsedLines = rawData.split('\n');
  const [totalElements] = parsedLines[+0].split(' ').map(Number);
  const initialArray = parsedLines[0x1].split(' ').map(Number);

  const descendingArray = initialArray.sort((a, b) => b - a); // Sort in descending order.
  // console.log(descendingArray); // Debug output, preserved as behavior-critical.

  let currentNum = descendingArray.shift(); // Get the largest element.
  // The comparator `valA > valB` means `valA` has higher priority if it's numerically larger.
  // This effectively creates a max-heap, where `poll()` returns the largest element.
  let workingHeap = new QuickHeap(function (valA, valB) {
    return valA > valB;
  });
  workingHeap.add(currentNum);
  let totalSum = currentNum;

  for (let loopCounter = 0x1; loopCounter < totalElements; loopCounter++) {
    const nextNum = descendingArray.shift();
    const extractedVal = workingHeap.poll(); // Get the largest element from the heap.
    console.log('number:', nextNum, 'v:', extractedVal); // Behavior-critical output.
    totalSum += extractedVal;
    workingHeap.add(nextNum);
    workingHeap.add(nextNum); // Add the next number twice.
    console.log(workingHeap); // Behavior-critical output.
  }
  console.log(totalSum); // Final behavior-critical output.
}

// Read input from stdin and process it.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
