function processGraphData(rawData) {
    const dataLines = rawData.trim().split('\n');
    const vertexCount = Number(dataLines[0]);

    const graphAdjacencyList = Array.from({ length: vertexCount }, () => []);
    for (let edgeIndex = 1; edgeIndex < dataLines.length; edgeIndex++) {
        const [nodeOne, nodeTwo] = dataLines[edgeIndex].split(' ').map(Number);
        const zeroIndexedNodeOne = nodeOne - 1;
        const zeroIndexedNodeTwo = nodeTwo - 1;
        graphAdjacencyList[zeroIndexedNodeOne].push(zeroIndexedNodeTwo);
        graphAdjacencyList[zeroIndexedNodeTwo].push(zeroIndexedNodeOne);
    }

    function computeShortestPaths(originVertexIdentifier, totalNodesInGraph, adjacentNodesStructure) {
        const distances = new Array(totalNodesInGraph).fill(Infinity);
        distances[originVertexIdentifier] = 0;

        const explorationQueue = [originVertexIdentifier];
        let queueHead = 0;

        while (queueHead < explorationQueue.length) {
            const currentProcessingNode = explorationQueue[queueHead++];

            for (const adjacentVertex of adjacentNodesStructure[currentProcessingNode]) {
                if (distances[adjacentVertex] === Infinity) {
                    distances[adjacentVertex] = distances[currentProcessingNode] + 1;
                    explorationQueue.push(adjacentVertex);
                }
            }
        }
        return distances;
    }

    const firstPlayerDistances = computeShortestPaths(0, vertexCount, graphAdjacencyList);
    const secondPlayerDistances = computeShortestPaths(vertexCount - 1, vertexCount, graphAdjacencyList);

    let firstPlayerControlledRegions = 0;

    for (let nodeIndex = 1; nodeIndex < vertexCount - 1; nodeIndex++) {
        if (firstPlayerDistances[nodeIndex] <= secondPlayerDistances[nodeIndex]) {
            firstPlayerControlledRegions++;
        }
    }

    const totalPlayableNodes = vertexCount - 2;
    const secondPlayerControlledRegions = totalPlayableNodes - firstPlayerControlledRegions;

    let finalVictor = "Fennec";
    if (firstPlayerControlledRegions <= secondPlayerControlledRegions) {
        finalVictor = "Snuke";
    }

    process.stdout.write(finalVictor + '\n');
}

processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));