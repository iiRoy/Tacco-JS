function parseInitialParameters(inputLine) {
  const parts = inputLine.split(" ").map(value => +value);
  return {
    nodeCount: parts[0],
    edgeCount: parts[1],
    startNodeForQ: parts[2] - 1,
    startNodeForT: parts[3] - 1
  };
}

function parseEdgeDetails(allLines, numberOfEdges) {
  const sourceNodes = [];
  const destinationNodes = [];
  const weightsForA = [];
  const weightsForB = [];

  for (let i = 0; i < numberOfEdges; i++) {
    const edgeLine = allLines[i + 1];
    const edgeValues = edgeLine.split(" ").map(value => +value);
    sourceNodes.push(edgeValues[0] - 1);
    destinationNodes.push(edgeValues[1] - 1);
    weightsForA.push(edgeValues[2]);
    weightsForB.push(edgeValues[3]);
  }
  return { sourceNodes, destinationNodes, weightsForA, weightsForB };
}

function processGraphInput(inputString) {
  const allInputLines = inputString.split("\n");

  const { nodeCount, edgeCount, startNodeForQ, startNodeForT } = parseInitialParameters(allInputLines[0]);
  const { sourceNodes, destinationNodes, weightsForA, weightsForB } = parseEdgeDetails(allInputLines, edgeCount);

  const distancesFromStartQ = calculateShortestPaths(sourceNodes, destinationNodes, weightsForA, startNodeForQ, nodeCount);
  const distancesFromStartT = calculateShortestPaths(sourceNodes, destinationNodes, weightsForB, startNodeForT, nodeCount);

  const finalResultValues = new Array(nodeCount);
  const fixedLargeConstant = 1e15;

  let currentIndex = nodeCount - 1;
  finalResultValues[currentIndex] = fixedLargeConstant - distancesFromStartQ[currentIndex] - distancesFromStartT[currentIndex];

  for (let i = nodeCount - 2; i >= 0; i--) {
    const currentSum = fixedLargeConstant - distancesFromStartQ[i] - distancesFromStartT[i];
    finalResultValues[i] = Math.max(finalResultValues[i + 1], currentSum);
  }
  console.log(finalResultValues.join("\n"));
}

function calculateShortestPaths(sources, destinations, edgeWeights, initialNode, graphSize) {
  const adjacencyMap = Array(graphSize).fill(null).map(() => []);

  for (let edgeIndex = 0; edgeIndex < sources.length; edgeIndex++) {
    const u = sources[edgeIndex];
    const v = destinations[edgeIndex];
    const weight = edgeWeights[edgeIndex];
    adjacencyMap[u][v] = weight;
    adjacencyMap[v][u] = weight;
  }

  const shortestDistances = Array(graphSize).fill(9e99);
  shortestDistances[initialNode] = 0;
  const visitedStatus = Array(graphSize).fill(false);

  const minPriorityQueue = new GraphMinPriorityQueue();
  minPriorityQueue.enqueue([initialNode, 0]);

  while (minPriorityQueue.size()) {
    const currentNodeIndex = minPriorityQueue.dequeue();

    if (visitedStatus[currentNodeIndex]) {
      continue;
    }
    visitedStatus[currentNodeIndex] = true;

    const neighborsOfCurrent = adjacencyMap[currentNodeIndex];
    for (let neighborKey in neighborsOfCurrent) {
      if (!Object.prototype.hasOwnProperty.call(neighborsOfCurrent, neighborKey)) {
        continue;
      }
      const neighborIndex = parseInt(neighborKey, 10);

      const weightToNeighbor = neighborsOfCurrent[neighborIndex];
      const potentialNewDistance = shortestDistances[currentNodeIndex] + weightToNeighbor;

      if (shortestDistances[neighborIndex] > potentialNewDistance) {
        shortestDistances[neighborIndex] = potentialNewDistance;
        minPriorityQueue.enqueue([neighborIndex, potentialNewDistance]);
      }
    }
  }
  return shortestDistances;
}

class GraphMinPriorityQueue {
  constructor() {
    this._heapArray = [];
    this._currentHeapSize = 0;
  }

  _getParentIndex(childIdx) {
    return Math.floor((childIdx - 1) / 2);
  }

  _getLeftChildIndex(parentIdx) {
    return parentIdx * 2 + 1;
  }

  _getRightChildIndex(parentIdx) {
    return parentIdx * 2 + 2;
  }

  enqueue(itemToInsert) {
    let currentPosition = this._currentHeapSize++;
    while (currentPosition > 0) {
      const parentPosition = this._getParentIndex(currentPosition);
      if (this._heapArray[parentPosition][1] <= itemToInsert[1]) {
        break;
      }
      this._heapArray[currentPosition] = this._heapArray[parentPosition];
      currentPosition = parentPosition;
    }
    this._heapArray[currentPosition] = itemToInsert;
  }

  dequeue() {
    if (this._currentHeapSize === 0) {
      return undefined;
    }
    const extractedRoot = this._heapArray[0];
    const lastElement = this._heapArray[--this._currentHeapSize];
    let currentPosition = 0;

    while (this._getLeftChildIndex(currentPosition) < this._currentHeapSize) {
      const leftChild = this._getLeftChildIndex(currentPosition);
      const rightChild = this._getRightChildIndex(currentPosition);
      let smallestChild = leftChild;

      if (rightChild < this._currentHeapSize && this._heapArray[rightChild][1] < this._heapArray[leftChild][1]) {
        smallestChild = rightChild;
      }

      if (this._heapArray[smallestChild][1] >= lastElement[1]) {
        break;
      }
      this._heapArray[currentPosition] = this._heapArray[smallestChild];
      currentPosition = smallestChild;
    }
    this._heapArray[currentPosition] = lastElement;
    this._heapArray.pop();

    return extractedRoot[0];
  }

  size() {
    return this._heapArray.length;
  }
}

processGraphInput(require("fs").readFileSync("/dev/stdin", "utf8"));
