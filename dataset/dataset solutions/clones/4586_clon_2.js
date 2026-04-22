function processInputData(rawDataLines) {
    // Declare all essential variables required for graph processing operations.
    var nodeCount, edgeCount, tempParts, startNodeIndex, endNodeIndex, edgeWeight,
        adjList, maxPathValues, outerLoopIdx, innerLoopIdx, bellmanFordPass,
        minPossibleValue, targetVertex, hasPositiveCycle;

    // Define a very low numerical value to represent negative infinity for path calculations.
    minPossibleValue = -1.0E14; // A large negative number, slightly different value and notation.

    // Parse the initial line of input to extract the total number of nodes and edges.
    tempParts = rawDataLines[0].split(" ");
    nodeCount = parseInt(tempParts[0], 10); // Explicitly parse as base 10 integer.
    edgeCount = parseInt(tempParts[1], 10);

    // Initialize the adjacency list for graph representation and the array for storing maximum path values.
    adjList = [];
    maxPathValues = [];
    for (outerLoopIdx = 0; outerLoopIdx < nodeCount; outerLoopIdx++) {
        adjList.push([]);
        maxPathValues.push(minPossibleValue); // All path values are initially set to negative infinity.
    }
    maxPathValues[0] = 0; // The path from the starting node (index 0) to itself is zero.

    // Populate the adjacency list with graph edges and their corresponding weights.
    // Each subsequent line of input (from index 1 to edgeCount) represents an edge.
    for (outerLoopIdx = 0; outerLoopIdx < edgeCount; outerLoopIdx++) {
        tempParts = rawDataLines[1 + outerLoopIdx].split(" ");
        startNodeIndex = parseInt(tempParts[0], 10) - 1; // Adjust to zero-based indexing.
        endNodeIndex = parseInt(tempParts[1], 10) - 1;   // Adjust to zero-based indexing.
        edgeWeight = parseInt(tempParts[2], 10);
        adjList[startNodeIndex].push([endNodeIndex, edgeWeight]); // Store the destination node and edge weight.
    }

    // Execute the Bellman-Ford-like algorithm to determine the maximum path values.
    // This loop runs 'nodeCount' times to ensure all possible paths are evaluated.
    for (bellmanFordPass = 0; bellmanFordPass < nodeCount; bellmanFordPass++) {
        for (outerLoopIdx = 0; outerLoopIdx < nodeCount - 1; outerLoopIdx++) {
            // If the current node is currently unreachable (has a negative infinite path value), skip it.
            if (maxPathValues[outerLoopIdx] === minPossibleValue) {
                continue;
            }
            // Iterate through all outgoing edges from the current node.
            for (innerLoopIdx = 0; innerLoopIdx < adjList[outerLoopIdx].length; innerLoopIdx++) {
                targetVertex = adjList[outerLoopIdx][innerLoopIdx][0]; // The destination node of the edge.
                edgeWeight = adjList[outerLoopIdx][innerLoopIdx][1];   // The weight (cost) of the edge.
                // If a longer path to 'targetVertex' is discovered, update its maximum path value.
                if (maxPathValues[targetVertex] < maxPathValues[outerLoopIdx] + edgeWeight) {
                    maxPathValues[targetVertex] = maxPathValues[outerLoopIdx] + edgeWeight;
                }
            }
        }
    }

    // Perform an additional iteration (or 'nodeCount' such iterations as per original structure)
    // to detect the presence of positive cycles (which would lead to infinitely long paths).
    hasPositiveCycle = false;
    for (bellmanFordPass = 0; bellmanFordPass < nodeCount; bellmanFordPass++) { // This loop runs 'nodeCount' times for cycle detection.
        for (outerLoopIdx = 0; outerLoopIdx < nodeCount; outerLoopIdx++) {
            // This condition checks the reachability of 'targetVertex'.
            // Note: 'targetVertex' might be undefined or hold a stale value from a previous iteration,
            // replicating the original code's behavior which could lead to this check being ineffective.
            if (maxPathValues[targetVertex] === minPossibleValue) {
                continue;
            }
            for (innerLoopIdx = 0; innerLoopIdx < adjList[outerLoopIdx].length; innerLoopIdx++) {
                targetVertex = adjList[outerLoopIdx][innerLoopIdx][0];
                edgeWeight = adjList[outerLoopIdx][innerLoopIdx][1];
                // If a path value can still be improved after N-1 iterations, it indicates a positive cycle.
                if (maxPathValues[targetVertex] < maxPathValues[outerLoopIdx] + edgeWeight) {
                    maxPathValues[targetVertex] = maxPathValues[outerLoopIdx] + edgeWeight;
                    // If the specific target node (last node) is affected by this positive cycle,
                    // its path value is effectively infinite.
                    if (targetVertex === nodeCount - 1) {
                        hasPositiveCycle = true;
                        break; // Exit the inner loop upon detection.
                    }
                }
            }
            if (hasPositiveCycle) {
                break; // Exit the outer loop if a positive cycle is found.
            }
        }
    }

    // Output the final result.
    if (hasPositiveCycle) {
        console.log("inf"); // If a positive cycle is detected, print "inf".
    } else {
        console.log(maxPathValues[nodeCount - 1]); // Otherwise, print the maximum path value to the last node.
    }
}

// Execute the graph processing function by reading input from standard input.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));