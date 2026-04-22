/**
 * Extensive documentation for a robust binary heap implementation.
 * This module provides a flexible, performance-optimized data structure
 * for managing ordered collections, particularly useful in scenarios
 * requiring efficient retrieval of minimum (or maximum) elements.
 * (c) The current maintainers
 * Licensed under the MIT License.
 *
 * Key features:
 * - Heap-based structure ensures logarithmic time complexity for insertions and deletions.
 * - Customizable comparison function to support min-heap, max-heap, or custom ordering.
 * - Memory-efficient; automatically adjusts storage.
 *
 * Example Usage (conceptual):
 *    const myOrderedSet = new OrderedCollection((a, b) => a < b); // Min-heap
 *    myOrderedSet.insertElement(15);
 *    myOrderedSet.insertElement(5);
 *    myOrderedSet.insertElement(20);
 *    console.log(myOrderedSet.retrieveMinimum()); // Output: 5
 *    myOrderedSet.extractMinimum(); // Removes 5
 *    console.log(myOrderedSet.retrieveMinimum()); // Output: 15
 *    myOrderedSet.processElementsInOrder((val, index) => console.log(`Element ${index}: ${val}`));
 *
 */
'use strict';

/**
 * The default comparison predicate for elements.
 * Returns `true` if `firstValue` is considered "smaller" than `secondValue".
 * This forms a min-heap by default.
 * @param {*} firstValue - The first element for comparison.
 * @param {*} secondValue - The second element for comparison.
 * @returns {boolean} True if `firstValue` should precede `secondValue`.
 */
const standardComparisonPredicate = function(firstValue, secondValue) {
  return (firstValue < secondValue);
};

/**
 * Represents a binary heap-based ordered collection.
 * Elements are stored in a way that allows quick access to the minimum (or maximum) element
 * based on the provided comparison function.
 * @class OrderedCollection
 * @param {Function} [comparisonPredicate] - A function(a, b) that returns true if 'a' should come before 'b'.
 *                                           If omitted, a min-heap behavior is used (a < b).
 * @param {number} [initialCapacity=16] - Optional initial capacity for the underlying storage array.
 */
function OrderedCollection(comparisonPredicate, initialCapacity) {
  // Enforce 'new' keyword for constructor, or return new instance.
  if (!(this instanceof OrderedCollection)) {
    return new OrderedCollection(comparisonPredicate, initialCapacity);
  }

  /**
   * The internal array storing the heap elements.
   * @private
   * @type {Array<*>}
   */
  this.underlyingStorage = initialCapacity > 0 ? new Array(initialCapacity) : [];

  /**
   * The current number of elements in the collection.
   * @private
   * @type {number}
   */
  this.elementCount = 0;

  /**
   * The function used to compare elements and maintain the heap property.
   * @private
   * @type {Function}
   */
  this.comparisonFunction = comparisonPredicate || standardComparisonPredicate;

  /**
   * An internal version tracker, useful for debugging or future optimizations.
   * @private
   * @type {string}
   */
  this._internalVersion = '1.0.0-alpha';
}

/**
 * Creates a shallow copy of this ordered collection.
 * Runs in `O(n)` time, where n is the number of elements.
 * @returns {OrderedCollection} A new OrderedCollection instance with the same elements and comparison function.
 */
OrderedCollection.prototype.duplicateCollection = function() {
  const newCollection = new OrderedCollection(this.comparisonFunction);
  newCollection.elementCount = this.elementCount;
  // Use slice for efficient shallow copy of the underlying array segment.
  newCollection.underlyingStorage = this.underlyingStorage.slice(0, this.elementCount);
  return newCollection;
};

/**
 * Inserts a new element into the collection.
 * Maintains the heap property. Runs in `O(log n)` time.
 * @param {*} newValue - The element to be added.
 */
