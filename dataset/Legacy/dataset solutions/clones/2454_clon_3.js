"use strict";

const createMultiDimArray = (valueExpression, ...dimensions) => {
  const argCount = dimensions.length;
  let arrayCreationString = `Array(dimensions[${argCount - 1}]).fill(0).map(x => { return ${valueExpression}; })`;
  for (let i = argCount - 2; i >= 0; --i) {
    arrayCreationString = `Array(dimensions[${i}]).fill(0).map(x => ${arrayCreationString})`;
  }
  return eval(arrayCreationString);
};

class DisjointSet {
  constructor(size) {
    this.parent = Array(size + 1).fill(-1);
  }

  findRoot(i) {
    if (this.parent[i] < 0) return i;
    return this.parent[i] = this.findRoot(this.parent[i]);
  }

  areConnected(x, y) {
    return this.findRoot(x) === this.findRoot(y);
  }

  unionSets(x, y) {
    let rootX = this.findRoot(x);
    let rootY = this.findRoot(y);
    if (rootX === rootY) return false; // Already united

    // Union by size/rank
    if (this.parent[rootY] < this.parent[rootX]) { // rootY has larger (more negative) size
      this.parent[rootY] += this.parent[rootX];
      this.parent[rootX] = rootY;
    } else {
      this.parent[rootX] += this.parent[rootY];
      this.parent[rootY] = rootX;
    }
    return true; // Successfully united
  }

  getComponentSize(i) {
    return -this.parent[this.findRoot(i)];
  }
}

const INFINITY_VAL = 1e9;

let simulationState = {
  remainingPathLength: 0,
  currentVertex: 0,
  currentDay: 0,
  lastTakeDay: -1,
  totalScore: 0,
  maxDays: 0,
  maxDaysSquared: 0,
};

let graphData = {
  numVertices: 0,
  numEdges: 0,
  shortestPathDistances: [],
  directEdgeDistances: [],
  adjList: [],
};

let deliveryManagement = {
  itemsToDeliver: new Set(),
  deliveryPath: [],
  itemOrderTimes: [],
};

let inputOutputBuffer = {
  inputBuffer: [],
  inputBufferIndex: 0,
  dailyOutput: [],
};

inputOutputBuffer.readNextInput = function() {
  return +this.inputBuffer[this.inputBufferIndex++];
};

function kruskalAlgorithm(targetVertices) {
  const allVerticesInSet = Array.from(targetVertices).concat(0);
  const vertexCountInSet = allVerticesInSet.length;
  const possibleEdges = [];

  for (let i = 0; i < vertexCountInSet; i++) {
    for (let j = i + 1; j < vertexCountInSet; j++) {
      const v1 = allVerticesInSet[i];
      const v2 = allVerticesInSet[j];
      possibleEdges.push([v1, v2, graphData.shortestPathDistances[v1][v2]]);
    }
  }

  possibleEdges.sort((a, b) => a[2] - b[2]);

  const disjointSetInstance = new DisjointSet(graphData.numVertices);
  const mstEdges = [];

  for (let i = 0; disjointSetInstance.getComponentSize(0) !== vertexCountInSet; i++) {
    const currentEdge = possibleEdges[i];
    if (disjointSetInstance.unionSets(currentEdge[0], currentEdge[1])) {
      mstEdges.push(currentEdge);
    }
  }
  return mstEdges;
}

function findNextStepOnPath(targetVertex) {
  if (targetVertex === simulationState.currentVertex) return -2;

  for (const neighbor of graphData.adjList[simulationState.currentVertex]) {
    const pathFromCurrentToTarget = graphData.shortestPathDistances[simulationState.currentVertex][targetVertex];
    const directEdgeToNeighbor = graphData.directEdgeDistances[simulationState.currentVertex][neighbor];
    const pathFromNeighborToTarget = graphData.shortestPathDistances[neighbor][targetVertex];

    if (pathFromCurrentToTarget === directEdgeToNeighbor + pathFromNeighborToTarget) {
      simulationState.remainingPathLength = directEdgeToNeighbor - 1;
      simulationState.currentVertex = neighbor;
      return simulationState.currentVertex;
    }
  }
  return -2;
}

function determineNextMove() {
  if (deliveryManagement.itemsToDeliver.size === 0) {
    if (simulationState.currentVertex === 0) return -2;
    return findNextStepOnPath(0);
  }

  const lastVertexInPath = deliveryManagement.deliveryPath[deliveryManagement.deliveryPath.length - 1];
  if (simulationState.currentVertex === lastVertexInPath) {
    deliveryManagement.deliveryPath.pop();
  }

  if (deliveryManagement.deliveryPath.length === 0) return findNextStepOnPath(0);
  return findNextStepOnPath(deliveryManagement.deliveryPath[deliveryManagement.deliveryPath.length - 1]);
}

function dfsTraversal(currentDfsVertex, parentDfsVertex, mstAdjList) {
  deliveryManagement.deliveryPath.push(currentDfsVertex);
  for (const neighborDfs of mstAdjList[currentDfsVertex]) {
    if (neighborDfs === parentDfsVertex) continue;
    dfsTraversal(neighborDfs, currentDfsVertex, mstAdjList);
  }
}

function processIncomingOrders() {
  while (simulationState.lastTakeDay < simulationState.currentDay) {
    simulationState.lastTakeDay++;
    const numItemsToday = inputOutputBuffer.readNextInput();
    for (let i = 0; i < numItemsToday; i++) {
      const itemId = inputOutputBuffer.readNextInput() - 1; // Original 'id' is read but unused
      const destinationVertex = inputOutputBuffer.readNextInput() - 1;
      deliveryManagement.itemsToDeliver.add(destinationVertex);
      deliveryManagement.itemOrderTimes[destinationVertex].push(simulationState.lastTakeDay);
    }
  }
}

