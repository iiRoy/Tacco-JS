function calculateShortestPaths(startNodeIdentifier, totalNodes, adjacencyStructure) {
    const pathLengths = new Array(totalNodes).fill(totalNodes);
    pathLengths[startNodeIdentifier] = 0;

    const traversalQueue = [startNodeIdentifier];
    let queuePointer = 0;

    while (queuePointer < traversalQueue.length) {
        const currentVertex = traversalQueue[queuePointer++];

        for (const neighborVertex of adjacencyStructure[currentVertex]) {
            if (pathLengths[neighborVertex] === totalNodes) {
                pathLengths[neighborVertex] = pathLengths[currentVertex] + 1;
                traversalQueue.push(neighborVertex);
            }
        }
    }
    return pathLengths;
}

function processGraphData(rawData) {
    const lines = rawData.split("\n");
    const nodeCount = parseInt(lines[0]);

    const adjacencyList = Array.from({ length: nodeCount }, () => []);
    for (let edgeIndex = 1; edgeIndex < nodeCount; edgeIndex++) {
        const edgeParts = lines[edgeIndex].split(" ");
        const nodeA = parseInt(edgeParts[0]) - 1;
        const nodeB = parseInt(edgeParts[1]) - 1;
        adjacencyList[nodeA].push(nodeB);
        adjacencyList[nodeB].push(nodeA);
    }

    const distancesFromStart = calculateShortestPaths(0, nodeCount, adjacencyList);
    const distancesFromEnd = calculateShortestPaths(nodeCount - 1, nodeCount, adjacencyList);

    const closerToStartCount = Array.from({ length: nodeCount })
        .reduce((count, _, nodeIndex) => {
            if (nodeIndex !== 0 && nodeIndex !== nodeCount - 1) {
                if (distancesFromStart[nodeIndex] <= distancesFromEnd[nodeIndex]) {
                    return count + 1;
                }
            }
            return count;
        }, 0);

    let gameResult = "Fennec";
    if (closerToStartCount <= (nodeCount - 2 - closerToStartCount)) {
        gameResult = "Snuke";
    }

    console.log('%s', gameResult);
}

processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
