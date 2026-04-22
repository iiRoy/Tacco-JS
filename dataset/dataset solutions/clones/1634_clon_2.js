/*
 *   Internal Utility:
 *   _extractAtIndex(pos) removes the element at the specified position from the heap.
 *   It ensures the heap structure remains balanced.
 *   Returns the removed element, or 'undefined' if the position is invalid.
 */
EfficientMinHeap.prototype._extractAtIndex = function (targetIndex) {
  if (targetIndex > this.itemCount - 1 || targetIndex < 0) {
    return undefined;
  }
  // The original code had two implementations commented out.
  // We'll stick to the live one, which uses sift-up and then extracts the minimum.
  this._siftUp(targetIndex, true); // Propagate the item to the root (or near it) for extraction
  return this.fetchMinimum(); // Extract the root element
};

/*
 *   Deletes an item matching the provided value from the heap.
 *   Equality is determined by the heap's comparison function.
 *   Returns `true` if an item was removed, `false` otherwise.
 */
EfficientMinHeap.prototype.deleteValue = function (valueToFind) {
  for (var loopCounter = 0; loopCounter < this.itemCount; loopCounter++) {
    // Check if the current element matches the valueToFind using the comparator
    // (comparator returns false for (a,b) AND false for (b,a) when a and b are equal)
    if (!this.isLesser(this.heapData[loopCounter], valueToFind) && !this.isLesser(valueToFind, this.heapData[loopCounter])) {
      this._extractAtIndex(loopCounter); // Found a match, remove it
      return true; // Indicate successful removal
    }
  }
  return false; // No matching item found
};

/*
 *   Internal Utility:
 *   Removes and returns elements for which the provided filter function returns 'true'.
 */
EfficientMinHeap.prototype._processBulkRemovals = function (filterFunction, maxRemovalCount) {
  // Initialize a list to hold removed elements, with a maximum size
  var collectedItems = new Array(maxRemovalCount ? maxRemovalCount : this.itemCount);
  var removedItemCount = 0;

  // Proceed only if a valid filter function is provided and the heap is not empty
  if (typeof filterFunction === 'function' && this.itemCount) {
    var currentPos = 0;
    while (currentPos < this.itemCount && removedItemCount < collectedItems.length) {
      if (filterFunction(this.heapData[currentPos])) {
        // If the filter function returns true, remove the item
        collectedItems[removedItemCount] = this._extractAtIndex(currentPos);
        removedItemCount++;
        // After removal, the heap structure changes,
        // so we move up to re-evaluate potential parents if necessary.
        currentPos = currentPos >> 1;
      } else {
        currentPos++; // Move to the next item if not removed
      }
    }
  }
  collectedItems.length = removedItemCount; // Trim the array to actual removed count
  return collectedItems;
};

/*
 *   Executes a predicate function for each element and removes the first element
 *   for which the predicate returns 'true'.
 *   Returns the removed element, or 'undefined' if no element was removed.
 */
EfficientMinHeap.prototype.deleteOne = function (testPredicate) {
  var resultArray = this._processBulkRemovals(testPredicate, 1);
  return resultArray.length > 0 ? resultArray[0] : undefined;
};

/*
 *   Applies a predicate function to each element and removes all elements
 *   for which the predicate returns 'true', up to an optional maximum limit.
 *   Returns an array containing all removed elements.
 */
EfficientMinHeap.prototype.deleteMany = function (testPredicate, maxRemovalCount) {
  return this._processBulkRemovals(testPredicate, maxRemovalCount);
};

/*
 *   Inspects the smallest element in the heap without removing it.
 *   This operation runs in constant time.
 *   Returns 'undefined' if the heap is empty.
 */
EfficientMinHeap.prototype.viewTopElement = function () {
  if (this.itemCount == 0) {
    return undefined;
  }
  return this.heapData[0];
};

/*
 *   Removes and returns the smallest element from the heap.
 *   This operation runs in logarithmic time relative to the number of elements.
 *   Returns 'undefined' if the heap is empty.
 *
 *   For heaps that are very large or have many operations, consider calling
 *   the 'compactStorage' function periodically to free up unused memory.
 */
EfficientMinHeap.prototype.fetchMinimum = function () {
  if (this.itemCount == 0) {
    return undefined;
  }
  var returnValue = this.heapData[0];
  if (this.itemCount > 1) {
    this.heapData[0] = this.heapData[--this.itemCount]; // Move last element to root
    this._siftDown(0); // Restore heap property
  } else {
    this.itemCount -= 1; // Heap becomes empty
  }
  return returnValue;
};

/*
 *   Replaces the smallest element in the heap with a new value.
 *   The size of the heap remains unchanged.
 *   Returns the element that was replaced (the previous smallest element).
 */
