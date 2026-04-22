function processGraphData(rawData) {
    // Split the raw input string into individual lines based on newline characters.
    let inputLines = rawData.split("\n");

    // Remove any trailing empty lines from the input. This is a common pattern
    // when reading input, as the last line might sometimes be empty.
    if (inputLines[inputLines.length - 1] === '') {
        inputLines.pop();
    }

    // --- Input Parsing and Graph Construction ---

    // The very first line of input specifies the number of nodes (N) and edges (M).
    // Extract these values. Note: M (edge count) is parsed but not directly used
    // in this particular cycle detection algorithm.
    const graphDimensionParts = inputLines[0].split(' ');
    const nodeCount = parseInt(graphDimensionParts[0], 10);
    // const edgeCount = parseInt(graphDimensionParts[1], 10); // 'edgeCount' is not directly used.

    // Initialize an adjacency list to represent the directed graph.
    // 'graphConnections[u]' will hold an array of all nodes 'v' such that there is
    // a directed edge from 'u' to 'v'. Nodes are typically 1-indexed, so we create
    // an array of size 'nodeCount + 1' to accommodate this.
    const graphConnections = Array.from({ length: nodeCount + 1 }, () => []);

    // Iterate through the remaining input lines (starting from the second line)
    // to populate the adjacency list with the graph's edges.
    for (let currentLineIdx = 1; currentLineIdx < inputLines.length; currentLineIdx++) {
        const edgeDefinition = inputLines[currentLineIdx].split(' ');
        const departureNode = parseInt(edgeDefinition[0], 10);
        const arrivalNode = parseInt(edgeDefinition[1], 10);

        // Basic sanity check for node indices to ensure they are within the defined range.
        // This helps prevent issues with malformed input.
        if (departureNode >= 1 && departureNode <= nodeCount && arrivalNode >= 1 && arrivalNode <= nodeCount) {
            graphConnections[departureNode].push(arrivalNode);
        }
        // No explicit error handling for invalid nodes; assuming valid input as per typical problem constraints.
    }

    // --- Shortest Cycle Detection using Breadth-First Search (BFS) for Paths ---

    // 'pathDiscoveryQueue' will store arrays, where each array represents a path
    // discovered so far. A path is a sequence of node IDs: [startNode, intermediate1, ..., endNode].
    // This queue effectively manages the layers of our BFS traversal.
    let pathDiscoveryQueue = [];

    // Initialize the queue with all possible paths of length 1.
    // Each node in the graph is considered a starting point for a potential cycle.
    for (let initialNode = 1; initialNode <= nodeCount; initialNode++) {
        pathDiscoveryQueue.push([initialNode]);
    }

    let cycleWasIdentified = false; // Flag to indicate if a cycle has been found.
    let formattedCycleResult = ''; // Stores the final output string if a cycle is found.

    // Continue the BFS process as long as there are paths to explore
    // and no cycle has been identified yet.
    while (pathDiscoveryQueue.length > 0 && !cycleWasIdentified) {
        let pathsForNextBFSLevel = []; // Accumulates paths for the next iteration's BFS level.
        let cycleDetectedInCurrentLevel = false; // Flag for early exit within the current BFS level.

        // Process each path from the current BFS level.
        for (const currentPathSequence of pathDiscoveryQueue) {
            const currentPathEndNode = currentPathSequence[currentPathSequence.length - 1];
            const currentPathStartNode = currentPathSequence[0];

            // If the current path's end node has no outgoing edges, it cannot be extended further.
            // Skip to the next path in the queue.
            if (!graphConnections[currentPathEndNode] || graphConnections[currentPathEndNode].length === 0) {
                continue;
            }

            // Explore all immediate neighbors (nextConnectedNode) reachable from the current path's end node.
            for (const nextConnectedNode of graphConnections[currentPathEndNode]) {
                // Construct a new, extended path by appending the 'nextConnectedNode'.
                const newlyExtendedPath = [...currentPathSequence, nextConnectedNode];

                // Check for a cycle: if the 'nextConnectedNode' is the same as the 'currentPathStartNode',
                // a cycle has been detected. Since this is a BFS, the first cycle found
                // will inherently be one of the shortest cycles in terms of edge count.
                if (nextConnectedNode === currentPathStartNode) {
                    // Extract the actual cycle nodes. The 'newlyExtendedPath' includes the start node twice
                    // (e.g., [1, 2, 3, 1]). We need to remove the first occurrence to get the cycle path (e.g., [2, 3, 1]).
                    const cycleSegmentNodes = newlyExtendedPath.slice(1);

                    // Format the output string as required: cycle length, followed by each node on a new line.
                    formattedCycleResult = `${cycleSegmentNodes.length}\n${cycleSegmentNodes.join('\n')}`;
                    cycleWasIdentified = true; // Set global flag to stop further processing.
                    cycleDetectedInCurrentLevel = true; // Set local flag for early exit from current level.
                    break; // Exit the inner loop (neighbors) as the shortest cycle is found.
                }

                // If no cycle is formed, add this extended path to the queue for the next BFS level.
                pathsForNextBFSLevel.push(newlyExtendedPath);
            }

            // If a cycle was detected in the current layer, no need to process other paths in this layer.
            if (cycleDetectedInCurrentLevel) {
                break; // Exit the loop iterating through 'currentPathSequence'.
            }
        }

        // If a cycle was found during this entire BFS level, exit the main BFS loop.
        if (cycleWasIdentified) {
            break;
        }

        // Advance to the next BFS level: 'pathDiscoveryQueue' becomes the paths accumulated in this level.
        pathDiscoveryQueue = pathsForNextBFSLevel;

        // Optional Guard: This check can prevent memory exhaustion in graphs with very long acyclic paths
        // or paths that don't lead to a cycle back to their *initial* node within a reasonable length.
        // A path longer than N nodes must contain a repeated node (by pigeonhole principle).
        // If a shortest cycle exists, it will be found before path lengths exceed N.
        // The original problem implies finding the shortest cycle, which this BFS approach guarantees.
        // if (pathDiscoveryQueue.length > 0 && pathDiscoveryQueue[0].length > nodeCount + 1) {
        //     // If paths are becoming excessively long without finding a cycle back to their origin,
        //     // it's a strong indicator that no such cycle exists or it's too long to be considered shortest.
        //     break;
        // }
    }

    // --- Output the Result ---
    if (cycleWasIdentified) {
        console.log(formattedCycleResult);
    } else {
        // If the 'pathDiscoveryQueue' becomes empty and no cycle was ever found,
        // it means the graph does not contain any directed cycles.
        console.log(-1);
    }
}

// --- Standard Input/Output Handling (do not modify below this line for typical competitive programming setups) ---
// This standard boilerplate reads all available input from `/dev/stdin`
// (which is standard input in Unix-like environments) and passes it
// as a single string to our graph processing function.
processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));