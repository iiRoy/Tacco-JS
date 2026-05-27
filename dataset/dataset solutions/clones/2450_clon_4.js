"use strict";
let inputBuffer = require("fs").readFileSync("/dev/stdin", "utf8").split(/ |\n/);
let inputReadPointer = 0;

const fetchNumericInput = () => +inputBuffer[inputReadPointer++];
const fetchStringInput = () => inputBuffer[inputReadPointer++];

const constructNestedArray = (dimensions, initialValueFactory) => {
    const createRecursive = (dims) => {
        if (dims.length === 0) {
            return typeof initialValueFactory === 'function' ? initialValueFactory() : initialValueFactory;
        }
        const currentDimensionSize = dims[0];
        const remainingDimensions = dims.slice(1);
        return Array.from({ length: currentDimensionSize }, () => createRecursive(remainingDimensions));
    };
    return createRecursive(dimensions);
};

class MinPriorityQueue {
    constructor() {
        this.data = [];
    }

    insert(element) {
        this.data.push(element);
        this._heapifyUp();
    }

    extractMin() {
        if (this.isEmpty()) return undefined;
        const minimum = this.data[0];
        const lastElement = this.data.pop();
        if (!this.isEmpty()) {
            this.data[0] = lastElement;
            this._heapifyDown();
        }
        return minimum;
    }

    isEmpty() {
        return this.data.length === 0;
    }

    _heapifyUp() {
        let currentIndex = this.data.length - 1;
        while (currentIndex > 0) {
            let parentIndex = Math.floor((currentIndex - 1) / 2);
            if (this.data[parentIndex][2] <= this.data[currentIndex][2]) break;
            [this.data[parentIndex], this.data[currentIndex]] = [this.data[currentIndex], this.data[parentIndex]];
            currentIndex = parentIndex;
        }
    }

    _heapifyDown() {
        let currentIndex = 0;
        const totalLength = this.data.length;
        const currentElement = this.data[0];

        while (true) {
            let leftChildIdx = 2 * currentIndex + 1;
            let rightChildIdx = 2 * currentIndex + 2;
            let leftChild, rightChild;
            let swapIdx = null;

            if (leftChildIdx < totalLength) {
                leftChild = this.data[leftChildIdx];
                if (leftChild[2] < currentElement[2]) {
                    swapIdx = leftChildIdx;
                }
            }

            if (rightChildIdx < totalLength) {
                rightChild = this.data[rightChildIdx];
                if (
                    (swapIdx === null && rightChild[2] < currentElement[2]) ||
                    (swapIdx !== null && rightChild[2] < leftChild[2])
                ) {
                    swapIdx = rightChildIdx;
                }
            }

            if (swapIdx === null) break;
            [this.data[currentIndex], this.data[swapIdx]] = [this.data[swapIdx], this.data[currentIndex]];
            currentIndex = swapIdx;
        }
    }
}

class DisjointSet {
    constructor(nodeQuantity) {
        this.parentArray = Array(nodeQuantity + 1).fill(-1);
    }

    findRepresentative(element) {
        if (this.parentArray[element] < 0) {
            return element;
        }
        return this.parentArray[element] = this.findRepresentative(this.parentArray[element]);
    }

    unionByRankOrSize(elementA, elementB) {
        let rootA = this.findRepresentative(elementA);
        let rootB = this.findRepresentative(elementB);

        if (rootA === rootB) {
            return false;
        }

        if (this.parentArray[rootB] < this.parentArray[rootA]) {
            [rootA, rootB] = [rootB, rootA];
        }
        this.parentArray[rootA] += this.parentArray[rootB];
        this.parentArray[rootB] = rootA;
        return true;
    }

    getComponentSize(element) {
        return -this.parentArray[this.findRepresentative(element)];
    }
}

const LARGE_NUMBER = 1e9;
const NUM_NODES = fetchNumericInput();
const NUM_CONNECTIONS = fetchNumericInput();

