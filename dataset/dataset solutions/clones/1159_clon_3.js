'use strict';

class MinHeap {
  constructor(comparisonFunction) {
    this._heapData = [];
    this._comparisonFunction = comparisonFunction;
  }

  _getParentIndex(childIndex) {
    return Math.floor((childIndex - 1) / 2);
  }

  _getLeftChildIndex(parentIndex) {
    return 2 * parentIndex + 1;
  }

  _getRightChildIndex(parentIndex) {
    return 2 * parentIndex + 2;
  }

  _hasParent(index) {
    return this._getParentIndex(index) >= 0;
  }

  _hasLeftChild(index) {
    return this._getLeftChildIndex(index) < this._heapData.length;
  }

  _hasRightChild(index) {
    return this._getRightChildIndex(index) < this._heapData.length;
  }

  _performSwap(indexA, indexB) {
    [this._heapData[indexA], this._heapData[indexB]] = [this._heapData[indexB], this._heapData[indexA]];
  }

  _bubbleUpNewElement() {
    let currentPosition = this._heapData.length - 1;
    while (this._hasParent(currentPosition) && this._comparisonFunction(this._heapData[this._getParentIndex(currentPosition)], this._heapData[currentPosition]) > 0) {
      this._performSwap(currentPosition, this._getParentIndex(currentPosition));
      currentPosition = this._getParentIndex(currentPosition);
    }
  }

  _sinkDownRoot() {
    let currentPosition = 0;
    while (this._hasLeftChild(currentPosition)) {
      let smallerChildPosition = this._getLeftChildIndex(currentPosition);
      if (this._hasRightChild(currentPosition) && this._comparisonFunction(this._heapData[this._getRightChildIndex(currentPosition)], this._heapData[smallerChildPosition]) < 0) {
        smallerChildPosition = this._getRightChildIndex(currentPosition);
      }

      if (this._comparisonFunction(this._heapData[currentPosition], this._heapData[smallerChildPosition]) <= 0) {
        break;
      } else {
        this._performSwap(currentPosition, smallerChildPosition);
      }
      currentPosition = smallerChildPosition;
    }
  }

  insert(item) {
    this._heapData.push(item);
    this._bubbleUpNewElement();
  }

  extractMinimum() {
    if (this.isEmpty()) {
      return undefined;
    }
    const minimumValue = this._heapData[0];
    const lastElement = this._heapData.pop();

    if (!this.isEmpty()) {
      this._heapData[0] = lastElement;
      this._sinkDownRoot();
    }
    return minimumValue;
  }

  peekMinimum() {
    return this.isEmpty() ? undefined : this._heapData[0];
  }

  getElementCount() {
    return this._heapData.length;
  }

  isEmpty() {
    return this._heapData.length === 0;
  }
}

const MAXIMUM_VERTICES = 100000;
const POSITIVE_INFINITY_VALUE = Number.POSITIVE_INFINITY / 4;

let totalVertices, totalEdges, initialVertex;
let graphAdjacencyList;
let shortestDistances;

function createEmptyGraph(vertexCount) {
  const graph = new Array(vertexCount);
  for (let i = 0; i < vertexCount; ++i) {
    graph[i] = [];
  }
  return graph;
}

function calculateShortestPaths(sourceNode) {
  const minPriorityQueue = new MinHeap((itemA, itemB) => {
    if (itemA.dist !== itemB.dist) {
      return itemA.dist - itemB.dist;
    }
    return itemA.v - itemB.v;
  });

  shortestDistances[sourceNode] = 0;
  minPriorityQueue.insert({ dist: 0, v: sourceNode });

  while (!minPriorityQueue.isEmpty()) {
    const currentPathInfo = minPriorityQueue.extractMinimum();

    if (shortestDistances[currentPathInfo.v] < currentPathInfo.dist) {
      continue;
    }

    for (const connectedEdge of graphAdjacencyList[currentPathInfo.v]) {
      const potentialNewDistance = shortestDistances[currentPathInfo.v] + connectedEdge.cost;
      if (shortestDistances[connectedEdge.to] > potentialNewDistance) {
        shortestDistances[connectedEdge.to] = potentialNewDistance;
        minPriorityQueue.insert({ dist: potentialNewDistance, v: connectedEdge.to });
      }
    }
  }
}

function processGraphInput(rawInputData) {
  const inputLines = rawInputData.trim().split('\n');
  let isFirstLineProcessed = false;

  for (let lineIdx = 0; lineIdx < inputLines.length; ++lineIdx) {
    const numericValues = inputLines[lineIdx].split(' ').map(Number);

    if (!isFirstLineProcessed) {
      [totalVertices, totalEdges, initialVertex] = numericValues;
      graphAdjacencyList = createEmptyGraph(totalVertices);
      shortestDistances = new Array(totalVertices).fill(POSITIVE_INFINITY_VALUE);
      isFirstLineProcessed = true;
    } else {
      const [fromNode, toNode, edgeWeight] = numericValues;
      graphAdjacencyList[fromNode].push({ to: toNode, cost: edgeWeight });
    }
  }

  calculateShortestPaths(initialVertex);

  shortestDistances.forEach(distanceValue => {
    console.log(distanceValue === POSITIVE_INFINITY_VALUE ? "INF" : distanceValue);
  });
}

processGraphInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