OrderedCollection.prototype.insertElement = function(newValue) {
  // Basic validation for the incoming element.
  if (newValue === null || newValue === undefined) {
    console.warn("Attempted to insert null or undefined value into OrderedCollection. Skipping.");
    return; // Or throw an error, depending on desired strictness.
  }

  let currentChildIndex = this.elementCount;
  this.underlyingStorage[this.elementCount] = newValue;
  this.elementCount += 1;

  let parentIndex;
  let parentElement;

  // Bubble up the new element to its correct position.
  while (currentChildIndex > 0) {
    parentIndex = Math.floor((currentChildIndex - 1) / 2);
    parentElement = this.underlyingStorage[parentIndex];

    // If the new element is not "smaller" than its parent, it's in the right place.
    if (!this.comparisonFunction(newValue, parentElement)) {
      break;
    }

    // Swap child and parent.
    this.underlyingStorage[currentChildIndex] = parentElement;
    currentChildIndex = parentIndex;
  }
  this.underlyingStorage[currentChildIndex] = newValue;
};

/**
 * Replaces the current contents of the collection with a given array
 * and then restores the heap property (heapifies the array).
 * @param {Array<*>} sourceArray - The array whose elements will form the new heap.
 */
OrderedCollection.prototype.rebuildHeap = function(sourceArray) {
  if (!Array.isArray(sourceArray)) {
    throw new TypeError("rebuildHeap expects an array as input.");
  }
  this.underlyingStorage = Array.from(sourceArray); // Create a new array from the source.
  this.elementCount = this.underlyingStorage.length;

  // Start from the last non-leaf node and sink down.
  // The first leaf node is at index floor(n/2). So, the last non-leaf node is at floor(n/2) - 1.
  let currentRootIndex = Math.floor(this.elementCount / 2) - 1;
  for (let idx = currentRootIndex; idx >= 0; idx--) {
    this._sinkDown(idx);
  }
};

/**
 * Internally moves an element up the heap to maintain the heap property.
 * This is typically used after an element's value has decreased or a new element is inserted.
 * @private
 * @param {number} startIndex - The index of the element to bubble up.
 * @param {boolean} [forceMove=false] - If true, the element is always moved up, ignoring comparison.
 */
OrderedCollection.prototype._bubbleUp = function(startIndex, forceMove = false) {
  if (startIndex < 0 || startIndex >= this.elementCount) return; // Guard clause

  let elementToMove = this.underlyingStorage[startIndex];
  if (elementToMove === null || elementToMove === undefined) return; // Guard for null/undefined elements

  let currentPosition = startIndex;
  let parentIndex;
  let parentElement;

  while (currentPosition > 0) {
    parentIndex = Math.floor((currentPosition - 1) / 2);
    parentElement = this.underlyingStorage[parentIndex];

    // If not forcing a move and the element is not "smaller" than its parent, break.
    if (!forceMove && !this.comparisonFunction(elementToMove, parentElement)) {
      break;
    }

    // Perform the swap.
    this.underlyingStorage[currentPosition] = parentElement;
    currentPosition = parentIndex;
  }
  this.underlyingStorage[currentPosition] = elementToMove;
};

/**
 * Internally moves an element down the heap to maintain the heap property.
 * This is typically used after an element's value has increased or the root is removed.
 * @private
 * @param {number} startIndex - The index of the element to sink down.
 */
