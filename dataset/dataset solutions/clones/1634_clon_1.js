/*
 * This section contains internal utility methods
 * for the FastPriorityQueue implementation.
 *
 * It's important to keep these methods optimized
 * for performance.
 */
FastPriorityQueue.prototype._removeAt = function (index) {
  // Validate the provided index.
  if (index > this.size - 1 || index < 0) {
    return undefined; /* Nothing to remove at this index. */
  }

  // Original implementation alternatives (commented out):
  // impl1:
  // this.array.splice(index, 1);
  // this.heapify(this.array);
  // impl2:
  // We use percolateUp to move the element at 'index' to the top,
  // making it easy to remove using poll().
  this._percolateUp(index, true); // The 'true' forces the percolation.

  // After percolating up, the item is at the root, so we can poll it.
  return this.poll();
}; // End of _removeAt method definition.


/*
 * Public API method: remove(myval)
 * Searches for and removes an item matching the provided value.
 *
 * Uses the queue's internal comparator for equality checks.
 * Returns 'true' if an item was successfully removed, 'false' otherwise.
 */
FastPriorityQueue.prototype.remove = function (myval) {
  // Iterate through the entire array to find a matching value.
  for (var i = 0; i < this.size; i++) {
    // Check for equality using the comparator:
    // If compare(item, myval) is false AND compare(myval, item) is false,
    // then the items are considered equal.
    if (!this.compare(this.array[i], myval) && !this.compare(myval, this.array[i])) {
      // Items match, proceed with removal.
      this._removeAt(i); // Call the internal helper to remove at index 'i'.
      return true; // Successfully removed.
    }
  }
  return false; // No matching item found after checking all elements.
}; // End of remove method.


// Internal helper function for batch removal operations.
// It removes items for which the provided callback returns true.
FastPriorityQueue.prototype._batchRemove = function (callback, limit) {
  // Initialize the return array. Its maximum size is either the 'limit'
  // or the current size of the queue if no limit is specified.
  var retArr = new Array(limit ? limit : this.size);
  var count = 0; // Counter for removed items.

  // Only proceed if the callback is a function and the queue is not empty.
  if (typeof callback === 'function' && this.size) {
    var i = 0; // Current index for iteration.
    // Loop while we haven't reached the end of the queue
    // and haven't hit the removal limit (if any).
    while (i < this.size && count < retArr.length) {
      // If the callback evaluates to true for the current item, remove it.
      if (callback(this.array[i])) {
        retArr[count] = this._removeAt(i); // Remove and store the item.
        count++; // Increment the count of removed items.
        // After removing an item, the heap structure changes.
        // Moving the index up (i = i >> 1) can help re-evaluate
        // the new element that might have taken its place,
        // or prevent skipping elements after a removal.
        i = i >> 1; // Bitwise right shift for integer division by 2.
      } else {
        i++; // Move to the next item if the callback returns false.
      }
    }
  }
  // Trim the return array to its actual size (number of removed items).
  retArr.length = count;
  return retArr; // Return the array of removed items.
};


/*
 * removeOne(callback)
 * Executes the callback for each item and removes the *first* item
 * for which the callback returns true.
 * Returns the removed item, or undefined if no item was removed.
 */
FastPriorityQueue.prototype.removeOne = function (callback) {
  // Use _batchRemove with a limit of 1 to remove only the first matching item.
  var arr = this._batchRemove(callback, 1);
  // Return the first (and only) item if it exists, otherwise undefined.
  return arr.length > 0 ? arr[0] : undefined;
};


/*
 * removeMany(callback[, limit])
 * Executes the callback for each item and removes *all* items
 * for which the callback returns true.
 *
 * An optional 'limit' can be specified to cap the number of removals.
 * If 'limit' is not provided, all matching items will be removed.
 *
 * Returns an array containing all the removed items.
 */
FastPriorityQueue.prototype.removeMany = function (callback, limit) {
  // This method directly delegates to the internal _batchRemove helper.
  return this._batchRemove(callback, limit);
};


