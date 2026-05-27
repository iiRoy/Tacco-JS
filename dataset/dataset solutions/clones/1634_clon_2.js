/*
 * Internal utility function: _deleteAtIndex(idx)
 * Removes the element at the specified index from the priority queue.
 * Ensures the heap property is maintained.
 * Returns the removed element, or undefined if the index is out of bounds.
 */
QuickPriorityQueue.prototype._deleteAtIndex = function(idx) {
  if (idx > this.currentSize - 1 || idx < 0) {
    return undefined;
  }

  // The original implementation had two options for removal, the second one is active.
  // Option 1 (commented out in original):
  // this.dataArray.splice(idx, 1);
  // this.buildHeap(this.dataArray);
  // Option 2 (active in original):
  this._bubbleUp(idx, true); // Force bubble up to move the element at 'idx' to the top
  return this.extractMin(); // Then extract the minimum (which is now the element we wanted to remove)
};

/**
 * Deletes an item matching the provided value from the queue.
 * The comparison for equality is performed using the queue's internal comparison function:
 * an item 'a' is considered equal to 'b' if `!isLess(a, b) && !isLess(b, a)`.
 * @param {any} itemValue - The value to search for and remove.
 * @returns {boolean} True if an item was found and removed, false otherwise.
 */
QuickPriorityQueue.prototype.deleteItem = function(itemValue) {
  for (var idx = 0; idx < this.currentSize; idx++) {
    // Check for equality: comparator returns false both ways
    if (!this.isLess(this.dataArray[idx], itemValue) && !this.isLess(itemValue, this.dataArray[idx])) {
      // Items match, proceed with removal
      this._deleteAtIndex(idx);
      return true;
    }
  }
  return false;
};

/*
 * Internal batch removal function.
 * Removes and returns elements for which the provided filterFunction returns true.
 * @param {function} filterFunction - A callback function that takes an element and returns true if it should be removed.
 * @param {number} [maxItems] - Optional limit on the maximum number of items to remove.
 * @returns {Array} An array containing the removed elements.
 */
QuickPriorityQueue.prototype._batchRemove = function(filterFunction, maxItems) {
  // Initialize the result array with a maximum size based on maxItems or current queue size
  var resultArray = new Array(maxItems ? maxItems : this.currentSize);
  var itemCount = 0;

  if (typeof filterFunction === 'function' && this.currentSize) {
    var idx = 0;
    while (idx < this.currentSize && itemCount < resultArray.length) {
      if (filterFunction(this.dataArray[idx])) {
        resultArray[itemCount] = this._deleteAtIndex(idx);
        itemCount++;
        // After removing an item, the heap structure changes.
        // The original code moves the index up to its parent's position (idx = idx >> 1).
        // This is a specific heuristic to re-evaluate the heap from a higher level.
        idx = idx >> 1;
      } else {
        idx++;
      }
    }
  }
  resultArray.length = itemCount; // Trim the array to the actual number of removed items
  return resultArray;
};

/**
 * Executes a callback function for each item in the queue and removes the first item
 * for which the callback returns true.
 * @param {function} filterFunction - The callback to test elements.
 * @returns {any|undefined} The removed item, or undefined if no item matches the criteria.
 */
QuickPriorityQueue.prototype.deleteOne = function(filterFunction) {
  var tempArray = this._batchRemove(filterFunction, 1);
  return tempArray.length > 0 ? tempArray[0] : undefined;
};

/**
 * Executes a callback function for each item in the queue and removes all items
 * for which the callback returns true, up to an optional limit.
 * @param {function} filterFunction - The callback to test elements.
 * @param {number} [maxItems] - Optional maximum number of items to remove.
 * @returns {Array} An array containing all the removed items.
 */
QuickPriorityQueue.prototype.deleteMany = function(filterFunction, maxItems) {
  return this._batchRemove(filterFunction, maxItems);
};

/**
 * Inspects the top element of the queue (one of the smallest elements) without removing it.
 * This operation runs in constant time.
 * @returns {any|undefined} The top element, or undefined if the queue is empty.
 */
