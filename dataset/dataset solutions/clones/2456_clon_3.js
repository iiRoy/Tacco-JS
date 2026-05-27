"use strict";
function createMultiDimArray(initialValueExpr, ...dimensions) {
  const dimCount = dimensions.length;
  let arrayCreationString = `Array(dimensions[${dimCount - 1}]).fill(0).map(x => { return ${initialValueExpr}; })`;
  for (let i = dimCount - 2; i >= 0; i--) {
    arrayCreationString = `Array(dimensions[${i}]).fill(0).map(x => ${arrayCreationString})`;
  }
  return eval(arrayCreationString);
}

let currentPathLength = 0;
let currentNodeLocation = 0;
let currentSimulationDay = 0;
let lastOrderProcessingDay = -1;
let totalDeliveryScore = 0;

const INF_VAL = 1e9;
let numGraphVertices;
let numGraphEdges;
let shortestPathDistances;
let directEdgeDistances;
let adjacencyList;
let inputDataArray; // Renamed from 'f'
let maxAllowedSimulationDays;
let maxAllowedSimulationDaysSquared;
const activeOrderLocations = new Set();
let orderArrivalDaysByLocation;
const inputBuffer = [];
const dailyOutputResults = [];

let inputBufferReadIndex = 0;
function readNextInput() {
  return +inputBuffer[inputBufferReadIndex++];
}

function determineNextDeliveryTarget() {
  if (activeOrderLocations.size === 0) {
    if (currentNodeLocation === 0) return -2;
    return findNextStepOnPath(0);
  }

  let bestTargetNode = -1;
  let maxOrdersAtTarget = 0;
  const remainingTimeForDelivery = maxAllowedSimulationDays - currentSimulationDay;

  for (const potentialTargetNode of activeOrderLocations) {
    const ordersAtThisNodeCount = orderArrivalDaysByLocation[potentialTargetNode].length;
    const pathTimeToTarget = shortestPathDistances[currentNodeLocation][potentialTargetNode];

    if (ordersAtThisNodeCount > maxOrdersAtTarget && pathTimeToTarget <= remainingTimeForDelivery) {
      bestTargetNode = potentialTargetNode;
      maxOrdersAtTarget = ordersAtThisNodeCount;
    }
  }

  if (bestTargetNode === -1) return -2;
  return findNextStepOnPath(bestTargetNode);
}

function findNextStepOnPath(targetNode) {
  const distanceToTarget = shortestPathDistances[currentNodeLocation][targetNode];
  for (const neighborNode of adjacencyList[currentNodeLocation]) {
    const edgeWeightToNeighbor = directEdgeDistances[currentNodeLocation][neighborNode];
    const pathThroughNeighbor = edgeWeightToNeighbor + shortestPathDistances[neighborNode][targetNode];
    if (distanceToTarget === pathThroughNeighbor) {
      currentPathLength = edgeWeightToNeighbor - 1;
      currentNodeLocation = neighborNode;
      return currentNodeLocation;
    }
  }
  return -2;
}

function executeDailyAction() {
  if (currentPathLength > 0) {
    currentPathLength--;
    return currentNodeLocation;
  }

  if (currentNodeLocation === 0) {
    processNewOrders();
  } else {
    completeDelivery();
  }
  return determineNextDeliveryTarget();
}

function processNewOrders() {
  while (lastOrderProcessingDay < currentSimulationDay) {
    lastOrderProcessingDay++;
    const numberOfNewOrders = readNextInput();
    for (let i = 0; i < numberOfNewOrders; i++) {
      const orderIdentifier = readNextInput() - 1; // Renamed from 'id'
      const deliveryDestinationNode = readNextInput() - 1; // Renamed from 'd'
      activeOrderLocations.add(deliveryDestinationNode);
      orderArrivalDaysByLocation[deliveryDestinationNode].push(lastOrderProcessingDay);
    }
  }
}