// Peek at the top element of the queue without removing it.
// This operation runs in constant time, O(1).
//
// If the priority queue is empty, this function returns `undefined`.
// For details on `undefined`:
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/undefined
//
FastPriorityQueue.prototype.peek = function () {
  // Check if the queue is empty.
  if (this.size == 0) return undefined;
  // Return the element at the root of the heap (index 0).
  return this.array[0];
};


/**
 * Removes and returns the element at the top of the heap (one of the smallest elements).
 * This operation runs in logarithmic time, O(log n), due to heap restructuring.
 *
 * If the priority queue is empty, this function returns `undefined`.
 * For more info on `undefined`:
 * @see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/undefined
 *
 * For long-running or large priority queues, especially those storing
 * large objects, consider calling the `trim()` function periodically
 * to recover unused memory allocated by the underlying array.
 */
FastPriorityQueue.prototype.poll = function () {
  // If the queue is empty, there's nothing to poll.
  if (this.size == 0) {
    return undefined;
  }

  var ans = this.array[0]; // Store the top element to be returned.

  // If there's more than one element, replace the root with the last element
  // and then percolate down to restore heap property.
  if (this.size > 1) {
    this.array[0] = this.array[--this.size]; // Move last element to root, decrement size.
    this._percolateDown(0); // Restore heap property from the root.
  } else {
    // If only one element was present, just decrement size.
    this.size -= 1;
  }
  return ans; // Return the removed top element.
};


// Replaces the top element of the heap with a new value.
// This function adds 'myval' to the heap while removing and
// returning one of the smallest elements (similar to poll).
// The size of the queue remains unchanged after this operation.
FastPriorityQueue.prototype.replaceTop = function (myval) {
  // If the queue is empty, there's no top element to replace.
  if (this.size == 0) return undefined;

  var ans = this.array[0]; // Store the current top element to be returned.
  this.array[0] = myval; // Place the new value at the root.
  this._percolateDown(0); // Restore heap property starting from the root.
  return ans; // Return the element that was replaced.
};


// Recovers unused memory for long-running priority queues.
// This method re-allocates the internal array to its current 'size',
// effectively discarding any extra allocated space.
FastPriorityQueue.prototype.trim = function () {
  this.array = this.array.slice(0, this.size);
};


// Checks whether the heap (priority queue) is empty.
FastPriorityQueue.prototype.isEmpty = function () {
  return this.size === 0;
};


// Iterates over the items in the priority queue.
// A callback function is provided which receives (item, index) as arguments.
// Note: This iteration consumes the queue by repeatedly polling.
//
// TODO: Uncomment the Symbol.iterator implementation once transpilation is in place.
// if (Symbol && Symbol.iterator) {
//   FastPriorityQueue.prototype[Symbol.iterator] = function*() {
//     if (this.isEmpty()) return;
//     var fpq = this.clone();
//     while (!fpq.isEmpty()) {
//       yield fpq.poll();
//     }
//   };
// }
FastPriorityQueue.prototype.forEach = function (callback) {
  // If the queue is empty or the callback is not a function, do nothing.
  if (this.isEmpty() || typeof callback != 'function') {
    return;
  }

  var i = 0; // Initialize index for the callback.
  // Create a clone of the queue to iterate without modifying the original.
  var fpq = this.clone();

  // Poll elements from the clone until it's empty.
  while (!fpq.isEmpty()) {
    callback(fpq.poll(), i++); // Execute callback with item and incremented index.
  }
};


/*
 * kSmallest(k)
 * Returns the 'k' smallest elements from the queue.
 *
 * This method runs in O(k log k) time, which is more efficient than
 * repeatedly calling `poll()` 'k' times (which would be O(k log n)).
 * This can be particularly important for large datasets or when 'k' is small relative to 'n'.
 */
