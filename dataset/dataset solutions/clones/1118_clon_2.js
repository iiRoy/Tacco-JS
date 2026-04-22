class TopPriorityCollection {
  // This is the constructor method for our priority queue implementation.
  constructor() {
    this.itemStore = []; // The internal array that holds the heap elements.

    // Extend the Number prototype with utility methods for navigating the heap structure.
    Number.prototype.getUpstreamIndex = function() {
      // Calculates the parent node's index for the current index.
      // Using unsigned right shift for potential minor performance or clarity.
      return (this - 1) >>> 1;
    };

    Number.prototype.getLeftChildIndex = function() {
      // Determines the index of the left child node.
      return (this << 1) + 1;
    };

    Number.prototype.getRightChildIndex = function() {
      // Determines the index of the right child node.
      return (this << 1) + 2;
    };
  }

  // Method to add a new value into the collection, maintaining the heap property.
  addEntry(newValue) {
    this.bubbleUpElement(this.itemStore.push(newValue) - 1); // Add and then adjust its position.
  }

  // This function moves an element up the heap from a given index
  // until the max-heap property is restored.
  bubbleUpElement(currentIndex) {
    const elementContainer = this.itemStore; // Get a reference to the array for efficiency.

    // Loop continues as long as the current element is not the root
    // and is greater than its parent.
    for (
      let currentPosition = currentIndex,
        parentPosition = currentPosition.getUpstreamIndex();
      currentPosition > 0 && elementContainer[currentPosition] > elementContainer[parentPosition];
      currentPosition = parentPosition,
        parentPosition = currentPosition.getUpstreamIndex()
    ) {
      // Swap the element with its parent using a concise array destructuring trick.
      elementContainer[parentPosition] = [elementContainer[currentPosition], (elementContainer[currentPosition] = elementContainer[parentPosition])][0];
    }
  }

  // Retrieves and removes the highest priority element (the root) from the collection.
  removeHighest() {
    const resultValue = this.itemStore[0]; // Store the highest priority value.
    this.itemStore[0] = this.itemStore.pop(); // Replace the root with the last element.
    this.siftDownElement(0); // Restore the heap property starting from the new root.
    return resultValue; // Return the extracted highest priority value.
  }

  // This method ensures that the subtree rooted at 'currentIndex' satisfies the max-heap property.
  siftDownElement(currentIndex) {
    const elementContainer = this.itemStore, // Reference to the underlying data array.
      totalElements = elementContainer.length; // Total number of elements in the heap.

    // Define a nested helper function for the recursive sifting process.
    const recursiveSift = (targetPosition) => {
      let leftChild,
        rightChild,
        largestElementIndex = targetPosition; // Assume current node is largest initially.

      leftChild = targetPosition.getLeftChildIndex(); // Calculate index of the left child.
      rightChild = targetPosition.getRightChildIndex(); // Calculate index of the right child.

      // Check if the left child exists and is larger than the current largest.
      if (leftChild < totalElements && elementContainer[leftChild] > elementContainer[largestElementIndex]) {
        largestElementIndex = leftChild;
      }
      // Check if the right child exists and is larger than the current largest.
      if (rightChild < totalElements && elementContainer[rightChild] > elementContainer[largestElementIndex]) {
        largestElementIndex = rightChild;
      }

      // If the largest element is not the current node, a swap is needed.
      if (largestElementIndex !== targetPosition) {
        // Perform the swap operation.
        elementContainer[largestElementIndex] = [elementContainer[targetPosition], (elementContainer[targetPosition] = elementContainer[largestElementIndex])][0];
        recursiveSift(largestElementIndex); // Recursively call sift-down on the affected subtree.
      }
    };
    recursiveSift(currentIndex); // Start the sifting process from the initial index.
  }
}

// This immediately invoked function expression (IIFE) serves as the main entry point for the program.
(function programEntry() {
  // Read input from stdin, decode as UTF-8, remove leading/trailing whitespace,
  // split into lines, and then remove the last (empty) line.
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n').slice(0, -1);

  const dataStructure = new TopPriorityCollection(); // Instantiate our custom priority queue.
  let outputAccumulator = ''; // Initialize an empty string to accumulate output.

  // Iterate over each command line received from the input.
  inputLines.forEach(function(commandText) {
    // Use a switch statement to handle different command types based on the first character.
    switch (commandText.charAt(0)) {
      case 'i': // 'i' indicates an insert operation.
        // Extract the numeric value from the command string and add it to the queue.
        dataStructure.addEntry(Number(commandText.split(' ')[1]));
        break;
      case 'e': // 'e' indicates an extract operation.
        // Extract the highest priority element, append it to the output string, followed by a newline.
        outputAccumulator += `${dataStructure.removeHighest()}\n`;
        break;
    }
  });
  // Write the entire accumulated output string to standard output.
  process.stdout.write(outputAccumulator);
})();