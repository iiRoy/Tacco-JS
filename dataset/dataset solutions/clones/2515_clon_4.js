function performAnalysis() {
    const vertexCount = nextInt();
    const graphConnections = new Map();
    const inputMatrix = [];

    for (let i = 0; i < vertexCount; i++) {
        graphConnections.set(i, new Set());
        inputMatrix.push(nextCharArray());
    }

    for (let i = 0; i < vertexCount; i++) {
        const rowData = inputMatrix[i];
        for (let j = 0; j < vertexCount; j++) {
            if (i !== j && rowData[j] === "1") {
                graphConnections.get(i).add(j);
            }
        }
    }

    function explorePaths(graphStructure, startNodeIndex) {
        const pathDistances = new Map();
        const nodesToVisit = [{ node: startNodeIndex, dist: 0 }];
        const alreadyVisited = new Set([startNodeIndex]);
        pathDistances.set(startNodeIndex, 0);

        let currentFarthestNode = startNodeIndex;
        let greatestDistance = 0;
        let head = 0;

        while (head < nodesToVisit.length) {
            const { node: currentVertex, dist: currentDist } = nodesToVisit[head++];

            if (currentDist > greatestDistance) {
                greatestDistance = currentDist;
                currentFarthestNode = currentVertex;
            }

            const adjacentVertices = graphStructure.get(currentVertex) || new Set();
            for (const neighborVertex of adjacentVertices) {
                if (!alreadyVisited.has(neighborVertex)) {
                    alreadyVisited.add(neighborVertex);
                    pathDistances.set(neighborVertex, currentDist + 1);
                    nodesToVisit.push({ node: neighborVertex, dist: currentDist + 1 });
                }
            }
        }
        return { pathDistances, currentFarthestNode, greatestDistance };
    }

    const firstTraversalOutput = explorePaths(graphConnections, 0);
    const farthestFromInitial = firstTraversalOutput.currentFarthestNode;

    const finalTraversalOutput = explorePaths(graphConnections, farthestFromInitial);
    const finalDistancesMap = finalTraversalOutput.pathDistances;
    let finalMaximumDistance = finalTraversalOutput.greatestDistance;

    let finalResult = finalMaximumDistance;
    let problemDetected = false;

    Array.from({ length: vertexCount }).some((_, idx1) => {
        return Array.from({ length: vertexCount }).some((_, idx2) => {
            if (idx1 < idx2) {
                const distA = finalDistancesMap.get(idx1);
                const distB = finalDistancesMap.get(idx2);

                const isDirectlyConnected = graphConnections.get(idx1).has(idx2) || graphConnections.get(idx2).has(idx1);

                if (distA === distB && isDirectlyConnected) {
                    finalResult = -1;
                    problemDetected = true;
                    return true;
                }
            }
            return false;
        });
    });

    myout(finalResult);
}