FastPriorityQueue.prototype.kSmallest = function (k) {
  // If the queue is empty, there are no smallest elements.
  if (this.size == 0) {
    return [];
  }

  var comparator = this.compare; // Get the internal comparator.
  var arr = this.array; // Reference to the internal array.

  // Create a new priority queue to manage indices of elements.
  // This new FPQ will compare elements based on their values in 'this.array'.
  var fpq = new FastPriorityQueue(function (a, b) {
    return comparator(arr[a], arr[b]);
  });

  // Ensure 'k' does not exceed the size of the queue.
  k = Math.min(this.size, k);

  var smallest = new Array(k); // Array to store the 'k' smallest elements.
  var j = 0; // Index for populating the 'smallest' array.

  fpq.add(0); // Add the index of the root element (the smallest overall) to the helper FPQ.

  // Loop until 'k' elements have been collected.
  while (j < k) {
    var small = fpq.poll(); // Get the index of the current smallest element.
    smallest[j++] = this.array[small]; // Add the actual element to the result array.

    // Calculate indices of children for the element at 'small'.
    var l = (small << 1) + 1; // Left child index.
    var r = l + 1; // Right child index.

    // If children exist within the bounds of the original array, add their indices
    // to the helper FPQ to consider them for future smallest elements.
    if (l < this.size) fpq.add(l);
    if (r < this.size) fpq.add(r);
  }
  return smallest; // Return the array of 'k' smallest elements.
};


// Default comparator function.
// It returns 'true' if 'a' is less than 'b'.
var defaultcomparator = function (a, b) {
  return a < b;
};


// FastPriorityQueue constructor function.
// The provided comparator function should take two arguments, 'a' and 'b',
// and return 'true' if 'a' should have higher priority (i.e., 'a < b').
function FastPriorityQueue(comparator) {
  // Ensure the constructor is called with 'new'.
  if (!(this instanceof FastPriorityQueue)) {
    return new FastPriorityQueue(comparator);
  }

  this.array = []; // Internal array to store heap elements.
  this.size = 0; // Current number of elements in the queue.
  // Assign the provided comparator or use the default one.
  this.compare = comparator || defaultcomparator;
}


// Creates a shallow clone of the priority queue.
// This operation runs in O(n) time, where 'n' is the number of elements.
FastPriorityQueue.prototype.clone = function () {
  var fpq = new FastPriorityQueue(this.compare); // Create a new FPQ with the same comparator.
  fpq.size = this.size; // Copy the size.
  // Copy all elements from the original array to the new queue's array.
  for (var i = 0; i < this.size; i++) {
    fpq.array.push(this.array[i]);
  }
  return fpq; // Return the cloned priority queue.
};


// Adds an element into the queue.
// This operation runs in O(log n) time due to the percolation process.
FastPriorityQueue.prototype.add = function (myval) {
  var i = this.size; // Get the next available index.
  this.array[this.size] = myval; // Place the new value at the end of the array.
  this.size += 1; // Increment the size of the queue.

  var p; // Parent index.
  var ap; // Value of the parent element.

  // Percolate up: move the new value up the heap until its proper place is found.
  while (i > 0) {
    p = (i - 1) >> 1; // Calculate parent index using bitwise right shift.
    ap = this.array[p]; // Get parent's value.

    // If the new value is not "smaller" (higher priority) than its parent,
    // then its correct position has been found.
    if (!this.compare(myval, ap)) {
      break;
    }

    this.array[i] = ap; // Move parent down.
    i = p; // Move current index up to parent's position.
  }
  this.array[i] = myval; // Place the new value in its final position.
};


// Replaces the content of the heap with a provided array and then "heapifies" it.
// This process builds a valid heap from an arbitrary array.
FastPriorityQueue.prototype.heapify = function (arr) {
  this.array = arr; // Assign the new array.
  this.size = arr.length; // Update the size.

  var i;
  // Start heapifying from the last non-leaf node and move upwards to the root.
  // The last non-leaf node is at index (size / 2) - 1.
  // Using bitwise right shift: this.size >> 1 is equivalent to Math.floor(this.size / 2).
  for (i = this.size >> 1; i >= 0; i--) {
    this._percolateDown(i); // Percolate down each node to maintain heap property.
  }
};


