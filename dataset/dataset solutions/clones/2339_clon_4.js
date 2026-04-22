'use strict';

function processGraphData(rawDataString) {
    const dataLines = rawDataString.trim().split('\n');

    const firstLineValues = dataLines[0].split(' ').map(Number);
    const totalVertices = firstLineValues[0];
    const initialVertex = firstLineValues[1];
    const targetVertex = firstLineValues[2];

    const edgeDefinitions = dataLines.slice(1).map(lineTxt => lineTxt.split(' ').map(Number));

    const neighborConnections = Array.from({ length: totalVertices + 1 }, () => []);

    edgeDefinitions.forEach(edgeTuple => {
        const firstPoint = edgeTuple[0];
        const secondPoint = edgeTuple[1];
        neighborConnections[firstPoint].push(secondPoint);
        neighborConnections[secondPoint].push(firstPoint);
    });

    const calculatePathLengths = (startingPoint, graphStructure) => {
        const recordedDistances = new Map();
        const traversalQueue = [];

        recordedDistances.set(startingPoint, 0);
        traversalQueue.push(startingPoint);

        let headIndex = 0;
        while (headIndex < traversalQueue.length) {
            const currentPosition = traversalQueue[headIndex++];
            const currentPathLength = recordedDistances.get(currentPosition);

            for (const connectedNode of graphStructure[currentPosition]) {
                if (!recordedDistances.has(connectedNode)) {
                    recordedDistances.set(connectedNode, currentPathLength + 1);
                    traversalQueue.push(connectedNode);
                }
            }
        }
        return recordedDistances;
    };

    const distancesFromInitial = calculatePathLengths(initialVertex, neighborConnections);
    const distancesFromTarget = calculatePathLengths(targetVertex, neighborConnections);

    const allVertexIDs = Array.from({ length: totalVertices }, (_, idx) => idx + 1);

    const relevantDistances = allVertexIDs.filter(vtx => {
        const distFromI = distancesFromInitial.get(vtx);
        const distFromT = distancesFromTarget.get(vtx);
        return distFromI !== undefined && distFromT !== undefined && distFromI < distFromT;
    }).map(vtx => distancesFromInitial.get(vtx));

    const finalOutcome = relevantDistances.length > 0 ? Math.max(...relevantDistances) : 0;

    console.log(finalOutcome);
}

processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));