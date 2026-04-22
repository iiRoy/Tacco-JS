'use strict';

function processGraphQuery(rawData) {
    const graphLines = rawData.split(/\r?\n/).filter(line => line.length > 0);

    const initialParameters = graphLines[0].split(' ').map(Number);
    const totalVertices = initialParameters[0];
    const initialPointA = initialParameters[1];
    const initialPointB = initialParameters[2];

    const graphConnections = new Map();
    for (let nodeIdentifier = 1; nodeIdentifier <= totalVertices; ++nodeIdentifier) {
        graphConnections.set(nodeIdentifier, new Set());
    }

    const edgeSegments = graphLines.slice(1);
    for (const segment of edgeSegments) {
        const [nodeX, nodeY] = segment.split(' ').map(Number);
        graphConnections.get(nodeX).add(nodeY);
        graphConnections.get(nodeY).add(nodeX);
    }

    const computeShortestPaths = (originNode, topology, vertexTotal) => {
        const pathDistances = new Array(vertexTotal + 1).fill(Infinity);
        const visitQueue = [];

        pathDistances[originNode] = 0;
        visitQueue.push(originNode);

        let queueHead = 0;
        while (queueHead < visitQueue.length) {
            const currentVertex = visitQueue[queueHead++];
            const currentPathLength = pathDistances[currentVertex];

            for (const adjacentVertex of topology.get(currentVertex)) {
                if (pathDistances[adjacentVertex] === Infinity) {
                    pathDistances[adjacentVertex] = currentPathLength + 1;
                    visitQueue.push(adjacentVertex);
                }
            }
        }
        return pathDistances;
    };

    const lengthsFromA = computeShortestPaths(initialPointA, graphConnections, totalVertices);
    const lengthsFromB = computeShortestPaths(initialPointB, graphConnections, totalVertices);

    let ultimateMaximum = 0;
    for (let vertexIndex = 1; vertexIndex <= totalVertices; ++vertexIndex) {
        if (lengthsFromA[vertexIndex] < lengthsFromB[vertexIndex]) {
            ultimateMaximum = Math.max(ultimateMaximum, lengthsFromB[vertexIndex] - 1);
        }
    }

    console.log(ultimateMaximum);
}

processGraphQuery(require("fs").readFileSync("/dev/stdin", "utf8"));