// Internal helper function: percolates an element up the heap.
// If 'force' is true, it will always percolate up regardless of comparison,
// useful for removing elements.
FastPriorityQueue.prototype._percolateUp = function (i, force) {
  var myval = this.array[i]; // The value to percolate up.
  var p; // Parent index.
  var ap; // Parent's value.

  // Continue percolating up as long as we are not at the root.
  while (i > 0) {
    p = (i - 1) >> 1; // Calculate parent index.
    ap = this.array[p]; // Get parent's value.

    // If 'force' is not true, and the current value is not "smaller"
    // (higher priority) than its parent, then break the loop.
    if (!force && !this.compare(myval, ap)) {
      break;
    }

    this.array[i] = ap; // Move parent down to current position.
    i = p; // Move current index up to parent's position.
  }
  this.array[i] = myval; // Place the value in its final sorted position.
};


// Internal helper function: percolates an element down the heap.
// This restores the heap property after an element has been moved or replaced.
FastPriorityQueue.prototype._percolateDown = function (i) {
  var size = this.size; // Current size of the heap.
  var hsize = this.size >>> 1; // Half the size (first index of a non-leaf node).
  var ai = this.array[i]; // The value at the current position 'i'.
  var l; // Left child index.
  var r; // Right child index.
  var bestc; // Best child value (smallest/highest priority).

  // Continue percolating down as long as 'i' is not a leaf node (i.e., less than hsize).
  while (i < hsize) {
    l = (i << 1) + 1; // Calculate left child index.
    r = l + 1; // Calculate right child index.

    bestc = this.array[l]; // Assume left child is the best child initially.

    // If a right child exists and is "smaller" (higher priority) than the left child,
    // then the right child becomes the best child.
    if (r < size) {
      if (this.compare(this.array[r], bestc)) {
        l = r; // Update 'l' to point to the index of the better child.
        bestc = this.array[r]; // Update 'bestc' with the better child's value.
      }
    }

    // If the best child is not "smaller" (higher priority) than the current value 'ai',
    // then 'ai' is in its correct position relative to its children, so break.
    if (!this.compare(bestc, ai)) {
      break;
    }

    this.array[i] = bestc; // Move the best child up to the current position.
    i = l; // Move current index down to the best child's position.
  }
  this.array[i] = ai; // Place the original value 'ai' in its final sorted position.
};


// --- Standard Input/Output Handling for competitive programming context ---

// Resume standard input and set encoding to UTF-8.
process.stdin.resume();
process.stdin.setEncoding('utf8');

var input_lines = []; // Array to store lines read from standard input.

// Create a readline interface to handle input.
var reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout // Output is also configured, though not directly used for printing here.
});

// Event listener for each new line of input.
reader.on('line', (line) => {
  input_lines.push(line); // Add the read line to our array.
});

// Event listener for when the input stream closes (EOF).
reader.on('close', () => {
  // Parse the first line for N and K.
  const [N, K] = input_lines[0].split(" ").map(v => v - 0);
  // Parse the second line, convert to numbers, and sort in descending order.
  const list = input_lines[1].split(" ").map(v => v - 0).sort((a, b) => b - a);

  let min = 0; // Lower bound for binary search on the answer.
  let max = list[0]; // Upper bound for binary search (largest element).
  let ans = max; // Variable to store the best possible answer found.

  // Binary search for the minimum possible 'ave'.
  while (min <= max) {
    const ave = Math.ceil((min + max) / 2); // Calculate the middle value.
    let flg = true; // Flag to track if the current 'ave' is feasible.

    let sum = 0; // Sum of operations needed.
    // Iterate through the list to check feasibility with current 'ave'.
    for (let i = 0; i < N; i++) {
      sum += Math.ceil(list[i] / ave) - 1; // Calculate operations for current element.
      if (sum > K) {
        flg = false; // If sum exceeds K, this 'ave' is not feasible.
        break;
      }
    }

    // Adjust binary search bounds based on feasibility.
    if (flg) {
      ans = ave; // This 'ave' is feasible, try for a smaller one.
      max = ave - 1;
    } else {
      min = ave + 1; // This 'ave' is not feasible, need a larger one.
    }
  }
  console.log(ans); // Output the final answer.
  return; // End of the close event handler.
});