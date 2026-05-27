'use strict';

const processInputData = (rawData) => {
    const lines = rawData.trim().split('\n');
    const [nodeCount, startNodeA, startNodeB] = lines[0].split(/\s+/).map(Number);
    const edgePairs = lines.slice(1).map(line => line.split(/\s+/).map(Number));
    return { nodeCount, startNodeA, startNodeB, edgePairs };
};

const buildAdjacencyGraph = (edgeList, totalNodes) => {
    const adjacencyMap = new Map();
    for (let i = 1; i <= totalNodes; ++i) {
        adjacencyMap.set(i, []);
    }

    edgeList.forEach(pair => {
        const [nodeOne, nodeTwo] = pair;
        adjacencyMap.get(nodeOne).push(nodeTwo);
        adjacencyMap.get(nodeTwo).push(nodeOne);
    });
    return adjacencyMap;
};

const computeDistancesBFS = (initialNode, graphStructure, totalNodes) => {
    const distanceRegistry = new Array(totalNodes + 1).fill(-1); // -1 indicates unvisited
    const traversalQueue = [];

    traversalQueue.push(initialNode);
    distanceRegistry[initialNode] = 0;

    let queuePointer = 0;
    while (queuePointer < traversalQueue.length) {
        const currentVertex = traversalQueue[queuePointer++];
        const currentDepth = distanceRegistry[currentVertex];

        const neighbors = graphStructure.get(currentVertex) || [];
        for (const adjacentVertex of neighbors) {
            if (distanceRegistry[adjacentVertex] === -1) { // If unvisited
                distanceRegistry[adjacentVertex] = currentDepth + 1;
                traversalQueue.push(adjacentVertex);
            }
        }
    }
    return distanceRegistry;
};

const determineResult = (calculatedDistances) => {
    // The original code's 'distA' array remains all zeros.
    // The condition 'distA[i] < distB[i]' simplifies to '0 < distB[i]'.
    // Thus, we need to find the maximum of (distance - 1) for all nodes
    // that have a positive distance from the starting node 'v'.
    // If no such nodes exist (e.g., 'v' is isolated), the result should be 0.
    return Math.max(0, ...calculatedDistances.filter(d => d > 0).map(d => d - 1));
};

const entryPoint = (inputString) => {
    const { nodeCount, startNodeA, startNodeB, edgePairs } = processInputData(inputString);
    const graph = buildAdjacencyGraph(edgePairs, nodeCount);
    // Only distances from startNodeB (original 'v') are relevant for the final calculation
    // due to the original code's specific DFS calls and comparison logic.
    const distancesFromB = computeDistancesBFS(startNodeB, graph, nodeCount);
    const finalOutcome = determineResult(distancesFromB);
    console.log(finalOutcome);
};

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
