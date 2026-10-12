const outputWriter = console.log;

(function setupInputProcessing() {
    if (typeof process !== "undefined") {
        let rawDataBuffer = "";
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        process.stdin.on('data', function (dataChunk) {
            rawDataBuffer += dataChunk;
        });

        process.stdin.on('end', function () {
            let inputLines = rawDataBuffer.split("\n");
            processGraphData(inputLines);
        });
    }
})();

function parseNumericLine(lineContent) {
    return lineContent.split(" ").map(Number);
}

function processGraphData(rawInputLines) {
    let lastLineContent = rawInputLines.pop();
    if (lastLineContent !== "") {
        rawInputLines.push(undefined);
    }

    const parsedNumericLines = rawInputLines.map(parseNumericLine);

    const graphDimensions = parsedNumericLines.shift();
    const numVertices = graphDimensions[0];
    const numEdges = graphDimensions[1];

    const adjList = Array.from({ length: numVertices }, () => []);
    const visitedNodes = new Array(numVertices).fill(false);
    const discoveryTime = new Array(numVertices).fill(0);
    const minReachableTime = new Array(numVertices).fill(numVertices);
    const foundBridges = Array.from({ length: numVertices }, () => []);
    const edgeVisitedInDFS = Array.from({ length: numVertices }, () => new Array(numVertices).fill(false));

    parsedNumericLines.forEach(function (currentEdge) {
        const nodeA = currentEdge[0];
        const nodeB = currentEdge[1];
        adjList[nodeA].push(nodeB);
        adjList[nodeB].push(nodeA);
    });

    let currentTimeCounter = 0;

    function findBridgesDFS(currentNodeIndex) {
        const currentVertex = currentNodeIndex;
        const isVisited = visitedNodes;
        const neighbors = adjList[currentVertex];

        isVisited[currentVertex] = true;
        discoveryTime[currentVertex] = currentTimeCounter;
        minReachableTime[currentVertex] = currentTimeCounter;
        currentTimeCounter++;

        neighbors.forEach(function (neighborNode) {
            if (!isVisited[neighborNode]) {
                edgeVisitedInDFS[currentVertex][neighborNode] = true;
                edgeVisitedInDFS[neighborNode][currentVertex] = true;
                findBridgesDFS(neighborNode);

                minReachableTime[currentVertex] = Math.min(minReachableTime[currentVertex], minReachableTime[neighborNode]);
            } else if (!edgeVisitedInDFS[neighborNode][currentVertex]) {
                minReachableTime[currentVertex] = Math.min(minReachableTime[currentVertex], discoveryTime[neighborNode]);
            }
        });
    }

    findBridgesDFS(0);

    function getOrderedEdgeNodes(node1, node2) {
        if (discoveryTime[node1] > discoveryTime[node2]) {
            return [node2, node1];
        }
        return [node1, node2];
    }

    parsedNumericLines.forEach(function (originalEdge) {
        let edgeNodeU = originalEdge[0];
        let edgeNodeV = originalEdge[1];

        const [orderedU, orderedV] = getOrderedEdgeNodes(edgeNodeU, edgeNodeV);
        edgeNodeU = orderedU;
        edgeNodeV = orderedV;

        if (discoveryTime[edgeNodeU] < minReachableTime[edgeNodeV]) {
            const bridgeMinNode = Math.min(edgeNodeU, edgeNodeV);
            const bridgeMaxNode = Math.max(edgeNodeU, edgeNodeV);
            foundBridges[bridgeMinNode].push(bridgeMaxNode);
        }
    });

    const sortedBridges = foundBridges.map(function (connectedNodes) {
        return connectedNodes.sort((a, b) => a - b);
    });

    for (let startVertex = 0; startVertex < numVertices; startVertex++) {
        const bridgePartners = sortedBridges[startVertex];
        const partnerCount = bridgePartners.length;

        for (let partnerIndex = 0; partnerIndex < partnerCount; partnerIndex++) {
            const endVertex = bridgePartners[partnerIndex];
            outputWriter(`${startVertex} ${endVertex}`);
        }
    }
}
