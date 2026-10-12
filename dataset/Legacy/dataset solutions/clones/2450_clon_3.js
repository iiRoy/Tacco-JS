"use strict";
const fileSystemModule = require("fs");
const rawInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const tokenizedInput = rawInputData.split(/ |\n/);
let tokenIndex = 0;

function readNextInt() {
    return parseInt(tokenizedInput[tokenIndex++], 10);
}

function readNextString() {
    return tokenizedInput[tokenIndex++];
}

function createMultiDimArray(initialValue) {
    const args = Array.from(arguments);
    const dimensions = args.slice(1);

    function createArrayRecursive(dimIdx) {
        if (dimIdx === dimensions.length - 1) {
            return Array(dimensions[dimIdx]).fill(initialValue);
        }
        return Array(dimensions[dimIdx]).fill(0).map(() => createArrayRecursive(dimIdx + 1));
    }
    return createArrayRecursive(0);
}

class DisjointSetUnion {
    constructor(count) {
        this.parentOrSize = Array(count + 1).fill(-1);
    }

    findRoot(index) {
        if (this.parentOrSize[index] < 0) {
            return index;
        }
        return this.parentOrSize[index] = this.findRoot(this.parentOrSize[index]);
    }

    areConnected(nodeX, nodeY) {
        return this.findRoot(nodeX) === this.findRoot(nodeY);
    }

    unionSets(nodeX, nodeY) {
        let rootX = this.findRoot(nodeX);
        let rootY = this.findRoot(nodeY);

        if (rootX === rootY) {
            return true;
        }

        if (this.parentOrSize[rootY] <= this.parentOrSize[rootX]) {
            this.parentOrSize[rootX] += this.parentOrSize[rootY];
            this.parentOrSize[rootY] = rootX;
        } else {
            this.parentOrSize[rootY] += this.parentOrSize[rootX];
            this.parentOrSize[rootX] = rootY;
        }
        return false;
    }

    getSetSize(index) {
        return -this.parentOrSize[this.findRoot(index)];
    }
}

let currentPathLength = 0;
let currentVertex = 0;
let currentDay = 0;
let lastDeliveryDay = -1;
let totalScore = 0;

const INFINITY_VAL = 1e9;
const numVertices = readNextInt();
const numEdges = readNextInt();
const shortestPathDistances = createMultiDimArray(INFINITY_VAL, numVertices, numVertices);
const edgeWeights = createMultiDimArray(INFINITY_VAL, numVertices, numVertices);
const adjacencyList = createMultiDimArray([], numVertices);

const maxDays = readNextInt();
const maxDaysSquared = maxDays * maxDays;
const dailyResults = Array(maxDays);
const itemsToDeliver = new Set();
let deliveryPath = [];
const itemOrderTimes = createMultiDimArray([], numVertices);

function initializeGraphData() {
    for (let i = 0; i < numVertices; i++) {
        shortestPathDistances[i][i] = 0;
    }
    for (let i = 0; i < numEdges; i++) {
        const vertex1 = readNextInt() - 1;
        const vertex2 = readNextInt() - 1;
        const weight = readNextInt();

        shortestPathDistances[vertex1][vertex2] = shortestPathDistances[vertex2][vertex1] = weight;
        edgeWeights[vertex1][vertex2] = edgeWeights[vertex2][vertex1] = weight;
        adjacencyList[vertex1].push(vertex2);
        adjacencyList[vertex2].push(vertex1);
    }
}

function computeAllPairsShortestPaths() {
    for (let k = 0; k < numVertices; k++) {
        for (let i = 0; i < numVertices; i++) {
            for (let j = 0; j < numVertices; j++) {
                const pathThroughK = shortestPathDistances[i][k] + shortestPathDistances[k][j];
                if (pathThroughK < shortestPathDistances[i][j]) {
                    shortestPathDistances[i][j] = pathThroughK;
                }
            }
        }
    }
}

function simulateDelivery() {
    initializeGraphData();
    computeAllPairsShortestPaths();

    while (currentDay < maxDays) {
        dailyResults[currentDay] = executeDayOperations() + 1;
        if (currentPathLength < 0) {
            console.log(currentDay, currentPathLength, currentVertex);
            return;
        }
        currentDay++;
    }
    return dailyResults.join("\n");
}