let shortestPathMatrix = constructNestedArray([NUM_NODES, NUM_NODES], () => LARGE_NUMBER);
let directConnectionWeights = constructNestedArray([NUM_NODES, NUM_NODES], () => LARGE_NUMBER);
let graphAdjacency = constructNestedArray([NUM_NODES], () => []);

let currentPathSegmentLength = 0;
let currentAgentLocation = 0;
let simulationDay = 0;
let lastOrderDay = -1;
let totalScore = 0;

const MAX_SIMULATION_DAYS = fetchNumericInput();
const MAX_SIM_DAYS_SQ = MAX_SIMULATION_DAYS * MAX_SIMULATION_DAYS;
const dailyMovementLog = Array(MAX_SIMULATION_DAYS);

const carriedItems = new Set();
const itemOrderTimestamps = constructNestedArray([NUM_NODES], () => []);

let currentDeliveryRoute = [];

const setupGraphEdges = () => {
    for (let i = 0; i < NUM_NODES; i++) {
        shortestPathMatrix[i][i] = 0;
    }
    for (let i = 0; i < NUM_CONNECTIONS; i++) {
        const node1 = fetchNumericInput() - 1;
        const node2 = fetchNumericInput() - 1;
        const weightVal = fetchNumericInput();
        shortestPathMatrix[node1][node2] = shortestPathMatrix[node2][node1] = weightVal;
        directConnectionWeights[node1][node2] = directConnectionWeights[node2][node1] = weightVal;
        graphAdjacency[node1].push({ neighbor: node2, weight: weightVal });
        graphAdjacency[node2].push({ neighbor: node1, weight: weightVal });
    }
};

const calculateAllShortestPaths = () => {
    for (let sourceNode = 0; sourceNode < NUM_NODES; sourceNode++) {
        const distancesFromSource = Array(NUM_NODES).fill(LARGE_NUMBER);
        distancesFromSource[sourceNode] = 0;
        const pq = new MinPriorityQueue();
        pq.insert([sourceNode, 0, 0]);

        while (!pq.isEmpty()) {
            const [currentNode, currentDistance] = pq.extractMin();

            if (currentDistance > distancesFromSource[currentNode]) continue;

            for (const edge of graphAdjacency[currentNode]) {
                const neighborNode = edge.neighbor;
                const edgeWeight = edge.weight;
                if (distancesFromSource[currentNode] + edgeWeight < distancesFromSource[neighborNode]) {
                    distancesFromSource[neighborNode] = distancesFromSource[currentNode] + edgeWeight;
                    pq.insert([neighborNode, distancesFromSource[neighborNode], distancesFromSource[neighborNode]]);
                }
            }
        }
        shortestPathMatrix[sourceNode] = distancesFromSource;
    }
};

const generateMinimumSpanningTree = (destinationNodes) => {
    const relevantVertices = Array.from(destinationNodes).concat(0);
    const potentialEdges = new MinPriorityQueue();

    for (let i = 0; i < relevantVertices.length; i++) {
        for (let j = i + 1; j < relevantVertices.length; j++) {
            const u = relevantVertices[i];
            const v = relevantVertices[j];
            const edgeWeight = shortestPathMatrix[u][v];
            potentialEdges.insert([u, v, edgeWeight]);
        }
    }

    const dsuInstance = new DisjointSet(NUM_NODES);
    const mstEdgesList = [];
    let componentsToConnect = relevantVertices.length;

    while (!potentialEdges.isEmpty() && componentsToConnect > 1) {
        const [u, v, weight] = potentialEdges.extractMin();
        if (dsuInstance.unionByRankOrSize(u, v)) {
            mstEdgesList.push([u, v, weight]);
            componentsToConnect--;
        }
    }
    return mstEdgesList;
};

