"use strict";

var fileSystem = require("fs");

var rawData = fileSystem.readFileSync("/dev/stdin", "utf8");

var tokenStream = rawData.split(/ |\n/);
var tokenIndex = 0;

function getNextInt() {
    return +tokenStream[tokenIndex++];
}

function getNextString() {
    return tokenStream[tokenIndex++];
}

function createMultiDimArray(initialValue) {
    var args = arguments,
        len = args.length,
        resultStr = "Array(args[" + --len + "]).fill(0).map(element=>{return " + initialValue + ";})";
    while (--len) {
        resultStr = "Array(args[" + len + "]).fill(0).map(element=>" + resultStr + ")";
    }
    return eval(resultStr);
}

function DisjointSet(elementCount) {
    this.parent = Array(elementCount + 1).fill(-1);
}

DisjointSet.prototype = {
    findRoot: function(nodeId) {
        return this.parent[nodeId] < 0 ? nodeId : this.parent[nodeId] = this.findRoot(this.parent[nodeId]);
    },
    areConnected: function(nodeA, nodeB) {
        return this.findRoot(nodeA) === this.findRoot(nodeB);
    },
    unionSets: function(nodeA, nodeB) {
        nodeA = this.findRoot(nodeA);
        nodeB = this.findRoot(nodeB);
        if (nodeA === nodeB) return 1;
        if (this.parent[nodeB] <= this.parent[nodeA]) this.parent[nodeB] += this.parent[nodeA], this.parent[nodeA] = nodeB;
        else this.parent[nodeA] += this.parent[nodeB], this.parent[nodeB] = nodeA;
    },
    getSetSize: function(nodeId) {
        return -this.parent[this.findRoot(nodeId)];
    },
};


var currentPathLength = 0,
    currentVertex = 0,
    currentDay = 0,
    lastOrderDay = -1;
var totalScore = 0;

const infinityValue = 1000000000;
const numVertices = getNextInt();
const numEdges = getNextInt();
const distanceMatrix = createMultiDimArray(infinityValue, numVertices, numVertices);
const directDistanceMatrix = createMultiDimArray(infinityValue, numVertices, numVertices);
const adjacencyList = createMultiDimArray("[]", numVertices);
initializeGraphData();
const maxTime = getNextInt();
const maxTimeSquared = maxTime * maxTime;
const dailyResults = Array(maxTime);
const itemsToDeliver = new Set(),
    deliveryReady = new Set();
var deliveryRoute = [];
const itemOrderTimes = createMultiDimArray("[]", numVertices);

const outputString = runSimulation();
try {
    fileSystem.writeFileSync("/dev/stdout", outputString);
    console.log(totalScore);
} catch (errorObject) {
    console.log(outputString);
}

function runSimulation() {
    for (var kdx = 0; kdx < numVertices; kdx++)
        for (var idx = 0; idx < numVertices; idx++)
            for (var jdx = 0; jdx < numVertices; jdx++) {
                if (distanceMatrix[idx][kdx] + distanceMatrix[kdx][jdx] < distanceMatrix[idx][jdx]) distanceMatrix[idx][jdx] = distanceMatrix[idx][kdx] + distanceMatrix[kdx][jdx];
            }
    while (currentDay < maxTime) {
        dailyResults[currentDay] = processDay() + 1;
        if (currentPathLength < 0) {
            console.log(currentDay, currentPathLength, currentVertex);
            return;
        }
        currentDay++;
    }
    return dailyResults.join("\n");
}

function buildMinimumSpanningTree(vertexSet) {
    var involvedVertices = Array.from(vertexSet).concat(0);
    var numInvolved = involvedVertices.length;
    var edgeList = [];
    for (var idx = 0; idx < numInvolved; idx++)
        for (var jdx = idx + 1; jdx < numInvolved; jdx++) {
            edgeList.push([involvedVertices[idx], involvedVertices[jdx], distanceMatrix[involvedVertices[idx]][involvedVertices[jdx]]]);
        }
    edgeList.sort((edgeA, edgeB) => edgeA[2] - edgeB[2]);
    var disjointSetInstance = new DisjointSet(numVertices);
    var mstEdges = [];
    for (var idx = 0; disjointSetInstance.getSetSize(0) !== numInvolved; idx++) {
        if (disjointSetInstance.unionSets(edgeList[idx][0], edgeList[idx][1])) continue;
        mstEdges.push([edgeList[idx][0], edgeList[idx][1], edgeList[idx][2]]);
    }
    return mstEdges;
}

