"use strict";
const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const numericTokens = fileContent.trim().split(/\s+/).map(Number);

function processGraphTraversal() {
    let tokenCursor = 0;
    const nodeCount = numericTokens[tokenCursor++];
    const edgeCount = numericTokens[tokenCursor++];

    const adjacencyStructure = new Map();
    for (let i = 1; i <= nodeCount; i++) {
        adjacencyStructure.set(i, new Set());
    }

    for (let i = 0; i < edgeCount; i++) {
        const originNode = numericTokens[tokenCursor++];
        const destinationNode = numericTokens[tokenCursor++];
        adjacencyStructure.get(originNode).add(destinationNode);
        adjacencyStructure.get(destinationNode).add(originNode);
    }

    const predecessorMap = new Map();
    const exploredNodes = new Set();
    const discoveryQueue = [];

    // Initiate Breadth-First Search from node 1
    const initialNode = 1;
    discoveryQueue.push(initialNode);
    exploredNodes.add(initialNode);

    while (discoveryQueue.length > 0) {
        const currentVertex = discoveryQueue.shift();
        const connectedVertices = adjacencyStructure.get(currentVertex);

        if (connectedVertices) {
            for (const adjacentVertex of connectedVertices) {
                if (!exploredNodes.has(adjacentVertex)) {
                    exploredNodes.add(adjacentVertex);
                    predecessorMap.set(adjacentVertex, currentVertex);
                    discoveryQueue.push(adjacentVertex);
                }
            }
        }
    }

    const resultLines = ["Yes"];
    for (let i = 2; i <= nodeCount; i++) {
        resultLines.push(predecessorMap.get(i));
    }

    console.log(resultLines.join("\n"));
}

processGraphTraversal();
