/**
 * @file This module defines a custom min-priority queue implementation
 *       and then uses it in a solution for a specific algorithmic problem.
 *       The priority queue maintains its elements in a heap structure,
 *       ensuring that the smallest element is always at the root.
 */

/**
 * Default comparison function for the priority queue.
 * Assumes a natural ordering (ascending).
 * @param {*} a - First element for comparison.
 * @param {*} b - Second element for comparison.
 * @returns {boolean} True if 'a' is considered less than 'b'.
 */
const defaultComparisonLogic = (a, b) => a < b;

/**
 * Represents a Min-Priority Queue (Min-Heap) data structure.
 * Elements are stored in a way that allows efficient retrieval of the minimum element.
 *
 * @class MinHeapStruct
 * @param {Function} [comparisonFunction=defaultComparisonLogic] - A function that
 *   takes two arguments (a, b) and returns `true` if `a` should come before `b`
 *   in the sorted order (i.e., `a < b`).
 */
function MinHeapStruct(comparisonFunction) {
  // Ensure the constructor is called with `new`
  if (!(this instanceof MinHeapStruct)) {
    return new MinHeapStruct(comparisonFunction);
  }

  // Internal array to store the heap elements.
  this.heapStorage = [];
  // Current number of elements in the heap.
  this.elementCount = 0;

  // Validate and assign the comparison function.
  if (typeof comparisonFunction === 'function') {
    this.isLess = comparisonFunction;
  } else if (comparisonFunction === undefined) {
    this.isLess = defaultComparisonLogic;
  } else {
    // Fallback or throw error if invalid comparator is provided
    console.warn("Invalid comparison function provided. Using default.");
    this.isLess = defaultComparisonLogic;
  }
}

/**
 * Private utility to move an element up the heap to maintain heap property.
 * This is typically used after adding a new element.
 *
 * @private
 * @param {number} initialIndex - The starting index of the element to sift up.
 * @param {boolean} [forceSift=false] - If true, the comparison check is skipped,
 *   forcing the element to move up until it's at the root or its parent is smaller.
 *   Useful for temporary manipulation during removal.
 */
MinHeapStruct.prototype._siftUp = function(initialIndex, forceSift = false) {
  // Guard against invalid index
  if (initialIndex < 0 || initialIndex >= this.elementCount) {
    return;
  }

  const elementToSift = this.heapStorage[initialIndex];
  let currentPosition = initialIndex;
  let parentIndex;
  let parentElement;

  // Continue sifting up as long as the current element is not the root
  // and is smaller than its parent (or forceSift is active).
  while (currentPosition > 0) {
    parentIndex = Math.floor((currentPosition - 1) / 2); // Calculate parent index
    parentElement = this.heapStorage[parentIndex];

    // If not forced, and the element is NOT smaller than its parent, stop.
    if (!forceSift && !this.isLess(elementToSift, parentElement)) {
      break;
    }

    // Move parent down to current position
    this.heapStorage[currentPosition] = parentElement;
    currentPosition = parentIndex; // Move up to parent's position
  }
  // Place the elementToSift in its final sorted position
  this.heapStorage[currentPosition] = elementToSift;
};

/**
 * Private utility to move an element down the heap to maintain heap property.
 * This is typically used after removing the root or replacing an element.
 *
 * @private
 * @param {number} initialIndex - The starting index of the element to sift down.
 */