OrderedCollection.prototype._sinkDown = function(startIndex) {
  if (startIndex < 0 || startIndex >= this.elementCount) return; // Guard clause

  const currentSize = this.elementCount;
  const halfSize = Math.floor(currentSize / 2); // Elements beyond this are leaves.
  let elementToSink = this.underlyingStorage[startIndex];
  if (elementToSink === null || elementToSink === undefined) return; // Guard for null/undefined elements

  let currentPosition = startIndex;
  let leftChildIdx, rightChildIdx, bestChildValue, bestChildIndex;

  while (currentPosition < halfSize) {
    leftChildIdx = (currentPosition * 2) + 1;
    rightChildIdx = leftChildIdx + 1;
    bestChildIndex = leftChildIdx; // Assume left child is the best candidate initially.
    bestChildValue = this.underlyingStorage[leftChildIdx];

    // Check if right child exists and is "smaller" than the left child.
    if (rightChildIdx < currentSize) {
      if (this.comparisonFunction(this.underlyingStorage[rightChildIdx], bestChildValue)) {
        bestChildIndex = rightChildIdx;
        bestChildValue = this.underlyingStorage[rightChildIdx];
      }
    }

    // If the element to sink is not "smaller" than the best child, it's in the right place.
    if (!this.comparisonFunction(bestChildValue, elementToSink)) {
      break;
    }

    // Swap the element with the best child.
    this.underlyingStorage[currentPosition] = bestChildValue;
    currentPosition = bestChildIndex;
  }
  this.underlyingStorage[currentPosition] = elementToSink;
};

/**
 * Removes an element at a specific index from the collection,
 * maintaining the heap property.
 * @private
 * @param {number} targetIndex - The index of the element to remove.
 * @returns {*} The removed element, or null if no element was removed.
 */
OrderedCollection.prototype._extractAtIndex = function(targetIndex) {
  if (targetIndex >= this.elementCount || targetIndex < 0) {
    return null; // Index out of bounds
  }

  const removedElement = this.underlyingStorage[targetIndex];

  // If the target is the last element, just decrement count.
  if (targetIndex === this.elementCount - 1) {
    this.elementCount--;
    this.underlyingStorage[targetIndex] = undefined; // Clear reference for GC
    return removedElement;
  }

  // Swap the element to be removed with the last element.
  this.elementCount--; // Decrement size first, as the last element is now 'gone'.
  this.underlyingStorage[targetIndex] = this.underlyingStorage[this.elementCount];
  this.underlyingStorage[this.elementCount] = undefined; // Clear reference for GC

  // Now, the element at targetIndex needs to be repositioned.
  // It could either bubble up or sink down.
  // Check if it needs to bubble up (if it's smaller than its parent).
  const parentIdx = Math.floor((targetIndex - 1) / 2);
  if (targetIndex > 0 && this.comparisonFunction(this.underlyingStorage[targetIndex], this.underlyingStorage[parentIdx])) {
    this._bubbleUp(targetIndex);
  } else {
    // Otherwise, it needs to sink down.
    this._sinkDown(targetIndex);
  }

  return removedElement;
};

/**
 * Removes the first occurrence of an item matching the provided value from the collection.
 * Equality is determined by the collection's comparison function (a == b if !(a<b) && !(b<a)).
 * @param {*} itemToRemove - The value to search for and remove.
 * @returns {boolean} True if an item was found and removed, false otherwise.
 */
OrderedCollection.prototype.removeItemByValue = function(itemToRemove) {
  if (itemToRemove === null || itemToRemove === undefined) {
    console.warn("Attempted to remove null or undefined value by value. This might not work as expected.");
    return false;
  }

  let currentIdx = 0;
  let foundAndRemoved = false;
  // Iterate through the heap to find the item. This is O(N) in the worst case.
  while (currentIdx < this.elementCount) {
    const currentItem = this.underlyingStorage[currentIdx];
    // Check for equality using the comparator: neither 'a < b' nor 'b < a' is true.
    if (!this.comparisonFunction(currentItem, itemToRemove) && !this.comparisonFunction(itemToRemove, currentItem)) {
      this._extractAtIndex(currentIdx); // Remove the item at this index.
      foundAndRemoved = true;
      break; // Remove only the first match.
    }
    currentIdx++;
  }
  return foundAndRemoved;
};

/**
 * Internal utility to remove multiple items based on a predicate.
 * @private
 * @param {Function} filterPredicate - A function(item) that returns true for items to be removed.
 * @param {number} [removalLimit] - Optional maximum number of items to remove.
 * @returns {Array<*>} An array containing the removed items.
 */