QuickPriorityQueue.prototype.viewTop = function() {
  if (this.currentSize === 0) {
    return undefined;
  }
  return this.dataArray[0];
};

/**
 * Removes and returns the element on top of the heap (one of the smallest elements).
 * This operation runs in logarithmic time (O(log n)).
 * @returns {any|undefined} The smallest element, or undefined if the queue is empty.
 *
 * For long-running priority queues with many removals, consider calling `compactStorage()`
 * periodically to reclaim allocated memory.
 */
QuickPriorityQueue.prototype.extractMin = function() {
  if (this.currentSize === 0) {
    return undefined;
  }
  var returnValue = this.dataArray[0];
  if (this.currentSize > 1) {
    this.dataArray[0] = this.dataArray[--this.currentSize]; // Move last element to root
    this._bubbleDown(0); // Restore heap property
  } else {
    this.currentSize -= 1; // Queue becomes empty
  }
  return returnValue;
};

/**
 * Adds a new element to the heap, while simultaneously removing and returning
 * one of the smallest elements (similar to `extractMin`).
 * The size of the queue thus remains unchanged.
 * @param {any} itemValue - The new value to add to the queue.
 * @returns {any|undefined} The element that was replaced (the previous smallest), or undefined if the queue was empty.
 */
QuickPriorityQueue.prototype.swapTop = function(itemValue) {
  if (this.currentSize === 0) {
    return undefined;
  }
  var returnValue = this.dataArray[0];
  this.dataArray[0] = itemValue; // Replace root with new value
  this._bubbleDown(0); // Restore heap property
  return returnValue;
};

/**
 * Recovers unused memory by trimming the underlying array to its actual size.
 * This can be beneficial for long-running priority queues where many elements
 * have been removed, leading to a sparse internal array.
 */
QuickPriorityQueue.prototype.compactStorage = function() {
  this.dataArray = this.dataArray.slice(0, this.currentSize);
};

/**
 * Checks whether the priority queue is empty.
 * @returns {boolean} True if the queue contains no elements, false otherwise.
 */
QuickPriorityQueue.prototype.isQueueEmpty = function() {
  return this.currentSize === 0;
};

/*
 * Iterates over the elements of the queue in sorted order.
 * Passes a callback function that receives (item, index) as arguments.
 * Note: This operation involves cloning the queue and repeatedly extracting the minimum,
 * which can be computationally intensive for large queues.
 */
// TODO: If Symbol.iterator is supported by the target environment/transpiler, uncomment this block.
// if (Symbol && Symbol.iterator) {
//   QuickPriorityQueue.prototype[Symbol.iterator] = function*() {
//     if (this.isQueueEmpty()) return;
//     var tempQueue = this.duplicateQueue();
//     while (!tempQueue.isQueueEmpty()) {
//       yield tempQueue.extractMin();
//     }
//   };
// }
QuickPriorityQueue.prototype.iterateElements = function(filterFunction) {
  if (this.isQueueEmpty() || typeof filterFunction !== 'function') {
    return;
  }
  var idx = 0;
  var tempQueue = this.duplicateQueue(); // Create a temporary copy to preserve original queue
  while (!tempQueue.isQueueEmpty()) {
    filterFunction(tempQueue.extractMin(), idx++);
  }
};

/**
 * Retrieves the k 'smallest' elements from the queue.
 * This method runs in O(k log k) time, which is more efficient than
 * repeatedly calling `extractMin` k times for large datasets.
 * @param {number} k - The number of smallest elements to retrieve.
 * @returns {Array} An array containing the k smallest elements.
 */
QuickPriorityQueue.prototype.getKSmallest = function(k) {
  if (this.currentSize === 0) {
    return [];
  }
  var comparisonFunc = this.isLess;
  var dataArray = this.dataArray;
  // Create a temporary priority queue to store indices, ordered by the value at that index
  var tempQueue = new QuickPriorityQueue(function(a, b) {
    return comparisonFunc(dataArray[a], dataArray[b]);
  });

  k = Math.min(this.currentSize, k); // Ensure k does not exceed queue size
  var kElements = new Array(k);
  var counter = 0;
  tempQueue.insertElement(0); // Start with the root index (index 0)

  while (counter < k) {
    var smallestIndex = tempQueue.extractMin();
    kElements[counter++] = this.dataArray[smallestIndex];

    var leftChild = (smallestIndex << 1) + 1; // Calculate left child index
    var rightChild = leftChild + 1; // Calculate right child index

    if (leftChild < this.currentSize) {
      tempQueue.insertElement(leftChild);
    }
    if (rightChild < this.currentSize) {
      tempQueue.insertElement(rightChild);
    }
  }
  return kElements;
};

