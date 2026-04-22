"use strict";

let fullInputDataBuffer = '';

process.stdin.on('data', (inputChunk) => {
    fullInputDataBuffer += inputChunk;
});

process.stdin.setEncoding('utf8');
process.stdin.resume();

const extractNumbersFromString = (rawLine) => {
    return rawLine.trim().split(/\s+/).map(Number);
};

process.stdin.on('end', () => {
    const processedInputLines = fullInputDataBuffer.split('\n').filter(line => line.trim() !== '');

    if (processedInputLines.length === 0) {
        console.error("Error: No input data provided.");
        return;
    }

    const graphDimensions = extractNumbersFromString(processedInputLines[0]);
    if (graphDimensions.length < 2) {
        console.error("Error: Insufficient graph dimension data.");
        return;
    }

    const numVertices = graphDimensions[0];
    const totalEdges = graphDimensions[1];

    if (numVertices <= 0 || totalEdges < 0) {
        console.error("Error: Invalid graph dimensions (vertices <= 0 or edges < 0).");
        return;
    }

    let currentEdgeList = processedInputLines.slice(1).map(line => extractNumbersFromString(line));

    if (currentEdgeList.length !== totalEdges) {
        console.warn(`Warning: Declared ${totalEdges} edges but found ${currentEdgeList.length} edge lines.`);
    }

    const adjacencyStructure = Array.from({ length: numVertices }, () => []);

    for (const edgePair of currentEdgeList) {
        if (edgePair.length < 2) {
            console.warn(`Skipping malformed edge line: ${edgePair}`);
            continue;
        }
        let u = edgePair[0];
        let v = edgePair[1];

        u--;
        v--;

        if (u < 0 || u >= numVertices || v < 0 || v >= numVertices) {
            console.warn(`Skipping edge (${u+1}, ${v+1}) due to out-of-bounds nodes for a graph of ${numVertices} vertices.`);
            continue;
        }

        adjacencyStructure[u].push(v);
        adjacencyStructure[v].push(u);
    }

    let detectedCircuits = [];

    for (let startNodeIndex = 0; startNodeIndex < numVertices; ++startNodeIndex) {
        let pathQueue = adjacencyStructure[startNodeIndex].map(neighbor => [startNodeIndex, neighbor]);
        let nodesVisitedInPathSearch = new Set();
        nodesVisitedInPathSearch.add(startNodeIndex);

        while (pathQueue.length > 0) {
            let nextPathQueueLevel = [];

            for (const currentPath of pathQueue) {
                const pathEndNode = currentPath[currentPath.length - 1];
                const pathSecondToLastNode = currentPath.length >= 2 ? currentPath[currentPath.length - 2] : -1;

                const potentialNextNodes = adjacencyStructure[pathEndNode].filter(neighborNode => {
                    if (neighborNode === pathSecondToLastNode) return false;
                    if (currentPath.includes(neighborNode)) return false;
                    return !nodesVisitedInPathSearch.has(neighborNode) || neighborNode === startNodeIndex;
                });

                for (const nextValidNeighbor of potentialNextNodes) {
                    const extendedPath = [...currentPath, nextValidNeighbor];

                    if (nextValidNeighbor === startNodeIndex) {
                        if (extendedPath.length > 2) {
                            detectedCircuits.push(extendedPath);
                        }
                    } else {
                        nextPathQueueLevel.push(extendedPath);
                        nodesVisitedInPathSearch.add(nextValidNeighbor);
                    }
                }
            }
            pathQueue = nextPathQueueLevel;
        }
    }

    const isEdgeMatchingCycleSegment = (edge, cycleNode1, cycleNode2) => {
        return (edge[0] === cycleNode1 && edge[1] === cycleNode2) ||
               (edge[0] === cycleNode2 && edge[1] === cycleNode1);
    };

    for (const currentCycle of detectedCircuits) {
        for (let nodeIdx = 0; nodeIdx < currentCycle.length - 1; ++nodeIdx) {
            const nodeA = currentCycle[nodeIdx];
            const nodeB = currentCycle[(nodeIdx + 1) % currentCycle.length];

            currentEdgeList = currentEdgeList.filter(existingEdge => {
                return !isEdgeMatchingCycleSegment(existingEdge, nodeA, nodeB);
            });
        }
    }

    console.log(currentEdgeList.length);
});