MinHeapStruct.prototype._siftDown = function(initialIndex) {
  // Guard against invalid index or empty heap.
  if (initialIndex < 0 || initialIndex >= this.elementCount || this.elementCount === 0) {
    return;
  }

  const currentSize = this.elementCount;
  const halfHeapSize = Math.floor(currentSize / 2); // Elements beyond this are leaves
  let currentPosition = initialIndex;
  const elementToSift = this.heapStorage[initialPosition];
  let leftChildIndex, rightChildIndex;
  let bestChildIndex; // Index of the smallest child
  let bestChildValue; // Value of the smallest child

  // Continue sifting down as long as the current position is not a leaf node
  while (currentPosition < halfHeapSize) {
    leftChildIndex = (currentPosition * 2) + 1;
    rightChildIndex = leftChildIndex + 1;

    bestChildIndex = leftChildIndex;
    bestChildValue = this.heapStorage[leftChildIndex];

    // Check if right child exists and is smaller than the left child
    if (rightChildIndex < currentSize) {
      if (this.isLess(this.heapStorage[rightChildIndex], bestChildValue)) {
        bestChildIndex = rightChildIndex;
        bestChildValue = this.heapStorage[rightChildIndex];
      }
    }

    // If the elementToSift is NOT smaller than its best child, stop sifting.
    if (!this.isLess(bestChildValue, elementToSift)) {
      break;
    }

    // Move the best child up to the current position
    this.heapStorage[currentPosition] = bestChildValue;
    currentPosition = bestChildIndex; // Move down to the best child's position
  }
  // Place the elementToSift in its final sorted position
  this.heapStorage[currentPosition] = elementToSift;
};

/**
 * Adds a new element to the heap, maintaining the heap property.
 * Runs in O(log n) time.
 *
 * @param {*} valueToAdd - The element to be inserted into the heap.
 */
MinHeapStruct.prototype.addElement = function(valueToAdd) {
  // Optional: Guard against null/undefined if not desired in heap
  if (valueToAdd === null || valueToAdd === undefined) {
    console.warn("Attempted to add null/undefined element to heap. Skipping.");
    return;
  }

  // Place the new element at the end of the array
  this.heapStorage[this.elementCount] = valueToAdd;
  this.elementCount++;

  // Sift the new element up to its correct position
  this._siftUp(this.elementCount - 1);
};

/**
 * Replaces the entire heap content with a new array and rebuilds the heap.
 * This operation is also known as "heapify".
 *
 * @param {Array} sourceArray - The array whose elements will form the new heap.
 */
MinHeapStruct.prototype.buildHeapFromArray = function(sourceArray) {
  if (!Array.isArray(sourceArray)) {
    console.error("Input for buildHeapFromArray must be an array.");
    return;
  }

  this.heapStorage = [...sourceArray]; // Shallow copy the array
  this.elementCount = this.heapStorage.length;

  // Start from the last non-leaf node and sift down each node.
  // This efficiently builds the heap in O(n) time.
  let idx;
  for (idx = Math.floor(this.elementCount / 2) - 1; idx >= 0; idx--) {
    this._siftDown(idx);
  }
};

/**
 * Retrieves the smallest element from the heap without removing it.
 * Executes in constant time, O(1).
 *
 * @returns {*} The smallest element, or `null` if the heap is empty.
 */
MinHeapStruct.prototype.inspectMinimum = function() {
  if (this.elementCount === 0) {
    return null;
  }
  return this.heapStorage[0];
};

/**
 * Removes and returns the smallest element from the heap.
 * Runs in logarithmic time, O(log n).
 *
 * @returns {*} The smallest element, or `null` if the heap is empty.
 */
MinHeapStruct.prototype.popMinimum = function() {
  if (this.elementCount === 0) {
    return null;
  }

  const extractedValue = this.heapStorage[0]; // The root is the smallest
  this.elementCount--;

  if (this.elementCount > 0) {
    // Move the last element to the root
    this.heapStorage[0] = this.heapStorage[this.elementCount];
    // Sift down the new root to maintain heap property
    this._siftDown(0);
  } else {
    // If heap becomes empty, clear the storage array
    this.heapStorage.length = 0;
  }
  // Trim the internal storage array to free up memory (optional, but good practice)
  this.heapStorage.pop(); // Remove the last element which was moved to root
  return extractedValue;
};

/**
 * Replaces the current smallest element with a new value and rebalances the heap.
 * The size of the heap remains unchanged.
 * Runs in logarithmic time, O(log n).
 *
 * @param {*} newValue - The value to replace the root with.
 * @returns {*} The value that was previously the smallest element, or `null` if the heap was empty.
 */
MinHeapStruct.prototype.updateAndRebalanceRoot = function(newValue) {
  if (this.elementCount === 0) {
    // If heap is empty, just add the new value and return null for the 'old' root.
    this.addElement(newValue);
    return null;
  }

  const oldRootValue = this.heapStorage[0];
  this.heapStorage[0] = newValue; // Replace root
  this._siftDown(0); // Rebalance the heap
  return oldRootValue;
};

