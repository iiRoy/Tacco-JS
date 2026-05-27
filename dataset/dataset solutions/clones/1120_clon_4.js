class MaxHeapManager {
  constructor() {
    this.heapElements = [];
  }

  _swapElements(idxA, idxB) {
    const tempValue = this.heapElements[idxA];
    this.heapElements[idxA] = this.heapElements[idxB];
    this.heapElements[idxB] = tempValue;
  }

  _getParentIndex(childPosition) {
    return Math.floor((childPosition - 1) / 2);
  }

  _getLeftChildIndex(parentPosition) {
    return 2 * parentPosition + 1;
  }

  _getRightChildIndex(parentPosition) {
    return 2 * parentPosition + 2;
  }

  addValue(newValue) {
    this.heapElements.push(newValue);
    this._bubbleUp(this.heapElements.length - 1);
  }

  _bubbleUp(currentPosition) {
    let childPosition = currentPosition;
    let parentPosition = this._getParentIndex(childPosition);

    while (childPosition > 0 && this.heapElements[childPosition] > this.heapElements[parentPosition]) {
      this._swapElements(childPosition, parentPosition);
      childPosition = parentPosition;
      parentPosition = this._getParentIndex(childPosition);
    }
  }

  retrieveMax() {
    if (this.heapElements.length === 0) {
      return undefined;
    }
    if (this.heapElements.length === 1) {
      return this.heapElements.pop();
    }

    const topValue = this.heapElements[0];
    this.heapElements[0] = this.heapElements.pop();
    this._sinkDown(0);
    return topValue;
  }

  _sinkDown(currentPosition) {
    let parentPosition = currentPosition;
    const totalCount = this.heapElements.length;

    while (true) {
      let leftChildPos = this._getLeftChildIndex(parentPosition);
      let rightChildPos = this._getRightChildIndex(parentPosition);
      let largestChildPos = parentPosition;

      if (leftChildPos < totalCount && this.heapElements[leftChildPos] > this.heapElements[largestChildPos]) {
        largestChildPos = leftChildPos;
      }

      if (rightChildPos < totalCount && this.heapElements[rightChildPos] > this.heapElements[largestChildPos]) {
        largestChildPos = rightChildPos;
      }

      if (largestChildPos === parentPosition) {
        break;
      }

      this._swapElements(parentPosition, largestChildPos);
      parentPosition = largestChildPos;
    }
  }
}

(function processInputCommands() {
  const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
  const commandLines = rawInput.trim().split('\n').filter(Boolean);

  const heapInstance = new MaxHeapManager();
  const outputSegments = [];

  const commandHandlers = {
    'i': (lineContent) => {
      const valueToInsert = Number(lineContent.split(' ')[1]);
      heapInstance.addValue(valueToInsert);
    },
    'e': () => {
      const extractedValue = heapInstance.retrieveMax();
      if (extractedValue !== undefined) {
        outputSegments.push(extractedValue);
      }
    }
  };

  commandLines.forEach(currentLine => {
    const commandType = currentLine.charAt(0);
    const handler = commandHandlers[commandType];
    if (handler) {
      handler(currentLine);
    }
  });

  process.stdout.write(outputSegments.join('\n') + '\n');
})();
