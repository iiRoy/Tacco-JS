const processRawData = (rawText) => {
    const textRows = rawText.split('\n');
    const firstRowElements = textRows[0].split(' ').map(Number);
    const nodeQuantity = firstRowElements[0];
    const edgeQuantity = firstRowElements[1];

    const destinationList = textRows[1].split(' ').map(Number);

    const edgeDescriptions = textRows.slice(2, 2 + edgeQuantity).map(edgeStr =>
        edgeStr.split(' ').map(Number)
    );

    const adjacencyMatrix = new Map();
    for (let vertexId = 1; vertexId <= nodeQuantity; vertexId++) {
        adjacencyMatrix.set(vertexId, new Set());
    }
    edgeDescriptions.forEach(([vertexA, vertexB]) => {
        adjacencyMatrix.get(vertexA).add(vertexB);
        adjacencyMatrix.get(vertexB).add(vertexA);
    });

    return { nodeQuantity, destinationList, adjacencyMatrix };
};

const determinePathExistence = (startNode, endNode, graphStructure) => {
    const discoveryQueue = [startNode];
    const visitedSet = new Set([startNode]);

    while (discoveryQueue.length > 0) {
        const currentNode = discoveryQueue.shift();
        if (currentNode === endNode) {
            return true;
        }

        const connectedNeighbors = graphStructure.get(currentNode) || new Set();
        for (const neighborIdentifier of connectedNeighbors) {
            if (!visitedSet.has(neighborIdentifier)) {
                visitedSet.add(neighborIdentifier);
                discoveryQueue.push(neighborIdentifier);
            }
        }
    }
    return false;
};

const executeGraphAnalysis = (sourceInput) => {
    const { nodeQuantity, destinationList, adjacencyMatrix } = processRawData(sourceInput);

    let successfulRouteCount = 0;

    for (let currentVertexIndex = 0; currentVertexIndex < nodeQuantity; currentVertexIndex++) {
        const initialVertex = currentVertexIndex + 1;
        const requiredDestination = destinationList[currentVertexIndex];

        if (determinePathExistence(initialVertex, requiredDestination, adjacencyMatrix)) {
            successfulRouteCount++;
        }
    }
    console.log(successfulRouteCount);
};

executeGraphAnalysis(require('fs').readFileSync('/dev/stdin', 'utf8'));