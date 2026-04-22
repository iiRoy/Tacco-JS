const sourceSettings = { origin: '/dev/stdin', separator: '\n' };

const rawInput = require('node:fs').readFileSync(sourceSettings.origin, 'ascii');
const processedLines = rawInput.trim().split(sourceSettings.separator);

const totalNodes = Number(processedLines.shift());

const forwardGraph = new Map();
const reverseGraph = new Map();

const establishConnection = (graphMap, fromNode, toNode, edgeWeight) => {
    if (!graphMap.has(fromNode)) {
        graphMap.set(fromNode, new Map());
    }
    graphMap.get(fromNode).set(toNode, edgeWeight);
};

processedLines.forEach(currentLine => {
    const numericalValues = currentLine.split(' ').map(Number);
    const originNode = numericalValues[0];
    for (let currentIdx = 2; currentIdx < numericalValues.length; currentIdx += 2) {
        const destinationNode = numericalValues[currentIdx];
        const linkCost = numericalValues[currentIdx + 1];
        establishConnection(forwardGraph, originNode, destinationNode, linkCost);
        establishConnection(reverseGraph, destinationNode, originNode, linkCost);
    }
});

const minimumTravelCosts = new Array(totalNodes).fill(Infinity);
minimumTravelCosts[0] = 0;

const costQueue = [[0, 0]];

while (costQueue.length > 0) {
    costQueue.sort((entryA, entryB) => entryA[0] - entryB[0]);
    const [currentCost, currentNode] = costQueue.shift();

    if (currentCost > minimumTravelCosts[currentNode]) {
        continue;
    }

    if (forwardGraph.has(currentNode)) {
        forwardGraph.get(currentNode).forEach((weight, neighborNode) => {
            const potentialNewCost = currentCost + weight;
            if (potentialNewCost < minimumTravelCosts[neighborNode]) {
                minimumTravelCosts[neighborNode] = potentialNewCost;
                costQueue.push([potentialNewCost, neighborNode]);
            }
        });
    }
}

const minimumEdgeHops = new Array(totalNodes).fill(null);
minimumEdgeHops[0] = 0;
const traversalQueue = [0];

let queuePointer = 0;
while (queuePointer < traversalQueue.length) {
    const currentHopNode = traversalQueue[queuePointer++];

    if (forwardGraph.has(currentHopNode)) {
        forwardGraph.get(currentHopNode).forEach((_, neighborHopNode) => {
            if (minimumEdgeHops[neighborHopNode] === null) {
                minimumEdgeHops[neighborHopNode] = minimumEdgeHops[currentHopNode] + 1;
                traversalQueue.push(neighborHopNode);
            }
        });
    }
}

const orderedNodeIndices = Array.from({ length: totalNodes }, (_, i) => i);

orderedNodeIndices.sort((nodeA, nodeB) => minimumTravelCosts[nodeA] - minimumTravelCosts[nodeB]);

const nodeRankings = new Map();
orderedNodeIndices.forEach((nodeIndex, rank) => {
    nodeRankings.set(nodeIndex, rank);
});