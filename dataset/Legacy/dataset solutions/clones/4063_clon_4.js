function processRelations(inputString) {
    const lineSegments = inputString.split("\n");
    const initialParameters = lineSegments[0].split(" ").map(Number);
    const totalNodes = initialParameters[0];
    const numberOfConstraints = initialParameters[1];

    const graphAdjacency = new Map(); // Stores connections: Map<nodeIndex, Array<{ target: number, delta: number }>>

    for (let nodeIdx = 1; nodeIdx <= totalNodes; nodeIdx++) {
        graphAdjacency.set(nodeIdx, []); // Initialize an empty list for each node
    }

    for (let constraintIdx = 0; constraintIdx < numberOfConstraints; constraintIdx++) {
        const constraintData = lineSegments[constraintIdx + 1].split(" ").map(Number);
        const nodeA = constraintData[0];
        const nodeB = constraintData[1];
        const requiredDifference = constraintData[2]; // x[nodeB] - x[nodeA] = requiredDifference

        // Add directed edges for both directions
        // From nodeA to nodeB: x[nodeB] = x[nodeA] + requiredDifference
        graphAdjacency.get(nodeA).push({ target: nodeB, delta: requiredDifference });
        // From nodeB to nodeA: x[nodeA] = x[nodeB] - requiredDifference
        graphAdjacency.get(nodeB).push({ target: nodeA, delta: -requiredDifference });
    }

    const nodeValues = new Map(); // Stores calculated x values: Map<nodeIndex, value>
    const visitedComponentNodes = new Set(); // Tracks nodes that have been processed in any component
    let finalStatus = "Yes";

    // Iterate through all possible nodes to find and process connected components
    for (let componentRoot = 1; componentRoot <= totalNodes; componentRoot++) {
        if (visitedComponentNodes.has(componentRoot)) {
            continue; // This node is already part of a processed component
        }

        // Start a Breadth-First Search (BFS) for a new connected component
        const bfsQueue = [];
        bfsQueue.push(componentRoot);
        nodeValues.set(componentRoot, 0); // Arbitrarily set the first node of a component to 0

        let queueHead = 0; // Manual queue pointer for efficiency

        while (queueHead < bfsQueue.length) {
            const currentNode = bfsQueue[queueHead++];
            visitedComponentNodes.add(currentNode);
            const currentValue = nodeValues.get(currentNode);

            const connections = graphAdjacency.get(currentNode);
            if (!connections) continue; // Should not happen if graph initialized correctly

            for (const { target, delta } of connections) {
                if (nodeValues.has(target)) {
                    // Target node's value is already known, check for consistency
                    if (nodeValues.get(target) !== currentValue + delta) {
                        finalStatus = "No";
                        // Immediately break out of all loops upon inconsistency
                        queueHead = bfsQueue.length; // Empty queue to stop BFS
                        componentRoot = totalNodes + 1; // Advance outer loop to end
                        break; // Break from inner for-loop
                    }
                } else {
                    // Target node's value is not yet known, calculate and add to queue
                    nodeValues.set(target, currentValue + delta);
                    bfsQueue.push(target);
                }
            }
        }
    }

    console.log(finalStatus);
}

function Main(input) {
    processRelations(input);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
