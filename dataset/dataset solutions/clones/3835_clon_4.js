function main(input) {
    const inputLines = input.split('\n');
    const [nodeCountString, edgeCountString] = inputLines[0].split(' ');
    const totalNodes = parseInt(nodeCountString, 10);
    const totalEdges = parseInt(edgeCountString, 10);

    const targetDestinations = inputLines[1].split(' ').map(Number);

    const adjacencyMap = new Map();

    for (let edgeIndex = 0; edgeIndex < totalEdges; edgeIndex++) {
        const [firstNodeStr, secondNodeStr] = inputLines[edgeIndex + 2].split(' ');
        const firstNode = parseInt(firstNodeStr, 10);
        const secondNode = parseInt(secondNodeStr, 10);

        if (!adjacencyMap.has(firstNode)) {
            adjacencyMap.set(firstNode, new Set());
        }
        adjacencyMap.get(firstNode).add(secondNode);

        if (!adjacencyMap.has(secondNode)) {
            adjacencyMap.set(secondNode, new Set());
        }
        adjacencyMap.get(secondNode).add(firstNode);
    }

    let successfulPaths = 0;

    const findPathRecursive = (currentVertex, desiredTarget, visitedTracker) => {
        if (currentVertex === desiredTarget) {
            return true;
        }
        if (visitedTracker.has(currentVertex)) {
            return false;
        }

        visitedTracker.add(currentVertex);
        const connectedVertices = adjacencyMap.get(currentVertex);

        if (connectedVertices) {
            for (const nextVertex of connectedVertices) {
                if (findPathRecursive(nextVertex, desiredTarget, visitedTracker)) {
                    return true;
                }
            }
        }
        return false;
    };

    for (let startNodeId = 1; startNodeId <= totalNodes; startNodeId++) {
        const currentTargetId = targetDestinations[startNodeId - 1];
        const visitedNodesForTraversal = new Set();

        if (findPathRecursive(startNodeId, currentTargetId, visitedNodesForTraversal)) {
            successfulPaths++;
        }
    }

    console.log(successfulPaths);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
