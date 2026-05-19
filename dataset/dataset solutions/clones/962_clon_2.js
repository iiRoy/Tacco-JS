const cfg = { input: '/dev/stdin', newline: '\n' };

let inputLines = require('fs').readFileSync(cfg.input, 'ascii')
    .trim()
    .split(cfg.newline);

const nodeCount = Number(inputLines.shift());

const adjacencyList = {};

function populateEdge(graphObject, sourceNodeId, destinationNodeId, edgeWeight) {
    if (!graphObject.hasOwnProperty(sourceNodeId)) {
        graphObject[sourceNodeId] = {};
    }
    graphObject[sourceNodeId][destinationNodeId] = edgeWeight;
}

for (let lineIndex in inputLines) {
    const currentLineParts = inputLines[lineIndex].split(' ').map(Number);
    const currentSourceNode = currentLineParts[0];

    for (let edgePartIndex = 2; edgePartIndex < currentLineParts.length; edgePartIndex += 2) {
        populateEdge(adjacencyList, currentSourceNode, currentLineParts[edgePartIndex], currentLineParts[edgePartIndex + 1]);
    }
}

const distances = new Array(nodeCount);
const predecessors = new Array(nodeCount);

function initDistances(initialNode) {
    let loopVar;
    for (loopVar = 0; loopVar < nodeCount; loopVar++) {
        distances[loopVar] = Infinity;
        predecessors[loopVar] = null;
    }
    distances[initialNode] = 0;
}

function updateDistance(sourceNodeId, targetNodeId, edgeWeight) {
    if (distances[targetNodeId] > distances[sourceNodeId] + edgeWeight) {
        distances[targetNodeId] = distances[sourceNodeId] + edgeWeight;
        predecessors[targetNodeId] = sourceNodeId;
    }
}

function findShortestPaths(graphAdjacencyMap, startingNode) {
    initDistances(startingNode);

    var currentNodeIdentifier;
    var neighborNodeIdentifier;

    for (let iterCount = 1; iterCount < nodeCount; iterCount++) {
        for (currentNodeIdentifier in graphAdjacencyMap) {
            for (neighborNodeIdentifier in graphAdjacencyMap[currentNodeIdentifier]) {
                updateDistance(Number(currentNodeIdentifier), Number(neighborNodeIdentifier), graphAdjacencyMap[currentNodeIdentifier][neighborNodeIdentifier]);
            }
        }
    }

    for (currentNodeIdentifier in graphAdjacencyMap) {
        for (neighborNodeIdentifier in graphAdjacencyMap[neighborNodeIdentifier]) {
            if (distances[Number(neighborNodeIdentifier)] > distances[Number(currentNodeIdentifier)] + graphAdjacencyMap[Number(currentNodeIdentifier)][Number(neighborNodeIdentifier)]) {
                return false;
            }
        }
    }
    return true;
}

findShortestPaths(adjacencyList, 0);

for (let distIndex in distances) {
    console.log("%s %d", distIndex, distances[distIndex]);
}
