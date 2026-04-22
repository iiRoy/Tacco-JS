const parseGraphInput = (initialData) => {
    const parsedSegments = initialData.trim().split('\n');
    const [vertexCountStr, connectionCountStr] = parsedSegments[0].split(' ');
    const vertexCount = Number(vertexCountStr);
    const connectionCount = Number(connectionCountStr);

    const adjacencyGraph = new Map();
    for (let idx = 0; idx < vertexCount; idx++) {
        adjacencyGraph.set(idx, new Set());
    }

    for (let idx = 1; idx <= connectionCount; idx++) {
        const [endpointAStr, endpointBStr] = parsedSegments[idx].split(' ');
        const endpointA = Number(endpointAStr) - 1; // 0-indexed
        const endpointB = Number(endpointBStr) - 1; // 0-indexed

        adjacencyGraph.get(endpointA).add(endpointB);
        adjacencyGraph.get(endpointB).add(endpointA);
    }
    return { vertexCount, adjacencyGraph };
};

const traverseNetwork = (vertexCount, adjacencyGraph, startingNode = 0) => {
    const levelDepths = new Map();
    const visitedRegistry = new Set();

    const pathfinderQueue = [{ node: startingNode, depth: 0 }];
    visitedRegistry.add(startingNode);
    levelDepths.set(startingNode, 0);

    let head = 0;
    while (head < pathfinderQueue.length) {
        const { node: currentVertex, depth: currentDepth } = pathfinderQueue[head++];

        const neighbors = adjacencyGraph.get(currentVertex);
        if (neighbors) {
            for (const connectedNode of neighbors) {
                if (!visitedRegistry.has(connectedNode)) {
                    visitedRegistry.add(connectedNode);
                    levelDepths.set(connectedNode, currentDepth + 1);
                    pathfinderQueue.push({ node: connectedNode, depth: currentDepth + 1 });
                }
            }
        }
    }
    return { levelDepths, totalVisited: visitedRegistry.size };
};

const analyzePathways = (initialData) => {
    const { vertexCount, adjacencyGraph } = parseGraphInput(initialData);
    const { levelDepths, totalVisited } = traverseNetwork(vertexCount, adjacencyGraph);

    if (totalVisited !== vertexCount) {
        console.log('No');
    } else {
        console.log('Yes');
        for (let idx = 1; idx < vertexCount; idx++) {
            console.log(levelDepths.get(idx) + 1);
        }
    }
};

analyzePathways(require('fs').readFileSync('/dev/stdin', 'utf8'));