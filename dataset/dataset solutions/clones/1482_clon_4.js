function parseRawText(inputContent) {
    const inputLines = inputContent.trim().split('\n').map(line => line.split(' ').map(Number));
    const totalVertices = inputLines[0][0];
    const totalEdges = inputLines[0][1];
    const edgeDescriptions = inputLines.slice(1).map(pair => [pair[0] - 1, pair[1] - 1]);
    return { totalVertices, totalEdges, edgeDescriptions };
}

function discoverComponents(numVertices, edgesInfo) {
    const connectionScheme = Array(numVertices).fill(null).map(() => []);
    for (const [nodeA, nodeB] of edgesInfo) {
        connectionScheme[nodeA].push(nodeB);
        connectionScheme[nodeB].push(nodeA);
    }

    const discoveredVertices = new Array(numVertices).fill(false);
    let componentTally = 0;

    function depthFirstSearch(currentVertex) {
        discoveredVertices[currentVertex] = true;
        for (const neighborVertex of connectionScheme[currentVertex]) {
            if (!discoveredVertices[neighborVertex]) {
                depthFirstSearch(neighborVertex);
            }
        }
    }

    for (let vertexIndex = 0; vertexIndex < numVertices; vertexIndex++) {
        if (!discoveredVertices[vertexIndex]) {
            componentTally++;
            depthFirstSearch(vertexIndex);
        }
    }
    return componentTally;
}

function computeNetworkMetric(sourceData) {
    const { totalVertices, totalEdges, edgeDescriptions } = parseRawText(sourceData);

    const numberOfComponents = discoverComponents(totalVertices, edgeDescriptions);

    const finalOutcome = numberOfComponents - 1;
    console.log(finalOutcome);
}

computeNetworkMetric(require("fs").readFileSync("/dev/stdin", "utf8"));