EfficientMinHeap.prototype.swapRootAndSift = function (newValue) {
  if (this.itemCount == 0) {
    return undefined;
  }
  var oldRoot = this.heapData[0];
  this.heapData[0] = newValue;
  this._siftDown(0); // Restore heap property after replacement
  return oldRoot;
};

/*
 *   Recovers unused memory by resizing the internal array to the current number of elements.
 *   Useful for long-running heaps where many elements have been removed.
 */
EfficientMinHeap.prototype.compactStorage = function () {
  this.heapData = this.heapData.slice(0, this.itemCount);
};

/*
 *   Checks if the heap currently contains any elements.
 *   Returns 'true' if the heap is empty, 'false' otherwise.
 */
EfficientMinHeap.prototype.isVacant = function () {
  return this.itemCount === 0;
};

/*
 *   Iterates over the elements of the heap in sorted order.
 *   A callback function is invoked for each element, receiving the element and its index.
 */
EfficientMinHeap.prototype.applyToEach = function (actionFunction) {
  if (this.isVacant() || typeof actionFunction != 'function') {
    return;
  }
  var currentIdx = 0;
  var heapCopy = this.duplicate(); // Work on a copy to preserve original heap
  while (!heapCopy.isVacant()) {
    actionFunction(heapCopy.extractMinimum(), currentIdx++);
  }
};

/*
 *   Retrieves the 'k' smallest elements from the heap.
 *   This method is optimized for performance compared to repeatedly calling 'extractMinimum'.
 *   Runs in O(k log k) time.
 */
EfficientMinHeap.prototype.retrieveTopK = function (numElements) {
  if (this.itemCount == 0) {
    return []; // Return an empty array if the heap is empty
  }
  var comparisonFn = this.isLesser; // Store the main comparison function
  var sourceArray = this.heapData; // Reference to the heap's internal array

  // Create a temporary heap to manage indices for efficient retrieval
  var temporaryHeap = new EfficientMinHeap(function (a, b) {
    return comparisonFn(sourceArray[a], sourceArray[b]);
  });

  numElements = Math.min(this.itemCount, numElements); // Ensure k doesn't exceed heap size
  var topKResults = new Array(numElements);
  var resultIdx = 0;
  temporaryHeap.insertElement(0); // Start with the root index

  while (resultIdx < numElements) {
    var currentSmallestIdx = temporaryHeap.extractMinimum();
    topKResults[resultIdx++] = this.heapData[currentSmallestIdx];

    var leftChildIdx = (currentSmallestIdx << 1) + 1;
    var rightChildIdx = leftChildIdx + 1;

    if (leftChildIdx < this.itemCount) {
      temporaryHeap.insertElement(leftChildIdx);
    }
    if (rightChildIdx < this.itemCount) {
      temporaryHeap.insertElement(rightChildIdx);
    }
  }
  return topKResults;
};

// Default comparison function: returns true if 'a' is less than 'b'
var standardComparison = function (a, b) {
  return a < b;
};

/*
 *   Constructor for a new EfficientMinHeap instance.
 *   Takes an optional comparison function. The function should return `true`
 *   if the first argument is considered "less than" the second argument.
 *   By default, it uses a standard less-than comparison.
 */
function EfficientMinHeap(comparisonFunction) {
  if (!(this instanceof EfficientMinHeap)) {
    return new EfficientMinHeap(comparisonFunction);
  }
  this.heapData = []; // Internal array to store heap elements
  this.itemCount = 0; // Current number of elements in the heap
  this.isLesser = comparisonFunction || standardComparison; // The comparison function
}

/*
 *   Creates a shallow copy of the current heap instance.
 *   Runs in O(n) time.
 */
EfficientMinHeap.prototype.duplicate = function () {
  var newHeapInstance = new EfficientMinHeap(this.isLesser);
  newHeapInstance.itemCount = this.itemCount;
  for (var loopCounter = 0; loopCounter < this.itemCount; loopCounter++) {
    newHeapInstance.heapData.push(this.heapData[loopCounter]);
  }
  return newHeapInstance;
};

/*
 *   Adds a new element to the heap, maintaining the heap property.
 *   Runs in O(log n) time.
 */
EfficientMinHeap.prototype.insertElement = function (elementToAdd) {
  var currentPosition = this.itemCount;
  this.heapData[this.itemCount] = elementToAdd;
  this.itemCount += 1; // Increment element count

  var parentPosition;
  var parentValue;

  while (currentPosition > 0) {
    parentPosition = (currentPosition - 1) >> 1; // Calculate parent index
    parentValue = this.heapData[parentPosition];

    // If the new element is not less than its parent, heap property holds
    if (!this.isLesser(elementToAdd, parentValue)) {
      break;
    }
    this.heapData[currentPosition] = parentValue; // Move parent down
    currentPosition = parentPosition; // Move up the heap
  }
  this.heapData[currentPosition] = elementToAdd; // Place the new element
};

