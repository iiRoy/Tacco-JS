'use strict';

function processGraphData(inputData) {
    const inputLines = inputData.trim().split('\n');
    const [nodeCount, startNodeA, startNodeB] = inputLines[0].split(' ').map(Number);
    const edgePairs = inputLines.slice(1).map(line => line.split(' ').map(Number));

    const graphAdjacency = new Map();
    for (let i = 1; i <= nodeCount; ++i) {
        graphAdjacency.set(i, []);
    }

    for (const [nodeX, nodeY] of edgePairs) {
        graphAdjacency.get(nodeX).push(nodeY);
        graphAdjacency.get(nodeY).push(nodeX);
    }

    const calculateShortestPaths = (initialPoint, graphStructure, totalNodes) => {
        const pathDistances = new Array(totalNodes + 1).fill(Infinity);
        const traversalQueue = [];

        pathDistances[initialPoint] = 0;
        traversalQueue.push(initialPoint);

        let queuePointer = 0;
        while (queuePointer < traversalQueue.length) {
            const currentVertex = traversalQueue[queuePointer++];
            const adjacentVertices = graphStructure.get(currentVertex) || [];

            for (const neighborVertex of adjacentVertices) {
                if (pathDistances[neighborVertex] === Infinity) {
                    pathDistances[neighborVertex] = pathDistances[currentVertex] + 1;
                    traversalQueue.push(neighborVertex);
                }
            }
        }
        return pathDistances;
    };

    const distancesFromStartA = calculateShortestPaths(startNodeA, graphAdjacency, nodeCount);
    const distancesFromStartB = calculateShortestPaths(startNodeB, graphAdjacency, nodeCount);

    const finalMaximum = Array.from({ length: nodeCount }, (_, index) => index + 1).reduce((currentMaxVal, vertexIndex) => {
        if (distancesFromStartA[vertexIndex] < distancesFromStartB[vertexIndex]) {
            return Math.max(currentMaxVal, distancesFromStartB[vertexIndex] - 1);
        }
        return currentMaxVal;
    }, 0);

    console.log(finalMaximum);
}

processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
