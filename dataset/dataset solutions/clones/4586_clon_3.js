// Core function to analyze graph data and determine the longest path
function processGraphData(rawDataLines) {
    // Define a constant for representing negative infinity for path lengths.
    // Using MAX_SAFE_INTEGER ensures it's a sufficiently small number for practical graph weights.
    const INITIAL_MIN_PATH_LENGTH = -Number.MAX_SAFE_INTEGER;
    const NODE_INDEX_ADJUSTMENT = 1; // Input nodes are 1-indexed, internal representation is 0-indexed.

    // Helper function to parse a string line into an array of numbers.
    const parseLineToNumbers = (lineContent) => lineContent.split(" ").map(Number);

    // Read the first line to get the total number of nodes and edges.
    const [totalNodes, totalEdges] = parseLineToNumbers(rawDataLines[0]);

    // Perform basic validation on input graph dimensions.
    if (totalNodes <= 0 || totalEdges < 0) {
        console.error("Error: Invalid graph dimensions. Number of nodes must be positive, edges non-negative.");
        return; // Exit if input is invalid
    }
    if (rawDataLines.length < totalEdges + NODE_INDEX_ADJUSTMENT) {
        console.error("Error: Insufficient input lines provided for the specified number of edges.");
        return; // Exit if input is incomplete
    }

    // Initialize the graph's adjacency list.
    // Each entry `graphConnections[i]` will hold an array of objects representing outgoing edges from node `i`.
    // An edge object: `{ destination: nodeIndex, weight: edgeValue }`.
    const graphConnections = Array.from({ length: totalNodes }, () => []);

    // Initialize an array to store the maximum path length found so far from the source node (node 0)
    // to every other node. All are initially set to negative infinity.
    const maxPathLengths = Array.from({ length: totalNodes }, () => INITIAL_MIN_PATH_LENGTH);
    maxPathLengths[0] = 0; // The path length from the source node to itself is zero.

    // Populate the graph's adjacency list with edge data from the input.
    for (let edgeCount = 0; edgeCount < totalEdges; edgeCount++) {
        const [sourceInputNode, targetInputNode, edgeValue] = parseLineToNumbers(rawDataLines[NODE_INDEX_ADJUSTMENT + edgeCount]);
        // Adjust node indices from 1-based (input) to 0-based (internal).
        const sourceNodeIndex = sourceInputNode - NODE_INDEX_ADJUSTMENT;
        const targetNodeIndex = targetInputNode - NODE_INDEX_ADJUSTMENT;

        // Add the directed edge to the graph.
        graphConnections[sourceNodeIndex].push({ destination: targetNodeIndex, weight: edgeValue });
    }

    // --- Bellman-Ford Algorithm: Phase 1 (Path Relaxation) ---
    // This phase iteratively relaxes all edges `totalNodes - 1` times.
    // After `totalNodes - 1` passes, if no positive cycles exist, all `maxPathLengths` will be finalized.
    let anyPathLengthUpdatedInPass; // Flag to track if any path length changed in a pass.

    for (let currentPass = 0; currentPass < totalNodes - 1; currentPass++) {
        anyPathLengthUpdatedInPass = false; // Reset flag for the current iteration.

        for (let currentSourceNode = 0; currentSourceNode < totalNodes; currentSourceNode++) {
            // If the current source node is unreachable, it cannot extend any paths.
            if (maxPathLengths[currentSourceNode] === INITIAL_MIN_PATH_LENGTH) {
                continue;
            }

            // Iterate through all outgoing edges from the current source node.
            for (const edge of graphConnections[currentSourceNode]) {
                const { destination: currentDestinationNode, weight: edgeWeight } = edge;

                // Calculate a potential new path length to the destination node.
                const candidatePathLength = maxPathLengths[currentSourceNode] + edgeWeight;

                // If this new path is longer than the currently recorded maximum path to the destination, update it.
                if (candidatePathLength > maxPathLengths[currentDestinationNode]) {
                    maxPathLengths[currentDestinationNode] = candidatePathLength;
                    anyPathLengthUpdatedInPass = true; // Mark that an update occurred.
                }
            }
        }
        // Optimization: If no path lengths were updated in a full pass,
        // it means all paths have been finalized, and we can break early.
        if (!anyPathLengthUpdatedInPass) {
            break;
        }
    }

    // --- Bellman-Ford Algorithm: Phase 2 (Positive Cycle Detection) ---
    // After `totalNodes - 1` passes, run one more (the `N`th) pass.
    // If any path length can still be improved, it indicates the presence of a positive cycle.
    // We then need to determine if any such cycle is reachable from the source (node 0)
    // AND can reach the specific target node (totalNodes - 1).

    const nodesInfluencedByPositiveCycles = new Set(); // Stores nodes whose distances can still be improved in this pass.
    let cycleDetectionPassResultedInChanges = false;

    for (let nodeIdx = 0; nodeIdx < totalNodes; nodeIdx++) {
        if (maxPathLengths[nodeIdx] === INITIAL_MIN_PATH_LENGTH) {
            continue; // Skip nodes that are not reachable from the source.
        }

        for (const edge of graphConnections[nodeIdx]) {
            const { destination: neighborNodeIdx, weight: edgeWeight } = edge;

            const potentialPathLength = maxPathLengths[nodeIdx] + edgeWeight;
            if (potentialPathLength > maxPathLengths[neighborNodeIdx]) {
                // If a path length can still be improved, this 'neighborNodeIdx' is part of
                // or reachable from a positive cycle that is reachable from the source.
                // Update the distance (though for strict cycle detection, just marking is enough).
                maxPathLengths[neighborNodeIdx] = potentialPathLength;
                nodesInfluencedByPositiveCycles.add(neighborNodeIdx);
                cycleDetectionPassResultedInChanges = true;
            }
        }
    }

    let isTargetAffectedByPositiveCycle = false;
    if (cycleDetectionPassResultedInChanges) {
        // If changes occurred in the Nth pass, positive cycles exist.
        // Now, we need to check if any of these cycle-affected nodes can reach the final target node.
        const finalTargetNode = totalNodes - NODE_INDEX_ADJUSTMENT; // Last node (0-indexed).
        const visitedInDFS = new Array(totalNodes).fill(false); // To prevent infinite loops in DFS.

        // Depth-First Search (DFS) helper to check if a `startNode` can reach `finalTargetNode`.
        const canReachTargetViaDFS = (startNode) => {
            if (startNode === finalTargetNode) {
                return true; // Target reached.
            }
            visitedInDFS[startNode] = true; // Mark current node as visited.

            // Explore all neighbors.
            for (const outgoingEdge of graphConnections[startNode]) {
                if (!visitedInDFS[outgoingEdge.destination]) { // Only visit unvisited neighbors.
                    if (canReachTargetViaDFS(outgoingEdge.destination)) {
                        return true; // If target found through a neighbor, propagate true.
                    }
                }
            }
            return false; // Target not reachable from this path.
        };

        // Iterate through all nodes identified as being influenced by a positive cycle.
        for (const affectedNode of nodesInfluencedByPositiveCycles) {
            // Reset visited state for each new DFS traversal from an affected node.
            visitedInDFS.fill(false);
            if (canReachTargetViaDFS(affectedNode)) {
                isTargetAffectedByPositiveCycle = true; // Found a positive cycle that reaches the target.
                break; // No need to check further.
            }
        }
    }

    // Output the final result based on cycle detection.
    if (isTargetAffectedByPositiveCycle) {
        console.log("inf"); // "inf" indicates infinitely long path due to a positive cycle.
    } else {
        // If no such cycle, output the computed maximum path length to the target node.
        // If the target is unreachable, its value will still be INITIAL_MIN_PATH_LENGTH.
        console.log(maxPathLengths[totalNodes - NODE_INDEX_ADJUSTMENT]);
    }
}

// Standard competitive programming entry point for Node.js.
// Reads all input from stdin, splits by newlines, and passes to the main processing function.
processGraphData(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));