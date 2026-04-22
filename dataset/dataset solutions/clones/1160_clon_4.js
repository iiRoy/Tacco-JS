'use strict';

const MAX_NODES_LIMIT = 100000;
const LARGE_NUMBER = Number.POSITIVE_INFINITY / 4;

let totalNodes, totalEdges, initialVertex;
let adjacencyListMap;
let shortestPathCosts;

function computeShortestPaths(startingVertex) {
    shortestPathCosts = Array(totalNodes).fill(LARGE_NUMBER);
    shortestPathCosts[startingVertex] = 0;

    const finalizedNodes = new Set();

    for (let k = 0; k < totalNodes; ++k) {
        let currentClosestNode = -1;
        let minCurrentCost = LARGE_NUMBER;

        for (let nodeIdx = 0; nodeIdx < totalNodes; ++nodeIdx) {
            if (!finalizedNodes.has(nodeIdx) && shortestPathCosts[nodeIdx] < minCurrentCost) {
                minCurrentCost = shortestPathCosts[nodeIdx];
                currentClosestNode = nodeIdx;
            }
        }

        if (currentClosestNode === -1) {
            break;
        }

        finalizedNodes.add(currentClosestNode);

        const neighbors = adjacencyListMap.get(currentClosestNode) || [];
        for (const edge of neighbors) {
            const destinationNode = edge.destination;
            const edgeWeight = edge.weight;

            if (shortestPathCosts[currentClosestNode] !== LARGE_NUMBER &&
                shortestPathCosts[currentClosestNode] + edgeWeight < shortestPathCosts[destinationNode]) {
                shortestPathCosts[destinationNode] = shortestPathCosts[currentClosestNode] + edgeWeight;
            }
        }
    }
}

(function processInputAndRun(inputData) {
    const inputLines = inputData.trim().split('\n');
    let isFirstLine = true;

    for (let lineIndex = 0; lineIndex < inputLines.length; ++lineIndex) {
        const numericValues = inputLines[lineIndex].split(' ').map(Number);

        if (isFirstLine) {
            totalNodes = numericValues[0];
            totalEdges = numericValues[1];
            initialVertex = numericValues[2];

            adjacencyListMap = new Map();
            for (let i = 0; i < totalNodes; ++i) {
                adjacencyListMap.set(i, []);
            }
        } else {
            const source = numericValues[0];
            const target = numericValues[1];
            const cost = numericValues[2];
            
            if (!adjacencyListMap.has(source)) {
                adjacencyListMap.set(source, []);
            }
            adjacencyListMap.get(source).push({ destination: target, weight: cost });
        }

        isFirstLine = false;
    }

    computeShortestPaths(initialVertex);

    shortestPathCosts.forEach(function(val) {
        console.log(val === LARGE_NUMBER ? "INF" : val);
    });

})(require('fs').readFileSync('/dev/stdin', 'utf8'));