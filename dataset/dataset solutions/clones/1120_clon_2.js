class BinaryHeap {
  // Constructor for our custom heap structure.
  constructor() {
    this.heapElements = []; // Stores the actual elements of the heap.

    // Extend Number.prototype with helper methods for heap navigation.
    // These are critical for the heap's behavior and are used directly
    // on number primitives (indices), so their names are kept.
    Number.prototype.parentIdx = function() {
      return Math.ceil(this / 2 - 1);
    };
    Number.prototype.leftIdx = function() {
      return (this << 1) + 1;
    };
    Number.prototype.rightIdx = function() {
      return (this << 1) + 2;
    };
  }

  // Adds a new item to the heap.
  addValue(item) {
    // Push the new item to the end and then "bubble it up" to its correct position.
    this.bubbleUp(this.heapElements.push(item) - 1);
  }

  // Restores the heap property by moving an element up the tree.
  bubbleUp(currentIndex) {
    const elements = this.heapElements; // Reference to the heap array for brevity.
    // Loop while the current element is not the root and is greater than its parent.
    for (let currentPos = currentIndex, parentPos = currentIndex.parentIdx();
      currentPos > 0 && elements[currentPos] > elements[parentPos];
      currentPos = parentPos, parentPos = currentPos.parentIdx()
    ) {
      // Swap the current element with its parent using array destructuring.
      elements[parentPos] = [elements[currentPos], elements[currentPos] = elements[parentPos]][0];
    }
  }

  // Removes and returns the maximum element (root) from the heap.
  removeMax() {
    const extractedValue = this.heapElements[0]; // The maximum element is always at the root.
    // Move the last element to the root position.
    this.heapElements[0] = this.heapElements.pop();
    // Restore the heap property by "heapifying down" from the new root.
    this.heapifyDown(0);
    return extractedValue;
  }

  // Restores the heap property by moving an element down the tree.
  heapifyDown(rootIndex) {
    const elements = this.heapElements; // Reference to the heap array.
    const heapSize = elements.length; // Current size of the heap.

    // Helper function for recursive heapify-down operation.
    const percolateDown = (nodeIndex) => {
      let leftChild, rightChild, largestChild = nodeIndex; // Initialize largest as the current node.

      // Calculate indices of children.
      leftChild = nodeIndex.leftIdx();
      rightChild = nodeIndex.rightIdx();

      // Check if left child exists and is larger than the current largest.
      if (leftChild < heapSize && elements[leftChild] > elements[largestChild]) {
        largestChild = leftChild;
      }
      // Check if right child exists and is larger than the current largest.
      if (rightChild < heapSize && elements[rightChild] > elements[largestChild]) {
        largestChild = rightChild;
      }

      // If the largest element is not the current node, swap them and recurse.
      if (largestChild !== nodeIndex) {
        elements[largestChild] = [elements[nodeIndex], elements[nodeIndex] = elements[largestChild]][0];
        percolateDown(largestChild); // Recursively call on the affected subtree.
      }
    };
    percolateDown(rootIndex); // Start the heapify-down process from the given root.
  }
}

// Main execution block, wrapped in an Immediately Invoked Function Expression (IIFE).
(function executeOperations() {
  // Read input from standard input, process it, and split into lines.
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n').slice(0, -1);

  // Create an instance of our priority queue.
  const priorityData = new BinaryHeap();
  let outputBuffer = ''; // Buffer to accumulate output strings.

  // Iterate over each command line.
  inputLines.forEach(function(commandString) {
    // Determine the operation based on the first character of the command.
    switch (commandString.charAt(0)) {
      case 'i': // 'i' for insert
        // Extract the number from the command string and insert it into the queue.
        priorityData.addValue(Number(commandString.split(' ')[1]));
        break;
      case 'e': // 'e' for extract
        // Extract the maximum element and append it to the output buffer with a newline.
        outputBuffer += `${priorityData.removeMax()}\n`;
        break;
    }
  });
  // Write the accumulated output to standard output.
  process.stdout.write(outputBuffer);
})();
