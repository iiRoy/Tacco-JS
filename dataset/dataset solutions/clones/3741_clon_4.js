function processGraphData(rawInput) {
    const inputLines = rawInput.split('\n');
    let [totalVertexCount, totalExcludedEdges] = inputLines[0].split(' ').map(Number);

    const complementGraphAdjacency = new Map();
    for (let v = 0; v < totalVertexCount; ++v) {
        complementGraphAdjacency.set(v, new Set());
    }

    for (let i = 0; i < totalExcludedEdges; ++i) {
        let [u, v] = inputLines[i + 1].split(' ').map(s => Number(s) - 1);
        // The original problem uses a matrix where 1 means no edge in original graph (edge in complement)
        // Here, we build the complement graph's adjacency list directly.
        // All possible edges are implicitly 1, then removed ones are 0.
        // This is tricky. The problem uses `b[a[0]][a[1]] = b[a[1]][a[0]] = 0;` which means `b` is initially all 1s (complete complement graph)
        // and then sets to 0 for *input edges*.
        // So `b[u][v]=1` means `u` and `v` are *not* connected in the input graph.
        // My complementAdj should contain edges that are *not* in the input graph.
        // This means I should build a full complement graph first, and then remove edges.
        // Or, more efficiently, add all possible pairs to complementAdj, then remove input edges.

        // The original code uses `b` as an adjacency matrix for the complement graph.
        // `b[u][v] = 1` means `u` and `v` are connected in the complement graph.
        // `b[u][v] = 0` means `u` and `v` are NOT connected in the complement graph (they ARE connected in the original graph).

        // So, I need to build the complement graph.
        // A pair `(u, v)` is an edge in the complement graph if it's NOT an edge in the original graph.
        // The input gives `m` edges of the *original* graph.
        // So, for each `(u, v)` in the input, they are *not* connected in the complement graph.

        // Let's create an `originalGraphEdges` set of sets for efficient lookup.
        const originalGraphEdges = new Set();
        for (let j = 0; j < totalExcludedEdges; ++j) {
            let [v1, v2] = inputLines[j + 1].split(' ').map(s => Number(s) - 1);
            if (v1 > v2) [v1, v2] = [v2, v1]; // Canonical representation
            originalGraphEdges.add(`${v1}-${v2}`);
        }

        // Now build the complement graph adjacency list
        for (let v1 = 0; v1 < totalVertexCount; ++v1) {
            for (let v2 = v1 + 1; v2 < totalVertexCount; ++v2) {
                if (!originalGraphEdges.has(`${v1}-${v2}`)) {
                    // If (v1, v2) is NOT in original edges, it IS in complement edges
                    complementGraphAdjacency.get(v1).add(v2);
                    complementGraphAdjacency.get(v2).add(v1);
                }
            }
        }
    }

    const nodeVisitedStatus = new Array(totalVertexCount).fill(false);
    const nodeColorAssignment = new Array(totalVertexCount).fill(-1); // -1: uncolored, 0: color A, 1: color B

    const allComponentPartitions = [];
    let componentCounter = 0;

    for (let currentVertex = 0; currentVertex < totalVertexCount; ++currentVertex) {
        if (!nodeVisitedStatus[currentVertex]) {
            const componentResult = analyzeBipartiteComponent(
                currentVertex,
                complementGraphAdjacency,
                nodeVisitedStatus,
                nodeColorAssignment
            );

            if (componentResult === null) { // Not bipartite
                console.log(-1);
                return;
            }
            allComponentPartitions.push(componentResult);
            componentCounter++;
        }
    }

    let possiblePartitionSums = new Array(totalVertexCount + 1).fill(false);
    if (allComponentPartitions.length > 0) {
        const firstComponent = allComponentPartitions[0];
        if (firstComponent.firstSetSize <= totalVertexCount) {
             possiblePartitionSums[firstComponent.firstSetSize] = true;
        }
        if (firstComponent.secondSetSize <= totalVertexCount) {
             possiblePartitionSums[firstComponent.secondSetSize] = true;
        }
    } else { // No components, means totalVertexCount=0 or all nodes isolated and not counted by original logic
        possiblePartitionSums[0] = true; // An empty set sum is possible
    }


    for (let compIdx = 1; compIdx < allComponentPartitions.length; ++compIdx) {
        const currentComponent = allComponentPartitions[compIdx];
        const nextPossibleSums = new Array(totalVertexCount + 1).fill(false);
        // Iterate downwards to update in place without using values from current component multiple times for a sum
        // But since we are creating a new array, iteration direction doesn't matter.
        // The original code's `j = n-1; j >= 0; j--` is for in-place updates.
        // With a temporary `nextPossibleSums` array, iterating upwards is fine.
        for (let currentSum = 0; currentSum <= totalVertexCount; ++currentSum) {
            if (possiblePartitionSums[currentSum]) {
                // Option 1: Add firstSetSize of current component
                const sumWithFirst = currentSum + currentComponent.firstSetSize;
                if (sumWithFirst <= totalVertexCount) {
                    nextPossibleSums[sumWithFirst] = true;
                }
                // Option 2: Add secondSetSize of current component
                const sumWithSecond = currentSum + currentComponent.secondSetSize;
                if (sumWithSecond <= totalVertexCount) {
                    nextPossibleSums[sumWithSecond] = true;
                }
            }
        }
        possiblePartitionSums = nextPossibleSums;
    }

    let optimalSplitSize = 0;
    for (let currentSize = 0; currentSize <= totalVertexCount; ++currentSize) {
        if (possiblePartitionSums[currentSize]) {
            optimalSplitSize = Math.max(optimalSplitSize, Math.min(currentSize, totalVertexCount - currentSize));
        }
    }

    // Calculate result for two cliques of sizes optimalSplitSize and (totalVertexCount - optimalSplitSize)
    const edgesInFirstClique = optimalSplitSize * (optimalSplitSize - 1) / 2;
    const edgesInSecondClique = (totalVertexCount - optimalSplitSize) * (totalVertexCount - optimalSplitSize - 1) / 2;

    console.log(edgesInFirstClique + edgesInSecondClique);
}

