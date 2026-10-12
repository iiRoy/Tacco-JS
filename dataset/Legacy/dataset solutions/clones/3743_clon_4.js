function solveGraphProblem(inputString) {
    const lines = inputString.split("\n");
    const [nodeCount, edgeCount] = lines[0].split(" ").map(Number);

    // adjacency[u][v] is true if (u,v) is an edge in the original graph
    const adjacency = Array.from({ length: nodeCount }, () => Array(nodeCount).fill(false));

    for (let i = 0; i < edgeCount; i++) {
        const [u, v] = lines[i + 1].split(" ").map(s => Number(s) - 1); // 0-indexed
        adjacency[u][v] = true;
        adjacency[v][u] = true;
    }

    const visitedNodes = Array(nodeCount).fill(false);
    const componentPartitionSizes = []; // Stores { sizeA, sizeB } for each component

    // Helper function to process a connected component in the complement graph
    // and verify clique/complete bipartite properties in the original graph.
    // Returns { sizeA, sizeB } on success, or -1 on failure.
    const analyzeComponent = (startNode, adjMatrix, visitedTracker, totalNodes) => {
        const nodeColors = Array(totalNodes).fill(-1); // -1: uncolored, 0: partition A, 1: partition B
        const queue = [startNode];
        visitedTracker[startNode] = true;
        nodeColors[startNode] = 0; // Start with color 0

        let partASize = 0;
        let partBSize = 0;
        const nodesInCurrentComponent = [];

        let head = 0;
        while (head < queue.length) {
            const currentNode = queue[head++];
            nodesInCurrentComponent.push(currentNode);

            if (nodeColors[currentNode] === 0) {
                partASize++;
            } else {
                partBSize++;
            }

            for (let neighborCandidate = 0; neighborCandidate < totalNodes; neighborCandidate++) {
                if (currentNode === neighborCandidate) continue;

                // If there is NO edge in the original graph, it's an edge in the complement graph
                if (!adjMatrix[currentNode][neighborCandidate]) {
                    if (nodeColors[neighborCandidate] === -1) { // Unvisited in complement graph
                        nodeColors[neighborCandidate] = 1 - nodeColors[currentNode];
                        visitedTracker[neighborCandidate] = true;
                        queue.push(neighborCandidate);
                    } else if (nodeColors[neighborCandidate] === nodeColors[currentNode]) {
                        // Complement graph is not 2-colorable (not bipartite)
                        return -1;
                    }
                }
            }
        }

        // After 2-coloring the complement graph, verify the properties in the original graph:
        // 1. Each partition (color class) must form a clique in the original graph.
        // 2. All nodes between the two partitions must be connected in the original graph.

        const color0Nodes = nodesInCurrentComponent.filter(node => nodeColors[node] === 0);
        const color1Nodes = nodesInCurrentComponent.filter(node => nodeColors[node] === 1);

        // Check clique property for color0Nodes
        for (let i = 0; i < color0Nodes.length; i++) {
            for (let j = i + 1; j < color0Nodes.length; j++) {
                if (!adjMatrix[color0Nodes[i]][color0Nodes[j]]) {
                    return -1; // Not a clique
                }
            }
        }

        // Check clique property for color1Nodes
        for (let i = 0; i < color1Nodes.length; i++) {
            for (let j = i + 1; j < color1Nodes.length; j++) {
                if (!adjMatrix[color1Nodes[i]][color1Nodes[j]]) {
                    return -1; // Not a clique
                }
            }
        }

        // Check complete bipartite property between color0Nodes and color1Nodes
        for (const u of color0Nodes) {
            for (const v of color1Nodes) {
                if (!adjMatrix[u][v]) {
                    return -1; // Not completely connected
                }
            }
        }

        return { sizeA: partASize, sizeB: partBSize };
    };

    for (let i = 0; i < nodeCount; i++) {
        if (!visitedNodes[i]) {
            const result = analyzeComponent(i, adjacency, visitedNodes, nodeCount);
            if (result === -1) {
                console.log(-1);
                return;
            }
            componentPartitionSizes.push(result);
        }
    }

    // Dynamic programming to find all possible sums for one partition size
    let achievablePartitionSums = new Set([0]);

    for (const { sizeA, sizeB } of componentPartitionSizes) {
        const nextAchievableSums = new Set();
        for (const currentSum of achievablePartitionSums) {
            nextAchievableSums.add(currentSum + sizeA);
            nextAchievableSums.add(currentSum + sizeB);
        }
        achievablePartitionSums = nextAchievableSums;
    }

    let maxBalancedPartitionSize = 0;
    for (const k of achievablePartitionSums) {
        maxBalancedPartitionSize = Math.max(maxBalancedPartitionSize, Math.min(k, nodeCount - k));
    }

    // Calculate the total number of edges
    const finalK = maxBalancedPartitionSize;
    const finalNMinusK = nodeCount - maxBalancedPartitionSize;
    const totalEdges = (finalK * (finalK - 1) / 2) + (finalNMinusK * (finalNMinusK - 1) / 2);

    console.log(totalEdges);
}

solveGraphProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