function buildMinSpanningTree(vertexSet) {
    const relevantVertices = Array.from(vertexSet).concat(0);
    const numRelevantVertices = relevantVertices.length;
    const edgesForMST = [];

    for (let i = 0; i < numRelevantVertices; i++) {
        for (let j = i + 1; j < numRelevantVertices; j++) {
            const u = relevantVertices[i];
            const v = relevantVertices[j];
            edgesForMST.push([u, v, shortestPathDistances[u][v]]);
        }
    }

    edgesForMST.sort((edgeA, edgeB) => edgeA[2] - edgeB[2]);

    const dsu = new DisjointSetUnion(numVertices);
    const mstEdges = [];
    let edgesAddedCount = 0;

    for (const edge of edgesForMST) {
        const [u, v] = edge;
        if (!dsu.areConnected(u, v)) {
            dsu.unionSets(u, v);
            mstEdges.push(edge);
            edgesAddedCount++;
            if (edgesAddedCount === numRelevantVertices - 1) {
                break;
            }
        }
    }
    return mstEdges;
}

function determineNextMove() {
    if (itemsToDeliver.size === 0) {
        return (currentVertex === 0) ? -2 : findNextStepInPath(0);
    }

    const lastPathVertex = deliveryPath[deliveryPath.length - 1];
    if (currentVertex === lastPathVertex) {
        deliveryPath.pop();
    }

    if (deliveryPath.length === 0) {
        return findNextStepInPath(0);
    }
    return findNextStepInPath(deliveryPath[deliveryPath.length - 1]);
}

function findNextStepInPath(targetVertex) {
    for (const neighbor of adjacencyList[currentVertex]) {
        const pathSegmentLength = edgeWeights[currentVertex][neighbor];
        const remainingPathLength = shortestPathDistances[neighbor][targetVertex];
        const totalCalculatedPath = pathSegmentLength + remainingPathLength;

        if (shortestPathDistances[currentVertex][targetVertex] === totalCalculatedPath) {
            currentPathLength = pathSegmentLength - 1;
            currentVertex = neighbor;
            return currentVertex;
        }
    }
    return -2;
}

function executeDayOperations() {
    if (currentPathLength > 0) {
        currentPathLength--;
        return currentVertex;
    } else {
        if (currentVertex === 0) {
            processNewOrders();
        } else {
            completeDelivery();
        }
        return determineNextMove();
    }
}

function processNewOrders() {
    deliveryPath = [];

    while (lastDeliveryDay < currentDay) {
        lastDeliveryDay++;
        const numNewItems = readNextInt();
        for (let i = 0; i < numNewItems; i++) {
            const itemId = readNextInt() - 1;
            const destinationVertex = readNextInt() - 1;
            itemsToDeliver.add(destinationVertex);
            itemOrderTimes[destinationVertex].push(lastDeliveryDay);
        }
    }

    if (itemsToDeliver.size === 0) {
        return;
    }

    const deliveryTreeEdges = buildMinSpanningTree(itemsToDeliver);
    const deliveryRoadMap = createMultiDimArray([], numVertices);

    for (const edge of deliveryTreeEdges) {
        const [u, v] = edge;
        deliveryRoadMap[u].push(v);
        deliveryRoadMap[v].push(u);
    }
    
    const tempPathAccumulator = [];
    traverseDeliveryTree(0, -1, deliveryRoadMap, tempPathAccumulator);
    deliveryPath = tempPathAccumulator.reverse();
    deliveryPath.pop();
}

function traverseDeliveryTree(vertex, parent, roadMap, currentPathAccumulator) {
    currentPathAccumulator.push(vertex);
    for (const neighbor of roadMap[vertex]) {
        if (neighbor === parent) {
            continue;
        }
        traverseDeliveryTree(neighbor, vertex, roadMap, currentPathAccumulator);
    }
}

function completeDelivery() {
    itemsToDeliver.delete(currentVertex);
    const orderTimestamps = itemOrderTimes[currentVertex];
    while (orderTimestamps.length > 0) {
        const orderTimestamp = orderTimestamps.pop();
        const timeElapsed = currentDay - orderTimestamp;
        totalScore += maxDaysSquared - timeElapsed * timeElapsed;
    }
}

const finalOutputString = simulateDelivery();
try {
    fileSystemModule.writeFileSync("/dev/stdout", finalOutputString);
    console.log(totalScore);
} catch (error) {
    console.log(finalOutputString);
}