/*
 *   Replaces the entire heap content with a new array and then rebuilds the heap structure.
 */
EfficientMinHeap.prototype.buildFromElements = function (sourceArr) {
  this.heapData = sourceArr;
  this.itemCount = sourceArr.length;
  var loopVar;
  for (loopVar = this.itemCount >> 1; loopVar >= 0; loopVar--) {
    this._siftDown(loopVar); // Restore heap property from bottom-up
  }
};

/*
 *   Internal Utility:
 *   Performs an upward sift operation starting from a given index.
 *   Used to restore heap property after an insertion or a specific modification.
 */
EfficientMinHeap.prototype._siftUp = function (startIdx, forcePercolation) {
  var elementToSift = this.heapData[startIdx];
  var parentIdx;
  var parentElem;

  while (startIdx > 0) {
    parentIdx = (startIdx - 1) >> 1;
    parentElem = this.heapData[parentIdx];

    // If 'forcePercolation' is false, compare the element with its parent.
    // If 'forcePercolation' is true, it skips the comparison and always moves up.
    if (!forcePercolation && !this.isLesser(elementToSift, parentElem)) {
      break; // Heap property satisfied
    }
    this.heapData[startIdx] = parentElem; // Move parent down
    startIdx = parentIdx; // Move up to parent's position
  }
  this.heapData[startIdx] = elementToSift; // Place the element in its final position
};

/*
 *   Internal Utility:
 *   Performs a downward sift operation starting from a given index.
 *   Used to restore heap property after extraction or deletion.
 */
EfficientMinHeap.prototype._siftDown = function (startIdx) {
  var itemCount = this.itemCount;
  var halfCount = this.itemCount >>> 1; // Optimization: only need to check up to half the size
  var elementToSift = this.heapData[startIdx];
  var leftChildIdx;
  var rightChildIdx;
  var bestChildElement;

  while (startIdx < halfCount) {
    leftChildIdx = (startIdx << 1) + 1; // Calculate left child index
    rightChildIdx = leftChildIdx + 1; // Calculate right child index
    bestChildElement = this.heapData[leftChildIdx]; // Assume left child is the best

    if (rightChildIdx < itemCount) {
      // If a right child exists, compare it with the left child
      if (this.isLesser(this.heapData[rightChildIdx], bestChildElement)) {
        leftChildIdx = rightChildIdx; // Right child is smaller, update best child index
        bestChildElement = this.heapData[rightChildIdx]; // Update best child element
      }
    }

    // If the element to sift is not greater than the best child, heap property holds
    if (!this.isLesser(bestChildElement, elementToSift)) {
      break;
    }
    this.heapData[startIdx] = bestChildElement; // Move best child up
    startIdx = leftChildIdx; // Move down to the child's position
  }
  this.heapData[startIdx] = elementToSift; // Place the element in its final position
};

// Node.js specific input/output handling
process.stdin.resume();
process.stdin.setEncoding('utf8');

var receivedLines = []; // Stores lines read from standard input
var lineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
lineReader.on('line', (line) => {
  receivedLines.push(line);
});
lineReader.on('close', () => {
    // Parse input values from the first line
    const [numItems, limitVal] = receivedLines[0].split(" ").map(val => val - 0);
    // Parse the list of numbers from the second line and sort in descending order
    const inputList = receivedLines[1].split(" ").map(val => val - 0).sort((a, b) => b - a);

    let lowerBound = 0;
    let upperBound = inputList[0]; // Max value in the list
    let finalResult = upperBound; // Stores the optimal average

    // Binary search for the optimal average value
    while (lowerBound <= upperBound) {
        const averageVal = Math.ceil((lowerBound + upperBound) / 2); // Calculate midpoint
        let isValid = true; // Flag to check if current average is feasible
        
        let currentSum = 0;
        for (let idx = 0; idx < numItems; idx++) {
            // Calculate operations needed for each item to reach 'averageVal'
            currentSum += Math.ceil(inputList[idx] / averageVal) - 1;
            if (currentSum > limitVal) { // If total operations exceed limit
                isValid = false; // This average is not feasible
                break;
            }
        }

        if (isValid) {
            finalResult = averageVal; // This average is possible, try for a smaller one
            upperBound = averageVal - 1;
        } else {
            lowerBound = averageVal + 1; // This average is too small, need a larger one
        }
    }
    console.log(finalResult); // Output the final optimal average
    return;
});