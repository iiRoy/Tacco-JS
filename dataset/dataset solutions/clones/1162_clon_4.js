const printOutput = console.log;

if (typeof process !== "undefined") {
    let rawInputData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
        rawInputData += chunk;
    });
    process.stdin.on('end', () => {
        processGraphData(rawInputData);
    });
}

function processGraphData(inputString) {
    const rawLines = inputString.split("\n");
    const filteredLines = rawLines.filter(line => line.trim() !== '');

    const numericLines = filteredLines.map(line =>
        line.split(" ").map(Number)
    );

    const graphDimensions = numericLines[0];
    const nodeCount = graphDimensions[0];
    const edgeCount = graphDimensions[1];

    const edgeDescriptions = numericLines.slice(1);

    const adjacencyList = Array.from({ length: nodeCount }, () => []);
    const visitedNodes = Array.from({ length: nodeCount }, () => false);
    const discoveryOrder = Array.from({ length: nodeCount }, () => 0);
    const lowestReachableOrder = Array.from({ length: nodeCount }, () => nodeCount);
    const identifiedBridges = Array.from({ length: nodeCount }, () => []);

    for (const currentEdge of edgeDescriptions) {
        const nodeA = currentEdge[0];
        const nodeB = currentEdge[1];
        adjacencyList[nodeA].push(nodeB);
        adjacencyList[nodeB].push(nodeA);
    }

    const timeCounterRef = { value: 0 };

    const exploreGraphIteratively = (startNode, initialParent) => {
        const dfsTraversalStack = [];
        dfsTraversalStack.push({ currentVertex: startNode, parentVertex: initialParent, neighborCursor: -1 });

        while (dfsTraversalStack.length > 0) {
            const currentFrame = dfsTraversalStack[dfsTraversalStack.length - 1];
            const currentVertex = currentFrame.currentVertex;
            const parentVertex = currentFrame.parentVertex;

            if (currentFrame.neighborCursor === -1) {
                visitedNodes[currentVertex] = true;
                discoveryOrder[currentVertex] = timeCounterRef.value;
                lowestReachableOrder[currentVertex] = timeCounterRef.value;
                timeCounterRef.value++;
                currentFrame.neighborCursor = 0;
            } else if (currentFrame.neighborCursor < adjacencyList[currentVertex].length) {
                const neighbors = adjacencyList[currentVertex];
                const nextNeighbor = neighbors[currentFrame.neighborCursor];

                currentFrame.neighborCursor++;

                if (nextNeighbor === parentVertex) {
                    continue;
                }

                if (visitedNodes[nextNeighbor]) {
                    lowestReachableOrder[currentVertex] = Math.min(lowestReachableOrder[currentVertex], nextNeighbor);
                } else {
                    dfsTraversalStack.push({ currentVertex: nextNeighbor, parentVertex: currentVertex, neighborCursor: -1 });
                }
            } else {
                dfsTraversalStack.pop();
                if (dfsTraversalStack.length > 0) {
                    const parentOfCurrent = dfsTraversalStack[dfsTraversalStack.length - 1].currentVertex;
                    lowestReachableOrder[parentOfCurrent] = Math.min(lowestReachableOrder[parentOfCurrent], lowestReachableOrder[currentVertex]);
                }
            }
        }
    };

    exploreGraphIteratively(0, nodeCount);

    for (const currentEdge of edgeDescriptions) {
        let vertexOne = currentEdge[0];
        let vertexTwo = currentEdge[1];

        if (discoveryOrder[vertexOne] > discoveryOrder[vertexTwo]) {
            const temporaryHolder = vertexOne;
            vertexOne = vertexTwo;
            vertexTwo = temporaryHolder;
        }

        if (discoveryOrder[vertexOne] < lowestReachableOrder[vertexTwo]) {
            const smallerNode = Math.min(vertexOne, vertexTwo);
            const largerNode = Math.max(vertexOne, vertexTwo);
            identifiedBridges[smallerNode].push(largerNode);
        }
    }

    const outputLines = identifiedBridges.flatMap((targets, sourceNode) => {
        targets.sort((a, b) => a - b);
        return targets.map(targetNode => `${sourceNode} ${targetNode}`);
    });

    outputLines.forEach(printOutput);
}
