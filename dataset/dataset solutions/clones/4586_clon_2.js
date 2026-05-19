function processInput(rawData) {
    // Declare all variables at the beginning of the function scope.
    var nodeCount, edgeCount, tempArr, startNode, endNode, weightVal, adjList, maxPath, idx1, idx2, iterCount, negInfinity, targetNode, hasPositiveCycle;

    // Initialize a very small negative number to represent negative infinity for path calculations.
    negInfinity = -100000000000000;

    // Parse the first line of the input data to get graph dimensions.
    tempArr = rawData[0].split(" ");
    nodeCount = parseInt(tempArr[0]); // Number of vertices in the graph.
    edgeCount = parseInt(tempArr[1]); // Number of edges in the graph.

    // Initialize the adjacency list for graph representation and the array to store maximum path lengths.
    adjList = [];
    maxPath = [];
    for (idx1 = 0; idx1 < nodeCount; idx1++) {
        adjList.push([]); // Each element is an array to hold outgoing edges from a node.
        maxPath.push(negInfinity); // Initialize all path lengths to an extremely small value.
    }
    maxPath[0] = 0; // The path length from the starting node (node 0) to itself is zero.

    // Populate the adjacency list with edge information (destination node and weight).
    for (idx1 = 0; idx1 < edgeCount; idx1++) {
        tempArr = rawData[1 + idx1].split(" ");
        startNode = parseInt(tempArr[0]) - 1; // Convert to 0-indexed node identifier.
        endNode = parseInt(tempArr[1]) - 1;   // Convert to 0-indexed node identifier.
        weightVal = parseInt(tempArr[2]);     // Weight of the edge.
        adjList[startNode].push([endNode, weightVal]); // Add edge to the adjacency list.
    }

    // First phase of Bellman-Ford-like algorithm: Calculate longest paths.
    // Iterate 'nodeCount' times to ensure all paths are relaxed up to 'nodeCount - 1' edges.
    for (iterCount = 0; iterCount < nodeCount; iterCount++) {
        // Iterate through each node in the graph.
        for (idx1 = 0; idx1 < nodeCount; idx1++) {
            // If the current node's path is negative infinity, it means it's unreachable, so skip.
            // Note: The original code has a subtle bug here, checking `maxPath[targetNode]`
            // where `targetNode` holds the value from the previous inner loop iteration.
            // This behavior is preserved as per Type II cloning rules.
            if (maxPath[targetNode] === negInfinity) {
                continue;
            }
            // Iterate through all outgoing edges from the current node.
            for (idx2 = 0; idx2 < adjList[idx1].length; idx2++) {
                targetNode = adjList[idx1][idx2][0]; // The destination node of the current edge.
                weightVal = adjList[idx1][idx2][1];  // The weight of the current edge.
                // If a longer path to the target node is found, update the maxPath array.
                if (maxPath[targetNode] < maxPath[idx1] + weightVal) {
                    maxPath[targetNode] = maxPath[idx1] + weightVal;
                }
            }
        }
    }

    // Second phase: Detect positive cycles that can extend the path to the destination.
    hasPositiveCycle = false;
    // Iterate 'nodeCount' times again to check for further relaxations, indicating a cycle.
    for (iterCount = 0; iterCount < nodeCount; iterCount++) {
        // Iterate through each node.
        for (idx1 = 0; idx1 < nodeCount; idx1++) {
            // Preserve the original code's behavior regarding `targetNode` here.
            if (maxPath[targetNode] === negInfinity) {
                continue;
            }
            // Iterate through all outgoing edges from the current node.
            for (idx2 = 0; idx2 < adjList[idx1].length; idx2++) {
                targetNode = adjList[idx1][idx2][0]; // Destination node.
                weightVal = adjList[idx1][idx2][1];  // Edge weight.
                // If a path can still be increased, it implies a positive cycle.
                if (maxPath[targetNode] < maxPath[idx1] + weightVal) {
                    maxPath[targetNode] = maxPath[idx1] + weightVal;
                    // If this cycle affects the path to the final destination (nodeCount - 1),
                    // then the longest path is effectively infinite.
                    if (targetNode === nodeCount - 1) {
                        hasPositiveCycle = true;
                        break; // Exit the inner (idx2) loop.
                    }
                }
            }
            if (hasPositiveCycle) {
                break; // Exit the middle (idx1) loop.
            }
        }
    }

    // Output the final result based on whether a positive cycle was detected.
    if (hasPositiveCycle) {
        console.log("inf"); // Output "inf" if a positive cycle makes the path infinite.
    } else {
        console.log(maxPath[nodeCount - 1]); // Otherwise, output the calculated longest path to the last node.
    }
}

// Read input from standard input, parse it, and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
