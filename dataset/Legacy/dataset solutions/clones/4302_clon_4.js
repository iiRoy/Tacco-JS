function processGraphData(inputLines) {
    const [nodeQuantity, edgeQuantity] = inputLines[0].split(" ").map(Number);

    const allGraphEdges = [];
    for (let k = 1; k <= edgeQuantity; k++) {
        const [nodeA, nodeB] = inputLines[k].split(" ").map(Number);
        allGraphEdges.push({ first: nodeA, second: nodeB, identifier: k });
    }

    let disconnectedEdgeCount = 0;
    for (let currentEdgeId = 1; currentEdgeId <= edgeQuantity; currentEdgeId++) {
        if (countReachableNodes(nodeQuantity, allGraphEdges, currentEdgeId) !== nodeQuantity) {
            disconnectedEdgeCount++;
        }
    }

    console.log(disconnectedEdgeCount);
}

function countReachableNodes(totalNodes, edgesCollection, forbiddenEdgeId) {
    const currentAdjacency = new Array(totalNodes + 1).fill(null).map(() => new Set());

    for (const edge of edgesCollection) {
        if (edge.identifier !== forbiddenEdgeId) {
            currentAdjacency[edge.first].add(edge.second);
            currentAdjacency[edge.second].add(edge.first);
        }
    }

    const visitedSet = new Set();
    let reachableCounter = 0;

    function depthFirstSearch(currentVertex) {
        if (visitedSet.has(currentVertex)) {
            return;
        }
        visitedSet.add(currentVertex);
        reachableCounter++;

        for (const neighborVertex of currentAdjacency[currentVertex]) {
            depthFirstSearch(neighborVertex);
        }
    }

    depthFirstSearch(1);

    return reachableCounter;
}

processGraphData(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
