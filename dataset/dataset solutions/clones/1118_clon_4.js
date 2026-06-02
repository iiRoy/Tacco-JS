const getParentIndex = (idx) => Math.floor((idx - 1) / 2);
const getLeftChildIndex = (idx) => 2 * idx + 1;
const getRightChildIndex = (idx) => 2 * idx + 2;

const swapElements = (arr, i, j) => {
  [arr[i], arr[j]] = [arr[j], arr[i]];
};

class MaxHeap {
  constructor() {
    this.elements = [];
  }

  addValue(val) {
    this.elements.push(val);
    this.bubbleUp(this.elements.length - 1);
  }

  retrieveMax() {
    if (this.elements.length === 0) {
      return undefined;
    }
    if (this.elements.length === 1) {
      return this.elements.pop();
    }

    const topValue = this.elements[0];
    this.elements[0] = this.elements.pop();
    this.bubbleDown(0);
    return topValue;
  }

  bubbleUp(startingIndex) {
    let current = startingIndex;
    let parent = getParentIndex(current);

    while (current > 0 && this.elements[current] > this.elements[parent]) {
      swapElements(this.elements, current, parent);
      current = parent;
      parent = getParentIndex(current);
    }
  }

  bubbleDown(startingIndex) {
    let current = startingIndex;
    const total = this.elements.length;

    while (true) {
      let left = getLeftChildIndex(current);
      let right = getRightChildIndex(current);
      let largest = current;

      if (left < total && this.elements[left] > this.elements[largest]) {
        largest = left;
      }

      if (right < total && this.elements[right] > this.elements[largest]) {
        largest = right;
      }

      if (largest !== current) {
        swapElements(this.elements, current, largest);
        current = largest;
      } else {
        break;
      }
    }
  }
}

(function executeOperations() {
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const heapInstance = new MaxHeap();
  const outputBuffer = [];

  const commandDispatch = new Map([
    ['i', (value) => heapInstance.addValue(Number(value))],
    ['e', () => outputBuffer.push(`${heapInstance.retrieveMax()}\n`)]
  ]);

  const processedLines = inputLines.slice(0, -1);

  for (const currentLine of processedLines) {
    const lineSegments = currentLine.split(' ');
    const operationKey = lineSegments[0].charAt(0);
    const handler = commandDispatch.get(operationKey);

    if (handler) {
      handler(lineSegments[1]);
    }
  }

  process.stdout.write(outputBuffer.join(''));
})();