OrderedCollection.prototype._purgeMatchingItems = function(filterPredicate, removalLimit) {
  const removedItems = [];
  if (typeof filterPredicate !== 'function' || this.isCollectionEmpty()) {
    return removedItems;
  }

  let checkIndex = 0;
  // Iterate while we haven't reached the end of the collection
  // and either no limit is set or we haven't hit the removal limit.
  while (checkIndex < this.elementCount && (removalLimit === undefined || removedItems.length < removalLimit)) {
    const currentElement = this.underlyingStorage[checkIndex];
    if (filterPredicate(currentElement)) {
      removedItems.push(this._extractAtIndex(checkIndex));
      // When an item is removed, the element at `checkIndex` is replaced by the last element.
      // So, the element at `checkIndex` needs to be re-evaluated. No increment of `checkIndex`.
    } else {
      checkIndex++; // Move to the next element if current one is not removed.
    }
  }
  return removedItems;
};

/**
 * Removes the first item for which the callback returns true.
 * @param {Function} filterPredicate - A function(item) that returns true for the item to be removed.
 * @returns {*} The removed item, or null if no item was removed.
 */
OrderedCollection.prototype.removeFirstMatch = function(filterPredicate) {
  const matchingItems = this._purgeMatchingItems(filterPredicate, 1);
  return matchingItems.length > 0 ? matchingItems[0] : null;
};

/**
 * Removes multiple items for which the callback returns true, up to a specified limit.
 * @param {Function} filterPredicate - A function(item) that returns true for items to be removed.
 * @param {number} [removalLimit] - Optional maximum number of items to remove.
 * @returns {Array<*>} An array containing the removed items.
 */
OrderedCollection.prototype.removeMultipleMatches = function(filterPredicate, removalLimit) {
  return this._purgeMatchingItems(filterPredicate, removalLimit);
};

/**
 * Retrieves the minimum (or "top") element of the collection without removing it.
 * Runs in constant time `O(1)`.
 * @returns {*} The minimum element, or null if the collection is empty.
 */
OrderedCollection.prototype.retrieveMinimum = function() {
  if (this.isCollectionEmpty()) {
    return null;
  }
  return this.underlyingStorage[0];
};

/**
 * Removes and returns the minimum (or "top") element from the collection.
 * Runs in logarithmic time `O(log n)`.
 * @returns {*} The minimum element, or null if the collection is empty.
 */
OrderedCollection.prototype.extractMinimum = function() {
  if (this.isCollectionEmpty()) {
    return null;
  }

  const minimumElement = this.underlyingStorage[0];

  if (this.elementCount > 1) {
    // Move the last element to the root and then sink it down.
    this.elementCount--;
    this.underlyingStorage[0] = this.underlyingStorage[this.elementCount];
    this.underlyingStorage[this.elementCount] = undefined; // Clear reference for GC
    this._sinkDown(0);
  } else {
    // If only one element, just decrement count and clear.
    this.elementCount--;
    this.underlyingStorage[0] = undefined; // Clear reference for GC
  }

  return minimumElement;
};

/**
 * Replaces the minimum element with a new value.
 * The size of the collection remains unchanged.
 * Runs in logarithmic time `O(log n)`.
 * @param {*} replacementValue - The new value to insert.
 * @returns {*} The element that was replaced (the previous minimum), or null if the collection was empty.
 */
OrderedCollection.prototype.swapMinimumAndInsert = function(replacementValue) {
  if (this.isCollectionEmpty()) {
    // If empty, just insert the new value and return null as nothing was replaced.
    this.insertElement(replacementValue);
    return null;
  }
  if (replacementValue === null || replacementValue === undefined) {
    console.warn("Attempted to replace minimum with null or undefined value. Extracting minimum without insertion.");
    return this.extractMinimum(); // Remove min and don't insert.
  }

  const oldMinimum = this.underlyingStorage[0];
  this.underlyingStorage[0] = replacementValue;
  this._sinkDown(0); // Restore heap property.
  return oldMinimum;
};

/**
 * Reduces the capacity of the underlying storage array to match the current
 * number of elements. Useful for memory optimization after many removals.
 */
