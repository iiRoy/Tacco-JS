function processGraphData(inputString) {
    const graphLines = inputString.split('\n');
    const [vertexCount, edgeCount] = graphLines[0].split(' ').map(Number);

    const adjacencies = Array.from({ length: vertexCount }, () => new Set());

    for (let i = 0; i < edgeCount; i++) {
        const [firstNode, secondNode] = graphLines[i + 1].split(' ').map(val => Number(val) - 1);
        adjacencies[firstNode].add(secondNode);
        adjacencies[secondNode].add(firstNode);
    }

    let minimumDegreeValue = Infinity;
    let minimumDegreeVertexIdentifier = -1;

    const vertexDegrees = Array.from({ length: vertexCount }, (_, idx) => adjacencies[idx].size);

    vertexDegrees.forEach((currentDegree, currentIdx) => {
        if (currentDegree < minimumDegreeValue) {
            minimumDegreeValue = currentDegree;
            minimumDegreeVertexIdentifier = currentIdx;
        }
    });

    const neighborsOfMinVertex = Array.from(adjacencies[minimumDegreeVertexIdentifier]);
    const nonNeighborsOfMinVertex = Array.from({ length: vertexCount }, (_, idx) => idx)
        .filter(idx => idx !== minimumDegreeVertexIdentifier && !adjacencies[minimumDegreeVertexIdentifier].has(idx));

    const verifyNodeSetIsClique = (nodesToExamine, graphAdjacencyLists) => {
        if (nodesToExamine.length <= 1) return true;
        return nodesToExamine.every((nodeA, indexA) =>
            nodesToExamine.slice(indexA + 1).every(nodeB =>
                graphAdjacencyLists[nodeA].has(nodeB)
            )
        );
    };

    const firstPotentialClique = [minimumDegreeVertexIdentifier, ...neighborsOfMinVertex];
    const secondPotentialClique = nonNeighborsOfMinVertex;

    if (!verifyNodeSetIsClique(firstPotentialClique, adjacencies) || !verifyNodeSetIsClique(secondPotentialClique, adjacencies)) {
        console.log(-1);
        return;
    }

    const cliqueOneSize = minimumDegreeValue + 1;
    const cliqueTwoSize = vertexCount - cliqueOneSize;
    const totalGraphEdges = (cliqueOneSize * (cliqueOneSize - 1) / 2) + (cliqueTwoSize * (cliqueTwoSize - 1) / 2);
    console.log(totalGraphEdges);
}

processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
