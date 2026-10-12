class PriorityQueueManager {
  constructor() {
    this.heapElements = [];
  }

  // Private helper functions for index calculations
  _getParentIndex(currentIndex) {
    return (currentIndex - 1) >> 1;
  }

  _getLeftChildIndex(currentIndex) {
    return (currentIndex << 1) + 1;
  }

  _getRightChildIndex(currentIndex) {
    return (currentIndex << 1) + 2;
  }

  // Private helper for swapping elements
  _swapElements(firstIndex, secondIndex) {
    const elements = this.heapElements;
    const tempValue = elements[firstIndex];
    elements[firstIndex] = elements[secondIndex];
    elements[secondIndex] = tempValue;
  }

  addValue(newValue) {
    this.heapElements.push(newValue);
    this.bubbleUp(this.heapElements.length - 1);
  }

  bubbleUp(initialIndex) {
    const elements = this.heapElements;
    let currentPosition = initialIndex;
    let parentPosition = this._getParentIndex(currentPosition);

    while (currentPosition > 0 && elements[currentPosition] > elements[parentPosition]) {
      this._swapElements(currentPosition, parentPosition);
      currentPosition = parentPosition;
      parentPosition = this._getParentIndex(currentPosition);
    }
  }

  removeMax() {
    const currentHeapSize = this.heapElements.length;

    if (currentHeapSize === 0) {
      return undefined; // Nothing to extract
    }

    if (currentHeapSize === 1) {
      return this.heapElements.pop(); // Only one element, just remove it
    }

    const extractedValue = this.heapElements[0];
    this.heapElements[0] = this.heapElements.pop(); // Move last element to root
    this.heapifyDown(0); // Restore heap property
    return extractedValue;
  }

  heapifyDown(rootNodeIndex) {
    const elements = this.heapElements;
    const heapLength = elements.length;

    // Inner recursive function to perform heapify operation
    const performRecursiveHeapify = (nodeIndex) => {
      let leftChild = this._getLeftChildIndex(nodeIndex);
      let rightChild = this._getRightChildIndex(nodeIndex);
      let largestElementIndex = nodeIndex;

      if (leftChild < heapLength && elements[leftChild] > elements[largestElementIndex]) {
        largestElementIndex = leftChild;
      }
      if (rightChild < heapLength && elements[rightChild] > elements[largestElementIndex]) {
        largestElementIndex = rightChild;
      }

      if (largestElementIndex !== nodeIndex) {
        this._swapElements(nodeIndex, largestElementIndex);
        performRecursiveHeapify(largestElementIndex);
      }
    };

    performRecursiveHeapify(rootNodeIndex);
  }
}

(function executeMainLogic() {
  const standardInputPath = '/dev/stdin';
  const fileSystemModule = require('fs');

  const rawFileContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');
  const trimmedContent = rawFileContent.trim();
  const allInputLines = trimmedContent.split('\n');
  const processedCommands = allInputLines.slice(0, -1); // Exclude the last line (often empty or sentinel)

  const priorityQueueInstance = new PriorityQueueManager();
  const outputLinesBuffer = [];

  const parseInsertCommandValue = (commandString) => {
    const commandParts = commandString.split(' ');
    return Number(commandParts[1]);
  };

  for (const currentCommand of processedCommands) {
    const commandTypeIndicator = currentCommand.charAt(0);

    if (commandTypeIndicator === 'i') {
      const valueToInsert = parseInsertCommandValue(currentCommand);
      priorityQueueInstance.addValue(valueToInsert);
    } else if (commandTypeIndicator === 'e') {
      const extractedResult = priorityQueueInstance.removeMax();
      outputLinesBuffer.push(extractedResult);
    }
  }

  process.stdout.write(outputLinesBuffer.join('\n') + '\n');
})();
