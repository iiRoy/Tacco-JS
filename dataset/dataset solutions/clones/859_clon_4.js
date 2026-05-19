let inputAccumulator = '';

process.stdin.on('data', (chunk) => {
    inputAccumulator += chunk.toString();
});

process.stdin.on('end', () => {
    processInputData(inputAccumulator.trim().split('\n'));
});

function constructNetwork(nodeQuantity, edgeQuantity, connections) {
    const adjacencyRegistry = new Map();
    for (let k = 0; k < nodeQuantity; k++) {
        adjacencyRegistry.set(k, new Set());
    }
    for (const connectionEntry of connections) {
        const originNode = parseInt(connectionEntry[0], 10) - 1;
        const destinationNode = parseInt(connectionEntry[1], 10) - 1;
        adjacencyRegistry.get(originNode).add(destinationNode);
    }
    return adjacencyRegistry;
}

function deriveSubNetwork(baseNetwork, connectionToRemove) {
    const alteredNetwork = new Map();
    for (const [nodeIdentifier, neighborSet] of baseNetwork.entries()) {
        alteredNetwork.set(nodeIdentifier, new Set(neighborSet));
    }
    const originToRemove = parseInt(connectionToRemove[0], 10) - 1;
    const destinationToRemove = parseInt(connectionToRemove[1], 10) - 1;
    if (alteredNetwork.has(originToRemove)) {
        alteredNetwork.get(originToRemove).delete(destinationToRemove);
    }
    return alteredNetwork;
}

function calculateLongestPathLength(networkStructure) {
    const pathLengthCache = new Map();
    let overallMaximumPath = 0;

    function findMaxPathFrom(currentNode) {
        if (pathLengthCache.has(currentNode)) {
            return pathLengthCache.get(currentNode);
        }

        let currentPathValue = 1;
        const connectedNodes = networkStructure.get(currentNode);

        if (connectedNodes && connectedNodes.size > 0) {
            for (const nextNode of connectedNodes) {
                currentPathValue = Math.max(currentPathValue, 1 + findMaxPathFrom(nextNode));
            }
        }
        pathLengthCache.set(currentNode, currentPathValue);
        return currentPathValue;
    }

    for (const nodeKey of networkStructure.keys()) {
        overallMaximumPath = Math.max(overallMaximumPath, findMaxPathFrom(nodeKey));
    }
    return overallMaximumPath;
}

function processInputData(lines) {
    const firstLineParts = lines.shift().split(' ');
    const numNodes = parseInt(firstLineParts[0], 10);
    const numEdges = parseInt(firstLineParts[1], 10);

    const allConnections = [];
    for (let j = 0; j < numEdges; j++) {
        allConnections[j] = lines[j].split(' ');
    }

    const initialNetwork = constructNetwork(numNodes, numEdges, allConnections);
    const initialLongestPath = calculateLongestPathLength(initialNetwork);
    let shorteningDetected = false;

    for (let k = 0; k < numEdges; k++) {
        const networkWithoutOneEdge = deriveSubNetwork(initialNetwork, allConnections[k]);
        if (calculateLongestPathLength(networkWithoutOneEdge) < initialLongestPath) {
            console.log(k + 1);
            shorteningDetected = true;
        }
    }

    if (!shorteningDetected) {
        console.log(-1);
    }
}
