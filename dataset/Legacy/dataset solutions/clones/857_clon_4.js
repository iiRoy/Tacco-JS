const fs = require('fs');

const acquireInputData = () => {
    const fileDescriptor = process.stdin.fd;
    const fileStats = fs.fstatSync(fileDescriptor);
    const bufferCapacity = fileStats.size;
    const dataBuffer = Buffer.alloc(bufferCapacity);
    const bytesReadCount = fs.readSync(fileDescriptor, dataBuffer, 0, bufferCapacity, 0);
    return dataBuffer.toString('utf8', 0, bytesReadCount).split('\n');
};

const executeGraphAnalysis = () => {
    const rawInputLines = acquireInputData();
    let currentLineIndex = 0;

    const extractNumericLine = () => rawInputLines[currentLineIndex++].split(' ').map(Number);

    const [vertexCount, connectionCount] = extractNumericLine();

    const forwardConnections = new Map();
    const backwardConnections = new Map();
    const incomingEdgeCounts = Array(vertexCount).fill(0);
    const longestPathValues = Array(vertexCount).fill(0);
    const allConnectionPairs = [];

    for (let i = 0; i < vertexCount; i++) {
        forwardConnections.set(i, new Set());
        backwardConnections.set(i, new Set());
    }

    for (let i = 0; i < connectionCount; i++) {
        const [origin, destination] = extractNumericLine().map(val => val - 1);
        allConnectionPairs.push([origin, destination]);
        forwardConnections.get(origin).add(destination);
        backwardConnections.get(destination).add(origin);
        incomingEdgeCounts[destination]++;
    }

    const processingQueue = [];
    for (let i = 0; i < vertexCount; i++) {
        if (incomingEdgeCounts[i] === 0) {
            processingQueue.push(i);
        }
    }

    let queuePointer = 0;
    while (queuePointer < processingQueue.length) {
        const currentVertex = processingQueue[queuePointer++];
        for (const adjacentVertex of forwardConnections.get(currentVertex)) {
            longestPathValues[adjacentVertex] = Math.max(longestPathValues[adjacentVertex], longestPathValues[currentVertex] + 1);
            incomingEdgeCounts[adjacentVertex]--;
            if (incomingEdgeCounts[adjacentVertex] === 0) {
                processingQueue.push(adjacentVertex);
            }
        }
    }

    const overallMaximumPath = Math.max(...longestPathValues);
    const verticesOnAnyLongestPath = new Set();
    const pathLengthSegmentCounts = Array(overallMaximumPath + 1).fill(0);

    const pathDiscoveryQueue = [];
    for (let i = 0; i < vertexCount; i++) {
        if (longestPathValues[i] === overallMaximumPath) {
            pathDiscoveryQueue.push(i);
            verticesOnAnyLongestPath.add(i);
        }
    }

    let discoveryQueuePointer = 0;
    while (discoveryQueuePointer < pathDiscoveryQueue.length) {
        const currentPathVertex = pathDiscoveryQueue[discoveryQueuePointer++];
        for (const priorVertex of backwardConnections.get(currentPathVertex)) {
            if (longestPathValues[priorVertex] + 1 === longestPathValues[currentPathVertex]) {
                pathLengthSegmentCounts[longestPathValues[priorVertex]]++;
                if (!verticesOnAnyLongestPath.has(priorVertex)) {
                    verticesOnAnyLongestPath.add(priorVertex);
                    pathDiscoveryQueue.push(priorVertex);
                }
            }
        }
    }

    allConnectionPairs.forEach((connection, connectionIndex) => {
        const [startNode, endNode] = connection;
        if (verticesOnAnyLongestPath.has(startNode) && verticesOnAnyLongestPath.has(endNode) && pathLengthSegmentCounts[longestPathValues[startNode]] === 1) {
            console.log(connectionIndex + 1);
        }
    });
};

executeGraphAnalysis();
