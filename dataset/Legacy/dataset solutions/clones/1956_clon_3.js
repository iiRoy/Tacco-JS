"use strict";

var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenStream = rawData.split(/ |\n/);
var tokenIndex = 0;

function readNextToken(asString) {
  const currentToken = tokenStream[tokenIndex++];
  return asString ? currentToken : +currentToken;
}

function readMultipleTokens(count, asString) {
  const tokens = [];
  for (let i = 0; i < count; i++) {
    tokens.push(readNextToken(asString));
  }
  return tokens;
}

function readMatrix(height, width, asString) {
  const matrix = [];
  for (let i = 0; i < height; i++) {
    matrix.push(readMultipleTokens(width, asString));
  }
  return matrix;
}

function createMultiDimArray(initialValueFactory, ...dimensions) {
  if (dimensions.length === 0) {
    return typeof initialValueFactory === 'function' ? initialValueFactory() : initialValueFactory;
  }

  const currentDimSize = dimensions[0];
  const remainingDims = dimensions.slice(1);
  const arr = new Array(currentDimSize);

  for (let i = 0; i < currentDimSize; i++) {
    arr[i] = createMultiDimArray(initialValueFactory, ...remainingDims);
  }
  return arr;
}

var minPriorityQueueFactory = (function() {
  function factory() {
    return new MinPriorityQueue();
  }

  function MinPriorityQueue() {
    this.dataHeap = [];
    this.size = 0;
  }

  function getParentIndex(childIndex) {
    return (childIndex - 1) >> 1;
  }

  function getLeftChildIndex(parentIndex) {
    return (parentIndex << 1) + 1;
  }

  function getRightChildIndex(parentIndex) {
    return (parentIndex << 1) + 2;
  }

  MinPriorityQueue.prototype.insertElement = function(element) {
    const heap = this.dataHeap;
    let currentIndex = this.size++;
    heap[currentIndex] = element;

    while (currentIndex > 0) {
      const parentIdx = getParentIndex(currentIndex);
      if (heap[parentIdx][0] <= heap[currentIndex][0]) {
        break;
      }
      [heap[currentIndex], heap[parentIdx]] = [heap[parentIdx], heap[currentIndex]];
      currentIndex = parentIdx;
    }
  };

  MinPriorityQueue.prototype.extractMin = function() {
    const heap = this.dataHeap;
    if (this.size === 0) return undefined;

    const minElement = heap[0];
    this.size--;
    const lastElement = heap.pop();

    if (this.size === 0) {
      return minElement;
    }

    heap[0] = lastElement;
    let currentIndex = 0;
    const lastIndex = this.size - 1;

    while (true) {
      const leftChildIdx = getLeftChildIndex(currentIndex);
      const rightChildIdx = getRightChildIndex(currentIndex);
      let smallestChildIdx = currentIndex;

      if (leftChildIdx <= lastIndex && heap[leftChildIdx][0] < heap[smallestChildIdx][0]) {
        smallestChildIdx = leftChildIdx;
      }
      if (rightChildIdx <= lastIndex && heap[rightChildIdx][0] < heap[smallestChildIdx][0]) {
        smallestChildIdx = rightChildIdx;
      }

      if (smallestChildIdx === currentIndex) {
        break;
      }

      [heap[currentIndex], heap[smallestChildIdx]] = [heap[smallestChildIdx], heap[currentIndex]];
      currentIndex = smallestChildIdx;
    }
    return minElement;
  };
  return factory;
})();

var programOutput = solveProblem();
if (programOutput !== undefined) {
  console.log(programOutput);
}

function solveProblem() {
  const MAX_SILVER_CAP = 2500;
  const INFINITY = 1e18;

  const [numNodes, numEdges, initialSilver] = readMultipleTokens(3);

  const adjList = createMultiDimArray(() => [], numNodes);

  for (let i = 0; i < numEdges; i++) {
    let [nodeA, nodeB, silverCost, timeCost] = readMultipleTokens(4);
    nodeA--;
    nodeB--;
    adjList[nodeA].push([nodeB, silverCost, timeCost]);
    adjList[nodeB].push([nodeA, silverCost, timeCost]);
  }

  const silverExchangeData = readMatrix(numNodes, 2);

  const minTimeMap = createMultiDimArray(INFINITY, numNodes, MAX_SILVER_CAP + 1);
  const minTimeResults = createMultiDimArray(INFINITY, numNodes);

  const priorityQ = minPriorityQueueFactory();

  const clampedInitialSilver = Math.min(initialSilver, MAX_SILVER_CAP);

  priorityQ.insertElement([0, 0, clampedInitialSilver]);
  minTimeMap[0][clampedInitialSilver] = 0;

  let remainingNodesToVisit = numNodes;

  while (remainingNodesToVisit > 0) {
    const [currentTime, currentNode, currentSilver] = priorityQ.extractMin();

    if (minTimeMap[currentNode][currentSilver] < currentTime) {
      continue;
    }

    if (minTimeResults[currentNode] === INFINITY) {
      remainingNodesToVisit--;
      minTimeResults[currentNode] = currentTime;
    }

    if (currentSilver < MAX_SILVER_CAP) {
      const silverGain = silverExchangeData[currentNode][0];
      const exchangeTimeCost = silverExchangeData[currentNode][1];

      const newTimeAfterExchange = currentTime + exchangeTimeCost;
      const newSilverAfterExchange = Math.min(currentSilver + silverGain, MAX_SILVER_CAP);

      if (minTimeMap[currentNode][newSilverAfterExchange] > newTimeAfterExchange) {
        minTimeMap[currentNode][newSilverAfterExchange] = newTimeAfterExchange;
        priorityQ.insertElement([newTimeAfterExchange, currentNode, newSilverAfterExchange]);
      }
    }

    for (let i = 0; i < adjList[currentNode].length; i++) {
      const [neighborNode, edgeSilverCost, edgeTimeCost] = adjList[currentNode][i];

      const silverAfterTravel = currentSilver - edgeSilverCost;

      if (silverAfterTravel < 0) {
        continue;
      }

      const newTimeAfterTravel = currentTime + edgeTimeCost;

      if (minTimeMap[neighborNode][silverAfterTravel] > newTimeAfterTravel) {
        minTimeMap[neighborNode][silverAfterTravel] = newTimeAfterTravel;
        priorityQ.insertElement([newTimeAfterTravel, neighborNode, silverAfterTravel]);
      }
    }
  }

  return minTimeResults.slice(1).join("\n");
}
