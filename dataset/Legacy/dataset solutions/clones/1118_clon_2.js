class BinaryHeap {
  constructor() {
    this.heapElements = []; // Stores the elements of the heap
    // Extend Number.prototype for convenience in index calculations
    Number.prototype.parentIdx = function() {
      return (this - 1) >> 1;
    };
    Number.prototype.leftIdx = function() {
      return (this << 1) + 1;
    };
    Number.prototype.rightIdx = function() {
      return (this << 1) + 2;
    };
  }

  // Adds a new value to the heap and maintains the heap property
  addValue(val) {
    this.bubbleUp(this.heapElements.push(val) - 1);
  }

  // Moves an element up the heap to restore the heap property
  bubbleUp(currentIndex) {
    const elements = this.heapElements;
    for (
      let currentPosition = currentIndex, parentPosition = currentIndex.parentIdx();
      currentPosition > 0 && elements[currentPosition] > elements[parentPosition];
      currentPosition = parentPosition, parentPosition = currentPosition.parentIdx()
    ) {
      // Swap elements using array destructuring trick
      elements[parentPosition] = [elements[currentPosition], elements[currentPosition] = elements[parentPosition]][0];
    }
  }

  // Removes and returns the maximum element from the heap
  removeMax() {
    const resultValue = this.heapElements[0]; // The maximum element is always at the root
    this.heapElements[0] = this.heapElements.pop(); // Move the last element to the root
    this.heapifyDown(0); // Restore heap property from the root
    return resultValue;
  }

  // Moves an element down the heap to restore the heap property
  heapifyDown(rootIndex) {
    const elements = this.heapElements;
    const elementCount = elements.length;

    // Helper function for recursive heapify
    const recursiveHeapify = (currentRoot) => {
      let leftChildIndex, rightChildIndex, largestElementIndex = currentRoot;

      leftChildIndex = currentRoot.leftIdx();
      rightChildIndex = currentRoot.rightIdx();

      // Check if left child exists and is larger than current largest
      if (leftChildIndex < elementCount && elements[leftChildIndex] > elements[largestElementIndex]) {
        largestElementIndex = leftChildIndex;
      }
      // Check if right child exists and is larger than current largest
      if (rightChildIndex < elementCount && elements[rightChildIndex] > elements[largestElementIndex]) {
        largestElementIndex = rightChildIndex;
      }

      // If the largest element is not the current root, swap and recurse
      if (largestElementIndex !== currentRoot) {
        elements[largestElementIndex] = [elements[currentRoot], elements[currentRoot] = elements[largestElementIndex]][0];
        recursiveHeapify(largestElementIndex);
      }
    };
    recursiveHeapify(rootIndex);
  }
}

// Main program execution block
(function executeProgram() {
  // Read input from stdin, trim whitespace, split by newlines, and remove the last empty line
  const inputCommands = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n').slice(0, -1);
  const priorityDataStructure = new BinaryHeap(); // Instantiate the priority queue
  let outputBuffer = ''; // Buffer to accumulate output strings

  // Process each command line
  inputCommands.forEach(function(currentCommand) {
    switch (currentCommand.charAt(0)) {
      case 'i': // 'insert' command
        priorityDataStructure.addValue(Number(currentCommand.split(' ')[1]));
        break;
      case 'e': // 'extract' command
        outputBuffer += `${priorityDataStructure.removeMax()}\n`;
        break;
    }
  });
  // Write the accumulated output to stdout
  process.stdout.write(outputBuffer);
})();