OrderedCollection.prototype.compactStorage = function() {
  // Use slice to create a new, smaller array.
  this.underlyingStorage = this.underlyingStorage.slice(0, this.elementCount);
};

/**
 * Checks if the collection is empty.
 * @returns {boolean} True if the collection contains no elements, false otherwise.
 */
OrderedCollection.prototype.isCollectionEmpty = function() {
  return this.elementCount === 0;
};

/**
 * Iterates over the elements of the collection in sorted order.
 * This operation is destructive as it extracts elements.
 * @param {Function} iterationCallback - A function(element, index) to call for each element.
 */
OrderedCollection.prototype.processElementsInOrder = function(iterationCallback) {
  if (typeof iterationCallback !== 'function' || this.isCollectionEmpty()) {
    return; // Do nothing if callback is invalid or collection is empty.
  }

  // Create a temporary copy to avoid modifying the original collection.
  const temporaryCollection = this.duplicateCollection();
  let processedCount = 0;

  while (!temporaryCollection.isCollectionEmpty()) {
    iterationCallback(temporaryCollection.extractMinimum(), processedCount++);
  }
};

// If Symbol.iterator is available, provide an iterable interface.
// This allows for 'for...of' loops on instances of OrderedCollection.
if (typeof Symbol !== 'undefined' && Symbol.iterator) {
  OrderedCollection.prototype[Symbol.iterator] = function*() {
    if (this.isCollectionEmpty()) {
      return; // Generator yields nothing if empty.
    }
    const tempCollectionForIteration = this.duplicateCollection();
    while (!tempCollectionForIteration.isCollectionEmpty()) {
      yield tempCollectionForIteration.extractMinimum();
    }
  };
}

/**
 * Retrieves the 'k' smallest elements from the collection.
 * This method is more efficient than repeatedly calling `extractMinimum()` for large 'k'.
 * Runs in `O(k log k)` time.
 * @param {number} k - The number of smallest elements to retrieve. Must be a non-negative integer.
 * @returns {Array<*>} An array containing the 'k' smallest elements in sorted order.
 */
OrderedCollection.prototype.fetchKSmallest = function(k) {
  if (this.isCollectionEmpty() || k <= 0 || !Number.isInteger(k)) {
    return [];
  }

  const actualK = Math.min(this.elementCount, k);
  const smallestElements = new Array(actualK);
  let elementsFetched = 0;

  // Use a temporary min-heap to keep track of potential candidates.
  // This temporary heap will store indices into the original underlyingStorage.
  // The comparison function for this temporary heap needs to compare the actual values
  // at those indices in the original collection.
  const indexComparisonHeap = new OrderedCollection((idxA, idxB) => {
    // Defensive check for valid indices, though they should always be valid here.
    if (idxA < 0 || idxA >= this.elementCount || idxB < 0 || idxB >= this.elementCount) {
      console.error("Invalid index encountered in fetchKSmallest indexComparisonHeap.");
      return false; // Or handle error appropriately.
    }
    return this.comparisonFunction(this.underlyingStorage[idxA], this.underlyingStorage[idxB]);
  });

  // Start by adding the root index (0) to the temporary heap.
  indexComparisonHeap.insertElement(0);

  while (elementsFetched < actualK) {
    const currentSmallestIndex = indexComparisonHeap.extractMinimum();
    if (currentSmallestIndex === null) {
      // This should ideally not happen if actualK <= elementCount, but good for robustness.
      break;
    }

    smallestElements[elementsFetched++] = this.underlyingStorage[currentSmallestIndex];

    const leftChild = (currentSmallestIndex * 2) + 1;
    const rightChild = leftChild + 1;

    // Add children indices to the temporary heap if they are within bounds.
    if (leftChild < this.elementCount) {
      indexComparisonHeap.insertElement(leftChild);
    }
    if (rightChild < this.elementCount) {
      indexComparisonHeap.insertElement(rightChild);
    }
  }

  return smallestElements;
};