const sourceText = require('node:fs').readFileSync('/dev/stdin', 'utf8').trim();
const dataLines = sourceText.split('\n');

const vertexCount = parseInt(dataLines[0], 10);

const adjacencyStructure = dataLines.slice(1, vertexCount + 1).reduce((graphMap, lineSegment) => {
    const nodeDetails = lineSegment.split(' ').map(Number);
    const originNode = nodeDetails[0] - 1;
    const numberOfConnections = nodeDetails[1];

    if (!graphMap.has(originNode)) {
        graphMap.set(originNode, []);
    }

    for (let connectionIdx = 0; connectionIdx < numberOfConnections; connectionIdx++) {
        const connectedNode = nodeDetails[2 + connectionIdx] - 1;
        graphMap.get(originNode).push(connectedNode);
    }
    return graphMap;
}, new Map());

for (let node = 0; node < vertexCount; node++) {
    if (!adjacencyStructure.has(node)) {
        adjacencyStructure.set(node, []);
    }
}

const shortestPaths = new Map();
const processingQueue = [];

const initialNode = 0;
shortestPaths.set(initialNode, 0);
processingQueue.push(initialNode);

let currentNodeIdentifier;
while (processingQueue.length > 0) {
    currentNodeIdentifier = processingQueue.shift();

    const currentDistance = shortestPaths.get(currentNodeIdentifier);

    const neighbors = adjacencyStructure.get(currentNodeIdentifier);
    for (const adjacentNode of neighbors) {
        if (!shortestPaths.has(adjacentNode)) {
            shortestPaths.set(adjacentNode, currentDistance + 1);
            processingQueue.push(adjacentNode);
        }
    }
}

const outputResults = Array.from({ length: vertexCount }, (_, index) => {
    const originalNodeId = index + 1;
    const pathLength = shortestPaths.has(index) ? shortestPaths.get(index) : -1;
    return `${originalNodeId} ${pathLength}`;
});

console.log(outputResults.join('\n'));