"use strict";
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenStream = rawData.split(/ |\n/), tokenIndex = 0;

function readInt() { return +tokenStream[tokenIndex++]; };
function readString() { return tokenStream[tokenIndex++]; };

function createMultiDimArray(initialValue) {
    var args = arguments;
    var argCount = args.length;
    var currentDimIndex = argCount - 1;

    let arrayConstructorString = "Array(args[" + currentDimIndex + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--currentDimIndex > 0) {
        arrayConstructorString = "Array(args[" + currentDimIndex + "]).fill(0).map(x=>" + arrayConstructorString + ")";
    }
    return eval(arrayConstructorString);
}

var currentPathLength = 0;
var currentVertex = 0;
var currentDay = 0;
var lastOrderDay = -1;
var totalScore = 0;

const infinityValue = 1e9;
const numVertices = readInt();
const numEdges = readInt();
const distanceMatrix = createMultiDimArray(infinityValue, numVertices, numVertices);
const adjacencySets = createMultiDimArray("new Set()", numVertices);

function processGraphEdges() {
    for (var vertexI = 0; vertexI < numVertices; vertexI++) {
        distanceMatrix[vertexI][vertexI] = 0;
    }
    for (var edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
        var nodeA = readInt() - 1;
        var nodeB = readInt() - 1;
        var edgeWeight = readInt();
        distanceMatrix[nodeA][nodeB] = edgeWeight;
        distanceMatrix[nodeB][nodeA] = edgeWeight;
        adjacencySets[nodeA].add(nodeB);
        adjacencySets[nodeB].add(nodeA);
    }
}
processGraphEdges();

const maxTime = readInt();
const maxTimeSquared = maxTime * maxTime;
const dailyResults = Array(maxTime);
const pendingDeliveries = new Set();
const deliveryOrderTimes = createMultiDimArray("[]", numVertices);

console.log(executeSimulation());

function updatePathIfShorter(i, k, j) {
    let pathIK = distanceMatrix[i][k];
    let pathKJ = distanceMatrix[k][j];
    let currentPathIJ = distanceMatrix[i][j];
    let candidatePath = pathIK + pathKJ;
    if (candidatePath < currentPathIJ) {
        distanceMatrix[i][j] = candidatePath;
    }
}

function executeSimulation() {
    for (var vertexK = 0; vertexK < numVertices; vertexK++) {
        for (var vertexI = 0; vertexI < numVertices; vertexI++) {
            for (var vertexJ = 0; vertexJ < numVertices; vertexJ++) {
                updatePathIfShorter(vertexI, vertexK, vertexJ);
            }
        }
    }

    while (currentDay < maxTime) {
        let currentDayResult = handleDailyOperations();
        dailyResults[currentDay] = currentDayResult + 1;
        currentDay++;
    }
    return dailyResults.join("\n");
}

function handleReturnToOrigin() {
    if (currentVertex === 0) {
        return -2;
    }
    return findNextStepOnPath(currentVertex, 0);
}

function setPathAndVertex(targetNode, pathWeight) {
    currentPathLength = pathWeight - 1;
    currentVertex = targetNode;
    return currentVertex;
}

function findNextStepOnPath(startNode, endNode) {
    let directDistance = distanceMatrix[startNode][endNode];

    if (adjacencySets[startNode].has(endNode)) {
        return setPathAndVertex(endNode, directDistance);
    }

    for (var neighborNode of adjacencySets[startNode]) {
        let distToNeighbor = distanceMatrix[startNode][neighborNode];
        let distNeighborToEnd = distanceMatrix[neighborNode][endNode];
        let totalDistViaNeighbor = distToNeighbor + distNeighborToEnd;
        
        if (directDistance === totalDistViaNeighbor) {
            return setPathAndVertex(neighborNode, distToNeighbor);
        }
    }
    return -2;
}

function determineOptimalDeliveryAction() {
    if (pendingDeliveries.size === 0) {
        return handleReturnToOrigin();
    }

    var bestTargetId = -1;
    var maxOrdersAtTarget = 0;
    var remainingTimeBudget = maxTime - currentDay;

    for (var targetVertex of pendingDeliveries) {
        let ordersCount = deliveryOrderTimes[targetVertex].length;
        let distanceToTarget = distanceMatrix[currentVertex][targetVertex];
        
        let isTargetReachable = distanceToTarget <= remainingTimeBudget;
        let hasMoreOrders = ordersCount > maxOrdersAtTarget;

        if (isTargetReachable && hasMoreOrders) {
            maxOrdersAtTarget = ordersCount;
            bestTargetId = targetVertex;
        }
    }

    if (bestTargetId === -1) {
        return handleReturnToOrigin();
    }
    return findNextStepOnPath(currentVertex, bestTargetId);
}

function handleDailyOperations() {
    if (currentPathLength > 0) {
        currentPathLength--;
        return currentVertex;
    }

    if (currentVertex === 0) {
        processIncomingOrders();
    } else {
        processCompletedDelivery();
    }
    return determineOptimalDeliveryAction();
}

function addOrderToSystem(orderId, deliveryTarget, orderDay) {
    pendingDeliveries.add(deliveryTarget);
    deliveryOrderTimes[deliveryTarget].push(orderDay);
}

function processIncomingOrders() {
    while (lastOrderDay < currentDay) {
        lastOrderDay++;
        var numNewOrders = readInt();
        for (var orderIdx = 0; orderIdx < numNewOrders; orderIdx++) {
            var orderId = readInt() - 1;
            var deliveryTarget = readInt() - 1;
            addOrderToSystem(orderId, deliveryTarget, lastOrderDay);
        }
    }
}

function processCompletedDelivery() {
    pendingDeliveries.delete(currentVertex);
    let ordersAtCurrentVertex = deliveryOrderTimes[currentVertex];
    let numOrdersToProcess = ordersAtCurrentVertex.length;

    while (numOrdersToProcess > 0) {
        var orderCompletionDay = ordersAtCurrentVertex.pop();
        var timeElapsed = currentDay - orderCompletionDay;
        var penalty = timeElapsed * timeElapsed;
        totalScore += maxTimeSquared - penalty;
        numOrdersToProcess--;
    }
}
