function MinHeapStructure() {
  this.dataStore = []; // Array to store heap elements
}

MinHeapStructure.prototype = {
  // Inserts a new value into the min-heap.
  insertElement: function (val) {
    let ds = this.dataStore;
    let idx = ds.length; // Index where the new element is initially placed
    ds.push(val); // Add the element to the end of the array

    // Bubble up the new element to maintain the min-heap property
    while (idx > 0) {
      let parentIdx = (idx - 1) >> 1; // Calculate parent index
      if (ds[parentIdx] <= val) {
        break; // If parent is smaller or equal, correct position found
      }
      ds[idx] = ds[parentIdx]; // Move parent down
      idx = parentIdx; // Move up to the parent's position
    }
    ds[idx] = val; // Place the new element at its final position
  },

  // Removes and returns the smallest element from the min-heap.
  extractMin: function () {
    let ds = this.dataStore;
    let minVal = ds[0]; // The smallest element is always at the root
    let lastVal = ds.pop(); // Remove the last element from the heap

    // If the heap is not empty after removing the root, re-heapify
    if (ds.length > 0) {
      let idx = 0;
      let childLimit = ds.length >> 1; // Only need to check parents up to this index

      // Bubble down the last element to maintain the min-heap property
      while (idx < childLimit) {
        let leftChildIdx = (idx << 1) + 1; // Calculate left child index
        let rightChildIdx = leftChildIdx + 1; // Calculate right child index
        let smallestChildIdx = leftChildIdx;

        // Determine which child is smaller (if right child exists and is smaller)
        if (rightChildIdx < ds.length && ds[rightChildIdx] < ds[leftChildIdx]) {
          smallestChildIdx = rightChildIdx;
        }

        if (lastVal <= ds[smallestChildIdx]) {
          break; // If lastVal is smaller or equal to its smallest child, correct position found
        }

        ds[idx] = ds[smallestChildIdx]; // Move smallest child up
        idx = smallestChildIdx; // Move down to the child's position
      }
      ds[idx] = lastVal; // Place the last element at its final position
    }
    return minVal; // Return the original minimum value
  },

  // Returns the current number of elements in the heap.
  getElementCount: function () {
    return this.dataStore.length;
  },

  // Returns the smallest element without removing it.
  peekMin: function () {
    return this.dataStore[0];
  },
};

// A utility function for sorting numbers in ascending order.
function numericComparator(firstNum, secondNum) {
  return firstNum - secondNum;
}

// Main function to process the input data.
function processInput(inputString) {
  // Extract the first line as the array length.
  let arrayLength = parseInt(inputString.split("\n")[0], 10);

  // Extract the second line, split by space, and convert to numbers.
  let numberArray = inputString.split("\n")[1].split(" ").map(Number);

  // Sort the array of numbers in ascending order.
  numberArray.sort(numericComparator);

  // Initialize a min-heap to store the calculated sums of squares.
  let resultHeap = new MinHeapStructure();

  // Iterate through a range of 'i' values, from the smallest to one less than the largest number in the array.
  for (let outerLoopIdx = numberArray[0]; outerLoopIdx < numberArray[arrayLength - 1]; outerLoopIdx++) {
    let currentSumOfSquares = 0; // Accumulator for the sum of squares for the current 'i'

    // Calculate the sum of squares of differences for each number in the array.
    for (let innerLoopIdx = 0; innerLoopIdx < arrayLength; innerLoopIdx++) {
      let difference = numberArray[innerLoopIdx] - outerLoopIdx;
      currentSumOfSquares += difference * difference;
    }
    // Add the calculated sum of squares to the min-heap.
    resultHeap.insertElement(currentSumOfSquares);
  }

  // Output the smallest sum of squares found, which is at the top of the min-heap.
  console.log(resultHeap.peekMin());
  return; // End of function execution.
}

// Read input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