function buildAndTraverseMST() {
  if (deliveryManagement.itemsToDeliver.size === 0) return;

  const mstEdges = kruskalAlgorithm(deliveryManagement.itemsToDeliver);
  const mstAdjList = createMultiDimArray("[]", graphData.numVertices);

  for (const edge of mstEdges) {
    const vertexA = edge[0];
    const vertexB = edge[1];
    mstAdjList[vertexA].push(vertexB);
    mstAdjList[vertexB].push(vertexA);
  }

  deliveryManagement.deliveryPath = [];
  dfsTraversal(0, -1, mstAdjList);
  deliveryManagement.deliveryPath.reverse();
  deliveryManagement.deliveryPath.pop(); // Remove the starting vertex 0
}

function handleTakeAction() {
  processIncomingOrders();
  buildAndTraverseMST();
}

function handleGiveAction() {
  deliveryManagement.itemsToDeliver.delete(simulationState.currentVertex);
  while (deliveryManagement.itemOrderTimes[simulationState.currentVertex].length > 0) {
    const orderDay = deliveryManagement.itemOrderTimes[simulationState.currentVertex].pop();
    const timeTaken = simulationState.currentDay - orderDay;
    simulationState.totalScore += simulationState.maxDaysSquared - timeTaken * timeTaken;
  }
}

function executeDailyAction() {
  if (simulationState.remainingPathLength > 0) {
    simulationState.remainingPathLength--;
    return simulationState.currentVertex;
  }

  if (simulationState.currentVertex === 0) {
    handleTakeAction();
  } else {
    handleGiveAction();
  }
  return determineNextMove();
}

const readlineInterface = require("readline").createInterface(process.stdin, process.stdout);

const mainGenerator = (function*() {
  const getLine = () => new Promise(resolve => readlineInterface.once("line", resolve));

  const parseNumbersFromLine = (line) => line.split(" ").map(Number);

  // --- Initialization Phase ---
  let firstLineParts = parseNumbersFromLine(yield getLine());
  graphData.numEdges = firstLineParts[1];
  graphData.numVertices = firstLineParts[0];

  graphData.shortestPathDistances = createMultiDimArray(INFINITY_VAL, graphData.numVertices, graphData.numVertices);
  graphData.directEdgeDistances = createMultiDimArray(INFINITY_VAL, graphData.numVertices, graphData.numVertices);
  graphData.adjList = createMultiDimArray("[]", graphData.numVertices);

  for (let i = 0; i < graphData.numVertices; i++) {
    graphData.shortestPathDistances[i][i] = 0;
  }

  for (let i = 0; i < graphData.numEdges; i++) {
    const edgeDetails = parseNumbersFromLine(yield getLine());
    const vertexA = edgeDetails[0] - 1;
    const vertexB = edgeDetails[1] - 1;
    const distanceVal = edgeDetails[2];

    graphData.shortestPathDistances[vertexA][vertexB] = graphData.shortestPathDistances[vertexB][vertexA] = distanceVal;
    graphData.directEdgeDistances[vertexA][vertexB] = graphData.directEdgeDistances[vertexB][vertexA] = distanceVal;
    graphData.adjList[vertexA].push(vertexB);
    graphData.adjList[vertexB].push(vertexA);
  }

  // Floyd-Warshall algorithm for all-pairs shortest paths
  for (let intermediateNode = 0; intermediateNode < graphData.numVertices; intermediateNode++) {
    for (let startNode = 0; startNode < graphData.numVertices; startNode++) {
      for (let endNode = 0; endNode < graphData.numVertices; endNode++) {
        const pathThroughIntermediate = graphData.shortestPathDistances[startNode][intermediateNode] + graphData.shortestPathDistances[intermediateNode][endNode];
        if (pathThroughIntermediate < graphData.shortestPathDistances[startNode][endNode]) {
          graphData.shortestPathDistances[startNode][endNode] = pathThroughIntermediate;
        }
      }
    }
  }

  const initialInputF = parseNumbersFromLine(yield getLine()); // Original 'f' is read but unused
  simulationState.maxDays = +(yield getLine());
  simulationState.maxDaysSquared = simulationState.maxDays * simulationState.maxDays;
  deliveryManagement.itemOrderTimes = createMultiDimArray("[]", graphData.numVertices);

  // --- Simulation Loop Phase ---
  for (; simulationState.currentDay < simulationState.maxDays; simulationState.currentDay++) {
    let tempValue = +(yield getLine()); // Number of new items
    inputOutputBuffer.inputBuffer.push(tempValue);
    for (let i = 0; i < tempValue; i++) {
      const itemDetails = parseNumbersFromLine(yield getLine());
      inputOutputBuffer.inputBuffer.push(itemDetails[0], itemDetails[1]);
    }

    tempValue = +(yield getLine()); // Number of dummy lines
    for (let i = 0; i < tempValue; i++) {
      yield getLine(); // Consume dummy lines
    }

    inputOutputBuffer.dailyOutput[simulationState.currentDay] = executeDailyAction() + 1;
    console.log(inputOutputBuffer.dailyOutput[simulationState.currentDay]);

    let statusLine = yield getLine();
    if (statusLine[0] !== "O") return; // Check for termination condition

    tempValue = +(yield getLine()); // Number of dummy lines
    for (let i = 0; i < tempValue; i++) {
      yield getLine(); // Consume dummy lines
    }
  }
})();

mainGenerator.next();