/**
 * The default comparison function for the priority queue.
 * Returns true if 'a' is strictly less than 'b'.
 * @param {any} a - The first element for comparison.
 * @param {any} b - The second element for comparison.
 * @returns {boolean} True if a < b, false otherwise.
 */
var standardComparator = function(a, b) {
  return a < b;
};

/**
 * Constructor for a QuickPriorityQueue.
 * Initializes an empty priority queue with an optional custom comparison function.
 * @param {function} [comparisonFunc] - An optional function that takes two arguments (a, b)
 *   and returns true if 'a' should come before 'b' in the queue (i.e., a < b).
 *   If not provided, a default comparator for numerical comparison (a < b) is used.
 */
function QuickPriorityQueue(comparisonFunc) {
  // Ensure the constructor is called with 'new'
  if (!(this instanceof QuickPriorityQueue)) {
    return new QuickPriorityQueue(comparisonFunc);
  }
  this.dataArray = []; // The underlying array storing heap elements
  this.currentSize = 0; // The number of elements currently in the heap
  this.isLess = comparisonFunc || standardComparator; // The comparison function
}

/**
 * Creates a shallow copy of the priority queue.
 * Runs in O(n) time, where n is the number of elements.
 * @returns {QuickPriorityQueue} A new QuickPriorityQueue instance with the same elements and comparator.
 */
QuickPriorityQueue.prototype.duplicateQueue = function() {
  var tempQueue = new QuickPriorityQueue(this.isLess);
  tempQueue.currentSize = this.currentSize;
  for (var idx = 0; idx < this.currentSize; idx++) {
    tempQueue.dataArray.push(this.dataArray[idx]);
  }
  return tempQueue;
};

/**
 * Adds an element into the priority queue.
 * This operation runs in O(log n) time, where n is the number of elements.
 * @param {any} itemValue - The value to add to the queue.
 */
QuickPriorityQueue.prototype.insertElement = function(itemValue) {
  var idx = this.currentSize;
  this.dataArray[this.currentSize] = itemValue; // Place new element at the end
  this.currentSize += 1;
  var parentIndex;
  var parentValue;
  while (idx > 0) {
    parentIndex = (idx - 1) >> 1; // Calculate parent index
    parentValue = this.dataArray[parentIndex];
    if (!this.isLess(itemValue, parentValue)) {
      // If the new value is not less than its parent, it's in the correct position
      break;
    }
    this.dataArray[idx] = parentValue; // Move parent down to current position
    idx = parentIndex; // Move up to parent's position
  }
  this.dataArray[idx] = itemValue; // Place the new value in its final sorted position
};

/**
 * Replaces the content of the heap with a provided array and then "heapifies" it.
 * This operation builds a valid heap from an arbitrary array in O(n) time.
 * @param {Array} dataArray - The array to use as the new heap content.
 */
QuickPriorityQueue.prototype.buildHeap = function(dataArray) {
  this.dataArray = dataArray;
  this.currentSize = dataArray.length;
  var idx;
  // Start from the last non-leaf node and bubble down to build the heap
  for (idx = this.currentSize >> 1; idx >= 0; idx--) {
    this._bubbleDown(idx);
  }
};

/*
 * Internal utility function: _bubbleUp(idx, force)
 * Moves an element up the heap to maintain the heap property.
 * @param {number} idx - The index of the element to bubble up.
 * @param {boolean} [force] - If true, forces the bubble up even if the element is not strictly smaller than its parent.
 *   This is typically used in removal operations where an element is temporarily moved to the top.
 */
