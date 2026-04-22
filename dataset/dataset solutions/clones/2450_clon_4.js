"use strict";

const fileSystem = require("fs");

const sourceText = fileSystem.readFileSync("/dev/stdin", "utf8");
const tokenStream = sourceText.split(/ |\n/).filter(Boolean);
let tokenIndex = 0;

const readNumericalValue = () => Number(tokenStream[tokenIndex++]);
const readStringValue = () => tokenStream[tokenIndex++]; // Not directly used but defined for completeness

const createMultidimensionalArray = (initialValue, ...dimensions) => {
    const build = (dims) => {
        if (dims.length === 0) return initialValue;
        const currentDim = dims[0];
        const remainingDims = dims.slice(1);
        return Array.from({ length: currentDim }, () => build(remainingDims));
    };
    return build(dimensions);
};

class DisjointSet {
    constructor(nodeCount) {
        this.parentArray = Array(nodeCount).fill(-1); // Negative value indicates root and its size
    }

    findRepresentative(idx) {
        if (this.parentArray[idx] < 0) {
            return idx;
        }
        this.parentArray[idx] = this.findRepresentative(this.parentArray[idx]);
        return this.parentArray[idx];
    }

    areConnected(first, second) {
        return this.findRepresentative(first) === this.findRepresentative(second);
    }

