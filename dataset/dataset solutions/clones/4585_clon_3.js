function main(inputData) {
    const UNREACHABLE_DISTANCE_VALUE = -100000000000000;
    const START_NODE_INDEX = 0;
    const NODE_ID_OFFSET = 1;

    let nodeCount, edgeCount;
    let lineParts;
    let sourceNodeIndex, destinationNodeIndex, edgeWeight;
    let graphAdjacencyList;
    let maxPathDistances;
    let currentNodeIter, currentEdgeIter, bellmanFordPass;
    let lastRelaxedNodeIdentifier; // This variable corresponds to 't' in the original code.
    let positiveCycleDetected;

    // Helper function to parse a line of space-separated numbers
    const parseNumericLine = (lineString) => lineString.split(" ").map(Number);

    // Parse graph dimensions from the first line of input
    lineParts = parseNumericLine(inputData[0]);
    nodeCount = lineParts[0];
    edgeCount = lineParts[1];

    // Initialize adjacency list for the graph and distance array
    graphAdjacencyList = Array.from({ length: nodeCount }, () => []);
    maxPathDistances = Array(nodeCount).fill(UNREACHABLE_DISTANCE_VALUE);
    
    // Set the distance to the starting node (node 0) as 0
    maxPathDistances[START_NODE_INDEX] = 0;

    // Read and populate graph edges from input
    for (currentEdgeIter = 0; currentEdgeIter < edgeCount; currentEdgeIter++) {
        const edgeDetails = parseNumericLine(inputData[NODE_ID_OFFSET + currentEdgeIter]);
        sourceNodeIndex = edgeDetails[0] - NODE_ID_OFFSET; // Adjust to 0-indexed
        destinationNodeIndex = edgeDetails[1] - NODE_ID_OFFSET; // Adjust to 0-indexed
        edgeWeight = edgeDetails[2];
        graphAdjacencyList[sourceNodeIndex].push([destinationNodeIndex, edgeWeight]);
    }

    // First phase of Bellman-Ford: Calculate longest paths
    // The outer loop runs 'nodeCount' times, and the inner loop 'nodeCount - 1' times.
    // This is an over-iteration compared to standard Bellman-Ford (N-1 passes), but matches original behavior.
    for (bellmanFordPass = 0; bellmanFordPass < nodeCount; bellmanFordPass++) {
        for (currentNodeIter = 0; currentNodeIter < nodeCount - 1; currentNodeIter++) {
            const currentSourceDistance = maxPathDistances[currentNodeIter];
            
            // Skip if the current node is unreachable
            if (currentSourceDistance === UNREACHABLE_DISTANCE_VALUE) {
                continue;
            }
            
            // Iterate over all outgoing edges from the current node
            for (currentEdgeIter = 0; currentEdgeIter < graphAdjacencyList[currentNodeIter].length; currentEdgeIter++) {
                const currentEdge = graphAdjacencyList[currentNodeIter][currentEdgeIter];
                const targetNode = currentEdge[0];
                const weight = currentEdge[1];
                
                const potentialNewDistance = currentSourceDistance + weight;
                
                // Relax the edge: update distance if a longer path is found
                if (maxPathDistances[targetNode] < potentialNewDistance) {
                    maxPathDistances[targetNode] = potentialNewDistance;
                }
            }
        }
    }

    // Second phase of Bellman-Ford: Detect positive cycles
    // The outer loop runs 'nodeCount' times, and the inner loop 'nodeCount' times.
    positiveCycleDetected = false;
    for (bellmanFordPass = 0; bellmanFordPass < nodeCount; bellmanFordPass++) {
        for (currentNodeIter = 0; currentNodeIter < nodeCount; currentNodeIter++) {
            // This condition preserves the original code's behavior where 't' (now 'lastRelaxedNodeIdentifier')
            // is used before being assigned in the current 'currentNodeIter' loop.
            // It retains its value from the last edge processed in the previous 'currentNodeIter' iteration,
            // or is undefined for the very first iteration of the outer 'bellmanFordPass' loop.
            // If 'lastRelaxedNodeIdentifier' is undefined, maxPathDistances[undefined] is undefined,
            // which is not equal to UNREACHABLE_DISTANCE_VALUE, so the 'continue' is not triggered.
            if (maxPathDistances[lastRelaxedNodeIdentifier] === UNREACHABLE_DISTANCE_VALUE) {
                continue;
            }

            const currentSourceDistance = maxPathDistances[currentNodeIter];
            
            // Iterate over all outgoing edges from the current node
            for (currentEdgeIter = 0; currentEdgeIter < graphAdjacencyList[currentNodeIter].length; currentEdgeIter++) {
                const currentEdge = graphAdjacencyList[currentNodeIter][currentEdgeIter];
                const targetNode = currentEdge[0];
                const weight = currentEdge[1];
                
                // Assign 'lastRelaxedNodeIdentifier' to mimic the original 't' variable's assignment
                lastRelaxedNodeIdentifier = targetNode; 

                const potentialNewDistance = currentSourceDistance + weight;
                
                // If a distance can still be improved, it indicates a positive cycle
                if (maxPathDistances[targetNode] < potentialNewDistance) {
                    maxPathDistances[targetNode] = potentialNewDistance;
                    
                    // The original code specifically checks if the relaxation happens for the last node (n-1)
                    // to set the positiveCycleDetected flag. This specific condition is preserved.
                    if (currentNodeIter === nodeCount - 1) {
                        positiveCycleDetected = true;
                        break; // Exit inner edge loop
                    }
                }
            }
            if (positiveCycleDetected) {
                break; // Exit inner node loop
            }
        }
    }

    // Output the result
    if (positiveCycleDetected) {
        console.log("inf");
    } else {
        console.log(maxPathDistances[nodeCount - 1]);
    }
}

// Standard input reading for competitive programming environments
main(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