function analyzeBipartiteComponent(startNode, graphAdj, visitedNodes, nodeColors) {
    const componentQueue = [{ vertex: startNode, color: 0 }]; // 0 for color A, 1 for color B
    visitedNodes[startNode] = true;
    nodeColors[startNode] = 0;

    let countColorA = 0;
    let countColorB = 0;
    let isBipartiteComponent = true;

    // Mimic the original code's specific counting for the starting node:
    // It only increments x[z] (color A count) for the start node if it has neighbors in the complement graph.
    // If isolated, it's not counted in either partition.
    if (graphAdj.has(startNode) && graphAdj.get(startNode).size > 0) {
        countColorA = 1;
    }

    let queueHead = 0;
    while (queueHead < componentQueue.length) {
        const { vertex: u, color: uColor } = componentQueue[queueHead++];

        const neighbors = graphAdj.get(u);
        if (neighbors) { // Ensure neighbors exist for this node
            for (const v of neighbors) {
                if (!visitedNodes[v]) {
                    visitedNodes[v] = true;
                    nodeColors[v] = 1 - uColor; // Assign opposite color
                    if (nodeColors[v] === 0) {
                        countColorA++;
                    } else {
                        countColorB++;
                    }
                    componentQueue.push({ vertex: v, color: nodeColors[v] });
                } else if (nodeColors[v] === uColor) {
                    // Found an edge between two vertices of the same color, not bipartite
                    isBipartiteComponent = false;
                    break;
                }
            }
        }
        if (!isBipartiteComponent) break;
    }

    if (!isBipartiteComponent) {
        return null; // Component is not bipartite
    }
    return { firstSetSize: countColorA, secondSetSize: countColorB };
}


processGraphData(require("fs").readFileSync("/dev/stdin","utf8"));