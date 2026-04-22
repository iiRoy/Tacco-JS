"use strict";

function createNestedArrays(initialValue, ...dimensions) {
  if (dimensions.length === 0) {
    return initialValue;
  }
  const currentDim = dimensions[0];
  const remainingDims = dimensions.slice(1);
  const arr = new Array(currentDim);
  for (let i = 0; i < currentDim; i++) {
    arr[i] = createNestedArrays(initialValue, ...remainingDims);
  }
  return arr;
}

class DisjointSetCollection {
  constructor(elementQuantity) {
    this.representativeInfo = new Array(elementQuantity + 1).fill(-1);
  }

  findRepresentative(element) {
    if (this.representativeInfo[element] < 0) {
      return element;
    }
    return (this.representativeInfo[element] = this.findRepresentative(
      this.representativeInfo[element]
    ));
  }

  areConnected(elementA, elementB) {
    return this.findRepresentative(elementA) === this.findRepresentative(elementB);
  }

  unifySets(elementA, elementB) {
    let repA = this.findRepresentative(elementA);
    let repB = this.findRepresentative(elementB);

    if (repA === repB) {
      return true;
    }

    if (this.representativeInfo[repB] <= this.representativeInfo[repA]) {
      this.representativeInfo[repA] += this.representativeInfo[repB];
      this.representativeInfo[repB] = repA;
    } else {
      this.representativeInfo[repB] += this.representativeInfo[repA];
      this.representativeInfo[repA] = repB;
    }
    return false;
  }

  getSetSize(element) {
    return -this.representativeInfo[this.findRepresentative(element)];
  }
}

class SimulationController {
  constructor() {
    this.movesRemaining = 0;
    this.currentLocation = 0;
    this.daysPassed = 0;
    this.lastOrderDayProcessed = -1;
    this.totalScore = 0;

    this.infinityValue = 1e9;
    this.nodeCount = 0;
    this.edgeCount = 0;
    this.shortestPathDistances = null;
    this.directEdgeWeights = null;
    this.adjacencyList = null;
    this.maxSimulationDays = 0;
    this.scoreFactor = 0;

    this.pendingDeliveries = new Set();
    this.deliveryRouteStack = [];
    this.itemArrivalHistory = null;
    this.rawInputQueue = [];
    this.inputBufferIndex = 0;

    this.dailyOutputLog = [];
  }

  getNextInputValue() {
    return +this.rawInputQueue[this.inputBufferIndex++];
  }

  constructMinimalSpanningTree(targetNodes) {
    const relevantNodes = Array.from(targetNodes).concat(0);
    const numRelevantNodes = relevantNodes.length;
    const potentialEdges = [];

    for (let i = 0; i < numRelevantNodes; i++) {
      for (let j = i + 1; j < numRelevantNodes; j++) {
        const nodeA = relevantNodes[i];
        const nodeB = relevantNodes[j];
        potentialEdges.push({
          from: nodeA,
          to: nodeB,
          weight: this.shortestPathDistances[nodeA][nodeB],
        });
      }
    }

    potentialEdges.sort((edge1, edge2) => edge1.weight - edge2.weight);

    const dsu = new DisjointSetCollection(this.nodeCount);
    const mstEdges = [];

    for (const edge of potentialEdges) {
      if (dsu.getSetSize(0) === numRelevantNodes) break;
      if (!dsu.unifySets(edge.from, edge.to)) {
        mstEdges.push([edge.from, edge.to, edge.weight]);
      }
    }
    return mstEdges;
  }

  planNextMovement() {
    if (this.pendingDeliveries.size === 0) {
      if (this.currentLocation === 0) return -2;
      return this.determineNextHop(0);
    }

    if (
      this.deliveryRouteStack.length > 0 &&
      this.currentLocation ===
        this.deliveryRouteStack[this.deliveryRouteStack.length - 1]
    ) {
      this.deliveryRouteStack.pop();
    }

    if (this.deliveryRouteStack.length === 0) {
      return this.determineNextHop(0);
    }
    return this.determineNextHop(
      this.deliveryRouteStack[this.deliveryRouteStack.length - 1]
    );
  }

  determineNextHop(destinationNode) {
    if (destinationNode === this.currentLocation) return -2;

    for (const neighbor of this.adjacencyList[this.currentLocation]) {
      if (
        this.shortestPathDistances[this.currentLocation][destinationNode] ===
        this.directEdgeWeights[this.currentLocation][neighbor] +
          this.shortestPathDistances[neighbor][destinationNode]
      ) {
        this.movesRemaining =
          this.directEdgeWeights[this.currentLocation][neighbor] - 1;
        return (this.currentLocation = neighbor);
      }
    }
    return -2;
  }

  executeDailyOperation() {
    if (this.movesRemaining > 0) {
      this.movesRemaining--;
      return this.currentLocation;
    }

    if (this.currentLocation === 0) {
      this.processNewOrders();
    } else {
      this.completeDelivery();
    }
    return this.planNextMovement();
  }

