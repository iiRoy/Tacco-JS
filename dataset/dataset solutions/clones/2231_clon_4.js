function parseInputData(rawInputString) {
    const lines = rawInputString.split("\n");

    const nodeCount = parseInt(lines[0], 10);
    const edgeConnections = [];
    for (let i = 1; i < nodeCount; i++) {
        const [n1, n2] = lines[i].split(" ").map(Number);
        edgeConnections.push([n1 - 1, n2 - 1]);
    }

    const restrictionCount = parseInt(lines[nodeCount], 10);
    const restrictionPairs = [];
    for (let i = nodeCount + 1; i <= nodeCount + restrictionCount; i++) {
        const [r1, r2] = lines[i].split(" ").map(Number);
        restrictionPairs.push([r1 - 1, r2 - 1]);
    }

    return { nodeCount, edgeConnections, restrictionPairs };
}

function createEdgeIdentifier(nodeA, nodeB) {
    return `${Math.min(nodeA, nodeB)}-${Math.max(nodeA, nodeB)}`;
}

function establishTreeHierarchy(totalNodes, connections) {
    const parentRegistry = new Map();
    const depthRegistry = new Map();
    const adjacencyList = new Map();

    for (let i = 0; i < totalNodes; i++) {
        adjacencyList.set(i, new Set());
    }
    for (const [u, v] of connections) {
        adjacencyList.get(u).add(v);
        adjacencyList.get(v).add(u);
    }

    const traversalQueue = [0];
    const visitedNodes = new Set([0]);
    parentRegistry.set(0, null);
    depthRegistry.set(0, 0);

    let head = 0;
    while (head < traversalQueue.length) {
        const currentVertex = traversalQueue[head++];

        for (const neighbor of adjacencyList.get(currentVertex)) {
            if (!visitedNodes.has(neighbor)) {
                visitedNodes.add(neighbor);
                parentRegistry.set(neighbor, currentVertex);
                depthRegistry.set(neighbor, depthRegistry.get(currentVertex) + 1);
                traversalQueue.push(neighbor);
            }
        }
    }

    return { parentRegistry, depthRegistry };
}

function determineEdgePath(startNode, endNode, parentRegistry, depthRegistry) {
    const pathEdgeSet = new Set();
    let currentA = startNode;
    let currentB = endNode;

    while (depthRegistry.get(currentA) > depthRegistry.get(currentB)) {
        const parentA = parentRegistry.get(currentA);
        pathEdgeSet.add(createEdgeIdentifier(currentA, parentA));
        currentA = parentA;
    }
    while (depthRegistry.get(currentB) > depthRegistry.get(currentA)) {
        const parentB = parentRegistry.get(currentB);
        pathEdgeSet.add(createEdgeIdentifier(currentB, parentB));
        currentB = parentB;
    }

    while (currentA !== currentB) {
        const parentA = parentRegistry.get(currentA);
        const parentB = parentRegistry.get(currentB);
        pathEdgeSet.add(createEdgeIdentifier(currentA, parentA));
        pathEdgeSet.add(createEdgeIdentifier(currentB, parentB));
        currentA = parentA;
        currentB = parentB;
    }

    return pathEdgeSet;
}

function computeInclusionExclusion(totalNodes, allRestrictionPaths) {
    const totalTreeEdges = totalNodes - 1;
    const totalEdgeSubsets = Math.pow(2, totalTreeEdges);
    const numConstraints = allRestrictionPaths.length;

    let inclusionExclusionSum = 0;

    for (let i = 1; i < (1 << numConstraints); i++) {
        const currentUnionOfEdges = new Set();
        let subsetCardinality = 0;

        for (let j = 0; j < numConstraints; j++) {
            if ((i >> j) & 1) {
                subsetCardinality++;
                for (const edgeId of allRestrictionPaths[j]) {
                    currentUnionOfEdges.add(edgeId);
                }
            }
        }

        const unionSize = currentUnionOfEdges.size;
        const termValue = Math.pow(2, totalTreeEdges - unionSize);

        if (subsetCardinality % 2 === 1) {
            inclusionExclusionSum += termValue;
        } else {
            inclusionExclusionSum -= termValue;
        }
    }

    return totalEdgeSubsets - inclusionExclusionSum;
}

function executeGraphAnalysis(rawInput) {
    const { nodeCount, edgeConnections, restrictionPairs } = parseInputData(rawInput);

    const { parentRegistry, depthRegistry } = establishTreeHierarchy(nodeCount, edgeConnections);

    const allRestrictionPaths = restrictionPairs.map(([u, v]) =>
        determineEdgePath(u, v, parentRegistry, depthRegistry)
    );

    const finalResult = computeInclusionExclusion(nodeCount, allRestrictionPaths);

    console.log(finalResult);
}

executeGraphAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));