/**
 * Checks if the priority queue contains any elements.
 *
 * @returns {boolean} True if the heap is empty, false otherwise.
 */
MinHeapStruct.prototype.isCollectionEmpty = function() {
  return this.elementCount === 0;
};

/**
 * Creates a shallow copy of the current priority queue instance.
 * Runs in O(n) time.
 *
 * @returns {MinHeapStruct} A new MinHeapStruct instance that is a copy of the original.
 */
MinHeapStruct.prototype.createCopy = function() {
  const clonedHeap = new MinHeapStruct(this.isLess);
  clonedHeap.elementCount = this.elementCount;
  // Use slice for efficient shallow copy of the internal array
  clonedHeap.heapStorage = this.heapStorage.slice(0, this.elementCount);
  return clonedHeap;
};

/**
 * Iterates over each element in the priority queue in ascending order,
 * executing a provided function for each element.
 * Note: This operation involves cloning and polling, so it's O(n log n) and modifies the clone.
 *
 * @param {Function} actionFunction - The function to execute for each element.
 *   It receives two arguments: (element, index).
 */
MinHeapStruct.prototype.processEachElementOrdered = function(actionFunction) {
  if (this.isCollectionEmpty() || typeof actionFunction !== 'function') {
    return; // Do nothing if heap is empty or actionFunction is not valid
  }

  const temporaryHeapCopy = this.createCopy();
  let indexCounter = 0;
  while (!temporaryHeapCopy.isCollectionEmpty()) {
    actionFunction(temporaryHeapCopy.popMinimum(), indexCounter++);
  }
};

// If Symbol.iterator is available, provide an iterable interface for ordered traversal.
if (typeof Symbol !== 'undefined' && Symbol.iterator) {
  MinHeapStruct.prototype[Symbol.iterator] = function*() {
    if (this.isCollectionEmpty()) {
      return;
    }
    const tempIteratorHeap = this.createCopy();
    while (!tempIteratorHeap.isCollectionEmpty()) {
      yield tempIteratorHeap.popMinimum();
    }
  };
}

/**
 * Retrieves the k smallest elements from the heap.
 * This method uses an auxiliary heap of indices to optimize performance.
 * Runs in O(k log k) time.
 *
 * @param {number} countToRetrieve - The number of smallest elements to retrieve.
 * @returns {Array<*>} An array containing the `k` smallest elements in ascending order.
 *   Returns an empty array if the heap is empty or `countToRetrieve` is non-positive.
 */
MinHeapStruct.prototype.retrieveTopKLeast = function(countToRetrieve) {
  if (this.isCollectionEmpty() || countToRetrieve <= 0) {
    return [];
  }

  // Ensure k does not exceed the actual number of elements
  const actualCount = Math.min(this.elementCount, countToRetrieve);
  const resultArray = new Array(actualCount);
  let resultIndex = 0;

  // Use a temporary min-heap to store indices of elements to explore.
  // The comparator for this auxiliary heap compares elements from the main heap
  // based on the indices stored in the auxiliary heap.
  const sourceStorage = this.heapStorage;
  const currentComparator = this.isLess;
  const indexMinHeap = new MinHeapStruct((idxA, idxB) => {
    return currentComparator(sourceStorage[idxA], sourceStorage[idxB]);
  });

  // Start by adding the root index (0) to the auxiliary heap.
  indexMinHeap.addElement(0);

  // Extract elements until `actualCount` elements are collected.
  while (resultIndex < actualCount) {
    const currentIndex = indexMinHeap.popMinimum(); // Get index of the current smallest element
    if (currentIndex === null || currentIndex === undefined) {
      // Should not happen if actualCount is valid, but for safety
      break;
    }

    resultArray[resultIndex++] = sourceStorage[currentIndex]; // Add the actual value to results

    // Add children indices to the auxiliary heap for further exploration
    const leftChild = (currentIndex * 2) + 1;
    const rightChild = leftChild + 1;

    if (leftChild < this.elementCount) {
      indexMinHeap.addElement(leftChild);
    }
    if (rightChild < this.elementCount) {
      indexMinHeap.addElement(rightChild);
    }
  }
  return resultArray;
};