    mergeSets(first, second) {
        let rootA = this.findRepresentative(first);
        let rootB = this.findRepresentative(second);

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

    getSetSize(idx) {
        return -this.parentArray[this.findRepresentative(idx)];
    }
}

const HUGE_VALUE = 1e9;

const vertexCount = readNumericalValue();
const edgeCount = readNumericalValue();

const nodeDistances = createMultidimensionalArray(HUGE_VALUE, vertexCount, vertexCount);
const directEdgeWeights = createMultidimensionalArray(HUGE_VALUE, vertexCount, vertexCount);
const adjacencyLists = createMultidimensionalArray([], vertexCount);

const populateGraphData = () => {
    for (let currentVertex = 0; currentVertex < vertexCount; currentVertex++) {
        nodeDistances[currentVertex][currentVertex] = 0;
    }

    for (let currentEdge = 0; currentEdge < edgeCount; currentEdge++) {
        const nodeA = readNumericalValue() - 1;
        const nodeB = readNumericalValue() - 1;
        const weight = readNumericalValue();

        nodeDistances[nodeA][nodeB] = nodeDistances[nodeB][nodeA] = weight;
        directEdgeWeights[nodeA][nodeB] = directEdgeWeights[nodeB][nodeA] = weight;

        adjacencyLists[nodeA].push(nodeB);
        adjacencyLists[nodeB].push(nodeA);
    }
};

populateGraphData();

const maxDuration = readNumericalValue();
const maxDurationSquared = maxDuration * maxDuration;

const initialSimulationState = {
    currentPathLength: 0,
    currentPosition: 0,
    elapsedDays: 0,
    lastPickupDay: -1,
    totalValue: 0,
    pendingDeliveries: new Set(),
    deliveryRoute: [],
    pickupTimestamps: createMultidimensionalArray([], vertexCount),
    resultSequence: Array(maxDuration)
};

const computeAllPairsShortestPaths = (distMatrix) => {
    const updatedDistances = distMatrix.map(row => row.slice());
    for (let intermediateNode = 0; intermediateNode < vertexCount; intermediateNode++) {
        for (let startNode = 0; startNode < vertexCount; startNode++) {
            for (let endNode = 0; endNode < vertexCount; endNode++) {
                const pathThroughIntermediate = updatedDistances[startNode][intermediateNode] + updatedDistances[intermediateNode][endNode];
                if (pathThroughIntermediate < updatedDistances[startNode][endNode]) {
                    updatedDistances[startNode][endNode] = pathThroughIntermediate;
                }
            }
        }
    }
    return updatedDistances;
};

const finalNodeDistances = computeAllPairsShortestPaths(nodeDistances);

const generateMinimumSpanningTree = (targetNodes) => {
    const relevantNodes = Array.from(targetNodes).concat(0);
    const nodeCountForMST = relevantNodes.length;

    const allPossibleEdges = [];
    for (let i = 0; i < nodeCountForMST; i++) {
        for (let j = i + 1; j < nodeCountForMST; j++) {
            const u = relevantNodes[i];
            const v = relevantNodes[j];
            allPossibleEdges.push({ source: u, destination: v, weight: finalNodeDistances[u][v] });
        }
    }

    allPossibleEdges.sort((edgeA, edgeB) => edgeA.weight - edgeB.weight);

    const dsuInstance = new DisjointSet(vertexCount);
    const mstEdges = [];

    for (const edge of allPossibleEdges) {
        if (dsuInstance.mergeSets(edge.source, edge.destination)) {
            mstEdges.push(edge);
            if (dsuInstance.getSetSize(0) === nodeCountForMST) {
                break;
            }
        }
    }
    return mstEdges;
};

const buildDeliveryRouteDFS = (startNode, parentNode, graphMap, pathCollector) => {
    pathCollector.push(startNode);
    for (const neighbor of graphMap.get(startNode) || []) {
        if (neighbor !== parentNode) {
            buildDeliveryRouteDFS(neighbor, startNode, graphMap, pathCollector);
        }
    }
};

const handlePickupAction = (currentState) => {
    const newState = { ...currentState };
    newState.deliveryRoute = [];

    while (newState.lastPickupDay < newState.elapsedDays) {
        newState.lastPickupDay++;
        const itemQuantity = readNumericalValue();
        for (let idx = 0; idx < itemQuantity; idx++) {
            const itemID = readNumericalValue() - 1;
            const destinationNode = readNumericalValue() - 1;
            newState.pendingDeliveries.add(destinationNode);
            newState.pickupTimestamps[destinationNode].push(newState.lastPickupDay);
        }
    }

    if (newState.pendingDeliveries.size === 0) {
        return newState;
    }

    const mstEdges = generateMinimumSpanningTree(newState.pendingDeliveries);

    const mstAdjacency = new Map();
    for (const edge of mstEdges) {
        if (!mstAdjacency.has(edge.source)) mstAdjacency.set(edge.source, []);
        if (!mstAdjacency.has(edge.destination)) mstAdjacency.set(edge.destination, []);
        mstAdjacency.get(edge.source).push(edge.destination);
        mstAdjacency.get(edge.destination).push(edge.source);
    }

    const currentRoute = [];
    buildDeliveryRouteDFS(0, -1, mstAdjacency, currentRoute);
    newState.deliveryRoute = currentRoute.reverse();
    newState.deliveryRoute.pop();

    return newState;
};

const handleDeliveryAction = (currentState) => {
    const newState = { ...currentState };
    newState.pendingDeliveries.delete(newState.currentPosition);

    while (newState.pickupTimestamps[newState.currentPosition].length > 0) {
        const pickupDay = newState.pickupTimestamps[newState.currentPosition].pop();
        const timeTaken = newState.elapsedDays - pickupDay;
        newState.totalValue += maxDurationSquared - timeTaken * timeTaken;
    }
    return newState;
};

const determineNextMovementTarget = (currentState) => {
    if (currentState.pendingDeliveries.size === 0) {
        if (currentState.currentPosition === 0) return -2;
        return 0;
    }

    if (currentState.deliveryRoute.length > 0 && currentState.currentPosition === currentState.deliveryRoute[currentState.deliveryRoute.length - 1]) {
        currentState.deliveryRoute.pop();
    }

    if (currentState.deliveryRoute.length === 0) {
        return 0;
    }
    return currentState.deliveryRoute[currentState.deliveryRoute.length - 1];
};

const navigateShortestPathStep = (currentState, targetNode) => {
    const newState = { ...currentState };

    if (newState.currentPosition === targetNode) {
        newState.currentPathLength = 0;
        return newState.currentPosition;
    }

    for (const neighbor of adjacencyLists[newState.currentPosition]) {
        if (finalNodeDistances[newState.currentPosition][targetNode] === directEdgeWeights[newState.currentPosition][neighbor] + finalNodeDistances[neighbor][targetNode]) {
            newState.currentPathLength = directEdgeWeights[newState.currentPosition][neighbor] - 1;
            newState.currentPosition = neighbor;
            return newState.currentPosition;
        }
    }
    return -2;
};

const processDayActions = (currentState) => {
    let newState = { ...currentState };

    if (newState.currentPathLength > 0) {
        newState.currentPathLength--;
    } else {
        if (newState.currentPosition === 0) {
            newState = handlePickupAction(newState);
        } else if (newState.pendingDeliveries.has(newState.currentPosition)) {
            newState = handleDeliveryAction(newState);
        }
    }

    const nextTargetNode = determineNextMovementTarget(newState);
    if (nextTargetNode === -2) {
        newState.currentPosition = newState.currentPosition; // Stay at 0
    } else {
        newState.currentPosition = navigateShortestPathStep(newState, nextTargetNode);
    }
    
    return newState;
};

const executeSimulation = (currentState) => {
    if (currentState.elapsedDays >= maxDuration) {
        return currentState;
    }

    let newState = { ...currentState };
    newState = processDayActions(newState);

    newState.resultSequence[newState.elapsedDays] = newState.currentPosition + 1;

    if (newState.currentPosition === -2) { // Corresponds to `leng < 0` in original
        return newState; // Exit early as per original's behavior
    }

    newState.elapsedDays++;
    return executeSimulation(newState);
};

const finalState = executeSimulation(initialSimulationState);

const outputContent = finalState.resultSequence.join("\n");

try {
    fileSystem.writeFileSync("/dev/stdout", outputContent);
    console.log(finalState.totalValue);
} catch (error) {
    console.log(outputContent);
}