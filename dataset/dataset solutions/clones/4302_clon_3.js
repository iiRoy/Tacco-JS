const processInputAndSolve = (inputData) => {
    const lines = inputData.trim().split("\n");

    const [nodeCount, edgeCount] = lines[0].split(" ").map(Number);

    const graphAdjacencyMap = new Map();

    for (let edgeIdentifier = 1; edgeIdentifier <= edgeCount; edgeIdentifier++) {
        const [nodeA, nodeB] = lines[edgeIdentifier].split(" ").map(Number);

        if (!graphAdjacencyMap.has(nodeA)) {
            graphAdjacencyMap.set(nodeA, new Map());
        }
        if (!graphAdjacencyMap.has(nodeB)) {
            graphAdjacencyMap.set(nodeB, new Map());
        }

        graphAdjacencyMap.get(nodeA).set(nodeB, edgeIdentifier);
        graphAdjacencyMap.get(nodeB).set(nodeA, edgeIdentifier);
    }

    let bridgeCandidateCount = 0;
    const expectedTotalNodes = nodeCount;

    for (let currentEdgeIndex = 1; currentEdgeIndex <= edgeCount; currentEdgeIndex++) {
        const reachableNodeCount = calculateReachableNodesExcludingEdge(graphAdjacencyMap, currentEdgeIndex);
        if (reachableNodeCount !== expectedTotalNodes) {
            bridgeCandidateCount++;
        }
    }

    console.log(bridgeCandidateCount);
};

const calculateReachableNodesExcludingEdge = (graphStructure, excludedEdgeId) => {
    const traversalQueue = [1];
    const visitedNodes = new Set();

    while (traversalQueue.length > 0) {
        const currentNode = traversalQueue.shift();

        if (visitedNodes.has(currentNode)) {
            continue;
        }
        visitedNodes.add(currentNode);

        const neighborsMap = graphStructure.get(currentNode);
        if (neighborsMap) {
            for (const [neighborNode, edgeId] of neighborsMap.entries()) {
                if (edgeId !== excludedEdgeId) {
                    traversalQueue.push(neighborNode);
                }
            }
        }
    }
    return visitedNodes.size;
};

processInputAndSolve(require("fs").readFileSync("/dev/stdin", "utf8"));