  processNewOrders() {
    this.deliveryRouteStack = [];
    while (this.lastOrderDayProcessed < this.daysPassed) {
      this.lastOrderDayProcessed++;
      const numNewOrders = this.getNextInputValue();
      for (let i = 0; i < numNewOrders; i++) {
        const itemId = this.getNextInputValue() - 1;
        const deliveryNode = this.getNextInputValue() - 1;
        this.pendingDeliveries.add(deliveryNode);
        this.itemArrivalHistory[deliveryNode].push(this.lastOrderDayProcessed);
      }
    }

    if (this.pendingDeliveries.size === 0) return;

    const treeEdges = this.constructMinimalSpanningTree(this.pendingDeliveries);
    const treeAdjacency = createNestedArrays([], this.nodeCount);
    for (const [nodeA, nodeB, weight] of treeEdges) {
      treeAdjacency[nodeA].push(nodeB);
      treeAdjacency[nodeB].push(nodeA);
    }

    this.depthFirstTraversalForPath(0, -1, treeAdjacency);
    this.deliveryRouteStack.reverse();
    this.deliveryRouteStack.pop();
  }

  depthFirstTraversalForPath(currentNode, parentNode, treeAdjacency) {
    this.deliveryRouteStack.push(currentNode);
    for (const neighbor of treeAdjacency[currentNode]) {
      if (neighbor === parentNode) continue;
      this.depthFirstTraversalForPath(neighbor, currentNode, treeAdjacency);
    }
  }

  completeDelivery() {
    this.pendingDeliveries.delete(this.currentLocation);
    while (this.itemArrivalHistory[this.currentLocation].length) {
      const arrivalDay = this.itemArrivalHistory[this.currentLocation].pop();
      const timeElapsed = this.daysPassed - arrivalDay;
      this.totalScore += this.scoreFactor - timeElapsed * timeElapsed;
    }
  }

  async initializeAndRun() {
    const rl = require("readline").createInterface(
      process.stdin,
      process.stdout
    );

    const readLineAsync = () =>
      new Promise((resolve) => rl.once("line", resolve));

    let line = await readLineAsync();
    let parts = line.split(" ");
    this.nodeCount = +parts[0];
    this.edgeCount = +parts[1];

    this.shortestPathDistances = createNestedArrays(
      this.infinityValue,
      this.nodeCount,
      this.nodeCount
    );
    this.directEdgeWeights = createNestedArrays(
      this.infinityValue,
      this.nodeCount,
      this.nodeCount
    );
    this.adjacencyList = createNestedArrays([], this.nodeCount);

    for (let i = 0; i < this.nodeCount; i++) {
      this.shortestPathDistances[i][i] = 0;
    }

    for (let i = 0; i < this.edgeCount; i++) {
      line = await readLineAsync();
      parts = line.split(" ");
      const node1 = +parts[0] - 1;
      const node2 = +parts[1] - 1;
      const weight = +parts[2];
      this.shortestPathDistances[node1][node2] = this.shortestPathDistances[
        node2
      ][node1] = this.directEdgeWeights[node1][node2] = this.directEdgeWeights[
        node2
      ][node1] = weight;
      this.adjacencyList[node1].push(node2);
      this.adjacencyList[node2].push(node1);
    }

    for (let k = 0; k < this.nodeCount; k++) {
      for (let i = 0; i < this.nodeCount; i++) {
        for (let j = 0; j < this.nodeCount; j++) {
          if (
            this.shortestPathDistances[i][k] +
              this.shortestPathDistances[k][j] <
            this.shortestPathDistances[i][j]
          ) {
            this.shortestPathDistances[i][j] =
              this.shortestPathDistances[i][k] +
              this.shortestPathDistances[k][j];
          }
        }
      }
    }

    line = await readLineAsync();

    this.maxSimulationDays = +(await readLineAsync());
    this.scoreFactor = this.maxSimulationDays * this.maxSimulationDays;

    this.itemArrivalHistory = createNestedArrays([], this.nodeCount);

    for (; this.daysPassed < this.maxSimulationDays; this.daysPassed++) {
      const currentDayInputCount = +(await readLineAsync());
      this.rawInputQueue.push(currentDayInputCount);
      for (let i = 0; i < currentDayInputCount; i++) {
        const itemDetails = (await readLineAsync()).split(" ").map((val) => +val);
        this.rawInputQueue.push(...itemDetails);
      }

      const dummyInputCount1 = +(await readLineAsync());
      for (let i = 0; i < dummyInputCount1; i++) {
        await readLineAsync();
      }

      this.dailyOutputLog[this.daysPassed] = this.executeDailyOperation() + 1;
      console.log(this.dailyOutputLog[this.daysPassed]);

      const statusLine = await readLineAsync();
      if (statusLine[0] !== "O") {
        rl.close();
        return;
      }

      const dummyInputCount2 = +(await readLineAsync());
      for (let i = 0; i < dummyInputCount2; i++) {
        await readLineAsync();
      }
    }
    rl.close();
  }
}

new SimulationController().initializeAndRun();