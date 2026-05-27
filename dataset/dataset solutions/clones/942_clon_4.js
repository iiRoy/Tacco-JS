const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputs = input.trim().split('\n');
const totalNodeCount = Number(inputs.shift());
const adjacencyLists = inputs.map((s) => s.split(' ').map(Number));

const graphConnections = new Map();
const nodeMetrics = new Map();

for (let i = 1; i <= totalNodeCount; i++) {
    graphConnections.set(i, new Set());
    nodeMetrics.set(i, { d: null, f: null, neighbors: [] });
}

adjacencyLists.forEach(([sourceId, , ...connectedNodes]) => {
    const sourceNeighbors = graphConnections.get(sourceId);
    connectedNodes.forEach(targetId => {
        sourceNeighbors.add(targetId);
        graphConnections.get(targetId).add(sourceId);
    });
});

for (let i = 1; i <= totalNodeCount; i++) {
    nodeMetrics.get(i).neighbors = Array.from(graphConnections.get(i)).sort((a, b) => a - b);
}

function processGraphTimes(initialNodeId, allNodeMetrics) {
    let currentTimestamp = 1;
    const traversalStack = [];

    traversalStack.push({ id: initialNodeId, action: 'start' });

    while (traversalStack.length > 0) {
        const currentOperation = traversalStack.pop();
        const currentIdentifier = currentOperation.id;
        const currentData = allNodeMetrics.get(currentIdentifier);

        if (currentOperation.action === 'start') {
            if (currentData.d !== null) {
                continue;
            }
            currentData.d = currentTimestamp++;
            traversalStack.push({ id: currentIdentifier, action: 'end' });

            for (let i = currentData.neighbors.length - 1; i >= 0; i--) {
                const neighborIdentifier = currentData.neighbors[i];
                if (allNodeMetrics.get(neighborIdentifier).d === null) {
                    traversalStack.push({ id: neighborIdentifier, action: 'start' });
                }
            }
        } else if (currentOperation.action === 'end') {
            if (currentData.f === null) {
                currentData.f = currentTimestamp++;
            }
        }
    }
}

processGraphTimes(1, nodeMetrics);

for (let i = 1; i <= totalNodeCount; i++) {
    const nodeOutput = nodeMetrics.get(i);
    console.log(`${i} ${nodeOutput.d} ${nodeOutput.f}`);
}