QuickPriorityQueue.prototype._bubbleUp = function(idx, force) {
  var itemValue = this.dataArray[idx];
  var parentIndex;
  var parentValue;
  while (idx > 0) {
    parentIndex = (idx - 1) >> 1;
    parentValue = this.dataArray[parentIndex];
    // If not forced and the item is not less than its parent, stop bubbling up
    if (!force && !this.isLess(itemValue, parentValue)) {
      break;
    }
    this.dataArray[idx] = parentValue; // Move parent down
    idx = parentIndex; // Move up to parent's position
  }
  this.dataArray[idx] = itemValue; // Place the item in its final position
};

/*
 * Internal utility function: _bubbleDown(idx)
 * Moves an element down the heap to maintain the heap property.
 * @param {number} idx - The index of the element to bubble down.
 */
QuickPriorityQueue.prototype._bubbleDown = function(idx) {
  var currentSize = this.currentSize;
  var halfSize = this.currentSize >>> 1; // Optimization: only need to check up to halfSize (non-leaf nodes)
  var currentValue = this.dataArray[idx];
  var leftChild;
  var rightChild;
  var bestChildValue;

  while (idx < halfSize) {
    leftChild = (idx << 1) + 1; // Calculate left child index
    rightChild = leftChild + 1; // Calculate right child index
    bestChildValue = this.dataArray[leftChild]; // Assume left child is the best initially

    if (rightChild < currentSize) {
      // If right child exists, compare it with left child to find the true best child
      if (this.isLess(this.dataArray[rightChild], bestChildValue)) {
        leftChild = rightChild; // Update best child index to right child
        bestChildValue = this.dataArray[rightChild]; // Update best child value
      }
    }

    // If the current value is not greater than the best child value, stop bubbling down
    if (!this.isLess(bestChildValue, currentValue)) {
      break;
    }

    this.dataArray[idx] = bestChildValue; // Move best child up to current position
    idx = leftChild; // Move down to the best child's position
  }
  this.dataArray[idx] = currentValue; // Place the current value in its final sorted position
};

// --- Standard Input/Output Handling for the main program logic ---

process.stdin.resume(); // Keep the process alive for input
process.stdin.setEncoding('utf8'); // Set input encoding

var receivedLines = []; // Array to store lines read from standard input
var lineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Event listener for each line of input
lineReader.on('line', (lineContent) => {
  receivedLines.push(lineContent);
});

// Event listener for when input stream closes
lineReader.on('close', () => {
  // Parse N (number of elements) and K (max operations) from the first line
  const [numElements, maxOperations] = receivedLines[0].split(" ").map(val => val - 0);
  // Parse the list of numbers from the second line, convert to numbers, and sort in descending order
  const inputList = receivedLines[1].split(" ").map(val => val - 0).sort((a, b) => b - a);

  let lowerBound = 0; // Minimum possible average value
  let upperBound = inputList[0]; // Maximum possible average value (largest element)
  let finalResult = upperBound; // Variable to store the answer (minimum feasible average)

  // Perform binary search to find the minimum average value
  while (lowerBound <= upperBound) {
    const averageValue = Math.ceil((lowerBound + upperBound) / 2); // Calculate midpoint (potential average)
    let isValid = true; // Flag to check if the current averageValue is feasible

    let totalSum = 0;
    for (let idx = 0; idx < numElements; idx++) {
      // Calculate the number of operations needed for each element to reach 'averageValue'
      // If averageValue is 0, and inputList[idx] is positive, Math.ceil(Infinity) is Infinity.
      // If averageValue is 0, and inputList[idx] is 0, Math.ceil(NaN) is NaN.
      // The original code's behavior for these edge cases is preserved.
      totalSum += Math.ceil(inputList[idx] / averageValue) - 1;
      if (totalSum > maxOperations) {
        isValid = false; // If operations exceed K, this averageValue is not feasible
        break;
      }
    }

    if (isValid) {
      finalResult = averageValue; // This averageValue is feasible, try a smaller one
      upperBound = averageValue - 1;
    } else {
      lowerBound = averageValue + 1; // This averageValue is not feasible, try a larger one
    }
  }
  console.log(finalResult); // Output the final minimum feasible average
  return;
});
