"use strict";

function createMultiDimArray(initialValue, ...dimensions) {
    const createRecursive = (dims, currentDimIndex) => {
        if (currentDimIndex === dims.length - 1) {
            return Array(dims[currentDimIndex]).fill(0).map(() => eval(initialValue));
        }
        return Array(dims[currentDimIndex]).fill(0).map(() => createRecursive(dims, currentDimIndex + 1));
    };
    return createRecursive(dimensions, 0);
}

class DisjointSet {
    constructor(numElements) {
        this.parentArray = Array(numElements + 1).fill(-1);
    }

    findRoot(elementIndex) {
        if (this.parentArray[elementIndex] < 0) {
            return elementIndex;
        }
        return this.parentArray[elementIndex] = this.findRoot(this.parentArray[elementIndex]);
    }

    areConnected(elementX, elementY) {
        return this.findRoot(elementX) === this.findRoot(elementY);
    }

    unionSets(elementX, elementY) {
        let rootX = this.findRoot(elementX);
        let rootY = this.findRoot(elementY);
        if (rootX === rootY) return 1;

        if (this.parentArray[rootY] <= this.parentArray[rootX]) {
            this.parentArray[rootY] += this.parentArray[rootX];
            this.parentArray[rootX] = rootY;
        } else {
            this.parentArray[rootX] += this.parentArray[rootY];
            this.parentArray[rootY] = rootX;
        }
        return 0;
    }

    getSetSize(elementIndex) {
        const rootOfIndex = this.findRoot(elementIndex);
        return -this.parentArray[rootOfIndex];
    }
}

let remainingPathLength = 0;
let currentVertex = 0;
let currentDay = 0;
let lastDeliveryDay = -1;
let totalScore = 0;

const INFINITY_VAL = 1e9;
let numVertices;
let numEdges;
let allPairsDistances;
let edgeDistances;
let adjList;
let someArrayF;
let maxDays;
let maxDaysSquared;
const itemsToDeliver = new Set();
const readyForPickup = new Set();
let deliveryPath = [];
let itemOrderTimes;
const inputBuffer = [];
const outputBuffer = [];

let inputBufferIndex = 0;
function readNextInput() {
    return +inputBuffer[inputBufferIndex++];
}

function buildMinSpanningTree(vertexSet) {
    const verticesInSet = Array.from(vertexSet).concat(0);
    const numSetVertices = verticesInSet.length;
    const edgesForMST = [];

    const generateAllPossibleEdges = () => {
        for (let i = 0; i < numSetVertices; i++) {
            for (let j = i + 1; j < numSetVertices; j++) {
                const u = verticesInSet[i];
                const v = verticesInSet[j];
                edgesForMST.push([u, v, allPairsDistances[u][v]]);
            }
        }
    };
    generateAllPossibleEdges();

    edgesForMST.sort((a, b) => a[2] - b[2]);

    const ds = new DisjointSet(numVertices);
    const mstEdges = [];
    let edgesCount = 0;

    for (const edge of edgesForMST) {
        const [u, v, weight] = edge;
        if (ds.unionSets(u, v) === 0) {
            mstEdges.push([u, v, weight]);
            edgesCount++;
            if (ds.getSetSize(0) === numSetVertices) break;
        }
    }
    return mstEdges;
}

function determineNextMove() {
    if (itemsToDeliver.size === 0) {
        const targetForEmpty = 0;
        if (currentVertex === targetForEmpty) return -2;
        return findNextStepOnPath(targetForEmpty);
    }

    const lastPathIndex = deliveryPath.length - 1;
    if (currentVertex === deliveryPath[lastPathIndex]) {
        deliveryPath.pop();
        let lastPoppedVertex;
        while (deliveryPath.length && readyForPickup.has(lastPoppedVertex = deliveryPath[deliveryPath.length - 1])) {
            deliveryPath.pop();
        }
        if (deliveryPath.length === 0) return findNextStepOnPath(0);
    }
    return findNextStepOnPath(deliveryPath[deliveryPath.length - 1]);
}

function findNextStepOnPath(targetVertex) {
    if (targetVertex === currentVertex) return -2;
    const requiredDistance = allPairsDistances[currentVertex][targetVertex];

    for (const neighborVertex of adjList[currentVertex]) {
        const pathThroughNeighbor = edgeDistances[currentVertex][neighborVertex] + allPairsDistances[neighborVertex][targetVertex];
        if (requiredDistance === pathThroughNeighbor) {
            remainingPathLength = edgeDistances[currentVertex][neighborVertex] - 1;
            currentVertex = neighborVertex;
            return currentVertex;
        }
    }
    return -2;
}

function executeDayAction() {
    if (remainingPathLength > 0) {
        remainingPathLength--;
        return currentVertex;
    }

    if (currentVertex === 0) {
        processNewOrders();
    } else {
        deliverItem();
    }
    const nextActionVertex = determineNextMove();
    return nextActionVertex;
}