/**
 * Removes the element at a specific index from the heap.
 * This operation is more complex than `popMinimum` as it requires maintaining heap integrity.
 *
 * @private
 * @param {number} targetPosition - The index of the element to remove.
 * @returns {*} The removed element, or `null` if the index is invalid or heap is empty.
 */
MinHeapStruct.prototype._extractAtSpecificPosition = function(targetPosition) {
  // Validate target position
  if (targetPosition < 0 || targetPosition >= this.elementCount || this.elementCount === 0) {
    return null;
  }

  const removedElement = this.heapStorage[targetPosition];

  // If removing the last element, simply pop it.
  if (targetPosition === this.elementCount - 1) {
    this.heapStorage.pop();
    this.elementCount--;
    return removedElement;
  }

  // Otherwise, replace the element at targetPosition with the last element
  // and then rebalance the heap.
  this.elementCount--;
  const lastElement = this.heapStorage.pop(); // Remove last element
  this.heapStorage[targetPosition] = lastElement;

  // Now, rebalance the heap from the targetPosition.
  // It might need to sift up or sift down.
  const parentIndex = Math.floor((targetPosition - 1) / 2);
  if (targetPosition > 0 && this.isLess(lastElement, this.heapStorage[parentIndex])) {
    this._siftUp(targetPosition);
  } else {
    this._siftDown(targetPosition);
  }

  return removedElement;
};

/**
 * Removes the first occurrence of an item matching the provided value from the queue.
 * The equality check is performed using the queue's internal comparator (checking if neither A < B nor B < A).
 *
 * @param {*} searchTarget - The value to be removed.
 * @returns {boolean} True if an item was found and removed, false otherwise.
 */
MinHeapStruct.prototype.deleteByValue = function(searchTarget) {
  if (this.isCollectionEmpty()) {
    return false;
  }

  // Find the index of the first matching element
  let foundIndex = -1;
  for (let currentIdx = 0; currentIdx < this.elementCount; currentIdx++) {
    const currentItem = this.heapStorage[currentIdx];
    // Check for equality: neither item is less than the other
    if (!this.isLess(currentItem, searchTarget) && !this.isLess(searchTarget, currentItem)) {
      foundIndex = currentIdx;
      break;
    }
  }

  if (foundIndex !== -1) {
    this._extractAtSpecificPosition(foundIndex);
    return true;
  }
  return false;
};

/**
 * Private helper function to process and potentially remove multiple elements
 * based on a filter predicate. This version rebuilds the heap for robustness.
 *
 * @private
 * @param {Function} filterPredicate - A function that takes an element and returns `true`
 *   if the element should be removed, `false` otherwise.
 * @param {number} [removalCap] - Optional maximum number of elements to remove.
 *   If not specified, all matching elements are removed.
 * @returns {Array<*>} An array containing the elements that were removed.
 */
MinHeapStruct.prototype._processAndFilter = function(filterPredicate, removalCap) {
  if (typeof filterPredicate !== 'function' || this.isCollectionEmpty()) {
    return [];
  }

  const collectedItems = [];
  const keptElements = [];
  let removedCounter = 0;
  const effectiveCap = (removalCap !== undefined && removalCap >= 0) ? removalCap : Infinity;

  // Iterate over all elements.
  // If an element matches the predicate and we haven't hit the cap, mark it for removal.
  // Otherwise, add it to the 'keptElements' list.
  for (let idx = 0; idx < this.elementCount; idx++) {
    const currentItem = this.heapStorage[idx];
    if (removedCounter < effectiveCap && filterPredicate(currentItem)) {
      collectedItems.push(currentItem);
      removedCounter++;
    } else {
      keptElements.push(currentItem);
    }
  }

  // Rebuild the heap with the elements that were kept.
  this.buildHeapFromArray(keptElements);

  return collectedItems;
};

/**
 * Executes a callback function for each item in the queue and removes the
 * first item for which the callback returns true.
 *
 * @param {Function} matcherFunction - The function to execute for each item.
 *   It receives an item and should return `true` if this item is the one to remove.
 * @returns {*} The removed item, or `null` if no item was removed.
 */
