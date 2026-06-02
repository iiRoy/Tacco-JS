var rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
var dataLines = rawData.split('\n');

var getNextInputLine = () => dataLines.shift();

var nodeCount = +getNextInputLine();
var adjacencyMatrix = Array.from({ length: nodeCount }, () => Array(nodeCount).fill(Number.POSITIVE_INFINITY));

for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    adjacencyMatrix[nodeIdx][nodeIdx] = 0;
}

for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    const currentLineValues = getNextInputLine().trim().split(' ').map(Number);
    const sourceNodeId = currentLineValues[0]; // This is always `nodeIdx` in this problem structure
    const numNeighbors = currentLineValues[1];

    for (let neighborOffset = 0; neighborOffset < numNeighbors; neighborOffset++) {
        const dataStartIndex = 2 + neighborOffset * 2;
        const adjacentNodeId = currentLineValues[dataStartIndex];
        const edgeWeight = currentLineValues[dataStartIndex + 1];
        adjacencyMatrix[sourceNodeId][adjacentNodeId] = edgeWeight;
    }
}

var minPathDistances = Array.from({ length: nodeCount }, (_, idx) => idx === 0 ? 0 : Number.POSITIVE_INFINITY);
var processedNodes = new Set();

while (true) {
    let currentNodeToProcess = -1;
    let currentMinDistanceFound = Number.POSITIVE_INFINITY;

    for (let idx = 0; idx < nodeCount; idx++) {
        if (!processedNodes.has(idx) && minPathDistances[idx] < currentMinDistanceFound) {
            currentMinDistanceFound = minPathDistances[idx];
            currentNodeToProcess = idx;
        }
    }

    if (currentNodeToProcess === -1) {
        break;
    }

    processedNodes.add(currentNodeToProcess);

    for (let neighborIdx = 0; neighborIdx < nodeCount; neighborIdx++) {
        const weightToNeighbor = adjacencyMatrix[currentNodeToProcess][neighborIdx];
        if (weightToNeighbor !== Number.POSITIVE_INFINITY) { // Only consider actual edges
            minPathDistances[neighborIdx] = Math.min(minPathDistances[neighborIdx], minPathDistances[currentNodeToProcess] + weightToNeighbor);
        }
    }
}

for (let idx = 0; idx < nodeCount; idx++) {
    console.log(idx, minPathDistances[idx]);
}
