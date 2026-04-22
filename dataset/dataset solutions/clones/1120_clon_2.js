class orderedHeap {
  // This class implements a max-priority queue (or max-heap) data structure.
  constructor() {
    this.elements = [ ]; // The internal array storing heap elements.

    // Extend Number prototype to include helper methods for heap navigation.
    // These methods calculate parent, left child, and right child indices.
    Number.prototype.getSuperIndex = function ( ) {
      return Math.floor( ( this - 1 ) / 2 ); // Calculate parent index.
    };
    Number.prototype.leftChildPosition = function ( ) {
      return ( this * 2 ) + 1; // Calculate left child index.
    };
    Number.prototype.rightChildPosition = function ( ) {
      return ( this * 2 ) + 2; // Calculate right child index.
    };
  }

  // Adds a new value to the heap and maintains the heap property by sifting it up.
  addEntry(itemData) {
    const newElementIndex = this.elements.push(itemData) - 1; // Add to end, get its index.
    this.promoteElement(newElementIndex); // Sift up the new element.
  }

  // Restores the max-heap property by moving an element up the heap.
  promoteElement(childPosition) {
    const items = this.elements; // Local reference to the heap array.
    let currentPosition = childPosition;
    let parentPosition = childPosition.getSuperIndex();

    // Loop while current element is not the root and is greater than its parent.
    for (
      ;
      currentPosition > 0 && items[currentPosition] > items[parentPosition];
      currentPosition = parentPosition, parentPosition = currentPosition.getSuperIndex()
    ) {
      // Swap the current element with its parent.
      items[parentPosition] = [items[currentPosition], items[currentPosition] = items[parentPosition]][0];
    }
  }

  // Removes and returns the maximum element (root) from the heap.
  extractMax() {
    const highestValue = this.elements[0]; // Store the root element.
    this.elements[0] = this.elements.pop(); // Move the last element to the root.
    this.rearrangeHeap(0); // Restore heap property by sifting down the new root.
    return highestValue;
  }

  // Restores the max-heap property by moving an element down the heap.
  rearrangeHeap(initialPosition) {
    const items = this.elements; // Local reference to the heap array.
    const totalCount = items.length; // Total number of elements in the heap.

    // Inner recursive function to perform the sift-down operation.
    const recursiveDownSift = (nodeIdx) => {
      let leftChild, rightChild, maxChildIdx = nodeIdx;

      leftChild = nodeIdx.leftChildPosition(); // Get index of the left child.
      rightChild = nodeIdx.rightChildPosition(); // Get index of the right child.

      // Check if left child exists and is greater than current max.
      if (leftChild < totalCount && items[leftChild] > items[maxChildIdx]) {
        maxChildIdx = leftChild;
      }
      // Check if right child exists and is greater than current max.
      if (rightChild < totalCount && items[rightChild] > items[maxChildIdx]) {
        maxChildIdx = rightChild;
      }

      // If the largest element is not the current node, swap them and recurse.
      if (maxChildIdx != nodeIdx) {
        items[maxChildIdx] = [items[nodeIdx], items[nodeIdx] = items[maxChildIdx]][0]; // Perform swap.
        recursiveDownSift(maxChildIdx); // Recursively sift down from the new position.
      }
    };

    recursiveDownSift(initialPosition); // Start the sift-down from the given initial position.
  }
}

// Main execution block for processing input commands.
(function applicationEntry() {
  // Read input from stdin, trim trailing whitespace, split by newline, and remove the last empty line.
  const inputData = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' }).trimEnd().split('\n').slice(0, -1);
  const heapInstance = new orderedHeap(); // Create a new heap instance.
  let outputBuffer = ''; // Buffer to accumulate output strings.

  // Iterate over each command line from the input.
  inputData.forEach(function(currentInstruction) {
    // Use a switch statement based on the first character's ASCII code.
    switch(currentInstruction.codePointAt(0)) {
      case 0x69: // 'i' for insert operation.
        // Extract the number from the command and add it to the heap.
        heapInstance.addEntry(parseInt(currentInstruction.split(' ')[1], 10));
        break;
      case 0x65: // 'e' for extract operation.
        // Extract the maximum value, convert to string, and append to the output buffer with a newline.
        outputBuffer += String(heapInstance.extractMax()) + '\n';
        break;
    }
  });

  // Write the accumulated output to stdout.
  process.stdout.write(outputBuffer);
})();