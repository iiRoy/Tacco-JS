"use strict";
const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
const inputTokens = rawInputData.split(/ |\n/);
let currentTokenIndex = 0;

const InputReader = {
  readNextInt: () => +inputTokens[currentTokenIndex++],
  readNextString: () => inputTokens[currentTokenIndex++],
  readNextBigInt: () => BigInt(inputTokens[currentTokenIndex++]),
  readIntArray: (count, mapToNum = true) => {
    const slice = inputTokens.slice(currentTokenIndex, currentTokenIndex + count);
    currentTokenIndex += count;
    return mapToNum ? slice.map(Number) : slice;
  },
  readMatrix: (height, width, mapToNum = true) => {
    const matrix = [];
    for (let i = 0; i < height; i++) {
      const row = inputTokens.slice(currentTokenIndex, currentTokenIndex + width);
      currentTokenIndex += width;
      matrix.push(mapToNum ? row.map(Number) : row);
    }
    return matrix;
  }
};

function createMultiDimensionalArray(initialValue) {
  var args = arguments,
    length = args.length,
    result = "Array(args[" + --length + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--length) result = "Array(args[" + length + "]).fill().map(x=>" + result + ")";
  return eval(result);
}

class MinPriorityQueue {
  constructor() {
    this.heapElements = [];
  }

  _bubbleUp(index) {
    const element = this.heapElements[index];
    while (index > 0) {
      const parentIndex = (index - 1) >> 1;
      const parent = this.heapElements[parentIndex];
      if (element[0] >= parent[0]) break;
      this.heapElements[index] = parent;
      index = parentIndex;
    }
    this.heapElements[index] = element;
  }

  _bubbleDown(index) {
    const heap = this.heapElements;
    const length = heap.length;
    const element = heap[index];
    while (true) {
      let leftChildIndex = (index << 1) + 1;
      let rightChildIndex = (index << 1) + 2;
      let swapIndex = index;
      let leftChild, rightChild;

      if (leftChildIndex < length) {
        leftChild = heap[leftChildIndex];
        if (leftChild[0] < element[0]) {
          swapIndex = leftChildIndex;
        }
      }
      if (rightChildIndex < length) {
        rightChild = heap[rightChildIndex];
        if (rightChild[0] < (swapIndex === index ? element[0] : leftChild[0])) {
          swapIndex = rightChildIndex;
        }
      }

      if (swapIndex === index) break;
      heap[index] = heap[swapIndex];
      index = swapIndex;
    }
    heap[index] = element;
  }

  push(itemValue, itemData) {
    this.heapElements.push([itemValue, itemData]);
    this._bubbleUp(this.heapElements.length - 1);
  }

  pop() {
    const heap = this.heapElements;
    const rootElement = heap[0];
    const lastElement = heap.pop();
    if (heap.length > 0) {
      heap[0] = lastElement;
      this._bubbleDown(0);
    }
    return rootElement;
  }

  get size() {
    return this.heapElements.length;
  }

  get top() {
    return this.heapElements[0];
  }
}

const resultOfMain = main();
if (resultOfMain !== undefined) console.log(resultOfMain);

function main() {
  const numTestCases = InputReader.readNextInt();
  const primeDivisors = [2n, 3n, 5n];

  // Helper to update the priority queue and memoization map
  const updateQueueAndMemo = (num, cost, minCostQueue, minCostMemo) => {
    if (!minCostMemo.has(num) || minCostMemo.get(num) > cost) {
      minCostMemo.set(num, cost);
      minCostQueue.push(cost, num);
    }
  };

  const processNumberState = (currentNumber, currentPathCost, minCostQueue, minCostMemo, initialCosts, factorCosts, primeDivisors) => {
    if (currentNumber < 5n) {
      const finalCost = currentPathCost + initialCosts[currentNumber];
      updateQueueAndMemo(0n, finalCost, minCostQueue, minCostMemo);
      return;
    }

    for (let i = 0; i < 3; i++) {
      const divisorVal = primeDivisors[i];
      const costForFactor = factorCosts[i];

      // Case 1: Division (floor)
      let nextNumberFloor = currentNumber / divisorVal;
      let remainderFloor = currentNumber % divisorVal;
      let calculatedCostA = costForFactor + initialCosts[1] * remainderFloor;
      let calculatedCostB = (currentNumber - nextNumberFloor) * initialCosts[1];
      let finalCostFloor = currentPathCost + (calculatedCostA < calculatedCostB ? calculatedCostA : calculatedCostB);
      updateQueueAndMemo(nextNumberFloor, finalCostFloor, minCostQueue, minCostMemo);

      // Case 2: Division (ceil) if there's a remainder
      if (remainderFloor > 0n) {
        let nextNumberCeil = nextNumberFloor + 1n;
        let remainderCeil = divisorVal - remainderFloor;
        calculatedCostA = costForFactor + initialCosts[1] * remainderCeil;
        calculatedCostB = (currentNumber - nextNumberCeil) * initialCosts[1];
        let finalCostCeil = currentPathCost + (calculatedCostA < calculatedCostB ? calculatedCostA : calculatedCostB);
        updateQueueAndMemo(nextNumberCeil, finalCostCeil, minCostQueue, minCostMemo);
      }
    }
  };

  for (let testCaseIdx = 0; testCaseIdx < numTestCases; testCaseIdx++) {
    const targetNumber = InputReader.readNextBigInt();
    const factorCosts = [InputReader.readNextBigInt(), InputReader.readNextBigInt(), InputReader.readNextBigInt()];
    const initialCosts = [0n, InputReader.readNextBigInt()];

    // Calculate initialCosts[2]
    let costForTwo = initialCosts[1] * 2n;
    let costForTwoAlt = initialCosts[1] + factorCosts[0];
    initialCosts[2] = costForTwo < costForTwoAlt ? costForTwo : costForTwoAlt;

    // Calculate initialCosts[3]
    let costForThree = initialCosts[2] + initialCosts[1];
    let costForThreeAlt = initialCosts[1] + factorCosts[1];
    initialCosts[3] = costForThree < costForThreeAlt ? costForThree : costForThreeAlt;

    // Calculate initialCosts[4]
    let candidateCost4_1 = initialCosts[3] + initialCosts[1];
    let candidateCost4_2 = initialCosts[2] + factorCosts[0];
    let candidateCost4_3 = initialCosts[1] + factorCosts[2];

    let minCostForFour = candidateCost4_1;
    if (candidateCost4_2 < minCostForFour) {
      minCostForFour = candidateCost4_2;
    }
    if (candidateCost4_3 < minCostForFour) {
      minCostForFour = candidateCost4_3;
    }
    initialCosts[4] = minCostForFour;

    const minCostQueue = new MinPriorityQueue();
    minCostQueue.push(0n, targetNumber);
    const minCostMemo = new Map();
    minCostMemo.set(targetNumber, 0n);

    while (true) {
      const [currentPathCost, currentNumber] = minCostQueue.pop();

      if (minCostMemo.has(currentNumber) && minCostMemo.get(currentNumber) < currentPathCost) {
        continue;
      }
      if (currentNumber === 0n) {
        console.log(currentPathCost.toString());
        break;
      }

      processNumberState(currentNumber, currentPathCost, minCostQueue, minCostMemo, initialCosts, factorCosts, primeDivisors);
    }
  }
}
