let inputBuffer = "";

process.stdin.on('data', chunk => {
    inputBuffer += chunk.toString();
});

process.stdin.on('end', () => {
    const inputLines = inputBuffer.trim().split('\n');

    const parseLineNumbers = (textLine) => textLine.split(' ').map(Number);

    const totalVertices = parseInt(inputLines.shift(), 10);
    
    const adjacencyMapping = new Map();
    for (let currentIdentifier = 1; currentIdentifier <= totalVertices; ++currentIdentifier) {
        adjacencyMapping.set(currentIdentifier, new Map());
    }

    const rawEdgeData = [];
    for (let current = 0; current < totalVertices - 1; ++current) {
        rawEdgeData.push(parseLineNumbers(inputLines.shift()));
    }

    const [numberOfRequests, pivotalNode] = parseLineNumbers(inputLines.shift());

    for (const [nodeOne, nodeTwo, weightValue] of rawEdgeData) {
        if (nodeTwo !== pivotalNode) {
            adjacencyMapping.get(nodeOne).set(nodeTwo, weightValue);
        }
        if (nodeOne !== pivotalNode) {
            adjacencyMapping.get(nodeTwo).set(nodeOne, weightValue);
        }
    }

    const shortestPathValues = new Map();
    const explorationQueue = []; 

    shortestPathValues.set(pivotalNode, 0);
    explorationQueue.push(pivotalNode);

    let queueHead = 0;
    while (queueHead < explorationQueue.length) {
        const currentPoint = explorationQueue[queueHead++];
        const currentAccumulatedDistance = shortestPathValues.get(currentPoint);

        for (const [connectedPoint, connectionCost] of adjacencyMapping.get(currentPoint).entries()) {
            if (!shortestPathValues.has(connectedPoint)) { 
                shortestPathValues.set(connectedPoint, currentAccumulatedDistance + connectionCost);
                explorationQueue.push(connectedPoint);
            }
        }
    }
    
    const finalCalculations = [];
    for (let current = 0; current < numberOfRequests; ++current) {
        const [firstQueryTarget, secondQueryTarget] = parseLineNumbers(inputLines.shift());
        const combinedDistance = shortestPathValues.get(firstQueryTarget) + shortestPathValues.get(secondQueryTarget);
        finalCalculations.push(combinedDistance);
    }

    process.stdout.write(finalCalculations.join('\n'));
});