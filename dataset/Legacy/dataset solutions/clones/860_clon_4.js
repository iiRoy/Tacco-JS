const fs = require('fs');

const readInputAndProcess = () => {
    const inputBufferLength = fs.fstatSync(process.stdin.fd).size;
    const inputBuffer = Buffer.alloc(inputBufferLength);
    const bytesReadCount = fs.readSync(process.stdin.fd, inputBuffer, 0, inputBufferLength, 0);
    const inputLines = inputBuffer.toString('utf8', 0, bytesReadCount).split('\n');

    const [nodeCountStr, edgeCountStr] = inputLines.shift().split(' ');
    const nodeCount = Number(nodeCountStr);
    const edgeCount = Number(edgeCountStr);

    const forwardAdjacency = new Map();
    const reverseAdjacency = new Map();
    const allEdges = [];
    const currentInDegrees = Array.from({ length: nodeCount }, () => 0);

    for (let i = 0; i < nodeCount; i++) {
        forwardAdjacency.set(i, new Set());
        reverseAdjacency.set(i, new Set());
    }

    for (let i = 0; i < edgeCount; i++) {
        const [sourceStr, targetStr] = inputLines[i].split(' ');
        const sourceNode = Number(sourceStr) - 1;
        const targetNode = Number(targetStr) - 1;

        forwardAdjacency.get(sourceNode).add(targetNode);
        reverseAdjacency.get(targetNode).add(sourceNode);
        currentInDegrees[targetNode]++;
        allEdges.push({ from: sourceNode, to: targetNode, originalIndex: i });
    }

    const pathLengths = Array.from({ length: nodeCount }, () => 0);
    const topologicalQueue = [];

    for (let i = 0; i < nodeCount; i++) {
        if (currentInDegrees[i] === 0) {
            topologicalQueue.push(i);
        }
    }

    let queuePointer = 0;
    while (queuePointer < topologicalQueue.length) {
        const currentNode = topologicalQueue[queuePointer++];

        for (const neighbor of forwardAdjacency.get(currentNode)) {
            pathLengths[neighbor] = Math.max(pathLengths[neighbor], pathLengths[currentNode] + 1);
            currentInDegrees[neighbor]--;
            if (currentInDegrees[neighbor] === 0) {
                topologicalQueue.push(neighbor);
            }
        }
    }

    const maxOverallPathLength = Math.max(...pathLengths);

    const isNodeOnLongestPath = Array.from({ length: nodeCount }, () => false);
    const longestPathBacktrackQueue = [];

    for (let i = 0; i < nodeCount; i++) {
        if (pathLengths[i] === maxOverallPathLength) {
            isNodeOnLongestPath[i] = true;
            longestPathBacktrackQueue.push(i);
        }
    }

    let backtrackQueuePointer = 0;
    while (backtrackQueuePointer < longestPathBacktrackQueue.length) {
        const currentPathNode = longestPathBacktrackQueue[backtrackQueuePointer++];

        for (const predecessor of reverseAdjacency.get(currentPathNode)) {
            if (pathLengths[predecessor] + 1 === pathLengths[currentPathNode]) {
                if (!isNodeOnLongestPath[predecessor]) {
                    isNodeOnLongestPath[predecessor] = true;
                    longestPathBacktrackQueue.push(predecessor);
                }
            }
        }
    }

    const segmentTransitionCounts = Array.from({ length: maxOverallPathLength + 1 }, () => 0);

    for (let i = 0; i < nodeCount; i++) {
        if (isNodeOnLongestPath[i]) {
            for (const neighbor of forwardAdjacency.get(i)) {
                if (isNodeOnLongestPath[neighbor] && pathLengths[i] + 1 === pathLengths[neighbor]) {
                    segmentTransitionCounts[pathLengths[i]]++;
                }
            }
        }
    }

    let criticalEdgeFound = false;
    for (const edge of allEdges) {
        const u = edge.from;
        const v = edge.to;

        if (isNodeOnLongestPath[u] && isNodeOnLongestPath[v] && pathLengths[u] + 1 === pathLengths[v]) {
            if (segmentTransitionCounts[pathLengths[u]] === 1) {
                console.log(edge.originalIndex + 1);
                criticalEdgeFound = true;
                break;
            }
        }
    }

    if (!criticalEdgeFound) {
        console.log(-1);
    }
};

readInputAndProcess();
