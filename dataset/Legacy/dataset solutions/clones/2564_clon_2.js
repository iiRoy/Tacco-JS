const programInput = require('fs').readFileSync('/dev/stdin', 'utf8');

const inputLines = programInput.split('\n');

const firstLineParts = inputLines.shift().split(' ');
const totalElements = Number(firstLineParts[0]);
const maxOperations = Number(firstLineParts[1]);

const initialArrayOfNumbers = inputLines.shift().split(' ');

const PriorityQueue = {
  elements: [],

  isHigherPriority: (val1, val2) => val1 < val2,

  initialize(initialValues, isMaxHeap = false) {
    this.elements = [0];
    if (isMaxHeap) {
      this.isHigherPriority = (val1, val2) => val1 > val2;
    }
    for (let idx = 0; idx < initialValues.length; idx++) {
      this.insert(Number(initialValues[idx]));
    }
  },

  insert(newValue) {
    let currentIdx = this.elements.length;
    while (currentIdx > 1) {
      const parentIdx = Math.floor(currentIdx / 2);
      if (this.isHigherPriority(newValue, this.elements[parentIdx])) {
        this.elements[currentIdx] = this.elements[parentIdx];
        currentIdx = parentIdx;
      } else {
        break;
      }
    }
    this.elements[currentIdx] = newValue;
  },

  extractMax() {
    if (this.elements.length === 1) {
      return undefined;
    } else if (this.elements.length === 2) {
      return this.elements.pop();
    }

    const extractedValue = this.elements[1];
    const lastElement = this.elements.pop();
    let currentPosition = 1;
    while (true) {
      const leftChild = currentPosition * 2;
      const rightChild = currentPosition * 2 + 1;
      let nextPosition = currentPosition;

      if (leftChild < this.elements.length && this.isHigherPriority(this.elements[leftChild], lastElement)) {
        nextPosition = leftChild;
      }
      if (
        rightChild < this.elements.length &&
        this.isHigherPriority(this.elements[rightChild], lastElement) &&
        this.isHigherPriority(this.elements[rightChild], this.elements[leftChild])
      ) {
        nextPosition = rightChild;
      }
      if (nextPosition !== currentPosition) {
        this.elements[currentPosition] = this.elements[nextPosition];
        currentPosition = nextPosition;
      } else {
        break;
      }
    }
    this.elements[currentPosition] = lastElement;
    return extractedValue;
  },
};

PriorityQueue.initialize(initialArrayOfNumbers, true);

for (let operationCounter = 0; operationCounter < maxOperations; operationCounter++) {
  const currentMax = PriorityQueue.extractMax();
  PriorityQueue.insert(Math.floor(currentMax / 2));
}

let totalSum = 0;
for (let elementIndex = 1; elementIndex < PriorityQueue.elements.length; elementIndex++) {
  totalSum += PriorityQueue.elements[elementIndex];
}

console.log(totalSum);