const performIterativeDepthFirstSearch = (startNode, treeConnections) => {
    currentDeliveryRoute = [];
    const traversalStack = [[startNode, -1]];
    const visitedNodes = new Set();

    while (traversalStack.length > 0) {
        const [currentNode, parentNode] = traversalStack.pop();

        if (visitedNodes.has(currentNode)) continue;
        visitedNodes.add(currentNode);

        currentDeliveryRoute.push(currentNode);

        const neighborsToVisit = treeConnections[currentNode].filter(n => n !== parentNode);
        for (let i = neighborsToVisit.length - 1; i >= 0; i--) {
            traversalStack.push([neighborsToVisit[i], currentNode]);
        }
    }
    currentDeliveryRoute.reverse();
    currentDeliveryRoute.pop();
};

const processIncomingOrders = () => {
    while (lastOrderDay < simulationDay) {
        lastOrderDay++;
        const newItemsCount = fetchNumericInput();
        for (let i = 0; i < newItemsCount; i++) {
            fetchNumericInput(); // Discard 'id' as it's unused
            const destinationNode = fetchNumericInput() - 1;
            carriedItems.add(destinationNode);
            itemOrderTimestamps[destinationNode].push(lastOrderDay);
        }
    }
    if (carriedItems.size === 0) return;

    const mstEdges = generateMinimumSpanningTree(carriedItems);
    const mstAdjacencyList = constructNestedArray([NUM_NODES], () => []);
    for (const [u, v] of mstEdges) {
        mstAdjacencyList[u].push(v);
        mstAdjacencyList[v].push(u);
    }
    performIterativeDepthFirstSearch(0, mstAdjacencyList);
};

const completeDelivery = () => {
    carriedItems.delete(currentAgentLocation);
    while (itemOrderTimestamps[currentAgentLocation].length > 0) {
        const orderTimestamp = itemOrderTimestamps[currentAgentLocation].pop();
        const timeDifference = simulationDay - orderTimestamp;
        totalScore += MAX_SIM_DAYS_SQ - timeDifference * timeDifference;
    }
};

const determineNextTargetNode = () => {
    if (carriedItems.size === 0) {
        if (currentAgentLocation === 0) return -2;
        return findNextStepOnShortestPath(0);
    }
    if (currentDeliveryRoute.length > 0 && currentAgentLocation === currentDeliveryRoute[currentDeliveryRoute.length - 1]) {
        currentDeliveryRoute.pop();
    }
    if (currentDeliveryRoute.length === 0) {
        return findNextStepOnShortestPath(0);
    }
    return findNextStepOnShortestPath(currentDeliveryRoute[currentDeliveryRoute.length - 1]);
};

const findNextStepOnShortestPath = (destinationNode) => {
    for (const connection of graphAdjacency[currentAgentLocation]) {
        const neighbor = connection.neighbor;
        const directWeight = connection.weight;
        if (shortestPathMatrix[currentAgentLocation][destinationNode] === directWeight + shortestPathMatrix[neighbor][destinationNode]) {
            currentPathSegmentLength = directWeight - 1;
            currentAgentLocation = neighbor;
            return currentAgentLocation;
        }
    }
    return -2;
};

const executeDailyCycle = () => {
    if (currentPathSegmentLength > 0) {
        currentPathSegmentLength--;
        return currentAgentLocation;
    }

    if (currentAgentLocation === 0) {
        processIncomingOrders();
    } else {
        completeDelivery();
    }
    return determineNextTargetNode();
};

const initiateSimulation = () => {
    setupGraphEdges();
    calculateAllShortestPaths();

    for (simulationDay = 0; simulationDay < MAX_SIMULATION_DAYS; simulationDay++) {
        dailyMovementLog[simulationDay] = executeDailyCycle() + 1;
        if (currentPathSegmentLength < 0) {
            return;
        }
    }
    return dailyMovementLog.join("\n");
};

const finalOutput = initiateSimulation();
try {
    require("fs").writeFileSync("/dev/stdout", finalOutput);
    console.log(totalScore);
} catch (error) {
    console.log(finalOutput);
}