MinHeapStruct.prototype.discardFirstMatching = function(matcherFunction) {
  if (typeof matcherFunction !== 'function') {
    console.error("Matcher function must be a valid function.");
    return null;
  }
  const tempResults = this._processAndFilter(matcherFunction, 1);
  return tempResults.length > 0 ? tempResults[0] : null;
};

/**
 * Executes a callback function for each item of the queue and removes all items
 * for which the callback returns true, up to a specified maximum limit.
 *
 * @param {Function} filterPredicate - The function to execute for each item.
 *   It receives an item and should return `true` if the item should be removed.
 * @param {number} [maxRemovals] - An optional maximum number of items to remove.
 *   If not specified, all matching items will be removed.
 * @returns {Array<*>} An array containing all the items that were removed.
 */
MinHeapStruct.prototype.discardMultipleMatching = function(filterPredicate, maxRemovals) {
  return this._processAndFilter(filterPredicate, maxRemovals);
};

/**
 * Recovers unused memory by truncating the internal storage array to the actual
 * number of elements. Useful for long-running priority queues where many elements
 * have been removed.
 */
MinHeapStruct.prototype.compactInternalStorage = function() {
  if (this.elementCount === 0) {
    this.heapStorage = []; // Clear array completely if empty
  } else {
    this.heapStorage.length = this.elementCount; // Truncate to current size
  }
};

// --- Algorithmic Problem Solution Part ---

// Setup for reading standard input
process.stdin.resume();
process.stdin.setEncoding('utf8');

let standardInputBuffer = []; // Buffer to store lines from stdin

const inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Event listener for each line of input
inputHandler.on('line', (line) => {
  standardInputBuffer.push(line);
});

// Event listener for when input stream closes
inputHandler.on('close', () => {
  // Basic input validation
  if (standardInputBuffer.length < 2) {
    console.error("Error: Not enough input lines provided.");
    return;
  }

  // Parse the first line: N (total items), K (max operations)
  const [totalElements, limitOperations] = standardInputBuffer[0].split(" ").map(val => Number(val));

  // Parse the second line: list of values, sorted in descending order
  const descendingValues = standardInputBuffer[1].split(" ").map(val => Number(val)).sort((a, b) => b - a);

  // Binary search variables:
  // lowRange: minimum possible 'average' (can be 0 or 1 depending on problem specifics, assuming 0 for safety)
  let lowRange = 0;
  // highRange: maximum possible 'average' (the largest value in the list)
  let highRange = descendingValues[0];
  // optimalResult: stores the best 'average' found so far
  let optimalResult = highRange;

  // Perform binary search for the optimal average value
  while (lowRange <= highRange) {
    // Calculate the midpoint. Using Math.ceil to favor higher averages in case of tie,
    // which is often useful when searching for a minimum threshold.
    const currentEstimate = Math.ceil((lowRange + highRange) / 2);

    // If currentEstimate is 0, it means we're trying to divide by zero or very small number.
    // This case might need special handling based on problem constraints.
    if (currentEstimate === 0) {
        lowRange = 1; // Adjust lowRange to avoid division by zero or negative results for operations
        continue;
    }

    let isFeasible = true; // Flag to track if currentEstimate is achievable
    let requiredOperations = 0; // Total operations needed for this estimate

    // Calculate operations required for the currentEstimate
    for (let i = 0; i < totalElements; i++) {
      // Operations needed: ceil(value / currentEstimate) - 1
      requiredOperations += Math.ceil(descendingValues[i] / currentEstimate) - 1;
      // If operations exceed limit, this estimate is not feasible
      if (requiredOperations > limitOperations) {
        isFeasible = false;
        break;
      }
    }

    // Adjust search range based on feasibility
    if (isFeasible) {
      // If feasible, this estimate (or a smaller one) might be the answer.
      // Store it and try for a smaller average.
      optimalResult = currentEstimate;
      highRange = currentEstimate - 1;
    } else {
      // If not feasible, currentEstimate is too low.
      // Increase lowRange to search for a larger average.
      lowRange = currentEstimate + 1;
    }
  }

  // Output the final optimal result
  console.log(optimalResult);
  // Explicitly return for clarity in Node.js scripts
  return;
});