function Main(rawData) {
    const lines = rawData.split("\n");
    const nodeCount = parseInt(lines[0], 10);

    const adjacencyLists = Array.from({ length: nodeCount }, () => []);

    for (let edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++) {
        const edgeParts = lines[edgeIndex + 1].split(" ");
        const nodeA = parseInt(edgeParts[0], 10) - 1;
        const nodeB = parseInt(edgeParts[1], 10) - 1;

        adjacencyLists[nodeA].push(nodeB);
        adjacencyLists[nodeB].push(nodeA);
    }

    const calculateShortestPaths = (startNodeIdentifier, graphStructure, totalNodesCount, distanceMap) => {
        const traversalQueue = [];
        traversalQueue.push(startNodeIdentifier);

        let queueHeadPointer = 0;

        while (queueHeadPointer < traversalQueue.length) {
            const currentVertex = traversalQueue[queueHeadPointer++];

            for (const connectedVertex of graphStructure[currentVertex]) {
                if (distanceMap[connectedVertex] > distanceMap[currentVertex]) {
                    distanceMap[connectedVertex] = distanceMap[currentVertex] + 1;
                    traversalQueue.push(connectedVertex);
                }
            }
        }
        return distanceMap;
    };

    const fennecDistances = new Array(nodeCount).fill(nodeCount);
    fennecDistances[0] = 0;
    calculateShortestPaths(0, adjacencyLists, nodeCount, fennecDistances);

    const snukeDistances = new Array(nodeCount).fill(nodeCount);
    snukeDistances[nodeCount - 1] = 0;
    calculateShortestPaths(nodeCount - 1, adjacencyLists, nodeCount, snukeDistances);

    const fennecCloserNodes = Array.from({ length: nodeCount }, (_, nodeIdx) => nodeIdx)
        .filter(nodeIdx =>
            nodeIdx !== 0 &&
            nodeIdx !== nodeCount - 1 &&
            fennecDistances[nodeIdx] <= snukeDistances[nodeIdx]
        );

    const fennecAdvantageCount = fennecCloserNodes.length;
    const totalIntermediateNodes = nodeCount - 2;
    const snukeAdvantageCount = totalIntermediateNodes - fennecAdvantageCount;

    let gameOutcome = "Fennec";
    if (fennecAdvantageCount <= snukeAdvantageCount) {
        gameOutcome = "Snuke";
    }

    console.log('%s', gameOutcome);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
