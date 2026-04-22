const sysio = require('node:fs');

const acquireStandardInput = () => {
    const fileDescriptor = process.stdin.fd;
    const stats = sysio.fstatSync(fileDescriptor);
    const totalBytes = stats.size;
    const inputBuffer = Buffer.alloc(totalBytes);
    const actualBytesRead = sysio.readSync(fileDescriptor, inputBuffer, 0, totalBytes, 0);
    return inputBuffer.toString('utf8', 0, actualBytesRead).split('\n');
};

let lineStream = acquireStandardInput();
let currentLineIndex = 0;

const extractNextValue = () => {
    while (currentLineIndex < lineStream.length && lineStream[currentLineIndex].trim() === '') {
        currentLineIndex++;
    }
    if (currentLineIndex >= lineStream.length) {
        return undefined;
    }
    return Number(lineStream[currentLineIndex++]);
};

const createGrid = (rows, cols, initialValue) =>
    Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => initialValue)
    );

class PriorityMinQueue {
    constructor() { this.entries = []; }
    push(priority, value) {
        this.entries.push({ priority, value });
        this._heapifyUp(this.entries.length - 1);
    }
    pop() {
        if (this.entries.length === 0) return undefined;
        if (this.entries.length === 1) return this.entries.pop().value;
        const item = this.entries[0];
        this.entries[0] = this.entries.pop();
        this._heapifyDown(0);
        return item.value;
    }
    isEmpty() { return this.entries.length === 0; }

    _heapifyUp(idx) {
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            if (this.entries[parentIdx].priority <= this.entries[idx].priority) break;
            [this.entries[parentIdx], this.entries[idx]] = [this.entries[idx], this.entries[parentIdx]];
            idx = parentIdx;
        }
    }
    _heapifyDown(idx) {
        const lastIdx = this.entries.length - 1;
        while (true) {
            let leftChild = 2 * idx + 1;
            let rightChild = 2 * idx + 2;
            let smallestIdx = idx;

            if (leftChild <= lastIdx && this.entries[leftChild].priority < this.entries[smallestIdx].priority) {
                smallestIdx = leftChild;
            }
            if (rightChild <= lastIdx && this.entries[rightChild].priority < this.entries[smallestIdx].priority) {
                smallestIdx = rightChild;
            }

            if (smallestIdx === idx) break;

            [this.entries[idx], this.entries[smallestIdx]] = [this.entries[smallestIdx], this.entries[idx]];
            idx = smallestIdx;
        }
    }
}

const determineShortestPaths = (graphEdges, startVertex) => {
    const vertexCount = graphEdges.length;
    const pathCosts = Array(vertexCount).fill(Number.POSITIVE_INFINITY);
    const processingQueue = new PriorityMinQueue();
    const settledVertices = new Set();

    pathCosts[startVertex] = 0;
    processingQueue.push(0, startVertex);

    while (!processingQueue.isEmpty()) {
        const currentVertex = processingQueue.pop();

        if (settledVertices.has(currentVertex)) {
            continue;
        }
        settledVertices.add(currentVertex);

        for (let neighborVertex = 0; neighborVertex < vertexCount; neighborVertex++) {
            const edgeWeight = graphEdges[currentVertex][neighborVertex];
            if (edgeWeight !== Number.POSITIVE_INFINITY) {
                if (pathCosts[currentVertex] + edgeWeight < pathCosts[neighborVertex]) {
                    pathCosts[neighborVertex] = pathCosts[currentVertex] + edgeWeight;
                    processingQueue.push(pathCosts[neighborVertex], neighborVertex);
                }
            }
        }
    }
    return pathCosts;
};

const verifyPathExistence = (limitJumps, numPoints, pointData) => {
    const totalNodes = numPoints + 2;
    const pathMap = createGrid(totalNodes, totalNodes, Number.POSITIVE_INFINITY);

    Array.from({ length: numPoints + 1 }).forEach((_, sourceNodeIndex) => {
        Array.from({ length: limitJumps }).forEach((_, jumpIteration) => {
            const currentJumpValue = limitJumps - 1 - jumpIteration;
            let potentialTargetIndex = sourceNodeIndex + currentJumpValue +
                (sourceNodeIndex + currentJumpValue < numPoints + 1 ? pointData[sourceNodeIndex + currentJumpValue] : 0);
            
            potentialTargetIndex = Math.min(Math.max(potentialTargetIndex, 0), numPoints + 1);
            
            if (potentialTargetIndex !== sourceNodeIndex) {
                pathMap[sourceNodeIndex][potentialTargetIndex] = 1;
            }
        });
    });

    const reachabilityFromStart = determineShortestPaths(pathMap, 0);

    if (reachabilityFromStart[numPoints + 1] === Number.POSITIVE_INFINITY) {
        return false;
    }

    for (let intermediateNode = 1; intermediateNode <= numPoints; intermediateNode++) {
        if (reachabilityFromStart[intermediateNode] < Number.POSITIVE_INFINITY) {
            const reachabilityFromIntermediate = determineShortestPaths(pathMap, intermediateNode);
            if (reachabilityFromIntermediate[numPoints + 1] === Number.POSITIVE_INFINITY) {
                return false;
            }
        }
    }
    return true;
};

const processNextCase = () => {
    const currentLimit = extractNextValue();
    if (currentLimit === 0) {
        return;
    }

    const currentN = extractNextValue();
    const currentPointData = Array(currentN + 2);
    currentPointData[0] = 0;
    currentPointData[currentN + 1] = 0;

    for (let k = 1; k <= currentN; k++) {
        currentPointData[k] = extractNextValue();
    }

    const outcome = verifyPathExistence(currentLimit, currentN, currentPointData) ? 'OK' : 'NG';
    console.log(outcome);

    processNextCase();
};

processNextCase();