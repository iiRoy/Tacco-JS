"use strict";

const InputParser = {
  rawData: require("fs").readFileSync("/dev/stdin", "utf8"),
  tokenizedInput: [],
  currentTokenIndex: 0,

  initialize() {
    this.tokenizedInput = this.rawData.split(/ |\n/);
    this.currentTokenIndex = 0;
  },

  readNextToken(asString = false) {
    const token = this.tokenizedInput[this.currentTokenIndex++];
    return asString ? token : +token;
  },

  readMultipleTokens(count, asStrings = false) {
    const tokens = this.tokenizedInput.slice(this.currentTokenIndex, this.currentTokenIndex + count);
    this.currentTokenIndex += count;
    return asStrings ? tokens : tokens.map(val => +val);
  },

  readMatrixTokens(height, width, asStrings = false) {
    const resultMatrix = [];
    for (let rowIdx = 0; rowIdx < height; rowIdx++) {
      const rowTokens = this.tokenizedInput.slice(this.currentTokenIndex, this.currentTokenIndex + width);
      this.currentTokenIndex += width;
      resultMatrix.push(asStrings ? rowTokens : rowTokens.map(val => +val));
    }
    return resultMatrix;
  }
};

InputParser.initialize();

function createMultiDimArray(initialValue) {
  const args = arguments;
  let dimCount = args.length;
  let arrayCreationString = "Array(args[" + --dimCount + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--dimCount) {
    arrayCreationString = "Array(args[" + dimCount + "]).fill().map(x=>" + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

class GraphShortestPathSolver {
  constructor(nodeCount) {
    this.adjacencyList = Array(nodeCount).fill().map(() => []);
  }

  addDirectedEdge(sourceNode, targetNode, edgeCost) {
    this.adjacencyList[sourceNode].push(targetNode, edgeCost);
  }

  addUndirectedEdge(nodeA, nodeB, edgeCost) {
    this.adjacencyList[nodeA].push(nodeB, edgeCost);
    this.adjacencyList[nodeB].push(nodeA, edgeCost);
  }

  findShortestPaths(startNode) {
    const infinityValue = 1e18;
    const currentGraph = this.adjacencyList;
    const minPriorityQueue = new MinPriorityQueue();

    minPriorityQueue.push(0, startNode);

    const distances = Array(currentGraph.length).fill(infinityValue);
    distances[startNode] = 0;

    const EDGE_DATA_STRIDE = 2;

    while (minPriorityQueue.size > 0) {
      const [currentDistance, currentNode] = minPriorityQueue.pop();

      if (distances[currentNode] < currentDistance) {
        continue;
      }

      const neighborsAndCosts = currentGraph[currentNode];
      for (let i = 0; i < neighborsAndCosts.length; i += EDGE_DATA_STRIDE) {
        const neighborNode = neighborsAndCosts[i];
        const edgeWeight = neighborsAndCosts[i + 1];
        const newPathDistance = currentDistance + edgeWeight;

        if (distances[neighborNode] > newPathDistance) {
          distances[neighborNode] = newPathDistance;
          minPriorityQueue.push(newPathDistance, neighborNode);
        }
      }
    }
    return distances;
  }
}

class MinPriorityQueue {
  constructor() {
    this.heapArray = [];
    this.valueToAssociatedDataMap = new Map();
  }

  _getParentIndex(childIndex) {
    return (childIndex - 1) >> 1;
  }

  _getLeftChildIndex(parentIndex) {
    return (parentIndex << 1) + 1;
  }

  _getRightChildIndex(parentIndex) {
    return (parentIndex << 1) + 2;
  }

  push(priorityValue, associatedData) {
    const heap = this.heapArray;
    const dataMap = this.valueToAssociatedDataMap;
    let currentIndex = heap.length;
    let parentIndex;

    while (currentIndex > 0) {
      parentIndex = this._getParentIndex(currentIndex);
      if (priorityValue >= heap[parentIndex]) {
        break;
      }
      heap[currentIndex] = heap[parentIndex];
      currentIndex = parentIndex;
    }
    heap[currentIndex] = priorityValue;

    if (dataMap.has(priorityValue)) {
      dataMap.get(priorityValue).push(associatedData);
    } else {
      dataMap.set(priorityValue, [associatedData]);
    }
  }

  pop() {
    const heap = this.heapArray;
    const dataMap = this.valueToAssociatedDataMap;
    const heapLength = heap.length;

    if (heapLength === 0) {
      return undefined;
    }

    const rootPriorityValue = heap[0];
    const associatedDataForRoot = dataMap.get(rootPriorityValue).pop();

    if (dataMap.get(rootPriorityValue).length === 0) {
      dataMap.delete(rootPriorityValue);
    }

    if (heapLength === 1) {
      heap.pop();
      return [rootPriorityValue, associatedDataForRoot];
    }

    const lastElementPriority = heap.pop();
    heap[0] = lastElementPriority;

    let currentIndex = 0;
    const newHeapLength = heap.length;

    while (true) {
      const leftChildIdx = this._getLeftChildIndex(currentIndex);
      const rightChildIdx = this._getRightChildIndex(currentIndex);
      let smallestChildIdx = currentIndex;

      if (leftChildIdx < newHeapLength && heap[leftChildIdx] < heap[smallestChildIdx]) {
        smallestChildIdx = leftChildIdx;
      }
      if (rightChildIdx < newHeapLength && heap[rightChildIdx] < heap[smallestChildIdx]) {
        smallestChildIdx = rightChildIdx;
      }

      if (smallestChildIdx === currentIndex) {
        break;
      }

      [heap[currentIndex], heap[smallestChildIdx]] = [heap[smallestChildIdx], heap[currentIndex]];
      currentIndex = smallestChildIdx;
    }

    return [rootPriorityValue, associatedDataForRoot];
  }

  get size() {
    return this.heapArray.length;
  }

  get top() {
    return this.heapArray[0];
  }
}

const MAX_SILVER_CAPACITY = 2500;

const solutionResult = executeSolution();
if (solutionResult !== undefined) {
  console.log(solutionResult);
}

function executeSolution() {
  const [numCities, numRoads, initialSilver] = InputParser.readMultipleTokens(3);

  const graphNodeCount = numCities * MAX_SILVER_CAPACITY;
  const shortestPathGraph = new GraphShortestPathSolver(graphNodeCount);

  for (let i = 0; i < numRoads; i++) {
    const [cityU, cityV, silverCost, timeCost] = InputParser.readMultipleTokens(4);
    const adjustedCityU = cityU - 1;
    const adjustedCityV = cityV - 1;

    const baseNodeU = adjustedCityU * MAX_SILVER_CAPACITY;
    const baseNodeV = adjustedCityV * MAX_SILVER_CAPACITY;

    for (let currentSilver = MAX_SILVER_CAPACITY - 1; currentSilver >= silverCost; --currentSilver) {
      const sourceNodeU = baseNodeU + currentSilver;
      const targetNodeV = baseNodeV + (currentSilver - silverCost);
      shortestPathGraph.addUndirectedEdge(sourceNodeU, targetNodeV, timeCost);
    }
  }

  for (let i = 0; i < numCities; i++) {
    const [exchangeRate, exchangeTime] = InputParser.readMultipleTokens(2);
    const currentCityBaseNode = i * MAX_SILVER_CAPACITY;

    for (let currentSilver = 0; currentSilver < MAX_SILVER_CAPACITY - 1; ++currentSilver) {
      const sourceNode = currentCityBaseNode + currentSilver;
      const targetSilverAfterExchange = Math.min(MAX_SILVER_CAPACITY - 1, currentSilver + exchangeRate);
      const targetNode = currentCityBaseNode + targetSilverAfterExchange;
      shortestPathGraph.addDirectedEdge(sourceNode, targetNode, exchangeTime);
    }
  }

  const startNodeSilver = Math.min(MAX_SILVER_CAPACITY - 1, initialSilver);
  const startGraphNode = 0 * MAX_SILVER_CAPACITY + startNodeSilver;

  const allDistances = shortestPathGraph.findShortestPaths(startGraphNode);

  const minTimesPerCity = createMultiDimArray(1e18, numCities);

  for (let cityIndex = 1; cityIndex < numCities; cityIndex++) {
    const cityBaseNode = cityIndex * MAX_SILVER_CAPACITY;
    let minTimeForCurrentCity = 1e18;

    for (let silverAmount = 0; silverAmount < MAX_SILVER_CAPACITY; silverAmount++) {
      const correspondingGraphNode = cityBaseNode + silverAmount;
      minTimeForCurrentCity = Math.min(minTimeForCurrentCity, allDistances[correspondingGraphNode]);
    }
    minTimesPerCity[cityIndex] = minTimeForCurrentCity;
  }

  return minTimesPerCity.slice(1).join("\n");
}
