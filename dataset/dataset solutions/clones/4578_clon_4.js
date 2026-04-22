"use strict";

const operateGraphData = (sourceText) => {
    const dataLines = sourceText.trim().split("\n");

    const [totalVerticesStr, totalEdgesStr] = dataLines[0].split(" ");
    const totalVertices = Number(totalVerticesStr);
    const totalEdges = Number(totalEdgesStr);

    const vertexDegrees = dataLines.slice(1, totalEdges + 1).reduce((accumulatorMap, edgeDescription) => {
        const [nodeAStr, nodeBStr] = edgeDescription.split(" ");
        const nodeA = Number(nodeAStr);
        const nodeB = Number(nodeBStr);

        accumulatorMap.set(nodeA, (accumulatorMap.get(nodeA) || 0) + 1);
        accumulatorMap.set(nodeB, (accumulatorMap.get(nodeB) || 0) + 1);
        return accumulatorMap;
    }, new Map());

    for (let currentVertexIdentifier = 1; currentVertexIdentifier <= totalVertices; currentVertexIdentifier++) {
        if (!vertexDegrees.has(currentVertexIdentifier)) {
            vertexDegrees.set(currentVertexIdentifier, 0);
        }
    }

    for (let currentVertexIdentifier = 1; currentVertexIdentifier <= totalVertices; currentVertexIdentifier++) {
        outputValue(vertexDegrees.get(currentVertexIdentifier));
    }
};

const outputValue = (val) => {
    process.stdout.write(String(val) + '\n');
};

operateGraphData(require('fs').readFileSync('/dev/stdin', 'utf8'));