class PriorityQueueManager {
  constructor() {
    this.heapElements = [];
  }

  static _getParentIndex(childIndex) {
    return Math.floor((childIndex - 1) / 2);
  }

  static _getLeftChildIndex(parentIndex) {
    return 2 * parentIndex + 1;
  }

  static _getRightChildIndex(parentIndex) {
    return 2 * parentIndex + 2;
  }

  _swapElements(firstIndex, secondIndex) {
    const temporaryValue = this.heapElements[firstIndex];
    this.heapElements[firstIndex] = this.heapElements[secondIndex];
    this.heapElements[secondIndex] = temporaryValue;
  }

  addValue(newValue) {
    this.heapElements.push(newValue);
    this.bubbleUp(this.heapElements.length - 1);
  }

  bubbleUp(currentIndex) {
    const elements = this.heapElements;
    let currentPosition = currentIndex;
    let parentPosition = PriorityQueueManager._getParentIndex(currentPosition);

    while (currentPosition > 0 && elements[currentPosition] > elements[parentPosition]) {
      this._swapElements(currentPosition, parentPosition);
      currentPosition = parentPosition;
      parentPosition = PriorityQueueManager._getParentIndex(currentPosition);
    }
  }

  removeMax() {
    if (this.heapElements.length === 0) {
      return undefined;
    }
    if (this.heapElements.length === 1) {
      return this.heapElements.pop();
    }

    const maxValue = this.heapElements[0];
    this.heapElements[0] = this.heapElements.pop();
    this.heapifyDown(0);
    return maxValue;
  }

  heapifyDown(currentIndex) {
    const elements = this.heapElements;
    const heapSize = elements.length;
    let currentPosition = currentIndex;

    while (true) {
      let leftChildPosition = PriorityQueueManager._getLeftChildIndex(currentPosition);
      let rightChildPosition = PriorityQueueManager._getRightChildIndex(currentPosition);
      let largestElementPosition = currentPosition;

      if (leftChildPosition < heapSize && elements[leftChildPosition] > elements[largestElementPosition]) {
        largestElementPosition = leftChildPosition;
      }

      if (rightChildPosition < heapSize && elements[rightChildPosition] > elements[largestElementPosition]) {
        largestElementPosition = rightChildPosition;
      }

      if (largestElementPosition !== currentPosition) {
        this._swapElements(currentPosition, largestElementPosition);
        currentPosition = largestElementPosition;
      } else {
        break;
      }
    }
  }
}

(function executeHeapOperations() {
  const fileSystemModule = require('fs');
  const standardInputPath = '/dev/stdin';
  const rawFileContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');

  const allInputLines = rawFileContent.trim().split('\n');
  const relevantCommandLines = allInputLines.slice(0, -1);

  const queueManager = new PriorityQueueManager();
  let outputAccumulator = '';

  const parseInputInstruction = (instructionString) => {
    const parts = instructionString.split(' ');
    return {
      operationType: parts[0].charAt(0),
      numericValue: parts.length > 1 ? Number(parts[1]) : undefined
    };
  };

  for (const currentLine of relevantCommandLines) {
    const parsedInstruction = parseInputInstruction(currentLine);

    switch (parsedInstruction.operationType) {
      case 'i':
        queueManager.addValue(parsedInstruction.numericValue);
        break;
      case 'e':
        const extractedResult = queueManager.removeMax();
        outputAccumulator += `${extractedResult}\n`;
        break;
    }
  }
  process.stdout.write(outputAccumulator);
})();