function processNewOrders() {
    readyForPickup.clear();
    deliveryPath = [];

    const processOrdersForCurrentDay = () => {
        const numNewOrders = readNextInput();
        for (let i = 0; i < numNewOrders; i++) {
            const orderId = readNextInput() - 1;
            const destination = readNextInput() - 1;
            itemsToDeliver.add(destination);
            itemOrderTimes[destination].push(lastDeliveryDay);
        }
    };

    while (lastDeliveryDay < currentDay) {
        lastDeliveryDay++;
        processOrdersForCurrentDay();
    }
    if (itemsToDeliver.size === 0) return;

    const mstEdgesResult = buildMinSpanningTree(itemsToDeliver);
    const mstAdjacencyList = createMultiDimArray("[]", numVertices);

    const populateMstAdjacency = (edges) => {
        for (const edge of edges) {
            const [u, v] = edge;
            mstAdjacencyList[u].push(v);
            mstAdjacencyList[v].push(u);
        }
    };
    populateMstAdjacency(mstEdgesResult);

    traverseMST(0, -1, mstAdjacencyList);
    deliveryPath.reverse();
    deliveryPath.pop();
}

function traverseMST(vertex, parentVertex, adjacencyList) {
    deliveryPath.push(vertex);
    for (const neighbor of adjacencyList[vertex]) {
        if (neighbor === parentVertex) continue;
        traverseMST(neighbor, vertex, adjacencyList);
    }
}

function deliverItem() {
    itemsToDeliver.delete(currentVertex);
    while (itemOrderTimes[currentVertex].length) {
        const orderTimestamp = itemOrderTimes[currentVertex].pop();
        const timeTaken = currentDay - orderTimestamp;
        totalScore += maxDaysSquared - timeTaken * timeTaken;
    }
}

const readlineInterface = require("readline").createInterface(process.stdin, process.stdout);
const mainGenerator = (function*() {
    const readLineAsync = () => readlineInterface.once("line", s => mainGenerator.next(s));

    const parseInitialGraphInfo = (inputLine) => {
        const parts = inputLine.split(" ");
        numEdges = +parts[1];
        numVertices = +parts[0];
    };

    parseInitialGraphInfo(yield readLineAsync());

    allPairsDistances = createMultiDimArray(INFINITY_VAL, numVertices, numVertices);
    edgeDistances = createMultiDimArray(INFINITY_VAL, numVertices, numVertices);
    adjList = createMultiDimArray("[]", numVertices);

    for (let i = 0; i < numVertices; i++) allPairsDistances[i][i] = 0;

    const processGraphEdges = function*(count) {
        for (let i = 0; i < count; i++) {
            const edgeData = (yield readLineAsync()).split(" ");
            const vertex1 = +edgeData[0] - 1;
            const vertex2 = +edgeData[1] - 1;
            const distanceVal = +edgeData[2];
            allPairsDistances[vertex1][vertex2] = allPairsDistances[vertex2][vertex1] = edgeDistances[vertex1][vertex2] = edgeDistances[vertex2][vertex1] = distanceVal;
            adjList[vertex1].push(vertex2);
            adjList[vertex2].push(vertex1);
        }
    };
    yield* processGraphEdges(numEdges);

    const computeAllPairsShortestPaths = () => {
        for (let k = 0; k < numVertices; k++) {
            for (let i = 0; i < numVertices; i++) {
                for (let j = 0; j < numVertices; j++) {
                    const candidatePathLength = allPairsDistances[i][k] + allPairsDistances[k][j];
                    if (candidatePathLength < allPairsDistances[i][j]) {
                        allPairsDistances[i][j] = candidatePathLength;
                    }
                }
            }
        }
    };
    computeAllPairsShortestPaths();

    someArrayF = (yield readLineAsync()).split(" ").map(val => +val);
    maxDays = +(yield readLineAsync());
    maxDaysSquared = maxDays * maxDays;
    itemOrderTimes = createMultiDimArray("[]", numVertices);

    const skipInputLines = function*(count) {
        for (let i = 0; i < count; i++) {
            yield readLineAsync();
        }
    };

    for (; currentDay < maxDays; currentDay++) {
        const numItemsForDay = +(yield readLineAsync());
        inputBuffer.push(numItemsForDay);
        for (let i = 0; i < numItemsForDay; i++) {
            const itemInfo = (yield readLineAsync()).split(" ").map(val => +val);
            inputBuffer.push(itemInfo[0], itemInfo[1]);
            readyForPickup.add(itemInfo[1]);
        }
        const numLinesToSkip1 = +(yield readLineAsync());
        yield* skipInputLines(numLinesToSkip1);

        const resultForDay = executeDayAction() + 1;
        outputBuffer[currentDay] = resultForDay;
        console.log(outputBuffer[currentDay]);

        const endOfDayCheck = yield readLineAsync();
        if (endOfDayCheck[0] !== "O") return;
        const numLinesToSkip2 = +(yield readLineAsync());
        yield* skipInputLines(numLinesToSkip2);
    }
})();
mainGenerator.next();
