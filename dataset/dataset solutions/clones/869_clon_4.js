const fileAccess = require('fs');
const rawContent = fileAccess.readFileSync(process.stdin.fd, 'utf8');
const lineContent = rawContent.split('\n').filter(Boolean);

const [nodeCountVal, edgeCountVal] = lineContent.shift().split(' ').map(Number);

const forwardConnections = new Map(); // Maps source node to an array of { to: targetNode, weight: pathCost }
const backwardConnections = new Map(); // Maps target node to an array of { from: sourceNode, weight: pathCost }

// Ensure all node keys exist in maps, even if they have no connections
for (let k = 0; k < nodeCountVal; ++k) {
    forwardConnections.set(k, []);
    backwardConnections.set(k, []);
}

for (let currentEdgeInfo of lineContent.slice(0, edgeCountVal)) {
    const [sourceNodeId, targetNodeId, connectionCost] = currentEdgeInfo.split(' ').map(Number);
    forwardConnections.get(sourceNodeId).push({ to: targetNodeId, weight: connectionCost });
    backwardConnections.get(targetNodeId).push({ from: sourceNodeId, weight: connectionCost });
}

const memoizedOptimalPaths = new Map(); // Maps node ID to its longest path value from node 0
memoizedOptimalPaths.set(0, 0); // The path from node 0 to itself is 0

const computeMaxPathToNode = (currentId) => {
    if (memoizedOptimalPaths.has(currentId)) {
        return memoizedOptimalPaths.get(currentId);
    }

    let maximumPathValue = 0;
    const incomingEdgeList = backwardConnections.get(currentId) || [];

    for (const edgeDetail of incomingEdgeList) {
        const pathFromPredecessor = computeMaxPathToNode(edgeDetail.from);
        maximumPathValue = Math.max(maximumPathValue, pathFromPredecessor + edgeDetail.weight);
    }

    memoizedOptimalPaths.set(currentId, maximumPathValue);
    return maximumPathValue;
};

const finalPathValues = [];
for (let k = 0; k < nodeCountVal; ++k) {
    finalPathValues.push(computeMaxPathToNode(k));
}

console.log(finalPathValues);