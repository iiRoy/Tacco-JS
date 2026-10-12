const rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

const dataRows = rawData.split('\n');

const nodeCount = +dataRows.shift();

const adjacencyMatrix = [];
for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    adjacencyMatrix.push([]);
    for (let subIdx = 0; subIdx < nodeCount; subIdx++) {
        adjacencyMatrix[nodeIdx][subIdx] = Number.POSITIVE_INFINITY;
    }
    adjacencyMatrix[nodeIdx][nodeIdx] = 0;
}

for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    const currentLineData = dataRows.shift().trim().split(' ').map(function(numStr) {
        return +numStr;
    });
    const sourceNodeId = currentLineData[0];
    const neighborCount = currentLineData[1];
    for (let edgeIdx = 0; edgeIdx < neighborCount; edgeIdx++) {
        const targetNodeId = currentLineData[2 + edgeIdx * 2];
        const edgeWeight = currentLineData[2 + edgeIdx * 2 + 1];
        adjacencyMatrix[sourceNodeId][targetNodeId] = edgeWeight;
    }
}

const minDistances = [0];
for (let nodeIdx = 1; nodeIdx < nodeCount; nodeIdx++) {
    minDistances.push(Number.POSITIVE_INFINITY);
}
const processedNodes = {};
while (true) {
    let currentNode = -1;
    for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
        if (!processedNodes[nodeIdx] && (currentNode === -1 || minDistances[nodeIdx] < minDistances[currentNode])) {
            currentNode = nodeIdx;
        }
    }
    if (currentNode === -1) {
        break;
    }
    processedNodes[currentNode] = true;

    for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
        minDistances[nodeIdx] = Math.min(minDistances[nodeIdx], minDistances[currentNode] + adjacencyMatrix[currentNode][nodeIdx]);
    }
}

for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    console.log(nodeIdx, minDistances[nodeIdx]);
}
