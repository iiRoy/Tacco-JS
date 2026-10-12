const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
let lineBuffer = rawData.trim().split("\n");

const calculatePathCosts = (nodeCount, edgeCount, edges) => {
    const startNode = 1;
    const destinationNode = nodeCount;
    const costTypeCount = 3; // Corresponds to dp[...][0], dp[...][1], dp[...][2]

    const costMatrix = Array.from({ length: nodeCount + 1 }, (_, nodeIdx) =>
        Array.from({ length: costTypeCount }, (_, costTypeIdx) =>
            (nodeIdx === startNode && costTypeIdx === 0) ? 0 : Number.POSITIVE_INFINITY
        )
    );

    const nodeQueue = [startNode];
    const processedSet = new Set();

    const updateNodeCosts = (sourceVertex, targetVertex, edgeWeight) => {
        const sourceCosts = costMatrix[sourceVertex];
        const targetCosts = costMatrix[targetVertex];

        // Update cost type 0 (shortest path)
        if (sourceCosts[0] !== Number.POSITIVE_INFINITY) {
            targetCosts[0] = Math.min(targetCosts[0], sourceCosts[0] + edgeWeight);
        }

        // Update cost type 1 (shortest path to previous node)
        if (sourceCosts[0] !== Number.POSITIVE_INFINITY) {
            targetCosts[1] = Math.min(targetCosts[1], sourceCosts[0]);
        }

        // Update cost type 2 (alternative path)
        if (sourceCosts[1] !== Number.POSITIVE_INFINITY) {
            targetCosts[2] = Math.min(targetCosts[2], sourceCosts[1]);
        }
        if (sourceCosts[2] !== Number.POSITIVE_INFINITY) {
            targetCosts[2] = Math.min(targetCosts[2], sourceCosts[2] + edgeWeight);
        }
    };

    while (nodeQueue.length > 0) {
        const currentVertex = nodeQueue.shift();

        if (processedSet.has(currentVertex)) {
            continue;
        }
        processedSet.add(currentVertex);

        for (const edgeData of edges) {
            const [vertexA, vertexB, weight] = edgeData;

            if (vertexA === currentVertex) {
                updateNodeCosts(vertexA, vertexB, weight);
                nodeQueue.push(vertexB);
            } else if (vertexB === currentVertex) {
                updateNodeCosts(vertexB, vertexA, weight);
                nodeQueue.push(vertexA);
            }
        }
    }

    // The original code excludes dp[d][1] from the final answer
    return Math.min(costMatrix[destinationNode][0], costMatrix[destinationNode][2]);
};

while (true) {
    const nodeEdgeCounts = lineBuffer.shift().split(" ").map(Number);
    if (nodeEdgeCounts[0] === 0 && nodeEdgeCounts[1] === 0) {
        break;
    }

    const totalNodes = nodeEdgeCounts[0];
    const edgeCount = nodeEdgeCounts[1];
    const edgeList = [];

    for (let i = 0; i < edgeCount; i++) {
        edgeList.push(lineBuffer.shift().split(" ").map(Number));
    }

    const finalResult = calculatePathCosts(totalNodes, edgeCount, edgeList);
    console.log(finalResult);
}