function addVerticesToTree(spanningTree, currentSet, newVerticesToAdd) {
    var existingVertices = Array.from(currentSet).concat(0);
    var addedVertices = Array.from(newVerticesToAdd);
    var numExisting = existingVertices.length,
        numAdded = addedVertices.length;
    var candidateEdges = [];
    for (var idx = 0; idx < numExisting; idx++)
        for (var jdx = 0; jdx < numAdded; jdx++) {
            candidateEdges.push([existingVertices[idx], addedVertices[jdx], distanceMatrix[existingVertices[idx]][addedVertices[jdx]]]);
        }
    candidateEdges.sort((edgeA, edgeB) => edgeA[2] - edgeB[2]);
    candidateEdges.push([0, 0, infinityValue]);
    var disjointSetInstance = new DisjointSet(numVertices);
    var updatedTreeEdges = [];
    for (var idx = 0, jdx = 0; disjointSetInstance.getSetSize(0) !== numExisting + numAdded;) {
        if (idx === numExisting || candidateEdges[jdx][2] < spanningTree[idx][2]) {
            if (!disjointSetInstance.unionSets(candidateEdges[jdx][0], candidateEdges[jdx][1]))
                updatedTreeEdges.push([candidateEdges[jdx][0], candidateEdges[jdx][1], candidateEdges[jdx][2]]);
            jdx++;
        } else {
            if (!disjointSetInstance.unionSets(spanningTree[idx][0], spanningTree[idx][1]))
                updatedTreeEdges.push([spanningTree[idx][0], spanningTree[idx][1], spanningTree[idx][2]]);
            idx++;
        }
    }
    return updatedTreeEdges;
}

function initializeGraphData() {
    for (var idx = 0; idx < numVertices; idx++) distanceMatrix[idx][idx] = 0;
    for (var idx = 0; idx < numEdges; idx++) {
        var vertexOne = getNextInt() - 1,
            vertexTwo = getNextInt() - 1,
            edgeWeight = getNextInt();
        distanceMatrix[vertexOne][vertexTwo] = distanceMatrix[vertexTwo][vertexOne] = directDistanceMatrix[vertexOne][vertexTwo] = directDistanceMatrix[vertexTwo][vertexOne] = edgeWeight;
        adjacencyList[vertexOne].push(vertexTwo);
        adjacencyList[vertexTwo].push(vertexOne);
    }
}

function determineNextMove() {
    if (itemsToDeliver.size === 0) {
        if (currentVertex === 0) return -2;
        return findNextStepInPath(0);
    }
    if (currentVertex === deliveryRoute[deliveryRoute.length - 1]) deliveryRoute.pop();
    if (deliveryRoute.length === 0) return findNextStepInPath(0);
    return findNextStepInPath(deliveryRoute[deliveryRoute.length - 1]);
}

function findNextStepInPath(targetVertex) {
    for (var neighborVertex of adjacencyList[currentVertex]) {
        if (distanceMatrix[currentVertex][targetVertex] === directDistanceMatrix[currentVertex][neighborVertex] + distanceMatrix[neighborVertex][targetVertex]) {
            currentPathLength = directDistanceMatrix[currentVertex][neighborVertex] - 1;
            return currentVertex = neighborVertex;
        }
    }
    return -2;
}

function processDay() {
    if (currentPathLength) {
        currentPathLength--;
        return currentVertex;
    }
    if (currentVertex === 0) receiveOrders();
    else completeDelivery();
    return determineNextMove();
}

function receiveOrders() {
    deliveryRoute = [];
    while (lastOrderDay < currentDay) {
        lastOrderDay++;
        var numNewOrders = getNextInt();
        for (var idx = 0; idx < numNewOrders; idx++) {
            var itemId = getNextInt() - 1,
                destinationVertex = getNextInt() - 1;
            itemsToDeliver.add(destinationVertex);
            itemOrderTimes[destinationVertex].push(lastOrderDay);
        }
    }
    if (itemsToDeliver.size === 0) return;
    var currentTree = buildMinimumSpanningTree(itemsToDeliver);
    var mstAdjacency = createMultiDimArray("[]", numVertices);
    for (var idx = 0; idx < currentTree.length; idx++) {
        var nodeA = currentTree[idx][0],
            nodeB = currentTree[idx][1];
        mstAdjacency[nodeA].push(nodeB);
        mstAdjacency[nodeB].push(nodeA);
    }
    depthFirstSearch(0, -1, mstAdjacency);
    deliveryRoute.reverse();
    deliveryRoute.pop();
}

function depthFirstSearch(currentNode, parentNode, mstAdjacency) {
    deliveryRoute.push(currentNode);
    for (var neighborNode of mstAdjacency[currentNode]) {
        if (neighborNode === parentNode) continue;
        depthFirstSearch(neighborNode, currentNode, mstAdjacency);
    }
}

function completeDelivery() {
    itemsToDeliver.delete(currentVertex);
    while (itemOrderTimes[currentVertex].length) {
        var timeElapsed = currentDay - itemOrderTimes[currentVertex].pop();
        totalScore += maxTimeSquared - timeElapsed * timeElapsed;
    }
}
