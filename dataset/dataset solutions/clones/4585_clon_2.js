function processGraphData(rawData) {
    let numNodes, numEdges, tempParts, sourceNode, targetNode, edgeWeight, adjacencyList, nodeDistances, nodeIdx, edgeIdx, iterationCount, negativeInfinity, currentTarget, hasNegativeCycle;

    // A very small number representing negative infinity for distances
    negativeInfinity = -100000000000000;

    // Parse the number of nodes (N) and edges (M) from the first line of input
    tempParts = rawData[0].split(" ");
    numNodes = parseInt(tempParts[0]);
    numEdges = parseInt(tempParts[1]);

    // Initialize the adjacency list for the graph and the distance array
    adjacencyList = [];
    nodeDistances = [];
    for (nodeIdx = 0; nodeIdx < numNodes; nodeIdx++) {
        adjacencyList.push([]);
        nodeDistances.push(negativeInfinity); // All nodes are initially unreachable
    }
    nodeDistances[0] = 0; // The starting node (node 0) has a distance of 0

    // Populate the adjacency list with edges and their weights
    for (nodeIdx = 0; nodeIdx < numEdges; nodeIdx++) {
        tempParts = rawData[1 + nodeIdx].split(" ");
        sourceNode = parseInt(tempParts[0]) - 1; // Adjust to 0-indexed
        targetNode = parseInt(tempParts[1]) - 1; // Adjust to 0-indexed
        edgeWeight = parseInt(tempParts[2]);
        adjacencyList[sourceNode].push([targetNode, edgeWeight]);
    }

    // Perform Bellman-Ford relaxation for numNodes iterations
    // This phase calculates the longest paths, assuming no positive cycles
    for (iterationCount = 0; iterationCount < numNodes; iterationCount++) {
        for (nodeIdx = 0; nodeIdx < numNodes - 1; nodeIdx++) {
            // Skip relaxation from nodes that are currently unreachable
            if (nodeDistances[nodeIdx] === negativeInfinity) {
                continue;
            }
            // Iterate through all outgoing edges from the current node
            for (edgeIdx = 0; edgeIdx < adjacencyList[nodeIdx].length; edgeIdx++) {
                currentTarget = adjacencyList[nodeIdx][edgeIdx][0];
                edgeWeight = adjacencyList[nodeIdx][edgeIdx][1];
                // Relax the edge: if a longer path to currentTarget is found, update it
                if (nodeDistances[currentTarget] < nodeDistances[nodeIdx] + edgeWeight) {
                    nodeDistances[currentTarget] = nodeDistances[nodeIdx] + edgeWeight;
                }
            }
        }
    }

    // Check for positive cycles (which would lead to infinitely long paths)
    hasNegativeCycle = false; // Renamed from negativeLoop, but it's actually detecting positive cycles in this context
    // Perform one more round of relaxation to detect if any distances can still be improved
    for (iterationCount = 0; iterationCount < numNodes; iterationCount++) {
        for (nodeIdx = 0; nodeIdx < numNodes; nodeIdx++) {
            // This condition `nodeDistances[currentTarget] === negativeInfinity` is a direct translation
            // of the original code's `dist[t] === inf`. Note that `currentTarget` here refers to the
            // value from the *last* iteration of the previous loop, which is a potential bug in the original logic.
            // We preserve this behavior as per Type II cloning rules.
            if (nodeDistances[currentTarget] === negativeInfinity) {
                continue;
            }
            for (edgeIdx = 0; edgeIdx < adjacencyList[nodeIdx].length; edgeIdx++) {
                currentTarget = adjacencyList[nodeIdx][edgeIdx][0];
                edgeWeight = adjacencyList[nodeIdx][edgeIdx][1];
                // If a distance can still be improved, it indicates a positive cycle reachable from the start
                if (nodeDistances[currentTarget] < nodeDistances[nodeIdx] + edgeWeight) {
                    nodeDistances[currentTarget] = nodeDistances[nodeIdx] + edgeWeight;
                    // If the distance to the last node (numNodes - 1) can be improved,
                    // it means there's an infinitely long path to it
                    if (nodeIdx === numNodes - 1) {
                        hasNegativeCycle = true;
                        break; // Exit the innermost loop
                    }
                }
            }
            if (hasNegativeCycle) {
                break; // Exit the middle loop
            }
        }
    }

    // Output the result
    if (hasNegativeCycle) {
        console.log("inf"); // Indicates an infinitely long path
    } else {
        console.log(nodeDistances[numNodes - 1]); // Output the maximum path to the last node
    }
}

// Read input from standard input, split by newlines, and pass to the main processing function
processGraphData(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
