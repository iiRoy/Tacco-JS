const MAX_DISTANCE_VALUE = 9999999999;
const STDIN_FILE_PATH = "/dev/stdin";

function createMatrixDeepCopy(sourceMatrix) {
    return sourceMatrix.map(row => [...row]);
}

function generateSquareMatrix(size, initialValue) {
    const matrix = Array.from({ length: size }, () => Array(size).fill(initialValue));
    for (let idx = 0; idx < size; idx++) {
        matrix[idx][idx] = 0; // Distance to self is zero
    }
    return matrix;
}

function computeFloydWarshall(graphAdjacencyMatrix) {
    const nodeCount = graphAdjacencyMatrix.length;
    const shortestPathMatrix = createMatrixDeepCopy(graphAdjacencyMatrix);

    for (let k_intermediate = 0; k_intermediate < nodeCount; k_intermediate++) {
        for (let i_start = 0; i_start < nodeCount; i_start++) {
            for (let j_end = 0; j_end < nodeCount; j_end++) {
                const pathViaIntermediate = shortestPathMatrix[i_start][k_intermediate] + shortestPathMatrix[k_intermediate][j_end];
                if (shortestPathMatrix[i_start][j_end] > pathViaIntermediate) {
                    shortestPathMatrix[i_start][j_end] = pathViaIntermediate;
                }
            }
        }
    }
    return shortestPathMatrix;
}

function createTokenQueue(initialElements = []) {
    let currentItems = [...initialElements];
    let readPointer = 0;

    return {
        dequeueToken: function() {
            if (readPointer >= currentItems.length) {
                return undefined;
            }
            const token = currentItems[readPointer];
            readPointer++;
            return token;
        },
        enqueueToken: function(token) {
            currentItems.push(token);
        },
        clearAllTokens: function() {
            currentItems = [];
            readPointer = 0;
        },
        get remainingSize() {
            return currentItems.length - readPointer;
        }
    };
}

class InputDataProcessor {
    constructor(fullInputString) {
        const parsedTokens = fullInputString.trim().split(/\s+/g);
        this.inputTokenQueue = createTokenQueue(parsedTokens);
    }

    readStringValue() {
        return this.inputTokenQueue.dequeueToken();
    }

    readIntegerValue() {
        const token = this.inputTokenQueue.dequeueToken();
        return parseInt(token, 10);
    }

    resetProcessor() {
        this.inputTokenQueue.clearAllTokens();
    }
}

function executeGraphProblem(dataProcessor) {
    const numberOfNodes = dataProcessor.readIntegerValue();
    const numberOfEdges = dataProcessor.readIntegerValue();
    const pathThreshold = dataProcessor.readIntegerValue();

    const initialAdjacencyMatrix = generateSquareMatrix(numberOfNodes, MAX_DISTANCE_VALUE);

    for (let edgeCounter = 0; edgeCounter < numberOfEdges; edgeCounter++) {
        const nodeA = dataProcessor.readIntegerValue();
        const nodeB = dataProcessor.readIntegerValue();
        const edgeWeight = dataProcessor.readIntegerValue();
        const zeroIndexedA = nodeA - 1;
        const zeroIndexedB = nodeB - 1;
        initialAdjacencyMatrix[zeroIndexedA][zeroIndexedB] = edgeWeight;
        initialAdjacencyMatrix[zeroIndexedB][zeroIndexedA] = edgeWeight;
    }

    const firstShortestPaths = computeFloydWarshall(initialAdjacencyMatrix);

    const thresholdBasedAdjacencyMatrix = generateSquareMatrix(numberOfNodes, MAX_DISTANCE_VALUE);
    for (let r_idx = 0; r_idx < numberOfNodes; r_idx++) {
        for (let c_idx = 0; c_idx < numberOfNodes; c_idx++) {
            if (firstShortestPaths[r_idx][c_idx] <= pathThreshold) {
                thresholdBasedAdjacencyMatrix[r_idx][c_idx] = 1;
            }
        }
    }

    const finalShortestPaths = computeFloydWarshall(thresholdBasedAdjacencyMatrix);

    const numberOfQueries = dataProcessor.readIntegerValue();
    for (let queryCounter = 0; queryCounter < numberOfQueries; queryCounter++) {
        const queryStartNode = dataProcessor.readIntegerValue();
        const queryEndNode = dataProcessor.readIntegerValue();
        const zeroIndexedStart = queryStartNode - 1;
        const zeroIndexedEnd = queryEndNode - 1;

        const calculatedPathLength = finalShortestPaths[zeroIndexedStart][zeroIndexedEnd];

        if (calculatedPathLength === MAX_DISTANCE_VALUE) {
            console.log(-1);
        } else {
            console.log(calculatedPathLength - 1);
        }
    }
}

(function() {
    const fileSystemModule = require("fs");
    const rawInputContent = fileSystemModule.readFileSync(STDIN_FILE_PATH, "utf8");
    const inputHandler = new InputDataProcessor(rawInputContent);
    executeGraphProblem(inputHandler);
})();