function completeDelivery() {
  activeOrderLocations.delete(currentNodeLocation);
  const ordersAtCurrentNode = orderArrivalDaysByLocation[currentNodeLocation];
  while (ordersAtCurrentNode.length > 0) {
    const orderArrivalDay = ordersAtCurrentNode.pop();
    const timeElapsedForDelivery = currentSimulationDay - orderArrivalDay;
    totalDeliveryScore += maxAllowedSimulationDaysSquared - (timeElapsedForDelivery * timeElapsedForDelivery);
  }
}

const readlineInterface = require("readline").createInterface(process.stdin, process.stdout);
const simulationProcessor = (function*() {
  const getLineFromInput = () => readlineInterface.once("line", s => simulationProcessor.next(s));

  const initialInputLine = (yield getLineFromInput()).split(" ");
  numGraphEdges = +initialInputLine[1];
  numGraphVertices = +initialInputLine[0];

  shortestPathDistances = createMultiDimArray(INF_VAL, numGraphVertices, numGraphVertices);
  directEdgeDistances = createMultiDimArray(INF_VAL, numGraphVertices, numGraphVertices);
  adjacencyList = createMultiDimArray("[]", numGraphVertices);

  for (let i = 0; i < numGraphVertices; i++) {
    shortestPathDistances[i][i] = 0;
  }

  for (let i = 0; i < numGraphEdges; i++) {
    const edgeDetails = (yield getLineFromInput()).split(" ");
    const nodeA = +edgeDetails[0] - 1;
    const nodeB = +edgeDetails[1] - 1;
    const edgeDistance = +edgeDetails[2];

    shortestPathDistances[nodeA][nodeB] = shortestPathDistances[nodeB][nodeA] = edgeDistance;
    directEdgeDistances[nodeA][nodeB] = directEdgeDistances[nodeB][nodeA] = edgeDistance;
    adjacencyList[nodeA].push(nodeB);
    adjacencyList[nodeB].push(nodeA);
  }

  // Floyd-Warshall algorithm for all-pairs shortest paths
  for (let k_idx = 0; k_idx < numGraphVertices; k_idx++) {
    for (let i_idx = 0; i_idx < numGraphVertices; i_idx++) {
      for (let j_idx = 0; j_idx < numGraphVertices; j_idx++) {
        const pathThroughK = shortestPathDistances[i_idx][k_idx] + shortestPathDistances[k_idx][j_idx];
        if (pathThroughK < shortestPathDistances[i_idx][j_idx]) {
          shortestPathDistances[i_idx][j_idx] = pathThroughK;
        }
      }
    }
  }

  inputDataArray = (yield getLineFromInput()).split(" ").map(val => +val); // Renamed from 'f'
  maxAllowedSimulationDays = +(yield getLineFromInput());
  maxAllowedSimulationDaysSquared = maxAllowedSimulationDays * maxAllowedSimulationDays;
  orderArrivalDaysByLocation = createMultiDimArray("[]", numGraphVertices);

  for (; currentSimulationDay < maxAllowedSimulationDays; currentSimulationDay++) {
    const numDailyOrders = +(yield getLineFromInput());
    inputBuffer.push(numDailyOrders);
    for (let i = 0; i < numDailyOrders; i++) {
      const orderDetails = (yield getLineFromInput()).split(" ").map(val => +val);
      inputBuffer.push(orderDetails[0], orderDetails[1]);
    }

    const numOtherInputLines1 = +(yield getLineFromInput());
    for (let i = 0; i < numOtherInputLines1; i++) {
      yield getLineFromInput(); // Consume these lines
    }

    dailyOutputResults[currentSimulationDay] = executeDailyAction() + 1;
    console.log(dailyOutputResults[currentSimulationDay]);

    const endOfDaySignal = yield getLineFromInput();
    if (endOfDaySignal[0] !== "O") return;

    const numOtherInputLines2 = +(yield getLineFromInput());
    for (let i = 0; i < numOtherInputLines2; i++) {
      yield getLineFromInput(); // Consume these lines
    }
  }
})();
simulationProcessor.next();
