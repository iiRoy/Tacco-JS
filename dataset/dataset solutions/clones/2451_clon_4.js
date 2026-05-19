"use strict";
var input = require("fs").readFileSync("/dev/stdin", "utf8");
var cin = input.split(/ |\n/),
  cx = 0;

function readNum() {
  return +cin[cx++];
}

function readStr() {
  return cin[cx++];
}

function createMultiDimArray(initialValue, ...dimensions) {
  const buildRecursive = (dims, currentDimIndex) => {
    if (currentDimIndex === dims.length - 1) {
      return Array(dims[currentDimIndex]).fill(0).map(() => {
        if (initialValue === "new Set()") return new Set();
        if (initialValue === "[]") return [];
        return initialValue;
      });
    } else {
      return Array(dims[currentDimIndex]).fill(0).map(() => buildRecursive(dims, currentDimIndex + 1));
    }
  };
  return buildRecursive(dimensions, 0);
}

const INFINITY_VAL = 1e9;

class DeliverySimulation {
  constructor() {
    this.vertexCount = readNum();
    this.edgeCount = readNum();

    this.distanceMatrix = createMultiDimArray(INFINITY_VAL, this.vertexCount, this.vertexCount);
    this.adjacencyLists = createMultiDimArray("new Set()", this.vertexCount);

    this.maxTime = readNum();
    this.maxTimeSquared = this.maxTime * this.maxTime;

    this.dailyMoves = Array(this.maxTime);
    this.activeDeliveries = new Set();
    this.deliveryTimestamps = createMultiDimArray("[]", this.vertexCount);

    this.travelRemaining = 0;
    this.currentPosition = 0;
    this.currentDay = 0;
    this.lastOrderDayProcessed = -1;
    this.totalScore = 0;
  }

  initializeGraph() {
    Array.from({
      length: this.vertexCount
    }).forEach((_, i) => {
      this.distanceMatrix[i][i] = 0;
    });

    Array.from({
      length: this.edgeCount
    }).forEach(() => {
      const nodeA = readNum() - 1;
      const nodeB = readNum() - 1;
      const weight = readNum();
      this.distanceMatrix[nodeA][nodeB] = this.distanceMatrix[nodeB][nodeA] = weight;
      this.adjacencyLists[nodeA].add(nodeB);
      this.adjacencyLists[nodeB].add(nodeA);
    });
  }

  computeAllPairsShortestPaths() {
    Array.from({
      length: this.vertexCount
    }).forEach((_, k) => {
      Array.from({
        length: this.vertexCount
      }).forEach((_, i) => {
        Array.from({
          length: this.vertexCount
        }).forEach((_, j) => {
          const pathThroughK = this.distanceMatrix[i][k] + this.distanceMatrix[k][j];
          if (pathThroughK < this.distanceMatrix[i][j]) {
            this.distanceMatrix[i][j] = pathThroughK;
          }
        });
      });
    });
  }

  findNextHop(originNode, targetNode) {
    if (this.adjacencyLists[originNode].has(targetNode)) {
      this.travelRemaining = this.distanceMatrix[originNode][targetNode] - 1;
      this.currentPosition = targetNode;
      return targetNode;
    }

    const nextStepCandidate = Array.from(this.adjacencyLists[originNode]).find(neighbor =>
      this.distanceMatrix[originNode][targetNode] === this.distanceMatrix[originNode][neighbor] + this.distanceMatrix[neighbor][targetNode]
    );

    if (nextStepCandidate !== undefined) {
      this.travelRemaining = this.distanceMatrix[originNode][nextStepCandidate] - 1;
      this.currentPosition = nextStepCandidate;
      return nextStepCandidate;
    }
    return -2;
  }

  determineNextMove() {
    if (this.activeDeliveries.size === 0) {
      return (this.currentPosition === 0) ? -2 : this.findNextHop(this.currentPosition, 0);
    }

    let optimalTargetId = -1;
    let maxPendingOrders = 0;

    Array.from(this.activeDeliveries).forEach(deliveryNode => {
      if (this.distanceMatrix[this.currentPosition][deliveryNode] <= this.maxTime - this.currentDay) {
        const currentOrders = this.deliveryTimestamps[deliveryNode].length;
        if (currentOrders > maxPendingOrders) {
          maxPendingOrders = currentOrders;
          optimalTargetId = deliveryNode;
        }
      }
    });

    if (optimalTargetId === -1) {
      return (this.currentPosition === 0) ? -2 : this.findNextHop(this.currentPosition, 0);
    }
    return this.findNextHop(this.currentPosition, optimalTargetId);
  }

  handleNewOrders() {
    while (this.lastOrderDayProcessed < this.currentDay) {
      this.lastOrderDayProcessed++;
      const numIncomingOrders = readNum();
      Array.from({
        length: numIncomingOrders
      }).forEach(() => {
        readNum(); // Item ID, not used in logic
        const destinationId = readNum() - 1;
        this.activeDeliveries.add(destinationId);
        this.deliveryTimestamps[destinationId].push(this.lastOrderDayProcessed);
      });
    }
  }

  completeDelivery() {
    this.activeDeliveries.delete(this.currentPosition);
    while (this.deliveryTimestamps[this.currentPosition].length > 0) {
      const orderStartTime = this.deliveryTimestamps[this.currentPosition].pop();
      const timeTaken = this.currentDay - orderStartTime;
      this.totalScore += this.maxTimeSquared - timeTaken * timeTaken;
    }
  }

  processTurn() {
    if (this.travelRemaining > 0) {
      this.travelRemaining--;
      return this.currentPosition;
    }

    if (this.currentPosition === 0) {
      this.handleNewOrders();
    } else {
      this.completeDelivery();
    }
    return this.determineNextMove();
  }

  runSimulation() {
    this.initializeGraph();
    this.computeAllPairsShortestPaths();

    while (this.currentDay < this.maxTime) {
      this.dailyMoves[this.currentDay] = this.processTurn() + 1;
      this.currentDay++;
    }
    return this.dailyMoves.join("\n");
  }
}

const simulationInstance = new DeliverySimulation();
console.log(simulationInstance.runSimulation());
