const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = fileContent.trim().split('\n');

const [targetNodeIdentifier, , hopPenaltyFactor] = lines[0].split(' ').map(Number);
const edgeDefinitions = lines.slice(1).map(line => line.split(' ').map(Number));

const adjacencyStructure = new Map();
for (let nodeIndex = 1; nodeIndex <= targetNodeIdentifier; nodeIndex++) {
    adjacencyStructure.set(nodeIndex, []);
}

edgeDefinitions.forEach(([sourceNode, destinationNode, edgeValue]) => {
    if (!adjacencyStructure.has(sourceNode)) {
        adjacencyStructure.set(sourceNode, []);
    }
    adjacencyStructure.get(sourceNode).push([destinationNode, edgeValue]);
});

let highestPathScore = -1;

function depthFirstSearch(
    currentPosition,
    currentTotalValue,
    currentHopCount,
    pathHistorySet
) {
    if (pathHistorySet.has(currentPosition)) {
        return;
    }

    const nextPathHistorySet = new Set(pathHistorySet);
    nextPathHistorySet.add(currentPosition);

    if (currentPosition === targetNodeIdentifier) {
        const calculatedScore = currentTotalValue - hopPenaltyFactor * (currentHopCount + 1);
        highestPathScore = Math.max(highestPathScore, calculatedScore);
    }

    const outgoingConnections = adjacencyStructure.get(currentPosition) || [];
    for (const [nextPosition, connectionValue] of outgoingConnections) {
        depthFirstSearch(
            nextPosition,
            currentTotalValue + connectionValue,
            currentHopCount + 1,
            nextPathHistorySet
        );
    }
}

depthFirstSearch(1, 0, 0, new Set());

console.log(highestPathScore);
